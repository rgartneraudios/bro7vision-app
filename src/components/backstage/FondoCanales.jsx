import React, { useRef, useEffect } from 'react';
import { CHANNELS, FASES, TURNOS } from '../../data/citycodes';

const ACTIVE_STATES = ['EN_CASTING', 'EN_RODAJE', 'EN_DEBATE', 'LISTO_PARA_ESTRENO', 'EN_CARTELERA'];
const NOTO = "'Noto Sans', sans-serif";

const CANAL_STRING = {
  1:'mercurio', 2:'luna', 3:'venus', 4:'tierra',
  5:'jupiter', 6:'marte', 7:'saturno', 8:'urano', 9:'neptuno'
};

const EscenarioCard = ({ slot, butacas, onContratar, role, miniaturaUrl }) => {
  const videoRef = useRef(null);
  const isPC = slot.dispositivo === 0;
  const thumbSrc = miniaturaUrl ?? null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !thumbSrc) return;
    video.load();
  }, [thumbSrc]);

  const slotButacas = butacas.filter(b => {
    if (!ACTIVE_STATES.includes(b.estado)) return false;
    if (slot.canal === 2)
      return b.canal === 2 && b.fase_lunar === slot.fase && b.funcion === slot.turno && b.dispositivo === slot.dispositivo;
    return b.canal === slot.canal && b.funcion === slot.turno && b.dispositivo === slot.dispositivo;
  });

  const ocupadoMundial   = slotButacas.some(b => b.cobertura === 'GIRA_MUNDIAL');
  const ocupadoNacional  = slotButacas.some(b => b.cobertura === 'GIRA_NACIONAL');
  const ciudadesOcupadas = new Set(slotButacas.filter(b => b.ciudad_codigo).map(b => b.ciudad_codigo));
  const ciudadesLibres   = 158 - ciudadesOcupadas.size;

  const isAdvertiser = role === 'advertiser';

  const slotId = `canal_${CANAL_STRING[slot.canal]}_${isPC ? 'pc' : 'movil'}_t${slot.turno}`;
  const ocupado = ocupadoMundial || ocupadoNacional;

  return (
    <div className={`group bg-zinc-900 border border-white/5 rounded overflow-hidden hover:border-white/25 hover:shadow-[0_0_16px_rgba(255,255,255,0.06)] transition-all duration-200 ${isAdvertiser ? 'cursor-pointer' : 'cursor-default'}`}>

      {/* Video — siempre contenedor 16/9; MOB usa video portrait centrado */}
      <div className="relative bg-black overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {thumbSrc && (
          <video
            ref={videoRef}
            src={thumbSrc}
            muted loop playsInline preload="metadata"
            className="opacity-40 group-hover:opacity-95 transition-opacity duration-300"
            style={isPC
              ? { width: '100%', height: '100%', objectFit: 'cover' }
              : { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', height: '100%', width: 'auto' }
            }
            onMouseEnter={() => { if (videoRef.current) { videoRef.current.load(); videoRef.current.play().catch(() => {}); } }}
            onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}
          />
        )}

        {/* Badge dispositivo */}
        <span
          style={{ fontFamily: NOTO }}
          className={`absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-[2px] rounded z-10 ${
            isPC ? 'bg-cyan-950/90 text-cyan-400' : 'bg-fuchsia-950/90 text-fuchsia-400'
          }`}
        >
          {isPC ? 'PC' : 'MT'}
        </span>

      </div>

      {/* Vista Montador */}
      {!isAdvertiser && (
        <div className="px-2 py-2 bg-zinc-900">
          <div style={{ fontFamily: NOTO }} className="text-[11px] font-bold leading-snug">
            {ocupadoMundial
              ? <span className="text-red-400">🔴 GLOBAL</span>
              : ocupadoNacional
              ? <span className="text-red-400">🔴 NACIONAL</span>
              : ciudadesOcupadas.size > 0
              ? <span className="text-yellow-400">🟡 LOCAL ({ciudadesOcupadas.size})</span>
              : <span className="text-emerald-400">🟢 LIBRE</span>
            }
          </div>
        </div>
      )}

      {/* Vista Productor — botón Contratar unificado */}
      {isAdvertiser && (
        <div className="px-2 py-2">
          <button
            onClick={() => onContratar(slotId)}
            disabled={ocupado}
            style={{ fontFamily: NOTO, fontWeight: 700 }}
            className={`w-full text-[10px] uppercase tracking-widest py-1.5 rounded border transition-all ${
              ocupado
                ? 'bg-red-950/40 text-red-500/60 border-red-900/30 cursor-not-allowed'
                : 'bg-fuchsia-950/60 text-fuchsia-400 border-fuchsia-900/40 hover:bg-fuchsia-900/60 hover:text-fuchsia-200'
            }`}
          >
            {ocupado ? 'OCUPADO' : 'CONTRATAR'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EscenarioCard;
