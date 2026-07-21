import React, { useRef } from 'react';
import { CHANNELS, FASES, TURNOS, buildVideoName } from '../../data/citycodes';

const THUMBS_BASE  = 'https://media.bro7vision.com/thumbs/';
const ACTIVE_STATES = ['EN_CASTING', 'EN_RODAJE', 'EN_DEBATE', 'LISTO_PARA_ESTRENO', 'EN_CARTELERA'];
const ORBITRON = "'Orbitron', monospace";

const EscenarioCard = ({ slot, butacas, onSelectSlot, role }) => {
  const videoRef = useRef(null);
  const isPC = slot.dispositivo === 0;

  const thumbSrc = `${THUMBS_BASE}${buildVideoName(
    slot.canal,
    slot.canal === 2 ? slot.fase : 0,
    slot.canal === 2 ? 0 : slot.turno,
    slot.dispositivo,
    '000'
  )}`;

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
  const pocosCiudades    = ciudadesLibres > 0 && ciudadesLibres <= 20;
  const semaforoColor = (() => {
    if (ocupadoMundial || ocupadoNacional) return '#dc2626';
    const ocupadoRegional = slotButacas.some(
      b => b.cobertura === 'GIRA_REGIONAL' || b.cobertura === 'GIRA_GRAN_REGIONAL'
    );
    if (ocupadoRegional) return '#f97316';
    if (ciudadesOcupadas.size > 0) return '#ca8a04';
    return '#16a34a';
  })();

  const isAdvertiser = role === 'advertiser';

  const BadgeProducer = ({ label, ocupado, pulsar, onClick }) => (
    <button
      onClick={ocupado ? undefined : onClick}
      disabled={ocupado}
      style={{ fontFamily: ORBITRON }}
      className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tight border transition-all ${
        ocupado
          ? 'bg-red-950/40 text-red-500/60 border-red-900/30 cursor-default'
          : `bg-fuchsia-950/60 text-fuchsia-400 border-fuchsia-900/40 hover:bg-fuchsia-900/60 hover:text-fuchsia-200 cursor-pointer ${pulsar ? 'animate-pulse' : ''}`
      }`}
    >
      {ocupado ? `● ${label}` : `● ${label}`}
    </button>
  );

  return (
    <div className={`group bg-zinc-900 border border-white/5 rounded overflow-hidden hover:border-white/25 hover:shadow-[0_0_16px_rgba(255,255,255,0.06)] transition-all duration-200 ${isAdvertiser ? 'cursor-pointer' : 'cursor-default'}`}>

      {/* Video — siempre contenedor 16/9; MOB usa video portrait centrado */}
      <div className="relative bg-black overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          src={thumbSrc}
          muted loop playsInline preload="none"
          className="opacity-40 group-hover:opacity-95 transition-opacity duration-300"
          style={isPC
            ? { width: '100%', height: '100%', objectFit: 'cover' }
            : { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', height: '100%', width: 'auto' }
          }
          onMouseEnter={() => { if (videoRef.current) { videoRef.current.load(); videoRef.current.play(); } }}
          onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}
        />

        {/* Badge dispositivo */}
        <span
          style={{ fontFamily: ORBITRON }}
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
          <div style={{ fontFamily: ORBITRON }} className="text-[11px] font-bold leading-snug">
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

      {/* Vista Productor */}
      {isAdvertiser && (
        <div className="px-2 py-2 flex items-center gap-2">
          <div className="flex flex-wrap gap-1 flex-1">
            <BadgeProducer
              label="MUNDIAL"  ocupado={ocupadoMundial}  pulsar={false}
              onClick={() => onSelectSlot({ slot, coberturaInicial: 'GIRA_MUNDIAL' })}
            />
            <BadgeProducer
              label="NACIONAL" ocupado={ocupadoNacional} pulsar={false}
              onClick={() => onSelectSlot({ slot, coberturaInicial: 'GIRA_NACIONAL' })}
            />
            <BadgeProducer
              label={ciudadesLibres === 0 ? 'LLENO' : `${ciudadesLibres} CIUDADES`}
              ocupado={ciudadesLibres === 0} pulsar={pocosCiudades}
              onClick={() => onSelectSlot({ slot, coberturaInicial: 'SALA_CIUDAD' })}
            />
          </div>

          {/* Semáforo geográfico — una esfera, 4 estados */}
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: semaforoColor, flexShrink: 0 }} />
        </div>
      )}
    </div>
  );
};

export default EscenarioCard;
