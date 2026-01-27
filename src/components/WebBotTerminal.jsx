// src/components/WebBotTerminal.jsx (VERSION FINAL: CONECTADA)
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const WebBotTerminal = ({ onClose, onSelectAsset }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    
    // Buscamos en la tabla assets por título
    const { data, error } = await supabase
      .from('assets')
      .select('*, profiles(alias)') // Traemos también el alias del dueño
      .ilike('title', `%${query}%`);

    if (data) setResults(data);
    setIsSearching(false);
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8 font-mono animate-fadeIn">
      <div className="w-full max-w-4xl border border-blue-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] bg-black flex flex-col h-[70vh]">
        
        {/* TERMINAL HEADER */}
        <div className="bg-blue-900/20 border-b border-blue-500/30 p-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
                <span className="text-blue-400 animate-pulse">🌐</span>
                <span className="text-blue-400 font-black text-xs tracking-widest uppercase">WEBBOT P2P TERMINAL v2.0</span>
            </div>
            <button onClick={onClose} className="text-blue-500 hover:text-white text-xs font-bold uppercase">[ EXIT_SESSION ]</button>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="p-6 border-b border-white/5 bg-black shrink-0">
            <div className="flex gap-4 items-center">
                <span className="text-blue-500 text-xl font-bold font-mono">{'>'}</span>
                <input 
                    type="text" 
                    placeholder="SEARCH ASSETS (VIDEO, AUDIO, DATA...)" 
                    className="flex-1 bg-transparent border-none outline-none text-blue-400 placeholder-blue-900/50 text-lg uppercase font-bold"
                    value={query}
                    autoFocus
                    onChange={(e) => setQuery(e.target.value)}
                />
                {isSearching && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
            </div>
        </form>

        {/* RESULTS GRID */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/50">
            {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((item) => (
                        <div 
                            key={item.id} 
                            // AQUI ESTA LA CLAVE: Al hacer clic, llamamos a onSelectAsset
                            onClick={() => onSelectAsset(item)}
                            className="group border border-white/10 p-4 hover:border-blue-500 cursor-pointer transition-all bg-white/5 flex justify-between items-center rounded-lg hover:bg-blue-500/10"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl bg-black p-2 rounded border border-white/10">
                                    {item.asset_type === 'video' ? '🎥' : item.asset_type === 'audio' ? '🎵' : item.asset_type === 'game' ? '🎮' : '📄'}
                                </span>
                                <div>
                                    <span className="text-[9px] text-blue-500 font-bold uppercase block mb-0.5 tracking-wider">{item.asset_type} NODE</span>
                                    <h3 className="text-white font-black text-sm uppercase group-hover:text-blue-300 transition-colors">{item.title}</h3>
                                    <p className="text-[9px] text-gray-500 mt-1">SOURCE: {item.profiles?.alias || 'ANON'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-mono font-black text-white block">{item.price_fiat}€</span>
                                <span className="text-[8px] bg-blue-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold mt-1 inline-block">ACCEDER ➔</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                    <p className="text-blue-500 text-4xl mb-4">☠</p>
                    <p className="text-blue-500 text-xs font-black uppercase tracking-[0.5em]">NO SIGNAL...</p>
                </div>
            )}
        </div>

        {/* TERMINAL FOOTER */}
        <div className="p-2 bg-blue-900/10 border-t border-blue-500/20 text-[8px] text-blue-800 font-mono flex justify-between shrink-0">
            <span>NETWORK: BRO7VISION_CDN_ACTIVE</span>
            <span>RESULTS: {results.length}</span>
        </div>
      </div>
    </div>
  );
};

export default WebBotTerminal;