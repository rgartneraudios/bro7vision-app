import React from 'react';

export default function MascotGuide({ step }) {
  
  // --- CONFIGURACIÓN DE ESTILOS (Solo Imagen) ---
  let containerConfig = "";
  let imgSize = "";

  // Posición Base: Siempre abajo a la derecha
  const BASE_RIGHT = "bottom-0 right-4 md:right-8 flex-col items-end";

  if (step === 0) {
    // === MODO HOME (GIGANTE) ===
    // En la portada el mapache es protagonista
    containerConfig = `${BASE_RIGHT}`; 
    imgSize = "w-48 h-48 md:w-96 md:h-96"; 
  } 
  else {
    // === MODO NEXUS Y DISPLAY (ACOMPAÑANTE) ===
    // En el resto de la app se hace un poco más pequeño para no molestar
    containerConfig = `${BASE_RIGHT}`; 
    imgSize = "w-40 h-40 md:w-64 md:h-64 hover:scale-105"; 
  }

 // src/components/MascotGuide.jsx

// ...
  return (
    // CAMBIO: 'hidden md:block' oculta el mapache en móvil, lo muestra en PC
    <div className="fixed bottom-0 right-8 z-50 pointer-events-none hidden md:block">
        <div className="relative w-48 h-48">
            <img src="/mascot.png" className="w-full h-full object-contain drop-shadow-2xl animate-bounce-slow" alt="Mascot" />
            {/* ... el resto del bocadillo ... */}
        </div>
    </div>
  );
}