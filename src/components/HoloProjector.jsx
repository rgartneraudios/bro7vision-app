// src/components/HoloProjector.jsx
import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import HoloProjector169 from './HoloProjector169';

const HoloProjector = ({ videoUrl, user, balances, setBalances, session, onClose, handleGoToShop, onOpenLog }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeReaction, setActiveReaction] = useState(null);
  const [question, setQuestion] = useState("");
  const [show169, setShow169] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const [mediaData, setMediaData] = useState({});         // ← NUEVO
  const [acordeonAbierto, setAcordeonAbierto] = useState(false); // ← NUEVO

  const videoRef = useRef(null);

  const SLOT_KEYS = ['v1', 'v2', 'v3'];

  const videos = [user.video_file, user.video_file_2, user.video_file_3].filter(Boolean);

  const nextVideo = () => { setVideoIndex((prev) => (prev + 1) % videos.length); setAcordeonAbierto(false); };
  const prevVideo = () => { setVideoIndex((prev) => (prev - 1 + videos.length) % videos.length); setAcordeonAbierto(false); };

  const bgKey = user.intimo_bg && user.intimo_bg !== "" ? user.intimo_bg : 'salon';
  const backgroundVideo = `https://media.bro7vision.com/intimo_${bgKey}.mp4`;

  // ── NUEVO: fetch creator_media ─────────────────────────────────
  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase
        .from('creator_media')
        .select('slot, url, titulo, descripcion, tipo')
        .eq('user_id', user.id);
      if (error) { console.error('[creator_media]', error); return; }
      const mapped = {};
      data.forEach(item => { mapped[item.slot] = item; });
      setMediaData(mapped);
    };
    if (user?.id) fetchMedia();
  }, [user.id]);

  // Metadatos del video visible ahora mismo
  const currentSlot = SLOT_KEYS[videoIndex] || 'v1';
  const currentMedia = mediaData[currentSlot] || null;
  const currentTipo  = currentMedia?.tipo || 'original';

  const getCleanUrl = (url) => {
    if (!url) return "";
    let clean = url.trim();
    if (clean.includes('dropbox.com')) {
      clean = clean
        .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
        .replace('dropbox.com', 'dl.dropboxusercontent.com')
        .replace('?dl=0', '').replace('&dl=0', '');
      return clean.includes('?') ? `${clean}&raw=1` : `${clean}?raw=1`;
    }
    return clean;
  };

  const energyStyles = `
    @keyframes vortexRise {
      0%   { transform: translate(-80vw, -30vh) scale(0.9) rotate(0deg); opacity: 0.8; }
      15%  { transform: translate(-30vw, 0vh) scale(1.3) rotate(90deg); }
      70%  { transform: translate(10vw, -35vh) scale(1.2) rotate(450deg); }
      80%  { transform: translate(5vw, -45vh) scale(0.9) rotate(540deg); }
      100% { transform: translate(-30vw, -60vh) scale(0.05) rotate(720deg); opacity: 0.8; }
    }
    .animate-vortex { animation: vortexRise 6s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards; }
    @keyframes vortexSpin { 0% { transform: rotate(0deg) scale(1); } 100% { transform: rotate(360deg) scale(1.05); } }
    .animate-spin-vortex { animation: vortexSpin 1.5s linear infinite; }
    @keyframes energyPulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 1; } }
    .animate-energy-pulse { animation: energyPulse 2s ease-in-out infinite; }
    @keyframes spiralCounter { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
    .animate-spiral-counter { animation: spiralCounter 3s linear infinite; }
    @keyframes flare { 0%, 60%, 100% { opacity: 0; transform: scale(0.8); } 70% { opacity: 1; transform: scale(1.3); } }
    .animate-flare { animation: flare 3s ease-in-out infinite; }
    @keyframes spirit { 0% { opacity:0; transform:translateY(10px); } 10% { opacity:1; } 90% { opacity:1; } 100% { opacity:0; transform:translateY(-20px); } }
    .animate-spirit { animation: spirit 6s infinite ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fadeIn { animation: fadeIn 0.4s ease-in forwards; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
  `;

  const colors = [
    { primary: "#00127A", secondary: "#006AED", glow: "rgba(59,130,246,0.6)" },
    { primary: "#FF007D", secondary: "#f472b6", glow: "rgba(236,72,153,0.6)" },
    { primary: "#00FF48", secondary: "#00FFF2", glow: "rgba(16,185,129,0.6)" },
    { primary: "#4D00FA", secondary: "#7C4FFF", glow: "rgba(139,92,246,0.6)" },
    { primary: "#facc15", secondary: "#FFFF00", glow: "rgba(250,204,21,0.6)" },
    { primary: "#CF0000", secondary: "#F70C0C", glow: "rgba(239,68,68,0.6)" },
    { primary: "#00E1FF", secondary: "#61C8FF", glow: "rgba(6,182,212,0.6)" }
  ];

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

  const handleSeek = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  const togglePlayPause = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setIsPaused(false); }
    else { videoRef.current.pause(); setIsPaused(true); }
  };

  if (show169) {
    return (
      <HoloProjector169
        user={user} balances={balances} setBalances={setBalances}
        session={session} onClose={() => setShow169(false)}
        onOpenLog={onOpenLog} handleGoToShop={handleGoToShop}
        onGoTo916={() => setShow169(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-black overflow-hidden flex items-center justify-center font-mono">
      <style>{energyStyles}</style>

      {/* VIDEO DE FONDO */}
      <video src={backgroundVideo} autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover" />

      {/* ANIMACIÓN GEMA HALO */}
      {activeReaction && (() => {
        const c = colors[Math.floor(Math.random() * colors.length)];
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
              </div>
            </div>
          </div>
        );
      })()}

      {/* FLECHAS NAVEGACIÓN */}
      <button onClick={prevVideo}
        className="absolute left-[calc(46%-220px)] top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-fuchsia-400 transition-all text-white">
        <span className="text-xl">❮</span>
      </button>
      <button onClick={nextVideo}
        className="absolute right-[calc(46%-220px)] top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-cyan-400 transition-all text-white">
        <span className="text-xl">❯</span>
      </button>

      {/* VISOR VERTICAL */}
      <div className="relative z-20 flex items-center justify-center" style={{ marginBottom: '4rem' }}>
        <div className="relative h-[88vh] aspect-[9/16] rounded-[3.5rem] border-[3px] border-[#FFFDD0]/30 shadow-[0_0_40px_rgba(255,253,208,0.15)] flex flex-col overflow-hidden bg-black">

          <video
            ref={videoRef}
            src={getCleanUrl(videos[videoIndex])}
            autoPlay loop playsInline muted={isMuted}
            className="absolute inset-0 w-full h-full object-cover"
            onTimeUpdate={() => {
              if (videoRef.current?.duration)
                setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
            }}
          />

          {/* MENSAJE DEL CREADOR */}
          <div className="absolute top-32 left-0 w-full px-6 z-30 pointer-events-none">
            <div className="animate-spirit">
              <p className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-[11px] text-[#FFFDD0] italic text-center shadow-xl">
                "{user.creator_loop_reply || "Hola! Deja tu pregunta en la Bitácora..."}"
              </p>
              <p className="text-[7px] text-center mt-1 opacity-50 uppercase font-black text-white">Mensaje del Creador</p>
            </div>
          </div>

          {/* HUD SUPERIOR */}
          <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-center">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
              <span className="text-cyan-400 text-[10px]">💠</span>
              <span className="text-white font-black text-[10px]">{balances.genesis}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 text-xs">
                {isMuted ? '🔇' : '🔊'}
              </button>
              <button onClick={onClose}
                className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 text-xs">✕</button>
            </div>
          </div>

          {/* CONTROLES */}
          <div className="absolute bottom-4 left-0 w-full z-50 px-5 pointer-events-auto">
            <div className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-3 group" onClick={handleSeek}>
              <div className="h-full bg-[#FFFDD0]/80 rounded-full shadow-[0_0_6px_white] transition-all duration-100 group-hover:h-[4px]"
                style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-center">
              <button onClick={togglePlayPause}
                className="bg-black/50 border border-white/20 backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all text-sm">
                {isPaused ? '▶' : '⏸'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANEL TAB ACTIVO (log) ── */}
      {activeTab === 'log' && (
        <div className="absolute bottom-[5.5rem] left-1/2 -translate-x-1/2 z-[150] w-[min(90vw,480px)] animate-fadeIn pointer-events-auto"
          style={{
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(24px)',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '1.25rem',
          }}>
          <div className="space-y-4">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-gray-300 text-[11px] leading-relaxed italic">"{user.blog_text || "El creador está en directo..."}"</p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-white/10">
              <p className="text-[9px] text-gray-500 font-black mb-2 uppercase">Enviar Pregunta Privada</p>
              <div className="flex gap-2">
                <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
                  placeholder="¿Tienes alguna duda?"
                  className="flex-1 bg-transparent border-b border-white/10 text-xs text-white outline-none" />
                <button onClick={handleSendQuestion} className="text-fuchsia-400 text-[9px] font-black uppercase">Preguntar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACORDEÓN FLOTANTE — izquierda, abre hacia arriba ──────── */}
      {currentMedia && (
        <div className="absolute bottom-[5.5rem] left-4 z-[110] pointer-events-auto flex flex-col items-start w-80">
          {acordeonAbierto && (
            <div className="mb-2 w-full px-6 py-6 bg-slate-950/50 backdrop-blur-md border border-slate-700/30 rounded-2xl animate-slideUp overflow-y-auto max-h-[65vh]">
              <p style={{ fontFamily: 'Georgia, serif' }}
                className="text-white text-2xl font-bold leading-snug mb-3">
                {currentMedia.titulo}
              </p>
              {currentMedia.categoria_declarada && (
                <p style={{ fontFamily: 'Georgia, serif' }}
                  className="text-green-300/80 text-sm uppercase tracking-widest mb-3">
                  {currentMedia.categoria_declarada}
                </p>
              )}
              {currentMedia.descripcion_declarada && (
                <p style={{ fontFamily: 'Georgia, serif' }}
                  className="text-white/70 text-base italic mb-3 leading-relaxed">
                  {currentMedia.descripcion_declarada}
                </p>
              )}
              <p style={{ fontFamily: 'Georgia, serif' }}
                className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                {currentMedia.descripcion}
              </p>
            </div>
          )}
          <button
            onClick={() => setAcordeonAbierto(prev => !prev)}
            className="flex items-center gap-3 px-4 py-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/10 transition-all w-full">
            <span className="text-white/80 text-xs font-black uppercase tracking-widest flex-1 text-left">Título y Descripción</span>
            <span className={`text-white/50 text-sm transition-transform duration-300 ${acordeonAbierto ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>
      )}

      {/* ── BADGE FLOTANTE — derecha, encima del footer ─────────── */}
      {currentMedia && (
        <div className="absolute bottom-[5.5rem] right-4 z-[110] pointer-events-none flex flex-col items-end gap-2">
          {currentTipo === 'original' && (
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              ✦ Original
            </span>
          )}
          {currentTipo === 'publicidad' && (
            <span className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              📢 Publicidad
            </span>
          )}
          {currentTipo === 'ia' && (
            <span className="bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              🤖 Hecho con IA
            </span>
          )}
        </div>
      )}

      {/* ── FOOTER UNIFICADO ─────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 w-full z-[100] bg-black/80 backdrop-blur-2xl border-t border-white/10">

        {/* BOTONES */}
        <div className="flex h-20 items-center px-2">
          <button
            onClick={() => setActiveTab(activeTab === 'log' ? null : 'log')}
            className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'log' ? 'text-white' : 'text-white/30'}`}>
            <span className="text-xl">💬</span>
            <span className="text-[10px] font-black uppercase">Bitácora</span>
          </button>

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

          <button onClick={handleSendHalo} className="flex-1 flex flex-col items-center gap-1 relative">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-xl hover:border-fuchsia-400 hover:shadow-[0_0_14px_rgba(232,121,249,0.5)] transition-all active:scale-90">
              ⚪
            </div>
            <span className="text-[10px] font-black uppercase text-white/60">Halo</span>
          </button>

          <button
            onClick={() => { if (typeof handleGoToShop === 'function') handleGoToShop(user); }}
            className="flex-1 flex flex-col items-center gap-1 text-yellow-500">
            <img src="/emojis/nova.webp" alt="Nova" className="w-7 h-7 object-contain" />
            <span className="text-[10px] font-black uppercase">Productos</span>
          </button>

          <button
            onClick={() => { if (typeof handleGoToShop === 'function') handleGoToShop(user, 'isabellaCierre'); }}
            className="flex-1 flex flex-col items-center gap-1 text-fuchsia-400">
            <img src="/emojis/isabella.webp" alt="Isabella" className="w-7 h-7 object-contain" />
            <span className="text-[10px] font-black uppercase">Servicios</span>
          </button>

          <button onClick={() => setShow169(true)} className="flex-1 flex flex-col items-center gap-1 text-cyan-400">
            <span className="text-xl">📺</span>
            <span className="text-[10px] font-black uppercase">Piso 169</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spirit { 0% { opacity:0; transform:translateY(10px); } 10% { opacity:1; } 90% { opacity:1; } 100% { opacity:0; transform:translateY(-20px); } }
        .animate-spirit { animation: spirit 6s infinite ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-in forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default HoloProjector;