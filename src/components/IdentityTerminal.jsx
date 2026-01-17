// src/components/IdentityTerminal.jsx (FIX ID CORTO + IMAGEN)

import React, { useState } from 'react';

const IdentityTerminal = ({ user, onClose, onOpenLog }) => { 
  const [activeTab, setActiveTab] = useState('manual'); 

  const MOCK_TOP_20 = [
      { title: 'Ensayo: "La Caída del Bitcoin"', author: 'Satoshi_V2' },
      { title: 'Podcast: Cyberpunk History', author: 'Neo_Radio' },
      { title: 'Track: Neon Tears', author: 'Suno AI' }
  ];

  const manualList = (user.top_20 && user.top_20.length > 0) ? user.top_20 : MOCK_TOP_20;
  const userLogs = user.logs || []; 

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-[#080508] border border-fuchsia-500/30 rounded shadow-[0_0_50px_rgba(217,70,239,0.15)] flex flex-col font-mono text-sm overflow-hidden min-h-[450px]">
         
         {/* HEADER ID */}
         <div className="p-4 border-b border-white/10 bg-black flex gap-4 items-center">
             
             {/* CAMBIO: PRIORIDAD A avatar_url SOBRE img */}
             <img 
                src={user.avatar_url || user.img || 'https://via.placeholder.com/150'} 
                referrerPolicy="no-referrer"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=NO+IMG'; }}
                className="w-16 h-16 rounded-full border-2 border-fuchsia-500 object-cover" 
                alt="Avatar"
             />
             
             <div className="flex-1">
                 {/* Nombre del Usuario (Alias) */}
                 <h2 className="text-xl font-bold text-white uppercase">{user.alias || user.user || 'Unknown'}</h2>
                 
                 {/* CAMBIO 2: ID CORTO Y ELEGANTE */}
                 <p className="text-xs text-fuchsia-400 font-mono mt-1">
                    ID: <span className="text-white">{user.id ? user.id.substring(0, 8).toUpperCase() : 'ERR'}</span> • 
                    <span className="text-green-500 ml-1">VERIFIED HUMAN</span>
                 </p>

                 <div className="mt-2 flex gap-2">
                     <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-gray-400">LVL 5</span>
                     <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-gray-400">REP: 98%</span>
                 </div>
             </div>
             <button onClick={onClose} className="text-gray-500 hover:text-white px-2">X</button>
         </div>

         {/* TABS */}
         <div className="flex border-b border-white/10 bg-black/50">
             <button onClick={() => setActiveTab('logs')} className={`flex-1 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-yellow-900/20 text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-600 hover:text-white'}`}>⚡ MY LOGS</button>
             <button onClick={() => setActiveTab('manual')} className={`flex-1 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-cyan-900/20 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-600 hover:text-white'}`}>🔒 TOP 20</button>
             <button onClick={() => setActiveTab('auto')} className={`flex-1 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'auto' ? 'bg-fuchsia-900/20 text-fuchsia-400 border-b-2 border-fuchsia-500' : 'text-gray-600 hover:text-white'}`}>📊 STATS</button>
         </div>

         {/* CONTENT LIST */}
         <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-black/50">
             
             {/* PESTAÑA 1: LOGS */}
             {activeTab === 'logs' && (
                 <div className="space-y-2">
                     <p className="text-[10px] text-gray-500 mb-4 uppercase">Publicaciones Activas (72h TTL)</p>
                     {userLogs.length > 0 ? userLogs.map((log, i) => (
                         <div key={i} onClick={() => onOpenLog({ title: log.title, category: "BRO-LOG", author: user.alias, content: log.content })} className="flex items-center gap-3 hover:bg-white/10 p-3 rounded cursor-pointer transition-colors group border border-transparent hover:border-yellow-500/30">
                             <span className="text-yellow-500 text-lg">📝</span>
                             <div className="flex-1">
                                <p className="text-white text-sm font-bold group-hover:text-yellow-400 transition-colors">{log.title || 'Sin Título'}</p>
                                <p className="text-[10px] text-gray-500">ENSAYO</p>
                             </div>
                             <span className="text-gray-600 text-xs">LEER ↗</span>
                         </div>
                     )) : (
                         <div className="text-center text-gray-600 py-10 italic">No hay publicaciones activas.</div>
                     )}
                 </div>
             )}

             {/* PESTAÑA 2: TOP 20 */}
             {activeTab === 'manual' && (
                 <div className="space-y-2">
                     <p className="text-[10px] text-gray-500 mb-4 uppercase flex justify-between"><span>Curado por {user.alias}</span><span className="text-cyan-500">🔒 LOCKED 7 DAYS</span></p>
                     {manualList.map((item, i) => (
                         <div key={i} onClick={() => onOpenLog({ title: item.title, category: "RECOMENDADO", author: item.author })} className="flex items-center gap-3 hover:bg-white/10 p-2 rounded cursor-pointer transition-colors group border border-transparent hover:border-cyan-500/30">
                             <span className="text-cyan-600 font-bold w-4">{i+1}.</span>
                             <div className="flex-1">
                                <p className="text-white text-sm group-hover:text-cyan-400 transition-colors">{item.title}</p>
                                <p className="text-[10px] text-gray-500">{item.author}</p>
                             </div>
                             <span className="text-gray-600 text-xs">↗</span>
                         </div>
                     ))}
                 </div>
             )}

             {/* PESTAÑA 3: STATS */}
             {activeTab === 'auto' && (
                 <div className="space-y-3">
                     <p className="text-[10px] text-gray-500 mb-4 uppercase">Generado por Algoritmo (Últimos 7 días)</p>
                     {[1,2,3].map(i => (
                         <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                             <span className="text-gray-300">Channel: Cyberpunk Radio</span>
                             <span className="text-fuchsia-500 text-xs">45h listened</span>
                         </div>
                     ))}
                 </div>
             )}

         </div>

      </div>
    </div>
  );
};

export default IdentityTerminal;