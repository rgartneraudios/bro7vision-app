import React, { useState, useRef, useEffect, useMemo } from 'react';
import CityLocationBanner from './CityLocationBanner';
import AgentChatInput from './AgentChatInput';
import NeuralButton from './NeuralButton';
import BroCardStrip from './BroCardStrip';
import BroLives from '../components/BroLives';
import BroTuner from '../components/BroTuner';
import { getMoonSuffix } from '../utils/moonUtils';
import { getVideoCandidates, resolveVideoFromCandidates, getTurno } from '../data/citycodes';
import SmisterioBanner from './personajes/SmisterioBanner';
import JaguarBanner from './personajes/JaguarBanner';
import OrumamaBanner from './personajes/OrumamaBanner';

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
`;

// ─── ACCENT POR SECTOR ──────────────────────────────────────────────────────
const SECTOR_ACCENT = {
  gps:             '#d946ef',
  productos:       '#facc15',
  servicios:       '#f43f5e',
  avisos:          '#94a3b8',
  audios:          '#22d3ee',
  internal_search: '#fb923c',
  ai:              '#a3e635',
  game:            '#ffffff',
};

// Tema BroCardStrip según sector
const STRIP_THEME = {
  productos: 'gold',
  servicios: 'slate',
  avisos:    'blue',
  audios:    'cyan',
};

// HandOff de cierre según sector — claves = intent
const CIERRE_AGENTE = {
  productos: 'NOVA_CIERRE',
  servicios: 'ISABELLA_CIERRE',
  avisos:    'EVELYN_CIERRE',
  audios:    'AUDIO_PLAY',
};

const SECTOR_AVATARS = {
  gps:             { tito: '/emojis/tito.webp', lara: '/emojis/lara.webp', puffo: '/emojis/puffo.webp' },
  productos:       { nova: '/emojis/nova.webp' },
  servicios:       { isabella: '/emojis/isabella.webp', profesor: '/emojis/prmaestro.webp' },
  avisos:          { evelyn: '/emojis/evelyn.webp', larry: '/emojis/larry.webp' },
  audios:          { mapache: '/emojis/mapache.webp', ami: '/emojis/ami.webp' },
  internal_search: { rumores: '/emojis/rumores.webp' },
  ai:              { orumama: '/emojis/orumama.webp', jaguar: '/emojis/jaguar.webp', smisterio: '/emojis/smisterio.webp' },
  game:            { default: '/emojis/emoji_5.webp' },
};

const REALITIES = [
  { id: 'moon',         title: 'CANAL LUNA',   desc: 'Fase Luna',          icon: '🌕', color: '#ffffff', group: 'NEUTRAL' },
  { id: 'solo_earth',   title: 'SOLO TERRA',   desc: 'Sincronía Vital',    icon: '🌍', color: '#34d399', group: 'SOLO' },
  { id: 'solo_fantasy', title: 'SOLO FANTASÍA', desc: 'Exploración',        icon: '🏰', color: '#22d3ee', group: 'SOLO' },
  { id: 'solo_cinema',  title: 'SOLO CINEMA',  desc: 'Viajero del Tiempo', icon: '🏛️', color: '#fbbf24', group: 'SOLO' },
  { id: 'band_earth',   title: 'BANDA TERRA',   desc: 'Nexo Ciudadano',     icon: '🏙️', color: '#60a5fa', group: 'BAND' },
  { id: 'band_fantasy', title: 'BANDA FANTASÍA', desc: 'Alien Lounge',       icon: '👾', color: '#e879f9', group: 'BAND' },
  { id: 'band_cinema',  title: 'BANDA CINEMA',  desc: 'El Ágora',           icon: '🎭', color: '#fb923c', group: 'BAND' },
  { id: 'este',         title: 'CANAL ESTE',   desc: 'Horizonte Levante',  icon: '📱', color: '#22d3ee', group: 'ESPACIO' },
  { id: 'oeste',        title: 'CANAL OESTE',  desc: 'Horizonte Poniente', icon: '📱', color: '#e879f9', group: 'ESPACIO' },
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
    case 'solo_earth':   return `${base}/solo_earth_${t}.mp3`;
    case 'solo_fantasy': return `${base}/solo_fantasy_${t}.mp3`;
    case 'solo_cinema':  return `${base}/solo_cinema_${t}.mp3`;
    case 'band_fantasy': return `${base}/band_fantasy_${t}.mp3`;
    case 'este':         return `${base}/este_bg_${t}.mp3`;
    case 'oeste':        return `${base}/oeste_bg_${t}.mp3`;
    case 'moon':         return `${base}/moon_bg_${getMoonSuffix()}.mp3`;
    case 'este169':  return `${base}/este_bg_${t}.mp3`;
    case 'oeste169': return `${base}/oeste_bg_${t}.mp3`;
    case 'solo_o169': return `${base}/solo_earth_${t}.mp3`;
    case 'solo_e169': return `${base}/solo_cinema_${t}.mp3`;
    default:             return null;
  }
};

// ─── WIDGET RELOJ + TEMPERATURA ──────────────────────────────────────────────
const LockClockWidget = ({ accent }) => {
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

  return (
    <div className="flex items-center justify-between w-full px-2 select-none">
      <div className="flex flex-col items-start">
        <span className="lock-clock" style={{ fontSize: 'clamp(38px, 12vw, 62px)' }}>{time}</span>
        <span className="lock-date">{date}</span>
      </div>
      {temp !== null && (
        <div className="flex flex-col items-end">
          <span className="lock-temp" style={{ fontSize: 'clamp(28px, 9vw, 44px)' }}>{temp}°</span>
          {city && <span className="lock-date" style={{ fontSize: 9 }}>{city}</span>}
        </div>
      )}
    </div>
  );
};

// ─── PUERTAS (reutilizadas en los 3 early returns) ──────────────────────────
function Puertas({ isLeftOpen, setIsLeftOpen, isRightOpen, setIsRightOpen,
                   audioUser, onToggleAudio, broTunerRef,
                   accent, balances, navItems, handleNavigation, setMessages,
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
            <span className="text-[12px] text-cyan-200/60 uppercase tracking-widest mb-1">Génesis Wallet</span>
            <span className="text-cyan-400 font-black text-4xl">{balances?.genesis ?? 0}</span>
          </div>
          <NeuralButton isAdmin={isAdmin} iaMode={iaMode}
            tokensRestantes={userCredits?.tokensRestantes} tokensTotales={userCredits?.tokensTotales}
            onToggleAdmin={onToggleAdminIA} onTogglePublic={onTogglePublicIA}
            setShowWalletModal={setShowWalletModal} />
        </div>
        <div className="flex flex-col w-full px-4 mt-4 gap-4">
          <BroLives playingCreator={audioUser} onToggleAudio={onToggleAudio} />
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
              <span className="text-[10px] font-black uppercase">Cambiar Reality</span>
              <span className="text-lg">🌐</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bro-scroll py-3 px-3 flex flex-col gap-2">
            {navItems?.map(item => {
              const isActive = intent === item.id;
              return (
                <button key={item.id}
                  onClick={() => { setMessages([]); handleNavigation(item.id); setIsRightOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all active:scale-95"
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
      onHandoff({ agente, codigo: card.bro_aud || card.bro_pod || card.bro_id });
    } else {
      onHandoff({ agente, comercio: card.bro_id || card.bro_ser });
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
  hubAudios={hubAudios},
  scope, setScope,
  step, setStep,
  intent, setIntent,
  session, balances,
  navItems, handleNavigation,
  chatMobile,
  ososModo, setOsosModo,
  perfilOso, perfilSector,
  setShowBooster, setShowWalletModal,
  handleLogout,
  isLeftOpen,  setIsLeftOpen,
  isRightOpen, setIsRightOpen,
  iaMode, isAdmin, userCredits,
  onToggleAdminIA, onTogglePublicIA,
  stripCards, stripVisible, stripLabel,
  onHandoff,
  broTunerRef,
  audioUser,
  onToggleAudio,
  selectedCard,
  oraculoActivo,
  ...props
}) => {
  const [footerMode, setFooterMode] = useState('chat');
  const [inputText,  setInputText]  = useState('');
  const [messages,   setMessages]   = useState([]);
  const [burbujaOpen, setBurbujaOpen] = useState(false);
  const [bgVideoUrl, setBgVideoUrl] = useState('');

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioIndex, setAudioIndex] = useState(0);

  const { enviar, mensaje: chatMensaje, loading: chatLoading } = chatMobile || {};
  const inputRef     = useRef(null);
  const lastBotMsgId = useRef(null);
  
  const isOraculo = chatMobile?.tipo === 'ORACULO';
  const oraculoPersonaje = chatMobile?.oraculo_personaje;
  const oraculoEnviarRef = useRef(null);
  
  const accent = SECTOR_ACCENT[intent] || '#00ffff';
  

  useEffect(() => {
    const MOBILE_CANAL = { solo_earth:4, solo_fantasy:5, solo_cinema:6, band_earth:7, band_fantasy:8, band_cinema:9, este:3, oeste:1, moon:2 };
    const canal = realityMode ? MOBILE_CANAL[realityMode] : null;
    if (!canal) { setBgVideoUrl(''); return; }
    let active = true;
    resolveVideoFromCandidates(getVideoCandidates(canal, getMoonSuffix(), getTurno(), 1, null))
      .then(url => { if (active) setBgVideoUrl(url); });
    return () => { active = false; };
  }, [realityMode]);

  useEffect(() => { setBurbujaOpen(false); }, [stripCards]);

  useEffect(() => {
    if (!chatMensaje) return;
    if (lastBotMsgId.current === chatMensaje) return;
    lastBotMsgId.current = chatMensaje;
    setMessages(prev => [...prev, { from: 'bot', text: chatMensaje, ts: Date.now() }]);
  }, [chatMensaje, isOraculo]);

  useEffect(() => {
    lastBotMsgId.current = null;
    setMessages([]);
  }, [oraculoPersonaje, isOraculo]);

  const handleSend = () => {
    const txt = inputText.trim();
    if (!txt || chatLoading) return;
    setMessages(prev => [...prev, { from: 'user', text: txt, ts: Date.now() }]);
    if (isOraculo && oraculoEnviarRef.current) {
      oraculoEnviarRef.current(txt);
    } else {
      enviar?.(txt);
    }
    setInputText('');
    setBurbujaOpen(false);
  };

  const activeSector = navItems?.find(n => n.id === intent);
  const sectorLabel  = step === 1 ? 'OSOS' : activeSector?.label || 'OSOS';
  const lastMessage  = messages.length > 0 ? messages[messages.length - 1] : null;

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
      return { avatars: [SECTOR_AVATARS.gps[oso] || SECTOR_AVATARS.gps.tito], personajeActivo: null };
    }
    const sectorMap = SECTOR_AVATARS[intent];
    if (!sectorMap) return { avatars: [], personajeActivo: null };
    const personajeActivo = intent === 'ai'
      ? (perfilSector?.personaje_id || oraculoActivo)
      : perfilSector?.personaje_id;
    if (personajeActivo && sectorMap[personajeActivo]) return { avatars: [sectorMap[personajeActivo]], personajeActivo };
    return { avatars: [Object.values(sectorMap)[0]], personajeActivo };
  };
  const { avatars: activeAvatars, personajeActivo } = getActiveAvatars();

  const puertasProps = {
    isLeftOpen, setIsLeftOpen, isRightOpen, setIsRightOpen,
    audioUser, onToggleAudio, broTunerRef,
    accent, balances, navItems, handleNavigation, setMessages,
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
                    <span className="text-3xl">{r.icon}</span>
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

  // ── REALITY PLAYER ────────────────────────────────────────────────────────
if (step === 0 && realityMode) {
  const escena = REALITIES.find(r => r.id === realityMode);
  

const prevAudio = () => {
  setAudioIndex(i => (i - 1 + audioList.length) % audioList.length);
  setIsPlaying(true);
};
const nextAudio = () => {
  setAudioIndex(i => (i + 1) % audioList.length);
  setIsPlaying(true);
};

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };       
    return (
      <div className="mobile-root fixed inset-0 overflow-hidden bg-black text-white select-none">
        <style>{MOBILE_STYLES}</style>

        {/* Video de fondo vertical — solo en Reality Player */}
        {bgVideoUrl && (
          <video key={bgVideoUrl} autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ opacity: 0.75 }}>
            <source src={bgVideoUrl} type="video/mp4" />
          </video>
        )}
        
        {/* AUDIO */}
{audioUrl && (
  <audio
  ref={audioRef}
  src={audioUrl}
  loop
  preload="auto"
  onEnded={() => setIsPlaying(false)}
/>
)}
        <div className="absolute inset-0 z-[1]"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.6) 100%)' }} />
        <div className="scanline z-[2]" />
        <Puertas {...puertasProps} />

        <main className="relative z-10 flex flex-col h-full w-full">
          {/* Header — Reloj */}
          <header className="flex-shrink-0 px-4 pt-safe pt-4 pb-2">
            <LockClockWidget accent={escena?.color} />
          </header>

          {/* Centro vacío — video protagonista */}
          <div className="flex-1" />

          {/* Footer — controles audio */}
          {/* Footer — controles audio */}
<footer className="flex-shrink-0 pb-safe pb-10 px-6 flex flex-col items-center gap-4"
  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}>
  <div className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-mono">AUDIO DEL CANAL</div>
  <div className="flex gap-5 items-center">
    <button className="dpad-btn" onClick={prevAudio}>⏮</button>
    <button 
      className="dpad-btn" 
      onClick={togglePlay}
      style={{
        background: `${escena?.color}22`, 
        borderColor: `${escena?.color}88`,
        color: escena?.color, 
        width: 72, 
        height: 72, 
        fontSize: 28, 
        borderRadius: '50%',
      }}>
      {isPlaying ? '⏸' : '▶'}
    </button>
    <button className="dpad-btn" onClick={nextAudio}>⏭</button>
  </div>
  
  {/* ← AÑADE ESTO: señales de debug */}
  <div className="text-center mt-4">
    {audioUrl ? (
      <div className="text-cyan-400 text-xs uppercase tracking-widest">
        ✓ Audio cargado
        {isPlaying && <div className="text-green-400 mt-1">▌▌ Reproduciendo</div>}
      </div>
    ) : (
      <div className="text-red-400 text-xs uppercase tracking-widest">
        ✗ Sin audio
      </div>
    )}
  </div>
</footer>
        </main>
      </div>
    );
  }

  // ── LAYOUT PRINCIPAL (step 1 y 2) — siempre mobile.webp, sin video ────────
  return (
    <div className="mobile-root fixed inset-0 overflow-hidden bg-black text-white select-none">
      <style>{MOBILE_STYLES}</style>

      {/* Fondo fijo — siempre mobile.webp en sectores */}
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/mobile.webp')" }} />
      <div className="absolute inset-0 bg-black/10 z-0 backdrop-blur-[2px]" />
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

        {scope?.city && !selectedCard && (
          <div className="flex-shrink-0 w-full mb-1 flex items-center justify-center">
            <CityLocationBanner scope={scope} isMobile={true} />
          </div>
        )}

        {/* Avatar + BroCards */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2 py-2">
          {activeAvatars.length > 0 && (
            <div className="flex items-center justify-center gap-3">
              {activeAvatars.map((img, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <img src={img} alt=""
                    className="w-20 h-20 rounded-full object-cover border-2"
                    style={{ borderColor: accent, boxShadow: `0 0 12px ${accent}` }} />
                  {intent === 'ai' && personajeActivo && (
                    <span style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: 9, fontWeight: 900,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: accent,
                      opacity: 0.8,
                    }}>
                      {personajeActivo === 'jaguar' ? '🐯 JAGUAR' :
                       personajeActivo === 'orumama' ? '🌿 ORUMAMA' : '☎️ SR. MISTERIO'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* BroCards — solo cuando hay resultados de búsqueda */}
          {stripVisible && stripCards?.length > 0 && (
            <div className="w-full px-2 pointer-events-auto">
              <BroCardStrip
                cards={stripCards}
                onSelectCard={(card) => setBurbujaOpen(card)}
                accentColor={STRIP_THEME[intent] || 'gold'}
                visible={true}
              />
            </div>
          )}
        </div>

        {/* Chat */}
        {!isOraculo && (
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
              {!isOraculo && messages.length === 0 && chatLoading && (
                <div className="text-center text-white/60 text-sm uppercase tracking-widest">
                  ESPERANDO...
                </div>
              )}
            </div>
          </section>
        )}

        {isOraculo && (
          <section className="flex-1 min-h-0 overflow-y-auto bro-scroll px-6 py-4 flex flex-col cursor-text">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              {messages.length === 0 && !chatLoading && (
                <div className="flex flex-col items-center text-center gap-6 animate-pulse">
                  <div className="huge-neon-text"
                    style={{ color: accent, textShadow: `0 0 12px ${accent}, 0 0 24px ${accent}` }}>
                    {oraculoPersonaje === 'jaguar' ? '🐯 JAGUAR SIDÉREO' :
                     oraculoPersonaje === 'orumama' ? '🌿 ORUMAMA' : '☎️ SR. MISTERIO'}
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
            </div>

            {/* Banners — SIEMPRE montados para mantener el hook activo */}
            <div className="flex-shrink-0">
              {(() => {
                const p = oraculoPersonaje;
                const handoffWrapper = (destino) => {
                  if (destino === 'jaguar' || destino === 'orumama' || destino === 'smisterio') {
                    onHandoff({ agente: 'ORACULO_INTERNO', personaje_id: destino });
                  } else {
                    onHandoff(destino);
                  }
                };
                const invokeOsos = () => { setStep(1); setOsosModo?.('entrada'); };
                return (
                  <>
                    {(p === 'smisterio' || !p) &&
                      <SmisterioBanner isMobile={true}
                        mostrarAcordeon={footerMode === 'dpad'}
                        onHandoffPersonaje={handoffWrapper}
                        onInvokeOsos={invokeOsos}
                        onMensaje={(msg) => {
                          if (lastBotMsgId.current === msg) return;
                          lastBotMsgId.current = msg;
                          setMessages(prev => [...prev, { from: 'bot', text: msg, ts: Date.now() }]);
                        }}
                        onEnviarRef={oraculoEnviarRef}
                      />}
                    {p === 'jaguar' &&
                      <JaguarBanner isMobile={true}
                        mostrarAcordeon={footerMode === 'dpad'}
                        onHandoffPersonaje={handoffWrapper}
                        onInvokeOsos={invokeOsos}
                        onMensaje={(msg) => {
                          if (lastBotMsgId.current === msg) return;
                          lastBotMsgId.current = msg;
                          setMessages(prev => [...prev, { from: 'bot', text: msg, ts: Date.now() }]);
                        }}
                        onEnviarRef={oraculoEnviarRef}
                      />}
                    {p === 'orumama' &&
                      <OrumamaBanner isMobile={true}
                        mostrarAcordeon={footerMode === 'dpad'}
                        onHandoffPersonaje={handoffWrapper}
                        onInvokeOsos={invokeOsos}
                        onMensaje={(msg) => {
                          if (lastBotMsgId.current === msg) return;
                          lastBotMsgId.current = msg;
                          setMessages(prev => [...prev, { from: 'bot', text: msg, ts: Date.now() }]);
                        }}
                        onEnviarRef={oraculoEnviarRef}
                      />}
                  </>
                );
              })()}
            </div>
          </section>
        )}

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
