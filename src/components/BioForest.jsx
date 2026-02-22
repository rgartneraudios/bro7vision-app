// src/components/BioForest.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { TV_NODES } from '../data/TvDatabase'; // <--- Importamos los canales
import Hls from 'hls.js'; // <--- MOTOR TV (IMPORTANTE)

// 1. TUS COORDENADAS CALIBRADAS (FLASH VERSION)
const PC_SLOTS = [
    { x: 5, y: 25 }, { x: 7, y: 50 }, { x: 14, y: 75 },
    { x: 62, y: 15 }, { x: 65, y: 35 }, { x: 65, y: 80 },
    { x: 24, y: 3 },  { x: 60, y: 3 }
];
const MOBILE_SLOTS = [
    { x: 10, y: 6 }, { x: 30, y: 4 }, { x: 50, y: 6 }, { x: 70, y: 4 }, { x: 90, y: 6 }
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

  // --- ESTADOS DE GRABACIÓN Y ECO ---
  const [showEchoInput, setShowEchoInput] = useState(false);
  const [echoType, setEchoType] = useState('text'); // text, tts, audio, hyper
  const [echoText, setEchoText] = useState("");
  
  // Grabadora
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Variables para lógica de ecos
  const [realUserAlias, setRealUserAlias] = useState("");

  const videoRef = useRef(null);
  const bgVideoRef = useRef(null); // <--- ESTA ES LA QUE TE FALTA Y DA ERROR 500
  const hlsRef = useRef(null);
    const audioTribeRef = useRef(new Audio());
  const audioTimeoutRef = useRef(null);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  // --- 1. IDENTIDAD ---
  const displayUsers = useMemo(() => {
    const DJ_NEON = { 
        id: 'bot1', 
        alias: 'Dj_Neon', 
        video_file: "https://dl.dropboxusercontent.com/scl/fi/sbubsg1n7vxluup8efp59/DJ-Neon.mp4?rlkey=6rcdr6hkya9xkk049wdhnxnx7&raw=1" 
    };
    
    // Fusión total: Usuarios Reales + DJ Neon + Canales de TV
    return videoUsers?.length > 0 
        ? [...videoUsers, DJ_NEON, ...TV_NODES] 
        : [DJ_NEON, ...TV_NODES];
}, [videoUsers]);

  const currentUser = useMemo(() => displayUsers[currentIndex % displayUsers.length], [displayUsers, currentIndex]);

  useEffect(() => {
    const fetchMyAlias = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase.from('profiles').select('alias').eq('id', session.user.id).single();
      if (data?.alias) setRealUserAlias(data.alias);
    };
    fetchMyAlias();
  }, [session]);
  
  // Este efecto busca al usuario del radar dentro de la lista del bosque
