// src/components/BioForest.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';

const BioForest = ({ videoUsers, balances, setBalances, session }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeHalo, setActiveHalo] = useState(null);
  const [echos, setEchos] = useState([]); 
  const [echoPool, setEchoPool] = useState([]); 
  const [showEchoInput, setShowEchoInput] = useState(false);
  const [echoText, setEchoText] = useState("");

  const videoRef = useRef(null);

  const forestStyles = `
    @keyframes spiritFade {
        0% { opacity: 0; filter: blur(15px); transform: translateY(30px) scale(0.9); }
        15% { opacity: 1; filter: blur(0px); transform: translateY(0) scale(1); }
        85% { opacity: 1; filter: blur(0px); }
        100% { opacity: 0; filter: blur(20px); transform: translateY(-70px) scale(1.1); }
    }
    .animate-spirit { animation: spiritFade 12s ease-in-out forwards; }
    
    @keyframes glowSwim { 
        0% { transform: translateY(0) scale(0.5); opacity: 0; } 
        15% { opacity: 1; scale: 1; }
        100% { transform: translateY(-115vh) scale(2.8); opacity: 0; } 
    }
    .animate-glowSwim { animation: glowSwim 7s ease-in-out forwards; }
    .animate-spin-slow { animation: spin 8s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;

  const getCleanUrl = (url) => {
    if (!url) return "";
    let clean = url.trim();
    if (clean.includes('dropbox.com')) {
        let direct = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                          .replace('dropbox.com', 'dl.dropboxusercontent.com');
        direct = direct.replace(/\?dl=0/g, '').replace(/&dl=0/g, '');
        return direct.includes('?') ? `${direct}&raw=1` : `${direct}?raw=1`;
    }
    return clean;
  };

  const displayUsers = useMemo(() => {
    const DJ_NEON = { 
        id: 'bot1', alias: 'Dj_Neon', 
        video_file: "https://www.dropbox.com/scl/fi/sbubsg1n7vxluup8efp59/DJ-Neon.mp4?rlkey=6rcdr6hkya9xkk049wdhnxnx7&st=zreglrau&dl=0"
    };
    if (videoUsers && videoUsers.length > 0) {
        const hasNeon = videoUsers.find(u => u.alias === 'Dj_Neon');
        return hasNeon ? videoUsers : [...videoUsers, DJ_NEON];
    }
    return [DJ_NEON];
  }, [videoUsers]);

  const currentUser = displayUsers[((currentIndex % displayUsers.length) + displayUsers.length) % displayUsers.length];

  // --- LÓGICA DE TAMAÑO DE TEXTO ---
  const getFontSizeClass = (text) => {
    const len = text.length;
    if (len < 15) return "text-lg md:text-2xl font-black tracking-tight"; // Corto/Impacto
    if (len < 35) return "text-sm md:text-xl font-bold leading-tight";    // Medio
    return "text-[10px] md:text-sm font-medium leading-relaxed";          // Largo
  };

  useEffect(() => {
    if (videoRef.current) videoRef.current.load();
    setEchos([]);
    setEchoPool([]);

    if (currentUser?.id && !currentUser.id.includes('master')) {
        const fetchEchos = async () => {
            const { data } = await supabase.from('bro_echos')
                .select('*').eq('target_profile_id', currentUser.id)
                .order('created_at', { ascending: false }).limit(20);
            if (data && data.length > 0) setEchoPool(data);
            else setEchoPool([{ id: 's1', author_alias: 'SISTEMA', text: 'SINTONIZANDO SEÑAL...' }]);
        };
        fetchEchos();
    }
  }, [currentUser.id]);

  useEffect(() => {
    if (echoPool.length === 0) return;
   const interval = setInterval(() => {
    const rawEcho = echoPool[Math.floor(Math.random() * echoPool.length)];
    const isMobile = window.innerWidth < 768;
    
    // --- NUEVAS COORDENADAS DE SEGURIDAD TARS ---
    let x, y;

    if (isMobile) {
        // En móvil: Centrados debajo del video (entre 15% y 85% del ancho)
        x = Math.random() * 50 + 25; 
        y = 82; // Altura fija al pie
    } else {
        // En PC: Orbitando los laterales pero con margen de seguridad
        const side = Math.random() > 0.5 ? 'left' : 'right';
        if (side === 'left') {
            // Lado izquierdo: entre el 8% y el 28% de la pantalla
            x = Math.random() * 20 + 8;
        } else {
            // Lado derecho: entre el 72% y el 88% de la pantalla 
            // (Bajamos del 95% al 88% para que el texto no se salga por la derecha)
            x = Math.random() * 16 + 72;
        }
        // Altura: entre el 15% y el 65% para no chocar con la botonera ni el top
        y = Math.random() * 50 + 15;
    }

    const colors = ['text-cyan-400', 'text-fuchsia-400', 'text-yellow-400', 'text-green-400'];
    const newEcho = {
        ...rawEcho,
        id: Date.now(),
        x, y,
        color: colors[Math.floor(Math.random() * colors.length)],
        fontSize: getFontSizeClass(rawEcho.text)
    };

    setEchos(prev => [...prev.slice(-6), newEcho]);
}, 4500);
    return () => clearInterval(interval);
  }, [echoPool]);

  const handleAction = async (type) => {
    if (!balances) return;
    const cost = 100;
    if (balances.genesis < cost) { alert("NECESITAS 100 GÉNESIS"); return; }
    
    const newGenesis = balances.genesis - cost;
    setBalances(prev => ({ ...prev, genesis: newGenesis }));
    const myAlias = session?.user?.user_metadata?.alias || 'CIUDADANO';

    if (type === 'halo') {
        setActiveHalo({ from: myAlias, to: currentUser.alias || "BRO" });
        setTimeout(() => setActiveHalo(null), 7000);
    } else {
        if (!echoText.trim()) return;
        setShowEchoInput(false);
    }

    try {
        await supabase.from('profiles').update({ genesis: newGenesis }).eq('id', session.user.id);
        if (type === 'echo') {
            const { data } = await supabase.from('bro_echos').insert([{ 
                target_profile_id: currentUser.id, author_alias: myAlias, text: echoText.toUpperCase() 
            }]).select();
            if (data) setEchoPool(prev => [data[0], ...prev]);
            setEchoText("");
        }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <style>{forestStyles}</style>

      {/* ECOS CON SALTO DE LÍNEA Y ANCHO MÁXIMO */}
      <div className="absolute inset-0 z-[15] pointer-events-none">
          {echos.map((echo) => (
              <div key={echo.id} 
                className={`absolute animate-spirit ${echo.color} italic text-center drop-shadow-[0_0_10px_rgba(0,0,0,0.9)] max-w-[180px] md:max-w-[300px]`} 
                style={{ left: `${echo.x}%`, top: `${echo.y}%` }}>
                  <p className="text-[7px] md:text-[9px] opacity-60 mb-1 font-black tracking-widest bg-black/30 px-2 rounded-full inline-block">{echo.author_alias}</p>
                  <p className={`px-4 py-2 bg-black/40 backdrop-blur-[6px] rounded-2xl border border-white/10 break-words ${echo.fontSize}`}>
                    "{echo.text}"
                  </p>
              </div>
          ))}
      </div>

      {/* NOTIFICACIÓN HALO SUPERIOR */}
      {activeHalo && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[500] animate-fadeIn">
              <div className="bg-black/90 backdrop-blur-2xl border border-cyan-500/50 px-10 py-4 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.4)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                    <span className="text-cyan-400">{activeHalo.from}</span> <span className="mx-2 opacity-30">❯❯</span> <span className="text-cyan-400">{activeHalo.to}</span>
                  </p>
              </div>
          </div>
      )}

      {/* LA MEDUSA DE LUZ RESTAURADA (BRUTAL) */}
      {activeHalo && (
            <div className="fixed inset-0 pointer-events-none z-[400]">
                <div className="absolute bottom-10 right-[15%] animate-glowSwim">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        {/* Capas de resplandor */}
                        <div className="absolute inset-0 bg-cyan-400/50 rounded-full blur-[60px] animate-pulse"></div>
                        <div className="absolute w-24 h-24 bg-white/40 rounded-full blur-[30px]"></div>
                        <div className="absolute w-12 h-12 bg-white rounded-full shadow-[0_0_40px_white]"></div>
                        {/* Satélites giratorios */}
                        <div className="absolute w-full h-full animate-spin-slow">
                             <div className="absolute top-0 left-1/2 w-6 h-6 bg-white rounded-full blur-sm shadow-[0_0_20px_white]"></div>
                             <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-cyan-200/60 rounded-full blur-sm"></div>
                             <div className="absolute left-0 top-1/2 w-5 h-5 bg-white/40 rounded-full blur-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
      )}

      <video src="/videos/bio_landing.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 z-[1]" />
      
      {/* PORTAL (BAJADO PARA MÓVIL) */}
      <div className="absolute top-[45%] md:top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20]">
          <div className="relative w-[280px] h-[460px] md:w-[320px] md:h-[520px]">
              <div className="absolute inset-0 border-2 border-white/10 rounded-[3rem] bg-black overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)]">
                  <video 
                    ref={videoRef} key={currentUser.id} 
                    src={getCleanUrl(currentUser.video_file)} 
                    autoPlay loop muted={isMuted} playsInline 
                    className="w-full h-full object-cover bg-black"
                    onTimeUpdate={() => setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)}
                  />
                  <button onClick={() => setIsMuted(!isMuted)} className="absolute top-6 right-6 bg-black/60 p-2 rounded-full text-xs z-[30]">{isMuted ? '🔇' : '🔊'}</button>
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10"><div className="h-full bg-cyan-500 shadow-[0_0_15px_cyan]" style={{ width: `${progress}%` }}></div></div>
              </div>

              {/* BOTONERA */}
              <div className="absolute -bottom-28 left-0 w-full flex flex-col items-center gap-4">
                  <div className="flex gap-4">
                      <button onClick={() => handleAction('halo')} className="px-6 py-3 bg-black/60 border border-white/10 rounded-2xl text-[10px] font-black hover:bg-cyan-500 hover:text-black transition-all">ENVIAR HALO</button>
                      <button onClick={() => setShowEchoInput(true)} className="px-6 py-3 bg-black/60 border border-white/10 rounded-2xl text-[10px] font-black hover:bg-fuchsia-500 hover:text-black transition-all">EMITIR ECO</button>
                  </div>
                  <p className="text-[7px] text-white/30 font-bold tracking-[0.5em] uppercase">LINK ESTABLE: {currentUser.alias || "BRO"}</p>
              </div>

              <button onClick={() => setCurrentIndex(prev => prev - 1)} className="absolute -left-16 top-1/2 -translate-y-1/2 text-5xl opacity-20 hover:opacity-100 hover:scale-125 transition-all">‹</button>
              <button onClick={() => setCurrentIndex(prev => prev + 1)} className="absolute -right-16 top-1/2 -translate-y-1/2 text-5xl opacity-20 hover:opacity-100 hover:scale-125 transition-all">›</button>
          </div>
      </div>

      {/* INPUT ECO */}
      {showEchoInput && (
          <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-6 backdrop-blur-3xl">
              <div className="w-full max-w-sm text-center">
                  <input 
                    autoFocus type="text" placeholder="SUSURRO AL BOSQUE..." 
                    className="w-full bg-transparent border-b-2 border-white/10 py-6 text-center text-white outline-none font-black text-2xl md:text-3xl uppercase focus:border-cyan-500 transition-all"
                    value={echoText} onChange={(e) => setEchoText(e.target.value)}
                    maxLength={60}
                    onKeyDown={(e) => e.key === 'Enter' && handleAction('echo')}
                  />
                  <div className="mt-12 flex justify-between items-center px-4 text-[10px] font-black">
                      <span className="text-white/20">{echoText.length}/60</span>
                      <button onClick={() => setShowEchoInput(false)} className="text-gray-500">ATRÁS</button>
                      <button onClick={() => handleAction('echo')} className="text-cyan-400">EMITIR ECO [100 GÉNESIS]</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
export default BioForest;