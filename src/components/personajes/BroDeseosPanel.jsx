import React from 'react';

const BADGE_CATEGORY = {
  'Electrodomésticos':          '#FF6B35',
  'Ropa y calzado':             '#E91E63',
  'Alimentación y restauración': '#4CAF50',
  'Salud y bienestar':          '#00BCD4',
  'Hogar y muebles':            '#FF9800',
  'Tecnología':                 '#2196F3',
  'Servicios profesionales':    '#9C27B0',
  'Ocio y viajes':              '#FF5722',
  'Otros':                      '#607D8B',
};

export default function BroDeseosPanel({
  resultados = [],
  onClose,
  isMobile,
  modo = 'listado',
  userId = null,
  onRenovar,
}) {
  const style = {
    panel: isMobile
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
          animation: 'cascadaPanel 1.1s cubic-bezier(0.22,1,0.36,1)',
          border: '1px solid rgba(0,153,255,0.25)',
        },
  };

  return (
    <>
      <style>{`
        @keyframes cascadaPanel {
          from { transform: translate(-50%, -40px); opacity: 0; }
          to   { transform: translate(-50%, 0);     opacity: 1; }
        }
        .bd-panel { position: relative; background: rgba(13,15,20,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .bd-panel::before {
          content: '';
          position: absolute; inset: 0;
          background: #0009AD; opacity: 0.25;
          border-radius: 16px;
          z-index: 0;
        }
        .bd-content { position: relative; z-index: 1; }
        .bd-panel::-webkit-scrollbar { width: 4px; }
        .bd-panel::-webkit-scrollbar-track { background: transparent; }
        .bd-panel::-webkit-scrollbar-thumb { background: rgba(0,153,255,0.30); border-radius: 99px; }
      `}</style>

      <div className="bd-panel" style={style.panel}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14, color: '#e2e8f0',
            fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10,
          }}
        >
          ✕
        </button>

        <div className="bd-content">
          <p style={{
            color: '#0099FF', fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 800, fontSize: 11, letterSpacing: '0.25em',
            textTransform: 'uppercase', marginBottom: 16,
          }}>
            {modo === 'misdeseos' ? '📋 MIS DESEOS' : `📋 BRODESEOS · ${resultados.length} RESULTADO${resultados.length !== 1 ? 'S' : ''}`}
          </p>

          {resultados.length === 0 && (
            <p style={{ color: '#94a3b8', fontFamily: 'system-ui, sans-serif', fontSize: 14 }}>
              No hay deseos registrados todavía.
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
                <span style={{
                  display: 'inline-block',
                  background: BADGE_CATEGORY[item.categoria] || '#607D8B',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 99,
                  letterSpacing: '0.05em',
                }}>
                  {item.categoria || 'Otros'}
                </span>
                {modo === 'listado' && (
                  <span style={{
                    color: '#64748b', fontSize: 11, fontFamily: 'monospace',
                    marginLeft: 'auto',
                  }}>
                    #{item.codigo_anonimo || `BD-${String(item.id).slice(0, 6).toUpperCase()}`}
                  </span>
                )}
              </div>

              <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15, margin: '8px 0 2px' }}>
                {item.descripcion || 'Sin descripción'}
              </p>

              <p style={{ color: '#94a3b8', fontSize: 13, margin: '2px 0' }}>
                {item.alcance ? `📍 ${item.alcance}` : ''}
                {item.caduca_en ? ` · 🕐 Caduca: ${item.caduca_en}` : ''}
              </p>

              {modo === 'misdeseos' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => onRenovar?.(item.id)}
                    style={{
                      background: 'rgba(0,153,255,0.15)', color: '#0099FF',
                      border: '1px solid rgba(0,153,255,0.3)',
                      borderRadius: 8, padding: '6px 16px',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Renovar (+29d)
                  </button>
                </div>
              )}

              <span style={{
                display: 'inline-block', marginTop: 6, fontSize: 10,
                color: item.activo ? '#4ade80' : '#cbd5e1',
                letterSpacing: '0.05em',
              }}>
                {item.activo ? '🟢 Activo' : '⚪ Expirado'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
