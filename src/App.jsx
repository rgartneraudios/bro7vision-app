import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import GenesisGate from './components/GenesisGate';
import WalletWidget from './components/WalletWidget';
import ConversionModal from './components/ConversionModal';
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
import ChannelEste169 from './components/ChannelEste169';
import ChannelOeste from './components/ChannelOeste';
import ChannelOeste169 from './components/ChannelOeste169';
import Reinos from './components/Reinos';
import RealityTuner from './components/RealityTuner';
import HoloPrism from './components/HoloPrism';
import MoonMatrixCircle from './components/MoonMatrixCircle';
import ChannelMoon from './components/ChannelMoon';
import { getMoonSuffix } from './utils/moonUtils';
import TitoBanner  from "./components/personajes/TitoBanner";
import LaraBanner  from "./components/personajes/LaraBanner";
import PuffoBanner from "./components/personajes/PuffoBanner";
import SlideRail from './components/SlideRail';
import { AudioProvider } from './context/AudioContext';
import SlideRailAudio from './components/SlideRailAudio';
import { useAudioData } from './hooks/useAudioData';
import BroCardStrip from './components/BroCardStrip';
import BroCardStripPS from './components/BroCardStripPS';
import AgentChatInput from './components/AgentChatInput';
import { useAgOsosMobile }    from './hooks/useAgOsosMobile';
import { useAgentRumores }    from './hooks/useAgentRumores';
import { useAgSectorMobile }  from './hooks/useAgSectorMobile';
import SlideRailServicios from './components/SlideRailServicios';
import SlideRailAvisos from './components/SlideRailAvisos';
import CityLocationBanner from './components/CityLocationBanner';
import NeuralButton from './components/NeuralButton';
import DesktopLayout from './components/DesktopLayout';
import MobileLayout from './components/MobileLayout';
import BackStage from './components/backstage/BackStage';
import MiniGuide from './components/MiniGuide';

import { useSessionManager }  from './hooks/useSessionManager';
import { useNavigationState } from './hooks/useNavigationState';
import { useUIModals }        from './hooks/useUIModals';
import { useStripCards }      from './hooks/useStripCards';
import { useBalances }        from './hooks/useBalances';

