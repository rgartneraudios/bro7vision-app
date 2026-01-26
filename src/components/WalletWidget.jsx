// src/components/WalletWidget.jsx (VERSION FINAL: COMPACT CORNER)
import React, { useState, useEffect } from 'react';

const WalletWidget = ({ balances, activePhase, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Iconos de fases para el switch
  const phases = {
      nova: '🌑',
      crescens: '🌓',
      plena: '🌕',
      decrescens: '🌗'
  };

  return (
    <div className="relative z-[100] font-mono pointer-events-auto">
        
        {/* BOTÓN SWITCH (Píldora Compacta) */}
        <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`
                flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-white/20 
                px-3 py-2 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all active:scale-95
                ${isOpen ? 'border-cyan-500 text-cyan-400' : 'text-white'}
            `}
        >
            <span className="text-lg animate-pulse">{phases[activePhase] || '💠'}</span>
            <div className="flex flex-col items-start leading-none">
                <span className="text-[7px] text-gray-400 uppercase font-bold tracking-wider">GENESIS</span>
                <span className="text-sm font-black tracking-tight">{balances.genesis || 0}</span>
            </div>
            {/* Indicador de desplegable */}
            <span className="text-[8px] opacity-50 ml-1">{isOpen ? '▲' : '▼'}</span>
        </button>

        {/* MENÚ DESPLEGABLE (Solo aparece si isOpen es true) */}
        {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl p-3 shadow-2xl animate-fadeIn origin-top-left">
                
                {/* Botón de recarga completa */}
                <div 
                    onClick={() => { onClick(); setIsOpen(false); }}
                    className="mb-3 pb-2 border-b border-white/10 text-center cursor-pointer hover:bg-white/5 rounded transition-colors"
                >
                    <p className="text-[9px] text-cyan-500 uppercase tracking-widest font-bold mb-1">GESTIONAR CARTERA</p>
                    <p className="text-xs text-gray-400">Canjear / Transferir</p>
                </div>

                {/* Grid de Moon Coins */}
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'nova', label: 'NVA', color: 'text-fuchsia-400' },
                        { id: 'crescens', label: 'CRS', color: 'text-green-400' },
                        { id: 'plena', label: 'PLN', color: 'text-yellow-400' },
                        { id: 'decrescens', label: 'DEC', color: 'text-orange-400' },
                    ].map((coin) => (
                        <div key={coin.id} className="bg-black/40 p-1.5 rounded border border-white/5 flex flex-col items-center">
                            <span className={`text-[8px] font-black ${coin.color}`}>{coin.label}</span>
                            <span className="text-[10px] font-bold text-white">{balances[coin.id] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default WalletWidget;