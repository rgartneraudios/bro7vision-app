// src/hooks/useAgentPuffo.js
// Hook exclusivo de Puffo. Nadie más lo usa.

import { useState } from 'react';
import { promptPuffo }       from '../data/puffo/promptPuffo';
import { fetchContextoPuffo } from '../services/contexto/fetchContextoPuffo';
import { detectarSectorPS, detectarCiudadPS } from '../services/agents/ososPS';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const SECTORES_SIN_CIUDAD = ['BRO7BAND', 'REINOS', 'GAMES'];
const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FRASES_BIENVENIDA = [
  "Puffo aquí 🎙️ Dime, ¿a dónde te llevo hoy?",
  "¡Okey! Micrófono abierto — ¿qué buscas?",
  "¡Hola! ¿Tienes algo en mente o abrimos el debate juntos?",
  "Aquí Puffo. He escuchado de todo en esta vida. ¿A dónde vamos?",
];
const FRASES_PEDIR_CIUDAD = [
  "Fíjate, necesito un dato clave — ¿en qué ciudad buscas?",
  "Dime la ciudad. Sin eso no tengo contexto para llevarte allí.",
  "¿Dónde buscas? Ciudad o país — lo que tengas sobre la mesa.",
];
const FRASES_FALLBACK = [
  "Ajá... no te sigo del todo. ¿BroCupones Productos, BroCupones Servicios, música o BroDeseos? Dame el titular.",
  "Interesante... pero necesito más contexto. ¿A qué sector quieres ir?",
  "Te corto un segundo ahí. ¿BroCupones Productos, BroCupones Servicios, audio o BroDeseos? Eso primero.",
];

export function useAgentPuffo({ iaMode, isAdmin, onHandoff, ciudad = null }) {
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
    if (t.includes('tito')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'tito' }), 2500); return; }
    if (t.includes('lara')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'lara' }), 2500); return; }
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto = await fetchContextoPuffo(ciudad);
      const system   = promptPuffo(contexto || {});
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
      console.error('useAgentPuffo error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;
    const t = norm(textoUsuario);

    // 1. Handoff interno
    if (t.includes('tito')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'tito' }), 1200); return; }
    if (t.includes('lara')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'lara' }), 1200); return; }

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
