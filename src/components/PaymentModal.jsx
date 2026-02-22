import React, { useState } from 'react';
import { MOON_MATRIX } from '../data/MoonMatrix';
import TerminalShop, { TERMINAL_CSS, SECTION } from './TerminalShop';

const parsePrice = (input) => {
  if (input === null || input === undefined) return 0;
  if (typeof input === 'number') return input;
  const s = String(input).replace('€','').replace(',','.').trim();
  return isNaN(parseFloat(s)) ? 0 : parseFloat(s);
};

const MODAL_CSS = `
  ${TERMINAL_CSS}

  @keyframes modalIn { from{opacity:0;transform:scale(0.98) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes fadeBack { from{opacity:0} to{opacity:1} }

  .pm-btn    { transition:all 0.2s ease; cursor:pointer; border:none; outline:none; text-shadow:none !important; }
  .pm-btn:hover { filter:brightness(1.15); transform:translateY(-2px); }
  
  .pm-moon   { transition:all 0.2s ease; cursor:pointer; text-shadow:none !important; }
  .pm-moon:hover { filter:brightness(1.15); transform:translateY(-2px); }

  /* Mobile layout horizontal */
  @media (max-width: 950px) {
    .pm-body   { flex-direction: column !important; overflow-y: auto !important; }
    .pm-center { order: 1; flex: 0 0 auto !important; width: 100% !important; min-height: 500px !important; }
    
    .pm-left, .pm-right { 
      order: 2; width: 100% !important; height: auto !important; 
      flex-direction: row !important; flex-wrap: wrap !important; 
      border: none !important; border-top: 2px solid rgba(255,255,255,0.1) !important; 
      padding: 20px !important; gap: 16px !important;
    }
    .pm-moon-card { flex: 1 1 200px !important; min-width: 180px !important; }
    .pm-ctrl-btn  { flex: 1 1 200px !important; min-width: 180px !important; }
  }
`;

const COINS = [
  { key:'nova',       emoji:'🌑', color:'#A855F7', glow:'rgba(168,85,247,0.8)', label:'NOVA'     },
  { key:'crescens',   emoji:'🌙', color:'#0EA5E9', glow:'rgba(14,165,233,0.8)', label:'CRESCENS' },
  { key:'plena',      emoji:'🌕', color:'#FFD000', glow:'rgba(255,208,0,0.8)',  label:'PLENA'    },
  { key:'decrescens', emoji:'🌗', color:'#F97316', glow:'rgba(249,115,22,0.8)', label:'DECRESC.' },
];

