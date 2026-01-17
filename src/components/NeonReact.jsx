import React, { useState, useEffect, useRef } from 'react';

export default function NeonReact({ onWin }) {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [message, setMessage] = useState('PRESS START');
  const [messageColor, setMessageColor] = useState('text-cyan-400');
  
  const audioContextRef = useRef(null);

  // Colores ajustados al tema Cyberpunk
  const colors = [
    { id: 0, name: 'RED', bg: 'bg-red-600', glow: 'shadow-[0_0_30px_red] border-red-400', freq: 261.63 },
    { id: 1, name: 'GREEN', bg: 'bg-green-600', glow: 'shadow-[0_0_30px_lime] border-green-400', freq: 329.63 },
    { id: 2, name: 'BLUE', bg: 'bg-blue-600', glow: 'shadow-[0_0_30px_blue] border-blue-400', freq: 392.00 },
    { id: 3, name: 'YELLOW', bg: 'bg-yellow-500', glow: 'shadow-[0_0_30px_yellow] border-yellow-300', freq: 523.25 }
  ];

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  const playTone = (frequency, duration = 300) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1; 
    
    oscillator.start(ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration / 1000);
    oscillator.stop(ctx.currentTime + duration / 1000);
  };

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsPlaying(true);
    setMessage('MEMORIZA...');
    setMessageColor('text-yellow-400');
    
    const firstColor = Math.floor(Math.random() * 4);
    setTimeout(() => playSequence([firstColor]), 800);
  };

  const playSequence = (seq) => {
    setIsPlayerTurn(false);
    setSequence(seq);
    setMessage('MEMORIZA...');
    setMessageColor('text-white');
    
    seq.forEach((colorId, index) => {
      setTimeout(() => {
        setActiveButton(colorId);
        playTone(colors[colorId].freq, 500); 
        
        setTimeout(() => {
          setActiveButton(null);
          
          if (index === seq.length - 1) {
            setTimeout(() => {
              setIsPlayerTurn(true);
              setMessage('¡TU TURNO!');
              setMessageColor('text-cyan-400 animate-pulse');
            }, 500);
          }
        }, 500); 
      }, index * 1000); 
    });
  };

  const handleButtonClick = (colorId) => {
    if (!isPlayerTurn || gameOver) return;
    
    setActiveButton(colorId);
    playTone(colors[colorId].freq, 150); 
    setTimeout(() => setActiveButton(null), 150);
    
    const newPlayerSequence = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSequence);
    
    const currentIndex = newPlayerSequence.length - 1;
    
    // ERROR
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      setGameOver(true);
      setIsPlayerTurn(false);
      setMessage('SYSTEM FAILURE');
      setMessageColor('text-red-500');
      playTone(100, 800); 
      return;
    }
    
    // SECUENCIA COMPLETADA
    if (newPlayerSequence.length === sequence.length) {
      setIsPlayerTurn(false);
      const pointsWon = 50; 
      setScore(score + pointsWon);
      setLevel(level + 1);
      setMessage(`¡BIEN! +${pointsWon} PTS`);
      setMessageColor('text-green-400');
      setPlayerSequence([]);
      
      // $$$ PAGO $$$
      if(onWin) onWin(pointsWon); 
      
      setTimeout(() => {
        const newSequence = [...sequence, Math.floor(Math.random() * 4)];
        playSequence(newSequence);
      }, 1500);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 rounded-xl font-mono select-none">
      
      {/* HUD */}
      <div className="w-full flex justify-between px-8 mb-6">
          <div className="bg-black/60 px-4 py-2 rounded border border-white/10">
              <span className="text-[10px] text-gray-500 uppercase block">SCORE</span>
              <span className="text-xl text-fuchsia-400 font-bold">{score}</span>
          </div>
          <div className="text-center">
              <p className={`text-2xl font-black italic tracking-tighter ${messageColor} drop-shadow-md`}>
                {message}
              </p>
          </div>
          <div className="bg-black/60 px-4 py-2 rounded border border-white/10 text-right">
              <span className="text-[10px] text-gray-500 uppercase block">LEVEL</span>
              <span className="text-xl text-white font-bold">{level}</span>
          </div>
      </div>

      {/* BOTONES */}
      <div className="grid grid-cols-2 gap-6 mb-8 p-4">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => handleButtonClick(color.id)}
              disabled={!isPlayerTurn && !gameOver} 
              className={`
                w-32 h-24 sm:w-40 sm:h-32 rounded-2xl border-4 transition-all duration-100
                ${activeButton === color.id 
                  ? `${color.bg} border-white scale-105 ${color.glow} z-10` 
                  : `bg-opacity-100 ${color.bg} border-white/20 hover:border-white/50`
                }
                relative overflow-hidden
              `}
            >
              {activeButton === color.id && (
                  <div className="absolute inset-0 bg-white/30 blur-md"></div>
              )}
            </button>
          ))}
      </div>

      {/* START */}
      <div className="flex gap-4">
          {!isPlaying || gameOver ? (
              <button
                onClick={startGame}
                className="px-10 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase rounded-full shadow-[0_0_20px_rgba(192,38,211,0.5)] transition-all hover:scale-105"
              >
                {gameOver ? 'RETRY SYSTEM' : 'START SEQUENCE'}
              </button>
          ) : (
              <div className="text-xs text-gray-500 animate-pulse">
                  SYSTEM ACTIVE...
              </div>
          )}
      </div>
    </div>
  );
}