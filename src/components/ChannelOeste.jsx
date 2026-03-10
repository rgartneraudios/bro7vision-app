import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { TV_NODES } from '../data/TvDatabase';
import Hls from 'hls.js';

// ¡CORREGIDO! Ya no se corta el borde (border-left: none eliminado)
const OESTE_STYLES = `
  @keyframes visor-glow-fuchsia {
    0%,100% { box-shadow: 0 0 20px rgba(217,70,239,0.5), 0 0 60px rgba(217,70,239,0.2), inset 0 0 20px rgba(217,70,239,0.05); }
    50%      { box-shadow: 0 0 40px rgba(217,70,239,0.8), 0 0 100px rgba(217,70,239,0.3), inset 0 0 30px rgba(217,70,239,0.10); }
  }
  .oeste-visor {
    border: 2px solid rgba(217,70,239,0.4);
    border-radius: 3.5rem;
  }
  @keyframes orb-float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
  .animate-orb-float { animation: orb-float 3s ease-in-out infinite; }
  @keyframes pulse-orb {
    0%,100% { box-shadow:0 0 15px currentColor; opacity:0.8; }
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
    0%   { transform: translate(-80vw,-30vh) scale(0.9) rotate(0deg);    opacity:0.8; }
    15%  { transform: translate(-30vw,0vh)   scale(1.3) rotate(90deg);               }
    70%  { transform: translate(10vw,-35vh)  scale(1.2) rotate(450deg);              }
    80%  { transform: translate(5vw,-75vh)   scale(0.9) rotate(540deg);              }
    100% { transform: translate(-70vw,-60vh) scale(0.05) rotate(720deg); opacity:0.8;}
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
`;

const OESTE_PC_SLOTS     = [{x:35,y:6},{x:48,y:12},{x:52,y:35},{x:70,y:45},{x:68,y:70},{x:6,y:80}];
const OESTE_MOBILE_SLOTS = [{x:6,y:2},{x:45,y:4},{x:25,y:75}];

const neonColors = [
  {border:'border-cyan-400',    text:'text-cyan-400',    glow:'shadow-[0_0_10px_rgba(34,211,238,0.5)]'  },
  {border:'border-fuchsia-500', text:'text-fuchsia-400', glow:'shadow-[0_0_10px_rgba(217,70,239,0.5)]' },
  {border:'border-emerald-400', text:'text-emerald-400', glow:'shadow-[0_0_10px_rgba(52,211,153,0.5)]' },
  {border:'border-violet-500',  text:'text-violet-400',  glow:'shadow-[0_0_10px_rgba(139,92,246,0.5)]' },
];

function loadVideo(videoEl,url,isMuted,hlsRef){
  if(!videoEl||!url)return;
  if(hlsRef.current){hlsRef.current.destroy();hlsRef.current=null;}
  if(url.includes('.m3u8')){
    if(videoEl.canPlayType('application/vnd.apple.mpegurl')){videoEl.src=url;videoEl.muted=isMuted;videoEl.play().catch(()=>{});}
    else if(Hls.isSupported()){const hls=new Hls();hls.loadSource(url);hls.attachMedia(videoEl);hls.on(Hls.Events.MANIFEST_PARSED,()=>{videoEl.muted=isMuted;videoEl.play().catch(()=>{});});hlsRef.current=hls;}
  } else {
    const same=videoEl.src===url||videoEl.src===window.location.origin+url;
    if(!same){videoEl.pause();videoEl.src='';videoEl.load();videoEl.src=url;videoEl.muted=isMuted;videoEl.load();videoEl.play().catch(()=>{});}
  }
}

