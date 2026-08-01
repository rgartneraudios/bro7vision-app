// src/components/StoryListOverlay.jsx
import React from 'react';

export default function StoryListOverlay({ cuentos, personaje, accentColor = '#a855f7', onClose, onSelect }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
         style={{ background: 'rgba(0,0,0,0.15)' }}>
      <style>{`
        .story-list-scroll::-webkit-scrollbar { width: 8px; }
        .story-list-scroll::-webkit-scrollbar-track { background: transparent; }
        .story-list-scroll::-webkit-scrollbar-thumb {
          background: #00ffff88;
          border-radius: 4px;
          box-shadow: 0 0 8px #00ffff66;
        }
        .story-list-scroll::-webkit-scrollbar-thumb:hover {
          background: #00ffff;
          box-shadow: 0 0 14px #00ffffaa;
        }
      `}</style>
      <div className="pointer-events-auto"
           style={{ width: '90%', maxWidth: '480px', fontFamily: 'Georgia, serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla"' }}>
        <div style={{
          background: 'rgba(10,10,20,0.75)',
          border: `1px solid ${accentColor}44`,
          borderRadius: '1.5rem',
          padding: '1.25rem 1.5rem',
          boxShadow: `0 0 40px rgba(0,0,0,0.6)`,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
            <span style={{ color: accentColor, fontWeight:900, fontSize:'1rem',
                           letterSpacing:'0.15em', textTransform:'uppercase' }}>
              📖 Historias de {personaje}
            </span>
            <button onClick={onClose}
              style={{ color:'#fff', background:'none', border:'none',
                       cursor:'pointer', opacity:0.6, fontSize:'1.3rem' }}>✕</button>
          </div>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.9rem',
                      marginBottom:'0.75rem', letterSpacing:'0.1em' }}>
            Elige un capítulo o escribe su número en el chat
          </p>
          <div className="story-list-scroll" style={{ display:'flex', flexDirection:'column', gap:'0.35rem', maxHeight:'40vh', overflowY:'auto',
            scrollbarWidth:'thin', scrollbarColor:'#00ffff99 transparent' }}>
          {cuentos.map(c => (
              <div key={c.numero}
                onClick={() => { onSelect?.(c.numero); onClose(); }}
                style={{
                  color:'rgba(255,255,255,0.85)', fontSize:'1.15rem',
                  padding:'0.5rem 0.75rem',
                  borderBottom:'1px solid rgba(255,255,255,0.07)',
                  cursor:'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
            <span style={{ color: accentColor, fontWeight:900, fontSize:'1.05rem', marginRight:'0.75rem' }}>
                  {c.numero}.
                </span>
                <span style={{ fontSize:'1.15rem' }}>{c.titulo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}