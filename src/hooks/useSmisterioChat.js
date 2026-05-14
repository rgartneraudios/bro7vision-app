// src/hooks/useSmisterioChat.js
// Hook exclusivo del Señor Misterio. Nadie más lo usa.

import { useState, useRef } from 'react';
import { promptSmisterio } from '../data/smisterio/promptSmisterio';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

const HISTORIA_KEYWORDS_SMISTERIO = {
  antartida: ['antartida', 'antártida', 'polo sur', 'highjump'],
  egipto:    ['egipto', 'pirámide', 'piramide', 'faraón', 'faraon'],
  bucegi:    ['bucegi', 'rumanía', 'rumania'],
  tartaria:  ['tartaria', 'imperio perdido', 'barroco'],
};

const HANDOFF_KEYWORDS_SMISTERIO = {
  jaguar:  ['jaguar', 'el jaguar'],
  orumama: ['orumama', 'la orumama'],
  osos:    ['salir', 'volver', 'osos', 'inicio', 'recepción', 'recepcion'],
};

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function detectarTema(texto) {
  const t = norm(texto);
  for (const [tema, keys] of Object.entries(HISTORIA_KEYWORDS_SMISTERIO)) {
    if (keys.some(k => t.includes(norm(k)))) return tema;
  }
  return null;
}

function detectarHandoff(texto) {
  const t = norm(texto);
  for (const [destino, keys] of Object.entries(HANDOFF_KEYWORDS_SMISTERIO)) {
    if (keys.some(k => t.includes(k))) return destino;
  }
  return null;
}

export function useSmisterioChat({ iaMode, isAdmin, onBotContent, onBotContentIA, onHandoff }) {
  const [mensaje, setMensaje]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [chatHistory, setChatHistory]   = useState([]);
  const [temaEnEspera, setTemaEnEspera] = useState(null);
  const historiasContadasRef             = useRef({});

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  // ── Interpreta línea SISTEMA: que reporta la IA ──────────────────────────
  // skipContent=true cuando el episodio ya fue disparado por keyword del usuario
  const interpretarSistema = (intencion, skipContent = false) => {
    const t = norm(intencion);

    // Handoff — siempre, independiente de skipContent
    for (const [destino, keys] of Object.entries(HANDOFF_KEYWORDS_SMISTERIO)) {
      if (keys.some(k => t.includes(k))) {
        setTimeout(() => onHandoff?.(destino), 2500);
        return;
      }
    }

    if (skipContent) return;

    // Contenido IA — episodios secuenciales (solo cuando la IA lo propone free-form)
    for (const [tema, keys] of Object.entries(HISTORIA_KEYWORDS_SMISTERIO)) {
      if (keys.some(k => t.includes(norm(k)))) {
        const yaContadas = historiasContadasRef.current[tema] || 0;
        historiasContadasRef.current = {
          ...historiasContadasRef.current,
          [tema]: yaContadas + 1,
        };
        onBotContentIA?.(tema, yaContadas);
        return;
      }
    }
  };

  // ── Envío IA ──────────────────────────────────────────────────────────────
  const enviarIA = async (textoUsuario, skipContentTrigger = false) => {
    if (!textoUsuario?.trim()) return;
    setLoading(true);
    try {
      const system = promptSmisterio();
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

      const lineaSistema = respuestaCompleta
        .split('\n')
        .find(l => l.trim().startsWith('SISTEMA:'));

      const mensajeUser = respuestaCompleta
        .replace(lineaSistema || '', '')
        .replace(/\*\*/g, '')
        .trim();

      const intencion = lineaSistema
        ? lineaSistema.replace('SISTEMA:', '').trim()
        : 'CONTINUA';

      if (intencion && intencion !== 'CONTINUA') {
        interpretarSistema(intencion, skipContentTrigger);
      }

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeUser);
      setMensaje(mensajeUser);

    } catch (err) {
      console.error('useSmisterioChat error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  // ── Entrada principal — Bot e IA ──────────────────────────────────────────
  const enviar = (textoUsuario, { FRASES_CONFIRMO, FRASES_HANDOFF, setCurrentMsg, elegir } = {}) => {
    if (!textoUsuario?.trim()) return;
    const t = norm(textoUsuario);

    // 1. Handoff — siempre, Bot e IA
    const destino = detectarHandoff(textoUsuario);
    if (destino) {
      setCurrentMsg?.(elegir?.(FRASES_HANDOFF?.[destino]) || '...');
      setTimeout(() => onHandoff?.(destino), 2500);
      return;
    }

    // 2. CONFIRMO + tema en espera — solo modo Bot
    if (t.includes('confirmo') && temaEnEspera && !iaActiva) {
      onBotContent?.(temaEnEspera);
      setTemaEnEspera(null);
      return;
    }

    // 3. Detectar tema
    const tema = detectarTema(textoUsuario);
    if (tema) {
      if (iaActiva) {
        // Disparar episodio de inmediato desde el keyword del usuario
        const yaContadas = historiasContadasRef.current[tema] || 0;
        historiasContadasRef.current = { ...historiasContadasRef.current, [tema]: yaContadas + 1 };
        onBotContentIA?.(tema, yaContadas);
        // IA conversa — SISTEMA solo procesará handoffs, no episodios
        enviarIA(textoUsuario, true);
      } else {
        // Modo Bot → CONFIRMO con acordeón .bot
        if (FRASES_CONFIRMO?.[tema]) {
          setTemaEnEspera(tema);
          setCurrentMsg?.(FRASES_CONFIRMO[tema]);
        }
      }
      return;
    }

    // 4. Modo IA → conversar libremente
    if (iaActiva) {
      enviarIA(textoUsuario);
      return;
    }

    // 5. Fallback Bot — el Banner maneja el fallback
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setTemaEnEspera(null);
    historiasContadasRef.current = {};
  };

  return { mensaje, loading, enviar, reset, iaActiva, temaEnEspera };
}
