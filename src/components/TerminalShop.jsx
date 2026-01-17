// src/components/TerminalShop.jsx (VERSION BLINDADA FASE 0)

import React, { useState, useEffect } from 'react';

// Función auxiliar para limpiar precios (Evita el error .replace)
const parsePrice = (priceInput) => {
    if (typeof priceInput === 'number') return priceInput; // Si ya es número, perfecto
    if (!priceInput) return 0;
    // Si es texto, quitamos €, espacios y comas
    return parseFloat(String(priceInput).replace('€', '').replace(',', '.').trim()) || 0;
};

const TerminalShop = ({ initialItem, onUpdateTotal }) => {
  const [cart, setCart] = useState({}); // { itemId: quantity }
  
  // Generamos items extra basados en el precio base del creador
  const mainPrice = parsePrice(initialItem.price);
  
  // Productos Mockup dinámicos
  const MOCK_PRODUCTS = [
      { id: 'main', name: initialItem.name || 'Producto Principal', price: mainPrice },
      { id: 'sup1', name: 'Pack Premium', price: parseFloat((mainPrice * 1.5).toFixed(2)) },
      { id: 'sup2', name: 'Merchandising (Camiseta)', price: 15.00 },
      { id: 'sup3', name: 'Pase VIP Digital', price: 5.00 }
  ];

  // Calcular total
  useEffect(() => {
      let total = 0;
      MOCK_PRODUCTS.forEach(p => {
          const qty = cart[p.id] || 0;
          total += p.price * qty;
      });
      // Si no hay nada seleccionado, al menos cobramos el producto principal por defecto (opcional)
      // O le decimos al padre el total real.
      // Para Fase 0: Vamos a pre-seleccionar el producto principal si el carro está vacío
      if (total === 0 && !cart['main']) {
           // No forzamos visualmente, pero enviamos 0 al padre
      }
      onUpdateTotal(total);
  }, [cart, mainPrice]);

  // Pre-seleccionar el producto principal al abrir
  useEffect(() => {
      setCart({ 'main': 1 });
  }, []);

  const updateCart = (id, delta) => {
      setCart(prev => {
          const current = prev[id] || 0;
          const newQty = Math.max(0, current + delta);
          return { ...prev, [id]: newQty };
      });
  };

  return (
    <div className="w-full h-full flex flex-col font-mono text-xs md:text-sm text-green-400 p-2 overflow-y-auto custom-scrollbar">
        
        {/* CABECERA TERMINAL */}
        <div className="border-b border-green-500/30 pb-4 mb-4">
            <p className="text-xs text-green-600 mb-2">Connected to: {initialItem.shopName || 'Unknown_Node'}</p>
            <h1 className="text-xl md:text-2xl font-black text-white bg-green-900/20 p-2 inline-block">
                {initialItem.name}
            </h1>
            <p className="mt-2 text-white">
                PRECIO BASE: <span className="text-yellow-400 font-bold">{mainPrice.toFixed(2)}€</span>
            </p>
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div className="space-y-3 flex-1">
            <div className="grid grid-cols-12 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">
                <div className="col-span-6">Item</div>
                <div className="col-span-3 text-right">Precio</div>
                <div className="col-span-3 text-center">Cant.</div>
            </div>

            {MOCK_PRODUCTS.map((item) => (
                <div key={item.id} className={`grid grid-cols-12 items-center py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${cart[item.id] > 0 ? 'bg-green-900/10' : ''}`}>
                    
                    {/* NOMBRE */}
                    <div className="col-span-6 flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${cart[item.id] > 0 ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-gray-700'}`}></div>
                        <span className={cart[item.id] > 0 ? 'text-white font-bold' : 'text-gray-400'}>
                            {item.name}
                        </span>
                    </div>

                    {/* PRECIO */}
                    <div className="col-span-3 text-right font-mono text-yellow-500">
                        {item.price.toFixed(2)}€
                    </div>

                    {/* CONTROLES */}
                    <div className="col-span-3 flex justify-center items-center gap-3">
                        <button 
                            onClick={() => updateCart(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center border border-green-500/50 hover:bg-green-500 hover:text-black rounded transition-all"
                        >
                            -
                        </button>
                        <span className="w-4 text-center font-bold text-white">{cart[item.id] || 0}</span>
                        <button 
                            onClick={() => updateCart(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center border border-green-500/50 hover:bg-green-500 hover:text-black rounded transition-all"
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* EXTRAS DECORATIVOS */}
        <div className="mt-8 p-4 border border-dashed border-green-500/30 rounded bg-black/40 text-[10px] text-gray-400">
            <p>> SYSTEM: Verificando stock en tiempo real...</p>
            <p>> SYSTEM: Aplicando tarifas de Fase Lunar...</p>
            <p className="animate-pulse">> WAITING_FOR_PAYMENT_CONFIRMATION_</p>
        </div>

    </div>
  );
};

export default TerminalShop;