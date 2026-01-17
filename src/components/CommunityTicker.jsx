// src/components/CommunityTicker.jsx (VERSIÓN TRANSPARENTE / GLASS)
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const FAKE_TWITS = [
    { alias: 'Neo_Runner', twit_message: 'He perdido un dron en la Zona 4. Recompensa.', card_color: 'cyan' },
    { alias: 'Bar_Manolo', twit_message: '¡Tortilla recién hecha! 2x1 hasta las 12h.', card_color: 'yellow' },
    { alias: 'Cyber_Rose', twit_message: 'Buscando bajista para banda Synthwave.', card_color: 'fuchsia' },
    { alias: 'Sys_Admin',  twit_message: 'Mantenimiento de nodos esta noche.', card_color: 'red' },
    { alias: 'Viker_88',   twit_message: '¡Qué partidazo del Betis anoche! ⚽💚', card_color: 'green' }
];

const CommunityTicker = ({ onUserClick }) => {
  const [messages, setMessages] = useState(FAKE_TWITS);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('alias, twit_message, card_color, avatar_url, id')
          .neq('twit_message', '')
          .neq('twit_message', null)
          .limit(10);

        if (data && data.length > 0) {
          setMessages([...data, ...FAKE_TWITS].sort(() => Math.random() - 0.5));
        }
      } catch (e) { console.error("Error fetching twits:", e); }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [messages]);

  const msg = messages[currentIndex];

  return (
    <div className="absolute top-32 md:top-8 left-1/2 -translate-x-1/2 pointer-events-auto z-40 w-full max-w-4xl animate-slideDown px-4">
        
        <div 
            onClick={() => onUserClick && onUserClick(msg)}
            className={`
                relative 
                bg-black/60 backdrop-blur-md  /* <--- CAMBIO: Transparencia al 60% */
                border border-${msg.card_color || 'cyan'}-500/50 
                rounded-full py-2 px-5 shadow-[0_0_30px_rgba(0,0,0,0.3)] cursor-pointer
                flex items-center gap-4 transition-all 
                hover:scale-105 hover:bg-black/80 hover:border-${msg.card_color || 'cyan'}-400 group
            `}
        >
            {/* AVATAR */}
            <div className={`w-10 h-10 rounded-full bg-${msg.card_color || 'cyan'}-500 flex items-center justify-center font-black text-black text-sm shrink-0 border border-white/20 shadow-lg`}>
                {msg.alias[0].toUpperCase()}
            </div>

            {/* ZONA DE TEXTO */}
            <div className="flex-1 overflow-hidden flex flex-col justify-center">
                
                {/* CABECERA */}
                <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`text-[10px] font-black uppercase text-${msg.card_color || 'cyan'}-400 tracking-widest group-hover:underline shadow-black drop-shadow-sm`}>
                        @{msg.alias}
                    </p>
                    <span className="text-[8px] text-gray-400 font-mono tracking-widest opacity-80">LIVE FEED</span>
                </div>

                {/* MENSAJE (Con sombra extra para leerse bien sobre fondo transparente) */}
                <p className="text-base md:text-lg text-white truncate font-bold italic tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pb-0.5">
                    "{msg.twit_message}"
                </p>
            </div>

            {/* FLECHA */}
            <span className="text-gray-400 text-lg group-hover:text-white transition-colors">➔</span>
        </div>
    </div>
  );
};

export default CommunityTicker;