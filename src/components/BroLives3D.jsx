// src/components/BroLives3D.jsx
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

  const avatarImage = (playingCreator && (playingCreator.avatar_url || playingCreator.img)) 
    ? (playingCreator.avatar_url || playingCreator.img) 
    : 'https://placehold.co/150x150/000000/FFFFFF/png?text=Anon';

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };
    
  return (
    <div className="relative flex flex-col items-center justify-center p-6 pointer-events-auto">        
        {/* AUDIO OCULTO */}
        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

        {/* CONTENEDOR 3D GIRATORIO - SIEMPRE VISIBLE */}
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
            className="relative w-48 h-80 animate-spin-slow-3d cursor-pointer group hover:scale-110 transition-transform"
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* CARA FRONTAL DEL PRISMA */}
            <div 
                className={`absolute inset-0 bg-black/90 border-2 ${isPlaying ? 'border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.6)]' : 'border-white/20'} rounded-xl flex flex-col items-center p-3 overflow-hidden`}
                style={{ transform: 'translateZ(50px)' }}
            >
                {/* Visualizer de fondo (Efecto de ruido visual) */}
                {isPlaying && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>}
                
                {/* Imagen del Artista / Creador */}
                <div className={`w-28 h-28 rounded-full border-2 p-0.5 z-10 bg-black transition-all ${isPlaying ? 'border-cyan-500 animate-pulse' : 'border-gray-600 grayscale'}`}>
                    <img src={avatarImage} className="w-full h-full rounded-full object-cover" alt="Artist"/>
                </div>
                
                {/* Textos Informativos */}
                <div className="mt-4 text-center w-full z-10">
                    <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isPlaying ? 'text-cyan-400' : 'text-gray-500'}`}>
                        {isPlaying ? 'ON AIR' : 'PAUSED'}
                    </p>
                    <p className="text-white font-bold text-[11px] leading-tight line-clamp-2 uppercase">
                        {(playingCreator && (playingCreator.alias || playingCreator.name)) || 'ANON'}
                    </p>
                </div>

                {/* Ecualizador animado (Solo se mueve si está sonando) */}
                {isPlaying && (
                    <div className="mt-auto flex gap-1 items-end h-6 z-10">
                        <div className="w-1 bg-cyan-500 animate-[bounce_0.4s_infinite]"></div>
                        <div className="w-1 bg-cyan-500 animate-[bounce_0.6s_infinite]"></div>
                        <div className="w-1 bg-cyan-500 animate-[bounce_0.3s_infinite]"></div>
                    </div>
                )}
            </div>

            {/* CARA TRASERA DEL PRISMA */}
            <div 
                className="absolute inset-0 bg-cyan-950/30 border border-cyan-500/30 rounded-xl flex items-center justify-center"
                style={{ transform: 'rotateY(180deg) translateZ(50px)' }}
            >
                <span className="text-[9px] font-mono text-cyan-400 -rotate-90 tracking-widest">BRO-CAST</span>
            </div>

            {/* TAPAS DEL PRISMA (Dan el volumen de objeto sólido) */}
            <div className="absolute top-0 w-48 h-28 bg-cyan-950/40 transform rotate-x-90 -translate-z-[50px]"></div>
            <div className="absolute bottom-0 w-48 h-28 bg-cyan-950/40 transform -rotate-x-90 -translate-z-[50px] shadow-[0_0_30px_rgba(6,182,212,0.3)]"></div>
        </div>
    </div>
  );
};

export default BroLives3D;