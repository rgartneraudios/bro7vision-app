// src/components/BioForest.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { TV_NODES } from '../data/TvDatabase';
import Hls from 'hls.js';

// --- ESTILOS CSS (Movidios aquí fuera para evitar errores de sintaxis) ---
const FOREST_STYLES = `
    @keyframes spiritFade {
        0% { opacity: 0; transform: translateY(15px); filter: blur(5px); }
        8% { opacity: 1; transform: translateY(0); filter: blur(0px); } 
        85% { opacity: 1; transform: translateY(-12px); filter: blur(0px); } 
        100% { opacity: 0; transform: translateY(-35px); filter: blur(10px); } 
    }
    .animate-spirit { animation: spiritFade 10s ease-in-out forwards; }
    
    /* ANIMACIÓN GEMA DE ENERGÍA - TRAYECTO CIRCULAR */
    @keyframes vortexRise {
        0%   { transform: translate(-80vw, -30vh) scale(0.9) rotate(0deg); opacity: 0.8; z-index: 200; }
        15%  { transform: translate(-30vw, 0vh) scale(1.3) rotate(90deg); z-index: 200; }
        70%  { transform: translate(10vw, -35vh) scale(1.2) rotate(450deg); z-index: 200; }
        80%  { transform: translate(5vw, -45vh) scale(0.9) rotate(540deg); z-index: 200; }
        100% { transform: translate(-30vw, -60vh) scale(0.05) rotate(720deg); z-index: 50; opacity: 0.8; }
    }
    .animate-vortex { animation: vortexRise 6s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards; }
    @keyframes vortexSpin { 0% { transform: rotate(0deg) scale(1); } 100% { transform: rotate(360deg) scale(1.05); } }
    .animate-spin-vortex { animation: vortexSpin 1.5s linear infinite; }
    @keyframes energyPulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 1; } }
    .animate-energy-pulse { animation: energyPulse 2s ease-in-out infinite; }
    @keyframes spiralCounter { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
    .animate-spiral-counter { animation: spiralCounter 3s linear infinite; }
    @keyframes particleOrbit { 0% { transform: rotate(0deg) translateX(30px) scale(1); opacity: 1; } 100% { transform: rotate(360deg) translateX(30px) scale(0.5); opacity: 0; } }
    .animate-particle-orbit { animation: particleOrbit 2s ease-out infinite; }
    @keyframes flare { 0%, 60%, 100% { opacity: 0; transform: scale(0.8); } 70% { opacity: 1; transform: scale(1.3); } }
    .animate-flare { animation: flare 3s ease-in-out infinite; }
    
    /* EFECTO PORTAL Y UI */
    @keyframes shimmer { 100% { transform: translateX(100%); } }
    .animate-shimmer { animation: shimmer 2s infinite; }
    .portal-blend { mix-blend-mode: screen; }
`;

