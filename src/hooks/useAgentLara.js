// src/hooks/useAgentLara.js
// Hook exclusivo de Lara. Nadie más lo usa.

import { useState } from 'react';
import { promptLara }        from '../data/lara/promptLara';
import { fetchContextoLara } from '../services/contexto/fetchContextoLara';
import { detectarSectorPS, detectarCiudadPS } from '../services/agents/ososPS';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const SECTORES_SIN_CIUDAD = ['BRO7BAND', 'REINOS', 'GAMES'];
const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FRASES_BIENVENIDA = [
  "Hola, soy Lara 🐻 Fluye conmigo — ¿a dónde te llevo hoy?",
  "Lara aquí. Dime qué buscas y te oriento con consciencia.",
  "¡Buenas! ¿Productos, servicios, música o avisos? Tú dime, total.",
  "Aquí Lara 🌿 Mi energía me dice que buscas algo concreto… cuéntame.",
];
const FRASES_PEDIR_CIUDAD = [
  "¿En qué ciudad buscas? Así te conecto con lo que hay cerca, de proximidad.",
  "Dime la ciudad y te llevo directo. Lo local tiene su energía vital.",
  "¿Dónde estás buscando? Ciudad o país — lo que fluya.",
];
const FRASES_FALLBACK = [
  "No te pillo del todo, y eso que tengo el radar bien calibrado. ¿Buscas BroCupones productos, BroCupones servicios, Audios o BroDeseos?",
  "Mmm, noto que hay más detrás de eso. ¿A qué sector quieres fluir hoy?",
  "Cuéntame mejor. ¿Productos, servicios, audio o BroDeseos?",
];

export function useAgentLara({ iaMode, isAdmin, onHandoff, ciudad = null }) {
  const [mensaje, setMensaje]             = useState(null);
  const [loading, setLoading]             = useState(false);
  const [chatHistory, setChatHistory]     = useState([]);
  const [sectorMemoria, setSectorMemoria] = useState(null);
  const [ciudadMemoria, setCiudadMemoria] = useState(null);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const interpretarSistema = (intencion) => {
    const t = norm(intencion);
    if (t.includes('tito'))  { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'tito'  }), 2500); return; }
    if (t.includes('puffo')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'puffo' }), 2500); return; }
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto = await fetchContextoLara(ciudad);
      const system   = promptLara(contexto || {});
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

      if (respuestaCompleta.trim().startsWith('HANDOFF:')) {
        const partes  = respuestaCompleta.replace('HANDOFF:', '').trim().split(':');
        const agente  = partes[0];
        const detalle = partes[1] || null;
        onHandoff?.({
          agente,
          ciudad: ciudadMemoria || ciudad,
          ...(detalle && agente === 'OSOS_INTERNO' && { oso_id: detalle }),
          ...(detalle && agente !== 'OSOS_INTERNO' && { ciudad: detalle }),
        });
        setLoading(false);
        return;
      }

      const lineaSistema = respuestaCompleta.split('\n').find(l => l.trim().startsWith('SISTEMA:'));
      const mensajeUser  = respuestaCompleta.replace(lineaSistema || '', '').replace(/\*\*/g, '').trim();
      const intencion    = lineaSistema ? lineaSistema.replace('SISTEMA:', '').trim() : 'CONTINUA';

      if (intencion && intencion !== 'CONTINUA') interpretarSistema(intencion);

      const canjeMatch   = mensajeUser.match(/\[CANJE_CONFIRMADO:([^:]+):(\d{3})\]/);
      const mensajeFinal = canjeMatch ? mensajeUser.replace(canjeMatch[0], '').trim() : mensajeUser;

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeFinal);
      setMensaje(mensajeFinal);
    } catch (err) {
      console.error('useAgentLara error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;
    const t = norm(textoUsuario);

    // 1. Handoff interno
    if (t.includes('tito'))  { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'tito'  }), 1200); return; }
    if (t.includes('puffo')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'puffo' }), 1200); return; }

    // 2. Detección temprana sector + ciudad
    const sectorDetect = detectarSectorPS(textoUsuario);
    const ciudadDetect = detectarCiudadPS(textoUsuario);
    const sectorFinal  = sectorDetect || sectorMemoria;
    const ciudadFinal  = ciudadDetect?.valor || ciudadMemoria;

    if (sectorDetect)        setSectorMemoria(sectorDetect);
    if (ciudadDetect?.valor) setCiudadMemoria(ciudadDetect.valor);

    if (sectorFinal && !SECTORES_SIN_CIUDAD.includes(sectorFinal) && ciudadFinal) {
      setMensaje(elegir(FRASES_BIENVENIDA));
      setSectorMemoria(null); setCiudadMemoria(null);
      setTimeout(() => onHandoff?.({ agente: sectorFinal, ciudad: ciudadFinal }), 1200);
      return;
    }
    if (sectorFinal && SECTORES_SIN_CIUDAD.includes(sectorFinal)) {
      setMensaje(elegir(FRASES_BIENVENIDA));
      setSectorMemoria(null);
      setTimeout(() => onHandoff?.({ agente: sectorFinal, ciudad: null }), 1200);
      return;
    }
    if (sectorFinal && !ciudadFinal) {
      setMensaje(elegir(FRASES_PEDIR_CIUDAD));
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
    setSectorMemoria(null);
    setCiudadMemoria(null);
  };

  return { mensaje, loading, enviar, reset, iaActiva };
}
