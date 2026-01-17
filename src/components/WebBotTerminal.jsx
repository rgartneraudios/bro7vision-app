// src/components/WebBotTerminal.jsx
import React from 'react';

const WebBotTerminal = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 animate-fadeIn bg-black/80 backdrop-blur-sm">
        <div className="bg-black border border-blue-500/50 p-8 rounded-xl text-center shadow-[0_0_50px_rgba(59,130,246,0.3)] max-w-md">
            <div className="text-4xl mb-4">🌐</div>
            <h2 className="text-2xl font-black text-blue-400 mb-2">WEB BOT P2P</h2>
            <p className="text-white font-mono text-sm mb-6">
                Intercambio descentralizado de archivos culturales.
            </p>
            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded">
                <p className="text-xs text-blue-300 font-bold animate-pulse">
                    🔒 SISTEMA BLOQUEADO EN FASE GÉNESIS
                </p>
                <p className="text-[10px] text-gray-400 mt-2">
                    Disponible en Fase 1 (Nova). Acumula Génesis para obtener ancho de banda prioritario.
                </p>
            </div>
        </div>
    </div>
  );
};

export default WebBotTerminal;