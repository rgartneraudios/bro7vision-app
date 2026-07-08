// src/components/AgentChatInput.jsx
import React, { useState } from 'react';

// ─── PALETA DE COLORES ────────────────────────────────────────────
const AGENT_COLORS = {
  violet: {
    rgb:         '139,92,246',
    border:      'border-violet-400/50',
    borderFocus: 'focus:border-violet-300',
    placeholder: 'placeholder-violet-300/70',
    counter:     'text-violet-700/60',
    pulse:       'text-violet-300',
    btn:         'bg-violet-500/30 hover:bg-violet-400/50 border-violet-400/60 hover:border-violet-300 text-violet-200',
  },
  gold: {
    rgb:         '255,215,0',
    border:      'border-yellow-400/50',
    borderFocus: 'focus:border-yellow-300',
    placeholder: 'placeholder-yellow-300/70',
    counter:     'text-yellow-700/60',
    pulse:       'text-yellow-400',
    btn:         'bg-yellow-500/30 hover:bg-yellow-400/50 border-yellow-400/60 hover:border-yellow-300 text-yellow-200',
  },
  cyan: {
    rgb:         '0,208,255',
    border:      'border-cyan-400/50',
    borderFocus: 'focus:border-cyan-300',
    placeholder: 'placeholder-cyan-300/70',
    counter:     'text-cyan-700/60',
    pulse:       'text-cyan-400',
    btn:         'bg-cyan-500/30 hover:bg-cyan-400/50 border-cyan-400/60 hover:border-cyan-300 text-cyan-200',
  },
  pink: { 
    rgb:         '254,109,184',
    border:      'border-pink-400/50',
    borderFocus: 'focus:border-pink-300',
    placeholder: 'placeholder-pink-300/70',
    counter:     'text-pink-600/60',
    pulse:       'text-pink-400',
    btn:         'bg-pink-500/30 hover:bg-pink-400/50 border-pink-400/60 hover:border-pink-300 text-pink-200',
  },
  green: {
    rgb:         '128,255,97',
    border:      'border-emerald-400/50',
    borderFocus: 'focus:border-emerald-300',
    placeholder: 'placeholder-emerald-300/70',
    counter:     'text-emerald-700/60',
    pulse:       'text-emerald-400',
    btn:         'bg-emerald-500/50 hover:bg-emerald-400/50 border-emerald-400/60 hover:border-emerald-300 text-emerald-200',
  },
  amber: { // Funciona como Naranja/Orange
    rgb:         '245,158,11',
    border:      'border-amber-400/50',
    borderFocus: 'focus:border-amber-300',
    placeholder: 'placeholder-amber-300/70',
    counter:     'text-amber-700/60',
    pulse:       'text-amber-400',
    btn:         'bg-amber-500/30 hover:bg-amber-400/50 border-amber-400/60 hover:border-amber-300 text-amber-200',
  },
blue: {
    rgb:         '0,32,130',
    border:      'border-blue-700/50',
    borderFocus: 'focus:border-blue-500',
    placeholder: 'placeholder-blue-400/70',
    counter:     'text-blue-300/60',
    pulse:       'text-blue-500',
    btn:         'bg-blue-800/30 hover:bg-blue-700/50 border-blue-700/60 hover:border-blue-500 text-blue-100',
  },
};

// ─── CONFIGURACIÓN POR AGENTE (Color + Textos) ─────────────────────────────
const AGENT_PROFILES = {
  osos: {
    theme: 'violet',
    text: '✦  Saluda a tu personaje favorito y elige Sector y ubicación. Ellos te llevarán. Ejemplos: Hola Lara · Pasame con Nova · BroProductos en España · BroDeseos · BroServicios · Dame con Mapache',
    bro7band: 'Habla con Tito, Lara o Puffo — escucha el audio grupal y encuentra la palabra clave'
  },
  nova: {
  theme: 'gold',
  text: ` ✦ Hola! Dime el producto que necesitas! | Que buscas? | Pulsa en las BroCards para obtener una descripción y obtener las tarjetas de descuentos o tarjetas de regalo canjeando tus Lunas`
},
  isabella: {
    theme: 'pink',
    text: '✦  Hola! Dime el servicio que necesitas! | Que buscas? | Pulsa en las BroCards para obtener una descripción y obtener las tarjetas de descuentos o tarjetas de regalo canjeando tus Lunas'
  },
  evelyn: {
    theme: 'blue',
    text: '✦  Publica o busca lo que necesitas — BroDeseos '
  },
  mapache: {
    theme: 'cyan',
    text: '✦  Hola! Dime si buscas músicas o Podcast! | Pulsa en las BroCards para la descripción y play si quieres escuchar | El Stop/Pause está en la puerta lateral izquierda, en el Brolives junto a Brotuner! '
  },
  oraculo: {
    theme: 'violet',
    text: '✦ Los personajes te cuentan historias de ficción y entretenimiento, Con Orumama antes de proceder consulta a un profesional, el Señor Misterio es Ficción entretenimiento, Jaguar es experimental y Ficción entretenimiento '
  }
};

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
/**
 * @param {function} onSend      — Callback al enviar el mensaje
 * @param {boolean}  isLoading   — Estado de carga del agente
 * @param {string}   agent       — 'osos' | 'nova' | 'isabella' | 'evelyn' | 'mapache' | 'oraculo'
 * @param {string}   placeholder — (Opcional) Sobrescribe el texto por defecto del agente
 * @param {number}   maxLength   — Límite de caracteres (default 120)
 */
export default function AgentChatInput({
  onSend,
  isLoading,
  agent       = 'osos',
  placeholder, 
  maxLength   = 120,
}) {
  const [text, setText] = useState('');
  
  // Obtenemos el perfil del agente, si no existe usamos 'osos' por defecto
  const profile = AGENT_PROFILES[agent] || AGENT_PROFILES.osos;
  
  // Obtenemos los colores. Si el theme no existe, usamos violet
  const c = AGENT_COLORS[profile.theme] || AGENT_COLORS.violet;
  
  // Si le pasamos un placeholder por prop, lo usa. Si no, usa el del perfil.
  const finalPlaceholder = placeholder || profile.text;

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
        .agent-textarea {
          scrollbar-width: thin;
          scrollbar-color: rgba(${c.rgb},0.4) transparent;
        }
        .agent-textarea::-webkit-scrollbar {
          width: 4px;
        }
        .agent-textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        .agent-textarea::-webkit-scrollbar-thumb {
          background: rgba(${c.rgb},0.35);
          border-radius: 99px;
        }
        .agent-textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(${c.rgb},0.65);
        }
      `}</style>

      <textarea
        maxLength={maxLength}
        rows={2}
        placeholder={finalPlaceholder}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`agent-textarea w-full bg-black/70 backdrop-blur-sm border ${c.border} ${c.borderFocus} px-4 py-3 rounded-2xl outline-none font-mono text-sm text-white ${c.placeholder} transition-colors resize-none leading-relaxed`}
      />
    </div>
  );
}