import React, { useState, useRef } from 'react';

// --- BASE DE DATOS DE FRASES ---
const HEAVEN_QUOTES = [
  "Hola amigo, ¿qué tal? ¿Eres nuevo por aquí?",
  "¡Ohhh! Mira qué ser más inteligente.",
  "¿Nos hacemos amigos? Tenemos mucho que enseñarte.",
  "El saber no ocupa lugar, ¿has visto?",
  "Parece que te has ganado un paseo por aquí, ¡bienvenido!",
  "Estaba esperando que llegues para mostrarte nuestro mundo.",
  "Aquí la armonía está más cerca.",
  "¡Llegas justo a tiempo! Disfruta de tu estancia.",
  "¡Tener fe y sabiduría es lo que mueve las montañas!",
  "Siéntete como en tu casa, Bienvenido."
];

const DARK_QUOTES = [
  "Sabía que volverías....!",
  "¿Otra vez por aquí? ¡Qué bien!",
  "¡Te estaba extrañando!",
  "¡Necesitamos a gente como tú aquí!",
  "¡Has llegado justo a tiempo! ¡Jajaja!",
  "Tuve la sensación de que había algún ruido por aquí...",
  "Estas son las consecuencias de no estudiar, jojojojo.",
  "¿Nos gustan los libros verdad, Jajaja, Que bien! ?",
  "Oh!! que sorpresa!, Creo que vas a pasar un buen tiempo aquí! HjjjuuuuHHH",
  "¿Has ido al colegio alguna vez? Jajajaja."
];

