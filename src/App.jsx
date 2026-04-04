import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './supabaseClient';
import GenesisGate from './components/GenesisGate';
import WalletWidget from './components/WalletWidget';
import ConversionModal from './components/ConversionModal';
import PaymentModal from './components/PaymentModal';
import NexusDashboard from './components/NexusDashboard';
import StoryPlayer from './components/StoryPlayer'; 
import BroTuner from './components/BroTuner';
import BroLives from './components/BroLives'; 
import { MASTER_DB } from './data/database';
import { getVideoForLocation } from './data/VideoMap';
import BroLogViewer from './components/BroLogViewer';
import BoosterModal from './components/BoosterModal';
import LegalTerminal from './components/LegalTerminal';
import HoloProjector from './components/HoloProjector';
import BioForest from './components/BioForest';
import ChannelEste from './components/ChannelEste';
import ChannelOeste from './components/ChannelOeste';
import Reinos from './components/Reinos';
import RealityTuner from './components/RealityTuner';
import HoloPrism from './components/HoloPrism';
import MoonMatrixCircle from './components/MoonMatrixCircle';
import ChannelMoon from './components/ChannelMoon';
import { getMoonSuffix } from './utils/moonUtils';
import OsosBanner from './components/OsosBanner';
import SlideRail from "./components/SlideRail";
import { AudioProvider } from './context/AudioContext';
import NovaBanner from './components/NovaBanner';
import MapacheBanner from './components/MapacheBanner';
import SlideRailAudio from "./components/SlideRailAudio";
import { useAudioData } from './hooks/useAudioData';
import BroCardStrip from "./components/BroCardStrip";
import AgentChatInput from './components/AgentChatInput';
import { useAgentChat } from './hooks/useAgentChat';
import ServiciosBanner from './components/ServiciosBanner';
import SlideRailServicios from './components/SlideRailServicios';
import EvelynBanner from './components/EvelynBanner';
import SlideRailAvisos from './components/SlideRailAvisos';
import OraculoBanner from './components/OraculoBanner';

