// src/hooks/useAgentNovaExplora.js
// Hook exclusivo de Nova Explora. Nadie más lo usa.

import { useState } from 'react';
import { buildNovaExploraPrompt } from '../services/agents/novaExploraPS';
import { fetchContextoNova }      from '../services/contexto/fetchContextoNova';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FRASES_SALIDA = [
  'Espera, que te paso con los Osos. 📷',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Vuelvo al almacén.',
  'Te paso con los Osos. Suerte por ahí.',
];

// ── novaUtils inlined ─────────────────────────────────────────────────────────

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const KEYWORDS_SALIDA_NOVA = [
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  'servicio', 'servicios', 'isabella', 'profesor', 'prmaestro',
  'aviso', 'avisos', 'anuncio', 'anuncios', 'evelyn', 'larry',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'reinos', 'reino', 'rumores',
  'juego', 'juegos', 'games',
];

const INTENT_KEYWORDS_NOVA = {
  precio:      ['precio', 'cuánto', 'cuanto', 'cuesta', 'vale', 'coste', 'costo', 'tarifa'],
  ubicacion:   ['dónde', 'donde', 'ubicación', 'ubicacion', 'dirección', 'direccion', 'llegar', 'sitio', 'lugar'],
  catalogo:    ['catálogo', 'catalogo', 'productos', 'stock', 'qué tiene', 'que tiene', 'qué hay', 'que hay', 'inventario'],
  contacto:    ['contacto', 'teléfono', 'telefono', 'whatsapp', 'horario', 'email', 'correo'],
  descripcion: ['qué es', 'que es', 'cuéntame', 'cuentame', 'info', 'descripción', 'descripcion', 'detalles'],
};

const detectarSalidaNova = (texto) => {
  const t = norm(texto);
  return KEYWORDS_SALIDA_NOVA.some(kw => t.includes(norm(kw))) ? { salida: true } : null;
};

const detectarIntencionNova = (texto) => {
  const t = norm(texto);
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS_NOVA)) {
    if (keywords.some(kw => t.includes(norm(kw)))) return intent;
  }
  return 'explorar';
};

// ── novaBot inlined (solo lo necesario) ──────────────────────────────────────

const FRASES_BUSCANDO = [
  '¡Uy, qué buena elección! Déjame buscar eso en el almacén ahora mismo ✨',
  'Mmm, eso suena genial. Voy a ver qué tengo por aquí para ti 🔍',
  '¡Perfecto! Buscando en el almacén... ya te traigo lo mejor que hay 📦',
  'Eso me encanta. Un momento que lo busco con mucho cuidado 🌟',
];

function detectarBusquedaProducto(texto) {
  const t = texto.toLowerCase().trim();
  const prefijos = [
    /^busco\s+(.+)/, /^quiero\s+(.+)/, /^necesito\s+(.+)/,
    /^tienes\s+(.+)/, /^hay\s+(.+)/, /^buscar\s+(.+)/,
    /^encuentra\s+(.+)/, /^muéstrame\s+(.+)/, /^muestrame\s+(.+)/, /^ver\s+(.+)/,
  ];
  for (const regex of prefijos) {
    const match = t.match(regex);
    if (match) return match[1].trim();
  }
  const esHandoff = /volver|salir|osos|atrás|atras/i.test(t);
  const esSaludo  = /^(hola|hey|buenas|ey|hi|buenos días|buenos dias|qué tal|que tal)/.test(t);
  const esComando = /precio|dónde|donde|catálogo|catalogo|contacto|qué es|que es|cuéntame|info/i.test(t);
  if (!esHandoff && !esSaludo && !esComando && t.split(' ').length <= 4) return t;
  return null;
}

function fraseBuscando() {
  return elegir(FRASES_BUSCANDO);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentNovaExplora({ iaMode, isAdmin, onHandoff, ciudad = null, alias = 'Ciudadano' }) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [esPatrocinado, setEsPatrocinado] = useState(false);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const enviarIA = async (textoUsuario, contextExtra = {}) => {
    setLoading(true);
    try {
      const contexto = await fetchContextoNova(ciudad);
      if (contexto?.esPatrocinado) setEsPatrocinado(true);

      const system = buildNovaExploraPrompt({
        alias,
        ciudad,
        vivencia:    contexto?.vivencia,
        estadoAnimo: contexto?.estadoAnimo,
        port_system_context: {
          hay_tarjetas:        contextExtra?.hayTarjetas || false,
          intencion_detectada: detectarIntencionNova(textoUsuario),
          entidad_detectada:   contextExtra?.entidad || null,
        },
      });

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system,
          messages:    chatHistory.slice(-4),
          userMessage: textoUsuario,
          iaMode,
        }),
      });

      const data = await res.json();
      const rawText = data?.texto || '{}';

      try {
        const match  = rawText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('No JSON');
        const parsed = JSON.parse(match[0]);

        if (parsed.handoff && parsed.agente_destino) {
          setMensaje(parsed.mensaje_despedida || '...');
          setTimeout(() => onHandoff?.({
            agente:  parsed.agente_destino,
            bro_id:  parsed.bro_id_target || null,
          }), 1200);
          setLoading(false);
          return;
        }

        pushHistory('user', textoUsuario);
        pushHistory('assistant', parsed.mensaje || '...');
        setMensaje(parsed.mensaje || '...');
      } catch {
        pushHistory('user', textoUsuario);
        pushHistory('assistant', rawText);
        setMensaje(rawText);
      }

    } catch (err) {
      console.error('useAgentNovaExplora error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario, contextExtra = {}) => {
    if (!textoUsuario?.trim()) return;

    const salida = detectarSalidaNova(textoUsuario);
    if (salida) {
      setMensaje(elegir(FRASES_SALIDA));
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    if (iaActiva) {
      enviarIA(textoUsuario, contextExtra);
      return;
    }

    const keyword = detectarBusquedaProducto(textoUsuario);
    if (keyword) {
      setMensaje(fraseBuscando());
      onHandoff?.({ agente: 'BUSCAR_STRIP', keyword, intencion: 'BROSHOP_PRODUCTO' });
      return;
    }

    setMensaje('Dime qué producto buscas y te encuentro lo mejor del almacén 📦');
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setEsPatrocinado(false);
  };

  return { mensaje, loading, enviar, reset, iaActiva, esPatrocinado };
}
