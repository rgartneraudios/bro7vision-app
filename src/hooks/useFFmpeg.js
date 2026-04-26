// src/hooks/useFFmpeg.js
// Hook reutilizable — comprime video y extrae MP3 con FFmpeg.wasm
// Se carga en el navegador del usuario, sin coste de servidor.
// Uso: const { procesarVideo, progreso, fase, procesando } = useFFmpeg();

import { useState, useRef } from 'react';

export const useFFmpeg = () => {
  const [progreso,   setProgreso]   = useState(0);
  const [fase,       setFase]       = useState('');
  const [procesando, setProcesando] = useState(false);
  const ffmpegRef = useRef(null);

  // Carga FFmpeg.wasm solo la primera vez (singleton por sesión)
  const cargarFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    const { FFmpeg }             = await import('@ffmpeg/ffmpeg');
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

  // Recibe el File original del video
  // Devuelve { videoBlob, audioBlob } — Blobs listos para subir a R2
  const procesarVideo = async (file) => {
    setProcesando(true);
    setProgreso(0);

    try {
      setFase('Cargando motor de optimización...');
      const { ffmpeg, fetchFile } = await cargarFFmpeg();

      const ext         = file.name.split('.').pop() || 'mp4';
      const inputName   = `input.${ext}`;
      const outputVideo = 'output.mp4';
      const outputAudio = 'output.mp3';

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // ── Paso 1: Comprimir video ──
      // 720p máx · CRF 28 (~60% menos peso) · faststart para streaming
      setFase('Optimizando video...');
      setProgreso(0);
      await ffmpeg.exec([
        '-i', inputName,
        '-vf', 'scale=-2:720',
        '-c:v', 'libx264',
        '-crf', '28',
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        outputVideo,
      ]);

      // ── Paso 2: Extraer audio MP3 ──
      setFase('Extrayendo audio para móvil...');
      setProgreso(0);
      await ffmpeg.exec([
        '-i', inputName,
        '-vn',
        '-ar', '44100',
        '-ac', '2',
        '-b:a', '128k',
        outputAudio,
      ]);

      const videoData = await ffmpeg.readFile(outputVideo);
      const audioData = await ffmpeg.readFile(outputAudio);

      const videoBlob = new Blob([videoData.buffer], { type: 'video/mp4' });
      const audioBlob = new Blob([audioData.buffer], { type: 'audio/mpeg' });

      // Limpieza del sistema de ficheros virtual
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputVideo);
      await ffmpeg.deleteFile(outputAudio);

      setFase('¡Listo!');
      setProgreso(100);

      return { videoBlob, audioBlob };

    } catch (err) {
      console.error('[useFFmpeg] Error:', err);
      setFase('Error al procesar');
      throw err;
    } finally {
      setProcesando(false);
    }
  };

  return { procesarVideo, progreso, fase, procesando };
};
