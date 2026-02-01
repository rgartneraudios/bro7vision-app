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
      let q, ans;
      
      // === MODO ROOKIE (Familiar / 10-12 años) ===
      // Estilo: 7 + 5 - 2 = ?  o  3 x 3 - 4 = ?
      if (difficulty === 'easy') {
          const type = Math.random();
          
          if (type > 0.5) {
              // TIPO 1: Suma y Resta combinada (A + B - C)
              // Ejemplo: 12 + 5 - 3
              const n1 = Math.floor(Math.random() * 12) + 5;  // 5 a 16
              const n2 = Math.floor(Math.random() * 8) + 2;   // 2 a 9
              const n3 = Math.floor(Math.random() * 5) + 2;   // 2 a 6
              
              // Aseguramos que el resultado no sea negativo
              ans = n1 + n2 - n3;
              q = `${n1} + ${n2} - ${n3}`;
          } else {
              // TIPO 2: Multiplicación pequeña y Resta (A x B - C)
              // Ejemplo: 4 x 3 - 5
              const n1 = Math.floor(Math.random() * 4) + 2;   // 2 a 5
              const n2 = Math.floor(Math.random() * 5) + 2;   // 2 a 6
              const sub = Math.floor(Math.random() * 5) + 1;  // 1 a 5
              
              ans = (n1 * n2) - sub;
              // Si por azar da negativo o cero, lo arreglamos sumando en vez de restando
              if (ans <= 0) {
                  ans = (n1 * n2) + sub;
                  q = `${n1} x ${n2} + ${sub}`;
              } else {
                  q = `${n1} x ${n2} - ${sub}`;
              }
          }
      } 
      
      // === MODO PRO (Adultos / Difícil) ===
      // Estilo: (9x8)/2  o  (15/3)x5
      else {
          const type = Math.random();
          
          if (type < 0.4) {
              // TIPO 1: Multiplicación y División por 2
              // Ejemplo: (8 x 5) / 2
              // Truco: Uno de los números debe ser par para que la división sea exacta
              const n1 = (Math.floor(Math.random() * 6) + 2) * 2; // Número par (4, 6, 8... 14)
              const n2 = Math.floor(Math.random() * 8) + 3;       // 3 a 10
              
              ans = (n1 * n2) / 2;
              q = `(${n1} x ${n2}) / 2`;
              
          } else if (type < 0.7) {
              // TIPO 2: División primero, luego Multiplicación
              // Ejemplo: (20 / 4) x 3
              const divisor = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5
              const resultDiv = Math.floor(Math.random() * 8) + 2; // Resultado de la división
              const dividend = divisor * resultDiv; // Calculamos el dividendo exacto
              const multiplier = Math.floor(Math.random() * 8) + 2;
              
              ans = resultDiv * multiplier;
              q = `(${dividend} / ${divisor}) x ${multiplier}`;
              
          } else {
              // TIPO 3: Multiplos de 10 (Rollo concurso TV)
              // Ejemplo: (50 / 5) + 15
              const base = (Math.floor(Math.random() * 8) + 2) * 10; // 20, 30... 90
              const div = [2, 5, 10][Math.floor(Math.random() * 3)]; // Divisores fáciles
              const sum = Math.floor(Math.random() * 15) + 5;
              
              ans = (base / div) + sum;
              q = `(${base} / ${div}) + ${sum}`;
          }
      }
      
      // --- GENERADOR DE RESPUESTAS FALSAS (Opciones) ---
      // Generamos variaciones cercanas para confundir
      let w1 = ans + (Math.random() > 0.5 ? 2 : -2); 
      let w2 = ans + (Math.random() > 0.5 ? 5 : -5); // Un poco más lejos
      
      // Evitar duplicados y negativos
      if (w1 === ans) w1 += 1;
      if (w2 === ans) w2 -= 3;
      if (w1 === w2) w2 += 1;
      if (w1 <= 0) w1 = ans + 3;
      if (w2 <= 0) w2 = ans + 7;

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
            
            // Aseguramos que la dificultad inicial se pase correctamente
            game.registry.set('difficulty', difficulty); 
            game.registry.set('onPitStop', generateMath);
            game.registry.set('onWin', onWin);
            
            // --- NUEVO: ESCUCHADOR DE AUDIO DESDE PHASER ---
            game.events.on('playSound', (effect) => {
                // Si no tienes un archivo 'beep.mp3', puedes hacer que solo suene en f1_start
                if (effect === 'beep') {
                    // Opcional: playSound('beep'); 
                } else {
                    playSound(effect); // Reproducirá 'f1_start' cuando Phaser lo pida
                }
            });

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
  }), [difficulty]); // <--- IMPORTANTE: Añade [difficulty] aquí si quieres que se recargue si cambia, si no, déjalo []
  
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