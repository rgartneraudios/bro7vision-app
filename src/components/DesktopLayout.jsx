// src/components/DesktopLayout.jsx

import React, { useState, useEffect } from 'react';
import RealityTuner from './RealityTuner';
import ChannelEste from './ChannelEste';
import ChannelEste169 from './ChannelEste169';
import ChannelOeste from './ChannelOeste';
import ChannelOeste169 from './ChannelOeste169';
import SoloO169 from './SoloO169';
import SoloE169 from './SoloE169';
import ChannelMoon from './ChannelMoon';
import BioForest from './BioForest';
import WalletWidget from './WalletWidget';
import MoonMatrixCircle from './MoonMatrixCircle';
import BroLives from './BroLives';
import BroTuner from './BroTuner';
import NeuralButton from './NeuralButton';
import NexusDashboard from './NexusDashboard';
import HoloPrism from './HoloPrism';
import CityLocationBanner from './CityLocationBanner';
import SlideRail from './SlideRail';
import SlideRailServicios from './SlideRailServicios';
import SlideRailAvisos from './SlideRailAvisos';
import SlideRailAudio from './SlideRailAudio';
import NovaBanner  from './personajes/NovaBanner';
import NovaCierre  from './personajes/NovaCierre';
import IsabellaBanner from './personajes/IsabellaBanner';
import EvelynBanner from './personajes/EvelynBanner';
import MapacheBanner from './personajes/MapacheBanner';
import SmisterioBanner from "./personajes/SmisterioBanner";
import JaguarBanner    from "./personajes/JaguarBanner";
import OrumamaBanner   from "./personajes/OrumamaBanner";
import TitoBanner  from "./personajes/TitoBanner";
import LaraBanner  from "./personajes/LaraBanner";
import PuffoBanner from "./personajes/PuffoBanner";
import { getVideoForLocation } from '../data/VideoMap';

