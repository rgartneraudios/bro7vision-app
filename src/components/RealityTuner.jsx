// src/components/RealityTuner.jsx

import React from 'react';

const CANAL_IMAGES = {
  'moon': '/emojis/canal-luna.webp',
  'solo_o169': '/emojis/canal-tierra.webp',
  'solo_fantasy': '/emojis/canal-jupiter.webp',
  'solo_e169': '/emojis/canal-marte.webp',
  'oeste169': '/emojis/canal-saturno.webp',
  'band_fantasy': '/emojis/canal-urano.webp',
  'este169': '/emojis/canal-neptuno.webp',
  'este': '/emojis/canal-venus.webp',
  'oeste': '/emojis/canal-mercurio.webp',
};

const RealityTuner = ({ onSelect }) => {

  const REALITIES = [
    // EL ESTADO BASE / NEUTRAL
{ id: 'moon', title: 'CANAL LUNA', desc: 'Sincronicidad con la Fase Luna', color: 'border-cyan-900/20', text: 'text-cyan-300', glow: 'shadow-gray-400/30', group: 'NEUTRAL' },

    // GRUPO SOLO
    { id: 'solo_o169', title: 'CANAL TIERRA', desc: 'Sincronía Vital Horizontal', color: 'border-cyan-900/20', text: 'text-cyan-300', glow: 'shadow-blue-700/30', group: 'SOLO' },
    { id: 'solo_fantasy', title: 'CANAL JÚPITER', desc: 'Exploración Estelar', color: 'border-cyan-900/20',    text: 'text-cyan-300',    glow: 'shadow-violet-700/30', group: 'SOLO' },
    { id: 'solo_e169', title: 'CANAL MARTE', desc: 'Viajero del Tiempo Horizontal', color: 'border-cyan-900/20', text: 'text-cyan-300', glow: 'shadow-orange-700/30', group: 'SOLO' },

    // GRUPO BAND
    { id: 'oeste169',     title: 'CANAL SATURNO',   desc: 'Nexo Ciudadano', color: 'border-cyan-900/20',    text: 'text-cyan-300',    glow: 'shadow-green-300/30',    group: 'BAND' },
    { id: 'band_fantasy', title: 'CANAL URANO', desc: 'Alien Lounge', color: 'border-cyan-900/20', text: 'text-cyan-300', glow: 'shadow-pink-700/30', group: 'BAND' },
    { id: 'este169',      title: 'CANAL NEPTUNO', desc: 'El Ágora', color: 'border-cyan-900/20',  text: 'text-cyan-300',  glow: 'shadow-yellow-500/30',  group: 'BAND' },

    // GRUPO ESPACIO — nuevos canales ESTE y OESTE
    { id: 'este',  title: 'CANAL VENUS',  desc: 'Horizonte Levante', color: 'border-cyan-900/20', text: 'text-cyan-300',    glow: 'shadow-cyan-700/30',    group: 'ESPACIO' },
    { id: 'oeste', title: 'CANAL MERCURIO', desc: 'Horizonte Poniente', color: 'border-cyan-900/20', text: 'text-cyan-300', glow: 'shadow-fuchsia-700/30', group: 'ESPACIO' },
  ];

  const renderCard = (mode) => (
  <button 
    key={mode.id}
    onClick={() => onSelect(mode.id)}
    className={`group relative bg-black/55 backdrop-blur-[8px] border-2 ${mode.color} rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] hover:bg-black/20 shadow-xl ${mode.glow} w-full h-full`}
  >
    <div className="flex items-center gap-4 w-full h-full">
      <img
        src={CANAL_IMAGES[mode.id]}
        alt={mode.title}
        className="w-16 h-16 object-contain shrink-0 drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]"
      />
      <div className="flex flex-col items-center text-center min-w-0 flex-1">
        <h3 className="text-xl font-black text-white italic tracking-tighter mb-1 uppercase group-hover:text-white transition-colors" style={{textShadow: '0 1px 6px rgba(0,0,0,0.8)'}}>
          {mode.title}
        </h3>
        <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest opacity-80">
          {mode.desc}
        </p>
      </div>
    </div>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-t from-white to-transparent transition-opacity rounded-2xl"></div>
  </button>
);
 return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fadeIn overflow-y-auto">
        
        {/* FONDO: VIDEO DEEP SPACE TRASLADADO AQUÍ */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        >
          <source src="https://media.bro7vision.com/entrada_nova.mp4" type="video/mp4" />
        </video>
              
      {/* TITULO SUPERIOR */}
      <div className="text-center mb-8">
        <h2 className="text-5xl md:text-6xl font-black tracking-[0.5em] text-white">
            BRO<span className="text-cyan-400">7</span>VISION
        </h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mt-3 font-bold opacity-60">SINTONIZA TU FRECUENCIA DE REALIDAD</p>

      </div>

      <div className="w-full max-w-6xl space-y-10">
        
        {/* NIVEL 1: MOON (LA BASE) */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
  
  <div className="w-full">
    {renderCard(REALITIES.find(r => r.id === 'oeste'))}
  </div>

  <div className="w-full">
    {renderCard(REALITIES.find(r => r.id === 'moon'))}
  </div>

  <div className="w-full">
    {renderCard(REALITIES.find(r => r.id === 'este'))}
  </div>

</div>

        {/* NIVEL 2: MODOS SOLO */}
        <div className="space-y-4">
            <div className="flex items-center gap-4 opacity-40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-emerald-500"></div>
                <p className="text-[9px] text-emerald-500 font-black tracking-[0.5em]">CONTIGO MISMO (SOLO)</p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-emerald-500"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {REALITIES.filter(r => r.group === 'SOLO').map(mode => renderCard(mode))}
            </div>
        </div>

        {/* NIVEL 3: MODOS BAND */}
        <div className="space-y-4">
            <div className="flex items-center gap-4 opacity-40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-blue-500"></div>
                <p className="text-[9px] text-blue-500 font-black tracking-[0.5em]">EN COMPAÑÍA (BAND)</p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-blue-500"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {REALITIES.filter(r => r.group === 'BAND').map(mode => renderCard(mode))}
            </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-12 text-center">
          <p className="text-[8px] text-gray-600 font-mono tracking-[0.3em] uppercase animate-pulse">
            Sincronía Circadiana v1.0 | Motor de Video Activo
          </p>
      </div>

    </div>
  );
};

export default RealityTuner;