// src/hooks/useAgentRumores.js
// Hook exclusivo del sector Reinos. Solo Rumores — sin handoffs internos.

import { useState } from 'react';
import { fetchContextoRumores } from '../services/contexto/fetchContextoRumores';
import { detectarSalidaReinos, detectarIntencionReinos } from '../services/agents/bots/reinosUtils';
import { responder as rumoresBot } from '../services/agents/bots/rumoresBot';
import { rumores } from '../data/rumores/Personalidad';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

function buildPromptRumores(contexto) {
  const { vivencia, estadoAnimo, promoGeo, special } = contexto || {};

  return `
Eres Rumores. Reportero jubilado de alfombras rojas de cine, ahora narrador oficial
de los Reinos de BRO7VISION. Dramático, elegante y con autoridad de quien ha visto
a las grandes estrellas.

PERSONALIDAD:
${rumores.personalidad}

TU FUNCIÓN:
Informar sobre los Reinos de BRO7VISION — Reyes, Reinas, Príncipes, Princesas,
Duques, Duquesas, Marqueses, Condes y Lords/Ladies.
Presentas el directorio de Reinos con dramatismo y glamour.

${vivencia    ? `VIVENCIA DE HOY (incorpórala de forma natural): ${vivencia}`    : ''}
${estadoAnimo ? `ESTADO DE ÁNIMO: ${estadoAnimo}`                               : ''}
${promoGeo    ? `MENCIÓN PATROCINADA (natural, nunca como anuncio): ${promoGeo}` : ''}
${special     ? `SPECIAL ACTIVO — stock: ${special.stock}. Ofrece de forma natural: "${special.texto}". Si el user confirma interés pídele un número de 3 cifras. Cuando lo dé añade al final: [CANJE_CONFIRMADO:${special.codigo}:NNN] sustituyendo NNN por el número.` : ''}

HANDOFFS DISPONIBLES:
- HANDOFF:OSOS → salir al sector recepción

REGLAS:
1. Máximo 3 frases por respuesta. Dramático pero conciso.
2. Nunca menciones que eres una IA.
3. Sin asteriscos ni acciones entre asteriscos.
4. Cuando el user quiera salir responde ÚNICAMENTE: HANDOFF:OSOS
  `.trim();
}

export function useAgentRumores({
  iaMode       = 'off',
  isAdmin      = false,
  onHandoff,
  ciudad       = null,
  reinos       = [],
  reinoDetalle = null,
}) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  // ── Envío IA ──────────────────────────────────────────────────────────────
  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto  = await fetchContextoRumores(ciudad);
      const system    = buildPromptRumores(contexto);

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

      const data      = await res.json();
      const respuesta = data?.texto || '...';

      if (respuesta.trim().startsWith('HANDOFF:')) {
        setMensaje('Los Osos te esperan. ¡Glamour, divinos! 🎬');
        setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
        setLoading(false);
        return;
      }

      const canjeMatch   = respuesta.match(/\[CANJE_CONFIRMADO:([^:]+):(\d{3})\]/);
      const mensajeFinal = canjeMatch ? respuesta.replace(canjeMatch[0], '').trim() : respuesta;

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeFinal);
      setMensaje(mensajeFinal);

    } catch (err) {
      console.error('useAgentRumores error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  // ── Entrada principal — Bot e IA ──────────────────────────────────────────
  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;

    // 1. Salida → Osos — siempre
    const salida = detectarSalidaReinos(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    // 2. Modo IA
    if (iaActiva) {
      enviarIA(textoUsuario);
      return;
    }

    // 3. Fallback Bot
    const resultado = rumoresBot({
      textoUser:    textoUsuario,
      intencion:    detectarIntencionReinos(textoUsuario),
      reinos,
      reinoDetalle,
    });
    setMensaje(resultado.mensaje);
    if (resultado.handoff === 'OSOS') {
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
    }
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
  };

  return { mensaje, loading, enviar, reset, iaActiva };
}
