// src/components/TerminalShop.jsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // <-- IMPORTANTE PARA LEER EL INVENTARIO
import { askGemini } from '../services/gemini';

const parsePrice = (p) => {
  if (typeof p === 'number') return p;
  if (!p) return 0;
  return parseFloat(String(p).replace('€','').replace(',','.').trim()) || 0;
};

const NEON_COLORS = ['#00E5FF', '#FF2EF7', '#00FF88', '#FFD000', '#3B82F6'];

export const TERMINAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Rajdhani:wght@500;600;700&display=swap');

  @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes popIn { 0%{transform:scale(0.9);opacity:0} 100%{transform:scale(1);opacity:1} }

  .ts-bubble { cursor:pointer; transition:all 0.2s ease; }
  .ts-bubble:hover { filter:brightness(1.15); transform:scale(1.03) translateY(-4px) !important; }
  
  .ts-btn { cursor:pointer; transition:all 0.2s; border:none; outline:none; text-shadow:none !important; }
  .ts-btn:hover { filter:brightness(1.2); transform:translateY(-2px); }
  
  .ts-zone::-webkit-scrollbar { display: none; }
  .ts-zone { -ms-overflow-style: none; scrollbar-width: none; }
  
  .ts-search-input::placeholder { color:rgba(255,255,255,0.4); }

  /* Estilos para las variantes de Tallas y Colores */
  .variant-btn {
      background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff;
      padding: 6px 12px; border-radius: 6px; font-family: 'Rajdhani', sans-serif;
      font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s;
  }
  .variant-btn:hover { border-color: #fff; }
  .variant-btn.active { background: #fff; color: #000; border-color: #fff; box-shadow: 0 0 10px rgba(255,255,255,0.5); }
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
    // Siempre abrimos el PreviewPopup si tiene variantes, o si no está en el carrito
    if (!inCart || item.sizes || item.colors || item.desc) { onPreview(item); return; }
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
          display:'flex',alignItems:'center',justifyContent:'center', boxShadow:`0 0 10px #000`}}>
          {qty}
        </span>
      )}
      <span style={{fontSize:14,fontWeight:800,fontFamily:'Rajdhani,sans-serif', textTransform:'uppercase',textAlign:'center',lineHeight:1.1, marginBottom: 8}}>
        {item.name}
      </span>
      <div style={{background:'rgba(255,255,255,0.4)', padding:'4px 16px', borderRadius:10}}>
        <span style={{fontSize:20,fontWeight:800,fontFamily:'Chakra Petch,sans-serif'}}>{item.price.toFixed(2)}€</span>
      </div>
      {inCart && <span style={{fontSize:11, fontFamily:'Rajdhani', color:'#000', marginTop:8, fontWeight:800, textTransform:'uppercase'}}>+ AÑADIR OTRO</span>}
    </div>
  );
};

/* ── Función para limpiar URLs de catálogos y forzar modo Embed (Incrustado) ── */
const formatEmbedUrl = (rawUrl) => {
    if (!rawUrl) return '';
    let url = rawUrl.trim();

    // 1. Limpiar Google Slides (Quita la UI de Google y fuerza el modo embed)
    if (url.includes('docs.google.com/presentation/d/')) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
            // rm=minimal quita la barra de abajo de Google Slides
            return `https://docs.google.com/presentation/d/${match[1]}/embed?rm=minimal`;
        }
    }
    
    // 2. Limpiar PDFs de Google Drive (Fuerza la vista previa sin sacar al usuario)
    if (url.includes('drive.google.com/file/d/')) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
    }

    // 3. Si es Canva, Issuu u otra cosa, devolvemos lo que puso el usuario.
    // (Issuu y Canva dan un enlace "Embed" si el usuario le da a compartir).
    return url;
};

