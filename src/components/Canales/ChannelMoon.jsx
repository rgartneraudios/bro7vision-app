import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { TV_NODES } from '../../data/TvDatabase';

import { getMoonSuffix } from '../../utils/moonUtils';
import { marcarActividad } from '../../hooks/useActividad';
import { getVideoCandidates, resolveVideoFromCandidates, getTurno } from '../../data/citycodes';


// ¡CORREGIDO! Ya no se corta el borde (border-right: none eliminado)
const MOON_STYLES = `
  @keyframes visor-glow-cyan {
    0%,100% { box-shadow: 0 0 20px rgba(34,211,238,0.5), 0 0 60px rgba(34,211,238,0.2), inset 0 0 20px rgba(34,211,238,0.05); }
    50%      { box-shadow: 0 0 40px rgba(34,211,238,0.8), 0 0 100px rgba(34,211,238,0.3), inset 0 0 30px rgba(34,211,238,0.10); }
  }
  .moon-visor {
    border: 2px solid rgba(34,211,238,0.4);
    border-radius: 3.5rem; 
  }
  @keyframes orb-float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
  .animate-orb-float { animation: orb-float 3s ease-in-out infinite; }
  @keyframes pulse-orb {
    0%,100% { box-shadow:0 0 10px currentColor; opacity:0.8; }
    50%      { box-shadow:0 0 30px currentColor,0 0 55px currentColor; opacity:1; }
  }
  .animate-orb-glow { animation: pulse-orb 2s ease-in-out infinite; }
  @keyframes spin-cw  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
  @keyframes spin-ccw { from{transform:rotate(360deg)} to{transform:rotate(0deg)}    }
  .animate-spin-cw  { animation: spin-cw  8s linear infinite; }
  .animate-spin-ccw { animation: spin-ccw 8s linear infinite; }
  @keyframes spiritFade {
    0%   { opacity:0; transform:translateY(15px);  filter:blur(5px);  }
    8%   { opacity:1; transform:translateY(0);     filter:blur(0px);  }
    85%  { opacity:1; transform:translateY(-12px); filter:blur(0px);  }
    100% { opacity:0; transform:translateY(-35px); filter:blur(10px); }
  }
  .animate-spirit { animation: spiritFade 10s ease-in-out forwards; }
  @keyframes shimmer { 100%{transform:translateX(100%)} }
  .animate-shimmer { animation: shimmer 2s infinite; }
  @keyframes vortexRise {
    0%   { transform: translate(80vw,30vh) scale(0.9) rotate(0deg);   opacity:0.8; }
    15%  { transform: translate(30vw,10vh)   scale(1.3) rotate(90deg);              }
    70%  { transform: translate(-70vw,-15vh)  scale(1.2) rotate(450deg);             }
    80%  { transform: translate(-55vw,-80vh)   scale(0.9) rotate(540deg);             }
    90%  { transform: translate(-75vw,-80vh)   scale(0.9) rotate(540deg);             }
    100% { transform: translate(5vw,-55vh) scale(0.05) rotate(720deg); opacity:0.8;}
  }
  
  @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
.animate-ticker { animation: ticker 25s linear infinite; }
  
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
    
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
    
    .font-moderna { font-family: 'Outfit', sans-serif; }
    
    /* SCROLLBAR NEON (Que ya tenías) */
    .bro-scrollbar::-webkit-scrollbar { width: 6px; }
    .bro-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.6); border-radius: 8px; }
    .bro-scrollbar::-webkit-scrollbar-thumb { background: #00ffff; border-radius: 8px; box-shadow: 0 0 10px #00ffff; }
    .bro-scrollbar::-webkit-scrollbar-thumb:hover { background: #d946ef; }
`;

const PC_SLOTS     = [{x:10,y:6}, {x:4,y:18},{x:6,y:65},{x:30,y:58},{x:75,y:65},{x:75,y:32}];
const MOBILE_SLOTS = [{x:5,y:75}, {x:50,y:75}];

const neonColors = [
  {border:'border-cyan-400',    text:'text-cyan-400',    glow:'shadow-[0_0_10px_rgba(34,211,238,0.5)]'  },
  {border:'border-fuchsia-500', text:'text-fuchsia-400', glow:'shadow-[0_0_10px_rgba(217,70,239,0.5)]' },
  {border:'border-emerald-400', text:'text-emerald-400', glow:'shadow-[0_0_10px_rgba(52,211,153,0.5)]' },
  {border:'border-violet-500',  text:'text-violet-400',  glow:'shadow-[0_0_10px_rgba(139,92,246,0.5)]' },
];

