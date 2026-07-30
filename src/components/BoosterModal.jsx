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

  // ── LINAJE ──
  const [reinoElegido,    setReinoElegido]    = useState('');
  const [reinoPropuesto,  setReinoPropuesto]  = useState('');
  const [juramentoFirmado,setJuramentoFirmado]= useState(false);
  const [guardandoReino,  setGuardandoReino]  = useState(false);
  const [userId, setUserId] = useState(null);

  // ── FORMDATA PRINCIPAL ──
  const [formData, setFormData] = useState({
    alias: '', avatar_url: '', banner_url: '',
    audio_file: '', audio_type: '', audio_description: '',
    track_name: '',
    genero: 'n',
    // LINAJE
    rank: '', reino: '',
    juramento_firmado: false, juramento_fecha: null,
  });

  // ── UI ──
  const InputStyle = "w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all";
  const LabelStyle = "text-2xl font-bold text-gray-300 uppercase tracking-widest mb-4 block";
  const CardStyle  = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

  // ── LINAJE helpers ──
  const handleGuardarReino = async (reino) => {
    setGuardandoReino(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({ reino }).eq('id', user.id);
    if (!error) setReinoElegido(reino);
    setGuardandoReino(false);
  };

  const handleFirmarJuramento = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles')
      .update({ juramento_firmado: true, juramento_fecha: new Date().toISOString() })
      .eq('id', user.id);
    if (!error) setJuramentoFirmado(true);
  };

  // ── CARGAR PERFIL ──
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', user.id).single();
        if (!profile) return;

        setCountry(profile.country || '');
        setCity(profile.city    || '');

        setReinoElegido(profile.reino            || '');
        setJuramentoFirmado(profile.juramento_firmado || false);

        setFormData({
          alias:              profile.alias              || user.user_metadata?.alias || '',
          avatar_url:         profile.avatar_url         || '',
          banner_url:         profile.banner_url         || '',
          genero:             profile.genero             || 'n',
          // LINAJE
          rank:               profile.rank               || '',
          reino:              profile.reino              || '',
          juramento_firmado:  profile.juramento_firmado  || false,
          juramento_fecha:    profile.juramento_fecha    || null,
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
    const alert2 = window.confirm("Esta acción NO se puede deshacer. Perderás tus Puntos Lunas, Halos de Luz, Moon Cupones y tu HoloPrisma desaparecerá del ciberespacio. ¿Proceder?");
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
                // Linaje siempre visible — el rank vacío muestra estado pendiente
                 { id: 'linaje',   label: '👑 Linaje',         color: 'orange' },
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

            {/* ══ 👑 LINAJE ══ */}
             {tab === 'linaje' && (() => {
               const REINOS = [
                'Reino de Solaris','Reino de Lunaris','Reino de Polaris','Reino de Vega','Reino de Andrómeda',
                'Reino de Cásiopea','Reino de las Pléyades','Reino de Orión','Reino de Ofiuco','Reino de Aries',
                'Reino de Géminis','Reino de Leo','Reino de Zodíaco','Reino de Neptuno','Reino de Marte',
                'Reino de Júpiter','Reino de Venus','Reino de Aurora','Reino del Cénit','Reino del Horizonte',
                'Reino de la Nebulosa','Reino de los Elfos','Reino de los Eloi','Reino de MU','Reino de la Atlántida',
                'Reino de Lemuria','Reino de Avalon','Reino de Lira','Reino del Éter','Reino de Hyperión',
                'Reino de Mare Imbrium','Reino de KPax','Reino de Mare Tranquillitatis','Reino de Mare Nectaris',
                'Reino de Altair','Reino de Mare Serenitatis','Reino de Mare Somniorum','Reino de Lacus Somniorum',
                'Reino de Lacus Felicitatis','Reino de Arabia Terra','Reino de Tharsis','Reino de Elysium',
                'Reino de Selene','Reino de Amazonis','Reino de Utopia','Reino de Syrtis Major','Reino de Hellas',
                'Reino de Olympus','Reino de Arsia','Reino de Pavonis','Reino de Ascraeus','Reino de Elysium Mons',
                'Reino de Marineris','Reino de Ares Vallis','Reino de Kasei','Reino de Tiu Vallis','Reino de Procellarum',
                'Reino de Isidis','Reino de Tempe','Reino de Syrtis','Reino de Brazil','Reino de Chryse',
                'Reino de Noachis','Reino de Aonia','Reino de Daedalia','Reino de Mareotis','Reino de Aeolis',
                'Reino de Eridania','Reino de Memnonia','Reino de Promethei','Reino de Albor Tholus','Reino de Gale',
                'Reino de Jezero','Reino de Gusev','Reino de Lyot','Reino de Korolev','Reino de Holden',
                'Reino de Endeavour','Reino de los Montes Rook','Reino de los Montes Cárpatos','Reino de la Lealtad',
                'Reino de la Pietatis','Reino de la Virtutis','Reino de la Sapientiae','Reino de la Concordiae',
                'Reino de la Fortitudinis','Reino de la Clementiae','Reino del Honoris','Reino de Sirio',
                'Reino de Brahma','Reino de la Caritatis','Reino de Urano','Reino de Antares','Reino de Cygnus',
                'Reino de Tartaria','Reino de Polux','Reino de la Humanitatis','Reino de la Veritatis',
                'Reino de Aquila','Reino de la Namibia',
              ];

              const g = formData.genero || 'n';
              const TITULOS = {
                rey:      { m:{ rango:'Rey',       tratamiento:'Don',           subtitulo:'Alta Corte'      }, f:{ rango:'Reina',    tratamiento:'Doña',          subtitulo:'Alta Corte'      }, n:{ rango:'Reyes',    tratamiento:'Excelentísimos', subtitulo:'Alta Corte'      } },
                principe: { m:{ rango:'Príncipe',   tratamiento:'Excelentísimo', subtitulo:'Guardia Real'    }, f:{ rango:'Princesa', tratamiento:'Excelentísima', subtitulo:'Guardia Real'    }, n:{ rango:'Príncipes',tratamiento:'Excelentísimos',subtitulo:'Guardia Real'    } },
                duque:    { m:{ rango:'Duque',      tratamiento:'Ilustrísimo',   subtitulo:'Nobleza Mayor'   }, f:{ rango:'Duquesa', tratamiento:'Ilustrísima',   subtitulo:'Nobleza Mayor'   }, n:{ rango:'Duques',   tratamiento:'Ilustrísimos',  subtitulo:'Nobleza Mayor'   } },
                marques:  { m:{ rango:'Marqués',    tratamiento:'Honorable',     subtitulo:'Nobleza'         }, f:{ rango:'Marquesa',tratamiento:'Honorable',     subtitulo:'Nobleza'         }, n:{ rango:'Marqueses',tratamiento:'Honorables',    subtitulo:'Nobleza'         } },
                conde:    { m:{ rango:'Conde',      tratamiento:'Noble',         subtitulo:'Nobleza'         }, f:{ rango:'Condesa', tratamiento:'Noble',         subtitulo:'Nobleza'         }, n:{ rango:'Condes',   tratamiento:'Nobles',        subtitulo:'Nobleza'         } },
                lord:     { m:{ rango:'Lord',       tratamiento:'',              subtitulo:'Honor del Reino' }, f:{ rango:'Lady',    tratamiento:'',              subtitulo:'Honor del Reino' }, n:{ rango:'Lords',    tratamiento:'',              subtitulo:'Honor del Reino' } },
              };
              const LUNAS = { rey:2000, principe:1000, duque:500, marques:300, conde:200, lord:100 };
              const COLORES  = {
                rey:      { text:'text-orange-400', border:'border-orange-500/40', bg:'bg-orange-950/30', sel:'bg-orange-600', glow:'0 0 25px rgba(249,115,22,0.25)'  },
                principe: { text:'text-blue-400',   border:'border-blue-500/40',   bg:'bg-blue-950/30',   sel:'bg-blue-600',   glow:'0 0 25px rgba(59,130,246,0.25)'  },
                duque:    { text:'text-purple-400', border:'border-purple-500/40', bg:'bg-purple-950/30', sel:'bg-purple-600', glow:'0 0 25px rgba(168,85,247,0.25)'  },
                marques:  { text:'text-cyan-400',   border:'border-cyan-500/40',   bg:'bg-cyan-950/30',   sel:'bg-cyan-600',   glow:'0 0 25px rgba(6,182,212,0.25)'   },
                conde:    { text:'text-green-400',  border:'border-green-500/40',  bg:'bg-green-950/30',  sel:'bg-green-600',  glow:'0 0 25px rgba(34,197,94,0.25)'   },
                lord:     { text:'text-yellow-400', border:'border-yellow-500/40', bg:'bg-yellow-950/20', sel:'bg-yellow-500', glow:'0 0 25px rgba(234,179,8,0.25)'   },
              };

              // Si no tiene rank asignado — pantalla de espera
              if (!formData.rank) {
                return (
                  <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fadeIn">
                    <span className="text-5xl">👑</span>
                    <p className="text-gray-400 text-lg font-bold uppercase tracking-widest text-center">
                      Tu título nobiliario está pendiente de asignación
                    </p>
                    <p className="text-gray-600 text-base text-center max-w-sm">
                      El equipo de Bro7Vision te asignará tu rango cuando completes el proceso de Fundador. Recibirás una notificación.
                    </p>
                  </div>
                );
              }

              const rank   = formData.rank || 'rey';
              const titulo = (TITULOS[rank] || TITULOS.rey)[g];
              const c      = COLORES[rank]  || COLORES.rey;
              const gen    = LUNAS[rank]  || 0;

              return (
                <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-10">

                  {/* IDENTIDAD NOBLE */}
                  <div className={`rounded-2xl border ${c.border} p-8 text-center relative overflow-hidden`} style={{ boxShadow: c.glow }}>
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'28px 28px' }} />
                    <div className="relative z-10">
                      <img src="/assets/corona_rey.png" alt="corona" className="w-24 h-24 mx-auto mb-3 object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]" onError={e => e.target.style.display='none'} />
                      <p className={`${c.text} text-lg uppercase tracking-[0.35em] mb-2`} style={{ fontFamily:"'Georgia', serif" }}>{titulo.subtitulo} · Bro7vision</p>
                      <div className="space-y-1">
                        {titulo.tratamiento && <p className={`${c.text} text-base font-bold uppercase tracking-[0.2em]`} style={{ fontFamily:"'Georgia', serif" }}>{titulo.tratamiento}</p>}
                        <p className={`${c.text} text-xl font-black uppercase tracking-[0.15em]`} style={{ fontFamily:"'Georgia', serif" }}>{titulo.rango}</p>
                        <p className="text-white text-3xl font-black" style={{ fontFamily:"'Georgia', 'Times New Roman', serif" }}>{formData.alias}</p>
                        {reinoElegido && (<>
                          <p className="text-gray-500 text-base uppercase tracking-[0.3em] mt-1">Proveniente del</p>
                          <p className={`${c.text} text-lg font-bold`} style={{ fontFamily:"'Georgia', serif" }}>{reinoElegido}</p>
                        </>)}
                      </div>
                      <div className={`h-px w-20 mx-auto mt-4 opacity-40 ${c.sel}`} />
                      <p className="text-gray-600 text-base uppercase tracking-widest mt-3">{gen.toLocaleString()} Lunas · mensual</p>
                    </div>
                  </div>

                  {/* ELEGIR DOMINIO */}
                  <div className={`rounded-2xl border ${c.border} p-6`}>
                    <p className={`${c.text} font-black text-base uppercase tracking-widest mb-1`} style={{ fontFamily:"'Georgia', serif" }}>
                      {reinoElegido ? '✦ Tu Dominio' : '✦ Elige tu Dominio'}
                    </p>
                    <p className="text-gray-500 text-base mb-5 leading-relaxed">
                      {reinoElegido
                        ? `Tu título completo: ${titulo.tratamiento ? titulo.tratamiento + ' ' : ''}${titulo.rango} ${formData.alias} del ${reinoElegido}`
                        : 'Selecciona el reino que gobernarás.'}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
                      {REINOS.map((reino) => {
                        const sel = reinoElegido === reino;
                        return (
                          <button key={reino} onClick={() => handleGuardarReino(reino)}
                            className={`px-3 py-2.5 rounded-xl text-base font-bold text-left transition-all border
                              ${sel ? `${c.sel} text-black border-transparent shadow-md` : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}>
                            {sel && <span className="mr-1">✓</span>}{reino}
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-gray-500 text-base uppercase tracking-widest mb-2">¿No encuentras el tuyo? Proponlo</p>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Ej: Reino de Sirio..."
                          value={reinoPropuesto} onChange={(e) => setReinoPropuesto(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-lg focus:border-orange-500 focus:outline-none placeholder-gray-700" />
                        <button onClick={async () => {
                          if (!reinoPropuesto.trim()) return;
                          const { data: { user } } = await supabase.auth.getUser();
                          await supabase.from('reino_propuestas').insert([{
                            user_id: user.id, alias: formData.alias,
                            propuesta: reinoPropuesto.trim(), created_at: new Date().toISOString(),
                          }]);
                          alert('✅ Propuesta enviada.');
                          setReinoPropuesto('');
                        }} className={`${c.sel} text-black font-black px-4 py-2.5 rounded-xl text-base uppercase tracking-widest hover:brightness-110 transition-all`}>
                          Proponer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* JURAMENTO */}
                  <div className="rounded-2xl overflow-hidden border border-white/10 relative">
                    <div className="absolute inset-0 z-0">
                      <img src="/assets/pergamino_bg.png" alt="" className="w-full h-full object-cover opacity-90" onError={e => e.target.style.display='none'} />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />
                    </div>
                    <div className="relative z-10 p-8 text-center">
                      <p className={`${c.text} text-lg uppercase tracking-[0.35em] mb-3`}>— Orden Real de Bro7vision —</p>
                      <h4 className="text-white text-2xl font-black mb-6" style={{ fontFamily:"'Georgia', 'Times New Roman', serif" }}>Juramento del Reino Interior</h4>
                      <div className="max-w-lg mx-auto mb-6 p-6 rounded-xl bg-black/50 border border-white/10">
                        <p className="text-gray-300 text-lg leading-loose italic" style={{ fontFamily:"'Georgia', serif" }}>
                          "Por la luz del Reino Interior, juro mantener mi presencia, honrar mi dominio y servir con constancia. Que mis actos hablen por mí y que mi nombre permanezca en el Listado de Honor mientras mi voluntad sea firme."
                        </p>
                      </div>
                      {juramentoFirmado ? (
                        <div className="space-y-2">
                          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full ${c.bg} border ${c.border}`}>
                            <span className="text-green-400">✓</span>
                            <span className="text-gray-300 text-base uppercase tracking-widest font-bold">Juramento sellado</span>
                          </div>
                          {formData.juramento_fecha && (
                            <p className="text-gray-600 text-base mt-1">Firmado el {new Date(formData.juramento_fecha).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">Al firmar aceptas el compromiso de actividad mensual y las condiciones del Reino Interior.</p>
                          <button onClick={handleFirmarJuramento}
                            className={`${c.sel} text-black font-black px-10 py-3 rounded-full text-lg uppercase tracking-widest hover:brightness-110 transition-all`}
                            style={{ boxShadow: c.glow }}>
                            📜 Firmar Juramento
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-center text-base text-gray-700 uppercase tracking-[0.3em]" style={{ fontFamily:"'Georgia', serif" }}>La grandeza se sostiene con presencia y dedicación.</p>
                </div>
              );
             })()}

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