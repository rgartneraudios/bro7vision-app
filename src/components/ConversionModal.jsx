import React, { useState } from 'react';
import { PACKS_REGALOS } from '../data/MoonMatrix';
import { supabase } from '../supabaseClient';

const ConversionModal = ({ balances, setBalances, session, activePhase, onClose }) => {
  const[activeTab, setActiveTab] = useState('strategy');

  const handleBuyGen = async (type) => {
    const cost = type === 'eco' ? 100 : 1000;
    const col = type === 'eco' ? 'eco_gen' : 'zap_gen';

    if ((balances?.genesis || 0) < cost) {
      alert(`NECESITAS ${cost} GÉNESIS`);
      return;
    }

    const newGenesis = balances.genesis - cost;
    const newCol = (balances[col] || 0) + 1;

    setBalances(prev => ({ ...prev, genesis: newGenesis, [col]: newCol }));
    await supabase.from('profiles')
      .update({ genesis: newGenesis, [col]: newCol })
      .eq('id', session.user.id);
  };
   
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fadeIn">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>

      {/* ESTILOS SCROLL BIOLUMINISCENTE */}
      <style>{`
        .bioluminescent-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .bioluminescent-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        .bioluminescent-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #3b82f6);
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .bioluminescent-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #22d3ee, #60a5fa);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
        }
        .bioluminescent-scroll::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, #22d3ee, #3b82f6);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.7), 0 0 30px rgba(59, 130, 246, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* CONTENEDOR PRINCIPAL FULL SCREEN */}
      <div className="relative w-full h-full bg-[#0a0a0a] border-0 overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* BOTÓN CIERRE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl font-black transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>
        
        {/* ================= SIDEBAR (IZQUIERDA) ================= */}
        <div className="w-full md:w-[280px] flex-shrink-0 bg-[#111] border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-6 flex flex-col overflow-y-auto md:overflow-hidden bioluminescent-scroll">
            <div className="mb-4 md:mb-6 text-center">
                <h2 className="text-white font-black italic tracking-widest text-2xl md:text-3xl">BRO<span className="text-cyan-500">MATRIX</span></h2>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 p-4 rounded-2xl mb-4 md:mb-6 text-center shadow-inner">
                <p className="text-xs md:text-sm text-indigo-300 uppercase tracking-widest mb-1">Saldo Génesis</p>
                 <div className="text-3xl md:text-4xl font-black text-white">{balances?.genesis || 0}</div>
            </div>

             {/* INVENTARIO DINÁMICO */}
             <div className="mb-4 md:mb-6 flex-1 overflow-y-auto pr-1 bioluminescent-scroll">
              <p className="text-xs md:text-sm text-cyan-400 uppercase tracking-widest mb-3 font-bold">TU INVENTARIO</p>
              
              {activeTab === 'strategy' ? (
                 <div className="space-y-4">
                     {/* INVENTARIO ACTIVOS GEN */}
                     <div className="space-y-2 border-t border-white/10 pt-3 text-white text-xs md:text-sm font-bold uppercase">
                        <p className="text-cyan-500/80 mb-2 tracking-widest text-[10px]">ACTIVOS GÉNESIS</p>
                        <div className="flex justify-between p-2 bg-white/5 rounded-lg border border-white/5"><span>HALOS (GEN)</span><span className="text-yellow-400">{balances?.halos_gen || 0}</span></div>
                        <div className="flex justify-between p-2 bg-white/5 rounded-lg border border-white/5"><span>ECOS (GEN)</span><span className="text-orange-400">{balances?.eco_gen || 0}</span></div>
                        <div className="flex justify-between p-2 bg-white/5 rounded-lg border border-white/5"><span>ZAPS (GEN)</span><span className="text-pink-400">{balances?.zap_gen || 0}</span></div>
                    </div>
                </div>
             ) : (
                /* INVENTARIO ACTIVOS PREMIUM / IA */
                <div className="space-y-4 text-white text-xs md:text-sm font-bold uppercase">
                    <div>
                        <p className="text-purple-500/80 mb-2 tracking-widest text-[10px]">ACTIVOS PREMIUM (FIAT)</p>
                        <div className="flex justify-between p-2.5 bg-purple-900/10 rounded-lg border border-purple-500/20 mb-2"><span>HALOS (P)</span><span className="text-yellow-400">{balances?.halos_p || 0}</span></div>
                        <div className="flex justify-between p-2.5 bg-purple-900/10 rounded-lg border border-purple-500/20 mb-2"><span>ECOS (P)</span><span className="text-orange-400">{balances?.eco_p || 0}</span></div>
                        <div className="flex justify-between p-2.5 bg-purple-900/10 rounded-lg border border-purple-500/20"><span>ZAPS (P)</span><span className="text-pink-400">{balances?.zap_p || 0}</span></div>
                    </div>

                    {/* MOSTRAR TOKENS IA SI EXISTEN EN EL BALANCE */}
                    <div className="border-t border-white/10 pt-3">
                        <p className="text-blue-500/80 mb-2 tracking-widest text-[10px]">SALDO INTELIGENCIA ARTIFICIAL</p>
                        <div className="flex justify-between p-2.5 bg-blue-800/10 rounded-lg border border-blue-400/20">
                            <span className="text-blue-300">TOKENS IA</span>
                            <span className="text-white">{balances?.ai_tokens?.toLocaleString() || 0}</span>
                        </div>
                    </div>
                </div>
             )}
           </div>
           
           {/* BOTONES NAVEGACIÓN SIDEBAR */}
           <nav className="grid grid-cols-3 md:flex md:flex-col gap-2 mt-auto">
                <button onClick={() => setActiveTab('strategy')} className={`flex-1 p-2 md:p-3 rounded-xl flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'strategy' ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                    <span className="text-base">😎</span> <span className="hidden md:inline">Gen</span>
                </button>
               <button onClick={() => setActiveTab('packs')} className={`flex-1 p-2 md:p-3 rounded-xl flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'packs' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                   <span className="text-base">🎁</span> <span className="hidden md:inline">Packs (FIAT)</span>
               </button>
               <button onClick={() => setActiveTab('ai')} className={`flex-1 p-2 md:p-3 rounded-xl flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'ai' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                   <span className="text-base">🤖</span> <span className="hidden md:inline">Prepago IA</span>
               </button>
           </nav>
        </div>

        {/* ================= CONTENIDO DERECHO ================= */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 bg-black overflow-y-auto bioluminescent-scroll">
           
           {/* ---------------- PESTAÑA 1: ESTRATEGIA (VALES + GEN) ---------------- */}
            {activeTab === 'strategy' && (
               <div className="h-full flex flex-col animate-fadeIn">
                  
                  {/* SECCIÓN ACTIVOS GEN */}
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase mb-4 border-t border-white/10 pt-6">
                     Activos Digitales <span className="text-cyan-500">(Gasto Génesis)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {/* ECO GEN */}
                     <div className="bg-[#151515] p-4 rounded-2xl border border-orange-500/30 flex flex-col justify-between">
                        <div className="mb-3">
                            <h4 className="text-orange-400 font-black uppercase text-base mb-1">💬 Eco Text (GEN)</h4>
                            <p className="text-xs md:text-sm text-gray-400">Comentario verificado.</p>
                        </div>
                        <div className="mt-auto">
                            <div className="text-2xl font-black text-white mb-2">100 G</div>
                            <button disabled={(balances?.genesis || 0) < 100} onClick={() => handleBuyGen('eco')} className="w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-orange-600/20 text-orange-400 border border-orange-500/50 hover:bg-orange-600 hover:text-white transition-colors disabled:opacity-50">COMPRAR ECO GEN</button>
                        </div>
                     </div>

                     {/* ZAP GEN */}
                     <div className="bg-[#151515] p-4 rounded-2xl border border-pink-500/30 flex flex-col justify-between">
                        <div className="mb-3">
                            <h4 className="text-pink-400 font-black uppercase text-base mb-1">⚡ Hyper Zap (GEN)</h4>
                            <p className="text-xs md:text-sm text-gray-400">Destaca tu perfil.</p>
                        </div>
                        <div className="mt-auto">
                            <div className="text-2xl font-black text-white mb-2">1000 G</div>
                            <button disabled={(balances?.genesis || 0) < 1000} onClick={() => handleBuyGen('zap')} className="w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-pink-600/20 text-pink-400 border border-pink-500/50 hover:bg-pink-600 hover:text-white transition-colors disabled:opacity-50">COMPRAR ZAP GEN</button>                       			
                        </div>
                     </div>

                     {/* HALO GEN (BLOQUEADO) */}
                     <div className="bg-[#111] p-4 rounded-2xl border border-yellow-500/10 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                            <span className="text-3xl mb-1">🔒</span>
                            <span className="text-xs font-black text-yellow-500 uppercase tracking-widest bg-black/80 px-2 py-1 rounded border border-yellow-500/30">Fase 2</span>
                        </div>
                        <div className="mb-3 opacity-50">
                            <h4 className="text-yellow-400 font-black uppercase text-base mb-1">📀 Halo Luz (GEN)</h4>
                            <p className="text-xs md:text-sm text-gray-400">Regalo (10% Retorno).</p>
                        </div>
                        <div className="mt-auto opacity-50">
                            <div className="text-2xl font-black text-white mb-2">100 G</div>
                            <button disabled className="w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-gray-800 text-gray-500">REQUERIDO FASE 2</button>
                        </div>
                     </div>
                  </div>

                </div>
             )}

            {/* ---------------- PESTAÑA 2: PACKS PREMIUM Y QUEMA ---------------- */}
            {activeTab === 'packs' && (
               <div className="h-full flex flex-col animate-fadeIn">
                  {/* ZONA DE QUEMA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
                      <div className="bg-[#151515] p-4 md:p-5 rounded-2xl border border-orange-500/30 flex flex-col justify-between">
                         <div className="mb-3">
                             <h4 className="text-orange-400 font-black uppercase text-base md:text-lg mb-1">🔥 Quema de Ecos Premium</h4>
                             <p className="text-xs md:text-sm text-orange-200/70 font-bold uppercase tracking-wider">180 Ecos (P) → 50 Halos (P)</p>
                         </div>
                         <button disabled={(balances?.eco_p || 0) < 180} className="w-full py-2.5 rounded-lg text-sm font-black uppercase tracking-widest bg-orange-500 text-black hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500">
                            {(balances?.eco_p || 0) < 180 ? 'INSUFICIENTES ECOS P' : 'QUEMAR 180 ECOS (P)'}
                         </button>
                      </div>

                      <div className="bg-[#151515] p-4 md:p-5 rounded-2xl border border-pink-500/30 flex flex-col justify-between">
                         <div className="mb-3">
                             <h4 className="text-pink-400 font-black uppercase text-base md:text-lg mb-1">⚡ Quema de Zaps Premium</h4>
                             <p className="text-xs md:text-sm text-pink-200/70 font-bold uppercase tracking-wider">70 Zaps (P) → 50 Halos (P)</p>
                         </div>
                         <button disabled={(balances?.zap_p || 0) < 70} className="w-full py-2.5 rounded-lg text-sm font-black uppercase tracking-widest bg-pink-600 text-white hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500">
                            {(balances?.zap_p || 0) < 70 ? 'INSUFICIENTES ZAPS P' : 'QUEMAR 70 ZAPS (P)'}
                         </button>
                      </div>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase mb-4 md:mb-6">Packs de Activos <span className="text-purple-500">(PREMIUM FIAT)</span></h3>
                  
                  {/* GRID DE PACKS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     {Object.entries(PACKS_REGALOS).map(([key, data]) => (
                         <div key={key} className="bg-gradient-to-br from-purple-900/20 to-black p-4 md:p-5 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-colors flex flex-col justify-between">
                             <div>
                                <h4 className="font-black text-white/90 text-base md:text-lg uppercase tracking-widest mb-2 md:mb-3">{data.label}</h4>
                                <div className="flex items-center justify-between mb-4 md:mb-5">
                                    <div className="text-3xl md:text-4xl font-black text-white">{data.price.toFixed(2)}€</div>
                                    <ul className="text-xs md:text-sm text-gray-300 font-bold space-y-1.5 uppercase tracking-wider text-right">
                                        <li className="text-yellow-400">📀 {data.halosP} Halos (P)</li>
                                        <li className="text-orange-400">💬 {data.ecoP} Eco Text (P)</li>
                                        <li className="text-pink-400">⚡ {data.zapP} Hyper Zap (P)</li>
                                    </ul>
                                </div>
                             </div>
                             <button className="w-full py-3 bg-purple-600/90 text-white rounded-lg text-sm md:text-base font-black uppercase tracking-widest hover:bg-purple-500 shadow-lg shadow-purple-900/50 transition-all">COMPRAR PACK FIAT</button>
                         </div>
                     ))}
                  </div>
               </div>
            )}

           {/* ---------------- PESTAÑA 3: INTELIGENCIA ARTIFICIAL ---------------- */}
           {activeTab === 'ai' && (
              <div className="h-full flex flex-col animate-fadeIn">
                 
                 <div className="mb-6 md:mb-8">
                     <h3 className="text-xl md:text-2xl font-black text-white uppercase mb-2">Prepago IA <span className="text-blue-500">(BRO7VISION)</span></h3>
                     <p className="text-xs md:text-sm text-gray-400 border-l-2 border-blue-500 pl-3">
                        Desbloquea el modelo avanzado de Inteligencia Artificial. Los personajes de <strong className="text-white">Bro7Vision</strong> cobran vida con respuestas fluidas, memoria de la historia y una experiencia conversacional 100% realista.
                     </p>
                 </div>
                 
                 {/* GRID DE PACKS IA */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* PACK 5 EUROS */}
                     <div className="bg-gradient-to-br from-blue-900/20 to-[#0a0a0a] p-5 md:p-6 rounded-2xl border border-blue-500/30 hover:border-blue-400/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-black text-blue-400 text-base md:text-lg uppercase tracking-widest">Pack IA Básico</h4>
                                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded font-black uppercase tracking-wider">Recomendado</span>
                            </div>
                            <p className="text-xs md:text-sm text-gray-400 mb-5 leading-relaxed">Ideal para comenzar a interactuar con los protagonistas y adentrarte en su universo mental.</p>
                            
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-3xl md:text-4xl font-black text-white">5.00€</div>
                                <div className="text-right">
                                    <div className="text-blue-400 font-black text-base md:text-lg tracking-widest">500.000 TOKENS</div>
                                    <div className="text-xs md:text-sm text-gray-500 uppercase font-bold mt-1">~ 1.000 Consultas/Msjs</div>
                                </div>
                            </div>
                         </div>
                         <button className="w-full py-3 bg-blue-600/90 text-white rounded-lg text-sm md:text-base font-black uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-900/50 transition-all">
                             COMPRAR PACK 5€
                         </button>
                     </div>

                     {/* PACK 10 EUROS */}
                     <div className="bg-gradient-to-br from-blue-900/30 to-[#0a0a0a] p-5 md:p-6 rounded-2xl border-2 border-blue-500/50 hover:border-blue-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all flex flex-col justify-between relative overflow-hidden">
                         {/* Etiqueta BONUS */}
                         <div className="absolute top-4 -right-8 bg-blue-500 text-black text-xs font-black uppercase px-10 py-1 rotate-45 shadow-lg">
                             +200K BONUS
                         </div>

                         <div>
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-black text-blue-400 text-base md:text-lg uppercase tracking-widest">Pack IA Pro</h4>
                            </div>
                            <p className="text-xs md:text-sm text-gray-400 mb-5 leading-relaxed">Máxima inmersión. Conversaciones extensas sin preocuparte de los límites para explorar cada secreto.</p>
                            
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-3xl md:text-4xl font-black text-white">10.00€</div>
                                <div className="text-right">
                                    <div className="text-blue-400 font-black text-base md:text-lg tracking-widest">1.200.000 TOKENS</div>
                                    <div className="text-xs md:text-sm text-gray-500 uppercase font-bold mt-1">~ 2.400 Consultas/Msjs</div>
                                </div>
                            </div>
                         </div>
                         <button className="w-full py-3 bg-blue-500 text-black rounded-lg text-sm md:text-base font-black uppercase tracking-widest hover:bg-blue-400 shadow-lg shadow-blue-900/50 transition-all">
                             COMPRAR PACK 10€
                         </button>
                     </div>

                 </div>
              </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default ConversionModal;