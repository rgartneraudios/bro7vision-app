// src/components/StoryListOverlay.jsx
import React from 'react';

export default function StoryListOverlay({ cuentos, personaje, accentColor = '#a855f7', onClose, onSelectCuento }) {
  return (
    <>
      <div className="fixed inset-0 z-[105]"
           style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' }}
           onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110]"
           style={{ width: '90%', maxWidth: '480px', fontFamily: 'Georgia, serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla"' }}>
        <div style={{
          background: 'rgba(10,10,20,0.85)',
          border: `1px solid ${accentColor}44`,
          borderRadius: '1.5rem',
          padding: '1.25rem 1.5rem',
          boxShadow: `0 0 40px rgba(0,0,0,0.6)`,
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
            <span style={{ color: accentColor, fontWeight:900, fontSize:'0.8rem',
                           letterSpacing:'0.15em', textTransform:'uppercase' }}>
              📖 Historias de {personaje}
            </span>
            <button onClick={onClose}
              style={{ color:'#fff', background:'none', border:'none',
                       cursor:'pointer', opacity:0.6, fontSize:'1.1rem' }}>✕</button>
          </div>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.7rem',
                      marginBottom:'0.75rem', letterSpacing:'0.1em' }}>
            Elige un capítulo o escribe su número en el chat
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', maxHeight:'40vh', overflowY:'auto' }}>
            {cuentos.map(c => (
              <button key={c.numero} onClick={() => onSelectCuento?.(c.numero)}
                style={{
                  color:'rgba(255,255,255,0.85)', fontSize:'0.85rem',
                  padding:'0.5rem 0.75rem', textAlign:'left',
                  border:`1px solid transparent`,
                  borderRadius:'0.75rem',
                  background:'transparent',
                  cursor:'pointer',
                  transition:'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor + '66'; e.currentTarget.style.background = accentColor + '15'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ color: accentColor, fontWeight:900,
                               marginRight:'0.75rem' }}>{c.numero}.</span>
                {c.titulo}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}