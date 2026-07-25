// src/components/RealityTuner.jsx

import React from 'react';

const CANAL_IMAGES = {
  'luna':      '/emojis/canal-luna.webp',
  'tierra':    '/emojis/canal-tierra.webp',
  'jupiter':   '/emojis/canal-jupiter.webp',
  'marte':     '/emojis/canal-marte.webp',
  'saturno':   '/emojis/canal-saturno.webp',
  'urano':     '/emojis/canal-urano.webp',
  'neptuno':   '/emojis/canal-neptuno.webp',
  'venus':     '/emojis/canal-venus.webp',
  'mercurio':  '/emojis/canal-mercurio.webp',
};

const RealityTuner = ({ onSelect }) => {

  const REALITIES = [
    // EL ESTADO BASE / NEUTRAL
{ id: 'luna', title: 'CANAL LUNA', desc: 'Sincronicidad con la Fase Luna', color: 'border-cyan-900/20', text: 'text-cyan-300', glow: 'shadow-gray-400/30', group: 'NEUTRAL' },

    // GRUPO SOLO
    { id: 'tierra', title: 'CANAL TIERRA', desc: 'Sincronía Vital Horizontal', color: 'border-cyan-900/20', text: 'text-cyan-300', glow: 'shadow-blue-700/30', group: 'SOLO' },
    { id: 'jupiter', title: 'CANAL JÚPITER', desc: 'Exploración Estelar', color: 'border-cyan-900/20',    text: 'text-cyan-300',    glow: 'shadow-violet-700/30', group: 'SOLO' },
    { id: 'marte', title: 'CANAL MARTE', desc: 'Viajero del Tiempo Horizontal', color: 'border-cyan-900/20', text: 'text-cyan-300', glow: 'shadow-orange-700/30', group: 'SOLO' },

    // GRUPO BAND
    { id: 'saturno',     title: 'CANAL SATURNO',   desc: 'Nexo Ciudadano', color: 'border-cyan-900/20',    text: 'text-cyan-300',    glow: 'shadow-green-300/30',    group: 'BAND' },
    { id: 'urano', title: 'CANAL URANO', desc: 'Alien Lounge', color: 'border-cyan-900/20', text: 'text-cyan-300', glow: 'shadow-pink-700/30', group: 'BAND' },
    { id: 'neptuno',      title: 'CANAL NEPTUNO', desc: 'El Ágora', color: 'border-cyan-900/20',  text: 'text-cyan-300',  glow: 'shadow-yellow-500/30',  group: 'BAND' },

    // GRUPO ESPACIO — nuevos canales ESTE y OESTE
    { id: 'venus',  title: 'CANAL VENUS',  desc: 'Horizonte Levante', color: 'border-cyan-900/20', text: 'text-cyan-300',    glow: 'shadow-cyan-700/30',    group: 'ESPACIO' },
    { id: 'mercurio', title: 'CANAL MERCURIO', desc: 'Horizonte Poniente', color: 'border-cyan-900/20', text: 'text-cyan-300', glow: 'shadow-fuchsia-700/30', group: 'ESPACIO' },
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
    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fadeIn overflow-y-auto pb-16">
        
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
              
      <div className="relative z-10 w-full flex flex-col items-center">
              
      {/* TITULO SUPERIOR */}
      <div className="text-center mb-8">
        <h2 className="text-5xl md:text-6xl font-black tracking-[0.5em] text-white">
            BRO<span className="text-cyan-400">7</span>VISION
        </h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mt-3 font-bold opacity-60">SINTONIZA TU CANAL FAVORITO</p>

      </div>

      <div className="w-full max-w-6xl space-y-10">
        
        {/* NIVEL 1: MOON (LA BASE) */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
  
  <div className="w-full">
    {renderCard(REALITIES.find(r => r.id === 'mercurio'))}
  </div>

  <div className="w-full">
    {renderCard(REALITIES.find(r => r.id === 'luna'))}
  </div>

  <div className="w-full">
    {renderCard(REALITIES.find(r => r.id === 'venus'))}
  </div>

</div>

        {/* NIVEL 2: MODOS SOLO */}
        <div className="space-y-4">
            <div className="flex items-center gap-4 opacity-40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-emerald-500"></div>
                <p className="text-[9px] text-emerald-500 font-black tracking-[0.5em]"></p>
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
                <p className="text-[9px] text-blue-500 font-black tracking-[0.5em]"></p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-blue-500"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {REALITIES.filter(r => r.group === 'BAND').map(mode => renderCard(mode))}
            </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-8 text-center shrink-0 relative z-10">
          <p className="text-base text-white font-mono tracking-wide px-4">
            Puedes repetir las partidas las veces que quieras — las Lunas solo se suman en la primera partida de cada turno.
          </p>
      </div>

      </div>
    </div>
  );
};

export default RealityTuner;