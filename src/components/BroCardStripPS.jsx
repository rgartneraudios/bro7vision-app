// src/components/BroCardStripPS.jsx  v2
// ─────────────────────────────────────────────────────────────────────
// Cajón scrolleable horizontal de referencias de vitrina.
// Cada card = una referencia con orden_vitrina 1/2/3, stock > 0.
// card.lunas → { nova: bool, crescens: bool, plena: bool, decrescens: bool }
// card.alcance → 'LOCAL' | 'NACIONAL' | 'INTERNACIONAL'
// card.sector  → 'PRODUCTO' | 'SERVICIO'
// card.image_url → imagen subida a R2
// ─────────────────────────────────────────────────────────────────────
import { useRef, useEffect, useState, useCallback } from "react";

// ── Temas ────────────────────────────────────────────────────────────
const THEMES = {
  gold:  { glow: "rgba(251,191,36,0.5)",  border: "#fbbf24", idColor: "#fbbf24", footerBg: "#000000" },
  cyan:  { glow: "rgba(34,211,238,0.5)",  border: "#22d3ee", idColor: "#22d3ee", footerBg: "#000000" },
  slate: { glow: "rgba(100,116,139,0.5)", border: "#64748b", idColor: "#64748b", footerBg: "#000000" },
};

// ── Configuración de alcance — color y label por valor exacto ────────
const ALCANCE_CFG = {
  LOCAL:         { label: 'LOCAL',         color: '#22d3ee' },
  NACIONAL:      { label: 'NACIONAL',      color: '#fbbf24' },
  INTERNACIONAL: { label: 'INTERNACIONAL', color: '#a855f7' },
};

// ── Semáforo lunar con % y condición en tooltip ──────────────────────
const LUNA_CFG = {
  nova:       { active: '#A855F7', inactive: '#2D1B4D', emoji: '🌑', pct: '10%',  cond: '1 art.',  label: 'Luna Nueva'    },
  crescens:   { active: '#79FF1A', inactive: '#1A3D1A', emoji: '🌙', pct: '15%',  cond: '1 art.',  label: 'Luna Creciente'    },
  plena:      { active: '#FFFFFF', inactive: '#3D3D3D', emoji: '🌕', pct: '20%',  cond: 'mín. 2',  label: 'Luna Llena'    },
  decrescens: { active: '#F97316', inactive: '#3D2D1A', emoji: '🌗', pct: '20%',  cond: 'mín. 3',  label: 'Luna Menguante'    },
};

function LunarSemaphor({ lunas }) {
  return (
    <div style={{
      display: 'flex', gap: '10px',
      justifyContent: 'center', alignItems: 'center',
      height: '100%', width: '100%', padding: '0 8px',
    }}>
      {Object.entries(LUNA_CFG).map(([phase, cfg]) => {
        const isActive = lunas?.[phase] === true;
        return (
            <div
              key={phase}
              title={isActive ? `${cfg.emoji} ${cfg.label} · ${cfg.pct} · ${cfg.cond}` : `${cfg.emoji} No activo`}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '2px',
              }}
            >
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%',
                backgroundColor: isActive ? cfg.active : cfg.inactive,
                boxShadow: isActive ? `0 0 10px ${cfg.active}, 0 0 20px ${cfg.active}` : 'none',
                opacity: isActive ? 1 : 0.35,
                transition: 'all 0.3s ease',
                flexShrink: 0,
              }} />
              {isActive && (
                <span style={{
                  fontSize: '6px', color: cfg.active,
                  fontWeight: 800, lineHeight: 1,
                  letterSpacing: '-0.2px',
                }}>
                  {cfg.pct}
                </span>
              )}
            </div>
        );
      })}
    </div>
  );
}

