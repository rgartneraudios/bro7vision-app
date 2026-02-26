// src/components/TerminalShop.jsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';

const parsePrice = (p) => {
  if (typeof p === 'number') return p;
  if (!p) return 0;
  return parseFloat(String(p).replace('€','').replace(',','.').trim()) || 0;
};

// Colores sólidos para los fondos de los productos
const NEON_COLORS = ['#00E5FF', '#FF2EF7', '#00FF88', '#FFD000', '#3B82F6'];

export const TERMINAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Rajdhani:wght@500;600;700&display=swap');

  @keyframes floatCard { 
    0%,100%{transform:translateY(0)} 
    50%{transform:translateY(-6px)} 
  }
  @keyframes popIn { 0%{transform:scale(0.9);opacity:0} 100%{transform:scale(1);opacity:1} }

  .ts-bubble { cursor:pointer; transition:all 0.2s ease; }
  .ts-bubble:hover { filter:brightness(1.15); transform:scale(1.03) translateY(-4px) !important; }
  
  .ts-btn { cursor:pointer; transition:all 0.2s; border:none; outline:none; text-shadow:none !important; }
  .ts-btn:hover { filter:brightness(1.2); transform:translateY(-2px); }
  
  .ts-zone::-webkit-scrollbar { display: none; }
  .ts-zone { -ms-overflow-style: none; scrollbar-width: none; }
  
  .ts-search-input::placeholder { color:rgba(255,255,255,0.4); }
`;

export const SECTION = {
  products: { primary:'#FFD000', glow:'rgba(255,208,0,0.6)', label:'PRODUCTOS' },
  services: { primary:'#FF6B00', glow:'rgba(255,107,0,0.6)', label:'SERVICIOS' },
  assets:   { primary:'#00E5FF', glow:'rgba(0,229,255,0.6)', label:'ACTIVOS P2P' },
};

/* ── Producto (Rectángulo Sólido con Borde Neón) ── */
const Bubble = ({ item, sc, inCart, qty, onAdd, onPreview, idx }) => {
  const [pop, setPop] = useState(false);
  const click = () => {
    // Si es el producto principal o ya está en carrito, añadir directo. Si no, preview.
    if (!inCart && item.id !== 'main') { onPreview(item); return; }
    setPop(true); onAdd(item); setTimeout(()=>setPop(false),300);
  };
  
  const baseColor = NEON_COLORS[idx % NEON_COLORS.length];
  
  return (
    <div className="ts-bubble" onClick={click} style={{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      width: 170, height: 130, borderRadius: 16,
      background: baseColor, border: `3px solid #FFF`,
      boxShadow: `0 0 18px ${baseColor}`,
      animation: `floatCard ${4 + (idx%3)}s ease-in-out infinite${pop?',popIn 0.2s ease':''}`,
      position: 'relative', flexShrink: 0, padding: '12px 16px',
      color: '#000'
    }}>
      {inCart && (
        <span style={{position:'absolute',top:-10,right:-10,width:28,height:28,borderRadius:'50%',
          background:'#000',color:'#FFF',fontSize:14,fontWeight:700,fontFamily:'Chakra Petch,sans-serif',
          display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:`0 0 10px #000`}}>
          {qty}
        </span>
      )}
      
      <span style={{fontSize:14,fontWeight:800,fontFamily:'Rajdhani,sans-serif',
        textTransform:'uppercase',textAlign:'center',lineHeight:1.1, marginBottom: 8}}>
        {item.name}
      </span>
      
      <div style={{background:'rgba(255,255,255,0.4)', padding:'4px 16px', borderRadius:10}}>
        <span style={{fontSize:20,fontWeight:800,fontFamily:'Chakra Petch,sans-serif'}}>
          {item.price.toFixed(2)}€
        </span>
      </div>

      {inCart && (
        <span style={{fontSize:11, fontFamily:'Rajdhani', color:'#000', marginTop:8, fontWeight:800, textTransform:'uppercase'}}>
          + AÑADIR OTRO
        </span>
      )}
    </div>
  );
};

