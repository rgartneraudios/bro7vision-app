// src/components/BioForest.jsx
// VERSIÓN COMPLETA: Nihilanth + Fix Audio + Fix Touch + Ecos completos + Hyper Zap

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { TV_NODES } from '../../data/TvDatabase';
import Hls from 'hls.js';
import { marcarActividad } from '../../hooks/useActividad';
import { getMoonSuffix } from '../../utils/moonUtils';
import { getVideoCandidates, resolveVideoFromCandidates, getTurno } from '../../data/citycodes';

const FOREST_STYLES = `
    @keyframes spiritFade {
        0% { opacity: 0; transform: translateY(15px); filter: blur(5px); }
        8% { opacity: 1; transform: translateY(0); filter: blur(0px); }
        85% { opacity: 1; transform: translateY(-12px); filter: blur(0px); }
        100% { opacity: 0; transform: translateY(-35px); filter: blur(10px); }
    }
    
    /* SCROLLBAR NEON PARA EL ACORDEÓN */
    .bro-scrollbar::-webkit-scrollbar { width: 6px; }
    .bro-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.8); border-radius: 8px; }
    .bro-scrollbar::-webkit-scrollbar-thumb { background: #00ffff; border-radius: 8px; box-shadow: 0 0 10px #00ffff; }
    .bro-scrollbar::-webkit-scrollbar-thumb:hover { background: #d946ef; }
    
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
    
    .font-moderna { font-family: 'Outfit', sans-serif; }
    
    /* SCROLLBAR NEON (Que ya tenías) */
    .bro-scrollbar::-webkit-scrollbar { width: 6px; }
    .bro-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.6); border-radius: 8px; }
    .bro-scrollbar::-webkit-scrollbar-thumb { background: #00ffff; border-radius: 8px; box-shadow: 0 0 10px #00ffff; }
    .bro-scrollbar::-webkit-scrollbar-thumb:hover { background: #d946ef; }
    
    @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
.animate-ticker { animation: ticker 25s linear infinite; }
    
    .animate-spirit { animation: spiritFade 10s ease-in-out forwards; }
    @keyframes vortexRise {
        0%   { transform: translate(-80vw,-30vh) scale(0.9) rotate(0deg); opacity:0.8; }
        15%  { transform: translate(-30vw,0vh) scale(1.3) rotate(90deg); }
        70%  { transform: translate(10vw,-35vh) scale(1.2) rotate(450deg); }
        80%  { transform: translate(5vw,-45vh) scale(0.9) rotate(540deg); }
        100% { transform: translate(-30vw,-60vh) scale(0.05) rotate(720deg); opacity:0.8; }
    }
    .animate-vortex { animation: vortexRise 6s cubic-bezier(0.45,0.05,0.55,0.95) forwards; }
    @keyframes vortexSpin { 0%{transform:rotate(0deg) scale(1)} 100%{transform:rotate(360deg) scale(1.05)} }
    .animate-spin-vortex { animation: vortexSpin 1.5s linear infinite; }
    @keyframes energyPulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.2);opacity:1} }
    .animate-energy-pulse { animation: energyPulse 2s ease-in-out infinite; }
    @keyframes spiralCounter { 0%{transform:rotate(0deg)} 100%{transform:rotate(-360deg)} }
    .animate-spiral-counter { animation: spiralCounter 3s linear infinite; }
    @keyframes particleOrbit { 0%{transform:rotate(0deg) translateX(30px) scale(1);opacity:1} 100%{transform:rotate(360deg) translateX(30px) scale(0.5);opacity:0} }
    .animate-particle-orbit { animation: particleOrbit 2s ease-out infinite; }
    @keyframes flare { 0%,60%,100%{opacity:0;transform:scale(0.8)} 70%{opacity:1;transform:scale(1.3)} }
    .animate-flare { animation: flare 3s ease-in-out infinite; }
    @keyframes shimmer { 100%{transform:translateX(100%)} }
    .animate-shimmer { animation: shimmer 2s infinite; }


    /* VISOR BORDE RESPLANDOR BLANCO */
    @keyframes visor-glow-pulse {
        0%,100% { box-shadow: 0 0 18px rgba(255,255,255,0.25),0 0 40px rgba(255,255,255,0.10),inset 0 0 20px rgba(255,255,255,0.04); }
        50%      { box-shadow: 0 0 30px rgba(255,255,255,0.45),0 0 70px rgba(255,255,255,0.20),inset 0 0 30px rgba(255,255,255,0.08); }
    }
    .visor-border { border: 1.5px solid rgba(255,255,255,0.30); animation: visor-glow-pulse 3s ease-in-out infinite; }

    /* ORBES */
    @keyframes pulse-orb {
        0%,100% { box-shadow:0 0 15px currentColor; transform:scale(1); opacity:0.8; }
        50%      { box-shadow:0 0 30px currentColor,0 0 50px currentColor; transform:scale(1.1); opacity:1; }
    }
    .orb-glow { animation: pulse-orb 2s ease-in-out infinite; }
    @keyframes orb-float { 0%,100%{transform:translateY(0px) scale(1)} 50%{transform:translateY(-6px) scale(1.06)} }
    .orb-float { animation: orb-float 3s ease-in-out infinite; }
    
   /* El contenedor de la órbita le da la perspectiva 3D */
.orbita-cometa-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140%;  /* Más ancho que el botón */
  height: 280%; /* Mucho más alto, al inclinarlo se verá como un óvalo horizontal */
  pointer-events: none;
  /* Aquí está el truco: centramos, inclinamos (rotateX) y animamos el giro (rotateZ) */
  animation: girar-orbita 4s linear infinite;
}

/* La línea del recorrido (trazo fino) */
.orbita-trazo {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  /* CAMBIO 1: Aumentamos opacidad y añadimos una sombra sutil para separar la línea del fondo */
  border: 1.5px dashed rgba(0, 255, 255, 0.8); 
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8)); /* Esto hace que la línea se vea aunque el fondo sea blanco */
}

/* La cabeza del cometa (un punto brillante) */
.orbita-cabeza {
  position: absolute;
  top: -4px; /* Ajuste leve para compensar el tamaño */
  left: 50%;
  transform: translateX(-50%);
  /* CAMBIO 2: Ligeramente más grande para que sea un punto de atención real */
  width: 8px;
  height: 8px;
  background-color: #ffffff; /* El centro blanco puro da sensación de luz intensa */
  border: 2px solid #00ffff; /* Borde cian para mantener el color */
  border-radius: 50%;
  /* CAMBIO 3: Sombra más cerrada y definida (menos blur, más intensidad) */
  box-shadow: 0 0 8px 2px #00ffff; 
}
@keyframes girar-orbita {
  0% {
    transform: translate(-50%, -50%) rotateX(75deg) rotateZ(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotateX(75deg) rotateZ(360deg);
  }
}
    
`;

const PC_SLOTS = [
    {x:5,y:25},{x:7,y:40},{x:15,y:65},
    {x:62,y:10},{x:75,y:25},{x:75,y:7},
    {x:15,y:3},{x:65,y:43},{x:80,y:40},
];
const MOBILE_SLOTS = [{x:5,y:75}, {x:50,y:75}];