function App() {

  // ══════════════════════════════════════════════════════
  // HOOKS DE DOMINIO
  // ══════════════════════════════════════════════════════

  const {
    session, isGuest, setIsGuest,
    perfilOso, setPerfilOso,
    isAdmin, iaMode,
    userCredits,
    sessionCP, setSessionCP,
    sessionCity, setSessionCity,
    sessionRef,
    handleLogout,
    handleToggleAdminIA,
    handleTogglePublicIA,
  } = useSessionManager();

  const {
    step, setStep,
    intent, setIntent,
    scope, setScope,
    realityMode, setRealityMode,
    ososModo, setOsosModo,
    ososHandoffContext, setOsosHandoffContext,
  } = useNavigationState();

  const {
    showRadar, setShowRadar,
    radarQuery, setRadarQuery,
    showStory, setShowStory,
    showLegal, setShowLegal,
    showWalletModal, setShowWalletModal,
    showBooster, setShowBooster,
    isLeftOpen, setIsLeftOpen,
    isRightOpen, setIsRightOpen,
  } = useUIModals();

  const {
    stripCards, setStripCards,
    stripLabel, setStripLabel,
    stripVisible, setStripVisible,
    cargarStripCards,
  } = useStripCards();

  const { balances, setBalances, handleGameWin } = useBalances(perfilOso, session);

  // ══════════════════════════════════════════════════════
  // ESTADO LOCAL — interacciones UI
  // ══════════════════════════════════════════════════════

  const [realItems, setRealItems]               = useState([]);
  const [selectedForestUser, setSelectedForestUser] = useState(null);
  const [selectedCard, setSelectedCard]         = useState(null);
  const [isMobile, setIsMobile]                 = useState(() => window.innerWidth < 768);
  const [isFullscreen, setIsFullscreen]         = useState(false);
  const [showStudio, setShowStudio]             = useState(false);
  const [isTeleporting, setIsTeleporting]       = useState(false);
  const [teleportCoords, setTeleportCoords]     = useState({ city: '' });
  const [projectingUser, setProjectingUser]     = useState(null);
  const [selectedLog, setSelectedLog]           = useState(null);
  const [audioUser, setAudioUser]               = useState(null);
  const [activePrismUser, setActivePrismUser]   = useState(null);
  const [activeUser, setActiveUser]             = useState(null);
  const [holoPrismaIndex, setHoloPrismaIndex]   = useState(0);
  const [ososFooterOpen, setOsosFooterOpen]     = useState(false);
  const [savedUserIndex, setSavedUserIndex]     = useState(0);
  const [vlData, setVlData]                     = useState(null);
  const [perfilSector, setPerfilSector]         = useState(null);
  const [avisoPendiente, setAvisoPendiente]     = useState(null);
  const [showMiniGuide, setShowMiniGuide] = useState(false);

  // ════════════════════════════════════════════════════
  // EFECTO — Auto-montar BroLogViewer al abrir Teléfono Casa
  // ══════════════════════════════════════════════════════

  useEffect(() => {
    if (projectingUser) {
      setSelectedLog({
        id: projectingUser.id,
        title: projectingUser.editorial_title || "Sin Título",
        author: projectingUser.alias || "Anónimo",
        content: projectingUser.editorial_content || "..."
      });
    } else {
      setSelectedLog(null);
    }
  }, [projectingUser]);

  const broTunerRef = useRef(null);

  // ══════════════════════════════════════════════════════
  // EFECTOS — isTouch + carga de realItems
  // ══════════════════════════════════════════════════════

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const isPWA = window.matchMedia('(display-mode: fullscreen)').matches ||
                window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    if (!session) return;
    const fetchRealItems = async () => {
      const { data: all } = await supabase.from('profiles').select('*');
      if (all) {
        setRealItems(all.map(u => ({
          ...u,
          shopName: u.alias,
          name:     u.alias,
          img: u.avatar_url || u.banner_url,
          type:     u.video_file ? ['shop', 'live'] : ['shop'],
            })).filter(u => u.video_file || u.audio_file || u.bro_ser || u.bro_mus || u.bro_aud || u.bro_avi || u.bro_pd));
      }
    };
    fetchRealItems();
  }, [session, step]);

  // ══════════════════════════════════════════════════════
  // FUNCIONES SIMPLES
  // ══════════════════════════════════════════════════════

  const handleShowPurchaseModal = () => setShowWalletModal(true);

  const handleOpenProfile = (user) => {
    const { _savedIndex, ...cleanUser } = user;
    setSavedUserIndex(_savedIndex || 0);
    setProjectingUser(cleanUser);
  };

  const handleReportIssue = async () => {
    const { error } = await supabase.from('reports_board').insert([{
      user_id: session?.user?.id || null,
      scene:   realityMode || 'lobby',
      reason:  'Reporte ciudadano',
      status:  'pendiente',
    }]);
    if (!error) alert('Reporte enviado a la central de seguridad.');
  };

  const handleAvisoConectar = (aviso) => {
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
  };

  const handleAvisoPublicar = async ({ confirmado }) => {
    if (!confirmado) return;
    const newBalance = balances.genesis - 200;
    setBalances(prev => ({ ...prev, genesis: newBalance }));
    await supabase.from('profiles').update({ genesis: newBalance }).eq('id', session.user.id);
  };

  // ══════════════════════════════════════════════════════
  // HANDLER CENTRAL DE HANDOFF
  // ══════════════════════════════════════════════════════

  const handleCentralHandoff = ({ agente, ciudad, cp, intencion, comercio,
    modalidad, oso_id, per_solicitado, personaje_id, codigo, canal, sector }) => {

    if (agente === 'OSOS_INTERNO') {
      setPerfilOso(prev => ({ ...prev, oso_id }));
      return;
    }

    if (agente === 'AUDIO_STOP') {
      setAudioUser(null);
      return;
    }

    if (agente === 'AUDIO_PLAY') {
      console.log('AUDIO_PLAY codigo:', codigo);
      console.log('realItems bro_mus:', realItems?.map(c => ({ bro_mus: c.bro_mus, alias: c.alias })));
      const itemCanal = canal || realItems.find(c =>
        String(c.bro_mus) === String(codigo) ||
        String(c.bro_aud) === String(codigo)
      );
      console.log('itemCanal:', itemCanal);
      if (itemCanal) {
        setAudioUser(itemCanal);
        setActivePrismUser(itemCanal);
      }
      return;
    }

    if (['AUDIO_INTERNO', 'SERVICIO_INTERNO', 'AVISO_INTERNO', 'ORACULO_INTERNO'].includes(agente)) {
      setPerfilSector(prev => ({ ...prev, personaje_id: personaje_id || per_solicitado }));
      return;
    }

    if (agente === 'OSOS') {
      setIntent('gps');
      setStep(1);
      setOsosModo('retorno');
      return;
    }

    if (agente === 'REALITY') {
      setStep(0);
      setIntent(null);
      setRealityMode(null);
      setScope(null);
      return;
    }

    if (agente === 'BUSCAR_STRIP') {
      const ciudadActual = sessionCity || scope?.city || '';
      const intentActual = intencion || 'BROSHOP_PRODUCTO';
      const intentMap = {
        'BROSHOP_PRODUCTO': 'productos',
        'BROSHOP_SERVICIO': 'servicios',
        'BROSHOP_AVISO':    'avisos',
        'AUDIO':            'audios',
      };
      cargarStripCards(intentActual, ciudadActual, 'LOCAL');
      const intentDestino = intentMap[intentActual];
      if (intentDestino) { setIntent(intentDestino); setStep(2); }
      return;
    }

    const intentMap = {
      'BROSHOP_PRODUCTO':  'productos',
      'BROSHOP_SERVICIO':  'servicios',
      'BROSHOP_AVISO':     'avisos',
      'AUDIO':             'audios',
      'REINOS':            'internal_search',
      'ORACULO':           'ai',
      'ORACULO_ORUMAMA':   'ai',
      'ORACULO_SMISTERIO': 'ai',
      'ORACULO_JAGUAR':    'ai',
      'GAMES':             'game',
    };

    const SIN_UBICACION = ['REINOS', 'ORACULO', 'ORACULO_ORUMAMA', 'ORACULO_SMISTERIO', 'ORACULO_JAGUAR', 'GAMES'];
    if (SIN_UBICACION.includes(agente)) {
      // Derivar personaje desde el agente si no viene per_solicitado
      const personajeMap = {
        'ORACULO_SMISTERIO': 'smisterio',
        'ORACULO_JAGUAR':    'jaguar',
        'ORACULO_ORUMAMA':   'orumama',
        'ORACULO':           'smisterio', // default
      };
      const personajeFinal = per_solicitado?.toLowerCase() 
        || personajeMap[agente] 
        || 'smisterio';
      setPerfilOso(prev => ({ ...prev, oraculo_personaje: personajeFinal }));
      setPerfilSector(null);
      setIntent(intentMap[agente] || 'ai');
      setOsosModo('retorno');
      setStep(2);
      return;
    }

    setOsosHandoffContext({ intencion, comercio_especifico: comercio, modalidad });
    const ciudadFinal = ciudad || perfilOso?.city || '';
    setScope({ city: String(ciudadFinal), type: 'teleport' });
    setSessionCity(ciudadFinal);
    setSessionCP(cp);
    setIntent(intentMap[agente] || 'productos');
    setOsosModo('retorno');
    setStep(2);
    cargarStripCards(agente, ciudadFinal, modalidad);
  };

  // ══════════════════════════════════════════════════════
  // HOOK useAgOsosMobile — chat de los Osos en MobileLayout step === 1
  // ══════════════════════════════════════════════════════

  const { mensaje: ososMensaje, loading: ososLoading, enviar: handleOsosInput, reset: resetOsos } = useAgOsosMobile({
    oso_id:   (perfilOso?.oso_id || 'tito').toLowerCase(),
    iaMode,
    isAdmin,
    onHandoff: handleCentralHandoff,
    ciudad:    perfilOso?.city || '',
  });


  const { mensaje: rumoresMensaje, loading: rumoresLoading,
          enviar: handleRumoresInput, reset: resetRumores } = useAgentRumores({
    iaMode,
    isAdmin,
    onHandoff: handleCentralHandoff,
    ciudad:    sessionCity,
  });

  const { mensaje: sectorMensaje, loading: sectorLoading,
          enviar: handleSectorInput, oraculoActivo } = useAgSectorMobile({
    intent, iaMode, isAdmin,
    onHandoff:   handleCentralHandoff,
    ciudad:      sessionCity,
    perfilSector,
    perfilOso,
    genesis:     balances?.genesis || 0,
    userId:      session?.user?.id,
    autorAlias:  perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano',
  });

  // ══════════════════════════════════════════════════════
  // NAVEGACIÓN — después de useAgentChat para acceder a resetOsos
  // ══════════════════════════════════════════════════════

  const handleNavigation = useCallback((targetIntent) => {
    setIntent(targetIntent);
    setIsLeftOpen(false);
    setIsRightOpen(false);
    if (targetIntent === 'gps') {
      setStep(1);
      resetOsos();
      setSessionCP('');
      setSessionCity('');
      setStripCards([]);
      setStripVisible(false);
    } else if (['productos', 'servicios', 'avisos', 'audios'].includes(targetIntent) && !scope) {
      setStep(1);
      setOsosModo('entrada');
    } else {
      setStep(2);
      if (scope) {
        const agenteMap = {
          productos: 'BROSHOP_PRODUCTO',
          servicios: 'BROSHOP_SERVICIO',
          avisos:    'BROSHOP_AVISO',
          audios:    'AUDIO',
        };
        const agente = agenteMap[targetIntent];
        if (agente) {
          setStripCards([]);
          setStripVisible(false);
          cargarStripCards(agente, scope.city, 'LOCAL');
        }
      }
    }
  }, [scope, cargarStripCards, resetOsos]);

  // ════════════════════════════════════════════════════
  // FUNCIÓN handleGoToShop
  // ══════════════════════════════════════════════════════

  const handleGoToShop = (target) => {
    if (target === 'nova') {
      setIntent('productos');
    } else if (target === 'isabella') {
      setIntent('servicios');
    }
    setStep(2);
  };

  // ══════════════════════════════════════════════════════
  // USEMEMO
  // ══════════════════════════════════════════════════════

  const chatMobile = useMemo(() => {
    if (step === 1) return { enviar: handleOsosInput, mensaje: ososMensaje, loading: ososLoading };
    if (step === 2 && intent === 'ai') {
      return {
        tipo: 'ORACULO',
        oraculo_personaje: perfilSector?.personaje_id || perfilOso?.oraculo_personaje,
        enviar: handleSectorInput,
        mensaje: sectorMensaje,
        loading: sectorLoading,
      };
    }
    return { enviar: handleSectorInput, mensaje: sectorMensaje, loading: sectorLoading };
  }, [step, intent, perfilOso, perfilSector, sectorMensaje, ososMensaje, sectorLoading, ososLoading]);

