// src/components/AvisoPreviewCard.jsx
// Banner de confirmación de aviso — aparece encima de EvelynBanner
// cuando Evelyn tiene los 4 datos y espera que el user escriba CONFIRMO

import { useState, useEffect } from 'react';

const ALCANCE_LABEL = {
  local:   { icon: '📍', texto: 'Local'        },
  españa:  { icon: '🇪🇸', texto: 'Toda España'  },
  global:  { icon: '🌐', texto: 'Global'        },
};

const TIPO_COLOR = {
  OFERTA:   { text: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', glow: 'rgba(52,211,153,0.3)' },
  DEMANDA:  { text: 'text-blue-400',    border: 'border-blue-500/40',    bg: 'bg-blue-500/10',    glow: 'rgba(59,130,246,0.3)' },
  SERVICIO: { text: 'text-fuchsia-400', border: 'border-fuchsia-500/40', bg: 'bg-fuchsia-500/10', glow: 'rgba(217,70,239,0.3)' },
};

export default function AvisoPreviewCard({ aviso, visible = true }) {
  const [show, setShow] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (visible && aviso) {
      setTimeout(() => setShow(true), 80);
      // Pulso neón periódico
      const t = setInterval(() => {
        setPulse(p => !p);
      }, 1800);
      return () => clearInterval(t);
    } else {
      setShow(false);
    }
  }, [visible, aviso]);

  if (!aviso) return null;

  const tipo   = (aviso.tipo || 'DEMANDA').toUpperCase();
  const c      = TIPO_COLOR[tipo] || TIPO_COLOR.DEMANDA;
  const alcance = ALCANCE_LABEL[aviso.alcance] || ALCANCE_LABEL.local;

  return (
    <>
      <style>{`
        @keyframes avisoIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes neonPulseAviso {
          0%, 100% { box-shadow: 0 0 18px rgba(30,58,138,0.5), 0 0 40px rgba(30,58,138,0.2), inset 0 0 12px rgba(0,0,0,0.4); }
          50%       { box-shadow: 0 0 28px rgba(30,58,138,0.8), 0 0 60px rgba(30,58,138,0.35), inset 0 0 12px rgba(0,0,0,0.4); }
        }
        @keyframes scanLine {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 0.4; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(400%); opacity: 0; }
        }
        @keyframes confirmoHint {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        .aviso-wrap {
          background: rgba(0,0,0,0.82);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(30,58,138,0.6);
          border-radius: 1.25rem;
          padding: 18px 24px 20px;
          position: relative;
          overflow: hidden;
          animation: avisoIn 0.4s ease both, neonPulseAviso 3s ease-in-out infinite;
        }
        .aviso-scanline {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(30,58,138,0.6), transparent);
          animation: scanLine 3s ease-in-out infinite;
          pointer-events: none;
        }
        .confirmo-hint {
          animation: confirmoHint 2s ease-in-out infinite;
        }
      `}</style>

      <div
        className="w-full"
        style={{
          opacity:    show ? 1 : 0,
          transform:  show ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}
      >
        <div className="aviso-wrap">

          {/* Línea de scan */}
          <div className="aviso-scanline" />

          {/* Esquina decorativa */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '60px', height: '60px',
            background: 'linear-gradient(225deg, rgba(30,58,138,0.3) 0%, transparent 60%)',
            borderBottomLeftRadius: '100%',
          }} />

          {/* Header — tipo + alcance */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${c.text} ${c.border} ${c.bg}`}
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                {tipo}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {alcance.icon} {alcance.texto}
                {aviso.alcance === 'local' && aviso.ciudad && (
                  <span className="text-gray-600"> · {aviso.ciudad}</span>
                )}
              </span>
            </div>

            {/* Coste */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-blue-400 font-black"
                style={{ fontFamily: "'Orbitron', monospace" }}>
                200
              </span>
              <span className="text-[9px] text-gray-500 uppercase tracking-widest">génesis</span>
            </div>
          </div>

          {/* Título */}
          <p
            className="text-white font-black text-base mb-2 leading-snug"
            style={{ fontFamily: "'Orbitron', 'Courier New', monospace", letterSpacing: '0.05em' }}
          >
            {aviso.titulo}
          </p>

          {/* Contenido */}
          <p className="text-gray-300 text-xs leading-relaxed mb-4">
            {aviso.contenido}
          </p>

          {/* Separador */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(30,58,138,0.6), transparent)',
            marginBottom: '14px',
          }} />

          {/* Instrucción CONFIRMO */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-500 italic">
              Revisa que todo esté correcto antes de confirmar.
            </p>
            <div className="confirmo-hint flex items-center gap-2">
              <span
                className="text-blue-300 font-black text-sm tracking-widest"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                CONFIRMO
              </span>
              <span className="text-[10px] text-gray-600">para publicar</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}