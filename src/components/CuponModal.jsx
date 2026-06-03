// src/components/CuponModal.jsx
// ─────────────────────────────────────────────────────────────────────
// Popup de 3 estados:
//   confirmando → "¿Canjear X génesis por Y% en Z?"
//   cargando    → spinner
//   exito       → código generado + botón ir al Mini
//   error       → mensaje de error
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';

const RAREZA_COLOR = {
  15: { color: '#d0d4e8', glow: 'rgba(200,205,225,0.6)', label: 'PLATA'  },
  20: { color: '#7aacff', glow: 'rgba(80,130,255,0.6)',  label: 'ZAFIRO' },
  25: { color: '#ffd060', glow: 'rgba(255,200,50,0.6)',  label: 'GOLD'   },
};

export default function CuponModal({
  estado,
  cardPendiente,
  cuponActivo,
  errorMsg,
  genesisBalance,
  onConfirmar,
  onCancelar,
  onCerrar,
}) {
  const [copiado, setCopiado] = useState(false);

  if (estado === 'idle') return null;

  const r = RAREZA_COLOR[cardPendiente?.descuento_pct || cuponActivo?.descuento_pct] || RAREZA_COLOR[15];

  const copiarCodigo = () => {
    if (!cuponActivo?.codigo) return;
    navigator.clipboard.writeText(cuponActivo.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={estado === 'confirmando' ? onCancelar : onCerrar}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 200,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201,
        width: '320px',
        borderRadius: '20px',
        background: 'rgba(28,28,32,0.97)',
        border: `1px solid ${r.color}55`,
        boxShadow: `0 0 40px ${r.glow}, 0 8px 32px rgba(0,0,0,0.9)`,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        fontFamily: "'Orbitron', monospace",
      }}>

        {/* ── CONFIRMANDO ── */}
        {estado === 'confirmando' && cardPendiente && (
          <>
            <div style={{ fontSize: '28px' }}>
              {cardPendiente.descuento_pct === 25 ? '🥇' : cardPendiente.descuento_pct === 20 ? '💎' : '🥈'}
            </div>

            <div style={{
              fontSize: '11px', fontWeight: 700,
              color: r.color, letterSpacing: '2px',
              textTransform: 'uppercase',
              textShadow: `0 0 12px ${r.glow}`,
            }}>
              {r.label} · {cardPendiente.descuento_pct}% descuento
            </div>

            <div style={{
              fontSize: '13px', fontWeight: 700,
              color: '#e8f4ff', letterSpacing: '1px',
              textAlign: 'center', lineHeight: 1.4,
            }}>
              {cardPendiente.nombre}
            </div>

            <div style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <Row label="Descuento" value={`${cardPendiente.descuento_pct}%`} color={r.color} />
              <Row label="Condición" value={cardPendiente.condicion || '1 producto'} />
              <Row label="Coste"     value={`${cardPendiente.coste_genesis?.toLocaleString()} ✦`} color="#39ff14" />
              <Row label="Tu saldo"  value={`${genesisBalance?.toLocaleString()} ✦`} />
              <Row
                label="Tras canje"
                value={`${((genesisBalance || 0) - cardPendiente.coste_genesis).toLocaleString()} ✦`}
                color={(genesisBalance || 0) - cardPendiente.coste_genesis < 0 ? '#ff4444' : '#e8f4ff'}
              />
            </div>

            <div style={{
              fontSize: '9px', color: 'rgba(232,244,255,0.4)',
              letterSpacing: '0.5px', textAlign: 'center',
            }}>
              Válido hasta cambio de fase lunar
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                onClick={onCancelar}
                style={btnStyle('rgba(255,255,255,0.06)', 'rgba(255,255,255,0.2)', '#9094a8')}
              >
                CANCELAR
              </button>
              <button
                onClick={onConfirmar}
                disabled={(genesisBalance || 0) < cardPendiente.coste_genesis}
                style={btnStyle(
                  `${r.color}22`, r.color, r.color,
                  (genesisBalance || 0) < cardPendiente.coste_genesis
                )}
              >
                CANJEAR
              </button>
            </div>
          </>
        )}

        {/* ── CARGANDO ── */}
        {estado === 'cargando' && (
          <>
            <div style={{ fontSize: '32px', animation: 'spinCupon 1s linear infinite' }}>✦</div>
            <div style={{ fontSize: '11px', color: '#9094a8', letterSpacing: '2px' }}>
              GENERANDO CUPÓN...
            </div>
            <style>{`
              @keyframes spinCupon {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
            `}</style>
          </>
        )}

        {/* ── ÉXITO ── */}
        {estado === 'exito' && cuponActivo && (
          <>
            <div style={{ fontSize: '28px' }}>
              {cuponActivo.ya_existia ? '📋' : '✅'}
            </div>

            <div style={{
              fontSize: '11px', fontWeight: 700,
              color: r.color, letterSpacing: '2px',
              textTransform: 'uppercase',
              textShadow: `0 0 12px ${r.glow}`,
            }}>
              {cuponActivo.ya_existia ? 'YA TENÍAS ESTE CUPÓN' : '¡CUPÓN GENERADO!'}
            </div>

            <div style={{
              fontSize: '12px', color: '#e8f4ff',
              letterSpacing: '1px', textAlign: 'center',
            }}>
              {cuponActivo.comercio_nombre}
            </div>

            {/* Código */}
            <div
              onClick={copiarCodigo}
              title="Pulsa para copiar"
              style={{
                width: '100%',
                background: `${r.color}14`,
                border: `1px solid ${r.color}55`,
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '18px', fontWeight: 900,
                color: r.color, letterSpacing: '3px',
                textShadow: `0 0 16px ${r.glow}`,
              }}>
                {cuponActivo.codigo}
              </div>
              <div style={{
                fontSize: '8px', color: 'rgba(232,244,255,0.4)',
                marginTop: '6px', letterSpacing: '1px',
              }}>
                {copiado ? '✓ COPIADO' : 'PULSA PARA COPIAR'}
              </div>
            </div>

            <div style={{
              fontSize: '9px', color: 'rgba(232,244,255,0.4)',
              letterSpacing: '0.5px', textAlign: 'center',
            }}>
              {cuponActivo.caduca_legible !== '—'
                ? `Válido hasta el ${cuponActivo.caduca_legible}`
                : 'Válido hasta cambio de fase lunar'}
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                onClick={onCerrar}
                style={btnStyle('rgba(255,255,255,0.06)', 'rgba(255,255,255,0.2)', '#9094a8')}
              >
                CERRAR
              </button>
              {cuponActivo.mini_url && (
                <button
                  onClick={() => { window.open(cuponActivo.mini_url, '_blank'); onCerrar(); }}
                  style={btnStyle(`${r.color}22`, r.color, r.color)}
                >
                  IR AL MINI ➤
                </button>
              )}
            </div>
          </>
        )}

        {/* ── ERROR ── */}
        {estado === 'error' && (
          <>
            <div style={{ fontSize: '28px' }}>⚠️</div>
            <div style={{
              fontSize: '11px', color: '#ff6060',
              letterSpacing: '1px', textAlign: 'center', lineHeight: 1.5,
            }}>
              {errorMsg}
            </div>
            <button
              onClick={onCerrar}
              style={btnStyle('rgba(255,255,255,0.06)', 'rgba(255,255,255,0.2)', '#9094a8')}
            >
              CERRAR
            </button>
          </>
        )}

      </div>
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────
function Row({ label, value, color = 'rgba(232,244,255,0.6)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '9px', color: 'rgba(232,244,255,0.4)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: '11px', fontWeight: 700, color, letterSpacing: '0.5px' }}>
        {value}
      </span>
    </div>
  );
}

function btnStyle(bg, border, color, disabled = false) {
  return {
    flex: 1, padding: '10px 0',
    background: disabled ? 'rgba(255,255,255,0.03)' : bg,
    border: `1px solid ${disabled ? 'rgba(255,255,255,0.1)' : border}`,
    borderRadius: '10px',
    color: disabled ? 'rgba(255,255,255,0.2)' : color,
    fontFamily: "'Orbitron', monospace",
    fontSize: '10px', fontWeight: 700,
    letterSpacing: '2px', textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
  };
}
