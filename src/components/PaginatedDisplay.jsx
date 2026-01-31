// src/components/PaginatedDisplay.jsx (FIX: MESSAGE DISPLAY)
import React, { useState, useEffect } from 'react';

const PaginatedDisplay = ({ items, onSelect, onTuneIn, onOpenVideo }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => { setItemsPerPage(window.innerWidth < 768 ? 2 : 4); };
    handleResize(); window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!items || items.length === 0) return null;

  const visibleItems = [];
  const totalItems = items.length;
  if (totalItems <= itemsPerPage) visibleItems.push(...items);
  else for (let i = 0; i < itemsPerPage; i++) visibleItems.push(items[(startIndex + i) % totalItems]);

  const nextSlide = () => { if (totalItems > itemsPerPage) setStartIndex((prev) => (prev + 1) % totalItems); };
  const prevSlide = () => { if (totalItems > itemsPerPage) setStartIndex((prev) => (prev - 1 + totalItems) % totalItems); };

  const getDualStyle = (colorString) => {
      let energy = 'cyan'; let matter = 'void';
      if (colorString && colorString.includes('-')) { [energy, matter] = colorString.split('-'); }
      const bgMap = { void: 'bg-black', carbon: 'bg-[#1a1a1a]', cobalt: 'bg-[#102040]', wine: 'bg-[#2d0b0b]', crimson: 'bg-[#350505]' };
      const energyMap = {
          cyan: 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]',
          fuchsia: 'border-fuchsia-500 shadow-[0_0_15px_rgba(232,121,249,0.2)]',
          yellow: 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]',
          green: 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
      };
      return { container: `${bgMap[matter] || 'bg-black'} border-2 ${energyMap[energy] || energyMap.cyan}` };
  };

  return (
    <div className="w-full h-full flex flex-row items-center justify-center gap-2 md:gap-4 px-2 md:px-0 relative">
        <button onClick={prevSlide} className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-black/80 border border-white/30 rounded-full flex items-center justify-center hover:bg-white hover:text-black z-[70] transition-all">‹</button>

        <div className="flex-1 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleItems.map((item, index) => {
                    const style = getDualStyle(item.neonColor);
                    // LÓGICA DE TEXTO DE RESPALDO PARA EL MENSAJE
                    const displayMessage = item.message || item.desc || "Estado no disponible...";

                    return (
                        <div key={`${item.id}-${index}`} onClick={() => onSelect(item)} className={`relative w-full h-[160px] md:h-[180px] flex flex-row rounded-xl overflow-hidden cursor-pointer ${style.container} transition-all duration-300 hover:scale-[1.02]`}>
                            <img src={item.img} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="card-bg" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>

                            {/* --- CONTENIDO PRINCIPAL --- */}
                            <div className="relative z-10 flex flex-1 flex-row items-center p-3 gap-3">
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <img src={item.avatar_url} className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/20 object-cover shadow-lg bg-black" alt="av" />
                                </div>
                                
                                <div className="flex flex-col flex-1 min-w-0 justify-center px-1">
                                    <span className="text-[10px] md:text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-1">
                                        {item.shopName}
                                    </span>
                                    
                                    <h3 className="text-white font-black text-xl md:text-xl uppercase leading-none tracking-tighter italic truncate mb-2 drop-shadow-md">
                                        {item.name}
                                    </h3>
                                    
                                    {/* MESSAGE TWIT VISIBLE */}
                                    <p className="text-gray-200 text-xs md:text-sm font-medium italic leading-snug line-clamp-3 opacity-90">
                                        "{displayMessage}"
                                    </p>
                                </div>
                            </div>

                            {/* --- BARRA LATERAL --- */}
                            <div className="relative z-10 w-[70px] md:w-[85px] bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center border-l border-white/10 gap-2">
                                <div className="text-center">
                                    <p className="text-[6px] text-gray-400 font-bold uppercase tracking-widest">PVP</p>
                                    <p className="text-base md:text-lg font-black text-white font-mono leading-none">
                                        {item.productData?.price || item.serviceData?.price || item.price || "--"}€
                                    </p>
                                </div>
                                
                                <div className="flex flex-col gap-1.5 w-full items-center px-1">
                                    {item.audioFile && <button onClick={(e) => {e.stopPropagation(); onTuneIn(item)}} className="w-full py-1 bg-red-600/80 rounded text-[9px] font-black text-white hover:bg-red-500 shadow-md">▶ AUDIO</button>}
                                    {item.video_file && <button onClick={(e) => {e.stopPropagation(); onOpenVideo(item)}} className="w-full py-1 bg-fuchsia-600/80 rounded text-[9px] font-black text-white hover:bg-fuchsia-500 shadow-md">🎥 CAM</button>}
                                </div>

                                <span className="text-[6px] font-bold text-gray-400 uppercase tracking-tighter">
                                    {item.distance}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <button onClick={nextSlide} className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-black/80 border border-white/30 rounded-full flex items-center justify-center hover:bg-white hover:text-black z-[70] transition-all">›</button>
    </div>
  );
};
export default PaginatedDisplay;