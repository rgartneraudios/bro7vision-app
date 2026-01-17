// src/components/PaymentModal.jsx (CON COMPARATIVA DE PRECIOS FIAT)

import React, { useState } from 'react';
import { MOON_MATRIX, PARITY_VALUE } from '../data/MoonMatrix';
import TerminalShop from './TerminalShop';

const PaymentModal = ({ isOpen, onClose, product, balances, currentPhase, onConfirmPayment }) => {
  if (!isOpen || !product) return null;

  const [deliveryMode, setDeliveryMode] = useState('pickup');
  const [dynamicTotal, setDynamicTotal] = useState(0);

  // --- CÁLCULOS MATEMÁTICOS ---
  
  // 1. Coste Logístico (Fijo en Euros)
  const deliveryCost = deliveryMode === 'delivery' ? 2.00 : 0;

  // 2. PRECIO BASE (COMERCIO): Lo que marca la tienda + envío
  // (dynamicTotal viene del TerminalShop, es la suma de items base)
  const baseFiatPrice = dynamicTotal + deliveryCost;

  // 3. PRECIO FASE (MOON): El valor fluctuante
  // Convertimos el base a Puntos Standard (1:1) y aplicamos el factor OUT de la fase
  const standardCoins = dynamicTotal / PARITY_VALUE;
  const outValueRate = MOON_MATRIX[currentPhase].OUT;
  
  // El precio del producto ajustado por la fase + el envío (el envío no suele fluctuar, pero aquí lo sumamos al final)
  // OJO: Si quieres que el envío también fluctúe, mételo antes de multiplicar. Aquí lo sumo limpio.
  const phaseFiatPrice = (standardCoins * outValueRate) + deliveryCost;

  // Renderizado Botones Monedas
  const renderCoinButton = (coinKey) => {
    const coinData = MOON_MATRIX[coinKey];
    // Calculamos cuántas monedas hacen falta para cubrir el PRECIO DE FASE
    const coinsNeeded = Math.ceil(phaseFiatPrice / coinData.IN);
    
    // FASE 0: Permitimos comprar siempre (Simulación)
    const canAfford = true; 
    
    const colorMap = { nova: 'fuchsia', crescens: 'green', plena: 'yellow', decrescens: 'orange' };
    const color = colorMap[coinKey];
    const isCurrentPhase = coinKey === currentPhase;

    return (
      <button
        key={coinKey}
        disabled={!canAfford}
        onClick={() => onConfirmPayment(coinKey, coinsNeeded)}
        className={`
          flex-1 py-2 px-2 rounded-sm border flex flex-col items-center justify-center transition-all min-w-[70px] group relative
          ${canAfford 
             ? `bg-black border-${color}-500/40 hover:bg-${color}-900/20 hover:border-${color}-400` 
             : 'bg-black/40 border-white/5 opacity-30 cursor-not-allowed'}
          ${isCurrentPhase ? 'ring-1 ring-white/50 bg-white/5' : ''}
        `}
      >
        {isCurrentPhase && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
        <span className={`text-[8px] font-black uppercase text-${color}-400 tracking-widest`}>{coinData.label}</span>
        <span className="text-xs font-mono font-bold text-white group-active:scale-95 transition-transform">{coinsNeeded}</span>
      </button>
    );
  };

  // Datos visuales de la fase actual para colorear el precio final
  const currentPhaseData = MOON_MATRIX[currentPhase];
  const phaseColor = currentPhase === 'nova' ? 'text-fuchsia-400' : 
                     currentPhase === 'crescens' ? 'text-green-400' :
                     currentPhase === 'plena' ? 'text-yellow-400' : 'text-orange-400';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-6xl h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col animate-zoomIn">
        
        {/* CINTA DE AVISO FASE 0 */}
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 py-1 text-center">
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.3em] animate-pulse">
                ⚠ MODO SIMULACIÓN • FASE GÉNESIS • NO SE REALIZARÁN COBROS
            </p>
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#111]">
            <div className="flex items-center gap-4">
                <img src={product.img || product.image} className="w-10 h-10 rounded object-cover border border-white/20" alt="Shop"/>
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight leading-none">{product.name}</h2>
                    <p className="text-xs text-gray-500 font-mono mt-1">{product.shopName} <span className="text-cyan-500">● LIVE</span></p>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white px-2">✕ ESC</button>
        </div>

        {/* BODY */}
        <div className="flex-1 p-4 bg-gradient-to-b from-[#0f0f0f] to-black overflow-hidden flex flex-col">
           <TerminalShop initialItem={product} onUpdateTotal={setDynamicTotal} />
        </div>

        {/* FOOTER (REDISEÑADO) */}
        <div className="border-t border-white/10 bg-[#080808] p-4 relative">
            
            <div className="absolute top-0 right-0 p-1">
                 <span className="text-[8px] text-gray-700 font-mono">BRO7VISION_PAY_V0.1_BETA</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                
                {/* 1. LOGÍSTICA */}
                <div className="flex gap-2 w-full md:w-auto opacity-50 pointer-events-none grayscale shrink-0"> 
                    <button className={`flex-1 md:flex-none px-4 py-2 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${deliveryMode === 'pickup' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10'}`}>
                        🚀 Recoger
                    </button>
                    <button className={`flex-1 md:flex-none px-4 py-2 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${deliveryMode === 'delivery' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10'}`}>
                        🚚 Envío (+2€)
                    </button>
                </div>

                {/* 2. COMPARATIVA DE PRECIOS (NUEVO DISEÑO) */}
                <div className="flex items-center gap-6 border-x border-white/5 px-6 mx-2 w-full justify-center">
                    
                    {/* A) PRECIO BASE (COMERCIO) */}
                    <div className="text-right opacity-60 grayscale group hover:grayscale-0 transition-all">
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-0.5">PVP COMERCIO</p>
                        <p className="text-xl font-bold text-gray-300 font-mono leading-none decoration-gray-500">
                            {baseFiatPrice.toFixed(2)}€
                        </p>
                    </div>

                    {/* FLECHA INDICADORA */}
                    <div className="text-gray-600 text-lg">➔</div>

                    {/* B) PRECIO FASE (MOON) */}
                    <div className="text-left relative">
                        {/* Etiqueta flotante de la fase */}
                        <span className={`absolute -top-3 left-0 text-[7px] font-black uppercase px-1 rounded bg-white/10 ${phaseColor}`}>
                            FASE {currentPhaseData.label}
                        </span>
                        <p className={`text-[8px] ${phaseColor} uppercase tracking-widest mb-0.5 mt-1`}>TOTAL FASE</p>
                        <p className={`text-3xl font-black ${phaseColor} font-mono leading-none tracking-tighter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]`}>
                            {phaseFiatPrice.toFixed(2)}€
                        </p>
                    </div>

                </div>

                {/* 3. PAGAR (COINS) */}
                <div className="flex gap-1 w-full md:w-auto justify-end shrink-0">
                    {renderCoinButton('nova')}
                    {renderCoinButton('crescens')}
                    {renderCoinButton('plena')}
                    {renderCoinButton('decrescens')}
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;