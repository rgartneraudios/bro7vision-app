// src/App.jsx (VERSIÓN FINAL ESTABLE: GPS CLEAN + TELEPORT FIX)

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';
import GenesisGate from './components/GenesisGate';
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
import HoloProjector from './components/HoloProjector';
import HoloArcade from './components/HoloArcade';
import WebBotTerminal from './components/WebBotTerminal'; // Importar el componente WebBotTerminal


function App() {
  // --- 1. SEGURIDAD ---
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // --- ESTADOS GLOBALES ---
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState('broshop');
  const [scope, setScope] = useState(null);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [teleportCoords, setTeleportCoords] = useState({ city: '', country: '' });
  const [balances, setBalances] = useState({ genesis: 0, nova: 0, crescens: 0, plena: 0, decrescens: 0 });
  const [moonPhase, setMoonPhase] = useState('plena');
  const [showWalletModal, setShowWalletModal] = useState(false);

  
  // ESTADO LEGAL
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
  const [projectingUser, setProjectingUser] = useState(null);
  
  // AUDIO STATE
  const [playingCreator, setPlayingCreator] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(new Audio());
  const [activeGame, setActiveGame] = useState(null); // Estado para el HoloArcade
  
  

  const fetchBalances = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase.from('profiles').select('genesis, nova, crescens, plena, decrescens').eq('id', session.user.id).single();
      if (data) setBalances({ ...data });
    } catch (error) { console.error("Error saldo:", error); }
  };
  
  const getPlayableUrl = (url) => {
    if (!url) return "";
    let clean = url.trim(); // 1. Quitar espacios en blanco al principio/final

    if (clean.startsWith('/')) return clean; // Archivos locales

    // --- FIX DROPBOX UNIVERSAL ---
    if (clean.includes('dropbox.com')) {
      // Reemplazar dominio para forzar descarga directa
      clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      clean = clean.replace('dropbox.com', 'dl.dropboxusercontent.com'); // Por si no tiene www

      // TRUCO: Si el link tiene 'rlkey' (links privados nuevos), NO quitamos los parámetros
      if (clean.includes('rlkey')) {
          // Solo aseguramos que use dl.dropboxusercontent.com y mantenemos el resto
          return clean; 
      }
      
      // Si es un link público normal, quitamos parámetros basura
      return clean.split('?')[0];
    }
    
    return clean;
  };  
  useEffect(() => {
    if (playingCreator && playingCreator.audioFile) {
      const rawUrl = playingCreator.audioFile;
      const finalUrl = getPlayableUrl(rawUrl); // <--- Usa la función mejorada

      if (!audioRef.current.src.includes(finalUrl)) {
        console.log("Reproduciendo Audio:", finalUrl); // <--- MIRA LA CONSOLA (F12) PARA VER SI EL LINK ES CORRECTO
        audioRef.current.src = finalUrl;
        audioRef.current.load();
      if (isAudioPlaying) audioRef.current.play().catch(e => console.error(e));
      } else {
        if (isAudioPlaying) audioRef.current.play().catch(e => console.error(e));
        else audioRef.current.pause();
      }
    } else {
      audioRef.current.pause();
    }
  }, [playingCreator, isAudioPlaying]);

  useEffect(() => { if (session) fetchBalances(); }, [session]);

  const handleTuneIn = (creator) => {
    // Si el usuario NO tiene holo_1, usa la imagen principal (img).
    // Si tampoco tiene img, usa la local ("/images/prism_1.jpg").
    const img1 = creator.holo_1 || creator.img || "/images/prism_1.jpg";
    const img2 = creator.holo_2 || creator.img || "/images/prism_2.jpg";
    const img3 = creator.holo_3 || creator.img || "/images/prism_3.jpg";
    const img4 = creator.holo_4 || creator.img || "/images/prism_4.jpg";
    
    setPrismImages([img1, img2, img3, img4]);

    if (playingCreator?.id === creator.id) setIsAudioPlaying(!isAudioPlaying);
    else { setPlayingCreator(creator); setIsAudioPlaying(true); }
  };
        
  const handleOpenVideo = (creator) => {
      const img1 = creator.holo_1 || creator.img || "/images/prism_1.jpg";
      const img2 = creator.holo_2 || creator.img || "/images/prism_2.jpg";
      const img3 = creator.holo_3 || creator.img || "/images/prism_3.jpg";
      const img4 = creator.holo_4 || creator.img || "/images/prism_4.jpg";
      
      setPrismImages([img1, img2, img3, img4]);
      setProjectingUser(creator);
  };
          
    const handleCardSelect = (item) => {
    setSelectedCard(item);
    
    const img1 = item.holo_1 || item.img || "/images/prism_1.jpg";
    const img2 = item.holo_2 || item.img || "/images/prism_1.jpg";
    const img3 = item.holo_3 || item.img || "/images/prism_1.jpg";
    const img4 = item.holo_4 || item.img || "/images/prism_1.jpg";

    const prismImageArray = [img1, img2, img3, img4];
    console.log("HoloPrisma recibiendo (CardSelect):", prismImageArray); // <--- AÑADE ESTO
    setPrismImages(prismImageArray);
  };
      
  const handlePreviewCard = (item) => handleCardSelect(item);
  const handleOpenIdentity = (data) => { if (data && (data.title || data.category)) setSelectedLog(data); else setSelectedIdentity(data); };

  const getCurrentVideo = () => {
    if (intent === 'ai') return "/ai_bg.mp4";
    if (intent === 'game') return "/game_bg.mp4";
    if (intent === 'web_search') return "/websearch.mp4";
    if (intent === 'internal_search') return "/racoonask.mp4";
    if (intent === 'lives') return "/brolives.mp4";
    return getVideoForLocation(scope); 
  };
  
  // --- GPS CLÁSICO (EL QUE TE GUSTABA) ---
  const handleGPS = () => {
    if (!("geolocation" in navigator)) { alert("Tu dispositivo no soporta GPS."); return; }
    
    // Feedback visual simple
    alert("🛰️ Sintonizando satélites...");

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
                    // Sin alert extra, transición suave
                } else {
                    alert("⚠️ Zona desconocida. Activando modo Global.");
                    setScope('gps'); 
                    setStep(1);
                }
            } catch (error) {
                console.error("Error GPS:", error);
                setScope('gps'); // Fallback silencioso a global
                setStep(1);
            }
        },
        (error) => {
            console.error("GPS Denied:", error);
            alert("🚫 GPS denegado. Usa el teletransporte.");
        }
    );
  };
  
  // --- TELETRANSPORTE (FIXED) ---
  const handleTeleportConfirm = () => {
    if (teleportCoords.city || teleportCoords.country) {
      setScope(teleportCoords); 
      setIsTeleporting(false); 
      setStep(1); 
      setActiveSearch(null);
    } else { 
      alert("⚠️ Escribe una ciudad para saltar."); 
    }
  };
  
  const handleSearchConfirm = useCallback(() => {
    if (intent === 'ai' || intent === 'game') return;
    if (searchQuery.trim() !== "") { setActiveSearch(searchQuery); }
  }, [searchQuery, intent]);

  const resetApp = useCallback(() => {
    setStep(0); setIntent('product'); setScope(null); setSearchQuery(""); setActiveSearch(null); setIsTeleporting(false);
  }, []);

  const handleSelectAsset = (asset) => {
    const cardData = {
        id: asset.id,
        name: asset.title,
        price: `${asset.price_fiat}€`,
        img: "https://placehold.co/400x400/000000/00FFFF/png?text=DATA+ACTIVO", // Imagen genérica
        shopName: asset.profiles?.alias,
        url: asset.url, // Este es el link a la nube
        isAsset: true,
        assetType: asset.asset_type
    };
    setSelectedCard(cardData);
  };

  const handleConfirmPayment = (coinKey, amount, product) => {
    // Descontar saldo
    setBalances(prev => ({ ...prev, [coinKey]: (prev[coinKey] || 0) - amount }));

    // Si NO es un activo (es un producto físico/servicio normal), cerramos el modal
    if (!product.isAsset) {
        setSelectedCard(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
    }
    // Si ES un activo, NO hacemos nada más aquí. 
    // Dejamos que el PaymentModal muestre su pantalla de "Éxito" propia.
};

// 2. Nueva función para el lanzamiento REAL
const handleLaunchAsset = (product) => {
    if (product.assetType === 'game') {
        setActiveGame({ url: product.url, title: product.name });
    } else if (product.assetType === 'video') {
        setProjectingUser({ 
            alias: product.shopName, 
            video_file: product.url,
            isAsset: true 
        });
    }
    // Cerramos el modal de pago al lanzar
    setSelectedCard(null);
};

  const handleVideoEnd = (amt) => { setShowStory(false); handleGameWin(amt); };
  
  const handleGameWin = async (amt) => {
    setBalances(prev => ({ ...prev, genesis: (prev.genesis || 0) + amt }));
    setShowSuccess(true); 
    setTimeout(() => setShowSuccess(false), 3000);
    if (session?.user) {
        await supabase.from('profiles').update({ genesis: (balances.genesis || 0) + amt }).eq('id', session.user.id);
    }
  };

  // --- LÓGICA DE FUSIÓN DE DATOS (PRODUCTOS vs SERVICIOS) ---
  const [realItems, setRealItems] = useState([]);

   useEffect(() => {
    const fetchMarket = async () => {
      // 1. Pedimos todos los datos a la tabla profiles
      const { data } = await supabase.from('profiles').select('*');

      if (data) {
        const unifiedCards = data.map(u => {
          // FILTRO: Si el usuario no tiene ni producto ni servicio, no creamos tarjeta
          if (!u.product_title && !u.service_title) return null;

          return {
            id: u.id,
            shopName: u.alias || 'Usuario',
            name: u.product_title || u.service_title || 'Sin Título', // Título principal
            message: u.twit_message || 'Emitiendo señal...',
            
            // --- GESTIÓN DE IMÁGENES (EL CABLEADO) ---
            // El fondo de la tarjeta (Banner)
            img: u.card_banner_url || u.banner_url || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop', 
            
            // La cara del usuario (Avatar circular)
            avatar_url: u.avatar_url || 'https://placehold.co/200x200/000000/FFFFFF/png?text=BRO',
            
            distance: u.city || 'Online',
            neonColor: u.card_color || 'cyan-void',
            
            // --- FLAGS PARA INDICADORES Y PAYMENT MODAL ---
            hasProduct: !!u.product_title,
            productData: { 
                name: u.product_title, 
                price: u.product_price, 
                url: u.product_url,
                desc: u.product_desc 
            },
            
            hasService: !!u.service_title,
            serviceData: { 
                name: u.service_title, 
                price: u.service_price, 
                url: u.service_url,
                desc: u.service_desc 
            },
            
            // --- DATOS MULTIMEDIA Y HOLOPRISMA ---
            holo_1: u.holo_1, 
            holo_2: u.holo_2, 
            holo_3: u.holo_3, 
            holo_4: u.holo_4,
            video_file: u.video_file, 
            audioFile: u.audio_file,
            
            // Categoría técnica para el filtro
            type: ['shop'] 
          };
        }).filter(Boolean); // Borra los que devolvieron "null" (los que no venden nada)

        setRealItems(unifiedCards);
      }
    };
    fetchMarket();
  }, [step]); // Se actualiza cuando cambias de fase o entras al Nexus      
    // --- FILTRO Y ORDENAMIENTO (SAFE TELEPORT) ---
    const filteredItems = useMemo(() => {
    const ALL_ITEMS = [...realItems, ...MASTER_DB]; 

    return ALL_ITEMS.filter(item => {
      // Si estamos en modo IA o Games, no mostramos tarjetas de tienda
      if (intent === 'ai' || intent === 'game' || intent === 'web_search') return false;
      
      let typeMatch = false;
      const types = Array.isArray(item.type) ? item.type : [item.type];
      
      // LOGICA UNIFICADA: Si el intent es broshop, mostramos productos Y servicios
      if (intent === 'broshop') {
          typeMatch = types.includes('product') || types.includes('service') || types.includes('shop');
      } 
      else if (intent === 'lives') {
          typeMatch = types.includes('live');
      }

      // Filtro de búsqueda por texto
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
      // ... (mismo ordenamiento por GPS que ya tenías)
      return 0;
    });
}, [intent, scope, activeSearch, realItems]);  
  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); setStep(0); };

  if (!session) return <GenesisGate />;

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans selection:bg-fuchsia-500 selection:text-white">
      {/* CAPA 1: FONDO (SIN FILTER) */}
      <div className="absolute inset-0 z-0">
        {step === 0 ? (
          <div className="w-full h-full relative">
            <video src="/portada.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
          </div>
        ) : (
          <video key={`vid-${intent}-${JSON.stringify(scope)}`} src={getCurrentVideo()} autoPlay loop muted playsInline className="w-full h-full object-cover animate-fadeIn transition-opacity duration-1000" />
        )}
      </div>
                  
      {/* A. WALLET (Esquina superior izquierda) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:top-8 md:left-8 md:translate-x-0 z-[60]">
        <WalletWidget balances={balances} activePhase={moonPhase} onClick={() => setShowWalletModal(true)} />
      </div>

      {/* B. BRO-STORIES (Debajo del Wallet) */}
      <div className="absolute top-4 left-4 md:top-40 md:left-8 z-[60] animate-pulse scale-75 md:scale-100 origin-top-left">
        <button onClick={() => setShowStory(true)} className="flex items-center gap-2 bg-gradient-to-r from-violet-900/80 to-fuchsia-900/80 backdrop-blur-md border border-fuchsia-500/50 px-4 py-2 rounded-2xl shadow-lg">
            <div className="text-2xl relative">❄️</div>
            <div className="hidden md:block text-left">
                <p className="text-[7px] text-fuchsia-300 font-bold uppercase">Nueva Temporada</p>
                <p className="text-xs font-black italic">BRO-STORIES</p>
            </div>
        </button>
      </div>

      {/* C. BROLIVES (REPRODUCTOR: Bajado al centro y más hacia adentro) */}
      {step > 0 && (
        <div className="fixed left-14 top-[28%] -translate-y-1/2 z-[60] transform transition-all duration-500">
            <BroLives 
                playingCreator={playingCreator} 
                isAudioPlaying={isAudioPlaying} 
                onToggleAudio={(creator) => handleTuneIn(creator)} 
            />
        </div>
      )}

      {/* 1. BRO-TUNER (Abajo a la izquierda) */}
      <BroTuner />
      
                {/* 2. HOLOPRISMA (Lado derecho, centrado para equilibrar) */}
      {(step === 1 || selectedCard || previewCard) && (
        <div className="fixed top-48 -translate-y-1/2 right-12 z-[50000] scale-[0.45] md:scale-100 pointer-events-none transform">
            <HoloPrism customImages={prismImages} />
        </div>
      )}
         
      {/* USUARIO + BOOSTER */}
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

      <MascotGuide 
    step={step} 
    intent={intent} 
    isSearching={searchQuery.length > 0} 
    hasModal={!!selectedCard} 
