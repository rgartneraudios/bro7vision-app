// src/components/HoloProjector.jsx
import React, { useRef, useState, useEffect, useMemo } from 'react'; 
import { supabase } from '../supabaseClient';

const HoloProjector = ({ videoUrl, user, balances, setBalances, session, onClose, onOpenLog }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeReaction, setActiveReaction] = useState(null);
  const [question, setQuestion] = useState("");
  
  // --- LÓGICA MULTICANAL ---
  const videoPlaylist = useMemo(() => {
    return [
        user.video_file,
        user.video_file_2,
        user.video_file_3
    ].filter(url => url && url.trim() !== ""); // Filtramos solo los que tengan link
  }, [user]);

  const [currentIndex, setCurrentIndex] = useState(0);
  
  const videoRef = useRef(null);
  
   // Gestos Móvil
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev + 1) % videoPlaylist.length);
  };

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : videoPlaylist.length - 1));
  };

  const handleTouchStart = (e) => { touchStart.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e) => { touchEnd.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (distance > 70) nextVideo();
    if (distance < -70) prevVideo();
    touchStart.current = 0; touchEnd.current = 0;
  };

  // --- 1. SELECCIÓN DE VIDEO DE FONDO (NATURAL) ---
  const bgKey = user.intimo_bg && user.intimo_bg !== "" ? user.intimo_bg : 'salon';
const backgroundVideo = `/videos/intimo_${bgKey}.mp4`;

  const getCleanUrl = (url) => {
    if (!url) return "";
    let clean = url.trim();
    if (clean.includes('dropbox.com')) {
        clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('&dl=0', '');
        return clean.includes('?') ? `${clean}&raw=1` : `${clean}?raw=1`;
    }
    return clean;
  };
  
  const energyStyles = ` 

   /* ANIMACIÓN GEMA DE ENERGÍA - TRAYECTO CIRCULAR */
@keyframes vortexRise {
    /* Inicio: Aparece desde la izquierda abajo */
    0%   { 
        transform: translate(-80vw, -30vh) scale(0.9) rotate(0deg); 
        opacity: 0.8;
        z-index: 200;
    }

    /* Punto 1: Izquierda abajo X20, Y80 */
    15%  { 
        transform: translate(-30vw, 0vh) scale(1.3) rotate(90deg);
        z-index: 200;
    }
        
    /* Punto 3: Derecha arriba X70, Y60 */
    70%  { 
        transform: translate(10vw, -35vh) scale(1.2) rotate(450deg);
        z-index: 200;
    }
    
    /* Comienza a ir hacia el centro del visor */
    80%  { 
        transform: translate(5vw, -45vh) scale(0.9) rotate(540deg);
        z-index: 200;
    }
      
    /* Punto final: Centro del visor X50, Y20 */
    100% { 
        transform: translate(-30vw, -60vh) scale(0.05) rotate(720deg);
        z-index: 50;
        opacity: 0.8;
    }
}

.animate-vortex { 
    animation: vortexRise 6s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
}
  /* ROTACIÓN DEL REMOLINO (rápida y continua) */
  @keyframes vortexSpin {
      0% { transform: rotate(0deg) scale(1); }
      100% { transform: rotate(360deg) scale(1.05); }
  }
  
  .animate-spin-vortex { 
      animation: vortexSpin 1.5s linear infinite; 
  }

  /* PULSO DE ENERGÍA */
  @keyframes energyPulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 1; }
  }
  
  .animate-energy-pulse {
      animation: energyPulse 2s ease-in-out infinite;
  }

  /* ESPIRALES GIRANDO EN SENTIDO CONTRARIO */
  @keyframes spiralCounter {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(-360deg); }
  }
  
  .animate-spiral-counter {
      animation: spiralCounter 3s linear infinite;
  }

  /* PARTÍCULAS DE ENERGÍA */
  @keyframes particleOrbit {
      0% { transform: rotate(0deg) translateX(30px) scale(1); opacity: 1; }
      100% { transform: rotate(360deg) translateX(30px) scale(0.5); opacity: 0; }
  }
  
  .animate-particle-orbit {
      animation: particleOrbit 2s ease-out infinite;
  }

  /* DESTELLOS INTERMITENTES */
  @keyframes flare {
      0%, 60%, 100% { opacity: 0; transform: scale(0.8); }
      70% { opacity: 1; transform: scale(1.3); }
  }
  
  .animate-flare {
      animation: flare 3s ease-in-out infinite;
  }
`;   
   const colors = [
  "#00127A", // azul
  "#FF007D", // fucsia
  "#00FF48", // esmeralda
  "#4D00FA", // violeta
  "#facc15", // amarillo
  "#CF0000", // rojo
  "#00E1FF"  // cyan
];