// HYPER ZAP — zonas derecha, para no pisarse
const HYPER_PC_SLOTS = [
  {x:70,y:60},{x:80,y:75},
  {x:4,y:78},{x:15,y:50},{x:16,y:27},
];
const HYPER_MOBILE_SLOTS = [{x:20,y:2}];

const BioForest = ({ videoUsers, balances, setBalances, session, realityMode, onOpenProfile, selectedForestUser, savedUserIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeReaction, setActiveReaction] = useState(null);
  const [visualEchos, setVisualEchos] = useState([]);
  const [floatingEcos, setFloatingEcos] = useState([]);        // se reinicia con el video ✅
  const [floatingHyperZaps, setFloatingHyperZaps] = useState([]); // persiste al scrollear ✅
  const [visorScale, setVisorScale] = useState(1);
  const [showEchoInput, setShowEchoInput] = useState(false);
  const [echoType, setEchoType] = useState('text');
  const [echoText, setEchoText] = useState("");
  const [realUserAlias, setRealUserAlias] = useState("");
  const mediaRecorderRef = useRef(null);
  const [isOrbitando, setIsOrbitando] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ecoVariant, setEcoVariant] = useState('pay');
  const [selectedEmoji, setSelectedEmoji] = useState(1);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false); // Para abrir/cerrar el historial
  const [bgVideoUrl, setBgVideoUrl] = useState('');

  const [proyeccion, setProyeccion] = useState(null);
  const [acordeonAbierto, setAcordeonAbierto] = useState(false);



  useEffect(() => {
  if (savedUserIndex) setCurrentIndex(savedUserIndex);
}, []);

  useEffect(() => {
    const BIOFOREST_CANAL = { solo_fantasy:5, band_fantasy:8};
    const canal = BIOFOREST_CANAL[realityMode];
    if (!canal) return;
    let active = true;
    resolveVideoFromCandidates(getVideoCandidates(canal, getMoonSuffix(), getTurno(), 0, null))
      .then(url => { if (active) setBgVideoUrl(url); });
    return () => { active = false; };
  }, [realityMode]);


  const videoRef = useRef(null);
  const bgVideoRef = useRef(null);
  const hlsRef = useRef(null);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const displayUsers = useMemo(() => {
    const turnoActual = getTurno();
    const elegibles = (videoUsers?.length > 0 ? videoUsers : []).filter(c => {
      if (c.semaforo === 'AMARILLO') return turnoActual >= 3;
      if (c.semaforo === 'ROJO')     return turnoActual === 4;
      return true;
    });
    const combined = [...elegibles, ...TV_NODES];
    if (combined.length === 0) {
      return [{ id: 'loading_01', alias: 'SINTONIZANDO...', video_file: '' }];
    }
    return combined;
  }, [videoUsers]);
  
  // 1. Definimos el usuario que vemos en pantalla
  const currentUser = useMemo(() => displayUsers[currentIndex % displayUsers.length], [displayUsers,currentIndex]);
  const creatorId = currentUser?.id; 

  // 🛡️ ESCUDO ANTI-MOCKS: Creamos una variable para saber si el creador es de mentira.
  // Asumimos que los IDs reales de Supabase (UUID) tienen 36 caracteres. 
  // Si tus Mocks tienen IDs cortos (como 'tv_node_1' o 'loading_01'), esto los detecta al instante.
  // (Si tus mocks tienen otro formato, puedes cambiar esta condición).
  const isRealCreator = creatorId && creatorId.length > 20; 
  
  // 🛡️ ESCUDO DE SESIÓN: Comprobamos si el que mira la pantalla está logueado
  const isRealViewer = session?.user?.id;

  // ==========================================
  // 2. USEEFFECT: LEER DE SUPABASE (Protegido)
  // ==========================================
  useEffect(() => {
    const comprobarEstadoOrbita = async () => {
      // Si no hay usuario en pantalla, o es un Mock, o el espectador es anónimo -> No consultamos a Supabase
      if (!currentUser || !isRealCreator || !isRealViewer) {
        setIsOrbitando(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_creators_orbits') 
          .select('is_orbiting')
          .eq('user_id', session.user.id) // El ID del espectador real
          .eq('creator_id', creatorId)    // El ID del creador real
          .single();

        if (data) {
          setIsOrbitando(data.is_orbiting);
        } else {
          setIsOrbitando(false);
        }
      } catch (err) {
        // Ignoramos el error si simplemente no encontró resultados (código PGRST116)
        if (err.code !== 'PGRST116') {
           console.log("Error al comprobar órbita:", err);
        }
      }
    };

    comprobarEstadoOrbita();
  }, [currentUser, creatorId, session, isRealCreator, isRealViewer]); 


  // ==========================================
  // 3. LA FUNCIÓN DEL CLIC (Protegida)
  // ==========================================
  const handleOrbitar = async (e) => {
    e.stopPropagation();
    
    // 1. Cambiamos la UI visualmente SIEMPRE (para que el cometa salga aunque sea un Mock)
    const nuevoEstado = !isOrbitando;
    setIsOrbitando(nuevoEstado); 

    // 2. Si es un Mock o un espectador anónimo, terminamos aquí. No tocamos la base de datos.
    if (!isRealCreator || !isRealViewer) {
      console.log("Órbita simulada (Es un Mock o usuario anónimo). No se guarda en BD.");
      return; 
    }

    // 3. Si ambos son reales, guardamos en Supabase
    try {
      const { error } = await supabase
        .from('user_creators_orbits') 
        .upsert({
          user_id: session.user.id, 
          creator_id: creatorId,     
          is_orbiting: nuevoEstado,
          updated_at: new Date()
        }, { onConflict: 'user_id,creator_id' }); 

      if (error) throw error;
      console.log(nuevoEstado ? "Guardado: Has empezado a orbitar" : "Guardado: Has dejado la órbita");

    } catch (error) {
      console.error("Error al guardar la órbita en BD:", error);
      setIsOrbitando(!nuevoEstado); // Si falla internet o la BD, deshacemos el giro del cometa visualmente
    }
  }; 
  
  const config = useMemo(() => {
    switch(realityMode){
      case 'solo_fantasy': return {colors:['text-cyan-400','text-fuchsia-400'],  reactionColor:'cyan',   labelClass:'text-cyan-400',   labelText:'SOLO FANTASY',navColor:'text-cyan-400'   };
      case 'band_fantasy': return {colors:['text-fuchsia-500','text-purple-300'],reactionColor:'fuchsia',labelClass:'text-fuchsia-400', labelText:'BAND FANTASY',navColor:'text-fuchsia-500'};
      default:             return {colors:['text-cyan-400','text-white'],         reactionColor:'cyan',   labelClass:'text-cyan-400',  labelText:'GENESIS NODE',navColor:'text-cyan-400'  };
    }
  },[realityMode]);

  useEffect(()=>{
    const f=async()=>{if(!session?.user?.id)return;const{data}=await supabase.from('profiles').select('alias').eq('id',session.user.id).single();if(data?.alias)setRealUserAlias(data.alias);};
    f();
  },[session]);

  useEffect(()=>{
    if(selectedForestUser&&displayUsers.length>0){const i=displayUsers.findIndex(u=>u.id===selectedForestUser.id);if(i!==-1)setCurrentIndex(i);}
  },[selectedForestUser,displayUsers]);

  const cleanUrl=(url)=>{
    if(!url)return"";let c=url.trim();
    if(c.includes('dropbox.com')){c=c.replace('www.dropbox.com','dl.dropboxusercontent.com').replace('dropbox.com','dl.dropboxusercontent.com').replace('?dl=0','').replace('&dl=0','');return c.includes('?')?`${c}&raw=1`:`${c}?raw=1`;}
    return c;
  };

  // FIX AUDIO — Efecto A: solo carga cuando cambia usuario
useEffect(()=>{
  const video=videoRef.current;
  const bgVideo=bgVideoRef.current;
  if(!video||!currentUser)return;
  const playUrl=cleanUrl(currentUser.video_file||"");
  if(hlsRef.current){hlsRef.current.destroy();hlsRef.current=null;}
  const isHLS=playUrl.includes('.m3u8');
  if(isHLS){
    if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=playUrl;video.muted=isMuted;video.play().catch(()=>{});}
    else if(Hls.isSupported()){const hls=new Hls();hls.loadSource(playUrl);hls.attachMedia(video);hls.on(Hls.Events.MANIFEST_PARSED,()=>{video.muted=isMuted;video.play().catch(()=>{});});hlsRef.current=hls;}
  } else {
    const same=video.src===playUrl||video.src===window.location.origin+playUrl;
    if(!same){
      video.pause();video.src="";video.load();
      video.src=playUrl;video.muted=isMuted;video.load();video.play().catch(()=>{});
      setIsPaused(false);
    }
  }
  setVisualEchos([]);setFloatingEcos([]);
  return () => {
    if(video) video.pause();
    if(hlsRef.current){ hlsRef.current.destroy(); hlsRef.current=null; }
  };
  },[currentUser]); // SOLO currentUser

  useEffect(() => {
    if (!currentUser?.id || currentUser.id.length < 20) {
      setProyeccion(null);
      return;
    }
    const fetchProyeccion = async () => {
      const { data, error } = await supabase
        .from('proyeccion_916')
        .select('titulo, descripcion, tipo')
        .eq('user_id', currentUser.id)
        .single();
      if (error) { setProyeccion(null); return; }
      setProyeccion(data);
    };
    fetchProyeccion();
  }, [currentUser?.id]);

