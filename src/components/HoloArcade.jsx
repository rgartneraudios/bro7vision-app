import React from 'react';

const HoloArcade = ({ gameUrl, title, onClose }) => {
  if (!gameUrl) return null;

  return (
    // z-[200000] para asegurar que esté por encima de TODO
    <div className="fixed inset-0 z-[200000] bg-black flex flex-col animate-fadeIn">
      
      {/* CABECERA COMPACTA */}
      <div className="w-full bg-black/90 border-b border-fuchsia-500/50 p-3 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎮</span>
          <h2 className="text-white font-black italic uppercase text-xs tracking-widest">{title}</h2>
        </div>
        <button 
          onClick={onClose}
          className="bg-fuchsia-600 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase hover:bg-white hover:text-fuchsia-600 transition-all border border-fuchsia-400"
        >
          Cerrar ✕
        </button>
      </div>

      {/* CONTENEDOR DEL JUEGO: OCUPA TODO EL RESTO DE LA PANTALLA */}
      <div className="flex-1 w-full bg-black relative">
        <iframe 
          src={gameUrl} 
          title={title}
          className="w-full h-full border-none"
          // Importante para que el juego reciba las teclas
          allow="autoplay; fullscreen; gamepad" 
        />
      </div>

      {/* FOOTER MINI */}
      <div className="w-full bg-black border-t border-fuchsia-500/30 p-1 text-center">
        <p className="text-[7px] text-gray-500 font-mono uppercase tracking-[0.3em]">
          BRO7VISION ARCADE RUNTIME
        </p>
      </div>
    </div>
  );
};

export default HoloArcade;