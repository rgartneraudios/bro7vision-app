// src/components/TerminalAssets.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const TerminalAssets = ({ ownerId, onSelectAsset }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!ownerId) return;
      try {
        const { data } = await supabase.from('assets').select('*').eq('owner_id', ownerId);
        if (data) setAssets(data);
      } catch (error) {
        console.error("Error loading assets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [ownerId]);

  return (
    <div className="w-full h-full flex flex-col font-mono text-xs text-blue-400 p-0 bg-black/50">
        <div className="p-3 bg-blue-900/20 border-b border-blue-500/30 flex justify-between items-center">
            <span className="animate-pulse font-black">🌐 P2P_ARCHIVE_ACCESS</span>
            <span className="text-[9px]">FILES: {assets.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2">
            {loading ? <div className="text-center py-10 opacity-50">SCANNING...</div> : 
             assets.length === 0 ? <div className="text-center py-10 opacity-30">NO ASSETS FOUND.</div> : (
                <div className="grid grid-cols-1 gap-2">
                    {assets.map((asset) => (
                        <div key={asset.id} onClick={() => onSelectAsset(asset)} className="group border border-white/5 hover:border-blue-500 bg-white/5 hover:bg-blue-500/10 p-3 rounded cursor-pointer flex justify-between items-center transition-all">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{asset.asset_type === 'video' ? '🎥' : asset.asset_type === 'audio' ? '🎵' : '📄'}</span>
                                <div>
                                    <h4 className="font-bold text-white uppercase group-hover:text-blue-300">{asset.title}</h4>
                                    <p className="text-[8px] text-gray-500">{asset.asset_type}</p>
                                </div>
                            </div>
                            <span className="font-black text-white">{asset.price_fiat}€</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
export default TerminalAssets;