// src/components/NexusDashboard.jsx (BOTONERA DE 8 ELEMENTOS)

import React, { useState, useEffect } from 'react';
import LiveGrid from './LiveGrid';
import WebBotTerminal from './WebBotTerminal'; 
import RacoonTerminal from './RacoonTerminal';
import CommunityTicker from './CommunityTicker'; 

// --- JUEGOS ---
import NeonReact from './NeonReact'; 
import ScalextricPhaser from './ScalextricPhaser'; 
import CosmicQuiz from './CosmicQuiz'; 

const NexusDashboard = ({ 
    onSearch, searchQuery, setSearchQuery, 
    intent, setIntent, 
    onBack, onGameWin, onOpenLog, 
    onSelectShop, onTuneIn, onUserClick 
}) => {
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [selectedGame, setSelectedGame] = useState(null); 
  const [gameDifficulty, setGameDifficulty] = useState('hard');
  const [aiModeType, setAiModeType] = useState('text'); 

  const MOCK_LOGS = ["ENSAYO: IA en artesanía...", "OPINIÓN: Moon Coins...", "HISTORIA: Catedral...", "FUTURO: Bro-Drop y el Campo"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogIndex((prev) => (prev + 1) % MOCK_LOGS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const isGameMode = intent === 'game';
  const isAIMode = intent === 'ai';
  const isLiveMode = intent === 'lives';
  const isWebMode = intent === 'web_search'; 
  const isInternalMode = intent === 'internal_search'; 
  
  const showFeed = !isGameMode && !isAIMode && !isLiveMode && !isWebMode && !isInternalMode;
  const showSearchBar = !isGameMode && !isAIMode && !isLiveMode;

  const handleLogClick = () => {
      onOpenLog({ title: MOCK_LOGS[currentLogIndex], category: "ENSAYO", author: "Editorial_Bot" });
  };

  const getPlaceholder = () => "Busca productos, servicios o lugares...";
  
  // --- LISTA DE 8 BOTONES ---
  const NAV_BUTTONS = [
      // 1. BOTÓN ZONA (NUEVO: Actúa como "Atrás")
      { id: 'zone', label: '📍 ZONA', color: 'border-white text-white hover:bg-white hover:text-black' },
      
      // 2-8. RESTO DE BOTONES
      { id: 'product', label: '📦 Productos', color: 'border-yellow-400 text-yellow-400' },
      { id: 'service', label: '🤝 Servicios', color: 'border-cyan-400 text-cyan-400' },
      { id: 'lives',   label: '📡 Lives',     color: 'border-red-500 text-red-500' }, 
      { id: 'game',    label: '🎮 Games',     color: 'border-fuchsia-500 text-fuchsia-500' },
      { id: 'ai',      label: '🤖 AI',        color: 'border-green-500 text-green-500' },
      { id: 'web_search', label: '🌐 WebBot', color: 'border-blue-400 text-blue-400' },
      { id: 'internal_search', label: '🏠 IN Search', color: 'border-orange-400 text-orange-400' }
  ];

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none">
      
      {/* 2. TWIT FEED */}
      {!isGameMode && !isAIMode && (
          <CommunityTicker onUserClick={onUserClick} />
      )}

      {/* 3. BRO-LOGS */}
      {showFeed && (
          <div onClick={handleLogClick} className="absolute top-[35%] md:top-[15%] w-full max-w-4xl text-center pointer-events-auto cursor-pointer transition-all hover:scale-105 z-30 px-4">
            <div className="bg-black/40 backdrop-blur-md border-y border-cyan-500/30 py-4 px-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                 <p className="text-[10px] md:text-xs text-cyan-400 uppercase tracking-[0.3em] mb-2 animate-pulse">⚡ BRO-LOGS FEED</p>
                 <h2 className="text-xl md:text-3xl text-white font-thin italic tracking-wide animate-fadeIn leading-tight">"{MOCK_LOGS[currentLogIndex]}"</h2>
            </div>
          </div>
      )}

      {/* 4. ZONA JUEGOS */}
      {isGameMode && (
          <div className="absolute top-[20%] bottom-40 md:bottom-[20%] w-full max-w-6xl px-4 pointer-events-auto z-[200] flex items-center justify-center animate-zoomIn">
              {!selectedGame && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl overflow-y-auto max-h-full custom-scrollbar p-2">
                      <div onClick={() => setSelectedGame('neon')} className="group bg-black/80 border border-fuchsia-500/30 p-6 rounded-2xl hover:border-fuchsia-500 hover:bg-fuchsia-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🧠</div>
                          <h3 className="text-xl font-black text-white italic">NEON MEMORY</h3>
                          <div className="px-3 py-1 bg-fuchsia-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>
                      <div onClick={() => { setSelectedGame('racer'); setGameDifficulty('easy'); }} className="group bg-black/80 border border-green-500/30 p-6 rounded-2xl hover:border-green-500 hover:bg-green-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🏎️</div>
                          <h3 className="text-xl font-black text-white italic">F1 ROOKIE</h3>
                          <p className="text-[10px] text-green-400">MODO FÁCIL</p>
                          <div className="px-3 py-1 bg-green-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>
                      <div onClick={() => { setSelectedGame('racer'); setGameDifficulty('hard'); }} className="group bg-black/80 border border-cyan-500/30 p-6 rounded-2xl hover:border-cyan-500 hover:bg-cyan-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🔥</div>
                          <h3 className="text-xl font-black text-white italic">F1 PRO</h3>
                          <p className="text-[10px] text-cyan-400">MODO HARDCORE</p>
                          <div className="px-3 py-1 bg-cyan-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>
                      <div onClick={() => setSelectedGame('quiz')} className="group bg-black/80 border border-purple-500/30 p-6 rounded-2xl hover:border-purple-500 hover:bg-purple-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🌌</div>
                          <h3 className="text-xl font-black text-white italic">COSMIC PORTAL</h3>
                          <div className="px-3 py-1 bg-purple-500 text-black text-[9px] font-bold uppercase rounded-full">10 GEN</div>
                      </div>
                  </div>
              )}
              {selectedGame === 'neon' && <div className="w-full h-full relative flex items-center justify-center"><button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button><div className="w-full max-w-4xl h-[500px] pointer-events-auto"><NeonReact onWin={onGameWin} /></div></div>}
              {selectedGame === 'racer' && <div className="w-full h-full relative flex items-center justify-center"><button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button><div className="w-full md:w-[800px] h-[300px] md:h-[500px] pointer-events-auto"><ScalextricPhaser onWin={onGameWin} difficulty={gameDifficulty} /></div></div>}
              {selectedGame === 'quiz' && <div className="w-full h-full relative flex items-center justify-center"><button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button><div className="w-full md:w-[900px] h-full md:h-[550px] relative shadow-2xl pointer-events-auto"><CosmicQuiz onWin={onGameWin} /></div></div>}
          </div>
      )}

      {/* 5. IA */}
      {isAIMode && (
          <div className="absolute top-[15%] bottom-[25%] w-full max-w-6xl px-4 pointer-events-auto z-50 animate-zoomIn">
              <div className="w-full h-full bg-[#050505]/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-0 font-mono shadow-2xl flex flex-col relative overflow-hidden">
                  <div className="flex border-b border-cyan-500/30 bg-black/50">
                      <button onClick={() => setAiModeType('text')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest ${aiModeType === 'text' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-500'}`}>💬 ASK AI</button>
                      <button onClick={() => setAiModeType('image')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest ${aiModeType === 'image' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-b-2 border-fuchsia-500' : 'text-gray-500'}`}>🖼️ IMAGE GEN</button>
                  </div>
                  <div className="flex-1 p-6 relative">
                      <p className="text-cyan-100 text-lg">"Sistema BRO-AI listo. ¿En qué puedo ayudarte hoy?"</p>
                  </div>
              </div>
          </div>
      )}

      {/* 6. OTROS MODOS */}
      {isLiveMode && <LiveGrid onTuneIn={onTuneIn} onSelectShop={onSelectShop} onUserClick={onUserClick} onClose={() => setIntent('product')} />}
      {isWebMode && <WebBotTerminal />}
      {isInternalMode && (
          <div className="absolute top-[15%] bottom-[25%] w-full max-w-5xl px-4 pointer-events-auto z-50 animate-zoomIn">
             <RacoonTerminal searchQuery={searchQuery} />
          </div>
      )}

      {/* 7. BOTONERA INFERIOR (8 ELEMENTOS) */}
      <div className="absolute bottom-20 md:bottom-6 w-full max-w-5xl px-2 pointer-events-auto flex flex-col gap-2 z-[20000]">
          {/* CAMBIO: grid-cols-4 (Móvil) y md:grid-cols-8 (PC) */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-1 md:gap-3">
              {NAV_BUTTONS.map((opt) => (
                  <button 
                      key={opt.id} 
                      onClick={() => opt.id === 'zone' ? onBack() : setIntent(opt.id)} // LÓGICA ESPECIAL PARA ZONA
                      className={`
                          py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all 
                          ${intent === opt.id && opt.id !== 'zone' 
                             ? `bg-black ${opt.color} scale-105 z-10` 
                             : `bg-black/60 border-white/10 text-gray-500 hover:border-white/50 ${opt.color ? opt.color : ''}`}
                      `}
                  >
                      {opt.label}
                  </button>
              ))}
          </div>
          
          {showSearchBar && (
              <div className="flex items-center bg-black/90 rounded-full border-2 border-white/20 h-12 md:h-16">
                  <span className="pl-4 text-gray-500 text-xl">🔍</span>
                  <input type="text" placeholder={getPlaceholder()} className="w-full bg-transparent text-white px-4 py-2 focus:outline-none font-bold text-sm md:text-lg placeholder-gray-600" onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSearch()} />
                  <button onClick={onSearch} className="mr-1 bg-white text-black px-4 py-2 rounded-full font-black text-xs uppercase">GO</button>
              </div>
          )}
      </div>

    </div>
  );
};

export default NexusDashboard;