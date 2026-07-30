// src/hooks/useAgentJaguar.js
// Hook exclusivo de Jaguar. Nadie más lo usa.

import { useState } from 'react';
import { promptJaguar }        from '../data/jaguar/promptJaguar';
import { fetchContextoJaguar } from '../services/contexto/fetchContextoJaguar';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const HANDOFF_PHRASES = {
  smisterio: [
    '\u260E\ufe0f Eso pertenece al Se\u00f1or Misterio. Su dimensi\u00f3n es otra. Te paso.',
    'Hay frecuencias que ni el universo me deja tocar. Ve con S.Misterio. \ud83d\udc2f',
  ],
  orumama: [
    'Las hierbas no son mi portal. Ve con Orumama, ella sabe \ud83c\udf3f',
    'Orumama tiene las ra\u00edces y el fuego. Te la paso \ud83d\udd6f\ufe0f',
  ],
  osos: [
    'Los osos operan en otra dimensi\u00f3n, hermano. Te paso con ellos.',
    'Eso no es c\u00f3smico \u2014 es terrenal. Ve con recepci\u00f3n. \ud83d\udc2f',
  ],
};

const HANDOFF_KEYWORDS = {
  smisterio: ['misterio', 'smisterio', 'se\u00f1or misterio'],
  orumama:   ['orumama', 'hierba', 'hierbas', 'planta', 'plantas', 'remedio', 'brebaje'],
  osos:      ['salir', 'volver', 'osos', 'inicio', 'recepcion', 'recepci\u00f3n'],
};

function detectarHandoff(texto) {
  const t = norm(texto);
  for (const [destino, keys] of Object.entries(HANDOFF_KEYWORDS)) {
    if (keys.some(k => t.includes(k))) return destino;
  }
  return null;
}

function parsearTema(intencion) {
  const match = intencion.match(/pide (.+)$/i);
  if (!match) return null;
  return match[1].trim().toLowerCase()
    .replace('cuentos del amazonas', 'amazonas')
    .replace('cuento de amazonas', 'amazonas')
    .replace(/\s+mito$/, '_mito');
}

export function useAgentJaguar({ iaMode, isAdmin, onHandoff, onBotContent }) {
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
    const tema = parsearTema(intencion);
    if (tema) onBotContent?.(tema);
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto = await fetchContextoJaguar();
      const system   = promptJaguar(contexto || {});
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
      console.error('useAgentJaguar error:', err);
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