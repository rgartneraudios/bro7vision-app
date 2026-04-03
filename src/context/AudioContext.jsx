// src/context/AudioContext.jsx
// Estado global de audio — vive en App.jsx
// DI Audio habla con este contexto, no con los reproductores directamente
// Preparado para PORT AI en Fase 1

import { createContext, useContext, useState, useCallback } from 'react';

const AudioCtx = createContext(null);

// ── Provider — envuelve App.jsx ───────────────────────────────────────────
export const AudioProvider = ({ children }) => {

  const [currentChannel, setCurrentChannel] = useState(null);  // canal activo
  const [isPlaying, setIsPlaying]           = useState(false);
  const [gamesMuted, setGamesMuted]         = useState(false);  // silencia SFX de Games
  const [volume, setVolume]                 = useState(0.8);    // 0..1
  const [source, setSource]                 = useState(null);   // 'brolives' | 'brotuner'

  // ── Acciones del DI ───────────────────────────────────────────────────────

  // "Ponme a Larry" → DI llama playChannel(canal)
  const playChannel = useCallback((canal, src = 'brolives') => {
    setCurrentChannel(canal);
    setSource(src);
    setIsPlaying(true);
  }, []);

  // "Para el audio"
  const stopAudio = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // "Pausa"
  const pauseAudio = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // "Corta el audio de los Games"
  const muteGames = useCallback(() => setGamesMuted(true),  []);
  const unmuteGames = useCallback(() => setGamesMuted(false), []);

  // "Sube el volumen"
  const changeVolume = useCallback((v) => {
    setVolume(Math.min(1, Math.max(0, v)));
  }, []);

  // ── Valor expuesto ────────────────────────────────────────────────────────
  const value = {
    // Estado (solo lectura para los reproductores)
    currentChannel,
    isPlaying,
    gamesMuted,
    volume,
    source,

    // Acciones (el DI las llama)
    playChannel,
    stopAudio,
    pauseAudio,
    muteGames,
    unmuteGames,
    changeVolume,
  };

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
};

// ── Hook de consumo ───────────────────────────────────────────────────────
export const useAudioContext = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudioContext debe usarse dentro de <AudioProvider>');
  return ctx;
};
