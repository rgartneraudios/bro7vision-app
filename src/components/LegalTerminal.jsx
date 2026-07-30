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
             "Construyendo puentes digitales entre la realidad y la ficción. <br/>Estética Digital Neon Art."
           </p>

           {/* DATOS DE CONTACTO VISIBLES */}
<div className="w-full mt-auto mb-4 bg-white/5 rounded-xl p-5 border border-white/10">
   <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Contacto Oficial</p>
   
   <div className="space-y-4">
      {/* Contacto General - Color Cian Neón */}
      <div>
         <p className="text-[8px] text-cyan-400 uppercase tracking-widest mb-1">General</p>
         <p className="text-cyan-400 font-mono font-bold text-sm drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">contacto@bro7vision.com</p>
      </div>

      {/* Fundadores - Color Rosa Neón */}
      <div>
         <p className="text-[8px] text-pink-400 uppercase tracking-widest mb-1">Fundadores</p>
         <p className="text-pink-400 font-mono font-bold text-sm drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]">fundadores@bro7vision.com</p>
      </div>

      {/* Inversores - Color Azul Eléctrico Neón */}
      <div>
         <p className="text-[8px] text-blue-400 uppercase tracking-widest mb-1">Inversores</p>
         <p className="text-blue-400 font-mono font-bold text-sm drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]">bro7vision@bro7vision.com</p>
      </div>
   </div>
   
   <div className="w-full h-[1px] bg-white/10 my-6"></div>
   <a href="https://www.linkedin.com/in/rober-ehgartner-74a10a124/" target="_blank" className="text-[10px] text-gray-400 hover:text-white underline transition-all">
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
  <h4 className="text-cyan-300 font-bold mb-2">1. NATURALEZA DEL ECOSISTEMA</h4>
  <p>BRO7VISION es una plataforma experimental de gamificación social en fase Beta privada. La Fase 0 (Lunas) es un entorno de simulación diseñado para el entrenamiento de usuarios y validación técnica, exento de transacciones financieras con moneda fiduciaria.</p>
</section>

<section>
  <h4 className="text-cyan-300 font-bold mb-2">2. PRIVACIDAD Y SEGURIDAD</h4>
  <p>Priorizamos tu privacidad. Utilizamos Supabase para una autenticación segura y cifrada. Los datos de geolocalización (si son activados) se procesan exclusivamente en el dispositivo del usuario para optimizar la experiencia local y no se almacenan de forma persistente en nuestros servidores.</p>
</section>

<section>
  <h4 className="text-cyan-300 font-bold mb-2">3. ECONOMÍA DIGITAL</h4>
  <p>Los "Puntos Lunas", "Moon Cupones" y "Moon Packs" constituyen un sistema cerrado de lealtad y gamificación interna. No representan criptomonedas, activos financieros, ni valores regulables bajo la normativa de la CNMV o MiCA en su estado actual de simulación.</p>
</section>

<section>
  <h4 className="text-cyan-300 font-bold mb-2">4. PROPIEDAD INTELECTUAL</h4>
  <p>La arquitectura del sistema, el diseño visual "Neón Bioluminiscente" y los conceptos de la "Moon Matrix" son propiedad intelectual exclusiva de RGartner. Todo contenido generado por los usuarios sigue siendo propiedad de sus respectivos autores bajo licencia de uso dentro del ecosistema.</p>
</section>              
              <div className="pt-8 text-center opacity-50">
                  <p>Bro7Vision © {new Date().getFullYear()}</p>
                  <p>Hecho a mano + IA</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default LegalTerminal;