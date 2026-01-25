// src/components/HoloProjector.jsx
import React, { useRef, useState, useEffect } from 'react';

  const HoloProjector = ({ videoUrl, user, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [haloSent, setHaloSent] = useState(false); 
  const [showSpirit, setShowSpirit] = useState(false); // Estado para la animación visual del Halo
  const videoRef = useRef(null);

  // 1. CONFIGURACIÓN DE COLORES NEÓN Y HAZ DE LUZ
  let neonClass = 'border-cyan-500 shadow-[0_0_30px_cyan,inset_0_0_20px_cyan]';
  let textClass = 'text-cyan-400';
  let beamColor = 'rgba(6,182,212,'; // Base Cyan
  
  if (user?.card_color?.includes('fuchsia')) { 
      neonClass = 'border-fuchsia-500 shadow-[0_0_80px_rgba(217,70,239,0.6),inset_0_0_40px_rgba(217,70,239,0.4)]';
      textClass = 'text-fuchsia-400'; 
      beamColor = 'rgba(217,70,239,';
  }
  if (user?.card_color?.includes('yellow')) { 
      neonClass = 'border-yellow-500 shadow-[0_0_80px_yellow,inset_0_0_20px_yellow]'; 
      textClass = 'text-yellow-400'; 
      beamColor = 'rgba(250,204,21,';
  }
  if (user?.card_color?.includes('red')) { 
      neonClass = 'border-red-500 shadow-[0_0_80px_red,inset_0_0_20px_red]'; 
      textClass = 'text-red-500'; 
      beamColor = 'rgba(239,68,68,';
  }

  // 2. CORRECCIÓN DE URL BLINDADA (Dropbox)
  const getPlayableUrl = (url) => {
    if (!url) return "";
    let clean = url.trim();
    if (clean.startsWith('/')) return clean; // Archivo local
    
    if (clean.includes('dropbox.com')) {
       clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
       clean = clean.replace('dropbox.com', 'dl.dropboxusercontent.com');
       
       // Si tiene clave de seguridad, la mantenemos
       if (clean.includes('rlkey')) return clean;
       
       return clean.split('?')[0]; 
    }
    return clean;
  };

  const finalSrc = getPlayableUrl(videoUrl);
  const shopLink = user?.product_url || user?.service_url;
  
  // 3. PRIORIDAD DE AVATAR (Redonda > Banner > Placeholder)
  const avatarImage = user.avatar_url || user.img || 'https://via.placeholder.com/150';

  // 4. LÓGICA DEL HALO
  const handleSendHalo = () => {
      setHaloSent(true);
      setShowSpirit(true); // Disparar animación
      
      // Resetear estados después de la animación
      setTimeout(() => {
          setHaloSent(false);
          setShowSpirit(false); 
      }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn overflow-hidden">
        
       {/* --- A. CAÑÓN DE LUZ FINAL (COBERTURA TOTAL) --- */}
<div 
    className="absolute top-[-45%] right-[-20%] w-[270%] h-[160%] pointer-events-none z-0"
    style={{
        opacity: 0.85, 
            background: `conic-gradient(from 190deg at 90% 5%, 
            transparent 0deg, 
            ${beamColor}0.3) 10deg, 
            ${beamColor}0.6) 25deg, 
            ${beamColor}0.3) 40deg, 
            transparent 55deg)`,
        filter: 'blur(40px)',
        mixBlendMode: 'screen'
    }}
></div> 
        
        {/* --- B. ANIMACIÓN DEL HALO (ESPÍRITU) --- */}
        {/* Está fuera del contenedor del video para que no se corte al subir */}
        {showSpirit && (
            <div className="absolute bottom-[20%] right-[20%] md:right-[35%] z-[100] pointer-events-none animate-spiritFloatModal">
                <div className="w-16 h-16 rounded-full bg-white blur-md flex items-center justify-center shadow-[0_0_40px_white]">
                    <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-60"></div>
                </div>
            </div>
        )}

        {/* --- C. BOTÓN CERRAR --- */}
        <button onClick={onClose} className="absolute top-6 right-6 text-white/80 hover:text-white z-50 font-black tracking-widest text-xs flex items-center gap-2 hover:scale-110 transition-transform bg-black/50 px-4 py-2 rounded-full border border-white/20 cursor-pointer backdrop-blur">
            <span>✖</span> CERRAR PROYECCIÓN
        </button>

        {/* --- D. CONTENEDOR VIDEO (HOLO FRAME) --- */}
        <div className={`relative z-10 h-[80vh] md:h-[85vh] aspect-[9/16] bg-black rounded-3xl overflow-hidden border-2 ${neonClass} transition-all duration-500 animate-hologramExpand shadow-2xl`}>
            
            {/* D.1 SCANLINES */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2Q4N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0/3o7qE1YN7aQf3rfWve/giphy.gif')] bg-cover mix-blend-overlay"></div>
            
            {/* D.2 VIDEO DE FONDO (BLUR) para rellenar */}
            <video 
                src={finalSrc} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 blur-2xl scale-125" 
                autoPlay loop muted 
            />

            {/* D.3 VIDEO REAL */}
            <video 
                ref={videoRef}
                src={finalSrc} 
                className="absolute inset-0 w-full h-full object-cover z-10" 
                autoPlay loop playsInline
                onClick={() => {
                    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); } 
                    else { videoRef.current.pause(); setIsPlaying(false); }
                }}
                onError={(e) => console.error("Error video:", e)}
            />

            {/* D.4 HUD SUPERIOR (INFO USER) */}
            <div className="absolute top-0 left-0 w-full p-6 z-30 bg-gradient-to-b from-black/90 via-transparent to-transparent flex items-center gap-4">
                <div className={`p-[2px] rounded-full bg-gradient-to-tr from-white to-transparent`}>
                    <img src={avatarImage} className="w-12 h-12 rounded-full border-2 border-black object-cover" />
                </div>
                <div>
                    <h3 className="text-white font-black text-lg leading-none tracking-wide drop-shadow-md uppercase">{user.alias}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                        <p className={`text-[10px] font-mono ${textClass} uppercase tracking-widest`}>HOLO-LIVE</p>
                    </div>
                </div>
            </div>

            {/* D.5 HUD INFERIOR (BOTONES FLOTANTES) */}
            <div className="absolute bottom-24 right-4 z-30 flex flex-col gap-6 items-center">
                 
                 {/* BOTÓN HALO */}
                 <button 
                    onClick={handleSendHalo}
                    className={`group relative w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center text-xl transition-all ${haloSent ? 'bg-cyan-500 border-white scale-110 shadow-[0_0_20px_cyan]' : 'bg-black/40 border-white/20 hover:bg-white hover:text-black'}`}
                 >
                    {haloSent ? '✨' : '⚪'}
                    <span className="absolute right-full mr-2 bg-black/80 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20">
                        {haloSent ? '¡ENVIADO!' : 'Enviar Halo (-100)'}
                    </span>
                 </button>
                 
                 {/* BOTÓN TIENDA */}
                 {shopLink && (
                     <button onClick={() => window.open(shopLink, '_blank')} className="group relative w-14 h-14 rounded-full bg-yellow-400 text-black flex items-center justify-center text-2xl hover:scale-110 transition-all shadow-[0_0_30px_yellow] border-2 border-white animate-bounce-slow cursor-pointer">
                        🛍️
                        <span className="absolute right-full mr-2 bg-yellow-400 text-black font-bold text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ABRIR TIENDA
                        </span>
                     </button>
                 )}
            </div>

            {/* D.6 PAUSA ICON */}
            {!isPlaying && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[2px]">
                    <div className="text-8xl text-white/80 drop-shadow-[0_0_20px_black]">▶</div>
                </div>
            )}
        </div>

        {/* --- ESTILOS Y ANIMACIONES --- */}
        <style dangerouslySetInnerHTML={{__html: `
            @keyframes hologramExpand {
                0% { transform: scaleY(0.01) scaleX(0); opacity: 0; filter: blur(20px); }
                50% { transform: scaleY(0.01) scaleX(1); opacity: 0.8; filter: blur(5px); }
                100% { transform: scaleY(1) scaleX(1); opacity: 1; filter: blur(0); }
            }
            @keyframes spiritFloatModal { 
                0% { transform: translateY(0) scale(0.5); opacity: 0; } 
                50% { transform: translateY(-100px) scale(1.2); opacity: 1; } 
                100% { transform: translateY(-300px) scale(0); opacity: 0; } 
            } 
            .animate-hologramExpand { animation: hologramExpand 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
            .animate-spiritFloatModal { animation: spiritFloatModal 1.5s ease-out forwards; }
            .animate-bounce-slow { animation: bounce 3s infinite; }
        `}} />
    </div>
  );
};

export default HoloProjector;