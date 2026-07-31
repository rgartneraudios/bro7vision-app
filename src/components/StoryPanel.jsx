// src/components/StoryPanel.jsx
import React, { useRef, useState, useEffect } from 'react';

export default function StoryPanel({ titulo, texto, audioUrl, accentColor = '#a855f7', onClose }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const parrafos = texto ? texto.split('☎️').map(p => p.trim()).filter(Boolean) : [];

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else          { audioRef.current.play();  setPlaying(true);  }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
  };

  return (
    <div className="absolute inset-0 z-[110] flex items-center justify-center"
         style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}>
      <div style={{
        background: 'rgba(10,10,20,0.95)',
        border: `1px solid ${accentColor}44`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 40px ${accentColor}33`,
        padding: '2rem',
        maxWidth: '640px',
        width: '90%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ color: accentColor, fontWeight:900, fontSize:'1rem',
                       letterSpacing:'0.1em', textTransform:'uppercase', margin:0 }}>
            {titulo}
          </h2>
          <button onClick={onClose}
            style={{ color:'#fff', background:'none', border:'none',
                     fontSize:'1.2rem', cursor:'pointer', opacity:0.6 }}>✕</button>
        </div>

        {/* Audio player */}
        {audioUrl && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <button onClick={togglePlay}
              style={{ background: accentColor, border:'none', borderRadius:'50%',
                       width:36, height:36, color:'#fff', fontSize:'1rem',
                       cursor:'pointer', flexShrink:0 }}>
              {playing ? '⏸' : '▶'}
            </button>
            <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.15)',
                          borderRadius:2, overflow:'hidden' }}>
              <div style={{ width:`${progress}%`, height:'100%',
                            background: accentColor, transition:'width 0.3s' }} />
            </div>
            <audio ref={audioRef} src={audioUrl}
                   onTimeUpdate={handleTimeUpdate}
                   onEnded={() => setPlaying(false)} />
          </div>
        )}

        {/* Texto */}
        <div style={{ overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:'1rem' }}>
          {parrafos.map((p, i) => (
            <p key={i} style={{ color:'rgba(255,255,255,0.88)', fontSize:'0.9rem',
                                lineHeight:1.7, margin:0 }}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}