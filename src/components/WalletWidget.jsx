import React from 'react';

const WalletWidget = ({ balances, onClick }) => {
  return (
    <div className="w-full font-mono bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-3">
      {/* HEADER: Ajustado a tamaño compacto */}
      <div className="flex flex-col items-center text-center mb-3">
        <span className="text-[9px] text-cyan-500 font-black tracking-[0.2em] mb-1">CANTIDAD LUNAS</span>
        <div className="text-3xl font-black text-white">{balances.genesis?.toLocaleString() || 0}</div>
      </div>
      
      {/* BOTÓN GESTIONAR: Con relleno para resaltar */}
      <button 
        onClick={onClick} 
        className="w-full py-2.5 bg-cyan-500/10 border border-cyan-500/50 rounded-lg text-[10px] font-black text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all uppercase tracking-[0.1em]"
      >
        Prepago IA Personajes
      </button>
    </div>
  );
};

export default WalletWidget;