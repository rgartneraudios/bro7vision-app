// src/context/WebLLMContext.jsx
// ─────────────────────────────────────────────────────────────
// CONTEXTO GLOBAL — WebLLM
// Vive POR ENCIMA de todas las pantallas en MobileTabletLayout.
// El modelo se descarga una vez y sobrevive a cambios de sector.
// Compatible: Chrome Android + Chrome PC (WebGPU).
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useRef, useState, useCallback } from 'react';
import * as webllm from '@mlc-ai/web-llm';

// ── Modelo elegido ──────────────────────────────────────────
// Phi-3-mini: ~1.5 GB, WebGPU, rápido en móvil/tablet.
// Cambiar aquí si se quiere un modelo más ligero o más potente.
const MODEL_ID = 'Phi-3-mini-4k-instruct-q4f16_1-MLC';

// ── Context ─────────────────────────────────────────────────
const WebLLMContext = createContext(null);

export function WebLLMProvider({ children }) {
  // Estado público
  const [isIAActive, setIsIAActive]     = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // 0–100
  const [downloadError, setDownloadError] = useState(null);

  // Motor interno — no provoca re-renders al cambiar
  const engineRef = useRef(null);

  // Historial de conversación de la sesión actual
  // [ { role: 'system'|'user'|'assistant', content: string } ]
  const historyRef = useRef([]);

  // ── descargarYEncender ──────────────────────────────────
  // Descarga el modelo (IndexedDB lo cachea), inicializa el motor.
  // Llama a onProgress(0–100) durante la descarga.
  const descargarYEncender = useCallback(async () => {
    if (engineRef.current) {
      // Ya estaba descargado — solo activar
      setIsIAActive(true);
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);
    setDownloadProgress(0);

    try {
      const engine = await webllm.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report) => {
          // report.progress es 0.0–1.0
          const pct = Math.round((report.progress ?? 0) * 100);
          setDownloadProgress(pct);
        },
      });

      engineRef.current = engine;
      setIsIAActive(true);
    } catch (err) {
      console.error('[WebLLM] Error al inicializar:', err);
      setDownloadError(err.message ?? 'Error desconocido');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  // ── apagar ───────────────────────────────────────────────
  // Desactiva la IA sin borrar el modelo de IndexedDB.
  // El usuario puede volver a encenderla sin re-descargar.
  const apagar = useCallback(() => {
    setIsIAActive(false);
    historyRef.current = [];
  }, []);

  // ── resetearHistorial ───────────────────────────────────
  // Limpia la memoria de conversación al cambiar de personaje/sector.
  const resetearHistorial = useCallback((systemPrompt) => {
    historyRef.current = systemPrompt
      ? [{ role: 'system', content: systemPrompt }]
      : [];
  }, []);

  // ── generarRespuesta ─────────────────────────────────────
  // Recibe el texto del usuario + system prompt del personaje activo.
  // Devuelve el texto limpio generado por el modelo.
  // El historial se acumula en RAM durante la sesión.
  const generarRespuesta = useCallback(async (textoUsuario, systemPrompt) => {
    if (!engineRef.current) {
      throw new Error('[WebLLM] Motor no inicializado.');
    }

    // Si el historial está vacío o cambió el system prompt, resetear
    const primerMensaje = historyRef.current[0];
    if (!primerMensaje || primerMensaje.content !== systemPrompt) {
      resetearHistorial(systemPrompt);
    }

    // Añadir mensaje del usuario al historial
    historyRef.current.push({ role: 'user', content: textoUsuario });

    // Llamar al modelo
    const reply = await engineRef.current.chat.completions.create({
      messages: historyRef.current,
      temperature: 0.7,
      max_tokens: 300,
    });

    const textoIA = reply.choices[0]?.message?.content ?? '';

    // Añadir respuesta al historial
    historyRef.current.push({ role: 'assistant', content: textoIA });

    return textoIA;
  }, [resetearHistorial]);

  // ── Valor expuesto al árbol de componentes ───────────────
  const value = {
    isIAActive,
    isDownloading,
    downloadProgress,
    downloadError,
    descargarYEncender,
    apagar,
    resetearHistorial,
    generarRespuesta,
  };

  return (
    <WebLLMContext.Provider value={value}>
      {children}
    </WebLLMContext.Provider>
  );
}

// ── Hook de consumo ──────────────────────────────────────────
export function useWebLLM() {
  const ctx = useContext(WebLLMContext);
  if (!ctx) {
    throw new Error('useWebLLM debe usarse dentro de <WebLLMProvider>');
  }
  return ctx;
}
