// src/components/NexusDashboard.jsx

import React, { useState, useEffect } from 'react';
import Reinos from './Reinos';
import CommunityTicker from './CommunityTicker'; 
import { askGemini } from '../services/gemini';
import { supabase } from '../supabaseClient';


// JUEGOS
import NeonReact from './NeonReact'; 
import ScalextricPhaser from './ScalextricPhaser'; 
import CosmicQuiz from './CosmicQuiz'; 
import SevenGates from './SevenGates';
import CruceDeCaminos from './CruceDeCaminos';
import AtlasGame from './AtlasGame';
import CronosGame from './CronosGame';

const NexusDashboard = ({ 
    intent, setIntent, handleGoToShop,
    onBack, onGameWin, onOpenLog, 
    onSelectShop, onTuneIn, onUserClick,
    items,
    onOpenVideo,
    scope,
    onHoverCard,
    step, 
    setStep,
    session,
    balances,
    setBalances,
    realItems,
    onOpenProjector,
    setProjectingUser,
    sessionCP,
    sessionCity,
    sessionRef,
    onVLChange,
    ososHandoffContext,
  onHandoffConsumed  
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
  const isCardMode = (intent === 'broshop' || intent === 'product' || intent === 'service' || intent === 'lives');


  const handleLogClick = () => { 
      onOpenLog({ title: MOCK_LOGS[currentLogIndex], category: "MERCANTIL", author: "Sistema" }); 
  };
  
  const cityName = scope?.city || "RED GLOBAL";
  const displayCity = cityName === "Detectando..." ? "SINTONIZANDO..." : cityName;
  
  useEffect(() => {
  if (!ososHandoffContext) return;

  // Búsqueda genérica — solo intención, sin comercio específico
  if (ososHandoffContext.intencion && !ososHandoffContext.comercio_especifico) {
    // BroShopAcordeon ya lo maneja con su propio useEffect
    return;
  }

  // Comercio específico — buscar en Supabase y abrir Terminal directo
  if (ososHandoffContext.comercio_especifico) {
    const buscarComercio = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('alias', `%${ososHandoffContext.comercio_especifico}%`)
        .limit(1)
        .maybeSingle();

      if (data) {
        handleGoToShop({
          ...data,
          mapache_prefill: ososHandoffContext.intencion || ''
        });
      }
      onHandoffConsumed?.();
    };
    buscarComercio();
  }
}, [ososHandoffContext]);

   return (
  <div className="absolute inset-0 z-40 flex flex-col items-center justify-start pt-24 pointer-events-none font-mono">
    
{/* --- PANEL LATERAL DERECHO COMPACTO --- */}
{isCardMode && (
  <div className="hidden lg:flex fixed right-20 top-[4%] bottom-8 w-52 flex-col gap-3 z-50 pointer-events-none">
    
    {/* 1. BRO-LOGS arriba (ahora con DATOS REALES) */}
    <div 
      onClick={handleLogClick} 
      className="flex-[0.6] pointer-events-auto cursor-pointer" 
    >
      <div className="
        relative w-full h-full overflow-hidden
        flex flex-col bg-black/80 backdrop-blur-2xl 
        border border-cyan-400/20 rounded-[1.5rem] p-4 
        shadow-[0_0_20px_rgba(34,211,238,0.1)] 
        hover:border-cyan-400/60 transition-all duration-500
      ">
        
        {/* Cabecera */}
        <div className="flex items-center justify-center gap-2 mb-3"> 
            <span className="text-cyan-400 text-xs animate-pulse">⚡</span>
            <p className="text-[8px] text-cyan-400 font-black uppercase tracking-[0.3em]">BRO-LOGS</p>
        </div>

        {/* 
            LÓGICA SEGURA:
            Verificamos si realItems existe y tiene datos. 
            Si tu array de datos se llama de otra forma (ej: 'logs', 'users'), 
            cámbialo aquí en lugar de 'realItems'.
        */}
        {realItems && realItems.length > 0 ? (
          <>
            {/* AVATAR DINÁMICO REAL */}
            <div className="flex justify-center mb-3 shrink-0">
              <div className="w-36 h-48 rounded-xl overflow-hidden border border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.15)] bg-black/50">
                <img 
                  src={realItems[currentLogIndex]?.banner_url} 
                  className="w-full h-full object-cover" 
                  alt="Avatar User" 
                />
              </div>
            </div>
            
             {/* Nombre del usuario */}
  <span className="text-[9px] text-cyan-400/90 font-bold tracking-wider uppercase text-center line-clamp-1 w-full px-2">
    @{realItems[currentLogIndex]?.alias}
  </span>

            {/* --- TEXTO DEL BLOG (CONTENIDO) --- */}
<div className="flex-1 overflow-hidden flex items-center justify-center text-center">
  <p className="text-[16px] leading-snug text-white/70 font-light italic line-clamp-4">
     "{realItems[currentLogIndex]?.editorial_title}" 
  </p>
</div>
          </>
        ) : (
          /* Estado de Carga por si los datos tardan en llegar */
          <div className="flex-1 flex items-center justify-center">
             <span className="text-cyan-400/50 text-xs animate-pulse">Cargando logs...</span>
          </div>
        )}

      </div>
    </div>
    
        {/* 2. COMMUNITY FEED abajo (más grande) - INTACTO */}
    <div className="flex-[0.6] pointer-events-auto"> 
      <CommunityTicker 
        onUserClick={(msg) => {
          const fullUser = realItems.find(item => item.id === msg.id);
          if (fullUser) onOpenVideo(fullUser);
        }} 
      />
    </div>

  </div>
)}

      {/* 4. SECCIÓN DE JUEGOS */}
      {isGameMode && (      
          /* 1. CAJA MÁS GRANDE: Cambiamos top-[16%] a top-[8%] y bottom a [10%] para darle más aire vertical */
          <div className="absolute top-[8%] bottom-32 md:top-[8%] md:bottom-[12%] w-full max-w-6xl px-4 pointer-events-auto z-[200] flex items-center justify-center animate-zoomIn">
              
              {!selectedGame && (
                  /* 2. LIBERTAD TOTAL: Quitamos "overflow-y-auto", "max-h-full" y "custom-scrollbar" para que se expanda solo */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full max-w-4xl p-2">
                      
                      <div onClick={() => setSelectedGame('neon')} className="group bg-black/80 border border-fuchsia-500/30 p-4 md:p-5 rounded-2xl hover:border-fuchsia-500 hover:bg-fuchsia-900/20 cursor-pointer transition-all flex flex-col items-center gap-1.5">
                          <div className="text-3xl md:text-4xl">🧠</div>
                          <h3 className="text-lg md:text-xl font-black text-white italic">NEON MEMORY</h3>
                          <div className="px-3 py-1 bg-fuchsia-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>
                      
                      <div onClick={() => { setSelectedGame('racer'); setGameDifficulty('easy'); }} className="group bg-black/80 border border-green-500/30 p-4 md:p-5 rounded-2xl hover:border-green-500 hover:bg-green-900/20 cursor-pointer transition-all flex flex-col items-center gap-1.5">
                          <div className="text-3xl md:text-4xl">🏎️</div>
                          <h3 className="text-lg md:text-xl font-black text-white italic">F1 ROOKIE</h3>
                          <div className="px-3 py-1 bg-green-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>
                      
                      <div onClick={() => { setSelectedGame('racer'); setGameDifficulty('hard'); }} className="group bg-black/80 border border-cyan-500/30 p-4 md:p-5 rounded-2xl hover:border-cyan-500 hover:bg-cyan-900/20 cursor-pointer transition-all flex flex-col items-center gap-1.5">
                          <div className="text-3xl md:text-4xl">🔥</div>
                          <h3 className="text-lg md:text-xl font-black text-white italic">F1 PRO</h3>
                          <div className="px-3 py-1 bg-cyan-500 text-black text-[9px] font-bold uppercase rounded-full">50 GEN</div>
                      </div>
                      
                      <div onClick={() => setSelectedGame('quiz')} className="group bg-black/80 border border-purple-500/30 p-4 md:p-5 rounded-2xl hover:border-purple-500 hover:bg-purple-900/20 cursor-pointer transition-all flex flex-col items-center gap-1.5">
                          <div className="text-3xl md:text-4xl">🌌</div>
                          <h3 className="text-lg md:text-xl font-black text-white italic">COSMIC PORTAL</h3>
                          <div className="px-3 py-1 bg-purple-500 text-black text-[9px] font-bold uppercase rounded-full">10 GEN</div>
                      </div>
                      
                      <div onClick={() => setSelectedGame('gates')} className="group bg-black/80 border border-yellow-500/30 p-4 md:p-5 rounded-2xl hover:border-yellow-500 hover:bg-yellow-900/20 cursor-pointer transition-all flex flex-col items-center gap-1.5">
                          <div className="text-3xl md:text-4xl">🔓</div>
                          <h3 className="text-lg md:text-xl font-black text-white italic">THE 7 GATES</h3>
                          <div className="px-3 py-1 bg-yellow-500 text-black text-[9px] font-bold uppercase rounded-full">140 GEN</div>
                      </div>
                      
                      <div onClick={() => setSelectedGame('steps')} className="group bg-black/80 border border-indigo-500/30 p-4 md:p-5 rounded-2xl hover:border-indigo-500 hover:bg-indigo-900/20 cursor-pointer transition-all flex flex-col items-center gap-1.5">
                          <div className="text-lg md:text-xl tracking-widest opacity-60">🐓🦈🐜🐧</div>
                          <h3 className="text-lg md:text-xl font-black text-white italic">THERIANS</h3>
                          <div className="px-3 py-1 bg-indigo-500 text-white text-[9px] font-bold uppercase rounded-full">SOCIAL RPG</div>
                      </div>
                      
                      <div onClick={() => setSelectedGame('atlas')} className="group bg-black/80 border border-blue-500/30 p-4 md:p-5 rounded-2xl hover:border-blue-500 hover:bg-blue-900/20 cursor-pointer transition-all flex flex-col items-center gap-1.5">
                          <div className="text-3xl md:text-4xl">☄️</div>
                          <h3 className="text-lg md:text-xl font-black text-white italic">3i-ATLAS</h3>
                          <div className="px-3 py-1 bg-blue-500 text-black text-[9px] font-bold uppercase rounded-full">100 GEN</div>
                      </div>
                      
                      <div onClick={() => setSelectedGame('cronos')} className="group bg-black/80 border border-orange-500/30 p-4 md:p-5 rounded-2xl hover:border-orange-500 hover:bg-orange-900/20 cursor-pointer transition-all flex flex-col items-center gap-1.5">
                         <div className="text-3xl md:text-4xl">😄😡🤪🤬</div>
                         <h3 className="text-lg md:text-xl font-black text-white italic">TELECRONOS</h3>
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
              
    </div>
  );
};

export default NexusDashboard;