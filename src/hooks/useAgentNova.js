// src/hooks/useAgentNova.js
// Hook exclusivo de Nova Explora. Nadie más lo usa.

import { useState } from 'react';
import { promptNova } from '../data/nova/promptNova';
import { fetchContextoNova } from '../services/contexto/fetchContextoNova';
import { fetchHistoriaNodos } from '../services/contexto/fetchHistoriaNodos';

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
   'rumores',
  'juego', 'juegos', 'games',
];

const detectarSalidaNova = (texto) => {
  const t = norm(texto);
  return KEYWORDS_SALIDA_NOVA.some(kw => t.includes(norm(kw))) ? { salida: true } : null;
};

// ── novaBot inlined (solo lo necesario) ──────────────────────────────────────

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentNova({ iaMode, isAdmin, onHandoff, ciudad = null, alias = 'Ciudadano',
                               onShowStoryList, onLaunchStory, storyEpisode = null }) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [esPatrocinado, setEsPatrocinado] = useState(false);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const interpretarSistema = (intencion) => {
    const t = norm(intencion);

    if (t.includes('mostrar_lista_cuentos')) {
      setTimeout(() => onShowStoryList?.(), 1200);
      return;
    }
    const lanzarMatch = intencion.match(/lanzar_cuento[_\s:]+(\d+)/i);
    if (lanzarMatch) {
      setTimeout(() => onLaunchStory?.(parseInt(lanzarMatch[1])), 1200);
      return;
    }
  };

  const enviarIA = async (textoUsuario, contextExtra = {}) => {
    setLoading(true);
    try {
      const contexto   = await fetchContextoNova(ciudad);
      if (contexto?.esPatrocinado) setEsPatrocinado(true);

      const baseSystem = promptNova(contexto || {});
      const system     = storyEpisode
        ? `${baseSystem}\n\nHISTORIA EN PANTALLA:\n${storyEpisode.texto?.slice(0, 800) || ''}`
        : baseSystem;

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
      let respuestaCompleta = data?.texto || '...';

      if (respuestaCompleta.startsWith('BUSCAR:')) {
        const terminos = respuestaCompleta.replace('BUSCAR:', '').split(',').map(t => t.trim());
        const nodo = await fetchHistoriaNodos(terminos);
        const contextoBuscado = nodo
          ? `[MEMORIA RECUPERADA: ${nodo}]`
          : '[No encontré información en la memoria. Responde con naturalidad sin inventar.]';
        const segundaRes = await fetch(WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system,
            messages: [...chatHistory.slice(-4), { role: 'user', content: textoUsuario }],
            userMessage: contextoBuscado,
            iaMode,
          }),
        });
        const segundaData = await segundaRes.json();
        respuestaCompleta = segundaData?.texto || '...';
      }

      const lineaSistema = respuestaCompleta.split('\n').find(l => l.trim().startsWith('SISTEMA:'));
      const mensajeUser  = respuestaCompleta.replace(lineaSistema || '', '').replace(/\*\*/g, '').trim();
      const intencion    = lineaSistema ? lineaSistema.replace('SISTEMA:', '').trim() : 'CONTINUA';

      if (intencion && intencion !== 'CONTINUA') interpretarSistema(intencion);

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeUser);
      setMensaje(mensajeUser);

    } catch (err) {
      console.error('useAgentNova error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario, contextExtra = {}) => {
    if (!textoUsuario?.trim()) return;

    if (textoUsuario.trim() === '555') {
      onShowStoryList?.();
      return;
    }

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

    setMensaje('Cuéntame qué buscas y te ayudo a encontrarlo con mucho cariño ✨');
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setEsPatrocinado(false);
  };

  return { mensaje, loading, enviar, reset, iaActiva, esPatrocinado };
}
