// src/App.jsx (VERSIÓN FINAL CORREGIDA: LEGAL + GPS + CARDS)

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';
import GenesisGate from './components/GenesisGate';
import PaginatedDisplay from './components/PaginatedDisplay';
import MascotGuide from './components/MascotGuide';
import WalletWidget from './components/WalletWidget';
import ConversionModal from './components/ConversionModal';
import PaymentModal from './components/PaymentModal';
import NexusDashboard from './components/NexusDashboard';
import StoryPlayer from './components/StoryPlayer';
import BroTuner from './components/BroTuner';
import { MASTER_DB } from './data/database';
import { MOON_MATRIX } from './data/MoonMatrix';
import { getVideoForLocation } from './data/VideoMap';
import BroLives from './components/BroLives';
import BroLogViewer from './components/BroLogViewer';
import HoloPrism from './components/HoloPrism';
import IdentityTerminal from './components/IdentityTerminal';
import BoosterModal from './components/BoosterModal';
import LegalBar from './components/LegalBar'; 
import LegalTerminal from './components/LegalTerminal';

function App() {
  // --- 1. LÓGICA DE SEGURIDAD (SUPABASE) ---
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // --- ESTADOS GLOBALES ---
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState('product');
  const [scope, setScope] = useState(null);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [teleportCoords, setTeleportCoords] = useState({ city: '', country: '' });
  const [balances, setBalances] = useState({ genesis: 0, nova: 0, crescens: 0, plena: 0, decrescens: 0 });
  const [moonPhase, setMoonPhase] = useState('plena');
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // ESTADO LEGAL (NUEVO)
  const [showLegal, setShowLegal] = useState(false);

  // VISUALES
  const [showStory, setShowStory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [previewCard, setPreviewCard] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoverHelp, setHoverHelp] = useState(null);
  const [activeBoosts, setActiveBoosts] = useState({});
  const [prismImages, setPrismImages] = useState(null);
  const [selectedIdentity, setSelectedIdentity] = useState(null);
  const [showBooster, setShowBooster] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // AUDIO STATE
  const [playingCreator, setPlayingCreator] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  const fetchBalances = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('genesis, nova, crescens, plena, decrescens')
        .eq('id', session.user.id)
        .single();
      if (error) throw error;
      if (data) setBalances({ ...data });
    } catch (error) { console.error("Error al leer saldo:", error); }
  };

  useEffect(() => { if (session) fetchBalances(); }, [session]);

  useEffect(() => {
    if (playingCreator && playingCreator.audioFile) {
      const fileUrl = playingCreator.audioFile;
      if (!audioRef.current.src.endsWith(fileUrl)) {
        audioRef.current.src = fileUrl;
        audioRef.current.load();
        if (isAudioPlaying) audioRef.current.play().catch(e => console.error("Error Play:", e));
      } else {
        if (isAudioPlaying) audioRef.current.play().catch(e => console.error("Error Resume:", e));
        else audioRef.current.pause();
      }
    } else {
      audioRef.current.pause();
    }
  }, [playingCreator, isAudioPlaying]);

  const handleTuneIn = (creator) => {
    if (playingCreator?.id === creator.id) setIsAudioPlaying(!isAudioPlaying);
    else { setPlayingCreator(creator); setIsAudioPlaying(true); }
  };

  const handleCardSelect = (item) => {
    setSelectedCard(item);
    // LÓGICA DEL PRISMA
    const defaultImg = item.img || item.image || "/images/prism_1.jpg";
    setPrismImages([
        item.holo_1 || defaultImg,
        item.holo_2 || defaultImg,
        item.holo_3 || defaultImg,
        item.holo_4 || defaultImg
    ]);
  };

  const handlePreviewCard = (item) => handleCardSelect(item);
     
  const handleOpenIdentity = (data) => {
    if (data && (data.title || data.category)) setSelectedLog(data);
    else setSelectedIdentity(data);
  };

  const getCurrentVideo = () => {
    if (intent === 'ai') return "/ai_bg.mp4";
    if (intent === 'game') return "/game_bg.mp4";
    if (intent === 'web_search') return "/websearch.mp4";
    if (intent === 'internal_search') return "/racoonask.mp4";
    if (intent === 'lives') return "/brolives.mp4";
    return getVideoForLocation(scope); 
  };
  
  // --- FUNCIÓN GPS ---
  const handleGPS = () => {
    if (!("geolocation" in navigator)) {
        alert("⚠️ Tu dispositivo no soporta geolocalización.");
        return;
    }
    alert("🛰️ CONECTANDO CON SATÉLITES... (Permite el acceso)");
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                
                const city = data.address.city || data.address.town || data.address.village || data.address.municipality;
                const country = data.address.country;

                if (city) {
                    setScope({ city, country });
                    setTeleportCoords({ city, country });
                    setStep(1); 
                    setActiveSearch(null);
                    alert(`📍 UBICACIÓN CONFIRMADA: ${city.toUpperCase()}, ${country.toUpperCase()}`);
                } else {
                    alert("⚠️ Coordenadas recibidas pero zona desconocida. Activando modo Global.");
                    setScope('gps'); 
                    setStep(1);
                }
            } catch (error) {
                console.error("Error GPS:", error);
                alert("⚠️ Error al triangula la posición. Introduce la ciudad manualmente.");
            }
        },
        (error) => {
            console.error("GPS Denied:", error);
            alert("🚫 Acceso GPS denegado. Usa el teletransporte manual.");
        }
    );
  };
  
  // --- FUNCIÓN TELETRANSPORTE MANUAL ---
  const handleTeleportConfirm = () => {
    if (teleportCoords.city || teleportCoords.country) {
      setScope(teleportCoords); 
      setIsTeleporting(false); 
      setStep(1); 
      setActiveSearch(null);
    } else { 
      alert("⚠️ Introduce al menos País o Localidad para saltar."); 
    }
  };
  
  const handleSearchConfirm = useCallback(() => {
    if (intent === 'ai') { alert("🤖 [IA]: Procesando..."); return; }
    if (intent === 'game') return;
    if (searchQuery.trim() !== "") { setActiveSearch(searchQuery); setStep(2); }
  }, [searchQuery, intent]);

  const resetApp = useCallback(() => {
    setStep(0); setIntent('product'); setScope(null); setSearchQuery(""); setActiveSearch(null); setIsTeleporting(false);
  }, []);

  const handleConfirmPayment = (coinKey, amount) => {
    setBalances(prev => ({ ...prev, [coinKey]: prev[coinKey] - amount }));
    setSelectedCard(null); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 4000);
  };

  const handleVideoEnd = (amt) => { setShowStory(false); handleGameWin(amt); };
  
  const handleGameWin = async (amt) => {
    setBalances(prev => ({ ...prev, genesis: (prev.genesis || 0) + amt }));
    setShowSuccess(true); 
    setTimeout(() => setShowSuccess(false), 3000);
    if (session?.user) {
      try {
        const { data } = await supabase.from('profiles').select('genesis').eq('id', session.user.id).single();
        if (data) {
            await supabase.from('profiles').update({ genesis: (data.genesis || 0) + amt }).eq('id', session.user.id);
        }
      } catch (e) { console.error("Error guardando puntos:", e); }
    }
  };

  // --- LÓGICA DE FUSIÓN DE DATOS (REAL + STATIC) ---
  const [realItems, setRealItems] = useState([]);

  useEffect(() => {
    const fetchMarket = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or('product_title.neq.null,service_title.neq.null');

      if (data) {
        const formatted = data.map(u => {
          const colorMap = {
             cyan: 'border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)] text-cyan-400',
             fuchsia: 'border-fuchsia-500 shadow-[0_0_20px_rgba(232,121,249,0.4)] text-fuchsia-400',
             yellow: 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] text-yellow-400',
             green: 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] text-green-400',
             red: 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-red-500'
          };
          const baseColor = u.card_color || 'cyan';
          const neonStyle = colorMap[baseColor];

          const items = [];

          if (u.product_title) {
            items.push({
              id: `${u.id}_prod`,
              type: ['product', 'shop'],
              name: u.product_title,
              shopName: u.alias,
              // PRIORIDAD: Imagen Producto -> Banner -> Avatar
              img: u.product_img || u.banner_url || u.avatar_url,
              message: u.twit_message,
              distance: u.city || 'Online',
              category: 'Shop',
              price: u.product_price,
              url: u.product_url, 
              neonColor: `text-${baseColor}-400`,
              style: `bg-black/90 border ${neonStyle}`,
              isReal: true
            });
          }

          if (u.service_title) {
            items.push({
              id: `${u.id}_serv`,
              type: ['service', 'shop'],
              name: u.service_title,
              shopName: u.alias,
              // PRIORIDAD: Imagen Servicio -> Banner -> Avatar
              img: u.service_img || u.banner_url || u.avatar_url,
              message: u.twit_message,
              distance: u.city || 'Online',
              category: 'Service',
              price: u.service_price,
              url: u.service_url,
              neonColor: `text-${baseColor}-400`,
              style: `bg-black/90 border ${neonStyle}`,
              isReal: true
            });
          }
          return items;
        }).flat();

        setRealItems(formatted);
      }
    };
    fetchMarket();
  }, [step]);

  const filteredItems = useMemo(() => {
    const ALL_ITEMS = [...realItems, ...MASTER_DB]; 

    const parseDistance = (d) => {
      if (!d) return 999999;
      if (d === 'Online') return 0;
      return parseFloat(d.replace(',', '.').replace(/[^\d.]/g, '')) * (d.includes('km') ? 1000 : 1);
    };

    return ALL_ITEMS.filter(item => {
      if (intent === 'ai' || intent === 'game') return false;
      let typeMatch = false;
      const types = Array.isArray(item.type) ? item.type : [item.type];
      
      if (intent === 'product') typeMatch = types.includes('product') || types.includes('shop');
      else if (intent === 'service') typeMatch = types.includes('service');
      else if (intent === 'lives') typeMatch = types.includes('live'); 

      let searchMatch = true;
      if (activeSearch && activeSearch.trim() !== "") {
        const q = activeSearch.toLowerCase();
        searchMatch = (
            item.name?.toLowerCase().includes(q) || 
            item.shopName?.toLowerCase().includes(q) || 
            item.category?.toLowerCase().includes(q)
        );
      }
      return typeMatch && searchMatch;
    }).sort((a, b) => {
      if (scope === 'gps') return parseDistance(a.distance) - parseDistance(b.distance);
      if (a.isReal && !b.isReal) return -1;
      if (!a.isReal && b.isReal) return 1;
      return 0;
    });
  }, [intent, scope, activeSearch, realItems]);
  
  
  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); setStep(0); };

  if (!session) return <GenesisGate />;

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans selection:bg-fuchsia-500 selection:text-white">
      
      {/* CAPA 1: FONDO */}
      <div className="absolute inset-0 z-0">
        {step === 0 ? (
          <div className="w-full h-full relative">
            <video src="/portada.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        ) : (
          <video 
            key={`vid-${intent}-${JSON.stringify(scope)}`} 
            src={getCurrentVideo()} 
            autoPlay loop muted playsInline 
            className="w-full h-full object-cover animate-fadeIn transition-opacity duration-1000" 
          />
        )}
      </div>
                  
      {/* CAPA 2: WIDGETS GLOBALES */}
      
      {/* 1. BRO-TUNER */}
      <BroTuner />

     {/* 2. HOLO-PRISMA */}
      {(step === 1 || selectedCard || previewCard) && (
        <div className="
            fixed top-2 left-[35%] -translate-x-1/2 z-[50000] scale-[0.45] origin-center pointer-events-none
            md:absolute md:top-32 md:right-10 md:left-auto md:translate-x-0 md:scale-100 md:origin-center
        ">
            <HoloPrism customImages={
                (selectedCard || previewCard) 
                ? prismImages 
                : (playingCreator 
                    ? [ 
                        playingCreator.holo_1 || playingCreator.img,
                        playingCreator.holo_2 || playingCreator.img,
                        playingCreator.holo_3 || playingCreator.img,
                        playingCreator.holo_4 || playingCreator.img
                      ] 
                    : null)
            } />
        </div>
      )}
                 
      {/* 3. BRO-LIVES */}
      {step > 0 && (
        <BroLives 
            playingCreator={playingCreator}
            isAudioPlaying={isAudioPlaying}
            onToggleAudio={(creator) => handleTuneIn(creator)}
        />
      )}

      {/* 4. WALLET */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:top-8 md:left-8 md:translate-x-0 z-[60]">
        <WalletWidget balances={balances} activePhase={moonPhase} onClick={() => setShowWalletModal(true)} />
      </div>

     {/* 5. BRO-STORIES */}
    <div className="absolute top-4 left-4 md:top-72 md:left-8 z-[60] animate-pulse scale-75 md:scale-100 origin-top-left">
        <button onClick={() => setShowStory(true)} className="flex items-center gap-2 bg-gradient-to-r from-violet-900/80 to-fuchsia-900/80 backdrop-blur-md border border-fuchsia-500/50 px-4 py-2 rounded-2xl shadow-lg">
            <div className="text-2xl relative">❄️</div>
            <div className="hidden md:block text-left">
                <p className="text-[7px] text-fuchsia-300 font-bold uppercase">Nueva Temporada</p>
                <p className="text-xs font-black italic">BRO-STORIES</p>
            </div>
        </button>
    </div>
            
      {/* 6. USUARIO + BOOSTER */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[60] flex flex-col items-end gap-2 pointer-events-auto scale-90 md:scale-100 origin-top-right">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full shadow-lg group hover:border-cyan-500 transition-colors">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_lime]"></div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{session?.user?.user_metadata?.alias || "CITIZEN"}</span>
            <div className="w-[1px] h-3 bg-white/20"></div>
            <button onClick={handleLogout} className="text-[10px] font-bold text-red-500 hover:text-red-300 uppercase tracking-widest hover:underline">[ EXIT ]</button>
        </div>
        {step === 0 && !isTeleporting && (
            <button onClick={() => setShowBooster(true)} className="text-[9px] text-orange-500/80 hover:text-orange-400 font-mono border border-transparent hover:border-orange-500/50 px-2 py-1 rounded uppercase tracking-widest transition-all">
                [ ACCESS BOOSTER STUDIO ]
            </button>
        )}
      </div>

      <MascotGuide step={step} intent={intent} isSearching={!!activeSearch} hasModal={!!selectedCard || showWalletModal || showStory || !!previewCard} hoverHelp={hoverHelp} />

      {/* CAPA 3: CONTENIDO PRINCIPAL */}

      {step === 0 && (
        <div className="relative z-20 h-full w-full animate-fadeIn flex flex-col items-center justify-center pointer-events-auto">
            {!isTeleporting && !showBooster && (
                <>
                <div className="absolute top-[15%] w-full text-center px-4">
                    <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">BRO7VISION</h1>
                    <p className="text-xs md:text-xl text-white font-bold tracking-[0.5em] shadow-black drop-shadow-lg uppercase">Explora tu realidad</p>
                </div>
                <div className="flex flex-col gap-4 w-full max-w-sm px-4 mt-64 md:mt-96"> 
                   <button onClick={handleGPS} className="group w-full py-4 md:py-6 bg-black/60 backdrop-blur-md border border-cyan-400 rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] flex items-center justify-between px-6 md:px-8">
                        <div className="text-left"><p className="text-[10px] md:text-xs text-cyan-400 font-bold uppercase tracking-widest mb-1">MODO LOCAL</p><span className="font-black text-white text-lg md:text-xl tracking-tight">📍 SINTONIZAR GPS</span></div><span className="text-xl md:text-2xl">→</span>
                   </button>
                   <button onClick={() => setIsTeleporting(true)} className="group w-full py-4 md:py-6 bg-black/60 backdrop-blur-md border border-fuchsia-500 rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(232,121,249,0.2)] flex items-center justify-between px-6 md:px-8">
                        <div className="text-left"><p className="text-[10px] md:text-xs text-fuchsia-500 font-bold uppercase tracking-widest mb-1">MODO EXPLORADOR</p><span className="font-black text-white text-lg md:text-xl tracking-tight">🌀 TELETRANSPORTE</span></div><span className="text-xl md:text-2xl">→</span>
                   </button>
                </div>
                </>
            )}
            {isTeleporting && (
                <div className="w-full max-w-lg bg-black/90 border border-fuchsia-500 rounded-xl p-8 animate-zoomIn mt-10 mx-4">
                    <p className="text-fuchsia-400 mb-4 font-mono text-center">> SET TARGET COORDINATES</p>
                    <input type="text" placeholder="Escribe Ciudad o País..." className="w-full bg-black border border-white/20 text-white px-4 py-3 text-lg focus:border-fuchsia-500 outline-none text-center uppercase font-bold tracking-wider" autoFocus onChange={(e) => setTeleportCoords({ city: e.target.value, country: '' })} onKeyDown={(e) => e.key === 'Enter' && handleTeleportConfirm()} />
                    <div className="flex justify-between mt-8">
                        <button onClick={() => setIsTeleporting(false)} className="text-gray-500 hover:text-white transition-colors">ABORT</button>
                        <button onClick={handleTeleportConfirm} className="bg-fuchsia-600 hover:bg-fuchsia-500 px-8 py-2 text-white font-bold tracking-widest shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all">JUMP</button>
                    </div>
                </div>
            )}
            {showBooster && <BoosterModal onClose={() => setShowBooster(false)} />}
        </div>
     )}

    {/* STEP 1: NEXUS DASHBOARD */}
     {step === 1 && (
        <NexusDashboard 
            onSearch={handleSearchConfirm} searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
            intent={intent} setIntent={setIntent} 
            onBack={resetApp} 
            onGameWin={handleGameWin} 
            onOpenLog={handleOpenIdentity}
            onTuneIn={handleTuneIn}
            onSelectShop={handlePreviewCard}
            onUserClick={setSelectedIdentity}
        />
     )}
                              
     {step === 2 && (
        <div className="absolute inset-0 z-50">
            <PaginatedDisplay 
                items={filteredItems} 
                onSelect={handlePreviewCard} 
                intent={intent} 
                onTuneIn={handleTuneIn} 
            />     
        </div> 
     )}    
     
    {/* MODALES */}
     {selectedIdentity && <IdentityTerminal user={selectedIdentity} onClose={() => setSelectedIdentity(null)} onOpenLog={(log) => { setSelectedIdentity(null); setSelectedLog(log); }} />}
     {selectedLog && <BroLogViewer log={selectedLog} onClose={() => setSelectedLog(null)} />}
     <PaymentModal isOpen={!!selectedCard} onClose={() => setSelectedCard(null)} product={selectedCard} balances={balances} currentPhase={moonPhase} onConfirmPayment={handleConfirmPayment} />
     {showWalletModal && <ConversionModal balances={balances} activePhase={moonPhase} onClose={() => setShowWalletModal(false)} />}
     {showStory && <StoryPlayer src="/brostories_demo.mp4" activePhase={moonPhase} onClose={() => setShowStory(false)} onComplete={handleVideoEnd} />}
     
    {/* --- BOTÓN VOLVER --- */}
     {step === 2 && (
        <div className="fixed bottom-4 right-4 md:top-1/2 md:left-8 z-[99999] pointer-events-auto filter drop-shadow-2xl scale-75 md:scale-100 origin-bottom-right md:origin-center">
            <button onClick={() => setStep(1)} className="group flex items-center gap-3 bg-yellow-500 hover:bg-white text-black px-6 py-3 rounded-full font-black uppercase tracking-[0.2em] text-xs border-4 border-black shadow-[0_0_0_4px_#fbbf24]">
                <span className="text-xl leading-none">🔙</span>
                <span>VOLVER</span>
            </button>
        </div>
     )} 

     {/* --- SECCIÓN LEGAL --- */}
     
     {/* 1. MODAL GRANDE */}
     {showLegal && <LegalTerminal onClose={() => setShowLegal(false)} />}

     {/* 2. BARRA DE COOKIES */}
     <LegalBar onOpenLegal={() => setShowLegal(true)} />

     {/* 3. BOTÓN DISCRETO (CENTRO ABAJO) */}
     {/* left-1/2 y -translate-x-1/2 lo centran matemáticamente. bottom-1 lo pega al suelo */}
     <div className="fixed bottom-1 left-1/2 -translate-x-1/2 z-[55] opacity-50 hover:opacity-100 transition-opacity pointer-events-auto">
          <button 
              onClick={() => setShowLegal(true)}
              className="text-[9px] text-gray-500 font-mono border border-white/10 px-3 py-1 rounded-t-lg bg-black/90 backdrop-blur hover:bg-white hover:text-black transition-colors"
          >
              ⚖️ LEGAL / CONTACTO
          </button>
     </div>
     
    </div> 
  )
}

export default App;