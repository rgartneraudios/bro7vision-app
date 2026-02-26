import React from 'react';

const WalletWidget = ({ balances, activePhase, onClick }) => {
  const phases = {
      nova: '🌑',
      crescens: '🌓',
      plena: '🌕',
      decrescens: '🌗'
  };

  return (
    // Quitamos "relative" y el botón; ahora es un bloque directo
    <div className="w-full font-mono pointer-events-auto bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* CABECERA PRINCIPAL (Antes era el botón) */}
        <div 
            onClick={onClick}
            className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
        >
            <div className="flex items-center gap-3">
                <span className="text-2xl animate-pulse">{phases[activePhase] || '💠'}</span>
                <div className="flex flex-col items-start leading-none">
                    <span className="text-[8px] text-cyan-500 uppercase font-black tracking-[0.2em]">SISTEMA GENESIS</span>
                    <span className="text-xl font-black tracking-tight text-white">{balances.genesis || 0}</span>
                </div>
            </div>
            <span className="text-[10px] text-gray-500 font-bold">WALLET</span>
        </div>

        {/* GRID DE MONEDAS (Ahora siempre visible y expandido) */}
        <div className="p-4 bg-[#0a0a0a]/60">
            <div className="grid grid-cols-2 gap-3">
                {[
                    { id: 'nova', label: 'NOVA', color: 'text-fuchsia-400', border: 'border-fuchsia-500/20' },
                    { id: 'crescens', label: 'CRES', color: 'text-green-400', border: 'border-green-500/20' },
                    { id: 'plena', label: 'PLENA', color: 'text-yellow-400', border: 'border-yellow-500/20' },
                    { id: 'decrescens', label: 'DECR', color: 'text-orange-400', border: 'border-orange-500/20' },
                ].map((coin) => (
                    <div key={coin.id} className={`bg-black/60 p-2.5 rounded-xl border ${coin.border} flex flex-col items-center justify-center`}>
                        <span className={`text-[9px] font-black mb-1 ${coin.color} tracking-widest`}>{coin.label}</span>
                        <span className="text-sm font-bold text-white leading-none">{balances[coin.id] || 0}</span>
                    </div>
                ))}
            </div>
            
            {/* ACCESO A GESTIÓN */}
            <button 
                onClick={onClick}
                className="w-full mt-4 py-2 border border-cyan-500/30 rounded-lg text-[9px] font-black text-cyan-500 uppercase tracking-[0.2em] hover:bg-cyan-500 hover:text-black transition-all"
            >
                GESTIONAR CARTERA
            </button>
        </div>
    </div>
  );
};

export default WalletWidget;