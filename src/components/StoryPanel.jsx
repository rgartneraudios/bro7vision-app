// src/components/StoryPanel.jsx
import React, { useRef, useState, useEffect } from 'react';

export default function StoryPanel({ titulo, texto, audioUrl, accentColor = '#a855f7', separator = '|', onClose }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const parrafos = texto ? texto.split(separator).map(p => p.trim()).filter(Boolean) : [];

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
    <div className="fixed inset-0 z-[60] flex items-start justify-center pointer-events-none"
         style={{ background: 'rgba(0,0,0,0.12)', paddingTop: '2%' }}>
      <style>{`
        .story-panel-scroll::-webkit-scrollbar { width: 6px; }
        .story-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .story-panel-scroll::-webkit-scrollbar-thumb {
          background: ${accentColor}88;
          border-radius: 3px;
          box-shadow: 0 0 8px ${accentColor}44;
        }
        .story-panel-scroll::-webkit-scrollbar-thumb:hover {
          background: ${accentColor};
          box-shadow: 0 0 12px ${accentColor}66;
        }
      `}</style>
      <div className="pointer-events-auto" style={{
        background: 'rgba(10,10,20,0.6)',
        border: '1.5px solid #a855f7',
        borderRadius: '1.5rem',
        boxShadow: '0 0 30px rgba(168,85,247,0.35)',
        padding: '2rem',
        maxWidth: '640px',
        width: '90%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        fontFamily: 'Georgia, serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla"',
        backdropFilter: 'blur(6px)',
      }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ color: accentColor, fontWeight:900, fontSize:'1.35rem',
                       letterSpacing:'0.1em', textTransform:'uppercase', margin:0 }}>
            {titulo}
          </h2>
          <button onClick={onClose}
            style={{ color:'#fff', background:'none', border:'none',
                     fontSize:'1.5rem', cursor:'pointer', opacity:0.6 }}>✕</button>
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
        <div className="story-panel-scroll" style={{ overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:'1rem',
          scrollbarWidth:'thin', scrollbarColor:`${accentColor}66 transparent` }}>
          {parrafos.map((p, i) => (
            <p key={i} style={{ color:'rgba(255,255,255,0.88)', fontSize:'1.3rem',
                                lineHeight:1.8, margin:0, fontFamily:'Georgia, serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla"' }}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}