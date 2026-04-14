// src/components/OllamaButton.jsx
import { useState, useEffect } from 'react';

const IconoCerebroLocal = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
    <line x1="6" y1="6" x2="6.01" y2="6"/>
    <line x1="6" y1="18" x2="6.01" y2="18"/>
  </svg>
);

export const OllamaButton = ({ ollama, mode, contextData }) => {
  // Ya no hacemos "const ollama = useOllama()" aquí. Viene de App.jsx
  
  const personajeKey = ollama.resolverPersonaje(mode, contextData);

  const handleBotonClick = async () => {
    if (!ollama.isReady) {
      await ollama.conectarNodo();
    }
  };

  // Cuando la conexión se logra, le decimos qué personaje debe cargar
  useEffect(() => {
    if (ollama.isReady && personajeKey) {
      ollama.cambiarPersonaje(personajeKey);
    }
  }, [ollama.isReady, personajeKey, ollama]);

  const colorBoton = ollama.isReady ? '#00ffc8' : ollama.isError ? '#ff0040' : ollama.isConnecting ? '#ffaa00' : 'rgba(0,255,200,0.6)';
  const etiqueta = ollama.isReady ? `IA ACTIVA` : ollama.isConnecting ? 'CONECTANDO...' : 'ACTIVAR IA LOCAL';

  return (
    <button onClick={handleBotonClick} style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.45rem 0.8rem', background: 'rgba(0,0,0,0.7)',
      border: `1px solid ${colorBoton}`, borderRadius: '20px',
      color: colorBoton, cursor: 'pointer', fontSize: '0.72rem',
      fontFamily: "'Courier New', monospace", textTransform: 'uppercase',
      boxShadow: ollama.isReady ? `0 0 12px ${colorBoton}40` : 'none',
      width: '100%', justifyContent: 'center'
    }}>
      {ollama.isConnecting ? <span style={{ animation: 'spin 1s linear infinite' }}>⚙</span> : <IconoCerebroLocal />}
      <span>{etiqueta}</span>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </button>
  );
};