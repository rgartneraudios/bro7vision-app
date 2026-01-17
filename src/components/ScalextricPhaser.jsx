import React, { useMemo, useState, useRef, useEffect } from 'react';
import PhaserGame from './PhaserGame';
import ScalextricScene from '../game/ScalextricScene';
import Phaser from 'phaser';

const ScalextricPhaser = ({ onWin, difficulty }) => {
  const [mode, setMode] = useState('menu'); 
  const [question, setQuestion] = useState(null);
  const [finalRank, setFinalRank] = useState(0);
  const [liveRank, setLiveRank] = useState(5);
  const [liveLap, setLiveLap] = useState(0);

  const phaserRef = useRef(null);

  useEffect(() => {
      if (phaserRef.current) {
          phaserRef.current.registry.set('difficulty', difficulty);
      }
  }, [difficulty]);

  // --- MOTOR DE AUDIO ---
  const playSound = (effect) => {
      const audio = new Audio(`/audio/${effect}.mp3`);
      audio.volume = 0.5; 
      audio.play().catch(e => console.error("Error audio:", e));
  };

  const startGame = () => {
      setMode('playing');
      setLiveRank(5);
      setLiveLap(0);
      
      if (phaserRef.current) {
          phaserRef.current.registry.set('difficulty', difficulty);

          if (finalRank > 0) {
              phaserRef.current.events.emit('resetRace');
              setTimeout(() => phaserRef.current.events.emit('startRace'), 100);
          } else {
              phaserRef.current.events.emit('startRace');
          }
      }
  };

  // --- GENERADOR DE MATEMÁTICAS ---
  const generateMath = () => {
      // AQUÍ HABÍA SONIDO ('f1_pit') -> ELIMINADO. SILENCIO TOTAL.

      let q, ans;
      
      if (difficulty === 'easy') {
          const type = Math.random();
          if (type > 0.5) {
              const n1 = Math.floor(Math.random() * 9) + 1;
              const n2 = Math.floor(Math.random() * 9) + 1;
              ans = n1 + n2;
              q = `${n1} + ${n2}`;
          } else {
              const n1 = Math.floor(Math.random() * 4) + 2; 
              const n2 = Math.floor(Math.random() * 9) + 1;
              ans = n1 * n2;
              q = `${n1} x ${n2}`;
          }
      } else {
          const type = Math.random();
          if (type < 0.3) {
              const n1 = Math.floor(Math.random() * 8) + 5; 
              const n2 = Math.floor(Math.random() * 8) + 5; 
              ans = n1 * n2;
              q = `${n1} x ${n2}`;
          } else if (type < 0.7) {
              const n1 = Math.floor(Math.random() * 60) + 20; 
              const n2 = Math.floor(Math.random() * 60) + 20; 
              ans = n1 + n2;
              q = `${n1} + ${n2}`;
          } else {
              const m1 = Math.floor(Math.random() * 8) + 2;
              const m2 = Math.floor(Math.random() * 8) + 2;
              const sum = Math.floor(Math.random() * 20) + 5;
              ans = (m1 * m2) + sum;
              q = `(${m1} x ${m2}) + ${sum}`;
          }
      }
      
      let w1 = ans + (Math.random() > 0.5 ? 1 : -1); 
      let w2 = ans + (Math.random() > 0.5 ? 2 : -2);
      if (w1 === ans) w1 += 1;
      if (w2 === ans) w2 -= 1;
      if (w1 === w2) w2 += 2;

      const opts = [ans, w1, w2].sort(() => Math.random() - 0.5);
      
      setQuestion({ text: q, answer: ans, options: opts });
  };

  const handleAnswer = (val) => {
      if (val === question.answer) {
          setQuestion(null); 
          
          // SONIDO: SOLO AL ACERTAR (SALIDA DE BOXES)
          playSound('f1_start'); 

          if (phaserRef.current) phaserRef.current.events.emit('playerAnswered');
      } else {
          // Penalización (Silencio, solo nueva pregunta)
          generateMath(); 
      }
  };

  const config = useMemo(() => ({
    type: Phaser.AUTO,
    width: 960,
    height: 500,
    scene: [ScalextricScene],
    physics: { default: 'arcade' },
    transparent: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    callbacks: {
        postBoot: (game) => {
            phaserRef.current = game;
            game.registry.set('difficulty', 'hard'); 
            game.registry.set('onPitStop', generateMath);
            game.registry.set('onWin', onWin);
            
            game.events.on('updateHUD', (data) => {
                setLiveRank(data.rank);
                setLiveLap(data.lap);
            });

            game.events.on('raceFinished', (rank) => {
                setFinalRank(rank);
                const reward = (6 - rank) * 10;
                if (onWin) onWin(reward);
                setMode('finished');
            });
        }
    }
  }), []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black/90 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-lg relative">
      
      <div style={{ width: '100%', height: '100%' }}>
         <PhaserGame config={config} onWin={onWin} />
      </div>

      {mode === 'playing' && (
          <>
            <div className="absolute top-4 left-4 bg-black/80 border border-white/20 px-4 py-2 rounded-lg backdrop-blur z-30">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">POS</p>
                <p className={`text-3xl font-black ${liveRank === 1 ? 'text-yellow-400' : 'text-white'}`}>
                    {liveRank}º <span className="text-sm text-gray-600">/ 5</span>
                </p>
            </div>
            <div className="absolute top-4 right-4 bg-black/80 border border-white/20 px-4 py-2 rounded-lg backdrop-blur text-right z-30">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">LAP</p>
                <p className="text-3xl font-black text-white">
                    {liveLap} <span className="text-sm text-gray-600">/ 6</span>
                </p>
            </div>
          </>
      )}

      {mode === 'menu' && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center animate-fadeIn">
              <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 italic mb-4">BRO SCALEXTRIC</h2>
              
              <div className="mb-4">
                  <span className={`px-4 py-1 rounded text-xs font-bold uppercase ${difficulty === 'easy' ? 'bg-green-500 text-black' : 'bg-cyan-500 text-black'}`}>
                      MODO {difficulty === 'easy' ? 'ROOKIE (FÁCIL)' : 'PRO (DIFÍCIL)'}
                  </span>
              </div>

              <div className="bg-[#111] border border-white/20 p-6 rounded-2xl text-center mb-8 shadow-2xl">
                  <p className="text-sm text-gray-300 mb-6">Responde rápido para ganar. BROVISION es el Coche azul Nº 7 del medio</p>
                  <div className="grid grid-cols-5 gap-4 text-xs font-mono mb-4 border-y border-white/10 py-4">
                      <div><span className="text-yellow-400 text-lg block">50</span>1º</div>
                      <div><span className="text-gray-300 text-lg block">40</span>2º</div>
                      <div><span className="text-orange-400 text-lg block">30</span>3º</div>
                      <div><span className="text-white text-lg block">20</span>4º</div>
                      <div><span className="text-red-500 text-lg block">10</span>5º</div>
                  </div>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-white text-black font-black uppercase rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_white]">
                  START ENGINE
              </button>
          </div>
      )}

      {question && mode === 'playing' && (
          <div className="absolute top-16 z-40 animate-bounceIn">
             <div className="bg-black/95 border-2 border-yellow-500 rounded-xl p-6 shadow-2xl text-center min-w-[350px]">
                 <p className="text-[10px] text-yellow-500 uppercase tracking-widest mb-4 font-bold animate-pulse">🔧 PIT STOP ACTIVE</p>
                 <p className="text-5xl font-mono font-black text-white mb-6">{question.text} = ?</p>
                 <div className="flex gap-2 justify-center">
                     {question.options.map((opt, i) => (
                         <button key={i} onClick={() => handleAnswer(opt)} className="bg-gray-800 hover:bg-yellow-500 hover:text-black text-white font-bold py-2 px-6 rounded text-lg transition-all border border-white/20">
                             {opt}
                         </button>
                     ))}
                 </div>
             </div>
          </div>
      )}

      {mode === 'finished' && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center animate-zoomIn">
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">POSICIÓN FINAL</p>
              <h2 className={`text-9xl font-black mb-6 ${finalRank === 1 ? 'text-yellow-400' : 'text-white'}`}>{finalRank}º</h2>
              <div className="bg-[#111] p-6 rounded-xl border border-white/10 mb-8 text-center min-w-[200px]">
                  <p className="text-xs text-gray-500 uppercase">RECOMPENSA</p>
                  <p className="text-4xl text-fuchsia-500 font-bold font-mono">{(6 - finalRank) * 10} GENESIS</p>
              </div>
              <button onClick={() => { setMode('menu'); setQuestion(null); }} className="px-8 py-3 bg-white text-black font-black uppercase rounded-full hover:scale-110 transition-transform">
                  VOLVER AL PADDOCK
              </button>
          </div>
      )}
    </div>
  );
};

export default ScalextricPhaser;