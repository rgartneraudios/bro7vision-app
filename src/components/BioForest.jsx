// src/components/BioForest.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';

// 1. GRILLA DE POSICIONES PARA ECOS (Evita que se encimen)
const SLOTS = [
    { x: 8, y: 20 }, { x: 10, y: 45 }, { x: 12, y: 70 }, // Izquierda
    { x: 72, y: 20 }, { x: 70, y: 45 }, { x: 68, y: 70 }, // Derecha
    { x: 30, y: 12 }, { x: 60, y: 12 }                    // Superiores
];

const BioForest = ({ videoUsers, balances, setBalances, session, realityMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeReaction, setActiveReaction] = useState(null);
  const [echos, setEchos] = useState([]); 
  const [echoPool, setEchoPool] = useState([]); 
  const [showEchoInput, setShowEchoInput] = useState(false);
  const [echoText, setEchoText] = useState("");
  const [nextSlot, setNextSlot] = useState(0);

  const videoRef = useRef(null);

  // --- CONFIGURACIÓN VISUAL MAESTRA ---
  const config = useMemo(() => {
    switch(realityMode) {
      case 'blackhole': return { 
        video: '/videos/eclipse_mode.mp4', 
        colors: ['text-[#FFD700]', 'text-[#F97316]', 'text-[#FFFFFF]'], 
        font: 'font-serif italic tracking-widest',
        border: 'border-[#C7AF38]/50 shadow-[0_0_40px_rgba(199,175,56,0.3)]',
        reactionColor: 'orange',
        labelClass: 'text-orange-500',
        labelText: 'ECLIPSE ZENITH'
      };
      case 'winter': return { 
        video: '/videos/winter_mode.mp4', 
        colors: ['text-orange-400', 'text-red-400', 'text-yellow-200'], 
        font: 'font-black tracking-tighter', 
        border: 'border-orange-900/30 shadow-[0_0_30px_rgba(251,146,60,0.1)]', 
        reactionColor: 'orange',
        labelClass: 'text-orange-400',
        labelText: 'WINTER CABIN'
      };
      case 'summer': return { 
        video: '/videos/summer_mode.mp4', 
        colors: ['text-cyan-300', 'text-blue-400', 'text-emerald-200'], 
        font: 'font-black tracking-tighter', 
        border: 'border-cyan-400/30', 
        reactionColor: 'cyan',
        labelClass: 'text-cyan-400',
        labelText: 'SUMMER REEF'
      };
      default: return { 
        video: '/videos/bio_landing.mp4', 
        colors: ['text-cyan-400', 'text-fuchsia-400', 'text-yellow-400'], 
        font: 'font-black tracking-tighter', 
        border: 'border-white/10 shadow-[0_0_60px_rgba(0,0,0,1)]', 
        reactionColor: 'cyan',
        labelClass: 'text-cyan-400',
        labelText: 'GÉNESIS FOREST'
      };
    }
  }, [realityMode]);

  const forestStyles = `
    @keyframes spiritFade {
        0% { opacity: 0; filter: blur(15px); transform: translateY(30px) scale(0.9); }
        15% { opacity: 0.9; filter: blur(0px); transform: translateY(0) scale(1); }
        85% { opacity: 0.9; filter: blur(0px); }
        100% { opacity: 0; filter: blur(20px); transform: translateY(-70px) scale(1.1); }
    }
    .animate-spirit { animation: spiritFade 12s ease-in-out forwards; }
    @keyframes glowSwim { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 15% { opacity: 1; scale: 1; } 100% { transform: translateY(-115vh) scale(3.5); opacity: 0; } }
    .animate-glowSwim { animation: glowSwim 7s ease-in-out forwards; }
    .animate-spin-slow { animation: spin 10s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;

  const getCleanUrl = (url) => {
    if (!url) return "";
    let clean = url.trim();
    if (clean.includes('dropbox.com')) {
        let direct = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dropbox.com', 'dl.dropboxusercontent.com');
        direct = direct.replace(/\?dl=0/g, '').replace(/&dl=0/g, '');
        return direct.includes('?') ? `${direct}&raw=1` : `${direct}?raw=1`;
    }
    return clean;
  };

  const displayUsers = useMemo(() => {
    const DJ_NEON = { id: 'bot1', alias: 'Dj_Neon', video_file: "https://www.dropbox.com/scl/fi/sbubsg1n7vxluup8efp59/DJ-Neon.mp4?rlkey=6rcdr6hkya9xkk049wdhnxnx7&st=zreglrau&dl=0" };
    if (videoUsers && videoUsers.length > 0) return [...videoUsers, DJ_NEON];
    return [DJ_NEON];
  }, [videoUsers]);

  const currentUser = displayUsers[((currentIndex % displayUsers.length) + displayUsers.length) % displayUsers.length];

  // --- CARGA DE ECOS ---
  useEffect(() => {
    if (videoRef.current) videoRef.current.load();
    setEchos([]); setEchoPool([]);
    if (currentUser?.id && !currentUser.id.includes('master')) {
        const fetchEchos = async () => {
            const { data } = await supabase.from('bro_echos').select('*').eq('target_profile_id', currentUser.id).limit(20);
            if (data && data.length > 0) setEchoPool(data);
            else setEchoPool([{ id: 's1', author_alias: 'BRO7VISION', text: 'SEÑAL ESTABLE. ESPERANDO ECOS...' }]);
        };
        fetchEchos();
    }
  }, [currentUser.id]);

  // --- RUEDA DE ECOS CON GRILLA ---
  useEffect(() => {
    if (echoPool.length === 0) return;
    const interval = setInterval(() => {
        const rawEcho = echoPool[Math.floor(Math.random() * echoPool.length)];
        const coords = SLOTS[nextSlot];
        setNextSlot((prev) => (prev + 1) % SLOTS.length);
        
        setEchos(prev => [...prev.slice(-7), {
            ...rawEcho,
            id: Date.now(),
            x: coords.x, y: coords.y,
            color: rawEcho.is_creator ? 'text-yellow-400 drop-shadow-[0_0_10px_gold]' : config.colors[Math.floor(Math.random() * config.colors.length)],
            fontSize: rawEcho.text.length < 25 ? "text-xl md:text-3xl" : "text-sm md:text-lg"
        }]);
    }, 4500);
    return () => clearInterval(interval);
  }, [echoPool, nextSlot, config]);

  // --- ACCIONES (HALO/ECO/GRACIAS) ---
  const handleAction = async (type) => {
    if (!balances || !session?.user?.id) return;
    const cost = 100;
    if (balances.genesis < cost) { alert("SUEÑAS CON GÉNESIS... PERO NO TIENES"); return; }
    
    const newGenesis = balances.genesis - cost;
    setBalances(prev => ({ ...prev, genesis: newGenesis }));
    const myAlias = session?.user?.user_metadata?.alias || 'ANÓNIMO';

    if (type === 'reaction') {
        setActiveReaction({ from: myAlias, to: currentUser.alias || "BRO" });
        setTimeout(() => setActiveReaction(null), 8000);
    } else {
        if (!echoText.trim()) return;
        setShowEchoInput(false);
    }

    await supabase.from('profiles').update({ genesis: newGenesis }).eq('id', session.user.id);
    if (type === 'echo') {
        const { data } = await supabase.from('bro_echos').insert([{ 
            target_profile_id: currentUser.id, author_alias: myAlias, text: echoText.toUpperCase() 
        }]).select();
        if (data) setEchoPool(prev => [data[0], ...prev]);
        setEchoText("");
    }
  };

  const handleCreatorThanks = async (targetAlias = null) => {
    const isPersonal = !!targetAlias;
    const cost = isPersonal ? 10 : 0;
    if (balances.genesis < cost) { alert("SIN SALDO"); return; }

    const text = isPersonal ? `@${targetAlias} ¡GRACIAS POR TU APOYO!` : "¡GRACIAS A TODOS POR SINTONIZAR!";
    const myAlias = session?.user?.user_metadata?.alias || 'CREADOR';

    if (isPersonal) {
        const newGenesis = balances.genesis - cost;
        setBalances(prev => ({ ...prev, genesis: newGenesis }));
        await supabase.from('profiles').update({ genesis: newGenesis }).eq('id', session.user.id);
    }

    const { data } = await supabase.from('bro_echos').insert([{ 
        target_profile_id: currentUser.id, author_alias: myAlias, text: text, is_creator: true 
    }]).select();

    if (data) setEchoPool(prev => [{...data[0], is_creator: true}, ...prev]);
  };

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${realityMode === 'blackhole' ? 'bg-black' : 'bg-[#050505]'}`}>
      <style>{forestStyles}</style>

      {/* FONDO DINÁMICO */}
      {config.video && (
        <video src={config.video} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 z-[1]" />
      )}

      {/* ECOS */}
      <div className="absolute inset-0 z-[15] pointer-events-none">
          {echos.map((echo) => (
              <div key={echo.id} 
                className={`absolute animate-spirit ${echo.color} ${config.font} text-center drop-shadow-[0_0_20px_rgba(0,0,0,1)] max-w-[250px] md:max-w-[400px]`} 
                style={{ left: `${echo.x}%`, top: `${echo.y}%` }}>
                  <p className="text-[8px] opacity-60 mb-1 font-black tracking-[0.5em]">{echo.author_alias}</p>
                  <p className={`px-5 py-2 bg-black/40 backdrop-blur-[10px] rounded-3xl border border-white/5 break-words ${echo.fontSize}`}>
                    "{echo.text}"
                  </p>
              </div>
          ))}
      </div>

      {/* REACCIÓN HALO */}
      {activeReaction && (
          <div className="fixed inset-0 pointer-events-none z-[400]">
              <div className="absolute bottom-10 right-[15%] animate-glowSwim">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className={`absolute inset-0 ${config.reactionColor === 'orange' ? 'bg-orange-500/40' : 'bg-cyan-400/30'} rounded-full blur-[60px] animate-pulse`}></div>
                      <div className={`absolute w-32 h-32 ${config.reactionColor === 'orange' ? 'bg-yellow-200/40' : 'bg-white/20'} rounded-full blur-[40px]`}></div>
                      <div className="absolute w-full h-full animate-spin-slow">
                           <div className={`absolute top-0 left-1/2 w-8 h-8 ${config.reactionColor === 'orange' ? 'bg-orange-400' : 'bg-white'} rounded-full blur-sm`}></div>
                           <div className={`absolute bottom-10 left-0 w-6 h-6 ${config.reactionColor === 'orange' ? 'bg-yellow-500' : 'bg-cyan-300'} rounded-full blur-sm`}></div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* PORTAL CENTRAL XL */}
      <div className="absolute top-[45%] md:top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20]">
          <div className="relative w-[280px] h-[460px] md:w-[380px] md:h-[600px] transition-all duration-500">
              
              <div className={`absolute inset-0 border-2 rounded-[3.5rem] bg-black overflow-hidden ${config.border}`}>
                  <video 
                    ref={videoRef} key={currentUser.id} src={getCleanUrl(currentUser.video_file)} 
                    autoPlay loop muted={isMuted} playsInline className="w-full h-full object-cover bg-black"
                    onTimeUpdate={() => setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)}
                  />
                  <button onClick={() => setIsMuted(!isMuted)} className="absolute top-6 right-6 bg-black/60 p-2 rounded-full text-xs z-[30]">{isMuted ? '🔇' : '🔊'}</button>
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10">
                    <div className={`h-full ${config.reactionColor === 'orange' ? 'bg-orange-500 shadow-[0_0_15px_orange]' : 'bg-cyan-500 shadow-[0_0_15px_cyan]'}`} style={{ width: `${progress}%` }}></div>
                  </div>
              </div>

              {/* BOTONERA ADAPTATIVA */}
              <div className="absolute -bottom-32 left-0 w-full flex flex-col items-center gap-4">
                  <div className="flex gap-3">
                      {session?.user?.id !== currentUser.id ? (
                        <>
                          <button onClick={() => handleAction('reaction')} className="px-6 py-3 bg-black/60 border border-white/10 rounded-2xl text-[10px] font-black hover:bg-white hover:text-black transition-all shadow-xl uppercase">ENVIAR SEÑAL</button>
                          <button onClick={() => setShowEchoInput(true)} className="px-6 py-3 bg-black/60 border border-white/10 rounded-2xl text-[10px] font-black hover:bg-white hover:text-black transition-all shadow-xl uppercase">EMITIR ECO</button>
                        </>
                      ) : (
                        <button onClick={() => handleCreatorThanks()} className="px-8 py-3 bg-yellow-500 text-black border border-white/20 rounded-2xl text-[10px] font-black hover:bg-white transition-all shadow-[0_0_20px_gold] uppercase">📢 DAR GRACIAS (GRATIS)</button>
                      )}
                  </div>
                  <p className={`text-[10px] md:text-[12px] font-black tracking-[0.3em] uppercase drop-shadow-lg ${config.labelClass}`}>
                      {config.labelText} <span className="opacity-40 mx-2">//</span> {currentUser.alias || "SISTEMA"}
                  </p>
              </div>

              {/* NAV BUTTONS */}
              <button onClick={() => setCurrentIndex(prev => prev - 1)} className="absolute -left-16 md:-left-24 top-1/2 -translate-y-1/2 text-5xl opacity-20 hover:opacity-100 transition-all">‹</button>
              <button onClick={() => setCurrentIndex(prev => prev + 1)} className="absolute -right-16 md:-right-24 top-1/2 -translate-y-1/2 text-5xl opacity-20 hover:opacity-100 transition-all">›</button>
          </div>
      </div>

      {/* MODAL ECO */}
      {showEchoInput && (
          <div className="fixed inset-0 z-[1000] bg-black/98 flex items-center justify-center p-6 backdrop-blur-3xl">
              <div className="w-full max-w-sm text-center">
                  <input 
                    autoFocus type="text" placeholder="SUSURRO AL UNIVERSO..." 
                    className={`w-full bg-transparent border-b-2 border-white/10 py-6 text-center text-white outline-none font-black text-2xl md:text-3xl uppercase focus:border-white transition-all ${realityMode === 'blackhole' ? 'font-serif italic' : ''}`}
                    value={echoText} onChange={(e) => setEchoText(e.target.value)}
                    maxLength={60}
                    onKeyDown={(e) => e.key === 'Enter' && handleAction('echo')}
                  />
                  <div className="mt-12 flex justify-between items-center px-4 text-[10px] font-black">
                      <span className="text-white/20">{echoText.length}/60</span>
                      <button onClick={() => setShowEchoInput(false)} className="text-gray-500 uppercase">CERRAR</button>
                      <button onClick={() => handleAction('echo')} className="text-white bg-white/10 px-8 py-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all">EMITIR [100 GÉNESIS]</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BioForest;