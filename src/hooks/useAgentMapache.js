// src/hooks/useAgentMapache.js
// Hook exclusivo de Mapache y Ami.
// personaje = 'mapache' | 'ami'

import { useState } from 'react';
import { fetchContextoMapache } from '../services/contexto/fetchContextoMapache';
import { fetchContextoAmi }     from '../services/contexto/fetchContextoAmi';

const mapache = {
  nombre: 'Mapache',
  tono: 'juvenil, gamberro, estilo bro, positivo, callejero',
  personalidad: `Mapache. Es jovial, hacker, le gustan las hamburguesas. Pasota, rebelde, lenguaje muy informal. Muletillas: "Bro", "Tío / Chabón", "Eh", "Ya ves".`,
};

const ami = {
  nombre: 'Ami',
  tono: 'motivador, positivo, centrado, estudiantil',
  personalidad: `Ami. Es la hermana mayor, energética y motivadora. Lenguaje fresco y positivo. Muletillas: "Literal", "O sea", "Súper".`,
};

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const AUDIO_KEYWORDS_SALIDA = [
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'reinos', 'reino', 'rumores',
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

function buildPromptMapache(perfil, contexto) {
  const { vivencia, estadoAnimo, promoGeo } = contexto || {};
  return `
Eres ${perfil.nombre}. Habla siempre en primera persona.
Tono: ${perfil.tono}

PERSONALIDAD:
${perfil.personalidad}

${vivencia    ? `VIVENCIA DE HOY (incorpórala de forma natural): ${vivencia}`    : ''}
${estadoAnimo ? `ESTADO DE ÁNIMO: ${estadoAnimo}`                               : ''}
${promoGeo    ? `MENCIÓN PATROCINADA (natural, nunca como anuncio): ${promoGeo}` : ''}

COMPAÑEROS:
${perfil.nombre === 'Mapache'
  ? 'Ami también está aquí. Si el user la pide: HANDOFF:AUDIO_INTERNO:ami'
  : 'Mapache también está aquí. Si el user lo pide: HANDOFF:AUDIO_INTERNO:mapache'}

HANDOFFS DISPONIBLES:
- HANDOFF:OSOS → salir al sector recepción
- HANDOFF:AUDIO_INTERNO:ami → cambiar a Ami
- HANDOFF:AUDIO_INTERNO:mapache → cambiar a Mapache

REGLAS:
1. Máximo 3 frases por respuesta.
2. Nunca menciones que eres una IA.
3. Sin asteriscos ni acciones entre asteriscos.
4. Cuando el user quiera salir responde ÚNICAMENTE: HANDOFF:OSOS
  `.trim();
}

export function useAgentMapache({
  personaje   = 'mapache',
  iaMode      = 'off',
  isAdmin     = false,
  onHandoff,
  ciudad      = null,
}) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [esPatrocinado, setEsPatrocinado] = useState(false);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
  const esAmi    = personaje === 'ami';

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const fetchContexto = async () => {
    return esAmi ? fetchContextoAmi(ciudad) : fetchContextoMapache(ciudad);
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto = await fetchContexto();
      if (contexto?.esPatrocinado) setEsPatrocinado(true);

      const perfil = esAmi ? ami : mapache;
      const system = buildPromptMapache(perfil, contexto);

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
        const partes  = respuesta.replace('HANDOFF:', '').trim().split(':');
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
      pushHistory('assistant', respuesta);
      setMensaje(respuesta);

    } catch (err) {
      console.error('useAgentMapache error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario, extraContext = {}) => {
    if (!textoUsuario?.trim()) return;

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