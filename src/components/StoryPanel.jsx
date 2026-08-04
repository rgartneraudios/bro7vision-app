import React, { useRef, useState, useEffect } from 'react';

export default function StoryPanel({ titulo, texto, audioUrl, accentColor = '#a855f7', separator = '☎️', onClose }) {
  const audioRef = useRef(null);
  const [playing,   setPlaying]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [minimized, setMinimized] = useState(false);

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
    else         { audioRef.current.play();  setPlaying(true);  }
  };

  const handleClose = () => {
    if (audioRef.current) { audioRef.current.pause(); }
    onClose();
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
  };

  const audioEl = (
    <audio ref={audioRef} src={audioUrl}
           onTimeUpdate={handleTimeUpdate}
           onEnded={() => setPlaying(false)} />
  );

  if (minimized) {
    return (
      <>
        {audioEl}
        <div style={{
          position: 'fixed',
          bottom: '72px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 105,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(10,10,20,0.92)',
          border: `1px solid ${accentColor}55`,
          borderRadius: '2rem',
          padding: '0.5rem 1rem',
          boxShadow: `0 0 20px ${accentColor}33`,
          backdropFilter: 'blur(8px)',
          maxWidth: '90vw',
          fontFamily: 'Georgia, serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
        }}>
          <button onClick={togglePlay} style={{
            background: accentColor, border: 'none', borderRadius: '50%',
            width: 28, height: 28, color: '#fff', fontSize: '0.75rem',
            cursor: 'pointer', flexShrink: 0,
          }}>
            {playing ? '⏸' : '▶'}
          </button>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem',
                         fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden',
                         textOverflow: 'ellipsis', maxWidth: '200px' }}>
            {titulo}
          </span>
          <button onClick={() => setMinimized(false)} style={{
            color: accentColor, background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '1rem', flexShrink: 0,
          }}>⤢</button>
          <button onClick={handleClose} style={{
            color: '#fff', background: 'none', border: 'none',
            cursor: 'pointer', opacity: 0.5, fontSize: '0.9rem', flexShrink: 0,
          }}>✕</button>
        </div>
      </>
    );
  }

  return (
    <>
      {audioEl}
      <style>{`
        .story-panel-scroll::-webkit-scrollbar { width: 8px; }
        .story-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .story-panel-scroll::-webkit-scrollbar-thumb {
          background: #00ffff88; border-radius: 4px; box-shadow: 0 0 8px #00ffff66;
        }
        .story-panel-scroll::-webkit-scrollbar-thumb:hover {
          background: #00ffff; box-shadow: 0 0 14px #00ffffaa;
        }
      `}</style>
      <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none"
           style={{ background: 'rgba(0,0,0,0.15)' }}>
        <div className="pointer-events-auto" style={{ width:'90%', maxWidth:'640px' }}>
        <div style={{
          background: 'rgba(10,10,20,0.75)',
          backdropFilter: 'blur(4px)',
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
          fontFamily: 'Georgia, serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ color: accentColor, fontWeight:900, fontSize:'1rem',
                         letterSpacing:'0.1em', textTransform:'uppercase', margin:0 }}>
              {titulo}
            </h2>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button onClick={() => setMinimized(true)} style={{
                background: accentColor,
                border: 'none',
                borderRadius: '1rem',
                padding: '0.25rem 0.75rem',
                color: '#000',
                fontSize: '0.7rem',
                fontWeight: 900,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}>⤵ MIN</button>
              <button onClick={handleClose} style={{
                color:'#fff', background:'none', border:'none',
                fontSize:'1.2rem', cursor:'pointer', opacity:0.6,
              }}>✕</button>
            </div>
          </div>

          {audioUrl && (
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <button onClick={togglePlay} style={{
                background: accentColor, border:'none', borderRadius:'50%',
                width:36, height:36, color:'#fff', fontSize:'1rem',
                cursor:'pointer', flexShrink:0,
              }}>
                {playing ? '⏸' : '▶'}
              </button>
              <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.15)',
                            borderRadius:2, overflow:'hidden' }}>
                <div style={{ width:`${progress}%`, height:'100%',
                              background: accentColor, transition:'width 0.3s' }} />
              </div>
            </div>
          )}

          <div className="story-panel-scroll"
               style={{ overflowY:'auto', flex:1, display:'flex',
                        flexDirection:'column', gap:'0.25rem' }}>
            {parrafos.map((p, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <div style={{ textAlign:'center', fontSize:'1.2rem', lineHeight:1, margin:'0.15rem 0', opacity:0.5 }}>
                    {separator}
                  </div>
                )}
                <p style={{ color:'rgba(255,255,255,0.88)', fontSize:'1.05rem',
                            lineHeight:1.7, margin:0 }}>{p}</p>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}