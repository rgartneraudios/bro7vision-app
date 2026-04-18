// src/components/EvelynBanner.jsx
// v4 — Todo incluido (Banner + Input + Carrusel). Sin forwardRef.

import React, { useState, useEffect, useRef } from 'react';
import { useAgentChat } from '../hooks/useAgentChat';
import AvisoPreviewCard from './AvisoPreviewCard';
import AgentChatInput from './AgentChatInput';
import BroCardStrip from './BroCardStrip';

const GREETINGS_EVELYN = [
  "Hola, soy Evelyn. ¿Qué aviso buscas o quieres publicar? 🐺",
  "Evelyn al habla. Dime qué necesitas y lo resolvemos rápido.",
  "¡Buenas! Soy Evelyn 🧡 ¿Buscas algo o tienes algo que ofrecer?",
  "Evelyn aquí. Sin rodeos — ¿qué aviso te trae por aquí?",
];

const GREETINGS_LARRY = [
  "Larry al teléfono. ¿Qué movimiento hay hoy en el tablón? ☕",
  "Buenos días. Soy Larry. He visto de todo en estas calles... ¿qué aviso buscas?",
  "Larry aquí, con el café en la mano. ¿Qué necesitas del tablón? 🐕",
  "Soy Larry. La ciudad siempre tiene algo interesante. ¿Qué aviso te trae?",
];

