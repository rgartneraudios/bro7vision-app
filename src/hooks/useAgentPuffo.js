// src/hooks/useAgentPuffo.js
// Hook exclusivo de Puffo. Nadie más lo usa.

import { useState } from 'react';
import { promptPuffo }       from '../data/Grupo Osos/puffo/promptPuffo';
import { fetchContextoPuffo } from '../services/contexto/fetchContextoPuffo';
import { buscarNodosRelevantes } from '../services/contexto/fetchHistoriaNodos';


const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FRASES_FALLBACK = [
  "Ajá... no te sigo del todo. ¿buscas Canjear Lunas, Shop Amigos, Games? Dame el titular.",
  "Interesante... pero necesito más contexto. ¿A qué sector quieres ir?",
  "Te corto un segundo ahí. ¿buscas Canjear Lunas, Shop Amigos, Games? Eso primero.",
];

const limpiarRespuesta = (texto) =>
  texto
    .replace(/BUSCAR:.*$/im, '')
    .replace(/SISTEMA:.*$/im, '')
    .trim();

export function useAgentPuffo({ iaMode, isAdmin, onHandoff, ciudad = null,
                                onShowStoryList, onLaunchStory, storyEpisode = null }) {
  const [mensaje, setMensaje]             = useState(null);
  const [loading, setLoading]             = useState(false);
  const [chatHistory, setChatHistory]     = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const interpretarSistema = (intencion) => {
    const t = norm(intencion);
    if (t.includes('tito')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'tito' }), 2500); return; }
    if (t.includes('lara')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'lara' }), 2500); return; }
    if (t.includes('mostrar_lista_cuentos')) {
      setTimeout(() => onShowStoryList?.(), 1200);
      return;
    }
    const lanzarMatch = t.match(/lanzar_cuento[_\s:]+(\d+)/);
    if (lanzarMatch) {
      setTimeout(() => onLaunchStory?.(parseInt(lanzarMatch[1])), 1200);
      return;
    }
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const [contexto, nodo] = await Promise.all([
        fetchContextoPuffo(ciudad),
        buscarNodosRelevantes(textoUsuario),
      ]);
      const baseSystem  = promptPuffo(contexto || {});
      let system      = storyEpisode
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

      if (mensajeLimpio.trim().startsWith('HANDOFF:')) {
        const partes  = mensajeLimpio.replace('HANDOFF:', '').trim().split(':');
        const agente  = partes[0];
        const detalle = partes[1] || null;
        onHandoff?.({
          agente,
          ciudad,
          ...(detalle && agente === 'OSOS_INTERNO' && { oso_id: detalle }),
          ...(detalle && agente !== 'OSOS_INTERNO' && { ciudad: detalle }),
        });
        setLoading(false);
        return;
      }

      const canjeMatch   = mensajeLimpio.match(/\[CANJE_CONFIRMADO:([^:]+):(\d{3})\]/);
      const mensajeFinal = canjeMatch ? mensajeLimpio.replace(canjeMatch[0], '').trim() : mensajeLimpio;

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeFinal);
      setMensaje(mensajeFinal);
    } catch (err) {
      console.error('useAgentPuffo error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;
    const t = norm(textoUsuario);

    // 1. Handoff interno
    if (t.includes('tito')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'tito' }), 1200); return; }
    if (t.includes('lara')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'lara' }), 1200); return; }

    // 2. 555 → mostrar lista de cuentos (intercepción directa, sin pasar por IA)
    if (t.includes('555')) {
      onShowStoryList?.();
      return;
    }

    const TRIGGER_STORIES = ['cuento', 'cuentos', 'episodio', 'episodios',
      'historia', 'historias', 'exclusiva', 'exclusivas', 'listado',
      'ver historias', 'ponme el', 'quiero escuchar'];
    if (TRIGGER_STORIES.some(kw => t.includes(kw))) {
      onShowStoryList?.();
      return;
    }

    // 3. Modo IA
    if (iaActiva) { enviarIA(textoUsuario); return; }

    // 4. Fallback Bot
    setMensaje(elegir(FRASES_FALLBACK));
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
  };

  return { mensaje, loading, enviar, reset, iaActiva };
}
