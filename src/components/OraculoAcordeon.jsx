import React, { useEffect, useRef, useState } from 'react';

/**
 * Componente centralizado para el acordeón de historias del oráculo.
 * Replicando estética y comportamiento de OrumamaBanner.
 */
export default function OraculoAcordeon({ 
  titulo, 
  texto, 
  onClose, 
  isMobile, 
  borderColor = 'rgba(99,108,255,0.40)',
  icono = '🌌',
  nombre = 'ORÁCULO'
}) {
  const [display, setDisplay] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    setDisplay('');
    let i = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      i++;
      setDisplay(texto.slice(0, i));
      if (i >= texto.length) clearInterval(intervalRef.current);
    }, 18);
    return () => clearInterval(intervalRef.current);
  }, [texto]);

  const style = {
    playfair: "'Playfair Display', Georgia, serif",
    slateColor: '#94a3b8',
    acordeon: isMobile 
      ? { 
          // Adaptación móvil: inyectable, estilos simplificados si se requiere
          position: 'static', width: '100%', height: 'auto', 
          background: 'rgba(0,0,0,0.88)', padding: '24px 20px',
          borderLeft: `2px solid ${borderColor}`
        }
      : {
          position: 'fixed', right: 0, top: 0, width: '33.33%', height: '100vh',
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
          overflowY: 'auto', zIndex: 9999,
          padding: '24px 20px 24px 24px',
          borderLeft: `2px solid ${borderColor}`,
          animation: 'cascadaAcordeon 1.1s cubic-bezier(0.22,1,0.36,1)'
        }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        @keyframes cascadaAcordeon {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        .or-acordeon::-webkit-scrollbar { width: 4px; }
        .or-acordeon::-webkit-scrollbar-track { background: transparent; }
        .or-acordeon::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.30); border-radius: 99px; }
      `}</style>

      <div className="or-acordeon" style={style.acordeon}>
        <button
          onClick={onClose}
          style={{ 
            position: 'absolute', top: 14, right: 14, color: style.slateColor, 
            fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 
          }}
        >
          x
        </button>
        <div style={{ marginTop: 36 }}>
          <p style={{ color: style.slateColor, fontWeight: 900, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>
            {icono} {nombre} · {titulo.toUpperCase()}
          </p>
          <p style={{ color: '#f1f5f9', fontFamily: style.playfair, fontSize: 19, lineHeight: 2.1, whiteSpace: 'pre-wrap', fontStyle: 'italic', letterSpacing: '0.01em' }}>
            {display}
          </p>
        </div>
      </div>
    </>
  );
}
