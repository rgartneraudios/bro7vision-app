import React, { useState, useRef, useEffect } from 'react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700;900&family=Rajdhani:wght@500;600;700;900&display=swap');

  @keyframes vb-fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes vb-typing { 0%,100% { opacity:1; } 50% { opacity:0; } }
  @keyframes vb-cart-bounce { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
  @keyframes vb-item-in { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
  @keyframes vb-dot { 0%,80%,100% { opacity:0.2; transform:scale(0.8); } 40% { opacity:1; transform:scale(1.2); } }
  @keyframes vb-vale-active { 0%,100% { box-shadow: 0 0 15px var(--vale-color), inset 0 0 10px var(--vale-color); } 50% { box-shadow: 0 0 30px var(--vale-color), inset 0 0 20px var(--vale-color); } }
  @keyframes floatBola { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-5px) scale(1.04); } }
  @keyframes neonPulseServicios { 0%,100% { text-shadow: 0 0 8px #94a3b8, 0 0 22px #475569, 0 0 45px #475569; } 50% { text-shadow: 0 0 4px #475569, 0 0 10px #475569; } }

  .vb-wrap { animation: vb-fadeIn 0.4s ease both; }
  .vb-close-btn { transition: all 0.15s; cursor:pointer; }
  .vb-close-btn:hover { background:rgba(255,255,255,0.15) !important; transform:scale(1.05); }

  .vb-iframe-wrap {
    border-radius: 14px; overflow: hidden; border: 2px solid var(--accent-soft);
    box-shadow: 0 0 30px var(--accent-glow); background: #000;
    transition: box-shadow 0.3s; width: 100%; height: 100%;
  }
  .vb-iframe-wrap:hover { box-shadow: 0 0 50px var(--accent-glow); }

  .vb-cursor { display:inline-block; width:3px; height:0.85em; background:var(--accent); margin-left:3px; vertical-align:middle; box-shadow: 0 0 8px var(--accent); animation: vb-typing 0.8s step-end infinite; }
  .vb-loading-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); animation: vb-dot 1.2s ease-in-out infinite; }

  .vb-vale-pill { transition: all 0.3s; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 8px; border-radius: 18px; cursor: default; user-select: none; width: 90px; box-shadow: 0 0 15px var(--vale-color-dim); }
  .vb-vale-pill.activo { animation: vb-vale-active 2s ease-in-out infinite; }

  .vb-send-btn { transition: all 0.2s; cursor:pointer; }
  .vb-send-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.2); }
  .vb-send-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .vb-cart-btn { transition: all 0.2s; cursor:pointer; }
  .vb-cart-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.12); }
  .vb-cart-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .vb-cart-btn.has-items { animation: vb-cart-bounce 2.2s ease-in-out infinite; }

  .vb-input-big { transition: border-color 0.2s, box-shadow 0.2s; resize: none; }
  .vb-input-big:focus { outline: none; border-color: var(--accent) !important; box-shadow: 0 0 0 2px var(--accent-glow), 0 0 24px var(--accent-glow); }
  .vb-item-chip { animation: vb-item-in 0.2s ease both; }

  .vb-msg-wrap { background: rgba(0,0,0,0.75); backdrop-filter: blur(12px); border-radius: 2rem; padding: 18px 32px 20px 32px; min-height: 90px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .vb-msg-wrap-isa  { border: 1px solid rgba(100,116,139,0.35); box-shadow: 0 0 24px rgba(100,116,139,0.2), inset 0 0 12px rgba(0,0,0,0.4); }

  .vb-neon-isabella { color: #94a3b8; font-style: italic; font-weight: 900; text-transform: uppercase; font-size: clamp(14px, 2.2vw, 19px); line-height: 1.5; animation: neonPulseServicios 3s ease-in-out infinite; }
  .vb-bola-isa { background: radial-gradient(circle at 35% 35%, #94a3b8, #334155); border: 2px solid #64748b; color: #fff; box-shadow: 0 0 20px rgba(100,116,139,0.5), inset 0 0 10px rgba(255,255,255,0.1); }
`;

const CFG = {
  isabella: {
    accent:     '#64748B', accentGlow: 'rgba(100,116,139,0.38)', accentSoft: 'rgba(100,116,139,0.22)',
    video:      'https://media.bro7vision.com/IsabellaCloses3.mp4',
    nombre:     'Isabella', rol: 'Gestora de reservas', symbol: '◆',
    neonClass:  'vb-neon-isabella', wrapClass: 'vb-msg-wrap-isa', bolaClass: 'vb-bola-isa',
    placeholder:'Dile a Isabella qué reservar...',
    msgDefault: '¿Qué cita necesitas? Cuéntame y lo gestionamos. ◆',
    tipoItem:   'servicio', labelSubtotal: 'Servicios',
  },
  prmaestro: {
    accent:     '#64748B', accentGlow: 'rgba(100,116,139,0.38)', accentSoft: 'rgba(100,116,139,0.22)',
    video:      'https://media.bro7vision.com/IsabellaCloses3.mp4',
    nombre:     'PRMaestro', rol: 'Consultor profesional', symbol: '◈',
    neonClass:  'vb-neon-isabella', wrapClass: 'vb-msg-wrap-isa', bolaClass: 'vb-bola-isa',
    placeholder:'Dile a PRMaestro qué necesitas...',
    msgDefault: '¿En qué puedo asesorarte hoy? ◈',
    tipoItem:   'servicio', labelSubtotal: 'Servicios',
  },
};

const VALES = [
  { key:'nova',       emoji:'🌑', label:'Nova',   color:'#A855F7' },
  { key:'crescens',   emoji:'🌙', label:'Cresc.', color:'#0EA5E9' },
  { key:'plena',      emoji:'🌕', label:'Plena',  color:'#FFD000' },
  { key:'decrescens', emoji:'🌗', label:'Dec.',   color:'#F97316' },
];

const DELIVERY = {
  pickup:   { emoji:'⚡', label:'Recoger',  color:'#00E5FF' },
  delivery: { emoji:'📦', label:'Envío+2€', color:'#FF6B00' },
  regalo:   { emoji:'🎁', label:'Regalo',   color:'#FF2EF7' },
};

const formatEmbedUrl = (rawUrl) => {
  if (!rawUrl) return '';
  const url = rawUrl.trim();
  if (url.includes('docs.google.com/presentation/d/')) {
    const m = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (m?.[1]) return `https://docs.google.com/presentation/d/${m[1]}/embed?rm=minimal`;
  }
  if (url.includes('drive.google.com/file/d/')) {
    const m = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (m?.[1]) return `https://drive.google.com/file/d/${m[1]}/preview`;
  }
  return url;
};

const ItemChip = ({ item, color, idx }) => (
  <div className="vb-item-chip" style={{
    animationDelay:`${idx*0.04}s`, display:'flex', alignItems:'center', gap:5,
    background:'rgba(0,0,0,0.55)', border:`1px solid ${color}33`,
    borderRadius:6, padding:'3px 8px', flexShrink:0,
  }}>
    <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:12, fontWeight:700, color:'#fff', whiteSpace:'nowrap', maxWidth:110, overflow:'hidden', textOverflow:'ellipsis' }}>{item.item_nombre}</span>
    <span style={{ fontFamily:'Chakra Petch,sans-serif', fontSize:11, fontWeight:700, color, whiteSpace:'nowrap' }}>x{item.qty}</span>
  </div>
);

