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
import RacoonTerminal from './components/RacoonTerminal';
import RealityTuner from './components/RealityTuner';
import HoloPrism from './components/HoloPrism';

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
  const [selectedCard, setSelectedCard] = useState(null); // Para PaymentModal
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
  const [activeUser, setActiveUser] = useState(null); // Usuario del proyector
  const [isShopOpen, setIsShopOpen] = useState(false); // Estado de la tienda
  
  const [balances, setBalances] = useState({
  genesis: 493230,
  vales: {
    nova: 0,
    crescens: 0,
    plena: 0,
    decrescens: 0
  },
  eco: 200,    // Aquí tus Ecos
  halos: 50,   // Aquí tus Halos
  zap: 10      // Aquí tus Zaps
});

  // Paneles Laterales
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  
  // --- LÓGICA PARA REGISTRAR COINS DE JUEGOS ---
  const handleGameWin = async (amount) => {
  // 1. Calculamos el nuevo total basándonos en el balance actual
  const newTotal = balances.genesis + amount;

  // 2. Actualizamos el estado visual (lo que ves en pantalla)
  setBalances(prev => ({
    ...prev,
    genesis: newTotal
  }));

  // 3. ¡EL PASO CRUCIAL! Guardar en la base de datos 
  if (session?.user?.id) {
    const { error } = await supabase
      .from('profiles') // O el nombre de tu tabla de usuarios/balances
      .update({ genesis: newTotal })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error al sincronizar con la base de datos:', error);
    } else {
      console.log('Balance sincronizado permanentemente');
    }
  }
};
  // --- LÓGICA DE NAVEGACIÓN ---
  const handleNavigation = (targetIntent) => {
    console.log("Navegando a:", targetIntent); // <--- Mira si esto sale en la consola al hacer click
    setIntent(targetIntent);;
    setIsLeftOpen(false);
    setIsRightOpen(false);
    
    // Si el usuario clica específicamente en 'gps', forzamos el paso 1
    if (targetIntent === 'gps') {
        setStep(1); 
    } 
    // Para el resto, mantenemos la lógica de si tiene scope o no
    else if (['broshop', 'lives', 'internal_search'].includes(targetIntent) && !scope) {
        setStep(1);
    } else {
        setStep(2);
    }
};

  const handleActivateGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let loc = { type: 'gps', lat, lng, city: 'Localizando...' };
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data.address) loc.city = data.address.city || data.address.town || 'Ciudad Bro';
        } catch (e) {}
        setScope(loc); setGpsLoading(false); setStep(2);
    }, () => { 
        setGpsLoading(false); setScope({ city: 'Sintonía Manual', type: 'demo' }); setStep(2); 
    });
  };
  
  

  // --- SINCRONIZACIÓN DE DATOS ---
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
        setRealItems(all.map(u => ({
          ...u, 
          shopName: u.alias, 
          name: u.product_title || u.alias, 
          img: u.card_banner_url || u.banner_url,
          type: u.video_file ? ['shop', 'live'] : ['shop']
        })).filter(u => u.video_file || u.audio_file || u.product_title));
      }
    };
    fetchData();
  }, [session, step]);

  const filteredItems = useMemo(() => {
    // 1. Mapear items de Supabase (realItems)
    const supabaseItems = realItems.map(u => ({
      ...u,
      id: u.id,
      name: u.product_title || u.alias,
      img: u.card_banner_url || u.banner_url || '/default.png', // Fallback
      price: u.price || 0,
      type: u.video_file ? ['shop', 'live'] : ['shop'],
      source: 'supabase'
    }));

    // 2. Mapear items de MASTER_DB
    const masterItems = MASTER_DB.map(m => ({
      ...m,
      id: m.id,
      name: m.name,
      img: m.img || '/default.png', // Asegura que la propiedad sea 'img' siempre
      price: m.price || 15,
      type: m.type || ['shop'],
      source: 'master'
    }));

    const ALL = [...supabaseItems, ...masterItems];

    // 3. Filtrar
    if (intent === 'broshop') return ALL.filter(i => i.type?.includes('shop'));
    if (intent === 'lives') return ALL.filter(i => i.type?.includes('live'));
    
    return ALL;
  }, [intent, realItems]);  
  
  const hubVideos = useMemo(() => {
    // 1. Mapear los Mocks de MASTER_DB para que tengan la misma estructura que los reales
    const masterVideos = MASTER_DB
      .filter(m => m.video_file) // Aseguramos que tengan video
      .map(m => ({
        ...m,
        id: m.id,
        alias: m.name || m.alias,
        video_file: m.video_file,
        source: 'master'
      }));

    // 2. Mapear los de Supabase (realItems)
    const supabaseVideos = realItems
      .filter(i => i.video_file)
      .map(i => ({
        ...i,
        alias: i.alias,
        video_file: i.video_file,
        id: i.id,
        source: 'supabase'
      }));

    // 3. Unir todo
    return [
      { alias: "BRO MASTER", video_file: "/videos/Chica_forest.mp4", id: "master_01" },
      ...masterVideos,
      ...supabaseVideos
    ];
  }, [realItems]); // Solo se recalcula cuando cambian los usuarios de Supabase
    
  if (!session && !isGuest) {
    return <GenesisGate onGuestAccess={() => { setIsGuest(true); setStep(0); setRealityMode(null); setBalances({ genesis: 500, nova: 20 }); }} />;
  }

