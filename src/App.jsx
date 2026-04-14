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
import IsabellaBanner from './components/IsabellaBanner';
import SlideRailServicios from './components/SlideRailServicios';
import EvelynBanner from './components/EvelynBanner';
import SlideRailAvisos from './components/SlideRailAvisos';
import OraculoBanner from './components/OraculoBanner';
import AvisoPreviewCard from './components/AvisoPreviewCard';
import CityLocationBanner from './components/CityLocationBanner';
import { WebLLMButton } from './components/WebLLMButton';

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

  const [ventasMode, setVentasMode] = useState(null);
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

  const [stripCards,   setStripCards]   = useState([]);
  const [stripLabel,   setStripLabel]   = useState('');
  const [stripVisible, setStripVisible] = useState(false);
  const broTunerRef = useRef(null);

  const [sessionCP, setSessionCP]     = useState('');
  const [sessionCity, setSessionCity] = useState('');
  const [sessionRef, setSessionRef]   = useState('');
  const [vlData, setVlData]           = useState(null);

 
  const [mapacheLoading, setmapacheLoading] = useState(false);
  const [ososModo, setOsosModo] = useState('entrada');
  const [perfilOso, setPerfilOso] = useState(null);
  const [avisoPendiente, setAvisoPendiente] = useState(null);

  const abrirTienda = (comercio, mode = 'novaVentas') => {
    setProjectingUser(null);
    setSelectedCard(comercio);
    setVentasMode(mode);
  };

  const handleGoToShop = (user, mode = 'novaVentas') => {
    abrirTienda(user, mode);
  };

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
    onHandoff: ({ agente, ciudad, cp, intencion, comercio, modalidad, oso_id, per_solicitado }) => {

  // ── OSOS_INTERNO — cambio de oso sin salir del sector ──
  if (agente === 'OSOS_INTERNO') {
    setPerfilOso(prev => ({ ...prev, oso_id: oso_id }));
    return;
  }

  // ── NOVA_VENTAS ────────────────────────────────────────
  if (agente === 'NOVA_VENTAS') {
  const bro_id_target = comercio || intencion;
  const comercioTarget = realItems.find(i => 
    i.bro_id  === bro_id_target ||
    i.bro_ser === bro_id_target
  );
  if (comercioTarget) abrirTienda(comercioTarget, 'novaVentas');
  return;
}
  // ── ISABELLA_CIERRE────────────────────────────────────
  if (agente === 'ISABELLA_CIERRE') {
  const bro_id_target = comercio || intencion;
  const comercioTarget = realItems.find(i => 
    i.bro_ser === bro_id_target ||
    i.bro_id  === bro_id_target
  );
  if (comercioTarget) abrirTienda(comercioTarget, 'isabellaVentas');
  return;
}

  // ── MAPEO DE INTENTS — incluye destinos PER del Oráculo ─
  const intentMap = {
    'BROSHOP_PRODUCTO': 'productos',
    'BROSHOP_SERVICIO': 'servicios',
    'BROSHOP_AVISO':    'avisos',
    'AUDIO':            'lives',
    'REINOS':           'internal_search',
    'ORACULO':          'ai',
    'ORACULO_ORUMAMA':  'ai',
    'ORACULO_SMISTERIO':   'ai',
    'ORACULO_JAGUAR':   'ai',
    'GAMES':            'game',
  };
  

  // ── Sectores sin ubicación ─────────────────────────────
  const SIN_UBICACION = ['REINOS', 'ORACULO', 'ORACULO_ORUMAMA', 'ORACULO_SMISTERIO', 'ORACULO_JAGUAR', 'GAMES'];

  if (SIN_UBICACION.includes(agente)) {
    // Si lleva per_solicitado (Orumama/SMisterio/Jaguar), se lo pasamos a perfilOso
    // para que OraculoBanner arranque con el personaje correcto
    if (per_solicitado) {
      setPerfilOso(prev => ({ ...prev, oraculo_personaje: per_solicitado }));
    }
    setIntent(intentMap[agente] || 'ai');
    setOsosModo('retorno');
    setStep(2);
    return;
  }

  // ── Sectores con ubicación ─────────────────────────────
  setOsosHandoffContext({ intencion, comercio_especifico: comercio, modalidad });

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
    .select('bro_id, bro_ser, bro_avi, bro_aud, bro_pod, banner_url, alias, biz_category, biz_profession, city, address, nearby_ref, ref_price, description, role, audio_type, track_name, audio_description, audio_file')
    .limit(20);
  if (!esPais && ciudad) query = query.ilike('city', `%${ciudad}%`);

  const { data: perfiles, error } = await query;

  const filtrados = perfiles?.filter(p =>
  Array.isArray(p.role) ? p.role.includes(roleBuscado) : p.role === roleBuscado
) || [];

  console.log('[AUDIO DEBUG]', {
    agente,
    roleBuscado,
    totalPerfiles: perfiles?.length,
    filtrados: filtrados.length,
    muestraFiltrado: filtrados[0],
  });

  const cards = agente === 'AUDIO'
  ? filtrados.flatMap(p => {
      if (!p.bro_aud && !p.bro_pod) return [];
      const esPodcast = p.audio_type === 'podcast';
      const codigo    = esPodcast ? p.bro_pod : p.bro_aud;
      if (!codigo) return [];
      return [{
        bro_id:      codigo,
        banner_url:  p.banner_url || '',
        nombre:      p.alias || '',
        categoria:   esPodcast ? 'Podcast' : 'Música',
        ciudad:      p.city || '',
        descripcion: p.audio_description || p.description || '',
        track_name:  p.track_name || '',
        audio_type:  p.audio_type || 'music',
      }];
    })
  : agente === 'BROSHOP_SERVICIO'
  ? filtrados.filter(p => p.bro_ser).map(p => ({
      bro_id:      p.bro_ser,
      banner_url:  p.banner_url || '',
      nombre:      p.alias || '',
      categoria:   p.biz_profession || p.biz_category || '',
      ciudad:      p.city || '',
      descripcion: p.description || '',
      ref_price:   p.ref_price || '',
      address:     p.address || '',
    }))
  : agente === 'BROSHOP_AVISO'
  ? filtrados.filter(p => p.bro_avi).map(p => ({
      bro_id:      p.bro_avi,
      banner_url:  p.banner_url || '',
      nombre:      p.alias || '',
      categoria:   'Avisos',
      ciudad:      p.city || '',
      descripcion: p.description || '',
    }))
  : filtrados.filter(p => p.bro_id).map(p => ({
      bro_id:      p.bro_id,
      banner_url:  p.banner_url || '',
      nombre:      p.alias || '',
      categoria:   p.biz_category || p.biz_profession || '',
      ciudad:      p.city || '',
      descripcion: p.description || p.nearby_ref || '',
      ref_price:   p.ref_price || '',
      address:     p.address || '',
    }));    
      if (!error && cards.length > 0) {
    setStripCards(cards);
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
  const ciudadFinal = ciudad || perfilOso?.city || '';
  setScope({ city: String(ciudadFinal), type: 'teleport' });
  setSessionCity(ciudadFinal);
  setSessionCP(cp);
  setIntent(intentMap[agente] || 'productos');
  setOsosModo('retorno');
  setStep(2);
}, 2000);
},  });

  const [balances, setBalances] = useState({ genesis: 0, vales: { nova: 0, crescens: 0, plena: 0, decrescens: 0 }, eco_p: 0, eco_gen: 0, halos_p: 0, halos_gen: 0, zap_p: 0, zap_gen: 0 });
  const [savedUserIndex, setSavedUserIndex] = useState(0);

  const handleOpenProfile = (user) => {
    const { _savedIndex, ...cleanUser } = user;
    setSavedUserIndex(_savedIndex || 0);
    setProjectingUser(cleanUser);
  };

  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  
  const handleGameWin = async (amount) => {
    const newTotal = balances.genesis + amount;
    setBalances(prev => ({ ...prev, genesis: newTotal }));
    if (session?.user?.id) {
      await supabase.from('profiles').update({ genesis: newTotal }).eq('id', session.user.id);
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
    } else if (['productos', 'servicios', 'avisos', 'lives'].includes(targetIntent) && !scope) {
      // Necesitan ciudad sí o sí, los enviamos a los Osos
      setStep(1);
      setOsosModo('entrada');
    } else {
      // Tienen ciudad o no la necesitan (Games, Reinos, Oraculo)
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
          vales: { nova: prof.nova || 0, crescens: prof.crescens || 0, plena: prof.plena || 0, decrescens: prof.decrescens || 0 },
          eco_p: prof.eco_p || 0, eco_gen: prof.eco_gen || 0, halos_p: prof.halos_p || 0, halos_gen: prof.halos_gen || 0, zap_p: prof.zap_p || 0, zap_gen: prof.zap_gen || 0
        });
      }      
      const { data: all } = await supabase.from('profiles').select('*');
     if (all) {
  setRealItems(all.map(u => ({
    ...u,
    shopName: u.alias,
    name:     u.product_title || u.alias,
    img:      u.card_banner_url || u.banner_url,
    type:     u.video_file ? ['shop', 'live'] : ['shop'],
  })).filter(u => 
    u.video_file   ||
    u.audio_file   ||
    u.product_title ||
    u.bro_ser      ||   // ← profesional de servicios
    u.bro_aud      ||   // ← creador de música
    u.bro_pod      ||   // ← podcaster
    u.bro_avi      ||   // ← usuario con avisos
    u.bro_id            // ← comercio de productos
  ));
}
    };
    fetchData();
  }, [session, step]);

  const filteredItems = useMemo(() => {
    const supabaseItems = realItems.map(u => ({
      ...u, id: u.id, name: u.product_title || u.alias, img: u.card_banner_url || u.banner_url || '/default.png',
      price: u.price || 0, type: u.video_file ? ['shop', 'live'] : ['shop'], source: 'supabase'
    }));

    const masterItems = MASTER_DB.map(m => ({ ...m, id: m.id, name: m.name, img: m.img || '/default.png', price: m.price || 15, type: m.type || ['shop'], source: 'master' }));
    const ALL = [...supabaseItems, ...masterItems];

    if (['productos', 'servicios', 'avisos'].includes(intent)) return ALL.filter(i => i.type?.includes('shop'));
    if (intent === 'lives')   return ALL.filter(i => i.type?.includes('live'));
    return ALL;
  }, [intent, realItems]);  
  
  const hubVideos = useMemo(() => {
    const masterVideos = MASTER_DB.filter(m => m.video_file).map(m => ({ ...m, id: m.id, alias: m.name || m.alias, source: 'master' }));
    const supabaseVideos = realItems.filter(i => i.video_file).map(i => ({ ...i, alias: i.alias, id: i.id, source: 'supabase' }));
    return [{ alias: "BRO MASTER", video_file: "https://media.bro7vision.com/Mapache-habla.mp4", id: "bro_master" }, ...masterVideos, ...supabaseVideos];
  }, [realItems]);
  
  const { findChannelByAlias, checkIfNew } = useAudioData({ realItems });
    
  if (!session && !isGuest) {
    return <GenesisGate onGuestAccess={() => { setIsGuest(true); setStep(0); setRealityMode(null); setBalances({ genesis: 500, nova: 20 }); }} />;
  }

  const handleReportIssue = async () => {
    const { error } = await supabase.from('reports_board').insert([{ user_id: session?.user?.id || null, scene: realityMode || 'lobby', reason: 'Reporte ciudadano', status: 'pendiente' }]);
    if (!error) alert("Reporte enviado a la central de seguridad.");
  };

  // ─── NAV ITEMS (PUERTA DERECHA) ───────────────────────────
  const navItems = [
    { id: 'gps',             label: 'RUTA', color: 'border-fuchsia-500/40 hover:bg-fuchsia-900/40 hover:border-fuchsia-400 group-hover:text-fuchsia-300', images: ['/emojis/lara.webp', '/emojis/tito.webp', '/emojis/puffo.webp'] },
    { id: 'productos',       label: 'PRODUCTOS',  color: 'border-yellow-500/40 hover:bg-yellow-900/40 hover:border-yellow-400 group-hover:text-yellow-400', images: ['/emojis/nova.webp'] },
    { id: 'servicios',       label: 'SERVICIOS',  color: 'border-rose-900/50 hover:bg-rose-900/40 hover:border-rose-600 group-hover:text-rose-400', images: ['/emojis/isabella.webp', '/emojis/prmaestro.webp'] },
    { id: 'avisos',          label: 'AVISOS',     color: 'border-slate-500/40 hover:bg-slate-800/60 hover:border-slate-400 group-hover:text-slate-300', images: ['/emojis/evelyn.webp', '/emojis/larry.webp'] },
    { id: 'lives',           label: 'AUDIOS',color: 'border-cyan-500/40 hover:bg-cyan-900/40 hover:border-cyan-400 group-hover:text-cyan-400', images: ['/emojis/mapache.webp', '/emojis/ami.webp'] },
    { id: 'internal_search', label: 'REINOS',     color: 'border-orange-500/40 hover:bg-orange-900/40 hover:border-orange-400 group-hover:text-orange-400', images: ['/emojis/rumores.webp'] },
    { id: 'ai',              label: 'ORÁCULO',    color: 'border-lime-500/40 hover:bg-lime-900/40 hover:border-lime-400 group-hover:text-lime-400', images: ['/emojis/orumama.webp', '/emojis/smisterio.webp', '/emojis/jaguar.webp'] },
    { id: 'game',            label: 'GAMES',      color: 'border-white/20 hover:bg-white/10 hover:border-white/50 group-hover:text-white', images: ['/emojis/emoji_5.webp', '/emojis/emoji_7.webp'] }
  ];
  
  // CITYLOCATIONBANNER
