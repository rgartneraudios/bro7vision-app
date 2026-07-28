import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { RADIO_CHANNELS_DB } from '../data/RadioChannels';

const BroTuner = forwardRef(function BroTuner(props, ref) {
  const [activeChannel, setActiveChannel] = useState(null);
  const [volume, setVolume]               = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const audioRef = useRef(null);

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
    const ch = RADIO_CHANNELS_DB.find(c => c.id === id);
    return ch ? formatDropboxUrl(ch.src) : '';
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    if (activeChannel) {
      const src = getAudioSrc(activeChannel);
      if (audioRef.current.getAttribute('src') !== src) {
        audioRef.current.src = src;
        audioRef.current.play().catch(e => console.error('Error Audio:', e));
      } else {
        audioRef.current.play().catch(e => console.error('Error Resume:', e));
      }
    } else {
      audioRef.current.pause();
    }
  }, [activeChannel]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
    };
  }, []);

  const toggleChannel = (id) => {
    setActiveChannel(prev => (prev === id ? null : id));
  };

  const activeData = activeChannel
    ? RADIO_CHANNELS_DB.find(c => c.id === activeChannel)
    : null;

  return (
    <div className={`w-full flex flex-col bg-black/90 border rounded-2xl overflow-hidden transition-all duration-700
      ${activeData ? `${activeData.border} ${activeData.shadow}` : 'border-white/10'}`}>

      <style>{`
        @keyframes eq1 { 0%,100%{height:5px}  50%{height:16px} }
        @keyframes eq2 { 0%,100%{height:12px} 50%{height:4px}  }
        @keyframes eq3 { 0%,100%{height:8px}  33%{height:18px} 66%{height:3px} }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(400%);  }
        }
      `}</style>

      <audio ref={audioRef} loop preload="none" crossOrigin="anonymous" />

      {/* HEADER */}
      <div className="relative px-4 py-3 border-b border-white/10 bg-black/60 overflow-hidden">
        <div
          className="absolute inset-x-0 h-6 bg-white/[0.03] pointer-events-none"
          style={{ animation: 'scanline 4s linear infinite' }}
        />
        <div className="flex justify-between items-center relative z-10">
          <div>
            <span className="text-[7px] font-black tracking-[0.4em] text-cyan-500 block">
              BRO-TUNER_OS
            </span>
            <span className={`text-[10px] font-mono font-bold uppercase ${activeData ? activeData.color : 'text-gray-600'}`}>
              {activeData ? activeData.name : 'SYSTEM_IDLE'}
            </span>
          </div>
          {activeData && (
            <div className="flex items-end gap-[3px] h-5">
              <div className={`w-[3px] rounded-full ${activeData.bgColor}`} style={{ animation: 'eq1 0.7s ease-in-out infinite' }} />
              <div className={`w-[3px] rounded-full ${activeData.bgColor}`} style={{ animation: 'eq2 0.9s ease-in-out infinite' }} />
              <div className={`w-[3px] rounded-full ${activeData.bgColor}`} style={{ animation: 'eq3 0.6s ease-in-out infinite' }} />
            </div>
          )}
        </div>
      </div>

      {/* 3 CANALES */}
      <div className="flex flex-col gap-2 p-3">
        {RADIO_CHANNELS_DB.map((ch) => {
          const isActive = activeChannel === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => toggleChannel(ch.id)}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition-all duration-500 text-left overflow-hidden
                ${isActive
                  ? `${ch.border} ${ch.bgActive} ${ch.shadow}`
                  : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
            >
              {/* glow interior */}
              {isActive && (
                <div className={`absolute inset-0 ${ch.bgColor} opacity-10 blur-xl pointer-events-none`} />
              )}

              {ch.icon.startsWith('/') || ch.icon.startsWith('http')
                ? <img src={ch.icon} alt={ch.name} className={`w-8 h-8 object-contain relative z-10 transition-all duration-300 ${isActive ? 'scale-110 opacity-100' : 'opacity-30'}`} />
                : <span className={`text-2xl relative z-10 transition-all duration-300 ${isActive ? 'scale-110 opacity-100' : 'opacity-30'}`}>{ch.icon}</span>
              }

              <div className="flex-1 relative z-10">
                <div className={`text-xs font-black uppercase tracking-[0.25em] transition-colors duration-300
                  ${isActive ? ch.color : 'text-white/40'}`}>
                  {ch.name}
                </div>
                <div className={`text-[9px] uppercase tracking-widest mt-0.5 transition-colors duration-300
                  ${isActive ? 'text-white/50' : 'text-white/20'}`}>
                  {ch.genre}
                </div>
              </div>

              {/* equalizer lateral derecho */}
              {isActive && (
                <div className="flex items-end gap-[3px] h-6 shrink-0 relative z-10">
                  <div className={`w-[3px] rounded-full ${ch.bgColor}`} style={{ animation: 'eq1 0.8s ease-in-out infinite' }} />
                  <div className={`w-[3px] rounded-full ${ch.bgColor}`} style={{ animation: 'eq2 1.1s ease-in-out infinite' }} />
                  <div className={`w-[3px] rounded-full ${ch.bgColor}`} style={{ animation: 'eq3 0.7s ease-in-out infinite' }} />
                  <div className={`w-[3px] rounded-full ${ch.bgColor}`} style={{ animation: 'eq1 0.95s ease-in-out infinite 0.2s' }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* PROGRESO */}
      {activeData && duration > 0 && (
        <div className="px-4 pb-1">
          <input
            type="range"
            min="0"
            max={duration}
            step="0.5"
            value={currentTime}
            onChange={(e) => {
              const t = parseFloat(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = t;
              setCurrentTime(t);
            }}
            className={`w-full h-1 bg-gray-800 rounded-full appearance-none cursor-pointer ${activeData.accent}`}
          />
          <div className="flex justify-between mt-1">
            <span className={`text-[8px] font-mono ${activeData.color}`}>
              {new Date(currentTime * 1000).toISOString().substr(14, 5)}
            </span>
            <span className="text-[8px] font-mono text-white/20">
              {new Date(duration * 1000).toISOString().substr(14, 5)}
            </span>
          </div>
        </div>
      )}

      {/* VOLUMEN */}
      <div className="px-4 py-3 bg-black/60 border-t border-white/10 flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[7px] text-gray-600 font-black tracking-widest">GAIN</span>
          <span className={`text-[8px] font-mono ${activeData ? activeData.color : 'text-cyan-500'}`}>
            {(volume * 100).toFixed(0)}
          </span>
        </div>
        <input
          type="range" min="0" max="1" step="0.1" value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className={`flex-1 h-1 bg-gray-800 rounded-full appearance-none cursor-pointer
            ${activeData ? activeData.accent : 'accent-cyan-400'}`}
        />
      </div>
    </div>
  );
});

export default BroTuner;