import React from 'react';

const BoosterModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-black border border-orange-500/30 rounded-lg shadow-[0_0_100px_rgba(249,115,22,0.2)] overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Header Industrial */}
        <div className="flex justify-between items-center p-6 border-b border-orange-500/20 bg-orange-900/10">
            <div className="flex flex-col">
                <h2 className="text-2xl font-black text-orange-500 tracking-tighter uppercase">Booster Studio</h2>
                <p className="text-xs text-orange-300/70 font-mono">PROFESSIONAL ACCESS ONLY // VERIFIED ID REQUIRED</p>
            </div>
            <button onClick={onClose} className="text-orange-500 hover:text-white border border-orange-500/50 px-4 py-1 rounded hover:bg-orange-500/20 transition-all">ESC</button>
        </div>

        {/* Body: Los dos grandes motores */}
        <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. BRO-DROPS (Logística & Campo) */}
            <div className="group border border-white/10 p-6 rounded-xl hover:border-orange-500 transition-all cursor-pointer bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">🚛</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400">BRO-DROPS LOGISTICS</h3>
                <p className="text-sm text-gray-400 mb-6">Gestión de cargas, rutas de camiones y "Tetris" de palets. Conecta origen con nodos urbanos.</p>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-gray-500 border-b border-white/5 pb-1">
                        <span>ACTIVE ROUTES</span>
                        <span className="text-green-500">12 LIVE</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono text-gray-500 border-b border-white/5 pb-1">
                        <span>OPEN SLOTS</span>
                        <span className="text-orange-500">85 PALETS</span>
                    </div>
                </div>
                <button className="mt-6 w-full py-2 bg-white/5 hover:bg-orange-600 text-orange-500 hover:text-white font-bold uppercase text-xs tracking-widest transition-all rounded">
                    Gestionar Cargas
                </button>
            </div>

            {/* 2. BRO-CLUSTERS (Servicios & Agrupación) */}
            <div className="group border border-white/10 p-6 rounded-xl hover:border-cyan-500 transition-all cursor-pointer bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">🏘️</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400">BRO-CLUSTERS</h3>
                <p className="text-sm text-gray-400 mb-6">Ofertas de servicios agrupados. Lanza rondas vecinales para radiación, plagas o reformas.</p>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-gray-500 border-b border-white/5 pb-1">
                        <span>PENDING CLUSTERS</span>
                        <span className="text-cyan-500">34 ZONES</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono text-gray-500 border-b border-white/5 pb-1">
                        <span>NEIGHBORS JOINED</span>
                        <span className="text-white">1,204 USERS</span>
                    </div>
                </div>
                <button className="mt-6 w-full py-2 bg-white/5 hover:bg-cyan-600 text-cyan-500 hover:text-white font-bold uppercase text-xs tracking-widest transition-all rounded">
                    Lanzar Ronda
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default BoosterModal;