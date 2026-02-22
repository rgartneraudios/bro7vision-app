// src/components/HoloPrism.jsx
import React from 'react';

// Imágenes locales por defecto (Asegúrate de que existen en public/images/)
const DEFAULT_IMGS = [
    "/images/prism_1.jpg", 
    "/images/prism_2.jpg", 
    "/images/prism_3.jpg", 
    "/images/prism_4.jpg"
];

const HoloPrism = ({ customImages }) => {
  // Verificamos si llegan imágenes. Si no, usamos las locales.
  const hasImages = customImages && customImages.length === 4 && customImages[0];
  const imagesToShow = hasImages ? customImages : DEFAULT_IMGS;

  console.log("💎 PRISMA RENDERIZANDO:", imagesToShow); // <--- DEBUG: MIRA ESTO EN CONSOLA

  return (
  <div className="fixed top-4 right-4 md:top-[2%] md:right-[2%] z-[50] pointer-events-none perspective-[1000px] scale-45 md:scale-75 lg:scale-90 origin-top-right">
         <div className="relative w-48 h-72 animate-spin-slow-3d" style={{ transformStyle: 'preserve-3d' }}>
          {imagesToShow.map((img, index) => {
             let transform = '';
             let borderColor = '';
             
             if (index === 0) { transform = 'translateZ(40px)'; borderColor = 'border-cyan-500'; }
             if (index === 1) { transform = 'rotateY(180deg) translateZ(40px)'; borderColor = 'border-fuchsia-500'; }
             if (index === 2) { transform = 'rotateY(90deg) translateZ(40px)'; borderColor = 'border-yellow-500'; }
             if (index === 3) { transform = 'rotateY(-90deg) translateZ(40px)'; borderColor = 'border-green-500'; }

             return (
                <div key={index} className={`absolute inset-0 bg-black/20 border-2 ${borderColor} overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]`} style={{ transform }}>
                   <img 
                      src={img} 
                      alt={`Holo ${index}`} 
                      // IMPORTANTE: SIN crossOrigin NI referrerPolicy para máxima compatibilidad
                      onError={(e) => {
                          console.error("❌ Fallo al cargar imagen prisma:", img);
                          e.target.onerror = null; 
                          e.target.src = DEFAULT_IMGS[index]; // Si falla, usa la local
                      }}
                      className="w-full h-full object-cover opacity-100" 
                   />
                </div>
             );
          })}
       </div>
    </div>
  );
};

export default HoloPrism;