/* ── Preview popup ── */
const PreviewPopup = ({ item, sc, onAdd, onClose }) => (
  <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
    width:320,padding:'24px',background:'rgba(10,10,15,0.95)',backdropFilter:'blur(10px)',
    border:`2px solid ${sc.primary}`, boxShadow:`0 0 40px ${sc.glow}`,
    borderRadius:20,zIndex:30,textAlign:'center'}}>
    <button onClick={onClose} style={{position:'absolute',top:10,right:14,background:'none',border:'none',color:'#fff',cursor:'pointer',fontSize:18,fontFamily:'Rajdhani'}}>✕</button>
    <div style={{fontSize:12,color:sc.primary,textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:10,fontFamily:'Rajdhani',fontWeight:700}}>◈ ARTÍCULO</div>
    <div style={{fontSize:20,fontWeight:700,color:'#fff',textTransform:'uppercase',marginBottom:8,fontFamily:'Chakra Petch,sans-serif'}}>{item.name}</div>
    <div style={{fontSize:36,fontWeight:700,fontFamily:'Chakra Petch,sans-serif',color:sc.primary,marginBottom:20}}>{item.price.toFixed(2)}€</div>
    <button onClick={()=>{onAdd(item);onClose();}} className="ts-btn" style={{
      width:'100%',padding:'16px',background:sc.primary,color:'#000',borderRadius:12,
      fontFamily:'Chakra Petch,sans-serif',fontSize:18,fontWeight:700,textTransform:'uppercase',boxShadow:`0 0 16px ${sc.glow}`,
    }}>+ AÑADIR AL CARRITO</button>
  </div>
);

/* ── Cart screen ── */
const CartScreen = ({ items, cart, onRemove, total, onBack, sc }) => (
  <div style={{height:'100%',display:'flex',flexDirection:'column',background:'transparent'}}>
    <div style={{padding:'16px 24px',borderBottom:`1px solid rgba(255,255,255,0.1)`,display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
      <button onClick={onBack} className="ts-btn" style={{background:sc.primary,color:'#000',fontFamily:'Chakra Petch,sans-serif',fontSize:14,fontWeight:700,padding:'10px 20px',borderRadius:8,textTransform:'uppercase'}}>❮ VOLVER</button>
      <span style={{fontFamily:'Chakra Petch,sans-serif',fontSize:18,fontWeight:700,color:sc.primary}}>CARRITO ({items.length})</span>
    </div>
    <div className="ts-zone" style={{flex:1,overflowY:'auto',padding:'16px 24px'}}>
      {items.length===0
        ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'rgba(255,255,255,0.3)',fontFamily:'Rajdhani',fontSize:18,fontWeight:600}}>VACÍO</div>
        : items.map(item=>(
            <div key={item.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',marginBottom:10,borderRadius:12,border:`1px solid ${sc.primary}`,background:'rgba(0,0,0,0.5)'}}>
              <div>
                <div style={{fontFamily:'Rajdhani',fontSize:16,fontWeight:600,color:'#fff'}}>{item.name}</div>
                <div style={{fontFamily:'Rajdhani',fontSize:14,color:sc.primary}}>Cant: {cart[item.id]}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:16}}>
                <span style={{fontFamily:'Chakra Petch,sans-serif',fontSize:20,fontWeight:700,color:sc.primary}}>{(item.price*(cart[item.id]||1)).toFixed(2)}€</span>
                <button onClick={()=>onRemove(item.id)} className="ts-btn" style={{background:'#FF2EF7',color:'#000',borderRadius:8,fontFamily:'Chakra Petch,sans-serif',fontWeight:700,fontSize:12,padding:'8px 12px'}}>QUITAR</button>
              </div>
            </div>
          ))
      }
    </div>
    <div style={{padding:'20px 24px',borderTop:`1px solid rgba(255,255,255,0.1)`,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
      <span style={{fontFamily:'Rajdhani',fontSize:16,fontWeight:600,color:'#fff'}}>TOTAL</span>
      <span style={{fontFamily:'Chakra Petch,sans-serif',fontSize:28,fontWeight:700,color:sc.primary}}>{total.toFixed(2)}€</span>
    </div>
  </div>
);

const CalendarScreen = ({ onBack, sc }) => (
  <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontSize:24, color: sc.primary, fontFamily:'Chakra Petch'}}>CALENDARIO</div>
      <button onClick={onBack} className="ts-btn" style={{marginTop:20,background:sc.primary,color:'#000',padding:'12px 24px',borderRadius:8,fontWeight:700}}>VOLVER</button>
  </div>
);

