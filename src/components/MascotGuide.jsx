// src/components/MascotGuide.jsx (VERSION ASISTENTE IA - FASE 1)

import React, { useState, useEffect } from 'react';

export default function MascotGuide({ step, intent, isSearching, hasModal }) {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // --- CEREBRO DE MENSAJES (Reactividad Táctica) ---
  useEffect(() => {
    let msg = "";
    
    if (step === 0) {
      msg = "¡Bienvenido! Sintoniza tu GPS para ver qué hay cerca o usa el Teletransporte.";
    } else {
      // Estamos en el Nexus (Step 1)
      switch (intent) {
        case 'broshop':
          msg = "En la BroShop puedes comprar con descuento según la fase lunar. ¡Mira los iconos 📦🤝!";
          break;
        case 'lives':
          msg = "Sintoniza frecuencias en vivo. ¡Enviar un Halo de Luz apoya al creador!";
          break;
        case 'game':
          msg = "¡Hora de minar Génesis! Elige un juego y demuestra tu habilidad.";
          break;
        case 'ai':
          msg = "Gemini y yo estamos conectados. Pregúntame lo que necesites sobre el ecosistema.";
          break;
        case 'web_search':
          msg = "Estás en la WebBot. Aquí rastreamos activos digitales en nubes P2P. ¡Cuidado con el Copyright!";
          break;
        default:
          msg = "Navegando en el Nexus... Usa el buscador inferior para filtrar la realidad.";
      }
    }

    // Si hay un modal de pago abierto, el mapache se concentra
    if (hasModal) msg = "Procesando transacción en la Moon Matrix... Verifica bien el precio en Coins.";
    
    // Si el usuario está escribiendo en el buscador
    if (isSearching) msg = "Olfateando la base de datos en busca de coincidencias...";

    setMessage(msg);
    setIsVisible(true);

    // Efecto de parpadeo del mensaje cada vez que cambia
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [step, intent, isSearching, hasModal]);

  return (
    // Se mantiene oculto en móvil por ahora para no tapar tarjetas, pero brilla en PC
    <div className="fixed bottom-0 right-8 z-[100] pointer-events-none hidden md:flex flex-col items-end">
        
        {/* --- BOCADILLO DE TEXTO NEÓN --- */}
        {message && (
            <div className={`
                mb-4 mr-16 max-w-[180px] bg-black/90 backdrop-blur-xl border-2 border-cyan-500/50 
    p-4 rounded-2xl rounded-br-none shadow-[0_0_30px_rgba(34,211,238,0.3)]
                transition-all duration-500 transform
                ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90'}
            `}>
                <p className="text-cyan-400 font-mono text-[10px] leading-tight uppercase tracking-wider">
                    <span className="text-white font-black block mb-1">MAPACHE_AI_LOG:</span>
                    {message}
                </p>
                {/* Triangulito del bocadillo */}
                <div className="absolute -bottom-2 right-0 w-4 h-4 bg-black border-r-2 border-b-2 border-cyan-500/50 rotate-45"></div>
            </div>
        )}

        {/* --- CONTENEDOR IMAGEN --- */}
        <div className={`relative transition-all duration-700 ${step === 0 ? 'w-80 h-80' : 'w-48 h-48'}`}>
            <img 
                src="/mascot.png" 
                className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-bounce-slow" 
                alt="Mascot" 
            />
            {/* Brillo de ojos o efectos extra si quisieras */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <style>{`
            @keyframes bounce-slow {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
            }
            .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        `}</style>
    </div>
  );
}