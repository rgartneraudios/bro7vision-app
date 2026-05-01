import React, { useRef } from 'react';
import { CHANNELS, FASES, TURNOS, buildVideoName } from '../../data/citycodes';

const THUMBS_BASE = 'https://media.bro7vision.com/thumbs/';
const ACTIVE_STATES = ['EN_CASTING', 'EN_RODAJE', 'EN_DEBATE', 'LISTO_PARA_ESTRENO', 'EN_CARTELERA'];

const EscenarioCard = ({ slot, butacas, onSelectSlot }) => {
  const videoRef = useRef(null);

  const thumbSrc = `${THUMBS_BASE}${buildVideoName(
    slot.canal,
    slot.canal === 2 ? slot.fase : 0,
    slot.canal === 2 ? 0 : slot.turno,
    slot.dispositivo,
    '000'
  )}`;

  const slotButacas = butacas.filter(b => {
    if (!ACTIVE_STATES.includes(b.estado)) return false;
    if (slot.canal === 2) {
      return b.canal === 2 && b.fase_lunar === slot.fase && b.dispositivo === slot.dispositivo;
    }
    return b.canal === slot.canal && b.funcion === slot.turno && b.dispositivo === slot.dispositivo;
  });

  const ocupadoMundial  = slotButacas.some(b => b.cobertura === 'GIRA_MUNDIAL');
  const ocupadoNacional = slotButacas.some(b => b.cobertura === 'GIRA_NACIONAL');
  const ciudadesOcupadas = new Set(
    slotButacas.filter(b => b.ciudad_codigo).map(b => b.ciudad_codigo)
  );
  const ciudadesLibres = 158 - ciudadesOcupadas.size;
  const pocosCiudades  = ciudadesLibres > 0 && ciudadesLibres <= 20;

  const Badge = ({ label, ocupado, pulsar, onClick }) => (
    <button
      onClick={ocupado ? undefined : onClick}
      disabled={ocupado}
      className={`text-[7px] px-1.5 py-[3px] rounded font-bold uppercase tracking-tight border transition-all ${
        ocupado
          ? 'bg-red-950/40 text-red-500/60 border-red-900/30 cursor-default'
          : `bg-emerald-950/60 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/60 hover:text-emerald-200 cursor-pointer ${pulsar ? 'animate-pulse' : ''}`
      }`}
    >
      {ocupado ? `● ${label}` : `○ ${label}`}
    </button>
  );

  return (
    <div className="group bg-zinc-900 border border-white/5 rounded overflow-hidden hover:border-white/20 hover:shadow-[0_0_12px_rgba(255,255,255,0.04)] transition-all duration-200">

      {/* Video Thumb */}
      <div className="relative bg-black overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          src={thumbSrc}
          muted
          loop
          playsInline
          preload="none"
          className="w-full h-full object-cover opacity-50 group-hover:opacity-90 transition-opacity duration-300"
          onMouseEnter={() => {
            if (videoRef.current) {
              videoRef.current.load();
              videoRef.current.play();
            }
          }}
          onMouseLeave={() => {
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
          }}
        />
        {/* fallback gradient visible when video not loaded */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/60 to-zinc-950/80 pointer-events-none group-hover:opacity-0 transition-opacity duration-300" />

        <span className={`absolute top-1 right-1 text-[7px] font-bold px-1 py-[2px] rounded z-10 ${
          slot.dispositivo === 0
            ? 'bg-cyan-950/90 text-cyan-400'
            : 'bg-fuchsia-950/90 text-fuchsia-400'
        }`}>
          {slot.dispositivo === 0 ? 'PC' : 'MOB'}
        </span>

        <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white/40 bg-black/60 px-1 py-[2px] rounded z-10">
          CH{slot.canal}
        </span>
      </div>

      {/* Info */}
      <div className="p-2">
        <div className="text-[9px] font-bold text-white/90 truncate leading-tight">
          {CHANNELS[slot.canal]}
        </div>
        <div className="text-[8px] text-gray-500 truncate mt-0.5">
          {slot.canal === 2 ? FASES[slot.fase] : TURNOS[slot.turno]}
        </div>

        {/* Availability badges */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge
            label="MUNDIAL"
            ocupado={ocupadoMundial}
            pulsar={false}
            onClick={() => onSelectSlot({ slot, coberturaInicial: 'GIRA_MUNDIAL' })}
          />
          <Badge
            label="NACIONAL"
            ocupado={ocupadoNacional}
            pulsar={false}
            onClick={() => onSelectSlot({ slot, coberturaInicial: 'GIRA_NACIONAL' })}
          />
          <Badge
            label={ciudadesLibres === 0 ? 'LLENO' : `${ciudadesLibres} CIUDADES`}
            ocupado={ciudadesLibres === 0}
            pulsar={pocosCiudades}
            onClick={() => onSelectSlot({ slot, coberturaInicial: 'SALA_CIUDAD' })}
          />
        </div>
      </div>
    </div>
  );
};

export default EscenarioCard;