const selectedColor = colors[Math.floor(Math.random() * colors.length)];

  const handleSendHalo = async () => {
    if (balances.genesis < 100) { alert("SIN GÉNESIS"); return; }
    const newGenesis = balances.genesis - 100;
    setBalances(prev => ({ ...prev, genesis: newGenesis }));
    setActiveReaction(true);
    setTimeout(() => setActiveReaction(null), 5500);
    await supabase.from('profiles').update({ genesis: newGenesis }).eq('id', session.user.id);
  };

  const handleSendQuestion = async () => {
     if(!question.trim()) return;
     // ENVIAMOS LA PREGUNTA COMO UN ECO ESPECIAL (TIPO PREGUNTA)
     const { error } = await supabase.from('bro_echos').insert([{
         target_profile_id: user.id,
         author_alias: session.user.user_metadata.alias || 'Anónimo',
         text: `❓ PREGUNTA: ${question.toUpperCase()}`,
         is_creator: false
     }]);
     if (!error) {
         alert("Pregunta enviada al buzón del creador.");
         setQuestion("");
     }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black overflow-hidden flex items-center justify-center font-mono">
        
        {/* VIDEO DE FONDO NATURAL (SIN CAPAS NEGRAS) */}
        <video src={backgroundVideo} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />

        {/* ENVIO: GEMMA DE ENERGIA REMOLINO*/}
      {activeReaction && (
    <>
      <style>{energyStyles}</style>

      {(() => {
          const colors = [
              { name: "azul", primary: "#00127A", secondary: "#006AED", glow: "rgba(59,130,246,0.6)" },
              { name: "fucsia", primary: "#FF007D", secondary: "#f472b6", glow: "rgba(236,72,153,0.6)" },
              { name: "esmeralda", primary: "#00FF48", secondary: "#00FFF2", glow: "rgba(16,185,129,0.6)" },
              { name: "violeta", primary: "#4D00FA", secondary: "#7C4FFF", glow: "rgba(139,92,246,0.6)" },
              { name: "amarillo", primary: "#facc15", secondary: "#FFFF00", glow: "rgba(250,204,21,0.6)" },
              { name: "rojo", primary: "#CF0000", secondary: "#F70C0C", glow: "rgba(239,68,68,0.6)" },
              { name: "cyan", primary: "#00E1FF", secondary: "#61C8FF", glow: "rgba(6,182,212,0.6)" }
          ];
          
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          
          return (
              /* CAMBIO CLAVE: Posición inicial desde abajo-derecha */
              <div className="fixed bottom-4 right-[15%] z-[100] pointer-events-none animate-vortex">
                  <div className="relative flex flex-col items-center" style={{ mixBlendMode: 'screen' }}>
                      
                      {/* NÚCLEO DEL REMOLINO */}
                      <div className="relative w-36 h-36 flex items-center justify-center">
                          
                          {/* 1. AURA EXTERIOR GIRATORIA */}
                          <div 
                              className="absolute w-48 h-48 rounded-full blur-[40px] opacity-60 animate-energy-pulse"
                              style={{ background: randomColor.glow }}
                          ></div>
                          
                          {/* 2. REMOLINO PRINCIPAL */}
                          <div className="absolute w-40 h-40 animate-spin-vortex">
                              <div 
                                  className="w-full h-full rounded-full opacity-90"
                                  style={{
                                      background: `conic-gradient(from 0deg, 
                                          ${randomColor.primary}, 
                                          ${randomColor.secondary}, 
                                          transparent 40%, 
                                          ${randomColor.primary} 60%, 
                                          transparent 80%, 
                                          ${randomColor.secondary})`,
                                      filter: 'blur(4px)'
                                  }}
                              ></div>
                          </div>

                          {/* 3. REMOLINO SECUNDARIO */}
                          <div className="absolute w-32 h-32 animate-spiral-counter">
                              <div 
                                  className="w-full h-full rounded-full opacity-90"
                                  style={{
                                      background: `conic-gradient(from 180deg, 
                                          transparent, 
                                          ${randomColor.secondary} 30%, 
                                          transparent 50%, 
                                          ${randomColor.primary} 70%, 
                                          transparent)`,
                                      filter: 'blur(3px)'
                                  }}
                              ></div>
                          </div>

                          {/* 4. ANILLO DE ENERGÍA */}
                          <div 
                              className="absolute w-36 h-36 rounded-full animate-spin-vortex"
                              style={{
                                  border: `4px solid ${randomColor.secondary}`,
                                  opacity: 0.7,
                                  filter: 'blur(1px)',
                                  animationDuration: '2s'
                              }}
                          ></div>

                          {/* 5. NÚCLEO CENTRAL BRILLANTE */}
                          <div className="relative w-20 h-20 flex items-center justify-center">
                              <div 
                                  className="absolute w-24 h-24 rounded-full blur-[20px] opacity-80 animate-energy-pulse"
                                  style={{ background: randomColor.primary }}
                              ></div>
                              
                              <div 
                                  className="absolute w-16 h-16 rounded-full"
                                  style={{ 
                                      background: `radial-gradient(circle, white 20%, ${randomColor.secondary} 50%, ${randomColor.primary} 100%)`,
                                      boxShadow: `0 0 40px ${randomColor.glow}, 0 0 80px ${randomColor.glow}, 0 0 120px ${randomColor.glow}, 0 0 160px ${randomColor.glow}`
                                  }}
                              ></div>
                              
                              <div className="absolute w-6 h-6 bg-white rounded-full blur-[2px] shadow-[0_0_20px_white,0_0_40px_white]"></div>
                          </div>

                          {/* 6. DESTELLOS RADIALES */}
                          {[0, 1, 2, 3].map((i) => (
                              <div 
                                  key={i}
                                  className="absolute w-2 h-24 animate-flare"
                                  style={{
                                      background: `linear-gradient(to bottom, ${randomColor.secondary}, transparent)`,
                                      transform: `rotate(${i * 90}deg)`,
                                      transformOrigin: 'center',
                                      filter: 'blur(2px)',
                                      animationDelay: `${i * 0.5}s`
                                  }}
                              ></div>
                          ))}

                          {/* 7. PARTÍCULAS ORBITANDO */}
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                              <div 
                                  key={`particle-${i}`}
                                  className="absolute animate-particle-orbit"
                                  style={{ animationDelay: `${i * 0.3}s` }}
                              >
                                  <div 
                                      className="w-2 h-2 rounded-full blur-[1px]"
                                      style={{ background: i % 2 === 0 ? randomColor.primary : randomColor.secondary }}
                                  ></div>
                              </div>
                          ))}

                      </div>

                      {/* PARTÍCULAS FLOTANTES */}
                      <div className="absolute inset-0 w-48 h-48 -left-6 -top-6">
                          {[...Array(10)].map((_, i) => (
                              <div 
                                  key={`float-${i}`}
                                  className="absolute animate-particle-orbit"
                                  style={{
                                      left: `${20 + Math.random() * 60}%`,
                                      top: `${20 + Math.random() * 60}%`,
                                      animationDelay: `${Math.random() * 2}s`,
                                      animationDuration: `${2 + Math.random() * 2}s`
                                  }}
                              >
                                  <div 
                                      className="w-1 h-1 rounded-full blur-[1px]"
                                      style={{ background: randomColor.secondary }}
                                  ></div>
                              </div>
                          ))}
                      </div>

                  </div>
              </div>
          );
      })()}
    </>
)}

       {/* CONTENEDOR RELATIVO PARA AGRUPAR VISOR + FLECHAS */}
