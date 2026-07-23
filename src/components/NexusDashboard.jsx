// src/components/NexusDashboard.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// JUEGOS
import NeonReact from './Games/NeonReact'; 
import ScalextricPhaser from './Games/ScalextricPhaser'; 
import CosmicQuiz from './Games/CosmicQuiz'; 
import SevenGates from './Games/SevenGates';
import Therians from './Games/Therians';
import AtlasGame from './Games/AtlasGame';
import Telecronos from './Games/Telecronos';

const NexusDashboard = ({ 
    intent, setIntent, handleGoToShop,
    onGameWin,
    scope,
    session,
    ososHandoffContext,
    onHandoffConsumed  
}) => {

  const [selectedGame, setSelectedGame] = useState(null); 
  const [gameDifficulty, setGameDifficulty] = useState('hard');

  // DETECCIÓN DE MODOS
  const isGameMode = intent === 'games';
  
  const cityName = scope?.city || "RED GLOBAL";
  const displayCity = cityName === "Detectando..." ? "SINTONIZANDO..." : cityName;
  
  useEffect(() => {
    if (!ososHandoffContext) return;

    if (ososHandoffContext.intencion && !ososHandoffContext.comercio_especifico) {
      return;
    }

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

      {/* SECCIÓN DE JUEGOS */}
      {isGameMode && (      
        <div className="absolute top-[8%] bottom-32 md:top-[8%] md:bottom-[12%] w-full max-w-6xl px-4 pointer-events-auto z-[200] flex items-center justify-center animate-zoomIn">
          
          {!selectedGame && (
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
              <div className="w-full md:w-[900px] h-full md:h-[550px] relative shadow-2xl pointer-events-auto"><CosmicQuiz onWin={onGameWin} scope={scope} /></div>
            </div>
          )}
          {selectedGame === 'gates' && (
            <div className="w-full h-full relative flex items-center justify-center">
              <button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button>
              <div className="w-full max-w-4xl h-full md:h-[600px] pointer-events-auto shadow-2xl rounded-xl overflow-hidden bg-black border border-yellow-500/30">
                <SevenGates onWin={(amt) => { onGameWin(amt); setSelectedGame(null); }} onClose={() => setSelectedGame(null)} scope={scope} />
              </div>
            </div>
          )}
          {selectedGame === 'steps' && (
            <div className="w-full h-full relative flex items-center justify-center">
              <button onClick={() => setSelectedGame(null)} className="absolute -top-8 left-0 text-white font-bold uppercase text-xs z-50 pointer-events-auto">❮ MENU</button>
              <div className="w-full max-w-4xl h-full md:h-[600px] pointer-events-auto shadow-2xl rounded-xl overflow-hidden bg-black border border-indigo-500/30">
                <Therians onWin={(amt) => { onGameWin(amt); setSelectedGame(null); }} onClose={() => setSelectedGame(null)} />
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
                <Telecronos onWin={(amt) => { onGameWin(amt); setSelectedGame(null); }} onClose={() => setSelectedGame(null)} />
              </div>
            </div>
          )}       
        </div>
      )}
    </div>
  );
};

export default NexusDashboard;
