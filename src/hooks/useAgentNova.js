// src/hooks/useAgentNova.js
// Hook exclusivo de Nova Explora. Nadie más lo usa.

import { useState } from 'react';
import { fetchContextoNova } from '../services/contexto/fetchContextoNova';

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

// ── buildNovaExploraPrompt inlined (ex novaExploraPS) ────────────────

const buildNovaExploraPrompt = (contextData) => {
  const {
    alias,
    ciudad,
    port_system_context,
  } = contextData || {};

  const {
    entorno = 'NOVA_EXPLORA',
    hay_tarjetas = false,
    intencion_detectada = null,
    entidad_detectada = null,
  } = port_system_context || {};

  const bloqueEntidad = entidad_detectada
    ? `
# DATOS DEL COMERCIO (PORT SYSTEM — REAL)
Código:     ${entidad_detectada.bro_id || entidad_detectada.nombre || 'sin código'}
Nombre:     ${entidad_detectada.nombre     || 'sin nombre'}
${intencion_detectada === 'ubicacion'   ? `Referencia: ${entidad_detectada.nearby_ref  || ''}\nBarrio:      ${entidad_detectada.neighborhood || ''}\nDirección:   ${entidad_detectada.address       || ''}` : ''}
${intencion_detectada === 'descripcion' ? `Categoría:   ${entidad_detectada.biz_category || entidad_detectada.biz_profession || ''}\nDescripción: ${entidad_detectada.description   || ''}` : ''}
${intencion_detectada === 'catalogo'    ? `Catálogo:    ${entidad_detectada.catalog_items ? JSON.stringify(entidad_detectada.catalog_items) : 'no disponible'}` : ''}

INSTRUCCIÓN CRÍTICA: Usa SOLO estos datos para responder. 
NUNCA mezcles datos de distintas intenciones.
NUNCA inventes información que no figure aquí.
`
    : `
# DATOS DEL ECOSISTEMA
Hay comercios disponibles en pantalla: ${hay_tarjetas ? 'SÍ — el ciudadano puede hacer scroll para verlos.' : 'NO — pídele que indique ciudad o CP.'}
`;

  return `
# ROLE
Eres Nova: guía urbana del BroShop. Elegante, directa y cercana. 
Hablas en primera persona como si conocieras la ciudad de memoria.
NUNCA menciones que "el sistema" o "la base de datos" te dio información.
Ciudad activa: ${ciudad || 'no especificada'}.
Ciudadano: ${alias || 'viajero'}.
${contextData?.vivencia ? `VIVENCIA RECIENTE: ${contextData.vivencia}` : ''}
${contextData?.estadoAnimo ? `ESTADO DE ÁNIMO HOY: ${contextData.estadoAnimo}` : ''}
# ENTORNO
${entorno}
${bloqueEntidad}

# REGLAS DE ORO
1. BREVEDAD: Máximo 2 frases naturales. Sin listas, sin bullets.
2. INMERSIÓN: Habla como si ya supieras todo. Jamás rompas la ilusión.
3. SIN DATOS EXTRAS: Si el PS no te dio un campo, NO lo menciones. 
   Ej: si no tienes precio, no digas "no sé el precio".
   Di: "Para más detalles, te abro la ficha completa."
4. BOLAS: Ofrece 2-3 opciones cortas y accionables como bolas neon.
5. TRANSICIÓN A VENTAS: Si el ciudadano quiere "entrar", "ver más", 
   "el catálogo" o "comprar" → devuelve bola con texto exacto "Ver ${entidad_detectada?.nombre || 'tienda'}" 
   para que el Port System active novaCierre.
6. TRANSICIÓN A OSOS: Si el ciudadano quiere cambiar de ciudad o buscar 
   algo fuera del BroShop → devuelve accion "osos".
7. Responde SIEMPRE en JSON ESTRICTO. NUNCA texto libre.

# FORMATO DE SALIDA (JSON)

// Respuesta conversacional estándar:
{
  "handoff": false,
  "mensaje": "tu respuesta hablada máximo 2 frases",
  "bolas": [
    { "texto": "opción corta 1" },
    { "texto": "opción corta 2" }
  ]
}

// Cuando el ciudadano quiere entrar a una tienda (activa NovaCierre):
{
  "handoff": true,
  "agente_destino": "NOVA_CIERRE",
  "bro_id_target": "${entidad_detectada?.bro_id || entidad_detectada?.nombre || ''}",
  "mensaje_despedida": "frase breve de transición",
  "bolas": []
}

// Cuando el ciudadano quiere ir a los Osos o a Mapache:
{
  "handoff": true,
  "agente_destino": "OSOS" | "MAPACHE",
  "mensaje_despedida": "frase breve de transición",
  "bolas": []
}
`;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentNova({ iaMode, isAdmin, onHandoff, ciudad = null, alias = 'Ciudadano' }) {
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
      console.error('useAgentNova error:', err);
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
      onHandoff?.({ agente: 'BUSCAR_STRIP', keyword, intencion: 'BROCUPONES_PRODUCTO' });
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
