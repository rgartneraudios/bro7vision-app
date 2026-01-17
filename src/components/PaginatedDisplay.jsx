// src/components/PaginatedDisplay.jsx (LIMPIO - SIN BOTÓN)

import React, { useState, useEffect } from 'react';
import { calculateDynamicPrice, MOON_MATRIX } from '../data/MoonMatrix';

/* --- SUB-COMPONENTE: SMART PRICE TAG --- */
const SmartPriceTag = ({ fiatPriceStr, userCoinType, currentPhase, themeText }) => {
  const numericPrice = parseFloat(String(fiatPriceStr).replace('€','').replace(',','.').trim());
  if (isNaN(numericPrice) || !MOON_MATRIX[userCoinType]) return <h3 className="font-black text-4xl tracking-tighter text-white">{fiatPriceStr}</h3>;
  const coinValueIN = MOON_MATRIX[userCoinType].IN;
  const coinCost = calculateDynamicPrice(numericPrice, currentPhase, userCoinType);
  const standardCost = Math.ceil(numericPrice / coinValueIN);
  const diff = standardCost - coinCost;
  const isGoodDeal = diff > 0; 
  const colorClass = isGoodDeal ? 'text-emerald-400' : (diff < 0 ? 'text-orange-400' : 'text-gray-400');
  
  return (
    <div className="flex flex-col items-end gap-0">
      <div className={`flex flex-col items-end pr-1`}>
         <div className="flex items-baseline gap-1.5">
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">TU PRECIO:</span>
            <span className={`font-mono font-black text-xl tracking-tight leading-none ${colorClass}`}>{coinCost}</span>
            <span className={`text-[9px] font-black uppercase ${colorClass}`}>{userCoinType.substring(0,3)}</span>
         </div>
         {diff !== 0 && (
           <div className={`text-[9px] font-bold ${isGoodDeal ? 'text-emerald-500' : 'text-orange-500'} flex items-center gap-1`}>
              <span>{isGoodDeal ? 'TE AHORRAS' : 'SOBRECOSTE'}:</span>
              <span className="font-mono text-sm">{Math.abs(diff)}</span>
              <span>coins</span>
           </div>
         )}
      </div>
      <h3 className={`font-black text-4xl tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] leading-none mt-1`}>{fiatPriceStr}</h3>
    </div>
  );
};

const NEON_THEMES = {
  'blue': { wrapper: "bg-gradient-to-b from-[#0e3f5c] via-[#020b14] to-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5),inset_0_0_100px_rgba(34,211,238,0.3)]", text: "text-cyan-400", glowHover: "hover:shadow-[0_0_60px_rgba(34,211,238,0.8),inset_0_0_120px_rgba(34,211,238,0.5)] hover:border-cyan-200" },
  'purple': { wrapper: "bg-gradient-to-b from-[#4a0e5c] via-[#1a051a] to-black border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.5),inset_0_0_100px_rgba(217,70,239,0.3)]", text: "text-fuchsia-400", glowHover: "hover:shadow-[0_0_60px_rgba(217,70,239,0.8),inset_0_0_120px_rgba(217,70,239,0.5)] hover:border-fuchsia-200" },
  'yellow': { wrapper: "bg-gradient-to-b from-[#422a03] via-[#1a1202] to-black border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5),inset_0_0_100px_rgba(250,204,21,0.3)]", text: "text-yellow-400", glowHover: "hover:shadow-[0_0_60px_rgba(250,204,21,0.8),inset_0_0_120px_rgba(250,204,21,0.5)] hover:border-yellow-200" },
  'red': { wrapper: "bg-gradient-to-b from-[#450a0a] via-[#1a0505] to-black border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5),inset_0_0_100px_rgba(220,38,38,0.3)]", text: "text-red-500", glowHover: "hover:shadow-[0_0_60px_rgba(220,38,38,0.8),inset_0_0_120px_rgba(220,38,38,0.5)] hover:border-red-300" },
  'green': { wrapper: "bg-gradient-to-b from-[#022c22] via-[#011a14] to-black border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.5),inset_0_0_100px_rgba(20,184,166,0.3)]", text: "text-teal-400", glowHover: "hover:shadow-[0_0_60px_rgba(20,184,166,0.8),inset_0_0_120px_rgba(20,184,166,0.5)] hover:border-teal-300" },
  'orange': { wrapper: "bg-gradient-to-b from-[#431407] via-[#1a0a05] to-black border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5),inset_0_0_100px_rgba(249,115,22,0.3)]", text: "text-orange-400", glowHover: "hover:shadow-[0_0_60px_rgba(249,115,22,0.8),inset_0_0_120px_rgba(249,115,22,0.5)] hover:border-orange-300" },
  'default': { wrapper: "bg-gradient-to-b from-[#1f2937] via-[#0f0f0f] to-black border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)]", text: "text-white", glowHover: "hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:border-white" }
};

