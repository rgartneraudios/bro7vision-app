// src/components/BioForest.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';

// 1. TUS COORDENADAS CALIBRADAS
const PC_SLOTS = [
    { x: 5, y: 25 }, { x: 7, y: 50 }, { x: 5, y: 75 },
    { x: 62, y: 15 }, { x: 65, y: 35 }, { x: 58, y: 80 },
    { x: 24, y: 3 },  { x: 60, y: 3 }
];
const MOBILE_SLOTS = [
    { x: 10, y: 6 }, { x: 30, y: 4 }, { x: 50, y: 6 }, { x: 70, y: 4 }, { x: 90, y: 6 }
];

const BioForest = ({ videoUsers, balances, setBalances, session, realityMode }) => {
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
  const [echoType, setEchoType] = useState('text'); // text, tts, audio
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
  const audioTribeRef = useRef(new Audio());
  const audioTimeoutRef = useRef(null);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  // --- 1. IDENTIDAD ---
  const displayUsers = useMemo(() => {
    const DJ_NEON = { 
        id: 'bot1', 
        alias: 'Dj_Neon', 
        poster: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=1000&auto=format&fit=crop",
        video_file: "https://dl.dropboxusercontent.com/scl/fi/sbubsg1n7vxluup8efp59/DJ-Neon.mp4?rlkey=6rcdr6hkya9xkk049wdhnxnx7&raw=1" 
    };
    return videoUsers?.length > 0 ? [...videoUsers, DJ_NEON] : [DJ_NEON];
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

  // --- ESTILOS ---
  // HE ACELERADO 'spin-slow' de 8s a 3s para que se note la rotación al subir
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
    /* Inicio: Aparece desde la izquierda abajo */
    0%   { 
        transform: translate(-80vw, -30vh) scale(0.9) rotate(0deg); 
        opacity: 0.8;
        z-index: 200;
    }
    
        
    /* Punto 1: Izquierda abajo X20, Y80 */
    15%  { 
        transform: translate(-30vw, 0vh) scale(1.3) rotate(90deg);
        z-index: 200;
    }
    
          
    /* Punto 3: Derecha arriba X70, Y60 */
    70%  { 
        transform: translate(10vw, -35vh) scale(1.2) rotate(450deg);
        z-index: 200;
    }
    
    /* Comienza a ir hacia el centro del visor */
    80%  { 
        transform: translate(5vw, -45vh) scale(0.9) rotate(540deg);
        z-index: 200;
    }
    
        
    /* Punto final: Centro del visor X50, Y20 */
    100% { 
        transform: translate(-30vw, -60vh) scale(0.05) rotate(720deg);
        z-index: 50;
        opacity: 0.8;
    }
}

.animate-vortex { 
    animation: vortexRise 6s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
}
  /* ROTACIÓN DEL REMOLINO (rápida y continua) */
  @keyframes vortexSpin {
      0% { transform: rotate(0deg) scale(1); }
      100% { transform: rotate(360deg) scale(1.05); }
  }
  
  .animate-spin-vortex { 
      animation: vortexSpin 1.5s linear infinite; 
  }

  /* PULSO DE ENERGÍA */
  @keyframes energyPulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 1; }
  }
  
  .animate-energy-pulse {
      animation: energyPulse 2s ease-in-out infinite;
  }

  /* ESPIRALES GIRANDO EN SENTIDO CONTRARIO */
  @keyframes spiralCounter {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(-360deg); }
  }
  
  .animate-spiral-counter {
      animation: spiralCounter 3s linear infinite;
  }

  /* PARTÍCULAS DE ENERGÍA */
  @keyframes particleOrbit {
      0% { transform: rotate(0deg) translateX(30px) scale(1); opacity: 1; }
      100% { transform: rotate(360deg) translateX(30px) scale(0.5); opacity: 0; }
  }
  
  .animate-particle-orbit {
      animation: particleOrbit 2s ease-out infinite;
  }

  /* DESTELLOS INTERMITENTES */
  @keyframes flare {
      0%, 60%, 100% { opacity: 0; transform: scale(0.8); }
      70% { opacity: 1; transform: scale(1.3); }
  }
  
  .animate-flare {
      animation: flare 3s ease-in-out infinite;
  }
