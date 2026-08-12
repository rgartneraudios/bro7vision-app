// src/hooks/useAgentLarry.js

import { useState } from 'react';
import { promptLarry }        from '../data/evelyn_larry/promptLarry';
import { fetchContextoEvelyn } from '../services/contexto/fetchContextoEvelyn';
import { fetchHistoriaNodos } from '../services/contexto/fetchHistoriaNodos';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const norm   = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FRASES_FALLBACK = [
  "Amigo mío... no te sigo del todo. ¿Buscas Canjear Lunas, Shop Amigos o Games?",
  "El tiempo apremia. Dime directamente a dónde vas — ¿Canjear Lunas, Shop Amigos, Games?",
  "A precio de mercado, eso no cotiza en mi radar. ¿Adónde te dirijo?",
];

export function useAgentLarry({ iaMode, isAdmin, onHandoff, ciudad = null,
                                 onShowStoryList, onLaunchStory, storyEpisode = null }) {
  const [mensaje,      setMensaje]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [chatHistory,  setChatHistory]  = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) =>
    setChatHistory(prev => [...prev, { role, content }].slice(-6));

  const interpretarSistema = (intencion) => {
    const t = norm(intencion);
    if (t.includes('interno_evelyn')) { setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'evelyn' }), 1200); return; }
    if (t.includes('mostrar_lista_cuentos')) { setTimeout(() => onShowStoryList?.(), 1200); return; }
    const lanzarMatch = t.match(/lanzar_cuento[_\s:]+(\d+)/);
    if (lanzarMatch) { setTimeout(() => onLaunchStory?.(parseInt(lanzarMatch[1])), 1200); return; }
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto   = await fetchContextoEvelyn(ciudad);
      const baseSystem = promptLarry(contexto || {});
      const system     = storyEpisode
        ? `${baseSystem}\n\nHISTORIA EN PANTALLA:\n${storyEpisode.texto?.slice(0, 800) || ''}`
        : baseSystem;

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, messages: chatHistory.slice(-4), userMessage: textoUsuario, iaMode }),
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
      const mensajeFinal = respuestaCompleta.replace(lineaSistema || '', '').replace(/\*\*/g, '').trim();
      const intencion    = lineaSistema ? lineaSistema.replace('SISTEMA:', '').trim() : 'CONTINUA';

      if (intencion && intencion !== 'CONTINUA') interpretarSistema(intencion);

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeFinal);
      setMensaje(mensajeFinal);
    } catch {
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;
    const t = norm(textoUsuario);
    if (t.includes('evelyn'))  { setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'evelyn' }), 1200); return; }
    if (t.includes('555'))     { onShowStoryList?.(); return; }
    if (iaActiva) { enviarIA(textoUsuario); return; }
    setMensaje(elegir(FRASES_FALLBACK));
  };

  const reset = () => { setMensaje(null); setChatHistory([]); };
  return { mensaje, loading, enviar, reset, iaActiva };
}