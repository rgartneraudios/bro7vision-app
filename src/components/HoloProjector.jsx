// src/components/HoloProjector.jsx
import React, { useRef, useState } from 'react';

const HoloProjector = ({ videoUrl, user, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  // 1. CONFIGURACIÓN DE COLORES NEÓN
  let neonClass = 'border-cyan-500 shadow-[0_0_30px_cyan,inset_0_0_20px_cyan]';
  let textClass = 'text-cyan-400';
  let beamClass = 'from-cyan-500/20';
  
  if (user?.card_color?.includes('fuchsia')) { 
      neonClass = 'border-fuchsia-500 shadow-[0_0_30px_magenta,inset_0_0_20px_magenta]'; 
      textClass = 'text-fuchsia-400'; 
      beamClass = 'from-fuchsia-500/20';
  }
  if (user?.card_color?.includes('yellow')) { 
      neonClass = 'border-yellow-400 shadow-[0_0_30px_yellow,inset_0_0_20px_yellow]'; 
      textClass = 'text-yellow-400'; 
      beamClass = 'from-yellow-400/20';
  }
  if (user?.card_color?.includes('red')) { 
      neonClass = 'border-red-500 shadow-[0_0_30px_red,inset_0_0_20px_red]'; 
      textClass = 'text-red-500'; 
      beamClass = 'from-red-500/20';
  }

  // 2. CORRECCIÓN DE URL (SOLUCIÓN PANTALLA NEGRA)
  // 2. CORRECCIÓN DE URL (SOLUCIÓN PANTALLA NEGRA)
  const getPlayableUrl = (url) => {
    if (!url) return "";
    let clean = url.trim(); // Quitar espacios
    
    if (clean.startsWith('/')) return clean;

    // Dropbox Fix Blindado
    if (clean.includes('dropbox.com')) {
       clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
       clean = clean.replace('dropbox.com', 'dl.dropboxusercontent.com'); // Asegurar reemplazo
       
       // Si tiene clave de seguridad, la mantenemos
       if (clean.includes('rlkey')) return clean;

       return clean.split('?')[0]; 
    }
    return clean;
  };
  
    const finalSrc = getPlayableUrl(videoUrl);
  const shopLink = user?.product_url || user?.service_url;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
        
        {/* BOTÓN CERRAR */}
        <button onClick={onClose} className="absolute top-6 right-6 text-white/80 hover:text-white z-50 font-black tracking-widest text-xs flex items-center gap-2 hover:scale-110 transition-transform bg-black/50 px-4 py-2 rounded-full border border-white/20 cursor-pointer">
            <span>✖</span> CERRAR PROYECCIÓN
        </button>

        {/* --- CONTENEDOR HOLOGRÁFICO --- */}
        <div className={`relative h-[80vh] md:h-[85vh] aspect-[9/16] bg-black rounded-3xl overflow-hidden border-2 ${neonClass} transition-all duration-500 animate-hologramExpand`}>
            
            {/* A. EFECTO SCANLINES */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-20 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2Q4N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0/3o7qE1YN7aQf3rfWve/giphy.gif')] bg-cover mix-blend-overlay"></div>
            
            {/* B. BEAM LUZ */}
            <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${beamClass} to-transparent z-20 pointer-events-none opacity-60`}></div>

            {/* C. VIDEO FONDO (BLUR) */}
            <video 
                src={finalSrc} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 blur-2xl scale-125" 
                autoPlay loop muted 
            />

            {/* D. VIDEO REAL */}
            <video 
                ref={videoRef}
                src={finalSrc} 
                className="absolute inset-0 w-full h-full object-cover z-10" 
                autoPlay 
                loop 
                playsInline
                // muted={false} <--- IMPORTANTE: Algunos navegadores bloquean autoplay si no es muted. 
                // Si sale negro, prueba a descomentar 'muted' para testear.
                onClick={() => {
                    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); } 
                    else { videoRef.current.pause(); setIsPlaying(false); }
                }}
                onError={(e) => console.error("Error cargando video:", e)}
            />

            {/* E. HUD / INTERFAZ */}
            <div className="absolute top-0 left-0 w-full p-6 z-30 bg-gradient-to-b from-black/90 via-transparent to-transparent flex items-center gap-4">
                <div className={`p-[2px] rounded-full bg-gradient-to-tr ${beamClass.replace('from-', 'from-white to-')}`}>
                    <img src={user.img || user.avatar_url} className="w-12 h-12 rounded-full border-2 border-black" />
                </div>
                <div>
                    <h3 className="text-white font-black text-lg leading-none tracking-wide drop-shadow-md uppercase">{user.alias}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                        <p className={`text-[10px] font-mono ${textClass} uppercase tracking-widest`}>HOLO-LIVE</p>
                    </div>
                </div>
            </div>

            {/* F. BOTONES LATERALES (NUEVOS ICONOS) */}
            <div className="absolute bottom-24 right-4 z-30 flex flex-col gap-6 items-center">
                 
                 {/* 1. HALO (Reemplaza al Corazón) */}
                 <button className="group relative w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl hover:scale-110 transition-all hover:bg-white hover:text-black hover:border-cyan-400">
                    ⚪
                    <span className="absolute right-full mr-2 bg-black/80 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20">
                        Enviar Halo
                    </span>
                 </button>
                 
                 {/* 2. BOLSA (Reemplaza al Carrito) */}
                 {shopLink && (
                     <button onClick={() => window.open(shopLink, '_blank')} className="group relative w-14 h-14 rounded-full bg-yellow-400 text-black flex items-center justify-center text-2xl hover:scale-110 transition-all shadow-[0_0_30px_yellow] border-2 border-white animate-bounce-slow">
                        🛍️
                        <span className="absolute right-full mr-2 bg-yellow-400 text-black font-bold text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ABRIR TIENDA
                        </span>
                     </button>
                 )}
            </div>

            {/* G. PAUSA ICON */}
            {!isPlaying && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[2px]">
                    <div className="text-8xl text-white/80 drop-shadow-[0_0_20px_black]">▶</div>
                </div>
            )}
        </div>

        <style dangerouslySetInnerHTML={{__html: `
            @keyframes hologramExpand {
                0% { transform: scaleY(0.01) scaleX(0); opacity: 0; filter: blur(20px); }
                50% { transform: scaleY(0.01) scaleX(1); opacity: 0.8; filter: blur(5px); }
                100% { transform: scaleY(1) scaleX(1); opacity: 1; filter: blur(0); }
            }
            .animate-hologramExpand { animation: hologramExpand 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
            .animate-bounce-slow { animation: bounce 2s infinite; }
        `}} />
    </div>
  );
};

export default HoloProjector;