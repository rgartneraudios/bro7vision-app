import React from 'react';

export default function WikiBroAcordeon({ resultados = [], onClose, isMobile }) {
  const style = {
    acordeon: isMobile
      ? {
          position: 'static', width: '100%', height: 'auto',
          padding: '24px 20px', borderRadius: 12, overflow: 'hidden',
        }
      : {
          position: 'fixed', left: '50%', top: '12vh',
          transform: 'translateX(-50%)',
          width: '900px', maxHeight: '80vh',
          overflowY: 'auto', zIndex: 9999,
          padding: '24px 28px', borderRadius: 16,
          animation: 'cascadaAcordeon 1.1s cubic-bezier(0.22,1,0.36,1)',
          border: '1px solid rgba(0,255,200,0.25)',
        },
  };

  return (
    <>
      <style>{`
        @keyframes cascadaAcordeon {
          from { transform: translate(-50%, -40px); opacity: 0; }
          to   { transform: translate(-50%, 0);     opacity: 1; }
        }
        .wb-acordeon { position: relative; background: rgba(13,15,20,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .wb-acordeon::before {
          content: '';
          position: absolute; inset: 0;
          background: url('/images/galaxys_bg.webp') center/cover no-repeat;
          opacity: 0.12;
          border-radius: 16px;
          z-index: 0;
        }
        .wb-content { position: relative; z-index: 1; }
        .wb-acordeon::-webkit-scrollbar { width: 4px; }
        .wb-acordeon::-webkit-scrollbar-track { background: transparent; }
        .wb-acordeon::-webkit-scrollbar-thumb { background: rgba(0,255,200,0.30); border-radius: 99px; }
      `}</style>

      <div className="wb-acordeon" style={style.acordeon}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14, color: '#e2e8f0',
            fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10,
          }}
        >
          ✕
        </button>

        <div className="wb-content">
          <p style={{
            color: '#00b8ff', fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 800, fontSize: 11, letterSpacing: '0.25em',
            textTransform: 'uppercase', marginBottom: 16,
          }}>
            📋 WIKIBRO · {resultados.length} RESULTADO{resultados.length !== 1 ? 'S' : ''}
          </p>

          {resultados.length === 0 && (
            <p style={{ color: '#94a3b8', fontFamily: 'system-ui, sans-serif', fontSize: 14 }}>
              No hay registros para esta búsqueda todavía.
            </p>
          )}

          {resultados.map((item) => (
            <div
              key={item.id}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '14px 0',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>
                  {item.nombre}
                </span>
                {item.tiene_brocupon && (
                  <span style={{
                    marginLeft: 'auto', color: '#00b8ff', fontSize: 12, fontWeight: 700,
                  }}>
                    🟡 BroCupón activo
                  </span>
                )}
              </div>

              <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0' }}>
                {item.direccion || 'Dirección no especificada'} {item.barrio ? `· ${item.barrio}` : ''}
              </p>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: '2px 0 0' }}>
                {item.telefono ? `📞 ${item.telefono}` : ''} {item.horario ? `· 🕐 ${item.horario}` : ''}
              </p>

              {item.tiene_brocupon && item.cupon_descripcion && (
                <p style={{
                  color: '#00b8ff', fontSize: 13, fontStyle: 'italic',
                  marginTop: 6,
                }}>
                  "{item.cupon_descripcion}"
                </p>
              )}

              <span style={{
                display: 'inline-block', marginTop: 6, fontSize: 10,
                color: item.verificado ? '#4ade80' : '#cbd5e1',
                letterSpacing: '0.05em',
              }}>
                {item.fuente === 'OFICIAL' || item.fuente === 'OPENSTREETMAP' ? '🟢 OFICIAL' : '⚪ COMUNIDAD'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}