import React from 'react';

const HoloArcade = ({ gameUrl, title, onClose }) => {
  if (!gameUrl) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-0 md:p-8 animate-fadeIn">
      {/* CAPA DE FONDO NEÓN */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/20 via-black to-black"></div>

      {/* CABECERA DE LA CONSOLA */}
      <div className="relative z-10 w-full max-w-5xl bg-black border-x-2 border-t-2 border-fuchsia-500 rounded-t-2xl p-4 flex justify-between items-center shadow-[0_-10px_30px_rgba(217,70,239,0.3)]">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🎮</span>
          <div>
            <h2 className="text-white font-black italic uppercase text-sm tracking-tighter leading-none">{title}</h2>
            <p className="text-[8px] text-fuchsia-400 font-mono mt-1 uppercase tracking-widest">HoloArcade Runtime Active</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="bg-fuchsia-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase hover:bg-white hover:text-fuchsia-600 transition-all"
        >
          Cerrar Juego ✕
        </button>
      </div>

      {/* CONTENEDOR DEL JUEGO (iFrame) */}
      <div className="relative z-10 w-full max-w-5xl aspect-video bg-black border-2 border-fuchsia-500 shadow-[0_0_50px_rgba(217,70,239,0.2)] overflow-hidden">
        <iframe 
          src={gameUrl} 
          title={title}
          className="w-full h-full border-none"
          allow="autoplay; fullscreen; gamepad"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
        
        {/* OVERLAY DE CARGA (Opcional) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
            <span className="text-white font-black text-9xl italic">BRO7</span>
        </div>
      </div>

      {/* FOOTER DE LA CONSOLA */}
      <div className="relative z-10 w-full max-w-5xl bg-gray-900/50 border-x-2 border-b-2 border-fuchsia-500 rounded-b-2xl p-3 text-center">
        <p className="text-[8px] text-gray-400 font-mono uppercase tracking-[0.3em]">
          Powered by BRO7VISION P2P Engine • Fase 1 • Enjoy the Reality
        </p>
      </div>
    </div>
  );
};

export default HoloArcade;