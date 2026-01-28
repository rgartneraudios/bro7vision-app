// src/components/HoloArcade.jsx
import React from 'react';

const HoloArcade = ({ gameUrl, title, onClose }) => {
  if (!gameUrl) return null;

  return (
    <div className="fixed inset-0 z-[200000] bg-black animate-fadeIn overflow-hidden">
      
      {/* BOTÓN CERRAR FLOTANTE (Minimalista para no romper la inmersión) */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-[200001] bg-black/20 hover:bg-red-600/80 text-white/40 hover:text-white px-3 py-1 rounded-full border border-white/10 hover:border-white/40 transition-all text-[10px] font-black uppercase tracking-widest backdrop-blur-sm"
      >
        Cerrar Conexión ✕
      </button>

      {/* EL JUEGO OCUPA EL 100% REAL */}
      <iframe 
        src={gameUrl} 
        title={title}
        className="w-full h-full border-none"
        allow="autoplay; fullscreen; gamepad"
      />

      {/* MARGEN DE SEGURIDAD (Opcional: un sutil resplandor fucsia en los bordes) */}
      <div className="absolute inset-0 pointer-events-none border-2 border-fuchsia-500/10 shadow-[inset_0_0_100px_rgba(0,0,0,1)]"></div>
    </div>
  );
};

export default HoloArcade;