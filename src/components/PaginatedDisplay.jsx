// PaginatedDisplay.jsx -> Sustituye el componente

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

  const getDualStyle = (colorString) => {
      let energy = 'cyan'; let matter = 'void';
      if (colorString && colorString.includes('-')) { [energy, matter] = colorString.split('-'); }
      const bgMap = { void: 'bg-black', carbon: 'bg-[#111]', navy: 'bg-[#050a15]', cobalt: 'bg-[#051525]', wine: 'bg-[#150505]', crimson: 'bg-[#200505]', forest: 'bg-[#051505]', emerald: 'bg-[#051010]', plum: 'bg-[#100515]', chocolate: 'bg-[#150a05]' };
      const energyMap = {
          cyan: 'border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]',
          fuchsia: 'border-fuchsia-500 text-fuchsia-500 shadow-[0_0_20px_rgba(232,121,249,0.3)]',
          yellow: 'border-yellow-400 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]',
          green: 'border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
          blue: 'border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
          red: 'border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
          orange: 'border-orange-500 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]',
          gold: 'border-[#C7AF38] text-[#C7AF38]',
          silver: 'border-[#D9D9D9] text-[#D9D9D9]',
          white: 'border-white text-white'
      };
      return { container: `${bgMap[matter] || 'bg-black'} border-2 ${energyMap[energy] || energyMap.cyan}`, text: energyMap[energy]?.split(' ')[1] };
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-6 md:px-24 relative">
        
        {totalItems > itemsPerPage && (
            <button onClick={prevSlide} className="hidden md:block absolute left-10 text-white/40 hover:text-white text-5xl font-thin z-50 transition-all">‹</button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {visibleItems.map((item, index) => {
                const style = getDualStyle(item.neonColor);
                
                return (
                    <div 
                        key={`${item.id}-${index}`} 
                        onClick={() => onSelect(item)}
                        className={`
                            relative w-full h-[160px] flex flex-row rounded-2xl overflow-hidden cursor-pointer
                            ${style.container} transition-all duration-300 hover:scale-[1.03] hover:brightness-110
                        `}
                    >
                        {/* BANNER DE FONDO */}
                        <img src={item.img} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="card-bg" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>

                        {/* CUERPO: INFO Y AVATAR */}
                        <div className="relative z-10 flex flex-1 flex-row items-center p-5 gap-5">
                            {/* Círculo Avatar */}
                            <div className="relative shrink-0">
                                <img src={item.avatar_url} className="w-20 h-20 rounded-full border-2 border-white/20 object-cover shadow-[0_0_20px_rgba(0,0,0,0.5)]" alt="av" />
                                <div className="absolute -bottom-1 -right-1 flex gap-1">
                                    {item.hasProduct && <span className="text-xs bg-black/80 p-0.5 rounded shadow">📦</span>}
                                    {item.hasService && <span className="text-xs bg-black/80 p-0.5 rounded shadow">🤝</span>}
                                </div>
                            </div>
                            
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{item.shopName}</span>
                                <h3 className="text-white font-black text-xl uppercase leading-tight tracking-tighter italic truncate mb-2">
                                    {item.name}
                                </h3>
                                {/* MESSAGE TWIT (Estado WhatsApp) */}
                                <p className="text-gray-300 text-sm md:text-base font-medium italic leading-snug line-clamp-2 drop-shadow-md">
                                    "{item.message}"
                                </p>
                            </div>
                        </div>

                        {/* BARRA LATERAL: PRECIO Y MEDIA */}
                        <div className="relative z-10 w-[110px] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center border-l border-white/10 gap-3">
                            <div className="text-center">
                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Precio</p>
                                <p className="text-2xl font-black text-white font-mono leading-none">
                                    {item.productData?.price || item.serviceData?.price || "---"}€
                                </p>
                            </div>
                            
                            <div className="flex gap-2">
                                {item.audioFile && <button onClick={(e) => {e.stopPropagation(); onTuneIn(item)}} className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-xs hover:bg-red-500 transition-colors shadow-lg shadow-red-900/40">▶</button>}
                                {item.video_file && <button onClick={(e) => {e.stopPropagation(); onOpenVideo(item)}} className="w-9 h-9 rounded-full bg-fuchsia-600 flex items-center justify-center text-xs hover:bg-fuchsia-500 transition-colors shadow-lg shadow-fuchsia-900/40">🎥</button>}
                            </div>

                            <div className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-bold text-cyan-400 uppercase tracking-tighter">
                                {item.distance}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {totalItems > itemsPerPage && (
            <button onClick={nextSlide} className="hidden md:block absolute right-10 text-white/40 hover:text-white text-5xl font-thin z-50 transition-all">›</button>
        )}
    </div>
  );
};
export default PaginatedDisplay;