// src/components/LiveGrid.jsx (OPTIMIZADO MÓVIL)

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const MOCK_CREATORS = [
    { 
        id: 'bot1', alias: 'Dj_Neon', role: 'MUSIC_SHOP', 
        img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80',
        distance: '1200km', desc: 'Techno from Berlin', isReal: false,
        product_title: 'Pack Samples Techno', product_price: 15,
        holo_1: "/images/prism_1.jpg", holo_2: "/images/prism_2.jpg", holo_3: "/images/prism_3.jpg", holo_4: "/images/prism_4.jpg"
    },
    { 
        id: 'bot2', alias: 'Ana_Talks', role: 'TALK', 
        img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
        distance: '500km', desc: 'Debate: Futuro AI', isReal: false,
        holo_1: "/images/prism_1.jpg", holo_2: "/images/prism_2.jpg", holo_3: "/images/prism_3.jpg", holo_4: "/images/prism_4.jpg"
    }
];

const LiveGrid = ({ onTuneIn, onUserClick, onClose, onOpenVideo, onSelectShop }) => {
  const [creators, setCreators] = useState(MOCK_CREATORS);
  const [filter, setFilter] = useState('ALL'); 
  const [activeHalo, setActiveHalo] = useState(null); 

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('profiles').select('*');
      if (data) {
        const realUsers = data.map(u => ({
            ...u,
            id: u.id,
            alias: u.alias || 'Usuario', 
            role: u.role || 'CITIZEN',
            img: u.banner_url || u.avatar_url || 'https://placehold.co/400x500/000000/FFFFFF/png?text=No+Signal',
            distance: u.city || 'Online',
            desc: u.twit_message || 'Emitiendo señal...',
            isReal: true
        }));
        setCreators([...realUsers, ...MOCK_CREATORS]);
      }
    };    
    fetchData();
  }, []);

  const triggerHalo = (creator) => {
      setActiveHalo(creator.alias.toUpperCase());
      setTimeout(() => setActiveHalo(null), 5000); 
  };

  const handleGoToShop = (creator) => {
      const shopItem = {
          id: creator.id,
          name: creator.product_title || 'Producto del Creador',
          price: `${creator.product_price || 0}€`,
          shopName: creator.alias,
          img: creator.img,
          isAsset: false
      };
      onSelectShop(shopItem);
  };

  const filteredCreators = creators.filter(c => filter === 'ALL' || (c.role && c.role.includes(filter)));

  return ( 
    <div className="absolute top-40 bottom-44 md:top-[15%] md:bottom-[15%] left-[10%] right-[5%] max-w-6xl mx-auto pointer-events-auto z-40 animate-zoomIn flex flex-col">
        
        {/* --- EL RESPLANDOR (COPO DE ALGODÓN DE LUZ) --- */}
        {activeHalo && (
            <div className="fixed inset-0 pointer-events-none z-[500]">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-3xl border border-white/20 px-12 py-4 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.1)] animate-pulse">
                    <p className="text-white font-black text-xs tracking-[0.5em] uppercase text-center">
                       ENVIAN HALO DE LUZ A {activeHalo}
                    </p>
                </div>
                <div className="absolute bottom-10 right-[12%] animate-glowSwim">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-[40px] animate-pulse"></div>
                        <div className="absolute w-20 h-20 bg-white/40 rounded-full blur-[20px]"></div>
                        <div className="absolute w-10 h-10 bg-white rounded-full blur-[5px] shadow-[0_0_30px_white]"></div>
                        <div className="absolute w-full h-full animate-spin-slow">
                             <div className="absolute top-0 left-1/2 w-4 h-4 bg-white/60 rounded-full blur-sm"></div>
                             <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white/40 rounded-full blur-sm"></div>
                             <div className="absolute left-0 top-1/2 w-5 h-5 bg-cyan-200/50 rounded-full blur-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <style>{`
            @keyframes glowSwim { 
                0% { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; } 
                15% { opacity: 1; scale: 1; }
                30% { transform: translateY(-30vh) translateX(40px); }
                60% { transform: translateY(-60vh) translateX(-40px); }
                85% { opacity: 1; }
                100% { transform: translateY(-115vh) translateX(0) scale(2.5); opacity: 0; } 
            }
            .animate-glowSwim { animation: glowSwim 5.5s ease-in-out forwards; }
            .animate-spin-slow { animation: spin 8s linear infinite; }
        `}</style>

        {/* --- FILTROS --- */}
        {/* mb-4 en lugar de mb-6 para ganar espacio */}
        <div className="w-full flex justify-between items-center mb-4 bg-black/60 p-1.5 md:p-2 rounded-xl border border-white/10 backdrop-blur-md shrink-0">
            <div className="flex gap-1 md:gap-2 overflow-x-auto no-scrollbar">
                {['ALL', 'TALK', 'MUSIC', 'SHOP'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 md:px-5 md:py-2 text-[9px] md:text-[10px] font-black uppercase rounded-lg border transition-all ${filter === f ? 'bg-white text-black border-white shadow-[0_0_20px_white]' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}>{f}</button>
                ))}
            </div>
            <button onClick={onClose} className="text-gray-500 text-[9px] font-black uppercase pr-3 pl-2 hover:text-white transition-colors">✕</button>
        </div>

        {/* --- GRID --- */}
        <div className="w-full h-full overflow-y-auto custom-scrollbar px-1">
            {/* 
               CAMBIOS VISUALES CLAVE: 
               1. gap-2 en móvil (antes gap-4) -> Junta más las tarjetas.
               2. pb-32 (antes pb-24) -> Más espacio abajo para que no se corte con el menú inferior.
            */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 pb-32"> 
                {filteredCreators.map((creator) => (
                    <div key={creator.id} className="group relative aspect-[3/4] bg-[#050505] rounded-xl md:rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/50 transition-all duration-700 shadow-2xl">
                        
                        <img src={creator.img} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-20 transition-opacity" alt={creator.alias} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>
                        
                        <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[7px] text-cyan-400 font-bold border border-cyan-500/20 shadow-lg">📡 {creator.distance}</div>

                        {/* Textos subidos un poco (bottom-[100px]) y más pequeños */}
                        <div className="absolute bottom-[100px] md:bottom-[110px] left-2 right-2 md:left-3 md:right-3 text-center">
                            <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-tighter leading-none mb-1 drop-shadow-md truncate">{creator.alias}</h3>
                            <p className="text-[8px] md:text-[9px] text-gray-400 italic line-clamp-1 opacity-70">"{creator.desc}"</p>
                        </div>
                        
                        <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3 flex flex-col gap-1 md:gap-1.5">
                            
                            {/* EL BOTÓN HONESTO */}
                            <button 
                                onClick={() => triggerHalo(creator)} 
                                className="w-full py-1.5 md:py-2 bg-white text-black font-black text-[8px] md:text-[9px] uppercase rounded-lg hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all active:scale-95 flex flex-col items-center leading-tight"
                            >
                                <span>⚪ HALO</span>
                                <span className="text-[6px] md:text-[7px] opacity-60">100 GENS</span>
                            </button>

                            <div className="grid grid-cols-3 gap-1">
                                <button onClick={() => onTuneIn(creator)} className="py-1.5 md:py-2 bg-red-600 text-white rounded-md text-[9px] md:text-[10px] hover:bg-red-500 shadow-lg">▶</button>
                                {creator.video_file && <button onClick={() => onOpenVideo(creator)} className="py-1.5 md:py-2 bg-fuchsia-600 text-white rounded-md text-[9px] md:text-[10px] hover:bg-fuchsia-500 shadow-lg">🎥</button>}
                                <button onClick={() => onUserClick(creator)} className="py-1.5 md:py-2 bg-cyan-600 text-white rounded-md text-[9px] md:text-[10px] hover:bg-cyan-500 shadow-lg">👤</button>
                            </div>

                            {creator.role.includes('SHOP') && (
                                <button 
                                    onClick={() => handleGoToShop(creator)}
                                    className="w-full py-1 md:py-1.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-500 font-black text-[7px] md:text-[8px] uppercase rounded hover:bg-yellow-500 hover:text-black transition-all"
                                >
                                    🛒 SHOP
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default LiveGrid;