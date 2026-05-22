import React, { useEffect, useRef, useState } from 'react';

const BroLives3D = ({ playingCreator, onToggleAudio }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- FUNCIÓN PARA ARREGLAR DROPBOX ---
  const getCleanAudioUrl = (url) => {
    if (!url) return null;
    let clean = url.trim();
    if (clean.includes('dropbox.com')) {
        clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                     .replace('dropbox.com', 'dl.dropboxusercontent.com')
                     .replace('?dl=0', '')
                     .replace('&dl=0', '');
    }
    return clean;
  };

  useEffect(() => {
    if (playingCreator) {
        const rawUrl = playingCreator.audio_file || playingCreator.audioFile;
        const playUrl = getCleanAudioUrl(rawUrl);

        if (playUrl && audioRef.current) {
            audioRef.current.src = playUrl;
            audioRef.current.load();
            
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(error => {
                        console.error("Error reproduciendo audio:", error);
                        setIsPlaying(false);
                    });
            }
        }
    }
  }, [playingCreator]);

  useEffect(() => {
    if (!playingCreator) {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }
  }, [playingCreator]);

  const avatarImage = playingCreator?.img 
    || playingCreator?.avatar_url 
    || playingCreator?.banner_url
    || playingCreator?.card_banner_url
    || 'https://ui-avatars.com/api/?name=Anon&background=000&color=a3e635&size=150';
    
  return (
    <div className="relative flex flex-col items-center justify-center p-12 pointer-events-auto translate-x-8">
        {/* INYECCIÓN DE ESTILOS CSS 3D PERSONALIZADOS */}
        <style>{`
          @keyframes spinPrism {
            0% {
              transform: rotateX(-12deg) rotateY(0deg);
            }
            100% {
              transform: rotateX(-12deg) rotateY(360deg);
            }
          }
          .animate-prism-3d {
            animation: spinPrism 15s linear infinite;
          }
          .animate-prism-3d:hover {
            animation-play-state: paused;
          }
          .glow-bioluminiscent {
            box-shadow: 0 0 30px rgba(163, 230, 53, 0.35), inset 0 0 15px rgba(255, 255, 255, 0.15);
          }
          .glow-bioluminiscent-active {
            box-shadow: 0 0 50px rgba(163, 230, 53, 0.6), inset 0 0 25px rgba(163, 230, 53, 0.2);
          }
        `}</style>

        {/* AUDIO OCULTO */}
        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

        {/* CONTENEDOR CON PERSPECTIVA HOLOGRÁFICA */}
        <div className="w-64 h-96 flex items-center justify-center" style={{ perspective: '1200px' }}>
            
            {/* EL PRISMA 3D GIRATORIO (Ancho: 176px (w-44), Alto: 288px (h-72)) */}
            <div 
                onClick={() => {
                    if (isPlaying) { 
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        setIsPlaying(false); 
                    } else { 
                        audioRef.current.play().catch(e => console.log(e)); 
                        setIsPlaying(true); 
                    }
                }} 
                className="relative w-44 h-72 animate-prism-3d cursor-pointer transition-transform duration-500 hover:scale-105"
                style={{ transformStyle: 'preserve-3d' }}
            >
                
                {/* 1. CARA FRONTAL (translateZ = ancho/2 = 88px) */}
                <div 
                    className={`absolute inset-0 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl flex flex-col items-center p-4 justify-between transition-all duration-500 ${
                      isPlaying ? 'border-lime-400/70 glow-bioluminiscent-active' : 'glow-bioluminiscent'
                    }`}
                    style={{ transform: 'rotateY(0deg) translateZ(88px)', backfaceVisibility: 'hidden' }}
                >
                    {/* Destello de luz bioluminiscente interno */}
                    {isPlaying && (
                      <div className="absolute -inset-4 bg-gradient-to-br from-lime-400/10 to-transparent blur-lg rounded-full animate-pulse pointer-events-none" />
                    )}

                    {/* Foto de Perfil */}
                    <div className={`w-24 h-24 rounded-full border-2 p-1 z-10 transition-all duration-500 bg-white/5 ${
                        isPlaying ? 'border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.5)] scale-105' : 'border-white/20 grayscale'
                    }`}>
                        <img src={avatarImage} className="w-full h-full rounded-full object-cover" alt="Artist"/>
                    </div>
                    
                    {/* Textos */}
                    <div className="text-center w-full z-10 my-2">
                        <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${isPlaying ? 'text-lime-400' : 'text-white/40'}`}>
                            {isPlaying ? 'ON AIR' : 'PAUSED'}
                        </p>
                        <p className="text-white font-black text-[11px] leading-tight line-clamp-2 uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                            {(playingCreator && (playingCreator.alias || playingCreator.name)) || 'ANON'}
                        </p>
                    </div>

                    {/* Espectro de Audio Bioluminiscente */}
                    {isPlaying ? (
                        <div className="flex gap-1 items-end h-8 z-10 px-1 pb-1">
                            <div className="w-1 bg-lime-400 rounded-full animate-[bounce_0.5s_infinite] shadow-[0_0_8px_#a3e635] h-3"></div>
                            <div className="w-1 bg-yellow-300 rounded-full animate-[bounce_0.8s_infinite_100ms] shadow-[0_0_8px_#fde047] h-5"></div>
                            <div className="w-1 bg-lime-300 rounded-full animate-[bounce_0.6s_infinite_200ms] shadow-[0_0_8px_#bef264] h-7"></div>
                            <div className="w-1 bg-yellow-400 rounded-full animate-[bounce_0.7s_infinite_150ms] shadow-[0_0_8px_#facc15] h-4"></div>
                            <div className="w-1 bg-lime-400 rounded-full animate-[bounce_0.4s_infinite_50ms] shadow-[0_0_8px_#a3e635] h-6"></div>
                        </div>
                    ) : (
                        <div className="flex gap-1 items-end h-2 z-10 opacity-30">
                            <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                            <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                            <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                        </div>
                    )}
                </div>

                {/* 2. CARA DERECHA (rotateY(90deg) translateZ = 88px) */}
                <div 
                    className={`absolute inset-0 bg-white/8 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-500 ${
                      isPlaying ? 'border-lime-400/40' : ''
                    }`}
                    style={{ transform: 'rotateY(90deg) translateZ(88px)', backfaceVisibility: 'hidden' }}
                >
                    <span className={`text-[10px] font-mono tracking-[0.3em] font-extrabold uppercase -rotate-90 origin-center whitespace-nowrap transition-colors duration-500 ${
                        isPlaying ? 'text-lime-300 drop-shadow-[0_0_8px_rgba(163,230,53,0.6)]' : 'text-white/30'
                    }`}>
                        LIVE SHOW
                    </span>
                </div>

                {/* 3. CARA TRASERA (rotateY(180deg) translateZ = 88px) */}
                <div 
                    className={`absolute inset-0 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-500 ${
                      isPlaying ? 'border-lime-400/50' : ''
                    }`}
                    style={{ transform: 'rotateY(180deg) translateZ(88px)', backfaceVisibility: 'hidden' }}
                >
                    <div className="flex flex-col items-center gap-4">
                        {/* Holograma circular en la cara trasera */}
                        <div className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center ${
                            isPlaying ? 'border-lime-400/50 animate-spin-slow' : 'border-white/20'
                        }`}>
                            <span className="text-white/40 text-xs">★</span>
                        </div>
                        <span className="text-[9px] font-mono text-white/50 tracking-[0.2em] uppercase">BRO-CAST</span>
                    </div>
                </div>

                {/* 4. CARA IZQUIERDA (rotateY(270deg) translateZ = 88px) */}
                <div 
                    className={`absolute inset-0 bg-white/8 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-500 ${
                      isPlaying ? 'border-lime-400/40' : ''
                    }`}
                    style={{ transform: 'rotateY(270deg) translateZ(88px)', backfaceVisibility: 'hidden' }}
                >
                    <span className={`text-[10px] font-mono tracking-[0.3em] font-extrabold uppercase rotate-90 origin-center whitespace-nowrap transition-colors duration-500 ${
                        isPlaying ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'text-white/30'
                    }`}>
                        TUNED IN
                    </span>
                </div>

                {/* 5. TAPA SUPERIOR (Gira en X, se traslada en Y la mitad de la altura = 144px) */}
                <div 
                    className="absolute bg-white/5 backdrop-blur-sm border border-white/20 transition-all duration-500"
                    style={{ 
                        width: '176px', // Debe coincidir con el ancho del prisma (depth)
                        height: '176px', 
                        top: 0,
                        left: 0,
                        transform: 'rotateX(90deg) translateZ(88px)', // Ajustado para centrarse perfectamente
                        borderRadius: '24px'
                    }}
                />

                {/* 6. TAPA INFERIOR (Gira en X, se traslada hacia abajo en Y) */}
                <div 
                    className="absolute bg-white/5 backdrop-blur-sm border border-white/20 transition-all duration-500"
                    style={{ 
                        width: '176px', 
                        height: '176px', 
                        bottom: 0,
                        left: 0,
                        transform: 'rotateX(-90deg) translateZ(200px)', // Desplazado al fondo de la columna de 288px
                        borderRadius: '24px',
                        boxShadow: isPlaying ? '0 0 30px rgba(163,230,53,0.2)' : 'none'
                    }}
                />

            </div>
        </div>
    </div>
  );
};

export default BroLives3D;