// src/components/BoosterModal.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import BoosterMisCupones from './booster/BoosterMisCupones';
import BoosterAnunciante from './booster/BoosterAnunciante';

const BoosterModal = ({ onClose, initialTab, session }) => {

  // ── ESTADOS PRINCIPALES ──
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState(initialTab || 'identity');

  // ── ESTADOS DE PERFIL ──
  const [country, setCountry] = useState('');
  const [city,    setCity]    = useState('');

  // ── FORMDATA PRINCIPAL ──
  const [formData, setFormData] = useState({
    alias: '', avatar_url: '', banner_url: '',
    audio_file: '', audio_type: '', audio_description: '',
    track_name: '',
  });

  // ── UI ──
  const InputStyle = "w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all";
  const LabelStyle = "text-2xl font-bold text-gray-300 uppercase tracking-widest mb-4 block";
  const CardStyle  = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

  // ── CARGAR PERFIL ──
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', user.id).single();
        if (!profile) return;

        setCountry(profile.country || '');
        setCity(profile.city    || '');

        setFormData({
          alias:              profile.alias              || user.user_metadata?.alias || '',
          avatar_url:         profile.avatar_url         || '',
          banner_url:         profile.banner_url         || '',
        });
      } catch (e) {
        console.error("Error cargando perfil:", e);
      }
    };
    loadData();
  }, []);

  // ── GUARDAR ──
  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const updates = {
        ...formData,
        country, city,
        updated_at: new Date(),
      };
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw error;
      alert("✨ ¡SISTEMA ACTUALIZADO CON ÉXITO! ✨");
      onClose();
      window.location.reload();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ── BORRAR CUENTA ──
  const handleDeleteAccount = async () => {
    const alert1 = window.confirm("🚨 ¡ALERTA ROJA! 🚨\n¿Estás absolutamente seguro de que quieres desintegrar tu identidad de BRO7VISION?");
    if (!alert1) return;
    const alert2 = window.confirm("Esta acción NO se puede deshacer. Perderás tus Puntos Lunas, tus Tarjetas de Regalo canjeadas y tu perfil desaparecerá del sistema. ¿Proceder?");
    if (!alert2) return;
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se detectó un usuario en la terminal.");
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.rpc('delete_user');
      await supabase.auth.signOut();
      alert("🌌 Secuencia completada. Tu identidad ha sido desintegrada.");
      window.location.href = '/';
    } catch (error) {
      alert("❌ Error en la desintegración: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn font-sans">

      {/* FONDO */}
      <img src="/images/boosterstudio_bg1.webp"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" alt="Studio Background" />
      <div className="absolute inset-0 bg-black/40 z-[5]" />

      {/* MODAL */}
      <div className="relative z-10 w-full h-full bg-black/10 backdrop-blur-[25px] border-0 shadow-none overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="bg-white/5 border-b border-white/10 py-12 px-8 flex justify-between items-center shrink-0">
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 font-bold text-lg flex items-center gap-3 tracking-wider">
            <span className="text-2xl drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">✨</span> BOOSTER STUDIO TERMINAL
          </h2>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-transparent">

          {/* SIDEBAR */}
          <div className="flex md:flex-col border-b md:border-b-0 md:border-r border-white/10 bg-black/10 p-3 gap-2 overflow-x-auto md:w-96 shrink-0 z-20">
{[
                { id: 'identity', label: '👤 Identidad',      color: 'cyan'   },
{ id: 'mis-cupones', label: '🌙 Lunas Canjeadas', color: 'yellow' },
                  { id: 'ANUNCIANTE', label: '📢 ANUNCIANTE', color: 'purple' },
                 ].filter(Boolean).map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`text-left py-3 px-5 text-2xl font-bold rounded-2xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                  ${tab === item.id
                    ? `bg-gradient-to-r from-${item.color}-500/20 to-transparent text-${item.color}-300 border border-${item.color}-500/30 shadow-[0_0_15px_rgba(0,0,0,0.3)] translate-x-1`
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                {item.label}
              </button>
            ))}
          </div>

          {/* CONTENIDO */}
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative z-10">

            {/* ══ 👤 IDENTIDAD ══ */}
            {tab === 'identity' && (
              <div className="grid grid-cols-1 gap-8 animate-fadeIn max-w-5xl mx-auto">

                {/* ── COLUMNA IZQUIERDA ── */}
                <div className="space-y-6">

{/* NICK */}
                    <div className={CardStyle}>
                      <label className={LabelStyle}>NICK DE CIUDADANO</label>
                      <input type="text" value={formData.alias}
                        onChange={e => setFormData({ ...formData, alias: e.target.value })}
                        className={`${InputStyle} text-lg font-bold text-center tracking-widest border-cyan-500/40`} />

{/* COORDENADAS */}
                    <div className="mt-6 p-5 bg-black/20 rounded-2xl border border-white/5 space-y-5">
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        📍 COORDENADAS
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={LabelStyle}>País</label>
                          <input type="text" value={country} onChange={e => setCountry(e.target.value)}
                            className={InputStyle} placeholder="España" />
                        </div>
                        <div>
                          <label className={LabelStyle}>Ciudad</label>
                          <input type="text" value={city} onChange={e => setCity(e.target.value)}
                            className={InputStyle} placeholder="Oviedo" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">

                  {/* LISTADO DE REINOS — Rumores fijo */}
                  <div className="bg-gradient-to-br from-cyan-950/30 to-fuchsia-950/20 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl">📜</span>
                      <div>
                        <p className="text-lg font-black text-cyan-300 tracking-wider">LISTADO DE REINOS</p>
                        <p className="text-lg text-gray-500 mt-0.5">Encargado oficial de nombramientos.</p>
                      </div>
                    </div>
                    <div className="mt-2 max-w-[200px]">
                      <div className="p-3 rounded-2xl border text-center bg-cyan-900/20 border-cyan-500/30 text-cyan-400 cursor-default shadow-inner">
                        <img src="/emojis/rumores.webp" alt="Rumores" className="w-16 h-16 mx-auto mb-2 object-contain drop-shadow-lg" />
                        <p className="text-base font-black uppercase">Rumores</p>
                        <p className="text-base opacity-70">La Elegancia</p>
                        <div className="mt-3 text-base font-bold bg-cyan-950/60 rounded-full py-1 px-2 border border-cyan-500/20 inline-block">🔒 PUESTO FIJO</div>
                      </div>
                    </div>
                  </div>

                  {/* ZONA DE RIESGO */}
                  <div className="bg-red-950/20 backdrop-blur-xl border border-red-500/30 p-6 rounded-3xl shadow-[0_0_20px_rgba(239,68,68,0.15)] mt-12">
                    <h3 className="text-lg text-red-400 font-bold mb-2 flex items-center gap-2">🚨 ZONA DE RIESGO</h3>
                    <p className="text-base text-gray-400 mb-4">Desintegrar tu identidad borrará tus Puntos, Cupones y tu HoloPrisma de forma irreversible.</p>
                    <button onClick={handleDeleteAccount}
                      className="w-full py-3 px-4 bg-red-600/10 hover:bg-red-600/90 text-red-400 hover:text-white text-base font-bold uppercase tracking-widest rounded-xl border border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.8)] transition-all duration-300 flex justify-center items-center gap-2">
                      <span>☠️</span> Iniciar Autodestrucción
                    </button>
                  </div>

</div>
              </div>
            )}

{/* ══ 🎫 MIS CUPONES ══ */}
              {tab === 'mis-cupones' && <BoosterMisCupones />}

              {/* ══ 📢 ANUNCIANTE ══ */}
              {tab === 'ANUNCIANTE' && (
                <BoosterAnunciante session={session} />
              )}

            </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-white/10 bg-black/10 backdrop-blur-3xl flex justify-end gap-4 shrink-0 relative z-20">
          <button onClick={onClose} className="text-gray-300 text-base px-6 py-3 font-bold uppercase hover:text-white transition-all hover:bg-white/5 rounded-full">
            Desconectar
          </button>
          <button onClick={handleSave} disabled={loading}
            className="bg-white/90 text-black font-bold uppercase text-base px-8 py-3 rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            {loading ? '🚀 INYECTANDO...' : 'ACTUALIZAR CAMBIOS'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BoosterModal;