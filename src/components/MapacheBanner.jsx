// src/components/MapacheBanner.jsx
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useAudioContext } from '../context/AudioContext';
import { useAgentChat } from '../hooks/useAgentChat';

const MapacheBanner = forwardRef(function MapacheBanner({
  personaje = 'mapache',  
  realItems = [],         
  onInvokeOsos,           
  onInvokeNova,           
  onOpenProfile,
  onTuneIn,
  onTuneTuner,
  onStopTuner, 
}, ref) {

  const { playChannel, stopAudio } = useAudioContext();

  const [display, setDisplay]       = useState('');
  const [cursor, setCursor]         = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const charIdx                     = useRef(0);

  // ── 1. INSTANCIAMOS EL CEREBRO PORT SYSTEM ──────────────────────────
  const { mensaje, bolas, loading, enviar } = useAgentChat({
  mode: 'mapache',
  realItems, 
  contextData: { personaje },
  
  onHandoff: ({ accion, objetivo, tipo, agente }) => {
  if (agente === 'NOVA') { onInvokeNova?.(); return; }
  if (agente === 'OSOS') { onInvokeOsos?.(); return; }

  if (accion === 'REPRODUCIR' && objetivo) {

    if (tipo === 'TUNER') {
      onTuneTuner?.(Number(objetivo));

    } else {
      // LIVES — busca en realItems
      const canal = realItems.find(c => 
        String(c.bro_id) === String(objetivo) || 
        c.alias?.toLowerCase() === objetivo?.toLowerCase()
      );
      console.log('🎧 LIVES — buscando:', objetivo, '→', canal);
      if (canal) onTuneIn?.(canal);
    }

  } else if (accion === 'STOP') {
    onStopTuner?.();
    onTuneIn?.(null);
  }
}
});
  // ── Exponer sendMessage al padre ──────────────────────────────────
  useImperativeHandle(ref, () => ({
    sendMessage: (text) => enviar(text),
  }));

  // ── Cursor parpadeante ──────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  // ── Sincronizar mensaje de la IA ────────────────────────────────────
  useEffect(() => {
    if (mensaje) setCurrentMsg(mensaje);
  }, [mensaje]);

  // ── Máquina de escribir (Estilo Nova) ───────────────────────────────
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
    <>
      <style>{`
        @keyframes neonPulseMapache {
          0%, 100% { text-shadow: 0 0 8px #00d0ff, 0 0 22px #0088aa, 0 0 45px #0088aa; }
          50%       { text-shadow: 0 0 4px #0088aa, 0 0 10px #0088aa; }
        }
        @keyframes mpDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes floatBolaCyan {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-5px) scale(1.05); }
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
          color: #00d0ff;
          font-style: italic;
          font-weight: 900;
          text-transform: uppercase;
          font-size: clamp(13px, 2.2vw, 18px);
          line-height: 1.5;
          min-height: 3em;
          animation: neonPulseMapache 3s ease-in-out infinite;
        }
        .mp-cursor {
          display: inline-block;
          width: 3px;
          height: 0.8em;
          margin-left: 3px;
          vertical-align: middle;
          background: #00d0ff;
          box-shadow: 0 0 8px #00d0ff;
        }
        .mp-bola {
          background: radial-gradient(circle at 35% 35%, #00d0ff, #007799);
          border: 2px solid #00d0ff;
          color: #000;
          box-shadow: 0 0 20px rgba(0,208,255,0.5), inset 0 0 10px rgba(255,255,255,0.2);
        }
        .mp-loading {
          display: inline-flex;
          gap: 4px;
          align-items: center;
        }
        .mp-loading span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00d0ff;
          animation: mpDot 1.2s ease-in-out infinite;
        }
        .mp-loading span:nth-child(2) { animation-delay: 0.2s; }
        .mp-loading span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div className="w-full flex flex-col items-center gap-3 px-4 pointer-events-auto">

        {/* BANNER PRINCIPAL (Estructura idéntica a Nova) */}
        <div className="mp-wrap w-full flex flex-col items-center justify-center text-center">
          {!currentMsg && !loading && (
            <p className="text-cyan-500/60 text-xs uppercase tracking-widest font-bold">
              ◈ {personaje === 'chica_gamer' ? 'AMI' : 'MAPACHE'} · AUDIO DISPATCHER
            </p>
          )}

          {loading ? (
            <div className="mp-loading">
              <span /><span /><span />
            </div>
          ) : (
            currentMsg && (
              <p className="mp-texto">
                {display}
                <span className="mp-cursor" style={{ opacity: cursor ? 1 : 0 }} />
              </p>
            )
          )}
        </div>

        {/* BOLAS DE RESPUESTA (Estructura idéntica a Nova) */}
        {!loading && bolas && bolas.length > 0 && (
         <div className="flex gap-3 flex-wrap justify-center max-w-2xl pointer-events-auto">
            {bolas.map((bola, i) => (
              <button
                key={i}
                onClick={() => enviar(bola.texto)}
                className="mp-bola px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                style={{
                  animation: `floatBolaCyan ${1.8 + i * 0.3}s ease-in-out infinite`,
                }}
              >
                {bola.texto}
              </button>
            ))}
          </div>
        )}

      </div>
    </>
  );
});

export default MapacheBanner;