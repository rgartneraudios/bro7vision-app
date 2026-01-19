// src/components/LegalTerminal.jsx
import React, { useState } from 'react';

const LegalTerminal = ({ onClose }) => {
  const [tab, setTab] = useState('contact'); // Empieza en contacto

  // DATOS A RELLENAR POR TI
  const INFO = {
      email: "ehgartnerrober@gmail.com", // Tu email real
      owner: "BRO7VISION TEAM", // O tu nombre real si eres autónomo
      location: "Calle rio Sella 25 1º izquierda, Oviedo, España (33010)"
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm bg-black/80">
      <div className="w-full max-w-4xl h-[80vh] bg-[#0a0a0a] border border-gray-600 shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-lg flex flex-col overflow-hidden font-mono text-xs md:text-sm">
        
        {/* HEADER */}
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <h2 className="text-white font-bold uppercase tracking-widest">SISTEMA LEGAL & CONTACTO</h2>
            </div>
            <button onClick={onClose} className="text-red-500 hover:text-red-400 font-bold px-2">[ CERRAR X ]</button>
        </div>

        {/* NAVEGACIÓN */}
        <div className="flex bg-black border-b border-gray-800 overflow-x-auto">
            <button onClick={() => setTab('contact')} className={`px-6 py-3 font-bold uppercase transition-colors ${tab === 'contact' ? 'bg-cyan-900/30 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-white'}`}>📧 Contacto</button>
            <button onClick={() => setTab('legal')} className={`px-6 py-3 font-bold uppercase transition-colors ${tab === 'legal' ? 'bg-gray-800 text-white border-b-2 border-white' : 'text-gray-500 hover:text-white'}`}>⚖️ Aviso Legal</button>
            <button onClick={() => setTab('privacy')} className={`px-6 py-3 font-bold uppercase transition-colors ${tab === 'privacy' ? 'bg-gray-800 text-white border-b-2 border-white' : 'text-gray-500 hover:text-white'}`}>🔒 Privacidad</button>
            <button onClick={() => setTab('cookies')} className={`px-6 py-3 font-bold uppercase transition-colors ${tab === 'cookies' ? 'bg-gray-800 text-white border-b-2 border-white' : 'text-gray-500 hover:text-white'}`}>🍪 Cookies</button>
        </div>

        {/* CONTENIDO (SCROLLABLE) */}
        <div className="flex-1 p-8 overflow-y-auto bg-black text-gray-300 leading-relaxed custom-scrollbar">
            
            {/* 1. CONTACTO */}
            {tab === 'contact' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                    <div className="text-6xl mb-4">📨</div>
                    <h3 className="text-2xl text-white font-bold">CANAL ABIERTO</h3>
                    <p className="max-w-md">
                        Para consultas sobre la Fase 0, propuestas de inversión o soporte técnico, contacta directamente con el Arquitecto del sistema.
                    </p>
                    <a href={`mailto:${INFO.email}`} className="text-2xl text-cyan-400 font-black hover:underline tracking-widest border border-cyan-500 px-8 py-4 rounded hover:bg-cyan-900/20 transition-all">
                        {INFO.email}
                    </a>
                    <p className="text-xs text-gray-600 mt-8">Tiempo de respuesta estimado: 24h - 48h</p>
                </div>
            )}

            {/* 2. AVISO LEGAL */}
            {tab === 'legal' && (
                <div className="space-y-4">
                    <h3 className="text-xl text-white font-bold border-b border-gray-700 pb-2">1. INFORMACIÓN GENERAL</h3>
                    <p>En cumplimiento con el deber de información recogido en la normativa de Servicios de la Sociedad de la Información y del Comercio Electrónico, se indican los siguientes datos:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-400">
                        <li><strong>Titular del Proyecto:</strong> {INFO.owner}</li>
                        <li><strong>Ubicación:</strong> {INFO.location}</li>
                        <li><strong>Contacto:</strong> {INFO.email}</li>
                        <li><strong>Naturaleza:</strong> Proyecto tecnológico en Fase Beta (Fase 0). Sin transacciones económicas directas en la plataforma actual.</li>
                    </ul>
                    <h3 className="text-xl text-white font-bold border-b border-gray-700 pb-2 mt-8">2. OBJETO</h3>
                    <p>BRO7VISION es una plataforma experimental de gamificación social ("Web App"). El acceso es gratuito. Los "Puntos Génesis" son una moneda virtual ficticia sin valor monetario real fuera de la plataforma durante la Fase 0.</p>
                </div>
            )}

            {/* 3. PRIVACIDAD */}
            {tab === 'privacy' && (
                <div className="space-y-4">
                    <h3 className="text-xl text-white font-bold border-b border-gray-700 pb-2">POLÍTICA DE PRIVACIDAD (GDPR)</h3>
                    <p>En BRO7VISION nos tomamos muy en serio tu privacidad. Esta política explica cómo tratamos tus datos.</p>
                    
                    <h4 className="text-white font-bold mt-4">1. RESPONSABLE DEL TRATAMIENTO</h4>
                    <p>El responsable es {INFO.owner}. Contacto: {INFO.email}.</p>

                    <h4 className="text-white font-bold mt-4">2. QUÉ DATOS RECOGEMOS</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-400">
                        <li><strong>Registro:</strong> Email y contraseña (encriptada).</li>
                        <li><strong>Perfil:</strong> Alias, enlaces a redes sociales y preferencias visuales (configuración del HoloPrisma).</li>
                        <li><strong>Actividad:</strong> Puntuaciones en juegos y saldo de puntos ficticios.</li>
                    </ul>

                    <h4 className="text-white font-bold mt-4">3. FINALIDAD</h4>
                    <p>Gestionar tu cuenta de usuario, permitir el acceso a las funcionalidades de la web y guardar tu progreso en los juegos. No vendemos tus datos a terceros.</p>

                    <h4 className="text-white font-bold mt-4">4. TUS DERECHOS</h4>
                    <p>Puedes solicitar el acceso, rectificación o eliminación total de tu cuenta enviando un email a {INFO.email}.</p>
                </div>
            )}

            {/* 4. COOKIES */}
            {tab === 'cookies' && (
                <div className="space-y-4">
                    <h3 className="text-xl text-white font-bold border-b border-gray-700 pb-2">POLÍTICA DE COOKIES</h3>
                    <p>Una cookie es un pequeño fichero de texto que se almacena en tu navegador.</p>

                    <h4 className="text-white font-bold mt-4">COOKIES QUE USAMOS</h4>
                    <div className="border border-gray-700 rounded p-4 bg-gray-900/50">
                        <p className="text-cyan-400 font-bold">1. Técnicas (Necesarias)</p>
                        <p className="mb-2">Son imprescindibles para que la web funcione (ej: mantener tu sesión iniciada con Supabase, recordar si has aceptado este aviso).</p>
                        
                        <p className="text-cyan-400 font-bold">2. Preferencias</p>
                        <p>Para recordar el volumen de la radio o tu configuración visual.</p>
                    </div>

                    <p className="mt-4">Al no haber publicidad de terceros ni analíticas invasivas en esta Fase 0, no utilizamos cookies de rastreo publicitario.</p>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default LegalTerminal;