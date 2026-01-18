// src/components/LiveGrid.jsx (VERSIÓN FINAL: ADMIN RESTAURADO + LINK TIENDA)

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// --- MOCK DATA CON TU USUARIO RESTAURADO ---
const MOCK_CREATORS = [
    // 1. TU PERFIL (FORZADO MANUALMENTE)
    { 
        id: 'manual_admin', 
        alias: 'BRO7VISION', 
        role: 'MUSIC,SHOP', 
        
        // TUS FOTOS
        img: 'https://i.postimg.cc/MKNcqGKv/BRO7VISIONAVA1.png', 
        avatar_url: 'https://i.postimg.cc/kgj7q1y7/RG1x1a.png', 
        holo_1: 'https://i.postimg.cc/LXM2K9QV/2dbc1d91-18b2-418b-9c46-d9c4195f6d8a.png', 
        holo_2: 'https://i.postimg.cc/76yw8HtV/87b85deb-53c2-453c-9123-91122e872234.png', 
        holo_3: 'https://i.postimg.cc/XJ04Sj1k/e4956cf7-88f9-488f-82bc-e82b3da3c2cd.png', 
        holo_4: 'https://i.postimg.cc/76yw8HtM/fdaf3e49-8237-4823-98b4-318bcf12aa98.png', 

        distance: '0km', 
        desc: 'Arquitecto del Sistema', 
        
        // IMPORTANTE: Pon aquí tu link real para que el botón funcione en el Admin
        product_url: 'https://www.instagram.com/coolfindskr/', 
        
        price: 10,
        isReal: true 
    },
    
    // 2. BOTS DE RELLENO
    { id: 'bot1', alias: 'Dj_Neon', role: 'MUSIC', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80', distance: '1200km', desc: 'Techno from Berlin', price: 10, isReal: false },
    { id: 'bot2', alias: 'Ana_Talks', role: 'TALK', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80', distance: '500km', desc: 'Debate: Futuro AI', price: 0, isReal: false },
    { id: 'bot3', alias: 'Retro_Shop', role: 'SHOP', img: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80', distance: 'Online', desc: 'Venta de Consolas', shopName: 'Retro World', price: 25, isReal: false },
];

const LiveGrid = ({ onTuneIn, onUserClick, onClose }) => {
  const [creators, setCreators] = useState(MOCK_CREATORS);
  const [filter, setFilter] = useState('ALL'); 
  const [toast, setToast] = useState(null); 
  const [showSphere, setShowSphere] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      // 1. TRAEMOS LOS LINKS (product_url, service_url) DE LA DB
      const { data } = await supabase
        .from('profiles')
        .select('id, alias, avatar_url, banner_url, role, bio, city, track_name, audio_file, bcast_file, holo_1, holo_2, holo_3, holo_4, product_url, service_url');

      if (data && data.length > 0) {
        const realUsers = data.map(u => ({
            id: u.id,
            alias: u.alias || 'Usuario', 
            role: u.role || 'CITIZEN',
            img: u.banner_url || u.avatar_url || 'https://via.placeholder.com/150',
            distance: u.city ? `${u.city}` : 'Online',
            desc: u.bio || 'Usuario',
            
            // MAPEO DEL LINK: Si tiene producto usa ese, si no servicio
            product_url: u.product_url || u.service_url, 
            
            audioFile: u.audio_file,
            bcastFile: u.bcast_file,
            holo_1: u.holo_1, holo_2: u.holo_2, holo_3: u.holo_3, holo_4: u.holo_4,
            isReal: true
        }));
        
        // FUSIÓN: Primero los reales de la DB, luego el Admin manual y los bots
        // OJO: Si tu usuario ya está en la DB real, saldrás dos veces. 
        // Si prefieres solo el manual, filtra los reales para quitar tu ID.
        setCreators([...realUsers, ...MOCK_CREATORS]);
      }
    };    
    fetchData();
  }, []);

  const filteredCreators = creators.filter(c => filter === 'ALL' || (c.role && c.role.includes(filter)));

  const sendPulse = async (creator) => {
      if (!creator.isReal || creator.id === 'manual_admin') {
          setToast(`🔮 (SIMULACIÓN) Halo enviado a ${creator.alias}`);
          setShowSphere(true);
          setTimeout(() => { setToast(null); setShowSphere(false); }, 4000);
          return;
      }
      try {
          setToast(`🔮 ¡HALO ENVIADO A ${creator.alias}! (-100 GEN)`);
          setShowSphere(true);
          setTimeout(() => { setToast(null); setShowSphere(false); }, 4000);
      } catch (e) { console.error(e); }
  };

  // --- FUNCIÓN PARA ABRIR LINK (TIENDA) ---
  const handleOpenLink = (creator) => {
      // Buscamos el link en varias propiedades por si acaso
      const targetUrl = creator.product_url || creator.service_url || creator.url;

      if (targetUrl && targetUrl.trim() !== "") {
          let url = targetUrl.trim();
          // Añadir https si falta
          if (!url.startsWith('http')) url = 'https://' + url;
          
          window.open(url, '_blank');
      } else {
          alert("⚠️ (FASE 0) Este usuario no tiene enlace de tienda configurado.");
      }
  };

  const handlePlayBCast = (creator) => {
      if (!creator.bcastFile && creator.id !== 'manual_admin') { 
          alert("⚠️ Sin B-CAST."); return; 
      }
      // Si es el admin manual, ponemos un placeholder si quieres
      const audio = creator.bcastFile || "/audio/static_noise.mp3";
      onTuneIn({ ...creator, audioFile: audio, name: `${creator.alias} (B-CAST)` });
  };

  return (
    <div className="absolute top-48 bottom-48 md:top-[15%] md:bottom-[15%] w-full max-w-6xl px-4 pointer-events-auto z-40 animate-zoomIn flex flex-col items-center">
        
        {/* TOAST & SPHERE */}
        {toast && (
            <div className="fixed top-36 left-0 right-0 mx-auto w-max max-w-[90%] z-[300] bg-yellow-500 text-black font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.8)] animate-bounce border-2 border-white text-xs text-center">
                {toast}
            </div>
        )}
        {showSphere && (
            <div className="fixed bottom-32 right-8 md:right-64 z-[9999] pointer-events-none animate-spiritFloat">
                <div className="w-20 h-20 rounded-full bg-white blur-md relative flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.8)]">
                    <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
                </div>
            </div>
        )}
        <style>{`
            @keyframes spiritFloat { 
                0% { transform: translateY(0) scale(0.2); opacity: 0; } 
                50% { transform: translateY(-300px) scale(1.1); opacity: 0.8; } 
                100% { transform: translateY(-600px) scale(0); opacity: 0; } 
            } 
            .animate-spiritFloat { animation: spiritFloat 2s ease-out forwards; }
        `}</style>

        {/* FILTROS */}
        <div className="w-full flex justify-between items-end mb-4 bg-black/80 p-2 rounded-xl border border-white/10 backdrop-blur-md overflow-x-auto shrink-0">
            <div className="flex gap-2 min-w-max">{['ALL', 'TALK', 'MUSIC', 'SHOP'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${filter === f ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_red]' : 'bg-transparent border-white/20 text-gray-400 hover:text-white'}`}>{f}</button>))}</div>
            <button onClick={onClose} className="text-gray-500 hover:text-white px-4 text-xs font-bold whitespace-nowrap">CERRAR ✕</button>
        </div>

        {/* GRID */}
        <div className="w-full h-full overflow-y-auto custom-scrollbar pr-1 px-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 pb-24 w-full mx-auto"> 
                {filteredCreators.map((creator) => (
                    <div key={creator.id} className="group relative aspect-[3/4] bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10 hover:border-red-500 transition-all hover:scale-[1.02] shadow-lg w-full">
                        
                        <img 
                            src={creator.img} 
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Signal'; }}
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                            alt={creator.alias} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-cyan-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-cyan-500/30">📡 {creator.distance}</div>
                        
                        <div className="absolute bottom-[6.5rem] left-2 right-2 md:bottom-24 md:left-3 md:right-3">
                            <span className={`text-[7px] md:text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20 mb-1 inline-block`}>{creator.role}</span>
                            <h3 className="text-white font-bold text-xs md:text-sm leading-tight truncate">{creator.alias}</h3>
                            <p className="text-[9px] md:text-[10px] text-gray-400 truncate">{creator.desc}</p>
                        </div>
                        
                        <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
                            {/* HALO BUTTON */}
                            <button onClick={() => sendPulse(creator)} className="w-full py-1.5 bg-black border border-cyan-600 text-white font-black text-[8px] md:text-[9px] uppercase rounded flex items-center justify-center gap-1 hover:border-white hover:shadow-[0_0_10px_cyan]">
                                <span className="animate-pulse text-[10px]">⚪</span>
                                <span className="truncate">HALO (-100 G)</span>
                            </button>                            
                            
                            {/* AUDIO BUTTONS */}
                            <div className="flex gap-1">
                                <button onClick={() => onTuneIn(creator)} className="flex-1 py-1.5 bg-red-600 text-white font-black text-[8px] uppercase rounded border border-red-500 truncate">▶ LIVE</button>
                                <button onClick={() => handlePlayBCast(creator)} className="flex-1 py-1.5 bg-violet-600 text-white font-black text-[8px] uppercase rounded border border-violet-400 truncate">📼 B-CAST</button>
                            </div>
                            
                            {/* SHOP & PERFIL BUTTONS */}
                            <div className="flex gap-1">
                                {creator.role && creator.role.includes('SHOP') 
                                    ? (
                                        <button 
                                            onClick={() => handleOpenLink(creator)} // <--- AQUÍ ESTÁ EL CAMBIO
                                            className="flex-1 py-1.5 bg-yellow-500 text-black font-black text-[8px] uppercase rounded truncate hover:bg-white transition-colors"
                                        >
                                            🛒 TIENDA
                                        </button>
                                      ) 
                                    : (<div className="flex-1"></div>)
                                }
                                <button onClick={() => onUserClick(creator)} className="flex-1 py-1.5 bg-cyan-600 text-white font-black text-[8px] uppercase rounded truncate">👤 PERFIL</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filteredCreators.length === 0 && (
                <div className="w-full h-64 flex flex-col items-center justify-center text-gray-600"><span className="text-4xl mb-2">📡</span><p className="text-xs font-mono uppercase">No hay señales.</p></div>
            )}
        </div>
    </div>
  );
};
export default LiveGrid;