const ChannelMoon = ({ balances, setBalances, session, realityMode, setShow169 }) => {
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [activeReaction,setActiveReaction]= useState(null);
  const [showEchoInput, setShowEchoInput] = useState(false);
  const [echoText,      setEchoText]      = useState('');
  const [realUserAlias, setRealUserAlias] = useState('');
  const [visualEchos,   setVisualEchos]   = useState([]);
  const [floatingEcos, setFloatingEcos] = useState([]);
  const [ecoVariant, setEcoVariant] = useState('pay');
  const [selectedEmoji, setSelectedEmoji] = useState(1);
  const [bgVideoUrl, setBgVideoUrl] = useState('');

  const [proyeccion, setProyeccion] = useState(null);
  const [acordeonAbierto, setAcordeonAbierto] = useState(false);

  useEffect(() => {
    let active = true;
    resolveVideoFromCandidates(getVideoCandidates(2, getMoonSuffix(), getTurno(), 0, null))
      .then(url => { if (active) setBgVideoUrl(url); });
    return () => { active = false; };
  }, []);




  const displayUsers = useMemo(() => {
    const combined = [...TV_NODES];
    return combined.length===0?[{id:'loading_01',alias:'SINTONIZANDO...',video_file:''}]:combined;
  }, []);

  // 1. Definimos el usuario que vemos en pantalla
  const currentUser = useMemo(() => displayUsers[currentIndex % displayUsers.length], [displayUsers,currentIndex]);
  const creatorId = currentUser?.id;

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

  
  useEffect(()=>{
    if(!session?.user?.id)return;
    supabase.from('profiles').select('alias').eq('id',session.user.id).single().then(({data})=>{ if(data?.alias)setRealUserAlias(data.alias); });
  },[session]);

  // Fetch ecos completo (VERSIÓN LIMPIA SIN AUDIO Y SIN LA PALABRA AD)
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
      const normalsList = visualEchos.filter(e => !e.is_sponsored);
      
      const mob = window.innerWidth < 768;
      const coords = (mob ? MOBILE_SLOTS : PC_SLOTS)[slot % (mob ? MOBILE_SLOTS : PC_SLOTS).length];
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
    }, 4500);
    
    return () => clearInterval(interval);
  }, [visualEchos, currentUser]);  
  
  const handleTouchStart=(e)=>{ if(e.target.closest('button'))return; touchStart.current=e.targetTouches[0].clientX; };
  const handleTouchMove =(e)=>{ if(e.target.closest('button'))return; touchEnd.current  =e.targetTouches[0].clientX; };
  const handleTouchEnd  =()=>{
    if(!touchStart.current||!touchEnd.current)return;
    const d=touchStart.current-touchEnd.current;
    if(d>70)setCurrentIndex(p=>p+1); if(d<-70)setCurrentIndex(p=>p>0?p-1:0);
    touchStart.current=0; touchEnd.current=0;
  };

  const handleAction = async (type) => {
  const col = `eco_${ecoVariant}`;

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
    alert(`NECESITAS ECO ${ecoVariant.toUpperCase()}...`);
    return;
  }
  


  const myAlias = realUserAlias || 'CIUDADANO';
  const { data } = await supabase.from('bro_echos').insert([{
    target_profile_id: currentUser.id,
    author_alias: myAlias,
    advertiser_id: session.user.id,
    text: echoText.toUpperCase(),
    is_sponsored: false,
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

  const isTvMode=currentUser&&(currentUser.isTv||currentUser.is_tv);

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden select-none font-mono">
      <style>{MOON_STYLES}</style>

       {/* FONDO */}
       <video src={bgVideoUrl} autoPlay loop muted playsInline
         className="absolute inset-0 w-full h-full object-cover z-[1]"/>
        
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

     {/* 2. ECOS FLOTANTES — MÁXIMO 3, OSCUROS, CON EMOJI */}
<div className="absolute inset-0 z-[10] pointer-events-none">
  {floatingEcos.map((echo) => {
    const isPay = echo.currency === 'pay';
    const borderColor = isPay ? 'border-white-400' : 'border-gray-300';
    const shadowColor = isPay ? 'shadow-[0_0_15px_rgba(167,153,160,0.24)]' : 'shadow-[0_0_15px_rgba(201,176,189,0.24)]';
    const textColor   = isPay ? 'text-gray-500' : 'text-gray-600';
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

     {/* ══ FOOTER PC ══ */}
      <div className="absolute bottom-0 left-0 w-full flex items-center justify-between px-6 py-6 md:px-10 md:py-8 z-[150] pointer-events-none bg-gradient-to-t from-black/90 via-black/50 to-transparent">

        {/* GRUPO IZQUIERDA — nombre + acciones */}
        <div className="flex flex-row items-center gap-3 pointer-events-auto">

          {/* NOMBRE */}
          <div className="relative bg-black/40 backdrop-blur-md px-6 py-3 md:py-4 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
            <p className="relative z-10 text-[10px] md:text-[12px] font-black tracking-[0.4em] uppercase text-gray-300 drop-shadow-lg text-center">
              CANAL LUNA  <span className="text-white/40 mx-2">//</span> {currentUser?.alias||'ANÓNIMO'}
            </p>
          </div>

          <button onClick={()=>handleAction('reaction')} className="px-5 py-3 md:py-4 bg-white text-black border border-white rounded-xl text-[9px] md:text-[11px] font-black uppercase shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform">
            ✨ HALO
          </button>
          <button onClick={()=>setShowEchoInput(true)} className="px-6 py-3 md:py-4 bg-black/90 border border-white/20 text-white rounded-xl text-[9px] md:text-[11px] font-black uppercase hover:bg-white/10 transition-colors">
            💬 ECO
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
    
      {/* SELECTOR DE VARIANTE DE MONEDA (PAY vs GEN) */}
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
            DISP: {balances?.eco_p ?? 0}
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
            DISP: {balances?.eco_gen ?? 0}
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
        placeholder='ESCRIBE TU ECO...'
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

export default ChannelMoon;