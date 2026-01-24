// src/components/PaginatedDisplay.jsx (VERSIÓN "IN-DASHBOARD": MÁS COMPACTA)
import React, { useState, useEffect } from 'react';

const PaginatedDisplay = ({ items, onSelect, onTuneIn, onOpenVideo }) => {
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
          <div className="w-full h-full flex flex-col items-center justify-center pt-10">
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

  const handleConnect = (e, item) => { e.stopPropagation(); e.preventDefault(); let targetUrl = item.url || item.product_url || item.service_url; if (targetUrl && targetUrl.trim() !== "") { targetUrl = targetUrl.trim(); if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl; window.open(targetUrl, '_blank'); } else { alert("⚠️ Enlace no configurado."); } };

  const handleGoToLive = (e, item) => { e.stopPropagation(); e.preventDefault(); const cleanId = item.id.replace(/_(prod|serv)$/, ''); if (onTuneIn) { onTuneIn({ id: cleanId, alias: item.shopName, img: item.img, audioFile: item.audioFile || "/audio/static_noise.mp3", name: item.shopName }); } };

  const getDualStyle = (colorString) => {
      let energy = 'cyan'; let matter = 'void';
      if (colorString && colorString.includes('-')) { [energy, matter] = colorString.split('-'); } else if (colorString) { energy = colorString; }
      const bgMap = { void: 'bg-black', carbon: 'bg-[#222222]', navy: 'bg-[#0a1a35]', cobalt: 'bg-[#003366]', wine: 'bg-[#2b0505]', crimson: 'bg-[#4a0404]', forest: 'bg-[#052b05]', emerald: 'bg-[#004d26]', plum: 'bg-[#2e0542]', chocolate: 'bg-[#3b1702]' };
      const bgClass = bgMap[matter] || 'bg-black';
      const energyMap = {
          cyan: { border: 'border-cyan-400/60', text: 'text-cyan-400', shadow: 'shadow-[0_0_40px_-5px_rgba(34,211,238,0.5)]', btn: 'bg-cyan-400 text-black' },
          fuchsia: { border: 'border-fuchsia-400/60', text: 'text-fuchsia-400', shadow: 'shadow-[0_0_40px_-5px_rgba(232,121,249,0.5)]', btn: 'bg-fuchsia-400 text-black' },
          yellow: { border: 'border-yellow-400/60', text: 'text-yellow-400', shadow: 'shadow-[0_0_40px_-5px_rgba(250,204,21,0.5)]', btn: 'bg-yellow-400 text-black' },
          green: { border: 'border-green-400/60', text: 'text-green-400', shadow: 'shadow-[0_0_40px_-5px_rgba(34,197,94,0.5)]', btn: 'bg-green-400 text-black' },
          red: { border: 'border-red-500/60', text: 'text-red-500', shadow: 'shadow-[0_0_40px_-5px_rgba(239,68,68,0.6)]', btn: 'bg-red-500 text-white' },
          orange: { border: 'border-orange-500/60', text: 'text-orange-500', shadow: 'shadow-[0_0_40px_-5px_rgba(249,115,22,0.6)]', btn: 'bg-orange-500 text-white' },
          gold: { border: 'border-[#FFD700]/60', text: 'text-[#FFD700]', shadow: 'shadow-[0_0_40px_-5px_rgba(255,215,0,0.6)]', btn: 'bg-[#FFD700] text-black' },
          silver: { border: 'border-[#C0C0C0]/60', text: 'text-[#C0C0C0]', shadow: 'shadow-[0_0_40px_-5px_rgba(192,192,192,0.5)]', btn: 'bg-[#C0C0C0] text-black' },
          white: { border: 'border-white/60', text: 'text-white', shadow: 'shadow-[0_0_40px_-5px_rgba(255,255,255,0.6)]', btn: 'bg-white text-black' },
      };
      const styles = energyMap[energy] || energyMap.cyan;
      return { container: `${bgClass} border-2 ${styles.border} ${styles.shadow}`, text: styles.text, btn: styles.btn, deco: styles.border.replace('border-', 'bg-').replace('/60', '') };
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-4"> {/* Eliminado absolute para que encaje en el dashboard */}
        
        <style>{`@keyframes flyIn { 0% { opacity: 0; transform: scale(0.9) translateY(40px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }`}</style>

        {totalItems > itemsPerPage && (<button onClick={prevSlide} className="hidden md:flex text-white/50 hover:text-white text-6xl font-thin transition-all hover:scale-110 z-50 mr-4 cursor-pointer">‹</button>)}

        <div className="flex flex-row gap-6 items-center justify-center w-full h-full">
            {visibleItems.map((item, index) => {
                const style = getDualStyle(item.neonColor);

                return (
                    <div 
                        key={`${item.id}-${index}`} 
                        onClick={() => onSelect(item)}
                        style={{ animation: `flyIn 0.5s ease-out forwards`, animationDelay: `${index * 0.1}s` }}
                        className={`
                            relative w-full md:w-[260px] h-[450px] flex flex-col shrink-0 /* AQUI EL CAMBIO DE TAMAÑO: h-[450px] */
                            rounded-[2rem]
                            ${style.container}
                            transition-all duration-300 ease-out
                            hover:-translate-y-2 hover:scale-[1.02] hover:z-50
                            cursor-pointer opacity-0
                        `}
                    >
                        {/* --- ENCABEZADO DE LA TARJETA (BOTONES) --- */}
                        <div className="flex justify-between items-center p-4 border-b border-white/5 relative z-50 gap-2">
                             
                             {/* 1. BOTÓN CONECTAR (TIENDA) - ESTE SIEMPRE ESTÁ */}
                             <button onClick={(e) => handleConnect(e, item)} className={`flex-1 mr-2 py-2 px-3 rounded-lg font-black uppercase text-[9px] tracking-[0.1em] transition-all bg-white text-black hover:bg-gray-200 shadow-[0_0_10px_white]`}>
                                CONECTAR ↗
                             </button>

                             {/* 2. GRUPO MULTIMEDIA (A LA DERECHA) */}
                             <div className="flex gap-1 shrink-0">
                                
                                {/* BOTÓN DE TV (SOLO SI TIENE VIDEO) */}
                                {item.video_file && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onOpenVideo(item); }} 
                                        className="w-8 h-8 rounded-lg border border-fuchsia-500 bg-black text-fuchsia-400 hover:bg-fuchsia-500 hover:text-white flex items-center justify-center transition-all shadow-[0_0_10px_magenta]"
                                        title="Ver Holo-TV"
                                    >
                                        🎥
                                    </button>
                                )}

                                {/* BOTÓN DE RADIO (SOLO SI ES REAL/LIVE) */}
                                {item.isReal && (
                                    <button 
                                        onClick={(e) => handleGoToLive(e, item)} 
                                        className="w-8 h-8 rounded-lg border border-red-500 bg-black text-white hover:bg-red-600 flex items-center justify-center transition-all shadow-[0_0_10px_red]"
                                        title="Escuchar Live"
                                    >
                                        ▶
                                    </button>
                                )}
                             </div>
                        </div>
                                                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                            <div className={`absolute w-24 h-24 rounded-full ${style.deco} opacity-[0.08] blur-[40px] pointer-events-none`}></div>
                            <p className="text-white text-base font-bold italic leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10 break-words w-full">"{item.message || "..."}"</p>
                            <span className={`mt-4 text-[8px] font-bold uppercase tracking-[0.2em] opacity-80 ${style.text}`}>{item.category}</span>
                        </div>
                        <div className="pb-6 pt-2 px-4 flex flex-col items-center relative z-20">
                            <div className="flex items-center gap-2 mb-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <div className={`w-1.5 h-1.5 rounded-full ${style.deco} shadow-[0_0_5px_currentColor]`}></div>
                                <span className="text-sm font-mono font-bold text-white tracking-widest">{item.distance || 'Online'}</span>
                            </div>
                            <div className="text-center w-full border-t border-white/10 pt-2">
                                <p className="text-[7px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-0.5">{item.shopName}</p>
                                <h3 className="text-white font-black text-lg uppercase leading-none truncate mb-1">{item.name}</h3>
                                <div className="text-white/60 font-mono font-bold text-xs">{item.price || "0"}</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {totalItems > itemsPerPage && (<button onClick={nextSlide} className="hidden md:flex text-white/50 hover:text-white text-6xl font-thin transition-all hover:scale-110 z-50 ml-4 cursor-pointer">›</button>)}
        {totalItems > 1 && (<div className="md:hidden absolute -bottom-10 left-0 right-0 flex justify-center gap-6 z-50"><button onClick={prevSlide} className="w-10 h-10 rounded-full border border-white/20 bg-black/80 text-white flex items-center justify-center">←</button><button onClick={nextSlide} className="w-10 h-10 rounded-full border border-white/20 bg-black/80 text-white flex items-center justify-center">→</button></div>)}
    </div>
  );
};
export default PaginatedDisplay;