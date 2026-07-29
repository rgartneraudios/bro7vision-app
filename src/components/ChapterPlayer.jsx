import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

function ChapterPlayer({ chapter, faseLunar, userId, onClose, onReward }) {
  const videoRef = useRef(null);
  const rewardGivenRef = useRef(false);
  const skippedRewardRef = useRef(false);
  const maxNaturalTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isRewarded, setIsRewarded] = useState(false);
  const [countdown, setCountdown] = useState(50);
  const [videoError, setVideoError] = useState(false);
  const THRESHOLD = 50;

  useEffect(() => {
    const checkExisting = async () => {
      if (!userId) return;
      const { data: vista } = await supabase
        .from('bro7band_vistas')
        .select('id')
        .eq('user_id', userId)
        .eq('chapter_id', chapter.id)
        .eq('fase_lunar', parseInt(faseLunar))
        .maybeSingle();
      if (vista) {
        rewardGivenRef.current = true;
        handleReward();
      }
    };
    checkExisting();
  }, [userId, chapter.id, faseLunar]);

  const handleReward = async () => {
    try {
      const { data: vista } = await supabase
        .from('bro7band_vistas')
        .select('id')
        .eq('user_id', userId)
        .eq('chapter_id', chapter.id)
        .eq('fase_lunar', parseInt(faseLunar))
        .maybeSingle();

      if (vista) { setIsRewarded(true); return; }

      const { error: insertError } = await supabase
        .from('bro7band_vistas')
        .insert({
          user_id: userId,
          chapter_id: chapter.id,
          fase_lunar: parseInt(faseLunar),
        });

      if (insertError) { setIsRewarded(true); return; }

      const { error: rpcError } = await supabase.rpc('incrementar_lunas', {
        uid: userId,
        delta: chapter.lunas_reward,
      });

      setIsRewarded(true);
      onReward(chapter.lunas_reward);

    } catch (err) {
      console.error(err);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const ct = video.currentTime;

    if (!isSeekingRef.current && ct > maxNaturalTimeRef.current) {
      maxNaturalTimeRef.current = ct;
    }

    setProgress((ct / video.duration) * 100);
    setCountdown(Math.max(0, THRESHOLD - Math.floor(ct)));

    if (maxNaturalTimeRef.current >= THRESHOLD && !rewardGivenRef.current && !skippedRewardRef.current) {
      rewardGivenRef.current = true;
      handleReward();
    }
  };

  const handleSeeking = () => {
    isSeekingRef.current = true;
  };

  const handleSeeked = () => {
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (!video) return;
    const ct = video.currentTime;

    if (ct >= THRESHOLD && maxNaturalTimeRef.current < THRESHOLD - 1) {
      skippedRewardRef.current = true;
      setCountdown(0);
    }
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    isSeekingRef.current = true;
    video.currentTime = pct * video.duration;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      <div className="relative flex-1 flex items-center justify-center bg-black">
        {videoError ? (
          <div className="text-center text-white/50">
            <p className="text-lg font-bold mb-2">Error al cargar el video</p>
            <p className="text-sm">Intenta de nuevo más tarde</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={chapter.video_url}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onSeeking={handleSeeking}
            onSeeked={handleSeeked}
            onError={() => setVideoError(true)}
          />
        )}

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/40" />

        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <span className="text-white text-lg font-black tracking-widest">B7</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-white/30 text-white/80 text-sm font-black uppercase tracking-wider hover:bg-white/10 transition-all pointer-events-auto"
          >
            ✕ SALIR
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="px-4 md:px-8 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-white/50 text-xs font-mono">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={e => {
                    const val = +e.target.value;
                    setVolume(val);
                    if (videoRef.current) videoRef.current.volume = val;
                  }}
                  className="w-24 accent-cyan-400 pointer-events-auto"
                />
              </div>
            </div>

            <div
              className="relative w-full h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-200 pointer-events-none"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                {isRewarded ? (
                  <span className="text-3xl font-black text-green-400">
                    +{chapter.lunas_reward} ✓
                  </span>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-sm uppercase tracking-widest text-cyan-400">
                      🌙 Lunas en {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                    </p>
                    <span className="text-3xl font-black text-white">
                      +{chapter.lunas_reward}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-white/40 text-xs font-medium tracking-wide">
                {chapter.titulo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterPlayer;