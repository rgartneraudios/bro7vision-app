// src/components/WebLLMButton.jsx
// Botón flotante "Modo IA" para las puertas laterales de BRO7VISION.
// Se monta en App.jsx y recibe el mode + contextData activos para
// saber qué personaje está en pantalla.
//
// USO EN App.jsx:
//   import { WebLLMButton } from './components/WebLLMButton';
//   <WebLLMButton mode={modeActual} contextData={contextData} />

import { useState } from 'react';
import { useWebLLM, WEBLLM_STATUS } from '../hooks/useWebLLM';
import { WebLLMModal } from './WebLLMModal';

// ─── Icono cerebro neon ───────────────────────────────────────────────────────

const IconoCerebro = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.77-3.22 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.84A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.77-3.22 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.84A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

// ─── Diálogo de confirmación de descarga ─────────────────────────────────────

const DialogoDescarga = ({ personajeNombre, onConfirmar, onCancelar }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9998,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  }}>
    <div style={{
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1a2e 100%)',
      border: '1px solid rgba(0,255,200,0.3)',
      borderRadius: '16px',
      padding: '2rem',
      maxWidth: '360px',
      width: '100%',
      boxShadow: '0 0 40px rgba(0,255,200,0.15), 0 0 80px rgba(0,100,255,0.1)',
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.75rem' }}>🧠</div>
      <h3 style={{
        color: '#00ffc8', margin: '0 0 0.75rem',
        fontSize: '1rem', textAlign: 'center', letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        Modo IA — {personajeNombre}
      </h3>
      <p style={{
        color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem',
        lineHeight: '1.6', margin: '0 0 0.5rem', textAlign: 'center',
      }}>
        La IA corre en tu dispositivo. Primera carga: <strong style={{ color: '#00ffc8' }}>~1.5 Giga bytes</strong>.
      </p>
      <p style={{
        color: 'rgba(255,200,0,0.8)', fontSize: '0.78rem',
        lineHeight: '1.5', margin: '0 0 1.5rem', textAlign: 'center',
      }}>
        📡 Recomendado usar <strong>WiFi</strong>.<br/>
        Requiere <strong>Chrome</strong> con WebGPU activo.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={onCancelar} style={{
          flex: 1, padding: '0.65rem',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px', color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer', fontSize: '0.82rem',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
        onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
        >
          Ahora no
        </button>
        <button onClick={onConfirmar} style={{
          flex: 1, padding: '0.65rem',
          background: 'linear-gradient(135deg, rgba(0,255,200,0.2), rgba(0,100,255,0.2))',
          border: '1px solid rgba(0,255,200,0.5)',
          borderRadius: '8px', color: '#00ffc8',
          cursor: 'pointer', fontSize: '0.82rem',
          fontFamily: 'inherit', fontWeight: 'bold',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.target.style.background = 'linear-gradient(135deg, rgba(0,255,200,0.35), rgba(0,100,255,0.35))'; }}
        onMouseLeave={e => { e.target.style.background = 'linear-gradient(135deg, rgba(0,255,200,0.2), rgba(0,100,255,0.2))'; }}
        >
          Activar IA ⚡
        </button>
      </div>
    </div>
  </div>
);

// ─── Barra de progreso de carga ───────────────────────────────────────────────

const BarraCarga = ({ progress, personajeNombre }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9998,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Courier New', monospace",
  }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
    <p style={{ color: '#00ffc8', fontSize: '0.9rem', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
      CARGANDO {personajeNombre?.toUpperCase()}...
    </p>
    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
      Inicializando modelo local · {progress}%
    </p>
    <div style={{
      width: '280px', height: '6px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '3px', overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #00ffc8, #0088ff)',
        borderRadius: '3px',
        transition: 'width 0.3s ease',
        boxShadow: '0 0 10px rgba(0,255,200,0.5)',
      }} />
    </div>
    <p style={{
      color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem',
      marginTop: '1.5rem', textAlign: 'center', maxWidth: '260px',
    }}>
      La siguiente vez ya no necesita descargarse
    </p>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────

export const WebLLMButton = ({ mode, contextData }) => {
  const [modalAbierto,        setModalAbierto]        = useState(false);
  const [dialogoVisible,      setDialogoVisible]      = useState(false);

  const webLLM = useWebLLM();

  // Resolver el personaje activo a partir de mode + contextData
  const personajeKey = webLLM.resolverPersonaje(mode, contextData);

  // Obtener nombre legible del personaje
  const obtenerNombrePersonaje = () => {
    const mapa = {
      lara: 'Lara', tito: 'Tito', puffo: 'Puffo',
      nova: 'Nova', isabella: 'Isabella', profesor_robles: 'Profesor Robles',
      mapache: 'Mapache', ami: 'Ami',
      evelyn: 'Evelyn', larry: 'Larry',
      rumores: 'Rumores',
      orumama: 'Orumama', smisterio: 'Señor Misterio', jaguar: 'Jaguar',
    };
    return mapa[personajeKey] || 'IA';
  };

  const nombrePersonaje = obtenerNombrePersonaje();

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleBotonClick = () => {
    if (webLLM.isReady) {
      // Modelo ya cargado — abrir modal directamente
      webLLM.cambiarPersonaje(personajeKey);
      setModalAbierto(true);
    } else if (webLLM.isIdle || webLLM.isError) {
      // Primera vez o error — mostrar diálogo de confirmación
      setDialogoVisible(true);
    }
    // Si está loading, no hacemos nada (el overlay de carga está visible)
  };

  const handleConfirmarDescarga = async () => {
    setDialogoVisible(false);
    await webLLM.inicializar();
    // Cuando termine de cargar, abrir el modal automáticamente
    // (el effect en el modal detecta isReady)
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    webLLM.resetChat();
  };

  // Cuando el modelo termina de cargar, abrir modal automáticamente
  // (solo si estábamos esperando a que cargara)
  if (webLLM.isReady && !modalAbierto && !dialogoVisible && !webLLM.isIdle) {
    // Solo abrimos si el status acaba de pasar a READY (no en renders normales)
    // Lo manejamos desde el botón — el usuario tendrá que pulsar de nuevo si cerró
  }

  // ── Color del botón según estado ────────────────────────────────────────────
  const colorBoton = webLLM.isReady    ? '#00ffc8'
                   : webLLM.isError    ? '#ff4466'
                   : webLLM.isLoading  ? '#ffaa00'
                   : 'rgba(0,255,200,0.6)';

  const etiquetaBoton = webLLM.isReady   ? `IA · ${nombrePersonaje}`
                      : webLLM.isLoading ? `Cargando ${webLLM.progress}%`
                      : webLLM.isError   ? 'Error IA'
                      : 'Modo IA';

  return (
    <>
      {/* ── Botón flotante ── */}
      <button
        onClick={handleBotonClick}
        title={`Modo IA — ${nombrePersonaje}`}
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            '0.4rem',
          padding:        '0.45rem 0.8rem',
          background:     'rgba(0,0,0,0.7)',
          border:         `1px solid ${colorBoton}`,
          borderRadius:   '20px',
          color:          colorBoton,
          cursor:         webLLM.isLoading ? 'not-allowed' : 'pointer',
          fontSize:       '0.72rem',
          fontFamily:     "'Courier New', monospace",
          letterSpacing:  '0.05em',
          textTransform:  'uppercase',
          backdropFilter: 'blur(8px)',
          transition:     'all 0.25s ease',
          boxShadow:      webLLM.isReady
            ? `0 0 12px rgba(0,255,200,0.3), inset 0 0 12px rgba(0,255,200,0.05)`
            : 'none',
          whiteSpace:     'nowrap',
          userSelect:     'none',
          pointerEvents:  webLLM.isLoading ? 'none' : 'auto',
        }}
        onMouseEnter={e => {
          if (!webLLM.isLoading) {
            e.currentTarget.style.boxShadow = `0 0 20px ${colorBoton}40, inset 0 0 15px ${colorBoton}10`;
            e.currentTarget.style.background = 'rgba(0,0,0,0.85)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = webLLM.isReady
            ? `0 0 12px rgba(0,255,200,0.3), inset 0 0 12px rgba(0,255,200,0.05)`
            : 'none';
          e.currentTarget.style.background = 'rgba(0,0,0,0.7)';
        }}
      >
        {webLLM.isLoading
          ? <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙</span>
          : <IconoCerebro />
        }
        <span>{etiquetaBoton}</span>

        {/* Punto pulsante cuando está ready */}
        {webLLM.isReady && (
          <span style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#00ffc8',
            animation: 'pulso 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
        )}
      </button>

      {/* ── Estilos de animación ── */}
      <style>{`
        @keyframes pulso {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Diálogo confirmación descarga ── */}
      {dialogoVisible && (
        <DialogoDescarga
          personajeNombre={nombrePersonaje}
          onConfirmar={handleConfirmarDescarga}
          onCancelar={() => setDialogoVisible(false)}
        />
      )}

      {/* ── Barra de progreso carga ── */}
      {webLLM.isLoading && (
        <BarraCarga
          progress={webLLM.progress}
          personajeNombre={nombrePersonaje}
        />
      )}

      {/* ── Modal de conversación ── */}
      {modalAbierto && webLLM.isReady && (
        <WebLLMModal
          webLLM={webLLM}
          personajeKey={personajeKey}
          nombrePersonaje={nombrePersonaje}
          onCerrar={handleCerrarModal}
          onModeloListo={() => {
            webLLM.cambiarPersonaje(personajeKey);
            setModalAbierto(true);
          }}
        />
      )}
    </>
  );
};