const handleReportIssue = async () => {
  const currentScene = realityMode || 'lobby';
  
  const { data, error } = await supabase
    .from('reports_board')
    .insert([
      { 
        user_id: session?.user?.id || null, // null si es invitado
        scene: currentScene,
        reason: 'Reporte ciudadano',
        status: 'pendiente'
      }
    ]);

  if (error) {
    console.error("Error al reportar:", error);
    alert("Hubo un problema enviando el reporte.");
  } else {
    alert("Reporte enviado a la central de seguridad.");
  }
};

// Función para abrir el TelefonoCasa HoloProyector
const handleOpenProjector = (user) => {
    setActiveUser(user);
};

// Función para abrir la tienda (la que querías conectar)
const handleGoToShop = (user) => {
  setProjectingUser(null);        // Cierra el HoloProjector
  setSelectedCard(user);          // 👈 Guarda el usuario para abrir su PaymentModal
};

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* 1. FONDO DE VIDEOS */}
<div className="absolute inset-0 z-0">
  {step === 0 && !projectingUser && (  // 👈 añade && !projectingUser
    !realityMode ? <RealityTuner onSelect={setRealityMode} /> :
    realityMode === 'este'  ? <ChannelEste  videoUsers={hubVideos} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={setProjectingUser} selectedForestUser={selectedForestUser} /> :
    realityMode === 'oeste' ? <ChannelOeste videoUsers={hubVideos} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={setProjectingUser} selectedForestUser={selectedForestUser} /> :
    <BioForest videoUsers={hubVideos} balances={balances} setBalances={setBalances} session={session} realityMode={realityMode} onOpenProfile={setProjectingUser} selectedForestUser={selectedForestUser} />
  )}
  
          {step === 1 && <video src="/portada.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />}
        {step === 2 && (
          <video 
            key={intent} 
            src={intent === 'ai' ? "/ai_bg.mp4" : intent === 'game' ? "/game_bg.mp4" : intent === 'lives' ? "/brolives1.mp4" : intent === 'internal_search' ? "/racoonask.mp4" : getVideoForLocation(scope)} 
            autoPlay loop muted playsInline className="w-full h-full object-cover animate-fadeIn" 
          />
        )}
      </div>

      {/* 2. PUERTA IZQUIERDA: AUDIO, REALITY Y WALLET */}
<div className={`side-panel side-panel-left ${isLeftOpen ? 'open' : ''} flex flex-col items-stretch p-0 overflow-y-auto custom-scrollbar`}>
    
    {/* SECCIÓN WALLET: Ahora ocupa todo el ancho sin márgenes internos que lo achiquen */}
    <div className="mt-12 w-full px-4">
        <div className="w-full transform scale-100 origin-left">
            <WalletWidget 
                balances={balances} 
                onClick={() => setShowWalletModal(true)} 
            />
        </div>
    </div>
              
    {/* BOTÓN REALITY: Ajustado para mantener consistencia de bloque */}
    <div className="px-4 mt-6">
        <button 
            onClick={() => { setStep(0); setRealityMode(null); setIsRightOpen(false); }} 
            className="w-full flex justify-between items-center p-4 bg-cyan-500/10 border border-cyan-400/40 rounded-2xl hover:bg-cyan-500 hover:text-black transition-all"
        >
            <span className="text-[10px] font-black uppercase">Cambiar Reality</span>
            <span className="text-xl">🌐</span>
        </button>
    </div>

    {/* SCAN REALITY */}
    <div className="flex flex-col gap-2 px-4 mt-4">
        <button 
            onClick={() => setShowRadar(!showRadar)} 
            className={`flex items-center gap-4 p-4 border rounded-2xl transition-all ${showRadar ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/5 border-white/10'}`}
        >
            <span className="text-xl">🔍</span>
            <span className="text-[10px] font-black uppercase">Scan Reality</span>
        </button>
        {showRadar && (
            <div className="bg-black/90 border border-cyan-500/50 rounded-xl p-3">
                <input 
                    autoFocus 
                    type="text" 
                    placeholder="BUSCAR..." 
                    value={radarQuery} 
                    onChange={(e) => setRadarQuery(e.target.value)} 
                    className="w-full bg-transparent border-b border-white/20 text-white text-[10px] p-2 outline-none mb-2" 
                />
                <div className="max-h-32 overflow-y-auto flex flex-col gap-1">
                    {realItems.filter(u => u.alias?.toLowerCase().includes(radarQuery.toLowerCase())).slice(0,5).map(u => (
                        <button 
                            key={u.id} 
                            onClick={() => { setStep(0); setSelectedForestUser(u); setShowRadar(false); setIsLeftOpen(false); }} 
                            className="text-[10px] p-2 hover:bg-cyan-500/20 text-left rounded truncate font-bold uppercase"
                        >
                            {u.alias}
                        </button>
                    ))}
                </div>
            </div>
        )}
    </div>

   {/* AUDIO TOOLS (BROLIVES + TUNER) */}
<div className="mt-auto flex flex-col w-full pb-10">
              <div className="w-full px-4 mb-4">
                  <p className="text-[8px] text-gray-500 font-bold uppercase mb-2 tracking-widest ml-1">Audio & Lives Player</p>
                  
                  {/* AQUÍ PASAMOS EL ESTADO DEL AUDIO */}
                  <BroLives 
                      playingCreator={audioUser} 
                      onToggleAudio={() => setAudioUser(prev => prev ? null : audioUser)} // Pausa si le das click
                  />
              </div>
              <div className="w-full px-4 pt-4 border-t border-white/5">
                  <BroTuner />
              </div>
          </div>
      </div>      

      {/* 3. PUERTA DERECHA: BROSTORIES, BOOSTER Y SECTORES */}
      <div className={`side-panel side-panel-right ${isRightOpen ? 'open' : ''} flex flex-col p-6 gap-3 items-end`}>
          <div className="mt-10 w-full">
          </div>

         <div className="w-full flex flex-col gap-1 mt-4">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-right mb-2 font-mono">Navegación</p>
            
            {[
              { id: 'gps',             label: 'GPS / RUTA',       icon: '📍' },
              { id: 'broshop',         label: 'BROSHOP',          icon: '🛒🦝' },
              { id: 'lives',           label: 'AUDIO & LIVES',    icon: '🎧' },
              { id: 'internal_search', label: 'AVISOS',           icon: '📋' }, 
              { id: 'ai',              label: 'GUÍA / ACCESS AI', icon: '🦝🤖' },
              { id: 'game',            label: 'GAMES',            icon: '🖱️' }
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => handleNavigation(item.id)} 
                className="w-full flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 group transition-all"
              >
                <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-cyan-400">
                    {item.label}
                </span>
                <span className="text-lg">{item.icon}</span>
              </button>
            ))}
          </div>
          
          <button onClick={() => setShowBooster(true)} className="w-full p-4 border border-cyan-500/30 bg-cyan-500/10 rounded-2xl text-cyan-400 font-mono text-[10px] hover:bg-cyan-500 hover:text-black mt-4">[ BOOSTER STUDIO ]</button>
          
            {/* BOTÓN BRO STORIES */}
          <button onClick={() => { setShowStory(true); setIsLeftOpen(false); }} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 border border-fuchsia-500/30 rounded-2xl">
              <span className="text-xl">❄️</span>
              <span className="text-[10px] font-black italic">BRO STORIES</span>
          </button>  
          
          {/* Debajo de tus botones de navegación actuales, dentro de la puerta derecha */}
