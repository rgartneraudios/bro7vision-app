import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// DATOS DE BOTS + TU PERFIL FORZADO
const MOCK_CREATORS = [
    // 1. TU PERFIL (FORZADO MANUALMENTE PARA QUE SALGA SIEMPRE)
    { 
        id: 'manual_admin', 
        alias: 'BRO7VISION', 
        role: 'MUSIC,SHOP', 
        
        // FOTO PRINCIPAL (La Vertical 3:4 que ya pusiste y funciona)
        img: 'https://i.postimg.cc/MKNcqGKv/BRO7VISIONAVA1.png', 
        
        // FOTO REDONDA (Para la Terminal de Identidad)
        avatar_url: 'https://i.postimg.cc/kgj7q1y7/RG1x1a.png', 

        // LAS 4 CARAS DEL PRISMA (Pon aquí los enlaces directos de tus fotos verticales)
        // Si quieres repetir la misma, pon la misma URL en todas.
        holo_1: 'https://i.postimg.cc/LXM2K9QV/2dbc1d91-18b2-418b-9c46-d9c4195f6d8a.png', 
        holo_2: 'https://i.postimg.cc/76yw8HtV/87b85deb-53c2-453c-9123-91122e872234.png', 
        holo_3: 'https://i.postimg.cc/XJ04Sj1k/e4956cf7-88f9-488f-82bc-e82b3da3c2cd.png', 
        holo_4: 'https://i.postimg.cc/76yw8HtM/fdaf3e49-8237-4823-98b4-318bcf12aa98.png', 

        distance: '0km', 
        desc: 'Arquitecto del Sistema', 
        price: 10,
        audio_file: '', 
        bcast_file: '',
        isReal: true 
    },
    
    // 2. EL RESTO DE BOTS
    { id: 'bot1', alias: 'Dj_Neon', role: 'MUSIC', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80', distance: '1200km', desc: 'Techno from Berlin', price: 10 },
    { id: 'bot2', alias: 'Ana_Talks', role: 'TALK', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80', distance: '500km', desc: 'Debate: Futuro AI', price: 0 },
    { id: 'bot3', alias: 'Retro_Shop', role: 'SHOP', img: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80', distance: 'Online', desc: 'Venta de Consolas', shopName: 'Retro World', price: 25 },
    { id: 'bot4', alias: 'Guitar_Hero', role: 'MUSIC', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80', distance: '40km', desc: 'Live Acoustic', price: 5 },
    { id: 'bot5', alias: 'Crypto_News', role: 'TALK', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80', distance: 'Global', desc: 'Análisis Bitcoin', price: 0 },
    { id: 'bot6', alias: 'Manolo_Bakery', role: 'SHOP', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80', distance: '2km', desc: 'Panadería Artesana', shopName: 'Panadería Manolo', price: 1.50 },
];
const LiveGrid = ({ onTuneIn, onSelectShop, onUserClick, onClose }) => {
  const [creators, setCreators] = useState(MOCK_CREATORS);
  const [filter, setFilter] = useState('ALL'); 
  const [toast, setToast] = useState(null); 
  const [myAlias, setMyAlias] = useState('Anon'); 
  const [showSphere, setShowSphere] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      // 1. TU USUARIO
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata.alias) setMyAlias(user.user_metadata.alias);

      // 2. USUARIOS REALES - ¡SIN FILTROS! TRAEMOS TODO
      const { data } = await supabase
        .from('profiles')
        .select('id, alias, avatar_url, banner_url, role, bio, city, track_name, audio_file, bcast_file, holo_1, holo_2, holo_3, holo_4');
        // HE QUITADO LA LÍNEA: .neq('alias', null); PARA QUE NO TE OCULTE

      // 3. FUSIÓN
      if (data && data.length > 0) {
        const realUsers = data.map(u => ({
            id: u.id,
            alias: u.alias || 'Usuario Sin Nombre', // Si es null, ponemos texto por defecto
            role: u.role || 'CITIZEN',
            img: u.banner_url || u.avatar_url || 'https://via.placeholder.com/150',
            avatar: u.avatar_url,
            distance: u.city ? `${u.city} (Cerca)` : 'Desconocido',
            desc: u.bio || 'Usuario',
            shopName: u.alias || 'Tienda',
            price: 10,
            audio_file: u.audio_file,
            bcast_file: u.bcast_file,
            holo_1: u.holo_1, holo_2: u.holo_2, holo_3: u.holo_3, holo_4: u.holo_4,
            isReal: true
        }));
        setCreators([...realUsers, ...MOCK_CREATORS]);
      }
    };    
    fetchData();
  }, []);

  const filteredCreators = creators.filter(c => filter === 'ALL' || (c.role && c.role.includes(filter)));

  const sendPulse = async (creator) => {
      const COST = 100;
      if (!creator.isReal) {
          setToast(`🔮 (SIMULACIÓN) Has enviado un HALO a ${creator.alias}`);
          setShowSphere(true);
          setTimeout(() => { setToast(null); setShowSphere(false); }, 4000);
          return;
      }
      try {
          const { data, error } = await supabase.rpc('transfer_halo', { recipient_id: creator.id, amount: COST });
          if (error) throw error;
          if (data === true) {
              setToast(`🔮 ¡TRANSFERENCIA DE ${COST} GEN REALIZADA A ${creator.alias}!`);
              setShowSphere(true);
              setTimeout(() => { setToast(null); setShowSphere(false); }, 4000);
          } else {
              alert(`🚫 SALDO INSUFICIENTE. Necesitas ${COST} Génesis.`);
          }
      } catch (e) { console.error(e); }
  };

  const handleOpenShop = (creator) => {
      const validProduct = { ...creator, name: creator.desc || 'Producto', price: creator.price || 10, image: creator.img };
      onSelectShop(validProduct);
  };

  const handlePlayBCast = (creator) => {
      if (!creator.bcast_file) { alert("⚠️ Este usuario no tiene contenido B-CAST subido."); return; }
      const bcastCreator = { ...creator, audioFile: creator.bcast_file, name: `${creator.alias} (B-CAST)` };
      onTuneIn(bcastCreator);
  };

  return (
    <div className="absolute top-48 bottom-48 md:top-[15%] md:bottom-[15%] w-full max-w-6xl px-4 pointer-events-auto z-40 animate-zoomIn flex flex-col items-center">
        
        {toast && (
            <div className="fixed top-36 left-0 right-0 mx-auto w-max max-w-[90%] z-[300] bg-yellow-500 text-black font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.8)] animate-bounce border-2 border-white text-xs text-center">
                {toast}
            </div>
        )}
        
        {showSphere && (
            <div className="fixed bottom-32 right-8 md:right-64 z-[9999] pointer-events-none animate-spiritFloat">
                <div className="w-20 h-20 rounded-full bg-white blur-md relative flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.8)]">
                    <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
                    <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-40 animate-pulse delay-75"></div>
                    <div className="absolute w-full h-full animate-spin-slow">
                        <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                        <div className="absolute bottom-2 right-2 w-1 h-1 bg-cyan-200 rounded-full shadow-[0_0_10px_cyan]"></div>
                    </div>
                </div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-40 bg-gradient-to-t from-transparent via-white to-transparent opacity-50 blur-[1px]"></div>
            </div>
        )}
        <style>{`
            @keyframes spiritFloat { 
                0% { transform: translateY(0) translateX(0) scale(0.2); opacity: 0; } 
                10% { opacity: 1; transform: translateY(-30px) translateX(-10px) scale(1); } 
                40% { transform: translateY(-150px) translateX(15px) scale(1.1); } 
                70% { transform: translateY(-300px) translateX(-5px) scale(1); opacity: 0.8; } 
                100% { transform: translateY(-600px) translateX(10px) scale(0); opacity: 0; } 
            } 
            .animate-spiritFloat { animation: spiritFloat 3.5s ease-out forwards; }
        `}</style>

        <div className="w-full flex justify-between items-end mb-4 bg-black/80 p-2 rounded-xl border border-white/10 backdrop-blur-md overflow-x-auto shrink-0">
            <div className="flex gap-2 min-w-max">{['ALL', 'TALK', 'MUSIC', 'SHOP'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${filter === f ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_red]' : 'bg-transparent border-white/20 text-gray-400 hover:text-white'}`}>{f}</button>))}</div>
            <button onClick={onClose} className="text-gray-500 hover:text-white px-4 text-xs font-bold whitespace-nowrap">CERRAR ✕</button>
        </div>

        <div className="w-full h-full overflow-y-auto custom-scrollbar pr-2 px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20 w-full max-w-sm md:max-w-none mx-auto"> 
                {filteredCreators.map((creator) => (
                    <div key={creator.id} className="group relative aspect-[3/4] bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10 hover:border-red-500 transition-all hover:scale-[1.02] shadow-lg w-full">
                        <img 
                            src={creator.img} 
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Signal'; }}
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                            alt={creator.alias} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-cyan-400 text-[8px] font-mono px-2 py-1 rounded border border-cyan-500/30">📡 {creator.distance}</div>
                        <div className="absolute bottom-24 left-3 right-3">
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20 mb-1 inline-block`}>{creator.role}</span>
                            <h3 className="text-white font-bold text-sm leading-tight truncate">{creator.alias}</h3>
                            <p className="text-[10px] text-gray-400 truncate">{creator.desc}</p>
                        </div>
                        
                        
                        {/* === BOTÓN CYBERPUNK: CYAN GLOW EDITION === */}
<div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
    <button 
        onClick={() => sendPulse(creator.alias)} 
        className="
            w-full py-2 
            bg-black 
            border border-cyan-600 
            text-white font-black text-[9px] uppercase 
            rounded 
            flex items-center justify-center gap-2 
            transition-all duration-500 ease-out
            group active:scale-95
            
            /* EFECTO LUZ AL PASAR EL RATÓN */
            /* 1. El borde se vuelve blanco brillante */
            hover:border-white 
            /* 2. Sombra multinivel: Un resplandor cyan suave y un núcleo blanco intenso */
            hover:shadow-[0_0_15px_rgba(8,145,178,0.8),0_0_30px_rgba(255,255,255,0.4)]
        "
    >
        {/* Emoji Esfera: Latido constante que se intensifica en hover */}
        <span className="
            text-xs 
            animate-pulse 
            filter drop-shadow-[0_0_5px_#0891b2] 
            group-hover:drop-shadow-[0_0_12px_#fff]
            group-hover:scale-110
            transition-all duration-300
        ">
            ⚪
        </span>
        
        {/* Texto: Ahora también late sutilmente junto al emoji */}
        <span className="
            tracking-wider
            animate-pulse
            group-hover:animate-none
            group-hover:text-white
            group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]
            transition-all duration-300
        ">
            ENVIAR HALO DE LUZ (-100 G)
        </span>
    </button>                            
                            
                            <div className="flex gap-1">
                                <button onClick={() => onTuneIn(creator)} className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-[8px] uppercase rounded shadow-md border border-red-500">▶ LIVE</button>
                                <button onClick={() => handlePlayBCast(creator)} className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-black text-[8px] uppercase rounded shadow-md border border-violet-400">📼 B-CAST</button>
                            </div>
                            
                            
                            <div className="flex gap-1">
                                {creator.role && creator.role.includes('SHOP') ? (<button onClick={() => handleOpenShop(creator)} className="flex-1 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[8px] uppercase rounded shadow-md">🛒 TIENDA</button>) : ( <div className="flex-1"></div> )}
                                <button onClick={() => onUserClick(creator)} className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[8px] uppercase rounded shadow-[0_0_10px_rgba(34,211,238,0.5)]">👤 PERFIL</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filteredCreators.length === 0 && (
                <div className="w-full h-64 flex flex-col items-center justify-center text-gray-600"><span className="text-4xl mb-2">📡</span><p className="text-xs font-mono uppercase">No hay señales en esta frecuencia.</p></div>
            )}
        </div>
    </div>
  );
};
export default LiveGrid;