// ── Card individual ──────────────────────────────────────────────────
function BroCardPS({ card, theme, onClick, index }) {
  const [loaded,  setLoaded]  = useState(false);
  const [inView,  setInView]  = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);
  const t = THEMES[theme] || THEMES.gold;

  // Lazy load con IntersectionObserver
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.1, rootMargin: "0px 120px 0px 120px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Badge de alcance — solo si no es LOCAL
  const alcanceCfg = ALCANCE_CFG[card.alcance] || null;
  const mostrarBadgeAlcance = card.alcance && card.alcance !== 'LOCAL';

  // Badge de sector
  const sectorLabel = card.sector === 'SERVICIO' ? '🛠' : '📦';

  return (
    <div
      ref={cardRef}
      onClick={() => onClick?.(card)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "160px",
        aspectRatio: "2 / 3",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-5px) scale(1.04)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 0 24px ${t.glow}, 0 4px 16px rgba(0,0,0,0.6)`
          : "0 2px 10px rgba(0,0,0,0.5)",
        animationDelay: `${index * 55}ms`,
        animation: "broCardPop 0.35s ease both",
      }}
    >
      {/* Borde superior luminoso al hover */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, transparent, ${t.border}, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.2s",
        zIndex: 4,
      }} />

      {/* Badge alcance — NACIONAL o INTERNACIONAL (no LOCAL) */}
      {mostrarBadgeAlcance && alcanceCfg && (
        <div style={{
          position: "absolute", top: 8, left: 8,
          padding: "2px 6px",
          background: "rgba(0,0,0,0.80)",
          border: `1px solid ${alcanceCfg.color}80`,
          color: alcanceCfg.color,
          fontSize: "8px", fontWeight: 700,
          letterSpacing: "0.4px",
          textTransform: "uppercase",
          borderRadius: "4px",
          zIndex: 3,
          boxShadow: `0 0 6px ${alcanceCfg.color}60`,
          backdropFilter: "blur(4px)",
        }}>
          {alcanceCfg.label}
        </div>
      )}

      {/* Badge sector — esquina superior derecha */}
      <div style={{
        position: "absolute", top: 8, right: 8,
        width: "20px", height: "20px",
        background: "rgba(0,0,0,0.75)",
        border: `1px solid ${t.border}50`,
        borderRadius: "4px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px",
        zIndex: 3,
        backdropFilter: "blur(4px)",
      }}>
        {sectorLabel}
      </div>

      {/* Slot de orden vitrina — esquina inferior derecha encima del footer */}
      {card.orden_vitrina && (
        <div style={{
          position: "absolute", bottom: 38, right: 6,
          fontSize: "8px", color: "#fbbf24",
          background: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(251,191,36,0.3)",
          borderRadius: "3px", padding: "1px 4px",
          fontWeight: 800, zIndex: 3,
        }}>
          ⭐{card.orden_vitrina}
        </div>
      )}

      {/* Imagen */}
      <div style={{
        width: "100%",
        height: "calc(100% - 40px)",
        background: "rgba(255,255,255,0.04)",
        overflow: "hidden",
        position: "relative",
      }}>
        {inView && card.image_url ? (
          <img
            src={card.image_url}
            alt={card.producto_titulo || card.nombre || 'Referencia'}
            onLoad={() => setLoaded(true)}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", display: "block",
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
        ) : null}

        {/* Shimmer mientras carga */}
        {(!loaded || !card.image_url) && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.6s infinite",
          }}>
            {/* Placeholder si no hay imagen */}
            {!card.image_url && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "6px",
              }}>
                <span style={{ fontSize: "28px", opacity: 0.3 }}>📷</span>
                <span style={{ fontSize: "8px", color: "#4B5563", textAlign: "center", padding: "0 8px" }}>
                  Sin imagen
                </span>
              </div>
            )}
          </div>
        )}

        {/* Overlay precio al hover */}
        {hovered && (card.precio_descuento > 0 || card.precio_original > 0) && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
            padding: "20px 8px 8px",
            display: "flex", flexDirection: "column", gap: "2px",
          }}>
            {card.producto_titulo && (
              <span style={{
                fontSize: "9px", color: "#fff", fontWeight: 700,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {card.producto_titulo}
              </span>
            )}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {card.precio_original > 0 && (
                <span style={{ fontSize: "9px", color: "#9CA3AF", textDecoration: "line-through" }}>
                  {card.precio_original}€
                </span>
              )}
              {card.precio_descuento > 0 && (
                <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 800 }}>
                  {card.precio_descuento}€
                </span>
              )}
            </div>
            {card.tallas && (
              <span style={{ fontSize: "8px", color: "#6B7280" }}>
                {card.tallas}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer — semáforo lunar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "40px",
        background: t.footerBg,
        borderTop: `1px solid ${t.border}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2,
      }}>
        <LunarSemaphor lunas={card.lunas} />
      </div>
    </div>
  );
}

