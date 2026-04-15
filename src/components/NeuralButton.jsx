// src/components/NeuralButton.jsx
// ─────────────────────────────────────────────────────────────
// BOTÓN NEURAL — Puerta Izquierda (solo MobileTabletLayout)
// Estados:
//   · Apagado   → icono gris, toca → Modal Protocolo de Calle
//   · Descargando → barra de progreso en el propio botón
//   · Encendido  → icono neón brillante pulsante
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useWebLLM } from '../context/WebLLMContext';

export default function NeuralButton() {
  const {
    isIAActive,
    isDownloading,
    downloadProgress,
    downloadError,
    descargarYEncender,
    apagar,
  } = useWebLLM();

  const [showModal, setShowModal] = useState(false);

  // ── Handlers ────────────────────────────────────────────
  const handleTap = () => {
    if (isDownloading) return; // descargando, nada que hacer
    if (isIAActive) {
      apagar();               // apagar si ya está activo
      return;
    }
    setShowModal(true);       // mostrar aviso WiFi antes de descargar
  };

  const handleConfirmar = () => {
    setShowModal(false);
    descargarYEncender();
  };

  const handleCancelar = () => setShowModal(false);

  // ── Estilos dinámicos del botón ──────────────────────────
  const btnBase =
    'relative flex flex-col items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 select-none';

  const btnEstado = isIAActive
    ? 'border-cyan-400 shadow-[0_0_12px_2px_rgba(34,211,238,0.7)] bg-black animate-pulse'
    : isDownloading
    ? 'border-yellow-400 bg-black'
    : 'border-gray-600 bg-black opacity-60';

  // ── Icono SVG del cerebro/neural ─────────────────────────
  const iconColor = isIAActive ? '#22d3ee' : isDownloading ? '#facc15' : '#6b7280';

  return (
    <>
      {/* ── BOTÓN ─────────────────────────────────────────── */}
      <button
        className={`${btnBase} ${btnEstado}`}
        onClick={handleTap}
        aria-label={isIAActive ? 'Desactivar IA neural' : 'Activar IA neural'}
      >
        {/* Icono cerebro simple SVG */}
        <svg
          width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke={iconColor} strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M9.5 2a4.5 4.5 0 0 1 4.5 4.5v.5" />
          <path d="M14 7a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5" />
          <path d="M16 14.5A3.5 3.5 0 0 1 12.5 18H12" />
          <path d="M12 18a3 3 0 0 1-3 3" />
          <path d="M9 21a3 3 0 0 1-3-3v-.5" />
          <path d="M6 17.5A4 4 0 0 1 2 14c0-1.6.9-3 2.2-3.7" />
          <path d="M4.3 10.3A4.5 4.5 0 0 1 9.5 6" />
          <circle cx="12" cy="12" r="1" fill={iconColor} />
        </svg>

        {/* Barra de progreso superpuesta durante descarga */}
        {isDownloading && (
          <div className="absolute bottom-0 left-0 h-1 rounded-b-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${downloadProgress}%` }}
          />
        )}

        {/* Texto de porcentaje durante descarga */}
        {isDownloading && (
          <span className="absolute -bottom-5 text-[9px] text-yellow-400 font-mono">
            {downloadProgress}%
          </span>
        )}
      </button>

      {/* ── MODAL PROTOCOLO DE CALLE ──────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <div className="bg-[#0a0a0a] border border-cyan-500/40 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(34,211,238,0.15)]">

            {/* Cabecera */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-cyan-300 font-bold text-base leading-tight">
                PROTOCOLO DE CALLE
              </h2>
            </div>

            {/* Cuerpo */}
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Requiere{' '}
              <span className="text-yellow-400 font-semibold">WiFi (≈1.5 GB)</span>.
              Descarga el cerebro neural de BroVision para que tu dispositivo
              piense por sí mismo{' '}
              <span className="text-cyan-400">sin gastar datos en la calle</span>.
            </p>

            <p className="text-gray-500 text-xs mb-6">
              El modelo se guarda en tu dispositivo. Solo se descarga una vez.
              Mientras descarga puedes seguir chateando en Modo JS.
            </p>

            {/* Error si hubo fallo previo */}
            {downloadError && (
              <p className="text-red-400 text-xs mb-4 bg-red-400/10 rounded p-2">
                Error anterior: {downloadError}
              </p>
            )}

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelar}
                className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm hover:border-gray-500 transition-colors"
              >
                Ahora no
              </button>
              <button
                onClick={handleConfirmar}
                className="flex-1 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition-colors"
              >
                Descargar IA
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