/>

      {/* CAPA 3: CONTENIDO */}
      {step === 0 && (
        <div className="relative z-20 h-full w-full animate-fadeIn flex flex-col items-center justify-center pointer-events-auto">
            {!isTeleporting && !showBooster && (
                <>
                <div className="absolute top-[5%] w-full text-center px-4">
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

    {/* STEP 1: NEXUS DASHBOARD (CON CARDS INTEGRADAS) */}
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
            items={filteredItems}
           onOpenVideo={handleOpenVideo}
        />
     )}
          
    {/* MODALES GLOBALES (ACTIVABLES DESDE CUALQUIER LUGAR) */}
     {selectedIdentity && <IdentityTerminal user={selectedIdentity} onClose={() => setSelectedIdentity(null)} onOpenLog={(log) => { setSelectedIdentity(null); setSelectedLog(log); }} />}
     {selectedLog && <BroLogViewer log={selectedLog} onClose={() => setSelectedLog(null)} />}
     {/* PaymentModal ahora es gestionado internamente */}
     {selectedCard && <PaymentModal isOpen={!!selectedCard} onClose={() => setSelectedCard(null)} product={selectedCard} balances={balances} currentPhase={moonPhase} onConfirmPayment={handleConfirmPayment} onLaunch={handleLaunchAsset} />}
     {showWalletModal && <ConversionModal balances={balances} activePhase={moonPhase} onClose={() => setShowWalletModal(false)} />}
     {showStory && <StoryPlayer src="/brostories_demo.mp4" activePhase={moonPhase} onClose={() => setShowStory(false)} onComplete={handleVideoEnd} />}
     
     {/* WebBotTerminal se activa cuando intent es 'web_search' */}
     {intent === 'web_search' && step === 1 && (
        <WebBotTerminal onClose={() => setIntent('product')} onSelectAsset={handleSelectAsset} />
     )}

     {/* HoloArcade se activa con activeGame */}
     {activeGame && (
         <HoloArcade 
            gameUrl={activeGame.url} 
            title={activeGame.title} 
            onClose={() => setActiveGame(null)} 
         />
     )}

     {/* HoloProjector se activa con projectingUser */}
     {projectingUser && (
         <HoloProjector 
            videoUrl={projectingUser.video_file} 
            user={projectingUser} 
            onClose={() => setProjectingUser(null)} 
         />
     )}


     {/* LEGAL BAR & TERMINAL */}
     <LegalBar onOpenLegal={() => setShowLegal(true)} />
     {showLegal && <LegalTerminal onClose={() => setShowLegal(false)} />}
     
     <div className="fixed bottom-1 left-1/2 -translate-x-1/2 z-[55] opacity-50 hover:opacity-100 transition-opacity pointer-events-auto">
          <button onClick={() => setShowLegal(true)} className="text-[9px] text-gray-500 font-mono border border-white/10 px-3 py-1 rounded-t-lg bg-black/90 backdrop-blur hover:bg-white hover:text-black transition-colors">⚖️ LEGAL / CONTACTO</button>
     </div>

    </div> 
  );
}

export default App;