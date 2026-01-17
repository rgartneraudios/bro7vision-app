import React, { useState } from 'react';
import { MOON_MATRIX, PARITY_VALUE, convertGenesisToMoon } from '../data/MoonMatrix';

const ConversionModal = ({ balances, activePhase, onClose }) => {
  const [activeTab, setActiveTab] = useState('matrix'); // Por defecto enseñamos la Matrix
  const [genesisToConvert, setGenesisToConvert] = useState(100); 

  const currentMatrix = MOON_MATRIX[activePhase];
  const genesisBalance = balances.genesis || 0;
  const fiatValue = (genesisBalance * PARITY_VALUE).toFixed(2); // Valor en Euros

  // Función para pintar celdas de la tabla (Semáforo)
  const getCellColor = (val, type) => {
      // Lógica simple visual: Si es muy bajo es verde (barato), si es alto rojo (caro) para IN/Lx
      // Para OUT es al revés.
      // Esto es solo visualización aproximada para el MVP
      return "text-white";
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>

      <div className="relative w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(232,121,249,0.1)] flex flex-col md:flex-row h-[700px] animate-zoomIn">
        
        {/* === SIDEBAR (Resumen Génesis) === */}
        <div className="w-full md:w-1/4 bg-[#111] border-r border-white/5 p-6 flex flex-col relative overflow-hidden">
           {/* Decoración de fondo */}
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500"></div>
           
           <div className="mb-8 text-center">
              <h2 className="text-white font-black italic tracking-widest text-xl mb-1">GENESIS<span className="text-fuchsia-500">HUB</span></h2>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Pre-Launch Economy</p>
           </div>

           <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 p-6 rounded-2xl mb-6 text-center group hover:border-indigo-400 transition-all">
               <p className="text-[10px] text-indigo-300 uppercase tracking-widest mb-2">Tu Capital Base</p>
               <div className="text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform inline-block">{genesisBalance}</div>
               <p className="text-xs text-gray-400 font-mono">pts</p>
               <div className="mt-4 pt-4 border-t border-white/10">
                   <p className="text-[10px] text-gray-500 uppercase">Valor FIAT Real</p>
                   <p className="text-xl font-mono text-green-400 font-bold">{fiatValue} €</p>
               </div>
           </div>
           
           <nav className="flex flex-col gap-2 mt-auto">
               <button onClick={() => setActiveTab('matrix')} className={`p-4 rounded-xl text-left text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'matrix' ? 'bg-white text-black' : 'text-gray-500 hover:bg-white/5'}`}>
                  🧠 La Matrix (Info)
               </button>
               <button onClick={() => setActiveTab('convert')} className={`p-4 rounded-xl text-left text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'convert' ? 'bg-fuchsia-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.4)]' : 'text-gray-500 hover:bg-white/5'}`}>
                  🔄 Convertir (Sim)
               </button>
               <button onClick={() => setActiveTab('mentions')} className={`p-4 rounded-xl text-left text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'mentions' ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-gray-500 hover:bg-white/5'}`}>
                  💎 Mentions Store
               </button>
           </nav>
        </div>

        {/* === CONTENIDO PRINCIPAL === */}
        <div className="flex-1 p-8 bg-black relative overflow-y-auto custom-scrollbar">
           <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest">✕ ESC</button>

           {/* --- TAB 1: LA MATRIX (TABLA EDUCATIVA) --- */}
           {activeTab === 'matrix' && (
              <div className="animate-fadeIn">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Moon Matrix</h3>
                 <p className="text-sm text-gray-400 mb-8 max-w-2xl">
                     Guía estratégica de eficiencia. Los valores cambian según la fase lunar. 
                     <span className="text-green-400 ml-2">Verde = Oportunidad</span>. 
                     <span className="text-red-400 ml-2">Rojo = Esperar</span>.
                 </p>

                 <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                         <thead>
                             <tr className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/10">
                                 <th className="p-4">Fase / Moneda</th>
                                 <th className="p-4 text-fuchsia-400">IN (Compra)</th>
                                 <th className="p-4 text-green-400">OUT (Venta)</th>
                                 <th className="p-4 text-blue-400">ML1 (Visual)</th>
                                 <th className="p-4 text-yellow-400">ML2 (Flash)</th>
                                 <th className="p-4 text-cyan-400">ML3 (Lives)</th>
                                 <th className="p-4 text-purple-400">ML4 (Stories)</th>
                             </tr>
                         </thead>
                         <tbody className="font-mono text-sm">
                             {Object.entries(MOON_MATRIX).filter(([k]) => k !== 'fiat').map(([key, data]) => (
                                 <tr key={key} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${key === activePhase ? 'bg-white/10' : ''}`}>
                                     <td className="p-4 flex items-center gap-3">
                                         <div className={`w-3 h-3 rounded-full bg-${data.color}-500 ${key === activePhase ? 'animate-pulse shadow-[0_0_10px_currentColor]' : ''}`}></div>
                                         <span className={`font-bold uppercase ${key === activePhase ? 'text-white' : 'text-gray-500'}`}>{data.label}</span>
                                     </td>
                                     <td className="p-4 font-bold">{data.IN}€</td>
                                     <td className="p-4 font-bold">{data.OUT}€</td>
                                     <td className="p-4 opacity-70">{data.L1}€</td>
                                     <td className="p-4 opacity-70">{data.L2}€</td>
                                     <td className="p-4 opacity-70">{data.L3}€</td>
                                     <td className="p-4 font-bold text-purple-400">{data.L4}€</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
                 
                 <div className="mt-8 p-4 bg-yellow-900/10 border border-yellow-500/30 rounded-xl flex gap-4 items-center">
                     <span className="text-2xl">💡</span>
                     <p className="text-xs text-yellow-200">
                         <strong>TIP DEL ARQUITECTO:</strong> En Fase <strong>PLENA</strong> (Luna Llena), el Audio (ML3) es inusualmente barato (0.024). ¡Es el momento de patrocinar Lives!
                     </p>
                 </div>
              </div>
           )}

           {/* --- TAB 2: CONVERSOR (SIMULADOR) --- */}
           {activeTab === 'convert' && (
              <div className="animate-fadeIn max-w-2xl mx-auto mt-8">
                 <div className="text-center mb-8">
                    <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Cristalizar Valor</h3>
                    <p className="text-gray-400 text-sm">Transforma tu <span className="text-fuchsia-400 font-bold">Génesis (FIAT)</span> en la moneda de la fase actual.</p>
                 </div>

                 <div className="bg-[#151515] p-8 rounded-3xl border border-white/10 relative">
                     {/* Input Génesis */}
                     <div className="mb-8">
                         <div className="flex justify-between text-xs uppercase tracking-widest text-gray-500 mb-2">
                             <span>Cantidad a convertir</span>
                             <span>Max: {genesisBalance}</span>
                         </div>
                         <div className="flex items-center gap-4 bg-black border border-white/20 rounded-xl px-4 py-2">
                             <span className="text-fuchsia-500 font-bold">GÉNESIS</span>
                             <input 
                                type="number" 
                                value={genesisToConvert}
                                onChange={(e) => setGenesisToConvert(Number(e.target.value))}
                                className="bg-transparent text-white text-3xl font-mono font-bold w-full focus:outline-none text-right"
                             />
                         </div>
                         <p className="text-right text-xs text-green-400 font-mono mt-1">Value: {(genesisToConvert * PARITY_VALUE).toFixed(2)}€</p>
                     </div>

                     {/* Flecha */}
                     <div className="flex justify-center -my-4 relative z-10">
                         <div className="bg-white text-black rounded-full p-2 shadow-lg text-xl">⬇</div>
                     </div>

                     {/* Output Moon Coin */}
                     <div className={`mt-4 p-6 rounded-2xl border border-${currentMatrix.color}-500/30 bg-${currentMatrix.color}-900/10 text-center`}>
                         <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Recibes (Fase {currentMatrix.label})</p>
                         <p className={`text-5xl font-black text-${currentMatrix.color}-400 font-mono mb-2`}>
                             {convertGenesisToMoon(genesisToConvert, activePhase)}
                         </p>
                         <p className="text-xs text-white uppercase font-bold">{currentMatrix.label} COINS</p>
                         <p className="text-[9px] text-gray-500 mt-2 font-mono">Ratio: 1 {currentMatrix.label} = {currentMatrix.IN}€</p>
                     </div>
                 </div>

                 <button 
                    disabled={true} 
                    className="w-full mt-6 py-4 bg-gray-800 text-gray-400 font-bold uppercase rounded-xl cursor-not-allowed border border-white/5"
                 >
                    [ CONVERSIÓN HABILITADA EN FASE 1 ]
                 </button>
              </div>
           )}

           {/* --- TAB 3: MENTIONS STORE (INCLUYE ML4) --- */}
           {activeTab === 'mentions' && (
              <div className="animate-fadeIn">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">Mentions Store</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     
                     {/* ML1 */}
                     <div className="bg-[#151515] p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                         <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-white">ML1: Identity</h4>
                             <span className="text-[9px] bg-gray-700 px-2 py-1 rounded text-white">VISUAL</span>
                         </div>
                         <p className="text-xs text-gray-400 mb-4">Tu nombre real en la Profile Card.</p>
                         <p className="text-xl font-mono text-white">{currentMatrix.L1}€</p>
                     </div>

                     {/* ML2 */}
                     <div className="bg-[#151515] p-5 rounded-2xl border border-white/5 hover:border-yellow-500/50 transition-all">
                         <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-yellow-400">ML2: Flash Offer</h4>
                             <span className="text-[9px] bg-yellow-900 px-2 py-1 rounded text-yellow-200">HUD</span>
                         </div>
                         <p className="text-xs text-gray-400 mb-4">Mensaje de oferta parpadeante.</p>
                         <p className="text-xl font-mono text-white">{currentMatrix.L2}€</p>
                     </div>

                     {/* ML3 */}
                     <div className="bg-[#151515] p-5 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all">
                         <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-cyan-400">ML3: Sonic Ads</h4>
                             <span className="text-[9px] bg-cyan-900 px-2 py-1 rounded text-cyan-200">LIVE AUDIO</span>
                         </div>
                         <p className="text-xs text-gray-400 mb-4">Tu marca en Bro-Lives y Tuner.</p>
                         <p className="text-xl font-mono text-white">{currentMatrix.L3}€</p>
                     </div>

                     {/* ML4 - NUEVO - BROSTORIES */}
                     <div className="bg-gradient-to-br from-purple-900/20 to-black p-5 rounded-2xl border border-purple-500/50 hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
                         <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl">PREMIUM</div>
                         <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-purple-400 flex items-center gap-2">ML4: Narrative Ads <span>📖</span></h4>
                         </div>
                         <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                            <strong>Product Placement Narrativo.</strong> Tu producto se convierte en parte de la historia (BroStories). 
                            <em className="block mt-1 text-purple-300">"El detective paró en Gasolinera Pepe..."</em>
                         </p>
                         <div className="flex justify-between items-end border-t border-white/10 pt-2">
                             <span className="text-[9px] text-gray-500 uppercase">Coste Actual</span>
                             <p className="text-2xl font-mono font-black text-white">{currentMatrix.L4}€</p>
                         </div>
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