// SlideRailCanjear.jsx
import { useState, useEffect } from "react";

const SLIDES = [
  "/images/slideraid_canjear_1.webp",
  "/images/slideraid_canjear_2.webp",
  "/images/slideraid_canjear_3.webp",
  "/images/slideraid_canjear_4.webp",
  "/images/slideraid_canjear_5.webp",
  "/images/slideraid_canjear_6.webp",
  "/images/slideraid_canjear_7.webp",
  "/images/slideraid_canjear_8.webp",
];

const SHOW_DURATION = 6000;   // 6s visible
const PAUSE_DURATION = 8000;  // 8s invisible entre apariciones
const FADE_DURATION = 800;    // ms del fade CSS

export default function SlideRailCanjear() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let timeout;

    const cycle = () => {
      // Fade IN
      setVisible(true);
      setTimeout(() => setOpacity(1), 50);

      // Fade OUT después de SHOW_DURATION
      timeout = setTimeout(() => {
        setOpacity(0);
        setTimeout(() => {
          setVisible(false);
          // Siguiente imagen
          setCurrentIndex(prev => (prev + 1) % SLIDES.length);
          // Pausa antes del próximo ciclo
          timeout = setTimeout(cycle, PAUSE_DURATION);
        }, FADE_DURATION);
      }, SHOW_DURATION);
    };

    // Arranca con una pausa inicial de 2s
    timeout = setTimeout(cycle, 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
  <div
    className="hidden lg:block fixed left-[6%] top-[55%] -translate-y-1/2 z-30 pointer-events-none"
    style={{
      opacity,
      transition: `opacity ${FADE_DURATION}ms ease-in-out`,
      width: "clamp(300px, 5vw, 1200px)",
    }}
  >
  
        <img
        src={SLIDES[currentIndex]}
        alt="SlideRail Ad"
        className="w-full object-cover rounded-r-xl"
        style={{
          aspectRatio: "5 / 12",
          maxHeight: "80vh",
          boxShadow: "0 0 20px rgba(251,201,0,0.3)",  // neon cyan sutil
        }}
      />
    </div>
  );
}