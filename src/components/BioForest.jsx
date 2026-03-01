// src/components/BioForest.jsx
// VERSIÓN COMPLETA: Nihilanth + Fix Audio + Fix Touch + Ecos completos + Hyper Zap + Tribu

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
`;

const PC_SLOTS = [
    {x:5,y:25},{x:7,y:50},{x:14,y:75},
    {x:72,y:45},{x:75,y:35},{x:75,y:80},
    {x:15,y:3},{x:80,y:3},{x:5,y:80},
];
const MOBILE_SLOTS = [{x:28,y:67},{x:8,y:4},{x:28,y:6},{x:28,y:15}];

const BioForest = ({ videoUsers, balances, setBalances, session, realityMode, onOpenProfile, selectedForestUser }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeReaction, setActiveReaction] = useState(null);
  const [visualEchos, setVisualEchos] = useState([]);
  const [audioPool, setAudioPool] = useState([]);
  const [floatingEchos, setFloatingEchos] = useState([]);
  const [currentTribeIndex, setCurrentTribeIndex] = useState(0);
  const [isPlayingTribe, setIsPlayingTribe] = useState(false);
  const [isRadioReady, setIsRadioReady] = useState(false);
  const [visorScale, setVisorScale] = useState(1);
  const [mousePos, setMousePos] = useState({x:0,y:0});
  const [showEchoInput, setShowEchoInput] = useState(false);
  const [echoType, setEchoType] = useState('text');
  const [echoText, setEchoText] = useState("");
  const [realUserAlias, setRealUserAlias] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const videoRef = useRef(null);
  const bgVideoRef = useRef(null);
  const hlsRef = useRef(null);
  const audioTribeRef = useRef(new Audio());
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const displayUsers = useMemo(() => {
    const LAP_STEEL = {
      id:'bot1', alias:'Lap_Steel',
      video_file:"https://www.dropbox.com/scl/fi/zsey9jh7tzzvx3bksllwm/Celestial_Drift-master.mp4?rlkey=dhph8iy6ji2s4av4cshi5lq5q&st=bwnz7v2d&dl=0"
    };
    return videoUsers?.length > 0 ? [...videoUsers,LAP_STEEL,...TV_NODES] : [LAP_STEEL,...TV_NODES];
  }, [videoUsers]);

  const currentUser = useMemo(() => displayUsers[currentIndex % displayUsers.length], [displayUsers,currentIndex]);

  // Paralaje — solo fondo
  useEffect(() => {
    const onMove = (e) => setMousePos({x:(e.clientX/window.innerWidth)*2-1, y:(e.clientY/window.innerHeight)*2-1});
    const onOri  = (e) => { if(!e.gamma) return; setMousePos({x:Math.min(Math.max(e.gamma/45,-1),1), y:Math.min(Math.max(e.beta/45,-1),1)}); };
    window.addEventListener('mousemove',onMove);
    if(window.DeviceOrientationEvent) window.addEventListener('deviceorientation',onOri);
    return () => { window.removeEventListener('mousemove',onMove); window.removeEventListener('deviceorientation',onOri); };
  },[]);

  const getTimeSuffix = () => { const h=new Date().getHours(); if(h>=7&&h<15)return'D'; if(h>=15&&h<21)return'T'; return'N'; };

  const config = useMemo(() => {
    const t=getTimeSuffix();
    const v=(n)=>`/videos/${n}_${t==='D'?1:t==='T'?2:3}.mp4`;
    switch(realityMode){
      case 'solo_earth':   return {video:v('solo_earth'),  colors:['text-emerald-600','text-cyan-300'],  reactionColor:'emerald',labelClass:'text-emerald-600',labelText:'SOLO EARTH',  navColor:'text-emerald-500'};
      case 'band_earth':   return {video:v('band_earth'),  colors:['text-blue-400','text-indigo-300'],   reactionColor:'blue',   labelClass:'text-blue-400',   labelText:'BAND EARTH',  navColor:'text-blue-400'   };
      case 'solo_fantasy': return {video:v('solo_fantasy'),colors:['text-cyan-400','text-fuchsia-400'],  reactionColor:'cyan',   labelClass:'text-cyan-400',   labelText:'SOLO FANTASY',navColor:'text-cyan-400'   };
      case 'band_fantasy': return {video:v('band_fantasy'),colors:['text-fuchsia-500','text-purple-300'],reactionColor:'fuchsia',labelClass:'text-fuchsia-400', labelText:'BAND FANTASY',navColor:'text-fuchsia-500'};
      case 'solo_cinema':  return {video:v('solo_cinema'), colors:['text-amber-500','text-orange-300'],  reactionColor:'amber',  labelClass:'text-amber-500',  labelText:'SOLO CINEMA', navColor:'text-amber-600'  };
      case 'band_cinema':  return {video:v('band_cinema'), colors:['text-orange-400','text-yellow-200'], reactionColor:'orange', labelClass:'text-orange-400', labelText:'BAND CINEMA', navColor:'text-orange-500' };
      case 'eclipse':      return {video:'/videos/eclipse_mode.mp4',colors:['text-yellow-500','text-orange-200'],reactionColor:'orange',labelClass:'text-yellow-500',labelText:'ECLIPSE ZENITH',navColor:'text-yellow-500'};
      default:             return {video:'/videos/eclipse_mode.mp4',colors:['text-cyan-400','text-white'],       reactionColor:'cyan',  labelClass:'text-cyan-400',  labelText:'GENESIS NODE',navColor:'text-cyan-400'  };
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
      }
    }
    setVisualEchos([]);setAudioPool([]);setFloatingEchos([]);
    setIsRadioReady(false);setIsPlayingTribe(false);
  },[currentUser]); // SOLO currentUser

  // FIX AUDIO — Efecto B: mute sin recargar
  useEffect(()=>{ if(videoRef.current) videoRef.current.muted=isMuted; },[isMuted]);

  // Fetch ecos completo con Hyper Zap
  useEffect(()=>{
    if(!currentUser?.id)return;
    const fetch=async()=>{
      const isUUID=/^[0-9a-f]{8}/i.test(currentUser.id);
      const{data:ads}=await supabase.from('bro_echos').select('*').eq('is_sponsored',true).limit(10);
      let finalVisual=ads||[],finalAudio=[];
      if(isUUID){
        const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
        const{data:userEchos}=await supabase.from('bro_echos').select('*')
          .eq('target_profile_id',currentUser.id).eq('is_sponsored',false)
          .gt('created_at',yesterday.toISOString()).lt('reports_count',3)
          .order('created_at',{ascending:false}).limit(30);
        if(userEchos){
          finalVisual=[...finalVisual,...userEchos.filter(e=>!e.audio_link&&!e.text?.includes('[TTS]'))];
          finalAudio=userEchos.filter(e=>e.audio_link||e.text?.includes('[TTS]'));
        }
      } else {
        finalVisual=[...finalVisual,{id:'s1',author_alias:'SISTEMA',text:'MODO SIMULACIÓN'}];
        finalAudio=[{id:'a1',author_alias:'SISTEMA',text:'[TTS] SINTONIZANDO SEÑAL...'}];
      }
      setVisualEchos(finalVisual);
      setAudioPool(finalAudio.length>0?finalAudio:[{id:'a1',author_alias:'SISTEMA',text:'[TTS] BIENVENIDO A LA RED'}]);
    };
    fetch();
  },[currentUser]);

  // Ecos flotantes con lógica Hyper Zap 25%
  useEffect(()=>{
    if(!visualEchos||visualEchos.length===0)return;
    let slot=0;
    const interval=setInterval(()=>{
      setFloatingEchos(prev=>{
        const ads=visualEchos.filter(e=>e.is_sponsored);
        const normals=visualEchos.filter(e=>!e.is_sponsored);
        const isAdTime=Math.random()>0.75;
        let echo;
        if(isAdTime){
          echo=ads.length>0?ads[Math.floor(Math.random()*ads.length)]:{id:'SYSTEM_AD',is_sponsored:true,author_alias:'BROVISION TV',text:'🔴 ¿QUIERES VER TV EN VIVO? HAZ CLIC AQUÍ',target_index:0};
        } else {
          echo=normals.length>0?normals[Math.floor(Math.random()*normals.length)]:visualEchos[Math.floor(Math.random()*visualEchos.length)];
        }
        const mob=window.innerWidth<768;
        const slots=mob?MOBILE_SLOTS:PC_SLOTS;
        const coords=slots[slot%slots.length];
        slot++;
        return [...prev.slice(-2),{...echo,id:Date.now()+Math.random(),x:coords.x,y:coords.y}];
      });
    },4500);
    return()=>clearInterval(interval);
  },[visualEchos]);

  const handleReport=async(echoId)=>{
    if(!confirm("¿Reportar este mensaje como inapropiado?"))return;
    await supabase.rpc('increment_report',{row_id:echoId});
    alert("Reporte enviado. Gracias por limpiar el bosque.");
    setAudioPool(prev=>prev.filter(e=>e.id!==echoId));
    setVisualEchos(prev=>prev.filter(e=>e.id!==echoId));
  };

  const handlePlayTribe=()=>{};
  const toggleRadio=()=>{};

  const handleAction=async(type)=>{
    const cost=echoType==='hyper'?1000:100;
    if(!balances||balances.genesis<cost){alert(`NECESITAS ${cost} GÉNESIS...`);return;}
    const myAlias=realUserAlias||'CIUDADANO';
    if(type==='reaction'){
      setActiveReaction({from:myAlias});
      setTimeout(()=>setActiveReaction(null),6000);
    } else {
      const ecoData={target_profile_id:currentUser.id,author_alias:myAlias,advertiser_id:session.user.id,text:echoText.toUpperCase(),is_sponsored:echoType==='hyper',created_at:new Date()};
      const{data}=await supabase.from('bro_echos').insert([ecoData]).select();
      if(data){
        const newEcho=data[0];
        if(echoType==='text'||echoType==='hyper')setVisualEchos(prev=>[newEcho,...prev]);
        else setAudioPool(prev=>[newEcho,...prev]);
      }
      setShowEchoInput(false);setEchoText("");
    }
    const newGenesis=balances.genesis-cost;
    setBalances(prev=>({...prev,genesis:newGenesis}));
    await supabase.from('profiles').update({genesis:newGenesis}).eq('id',session.user.id);
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
  const bgTransform=`translate(${mousePos.x*-30}px,${mousePos.y*-20}px) scale(1.1)`;
  const portalTransform=`scale(${visorScale})`; // visor fijo, sin paralaje

  const neonColors=[
    {border:'border-cyan-400',   text:'text-cyan-400',   glow:'shadow-[0_0_10px_rgba(34,211,238,0.5)]' },
    {border:'border-fuchsia-500',text:'text-fuchsia-400',glow:'shadow-[0_0_10px_rgba(217,70,239,0.5)]' },
    {border:'border-emerald-400',text:'text-emerald-400',glow:'shadow-[0_0_10px_rgba(52,211,153,0.5)]' },
    {border:'border-violet-500', text:'text-violet-400', glow:'shadow-[0_0_10px_rgba(139,92,246,0.5)]' }
  ];

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden select-none font-mono">
      <style>{FOREST_STYLES}</style>

      {/* 1. FONDO con paralaje */}
      {config.video && (
        <div className="absolute inset-0 z-[1] transition-transform duration-300 ease-out will-change-transform" style={{transform:bgTransform}}>
          <video src={config.video} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"/>
        </div>
      )}

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

      {/* 3. VÓRTICE GEMAS */}
      {activeReaction&&(
        <div className="fixed bottom-4 right-[15%] z-[100] pointer-events-none animate-vortex">
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
      <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
           className="absolute top-[45%] md:top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20]"
           style={{perspective:'2000px'}}>
        <div className="relative w-[58vw] aspect-[9/16] md:w-[320px] md:h-[568px] md:aspect-auto flex items-center justify-center"
             style={{transformStyle:'preserve-3d'}}>

          {/* NÚCLEO VISOR ESTÁTICO */}
          <div className="relative w-full h-full z-[10]"
               style={{transform:portalTransform,transformStyle:'preserve-3d'}}
               onDoubleClick={()=>setVisorScale(1)}>
            <div className="relative w-full h-full rounded-[3.5rem] overflow-hidden visor-border bg-black flex items-center justify-center">
              {isTvMode&&(
                <div className="absolute inset-0 z-0 opacity-30 blur-[60px] scale-150 pointer-events-none bg-gradient-to-t from-blue-900 via-purple-900 to-pink-900"/>
              )}
              <div className="absolute inset-0 bg-black/20 z-[5] pointer-events-none"/>
              {/* VIDEO — sin prop muted, lo controla efecto B */}
              <video ref={videoRef} key={currentUser.id} poster={currentUser.poster||""} autoPlay loop={!isTvMode} playsInline
                     className={`relative z-10 transition-all duration-700 ${isTvMode?'w-full h-auto aspect-video object-contain bg-black':'w-full h-full object-cover'}`}
                     onTimeUpdate={()=>videoRef.current&&setProgress((videoRef.current.currentTime/(videoRef.current.duration||100))*100)}/>
              {/* BOTÓN MUTE dentro del overflow — nunca cae fuera */}
              <button onClick={(e)=>{e.stopPropagation();setIsMuted(p=>!p);}}
                      className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-full text-lg z-[150] border border-white/20 hover:bg-white/20 transition-all">
                {isMuted?'🔇':'🔊'}
              </button>
              {!isTvMode&&(
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-[150]">
                  <div className={`h-full transition-all duration-300 ${config.reactionColor==='orange'?'bg-orange-500':'bg-cyan-500'}`} style={{width:`${progress}%`}}/>
                </div>
              )}
            </div>
          </div>

          {/* ORBES PC */}
          <div className="hidden md:flex absolute top-1/2 -left-20 -translate-y-1/2 z-[100] flex-col items-center cursor-pointer group orb-float"
               onClick={()=>setCurrentIndex(p=>p>0?p-1:displayUsers.length-1)}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center relative orb-glow transition-transform group-hover:scale-110 ${config.colors[0]}`} style={{color:'currentColor'}}>
              <div className="absolute inset-0 bg-current opacity-20 blur-xl rounded-full"/>
              <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-spin-slow"/>
              <span className="text-3xl font-black text-white relative z-10 pb-1">‹</span>
            </div>
          </div>
          <div className="hidden md:flex absolute top-1/2 -right-20 -translate-y-1/2 z-[100] flex-col items-center cursor-pointer group orb-float"
               style={{animationDelay:'1.5s'}} onClick={()=>setCurrentIndex(p=>p+1)}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center relative orb-glow transition-transform group-hover:scale-110 ${config.colors[0]}`} style={{color:'currentColor'}}>
              <div className="absolute inset-0 bg-current opacity-20 blur-xl rounded-full"/>
              <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-spin-reverse"/>
              <span className="text-3xl font-black text-white relative z-10 pb-1">›</span>
            </div>
          </div>

          {/* REPRODUCTOR TRIBU */}
          <div className="absolute bottom-2 md:-bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/90 backdrop-blur-none border border-white/10 px-6 py-2 rounded-full z-[150] shadow-2xl min-w-[240px]">
            <button onClick={()=>setCurrentTribeIndex(p=>(p>0?p-1:audioPool.length-1))} className={`hover:scale-125 transition-all text-2xl ${config.navColor}`}>❮</button>
            <div className="flex flex-col items-center flex-1">
              <button onClick={toggleRadio} className={`w-9 h-9 flex items-center justify-center rounded-full border border-white/20 transition-all ${isPlayingTribe?'bg-white text-black scale-110':'text-white'}`}>
                {isPlayingTribe?'⏸':'▶'}
              </button>
              <p className="text-[6px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">@{audioPool[currentTribeIndex]?.author_alias||'SIN SEÑAL'}</p>
            </div>
            <button onClick={()=>setCurrentTribeIndex(p=>(p+1)%audioPool.length)} className={`hover:scale-125 transition-all text-2xl ${config.navColor}`}>❯</button>
          </div>

          {/* BOTONERA */}
          <div className="absolute -bottom-28 md:-bottom-44 left-0 w-full flex flex-col items-center gap-3 z-50 pointer-events-auto">
            <div className="absolute inset-x-2 -inset-y-4 bg-black/60 backdrop-blur-md rounded-[3rem] -z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]"/>
            <div className="flex items-center justify-center gap-2 w-full max-w-[350px] px-4">
              <button onClick={()=>handleAction('reaction')} className="flex-1 py-3 bg-white text-black border border-white rounded-xl text-[9px] font-black uppercase shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform">✨ HALO</button>
              <button onClick={()=>{if(currentUser)onOpenProfile(currentUser);}} className="flex-1 py-3 bg-black text-white border-2 border-[#bf00ff] rounded-xl text-[9px] font-black uppercase shadow-[0_0_15px_rgba(191,0,255,0.6),inset_0_0_8px_rgba(191,0,255,0.4)] hover:scale-105 transition-all animate-pulse">
                <span className="drop-shadow-[0_0_8px_rgba(191,0,255,0.9)]">⛩️ SANTUARIO</span>
              </button>
              <button onClick={()=>setShowEchoInput(true)} className="flex-1 py-3 bg-black/90 border border-white/20 text-white rounded-xl text-[9px] font-black uppercase">💬 ECO</button>
            </div>
            <p className={`relative z-10 text-[9px] md:text-[11px] font-black tracking-[0.4em] uppercase ${config.labelClass} mt-1 drop-shadow-lg`}>
              {config.labelText} // {currentUser.alias}
            </p>
          </div>

        </div>
      </div>

      {/* MODAL ECO */}
      {showEchoInput&&(
        <div className="fixed inset-0 z-[1000] bg-black/98 flex items-center justify-center p-6 backdrop-blur-none">
          <div className="w-full max-w-md text-center">
            <div className="flex gap-2 mb-12 justify-center flex-wrap">
              <button onClick={()=>setEchoType('text')}  className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all ${echoType==='text' ?'bg-cyan-500 text-black border-cyan-400':'text-white/30 border-white/10'}`}>💬 TEXTO NEÓN</button>
              <button onClick={()=>setEchoType('tts')}   className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all ${echoType==='tts'  ?'bg-fuchsia-500 text-white border-fuchsia-400':'text-white/30 border-white/10'}`}>🤖 VOZ ROBOT</button>
              <button onClick={()=>setEchoType('hyper')} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all ${echoType==='hyper'?'bg-[#002366] text-cyan-400 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]':'text-white/30 border-white/10'}`}>⚡ HYPER ZAP</button>
            </div>
            <input autoFocus type="text" placeholder={echoType==='hyper'?"TÍTULO DEL ANUNCIO...":"ESCRIBE TU ECO..."}
                   className="w-full bg-transparent border-b-2 border-white/10 py-6 text-center text-white outline-none font-black text-2xl uppercase focus:border-white transition-all"
                   value={echoText} onChange={e=>setEchoText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAction('echo')} maxLength={60}/>
            <div className="mt-16 flex justify-between items-center px-4">
              <button onClick={()=>setShowEchoInput(false)} className="text-gray-500 text-[10px] font-black uppercase hover:text-white">VOLVER</button>
              <button onClick={()=>handleAction('echo')} className={`px-12 py-4 rounded-2xl font-black text-[11px] uppercase transition-all ${echoType==='hyper'?'bg-[#002366] text-cyan-400 border border-cyan-500':'bg-white text-black'}`}>
                {echoType==='hyper'?'EMITIR HYPER ZAP (1000 G)':'EMITIR ECO (100 G)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BioForest;