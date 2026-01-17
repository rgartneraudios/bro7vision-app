// src/components/BroTuner.jsx (FIX MÓVIL DEFINITIVO)

import React, { useState, useRef, useEffect } from 'react';
import { RADIO_CHANNELS_DB } from '../data/RadioChannels'; 

const BroTuner = () => {  
  const [activeChannel, setActiveChannel] = useState(null); 
  const [volume, setVolume] = useState(0.5);
  const [isOpen, setIsOpen] = useState(false); // Por defecto cerrado en móvil
  const audioRef = useRef(null); 

  const formatDropboxUrl = (url) => { if (!url) return ''; if (url.includes('dropbox.com')) { return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '?dl=1'); } return url; };
  const getAudioSrc = (id) => { const channel = RADIO_CHANNELS_DB.find(c => c.id === id); return channel ? formatDropboxUrl(channel.src) : ''; }; 
  useEffect(() => { if (audioRef.current) { audioRef.current.volume = volume; if (activeChannel) { const source = getAudioSrc(activeChannel); if (audioRef.current.getAttribute('src') !== source) { audioRef.current.src = source; audioRef.current.play().catch(e => console.error("Error Audio:", e)); } else { audioRef.current.play().catch(e => console.error("Error Resume:", e)); } } else { audioRef.current.pause(); } } }, [activeChannel]); 
  useEffect(() => { if(audioRef.current) audioRef.current.volume = volume; }, [volume]);
  const toggleChannel = (id) => { if (activeChannel === id) setActiveChannel(null); else setActiveChannel(id); };
  const activeData = activeChannel ? RADIO_CHANNELS_DB.find(c => c.id === activeChannel) : null;
  const activeColor = activeData ? activeData.border : 'border-white/10';

  return (
    <>
      <audio ref={audioRef} loop preload="none" crossOrigin="anonymous" />

      {/* CONTENEDOR PRINCIPAL */}
      <div className="fixed left-4 bottom-4 z-[150] pointer-events-auto flex flex-col items-start">
        
        {/* BOTÓN TOGGLE (SOLO VISIBLE EN MÓVIL) */}
        {/* Si está abierto dice ▼, si está cerrado dice ▲ RADIO */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`
                md:hidden mb-2 
                bg-black/90 text-cyan-400 border border-cyan-500/50 
                px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest 
                shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-2
                transition-all active:scale-95
            `}
        >
            <span>{isOpen ? '▼ OCULTAR' : '▲ RADIO'}</span>
            {activeChannel && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_lime]"></div>}
        </button>

        {/* EL REPRODUCTOR (CUERPO) */}
        {/* LÓGICA: En móvil depende de 'isOpen'. En PC (md) siempre es 'block' */}
        <div className={`
            relative w-64 h-96 p-4 rounded-2xl flex flex-col gap-3
            bg-black/90 backdrop-blur-xl border-2 transition-all duration-300
            shadow-[0_0_50px_rgba(0,0,0,0.8)]
            ${activeColor}
            ${isOpen ? 'block animate-slideUp' : 'hidden'} md:block
        `}>
            {/* CABECERA */}
            <div className="bg-gradient-to-b from-[#0f172a]/90 to-black rounded-lg p-2 border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-1 relative z-10">
                    <span className="text-[9px] font-black text-cyan-700 tracking-[0.2em] drop-shadow-sm">BRO-TUNER</span>
                    {activeChannel && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_green]"></div>}
                </div>
                {activeChannel ? (
                    <div className="overflow-hidden whitespace-nowrap relative z-10">
                         <p className={`text-xs font-bold font-mono animate-pulse ${activeData.color} drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]`}>{activeData.name}</p>
                         <div className="flex items-center gap-2 mt-1"><span className="text-[8px] font-mono text-green-400 bg-green-900/30 px-1 rounded border border-green-500/30">CC 4.0</span><span className="text-[7px] font-mono text-gray-500 uppercase tracking-wide">OPEN SOURCE</span></div>
                    </div>
                ) : (
                    <div className="relative z-10"><p className="text-xs font-mono text-gray-600">SYSTEM STANDBY</p></div>
                )}
            </div>

            {/* LISTA */}
           <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1 h-48 md:h-64 min-h-0">
                {RADIO_CHANNELS_DB.map((channel) => (
              <button key={channel.id} onClick={() => toggleChannel(channel.id)} className={`group flex items-center gap-3 p-2 rounded-lg transition-all border shrink-0 ${activeChannel === channel.id ? `bg-black/60 ${channel.border} shadow-lg translate-x-1` : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'}`}>
                        <span className="text-sm filter drop-shadow-md">{channel.icon}</span>
                        <div className="text-left flex-1 overflow-hidden"><p className={`text-[10px] font-bold leading-none ${activeChannel === channel.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{channel.name}</p><p className="text-[7px] text-gray-500 truncate">{channel.genre}</p></div>
                    </button>
                ))}
            </div>
            
            
            
            {/* VOLUMEN */}
            <div className="mt-auto pt-2 border-t border-white/10 shrink-0">
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white" />
            </div>
        </div>
      </div>
    </>
  );
};

export default BroTuner;