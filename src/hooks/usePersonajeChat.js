// src/hooks/usePersonajeChat.js
// Fontanería compartida para todos los personajes en modo IA.
// Recibe una función de prompt y un handler del sistema.

import { useState } from 'react';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

export function usePersonajeChat({ promptFn, onSistema, iaMode, isAdmin }) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const enviar = async (textoUsuario) => {
    if (!textoUsuario?.trim() || !iaActiva) return;
    setLoading(true);

    try {
      const system = promptFn();

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
      console.log('Respuesta completa Mistral:', respuestaCompleta);
      // ── Separar mensaje usuario de reporte Canal 0 ──────────────────
      const lineaSistema = respuestaCompleta.split('\n').find(l => l.startsWith('SISTEMA:'));
      console.log('Línea SISTEMA detectada:', lineaSistema);
      const mensajeUser  = respuestaCompleta.replace(lineaSistema || '', '').trim();
      const intencion    = lineaSistema ? lineaSistema.replace('SISTEMA:', '').trim() : 'CONTINUA';

      // ── Canal 0 ─────────────────────────────────────────────────────
      if (intencion && intencion !== 'CONTINUA') {
        onSistema?.(intencion);
      }

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeUser);
      setMensaje(mensajeUser);

    } catch (err) {
      console.error('usePersonajeChat error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
  };

  return { mensaje, loading, enviar, reset, iaActiva };
}