const filteredItems = useMemo(() => {
  const supabaseItems = realItems.map(u => {
    // Definimos el tipo según el archivo que contenga el registro
    let itemType = ['shop'];
    if (u.audio_file) {
      itemType = ['live']; // Solo califica como audio
    } else if (u.video_file) {
      itemType = ['shop', 'live']; // Vídeo inmersivo / tienda
    }

    return { 
      ...u, 
      id: u.id, 
      name: u.alias, 
      img: u.avatar_url || u.banner_url || '/default.png', 
      price: u.price || 0, 
      type: itemType, 
      source: 'supabase' 
    };
  });

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

  if (['productos', 'servicios', 'avisos'].includes(intent)) {
    return ALL.filter(i => i.type?.includes('shop'));
  }
  if (intent === 'audios') {
    return ALL.filter(i => i.type?.includes('live'));
  }
  
  return ALL;
}, [intent, realItems]);

  const hubVideos = useMemo(() => {
    const masterVideos   = MASTER_DB.filter(m => m.video_file).map(m => ({ ...m, id: m.id, alias: m.name || m.alias, source: 'master' }));
    const supabaseVideos = realItems.filter(i => i.video_file).map(i => ({ ...i, alias: i.alias, id: i.id, source: 'supabase' }));
    return [{ alias: 'BRO MASTER', video_file: 'https://media.bro7vision.com/Mapache-habla5.mp4', video_file_169: 'https://media.bro7vision.com/Mapache-habla5H.mp4', id: 'bro_master' }, ...masterVideos, ...supabaseVideos];
  }, [realItems]);
  
  const hubVideos169 = useMemo(() => {
  const supabaseVideos169 = realItems.filter(i => i.video_file_169).map(i => ({ ...i, alias: i.alias, id: i.id, source: 'supabase', video_file: i.video_file_169 }));
  return [{ alias: 'BRO MASTER', video_file: 'https://media.bro7vision.com/Mapache-habla5H.mp4', id: 'bro_master' }, ...supabaseVideos169];
}, [realItems]);

  const hubAudios = useMemo(() => {
    const masterAudios   = MASTER_DB.filter(m => m.audio_video).map(m => ({ ...m, id: m.id, alias: m.name || m.alias, source: 'master' }));
    const supabaseAudios = realItems.filter(i => i.audio_video).map(i => ({ ...i, alias: i.alias, id: i.id, source: 'supabase' }));
    return [{ alias: 'BRO MASTER', audio_video: 'https://media.bro7vision.com/Mapache-habla5.mp3', id: 'bro_master' }, ...masterAudios, ...supabaseAudios];
  }, [realItems]);
 

  // ══════════════════════════════════════════════════════
  // DATOS ESTÁTICOS Y GUARDS
  // ══════════════════════════════════════════════════════

  const { findChannelByAlias, checkIfNew } = useAudioData({ realItems });

  if (!session && !isGuest && !showStudio) {
    return <GenesisGate
      onGuestAccess={() => { setIsGuest(true); setStep(0); setRealityMode(null); setBalances({ genesis: 500, nova: 20 }); }}
      onStudioAccess={() => setShowStudio(true)}
    />;
  }

  // Productores (advertiser) o acceso studio directo → BackStage exclusivo
  if (showStudio || session?.user?.user_metadata?.role === 'advertiser') {
    return <BackStage session={session} onLogout={showStudio ? () => setShowStudio(false) : handleLogout} />;
  }

  const navItems = [
    { id: 'gps',             label: 'RUTA',      color: 'border-fuchsia-500/30 hover:border-fuchsia-400',  images: ['/emojis/lara.webp', '/emojis/tito.webp', '/emojis/puffo.webp'] },
    { id: 'productos',       label: 'BROCUPONES PRODUCTOS',  color: 'border-yellow-500/30 hover:border-yellow-400',    images: ['/emojis/nova.webp'] },
    { id: 'servicios',       label: 'BROCUPONES SERVICIOS',  color: 'border-rose-500/30 hover:border-rose-400',        images: ['/emojis/isabella.webp', '/emojis/prmaestro.webp'] },
    { id: 'avisos',          label: 'AVISOS',     color: 'border-slate-500/30 hover:border-slate-400',      images: ['/emojis/evelyn.webp', '/emojis/larry.webp'] },
    { id: 'audios',          label: 'AUDIOS',     color: 'border-cyan-500/30 hover:border-cyan-400',        images: ['/emojis/mapache.webp', '/emojis/ami.webp'] },
    { id: 'internal_search', label: 'REINOS',     color: 'border-orange-500/30 hover:border-orange-400',    images: ['/emojis/rumores.webp'] },
    { id: 'ai',              label: 'ORÁCULO',    color: 'border-lime-500/30 hover:border-lime-400',        images: ['/emojis/orumama.webp', '/emojis/smisterio.webp', '/emojis/jaguar.webp'] },
    { id: 'game',            label: 'GAMES',      color: 'border-white/30 hover:border-white/60',           images: ['/emojis/emoji_5.webp', '/emojis/emoji_7.webp'] },
  ];

  const INTENTS_CON_UBICACION = new Set(['productos', 'servicios', 'avisos', 'audios']);

  // ══════════════════════════════════════════════════════
  // LAYOUTPROPS
  // ══════════════════════════════════════════════════════

  const layoutProps = {
    step, setStep, intent, setIntent, realityMode, setRealityMode,
    isLeftOpen, setIsLeftOpen, isRightOpen, setIsRightOpen,
    balances, setBalances, session, handleCentralHandoff,
    showRadar, setShowRadar, radarQuery, setRadarQuery,
    realItems, filteredItems, hubVideos, hubVideos169,
    selectedForestUser, setSelectedForestUser, savedUserIndex,
    audioUser, setAudioUser, activePrismUser, setActivePrismUser,
    projectingUser, setProjectingUser, selectedCard,
    broTunerRef, navItems, handleNavigation, handleReportIssue,
    setShowWalletModal, setShowBooster, setShowStory, setShowLegal,
    scope, sessionCP, sessionCity, sessionRef,
    handleGameWin,
    setSelectedLog, setVlData,
    ososHandoffContext, setOsosHandoffContext,
    perfilOso, stripVisible, stripCards, stripLabel,
    onHandoff: handleCentralHandoff,
    setHoloPrismaIndex, findChannelByAlias, checkIfNew,
    chatMobile, perfilSector, oraculoActivo,
    handleOsosInput, ososMensaje, ososLoading, ososModo, setOsosModo,
    handleLogout,
    onAvisoConectar: handleAvisoConectar,
    onAvisoPublicar: handleAvisoPublicar,
    iaMode, isAdmin, userCredits,
    onToggleAdminIA:     handleToggleAdminIA,
    onTogglePublicIA:    handleTogglePublicIA,
    rumoresMensaje, rumoresLoading, handleRumoresInput,
    onOpenMiniGuide: () => setShowMiniGuide(true),
    userId:         session?.user?.id || null,
  genesisBalance: balances.genesis  || 0,
  onGenesisUpdate: (nuevoBalance) => setBalances(prev => ({ ...prev, genesis: nuevoBalance })),
  handleGoToShop,
  };

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">
      {isMobile ? (
        <MobileLayout
          realityMode={realityMode}
          broTunerRef={broTunerRef}
          audioUser={audioUser}
          onToggleAudio={() => setAudioUser(prev => prev ? null : audioUser)}
          setRealityMode={setRealityMode}
          hubAudios={hubAudios}
          {...layoutProps}
        />
      ) : (
        <DesktopLayout {...layoutProps} />
      )}

      {/* MODALES GLOBALES */}
      {showLegal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10 rounded-3xl bg-zinc-950 shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black">
              <span className="text-cyan-400 font-mono text-xs">LEGAL_TERMINAL_V1.0</span>
              <button onClick={() => setShowLegal(false)} className="text-white text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 text-gray-400 font-mono text-sm leading-relaxed">
              <LegalTerminal onClose={() => setShowLegal(false)} />
            </div>
          </div>
        </div>
      )}
      
      {showMiniGuide && (
  <MiniGuide onClose={() => setShowMiniGuide(false)} />
)}

      {showStory && (
        <div className="fixed inset-0 z-[200] bg-black">
          <StoryPlayer
            src="https://media.bro7vision.com/brostories_demo.mp4"
            activePhase="nova"
            balances={balances} setBalances={setBalances}
            isAdsMode={true}
            onClose={() => setShowStory(false)}
            onComplete={(amount) => { setBalances(prev => ({ ...prev, genesis: prev.genesis + amount })); }}
          />
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

      {projectingUser && (
        <HoloProjector
          user={projectingUser}
          balances={balances} setBalances={setBalances}
          session={session}
          onOpenLog={setSelectedLog}
          onClose={() => setProjectingUser(null)}
        />
      )}

      {intent === 'internal_search' && step === 2 && (
        <div className={`fixed inset-x-0 top-[10%] bottom-[16%] z-[90] mx-auto max-w-5xl px-4 ${
          window.innerWidth < 768 ? 'pointer-events-none' : 'pointer-events-auto'
        }`}>
          <Reinos
            isMobile={window.innerWidth < 768}
            onClose={() => { setStep(0); setIntent(null); }}
            session={session} balances={balances} setBalances={setBalances}
            onNavigateToSantuario={(targetUserId) => {
              const targetUser = realItems.find(u => u.id === targetUserId);
              if (targetUser) { setProjectingUser(targetUser); setIntent(null); }
            }}
          />
        </div>
      )}

      {selectedLog && (
        <BroLogViewer
          log={selectedLog}
          onClose={() => { setSelectedLog(null); setProjectingUser(null); }}
          balances={balances}
          setBalances={setBalances}
          session={session}
          handleGoToShop={handleGoToShop}
        />
      )}

      {/* Botón fullscreen — solo visible en browser normal (no PWA, no fullscreen activo) */}
      {!isPWA && !isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed bottom-5 right-5 z-[999] w-9 h-9 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/60 transition-all backdrop-blur-md"
          title="Pantalla completa"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

export default App;
