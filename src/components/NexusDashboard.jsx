// src/components/NexusDashboard.jsx

import React, { useState, useEffect } from 'react';
import LiveGrid from './LiveGrid';
import RacoonTerminal from './RacoonTerminal';
import CommunityTicker from './CommunityTicker'; 
import { askGemini } from '../services/gemini'; 
import PaginatedDisplay from './PaginatedDisplay'; 

// JUEGOS
import NeonReact from './NeonReact'; 
import ScalextricPhaser from './ScalextricPhaser'; 
import CosmicQuiz from './CosmicQuiz'; 
import SevenGates from './SevenGates';
import CruceDeCaminos from './CruceDeCaminos';
import AtlasGame from './AtlasGame';

const NexusDashboard = ({ 
    onSearch, searchQuery, setSearchQuery, 
    intent, setIntent, 
    onBack, onGameWin, onOpenLog, 
    onSelectShop, onTuneIn, onUserClick,
    items,
    onOpenVideo
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
  const isWebMode = intent === 'web_search'; 
  const isInternalMode = intent === 'internal_search';
  const isCardMode = (intent === 'broshop' || intent === 'product' || intent === 'service');
  const showFeed = !isGameMode && !isAIMode && !isLiveMode && !isWebMode && !isInternalMode;
  const showSearchBar = !isGameMode && !isAIMode && !isLiveMode && !isWebMode;

  const handleLogClick = () => { onOpenLog({ title: MOCK_LOGS[currentLogIndex], category: "ENSAYO", author: "Editorial_Bot" }); };

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none">
      
      {!isGameMode && !isAIMode && !isWebMode && (
          <div className="absolute top-16 md:top-0 w-full z-30"> 
             <CommunityTicker onUserClick={onUserClick} />
          </div>
      )}

      {/* FEED (Oculto en móvil) */}
      {showFeed && (
          <div onClick={handleLogClick} className="hidden md:flex absolute top-[16%] left-1/2 -translate-x-1/2 w-full max-w-4xl justify-center z-30 px-4">
            <div className="w-full text-center pointer-events-auto cursor-pointer transition-all hover:scale-105">
                <div className="bg-black/40 backdrop-blur-md border-y border-cyan-500/30 py-3 md:py-4 px-6 md:px-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <p className="text-[8px] md:text-xs text-cyan-400 uppercase tracking-[0.3em] mb-1 md:mb-2 animate-pulse">⚡ BRO-LOGS FEED</p>
                    <h2 className="text-lg md:text-3xl text-white font-thin italic tracking-wide animate-fadeIn leading-tight">"{MOCK_LOGS[currentLogIndex]}"</h2>
                </div>
            </div>
          </div>
      )}

      {/* --- FIX 1: TARJETAS (LIMITADAS VERTICALMENTE) --- */}
      {/* top-[14%] para separarlas un poco del ticker */}
      {/* bottom-[28%] ahora pueden bajar más porque el buscador se quitó de en medio */}
      {isCardMode && (
          <div className="absolute top-[14%] md:top-[22%] bottom-[28%] md:bottom-[20%] w-full z-50 pointer-events-auto animate-zoomIn">
               <PaginatedDisplay items={items} onSelect={onSelectShop} onTuneIn={onTuneIn} onOpenVideo={onOpenVideo} />
          </div>
                )}            
     
      {/* ... (SECCIÓN DE JUEGOS Y AI - SIN CAMBIOS) ... */}
      {isGameMode && (      
          <div className="absolute top-[5%] bottom-40 md:bottom-[15%] w-full max-w-6xl px-4 pointer-events-auto z-[200] flex items-center justify-center animate-zoomIn">
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
                          <div className="text-xl tracking-widest opacity-60">👺🦊🙏🐧</div>
                          <h3 className="text-xl font-black text-white italic">Cruce Caminos</h3>
                          <div className="px-3 py-1 bg-indigo-500 text-white text-[9px] font-bold uppercase rounded-full">SOCIAL RPG</div>
                      </div>
                      <div onClick={() => setSelectedGame('atlas')} className="group bg-black/80 border border-blue-500/30 p-6 rounded-2xl hover:border-blue-500 hover:bg-blue-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">☄️</div>
                          <h3 className="text-xl font-black text-white italic">3i-ATLAS</h3>
                          <div className="px-3 py-1 bg-blue-500 text-black text-[9px] font-bold uppercase rounded-full">100 GEN</div>
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
          </div>
      )}
            
      {/* 5. IA CONECTADA (GEMINI PRO + AGENTE MAPACHE + EXTERNAL LINKS) */}
{isAIMode && (
  <div className="absolute top-[10%] bottom-[20%] w-full max-w-6xl px-4 pointer-events-auto z-50 animate-zoomIn">
      <div className={`w-full h-full bg-[#050505]/95 backdrop-blur-xl border-2 rounded-2xl p-0 font-mono shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden transition-colors duration-500 ${aiModeType === 'chat' ? 'border-cyan-500 shadow-cyan-500/20' : 'border-fuchsia-500 shadow-fuchsia-500/20'}`}>
          
          {/* CABECERA DE PESTAÑAS */}
          <div className="flex justify-between items-center bg-black/80 border-b border-white/10">
              <div className="flex flex-1">
                  {/* PESTAÑA 1: CHAT GENERAL */}
                  <button onClick={() => setAiModeType('chat')} className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${aiModeType === 'chat' ? 'bg-cyan-950/50 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-white'}`}>
                      💬 BRO7VISION-GEMINI-CHAT
                  </button>
                  
                  {/* PESTAÑA 2: AGENTE MAPACHE (ORÁCULO) */}
                  <button onClick={() => setAiModeType('oracle')} className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${aiModeType === 'oracle' ? 'bg-fuchsia-950/50 text-fuchsia-400 border-b-2 border-fuchsia-500' : 'text-gray-500 hover:text-white'}`}>
                      🦝 AGENTE MAPACHE
                  </button>
              </div>
          </div>

          {/* ÁREA DE CONTENIDO */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-black via-[#0a1014] to-black">
                {/* RESPUESTA AI */}
                {aiResponse ? (
                    <div className={`text-sm md:text-lg leading-relaxed typing-effect font-medium ${aiModeType === 'chat' ? 'text-cyan-100' : 'text-fuchsia-100'}`}>
                        <span className={`font-bold mr-2 text-xl ${aiModeType === 'chat' ? 'text-cyan-500' : 'text-fuchsia-500'}`}>{'>'}</span>
                        {aiResponse}
                    </div>
                ) : (
                    // PANTALLA DE ESPERA (VISUALES)
                    <div className="h-full flex flex-col items-center justify-center opacity-60">
                        {aiModeType === 'chat' ? (
                            /* MODO CHAT: MAPACHE + ROBOT */
                            <>
                                <div className="flex gap-4 text-7xl md:text-8xl mb-6 filter drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                                    <span className="animate-bounce delay-700">🦝</span>
                                    <span className="animate-pulse">🤖</span>
                                </div>
                                <p className="text-cyan-400 tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm font-bold uppercase text-center px-4">
                                    BROVISION <span className="text-white">&</span> GEMINI JUNTOS
                                </p>
                            </>
                        ) : (
                            /* MODO ORÁCULO: SOLO MAPACHE CON DOCUMENTOS */
                            <>
                                <div className="flex gap-4 text-7xl md:text-8xl mb-6 filter drop-shadow-[0_0_20px_rgba(217,70,239,0.6)]">
                                    <span className="animate-bounce">🦝</span>
                                    <span className="text-6xl animate-pulse">📜</span>
                                </div>
                                <p className="text-fuchsia-400 tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm font-bold uppercase text-center px-4">
                                    EL MAPACHE TE INFORMA
                                </p>
                                <p className="text-gray-500 text-[10px] mt-2 uppercase">SOBRE BRO7VISION, MOON COINS Y LARRY</p>
                            </>
                        )}
                    </div>
                )}
                {isLoadingAI && <div className={`mt-4 text-xs animate-pulse font-mono ${aiModeType === 'chat' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>PROCESANDO DATOS... ▊▊▊</div>}
            </div>

            {/* INPUT DE TEXTO + BARRA DE CRÉDITOS (COMPARTIDA) */}
            <div className={`p-4 bg-black border-t flex flex-col gap-2 ${aiModeType === 'chat' ? 'border-cyan-500/30' : 'border-fuchsia-500/30'}`}>
                
                <input 
                    type="text" 
                    placeholder={cooldown > 0 ? `❄️ ENFRIANDO (${cooldown}s)...` : (aiModeType === 'chat' ? "Habla con Tars & Mapache..." : "Pregunta al Agente Mapache...")}
                    disabled={cooldown > 0 || dailyCount >= MAX_DAILY_MSG}
                    className={`
                        flex-1 bg-[#0a0a0a] border p-4 rounded-xl outline-none transition-all 
                        ${aiModeType === 'chat' 
                            ? 'text-cyan-100 border-cyan-900/50 placeholder-cyan-900 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                            : 'text-fuchsia-100 border-fuchsia-900/50 placeholder-fuchsia-900 focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(217,70,239,0.2)]'
                        }
                        ${cooldown > 0 ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = e.target.value;
                            if(!val) return;
                            if (cooldown > 0) return;
                            
                            // LIMITADOR DE CRÉDITOS
                            if (dailyCount >= MAX_DAILY_MSG) {
                                setAiResponse("⛔ CUPO DIARIO AGOTADO. Vuelve mañana, ciudadano.");
                                return;
                            }

                            setIsLoadingAI(true);
                            setAiResponse(null);
                            e.target.value = '';

                            // Timer Logic
                            setCooldown(10);
                            const timer = setInterval(() => {
                                setCooldown((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
                            }, 1000);
                            
                            // CONTADOR COMPARTIDO (INCREMENTA SIEMPRE)
                            const newCount = dailyCount + 1;
                            setDailyCount(newCount);
                            const today = new Date().toDateString();
                            localStorage.setItem('bro7_ai_usage', JSON.stringify({ date: today, count: newCount }));

                            // LLAMADA A LA API
                            askGemini(val, aiModeType).then(res => { setAiResponse(res); setIsLoadingAI(false); });
                        }
                    }}
                />

                {/* --- BARRA DE ESTADO (CRÉDITOS RESTANTES) --- */}
                <div className="flex justify-between text-[10px] font-mono uppercase px-2 mt-1">
                    <span className={cooldown > 0 ? "text-red-500 animate-pulse font-bold" : "text-gray-500"}>
                        {cooldown > 0 ? `❄️ RECALENTADO: ${cooldown}s` : (aiModeType === 'chat' ? '🟢 SISTEMA ONLINE' : '🟣 AGENTE ONLINE')}
                    </span>
                    <span className={aiModeType === 'chat' ? "text-cyan-600" : "text-fuchsia-600"}>
                        CRÉDITOS DIARIOS: <span className={dailyCount >= MAX_DAILY_MSG ? "text-red-500 font-black" : "text-white font-bold"}>
                            {MAX_DAILY_MSG - dailyCount}
                        </span> / {MAX_DAILY_MSG}
                    </span>
                </div>
                
                {/* FOOTER EXTERNO (SOLO EN MODO CHAT) */}
                {aiModeType === 'chat' && (
                    <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-white/5 mt-2">
                        {/* GOOGLE AI STUDIO */}
                        <button onClick={() => window.open('https://aistudio.google.com/', '_blank')} className="flex items-center gap-1 bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:scale-105 transition-all">
                            🧠 AI STUDIO
                        </button>
                        {/* FLUX */}
                        <button onClick={() => window.open('https://playground.bfl.ai/image/generate', '_blank')} className="flex items-center gap-1 bg-white text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-fuchsia-400 hover:scale-105 transition-all">
                            ⚡ FLUX
                        </button>
                        {/* META */}
                        <button onClick={() => window.open('https://www.meta.ai/', '_blank')} className="flex items-center gap-1 bg-[#0064e0] text-white border border-transparent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-125 hover:scale-105 transition-all">
                            ♾️ META
                        </button>
                        {/* GROK */}
                        <button onClick={() => window.open('https://grok.com/', '_blank')} className="flex items-center gap-1 bg-black border border-white/30 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:scale-105 transition-all">
                            ⬛ GROK
                        </button>
                        {/* REVE */}
                        <button onClick={() => window.open('https://app.reve.com/', '_blank')} className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-transparent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 hover:scale-105 transition-all">
                            🔮 REVE
                        </button>
                        {/* RECRAFT */}
                        <button onClick={() => window.open('https://www.recraft.ai/', '_blank')} className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-600 text-white border border-transparent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 hover:scale-105 transition-all">
                            🎨 RECRAFT
                        </button>
                    </div>
                )}
            </div>
        </div>
  </div>
)}          
      {/* 6. OTROS MODOS */}
      {isLiveMode && <LiveGrid onTuneIn={onTuneIn} onSelectShop={onSelectShop} onUserClick={onUserClick} onClose={() => setIntent('product')} onOpenVideo={onOpenVideo} />}
      
      {/* --- FIX 2: BUSCADOR EN EL 24% INFERIOR (ENTRE TARJETAS Y BOTONERA) --- */}
      <div className="absolute bottom-[24%] md:bottom-32 w-full max-w-5xl px-4 pointer-events-auto flex flex-col items-center gap-4 z-[20000]">
        {showSearchBar && (
            <div className="flex items-center bg-black/90 rounded-full border-2 border-white/10 h-10 md:h-16 w-full max-w-3xl shadow-2xl">
                <span className="pl-4 md:pl-6 text-gray-500 text-lg md:text-xl">🔍</span>
                <input type="text" placeholder="Busca en la Red Bro7..." className="w-full bg-transparent text-white px-3 md:px-4 py-1 md:py-2 focus:outline-none font-bold text-xs md:text-lg placeholder-gray-700" onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSearch()} />
                <button onClick={onSearch} className="mr-1 md:mr-2 bg-white text-black px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[9px] md:text-xs uppercase hover:bg-cyan-400 transition-colors">GO</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default NexusDashboard;