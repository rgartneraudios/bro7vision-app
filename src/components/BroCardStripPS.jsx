// src/components/BroCardStripPS.jsx  v3
// ─────────────────────────────────────────────────────────────────────
// Grid 2 columnas. Cards idénticas al Mini (400×300, imagen 200px izq).
// card.lunas → { nova: bool, crescens: bool, plena: bool, decrescens: bool }
// card.alcance → 'LOCAL' | 'NACIONAL' | 'INTERNACIONAL'
// card.sector  → 'PRODUCTO' | 'SERVICIO'
// card.image_url → imagen subida a R2
// ─────────────────────────────────────────────────────────────────────
import { useRef, useEffect, useState } from "react";

// ── Temas ────────────────────────────────────────────────────────────
const THEMES = {
  gold:  { glow: "rgba(251,191,36,0.5)",  border: "#fbbf24", idColor: "#fbbf24" },
  cyan:  { glow: "rgba(34,211,238,0.5)",  border: "#22d3ee", idColor: "#22d3ee" },
  slate: { glow: "rgba(100,116,139,0.5)", border: "#64748b", idColor: "#64748b" },
};

// ── Alcance ───────────────────────────────────────────────────────────
const ALCANCE_CFG = {
  LOCAL:         { label: 'LOCAL',         color: '#22d3ee' },
  NACIONAL:      { label: 'NACIONAL',      color: '#fbbf24' },
  INTERNACIONAL: { label: 'INTERNACIONAL', color: '#a855f7' },
};

// ── Semáforo lunar — mismos colores que el Mini ───────────────────────
const LUNA_CFG = {
  nova:       { active: '#e040fb', inactive: '#2D1B4D', emoji: '🌑', pct: '20%', cond: '1 art.',  label: 'Luna Nueva'     },
  crescens:   { active: '#69ff47', inactive: '#1A3D1A', emoji: '🌙', pct: '25%', cond: '1 art.',  label: 'Luna Creciente' },
  plena:      { active: '#e8f4ff', inactive: '#3D3D3D', emoji: '🌕', pct: '30%', cond: 'mín. 2',  label: 'Luna Llena'     },
  decrescens: { active: '#ff9800', inactive: '#3D2D1A', emoji: '🌗', pct: '30%', cond: 'mín. 3',  label: 'Luna Menguante' },
};

