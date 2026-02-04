// src/components/HoloProjector.jsx
import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const HoloProjector = ({ videoUrl, user, balances, setBalances, session, onClose, onOpenLog }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeReaction, setActiveReaction] = useState(null);
  const [question, setQuestion] = useState("");
  
  const videoRef = useRef(null);

  // --- 1. SELECCIÓN DE VIDEO DE FONDO (NATURAL) ---
  const bgKey = user.intimo_bg && user.intimo_bg !== "" ? user.intimo_bg : 'dormitorio';
const backgroundVideo = `/videos/intimo_${bgKey}.mp4`;

  const getCleanUrl = (url) => {
    if (!url) return "";
    let clean = url.trim();
    if (clean.includes('dropbox.com')) {
        clean = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('&dl=0', '');
        return clean.includes('?') ? `${clean}&raw=1` : `${clean}?raw=1`;
    }
    return clean;
  };

  const handleSendHalo = async () => {
    if (balances.genesis < 100) { alert("SIN GÉNESIS"); return; }
    const newGenesis = balances.genesis - 100;
    setBalances(prev => ({ ...prev, genesis: newGenesis }));
    setActiveReaction(true);
    setTimeout(() => setActiveReaction(null), 5500);
    await supabase.from('profiles').update({ genesis: newGenesis }).eq('id', session.user.id);
  };

  const handleSendQuestion = async () => {
     if(!question.trim()) return;
     // ENVIAMOS LA PREGUNTA COMO UN ECO ESPECIAL (TIPO PREGUNTA)
     const { error } = await supabase.from('bro_echos').insert([{
         target_profile_id: user.id,
         author_alias: session.user.user_metadata.alias || 'Anónimo',
         text: `❓ PREGUNTA: ${question.toUpperCase()}`,
         is_creator: false
     }]);
     if (!error) {
         alert("Pregunta enviada al buzón del creador.");
         setQuestion("");
     }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black overflow-hidden flex items-center justify-center font-mono">
        
        {/* VIDEO DE FONDO NATURAL (SIN CAPAS NEGRAS) */}
        <video src={backgroundVideo} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />

        {/* HALO MEDUSA */}
        {activeReaction && (
          <div className="fixed inset-0 pointer-events-none z-[100000]">
              <div className="absolute bottom-10 right-[15%] animate-glowSwim">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-[60px] animate-pulse"></div>
                      <div className="absolute w-14 h-14 bg-white rounded-full shadow-[0_0_50px_white]"></div>
                      <div className="absolute w-full h-full animate-spin-slow">
                           <div className="absolute top-0 left-1/2 w-6 h-6 bg-white rounded-full blur-sm shadow-[0_0_20px_white]"></div>
                      </div>
                  </div>
              </div>
          </div>
        )}

        {/* VISOR VERTICAL (FUSIÓN CREMA) */}
        <div className="relative z-20 h-[88vh] aspect-[9/16] rounded-[3.5rem] border-[3px] border-[#FFFDD0]/30 shadow-[0_0_40px_rgba(255,253,208,0.15)] flex flex-col overflow-hidden bg-black">
            
            <video 
                ref={videoRef}
                src={getCleanUrl(videoUrl)} 
                autoPlay loop playsInline muted={isMuted}
                className="absolute inset-0 w-full h-full object-cover" 
                onTimeUpdate={() => setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)}
            />

            {/* RESPUESTA DEL CREADOR (BUCLE) - Flota sobre el video */}
            <div className="absolute top-32 left-0 w-full px-6 z-30 pointer-events-none">
                <div className="animate-spirit">
                    <p className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-[11px] text-[#FFFDD0] italic text-center shadow-xl">
                        "{user.creator_loop_reply || "Hola! Deja tu pregunta en la Bitácora..."}"
                    </p>
                    <p className="text-[7px] text-center mt-1 opacity-50 uppercase font-black text-white">Mensaje del Creador</p>
                </div>
            </div>

            {/* HUD SUPERIOR */}
            <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-center">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                    <span className="text-cyan-400 text-[10px]">💠</span>
                    <span className="text-white font-black text-[10px]">{balances.genesis}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsMuted(!isMuted)} className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 text-xs">{isMuted ? '🔇' : '🔊'}</button>
                    <button onClick={onClose} className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 text-xs">✕</button>
                </div>
            </div>

            {/* BARRA PROGRESO CREMA */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-50">
                <div className="h-full bg-[#FFFDD0]/60 shadow-[0_0_10px_white]" style={{ width: `${progress}%` }}></div>
            </div>

            {/* TERMINAL GLASS (SLIDE UP) */}
            <div className={`absolute bottom-0 left-0 w-full bg-black/85 backdrop-blur-3xl border-t border-white/10 transition-all duration-700 z-40 ${activeTab ? 'h-[65%]' : 'h-24'}`}>
                <div className="flex h-24 items-center px-1">
    {/* 1. BITÁCORA */}
    <button onClick={() => setActiveTab(activeTab === 'log' ? null : 'log')} className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'log' ? 'text-white' : 'text-white/30'}`}>
        <span className="text-xl">💬</span>
        <span className="text-[7px] font-black uppercase">Preguntar</span>
    </button>

    {/* 2. MOSTRADOR */}
    <button onClick={() => setActiveTab(activeTab === 'prod' ? null : 'prod')} className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'prod' ? 'text-cyan-400' : 'text-white/30'}`}>
        <span className="text-xl">🖼️</span>
        <span className="text-[7px] font-black uppercase">Producto</span>
    </button>

    {/* 3. EDITORIAL (NUEVO) */}
    <button 
    onClick={() => onOpenLog({ 
        id: user.id, // <--- IMPORTANTE: Enviamos el ID del autor
        title: user.editorial_title || "Sin Título", 
        author: user.alias || "Anónimo", 
        content: user.editorial_content || "..." 
    })}
    className="flex-1 flex flex-col items-center gap-1 text-fuchsia-400"
>
    <span className="text-xl">🖋️</span>
    <span className="text-[7px] font-black uppercase">Editorial</span>
</button>
  
    {/* 4. TIENDA */}
    <button onClick={() => window.open(user.product_url, '_blank')} className="flex-1 flex flex-col items-center gap-1 text-yellow-500">
        <span className="text-xl">🛒</span>
        <span className="text-[7px] font-black uppercase">Tienda</span>
    </button>
</div>
                <div className="px-6 pb-6 h-[calc(100%-6rem)] overflow-y-auto custom-scrollbar">
                    {activeTab === 'log' && (
                        <div className="animate-fadeIn space-y-4">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-gray-300 text-[11px] leading-relaxed italic">"{user.blog_text || "El creador está en directo..."}"</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-2xl border border-white/10">
                                <p className="text-[9px] text-gray-500 font-black mb-2 uppercase">Enviar Pregunta Privada</p>
                                <div className="flex gap-2">
                                    <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="¿Tienes alguna duda?" className="flex-1 bg-transparent border-b border-white/10 text-xs text-white outline-none" />
                                    <button onClick={handleSendQuestion} className="text-fuchsia-400 text-[9px] font-black uppercase">Preguntar</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'prod' && (
                        <div className="animate-fadeIn h-full flex items-center justify-center p-2">
                            {user.showcase_url ? <img src={user.showcase_url} className="max-h-full w-full object-contain rounded-xl shadow-2xl" /> : <p className="text-gray-600 text-[10px]">Sin imagen...</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* BOTÓN HALO (Solo visible si terminal cerrada) */}
            {!activeTab && (
                <button onClick={handleSendHalo} className="absolute right-4 bottom-28 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-xl z-50 transition-transform active:scale-90">⚪</button>
            )}
        </div>

        <style>{`
            @keyframes spirit { 0% { opacity:0; transform:translateY(10px); } 10% { opacity:1; } 90% { opacity:1; } 100% { opacity:0; transform:translateY(-20px); } }
            .animate-spirit { animation: spirit 6s infinite ease-in-out; }
            @keyframes glowSwim { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 15% { opacity: 1; scale: 1; } 100% { transform: translateY(-115vh) scale(3); opacity: 0; } }
            .animate-glowSwim { animation: glowSwim 5.5s ease-in-out forwards; }
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        `}</style>
    </div>
  );
};

export default HoloProjector;