import { useState } from 'react';
import { promptRumores } from '../data/rumores/promptRumores';
import { fetchContextoRumores } from '../services/contexto/fetchContextoRumores';
import { buscarNodosRelevantes } from '../services/contexto/fetchHistoriaNodos';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

const limpiarRespuesta = (texto) =>
  texto.replace(/SISTEMA:.*$/im, '').trim();

export function useAgentRumores({
  iaMode       = 'off',
  isAdmin      = false,
  onHandoff,
  ciudad       = null,
  onShowStoryList,
  onLaunchStory,
  storyEpisode = null,
}) {
  const [mensaje,      setMensaje]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [chatHistory,  setChatHistory]  = useState([]);
  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
  const pushHistory = (role, content) =>
    setChatHistory(prev => [...prev, { role, content }].slice(-6));

  const interpretarSistema = (intencion) => {
    const t = intencion.toLowerCase();
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

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const [contexto, nodo] = await Promise.all([
        fetchContextoRumores(ciudad),
        buscarNodosRelevantes(textoUsuario),
      ]);

      const baseSystem = promptRumores(contexto || {});
      let system = storyEpisode
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

      const data     = await res.json();
      const respuesta = data?.texto || '...';

      interpretarSistema(respuesta);
      const mensajeLimpio = limpiarRespuesta(respuesta);

      if (mensajeLimpio.startsWith('HANDOFF:')) {
        setMensaje('Los Osos te esperan. ¡Glamour, divinos! 🎬');
        setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
        setLoading(false);
        return;
      }

      const canjeMatch   = mensajeLimpio.match(/\[CANJE_CONFIRMADO:([^:]+):(\d{3})\]/);
      const mensajeFinal = canjeMatch
        ? mensajeLimpio.replace(canjeMatch[0], '').trim()
        : mensajeLimpio;

      pushHistory('user',      textoUsuario);
      pushHistory('assistant', mensajeFinal);
      setMensaje(mensajeFinal);

    } catch (err) {
      console.error('useAgentRumores error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;
    if (textoUsuario.trim() === '555') { onShowStoryList?.(); return; }
    const TRIGGER_STORIES = ['cuento', 'cuentos', 'episodio', 'episodios',
      'historia', 'historias', 'exclusiva', 'exclusivas', 'listado',
      'ver historias', 'ponme el', 'quiero escuchar'];
    const tNorm = textoUsuario.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (TRIGGER_STORIES.some(kw => tNorm.includes(kw))) {
      onShowStoryList?.();
      return;
    }
    if (iaActiva) { enviarIA(textoUsuario); return; }
    setMensaje('Activa el Prepago IA para charlar conmigo. ¡Glamour, divinos! 🎬');
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
  };

  return { mensaje, loading, enviar, reset, iaActiva };
}