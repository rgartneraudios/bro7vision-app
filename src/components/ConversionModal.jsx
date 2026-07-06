import React from 'react';

const ConversionModal = ({ balances, setBalances, session, activePhase, onClose }) => {
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
                <h2 className="text-white font-black italic tracking-widest text-2xl md:text-3xl">BRO<span className="text-cyan-500">WALLET</span></h2>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 p-4 rounded-2xl mb-4 md:mb-6 text-center shadow-inner">
                <p className="text-xs md:text-sm text-indigo-300 uppercase tracking-widest mb-1">Saldo Lunas</p>
                 <div className="text-3xl md:text-4xl font-black text-white">{balances?.genesis || 0}</div>
            </div>

            {/* BOTÓN PREPAGO IA PERSONAJES */}
            <button className="w-full p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider bg-blue-600 text-white shadow-lg shadow-blue-500/20 mb-4 md:mb-6 transition-all hover:bg-blue-500">
                <span className="text-base">🤖</span> Prepago IA Personajes
            </button>

            {/* INVENTARIO */}
            <div className="mb-4 md:mb-6 flex-1 overflow-y-auto pr-1 bioluminescent-scroll">
              <p className="text-xs md:text-sm text-cyan-400 uppercase tracking-widest mb-3 font-bold">TU INVENTARIO</p>
              
              <div className="space-y-4 text-white text-xs md:text-sm font-bold uppercase">
                  <div className="border-t border-white/10 pt-3">
                      <p className="text-blue-500/80 mb-2 tracking-widest text-[10px]">SALDO INTELIGENCIA ARTIFICIAL</p>
                      <div className="flex justify-between p-2.5 bg-blue-800/10 rounded-lg border border-blue-400/20">
                          <span className="text-blue-300">TOKENS IA</span>
                          <span className="text-white">{balances?.ai_tokens?.toLocaleString() || 0}</span>
                      </div>
                  </div>
              </div>
            </div>
        </div>

        {/* ================= CONTENIDO DERECHO ================= */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 bg-black overflow-y-auto bioluminescent-scroll">
           
           {/* ---------------- INTELIGENCIA ARTIFICIAL ---------------- */}
           <div className="h-full flex flex-col animate-fadeIn items-center">
                 
                 <div className="mb-6 md:mb-8 w-full max-w-lg">
<h3 className="text-3xl md:text-4xl font-black text-white uppercase mb-2">Prepago IA <span className="text-blue-500">(BRO7VISION)</span></h3>
                      <p className="text-lg md:text-xl text-gray-400 border-l-2 border-blue-500 pl-3">
                        Desbloquea el modelo avanzado de Inteligencia Artificial. Los personajes de <strong className="text-white">Bro7Vision</strong> cobran vida con respuestas fluidas, memoria de la historia y una experiencia conversacional 100% realista.
                     </p>
                 </div>
                 
                 {/* PACKS IA - angostos */}
                 <div className="max-w-lg w-full space-y-4">
                    
                    {/* PACK 5 EUROS */}
                     <div className="bg-gradient-to-br from-blue-900/20 to-[#0a0a0a] p-4 md:p-5 rounded-2xl border border-blue-500/30 hover:border-blue-400/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-black text-blue-400 text-xl md:text-2xl uppercase tracking-widest">Pack IA Básico</h4>
                                <span className="bg-blue-500/20 text-blue-300 text-lg px-3 py-1.5 rounded font-black uppercase tracking-wider">Recomendado</span>
                            </div>
<p className="text-lg text-gray-400 mb-4 leading-relaxed">Ideal para comenzar a interactuar con los protagonistas y adentrarte en su universo mental.</p>

                            <div className="flex items-center justify-between mb-5">
                                <div className="text-4xl md:text-5xl font-black text-white">5.00€</div>
                                <div className="text-right">
                                    <div className="text-blue-400 font-black text-xl md:text-2xl tracking-widest">500.000 TOKENS</div>
                                    <div className="text-lg text-gray-500 uppercase font-bold mt-1">~ 1.000 Consultas/Msjs</div>
                                </div>
                            </div>
                         </div>
                         <button className="w-full py-3 bg-blue-600/90 text-white rounded-lg text-xl font-black uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-900/50 transition-all">
                             COMPRAR PACK 5€
                         </button>
                     </div>

                     {/* PACK 10 EUROS */}
                     <div className="bg-gradient-to-br from-blue-900/30 to-[#0a0a0a] p-4 md:p-5 rounded-2xl border-2 border-blue-500/50 hover:border-blue-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all flex flex-col justify-between relative overflow-hidden">
                         <div className="absolute top-4 -right-8 bg-blue-500 text-black text-lg font-black uppercase px-10 py-1 rotate-45 shadow-lg">
                             +200K BONUS
                         </div>

                         <div>
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-black text-blue-400 text-xl md:text-2xl uppercase tracking-widest">Pack IA Pro</h4>
                            </div>
<p className="text-lg text-gray-400 mb-4 leading-relaxed">Máxima inmersión. Conversaciones extensas sin preocuparte de los límites para explorar cada secreto.</p>

                            <div className="flex items-center justify-between mb-5">
                                <div className="text-4xl md:text-5xl font-black text-white">10.00€</div>
                                <div className="text-right">
                                    <div className="text-blue-400 font-black text-xl md:text-2xl tracking-widest">1.200.000 TOKENS</div>
                                    <div className="text-lg text-gray-500 uppercase font-bold mt-1">~ 2.400 Consultas/Msjs</div>
                                </div>
                            </div>
                         </div>
                         <button className="w-full py-3 bg-blue-500 text-black rounded-lg text-xl font-black uppercase tracking-widest hover:bg-blue-400 shadow-lg shadow-blue-900/50 transition-all">
                             COMPRAR PACK 10€
                         </button>
                     </div>

                 </div>
              </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionModal;