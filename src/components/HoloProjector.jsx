// src/components/HoloProjector.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const HoloProjector = ({ user, balances, setBalances, session, onClose, handleGoToShop, onOpenLog }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [question, setQuestion] = useState("");

  const energyStyles = `
    @keyframes spirit { 0% { opacity:0; transform:translateY(10px); } 10% { opacity:1; } 90% { opacity:1; } 100% { opacity:0; transform:translateY(-20px); } }
    .animate-spirit { animation: spirit 6s infinite ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fadeIn { animation: fadeIn 0.4s ease-in forwards; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
  `;

  const handleSendQuestion = async () => {
    if (!question.trim()) return;
    const { error } = await supabase.from('bro_echos').insert([{
      target_profile_id: user.id,
      author_alias: session.user.user_metadata.alias || 'Anónimo',
      text: `❓ PREGUNTA: ${question.toUpperCase()}`,
      is_creator: false
    }]);
    if (!error) { alert("Pregunta enviada al buzón del creador."); setQuestion(""); }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black overflow-hidden flex items-center justify-center font-mono" style={{ paddingBottom: '5rem' }}>
      <style>{energyStyles}</style>

      {/* MENSAJE DEL CREADOR */}
      <div className="absolute top-32 left-0 w-full px-6 z-30 pointer-events-none">
        <div className="animate-spirit">
          
        </div>
      </div>

      {/* HUD SUPERIOR */}
      <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-center">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
          <span className="text-cyan-400 text-[10px]">💠</span>
          <span className="text-white font-black text-[10px]">{balances.genesis}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 text-xs">
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button onClick={onClose}
            className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 text-xs">✕</button>
        </div>
      </div>

      {/* ── PANEL TAB ACTIVO (log) ── */}
      {activeTab === 'log' && (
        <div className="absolute bottom-[5.5rem] left-1/2 -translate-x-1/2 z-[150] w-[min(90vw,480px)] animate-fadeIn pointer-events-auto"
          style={{
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(24px)',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '1.25rem',
          }}>
          <div className="space-y-4">
            <div className="bg-black/40 p-4 rounded-2xl border border-white/10">
              <p className="text-[9px] text-gray-500 font-black mb-2 uppercase">Enviar Pregunta Privada</p>
              <div className="flex gap-2">
                <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
                  placeholder="¿Tienes alguna duda?"
                  className="flex-1 bg-transparent border-b border-white/10 text-xs text-white outline-none" />
                <button onClick={handleSendQuestion} className="text-fuchsia-400 text-[9px] font-black uppercase">Preguntar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER UNIFICADO ─────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 w-full z-[100] bg-black/80 backdrop-blur-2xl border-t border-white/10">

        {/* BOTONES */}
        <div className="flex h-20 items-center px-2">
          <button
            onClick={() => setActiveTab(activeTab === 'log' ? null : 'log')}
            className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'log' ? 'text-white' : 'text-white/30'}`}>
            <span className="text-xl">💬</span>
            <span className="text-[10px] font-black uppercase">Bitácora</span>
          </button>

          <button
            onClick={() => handleGoToShop('nova')}
            className="flex-1 flex flex-col items-center gap-1 text-yellow-500">
            <img src="/emojis/nova.webp" alt="Nova" className="w-7 h-7 object-contain" />
            <span className="text-[10px] font-black uppercase">Productos</span>
          </button>

          <button
            onClick={() => handleGoToShop('isabella')}
            className="flex-1 flex flex-col items-center gap-1 text-fuchsia-400">
            <img src="/emojis/isabella.webp" alt="Isabella" className="w-7 h-7 object-contain" />
            <span className="text-[10px] font-black uppercase">Servicios</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spirit { 0% { opacity:0; transform:translateY(10px); } 10% { opacity:1; } 90% { opacity:1; } 100% { opacity:0; transform:translateY(-20px); } }
        .animate-spirit { animation: spirit 6s infinite ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-in forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default HoloProjector;
