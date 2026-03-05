import React, { useState } from 'react';
// IMPORTANTE: Importamos las nuevas estructuras limpias
import { PACKS_REGALOS, REGLAS_DESCUENTOS } from '../data/MoonMatrix';

const ConversionModal = ({ balances, activePhase, onClose }) => {
  const [activeTab, setActiveTab] = useState('strategy'); // 'strategy' | 'packs'
  
  // Mapeo visual de fases para la tabla
  const FASES_MAP = {
      nova: { label: 'NOVA', color: 'fuchsia' },
      crescens: { label: 'CRESCENS', color: 'green' },
      plena: { label: 'PLENA', color: 'yellow' },
      decrescens: { label: 'DECRESCENS', color: 'orange' }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>

      <div className="relative w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(232,121,249,0.1)] flex flex-col md:flex-row h-[700px]">
        
        {/* SIDEBAR */}
        <div className="w-full md:w-1/4 bg-[#111] border-r border-white/5 p-6 flex flex-col">
           <div className="mb-8 text-center">
              <h2 className="text-white font-black italic tracking-widest text-xl">BRO<span className="text-cyan-500">MATRIX</span></h2>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Ecosistema de Lealtad</p>
           </div>

           <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 p-6 rounded-2xl mb-6 text-center">
               <p className="text-[10px] text-indigo-300 uppercase tracking-widest mb-2">Tu Saldo Génesis</p>
               <div className="text-4xl font-black text-white">{balances.genesis || 0}</div>
           </div>
           
           <nav className="flex flex-col gap-2 mt-auto">
               <button onClick={() => setActiveTab('strategy')} className="p-4 rounded-xl text-left text-xs font-bold uppercase bg-white/5 hover:bg-white/10 transition-all">🧠 Estrategia (Vales)</button>
               <button onClick={() => setActiveTab('packs')} className="p-4 rounded-xl text-left text-xs font-bold uppercase bg-white/5 hover:bg-white/10 transition-all">🎁 Activos (Regalos)</button>
           </nav>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 p-8 bg-black overflow-y-auto">
           {activeTab === 'strategy' ? (
              <div>
                 <h3 className="text-3xl font-black text-white uppercase mb-6">Reglas de Vales (OUT)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(REGLAS_DESCUENTOS).map(([key, data]) => (
                        <div key={key} className="bg-[#151515] p-5 rounded-2xl border border-white/10">
                            <h4 className={`font-bold ${data.color} mb-2`}>{data.label}</h4>
                            <p className="text-xs text-gray-400">Descuento: {data.pct * 100}%</p>
                            <p className="text-xs text-gray-400">Condición: Mínimo {data.min_items} productos</p>
                        </div>
                    ))}
                 </div>
              </div>
           ) : (
              <div>
                 <h3 className="text-3xl font-black text-white uppercase mb-6">Packs de Activos (IN)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(PACKS_REGALOS).map(([key, data]) => (
                        <div key={key} className="bg-gradient-to-br from-purple-900/20 to-black p-5 rounded-2xl border border-purple-500/30">
                            <h4 className="font-bold text-white mb-2">{data.label}</h4>
                            <div className="text-2xl font-black text-white mb-4">{data.price}€</div>
                            <p className="text-[10px] text-gray-400 uppercase">Incluye: {data.halos} Halos, {data.eco} EcoText, {data.zap} Zaps</p>
                        </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ConversionModal;