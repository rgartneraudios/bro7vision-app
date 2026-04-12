// src/components/AvisoPreviewCard.jsx
// v3 — Diseño imponente cyberpunk para sector Avisos
// Ocupa el espacio central libre sobre EvelynBanner

import { useState, useEffect } from 'react';

const ALCANCE_LABEL = {
  local:   { icon: '◈', texto: 'Local'        },
  españa:  { icon: '◉', texto: 'Toda España'  },
  global:  { icon: '◎', texto: 'Global'        },
};

const TIPO_CONFIG = {
  OFERTA:  { 
    color: '#00FF9C', glow: 'rgba(12,14,194,0.4)', 
    border: 'rgba(22,25,250,0.3)', label: 'OFERTA' 
  },
  DEMANDA: { 
    color: '#00C3FF', glow: 'rgba(12,14,194,0.4)', 
    border: 'rgba(22,25,250,0.3)', label: 'DEMANDA' 
  },
};

export default function AvisoPreviewCard({ aviso, visible = true, esperandoConfirmar = false }) {
  const [show,  setShow]  = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (visible && aviso) {
      setTimeout(() => setShow(true), 80);
      const t = setInterval(() => setPulse(p => !p), 2000);
      return () => clearInterval(t);
    } else {
      setShow(false);
    }
  }, [visible, aviso]);

  if (!aviso) return null;

  const tipo    = (aviso.tipo || 'DEMANDA').toUpperCase();
  const c       = TIPO_CONFIG[tipo] || TIPO_CONFIG.DEMANDA;
  const alcance = ALCANCE_LABEL[aviso.alcance] || ALCANCE_LABEL.local;

  // Campos completados para la barra de progreso visual
  const campos = [
    { key: 'tipo',      label: 'TIPO',      done: !!aviso.tipo },
    { key: 'titulo',    label: 'TÍTULO',    done: !!aviso.titulo },
    { key: 'contenido', label: 'DESC',      done: !!aviso.contenido },
    { key: 'alcance',   label: 'ALCANCE',   done: !!aviso.alcance },
  ];
  const completados = campos.filter(f => f.done).length;
  const pct = Math.round((completados / campos.length) * 100);

  return (
    <>
      <style>{`
        @keyframes avisoEntrada {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scanH {
          0%   { transform: translateY(0%);    opacity: 0; }
          5%   { opacity: 0.6; }
          95%  { opacity: 0.6; }
          100% { transform: translateY(1800%); opacity: 0; }
        }
        @keyframes cornerPulse {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }
        @keyframes glitchSlice {
          0%, 94%, 100% { clip-path: none; transform: none; }
          95% { clip-path: polygon(0 30%, 100% 30%, 100% 32%, 0 32%); transform: translateX(4px); }
          96% { clip-path: polygon(0 60%, 100% 60%, 100% 62%, 0 62%); transform: translateX(-3px); }
          97% { clip-path: none; transform: none; }
        }
        @keyframes confirmoFlash {
          0%, 100% { opacity: 0.7; letter-spacing: 0.3em; }
          50%      { opacity: 1;   letter-spacing: 0.5em; }
        }
        @keyframes barFill {
          from { width: 0%; }
          to   { width: ${pct}%; }
        }
        .aviso-card {
          position: relative;
          background: rgba(0, 0, 8, 0.88);
          backdrop-filter: blur(20px);
          border: 1px solid ${c.border};
          border-radius: 1.5rem;
          overflow: hidden;
          animation: avisoEntrada 0.5s cubic-bezier(0.16,1,0.3,1) both;
          box-shadow: 
            0 0 40px ${c.glow},
            0 0 80px rgba(0,0,0,0.6),
            inset 0 0 30px rgba(0,0,0,0.5);
        }
        .aviso-scan {
          position: absolute;
          left: 0; right: 0; top: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent 0%, ${c.color}88 30%, 
            ${c.color} 50%, ${c.color}88 70%, transparent 100%);
          animation: scanH 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 10;
        }
        .aviso-corner {
          position: absolute;
          width: 20px; height: 20px;
          animation: cornerPulse 2s ease-in-out infinite;
        }
        .aviso-corner-tl { top: 12px; left: 12px; 
          border-top: 2px solid ${c.color}; 
          border-left: 2px solid ${c.color}; }
        .aviso-corner-tr { top: 12px; right: 12px;
          border-top: 2px solid ${c.color};
          border-right: 2px solid ${c.color}; }
        .aviso-corner-bl { bottom: 12px; left: 12px;
          border-bottom: 2px solid ${c.color};
          border-left: 2px solid ${c.color}; }
        .aviso-corner-br { bottom: 12px; right: 12px;
          border-bottom: 2px solid ${c.color};
          border-right: 2px solid ${c.color}; }
        .aviso-tipo-badge {
          font-family: 'Orbitron', 'Courier New', monospace;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.3em;
          color: ${c.color};
          text-shadow: 0 0 12px ${c.glow};
          padding: 6px 16px;
          border: 1px solid ${c.border};
          border-radius: 2rem;
          background: ${c.color}11;
        }
        .aviso-titulo {
          font-family: 'Orbitron', 'Courier New', monospace;
          font-size: clamp(18px, 3vw, 28px);
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 0.04em;
          line-height: 1.2;
          text-shadow: 0 0 20px rgba(255,255,255,0.3);
          animation: glitchSlice 8s ease-in-out infinite;
        }
        .aviso-contenido {
          font-size: clamp(13px, 1.6vw, 15px);
          color: rgba(200, 220, 255, 0.75);
          line-height: 1.7;
          font-family: 'Courier New', monospace;
        }
        .aviso-campo-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          transition: all 0.4s ease;
        }
        .aviso-bar-track {
          height: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .aviso-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, ${c.color}88, ${c.color});
          border-radius: 2px;
          width: ${pct}%;
          transition: width 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .aviso-confirmo {
          font-family: 'Orbitron', 'Courier New', monospace;
          font-size: clamp(14px, 2vw, 18px);
          font-weight: 900;
          color: ${c.color};
          text-shadow: 0 0 20px ${c.glow}, 0 0 40px ${c.glow};
          animation: confirmoFlash 1.5s ease-in-out infinite;
        }
        .aviso-genesis {
          font-family: 'Orbitron', monospace;
          font-size: 13px;
          font-weight: 900;
          color: #FFD700;
          text-shadow: 0 0 10px rgba(255,215,0,0.5);
        }
        .aviso-alcance {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }
        .aviso-divider {
          height: 1px;
          background: linear-gradient(90deg, 
            transparent, ${c.border}, transparent);
        }
      `}</style>

      <div
        style={{
          opacity:    show ? 1 : 0,
          transform:  show ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          width: '100%',
        }}
      >
        <div className="aviso-card">

          {/* Scan line */}
          <div className="aviso-scan" />

          {/* Esquinas decorativas */}
          <div className="aviso-corner aviso-corner-tl" />
          <div className="aviso-corner aviso-corner-tr" />
          <div className="aviso-corner aviso-corner-bl" />
          <div className="aviso-corner aviso-corner-br" />

          {/* Contenido principal */}
          <div style={{ padding: '32px 36px 28px' }}>

            {/* Header — tipo + alcance + coste */}
            <div style={{ 
              display: 'flex', alignItems: 'center', 
              justifyContent: 'space-between', marginBottom: '20px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {aviso.tipo && (
                  <span className="aviso-tipo-badge">{c.label}</span>
                )}
                {aviso.alcance && (
                  <span className="aviso-alcance">
                    {alcance.icon} {alcance.texto}
                    {aviso.alcance === 'local' && aviso.ciudad && (
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {' '}· {aviso.ciudad}
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="aviso-genesis">200</span>
                <span style={{ 
                  fontSize: '10px', color: 'rgba(255,215,0,0.5)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  fontFamily: 'monospace'
                }}>génesis</span>
              </div>
            </div>

            {/* Título */}
            {aviso.titulo ? (
              <p className="aviso-titulo" style={{ marginBottom: '16px' }}>
                {aviso.titulo}
              </p>
            ) : (
              <div style={{
                height: '32px', marginBottom: '16px',
                background: `${c.color}08`,
                border: `1px dashed ${c.border}`,
                borderRadius: '8px',
              }} />
            )}

            {/* Divider */}
            <div className="aviso-divider" style={{ marginBottom: '16px' }} />

            {/* Contenido */}
            {aviso.contenido ? (
              <p className="aviso-contenido" style={{ marginBottom: '24px' }}>
                {aviso.contenido}
              </p>
            ) : (
              <div style={{
                height: '52px', marginBottom: '24px',
                background: `${c.color}05`,
                border: `1px dashed ${c.border}`,
                borderRadius: '8px',
              }} />
            )}

            {/* Barra de progreso */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {campos.map(({ key, label, done }) => (
                    <div key={key} style={{ 
                      display: 'flex', alignItems: 'center', gap: '5px' 
                    }}>
                      <div className="aviso-campo-dot" style={{
                        background: done ? c.color : 'rgba(255,255,255,0.1)',
                        boxShadow: done ? `0 0 6px ${c.glow}` : 'none',
                      }} />
                      <span style={{
                        fontSize: '9px', fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        fontFamily: 'monospace',
                        color: done ? c.color : 'rgba(255,255,255,0.2)',
                        transition: 'color 0.3s ease',
                      }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <span style={{
                  fontSize: '10px', fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em',
                }}>
                  {pct}%
                </span>
              </div>
              <div className="aviso-bar-track">
                <div className="aviso-bar-fill" />
              </div>
            </div>

            {/* Divider */}
            <div className="aviso-divider" style={{ marginBottom: '16px' }} />

            {/* Confirmo o instrucción */}
            <div style={{ 
              display: 'flex', alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              {esperandoConfirmar ? (
                <>
                  <span style={{
                    fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                    fontFamily: 'monospace', letterSpacing: '0.05em',
                  }}>
                    Revisa y confirma para publicar
                  </span>
                  <span className="aviso-confirmo">CONFIRMO</span>
                </>
              ) : (
                <span style={{
                  fontSize: '11px', color: 'rgba(255,255,255,0.25)',
                  fontFamily: 'monospace', letterSpacing: '0.05em',
                  fontStyle: 'italic',
                }}>
                  Completando aviso campo a campo...
                </span>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

