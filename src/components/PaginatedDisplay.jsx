// src/components/PaginatedDisplay.jsx (VERSION FINAL: COMPACT + MATTER VISIBLE)

import React, { useState, useEffect } from 'react';

const PaginatedDisplay = ({ items, onSelect, onTuneIn, onOpenVideo }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => {
        setItemsPerPage(window.innerWidth < 768 ? 2 : 4);
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!items || items.length === 0) return null;

  const visibleItems = [];
  const totalItems = items.length;
  if (totalItems <= itemsPerPage) visibleItems.push(...items);
  else for (let i = 0; i < itemsPerPage; i++) visibleItems.push(items[(startIndex + i) % totalItems]);

  const nextSlide = () => { if (totalItems > itemsPerPage) setStartIndex((prev) => (prev + 1) % totalItems); };
  const prevSlide = () => { if (totalItems > itemsPerPage) setStartIndex((prev) => (prev - 1 + totalItems) % totalItems); };

  // --- GENERADOR DE ESTILOS (MATTER REVELADO) ---
  const getDualStyle = (colorString) => {
      let energy = 'cyan'; let matter = 'void';
      if (colorString && colorString.includes('-')) { [energy, matter] = colorString.split('-'); }
      
      // 1. MATERIA (FONDO): He subido la luminosidad para que SE VEA el color
      const bgMap = { 
          void:      'bg-black',              // Negro Puro
          carbon:    'bg-[#1a1a1a]',          // Gris Oscuro Visible
          navy:      'bg-[#0a1525]',          // Azul Marino Visible
          cobalt:    'bg-[#102040]',          // Azul Cobalto
          wine:      'bg-[#2d0b0b]',          // Rojo Vino Visible
          crimson:   'bg-[#350505]',          // Carmesí
          forest:    'bg-[#0a1f0a]',          // Verde Bosque
          emerald:   'bg-[#062121]',          // Esmeralda Oscuro
          plum:      'bg-[#1f0a2b]',          // Ciruela
          chocolate: 'bg-[#2b150a]'           // Marrón
      };
      
      // 2. ENERGÍA (Bordes y Texto)
      const energyMap = {
          cyan:    'border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]',
          fuchsia: 'border-fuchsia-500 text-fuchsia-500 shadow-[0_0_15px_rgba(232,121,249,0.2)]',
          yellow:  'border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]',
          green:   'border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]',
          blue:    'border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
          red:     'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
          orange:  'border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
          gold:    'border-[#C7AF38] text-[#C7AF38]',
          silver:  'border-[#D9D9D9] text-[#D9D9D9]',
          white:   'border-white text-white'
      };
      
      return { 
          container: `${bgMap[matter] || 'bg-black'} border-2 ${energyMap[energy] || energyMap.cyan}`, 
          text: energyMap[energy]?.split(' ')[1]
      };
  };

  return (
    // USAMOS FLEXBOX PARA ALINEAR
    <div className="w-full h-full flex flex-row items-center justify-center gap-2 md:gap-4 px-2 md:px-0 relative">
        
        {/* --- FLECHA IZQUIERDA --- */}
        <div className="shrink-0 flex justify-center z-[70]">
            {totalItems > itemsPerPage && (
                <button 
                    onClick={prevSlide} 
                    className="w-10 h-10 md:w-12 md:h-12 bg-black/80 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center hover:bg-white hover:text-black hover:scale-110 transition-all shadow-xl"
                >
                    <span className="text-2xl font-bold pb-1">‹</span>
                </button>
            )}
        </div>

        {/* --- GRID DE CARDS (COMPACTO: max-w-4xl) --- */}
        {/* Aquí está el cambio: 4xl hace las tarjetas más cortas */}
        <div className="flex-1 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleItems.map((item, index) => {
                    const style = getDualStyle(item.neonColor);
                    
                    return (
                        <div 
                            key={`${item.id}-${index}`} 
                            onClick={() => onSelect(item)}
                            className={`
                                relative w-full h-[150px] md:h-[160px] flex flex-row rounded-xl overflow-hidden cursor-pointer
                                ${style.container} transition-all duration-300 hover:scale-[1.02] hover:brightness-110
                            `}
                        >
                            {/* IMAGEN DE FONDO (Muy sutil para dejar ver el color MATTER) */}
                            <img src={item.img} className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay" alt="card-bg" />
                            
                            {/* DEGRADADO SUAVE (Ya no tapa el color de fondo) */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none"></div>

                            {/* CONTENIDO */}
                            <div className="relative z-10 flex flex-1 flex-row items-center p-3 gap-3">
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <img src={item.avatar_url} className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/20 object-cover shadow-lg bg-black" alt="av" />
                                </div>
                                
                                <div className="flex flex-col flex-1 min-w-0 justify-center px-1">
                                    {/* NICKNAME / SHOPNAME: Más grande y con más espacio */}
                                    <span className="text-[10px] md:text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-1">
                                        {item.shopName}
                                    </span>
                                    
                                    {/* TITULO PRINCIPAL */}
                                    <h3 className="text-white font-black text-xl md:text-1xl uppercase leading-none tracking-tighter italic truncate mb-2 drop-shadow-md">
                                        {item.name}
                                    </h3>
                                    
                                    {/* MESSAGE TWIT: Mucho más grande y legible */}
                                    <p className="text-gray-200 text-xs md:text-base font-medium italic leading-snug line-clamp-3 opacity-90">
                                        "{item.message}"
                                    </p>
                                </div>
                          </div>

                            {/* BARRA LATERAL DERECHA (Compacta) */}
                            <div className="relative z-10 w-[70px] md:w-[85px] bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center border-l border-white/10 gap-2">
                                <div className="text-center">
                                    <p className="text-[6px] text-gray-400 font-bold uppercase tracking-widest">PVP</p>
                                    <p className="text-base md:text-lg font-black text-white font-mono leading-none">
                                        {item.productData?.price || item.serviceData?.price || item.price || "--"}€
                                    </p>
                                </div>
                                
                                <div className="flex flex-col gap-1.5 w-full items-center px-1">
                                    {item.audioFile && <button onClick={(e) => {e.stopPropagation(); onTuneIn(item)}} className="w-full py-1 bg-red-600/80 rounded text-[9px] text-white hover:bg-red-500">▶ AUDIO</button>}
                                    {item.video_file && <button onClick={(e) => {e.stopPropagation(); onOpenVideo(item)}} className="w-full py-1 bg-fuchsia-600/80 rounded text-[9px] text-white hover:bg-fuchsia-500">🎥 CAM</button>}
                                </div>

                                <div className="text-[6px] font-bold text-gray-400 uppercase tracking-tighter">
                                    {item.distance}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* --- FLECHA DERECHA --- */}
        <div className="shrink-0 flex justify-center z-[70]">
            {totalItems > itemsPerPage && (
                <button 
                    onClick={nextSlide} 
                    className="w-10 h-10 md:w-12 md:h-12 bg-black/80 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center hover:bg-white hover:text-black hover:scale-110 transition-all shadow-xl"
                >
                    <span className="text-2xl font-bold pb-1">›</span>
                </button>
            )}
        </div>

    </div>
  );
};
export default PaginatedDisplay;