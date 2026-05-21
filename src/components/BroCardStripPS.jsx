// src/components/BroCardStripPS.jsx  v1
// ─────────────────────────────────────────────────────────────
// Imagen 2:3 + Semáforo LED de 4 fases lunares en footer
// card.image_url → imagen del producto
// card.lunas → { nova: true, crescens: false, plena: true, decrescens: false }
// ─────────────────────────────────────────────────────────────
import { useRef, useEffect, useState, useCallback } from "react";

const THEMES = {
  gold:  { glow: "rgba(251,191,36,0.5)",  border: "#fbbf24", idColor: "#fbbf24", footerBg: "#000000" },
  cyan:  { glow: "rgba(34,211,238,0.5)",  border: "#22d3ee", idColor: "#22d3ee", footerBg: "#000000" },
  slate: { glow: "rgba(100,116,139,0.5)", border: "#64748b", idColor: "#64748b", footerBg: "#000000" },
  blue:  { glow: "rgba(30,58,138,0.5)",   border: "#1e3a8a", idColor: "#1e3a8a", footerBg: "#000000" },
};

function LunarSemaphor({ lunas }) {
  const COLORS = {
    nova:     { active: '#A855F7', inactive: '#2D1B4D' },
    crescens: { active: '#79FF1A', inactive: '#1A3D1A' },
    plena:    { active: '#FFFFFF', inactive: '#3D3D3D' },
    decrescens: { active: '#F97316', inactive: '#3D2D1A' },
  };

  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      padding: '0 10px',
    }}>
      {Object.keys(COLORS).map(phase => {
        const isActive = lunas?.[phase] === true;
        const color = isActive ? COLORS[phase].active : COLORS[phase].inactive;
        const glow = isActive ? `0 0 16px ${COLORS[phase].active}, 0 0 32px ${COLORS[phase].active}` : 'none';
        
        return (
          <div
            key={phase}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: glow,
              opacity: isActive ? 1 : 0.4,
              transition: 'all 0.3s ease',
            }}
          />
        );
      })}
    </div>
  );
}

function BroCardPS({ card, theme, onClick, index }) {
  const [loaded, setLoaded]   = useState(false);
  const [inView, setInView]   = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const t = THEMES[theme] || THEMES.gold;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.1, rootMargin: "0px 100px 0px 100px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleMouseEnter = (e) => {
    setHovered(true);
    onClick?.(card, true, e);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    onClick?.(card, false);
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={ref}
        onClick={() => onClick(card)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: "160px",
          aspectRatio: "2 / 3",
          borderRadius: "12px",
          overflow: "hidden",
          cursor: "pointer",
          position: "relative",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          transform: hovered ? "translateY(-5px) scale(1.04)" : "translateY(0) scale(1)",
          boxShadow: hovered ? `0 0 20px ${t.glow}` : "0 2px 8px rgba(0,0,0,0.5)",
          animationDelay: `${index * 55}ms`,
          animation: "broCardPop 0.35s ease both",
        }}
      >
        {card.alcance && (card.alcance === 'nacional' || card.alcance === 'internacional') && (
          <div style={{
            position: "absolute", top: 8, left: 8,
            padding: "3px 8px",
            background: "rgba(0,0,0,0.75)",
            border: `1px solid ${t.border}`,
            color: t.idColor,
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            borderRadius: "3px",
            zIndex: 3,
            boxShadow: `0 0 8px ${t.glow}`,
            backdropFilter: "blur(4px)",
          }}>
            [{card.alcance === 'nacional' ? 'NACIONAL' : 'GLOBAL'}]
          </div>
        )}
        
        {card.alcance && (card.alcance === 'nacional' || card.alcance === 'internacional') && (
          <div style={{
            position: "absolute", top: 8, left: 8,
            padding: "3px 8px",
            background: "rgba(0,0,0,0.75)",
            border: `1px solid ${t.border}`,
            color: t.idColor,
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            borderRadius: "3px",
            zIndex: 3,
            boxShadow: `0 0 8px ${t.glow}`,
            backdropFilter: "blur(4px)",
          }}>
            [{card.alcance === 'nacional' ? 'NACIONAL' : 'GLOBAL'}]
          </div>
        )}
        
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: `linear-gradient(90deg, transparent, ${t.border}, transparent)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
          zIndex: 2,
        }} />

        <div style={{ width: "100%", height: "calc(100% - 32px)", background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
          {inView && card.image_url && (
            <img
              src={card.image_url}
              alt={card.product_title || card.alias || 'Producto'}
              onLoad={() => setLoaded(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                opacity: loaded ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            />
          )}
          {!loaded && (
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.6s infinite",
            }} />
          )}
        </div>

        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "36px", background: t.footerBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1,
          borderTop: `1px solid ${t.border}40`,
        }}>
          <LunarSemaphor lunas={card.lunas} />
        </div>
      </div>
    </div>
  );
}

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
  }, [cards, checkScroll]);

  const scroll = (dir) =>
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });

  const arrowBtn = (dir, side) => (
    <button
      onClick={() => scroll(dir)}
      style={{
        position: "absolute", [side]: -10, top: "50%", transform: "translateY(-50%)",
        zIndex: 10, width: "26px", height: "26px", borderRadius: "50%",
        border: `1px solid ${t.border}`, background: "rgba(0,0,0,0.8)",
        color: t.idColor, fontSize: "14px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 8px ${t.glow}`,
      }}
    >{dir === -1 ? "‹" : "›"}</button>
  );

  if (!visible || cards.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes broCardPop {
          from { opacity:0; transform:scale(0.92) translateY(6px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes stripIn {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .bcs-scroll::-webkit-scrollbar { height:2px; }
        .bcs-scroll::-webkit-scrollbar-track { background:transparent; }
        .bcs-scroll::-webkit-scrollbar-thumb { background:${t.border}44; border-radius:2px; }
      `}</style>

      <div style={{ width: "100%", animation: "stripIn 0.35s ease both" }}>
        <div style={{ position: "relative" }}>
          {canLeft && (
            <>
              <div style={{ position:"absolute",left:0,top:0,bottom:0,width:"28px",background:"linear-gradient(90deg,rgba(0,0,0,0.7),transparent)",zIndex:5,pointerEvents:"none" }} />
              {arrowBtn(-1, "left")}
            </>
          )}

          <div
            ref={scrollRef}
            className="bcs-scroll"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              overflowX: "auto", overflowY: "scroll",
              padding: "2px 2px 6px",
              WebkitOverflowScrolling: "touch",
              justifyContent: cards.length < 4 ? "center" : "flex-start",
            }}
          >
            {cards.map((card, i) => (
              <BroCardPS
                key={card.bro_id || i}
                card={card}
                theme={accentColor}
                onClick={onSelectCard}
                index={i}
              />
            ))}
          </div>

          {canRight && (
            <>
              <div style={{ position:"absolute",right:0,top:0,bottom:0,width:"28px",background:"linear-gradient(270deg,rgba(0,0,0,0.7),transparent)",zIndex:5,pointerEvents:"none" }} />
              {arrowBtn(1, "right")}
            </>
          )}
        </div>
      </div>
    </>
  );
}