const IsabellaCierre = ({ personaje = 'isabella', comercio = {}, mensaje = null, carrito = [], precios = {}, vale_activo = null, delivery = 'pickup', valesUsuario = {}, bolas = [], loading = false, onSend, onIrAPagar, onClose }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const cfg = CFG[personaje] || CFG.isabella;

  const total_items = carrito.reduce((s, i) => s + i.qty, 0);
  const delivery_extra = delivery === 'delivery' ? 2.00 : delivery === 'regalo' ? (comercio?.regalo_precio || 0) : 0;
  const total_con_delivery = parseFloat(((precios.total_final || 0) + delivery_extra).toFixed(2));

  // Subtotal neto de Servicios
  const subtotal_zona = carrito.filter(i => i.tipo === cfg.tipoItem).reduce((s, i) => s + (i.item_precio_base || 0) * i.qty, 0);
  const items_zona = carrito.filter(i => i.tipo === cfg.tipoItem).reduce((s,i) => s + i.qty, 0);
  const hasItems = items_zona > 0; // Interruptor de encendido

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 350); }, []);

  const handleSend = () => { if (!input.trim() || loading) return; onSend?.(input.trim()); setInput(''); inputRef.current?.focus(); };
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <>
      <style>{CSS}</style>
      <style>{`.vb-root { --accent: ${cfg.accent}; --accent-glow: ${cfg.accentGlow}; --accent-soft: ${cfg.accentSoft}; }`}</style>

      <div className="vb-root vb-wrap" style={{ position:'fixed', inset:0, zIndex:3500, display:'flex', flexDirection:'column', background:'#000' }}>
        
        {/* VIDEO DE ISABELLA/PRMAESTRO */}
        <div style={{position:'absolute', inset:0, zIndex:0, pointerEvents:'none'}}>
          <video autoPlay loop muted playsInline src={cfg.video} style={{width:'100%', height:'100%', objectFit:'cover', opacity:0.82}} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'65%', background:'linear-gradient(0deg,rgba(4,4,10,0.97) 0%,rgba(4,4,10,0.5) 60%,transparent 100%)' }}/>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'20%', background:'linear-gradient(180deg,rgba(4,4,10,0.65) 0%,transparent 100%)' }}/>
        </div>

        {/* HEADER */}
        <div style={{ position:'relative', zIndex:2, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 24px', background:'rgba(0,0,0,0.42)', borderBottom:`1px solid ${cfg.accentSoft}` }}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:cfg.accent, boxShadow:`0 0 8px ${cfg.accentGlow}` }}/>
            <span style={{ fontFamily:'Chakra Petch,sans-serif', fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.15em' }}>{cfg.nombre} · {cfg.rol}</span>
            {comercio?.nombre_comercio && ( <><span style={{color:'rgba(255,255,255,0.15)', fontSize:10}}>·</span><span style={{ fontFamily:'Chakra Petch,sans-serif', fontSize:13, color:'#fff', fontWeight:700 }}>{comercio.nombre_comercio}</span></> )}
          </div>
          <button className="vb-close-btn" onClick={onClose} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:12, padding:'6px 14px', borderRadius:7, textTransform:'uppercase' }}>✕ CERRAR</button>
        </div>

        {/* CUERPO: IFRAME CALENDARIO + VALES */}
        <div style={{ position:'relative', zIndex:2, flex:1, minHeight:0, display:'flex', alignItems:'stretch', padding:'10px 16px 6px', gap:20 }}>
          <div style={{ flex:1, minWidth:0, display:'flex', alignItems:'center', justifyContent:'center', paddingLeft: '80px' }}>
            <div style={{width:'100%', maxWidth:'960px', maxHeight:'60vh', aspectRatio:'16/9'}}>
              {comercio?.calendario_url ? (
                <div className="vb-iframe-wrap"><iframe src={formatEmbedUrl(comercio.calendario_url)} width="100%" height="100%" style={{border:'none', display:'block'}} sandbox="allow-scripts allow-same-origin allow-popups" title="Calendario"/></div>
              ) : (
                <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background:'rgba(0,0,0,0.42)', borderRadius:12, border:`2px dashed ${cfg.accentSoft}` }}>
                  <span style={{fontSize:36}}>📅</span>
                  <span style={{ fontFamily:'Chakra Petch,sans-serif', fontSize:13, color:cfg.accent, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em' }}>Calendario de reservas</span>
                  <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'rgba(255,255,255,0.3)' }}>{cfg.nombre} gestiona la cita por chat</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ flexShrink:0, width: 110, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, paddingRight: 10, marginTop: '160px' }}>
            <span style={{ fontFamily:'Chakra Petch,sans-serif', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom: 4 }}>VALES DISPONIBLES</span>
            {VALES.map(v => {
              const cantidad = valesUsuario?.[v.key] || 0;
              const activo = vale_activo === v.key;
              return (
                <div key={v.key} className={`vb-vale-pill ${activo ? 'activo' : ''}`} style={{ '--vale-color': v.color, '--vale-color-dim': `${v.color}44`, background: activo ? `${v.color}28` : cantidad > 0 ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)', border:`2px solid ${ activo ? v.color : cantidad > 0 ? v.color : 'rgba(255,255,255,0.1)' }`, opacity: cantidad > 0 || activo ? 1 : 0.4 }}>
                  <span style={{ fontSize: 32, lineHeight: 1, filter: `drop-shadow(0 0 8px ${v.color})` }}>{v.emoji}</span>
                  <span style={{ fontFamily:'Chakra Petch,sans-serif', fontSize: 12, fontWeight: 900, color: activo || cantidad > 0 ? '#fff' : 'rgba(255,255,255,0.4)', textTransform:'uppercase', textShadow: (activo || cantidad > 0) ? `0 0 8px ${v.color}` : 'none' }}>{v.label}</span>
                  <div style={{ background: activo ? v.color : cantidad > 0 ? `${v.color}44` : 'transparent', color: activo ? '#000' : '#fff', padding: '4px 14px', borderRadius: '12px', fontSize: 16, fontWeight: 900, fontFamily: 'Chakra Petch,sans-serif', marginTop: 2, boxShadow: activo || cantidad > 0 ? `0 0 12px ${v.color}` : 'none', border: activo || cantidad > 0 ? `1px solid ${v.color}` : '1px solid rgba(255,255,255,0.1)' }}>
                    {activo ? 'ON' : cantidad > 0 ? `x${cantidad}` : '0'}
                  </div>
                </div>
              );
            })}
            <div style={{width: 60, height: 2, background:'rgba(255,255,255,0.1)', margin:'6px 0'}}/>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'14px 8px', borderRadius:18, width: 90, background:`${DELIVERY[delivery]?.color || '#00E5FF'}18`, border:`2px solid ${DELIVERY[delivery]?.color || '#00E5FF'}`, boxShadow: `0 0 20px ${DELIVERY[delivery]?.color || '#00E5FF'}66, inset 0 0 10px ${DELIVERY[delivery]?.color || '#00E5FF'}44` }}>
              <span style={{ fontSize: 32, filter: `drop-shadow(0 0 8px ${DELIVERY[delivery]?.color || '#00E5FF'})` }}>{DELIVERY[delivery]?.emoji || '⚡'}</span>
              <span style={{ fontFamily:'Chakra Petch,sans-serif', fontSize: 11, fontWeight: 900, color: '#fff', textShadow: `0 0 8px ${DELIVERY[delivery]?.color || '#00E5FF'}`, textTransform:'uppercase', textAlign:'center', lineHeight:1.2 }}>{DELIVERY[delivery]?.label || 'Recoger'}</span>
            </div>
          </div>
        </div>

        {/* BANNER MENSAJE */}
        <div style={{ position:'relative', zIndex:2, flexShrink:0, padding:'0 24px 10px', display: 'flex', justifyContent: 'center' }}>
          <div className={`vb-msg-wrap ${cfg.wrapClass}`} style={{ width: '100%', maxWidth: '750px' }}>
            {!mensaje && !loading && ( <p style={{ fontFamily:'Chakra Petch,sans-serif', fontSize:11, color:`${cfg.accent}88`, textTransform:'uppercase', letterSpacing:'0.15em', fontWeight:700, marginBottom:8, textAlign:'center' }}>◈ {cfg.nombre} · EN LÍNEA</p> )}
            <div style={{textAlign:'center', minHeight:26, display:'flex', alignItems:'center', justifyContent:'center'}}>
              {loading ? ( <div style={{display:'inline-flex', gap:6, alignItems:'center', padding:'4px 0'}}> {[0,1,2].map(i => ( <div key={i} className="vb-loading-dot" style={{animationDelay:`${i*0.2}s`}}/> ))} </div> ) : mensaje ? ( <p className={cfg.neonClass}>{mensaje}<span className="vb-cursor"/></p> ) : ( <p className={cfg.neonClass} style={{opacity:0.5}}>{cfg.msgDefault}</p> )}
            </div>
            {carrito.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, flexWrap:'wrap', justifyContent:'center' }}>
                <span style={{ fontFamily:'Chakra Petch,sans-serif', fontSize:9, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.1em', flexShrink:0 }}>CARRITO</span>
                {carrito.slice(0,5).map((item,i) => ( <ItemChip key={item.id} item={item} color={cfg.accent} idx={i}/> ))}
                {carrito.length > 5 && ( <span style={{fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'rgba(255,255,255,0.3)'}}> +{carrito.length-5} más </span> )}
                {precios?.total_final > 0 && ( <span style={{ fontFamily:'Chakra Petch,sans-serif', fontSize:14, fontWeight:700, color:cfg.accent, whiteSpace:'nowrap' }}>{total_con_delivery.toFixed(2)}€</span> )}
              </div>
            )}
          </div>
        </div>

        {/* BOLAS */}
        {!loading && bolas.length > 0 && (
          <div style={{ position:'relative', zIndex:2, flexShrink:0, display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', padding:'0 24px 12px' }}>
            {bolas.map((bola, i) => ( <button key={i} onClick={() => onSend?.(bola.texto)} className={cfg.bolaClass} style={{ padding:'12px 24px', borderRadius:'999px', fontSize:12, fontWeight:900, fontFamily:'Chakra Petch,sans-serif', textTransform:'uppercase', letterSpacing:'0.08em', cursor:'pointer', transition:'all 0.15s', animation:`floatBola ${1.8 + i*0.3}s ease-in-out infinite` }}>{bola.texto}</button> ))}
          </div>
        )}

        {/* INPUT + CARRO */}
        <div style={{ position:'relative', zIndex:2, flexShrink:0, padding:'0 24px 22px', display:'flex', justifyContent:'center' }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:12, width:'100%', maxWidth:'900px' }}>
            <div style={{ flex:1, background:'rgba(0,0,0,0.72)', border:`1.5px solid ${cfg.accentSoft}`, borderRadius:16, padding:'14px 18px', backdropFilter:'blur(10px)', display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
                <span style={{ fontSize:18, color:cfg.accent, flexShrink:0, marginTop:3, filter:`drop-shadow(0 0 6px ${cfg.accentGlow})` }}>{cfg.symbol}</span>
                <textarea ref={inputRef} className="vb-input-big" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder={cfg.placeholder} disabled={loading} rows={2} style={{ flex:1, background:'transparent', border:'none', color:'#fff', fontFamily:'Rajdhani,sans-serif', fontSize:16, fontWeight:600, lineHeight:1.55, minHeight:50 }} />
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:8, borderTop:`1px solid rgba(255,255,255,0.06)` }}>
                <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'rgba(255,255,255,0.2)' }}>Enter para enviar · Shift+Enter nueva línea</span>
                <button className="vb-send-btn" onClick={handleSend} disabled={!input.trim() || loading} style={{ background:cfg.accent, border:'none', borderRadius:9, padding:'8px 22px', fontFamily:'Chakra Petch,sans-serif', fontSize:12, fontWeight:700, color:'#000', textTransform:'uppercase', letterSpacing:'0.04em', boxShadow:`0 0 14px ${cfg.accentGlow}` }}>ENVIAR →</button>
              </div>
            </div>

            <div style={{flexShrink:0, display:'flex', flexDirection:'column', gap:6, alignSelf:'stretch'}}>
              
              {/* SUBTOTAL SIEMPRE VISIBLE - CAMBIA CON HASITEMS */}
              <div style={{
                background: hasItems ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
                border: hasItems ? `1px solid ${cfg.accentSoft}` : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '6px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                backdropFilter: 'blur(8px)', transition: 'all 0.3s ease'
              }}>
                <span style={{ fontFamily:'Chakra Petch,sans-serif', fontSize:9, color: hasItems ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)', textTransform:'uppercase', letterSpacing:'0.15em', transition: 'color 0.3s' }}>{cfg.labelSubtotal}</span>
                <span style={{ fontFamily:'Chakra Petch,sans-serif', fontSize:15, fontWeight:900, color: hasItems ? cfg.accent : 'rgba(255,255,255,0.3)', textShadow: hasItems ? `0 0 10px ${cfg.accentGlow}` : 'none', transition: 'all 0.3s' }}>{subtotal_zona.toFixed(2)}€</span>
                <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color: hasItems ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)', transition: 'color 0.3s' }}>{items_zona} {items_zona === 1 ? 'item' : 'items'}</span>
              </div>

              <button className={`vb-cart-btn ${total_items > 0 ? 'has-items' : ''}`} onClick={onIrAPagar} disabled={total_items === 0} style={{ flex: 1, minWidth:82, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, borderRadius:14, padding:'10px 14px', background: total_items > 0 ? `linear-gradient(160deg, ${cfg.accent}, #334155)` : 'rgba(255,255,255,0.05)', border:`2px solid ${total_items > 0 ? cfg.accent : 'rgba(255,255,255,0.1)'}`, color: total_items > 0 ? '#000' : 'rgba(255,255,255,0.25)', fontFamily:'Chakra Petch,sans-serif', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.04em', boxShadow: total_items > 0 ? `0 0 22px ${cfg.accentGlow}` : 'none' }}>
                <span style={{fontSize:24}}>🛒</span>
                {total_items > 0 ? ( <><span style={{fontSize:10, fontWeight: 700}}>{total_items} items</span><span style={{fontSize:14, fontWeight:900}}>{total_con_delivery.toFixed(2)}€</span></> ) : ( <span style={{fontSize:10}}>Vacío</span> )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IsabellaCierre;