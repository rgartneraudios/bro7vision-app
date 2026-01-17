// src/components/HoloPrism.jsx (FIX IMAGEN POSTIMAGES)
import React from 'react';

const DEFAULT_IMAGES = ["/images/prism_1.jpg", "/images/prism_2.jpg", "/images/prism_3.jpg", "/images/prism_4.jpg"];

const HoloPrism = ({ customImages }) => {
  const imagesToShow = customImages && customImages.length === 4 ? customImages : DEFAULT_IMAGES;

  return (
    // CAMBIO: Centrado móvil, Derecha PC
    <div className="fixed top-4 left-1/2 -translate-x-1/2 md:top-[11%] md:right-24 md:left-auto md:translate-x-0 z-[50] pointer-events-none perspective-[1000px] scale-45 md:scale-100 origin-top">
       <div className="relative w-32 h-56 animate-spin-slow-3d" style={{ transformStyle: 'preserve-3d' }}>
          {imagesToShow.map((img, index) => {
             let transform = '';
             let borderColor = '';
             if (index === 0) { transform = 'translateZ(40px)'; borderColor = 'border-cyan-500/50'; }
             if (index === 1) { transform = 'rotateY(180deg) translateZ(40px)'; borderColor = 'border-fuchsia-500/50'; }
             if (index === 2) { transform = 'rotateY(90deg) translateZ(40px)'; borderColor = 'border-yellow-500/50'; }
             if (index === 3) { transform = 'rotateY(-90deg) translateZ(40px)'; borderColor = 'border-green-500/50'; }

             return (
                <div key={index} className={`absolute inset-0 bg-black/80 border ${borderColor} overflow-hidden`} style={{ transform }}>
                   {/* AQUI ESTÁ EL FIX: referrerPolicy="no-referrer" */}
                   <img 
                      src={img} 
                      alt={`View ${index}`} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {e.target.src = 'https://via.placeholder.com/150?text=NO+IMG'}}
                      className="w-full h-full object-cover opacity-80" 
                   />
                </div>
             );
          })}
       </div>
    </div>
  );
};

export default HoloPrism;