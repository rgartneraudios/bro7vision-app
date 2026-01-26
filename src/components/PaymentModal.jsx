// src/components/PaymentModal.jsx (VERSION SWITCHER TOTAL)

import React, { useState, useEffect } from 'react';
import { MOON_MATRIX, PARITY_VALUE } from '../data/MoonMatrix';
import TerminalShop from './TerminalShop';

const PaymentModal = ({ isOpen, onClose, product, balances, currentPhase, onConfirmPayment, onLaunch }) => {
  if (!isOpen || !product) return null;

  // Determinar pestaña inicial: priorizamos lo que el usuario clicó o lo que haya disponible
  const [activeTab, setActiveTab] = useState(product.isAsset ? 'assets' : (product.hasProduct ? 'products' : 'services'));
  const [deliveryMode, setDeliveryMode] = useState('pickup');
  const [dynamicTotal, setDynamicTotal] = useState(0);
  const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);

  // CÁLCULO DE PRECIOS
  const getBasePrice = () => {
      if (activeTab === 'assets') return parseFloat(String(product.price || 0).replace('€', ''));
      if (activeTab === 'products') return dynamicTotal; // Viene del TerminalShop
      if (activeTab === 'services') return parseFloat(u.serviceData?.price || 0);
      return 0;
  };

  const deliveryCost = deliveryMode === 'delivery' ? 2.00 : 0;
  const baseFiatPrice = (activeTab === 'products' ? dynamicTotal : (activeTab === 'services' ? parseFloat(product.serviceData?.price || 0) : parseFloat(String(product.price || 0).replace('€','')))) + deliveryCost;
  
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

      <div className="relative w-full max-w-6xl h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden flex flex-col animate-zoomIn">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#111]">
            <div className="flex items-center gap-4">
                <img src={product.avatar_url} className="w-10 h-10 rounded-full border border-white/20" alt="av"/>
                <div>
                    <h2 className="text-xl font-black text-white tracking-tighter uppercase">{product.shopName}</h2>
                    <div className="flex gap-2">
                        {product.hasProduct && <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1 rounded">📦 PRODUCTOS</span>}
                        {product.hasService && <span className="text-[8px] bg-cyan-500/20 text-cyan-500 px-1 rounded">🤝 SERVICIOS</span>}
                    </div>
                </div>
            </div>
            {!isPaymentProcessed && <button onClick={onClose} className="text-gray-500 hover:text-white px-2">✕ ESC</button>}
        </div>

        {/* TABS INTERNAS (SWITCHER) */}
        {!isPaymentProcessed && (
            <div className="flex bg-black border-b border-white/5">
                {product.hasProduct && (
                    <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5' : 'text-gray-600'}`}>📦 BroShop</button>
                )}
                {product.hasService && (
                    <button onClick={() => setActiveTab('services')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'services' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-gray-600'}`}>🤝 Servicios</button>
                )}
                {product.isAsset && (
                    <button onClick={() => setActiveTab('assets')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'assets' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-gray-600'}`}>🌐 Activo P2P</button>
                )}
            </div>
        )}

        {/* CONTENIDO DUAL */}
        <div className="flex-1 p-4 flex flex-col bg-black relative overflow-hidden">
            {!isPaymentProcessed ? (
                <div className="w-full h-full overflow-y-auto">
                    {activeTab === 'products' && (
                        <TerminalShop initialItem={{...product, name: product.productData.name, price: product.productData.price}} onUpdateTotal={setDynamicTotal} />
                    )}
                    {activeTab === 'services' && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <p className="text-cyan-500 uppercase text-[10px] tracking-[0.2em] mb-4">Servicio Seleccionado</p>
                            <h3 className="text-3xl font-black text-white uppercase mb-2">{product.serviceData.name}</h3>
                            <p className="text-gray-500 text-sm max-w-md italic mb-6">"{product.serviceData.desc}"</p>
                            <div className="bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-xl">
                                <p className="text-5xl font-black text-white">{parseFloat(product.serviceData.price).toFixed(2)}€</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'assets' && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <p className="text-blue-500 uppercase text-[10px] tracking-[0.2em] mb-2">Acceso a Datos P2P</p>
                            <p className="text-6xl font-black text-white">{parseFloat(String(product.price).replace('€','')).toFixed(2)}€</p>
                            <p className="mt-4 text-xs text-gray-500">Desbloqueo inmediato tras confirmación.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center animate-zoomIn">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                        <span className="text-4xl text-black">✓</span>
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase mb-2">Pago Verificado</h3>
                    <button onClick={() => onLaunch(product)} className="group relative px-16 py-6 bg-white text-black font-black uppercase hover:bg-cyan-400 transition-all">
                        🚀 LANZAR {product.assetType || 'CONTENIDO'}
                    </button>
                </div>
            )}
        </div>

        {/* FOOTER FINANCIERO */}
        {!isPaymentProcessed && (
            <div className="border-t border-white/10 bg-[#080808] p-4">
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
                            <button key={coin} onClick={() => handleCoinPayment(coin)} className="w-16 py-2 border border-white/10 flex flex-col items-center hover:border-white transition-all">
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