<div className="relative z-20 flex items-center justify-center">

    {/* FLECHAS NAVEGACIÓN PC (Pegadas al visor) */}
    {videoPlaylist.length > 1 && (
        <>
            <button 
                onClick={prevVideo} 
                className="hidden md:flex absolute -left-20 lg:-left-24 z-[100] w-14 h-14 items-center justify-center bg-black/60 backdrop-blur-md rounded-full text-white border border-white/10 text-4xl hover:bg-black/80 transition-all shadow-2xl hover:scale-110 active:scale-90"
            >
                ‹
            </button>
            <button 
                onClick={nextVideo} 
                className="hidden md:flex absolute -right-20 lg:-right-24 z-[100] w-14 h-14 items-center justify-center bg-black/60 backdrop-blur-md rounded-full text-white border border-white/10 text-4xl hover:bg-black/80 transition-all shadow-2xl hover:scale-110 active:scale-90"
            >
                ›
            </button>
        </>
    )}

    {/* VISOR VERTICAL (Mantenemos tus clases originales) */}
    <div 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}
        className="relative h-[88vh] aspect-[9/16] rounded-[3.5rem] border-[3px] border-[#FFFDD0]/30 shadow-[0_0_40px_rgba(255,253,208,0.15)] flex flex-col overflow-hidden bg-black"
    >
        <video 
            ref={videoRef}
            key={currentIndex} 
            src={getCleanUrl(videoPlaylist[currentIndex])} 
            autoPlay loop playsInline muted={isMuted}
            className="absolute inset-0 w-full h-full object-cover animate-fadeIn" 
            onTimeUpdate={() => setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)}
        />
        
            {/* INDICADOR DE CANAL (Sutil arriba) */}
            {videoPlaylist.length > 1 && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
                    <span className="bg-black/60 backdrop-blur-xl px-3 py-1 rounded-full border border-white/10 text-[8px] text-white font-black tracking-[0.2em] uppercase">
                        SINTONÍA 0{currentIndex + 1}
                    </span>
                </div>
            )}
            {/* RESPUESTA DEL CREADOR (BUCLE) - Flota sobre el video */}
            <div className="absolute top-32 left-0 w-full px-6 z-30 pointer-events-none">
                <div className="animate-spirit">
                    <p className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-[11px] text-[#FFFDD0] italic text-center shadow-xl">
                        "{user.creator_loop_reply || "Hola! Deja tu pregunta en la Bitácora..."}"
                    </p>
                    <p className="text-[7px] text-center mt-1 opacity-50 uppercase font-black text-white">Mensaje del Creador</p>
                </div>
            </div>

            {/* HUD SUPERIOR */}
            <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-center">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                    <span className="text-cyan-400 text-[10px]">💠</span>
                    <span className="text-white font-black text-[10px]">{balances.genesis}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsMuted(!isMuted)} className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 text-xs">{isMuted ? '🔇' : '🔊'}</button>
                    <button onClick={onClose} className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 text-xs">✕</button>
                </div>
            </div>

            {/* BARRA PROGRESO CREMA */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-50">
                <div className="h-full bg-[#FFFDD0]/60 shadow-[0_0_10px_white]" style={{ width: `${progress}%` }}></div>
            </div>

            {/* TERMINAL GLASS (SLIDE UP) */}
            <div className={`absolute bottom-0 left-0 w-full bg-black/85 backdrop-blur-3xl border-t border-white/10 transition-all duration-700 z-40 ${activeTab ? 'h-[65%]' : 'h-24'}`}>
                <div className="flex h-24 items-center px-1">
    {/* 1. BITÁCORA */}
    <button onClick={() => setActiveTab(activeTab === 'log' ? null : 'log')} className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'log' ? 'text-white' : 'text-white/30'}`}>
        <span className="text-xl">💬</span>
        <span className="text-[7px] font-black uppercase">Preguntar</span>
    </button>

    {/* 2. MOSTRADOR */}
    <button onClick={() => setActiveTab(activeTab === 'prod' ? null : 'prod')} className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'prod' ? 'text-cyan-400' : 'text-white/30'}`}>
        <span className="text-xl">🖼️</span>
        <span className="text-[7px] font-black uppercase">Producto</span>
    </button>

    {/* 3. EDITORIAL (NUEVO) */}
    <button 
    onClick={() => onOpenLog({ 
        id: user.id, // <--- IMPORTANTE: Enviamos el ID del autor
        title: user.editorial_title || "Sin Título", 
        author: user.alias || "Anónimo", 
        content: user.editorial_content || "..." 
    })}
    className="flex-1 flex flex-col items-center gap-1 text-fuchsia-400"
