import React, { useState, useEffect, useRef } from 'react';

// --- CONFIGURACIÓN DE MEDIOS ---
const ASSETS = {
    bgEntry: '/audio/entry.mp3',       
    bgExit: '/audio/out.mp3',          
    sfxDoor: '/audio/door_sound.mp3',
    sfxAlarm: '/audio/alarm_sound.mp3', 
    vidVault: '/videos/boveda.mp4',    
    vidWin: '/videos/city_ambience.mp4' 
};

const SevenGates = ({ onWin, onClose }) => {
  const [phase, setPhase] = useState('intro');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [columns, setColumns] = useState([]); 
  const [question, setQuestion] = useState("");
  const [doorState, setDoorState] = useState('closed'); 
  const [isAdLevel, setIsAdLevel] = useState(false);
  const [hasAdRun, setHasAdRun] = useState(false); // NUEVO: Control para que la marca salga solo una vez
  
  // AUDIO
  const entryAudio = useRef(new Audio(ASSETS.bgEntry));
  const exitAudio = useRef(new Audio(ASSETS.bgExit));
  const doorAudio = useRef(new Audio(ASSETS.sfxDoor));
  const alarmAudio = useRef(new Audio(ASSETS.sfxAlarm));

  const stopAllAudio = () => {
      entryAudio.current.pause(); exitAudio.current.pause(); alarmAudio.current.pause(); doorAudio.current.pause();
      entryAudio.current.currentTime = 0; exitAudio.current.currentTime = 0; alarmAudio.current.currentTime = 0; doorAudio.current.currentTime = 0;
  };

  useEffect(() => {
      entryAudio.current.loop = true;
      exitAudio.current.loop = true;
      entryAudio.current.volume = 0.5;
      exitAudio.current.volume = 0.6;
      return () => stopAllAudio();
  }, []);

  useEffect(() => {
      entryAudio.current.pause();
      exitAudio.current.pause();
      if (phase === 'entry') entryAudio.current.play().catch(()=>{});
      else if (phase === 'exit') exitAudio.current.play().catch(()=>{});
  }, [phase]);

  useEffect(() => {
      if (phase === 'entry' || phase === 'exit') {
          setDoorState('closed');
          const openTimer = setTimeout(() => {
              setDoorState('opening');
              doorAudio.current.currentTime = 0;
              doorAudio.current.play().catch(()=>{});
          }, 1200); 
          return () => clearTimeout(openTimer);
      }
  }, [level, phase]);

  // --- GENERADOR DE NIVELES ---
  const generateLevel = (currentLevel) => {
      // BASE DE DATOS ACTUALIZADA (Añadida una opción extra 'w' para los 5 carriles)
      const DB = [
          // --- CINE CIENCIA FICCIÓN (SCIFI) ---
          { q: "PLANETA DE AVATAR", a: "PANDORA", w: ["VULCANO", "TATOOINE", "ARRAKIS", "ENDOR"], isAd: false },
          { q: "EXTERMINADOR T-800", a: "ARNOLD", w: ["STALLONE", "BRUCE", "KEANU", "TOM"], isAd: false },
          { q: "NAVE DE ALIEN", a: "NOSTROMO", w: ["SULACO", "ENTERPRISE", "HALCON", "SERENITY"], isAd: false },
          { q: "CAZADOR INVISIBLE", a: "PREDATOR", w: ["XENOMORF", "GODZILLA", "KONG", "THING"], isAd: false },
          { q: "AGUJERO NEGRO", a: "GARGANTUA", w: ["ANDROMEDA", "PEGASO", "ORION", "CYGNUS"], isAd: false },
          { q: "DIRECTOR DE DUNE", a: "VILLENEUVE", w: ["NOLAN", "SPIELBERG", "LUCAS", "CAMERON"], isAd: false },
          { q: "ROBOT DE STAR WARS", a: "R2D2", w: ["HAL9000", "WALL-E", "CHAPPIE", "SONNY"], isAd: false },

        // --- ASTRONOMÍA Y ESPACIO ---
	{ q: "EL PLANETA ROJO", a: "MARTE", w: ["VENUS", "MERCURIO", "SATURNO", "URANO"], isAd: false },
	{ q: "ESTRELLA CERCANA", a: "PROXIMA", w: ["SIRIUS", "VEGA", "POLARIS", "BETELGEUSE"], isAd: false },
	{ q: "NUESTRA GALAXIA", a: "VIA LACTEA", w: ["ANDROMEDA", "TRIANGULO", "SOMBRERO", "CIGARRO"], isAd: false },
	{ q: "SATELITE DE TIERRA", a: "LUNA", w: ["IO", "EUROPA", "TITAN", "GANIMEDES"], isAd: false },
	{ q: "PLANETA MAS GRANDE", a: "JUPITER", w: ["SATURNO", "NEPTUNO", "TIERRA", "MARTE"], isAd: false },
	{ q: "EL PLANETA CON ANILLOS", a: "SATURNO", w: ["MARTE", "JUPITER", "MERCURIO", "PLUTON"], isAd: false },
	{ q: "ESTRELLA DEL SISTEMA", a: "SOL", w: ["ALFA CENTAURI", "SIRIUS", "ANTARES", "LUNA"], isAd: false },
	{ q: "PLANETA MAS CALIENTE", a: "VENUS", w: ["MERCURIO", "MARTE", "JUPITER", "SATURNO"], isAd: false },
	{ q: "ESTRELLA QUE GUIA", a: "POLARIS", w: ["VEGA", "RIGEL", "DENEB", "ALTAIR"], isAd: false },
	{ q: "PLANETA MAS ALEJADO", a: "NEPTUNO", w: ["URANO", "SATURNO", "PLUTON", "JUPITER"], isAd: false },
	{ q: "EL PLANETA ENANO", a: "PLUTON", w: ["MERCURIO", "CERES", "ERIS", "MARTE"], isAd: false },
	{ q: "CONJUNTO DE ESTRELLAS", a: "CONSTELACION", w: ["NEBULOSA", "CUMULO", "PULSAR", "QUASAR"], isAd: false },
	{ q: "PRIMER HOMBRE EN LUNA", a: "ARMSTRONG", w: ["ALDRIN", "GAGARIN", "GLENN", "SHEPARD"], isAd: false },
	{ q: "TEORIA DEL ORIGEN", a: "BIG BANG", w: ["ESTADO ESTACIONARIO", "CUERDAS", "MULTIVERSO", "RELATIVIDAD"], isAd: false },
	
         // --- ASTROLOGÍA ---
	{ q: "SIGNO DE LOS GEMELOS", a: "GEMINIS", w: ["LIBRA", "ACUARIO", "VIRGO", "PISCIS"], isAd: false },
	{ q: "SIGNO DEL LEON", a: "LEO", w: ["ARIES", "TAURO", "CANCER", "CAPRI"], isAd: false },
	{ q: "SIGNO DE LA BALANZA", a: "LIBRA", w: ["ESCORPIO", "SAGITARIO", "GEMINIS", "VIRGO"], isAd: false },
	{ q: "SIGNO DEL CARNERO", a: "ARIES", w: ["TAURO", "LEO", "VIRGO", "PISCIS"], isAd: false },
	{ q: "SIGNO DEL TORO", a: "TAURO", w: ["ARIES", "CANCER", "LEO", "ESCORPIO"], isAd: false },
	{ q: "SIGNO DEL CANGREJO", a: "CANCER", w: ["GÉMINIS", "LEO", "ACUARIO", "PISCIS"], isAd: false },
	{ q: "SIGNO DE LA VIRGEN", a: "VIRGO", w: ["LIBRA", "GÉMINIS", "TAURO", "ARIES"], isAd: false },
	{ q: "SIGNO DEL ESCORPIÓN", a: "ESCORPIO", w: ["SAGITARIO", "LIBRA", "CANCER", "CAPRI"], isAd: false },
	{ q: "SIGNO DEL ARQUERO", a: "SAGITARIO", w: ["ACUARIO", "ARIES", "LEO", "VIRGO"], isAd: false },
	{ q: "SIGNO DE LA CABRA", a: "CAPRICORNIO", w: ["ACUARIO", "TAURO", "CANCER", "PISCIS"], isAd: false },
	{ q: "SIGNO DEL PORTADOR DE AGUA", a: "ACUARIO", w: ["PISCIS", "GÉMINIS", "LIBRA", "LEO"], isAd: false },
	{ q: "SIGNO DE LOS PECES", a: "PISCIS", w: ["ACUARIO", "ARIES", "CANCER", "VIRGO"], isAd: false },
	{ q: "PLANETA REGENTE DE LEO", a: "SOL", w: ["LUNA", "MARTE", "JÚPITER", "SATURNO"], isAd: false },
	{ q: "PRIMER SIGNO DEL ZODIACO", a: "ARIES", w: ["PISCIS", "TAURO", "GÉMINIS", "LIBRA"], isAd: false },

          // --- MUNDO ANIMAL ---
          { q: "FELINO MAS RAPIDO", a: "GUEPARDO", w: ["TIGRE", "LEON", "PUMA", "JAGUAR"], isAd: false },
          { q: "MAMIFERO MAS GRANDE", a: "BALLENA", w: ["ELEFANTE", "JIRAFA", "ORCA", "HIPO"], isAd: false },
          { q: "AVE QUE NO VUELA", a: "PINGUINO", w: ["AGUILA", "HALCON", "LORO", "BUHO"], isAd: false },
          { q: "REPTIL CAMBIANTE", a: "CAMALEON", w: ["IGUANA", "GECKO", "VARANO", "COBRA"], isAd: false },

          // --- INTELIGENCIA ARTIFICIAL ---
          { q: "CREADOR DE CHATGPT", a: "OPENAI", w: ["GOOGLE", "APPLE", "META", "AMAZON"], isAd: false },
          { q: "IA GENERADOR IMAGEN", a: "DALLE", w: ["MIDJOURNEY", "STABLE", "CANVA", "PHOTOSHOP"], isAd: false },
          { q: "PADRE DE LA IA", a: "TURING", w: ["EINSTEIN", "NEWTON", "TESLA", "EDISON"], isAd: false },

          // --- GEOGRAFÍA ---
          { q: "CAPITAL DE FRANCIA", a: "PARIS", w: ["LYON", "NIZA", "MARSELLA", "BORDEOS"], isAd: false },
          { q: "DESIERTO MAS GRANDE", a: "SAHARA", w: ["GOBI", "ATACAMA", "ARABIA", "KALAHARI"], isAd: false },
          { q: "MONTE MAS ALTO", a: "EVEREST", w: ["K2", "BLANC", "KILIMANJARO", "FUJI"], isAd: false },
          { q: "CAPITAL DE ITALIA", a: "ROMA", w: ["MILAN", "NAPOLES", "TURIN", "VENECIA"], isAd: false },

          // --- MARCAS (ADS) - TOTAL 10 ---
          { q: "MARCA DEPORTIVA", a: "NIKE", w: ["PUMA", "ADIDAS", "REEBOK", "FILA"], isAd: true }, 
          { q: "REFRESCO ROJO", a: "COLA", w: ["PEPSI", "FANTA", "SPRITE", "7UP"], isAd: true },
          { q: "CONSOLA DE SONY", a: "PS5", w: ["XBOX", "WII", "SEGA", "SWITCH"], isAd: true },
          { q: "COCHES ELECTRICOS", a: "TESLA", w: ["FORD", "BMW", "AUDI", "TOYOTA"], isAd: true },
          { q: "STREAMING ROJO", a: "NETFLIX", w: ["HBO", "DISNEY", "PRIME", "HULU"], isAd: true },
          { q: "HAMBURGUESA REY", a: "BURGERKING", w: ["MCDONALD", "KFC", "SUBWAY", "WENDYS"], isAd: true },
          { q: "TELEFONO MANZANA", a: "IPHONE", w: ["GALAXY", "PIXEL", "XIAOMI", "NOKIA"], isAd: true },
          { q: "RELOJ DE LUJO", a: "ROLEX", w: ["CASIO", "SEIKO", "OMEGA", "TAG"], isAd: true },
          { q: "TIENDA DE TODO", a: "AMAZON", w: ["EBAY", "ALIEXPRESS", "TEMU", "WALMART"], isAd: true },
          { q: "BUSCADOR GLOBAL", a: "GOOGLE", w: ["BING", "YAHOO", "DUCKDUCK", "BAIDU"], isAd: true }
      ];      
      // FILTRADO: Si ya salió un Ad (hasAdRun), filtramos para que solo salgan preguntas normales
      let availableQuestions = DB;
      if (hasAdRun) {
          availableQuestions = DB.filter(item => !item.isAd);
      }

      // Elección aleatoria
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const challenge = availableQuestions[randomIndex];
      
      setQuestion(challenge.q);
      setIsAdLevel(challenge.isAd);
      
      // Si elegimos una Ad, marcamos que ya salió para el futuro
      if (challenge.isAd) {
          setHasAdRun(true);
      }

      const newCols = [];
      const colCount = 5; // AHORA SON 5 CARRILES
      const winningColIndex = Math.floor(Math.random() * colCount); 
      const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      // Loop de generación de carriles
      for (let i = 0; i < colCount; i++) {
          const streamLength = 45; 
          let content = [];
          
          // Ruido
          for(let k=0; k<streamLength; k++) {
              content.push({ val: randomChars[Math.floor(Math.random() * randomChars.length)], isWord: false });
          }

          let wordToInsert = "";
          let isTargetColumn = false;

          if (i === winningColIndex) {
              wordToInsert = challenge.a; // CORRECTA
              isTargetColumn = true;
          } else {
              // Selecciona una trampa usando el módulo para rotar si faltan opciones
              wordToInsert = challenge.w[i % challenge.w.length]; 
          }

          if (wordToInsert) {
              if (phase === 'exit') wordToInsert = wordToInsert.split('').reverse().join(''); 
              
              const insertIndex = 12 + Math.floor(Math.random() * 10);
              
              for (let charIdx = 0; charIdx < wordToInsert.length; charIdx++) {
                  if (insertIndex + charIdx < content.length) {
                      content[insertIndex + charIdx] = { 
                          val: wordToInsert[charIdx], 
                          isWord: true, 
                          isTarget: isTargetColumn 
                      };
                  }
              }
          }
          newCols.push({ id: i, data: content, isWinner: isTargetColumn });
      }
      setColumns(newCols);
  };

  const handleStart = () => {
      alarmAudio.current.pause();
      alarmAudio.current.currentTime = 0;
      setPhase('entry');
      setLevel(1);
      setScore(0);
      setHasAdRun(false); // Reseteamos el control de Ads al iniciar nueva partida
      generateLevel(1);
  };

  const handleColumnSelect = (colIndex) => {
      if (columns[colIndex].isWinner) handleSuccess();
      else handleFail();
  };

  const handleSuccess = () => {
      setScore(prev => prev + 10);
      setDoorState('closed');
      setTimeout(() => {
          if (phase === 'entry') {
              if (level < 7) { setLevel(prev => prev + 1); generateLevel(level + 1); } 
              else { setPhase('vault'); }
          } else if (phase === 'exit') {
              if (level < 7) { setLevel(prev => prev + 1); generateLevel(level + 1); } 
              else { setPhase('win'); }
          }
      }, 1000); 
  };

  const handleFail = () => {
      alarmAudio.current.currentTime = 0;
      alarmAudio.current.play().catch(() => null);
      entryAudio.current.pause();
      exitAudio.current.pause();
      setDoorState('closed'); 
      setTimeout(() => setPhase('fail'), 800);
  };

  const handleVaultVideoEnd = () => {
      setPhase('escape_msg');
      setTimeout(() => {
          setPhase('exit');
          setLevel(1);
          generateLevel(1);
      }, 4000);
  };

  return (
    // CAMBIO COLOR: Todo el borde y sombra ahora es CYAN siempre
    <div className={`relative w-full h-full max-w-6xl mx-auto bg-black font-mono overflow-hidden flex flex-col items-center justify-center select-none text-white rounded-xl border-2 border-cyan-500 shadow-[0_0_30px_cyan]`}>
        
        <style>{`
            @keyframes matrixScroll { 0% { transform: translateY(-70%); } 100% { transform: translateY(0%); } }
            @keyframes matrixScrollUp { 0% { transform: translateY(0%); } 100% { transform: translateY(-70%); } }
            .animate-scroll-down { animation: matrixScroll 8s linear infinite; }
            .animate-scroll-up { animation: matrixScrollUp 8s linear infinite; }

            .door-panel {
                background: linear-gradient(90deg, #050505 0%, #0d1f26 50%, #050505 100%);
                border: 1px solid #083344;
                box-shadow: inset 0 0 50px rgba(0,255,255,0.1);
                z-index: 40;
            }
        `}</style>

        {/* 1. INTRO - Ajustado a Cyan */}
        {phase === 'intro' && (
            <div className="z-50 text-center animate-zoomIn p-6 bg-black/95 border border-cyan-500/50 rounded-2xl max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                <h1 className="text-4xl font-black text-cyan-500 mb-4">THE 7 GATES</h1>
                <p className="text-gray-300 mb-6 text-xs">
                    5 Carriles. 1 Verdad. 4 Mentiras.
                    <br/><span className="text-cyan-400">Modo Experto Activado.</span>
                </p>
                <button onClick={handleStart} className="bg-cyan-700 hover:bg-cyan-500 text-black font-bold py-3 px-8 rounded-full shadow-[0_0_30px_cyan] transition-all hover:scale-105 uppercase tracking-widest text-xs">
                    INICIAR HACKEO
                </button>
            </div>
        )}

        {/* 2. JUEGO (5 CARRILES) */}
        {(phase === 'entry' || phase === 'exit') && (
            <div className="relative z-10 w-full h-full flex flex-col">
                
                {/* HUD - Siempre Cyan */}
                <div className="absolute top-0 w-full z-[60] flex flex-col bg-black/95 border-b border-cyan-500/50">
                    <div className="flex justify-between px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-cyan-700">
                        <span>{phase === 'entry' ? 'INFILTRATION' : 'EXTRACTION'}</span>
                        <div className="flex gap-4">
                            <span className="text-cyan-100">GATE {level}/7</span>
                            <span className="text-yellow-400">GEN: {score}</span>
                        </div>
                    </div>
                    <div className="w-full py-4 text-center border-t border-cyan-500/20">
                        {isAdLevel && <p className="text-[8px] text-yellow-400 uppercase tracking-[0.3em] mb-1 animate-pulse">★ PATROCINADO ★</p>}
                        <h2 className={`text-xl md:text-3xl font-black drop-shadow-md px-4 leading-tight text-cyan-100`}>
                            {question}
                        </h2>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black/50">
                    
                    {/* PUERTAS */}
                    <div className={`absolute inset-0 z-40 flex pointer-events-none transition-transform duration-[1000ms] ease-in-out`}>
                        <div className="w-1/2 h-full door-panel border-r-2 border-cyan-900/30 flex items-center justify-end transition-transform duration-[1000ms]" style={{ transform: doorState === 'opening' ? 'translateX(-100%)' : 'translateX(0%)' }}><div className="w-1 h-full bg-cyan-900/50"></div></div>
                        <div className="w-1/2 h-full door-panel border-l-2 border-cyan-900/30 flex items-center justify-start transition-transform duration-[1000ms]" style={{ transform: doorState === 'opening' ? 'translateX(100%)' : 'translateX(0%)' }}><div className="w-1 h-full bg-cyan-900/50"></div></div>
                    </div>

                    {/* LÁSER DE CAPTURA - POSICIÓN DINÁMICA */}
                    <div className={`absolute left-0 right-0 h-[1px] bg-red-500/40 z-30 pointer-events-none shadow-[0_0_15px_red] transition-all duration-500 ${phase === 'entry' ? 'bottom-20' : 'top-20'}`}></div>

                    {/* 5 COLUMNAS - Ajustadas al ancho */}
                    <div className="flex justify-center gap-1 md:gap-2 w-full h-full px-2 md:px-4 overflow-hidden pt-32 pb-4">
                        {columns.map((col, idx) => (
                            <div key={idx} className={`relative flex-1 h-full border-x overflow-hidden group border-cyan-500/20 bg-cyan-900/5`}>
                                
                                <div className="absolute inset-0 overflow-hidden">
                                    <div 
                                        className={`flex flex-col items-center w-full ${phase === 'entry' ? 'animate-scroll-down' : 'animate-scroll-up'}`}
                                        style={{ animationDuration: `${8 + idx}s` }} 
                                    > 
                                        {[...col.data, ...col.data, ...col.data].map((item, i) => (
                                            <div key={i} className="h-8 flex items-center justify-center w-full">
                                                {/* LOGICA DE COLOR: Si es Ad y es Target -> Amarillo. Si no, Cyan */}
                                                <span className={`text-xl md:text-2xl font-black font-mono ${
                                                    item.isWord 
                                                        ? (isAdLevel && item.isTarget 
                                                            ? 'text-yellow-400 drop-shadow-[0_0_15px_yellow]' // AMARILLO PARA LA MARCA
                                                            : 'text-cyan-500 drop-shadow-[0_0_8px_cyan]')   // CYAN PARA EL RESTO
                                                        : 'text-cyan-800/40'
                                                }`}>
                                                    {item.val}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* BOTÓN LOCK - Siempre Cyan Style */}
                                <div className={`absolute px-1 z-50 flex justify-center pointer-events-auto w-full transition-all duration-500 ${phase === 'entry' ? 'bottom-4' : 'top-4'}`}>
                                    <button 
                                        onClick={() => handleColumnSelect(idx)}
                                        className={`
                                            w-full py-4 border-2 text-[10px] font-black tracking-widest transition-all rounded-lg shadow-xl active:scale-95 hover:scale-105
                                            bg-cyan-950/90 border-cyan-400 text-cyan-200 hover:bg-cyan-400 hover:text-black shadow-[0_0_20px_cyan]
                                        `}
                                    >
                                        LOCK
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* 3. BÓVEDA */}
        {phase === 'vault' && (
            <div className="z-50 w-full h-full bg-black animate-fadeIn relative">
                <video 
                    src={ASSETS.vidVault} 
                    autoPlay 
                    className="w-full h-full object-cover" 
                    onEnded={handleVaultVideoEnd} 
                />
            </div>
        )}

        {/* 3.5 ESCAPE */}
        {phase === 'escape_msg' && (
            <div className="z-50 w-full h-full bg-black flex flex-col items-center justify-center animate-zoomIn text-center p-8 border border-red-500">
                <h1 className="text-5xl font-black text-red-500 mb-4 animate-pulse">¡ALERTA!</h1>
                <p className="text-xl text-white font-bold uppercase tracking-widest">
                    Activos Asegurados.
                    <br/><span className="text-cyan-400">INICIANDO EXTRACCIÓN</span>
                </p>
                <p className="text-xs text-gray-500 mt-8">Gravedad Invertida...</p>
            </div>
        )}

        {/* 4. VICTORIA - TEMA NARANJA (ORANGE) */}
        {phase === 'win' && (
            <div className="z-50 w-full h-full bg-black animate-fadeIn relative">
                <video src={ASSETS.vidWin} autoPlay loop className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                    <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-orange-500 shadow-[0_0_50px_orange] text-center max-w-sm">
                        <h1 className="text-4xl font-black text-white mb-2">LIBERTAD</h1>
                        <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-6">Misión Cumplida</p>
                        <button onClick={() => onWin(140)} className="bg-white text-black font-black py-3 px-10 rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_white] text-xs">RECOGER 140 GEN</button>
                    </div>
                </div>
            </div>
        )}

        {/* 5. FALLO */}
        {phase === 'fail' && (
            <div className="z-[70] absolute inset-0 flex items-center justify-center bg-black/90 animate-shake">
                <div className="bg-red-950/90 p-8 rounded-2xl border-2 border-red-600 shadow-[0_0_100px_red] text-center max-w-sm">
                    <div className="text-4xl mb-4">🚨</div>
                    <h2 className="text-2xl font-black text-white mb-2">ALARMA</h2>
                    <p className="text-red-200 text-xs mb-6">Te han atrapado.</p>
                    <button onClick={() => setPhase('intro')} className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-500 uppercase text-xs">Reintentar</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default SevenGates;