// ── Contenedor scrolleable ───────────────────────────────────────────
export default function BroCardStripPS({
  cards = [],
  onSelectCard,
  accentColor = "gold",
  visible = true,
}) {
  const scrollRef = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);
  const t = THEMES[accentColor] || THEMES.gold;

  // Filtro defensivo: solo refs con stock > 0 y orden_vitrina válido
  const cardsVisibles = cards.filter(c =>
    (c.stock_actual ?? 0) > 0 &&
    c.orden_vitrina >= 1 &&
    c.orden_vitrina <= 3
  ).sort((a, b) => a.orden_vitrina - b.orden_vitrina);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    window.addEventListener("resize", checkScroll);
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", checkScroll);
      el.removeEventListener("scroll", checkScroll);
    };
  }, [cardsVisibles, checkScroll]);

  const scroll = (dir) =>
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });

  const ArrowBtn = ({ dir, side }) => (
    <button
      onClick={() => scroll(dir)}
      style={{
        position: "absolute", [side]: -10, top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10, width: "26px", height: "26px",
        borderRadius: "50%",
        border: `1px solid ${t.border}`,
        background: "rgba(0,0,0,0.85)",
        color: t.idColor, fontSize: "14px",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 8px ${t.glow}`,
        transition: "all 0.2s",
      }}
    >
      {dir === -1 ? "‹" : "›"}
    </button>
  );

  if (!visible || cardsVisibles.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes broCardPop {
          from { opacity: 0; transform: scale(0.92) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes stripIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .bcs-scroll::-webkit-scrollbar { height: 2px; }
        .bcs-scroll::-webkit-scrollbar-track { background: transparent; }
        .bcs-scroll::-webkit-scrollbar-thumb {
          background: ${t.border}44;
          border-radius: 2px;
        }
      `}</style>

      <div style={{ width: "100%", animation: "stripIn 0.35s ease both" }}>
        <div style={{ position: "relative" }}>

          {/* Gradiente y flecha izquierda */}
          {canLeft && (
            <>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: "32px",
                background: "linear-gradient(90deg, rgba(0,0,0,0.75), transparent)",
                zIndex: 5, pointerEvents: "none",
              }} />
              <ArrowBtn dir={-1} side="left" />
            </>
          )}

          {/* Scroll horizontal */}
          <div
            ref={scrollRef}
            className="bcs-scroll"
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "12px",
              overflowX: "auto",
              overflowY: "hidden",
              padding: "4px 4px 8px",
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "x mandatory",
            }}
          >
            {cardsVisibles.map((card, i) => (
              <div key={card.bro_pd || `card-${i}`} style={{ scrollSnapAlign: "start", flexShrink: 0 }}>
                <BroCardPS
                  card={card}
                  theme={accentColor}
                  onClick={onSelectCard}
                  index={i}
                />
              </div>
            ))}
          </div>

          {/* Gradiente y flecha derecha */}
          {canRight && (
            <>
              <div style={{
                position: "absolute", right: 0, top: 0, bottom: 0,
                width: "32px",
                background: "linear-gradient(270deg, rgba(0,0,0,0.75), transparent)",
                zIndex: 5, pointerEvents: "none",
              }} />
              <ArrowBtn dir={1} side="right" />
            </>
          )}
        </div>
      </div>
    </>
  );
}