// src/components/LegalBar.jsx
import React, { useState, useEffect } from 'react';

const LegalBar = () => {
  const [accepted, setAccepted] = useState(true); // Asumimos true para evitar flash
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('bro7_legal_consent');
    if (!consent) setAccepted(false);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('bro7_legal_consent', 'true');
    setAccepted(true);
  };

  const handleContact = () => {
    window.location.href = "ehgartnerrober@gmail.com"; // CAMBIA ESTO POR TU EMAIL REAL
  };

  // SI NO HA ACEPTADO, MOSTRAMOS LA BARRA GDPR NEÓN
  if (!accepted) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[99999] bg-black/95 border-t-2 border-cyan-500 p-4 md:p-6 shadow-[0_-10px_40px_rgba(6,182,212,0.3)] animate-slideUp">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-cyan-400 font-black uppercase text-sm mb-1">🍪 PROTOCOLO DE PRIVACIDAD</h4>
            <p className="text-gray-400 text-xs font-mono">
              Usamos cookies técnicas para gestionar la sesión de Supabase y la configuración de tu HoloPrisma. 
              Al navegar por BRO7VISION aceptas nuestra realidad simulada y el tratamiento de datos según el RGPD.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
             <button onClick={handleContact} className="text-xs text-gray-500 hover:text-white underline px-2">
                CONTACTO
             </button>
             <button 
                onClick={handleAccept}
                className="bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs px-6 py-3 rounded-lg uppercase tracking-widest transition-all shadow-[0_0_15px_cyan]"
             >
                ACEPTAR PROTOCOLO
             </button>
          </div>
        </div>
      </div>
    );
  }

  // SI YA ACEPTÓ, DEJAMOS UN MINI LINK DE CONTACTO DISCRETO (Opcional, abajo a la derecha)
  return (
    <div className="fixed bottom-2 right-2 z-[60] opacity-50 hover:opacity-100 transition-opacity">
        <button 
            onClick={() => setShowModal(!showModal)}
            className="text-[8px] text-gray-500 font-mono border border-white/10 px-2 py-1 rounded bg-black/50 backdrop-blur hover:bg-white hover:text-black"
        >
            LEGAL / CONTACTO
        </button>
        
        {showModal && (
            <div className="absolute bottom-8 right-0 w-48 bg-black border border-white/20 p-2 rounded flex flex-col gap-1">
                <button onClick={handleContact} className="text-left text-xs text-white hover:text-cyan-400 p-2 hover:bg-white/10 rounded">📧 Enviar Email</button>
                <div className="h-px bg-white/10"></div>
                <p className="text-[7px] text-gray-500 p-2">
                    BRO7VISION © 2026<br/>
                    Todos los derechos reservados.<br/>
                    Proyecto Fase 0 (Beta).
                </p>
            </div>
        )}
    </div>
  );
};

export default LegalBar;