useEffect(() => {
  if (selectedForestUser && displayUsers.length > 0) {
    const targetIndex = displayUsers.findIndex(u => u.id === selectedForestUser.id);
    
    if (targetIndex !== -1) {
      setCurrentIndex(targetIndex);
    } else {
      console.log("Usuario no encontrado en la lista actual del bosque");
    }
  }
}, [selectedForestUser, displayUsers]);

  // --- LÓGICA DE REPRODUCCIÓN HLS (TV) + VIDEO NORMAL ---
  // ESTE ES EL BLOQUE NUEVO PARA QUE LA TV FUNCIONE EN PC
  useEffect(() => {
    const video = videoRef.current;
    const bgVideo = bgVideoRef.current; // Puede ser null si estás en modo TV
    
    // Si no hay usuario o el video principal no está listo, no hacemos nada
    if (!video || !currentUser) return;

    // Función auxiliar local para evitar problemas de hoisting
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

    const rawUrl = currentUser.video_file || "";
    const playUrl = cleanUrl(rawUrl);

    // 1. Limpieza de HLS previo
    if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
    }

    const isHLS = playUrl.includes('.m3u8');

    // Limpiamos el source del fondo si vamos a cambiar de canal, para evitar parpadeos
    if (bgVideo && isHLS) {
        bgVideo.pause();
        bgVideo.src = "";
    }

    if (isHLS) {
        // --- MODO TV (HLS) ---
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playUrl;
            video.play().catch(() => {});
        } else if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(playUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });
            hlsRef.current = hls;
        }
    } else {
        // --- MODO VIDEO NORMAL (MP4/Dropbox) ---
        // Verificamos si el src ha cambiado para no recargar en loop
        if (video.src !== playUrl && video.src !== window.location.origin + playUrl) {
            video.src = playUrl;
            video.load();
            video.play().catch(() => {});

            // Solo activamos el espejo si el elemento existe (no es TV)
            if (bgVideo) {
                bgVideo.src = playUrl; 
                bgVideo.load();
                bgVideo.muted = true; // Aseguramos mute
                bgVideo.play().catch(() => {});
            }
        }
    }

    video.muted = isMuted;
    
  }, [currentUser, isMuted]);  
  // --- ESTILOS ---
  const forestStyles = `
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
  `;   
   const colors = [ "#00127A", "#FF007D", "#00FF48", "#4D00FA", "#facc15", "#CF0000", "#00E1FF" ];
   const selectedColor = colors[Math.floor(Math.random() * colors.length)];

   // --- FUNCIONES AUXILIARES ---
  const getCleanUrl = (url) => {
    if (!url) return "";
    let clean = url.trim();
    
    if (clean.includes('dropbox.com')) {
        clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('&dl=0', '');
        return clean.includes('?') ? `${clean}&raw=1` : `${clean}?raw=1`;
    }
    
    // Si no es dropbox, NO lo toques.
    return clean;
};

  // --- LÓGICA DE GRABACIÓN DE AUDIO ---
  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);
            stream.getTracks().forEach(track => track.stop()); 
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        
        const timer = setInterval(() => {
            setRecordingTime(prev => {
                if (prev >= 20) { 
                    stopRecording();
                    clearInterval(timer);
                    return 20;
                }
                return prev + 1;
            });
        }, 1000);
        mediaRecorderRef.current.timer = timer;

    } catch (err) {
        alert("Necesitamos permiso de micrófono para grabar.");
        console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        clearInterval(mediaRecorderRef.current.timer);
        setIsRecording(false);
    }
  };

  const uploadAudioToSupabase = async () => {
    if (!audioBlob) return null;
    const fileName = `echo_${session.user.id}_${Date.now()}.webm`;
    
    // Intenta subir
    const { data, error } = await supabase.storage
        .from('audio-echos')
        .upload(fileName, audioBlob, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) { 
        console.error("DETALLE DEL ERROR:", error); 
        return null; 
    }

    const { data: publicData } = supabase.storage.from('audio-echos').getPublicUrl(fileName);
    return publicData.publicUrl;
};

  // --- LÓGICA DE REPRODUCCIÓN (RADIO) ---
  const handlePlayTribe = () => { /* ... Logica radio ... */ };
  const toggleRadio = () => { /* ... Logica radio ... */ };
  const handleReport = async (echoId) => {
      if (!confirm("¿Reportar este mensaje como inapropiado?")) return;
      const { error } = await supabase.rpc('increment_report', { row_id: echoId }); 
      if (error) console.log("Report error:", error);
      alert("Reporte enviado. Gracias por limpiar el bosque.");
      setAudioPool(prev => prev.filter(e => e.id !== echoId));
      setVisualEchos(prev => prev.filter(e => e.id !== echoId));
  };

  // --- ENVÍO DE ECO (LÓGICA HYPER MANTENIDA) ---
  const handleAction = async (type) => {
    // Calculamos el coste según el tipo
    const cost = echoType === 'hyper' ? 1000 : 100;
    
    if (!balances || balances.genesis < cost) { 
        alert(`NECESITAS ${cost} GÉNESIS PARA ESTA ACCIÓN...`); 
        return; 
    }

    const myAlias = realUserAlias || 'CIUDADANO';
    
    if (type === 'reaction') {
        setActiveReaction({ from: myAlias });
        setTimeout(() => setActiveReaction(null), 6000);
    } else {
        // Marcamos si es sponsored si el tipo es hyper
        const ecoData = { 
            target_profile_id: currentUser.id, // El canal donde estás ahora
            author_alias: myAlias, 
            advertiser_id: session.user.id, // <--- TU ID (El dueño del anuncio)
            text: echoText.toUpperCase(), 
            is_sponsored: echoType === 'hyper',
            created_at: new Date() 
        };

        const { data } = await supabase.from('bro_echos').insert([ecoData]).select();
        if (data) {
            const newEcho = data[0];
            if (echoType === 'text' || echoType === 'hyper') setVisualEchos(prev => [newEcho, ...prev]);
            else setAudioPool(prev => [newEcho, ...prev]);
        }
        setShowEchoInput(false); 
        setEchoText("");
    }
    
    // Descontamos los puntos (100 o 1.000)
    const newGenesis = balances.genesis - cost;
    setBalances(prev => ({ ...prev, genesis: newGenesis }));
    await supabase.from('profiles').update({ genesis: newGenesis }).eq('id', session.user.id);
};  
  // --- CONFIG Y EFECTOS ---
  useEffect(() => {
    // Nota: El load() y muted lo gestiona ahora el useEffect de HLS más arriba
    // pero mantenemos esto para limpiar estados al cambiar usuario
    setVisualEchos([]); setAudioPool([]); setFloatingEchos([]); 
    setIsRadioReady(false); setIsPlayingTribe(false);

    if (!currentUser.id) return;

    const fetchEchos = async () => {
        const isUUID = /^[0-9a-f]{8}/i.test(currentUser.id);
        
        // 1. Buscamos SIEMPRE los Hyper Echos (is_sponsored = true) de toda la red
        const { data: ads } = await supabase
            .from('bro_echos')
            .select('*')
            .eq('is_sponsored', true)
            .limit(10);

        let finalVisual = ads || [];
        let finalAudio = [];

        // 2. Si es un usuario REAL (UUID), sumamos sus mensajes personales
        if (isUUID) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const { data: userEchos } = await supabase
                .from('bro_echos')
                .select('*')
                .eq('target_profile_id', currentUser.id)
                .eq('is_sponsored', false) // Mensajes normales del canal
                .gt('created_at', yesterday.toISOString())
                .lt('reports_count', 3)
                .order('created_at', { ascending: false })
                .limit(30);

            if (userEchos) {
                const textEchos = userEchos.filter(e => !e.audio_link && !e.text?.includes('[TTS]'));
                const audioEchos = userEchos.filter(e => e.audio_link || e.text?.includes('[TTS]'));
                finalVisual = [...finalVisual, ...textEchos];
                finalAudio = audioEchos;
            }
        } else {
            // 3. Si es un BOT (como DJ Neon), añadimos el mensaje de sistema + los Ads
            finalVisual = [...finalVisual, { id: 's1', author_alias: 'SISTEMA', text: 'MODO SIMULACIÓN' }];
            finalAudio = [{ id: 'a1', author_alias: 'SISTEMA', text: '[TTS] SINTONIZANDO SEÑAL...' }];
        }

        setVisualEchos(finalVisual);
        setAudioPool(finalAudio.length > 0 ? finalAudio : [{ id: 'a1', author_alias: 'SISTEMA', text: '[TTS] BIENVENIDO A LA RED' }]);
    };

    fetchEchos();
}, [currentUser]);  
  const getTimeSuffix = () => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 15) return 'D'; // Día / Mañana
    if (hour >= 15 && hour < 21) return 'T'; // Tarde
    return 'N'; // Noche
  };

  const config = useMemo(() => {
    const time = getTimeSuffix();
    switch(realityMode) {
      case 'solo_earth': return { video: time === 'D' ? '/videos/solo_earth_1.mp4' : time === 'T' ? '/videos/solo_earth_2.mp4' : '/videos/solo_earth_3.mp4', colors: ['text-emerald-600', 'text-cyan-300'], font: 'font-sans font-bold', border: 'border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]', reactionColor: 'emerald', labelClass: 'text-emerald-600', labelText: 'SOLO EARTH', navColor: 'text-emerald-500' };
      case 'band_earth': return { video: time === 'D' ? '/videos/band_earth_1.mp4' : time === 'T' ? '/videos/band_earth_2.mp4' : '/videos/band_earth_3.mp4', colors: ['text-blue-400', 'text-indigo-300'], font: 'font-sans font-black', border: 'border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)]', reactionColor: 'blue', labelClass: 'text-blue-400', labelText: 'BAND EARTH ', navColor: 'text-blue-400' };
      case 'solo_fantasy': return { video: time === 'D' ? '/videos/solo_fantasy_1.mp4' : time === 'T' ? '/videos/solo_fantasy_2.mp4' : '/videos/solo_fantasy_3.mp4', colors: ['text-cyan-400', 'text-fuchsia-400'], font: 'font-mono tracking-widest', border: 'border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]', reactionColor: 'cyan', labelClass: 'text-cyan-400', labelText: 'SOLO FANTASY', navColor: 'text-cyan-400' };
      case 'band_fantasy': return { video: time === 'D' ? '/videos/band_fantasy_1.mp4' : time === 'T' ? '/videos/band_fantasy_2.mp4' : '/videos/band_fantasy_3.mp4', colors: ['text-fuchsia-500', 'text-purple-300'], font: 'font-mono uppercase', border: 'border-fuchsia-500/40 shadow-[0_0_50px_rgba(217,70,239,0.25)]', reactionColor: 'fuchsia', labelClass: 'text-fuchsia-400', labelText: 'BAND FANTASY', navColor: 'text-fuchsia-500' };
      case 'solo_cinema': return { video: time === 'D' ? '/videos/solo_cinema_1.mp4' : time === 'T' ? '/videos/solo_cinema_2.mp4' : '/videos/solo_cinema_3.mp4', colors: ['text-amber-500', 'text-orange-300'], font: 'font-serif italic', border: 'border-amber-600/30 shadow-[0_0_40px_rgba(245,158,11,0.2)]', reactionColor: 'amber', labelClass: 'text-amber-500', labelText: 'SOLO CINEMA ', navColor: 'text-amber-600' };
      case 'band_cinema': return { video: time === 'D' ? '/videos/band_cinema_1.mp4' : time === 'T' ? '/videos/band_cinema_2.mp4' : '/videos/band_cinema_3.mp4', colors: ['text-orange-400', 'text-yellow-200'], font: 'font-serif font-black uppercase', border: 'border-orange-500/40 shadow-[0_0_40px_rgba(251,146,60,0.2)]', reactionColor: 'orange', labelClass: 'text-orange-400', labelText: 'BAND CINEMA ', navColor: 'text-orange-500' };
      case 'eclipse': return { video: '/videos/eclipse_mode.mp4', colors: ['text-yellow-500', 'text-orange-200'], font: 'font-serif italic font-bold', border: 'border-yellow-600/40 shadow-[0_0_50px_rgba(234,179,8,0.3)]', reactionColor: 'orange', labelClass: 'text-yellow-500', labelText: 'ECLIPSE ZENITH', navColor: 'text-yellow-500' };
      default: return { video: '/videos/eclipse_mode.mp4', colors: ['text-cyan-400', 'text-white'], font: 'font-black', border: 'border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]', reactionColor: 'cyan', labelClass: 'text-cyan-400', labelText: 'GENESIS NODE', navColor: 'text-cyan-400' };
    }
  }, [realityMode]);  
  useEffect(() => { if (audioPool.length > 0 && isRadioReady) { handlePlayTribe(); } }, [currentTribeIndex, audioPool, isRadioReady]);
  
  // --- CORRECCIÓN ANIMACIÓN VISUAL + PUBLICIDAD INYECTADA (HYPER-ECO) ---
  useEffect(() => {
    // Si no hay ecos visuales, no hacemos nada
    if (!visualEchos || visualEchos.length === 0) return;

    let localSlot = 0;
    const interval = setInterval(() => {
      setFloatingEchos(prev => {
          // 1. Separamos los anuncios reales de los mensajes normales
          const realAds = visualEchos.filter(e => e.is_sponsored === true);
          const normalEchos = visualEchos.filter(e => !e.is_sponsored);

          // 2. Probabilidad de anuncio (25% de las veces sale un Hyper Eco)
          const isAdTime = Math.random() > 0.75; 
          
          let echoToPush;
          
          if (isAdTime) {
              // PRIORIDAD: Si hay Hyper Echos pagados en la base de datos, mostramos uno
              if (realAds.length > 0) {
                  echoToPush = realAds[Math.floor(Math.random() * realAds.length)];
              } else {
                  // FALLBACK: Si nadie ha pagado, mostramos el anuncio del sistema
                  echoToPush = {
                      id: `SYSTEM_AD`,
                      is_sponsored: true,
                      author_alias: 'BROVISION TV',
                      text: '🔴 ¿QUIERES VER TV EN VIVO? HAZ CLIC AQUÍ',
                      target_index: 0
                  };
              }
          } else {
              // ECO NORMAL: Mensajes de los ciudadanos
              if (normalEchos.length > 0) {
                  echoToPush = normalEchos[Math.floor(Math.random() * normalEchos.length)];
              } else {
                  echoToPush = visualEchos[Math.floor(Math.random() * visualEchos.length)];
              }
          }

          const isMobile = window.innerWidth < 768;
          const currentSlots = isMobile ? MOBILE_SLOTS : PC_SLOTS;
          const coords = currentSlots[localSlot % currentSlots.length];
          localSlot++;

          return [...prev.slice(-2), { 
              ...echoToPush, 
              id: Date.now() + Math.random(), 
              x: coords.x, 
              y: coords.y 
          }];
      });
  }, 4500); 
  return () => clearInterval(interval);
}, [visualEchos]);

  const handleTouchStart = (e) => { touchStart.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e) => { touchEnd.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (distance > 70) setCurrentIndex(p => p + 1);
    if (distance < -70) setCurrentIndex(p => p - 1);
    touchStart.current = 0; touchEnd.current = 0;
  };

  // Detectamos si el usuario actual es un canal de TV (por propiedad isTv o is_tv)
  const isTvMode = currentUser && (currentUser.isTv || currentUser.is_tv);

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden select-none font-mono">
      <style>{forestStyles}</style>
     {config.video && (
        <video src={config.video} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-[1]" />
    )}
      
      {/* ECOS VISUALES MEJORADOS (MANTENIDOS) */}
      <div className="absolute inset-0 z-[10] pointer-events-none">
          {floatingEchos.map((echo) => {
    const isAd = echo.is_sponsored === true;
    
    // Paleta de colores para ecos normales (Neones potentes)
    const neonColors = [
        { border: 'border-cyan-400', text: 'text-cyan-400', glow: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]' },
        { border: 'border-fuchsia-500', text: 'text-fuchsia-400', glow: 'shadow-[0_0_10px_rgba(217,70,239,0.5)]' },
        { border: 'border-emerald-400', text: 'text-emerald-400', glow: 'shadow-[0_0_10px_rgba(52,211,153,0.5)]' },
        { border: 'border-violet-500', text: 'text-violet-400', glow: 'shadow-[0_0_10px_rgba(139,92,246,0.5)]' }
    ];
    const randomNeon = neonColors[Math.floor(Math.random() * neonColors.length)];

    return (
        <div 
          key={echo.id} 
          className={`absolute animate-spirit text-center group transition-all
              ${isAd ? 'z-[60] pointer-events-auto cursor-pointer scale-110' : 'pointer-events-none z-[40]'}
          `}
          style={{ left: `${echo.x}%`, top: `${echo.y}%` }}
          onClick={() => { 
            if (isAd) {
                // LÓGICA ZAP MANTENIDA
                const advertiserData = videoUsers.find(u => u.id === echo.advertiser_id);
                
                if (advertiserData) {
                    displayUsers.splice(currentIndex + 1, 0, {
                        ...advertiserData,
                        id: `zap_${Date.now()}`, 
                        is_zap: true 
                    });
                    setCurrentIndex(currentIndex + 1);
                    console.log("⚡ ZAP SEAMLESS: Usuario movido al canal inyectado");
                } else {
                    setCurrentIndex(0);
                }
            }
        }}
        >
           {/* ETIQUETA SUPERIOR: ORO ELÉCTRICO */}
<p className={`text-[8px] mb-1 uppercase tracking-[0.5em] font-black 
    ${isAd 
        ? 'text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]' 
        : 'opacity-80 ' + randomNeon.text}
`}>
    {isAd ? '⚡ HYPER ZAP' : `@${echo.author_alias}`}
</p>

{/* CUERPO DEL ECO: CRISTAL NEGRO CON BORDE DUAL */}
<div className={`
    border backdrop-blur-3xl transition-all duration-700
    ${isAd 
        ? 'px-5 py-2.5 rounded-[2rem] bg-[#0C0C1C]/50 border-[#E3DDB1]/30 text-white font-medium shadow-[0_0_20px_rgba(0,0,0,0.9),inset_0_0_10px_rgba(255,215,0,0.05)] border-[1px]' 
        : `px-7 py-3 rounded-[2.5rem] bg-black/90 border ${randomNeon.border} ${randomNeon.text} ${randomNeon.glow}`
    }
`}>
    {/* TEXTO CON UN LIGERO RESPLANDOR BLANCO PARA QUE SE LEA FÁCIL */}
    <span className={isAd ? "text-xs md:text-base tracking-wide text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]" : "text-xs md:text-lg"}>
        "{echo.text}"
    </span>
    
    {isAd && (
        /* BOTÓN: FUSIÓN DE TUS ESFERAS CON EL NEÓN */
        <div className="mt-2 relative overflow-hidden py-1.5 px-5 rounded-full border border-[#DED590]/50 group
            bg-gradient-to-r from-amber-200/20 via-yellow-300/20 to-amber-100/20 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
            
            {/* El destello (usa el mismo CSS que pusimos en index.css) */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
            
            <span className="text-[9px] text-[#FFD700] font-black tracking-[0.3em] uppercase relative z-10 drop-shadow-[0_0_3px_rgba(255,215,0,0.5)]">
                ENTRAR ▶
            </span>
        </div>
    )}
</div>
            {!isAd && (
                <button onClick={() => handleReport(echo.id)} className="pointer-events-auto opacity-0 group-hover:opacity-100 absolute -top-4 -right-4 bg-red-600/20 p-2 rounded-full text-[8px] hover:bg-red-600 transition-all">⚠️</button>
            )}
        </div>
    );
})}
      </div>

      {/* ENVIO: GEMMA DE ENERGIA REMOLINO (Se mantiene igual) */}
      {activeReaction && (
    <>
      <style>{forestStyles}</style>
      {/* VÓRTICE MANTENIDO */}
       {(() => {
          const colors = [
              { name: "azul", primary: "#00127A", secondary: "#006AED", glow: "rgba(59,130,246,0.6)" },
              { name: "fucsia", primary: "#FF007D", secondary: "#f472b6", glow: "rgba(236,72,153,0.6)" },
              { name: "esmeralda", primary: "#00FF48", secondary: "#00FFF2", glow: "rgba(16,185,129,0.6)" },
              { name: "violeta", primary: "#4D00FA", secondary: "#7C4FFF", glow: "rgba(139,92,246,0.6)" },
              { name: "amarillo", primary: "#facc15", secondary: "#FFFF00", glow: "rgba(250,204,21,0.6)" },
              { name: "rojo", primary: "#CF0000", secondary: "#F70C0C", glow: "rgba(239,68,68,0.6)" },
              { name: "cyan", primary: "#00E1FF", secondary: "#61C8FF", glow: "rgba(6,182,212,0.6)" }
          ];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          return (
              <div className="fixed bottom-4 right-[15%] z-[100] pointer-events-none animate-vortex">
                  <div className="relative flex flex-col items-center" style={{ mixBlendMode: 'screen' }}>
                      <div className="relative w-36 h-36 flex items-center justify-center">
                          <div className="absolute w-48 h-48 rounded-full blur-[40px] opacity-60 animate-energy-pulse" style={{ background: randomColor.glow }}></div>
                          <div className="absolute w-40 h-40 animate-spin-vortex"><div className="w-full h-full rounded-full opacity-90" style={{ background: `conic-gradient(from 0deg, ${randomColor.primary}, ${randomColor.secondary}, transparent 40%, ${randomColor.primary} 60%, transparent 80%, ${randomColor.secondary})`, filter: 'blur(4px)' }}></div></div>
                          <div className="absolute w-32 h-32 animate-spiral-counter"><div className="w-full h-full rounded-full opacity-90" style={{ background: `conic-gradient(from 180deg, transparent, ${randomColor.secondary} 30%, transparent 50%, ${randomColor.primary} 70%, transparent)`, filter: 'blur(3px)' }}></div></div>
                          <div className="absolute w-36 h-36 rounded-full animate-spin-vortex" style={{ border: `4px solid ${randomColor.secondary}`, opacity: 0.7, filter: 'blur(1px)', animationDuration: '2s' }}></div>
                          <div className="relative w-20 h-20 flex items-center justify-center">
                              <div className="absolute w-24 h-24 rounded-full blur-[20px] opacity-80 animate-energy-pulse" style={{ background: randomColor.primary }}></div>
                              <div className="absolute w-16 h-16 rounded-full" style={{ background: `radial-gradient(circle, white 20%, ${randomColor.secondary} 50%, ${randomColor.primary} 100%)`, boxShadow: `0 0 40px ${randomColor.glow}, 0 0 80px ${randomColor.glow}, 0 0 120px ${randomColor.glow}, 0 0 160px ${randomColor.glow}` }}></div>
                              <div className="absolute w-6 h-6 bg-white rounded-full blur-[2px] shadow-[0_0_20px_white,0_0_40px_white]"></div>
                          </div>
                          {[0, 1, 2, 3].map((i) => (<div key={i} className="absolute w-2 h-24 animate-flare" style={{ background: `linear-gradient(to bottom, ${randomColor.secondary}, transparent)`, transform: `rotate(${i * 90}deg)`, transformOrigin: 'center', filter: 'blur(2px)', animationDelay: `${i * 0.5}s` }}></div>))}
                          {[0, 1, 2, 3, 4, 5].map((i) => (<div key={`particle-${i}`} className="absolute animate-particle-orbit" style={{ animationDelay: `${i * 0.3}s` }}><div className="w-2 h-2 rounded-full blur-[1px]" style={{ background: i % 2 === 0 ? randomColor.primary : randomColor.secondary }}></div></div>))}
                      </div>
                      <div className="absolute inset-0 w-48 h-48 -left-6 -top-6">
                          {[...Array(10)].map((_, i) => (<div key={`float-${i}`} className="absolute animate-particle-orbit" style={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 2}s` }}><div className="w-1 h-1 rounded-full blur-[1px]" style={{ background: randomColor.secondary }}></div></div>))}
                      </div>
                  </div>
              </div>
          );
      })()}
    </>
)} 
          
      {/* --- BLOQUE MAESTRO MARAVILLA: VISOR + TV + EFECTO ESPEJO --- */}
      <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20]">
          <div className="relative w-[88vw] md:w-[380px] h-[55vh] md:h-[600px]">
             <div className={`absolute inset-0 border-2 rounded-[3.5rem] bg-black overflow-hidden ${config.border} flex items-center justify-center`}>
    
    {/* 1. EL ESPEJO (Background) - Solo para videos que no son TV */}
    {!isTvMode && (
      <video 
        ref={bgVideoRef}
        className="absolute inset-0 w-full h-full object-cover scale-150 blur-[40px] opacity-50 saturate-150 pointer-events-none z-0"
        muted
        loop
        playsInline
      />
    )}

    {/* 2. MAQUILLAJE PARA TV (Si es TV, usamos un aura de color fija) */}
    {isTvMode && (
      <div className="absolute inset-0 z-0 opacity-30 blur-[60px] scale-150 pointer-events-none bg-gradient-to-t from-blue-900 via-lila-900 to-white-pink"></div>
    )}

    {/* 3. CAPA DE OSCURIDAD INTERMEDIA */}
    <div className="absolute inset-0 bg-black/20 z-[5] pointer-events-none" />

    {/* 4. VIDEO PRINCIPAL */}
    <video 
      ref={videoRef} 
      key={currentUser.id}  
                    poster={currentUser.poster || ""}
                    autoPlay 
                    loop={!isTvMode} 
                    muted={isMuted} 
                    playsInline 
                    className={`relative z-10 transition-all duration-700 
        ${isTvMode ? 'w-full h-auto aspect-video object-contain bg-black' : 'w-full h-full object-cover'}`}  
                    onTimeUpdate={() => videoRef.current && setProgress((videoRef.current.currentTime / (videoRef.current.duration || 100)) * 100)} 
                  />

                  {/* 5. BOTÓN MUTE */}
                  <button onClick={() => setIsMuted(!isMuted)} className="absolute top-6 right-6 bg-black/60 backdrop-blur-md p-3 rounded-full text-lg z-[150]">
                      {isMuted ? '🔇' : '🔊'}
                  </button>
                  
                  {/* 6. BARRA DE PROGRESO */}
                  {!isTvMode && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-[150]">
                        <div className={`h-full transition-all duration-300 ${config.reactionColor === 'orange' ? 'bg-orange-500' : 'bg-cyan-500'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                  )}
              </div>

              {/* FLECHAS PC */}
              <div className="hidden md:block absolute top-1/2 -left-20 -translate-y-1/2 z-[200]">
                    <button onClick={() => setCurrentIndex(p => p > 0 ? p - 1 : displayUsers.length - 1)} className={`hover:scale-125 transition-all text-7xl drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] ${config.navColor}`}>‹</button>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-20 -translate-y-1/2 z-[200]">
                    <button onClick={() => setCurrentIndex(p => p + 1)} className={`hover:scale-125 transition-all text-7xl drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] ${config.navColor}`}>›</button>
              </div>

              {/* REPRODUCTOR TRIBU */}
              <div className="absolute -bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/90 backdrop-blur-3xl border border-white/10 px-6 py-2 rounded-full z-[150] shadow-2xl min-w-[240px]">
                  <button onClick={() => setCurrentTribeIndex(p => (p > 0 ? p - 1 : audioPool.length - 1))} className={`hover:scale-125 transition-all text-2xl ${config.navColor}`}>❮</button>
                  <div className="flex flex-col items-center flex-1">
                      <button onClick={toggleRadio} className={`w-9 h-9 flex items-center justify-center rounded-full border border-white/20 transition-all ${isPlayingTribe ? 'bg-white text-black scale-110' : 'text-white'}`}>
                          {isPlayingTribe ? '⏸' : '▶'}
                      </button>
                      <p className="text-[6px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">@{audioPool[currentTribeIndex]?.author_alias || 'SIN SEÑAL'}</p>
                  </div>
                  <button onClick={() => setCurrentTribeIndex(p => (p + 1) % audioPool.length)} className={`hover:scale-125 transition-all text-2xl ${config.navColor}`}>❯</button>
              </div>
  
              {/* BOTONERA ACCIÓN - VERSIÓN SUAVE (SIN PUNTAS) */}
<div className="absolute -bottom-36 md:-bottom-44 left-0 w-full flex flex-col items-center gap-3 z-50 pointer-events-auto">
    
    {/* Esta es la "capa sombra" pero con bordes redondeados como el visor */}
    <div className="absolute inset-x-2 -inset-y-4 bg-black/60 backdrop-blur-md rounded-[3rem] -z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]"></div>

    <div className="flex items-center justify-center gap-2 w-full max-w-[350px] px-4">
        {/* Botón HALO */}
        <button onClick={() => handleAction('reaction')} className="flex-1 py-3 bg-white text-black border border-white rounded-xl text-[9px] font-black uppercase shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform">
            ✨ HALO
        </button>

       {/* Botón SANTUARIO - TEXTO BLANCO CON GLOW VIOLETA */}
        <button 
            onClick={() => { if (currentUser) { onOpenProfile(currentUser); } }} 
            className="flex-1 py-3 bg-black text-white border-2 border-[#bf00ff] rounded-xl text-[9px] font-black uppercase 
                       shadow-[0_0_15px_rgba(191,0,255,0.6),inset_0_0_8px_rgba(191,0,255,0.4)] 
                       hover:shadow-[0_0_25px_rgba(191,0,255,0.9),inset_0_0_12px_rgba(191,0,255,0.6)] 
                       hover:scale-105 transition-all animate-pulse"
        >
            <span className="drop-shadow-[0_0_8px_rgba(191,0,255,0.9)]">⛩️ SANTUARIO</span>
        </button>
                        
        {/* Botón ECO */}
        <button onClick={() => setShowEchoInput(true)} className="flex-1 py-3 bg-black/90 border border-white/20 text-white rounded-xl text-[9px] font-black uppercase">
            💬 ECO
        </button>
    </div>

    {/* Texto inferior */}
    <p className={`relative z-10 text-[9px] md:text-[11px] font-black tracking-[0.4em] uppercase ${config.labelClass} mt-1 drop-shadow-lg`}>
        {config.labelText} // {currentUser.alias}
    </p>
</div>
          </div> 
      </div> 

      {/* MODAL ECO INTEGRADO */}
      {showEchoInput && (
          <div className="fixed inset-0 z-[1000] bg-black/98 flex items-center justify-center p-6 backdrop-blur-3xl animate-fadeIn">
              <div className="w-full max-w-md text-center">
                  <div className="flex gap-2 mb-12 justify-center flex-wrap">
                      <button onClick={() => setEchoType('text')} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all ${echoType === 'text' ? 'bg-cyan-500 text-black border-cyan-400' : 'text-white/30 border-white/10'}`}>💬 TEXTO NEÓN</button>
                      <button onClick={() => setEchoType('tts')} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all ${echoType === 'tts' ? 'bg-fuchsia-500 text-white border-fuchsia-400' : 'text-white/30 border-white/10'}`}>🤖 VOZ ROBOT</button>
                      <button onClick={() => setEchoType('hyper')} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all ${echoType === 'hyper' ? 'bg-[#002366] text-cyan-400 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-white/30 border-white/10'}`}>⚡ HYPER ZAP</button>
                  </div>
                  <input autoFocus type="text" placeholder={echoType === 'hyper' ? "TÍTULO DEL ANUNCIO..." : "ESCRIBE TU ECO..."} className="w-full bg-transparent border-b-2 border-white/10 py-6 text-center text-white outline-none font-black text-2xl uppercase focus:border-white transition-all" value={echoText} onChange={e => setEchoText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAction('echo')} maxLength={60} />
                  <div className="mt-16 flex justify-between items-center px-4">
                      <button onClick={() => setShowEchoInput(false)} className="text-gray-500 text-[10px] font-black uppercase hover:text-white">VOLVER</button>
                      <button onClick={() => handleAction('echo')} className={`px-12 py-4 rounded-2xl font-black text-[11px] uppercase transition-all ${echoType === 'hyper' ? 'bg-[#002366] text-cyan-400 border border-cyan-500' : 'bg-white text-black'}`}>
                          {echoType === 'hyper' ? 'EMITIR HYPER ZAP (1000 G)' : 'EMITIR ECO (100 G)'}
                      </button>
                  </div>
              </div>
          </div>
      )}  
    </div>
  );
};

export default BioForest;