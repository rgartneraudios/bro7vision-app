import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import GenesisGate from './components/GenesisGate';
import WalletWidget from './components/WalletWidget';
import ConversionModal from './components/ConversionModal';
import NexusDashboard from './components/NexusDashboard';
import BroTuner from './components/BroTuner';
import BoosterModal from './components/BoosterModal';
import LegalTerminal from './components/LegalTerminal';

import Reinos from './components/Reinos';
import RealityTuner from './components/RealityTuner';
import MoonMatrixCircle from './components/MoonMatrixCircle';
import { getMoonSuffix } from './utils/moonUtils';
import TitoBanner  from "./components/personajes/TitoBanner";
import LaraBanner  from "./components/personajes/LaraBanner";
import PuffoBanner from "./components/personajes/PuffoBanner";
import SlideRailCanjear from './components/SlideRailCanjear';
import TriviaRail from './components/TriviaRail';
import AgentChatInput from './components/AgentChatInput';
import { useAgOsosMobile }    from './hooks/useAgOsosMobile';
import { useAgentRumores }    from './hooks/useAgentRumores';
import { useAgSectorMobile }  from './hooks/useAgSectorMobile';
import SlideRailAmigos from './components/SlideRailAmigos';
import ShopAmigos from './components/ShopAmigos';
import CityLocationBanner from './components/CityLocationBanner';
import NeuralButton from './components/NeuralButton';
import DesktopLayout from './components/DesktopLayout';
import DesktopRealityPlayer from './components/DesktopRealityPlayer';
import MobileLayout from './components/MobileLayout';
import BackStage from './components/backstage/BackStage';
import Bro7Band from './components/Bro7Band';

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

  
  const [selectedForestUser, setSelectedForestUser] = useState(null);
  const [selectedCard, setSelectedCard]         = useState(null);
  const [isMobile, setIsMobile]                 = useState(() => window.innerWidth < 768);
  const [isFullscreen, setIsFullscreen]         = useState(false);
  const [showStudio, setShowStudio]             = useState(false);
