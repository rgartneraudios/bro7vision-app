// src/hooks/useAgentMapache.js
// Hook exclusivo de Mapache y Ami.
// personaje = 'mapache' | 'ami'

import { useState } from 'react';
import { fetchContextoMapache } from '../services/contexto/fetchContextoMapache';
import { fetchContextoAmi }     from '../services/contexto/fetchContextoAmi';
import { promptAmi }    from '../data/mapache_ami/promptAmi';
import { promptMapache } from '../data/mapache_ami/promptMapache';
import { fetchHistoriaNodos } from '../services/contexto/fetchHistoriaNodos';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const AUDIO_KEYWORDS_SALIDA = [
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'rumores',
  'juego', 'juegos', 'games',
];
const AUDIO_KEYWORDS_AMI     = ['ami', 'amí', 'la ami', 'amy'];
const AUDIO_KEYWORDS_MAPACHE = ['mapache', 'el mapache'];
const AUDIO_FRASES_SALIDA = [
  'Espera, que te paso con los Osos. 🦝',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Hasta luego.',
  'Te paso con los Osos. Yo sigo en cabina.',
];

const detectarSalidaMapache = (texto) => {
  const t = norm(texto);
  if (!AUDIO_KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)))) return null;
  return { salida: true, mensaje: AUDIO_FRASES_SALIDA[Math.floor(Math.random() * AUDIO_FRASES_SALIDA.length)] };
};

const detectarInternoMapache = (texto, personajeActivo) => {
  const t = norm(texto);
  if (personajeActivo !== 'ami'     && AUDIO_KEYWORDS_AMI.some(kw => t.includes(norm(kw))))     return { interno: true, personaje_id: 'ami' };
  if (personajeActivo !== 'mapache' && AUDIO_KEYWORDS_MAPACHE.some(kw => t.includes(norm(kw)))) return { interno: true, personaje_id: 'mapache' };
  return null;
};

export function useAgentMapache({
  personaje   = 'mapache',
  iaMode      = 'off',
  isAdmin     = false,
  onHandoff,
  ciudad      = null,
  onShowStoryList,
  onLaunchStory,
  storyEpisode = null,
}) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [esPatrocinado, setEsPatrocinado] = useState(false);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const interpretarSistema = (respuesta) => {
    const lines = respuesta.split('\n');
    const sistemaLine = lines.find(l => l.trim().startsWith('SISTEMA:'));
    if (!sistemaLine) return null;
    const t = sistemaLine.replace('SISTEMA:', '').trim();
    if (t.includes('interno_ami')) {
      setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'ami' }), 1200);
      return 'HANDLED';
    }
    if (t.includes('interno_mapache')) {
      setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'mapache' }), 1200);
      return 'HANDLED';
    }
    if (t.includes('mostrar_lista_cuentos')) {
      setTimeout(() => onShowStoryList?.(), 1200);
      return 'HANDLED';
    }
    const lanzarMatch = t.match(/lanzar_cuento[_\s:]+(\d+)/);
    if (lanzarMatch) {
      setTimeout(() => onLaunchStory?.(parseInt(lanzarMatch[1])), 1200);
      return 'HANDLED';
    }
    return null;
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const esAmi      = (personaje || 'mapache') === 'ami';
      const contexto   = esAmi
        ? await fetchContextoAmi(ciudad)
        : await fetchContextoMapache(ciudad);
      if (contexto?.esPatrocinado) setEsPatrocinado(true);

      const baseSystem = esAmi
        ? promptAmi(contexto || {})
        : promptMapache(contexto || {});
      const system     = storyEpisode
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

      const data      = await res.json();
      let respuesta = data?.texto || '...';

      if (respuesta.startsWith('BUSCAR:')) {
        const terminos = respuesta.replace('BUSCAR:', '').split(',').map(t => t.trim());
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
        respuesta = segundaData?.texto || '...';
      }

      const sistemaResult = interpretarSistema(respuesta);
      if (sistemaResult === 'HANDLED') {
        setLoading(false);
        return;
      }

      const respuestaLimpia = respuesta.replace(/SISTEMA:.*$/gm, '').trim() || respuesta;

      if (respuestaLimpia.trim().startsWith('HANDOFF:')) {
        const partes  = respuestaLimpia.replace('HANDOFF:', '').trim().split(':');
        const agente  = partes[0];
        const detalle = partes[1] || null;
        onHandoff?.({
          agente,
          ...(detalle && agente === 'AUDIO_INTERNO' && { personaje_id: detalle }),
        });
        setLoading(false);
        return;
      }

      pushHistory('user', textoUsuario);
      pushHistory('assistant', respuestaLimpia);
      setMensaje(respuestaLimpia);

    } catch (err) {
      console.error('useAgentMapache error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario, extraContext = {}) => {
    if (!textoUsuario?.trim()) return;

    const t = norm(textoUsuario);
    if (t.includes('ami'))     { setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'ami'     }), 1200); return; }
    if (t.includes('mapache')) { setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'mapache' }), 1200); return; }
    if (t.includes('555'))     { onShowStoryList?.(); return; }

    const salida = detectarSalidaMapache(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    const interno = detectarInternoMapache(textoUsuario, personaje);
    if (interno) {
      setTimeout(() => onHandoff?.({ agente: 'AUDIO_INTERNO', personaje_id: interno.personaje_id }), 1200);
      return;
    }

    if (iaActiva) {
      enviarIA(textoUsuario);
      return;
    }

    setMensaje('Cuéntame qué buscas, bro.');
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setEsPatrocinado(false);
  };

  return { mensaje, loading, enviar, reset, iaActiva, esPatrocinado };
}