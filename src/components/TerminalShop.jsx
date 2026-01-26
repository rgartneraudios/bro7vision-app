// src/components/TerminalShop.jsx (VERSION BAZAR / SDK READY)

import React, { useState, useEffect, useMemo } from 'react';

const parsePrice = (priceInput) => {
    if (typeof priceInput === 'number') return priceInput;
    if (!priceInput) return 0;
    return parseFloat(String(priceInput).replace('€', '').replace(',', '.').trim()) || 0;
};

const TerminalShop = ({ initialItem, onUpdateTotal }) => {
  const [cart, setCart] = useState({}); 
  const [searchTerm, setSearchTerm] = useState(""); // Filtro del bazar

  // --- SIMULACIÓN DE INVENTARIO GRANDE (Vía SDK en el futuro) ---
  const mainPrice = parsePrice(initialItem.price);
  
  const INVENTORY = useMemo(() => [
      { id: 'main', name: initialItem.name || 'Producto Base', price: mainPrice, cat: 'PRINCIPAL' },
      { id: 'b1', name: 'Pilas Alcalinas AA (x4)', price: 4.50, cat: 'ELECTRIC' },
      { id: 'b2', name: 'Cable USB-C 2m Neon', price: 8.90, cat: 'ELECTRIC' },
      { id: 'b3', name: 'Arroz Vaporizado 1kg', price: 1.35, cat: 'ALIMENT' },
      { id: 'b4', name: 'Aceite Oliva Virgen 1L', price: 9.50, cat: 'ALIMENT' },
      { id: 'b5', name: 'Cuaderno Cuadriculado A4', price: 2.20, cat: 'BAZAR' },
      { id: 'b6', name: 'Bombilla LED 10W Sky', price: 3.10, cat: 'ELECTRIC' },
      { id: 'b7', name: 'Pack Mascarillas (x10)', price: 1.50, cat: 'SALUD' },
      { id: 'b8', name: 'Agua Mineral 1.5L', price: 0.65, cat: 'ALIMENT' },
  ], [initialItem, mainPrice]);

  // Filtrado en tiempo real
  const filteredProducts = INVENTORY.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular total para el PaymentModal
  useEffect(() => {
      let total = 0;
      INVENTORY.forEach(p => {
          const qty = cart[p.id] || 0;
          total += p.price * qty;
      });
      onUpdateTotal(total);
  }, [cart, INVENTORY, onUpdateTotal]);

  const updateCart = (id, delta) => {
      setCart(prev => {
          const current = prev[id] || 0;
          const newQty = Math.max(0, current + delta);
          return { ...prev, [id]: newQty };
      });
  };

  return (
    <div className="w-full h-full flex flex-col font-mono text-xs text-green-400 p-0 overflow-hidden bg-black">
        
        {/* BARRA DE BÚSQUEDA DEL BAZAR */}
        <div className="p-3 bg-green-950/20 border-b border-green-500/30 flex items-center gap-3">
            <span className="animate-pulse">🔍</span>
            <input 
                type="text" 
                placeholder="BUSCAR EN EL INVENTARIO DEL NODO..."
                className="bg-transparent border-none outline-none text-green-400 placeholder-green-900 w-full uppercase text-[10px] font-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <button onClick={() => setSearchTerm("")} className="text-[10px] hover:text-white">CLEAR</button>}
        </div>

        {/* LISTADO DE PRODUCTOS (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2">
            <div className="grid grid-cols-12 text-[8px] text-green-800 uppercase font-black mb-2 border-b border-green-900/30 pb-1">
                <div className="col-span-1">ID</div>
                <div className="col-span-6">DESCRIPCIÓN</div>
                <div className="col-span-2 text-right">PVP</div>
                <div className="col-span-3 text-center">CANT.</div>
            </div>

            {filteredProducts.map((p) => (
                <div key={p.id} className={`grid grid-cols-12 items-center py-2 border-b border-white/5 hover:bg-green-500/5 transition-colors ${cart[p.id] > 0 ? 'bg-green-500/10' : ''}`}>
                    
                    <div className="col-span-1 text-[8px] text-green-900">#{p.id.toUpperCase()}</div>
                    
                    <div className="col-span-6 flex flex-col">
                        <span className={`font-bold ${cart[p.id] > 0 ? 'text-white' : 'text-green-500'}`}>{p.name}</span>
                        <span className="text-[7px] opacity-40">CAT: {p.cat}</span>
                    </div>

                    <div className="col-span-2 text-right text-yellow-500 font-bold">
                        {p.price.toFixed(2)}€
                    </div>

                    <div className="col-span-3 flex justify-center items-center gap-2">
                        <button onClick={() => updateCart(p.id, -1)} className="w-5 h-5 border border-green-500/30 flex items-center justify-center hover:bg-green-500 hover:text-black rounded">-</button>
                        <span className={`w-4 text-center font-black ${cart[p.id] > 0 ? 'text-white' : 'text-green-900'}`}>{cart[p.id] || 0}</span>
                        <button onClick={() => updateCart(p.id, 1)} className="w-5 h-5 border border-green-500/30 flex items-center justify-center hover:bg-green-500 hover:text-black rounded">+</button>
                    </div>
                </div>
            ))}

            {filteredProducts.length === 0 && (
                <div className="py-10 text-center opacity-30 text-[10px] uppercase tracking-widest">
                    No hay coincidencias en este nodo.
                </div>
            )}
        </div>

        {/* LOGS DEL SISTEMA (FOOTER) */}
        <div className="p-2 bg-black border-t border-green-500/20 text-[8px] text-green-900">
            <p className="flex justify-between">
                <span>ITEMS_MATCH: {filteredProducts.length}</span>
                <span>NODE_STATUS: ONLINE</span>
            </p>
        </div>
    </div>
  );
};

export default TerminalShop;