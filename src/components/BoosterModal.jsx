// src/components/BoosterModal.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { marcarActividad } from '../hooks/useActividad';
import { CoordenadosBlock } from '../components/CoordenadosBlock';
import { MarketTab } from '../components/MarketTab';
import SignalUploader from './SignalUploader';
import AvisosTab from './AvisosTab';

const ENERGY_COLORS = [
  { id: 'cyan',    hex: 'bg-cyan-400 shadow-[0_0_10px_#00D0FF]',    name: 'CYAN'     },
  { id: 'fuchsia', hex: 'bg-fuchsia-400 shadow-[0_0_10px_#e879f9]', name: 'MAGENTA'  },
  { id: 'yellow',  hex: 'bg-yellow-300 shadow-[0_0_10px_#FFE687]',  name: 'AMARILLO' },
  { id: 'green',   hex: 'bg-emerald-400 shadow-[0_0_10px_#45FF56]', name: 'VERDE'    },
  { id: 'blue',    hex: 'bg-blue-500 shadow-[0_0_10px_#0017C9]',    name: 'AZUL'     },
  { id: 'red',     hex: 'bg-red-500 shadow-[0_0_10px_#FF4D4D]',     name: 'ROJO'     },
  { id: 'white',   hex: 'bg-white shadow-[0_0_15px_#F2F2F2]',       name: 'BLANCO'   },
];

const MATTER_COLORS = [
  { id: 'void',   hex: 'bg-[#050b14]', name: 'ABISMO'          },
  { id: 'carbon', hex: 'bg-[#1E252E]', name: 'CARBONO'         },
  { id: 'navy',   hex: 'bg-[#0f172a]', name: 'DEEP NAVY'       },
  { id: 'plum',   hex: 'bg-[#2e1065]', name: 'NEBULA'          },
  { id: 'wine',   hex: 'bg-[#450a0a]', name: 'SANGRE'          },
  { id: 'forest', hex: 'bg-[#022c22]', name: 'BOSQUE PROFUNDO' },
];

const OSOS_TONOS = [
  { id: 'formal',    label: 'Formal'       },
  { id: 'detu',      label: 'De tú'        },
  { id: 'amigos',    label: 'Como amigos'  },
];

const OSOS_INTERESES = [
  { id: 'productos', label: 'Productos'  },
  { id: 'servicios', label: 'Servicios'  },
  { id: 'musica',    label: 'Música'     },
  { id: 'avisos',    label: 'Avisos'     },
  { id: 'ofertas',   label: 'Ofertas'    },
];

