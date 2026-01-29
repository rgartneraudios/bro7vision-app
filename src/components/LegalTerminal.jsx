// src/components/LegalTerminal.jsx
import React from 'react';

const LegalTerminal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
      {/* Fondo oscuro traslúcido */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>

      {/* Contenedor Principal Estilo HUD */}
      <div className="relative w-full max-w-5xl h-[80vh] bg-black border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col md:flex-row">
        
        {/* === COLUMNA IZQUIERDA: EL CREADOR (RGartner) === */}
        <div className="w-full md:w-1/3 bg-gradient-to-b from-[#0a0a0a] to-[#050505] border-r border-cyan-500/20 p-8 flex flex-col items-center text-center relative">
           
           {/* Decoración superior */}
           <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

           <h2 className="text-cyan-400 font-black tracking-widest uppercase mb-8 mt-4 text-xl">Arquitectura</h2>

           {/* FOTO DE PERFIL (Ruta Corregida) */}
           <div className="relative w-40 h-40 mb-6 group">
              <div className="absolute inset-0 rounded-full bg-cyan-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img 
                src="/images/rgartner.jpg" 
                alt="RGartner" 
                className="w-full h-full object-cover rounded-full border-2 border-cyan-500/50 shadow-2xl relative z-10 grayscale group-hover:grayscale-0 transition-all duration-500"
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://placehold.co/400x400/000000/06b6d4/png?text=RG';
                }} 
              />
           </div>

           <h3 className="text-2xl text-white font-bold font-mono mb-1">RGartner</h3>
           <p className="text-[10px] text-cyan-200 uppercase tracking-widest mb-6">Founder & Lead Dev</p>

           <p className="text-gray-400 text-sm italic mb-8 leading-relaxed">
             "Construyendo puentes digitales entre la realidad y la ficción. <br/>Estética Pandora Nocturno."
           </p>

           {/* DATOS DE CONTACTO VISIBLES */}
           <div className="w-full mt-auto mb-4 bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">Contacto Oficial</p>
              
              {/* Email en texto plano y visible */}
              <p className="text-cyan-400 font-mono font-bold text-sm md:text-base break-all selection:bg-cyan-500 selection:text-black">
                ehgartnerrober@gmail.com
              </p>
              
              <div className="w-full h-[1px] bg-white/10 my-3"></div>
              
              {/* Link a LinkedIn (Opcional, si tienes la URL ponla aquí) */}
              <a href="https://www.linkedin.com/in/rober-ehgartner-74a10a124/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white hover:underline transition-colors">
                 LinkedIn Profile &rarr;
              </a>
           </div>
        </div>

        {/* === COLUMNA DERECHA: TEXTO LEGAL === */}
        <div className="flex-1 bg-black p-8 relative flex flex-col">
           <button onClick={onClose} className="absolute top-6 right-6 text-gray-600 hover:text-red-500 transition-colors font-bold text-lg">✕</button>
           
           <h2 className="text-gray-500 font-mono text-sm uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Protocolos Legales & Privacidad</h2>
           
           <div className="overflow-y-auto custom-scrollbar pr-4 space-y-6 text-gray-400 text-xs font-mono leading-relaxed text-justify">
              <section>
                <h4 className="text-white font-bold mb-2">1. FINALIDAD DEL ECOSISTEMA</h4>
                <p>BRO7VISION es una plataforma experimental de gamificación (PWA). Fase 0 (Génesis) es un entorno de simulación sin transacciones financieras reales vinculadas a moneda fiduciaria obligatoria.</p>
              </section>

              <section>
                <h4 className="text-white font-bold mb-2">2. PRIVACIDAD Y DATOS</h4>
                <p>No vendemos tus datos. Utilizamos Supabase para autenticación segura. Tu ubicación GPS (si la activas) se procesa en tu dispositivo para mostrar contenido local y no se almacena históricamente en nuestros servidores.</p>
              </section>

              <section>
                <h4 className="text-white font-bold mb-2">3. ECONOMÍA SIMULADA</h4>
                <p>Los "Puntos Génesis" y "Moon Coins" son activos digitales de entretenimiento. No constituyen criptomonedas ni títulos valores regulados por la CNMV en esta fase.</p>
              </section>

              <section>
                <h4 className="text-white font-bold mb-2">4. PROPIEDAD INTELECTUAL</h4>
                <p>El código, diseño "Neón Bioluminiscente" y conceptos (Moon Matrix, HoloPrisma) son propiedad intelectual de RGartner. El contenido subido por usuarios pertenece a sus autores.</p>
              </section>
              
              <div className="pt-8 text-center opacity-50">
                  <p>Bro7Vision © {new Date().getFullYear()}</p>
                  <p>Hecho a mano + IA Copilot</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default LegalTerminal;