<button 
  onClick={() => handleReportIssue()} 
  className="w-full flex justify-between items-center p-4 bg-red-900/20 border border-red-500/30 rounded-2xl hover:bg-red-500/20 group transition-all mt-4"
>
  <span className="text-[10px] font-black uppercase tracking-widest text-red-400 group-hover:text-white">
      REPORTAR INCIDENCIA
  </span>
  <span className="text-lg">🚩</span>
</button>

{/* LEGAL */}
<button 
  onClick={() => setShowLegal(true)} 
  className="w-full flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 group transition-all"
>
  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-cyan-400">
    LEGAL / CREADOR
  </span>
  <span className="text-lg">⚖️</span>
</button>
          
          <button onClick={async () => { await supabase.auth.signOut(); localStorage.clear(); window.location.href = "/"; }} className="mt-auto text-red-500 font-mono text-[10px] underline">[ DISCONNECT ]</button>
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
             onHoverCard={(user) => setActivePrismUser(user)} 
            />
          </div>
        </div>
      )}      
      {/* HOLOPRISMA RECUPERADO (Solo en BroShop o Lives) */}
      {step === 2 && (intent === 'broshop' || intent === 'lives') && ( 
        <div className="hidden md:flex fixed right-2 top-[6%] -translate-y-1/2 z-[40] flex-col items-center w-24 animate-fadeIn pointer-events-none">
             <div className="scale-[1.1] origin-bottom-right relative z-20 transition-transform hover:scale-[1.15]">
                  <HoloPrism user={activePrismUser} /> 
                 <HoloPrism user={activePrismUser} />
             </div>
        </div>
      )}
            
      {/* 6. PÁGINA GPS/TELETRANSPORTE (BAJADO PARA NO TAPAR CARAS) */}
      {step === 1 && (
  <div className="relative z-[150] h-full flex flex-col items-center justify-end pb-32 pointer-events-none">
      <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 pointer-events-auto w-full max-w-sm">
          {/* Contenido del GPS bajado para dejar libre la parte superior del video */}
          <button onClick={handleActivateGPS} className="bg-cyan-500 text-black py-4 w-full rounded-2xl font-black">
              📍 ACTIVAR GPS
          </button>                <div className="flex flex-col gap-2">
                    <input type="text" placeholder="DESTINO CIUDAD..." onChange={(e) => setTeleportCoords({city: e.target.value})} className="bg-white/10 border border-white/20 p-4 rounded-xl text-center outline-none focus:border-fuchsia-500 font-mono text-xs text-white" />
                    <button onClick={() => { setScope({city: teleportCoords.city, type: 'teleport'}); setStep(2); }} className="bg-fuchsia-600/90 text-white py-4 rounded-2xl font-black text-lg hover:bg-fuchsia-500 transition-all">🌀 SALTO CUÁNTICO</button>
                </div>
                <button onClick={() => setStep(0)} className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-2">❮ Cancelar</button>
            </div>
        </div>
      )}

      {/* 7. MODALES Y TELEFONO CASA */}
      
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
          <StoryPlayer 
            src="/brostories_demo.mp4"   // <--- FALTABA EL VIDEO
            activePhase="nova"           // <--- FALTABA ESTO (CRÍTICO PARA EL COLOR)
            balances={balances} 
            setBalances={setBalances}
            isAdsMode={true} 
            onClose={() => setShowStory(false)} 
            onComplete={(amount) => {
                // Lógica de recompensa recuperada
                setBalances(prev => {
                    const newTotal = prev.genesis + amount;
                    // Si tienes una función syncGenesisToDB úsala aquí, si no, actualiza solo local
                    // syncGenesisToDB(newTotal); 
                    return { ...prev, genesis: newTotal };
                });
            }} 
          />
        </div>
      )}
      
      {showWalletModal && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl"><ConversionModal balances={balances} setBalances={setBalances} onClose={() => setShowWalletModal(false)} /></div>}
      {showBooster && <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center"><BoosterModal onClose={() => setShowBooster(false)} /></div>}
      
      {/* TELEFONO CASA / HOLOPROJECTOR (VERTICAL) */}
{projectingUser && !is219Mode && (
  <HoloProjector 
    videoUrl={projectingUser.video_file || projectingUser.videoUrl} 
    user={projectingUser} 
    handleGoToShop={handleGoToShop}
    balances={balances} 
    setBalances={setBalances} 
    session={session}
    onOpenLog={setSelectedLog} 
    onClose={() => {
     setProjectingUser(null);
    setIs219Mode(false); // Reseteamos por si acaso
    }} 
    onGoTo219={() => setIs219Mode(true)} // 👈 LE PASAMOS ESTA NUEVA PROP
  />
)}

      {/* TERMINAL SHOP (PAGOS) */}
      {selectedCard && (
  <PaymentModal 
    card={selectedCard} 
    balances={balances}
    setBalances={setBalances}
    onClose={() => setSelectedCard(null)} 
  />
)}

{/* En App.jsx, junto al BroLogViewer */}
{intent === 'internal_search' && step === 2 && (
  <div className="fixed inset-x-0 top-[10%] bottom-[16%] z-[90] pointer-events-auto mx-auto max-w-5xl px-4">
    <RacoonTerminal 
      onClose={() => { setStep(0); setIntent(null); }}
      session={session}
      balances={balances}
      setBalances={setBalances}
      onNavigateToSantuario={(targetUserId) => {
        const targetUser = realItems.find(u => u.id === targetUserId);
        if (targetUser) {
          setProjectingUser(targetUser);
          setIntent(null);
        }
      }}
    />
  </div>
)}
      
      {selectedLog && <BroLogViewer log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}

export default App;