`;   
   const colors = [
  "#00127A", // azul
  "#FF007D", // fucsia
  "#00FF48", // esmeralda
  "#4D00FA", // violeta
  "#facc15", // amarillo
  "#CF0000", // rojo
  "#00E1FF"  // cyan
];

const selectedColor = colors[Math.floor(Math.random() * colors.length)];

   
  // --- FUNCIONES AUXILIARES ---
  const getCleanUrl = (url) => {
    if (!url) return "";
    let clean = url.trim();
    if (clean.includes('dropbox.com')) {
        clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('&dl=0', '');
        return clean.includes('?') ? `${clean}&raw=1` : `${clean}?raw=1`;
    }
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
        console.error("DETALLE DEL ERROR:", error); // Esto te dirá exactamente qué falla
        return null; 
    }

    const { data: publicData } = supabase.storage.from('audio-echos').getPublicUrl(fileName);
    return publicData.publicUrl;
};

  // --- LÓGICA DE REPRODUCCIÓN (RADIO) ---
  const handlePlayTribe = () => {
    if (!isRadioReady) return;
    const eco = audioPool[currentTribeIndex];
    if (!eco) return;

    if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
    window.speechSynthesis.cancel();
    audioTribeRef.current.pause();
    audioTribeRef.current.currentTime = 0;

    if (eco.audio_link) {
        audioTribeRef.current.src = getCleanUrl(eco.audio_link);
        audioTribeRef.current.volume = 1.0;
        
        audioTribeRef.current.play().then(() => {
            setIsPlayingTribe(true);
            audioTimeoutRef.current = setTimeout(() => {
                let vol = 1.0;
                const fadeOut = setInterval(() => {
                    if (vol > 0.1) { vol -= 0.1; audioTribeRef.current.volume = vol; } 
                    else { clearInterval(fadeOut); audioTribeRef.current.pause(); setIsPlayingTribe(false); setCurrentTribeIndex(p => (p + 1) % audioPool.length); }
                }, 200);
            }, 20000); 
        }).catch(() => setIsPlayingTribe(false));
        
        audioTribeRef.current.onended = () => {
             if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
             setIsPlayingTribe(false);
        };
    } 
    else if (eco.text && (eco.text.includes('[TTS]') || eco.text.includes('[AUDIO]'))) {
        const cleanText = eco.text.replace('[TTS]', '').replace('[AUDIO]', '');
        const utt = new SpeechSynthesisUtterance(`${eco.author_alias} dice: ${cleanText}`);
        utt.rate = 0.9; 
        window.speechSynthesis.speak(utt);
        setIsPlayingTribe(true);
        utt.onend = () => setIsPlayingTribe(false);
    }
  };

  const toggleRadio = () => {
    if (isPlayingTribe) {
        window.speechSynthesis.cancel();
        audioTribeRef.current.pause();
        if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
        setIsPlayingTribe(false);
        setIsRadioReady(false);
    } else {
        setIsRadioReady(true);
        setTimeout(() => handlePlayTribe(), 100);
    }
  };

  const handleReport = async (echoId) => {
      if (!confirm("¿Reportar este mensaje como inapropiado?")) return;
      const { error } = await supabase.rpc('increment_report', { row_id: echoId }); 
      if (error) console.log("Report error:", error);
      alert("Reporte enviado. Gracias por limpiar el bosque.");
      setAudioPool(prev => prev.filter(e => e.id !== echoId));
      setVisualEchos(prev => prev.filter(e => e.id !== echoId));
  };

  // --- ENVÍO DE ECO ---
  const handleAction = async (type) => {
    if (!balances || balances.genesis < 100) { alert("SIN GÉNESIS..."); return; }
    const myAlias = realUserAlias || 'CIUDADANO';
    
    if (type === 'reaction') {
        setActiveReaction({ from: myAlias });
        setTimeout(() => setActiveReaction(null), 6000);
    } else {
        const finalText = echoType === 'tts' ? `[TTS]${echoText}` : echoText;

        const ecoData = { 
            target_profile_id: currentUser.id, 
            author_alias: myAlias, 
            text: finalText.toUpperCase(), 
            created_at: new Date()
        };

        const { data } = await supabase.from('bro_echos').insert([ecoData]).select();
        if (data) {
            const newEcho = data[0];
            if (echoType === 'text') setVisualEchos(prev => [newEcho, ...prev]);
            else setAudioPool(prev => [newEcho, ...prev]);
        }
        setShowEchoInput(false); setEchoText("");
    }
    
    const newGenesis = balances.genesis - 100;
    setBalances(prev => ({ ...prev, genesis: newGenesis }));
    await supabase.from('profiles').update({ genesis: newGenesis }).eq('id', session.user.id);
  };
  
  // --- CONFIG Y EFECTOS ---
  useEffect(() => {
    if (videoRef.current) { videoRef.current.load(); videoRef.current.muted = isMuted; }
    setVisualEchos([]); setAudioPool([]); setFloatingEchos([]); 
    setIsRadioReady(false); setIsPlayingTribe(false);

    if (!currentUser.id) return;
    const isUUID = /^[0-9a-f]{8}/i.test(currentUser.id);
    
    if (isUUID) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        supabase.from('bro_echos')
            .select('*')
            .eq('target_profile_id', currentUser.id)
            .gt('created_at', yesterday.toISOString())
            .lt('reports_count', 3)
            .order('created_at', { ascending: false })
            .limit(40)
        .then(({data}) => {
            if (data && data.length > 0) {
                setVisualEchos(data.filter(e => !e.audio_link && !e.text?.includes('[TTS]') && !e.text?.includes('[AUDIO]')));
                setAudioPool(data.filter(e => e.audio_link || e.text?.includes('[TTS]') || e.text?.includes('[AUDIO]')));
            } else {
                setAudioPool([{ id: 'a1', author_alias: 'SISTEMA', text: '[TTS] BIENVENIDO A LA RED' }]);
            }
        });
    } else {
        setVisualEchos([{ id: 's1', author_alias: 'SISTEMA', text: 'MODO SIMULACIÓN' }]);
        setAudioPool([{ id: 'a1', author_alias: 'SISTEMA', text: '[TTS] SINTONIZANDO SEÑAL...' }]);
    }
  }, [currentUser]);

  const config = useMemo(() => {
    switch(realityMode) {
      case 'blackhole': return { video: '/videos/eclipse_mode.mp4', colors: ['text-[#FFD700]', 'text-orange-400'], font: 'font-serif italic', border: 'border-[#C7AF38]/40 shadow-[0_0_40px_rgba(199,175,56,0.2)]', reactionColor: 'orange', labelClass: 'text-orange-500', labelText: 'ECLIPSE ZENITH', navColor: 'text-yellow-500' };
      case 'winter': return { video: '/videos/winter_mode.mp4', colors: ['text-orange-400', 'text-yellow-200'], font: 'font-black', border: 'border-orange-900/40 shadow-[0_0_30px_rgba(251,146,60,0.1)]', reactionColor: 'orange', labelClass: 'text-orange-400', labelText: 'WINTER CABIN', navColor: 'text-orange-500' };
      case 'summer': return { video: '/videos/summer_mode.mp4', colors: ['text-cyan-300', 'text-blue-400', 'text-emerald-200'], font: 'font-black tracking-tighter', border: 'border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]', reactionColor: 'cyan', labelClass: 'text-cyan-400', labelText: 'SUMMER REEF', navColor: 'text-cyan-300' };
      default: return { video: '/videos/bioforest.mp4', colors: ['text-cyan-400', 'text-fuchsia-400'], font: 'font-black', border: 'border-white/10 shadow-[0_0_60px_rgba(0,0,0,1)]', reactionColor: 'cyan', labelClass: 'text-cyan-400', labelText: 'GÉNESIS FOREST', navColor: 'text-cyan-400' };
    }
  }, [realityMode]);

  useEffect(() => { if (audioPool.length > 0 && isRadioReady) { handlePlayTribe(); } }, [currentTribeIndex, audioPool, isRadioReady]);
  
  // --- CORRECCIÓN ANIMACIÓN VISUAL ---
  useEffect(() => {
    if (!visualEchos || visualEchos.length === 0) return;
    let localSlot = 0;
    const interval = setInterval(() => {
        setFloatingEchos(prev => {
            const rawEcho = visualEchos[Math.floor(Math.random() * visualEchos.length)];
            const isMobile = window.innerWidth < 768;
            const currentSlots = isMobile ? MOBILE_SLOTS : PC_SLOTS;
            const coords = currentSlots[localSlot % currentSlots.length];
            localSlot++;
            return [...prev.slice(-2), { 
                ...rawEcho, 
                id: Date.now() + Math.random(), 
                x: coords.x, 
                y: coords.y, 
                color: config.colors[Math.floor(Math.random() * config.colors.length)] 
            }];
        });
    }, 4500); 
    return () => clearInterval(interval);
  }, [visualEchos, config]);

  const handleTouchStart = (e) => { touchStart.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e) => { touchEnd.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (distance > 70) setCurrentIndex(p => p + 1);
    if (distance < -70) setCurrentIndex(p => p - 1);
    touchStart.current = 0; touchEnd.current = 0;
  };

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden select-none font-mono">
      <style>{forestStyles}</style>
     {config.video && (
        <video src={config.video} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-[1]" />
    )}
      
      {/* ECOS VISUALES */}
      <div className="absolute inset-0 z-[10] pointer-events-none">
          {floatingEchos.map((echo) => (
              <div key={echo.id} className={`absolute animate-spirit ${echo.color} font-black text-center group`} style={{ left: `${echo.x}%`, top: `${echo.y}%` }}>
                  <p className="text-[9px] opacity-40 mb-1 uppercase tracking-widest">@{echo.author_alias}</p>
                  <p className="px-5 py-2.5 bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/5 text-xs md:text-xl shadow-2xl">"{echo.text}"</p>
                  <button onClick={() => handleReport(echo.id)} className="pointer-events-auto opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 text-[10px] bg-red-500/20 text-red-500 px-2 py-1 rounded-full hover:bg-red-500 hover:text-white transition-all">⚠️</button>
              </div>
          ))}
      </div>

      {/* ENVIO: GEMMA DE ENERGIA REMOLINO*/}
      {activeReaction && (
    <>
      <style>{forestStyles}</style>

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
              /* CAMBIO CLAVE: Posición inicial desde abajo-derecha */
              <div className="fixed bottom-4 right-[15%] z-[100] pointer-events-none animate-vortex">
                  <div className="relative flex flex-col items-center" style={{ mixBlendMode: 'screen' }}>
                      
                      {/* NÚCLEO DEL REMOLINO */}
                      <div className="relative w-36 h-36 flex items-center justify-center">
                          
                          {/* 1. AURA EXTERIOR GIRATORIA */}
                          <div 
                              className="absolute w-48 h-48 rounded-full blur-[40px] opacity-60 animate-energy-pulse"
                              style={{ background: randomColor.glow }}
                          ></div>
                          
                          {/* 2. REMOLINO PRINCIPAL */}
                          <div className="absolute w-40 h-40 animate-spin-vortex">
                              <div 
                                  className="w-full h-full rounded-full opacity-90"
                                  style={{
                                      background: `conic-gradient(from 0deg, 
                                          ${randomColor.primary}, 
                                          ${randomColor.secondary}, 
                                          transparent 40%, 
                                          ${randomColor.primary} 60%, 
                                          transparent 80%, 
                                          ${randomColor.secondary})`,
                                      filter: 'blur(4px)'
                                  }}
                              ></div>
                          </div>

                          {/* 3. REMOLINO SECUNDARIO */}
                          <div className="absolute w-32 h-32 animate-spiral-counter">
                              <div 
                                  className="w-full h-full rounded-full opacity-90"
                                  style={{
                                      background: `conic-gradient(from 180deg, 
                                          transparent, 
                                          ${randomColor.secondary} 30%, 
                                          transparent 50%, 
                                          ${randomColor.primary} 70%, 
                                          transparent)`,
                                      filter: 'blur(3px)'
                                  }}
                              ></div>
                          </div>

                          {/* 4. ANILLO DE ENERGÍA */}
                          <div 
                              className="absolute w-36 h-36 rounded-full animate-spin-vortex"
                              style={{
                                  border: `4px solid ${randomColor.secondary}`,
                                  opacity: 0.7,
                                  filter: 'blur(1px)',
                                  animationDuration: '2s'
                              }}
                          ></div>

                          {/* 5. NÚCLEO CENTRAL BRILLANTE */}
                          <div className="relative w-20 h-20 flex items-center justify-center">
                              <div 
                                  className="absolute w-24 h-24 rounded-full blur-[20px] opacity-80 animate-energy-pulse"
                                  style={{ background: randomColor.primary }}
                              ></div>
                              
                              <div 
                                  className="absolute w-16 h-16 rounded-full"
                                  style={{ 
                                      background: `radial-gradient(circle, white 20%, ${randomColor.secondary} 50%, ${randomColor.primary} 100%)`,
                                      boxShadow: `0 0 40px ${randomColor.glow}, 0 0 80px ${randomColor.glow}, 0 0 120px ${randomColor.glow}, 0 0 160px ${randomColor.glow}`
                                  }}
                              ></div>
                              
                              <div className="absolute w-6 h-6 bg-white rounded-full blur-[2px] shadow-[0_0_20px_white,0_0_40px_white]"></div>
                          </div>

                          {/* 6. DESTELLOS RADIALES */}
                          {[0, 1, 2, 3].map((i) => (
                              <div 
                                  key={i}
                                  className="absolute w-2 h-24 animate-flare"
                                  style={{
                                      background: `linear-gradient(to bottom, ${randomColor.secondary}, transparent)`,
                                      transform: `rotate(${i * 90}deg)`,
                                      transformOrigin: 'center',
                                      filter: 'blur(2px)',
                                      animationDelay: `${i * 0.5}s`
                                  }}
                              ></div>
                          ))}

                          {/* 7. PARTÍCULAS ORBITANDO */}
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                              <div 
                                  key={`particle-${i}`}
                                  className="absolute animate-particle-orbit"
                                  style={{ animationDelay: `${i * 0.3}s` }}
                              >
                                  <div 
                                      className="w-2 h-2 rounded-full blur-[1px]"
                                      style={{ background: i % 2 === 0 ? randomColor.primary : randomColor.secondary }}
                                  ></div>
                              </div>
                          ))}

                      </div>

                      {/* PARTÍCULAS FLOTANTES */}
                      <div className="absolute inset-0 w-48 h-48 -left-6 -top-6">
                          {[...Array(10)].map((_, i) => (
                              <div 
                                  key={`float-${i}`}
                                  className="absolute animate-particle-orbit"
                                  style={{
                                      left: `${20 + Math.random() * 60}%`,
                                      top: `${20 + Math.random() * 60}%`,
                                      animationDelay: `${Math.random() * 2}s`,
                                      animationDuration: `${2 + Math.random() * 2}s`
                                  }}
                              >
                                  <div 
                                      className="w-1 h-1 rounded-full blur-[1px]"
                                      style={{ background: randomColor.secondary }}
                                  ></div>
                              </div>
                          ))}
                      </div>

                  </div>
              </div>
          );
      })()}
    </>
)} 
          
      {/* VISOR CENTRAL */}
      <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20]">
          <div className="relative w-[88vw] md:w-[380px] h-[55vh] md:h-[600px]">
              <div className={`absolute inset-0 border-2 rounded-[3.5rem] bg-black overflow-hidden ${config.border}`}>
                  <video 
                    ref={videoRef} key={currentUser.id} src={getCleanUrl(currentUser.video_file)} poster={currentUser.poster || ""}
                    autoPlay loop muted={isMuted} playsInline className="w-full h-full object-cover" 
                    onTimeUpdate={() => setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)} 
                  />
                  <button onClick={() => setIsMuted(!isMuted)} className="absolute top-6 right-6 bg-black/60 p-3 rounded-full text-lg z-[150]">{isMuted ? '🔇' : '🔊'}</button>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10"><div className={`h-full ${config.reactionColor === 'orange' ? 'bg-orange-500' : 'bg-cyan-500'}`} style={{ width: `${progress}%` }}></div></div>
              </div>

              {/* FLECHAS PC */}
              <div className="hidden md:block absolute top-1/2 -left-20 -translate-y-1/2 z-[200]">
                    <button onClick={() => setCurrentIndex(p => p > 0 ? p - 1 : displayUsers.length - 1)} className={`hover:scale-125 transition-all text-7xl drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] ${config.navColor}`}>‹</button>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-20 -translate-y-1/2 z-[200]">
                    <button onClick={() => setCurrentIndex(p => p + 1)} className={`hover:scale-125 transition-all text-7xl drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] ${config.navColor}`}>›</button>
              </div>

              {/* REPRODUCTOR TRIBU CON BOTÓN REPORTE COMUNIDAD */}
  <div className="absolute -bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/90 backdrop-blur-3xl border border-white/10 px-6 py-2 rounded-full z-[150] shadow-2xl min-w-[240px]">
      <button onClick={() => setCurrentTribeIndex(p => (p > 0 ? p - 1 : audioPool.length - 1))} className={`hover:scale-125 transition-all text-2xl ${config.navColor}`}>❮</button>
      <div className="flex flex-col items-center flex-1">
          <button onClick={toggleRadio} className={`w-9 h-9 flex items-center justify-center rounded-full border border-white/20 transition-all ${isPlayingTribe ? 'bg-white text-black scale-110' : 'text-white'}`}>
              {isPlayingTribe ? '⏸' : '▶'}
          </button>
          <p className="text-[6px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">@{audioPool[currentTribeIndex]?.author_alias || 'SIN SEÑAL'}</p>
      </div>
      <button onClick={() => setCurrentTribeIndex(p => (p + 1) % audioPool.length)} className={`hover:scale-125 transition-all text-2xl ${config.navColor}`}>❯</button>
      
      {/* Botón Reportar Comunidad */}
      {audioPool[currentTribeIndex] && (
        <button 
            onClick={() => handleReport(audioPool[currentTribeIndex].id)} 
            className="ml-2 p-2 hover:bg-red-500/20 rounded-full transition-all group"
            title="Reportar contenido inapropiado"
        >
            <span className="text-xs grayscale group-hover:grayscale-0">⚠️</span>
        </button>
      )}
  </div>
  
              {/* BOTONERA ACCIÓN */}
              <div className="absolute -bottom-36 md:-bottom-44 left-0 w-full flex flex-col items-center gap-3">
                  <div className="flex gap-4">
                      <button onClick={() => handleAction('reaction')} className="px-6 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase shadow-lg">SEÑAL</button>
                      <button onClick={() => setShowEchoInput(true)} className="px-6 py-2.5 bg-black/90 border border-white/20 text-white rounded-xl text-[10px] font-black uppercase">ECO</button>
                  </div>
                  <p className={`text-[9px] md:text-[11px] font-black tracking-[0.4em] uppercase ${config.labelClass}`}>{config.labelText} // {currentUser.alias}</p>
              </div>
          </div>
      </div>

      {/* MODAL ECO SIMPLIFICADO */}
  {showEchoInput && (
      <div className="fixed inset-0 z-[1000] bg-black/98 flex items-center justify-center p-6 backdrop-blur-3xl">
          <div className="w-full max-w-sm text-center">
              <div className="flex gap-4 mb-12 justify-center">
                  <button onClick={() => setEchoType('text')} className={`px-6 py-2 rounded-full text-[10px] font-black border transition-all ${echoType === 'text' ? 'bg-cyan-500 text-black border-cyan-400' : 'text-white/30 border-white/10'}`}>💬 TEXTO VISUAL</button>
                  <button onClick={() => setEchoType('tts')} className={`px-6 py-2 rounded-full text-[10px] font-black border transition-all ${echoType === 'tts' ? 'bg-fuchsia-500 text-white border-fuchsia-400' : 'text-white/30 border-white/10'}`}>🤖 VOZ ROBOT</button>
              </div>

              <input autoFocus type="text" placeholder={echoType === 'text' ? "MENSAJE EN PANTALLA..." : "EL ROBOT DIRÁ..."} className="w-full bg-transparent border-b-2 border-white/10 py-6 text-center text-white outline-none font-black text-2xl uppercase focus:border-white transition-all" value={echoText} onChange={e => setEchoText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAction('echo')} maxLength={60} />

              <div className="mt-16 flex justify-between items-center px-4">
                  <button onClick={() => setShowEchoInput(false)} className="text-gray-500 text-[10px] font-black uppercase">VOLVER</button>
                  <button onClick={() => handleAction('echo')} className="bg-white text-black px-12 py-4 rounded-2xl font-black text-[11px] uppercase shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                      EMITIR ECO (100 G)
                  </button>
              </div>
          </div>
      </div>
  )}
  
      </div>
  );
};

export default BioForest;