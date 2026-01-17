// src/components/StoryPlayer.jsx (VERSIÓN CINE FULL SCREEN)

import React, { useState, useEffect, useRef } from 'react';
import { MOON_MATRIX } from '../data/MoonMatrix';

const StoryPlayer = ({ src, activePhase, onClose, onComplete }) => {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [creditsMined, setCreditsMined] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Configuración de la Recompensa
  const TOTAL_REWARD = 50; 
  const phaseData = MOON_MATRIX[activePhase];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        setProgress(pct);
        const currentMined = Math.min(TOTAL_REWARD, Math.floor((pct / 100) * TOTAL_REWARD));
        setCreditsMined(currentMined);
      }
    };

    const handleEnded = () => {
      setIsCompleted(true);
      setCreditsMined(TOTAL_REWARD);
      setTimeout(() => {
        onComplete(TOTAL_REWARD);
      }, 1000); 
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onComplete, TOTAL_REWARD]);

  return (
    // CAMBIO: z-[200] para estar encima de todo. Fondo negro.
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-fadeIn font-mono">
      
      {/* 1. VIDEO A PANTALLA COMPLETA (Full Viewport) */}
      <div className="absolute inset-0 w-full h-full">
        <video 
            ref={videoRef}
            src={src} 
            autoPlay 
            playsInline // IMPORTANTE PARA MÓVIL (Evita que iOS abra su propio player)
            className="w-full h-full object-cover" // Cubre toda la pantalla sin bordes
        />

        {/* OVERLAY: TEXTURA Y DEGRADADOS (Para que se lean los textos) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
      </div>

      {/* 2. HUD SUPERIOR (LOGO + CERRAR) */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30 safe-area-top">
          
          {/* SPONSOR TAG */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              {/* CAMBIO: AQUI VA TU LOGO */}
              {/* Asegúrate de poner un archivo 'logo.png' en tu carpeta public */}
              <img 
                src="/logo.png" 
                onError={(e) => {e.target.style.display='none'}} // Si no hay logo, se oculta
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
              
              {/* Si no tienes logo aún, puedes descomentar esto provisionalmente: */}
              {/* <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-black text-xs">B7</div> */}

              <div>
                  <p className="text-[8px] text-gray-300 uppercase tracking-widest leading-none mb-1">Sponsored by</p>
                  <p className="text-white font-bold tracking-wide text-xs leading-none">BROSTORIES</p>
              </div>
          </div>

          {/* BOTÓN CERRAR */}
          <button 
              onClick={onClose} 
              className="bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all backdrop-blur-md"
          >
              ✕ SALIR
          </button>
      </div>

      {/* 3. HUD INFERIOR (MINERÍA DE CRÉDITOS) */}
      {/* Ajustado para móviles: más margen abajo */}
      <div className="absolute bottom-8 left-6 right-6 z-30 flex justify-center md:justify-start safe-area-bottom">
          <div className={`
              flex items-center gap-4 bg-black/80 backdrop-blur-xl border border-${phaseData.color}-500/50 
              px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all
              ${isCompleted ? `shadow-[0_0_50px_${phaseData.color}] border-${phaseData.color}-400 scale-105` : ''}
          `}>
              
              {/* ICONO ANIMADO */}
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                  <svg className={`w-full h-full text-${phaseData.color}-500 ${!isCompleted ? 'animate-spin-slow' : ''}`} viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="10 5" />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center font-black text-xs text-white`}>
                      {phaseData.label[0]}
                  </span>
              </div>

              {/* CONTADOR */}
              <div className="min-w-[100px]">
                  <p className={`text-[8px] uppercase tracking-widest font-bold text-${phaseData.color}-400 mb-0.5`}>
                      {isCompleted ? 'RECOMPENSA RECIBIDA' : `MINANDO CRÉDITOS...`}
                  </p>
                  <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-mono font-black text-white tabular-nums tracking-tighter">
                          +{creditsMined}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">GEN</span>
                  </div>
              </div>

          </div>
      </div>

      {/* BARRA DE PROGRESO INFERIOR (PEGADA AL BORDE) */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-900 z-40">
          <div 
              className={`h-full bg-${phaseData.color}-500 shadow-[0_0_20px_${phaseData.color}] transition-all duration-200 ease-linear`} 
              style={{ width: `${progress}%` }}
          ></div>
      </div>

    </div>
  );
};

export default StoryPlayer;