const videoTitulo = proyeccion?.titulo || null;
const videoDesc   = proyeccion?.descripcion || null;
const videoTipo   = proyeccion?.tipo || null;

  // FIX AUDIO — Efecto B: mute sin recargar
  useEffect(()=>{ if(videoRef.current) videoRef.current.muted=isMuted; },[isMuted]);
  
  // NAVEGACIÓN TECLADO / D-PAD SMART TV ← nuevo
useEffect(()=>{
  const handleKey=(e)=>{
    if(e.key==='ArrowRight'||e.key==='ArrowDown')
      setCurrentIndex(p=>p+1);
    if(e.key==='ArrowLeft'||e.key==='ArrowUp')
      setCurrentIndex(p=>p>0?p-1:displayUsers.length-1);
  };
  window.addEventListener('keydown',handleKey);
  return()=>window.removeEventListener('keydown',handleKey);
},[displayUsers]);

  // Fetch ecos completo con Hyper Zap (VERSIÓN LIMPIA SIN AUDIO Y SIN LA PALABRA AD)
  useEffect(() => {
    if(!currentUser?.id) return;
    const fetch = async() => {
      const isUUID = /^[0-9a-f]{8}/i.test(currentUser.id);
      
      // 1. Traemos los Hyper Zaps (Visuales) -> Adiós a la variable 'ads'
      const { data: zapsData } = await supabase
        .from('bro_echos')
        .select('*')
        .eq('is_sponsored', true)
        .limit(10);
        
      let finalVisual = zapsData || [];

      if(isUUID) {
        const yesterday = new Date(); 
        yesterday.setDate(yesterday.getDate() - 1);
        
        // 2. Traemos los Ecos normales de las últimas 24h
        const { data: userEchos } = await supabase
          .from('bro_echos')
          .select('*')
          .eq('target_profile_id', currentUser.id)
          .eq('is_sponsored', false)
          .gt('created_at', yesterday.toISOString())
          .lt('reports_count', 3)
          .order('created_at', { ascending: false })
          .limit(30);
          
        if(userEchos) {
          // Filtramos solo para asegurarnos de que no entren audios viejos, adiós al TTS.
          finalVisual = [...finalVisual, ...userEchos.filter(e => !e.audio_link)];
        }
      } else {
        finalVisual = [...finalVisual, { id: 's1', author_alias: 'BRO MASTER', text: 'Buscamos los primeros 500 Fundadores para arrancar el Reino!, postúlate!' }];
      }
      
      setVisualEchos(finalVisual);
    };
    
    fetch();
  }, [currentUser]);
  
  
  useEffect(() => {
    if(!visualEchos || visualEchos.length === 0) return;
    
    let slot = 0;
    let lastEchoId = null; // MAGIA 1: Memoria del último comentario lanzado

    const interval = setInterval(() => {
      // Filtros
      const zapsList = visualEchos.filter(e => e.is_sponsored && e.advertiser_id !== currentUser?.id);
      const normalsList = visualEchos.filter(e => !e.is_sponsored);
      
      const mob = window.innerWidth < 768;
      const coords = (mob ? MOBILE_SLOTS : PC_SLOTS)[slot % (mob ? MOBILE_SLOTS : PC_SLOTS).length];
      const hyperSlots = mob ? HYPER_MOBILE_SLOTS : HYPER_PC_SLOTS;
      const hyperCoords = hyperSlots[slot % hyperSlots.length];
      slot++;

      // LOGICA DE ECOS NORMALES (Anti-Repetición)
      if(normalsList.length > 0) {
        
        let pool = normalsList;
        // Si hay variedad, quitamos del sorteo el que acaba de salir
        if (normalsList.length > 1) {
          pool = normalsList.filter(e => e.id !== lastEchoId);
        }

        // MAGIA 2: Si hay muy pocos comentarios, damos pausas aleatorias 
        // para que no se clonen simultáneamente en pantalla.
        const isQuietRoom = normalsList.length <= 2;
        const shouldSkipPulse = isQuietRoom && Math.random() > 0.4; // 60% de chances de saltar el turno

        if (!shouldSkipPulse) {
          const echo = pool[Math.floor(Math.random() * pool.length)];
          lastEchoId = echo.id; // Guardamos en memoria el elegido
          
          const isOwnCreator = echo.advertiser_id === currentUser?.id;
          
          setFloatingEcos(prev => [...prev.slice(-2), {
            ...echo, 
            id: Date.now() + Math.random(), 
            x: coords.x, 
            y: coords.y,
            isCreator: isOwnCreator
          }]);
        }
      }

      // LOGICA DE HYPER ZAP (Queda igual, 25% de apariciones)
      if(Math.random() > 0.75) {
        const currentZap = zapsList.length > 0
          ? zapsList[Math.floor(Math.random() * zapsList.length)]
          : { id: 'SYSTEM_ZAP', is_sponsored: true, author_alias: 'BROVISION TV', text: '🔴 ¿QUIERES VER TV EN VIVO? HAZ CLIC AQUÍ', target_index: 0 };
          
        setFloatingHyperZaps(prev => [...prev.slice(-1), {
          ...currentZap, 
          id: Date.now() + Math.random(), 
          x: hyperCoords.x, 
          y: hyperCoords.y
        }]);
      }
    }, 4500);
    
    return () => clearInterval(interval);
  }, [visualEchos, currentUser]);  
  
  const handleReport=async(echoId)=>{
    if(!confirm("¿Reportar este mensaje como inapropiado?"))return;
    await supabase.rpc('increment_report',{row_id:echoId});
   alert("Reporte enviado. Gracias por limpiar el bosque.");
setVisualEchos(prev=>prev.filter(e=>e.id!==echoId));
  };

  const handleAction = async (type) => {
  const col = echoType === 'hyper' ? `zap_${ecoVariant}` : `eco_${ecoVariant}`;

  // --- CASO A: ECOS DE LUZ / REACCIONES (HALOS) ---
  if (type === 'reaction') {
    try {
      // Registramos que el usuario lanzó un Halo de luz
      await marcarActividad('halo_luz');
    } catch (e) { console.error(e); }
    
    const myAlias = realUserAlias || 'CIUDADANO';
    setActiveReaction({ from: myAlias });
    setTimeout(() => setActiveReaction(null), 6000);
    return; // 👈 sale aquí, no descuenta nada
  }
  
   // --- CASO B: MANDAR ECO O HYPER ZAP (GEMMAS vs GENESIS) ---
  try {
    if (ecoVariant === 'pay') {
      // Si la variante es 'pay', significa que está usando Gemmas
      await marcarActividad('uso_gemmas');
    } else {
      // Si es 'gen', está usando puntos Génesis
      await marcarActividad('uso_genesis');
    }
  } catch (e) { console.error(e); }
  
  // Solo llega aquí si es echo/zap
  if (!balances || balances[col] < 1) {
    alert(`NECESITAS ${echoType === 'hyper' ? 'ZAP' : 'ECO'} ${ecoVariant.toUpperCase()}...`);
    return;
  }

  const myAlias = realUserAlias || 'CIUDADANO';
  const { data } = await supabase.from('bro_echos').insert([{
    target_profile_id: currentUser.id,
    author_alias: myAlias,
    advertiser_id: session.user.id,
    text: echoText.toUpperCase(),
    is_sponsored: echoType === 'hyper',
    eco_emoji_id: selectedEmoji, // <-- GUARDAMOS EL EMOJI
    currency: ecoVariant,        // <-- GUARDAMOS SI ES PAY O GEN
    created_at: new Date()
  }]).select();

  if (data) setVisualEchos(prev => [data[0], ...prev]);
  setShowEchoInput(false);
  setEchoText('');

  const newVal = balances[col] - 1;
  setBalances(prev => ({ ...prev, [col]: newVal }));
  await supabase.from('profiles').update({ [col]: newVal }).eq('id', session.user.id);
};

  // FIX TOUCH — botones ignorados para no encimar videos
  const handleTouchStart=(e)=>{if(e.target.closest('button'))return;touchStart.current=e.targetTouches[0].clientX;};
  const handleTouchMove =(e)=>{if(e.target.closest('button'))return;touchEnd.current=e.targetTouches[0].clientX;};
  const handleTouchEnd  =()=>{
    if(!touchStart.current||!touchEnd.current)return;
    const d=touchStart.current-touchEnd.current;
    if(d>70)setCurrentIndex(p=>p+1);
    if(d<-70)setCurrentIndex(p=>p>0?p-1:0);
    touchStart.current=0;touchEnd.current=0;
  };

  const isTvMode=currentUser&&(currentUser.isTv||currentUser.is_tv);
  const portalTransform=`scale(${visorScale})`; // visor fijo, sin paralaje

  const neonColors=[
    {border:'border-cyan-400',   text:'text-cyan-400',   glow:'shadow-[0_0_10px_rgba(34,211,238,0.5)]' },
    {border:'border-fuchsia-500',text:'text-fuchsia-400',glow:'shadow-[0_0_10px_rgba(217,70,239,0.5)]' },
    {border:'border-emerald-400',text:'text-emerald-400',glow:'shadow-[0_0_10px_rgba(52,211,153,0.5)]' },
    {border:'border-violet-500', text:'text-violet-400', glow:'shadow-[0_0_10px_rgba(139,92,246,0.5)]' }
  ];
  
  const LiquidSVGFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <filter id="liquid-border" x="-20%" y="-20%" width="140%" height="140%">
        {/* Genera el ruido orgánico animado */}
        <feTurbulence
          id="turbulence"
          type="turbulence"
          baseFrequency="0.018 0.022"
          numOctaves="3"
          seed="2"
          result="noise"
        >
          {/* La animación cambia el seed continuamente → olas vivas */}
          <animate
            attributeName="baseFrequency"
            values="0.018 0.022; 0.025 0.015; 0.018 0.022"
            dur="6s"
            repeatCount="indefinite"
          />
        </feTurbulence>

        {/* Desplaza los píxeles del borde según el ruido */}
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="10"
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />

        {/* Recorta para que el efecto solo viva en el borde,
            no distorsione el contenido interior del visor */}
        <feComposite in="displaced" in2="SourceGraphic" operator="atop" />
      </filter>
    </defs>
  </svg>
);


  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden select-none font-mono">
      <style>{FOREST_STYLES}</style>

      {/* 1. FONDO  */}
      {bgVideoUrl && (
        <div className="absolute inset-0 z-[1] transition-transform duration-300 ease-out will-change-transform" >
          <video
          key={bgVideoUrl}
          ref={bgVideoRef}
            src={bgVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

   {/* 2. ECOS FLOTANTES — MÁXIMO 3, OSCUROS, CON EMOJI */}
<div className="absolute inset-0 z-[10] pointer-events-none">
  {floatingEcos.map((echo) => {
    const isPay = echo.currency === 'pay';
    const borderColor = isPay ? 'border-blue-400' : 'border-blue-500';
    const shadowColor = isPay ? 'shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'shadow-[0_0_15px_rgba(245,158,11,0.4)]';
    const textColor   = isPay ? 'text-cyan-400' : 'text-amber-400';
    const emojiId = echo.eco_emoji_id || 1; 

    return (
      <div key={echo.id}
           className="absolute animate-spirit text-center pointer-events-none z-[40]"
           style={{ left: `${echo.x}%`, top: `${echo.y}%` }}>
        
        <div className={`
          flex items-center gap-4 
          px-5 py-3 rounded-2xl bg-slate-900/75 /* Fondo muy oscuro, puntas redondeadas modernas */
          border-[1.5px] ${borderColor} ${shadowColor}
          max-w-[280px] md:max-w-[360px] font-sans /* Fuente moderna */
        `}>
          
          <img 
            src={`/emojis/emoji_${emojiId}.webp`} /* Asumiendo que los metiste en images */
            alt="eco" 
            className="w-[55px] h-[55px] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] flex-shrink-0" 
          />

          <div className="flex flex-col text-left overflow-hidden">
            <span className={`text-[10px] md:text-[12px] uppercase tracking-widest font-black ${textColor}`}>
              {echo.author_alias}
            </span>
            <span className="text-[12px] md:text-[14px] leading-snug font-bold text-white line-clamp-2">
              "{echo.text}"
            </span>
          </div>

        </div>
      </div>
    );
  })}
</div>

{/* HYPER ZAP — Versión "Wide" con Botón Barra Dorada */}
<div className="pointer-events-none">
  {floatingHyperZaps.map((echo) => {
    const displayText = echo.text.length > 90 ? echo.text.substring(0, 87) + "..." : echo.text;

    return (
      <div key={echo.id}
           className="fixed animate-spirit text-left z-[60] pointer-events-auto cursor-pointer group"
           style={{ left: `${echo.x}%`, top: `${echo.y}%` }}
           onClick={() => {
             const adv = videoUsers.find(u => u.id === echo.advertiser_id);
             if (adv) {
               displayUsers.splice(currentIndex + 1, 0, { ...adv, id: `zap_${Date.now()}`, is_zap: true });
               setCurrentIndex(currentIndex + 1);
             } else setCurrentIndex(0);
           }}>
        
        <div className="
          flex flex-col items-stretch gap-1.5
          px-5 py-2 rounded-[1.2rem] 
          bg-black/75 backdrop-blur-xl 
          border border-white/50 
          shadow-[0_15px_40px_rgba(0,0,0,0.8)]
          max-w-[220px] md:max-w-[340px] 
          whitespace-normal break-words
          relative overflow-hidden
        ">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

          <span className="text-[12px] md:text-[12px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black text-[#FFD700] border-b border-black/30 pb-1 w-full flex items-center justify-center gap-1"
                style={{ textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 0px 4px 6px rgba(0,0,0,0.8)' }}>
            <span className="animate-pulse">🔔___</span>  {echo.author_alias || 'SPONSOR'}___🔔
          </span>

          <span className="text-[13px] md:text-[15px] leading-snug font-black italic text-white w-full text-left px-1"
                style={{ textShadow: '3px 3px 0px #000, 4px 4px 0px rgba(0,0,0,0.9), -1px -1px 0px #000, 0px 4px 8px rgba(0,0,0,0.8)' }}>
            "{displayText}"
          </span>

          <div className="
            mt-1 w-full py-[3px] rounded-full flex justify-center items-center
            bg-gradient-to-r from-amber-400 to-yellow-600
            border-[1.5px] border-black
            shadow-[0_4px_10px_rgba(0,0,0,0.8)]
            group-hover:scale-[1.02] transition-transform
          ">
            <span className="text-[9px] md:text-[11px] text-black font-black tracking-[0.4em] uppercase pt-[1px]">
              ENTRAR ▶
            </span>
          </div>
        </div>
      </div>
    );
  })}
</div>

      {/* 3. VÓRTICE GEMAS */}
      {activeReaction&&(
        <div className="fixed bottom-4 right-[15%] z-[100] pointer-events-none animate-vortex">
          {/* ... (código del vórtice intacto) ... */}
          {(()=>{
            const pal=[
              {primary:"#00127A",secondary:"#006AED",glow:"rgba(59,130,246,0.6)"},
              {primary:"#FF007D",secondary:"#f472b6",glow:"rgba(236,72,153,0.6)"},
              {primary:"#00FF48",secondary:"#00FFF2",glow:"rgba(16,185,129,0.6)"},
              {primary:"#4D00FA",secondary:"#7C4FFF",glow:"rgba(139,92,246,0.6)"},
              {primary:"#facc15",secondary:"#FFFF00",glow:"rgba(250,204,21,0.6)"},
              {primary:"#CF0000",secondary:"#F70C0C",glow:"rgba(239,68,68,0.6)"},
              {primary:"#00E1FF",secondary:"#61C8FF",glow:"rgba(6,182,212,0.6)"}
            ];
            const c=pal[Math.floor(Math.random()*pal.length)];
            return(
              <div className="relative flex flex-col items-center" style={{mixBlendMode:'screen'}}>
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute w-48 h-48 rounded-full blur-[40px] opacity-60 animate-energy-pulse" style={{background:c.glow}}/>
                  <div className="absolute w-40 h-40 animate-spin-vortex"><div className="w-full h-full rounded-full opacity-90" style={{background:`conic-gradient(from 0deg,${c.primary},${c.secondary},transparent 40%,${c.primary} 60%,transparent 80%,${c.secondary})`,filter:'blur(4px)'}}/></div>
                  <div className="absolute w-32 h-32 animate-spiral-counter"><div className="w-full h-full rounded-full opacity-90" style={{background:`conic-gradient(from 180deg,transparent,${c.secondary} 30%,transparent 50%,${c.primary} 70%,transparent)`,filter:'blur(3px)'}}/></div>
                  <div className="absolute w-36 h-36 rounded-full animate-spin-vortex" style={{border:`4px solid ${c.secondary}`,opacity:0.7,filter:'blur(1px)',animationDuration:'2s'}}/>
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full blur-[20px] opacity-80 animate-energy-pulse" style={{background:c.primary}}/>
                    <div className="absolute w-16 h-16 rounded-full" style={{background:`radial-gradient(circle,white 20%,${c.secondary} 50%,${c.primary} 100%)`,boxShadow:`0 0 40px ${c.glow},0 0 80px ${c.glow},0 0 120px ${c.glow},0 0 160px ${c.glow}`}}/>
                    <div className="absolute w-6 h-6 bg-white rounded-full blur-[2px] shadow-[0_0_20px_white,0_0_40px_white]"/>
                  </div>
                  {[0,1,2,3].map(i=><div key={i} className="absolute w-2 h-24 animate-flare" style={{background:`linear-gradient(to bottom,${c.secondary},transparent)`,transform:`rotate(${i*90}deg)`,transformOrigin:'center',filter:'blur(2px)',animationDelay:`${i*0.5}s`}}/>)}
                  {[0,1,2,3,4,5].map(i=><div key={`p${i}`} className="absolute animate-particle-orbit" style={{animationDelay:`${i*0.3}s`}}><div className="w-2 h-2 rounded-full blur-[1px]" style={{background:i%2===0?c.primary:c.secondary}}/></div>)}
                </div>
                <div className="absolute inset-0 w-48 h-48 -left-6 -top-6">
                  {[...Array(10)].map((_,i)=><div key={`f${i}`} className="absolute animate-particle-orbit" style={{left:`${20+Math.random()*60}%`,top:`${20+Math.random()*60}%`,animationDelay:`${Math.random()*2}s`,animationDuration:`${2+Math.random()*2}s`}}><div className="w-1 h-1 rounded-full blur-[1px]" style={{background:c.secondary}}/></div>)}
                </div>
              </div>
            );
          })()}
        </div>
      )}

     {/* 4. VISOR PORTAL — */}
      {/* =====================================================
          BOTONES ORBIT y MUTE
          FIX: completamente FUERA del div con handlers touch.
          Usan posicionamiento fixed+transform para seguir al visor.
          ===================================================== */}
      <div
        className={`absolute pointer-events-none transition-all duration-500 ease-in-out ${isAccordionOpen ? 'opacity-0 z-[10] pointer-events-none' : 'opacity-100 z-[200]'}`}
        style={{
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
                {/* Ancho igual al visor para que los botones se alineen a sus lados */}
        <div className="relative w-[62vw] md:w-[470px]" style={{height:0}}>
          {/* MUTE — izquierda del visor */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsMuted(p => !p); }}
            className="absolute pointer-events-auto bg-black/60 backdrop-blur-md p-3 rounded-full text-lg border border-white/20 hover:bg-white/20 transition-all"
            style={{ left: '-60px', top: '340px' }}>
            {isMuted ? '🔇' : '🔊'}
          </button>
          {/* ORBIT — derecha del visor */}
          <button
            onClick={handleOrbitar}
            className={`absolute pointer-events-auto p-3 rounded-full border transition-all ${
              isOrbitando
                ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_10px_cyan]'
                : 'bg-black/60 backdrop-blur-md border-white/20 hover:bg-white/20'
            }`}
            style={{ right: '-60px', top: '340px' }}>
            {isOrbitando ? '☄️' : '🛸'}
          </button>
        </div>
      </div>

      {/* =====================================================
          4. VISOR PORTAL — handler touch SOLO aquí
          FIX: pointer-events-none en el contenedor de posición,
          pointer-events-auto EXPLÍCITO en los controles internos.
          ===================================================== */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute top-[45%] md:top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20] pointer-events-none"
        style={{ perspective: '2000px' }}>

        {/* ORBE ANTERIOR */}
        <div
          className="hidden md:block absolute z-[110] cursor-pointer group orb-float pointer-events-auto"
          style={{ left: '-130px', bottom: '-40px' }}
          onClick={() => setCurrentIndex(p => p > 0 ? p - 1 : displayUsers.length - 1)}>
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center relative orb-glow transition-transform group-hover:scale-110 ${config.colors[0]}`}
            style={{ color: 'currentColor' }}>
            <div className="absolute inset-0 bg-current opacity-20 blur-xl rounded-full" />
            <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-spin-slow" />
            <span className="text-3xl font-black text-white relative z-10 pb-1">‹</span>
          </div>
        </div>

        {/* ORBE SIGUIENTE */}
        <div
          className="hidden md:block absolute z-[110] cursor-pointer group orb-float pointer-events-auto"
          style={{ right: '-130px', bottom: '-40px', animationDelay: '1.5s' }}
          onClick={() => setCurrentIndex(p => p + 1)}>
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center relative orb-glow transition-transform group-hover:scale-110 ${config.colors[0]}`}
            style={{ color: 'currentColor' }}>
            <div className="absolute inset-0 bg-current opacity-20 blur-xl rounded-full" />
            <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-spin-reverse" />
            <span className="text-3xl font-black text-white relative z-10 pb-1">›</span>
          </div>
        </div>

        {/* VISOR */}
        <div
          className="relative w-[62vw] aspect-[9/16] md:w-auto md:h-[82vh] md:max-h-[950px] md:aspect-[9/16] flex items-center justify-center overflow-visible"
          style={{ transformStyle: 'preserve-3d' }}>
          <div
            className="relative w-full h-full z-[10]"
            style={{ transform: portalTransform, transformStyle: 'preserve-3d' }}
            onDoubleClick={() => setVisorScale(1)}>
            <div className="relative w-full h-full rounded-[3.5rem] overflow-hidden visor-border bg-black flex items-center justify-center">

              {isTvMode && (
                <div className="absolute inset-0 z-0 opacity-30 blur-[60px] scale-150 pointer-events-none bg-gradient-to-t from-blue-900 via-purple-900 to-pink-900" />
              )}

              <video
                ref={videoRef}
                poster={currentUser.poster || ""}
                autoPlay
                loop={!isTvMode}
                playsInline
                className={`relative z-10 transition-all duration-700 ${isTvMode ? 'w-full h-auto aspect-video object-contain bg-black' : 'w-full h-full object-cover'}`}
                onTimeUpdate={() =>
                  videoRef.current &&
                  setProgress((videoRef.current.currentTime / (videoRef.current.duration || 100)) * 100)
                }
              />

              {/* =====================================================
                  CONTROLES: pointer-events-auto EXPLÍCITO
                  Sin esto, el pointer-events-none del padre los bloquea.
                  ===================================================== */}
              {!isTvMode && (
                <div className="absolute bottom-0 left-0 w-full z-[150] px-4 pb-3 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto">
                  {/* BARRA DE PROGRESO */}
                  <div
                    className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-3 group"
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      if (videoRef.current)
                        videoRef.current.currentTime = pos * videoRef.current.duration;
                    }}>
                    <div
                      className={`h-full rounded-full transition-all duration-100 group-hover:h-[5px] ${config.reactionColor === 'orange' ? 'bg-orange-500' : 'bg-cyan-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {/* PLAY/PAUSE */}
                  <div className="flex justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (videoRef.current) {
                          if (videoRef.current.paused) { videoRef.current.play(); setIsPaused(false); }
                          else { videoRef.current.pause(); setIsPaused(true); }
                        }
                      }}
                      className="bg-black/50 border border-white/20 backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
                      {isPaused ? '▶' : '⏸'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>


      {/* ── ACORDEÓN TÍTULO/DESC — flotante arriba ── */}
      {videoTitulo && (
        <div className="absolute top-4 right-4 z-[110] pointer-events-auto flex flex-col items-start w-72">
          <button
            onClick={() => setAcordeonAbierto(prev => !prev)}
            className="flex items-center gap-3 px-4 py-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/10 transition-all w-full">
            <span className="text-white/80 text-xs font-black uppercase tracking-widest flex-1 text-left truncate">
              {videoTitulo}
            </span>
            <span className={`text-white/50 text-sm transition-transform duration-300 ${acordeonAbierto ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {acordeonAbierto && (
            <div className="mt-1 w-full px-5 py-5 bg-slate-950/80 backdrop-blur-md border border-slate-700/30 rounded-2xl overflow-y-auto max-h-[40vh]">
              <p style={{ fontFamily: 'Georgia, serif' }}
                className="text-white text-xl font-bold leading-snug mb-3">
                {videoTitulo}
              </p>
              {videoDesc && (
                <p style={{ fontFamily: 'Georgia, serif' }}
                  className="text-white/70 text-base italic leading-relaxed">
                  {videoDesc}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. NUEVO FOOTER: SOMBREADO + BOTONES + CREADOR */}
      {/* Añadimos pointer-events-none al contenedor general, pero auto a los botones para que los clics funcionen sin bloquear la pantalla */}
      <div className="absolute bottom-0 left-0 w-full flex flex-col md:flex-row justify-between items-center md:items-end px-4 py-6 md:px-[10%] md:py-8 z-[150] pointer-events-none bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        
        {/* IZQUIERDA: Botonera */}
        <div className="flex items-center justify-center gap-3 w-full md:w-auto pointer-events-auto mb-4 md:mb-0">
          <button onClick={()=>handleAction('reaction')} className="px-5 py-3 md:py-4 bg-white text-black border border-white rounded-xl text-[9px] md:text-[11px] font-black uppercase shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform">
            ✨ HALO
          </button>
          <button 
  		onClick={() => { if(currentUser) onOpenProfile({ ...currentUser, _savedIndex: currentIndex }); }} 
  		className="px-5 py-3 md:py-4 bg-black text-white border-2 border-[#bf00ff] rounded-xl text-[9px] md:text-[11px] font-black 		uppercase shadow-[0_0_15px_rgba(191,0,255,0.6),inset_0_0_8px_rgba(191,0,255,0.4)] hover:scale-105 transition-all animate-		pulse">
  		<span className="drop-shadow-[0_0_8px_rgba(191,0,255,0.9)]">☝️ TELEFONO CASA</span>
	</button>
          <button onClick={()=>setShowEchoInput(true)} className="px-6 py-3 md:py-4 bg-black/90 border border-white/20 text-white rounded-xl text-[9px] md:text-[11px] font-black uppercase hover:bg-white/10 transition-colors">
            💬 ECO
          </button>
        </div>

      {/* DERECHA: Nombre / Alias */}
<div className="relative pointer-events-auto bg-black/40 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
  
  {/* LA ÓRBITA DEL COMETA (Solo visible si isOrbitando es true) */}
  {isOrbitando && (
      <div className="orbita-cometa-container z-0">
          <div className="orbita-trazo"></div>
          <div className="orbita-cabeza"></div>
      </div>
  )}

  {/* TU TEXTO ORIGINAL RECUPERADO (con relative y z-10 añadidos) */}
  <p className={`relative z-10 text-[10px] md:text-[12px] font-black tracking-[0.4em] uppercase ${config.labelClass} drop-shadow-lg text-center`}>
    {config.labelText} <span className="text-white/40 mx-2">//</span> {currentUser?.alias || 'ANÓNIMO'}
  </p>
</div>     

{/* NUEVO HISTORIAL / ACORDEÓN (Gigante, Transparente y Moderno) */}
<div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-[95vw] md:w-[800px] z-[300] pointer-events-auto flex flex-col items-center font-moderna">
  
  {isAccordionOpen && (
    <div 
      className="w-full h-[450px] mb-2 rounded-2xl border border-white/30 overflow-y-auto bro-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.95)] flex flex-col gap-3 p-4 relative"
    >
      {/* Fondo Galáctico Fijo (se coloca como img absoluta para no afectar opacidades hijas) */}
      <img src="/images/galaxy_bg.webp" alt="galaxia" className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 pointer-events-none" />
      
      {/* Contenedor de Ecos (z-10 para estar sobre la galaxia) */}
      <div className="relative z-10 flex flex-col gap-3 w-full">
        {visualEchos.filter(echo => !echo.is_sponsored).map((echo, i) => {
          const isInferno = echo.is_inferno; 
          // AQUÍ ESTÁ LA MAGIA: bg-black/40 (muy transparente) y SIN backdrop-blur
          const bgRow = isInferno ? 'bg-red-950/50 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-black/40 border-white/10 hover:bg-black/60 transition-colors';
          const emojiId = echo.eco_emoji_id || 1;

          return (
            <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${bgRow}`}>
              <img src={`/emojis/emoji_${emojiId}.webp`} alt="eco" className="w-[75px] h-[75px] flex-shrink-0 drop-shadow-md" />
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center w-full mb-1">
                  <span className={`text-[12px] md:text-[14px] font-black uppercase tracking-widest ${isInferno ? 'text-red-400' : 'text-cyan-400'}`}>
                    @{echo.author_alias}
                  </span>
                  {isInferno && <span className="text-[10px] md:text-[12px] font-black text-red-500 animate-pulse drop-shadow-md">🔥 INFIERNO</span>}
                </div>
                <p className="text-[14px] md:text-[16px] text-white/95 font-semibold leading-relaxed mt-1 tracking-wide">
                  {echo.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

    {/* ── BADGE TIPO — encima del historial de Ecos ── */}
    {videoTipo && (
      <div className="mb-2 flex justify-center">
        {videoTipo === 'original' && (
          <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            ✦ Original
          </span>
        )}
        {videoTipo === 'publicidad' && (
          <span className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            📢 Publicidad
          </span>
        )}
        {videoTipo === 'ia' && (
          <span className="bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            🤖 Hecho con IA
          </span>
        )}
      </div>
    )}

  <button 
    onClick={() => setIsAccordionOpen(!isAccordionOpen)}
    className="px-8 py-2.5 bg-black/95 backdrop-blur-md border border-white/30 rounded-t-2xl text-[12px] md:text-[14px] font-black text-white/80 tracking-[0.3em] hover:text-white hover:bg-white/10 hover:border-cyan-400 transition-all uppercase shadow-[0_-5px_25px_rgba(0,0,0,0.6)]"
  >
    {isAccordionOpen ? '▼ CERRAR HISTORIAL ▼' : '▲ VER HISTORIAL DE ECOS ▲'}
  </button>
</div>


      </div>
      

      {/* ══ MODAL ECO ══ */}
{showEchoInput && (
  <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto">
    <div className="w-full max-w-md text-center flex flex-col items-center my-auto">
    
      {/* MENSAJE DE REGLAS ANTI-SPAM BROVISION (Intacto) */}
      <div className="my-3 p-4 border border-white/60 bg-red-950/80 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.5)] font-sans text-center backdrop-blur-md">
        <h3 className="mb-3 text-yellow-400 font-extrabold uppercase tracking-wider text-lg flex items-center justify-center gap-2 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
          <span>⚠️</span> REGLAS DE ECOS Y ZAPS <span>⚠️</span>
        </h3>
        <p className="mb-3 text-white/95 text-sm md:text-base leading-relaxed">
          <span className="text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.6)]">Eco</span> y <span className="text-fuchsia-400 font-bold drop-shadow-[0_0_5px_rgba(232,121,249,0.6)]">Zap</span> son herramientas de interacción y promoción <b className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">interna</b> de tu Canal.
          <br/>
          <b className="text-yellow-300">Respeto Mutuo:</b> NO se toleran insultos ni actitudes irrespetuosas.
          <br/>
          <b className="text-red-400">Cero Marcas:</b> NO publicidad comercial directa con precios. Ejemplos ZAP:
        </p>

        {/* BOTONES DE EJEMPLO APILADOS */}
        <div className="flex flex-col gap-2 w-full px-2 max-w-lg mx-auto">
          <div className="bg-black/70 border border-emerald-500/60 py-2 px-3 rounded-lg text-emerald-400 text-sm md:text-base font-semibold shadow-[0_0_12px_rgba(16,185,129,0.2)] flex items-center gap-3 text-left">
            <span className="text-xl drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">✅</span> 
            <span className="leading-tight">"Te muestro la nueva afeitadora en mi canal"</span>
          </div>
          <div className="bg-black/70 border border-red-500/60 py-2 px-3 rounded-lg text-red-400 text-sm md:text-base font-semibold shadow-[0_0_12px_rgba(239,68,68,0.2)] flex items-center gap-3 text-left">
            <span className="text-xl drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">❌</span> 
            <span className="leading-tight">"Oferta afeitadora 15 euros, entra a mi tienda"</span>
          </div>
        </div>
      </div> 
    
      {/* SELECTOR 1: TIPO DE MENSAJE (ECO vs ZAP) - Altura reducida */}
      <div className="flex gap-3 mb-3 justify-center w-full max-w-md mx-auto px-2">
        <button 
          onClick={() => setEchoType('text')} 
          className={`flex-1 py-2 md:py-3 rounded-xl text-base md:text-xl font-black border tracking-widest transition-all duration-300 flex items-center justify-center gap-2
          ${echoType === 'text' 
            ? 'bg-fuchsia-500 text-black border-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.7)] scale-[1.02] z-10' 
            : 'bg-black/40 text-fuchsia-400/60 border-fuchsia-500/30 hover:border-fuchsia-400/80 hover:text-fuchsia-300 hover:shadow-[0_0_10px_rgba(217,70,239,0.3)]'
          }`}
        >
          <span className="text-xl md:text-2xl">💬</span> ECO
        </button>

        <button 
          onClick={() => setEchoType('hyper')} 
          className={`flex-1 py-2 md:py-3 rounded-xl text-base md:text-xl font-black border tracking-widest transition-all duration-300 flex items-center justify-center gap-2
          ${echoType === 'hyper' 
            ? 'bg-yellow-400 text-black border-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.9)] scale-[1.05] z-10' 
            : 'bg-black/40 text-yellow-500/60 border-yellow-500/30 hover:border-yellow-400/80 hover:text-yellow-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]'
          }`}
        >
          <span className="text-xl md:text-2xl">🐬</span> ZAP
        </button>
      </div>
      
      {/* SELECTOR 2: VARIANTE DE MONEDA (PAY vs GEN) - EN UNA SOLA LÍNEA */}
      <div className="flex gap-3 mb-4 justify-center w-full max-w-md mx-auto px-2">
        <button
          onClick={() => setEcoVariant('pay')}
          className={`flex-1 py-2 rounded-xl text-sm md:text-base font-black border tracking-widest transition-all duration-300 flex items-center justify-center gap-2
          ${ecoVariant === 'pay' 
            ? 'bg-cyan-400 text-black border-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.8)] scale-[1.02] z-10' 
            : 'bg-cyan-950/40 text-cyan-400 border-cyan-500/40 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]'
          }`}
        >
          <span className="flex items-center gap-1.5 uppercase">
            <span className="text-lg md:text-xl drop-shadow-md">💰</span> PAY
          </span>
          <span className="opacity-40">|</span>
          <span className={`text-xs md:text-sm font-bold tracking-wider ${ecoVariant === 'pay' ? 'text-black/80' : 'text-cyan-400/80'}`}>
            DISP: {echoType === 'hyper' ? balances?.zap_p ?? 0 : balances?.eco_p ?? 0}
          </span>
        </button>

        <button
          onClick={() => setEcoVariant('gen')}
          className={`flex-1 py-2 rounded-xl text-sm md:text-base font-black border tracking-widest transition-all duration-300 flex items-center justify-center gap-2
          ${ecoVariant === 'gen' 
            ? 'bg-orange-500 text-black border-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.7)] scale-100 z-10' 
            : 'bg-orange-950/30 text-orange-500/60 border-orange-500/30 hover:border-orange-400/80 hover:text-orange-400'
          }`}
        >
          <span className="flex items-center gap-1.5 uppercase">
            <span className="text-lg md:text-xl drop-shadow-md">🌱</span> GEN
          </span>
          <span className="opacity-40">|</span>
          <span className={`text-xs md:text-sm font-bold tracking-wider ${ecoVariant === 'gen' ? 'text-black/80' : 'text-orange-500/80'}`}>
            DISP: {echoType === 'hyper' ? balances?.zap_gen ?? 0 : balances?.eco_gen ?? 0}
          </span>
        </button>
      </div>

      {/* SELECTOR DE EMOJIS - Emojis ligeramente más grandes */}
      <div className="flex justify-center gap-2 mb-4 w-full max-w-md mx-auto px-2">
        {[1, 2, 3, 4, 5, 6, 7].map((id) => (
          <button
            key={id}
            onClick={() => setSelectedEmoji(id)}
            className={`relative w-[45px] h-[45px] md:w-[55px] md:h-[55px] rounded-full transition-all duration-300 flex-shrink-0
              ${selectedEmoji === id
                ? 'scale-125 z-10 shadow-[0_0_15px_rgba(34,211,238,0.8)] border-2 border-cyan-400 bg-black/60'
                : 'opacity-50 hover:opacity-100 hover:scale-110 border border-transparent'
              }`}
          >
            <img
              src={`/emojis/emoji_${id}.webp`} 
              alt={`Emoji ${id}`}
              className="w-full h-full object-cover drop-shadow-md"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      
      {/* INPUT - Menos padding vertical para ahorrar espacio */}
      <input 
        autoFocus 
        type="text" 
        placeholder={echoType==='hyper'?'TÍTULO DEL ANUNCIO...':'ESCRIBE TU ECO O ZAP...'}
        className="w-full bg-transparent border-b-2 border-white/20 py-3 text-center text-white outline-none font-black text-xl md:text-2xl uppercase focus:border-fuchsia-400 transition-colors"
        value={echoText} 
        onChange={e=>setEchoText(e.target.value)} 
        onKeyDown={e=>e.key==='Enter'&&handleAction('echo')} 
        maxLength={60}
      />
      
      {/* BOTÓN EMITIR - Margen superior muy reducido (mt-16 a mt-6) */}
      <button 
        onClick={()=>handleAction('echo')} 
        className="w-full max-w-[280px] py-3 rounded-2xl font-black text-[14px] tracking-widest uppercase transition-all shadow-xl bg-fuchsia-600 text-white mt-6 mb-4 hover:bg-fuchsia-500"
      >
        EMITIR
      </button>

      {/* BOTÓN VOLVER - Ahora sí se verá sin tener que hacer zoom out */}
      <button 
        onClick={()=>setShowEchoInput(false)} 
        className="text-gray-500 text-[12px] font-black uppercase tracking-widest hover:text-white transition-colors"
      >
        [ VOLVER ]
      </button>
      
    </div>
  </div>
)}

            
    </div>
  );
};

export default BioForest;