export default function EvelynBanner({
  personaje = 'evelyn',
  avisos_personaje,
  sessionCity,
  sessionCP,
  genesis = 0,
  alias = 'Ciudadano',
  bro_id = '',
  realItems = [],
  stripVisible,
  stripCards,
  stripLabel,

  onInvokeOsos,
  onAvisoConectar,
  onAvisoPublicar,
  setProjectingUser,
  // ── NUEVO: callback para cambiar personaje activo en App.jsx ──────────
  onPersonajeChange,
}) {
  const [display, setDisplay]       = useState('');
  const [cursor, setCursor]         = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx = useRef(0);

  const esLarry      = personaje === 'larry';
  const nombreAgente = esLarry ? 'LARRY' : 'EVELYN';
  const GREETINGS    = esLarry ? GREETINGS_LARRY : GREETINGS_EVELYN;
  
const personajeActivo = (avisos_personaje || personaje || 'evelyn').toLowerCase();
  const color           = '#5E76FF';


  const colorPrimario   = esLarry ? '#0C21C2' : '#161AF9';
  const colorSecundario = esLarry ? '#1E2D94' : '#3552B8';
  const colorTexto      = esLarry ? '#AAB9FE' : '#748BFD';
  const glowColor       = esLarry ? 'rgba(12,14,194,0.5)' : 'rgba(22,25,250,0.5)';

  const { mensaje, loading, enviar, avisoPendiente, avisoEnConstruccion } = useAgentChat({
    mode: 'avisos',
    contextData: {
      alias,
      bro_id,
      ciudad: sessionCity || '',
      cp: sessionCP || '',
      genesis,
      avisos_personaje: personaje,
    },
    realItems,
    onHandoff: ({ agente, personaje_id }) => {

      // ── AVISO_INTERNO — cambio de personaje dentro del sector ────────
      if (agente === 'AVISO_INTERNO' && personaje_id) {
        onPersonajeChange?.({ agente: 'AVISO_INTERNO', personaje_id });
        return;
      }

      // ── Externos ─────────────────────────────────────────────────────
      if (agente === 'OSOS') { onInvokeOsos?.(); return; }
    },
    onAvisoConectar: (aviso) => onAvisoConectar?.(aviso),
    onAvisoPublicar: ({ confirmado }) => {
      if (confirmado) onAvisoPublicar?.({ confirmado: true });
    },
  });

  // ── Efectos visuales ────────────────────────────────────────────────────
  useEffect(() => { const t = setInterval(() => setCursor(c => !c), 530); return () => clearInterval(t); }, []);
  useEffect(() => { setCurrentMsg(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]); }, [personaje]);
  useEffect(() => { if (mensaje) setCurrentMsg(mensaje); }, [mensaje]);

  useEffect(() => {
    if (!currentMsg) return;
    charIdx.current = 0;
    setDisplay('');
    const t = setInterval(() => {
      charIdx.current++;
      setDisplay(currentMsg.slice(0, charIdx.current));
      if (charIdx.current >= currentMsg.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, [currentMsg]);

  const avisoParaPreview = avisoEnConstruccion
    ? { ...avisoEnConstruccion, ciudad: sessionCity || '' }
    : null;

  const CAMPOS_AVISO = ['tipo', 'titulo', 'contenido', 'alcance'];
  function labelCampo(campo) {
    return { tipo: 'Tipo', titulo: 'Título', contenido: 'Descripción', alcance: 'Alcance' }[campo] || '';
  }
  const campoActual = avisoEnConstruccion
    ? CAMPOS_AVISO.find(c => !avisoEnConstruccion[c]) || 'confirmar'
    : null;
    
        // ── Nombre e icono según personaje ──────────────────────────────────────
    const INFO = {
  evelyn: { nombre: 'EVELYN', icono: '🐺' },
  larry:     { nombre: 'LARRY', icono: '🐶' },
  };
const { nombre: nombrePersonaje, icono: iconoPersonaje } = INFO[personajeActivo] || INFO.evelyn;

  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
      <style>{`
        @keyframes neonPulseAvisos {
          0%, 100% { text-shadow: 0 0 8px ${colorPrimario}, 0 0 22px ${colorSecundario}, 0 0 45px ${colorSecundario}; }
          50%       { text-shadow: 0 0 4px ${colorSecundario}, 0 0 10px ${colorSecundario}; }
        }
        @keyframes avDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
        .av-wrap {
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(12px);
          border: 1px solid ${colorPrimario}55;
          border-radius: 2rem;
          padding: 18px 32px 20px 32px;
          box-shadow: 0 0 24px ${glowColor}, inset 0 0 12px rgba(0,0,0,0.4);
          min-height: 90px;
        }
        .av-texto {
          color: ${colorTexto};
          font-style: italic; font-weight: 900; text-transform: uppercase;
          font-size: clamp(13px, 2.2vw, 18px); line-height: 1.5; min-height: 3em;
          animation: neonPulseAvisos 3s ease-in-out infinite;
        }
        .av-cursor {
          display: inline-block; width: 3px; height: 0.8em; margin-left: 3px;
          vertical-align: middle; background: ${colorPrimario}; box-shadow: 0 0 8px ${colorPrimario};
        }
        .av-loading { display: inline-flex; gap: 4px; align-items: center; }
        .av-loading span {
          width: 6px; height: 6px; border-radius: 50%; background: ${colorPrimario};
          animation: avDot 1.2s ease-in-out infinite;
        }
        .av-loading span:nth-child(2) { animation-delay: 0.2s; }
        .av-loading span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .av-step { animation: stepIn 0.25s ease both; }
      `}</style>

      {/* 1. CARRUSEL */}
      {stripVisible && (
        <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
          <BroCardStrip
            cards={stripCards}
            onSelectCard={(card) => enviar(`${card.bro_id}D`)}
            accentColor="blue"
            label={stripLabel}
            visible={stripVisible}
          />
        </div>
      )}

      {/* 2. AVISO PREVIEW */}
      {avisoParaPreview && (
        <div className="w-full max-w-2xl pointer-events-auto mb-3">
          <AvisoPreviewCard
            aviso={avisoParaPreview}
            visible={true}
            esperandoConfirmar={!!avisoPendiente}
          />
        </div>
      )}

      {/* 3. INDICADOR DE PROGRESO */}
      {avisoEnConstruccion && campoActual && (
        <div className="flex items-center gap-2 w-full max-w-2xl px-2 mb-2">
          {CAMPOS_AVISO.map((campo) => {
            const completado = !!avisoEnConstruccion[campo];
            const activo     = campo === campoActual;
            return (
              <div key={campo} className="av-step flex items-center gap-1.5">
                <div style={{
                  width: activo ? '10px' : '8px', height: activo ? '10px' : '8px',
                  borderRadius: '50%',
                  background: completado ? colorPrimario : activo ? colorTexto : `${colorPrimario}33`,
                  boxShadow: activo ? `0 0 8px ${colorPrimario}` : 'none',
                  transition: 'all 0.3s ease',
                }} />
                <span style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: completado ? colorPrimario : activo ? colorTexto : `${colorPrimario}44`,
                  transition: 'all 0.3s ease',
                }}>
                  {labelCampo(campo)}
                </span>
              </div>
            );
          })}
        </div>
      )}
      
   
      {/* 4. BANNER DE TEXTO */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div className="av-wrap w-full flex flex-col items-center justify-center text-center">
        
           {/* Header — nombre + icono */}
<div className="flex items-center gap-2 mb-2">
  <span className="text-lg">{iconoPersonaje}</span>
  <span style={{ color, fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
    {nombrePersonaje}
  </span>
</div>
          {!currentMsg && !loading && (
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: `${colorPrimario}99` }}>
              ◈ {nombreAgente} · AVISOS
            </p>
          )}
          {loading ? (
            <div className="av-loading"><span /><span /><span /></div>
          ) : (
            currentMsg && (
              <p className="av-texto">
                {display}<span className="av-cursor" style={{ opacity: cursor ? 1 : 0 }} />
              </p>
            )
          )}
        </div>
      </div>

      {/* 5. INPUT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        <AgentChatInput agent="evelyn" onSend={enviar} isLoading={loading} />
      </div>
    </div>
  );
}
