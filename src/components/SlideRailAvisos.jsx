// src/components/SlideRailAvisos.jsx
import { useState, useEffect } from "react";

const SLIDES = [
  "/images/evelyn_1.webp",
  "/images/evelyn_2.webp",
  "/images/evelyn_3.webp",
  "/images/evelyn_4.webp",
  "/images/evelyn_5.webp",
  "/images/evelyn_6.webp",
  "/images/evelyn_7.webp",
  "/images/evelyn_8.webp",
];

const SHOW_DURATION  = 6000;
const PAUSE_DURATION = 8000;
const FADE_DURATION  = 800;

export default function SlideRailAvisos() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible,      setVisible]      = useState(false);
  const [opacity,      setOpacity]      = useState(0);

  useEffect(() => {
    let timeout;
    const cycle = () => {
      setVisible(true);
      setTimeout(() => setOpacity(1), 50);
      timeout = setTimeout(() => {
        setOpacity(0);
        setTimeout(() => {
          setVisible(false);
          setCurrentIndex(prev => (prev + 1) % SLIDES.length);
          timeout = setTimeout(cycle, PAUSE_DURATION);
        }, FADE_DURATION);
      }, SHOW_DURATION);
    };
    timeout = setTimeout(cycle, 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="hidden lg:block fixed left-[6%] top-1/2 -translate-y-1/2 z-30 pointer-events-none"
      style={{
        opacity,
        transition: `opacity ${FADE_DURATION}ms ease-in-out`,
        width: "clamp(300px, 5vw, 1200px)",
      }}
    >
      <img
        src={SLIDES[currentIndex]}
        alt="Avisos SlideRail"
        className="w-full object-cover rounded-r-xl"
        style={{
          aspectRatio: "5 / 12",
          maxHeight: "80vh",
          boxShadow: "0 0 20px rgba(249,115,22,0.4)",  // naranja — color de Avisos
        }}
      />
    </div>
  );
}
