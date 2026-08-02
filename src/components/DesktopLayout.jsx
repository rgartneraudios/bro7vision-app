// src/components/DesktopLayout.jsx

import React, { useState, useEffect } from 'react';
import RealityTuner from './RealityTuner';
import DesktopRealityPlayer from './DesktopRealityPlayer';
import WalletWidget from './WalletWidget';
import MoonMatrixCircle from './MoonMatrixCircle';
import BroTuner from './BroTuner';
import NexusDashboard from './NexusDashboard';
import CanjearStrip from './CanjearStrip';
import CityLocationBanner from './CityLocationBanner';
import SlideRailAmigos from './SlideRailAmigos';
import TriviaRail from './TriviaRail';
import MapacheBanner from './personajes/MapacheBanner';
import TitoBanner  from "./personajes/TitoBanner";
import LaraBanner  from "./personajes/LaraBanner";
import PuffoBanner from "./personajes/PuffoBanner";
import { getVideoForLocation } from '../data/VideoMap';

export default function DesktopLayout(props) {
  // Desestructuramos todas las props que le manda App.jsx
  const {
    step, setStep, intent, setIntent, realityMode, setRealityMode,
    isLeftOpen, setIsLeftOpen, isRightOpen, setIsRightOpen, handleCentralHandoff,
    balances, setBalances, session,
    selectedForestUser, setSelectedForestUser,    	savedUserIndex, projectingUser, 	setProjectingUser, broTunerRef, navItems, handleNavigation, handleReportIssue,
    setShowWalletModal, setShowBooster, setShowLegal, setShowBackstage,
    boosterTab, setBoosterTab,
    scope, sessionCP, sessionCity, sessionRef, handleGameWin, handleGoToShop, abrirTienda,
    setVlData, ososHandoffContext, setOsosHandoffContext,
    perfilOso, setHoloPrismaIndex,
    ososModo, setOsosModo, handleLogout, selectedCard,
  rumoresMensaje, rumoresLoading, handleRumoresInput,
  userId, lunasBalance, onLunasUpdate,
   iaMode, isAdmin, userCredits, onToggleAdminIA, onTogglePublicIA
  } = props;
  

const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  const INTENTS_CON_UBICACION = new Set(['canjear', 'shopamigos']);


  return (
    <>

      {/* 1. FONDO DE VIDEOS */}
      <div className="absolute inset-0 z-0">
        {step === 0 && !projectingUser && !selectedCard && (
          !realityMode ? <RealityTuner onSelect={setRealityMode} /> :
          <DesktopRealityPlayer
            realityMode={realityMode}
            userId={userId}
            lunasBalance={lunasBalance}
            onLunasUpdate={onLunasUpdate}
          />
        )}
          
        {(step === 1 || step === 2) && (
          <video
            key={step === 1 ? (ososModo === 'retorno' ? 'ososia_recepcion2' : 'ososia_recepcion_v3') : intent}
            src={
              step === 1
                ? ososModo === 'retorno' ? "https://media.bro7vision.com/ososia_recepcion.mp4" : "https://media.bro7vision.com/ososia_recepcion.mp4"
                : intent === 'games'  ? "https://media.bro7vision.com/game_bg.mp4"
                : intent === 'reinos' ? "https://media.bro7vision.com/reinos.mp4"
                : getVideoForLocation(scope)
            }
            autoPlay loop muted playsInline className="w-full h-full object-cover transition-opacity duration-1000 animate-fadeIn"
          />
        )}     
      </div>

      {/* 2. PUERTA IZQUIERDA */}
      <div className={`side-panel side-panel-left ${isLeftOpen ? 'open' : ''} flex flex-col items-stretch p-0 overflow-y-auto left-panel-scroll`}>
        <div className="mt-8 w-full px-4"><WalletWidget balances={balances} onClick={() => setShowWalletModal(true)} /></div>
        <div className="w-full flex justify-center my-2"><MoonMatrixCircle /></div>
        <div className="px-4 mt-4">
          <button onClick={() => { setStep(0); setRealityMode(null); setIsRightOpen(false); setIntent(null); }} className="w-full flex justify-between items-center p-3 bg-fuchsia-900/40 border border-fuchsia-500/40 rounded-2xl hover:bg-orange-400 hover:text-black transition-all group">
            <span className="text-[10px] font-black uppercase group-hover:text-black">CAMBIAR CANALES</span><span className="text-lg">🌐</span>
          </button>
<button
    onClick={() => {
      const role = session?.user?.user_metadata?.role;
      if (isAdmin || role === 'advertiser') {
        setShowBackstage(true);
      } else {
        setBoosterTab('ANUNCIANTE');
        setShowBooster(true);
      }
    }}
    className="w-full flex justify-between items-center p-3 mt-2 bg-purple-900/40 border border-purple-500/40 rounded-2xl hover:bg-purple-600 hover:text-white transition-all group"
  >
    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white">BACKSTAGE</span>
    <span className="text-lg">🎬</span>
  </button>
        </div> 
        <div className="mt-auto flex flex-col w-full pb-10">
          <div className="w-full px-4 pt-4 border-t border-white/5"><BroTuner ref={broTunerRef} /></div>
        </div>
      </div>      

      {/* 3. PUERTA DERECHA */}
      <div className={`side-panel side-panel-right ${isRightOpen ? 'open' : ''} flex flex-col p-4 gap-2 overflow-y-auto right-panel-scroll`}>
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest text-right mb-1 mt-6 font-mono">Navegación</p>
         <div className="w-full flex flex-col gap-2.5 flex-1 mt-2">
           {navItems.map((item) => (
             <button key={item.id} onClick={() => handleNavigation(item.id)} className={`w-full flex justify-between items-center pl-2 pr-4 py-4 min-h-[4.5rem] border rounded-2xl transition-all group hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-amber-500/20 via-fuchsia-500/20 to-cyan-500/20 border-amber-400/30 hover:from-amber-500/40 hover:via-fuchsia-500/40 hover:to-cyan-500/40`}>
               <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-200 transition-colors group-hover:text-white">{item.label}</span>
               <div className="flex -space-x-3">{item.images.map((imgSrc, idx) => <img key={idx} src={imgSrc} alt="" className="w-9 h-9 rounded-full border-2 border-black object-cover shadow-[0_0_10px_rgba(0,0,0,0.8)]" />)}</div>
             </button>
           ))}
        </div>
          <button onClick={() => setShowBooster(true)} className="w-full py-4 px-5 border-2 border-cyan-400/60 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-xl text-cyan-300 font-black text-sm tracking-[0.25em] hover:from-cyan-500/50 hover:to-blue-500/50 hover:border-cyan-300/80 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]">⛭ BOOSTER STUDIO</button>
               <div className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-3">
          <div className="flex gap-3">
            <button onClick={() => handleReportIssue()} className="flex-1 py-3 px-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl hover:from-red-500/40 hover:to-orange-500/40 flex flex-col items-center justify-center gap-1 transition-all group" title="Reportar Incidencia">
              <span className="text-lg">🚩</span>
              <span className="text-[9px] font-bold text-red-300 uppercase tracking-widest">Incidencia</span>
            </button>
            <button onClick={() => setShowLegal(true)} className="flex-1 py-3 px-3 bg-gradient-to-br from-gray-500/20 to-gray-700/20 border border-gray-500/30 rounded-xl hover:from-gray-500/40 hover:to-gray-700/40 flex flex-col items-center justify-center gap-1 transition-all group" title="Legal / Creador">
              <span className="text-lg text-gray-400 group-hover:text-cyan-400">⚖️</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Legal</span>
            </button>
          </div>
          <button onClick={handleLogout} className="w-full py-3 px-4 border border-red-500/30 bg-red-500/10 rounded-xl text-red-400 font-bold text-xs tracking-[0.2em] uppercase hover:bg-red-500/20 hover:border-red-400/50 transition-all">[ DESCONECTAR ]</button>
        </div>
      </div>
          
      {/* 4. GATILLOS PUERTAS */}
      <button onClick={() => setIsLeftOpen(!isLeftOpen)} className={`fixed top-1/2 -translate-y-1/2 left-0 z-[100] h-24 w-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-r-2xl flex items-center justify-center transition-all ${isLeftOpen ? 'left-64' : 'left-0'}`}><span className="text-cyan-400 text-xs">{isLeftOpen ? '◀' : '▶'}</span></button>
      <button onClick={() => setIsRightOpen(!isRightOpen)} className={`fixed top-1/2 -translate-y-1/2 right-0 z-[100] h-24 w-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-l-2xl flex items-center justify-center transition-all ${isRightOpen ? 'right-64' : 'right-0'}`}><span className="text-fuchsia-400 text-xs">{isRightOpen ? '▶' : '◀'}</span></button>

      {/* 5. DASHBOARD CENTRAL */} 
      {step === 2 && (
        <div className="relative z-50 w-full h-full flex items-center justify-center pointer-events-none p-4">
          <div className="w-full max-w-6xl h-full md:h-auto pointer-events-auto overflow-y-auto">
            <NexusDashboard 
              intent={intent} setIntent={setIntent} scope={scope}
              session={session} ososHandoffContext={ososHandoffContext}
              onGameWin={handleGameWin} handleGoToShop={handleGoToShop}
              onHandoffConsumed={() => setOsosHandoffContext(null)}
            />
          </div>
        </div>
      )}

      {step === 2 && intent === 'games' && (
        <CityLocationBanner scope={scope} />
      )}      

      {intent === 'canjear' && step === 2 && (
        <div className="fixed inset-0 z-[60]">
          <CanjearStrip scope={scope} />
          <TriviaRail sector="CANJES" userId={userId} onLunasUpdate={onLunasUpdate} />
        </div>
      )}
      {step === 2 && intent === 'shopamigos' && (
        <div className="fixed inset-0 z-[60]">
          <TriviaRail sector="SHOP_AMIGOS" userId={userId} onLunasUpdate={onLunasUpdate} />
        </div>
      )}
      
      
      {/* ── AVISOS ──────────────────────────────────────────────────────── */}

{/* 6. OSOS IA RECEPCION */}
{step === 1 && (() => {
  const osoId = (perfilOso?.oso_id || '').toLowerCase().trim();
  const osoValido = ['tito', 'lara', 'puffo'].includes(osoId) ? osoId : 'lara';
  switch (osoValido) {
    case 'tito':
      return <TitoBanner onHandoff={handleCentralHandoff} iaMode={iaMode} isAdmin={isAdmin} ciudad={sessionCity} />;
    case 'puffo':
      return <PuffoBanner onHandoff={handleCentralHandoff} iaMode={iaMode} isAdmin={isAdmin} ciudad={sessionCity} />;
    default:
      return <LaraBanner onHandoff={handleCentralHandoff} iaMode={iaMode} isAdmin={isAdmin} ciudad={sessionCity} />;
  }
})()}

      <style>{`
        .left-panel-scroll {
          scrollbar-width: thin;
          scrollbar-color: #f59e0b #1a1a1a;
        }
        .left-panel-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .left-panel-scroll::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }
        .left-panel-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #f59e0b, #fbbf24, #f0abfc, #00ffff);
          border-radius: 4px;
          box-shadow:0 0 8px rgba(245,158,11,0.5), 0 0 4px rgba(0,255,255,0.5);
        }
        .right-panel-scroll {
          scrollbar-width: thin;
          scrollbar-color: #f59e0b #1a1a1a;
        }
        .right-panel-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .right-panel-scroll::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }
        .right-panel-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #f59e0b, #fbbf24, #f0abfc, #00ffff);
          border-radius: 4px;
          box-shadow:0 0 8px rgba(245,158,11,0.5), 0 0 4px rgba(0,255,255,0.5);
        }
      `}</style>
    </>
  );
}
