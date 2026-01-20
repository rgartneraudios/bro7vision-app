import React from 'react';

const BroLives = ({ playingCreator, isAudioPlaying, onToggleAudio }) => {
  if (!playingCreator) return null;

  return (
    // CAMBIO: 'hidden md:block' para que solo se vea en PC
    <div className="hidden md:block absolute right-20 top-[45%] pointer-events-auto z-[80] perspective-[1000px]">        {/* CONTENEDOR 3D QUE GIRA */}
        <div 
            onClick={() => onToggleAudio(playingCreator)} 
            className="relative w-28 h-48 animate-spin-slow-3d cursor-pointer group hover:scale-110 transition-transform"
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* CARA FRONTAL (El Player) */}
            <div 
                className={`absolute inset-0 bg-black/90 border-2 ${isAudioPlaying ? 'border-red-500 shadow-[0_0_40px_rgba(220,38,38,0.6)]' : 'border-white/20'} rounded-xl flex flex-col items-center p-3 overflow-hidden`}
                style={{ transform: 'translateZ(30px)' }}
            >
                {/* Visualizer Fondo */}
                {isAudioPlaying && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>}
                
                <div className={`w-16 h-16 rounded-full border-2 p-0.5 z-10 bg-black ${isAudioPlaying ? 'border-red-500 animate-pulse' : 'border-gray-600 grayscale'}`}>
                    <img src={playingCreator.img} className="w-full h-full rounded-full object-cover" alt="Artist"/>
                </div>
                
                <div className="mt-4 text-center w-full z-10">
                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mb-1">{isAudioPlaying ? 'ON AIR' : 'PAUSED'}</p>
                    <p className="text-white font-bold text-xs leading-tight line-clamp-2">{playingCreator.name}</p>
                </div>

                {/* EQ Animado */}
                {isAudioPlaying && (
                    <div className="mt-auto flex gap-1 items-end h-6">
                        <div className="w-1.5 bg-red-500 animate-[bounce_0.4s_infinite]"></div>
                        <div className="w-1.5 bg-red-500 animate-[bounce_0.6s_infinite]"></div>
                        <div className="w-1.5 bg-red-500 animate-[bounce_0.3s_infinite]"></div>
                    </div>
                )}
            </div>

            {/* CARA TRASERA (Info Técnica) */}
            <div 
                className="absolute inset-0 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center justify-center"
                style={{ transform: 'rotateY(180deg) translateZ(30px)' }}
            >
                <span className="text-[10px] font-mono text-red-400 -rotate-90 tracking-widest">BRO-CAST</span>
            </div>

            {/* TAPAS (Decoración 3D) */}
            <div className="absolute top-0 w-28 h-16 bg-red-900/40 transform rotate-x-90 -translate-z-[30px]"></div>
            <div className="absolute bottom-0 w-28 h-16 bg-red-900/40 transform -rotate-x-90 -translate-z-[30px] shadow-[0_0_30px_red]"></div>
        </div>
    </div>
  );
};

export default BroLives;