const PaginatedDisplay = ({ items, onSelect, activeBoosts = {}, intent = 'product', userCoinType = 'nova', currentPhase = 'crescens' }) => {
  const [page, setPage] = useState(0);
  const isMobile = window.innerWidth < 768;
  const itemsPerPage = isMobile ? 1 : 3;

  useEffect(() => { setPage(0); }, [items]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const currentItems = items.slice(page * itemsPerPage, (page * itemsPerPage) + itemsPerPage);
  
  const getTheme = (neonString) => {
    if (!neonString) return NEON_THEMES['default'];
    const s = neonString.toLowerCase();
    if (s.includes('blue') || s.includes('cyan')) return NEON_THEMES['blue'];
    if (s.includes('pink') || s.includes('purple')) return NEON_THEMES['purple'];
    if (s.includes('yellow') || s.includes('amber')) return NEON_THEMES['yellow'];
    if (s.includes('red') || s.includes('rose')) return NEON_THEMES['red'];
    if (s.includes('orange')) return NEON_THEMES['orange'];
    if (s.includes('green') || s.includes('teal')) return NEON_THEMES['green'];
    return NEON_THEMES['default'];
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      
      {/* CASO VACÍO */}
      {items.length === 0 ? (
          <div className="pointer-events-auto bg-black/80 backdrop-blur-md border-2 border-red-500/50 p-12 rounded-2xl text-center shadow-[0_0_50px_rgba(220,38,38,0.3)] animate-zoomIn">
              <div className="text-6xl mb-4 grayscale">🛰️</div>
              <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-2">SEÑAL PERDIDA</h2>
              <p className="text-white font-mono text-sm">No se han encontrado resultados en este sector.</p>
          </div>
      ) : (
          <div className="w-full max-w-7xl flex items-center justify-between px-2 md:px-12 pointer-events-auto">
            {/* FLECHA IZQ */}
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className={`group p-4 rounded-xl border transition-all duration-300 z-50 ${page === 0 ? 'opacity-0 cursor-default border-transparent' : 'opacity-100 cursor-pointer bg-black/60 backdrop-blur border-white/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'}`}>
              <span className={`text-2xl font-black ${page === 0 ? '' : 'text-white group-hover:text-cyan-400'}`}>❮</span>
            </button>

            {/* GRID */}
            <div key={page} className="flex-1 flex justify-center gap-6 md:gap-12 mx-2 perspective-[1000px]">
              {currentItems.map((shop, index) => {
                const theme = getTheme(shop.neonColor);
                const boostLevel = activeBoosts[shop.id]; 
                const mainTitle = (intent === 'service' && shop.nameService) ? shop.nameService : shop.name;

                return ( 
                  <div 
                    key={shop.id}
                    onClick={() => onSelect(shop)}
                    style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                    className={`relative shrink-0 w-[280px] h-[550px] rounded-2xl overflow-hidden cursor-pointer group border-2 ${theme.wrapper} ${theme.glowHover} animate-flyIn transition-all duration-300 hover:scale-105 hover:-translate-y-2`}
                  >
                     <div className={`absolute top-0 left-0 right-0 h-[3px] bg-${theme.text.split('-')[1]}-400 shadow-[0_0_20px_rgba(255,255,255,0.9)] opacity-100 z-30`}></div>
                     <div className="relative z-10 h-full flex flex-col items-center text-center p-6">   
                       <div className="mb-4 mt-2"><div className="bg-white text-black font-black text-3xl px-6 py-2 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.5)] border-2 border-white">{shop.distance}</div></div>
                       <div className="mb-4 flex flex-col items-center">
                          <div className="bg-[#0c0c0c] border-2 border-[#333] shadow-[0_5px_15px_rgba(0,0,0,0.9)] px-6 py-2 rounded-lg inline-block">
                             <span className={`text-lg font-black uppercase tracking-[0.2em] ${theme.text} drop-shadow-md`}>{shop.category}</span>
                          </div>
                       </div>
                       <div className="flex-1 flex flex-col justify-center w-full">
                          <div className="mb-6"><p className={`text-gray-200 italic font-medium leading-snug drop-shadow-md opacity-90 px-1 text-2xl`}>"{shop.message || 'Descúbrelo...'}"</p></div>
                          <div><p className="text-3xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,1)] break-words w-full">{mainTitle}</p></div>
                       </div>
                       <div className={`w-full border-t border-white/10 pt-4 mt-4`}>
                         <div className="flex items-end justify-between px-2">
                            <SmartPriceTag fiatPriceStr={shop.price} userCoinType={userCoinType} currentPhase={currentPhase} themeText={theme.text} />
                            <button className={`px-6 py-3 rounded font-black uppercase tracking-widest text-[11px] transition-all bg-white text-black hover:bg-cyan-400 hover:text-black hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.4)]`}>ENTRAR</button>
                         </div>
                       </div>
                     </div>
                  </div>
                );
              })}
            </div>

            {/* FLECHA DERECHA */}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className={`group p-4 rounded-xl border transition-all duration-300 z-50 ${page >= totalPages - 1 ? 'opacity-30 cursor-not-allowed border-transparent' : 'opacity-100 cursor-pointer bg-black/60 backdrop-blur border-white/20 hover:border-fuchsia-400 hover:shadow-[0_0_20px_rgba(232,121,249,0.4)]'}`}>
              <span className={`text-2xl font-black ${page >= totalPages - 1 ? '' : 'text-white group-hover:text-fuchsia-400'}`}>❯</span>
            </button>
          </div>
      )}
    </div>
  );
};

export default PaginatedDisplay;