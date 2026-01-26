// src/components/WebBot.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const WebBot = ({ onSelectAsset, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    
    // Búsqueda en la nueva tabla 'assets'
    const { data, error } = await supabase
      .from('assets')
      .select('*, profiles(alias, is_merchant)')
      .ilike('title', `%${query}%`);

    if (data) setResults(data);
    setIsSearching(false);
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center p-8 font-mono">
      <div className="w-full max-w-4xl border border-blue-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] bg-black">
        
        {/* TERMINAL HEADER */}
        <div className="bg-blue-900/20 border-b border-blue-500/30 p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="text-blue-400 animate-pulse">🌐</span>
                <span className="text-blue-400 font-black text-xs tracking-widest uppercase">WEBBOT P2P TERMINAL v1.0</span>
            </div>
            <button onClick={onClose} className="text-blue-500 hover:text-white text-xs">EXIT_SESSION</button>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="p-6 border-b border-white/5 bg-black">
            <div className="flex gap-4">
                <span className="text-blue-500 text-xl font-bold font-mono">{'>'}</span>
                <input 
                    type="text" 
                    placeholder="BUSCAR ACTIVOS (VIDEOS, GAMES, CURSOS...)" 
                    className="flex-1 bg-transparent border-none outline-none text-blue-400 placeholder-blue-900 text-lg uppercase"
                    value={query}
                    autoFocus
                    onChange={(e) => setQuery(e.target.value)}
                />
                {isSearching && <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
            </div>
        </form>

        {/* RESULTS GRID */}
        <div className="h-[50vh] overflow-y-auto p-4 custom-scrollbar bg-black/50">
            {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => onSelectAsset(item)}
                            className="group border border-white/10 p-4 hover:border-blue-500 cursor-pointer transition-all bg-white/5 flex justify-between items-start"
                        >
                            <div>
                                <span className="text-[8px] text-blue-500 font-bold uppercase block mb-1">TYPE: {item.asset_type}</span>
                                <h3 className="text-white font-black text-sm uppercase">{item.title}</h3>
                                <p className="text-[10px] text-gray-500">PROVIDER: {item.profiles?.alias}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-mono font-black text-blue-400">{item.price_fiat}€</span>
                                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[8px] bg-blue-600 text-white px-2 py-1 rounded">ACCEDER ➔</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <p className="text-blue-500 text-xs font-black uppercase tracking-[0.5em]">Waiting for command...</p>
                </div>
            )}
        </div>

        {/* TERMINAL FOOTER */}
        <div className="p-3 bg-blue-900/10 border-t border-blue-500/20 text-[8px] text-blue-800 font-mono flex justify-between">
            <span>NETWORK: BRO7VISION_CDN_ACTIVE</span>
            <span>ENCRYPTION: AES-256-MOON</span>
        </div>
      </div>
    </div>
  );
};

export default WebBot;