// --- BASE DE DATOS DE PREGUNTAS (Necesitamos al menos 10) ---
const QUESTIONS_DB = [
  { q: "¿Cuál es el río más largo del mundo?", a: "Amazonas", opts: ["Nilo", "Amazonas", "Yangtsé"] },
  { q: "¿En qué país se encuentra la Torre Eiffel?", a: "Francia", opts: ["Italia", "Francia", "España"] },
  { q: "¿Quién pintó la Mona Lisa?", a: "Da Vinci", opts: ["Picasso", "Da Vinci", "Van Gogh"] },
  { q: "¿Cuál es el planeta más grande del sistema solar?", a: "Júpiter", opts: ["Tierra", "Saturno", "Júpiter"] },
  { q: "¿Qué elemento químico es el H?", a: "Hidrógeno", opts: ["Helio", "Hidrógeno", "Hierro"] },
  { q: "¿Capital de Australia?", a: "Canberra", opts: ["Sídney", "Melbourne", "Canberra"] },
  { q: "¿Cuántos huesos tiene el cuerpo humano adulto?", a: "206", opts: ["206", "300", "150"] },
  { q: "¿Quién escribió 'El Quijote'?", a: "Cervantes", opts: ["Shakespeare", "Cervantes", "Lope de Vega"] },
  { q: "¿En qué año llegó el hombre a la Luna?", a: "1969", opts: ["1950", "1969", "1975"] },
  { q: "¿Cuál es el océano más grande?", a: "Pacífico", opts: ["Atlántico", "Índico", "Pacífico"] },
  { q: "¿Capital de Japón?", a: "Tokio", opts: ["Kyoto", "Osaka", "Tokio"] },
  { q: "¿Fórmula del agua?", a: "H2O", opts: ["CO2", "H2O", "O2"] },
  { q: "¿Animal más rápido?", a: "Guepardo", opts: ["León", "Guepardo", "Águila"] },
  { q: "¿Capital de Italia?", a: "Roma", opts: ["Milán", "Venecia", "Roma"] },
  { q: "¿Continente más grande?", a: "Asia", opts: ["África", "América", "Asia"] },
  { q: "¿En qué continente está Egipto?", a: "África", opts: ["Asia", "Europa", "África"] },
  { q: "¿Cuál es la capital de Canadá?", a: "Ottawa", opts: ["Toronto", "Ottawa", "Vancouver"] },
  { q: "¿Qué gas es esencial para la respiración humana?", a: "Oxígeno", opts: ["Nitrógeno", "Oxígeno", "Hidrógeno"] },
  { q: "¿Quién creó Microsoft?", a: "Bill Gates", opts: ["Steve Jobs", "Bill Gates", "Larry Page"] },
  { q: "¿En qué año se presentó el primer iPhone?", a: "2007", opts: ["2005", "2007", "2010"] },
  { q: "¿Qué empresa es dueña de YouTube?", a: "Google", opts: ["Meta", "Google", "Amazon"] },
  { q: "¿Quién es Sam Altman?", a: "CEO de OpenAI", opts: ["CEO de Tesla", "CEO de OpenAI", "CEO de Nvidia"] },
  { q: "¿Qué lenguaje se usa para estructurar páginas web?", a: "HTML", opts: ["Python", "HTML", "C++"] },
  { q: "¿Qué planeta es conocido como el planeta rojo?", a: "Marte", opts: ["Venus", "Marte", "Júpiter"] },
  { q: "¿Quién escribió '1984'?", a: "George Orwell", opts: ["George Orwell", "Aldous Huxley", "Ray Bradbury"] },
  { q: "¿Cuál es el metal más ligero?", a: "Litio", opts: ["Hierro", "Litio", "Aluminio"] },
  { q: "¿Qué país ganó el Mundial de 2010?", a: "España", opts: ["Brasil", "España", "Alemania"] },
  { q: "¿Cuál es la capital de Argentina?", a: "Buenos Aires", opts: ["Córdoba", "Buenos Aires", "Rosario"] },
  { q: "¿Qué consola lanzó Nintendo en 2006?", a: "Wii", opts: ["GameCube", "Wii", "Switch"] },
  { q: "¿Quién creó el juego Half-Life?", a: "Valve", opts: ["Valve", "id Software", "Epic Games"] },
  { q: "¿Cuál es el océano más pequeño?", a: "Ártico", opts: ["Índico", "Ártico", "Atlántico"] },
  { q: "¿Qué animal pone huevos?", a: "Ornitorrinco", opts: ["Ornitorrinco", "Gorila", "Delfín"] },
  { q: "¿Qué país tiene forma de bota?", a: "Italia", opts: ["Grecia", "Italia", "Portugal"] },
  { q: "¿Qué científico propuso la teoría de la relatividad?", a: "Einstein", opts: ["Newton", "Einstein", "Tesla"] },
  { q: "¿Cuál es el idioma más hablado del mundo?", a: "Inglés", opts: ["Inglés", "Mandarín", "Hindi"] },
  { q: "¿Qué empresa creó Android?", a: "Google", opts: ["Apple", "Google", "Samsung"] },
  { q: "¿Qué país inventó el sushi?", a: "Japón", opts: ["China", "Japón", "Corea del Sur"] },
  { q: "¿Cuál es la capital de Noruega?", a: "Oslo", opts: ["Oslo", "Bergen", "Trondheim"] },
  { q: "¿Qué órgano bombea la sangre?", a: "Corazón", opts: ["Pulmones", "Corazón", "Hígado"] },
  { q: "¿Qué motor gráfico creó Epic Games?", a: "Unreal Engine", opts: ["Unity", "Unreal Engine", "CryEngine"] },
  { q: "¿Qué continente tiene más países?", a: "África", opts: ["Asia", "Europa", "África"] },
  { q: "¿Qué empresa fabrica los procesadores Ryzen?", a: "AMD", opts: ["Intel", "AMD", "Qualcomm"] },
  { q: "¿Cuál es el satélite natural de la Tierra?", a: "La Luna", opts: ["Europa", "La Luna", "Titán"] },
  { q: "¿Qué país es famoso por la Torre de Pisa?", a: "Italia", opts: ["Italia", "Francia", "Alemania"] },
  { q: "¿Qué lenguaje se usa principalmente para inteligencia artificial?", a: "Python", opts: ["Java", "Python", "C"] },
  { q: "¿En qué continente está Kazajistán?", a: "Asia", opts: ["Europa", "Asia", "África"] },
  { q: "¿Cuál es la capital de Suecia?", a: "Estocolmo", opts: ["Oslo", "Copenhague", "Estocolmo"] },
  { q: "¿Qué empresa creó el sistema operativo Windows?", a: "Microsoft", opts: ["Apple", "Microsoft", "IBM"] },
  { q: "¿Qué motor usa JavaScript en Google Chrome?", a: "V8", opts: ["V8", "SpiderMonkey", "Chakra"] },
  { q: "¿Cuál es el planeta más cercano al Sol?", a: "Mercurio", opts: ["Venus", "Mercurio", "Marte"] },
  { q: "¿Quién escribió 'Cien años de soledad'?", a: "Gabriel García Márquez", opts: ["García Márquez", "Borges", "Allende"] },
  { q: "¿Qué país inventó el papel?", a: "China", opts: ["Egipto", "China", "India"] },
  { q: "¿Qué empresa fabrica la PlayStation?", a: "Sony", opts: ["Nintendo", "Sony", "Microsoft"] },
  { q: "¿Qué lenguaje se usa para estilos en la web?", a: "CSS", opts: ["CSS", "Java", "SQL"] },
  { q: "¿Qué país tiene más habitantes?", a: "India", opts: ["China", "India", "Estados Unidos"] },
  { q: "¿Cuál es el desierto más grande del mundo?", a: "Antártico", opts: ["Sahara", "Gobi", "Antártico"] },
  { q: "¿Quién es el CEO de Tesla?", a: "Elon Musk", opts: ["Tim Cook", "Elon Musk", "Sundar Pichai"] },
  { q: "¿Qué videojuego popularizó el género battle royale?", a: "PUBG", opts: ["PUBG", "Fortnite", "Apex Legends"] },
  { q: "¿Qué país tiene como moneda el yen?", a: "Japón", opts: ["China", "Japón", "Corea del Sur"] },
  { q: "¿Cuál es el hueso más largo del cuerpo humano?", a: "Fémur", opts: ["Fémur", "Húmero", "Tibia"] },
  { q: "¿Qué empresa creó el buscador Chrome?", a: "Google", opts: ["Google", "Mozilla", "Opera"] },
  { q: "¿Qué país es conocido como la tierra del sol naciente?", a: "Japón", opts: ["China", "Japón", "Tailandia"] },
  { q: "¿Qué científico descubrió la gravedad?", a: "Newton", opts: ["Einstein", "Newton", "Galileo"] },
  { q: "¿Qué consola introdujo los cartuchos intercambiables?", a: "Atari 2600", opts: ["NES", "Atari 2600", "Sega Genesis"] },
  { q: "¿Qué país ganó el Mundial de 1998?", a: "Francia", opts: ["Brasil", "Francia", "Alemania"] },
  { q: "¿Qué empresa creó el lenguaje de programación Go?", a: "Google", opts: ["Google", "Microsoft", "IBM"] },
  { q: "¿Cuál es el río más caudaloso del mundo?", a: "Amazonas", opts: ["Nilo", "Amazonas", "Congo"] },
  { q: "¿Qué país tiene como capital a Nairobi?", a: "Kenia", opts: ["Kenia", "Etiopía", "Tanzania"] },
  { q: "¿Qué mineral es esencial para formar huesos?", a: "Calcio", opts: ["Calcio", "Potasio", "Magnesio"] },
  { q: "¿Qué empresa creó el juego Minecraft?", a: "Mojang", opts: ["Mojang", "Valve", "Epic Games"] },
  { q: "¿Qué país tiene forma de dragón en el mapa?", a: "Gales", opts: ["Gales", "Irlanda", "Escocia"] },
  { q: "¿Qué lenguaje se usa para bases de datos?", a: "SQL", opts: ["SQL", "C#", "Ruby"] },
  { q: "¿Qué galaxia está más cerca de la Vía Láctea?", a: "Andrómeda", opts: ["Andrómeda", "Triángulo", "Sombrero"] },
  { q: "¿Qué empresa creó el procesador M1?", a: "Apple", opts: ["Intel", "AMD", "Apple"] },
  { q: "¿Qué país es famoso por los fiordos?", a: "Noruega", opts: ["Suecia", "Noruega", "Islandia"] },
  { q: "¿En qué continente está Uruguay?", a: "América del Sur", opts: ["Europa", "América del Sur", "África"] },
  { q: "¿Cuál es la capital de Finlandia?", a: "Helsinki", opts: ["Helsinki", "Tallin", "Riga"] },
  { q: "¿Qué empresa creó el primer procesador x86?", a: "Intel", opts: ["AMD", "Intel", "IBM"] },
  { q: "¿Qué lenguaje se usa para crear apps Android?", a: "Kotlin", opts: ["Swift", "Kotlin", "Ruby"] },
  { q: "¿Cuál es el planeta con más lunas?", a: "Saturno", opts: ["Júpiter", "Marte", "Saturno"] },
  { q: "¿Quién pintó 'La noche estrellada'?", a: "Van Gogh", opts: ["Van Gogh", "Monet", "Dalí"] },
  { q: "¿Qué país tiene como ciudad a Graz?", a: "Austria", opts: ["Croacia", "Austria", "Hungría"] },
  { q: "¿Qué empresa creó ChatGPT?", a: "OpenAI", opts: ["Google", "OpenAI", "Meta"] },
  { q: "¿Qué videojuego introdujo a Mario por primera vez?", a: "Donkey Kong", opts: ["Donkey Kong", "Super Mario Bros", "Mario Kart"] },
  { q: "¿Cuál es el metal más caro del mundo?", a: "Rodio", opts: ["Oro", "Rodio", "Platino"] },
  { q: "¿Qué país tiene más volcanes activos?", a: "Indonesia", opts: ["Japón", "Islandia", "Indonesia"] },
  { q: "¿Quién es el CEO de Apple?", a: "Tim Cook", opts: ["Tim Cook", "Satya Nadella", "Sundar Pichai"] },
  { q: "¿Qué animal es el más grande del planeta?", a: "Ballena azul", opts: ["Elefante", "Ballena azul", "Tiburón blanco"] },
  { q: "¿Qué país inventó la brújula?", a: "China", opts: ["China", "Grecia", "Egipto"] },
  { q: "¿Qué motor gráfico usa Fortnite?", a: "Unreal Engine", opts: ["Unity", "Unreal Engine", "Source"] },
  { q: "¿Qué país tiene como capital a Islamabad?", a: "Pakistán", opts: ["Pakistán", "Irán", "Afganistán"] },
  { q: "¿Qué vitamina produce el cuerpo con el sol?", a: "Vitamina D", opts: ["Vitamina C", "Vitamina D", "Vitamina B12"] },
  { q: "¿Qué empresa creó la saga The Legend of Zelda?", a: "Nintendo", opts: ["Nintendo", "Sega", "Capcom"] },
  { q: "¿Cuál es el país más grande del mundo?", a: "Rusia", opts: ["China", "Rusia", "Canadá"] },
  { q: "¿Qué lenguaje se usa para inteligencia artificial y machine learning?", a: "Python", opts: ["Python", "C#", "Go"] },
  { q: "¿Qué país tiene como capital a Bangkok?", a: "Tailandia", opts: ["Vietnam", "Tailandia", "Malasia"] },
  { q: "¿Qué científico descubrió la penicilina?", a: "Alexander Fleming", opts: ["Fleming", "Pasteur", "Curie"] },
  { q: "¿Qué empresa creó la saga Halo?", a: "Bungie", opts: ["Bungie", "343 Industries", "Valve"] },
  { q: "¿Cuál es el país más frío del mundo?", a: "Rusia", opts: ["Rusia", "Canadá", "Groenlandia"] },
  { q: "¿Qué empresa creó el asistente Alexa?", a: "Amazon", opts: ["Apple", "Amazon", "Google"] },
  { q: "¿Qué país tiene como capital a Lima?", a: "Perú", opts: ["Perú", "Ecuador", "Bolivia"] },
  { q: "¿Qué consola introdujo el mando con pantalla táctil?", a: "Wii U", opts: ["Wii U", "Switch", "PS Vita"] },
  { q: "¿Qué país es famoso por las pirámides de Giza?", a: "Egipto", opts: ["Egipto", "México", "Sudán"] },
  { q: "¿Qué empresa creó el lenguaje Swift?", a: "Apple", opts: ["Apple", "Google", "Microsoft"] },
  { q: "¿Cuál es el animal más venenoso del mundo?", a: "Medusa caja", opts: ["Cobra real", "Medusa caja", "Rana dardo"] },
  { 
    q: "¿Dónde podría aparecer tu Marca ahora mismo?", 
    a: "Aquí", 
    opts: ["Aquí", "En la TV", "En la Radio"],
    sponsored: true,
    brand: "TU EMPRESA (FASE 0)"
  },
  { 
    q: "¿Qué producto revolucionario encaja en este slot?", 
    a: "El tuyo", 
    opts: ["El tuyo", "Ninguno", "Otro"],
    sponsored: true,
    brand: "ESPACIO PUBLICITARIO"
  },
  ];

