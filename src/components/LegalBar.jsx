// src/components/LegalBar.jsx (SOLO BARRA INFERIOR)
import React, { useState, useEffect } from 'react';

const LegalBar = ({ onOpenLegal }) => {
  const [accepted, setAccepted] = useState(true); 

  useEffect(() => {
    const consent = localStorage.getItem('bro7_legal_consent');
    if (!consent) setAccepted(false);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('bro7_legal_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null; // Si ya aceptó, desaparece totalmente

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99999] bg-black/95 border-t border-cyan-500 p-4 shadow-[0_-10px_40px_rgba(6,182,212,0.2)] animate-slideUp">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <p className="text-gray-400 text-[10px] md:text-xs font-mono">
          <strong className="text-cyan-400">🍪 PROTOCOLO:</strong> Usamos cookies técnicas para que la Matrix funcione. 
          Al continuar, aceptas la simulación. 
          <button onClick={onOpenLegal} className="ml-2 underline text-white hover:text-cyan-400">Ver Políticas</button>
        </p>
        <button 
           onClick={handleAccept}
           className="bg-cyan-600 hover:bg-cyan-500 text-black font-black text-[10px] px-6 py-2 rounded uppercase tracking-widest transition-all shadow-[0_0_10px_cyan]"
        >
           ACEPTAR
        </button>
      </div>
    </div>
  );
};

export default LegalBar;