/* ── TerminalShop Principal ── */
const TerminalShop = ({ initialItem, onUpdateTotal, activeSection }) => {
  // 1. FIX DE LÓGICA: Si hay initialItem, el carrito nace con el item 'main' (que es el initialItem mapeado abajo)
  const [cart,    setCart]    = useState(initialItem ? { 'main': 1 } : {});
  const [search,  setSearch]  = useState('');
  const [preview, setPreview] = useState(null);
  const [screen,  setScreen]  = useState('main');

  const sc = SECTION[activeSection] || SECTION.products;
  const mainPrice = parsePrice(initialItem?.price);

  const INVENTORY = useMemo(()=>[
    // Mapeamos el item que llega desde fuera al ID 'main'
    {id:'main',name:initialItem?.name||'Producto Base',price:mainPrice, cat:'PRINCIPAL',section:'products'},
    {id:'b1', name:'Zapatillas',             price:15.00, cat:'ROPA',     section:'products'},
    {id:'b2', name:'PlayStation 5',          price:499.00,cat:'GAMING',   section:'products'},
    {id:'b3', name:'Aceite Oliva 1L',        price:1.50,  cat:'ALIMENT',  section:'products'},
    {id:'b4', name:'Auriculares Inalámbricos',price:35.00, cat:'AUDIO',    section:'products'},
    {id:'b5', name:'Mochila Urbana',         price:22.50, cat:'BAZAR',    section:'products'},
    {id:'s1', name:'Consulta Psicológica',   price:50.00, cat:'SERVICIO', section:'services'},
    {id:'s2', name:'Sesión de Coaching',     price:35.00, cat:'SERVICIO', section:'services'},
    {id:'d1', name:'Libro Digital PDF',      price:12.00, cat:'DIGITAL',  section:'assets'},
    {id:'d2', name:'Curso Online',           price:45.00, cat:'DIGITAL',  section:'assets'},
  ],[initialItem,mainPrice]);

  const filtered = useMemo(()=>INVENTORY.filter(p=>{
    const ms=!search||p.name.toLowerCase().includes(search.toLowerCase())||p.cat.toLowerCase().includes(search.toLowerCase());
    const mn=search?true:p.section===activeSection;
    return ms&&mn;
  }),[INVENTORY,search,activeSection]);

  useEffect(()=>{
    let t=0; INVENTORY.forEach(p=>{t+=p.price*(cart[p.id]||0);}); onUpdateTotal(t);
  },[cart,INVENTORY,onUpdateTotal]);

  const addToCart      = useCallback((item)=>setCart(p=>({...p,[item.id]:(p[item.id]||0)+1})),[]);
  const removeFromCart = useCallback((id)  =>setCart(p=>{const n={...p};delete n[id];return n;}),[]);

  const cartItems = INVENTORY.filter(p=>(cart[p.id]||0)>0);
  const cartTotal = cartItems.reduce((s,p)=>s+p.price*(cart[p.id]||0),0);
  const cartCount = cartItems.reduce((s,p)=>s+(cart[p.id]||0),0);

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',position:'relative', background:'transparent'}}>
      
      {preview && (
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',zIndex:25,backdropFilter:'blur(4px)'}} onClick={()=>setPreview(null)}>
          <div onClick={e=>e.stopPropagation()}><PreviewPopup item={preview} sc={sc} onAdd={addToCart} onClose={()=>setPreview(null)}/></div>
        </div>
      )}

      {screen==='cart'     && <CartScreen     items={cartItems} cart={cart} onRemove={removeFromCart} total={cartTotal} onBack={()=>setScreen('main')} sc={sc}/>}
      {screen==='calendar' && <CalendarScreen onBack={()=>setScreen('main')} sc={sc}/>}

      {screen==='main' && (
        <>
          {/* Zona Principal de Productos (Arriba) */}
          <div className="ts-zone" style={{flex:1,overflowY:'auto',padding:'24px 16px',display:'flex',flexWrap:'wrap',gap:20,justifyContent:'center', alignContent:'flex-start'}}>
            {filtered.length===0
              ? <div style={{width:'100%',textAlign:'center',paddingTop:60,color:'rgba(255,255,255,0.3)',fontFamily:'Rajdhani',fontSize:20,fontWeight:600}}>SIN RESULTADOS</div>
              : filtered.map((item,i)=>(
                  <Bubble key={item.id} item={item} sc={sc}
                    inCart={(cart[item.id]||0)>0} qty={cart[item.id]||0}
                    onAdd={addToCart} onPreview={setPreview} idx={i} />
                ))
            }
          </div>

          {/* Buscador y Controles (Abajo) */}
          <div style={{ flexShrink:0, padding:'16px 24px', borderTop:'2px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', gap:16 }}>
            
            {/* Buscador */}
            <div style={{
              display:'flex',alignItems:'center',gap:12,
              background:'rgba(0,0,0,0.6)', border:`2px solid rgba(255,255,255,0.1)`,
              borderRadius:12,padding:'12px 20px', 
            }}>
              <span style={{color:sc.primary,fontSize:20}}>⌕</span>
              <input
                type="text"
                placeholder={`BUSCAR...`}
                value={search}
                onChange={e=>setSearch(e.target.value)}
                className="ts-search-input"
                style={{
                  flex:1,background:'transparent',border:'none',outline:'none',color:'#fff', 
                  fontFamily:'Rajdhani,sans-serif',fontSize:16,fontWeight:600,textTransform:'uppercase'
                }}/>
            </div>

            {/* Botones Carrito y Programar */}
            <div style={{display:'flex', justifyContent:'center', gap: 16}}>
                <button onClick={()=>setScreen('cart')} className="ts-btn" style={{
                padding:'14px 40px',borderRadius:12,
                background: cartCount>0 ? '#FFD000' : 'rgba(255,255,255,0.05)',
                border:`2px solid ${cartCount>0 ? '#FFF' : 'rgba(255,255,255,0.2)'}`,
                color: cartCount>0 ? '#000' : '#fff',
                fontFamily:'Chakra Petch,sans-serif',fontSize:18,fontWeight:700,
                textTransform:'uppercase', boxShadow: cartCount>0 ? '0 0 20px rgba(255,208,0,0.6)' : 'none'
                }}>🛒 CARRITO {cartCount>0?`(${cartCount})`:''}</button>

                {activeSection==='services' && (
                <button onClick={()=>setScreen('calendar')} className="ts-btn" style={{
                    padding:'14px 40px',borderRadius:12, background:'#FF6B00', border:'2px solid #FFF',
                    color:'#000', fontFamily:'Chakra Petch,sans-serif',fontSize:18,fontWeight:700,
                    textTransform:'uppercase', boxShadow:'0 0 20px rgba(255,107,0,0.6)'
                }}>📅 PROGRAMAR</button>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TerminalShop;