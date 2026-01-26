// src/components/PaymentModal.jsx (VERSION FINAL: NO CRASH + DYNAMIC THEME)

import React, { useState } from 'react';
import { MOON_MATRIX, PARITY_VALUE } from '../data/MoonMatrix';
import TerminalShop from './TerminalShop';

const PaymentModal = ({ isOpen, onClose, product, balances, currentPhase, onConfirmPayment, onLaunch }) => {
  if (!isOpen || !product) return null;

  // 1. DETERINAR PESTAÑA INICIAL (Con seguridad)
  // Priorizamos Assets, luego productos, luego servicios.
  const getInitialTab = () => {
      if (product.isAsset) return 'assets';
      if (product.hasProduct) return 'products';
      if (product.hasService) return 'services';
      return 'products'; // Fallback por defecto
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [deliveryMode, setDeliveryMode] = useState('pickup');
  const [dynamicTotal, setDynamicTotal] = useState(0);
  const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);

  // --- 2. SISTEMA DE TEMAS DINÁMICO (BOOSTER STYLE) ---
  const getThemeStyles = (colorString) => {
      // Default de seguridad
      let energy = 'cyan'; 
      let matter = 'void';
      
      // Si viene el string, lo partimos (ej: "fuchsia-carbon")
      if (colorString && colorString.includes('-')) {
          [energy, matter] = colorString.split('-');
      }

      // Mapas de colores
      const bgMap = {
          void: 'bg-black',
          carbon: 'bg-[#111]',
          navy: 'bg-[#050a15]',
          cobalt: 'bg-[#051525]',
          wine: 'bg-[#150505]',
          crimson: 'bg-[#200505]',
          forest: 'bg-[#051505]',
          emerald: 'bg-[#051010]',
          plum: 'bg-[#100515]',
          chocolate: 'bg-[#150a05]'
      };

      const energyMap = {
          cyan: 'border-cyan-500 shadow-cyan-500/20 text-cyan-400',
          fuchsia: 'border-fuchsia-500 shadow-fuchsia-500/20 text-fuchsia-400',
          yellow: 'border-yellow-400 shadow-yellow-400/20 text-yellow-400',
          green: 'border-green-500 shadow-green-500/20 text-green-400',
          blue: 'border-blue-500 shadow-blue-500/20 text-blue-400',
          red: 'border-red-500 shadow-red-500/20 text-red-400',
          orange: 'border-orange-500 shadow-orange-500/20 text-orange-400',
          gold: 'border-[#C7AF38] shadow-[#C7AF38]/20 text-[#C7AF38]',
          silver: 'border-[#D9D9D9] shadow-[#D9D9D9]/20 text-[#D9D9D9]',
          white: 'border-white shadow-white/20 text-white'
      };

      // Si no existe el color, fallback a defaults
      const bgClass = bgMap[matter] || 'bg-black';
      const borderClass = energyMap[energy] || energyMap.cyan;

      return {
          container: `${bgClass} border ${borderClass} shadow-[0_0_50px_rgba(0,0,0,0.5)]`,
          textInfo: energyMap[energy] ? energyMap[energy].split(' ').pop() : 'text-cyan-400', // Solo el color de texto
          glowColor: energy // Para usos raw si hace falta
      };
  };

  const theme = getThemeStyles(product.neonColor);

  // --- 3. CÁLCULO DE PRECIOS BLINDADO ---
  const getBasePrice = () => {
      // Uso de Optional Chaining (?.) y OR (||) para evitar el crash "undefined"
      if (activeTab === 'assets') return parseFloat(String(product.price || 0).replace('€', ''));
      if (activeTab === 'products') return dynamicTotal; 
      if (activeTab === 'services') return parseFloat(product.serviceData?.price || product.price || 0);
      return 0;
  };

  const baseFiatVal = getBasePrice();
  const deliveryCost = deliveryMode === 'delivery' ? 2.00 : 0;
  const baseFiatPrice = baseFiatVal + deliveryCost;
  
  const standardCoins = baseFiatPrice / PARITY_VALUE;
  const outValueRate = MOON_MATRIX[currentPhase].OUT;
  const phaseFiatPrice = (standardCoins * outValueRate) + deliveryCost;

  const currentPhaseData = MOON_MATRIX[currentPhase];
  const phaseColor = currentPhase === 'nova' ? 'text-fuchsia-400' : 
                     currentPhase === 'crescens' ? 'text-green-400' :
                     currentPhase === 'plena' ? 'text-yellow-400' : 'text-orange-400';

  const handleCoinPayment = (coinKey) => {
    const coinsNeeded = Math.ceil(phaseFiatPrice / MOON_MATRIX[coinKey].IN);
    onConfirmPayment(coinKey, coinsNeeded, product);
    if (activeTab === 'assets') setIsPaymentProcessed(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn font-mono">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      {/* AQUI APLICAMOS EL TEMA DINÁMICO AL CONTENEDOR PRINCIPAL */}
      <div className={`relative w-full max-w-6xl h-[85vh] rounded-xl overflow-hidden flex flex-col animate-zoomIn transition-colors duration-500 ${theme.container}`}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-4">
                <img 
                    src={product.avatar_url || product.img} 
                    className="w-10 h-10 rounded-full border border-white/20 object-cover" 
                    alt="av"
                    onError={(e) => e.target.src = 'https://placehold.co/100x100/000000/FFFFFF/png?text=ERR'}
                />
                <div>
                    <h2 className={`text-xl font-black tracking-tighter uppercase ${theme.textInfo}`}>{product.shopName}</h2>
                    <div className="flex gap-2">
                        {product.hasProduct && <span className="text-[8px] bg-white/10 text-white/70 px-1 rounded">📦 PRODUCTOS</span>}
                        {product.hasService && <span className="text-[8px] bg-white/10 text-white/70 px-1 rounded">🤝 SERVICIOS</span>}
                    </div>
                </div>
            </div>
            {!isPaymentProcessed && <button onClick={onClose} className="text-gray-500 hover:text-white px-2">✕ ESC</button>}
        </div>

        {/* TABS INTERNAS */}
        {!isPaymentProcessed && (
            <div className="flex bg-black/40 border-b border-white/5">
                {product.hasProduct && (
                    <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? `text-white border-b-2 bg-white/5 ${theme.textInfo.replace('text-', 'border-')}` : 'text-gray-600'}`}>📦 BroShop</button>
                )}
                {product.hasService && (
                    <button onClick={() => setActiveTab('services')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'services' ? `text-white border-b-2 bg-white/5 ${theme.textInfo.replace('text-', 'border-')}` : 'text-gray-600'}`}>🤝 Servicios</button>
                )}
                {product.isAsset && (
                    <button onClick={() => setActiveTab('assets')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'assets' ? `text-white border-b-2 bg-white/5 ${theme.textInfo.replace('text-', 'border-')}` : 'text-gray-600'}`}>🌐 Activo P2P</button>
                )}
            </div>
        )}

        {/* CONTENIDO DUAL */}
        {/* El fondo aquí es transparente para dejar ver el color del contenedor padre (Theme) */}
        <div className="flex-1 p-4 flex flex-col relative overflow-hidden bg-transparent">
            {!isPaymentProcessed ? (
                <div className="w-full h-full overflow-y-auto custom-scrollbar">
                    
                    {/* --- PESTAÑA PRODUCTOS --- */}
                    {activeTab === 'products' && (
                        <TerminalShop 
                            // FIX DEL CRASH: Usamos ?. y || para evitar undefined
                            initialItem={{
                                ...product, 
                                name: product.productData?.name || product.name || 'Producto General', 
                                price: product.productData?.price || product.price || '0'
                            }} 
                            onUpdateTotal={setDynamicTotal} 
                        />
                    )}

                    {/* --- PESTAÑA SERVICIOS --- */}
                    {activeTab === 'services' && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <p className={`${theme.textInfo} uppercase text-[10px] tracking-[0.2em] mb-4`}>Servicio Seleccionado</p>
                            {/* FIX DEL CRASH: ?.name */}
                            <h3 className="text-3xl font-black text-white uppercase mb-2">
                                {product.serviceData?.name || product.name || "Servicio Genérico"}
                            </h3>
                            <p className="text-gray-400 text-sm max-w-md italic mb-6">
                                "{product.serviceData?.desc || product.desc || "Consultar detalles con el proveedor."}"
                            </p>
                            <div className={`bg-white/5 border border-white/10 p-6 rounded-xl`}>
                                <p className="text-5xl font-black text-white">
                                    {parseFloat(product.serviceData?.price || product.price || 0).toFixed(2)}€
                                </p>
                            </div>
                        </div>
                    )}

                    {/* --- PESTAÑA ASSETS (P2P) --- */}
                    {activeTab === 'assets' && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <p className="text-blue-500 uppercase text-[10px] tracking-[0.2em] mb-2">Acceso a Datos P2P</p>
                            <p className="text-6xl font-black text-white">{parseFloat(String(product.price).replace('€','')).toFixed(2)}€</p>
                            <p className="mt-4 text-xs text-gray-500">Desbloqueo inmediato tras confirmación.</p>
                        </div>
                    )}
                </div>
            ) : (
                // PANTALLA DE ÉXITO DE PAGO
                <div className="flex-1 flex flex-col items-center justify-center animate-zoomIn">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                        <span className="text-4xl text-black">✓</span>
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase mb-2">Pago Verificado</h3>
                    <button onClick={() => onLaunch(product)} className={`group relative px-16 py-6 bg-white text-black font-black uppercase hover:${theme.textInfo.replace('text-', 'bg-')} hover:text-black transition-all`}>
                        🚀 LANZAR {product.assetType || 'CONTENIDO'}
                    </button>
                </div>
            )}
        </div>

        {/* FOOTER FINANCIERO */}
        {!isPaymentProcessed && (
            <div className="border-t border-white/10 bg-black/40 p-4">
                <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                    <div className="flex gap-2 shrink-0"> 
                        <button onClick={() => setDeliveryMode('pickup')} className={`px-4 py-2 text-[9px] font-black border ${deliveryMode === 'pickup' ? 'bg-white text-black' : 'text-gray-500 border-white/10'}`}>🚀 RECOGER</button>
                        <button onClick={() => setDeliveryMode('delivery')} className={`px-4 py-2 text-[9px] font-black border ${deliveryMode === 'delivery' ? 'bg-white text-black' : 'text-gray-500 border-white/10'}`}>🚚 ENVÍO</button>
                    </div>

                    <div className="flex items-center gap-6 justify-center">
                        <div className="text-right opacity-30">
                            <p className="text-[8px] uppercase">PVP</p>
                            <p className="text-xl font-bold">{baseFiatPrice.toFixed(2)}€</p>
                        </div>
                        <div className="text-gray-700">➔</div>
                        <div className="text-left">
                            <span className={`text-[7px] font-black uppercase px-1 rounded bg-white/5 ${phaseColor}`}>FASE {currentPhaseData.label}</span>
                            <p className="text-3xl font-black text-white">{phaseFiatPrice.toFixed(2)}€</p>
                        </div>
                    </div>

                    <div className="flex gap-1 justify-end">
                        {['nova', 'crescens', 'plena', 'decrescens'].map(coin => (
                            <button key={coin} onClick={() => handleCoinPayment(coin)} className="w-16 py-2 border border-white/10 flex flex-col items-center hover:border-white transition-all bg-black/50">
                                <span className="text-[7px] text-gray-500 uppercase">{coin}</span>
                                <span className="text-xs font-bold">{Math.ceil(phaseFiatPrice / MOON_MATRIX[coin].IN)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;