import React, { useState, useRef, useEffect } from 'react';
import CityLocationBanner from './CityLocationBanner';
import AgentChatInput from './AgentChatInput';
import NeuralButton from './NeuralButton';

// ─── ESTILOS NEÓN ───────────────────────────────────────────────────────────
const MOBILE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Bebas+Neue&family=Courier+New&display=swap');

  .mobile-root { font-family: 'Share Tech Mono', monospace; }
  .mobile-display-font { font-family: 'Bebas Neue', sans-serif; }

  /* ESTILO ENORME TIPO BANNER */
  .huge-neon-text {
    font-family: 'Courier New', monospace;
    color: #fff;
    font-style: italic;
    font-weight: 900;
    text-transform: uppercase;
    font-size: clamp(24px, 8vw, 42px);
    line-height: 1.2;
    text-align: center;
  }

  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  .scanline {
    position: absolute; top: 0; left: 0; width: 100%; height: 40px;
    background: linear-gradient(to bottom, transparent, rgba(0,255,255,0.04), transparent);
    animation: scanline 6s linear infinite;
    pointer-events: none; z-index: 1;
  }

  @keyframes neon-pulse {
    0%,100% { box-shadow: 0 0 8px rgba(0,255,255,0.4), 0 0 20px rgba(0,255,255,0.1); }
    50%      { box-shadow: 0 0 16px rgba(0,255,255,0.7), 0 0 40px rgba(0,255,255,0.2); }
  }
  .neon-border { animation: neon-pulse 3s ease-in-out infinite; }

  @keyframes door-slide-left {
    from { transform: translateX(-100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  @keyframes door-slide-right {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  .door-open-left  { animation: door-slide-left  0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
  .door-open-right { animation: door-slide-right 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }

  @keyframes msg-in {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  .msg-in { animation: msg-in 0.3s ease-out forwards; }

  @keyframes accordion-open {
    from { max-height: 0;   opacity: 0; }
    to   { max-height: 90px; opacity: 1; }
  }
  .accordion-open { animation: accordion-open 0.2s ease-out forwards; overflow: hidden; }

  @keyframes dpad-press {
    0%,100% { transform: scale(1); }
    50%      { transform: scale(0.88); }
  }
  .dpad-press { animation: dpad-press 0.15s ease-in-out; }

  /* Scrollbar neón */
  .bro-scroll::-webkit-scrollbar       { width: 3px; }
  .bro-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.4); }
  .bro-scroll::-webkit-scrollbar-thumb { background: #00ffff; border-radius: 4px; box-shadow: 0 0 6px #00ffff; }

  .dpad-btn {
    width: 56px; height: 56px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 12px;
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(0,255,255,0.25);
    color: rgba(0,255,255,0.8);
    font-size: 20px;
    cursor: pointer;
    transition: all 0.1s;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .dpad-btn:active {
    background: rgba(0,255,255,0.15);
    border-color: rgba(0,255,255,0.7);
    box-shadow: 0 0 12px rgba(0,255,255,0.4);
  }
  .dpad-ok {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: rgba(0,255,255,0.1);
    border: 2px solid rgba(0,255,255,0.5);
    color: #00ffff;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all 0.1s;
    box-shadow: 0 0 10px rgba(0,255,255,0.2);
    -webkit-tap-highlight-color: transparent;
  }
  .dpad-ok:active {
    background: rgba(0,255,255,0.3);
    box-shadow: 0 0 20px rgba(0,255,255,0.6);
  }
`;

// ─── COMPONENTE ─────────────────────────────────────────────────────────────
const MobileTabletLayout = ({
  children,
  scope,
  step, setStep,
  intent, setIntent,
  session,
  balances,
  navItems,
  handleNavigation,
  ososMensaje,
  ososLoading,
  handleOsosInput,
  ososModo,
  perfilOso,
  setShowBooster,
  setShowWalletModal,
  handleLogout,
  isLeftOpen,  setIsLeftOpen,
  isRightOpen, setIsRightOpen,
  ...props
}) => {

  const[footerMode, setFooterMode]   = useState('chat');
  const [inputText,  setInputText]    = useState('');
  const [messages,   setMessages]     = useState([]);
  const[dpadActive, setDpadActive]   = useState(null);

  useEffect(() => {
    if (!ososMensaje) return;
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.text === ososMensaje && last?.from === 'bot') return prev;
      return[...prev, { from: 'bot', text: ososMensaje, ts: Date.now() }];
    });
  },[ososMensaje]);

  const handleSend = () => {
    const txt = inputText.trim();
    if (!txt || ososLoading) return;
    setMessages(prev =>[...prev, { from: 'user', text: txt, ts: Date.now() }]);
    handleOsosInput(txt);
    setInputText('');
  };

  const handleDpad = (dir) => {
    setDpadActive(dir);
    setTimeout(() => setDpadActive(null), 150);
    console.log('[DPAD]', dir);
  };

  const activeSector = navItems?.find(n => n.id === intent);
  const sectorLabel  = activeSector?.label || 'OSOS';

  const SECTOR_ACCENT = {
    gps:             '#d946ef',
    productos:       '#facc15',
    servicios:       '#f43f5e',
    avisos:          '#94a3b8',
    lives:           '#22d3ee',
    internal_search: '#fb923c',
    ai:              '#a3e635',
    game:            '#ffffff',
  };
  const accent = SECTOR_ACCENT[intent] || '#00ffff';

  // Solo mostraremos el último mensaje en pantalla
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div className="mobile-root relative w-screen h-screen overflow-hidden bg-black text-white select-none">
      <style>{MOBILE_STYLES}</style>

      {/* ── FONDO WEBP ── */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: "url('/images/mobile.webp')" }} 
      />
      <div className="absolute inset-0 bg-black/10 z-0 backdrop-blur-[2px]" />
      <div className="scanline z-[1]" />

      {/* ── GATILLOS PUERTAS (Estilo PC) ── */}
      <button 
        onClick={() => { setIsLeftOpen(!isLeftOpen); setIsRightOpen(false); }} 
        className="fixed top-0 -translate-y-1/2 z-[210] h-24 w-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-r-2xl flex items-center justify-center transition-all duration-300"
        style={{ left: isLeftOpen ? 'min(72vw, 280px)' : '0' }}
      >
        <span className="text-cyan-400 text-xs">{isLeftOpen ? '◀' : '▶'}</span>
      </button>

      <button 
        onClick={() => { setIsRightOpen(!isRightOpen); setIsLeftOpen(false); }} 
        className="fixed top-0 -translate-y-1/2 z-[210] h-24 w-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-l-2xl flex items-center justify-center transition-all duration-300"
        style={{ right: isRightOpen ? 'min(72vw, 280px)' : '0' }}
      >
        <span className="text-fuchsia-400 text-xs">{isRightOpen ? '▶' : '◀'}</span>
      </button>


      {/* ── PUERTA IZQUIERDA (Wallet, Botón Neuronal, Mando) ── */}
      {isLeftOpen && (
        <div className="door-open-left fixed top-0 left-0 h-full w-[72vw] max-w-[280px] z-[200] flex flex-col bg-black/95 border-r border-cyan-500/30 neon-border"
             style={{ borderColor: `${accent}44` }}>
          
          {/* Header Izquierdo: Wallet Más Grande y Neural Button */}
          <div className="p-4 border-b border-white/10 flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center py-4 px-2 rounded-xl bg-cyan-900/10 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
              <span className="text-[12px] text-cyan-200/60 uppercase tracking-widest mb-1">Génesis Wallet</span>
              <span className="text-cyan-400 font-black text-4xl drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]">
                {balances?.genesis ?? 0}
              </span>
            </div>
            {NeuralButton && (
              <NeuralButton session={session} balances={balances} perfilOso={perfilOso} />
            )}
          </div>

          {/* Cuerpo Izquierdo: Controles del Mando */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2 relative">
            <span className="mobile-display-font text-2xl tracking-widest text-cyan-400/30 absolute top-4">MANDO</span>
            
            <button className={`dpad-btn ${dpadActive === 'up' ? 'dpad-press' : ''}`}
                    onTouchStart={() => handleDpad('up')}
                    onClick={() => handleDpad('up')}>▲</button>
            <div className="flex items-center gap-2">
              <button className={`dpad-btn ${dpadActive === 'left' ? 'dpad-press' : ''}`}
                      onTouchStart={() => handleDpad('left')}
                      onClick={() => handleDpad('left')}>◄</button>
              <button className={`dpad-ok ${dpadActive === 'enter' ? 'dpad-press' : ''}`}
                      onTouchStart={() => handleDpad('enter')}
                      onClick={() => handleDpad('enter')}>OK</button>
              <button className={`dpad-btn ${dpadActive === 'right' ? 'dpad-press' : ''}`}
                      onTouchStart={() => handleDpad('right')}
                      onClick={() => handleDpad('right')}>►</button>
            </div>
            <button className={`dpad-btn ${dpadActive === 'down' ? 'dpad-press' : ''}`}
                    onTouchStart={() => handleDpad('down')}
                    onClick={() => handleDpad('down')}>▼</button>
            <div className="w-16 h-px bg-white/10 my-4" />
            <div className="flex gap-3">
              <button className="dpad-btn" onClick={() => handleDpad('prev')}>⏮</button>
              <button className="dpad-btn" onClick={() => handleDpad('next')}>⏭</button>
            </div>
          </div>

          {/* Footer Izquierdo: Salir */}
          <div className="p-4 border-t border-white/10">
            <button onClick={handleLogout}
                    className="w-full text-[12px] text-red-400/40 uppercase tracking-widest text-center hover:text-red-400/80 transition-colors">
              [ SALIR ]
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar ambas puertas al hacer clic fuera */}
      {(isLeftOpen || isRightOpen) && (
        <div className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-md"
             onClick={() => { setIsLeftOpen(false); setIsRightOpen(false); }} />
      )}

      {/* ── PUERTA DERECHA (Sólo Sectores) ── */}
      {isRightOpen && (
        <div className="door-open-right fixed top-0 right-0 h-full w-[72vw] max-w-[280px] z-[200] flex flex-col bg-black/95 border-l border-cyan-500/30 neon-border"
             style={{ borderColor: `${accent}44` }}>
          <div className="flex items-center justify-center px-4 py-4 border-b border-white/10">
            <span className="mobile-display-font text-2xl tracking-widest" style={{ color: accent }}>
              SECTORES
            </span>
          </div>
          <div className="flex-1 overflow-y-auto bro-scroll py-3 px-3 flex flex-col gap-2">
            {navItems?.map(item => {
              const isActive = intent === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { handleNavigation(item.id); setIsRightOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all active:scale-95"
                  style={{
                    borderColor: isActive ? accent : 'rgba(255,255,255,0.1)',
                    background:  isActive ? `${accent}18` : 'rgba(0,0,0,0.4)',
                    boxShadow:   isActive ? `0 0 12px ${accent}33` : 'none',
                  }}>
                  <div className="flex -space-x-2 flex-shrink-0">
                    {item.images?.slice(0, 2).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-8 h-8 rounded-full border border-black/50 object-cover" />
                    ))}
                  </div>
                  <span className="mobile-display-font text-xl tracking-widest"
                        style={{ color: isActive ? accent : 'rgba(255,255,255,0.7)' }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LAYOUT PRINCIPAL ── */}
      <main className="relative z-10 flex flex-col h-full w-full">

        {/* Encabezado Limpio (sin los antiguos botones para abrir las puertas ya que usamos los gatillos) */}
        <header className="flex-shrink-0 flex items-center justify-center px-4 pt-safe pt-6 pb-2">
          <div className="mobile-display-font text-4xl tracking-widest leading-none text-center"
               style={{ color: accent, textShadow: `0 0 16px ${accent}` }}>
            {sectorLabel}
          </div>
        </header>

      {scope?.city && (
          <div className="flex-shrink-0 w-full mt-8 mb-2 flex items-center justify-center">
            <CityLocationBanner scope={scope} isMobile={true} />
          </div>
        )}
        
        
        {/* ── DISPLAY CENTRAL — CHAT UNICO SIN FONDOS ── */}
        <section className="flex-1 overflow-y-auto bro-scroll px-6 py-4 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            
            {/* Si no hay mensajes */}
            {messages.length === 0 && !ososLoading && (
              <div className="flex flex-col items-center text-center gap-6 animate-pulse">
                <div className="huge-neon-text"
                     style={{ color: accent, textShadow: `0 0 12px ${accent}, 0 0 24px ${accent}` }}>
                  BRO7VISION
                </div>
                <p className="text-white/60 text-xl tracking-widest uppercase font-black">
                  ESCRIBE PARA INICIAR
                </p>
              </div>
            )}

            {/* Mostrar Solo el último mensaje flotando (sin cajas) */}
            {lastMessage && !ososLoading && (
              <div key={lastMessage.ts} className="msg-in flex flex-col items-center text-center w-full">
                {lastMessage.from === 'bot' && (
                  <div className="text-xl uppercase tracking-widest mb-4 font-black"
                       style={{ color: accent }}>
                    [ {sectorLabel} ]
                  </div>
                )}
                
                <p className="huge-neon-text whitespace-pre-wrap break-words w-full"
                   style={{
                     color: lastMessage.from === 'bot' ? '#fff' : 'rgba(255,255,255,0.5)',
                     textShadow: lastMessage.from === 'bot' 
                        ? `0 0 12px ${accent}, 0 0 24px ${accent}` 
                        : 'none'
                   }}>
                  {lastMessage.text}
                </p>
              </div>
            )}

            {/* Animación Sintonizando (Loading) */}
            {ososLoading && (
              <div className="msg-in flex flex-col items-center justify-center w-full gap-6">
                <div className="text-2xl uppercase tracking-widest font-black" style={{ color: accent, textShadow: `0 0 16px ${accent}` }}>
                  SINTONIZANDO...
                </div>
                <div className="flex gap-4 items-center">
                  {[0,1,2].map(i => (
                    <span key={i} className="block w-5 h-5 rounded-full animate-bounce"
                          style={{ background: accent, animationDelay: `${i * 0.15}s`, boxShadow: `0 0 16px ${accent}` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── FOOTER — CAJON ENORME TRANSPARENTE ── */}
        <footer className="flex-shrink-0 border-t backdrop-blur-md pb-safe"
                style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)' }}>

          <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <button onClick={() => setFooterMode('chat')}
              className="flex-1 py-4 text-sm uppercase tracking-widest font-black transition-all"
              style={{
                color:        footerMode === 'chat' ? accent : 'rgba(255,255,255,0.3)',
                borderBottom: footerMode === 'chat' ? `3px solid ${accent}` : '3px solid transparent',
              }}>
              CHAT
            </button>
            <button onClick={() => setFooterMode('dpad')}
              className="flex-1 py-4 text-sm uppercase tracking-widest font-black transition-all"
              style={{
                color:        footerMode === 'dpad' ? '#00ffff' : 'rgba(255,255,255,0.3)',
                borderBottom: footerMode === 'dpad' ? '3px solid #00ffff' : '3px solid transparent',
              }}>
              MANDO
            </button>
          </div>

          {footerMode === 'chat' && (
            <div className="accordion-open px-4 py-4 flex items-center gap-3">
              {/* Input gigante transparente */}
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="ESCRIBE AQUÍ..."
                disabled={ososLoading}
                className="flex-1 bg-transparent border-b-2 px-2 py-3 text-2xl font-black text-center text-white placeholder-white/30 outline-none transition-all uppercase"
                style={{
                  fontFamily: "'Courier New', monospace",
                  borderColor: inputText ? accent : 'rgba(255,255,255,0.2)',
                  textShadow: inputText ? `0 0 8px ${accent}` : 'none'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || ososLoading}
                className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-black font-black text-2xl transition-all active:scale-90"
                style={{
                  background:   inputText.trim() && !ososLoading ? accent : 'rgba(255,255,255,0.1)',
                  boxShadow:    inputText.trim() ? `0 0 16px ${accent}` : 'none',
                  color:        inputText.trim() ? 'black' : 'rgba(255,255,255,0.3)',
                }}>
                ▶
              </button>
            </div>
          )}

          {footerMode === 'dpad' && (
            <div className="accordion-open px-4 py-4 flex items-center justify-center gap-3">
              <button className="dpad-btn" style={{ width: 50, height: 50 }} onClick={() => handleDpad('prev')}>⏮</button>
              <button className="dpad-btn" style={{ width: 50, height: 50 }} onClick={() => handleDpad('left')}>◄</button>
              <button className="dpad-ok"  style={{ width: 50, height: 50, fontSize: 12 }} onClick={() => handleDpad('enter')}>OK</button>
              <button className="dpad-btn" style={{ width: 50, height: 50 }} onClick={() => handleDpad('right')}>►</button>
              <button className="dpad-btn" style={{ width: 50, height: 50 }} onClick={() => handleDpad('next')}>⏭</button>
            </div>
          )}
        </footer>
      </main>

      {children}
    </div>
  );
};

export default MobileTabletLayout;