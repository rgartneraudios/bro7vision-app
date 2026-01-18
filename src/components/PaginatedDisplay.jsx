// src/components/PaginatedDisplay.jsx (VERSIÓN ZONAS SEGURAS)

import React, { useState, useEffect } from 'react';

const PaginatedDisplay = ({ items, onSelect, onTuneIn }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => setItemsPerPage(window.innerWidth < 768 ? 1 : 3);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!items || items.length === 0) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center pt-20">
              <div className="text-6xl animate-pulse text-cyan-500">📡</div>
              <p className="text-cyan-500 font-mono text-sm mt-4 uppercase tracking-widest">NO SIGNALS DETECTED</p>
          </div>
      );
  }

  const visibleItems = [];
  const totalItems = items.length;
  
  if (totalItems <= itemsPerPage) visibleItems.push(...items);
  else for (let i = 0; i < itemsPerPage; i++) visibleItems.push(items[(startIndex + i) % totalItems]);

  const nextSlide = (e) => { e?.stopPropagation(); if (totalItems > itemsPerPage) setStartIndex((prev) => (prev + 1) % totalItems); };
  const prevSlide = (e) => { e?.stopPropagation(); if (totalItems > itemsPerPage) setStartIndex((prev) => (prev - 1 + totalItems) % totalItems); };

  // --- ACCIONES ---
  const handleConnect = (item, e) => {
      e.stopPropagation(); // Detener propagación
      e.preventDefault();
      
      console.log("CLICK EN CONECTAR:", item.url);

      if (item.url && item.url.trim() !== "") {
          let targetUrl = item.url.trim();
          if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
          window.open(targetUrl, '_blank');
      } else {
          // Si es un item de la DB vieja sin URL, avisamos
          alert("⚠️ (FASE 0) Este comercio simulado no tiene enlace real.");
      }
  };

  const handleGoToLive = (item, e) => {
      e.stopPropagation();
      const cleanId = item.id.replace('_prod', '').replace('_serv', '');
      if (onTuneIn) {
          onTuneIn({
              id: cleanId,
              alias: item.shopName, 
              img: item.img,
              audioFile: item.audioFile || "/audio/static_noise.mp3"
          });
      }
  };

  const getCardTheme = (colorClass) => {
      let theme = { border: 'border-white', shadow: 'shadow-[0_0_25px_rgba(255,255,255,0.3)]', bg: 'bg-gradient-to-b from-gray-900 to-black', text: 'text-white', button: 'hover:bg-gray-200' };
      if (!colorClass) return theme;
      if (colorClass.includes('cyan')) theme = { border: 'border-cyan-500', shadow: 'shadow-[0_0_35px_rgba(6,182,212,0.6)]', bg: 'bg-gradient-to-b from-cyan-950/80 via-black to-black', text: 'text-cyan-400', button: 'hover:bg-cyan-400' };
      else if (colorClass.includes('fuchsia')) theme = { border: 'border-fuchsia-500', shadow: 'shadow-[0_0_35px_rgba(217,70,239,0.6)]', bg: 'bg-gradient-to-b from-fuchsia-950/80 via-black to-black', text: 'text-fuchsia-400', button: 'hover:bg-fuchsia-400' };
      else if (colorClass.includes('yellow')) theme = { border: 'border-yellow-400', shadow: 'shadow-[0_0_35px_rgba(250,204,21,0.6)]', bg: 'bg-gradient-to-b from-yellow-900/80 via-black to-black', text: 'text-yellow-400', button: 'hover:bg-yellow-400' };
      else if (colorClass.includes('green')) theme = { border: 'border-green-500', shadow: 'shadow-[0_0_35px_rgba(34,197,94,0.6)]', bg: 'bg-gradient-to-b from-green-950/80 via-black to-black', text: 'text-green-400', button: 'hover:bg-green-400' };
      else if (colorClass.includes('red')) theme = { border: 'border-red-500', shadow: 'shadow-[0_0_35px_rgba(239,68,68,0.6)]', bg: 'bg-gradient-to-b from-red-950/80 via-black to-black', text: 'text-red-500', button: 'hover:bg-red-500' };
      return theme;
  };

  return (
    <div className="absolute top-[12%] bottom-[12%] w-full max-w-[1200px] left-1/2 -translate-x-1/2 z-40 flex items-center justify-center px-4">
        {totalItems > itemsPerPage && (<button onClick={prevSlide} className="hidden md:flex bg-black hover:bg-white/20 text-white border border-white/30 rounded-full w-12 h-12 items-center justify-center transition-all hover:scale-110 z-50 mr-6 font-black text-2xl cursor-pointer">❮</button>)}

        <div className="flex flex-row gap-6 items-center justify-center w-full h-full">
            {visibleItems.map((item, index) => {
                const theme = getCardTheme(item.neonColor);
                
                return (
                    <div 
                        key={`${item.id}-${index}`}
                        // QUITAMOS EL ONCLICK DEL PADRE PARA EVITAR CONFLICTOS
                        className={`
                            relative w-full md:w-[280px] h-[560px] flex flex-col shrink-0
                            rounded-[2rem] border-[3px]
                            ${theme.bg} ${theme.border} ${theme.shadow}
                            hover:scale-[1.03] transition-transform duration-300 overflow-hidden
                        `}
                    >
                        {/* --- ZONA 1: CUERPO CLICABLE (Abre PaymentModal) --- */}
                        <div 
                            className="flex-1 flex flex-col cursor-pointer"
                            onClick={() => onSelect(item)} // Solo esta parte abre el modal
                        >
                            {/* IMAGEN */}
                            <div className={`relative h-44 w-full shrink-0 border-b border-white/10`}>
                                <img src={item.img || 'https://via.placeholder.com/400x300'} className="w-full h-full object-cover opacity-80" alt="item" />
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-lg shadow-xl transform rotate-[-2deg] border-2 border-black">
                                    <p className="text-xl font-black tracking-tighter leading-none">{item.distance || 'Online'}</p>
                                </div>
                                <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest border border-gray-600">
                                    {item.category || 'SHOP'} 🔒
                                </div>
                            </div>

                            {/* MENSAJE */}
                            <div className="flex-1 px-4 flex flex-col items-center justify-center text-center mt-2">
                                <p className={`font-mono text-lg font-bold italic leading-snug ${theme.text} drop-shadow-md`}>
                                    "{item.message || "Esperando señal..."}"
                                </p>
                            </div>
                        </div>

                        {/* --- ZONA 2: FOOTER INTERACTIVO (NO abre PaymentModal) --- */}
                        <div className="p-4 pt-2 flex flex-col items-center text-center bg-black/30 backdrop-blur-md border-t border-white/10 relative z-50">
                            
                            <h3 className="text-white font-black text-xl uppercase leading-none mb-1 cursor-default">{item.name}</h3>
                            <p className="text-gray-400 text-[10px] uppercase font-bold mb-3 tracking-widest cursor-default">{item.shopName}</p>

                            <div className={`w-full h-[1px] mb-3 opacity-50 ${theme.border.replace('border-', 'bg-')}`}></div>

                            <div className="w-full flex items-end justify-between">
                                {/* BOTÓN ANTENA */}
                                <button 
                                    onClick={(e) => handleGoToLive(item, e)}
                                    className="text-gray-400 hover:text-white transition-colors p-2 hover:scale-110 cursor-pointer"
                                >
                                    <span className="text-2xl animate-pulse">📡</span>
                                </button>

                                {/* PRECIO (No hace nada) */}
                                <div className="text-center cursor-default">
                                    <p className="text-[7px] text-gray-500 uppercase font-mono">FASE 0</p>
                                    <p className="text-xl font-black text-white leading-none">{item.price || '0 GEN'}</p>
                                </div>

                                {/* BOTÓN CONECTAR */}
                                <button 
                                    onClick={(e) => handleConnect(item, e)}
                                    className={`
                                        bg-white text-black px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest 
                                        transition-colors shadow-lg flex gap-1 items-center cursor-pointer hover:scale-105 active:scale-95
                                        ${theme.button}
                                    `}
                                >
                                    <span>{item.url ? 'CONECTAR' : 'VER'}</span>
                                    <span className="text-xs">↗</span>
                                </button>
                            </div>
                        </div>

                    </div>
                );
            })}
        </div>

        {totalItems > itemsPerPage && (<button onClick={nextSlide} className="hidden md:flex bg-black hover:bg-white/20 text-white border border-white/30 rounded-full w-12 h-12 items-center justify-center transition-all hover:scale-110 z-50 ml-6 font-black text-2xl cursor-pointer">❯</button>)}

        {totalItems > 1 && (
            <div className="md:hidden absolute -bottom-10 left-0 right-0 flex justify-center gap-6 z-50">
                <button onClick={prevSlide} className="w-10 h-10 rounded-full border border-white/20 bg-black text-white flex items-center justify-center cursor-pointer">←</button>
                <button onClick={nextSlide} className="w-10 h-10 rounded-full border border-white/20 bg-black text-white flex items-center justify-center cursor-pointer">→</button>
            </div>
        )}
    </div>
  );
};

export default PaginatedDisplay;