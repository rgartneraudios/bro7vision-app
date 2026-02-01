// src/components/RealityTuner.jsx
import React from 'react';

const RealityTuner = ({ onSelect }) => {
  const modes = [
    { id: 'forest', name: 'GÉNESIS FOREST', desc: 'Bioluminiscencia Original', icon: '🌲', color: 'text-cyan-400' },
    { id: 'blackhole', name: 'ECLIPSE', desc: 'Foco Total / Lujo Zenith', icon: '🌑', color: 'text-yellow-500' },
    { id: 'winter', name: 'WINTER CABIN', desc: 'Calidez y Reflexión', icon: '🔥', color: 'text-orange-400' },
    { id: 'summer', name: 'SUMMER REEF', desc: 'Inmersión y Calma', icon: '🌊', color: 'text-blue-400' },
  ];

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 animate-fadeIn">
        <h1 className="text-white font-black text-3xl tracking-[0.5em] mb-2">BRO7VISION</h1>
        <p className="text-gray-500 text-xs tracking-widest uppercase">Sintoniza tu Frecuencia de Navegación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {modes.map((m) => (
          <button 
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="group relative overflow-hidden border border-white/10 p-8 rounded-[2rem] bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all hover:scale-105"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">{m.icon}</span>
              <span className={`text-[10px] font-black uppercase ${m.color}`}>Modo 0{modes.indexOf(m)+1}</span>
            </div>
            <h3 className="text-white font-black text-xl mb-1 uppercase tracking-tighter">{m.name}</h3>
            <p className="text-gray-500 text-xs italic">{m.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RealityTuner;