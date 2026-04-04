// src/components/AgentChatInput.jsx
import React, { useState } from 'react';

// ─── PALETA DE COLORES POR AGENTE ────────────────────────────────────────────
const AGENT_COLORS = {
  violet: {
    rgb:         '139,92,246',
    border:      'border-violet-400/50',
    borderFocus: 'focus:border-violet-300',
    placeholder: 'placeholder-violet-700/70',
    counter:     'text-violet-700/60',
    pulse:       'text-violet-300',
    btn:         'bg-violet-500/30 hover:bg-violet-400/50 border-violet-400/60 hover:border-violet-300 text-violet-200',
  },
  gold: {
    rgb:         '255,215,0',
    border:      'border-yellow-400/50',
    borderFocus: 'focus:border-yellow-300',
    placeholder: 'placeholder-yellow-700/70',
    counter:     'text-yellow-700/60',
    pulse:       'text-yellow-400',
    btn:         'bg-yellow-500/30 hover:bg-yellow-400/50 border-yellow-400/60 hover:border-yellow-300 text-yellow-200',
  },
  cyan: {
    rgb:         '0,208,255',
    border:      'border-cyan-400/50',
    borderFocus: 'focus:border-cyan-300',
    placeholder: 'placeholder-cyan-700/70',
    counter:     'text-cyan-700/60',
    pulse:       'text-cyan-400',
    btn:         'bg-cyan-500/30 hover:bg-cyan-400/50 border-cyan-400/60 hover:border-cyan-300 text-cyan-200',
  },
  slateblue: {
    rgb:         '107,143,168',
    border:      'border-slate-400/50',
    borderFocus: 'focus:border-slate-300',
    placeholder: 'placeholder-slate-600/70',
    counter:     'text-slate-600/60',
    pulse:       'text-slate-400',
    btn:         'bg-slate-500/30 hover:bg-slate-400/50 border-slate-400/60 hover:border-slate-300 text-slate-200',
  },
  green: {
    rgb:         '16,185,129',
    border:      'border-emerald-400/50',
    borderFocus: 'focus:border-emerald-300',
    placeholder: 'placeholder-emerald-700/70',
    counter:     'text-emerald-700/60',
    pulse:       'text-emerald-400',
    btn:         'bg-emerald-500/30 hover:bg-emerald-400/50 border-emerald-400/60 hover:border-emerald-300 text-emerald-200',
  },
  amber: {
    rgb:         '245,158,11',
    border:      'border-amber-400/50',
    borderFocus: 'focus:border-amber-300',
    placeholder: 'placeholder-amber-700/70',
    counter:     'text-amber-700/60',
    pulse:       'text-amber-400',
    btn:         'bg-amber-500/30 hover:bg-amber-400/50 border-amber-400/60 hover:border-amber-300 text-amber-200',
  },
  pink: {
    rgb:         '236,72,153',
    border:      'border-pink-400/50',
    borderFocus: 'focus:border-pink-300',
    placeholder: 'placeholder-pink-700/70',
    counter:     'text-pink-700/60',
    pulse:       'text-pink-400',
    btn:         'bg-pink-500/30 hover:bg-pink-400/50 border-pink-400/60 hover:border-pink-300 text-pink-200',
  },
};

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
/**
 * @param {function} onSend      — Callback al enviar el mensaje
 * @param {boolean}  isLoading   — Estado de carga del agente
 * @param {string}   color       — 'violet' | 'gold' | 'cyan' | 'slateblue' | 'green' | 'amber' | 'pink'
 * @param {string}   placeholder — Texto del placeholder personalizado por agente
 * @param {number}   maxLength   — Límite de caracteres (default 120)
 */
export default function AgentChatInput({
  onSend,
  isLoading,
  color       = 'violet',
  placeholder = '✦  Cuéntame qué buscas y dónde quieres ir...',
  maxLength   = 120,
}) {
  const [text, setText] = useState('');
  const c = AGENT_COLORS[color] || AGENT_COLORS.violet;

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text);
    setText('');
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
        @keyframes agentPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(${c.rgb},0.15), 0 0 0 1px rgba(${c.rgb},0.3); }
          50%       { box-shadow: 0 0 28px rgba(${c.rgb},0.45), 0 0 0 1px rgba(${c.rgb},0.7); }
        }
        .agent-textarea {
          animation: agentPulse 2.5s ease-in-out infinite;
        }
        .agent-textarea:focus {
          animation: none;
          box-shadow: 0 0 36px rgba(${c.rgb},0.6), 0 0 0 1.5px rgba(${c.rgb},0.9);
        }
      `}</style>

      <textarea
        maxLength={maxLength}
        rows={3}
        placeholder={placeholder}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`agent-textarea w-full bg-black/70 backdrop-blur-xl border ${c.border} ${c.borderFocus} p-5 rounded-2xl outline-none font-mono text-base text-white ${c.placeholder} transition-colors resize-none leading-relaxed`}
      />

      <div className="flex justify-between items-center px-1">
        <span className={`text-[10px] ${c.counter} font-mono tracking-widest`}>
          {text.length}/{maxLength}
          {isLoading && (
            <span className={`ml-3 ${c.pulse} animate-pulse`}>● procesando...</span>
          )}
        </span>
        <button
          onClick={handleSend}
          disabled={isLoading || !text.trim()}
          className={`${c.btn} border px-8 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-20 shadow-[0_0_16px_rgba(${c.rgb},0.2)] hover:shadow-[0_0_24px_rgba(${c.rgb},0.5)]`}
        >
          {isLoading ? '⏳' : '➤ ENVIAR'}
        </button>
      </div>
    </div>
  );
}
