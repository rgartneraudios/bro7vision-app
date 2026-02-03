// src/components/BroLives.jsx
import React from 'react';

const BroLives = ({ playingCreator, isAudioPlaying, onToggleAudio }) => {
  if (!playingCreator) return null;

  const avatarImage = playingCreator.avatar_url || playingCreator.img || 'https://placehold.co/150x150/000000/FFFFFF/png?text=Anon';
    
  return (
    <div className="w-full flex flex-col gap-3 pointer-events-auto">
        
        {/* CABECERA DE ESTADO */}
        <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isAudioPlaying ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-gray-600'}`}></div>
                <span className="text-[7px] font-black tracking-[0.2em] text-white/50 uppercase">
                    {isAudioPlaying ? 'Broadcasting' : 'Standby'}
                </span>
            </div>
            {isAudioPlaying && (
                <div className="flex gap-0.5 items-end h-2">
                    <div className="w-0.5 bg-cyan-500 animate-[bounce_0.4s_infinite]"></div>
                    <div className="w-0.5 bg-cyan-500 animate-[bounce_0.6s_infinite]"></div>
                    <div className="w-0.5 bg-cyan-500 animate-[bounce_0.3s_infinite]"></div>
                </div>
            )}
        </div>

        {/* TARJETA DE CONTROL */}
        <div 
            onClick={() => onToggleAudio(playingCreator)} 
            className={`relative w-full p-3 rounded-2xl border transition-all duration-500 cursor-pointer group
                ${isAudioPlaying 
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                    : 'bg-black/40 border-white/5 hover:border-white/20'}`}
        >
            <div className="flex items-center gap-3">
                {/* Mini Avatar */}
                <div className={`relative w-10 h-10 rounded-full border-2 p-0.5 transition-all
                    ${isAudioPlaying ? 'border-cyan-400 rotate-12' : 'border-gray-700 grayscale'}`}>
                    <img src={avatarImage} className="w-full h-full rounded-full object-cover" alt="Artist"/>
                </div>

                {/* Info Texto */}
                <div className="flex-1 min-w-0">
                    <p className={`text-[9px] font-black truncate uppercase tracking-tighter
                        ${isAudioPlaying ? 'text-cyan-400' : 'text-gray-500'}`}>
                        {playingCreator.name || playingCreator.alias}
                    </p>
                    <p className="text-[7px] text-white/40 font-medium uppercase tracking-widest mt-0.5">
                        {isAudioPlaying ? 'Playing Signal' : 'Paused'}
                    </p>
                </div>

                {/* Botón Play/Pause sutil */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border
                    ${isAudioPlaying ? 'border-cyan-400 text-cyan-400' : 'border-white/10 text-white/20'}`}>
                    <span className="text-[10px]">{isAudioPlaying ? 'Ⅱ' : '▶'}</span>
                </div>
            </div>

            {/* Efecto de brillo al pasar el mouse */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    </div>
  );
};

export default BroLives;