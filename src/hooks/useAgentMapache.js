// src/hooks/useAgentMapache.js
// Hook exclusivo del sector Audio. Gestiona Mapache y Ami.
// personaje = 'mapache' | 'ami'

import { useState } from 'react';
import { fetchContextoMapache } from '../services/contexto/fetchContextoMapache';
import { fetchContextoAmi }     from '../services/contexto/fetchContextoAmi';
import { detectarSalidaMapache, detectarInternoMapache, detectarIntencionMapache } from '../services/agents/bots/mapacheUtils';
import { detectarBusquedaAudio, fraseBuscandoAudio, responder as mapacheBot } from '../services/agents/bots/mapacheBot';
import { responder as amiBot } from '../services/agents/bots/amiBot';
import { mapache } from '../data/mapache/Personalidad';
import { ami }     from '../data/ami/Personalidad';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

function buildPromptMapache(perfil, contexto) {
  const { vivencia, estadoAnimo, promoGeo, special } = contexto || {};

  return `
Eres ${perfil.nombre}. Habla siempre en primera persona.
Tono: ${perfil.tono}

PERSONALIDAD:
${perfil.personalidad}

TU FUNCIÓN:
Gestoras del sector Audio de BRO7VISION.
Presentas canales de audio, podcasts y lives. Ayudas al usuario a encontrar lo que quiere escuchar.
Cuando el usuario quiere escuchar algo → handoff AUDIO_PLAY con el código.
Cuando el usuario quiere buscar → handoff BUSCAR_STRIP.

${vivencia   ? `VIVENCIA DE HOY (incorpórala de forma natural): ${vivencia}`    : ''}
${estadoAnimo ? `ESTADO DE ÁNIMO: ${estadoAnimo}`                               : ''}
${promoGeo   ? `MENCIÓN PATROCINADA (natural, nunca como anuncio): ${promoGeo}` : ''}
${special    ? `SPECIAL ACTIVO — stock: ${special.stock}. Ofrece de forma natural: "${special.texto}". Si el user confirma interés pídele un número de 3 cifras. Cuando lo dé añade al final: [CANJE_CONFIRMADO:${special.codigo}:NNN] sustituyendo NNN por el número.` : ''}

COMPAÑEROS:
${perfil.nombre === 'Mapache'
  ? 'Ami también atiende este sector. Si el user la pide: HANDOFF:AUDIO_INTERNO:ami'
  : 'Mapache también atiende este sector. Si el user lo pide: HANDOFF:AUDIO_INTERNO:mapache'}

HANDOFFS DISPONIBLES:
- HANDOFF:OSOS → salir al sector recepción
- HANDOFF:AUDIO_INTERNO:ami → cambiar a Ami
- HANDOFF:AUDIO_INTERNO:mapache → cambiar a Mapache
- HANDOFF:AUDIO_STOP → parar reproducción
- HANDOFF:AUDIO_PLAY:[codigo] → reproducir canal con ese código

REGLAS:
1. Máximo 3 frases por respuesta.
2. Nunca menciones que eres una IA.
3. Sin asteriscos ni acciones entre asteriscos.
4. Cuando el user quiera salir responde ÚNICAMENTE: HANDOFF:OSOS
5. Cuando el user quiera parar: HANDOFF:AUDIO_STOP
  `.trim();
}

export function useAgentMapache({
  personaje   = 'mapache',
  iaMode      = 'off',
  isAdmin     = false,
  onHandoff,
  ciudad      = null,
  entidad     = null,
  hayTarjetas = false,
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

  // ── Envío IA ──────────────────────────────────────────────────────────────
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

      // Handoff directo de la IA
      if (respuesta.trim().startsWith('HANDOFF:')) {
        const partes  = respuesta.replace('HANDOFF:', '').trim().split(':');
        const agente  = partes[0];
        const detalle = partes[1] || null;
        onHandoff?.({
          agente,
          ...(detalle && agente === 'AUDIO_INTERNO' && { personaje_id: detalle }),
          ...(detalle && agente === 'AUDIO_PLAY'    && { codigo: detalle }),
        });
        setLoading(false);
        return;
      }

      // Canje confirmado
      const canjeMatch   = respuesta.match(/\[CANJE_CONFIRMADO:([^:]+):(\d{3})\]/);
      const mensajeFinal = canjeMatch ? respuesta.replace(canjeMatch[0], '').trim() : respuesta;

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeFinal);
      setMensaje(mensajeFinal);

    } catch (err) {
      console.error('useAgentMapache error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  // ── Entrada principal — Bot e IA ──────────────────────────────────────────
  const enviar = (textoUsuario, extraContext = {}) => {
    if (!textoUsuario?.trim()) return;

    // 1. Stop — siempre
    if (/\b(stop|para|detén|frena|detener|frenar)\b/i.test(textoUsuario)) {
      onHandoff?.({ agente: 'AUDIO_STOP' });
      setMensaje('Parado. 🎵');
      return;
    }

    // 2. Salida → Osos — siempre
    const salida = detectarSalidaMapache(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    // 3. Handoff interno Mapache ↔ Ami — Bot e IA
    const interno = detectarInternoMapache(textoUsuario, personaje);
    if (interno) {
      setTimeout(() => onHandoff?.({ agente: 'AUDIO_INTERNO', personaje_id: interno.personaje_id }), 1200);
      return;
    }

    // 4. Card activa + confirmación play — sin gastar tokens
    const cardActiva = extraContext?.card_activa;
    if (cardActiva) {
      const tLower = textoUsuario.trim().toLowerCase();
      const esConfirmacion = /^(play|pon|ponlo|dale|si|sí|ok|yes|poner|reproduce)$/.test(tLower);
      if (esConfirmacion) {
        const codigo = cardActiva.bro_aud || cardActiva.bro_pod || cardActiva.bro_id;
        if (codigo) {
          setMensaje('Dale. 🎵');
          onHandoff?.({ agente: 'AUDIO_PLAY', codigo, canal: cardActiva });
          return;
        }
      }
    }

    // 5. Modo IA
    if (iaActiva) {
      enviarIA(textoUsuario);
      return;
    }

    // 6. Modo Bot — detectar búsqueda de audio
    if (detectarBusquedaAudio(textoUsuario)) {
      setMensaje(fraseBuscandoAudio(textoUsuario));
      onHandoff?.({ agente: 'BUSCAR_STRIP', keyword: textoUsuario, intencion: 'AUDIO' });
      return;
    }

    // 7. Fallback Bot
    const bot = esAmi ? amiBot : mapacheBot;
    const resultado = bot({
      textoUser:   textoUsuario,
      intencion:   detectarIntencionMapache(textoUsuario),
      entidad,
      hayTarjetas,
    });
    setMensaje(resultado.mensaje);
    if (resultado.handoff) {
      onHandoff?.({
        agente:       resultado.handoff,
        personaje_id: resultado.personaje_id,
        codigo:       resultado.codigo,
        canal:        resultado.canal,
      });
    }
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setEsPatrocinado(false);
  };

  return { mensaje, loading, enviar, reset, iaActiva, esPatrocinado };
}
