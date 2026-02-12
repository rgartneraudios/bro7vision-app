import React from 'react';

const RealityTuner = ({ onSelect }) => {

  // CONFIGURACIÓN DE LAS REALIDADES (AQUÍ AÑADES LAS NUEVAS)
  const REALITIES = [
    { 
      id: 'forest', 
      title: 'GÉNESIS FOREST', 
      desc: 'Bioluminiscencia Original', 
      icon: '🌲',
      color: 'text-cyan-400' 
    },
    { 
      id: 'eclipse', 
      title: 'ECLIPSE', 
      desc: 'Sintonía Cinematográfica de Lujo', 
      icon: '🌑',
      color: 'text-yellow-500' 
    },
    { 
      id: 'winter', 
      title: 'WINTER CABIN', 
      desc: 'Calidez, Fuego y Reflexión', 
      icon: '🔥',
      color: 'text-orange-400' 
    },
    { 
      id: 'summer', 
      title: 'SUMMER REEF', 
      desc: 'Inmersión y Frescura Estival', 
      icon: '🌊',
      color: 'text-blue-400' 
    },
    // --- LAS NUEVAS JOYAS ---
    { 
      id: 'space', 
      title: 'CYBER SUITE', 
      desc: 'Atmósfera Neon & Sci-Fi', 
      icon: '🚀',
      color: 'text-fuchsia-500' 
    },
    { 
      id: 'cafe', 
      title: 'NEXUS CAFÉ', 
      desc: 'Lluvia, Vlogs y Relax', 
      icon: '☕',
      color: 'text-amber-200' 
    }
  ];

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fadeIn">
      
      {/* CABECERA */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black tracking-[0.5em] text-white mb-2">
            BRO<span className="text-cyan-400">7</span>VISION
        </h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">SINTONIZA TU FRECUENCIA DE NAVEGACIÓN</p>
      </div>

      {/* GRID DE REALIDADES (3 COLUMNAS EN PC, 1 EN MÓVIL) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl px-8">
        
        {REALITIES.map((mode, index) => (
            <button 
                key={mode.id}
                onClick={() => onSelect(mode.id)}
                className="group relative bg-[#080808] border border-white/5 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            >
                {/* Efecto Hover Sutil */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-white to-transparent transition-opacity`}></div>

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="flex justify-between w-full mb-4">
                        <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all">{mode.icon}</span>
                        <span className={`text-[9px] font-black uppercase ${mode.color}`}>MODO 0{index + 1}</span>
                    </div>
                    
                    <h3 className="text-xl font-black text-white italic tracking-tighter mb-1 group-hover:text-cyan-400 transition-colors">
                        {mode.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono">
                        {mode.desc}
                    </p>
                </div>
            </button>
        ))}

      </div>

      {/* FOOTER */}
      <div className="mt-12 opacity-50 text-[9px] text-gray-600 font-mono">
          SELECCIONA ENTORNO PARA INICIAR MOTOR DE VIDEO
      </div>

    </div>
  );
};

export default RealityTuner;