/* ── Preview popup (FICHA TÉCNICA Y VARIANTES - CORREGIDA CON SCROLL) ── */
const PreviewPopup = ({ item, sc, onAdd, onClose }) => {
    // Parseamos las tallas y colores si existen
    const sizesList = item.sizes ? item.sizes.split(',').map(s => s.trim()) : [];
    const colorsList = item.colors ? item.colors.split(',').map(c => c.trim()) : [];

    const [selSize, setSelSize] = useState(sizesList[0] || null);
    const [selColor, setSelColor] = useState(colorsList[0] || null);

    const handleAddToCart = () => {
        onAdd(item, selSize, selColor);
        onClose();
    };

    return (
      <div className="ts-zone" style={{ // Añadido ts-zone para ocultar la barra de scroll nativa
        position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
        width:'90%', maxWidth: 500, // <--- Más ancho (antes 400)
        maxHeight: '95%', // <--- Límite de altura máxima respecto a la pantalla
        overflowY: 'auto', // <--- Permite hacer scroll si la pantalla es muy pequeña
        padding:'24px',background:'rgba(10,10,15,0.95)',backdropFilter:'blur(10px)',
        border:`2px solid ${sc.primary}`, boxShadow:`0 0 40px ${sc.glow}`,
        borderRadius:20,zIndex:30,textAlign:'center', display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        
        <button onClick={onClose} style={{position:'absolute',top:10,right:14,background:'none',border:'none',color:'#fff',cursor:'pointer',fontSize:18,fontFamily:'Rajdhani'}}>✕</button>
        
        <div style={{flexShrink: 0}}>
            <div style={{fontSize:12,color:sc.primary,textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:5,fontFamily:'Rajdhani',fontWeight:700}}>◈ {item.cat}</div>
            <div style={{fontSize:22,fontWeight:700,color:'#fff',textTransform:'uppercase',fontFamily:'Chakra Petch,sans-serif'}}>{item.name}</div>
        </div>

        {/* Descripción del producto con Scroll Interno Independiente */}
        {item.desc && (
            <div className="ts-zone" style={{
                fontSize: 13, color: '#aaa', fontFamily: 'Rajdhani', 
                background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', 
                textAlign: 'left', fontStyle: 'italic', border: '1px solid rgba(255,255,255,0.1)',
                maxHeight: '200px', // <--- La caja de descripción no crecerá más de esto
                overflowY: 'auto',  // <--- Añade scroll solo a la descripción
                flexShrink: 0
            }}>
                {item.desc}
            </div>
        )}

        <div style={{fontSize:36,fontWeight:700,fontFamily:'Chakra Petch,sans-serif',color:sc.primary, flexShrink: 0}}>{item.price.toFixed(2)}€</div>

        {/* SELECTORES DE VARIANTES */}
        {(sizesList.length > 0 || colorsList.length > 0) && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0}}>
                {sizesList.length > 0 && (
                    <div>
                        <div style={{fontSize: 10, color: '#888', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold'}}>Seleccionar Talla:</div>
                        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center'}}>
                            {sizesList.map(s => <button key={s} onClick={() => setSelSize(s)} className={`variant-btn ${selSize === s ? 'active' : ''}`}>{s}</button>)}
                        </div>
                    </div>
                )}
                {colorsList.length > 0 && (
                    <div>
                        <div style={{fontSize: 10, color: '#888', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold'}}>Seleccionar Color:</div>
                        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center'}}>
                            {colorsList.map(c => <button key={c} onClick={() => setSelColor(c)} className={`variant-btn ${selColor === c ? 'active' : ''}`}>{c}</button>)}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Botón siempre accesible */}
        <button onClick={handleAddToCart} className="ts-btn" style={{
          width:'100%',padding:'16px',background:sc.primary,color:'#000',borderRadius:12, marginTop: '8px',
          fontFamily:'Chakra Petch,sans-serif',fontSize:18,fontWeight:700,textTransform:'uppercase',boxShadow:`0 0 16px ${sc.glow}`,
          flexShrink: 0
        }}>+ AÑADIR AL CARRITO</button>
      </div>
    );
};
/* ── Cart screen ── */
const CartScreen = ({ cartObj, onRemove, total, onBack, sc }) => {
  const cartItems = Object.values(cartObj);
  
  return (
  <div style={{height:'100%',display:'flex',flexDirection:'column',background:'transparent'}}>
    <div style={{padding:'16px 24px',borderBottom:`1px solid rgba(255,255,255,0.1)`,display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
      <button onClick={onBack} className="ts-btn" style={{background:sc.primary,color:'#000',fontFamily:'Chakra Petch,sans-serif',fontSize:14,fontWeight:700,padding:'10px 20px',borderRadius:8,textTransform:'uppercase'}}>❮ VOLVER</button>
      <span style={{fontFamily:'Chakra Petch,sans-serif',fontSize:18,fontWeight:700,color:sc.primary}}>CARRITO ({cartItems.length})</span>
    </div>
    <div className="ts-zone" style={{flex:1,overflowY:'auto',padding:'16px 24px'}}>
      {cartItems.length===0
        ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'rgba(255,255,255,0.3)',fontFamily:'Rajdhani',fontSize:18,fontWeight:600}}>VACÍO</div>
        : cartItems.map(item=>(
            <div key={item.cartId} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',marginBottom:10,borderRadius:12,border:`1px solid ${sc.primary}`,background:'rgba(0,0,0,0.5)'}}>
              <div>
                <div style={{fontFamily:'Rajdhani',fontSize:16,fontWeight:600,color:'#fff'}}>{item.name}</div>
                {/* Mostramos las variantes elegidas si existen */}
                {(item.size || item.color) && (
                    <div style={{fontFamily:'Rajdhani',fontSize:12,color:'#aaa', textTransform: 'uppercase'}}>
                        {item.size && `Talla: ${item.size}`} {item.size && item.color && ' | '} {item.color && `Color: ${item.color}`}
                    </div>
                )}
                <div style={{fontFamily:'Rajdhani',fontSize:14,color:sc.primary, marginTop: 4}}>Cant: {item.qty}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:16}}>
                <span style={{fontFamily:'Chakra Petch,sans-serif',fontSize:20,fontWeight:700,color:sc.primary}}>{(item.price*item.qty).toFixed(2)}€</span>
                <button onClick={()=>onRemove(item.cartId)} className="ts-btn" style={{background:'#FF2EF7',color:'#000',borderRadius:8,fontFamily:'Chakra Petch,sans-serif',fontWeight:700,fontSize:12,padding:'8px 12px'}}>QUITAR</button>
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
)};

const CalendarScreen = ({ onBack, sc }) => (
  <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontSize:24, color: sc.primary, fontFamily:'Chakra Petch'}}>CALENDARIO</div>
      <button onClick={onBack} className="ts-btn" style={{marginTop:20,background:sc.primary,color:'#000',padding:'12px 24px',borderRadius:8,fontWeight:700}}>VOLVER</button>
  </div>
);

/* ── TerminalShop Principal ── */
const TerminalShop = ({ initialItem, onUpdateTotal, activeSection }) => {
  // Ahora el carrito guarda objetos complejos para manejar las variantes
  const [cartObj, setCartObj] = useState({});
  const [search,  setSearch]  = useState('');
  const [preview, setPreview] = useState(null);
  const [screen,  setScreen]  = useState('main');
  const [showCatalog, setShowCatalog] = useState(false); // Controla el Iframe del Catálogo
  
  // Estados para Mapache IA e Inventario Real
  const [dbInventory, setDbInventory] = useState([]);
  const [mapacheMsg, setMapacheMsg] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [aiIds, setAiIds] = useState(null);

  const sc = SECTION[activeSection] || SECTION.products;
  const mainPrice = parsePrice(initialItem?.price);

  // 1. CARGAR INVENTARIO REAL DE SUPABASE
  useEffect(() => {
    const fetchInventory = async () => {
        if (!initialItem?.id) return;
        
        // Buscamos los assets que le pertenecen al dueño de esta terminal
        const { data, error } = await supabase.from('assets').select('*').eq('owner_id', initialItem.id);
        
        if (data && !error) {
            // Transformamos los datos de Supabase al formato que entiende la Terminal
            const formattedInventory = data.map(dbItem => ({
                id: dbItem.id,
                name: dbItem.title,
                price: parsePrice(dbItem.price_fiat),
                cat: dbItem.asset_type === 'product' ? 'ARTÍCULO' : (dbItem.asset_type === 'service' ? 'SERVICIO' : 'DIGITAL'),
                section: dbItem.asset_type === 'product' ? 'products' : (dbItem.asset_type === 'service' ? 'services' : 'assets'),
                desc: dbItem.description || '',
                sizes: dbItem.sizes || '',
                colors: dbItem.colors || ''
            }));
            setDbInventory(formattedInventory);
        }
    };
    fetchInventory();
  }, [initialItem]);

  // Mezclamos el producto "Main" (por si el usuario configuró uno rápido) con el inventario de la base de datos
  const INVENTORY = useMemo(() => {
    const base = [];
    if (initialItem?.name || initialItem?.alias) {
        base.push({
            id: 'main', 
            name: initialItem.name || initialItem.alias || 'Producto Base', 
            price: mainPrice, 
            cat: 'PRINCIPAL', 
            section: 'products',
            desc: initialItem.desc || ''
        });
    }
    return [...base, ...dbInventory];
  }, [initialItem, mainPrice, dbInventory]);

  // Filtrado de pantalla (Barra de búsqueda o Mapache IA)
  const filtered = useMemo(() => {
    if (aiIds && aiIds.length > 0) return INVENTORY.filter(p => aiIds.includes(p.id));
    
    return INVENTORY.filter(p => {
        const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase());
        const mn = search ? true : p.section === activeSection;
        return ms && mn;
    });
  }, [INVENTORY, search, activeSection, aiIds]);

  // Actualizar el total en PaymentModal
  useEffect(()=>{
    let t=0; Object.values(cartObj).forEach(item => { t += item.price * item.qty; }); 
    onUpdateTotal(t);
  },[cartObj, onUpdateTotal]);

  // ── FUNCIÓN AÑADIR AL CARRITO (Con Variantes) ──
  const addToCart = useCallback((item, size = null, color = null) => {
    // Creamos un ID único para el carrito (Ej: "5fe2a-M-Rojo")
    const cartId = `${item.id}-${size||'noSize'}-${color||'noColor'}`;
    
    setCartObj(prev => {
        const existingItem = prev[cartId];
        if (existingItem) {
            return { ...prev, [cartId]: { ...existingItem, qty: existingItem.qty + 1 } };
        } else {
            return { ...prev, [cartId]: { ...item, cartId, size, color, qty: 1 } };
        }
    });
  }, []);

  const removeFromCart = useCallback((cartId) => {
    setCartObj(prev => {
        const newCart = { ...prev };
        delete newCart[cartId];
        return newCart;
    });
  }, []);

  // ── MAPACHE IA SEARCH ──
  const handleMapacheSearch = async (e) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      setIsThinking(true); setMapacheMsg(null); setAiIds(null);
      
      try {
        const inventorySummary = INVENTORY.map(item => ({ id: item.id, name: item.name, cat: item.cat }));
        
        const rawResponse = await askGemini(search, 'shop_assistant', {
            rules: initialItem?.mapache_rules || '',
            inventory: inventorySummary
        });

        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Gemini no devolvió un JSON válido.");

        const aiData = JSON.parse(jsonMatch[0]);
        setMapacheMsg(aiData.message || "Aquí tienes, bro.");
        if (aiData.suggested_ids && Array.isArray(aiData.suggested_ids)) setAiIds(aiData.suggested_ids);

      } catch (error) {
         console.error("Error parseando IA:", error);
         setMapacheMsg("🔌 Bzzrt... Ha habido un cruce de cables. Pídemelo con otras palabras, bro.");
      } finally {
         setIsThinking(false); setSearch('');
      }
    }
  };

  const cartTotalAmount = Object.values(cartObj).reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartTotalItems = Object.values(cartObj).reduce((sum, item) => sum + item.qty, 0);

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',position:'relative', background:'transparent'}}>
      
      {/* Popups (Preview de Ficha Técnica) */}
      {preview && (
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',zIndex:25,backdropFilter:'blur(4px)'}} onClick={()=>setPreview(null)}>
          <div onClick={e=>e.stopPropagation()}><PreviewPopup item={preview} sc={sc} onAdd={addToCart} onClose={()=>setPreview(null)}/></div>
        </div>
      )}
      
      {/* ── HOLO-CATÁLOGO (IFRAME SEGURO CON AUTO-FORMATO) ── */}
      {showCatalog && initialItem?.catalog_url && (
        <div style={{
            position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', zIndex:40, 
            backdropFilter:'blur(10px)', display:'flex', flexDirection:'column', padding:'20px',
            animation: 'popIn 0.3s ease'
        }}>
            {/* Cabecera del Catálogo */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <div style={{fontFamily:'Chakra Petch', color:'#0EA5E9', fontSize:'20px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em'}}>
                        <span style={{marginRight:'10px'}}>👁️</span> VISOR DE HOLO-CATÁLOGO
                    </div>
                    {/* Botón de escape por si el iframe falla con webs de terceros */}
                    <a href={initialItem.catalog_url} target="_blank" rel="noopener noreferrer" style={{
                        color: '#aaa', fontSize: '10px', fontFamily: 'Rajdhani', textDecoration: 'underline', textTransform: 'uppercase'
                    }}>
                        ¿No se ve bien? Ábrelo en ventana externa ↗
                    </a>
                </div>
                
                <button onClick={() => setShowCatalog(false)} className="ts-btn" style={{
                    background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', 
                    fontFamily:'Rajdhani', fontWeight:700, padding:'8px 16px', borderRadius:'8px'
                }}>✕ CERRAR VISOR</button>
            </div>
            
            {/* Contenedor del Iframe usando la función limpiadora */}
            <div style={{flex:1, borderRadius:'12px', overflow:'hidden', border:'2px solid #0EA5E9', boxShadow:'0 0 30px rgba(14,165,233,0.3)', background:'#000'}}>
                <iframe 
                    src={formatEmbedUrl(initialItem.catalog_url)} 
                    width="100%" 
                    height="100%" 
                    style={{border: 'none'}}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    title="Catálogo Visual"
                />
            </div>
        </div>
      )}
      {/* Pantallas secundarias */}
      {screen==='cart'     && <CartScreen cartObj={cartObj} onRemove={removeFromCart} total={cartTotalAmount} onBack={()=>setScreen('main')} sc={sc}/>}
      {screen==='calendar' && <CalendarScreen onBack={()=>setScreen('main')} sc={sc}/>}

      {/* Pantalla Principal */}
      {screen==='main' && (
        <>
          {/* Diálogo de Mapache */}
          {(mapacheMsg || isThinking) && (
             <div style={{
                 margin: '20px 24px 0', padding: '16px', background: 'rgba(255,46,247,0.1)', 
                 border: '2px solid #FF2EF7', borderRadius: '12px', display: 'flex', gap: '16px',
                 alignItems: 'center', boxShadow: '0 0 20px rgba(255,46,247,0.3)', animation: 'popIn 0.3s ease'
             }}>
                 <span style={{fontSize: '32px'}}>🦝</span>
                 <div style={{fontFamily: 'Chakra Petch, sans-serif', color: '#FFF', fontSize: '16px', fontWeight: 600}}>
                     {isThinking ? <span className="animate-pulse text-fuchsia-400">Mapache está revisando el almacén...</span> : mapacheMsg}
                 </div>
                 {!isThinking && (
                     <button onClick={() => { setMapacheMsg(null); setAiIds(null); }} style={{
                         marginLeft: 'auto', background: 'transparent', border: '1px solid #FF2EF7', color: '#FF2EF7',
                         padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 'bold'
                     }}>✖</button>
                 )}
             </div>
          )}

          {/* Zona Principal de Productos (Tarjetas) */}
          <div className="ts-zone" style={{flex:1,overflowY:'auto',padding:'24px 16px',display:'flex',flexWrap:'wrap',gap:20,justifyContent:'center', alignContent:'flex-start'}}>
            {filtered.length===0
              ? <div style={{width:'100%',textAlign:'center',paddingTop:60,color:'rgba(255,255,255,0.3)',fontFamily:'Rajdhani',fontSize:20,fontWeight:600}}>SIN RESULTADOS / VACÍO</div>
              : filtered.map((item,i) => {
                  // Calculamos la cantidad total de este ID base en el carrito (sumando todas sus variantes)
                  const qtyInCart = Object.values(cartObj).filter(c => c.id === item.id).reduce((sum, c) => sum + c.qty, 0);
                  
                  return (
                    <Bubble key={item.id} item={item} sc={sc}
                        inCart={qtyInCart > 0} qty={qtyInCart}
                        onAdd={addToCart} onPreview={setPreview} idx={i} />
                  )
                })
            }
          </div>

          {/* Buscador y Controles (Abajo) */}
          <div style={{ flexShrink:0, padding:'20px 24px', borderTop:'2px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', gap:16, background:'rgba(0,0,0,0.4)' }}>
            
            {initialItem?.catalog_url && (
                <button 
                    onClick={() => setShowCatalog(true)}
                    className="ts-btn" 
                    style={{
                        width: '100%', padding:'12px', borderRadius:10, background:'rgba(14, 165, 233, 0.1)', border:'2px solid #0EA5E9',
                        color:'#0EA5E9', fontFamily:'Chakra Petch,sans-serif',fontSize:14,fontWeight:700,
                        textTransform:'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                    }}
                ><span>👁️</span> ABRIR HOLO-CATÁLOGO (VER FOTOS) ↗</button>
            )}

            <div style={{
              display:'flex',alignItems:'center',gap:12, background:'rgba(0,0,0,0.6)', 
              border:`2px solid ${isThinking ? '#FF2EF7' : 'rgba(255,255,255,0.1)'}`,
              borderRadius:12,padding:'12px 20px', transition: 'all 0.3s ease'
            }}>
              <span style={{color:sc.primary,fontSize:22}} className={isThinking ? 'animate-bounce' : ''}>🦝</span> 
              <input type="text" placeholder={`Dile a Mapache qué buscas y pulsa ENTER...`} value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={handleMapacheSearch} className="ts-search-input" style={{flex:1,background:'transparent',border:'none',outline:'none',color:'#fff', fontFamily:'Rajdhani,sans-serif',fontSize:16,fontWeight:600}}/>
            </div>

            <div style={{display:'flex', justifyContent:'center', gap: 16}}>
                <button onClick={()=>setScreen('cart')} className="ts-btn" style={{
                flex: 1, padding:'14px 20px',borderRadius:12, background: cartTotalItems>0 ? '#FFD000' : 'rgba(255,255,255,0.05)',
                border:`2px solid ${cartTotalItems>0 ? '#FFF' : 'rgba(255,255,255,0.2)'}`, color: cartTotalItems>0 ? '#000' : '#fff',
                fontFamily:'Chakra Petch,sans-serif',fontSize:16,fontWeight:700, textTransform:'uppercase', boxShadow: cartTotalItems>0 ? '0 0 20px rgba(255,208,0,0.6)' : 'none'
                }}>🛒 CARRITO {cartTotalItems>0?`(${cartTotalItems})`:''}</button>

                {activeSection==='services' && (
                <button onClick={()=>setScreen('calendar')} className="ts-btn" style={{
                    flex: 1, padding:'14px 20px',borderRadius:12, background:'#FF6B00', border:'2px solid #FFF',
                    color:'#000', fontFamily:'Chakra Petch,sans-serif',fontSize:16,fontWeight:700,
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