import React, { useState } from 'react';
import { PACKS_REGALOS, REGLAS_DESCUENTOS } from '../data/MoonMatrix';

const WalletWidget = ({ balances, onClick }) => {
  const [activeTab, setActiveTab] = useState('activos'); // 'activos' | 'vales'

  return (
    <div className="w-full font-mono bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* HEADER */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
        <div>
          <span className="text-[8px] text-cyan-500 font-black tracking-[0.2em]">PUNTOS GÉNESIS</span>
          <div className="text-xl font-black text-white">{balances.genesis || 0}</div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('activos')} className={`text-[9px] px-2 py-1 rounded ${activeTab === 'activos' ? 'bg-cyan-500 text-black' : 'bg-white/10'}`}>ACTIVOS</button>
          <button onClick={() => setActiveTab('vales')} className={`text-[9px] px-2 py-1 rounded ${activeTab === 'vales' ? 'bg-cyan-500 text-black' : 'bg-white/10'}`}>VALES</button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-4 bg-[#0a0a0a]/60">
        {activeTab === 'activos' ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            {['Halos', 'Eco', 'Zap'].map(item => (
              <div key={item} className="bg-black/40 p-2 rounded border border-white/5">
                <div className="text-[8px] text-gray-400">{item}</div>
                <div className="font-bold">{balances[item.toLowerCase()] || 0}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(REGLAS_DESCUENTOS).map(([key, data]) => (
              <div key={key} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/10">
                <span className={`text-[10px] font-bold ${data.color}`}>{data.label} ({data.pct*100}%)</span>
                <span className="text-[10px] text-white">Inv: {balances.vales?.[key] || 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletWidget;