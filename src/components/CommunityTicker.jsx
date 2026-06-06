import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const FAKE_TWITS = [
    { alias: 'Neo_Runner', twit_message: 'He perdido un drón en la Zona 4. Recompensa.' },
    { alias: 'Cyber_Rose', twit_message: 'Buscando bajista para banda Synthwave.' },
    { alias: 'Sys_Admin',  twit_message: 'Mantenimiento de nodos esta noche.' }
  ];

const CommunityTicker = ({ onUserClick }) => {
  const [messages, setMessages] = useState(FAKE_TWITS);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('alias, twit_message, banner_url, id')
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
    }, 6000);
    return () => clearInterval(timer);
  }, [messages]);

  const msg = messages[currentIndex];
  const colorMap = {
    cyan: '#00E1FF', fuchsia: '#FF007D', yellow: '#FFD700', 
    green: '#00FF48', red: '#FF1A1A', blue: '#006AED', orange: '#FF8000'
  };
  // Asignar color por hash simple de id o alias
  const getColor = (m) => {
    if (!m) return '#00E1FF';
    const str = m.id || m.alias || '';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    const keys = Object.keys(colorMap);
    return colorMap[keys[Math.abs(hash) % keys.length]];
  };
  const activeColor = getColor(msg);

  return (
    <div className="w-full h-full animate-slideInRight pointer-events-auto">
        <div  
            onClick={() => msg.id && onUserClick?.(msg)}
            className="relative w-full h-full flex flex-col bg-black/80 backdrop-blur-2xl border rounded-[1.8rem] overflow-hidden transition-all duration-500 group cursor-pointer"
            style={{ 
                borderColor: `${activeColor}30`,
                boxShadow: `0 0 20px ${activeColor}15`
            }}
        >
            {/* Header más pequeño */}
            <div className="p-3 pb-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[8px] animate-pulse" style={{ color: activeColor }}>●</span>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30">LIVE FEED</p>
                </div>

                <div className="flex flex-col items-center gap-2 mt-1">
                    {/* AVATAR ACHICADO (de w-20 a w-12) */}
                    <div className="w-36 h-48 rounded-xl overflow-hidden border shadow-lg"
                             style={{ borderColor: activeColor }}>
                            {msg.banner_url ? (
                                <img src={msg.banner_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-black bg-black text-white">
                                    {msg.alias?.[0]?.toUpperCase() ?? "?"}
                                </div>
                            )}
                    </div>
                    <p className="text-xs font-black tracking-tighter" style={{ color: activeColor }}>
                        @{msg.alias?.toUpperCase() ?? ""}
                    </p>
                </div>
            </div>

            {/* MENSAJE (Texto ajustado a tamaño base) */}
            <div className="flex-1 flex items-center justify-center px-5 text-center">
                <p className="text-sm font-normal italic leading-tight text-white/90">
                    "{msg.twit_message}"
                </p>
            </div>

            {/* Footer mini */}
            <div className="p-2 mt-auto bg-white/5 flex justify-end">
                <span className="text-xs group-hover:translate-x-1 transition-transform" style={{ color: activeColor }}>➔</span>
            </div>
        </div>
    </div>
  );
  };

export default CommunityTicker;