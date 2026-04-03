import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { RADIO_CHANNELS_DB } from '../data/RadioChannels';

const BroTuner = forwardRef(function BroTuner(props, ref) {  
  const [activeChannel, setActiveChannel] = useState(null); 
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  // ── EXPUESTO AL PADRE ──────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    playById: (id) => setActiveChannel(id),
    stop:     ()   => setActiveChannel(null),
  }));
    
  const formatDropboxUrl = (url) => { 
    if (!url) return ''; 
    if (url.includes('dropbox.com')) { 
        return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '?dl=1'); 
    } 
    return url; 
  };

  const getAudioSrc = (id) => { 
    const channel = RADIO_CHANNELS_DB.find(c => c.id === id); 
    return channel ? formatDropboxUrl(channel.src) : ''; 
  }; 
  
  useEffect(() => { 
    if (audioRef.current) { 
        audioRef.current.volume = volume; 
        if (activeChannel) { 
            const source = getAudioSrc(activeChannel); 
            if (audioRef.current.getAttribute('src') !== source) { 
                audioRef.current.src = source; 
                audioRef.current.play().catch(e => console.error("Error Audio:", e)); 
            } else { 
                audioRef.current.play().catch(e => console.error("Error Resume:", e)); 
            } 
        } else { 
            audioRef.current.pause(); 
        } 
    } 
  }, [activeChannel]);
  
  useEffect(() => { if(audioRef.current) audioRef.current.volume = volume; }, [volume]);
  
  const toggleChannel = (id) => { 
    if (activeChannel === id) setActiveChannel(null);
    else setActiveChannel(id); 
  };

  const activeData = activeChannel ? RADIO_CHANNELS_DB.find(c => c.id === activeChannel) : null;

  return (
    <div className={`w-full flex flex-col bg-black/80 border rounded-2xl overflow-hidden transition-all duration-700 ${activeData ? `border-white/60 shadow-[0_0_25px_-5px] ${activeData.border.replace('border-', 'shadow-')}` : 'border-white/10 shadow-none'}`}>
      <audio ref={audioRef} loop preload="none" crossOrigin="anonymous" />

      {/* CABECERA NEÓN */}
      <div className={`px-4 py-3 border-b border-white/10 flex justify-between items-center transition-colors duration-500 ${activeChannel ? 'bg-white/5' : 'bg-transparent'}`}>
          <div className="flex flex-col">
              <span className={`text-[7px] font-black tracking-[0.4em] ${activeChannel ? 'text-cyan-400 opacity-100' : 'text-gray-600'}`}>
                BRO-TUNER_OS
              </span>
              <p className={`text-[11px] font-mono font-bold truncate max-w-[140px] uppercase ${activeData ? activeData.color : 'text-gray-500'}`}>
                {activeChannel ? activeData.name : 'SYSTEM_IDLE'}
              </p>
          </div>
          {activeChannel && (
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px] ${activeData.color.replace('text-', 'bg-').replace('text-', 'shadow-')}`}></div>
          )}
      </div>

      {/* LISTA DE CANALES CON RESPIRO */}
      <div className="p-2 max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 bg-black/40">
          {RADIO_CHANNELS_DB.map((channel) => (
              <button 
                key={channel.id} 
                onClick={() => toggleChannel(channel.id)} 
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all border text-left group ${activeChannel === channel.id ? `bg-white/10 ${channel.border} shadow-[0_0_15px_rgba(255,255,255,0.05)]` : 'border-transparent hover:bg-white/5 text-gray-500 hover:text-gray-300'}`}
              >
                  <span className={`text-base transition-transform group-hover:scale-125 ${activeChannel === channel.id ? 'opacity-100' : 'opacity-40'}`}>
                    {channel.icon}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${activeChannel === channel.id ? 'text-white' : ''}`}>
                    {channel.name}
                  </span>
              </button>
          ))}
      </div>
      
      {/* VOLUMEN NEÓN */}
      <div className="px-4 py-3 bg-black border-t border-white/10 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[7px] text-gray-600 font-black">GAIN</span>
            <span className="text-[8px] text-cyan-500 font-mono">{(volume * 100).toFixed(0)}</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.1" value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))} 
            className="flex-1 h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]" 
          />
      </div>
    </div>
  );

});
export default BroTuner;