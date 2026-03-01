// src/components/NexusDashboard.jsx

import React, { useState, useEffect } from 'react';
import LiveGrid from './LiveGrid';
import RacoonTerminal from './RacoonTerminal';
import CommunityTicker from './CommunityTicker'; 
import { askGemini } from '../services/gemini'; 
import PaginatedDisplay from './PaginatedDisplay'; 
import CityLocationBanner from './CityLocationBanner';

// JUEGOS
import NeonReact from './NeonReact'; 
import ScalextricPhaser from './ScalextricPhaser'; 
import CosmicQuiz from './CosmicQuiz'; 
import SevenGates from './SevenGates';
import CruceDeCaminos from './CruceDeCaminos';
import AtlasGame from './AtlasGame';
import CronosGame from './CronosGame';

const NexusDashboard = ({ 
    onSearch, searchQuery, setSearchQuery, 
    intent, setIntent, 
    onBack, onGameWin, onOpenLog, 
    onSelectShop, onTuneIn, onUserClick,
    items,
    onOpenVideo,
    scope 
}) => {

  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [selectedGame, setSelectedGame] = useState(null); 
  const [gameDifficulty, setGameDifficulty] = useState('hard');
  
  // ESTADOS IA
  const [aiModeType, setAiModeType] = useState('chat');
  const [aiResponse, setAiResponse] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const MAX_DAILY_MSG = 20;

  useEffect(() => {
      const today = new Date().toDateString();
      const storedData = JSON.parse(localStorage.getItem('bro7_ai_usage') || '{}');
      if (storedData.date === today) { setDailyCount(storedData.count); } 
      else { localStorage.setItem('bro7_ai_usage', JSON.stringify({ date: today, count: 0 })); setDailyCount(0); }
  }, []);

  const MOCK_LOGS = ["ENSAYO: IA en artesanía...", "OPINIÓN: Moon Coins...", "HISTORIA: Catedral...", "FUTURO: Bro-Drop y el Campo"];
  
  useEffect(() => {
    const interval = setInterval(() => { setCurrentLogIndex((prev) => (prev + 1) % MOCK_LOGS.length); }, 5000);
    return () => clearInterval(interval);
  }, []);

  // DETECCIÓN DE MODOS
  const isGameMode = intent === 'game';
  const isAIMode = intent === 'ai';
  const isLiveMode = intent === 'lives';
  const isCardMode = (intent === 'broshop' || intent === 'product' || intent === 'service');
  const showSearchBar = !isGameMode && !isAIMode;

  const handleLogClick = () => { 
      onOpenLog({ title: MOCK_LOGS[currentLogIndex], category: "MERCANTIL", author: "Sistema" }); 
  };
  
  const cityName = scope?.city || "RED GLOBAL";
  const displayCity = cityName === "Detectando..." ? "SINTONIZANDO..." : cityName;

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none font-mono">
      
      {/* 1. SECTOR SUPERIOR: FEED DE NOTICIAS */}
      {isCardMode && (
          <div onClick={handleLogClick} className="absolute top-20 md:top-8 w-full max-w-4xl px-4 z-50 pointer-events-auto cursor-pointer animate-slideDown">
            <div className="bg-black/40 backdrop-blur-md border-y border-cyan-500/20 py-3 text-center transition-all hover:scale-105">
                <p className="text-[8px] text-cyan-400 font-black uppercase tracking-[0.4em] mb-1 animate-pulse">⚡ BRO-LOGS FEED</p>
                <h2 className="text-sm md:text-xl text-white font-thin italic tracking-wide">"{MOCK_LOGS[currentLogIndex]}"</h2>
            </div>
          </div>
      )}

      {/* 2. COMMUNITY TICKER */}
      {isAIMode && (
          <div className="absolute top-0 w-full z-30 pointer-events-auto"> 
             <CommunityTicker onUserClick={onUserClick} />
          </div>
      )}

      {/* 3. VÓRTICE DE BURBUJAS (PAGINATED DISPLAY) */}
      {isCardMode && (
        <div className="absolute inset-0 z-40 pointer-events-none animate-zoomIn flex flex-col items-center justify-start pt-48 md:pt-40">
             <PaginatedDisplay 
                items={items} 
                onSelect={onSelectShop} 
                onOpenVideo={onOpenVideo} 
                // CABLE CONECTADO: Aquí faltaba onTuneIn
                onTuneIn={onTuneIn}
             />
        </div>
      )}   

      {/* 4. SECCIÓN DE JUEGOS */}
      {isGameMode && (      
          <div className="absolute top-[5%] bottom-40 md:bottom-[15%] w-full max-w-6xl px-4 pointer-events-auto z-[200] flex items-center justify-center animate-zoomIn">
              {!selectedGame && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl overflow-y-auto max-h-full custom-scrollbar p-2">
                       {/* ... (Tus juegos se mantienen igual) ... */}
                      <div onClick={() => setSelectedGame('neon')} className="group bg-black/80 border border-fuchsia-500/30 p-6 rounded-2xl hover:border-fuchsia-500 hover:bg-fuchsia-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🧠</div>
                          <h3 className="text-xl font-black text-white italic">NEON MEMORY</h3>
                          <div className="px-3 py-1 bg-fuchsia-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>
                      <div onClick={() => { setSelectedGame('racer'); setGameDifficulty('easy'); }} className="group bg-black/80 border border-green-500/30 p-6 rounded-2xl hover:border-green-500 hover:bg-green-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🏎️</div>
                          <h3 className="text-xl font-black text-white italic">F1 ROOKIE</h3>
                          <div className="px-3 py-1 bg-green-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>
                      <div onClick={() => { setSelectedGame('racer'); setGameDifficulty('hard'); }} className="group bg-black/80 border border-cyan-500/30 p-6 rounded-2xl hover:border-cyan-500 hover:bg-cyan-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🔥</div>
                          <h3 className="text-xl font-black text-white italic">F1 PRO</h3>
                          <div className="px-3 py-1 bg-cyan-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>
                      <div onClick={() => setSelectedGame('quiz')} className="group bg-black/80 border border-purple-500/30 p-6 rounded-2xl hover:border-purple-500 hover:bg-purple-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🌌</div>
                          <h3 className="text-xl font-black text-white italic">COSMIC PORTAL</h3>
                          <div className="px-3 py-1 bg-purple-500 text-black text-[9px] font-bold uppercase rounded-full">10 GEN</div>
                      </div>
                      <div onClick={() => setSelectedGame('gates')} className="group bg-black/80 border border-yellow-500/30 p-6 rounded-2xl hover:border-yellow-500 hover:bg-yellow-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🔓</div>
                          <h3 className="text-xl font-black text-white italic">THE 7 GATES</h3>
                          <div className="px-3 py-1 bg-yellow-500 text-black text-[9px] font-bold uppercase rounded-full">140 GEN</div>
                      </div>
                      <div onClick={() => setSelectedGame('steps')} className="group bg-black/80 border border-indigo-500/30 p-6 rounded-2xl hover:border-indigo-500 hover:bg-indigo-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-xl tracking-widest opacity-60">🐓🦈🐜🐧</div>
                          <h3 className="text-xl font-black text-white italic">THERIANS</h3>
                          <div className="px-3 py-1 bg-indigo-500 text-white text-[9px] font-bold uppercase rounded-full">SOCIAL RPG</div>
                      </div>
                      <div onClick={() => setSelectedGame('atlas')} className="group bg-black/80 border border-blue-500/30 p-6 rounded-2xl hover:border-blue-500 hover:bg-blue-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">☄️</div>
                          <h3 className="text-xl font-black text-white italic">3i-ATLAS</h3>
                          <div className="px-3 py-1 bg-blue-500 text-black text-[9px] font-bold uppercase rounded-full">100 GEN</div>
                      </div>
                      <div onClick={() => setSelectedGame('cronos')} className="group bg-black/80 border border-orange-500/30 p-6 rounded-2xl hover:border-orange-500 hover:bg-orange-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                         <div className="text-4xl">😄😡🤪🤬</div>
                         <h3 className="text-xl font-black text-white italic">TELECRONOS</h3>
                         <div className="px-3 py-1 bg-orange-500 text-black text-[9px] font-bold uppercase rounded-full">HASTA 180 GEN</div>
                     </div>
                  </div> 
              )}
                            
              {selectedGame === 'neon' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                      <button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button>
                      <div className="w-full max-w-4xl h-[500px] pointer-events-auto"><NeonReact onWin={onGameWin} /></div>
                  </div>
              )}
              {selectedGame === 'racer' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                      <button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button>
                      <div className="w-full md:w-[800px] h-[300px] md:h-[500px] pointer-events-auto"><ScalextricPhaser onWin={onGameWin} difficulty={gameDifficulty} /></div>
                  </div>
              )}
              {selectedGame === 'quiz' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                      <button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button>
                      <div className="w-full md:w-[900px] h-full md:h-[550px] relative shadow-2xl pointer-events-auto"><CosmicQuiz onWin={onGameWin} /></div>
                  </div>
              )}
              {selectedGame === 'gates' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                      <button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button>
                      <div className="w-full max-w-4xl h-full md:h-[600px] pointer-events-auto shadow-2xl rounded-xl overflow-hidden bg-black border border-yellow-500/30">
                          <SevenGates onWin={(amt) => { onGameWin(amt); setSelectedGame(null); }} onClose={() => setSelectedGame(null)} />
                      </div>
                  </div>
              )}
              {selectedGame === 'steps' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                      <button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button>
                      <div className="w-full max-w-4xl h-full md:h-[600px] pointer-events-auto shadow-2xl rounded-xl overflow-hidden bg-black border border-indigo-500/30">
                          <CruceDeCaminos onWin={(amt) => { onGameWin(amt); setSelectedGame(null); }} onClose={() => setSelectedGame(null)} />
                      </div>
                  </div>
              )}
              {selectedGame === 'atlas' && (
                <div className="w-full h-full relative flex items-center justify-center">
                    <button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button>
                    <div className="w-full max-w-4xl h-full md:h-[600px] pointer-events-auto shadow-2xl rounded-xl overflow-hidden bg-black/60 border border-blue-500/30">
                        <AtlasGame onWin={(amt) => onGameWin(amt)} onClose={() => setSelectedGame(null)} />
                    </div>
                </div>
              )} 
              {selectedGame === 'cronos' && (
                <div className="w-full h-full relative flex items-center justify-center">
                    <button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button>
                    <div className="w-full max-w-4xl h-full md:h-[600px] pointer-events-auto shadow-2xl rounded-xl overflow-hidden bg-black border border-orange-500/30">
                        <CronosGame onWin={(amt) => { onGameWin(amt); setSelectedGame(null); }} onClose={() => setSelectedGame(null)} />
                    </div>
                </div>
              )}       
          </div>
      )}
            
      {/* 5. IA CONECTADA (VERSIÓN LIMPIA: SOLO ORÁCULO + TOOLS) */}
      {isAIMode && (
          <div className="absolute top-[16%] bottom-[20%] w-full max-w-6xl px-4 pointer-events-auto z-50 animate-zoomIn">
              <div className="w-full h-full bg-[#050505]/95 backdrop-blur-xl border-2 border-cyan-500 shadow-[0_0_50px_rgba(34,211,238,0.4)] rounded-2xl p-0 font-mono flex flex-col relative overflow-hidden">
                  
                  {/* HEADER: TÍTULO FIJO */}
                  <div className="flex justify-between items-center bg-black/80 border-b border-white/10 p-4">
                      <div className="flex items-center gap-3">
                          <span className="text-2xl animate-pulse">🦝</span>
                          <div>
                              <h3 className="text-yellow-400 font-black text-sm md:text-base tracking-[0.2em] uppercase">AGENTE MAPACHE</h3>
                              <p className="text-[9px] text-gray-500 font-bold uppercase">LORE KEEPER & GUÍA DE BRO7VISION</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                           <span className={cooldown > 0 ? "text-red-500 animate-pulse font-bold text-xs" : "text-green-500 text-xs font-bold"}>
                               {cooldown > 0 ? `❄️ ENFRIANDO (${cooldown}s)` : '● ONLINE'}
                           </span>
                      </div>
                  </div>

                  {/* BODY: RESPUESTAS */}
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-black via-[#0a1014] to-black">
                        {aiResponse ? (
                            <div className="text-sm md:text-lg leading-relaxed typing-effect font-medium text-fuchsia-100">
                                <span className="font-bold mr-2 text-xl text-fuchsia-500">{'>'}</span>{aiResponse}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-60">
                                <div className="flex gap-4 text-7xl md:text-8xl mb-6 filter drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                                    <span className="animate-bounce">🦝</span>
                                    <span className="text-6xl animate-pulse delay-100">📜</span>
                                </div>
                                <p className="text-yellow-400 tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm font-bold uppercase text-center px-4">
                                    ¿NECESITAS ORIENTACIÓN?
                                </p>
                                <p className="text-white-500 text-[10px] mt-2 uppercase max-w-md text-center">
                                    Pregúntame sobre la historia de Larry, cómo ganar Moon Coins, o los secretos de la Fase 1.
                                </p>
                            </div>
                        )}
                        {isLoadingAI && <div className="mt-4 text-xs animate-pulse font-mono text-fuchsia-400">CONSULTANDO DATOS... ▊▊▊</div>}
                    </div>

                    {/* FOOTER: INPUT + HERRAMIENTAS EXTERNAS */}
                    <div className="p-4 bg-black border-t border-cyan-500/30 flex flex-col gap-2">
                        
                        {/* INPUT */}
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder={cooldown > 0 ? `❄️ RECARGANDO NEURONAS...` : "Hola soy el Agente Mapache. Qué necesitas saber de BROVISION?.Hablamos de Brostories?, BroShop?, Avisos?..."} 
                                disabled={cooldown > 0 || dailyCount >= MAX_DAILY_MSG} 
                                className={`flex-1 bg-[#0a0a0a] border p-4 rounded-xl outline-none transition-all text-yellow-300 font-bold tracking-wide border-cyan-500/50 placeholder-cyan-800 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.4)] ${cooldown > 0 ? 'cursor-not-allowed opacity-50' : ''}`} 
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.target.value;
                                        if(!val) return;
                                        if (cooldown > 0) return;
                                        if (dailyCount >= MAX_DAILY_MSG) { setAiResponse("⛔ CUPO DIARIO AGOTADO. Vuelve mañana."); return; }
                                        
                                        setIsLoadingAI(true); 
                                        setAiResponse(null); 
                                        e.target.value = '';
                                        setCooldown(10); // 10 segundos de cooldown
                                        
                                        // Timer visual
                                        const timer = setInterval(() => { setCooldown((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; }); }, 1000);
                                        
                                        // Guardar uso
                                        const newCount = dailyCount + 1; 
                                        setDailyCount(newCount);
                                        const today = new Date().toDateString(); 
                                        localStorage.setItem('bro7_ai_usage', JSON.stringify({ date: today, count: newCount }));
                                        
                                        // LLAMADA FORZADA A MODO 'oracle'
                                        askGemini(val, 'oracle').then(res => { setAiResponse(res); setIsLoadingAI(false); });
                                    }
                                }} 
                            />
                        </div>
                        
                        {/* INFO CRÉDITOS */}
                        <div className="flex justify-between text-[10px] font-mono uppercase px-2">
                             <span className="text-gray-500">CONEXIÓN SEGURA</span>
                             <span className="text-cyan-500">CRÉDITOS DIARIOS: <span className={dailyCount >= MAX_DAILY_MSG ? "text-red-500 font-black" : "text-white font-bold"}>{MAX_DAILY_MSG - dailyCount}</span> / {MAX_DAILY_MSG}</span>
                        </div>
                        
                        {/* EXTERNAL TOOLS (Accesos Directos) - SE MANTIENEN */}
                        <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-white/5 mt-2">
                             <button onClick={() => window.open('https://aistudio.google.com/', '_blank')} className="flex items-center gap-1 bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:scale-105 transition-all">🛠️ AI STUDIO</button>
                             <button onClick={() => window.open('https://gemini.google.com/', '_blank')} className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-transparent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 hover:scale-105 transition-all">✦ GEMINI AI</button>
                             <button onClick={() => window.open('https://claude.ai/', '_blank')} className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-600 text-white border border-transparent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 hover:scale-105 transition-all">💻 CLAUDE AI</button>
                             <button onClick={() => window.open('https://playground.bfl.ai/image/generate', '_blank')} className="flex items-center gap-1 bg-white text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-fuchsia-400 hover:scale-105 transition-all">⚡ FLUX</button>
                             <button onClick={() => window.open('https://www.meta.ai/', '_blank')} className="flex items-center gap-1 bg-[#0064e0] text-white border border-transparent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-125 hover:scale-105 transition-all">♾️ META</button>
                             <button onClick={() => window.open('https://grok.com/', '_blank')} className="flex items-center gap-1 bg-black border border-white/30 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:scale-105 transition-all">⬛ GROK</button>
                             <button onClick={() => window.open('https://app.reve.com/', '_blank')} className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-transparent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 hover:scale-105 transition-all">🔮 REVE</button>
                             <button onClick={() => window.open('https://www.recraft.ai/', '_blank')} className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-600 text-white border border-transparent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 hover:scale-105 transition-all">🎨 RECRAFT</button>
                        </div>
                    </div>
              </div>
          </div>
      )}      
      {/* 6. MODO RADIO (RADIO GEOLOCALIZADA) */}
      {isLiveMode && (
         <LiveGrid 
            items={items} // CABLE CONECTADO: Aquí faltaba items
            onTuneIn={onTuneIn} 
            onSelectShop={onSelectShop} 
            onUserClick={onUserClick} 
            onClose={() => setIntent('broshop')} 
            onOpenVideo={onOpenVideo} 
         />
      )}
      
      {(intent === 'broshop' || intent === 'lives') && (
        <CityLocationBanner scope={scope} />
      )}
                  
      {/* --- BUSCADOR --- */}
      <div className="absolute bottom-[16%] md:bottom-12 w-full max-w-5xl px-4 pointer-events-auto flex flex-col items-center gap-4 z-[20000]">
        {showSearchBar && (
            <div className="flex items-center bg-black/90 rounded-full border-2 border-white/10 h-10 md:h-16 w-full max-w-3xl shadow-2xl backdrop-blur-md">
                <span className="pl-4 md:pl-6 text-gray-500 text-lg md:text-xl">🔍</span>
                <input type="text" placeholder="Busca en la Red Bro7..." className="w-full bg-transparent text-white px-3 md:px-4 py-1 md:py-2 focus:outline-none font-bold text-xs md:text-lg placeholder-gray-700" onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSearch()} />
                <button onClick={onSearch} className="mr-1 md:mr-2 bg-white text-black px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[9px] md:text-xs uppercase hover:bg-cyan-400 transition-colors shadow-[0_0_15px_white]">GO</button>
            </div>
        )}
      </div>

    </div>
  );
};

export default NexusDashboard;