// src/hooks/useOrumamaChat.js
// Hook exclusivo de Orumama. Nadie más lo usa.

import { useState, useRef } from 'react';
import { promptOrumama } from '../data/orumama/promptOrumama';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

const HISTORIA_KEYWORDS_ORUMAMA = {
  // hierbas individuales
  manzanilla: ['manzanilla'],
  lavanda:    ['lavanda'],
  jengibre:   ['jengibre'],
  romero:     ['romero'],
  menta:      ['menta'],
  oregano:    ['oregano', 'orégano'],
  tomillo:    ['tomillo'],
  albahaca:   ['albahaca'],
  melisa:     ['melisa'],
  salvia:     ['salvia'],
  ruda:       ['ruda'],
  romaza:     ['romaza'],
  // recetario y general
  recetario:  ['recetario'],
  hierbas:    ['hierba', 'hierbas', 'planta', 'plantas', 'remedio', 'remedios', 'natural'],
  guisos:     ['guiso', 'guisos', 'cocina', 'receta', 'recetas', 'olla'],
};

const HANDOFF_KEYWORDS_ORUMAMA = {
  jaguar:    ['jaguar', 'horoscopo', 'horóscopo', 'signo', 'astro', 'luna', 'lunar'],
  smisterio: ['misterio', 'smisterio'],
  osos:      ['salir', 'volver', 'osos', 'inicio', 'recepción', 'recepcion'],
};

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function detectarTema(texto) {
  const t = norm(texto);
  for (const [tema, keys] of Object.entries(HISTORIA_KEYWORDS_ORUMAMA)) {
    if (keys.some(k => t.includes(norm(k)))) return tema;
  }
  return null;
}

function detectarHandoff(texto) {
  const t = norm(texto);
  for (const [destino, keys] of Object.entries(HANDOFF_KEYWORDS_ORUMAMA)) {
    if (keys.some(k => t.includes(k))) return destino;
  }
  return null;
}

export function useOrumamaChat({ iaMode, isAdmin, onBotContent, onHandoff }) {
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
  const interpretarSistema = (intencion) => {
    const t = norm(intencion);

    // Handoff
    for (const [destino, keys] of Object.entries(HANDOFF_KEYWORDS_ORUMAMA)) {
      if (keys.some(k => t.includes(k))) {
        setTimeout(() => onHandoff?.(destino), 2500);
        return;
      }
    }

    // Contenido
    for (const [tema, keys] of Object.entries(HISTORIA_KEYWORDS_ORUMAMA)) {
      if (keys.some(k => t.includes(norm(k)))) {
        if (tema === 'recetario') {
          const yaContadas = historiasContadasRef.current['recetario'] || 0;
          const saga = ['recetario_1', 'recetario_2'];
          const temaResuelto = saga[Math.min(yaContadas, saga.length - 1)];
          historiasContadasRef.current = { ...historiasContadasRef.current, recetario: yaContadas + 1 };
          onBotContent?.(temaResuelto);
        } else {
          onBotContent?.(tema);
        }
        return;
      }
    }
  };

  // ── Envío IA ──────────────────────────────────────────────────────────────
  const enviarIA = async (textoUsuario) => {
    if (!textoUsuario?.trim()) return;
    setLoading(true);
    try {
      const system = promptOrumama();
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
        interpretarSistema(intencion);
      }

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeUser);
      setMensaje(mensajeUser);

    } catch (err) {
      console.error('useOrumamaChat error:', err);
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

    // 2. CONFIRMO + tema en espera
    if (t.includes('confirmo') && temaEnEspera) {
      onBotContent?.(temaEnEspera);
      setTemaEnEspera(null);
      return;
    }

    // 3. Detectar tema
    const tema = detectarTema(textoUsuario);
    if (tema) {
      if (iaActiva) {
        enviarIA(textoUsuario);
      } else {
        // Modo Bot — hierbas individuales → hierbas.js, recetario → guisos.js
        const esHierbaIndividual = ['manzanilla','lavanda','jengibre','romero','menta',
          'oregano','tomillo','albahaca','melisa','salvia','ruda','romaza'].includes(tema);
        if (esHierbaIndividual) {
          setCurrentMsg?.('Las hierbas individuales me las reservo para el modo IA hija mía 🌿 Por ahora escribe Hierbas y te abro el recetario completo.');
          return;
        }
        if (tema === 'recetario') {
          onBotContent?.('guisos');
          return;
        }
        // hierbas y guisos → CONFIRMO normal
        if (FRASES_CONFIRMO?.[tema]) {
          setTemaEnEspera(tema);
          setCurrentMsg?.(FRASES_CONFIRMO[tema]);
        }
      }
      return;
    }

    // 4. Modo IA → conversar
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
