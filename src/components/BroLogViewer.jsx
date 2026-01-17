import React, { useState, useEffect } from 'react';

const BroLogViewer = ({ log, onClose }) => {
  const [showAd, setShowAd] = useState(true); // Empieza mostrando anuncio

  // Lógica del "Peaje Publicitario"
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAd(false); // A los 3 segundos, muestra el artículo
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center animate-fadeIn bg-black">
      
      {/* === FASE 1: EL ANUNCIO PRE-ROLL === */}
      {showAd ? (
        <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden">
           {/* Fondo dinámico del anuncio */}
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black animate-pulse"></div>
           
           <div className="z-10 text-center p-8 border-y-2 border-yellow-400 bg-black/50 backdrop-blur-xl">
              <p className="text-xs text-yellow-400 font-mono tracking-[0.3em] mb-4 animate-bounce">
                 PUBLICIDAD PROGRAMÁTICA
              </p>
              <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-2">
                 EDITORIAL QUIJOTE
              </h2>
              <p className="text-gray-300 uppercase tracking-widest text-sm">
                 Auspicia este Espacio Cultural
              </p>
           </div>

           <div className="absolute bottom-10 text-[10px] text-gray-500 font-mono">
              Generando recompensa para el autor...
           </div>
        </div>
      ) : (
      
      /* === FASE 2: EL ARTÍCULO (BRO-LOG) === */
      <div className="relative w-full h-full flex flex-col animate-slideUp">
         
         {/* Video de Fondo para Lectura (Oscurecido) */}
         {/* ... dentro de BroLogViewer.jsx ... */}

        {/* Video de Fondo para Lectura (AJUSTADO: MÁS VISIBLE) */}
         <div className="absolute inset-0 z-0">
            {/* 1. Video con más opacidad (antes opacity-20, ahora opacity-70) */}
            <video 
               src="/loop_log.mp4" 
               autoPlay 
               loop 
               muted 
               className="w-full h-full object-cover opacity-70" 
            ></video> 
            
            {/* 2. Degradado mucho más suave (antes era negro sólido) */}
            {/* Esto permite que el video se vea detrás del texto pero oscurece un poco para leer */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
         </div>
                  
         {/* Barra de Navegación */}
         <div className="relative z-50 flex justify-between items-center p-6 border-b border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
               <span className="text-cyan-400 text-xl">⚡</span>
               <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">BRO-LOGS ARCHIVE</span>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
            >
              ✕
            </button>
         </div>

         {/* Contenido Scrollable */}
         <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                
                {/* Header del Artículo */}
                <header className="mb-10 text-center">
                    <span className="inline-block px-3 py-1 border border-cyan-500/50 rounded-full text-[10px] text-cyan-400 mb-4 tracking-widest uppercase bg-cyan-900/10">
                       {log.category || "ENSAYO"}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight font-serif">
                       {log.title}
                    </h1>
                    
                    {/* Autor Verificado (Anti-Bot) */}
                    <div className="flex items-center justify-center gap-4">
                        <img src="https://i.pravatar.cc/150?u=writer" alt="Author" className="w-12 h-12 rounded-full border-2 border-yellow-500 p-0.5" />
                        <div className="text-left">
                           <p className="text-white font-bold text-sm flex items-center gap-1">
                              {log.author || "Elena_Writer"} 
                              <span className="text-blue-400" title="Verificado">☑</span>
                           </p>
                           <p className="text-[10px] text-yellow-500 font-mono bg-yellow-900/20 px-1 rounded inline-block">
                              AUTÓNOMO VERIFICADO ID: #8821
                           </p>
                        </div>
                    </div>
                </header>

                {/* Cuerpo del Texto */}
                <article className="prose prose-invert prose-lg mx-auto font-light text-gray-300 leading-relaxed space-y-6">
                    <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-white first-letter:float-left first-letter:mr-3">
                       En las profundidades del código que estructura nuestra nueva economía, encontramos patrones que se repiten. 
                       La descentralización del comercio local no es solo una utopía técnica, es una necesidad social.
                    </p>
                    <p>
                       Cuando caminamos por la ciudad usando <strong>BRO7VISION</strong>, no solo vemos ofertas; vemos el pulso 
                       de miles de emprendedores. La "Moon Matrix" actúa como un regulador natural, similar a las mareas.
                    </p>
                    <blockquote className="border-l-4 border-fuchsia-500 pl-4 italic text-white my-8 bg-white/5 p-4 rounded-r-lg">
                       "El futuro no es lo que viene, es lo que construimos mientras navegamos el caos."
                    </blockquote>
                    <p>
                       Al final del día, la tecnología debe servir para unir lo físico y lo digital, no para aislarnos en pantallas. 
                       Este ensayo propone una nueva forma de entender el valor: no como acumulación, sino como flujo.
                    </p>
                    
                    {/* Imagen dentro del artículo */}
                    <div className="my-8 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                       <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80" alt="Cyberpunk City" className="w-full h-64 object-cover opacity-80 hover:opacity-100 transition-opacity" />
                       <p className="text-center text-[10px] text-gray-500 py-2 bg-black">Fig 1. La visualización de datos en entornos urbanos.</p>
                    </div>

                    <p>
                       Gracias por leer y apoyar el contenido independiente verificado.
                    </p>
                </article>

                {/* Footer del Artículo */}
                <div className="mt-16 pt-8 border-t border-white/10 text-center">
                    <button className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-cyan-400 transition-all shadow-lg">
                       👏 APLAUDIR AL AUTOR (Donar Créditos)
                    </button>
                </div>

            </div>
         </div>

      </div>
      )}
    </div>
  );
};

export default BroLogViewer;