import React, { useState } from 'react';
import { PACKS_REGALOS, REGLAS_DESCUENTOS } from '../data/MoonMatrix';

const ConversionModal = ({ balances, activePhase, onClose }) => {
  const [activeTab, setActiveTab] = useState('strategy');
  const faseActual = activePhase || 'nova';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>

      <div className="relative w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[700px]">
        
        {/* SIDEBAR */}
        <div className="w-full md:w-1/4 bg-[#111] border-r border-white/5 p-6 flex flex-col">
           <div className="mb-8 text-center">
               <h2 className="text-white font-black italic tracking-widest text-xl">BRO<span className="text-cyan-500">MATRIX</span></h2>
           </div>

           <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 p-6 rounded-2xl mb-6 text-center">
               <p className="text-[10px] text-indigo-300 uppercase tracking-widest">Saldo Génesis</p>
               <div className="text-4xl font-black text-white">{balances?.genesis || 0}</div>
           </div>

           {/* INVENTARIO DINÁMICO */}
           <div className="mb-6">
             <p className="text-[10px] text-cyan-400 uppercase tracking-widest mb-3 font-bold">TU INVENTARIO</p>
             {activeTab === 'strategy' ? (
                <div className="space-y-2">
                    {Object.entries(REGLAS_DESCUENTOS).map(([key, data]) => (
                        <div key={key} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                            <span className={`text-[9px] font-black uppercase ${data.color}`}>{data.label}</span>
                            <span className="text-white font-black text-sm">{balances?.vales?.[key] || 0}</span>
                        </div>
                    ))}
                </div>
             ) : (
                <div className="space-y-2 text-white text-[10px] font-bold uppercase">
                    <div className="flex justify-between p-2 bg-white/5 rounded"><span>HALOS</span><span>{balances?.halos || 0}</span></div>
                    <div className="flex justify-between p-2 bg-white/5 rounded"><span>ECOS</span><span>{balances?.eco || 0}</span></div>
                    <div className="flex justify-between p-2 bg-white/5 rounded"><span>ZAPS</span><span>{balances?.zap || 0}</span></div>
                </div>
             )}
           </div>
           
           <nav className="flex flex-col gap-2 mt-auto">
               <button onClick={() => setActiveTab('strategy')} className={`p-4 rounded-xl text-left text-xs font-bold uppercase transition-all ${activeTab === 'strategy' ? 'bg-white text-black' : 'bg-white/5 text-white'}`}>😎 Estrategia (Vales)</button>
               <button onClick={() => setActiveTab('packs')} className={`p-4 rounded-xl text-left text-xs font-bold uppercase transition-all ${activeTab === 'packs' ? 'bg-purple-600 text-white' : 'bg-white/5 text-white'}`}>🎁 Activos (Regalos)</button>
           </nav>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 p-8 bg-black overflow-y-auto">
           {activeTab === 'strategy' ? (
              <div>
                 <h3 className="text-3xl font-black text-white uppercase mb-8">Canje de Vales (Fase: {faseActual.toUpperCase()})</h3>
                 <div className="grid grid-cols-1 gap-4">
                    {Object.entries(REGLAS_DESCUENTOS).map(([key, data]) => {
                        const isCurrent = key === faseActual;
                        const canAfford = (balances?.genesis || 0) >= data.cost;
                        return (
                            <div key={key} className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${isCurrent ? 'border-cyan-400 bg-cyan-900/10 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-white/10 bg-[#151515] opacity-60'}`}>
                                <div>
                                    <h4 className={`text-3xl font-black uppercase ${data.color}`}>{data.label}</h4>
                                    <div className="text-sm text-yellow-400 font-black mt-2 uppercase tracking-widest">Mínimo: {data.min_items} productos</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white mb-2">{data.pct * 100}% Dcto.</div>
                                    <button disabled={!isCurrent || !canAfford} className={`px-8 py-3 rounded-lg font-black uppercase ${isCurrent && canAfford ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-gray-800 text-gray-500'}`}>
                                        {canAfford ? `CANJEAR ${data.cost} GÉNESIS` : 'INSUFICIENTE'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                 </div>
              </div>
           ) : (
              <div>
                 <div className="bg-[#151515] p-6 rounded-2xl border-2 border-orange-500/50 mb-8 flex justify-between items-center">
                    <div>
                        <h4 className="text-orange-400 font-black uppercase text-xl mb-1">🔥 Conversión Pro</h4>
                        <p className="text-xs text-orange-200 font-bold">150 Ecos → 50 Halos de Luz</p>
                    </div>
                    <button className="px-8 py-4 rounded-lg font-black uppercase bg-orange-500 text-black">QUEMAR 150 ECOS</button>
                 </div>
                 <h3 className="text-3xl font-black text-white uppercase mb-6">Packs de Activos (IN)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(PACKS_REGALOS).map(([key, data]) => (
                        <div key={key} className="bg-gradient-to-br from-purple-900/20 to-black p-6 rounded-2xl border border-purple-500/30">
                            <h4 className="font-black text-white text-xl uppercase tracking-widest mb-1">{data.label}</h4>
                            <div className="text-4xl font-black text-white mb-4">{data.price.toFixed(2)}€</div>
                            <ul className="text-xs text-orange-400 font-bold space-y-1 mb-6 uppercase">
                                <li>📀 {data.halos} Halos de Luz</li>
                                <li>💬 {data.eco} Eco Text</li>
                                <li>⚡ {data.zap} Hyper Zap</li>
                            </ul>
                            <button className="w-full py-3 bg-purple-600 text-white rounded-lg font-black uppercase tracking-widest hover:bg-purple-500">Comprar Pack</button>
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