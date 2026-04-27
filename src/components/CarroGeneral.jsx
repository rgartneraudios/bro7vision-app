import React, { useState, useRef, useEffect, useMemo } from 'react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800;900&family=Varela+Round&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700;900&display=swap');

  .neon-text-pink   { color:#FF2EF7; text-shadow:0 0 10px rgba(255,46,247,0.8); }
  .neon-text-cyan   { color:#00E5FF; text-shadow:0 0 10px rgba(0,229,255,0.8); }
  .neon-text-yellow { color:#FFD000; text-shadow:0 0 10px rgba(255,208,0,0.8); }

  .cg-footer-pill {
    background:rgba(0,0,0,0.6); backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.1); border-radius:50px;
    padding:6px 15px; display:flex; align-items:center; gap:12px; transition:all 0.3s;
  }
  .cg-footer-pill-mobile {
    background:rgba(0,0,0,0.6); backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.1); border-radius:16px;
    padding:10px 14px; display:flex; align-items:center; gap:10px; transition:all 0.3s;
    flex:1;
  }
  .cg-input-confirm {
    background:rgba(255,255,255,0.05) !important;
    border:1px solid rgba(255,255,255,0.2) !important;
    border-radius:50px !important; text-align:center;
    color:#fff !important; font-weight:900; transition:all 0.3s;
  }
  .cg-input-confirm:focus { border-color:#FF2EF7 !important; background:rgba(255,46,247,0.1) !important; }
  .cg-btn-volver-mini {
    background:none; border:1px solid rgba(255,255,255,0.2);
    color:rgba(255,255,255,0.5); font-size:9px; padding:2px 6px;
    border-radius:4px; cursor:pointer; text-transform:uppercase;
  }
  .cg-btn-volver-mini:hover { color:#fff; border-color:#fff; }
`;

const SubtotalFooter = ({ label, emoji, color, total, onVolver }) => (
  <div className="cg-footer-pill" style={{ borderBottom:`2px solid ${color}` }}>
    <div style={{ display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
        <span style={{fontSize:12}}>{emoji}</span>
        <span style={{ fontSize:9, fontWeight:900, color, letterSpacing:1 }}>{label}</span>
      </div>
      <button className="cg-btn-volver-mini" onClick={onVolver}>Volver</button>
    </div>
    <div style={{ fontSize:18, fontWeight:900, color:'#fff', textShadow:`0 0 10px ${color}88` }}>
      {total.toFixed(2)}€
    </div>
  </div>
);

// ── Versión móvil del footer de confirmación ──────────────────────────────
const SubtotalMobile = ({ label, emoji, color, total, onVolver }) => (
  <div className="cg-footer-pill-mobile" style={{ borderLeft:`3px solid ${color}` }}>
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        <span style={{fontSize:14}}>{emoji}</span>
        <span style={{ fontSize:10, fontWeight:900, color, letterSpacing:1 }}>{label}</span>
      </div>
      <button className="cg-btn-volver-mini" style={{ alignSelf:'flex-start', marginTop:3 }} onClick={onVolver}>← Volver</button>
    </div>
    <span style={{ fontSize:20, fontWeight:900, color:'#fff', textShadow:`0 0 10px ${color}88` }}>
      {total.toFixed(2)}€
    </span>
  </div>
);

const CarroGeneral = ({
  items = [], precios = {}, onConfirmar, onVolverNova, onVolverIsabella,
  usuario_nombre = 'ciudadano',
  videoUrl = "https://media.bro7vision.com/CerrarCarrito.mp4"
}) => {
  const [inputVal, setInputVal] = useState('');
  const [fase, setFase]         = useState('idle');
  const inputRef = useRef(null);

  const isMobile = window.innerWidth < 768;

  useEffect(() => { inputRef.current?.focus(); }, []);

  const itemsNova     = items.filter(i => i.tipo === 'producto');
  const itemsIsabella = items.filter(i => i.tipo === 'servicio');
  const subNova       = itemsNova.reduce((s,i) => s + (i.item_precio_base * i.qty), 0);
  const subIsa        = itemsIsabella.reduce((s,i) => s + (i.item_precio_base * i.qty), 0);
  const totalReal     = precios.total_final || (subNova + subIsa);

  const handleConfirm = () => {
    if (inputVal.toUpperCase() !== 'CONFIRMO') return;
    setFase('confirming');
    setTimeout(() => { setFase('bye'); setTimeout(() => onConfirmar?.(), 1500); }, 800);
  };

  const BgVideo = useMemo(() => (
    <video autoPlay loop muted playsInline src={videoUrl}
      style={{ width:'100%', height:'100%', objectFit:'cover',
        position:'absolute', inset:0, zIndex:-1 }} />
  ), [videoUrl]);

  // ── MÓVIL ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ position:'fixed', inset:0, zIndex:5000, display:'flex',
          flexDirection:'column', fontFamily:'Nunito, sans-serif', background:'#000' }}>

          {BgVideo}
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.1)', zIndex:-1 }} />

          {/* Header */}
          <div style={{ textAlign:'center', paddingTop:'4vh', flexShrink:0 }}>
            <h2 style={{ fontWeight:900, fontSize:28, letterSpacing:4, color:'#fff', margin:0,
              fontFamily:"'Chakra Petch',sans-serif" }}>CONFIRMACIÓN</h2>
          </div>

          {/* Espacio central — personajes del video */}
          <div style={{ flex:1 }} />

          {/* Footer móvil */}
          <div style={{ padding:'16px 16px 32px', flexShrink:0,
            background:'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)',
            display:'flex', flexDirection:'column', gap:12 }}>

            {/* Total */}
            <div style={{ textAlign:'center' }}>
              <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.6)', marginRight:8 }}>TOTAL FINAL:</span>
              <span className="neon-text-yellow" style={{ fontSize:32, fontWeight:900 }}>{totalReal.toFixed(2)}€</span>
            </div>

            {/* Subtotales en fila */}
            <div style={{ display:'flex', gap:10 }}>
              {subNova > 0 && <SubtotalMobile label="VENTAS" emoji="🛍️" color="#FFD000" total={subNova} onVolver={onVolverNova} />}
              {subIsa > 0  && <SubtotalMobile label="SERVICIOS" emoji="✨" color="#00E5FF" total={subIsa}  onVolver={onVolverIsabella} />}
            </div>

            {/* Confirmar */}
            <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:16,
              padding:'12px 16px', border:'1px solid rgba(255,255,255,0.1)',
              backdropFilter:'blur(5px)', display:'flex', flexDirection:'column', gap:10 }}>
              {fase === 'idle' ? (
                <>
                  <div style={{ fontSize:12, fontWeight:800, color:'#fff', textAlign:'center' }}>
                    ESCRIBE <span className="neon-text-yellow">CONFIRMO</span> PARA PAGAR
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <input
                      ref={inputRef}
                      className="cg-input-confirm"
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value.toUpperCase())}
                      placeholder="..."
                      style={{ flex:1, padding:'10px', fontSize:15 }}
                    />
                    <button onClick={handleConfirm}
                      style={{ background:'#FF2EF7', border:'none', color:'#fff',
                        padding:'10px 20px', borderRadius:50, fontWeight:900,
                        cursor:'pointer', fontSize:14, flexShrink:0 }}>
                      PAGAR →
                    </button>
                  </div>
                </>
              ) : (
                <div className="neon-text-cyan" style={{ fontWeight:900, fontSize:20,
                  padding:'8px 0', textAlign:'center' }}>
                  {fase === 'confirming' ? 'PROCESANDO...' : '¡LISTO!'}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── PC ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div style={{ position:'fixed', inset:0, zIndex:5000, display:'flex',
        flexDirection:'column', fontFamily:'Nunito' }}>

        {BgVideo}
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.2)', zIndex:-1 }} />

        <div style={{ textAlign:'center', paddingTop:'3vh' }}>
          <h2 style={{ fontWeight:900, fontSize:42, letterSpacing:6, color:'#fff', margin:0 }}>CONFIRMACIÓN</h2>
        </div>

        <div style={{ flex:1 }} />

        <div style={{ padding:'40px 20px',
          background:'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:15 }}>

          <div style={{ marginBottom:5 }}>
            <span style={{ fontSize:10, fontWeight:1000, color:'rgba(255,255,255,0.7)', marginRight:10 }}>TOTAL FINAL:</span>
            <span className="neon-text-yellow" style={{ fontSize:36, fontWeight:1200 }}>{totalReal.toFixed(2)}€</span>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:15, justifyContent:'center', width:'100%' }}>
            <SubtotalFooter label="VENTAS" emoji="🛍️" color="#FFD000" total={subNova} onVolver={onVolverNova} />

            <div style={{ display:'flex', alignItems:'center', gap:12,
              background:'rgba(255,255,255,0.1)', padding:'10px 20px', borderRadius:100,
              border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(5px)' }}>
              {fase === 'idle' ? (
                <>
                  <div style={{ fontSize:11, fontWeight:800, color:'#fff' }}>
                    ESCRIBE <span className="neon-text-yellow">CONFIRMO</span>
                  </div>
                  <input ref={inputRef} className="cg-input-confirm"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value.toUpperCase())}
                    placeholder="..."
                    style={{ width:110, padding:'8px' }} />
                  <button onClick={handleConfirm}
                    style={{ background:'#FF2EF7', border:'none', color:'#fff',
                      padding:'8px 20px', borderRadius:50, fontWeight:900, cursor:'pointer' }}>
                    PAGAR →
                  </button>
                </>
              ) : (
                <div className="neon-text-cyan" style={{fontWeight:900, fontSize:18, padding:'0 20px'}}>
                  {fase === 'confirming' ? 'PROCESANDO...' : '¡LISTO!'}
                </div>
              )}
            </div>

            <SubtotalFooter label="SERVICIOS" emoji="✨" color="#00E5FF" total={subIsa} onVolver={onVolverIsabella} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CarroGeneral;