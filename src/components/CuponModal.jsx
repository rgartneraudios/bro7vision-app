// src/components/CuponModal.jsx
const TIER_STYLE = {
  PLATA:    { color: '#c8ccd8', glow: 'rgba(200,205,220,0.6)', label: 'LUNA DE PLATA'    },
  ORO:      { color: '#ffd060', glow: 'rgba(255,200,50,0.6)',  label: 'LUNA DE ORO'      },
  DIAMANTE: { color: '#d090ff', glow: 'rgba(180,80,255,0.6)', label: 'LUNA DE DIAMANTE' },
  '100':    { color: '#ff80c0', glow: 'rgba(255,100,180,0.6)','label': 'LUNA 100'        },
};

const LABEL_VALOR = {
  ENVIO_GRATIS: 'Envío Gratis',
  '100pct':     '100% Descuento',
};

function valorDisplay(c) {
  if (!c) return '—';
  if (c.valor_euros != null) return `${c.valor_euros} €`;
  return LABEL_VALOR[c.tipo_tarjeta] || '—';
}

export default function CuponModal({
  estado,
  cardPendiente,
  cuponActivo,
  errorMsg,
  lunasBalance,
  onConfirmar,
  onCancelar,
  onCerrar,
}) {
  if (estado === 'idle') return null;

  const tier = cardPendiente?.tipo_tarjeta || cuponActivo?.tipo_tarjeta || 'PLATA';
  const r    = TIER_STYLE[tier] || TIER_STYLE.PLATA;
  const costeLunas = cardPendiente?.coste_lunas || 0;
  const saldoTras  = (lunasBalance || 0) - costeLunas;

  return (
    <>
      <div
        onClick={estado === 'confirmando' ? onCancelar : onCerrar}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 200,
        }}
      />

      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201,
        width: 'min(600px, 92vw)',
        borderRadius: 20,
        background: 'linear-gradient(145deg, rgba(20,20,24,0.55) 0%, rgba(26,22,32,0.55) 50%, rgba(18,18,20,0.55) 100%), url(/images/galaxy_bg.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: `1px solid rgba(212,165,165,0.25)`,
        boxShadow: '0 0 30px rgba(212,165,165,0.15), 0 0 60px rgba(212,165,165,0.05), 0 8px 32px rgba(0,0,0,0.9)',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        fontFamily: "'Exo 2', sans-serif",
      }}>

        {/* ── CONFIRMANDO ── */}
        {estado === 'confirmando' && cardPendiente && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d4a5a5',
              letterSpacing: 2, textTransform: 'uppercase',
              textShadow: '0 0 12px rgba(212,165,165,0.5)' }}>
              {r.label}
            </div>

            <div style={{ fontSize: 36, fontWeight: 900, color: '#d4a5a5',
              textShadow: '0 0 20px rgba(212,165,165,0.4), 0 0 40px rgba(212,165,165,0.15)' }}>
              {valorDisplay(cardPendiente)}
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8',
              letterSpacing: 1, textAlign: 'center', lineHeight: 1.4 }}>
              {cardPendiente.comercio_nombre}
            </div>

            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, #1c1e26 0%, #2a2430 40%, #3a2a30 70%, #1e2028 100%)',
              borderRadius: 16, padding: '28px 32px',
              display: 'flex', flexDirection: 'column', gap: 14,
              boxShadow: 'inset 0 0 30px rgba(212,165,165,0.06), 0 4px 24px rgba(0,0,0,0.4)',
              border: '1px solid rgba(212,165,165,0.1)',
            }}>
              <Row label="Descuento"    value={valorDisplay(cardPendiente)} />
              {cardPendiente.compra_minima && (
                <Row label="Compra mín."  value={cardPendiente.compra_minima} />
              )}
              <Row label="Coste"        value={`🌙 ${costeLunas.toLocaleString()} Lunas`} color="#fbbf24" />
              <Row label="Tu saldo"     value={`🌙 ${(lunasBalance||0).toLocaleString()}`} />
              <Row
                label="Tras canje"
                value={`🌙 ${saldoTras.toLocaleString()}`}
                color={saldoTras < 0 ? '#ff4444' : '#d4a5a5'}
              />
            </div>

            {saldoTras < 0 && (
              <div style={{ fontSize: 11, color: '#ff4444', letterSpacing: 1,
                textShadow: '0 0 8px rgba(255,68,68,0.4)' }}>
                Te faltan 🌙 {Math.abs(saldoTras).toLocaleString()} Lunas
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button onClick={onCancelar}
                style={btnStyle('rgba(212,165,165,0.04)', 'rgba(212,165,165,0.2)', '#d4a5a5')}>
                CANCELAR
              </button>
              <button onClick={onConfirmar} disabled={saldoTras < 0}
                style={btnStyle('rgba(212,165,165,0.12)', '#d4a5a5', '#0a0a0e', saldoTras < 0)}>
                CANJEAR
              </button>
            </div>
          </>
        )}

        {/* ── CARGANDO ── */}
        {estado === 'cargando' && (
          <>
            <div style={{ fontSize: 32, animation: 'spinCupon 1s linear infinite',
              filter: 'drop-shadow(0 0 8px rgba(212,165,165,0.6))' }}>🌙</div>
            <div style={{ fontSize: 11, color: '#d4a5a5', letterSpacing: 2,
              textShadow: '0 0 8px rgba(212,165,165,0.4)' }}>
              PROCESANDO CANJE...
            </div>
            <style>{`@keyframes spinCupon { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {/* ── ÉXITO ── */}
        {estado === 'exito' && cuponActivo && (
          <>
            <div style={{ fontSize: 28, filter: 'drop-shadow(0 0 10px rgba(212,165,165,0.5))' }}>
              {cuponActivo.ya_existia ? '📋' : '✅'}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d4a5a5',
              letterSpacing: 2, textTransform: 'uppercase',
              textShadow: '0 0 12px rgba(212,165,165,0.5)' }}>
              {cuponActivo.ya_existia ? 'YA TENÍAS ESTE CUPÓN' : '¡LUNA CANJEADA!'}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', letterSpacing: 1, textAlign: 'center' }}>
              {cuponActivo.comercio_nombre}
            </div>

            <div style={{
              fontSize: 15, color: '#f0e6e6',
              textAlign: 'center', lineHeight: 1.7,
              padding: '24px 20px', width: '100%',
              background: 'linear-gradient(135deg, #1c1e26 0%, #2a2430 40%, #3a2a30 70%, #1e2028 100%)',
              borderRadius: 16,
              boxShadow: 'inset 0 0 30px rgba(212,165,165,0.06), 0 4px 24px rgba(0,0,0,0.4)',
              border: '1px solid rgba(212,165,165,0.1)',
              fontWeight: 700,
              textShadow: '0 0 10px rgba(212,165,165,0.3)',
            }}>
              Operación realizada con éxito.<br />
              En <strong style={{ color: '#d4a5a5' }}>Booster Studio › Mis Cupones</strong><br />
              te espera tu Sticker y la Palabra Clave secreta.
            </div>

            <div style={{ fontSize: 9, color: 'rgba(212,165,165,0.35)',
              letterSpacing: 0.5, textAlign: 'center',
              textShadow: '0 0 6px rgba(212,165,165,0.15)' }}>
              {cuponActivo.caduca_legible !== '—'
                ? `Válido hasta el ${cuponActivo.caduca_legible}`
                : 'Válido hasta cambio de fase lunar'}
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button onClick={onCerrar}
                style={btnStyle('rgba(212,165,165,0.04)', 'rgba(212,165,165,0.2)', '#d4a5a5')}>
                CERRAR
              </button>
              {cuponActivo.web_url && (
                <button onClick={() => { window.open(cuponActivo.web_url, '_blank'); onCerrar(); }}
                  style={btnStyle('rgba(212,165,165,0.12)', '#d4a5a5', '#0a0a0e')}>
                  IR AL COMERCIO ➤
                </button>
              )}
            </div>
          </>
        )}

        {/* ── ERROR ── */}
        {estado === 'error' && (
          <>
            <div style={{ fontSize: 28 }}>⚠️</div>
            <div style={{ fontSize: 11, color: '#ff6060',
              letterSpacing: 1, textAlign: 'center', lineHeight: 1.5,
              textShadow: '0 0 8px rgba(255,96,96,0.3)' }}>
              {errorMsg}
            </div>
            <button onClick={onCerrar}
              style={btnStyle('rgba(212,165,165,0.04)', 'rgba(212,165,165,0.2)', '#d4a5a5')}>
              CERRAR
            </button>
          </>
        )}

      </div>
    </>
  );
}

function Row({ label, value, color = '#d4a5a5' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 14, color: '#64748b', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: 0.5,
        textShadow: '0 0 6px rgba(100,116,139,0.2)' }}>
        {label}
      </span>
      <span style={{ fontSize: 18, fontWeight: 700, color, letterSpacing: 0.5,
        textShadow: `0 0 10px ${color === '#fbbf24' ? 'rgba(251,191,36,0.4)' : 'rgba(212,165,165,0.4)'}` }}>
        {value}
      </span>
    </div>
  );
}

function btnStyle(bg, border, color, disabled = false) {
  return {
    flex: 1, padding: '10px 0',
    background: disabled ? 'rgba(212,165,165,0.02)' : bg,
    border: `1px solid ${disabled ? 'rgba(212,165,165,0.08)' : border}`,
    borderRadius: 10, color: disabled ? 'rgba(212,165,165,0.15)' : color,
    fontFamily: "'Exo 2', sans-serif",
    fontSize: 11, fontWeight: 700,
    letterSpacing: 2, textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
  };
}