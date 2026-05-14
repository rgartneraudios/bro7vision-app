import React, { useState, useRef, useEffect } from 'react';

const VALES = [
  { key:'nova',       emoji:'🌑', label:'Nova',   color:'#A855F7' },
  { key:'crescens',   emoji:'🌙', label:'Cresc.', color:'#0EA5E9' },
  { key:'plena',      emoji:'🌕', label:'Plena',  color:'#FFD000' },
  { key:'decrescens', emoji:'🌗', label:'Dec.',   color:'#F97316' },
];

const accent     = '#fbbf24';
const accentGlow = 'rgba(251,191,36,0.38)';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;700;900&family=Bebas+Neue&family=Courier+New&display=swap');

  @keyframes nm-pulse { 0%,100%{text-shadow:0 0 8px #fbbf24,0 0 22px #BD9B06;} 50%{text-shadow:0 0 4px #BD9B06,0 0 10px #BD9B06;} }
  @keyframes nm-dot   { 0%,80%,100%{opacity:.2;transform:scale(.8);} 40%{opacity:1;transform:scale(1.2);} }
  @keyframes nm-vale  { 0%,100%{box-shadow:0 0 12px var(--vc),inset 0 0 8px var(--vc);} 50%{box-shadow:0 0 24px var(--vc),inset 0 0 16px var(--vc);} }
  @keyframes nm-in    { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }

  .nm-msg { font-family:'Courier New',monospace; color:#fbbf24; font-style:italic; font-weight:900;
    text-transform:uppercase; font-size:clamp(18px,5vw,28px); line-height:1.3; text-align:center;
    animation:nm-pulse 3s ease-in-out infinite; }
  .nm-dot { width:8px;height:8px;border-radius:50%;background:#fbbf24;animation:nm-dot 1.2s ease-in-out infinite; }
  .nm-in  { animation:nm-in 0.3s ease both; }
  .nm-vale-active { animation:nm-vale 2s ease-in-out infinite; }
`;

const NovaCierreMobile = ({
  comercio = {}, mensaje = null, carrito = [], precios = {},
  vale_activo = null, valesUsuario = {}, bolas = [],
  loading = false, onSend, onIrAPagar, onClose,
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend?.(input.trim());
    setInput('');
  };

  const total_items = carrito.reduce((s, i) => s + i.qty, 0);
  const total_final = precios?.total_final || 0;

  // Solo vales con cantidad > 0 o activo
  const valesVisibles = VALES.filter(v => (valesUsuario?.[v.key] || 0) > 0 || vale_activo === v.key);

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        position:'fixed', inset:0, zIndex:3500,
        display:'flex', flexDirection:'column',
        background:'#000', fontFamily:"'Chakra Petch',sans-serif",
      }}>
{/* Video de fondo */}
<video
  style={{
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0
  }}
  autoPlay
  loop
  muted
  playsInline
>
  <source src="https://media.bro7vision.com/NovaVentas_v.mp4" type="video/mp4" />
</video>

{/* Overlay oscuro */}
<div style={{ position:'absolute', inset:0, zIndex:1, background:'rgba(0,0,0,0.15)' }} />
        {/* HEADER */}
        <div className="nm-in" style={{ position:'relative', zIndex:2, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'10px 16px', background:'rgba(0,0,0,0.5)',
          borderBottom:`1px solid ${accentGlow}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:accent, boxShadow:`0 0 8px ${accentGlow}` }} />
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.15em' }}>
              NOVA · {comercio?.nombre_comercio || 'TIENDA'}
            </span>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)',
            color:'rgba(255,255,255,0.5)', fontSize:11, padding:'5px 12px', borderRadius:7,
            textTransform:'uppercase', cursor:'pointer' }}>✕ CERRAR</button>
        </div>

        {/* AVATAR */}
        <div style={{ position:'relative', zIndex:2, flexShrink:0, display:'flex', justifyContent:'center', paddingTop:16, paddingBottom:8 }}>
          <img src="/emojis/nova.webp" alt="Nova" style={{
            width:72, height:72, borderRadius:'50%', objectFit:'cover',
            border:`2px solid ${accent}`, boxShadow:`0 0 16px ${accentGlow}`,
          }} />
        </div>

        {/* VALES — fila horizontal, solo los activos/disponibles */}
        {valesVisibles.length > 0 && (
          <div style={{ position:'relative', zIndex:2, flexShrink:0,
            display:'flex', justifyContent:'center', gap:8, paddingBottom:10 }}>
            {valesVisibles.map(v => {
              const cantidad = valesUsuario?.[v.key] || 0;
              const activo   = vale_activo === v.key;
              return (
                <div key={v.key}
                  className={activo ? 'nm-vale-active' : ''}
                  style={{
                    '--vc': v.color,
                    display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                    padding:'8px 10px', borderRadius:12,
                    background: activo ? `${v.color}28` : 'rgba(0,0,0,0.6)',
                    border:`2px solid ${activo ? v.color : `${v.color}66`}`,
                    minWidth:52,
                  }}>
                  <span style={{ fontSize:20 }}>{v.emoji}</span>
                  <span style={{ fontSize:9, fontWeight:900, color: activo ? v.color : '#fff',
                    textTransform:'uppercase' }}>{v.label}</span>
                  <span style={{ fontSize:12, fontWeight:900, color: activo ? '#000' : '#fff',
                    background: activo ? v.color : 'transparent',
                    padding:'1px 8px', borderRadius:8 }}>
                    {activo ? 'ON' : `x${cantidad}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      {/* CHAT */}
<div style={{ position:'relative', zIndex:2, flex:1, minHeight:0,
  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
  padding:'0 24px' }}>
  {loading ? (
    <div style={{ display:'flex', gap:8 }}>
      {[0,1,2].map(i => <div key={i} className="nm-dot" style={{ animationDelay:`${i*0.2}s` }} />)}
    </div>
  ) : mensaje ? (
    <p className="nm-msg" style={{ color:'#ffffff', fontWeight:'600', textShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>
      {mensaje}
    </p>
  ) : (
    <p className="nm-msg" style={{ color:'#ffffff', fontWeight:'600', textShadow:'0 2px 8px rgba(0,0,0,0.3)', opacity:0.85 }}>
      ¿Qué te llevo hoy? Dime qué buscas.
    </p>
  )}

          {/* Carrito mini */}
          {total_items > 0 && (
            <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:8,
              background:'rgba(0,0,0,0.6)', border:`1px solid ${accentGlow}`,
              borderRadius:12, padding:'8px 16px' }}>
              <span style={{ fontSize:14 }}>🛒</span>
              <span style={{ fontSize:13, fontWeight:900, color:accent }}>{total_items} items</span>
              <span style={{ fontSize:15, fontWeight:900, color:'#fff' }}>{total_final.toFixed(2)}€</span>
            </div>
          )}
        </div>

        {/* BOLAS */}
        {!loading && bolas.length > 0 && (
          <div style={{ position:'relative', zIndex:2, flexShrink:0,
            display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center',
            padding:'8px 16px' }}>
            {bolas.map((b, i) => (
              <button key={i} onClick={() => onSend?.(b.texto)} style={{
                background:`${accent}18`, border:`1px solid ${accentGlow}`,
                color:accent, borderRadius:999, padding:'8px 16px',
                fontSize:11, fontWeight:900, textTransform:'uppercase',
                letterSpacing:'0.06em', cursor:'pointer',
              }}>{b.texto}</button>
            ))}
          </div>
        )}

        {/* FOOTER — input + botón carro */}
        <div style={{ position:'relative', zIndex:2, flexShrink:0,
          padding:'12px 16px 28px', background:'rgba(0,0,0,0.65)',
          borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', gap:10 }}>

          <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
            <div style={{ flex:1, background:'rgba(0,0,0,0.7)', border:`1.5px solid ${accentGlow}`,
              borderRadius:14, padding:'10px 14px', backdropFilter:'blur(10px)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:accent, fontSize:16 }}>✦</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Dile a Nova qué quieres..."
                  disabled={loading}
                  style={{ flex:1, background:'transparent', border:'none', color:'#fff',
                    fontSize:15, fontWeight:600, outline:'none', fontFamily:'inherit' }}
                />
              </div>
            </div>
            <button onClick={handleSend} disabled={!input.trim() || loading}
              style={{ flexShrink:0, width:48, height:48, borderRadius:12,
                background: input.trim() ? accent : 'rgba(255,255,255,0.1)',
                border:'none', color: input.trim() ? '#000' : 'rgba(255,255,255,0.3)',
                fontSize:20, fontWeight:900, cursor: input.trim() ? 'pointer' : 'default',
                boxShadow: input.trim() ? `0 0 14px ${accentGlow}` : 'none' }}>▶</button>
          </div>

          {/* Botón IR AL CARRO */}
          <button onClick={onIrAPagar} disabled={total_items === 0}
            style={{ width:'100%', padding:'14px 0', borderRadius:14, fontWeight:900,
              fontSize:14, textTransform:'uppercase', letterSpacing:'0.08em', cursor: total_items > 0 ? 'pointer' : 'default',
              background: total_items > 0 ? `linear-gradient(135deg, ${accent}, #b45309)` : 'rgba(255,255,255,0.05)',
              border:`2px solid ${total_items > 0 ? accent : 'rgba(255,255,255,0.1)'}`,
              color: total_items > 0 ? '#000' : 'rgba(255,255,255,0.25)',
              boxShadow: total_items > 0 ? `0 0 20px ${accentGlow}` : 'none',
              transition:'all 0.3s' }}>
            {total_items > 0 ? `🛒 IR AL CARRO · ${total_final.toFixed(2)}€` : '🛒 Carrito vacío'}
          </button>
        </div>
      </div>
    </>
  );
};

export default NovaCierreMobile;
