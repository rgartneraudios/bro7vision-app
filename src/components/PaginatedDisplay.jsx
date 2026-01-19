// src/components/PaginatedDisplay.jsx (VERSIÓN VOLUMEN LIMPIO + CRYSTAL UI)

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
              <div className="text-6xl animate-pulse text-white/50">📡</div>
              <p className="text-white/50 font-mono text-sm mt-4 uppercase tracking-widest">NO SIGNALS</p>
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
  const handleConnect = (item) => {
      if (item.url && item.url.trim() !== "") {
          let targetUrl = item.url.trim();
          if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
          window.open(targetUrl, '_blank');
      } else {
          alert("⚠️ (FASE 0) Enlace no configurado.");
      }
  };

  const handleGoToLive = (item) => {
      const cleanId = item.id.replace('_prod', '').replace('_serv', '');
      if (onTuneIn) {
          onTuneIn({
              id: cleanId, alias: item.shopName, img: item.img,
              audioFile: item.audioFile || "/audio/static_noise.mp3"
          });
      }
  };

  // --- PALETA DE COLORES SUTIL (Solo para detalles) ---
  const getAccentColor = (colorClass) => {
      if (colorClass?.includes('fuchsia')) return 'text-fuchsia-400 bg-fuchsia-500';
      if (colorClass?.includes('yellow')) return 'text-yellow-400 bg-yellow-500';
      if (colorClass?.includes('green')) return 'text-green-400 bg-green-500';
      if (colorClass?.includes('red')) return 'text-red-400 bg-red-500';
      return 'text-cyan-400 bg-cyan-500'; // Default Cyan
  };

  return (
    <div className="absolute top-[8%] bottom-[12%] w-full max-w-[1300px] left-1/2 -translate-x-1/2 z-40 flex items-center justify-center px-4">
        
        {/* FLECHAS DE NAVEGACIÓN (Discretas) */}
        {totalItems > itemsPerPage && (<button onClick={prevSlide} className="hidden md:flex text-white/50 hover:text-white text-6xl font-thin transition-all hover:scale-110 z-50 mr-8 cursor-pointer">‹</button>)}

        {/* CONTENEDOR CARTAS */}
        <div className="flex flex-row gap-10 items-center justify-center w-full h-full">
            {visibleItems.map((item, index) => {
                const accent = getAccentColor(item.neonColor);
                const accentText = accent.split(' ')[0];
                const accentBg = accent.split(' ')[1];

                return (
                    <div 
                        key={`${item.id}-${index}`}
                        className={`
                            relative w-full md:w-[320px] h-[620px] flex flex-col shrink-0
                            rounded-[2.5rem] bg-[#050505]
                            /* AQUÍ ESTÁ EL VOLUMEN: Sombra Negra Profunda */
                            shadow-[0_30px_60px_-10px_rgba(0,0,0,1)] 
                            transition-all duration-500 ease-out
                            hover:-translate-y-4 hover:shadow-[0_50px_80px_-20px_rgba(0,0,0,1)]
                            overflow-hidden isolate
                        `}
                    >
                        {/* 1. IMAGEN FULL (LIMPIA) */}
                        <div 
                            className="absolute inset-0 z-0 cursor-pointer"
                            onClick={() => onSelect(item)} 
                        >
                            <img 
                                src={item.img || 'https://via.placeholder.com/400x600'} 
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                                alt="item" 
                            />
                            {/* Degradado SOLO abajo para leer texto */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                            
                            {/* Brillo sutil superior (Reflejo de cristal) */}
                            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                        </div>

                        {/* 2. CAPA FLOTANTE SUPERIOR (Distancia + Live) */}
                        <div className="absolute top-5 left-0 right-0 px-6 flex justify-between items-start z-10 pointer-events-none">
                            {/* Distancia: Cápsula de Cristal */}
                            <div className="bg-black/30 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                                <div className={`w-1.5 h-1.5 rounded-full ${accentBg} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
                                <span className="text-white font-mono text-xs font-bold tracking-wider">{item.distance || 'Online'}</span>
                            </div>

                            {/* Botón Live (Si es real) */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleGoToLive(item); }}
                                className="bg-black/30 backdrop-blur-md border border-white/10 w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer pointer-events-auto"
                            >
                                📡
                            </button>
                        </div>

                        {/* 3. MENSAJE FLOTANTE (CENTRO) */}
                        <div className="absolute top-[35%] left-4 right-4 z-10 pointer-events-none flex justify-center">
                            <div className="bg-white/5 backdrop-blur-sm border-l-2 border-white/30 pl-4 py-2 pr-2 rounded-r-lg max-w-[90%]">
                                <p className="font-mono text-lg font-bold italic leading-snug text-white/90 drop-shadow-md">
                                    "{item.message || "..."}"
                                </p>
                            </div>
                        </div>

                        {/* 4. FOOTER (DATOS + ACCIÓN) */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pointer-events-none">
                            
                            {/* Títulos */}
                            <div className="mb-6">
                                <p className={`text-[10px] uppercase font-bold tracking-[0.3em] mb-1 opacity-80 ${accentText}`}>
                                    {item.shopName}
                                </p>
                                <h3 className="text-white font-black text-3xl uppercase leading-none drop-shadow-lg">
                                    {item.name}
                                </h3>
                            </div>

                            {/* Fila de Acción */}
                            <div className="flex items-center justify-between gap-4 pointer-events-auto">
                                
                                {/* Precio */}
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-white/40 uppercase">FASE 0</span>
                                    <span className="text-2xl font-mono font-bold text-white">{item.price || '0'}</span>
                                </div>

                                {/* Botón Conectar (Minimalista) */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleConnect(item); }}
                                    className={`
                                        flex-1 py-3 px-4 rounded-xl 
                                        bg-white text-black font-black uppercase text-[10px] tracking-[0.2em]
                                        hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]
                                        flex items-center justify-center gap-2 cursor-pointer
                                    `}
                                >
                                    CONECTAR <span className="text-sm">↗</span>
                                </button>
                            </div>
                        </div>

                    </div>
                );
            })}
        </div>

        {totalItems > itemsPerPage && (<button onClick={nextSlide} className="hidden md:flex text-white/50 hover:text-white text-6xl font-thin transition-all hover:scale-110 z-50 ml-8 cursor-pointer">›</button>)}

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