const PaymentModal = ({ isOpen, onClose, product, balances, currentPhase, onConfirmPayment, onLaunch }) => {
  if (!isOpen || !product) return null;

  const [activeTab,          setActiveTab]          = useState('products');
  const [dynamicTotal,       setDynamicTotal]       = useState(0);
  const [deliveryMode,       setDeliveryMode]       = useState('pickup');
  const [selectedCoin,       setSelectedCoin]       = useState(currentPhase||'plena');

  const sc = SECTION[activeTab] || SECTION.products;
  const baseFiatTotal   = parsePrice(dynamicTotal) + (deliveryMode==='delivery' ? 2.00 : 0);
  const activePhaseOut  = MOON_MATRIX?.[currentPhase||'plena']?.OUT || 1;

  const selCoinData = COINS.find(c=>c.key===selectedCoin) || COINS[2];

  /* ── Tarjetas Lunas Horizontales (FLEX: 1 PARA LLENAR EL ESPACIO) ── */
  const MoonCard = ({ coin }) => {
    const isSel   = selectedCoin===coin.key;
    const userBal = balances?.[coin.key] || 0;

    return (
      <div className="pm-moon pm-moon-card" onClick={()=>setSelectedCoin(coin.key)} style={{
        flex: 1, // <--- Esto hace que crezcan y eliminen el espacio vacío
        width:'100%', padding:'16px 20px', borderRadius:16,
        background: coin.color,
        filter: isSel ? 'brightness(1) saturate(1.1)' : 'brightness(0.5) saturate(0.8)',
        border: `3px solid ${isSel ? '#FFF' : 'transparent'}`,
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
        boxShadow: isSel ? `0 0 24px ${coin.glow}` : 'none',
        color: '#000', minHeight: 80
      }}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{fontSize:36, lineHeight:1}}>{coin.emoji}</span>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
                <span style={{fontSize:18,fontFamily:'Rajdhani,sans-serif',fontWeight:800,textTransform:'uppercase'}}>{coin.label}</span>
                <span style={{fontSize:14,fontFamily:'Rajdhani,sans-serif',fontWeight:600,opacity:0.8}}>BAL: {userBal}</span>
            </div>
        </div>
        
        <div style={{background:'rgba(255,255,255,0.4)', padding:'6px 12px', borderRadius:10}}>
            <span style={{fontSize:20,fontWeight:800,fontFamily:'Chakra Petch,sans-serif'}}>
                {(baseFiatTotal * (MOON_MATRIX?.[coin.key]?.OUT || 1)).toFixed(2)}€
            </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{MODAL_CSS}</style>

      {/* Fondo cristalino */}
      <div style={{position:'fixed',inset:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',animation:'fadeBack 0.3s ease'}}>
        <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(12px)'}}/>

        {/* CONTENEDOR PRINCIPAL */}
        <div style={{
          position:'relative', width:'min(1400px, 98vw)', height:'min(850px, 94vh)',
          display:'flex',flexDirection:'column',
          background:'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
          borderRadius:24, overflow:'hidden', border:`2px solid rgba(255,255,255,0.1)`,
          boxShadow:`0 0 40px rgba(0,0,0,0.9), inset 0 0 50px rgba(255,255,255,0.03)`,
          animation:'modalIn 0.3s ease',
        }}>

          {/* ── HEADER ── */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 30px',background:'rgba(0,0,0,0.5)',borderBottom:'2px solid rgba(255,255,255,0.05)',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:48,height:48,borderRadius:'50%',border:`2px solid ${sc.primary}`,overflow:'hidden',boxShadow:`0 0 16px ${sc.glow}`}}>
                <img src={product.avatar_url||product.img} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.src='https://placehold.co/100/121218/FFD000?text=B7'} alt="av"/>
              </div>
              <div>
                <div style={{fontSize:22,fontWeight:700,fontFamily:'Chakra Petch,sans-serif',color:'#fff',textTransform:'uppercase',letterSpacing:'0.05em'}}>BROVÍSION 7</div>
              </div>
            </div>
            <button className="pm-close" onClick={onClose} style={{background:'rgba(255,255,255,0.1)',border:'none',color:'#fff',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,padding:'10px 20px',borderRadius:10,textTransform:'uppercase'}}>✕ CERRAR</button>
          </div>

          {/* ── SECTION TABS ── */}
          <div style={{display:'flex',gap:16,padding:'20px 30px',background:'rgba(0,0,0,0.3)',borderBottom:'2px solid rgba(255,255,255,0.05)',flexShrink:0}}>
            {['products','services','assets'].map(key=>{
              const s = SECTION[key];
              const active = activeTab===key;
              return (
                <button key={key} className="pm-btn" onClick={()=>setActiveTab(key)} style={{
                  flex:1,padding:'16px',borderRadius:14,
                  background: active ? s.primary : 'rgba(255,255,255,0.05)',
                  color: active ? '#000' : s.primary,
                  fontFamily:'Chakra Petch,sans-serif',fontSize:18,fontWeight:700,
                  border:`2px solid ${active ? '#fff' : 'transparent'}`,
                  boxShadow: active ? `0 0 20px ${s.glow}` : 'none',
                }}>{s.label}</button>
              );
            })}
          </div>

          {/* ── BODY ── */}
          <div className="pm-body" style={{flex:1,display:'flex',overflow:'hidden'}}>

            {/* ── LUNAS (PANEL IZQUIERDO AMPLIADO) ── */}
            <div className="pm-left" style={{
              flex: 1, maxWidth: 360, // Ancho generoso
              borderRight:'2px solid rgba(255,255,255,0.05)', background:'rgba(0,0,0,0.3)', 
              display:'flex',flexDirection:'column', padding:'24px', gap:16, overflowY:'auto',
            }}>
              <div style={{fontSize:14,fontFamily:'Rajdhani',fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.1em'}}>TIPO DE MONEDA</div>
              {/* Aquí las lunas se expanden ocupando todo gracias al flex: 1 del componente MoonCard */}
              {COINS.map(coin=><MoonCard key={coin.key} coin={coin}/>)}
            </div>

            {/* ── TERMINAL SHOP (CENTRO CUADRADO/COMPACTO) ── */}
            <div className="pm-center" style={{
              flex: '0 0 auto', width: '100%', maxWidth: 680, // Limita el ancho para que parezca una terminal cuadrada central
              margin: '0 auto', // Centra la terminal en el medio
              overflow:'hidden', display:'flex',flexDirection:'column'
            }}>
                <TerminalShop initialItem={product} onUpdateTotal={setDynamicTotal} activeSection={activeTab} />
            </div>

            {/* ── CONTROLES Y STRIPE (PANEL DERECHO AMPLIADO) ── */}
            <div className="pm-right" style={{
              flex: 1, maxWidth: 360, // Simetría con el panel izquierdo
              borderLeft:'2px solid rgba(255,255,255,0.05)', background:'rgba(0,0,0,0.3)', 
              display:'flex',flexDirection:'column', padding:'24px', gap:16, overflowY:'auto',
            }}>
              <div style={{fontSize:14,fontFamily:'Rajdhani',fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.1em'}}>TIPO DE ENTREGA</div>
              
              {/* RECOGER (flex:1 para rellenar igual que lunas) */}
              <button className="pm-btn pm-ctrl-btn" onClick={()=>setDeliveryMode('pickup')} style={{
                flex: 1, width:'100%',padding:'16px',borderRadius:16, background: '#00E5FF',
                filter: deliveryMode==='pickup' ? 'brightness(1)' : 'brightness(0.5)',
                border:`3px solid ${deliveryMode==='pickup'?'#FFF':'transparent'}`,
                color: '#000', fontFamily:'Chakra Petch,sans-serif',fontSize:18,fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:12,
                boxShadow: deliveryMode==='pickup' ? '0 0 24px rgba(0,229,255,0.6)' : 'none', minHeight: 80
              }}><span style={{fontSize:28}}>⚡</span> RECOGER TIENDA</button>

              {/* ENVÍO (flex:1) */}
              <button className="pm-btn pm-ctrl-btn" onClick={()=>setDeliveryMode('delivery')} style={{
                flex: 1, width:'100%',padding:'16px',borderRadius:16, background: '#FF6B00',
                filter: deliveryMode==='delivery' ? 'brightness(1)' : 'brightness(0.5)',
                border:`3px solid ${deliveryMode==='delivery'?'#FFF':'transparent'}`,
                color: '#000', fontFamily:'Chakra Petch,sans-serif',fontSize:18,fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:12,
                boxShadow: deliveryMode==='delivery' ? '0 0 24px rgba(255,107,0,0.6)' : 'none', minHeight: 80
              }}><span style={{fontSize:28}}>📦</span> ENVÍO (+2€)</button>

              <div style={{padding:'16px 0', textAlign:'center'}}>
                <div style={{fontSize:14,fontFamily:'Rajdhani',fontWeight:700,color:'#fff',textTransform:'uppercase'}}>TOTAL FIAT</div>
                <div style={{fontSize:36,fontWeight:700,fontFamily:'Chakra Petch',color:'#fff'}}>{baseFiatTotal.toFixed(2)}€</div>
              </div>

              {/* PAGAR COINS (flex:1) */}
              <button className="pm-btn pm-ctrl-btn" onClick={()=>onConfirmPayment(selectedCoin, 0, product)} style={{
                flex: 1, width:'100%',padding:'16px',borderRadius:16, background:'#FF2EF7',color:'#000', border:'3px solid #FFF',
                fontFamily:'Chakra Petch,sans-serif',fontSize:20,fontWeight:700, textTransform:'uppercase',
                boxShadow:`0 0 24px rgba(255,46,247,0.8)`, display:'flex', alignItems:'center', justifyContent:'center', gap:10, minHeight: 80
              }}>
                {selCoinData.emoji} PAGAR COINS
              </button>

              {/* STRIPE RECUPERADO (flex:1) */}
              <button className="pm-btn pm-ctrl-btn" onClick={()=>onConfirmPayment('stripe', baseFiatTotal, product)} style={{
                flex: 1, width:'100%',padding:'16px',borderRadius:16, background:'#6366F1',color:'#FFF', border:'3px solid #FFF',
                fontFamily:'Chakra Petch,sans-serif',fontSize:20,fontWeight:700, textTransform:'uppercase',
                boxShadow:`0 0 24px rgba(99,102,241,0.8)`, display:'flex', alignItems:'center', justifyContent:'center', gap:10, minHeight: 80
              }}>
                💳 PAGAR STRIPE
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;