// src/components/WalletWidget.jsx (FIX UPWARDS & PC OPEN)

import React, { useState, useEffect } from 'react';

const WalletWidget = ({ balances, activePhase, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar si es móvil o PC para comportamiento por defecto
  useEffect(() => {
    const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        // En PC siempre abierto, en Móvil cerrado por defecto
        if (!mobile) setIsOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Check inicial
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const moonCoins = [
    { id: 'nova', label: 'NOVA', color: 'bg-fuchsia-500', text: 'text-fuchsia-400' },
    { id: 'crescens', label: 'CRESCENS', color: 'bg-green-500', text: 'text-green-400' },
    { id: 'plena', label: 'PLENA', color: 'bg-yellow-400', text: 'text-yellow-400' },
    { id: 'decrescens', label: 'DECRESCENS', color: 'bg-orange-500', text: 'text-orange-400' },
  ];

  return (
    <div className="relative group pointer-events-auto z-[60]">
        
        {/* === BOTÓN DE APERTURA (SOLO MÓVIL) === */}
        {/* En PC lo ocultamos porque estará siempre desplegado */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`
                md:hidden flex items-center gap-2 bg-black/90 border border-white/20 px-4 py-2 rounded-full shadow-lg backdrop-blur-md transition-all
                ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            `}
        >
            <span className="text-lg animate-pulse">💠</span>
            <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">GÉNESIS</span>
                <span className="text-sm font-black text-white font-mono">{balances.genesis || 0}</span>
            </div>
            <span className="text-[10px] text-gray-500 ml-1">▲</span>
        </button>

        {/* === PANEL DESPLEGABLE === */}
        <div 
            className={`
                bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-52 transition-all
                
                /* POSICIONAMIENTO MÓVIL (UPWARDS) */
                absolute bottom-0 left-1/2 -translate-x-1/2 mb-2
                origin-bottom transform
                ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}

                /* POSICIONAMIENTO PC (NORMAL) */
                md:relative md:bottom-auto md:left-auto md:translate-x-0 md:mb-0
                md:origin-top-left md:scale-100 md:opacity-100
            `}
        >
            {/* BOTÓN CERRAR (Solo Móvil) */}
            <button onClick={() => setIsOpen(false)} className="md:hidden absolute top-2 right-2 text-gray-500 hover:text-white text-xs p-1">✕</button>

            <div className="mb-4 pb-3 border-b border-white/10 text-center" onClick={onClick} style={{cursor: 'pointer'}}>
                <p className="text-[9px] text-indigo-400 uppercase tracking-[0.2em] font-bold mb-1 animate-pulse">[ TOKEN ]</p>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">💠</span>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono leading-none">GÉNESIS</p>
                        <p className="text-2xl font-black text-white leading-none tracking-tighter">{balances.genesis || 0}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1.5 opacity-80">
                {moonCoins.map((coin) => (
                    <div key={coin.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><div className={`w-1 h-1 rounded-full ${coin.color}`}></div><span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">{coin.label}</span></div>
                        <span className="text-[10px] font-mono font-bold text-gray-700">{balances[coin.id] || 0}</span>
                    </div>
                ))}
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 text-center"><p className="text-[8px] text-gray-500">CONVERTIBLE EN FASE 1</p></div>
        </div>
    </div>
  );
};

export default WalletWidget;