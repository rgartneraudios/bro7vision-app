import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom'; // <--- IMPORTANTE: Necesario para el Portal

const AtlasGame = ({ onWin, onClose }) => {
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(0); 
  const [player, setPlayer] = useState({ x: 50, y: 90, vx: 0, vy: 0 });
  const [enemies, setEnemies] = useState([]);

  const keysPressed = useRef({});
  const playerRef = useRef(player);
  const enemiesRef = useRef(enemies);
  const audioRef = useRef(null);

  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  const getRiskColor = (m) => {
    if (m === 0) return '#ffffff';
    if (m === 1) return '#e879f9';
    if (m === 3) return '#06b6d4';
    if (m === 5) return '#BD004E';
    if (m === 7) return '#4FFF14';
    return '#ff0000';
  };

  useEffect(() => {
    // Audio configuration
    audioRef.current = new Audio("/audio/space.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    return () => { if(audioRef.current) audioRef.current.pause(); };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => { 
        keysPressed.current[e.key] = true; 
        if (e.key === 'Escape' && onClose) onClose();
    };
    const handleKeyUp = (e) => { keysPressed.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onClose]);

  // --- BUCLE DEL JUEGO ---
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
      
      if (x < 2) x = 2; if (x > 98) x = 98;
      if (y < 2) y = 2; if (y > 98) y = 98; 

      setPlayer({ x, y, vx, vy });

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
      if (Math.random() < 0.08) { 
        setEnemies(prev => [...prev, { 
            id: Date.now()+Math.random(), 
            x: Math.random()*100, 
            y: -10, 
            speed: 0.6 + Math.random()*1.2 
        }]);
      }
      setEnemies(prev => prev.map(e => ({ ...e, y: e.y + e.speed })).filter(e => e.y < 110));

      // Colisiones
      enemiesRef.current.forEach(e => {
        const dx = Math.abs(x - e.x); // Distancia Horizontal
        const dy = Math.abs(y - e.y); // Distancia Vertical
        // --- AJUSTE DE PRECISIÓN "CÁPSULA" ---
        // dx < 1.3 : Hacemos la nave MUCHO más estrecha (antes era 2.5). 
        //            Esto arregla que te maten de lejos por los lados.
        // dy < 6.5 : Hacemos la nave MÁS ALTA (antes era 4).
        //            Esto arregla que los enemigos te toquen la punta y no mueras.
        
        if (dx < 1.3 && dy < 6.5) {
          setGameOver(true);
          if (audioRef.current) audioRef.current.volume = 0.1;

          let reward = 0;
          if (score >= 20000) reward = 200;
          else if (score >= 15000) reward = 150;
          else if (score >= 10000) reward = 100;
          else if (score >= 5000)  reward = 50;

          if (reward > 0 && onWin) onWin(reward); 
        }
      });
      
          }, 20);
    return () => clearInterval(loop);
  }, [gameStarted, gameOver, score, onWin]);

  // --- CONTENIDO DEL JUEGO ---
  const gameContent = (
    <div 
        className="fixed inset-0 w-screen h-screen overflow-hidden font-mono select-none"
        // Z-Index extremo para tapar el HoloPrisma
        style={{ backgroundColor: '#000000', zIndex: 2147483647 }} 
    >
      
      {/* VIDEO FONDO */}
      <video src="/videos/space.mp4" autoPlay loop muted className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" />

      {/* BOTÓN SALIR (X) */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-8 z-[100] text-white/50 hover:text-red-500 text-4xl font-black transition-colors cursor-pointer"
      >
        ✕
      </button>

      {/* HUD CENTRADO (SOLUCIÓN AL PROBLEMA DE VISIBILIDAD) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur border border-white/20 px-8 py-2 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <p className="text-white text-3xl font-black italic leading-none text-center">
                {score.toLocaleString()}
            </p>
        </div>
        
        {/* BARRA DE RIESGO DEBAJO DEL PUNTAJE */}
        <div className="flex items-center gap-2 mt-2">
            <p className="text-[10px] font-bold uppercase text-white/60">RISK</p>
            <div className="h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full transition-all duration-300"
                    style={{ width: `${(multiplier/10)*100}%`, backgroundColor: getRiskColor(multiplier) }}
                ></div>
            </div>
            <p className="text-[10px] font-bold text-white" style={{ color: getRiskColor(multiplier) }}>
                x{multiplier}
            </p>
        </div>
      </div>

      {/* NAVE */}
      {!gameOver && (
        <img 
            src="/assets/atlas.png" 
            alt="Atlas"
            className="absolute z-40 transition-transform duration-75"
            style={{
                left: `${player.x}%`, 
                top: `${player.y}%`, 
                width: '40px',
                transform: `translate(-50%, -50%) rotate(${player.vx * 3}deg)`,
                filter: `drop-shadow(0 0 ${15+multiplier}px ${getRiskColor(multiplier)})`
            }}
        />
      )}

      {/* ENEMIGOS */}
      {enemies.map(e => (
        <div 
            key={e.id} 
            className="absolute bg-white rounded-full z-30" 
            style={{ 
                left: `${e.x}%`, 
                top: `${e.y}%`, 
                width: '8px', 
                height: '40px', 
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 15px white, 0 0 30px cyan' 
            }}
        ></div>
      ))}

      {/* MENÚS */}
      {(!gameStarted || gameOver) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-[100]">
          <h1 className="text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-fuchsia-600 mb-4 drop-shadow-2xl">
              ATLAS
          </h1>
          
          {gameOver && (
            <div className="text-center mb-10 animate-fadeIn">
                <p className="text-red-500 font-bold tracking-[0.5em] text-sm mb-2 animate-pulse">SIGNAL LOST</p>
                <p className="text-white text-6xl font-mono font-bold mb-4">{score.toLocaleString()}</p>
                {score >= 5000 && (
                    <div className="bg-white/10 px-6 py-2 rounded-full border border-white/20">
                        <p className="text-cyan-300 font-bold">
                            RECOMPENSA: +{score >= 20000 ? 200 : score >= 15000 ? 150 : score >= 10000 ? 100 : 50} GÉNESIS
                        </p>
                    </div>
                )}
            </div>
          )}

          <div className="flex gap-6">
              <button 
                className="group relative px-12 py-4 bg-white text-black font-black text-xl uppercase skew-x-[-10deg] hover:bg-cyan-400 transition-all hover:scale-105 cursor-pointer"
                onClick={() => { 
                    setGameStarted(true); setGameOver(false); setScore(0); setEnemies([]); 
                    if(audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.volume = 0.4; audioRef.current.play(); }
                }}
              >
                {gameOver ? "RETRY MISSION" : "LAUNCH SYSTEM"}
                <div className="absolute inset-0 border-2 border-white translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform -z-10"></div>
              </button>
              
              <button 
                 onClick={onClose}
                 className="px-8 py-4 border border-white/30 text-white font-bold uppercase skew-x-[-10deg] hover:bg-white/10 transition-all cursor-pointer"
              >
                  EXIT
              </button>
          </div>
        </div>
      )}
    </div>
  );

  // --- EL TRUCO DE MAGIA: RENDERIZAR EN EL BODY ---
  // Esto saca el juego del NexusDashboard y lo pega encima de todo el sitio web.
  return ReactDOM.createPortal(gameContent, document.body);
};

export default AtlasGame;