const CosmicQuiz = ({ onWin }) => {
  // ESTADOS
  const [gameState, setGameState] = useState('menu'); 
  const [doorState, setDoorState] = useState('closed'); 
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  
  // Mazo de preguntas barajado
  const [gameQuestions, setGameQuestions] = useState([]);

  // ESTADOS VISUALES
  const [bgImage, setBgImage] = useState(null);
  const [bubbleText, setBubbleText] = useState("");
  const [isHeaven, setIsHeaven] = useState(true);

  // REFERENCIAS DE AUDIO
  const audioRef = useRef(new Audio());

  // --- MOTOR DE AUDIO ---
  const playSound = (type) => {
      let src = "";
      let vol = 0.5;

      if (type === 'heaven') { src = "/audio/heaven.mp3"; vol = 0.4; }
      else if (type === 'dark') { src = "/audio/dark.mp3"; vol = 0.6; }
      else if (type === 'door') { src = "/audio/door_open.mp3"; vol = 0.3; } // Opcional

      if (src) {
          const audio = new Audio(src);
          audio.volume = vol;
          audio.play().catch(e => console.error("Audio error:", e));
      }
  };

  // --- LÓGICA DEL JUEGO ---

  const startGame = () => {
    setScore(0);
    setQuestionCount(0);
    
    // 1. BARAJAR PREGUNTAS
    const shuffled = [...QUESTIONS_DB].sort(() => Math.random() - 0.5);
    setGameQuestions(shuffled);

    // 2. Arrancar
    setTimeout(() => nextQuestion(shuffled, 0), 100);
  };

  const nextQuestion = (questionsList = gameQuestions, count = questionCount) => {
    // AHORA SON 10 PREGUNTAS
    if (count >= 10) {
      setGameState('finished');
      if (onWin) onWin(score);
      return;
    }

    const qData = questionsList[count];
    // Si se acaban las preguntas (por si la DB es pequeña), reiniciamos ciclo
    if (!qData) { 
        setGameState('finished');
        if (onWin) onWin(score);
        return;
    }

    const shuffledOpts = [...qData.opts].sort(() => Math.random() - 0.5);
    
    setCurrentQuestion({ ...qData, opts: shuffledOpts });
    setGameState('questioning');
    setDoorState('closed'); 
  };

  const handleAnswer = (selectedOpt) => {
    const isCorrect = selectedOpt === currentQuestion.a;
    const nextCount = questionCount + 1;
    setQuestionCount(nextCount);

    prepareScene(isCorrect);

    // --- ECONOMÍA (+10 / -10) ---
    if (isCorrect) {
        setScore(prev => prev + 10);
        playSound('heaven'); // SONIDO ÁNGELES
    } else {
        setScore(prev => Math.max(0, prev - 10)); // Restamos 10 (Suelo 0)
        playSound('dark'); // SONIDO TERROR
    }

    // SONIDO PUERTA (Opcional)
    // playSound('door');

    setGameState('revealing');
    setTimeout(() => {
        setDoorState('open'); 
        
        // Tiempo mirando el paisaje (4s)
        setTimeout(() => {
            setDoorState('closed'); 
            
            // Siguiente pregunta
            setTimeout(() => {
                nextQuestion(gameQuestions, nextCount);
            }, 1000); 
        }, 4000); 

    }, 500); 
  };

  const prepareScene = (isCorrect) => {
    setIsHeaven(isCorrect);
    
    const num = Math.floor(Math.random() * 10) + 1;
    const numStr = num < 10 ? `0${num}` : `${num}`; 

    if (isCorrect) {
        setBgImage(`/assets/heaven_${numStr}.png`);
        const quote = HEAVEN_QUOTES[Math.floor(Math.random() * HEAVEN_QUOTES.length)];
        setBubbleText(quote);
    } else {
        setBgImage(`/assets/dark_${numStr}.png`);
        const quote = DARK_QUOTES[Math.floor(Math.random() * DARK_QUOTES.length)];
        setBubbleText(quote);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-black border-2 border-white/20 rounded-3xl shadow-2xl font-mono select-none flex flex-col items-center justify-center">
      
      {/* 1. FONDO (PAISAJE) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-500 z-0"
        style={{ 
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            filter: 'brightness(0.9)'
        }}
      >
{/* BURBUJA DE DIÁLOGO (ESTILO HUD - COMPACTO Y ELEGANTE) */}
          {doorState === 'open' && (
              <div className="
                  absolute 
                  top-4 left-4 md:top-6 md:left-6   /* Pegado a la esquina con margen */
                  w-auto 
                  max-w-[85%] md:max-w-[320px]      /* Límite de ancho estricto en PC */
                  z-30 animate-slideUp
              ">
                  
                  {/* MARCO EXTERIOR */}
                  <div className={`
                      p-[1px] rounded-lg shadow-2xl backdrop-blur-sm
                      ${isHeaven 
                          ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent' 
                          : 'bg-gradient-to-r from-transparent via-red-600 to-transparent'
                      }
                  `}>
                      {/* INTERIOR DEL MENSAJE (Padding reducido: p-3) */}
                      <div className={`
                          relative rounded-lg p-3 md:p-4 flex flex-col items-start text-left overflow-hidden
                          ${isHeaven 
                              ? 'bg-slate-900/80 border border-cyan-500/30' // Más transparente (/80)
                              : 'bg-black/80 border border-red-600/50'
                          }
                      `}>
                          
                          {/* DECORACIÓN FONDO */}
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                          {/* HEADER TÉCNICO */}
                          <div className="flex justify-between w-full mb-1 opacity-70 border-b border-white/10 pb-1">
                              <span className={`text-[7px] font-mono tracking-widest ${isHeaven ? 'text-cyan-400' : 'text-red-500'}`}>
                                  {isHeaven ? 'INCOMING MSG' : 'THREAT DETECTED'}
                              </span>
                          </div>

                          {/* EL MENSAJE (Letra más pequeña: text-sm en móvil, text-base en PC) */}
                          <p className={`
                              text-sm md:text-base font-bold italic tracking-wide leading-snug drop-shadow-md z-10 mt-1
                              ${isHeaven 
                                  ? 'text-cyan-50' 
                                  : 'text-red-50'
                              }
                          `}>
                            "{bubbleText}"
                          </p>

                          {/* FOOTER TÉCNICO */}
                          <div className="mt-2 flex items-center gap-2 opacity-80">
                              <div className={`w-1 h-1 rounded-full ${isHeaven ? 'bg-cyan-400' : 'bg-red-500'}`}></div>
                              <span className={`text-[7px] font-mono uppercase ${isHeaven ? 'text-cyan-300' : 'text-red-400'}`}>
                                  GUARDIAN_AI
                              </span>
                          </div>

                      </div>
                  </div>
              </div>
          )}                   
     </div>

      {/* 2. PUERTAS */}
      <div className="absolute inset-0 pointer-events-none z-20 flex">
          <div 
            className="w-1/2 h-full bg-cover bg-right transition-transform duration-[1500ms] ease-in-out border-r-4 border-black"
            style={{ 
                backgroundImage: "url('/assets/door_left.png')",
                transform: doorState === 'open' ? 'translateX(-100%)' : 'translateX(0%)'
            }}
          ></div>
          <div 
            className="w-1/2 h-full bg-cover bg-left transition-transform duration-[1500ms] ease-in-out border-l-4 border-black"
            style={{ 
                backgroundImage: "url('/assets/door_right.png')",
                transform: doorState === 'open' ? 'translateX(100%)' : 'translateX(0%)'
            }}
          ></div>
      </div>

      {/* 3. MENÚ DE INICIO */}
      {gameState === 'menu' && (
          <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-fadeIn p-8 text-center">
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4 tracking-tighter">COSMIC PORTAL</h1>
              <p className="text-gray-400 text-lg mb-8 font-light tracking-widest">VIAJA ENTRE DIMENSIONES</p>
              
              <div className="bg-[#111] p-6 rounded-2xl border border-white/10 mb-8 text-center grid grid-cols-2 gap-4">
                  <div className="p-2">
                      <p className="text-gray-500 text-xs uppercase">RONDAS</p>
                      <p className="text-white font-bold text-xl">10</p>
                  </div>
                  <div className="p-2">
                      <p className="text-gray-500 text-xs uppercase">MAX PREMIO</p>
                      <p className="text-cyan-400 font-bold text-xl">100 GÉNESIS</p>
                  </div>
                  <div className="col-span-2 border-t border-white/10 pt-2 flex justify-around">
                     <span className="text-green-400 text-sm">✅ +10</span>
                     <span className="text-red-500 text-sm">❌ -10</span>
                  </div>
              </div>

              <button onClick={startGame} className="px-12 py-5 bg-white text-black font-black text-xl uppercase rounded-full hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                  ABRIR COMPUERTA
              </button>
          </div>
      )}

      {/* 4. PREGUNTA (PUERTAS CERRADAS) */}
      {gameState === 'questioning' && doorState === 'closed' && currentQuestion && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
              
              {/* CAMBIO DE ESTILO SI ES PATROCINADO */}
              <div className={`
                  w-full max-w-3xl bg-[#0a0a0a] p-10 rounded-[2rem] text-center relative overflow-hidden shadow-2xl
                  ${currentQuestion.sponsored 
                      ? 'border-2 border-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.2)]' // Estilo GOLD
                      : 'border border-cyan-500/50 shadow-[0_0_80px_rgba(0,255,255,0.15)]'   // Estilo NORMAL
                  }
              `}>
                  {/* BARRA SUPERIOR DECORATIVA */}
                  <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${currentQuestion.sponsored ? 'from-yellow-600 via-yellow-400 to-yellow-600' : 'from-transparent via-cyan-500 to-transparent'}`}></div>
                  
                  {/* CABECERA */}
                  <div className="flex justify-between items-center mb-6">
                      {currentQuestion.sponsored ? (
                          <div className="flex items-center gap-2 animate-pulse">
                              <span className="text-xl">⭐</span>
                              <p className="text-yellow-400 text-xs uppercase tracking-[0.2em] font-bold">
                                  PATROCINADO POR {currentQuestion.brand}
                              </p>
                          </div>
                      ) : (
                          <p className="text-cyan-400 text-xs uppercase tracking-[0.5em]">SISTEMA DE NAVEGACIÓN</p>
                      )}
                      
                      <p className={`font-mono px-3 py-1 rounded ${currentQuestion.sponsored ? 'text-yellow-400 bg-yellow-900/30' : 'text-white bg-cyan-900/50'}`}>
                          SCORE: {score}
                      </p>
                  </div>
                  
                  {/* PREGUNTA */}
                  <h3 className={`text-4xl md:text-5xl font-bold mb-10 leading-tight ${currentQuestion.sponsored ? 'text-yellow-100' : 'text-white'}`}>
                      {currentQuestion.q}
                  </h3>
                  
                  {/* OPCIONES */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {currentQuestion.opts.map((opt, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleAnswer(opt)}
                            className={`
                                py-5 px-6 font-bold text-lg rounded-2xl transition-all hover:scale-105 shadow-lg
                                ${currentQuestion.sponsored
                                    ? 'bg-gray-800 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black hover:border-yellow-400'
                                    : 'bg-gray-800 text-white border border-white/10 hover:bg-cyan-600 hover:border-cyan-400'
                                }
                            `}
                          >
                              {opt}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}
      
      {/* 5. FIN DEL JUEGO */}
      {gameState === 'finished' && (
          <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-zoomIn">
              <h2 className="text-5xl text-white font-bold mb-6">VIAJE COMPLETADO</h2>
              <p className="text-8xl font-black text-cyan-400 mb-10 drop-shadow-[0_0_30px_cyan]">{score}</p>
              <p className="text-gray-500 text-sm mb-12 uppercase tracking-widest">GÉNESIS ACUMULADOS</p>
              <button onClick={() => setGameState('menu')} className="px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-black font-bold uppercase rounded-full transition-all text-lg">
                  VOLVER AL PORTAL              </button>
          </div>
      )}

    </div>
  );
};

export default CosmicQuiz;