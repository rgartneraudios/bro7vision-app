// src/components/PaginatedDisplay.jsx
import React, { useState, useEffect } from 'react';

const NEON_MAP = {
    cyan: '#00E1FF', fuchsia: '#FF007D', yellow: '#FFD700', 
    green: '#00FF48', blue: '#006AED', red: '#FF1A1A', 
    orange: '#FF8000', white: '#FFFFFF'
};

const PaginatedDisplay = ({ items, onSelect, onTuneIn, onOpenVideo }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => { setItemsPerPage(window.innerWidth < 768 ? 2 : 4); };
    handleResize(); window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getNeonColor = (item) => {
    const energy = item.card_color ? item.card_color.split('-')[0] : 'cyan';
    return NEON_MAP[energy] || NEON_MAP.cyan; 
  };

  if (!items || items.length === 0) return null;

  const visibleItems = [];
  const totalItems = items.length;
  if (totalItems <= itemsPerPage) visibleItems.push(...items);
  else for (let i = 0; i < itemsPerPage; i++) visibleItems.push(items[(startIndex + i) % totalItems]);

  const nextSlide = () => { if (totalItems > itemsPerPage) setStartIndex((prev) => (prev + 1) % totalItems); };
  const prevSlide = () => { if (totalItems > itemsPerPage) setStartIndex((prev) => (prev - 1 + totalItems) % totalItems); };

  return (
    <div className="w-full flex flex-row items-center justify-center gap-1 md:gap-4 px-1 md:px-0 relative pointer-events-none">
        
        <style>{`
          @keyframes floatGem { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
          .glass-shine { background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%); }
        `}</style>

        <button onClick={prevSlide} className="shrink-0 w-8 h-8 md:w-12 md:h-12 bg-black/60 border border-cyan-500 text-cyan-400 rounded-full flex items-center justify-center hover:bg-cyan-400 hover:text-black z-[100] transition-all pointer-events-auto shadow-[0_0_15px_cyan] backdrop-blur-md">❮</button>

        <div className="flex-1 max-w-6xl">
            <div className={`grid gap-4 md:gap-8 ${itemsPerPage === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                {visibleItems.map((item, index) => {
                    const neonColor = getNeonColor(item);
                    const displayMessage = item.twit_message || item.message || "Señal activa...";
                    const price = item.productData?.price || item.serviceData?.price || item.price || "--";
                    // Chequeo robusto de audio
                    const hasAudio = item.audio_file || item.audioFile;

                    return (
                        <div 
                            key={`${item.id}-${index}`} 
                            // 1. CLIC PRINCIPAL: Abre la tienda/pago
                            onClick={() => { console.log("Click Card:", item.alias); onSelect(item); }} 
                            className="relative group flex flex-col justify-between rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 pointer-events-auto hover:scale-[1.02]"
                            style={{
                                border: `2px solid ${neonColor}`,
                                boxShadow: `0 0 15px ${neonColor}, inset 0 0 30px ${neonColor}30`,
                                background: `radial-gradient(circle at 50% 50%, #000 20%, #000 100%)`, 
                                height: window.innerWidth < 768 ? '240px' : '340px',
                                animation: `floatGem ${5 + (index % 2)}s ease-in-out infinite`,
                                animationDelay: `${index * 0.2}s`
                            }}
                        >
                            {/* Capas visuales (pointer-events-none para no bloquear el click) */}
                            <div className="absolute inset-0 glass-shine pointer-events-none z-20"></div>
                            <div className="absolute inset-0 z-0 pointer-events-none">
                                {item.img && <img src={item.img} alt="bg" className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500" />}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
                            </div>

                            <div className="absolute top-3 left-3 z-30 pointer-events-none">
                                <div className="p-[1px] rounded-full bg-black/50 backdrop-blur-md shadow-lg" style={{ border: `1px solid ${neonColor}` }}>
                                    <img src={item.avatar_url || 'https://placehold.co/100'} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" alt="av" />
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 z-30 bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10 shadow-[0_0_10px_black] pointer-events-none">
                                <h3 className="text-[8px] md:text-[9px] font-black uppercase text-white tracking-widest">{item.alias}</h3>
                            </div>

                            <div className="absolute inset-0 z-20 flex items-center justify-center px-4 pointer-events-none mt-4">
                                <p className="text-white font-black italic text-center leading-tight text-sm md:text-xl line-clamp-4 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" style={{ textShadow: `0 0 15px ${neonColor}`, color: '#fff' }}>
                                    "{displayMessage}"
                                </p>
                            </div>

                            {/* FOOTER - Z-INDEX ALTO PARA LOS BOTONES */}
                            <div className="absolute bottom-0 w-full z-[40] p-3 flex flex-col gap-2">
                                <div className="flex justify-between items-end px-1 pb-1 mb-1 border-b border-white/20 pointer-events-none">
                                    <h2 className="text-white font-bold text-[10px] md:text-xs uppercase tracking-wide truncate max-w-[60%] shadow-black drop-shadow-md">{item.name}</h2>
                                    <span className="text-xl md:text-2xl font-black font-mono text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)]" style={{ textShadow: `0 0 10px ${neonColor}` }}>{price}€</span>
                                </div>

                                <div className="flex gap-2 justify-between">
                                    {hasAudio ? (
                                        // 2. STOP PROPAGATION: Para que no abra el pago al dar play
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onTuneIn(item); }} 
                                            className="flex-1 py-2 bg-black/90 border border-red-500 text-red-500 hover:bg-red-600 hover:text-black rounded-lg text-[8px] font-black uppercase transition-all shadow-[0_0_10px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_red]"
                                        >
                                            ▶ AUDIO
                                        </button>
                                    ) : <div className="flex-1 bg-white/5 rounded-lg"></div>}

                                    {item.video_file && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onOpenVideo(item); }} 
                                            className="flex-1 py-2 bg-black/90 border border-[#00ff9f] text-[#00ff9f] hover:bg-[#00ff9f] hover:text-black rounded-lg text-[8px] font-black uppercase transition-all shadow-[0_0_10px_rgba(0,255,159,0.3)] hover:shadow-[0_0_20px_#00ff9f]"
                                        >
                                            ⛩️ SANTUARIO
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <button onClick={nextSlide} className="shrink-0 w-8 h-8 md:w-12 md:h-12 bg-black/60 border border-cyan-500 text-cyan-400 rounded-full flex items-center justify-center hover:bg-cyan-400 hover:text-black z-[100] transition-all pointer-events-auto shadow-[0_0_15px_cyan] backdrop-blur-md">❯</button>
    </div>
  );
};
export default PaginatedDisplay;