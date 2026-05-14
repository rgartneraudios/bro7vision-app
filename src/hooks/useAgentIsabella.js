// src/hooks/useAgentIsabella.js
// Hook exclusivo del sector Servicios. Gestiona Isabella y Profesor.
// personaje = 'isabella' | 'profesor'

import { useState } from 'react';
import { fetchContextoIsabella } from '../services/contexto/fetchContextoIsabella';
import { fetchContextoProfesor }  from '../services/contexto/fetchContextoProfesor';
import { detectarSalidaIsabella, detectarInternoIsabella, detectarIntencionIsabella } from '../services/agents/bots/isabellaUtils';
import { detectarBusquedaServicio, fraseBuscando, responder as isabellaBot } from '../services/agents/bots/isabellaBot';
import { responder as profesorBot } from '../services/agents/bots/profesorBot';
import { isabella } from '../data/isabella/Personalidad';
import { profesor } from '../data/profesor/Personalidad';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

function buildPromptIsabella(perfil, contexto, vivencia, estadoAnimo, promoGeo, special) {
  return `
Eres ${perfil.nombre}. Habla siempre en primera persona.
Tono: ${perfil.tono}

PERSONALIDAD:
${perfil.personalidad}

TU FUNCIÓN:
Gestoras del sector Servicios de BRO7VISION.
Presentas profesionales, describes sus servicios y los llevas al cierre de reserva.
Si el usuario escribe CODIGO + D → describe el profesional.
Si el usuario escribe CODIGO + A → lleva al profesional a ISABELLA_CIERRE.

${vivencia   ? `VIVENCIA DE HOY (incorpórala de forma natural): ${vivencia}`   : ''}
${estadoAnimo ? `ESTADO DE ÁNIMO: ${estadoAnimo}`                              : ''}
${promoGeo   ? `MENCIÓN PATROCINADA (natural, nunca como anuncio): ${promoGeo}` : ''}
${special    ? `SPECIAL ACTIVO — stock: ${special.stock}. Ofrece de forma natural: "${special.texto}". Si el user confirma interés pídele un número de 3 cifras. Cuando lo dé añade al final: [CANJE_CONFIRMADO:${special.codigo}:NNN] sustituyendo NNN por el número.` : ''}

COMPAÑEROS:
${perfil.nombre === 'Isabella'
  ? 'El Profesor Robles también atiende este sector. Si el user lo pide: HANDOFF:SERVICIO_INTERNO:profesor'
  : 'Isabella también atiende este sector. Si el user la pide: HANDOFF:SERVICIO_INTERNO:isabella'}

HANDOFFS DISPONIBLES:
- HANDOFF:OSOS → salir al sector recepción
- HANDOFF:SERVICIO_INTERNO:profesor → cambiar al Profesor
- HANDOFF:SERVICIO_INTERNO:isabella → cambiar a Isabella
- HANDOFF:ISABELLA_CIERRE → abrir cierre de reserva

REGLAS:
1. Máximo 3 frases por respuesta.
2. Nunca menciones que eres una IA.
3. Sin asteriscos ni acciones entre asteriscos.
4. Si tienes sector y ciudad → handoff inmediato.
5. Cuando el user quiera salir responde ÚNICAMENTE: HANDOFF:OSOS
  `.trim();
}

export function useAgentIsabella({
  personaje   = 'isabella',
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
  const esProfesor = personaje === 'profesor';

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const fetchContexto = async () => {
    return esProfesor
      ? fetchContextoProfesor(ciudad)
      : fetchContextoIsabella(ciudad);
  };

  // ── Envío IA ──────────────────────────────────────────────────────────────
  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto = await fetchContexto();
      if (contexto?.esPatrocinado) setEsPatrocinado(true);

      const perfil = esProfesor ? profesor : isabella;
      const system = buildPromptIsabella(
        perfil,
        contexto,
        contexto?.vivencia,
        contexto?.estadoAnimo,
        contexto?.promoGeo,
        contexto?.special,
      );

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
      const respuesta = data?.texto || '...';

      // Handoff directo de la IA
      if (respuesta.trim().startsWith('HANDOFF:')) {
        const partes  = respuesta.replace('HANDOFF:', '').trim().split(':');
        const agente  = partes[0];
        const detalle = partes[1] || null;
        onHandoff?.({
          agente,
          ...(detalle && agente === 'SERVICIO_INTERNO' && { personaje_id: detalle }),
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
      console.error('useAgentIsabella error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  // ── Entrada principal — Bot e IA ──────────────────────────────────────────
  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;

    // 1. Salida → Osos — siempre
    const salida = detectarSalidaIsabella(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    // 2. Handoff interno Isabella ↔ Profesor — Bot e IA
    const interno = detectarInternoIsabella(textoUsuario, personaje);
    if (interno) {
      setTimeout(() => onHandoff?.({ agente: 'SERVICIO_INTERNO', personaje_id: interno.personaje_id }), 1200);
      return;
    }

    // 3. Modo IA
    if (iaActiva) {
      enviarIA(textoUsuario);
      return;
    }

    // 4. Modo Bot — detectar búsqueda de servicio
    if (detectarBusquedaServicio(textoUsuario)) {
      setMensaje(fraseBuscando(textoUsuario));
      onHandoff?.({ agente: 'BUSCAR_STRIP', keyword: textoUsuario, intencion: 'BROSHOP_SERVICIO' });
      return;
    }

    // 5. Fallback Bot
    const bot = esProfesor ? profesorBot : isabellaBot;
    const resultado = bot({
      textoUser:   textoUsuario,
      intencion:   detectarIntencionIsabella(textoUsuario),
      entidad,
      hayTarjetas,
    });
    setMensaje(resultado.mensaje);
    if (resultado.handoff) {
      onHandoff?.({ agente: resultado.handoff, personaje_id: resultado.personaje_id });
    }
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setEsPatrocinado(false);
  };

  return { mensaje, loading, enviar, reset, iaActiva, esPatrocinado };
}
