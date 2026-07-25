import React, { useState, useRef, useEffect, useMemo } from 'react';
import CityLocationBanner from './CityLocationBanner';
import AgentChatInput from './AgentChatInput';
import NeuralButton from './NeuralButton';
import BroTuner from '../components/BroTuner';
import { getMoonSuffix } from '../utils/moonUtils';
import { buildBgVideoName, getTurno } from '../data/citycodes';
import { useAdOverlay } from '../hooks/useAdOverlay';
import CuponModal from './CuponModal';
import { useCanjearCupon } from '../hooks/useCanjearCupon';
import { useHaloTrivia } from '../hooks/useHaloTrivia';
import GenesisCounter from './GenesisCounter';

// ─── ESTILOS NEÓN ───────────────────────────────────────────────────────────
const MOBILE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Bebas+Neue&family=Courier+New&display=swap');

  .mobile-root { 
    font-family: 'Share Tech Mono', monospace; 
    height: 100%;
    min-height: 100dvh; 
    display: flex;
    flex-direction: column;
  }
  .mobile-display-font { font-family: 'Bebas Neue', sans-serif; }

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

  /* ── RELOJ PANTALLA BLOQUEO ── */
  .lock-clock {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(52px, 18vw, 88px);
    line-height: 1;
    letter-spacing: 0.04em;
    color: #fff;
    text-shadow: 0 0 30px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.8);
  }
  .lock-date {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(10px, 3vw, 13px);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
  }
  .lock-temp {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(22px, 7vw, 36px);
    letter-spacing: 0.06em;
    color: rgba(255,255,255,0.85);
    text-shadow: 0 0 16px rgba(255,255,255,0.3);
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
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .accordion-open { animation: accordion-open 0.2s ease-out forwards; }

  @keyframes burbuja-in {
    from { opacity: 0; transform: translateY(20px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  .burbuja-in { animation: burbuja-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }

  @keyframes dpad-press {
    0%,100% { transform: scale(1); }
    50%      { transform: scale(0.88); }
  }
  .dpad-press { animation: dpad-press 0.15s ease-in-out; }

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

  @keyframes glowSwim {
    0%   { transform: translateY(0) scale(0.5); opacity: 0; }
    15%  { opacity: 1; transform: scale(1); }
    30%  { transform: translateY(-30vh) translateX(40px); }
    60%  { transform: translateY(-60vh) translateX(-40px); }
    85%  { opacity: 1; }
    100% { transform: translateY(-115vh) translateX(0) scale(2.5); opacity: 0; }
  }
  .animate-glowSwim { animation: glowSwim 5.5s ease-in-out forwards; }
  .animate-spin-slow { animation: spin 8s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

// ─── ACCENT POR SECTOR ──────────────────────────────────────────────────────
const SECTOR_ACCENT = {
  destino:   '#d946ef',
  canjear:   '#facc15',
  shopamigos: '#94a3b8',
  reinos:    '#fb923c',
  ai:        '#a3e635',
  games:     '#ffffff',
};

// HandOff de cierre según sector — claves = intent
const CIERRE_AGENTE = {
  shopamigos: 'EVELYN_CIERRE',
};

const SECTOR_AVATARS = {
  destino:   { tito: '/emojis/tito.webp', lara: '/emojis/lara.webp', puffo: '/emojis/puffo.webp' },
  canjear:   {},
  shopamigos: {},
  reinos:    { rumores: '/emojis/rumores.webp' },
  ai:        { orumama: '/emojis/orumama.webp', jaguar: '/emojis/jaguar.webp', smisterio: '/emojis/smisterio.webp' },
  games:     { default: '/emojis/emoji_5.webp' },
};

const CANAL_IMAGES = {
  'luna':     '/emojis/canal-luna.webp',
  'tierra':   '/emojis/canal-tierra.webp',
  'jupiter':  '/emojis/canal-jupiter.webp',
  'marte':    '/emojis/canal-marte.webp',
  'saturno':  '/emojis/canal-saturno.webp',
  'urano':    '/emojis/canal-urano.webp',
  'neptuno':  '/emojis/canal-neptuno.webp',
  'venus':    '/emojis/canal-venus.webp',
  'mercurio': '/emojis/canal-mercurio.webp',
};

const REALITIES = [
  { id: 'luna',     title: 'CANAL LUNA',     desc: 'Fase Luna',          color: '#ffffff', group: 'NEUTRAL' },
  { id: 'tierra',   title: 'CANAL TIERRA',   desc: 'Sincronía Vital',    color: '#34d399', group: 'SOLO' },
  { id: 'jupiter',  title: 'CANAL JÚPITER',  desc: 'Exploración',        color: '#22d3ee', group: 'SOLO' },
  { id: 'marte',    title: 'CANAL MARTE',    desc: 'Viajero del Tiempo', color: '#fbbf24', group: 'SOLO' },
  { id: 'saturno',  title: 'CANAL SATURNO',  desc: 'Nexo Ciudadano',     color: '#60a5fa', group: 'BAND' },
  { id: 'urano',    title: 'CANAL URANO',    desc: 'Alien Lounge',       color: '#e879f9', group: 'BAND' },
  { id: 'neptuno',  title: 'CANAL NEPTUNO',  desc: 'El Ágora',           color: '#fb923c', group: 'BAND' },
  { id: 'venus',    title: 'CANAL VENUS',    desc: 'Horizonte Levante',  color: '#22d3ee', group: 'ESPACIO' },
  { id: 'mercurio', title: 'CANAL MERCURIO', desc: 'Horizonte Poniente', color: '#e879f9', group: 'ESPACIO' },
];

// ─── VIDEO REALITY — solo para el Reality Player ─────────────────────────────
const getTimeSuffix = () => {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return '1';
  if (h >= 11 && h < 17) return '2';
  if (h >= 17 && h < 23) return '3';
  return '4';
};


const getMobileAudioUrl = (realityId) => {
  const t = getTimeSuffix();
  const base = 'https://media.bro7vision.com';
  switch (realityId) {
    case 'tierra':   return `${base}/tierra_${t}.mp3`;
    case 'jupiter':  return `${base}/jupiter_${t}.mp3`;
    case 'marte':    return `${base}/marte_${t}.mp3`;
    case 'urano':    return `${base}/urano_${t}.mp3`;
    case 'venus':    return `${base}/venus_bg_${t}.mp3`;
    case 'mercurio': return `${base}/mercurio_bg_${t}.mp3`;
    case 'luna':     return `${base}/luna_bg_${getMoonSuffix()}.mp3`;
    case 'saturno':  return `${base}/saturno_${t}.mp3`;
    case 'neptuno':  return `${base}/neptuno_${t}.mp3`;
    default:         return null;
  }
};

// ─── WIDGET RELOJ + TEMPERATURA ──────────────────────────────────────────────
const LockClockWidget = ({ accent, genesisBalance }) => {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [temp, setTemp] = useState(null);
  const [city, setCity] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setTime(`${h}:${m}`);
      const dias  = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
      const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
      setDate(`${dias[now.getDay()]} ${now.getDate()} ${meses[now.getMonth()]}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
        const meteo = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const meteoData = await meteo.json();
        setTemp(Math.round(meteoData.current_weather?.temperature ?? null));
        const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const geoData = await geo.json();
        setCity((geoData.address?.city || geoData.address?.town || geoData.address?.village || '').toUpperCase());
      } catch (_) {}
    }, () => {}, { timeout: 8000 });
  }, []);

  const genesisColor =
    (genesisBalance ?? 0) < 1000    ? '#f87171'
    : (genesisBalance ?? 0) < 5000  ? '#60a5fa'
    : (genesisBalance ?? 0) < 10000 ? '#34d399'
    : (genesisBalance ?? 0) < 15000 ? '#facc15'
    :                                '#d946ef';

  const genesisNeon =
    (genesisBalance ?? 0) < 1000    ? 'rgba(248,113,113,0.6)'
    : (genesisBalance ?? 0) < 5000  ? 'rgba(96,165,250,0.6)'
    : (genesisBalance ?? 0) < 10000 ? 'rgba(52,211,153,0.6)'
    : (genesisBalance ?? 0) < 15000 ? 'rgba(250,204,21,0.6)'
    :                                'rgba(217,70,239,0.6)';

  const genesisLabelColor =
    (genesisBalance ?? 0) < 1000    ? 'rgba(248,113,113,0.5)'
    : (genesisBalance ?? 0) < 5000  ? 'rgba(96,165,250,0.5)'
    : (genesisBalance ?? 0) < 10000 ? 'rgba(52,211,153,0.5)'
    : (genesisBalance ?? 0) < 15000 ? 'rgba(250,204,21,0.5)'
    :                                'rgba(217,70,239,0.5)';

  return (
    <div className="flex items-center justify-between w-full px-2 select-none">
      {/* Izquierda: Hora + Fecha */}
      <div className="flex flex-col items-start">
        <span className="lock-clock" style={{ fontSize: 'clamp(32px, 10vw, 52px)' }}>{time}</span>
        <span className="lock-date">{date}</span>
      </div>

      {/* Centro: Lunas */}
      <div className="flex flex-col items-center">
        <span className="lock-temp" style={{ color: genesisColor, fontSize: 'clamp(22px, 7vw, 36px)', textShadow: `0 0 16px ${genesisNeon}` }}>
          {genesisBalance ?? 0}
        </span>
        <span className="lock-date" style={{ color: genesisLabelColor }}>LUNAS</span>
      </div>

      {/* Derecha: Temperatura */}
      {temp !== null && (
        <div className="flex flex-col items-end">
          <span className="lock-temp" style={{ fontSize: 'clamp(22px, 7vw, 36px)' }}>{temp}°</span>
          {city && <span className="lock-date" style={{ fontSize: 9 }}>{city}</span>}
        </div>
      )}
    </div>
  );
};

// ─── PUERTAS (reutilizadas en los 3 early returns) ──────────────────────────
function Puertas({ isLeftOpen, setIsLeftOpen, isRightOpen, setIsRightOpen,
                   broTunerRef,
                   accent, balances, setBalances, navItems, handleNavigation, setMessages,
                   iaMode, isAdmin, userCredits, onToggleAdminIA, onTogglePublicIA,
                   setShowWalletModal, handleLogout, intent,
                   setStep, setRealityMode, setScope }) {

  return (
    <>
      {/* Gatillos */}
      <button onClick={() => { setIsLeftOpen(!isLeftOpen); setIsRightOpen(false); }}
        className="fixed top-[70%] -translate-y-1/2 z-[210] h-24 w-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-r-2xl flex items-center justify-center transition-all duration-300"
        style={{ left: isLeftOpen ? 'min(72vw, 280px)' : '0' }}>
        <span className="text-cyan-400 text-xs">{isLeftOpen ? '◀' : '▶'}</span>
      </button>
      <button onClick={() => { setIsRightOpen(!isRightOpen); setIsLeftOpen(false); }}
        className="fixed top-[70%] -translate-y-1/2 z-[210] h-24 w-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-l-2xl flex items-center justify-center transition-all duration-300"
        style={{ right: isRightOpen ? 'min(72vw, 280px)' : '0' }}>
        <span className="text-fuchsia-400 text-xs">{isRightOpen ? '▶' : '◀'}</span>
      </button>

      {/* Overlay */}
      {(isLeftOpen || isRightOpen) && (
        <div className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-md"
             onClick={() => { setIsLeftOpen(false); setIsRightOpen(false); }} />
      )}

      {/* Puerta Izquierda — siempre montada en DOM para que BroLives no pierda el audio */}
      <div
        className="fixed top-0 left-0 h-full w-[72vw] max-w-[280px] z-[200] flex flex-col bg-black/95 border-r border-cyan-500/30 neon-border"
        style={{ display: isLeftOpen ? 'flex' : 'none' }}
      >
        <div className="p-4 border-b border-white/10 flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center py-4 px-2 rounded-xl bg-cyan-900/10 border border-cyan-500/40">
            <span className="text-[12px] text-cyan-200/60 uppercase tracking-widest mb-1">Lunas</span>
            <span className="text-cyan-400 font-black text-4xl">{balances?.genesis ?? 0}</span>
          </div>
          <NeuralButton isAdmin={isAdmin} iaMode={iaMode}
            tokensRestantes={userCredits?.tokensRestantes} tokensTotales={userCredits?.tokensTotales}
            onToggleAdmin={onToggleAdminIA} onTogglePublic={onTogglePublicIA}
            setShowWalletModal={setShowWalletModal} />
        </div>

        <div className="flex flex-col w-full px-4 mt-4 gap-4">
          <div className="pt-4 border-t border-white/5">
            <BroTuner ref={broTunerRef} />
          </div>
        </div>
        <div className="flex-1" />
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full text-[12px] text-red-400/40 uppercase tracking-widest text-center hover:text-red-400/80 transition-colors">
            [ SALIR ]
          </button>
        </div>
      </div>

      {/* Puerta Derecha — Sectores */}
      {isRightOpen && (
        <div className="door-open-right fixed top-0 right-0 h-full w-[72vw] max-w-[280px] z-[200] flex flex-col bg-black/95 border-l border-cyan-500/30 neon-border">
          <div className="flex items-center justify-center px-4 py-4 border-b border-white/10">
            <span className="mobile-display-font text-2xl tracking-widest" style={{ color: accent }}>SECTORES</span>
          </div>
          <div className="px-4 mt-4">
            <button onClick={() => { setStep(0); setRealityMode(null); setScope?.(null); setIsRightOpen(false); }}
              className="w-full flex justify-between items-center p-3 bg-fuchsia-500/10 border border-fuchsia-400/40 rounded-2xl transition-all">
              <span className="text-[10px] font-black uppercase">CAMBIAR CANALES</span>
              <span className="text-lg">🌐</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bro-scroll py-3 px-3 flex flex-col gap-2">
            {navItems?.map(item => {
              const isActive = intent === item.id;
              return (
                <button key={item.id}
                  onClick={() => { setMessages([]); handleNavigation(item.id); setIsRightOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 min-h-[5.5rem] rounded-xl border text-left transition-all active:scale-95"
                  style={{
                    borderColor: isActive ? accent : 'rgba(255,255,255,0.1)',
                    background:  isActive ? `${accent}18` : 'rgba(0,0,0,0.4)',
                    boxShadow:   isActive ? `0 0 12px ${accent}33` : 'none',
                  }}>
                  <div className="flex -space-x-2 flex-shrink-0">
                    {item.images?.slice(0, 2).map((img, i) => (
                      <img key={i} src={img} alt=""
                        className="w-16 h-16 rounded-full object-cover border-2"
                        style={{ borderColor: accent, boxShadow: `0 0 12px ${accent}` }} />
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
    </>
  );
}

// ─── BURBUJA DESCRIPCIÓN ────────────────────────────────────────────────────
function BurbujaDescripcion({ card, intent, accent, onHandoff, onClose }) {
  const handleConfirmar = () => {
    if (!card || !onHandoff) return;
    const agente = CIERRE_AGENTE[intent];
    if (!agente) return;
    // Audio usa codigo, el resto usa comercio
    if (agente === 'AUDIO_PLAY') {
      onHandoff({ agente, codigo: card.bro_mus || card.bro_aud || card.bro_pd });
    } else {
      onHandoff({ agente, comercio: card.bro_pd || card.bro_ser });
    }
    onClose();
  };

  return (
    <div className="burbuja-in fixed z-[150] left-0 right-0 mx-auto px-3" style={{ bottom: 140, maxWidth: 480 }}>
      <div style={{
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)',
        border: `1px solid ${accent}55`, borderRadius: '1.5rem',
        padding: '16px 16px 12px', boxShadow: `0 0 32px ${accent}22`,
      }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: accent, opacity: 0.7 }}>
            {card.nombre}
          </span>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>✕</button>
        </div>
        {(card.neighborhood || card.nearby_ref) && (
          <p style={{ fontFamily: "'Courier New', monospace", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: accent, opacity: 0.6, textAlign: 'center', marginBottom: 8 }}>
            {card.neighborhood}{card.neighborhood && card.nearby_ref ? ' · ' : ''}{card.nearby_ref}
          </p>
        )}
        {card.descripcion && (
          <p style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 'clamp(20px, 6vw, 32px)', color: '#fff', textShadow: `0 0 16px ${accent}`, lineHeight: 1.3, textAlign: 'center', marginBottom: 12 }}>
            {card.descripcion}
          </p>
        )}
        <button onClick={handleConfirmar} style={{ width: '100%', padding: '14px 0', background: `${accent}22`, border: `1px solid ${accent}88`, borderRadius: '1rem', color: accent, fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', boxShadow: `0 0 16px ${accent}33` }}>
          ➤ CONFIRMAR
        </button>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
const MobileLayout = ({
  children,
  realityMode, setRealityMode,
  audmovilList=[],
  scope, setScope,
  step, setStep,
  intent, setIntent,
  session, balances, setBalances,
  navItems, handleNavigation,
  chatMobile,
  ososModo, setOsosModo,
  perfilOso,
  setShowBooster, setShowWalletModal,
  handleLogout,
  isLeftOpen,  setIsLeftOpen,
  isRightOpen, setIsRightOpen,
  iaMode, isAdmin, userCredits,
  onToggleAdminIA, onTogglePublicIA,
  stripCards, stripVisible, stripLabel,
  onHandoff,
  broTunerRef,
  selectedCard,
  userId,
  genesisBalance,
  onGenesisUpdate,
  ...props
}) => {
  const [footerMode, setFooterMode] = useState('chat');
  const [inputText,  setInputText]  = useState('');
  const [messages,   setMessages]   = useState([]);
  const [burbujaOpen, setBurbujaOpen] = useState(false);
  const [bgVideoUrl, setBgVideoUrl] = useState('');

  const { enviar, mensaje: chatMensaje, loading: chatLoading } = chatMobile || {};
  const inputRef     = useRef(null);
  const lastBotMsgId = useRef(null);
  
  const accent = SECTOR_ACCENT[intent] || '#00ffff';
  
  const {
  estado, cuponActivo, cardPendiente, errorMsg,
  iniciarCanje, cancelar, confirmar, cerrar,
} = useCanjearCupon({ userId, onGenesisUpdate });

  const MOBILE_ESCENARIO_MAP = {
    moon:         '11',
    oeste:        '12',
    este:         '13',
    solo_earth:   '14',
    solo_cinema:  '15',
    solo_fantasy: '16',
    band_earth:   '17',
    band_fantasy: '18',
    band_cinema:  '19',
  };

  const {
    preguntaActual, indice, total, resultado, cooldown,
    loading: triviaLoading, completado,
    burbujaOpen: triviaBurbujaOpen, setBurbujaOpen: setTriviaBurbujaOpen,
    haloActivo, falloImg, proximoTurno,
    cargarSet, responder,
  } = useHaloTrivia({
    escenarioId: MOBILE_ESCENARIO_MAP[realityMode] || realityMode,
    userId,
    onGenesisUpdate,
  });
  

  const [turnoActual, setTurnoActual] = useState(getTurno());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTurnoActual(getTurno());
    }, 60000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const MOBILE_CANAL = { luna:2, tierra:4, jupiter:5, marte:6, saturno:7, urano:8, neptuno:9, venus:3, mercurio:1 };
    const canal = realityMode ? MOBILE_CANAL[realityMode] : null;
    if (!canal) { setBgVideoUrl(''); return; }
    const fase = canal === 2 ? getMoonSuffix() : '0';
    const turno = canal === 2 ? '0' : turnoActual;
    const url = `https://media.bro7vision.com/${buildBgVideoName(canal, fase, turno, 1)}`;
    setBgVideoUrl(url);
  }, [realityMode, turnoActual]);

  const adVideoUrl = useAdOverlay({
    escenarioId: realityMode,
    turno: turnoActual,
    faseLunar: getMoonSuffix(),
    cityKey: scope?.city,
    dispositivo: 1,
  });

  const [adVisible, setAdVisible] = useState(true);

  useEffect(() => {
    if (!adVideoUrl) return;
    setAdVisible(true);
    let timeout;
    const mostrar = () => {
      setAdVisible(true);
      timeout = setTimeout(ocultar, 40000);
    };
    const ocultar = () => {
      setAdVisible(false);
      timeout = setTimeout(mostrar, 20000);
    };
    timeout = setTimeout(ocultar, 40000);
    return () => clearTimeout(timeout);
  }, [adVideoUrl]);

  useEffect(() => { setBurbujaOpen(false); }, [stripCards]);

  const activeSector = navItems?.find(n => n.id === intent);
  const sectorLabel  = step === 1 ? 'OSOS' : activeSector?.label || 'OSOS';
  const lastMessage  = messages.length > 0 ? messages[messages.length - 1] : null;

  const handleSend = () => {
    if (!inputText.trim() || chatLoading || !enviar) return;
    enviar(inputText.trim());
    setInputText('');
  };

  if (!perfilOso) {
    return (
      <div className="mobile-root fixed inset-0 overflow-hidden bg-black text-white flex items-center justify-center">
        <style>{MOBILE_STYLES}</style>
        <div className="flex flex-col items-center gap-6">
          <div className="text-3xl uppercase tracking-widest font-black"
            style={{ color: '#00ffff', textShadow: '0 0 16px #00ffff' }}>
            CARGANDO...
          </div>
          <div className="flex gap-4 items-center">
            {[0,1,2].map(i => (
              <span key={i} className="block w-5 h-5 rounded-full animate-bounce"
                style={{ background: '#00ffff', animationDelay: `${i * 0.15}s`, boxShadow: '0 0 16px #00ffff' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!perfilOso) {
    return (
      <div className="mobile-root fixed inset-0 overflow-hidden bg-black text-white flex items-center justify-center">
        <style>{MOBILE_STYLES}</style>
        <div className="flex flex-col items-center gap-6">
          <div className="text-3xl uppercase tracking-widest font-black"
            style={{ color: '#00ffff', textShadow: '0 0 16px #00ffff' }}>
            CARGANDO...
          </div>
          <div className="flex gap-4 items-center">
            {[0,1,2].map(i => (
              <span key={i} className="block w-5 h-5 rounded-full animate-bounce"
                style={{ background: '#00ffff', animationDelay: `${i * 0.15}s`, boxShadow: '0 0 16px #00ffff' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getActiveAvatars = () => {
    if (step === 1 || !intent) {
      const oso = (perfilOso?.oso_id || 'tito').toLowerCase();
      return { avatars: [SECTOR_AVATARS.destino[oso] || SECTOR_AVATARS.destino.tito] };
    }
    const sectorMap = SECTOR_AVATARS[intent];
    if (!sectorMap) return { avatars: [] };
    return { avatars: [Object.values(sectorMap)[0]] };
  };
  const { avatars: activeAvatars } = getActiveAvatars();

  const puertasProps = {
    isLeftOpen, setIsLeftOpen, isRightOpen, setIsRightOpen,
    broTunerRef,
    accent, balances, setBalances, navItems, handleNavigation, setMessages,
    iaMode, isAdmin, userCredits, onToggleAdminIA, onTogglePublicIA,
    setShowWalletModal, handleLogout, intent,
    setStep, setRealityMode, setScope,
  };

  // ── REALITY TUNER ─────────────────────────────────────────────────────────
  if (step === 0 && !realityMode) {
    return (
      <div className="mobile-root fixed inset-0 overflow-hidden bg-black text-white select-none">
        <style>{MOBILE_STYLES}</style>
        <div className="scanline z-[1]" />
        <Puertas {...puertasProps} />
        <div className="relative z-10 pt-8 pb-4 text-center">
          <div className="mobile-display-font text-5xl tracking-widest"
            style={{ color: '#00ffff', textShadow: '0 0 20px #00ffff' }}>
            BRO<span style={{ color: '#fff' }}>7</span>VISION
          </div>
          <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] mt-2 font-mono">SINTONIZA TU FRECUENCIA</p>
        </div>
        <div className="relative z-10 overflow-y-auto bro-scroll px-4 pb-8 flex flex-col gap-6" style={{ maxHeight: 'calc(100dvh - 140px)' }}>
          {['NEUTRAL','SOLO','BAND','ESPACIO'].map(group => {
            const items = REALITIES.filter(r => r.group === group);
            if (!items.length) return null;
            return (
              <div key={group} className="flex flex-col gap-2">
                {group !== 'NEUTRAL' && (
                  <div className="flex items-center gap-3 opacity-40 px-1">
                    <div className="h-px flex-1 bg-white/30" />
                    <span className="text-[9px] text-white/60 font-black tracking-widest uppercase">{group}</span>
                    <div className="h-px flex-1 bg-white/30" />
                  </div>
                )}
                {items.map(r => (
                  <button key={r.id} onClick={() => setRealityMode(r.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 active:scale-95 transition-all"
                    style={{ borderColor: `${r.color}66`, background: `${r.color}11` }}>
                    <img
                      src={CANAL_IMAGES[r.id]}
                      alt={r.title}
                      className="w-14 h-14 object-contain shrink-0 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    />
                    <div className="flex-1 text-left">
                      <div className="mobile-display-font text-2xl tracking-widest" style={{ color: r.color }}>{r.title}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── REALITY MODE (step 0 con canal seleccionado) ─────────────────────────
  if (step === 0 && realityMode) {
    const escena = REALITIES.find(r => r.id === realityMode);

    return (
      <div className="mobile-root fixed inset-0 overflow-hidden bg-black text-white select-none">
        <style>{MOBILE_STYLES}</style>

        {/* Video de fondo */}
        {bgVideoUrl && (
          <video key={bgVideoUrl} autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ opacity: 0.75 }}>
            <source src={bgVideoUrl} type="video/mp4" />
          </video>
        )}

        {/* Visor publicitario móvil — cuadrado 1:1 */}
        {adVideoUrl && adVisible && (
          <video key={adVideoUrl} autoPlay loop muted playsInline
            className="absolute z-10 pointer-events-none"
            style={{
              top: '12%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '64vw',
              height: '64vw',
              borderRadius: '16px',
              objectFit: 'cover',
              opacity: 0.95,
            }}>
            <source src={adVideoUrl} type="video/mp4" />
          </video>
        )}

        {/* Overlay gradiente */}
        <div className="absolute inset-0 z-[1]"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.75) 100%)' }} />

        <div className="scanline z-[2]" />
        <Puertas {...puertasProps} />

        {/* HALO SUMA — esfera de energía */}
        {haloActivo === 'suma' && (
          <div className="fixed z-[300] pointer-events-none animate-glowSwim"
            style={{ bottom: 80, left: '50%', transform: 'translateX(-50%)' }}>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-[40px] animate-pulse" />
              <div className="absolute w-20 h-20 bg-white/40 rounded-full blur-[20px]" />
              <div className="absolute w-10 h-10 bg-white rounded-full blur-[5px] shadow-[0_0_30px_white]" />
              <div className="absolute w-full h-full animate-spin-slow">
                <div className="absolute top-0 left-1/2 w-4 h-4 bg-white/60 rounded-full blur-sm" />
                <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white/40 rounded-full blur-sm" />
                <div className="absolute left-0 top-1/2 w-5 h-5 bg-cyan-200/50 rounded-full blur-sm" />
              </div>
            </div>
          </div>
        )}

        {/* HALO RESTA — monstruo */}
        {haloActivo === 'resta' && falloImg && (
          <div className="fixed z-[300] pointer-events-none animate-glowSwim"
            style={{ bottom: 80, left: '50%', transform: 'translateX(-50%)' }}>
            <img src={falloImg} style={{ width: 80, height: 80, objectFit: 'contain' }} alt="fallo" />
          </div>
        )}

        <main className="relative z-10 flex flex-col h-full w-full">

          {/* HEADER: Reloj — Génesis — Temperatura */}
          <header className="flex-shrink-0 px-4 pt-safe pt-3 pb-2">
            <LockClockWidget accent={escena?.color} genesisBalance={genesisBalance} />
          </header>

          {/* CENTRO — Pregunta + Respuestas con emoji */}
          {triviaBurbujaOpen && preguntaActual ? (
            <div className="flex-1 flex items-center justify-center px-5">
              <div className="burbuja-in w-full rounded-2xl px-5 py-6 flex flex-col gap-4"
                style={{
                  background: 'rgba(0,0,0,0.88)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${escena?.color}55`,
                  boxShadow: `0 0 32px ${escena?.color}22`,
                }}>

                {/* Aviso publicidad ECO */}
                {preguntaActual.esEco && (
                  <div className="text-[9px] text-white/40 uppercase tracking-widest text-right">
                    * PUBLICIDAD
                  </div>
                )}

                {/* Pregunta */}
                <p className="text-white font-black text-base uppercase tracking-wide leading-snug text-center"
                  style={{ fontFamily: "'Courier New', monospace", textShadow: `0 0 8px ${escena?.color}` }}>
                  {preguntaActual.pregunta}
                </p>

                {/* Respuestas con emoji vinculado */}
                <div className="flex flex-col gap-2 mt-2">
                  {preguntaActual.opciones.map((op) => {
                    const textoDisplay = op.texto?.replace(/\(\*\)/g, '').trim();
                    const tieneStar    = op.texto?.includes('(*)');
                    const esCorrecta   = resultado === 'acierto' && (
                      preguntaActual.esEco
                        ? op.texto?.includes('(*)')
                        : op.clave === preguntaActual.respuesta_correcta
                    );
                    const esFallo = resultado === 'fallo';

                    return (
                      <div key={op.clave}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                        style={{
                          background: esCorrecta
                            ? 'rgba(34,197,94,0.2)'
                            : esFallo
                              ? 'rgba(239,68,68,0.08)'
                              : 'rgba(255,255,255,0.05)',
                          border: esCorrecta
                            ? '1px solid #22c55e'
                            : esFallo
                              ? '1px solid rgba(239,68,68,0.3)'
                              : `1px solid ${escena?.color}33`,
                        }}>
                        <span className="text-2xl flex-shrink-0">{op.emoji}</span>
                        <span className="text-white font-black text-sm uppercase leading-snug flex-1"
                          style={{ fontFamily: "'Courier New', monospace" }}>
                          {textoDisplay}
                          {tieneStar && <span className="text-yellow-400 ml-1">★</span>}
                        </span>
                        {esCorrecta && <span className="text-green-400 text-lg">✓</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Contador set */}
                <div className="text-center text-white/30 text-[9px] uppercase tracking-widest mt-1">
                  {indice + 1} / {total}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* FOOTER */}
          <footer className="flex-shrink-0 pb-safe px-5 pb-6 flex flex-col items-center gap-3"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>

            {/* Botones GRANDES emoji — solo activos cuando burbuja abierta */}
            <div className="flex gap-4 w-full justify-center">
              {(triviaBurbujaOpen && preguntaActual
                ? preguntaActual.opciones
                : [
                    { emoji: '🦈', clave: 'a' },
                    { emoji: '🐘', clave: 'b' },
                    { emoji: '🐞', clave: 'c' },
                  ]
              ).map((op) => (
                <button key={op.clave}
                  onClick={() => triviaBurbujaOpen && !cooldown && !resultado && responder(op.clave)}
                  disabled={!triviaBurbujaOpen || cooldown || !!resultado}
                  className="flex items-center justify-center rounded-2xl transition-all active:scale-90"
                  style={{
                    width: 72, height: 72,
                    fontSize: 38,
                    background: triviaBurbujaOpen && !resultado
                      ? `${escena?.color}18`
                      : 'rgba(0,0,0,0.4)',
                    border: triviaBurbujaOpen && !resultado
                      ? `2px solid ${escena?.color}88`
                      : '2px solid rgba(255,255,255,0.1)',
                    boxShadow: triviaBurbujaOpen && !resultado
                      ? `0 0 20px ${escena?.color}44`
                      : 'none',
                    opacity: !triviaBurbujaOpen ? 0.3 : 1,
                    cursor: triviaBurbujaOpen && !resultado ? 'pointer' : 'default',
                  }}>
                  {op.emoji}
                </button>
              ))}
            </div>

            {/* Botón CONTESTAR */}
            <button
              onClick={() => {
                if (!completado && !triviaBurbujaOpen && !triviaLoading) { setAdVisible(true); cargarSet(); }
              }}
              disabled={completado || triviaBurbujaOpen || triviaLoading || cooldown}
              className="w-full py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
              style={{
                background: completado
                  ? 'rgba(255,255,255,0.05)'
                  : `${escena?.color}22`,
                border: `1px solid ${completado ? 'rgba(255,255,255,0.1)' : escena?.color + '88'}`,
                color: completado ? 'rgba(255,255,255,0.25)' : escena?.color,
                boxShadow: completado ? 'none' : `0 0 16px ${escena?.color}33`,
                fontFamily: "'Courier New', monospace",
              }}>
              {triviaLoading
                ? 'CARGANDO...'
                : completado
                  ? `PRÓXIMO TURNO: ${proximoTurno}`
                  : triviaBurbujaOpen
                    ? 'ELIGE TU RESPUESTA'
                    : '💡ACCIÓN💡'}
            </button>

          </footer>
        </main>
      </div>
    );
  }

  // ── LAYOUT PRINCIPAL (step 1 y 2) — siempre mobile.webp, sin video ────────
return (
      <div className="mobile-root fixed inset-0 overflow-hidden bg-black text-white select-none">
      <style>{MOBILE_STYLES}</style>

      {/* GÉNESIS COUNTER — oculto en RealityTuner y AtlasGame */}
      {!(step === 0 && !realityMode) && !(step === 2 && intent === 'game') && (
        <GenesisCounter balances={balances} mobile />
      )}

      {/* Fondo fijo — siempre mobile.webp en sectores */}
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/mobile.webp')" }} />
      <div className="absolute inset-0 bg-black/10 z-0 backdrop-blur-[2px]" />

      {/* Video del canal seleccionado */}
      {bgVideoUrl && (
        <video
          src={bgVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      <div className="scanline z-[1]" />

      <Puertas {...puertasProps} />

      {burbujaOpen && typeof burbujaOpen === 'object' && (
        <BurbujaDescripcion
          card={burbujaOpen} intent={intent} accent={accent}
          onHandoff={onHandoff} onClose={() => setBurbujaOpen(false)}
        />
      )}

      <main className="relative z-10 flex flex-col h-full w-full">

        {/* Header — Reloj */}
        <header className="flex-shrink-0 flex flex-col items-center pt-safe pt-3 pb-1 px-4">
          <LockClockWidget accent={accent} />
        </header>

        {(scope?.city && !selectedCard) || (intent === 'games' && step === 2) ? (
          <div className="flex-shrink-0 w-full mb-1 flex items-center justify-center">
            <CityLocationBanner scope={scope} isMobile={true} />
          </div>
        ) : null}

        {/* Avatar + BroCards */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2 py-2">
          {activeAvatars.length > 0 && (
            <div className="flex items-center justify-center gap-3">
              {activeAvatars.map((img, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <img src={img} alt=""
                    className="w-20 h-20 rounded-full object-cover border-2"
                    style={{ borderColor: accent, boxShadow: `0 0 12px ${accent}` }} />
                </div>
              ))}
            </div>
          )}
          
          <CuponModal
  	estado={estado}
  	cardPendiente={cardPendiente}
  	cuponActivo={cuponActivo}
  	errorMsg={errorMsg}
  	genesisBalance={genesisBalance}
  	onConfirmar={confirmar}
  	onCancelar={cancelar}
  	onCerrar={cerrar}
	/>
        </div>

        {/* Chat */}
        <section
            className="flex-1 min-h-0 overflow-y-auto bro-scroll px-6 py-4 flex flex-col cursor-text"
            onClick={() => {
              if (footerMode !== 'chat') setFooterMode('chat');
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
          >
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              {messages.length === 0 && !chatLoading && (
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
              {lastMessage && !chatLoading && (
                <div key={lastMessage.ts} className="msg-in flex flex-col items-center text-center w-full">
                  <p className="huge-neon-text whitespace-pre-wrap break-words w-full"
                    style={{
                      color: lastMessage.from === 'bot' ? '#fff' : 'rgba(255,255,255,0.5)',
                      textShadow: lastMessage.from === 'bot' ? `0 0 12px ${accent}, 0 0 24px ${accent}` : 'none',
                    }}>
                    {lastMessage.text}
                  </p>
                </div>
              )}
              {chatLoading && (
                <div className="msg-in flex flex-col items-center justify-center w-full gap-6">
                  <div className="text-2xl uppercase tracking-widest font-black"
                    style={{ color: accent, textShadow: `0 0 16px ${accent}` }}>
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
              {messages.length === 0 && chatLoading && (
                <div className="text-center text-white/60 text-sm uppercase tracking-widest">
                  ESPERANDO...
                </div>
              )}
            </div>
          </section>

          {/* Footer */}
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
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="ESCRIBE AQUÍ..."
                disabled={chatLoading}
                className="flex-1 bg-transparent border-b-2 px-2 py-3 text-2xl font-black text-center text-white placeholder-white/30 outline-none transition-all uppercase"
                style={{
                  fontFamily: "'Courier New', monospace",
                  borderColor: inputText ? accent : 'rgba(255,255,255,0.2)',
                  textShadow:  inputText ? `0 0 8px ${accent}` : 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || chatLoading}
                className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl transition-all active:scale-90"
                style={{
                  background: inputText.trim() && !chatLoading ? accent : 'rgba(255,255,255,0.1)',
                  boxShadow:  inputText.trim() ? `0 0 16px ${accent}` : 'none',
                  color:      inputText.trim() ? 'black' : 'rgba(255,255,255,0.3)',
                }}>
                ▶
              </button>
            </div>
          )}

          {footerMode === 'dpad' && (
            <div className="accordion-open px-4 py-4 flex items-center justify-center gap-3">
              <button className="dpad-btn" style={{ width: 50, height: 50 }} onClick={() => console.log('[DPAD] prev')}>⏮</button>
              <button className="dpad-btn" style={{ width: 50, height: 50 }} onClick={() => console.log('[DPAD] left')}>◄</button>
              <button className="dpad-ok"  style={{ width: 50, height: 50, fontSize: 12 }} onClick={() => console.log('[DPAD] ok')}>OK</button>
              <button className="dpad-btn" style={{ width: 50, height: 50 }} onClick={() => console.log('[DPAD] right')}>►</button>
              <button className="dpad-btn" style={{ width: 50, height: 50 }} onClick={() => console.log('[DPAD] next')}>⏭</button>
            </div>
          )}
        </footer>
      </main>

      {children}
    </div>
  );
};

export default MobileLayout;
