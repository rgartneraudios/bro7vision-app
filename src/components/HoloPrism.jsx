import React from 'react';

const DEFAULT_IMGS = [
    "/images/prism_1.jpg", 
    "/images/prism_2.jpg", 
    "/images/prism_3.jpg", 
    "/images/prism_4.jpg"
];

const HoloPrism = ({ user }) => {
  let images = DEFAULT_IMGS; // Por defecto

  if (user) {
    // 1. ¿Tiene el formato MASTER_DB (array)?
    if (user.holo_images && Array.isArray(user.holo_images)) {
      images = user.holo_images;
    } 
    // 2. ¿Tiene el formato Supabase (campos individuales)?
    else if (user.holo_1 || user.holo_2 || user.holo_3 || user.holo_4) {
      images = [
        user.holo_1 || DEFAULT_IMGS[0],
        user.holo_2 || DEFAULT_IMGS[1],
        user.holo_3 || DEFAULT_IMGS[2],
        user.holo_4 || DEFAULT_IMGS[3]
      ];
    }
  }
    
  return (
    <div className="fixed top-4 right-4 md:top-[2%] md:right-[2%] z-[50] pointer-events-none perspective-[1000px] scale-45 md:scale-75 lg:scale-90 origin-top-right">
       <div className="relative w-48 h-80 animate-spin-slow-3d" style={{ transformStyle: 'preserve-3d' }}>
          {images.map((img, index) => {
             let transform = '';
             let borderColor = '';
             
             if (index === 0) { transform = 'translateZ(40px)'; borderColor = 'border-cyan-500'; }
             if (index === 1) { transform = 'rotateY(180deg) translateZ(40px)'; borderColor = 'border-fuchsia-500'; }
             if (index === 2) { transform = 'rotateY(90deg) translateZ(40px)'; borderColor = 'border-yellow-500'; }
             if (index === 3) { transform = 'rotateY(-90deg) translateZ(40px)'; borderColor = 'border-green-500'; }

             return (
                <div key={index} className={`absolute inset-0 bg-black/20 border-2 ${borderColor} overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]`} style={{ transform }}>
                   <img src={img} alt={`Holo ${index}`} className="w-full h-full object-cover opacity-100" />
                </div>
             );
          })}
       </div>
    </div>
  );
};

export default HoloPrism;