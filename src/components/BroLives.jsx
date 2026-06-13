// src/components/BroLives.jsx
import React, { useEffect, useRef, useState } from 'react';

const BroLives = ({ playingCreator, onToggleAudio }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- FUNCIÓN MÁGICA PARA ARREGLAR DROPBOX ---
  const getCleanAudioUrl = (url) => {
    if (!url) return null;
    let clean = url.trim();
    // Convierte www.dropbox.com a dl.dropboxusercontent.com para streaming directo
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
        // Buscamos cualquier variante del nombre del campo
        const rawUrl = playingCreator.audio_url || playingCreator.audio_file || playingCreator.audioFile;
        const playUrl = getCleanAudioUrl(rawUrl);

        if (playUrl && audioRef.current) {
            console.log("Intentando reproducir:", playUrl); // Para depurar en consola
            audioRef.current.src = playUrl;
            audioRef.current.load();
            
            // Promesa de play para evitar errores de navegador
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
    } else {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reiniciar
        }
    }
  }, [playingCreator]);

  if (!playingCreator) return (
      <div className="w-full p-3 rounded-2xl border border-white/5 bg-black/40 opacity-50 text-center">
          <p className="text-[8px] text-gray-500 uppercase">NO SIGNAL</p>
      </div>
  );

  const avatarImage = playingCreator.avatar_url || playingCreator.img || 'https://placehold.co/150x150/000000/FFFFFF/png?text=Anon';
    
  return (
    <div className="w-full flex flex-col gap-3 pointer-events-auto">
        {/* AUDIO OCULTO CON REFERENCIA */}
        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

        <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-gray-600'}`}></div>
                <span className="text-[7px] font-black tracking-[0.2em] text-white/50 uppercase">
                    {isPlaying ? 'ON AIR' : 'PAUSED'}
                </span>
            </div>
            {isPlaying && (
                <div className="flex gap-0.5 items-end h-2">
                    <div className="w-0.5 bg-cyan-500 animate-[bounce_0.4s_infinite]"></div>
                    <div className="w-0.5 bg-cyan-500 animate-[bounce_0.6s_infinite]"></div>
                    <div className="w-0.5 bg-cyan-500 animate-[bounce_0.3s_infinite]"></div>
                </div>
            )}
        </div>

        <div 
            onClick={() => {
                if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); onToggleAudio(); }
                else { audioRef.current.play().catch(e=>console.log(e)); setIsPlaying(true); }
            }} 
            className={`relative w-full p-3 rounded-2xl border transition-all duration-500 cursor-pointer group
                ${isPlaying 
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                    : 'bg-black/40 border-white/5 hover:border-white/20'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`relative w-10 h-10 rounded-full border-2 p-0.5 transition-all
                    ${isPlaying ? 'border-cyan-400 rotate-12' : 'border-gray-700 grayscale'}`}>
                    <img src={avatarImage} className="w-full h-full rounded-full object-cover" alt="Artist"/>
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`text-[9px] font-black truncate uppercase tracking-tighter ${isPlaying ? 'text-cyan-400' : 'text-gray-500'}`}>
                        {playingCreator.alias || playingCreator.name}
                    </p>
                    <p className="text-[7px] text-white/40 font-medium uppercase tracking-widest mt-0.5">
                        {isPlaying ? 'Playing Signal...' : 'Click to Resume'}
                    </p>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center border
                    ${isPlaying ? 'border-cyan-400 text-cyan-400' : 'border-white/10 text-white/20'}`}>
                    <span className="text-[10px]">{isPlaying ? 'Ⅱ' : '▶'}</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BroLives;