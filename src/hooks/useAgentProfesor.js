// src/hooks/useAgentProfesor.js

import { useState } from 'react';
import { promptProfesor }        from '../data/isabella_profesor/promptProfesor';
import { fetchContextoIsabella } from '../services/contexto/fetchContextoIsabella';
import { buscarNodosRelevantes } from '../services/contexto/fetchHistoriaNodos';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FRASES_FALLBACK = [
  "Paradójicamente, no he logrado descifrar su requerimiento. ¿Indagamos en Canjear Lunas, Shop Amigos o Games?",
  "Ergo... la petición no alberga suficiente claridad. ¿A qué sector deseamos conducirnos?",
  "Es decir, el mensaje llegó pero el significado se disipó. ¿Canjear Lunas, Shop Amigos, Games?",
];

const limpiarRespuesta = (texto) =>
  texto
    .replace(/BUSCAR:.*$/im, '')
    .replace(/SISTEMA:.*$/im, '')
    .trim();

export function useAgentProfesor({ iaMode, isAdmin, onHandoff, ciudad = null,
                                   onShowStoryList, onLaunchStory, storyEpisode = null }) {
  const [mensaje,      setMensaje]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [chatHistory,  setChatHistory]  = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) =>
    setChatHistory(prev => [...prev, { role, content }].slice(-6));

  const interpretarSistema = (intencion) => {
    const t = norm(intencion);
    if (t.includes('interno_isabella')) { setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'isabella' }), 1200); return; }
    if (t.includes('mostrar_lista_cuentos')) { setTimeout(() => onShowStoryList?.(), 1200); return; }
    const lanzarMatch = t.match(/lanzar_cuento[_\s:]+(\d+)/);
    if (lanzarMatch) { setTimeout(() => onLaunchStory?.(parseInt(lanzarMatch[1])), 1200); return; }
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const [contexto, nodo] = await Promise.all([
        fetchContextoIsabella(ciudad),
        buscarNodosRelevantes(textoUsuario),
      ]);
      const baseSystem = promptProfesor(contexto || {});
      let system     = storyEpisode
        ? `${baseSystem}\n\nHISTORIA EN PANTALLA:\n${storyEpisode.texto?.slice(0, 800) || ''}`
        : baseSystem;

      if (nodo)
        system += `\n\nCONTEXTO RELEVANTE (úsalo si viene al caso, no lo menciones directamente): ${nodo}`;

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, messages: chatHistory.slice(-4), userMessage: textoUsuario, iaMode }),
      });
      const data = await res.json();
      const respuestaCompleta = data?.texto || '...';

      // Interceptar comandos SISTEMA antes de mostrar nada al usuario
      interpretarSistema(respuestaCompleta);

      const mensajeLimpio = limpiarRespuesta(respuestaCompleta);

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeLimpio);
      setMensaje(mensajeLimpio);
    } catch {
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;
    const t = norm(textoUsuario);
    if (t.includes('isabella')) { setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'isabella' }), 1200); return; }
    if (t.includes('555'))      { onShowStoryList?.(); return; }
    const TRIGGER_STORIES = ['cuento', 'cuentos', 'episodio', 'episodios',
      'historia', 'historias', 'exclusiva', 'exclusivas', 'listado',
      'ver historias', 'ponme el', 'quiero escuchar'];
    if (TRIGGER_STORIES.some(kw => t.includes(kw))) {
      onShowStoryList?.();
      return;
    }
    if (iaActiva) { enviarIA(textoUsuario); return; }
    setMensaje(elegir(FRASES_FALLBACK));
  };

  const reset = () => { setMensaje(null); setChatHistory([]); };
  return { mensaje, loading, enviar, reset, iaActiva };
}