// src/components/BroCardStripPS.jsx  v6
// ─────────────────────────────────────────────────────────────────────
// Grid 3 columnas × 240px. Scroll vertical por filas.
// PLATA 15% | ZAFIRO 20% | GOLD 25%
// ─────────────────────────────────────────────────────────────────────
import { useRef, useEffect, useState } from "react";

const RAREZA = {
  15: {
    bg: 'linear-gradient(160deg, #2a2a2e 0%, #4a4a52 30%, #8a8a96 55%, #5a5a64 75%, #1e1e22 100%)',
    shimmer: 'linear-gradient(105deg, transparent 35%, rgba(210,215,230,0.55) 50%, transparent 65%)',
    borderGrad: 'linear-gradient(160deg, #c8ccd8, #f0f2f8, #9ca0b0, #e8eaf0, #7a7e8a)',
    cornerBg: 'linear-gradient(135deg, #9ca0b0 0%, #f0f2f8 40%, #b0b4c4 70%, #787c8c 100%)',
     cornerText: '#000252',
     nameColor: '#ffffff',
     nameShadow: '0 0 18px rgba(220,225,245,0.9), 0 0 36px rgba(180,185,210,0.6)',
     faseColor: '#ffffff',
     infoColor: '#ffffff',
     genesisColor: '#ffffff',
     glowColor: 'rgba(200,205,225,0.35)',
   },
   20: {
    bg: 'linear-gradient(160deg, #0a0f2e 0%, #0d1f5c 25%, #1a3a9e 50%, #0d2070 70%, #060b20 100%)',
    shimmer: 'linear-gradient(105deg, transparent 35%, rgba(120,180,255,0.6) 50%, transparent 65%)',
    borderGrad: 'linear-gradient(160deg, #2a4fcc, #6a9fff, #1a35aa, #5080ee, #0f2580)',
    cornerBg: 'linear-gradient(135deg, #1a3acc 0%, #6a9fff 40%, #2a50dd 70%, #0f2299 100%)',
     cornerText: '#ffffff',
     nameColor: '#ffffff',
     nameShadow: '0 0 18px rgba(100,160,255,0.95), 0 0 36px rgba(60,120,255,0.7)',
     faseColor: '#ffffff',
     infoColor: '#ffffff',
     genesisColor: '#ffffff',
    glowColor: 'rgba(80,130,255,0.4)',
  },
  25: {
    bg: 'linear-gradient(160deg, #1a1200 0%, #3d2a00 25%, #8a6200 50%, #5a4000 70%, #120d00 100%)',
    shimmer: 'linear-gradient(105deg, transparent 35%, rgba(255,220,80,0.65) 50%, transparent 65%)',
    borderGrad: 'linear-gradient(160deg, #c8960a, #ffe066, #a07808, #ffd040, #7a5c06)',
    cornerBg: 'linear-gradient(135deg, #c8960a 0%, #ffe566 40%, #d4a010 70%, #9a7008 100%)',
     cornerText: '#01053D',
     nameColor: '#ffffff',
     nameShadow: '0 0 18px rgba(255,220,80,0.95), 0 0 36px rgba(220,160,0,0.7)',
     faseColor: '#ffffff',
     infoColor: '#ffffff',
     genesisColor: '#ffffff',
     glowColor: 'rgba(255,200,50,0.4)',
   },
 };

const RAREZA_DEFAULT = RAREZA[15];

const FASE_CFG = {
  'Luna Nueva': { emoji: '🌑', label: 'Luna Nueva' },
  'Creciente':  { emoji: '🌙', label: 'Creciente'  },
  'Luna Llena': { emoji: '🌕', label: 'Luna Llena' },
  'Menguante':  { emoji: '🌗', label: 'Menguante'  },
};