>
    <span className="text-xl">🖋️</span>
    <span className="text-[7px] font-black uppercase">Editorial</span>
</button>
  
    {/* 4. TIENDA */}
    <button onClick={() => window.open(user.product_url, '_blank')} className="flex-1 flex flex-col items-center gap-1 text-yellow-500">
        <span className="text-xl">🛒</span>
        <span className="text-[7px] font-black uppercase">Tienda</span>
    </button>
</div>
                <div className="px-6 pb-6 h-[calc(100%-6rem)] overflow-y-auto custom-scrollbar">
                    {activeTab === 'log' && (
                        <div className="animate-fadeIn space-y-4">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-gray-300 text-[11px] leading-relaxed italic">"{user.blog_text || "El creador está en directo..."}"</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-2xl border border-white/10">
                                <p className="text-[9px] text-gray-500 font-black mb-2 uppercase">Enviar Pregunta Privada</p>
                                <div className="flex gap-2">
                                    <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="¿Tienes alguna duda?" className="flex-1 bg-transparent border-b border-white/10 text-xs text-white outline-none" />
                                    <button onClick={handleSendQuestion} className="text-fuchsia-400 text-[9px] font-black uppercase">Preguntar</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'prod' && (
                        <div className="animate-fadeIn h-full flex items-center justify-center p-2">
                            {user.showcase_url ? <img src={user.showcase_url} className="max-h-full w-full object-contain rounded-xl shadow-2xl" /> : <p className="text-gray-600 text-[10px]">Sin imagen...</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* BOTÓN HALO (Solo visible si terminal cerrada) */}
            {!activeTab && (
                <button onClick={handleSendHalo} className="absolute right-4 bottom-28 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-xl z-50 transition-transform active:scale-90">⚪</button>
            )}
        </div>

        <style>{`
            @keyframes spirit { 0% { opacity:0; transform:translateY(10px); } 10% { opacity:1; } 90% { opacity:1; } 100% { opacity:0; transform:translateY(-20px); } }
            .animate-spirit { animation: spirit 6s infinite ease-in-out; }
            @keyframes glowSwim { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 15% { opacity: 1; scale: 1; } 100% { transform: translateY(-115vh) scale(3); opacity: 0; } }
            .animate-glowSwim { animation: glowSwim 5.5s ease-in-out forwards; }
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        `}</style>
    </div>
    </div>
  );
};

export default HoloProjector;