const BoosterModal = ({ onClose }) => {

  // ── 1. ESTADOS PRINCIPALES ──
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState('identity');

  // ── 2. ESTADOS DE PERFIL ──
  const [country, setCountry]       = useState('');
  const [city, setCity]             = useState('');
  const [zipCode, setZipCode]       = useState('');
  const [energyColor, setEnergyColor] = useState('cyan');
  const [matterColor, setMatterColor] = useState('void');


  // ── 3. ESTADOS DE FORMULARIOS Y ARCHIVOS ──
  const [questions, setQuestions]   = useState([]);
  const [followerCount, setFollowerCount] = useState(0);

  const [address, setAddress]               = useState('');
  const [neighborhood, setNeighborhood]     = useState('');
  const [nearbyRef, setNearbyRef]           = useState('');
  const [bizCategory, setBizCategory]       = useState('');
  const [bizProfession, setBizProfession]   = useState('');
  const [refPrice, setRefPrice]  = useState('');
  const [description, setDescription] = useState('');
  
  // ESTADOS DE SERVICIOS
  
  // OSOS IA
  const [ososInteresesArr, setOsosInteresesArr] = useState([]);

  // ── 4. FORMDATA PRINCIPAL ──  
  const [formData, setFormData] = useState({
    alias: '', avatar_url: '', banner_url: '', card_banner_url: '', bro_pd: '',
    twit_message: '', role:[], audio_file: '', video_file: '',
    audio_type: '', audio_description: '', track_name: '',
    video_file_2: '',  video_file_169: '', video_file_169b: '',
    holo_1: '', holo_2: '', holo_3: '', holo_4: '',
    catalog_url: '', ventas_rules: '', intimo_bg: '',
    creator_loop_reply: '', editorial_title: '', editorial_content: '',
    bro_ser: '',
    bro_avi: '',
    bro_aud: '',
    bro_pod: '',
    description: '',
    genero: 'n',
    // OSOS IA
    osos_nombre: '',
    osos_tono: '',
    osos_intereses: '',
    osos_frase: '',
    oso_id: 'TITO',
    //SECTORES
    servicios_id: '',
    servicios_personaje: '',
    audio_personaje:'',
    audio_id:'',
    oraculo_personaje:'',
    oraculo_id:'',
    avisos_personaje:'',
    avisos_id:'',
     // LINAJE
    rank: '',
    reino: '',
    juramento_firmado: false,
    juramento_fecha: null,
    actividad_video: false,
    actividad_activo: false,
    actividad_games: false,
    actividad_brostory: false,
  });

  // ── 5. ESTADOS DE LINAJE ──
  const [reinoElegido, setReinoElegido]       = useState('');
  const [reinoPropuesto, setReinoPropuesto]   = useState('');
  const [juramentoFirmado, setJuramentoFirmado] = useState(false);
  const [guardandoReino, setGuardandoReino]   = useState(false);

  // ── 6. CONSTANTES UI ──
  const InputStyle = "w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all";
  const LabelStyle = "text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 block";
  const CardStyle  = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

  // ── 7. FUNCIONES DE LINAJE ──
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

  // ── HELPER OSOS INTERESES ──
  const toggleOsosInteres = (id) => {
    setOsosInteresesArr(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      setFormData(fd => ({ ...fd, osos_intereses: next.join(',') }));
      return next;
    });
  };

  // ── 8. EFECTOS ──

  // A) CARGAR PERFIL
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles').select('*').eq('id', user.id).single();

          if (profile) {
  const colors = (profile.card_color || 'cyan-void').split('-');
  setEnergyColor(colors[0] || 'cyan');
  setMatterColor(colors[1] || 'void');
  setCountry(profile.country          || '');
  setCity(profile.city                || '');
  setZipCode(profile.zip_code         || '');
  setAddress(profile.address          || '');
  setNeighborhood(profile.neighborhood || '');
  setNearbyRef(profile.nearby_ref      || '');
  setBizCategory(profile.biz_category  || '');
  setBizProfession(profile.biz_profession || '');
  setDescription(profile.description || '');
  setRefPrice(profile.ref_price           || '');
  
            // OSOS intereses → array local
            const interesesGuardados = profile.osos_intereses
              ? profile.osos_intereses.split(',').filter(Boolean)
              : [];
            setOsosInteresesArr(interesesGuardados);

            // Linaje
            setReinoElegido(profile.reino         || '');
            setJuramentoFirmado(profile.juramento_firmado || false);

            setFormData({
              alias:              profile.alias || user.user_metadata?.alias || '',
             avatar_url:       profile.avatar_url      || '',
  	    banner_url:       profile.banner_url      || '',
  	    card_banner_url:  profile.card_banner_url || '',
              role: Array.isArray(profile.role) ? profile.role : (profile.role ? [profile.role] : []),
	    bro_pd:             profile.bro_pd || '',
	    bro_ser: profile.bro_ser || '',
	    bro_avi: profile.bro_avi || '',
	    bro_aud: profile.bro_aud || '',
	    bro_pod: profile.bro_pod || '',
              video_file:         profile.video_file        || '',
              video_file_2:       profile.video_file_2      || '', 
              video_file_169:     profile.video_file_169    || '',
             video_file_169b:       profile.video_file_169b      || '',
              holo_1:             profile.holo_1            || '',
              holo_2:             profile.holo_2            || '',
              holo_3:             profile.holo_3            || '',
              holo_4:             profile.holo_4            || '',
              catalog_url:        profile.catalog_url       || '',
              ventas_rules:      profile.ventas_rules     || '',
              intimo_bg:          profile.intimo_bg         || '',
              creator_loop_reply: profile.creator_loop_reply || '',
              editorial_title:    profile.editorial_title   || '',
              editorial_content:  profile.editorial_content || '',
              // OSOS IA
              osos_nombre:        profile.osos_nombre    || '',
              osos_tono:          profile.osos_tono      || '',
              osos_intereses:     profile.osos_intereses || '',
              osos_frase:         profile.osos_frase     || '',
             oso_id:         profile.oso_id         || 'TITO',
             // SECTORES  
             servicios_id:         profile.servicios_id         || 'ISABELLA',
             servicios_personaje:  profile.servicios_personaje   || 'ISABELLA',
             audio_id:         profile.audio_id         || 'MAPACHE',
             audio_personaje:    profile.audio_personaje    || 'MAPACHE',
             oraculo_personaje:  profile.oraculo_personaje   || 'ORUMAMA',
             oraculo_id:         profile.oraculo_id         || 'ORUMAMA',
              avisos_personaje:  profile.avisos_personaje   || 'EVELYN',
             avisos_id:         profile.avisos_id        || 'EVELYN',
             
             
             
              // Linaje
              rank:               profile.rank               || '',
              reino:              profile.reino              || '',
              juramento_firmado:  profile.juramento_firmado  || false,
              juramento_fecha:    profile.juramento_fecha    || null,
              actividad_video:    profile.actividad_video    || false,
              actividad_activo:   profile.actividad_activo   || false,
              actividad_games:    profile.actividad_games    || false,
              actividad_brostory: profile.actividad_brostory || false,
            });
          }

        }
      } catch (e) {
        console.error("Error cargando perfil:", e);
      }
    };
    loadData();
  }, []);

  // B) CARGAR BUZÓN
  useEffect(() => {
    const fetchQuestions = async () => {
      if (tab === 'Telefono Casa') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('bro_echos').select('*')
            .eq('target_profile_id', user.id).like('text', '%❓%')
            .order('created_at', { ascending: false });
          if (data) setQuestions(data);
        }
      }
    };
    fetchQuestions();
  }, [tab]);

  // C) CARGAR RADAR
  useEffect(() => {
    const fetchOrbitsData = async () => {
      if (tab === 'metrics') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { count, error } = await supabase
            .from('user_creators_orbits')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', user.id)
            .eq('is_orbiting', true);
          if (!error) setFollowerCount(count || 0);
        }
      }
    };
    fetchOrbitsData();
  }, [tab]);

  // ── GUARDAR ──
  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const finalColor = `${energyColor}-${matterColor}`;
      const updates = {
        ...formData,
        card_color: finalColor,
        country, city, zip_code: zipCode,
        address, neighborhood, nearby_ref: nearbyRef,
        biz_category: bizCategory, biz_profession: bizProfession, ref_price: refPrice,
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
    const alert2 = window.confirm("Esta acción NO se puede deshacer. Perderás tus Puntos Génesis, Halos de Luz, Moon Vales y tu HoloPrisma desaparecerá del ciberespacio. ¿Proceder?");
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

  // ── MediaSlot para imágenes (solo en tab Identidad) ──
const MediaSlot = ({ title, fieldName, type, description }) => {
  const isOccupied = !!formData[fieldName];
  const [acordeonAbierto, setAcordeonAbierto] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [errorMeta, setErrorMeta] = useState('');
  const fileInputRef = React.useRef(null);

  const handleFileSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivoSeleccionado(file);
    setAcordeonAbierto(true);
    setErrorMeta('');
  };

  const handleConfirmarSubida = async () => {
    if (!archivoSeleccionado) return;
    setLoading(true);
    try {
      const safeFileName = `${Date.now()}-${archivoSeleccionado.name.replace(/\s+/g, '_')}`;
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: safeFileName, fileType: archivoSeleccionado.type }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error('Error HTTP ' + res.status + ': ' + errorText);
      }
      
      const data = await res.json();
      const { uploadUrl } = data;
      if (!uploadUrl) throw new Error('Sin ticket de subida.');
      await fetch(uploadUrl, { method: 'PUT', body: archivoSeleccionado, headers: { 'Content-Type': archivoSeleccionado.type } });
      const publicUrl = `https://media.bro7vision.com/${safeFileName}`;
      setFormData(prev => ({ ...prev, [fieldName]: publicUrl }));
      alert('🚀 ¡Imagen inyectada en el NÚCLEO R2!');
    } catch (err) {
      console.error('Error subida:', err);
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
      setAcordeonAbierto(false);
      setArchivoSeleccionado(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancelar = () => {
    setAcordeonAbierto(false);
    setArchivoSeleccionado(null);
    setErrorMeta('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteMedia = async () => {
    const confirm1 = window.confirm('⚠️ ¿Desintegrar este archivo?');
    if (!confirm1) return;
    const confirm2 = window.prompt('Escribe BORRAR para confirmar:');
    if (confirm2 !== 'BORRAR') { alert('❌ Cancelado.'); return; }
    try {
      await fetch('/api/delete-r2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: formData[fieldName] }),
      });
    } catch (err) { console.error(err); }
    setFormData(prev => ({ ...prev, [fieldName]: '' }));
    alert("✅ Archivo desintegrado. Recuerda pulsar 'ACTUALIZAR NÚCLEO'.");
  };

  return (
    <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
      <div className="p-4">
        <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block mb-1">{title}</label>
        <p className="text-[9px] text-gray-500 mb-3">{description}</p>
        {isOccupied && !acordeonAbierto ? (
          <div className="bg-cyan-900/20 p-3 rounded-xl border border-cyan-500/30 flex justify-between items-center">
            <span className="text-[10px] text-cyan-400 font-bold">✓ Ocupado</span>
            <button onClick={handleDeleteMedia}
              className="bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all">
              REEMPLAZAR
            </button>
          </div>
        ) : !acordeonAbierto ? (
          <div className="relative">
            <input ref={fileInputRef} type="file" accept={type} onChange={handleFileSelected}
              className="w-full text-[10px] text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-cyan-500/40 file:bg-cyan-500/10 file:text-cyan-400 file:text-[10px] file:font-bold file:cursor-pointer hover:file:bg-cyan-500/20 transition-all cursor-pointer" />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
              <span className="text-xs text-gray-500 font-bold border border-gray-600 px-2 py-1 rounded">HUECO LIBRE</span>
            </div>
          </div>
        ) : null}
      </div>
      {acordeonAbierto && (
        <div className="border-t border-fuchsia-500/20 bg-black/60 p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Archivo:</span>
            <span className="text-[10px] text-cyan-300 truncate">{archivoSeleccionado?.name}</span>
          </div>
          {errorMeta && <p className="text-[10px] text-red-400">{errorMeta}</p>}
          <div className="flex gap-3">
            <button onClick={handleCancelar} disabled={loading}
              className="flex-1 text-[10px] font-bold text-gray-400 border border-gray-700 hover:border-gray-500 py-2 rounded-lg transition-all disabled:opacity-40">
              CANCELAR
            </button>
            <button onClick={handleConfirmarSubida} disabled={loading}
              className="flex-[2] text-[10px] font-bold bg-fuchsia-600/80 hover:bg-fuchsia-500 disabled:opacity-40 text-white py-2 px-6 rounded-lg border border-fuchsia-500/50 transition-all">
              {loading ? '🚀 Subiendo...' : '🚀 SUBIR IMAGEN'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn font-sans">

      {/* FONDO */}
      <img src="/images/boosterstudio_bg.webp"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" alt="Studio Background" />
      <div className="absolute inset-0 bg-black/40 z-[5]" />

      {/* MODAL PANTALLA COMPLETA */}
      <div className="relative z-10 w-full h-full bg-black/10 backdrop-blur-[25px] border-0 shadow-none overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="bg-white/5 border-b border-white/10 p-5 flex justify-between items-center shrink-0">
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 font-bold text-lg flex items-center gap-3 tracking-wider">
            <span className="text-2xl drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">✨</span> BOOSTER STUDIO TERMINAL
          </h2>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-transparent">

          {/* SIDEBAR */}
          <div className="flex md:flex-col border-b md:border-b-0 md:border-r border-white/10 bg-black/10 p-3 gap-2 overflow-x-auto md:w-64 shrink-0 z-20">
            {[
              { id: 'identity',      label: '👤 Identidad',        color: 'cyan'   },
              { id: 'audio',         label: '📡 Señal (Archivos)', color: 'fuchsia'},
              { id: 'Telefono Casa', label: '☝️ Teléfono Casa',    color: 'yellow' },
              { id: 'market',        label: '🛒 Tienda & IA',      color: 'green'  },
             { id: 'avisos', label: '📢 Mis Avisos', color: 'blue' },
              { id: 'metrics',       label: '🛰️ Órbita & Radar',   color: 'orange' },
              ...(formData.rank ? [{ id: 'linaje', label: '👑 Linaje', color: 'orange' }] : []),
            ].map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`text-left py-3 px-5 text-xs font-bold rounded-2xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                  ${tab === item.id
                    ? `bg-gradient-to-r from-${item.color}-500/20 to-transparent text-${item.color}-300 border border-${item.color}-500/30 shadow-[0_0_15px_rgba(0,0,0,0.3)] translate-x-1`
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                {item.label}
              </button>
            ))}
          </div>

          {/* ÁREA DE CONTENIDO */}
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative z-10">

{/* ══ 👤 IDENTIDAD ══ */}
            {tab === 'identity' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">

                {/* ======================================= */}
                {/* ⬅️ COLUMNA IZQUIERDA (Info y Oso IA)    */}
                {/* ======================================= */}
                <div className="space-y-6">

                  {/* VISUALES */}
                  <div className={CardStyle}>
                    <h3 className="text-sm text-cyan-400 font-bold mb-4 flex items-center gap-2">📸 VISUALES (Carga R2)</h3>
                    <div className="space-y-4">
                      <MediaSlot title="Avatar (Circular)"      fieldName="avatar_url"      type="image/*" description="Tu foto de ciudadano." />
                      <MediaSlot title="Banner (LiveGrid)"      fieldName="banner_url"      type="image/*" description="Fondo para el mapa local." />
                      <MediaSlot title="Banner (Nexus Tarjeta)" fieldName="card_banner_url" type="image/*" description="Fondo para tu tarjeta principal." />
                    </div>
                  </div>

                  {/* NICK + GÉNERO + COORDENADAS */}
                  <div className={CardStyle}>
                    <label className={LabelStyle}>NICK DE CIUDADANO</label>
                    <input type="text" value={formData.alias}
                      onChange={e => setFormData({ ...formData, alias: e.target.value })}
                      className={`${InputStyle} text-lg font-bold text-center tracking-widest border-cyan-500/40`} />

                    {/* ROL DE CIUDADANO */}
                    <div className="mt-5">
                      <label className={LabelStyle}>ROL EN BRO7VISION</label>
                      <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-3">
                        {[
                          { id: 'citizen', label: '👤 Ciudadano',    desc: 'Explora y juega'         },
                          { id: 'shop',    label: '🏪 Comercio',      desc: 'Vende productos'         },
                          { id: 'service', label: '🤝 Profesional',   desc: 'Ofrece servicios'        },
                          { id: 'talk',    label: '🎙️ Creador',       desc: 'Contenido & Blog'        },
                          { id: 'music',   label: '🎵 Audio',          desc: 'Música & Podcast'        },
                        ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            const current = Array.isArray(formData.role) ? formData.role : [];
                            const updated = current.includes(r.id)
                              ? current.filter(x => x !== r.id)
                              : [...current, r.id];
                            setFormData({ ...formData, role: updated });
                          }}
                          className={`p-3 rounded-xl border text-left transition-all
                            ${(Array.isArray(formData.role) ? formData.role : []).includes(r.id)
                              ? 'bg-cyan-900/40 border-cyan-500/60 text-cyan-300'
                              : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'}`}
                        >
                          <p className="text-xs font-bold mb-1">{r.label}</p>
                          <p className="text-[9px] opacity-70 leading-tight">{r.desc}</p>
                        </button>
                        ))}
                      </div>
                    </div>

                    {/* CÓDIGOS BRO7VISION — uno por rol activo */}
{(() => {
  const rolesActivos = Array.isArray(formData.role) ? formData.role : [];

  const CONFIG_CODIGOS = [
    {
      rol:    'shop',
      label:  '🏪 Productos',
      campo:  'bro_pd',
      prefijo: 'COM',
      color:  { dot: 'bg-yellow-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]', text: 'text-yellow-400' },
    },
    {
      rol:    'service',
      label:  '🤝 Servicios',
      campo:  'bro_ser',
      prefijo: 'SER',
      color:  { dot: 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]', text: 'text-blue-400' },
    },
    {
      rol:    'music',
      label:  '🎵 Audio',
      campo:  'bro_aud',
      prefijo: 'AUD',
      color:  { dot: 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]', text: 'text-cyan-400' },
    },
    {
      rol:    'talk',
      label:  '🎙️ Podcast',
      campo:  'bro_pod',
      prefijo: 'POD',
      color:  { dot: 'bg-fuchsia-400 shadow-[0_0_6px_rgba(217,70,239,0.8)]', text: 'text-fuchsia-400' },
    },
  ];

  const visibles = CONFIG_CODIGOS.filter(c => rolesActivos.includes(c.rol));
  
  return (
  <div className="mt-5 space-y-3">
    <label className={LabelStyle}>CÓDIGOS EN BRO7VISION</label>

    {/* AVI — siempre visible, es del ciudadano base */}
    {(() => {
      const codigo = formData.bro_avi;
      return (
        <div className={`px-4 py-3 rounded-xl border flex items-center gap-3
          ${codigo ? 'bg-black/40 border-cyan-500/30' : 'bg-black/20 border-white/5'}`}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0
            ${codigo
              ? 'bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)]'
              : 'bg-gray-700'}`}
          />
          <span className="text-[10px] text-gray-500 w-20 flex-shrink-0">📢 Avisos</span>
          {codigo ? (
            <>
              <span
                style={{ fontFamily: "'Orbitron', monospace" }}
                className="text-sm font-black tracking-widest text-orange-400"
              >
                {codigo}
              </span>
              <span className="text-[9px] text-gray-600 ml-auto">No editable</span>
            </>
          ) : (
            <span className="text-xs text-gray-600 italic">
              Sin código asignado · Activo en Reality
            </span>
          )}
        </div>
      );
    })()}

    {/* Roles comerciales — solo si están activos */}
    {visibles.map(({ rol, label, campo, color }) => {
      const codigo = formData[campo];
      return (
        <div key={rol}
          className={`px-4 py-3 rounded-xl border flex items-center gap-3
            ${codigo ? 'bg-black/40 border-cyan-500/30' : 'bg-black/20 border-white/5'}`}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0
            ${codigo ? color.dot : 'bg-gray-700'}`}
          />
          <span className="text-[10px] text-gray-500 w-20 flex-shrink-0">{label}</span>
          {codigo ? (
            <>
              <span
                style={{ fontFamily: "'Orbitron', monospace" }}
                className={`text-sm font-black tracking-widest ${color.text}`}
              >
                {codigo}
              </span>
              <span className="text-[9px] text-gray-600 ml-auto">No editable</span>
            </>
          ) : (
            <span className="text-xs text-gray-600 italic">
              Sin código asignado · Activo en Reality
            </span>
          )}
        </div>
      );
    })}

    <p className="text-[9px] text-gray-600">
      Los códigos habilitan tu presencia en los sectores localizados. Asignados por el equipo.
    </p>
  </div>
);
})()}
                    {/* GÉNERO */}
                    <div className="mt-5">
                      <label className={LabelStyle}>IDENTIDAD DE GÉNERO</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'm', label: '♂ Masculino', desc: 'Rey · Don' },
                          { id: 'f', label: '♀ Femenino',  desc: 'Reina · Doña' },
                          { id: 'n', label: '◈ Plural',    desc: 'Reyes · Excmos' },
                        ].map((g) => (
                          <button key={g.id} onClick={() => setFormData({ ...formData, genero: g.id })}
                            className={`p-3 rounded-xl border text-left transition-all
                              ${formData.genero === g.id
                                ? 'bg-cyan-900/40 border-cyan-500/60 text-cyan-300'
                                : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'}`}>
                            <p className="text-xs font-bold mb-1">{g.label}</p>
                            <p className="text-[9px] opacity-70 leading-tight">{g.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* COORDENADAS */}
                    <CoordenadosBlock
                      country={country} setCountry={setCountry}
                      city={city} setCity={setCity}
                      zipCode={zipCode} setZipCode={setZipCode}
                      address={address} setAddress={setAddress}
                      neighborhood={neighborhood} setNeighborhood={setNeighborhood}
                      nearbyRef={nearbyRef} setNearbyRef={setNearbyRef}
                      bizCategory={bizCategory} setBizCategory={setBizCategory}
                      bizProfession={bizProfession} setBizProfession={setBizProfession}
                      description={description} setDescription={setDescription}
                      refPrice={refPrice} setRefPrice={setRefPrice}
                      formData={formData} InputStyle={InputStyle} LabelStyle={LabelStyle}
                    />
                  </div>

                  {/* TWIT RADAR */}
                  <div className={`${CardStyle} border-cyan-500/20`}>
                    <label className={LabelStyle}>💬 MENSAJE CORTO (TWIT RADAR)</label>
                    <div className="relative">
                      <input type="text" maxLength={60}
                        placeholder="Ej: 'Encontré unas llaves', 'Oferta Flash', 'Hola Barrio'..."
                        value={formData.twit_message || ''}
                        onChange={e => setFormData({ ...formData, twit_message: e.target.value })}
                        className={`${InputStyle} pr-14`} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-cyan-500/70 font-bold">
                        {(formData.twit_message || '').length}/60
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Visible en el Community Feed y en tu tarjeta.</p>
                  </div>

                  {/* ✦ OSOS IA (Se queda a la izquierda porque pertenece al perfil personal) */}
                  <div className="bg-gradient-to-br from-cyan-950/30 to-fuchsia-950/20 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl">🐻</span>
                      <div>
                        <p className="text-sm font-black text-cyan-300 tracking-wider">TU ASISTENTE OSO IA</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Cuéntanos un poco y te atenderemos como mereces.</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* Selector de Oso */}
                      <div>
                        <label className={LabelStyle}>¿Quién quieres que te atienda?</label>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          {[
                            { id: 'LARA',  img: '/emojis/lara.webp',  nombre: 'Lara',  desc: 'La Analítica' },
                            { id: 'TITO',  img: '/emojis/tito.webp',  nombre: 'Tito',  desc: 'El Experto' },
                            { id: 'PUFFO', img: '/emojis/puffo.webp', nombre: 'Puffo', desc: 'La Experiencia' },
                          ].map(oso => (
                            <button key={oso.id}
                              onClick={() => setFormData({ ...formData, oso_id: oso.id })}
                              className={`p-3 rounded-2xl border text-center transition-all
                                ${formData.oso_id === oso.id
                                  ? 'bg-cyan-900/40 border-cyan-500/60 text-cyan-300'
                                  : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'}`}>
                              <img src={oso.img} alt={oso.nombre} className="w-16 h-16 mx-auto mb-2 object-contain drop-shadow-lg" />
                              <p className="text-xs font-black">{oso.nombre}</p>
                              <p className="text-[9px] opacity-70">{oso.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Configuración Oso */}
                      <div>
                        <label className={LabelStyle}>¿Cómo quieres que te llamemos?</label>
                        <input type="text" maxLength={30} placeholder="Ej: Profe, maestro..." value={formData.osos_nombre} onChange={e => setFormData({ ...formData, osos_nombre: e.target.value })} className={InputStyle} />
                      </div>
                      <div>
                        <label className={LabelStyle}>¿Cómo prefieres que te hablemos?</label>
                        <div className="flex gap-2 flex-wrap">
                          {OSOS_TONOS.map(t => (
                            <button key={t.id} onClick={() => setFormData({ ...formData, osos_tono: t.id })}
                              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${formData.osos_tono === t.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                              {formData.osos_tono === t.id ? '✓ ' : ''}{t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={LabelStyle}>¿Qué sueles buscar en BRO7VISION?</label>
                        <div className="flex gap-2 flex-wrap">
                          {OSOS_INTERESES.map(i => (
                            <button key={i.id} onClick={() => toggleOsosInteres(i.id)}
                              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${ososInteresesArr.includes(i.id) ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                              {ososInteresesArr.includes(i.id) ? '✓ ' : ''}{i.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={LabelStyle}>Algo sobre ti (opcional)</label>
                        <input type="text" maxLength={100} placeholder="Diseñador en Oviedo..." value={formData.osos_frase} onChange={e => setFormData({ ...formData, osos_frase: e.target.value })} className={InputStyle} />
                      </div>                
                    </div>      
                  </div>                  
                </div>

                {/* ======================================= */}
                {/* ➡️ COLUMNA DERECHA (Diseño y Equipo IA) */}
                {/* ======================================= */}
                <div className="space-y-6">

                  {/* ENERGÍA Y MATERIA */}
                  <div className={CardStyle}>
                    <p className={LabelStyle}>⚡ ENERGÍA (Borde)</p>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {ENERGY_COLORS.map(c => (
                        <button key={c.id} onClick={() => setEnergyColor(c.id)}
                          className={`w-8 h-8 rounded-full transition-transform ${c.hex} ${energyColor === c.id ? 'scale-125 ring-2 ring-white' : 'opacity-40 hover:opacity-100 hover:scale-110'}`} />
                      ))}
                    </div>
                    <p className={LabelStyle}>🌑 MATERIA (Fondo)</p>
                    <div className="flex flex-wrap gap-3">
                      {MATTER_COLORS.map(c => (
                        <button key={c.id} onClick={() => setMatterColor(c.id)}
                          className={`w-8 h-8 rounded-full border border-white/10 ${c.hex} ${matterColor === c.id ? 'scale-125 ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'opacity-60 hover:opacity-100 hover:scale-110'}`} />
                      ))}
                    </div>
                  </div>

                  {/* HOLOPRISMA */}
                  <div className={`${CardStyle} border-fuchsia-500/20`}>
                    <p className="text-xs font-bold text-fuchsia-400 mb-3 flex items-center gap-2">💎 HOLOPRISMA (3D)</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['holo_1', 'holo_2', 'holo_3', 'holo_4'].map((h, i) => (
                        <MediaSlot key={h} title={`CARA ${i + 1}`} fieldName={h} type="image/*" description="" />
                      ))}
                    </div>
                  </div>

                  {/* ✦ NOVA (Formato Puesto Fijo igual a Rumores) */}
                  <div className="bg-gradient-to-br from-cyan-950/30 to-fuchsia-950/20 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl">🛍️</span>
                      <div>
                        <p className="text-sm font-black text-cyan-300 tracking-wider">SECTOR BROSHOP</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Gestión y atención de tu área comercial.</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className={LabelStyle}>Titular del Área</label>
                        <div className="mt-2 max-w-[200px]">
                          <div className="p-3 rounded-2xl border text-center bg-cyan-900/20 border-cyan-500/30 text-cyan-400 opacity-90 cursor-default shadow-inner">
                            <img src="/emojis/nova.webp" alt="Nova" className="w-16 h-16 mx-auto mb-2 object-contain drop-shadow-lg" />
                            <p className="text-xs font-black uppercase">Nova</p>
                            <p className="text-[9px] opacity-70">La Comerciante</p>
                            <div className="mt-3 text-[9px] font-bold bg-cyan-950/60 rounded-full py-1 px-2 border border-cyan-500/20 inline-block">🔒 PUESTO FIJO</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✦ SERVICIOS IA (Isabella y PROFESOR) */}
                  <div className="bg-gradient-to-br from-cyan-950/30 to-fuchsia-950/20 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl">🛠️</span>
                      <div>
                        <p className="text-sm font-black text-cyan-300 tracking-wider">SECTOR DE SERVICIOS</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Elige al experto que gestionará esta área.</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className={LabelStyle}>¿Quién quieres que se encargue?</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          {[
                            { id: 'ISABELLA',  img: '/emojis/isabella.webp',  nombre: 'Isabella',  desc: 'La Madre' },
                            { id: 'PROFESOR', img: '/emojis/prmaestro.webp', nombre: 'profesor', desc: 'El Filósofo' },
                          ].map(personaje => (
                            <button key={personaje.id} onClick={() => setFormData({ ...formData, servicios_id: personaje.id, servicios_personaje: personaje.nombre })}
                              className={`p-3 rounded-2xl border text-center transition-all ${formData.servicios_id === personaje.id ? 'bg-cyan-900/40 border-cyan-500/60 text-cyan-300' : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/20'}`}>
                              <img src={personaje.img} alt={personaje.nombre} className="w-16 h-16 mx-auto mb-2 object-contain drop-shadow-lg" />
                              <p className="text-xs font-black uppercase">{personaje.nombre}</p>
                              <p className="text-[9px] opacity-70">{personaje.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✦ AUDIO & LIVES (Mapache y Ami) */}
                  <div className="bg-gradient-to-br from-cyan-950/30 to-fuchsia-950/20 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl">🎧</span>
                      <div>
                        <p className="text-sm font-black text-cyan-300 tracking-wider">SECTOR AUDIO & LIVES</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Selecciona al host para tus transmisiones.</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className={LabelStyle}>Elige a tu personaje favorito</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          {[
                            { id: 'MAPACHE', img: '/emojis/mapache.webp', nombre: 'Mapache', desc: 'El Gamer' },
                            { id: 'AMI',     img: '/emojis/ami.webp',     nombre: 'Ami',     desc: 'La Tech' },
                          ].map(personaje => (
                            <button key={personaje.id} onClick={() => setFormData({ ...formData, audio_id: personaje.id, audio_personaje: personaje.nombre })}
                              className={`p-3 rounded-2xl border text-center transition-all ${formData.audio_id === personaje.id ? 'bg-cyan-900/40 border-cyan-500/60 text-cyan-300' : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/20'}`}>
                              <img src={personaje.img} alt={personaje.nombre} className="w-16 h-16 mx-auto mb-2 object-contain drop-shadow-lg" />
                              <p className="text-xs font-black uppercase">{personaje.nombre}</p>
                              <p className="text-[9px] opacity-70">{personaje.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                 {/* ✦ EL ORÁCULO (Orumama, SMisterio, Jaguar) */}
<div className="bg-gradient-to-br from-cyan-950/30 to-fuchsia-950/20 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
  <div className="flex items-center gap-3 mb-5">
    <span className="text-2xl">🔮</span>
    <div>
      <p className="text-sm font-black text-cyan-300 tracking-wider">SECTOR DEL ORÁCULO</p>
      <p className="text-[10px] text-gray-500 mt-0.5">Conecta con la sabiduría ancestral.</p>
    </div>
  </div>
  <div className="space-y-5">
    <div>
      <label className={LabelStyle}>¿A quién consultarás hoy?</label>
      {/* grid-cols-3 para las 3 columnas */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          { id: 'ORUMAMA', img: '/emojis/orumama.webp', nombre: 'Orumama', desc: 'La Experiencia' },
          { id: 'SMISTERIO', img: '/emojis/smisterio.webp', nombre: 'SMisterio', desc: 'El Misterio' },  
          { id: 'JAGUAR',  img: '/emojis/jaguar.webp',  nombre: 'Jaguar',  desc: 'La Redención' },
        ].map(personaje => (
          <button 
            key={personaje.id} 
            onClick={() => setFormData({ ...formData, oraculo_id: personaje.id, oraculo_personaje: personaje.nombre })}
            // Reduje el padding a p-2 para ganar espacio interno
            className={`p-2 rounded-2xl border text-center transition-all ${formData.oraculo_id === personaje.id ? 'bg-cyan-900/40 border-cyan-500/60 text-cyan-300' : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/20'}`}
          >
            {/* Aumenté las imágenes a w-20 h-20 (puedes probar con w-24 si quieres más) */}
            <img src={personaje.img} alt={personaje.nombre} className="w-20 h-20 mx-auto mb-1 object-contain drop-shadow-lg" />
            <p className="text-[10px] font-black uppercase">{personaje.nombre}</p>
            <p className="text-[8px] opacity-70">{personaje.desc}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
</div>
                  {/* ✦ SECTOR DE AVISOS (Evelyn y Larry) */}
                  <div className="bg-gradient-to-br from-cyan-950/30 to-fuchsia-950/20 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl">📰</span>
                      <div>
                        <p className="text-sm font-black text-cyan-300 tracking-wider">SECTOR DE AVISOS</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Tu especialista financiero para anuncios.</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className={LabelStyle}>¿Quién dará las noticias?</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          {[
                            { id: 'EVELYN', img: '/emojis/evelyn.webp', nombre: 'Evelyn', desc: 'La Financiera' },
                            { id: 'LARRY',  img: '/emojis/larry.webp',  nombre: 'Larry',  desc: 'El Inversor' },
                          ].map(personaje => (
                            <button key={personaje.id} onClick={() => setFormData({ ...formData, avisos_id: personaje.id, avisos_personaje: personaje.nombre })}
                              className={`p-3 rounded-2xl border text-center transition-all ${formData.avisos_id === personaje.id ? 'bg-cyan-900/40 border-cyan-500/60 text-cyan-300' : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/20'}`}>
                              <img src={personaje.img} alt={personaje.nombre} className="w-16 h-16 mx-auto mb-2 object-contain drop-shadow-lg" />
                              <p className="text-xs font-black uppercase">{personaje.nombre}</p>
                              <p className="text-[9px] opacity-70">{personaje.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✦ REINOS Y NOMBRAMIENTOS (Rumores) */}
                  <div className="bg-gradient-to-br from-cyan-950/30 to-fuchsia-950/20 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl">📜</span>
                      <div>
                        <p className="text-sm font-black text-cyan-300 tracking-wider">LISTADO DE REINOS</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Encargado oficial de nombramientos.</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className={LabelStyle}>Titular del Área</label>
                        <div className="mt-2 max-w-[200px]">
                          <div className="p-3 rounded-2xl border text-center bg-cyan-900/20 border-cyan-500/30 text-cyan-400 opacity-90 cursor-default shadow-inner">
                            <img src="/emojis/rumores.webp" alt="Rumores" className="w-16 h-16 mx-auto mb-2 object-contain drop-shadow-lg" />
                            <p className="text-xs font-black uppercase">Rumores</p>
                            <p className="text-[9px] opacity-70">La Elegancia</p>
                            <div className="mt-3 text-[9px] font-bold bg-cyan-950/60 rounded-full py-1 px-2 border border-cyan-500/20 inline-block">🔒 PUESTO FIJO</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ZONA DE RIESGO */}
                  <div className="bg-red-950/20 backdrop-blur-xl border border-red-500/30 p-6 rounded-3xl shadow-[0_0_20px_rgba(239,68,68,0.15)] mt-12">
                    <h3 className="text-sm text-red-400 font-bold mb-2 flex items-center gap-2">🚨 ZONA DE RIESGO</h3>
                    <p className="text-xs text-gray-400 mb-4">Desintegrar tu identidad borrará tus Puntos, Vales y tu HoloPrisma de forma irreversible.</p>
                    <button onClick={handleDeleteAccount}
                      className="w-full py-3 px-4 bg-red-600/10 hover:bg-red-600/90 text-red-400 hover:text-white text-xs font-bold uppercase tracking-widest rounded-xl border border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.8)] transition-all duration-300 flex justify-center items-center gap-2">
                      <span>☠️</span> Iniciar Autodestrucción
                    </button>
                  </div>

                </div>
              </div>
            )}
            
            {/* ══ 📡 SEÑAL ══ */}
{tab === 'audio' && (
  <SignalUploader
    formData={formData}
    setFormData={setFormData}
    loading={loading}
    setLoading={setLoading}
  />
)}
            {/* ══ ☝️ TELÉFONO CASA ══ */}
            {tab === 'Telefono Casa' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                <div className={`${CardStyle} border-fuchsia-500/20`}>
                  <p className="text-sm text-fuchsia-300 font-bold mb-4 tracking-wider">🏠 ATMÓSFERA DE LA SUITE</p>
                  <select value={formData.intimo_bg || ""} onChange={e => setFormData({ ...formData, intimo_bg: e.target.value })}
                    className={`${InputStyle} appearance-none cursor-pointer mb-6`}>
                    <option value="" disabled>--- SELECCIONAR ATMÓSFERA ---</option>
                    <option value="salon">🍵 SALÓN PREMIUM (Classic)</option>
                    <option value="cocina">🍳 COCINA GOURMET (Classic)</option>
                    <option value="dormitorio">🌌 CYBER SUITE (Furry Style)</option>
                    <option value="ducha">✨ LLUVIA BIO-FOREST (Therian Suite)</option>
                  </select>
                  <label className="text-xs font-bold text-orange-300 ml-1 mb-1 block">RESPUESTA VISOR (Loop)</label>
                  <input type="text" value={formData.creator_loop_reply}
                    onChange={e => setFormData({ ...formData, creator_loop_reply: e.target.value })}
                    placeholder="Ej: Hola Maggie, ya subí la foto!"
                    className={`${InputStyle} border-orange-500/30 focus:border-orange-400 mb-8`} />
                  <div className="border-t border-fuchsia-500/10 pt-6">
                    <p className="text-xs font-bold text-cyan-300 mb-3">📝 BRO-LOG VIEWER (Editorial)</p>
                    <input type="text" value={formData.editorial_title}
                      onChange={e => setFormData({ ...formData, editorial_title: e.target.value })}
                      placeholder="TÍTULO DEL ARTÍCULO..." className={`${InputStyle} font-bold mb-3`} />
                    <textarea value={formData.editorial_content}
                      onChange={e => setFormData({ ...formData, editorial_content: e.target.value })}
                      placeholder="Escribe el cuerpo del artículo..."
                      className={`${InputStyle} h-48 rounded-2xl resize-none mb-4`} />
                  </div>
                </div>
                {/* BUZÓN */}
                <div className="bg-[#020617]/20 p-6 rounded-3xl border border-white/5 h-full flex flex-col shadow-inner">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-4 tracking-widest text-center">📥 Preguntas de la Audiencia</p>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                    {questions.length > 0 ? questions.map(q => (
                      <div key={q.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                        <p className="text-[10px] text-fuchsia-400 font-bold uppercase mb-2">@{q.author_alias}</p>
                        <p className="text-sm text-gray-200 leading-relaxed font-light">"{q.text.replace('❓ PREGUNTA: ', '')}"</p>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50">
                        <span className="text-4xl mb-2">📭</span>
                        <span className="text-xs italic">Sin mensajes nuevos</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══ 🛒 TIENDA ══ */}
            {tab === 'market' && (
              <MarketTab formData={formData} setFormData={setFormData} />
            )}
            
            
            {/* ══ 📢 MIS AVISOS ══ */}
            {tab === 'avisos' && <AvisosTab />}
            

            {/* ══ 🛰️ ÓRBITA & RADAR ══ */}
            {tab === 'metrics' && (
              <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full border border-orange-500/50 flex items-center justify-center bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.3)] animate-[spin_10s_linear_infinite]">
                    <span className="animate-[spin_10s_linear_infinite_reverse] text-2xl">☄️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-orange-400 tracking-widest uppercase">Radar de Sistema</h3>
                    <p className="text-xs text-orange-200/50 font-bold tracking-widest">MONITOR DE TRÁFICO Y RETENCIÓN</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-black/20 backdrop-blur-md border border-white/5 p-6 rounded-3xl opacity-60 grayscale cursor-not-allowed">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Total Visualización</p>
                    <span className="bg-cyan-900/40 text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full border border-cyan-500/20 uppercase tracking-widest">🔒 Desbloqueo Fase 1</span>
                    <p className="text-[10px] text-gray-600 mt-4 border-t border-white/5 pt-2">Requiere Motor de Video Nativo.</p>
                  </div>
                  <div className="bg-black/20 backdrop-blur-md border border-white/5 p-6 rounded-3xl opacity-60 grayscale cursor-not-allowed">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Tráfico Hyper Zap</p>
                    <span className="bg-fuchsia-900/40 text-fuchsia-400 text-[10px] font-bold px-3 py-1 rounded-full border border-fuchsia-500/20 uppercase tracking-widest">🔒 Desbloqueo Fase 1</span>
                    <p className="text-[10px] text-gray-600 mt-4 border-t border-white/5 pt-2">Requiere Módulo de Tráfico.</p>
                  </div>
                  <div className="bg-black/20 backdrop-blur-md border border-orange-500/30 p-6 rounded-3xl relative overflow-hidden group hover:border-orange-400 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,1)]" />
                    <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-2">Naves en Órbita</p>
                    <p className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">{followerCount}</p>
                    <p className="text-[10px] text-gray-300 mt-2 border-t border-white/10 pt-2">Usuarios en seguimiento (En vivo).</p>
                  </div>
                </div>
                <div className="mt-8 bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                  <h3 className="text-xs text-gray-300 font-bold uppercase tracking-widest mb-4 flex justify-between items-center border-b border-white/10 pb-4">
                    <span>Constelación Activa (Seguidores)</span>
                    <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-3 py-1 rounded-full text-[10px]">EN DIRECTO</span>
                  </h3>
                  <p className="text-xs text-gray-600 italic text-center py-8">Los datos reales de seguidores se cargarán aquí en Fase 1.</p>
                </div>
              </div>
            )}

            {/* ══ 👑 LINAJE ══ */}
            {tab === 'linaje' && formData.rank && (() => {

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
                rey:      { m:{ rango:'Rey',      tratamiento:'Don',            subtitulo:'Alta Corte'     }, f:{ rango:'Reina',    tratamiento:'Doña',           subtitulo:'Alta Corte'     }, n:{ rango:'Reyes',    tratamiento:'Excelentísimos',  subtitulo:'Alta Corte'     } },
                principe: { m:{ rango:'Príncipe',  tratamiento:'Excelentísimo',  subtitulo:'Guardia Real'   }, f:{ rango:'Princesa', tratamiento:'Excelentísima',  subtitulo:'Guardia Real'   }, n:{ rango:'Príncipes',tratamiento:'Excelentísimos', subtitulo:'Guardia Real'   } },
                duque:    { m:{ rango:'Duque',     tratamiento:'Ilustrísimo',    subtitulo:'Nobleza Mayor'  }, f:{ rango:'Duquesa', tratamiento:'Ilustrísima',    subtitulo:'Nobleza Mayor'  }, n:{ rango:'Duques',   tratamiento:'Ilustrísimos',   subtitulo:'Nobleza Mayor'  } },
                marques:  { m:{ rango:'Marqués',   tratamiento:'Honorable',      subtitulo:'Nobleza'        }, f:{ rango:'Marquesa',tratamiento:'Honorable',      subtitulo:'Nobleza'        }, n:{ rango:'Marqueses',tratamiento:'Honorables',     subtitulo:'Nobleza'        } },
                conde:    { m:{ rango:'Conde',     tratamiento:'Noble',          subtitulo:'Nobleza'        }, f:{ rango:'Condesa', tratamiento:'Noble',          subtitulo:'Nobleza'        }, n:{ rango:'Condes',   tratamiento:'Nobles',         subtitulo:'Nobleza'        } },
                lord:     { m:{ rango:'Lord',      tratamiento:'',               subtitulo:'Honor del Reino'}, f:{ rango:'Lady',    tratamiento:'',               subtitulo:'Honor del Reino'}, n:{ rango:'Lords',    tratamiento:'',               subtitulo:'Honor del Reino'} },
              };
              const GENESIS = { rey:2000, principe:1000, duque:500, marques:300, conde:200, lord:100 };
              const COLORES  = {
                rey:      { text:'text-orange-400', border:'border-orange-500/40', bg:'bg-orange-950/30', sel:'bg-orange-600', glow:'0 0 25px rgba(249,115,22,0.25)' },
                principe: { text:'text-blue-400',   border:'border-blue-500/40',   bg:'bg-blue-950/30',   sel:'bg-blue-600',   glow:'0 0 25px rgba(59,130,246,0.25)' },
                duque:    { text:'text-purple-400', border:'border-purple-500/40', bg:'bg-purple-950/30', sel:'bg-purple-600', glow:'0 0 25px rgba(168,85,247,0.25)' },
                marques:  { text:'text-cyan-400',   border:'border-cyan-500/40',   bg:'bg-cyan-950/30',   sel:'bg-cyan-600',   glow:'0 0 25px rgba(6,182,212,0.25)'  },
                conde:    { text:'text-green-400',  border:'border-green-500/40',  bg:'bg-green-950/30',  sel:'bg-green-600',  glow:'0 0 25px rgba(34,197,94,0.25)'  },
                lord:     { text:'text-yellow-400', border:'border-yellow-500/40', bg:'bg-yellow-950/20', sel:'bg-yellow-500', glow:'0 0 25px rgba(234,179,8,0.25)'  },
              };

              const rank   = formData.rank || 'rey';
              const titulo = (TITULOS[rank] || TITULOS.rey)[g];
              const c      = COLORES[rank]  || COLORES.rey;
              const gen    = GENESIS[rank]  || 0;

              const actividad = [
                { key:'video',    label:'Subir contenido',  done: formData.actividad_video,    emoji:'🎬' },
                { key:'activo',   label:'Halo · Eco · Zap', done: formData.actividad_activo,   emoji:'⚡' },
                { key:'games',    label:'Jugar en Games',   done: formData.actividad_games,    emoji:'🎮' },
                { key:'brostory', label:'Ver BroStory',     done: formData.actividad_brostory, emoji:'👁️' },
              ];
              const done      = actividad.filter(a => a.done).length;
              const barColor  = done === 4 ? 'bg-green-500' : done >= 2 ? 'bg-yellow-500' : 'bg-red-500';
              const doneColor = done === 4 ? 'text-green-400' : done >= 2 ? 'text-yellow-400' : 'text-red-400';

              return (
                <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto pb-10">

                  {/* IDENTIDAD NOBLE */}
                  <div className={`rounded-2xl border ${c.border} p-8 text-center relative overflow-hidden`} style={{ boxShadow: c.glow }}>
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'28px 28px' }} />
                    <div className="relative z-10">
                      <img src="/assets/corona_rey.png" alt="corona" className="w-24 h-24 mx-auto mb-3 object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]" onError={e => e.target.style.display='none'} />
                      <p className={`${c.text} text-[10px] uppercase tracking-[0.35em] mb-2`} style={{ fontFamily:"'Georgia', serif" }}>{titulo.subtitulo} · Bro7vision</p>
                      <div className="space-y-1">
                        {titulo.tratamiento && <p className={`${c.text} text-base font-bold uppercase tracking-[0.2em]`} style={{ fontFamily:"'Georgia', serif" }}>{titulo.tratamiento}</p>}
                        <p className={`${c.text} text-xl font-black uppercase tracking-[0.15em]`} style={{ fontFamily:"'Georgia', serif" }}>{titulo.rango}</p>
                        <p className="text-white text-3xl font-black" style={{ fontFamily:"'Georgia', 'Times New Roman', serif" }}>{formData.alias}</p>
                        {reinoElegido && (<>
                          <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mt-1">Proveniente del</p>
                          <p className={`${c.text} text-lg font-bold`} style={{ fontFamily:"'Georgia', serif" }}>{reinoElegido}</p>
                        </>)}
                      </div>
                      <div className={`h-px w-20 mx-auto mt-4 opacity-40 ${c.sel}`} />
                      <p className="text-gray-600 text-xs uppercase tracking-widest mt-3">{gen.toLocaleString()} Génesis · mensual</p>
                    </div>
                  </div>

                  {/* ELEGIR DOMINIO */}
                  <div className={`rounded-2xl border ${c.border} p-6`}>
                    <p className={`${c.text} font-black text-base uppercase tracking-widest mb-1`} style={{ fontFamily:"'Georgia', serif" }}>
                      {reinoElegido ? '✦ Tu Dominio' : '✦ Elige tu Dominio'}
                    </p>
                    <p className="text-gray-500 text-xs mb-5 leading-relaxed">
                      {reinoElegido ? `Tu título completo: ${titulo.tratamiento ? titulo.tratamiento + ' ' : ''}${titulo.rango} ${formData.alias} del ${reinoElegido}` : 'Selecciona el reino que gobernarás.'}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
                      {REINOS.map((reino) => {
                        const sel = reinoElegido === reino;
                        return (
                          <button key={reino} onClick={() => handleGuardarReino(reino)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${sel ? `${c.sel} text-black border-transparent shadow-md` : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}>
                            {sel && <span className="mr-1">✓</span>}{reino}
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">¿No encuentras el tuyo? Proponlo</p>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Ej: Reino de Sirio..."
                          value={reinoPropuesto} onChange={(e) => setReinoPropuesto(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-orange-500 focus:outline-none placeholder-gray-700" />
                        <button onClick={async () => {
                          if (!reinoPropuesto.trim()) return;
                          const { data: { user } } = await supabase.auth.getUser();
                          await supabase.from('reino_propuestas').insert([{ user_id: user.id, alias: formData.alias, propuesta: reinoPropuesto.trim(), created_at: new Date().toISOString() }]);
                          alert('✅ Propuesta enviada.');
                          setReinoPropuesto('');
                        }} className={`${c.sel} text-black font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest hover:brightness-110 transition-all`}>
                          Proponer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVIDAD */}
                  <div className="rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-white font-black text-base uppercase tracking-widest" style={{ fontFamily:"'Georgia', serif" }}>⚡ Actividad del Mes</p>
                      <span className={`${doneColor} text-sm font-bold`}>{done}/4 {done === 4 ? '— ✅ Al día' : '— pendiente'}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full mb-5 overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width:`${(done/4)*100}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {actividad.map((a) => (
                        <div key={a.key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${a.done ? 'bg-green-950/20 border-green-700/30' : 'bg-white/3 border-white/10'}`}>
                          <span className="text-xl">{a.emoji}</span>
                          <p className={`text-xs font-bold flex-1 ${a.done ? 'text-green-300' : 'text-gray-500'}`}>{a.label}</p>
                          <span className={a.done ? 'text-green-400 font-bold' : 'text-gray-700'}>{a.done ? '✓' : '○'}</span>
                        </div>
                      ))}
                    </div>
                    {done < 4 && <p className="text-yellow-700 text-xs uppercase tracking-widest mt-4 text-center">⚠️ Completa al menos una acción de cada tipo para recibir tus Génesis</p>}
                  </div>

                  {/* HISTORIAL GÉNESIS */}
                  <div className="rounded-2xl border border-white/10 p-6">
                    <p className="text-white font-black text-base uppercase tracking-widest mb-4" style={{ fontFamily:"'Georgia', serif" }}>🌙 Génesis del Reino</p>
                    <div className="space-y-2">
                      {(formData.genesis_historial?.length > 0 ? formData.genesis_historial : [{ mes:'Marzo 2026', cantidad: gen, estado:'pendiente' }]).map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/5 rounded-xl">
                          <p className="text-gray-400 text-sm">{item.mes}</p>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${c.text}`}>+{item.cantidad.toLocaleString()} GEN</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.estado === 'entregado' ? 'bg-green-900/40 text-green-400' : item.estado === 'fuerza_mayor' ? 'bg-blue-900/40 text-blue-400' : 'bg-yellow-900/40 text-yellow-600'}`}>
                              {item.estado === 'entregado' ? '✓ Entregado' : item.estado === 'fuerza_mayor' ? '🛡️ Fuerza Mayor' : '⏳ Pendiente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* JURAMENTO */}
                  <div className="rounded-2xl overflow-hidden border border-white/10 relative">
                    <div className="absolute inset-0 z-0">
                      <img src="/assets/pergamino_bg.png" alt="" className="w-full h-full object-cover opacity-90" onError={e => e.target.style.display='none'} />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />
                    </div>
                    <div className="relative z-10 p-8 text-center">
                      <p className={`${c.text} text-[10px] uppercase tracking-[0.35em] mb-3`}>— Orden Real de Bro7vision —</p>
                      <h4 className="text-white text-2xl font-black mb-6" style={{ fontFamily:"'Georgia', 'Times New Roman', serif" }}>Juramento del Reino Interior</h4>
                      <div className="max-w-lg mx-auto mb-6 p-6 rounded-xl bg-black/50 border border-white/10">
                        <p className="text-gray-300 text-sm leading-loose italic" style={{ fontFamily:"'Georgia', serif" }}>
                          "Por la luz del Reino Interior, juro mantener mi presencia, honrar mi dominio y servir con constancia. Que mis actos hablen por mí y que mi nombre permanezca en el Listado de Honor mientras mi voluntad sea firme."
                        </p>
                      </div>
                      {juramentoFirmado ? (
                        <div className="space-y-2">
                          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full ${c.bg} border ${c.border}`}>
                            <span className="text-green-400">✓</span>
                            <span className="text-gray-300 text-xs uppercase tracking-widest font-bold">Juramento sellado</span>
                          </div>
                          {formData.juramento_fecha && (
                            <p className="text-gray-600 text-xs mt-1">Firmado el {new Date(formData.juramento_fecha).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">Al firmar aceptas el compromiso de actividad mensual y las condiciones del Reino Interior.</p>
                          <button onClick={handleFirmarJuramento} className={`${c.sel} text-black font-black px-10 py-3 rounded-full text-sm uppercase tracking-widest hover:brightness-110 transition-all`} style={{ boxShadow: c.glow }}>
                            📜 Firmar Juramento
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-center text-xs text-gray-700 uppercase tracking-[0.3em]" style={{ fontFamily:"'Georgia', serif" }}>La grandeza se sostiene con presencia y dedicación.</p>
                </div>
              );
            })()}

          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-white/10 bg-black/10 backdrop-blur-3xl flex justify-end gap-4 shrink-0 relative z-20">
          <button onClick={onClose} className="text-gray-300 text-xs px-6 py-3 font-bold uppercase hover:text-white transition-all hover:bg-white/5 rounded-full">Desconectar</button>
          <button onClick={handleSave} disabled={loading}
            className="bg-white/90 text-black font-bold uppercase text-xs px-8 py-3 rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            {loading ? '🚀 INYECTANDO...' : 'ACTUALIZAR CAMBIOS'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BoosterModal;