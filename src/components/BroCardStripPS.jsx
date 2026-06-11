// src/components/BroCardStripPS.jsx  v7
// ─────────────────────────────────────────────────────────────────────
// Renderizador puro — recibe cards[] con estilos ya aplicados.
// Mantiene: shimmer, hover perspectiva, lazy load, animaciones.
// Esquina: triangle (texto rotado -45°) o circle (label multilínea).
// ─────────────────────────────────────────────────────────────────────
import { useRef, useEffect, useState } from "react";

const FASE_EMOJI = {
  'Luna Nueva': '🌑',
  'Creciente':  '🌙',
  'Luna Llena': '🌕',
  'Menguante':  '🌗',
};

function BroCardCupon({ card, onClick }) {
  const [imgLoaded,  setImgLoaded]  = useState(false);
  const [inView,     setInView]     = useState(false);
  const [hovered,    setHovered]    = useState(false);
  const [shimmerPos, setShimmerPos] = useState(-100);
  const cardRef = useRef(null);
  const animRef = useRef(null);

  const faseEmoji = FASE_EMOJI[card.fase_lunar] || '🌑';
  const faseLabel = card.fase_lunar || '';

  // Lazy load
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Shimmer sweep hover — mantener exacto
  useEffect(() => {
    if (hovered) {
      // eslint-disable-next-line
      setShimmerPos(-100);
      let pos = -100;
      const tick = () => {
        pos += 4;
        setShimmerPos(pos);
        if (pos < 200) animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setShimmerPos(-100);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [hovered]);

  return (
    <div
      ref={cardRef}
      onClick={() => onClick?.(card)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '240px',
        height: '340px',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: card.bg || 'linear-gradient(160deg,#1a1a1a,#3a3a3a,#6a6a6a)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 16px 40px ${card.glow || 'rgba(200,200,200,0.35)'}, 0 4px 20px rgba(0,0,0,0.85)`
          : '0 4px 16px rgba(0,0,0,0.7)',
        flexShrink: 0,
      }}
    >
      {/* Borde degradado */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '16px',
        background: card.border || 'linear-gradient(160deg,#888,#ccc,#888)',
        zIndex: 0, opacity: 0.85,
      }} />

      {/* Cuerpo */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 'calc(100% - 2px)',
        height: 'calc(100% - 2px)',
        margin: '1px',
        borderRadius: '15px',
        overflow: 'hidden',
        background: card.bg || 'linear-gradient(160deg,#1a1a1a,#3a3a3a,#6a6a6a)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* Shimmer */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${shimmerPos}%`, width: '60%',
          background: card.shimmer || 'linear-gradient(105deg, transparent 35%, rgba(200,200,200,0.4) 50%, transparent 65%)',
          zIndex: 10, pointerEvents: 'none',
        }} />

        {/* ── Nombre comercio — arriba, margen 28px ── */}
        <div style={{
          marginTop: '28px',
          width: '100%',
          textAlign: 'center',
          paddingInline: '10px',
          zIndex: 5,
        }}>
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '16px',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textShadow: '0 0 18px rgba(255,255,255,0.9), 0 0 36px rgba(200,200,200,0.6)',
          }}>
            {card.nombre || 'COMERCIO'}
          </div>
        </div>

        {/* ── Imagen 200×200 ── */}
        <div style={{
          marginTop: '12px',
          marginBottom: '30px',
          width: '160px',
          height: '160px',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 5,
          flexShrink: 0,
          transform: hovered
            ? 'perspective(500px) rotateY(-7deg) rotateX(5deg) scale(1.05)'
            : 'perspective(500px) rotateY(-4deg) rotateX(3deg)',
          transition: 'transform 0.4s ease',
          boxShadow: '5px 7px 20px rgba(0,0,0,0.75)',
        }}>
          {inView && (card.banner_11_url || card.banner_url) ? (
            <img
              src={card.banner_11_url || card.banner_url}
              alt={card.nombre || 'Comercio'}
              onLoad={() => setImgLoaded(true)}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                opacity: imgLoaded ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}
            />
          ) : null}
          {(!imgLoaded || !card.banner_url) && (
            <img
              src="/images/brocard.webp"
              alt="default"
              style={{ 
                width:'100%', height:'100%', 
                objectFit:'cover', opacity: 0.4 
              }}
            />
          )}
        </div>

        {/* ── Info lateral izquierdo ── */}
        <div style={{
          position: 'absolute',
           left: '12px',
           bottom: '12px',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {/* Fase lunar */}
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '13px', fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            textShadow: '0 0 10px rgba(255,255,255,0.5)',
          }}>
            {faseEmoji} {faseLabel}
          </div>

          {/* Vencimiento */}
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '12px', fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '0.5px',
            textShadow: '0 0 8px rgba(255,255,255,0.4)',
          }}>
            Vence {card.vencimiento || '—'}
          </div>

          {/* Coste génesis */}
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '13px', fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.5px',
            textShadow: '0 0 8px rgba(255,255,255,0.4)',
          }}>
            {(card.coste_genesis || 0).toLocaleString()} ✦ génesis
          </div>

          {/* Condición */}
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '11px', fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            opacity: 0.85,
            textShadow: '0 0 6px rgba(255,255,255,0.3)',
          }}>
            {card.condicion ? `${card.condicion} prod.` : '1 prod.'}
          </div>
        </div>

        {/* ── Esquina inferior derecha: descuento_pct ── */}
        {card.cornerStyle === 'circle' ? (
          /* CÍRCULO en esquina inferior derecha */
          <div style={{
            position: 'absolute', bottom: '10px', right: '10px',
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: card.cornerBg,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${card.glow || 'rgba(200,200,200,0.4)'}`,
            zIndex: 6,
          }}>
            {card.label && card.label.split('\n').map((line, i) => (
              <span key={i} style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: i === 0 ? '11px' : '9px',
                fontWeight: 900,
                color: card.cornerText || '#fff',
                letterSpacing: '0.5px',
                lineHeight: 1.2,
                textAlign: 'center',
              }}>{line}</span>
            ))}
          </div>
        ) : (
          /* TRIÁNGULO — descuento_pct rotado -45° */
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '100px', height: '100px',
            overflow: 'hidden', zIndex: 6,
            borderBottomRightRadius: '15px',
          }}>
            <div style={{
              position: 'absolute', bottom: '-1px', right: '-1px',
              width: '102px', height: '102px',
              background: card.cornerBg,
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '18px', right: '4px',
              transform: 'rotate(-45deg)',
              fontFamily: "'Orbitron',monospace",
              fontSize: '22px', fontWeight: 900,
              color: card.cornerText || '#000',
              lineHeight: 1,
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}>
              {card.label || (card.descuento_pct ? `${card.descuento_pct}%` : '—')}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Contenedor 3 columnas × 240px con scroll vertical ────────────────
export default function BroCardStripPS({
  cards = [],
  onSelectCard,
  visible = true,
  columns = 3,
}) {
  if (!visible || cards.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes stripInCupon {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns || 3}, 240px)`,
        gap: '14px',
        animation: 'stripInCupon 0.4s ease both',
        justifyContent: 'center',
        overflowY: 'auto',
        maxHeight: '720px',
        paddingBottom: '8px',
      }}>
        {cards.map((card, i) => (
          <BroCardCupon
            key={card.id || card.nombre || `card-${i}`}
            card={card}
            onClick={onSelectCard}
          />
        ))}
      </div>
    </>
  );
}
