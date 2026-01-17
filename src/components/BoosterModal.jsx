// src/components/BoosterModal.jsx (MULTICLASE ACTIVADA)
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const BoosterModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('identity'); 
  const [showHoloConfig, setShowHoloConfig] = useState(false);
  
  const [formData, setFormData] = useState({
    alias: '', avatar_url: '', banner_url: '', twit_message: '', card_color: 'cyan',
    track_name: '', audio_file: '', bcast_file: '',
    log_title: '', log_content: '',
    holo_1: '', holo_2: '', holo_3: '', holo_4: '',
    role: '' // Ahora guardará una cadena tipo "MUSIC,SHOP"
  });

  const COLORS = [{id:'cyan',hex:'bg-cyan-500'},{id:'fuchsia',hex:'bg-fuchsia-500'},{id:'yellow',hex:'bg-yellow-400'},{id:'green',hex:'bg-green-500'},{id:'red',hex:'bg-red-500'}];
  
  const ROLES = [
      { id: 'MUSIC', label: '🎵 MUSIC', desc: 'DJ, Productor, Banda' },
      { id: 'TALK', label: '🎙️ TALK', desc: 'Podcast, Debate, News' },
      { id: 'SHOP', label: '🛒 SHOP', desc: 'Venta, Comercio, Marca' }
  ];

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setFormData({
            alias: data.alias || user.user_metadata.alias || '',
            role: data.role || '', // Cargar roles
            avatar_url: data.avatar_url || '',
            banner_url: data.banner_url || '',
            twit_message: data.twit_message || '',
            card_color: data.card_color || 'cyan',
            track_name: data.track_name || '',
            audio_file: data.audio_file || '',
            bcast_file: data.bcast_file || '',
            log_title: data.logs?.[0]?.title || '',
            log_content: data.logs?.[0]?.content || '',
            holo_1: data.holo_1 || '', holo_2: data.holo_2 || '', holo_3: data.holo_3 || '', holo_4: data.holo_4 || ''
          });
        }
      }
    };
    loadProfile();
  }, []);

  // Lógica para marcar/desmarcar múltiples roles
  const toggleRole = (roleId) => {
      let currentRoles = formData.role ? formData.role.split(',') : [];
      
      if (currentRoles.includes(roleId)) {
          // Si ya está, lo quitamos
          currentRoles = currentRoles.filter(r => r !== roleId);
      } else {
          // Si no está, lo añadimos
          currentRoles.push(roleId);
      }
      
      setFormData({ ...formData, role: currentRoles.join(',') });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newLog = { title: formData.log_title, content: formData.log_content, date: new Date().toISOString() };
      const logsArray = formData.log_title ? [newLog] : [];

      const updates = {
        alias: formData.alias,
        role: formData.role, // Se guarda como string "MUSIC,SHOP"
        avatar_url: formData.avatar_url,
        banner_url: formData.banner_url,
        twit_message: formData.twit_message,
        card_color: formData.card_color,
        track_name: formData.track_name,
        audio_file: formData.audio_file,
        bcast_file: formData.bcast_file,
        logs: logsArray,
        holo_1: formData.holo_1, holo_2: formData.holo_2, holo_3: formData.holo_3, holo_4: formData.holo_4,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      await supabase.auth.updateUser({ data: { alias: formData.alias } });

      if (error) throw error;
      alert("✅ PERFIL MULTICLASE ACTUALIZADO");
      onClose();
      window.location.reload(); 
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  // Helper para saber si un rol está activo
  const hasRole = (rId) => formData.role && formData.role.includes(rId);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn font-mono">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
      <div className={`relative z-10 w-full max-w-2xl bg-[#0a0a0a] border-2 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col pointer-events-auto transition-colors duration-500 border-${formData.card_color}-500`}>
        
        {/* HEADER */}
        <div className={`bg-${formData.card_color}-900/20 border-b border-${formData.card_color}-500/30 p-4 flex justify-between items-center`}>
            <h2 className={`text-${formData.card_color}-500 font-black uppercase tracking-widest text-lg flex items-center gap-2`}><span>🔧</span> BOOSTER STUDIO</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white px-2">✕ ESC</button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-white/10 bg-black">
            <button onClick={() => setTab('identity')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${tab === 'identity' ? `bg-${formData.card_color}-500/10 text-${formData.card_color}-400 border-b-2 border-${formData.card_color}-500` : 'text-gray-600 hover:text-white'}`}>👤 Identidad</button>
            <button onClick={() => setTab('audio')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${tab === 'audio' ? `bg-${formData.card_color}-500/10 text-${formData.card_color}-400 border-b-2 border-${formData.card_color}-500` : 'text-gray-600 hover:text-white'}`}>🎵 Audio Station</button>
            <button onClick={() => setTab('logs')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${tab === 'logs' ? `bg-${formData.card_color}-500/10 text-${formData.card_color}-400 border-b-2 border-${formData.card_color}-500` : 'text-gray-600 hover:text-white'}`}>📝 Editorial</button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar max-h-[60vh] bg-gradient-to-b from-[#111] to-black">
            {/* TAB 1: IDENTIDAD */}
            {tab === 'identity' && (
                <div className="space-y-6 animate-fadeIn">
                    
                    {/* NICK Y ROLES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`text-${formData.card_color}-400 text-xs font-bold block mb-2 uppercase tracking-wider`}>NOMBRE EN CLAVE (NICK)</label>
                            <input type="text" placeholder="Ej: Rob_Lietzer" value={formData.alias} onChange={e => setFormData({...formData, alias: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-lg font-bold rounded focus:border-white outline-none" />
                        </div>
                        
                        <div>
                            <label className={`text-${formData.card_color}-400 text-xs font-bold block mb-2 uppercase tracking-wider`}>ROLES (Elige varios)</label>
                            <div className="flex gap-2">
                                {ROLES.map(r => (
                                    <button 
                                        key={r.id} 
                                        onClick={() => toggleRole(r.id)}
                                        className={`flex-1 py-2 text-[9px] font-bold border rounded transition-all ${hasRole(r.id) ? `bg-white text-black border-white shadow-[0_0_10px_white]` : 'bg-black text-gray-500 border-white/20 hover:border-white'}`}
                                        title={r.desc}
                                    >
                                        {hasRole(r.id) ? '✓ ' + r.label : r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ... Resto de inputs (Color, Twit, Img, Prisma) igual que antes ... */}
                    {/* [PEGAR AQUÍ EL RESTO DEL CÓDIGO DEL COMPONENTE ANTERIOR DESDE 'Color de Interface' HACIA ABAJO] */}
                    {/* (Para no hacer el mensaje eterno, el resto es idéntico a la versión anterior) */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold block mb-2 uppercase tracking-wider">Color de Interface</label>
                        <div className="flex gap-3">{COLORS.map((c) => (<button key={c.id} onClick={() => setFormData({...formData, card_color: c.id})} className={`w-8 h-8 rounded-full ${c.hex} border-2 transition-all hover:scale-110 ${formData.card_color === c.id ? 'border-white scale-110 shadow-[0_0_15px_white]' : 'border-transparent opacity-50'}`}></button>))}</div>
                    </div>
                    <div><label className={`text-${formData.card_color}-400 text-xs font-bold block mb-2 uppercase tracking-wider`}>Mensaje "Twit"</label><input type="text" maxLength={60} placeholder="Ej: 'Encontré unas llaves'..." value={formData.twit_message} onChange={e => setFormData({...formData, twit_message: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-white outline-none pr-12" /></div>
                    <div className="h-px bg-white/10 my-4"></div>
                    <div className="bg-cyan-900/10 border border-cyan-500/30 p-4 rounded text-justify"><p className="text-cyan-400 font-bold text-xs mb-2">ℹ️ PROTOCOLO DE ALMACENAMIENTO</p><p className="text-[10px] text-gray-400">Aloja tus imágenes en <a href="https://postimages.org/" target="_blank" className="text-white underline">Postimages.org</a>.</p></div>
                    <div><label className="text-gray-400 text-xs font-bold block mb-2">Avatar URL (Cuadrado)</label><input type="text" placeholder="https://..." value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-white outline-none" /></div>
                    <div><label className="text-gray-400 text-xs font-bold block mb-2">Banner URL (Vertical 3:4)</label><input type="text" placeholder="https://..." value={formData.banner_url} onChange={e => setFormData({...formData, banner_url: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-white outline-none" /></div>
                    <div className="border border-white/10 rounded-lg overflow-hidden mt-4"><button onClick={() => setShowHoloConfig(!showHoloConfig)} className="w-full bg-white/5 p-3 flex justify-between items-center text-xs font-bold text-gray-300 hover:bg-white/10"><span>🧊 CONFIGURACIÓN HOLO-PRISMA (4 CARAS)</span><span>{showHoloConfig ? '▲' : '▼'}</span></button>{showHoloConfig && (<div className="p-4 bg-black/50 space-y-3 animate-slideDown"><input type="text" placeholder="Cara 1 (Frontal)" value={formData.holo_1} onChange={e => setFormData({...formData, holo_1: e.target.value})} className="w-full bg-black border border-white/10 p-2 text-white text-xs rounded outline-none focus:border-cyan-500" /><input type="text" placeholder="Cara 2 (Derecha)" value={formData.holo_2} onChange={e => setFormData({...formData, holo_2: e.target.value})} className="w-full bg-black border border-white/10 p-2 text-white text-xs rounded outline-none focus:border-fuchsia-500" /><input type="text" placeholder="Cara 3 (Trasera)" value={formData.holo_3} onChange={e => setFormData({...formData, holo_3: e.target.value})} className="w-full bg-black border border-white/10 p-2 text-white text-xs rounded outline-none focus:border-yellow-500" /><input type="text" placeholder="Cara 4 (Izquierda)" value={formData.holo_4} onChange={e => setFormData({...formData, holo_4: e.target.value})} className="w-full bg-black border border-white/10 p-2 text-white text-xs rounded outline-none focus:border-green-500" /></div>)}</div>
                </div>
            )}
            
            {tab === 'audio' && (<div className="space-y-6 animate-fadeIn"><div className="bg-red-900/10 border border-red-500/30 p-4 rounded text-justify"><p className="text-red-400 font-bold text-xs mb-2">⚠ DERECHOS DIGITALES</p><div className="text-[10px] text-gray-400 space-y-2"><p>BRO7VISION es PRO CREATIVE COMMONS...</p></div></div><div><label className="text-gray-400 text-xs font-bold block mb-2">Título Global</label><input type="text" value={formData.track_name} onChange={e => setFormData({...formData, track_name: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-white outline-none" /></div><div className="p-3 border border-red-900/30 bg-red-900/10 rounded"><label className="text-red-400 text-xs font-bold block mb-2">🔴 Canal 1: LIVE</label><input type="text" placeholder="Link Dropbox..." value={formData.audio_file} onChange={e => setFormData({...formData, audio_file: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-red-500 outline-none" /></div><div className="p-3 border border-fuchsia-900/30 bg-fuchsia-900/10 rounded"><label className="text-fuchsia-400 text-xs font-bold block mb-2">📼 Canal 2: B-CAST</label><input type="text" placeholder="Link Podcast..." value={formData.bcast_file} onChange={e => setFormData({...formData, bcast_file: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-fuchsia-500 outline-none" /></div></div>)}
            {tab === 'logs' && (<div className="space-y-6 animate-fadeIn"><div className="bg-green-900/10 border border-green-500/30 p-4 rounded"><p className="text-green-400 font-bold text-xs mb-2">💡 SOPORTE MULTIMEDIA</p></div><div><label className="text-gray-400 text-xs font-bold block mb-2">Título</label><input type="text" value={formData.log_title} onChange={e => setFormData({...formData, log_title: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-white outline-none" /></div><div><label className="text-gray-400 text-xs font-bold block mb-2">Contenido</label><textarea value={formData.log_content} onChange={e => setFormData({...formData, log_content: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-white outline-none h-32" /></div></div>)}

        </div>
        <div className="p-4 border-t border-white/10 bg-[#080808] flex justify-end">
            <button onClick={handleSave} disabled={loading} className={`bg-${formData.card_color}-600 text-white font-black uppercase text-xs px-8 py-3 rounded hover:opacity-80 hover:scale-105 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</button>
        </div>
      </div>
    </div>
  );
};
export default BoosterModal;