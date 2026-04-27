// src/hooks/useFFmpeg.js
// Hook reutilizable — comprime video y extrae MP3 con FFmpeg.wasm
// Detecta automáticamente el ratio del video y aplica configuración óptima:
//   · 9:16 vertical   → 480p, CRF 30  (frame móvil simulado en PC)
//   · 21:9 ultrawide  → 720p, CRF 26  (escaparate catálogo, calidad alta)
//   · otros ratios    → 720p, CRF 28  (estándar)

import { useState, useRef } from 'react';

// ── Detecta ratio leyendo dimensiones antes de procesar ───────────────────
const detectarRatio = (file) =>
  new Promise((resolve) => {
    const url   = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      URL.revokeObjectURL(url);
      video.src = '';
      const ratio = w / h;
      if (ratio < 0.7)    resolve({ tipo: 'vertical',   w, h }); // 9:16
      else if (ratio > 2) resolve({ tipo: 'ultrawide',  w, h }); // 21:9
      else                resolve({ tipo: 'estandar',   w, h }); // 16:9
    };
    video.onerror = () => { URL.revokeObjectURL(url); resolve({ tipo: 'estandar', w: 0, h: 0 }); };
    video.src = url;
  });

// ── Config FFmpeg por tipo ────────────────────────────────────────────────
const CONFIG = {
  // 9:16 — frame móvil pequeño, 480p más que suficiente
  vertical: {
    label:  '9:16 · Señal Móvil',
    vf:     'scale=-2:480',
    crf:    '30',
    audio:  '96k',
  },
  // 21:9 — escaparate catálogo, se ve en pantalla grande, más calidad
  ultrawide: {
    label:  '21:9 · Catálogo',
    vf:     'scale=-2:720',
    crf:    '26',
    audio:  '128k',
  },
  // 16:9 estándar
  estandar: {
    label:  '16:9 · Estándar',
    vf:     'scale=-2:720',
    crf:    '28',
    audio:  '128k',
  },
};

export const useFFmpeg = () => {
  const [progreso,      setProgreso]      = useState(0);
  const [fase,          setFase]          = useState('');
  const [procesando,    setProcesando]    = useState(false);
  const [tipoDetectado, setTipoDetectado] = useState(null);
  const ffmpegRef = useRef(null);

  const cargarFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    const { FFmpeg }               = await import('@ffmpeg/ffmpeg');
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util');
    const ffmpeg = new FFmpeg();
    ffmpeg.on('progress', ({ progress }) => {
      setProgreso(Math.round(Math.min(progress * 100, 99)));
    });
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`,   'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegRef.current = { ffmpeg, fetchFile };
    return ffmpegRef.current;
  };

  // Recibe File · devuelve { videoBlob, audioBlob, tipo }
  const procesarVideo = async (file) => {
    setProcesando(true);
    setProgreso(0);
    setTipoDetectado(null);

    try {
      // 1 — Detectar ratio
      setFase('Analizando video...');
      const { tipo, w, h } = await detectarRatio(file);
      const cfg = CONFIG[tipo];
      setTipoDetectado({ tipo, label: cfg.label, w, h });

      // 2 — Cargar FFmpeg
      setFase('Cargando motor de optimización...');
      const { ffmpeg, fetchFile } = await cargarFFmpeg();

      const ext         = file.name.split('.').pop() || 'mp4';
      const inputName   = `input.${ext}`;
      const outputVideo = 'output.mp4';
      const outputAudio = 'output.mp3';

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // 3 — Comprimir según ratio
      setFase(`Optimizando ${cfg.label}...`);
      setProgreso(0);
      await ffmpeg.exec([
        '-i', inputName,
        '-vf', cfg.vf,
        '-c:v', 'libx264',
        '-crf', cfg.crf,
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', cfg.audio,
        '-movflags', '+faststart',
        outputVideo,
      ]);

      // 4 — Extraer MP3 (para BroLives móvil — útil en vertical, no daña en los demás)
      setFase('Extrayendo audio para móvil...');
      setProgreso(0);
      await ffmpeg.exec([
        '-i', inputName,
        '-vn',
        '-ar', '44100',
        '-ac', '2',
        '-b:a', cfg.audio,
        outputAudio,
      ]);

      const videoData = await ffmpeg.readFile(outputVideo);
      const audioData = await ffmpeg.readFile(outputAudio);

      const videoBlob = new Blob([videoData.buffer], { type: 'video/mp4' });
      const audioBlob = new Blob([audioData.buffer], { type: 'audio/mpeg' });

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputVideo);
      await ffmpeg.deleteFile(outputAudio);

      setFase('¡Listo!');
      setProgreso(100);

      return { videoBlob, audioBlob, tipo };

    } catch (err) {
      console.error('[useFFmpeg] Error:', err);
      setFase('Error al procesar');
      throw err;
    } finally {
      setProcesando(false);
    }
  };

  return { procesarVideo, progreso, fase, procesando, tipoDetectado };
};
