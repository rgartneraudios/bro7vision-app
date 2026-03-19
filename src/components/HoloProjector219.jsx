// src/components/HoloProjector219.jsx
import React, { useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

const HoloProjector219 = ({ user, balances, setBalances, session, onClose, onOpenLog, handleGoToShop }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeReaction, setActiveReaction] = useState(null);
  const [question, setQuestion] = useState("");

  const videoRef = useRef(null);

  const bgKey = user.intimo_bg && user.intimo_bg !== "" ? user.intimo_bg : 'salon';
  const backgroundVideo = `https://pub-57f2bfe6389542fe895a61b50b727921.r2.dev/intimo_${bgKey}.mp4`;

  const getCleanUrl = (url) => {
    if (!url) return "";
    let clean = url.trim();
    if (clean.includes('dropbox.com')) {
      clean = clean
        .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
        .replace('dropbox.com', 'dl.dropboxusercontent.com')
        .replace('?dl=0', '')
        .replace('&dl=0', '');
      return clean.includes('?') ? `${clean}&raw=1` : `${clean}?raw=1`;
    }
    return clean;
  };

  const handleSendHalo = async () => {
    if (balances.genesis < 100) { alert("SIN GÉNESIS"); return; }
    const newGenesis = balances.genesis - 100;
    setBalances(prev => ({ ...prev, genesis: newGenesis }));
    setActiveReaction(true);
    setTimeout(() => setActiveReaction(null), 5500);
    await supabase.from('profiles').update({ genesis: newGenesis }).eq('id', session.user.id);
  };

  const handleSendQuestion = async () => {
    if (!question.trim()) return;
    const { error } = await supabase.from('bro_echos').insert([{
      target_profile_id: user.id,
      author_alias: session.user.user_metadata.alias || 'Anónimo',
      text: `❓ PREGUNTA: ${question.toUpperCase()}`,
      is_creator: false
    }]);
    if (!error) { alert("Pregunta enviada al buzón del creador."); setQuestion(""); }
  };

  // Seek en la barra de progreso del visor 21:9
  const handleSeek = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  // Play / Pause
  const togglePlayPause = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setIsPaused(false); }
    else { videoRef.current.pause(); setIsPaused(true); }
  };

  const energyStyles = `
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
    @keyframes spirit { 0%{opacity:0;transform:translateY(10px)} 10%{opacity:1} 90%{opacity:1} 100%{opacity:0;transform:translateY(-20px)} }
    .animate-spirit { animation: spirit 6s infinite ease-in-out; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .animate-fadeIn { animation: fadeIn 0.4s ease-in forwards; }
    @keyframes cyanPulse {
      0%,100% { box-shadow:0 0 10px #00E1FF44,0 0 20px #00E1FF22,inset 0 0 10px #00E1FF11; }
      50%      { box-shadow:0 0 20px #00E1FF88,0 0 40px #00E1FF44,inset 0 0 20px #00E1FF22; }
    }
    .animate-cyan-pulse { animation: cyanPulse 3s ease-in-out infinite; }
  `;

  const energyColors = [
    { primary: "#00127A", secondary: "#006AED", glow: "rgba(59,130,246,0.6)" },
    { primary: "#FF007D", secondary: "#f472b6", glow: "rgba(236,72,153,0.6)" },
    { primary: "#00FF48", secondary: "#00FFF2", glow: "rgba(16,185,129,0.6)" },
    { primary: "#4D00FA", secondary: "#7C4FFF", glow: "rgba(139,92,246,0.6)" },
    { primary: "#facc15", secondary: "#FFFF00", glow: "rgba(250,204,21,0.6)" },
    { primary: "#CF0000", secondary: "#F70C0C", glow: "rgba(239,68,68,0.6)" },
    { primary: "#00E1FF", secondary: "#61C8FF", glow: "rgba(6,182,212,0.6)" }
  ];

  return (
    <div className="fixed inset-0 z-[99999] bg-black overflow-hidden font-mono">
      <style>{energyStyles}</style>

      {/* VIDEO DE FONDO */}
      <video src={backgroundVideo} autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/20 z-[1]" />

      {/* BOTÓN CERRAR */}
      <button onClick={onClose}
        className="absolute top-4 left-4 z-[200] w-9 h-9 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 text-sm hover:bg-black/80 transition-all">
        ✕
      </button>

      {/* SALDO GENESIS */}
      <div className="absolute top-4 left-16 z-[200] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
        <span className="text-cyan-400 text-[10px]">💠</span>
        <span className="text-white font-black text-[10px]">{balances.genesis}</span>
      </div>

      {/* ═══════════════════════════════════════════
          VISOR 21:9 — ESQUINA SUPERIOR DERECHA
      ═══════════════════════════════════════════ */}
      <div
        className="absolute z-[50] animate-cyan-pulse"
        style={{
          top: '2vh', right: '2vw',
          width: 'min(68vw, 900px)',
          aspectRatio: '21/9',
          borderRadius: '1.25rem',
          border: '2px solid #00E1FF',
          boxShadow: '0 0 18px #00E1FF66,0 0 36px #00E1FF33,inset 0 0 16px #00E1FF11',
          overflow: 'hidden',
          background: '#000',
        }}>

        {/* VIDEO PRINCIPAL */}
        <video
          ref={videoRef}
          src={getCleanUrl(user.video_file_219 || user.video_file)}
          autoPlay loop playsInline muted={isMuted}
          className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
          onTimeUpdate={() => {
            if (videoRef.current?.duration)
              setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
          }}
        />

        {/* MENSAJE DEL CREADOR */}
        <div className="absolute top-3 left-0 w-full px-5 z-30 pointer-events-none">
          <div className="animate-spirit">
            <p className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-2xl text-[10px] text-[#FFFDD0] italic text-center shadow-xl">
              "{user.creator_loop_reply || "Hola! Deja tu pregunta en la Bitácora..."}"
            </p>
          </div>
        </div>

        {/* MUTE */}
        <button onClick={() => setIsMuted(!isMuted)}
          className="absolute top-3 right-3 z-50 w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 text-[10px]">
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* =====================================================
            CONTROLES: barra progreso clickeable + play/pause
            ===================================================== */}
        <div className="absolute bottom-4 left-0 w-full z-50 px-4 pointer-events-auto">
          {/* BARRA DE PROGRESO */}
          <div
            className="w-full h-[3px] bg-white/20 rounded-full cursor-pointer mb-2 group"
            onClick={handleSeek}>
            <div
              className="h-full bg-[#00E1FF]/80 rounded-full shadow-[0_0_8px_#00E1FF] transition-all duration-100 group-hover:h-[5px]"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* PLAY/PAUSE */}
          <div className="flex justify-center">
            <button
              onClick={togglePlayPause}
              className="bg-black/50 border border-[#00E1FF]/40 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-[#00E1FF]/20 transition-all text-xs">
              {isPaused ? '▶' : '⏸'}
            </button>
          </div>
        </div>

        {/* MARCO DECORATIVO ESQUINAS */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl z-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl z-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl z-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-xl z-50 pointer-events-none" />
      </div>

      {/* PANEL CONTENIDO TAB ACTIVO */}
      {activeTab && (
        <div className="absolute z-[60] animate-fadeIn"
          style={{
            top: 'calc(2vh + min(68vw, 900px) * 9/21 + 1rem)',
            right: '2vw',
            width: 'min(68vw, 900px)',
            maxHeight: '35vh',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(24px)',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.08)',
            overflowY: 'auto',
            padding: '1.25rem',
          }}>
          {activeTab === 'log' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-gray-300 text-[11px] leading-relaxed italic">
                  "{user.blog_text || "El creador está en directo..."}"
                </p>
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/10">
                <p className="text-[9px] text-gray-500 font-black mb-2 uppercase">Enviar Pregunta Privada</p>
                <div className="flex gap-2">
                  <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
                    placeholder="¿Tienes alguna duda?"
                    className="flex-1 bg-transparent border-b border-white/10 text-xs text-white outline-none" />
                  <button onClick={handleSendQuestion} className="text-fuchsia-400 text-[9px] font-black uppercase">
                    Preguntar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          FOOTER — misma estructura que HoloProjector
      ═══════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 w-full z-[100] bg-black/80 backdrop-blur-2xl border-t border-white/10">
        <div className="flex h-20 items-center px-2">

          {/* 1. BITÁCORA */}
          <button
            onClick={() => setActiveTab(activeTab === 'log' ? null : 'log')}
            className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'log' ? 'text-white' : 'text-white/30'}`}>
            <span className="text-xl">💬</span>
            <span className="text-[10px] font-black uppercase">Bitácora</span>
          </button>

          {/* 2. EDITORIAL */}
          <button
            onClick={() => onOpenLog({
              id: user.id,
              title: user.editorial_title || "Sin Título",
              author: user.alias || "Anónimo",
              content: user.editorial_content || "..."
            })}
            className="flex-1 flex flex-col items-center gap-1 text-fuchsia-400">
            <span className="text-xl">🖋️</span>
            <span className="text-[10px] font-black uppercase">Editorial</span>
          </button>

          {/* 3. HALO */}
          <button onClick={handleSendHalo} className="flex-1 flex flex-col items-center gap-1 relative">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-cyan-400/60 flex items-center justify-center text-xl shadow-[0_0_14px_#00E1FF55] hover:shadow-[0_0_24px_#00E1FF99] transition-all active:scale-90">
              ⚪
            </div>
            <span className="text-[10px] font-black uppercase text-cyan-400">Halo</span>
          </button>

          {/* 4. TIENDA — usa handleGoToShop (igual que HoloProjector) */}
          <button
            onClick={() => {
              if (typeof handleGoToShop === 'function') handleGoToShop(user);
            }}
            className="flex-1 flex flex-col items-center gap-1 text-yellow-500">
            <span className="text-xl">🦝</span>
            <span className="text-[10px] font-black uppercase">Tienda</span>
          </button>

        </div>
      </div>

      {/* ANIMACIÓN GEMA HALO */}
      {activeReaction && (() => {
        const c = energyColors[Math.floor(Math.random() * energyColors.length)];
        return (
          <div className="fixed bottom-4 right-[15%] z-[100] pointer-events-none animate-vortex">
            <div className="relative flex flex-col items-center" style={{ mixBlendMode: 'screen' }}>
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="absolute w-48 h-48 rounded-full blur-[40px] opacity-60 animate-energy-pulse" style={{ background: c.glow }} />
                <div className="absolute w-40 h-40 animate-spin-vortex">
                  <div className="w-full h-full rounded-full opacity-90" style={{ background: `conic-gradient(from 0deg,${c.primary},${c.secondary},transparent 40%,${c.primary} 60%,transparent 80%,${c.secondary})`, filter: 'blur(4px)' }} />
                </div>
                <div className="absolute w-32 h-32 animate-spiral-counter">
                  <div className="w-full h-full rounded-full opacity-90" style={{ background: `conic-gradient(from 180deg,transparent,${c.secondary} 30%,transparent 50%,${c.primary} 70%,transparent)`, filter: 'blur(3px)' }} />
                </div>
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full blur-[20px] opacity-80 animate-energy-pulse" style={{ background: c.primary }} />
                  <div className="absolute w-16 h-16 rounded-full" style={{ background: `radial-gradient(circle,white 20%,${c.secondary} 50%,${c.primary} 100%)`, boxShadow: `0 0 40px ${c.glow},0 0 80px ${c.glow}` }} />
                  <div className="absolute w-6 h-6 bg-white rounded-full blur-[2px] shadow-[0_0_20px_white]" />
                </div>
                {[0,1,2,3].map(i => (
                  <div key={i} className="absolute w-2 h-24 animate-flare" style={{ background: `linear-gradient(to bottom,${c.secondary},transparent)`, transform: `rotate(${i*90}deg)`, transformOrigin: 'center', filter: 'blur(2px)', animationDelay: `${i*0.5}s` }} />
                ))}
                {[0,1,2,3,4,5].map(i => (
                  <div key={`p-${i}`} className="absolute animate-particle-orbit" style={{ animationDelay: `${i*0.3}s` }}>
                    <div className="w-2 h-2 rounded-full blur-[1px]" style={{ background: i%2===0 ? c.primary : c.secondary }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default HoloProjector219;