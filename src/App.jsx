// src/App.jsx (VERSIÓN MASTER FINAL)

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
import LegalBar from './components/LegalBar'; // <--- 1. IMPORTAR
// import SequentialBackground from './components/SequentialBackground';


function App() {
  // --- 1. LÓGICA DE SEGURIDAD (SUPABASE) ---
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState('product');
  const [scope, setScope] = useState(null);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [teleportCoords, setTeleportCoords] = useState({ city: '', country: '' });
  const [balances, setBalances] = useState({ genesis: 0, nova: 0, crescens: 0, plena: 0, decrescens: 0 });
  const [moonPhase, setMoonPhase] = useState('plena');
  const [showWalletModal, setShowWalletModal] = useState(false);

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
    
    // LÓGICA DEL PRISMA (4 CARAS):
    // Si tiene holo_1, úsalo. Si no, usa el Banner (img) o Avatar.
    const defaultImg = item.img || item.image || "/images/prism_1.jpg";

    setPrismImages([
        item.holo_1 || defaultImg,
        item.holo_2 || defaultImg,
        item.holo_3 || defaultImg,
        item.holo_4 || defaultImg
    ]);
  };

  // 2. EL ARREGLO DEL ERROR (Alias)
  // Definimos handlePreviewCard para que haga lo mismo que handleCardSelect
  const handlePreviewCard = (item) => handleCardSelect(item);
     
  const handleOpenIdentity = (data) => {
    if (data && (data.title || data.category)) setSelectedLog(data);
    else setSelectedIdentity(data);
  };

  const getCurrentVideo = () => {
    if (intent === 'ai') return "/ai_bg.mp4"; // Archivo único 720p
    if (intent === 'game') return "/game_bg.mp4";
    if (intent === 'web_search') return "/websearch.mp4";
    if (intent === 'internal_search') return "/racoonask.mp4";
    if (intent === 'lives') return "/brolives.mp4"; // Archivo único 720p
    
    // Para modo producto/servicio (Ciudad)
    // Asegúrate de que getVideoForLocation devuelva "/ciudad.mp4" 
    // o el nombre que le hayas puesto al video unido.
    return getVideoForLocation(scope); 
  };
  
 // --- FUNCIÓN GPS MEJORADA ---
  const handleGPS = () => {
    // 1. Pedir permiso al navegador
    if (!("geolocation" in navigator)) {
        alert("⚠️ Tu dispositivo no soporta geolocalización.");
        return;
    }

    // Feedback visual
    alert("🛰️ CONECTANDO CON SATÉLITES... (Permite el acceso)");

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                // 2. Traducir coordenadas a Ciudad (Reverse Geocoding GRATIS)
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                
                // Extraemos la ciudad o pueblo
                const city = data.address.city || data.address.town || data.address.village || data.address.municipality;
                const country = data.address.country;

                if (city) {
                    // 3. Fijar el Scope y entrar
                    setScope({ city, country });
                    setTeleportCoords({ city, country }); // Para que se vea en el input si quieres
                    setStep(1); 
                    setActiveSearch(null);
                    
                    // Aviso de éxito
                    alert(`📍 UBICACIÓN CONFIRMADA: ${city.toUpperCase()}, ${country.toUpperCase()}`);
                } else {
                    alert("⚠️ Coordenadas recibidas pero zona desconocida. Activando modo Global.");
                    setScope('gps'); // Fallback
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
  
  // --- FUNCIÓN DE TELETRANSPORTE MANUAL (LA QUE FALTABA) ---
  const handleTeleportConfirm = () => {
    if (teleportCoords.city || teleportCoords.country) {
      // 1. Guardamos la ubicación escrita
      setScope(teleportCoords); 
      // 2. Apagamos el modo de input
      setIsTeleporting(false); 
      // 3. Entramos al Dashboard
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
    // 1. Visual
    setBalances(prev => ({ ...prev, genesis: (prev.genesis || 0) + amt }));
    setShowSuccess(true); 
    setTimeout(() => setShowSuccess(false), 3000);
    
    // 2. Base de Datos (PARA TODOS, INCLUIDO TÚ)
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
      // Traemos perfiles que tengan título de producto O servicio
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or('product_title.neq.null,service_title.neq.null');

      if (data) {
        const formatted = data.map(u => {
          // Determinar estilo NEÓN según el color elegido en Booster
          const colorMap = {
             cyan: 'border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)] text-cyan-400',
             fuchsia: 'border-fuchsia-500 shadow-[0_0_20px_rgba(232,121,249,0.4)] text-fuchsia-400',
             yellow: 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] text-yellow-400',
             green: 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] text-green-400',
             red: 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-red-500'
          };
          const baseColor = u.card_color || 'cyan';
          const neonStyle = colorMap[baseColor];

          // Crear items separados para Producto y Servicio si el usuario tiene ambos
          const items = [];

          if (u.product_title) {
            items.push({
              id: `${u.id}_prod`,
              type: ['product', 'shop'],
              name: u.product_title, // Lo que vende
              shopName: u.alias,     // Quién lo vende
              img: u.product_img || u.banner_url || u.avatar_url,
              message: u.twit_message,
              distance: u.city || 'Online',
              category: 'Shop',
              price: u.product_price,
              url: u.product_url,    // <--- LINK EXTERNO
              neonColor: `text-${baseColor}-400`,
              style: `bg-black/90 border ${neonStyle}`, // Estilo Neón generado
              isReal: true
            });
          }

          if (u.service_title) {
            items.push({
              id: `${u.id}_serv`,
              type: ['service', 'shop'],
              name: u.service_title,
              shopName: u.alias,
              img: u.service_img || u.banner_url || u.avatar_url,
              message: u.twit_message,
              distance: u.city || 'Online',
              category: 'Service',
              price: u.service_price,
              url: u.service_url,    // <--- LINK EXTERNO
              neonColor: `text-${baseColor}-400`,
              style: `bg-black/90 border ${neonStyle}`,
              isReal: true
            });
          }
          return items;
        }).flat(); // Aplanar el array

        setRealItems(formatted);
      }
    };
    fetchMarket();
  }, [step]); // Se recarga al cambiar de paso o al entrar

  // MODIFICAMOS EL FILTRO PARA INCLUIR LOS REALES
  const filteredItems = useMemo(() => {
    // Unimos la DB maestra con los reales
    const ALL_ITEMS = [...realItems, ...MASTER_DB]; 

    const parseDistance = (d) => {
      if (!d) return 999999;
      if (d === 'Online') return 0;
      return parseFloat(d.replace(',', '.').replace(/[^\d.]/g, '')) * (d.includes('km') ? 1000 : 1);
    };

    return ALL_ITEMS.filter(item => {
      if (intent === 'ai' || intent === 'game') return false;
      
      let typeMatch = false;
      // Ajuste para que 'product' lea shops y 'service' lea services
      const types = Array.isArray(item.type) ? item.type : [item.type];
      
      if (intent === 'product') typeMatch = types.includes('product') || types.includes('shop');
      else if (intent === 'service') typeMatch = types.includes('service');
      else if (intent === 'lives') typeMatch = types.includes('live'); // Si hubiese lógica aquí

      let searchMatch = true;
      if (activeSearch && activeSearch.trim() !== "") {
        const q = activeSearch.toLowerCase();
        // AÑADIDO: Búsqueda por shopName (Nombre User)
        searchMatch = (
            item.name?.toLowerCase().includes(q) || 
            item.shopName?.toLowerCase().includes(q) || 
            item.category?.toLowerCase().includes(q)
        );
      }
      return typeMatch && searchMatch;
    }).sort((a, b) => {
      if (scope === 'gps') return parseDistance(a.distance) - parseDistance(b.distance);
      // Priorizar los reales sobre los bots si quieres
      if (a.isReal && !b.isReal) return -1;
      if (!a.isReal && b.isReal) return 1;
      return 0;
    });
  }, [intent, scope, activeSearch, realItems]); // Añadido realItems a dependencias
  
  
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
          /* VIDEO ÚNICO DE ALTA CALIDAD (1080p) */
          <video 
            key={`vid-${intent}-${JSON.stringify(scope)}`} // El 'key' fuerza a React a recargar si cambia el modo
            src={getCurrentVideo()} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover animate-fadeIn transition-opacity duration-1000" 
          />
        )}
      </div>
                  
      {/* CAPA 2: WIDGETS GLOBALES */}
      
      {/* 1. BRO-TUNER (Abajo Izquierda) */}
      <BroTuner />

     {/* 2. HOLO-PRISMA */}
      {(step === 1 || selectedCard || previewCard) && (
        <div className="
            /* MÓVIL: Configuración que ya funciona (Top-2, Centrado-Izquierda) */
            fixed top-2 left-[35%] -translate-x-1/2 z-[50000] scale-[0.45] origin-center pointer-events-none
            
            /* PC: Ahora ABSOLUTO para control total. Bajado (top-32) y Derecha (right-10) */
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
                 
            {/* 3. BRO-LIVES (REPRODUCTOR FLOTANTE DERECHA) */}
      {step > 0 && (
        <BroLives 
            playingCreator={playingCreator}
            isAudioPlaying={isAudioPlaying}
            onToggleAudio={(creator) => handleTuneIn(creator)}
        />
      )}

      {/* 4. WALLET (Centro Abajo Móvil / Arriba Izquierda PC) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:top-8 md:left-8 md:translate-x-0 z-[60]">
        <WalletWidget balances={balances} activePhase={moonPhase} onClick={() => setShowWalletModal(true)} />
      </div>

     {/* 5. BRO-STORIES: ARRIBA IZQ (MÓVIL) / COLUMNA IZQ (PC) */}
    {/* CAMBIO: En PC baja a 'top-80' y mostramos el texto */}
    <div className="absolute top-4 left-4 md:top-72 md:left-8 z-[60] animate-pulse scale-75 md:scale-100 origin-top-left">
        <button onClick={() => setShowStory(true)} className="flex items-center gap-2 bg-gradient-to-r from-violet-900/80 to-fuchsia-900/80 backdrop-blur-md border border-fuchsia-500/50 px-4 py-2 rounded-2xl shadow-lg">
            <div className="text-2xl relative">❄️</div>
            {/* CAMBIO: 'hidden md:block' asegura que el texto se vea en PC */}
            <div className="hidden md:block text-left">
                <p className="text-[7px] text-fuchsia-300 font-bold uppercase">Nueva Temporada</p>
                <p className="text-xs font-black italic">BRO-STORIES</p>
            </div>
        </button>
    </div>
            
      {/* 6. USUARIO + BOOSTER (Arriba Derecha) */}
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

    {/* STEP 1: NEXUS DASHBOARD (LIMPIO, EL BOTÓN ZONA AHORA ESTÁ DENTRO) */}
     {step === 1 && (
        <NexusDashboard 
            onSearch={handleSearchConfirm} searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
            intent={intent} setIntent={setIntent} 
            onBack={resetApp} // Pasamos la función, el Nexus la usará en su botón interno
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
                activeBoosts={activeBoosts} 
                intent={intent} 
                userCoinType="nova" 
                currentPhase={moonPhase} 
                // AÑADIR ESTA LÍNEA PARA QUE EL BOTÓN FUNCIONE:
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
     
     {/* BOTÓN VOLVER (EMERGENCIA) */}
     {/* CAMBIO: En PC 'md:top-1/2' para que esté en el centro vertical (igual que Cambiar Zona) */}
     {step === 2 && (
        <div className="fixed bottom-4 right-4 md:top-1/2 md:left-8 z-[99999] pointer-events-auto filter drop-shadow-2xl scale-75 md:scale-100 origin-bottom-right md:origin-center">
            <button onClick={() => setStep(1)} className="group flex items-center gap-3 bg-yellow-500 hover:bg-white text-black px-6 py-3 rounded-full font-black uppercase tracking-[0.2em] text-xs border-4 border-black shadow-[0_0_0_4px_#fbbf24]">
                <span className="text-xl leading-none">🔙</span>
                <span>VOLVER</span>
            </button>
        </div>
     )} 
     
     <div className="relative w-full h-screen ...">
      
      {/* ... todo el contenido de la app ... */}

      {/* CAPA LEGAL (GDPR + CONTACTO) */}
      <LegalBar />  {/* <--- 2. PONER AQUÍ AL FINAL */}

    </div>
     
    </div>
  )
}
export default App;