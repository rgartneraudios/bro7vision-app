// src/components/BioForest.jsx
// VERSIÓN COMPLETA: Nihilanth + Fix Audio + Fix Touch + Ecos completos + Hyper Zap

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { TV_NODES } from '../data/TvDatabase';
import Hls from 'hls.js';

const FOREST_STYLES = `
    @keyframes spiritFade {
        0% { opacity: 0; transform: translateY(15px); filter: blur(5px); }
        8% { opacity: 1; transform: translateY(0); filter: blur(0px); }
        85% { opacity: 1; transform: translateY(-12px); filter: blur(0px); }
        100% { opacity: 0; transform: translateY(-35px); filter: blur(10px); }
    }
    
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
    {x:5,y:25},{x:7,y:50},{x:80,y:75},
    {x:62,y:10},{x:75,y:25},{x:75,y:70},
    {x:15,y:3},{x:80,y:3},{x:75,y:70},
];
const MOBILE_SLOTS = [{x:5,y:75}, {x:50,y:75}];

// HYPER ZAP — zonas derecha, para no pisarse
const HYPER_PC_SLOTS = [
  {x:72,y:15},{x:75,y:40},{x:75,y:55},
  {x:78,y:28},{x:23,y:55},{x:16,y:70},
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
  
  useEffect(() => {
  if (savedUserIndex) setCurrentIndex(savedUserIndex);
}, []);
  
  // TEMPORAL — quitar en producción
const [tickerEchos, setTickerEchos] = useState([
  { id: 1, text: 'vaya tela lo que hay que oír', author_alias: 'anonx77' },
  { id: 2, text: 'no coincido en nada, en nada eh', author_alias: 'critixx' },
  { id: 3, text: 'uff brutal pero pa mal', author_alias: 'user4421' },
]);
  
  const videoRef = useRef(null);
  const bgVideoRef = useRef(null);
  const hlsRef = useRef(null);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const displayUsers = useMemo(() => {
    // 1. Tomamos los usuarios que vienen de App.jsx (Aquí ya vendrán Lap_Steel, Bro Master, etc. desde MASTER_DB)
    const safeUsers = videoUsers?.length > 0 ? videoUsers : [];
    
    // 2. Los juntamos con los nodos de TV (Si también quieres pasar los TV_NODES al MASTER_DB en el futuro, ¡sería aún mejor!)
    const combined = [...safeUsers, ...TV_NODES];

    // 3. 🛡️ ESCUDO ANTI-ERRORES: Si por algún motivo la base de datos tarda en cargar y el array está vacío, 
    // ponemos un "fantasma" para que el carrusel (currentIndex % length) no dé error matemático (0 dividido entre 0).
    if (combined.length === 0) {
      return [{ id: 'loading_01', alias: 'SINTONIZANDO...', video_file: '' }];
    }

    return combined;
  }, [videoUsers]); // Ya no dependemos de nada interno, solo de lo que nos pasen.
  
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
  
  const getTimeSuffix = () => { 
  const h = new Date().getHours(); 
  if(h >= 5  && h < 11) return '1';  // 05-11
  if(h >= 11 && h < 17) return '2';  // 11-17
  if(h >= 17 && h < 23) return '3';  // 17-23
  return '04';                         // 23-05
};

  const config = useMemo(() => {
    const t=getTimeSuffix();
    const v = (n) => `https://pub-57f2bfe6389542fe895a61b50b727921.r2.dev/${n}_${t}.mp4`;
    switch(realityMode){
      case 'solo_earth':   return {video:v('solo_earth'),  colors:['text-emerald-600','text-cyan-300'],  reactionColor:'emerald',labelClass:'text-emerald-600',labelText:'SOLO EARTH',  navColor:'text-emerald-500'};
      case 'band_earth':   return {video:v('band_earth'),  colors:['text-blue-400','text-indigo-300'],   reactionColor:'blue',   labelClass:'text-blue-400',   labelText:'BAND EARTH',  navColor:'text-blue-400'   };
      case 'solo_fantasy': return {video:v('solo_fantasy'),colors:['text-cyan-400','text-fuchsia-400'],  reactionColor:'cyan',   labelClass:'text-cyan-400',   labelText:'SOLO FANTASY',navColor:'text-cyan-400'   };
      case 'band_fantasy': return {video:v('band_fantasy'),colors:['text-fuchsia-500','text-purple-300'],reactionColor:'fuchsia',labelClass:'text-fuchsia-400', labelText:'BAND FANTASY',navColor:'text-fuchsia-500'};
      case 'solo_cinema':  return {video:v('solo_cinema'), colors:['text-amber-500','text-orange-300'],  reactionColor:'amber',  labelClass:'text-amber-500',  labelText:'SOLO CINEMA', navColor:'text-amber-600'  };
      case 'band_cinema':  return {video:v('band_cinema'), colors:['text-orange-400','text-yellow-200'], reactionColor:'orange', labelClass:'text-orange-400', labelText:'BAND CINEMA', navColor:'text-orange-500' };
      default:             return {video:'https://pub-57f2bfe6389542fe895a61b50b727921.r2.dev/eclipse_mode.mp4',colors:['text-cyan-400','text-white'],       reactionColor:'cyan',  labelClass:'text-cyan-400',  labelText:'GENESIS NODE',navColor:'text-cyan-400'  };
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
    setVisualEchos([]);setFloatingEcos([]); // solo resetea Eco Text, los HyperZap sobreviven
  },[currentUser]); // SOLO currentUser

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

  // Fetch ecos completo con Hyper Zap (VERSIÓN LIMPIA SIN AUDIO)
  useEffect(()=>{
    if(!currentUser?.id)return;
    const fetch=async()=>{
      // Comprobamos si es un usuario real (UUID) o de prueba
      const isUUID=/^[0-9a-f]{8}/i.test(currentUser.id);
      
      // 1. Traemos los Anuncios / Hyper Zaps (Visuales)
      const {data:ads} = await supabase.from('bro_echos').select('*').eq('is_sponsored',true).limit(10);
      let finalVisual = ads || [];

      if(isUUID){
        const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
        
        // 2. Traemos los Ecos normales de las últimas 24h
        const {data:userEchos} = await supabase.from('bro_echos').select('*')
          .eq('target_profile_id',currentUser.id).eq('is_sponsored',false)
          .gt('created_at',yesterday.toISOString()).lt('reports_count',3)
          .order('created_at',{ascending:false}).limit(30);
          
        if(userEchos){
          // Filtramos para añadir SOLO los de texto. 
          // (Mantenemos el filtro !audio_link y ![TTS] por si quedaron audios viejos en tu base de datos, para que no rompan la pantalla)
          finalVisual = [...finalVisual, ...userEchos.filter(e => !e.audio_link && !e.text?.includes('[TTS]'))];
        }
      } else {
        // Modo visitante/simulación
        finalVisual = [...finalVisual, {id:'s1', author_alias:'SISTEMA', text:'MODO SIMULACIÓN'}];
      }
      
      // 3. Actualizamos la pantalla SOLO con los ecos visuales
      setVisualEchos(finalVisual);
    };
    
    fetch();
  },[currentUser]);
  
  
  useEffect(()=>{
  if(!visualEchos||visualEchos.length===0)return;
  let slot=0;
  const interval=setInterval(()=>{
    const ads=visualEchos.filter(e=>e.is_sponsored);
    const normals=visualEchos.filter(e=>!e.is_sponsored);
    const mob=window.innerWidth<768;
    const slots=mob?MOBILE_SLOTS:PC_SLOTS;
    const coords = (mob ? MOBILE_SLOTS : PC_SLOTS)[slot % (mob ? MOBILE_SLOTS : PC_SLOTS).length];
    const hyperSlots = mob ? HYPER_MOBILE_SLOTS : HYPER_PC_SLOTS;
    const hyperCoords = hyperSlots[slot % hyperSlots.length];
    slot++;

    // ECO TEXT → se reinicia con el video
    if(normals.length>0){
      const echo=normals[Math.floor(Math.random()*normals.length)];
      setFloatingEcos(prev=>[...prev.slice(-2),{...echo,id:Date.now()+Math.random(),x:coords.x,y:coords.y}]);
    }

    // HYPER ZAP → 25% del tiempo, persiste
    if(Math.random()>0.75){
      const ad=ads.length>0
        ?ads[Math.floor(Math.random()*ads.length)]
        :{id:'SYSTEM_AD',is_sponsored:true,author_alias:'BROVISION TV',text:'🔴 ¿QUIERES VER TV EN VIVO? HAZ CLIC AQUÍ',target_index:0};
      setFloatingHyperZaps(prev=>[...prev.slice(-1),{...ad,id:Date.now()+Math.random(),x:hyperCoords .x,y:hyperCoords .y}]);
    }
  },4500);
  return()=>clearInterval(interval);
},[visualEchos]);
  const handleReport=async(echoId)=>{
    if(!confirm("¿Reportar este mensaje como inapropiado?"))return;
    await supabase.rpc('increment_report',{row_id:echoId});
   alert("Reporte enviado. Gracias por limpiar el bosque.");
setVisualEchos(prev=>prev.filter(e=>e.id!==echoId));
  };

  const handleAction = async (type) => {
  const col = echoType === 'hyper' ? `zap_${ecoVariant}` : `eco_${ecoVariant}`;

  if (type === 'reaction') {
    const myAlias = realUserAlias || 'CIUDADANO';
    setActiveReaction({ from: myAlias });
    setTimeout(() => setActiveReaction(null), 6000);
    return; // 👈 sale aquí, no descuenta nada
  }

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
      {config.video && (
        <div className="absolute inset-0 z-[1] transition-transform duration-300 ease-out will-change-transform" >
          <video 
          ref={bgVideoRef} 
            src={config.video} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
        </div>
      )}  

      {/* 2. ECOS FLOTANTES completos */}
      {/* ECO TEXT — dentro del flujo normal, se reinicia con el video */}
<div className="absolute inset-0 z-[10] pointer-events-none">
  {floatingEcos.map((echo)=>{
    const neon=neonColors[Math.floor(Math.random()*neonColors.length)];
    return (
      <div key={echo.id}
           className="absolute animate-spirit text-center pointer-events-none z-[40]"
           style={{left:`${echo.x}%`,top:`${echo.y}%`}}>
        <p className={`text-[8px] mb-1 uppercase tracking-[0.5em] font-black opacity-80 ${neon.text}`}>
          @{echo.author_alias}
        </p>
        <div className={`border backdrop-blur-none px-7 py-3 rounded-[2.5rem] bg-black/90 border ${neon.border} ${neon.text} ${neon.glow}`}>
          <span className="text-xs md:text-lg">"{echo.text}"</span>
        </div>
        <button onClick={()=>handleReport(echo.id)} className="pointer-events-auto opacity-0 group-hover:opacity-100 absolute -top-4 -right-4 bg-red-600/20 p-2 rounded-full text-[8px] hover:bg-red-600 transition-all">⚠️</button>
      </div>
    );
  })}
</div>

{/* HYPER ZAP — fixed al viewport, NO se reinicia con scroll */}
<div className="pointer-events-none">
  {floatingHyperZaps.map((echo)=>(
    <div key={echo.id}
         className="fixed animate-spirit text-center z-[60] pointer-events-auto cursor-pointer scale-110"
         style={{left:`${echo.x}%`,top:`${echo.y}%`}}
         onClick={()=>{
           const adv=videoUsers.find(u=>u.id===echo.advertiser_id);
           if(adv){displayUsers.splice(currentIndex+1,0,{...adv,id:`zap_${Date.now()}`,is_zap:true});setCurrentIndex(currentIndex+1);}
           else setCurrentIndex(0);
         }}>
      <p className="text-[8px] mb-1 uppercase tracking-[0.5em] font-black text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
        ⚡ HYPER ZAP
      </p>
      <div className="px-5 py-2.5 rounded-[2rem] bg-[#0C0C1C]/50 border border-[#E3DDB1]/30 text-white font-medium shadow-[0_0_20px_rgba(0,0,0,0.9),inset_0_0_10px_rgba(255,215,0,0.05)]">
        <span className="text-xs md:text-base tracking-wide text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">"{echo.text}"</span>
        <div className="mt-2 relative overflow-hidden py-1.5 px-5 rounded-full border border-[#DED590]/50 bg-gradient-to-r from-amber-200/20 via-yellow-300/20 to-amber-100/20 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"/>
          <span className="text-[9px] text-[#FFD700] font-black tracking-[0.3em] uppercase relative z-10">ENTRAR ▶</span>
        </div>
      </div>
    </div>
  ))}
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

     {/* 4. VISOR PORTAL — NIHILANTH */}
      {/* =====================================================
          BOTONES ORBIT y MUTE
          FIX: completamente FUERA del div con handlers touch.
          Usan posicionamiento fixed+transform para seguir al visor.
          ===================================================== */}
      <div
        className="absolute pointer-events-none z-[200]"
        style={{
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
        {/* Ancho igual al visor para que los botones se alineen a sus lados */}
        <div className="relative w-[62vw] md:w-[400px]" style={{height:0}}>
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
          className="relative w-[62vw] aspect-[9/19] md:w-[400px] md:h-[82vh] md:max-h-[950px] md:aspect-auto flex items-center justify-center overflow-visible"
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

{/* INFIERNO TICKER */}
{tickerEchos?.length > 0 && (
  <div className="absolute bottom-[36px] left-1/2 -translate-x-1/2 w-[62vw] md:w-[460px] z-[150] overflow-hidden pointer-events-none">
  {/* FUEGOS ARRIBA */}
  <div className="text-[11px] leading-none tracking-[-2px] opacity-70">
    🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    </div>
    <div className="text-[12px] text-red-500/60 font-black tracking-widest uppercase mb-0.5 px-1">⬇ INFIERNO</div>
    <div className="relative h-[40px] rounded-lg overflow-hidden border border-red-900/40"
         style={{background:'linear-gradient(90deg,#3f0000ee,#1a0000fa,#3f0000ee)'}}>
      <div className="absolute inset-0 flex items-center animate-ticker whitespace-nowrap">
        {[...tickerEchos,...tickerEchos].map((e,i)=>(
          <span key={i} className="text-[12px] text-yellow-300/90 font-mono mx-6">
            "{e.text}" <span className="text-red-300/90">—@{e.author_alias}</span>
            <span className="text-red-900/50 mx-4">//</span>
          </span>
        ))}
      </div>
    </div>
  </div>
)}

      </div>
      

      {/* MODAL ECO (UI Mejorada y Centrada) */}
      {showEchoInput && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-md text-center relative flex flex-col items-center">
            
            <div className="flex gap-4 mb-12 justify-center w-full">
              <button onClick={() => setEchoType('text')} className={`flex-1 max-w-[160px] py-3 rounded-full text-[10px] font-black border tracking-widest transition-all ${echoType === 'text' ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-white/40 border-white/10 hover:text-white/80'}`}>
                💬 ECO
              </button>
              <button onClick={() => setEchoType('hyper')} className={`flex-1 max-w-[160px] py-3 rounded-full text-[10px] font-black border tracking-widest transition-all ${echoType === 'hyper' ? 'bg-[#002366] text-cyan-400 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]' : 'text-white/40 border-white/10 hover:text-white/80'}`}>
                ⚡ ZAP
              </button>
            </div>
            
            {/* SELECTOR GEN / PAY */}
<div className="flex gap-4 mb-8 justify-center w-full">

  <button
    onClick={() => setEcoVariant('pay')}
    className={`flex-1 max-w-[160px] py-3 rounded-full text-[10px] font-black border tracking-widest transition-all ${ecoVariant === 'pay' 
      ? 'bg-cyan-400 text-black border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.7)] scale-105' 
      : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:scale-105'}`}
  >
    ⚡ PAY ({echoType === 'hyper' ? balances?.zap_p ?? 0 : balances?.eco_p ?? 0})
  </button>

  <button
    onClick={() => setEcoVariant('gen')}
    className={`flex-1 max-w-[160px] py-3 rounded-full text-[10px] font-black border tracking-widest transition-all ${ecoVariant === 'gen' 
      ? 'bg-white/20 text-white border-white/40' 
      : 'text-white/30 border-white/10 hover:text-white/50'}`}
  >
    🟢 GEN ({echoType === 'hyper' ? balances?.zap_gen ?? 0 : balances?.eco_gen ?? 0})
  </button>

</div>
            
            <input 
              autoFocus type="text" placeholder={echoType === 'hyper' ? "TÍTULO DEL ANUNCIO..." : "ESCRIBE TU ECO O ZAP..."}
              className="w-full bg-transparent border-b-2 border-white/20 py-6 text-center text-white outline-none font-black text-2xl md:text-3xl uppercase focus:border-cyan-400 transition-colors drop-shadow-lg"
              value={echoText} onChange={e => setEchoText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAction('echo')} maxLength={60}
            />
            
            <div className="mt-16 flex flex-col items-center gap-6 w-full">
              <button onClick={() => handleAction('echo')} className={`w-full max-w-[280px] py-4 rounded-2xl font-black text-[12px] tracking-widest uppercase transition-all shadow-xl hover:scale-105 ${echoType === 'hyper' ? 'bg-cyan-600 text-white border border-cyan-400 shadow-cyan-600/30' : 'bg-white text-black shadow-white/20'}`}>
                {echoType === 'hyper' ? 'EMITIR HYPER ZAP' : 'EMITIR'}
              </button>
              
              <button onClick={() => setShowEchoInput(false)} className="text-gray-500 text-[12px] font-black uppercase tracking-widest hover:text-white transition-colors">
                [ VOLVER ]
              </button>
            </div>

          </div>
        </div>
      )}
            
    </div>
  );
};

export default BioForest;