const INTENTS_CON_UBICACION = new Set(['productos', 'servicios', 'avisos', 'lives']);


  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* 1. FONDO DE VIDEOS */}
      <div className="absolute inset-0 z-0">
       {step === 0 && !projectingUser && !selectedCard && (
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
                  ? "https://media.bro7vision.com/ososia_recepcion1.mp4"
                  : "https://media.bro7vision.com/ososia_recepcion1.mp4"
                : intent === 'ai'              ? "https://media.bro7vision.com/oraculo1.mp4"
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
        <div className="mt-8 w-full px-4"><WalletWidget balances={balances} onClick={() => setShowWalletModal(true)} /></div>
        <div className="w-full flex justify-center my-2"><MoonMatrixCircle /></div>
        <div className="px-4 mt-4">
          <button onClick={() => { setStep(0); setRealityMode(null); setIsRightOpen(false); }} className="w-full flex justify-between items-center p-3 bg-fuchsia-500/10 border border-fuchsia-400/40 rounded-2xl hover:bg-cyan-500 hover:text-black transition-all group">
            <span className="text-[10px] font-black uppercase group-hover:text-black">Cambiar Reality</span><span className="text-lg">🌐</span>
          </button>
        </div>    
       <div className="w-full flex justify-center my-2">
       <WebLLMButton
  mode={
    intent === 'productos'       ? 'novaExplora'  :
    intent === 'servicios'       ? 'servicios'    :
    intent === 'lives'           ? 'mapache'      :
    intent === 'avisos'          ? 'avisos'       :
    intent === 'ai'              ? 'oraculo'      :
    intent === 'internal_search' ? 'reinos'       :
    'osos'
  }
  contextData={{
    oso_id:              perfilOso?.oso_id              || 'TITO',
    oraculo_personaje:   perfilOso?.oraculo_personaje   || 'orumama',
    servicios_personaje: perfilOso?.servicios_personaje || 'isabella',
    audio_personaje:     perfilOso?.audio_personaje     || 'mapache',
    avisos_personaje:    perfilOso?.avisos_personaje    || 'evelyn',
  }}
/>
            </div>
        <div className="flex flex-col gap-2 px-4 mt-4">
          <button onClick={() => setShowRadar(!showRadar)} className={`flex items-center gap-4 p-4 border rounded-2xl transition-all ${showRadar ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/5 border-yellow/10'}`}>
            <span className="text-xl">🔍</span><span className="text-[10px] font-black uppercase">Scan Reality</span>
          </button>
          {showRadar && (
            <div className="bg-black/90 border border-cyan-500/50 rounded-xl p-3">
              <input autoFocus type="text" placeholder="BUSCAR..." value={radarQuery} onChange={(e) => setRadarQuery(e.target.value)} className="w-full bg-transparent border-b border-white/20 text-white text-[10px] p-2 outline-none mb-2" />
              <div className="max-h-32 overflow-y-auto flex flex-col gap-1">
                {realItems.filter(u => u.alias?.toLowerCase().includes(radarQuery.toLowerCase())).slice(0,5).map(u => (
                  <button key={u.id} onClick={() => { setStep(0); setSelectedForestUser(u); setShowRadar(false); setIsLeftOpen(false); }} className="text-[10px] p-2 hover:bg-cyan-500/20 text-left rounded truncate font-bold uppercase">{u.alias}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-auto flex flex-col w-full pb-10">
          <div className="w-full px-4 mb-4"><BroLives playingCreator={audioUser} onToggleAudio={() => setAudioUser(prev => prev ? null : audioUser)} /></div>
          <div className="w-full px-4 pt-4 border-t border-white/5"><BroTuner ref={broTunerRef} /></div>
        </div>
      </div>      

      {/* 3. PUERTA DERECHA */}
      <div className={`side-panel side-panel-right ${isRightOpen ? 'open' : ''} flex flex-col p-4 gap-2 overflow-y-auto custom-scrollbar`}>
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest text-right mb-1 mt-6 font-mono">Navegación</p>
        
        <div className="w-full flex flex-col gap-2.5 flex-1 mt-2">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleNavigation(item.id)} 
              className={`w-full flex justify-between items-center p-4 bg-black/40 backdrop-blur-md border rounded-2xl transition-all group hover:scale-[1.02] active:scale-[0.98] ${item.color}`}
            >
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 transition-colors">
                {item.label}
              </span>
              <div className="flex -space-x-3">
                {item.images.map((imgSrc, idx) => (
                  <img 
                    key={idx} 
                    src={imgSrc} 
                    alt="" 
                    className="w-9 h-9 rounded-full border-2 border-black object-cover shadow-[0_0_10px_rgba(0,0,0,0.8)]" 
                  />
                ))}
              </div>
            </button>
          ))}
        </div>        
        {/* UTILIDADES COMPACTADAS */}
        <div className="mt-2 border-t border-white/10 pt-3 flex flex-col gap-2">
          <button onClick={() => setShowBooster(true)} className="w-full p-3 border border-cyan-500/30 bg-cyan-500/10 rounded-xl text-cyan-400 font-mono text-[11px] hover:bg-cyan-500 hover:text-black transition-all">[ BOOSTER STUDIO ]</button>
          
          <button onClick={() => { setShowStory(true); setIsLeftOpen(false); }} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 border border-fuchsia-500/30 rounded-xl hover:border-fuchsia-400 transition-all">
            <span className="text-sm">❄️</span><span className="text-[9px] font-black italic text-fuchsia-200">BRO STORIES</span>
          </button>  
          
          <div className="flex gap-2">
            <button onClick={() => handleReportIssue()} className="flex-1 p-2 bg-red-900/20 border border-red-500/30 rounded-xl hover:bg-red-500/20 flex justify-center items-center group transition-all" title="Reportar Incidencia">
              <span className="text-sm">🚩</span>
            </button>
            <button onClick={() => setShowLegal(true)} className="flex-1 p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 flex justify-center items-center group transition-all" title="Legal / Creador">
              <span className="text-sm text-gray-400 group-hover:text-cyan-400">⚖️</span>
            </button>
          </div>
        </div>
        
        <button onClick={async () => { await supabase.auth.signOut(); localStorage.clear(); window.location.href = "/"; }} className="mt-2 text-red-500 font-mono text-[10px] underline text-right w-full">[ DISCONNECT ]</button>
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

      {/* HOLOPRISMA */}
      {step === 2 && ['productos', 'servicios', 'lives'].includes(intent) && (
        <div className="hidden md:flex fixed left-1/2 top-[24%] -translate-x-1/2 -translate-y-1/2 z-[40] flex-col items-center animate-fadeIn pointer-events-none">
          <div className="scale-[1.1] origin-bottom-right relative z-20 transition-transform hover:scale-[1.15]"><HoloPrism user={activePrismUser} showNumbers={true} /></div>
        </div>
      )}
      
       {/* CityLocation */}

{step === 2 && INTENTS_CON_UBICACION.has(intent) && <CityLocationBanner scope={scope} />}




      {/* SLIDE RAILS EXACTOS POR INTENT */}
      {step === 2 && intent === 'productos' && <SlideRail />}
      {step === 2 && intent === 'servicios' && <SlideRailServicios />}
      {step === 2 && intent === 'avisos'    && <SlideRailAvisos />}
      {step === 2 && intent === 'lives'     && <SlideRailAudio />}

      {/* NOVA BANNER */}
      {step === 2 && intent === 'productos' && ( 
        <NovaBanner 
          sessionCity={sessionCity} 
          sessionCP={sessionCP} 
          realItems={realItems} 
          stripVisible={stripVisible}
          stripCards={stripCards}
          stripLabel={stripLabel}
          onOpenTerminal={(card) => abrirTienda(card, 'novaVentas')} 
          onSetActiveIndex={setHoloPrismaIndex} 
          onInvokeOsos={() => setStep(1)} 
          onInvokeMapache={() => setIntent('lives')}
          onEntityFocus={(user) => setActivePrismUser(user)}
          setIntent={setIntent}
        />
      )}
      
      {/* ISABELLA BANNER */}
      {step === 2 && intent === 'servicios' && (
        <IsabellaBanner 
          personaje={perfilOso?.servicios_personaje || 'isabella'} 
          sessionCity={sessionCity} 
          sessionCP={sessionCP} 
          realItems={realItems} 
          stripVisible={stripVisible}
          stripCards={stripCards}
          stripLabel={stripLabel}
          onOpenTerminal={(card) => abrirTienda(card, 'isabellaVentas')} 
          onSetActiveIndex={setHoloPrismaIndex} 
          onInvokeOsos={() => setStep(1)} 
          onInvokeMapache={() => setIntent('lives')}
          onEntityFocus={(user) => setActivePrismUser(user)} 
          setIntent={setIntent}
        />
      )}
      
      {/* EVELYN BANNER */}
      {step === 2 && intent === 'avisos' && (
        <EvelynBanner 
          personaje={perfilOso?.avisos_personaje || 'evelyn'} 
          sessionCity={sessionCity} 
          sessionCP={sessionCP} 
          genesis={balances.genesis} 
          alias={perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano'} 
          bro_id={perfilOso?.bro_id || ''} 
          realItems={realItems} 
          stripVisible={stripVisible}
          stripCards={stripCards}
          stripLabel={stripLabel}
          onInvokeOsos={() => setStep(1)} 
          
          // Lógica de conexión a Supabase se mantiene aquí en App.jsx
          onAvisoConectar={(aviso) => {
            const newBalance = balances.genesis - 200;
            setBalances(prev => ({ ...prev, genesis: newBalance }));
            supabase.from('profiles').update({ genesis: newBalance }).eq('id', session.user.id);
            supabase.from('mensajes_privados').insert([{ 
              from_user_id: session.user.id, 
              to_user_id: aviso.user_id, 
              from_alias: perfilOso?.osos_nombre || 'Ciudadano', 
              text: `Conexión iniciada desde aviso: ${aviso.title}`, 
              aviso_id: aviso.id 
            }]);
            const autorProfile = realItems.find(i => i.id === aviso.user_id);
            if (autorProfile) setProjectingUser(autorProfile);
          }}

          onAvisoPublicar={async ({ confirmado }) => {
            if (!confirmado) return;
            const newBalance = balances.genesis - 200;
            setBalances(prev => ({ ...prev, genesis: newBalance }));
            await supabase.from('profiles').update({ genesis: newBalance }).eq('id', session.user.id);
          }}
        />
      )}
      
      {/* MAPACHE BANNER */}
       {step === 2 && intent === 'lives' && (
        <MapacheBanner 
          personaje={perfilOso?.audio_personaje || 'mapache'} 
          realItems={realItems} 
          stripVisible={stripVisible}
          stripCards={stripCards}
          stripLabel={stripLabel}
          findChannelByAlias={findChannelByAlias} 
          checkIfNew={checkIfNew} 
          onInvokeOsos={() => setStep(1)} 
          onInvokeNova={() => setIntent('productos')} 
          onOpenProfile={handleOpenProfile} 
          onTuneIn={(user) => { setAudioUser(user); setActivePrismUser(user); }} 
          onTuneTuner={(id) => broTunerRef.current?.playById(id)} 
          onStopTuner={() => broTunerRef.current?.stop()} 
        />
      )}
      
      {/* ORÁCULO BOT (Todo incluido) */}
      {step === 2 && intent === 'ai' && (
        <OraculoBanner 
          oraculo_personaje={perfilOso?.oraculo_personaje || 'orumama'} 
          alias={perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano'} 
          realItems={realItems} 
          onInvokeOsos={() => { setStep(1); setOsosModo('entrada'); }} 
        />
      )}
      
      {/* 6. OSOS IA RECEPCION */}   
      {step === 1 && (
        <div className="relative z-[50] h-full flex flex-col items-center justify-end pb-0 px-4">
          <div className="w-full max-w-2xl mb-3"><OsosBanner mensaje={ososMensaje} /></div>
          <AgentChatInput onSend={(texto) => handleOsosInput(texto)} isLoading={ososLoading} agent="osos" />
        </div>
      )}      
      {/* 7. MODALES */}
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
          <StoryPlayer src="https://media.bro7vision.com/brostories_demo.mp4" activePhase="nova" balances={balances} setBalances={setBalances} isAdsMode={true} onClose={() => setShowStory(false)} onComplete={(amount) => { setBalances(prev => ({ ...prev, genesis: prev.genesis + amount })); }} />
        </div>
      )}
      
      {showWalletModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl">
          <ConversionModal balances={balances} setBalances={setBalances} session={session} activePhase={getMoonSuffix()} onClose={() => setShowWalletModal(false)} />
        </div>
      )}

      {showBooster && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center">
          <BoosterModal onClose={() => setShowBooster(false)} />
        </div>
      )}
      
      {/* TELEFONO CASA / HOLOPROJECTOR */}
      {projectingUser && !is219Mode && (
        <HoloProjector videoUrl={projectingUser.video_file || projectingUser.videoUrl} user={projectingUser} handleGoToShop={handleGoToShop} balances={balances} setBalances={setBalances} session={session} onOpenLog={setSelectedLog} onClose={() => { setProjectingUser(null); setIs219Mode(false); }} onGoTo219={() => setIs219Mode(true)} />
      )}

      {/* TERMINAL SHOP — NovaVentas / IsabellaVentas */}
      {selectedCard && (
        <PaymentModal card={selectedCard} balances={balances} setBalances={setBalances} ventasMode={ventasMode} currentUser={perfilOso} onClose={() => { setSelectedCard(null); setVentasMode(null); }} onHandoff={(handoffData) => {
            if (handoffData.agente === 'BROSHOP_AVISO') {
              setSelectedCard(null); setVentasMode(null); setOsosHandoffContext({ intencion: 'BROSHOP_AVISO' }); setIntent('avisos'); setStep(2);
            }
          }}
        />
      )}

      {/* REINOS */}
      {intent === 'internal_search' && step === 2 && (
        <div className="fixed inset-x-0 top-[10%] bottom-[16%] z-[90] pointer-events-auto mx-auto max-w-5xl px-4">
          <Reinos onClose={() => { setStep(0); setIntent(null); }} session={session} balances={balances} setBalances={setBalances} onNavigateToSantuario={(targetUserId) => {
              const targetUser = realItems.find(u => u.id === targetUserId);
              if (targetUser) { setProjectingUser(targetUser); setIntent(null); }
            }}
          />
        </div>
      )}
      
      {selectedLog && <BroLogViewer log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}

export default App;