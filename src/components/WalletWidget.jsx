// src/components/WalletWidget.jsx
import React, { useState, useEffect } from 'react';

const WalletWidget = ({ balances, activePhase, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (!mobile) setIsOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const moonCoins = [
    { id: 'nova', label: 'NVA', color: 'bg-fuchsia-500' },
    { id: 'crescens', label: 'CRS', color: 'bg-green-500' },
    { id: 'plena', label: 'PLN', color: 'bg-yellow-400' },
    { id: 'decrescens', label: 'DEC', color: 'bg-orange-500' },
  ];

  return (
    <div className="relative group pointer-events-auto z-[60]">
        <button onClick={() => setIsOpen(!isOpen)} className={`md:hidden flex items-center gap-2 bg-black/90 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
            <span className="text-sm">💠</span>
            <span className="text-xs font-black text-white font-mono">{balances.genesis || 0}</span>
        </button>

        <div className={`
                bg-black/95 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl shadow-2xl w-44 transition-all
                absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 origin-bottom transform
                ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}
                md:relative md:bottom-auto md:left-auto md:translate-x-0 md:scale-100 md:opacity-100
            `}>
            
            <div className="mb-2 pb-2 border-b border-white/10 text-center cursor-pointer" onClick={onClick}>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">💠</span>
                    <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest font-mono">GÉNESIS</p>
                        <p className="text-lg font-black text-white leading-none">{balances.genesis || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 opacity-70">
                {moonCoins.map((coin) => (
                    <div key={coin.id} className="flex items-center justify-between">
                        <span className="text-[7px] font-bold text-gray-500">{coin.label}</span>
                        <span className="text-[9px] font-mono font-bold text-white">{balances[coin.id] || 0}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default WalletWidget;