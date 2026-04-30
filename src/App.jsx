import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import SlideRail from './components/SlideRail';
import { AudioProvider } from './context/AudioContext';
import NovaBanner from './components/NovaBanner';
import MapacheBanner from './components/MapacheBanner';
import SlideRailAudio from './components/SlideRailAudio';
import { useAudioData } from './hooks/useAudioData';
import BroCardStrip from './components/BroCardStrip';
import AgentChatInput from './components/AgentChatInput';
import { useAgentChat } from './hooks/useAgentChat';
import IsabellaBanner from './components/IsabellaBanner';
import SlideRailServicios from './components/SlideRailServicios';
import EvelynBanner from './components/EvelynBanner';
import SlideRailAvisos from './components/SlideRailAvisos';
import OraculoBanner from './components/OraculoBanner';
import CityLocationBanner from './components/CityLocationBanner';
import NeuralButton from './components/NeuralButton';
import DesktopLayout from './components/DesktopLayout';
import MobileTabletLayout from './components/MobileTabletLayout';

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
    ventasMode, setVentasMode,
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
  const [isTouch, setIsTouch]                   = useState(false);
  const [isTeleporting, setIsTeleporting]       = useState(false);
  const [teleportCoords, setTeleportCoords]     = useState({ city: '' });
  const [projectingUser, setProjectingUser]     = useState(null);
  const [is219Mode, setIs219Mode]               = useState(false);
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

  const broTunerRef = useRef(null);

  // ══════════════════════════════════════════════════════
  // EFECTOS — isTouch + carga de realItems
  // ══════════════════════════════════════════════════════

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (!session) return;
    const fetchRealItems = async () => {
      const { data: all } = await supabase.from('profiles').select('*');
      if (all) {
        setRealItems(all.map(u => ({
          ...u,
          shopName: u.alias,
          name:     u.product_title || u.alias,
          img:      u.card_banner_url || u.banner_url,
          type:     u.video_file ? ['shop', 'live'] : ['shop'],
        })).filter(u => u.video_file || u.audio_file || u.product_title || u.bro_ser || u.bro_aud || u.bro_pod || u.bro_avi || u.bro_id));
      }
    };
    fetchRealItems();
  }, [session, step]);

  // ══════════════════════════════════════════════════════
  // FUNCIONES SIMPLES
  // ══════════════════════════════════════════════════════

  const abrirTienda = (comercio, mode = 'novaCierre') => {
    setProjectingUser(null);
    setSelectedCard(comercio);
    setVentasMode(mode);
  };

  const handleGoToShop        = (user, mode = 'novaCierre') => abrirTienda(user, mode);
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
      console.log('realItems bro_aud:', realItems?.map(c => ({ bro_aud: c.bro_aud, alias: c.alias })));
      const itemCanal = canal || realItems.find(c =>
        String(c.bro_aud) === String(codigo) ||
        String(c.bro_pod) === String(codigo)
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

    if (agente === 'NOVA_CIERRE') {
      const bro_id_target  = comercio || intencion;
      const comercioTarget = realItems.find(i => i.bro_id === bro_id_target || i.bro_ser === bro_id_target);
      if (comercioTarget) abrirTienda(comercioTarget, 'novaCierre');
      return;
    }

    if (agente === 'ISABELLA_CIERRE') {
      const bro_id_target  = comercio || intencion;
      const comercioTarget = realItems.find(i => i.bro_ser === bro_id_target || i.bro_id === bro_id_target);
      if (comercioTarget) abrirTienda(comercioTarget, 'isabellaCierre');
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
      if (per_solicitado) setPerfilOso(prev => ({ ...prev, oraculo_personaje: per_solicitado }));
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
  // HOOKS useAgentChat — 7 agentes
  // ══════════════════════════════════════════════════════

  const { mensaje: ososMensaje, loading: ososLoading, enviar: handleOsosInput, reset: resetOsos } = useAgentChat({
    mode: 'osos', realItems,
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
    onHandoff: handleCentralHandoff, iaMode, isAdmin,
  });

  const { mensaje: novaMensaje, loading: novaLoading, enviar: handleNovaInput } = useAgentChat({
    mode: 'novaExplora',
    contextData: {
      entidad:     ososHandoffContext?.comercio_especifico,
      hayTarjetas: stripVisible,
      ciudad:      scope?.ciudad || '',
      alias:       perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano',
    },
    onHandoff: handleCentralHandoff, iaMode, isAdmin,
  });

  const { mensaje: isabellaMensaje, loading: isabellaLoading, enviar: handleIsabellaInput } = useAgentChat({
    mode: 'servicios',
    contextData: {
      servicios_personaje: perfilSector?.personaje_id || 'isabella',
      entidad:     ososHandoffContext?.comercio_especifico,
      hayTarjetas: stripVisible,
      ciudad:      scope?.ciudad || '',
      alias:       perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano',
    },
    onHandoff: handleCentralHandoff, iaMode, isAdmin,
  });

  const { mensaje: mapacheMensaje, loading: mapacheLoading, enviar: handleMapacheInput } = useAgentChat({
    mode: 'mapache',
    contextData: {
      audio_personaje: perfilSector?.personaje_id || 'mapache',
      realItems,
      entidad:     ososHandoffContext?.comercio_especifico,
      hayTarjetas: stripVisible,
      ciudad:      scope?.ciudad || '',
      alias:       perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano',
    },
    onHandoff: handleCentralHandoff, iaMode, isAdmin,
  });

  const { mensaje: evelynMensaje, loading: evelynLoading, enviar: handleEvelynInput, avisoEnConstruccion } = useAgentChat({
    mode: 'avisos',
    contextData: {
      avisos_personaje: perfilSector?.personaje_id || 'evelyn',
      genesis:          balances.genesis,
      ciudad:           sessionCity,
      user_id:          session?.user?.id,
      autor_alias:      perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano',
    },
    onHandoff:       handleCentralHandoff,
    onAvisoConectar: handleAvisoConectar,
    onAvisoPublicar: handleAvisoPublicar,
    iaMode, isAdmin,
  });

  const { mensaje: oraculoMensaje, loading: oraculoLoading, enviar: handleOraculoInput } = useAgentChat({
    mode: 'oraculo',
    contextData: {
      oraculo_personaje: perfilSector?.personaje_id || perfilOso?.oraculo_personaje || 'orumama',
      ciudad:  scope?.ciudad || '',
      alias:   perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano',
    },
    onHandoff: handleCentralHandoff, iaMode, isAdmin,
  });

  const { mensaje: rumoresMensaje, loading: rumoresLoading, enviar: handleRumoresInput } = useAgentChat({
    mode: 'reinos',
    contextData: {
      alias: perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano',
    },
    onHandoff: handleCentralHandoff, iaMode, isAdmin,
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

  // ══════════════════════════════════════════════════════
  // USEMEMO
  // ══════════════════════════════════════════════════════

  const chatMobile = useMemo(() => {
    if (step === 1) return { enviar: handleOsosInput, mensaje: ososMensaje, loading: ososLoading };
    switch (intent) {
      case 'productos':       return { enviar: handleNovaInput,     mensaje: novaMensaje,     loading: novaLoading };
      case 'servicios':       return { enviar: handleIsabellaInput, mensaje: isabellaMensaje, loading: isabellaLoading };
      case 'avisos':          return { enviar: handleEvelynInput,   mensaje: evelynMensaje,   loading: evelynLoading };
      case 'audios':          return { enviar: handleMapacheInput,  mensaje: mapacheMensaje,  loading: mapacheLoading };
      case 'ai':              return { enviar: handleOraculoInput,  mensaje: oraculoMensaje,  loading: oraculoLoading };
      case 'internal_search': return { enviar: handleRumoresInput,  mensaje: rumoresMensaje,  loading: rumoresLoading };
      default:                return { enviar: handleOsosInput,     mensaje: ososMensaje,     loading: ososLoading };
    }
  }, [intent, step, novaMensaje, isabellaMensaje, evelynMensaje, mapacheMensaje, oraculoMensaje, rumoresMensaje, ososMensaje]);

  const filteredItems = useMemo(() => {
    const supabaseItems = realItems.map(u => ({ ...u, id: u.id, name: u.product_title || u.alias, img: u.card_banner_url || u.banner_url || '/default.png', price: u.price || 0, type: u.video_file ? ['shop', 'live'] : ['shop'], source: 'supabase' }));
    const masterItems   = MASTER_DB.map(m => ({ ...m, id: m.id, name: m.name, img: m.img || '/default.png', price: m.price || 15, type: m.type || ['shop'], source: 'master' }));
    const ALL = [...supabaseItems, ...masterItems];
    if (['productos', 'servicios', 'avisos'].includes(intent)) return ALL.filter(i => i.type?.includes('shop'));
    if (intent === 'audios') return ALL.filter(i => i.type?.includes('live'));
    return ALL;
  }, [intent, realItems]);

  const hubVideos = useMemo(() => {
    const masterVideos   = MASTER_DB.filter(m => m.video_file).map(m => ({ ...m, id: m.id, alias: m.name || m.alias, source: 'master' }));
    const supabaseVideos = realItems.filter(i => i.video_file).map(i => ({ ...i, alias: i.alias, id: i.id, source: 'supabase' }));
    return [{ alias: 'BRO MASTER', video_file: 'https://media.bro7vision.com/Mapache-habla2.mp4', id: 'bro_master' }, ...masterVideos, ...supabaseVideos];
  }, [realItems]);

  const hubAudios = useMemo(() => {
    const masterAudios   = MASTER_DB.filter(m => m.audio_video).map(m => ({ ...m, id: m.id, alias: m.name || m.alias, source: 'master' }));
    const supabaseAudios = realItems.filter(i => i.audio_video).map(i => ({ ...i, alias: i.alias, id: i.id, source: 'supabase' }));
    return [{ alias: 'BRO MASTER', audio_video: 'https://media.bro7vision.com/Mapache-habla2.mp3', id: 'bro_master' }, ...masterAudios, ...supabaseAudios];
  }, [realItems]);

  // ══════════════════════════════════════════════════════
  // DATOS ESTÁTICOS Y GUARDS
  // ══════════════════════════════════════════════════════

  const { findChannelByAlias, checkIfNew } = useAudioData({ realItems });

  if (!session && !isGuest) {
    return <GenesisGate onGuestAccess={() => { setIsGuest(true); setStep(0); setRealityMode(null); setBalances({ genesis: 500, nova: 20 }); }} />;
  }

  const navItems = [
    { id: 'gps',             label: 'RUTA',      color: 'border-fuchsia-500/30 hover:border-fuchsia-400',  images: ['/emojis/lara.webp', '/emojis/tito.webp', '/emojis/puffo.webp'] },
    { id: 'productos',       label: 'PRODUCTOS',  color: 'border-yellow-500/30 hover:border-yellow-400',    images: ['/emojis/nova.webp'] },
    { id: 'servicios',       label: 'SERVICIOS',  color: 'border-rose-500/30 hover:border-rose-400',        images: ['/emojis/isabella.webp', '/emojis/prmaestro.webp'] },
    { id: 'avisos',          label: 'AVISOS',     color: 'border-slate-500/30 hover:border-slate-400',      images: ['/emojis/evelyn.webp', '/emojis/larry.webp'] },
    { id: 'audios',          label: 'AUDIOS',     color: 'border-cyan-500/30 hover:border-cyan-400',        images: ['/emojis/mapache.webp', '/emojis/ami.webp'] },
    { id: 'internal_search', label: 'REINOS',     color: 'border-orange-500/30 hover:border-orange-400',    images: ['/emojis/rumores.webp'] },
    { id: 'ai',              label: 'ORÁCULO',    color: 'border-lime-500/30 hover:border-lime-400',        images: ['/emojis/orumama.webp', '/emojis/smisterio.webp', '/emojis/jaguar.webp'] },
    { id: 'game',            label: 'GAMES',      color: 'border-white/30 hover:border-white/60',           images: ['/emojis/emoji_5.webp', '/emojis/emoji_7.webp'] },
  ];

  const INTENTS_CON_UBICACION = new Set(['productos', 'servicios', 'avisos', 'audios']);

  const chatPorIntent = {
    productos:       { enviar: handleNovaInput,     mensaje: novaMensaje,     loading: novaLoading },
    servicios:       { enviar: handleIsabellaInput, mensaje: isabellaMensaje, loading: isabellaLoading },
    audios:          { enviar: handleMapacheInput,  mensaje: mapacheMensaje,  loading: mapacheLoading },
    avisos:          { enviar: handleEvelynInput,   mensaje: evelynMensaje,   loading: evelynLoading },
    ai:              { enviar: handleOraculoInput,  mensaje: oraculoMensaje,  loading: oraculoLoading },
    internal_search: { enviar: handleRumoresInput,  mensaje: rumoresMensaje,  loading: rumoresLoading },
  };

  // ══════════════════════════════════════════════════════
  // LAYOUTPROPS
  // ══════════════════════════════════════════════════════

  const layoutProps = {
    step, setStep, intent, setIntent, realityMode, setRealityMode,
    isLeftOpen, setIsLeftOpen, isRightOpen, setIsRightOpen,
    balances, setBalances, session, handleCentralHandoff,
    showRadar, setShowRadar, radarQuery, setRadarQuery,
    realItems, filteredItems, hubVideos,
    selectedForestUser, setSelectedForestUser, savedUserIndex,
    audioUser, setAudioUser, activePrismUser, setActivePrismUser,
    projectingUser, setProjectingUser, selectedCard,
    broTunerRef, navItems, handleNavigation, handleReportIssue,
    setShowWalletModal, setShowBooster, setShowStory, setShowLegal,
    scope, sessionCP, sessionCity, sessionRef,
    handleGameWin, handleGoToShop, abrirTienda,
    setSelectedLog, setVlData,
    ososHandoffContext, setOsosHandoffContext,
    perfilOso, stripVisible, stripCards, stripLabel,
    onHandoff: handleCentralHandoff,
    setHoloPrismaIndex, findChannelByAlias, checkIfNew,
    chatMobile, perfilSector,
    handleOsosInput, ososMensaje, ososLoading, ososModo, setOsosModo,
    handleLogout,
    onAvisoConectar: handleAvisoConectar,
    onAvisoPublicar: handleAvisoPublicar,
    iaMode, isAdmin, userCredits,
    onToggleAdminIA:     handleToggleAdminIA,
    onTogglePublicIA:    handleTogglePublicIA,
    onShowPurchaseModal: handleShowPurchaseModal,
    novaMensaje, avisoEnConstruccion,
    novaLoading, handleNovaInput, isabellaMensaje, isabellaLoading, handleIsabellaInput,
    mapacheMensaje, mapacheLoading, handleMapacheInput, evelynMensaje, evelynLoading,
    handleEvelynInput, oraculoMensaje, oraculoLoading, handleOraculoInput, rumoresMensaje,
    rumoresLoading, handleRumoresInput,
  };

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">
      {isTouch ? (
        <MobileTabletLayout
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

      {projectingUser && !is219Mode && (
        <HoloProjector
          videoUrl={projectingUser.video_file || projectingUser.videoUrl}
          user={projectingUser}
          handleGoToShop={handleGoToShop}
          balances={balances} setBalances={setBalances}
          session={session}
          onOpenLog={setSelectedLog}
          onClose={() => { setProjectingUser(null); setIs219Mode(false); }}
          onGoTo219={() => setIs219Mode(true)}
        />
      )}

      {selectedCard && (
        <PaymentModal
          card={selectedCard} balances={balances} setBalances={setBalances}
          ventasMode={ventasMode} currentUser={perfilOso}
          onClose={() => { setSelectedCard(null); setVentasMode(null); }}
          onHandoff={(handoffData) => {
            if (handoffData.agente === 'BROSHOP_AVISO') {
              setSelectedCard(null); setVentasMode(null);
              setOsosHandoffContext({ intencion: 'BROSHOP_AVISO' });
              setIntent('avisos'); setStep(2);
            }
          }}
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

      {selectedLog && <BroLogViewer log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}

export default App;