function BroCardCupon({ card, onClick }) {
  const [imgLoaded,  setImgLoaded]  = useState(false);
  const [inView,     setInView]     = useState(false);
  const [hovered,    setHovered]    = useState(false);
  const [shimmerPos, setShimmerPos] = useState(-100);
  const cardRef = useRef(null);
  const animRef = useRef(null);

  const r    = RAREZA[card.descuento_pct] || RAREZA_DEFAULT;
  const fase = FASE_CFG[card.fase_lunar]  || { emoji: '🌑', label: card.fase_lunar || '' };

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

  // Shimmer sweep hover
  useEffect(() => {
    if (hovered) {
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
        background: r.bg,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 16px 40px ${r.glowColor}, 0 4px 20px rgba(0,0,0,0.85)`
          : '0 4px 16px rgba(0,0,0,0.7)',
        flexShrink: 0,
      }}
    >
      {/* Borde degradado */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '16px',
        background: r.borderGrad,
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
        background: r.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* Shimmer */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${shimmerPos}%`, width: '60%',
          background: r.shimmer,
          zIndex: 10, pointerEvents: 'none',
        }} />

        {/* ── Nombre comercio — prominente con resplandor ── */}
        <div style={{
          marginTop: '22px',
          width: '100%',
          textAlign: 'center',
          paddingInline: '10px',
          zIndex: 5,
        }}>
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '13px',
            fontWeight: 900,
            color: r.nameColor,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textShadow: r.nameShadow,
          }}>
            {card.nombre || 'COMERCIO'}
          </div>
        </div>

        {/* ── Imagen 160×160 en perspectiva ── */}
        <div style={{
          marginTop: '12px',
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
           boxShadow: `5px 7px 20px rgba(0,0,0,0.75)`,
         }}>
           {inView && card.banner_url ? (
             <img
               src={card.banner_url}
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
             <div style={{
               position: 'absolute', inset: 0,
               background: 'rgba(255,255,255,0.04)',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
             }}>
               <span style={{ fontSize: '30px', opacity: 0.2 }}>🏪</span>
             </div>
           )}
         </div>

        {/* ── Info inferior ── */}
        <div style={{
          flex: 1, width: '100%',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'flex-start',
          gap: '4px', paddingInline: '12px',
          paddingBottom: '10px', zIndex: 5,
          paddingLeft: '14px',
        }}>

           {/* Fase lunar — legible */}
           <div style={{
             fontFamily: "'Orbitron', monospace",
             fontSize: '12px', fontWeight: 700,
             color: '#ffffff',
             letterSpacing: '1.5px',
             textTransform: 'uppercase',
             textShadow: `0 0 10px rgba(255,255,255,0.5)`,
           }}>
            {fase.emoji} {fase.label}
          </div>

           {/* Vencimiento — legible */}
           <div style={{
             fontFamily: "'Orbitron', monospace",
             fontSize: '11px', fontWeight: 600,
             color: '#ffffff',
             letterSpacing: '0.5px',
             textShadow: `0 0 8px rgba(255,255,255,0.4)`,
           }}>
            Vence {card.vencimiento || '—'}
          </div>

           {/* Coste génesis — legible */}
           <div style={{
             fontFamily: "'Orbitron', monospace",
             fontSize: '12px', fontWeight: 700,
             color: '#ffffff',
             letterSpacing: '0.5px',
             textShadow: `0 0 8px rgba(255,255,255,0.4)`,
           }}>
            {card.coste_genesis?.toLocaleString() || '1.000'} ✦ génesis
          </div>

           {/* Condición */}
           <div style={{
             fontFamily: "'Orbitron', monospace",
             fontSize: '10px', fontWeight: 600,
             color: '#ffffff',
             letterSpacing: '1px',
             textTransform: 'uppercase',
             opacity: 0.85,
             textShadow: `0 0 6px rgba(255,255,255,0.3)`,
           }}>
            {card.condicion || '1 producto'}
          </div>
        </div>

        {/* ── Esquina % — impacto máximo ── */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: '100px', height: '100px',
          overflow: 'hidden', zIndex: 6,
          borderBottomRightRadius: '15px',
        }}>
          <div style={{
            position: 'absolute', bottom: '-1px', right: '-1px',
            width: '102px', height: '102px',
            background: r.cornerBg,
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '12px', right: '6px',
            fontFamily: "'Orbitron', monospace",
            fontSize: '26px', fontWeight: 900,
            color: r.cornerText,
            letterSpacing: '-1px', lineHeight: 1,
            textAlign: 'right',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}>
            {card.descuento_pct || '—'}%
          </div>
        </div>

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
            key={card.nombre || `card-${i}`}
            card={card}
            onClick={onSelectCard}
          />
        ))}
      </div>
    </>
  );
}
