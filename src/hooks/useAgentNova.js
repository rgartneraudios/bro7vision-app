// src/hooks/useAgentNova.js
// Hook exclusivo de Nova Explora. Nadie más lo usa.

import { useState } from 'react';
import { promptNova } from '../data/nova/promptNova';
import { fetchContextoNova } from '../services/contexto/fetchContextoNova';
import { buscarNodosRelevantes } from '../services/contexto/fetchHistoriaNodos';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FRASES_SALIDA = [
  'Espera, que te paso con los Osos. 📷',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Vuelvo al almacén.',
  'Te paso con los Osos. Suerte por ahí.',
];

const limpiarRespuesta = (texto) =>
  texto
    .replace(/BUSCAR:.*$/im, '')
    .replace(/SISTEMA:.*$/im, '')
    .trim();

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
      const [contexto, nodo] = await Promise.all([
        fetchContextoNova(ciudad),
        buscarNodosRelevantes(textoUsuario),
      ]);
      if (contexto?.esPatrocinado) setEsPatrocinado(true);

      const baseSystem = promptNova(contexto || {});
      let system     = storyEpisode
        ? `${baseSystem}\n\nHISTORIA EN PANTALLA:\n${storyEpisode.texto?.slice(0, 800) || ''}`
        : baseSystem;

      if (nodo)
        system += `\n\nCONTEXTO RELEVANTE (úsalo si viene al caso, no lo menciones directamente): ${nodo}`;

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
      const respuestaCompleta = data?.texto || '...';

      // Interceptar comandos SISTEMA antes de mostrar nada al usuario
      interpretarSistema(respuestaCompleta);

      const mensajeLimpio = limpiarRespuesta(respuestaCompleta);

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeLimpio);
      setMensaje(mensajeLimpio);

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

    const TRIGGER_STORIES = ['cuento', 'cuentos', 'episodio', 'episodios',
      'historia', 'historias', 'exclusiva', 'exclusivas', 'listado',
      'ver historias', 'ponme el', 'quiero escuchar'];
    const tNorm = textoUsuario.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (TRIGGER_STORIES.some(kw => tNorm.includes(kw))) {
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
