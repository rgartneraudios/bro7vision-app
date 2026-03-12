import React, { useState } from 'react';
import { PACKS_REGALOS, REGLAS_DESCUENTOS } from '../data/MoonMatrix';

const ConversionModal = ({ balances, activePhase, onClose }) => {
  const [activeTab, setActiveTab] = useState('strategy');
  const faseActual = activePhase || 'nova';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>

      {/* CONTENEDOR PRINCIPAL: Más compacto en PC, adaptado a móvil */}
      <div className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[720px]">
        
        {/* SIDEBAR */}
        <div className="w-full md:w-[280px] flex-shrink-0 bg-[#111] border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-6 flex flex-col overflow-y-auto md:overflow-hidden">
           <div className="mb-4 md:mb-6 text-center">
               <h2 className="text-white font-black italic tracking-widest text-lg md:text-xl">BRO<span className="text-cyan-500">MATRIX</span></h2>
           </div>

           <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 p-4 rounded-2xl mb-4 md:mb-6 text-center shadow-inner">
               <p className="text-[9px] md:text-[10px] text-indigo-300 uppercase tracking-widest mb-1">Saldo Génesis</p>
               <div className="text-3xl md:text-4xl font-black text-white">{balances?.genesis || 0}</div>
           </div>

           {/* INVENTARIO DINÁMICO */}
           <div className="mb-4 md:mb-6">
             <p className="text-[9px] md:text-[10px] text-cyan-400 uppercase tracking-widest mb-2 font-bold">TU INVENTARIO</p>
             {activeTab === 'strategy' ? (
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                    {Object.entries(REGLAS_DESCUENTOS).map(([key, data]) => (
                        <div key={key} className="flex justify-between items-center bg-white/5 p-2 md:p-3 rounded-lg border border-white/5">
                            <span className={`text-[8px] md:text-[9px] font-black uppercase ${data.color}`}>{data.label}</span>
                            <span className="text-white font-black text-xs md:text-sm">{balances?.vales?.[key] || 0}</span>
                        </div>
                    ))}
                </div>
             ) : (
                <div className="space-y-2 text-white text-[9px] md:text-[10px] font-bold uppercase">
                    <div className="flex justify-between p-2 md:p-2.5 bg-white/5 rounded-lg border border-white/5"><span>HALOS</span><span className="text-yellow-400">{balances?.halos || 0}</span></div>
                    <div className="flex justify-between p-2 md:p-2.5 bg-white/5 rounded-lg border border-white/5"><span>ECOS</span><span className="text-orange-400">{balances?.eco || 0}</span></div>
                    <div className="flex justify-between p-2 md:p-2.5 bg-white/5 rounded-lg border border-white/5"><span>ZAPS</span><span className="text-pink-400">{balances?.zap || 0}</span></div>
                </div>
             )}
           </div>
           
           <nav className="flex flex-row md:flex-col gap-2 mt-auto">
               <button onClick={() => setActiveTab('strategy')} className={`flex-1 p-3 md:p-4 rounded-xl text-center md:text-left text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'strategy' ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>😎 Vales</button>
               <button onClick={() => setActiveTab('packs')} className={`flex-1 p-3 md:p-4 rounded-xl text-center md:text-left text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'packs' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>🎁 Activos</button>
           </nav>
        </div>

        {/* CONTENIDO DERECHO (Scrollable independientemente) */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 bg-black overflow-y-auto">
           {activeTab === 'strategy' ? (
              <div className="h-full flex flex-col">
                 <h3 className="text-xl md:text-2xl font-black text-white uppercase mb-4 md:mb-6">Canje de Vales <span className="text-cyan-500">(Fase: {faseActual.toUpperCase()})</span></h3>
                 <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {Object.entries(REGLAS_DESCUENTOS).map(([key, data]) => {
                        const isCurrent = key === faseActual;
                        const canAfford = (balances?.genesis || 0) >= data.cost;
                        return (
                            <div key={key} className={`p-4 md:p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${isCurrent ? 'border-cyan-400 bg-cyan-900/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-white/5 bg-[#121212] opacity-50'}`}>
                                <div>
                                    <h4 className={`text-lg md:text-2xl font-black uppercase ${data.color}`}>{data.label}</h4>
                                    <div className="text-[9px] md:text-[10px] text-yellow-400 font-black mt-1 uppercase tracking-widest">Mínimo: {data.min_items} productos</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl md:text-2xl font-black text-white mb-2">{data.pct * 100}% Dcto.</div>
                                    <button disabled={!isCurrent || !canAfford} className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-colors ${isCurrent && canAfford ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-gray-800 text-gray-500'}`}>
                                        {canAfford ? `CANJEAR ${data.cost} GÉNESIS` : 'INSUFICIENTE'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                 </div>
              </div>
           ) : (
              <div className="h-full flex flex-col">
                 
                 {/* ZONA DE QUEMA (GRID DE 2 COLUMNAS) */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
                     {/* QUEMA DE ECOS */}
                     <div className="bg-[#151515] p-4 md:p-5 rounded-2xl border border-orange-500/30 flex flex-col justify-between">
                        <div className="mb-3">
                            <h4 className="text-orange-400 font-black uppercase text-sm md:text-base mb-1">🔥 Quema de Ecos</h4>
                            <p className="text-[10px] md:text-xs text-orange-200/70 font-bold uppercase tracking-wider">180 Ecos → 50 Halos</p>
                        </div>
                        <button className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-widest bg-orange-500 text-black hover:bg-orange-400 transition-colors">QUEMAR 180 ECOS</button>
                     </div>

                     {/* QUEMA DE ZAPS */}
                     <div className="bg-[#151515] p-4 md:p-5 rounded-2xl border border-pink-500/30 flex flex-col justify-between">
                        <div className="mb-3">
                            <h4 className="text-pink-400 font-black uppercase text-sm md:text-base mb-1">⚡ Quema de Zaps</h4>
                            <p className="text-[10px] md:text-xs text-pink-200/70 font-bold uppercase tracking-wider">70 Zaps → 50 Halos</p>
                        </div>
                        <button className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-widest bg-pink-600 text-white hover:bg-pink-500 transition-colors">QUEMAR 70 ZAPS</button>
                     </div>
                 </div>

                 <h3 className="text-xl md:text-2xl font-black text-white uppercase mb-4 md:mb-6">Packs de Activos <span className="text-purple-500">(IN)</span></h3>
                 
                 {/* GRID DE PACKS (CONTENIDO ALINEADO A LA DERECHA) */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(PACKS_REGALOS).map(([key, data]) => (
                        <div key={key} className="bg-gradient-to-br from-purple-900/20 to-black p-4 md:p-5 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-colors flex flex-col justify-between">
                            <div>
                               <h4 className="font-black text-white/90 text-sm md:text-base uppercase tracking-widest mb-2 md:mb-3">{data.label}</h4>
                               
                               {/* PRECIO A LA IZQUIERDA, ITEMS A LA DERECHA */}
                               <div className="flex items-center justify-between mb-4 md:mb-5">
                                   <div className="text-3xl md:text-4xl font-black text-white">{data.price.toFixed(2)}€</div>
                                   <ul className="text-[9px] md:text-[10px] text-gray-300 font-bold space-y-1.5 uppercase tracking-wider text-right">
                                       <li className="text-yellow-400">📀 {data.halos} Halos</li>
                                       <li className="text-orange-400">💬 {data.eco} Eco Text</li>
                                       <li className="text-pink-400">⚡ {data.zap} Hyper Zap</li>
                                   </ul>
                               </div>
                            </div>
                            <button className="w-full py-3 bg-purple-600/90 text-white rounded-lg text-xs md:text-sm font-black uppercase tracking-widest hover:bg-purple-500 shadow-lg shadow-purple-900/50 transition-all">Comprar Pack</button>
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