export default function DesktopLayout(props) {
  // Desestructuramos todas las props que le manda App.jsx
  const {
    step, setStep, intent, setIntent, realityMode, setRealityMode,
    isLeftOpen, setIsLeftOpen, isRightOpen, setIsRightOpen, perfilSector, handleCentralHandoff,
    balances, setBalances, session, showRadar, setShowRadar, radarQuery, setRadarQuery,
    realItems, filteredItems, hubVideos, hubVideos169, selectedForestUser, setSelectedForestUser,    	savedUserIndex, audioUser, setAudioUser, activePrismUser, setActivePrismUser, projectingUser, 	setProjectingUser, is169Mode, setIs169Mode, broTunerRef, navItems, handleNavigation, handleReportIssue,
    setShowWalletModal, setShowBooster, setShowStory, setShowLegal,
    scope, sessionCP, sessionCity, sessionRef, handleGameWin, handleGoToShop, abrirTienda,
    setSelectedLog, setVlData, ososHandoffContext, setOsosHandoffContext,
    perfilOso, stripVisible, stripCards, stripLabel, setHoloPrismaIndex, findChannelByAlias, checkIfNew,
    ososModo, setOsosModo, handleLogout, selectedCard,
  rumoresMensaje, rumoresLoading, handleRumoresInput,
  oraculoPersonaje,
   iaMode, isAdmin, userCredits, onToggleAdminIA, onTogglePublicIA
  } = props;

const [personajeOraculo, setPersonajeOraculo] = useState('orumama');
const [oraculoEsHandoff, setOraculoEsHandoff] = useState(false);

useEffect(() => {
  const personaje = perfilSector?.personaje_id || perfilOso?.oraculo_personaje;
  if (personaje) setPersonajeOraculo(personaje.toLowerCase());
}, [perfilOso?.oraculo_personaje, perfilSector?.personaje_id]);

const handleHandoffPersonaje = (id) => {
  setOraculoEsHandoff(true);
  setPersonajeOraculo(id);
};

  const INTENTS_CON_UBICACION = new Set(['productos', 'servicios', 'avisos', 'audios']);


  return (
    <>
      {/* 1. FONDO DE VIDEOS */}
      <div className="absolute inset-0 z-0">
        {step === 0 && !projectingUser && !selectedCard && (
          !realityMode ? <RealityTuner onSelect={setRealityMode} /> :
          realityMode === 'este'  ? <ChannelEste  videoUsers={hubVideos} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={(u) => setProjectingUser(u)} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} /> :
          realityMode === 'oeste' ? <ChannelOeste videoUsers={hubVideos} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={(u) => setProjectingUser(u)} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} /> :
          realityMode === 'este169'  ? <ChannelEste169  videoUsers={hubVideos169} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={(u) => { setProjectingUser(u); if (u._mode169) setIs169Mode(true); }} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} /> :
realityMode === 'oeste169' ? <ChannelOeste169 videoUsers={hubVideos169} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={(u) => { setProjectingUser(u); if (u._mode169) setIs169Mode(true); }} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} /> :
          realityMode === 'solo_o169' ? <SoloO169 videoUsers={hubVideos169} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={(u) => { setProjectingUser(u); if (u._mode169) setIs169Mode(true); }} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} /> :
          realityMode === 'solo_e169' ? <SoloE169 videoUsers={hubVideos169} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={(u) => { setProjectingUser(u); if (u._mode169) setIs169Mode(true); }} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} /> :
          realityMode === 'moon'  ? <ChannelMoon  videoUsers={hubVideos} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={(u) => { setProjectingUser(u); if (u._mode169) setIs169Mode(true); }} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} /> :
          <BioForest videoUsers={hubVideos} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={(u) => setProjectingUser(u)} selectedForestUser={selectedForestUser} savedUserIndex={savedUserIndex} />
        )}
          
        {(step === 1 || step === 2) && (
          <video
            key={step === 1 ? (ososModo === 'retorno' ? 'ososia_recepcion2' : 'ososia_recepcion_v3') : intent}
            src={
              step === 1
                ? ososModo === 'retorno' ? "https://media.bro7vision.com/ososia_recepcion1.mp4" : "https://media.bro7vision.com/ososia_recepcion1.mp4"
                : intent === 'ai'              ? "https://media.bro7vision.com/oraculo0.mp4"
                : intent === 'game'            ? "https://media.bro7vision.com/game_bg.mp4"
                : intent === 'audios'           ? "https://media.bro7vision.com/brolives1.mp4"
                : intent === 'internal_search' ? "https://media.bro7vision.com/reinos.mp4"
                : getVideoForLocation(scope)
            }
            autoPlay loop muted playsInline className="w-full h-full object-cover transition-opacity duration-1000 animate-fadeIn"
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
         <NeuralButton
  isAdmin={isAdmin}
  iaMode={iaMode}
  tokensRestantes={userCredits?.tokensRestantes || 0} // <-- Añadido ?. y || 0
  tokensTotales={userCredits?.tokensTotales || 1000000} // <-- Añadido ?. y un total por defecto
  onToggleAdmin={onToggleAdminIA}
  onTogglePublic={onTogglePublicIA}
  setShowWalletModal={setShowWalletModal}
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
            <button key={item.id} onClick={() => handleNavigation(item.id)} className={`w-full flex justify-between items-center p-4 bg-black/40 backdrop-blur-md border rounded-2xl transition-all group hover:scale-[1.02] active:scale-[0.98] ${item.color}`}>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 transition-colors">{item.label}</span>
              <div className="flex -space-x-3">{item.images.map((imgSrc, idx) => <img key={idx} src={imgSrc} alt="" className="w-9 h-9 rounded-full border-2 border-black object-cover shadow-[0_0_10px_rgba(0,0,0,0.8)]" />)}</div>
            </button>
          ))}
        </div>   
               <div className="mt-2 border-t border-white/10 pt-3 flex flex-col gap-2">
          <button onClick={() => setShowBooster(true)} className="w-full p-3 border border-cyan-500/30 bg-cyan-500/10 rounded-xl text-cyan-400 font-mono text-[11px] hover:bg-cyan-500 hover:text-black transition-all">[ BOOSTER STUDIO ]</button>
          <button onClick={() => { setShowStory(true); setIsLeftOpen(false); }} className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 border border-fuchsia-500/30 rounded-xl hover:border-fuchsia-400 transition-all">
            <span className="text-sm">❄️</span><span className="text-[9px] font-black italic text-fuchsia-200">BRO STORIES</span>
          </button>  
          <div className="flex gap-2">
            <button onClick={() => handleReportIssue()} className="flex-1 p-2 bg-red-900/20 border border-red-500/30 rounded-xl hover:bg-red-500/20 flex justify-center items-center group transition-all" title="Reportar Incidencia"><span className="text-sm">🚩</span></button>
            <button onClick={() => setShowLegal(true)} className="flex-1 p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 flex justify-center items-center group transition-all" title="Legal / Creador"><span className="text-sm text-gray-400 group-hover:text-cyan-400">⚖️</span></button>
          </div>
        </div>
        <button onClick={handleLogout} className="mt-2 text-red-500 font-mono text-[10px] underline text-right w-full">[ DISCONNECT ]</button>
      </div>
          
      {/* 4. GATILLOS PUERTAS */}
      <button onClick={() => setIsLeftOpen(!isLeftOpen)} className={`fixed top-1/2 -translate-y-1/2 left-0 z-[100] h-24 w-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-r-2xl flex items-center justify-center transition-all ${isLeftOpen ? 'left-64' : 'left-0'}`}><span className="text-cyan-400 text-xs">{isLeftOpen ? '◀' : '▶'}</span></button>
      <button onClick={() => setIsRightOpen(!isRightOpen)} className={`fixed top-1/2 -translate-y-1/2 right-0 z-[100] h-24 w-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-l-2xl flex items-center justify-center transition-all ${isRightOpen ? 'right-64' : 'right-0'}`}><span className="text-fuchsia-400 text-xs">{isRightOpen ? '▶' : '◀'}</span></button>

      {/* 5. DASHBOARD CENTRAL */} 
      {step === 2 && (
        <div className="relative z-50 w-full h-full flex items-center justify-center pointer-events-none p-4">
          <div className="w-full max-w-6xl h-full md:h-auto pointer-events-auto overflow-y-auto">
            <NexusDashboard 
              intent={intent} setIntent={setIntent} items={filteredItems} scope={scope} step={step} setStep={setStep} session={session} balances={balances} setBalances={setBalances} realItems={realItems} sessionCP={sessionCP} sessionCity={sessionCity} sessionRef={sessionRef} ososHandoffContext={ososHandoffContext}
              onHoverCard={(u) => setActivePrismUser(u)} onBack={() => setStep(0)} onGameWin={handleGameWin} setProjectingUser={setProjectingUser} onOpenProjector={(u) => setProjectingUser(u)} onTuneIn={(u) => setAudioUser(u)} onOpenVideo={(u) => setProjectingUser(u)} handleGoToShop={handleGoToShop} onOpenLog={setSelectedLog} onVLChange={(vl) => setVlData(vl)} onHandoffConsumed={() => setOsosHandoffContext(null)}
            />
          </div>
        </div>
      )}      

      {/* HOLOPRISMA Y BANNERS */}
      {step === 2 && ['productos', 'servicios', 'audios'].includes(intent) && (
        <div className="hidden md:flex fixed left-1/2 top-[24%] -translate-x-1/2 -translate-y-1/2 z-[40] flex-col items-center animate-fadeIn pointer-events-none"><div className="scale-[1.1] origin-bottom-right relative z-20 transition-transform hover:scale-[1.15]"><HoloPrism user={activePrismUser} showNumbers={true} /></div></div>
      )}
      
      {step === 2 && INTENTS_CON_UBICACION.has(intent) && !selectedCard && <CityLocationBanner scope={scope} />}
      {step === 2 && intent === 'productos' && <SlideRail />}
      {step === 2 && intent === 'servicios' && <SlideRailServicios />}
      {step === 2 && intent === 'avisos'    && <SlideRailAvisos />}
      {step === 2 && intent === 'audios'     && <SlideRailAudio />}
      
      
      {/* ── PRODUCTOS ───────────────────────────────────────────────────── */}     
      {step === 2 && intent === 'productos' && (
        <NovaBanner
          sessionCity={sessionCity}
          sessionCP={sessionCP}
          realItems={realItems}
          stripVisible={stripVisible}
          stripCards={stripCards}
          stripLabel={stripLabel}
          onHandoff={handleCentralHandoff}
          iaMode={iaMode}
          isAdmin={isAdmin}
          entidad={ososHandoffContext?.comercio_especifico}
          hayTarjetas={stripVisible}
          onOpenTerminal={(c) => abrirTienda(c, 'novaCierre')}
          onSetActiveIndex={setHoloPrismaIndex}
          onEntityFocus={(u) => setActivePrismUser(u)}
          setIntent={setIntent}
        />
      )}
      
      {/* ── SERVICIOS ───────────────────────────────────────────────────── */}
      {step === 2 && intent === 'servicios' && (
        <IsabellaBanner
          personaje={perfilSector?.personaje_id || 'isabella'}
          sessionCity={sessionCity}
          sessionCP={sessionCP}
          realItems={realItems}
          stripVisible={stripVisible}
          stripCards={stripCards}
          stripLabel={stripLabel}
          onHandoff={handleCentralHandoff}
          iaMode={iaMode}
          isAdmin={isAdmin}
          entidad={ososHandoffContext?.comercio_especifico}
          hayTarjetas={stripVisible}
          onOpenTerminal={(c) => abrirTienda(c, 'isabellaCierre')}
          onSetActiveIndex={setHoloPrismaIndex}
          onEntityFocus={(u) => setActivePrismUser(u)}
          setIntent={setIntent}
        />
      )}

      {/* ── AVISOS ──────────────────────────────────────────────────────── */}
      {step === 2 && intent === 'avisos' && (
        <EvelynBanner
          personaje={perfilSector?.personaje_id || 'evelyn'}
          sessionCity={sessionCity}
          genesis={balances.genesis}
          userId={session?.user?.id}
          autorAlias={perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano'}
          realItems={realItems}
          stripVisible={stripVisible}
          stripCards={stripCards}
          stripLabel={stripLabel}
          onHandoff={handleCentralHandoff}
          onAvisoConectar={props.onAvisoConectar}
          onAvisoPublicar={props.onAvisoPublicar}
          setProjectingUser={setProjectingUser}
          iaMode={iaMode}
          isAdmin={isAdmin}
        />
      )}

      {/* ── AUDIO ───────────────────────────────────────────────────────── */}
      {step === 2 && intent === 'audios' && (
        <MapacheBanner
          personaje={perfilSector?.personaje_id || 'mapache'}
          realItems={realItems}
          stripVisible={stripVisible}
          stripCards={stripCards}
          stripLabel={stripLabel}
          findChannelByAlias={findChannelByAlias}
          checkIfNew={checkIfNew}
          onHandoff={handleCentralHandoff}
          onInvokeOsos={() => setStep(1)}
          onInvokeNova={() => setIntent('productos')}
          onOpenProfile={(u) => setProjectingUser(u)}
          onTuneIn={(u) => { setAudioUser(u); setActivePrismUser(u); }}
          onTuneTuner={(id) => broTunerRef.current?.playById(id)}
          onStopTuner={() => broTunerRef.current?.stop()}
          iaMode={iaMode}
          isAdmin={isAdmin}
          ciudad={sessionCity}
          entidad={ososHandoffContext?.comercio_especifico}
          hayTarjetas={stripVisible}
        />
      )}

{/* ── ORÁCULO ─────────────────────────────────────────────────────── */}
{step === 2 && intent === 'ai' && personajeOraculo === 'smisterio' && (
  <SmisterioBanner
    alias={perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano'}
    origenLlegada={oraculoEsHandoff ? 'handoff' : 'inicial'}
    onHandoffPersonaje={handleHandoffPersonaje}
    onInvokeOsos={() => { setOraculoEsHandoff(false); setStep(1); setOsosModo('entrada'); }}
    iaMode={iaMode}
    isAdmin={isAdmin}
  />
)}
{step === 2 && intent === 'ai' && personajeOraculo === 'jaguar' && (
  <JaguarBanner
    alias={perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano'}
    origenLlegada={oraculoEsHandoff ? 'handoff' : 'inicial'}
    onHandoffPersonaje={handleHandoffPersonaje}
    onInvokeOsos={() => { setOraculoEsHandoff(false); setStep(1); setOsosModo('entrada'); }}
    iaMode={iaMode}
    isAdmin={isAdmin}
  />
)}
{step === 2 && intent === 'ai' && personajeOraculo === 'orumama' && (
  <OrumamaBanner
    alias={perfilOso?.osos_nombre || session?.user?.user_metadata?.alias || 'Ciudadano'}
    origenLlegada={oraculoEsHandoff ? 'handoff' : 'inicial'}
    onHandoffPersonaje={handleHandoffPersonaje}
    onInvokeOsos={() => { setOraculoEsHandoff(false); setStep(1); setOsosModo('entrada'); }}
    iaMode={iaMode}
    isAdmin={isAdmin}
  />
)}
      
      {/* 6. OSOS IA RECEPCION */}
{step === 1 && (
  <>
    {(perfilOso?.oso_id || 'lara').toLowerCase() === 'tito' &&
      <TitoBanner onHandoff={handleCentralHandoff} iaMode={iaMode} isAdmin={isAdmin} ciudad={sessionCity} />}
    {(perfilOso?.oso_id || 'lara').toLowerCase() === 'lara' &&
      <LaraBanner onHandoff={handleCentralHandoff} iaMode={iaMode} isAdmin={isAdmin} ciudad={sessionCity} />}
    {(perfilOso?.oso_id || 'lara').toLowerCase() === 'puffo' &&
      <PuffoBanner onHandoff={handleCentralHandoff} iaMode={iaMode} isAdmin={isAdmin} ciudad={sessionCity} />}
  	</>
	)}
    </>
  );
}
