import React, { useEffect, useRef, useState, useCallback } from 'react';

const BroLives3D = ({ playingCreator, onToggleAudio }) => {
  const audioRef                      = useRef(null);
  const rafRef                        = useRef(null);
  const [isPlaying,  setIsPlaying]    = useState(false);
  const [progress,   setProgress]     = useState(0);
  const [currentTime,setCurrentTime]  = useState(0);
  const [duration,   setDuration]     = useState(0);

  const getCleanAudioUrl = (url) => {
    if (!url) return null;
    let clean = url.trim();
    if (clean.includes('dropbox.com')) {
      clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                   .replace('dropbox.com',     'dl.dropboxusercontent.com')
                   .replace('?dl=0', '').replace('&dl=0', '');
    }
    return clean;
  };

  const tick = useCallback(() => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    setCurrentTime(a.currentTime);
    setDuration(a.duration);
    setProgress((a.currentTime / a.duration) * 100);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startRAF = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopRAF = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (!playingCreator) return;
    const url = getCleanAudioUrl(playingCreator.audio_file || playingCreator.audioFile);
    if (url && audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => { setIsPlaying(true); startRAF(); })
        .catch(e => { console.error('Audio error:', e); setIsPlaying(false); });
    }
  }, [playingCreator, startRAF]);

  useEffect(() => {
    if (!playingCreator) {
      setIsPlaying(false); stopRAF();
      setProgress(0); setCurrentTime(0); setDuration(0);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    }
  }, [playingCreator, stopRAF]);

  useEffect(() => () => stopRAF(), [stopRAF]);

  const handleToggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) { a.pause(); stopRAF(); setIsPlaying(false); }
    else { a.play().then(() => { setIsPlaying(true); startRAF(); }).catch(console.error); }
  };

  const handleSeek = (e) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  // ── Datos — cubre todos los campos posibles del objeto ──
  const displayName = (
    playingCreator?.alias    ||
    playingCreator?.nombre   ||
    playingCreator?.name     ||
    playingCreator?.shopName ||
    'ANON'
  ).toUpperCase();

  const trackName   = playingCreator?.track_name   || playingCreator?.trackName   || null;
  const descripcion = playingCreator?.descripcion  || playingCreator?.description || null;

  // Avatar: prueba todos los campos de imagen
  const avatarImage = playingCreator?.img
    || playingCreator?.avatar_url
    || playingCreator?.card_banner_url
    || playingCreator?.banner_url
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=111&color=a3e635&size=150`;

  const C = isPlaying
    ? { border: 'rgba(163,230,53,0.7)', glow: '0 0 32px rgba(163,230,53,0.5)', text: '#a3e635', sub: 'rgba(163,230,53,0.7)' }
    : { border: 'rgba(255,255,255,0.15)', glow: 'none', text: 'rgba(255,255,255,0.85)', sub: 'rgba(255,255,255,0.3)' };

  const W = 160; const H = 260; const SPINE = 18;

  return (
    <div style={{ position: 'relative', display: 'inline-block', padding: '8px' }}>

      <style>{`
        @keyframes bro-spin {
          from { transform: rotateX(-8deg) rotateY(0deg); }
          to   { transform: rotateX(-8deg) rotateY(360deg); }
        }
        .bro-box { animation: bro-spin 18s linear infinite; }
        .bro-box:hover { animation-play-state: paused; }
        @keyframes bro-bar {
          0%,100% { transform: scaleY(0.3); }
          50%     { transform: scaleY(1); }
        }
      `}</style>

      <audio
        ref={audioRef}
        onEnded={() => { setIsPlaying(false); stopRAF(); setProgress(0); setCurrentTime(0); }}
      />

      <div style={{ perspective: '900px', width: `${W + SPINE * 2}px`, height: `${H + 56}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* ── CAJETILLA 3D ── */}
        <div
          className="bro-box"
          style={{ width: `${W}px`, height: `${H}px`, position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer', flexShrink: 0 }}
          onClick={handleToggle}
        >

          {/* CARA FRONTAL */}
          <div style={{
            position: 'absolute', inset: 0,
            transform: `translateZ(${SPINE}px)`,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${C.border}`,
            borderRadius: '14px',
            boxShadow: C.glow,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'space-between', padding: '16px 12px 12px',
            backfaceVisibility: 'hidden',
          }}>
            {isPlaying && (
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, rgba(163,230,53,0.08), transparent 70%)', borderRadius: '14px', pointerEvents: 'none' }} />
            )}

            {/* Avatar */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              border: `2px solid ${C.border}`,
              boxShadow: isPlaying ? '0 0 14px rgba(163,230,53,0.45)' : 'none',
              overflow: 'hidden', flexShrink: 0,
              filter: isPlaying ? 'none' : 'grayscale(60%)',
              transition: 'all 0.4s',
            }}>
              <img src={avatarImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Nombre + track */}
            <div style={{ textAlign: 'center', width: '100%', padding: '0 4px' }}>
              <p style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.2em', color: C.sub, textTransform: 'uppercase', marginBottom: '4px' }}>
                {isPlaying ? '● ON AIR' : '◼ PAUSED'}
              </p>
              {/* ALIAS — tamaño aumentado a 16px */}
              <p style={{ fontSize: '16px', fontWeight: 900, color: C.text, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.2, marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </p>
              {trackName && (
                <p style={{ fontSize: '16px', color: isPlaying ? 'rgba(163,230,53,0.75)' : 'rgba(255,255,255,0.3)', fontStyle: 'italic', letterSpacing: '0.04em', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  ♪ {trackName}
                </p>
              )}
            </div>

            {/* Espectro */}
            {isPlaying ? (
              <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '24px' }}>
                {[{ h: 10, d: '0s', c: '#a3e635' }, { h: 18, d: '0.1s', c: '#fde047' }, { h: 22, d: '0.05s', c: '#bef264' }, { h: 14, d: '0.15s', c: '#facc15' }, { h: 20, d: '0.08s', c: '#a3e635' }].map((b, i) => (
                  <div key={i} style={{ width: '3px', height: `${b.h}px`, background: b.c, borderRadius: '2px', boxShadow: `0 0 6px ${b.c}`, animation: `bro-bar 0.${4 + i}s ease-in-out infinite`, animationDelay: b.d, transformOrigin: 'bottom' }} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '24px', opacity: 0.25 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }} />)}
              </div>
            )}
          </div>

          {/* CARA TRASERA — con descripción */}
          <div style={{
            position: 'absolute', inset: 0,
            transform: `rotateY(180deg) translateZ(${SPINE}px)`,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${C.border}`,
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backfaceVisibility: 'hidden',
          }}>
              {descripcion && (
                <p style={{
                  fontSize: '14px', color: 'rgba(255,255,255,0.55)', textAlign: 'center',
                  lineHeight: 1.6, letterSpacing: '0.03em', marginTop: '4px',
                  display: '-webkit-box', WebkitLineClamp: 7, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {descripcion}
                </p>
              )}
            </div>
          

          {/* LATERAL DERECHO */}
          <div style={{
            position: 'absolute',
            width: `${SPINE * 2}px`, height: `${H}px`,
            top: 0, left: `${W / 2 - SPINE}px`,
            transform: `rotateY(90deg) translateZ(${W / 2}px)`,
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${C.border}`,
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backfaceVisibility: 'hidden',
          }}>
            <span style={{ fontSize: '7px', fontFamily: 'monospace', color: C.sub, letterSpacing: '0.3em', textTransform: 'uppercase', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              {displayName}
            </span>
          </div>

          {/* LATERAL IZQUIERDO */}
          <div style={{
            position: 'absolute',
            width: `${SPINE * 2}px`, height: `${H}px`,
            top: 0, left: `${W / 2 - SPINE}px`,
            transform: `rotateY(-90deg) translateZ(${W / 2}px)`,
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${C.border}`,
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backfaceVisibility: 'hidden',
          }}>
            <span style={{ fontSize: '7px', fontFamily: 'monospace', color: C.sub, letterSpacing: '0.3em', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>
              LIVE
            </span>
          </div>

          {/* TAPA SUPERIOR */}
          <div style={{
            position: 'absolute',
            width: `${W}px`, height: `${SPINE * 2}px`,
            top: `${H / 2 - SPINE}px`, left: 0,
            transform: `rotateX(90deg) translateZ(${H / 2}px)`,
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${C.border}`,
            borderRadius: '4px',
            backfaceVisibility: 'hidden',
          }} />

          {/* TAPA INFERIOR */}
          <div style={{
            position: 'absolute',
            width: `${W}px`, height: `${SPINE * 2}px`,
            top: `${H / 2 - SPINE}px`, left: 0,
            transform: `rotateX(-90deg) translateZ(${H / 2}px)`,
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${C.border}`,
            borderRadius: '4px',
            backfaceVisibility: 'hidden',
          }} />

        </div>

        {/* ── BARRA DE PROGRESO (DOM plano, fuera del 3D) ── */}
        <div style={{ width: `${W}px`, marginTop: '12px', flexShrink: 0 }}>
          <div
            onClick={handleSeek}
            style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', cursor: 'pointer', overflow: 'hidden' }}
          >
            <div style={{ height: '100%', width: `${progress}%`, background: isPlaying ? 'linear-gradient(90deg, #a3e635, #fde047)' : 'rgba(255,255,255,0.3)', borderRadius: '2px', transition: 'background 0.3s', boxShadow: isPlaying ? '0 0 6px rgba(163,230,53,0.6)' : 'none' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>{fmt(currentTime)}</span>
            <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>{fmt(duration)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BroLives3D;