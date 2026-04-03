import React, { useState } from 'react';

export default function OsosChatInput({ onSend, isLoading }) {
  // El estado de lo que el usuario escribe ahora vive AQUÍ, no en App.jsx
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text); // Le pasamos el texto a App.jsx para que llame a Gemini
    setText('');  // Limpiamos la caja de texto tras enviar
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-2">
      <style>{`
        @keyframes borderPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(0,208,255,0.15), 0 0 0 1px rgba(0,208,255,0.3); }
          50%       { box-shadow: 0 0 28px rgba(0,208,255,0.45), 0 0 0 1px rgba(0,208,255,0.7); }
        }
        .osos-textarea {
          animation: borderPulse 2.5s ease-in-out infinite;
        }
        .osos-textarea:focus {
          animation: none;
          box-shadow: 0 0 36px rgba(0,208,255,0.6), 0 0 0 1.5px rgba(0,208,255,0.9);
        }
      `}</style>

      <textarea
        maxLength={120}
        rows={3}
        placeholder="✦  Cuéntame qué buscas y dónde quieres ir..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="osos-textarea w-full bg-black/70 backdrop-blur-xl border border-cyan-400/50 focus:border-cyan-300 p-5 rounded-2xl outline-none font-mono text-base text-white placeholder-cyan-700/70 transition-colors resize-none leading-relaxed"
      />

      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] text-cyan-700/60 font-mono tracking-widest">
          {text.length}/120
          {isLoading && <span className="ml-3 text-cyan-400 animate-pulse">● procesando...</span>}
        </span>
        <button
          onClick={handleSend}
          disabled={isLoading || !text.trim()}
          className="bg-cyan-500/30 hover:bg-cyan-400/50 border border-cyan-400/60 hover:border-cyan-300 text-cyan-200 hover:text-white px-8 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-20 shadow-[0_0_16px_rgba(0,208,255,0.2)] hover:shadow-[0_0_24px_rgba(0,208,255,0.5)]">
          {isLoading ? '⏳' : '➤ ENVIAR'}
        </button>
      </div>
    </div>
  );
}