const [showBackstage, setShowBackstage]       = useState(false);
const [boosterTab, setBoosterTab]           = useState(null);
  const [isTeleporting, setIsTeleporting]       = useState(false);
  const [teleportCoords, setTeleportCoords]     = useState({ city: '' });
  const [projectingUser, setProjectingUser]     = useState(null);
  const [selectedLog, setSelectedLog]           = useState(null);
  const [activeUser, setActiveUser]             = useState(null);
  const [holoPrismaIndex, setHoloPrismaIndex]   = useState(0);
  const [ososFooterOpen, setOsosFooterOpen]     = useState(false);
  const [savedUserIndex, setSavedUserIndex]     = useState(0);
  const [vlData, setVlData]                     = useState(null);
  const [perfilSector, setPerfilSector]         = useState(null);
  const [avisoPendiente, setAvisoPendiente]     = useState(null);

  // ════════════════════════════════════════════════════
  // EFECTO — Auto-montar BroLogViewer al abrir Teléfono Casa
  // ══════════════════════════════════════════════════════

  useEffect(() => {
    if (projectingUser) {
      setSelectedLog({
  	id:      projectingUser.id,
  	title:   projectingUser.editorial_title || 'Sin título',
  	author:  projectingUser.alias,
  	content: projectingUser.editorial_text  || '',
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

  // ══════════════════════════════════════════════════════
  // HANDLER CENTRAL DE HANDOFF
  // ══════════════════════════════════════════════════════

  const handleCentralHandoff = ({ agente, ciudad, cp, intencion, comercio,
    modalidad, oso_id, per_solicitado, personaje_id, codigo, canal, sector }) => {

    if (agente === 'OSOS_INTERNO') {
      setPerfilOso(prev => ({ ...prev, oso_id }));
      return;
    }

    if (['AUDIO_INTERNO', 'SERVICIO_INTERNO', 'AVISO_INTERNO'].includes(agente)) {
      setPerfilSector(prev => ({ ...prev, personaje_id: personaje_id || per_solicitado }));
      return;
    }

    if (agente === 'OSOS') {
      setIntent('destino');
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

    const intentMap = {
      'CANJEAR':        'canjear',
      'CANJES':         'canjear',
      'SHOP AMIGOS':    'shopamigos',
      'REINOS':         'reinos',
      'GAMES':          'games',
      'BRO7BAND':       'bro7band',
    };

    const SIN_UBICACION = ['REINOS', 'BRO7BAND'];
    if (SIN_UBICACION.includes(agente)) {
      setPerfilSector(null);
      setIntent(intentMap[agente] || 'ai');
      setOsosModo('retorno');
      setStep(agente === 'BRO7BAND' ? 0 : 2);
      return;
    }

    const INTENTA_CARGAR_STRIPS = ['CANJEAR', 'CANJES'];

    setOsosHandoffContext({ intencion, comercio_especifico: comercio, modalidad });
    const ciudadFinal = ciudad || perfilOso?.city || '';
    setScope({ city: String(ciudadFinal), type: 'teleport' });
    setSessionCity(ciudadFinal);
    setSessionCP(cp);
    setIntent(intentMap[agente] || 'productos');
    setOsosModo('retorno');
    setStep(2);
    if (INTENTA_CARGAR_STRIPS.includes(agente)) {
      cargarStripCards('BROPRODUCTOS', ciudadFinal, modalidad);
    }
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
    if (targetIntent === 'destino') {
      setStep(1);
      resetOsos();
      setSessionCP('');
      setSessionCity('');
      setStripCards([]);
      setStripVisible(false);
    } else if (['canjear', 'shopamigos', 'games'].includes(targetIntent) && !scope) {
      setStep(1);
      setOsosModo('entrada');
    } else {
      setStep(2);
      if (scope && targetIntent === 'canjear') {
        setStripCards([]);
        setStripVisible(false);
        cargarStripCards('BROPRODUCTOS', scope.city, 'LOCAL');
      }
    }
  }, [scope, cargarStripCards, resetOsos]);

  // ════════════════════════════════════════════════════
  // FUNCIÓN handleGoToShop
  // ══════════════════════════════════════════════════════

  const handleGoToShop = (target) => {
    setIntent('canjear');
    setStep(2);
    setSelectedCard(null);
  };

  // ══════════════════════════════════════════════════════
  // USEMEMO
  // ══════════════════════════════════════════════════════

  const chatMobile = useMemo(() => {
    if (step === 1) return { enviar: handleOsosInput, mensaje: ososMensaje, loading: ososLoading };
    return { enviar: handleSectorInput, mensaje: sectorMensaje, loading: sectorLoading };
  }, [step, perfilOso, perfilSector, sectorMensaje, ososMensaje, sectorLoading, ososLoading]);



  // ══════════════════════════════════════════════════════
  // DATOS ESTÁTICOS Y GUARDS
  // ══════════════════════════════════════════════════════

  if (!session && !isGuest) {
    return <GenesisGate
      onGuestAccess={() => { setIsGuest(true); setStep(0); setRealityMode(null); setBalances({ genesis: 500, nova: 20 }); }}
    />;
  }

  // Productores (advertiser) o acceso studio directo → BackStage exclusivo
  if (showBackstage) {
    return <BackStage session={session} onLogout={() => setShowBackstage(false)} />;
  }

  const navItems = [
    { id: 'destino',         label: 'DESTINO',           color: 'border-fuchsia-500/30 hover:border-fuchsia-400',  images: ['/emojis/lara.webp', '/emojis/tito.webp', '/emojis/puffo.webp'] },
    { id: 'canjear',         label: 'CANJES de LUNAS',  color: 'border-yellow-500/30 hover:border-yellow-400',    images: ['/emojis/emoji_1.webp'] },
    { id: 'shopamigos',       label: 'SHOP AMIGOS',        color: 'border-slate-500/30 hover:border-slate-400',      images: ['/emojis/emoji_3.webp'] },
    { id: 'bro7band',        label: 'BRO7BAND',         color: 'border-cyan-500/30 hover:border-cyan-400',       images: ['/emojis/bro7band.webp'] },
    { id: 'games',           label: 'GAMES',            color: 'border-white/30 hover:border-white/60',           images: ['/emojis/emoji8.webp', '/emojis/emoji9.webp'] },
    { id: 'reinos',          label: 'REINOS',           color: 'border-orange-500/30 hover:border-orange-400',    images: ['/emojis/rumores.webp'] },
  ];

  const INTENTS_CON_UBICACION = new Set(['canjear', 'avisos']);

  // ══════════════════════════════════════════════════════
  // LAYOUTPROPS
  // ══════════════════════════════════════════════════════

  const layoutProps = {
    step, setStep, intent, setIntent, realityMode, setRealityMode,
    isLeftOpen, setIsLeftOpen, isRightOpen, setIsRightOpen,
    balances, setBalances, session, handleCentralHandoff,
    selectedForestUser, setSelectedForestUser, savedUserIndex,
    projectingUser, setProjectingUser, selectedCard,
    broTunerRef, navItems, handleNavigation, handleReportIssue,
    setShowWalletModal, setShowBooster, setShowLegal, setShowBackstage,
    scope, sessionCP, sessionCity, sessionRef,
    handleGameWin,
    setVlData,
    ososHandoffContext, setOsosHandoffContext,
    perfilOso, stripVisible, stripCards, stripLabel,
    onHandoff: handleCentralHandoff,
    setHoloPrismaIndex,
    chatMobile, perfilSector,
    handleOsosInput, ososMensaje, ososLoading, ososModo, setOsosModo,
    handleLogout,
    iaMode, isAdmin, userCredits,
    onToggleAdminIA:     handleToggleAdminIA,
    onTogglePublicIA:    handleTogglePublicIA,
    rumoresMensaje, rumoresLoading, handleRumoresInput,
    userId:         session?.user?.id || null,
  genesisBalance: balances.genesis  || 0,
  onGenesisUpdate: (nuevoBalance) => setBalances(prev => ({ ...prev, genesis: nuevoBalance })),
    handleGoToShop,
    setShowBackstage,
    boosterTab, setBoosterTab,
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
          setRealityMode={setRealityMode}
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
      
      {showWalletModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl">
          <ConversionModal balances={balances} setBalances={setBalances} session={session} activePhase={getMoonSuffix()} onClose={() => setShowWalletModal(false)} />
        </div>
      )}

      {showBooster && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center">
          <BoosterModal onClose={() => { setShowBooster(false); setBoosterTab(null); }} session={session} initialTab={boosterTab} />
        </div>
      )}

      {intent === 'reinos' && step === 2 && (
        <div className={`fixed inset-x-0 top-[10%] bottom-[16%] z-[90] mx-auto max-w-5xl px-4 ${
          window.innerWidth < 768 ? 'pointer-events-none' : 'pointer-events-auto'
        }`}>
          <Reinos
            isMobile={window.innerWidth < 768}
            onClose={() => { setStep(0); setIntent(null); }}
            session={session} balances={balances} setBalances={setBalances}
          />
        </div>
      )}

      {intent === 'bro7band' && (
        <Bro7Band
          iaMode={iaMode}
          balances={balances}
          setBalances={setBalances}
          onBack={() => { setStep(0); setIntent(null); }}
        />
      )}

      {intent === 'shopamigos' && step === 2 && (
        <div className="fixed inset-0 z-[60]">
          <ShopAmigos scope={scope} />
          <TriviaRail sector="SHOP_AMIGOS" userId={session?.user?.id} />
        </div>
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