const ChannelOeste = ({ videoUsers, balances, setBalances, session, realityMode, onOpenProfile, selectedForestUser }) => {
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [isMuted,       setIsMuted]       = useState(false);
  const [progress,      setProgress]      = useState(0);
  const [activeReaction,setActiveReaction]= useState(null);
  const [showEchoInput, setShowEchoInput] = useState(false);
  const [echoType,      setEchoType]      = useState('text');
  const [echoText,      setEchoText]      = useState('');
  const [realUserAlias, setRealUserAlias] = useState('');
  const [visualEchos,   setVisualEchos]   = useState([]);
  const [floatingEchos, setFloatingEchos] = useState([]);

  const videoRefPC  = useRef(null);
  const videoRefMob = useRef(null);
  const bgVideoRef  = useRef(null);
  const hlsRefPC    = useRef(null);
  const hlsRefMob   = useRef(null);
  const touchStart  = useRef(0);
  const touchEnd    = useRef(0);

  const displayUsers = useMemo(()=>{
    const combined=[...(videoUsers?.length>0?videoUsers:[]),...TV_NODES];
    return combined.length===0?[{id:'loading_01',alias:'SINTONIZANDO...',video_file:''}]:combined;
  },[videoUsers]);

  const currentUser=useMemo(()=>displayUsers[currentIndex%displayUsers.length],[displayUsers,currentIndex]);

  const getTimeSuffix = () => {
  const h = new Date().getHours();
  if(h >= 5  && h < 11) return '1';
  if(h >= 11 && h < 17) return '2';
  if(h >= 17 && h < 23) return '3';
  return '4';
};
const BG_VIDEO = `/videos/oeste_bg_${getTimeSuffix()}.mp4`;

  const cleanUrl=(url)=>{
    if(!url)return'';
    let c=url.trim();
    if(c.includes('dropbox.com')){
      c=c.replace('www.dropbox.com','dl.dropboxusercontent.com').replace('dropbox.com','dl.dropboxusercontent.com').replace('?dl=0','').replace('&dl=0','');
      return c.includes('?')?`${c}&raw=1`:`${c}?raw=1`;
    }
    return c;
  };

  useEffect(() => {
    if(!currentUser) return;
    const url = cleanUrl(currentUser.video_file || '');
    const isMobile = window.innerWidth < 768;

    // Al video de PC le pasamos 'true' (silenciado) si estamos en móvil.
    loadVideo(videoRefPC.current, url, isMobile ? true : isMuted, hlsRefPC);
    
    // Al video de Móvil le pasamos 'true' (silenciado) si estamos en PC.
    loadVideo(videoRefMob.current, url, !isMobile ? true : isMuted, hlsRefMob);

    setVisualEchos([]); 
    setFloatingEchos([]);
  }, [currentUser]);
  
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      // Solo permitimos sonido en el reproductor visible
      if (videoRefPC.current)  videoRefPC.current.muted  = isMobile ? true : isMuted;
      if (videoRefMob.current) videoRefMob.current.muted = !isMobile ? true : isMuted;
    };

    // Escuchamos por si giras el móvil o achicas la ventana en PC
    window.addEventListener('resize', handleResize);
    handleResize(); // Aplicar inmediatamente

    return () => window.removeEventListener('resize', handleResize);
  }, [isMuted]);
  
  useEffect(()=>{
    if(!session?.user?.id)return;
    supabase.from('profiles').select('alias').eq('id',session.user.id).single().then(({data})=>{if(data?.alias)setRealUserAlias(data.alias);});
  },[session]);

  useEffect(()=>{
    if(selectedForestUser&&displayUsers.length>0){
      const i=displayUsers.findIndex(u=>u.id===selectedForestUser.id);
      if(i!==-1)setCurrentIndex(i);
    }
  },[selectedForestUser,displayUsers]);

  useEffect(()=>{
    if(!currentUser?.id)return;
    (async()=>{
      const isUUID=/^[0-9a-f]{8}/i.test(currentUser.id);
      const {data:ads}=await supabase.from('bro_echos').select('*').eq('is_sponsored',true).limit(10);
      let fv=ads||[];
      if(isUUID){
        const y=new Date();y.setDate(y.getDate()-1);
        const {data:ue}=await supabase.from('bro_echos').select('*').eq('target_profile_id',currentUser.id).eq('is_sponsored',false).gt('created_at',y.toISOString()).lt('reports_count',3).order('created_at',{ascending:false}).limit(30);
        if(ue)fv=[...fv,...ue.filter(e=>!e.audio_link&&!e.text?.includes('[TTS]'))];
      } else {fv=[...fv,{id:'s1',author_alias:'SISTEMA',text:'MODO SIMULACIÓN'}];}
      setVisualEchos(fv);
    })();
  },[currentUser]);

  useEffect(()=>{
    if(!visualEchos?.length)return;
    let slot=0;
    const iv=setInterval(()=>{
      setFloatingEchos(prev=>{
        const ads=visualEchos.filter(e=>e.is_sponsored),normals=visualEchos.filter(e=>!e.is_sponsored);
        const echo=Math.random()>0.75
          ?(ads.length>0?ads[Math.floor(Math.random()*ads.length)]:{id:'SYS',is_sponsored:true,author_alias:'BROVISION TV',text:'🔴 EN VIVO',target_index:0})
          :(normals.length>0?normals[Math.floor(Math.random()*normals.length)]:visualEchos[0]);
        const mob=window.innerWidth<768,slots=mob?OESTE_MOBILE_SLOTS:OESTE_PC_SLOTS,coords=slots[slot%slots.length];
        slot++;
        return [...prev.slice(-2),{...echo,id:Date.now()+Math.random(),x:coords.x,y:coords.y}];
      });
    },4500);
    return()=>clearInterval(iv);
  },[visualEchos]);

  const handleTouchStart=(e)=>{if(e.target.closest('button'))return;touchStart.current=e.targetTouches[0].clientX;};
  const handleTouchMove =(e)=>{if(e.target.closest('button'))return;touchEnd.current  =e.targetTouches[0].clientX;};
  const handleTouchEnd  =()=>{
    if(!touchStart.current||!touchEnd.current)return;
    const d=touchStart.current-touchEnd.current;
    if(d>70)setCurrentIndex(p=>p+1); if(d<-70)setCurrentIndex(p=>p>0?p-1:0);
    touchStart.current=0;touchEnd.current=0;
  };

  const handleAction=async(type)=>{
    const cost=echoType==='hyper'?1000:100;
    if(!balances||balances.genesis<cost){alert(`NECESITAS ${cost} GÉNESIS...`);return;}
    const myAlias=realUserAlias||'CIUDADANO';
    if(type==='reaction'){
      setActiveReaction({from:myAlias});
      setTimeout(()=>setActiveReaction(null),6000);
    } else {
      const {data}=await supabase.from('bro_echos').insert([{
        target_profile_id:currentUser.id,author_alias:myAlias,
        advertiser_id:session.user.id,text:echoText.toUpperCase(),
        is_sponsored:echoType==='hyper',created_at:new Date()
      }]).select();
      if(data)setVisualEchos(prev=>[data[0],...prev]);
      setShowEchoInput(false);setEchoText('');
    }
    const ng=balances.genesis-cost;
    setBalances(prev=>({...prev,genesis:ng}));
    await supabase.from('profiles').update({genesis:ng}).eq('id',session.user.id);
  };

  const isTvMode=currentUser&&(currentUser.isTv||currentUser.is_tv);

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden select-none font-mono">
      <style>{OESTE_STYLES}</style>

      {/* FONDO */}
      <video ref={bgVideoRef} src={BG_VIDEO} autoPlay loop muted playsInline
       className="absolute inset-0 w-full h-full object-cover z-[1]"/>
       
      {/* 2. ECOS FLOTANTES completos */}
      <div className="absolute inset-0 z-[10] pointer-events-none">
        {floatingEchos.map((echo)=>{
          const isAd=echo.is_sponsored===true;
          const neon=neonColors[Math.floor(Math.random()*neonColors.length)];
          return (
            <div key={echo.id}
                 className={`absolute animate-spirit text-center group transition-all ${isAd?'z-[60] pointer-events-auto cursor-pointer scale-110':'pointer-events-none z-[40]'}`}
                 style={{left:`${echo.x}%`,top:`${echo.y}%`}}
                 onClick={()=>{
                   if(!isAd)return;
                   const adv=videoUsers.find(u=>u.id===echo.advertiser_id);
                   if(adv){displayUsers.splice(currentIndex+1,0,{...adv,id:`zap_${Date.now()}`,is_zap:true});setCurrentIndex(currentIndex+1);}
                   else setCurrentIndex(0);
                 }}>
              <p className={`text-[8px] mb-1 uppercase tracking-[0.5em] font-black ${isAd?'text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]':'opacity-80 '+neon.text}`}>
                {isAd?'⚡ HYPER ZAP':`@${echo.author_alias}`}
              </p>
              <div className={`border backdrop-blur-none transition-all duration-700 ${isAd
                ?'px-5 py-2.5 rounded-[2rem] bg-[#0C0C1C]/50 border-[#E3DDB1]/30 text-white font-medium shadow-[0_0_20px_rgba(0,0,0,0.9),inset_0_0_10px_rgba(255,215,0,0.05)]'
                :`px-7 py-3 rounded-[2.5rem] bg-black/90 border ${neon.border} ${neon.text} ${neon.glow}`}`}>
                <span className={isAd?"text-xs md:text-base tracking-wide text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]":"text-xs md:text-lg"}>"{echo.text}"</span>
                {isAd&&(
                  <div className="mt-2 relative overflow-hidden py-1.5 px-5 rounded-full border border-[#DED590]/50 bg-gradient-to-r from-amber-200/20 via-yellow-300/20 to-amber-100/20 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"/>
                    <span className="text-[9px] text-[#FFD700] font-black tracking-[0.3em] uppercase relative z-10">ENTRAR ▶</span>
                  </div>
                )}
              </div>
              {!isAd&&<button onClick={()=>handleReport(echo.id)} className="pointer-events-auto opacity-0 group-hover:opacity-100 absolute -top-4 -right-4 bg-red-600/20 p-2 rounded-full text-[8px] hover:bg-red-600 transition-all">⚠️</button>}
            </div>
          );
        })}
      </div>
      
      {/* ══════════════════════════════════════════════════════════════
          PC — VISOR GIGANTE (TECHO A SUELO) AL LADO IZQUIERDO
          ══════════════════════════════════════════════════════════════ */}
      <div className="absolute top-0 left-12 h-full z-[30] hidden md:flex items-center justify-start"
           onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>

        {/* VISOR OESTE - OCUPA EL 100% DEL ALTO */}
        <div className="relative bg-black oeste-visor overflow-hidden w-[400px] h-[94vh]">
          {isTvMode&&<div className="absolute inset-0 z-0 opacity-30 blur-[60px] scale-150 pointer-events-none bg-gradient-to-t from-blue-900 via-purple-900 to-pink-900"/>}

          <video ref={videoRefPC} key={`pc_${currentUser?.id}`} poster={currentUser?.poster||''}
                 autoPlay loop={!isTvMode} playsInline
                 className={`relative z-10 transition-all duration-700 ${isTvMode?'w-full h-auto aspect-video object-contain bg-black':'w-full h-full object-cover'}`}
                 onTimeUpdate={()=>videoRefPC.current&&setProgress((videoRefPC.current.currentTime/(videoRefPC.current.duration||100))*100)}/>

          <button onClick={(e)=>{e.stopPropagation();setIsMuted(p=>!p);}}
                  className="absolute top-8 left-8 bg-black/60 backdrop-blur-md p-3 rounded-full text-lg z-[150] border border-white/20 hover:bg-white/20 transition-all">
            {isMuted?'🔇':'🔊'}
          </button>
        </div>

      {/* ORBE ANTERIOR (←) — derecha del visor, footer */}
  <div className="absolute z-[110] cursor-pointer group animate-orb-float"
       style={{ left: '440px', bottom: '30px' }}
       onClick={() => setCurrentIndex(p => p > 0 ? p - 1 : displayUsers.length - 1)}>
    <div className="w-14 h-14 rounded-full flex items-center justify-center relative animate-orb-glow transition-transform group-hover:scale-110 text-white">
      <div className="absolute inset-0 bg-white opacity-10 blur-xl rounded-full"/>
      <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-spin-cw"/>
      <span className="text-2xl font-black text-white relative z-10">←</span>
    </div>
  </div>

  {/* ORBE SIGUIENTE (→) — derecha del visor, footer */}
  <div className="absolute z-[110] cursor-pointer group animate-orb-float"
       style={{ left: '530px', bottom: '30px', animationDelay: '1.5s' }}
       onClick={() => setCurrentIndex(p => p + 1)}>
    <div className="w-14 h-14 rounded-full flex items-center justify-center relative animate-orb-glow transition-transform group-hover:scale-110 text-white">
      <div className="absolute inset-0 bg-white opacity-10 blur-xl rounded-full"/>
      <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-spin-ccw"/>
      <span className="text-2xl font-black text-white relative z-10">→</span>
    </div>
  </div>
  
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

     {/* ══ FOOTER PC (A LA DERECHA - TODO EN UNA FILA) ══ */}
      <div className="absolute bottom-0 right-0 w-full flex justify-end px-6 py-6 md:px-10 md:py-8 z-[150] pointer-events-none bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        
        {/* CONTENEDOR FLEX HORIZONTAL */}
        <div className="flex flex-row items-center gap-4 pointer-events-auto">

          {/* NOMBRE ANTES DE LOS BOTONES */}
          <div className="bg-black/40 backdrop-blur-md px-6 py-3 md:py-4 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] mr-2">
            <p className="text-[10px] md:text-[12px] font-black tracking-[0.4em] uppercase text-fuchsia-400 drop-shadow-lg text-center">
              CANAL OESTE <span className="text-white/40 mx-2">//</span> {currentUser?.alias||'ANÓNIMO'}
            </p>
          </div>
          
          <button onClick={()=>handleAction('reaction')} className="px-5 py-3 md:py-4 bg-white text-black border border-white rounded-xl text-[9px] md:text-[11px] font-black uppercase shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform">
            ✨ HALO
          </button>
          <button onClick={()=>{ if(currentUser)onOpenProfile(currentUser); }} className="px-5 py-3 md:py-4 bg-black text-white border-2 border-[#bf00ff] rounded-xl text-[9px] md:text-[11px] font-black uppercase shadow-[0_0_15px_rgba(191,0,255,0.6)] hover:scale-105 transition-all animate-pulse">
            ☝️ TELEFONO CASA
          </button>
          <button onClick={()=>setShowEchoInput(true)} className="px-6 py-3 md:py-4 bg-black/90 border border-white/20 text-white rounded-xl text-[9px] md:text-[11px] font-black uppercase hover:bg-white/10 transition-colors">
            💬 ECO
          </button>

        </div>
      </div>
      
      {/* ══ MÓVIL (TALL VISOR) ══ */}
      <div className="md:hidden absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20]"
           onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="relative w-[62vw] aspect-[9/19] flex flex-col items-center">
          <div className="relative w-full h-full overflow-hidden bg-black oeste-visor">
            <video ref={videoRefMob} key={`mob_${currentUser?.id}`} poster={currentUser?.poster||''}
                   autoPlay loop={!isTvMode} playsInline className="w-full h-full object-cover"
                   onTimeUpdate={()=>videoRefMob.current&&setProgress((videoRefMob.current.currentTime/(videoRefMob.current.duration||100))*100)}/>
          </div>
        </div>
      </div>

      {/* ══ MODAL ECO ══ */}
      {showEchoInput&&(
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center flex flex-col items-center">
            <div className="flex gap-4 mb-12 justify-center w-full">
              <button onClick={()=>setEchoType('text')} className={`flex-1 py-3 rounded-full text-[10px] font-black border tracking-widest transition-all ${echoType==='text'?'bg-fuchsia-500 text-black border-fuchsia-400':'text-white/40 border-white/10'}`}>💬 TEXTO NEÓN</button>
              <button onClick={() => setEchoType('hyper')} className={`flex-1 max-w-[160px] py-3 rounded-full text-[10px] font-black border tracking-widest transition-all ${echoType === 'hyper' ? 'bg-[#002366] text-cyan-400 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]' : 'text-white/40 border-white/10 hover:text-white/80'}`}>
                ⚡ HYPER ZAP
              </button>
            </div>
            <input autoFocus type="text" placeholder={echoType==='hyper'?'TÍTULO DEL ANUNCIO...':'ESCRIBE TU ECO...'}
                   className="w-full bg-transparent border-b-2 border-white/20 py-6 text-center text-white outline-none font-black text-2xl md:text-3xl uppercase focus:border-fuchsia-400 transition-colors"
                   value={echoText} onChange={e=>setEchoText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAction('echo')} maxLength={60}/>
            <button onClick={()=>handleAction('echo')} className="w-full max-w-[280px] py-4 rounded-2xl font-black text-[12px] tracking-widest uppercase transition-all shadow-xl bg-fuchsia-600 text-white mt-16 mb-6">
              EMITIR
            </button>
            <button onClick={()=>setShowEchoInput(false)} className="text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">[ VOLVER ]</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelOeste;