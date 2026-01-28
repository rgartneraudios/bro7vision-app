// src/components/AtlasGame.jsx
import React, { useState, useEffect, useRef } from 'react';

const AtlasGame = ({ onWin, onClose }) => {
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(0); 
  const [player, setPlayer] = useState({ x: 50, y: 85, vx: 0, vy: 0 });
  const [enemies, setEnemies] = useState([]);

  const keysPressed = useRef({});
  const playerRef = useRef(player);
  const enemiesRef = useRef(enemies);
  const audioRef = useRef(null);

  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  // --- 1. CONFIGURACIÓN DE COLORES DE RIESGO ---
  const getRiskColor = (m) => {
    if (m === 0) return '#ffffff'; // Safe (Blanco)
    if (m === 1) return '#e879f9'; // 1x (Fucsia fuerte)
    if (m === 3) return '#06b6d4'; // 3x (Cyan)
    if (m === 5) return '#BD004E'; // 5x (salmon)
    if (m === 7) return '#4FFF14'; // 7x (Verde Neón)
    return '#ff0000';              // 10x (Rojo Peligro)
  };

  // --- 2. AUDIO ---
  useEffect(() => {
    audioRef.current = new Audio("/audio/space.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    return () => { if(audioRef.current) audioRef.current.pause(); };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => { keysPressed.current[e.key] = true; };
    const handleKeyUp = (e) => { keysPressed.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- 3. MOTOR DEL JUEGO (EL BUCLE) ---
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const loop = setInterval(() => {
      let { x, y, vx, vy } = playerRef.current;
      
      const acc = 0.8;
      if (keysPressed.current['ArrowLeft']) vx -= acc;
      if (keysPressed.current['ArrowRight']) vx += acc;
      if (keysPressed.current['ArrowUp']) vy -= acc;
      if (keysPressed.current['ArrowDown']) vy += acc;

      vx *= 0.7; vy *= 0.7; x += vx; y += vy;
      if (x < 0) x = 0; if (x > 92) x = 92;
      if (y < 0) y = 0; if (y > 90) y = 90; 

      setPlayer({ x, y, vx, vy });

      // Cálculo de Multiplicador por altura
      let m = 0;
      if (y > 80) m = 0; 
      else if (y > 60) m = 1; 
      else if (y > 45) m = 3;
      else if (y > 30) m = 5;
      else if (y > 15) m = 7; 
      else m = 10;
      
      setMultiplier(m);
      setScore(s => s + m);

      // Generar Enemigos
      if (Math.random() < 0.07) { 
        setEnemies(prev => [...prev, { 
            id: Date.now()+Math.random(), 
            x: Math.random()*95, 
            y: -10, 
            speed: 0.6 + Math.random()*1.2 
        }]);
      }
      setEnemies(prev => prev.map(e => ({ ...e, y: e.y + e.speed })).filter(e => e.y < 110));

      // --- AQUÍ ESTÁ EL BUCLE DE COLISIÓN ---
      enemiesRef.current.forEach(e => {
        // Si la distancia entre la nave y el cometa es pequeña...
        if (Math.abs(x - e.x) < 4 && Math.abs(y - e.y) < 6) {
          setGameOver(true);
          if (audioRef.current) audioRef.current.volume = 0.1;

          // RECOMPENSA GÉNESIS
          let reward = 0;
          if (score >= 20000) reward = 200;
          else if (score >= 15000) reward = 150;
          else if (score >= 10000) reward = 100;
          else if (score >= 5000)  reward = 50;

          if (reward > 0) onWin(reward); 
        }
      });
    }, 20);
    return () => clearInterval(loop);
  }, [gameStarted, gameOver, score, onWin]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-mono select-none rounded-xl">
      <video src="/videos/space.mp4" autoPlay loop muted className="absolute inset-0 w-full h-full object-cover opacity-50" />
      
      {/* HUD SUPERIOR */}
      <div className="absolute top-4 left-4 z-50">
        <p className="text-white text-xl font-black italic leading-none">SCORE: {score.toLocaleString()}</p>
        <p className="text-[10px] tracking-[0.3em] font-bold mt-1" style={{ color: getRiskColor(multiplier) }}>
            {multiplier === 0 ? "STABLE" : `RISK: x${multiplier}`}
        </p>
      </div>

      {/* NAVE (ATLAS.PNG) */}
      {!gameOver && (
        <img 
            src="/assets/atlas.png" 
            alt="Atlas"
            className="absolute z-40 transition-transform duration-75"
            style={{
                left: `${player.x}%`, 
                top: `${player.y}%`, 
                width: '35px', 
                filter: `drop-shadow(0 0 ${10+multiplier}px ${getRiskColor(multiplier)})`,
                transform: `rotate(${player.vx * 2}deg)`
            }}
        />
      )}

      {/* ENEMIGOS */}
      {enemies.map(e => (
        <div 
            key={e.id} 
            className="absolute bg-white rounded-full z-30" 
            style={{ left: `${e.x}%`, top: `${e.y}%`, width: '10px', height: '35px', boxShadow: '0 0 15px white' }}
        ></div>
      ))}

      {/* MENÚS */}
      {(!gameStarted || gameOver) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-[100]">
          <h1 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-fuchsia-500 mb-2">3i-ATLAS</h1>
          
          {gameOver && (
            <div className="text-center mb-6">
                <p className="text-red-500 font-bold tracking-widest animate-pulse">CONNECTION LOST</p>
                <p className="text-white text-3xl font-black">{score.toLocaleString()}</p>
                {score >= 5000 && (
                    <p className="text-blue-400 text-[10px] font-bold mt-2">
                        + {score >= 20000 ? 200 : score >= 15000 ? 150 : score >= 10000 ? 100 : 50} GÉNESIS OBTENIDOS
                    </p>
                )}
            </div>
          )}

          <button 
            className="bg-white text-black px-10 py-3 font-black text-lg skew-x-[-15deg] hover:bg-fuchsia-500 hover:text-white transition-all"
            onClick={() => { 
                setGameStarted(true); setGameOver(false); setScore(0); setEnemies([]); 
                if(audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.volume = 0.4; audioRef.current.play(); }
            }}
          >
            {gameOver ? "RE-LAUNCH" : "IGNITION"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AtlasGame;