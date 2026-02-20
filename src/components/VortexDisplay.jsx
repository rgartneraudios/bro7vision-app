import React, { useState, useEffect } from 'react';

const NEON_MAP = {
    cyan: '#00E1FF', fuchsia: '#FF007D', yellow: '#facc15', green: '#00FF48', 
    blue: '#006AED', red: '#FF0000', orange: '#ff8000', gold: '#C7AF38', 
    silver: '#D9D9D9', white: '#FFFFFF'
};

const VortexDisplay = ({ items, onSelect, onOpenVideo }) => {
  const [displayItems, setDisplayItems] = useState([]);
  const [textCycle, setTextCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTextCycle(prev => (prev === 0 ? 1 : 0)), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!items || items.length === 0) {
      setDisplayItems([]);
      return;
    }
    setDisplayItems(items.slice(0, 4));
  }, [items]);

  const getNeonColor = (item) => {
    const energy = item.card_color ? item.card_color.split('-')[0] : 'cyan';
    return NEON_MAP[energy] || NEON_MAP.cyan;
  };

  // SLOTS SUPERIORES (En el espacio negro, arriba del video)
  const slots = [
    { left: '15%', top: '15%' }, // Top-Left
    { right: '15%', top: '15%' }, // Top-Right
    { left: '15%', top: '40%' }, // Mid-Left
    { right: '15%', top: '40%' }  // Mid-Right
  ];

  return (
    <div className="absolute inset-0 z-40 pointer-events-none font-mono">
      
      <style>{`
        @keyframes sphereRotate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        .animate-sphere { animation: sphereRotate 6s ease-in-out infinite; }
        
        .sphere-3d {
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, transparent 60%);
        }
      `}</style>

      {displayItems.map((item, index) => {
        const neonHex = getNeonColor(item);
        const pos = slots[index];
        const displayMessage = item.twit_message || item.message || "ONLINE";
        const searchRef = `${item.name} > ${item.price || item.product_price || "--"}€`;

        return (
          <div
            key={item.id}
            className="absolute pointer-events-auto group animate-sphere"
            style={{ ...pos, animationDelay: `${index * 1.5}s` }}
          >
            {/* ALIAS */}
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 text-center" style={{ color: neonHex }}>
                {item.alias || 'CIUDADANO'}
            </p>

            {/* ESFERA 3D RESPLANDECIENTE */}
            <div 
              onClick={() => onSelect(item)}
              className="w-48 h-48 md:w-60 md:h-60 rounded-full relative flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-500 hover:scale-110 shadow-2xl border-2"
              style={{ 
                  backgroundColor: neonHex, 
                  borderColor: 'white',
                  boxShadow: `0 0 60px ${neonHex}, inset 0 0 30px rgba(0,0,0,0.3)`,
                  background: `radial-gradient(circle at 30% 30%, white 0%, ${neonHex} 30%, ${neonHex} 100%)`
              }}
            >
              {/* Reflejo de luz para el volumen 3D */}
              <div className="absolute inset-0 rounded-full sphere-3d opacity-40 pointer-events-none"></div>

              {/* TEXTO OSCURO (LETRAS NEGRAS) */}
              <div className="relative z-10">
                <p className="text-[11px] md:text-sm font-black italic uppercase leading-tight text-black mb-4 px-2">
                    {textCycle === 0 ? `"${displayMessage}"` : searchRef}
                </p>
                <div className="bg-black text-white px-4 py-1.5 rounded-full text-lg md:text-xl font-black tracking-tighter shadow-lg">
                   {item.price || item.product_price || "--"}€
                </div>
              </div>

              {/* BOTONES ACCIÓN (HOVER) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/90 backdrop-blur-sm z-20 rounded-full">
                  <button onClick={(e) => { e.stopPropagation(); onOpenVideo(item); }} className="w-28 py-3 bg-fuchsia-600 text-white text-[10px] font-black rounded-full border border-fuchsia-400">💎 ÍNTIMO</button>
                  <button onClick={(e) => { e.stopPropagation(); onSelect(item); }} className="w-28 py-3 bg-white text-black text-[10px] font-black rounded-full">🛒 TIENDA</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VortexDisplay;