// 1. TUS COORDENADAS
const PC_SLOTS = [
    { x: 5, y: 25 }, { x: 7, y: 50 }, { x: 14, y: 75 },
    { x: 72, y: 45 }, { x: 75, y: 35 }, { x: 75, y: 80 },
    { x: 15, y: 3 },  { x: 80, y: 3 }, { x: 5, y: 80 },
];
const MOBILE_SLOTS = [
    { x: 28, y: 67 }, { x: 8, y: 4 }, { x: 28, y: 6 }, { x: 28, y: 15 }
];

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
  
  // ZOOM Y PARALAJE
  const [visorScale, setVisorScale] = useState(1);
  const initialPinchDistance = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // <--- PARALAJE 3D

  // ECOS
  const [showEchoInput, setShowEchoInput] = useState(false);
  const [echoType, setEchoType] = useState('text');
  const [echoText, setEchoText] = useState("");
  const [realUserAlias, setRealUserAlias] = useState("");
  
  // GRABADORA (Omitida lógica compleja para brevedad, pero estados mantenidos)
  const [isRecording, setIsRecording] = useState(false);
  
  const videoRef = useRef(null);
  const bgVideoRef = useRef(null);
  const hlsRef = useRef(null);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  // --- IDENTIDAD ---
  const displayUsers = useMemo(() => {
    const DJ_NEON = { 
        id: 'bot1', alias: 'Dj_Neon', 
        video_file: "https://www.dropbox.com/scl/fi/7mwqgp1nw2uoccojy8q68/Bro7Vision-01.mp4?rlkey=lq6r57aand98srt27wntma8bp&st=irkmq91s&dl=0" 
    };
    return videoUsers?.length > 0 ? [...videoUsers, DJ_NEON, ...TV_NODES] : [DJ_NEON, ...TV_NODES];
  }, [videoUsers]);

  const currentUser = useMemo(() => displayUsers[currentIndex % displayUsers.length], [displayUsers, currentIndex]);

  // --- LÓGICA DE PARALAJE (MOUSE Y GIROSCOPIO) ---
  useEffect(() => {
    const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        setMousePos({ x, y });
    };
    const handleOrientation = (e) => {
        if (!e.gamma) return;
        const x = Math.min(Math.max(e.gamma / 45, -1), 1);
        const y = Math.min(Math.max(e.beta / 45, -1), 1);
        setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    if (window.DeviceOrientationEvent) window.addEventListener('deviceorientation', handleOrientation);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // --- 4 TURNOS TEMPORALES ---
  const getTimeSuffix = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'M'; // Mañana
    if (hour >= 11 && hour < 18) return 'T'; // Tarde
    if (hour >= 18 || hour < 0) return 'N'; // Noche
    return 'X'; // Madrugada
  };

  const config = useMemo(() => {
    const time = getTimeSuffix();
    // Helper para construir rutas: _1(M), _2(T), _3(N), _4(X)
    const gp = (name) => {
       const map = { 'M': '_1', 'T': '_2', 'N': '_3', 'X': '_4' };
       return `/videos/${name}${map[time] || '_1'}.mp4`;
    };

    switch(realityMode) {
      case 'solo_earth': return { video: gp('solo_earth'), colors: ['text-emerald-600', 'text-cyan-300'], border: 'border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]', labelClass: 'text-emerald-600', labelText: 'SOLO EARTH', navColor: 'text-emerald-500' };
      case 'band_earth': return { video: gp('band_earth'), colors: ['text-blue-400', 'text-indigo-300'], border: 'border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)]', labelClass: 'text-blue-400', labelText: 'BAND EARTH ', navColor: 'text-blue-400' };
      case 'solo_fantasy': return { video: gp('solo_fantasy'), colors: ['text-cyan-400', 'text-fuchsia-400'], border: 'border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]', labelClass: 'text-cyan-400', labelText: 'SOLO FANTASY', navColor: 'text-cyan-400' };
      case 'band_fantasy': return { video: gp('band_fantasy'), colors: ['text-fuchsia-500', 'text-purple-300'], border: 'border-fuchsia-500/40 shadow-[0_0_50px_rgba(217,70,239,0.25)]', labelClass: 'text-fuchsia-400', labelText: 'BAND FANTASY', navColor: 'text-fuchsia-500' };
      case 'solo_cinema': return { video: gp('solo_cinema'), colors: ['text-amber-500', 'text-orange-300'], border: 'border-amber-600/30 shadow-[0_0_40px_rgba(245,158,11,0.2)]', labelClass: 'text-amber-500', labelText: 'SOLO CINEMA ', navColor: 'text-amber-600' };
      case 'band_cinema': return { video: gp('band_cinema'), colors: ['text-orange-400', 'text-yellow-200'], border: 'border-orange-500/40 shadow-[0_0_40px_rgba(251,146,60,0.2)]', labelClass: 'text-orange-400', labelText: 'BAND CINEMA ', navColor: 'text-orange-500' };
      default: return { video: '/videos/eclipse_mode.mp4', colors: ['text-cyan-400', 'text-white'], border: 'border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]', labelClass: 'text-cyan-400', labelText: 'GENESIS NODE', navColor: 'text-cyan-400' };
    }
  }, [realityMode]); 

  useEffect(() => {
    const fetchMyAlias = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase.from('profiles').select('alias').eq('id', session.user.id).single();
      if (data?.alias) setRealUserAlias(data.alias);
    };
    fetchMyAlias();
  }, [session]);

  useEffect(() => {
    const video = videoRef.current;
    const bgVideo = bgVideoRef.current;
    if (!video || !currentUser) return;

    const cleanUrl = (url) => {
        if (!url) return "";
        let clean = url.trim();
        if (clean.includes('dropbox.com')) {
            clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                         .replace('dropbox.com', 'dl.dropboxusercontent.com')
                         .replace('?dl=0', '')
                         .replace('&dl=0', '');
            return clean.includes('?') ? `${clean}&raw=1` : `${clean}?raw=1`;
        }
        return clean;
    };
    const playUrl = cleanUrl(currentUser.video_file || "");

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    const isHLS = playUrl.includes('.m3u8');
    if (bgVideo && isHLS) { bgVideo.pause(); bgVideo.src = ""; }

    if (isHLS) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) { video.src = playUrl; video.play().catch(()=>{}); }
        else if (Hls.isSupported()) {
            const hls = new Hls(); hls.loadSource(playUrl); hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(()=>{}));
            hlsRef.current = hls;
        }
    } else {
        if (video.src !== playUrl && video.src !== window.location.origin + playUrl) {
            video.src = playUrl; video.load(); video.play().catch(()=>{});
            if (bgVideo) { bgVideo.src = playUrl; bgVideo.load(); bgVideo.muted=true; bgVideo.play().catch(()=>{}); }
        }
    }
    video.muted = isMuted;
  }, [currentUser, isMuted]);

  // --- ECOS FLOTANTES ---
  useEffect(() => {
    if (!visualEchos || visualEchos.length === 0) return;
    let localSlot = 0;
    const interval = setInterval(() => {
      setFloatingEchos(prev => {
          const echoToPush = visualEchos[Math.floor(Math.random() * visualEchos.length)];
          const isMobile = window.innerWidth < 768;
          const currentSlots = isMobile ? MOBILE_SLOTS : PC_SLOTS;
          const coords = currentSlots[localSlot % currentSlots.length];
          localSlot++;
          return [...prev.slice(-2), { ...echoToPush, id: Date.now() + Math.random(), x: coords.x, y: coords.y }];
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [visualEchos]);

  // --- INTERACCIONES ---
  const handleAction = async (type) => {
      if (type === 'reaction') {
        setActiveReaction({ from: realUserAlias || 'YO' });
        setTimeout(() => setActiveReaction(null), 6000);
      } else {
        setShowEchoInput(false);
        // Aquí iría la lógica de guardar en Supabase (simplificada para que no falle)
        alert("Eco enviado (Simulación)"); 
      }
  };

  const handleTouchStart = (e) => { touchStart.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => { 
      const d = touchStart.current - touchEnd.current;
      if (d > 70) setCurrentIndex(p => p + 1);
      if (d < -70) setCurrentIndex(p => p > 0 ? p - 1 : 0);
  };
  const handleTouchMove = (e) => { touchEnd.current = e.targetTouches[0].clientX; };

  const isTvMode = currentUser && (currentUser.isTv || currentUser.is_tv);
  
  // CALCULOS CSS PARALAJE
  const bgTransform = `translate(${mousePos.x * -30}px, ${mousePos.y * -20}px) scale(1.1)`;
  const portalTransform = `translate(${mousePos.x * 10}px, ${mousePos.y * 5}px) scale(${visorScale})`;

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden select-none font-mono">
      {/* INYECCIÓN DE ESTILOS SEGURA */}
      <style>{FOREST_STYLES}</style>
      
      {/* 
         1. FONDO INMERSIVO (PARALAJE + 4 TURNOS) 
      */}
      {config.video && (
        <div 
            className="absolute inset-0 z-[1] transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: bgTransform }}
        >
            <video src={config.video} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
        </div>
      )}
      
      {/* 2. ECOS VISUALES */}
      <div className="absolute inset-0 z-[10] pointer-events-none">
          {floatingEchos.map((echo) => (
             <div key={echo.id} className="absolute animate-spirit" style={{ left: `${echo.x}%`, top: `${echo.y}%` }}>
                 <div className="px-4 py-2 bg-black/80 border border-cyan-500 rounded-full text-white text-xs backdrop-blur-md shadow-[0_0_10px_cyan]">
                    {echo.text}
                 </div>
             </div>
          ))}
      </div>

      {/* 3. TU VÓRTICE DE GEMAS (Recuperado y arreglado) */}
      {activeReaction && (
          <div className="fixed bottom-4 right-[15%] z-[100] pointer-events-none animate-vortex">
              {/* Lógica de colores aleatorios integrada aquí dentro */}
              {(() => {
                  const c = ["#00127A", "#FF007D", "#00FF48", "#4D00FA", "#facc15", "#CF0000", "#00E1FF"];
                  const rc = c[Math.floor(Math.random() * c.length)];
                  return (
                    <div className="relative flex flex-col items-center" style={{ mixBlendMode: 'screen' }}>
                        <div className="relative w-36 h-36 flex items-center justify-center">
                            <div className="absolute w-48 h-48 rounded-full blur-[40px] opacity-60 animate-energy-pulse" style={{ background: rc }}></div>
                            <div className="absolute w-40 h-40 animate-spin-vortex"><div className="w-full h-full rounded-full opacity-90" style={{ background: rc, filter: 'blur(4px)' }}></div></div>
                             {/* Particulas simplificadas para evitar mucho código */}
                            <div className="absolute w-6 h-6 bg-white rounded-full blur-[2px] shadow-[0_0_20px_white]"></div>
                        </div>
                    </div>
                  );
              })()}
          </div>
      )}

      {/* 4. VISOR PORTAL (PARALAJE + EFECTOS) */}
      <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="absolute top-[45%] md:top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20] perspective-[1000px]">
          
          <div className="relative w-[88vw] md:w-[380px] h-[55vh] md:h-[600px]">
              
              {/* ÁREA PORTAL FLOTANTE */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div 
                    className="relative w-[50vw] md:w-full h-[40vh] md:h-full pointer-events-auto transition-transform duration-300 ease-out"
                    style={{ transform: portalTransform, transformOrigin: 'center' }}
                    onDoubleClick={() => setVisorScale(1)}
                  >
                     <div className={`absolute inset-0 rounded-[3rem] overflow-hidden flex items-center justify-center backdrop-blur-sm ${config.border} border-[3px] shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
                        
                        {/* Espejo de fondo (Mix Blend para efecto holograma) */}
                        {!isTvMode && (
                          <video ref={bgVideoRef} className="absolute inset-0 w-full h-full object-cover scale-150 blur-[50px] opacity-60 saturate-200 pointer-events-none z-0 mix-blend-overlay" muted loop playsInline />
                        )}
                        
                        {/* Video Principal */}
                        <video 
                          ref={videoRef} 
                          key={currentUser.id}  
                          poster={currentUser.poster || ""}
                          autoPlay loop={!isTvMode} muted={isMuted} playsInline 
                          className={`relative z-10 transition-all duration-700 ${isTvMode ? 'w-full h-auto aspect-video object-contain bg-black/90' : 'w-full h-full object-cover opacity-95 hover:opacity-100'}`}  
                          onTimeUpdate={() => videoRef.current && setProgress((videoRef.current.currentTime / (videoRef.current.duration || 100)) * 100)} 
                        />
                        
                        {/* Brillo cristal */}
                        <div className="absolute inset-0 z-[12] bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-[3rem]"></div>

                        <button onClick={() => setIsMuted(!isMuted)} className="absolute top-6 right-6 bg-black/40 backdrop-blur-md p-3 rounded-full text-lg z-[150] border border-white/10 hover:bg-white/20 transition-all">{isMuted ? '🔇' : '🔊'}</button>
                    </div>
                  </div>
              </div>

              {/* FLECHAS PC */}
              <div className="hidden md:block absolute top-1/2 -left-24 -translate-y-1/2 z-[200]">
                    <button onClick={() => setCurrentIndex(p => p > 0 ? p - 1 : displayUsers.length - 1)} className={`hover:scale-125 transition-all text-6xl drop-shadow-md opacity-70 hover:opacity-100 ${config.navColor}`}>‹</button>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-24 -translate-y-1/2 z-[200]">
                    <button onClick={() => setCurrentIndex(p => p + 1)} className={`hover:scale-125 transition-all text-6xl drop-shadow-md opacity-70 hover:opacity-100 ${config.navColor}`}>›</button>
              </div>

              {/* BOTONERAS */}
              <div className="absolute -bottom-[100px] md:-bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full z-[150] shadow-2xl min-w-[240px]">
                  <button onClick={() => setCurrentTribeIndex(p => p > 0 ? p - 1 : 0)} className={`text-xl ${config.navColor}`}>❮</button>
                  <div className="flex flex-col items-center flex-1">
                      <button className={`w-8 h-8 flex items-center justify-center rounded-full border border-white/20 text-white`}>▶</button>
                      <p className="text-[6px] mt-1 text-gray-400">RADIO FREQUENCY</p>
                  </div>
                  <button onClick={() => setCurrentTribeIndex(p => p + 1)} className={`text-xl ${config.navColor}`}>❯</button>
              </div>
  
              <div className="absolute -bottom-[190px] md:-bottom-44 left-0 w-full flex flex-col items-center gap-3 z-50 pointer-events-auto">
                   <div className="flex items-center justify-center gap-2 w-full max-w-[350px] px-4">
                      <button onClick={() => handleAction('reaction')} className="flex-1 py-3 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-xl text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all">✨ HALO</button>
                      <button onClick={() => { if (currentUser) onOpenProfile(currentUser); }} className="flex-1 py-3 bg-black/80 text-white border-2 border-[#bf00ff] rounded-xl text-[9px] font-black uppercase shadow-[0_0_15px_rgba(191,0,255,0.4)] animate-pulse">⛩️ SANTUARIO</button>
                      <button onClick={() => setShowEchoInput(true)} className="flex-1 py-3 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-xl text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all">💬 ECO</button>
                   </div>
                   <p className={`text-[10px] font-black tracking-[0.3em] uppercase ${config.labelClass} drop-shadow-md`}>{config.labelText} // {currentUser.alias}</p>
              </div>
          </div> 
      </div>      

      {showEchoInput && (
          <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center backdrop-blur-md animate-fadeIn">
              <div className="w-full max-w-md text-center p-6">
                  <input autoFocus type="text" placeholder="ESCRIBE TU ECO..." className="w-full bg-transparent border-b-2 border-white/10 py-4 text-center text-white outline-none font-black text-2xl uppercase" value={echoText} onChange={e => setEchoText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAction('echo')} />
                  <div className="mt-8 flex justify-between px-4">
                      <button onClick={() => setShowEchoInput(false)} className="text-gray-500 text-xs font-bold">CANCELAR</button>
                      <button onClick={() => handleAction('echo')} className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold">ENVIAR</button>
                  </div>
              </div>
          </div>
      )}  
    </div>
  );
};

export default BioForest;