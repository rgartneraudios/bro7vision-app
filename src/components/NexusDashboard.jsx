// src/components/NexusDashboard.jsx (VERSIÓN FINAL: TODOS LOS JUEGOS + IA FIXED)

import React, { useState, useEffect } from 'react';
import LiveGrid from './LiveGrid';
import WebBotTerminal from './WebBotTerminal'; 
import RacoonTerminal from './RacoonTerminal';
import CommunityTicker from './CommunityTicker'; 
import { askGemini } from '../services/gemini'; 

// JUEGOS
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
  
  // ESTADOS IA
  const [aiModeType, setAiModeType] = useState('text'); 
  const [aiResponse, setAiResponse] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  // --- NUEVOS ESTADOS DE DEFENSA ---
  const [cooldown, setCooldown] = useState(0); // Tiempo de espera
  const [dailyCount, setDailyCount] = useState(0); // Contador de hoy
  const MAX_DAILY_MSG = 20; // Límite por persona
  
  // --- AL CARGAR: REVISAR LA CARTILLA DE RACIONAMIENTO ---
  useEffect(() => {
      const today = new Date().toDateString(); // Ej: "Mon Jan 19 2026"
      const storedData = JSON.parse(localStorage.getItem('bro7_ai_usage') || '{}');
      
      if (storedData.date === today) {
          setDailyCount(storedData.count);
      } else {
          // Si es un día nuevo, reseteamos a 0
          localStorage.setItem('bro7_ai_usage', JSON.stringify({ date: today, count: 0 }));
          setDailyCount(0);
      }
  }, []);

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
  
  // --- BOTONES ---
  const NAV_BUTTONS = [
      { id: 'zone', label: '📍 ZONA', color: 'border-white text-white hover:bg-white hover:text-black' },
      { id: 'product', label: '📦 Productos', color: 'border-yellow-400 text-yellow-400' },
      { id: 'service', label: '🤝 Servicios', color: 'border-cyan-400 text-cyan-400' },
      { id: 'lives',   label: '📡 Lives',     color: 'border-red-500 text-red-500' }, 
      { id: 'game',    label: '🎮 Games',     color: 'border-fuchsia-500 text-fuchsia-500' },
      { id: 'ai',      label: '🤖 AI',        color: 'border-cyan-500 text-cyan-500' },
      { id: 'web_search', label: '🌐 WebBot', color: 'border-blue-400 text-blue-400' },
      { id: 'internal_search', label: '🏠 IN Search', color: 'border-orange-400 text-orange-400' }
  ];

  // --- GENERACIÓN DE IMAGEN (POLLINATIONS V2) ---
  const handleGenImage = () => {
      if (!imagePrompt) return;
      setIsLoadingImage(true);
      setGeneratedImage(null);
      
      const encoded = encodeURIComponent(imagePrompt);
      const seed = Math.floor(Math.random() * 10000);
      const url = `https://pollinations.ai/p/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`;
      
      setTimeout(() => {
          setGeneratedImage(url);
      }, 1000);
  };
      
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none">
      
      {/* 2. FEED */}
      {!isGameMode && !isAIMode && (
          <CommunityTicker onUserClick={onUserClick} />
      )}

      {/* 3. LOGS */}
      {showFeed && (
          <div onClick={handleLogClick} className="absolute top-[35%] md:top-[15%] w-full max-w-4xl text-center pointer-events-auto cursor-pointer transition-all hover:scale-105 z-30 px-4">
            <div className="bg-black/40 backdrop-blur-md border-y border-cyan-500/30 py-4 px-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                 <p className="text-[10px] md:text-xs text-cyan-400 uppercase tracking-[0.3em] mb-2 animate-pulse">⚡ BRO-LOGS FEED</p>
                 <h2 className="text-xl md:text-3xl text-white font-thin italic tracking-wide animate-fadeIn leading-tight">"{MOCK_LOGS[currentLogIndex]}"</h2>
            </div>
          </div>
      )}

      {/* 4. ZONA JUEGOS (RESTAURADOS) */}
      {isGameMode && (      
          <div className="absolute top-[20%] bottom-40 md:bottom-[20%] w-full max-w-6xl px-4 pointer-events-auto z-[200] flex items-center justify-center animate-zoomIn">
              {!selectedGame && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl overflow-y-auto max-h-full custom-scrollbar p-2">
                      
                      {/* NEON MEMORY */}
                      <div onClick={() => setSelectedGame('neon')} className="group bg-black/80 border border-fuchsia-500/30 p-6 rounded-2xl hover:border-fuchsia-500 hover:bg-fuchsia-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🧠</div>
                          <div className="md:hidden fixed inset-0 z-[99999] bg-black flex-col items-center justify-center text-center p-8 hidden portrait:flex">
                              <div className="text-6xl mb-4 animate-spin-slow">📱</div>
                              <h2 className="text-2xl font-black text-red-500 uppercase mb-2">SISTEMA BLOQUEADO</h2>
                              <p className="text-white text-sm font-mono">GIRA TU DISPOSITIVO ↻</p>
                          </div>
                          <h3 className="text-xl font-black text-white italic">NEON MEMORY</h3>
                          <div className="px-3 py-1 bg-fuchsia-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>

                      {/* F1 ROOKIE (RESTAURADO) */}
                      <div onClick={() => { setSelectedGame('racer'); setGameDifficulty('easy'); }} className="group bg-black/80 border border-green-500/30 p-6 rounded-2xl hover:border-green-500 hover:bg-green-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🏎️</div>
                          <h3 className="text-xl font-black text-white italic">F1 ROOKIE</h3>
                          <p className="text-[10px] text-green-400">MODO FÁCIL</p>
                          <div className="px-3 py-1 bg-green-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>

                      {/* F1 PRO (RESTAURADO) */}
                      <div onClick={() => { setSelectedGame('racer'); setGameDifficulty('hard'); }} className="group bg-black/80 border border-cyan-500/30 p-6 rounded-2xl hover:border-cyan-500 hover:bg-cyan-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🔥</div>
                          <h3 className="text-xl font-black text-white italic">F1 PRO</h3>
                          <p className="text-[10px] text-cyan-400">MODO HARDCORE</p>
                          <div className="px-3 py-1 bg-cyan-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>

                      {/* COSMIC QUIZ */}
                      <div onClick={() => setSelectedGame('quiz')} className="group bg-black/80 border border-purple-500/30 p-6 rounded-2xl hover:border-purple-500 hover:bg-purple-900/20 cursor-pointer transition-all flex flex-col items-center gap-2">
                          <div className="text-4xl">🌌</div>
                          <h3 className="text-xl font-black text-white italic">COSMIC PORTAL</h3>
                          <div className="px-3 py-1 bg-purple-500 text-black text-[9px] font-bold uppercase rounded-full">10 GEN</div>
                      </div>
                  </div>
              )}
              
              {/* RENDERIZADO DE JUEGOS */}
              {selectedGame === 'neon' && <div className="w-full h-full relative flex items-center justify-center"><button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button><div className="w-full max-w-4xl h-[500px] pointer-events-auto"><NeonReact onWin={onGameWin} /></div></div>}
              {selectedGame === 'racer' && <div className="w-full h-full relative flex items-center justify-center"><button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button><div className="w-full md:w-[800px] h-[300px] md:h-[500px] pointer-events-auto"><ScalextricPhaser onWin={onGameWin} difficulty={gameDifficulty} /></div></div>}
              {selectedGame === 'quiz' && <div className="w-full h-full relative flex items-center justify-center"><button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button><div className="w-full md:w-[900px] h-full md:h-[550px] relative shadow-2xl pointer-events-auto"><CosmicQuiz onWin={onGameWin} /></div></div>}
          </div>
      )}

      {/* 5. IA CONECTADA (GEMINI PRO + POLLINATIONS V2 + EXTERNAL LINKS) */}
      {isAIMode && (
          <div className="absolute top-[10%] bottom-[20%] w-full max-w-6xl px-4 pointer-events-auto z-50 animate-zoomIn">
              <div className={`w-full h-full bg-[#050505]/95 backdrop-blur-xl border-2 rounded-2xl p-0 font-mono shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden transition-colors duration-500 ${aiModeType === 'text' ? 'border-cyan-500 shadow-cyan-500/20' : 'border-fuchsia-500 shadow-fuchsia-500/20'}`}>
                  
                  {/* CABECERA */}
                  <div className="flex justify-between items-center bg-black/80 border-b border-white/10 pr-4">
                      <div className="flex flex-1">
                          <button onClick={() => setAiModeType('text')} className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${aiModeType === 'text' ? 'bg-cyan-950/50 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-white'}`}>💬 BRO7VISION-GEMINI-CHAT</button>
                          <button onClick={() => setAiModeType('image')} className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${aiModeType === 'image' ? 'bg-fuchsia-950/50 text-fuchsia-400 border-b-2 border-fuchsia-500' : 'text-gray-500 hover:text-white'}`}>🎨 IMAGEN-GEN</button>
                      </div>
                      <button onClick={() => window.open('https://aistudio.google.com/', '_blank')} className="hidden md:flex items-center gap-2 text-[10px] bg-white/5 border border-white/20 px-3 py-1.5 rounded text-gray-300 hover:text-white transition-all uppercase tracking-wider ml-4"><span>🧠</span> STUDIO ↗</button>
                  </div>

                 {/* --- MODO TEXTO (GEMINI PRO + DEFENSAS + RACCON) --- */}
                  {aiModeType === 'text' && (
                      <>
                        {/* 1. ÁREA DE CHAT / PANTALLA DE ESPERA */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-black via-[#0a1014] to-black">
                            {aiResponse ? (
                                <div className="text-cyan-100 text-sm md:text-lg leading-relaxed typing-effect font-medium">
                                    <span className="text-cyan-500 font-bold mr-2 text-xl">{'>'}</span>{aiResponse}
                                </div>
                            ) : (
                                // PANTALLA DE ESPERA: ROBOT + MAPACHE
                                <div className="h-full flex flex-col items-center justify-center opacity-60">
                                    <div className="flex gap-4 text-7xl md:text-8xl mb-6 filter drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                                        <span className="animate-bounce delay-700">🦝</span>
                                        <span className="animate-pulse">🤖</span>
                                        
                                    </div>
                                    <p className="text-cyan-400 tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm font-bold uppercase text-center px-4">
                                        BRO7VISION <span className="text-white">&</span> GEMINI JUNTOS
                                    </p>
                                </div>
                            )}
                            {isLoadingAI && <div className="mt-4 text-cyan-400 text-xs animate-pulse font-mono">PROCESANDO DATOS... ▊▊▊</div>}
                        </div>

                        {/* 2. INPUT DE TEXTO + BARRA DE CRÉDITOS */}
                        <div className="p-4 bg-black border-t border-cyan-500/30 flex flex-col gap-2">
                            
                            {/* CAMPO DE TEXTO */}
                            <input 
                                type="text" 
                                placeholder={cooldown > 0 ? `❄️ ENFRIANDO SISTEMA (${cooldown}s)...` : "Pregunta al Oráculo..."}
                                disabled={cooldown > 0 || dailyCount >= MAX_DAILY_MSG}
                                className={`
                                    flex-1 bg-[#0a0a0a] border text-cyan-100 p-4 rounded-xl outline-none transition-all placeholder-cyan-900
                                    ${cooldown > 0 ? 'border-red-900/50 cursor-not-allowed opacity-50' : 'border-cyan-900/50 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]'}
                                `}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.target.value;
                                        if(!val) return;

                                        // 🛡️ DEFENSA 1: ENFRIAMIENTO
                                        if (cooldown > 0) return;

                                        // 🛡️ DEFENSA 2: CUPO DIARIO
                                        if (dailyCount >= MAX_DAILY_MSG) {
                                            setAiResponse("⛔ CUPO DIARIO AGOTADO. Vuelve mañana, ciudadano.");
                                            return;
                                        }

                                        // EJECUCIÓN
                                        setIsLoadingAI(true);
                                        setAiResponse(null);
                                        e.target.value = '';

                                        // A. Iniciar Timer
                                        setCooldown(10);
                                        const timer = setInterval(() => {
                                            setCooldown((prev) => {
                                                if (prev <= 1) { clearInterval(timer); return 0; }
                                                return prev - 1;
                                            });
                                        }, 1000);

                                        // B. Actualizar Contador
                                        const newCount = dailyCount + 1;
                                        setDailyCount(newCount);
                                        const today = new Date().toDateString();
                                        localStorage.setItem('bro7_ai_usage', JSON.stringify({ date: today, count: newCount }));

                                        // C. Llamada a Gemini
                                        askGemini(val).then(res => { setAiResponse(res); setIsLoadingAI(false); });
                                    }
                                }}
                            />

                            {/* BARRA DE ESTADO (CRÉDITOS) */}
                            <div className="flex justify-between text-[10px] font-mono uppercase px-2 mt-1">
                                <span className={cooldown > 0 ? "text-red-500 animate-pulse font-bold" : "text-green-500"}>
                                    {cooldown > 0 ? `❄️ RECALENTADO: ${cooldown}s` : '🟢 SISTEMA LISTO'}
                                </span>
                                <span className="text-cyan-600">
                                    CRÉDITOS DIARIOS: <span className={dailyCount >= MAX_DAILY_MSG ? "text-red-500 font-black" : "text-cyan-300 font-bold"}>
                                        {MAX_DAILY_MSG - dailyCount}
                                    </span> / {MAX_DAILY_MSG}
                                </span>
                            </div>

                        </div>
                      </>
                  )}
                  
                  {/* --- MODO IMAGEN (POLLINATIONS v2 + EXTERNOS) --- */}
                  {aiModeType === 'image' && (
                      <>
                        <div className="flex-1 p-4 flex flex-col items-center justify-center relative bg-black/50">
                            {generatedImage ? (
                                <div className="relative w-full h-full flex items-center justify-center group">
                                    <img src={generatedImage} onLoad={() => setIsLoadingImage(false)} className={`max-w-full max-h-full rounded-lg shadow-[0_0_50px_rgba(217,70,239,0.4)] border border-fuchsia-500/30 ${isLoadingImage ? 'opacity-50 blur-sm' : 'opacity-100'}`} alt="Generated" />
                                    {!isLoadingImage && (
                                        <a href={generatedImage} download="bro7_img.png" className="absolute bottom-6 bg-black/90 border border-fuchsia-500 text-fuchsia-400 px-6 py-3 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-fuchsia-600 hover:text-white">⬇ DESCARGAR HD</a>
                                    )}
                                    {isLoadingImage && <div className="absolute text-fuchsia-400 font-mono tracking-widest animate-pulse bg-black/80 px-4 py-2 rounded">RENDERIZANDO...</div>}
                                </div>
                            ) : (
                                <div className="text-center opacity-40">
                                    <div className="text-8xl mb-6 filter drop-shadow-[0_0_15px_magenta]">🎨</div>
                                    <p className="text-fuchsia-500 tracking-[0.5em] text-sm">MOTOR GRÁFICO EN ESPERA</p>
                                </div>
                            )}
                        </div>
                        
                        {/* FOOTER CON ENLACES EXTERNOS (ARSENAL DE 5 MOTORES) */}
                        <div className="bg-black border-t border-fuchsia-500/30 p-4 flex flex-col gap-3">
                            
                            {/* 1. INPUT INTERNO */}
                            <div className="flex gap-2">
                                <input 
                                    type="text" placeholder="Prompt interno..." 
                                    value={imagePrompt}
                                    onChange={(e) => setImagePrompt(e.target.value)}
                                    className="flex-1 bg-[#0a0a0a] border border-fuchsia-900/50 text-fuchsia-100 p-3 rounded-xl focus:border-fuchsia-500 outline-none text-xs"
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenImage()}
                                />
                                <button onClick={handleGenImage} className="bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-500/50 font-bold px-4 rounded-xl hover:bg-fuchsia-500 hover:text-white transition-all text-xs">
                                    PROBAR
                                </button>
                            </div>
                            
                            {/* 2. BOTONES DE ACCESO RÁPIDO (5 MOTORES) */}
                            <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-white/5">
                                
                                {/* 1. FLUX */}
                                <button 
                                    onClick={() => window.open('https://playground.bfl.ai/image/generate', '_blank')}
                                    className="flex items-center gap-1 bg-white text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-fuchsia-400 hover:scale-105 transition-all"
                                >
                                    ⚡ FLUX
                                </button>

                                {/* 2. META */}
                                <button 
                                    onClick={() => window.open('https://www.meta.ai/', '_blank')} 
                                    className="flex items-center gap-1 bg-[#0064e0] text-white border border-transparent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-125 hover:scale-105 transition-all"
                                >
                                    ♾️ META
                                </button>

                                {/* 3. GROK */}
                                <button 
                                    onClick={() => window.open('https://x.com/i/grok', '_blank')} 
                                    className="flex items-center gap-1 bg-black border border-white/30 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:scale-105 transition-all"
                                >
                                    ⬛ GROK
                                </button>

                                {/* 4. REVE (Asignado a Leonardo.ai, cambia la URL si es otra) */}
                                <button 
                                    onClick={() => window.open('https://app.leonardo.ai/', '_blank')} 
                                    className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-transparent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 hover:scale-105 transition-all"
                                >
                                    🔮 REVE
                                </button>

                                {/* 5. RECRAFT */}
                                <button 
                                    onClick={() => window.open('https://www.recraft.ai/', '_blank')} 
                                    className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-600 text-white border border-transparent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 hover:scale-105 transition-all"
                                >
                                    🎨 RECRAFT
                                </button>

                            </div>
                        </div>
                                           </>
                  )}
              </div>
          </div>
      )}
          
      {/* 6. OTROS MODOS */}
      {isLiveMode && <LiveGrid onTuneIn={onTuneIn} onSelectShop={onSelectShop} onUserClick={onUserClick} onClose={() => setIntent('product')} />}
      {isWebMode && <WebBotTerminal />}
      {isInternalMode && <div className="absolute top-[15%] bottom-[25%] w-full max-w-5xl px-4 pointer-events-auto z-50 animate-zoomIn"><RacoonTerminal searchQuery={searchQuery} /></div>}

      {/* 7. BOTONERA INFERIOR (SIN DUPLICAR CLASES) */}
      <div className="absolute bottom-20 md:bottom-6 w-full max-w-5xl px-2 pointer-events-auto flex flex-col gap-2 z-[20000]">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-1 md:gap-3">
              {NAV_BUTTONS.map((opt) => {
                  const isActive = intent === opt.id && opt.id !== 'zone';
                  return (
                      <button 
                          key={opt.id} 
                          onClick={() => opt.id === 'zone' ? onBack() : setIntent(opt.id)}
                          className={`
                              py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all 
                              ${isActive 
                                 ? `bg-black scale-110 z-10 shadow-[0_0_20px_rgba(255,255,255,0.3)] ${opt.color}` 
                                 : `bg-black/60 border-white/10 text-gray-500 hover:border-white/50`
                              }
                              ${opt.id === 'zone' ? 'border-red-500 text-red-500' : ''}
                          `}
                      >
                          {opt.label}
                      </button>
                  );
              })}
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