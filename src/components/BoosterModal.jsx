// src/components/BoosterModal.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// src/components/BoosterModal.jsx

const ENERGY_COLORS = [
    { id: 'cyan', hex: 'bg-cyan-500', name: 'CYAN' },
    { id: 'fuchsia', hex: 'bg-fuchsia-500', name: 'MAGENTA' },
    { id: 'yellow', hex: 'bg-yellow-400', name: 'AMARILLO' },
    { id: 'green', hex: 'bg-green-500', name: 'VERDE' },
    { id: 'blue', hex: 'bg-blue-500', name: 'AZUL' }, // <--- NUEVO
    { id: 'red', hex: 'bg-red-500', name: 'ROJO' },
    { id: 'orange', hex: 'bg-orange-500', name: 'NARANJA' },
    { id: 'gold', hex: 'bg-[#C7AF38]', name: 'ORO' }, // <--- AJUSTADO
    { id: 'silver', hex: 'bg-[#D9D9D9]', name: 'PLATA' }, // <--- AJUSTADO
    { id: 'white', hex: 'bg-white', name: 'BLANCO' }
];

const MATTER_COLORS = [
    { id: 'void', hex: 'bg-[#000000]', name: 'NEGRO PURO' },
    { id: 'carbon', hex: 'bg-[#222222]', name: 'GRIS SOLIDO' },
    { id: 'navy', hex: 'bg-[#091221]', name: 'AZUL NAVY' }, // <--- AJUSTADO
    { id: 'cobalt', hex: 'bg-[#0A5AAB]', name: 'COBALTO' }, // <--- AJUSTADO
    { id: 'wine', hex: 'bg-[#2b0505]', name: 'VINO' },
    { id: 'crimson', hex: 'bg-[#4a0404]', name: 'CARMESÍ' },
    { id: 'forest', hex: 'bg-[#0A730A]', name: 'BOSQUE' }, // <--- AJUSTADO
    { id: 'emerald', hex: 'bg-[#013030]', name: 'ESMERALDA' }, // <--- AJUSTADO
    { id: 'plum', hex: 'bg-[#2e0542]', name: 'CIRUELA' },
    { id: 'chocolate', hex: 'bg-[#B04405]', name: 'CHOCOLATE' } // <--- AJUSTADO
];
const BoosterModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('identity'); 
  const [showHoloConfig, setShowHoloConfig] = useState(false); // Nuevo estado para desplegar Holo
  
  const [energyColor, setEnergyColor] = useState('cyan');
  const [matterColor, setMatterColor] = useState('void');

  const [formData, setFormData] = useState({
    alias: '', avatar_url: '', banner_url: '', twit_message: '',
    track_name: '', audio_file: '', bcast_file: '', video_file: '',
    log_title: '', log_content: '',
    holo_1: '', holo_2: '', holo_3: '', holo_4: '',
    role: '', 
    product_title: '', product_desc: '', product_price: '', product_url: '',
    service_title: '', service_desc: '', service_price: '', service_url: ''
  });

  const ROLES = [
      { id: 'MUSIC', label: '🎵 MUSIC', desc: 'DJ, Productor' },
      { id: 'TALK', label: '🎙️ TALK', desc: 'Podcast, News' },
      { id: 'SHOP', label: '📦 SHOP', desc: 'Venta Productos' },
      { id: 'SERVICE', label: '🤝 SERVICE', desc: 'Servicios' }
  ];

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          const savedColor = data.card_color || 'cyan-void';
          if (savedColor.includes('-')) {
              const parts = savedColor.split('-');
              setEnergyColor(parts[0]);
              setMatterColor(parts[1]);
          } else {
              setEnergyColor(savedColor);
              setMatterColor('void'); 
          }

          setFormData({
            alias: data.alias || user.user_metadata.alias || '',
            role: data.role || '',
            avatar_url: data.avatar_url || '',
            banner_url: data.banner_url || '',
            twit_message: data.twit_message || '',
            track_name: data.track_name || '',
            audio_file: data.audio_file || '',
            bcast_file: data.bcast_file || '',
            video_file: data.video_file || '',
            log_title: data.logs?.[0]?.title || '',
            log_content: data.logs?.[0]?.content || '',
            holo_1: data.holo_1 || '', holo_2: data.holo_2 || '', holo_3: data.holo_3 || '', holo_4: data.holo_4 || '',
            product_title: data.product_title || '', product_desc: data.product_desc || '', product_price: data.product_price || '', product_url: data.product_url || '',
            service_title: data.service_title || '', service_desc: data.service_desc || '', service_price: data.service_price || '', service_url: data.service_url || ''
          });
        }
      }
    };
    loadProfile();
  }, []);

  const toggleRole = (roleId) => {
      let currentRoles = formData.role ? formData.role.split(',') : [];
      if (currentRoles.includes(roleId)) currentRoles = currentRoles.filter(r => r !== roleId);
      else currentRoles.push(roleId);
      setFormData({ ...formData, role: currentRoles.join(',') });
  };

  const hasRole = (rId) => formData.role && formData.role.includes(rId);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newLog = { title: formData.log_title, content: formData.log_content, date: new Date().toISOString() };
      const logsArray = formData.log_title ? [newLog] : [];
      const finalColorString = `${energyColor}-${matterColor}`;

      const updates = {
        alias: formData.alias,
        role: formData.role,
        avatar_url: formData.avatar_url,
        banner_url: formData.banner_url,
        twit_message: formData.twit_message,
        card_color: finalColorString,
        track_name: formData.track_name,
        audio_file: formData.audio_file,
        bcast_file: formData.bcast_file,
        video_file: formData.video_file,
        logs: logsArray,
        holo_1: formData.holo_1, holo_2: formData.holo_2, holo_3: formData.holo_3, holo_4: formData.holo_4,
        product_title: formData.product_title, product_desc: formData.product_desc, product_price: formData.product_price, product_url: formData.product_url,
        service_title: formData.service_title, service_desc: formData.service_desc, service_price: formData.service_price, service_url: formData.service_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      await supabase.auth.updateUser({ data: { alias: formData.alias } });

      if (error) throw error;
      alert("✅ PERFIL ACTUALIZADO");
      onClose();
      window.location.reload(); 
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn font-mono">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
      <div className={`relative z-10 w-full max-w-2xl bg-[#0a0a0a] border-2 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col pointer-events-auto transition-colors duration-500 border-gray-600`}>
        
        {/* HEADER */}
        <div className={`bg-gray-900/50 border-b border-gray-600 p-4 flex justify-between items-center`}>
            <h2 className={`text-white font-black uppercase tracking-widest text-lg flex items-center gap-2`}><span>🔧</span> BOOSTER STUDIO</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white px-2">✕ ESC</button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-white/10 bg-black overflow-x-auto">
            <button onClick={() => setTab('identity')} className={`flex-1 py-4 px-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'identity' ? `bg-white/10 text-white border-b-2 border-white` : 'text-gray-600 hover:text-white'}`}>👤 Identidad</button>
            <button onClick={() => setTab('audio')} className={`flex-1 py-4 px-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'audio' ? `bg-white/10 text-white border-b-2 border-white` : 'text-gray-600 hover:text-white'}`}>📡 Transmisión</button>
            <button onClick={() => setTab('market')} className={`flex-1 py-4 px-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'market' ? `bg-white/10 text-white border-b-2 border-white` : 'text-gray-600 hover:text-white'}`}>📢 Escaparate</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar max-h-[60vh] bg-gradient-to-b from-[#111] to-black">
            
            {/* TAB IDENTIDAD */}
            {tab === 'identity' && (
                <div className="space-y-6 animate-fadeIn">
                    
                    {/* IMÁGENES PERFIL Y BANNER (RECUPERADO) */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">IMÁGENES PÚBLICAS</p>
                            <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-[9px] text-cyan-400 hover:underline">☁️ Subir en Postimages ↗</a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] text-gray-500 block mb-1">FOTO PERFIL (Avatar)</label>
                                <input type="text" placeholder="https://..." value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-xs rounded" />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 block mb-1">BANNER (Fondo LiveGrid)</label>
                                <input type="text" placeholder="https://..." value={formData.banner_url} onChange={e => setFormData({...formData, banner_url: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-xs rounded" />
                            </div>
                        </div>
                    </div>

                    {/* DATOS BÁSICOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-gray-400 text-xs font-bold block mb-2">NICK</label><input type="text" value={formData.alias} onChange={e => setFormData({...formData, alias: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-lg font-bold rounded" /></div>
                        <div><label className="text-gray-400 text-xs font-bold block mb-2">ROLES</label><div className="grid grid-cols-2 gap-2">{ROLES.map(r => (<button key={r.id} onClick={() => toggleRole(r.id)} className={`py-2 px-1 text-[9px] font-bold border rounded ${hasRole(r.id) ? `bg-white text-black border-white` : 'bg-black text-gray-500 border-white/20'}`}>{hasRole(r.id) ? '✓ ' + r.label : r.label}</button>))}</div></div>
                    </div>
                    <div><label className="text-gray-400 text-xs font-bold block mb-2">Mensaje Twit</label><input type="text" maxLength={60} value={formData.twit_message} onChange={e => setFormData({...formData, twit_message: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded" /></div>

                    {/* COLORES */}
<div className="bg-white/5 border border-white/10 p-4 rounded-xl">
    <div className="mb-4">
        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">⚡ 1. ENERGÍA (Bordes & Neón)</p>
        <div className="flex flex-wrap gap-3">
            {ENERGY_COLORS.map(c => (
                <button 
                    key={c.id} 
                    onClick={() => setEnergyColor(c.id)} 
                    // Usamos style para asegurar que el color se aplique siempre
                    style={{ backgroundColor: c.hex.startsWith('bg-') ? undefined : c.hex }}
                    className={`w-8 h-8 rounded-full transition-all ${c.hex.startsWith('bg-') ? c.hex : ''} ${
                        energyColor === c.id 
                        ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_white] z-10' 
                        : 'opacity-40 hover:opacity-100 hover:scale-105'
                    }`} 
                    title={c.name} 
                />
            ))}
        </div>
    </div>
    
    <div>
        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">🌑 2. MATERIA (Fondo del Cristal)</p>
        <div className="flex flex-wrap gap-3">
            {MATTER_COLORS.map(c => (
                <button 
                    key={c.id} 
                    onClick={() => setMatterColor(c.id)} 
                    // Aplicación directa del HEX para colores oscuros como el Navy
                    style={{ backgroundColor: c.hex.startsWith('bg-') ? undefined : c.hex }}
                    className={`w-8 h-8 rounded-full border border-white/30 transition-all ${c.hex.startsWith('bg-') ? c.hex : ''} ${
                        matterColor === c.id 
                        ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_white] z-10' 
                        : 'opacity-40 hover:opacity-100 hover:scale-105'
                    }`} 
                    title={c.name} 
                />
            ))}
        </div>
    </div>

    <div className="mt-4 p-2 bg-black rounded text-center">
        <span className="text-[10px] text-gray-500">Preview: </span>
        <span className="text-white font-mono text-xs uppercase">{energyColor} + {matterColor}</span>
    </div>
</div>
                    {/* HOLOPRISMA (RECUPERADO CON TOGGLE) */}
                    <div className="border border-white/10 p-4 rounded-xl">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">💎</span>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">HOLOPRISMA 3D (4 Caras)</p>
                            </div>
                            <button onClick={() => setShowHoloConfig(!showHoloConfig)} className="text-[9px] text-cyan-400 border border-cyan-500 px-3 py-1 rounded hover:bg-cyan-900/50">
                                {showHoloConfig ? '▲ OCULTAR' : '▼ CONFIGURAR'}
                            </button>
                        </div>
                        
                        {showHoloConfig && (
                            <div className="grid grid-cols-2 gap-3 mt-4 animate-fadeIn">
                                <input type="text" placeholder="URL Imagen Vertical 1" value={formData.holo_1} onChange={e=>setFormData({...formData, holo_1:e.target.value})} className="bg-black border border-white/20 p-2 text-[9px] text-white rounded focus:border-cyan-500" />
                                <input type="text" placeholder="URL Imagen Vertical 2" value={formData.holo_2} onChange={e=>setFormData({...formData, holo_2:e.target.value})} className="bg-black border border-white/20 p-2 text-[9px] text-white rounded focus:border-cyan-500" />
                                <input type="text" placeholder="URL Imagen Vertical 3" value={formData.holo_3} onChange={e=>setFormData({...formData, holo_3:e.target.value})} className="bg-black border border-white/20 p-2 text-[9px] text-white rounded focus:border-cyan-500" />
                                <input type="text" placeholder="URL Imagen Vertical 4" value={formData.holo_4} onChange={e=>setFormData({...formData, holo_4:e.target.value})} className="bg-black border border-white/20 p-2 text-[9px] text-white rounded focus:border-cyan-500" />
                                <p className="col-span-2 text-[8px] text-gray-500 text-center italic mt-1">Recomendado: Imágenes verticales (9:16) para efecto 3D óptimo.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB TRANSMISIÓN (AUDIO + VIDEO) */}
            {tab === 'audio' && (
                <div className="space-y-6 animate-fadeIn">
                    
                    {/* DISCLAIMER LEGAL (RECUPERADO) */}
                    <div className="bg-red-900/10 border border-red-500/20 p-3 rounded-lg flex gap-3 items-start">
                        <div className="text-xl">⚖️</div>
                        <p className="text-[9px] text-red-300 font-mono leading-relaxed">
                            <span className="font-bold text-white">AVISO LEGAL:</span> Bro7Vision promueve el contenido libre. 
                            Usa música propia o Licencia <span className="font-bold text-white underline decoration-dashed">Creative Commons 4.0</span>. 
                            Tus contenidos son tuyos, pero evita material con Copyright comercial (Youtube Content ID, etc) para asegurar la permanencia de tu canal.
                        </p>
                    </div>

                    <p className="text-xs text-gray-400 border-l-2 border-cyan-500 pl-2">Configura tus canales de transmisión.</p> 
                    
                    {/* SECCIÓN AUDIO (CYAN) */}
                    <div className="bg-cyan-900/10 p-4 rounded-xl border border-cyan-500/20">
                        <label className="text-[10px] text-cyan-400 font-bold block mb-2">📡 CANAL AUDIO (LIVE / B-CAST)</label>
                        <div className="flex flex-col gap-2">
                             <input type="text" placeholder="URL Audio Live (MP3/Dropbox)" value={formData.audio_file} onChange={e=>setFormData({...formData, audio_file:e.target.value})} className="w-full bg-black border border-cyan-900/50 p-2 text-white text-xs rounded placeholder-gray-600" /> 
                             <input type="text" placeholder="URL B-Cast (Audio Grabado)" value={formData.bcast_file} onChange={e=>setFormData({...formData, bcast_file:e.target.value})} className="w-full bg-black border border-cyan-900/50 p-2 text-white text-xs rounded placeholder-gray-600" />
                        </div>
                    </div>

                    {/* SECCIÓN VIDEO (FUCHSIA) */}
                    <div className="bg-fuchsia-900/10 p-4 rounded-xl border border-fuchsia-500/20">
                        <label className="text-[10px] text-fuchsia-400 font-bold block mb-2 flex items-center gap-2"><span>🎥</span> CANAL VIDEO (HOLO-TV)</label>
                        <p className="text-[9px] text-gray-500 mb-2">Enlace directo a video (MP4, Dropbox DL=1, Drive).</p>
                        <input 
                            type="text" 
                            placeholder="https://..." 
                            value={formData.video_file || ''} 
                            onChange={e=>setFormData({...formData, video_file:e.target.value})} 
                            className="w-full bg-black border border-fuchsia-500/50 p-3 text-white text-xs rounded focus:shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all placeholder-gray-600" 
                        />
                    </div>
                </div>
            )}

            {/* TAB MARKET */}
            {tab === 'market' && (
                <div className="space-y-6 animate-fadeIn">
                    <p className="text-xs text-gray-400">Configura tu escaparate.</p> 
                    <input type="text" placeholder="Título Producto" value={formData.product_title} onChange={e=>setFormData({...formData, product_title:e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm" /> 
                    <input type="text" placeholder="Link de Venta (Stripe/Web)" value={formData.product_url} onChange={e=>setFormData({...formData, product_url:e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm" /> 
                    <hr className="border-white/10"/> 
                    <input type="text" placeholder="Título Servicio" value={formData.service_title} onChange={e=>setFormData({...formData, service_title:e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm" /> 
                    <input type="text" placeholder="Link de Info/Reserva" value={formData.service_url} onChange={e=>setFormData({...formData, service_url:e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm" /> 
                </div>
            )}

        </div>
        <div className="p-4 border-t border-white/10 bg-[#080808] flex justify-end">
            <button onClick={handleSave} disabled={loading} className={`bg-white text-black font-black uppercase text-xs px-8 py-3 rounded hover:opacity-80 transition-opacity`}>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</button>
        </div>
      </div>
    </div>
  );
};
export default BoosterModal;