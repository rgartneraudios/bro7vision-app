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
  const [showEchoInput, setShowEchoInput] = useState(false);
  const [echoType, setEchoType] = useState('text'); 
  const [echoText, setEchoText] = useState("");
  const [echoLink, setEchoLink] = useState("");
  const [nextSlot, setNextSlot] = useState(0);
  const [realUserAlias, setRealUserAlias] = useState("");

  const videoRef = useRef(null);
  const audioTribeRef = useRef(new Audio());
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  // --- 1. IDENTIDAD ---
  const displayUsers = useMemo(() => {
    const DJ_NEON = { id: 'bot1', alias: 'Dj_Neon', video_file: "https://dl.dropboxusercontent.com/scl/fi/sbubsg1n7vxluup8efp59/DJ-Neon.mp4?rlkey=6rcdr6hkya9xkk049wdhnxnx7&raw=1" };
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

  // --- 2. ESTILOS (ANIMACIÓN CORREGIDA: SOFT RISE & STAY) ---
  const forestStyles = `
    @keyframes spiritFade {
        0% { opacity: 0; transform: translateY(15px); filter: blur(5px); }
        8% { opacity: 1; transform: translateY(0); filter: blur(0px); } /* Entrada rápida */
        85% { opacity: 1; transform: translateY(-12px); filter: blur(0px); } /* Vuelo suave y larga estancia */
        100% { opacity: 0; transform: translateY(-35px); filter: blur(10px); } /* Desvanecimiento */
    }
    .animate-spirit { animation: spiritFade 10s ease-in-out forwards; }

    @keyframes glowSwim { 
        0% { transform: translateY(0) scale(0.5); opacity: 0; } 
        15% { opacity: 1; scale: 1; }
        100% { transform: translateY(-110vh) scale(3); opacity: 0; } 
    }
    .animate-glowSwim { animation: glowSwim 5.5s ease-in-out forwards; }

    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  `;

  const getCleanUrl = (url) => {
    if (!url) return "";
    let clean = url.trim();
    if (clean.includes('dropbox.com')) {
        clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('&dl=0', '');
        return clean.includes('?') ? `${clean}&raw=1` : `${clean}?raw=1`;
    }
    return clean;
  };

  const handlePlayTribe = () => {
    const eco = audioPool[currentTribeIndex];
    if (!eco || eco.text === "SINTONIZANDO SEÑAL...") return;

    window.speechSynthesis.cancel();
    audioTribeRef.current.pause();

    if (eco.audio_link) {
        audioTribeRef.current.src = getCleanUrl(eco.audio_link);
        audioTribeRef.current.play().catch(e => console.log("Audio Err"));
        setIsPlayingTribe(true);
        audioTribeRef.current.onended = () => setIsPlayingTribe(false);
    } else if (eco.text && (eco.text.includes('[AUDIO]') || eco.text.includes('[TTS]'))) {
        const cleanText = eco.text.replace('[AUDIO]', '').replace('[TTS]', '');
        const utt = new SpeechSynthesisUtterance(`${eco.author_alias} dice: ${cleanText}`);
        utt.rate = 0.85; utt.pitch = 0.7; 
        window.speechSynthesis.speak(utt);
        setIsPlayingTribe(true);
        utt.onend = () => setIsPlayingTribe(false);
    }
  };

  const config = useMemo(() => {
    switch(realityMode) {
      case 'blackhole': return { video: '/videos/eclipse_mode.mp4', colors: ['text-[#FFD700]', 'text-orange-400'], font: 'font-serif italic', border: 'border-[#C7AF38]/40 shadow-[0_0_40px_rgba(199,175,56,0.2)]', reactionColor: 'orange', labelClass: 'text-orange-500', labelText: 'ECLIPSE ZENITH', navColor: 'text-yellow-500' };
      case 'winter': return { video: '/videos/winter_mode.mp4', colors: ['text-orange-400', 'text-yellow-200'], font: 'font-black', border: 'border-orange-900/40 shadow-[0_0_30px_rgba(251,146,60,0.1)]', reactionColor: 'orange', labelClass: 'text-orange-400', labelText: 'WINTER CABIN', navColor: 'text-orange-500' };
      case 'summer': return { video: '/videos/summer_mode.mp4', colors: ['text-cyan-300', 'text-blue-400', 'text-emerald-200'], font: 'font-black tracking-tighter', border: 'border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]', reactionColor: 'cyan', labelClass: 'text-cyan-400', labelText: 'SUMMER REEF', navColor: 'text-cyan-300' };
      default: return { video: '/videos/bio_landing.mp4', colors: ['text-cyan-400', 'text-fuchsia-400'], font: 'font-black', border: 'border-white/10 shadow-[0_0_60px_rgba(0,0,0,1)]', reactionColor: 'cyan', labelClass: 'text-cyan-400', labelText: 'GÉNESIS FOREST', navColor: 'text-cyan-400' };
    }
  }, [realityMode]);

  const handleAction = async (type) => {
    if (!balances || balances.genesis < 100) { alert("SIN GÉNESIS..."); return; }
    const myAlias = realUserAlias || 'CIUDADANO';
    if (type === 'reaction') {
        setActiveReaction({ from: myAlias });
        setTimeout(() => setActiveReaction(null), 5500);
    } else {
        const finalLink = echoType === 'link' ? echoLink : null;
        // Ponemos prefijo [TTS] si es tipo tts para separarlo
        const finalText = echoType === 'tts' ? `[TTS]${echoText}` : echoText;

        const ecoData = { target_profile_id: currentUser.id, author_alias: myAlias, text: finalText.toUpperCase(), audio_link: finalLink };
        const { data } = await supabase.from('bro_echos').insert([ecoData]).select();
        
        if (data) {
            if (echoType === 'text') setVisualEchos(prev => [data[0], ...prev]);
            else setAudioPool(prev => [data[0], ...prev]);
        }
        setShowEchoInput(false); setEchoText(""); setEchoLink("");
    }
    const newGenesis = balances.genesis - 100;
    setBalances(prev => ({ ...prev, genesis: newGenesis }));
    await supabase.from('profiles').update({ genesis: newGenesis }).eq('id', session.user.id);
  };

  useEffect(() => {
    if (videoRef.current) { videoRef.current.load(); videoRef.current.muted = isMuted; }
    setVisualEchos([]); setAudioPool([]); setFloatingEchos([]); setCurrentTribeIndex(0);
    if (!currentUser.id) return;
    const isUUID = /^[0-9a-f]{8}/i.test(currentUser.id);
    if (isUUID) {
        supabase.from('bro_echos').select('*').eq('target_profile_id', currentUser.id).order('created_at', { ascending: false }).limit(40)
        .then(({data}) => {
            if (data && data.length > 0) {
                // FILTRO MAESTRO: Los visuales NO deben tener corchetes ni links
                setVisualEchos(data.filter(e => !e.audio_link && !e.text?.includes('[TTS]') && !e.text?.includes('[AUDIO]')));
                // Los audios son los que tienen link o corchetes
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

  useEffect(() => {
    if (!visualEchos.length) return;
    const interval = setInterval(() => {
        const rawEcho = visualEchos[Math.floor(Math.random() * visualEchos.length)];
        const isMobile = window.innerWidth < 768;
        const currentSlots = isMobile ? MOBILE_SLOTS : PC_SLOTS;
        const coords = currentSlots[nextSlot % currentSlots.length];
        setNextSlot((p) => (p + 1) % currentSlots.length);
        setFloatingEchos(prev => [...prev.slice(-2), { ...rawEcho, id: Date.now(), x: coords.x, y: coords.y, color: config.colors[Math.floor(Math.random() * config.colors.length)] }]);
    }, 5000);
    return () => clearInterval(interval);
  }, [visualEchos, nextSlot, config]);

  useEffect(() => { if (audioPool.length > 0) handlePlayTribe(); }, [currentTribeIndex, audioPool]);

  // SWIPE LOGIC
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
  <video 
    src={config.video} 
    autoPlay loop muted playsInline 
    className="absolute inset-0 w-full h-full object-cover z-[1]" // Eliminada la opacidad
  />
)}
      {/* ECOS VISUALES LIMPIOS */}
      <div className="absolute inset-0 z-[10] pointer-events-none">
          {floatingEchos.map((echo) => (
              <div key={echo.id} className={`absolute animate-spirit ${echo.color} font-black text-center`} style={{ left: `${echo.x}%`, top: `${echo.y}%` }}>
                  <p className="text-[9px] opacity-40 mb-1 uppercase tracking-widest">@{echo.author_alias}</p>
                  <p className="px-5 py-2.5 bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/5 text-xs md:text-xl shadow-2xl">"{echo.text}"</p>
              </div>
          ))}
      </div>

      {/* HALO MEDUSA (CORREGIDO) */}
      {activeReaction && (
          <div className="fixed inset-0 pointer-events-none z-[400]">
              <div className="absolute bottom-10 right-[15%] animate-glowSwim">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className={`absolute inset-0 ${config.reactionColor === 'orange' ? 'bg-orange-500/40' : 'bg-cyan-400/30'} rounded-full blur-[60px] animate-pulse`}></div>
                      <div className={`absolute w-32 h-32 ${config.reactionColor === 'orange' ? 'bg-yellow-200/40' : 'bg-white/20'} rounded-full blur-[40px]`}></div>
                      <div className="absolute w-14 h-14 bg-white rounded-full shadow-[0_0_50px_white]"></div>
                      <div className="absolute w-full h-full animate-spin-slow">
                           <div className={`absolute top-0 left-1/2 w-8 h-8 ${config.reactionColor === 'orange' ? 'bg-orange-400' : 'bg-white'} rounded-full blur-sm shadow-[0_0_20px_white]`}></div>
                           <div className={`absolute bottom-10 left-0 w-6 h-6 ${config.reactionColor === 'orange' ? 'bg-yellow-500' : 'bg-cyan-300'} rounded-full blur-sm`}></div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* VISOR CENTRAL */}
      <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20]">
          <div className="relative w-[88vw] md:w-[380px] h-[55vh] md:h-[600px]">
              <div className={`absolute inset-0 border-2 rounded-[3.5rem] bg-black overflow-hidden ${config.border}`}>
                  <video ref={videoRef} key={currentUser.id} src={getCleanUrl(currentUser.video_file)} autoPlay loop muted={isMuted} playsInline className="w-full h-full object-cover" onTimeUpdate={() => setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)} />
                  <button onClick={() => setIsMuted(!isMuted)} className="absolute top-6 right-6 bg-black/60 p-3 rounded-full text-lg z-[150]">{isMuted ? '🔇' : '🔊'}</button>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10"><div className={`h-full ${config.reactionColor === 'orange' ? 'bg-orange-500' : 'bg-cyan-500'}`} style={{ width: `${progress}%` }}></div></div>
              </div>

              {/* REPRODUCTOR TRIBU */}
              <div className="absolute -bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/90 backdrop-blur-3xl border border-white/10 px-6 py-2 rounded-full z-[150] shadow-2xl min-w-[200px]">
                  <button onClick={() => setCurrentTribeIndex(p => (p > 0 ? p - 1 : audioPool.length - 1))} className={`hover:scale-125 transition-all text-2xl ${config.navColor}`}>❮</button>
                  <div className="flex flex-col items-center flex-1">
                      <button onClick={handlePlayTribe} className={`w-9 h-9 flex items-center justify-center rounded-full border border-white/20 ${isPlayingTribe ? 'bg-white text-black' : 'text-white'}`}>
                          {isPlayingTribe ? '🔊' : '▶'}
                      </button>
                      <p className="text-[6px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">@{audioPool[currentTribeIndex]?.author_alias || '...'}</p>
                  </div>
                  <button onClick={() => setCurrentTribeIndex(p => (p + 1) % audioPool.length)} className={`hover:scale-125 transition-all text-2xl ${config.navColor}`}>❯</button>
              </div>

              <div className="absolute -bottom-36 md:-bottom-44 left-0 w-full flex flex-col items-center gap-3">
                  <div className="flex gap-4">
                      <button onClick={() => handleAction('reaction')} className="px-6 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase shadow-lg">SEÑAL</button>
                      <button onClick={() => setShowEchoInput(true)} className="px-6 py-2.5 bg-black/90 border border-white/20 text-white rounded-xl text-[10px] font-black uppercase">ECO</button>
                  </div>
                  <p className={`text-[9px] md:text-[11px] font-black tracking-[0.4em] uppercase ${config.labelClass}`}>{config.labelText} // {currentUser.alias}</p>
              </div>

              <div className="hidden md:block absolute top-1/2 -left-24 -translate-y-1/2"><button onClick={() => setCurrentIndex(p => p - 1)} className={`hover:scale-125 transition-all text-6xl drop-shadow-2xl ${config.navColor}`}>‹</button></div>
              <div className="hidden md:block absolute top-1/2 -right-24 -translate-y-1/2"><button onClick={() => setCurrentIndex(p => p + 1)} className={`hover:scale-125 transition-all text-6xl drop-shadow-2xl ${config.navColor}`}>›</button></div>
          </div>
      </div>

      {/* MODAL ECO TRIPLE */}
      {showEchoInput && (
          <div className="fixed inset-0 z-[1000] bg-black/98 flex items-center justify-center p-6 backdrop-blur-3xl">
              <div className="w-full max-w-sm text-center">
                  <div className="flex gap-2 mb-8 justify-center flex-wrap">
                      <button onClick={() => setEchoType('text')} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all ${echoType === 'text' ? 'bg-cyan-500 text-black border-cyan-400' : 'text-white/30 border-white/10'}`}>💬 TEXTO</button>
                      <button onClick={() => setEchoType('tts')} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all ${echoType === 'tts' ? 'bg-fuchsia-500 text-white border-fuchsia-400' : 'text-white/30 border-white/10'}`}>🤖 VOZ (TTS)</button>
                      <button onClick={() => setEchoType('link')} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all ${echoType === 'link' ? 'bg-blue-500 text-white border-blue-400' : 'text-white/30 border-white/10'}`}>🔗 LINK</button>
                  </div>
                  {echoType === 'link' ? (
                      <input autoFocus type="text" placeholder="LINK DROPBOX..." className="w-full bg-transparent border-b-2 border-white/10 py-6 text-center text-white outline-none font-black text-xs uppercase" value={echoLink} onChange={e => setEchoLink(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAction('echo')} />
                  ) : (
                      <input autoFocus type="text" placeholder={echoType === 'text' ? "MENSAJE VISUAL..." : "MENSAJE PARA EL ROBOT..."} className="w-full bg-transparent border-b-2 border-white/10 py-6 text-center text-white outline-none font-black text-2xl uppercase focus:border-white transition-all" value={echoText} onChange={e => setEchoText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAction('echo')} maxLength={60} />
                  )}
                  <div className="mt-12 flex justify-between gap-6 px-4">
                      <button onClick={() => setShowEchoInput(false)} className="text-gray-500 text-[10px] font-black uppercase">CANCELAR</button>
                      <button onClick={() => handleAction('echo')} className="bg-white text-black px-10 py-3 rounded-2xl font-black text-[10px] uppercase shadow-[0_0_20px_white]">EMITIR (100 G)</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BioForest;