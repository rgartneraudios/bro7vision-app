import { useState, useEffect, useRef, useCallback } from 'react';
import { useAgentNovaExplora } from './useAgentNovaExplora';
import { useAgentEvelyn }      from './useAgentEvelyn';
import { useAgentRumores }     from './useAgentRumores';
import { useSmisterioChat }    from './useSmisterioChat';
import { useJaguarChat }       from './useJaguarChat';
import { useOrumamaChat }      from './useOrumamaChat';

const noop = () => {};

// Replica la función elegir de los Banners de escritorio
const elegir = (arr) =>
  Array.isArray(arr) && arr.length
    ? arr[Math.floor(Math.random() * arr.length)]
    : null;

export function useAgSectorMobile({
  intent, iaMode, isAdmin, onHandoff, ciudad, perfilSector,
  genesis = 0, userId = null, autorAlias = 'Ciudadano',
  perfilOso,
}) {
  // ── Personaje activo del Oráculo (derivado de perfilOso) ───────────────────
  const oraculoActivo = (perfilOso?.oraculo_personaje || 'ORUMAMA').toLowerCase();

  // Estado para mensajes de bot-mode del Oráculo (sustituye al setCurrentMsg del Banner)
  const [mensajeBot, setMensajeBot] = useState(null);

  // Limpiar mensajeBot al cambiar personaje o sector
  useEffect(() => { setMensajeBot(null); }, [oraculoActivo, intent]);

  // Limpiar mensajeBot al cambiar personaje o sector
  useEffect(() => { setMensajeBot(null); }, [oraculoActivo, intent]);

  // ── onHandoff estable para el Oráculo ─────────────────────────────────────
  const onHandoffRef = useRef(onHandoff);
  onHandoffRef.current = onHandoff;

  const onHandoffOraculo = useCallback((payload) => {
    const agente = typeof payload === 'string' ? payload : payload?.agente;
    if (agente === 'jaguar'    || agente === 'ORACULO_JAGUAR')    { return; }
    if (agente === 'smisterio' || agente === 'ORACULO_SMISTERIO') { return; }
    if (agente === 'orumama'   || agente === 'ORACULO_ORUMAMA')   { return; }
    onHandoffRef.current?.(payload);
  }, []);

  // ── Hooks de sector ────────────────────────────────────────────────────────
  const nova     = useAgentNovaExplora({ iaMode, isAdmin, onHandoff, ciudad });
  const evelyn   = useAgentEvelyn     ({ iaMode, isAdmin, onHandoff, ciudad,
                     genesis, userId, autorAlias });
  const rumores  = useAgentRumores    ({ iaMode, isAdmin, onHandoff });

  // ── Hooks del Oráculo (usan el wrapper estable) ───────────────────────────
  const smisterio = useSmisterioChat({ iaMode, isAdmin, onHandoff: onHandoffOraculo,
                      onBotContent: noop, onBotContentIA: noop });
  const jaguar    = useJaguarChat   ({ iaMode, isAdmin, onHandoff: onHandoffOraculo,
                      onBotContent: noop });
  const orumama   = useOrumamaChat  ({ iaMode, isAdmin, onHandoff: onHandoffOraculo,
                      onBotContent: noop });

  const oraculo =
    oraculoActivo === 'smisterio' ? smisterio :
    oraculoActivo === 'jaguar'    ? jaguar    :
    orumama;

  const active =
    intent === 'canjear'   ? nova     :
    intent === 'brodeseos' ? evelyn   :
    intent === 'reinos'    ? rumores  :
    intent === 'ai'        ? oraculo  :
    { enviar: noop, mensaje: null, loading: false, reset: noop };

  // ── Ref al active actual ───────────────────────────────────────────────────
  const activeRef = useRef(active);
  activeRef.current = active;

  // enviar estable: pasa setCurrentMsg para que los hooks del Oráculo
  // puedan mostrar respuestas en bot-mode sin el Banner de escritorio
  const enviar = useCallback((texto) => {
    setMensajeBot(null);
    activeRef.current.enviar(texto, { setCurrentMsg: setMensajeBot, elegir });
  }, []);

  const reset = useCallback(() => {
    setMensajeBot(null);
    activeRef.current.reset?.();
  }, []);

  // active.mensaje → respuesta IA (async, seteada por enviarIA dentro del hook)
  // mensajeBot     → respuesta bot-mode (sync, seteada via setCurrentMsg)
  const mensaje = active.mensaje ?? mensajeBot;

  return {
    mensaje,
    loading: active.loading,
    enviar,
    reset,
    oraculoActivo,
  };
}
