// src/hooks/useAgentTito.js
// Hook exclusivo de Tito. Nadie más lo usa.

import { useState, useRef } from 'react';
import { promptTito }        from '../data/Grupo Osos/tito/promptTito';
import { fetchContextoTito } from '../services/contexto/fetchContextoTito';
import { fetchHistoriaNodos } from '../services/contexto/fetchHistoriaNodos';


const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FRASES_FALLBACK = [
  "Mmm, oye, una preguntita... ¿buscas Canjear Lunas, Shop Amigos, Games?",
  "Yo solo decía... que si me dices el sector te llevo directo. ¿Cuál es?",
  "Es curioso, ¿verdad? que a veces cuesta decir lo que se busca. ¿A qué sector quieres ir?",
];

export function useAgentTito({ iaMode, isAdmin, onHandoff, ciudad = null,
                               onShowStoryList, onLaunchStory, storyEpisode = null }) {
  const [mensaje, setMensaje]             = useState(null);
  const [loading, setLoading]             = useState(false);
  const [chatHistory, setChatHistory]     = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const interpretarSistema = (intencion) => {
    const t = norm(intencion);
    if (t.includes('lara'))  { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'lara'  }), 2500); return; }
    if (t.includes('puffo')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'puffo' }), 2500); return; }
    if (t.includes('mostrar_lista_cuentos')) {
      setTimeout(() => onShowStoryList?.(), 1200);
      return;
    }
    const lanzarMatch = t.match(/lanzar_cuento[_\s:]+(\d+)/);
    if (lanzarMatch) {
      setTimeout(() => onLaunchStory?.(parseInt(lanzarMatch[1])), 1200);
      return;
    }
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto    = await fetchContextoTito(ciudad);
      const baseSystem  = promptTito(contexto || {});
      const system      = storyEpisode
        ? `${baseSystem}\n\nHISTORIA EN PANTALLA:\n${storyEpisode.texto?.slice(0, 800) || ''}`
        : baseSystem;
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

      if (respuestaCompleta.trim().startsWith('HANDOFF:')) {
        const partes  = respuestaCompleta.replace('HANDOFF:', '').trim().split(':');
        const agente  = partes[0];
        const detalle = partes[1] || null;
        onHandoff?.({
          agente,
          ciudad,
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
      console.error('useAgentTito error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;
    const t = norm(textoUsuario);

    // 1. Handoff interno — siempre, Bot e IA
    if (t.includes('lara'))  { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'lara'  }), 1200); return; }
    if (t.includes('puffo')) { setTimeout(() => onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: 'puffo' }), 1200); return; }

    // 2. 555 → mostrar lista de cuentos (intercepción directa, sin pasar por IA)
    if (t.includes('555')) {
      onShowStoryList?.();
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
  };

  return { mensaje, loading, enviar, reset, iaActiva };
}
