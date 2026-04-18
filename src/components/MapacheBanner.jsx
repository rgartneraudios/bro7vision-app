// src/components/MapacheBanner.jsx
// Todo incluido: Banner + Input + Carrusel. Sin bolas. Sin forwardRef.

import React, { useState, useEffect, useRef } from 'react';
import { useAudioContext } from '../context/AudioContext';
import { useAgentChat } from '../hooks/useAgentChat';
import AgentChatInput from './AgentChatInput'; 
import BroCardStrip from './BroCardStrip';     

const GREETINGS_MAPACHE = [
  "Mapache en cabina. ¿Qué ritmo buscamos hoy? 🎧",
  "Soy Mapache. Pon Play a lo que necesites.",
  "Aquí Mapache. Ajustando frecuencias... ¿Qué quieres escuchar?",
];

const GREETINGS_AMI = [
  "Ami al micrófono. ¿Qué historia sonora descubrimos hoy? 🎙️",
  "Soy Ami. El dial está abierto para ti.",
  "Ami lista. Dime qué buscas en el dial.",
];

export default function MapacheBanner({
  personaje = 'mapache',
  realItems = [],
  stripVisible,
  stripCards,
  stripLabel,
  
  findChannelByAlias,
  checkIfNew,
  onInvokeOsos,
  onInvokeNova,
  onOpenProfile,
  onTuneIn,
  onTuneTuner,
  onStopTuner,
}) {
  const { playChannel, stopAudio } = useAudioContext();

  const [display, setDisplay] = useState('');
  const [cursor, setCursor] = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx = useRef(0);

  const esAmi = personaje === 'ami' || personaje === 'chica_gamer';
  const nombreAgente = esAmi ? 'AMI' : 'MAPACHE';
  const GREETINGS = esAmi ? GREETINGS_AMI : GREETINGS_MAPACHE;
  const color = '#00D0FF'; 

  // ── Hook del Bot (Ya no extraemos "bolas") ──────────────────────────────
 const { mensaje, loading, enviar } = useAgentChat({
  mode: 'mapache',
  realItems,
  contextData: { personaje },
  onHandoff: ({ agente, codigo }) => {

    // ── Externos ──────────────────────────────────────────────
    if (agente === 'OSOS') { onInvokeOsos?.(); return; }

    // ── Play canal ────────────────────────────────────────────
    if (agente === 'AUDIO_PLAY' && codigo) {
      const canal = realItems.find(c =>
        String(c.bro_aud) === String(codigo) ||
        String(c.bro_pod) === String(codigo) ||
        String(c.bro_id)  === String(codigo) ||
        c.alias?.toLowerCase() === String(codigo).toLowerCase()
      );
      if (canal) onTuneIn?.(canal);
      return;
    }

    // ── Stop ──────────────────────────────────────────────────
    if (agente === 'AUDIO_STOP') {
      onStopTuner?.();
      onTuneIn?.(null);
      return;
    }

    // ── Tuner directo ─────────────────────────────────────────
    if (agente === 'AUDIO_TUNER' && codigo) {
      onTuneTuner?.(Number(codigo));
      return;
    }
  }
});

  // ── Efectos Visuales ────────────────────────────────────────────────────
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

  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
      <style>{`
        @keyframes neonPulseMapache {
          0%, 100% { text-shadow: 0 0 8px ${color}, 0 0 22px #0088aa, 0 0 45px #0088aa; }
          50%       { text-shadow: 0 0 4px #0088aa, 0 0 10px #0088aa; }
        }
        @keyframes mpDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
        
        .mp-wrap {
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,208,255,0.30);
          border-radius: 2rem;
          padding: 18px 32px 20px 32px;
          box-shadow: 0 0 24px rgba(0,208,255,0.2), inset 0 0 12px rgba(0,0,0,0.4);
          min-height: 90px;
        }
        .mp-texto {
          color: ${color};
          font-style: italic; font-weight: 900; text-transform: uppercase;
          font-size: clamp(13px, 2.2vw, 18px); line-height: 1.5; min-height: 3em;
          animation: neonPulseMapache 3s ease-in-out infinite;
        }
        .mp-cursor {
          display: inline-block; width: 3px; height: 0.8em; margin-left: 3px;
          vertical-align: middle; background: ${color}; box-shadow: 0 0 8px ${color};
        }
        .mp-loading { display: inline-flex; gap: 4px; align-items: center; }
        .mp-loading span {
          width: 6px; height: 6px; border-radius: 50%; background: ${color};
          animation: mpDot 1.2s ease-in-out infinite;
        }
        .mp-loading span:nth-child(2) { animation-delay: 0.2s; }
        .mp-loading span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* 1. CARRUSEL DE RADIOS / PODCASTS */}
      {stripVisible && (
        <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
          <BroCardStrip 
            cards={stripCards} 
            onSelectCard={(card) => enviar(`${card.bro_id}D`)} 
            accentColor="cyan" 
            label={stripLabel} 
            visible={stripVisible} 
          />
        </div>
      )}

      {/* 2. BANNER DE TEXTO MAPACHE/AMI */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div className="mp-wrap w-full flex flex-col items-center justify-center text-center">
          {!currentMsg && !loading && (
            <p className="text-cyan-500/60 text-xs uppercase tracking-widest font-bold">
              ◈ {nombreAgente} · AUDIO DISPATCHER
            </p>
          )}
          {loading ? (
             <div className="mp-loading"><span /><span /><span /></div>
          ) : (
            currentMsg && (
              <p className="mp-texto">
                {display}<span className="mp-cursor" style={{ opacity: cursor ? 1 : 0 }} />
              </p>
            )
          )}
        </div>
      </div>

      {/* 3. INPUT DE CHAT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        <AgentChatInput agent="mapache" onSend={enviar} isLoading={loading} />
      </div>

    </div>
  );
}