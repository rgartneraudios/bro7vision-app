// SlideRailCanjear.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const FALLBACKS = [
  "/images/slideraid_canjear_1.webp",
  "/images/slideraid_canjear_2.webp",
  "/images/slideraid_canjear_3.webp",
  "/images/slideraid_canjear_4.webp",
  "/images/slideraid_canjear_5.webp",
  "/images/slideraid_canjear_6.webp",
  "/images/slideraid_canjear_7.webp",
  "/images/slideraid_canjear_8.webp",
];

const SHOW_DURATION = 6000;
const PAUSE_DURATION = 8000;
const FADE_DURATION = 800;

export default function SlideRailCanjear() {
  const [slides, setSlides] = useState(Array(8).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    supabase
      .from('trivia_rail')
      .select('slot_numero, banner_url')
      .eq('sector', 'CANJES')
      .eq('activo', true)
      .then(({ data }) => {
        const arr = [...FALLBACKS];
        (data || []).forEach(r => {
          if (r.banner_url) arr[r.slot_numero - 1] = r.banner_url;
        });
        setSlides(arr);
      });
  }, []);

  useEffect(() => {
    let timeout;

    const cycle = () => {
      setVisible(true);
      setTimeout(() => setOpacity(1), 50);

      timeout = setTimeout(() => {
        setOpacity(0);
        setTimeout(() => {
          setVisible(false);
          setCurrentIndex(prev => (prev + 1) % slides.length);
          timeout = setTimeout(cycle, PAUSE_DURATION);
        }, FADE_DURATION);
      }, SHOW_DURATION);
    };

    timeout = setTimeout(cycle, 2000);
    return () => clearTimeout(timeout);
  }, [slides.length]);

  if (!visible) return null;

  return (
  <div
    className="hidden lg:block fixed left-[6%] top-[55%] -translate-y-1/2"
    style={{
      zIndex: 0,
      pointerEvents: 'none',
      opacity,
      transition: `opacity ${FADE_DURATION}ms ease-in-out`,
      width: "clamp(300px, 5vw, 1200px)",
    }}
  >
        <img
        src={slides[currentIndex]}
        alt="SlideRail Ad"
        className="w-full object-cover rounded-r-xl"
        style={{
          aspectRatio: "5 / 12",
          maxHeight: "80vh",
          boxShadow: "0 0 20px rgba(251,201,0,0.3)",
        }}
      />
    </div>
  );
}