// src/components/BroCardStrip.jsx  v4
// ─────────────────────────────────────────────────────────────
// Imagen 2:3 + Grid 2 filas × 4 tarjetas + Tooltip Cyberpunk flotante
// bro_id es solo interno — el user ve la imagen y el nombre.
// ─────────────────────────────────────────────────────────────
import { useRef, useEffect, useState, useCallback } from "react";

const THEMES = {
  gold:  { glow: "rgba(251,191,36,0.5)",  border: "#fbbf24", idColor: "#fbbf24", footerBg: "#000000" },
  cyan:  { glow: "rgba(34,211,238,0.5)",  border: "#22d3ee", idColor: "#22d3ee", footerBg: "#000000" },
  slate: { glow: "rgba(100,116,139,0.5)", border: "#64748b", idColor: "#ffffff", footerBg: "#475569" },
  blue:  { glow: "rgba(30,58,138,0.5)",   border: "#1e3a8a", idColor: "#ffffff", footerBg: "#00081C" },
};

function BroCard({ card, theme, onClick, index, onHoverChange }) {
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

  const displayName = card.nombre
    ? card.nombre.length > 10 ? card.nombre.slice(0, 10) + '…' : card.nombre
    : card.bro_pd;

  const handleMouseEnter = (e) => {
    setHovered(true);
    onHoverChange?.(card, true, e);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    onHoverChange?.(card, false);
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={ref}
        onClick={() => onClick(card)}
        onMouseEnter={(e) => handleMouseEnter(e)}
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
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: `linear-gradient(90deg, transparent, ${t.border}, transparent)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
          zIndex: 2,
        }} />

        <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
          {inView && card.banner_url && (
            <img
              src={card.banner_url}
              alt={displayName}
              onLoad={() => setLoaded(true)}
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
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
      </div>
    </div>
  );
}

export default function BroCardStrip({
  cards = [],
  onSelectCard,
  accentColor = "gold",
  label = "",
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

  const handleCardHover = useCallback((card, isHovering) => {
    // Tooltip eliminado
  }, []);

  if (!visible || cards.length === 0) return null;

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
        @keyframes tooltipFadeIn {
          from { opacity:0; transform:translateY(10px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
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
              <BroCard
                key={card.bro_pd || i}
                card={card}
                theme={accentColor}
                onClick={onSelectCard}
                index={i}
                onHoverChange={handleCardHover}
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
