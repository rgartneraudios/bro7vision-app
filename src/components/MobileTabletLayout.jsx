import React, { useState, useRef, useEffect } from 'react';
import CityLocationBanner from './CityLocationBanner';
import AgentChatInput from './AgentChatInput';
import NeuralButton from './NeuralButton';

// ─── ESTILOS NEÓN ───────────────────────────────────────────────────────────
const MOBILE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;900&display=swap');

  .mobile-root { font-family: 'Outfit', sans-serif; }
  
  /* Gradiente orgánico tipo Pandora */
  .pandora-bg {
    background: radial-gradient(circle at 50% 100%, rgba(20, 40, 60, 0.8) 0%, rgba(0, 0, 0, 1) 100%);
  }

  /* Efecto de "Pulso de Vida" en los contenedores */
  .bio-glow {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 20, 30, 0.6);
    backdrop-filter: blur(12px);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.15), inset 0 0 10px rgba(0, 255, 255, 0.05);
    border-radius: 24px;
  }

  /* Letras con resplandor suave */
  .text-neon {
    text-shadow: 0 0 10px currentColor;
  }

  /* Scrollbar tipo raíz luminosa */
  .bro-scroll::-webkit-scrollbar-thumb { 
    background: linear-gradient(to bottom, #d946ef, #00ffff);
    border-radius: 10px; 
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

  // ── Estado local ──────────────────────────────────────────────────────────
  const [footerMode, setFooterMode]   = useState('chat');    // 'chat' | 'dpad'
  const [inputText,  setInputText]    = useState('');
  const [messages,   setMessages]     = useState([]);        // historial visual
  const [dpadActive, setDpadActive]   = useState(null);      // tecla activa para feedback
  const messagesEndRef = useRef(null);

  // ── Auto-scroll al nuevo mensaje ──────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, ososMensaje]);

  // ── Sincronizar respuesta del bot al historial visual ─────────────────────
  useEffect(() => {
    if (!ososMensaje) return;
    setMessages(prev => {
      // Evitar duplicados si ya está el último mensaje
      const last = prev[prev.length - 1];
      if (last?.text === ososMensaje && last?.from === 'bot') return prev;
      return [...prev, { from: 'bot', text: ososMensaje, ts: Date.now() }];
    });
  }, [ososMensaje]);

  // ── Enviar mensaje ────────────────────────────────────────────────────────
  const handleSend = () => {
    const txt = inputText.trim();
    if (!txt || ososLoading) return;
    setMessages(prev => [...prev, { from: 'user', text: txt, ts: Date.now() }]);
    handleOsosInput(txt);
    setInputText('');
  };

  // ── D-pad: emitir evento (Realtime se conecta aquí en P2) ─────────────────
  const handleDpad = (dir) => {
    setDpadActive(dir);
    setTimeout(() => setDpadActive(null), 150);
    // TODO P2: supabase.channel(user_id).send({ type:'broadcast', event:'nav', payload:{ dir } })
    console.log('[DPAD]', dir);
  };

  // ── Nombre del personaje activo ───────────────────────────────────────────
  const activeSector = navItems?.find(n => n.id === intent);
  const sectorLabel  = activeSector?.label || 'OSOS';

  // ── Color del sector activo para el acento ────────────────────────────────
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

  return (
    <div className="mobile-root relative w-screen h-screen overflow-hidden bg-black text-white select-none">
      <style>{MOBILE_STYLES}</style>

      {/* ── FONDO ── */}
      <div className="absolute inset-0 grid-bg opacity-60 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-0" />
      <div className="scanline z-[1]" />

      {/* ══════════════════════════════════════════
          PUERTA IZQUIERDA — SECTORES + NEURONAL
      ══════════════════════════════════════════ */}
      {isLeftOpen && (
        <div className="door-open-left fixed top-0 left-0 h-full w-[72vw] max-w-[280px] z-[200] flex flex-col bg-black/95 border-r border-cyan-500/30 neon-border"
             style={{ borderColor: `${accent}44` }}>

          {/* Header puerta */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <span className="mobile-display-font text-xl tracking-widest" style={{ color: accent }}>
              SECTORES
            </span>
            <button onClick={() => setIsLeftOpen(false)}
                    className="text-white/40 hover:text-white text-xl leading-none">✕</button>
          </div>

          {/* Lista de sectores */}
          <div className="flex-1 overflow-y-auto bro-scroll py-3 px-3 flex flex-col gap-2">
            {navItems?.map(item => {
              const isActive = intent === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { handleNavigation(item.id); setIsLeftOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all active:scale-95"
                  style={{
                    borderColor: isActive ? accent : 'rgba(255,255,255,0.1)',
                    background:  isActive ? `${accent}18` : 'rgba(0,0,0,0.4)',
                    boxShadow:   isActive ? `0 0 12px ${accent}33` : 'none',
                  }}>
                  {/* Emojis de personajes */}
                  <div className="flex -space-x-2 flex-shrink-0">
                    {item.images?.slice(0, 2).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-8 h-8 rounded-full border border-black/50 object-cover" />
                    ))}
                  </div>
                  <span className="mobile-display-font text-lg tracking-widest"
                        style={{ color: isActive ? accent : 'rgba(255,255,255,0.7)' }}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto text-xs" style={{ color: accent }}>◉</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer puerta — NeuralButton + Genesis */}
          <div className="p-4 border-t border-white/10 flex flex-col gap-3">
            {/* Saldo Génesis */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Génesis</span>
              <span className="text-cyan-400 font-black text-sm">{balances?.genesis ?? 0}</span>
            </div>

            {/* NeuralButton — activa WebLLM */}
            {NeuralButton && (
              <NeuralButton
                session={session}
                balances={balances}
                perfilOso={perfilOso}
              />
            )}

            <button onClick={handleLogout}
                    className="text-[10px] text-white/20 uppercase tracking-widest text-center hover:text-white/50 transition-colors">
              [ SALIR ]
            </button>
          </div>
        </div>
      )}

      {/* Overlay cierra puertas */}
      {(isLeftOpen || isRightOpen) && (
        <div className="fixed inset-0 z-[190] bg-black/40 backdrop-blur-sm"
             onClick={() => { setIsLeftOpen(false); setIsRightOpen(false); }} />
      )}

      {/* ══════════════════════════════════════════
          PUERTA DERECHA — D-PAD
      ══════════════════════════════════════════ */}
      {isRightOpen && (
        <div className="door-open-right fixed top-0 right-0 h-full w-[72vw] max-w-[280px] z-[200] flex flex-col bg-black/95 border-l border-cyan-500/30 neon-border">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <button onClick={() => setIsRightOpen(false)}
                    className="text-white/40 hover:text-white text-xl leading-none">✕</button>
            <span className="mobile-display-font text-xl tracking-widest text-cyan-400">MANDO</span>
          </div>

          {/* D-pad central */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2">

            {/* Info modo */}
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-4 text-center px-6">
              Navega la Smart TV<br/>con las flechas
            </p>

            {/* Fila superior */}
            <button className={`dpad-btn ${dpadActive === 'up' ? 'dpad-press' : ''}`}
                    onTouchStart={() => handleDpad('up')}
                    onClick={() => handleDpad('up')}>▲</button>

            {/* Fila media */}
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

            {/* Fila inferior */}
            <button className={`dpad-btn ${dpadActive === 'down' ? 'dpad-press' : ''}`}
                    onTouchStart={() => handleDpad('down')}
                    onClick={() => handleDpad('down')}>▼</button>

            {/* Separador */}
            <div className="w-16 h-px bg-white/10 my-4" />

            {/* Flechas audio — navegan videos en modo calle */}
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 text-center">
              Navegar audio
            </p>
            <div className="flex gap-3">
              <button className="dpad-btn" onClick={() => handleDpad('prev')}>⏮</button>
              <button className="dpad-btn" onClick={() => handleDpad('next')}>⏭</button>
            </div>

            {/* Badge Realtime pendiente */}
            <div className="mt-6 px-4 py-2 rounded-lg border border-white/10 bg-white/5">
              <p className="text-[9px] text-white/20 uppercase tracking-widest text-center">
                Realtime — próxima fase
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          LAYOUT PRINCIPAL
      ══════════════════════════════════════════ */}
      <main className="relative z-10 flex flex-col h-full w-full">

        {/* ── HEADER ── */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 pt-safe pt-3 pb-2">

          {/* Botón puerta izquierda */}
          <button
            onClick={() => { setIsLeftOpen(true); setIsRightOpen(false); }}
            className="flex flex-col gap-[5px] p-2 rounded-lg border border-white/10 bg-black/50 active:bg-white/10 transition-all"
            aria-label="Sectores">
            <span className="block w-5 h-[2px] rounded-full" style={{ background: accent }} />
            <span className="block w-3 h-[2px] bg-white/40 rounded-full" />
            <span className="block w-5 h-[2px] bg-white/20 rounded-full" />
          </button>

          {/* Sector activo + ciudad */}
          <div className="flex-1 mx-3 text-center">
            <div className="mobile-display-font text-2xl tracking-widest leading-none"
                 style={{ color: accent, textShadow: `0 0 12px ${accent}66` }}>
              {sectorLabel}
            </div>
            {scope?.city && (
              <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
                {scope.city}
              </div>
            )}
          </div>

          {/* Botón puerta derecha (D-pad) */}
          <button
            onClick={() => { setIsRightOpen(true); setIsLeftOpen(false); }}
            className="p-2 rounded-lg border border-cyan-500/20 bg-black/50 active:bg-cyan-500/10 transition-all text-cyan-500/60 text-xl leading-none"
            aria-label="Mando">
            ✛
          </button>
        </header>

        {/* ── CITY LOCATION BANNER ── */}
        {scope?.city && (
          <div className="flex-shrink-0 px-4 pb-1">
            <CityLocationBanner scope={scope} />
          </div>
        )}

        {/* ── DISPLAY CENTRAL — CHAT ── */}
        <section className="flex-1 overflow-y-auto bro-scroll px-4 py-2 flex flex-col gap-3">

          {/* Bienvenida si no hay mensajes */}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-4">
              <div className="mobile-display-font text-5xl tracking-widest leading-none"
                   style={{ color: accent, textShadow: `0 0 24px ${accent}55` }}>
                BRO7VISION
              </div>
              <p className="text-white/30 text-sm tracking-widest uppercase">
                Escribe para activar al personaje
              </p>
              {/* Emojis del sector activo */}
              <div className="flex gap-2 mt-2">
                {activeSector?.images?.map((img, i) => (
                  <img key={i} src={img} alt=""
                       className="w-12 h-12 rounded-full border-2 object-cover"
                       style={{ borderColor: `${accent}66` }} />
                ))}
              </div>
            </div>
          )}

          {/* Historial de mensajes */}
          {messages.map((msg, i) => (
            <div key={msg.ts ?? i}
                 className={`msg-in flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.from === 'user'
                  ? 'bg-white/10 border border-white/20 text-white rounded-br-sm'
                  : 'border text-white/90 rounded-bl-sm'
              }`}
              style={msg.from === 'bot' ? {
                background: `${accent}10`,
                borderColor: `${accent}33`,
                boxShadow:   `0 0 12px ${accent}11`,
              } : {}}>
                {msg.from === 'bot' && (
                  <div className="text-[9px] uppercase tracking-widest mb-1 font-black"
                       style={{ color: accent }}>
                    {sectorLabel}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {ososLoading && (
            <div className="msg-in flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm border text-sm"
                   style={{ background: `${accent}08`, borderColor: `${accent}22` }}>
                <div className="flex gap-1 items-center">
                  {[0,1,2].map(i => (
                    <span key={i} className="block w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{ background: accent, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        {/* ── FOOTER — ACORDEÓN CHAT / DPAD ── */}
        <footer className="flex-shrink-0 border-t pb-safe"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.92)' }}>

          {/* Toggle chat / gamepad */}
          <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => setFooterMode('chat')}
              className="flex-1 py-2.5 text-[10px] uppercase tracking-widest font-black transition-all"
              style={{
                color:        footerMode === 'chat' ? accent : 'rgba(255,255,255,0.25)',
                borderBottom: footerMode === 'chat' ? `2px solid ${accent}` : '2px solid transparent',
              }}>
              CHAT
            </button>
            <button
              onClick={() => setFooterMode('dpad')}
              className="flex-1 py-2.5 text-[10px] uppercase tracking-widest font-black transition-all"
              style={{
                color:        footerMode === 'dpad' ? '#00ffff' : 'rgba(255,255,255,0.25)',
                borderBottom: footerMode === 'dpad' ? '2px solid #00ffff' : '2px solid transparent',
              }}>
              MANDO
            </button>
          </div>

          {/* PANEL CHAT */}
          {footerMode === 'chat' && (
            <div className="accordion-open px-3 py-3 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Escribe..."
                disabled={ososLoading}
                className="flex-1 bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all"
                style={{
                  borderColor:  inputText ? `${accent}55` : 'rgba(255,255,255,0.1)',
                  boxShadow:    inputText ? `0 0 8px ${accent}22` : 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || ososLoading}
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-black font-black text-lg transition-all active:scale-90"
                style={{
                  background:   inputText.trim() && !ososLoading ? accent : 'rgba(255,255,255,0.1)',
                  boxShadow:    inputText.trim() ? `0 0 12px ${accent}55` : 'none',
                  color:        inputText.trim() ? 'black' : 'rgba(255,255,255,0.2)',
                }}>
                ▶
              </button>
            </div>
          )}

          {/* PANEL DPAD COMPACTO (footer) */}
          {footerMode === 'dpad' && (
            <div className="accordion-open px-3 py-2 flex items-center justify-center gap-2">
              {/* Flechas izquierda/derecha para navegar videos */}
              <button className="dpad-btn" style={{ width: 44, height: 44 }}
                      onClick={() => handleDpad('prev')}>⏮</button>
              <button className="dpad-btn" style={{ width: 44, height: 44 }}
                      onClick={() => handleDpad('left')}>◄</button>
              <button className="dpad-ok" style={{ width: 44, height: 44, fontSize: 10 }}
                      onClick={() => handleDpad('enter')}>OK</button>
              <button className="dpad-btn" style={{ width: 44, height: 44 }}
                      onClick={() => handleDpad('right')}>►</button>
              <button className="dpad-btn" style={{ width: 44, height: 44 }}
                      onClick={() => handleDpad('next')}>⏭</button>
              {/* Botón abrir puerta derecha (D-pad completo con arriba/abajo) */}
              <button
                onClick={() => { setIsRightOpen(true); }}
                className="dpad-btn" style={{ width: 44, height: 44, fontSize: 12 }}>✛</button>
            </div>
          )}
        </footer>
      </main>

      {/* ── CHILDREN (modales de sector, banners, etc.) ── */}
      {children}
    </div>
  );
};

export default MobileTabletLayout;
