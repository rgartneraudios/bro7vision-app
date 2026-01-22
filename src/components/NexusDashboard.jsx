import React, { useState, useEffect } from 'react';
import LiveGrid from './LiveGrid';
import WebBotTerminal from './WebBotTerminal'; 
import RacoonTerminal from './RacoonTerminal';
import CommunityTicker from './CommunityTicker'; 
import { askGemini } from '../services/gemini'; 
import PaginatedDisplay from './PaginatedDisplay'; 

// JUEGOS
import NeonReact from './NeonReact'; 
import ScalextricPhaser from './ScalextricPhaser'; 
import CosmicQuiz from './CosmicQuiz'; 
import SevenGates from './SevenGates';

const NexusDashboard = ({ 
    onSearch, searchQuery, setSearchQuery, 
    intent, setIntent, 
    onBack, onGameWin, onOpenLog, 
    onSelectShop, onTuneIn, onUserClick,
    items 
}) => {
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [selectedGame, setSelectedGame] = useState(null); 
  const [gameDifficulty, setGameDifficulty] = useState('hard');
  
  // ESTADOS IA
  const [aiModeType, setAiModeType] = useState('chat'); // 'chat' (Cyan) o 'oracle' (Fuchsia)
  const [aiResponse, setAiResponse] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
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
  const isCardMode = (intent === 'product' || intent === 'service'); 

  // --- CAMBIO CLAVE AQUI ---
  // Quitamos "!isCardMode". Ahora el Feed se muestra TAMBIÉN cuando hay tarjetas.
  const showFeed = !isGameMode && !isAIMode && !isLiveMode && !isWebMode && !isInternalMode;
  
  const showSearchBar = !isGameMode && !isAIMode && !isLiveMode;

  const handleLogClick = () => { onOpenLog({ title: MOCK_LOGS[currentLogIndex], category: "ENSAYO", author: "Editorial_Bot" }); };
  const getPlaceholder = () => "Busca productos, servicios o lugares...";
  
  const NAV_BUTTONS = [
      { id: 'zone', label: '◀ ATRÁS', color: 'border-white text-white hover:bg-white hover:text-black' },
      { id: 'product', label: '📦 Productos', color: 'border-yellow-400 text-yellow-400' },
      { id: 'service', label: '🤝 Servicios', color: 'border-cyan-400 text-cyan-400' },
      { id: 'lives',   label: '📡 Lives',     color: 'border-red-500 text-red-500' }, 
      { id: 'game',    label: '🎮 Games',     color: 'border-fuchsia-500 text-fuchsia-500' },
      { id: 'ai',      label: '🤖 AI',        color: 'border-cyan-500 text-cyan-500' },
      { id: 'web_search', label: '🌐 WebBot', color: 'border-blue-400 text-blue-400' },
      { id: 'internal_search', label: '🏠 IN Search', color: 'border-orange-400 text-orange-400' }
  ];

  const handleZoneClick = () => {
      if (intent && intent !== 'product') {
          setIntent(null);
      } else if (isCardMode) {
          setIntent(null);
      } else {
          onBack(); 
      }
  };

  const handleGenImage = () => { if (!imagePrompt) return; setIsLoadingImage(true); setGeneratedImage(null); const encoded = encodeURIComponent(imagePrompt); const seed = Math.floor(Math.random() * 10000); const url = `https://pollinations.ai/p/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`; setTimeout(() => { setGeneratedImage(url); }, 1000); };
      
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none">
      
      {/* 2. FEED SUPERIOR (TICKER) */}
      {!isGameMode && !isAIMode && (
          <CommunityTicker onUserClick={onUserClick} />
      )}

      {/* 3. ZONA CENTRAL */}
      
      {/* CASO A: FEED DE TEXTO (Bro-Logs) - SUBIDO AL 20% */}
      {showFeed && (
          <div onClick={handleLogClick} className="absolute top-[20%] md:top-[18%] w-full max-w-4xl text-center pointer-events-auto cursor-pointer transition-all hover:scale-105 z-30 px-4">
            <div className="bg-black/40 backdrop-blur-md border-y border-cyan-500/30 py-4 px-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                 <p className="text-[10px] md:text-xs text-cyan-400 uppercase tracking-[0.3em] mb-2 animate-pulse">⚡ BRO-LOGS FEED</p>
                 <h2 className="text-xl md:text-3xl text-white font-thin italic tracking-wide animate-fadeIn leading-tight">"{MOCK_LOGS[currentLogIndex]}"</h2>
            </div>
          </div>
      )}

      {/* CASO B: TARJETAS (CARDS) - SUBIDO AL 25% (Antes 32%) */}
      {isCardMode && (
          <div className="absolute top-[26%] bottom-[15%] w-full z-50 pointer-events-auto animate-zoomIn">
               <PaginatedDisplay items={items} onSelect={onSelectShop} onTuneIn={onTuneIn} />
          </div>
      )}
     {/* 4. ZONA JUEGOS (RESTAURADOS) */}
      {isGameMode && (      
          <div className="absolute top-[15%] bottom-40 md:bottom-[15%] w-full max-w-6xl px-4 pointer-events-auto z-[200] flex items-center justify-center animate-zoomIn">
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
                      
                      {/* THE 7 GATES */}
		<div onClick={() => setSelectedGame('gates')} className="group bg-black/80 border border-yellow-500/30 p-6 rounded-2xl hover:border-yellow-500 hover:bg-yellow-900/20 cursor-pointer transition-all flex flex-col items-center gap-2"><div className="text-4xl">🔓</div><h3 className="text-xl font-black text-white italic">THE 7 GATES</h3><div className="px-3 py-1 bg-yellow-500 text-black text-[9px] font-bold uppercase rounded-full">140 GEN</div></div>
                  </div>
              )}
                            
              {/* RENDERIZADO DE JUEGOS */}
              {selectedGame === 'neon' && <div className="w-full h-full relative flex items-center justify-center"><button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button><div className="w-full max-w-4xl h-[500px] pointer-events-auto"><NeonReact onWin={onGameWin} /></div></div>}
              {selectedGame === 'racer' && <div className="w-full h-full relative flex items-center justify-center"><button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button><div className="w-full md:w-[800px] h-[300px] md:h-[500px] pointer-events-auto"><ScalextricPhaser onWin={onGameWin} difficulty={gameDifficulty} /></div></div>}
              {selectedGame === 'quiz' && <div className="w-full h-full relative flex items-center justify-center"><button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button><div className="w-full md:w-[900px] h-full md:h-[550px] relative shadow-2xl pointer-events-auto"><CosmicQuiz onWin={onGameWin} /></div></div>}
             {/* SEVEN GATES RENDER */}
{selectedGame === 'gates' && (
    <div className="w-full h-full relative flex items-center justify-center">
        {/* Ahora es igual a los otros: posicionado arriba a la izquierda y con texto MENU */}
        <button 
            onClick={() => setSelectedGame(null)} 
            className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto"
        >
            ❮ MENU
        </button>
        
        <div className="w-full h-full pointer-events-auto shadow-2xl rounded-xl overflow-hidden">
            <SevenGates 
                onWin={(amt) => { onGameWin(amt); setSelectedGame(null); }} 
                onClose={() => setSelectedGame(null)} 
            />
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
                        <button onClick={() => window.open('https://x.com/i/grok', '_blank')} className="flex items-center gap-1 bg-black border border-white/30 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:scale-105 transition-all">
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