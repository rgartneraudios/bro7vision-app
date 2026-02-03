import React, { useState, useRef, useEffect } from 'react';
import { RADIO_CHANNELS_DB } from '../data/RadioChannels'; 

const BroTuner = () => {  
  const [activeChannel, setActiveChannel] = useState(null); 
  const [volume, setVolume] = useState(0.5);
  const [isOpen, setIsOpen] = useState(false); // Cerrado por defecto en PC y Móvil
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

      {/* CONTENEDOR RELATIVO PARA QUE EL POPUP SALGA ENCIMA */}
      <div className="relative flex flex-col items-start justify-end">
        
        {/* EL REPRODUCTOR (POPUP HACIA ARRIBA) */}
        <div className={`
            absolute bottom-12 left-0 mb-2
            w-64 h-80 p-4 rounded-2xl flex flex-col gap-3
            bg-[#050505] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,1)]
            transition-all duration-300 origin-bottom-left z-[200]
            ${activeColor}
            ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'}
        `}>
            {/* CABECERA */}
            <div className="bg-gradient-to-b from-[#0f172a]/90 to-black rounded-lg p-2 border border-cyan-500/20 shadow-inner relative overflow-hidden shrink-0">
                <div className="flex justify-between items-center mb-1 relative z-10">
                    <span className="text-[9px] font-black text-cyan-500 tracking-[0.2em]">BRO-TUNER v2.0</span>
                    {activeChannel && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_green]"></div>}
                </div>
                {activeChannel ? (
                    <div className="overflow-hidden whitespace-nowrap relative z-10">
                         <p className={`text-xs font-bold font-mono animate-pulse ${activeData.color}`}>{activeData.name}</p>
                    </div>
                ) : (
                    <div className="relative z-10"><p className="text-xs font-mono text-gray-600">SYSTEM SILENT</p></div>
                )}
            </div>

            {/* LISTA */}
            <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-0 bg-black/50 rounded-lg p-1">
                {RADIO_CHANNELS_DB.map((channel) => (
                    <button key={channel.id} onClick={() => toggleChannel(channel.id)} className={`group flex items-center gap-3 p-2 rounded-lg transition-all border shrink-0 ${activeChannel === channel.id ? `bg-white/10 ${channel.border}` : 'border-transparent hover:bg-white/5'}`}>
                        <span className="text-sm opacity-80">{channel.icon}</span>
                        <div className="text-left flex-1 overflow-hidden"><p className={`text-[9px] font-bold leading-none ${activeChannel === channel.id ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>{channel.name}</p></div>
                    </button>
                ))}
            </div>
            
            {/* VOLUMEN */}
            <div className="mt-auto pt-2 border-t border-white/10 shrink-0">
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            </div>
        </div>

        {/* BOTÓN PRINCIPAL (SIEMPRE VISIBLE) */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`
                bg-black text-cyan-400 border border-cyan-500/30 
                px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] 
                shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:bg-cyan-950/30 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]
                flex items-center gap-3 transition-all active:scale-95 z-[210]
                ${isOpen ? 'border-cyan-500 bg-cyan-950/50' : ''}
            `}
        >
            <span className="text-lg">{isOpen ? '▼' : '🎧'}</span>
            <span>{isOpen ? 'CLOSE TUNER' : 'SYSTEM AUDIO'}</span>
            {activeChannel && !isOpen && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_lime]"></div>}
        </button>

      </div>
    </>
  );
};

export default BroTuner;