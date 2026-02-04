// src/components/BroLogViewer.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const BroLogViewer = ({ log, onClose, balances, setBalances, session }) => {
  const [showAd, setShowAd] = useState(true);
  const [isTipping, setIsTipping] = useState(false);
  const [showHalo, setShowHalo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAd(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // --- LÓGICA DEL APLAUSO (TRANSACCIÓN 50 GÉNESIS) ---
  const handleApplause = async () => {
    if (!balances || balances.genesis < 50) { alert("SUEÑAS CON GÉNESIS..."); return; }
    if (isTipping) return;
    setIsTipping(true);

    try {
        // 1. Restar 50 al Lector (Tú)
        const newBalance = balances.genesis - 50;
        setBalances(prev => ({ ...prev, genesis: newBalance }));
        await supabase.from('profiles').update({ genesis: newBalance }).eq('id', session.user.id);

        // 2. Sumar 50 al Autor (El dueño del editorial)
        // Hacemos una llamada RPC o un incremento directo
        const { data: authorData } = await supabase.from('profiles').select('genesis').eq('id', log.id).single();
        if (authorData) {
            await supabase.from('profiles').update({ genesis: authorData.genesis + 50 }).eq('id', log.id);
        }

        // 3. Reacción Visual (Halo Medusa)
        setShowHalo(true);
        setTimeout(() => { setShowHalo(false); setIsTipping(false); }, 5000);

    } catch (err) {
        console.error("Error en la transacción:", err);
        setIsTipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200000] flex flex-col items-center justify-center animate-fadeIn bg-black font-mono">
      
      {/* REACCIÓN: HALO MEDUSA AL APLAUDIR */}
      {showHalo && (
          <div className="fixed inset-0 pointer-events-none z-[200001]">
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-glowSwim">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-[60px] animate-pulse"></div>
                      <div className="absolute w-32 h-32 bg-white/20 rounded-full blur-[40px]"></div>
                      <div className="absolute w-14 h-14 bg-white rounded-full shadow-[0_0_50px_gold]"></div>
                  </div>
              </div>
          </div>
      )}

      {showAd ? (
        <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black animate-pulse"></div>
           <div className="z-10 text-center p-8 border-y-2 border-yellow-400 bg-black/50 backdrop-blur-xl">
              <p className="text-xs text-yellow-400 font-mono tracking-[0.3em] mb-4 animate-bounce">Publicidad Programática</p>
              <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter">EDITORIAL QUIJOTE</h2>
           </div>
        </div>
      ) : (
      
      <div className="relative w-full h-full flex flex-col animate-slideUp">
         <div className="absolute inset-0 z-0"> 
  	        <video src="/loop_log.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70"></div>
	     </div>
                  
         <div className="relative z-50 flex justify-between items-center p-6 border-b border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
               <span className="text-cyan-400 text-xl font-black">{balances?.genesis || 0} G</span>
               <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">BRO-LOGS ARCHIVE</span>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black">✕</button>
         </div>

         <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 pb-32">
            <div className="max-w-3xl mx-auto">
                <header className="mb-10 text-center">
                    <span className="inline-block px-3 py-1 border border-fuchsia-500/50 rounded-full text-[10px] text-fuchsia-400 mb-4 tracking-widest uppercase">Editorial Íntimo</span>
                    <h1 className="text-3xl md:text-6xl font-bold text-white mb-6 leading-tight font-serif uppercase tracking-tighter">
                       {log.title}
                    </h1>
                    <p className="text-white font-black text-sm uppercase tracking-widest">por @{log.author} <span className="text-blue-400">☑</span></p>
                </header>

                <article className="prose prose-invert mx-auto font-light text-gray-200 leading-relaxed">
                    <div className="whitespace-pre-wrap text-lg md:text-2xl italic border-l-2 border-white/10 pl-6">
                        {log.content}
                    </div>
                </article>

                <div className="mt-20 pt-10 border-t border-white/10 text-center">
                    <button 
                        onClick={handleApplause}
                        disabled={isTipping}
                        className={`px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-full transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 active:scale-95 ${isTipping ? 'opacity-50 grayscale' : ''}`}
                    >
                       {isTipping ? 'Enviando Luz...' : '👏 APLAUDIR [50 G]'}
                    </button>
                    <p className="text-[10px] text-gray-500 mt-4 uppercase">Apoya al autor para que siga emitiendo</p>
                </div>
            </div>
         </div>
      </div>
      )}

      <style>{`
        @keyframes glowSwim { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 15% { opacity: 1; scale: 1; } 100% { transform: translateY(-115vh) scale(3.5); opacity: 0; } }
        .animate-glowSwim { animation: glowSwim 5.5s ease-in-out forwards; }
      `}</style>
    </div>
  );
};

export default BroLogViewer;