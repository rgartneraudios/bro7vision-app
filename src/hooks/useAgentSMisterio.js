// src/hooks/useAgentSMisterio.js
// Hook exclusivo del Señor Misterio. Nadie más lo usa.

import { useState } from 'react';
import { promptSmisterio }        from '../data/smisterio/promptSmisterio';
import { fetchContextoSMisterio } from '../services/contexto/fetchContextoSMisterio';
import { fetchHistoriaNodos } from '../services/contexto/fetchHistoriaNodos';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const HANDOFF_PHRASES = {
  jaguar: [
    'Los astros son territorio de Jaguar. Te paso. \u260e\ufe0f',
    'Jaguar acecha en las estrellas. Te lo paso \ud83d\udc2f',
  ],
  orumama: [
    'Orumama conoce los remedios y el fuego sagrado. Te la paso \ud83d\udd6f\ufe0f',
    'Las ra\u00edces saben m\u00e1s que las sombras en esto. Ve con Orumama.',
  ],
  osos: [
    '\u260e\ufe0f Corto comunicaci\u00f3n. Los osos te esperan en la superficie.',
    'Mi yogur de higos me espera. Tu camino sigue en recepci\u00f3n. Adi\u00f3s.',
  ],
};

const HANDOFF_KEYWORDS = {
  jaguar:  ['jaguar', 'el jaguar'],
  orumama: ['orumama', 'la orumama'],
  osos:    ['salir', 'volver', 'osos', 'inicio', 'recepcion', 'recepci\u00f3n'],
};

function detectarHandoff(texto) {
  const t = norm(texto);
  for (const [destino, keys] of Object.entries(HANDOFF_KEYWORDS)) {
    if (keys.some(k => t.includes(k))) return destino;
  }
  return null;
}

export function useAgentSMisterio({ iaMode, isAdmin, onHandoff, onBotContent, onShowStoryList, onLaunchStory }) {
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
      const contexto = await fetchContextoSMisterio();
      const system   = promptSmisterio({
        ...contexto || {},
        storyContext: storyContext
          ? `\nHISTORIA EN CURSO — el usuario está leyendo/escuchando:\nTítulo: ${storyContext.titulo}\n${(storyContext.texto || '').slice(0, 800)}...\nSi pregunta sobre ella, responde en personaje usando este contenido.`
          : null,
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
      console.error('useAgentSMisterio error:', err);
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

    if (iaActiva) { enviarIA(textoUsuario); return; }
  };

  const reset = () => { setMensaje(null); setChatHistory([]); };

  return { mensaje, loading, enviar, reset, iaActiva, setStoryContext };
}