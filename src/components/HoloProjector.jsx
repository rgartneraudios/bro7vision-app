// src/components/HoloProjector.jsx
import React, { useRef, useState, useEffect } from 'react';

const HoloProjector = ({ videoUrl, user, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [haloSent, setHaloSent] = useState(false); 
  const [showSpirit, setShowSpirit] = useState(false); 
  const videoRef = useRef(null);

  // 1. CONFIGURACIÓN DE COLORES (PALETA COMPLETA)
  let neonClass = 'border-cyan-500 shadow-[0_0_30px_cyan,inset_0_0_20px_cyan]';
  let textClass = 'text-cyan-400';
  let beamColor = '6,182,212'; // Base Cyan
  
  // Normalizamos para evitar errores
  const userColor = (user?.neonColor || user?.card_color || '').toLowerCase();

  if (userColor.includes('fuchsia') || userColor.includes('magenta')) { 
      neonClass = 'border-fuchsia-500 shadow-[0_0_50px_rgba(217,70,239,0.8),inset_0_0_30px_rgba(217,70,239,0.5)]'; 
      textClass = 'text-fuchsia-400'; 
      beamColor = '217,70,239'; 
  }
  if (userColor.includes('yellow') || userColor.includes('gold')) { 
      neonClass = 'border-[#C7AF38] shadow-[0_0_50px_rgba(199,175,56,0.8),inset_0_0_30px_rgba(199,175,56,0.5)]'; 
      textClass = 'text-[#C7AF38]'; 
      beamColor = '199,175,56'; 
  }
  if (userColor.includes('red')) { 
      neonClass = 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.8),inset_0_0_30px_rgba(239,68,68,0.5)]'; 
      textClass = 'text-red-500'; 
      beamColor = '239,68,68'; 
  }
  if (userColor.includes('green') || userColor.includes('emerald')) { 
      neonClass = 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.8),inset_0_0_30px_rgba(34,197,94,0.5)]'; 
      textClass = 'text-green-400'; 
      beamColor = '34,197,94'; 
  }
  if (userColor.includes('blue')) { 
      neonClass = 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.8),inset_0_0_30px_rgba(59,130,246,0.5)]'; 
      textClass = 'text-blue-400'; 
      beamColor = '59,130,246'; 
  }
  if (userColor.includes('orange')) { 
      neonClass = 'border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.8),inset_0_0_30px_rgba(249,115,22,0.5)]'; 
      textClass = 'text-orange-400'; 
      beamColor = '249,115,22'; 
  }
  // BLANCO / PLATA
  if (userColor.includes('silver')) { 
      neonClass = 'border-[#D9D9D9] shadow-[0_0_50px_rgba(217,217,217,0.8),inset_0_0_30px_rgba(217,217,217,0.5)]'; 
      textClass = 'text-[#D9D9D9]'; 
      beamColor = '217,217,217'; 
  }
  
  // 2. CORRECCIÓN URL
  const getPlayableUrl = (url) => {
    if (!url) return "";
    let clean = url.trim();
    if (clean.startsWith('/')) return clean; 
    if (clean.includes('dropbox.com')) {
       clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
       clean = clean.replace('dropbox.com', 'dl.dropboxusercontent.com');
       if (clean.includes('rlkey')) return clean;
       return clean.split('?')[0]; 
    }
    return clean;
  };

  const finalSrc = getPlayableUrl(videoUrl);
  const shopLink = user?.product_url || user?.service_url;
  const avatarImage = user.avatar_url || user.img || 'https://placehold.co/150x150/000000/FFFFFF/png?text=Anon';

  const handleSendHalo = () => {
      setHaloSent(true);
      setShowSpirit(true);
      setTimeout(() => {
          setHaloSent(false);
          setShowSpirit(false); 
      }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn overflow-hidden">
        
        {/* === A. CAÑÓN DE LUZ (ABANICO AMPLIO + COBERTURA TOTAL) === */}
        <div 
            className="absolute inset-0 pointer-events-none z-0 animate-pulse-slow"
            style={{
                // ORIGEN: Esquina absoluta (100% 0%)
                // ÁNGULO: Desde 180deg (Vertical abajo) barriendo hasta la izquierda
                background: `conic-gradient(from 200deg at 100% 0%, 
    		rgba(${beamColor}, 0) 0deg,      /* Totalmente transparente al inicio */
    		rgba(${beamColor}, 0.8) 35deg,   /* Núcleo mucho más suave */
    		rgba(${beamColor}, 0.9) 55deg,   /* Brillo máximo reducido */
    		rgba(${beamColor}, 0) 90deg,     /* Corte más rápido para oscurecer */
                        transparent 100deg)`,
                
                // MÁSCARA: Suavizamos el corte para dejar pasar el haz ancho
                maskImage: 'linear-gradient(to right, transparent 30%, black 80%)',
WebkitMaskImage: 'linear-gradient(to right, transparent 30%, black 80%)',                
                filter: 'blur(60px)', 
                opacity: 1,
                mixBlendMode: 'screen'
            }}
        ></div>

        {/* FOCO DE ORIGEN (GIGANTE) */}
        <div 
            className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] rounded-full blur-[100px] pointer-events-none z-0 opacity-60"
            style={{ background: `radial-gradient(circle, rgba(${beamColor}, 1) 0%, transparent 60%)` }}
        ></div>


        {/* --- B. ANIMACIÓN DEL HALO --- */}
        {showSpirit && (
            <div className="absolute bottom-[20%] right-[20%] md:right-[35%] z-[100] pointer-events-none animate-spiritFloatModal">
                <div className="w-16 h-16 rounded-full bg-white blur-md flex items-center justify-center shadow-[0_0_40px_white]">
                    <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-60"></div>
                </div>
            </div>
        )}

        {/* --- C. BOTÓN CERRAR --- */}
        <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-white z-50 font-black tracking-widest text-xs flex items-center gap-2 hover:scale-110 transition-transform bg-black/40 px-4 py-2 rounded-full border border-white/40 cursor-pointer backdrop-blur shadow-[0_0_20px_rgba(255,255,255,0.5)]">
            <span>✖</span> CERRAR PROYECCIÓN
        </button>

        {/* --- D. CONTENEDOR VIDEO --- */}
        <div className={`relative z-10 h-[80vh] md:h-[85vh] aspect-[9/16] bg-black rounded-3xl overflow-hidden border-2 ${neonClass} transition-all duration-500 animate-hologramExpand shadow-2xl`}>
            
            {/* SCANLINES */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2Q4N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0N2Q0/3o7qE1YN7aQf3rfWve/giphy.gif')] bg-cover mix-blend-overlay"></div>
            
            {/* VIDEO DE FONDO (BLUR) */}
            <video src={finalSrc} className="absolute inset-0 w-full h-full object-cover opacity-60 blur-2xl scale-125" autoPlay loop muted />

            {/* VIDEO REAL */}
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

            {/* HUD SUPERIOR */}
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

            {/* HUD INFERIOR */}
            <div className="absolute bottom-24 right-4 z-30 flex flex-col gap-6 items-center">
                 <button onClick={handleSendHalo} className={`group relative w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center text-xl transition-all ${haloSent ? 'bg-cyan-500 border-white scale-110 shadow-[0_0_20px_cyan]' : 'bg-black/40 border-white/20 hover:bg-white hover:text-black'}`}>
                    {haloSent ? '✨' : '⚪'}
                    <span className="absolute right-full mr-2 bg-black/80 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20">
                        {haloSent ? '¡ENVIADO!' : 'Enviar Halo (-100)'}
                    </span>
                 </button>
                 {shopLink && (
                     <button onClick={() => window.open(shopLink, '_blank')} className="group relative w-14 h-14 rounded-full bg-yellow-400 text-black flex items-center justify-center text-2xl hover:scale-110 transition-all shadow-[0_0_30px_yellow] border-2 border-white animate-bounce-slow cursor-pointer">
                        🛍️
                        <span className="absolute right-full mr-2 bg-yellow-400 text-black font-bold text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ABRIR TIENDA
                        </span>
                     </button>
                 )}
            </div>

            {/* PAUSA ICON */}
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
            @keyframes spiritFloatModal { 
                0% { transform: translateY(0) scale(0.5); opacity: 0; } 
                50% { transform: translateY(-100px) scale(1.2); opacity: 1; } 
                100% { transform: translateY(-300px) scale(0); opacity: 0; } 
           @keyframes beamFlicker {
    0%, 100% { opacity: 0.4; transform: skewX(0deg) scale(1); }
    50% { opacity: 0.6; transform: skewX(1deg) scale(1.02); }
}
            }
            .animate-hologramExpand { animation: hologramExpand 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
            .animate-spiritFloatModal { animation: spiritFloatModal 1.5s ease-out forwards; }
            .animate-bounce-slow { animation: bounce 3s infinite; }
            .animate-pulse-slow { animation: pulse 6s ease-in-out infinite; }
        `}} />
    </div>
  );
};

export default HoloProjector;