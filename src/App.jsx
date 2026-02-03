// src/App.jsx (CORRECCIÓN: POSICIONAMIENTO Y VISIBILIDAD MÓVIL)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './supabaseClient';
import GenesisGate from './components/GenesisGate';
import WalletWidget from './components/WalletWidget';
import ConversionModal from './components/ConversionModal';
import PaymentModal from './components/PaymentModal';
import NexusDashboard from './components/NexusDashboard';
import StoryPlayer from './components/StoryPlayer'; 
import BroTuner from './components/BroTuner';
import { MASTER_DB } from './data/database';
import { getVideoForLocation } from './data/VideoMap';
import BroLives from './components/BroLives';
import BroLogViewer from './components/BroLogViewer';
import HoloPrism from './components/HoloPrism';
import IdentityTerminal from './components/IdentityTerminal';
import BoosterModal from './components/BoosterModal';
import LegalTerminal from './components/LegalTerminal';
import HoloProjector from './components/HoloProjector';
import HoloArcade from './components/HoloArcade';
import BioForest from './components/BioForest';
import WebBotTerminal from './components/WebBotTerminal';
import RacoonTerminal from './components/RacoonTerminal';
import RealityTuner from './components/RealityTuner';

function App() {
  const [realityMode, setRealityMode] = useState(null); 
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(0); 
  const [intent, setIntent] = useState(null);
  const [scope, setScope] = useState(null);
  const [balances, setBalances] = useState({ genesis: 0, nova: 0, crescens: 0, plena: 0, decrescens: 0 });
  const [realItems, setRealItems] = useState([]);
  const [playingCreator, setPlayingCreator] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showStory, setShowStory] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  
  // MODALES
  const [showLegal, setShowLegal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBooster, setShowBooster] = useState(false);
  const [isTeleporting, setIsTeleporting] = useState(false);
  
  const [teleportCoords, setTeleportCoords] = useState({ city: '', country: '' });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdentity, setSelectedIdentity] = useState(null);
  const [projectingUser, setProjectingUser] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [prismImages, setPrismImages] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const audioRef = useRef(new Audio());

  // --- AUDIO & URL UTILS ---
  const getPlayableUrl = (url) => {
    if (!url) return null;
    let clean = url.trim();
    if (clean.includes('dropbox.com')) {
      clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                   .replace('dropbox.com', 'dl.dropboxusercontent.com');
      if (!clean.includes('raw=1')) {
         clean += clean.includes('?') ? '&raw=1' : '?raw=1';
      }
    }
    return clean;
  };

  useEffect(() => {
    const handleError = (e) => {
        if (audioRef.current.src) {
            setIsAudioPlaying(false);
        }
    };
    audioRef.current.addEventListener('error', handleError);
    audioRef.current.addEventListener('ended', () => setIsAudioPlaying(false));
    return () => {
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.removeEventListener('ended', () => setIsAudioPlaying(false));
    };
  }, []);
  
  const syncGenesisToDB = async (newAmount) => {
    if (!session?.user?.id) return;
    const { error } = await supabase
      .from('profiles')
      .update({ genesis: newAmount })
      .eq('id', session.user.id);
    if (error) console.error("Error al sincronizar Génesis:", error.message);
  };

  const handleTuneIn = (creator) => {
    const rawUrl = creator.audioFile || creator.audio_file;
    if (!rawUrl) { console.warn("No Audio URL"); return; }

    setPrismImages([creator.holo_1 || creator.img, creator.holo_2 || creator.img, creator.holo_3 || creator.img, creator.holo_4 || creator.img]);

    if (playingCreator?.id === creator.id) {
        if (isAudioPlaying) {
            audioRef.current.pause();
            setIsAudioPlaying(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) playPromise.then(() => setIsAudioPlaying(true)).catch(e => console.log("Resume err"));
        }
    } else {
        setPlayingCreator({ ...creator, audioFile: rawUrl });
        setIsAudioPlaying(true); 
    }
  };

  useEffect(() => {
    const rawUrl = playingCreator?.audioFile || playingCreator?.audio_file;
    if (rawUrl) {
      const finalUrl = getPlayableUrl(rawUrl);
      if (!finalUrl) { setIsAudioPlaying(false); return; }

      if (audioRef.current.src !== finalUrl && audioRef.current.src !== window.location.origin + finalUrl) {
        audioRef.current.src = finalUrl;
        audioRef.current.load();
      }

      if (isAudioPlaying) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
              playPromise.then(() => {}).catch(e => setIsAudioPlaying(false));
          }
      } else {
          audioRef.current.pause();
      }
    }
  }, [playingCreator, isAudioPlaying]);

  // --- DATA LOADING ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (prof) setBalances({ genesis: prof.genesis, nova: prof.nova, crescens: prof.crescens, plena: prof.plena, decrescens: prof.decrescens });
      
      const { data: all } = await supabase.from('profiles').select('*');
      if (all) {
        const cards = all.map(u => {
          if (!u.product_title && !u.service_title && !u.video_file && !u.audio_file) return null;
          return {
            ...u, 
            id: u.id, 
            shopName: u.alias || 'Ciudadano', 
            name: u.product_title || u.service_title || u.alias,
            message: u.twit_message || 'Emitiendo señal...', 
            img: u.card_banner_url || u.banner_url, 
            avatar_url: u.avatar_url,
            audioFile: u.audio_file, 
            video_file: u.video_file, 
            isAsset: false,
            productData: { name: u.product_title, price: u.product_price },
            hasProduct: !!u.product_title, 
            hasService: !!u.service_title,
            type: u.video_file ? ['shop', 'live'] : ['shop']
          };
        }).filter(Boolean);
        setRealItems(cards);
      }
    };
    fetchData();
  }, [session, step]);

  const filteredItems = useMemo(() => {
    const MOCKS_CON_PAGO = MASTER_DB.map(m => ({
        ...m, 
        hasProduct: true, 
        isAsset: false, 
        productData: { name: m.name, price: m.price || 15 }, 
        audioFile: m.audioFile || m.audio_file,
        message: m.desc || "Simulación activa en la red..." 
    }));
    const ALL = [...realItems, ...MOCKS_CON_PAGO];
    return ALL.filter(item => {
      if (intent === 'ai' || intent === 'game' || intent === 'web_search' || intent === 'internal_search') return false;
      const types = Array.isArray(item.type) ? item.type : [item.type];
      if (intent === 'broshop') return types.includes('shop') || types.includes('product') || types.includes('service');
      if (intent === 'lives') return types.includes('live');
      return true;
    });
  }, [intent, realItems]);

  // --- NAVIGATION ---
  const handleLaunchAsset = (product) => {
    const type = product.assetType || product.asset_type;
    const url = product.url;
    setSelectedCard(null); 
    if (type === 'video') handleOpenVideo({ ...product, video_file: url });
    else if (type === 'game') setActiveGame({ url, title: product.name });
    else if (type === 'audio') handleTuneIn({ ...product, audioFile: url });
  };
  
  const handleOpenVideo = (creator) => {
    setProjectingUser(creator);
  };

  const handleNavigation = (newIntent) => {
    setIntent(newIntent);
    const needsGPS = ['broshop', 'lives', 'internal_search'];
    if (needsGPS.includes(newIntent)) {
         if (!scope) setStep(1); else setStep(2);
    } else {
        setStep(2);
    }
  };

  const getButtonClass = (id) => {
    const isActive = intent === id && step === 2;
    const base = "px-3 py-2 md:px-5 md:py-3 text-[8px] md:text-[10px] font-black border rounded-xl transition-all ";
    
    if (!isActive) return base + "border-white/20 text-gray-400 hover:text-white";
    if (id === 'broshop') return base + "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_cyan]";
    if (id === 'lives') return base + "bg-red-600 text-white border-red-500 shadow-[0_0_15px_red]";
    if (id === 'ai') return base + "bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_purple]";
    if (id === 'game') return base + "bg-green-500 text-black border-green-400 shadow-[0_0_15px_green]";
    if (id === 'web_search') return base + "bg-blue-500 text-white border-blue-400 shadow-[0_0_15px_blue]";
    if (id === 'internal_search') return base + "bg-orange-500 text-black border-orange-400 shadow-[0_0_15px_orange]";
    return base + "bg-white text-black";
  };
  
  const hubVideos = useMemo(() => {
    const masterVideo = { alias: "BRO MASTER", video_file: "/videos/Chica_forest.mp4", id: "master_01" };
    const userVideos = realItems.filter(item => item.video_file && item.video_file !== "");
    return [masterVideo, ...userVideos];
  }, [realItems]);

  if (!session) return <GenesisGate />;

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* 1. CAPA DE FONDO */}
      <div className="absolute inset-0 z-0">
        {step === 0 && (
          !realityMode ? (
            <RealityTuner onSelect={(mode) => setRealityMode(mode)} />
          ) : (
            <BioForest 
              videoUsers={hubVideos} 
              balances={balances} 
              setBalances={setBalances} 
              session={session}
              realityMode={realityMode} 
            />
          )
        )}
        {step === 1 && <video src="/portada.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />}
        {step === 2 && (
          <video 
            key={intent} 
            src={intent === 'ai' ? "/ai_bg.mp4" : intent === 'game' ? "/game_bg.mp4" : intent === 'lives' ? "/brolives.mp4" : intent === 'internal_search' ? "/racoonask.mp4" : intent === 'web_search' ? "/websearch.mp4" : getVideoForLocation(scope)} 
            autoPlay loop muted playsInline 
            className="w-full h-full object-cover animate-fadeIn" 
          />
        )}
      </div>

      {/* 2. HUD SUPERIOR */}
      <div className="fixed top-4 left-4 md:top-8 md:left-8 z-[100] flex items-center gap-4">
          <WalletWidget balances={balances} onClick={() => setShowWalletModal(true)} />
          <button onClick={() => setShowStory(true)} className="flex items-center gap-2 bg-gradient-to-r from-violet-900/80 to-fuchsia-900/80 backdrop-blur-md border border-fuchsia-500/50 px-4 py-2 rounded-2xl shadow-lg animate-pulse hover:scale-105 transition-transform">
              <span className="text-xl">❄️</span>
              <div className="hidden md:block text-left">
                <p className="text-[7px] text-fuchsia-300 font-bold uppercase">Stories</p>
                <p className="text-xs font-black italic">ON AIR</p>
              </div>
          </button>
      </div>
      
      {/* 3. BOOSTER Y EXIT */}
      <div className="absolute top-4 right-4 z-[100] flex flex-col items-end gap-2">
          <button onClick={() => setShowBooster(true)} className="text-[12px] font-mono text-cyan-400 border border-cyan-500/50 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md shadow-[0_0_15px_cyan/30] hover:bg-cyan-500 hover:text-black transition-all">[ BOOSTER STUDIO ]</button>
          <button onClick={() => { supabase.auth.signOut(); setSession(null); }} className="text-[9px] text-red-500 font-bold opacity-60 hover:opacity-100">[ EXIT ]</button>
      </div>

      {/* 4. SECCIÓN GPS (STEP 1) */}
      {step === 1 && (
        <div className="relative z-[500] h-full flex flex-col items-center justify-end pb-32 animate-zoomIn pointer-events-auto">
           <div className="flex flex-row gap-4 w-full max-w-2xl px-10">
              <button onClick={() => { setScope({ city: 'Local' }); setStep(2); }} className="flex-1 bg-black/80 border-2 border-cyan-400 py-4 rounded-2xl font-black text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">📍 SINTONIZAR GPS</button>
              <button onClick={() => setIsTeleporting(true)} className="flex-1 bg-black/80 border-2 border-fuchsia-500 py-4 rounded-2xl font-black text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black transition-all">🌀 TELETRANSPORTE</button>
           </div>
           <button onClick={() => setStep(0)} className="text-gray-500 text-[10px] mt-6 font-bold uppercase tracking-widest hover:text-white">❮ VOLVER AL HUB</button>
        </div>
      )}

      {/* 5. TORRE DE CONTROL IZQUIERDA */}
      
      {/* A. COOKIES (BASE) - VISIBLE SIEMPRE SI NO ESTÁ ACEPTADA */}
      {/* Z-Index muy alto (2001) para que nada lo tape */}
      {!cookiesAccepted && (
          <div className="fixed bottom-4 left-4 z-[2001] w-64 bg-black/95 border border-cyan-500/30 p-3 rounded-xl shadow-2xl pointer-events-auto animate-slideUp">
              <p className="text-gray-400 text-[9px] mb-2 font-mono uppercase">Protocolo de Cookies Activo.</p>
              <button onClick={() => setCookiesAccepted(true)} className="w-full py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg font-black text-[9px] hover:bg-cyan-500 hover:text-black transition-all">ACEPTAR</button>
          </div>
      )}

      {/* B. BRO-LIVES (MEDIO) - SOLO PC */}
      {/* hidden md:block: Se oculta en móvil, aparece en pantallas medianas/grandes */}
      {step === 2 && (
          <div className="hidden md:block fixed left-4 bottom-32 z-40 w-64 animate-fadeIn">
              <div className="w-full relative z-10 transition-all hover:scale-105 origin-bottom-left">
                  <BroLives 
                      playingCreator={playingCreator} 
                      isAudioPlaying={isAudioPlaying} 
                      onToggleAudio={handleTuneIn} 
                  />
              </div>
          </div>
      )}

      {/* BRO-TUNER: Oculto en móvil (hidden) y visible en PC (md:block) */}
<div className="hidden md:block fixed left-4 bottom-64 z-[150]">
    <BroTuner />
</div>
      
      {/* 7. NAVEGACIÓN (FILA ÚNICA PARA MÓVIL) */}
{((step === 0 && realityMode) || step === 2) && (
  <div className="fixed 
    bottom-8 left-0 w-full px-2
    md:bottom-6 md:right-8 md:left-auto md:w-48 
    z-[200] flex justify-center items-center pointer-events-none transition-all">
      
      <div className="flex flex-row md:flex-col gap-1 p-2
        bg-black/90 backdrop-blur-2xl rounded-2xl md:rounded-[1.5rem] 
        border border-white/10 shadow-2xl pointer-events-auto
        overflow-x-auto no-scrollbar max-w-full"> {/* overflow-x para asegurar que quepan los 8 */}
          
          {/* BOTÓN REALITY */}
          <button onClick={() => { setStep(0); setRealityMode(null); }} 
            className="flex-shrink-0 flex items-center justify-center p-2.5 md:p-3 text-[10px] font-black border border-white/10 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-black transition-all group">
              <span className="text-xl md:text-base">🌐</span>
              <span className="hidden md:block ml-3">REALITY</span>
          </button>

          {/* BOTÓN GPS */}
          <button onClick={() => setStep(1)} 
            className="flex-shrink-0 flex items-center justify-center p-2.5 md:p-3 text-[10px] font-black border border-white/10 text-white rounded-xl hover:bg-white hover:text-black transition-all group">
              <span className="text-xl md:text-base">📍</span>
              <span className="hidden md:block ml-3">GPS</span>
          </button>

          {/* Los demás botones en la misma fila */}
          {['broshop', 'lives', 'ai', 'game', 'web_search', 'internal_search'].map(id => (
              <button 
                key={id} 
                onClick={() => handleNavigation(id)} 
                className={`${getButtonClass(id)} flex-shrink-0 flex items-center justify-center p-2.5 md:p-3 text-[10px] rounded-xl group`}
              >
                  <span className="text-xl md:text-base">
                      {id === 'broshop' ? '🛒' : id === 'lives' ? '📡' : id === 'ai' ? '🤖' : id === 'game' ? '🎮' : id === 'web_search' ? '🌐' : '🔍'}
                  </span>
                  <span className="hidden md:block ml-3 uppercase">
                      {id === 'broshop' ? 'SHOP' : id === 'lives' ? 'LIVES' : id === 'ai' ? 'AI' : id === 'game' ? 'GAMES' : id === 'web_search' ? 'P2P' : 'SEARCH'}
                  </span>
              </button>
          ))}
      </div>
  </div>
)}

      {/* 8. HOLOPRISMA (SUBIDO EN PC) */}
      {step === 2 && (
        <div className="hidden md:flex fixed right-2 bottom-[750px] z-40 flex-col items-center w-24 animate-fadeIn">
             <div className="scale-[1.1] origin-bottom-right relative z-20 transition-transform hover:scale-[1.15]">
                  <HoloPrism customImages={prismImages} />
             </div>
        </div>
      )}
      {/* 7. DASHBOARD CENTRAL */}
      {step === 2 && intent !== 'web_search' && intent !== 'internal_search' && (
          <NexusDashboard 
            items={filteredItems} intent={intent} setIntent={setIntent} 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            onBack={() => setStep(0)} onTuneIn={handleTuneIn} 
            onSelectShop={(item) => setSelectedCard(item)} 
            onUserClick={setSelectedIdentity} 
            onOpenVideo={handleOpenVideo} 
            onGameWin={(amount) => {
              setBalances(prev => {
                const newTotal = prev.genesis + amount;
                syncGenesisToDB(newTotal);
                return { ...prev, genesis: newTotal };
              });
            }}
            onOpenLog={setSelectedLog}
          />
      )}

      {/* PANTALLAS EXTRA */}
      {intent === 'web_search' && step === 2 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="w-full max-w-6xl absolute top-[10%] bottom-32 px-4 pointer-events-auto bg-[#050505] rounded-3xl overflow-hidden shadow-2xl border border-blue-900/50 animate-zoomIn">
                <WebBotTerminal onClose={() => setIntent('broshop')} onSelectAsset={(asset) => setSelectedCard({...asset, isAsset: true})} />
            </div>
        </div>
      )}

      {intent === 'internal_search' && step === 2 && (
          <div className="absolute top-[15%] bottom-[25%] w-full max-w-5xl left-1/2 -translate-x-1/2 px-4 pointer-events-auto z-50 animate-zoomIn">
            <RacoonTerminal searchQuery={searchQuery} />
          </div>
      )}

      {/* MODALES GLOBALES */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[2000] pointer-events-auto">
          <button onClick={() => setShowLegal(true)} className="text-[10px] md:text-xs font-bold font-mono px-8 py-2.5 rounded-t-2xl bg-black/90 backdrop-blur-md border-t border-x border-cyan-500/50 text-cyan-400 shadow-[0_-5px_30px_rgba(6,182,212,0.3)] hover:text-white transition-all">⚖️ LEGAL / CREADOR</button>
      </div>

      {selectedCard && <PaymentModal isOpen={!!selectedCard} onClose={() => setSelectedCard(null)} product={selectedCard} balances={balances} onConfirmPayment={(c, a, p) => setBalances(prev=>({...prev, [c]: (prev[c]||0)-a}))} onLaunch={handleLaunchAsset} />}
      {showLegal && <LegalTerminal onClose={() => setShowLegal(false)} />}
      {showBooster && <BoosterModal onClose={() => setShowBooster(false)} />}
      {showStory && <StoryPlayer src="/brostories_demo.mp4" activePhase="nova" onClose={() => setShowStory(false)} onComplete={(amount) => setBalances(prev => ({...prev, genesis: prev.genesis + amount}))} />}
      
      {isTeleporting && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center pointer-events-none">
            <div className="border border-fuchsia-500 p-12 bg-black text-center rounded-3xl pointer-events-auto">
              <input type="text" autoFocus placeholder="COORDENADAS..." className="bg-transparent border-b-2 border-white text-2xl outline-none text-center font-black uppercase mb-10 w-full" onChange={(e) => setTeleportCoords({city: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && (setScope(teleportCoords), setIsTeleporting(false), setStep(2))} />
              <div className="flex gap-6 justify-center"><button onClick={() => setIsTeleporting(false)} className="text-gray-500 uppercase">CANCEL</button><button onClick={() => { setScope(teleportCoords); setIsTeleporting(false); setStep(2); }} className="bg-fuchsia-600 px-12 py-3 font-black uppercase">TELETRANSPORTE</button></div>
            </div>
        </div>
      )}
      
      {projectingUser && <HoloProjector videoUrl={projectingUser.video_file} user={projectingUser} onClose={() => setProjectingUser(null)} />}
      {activeGame && <HoloArcade gameUrl={activeGame.url} title={activeGame.title} onClose={() => setActiveGame(null)} />}
      {showWalletModal && <ConversionModal balances={balances} onClose={() => setShowWalletModal(false)} />}
      {selectedIdentity && <IdentityTerminal user={selectedIdentity} onClose={() => setSelectedIdentity(null)} />}
      {selectedLog && <BroLogViewer log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}

export default App;