function App() {
  const [realityMode, setRealityMode] = useState(null); 
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [radarQuery, setRadarQuery] = useState("");
  const [selectedForestUser, setSelectedForestUser] = useState(null);
  const [scope, setScope] = useState(null);
  const [realItems, setRealItems] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showStory, setShowStory] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBooster, setShowBooster] = useState(false);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [teleportCoords, setTeleportCoords] = useState({ city: '' });
  const [projectingUser, setProjectingUser] = useState(null);
  const [is219Mode, setIs219Mode] = useState(false); 
  const [selectedLog, setSelectedLog] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [audioUser, setAudioUser] = useState(null);
  const [activePrismUser, setActivePrismUser] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [ososHandoffContext, setOsosHandoffContext] = useState(null);
  const [holoPrismaIndex, setHoloPrismaIndex] = useState(0);
  const [ososFooterOpen, setOsosFooterOpen] = useState(false);
  const mapacheBannerRef = useRef(null);
  const [stripCards,   setStripCards]   = useState([]);
  const [stripLabel,   setStripLabel]   = useState('');
  const [stripVisible, setStripVisible] = useState(false);
  const broTunerRef = useRef(null);

  // Estados de sesión de ubicación
  const [sessionCP, setSessionCP]     = useState('');
  const [sessionCity, setSessionCity] = useState('');
  const [sessionRef, setSessionRef]   = useState('');
  const [vlData, setVlData]           = useState(null);

  // SERVICIOS BANNER Conversacional ISABELLA
  const serviciosBannerRef = useRef(null);

  // AVISOS BANNER Conversacional EVELYN
  const evelynBannerRef = useRef(null);

  // ORÁCULO BANNER
  const oraculoBannerRef = useRef(null);

  const handleServiciosInput = async (text) => {
    if (!text.trim()) return;
    await serviciosBannerRef.current?.sendMessage(text);
  };

  // NOVA BANNER Conversacional
  const novaBannerRef = useRef(null);

  const handleNovaInput = async (text) => {
    if (!text.trim()) return;
    await novaBannerRef.current?.sendMessage(text);
  };

  // ORÁCULO input
  const handleOraculoInput = async (text) => {
    if (!text.trim()) return;
    await oraculoBannerRef.current?.sendMessage(text);
  };

  // MAPACHE AUDIO & LIVES
  const [mapacheLoading, setmapacheLoading] = useState(false);

  const handleMapacheInput = async (text) => {
    if (!text.trim()) return;
    await mapacheBannerRef.current?.sendMessage(text);
  };

  // OSOS MENSAJES NAVEGACION
  const [ososModo, setOsosModo] = useState('entrada');
  const [perfilOso, setPerfilOso] = useState(null);

  const { 
    mensaje: ososMensaje, 
    bolas:   ososBolas, 
    loading: ososLoading, 
    enviar:  handleOsosInput, 
    reset:   resetOsos 
  } = useAgentChat({
    mode: 'osos',
    realItems: realItems, 
    contextData: {
      oso_id:         perfilOso?.oso_id         || 'TITO',
      alias:          perfilOso?.osos_nombre    || session?.user?.user_metadata?.alias || 'Ciudadano',
      ciudad:         perfilOso?.city           || '',
      cp:             perfilOso?.zip_code       || '',
      osos_tono:      perfilOso?.osos_tono      || 'cercano',
      osos_intereses: perfilOso?.osos_intereses || '',
      osos_frase:     perfilOso?.osos_frase     || '',
      modo:           ososModo,
    },

    onHandoff: ({ agente, ciudad, cp, intencion, comercio, modalidad }) => {

      // Sectores sin ubicación — handoff directo sin preguntar ciudad
      if (agente === 'REINOS') {
        setIntent('internal_search');
        setOsosModo('retorno');
        setStep(2);
        return;
      }

      if (agente === 'ORACULO') {
        setIntent('ai');
        setOsosModo('retorno');
        setStep(2);
        return;
      }

      setOsosHandoffContext({ intencion, comercio_especifico: comercio, modalidad });

      const intentMap = {
        'BROSHOP_PRODUCTO': 'broshop',
        'BROSHOP_SERVICIO': 'broshop',
        'BROSHOP_AVISO':    'broshop', 
        'AUDIO':            'lives',
        'REINOS':           'internal_search',
        'ORACULO':          'ai',
      };

      const roleMap = {
        'BROSHOP_PRODUCTO': 'shop',
        'BROSHOP_SERVICIO': 'service',
        'BROSHOP_AVISO':    'aviso', 
        'AUDIO':            'music',
      };

      const esPais = modalidad === 'ONLINE';

      (async () => {
        try {
          const roleBuscado = roleMap[agente];

          let query = supabase
            .from('profiles')
            .select('bro_id, banner_url, alias, biz_category, biz_profession, city, address, nearby_ref, ref_price, description, role')
            .limit(20);

          if (!esPais && ciudad) {
            query = query.ilike('city', `%${ciudad}%`);
          }

          const { data: perfiles, error } = await query;

          const filtrados = perfiles?.filter(p =>
            p.bro_id &&
            (Array.isArray(p.role) ? p.role.includes(roleBuscado) : p.role === roleBuscado)
          ) || [];

          if (!error && filtrados.length > 0) {
            setStripCards(filtrados.map(p => ({
              bro_id:      p.bro_id,
              banner_url:  p.banner_url                       || '',
              nombre:      p.alias                            || '',
              categoria:   p.biz_category || p.biz_profession || '',
              ciudad:      p.city                             || '',
              descripcion: p.description  || p.nearby_ref     || '',
              ref_price:   p.ref_price                        || '',
              address:     p.address                          || '',
            })));
            setStripLabel(intencion);
            setStripVisible(true);
          } else {
            setStripCards([]);
            setStripVisible(false);
          }
        } catch (err) {
          console.error('Error cargando cards:', err);
          setStripCards([]);
          setStripVisible(false);
        }
      })();

      setTimeout(() => {
        setScope({ city: ciudad, type: 'teleport' });
        setSessionCity(ciudad);
        setSessionCP(cp);
        setIntent(intentMap[agente] || 'broshop');
        setOsosModo('retorno');
        setStep(2);
      }, 2000);
    }
  });

  const [balances, setBalances] = useState({
    genesis: 0,
    vales: { nova: 0, crescens: 0, plena: 0, decrescens: 0 },
    eco_p: 0, eco_gen: 0,
    halos_p: 0, halos_gen: 0,
    zap_p: 0, zap_gen: 0
  });

  const [savedUserIndex, setSavedUserIndex] = useState(0);

  const handleOpenProfile = (user) => {
    const { _savedIndex, ...cleanUser } = user;
    setSavedUserIndex(_savedIndex || 0);
    setProjectingUser(cleanUser);
  };

  // Paneles Laterales
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  
  const handleGameWin = async (amount) => {
    const newTotal = balances.genesis + amount;
    setBalances(prev => ({ ...prev, genesis: newTotal }));
    if (session?.user?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ genesis: newTotal })
        .eq('id', session.user.id);
      if (error) console.error('Error al sincronizar con la base de datos:', error);
    }
  };

  const handleNavigation = (targetIntent) => {
    setIntent(targetIntent);
    setIsLeftOpen(false);
    setIsRightOpen(false);
    
    if (targetIntent === 'gps') {
      setStep(1);
      resetOsos();
      setSessionCP('');
      setSessionCity('');
    } else if (['broshop', 'lives', 'internal_search'].includes(targetIntent) && !scope) {
      setStep(1);
      setOsosModo('entrada');
    } else {
      setStep(2);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (prof) {
        setPerfilOso(prof);
        setBalances({
          genesis: prof.genesis,
          vales: {
            nova:       prof.nova       || 0,
            crescens:   prof.crescens   || 0,
            plena:      prof.plena      || 0,
            decrescens: prof.decrescens || 0
          },
          eco_p:    prof.eco_p    || 0,
          eco_gen:  prof.eco_gen  || 0,
          halos_p:  prof.halos_p  || 0,
          halos_gen: prof.halos_gen || 0,
          zap_p:    prof.zap_p    || 0,
          zap_gen:  prof.zap_gen  || 0
        });
      }      
      
      const { data: all } = await supabase.from('profiles').select('*');
      if (all) {
        setRealItems(all.map(u => ({
          ...u, 
          shopName: u.alias, 
          name: u.product_title || u.alias, 
          img: u.card_banner_url || u.banner_url,
          type: u.video_file ? ['shop', 'live'] : ['shop']
        })).filter(u => u.video_file || u.audio_file || u.product_title));
      }
    };
    fetchData();
  }, [session, step]);

  const filteredItems = useMemo(() => {
    const supabaseItems = realItems.map(u => ({
      ...u,
      id: u.id,
      name: u.product_title || u.alias,
      img: u.card_banner_url || u.banner_url || '/default.png',
      price: u.price || 0,
      type: u.video_file ? ['shop', 'live'] : ['shop'],
      source: 'supabase'
    }));

    const masterItems = MASTER_DB.map(m => ({
      ...m,
      id: m.id,
      name: m.name,
      img: m.img || '/default.png',
      price: m.price || 15,
      type: m.type || ['shop'],
      source: 'master'
    }));

    const ALL = [...supabaseItems, ...masterItems];

    if (intent === 'broshop') return ALL.filter(i => i.type?.includes('shop'));
    if (intent === 'lives')   return ALL.filter(i => i.type?.includes('live'));
    
    return ALL;
  }, [intent, realItems]);  
  
  const hubVideos = useMemo(() => {
    const masterVideos = MASTER_DB
      .filter(m => m.video_file)
      .map(m => ({
        ...m,
        id: m.id,
        alias: m.name || m.alias,
        video_file: m.video_file,
        source: 'master'
      }));

    const supabaseVideos = realItems
      .filter(i => i.video_file)
      .map(i => ({
        ...i,
        alias: i.alias,
        video_file: i.video_file,
        id: i.id,
        source: 'supabase'
      }));

    return [
      { alias: "BRO MASTER", video_file: "https://media.bro7vision.com/Mapache-habla.mp4", id: "bro_master" },
      ...masterVideos,
      ...supabaseVideos
    ];
  }, [realItems]);
  
  const { findChannelByAlias, checkIfNew } = useAudioData({ realItems });
    
  if (!session && !isGuest) {
    return <GenesisGate onGuestAccess={() => { setIsGuest(true); setStep(0); setRealityMode(null); setBalances({ genesis: 500, nova: 20 }); }} />;
  }

  const handleReportIssue = async () => {
    const currentScene = realityMode || 'lobby';
    const { data, error } = await supabase
      .from('reports_board')
      .insert([{ 
        user_id: session?.user?.id || null,
        scene: currentScene,
        reason: 'Reporte ciudadano',
        status: 'pendiente'
      }]);
    if (error) {
      console.error("Error al reportar:", error);
      alert("Hubo un problema enviando el reporte.");
    } else {
      alert("Reporte enviado a la central de seguridad.");
    }
  };

  const handleOpenProjector = (user) => {
    setActiveUser(user);
  };

  const handleGoToShop = (user) => {
    setProjectingUser(null);
    setSelectedCard(user);
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* 1. FONDO DE VIDEOS */}
      <div className="absolute inset-0 z-0">
        {step === 0 && !projectingUser && (
          !realityMode ? <RealityTuner onSelect={setRealityMode} /> :
          realityMode === 'este'  ? <ChannelEste  videoUsers={hubVideos} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={handleOpenProfile} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} /> :
          realityMode === 'oeste' ? <ChannelOeste videoUsers={hubVideos} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={handleOpenProfile} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} /> :
          realityMode === 'moon'  ? <ChannelMoon  videoUsers={hubVideos} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={handleOpenProfile} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} /> :
          <BioForest videoUsers={hubVideos} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={handleOpenProfile} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} />
        )}
          
        {(step === 1 || step === 2) && (
          <video
            key={step === 1 ? (ososModo === 'retorno' ? 'ososia_recepcion2' : 'ososia_recepcion_v3') : intent}
            src={
              step === 1
                ? ososModo === 'retorno'
                  ? "https://media.bro7vision.com/ososia_recepcion2.mp4"
                  : "https://media.bro7vision.com/ososia_recepcion_v3.mp4"
                : intent === 'ai'              ? "https://media.bro7vision.com/oraculo.mp4"
                : intent === 'game'            ? "https://media.bro7vision.com/game_bg.mp4"
                : intent === 'lives'           ? "https://media.bro7vision.com/brolives1.mp4"
                : intent === 'internal_search' ? "https://media.bro7vision.com/reinos.mp4"
                : getVideoForLocation(scope)
            }
            autoPlay loop muted playsInline
            className="w-full h-full object-cover transition-opacity duration-1000 animate-fadeIn"
          />
        )}     
      </div>

      {/* 2. PUERTA IZQUIERDA */}
      <div className={`side-panel side-panel-left ${isLeftOpen ? 'open' : ''} flex flex-col items-stretch p-0 overflow-y-auto custom-scrollbar`}>
        <div className="mt-8 w-full px-4">
          <div className="w-full transform scale-100 origin-left">
            <WalletWidget balances={balances} onClick={() => setShowWalletModal(true)} />
          </div>
        </div>
        <div className="w-full flex justify-center my-2">
          <MoonMatrixCircle />
        </div>
        <div className="px-4 mt-4">
          <button 
            onClick={() => { setStep(0); setRealityMode(null); setIsRightOpen(false); }} 
            className="w-full flex justify-between items-center p-3 bg-fuchsia-500/10 border border-fuchsia-400/40 rounded-2xl hover:bg-cyan-500 hover:text-black transition-all group"
          >
            <span className="text-[10px] font-black uppercase group-hover:text-black">Cambiar Reality</span>
            <span className="text-lg">🌐</span>
          </button>
        </div>                  
        
        <div className="flex flex-col gap-2 px-4 mt-4">
          <button 
            onClick={() => setShowRadar(!showRadar)} 
            className={`flex items-center gap-4 p-4 border rounded-2xl transition-all ${showRadar ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/5 border-yellow/10'}`}
          >
            <span className="text-xl">🔍</span>
            <span className="text-[10px] font-black uppercase">Scan Reality</span>
          </button>
          {showRadar && (
            <div className="bg-black/90 border border-cyan-500/50 rounded-xl p-3">
              <input 
                autoFocus 
                type="text" 
                placeholder="BUSCAR..." 
                value={radarQuery} 
                onChange={(e) => setRadarQuery(e.target.value)} 
                className="w-full bg-transparent border-b border-white/20 text-white text-[10px] p-2 outline-none mb-2" 
              />
              <div className="max-h-32 overflow-y-auto flex flex-col gap-1">
                {realItems.filter(u => u.alias?.toLowerCase().includes(radarQuery.toLowerCase())).slice(0,5).map(u => (
                  <button 
                    key={u.id} 
                    onClick={() => { setStep(0); setSelectedForestUser(u); setShowRadar(false); setIsLeftOpen(false); }} 
                    className="text-[10px] p-2 hover:bg-cyan-500/20 text-left rounded truncate font-bold uppercase"
                  >
                    {u.alias}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col w-full pb-10">
          <div className="w-full px-4 mb-4">
            <p className="text-[8px] text-blue-500 font-bold uppercase mb-2 tracking-widest ml-1">Audio & Lives Player</p>
            <BroLives 
              playingCreator={audioUser} 
              onToggleAudio={() => setAudioUser(prev => prev ? null : audioUser)}
            />
          </div>
          <div className="w-full px-4 pt-4 border-t border-white/5">
            <BroTuner ref={broTunerRef} />
          </div>
        </div>
      </div>      

      {/* 3. PUERTA DERECHA */}
      <div className={`side-panel side-panel-right ${isRightOpen ? 'open' : ''} flex flex-col p-6 gap-3 items-end`}>
        <div className="mt-0 w-full"></div>

        <div className="w-full flex flex-col gap-1 mt-4">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-right mb-2 font-mono">Navegación</p>
          
          {[
            { id: 'gps',             label: 'GPS / RUTA',       icon: '📍' },
            { id: 'broshop',         label: 'BROSHOP',          icon: '🛒🦝' },
            { id: 'lives',           label: 'AUDIO & LIVES',    icon: '🎧' },
            { id: 'internal_search', label: 'REINOS',           icon: '👑' }, 
            { id: 'ai',              label: 'GUÍA / ORÁCULO',   icon: '🐱🐯' },
            { id: 'game',            label: 'GAMES',            icon: '🖱️' }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleNavigation(item.id)} 
              className="w-full flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 group transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-cyan-400">
                {item.label}
              </span>
              <span className="text-lg">{item.icon}</span>
            </button>
          ))}
        </div>
        
        <button onClick={() => setShowBooster(true)} className="w-full p-5 border border-cyan-500/30 bg-cyan-500/10 rounded-2xl text-cyan-400 font-mono text-[14px] hover:bg-cyan-500 hover:text-black mt-4">[ BOOSTER STUDIO ]</button>
        
        <button onClick={() => { setShowStory(true); setIsLeftOpen(false); }} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 border border-fuchsia-500/30 rounded-2xl">
          <span className="text-xl">❄️</span>
          <span className="text-[10px] font-black italic">BRO STORIES</span>
        </button>  
        
        <button 
          onClick={() => handleReportIssue()} 
          className="w-full flex justify-between items-center p-4 bg-red-900/20 border border-red-500/30 rounded-2xl hover:bg-red-500/20 group transition-all mt-4"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400 group-hover:text-white">
            REPORTAR INCIDENCIA
          </span>
          <span className="text-lg">🚩</span>
        </button>

        <button 
          onClick={() => setShowLegal(true)} 
          className="w-full flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 group transition-all"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-cyan-400">
            LEGAL / CREADOR
          </span>
          <span className="text-lg">⚖️</span>
        </button>
        
        <button onClick={async () => { await supabase.auth.signOut(); localStorage.clear(); window.location.href = "/"; }} className="mt-auto text-red-500 font-mono text-[10px] underline">[ DISCONNECT ]</button>
      </div>
          
      {/* 4. GATILLOS PUERTAS */}
      <button onClick={() => setIsLeftOpen(!isLeftOpen)} className={`fixed top-1/2 -translate-y-1/2 left-0 z-[100] h-24 w-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-r-2xl flex items-center justify-center transition-all ${isLeftOpen ? 'left-64' : 'left-0'}`}><span className="text-cyan-400 text-xs">{isLeftOpen ? '◀' : '▶'}</span></button>
      <button onClick={() => setIsRightOpen(!isRightOpen)} className={`fixed top-1/2 -translate-y-1/2 right-0 z-[100] h-24 w-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-l-2xl flex items-center justify-center transition-all ${isRightOpen ? 'right-64' : 'right-0'}`}><span className="text-fuchsia-400 text-xs">{isRightOpen ? '▶' : '◀'}</span></button>

      {/* 5. DASHBOARD CENTRAL */} 
      {step === 2 && (
        <div className="relative z-50 w-full h-full flex items-center justify-center pointer-events-none p-4">
          <div className="w-full max-w-6xl h-full md:h-auto pointer-events-auto overflow-y-auto">
            <NexusDashboard 
              intent={intent}
              setIntent={setIntent}
              items={filteredItems}
              onHoverCard={(user) => setActivePrismUser(user)}
              scope={scope} 
              onBack={() => setStep(0)} 
              onGameWin={handleGameWin}
              step={step}
              setStep={setStep}
              session={session}
              balances={balances}
              setBalances={setBalances}
              realItems={realItems}
              setProjectingUser={setProjectingUser}
              onOpenProjector={(user) => setProjectingUser(user)} 
              onTuneIn={(user) => setAudioUser(user)} 
              onOpenVideo={(user) => setProjectingUser(user)} 
              handleGoToShop={handleGoToShop}
              onOpenLog={setSelectedLog} 
              sessionCP={sessionCP}
              sessionCity={sessionCity}
              sessionRef={sessionRef}
              onVLChange={(vl) => setVlData(vl)}
              ososHandoffContext={ososHandoffContext}
              onHandoffConsumed={() => setOsosHandoffContext(null)}
            />
          </div>
        </div>
      )}      

      {/* HOLOPRISMA — BroShop o Lives, excluido en Avisos y Oráculo */}
      {step === 2 && (intent === 'broshop' || intent === 'lives') && 
       ososHandoffContext?.intencion !== 'BROSHOP_AVISO' && (
        <div className="hidden md:flex fixed left-1/2 top-[24%] -translate-x-1/2 -translate-y-1/2 z-[40] flex-col items-center animate-fadeIn pointer-events-none">
          <div className="scale-[1.1] origin-bottom-right relative z-20 transition-transform hover:scale-[1.15]">
            <HoloPrism 
              user={activePrismUser}
              showNumbers={true}
            />
          </div>
        </div>
      )}

      {/* SLIDE RAILS */}
      {step === 2 && intent === 'broshop' && !ososHandoffContext?.intencion              && <SlideRail />}
      {step === 2 && intent === 'broshop' && ososHandoffContext?.intencion === 'BROSHOP_PRODUCTO' && <SlideRail />}
      {step === 2 && intent === 'broshop' && ososHandoffContext?.intencion === 'BROSHOP_SERVICIO' && <SlideRailServicios />}
      {step === 2 && intent === 'broshop' && ososHandoffContext?.intencion === 'BROSHOP_AVISO'    && <SlideRailAvisos />}
      {step === 2 && intent === 'lives'   && <SlideRailAudio />}

      {/* NOVA BANNER — BroShop Productos */}
      {step === 2 && intent === 'broshop' && ososHandoffContext?.intencion !== 'BROSHOP_SERVICIO' && ososHandoffContext?.intencion !== 'BROSHOP_AVISO' && ( 
        <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
          {stripVisible && (
            <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
              <BroCardStrip
                cards={stripCards}
                onSelectCard={(card) => novaBannerRef.current.sendMessage(`¿Qué es el ${card.bro_id}?`)}
                accentColor="gold"
                label={stripLabel}
                visible={stripVisible}
              />
            </div>
          )}
          <div className="w-full max-w-2xl mb-3 pointer-events-auto">
            <NovaBanner
              ref={novaBannerRef}
              sessionCity={sessionCity}
              sessionCP={sessionCP}
              realItems={realItems}
              onOpenTerminal={handleGoToShop}
              onSetActiveIndex={setHoloPrismaIndex}
              onInvokeOsos={() => setOsosFooterOpen(true)}
              onEntityFocus={(user) => setActivePrismUser(user)}
            />
          </div>
          <div className="w-full max-w-2xl pointer-events-auto mb-4">
            <AgentChatInput
              onSend={handleNovaInput}
              color="gold"
              placeholder="✦  ¿Qué estás buscando hoy?"
            />
          </div>
        </div>
      )}

      {/* ISABELLA BANNER — BroShop Servicios */}
      {step === 2 && intent === 'broshop' && ososHandoffContext?.intencion === 'BROSHOP_SERVICIO' && (
        <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
          {stripVisible && (
            <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
              <BroCardStrip
                cards={stripCards}
                onSelectCard={(card) => serviciosBannerRef.current.sendMessage(`¿Qué es ${card.bro_id}?`)}
                accentColor="slate"
                label={stripLabel}
                visible={stripVisible}
              />
            </div>
          )}
          <div className="w-full max-w-2xl mb-3 pointer-events-auto">
            <ServiciosBanner
              ref={serviciosBannerRef}
              personaje={perfilOso?.servicios_personaje || 'isabella'}
              sessionCity={sessionCity}
              sessionCP={sessionCP}
              realItems={realItems}
              onOpenTerminal={handleGoToShop}
              onInvokeOsos={() => setOsosFooterOpen(true)}
              onEntityFocus={(user) => setActivePrismUser(user)}
            />
          </div>
          <div className="w-full max-w-2xl pointer-events-auto mb-4">
            <AgentChatInput
              onSend={handleServiciosInput}
              color="slate"
              placeholder="✦  ¿Qué servicio necesitas?"
            />
          </div>
        </div>
      )}

      {/* EVELYN BANNER — BroShop Avisos */}
      {step === 2 && intent === 'broshop' && ososHandoffContext?.intencion === 'BROSHOP_AVISO' && (
        <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
          {stripVisible && (
            <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
              <BroCardStrip
                cards={stripCards}
                onSelectCard={(card) => evelynBannerRef.current.sendMessage(`Dime qué es el ${card.bro_id}`)}
                accentColor="orange"
                label={stripLabel}
                visible={stripVisible}
              />
            </div>
          )}
          <div className="w-full max-w-2xl mb-3 pointer-events-auto">
            <EvelynBanner
              ref={evelynBannerRef}
              personaje={perfilOso?.avisos_personaje || 'evelyn'}
              sessionCity={sessionCity}
              sessionCP={sessionCP}
              genesis={balances.genesis}
              alias={perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano'}
              bro_id={perfilOso?.bro_id || ''}
              realItems={realItems}
              onInvokeOsos={() => setOsosFooterOpen(true)}
              onAvisoConectar={(aviso) => {
                const newBalance = balances.genesis - 200;
                setBalances(prev => ({ ...prev, genesis: newBalance }));
                supabase.from('profiles').update({ genesis: newBalance }).eq('id', session.user.id);
                supabase.from('mensajes_privados').insert([{
                  from_user_id: session.user.id,
                  to_user_id:   aviso.user_id,
                  from_alias:   perfilOso?.osos_nombre || 'Ciudadano',
                  text:         `Conexión iniciada desde aviso: ${aviso.title}`,
                  aviso_id:     aviso.id,
                }]);
                const autorProfile = realItems.find(i => i.id === aviso.user_id);
                if (autorProfile) setProjectingUser(autorProfile);
              }}
              onAvisoPublicar={async ({ titulo, contenido, tipo }) => {
                if (balances.genesis < 200) return;
                const expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + 7);
                await supabase.from('avisos').insert([{
                  user_id:        session.user.id,
                  author_alias:   perfilOso?.osos_nombre || 'Ciudadano',
                  type:           tipo,
                  title:          titulo,
                  content:        contenido,
                  city:           sessionCity || '',
                  cost_to_reveal: 200,
                  expires_at:     expireDate.toISOString(),
                }]);
                const newBalance = balances.genesis - 200;
                setBalances(prev => ({ ...prev, genesis: newBalance }));
                supabase.from('profiles').update({ genesis: newBalance }).eq('id', session.user.id);
              }}
            />
          </div>
          <div className="w-full max-w-2xl pointer-events-auto mb-4">
            <AgentChatInput
              onSend={(text) => evelynBannerRef.current?.sendMessage(text)}
              color="orange"
              placeholder="✦  ¿Qué aviso buscas o quieres publicar?"
            />
          </div>
        </div>
      )}

      {/* MAPACHE BANNER — Audio & Lives */}
      {step === 2 && intent === 'lives' && (
        <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
          {stripVisible && (
            <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
              <BroCardStrip
                cards={stripCards}
                onSelectCard={(card) => mapacheBannerRef.current.sendMessage(`Ponme algo de ${card.nombre}`)}
                accentColor="cyan"
                label={stripLabel}
                visible={stripVisible}
              />
            </div>
          )}
          <div className="w-full max-w-2xl mb-3 pointer-events-auto">
            <MapacheBanner
              ref={mapacheBannerRef}
              personaje={perfilOso?.audio_personaje || 'mapache'}
              realItems={realItems}
              findChannelByAlias={findChannelByAlias}
              checkIfNew={checkIfNew}
              onInvokeOsos={() => setStep(1)}
              onInvokeNova={() => setIntent('broshop')}
              onOpenProfile={handleOpenProfile}
              onTuneIn={(user) => { setAudioUser(user); setActivePrismUser(user); }}
              onTuneTuner={(id) => broTunerRef.current?.playById(id)}
              onStopTuner={() => broTunerRef.current?.stop()}
            />
          </div>
          <div className="w-full max-w-2xl pointer-events-auto mb-4">
            <AgentChatInput
              onSend={handleMapacheInput}
              isLoading={mapacheLoading}
              color="cyan"
              placeholder="✦  ¿Qué ponemos? Dime el estado de ánimo, canal o artista..."
            />
          </div>
        </div>
      )}

      {/* ORÁCULO BANNER — Orumama / Jaguar */}
      {step === 2 && intent === 'ai' && (
        <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
          <div className="w-full max-w-2xl mb-3 pointer-events-auto">
            <OraculoBanner
              ref={oraculoBannerRef}
              oraculo_personaje={perfilOso?.oraculo_personaje || 'orumama'}
              alias={perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano'}
              realItems={realItems}
              onInvokeOsos={() => { setStep(1); setOsosModo('entrada'); }}
            />
          </div>
          <div className="w-full max-w-2xl pointer-events-auto mb-4">
            <AgentChatInput
              onSend={handleOraculoInput}
              color="green"
              placeholder="✦  Consulta al oráculo..."
            />
          </div>
        </div>
      )}

      {/* 6. OSOS IA RECEPCION */}   
      {step === 1 && (
        <div className="relative z-[50] h-full flex flex-col items-center justify-end pb-0 px-4">
          <div className="w-full max-w-2xl mb-3">
            <OsosBanner mensaje={ososMensaje} />
          </div>
          {ososBolas.length > 0 && (
            <div className="flex gap-3 mb-3 flex-wrap justify-center max-w-2xl">
              {ososBolas.map((bola, i) => (
                <button
                  key={i}
                  onClick={() => handleOsosInput(bola.texto)}
                  className="px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #ff69d4, #c800a1)',
                    borderColor: '#ff69d4',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(200,0,161,0.6), inset 0 0 10px rgba(255,255,255,0.15)',
                    animation: `floatBola ${1.8 + i * 0.3}s ease-in-out infinite`,
                  }}>
                  {bola.texto}
                </button>
              ))}
            </div>
          )}
          <AgentChatInput
            onSend={(texto) => handleOsosInput(texto)} 
            isLoading={ososLoading} 
          />
        </div>
      )}

      {/* 7. MODALES Y TELEFONO CASA */}
      
      {showLegal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10 rounded-3xl bg-zinc-950 shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black"><span className="text-cyan-400 font-mono text-xs">LEGAL_TERMINAL_V1.0</span><button onClick={() => setShowLegal(false)} className="text-white text-2xl">×</button></div>
            <div className="flex-1 overflow-y-auto p-8 text-gray-400 font-mono text-sm leading-relaxed"><LegalTerminal onClose={() => setShowLegal(false)} /></div>
          </div>
        </div>
      )}
      
      {showStory && (
        <div className="fixed inset-0 z-[200] bg-black">
          <StoryPlayer 
            src="https://media.bro7vision.com/brostories_demo.mp4"
            activePhase="nova"
            balances={balances} 
            setBalances={setBalances}
            isAdsMode={true} 
            onClose={() => setShowStory(false)} 
            onComplete={(amount) => {
              setBalances(prev => ({ ...prev, genesis: prev.genesis + amount }));
            }} 
          />
        </div>
      )}
      
      {showWalletModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl">
          <ConversionModal 
            balances={balances} 
            setBalances={setBalances}
            session={session}
            activePhase={getMoonSuffix()}
            onClose={() => setShowWalletModal(false)} 
          />
        </div>
      )}

      {showBooster && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center">
          <BoosterModal onClose={() => setShowBooster(false)} />
        </div>
      )}
      
      {/* TELEFONO CASA / HOLOPROJECTOR */}
      {projectingUser && !is219Mode && (
        <HoloProjector 
          videoUrl={projectingUser.video_file || projectingUser.videoUrl} 
          user={projectingUser} 
          handleGoToShop={handleGoToShop}
          balances={balances} 
          setBalances={setBalances} 
          session={session}
          onOpenLog={setSelectedLog} 
          onClose={() => { setProjectingUser(null); setIs219Mode(false); }} 
          onGoTo219={() => setIs219Mode(true)} 
        />
      )}

      {/* TERMINAL SHOP (PAGOS) */}
      {selectedCard && (
        <PaymentModal 
          card={selectedCard} 
          balances={balances}
          setBalances={setBalances}
          onClose={() => setSelectedCard(null)} 
        />
      )}

      {/* REINOS */}
      {intent === 'internal_search' && step === 2 && (
        <div className="fixed inset-x-0 top-[10%] bottom-[16%] z-[90] pointer-events-auto mx-auto max-w-5xl px-4">
          <Reinos
            onClose={() => { setStep(0); setIntent(null); }}
            session={session}
            balances={balances}
            setBalances={setBalances}
            onNavigateToSantuario={(targetUserId) => {
              const targetUser = realItems.find(u => u.id === targetUserId);
              if (targetUser) {
                setProjectingUser(targetUser);
                setIntent(null);
              }
            }}
          />
        </div>
      )}
      
      {selectedLog && <BroLogViewer log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}

export default App;
