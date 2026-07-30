// src/hooks/useAgentOrumama.js
// Hook exclusivo de Orumama. Nadie más lo usa.

import { useState } from 'react';
import { promptOrumama }        from '../data/orumama/promptOrumama';
import { fetchContextoOrumama } from '../services/contexto/fetchContextoOrumama';

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

export function useAgentOrumama({ iaMode, isAdmin, onHandoff, onBotContent }) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const interpretarSistema = (intencion) => {
    const t = norm(intencion);
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
      const contexto = await fetchContextoOrumama();
      const system   = promptOrumama(contexto || {});
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

      const lineaSistema = respuestaCompleta.split('\n').find(l => l.trim().startsWith('SISTEMA:'));
      const mensajeUser  = respuestaCompleta.replace(lineaSistema || '', '').replace(/\*\*/g, '').trim();
      const intencion    = lineaSistema ? lineaSistema.replace('SISTEMA:', '').trim() : 'CONTINUA';

      if (intencion && intencion !== 'CONTINUA') interpretarSistema(intencion);

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeUser);
      setMensaje(mensajeUser);
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

    if (iaActiva) { enviarIA(textoUsuario); return; }
  };

  const reset = () => { setMensaje(null); setChatHistory([]); };

  return { mensaje, loading, enviar, reset, iaActiva };
}