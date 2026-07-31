// src/components/StoryListOverlay.jsx
import React from 'react';

export default function StoryListOverlay({ cuentos, personaje, accentColor = '#a855f7', onClose }) {
  return (
    <div className="absolute inset-0 z-[110] flex items-center justify-center"
         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div style={{
        background: 'rgba(10,10,20,0.95)',
        border: `1px solid ${accentColor}44`,
        borderRadius: '1.5rem',
        padding: '1.5rem 2rem',
        maxWidth: '480px',
        width: '90%',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
          <span style={{ color: accentColor, fontWeight:900, fontSize:'0.8rem',
                         letterSpacing:'0.2em', textTransform:'uppercase' }}>
            📖 Historias de {personaje}
          </span>
          <button onClick={onClose}
            style={{ color:'#fff', background:'none', border:'none',
                     cursor:'pointer', opacity:0.6 }}>✕</button>
        </div>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.75rem',
                    marginBottom:'1rem', letterSpacing:'0.1em' }}>
          Escribe el número al personaje para activar la historia
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          {cuentos.map(c => (
            <div key={c.numero} style={{
              color:'rgba(255,255,255,0.85)', fontSize:'0.85rem',
              padding:'0.5rem 0.75rem',
              borderBottom:'1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{ color: accentColor, fontWeight:900,
                             marginRight:'0.75rem' }}>{c.numero}.</span>
              {c.titulo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}