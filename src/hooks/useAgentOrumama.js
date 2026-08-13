// src/hooks/useAgentOrumama.js
// Hook exclusivo de Orumama. Nadie más lo usa.

import { useState } from 'react';
import { promptOrumama }        from '../data/orumama/promptOrumama';
import { fetchContextoOrumama } from '../services/contexto/fetchContextoOrumama';
import { buscarNodosRelevantes } from '../services/contexto/fetchHistoriaNodos';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const HANDOFF_PHRASES = {
  jaguar: [
    'El hor\u00f3scopo es territorio de Jaguar, hijos m\u00edos. Te paso con \u00e9l \ud83d\udc2f',
    'Jaguar escucha m\u00e1s all\u00e1 de las estrellas. Te lo paso.',
  ],
  smisterio: [
    'El Se\u00f1or Misterio est\u00e1 en otro plano \u260e\ufe0f Te lo paso.',
    'Hay misterios que van m\u00e1s all\u00e1 de mis brebajes. S.Misterio te espera.',
  ],
  osos: [
    'Los osos te esperan. Yo vuelvo a mis velas \ud83d\udd6f\ufe0f',
    'Te mando con quienes saben de eso. Que las hierbas te acompa\u00f1en.',
  ],
};

const HANDOFF_KEYWORDS = {
  jaguar:    ['jaguar', 'horoscopo', 'hor\u00f3scopo', 'signo', 'astro', 'luna', 'lunar'],
  smisterio: ['misterio', 'smisterio'],
  osos:      ['salir', 'volver', 'osos', 'inicio', 'recepcion', 'recepci\u00f3n'],
};

function detectarHandoff(texto) {
  const t = norm(texto);
  for (const [destino, keys] of Object.entries(HANDOFF_KEYWORDS)) {
    if (keys.some(k => t.includes(k))) return destino;
  }
  return null;
}

const limpiarRespuesta = (texto) =>
  texto
    .replace(/BUSCAR:.*$/im, '')
    .replace(/SISTEMA:.*$/im, '')
    .trim();

export function useAgentOrumama({ iaMode, isAdmin, onHandoff, onBotContent, onShowStoryList, onLaunchStory }) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [storyContext, setStoryContext] = useState(null);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const interpretarSistema = (intencion) => {
    const t = norm(intencion);

    // Lista de cuentos
    if (t.includes('mostrar_lista_cuentos')) {
      onShowStoryList?.();
      return;
    }
    // Lanzar cuento específico
    const matchCuento = intencion.match(/lanzar_cuento_(\d+)/i);
    if (matchCuento) {
      onLaunchStory?.(parseInt(matchCuento[1]));
      return;
    }

    for (const [destino, keys] of Object.entries(HANDOFF_KEYWORDS)) {
      if (keys.some(k => t.includes(k))) {
        setTimeout(() => onHandoff?.(destino), 2500);
        return;
      }
    }
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const [contexto, nodo] = await Promise.all([
        fetchContextoOrumama(),
        buscarNodosRelevantes(textoUsuario),
      ]);
      let system   = promptOrumama({
        ...contexto || {},
        storyContext: storyContext
          ? `\nHISTORIA EN CURSO — el usuario está leyendo/escuchando:\nTítulo: ${storyContext.titulo}\n${(storyContext.texto || '').slice(0, 800)}...\nSi pregunta sobre ella, responde en personaje usando este contenido.`
          : null,
      });

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
      console.error('useAgentOrumama error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;

    const destino = detectarHandoff(textoUsuario);
    if (destino) {
      setMensaje(elegir(HANDOFF_PHRASES[destino]));
      setTimeout(() => onHandoff?.(destino), 2500);
      return;
    }

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

    if (iaActiva) { enviarIA(textoUsuario); return; }
  };

  const reset = () => { setMensaje(null); setChatHistory([]); };

  return { mensaje, loading, enviar, reset, iaActiva, setStoryContext };
}