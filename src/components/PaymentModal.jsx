// src/components/PaymentModal.jsx (VERSION FINAL: FIX CIERRE INESPERADO)

import React, { useState, useEffect } from 'react';
import { MOON_MATRIX, PARITY_VALUE } from '../data/MoonMatrix';
import TerminalShop from './TerminalShop';
import TerminalAssets from './TerminalAssets';

// FUNCIÓN DE LIMPIEZA DE PRECIO
const parsePrice = (input) => {
    if (input === null || input === undefined) return 0;
    if (typeof input === 'number') return input;
    const cleanString = String(input).replace('€', '').replace(',', '.').trim();
    const result = parseFloat(cleanString);
    return isNaN(result) ? 0 : result;
};

const PaymentModal = ({ isOpen, onClose, product, balances, currentPhase, onConfirmPayment, onLaunch }) => {
  if (!isOpen || !product) return null;

  const [assetToPay, setAssetToPay] = useState(product.isAsset ? product : null);

  const getInitialTab = () => {
      if (product.isAsset) return 'assets'; 
      if (product.hasProduct) return 'products';
      if (product.hasService) return 'services';
      return 'assets'; 
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [deliveryMode, setDeliveryMode] = useState('pickup');
  const [dynamicTotal, setDynamicTotal] = useState(0);
  const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);

  useEffect(() => {
      setIsPaymentProcessed(false);
      setAssetToPay(product.isAsset ? product : null);
      setActiveTab(getInitialTab());
      setDynamicTotal(0);
  }, [product]);

  // --- LOGICA DE ESTILOS ---
  const getThemeStyles = (colorString) => {
      let energy = 'cyan'; let matter = 'void';
      if (colorString && colorString.includes('-')) { [energy, matter] = colorString.split('-'); }
      const colors = {
          cyan: 'border-cyan-500 text-cyan-400',
          blue: 'border-blue-500 text-blue-400', 
          fuchsia: 'border-fuchsia-500 text-fuchsia-400',
          green: 'border-green-500 text-green-400',
          yellow: 'border-yellow-400 text-yellow-400',
          orange: 'border-orange-500 text-orange-400',
          red: 'border-red-500 text-red-400',
          gold: 'border-[#C7AF38] text-[#C7AF38]',
          silver: 'border-[#D9D9D9] text-[#D9D9D9]',
          white: 'border-white text-white'
      };
      const style = product.isAsset ? colors.blue : (colors[energy] || colors.cyan);
      return { container: `bg-black border-2 ${style.split(' ')[0]} shadow-2xl`, text: style.split(' ')[1] };
  };
  const theme = getThemeStyles(product.neonColor);

  // --- CÁLCULO DE PRECIOS ---
  const getBasePrice = () => {
      if (activeTab === 'assets' && assetToPay) {
          return parsePrice(assetToPay.price_fiat || assetToPay.price);
      }
      if (activeTab === 'products') return parsePrice(dynamicTotal);
      if (activeTab === 'services') return parsePrice(product.serviceData?.price || product.price);
      return 0;
  };

  const baseFiatVal = getBasePrice();
  const deliveryCost = deliveryMode === 'delivery' ? 2.00 : 0;
  const baseFiatPrice = baseFiatVal + deliveryCost;
  
  const standardCoins = baseFiatPrice / PARITY_VALUE;
  const currentPhaseData = MOON_MATRIX[currentPhase] || MOON_MATRIX['plena'];
  const phaseFiatPrice = (standardCoins * currentPhaseData.OUT) + deliveryCost;

  const handleCoinPayment = (coinKey) => {
      if (activeTab === 'assets' && !assetToPay) return;
      
      const coinsNeeded = Math.ceil(phaseFiatPrice / MOON_MATRIX[coinKey].IN);
      
      // FIX CRÍTICO: Si estamos pagando un activo, aseguramos que tenga la etiqueta isAsset: true
      // Esto evita que App.jsx cierre el modal.
      const itemToProcess = activeTab === 'assets' && assetToPay 
          ? { ...assetToPay, isAsset: true } // <--- LE PONEMOS LA ETIQUETA AQUÍ MISMO
          : product;

      onConfirmPayment(coinKey, coinsNeeded, itemToProcess);
      
      if (activeTab === 'assets') setIsPaymentProcessed(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn font-mono">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      <div className={`relative w-full max-w-5xl h-[85vh] rounded-xl overflow-hidden flex flex-col ${theme.container}`}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-3">
                <img src={product.avatar_url || product.img} className="w-10 h-10 rounded-full border border-white/20 object-cover" alt="av" onError={e=>e.target.src='https://placehold.co/100x100'}/>
                <div>
                    <h2 className={`text-lg font-black uppercase ${theme.text}`}>{product.shopName || 'Unknown'}</h2>
                    {(product.isAsset || assetToPay) && <span className="text-[9px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">🌐 P2P ASSET</span>}
                </div>
            </div>
            {!isPaymentProcessed && <button onClick={onClose} className="text-gray-500 hover:text-white">✕ ESC</button>}
        </div>

        {/* TABS */}
        {!isPaymentProcessed && !product.isAsset && (
            <div className="flex bg-black/60 border-b border-white/5">
                {product.hasProduct && <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 text-[10px] font-bold uppercase ${activeTab === 'products' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}>📦 PRODUCTOS</button>}
                {product.hasService && <button onClick={() => setActiveTab('services')} className={`flex-1 py-3 text-[10px] font-bold uppercase ${activeTab === 'services' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}>🤝 SERVICIOS</button>}
                <button onClick={() => {setActiveTab('assets'); setAssetToPay(null);}} className={`flex-1 py-3 text-[10px] font-bold uppercase ${activeTab === 'assets' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}>🌐 ACTIVOS P2P</button>
            </div>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 overflow-hidden relative bg-black/20">
            {!isPaymentProcessed ? (
                <>
                    {/* VISTA PRODUCTOS */}
                    {activeTab === 'products' && <TerminalShop initialItem={product} onUpdateTotal={setDynamicTotal} />}
                    
                    {/* VISTA SERVICIOS */}
                    {activeTab === 'services' && (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                            <h3 className="text-2xl font-black text-white uppercase mb-2">{product.serviceData?.name || product.name}</h3>
                            <p className="text-gray-400 text-sm italic mb-6">"{product.serviceData?.desc || product.desc}"</p>
                            <div className="text-5xl font-black text-white">{parsePrice(product.serviceData?.price || product.price).toFixed(2)}€</div>
                        </div>
                    )}

                    {/* VISTA ACTIVOS P2P */}
                    {activeTab === 'assets' && (
                        <div className="w-full h-full">
                            {assetToPay ? (
                                // MODO: DETALLE DE UN ACTIVO
                                <div className="h-full flex flex-col items-center justify-center text-center animate-zoomIn relative">
                                    {!product.isAsset && (
                                        <button onClick={() => setAssetToPay(null)} className="absolute top-4 left-4 text-[10px] font-bold text-blue-400 uppercase">❮ VOLVER A LISTA</button>
                                    )}
                                    <span className="text-6xl mb-4">{assetToPay.assetType === 'video' || assetToPay.asset_type === 'video' ? '🎥' : assetToPay.assetType === 'audio' || assetToPay.asset_type === 'audio' ? '🎵' : '📄'}</span>
                                    <h3 className="text-2xl font-black text-white uppercase mb-2">{assetToPay.name || assetToPay.title}</h3>
                                    <p className="text-blue-400 text-[10px] uppercase tracking-widest mb-6">ARCHIVO ENCRIPTADO P2P</p>
                                    <div className="text-5xl font-black text-white">{parsePrice(assetToPay.price_fiat || assetToPay.price).toFixed(2)}€</div>
                                </div>
                            ) : (
                                // MODO: LISTA
                                <TerminalAssets 
                                    ownerId={product.id} 
                                    onSelectAsset={(a) => setAssetToPay({ ...a, isAsset: true })} // <--- FIX: Aseguramos la etiqueta aquí también al seleccionar
                                />
                            )}
                        </div>
                    )}
                </>
            ) : (
                // PANTALLA ÉXITO
                <div className="h-full flex flex-col items-center justify-center animate-fadeIn">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 text-black text-4xl">✓</div>
                    <h3 className="text-2xl font-black text-white uppercase mb-2">ACCESO CONCEDIDO</h3>
                    <p className="text-gray-500 text-xs mb-8">Clave criptográfica transferida.</p>
                    <button onClick={() => onLaunch(assetToPay || product)} className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-cyan-400 transition-all">
                        🚀 ABRIR {(assetToPay || product).assetType || (assetToPay || product).asset_type || 'ARCHIVO'}
                    </button>
                </div>
            )}
        </div>

        {/* FOOTER PAGO */}
        {!isPaymentProcessed && (activeTab !== 'assets' || assetToPay) && (
             <div className="border-t border-white/10 bg-[#080808] p-4">
                <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                    <div className="flex gap-2">
                         <button className="px-3 py-1 bg-white text-black text-[9px] font-bold uppercase">⚡ INSTANT</button>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] text-gray-500 uppercase">TOTAL A PAGAR</p>
                        <p className="text-2xl font-black text-white">{phaseFiatPrice.toFixed(2)}€</p>
                    </div>
                    <div className="flex gap-1">
                        {['nova', 'crescens', 'plena', 'decrescens'].map(coin => {
                            const coinValue = MOON_MATRIX[coin]?.IN || 1;
                            const needed = Math.ceil(phaseFiatPrice / coinValue);
                            return (
                                <button key={coin} onClick={() => handleCoinPayment(coin)} className="w-14 py-2 border border-white/10 flex flex-col items-center hover:bg-white/10">
                                    <span className="text-[7px] text-gray-500 uppercase">{coin}</span>
                                    <span className="text-[10px] font-bold">{isNaN(needed) ? '-' : needed}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default PaymentModal;