// ── Semáforo — idéntico al Mini en row ───────────────────────────────
function LunarSemaphor({ lunas }) {
  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', margin: '6px 0 4px' }}>
      {Object.entries(LUNA_CFG).map(([phase, cfg]) => {
        const isActive = lunas?.[phase] === true;
        return (
          <div
            key={phase}
            title={isActive ? `${cfg.emoji} ${cfg.label} · ${cfg.pct} · ${cfg.cond}` : `${cfg.emoji} No activo`}
            style={{
              width: '10px', height: '10px', borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: isActive ? cfg.active : cfg.inactive,
              boxShadow: isActive ? `0 0 6px ${cfg.active}` : 'none',
              opacity: isActive ? 1 : 0.2,
              transition: 'all 0.3s ease',
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Card individual — layout idéntico al Mini ─────────────────────────
function BroCardPS({ card, theme, onClick }) {
  const [loaded,  setLoaded]  = useState(false);
  const [inView,  setInView]  = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);
  const t = THEMES[theme] || THEMES.gold;

  // Lazy load
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.1, rootMargin: "0px 60px 0px 60px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const alcanceCfg = ALCANCE_CFG[card.alcance] || null;
  const mostrarBadgeAlcance = card.alcance && card.alcance !== 'LOCAL';
  const sectorLabel = card.sector === 'SERVICIO' ? '🛠' : '📦';

  return (
    <div
      ref={cardRef}
      onClick={() => onClick?.(card)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        // ── Dimensiones idénticas al Mini ──
        width: '400px',
        height: '300px',
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        background: 'rgba(255,250,245,0.08)',
        border: `1px solid ${hovered ? t.border : 'rgba(0,245,255,0.18)'}`,
        backdropFilter: 'blur(8px)',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 0 24px ${t.glow}, 0 4px 16px rgba(0,0,0,0.6)`
          : '0 2px 10px rgba(0,0,0,0.5)',
      }}
    >
      {/* ── Imagen izquierda 200px ── */}
      <div style={{
        width: '200px',
        height: '100%',
        background: '#1B1B26',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        color: 'rgba(232,244,255,0.55)',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}>
        {inView && card.image_url ? (
          <img
            src={card.image_url}
            alt={card.producto_titulo || card.nombre || 'Referencia'}
            onLoad={() => setLoaded(true)}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', display: 'block',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
        ) : null}

        {/* Shimmer / placeholder */}
        {(!loaded || !card.image_url) && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.6s infinite',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {!card.image_url && <span style={{ fontSize: '32px', opacity: 0.3 }}>🛍️</span>}
          </div>
        )}
      </div>

      {/* ── Body derecha ── */}
      <div style={{
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '5px',
        minWidth: 0,
        position: 'relative',
      }}>

        {/* Badge Destacado */}
        {card.orden_vitrina && (
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(2,8,18,0.9)',
            border: `1px solid ${t.border}`,
            borderRadius: '20px', padding: '2px 8px',
            fontSize: '10px', fontFamily: "'Orbitron', monospace",
            color: t.idColor, letterSpacing: '0.5px',
          }}>
            ★ Destacado
          </div>
        )}

        {/* Badges alcance + sector */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
          <span style={{ fontSize: '13px' }}>{sectorLabel}</span>
          {mostrarBadgeAlcance && alcanceCfg && (
            <span style={{
              padding: '2px 6px',
              background: 'rgba(0,0,0,0.80)',
              border: `1px solid ${alcanceCfg.color}80`,
              color: alcanceCfg.color,
              fontSize: '8px', fontWeight: 700,
              letterSpacing: '0.4px', textTransform: 'uppercase',
              borderRadius: '4px',
              boxShadow: `0 0 6px ${alcanceCfg.color}60`,
            }}>
              {alcanceCfg.label}
            </span>
          )}
        </div>

        {/* Nombre */}
        {(card.producto_titulo || card.nombre) && (
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '14px', fontWeight: 700,
            color: '#e8f4ff', letterSpacing: '1px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {card.producto_titulo || card.nombre}
          </div>
        )}

        {/* Referencia BRO-ID */}
        {card.bro_pd && (
          <div style={{
            fontSize: '11px', color: 'rgba(232,244,255,0.55)',
            fontFamily: "'Orbitron', monospace", letterSpacing: '0.5px',
          }}>
            {card.bro_pd}
          </div>
        )}

        {/* Descripción */}
        {card.descripcion && (
          <div style={{
            fontSize: '12px', color: 'rgba(232,244,255,0.55)',
            lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {card.descripcion}
          </div>
        )}

        {/* Semáforo */}
        <LunarSemaphor lunas={card.lunas} />

        {/* Precios */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {card.precio_descuento > 0 && (
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '17px', fontWeight: 700, color: '#39ff14',
            }}>
              {card.precio_descuento.toFixed(2)} €
            </span>
          )}
          {card.precio_original > 0 && (
            <span style={{
              fontSize: '12px', color: 'rgba(232,244,255,0.55)',
              textDecoration: card.precio_descuento > 0 ? 'line-through' : 'none',
            }}>
              {card.precio_original.toFixed(2)} €
            </span>
          )}
        </div>

        {/* Tallas */}
        {card.tallas && (
          <div style={{ fontSize: '11px', color: 'rgba(107,114,128,1)' }}>
            {card.tallas}
          </div>
        )}

        {/* Botón VER → handoff al Mini */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick?.(card); }}
          style={{
            marginTop: '4px',
            padding: '7px 18px',
            background: 'transparent',
            border: `1px solid #00f5ff`,
            borderRadius: '7px',
            color: '#00f5ff',
            fontFamily: "'Orbitron', monospace",
            fontSize: '10px', letterSpacing: '2px',
            cursor: 'pointer', transition: 'all 0.2s',
            textTransform: 'uppercase', alignSelf: 'flex-start',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          VER
        </button>
      </div>
    </div>
  );
}

// ── Contenedor — grid 2 columnas ──────────────────────────────────────
export default function BroCardStripPS({
  cards = [],
  onSelectCard,
  accentColor = "gold",
  visible = true,
}) {
  // Filtro defensivo: stock > 0 y orden_vitrina 1-3
  const cardsVisibles = cards
    .filter(c => (c.stock_actual ?? 0) > 0 && c.orden_vitrina >= 1 && c.orden_vitrina <= 3)
    .sort((a, b) => a.orden_vitrina - b.orden_vitrina);

  if (!visible || cardsVisibles.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes stripIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 400px)',
        gap: '14px',
        animation: 'stripIn 0.35s ease both',
        justifyContent: 'center',
      }}>
        {cardsVisibles.map((card, i) => (
          <BroCardPS
            key={card.bro_pd || `card-${i}`}
            card={card}
            theme={accentColor}
            onClick={onSelectCard}
          />
        ))}
      </div>
    </>
  );
}