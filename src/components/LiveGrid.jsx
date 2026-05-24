// src/components/LiveGrid.jsx
import React, { useState } from 'react';

const LiveGrid = ({ items, onTuneIn, onUserClick, onClose, onOpenVideo, onSelectShop }) => {
  // Ya no necesitamos 'creators', usamos directamente 'items' que viene de App.jsx
  const [filter, setFilter] = useState('ALL'); 
  const[activeHalo, setActiveHalo] = useState(null); 

  // --- ESTILOS DEL HALO (MEDUSA) INYECTADOS ---
  // --- ESTILOS INYECTADOS DIRECTAMENTE AL DOM ---
  const haloStyles = `
    /* ESTILOS DEL HALO (Los que ya tenías) */
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
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* 🌟 1. SCROLLBAR NEÓN CYAN/FUCSIA (Para la lista de creadores) 🌟 */
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px; /* Ancho de la barra vertical */
        height: 8px; /* Alto si hay horizontal */
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(5, 5, 5, 0.5); /* Fondo semitransparente oscuro */
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #00f2ff; /* Cyan Neón brillante */
        border-radius: 10px;
        border: 1px solid #000; /* Borde negrito para que resalte */
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #bc13fe; /* Al pasar el ratón se vuelve Fucsia */
    }
    /* Soporte para Firefox */
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #00f2ff rgba(5, 5, 5, 0.5);
    }

    /* 👻 2. OCULTAR SCROLLBAR (Para los botones de filtro ALL, TALK, etc) 👻 */
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none; /* Edge antiguo */
        scrollbar-width: none; /* Firefox */
    }
  `;
  
  const triggerHalo = (creator) => {
      setActiveHalo(creator.alias?.toUpperCase() || 'CREADOR');
      setTimeout(() => setActiveHalo(null), 6000); 
  };

  const handleGoToShop = (creator) => {
      const shopItem = {
          ...creator,
          name: creator.alias || creator.name || 'Producto Genérico',
          shopName: creator.alias,
          img: creator.img || creator.banner_url || creator.avatar_url,
          isAsset: false,
          hasProduct: true,
          productData: { 
              name: creator.alias || 'Servicio Creator', 
              price: creator.price || 10 
          }
      };
      onSelectShop(shopItem);
  };

  // 🛡️ Filtramos directamente sobre la variable 'items' (con un seguro por si viene vacía)
  const safeItems = Array.isArray(items) ? items :[];
  const filteredCreators = safeItems.filter(c => filter === 'ALL' || (c.role && c.role.includes(filter)));

  return ( 
    <div className="absolute top-40 bottom-44 md:top-[15%] md:bottom-[15%] left-0 right-0 max-w-6xl mx-auto pointer-events-auto z-40 animate-zoomIn flex flex-col px-4">
        
        {/* INYECCIÓN DE ESTILOS */}
        <style>{haloStyles}</style>

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

       {/* FILTROS CENTRADOS */}
<div className="relative w-full flex justify-center items-center mb-3 bg-black/60 p-1.5 md:p-2 rounded-xl border border-white/10 backdrop-blur-md shrink-0">
    <div className="flex gap-1 md:gap-2 overflow-x-auto no-scrollbar">
        {['ALL', 'TALK', 'MUSIC', 'SHOP'].map(f => (
            <button 
                key={f} 
                onClick={() => setFilter(f)} 
                className={`px-4 py-1.5 md:px-5 md:py-2 text-[9px] md:text-[10px] font-black uppercase rounded-lg border transition-all ${filter === f ? 'bg-white text-black border-white shadow-[0_0_20px_white]' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}
            >
                {f}
            </button>
        ))}
    </div>
    <button onClick={onClose} className="absolute right-3 text-gray-500 text-[9px] font-black uppercase hover:text-white transition-colors">✕</button>
</div>

{/* 🚀 NUEVOS LADRILLOS DE ESTADO (LEYENDA) */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6 w-full shrink-0">
    {/* AUDIO & LIVES - AZUL */}
    <div className="h-10 md:h-12 bg-[#0033FF] rounded-xl border border-white/20 shadow-[0_0_15px_rgba(2,2,176,0.4)] flex items-center justify-center group hover:scale-[1.02] transition-transform">
         <span className="text-[8px] md:text-[10px] text-white font-black uppercase tracking-[0.1em] drop-shadow-md">AUDIO & LIVES</span>
    </div>

    {/* TELEFONO CASA - VERDE */}
    <div className="h-10 md:h-12 bg-[#00FF33] rounded-xl border border-black/20 shadow-[0_0_15px_rgba(103,255,74,0.4)] flex items-center justify-center group hover:scale-[1.02] transition-transform">
         <span className="text-[8px] md:text-[10px] text-black font-black uppercase tracking-[0.1em]">TELEFONO CASA</span>
    </div>

    {/* BROSHOP - AMARILLO */}
    <div className="h-10 md:h-12 bg-[#FFFF1F] rounded-xl border border-black/20 shadow-[0_0_15px_rgba(255,242,112,0.4)] flex items-center justify-center group hover:scale-[1.02] transition-transform">
         <span className="text-[8px] md:text-[10px] text-black font-black uppercase tracking-[0.1em]">BROSHOP</span>
    </div>

    {/* HALO DE LUZ - BLANCO */}
    <div className="h-10 md:h-12 bg-[#FFFAFA] rounded-xl border border-black/20 shadow-[0_0_15px_rgba(255,250,250,0.6)] flex items-center justify-center group hover:scale-[1.02] transition-transform">
         <span className="text-[8px] md:text-[10px] text-black font-black uppercase tracking-[0.1em]">HALO DE LUZ</span>
    </div>
</div>
        {/* GRID CENTRADO CORREGIDO */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto custom-scrollbar px-1">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 pb-48 justify-items-center">{filteredCreators.map((creator) => (
            <div key={creator.id} className="group relative w-full aspect-[3/4] bg-[#050505] rounded-xl md:rounded-2xl overflow-hidden border border-white/5 hover:border-fuchsia-500/50 transition-all duration-700 shadow-2xl">
                
                {/* Imagen de fondo (Con fallback por si no tiene foto) */}
                <img 
                    src={creator.img || creator.banner_url || creator.avatar_url || 'https://placehold.co/400x500/000000/FFFFFF/png?text=No+Signal'} 
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-20 transition-opacity" 
                    alt={creator.alias || 'Usuario'} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue via-slate/10 to-transparent"></div>
                
                {/* Badge de Distancia */}
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[7px] text-cyan-400 font-bold border border-cyan-500/20 shadow-lg">📡 {creator.city || creator.distance || 'Online'}</div>
                
               {/* Info del Creador - Ajustado */}
<div className="absolute bottom-24 left-2 right-2 text-center">
    <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-tighter truncate drop-shadow-md mb-1">
        {creator.alias}
    </h3>
    
    {/* Contenedor con altura mínima para que no salte el layout */}
    <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1 min-h-[30px] flex items-center justify-center">
        <p className="text-[10px] md:text-[11px] font-bold text-[#00FFFB] italic leading-tight line-clamp-2 text-center drop-shadow-[0_0_4px_rgba(0,3,255,0.8)]">
            "{creator.twit_message || creator.desc || 'Emitiendo...'}"
        </p>
    </div>
</div>           
                {/* NUEVA BOTONERA ESTRATÉGICA - ESTILO NEÓN MULTICOLOR */}
<div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1.5">
    
    {/* 1. BOTÓN DE 🎧 AUDIO & LIVES */}
    {(creator.video_file || creator.casa_video) && (
         <button 
        onMouseEnter={() => { if (typeof onUserClick === 'function') onUserClick(creator); }}
        onClick={() => onTuneIn(creator)} 
        className="py-2 bg-black text-white border-2 border-[#0033FF] rounded-xl text-[9px] font-black uppercase shadow-[0_0_10px_rgba(0,242,255,0.3)] hover:shadow-[0_0_15px_rgba(0,242,255,0.6)] transition-all flex items-center justify-center"
    >
        🎧 AUDIO & LIVES
    </button>
    )}
    
    {/* 2. FILA SECUNDARIA: AUDIO (AZUL), TIENDA (ORO) Y HALO (BLANCO) */}
<div className="grid grid-cols-3 gap-1.5"> {/* Cambié a grid-cols-3 para que quepan 3 */}
    
    {/* BOTÓN DE ☝️ TELEFONO CASA - VERSIÓN Verde jardin */}
     <button 
            // 💡 NOTA: Al hacer hover, activamos el prisma. Al hacer click, abre el video
            onMouseEnter={() => { if (typeof onUserClick === 'function') onUserClick(creator); }}
            onClick={() => onOpenVideo(creator)} 
            className="w-full py-2.5 bg-black text-white border-2 border-[#13FE3E] rounded-xl text-[9px] font-black uppercase 
                       shadow-[0_0_15px_rgba(45,245,24,0.4),inset_0_0_8px_rgba(45,245,24,0.2)] 
                       hover:shadow-[0_0_20px_rgba(45,245,24,0.7)] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
            <span className="drop-shadow-[0_0_5px_rgba(45,245,24,0.8)]">☝️</span>
        </button>

    {/* Tienda */}
    <button 
        onMouseEnter={() => { if (typeof onUserClick === 'function') onUserClick(creator); }}
        onClick={() => handleGoToShop(creator)} 
        className="py-2 bg-black text-white border-2 border-[#facc15] rounded-xl text-[9px] font-black uppercase shadow-[0_0_10px_rgba(250,204,21,0.3)] hover:shadow-[0_0_15px_rgba(250,204,21,0.6)] transition-all flex items-center justify-center"
    >
        🦝
    </button>

    {/* BOTÓN MEDUSA (HALO) */}
    <button 
        onMouseEnter={() => { if (typeof onUserClick === 'function') onUserClick(creator); }}
        onClick={() => triggerHalo(creator)} 
        className="py-2 bg-black text-white border-2 border-[#FFFFFF] rounded-xl text-[9px] font-black uppercase shadow-[0_0_10px_rgba(255,0,255,0.3)] hover:shadow-[0_0_15px_rgba(255,0,255,0.6)] transition-all flex items-center justify-center"
    >
        🌩️
    </button>
</div></div>
            </div>
        ))}
    	</div>
	</div>
    </div>
);
};

export default LiveGrid;