// src/components/BoosterModal.jsx (VERSIÓN FINAL CON IMÁGENES DE PRODUCTO)
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
    role: '', 
    // DATOS DE ESCAPARATE (+ IMÁGENES)
    product_title: '', product_desc: '', product_price: '', product_url: '', product_img: '',
    service_title: '', service_desc: '', service_price: '', service_url: '', service_img: ''
  });

  const COLORS = [{id:'cyan',hex:'bg-cyan-500'},{id:'fuchsia',hex:'bg-fuchsia-500'},{id:'yellow',hex:'bg-yellow-400'},{id:'green',hex:'bg-green-500'},{id:'red',hex:'bg-red-500'}];
  
  const ROLES = [
      { id: 'MUSIC', label: '🎵 MUSIC', desc: 'DJ, Productor, Banda' },
      { id: 'TALK', label: '🎙️ TALK', desc: 'Podcast, Debate, News' },
      { id: 'SHOP', label: '📦 SHOP', desc: 'Venta de Productos' },
      { id: 'SERVICE', label: '🤝 SERVICE', desc: 'Ofrece Servicios' }
  ];

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setFormData({
            alias: data.alias || user.user_metadata.alias || '',
            role: data.role || '',
            avatar_url: data.avatar_url || '',
            banner_url: data.banner_url || '',
            twit_message: data.twit_message || '',
            card_color: data.card_color || 'cyan',
            track_name: data.track_name || '',
            audio_file: data.audio_file || '',
            bcast_file: data.bcast_file || '',
            log_title: data.logs?.[0]?.title || '',
            log_content: data.logs?.[0]?.content || '',
            holo_1: data.holo_1 || '', holo_2: data.holo_2 || '', holo_3: data.holo_3 || '', holo_4: data.holo_4 || '',
            // CARGA DE ESCAPARATE
            product_title: data.product_title || '', product_desc: data.product_desc || '', product_price: data.product_price || '', product_url: data.product_url || '', product_img: data.product_img || '',
            service_title: data.service_title || '', service_desc: data.service_desc || '', service_price: data.service_price || '', service_url: data.service_url || '', service_img: data.service_img || ''
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

      const updates = {
        alias: formData.alias,
        role: formData.role,
        avatar_url: formData.avatar_url,
        banner_url: formData.banner_url,
        twit_message: formData.twit_message,
        card_color: formData.card_color,
        track_name: formData.track_name,
        audio_file: formData.audio_file,
        bcast_file: formData.bcast_file,
        logs: logsArray,
        holo_1: formData.holo_1, holo_2: formData.holo_2, holo_3: formData.holo_3, holo_4: formData.holo_4,
        // GUARDAR ESCAPARATE
        product_title: formData.product_title, product_desc: formData.product_desc, product_price: formData.product_price, product_url: formData.product_url, product_img: formData.product_img,
        service_title: formData.service_title, service_desc: formData.service_desc, service_price: formData.service_price, service_url: formData.service_url, service_img: formData.service_img,
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
      <div className={`relative z-10 w-full max-w-2xl bg-[#0a0a0a] border-2 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col pointer-events-auto transition-colors duration-500 border-${formData.card_color}-500`}>
        
        {/* HEADER */}
        <div className={`bg-${formData.card_color}-900/20 border-b border-${formData.card_color}-500/30 p-4 flex justify-between items-center`}>
            <h2 className={`text-${formData.card_color}-500 font-black uppercase tracking-widest text-lg flex items-center gap-2`}><span>🔧</span> BOOSTER STUDIO</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white px-2">✕ ESC</button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-white/10 bg-black overflow-x-auto">
            <button onClick={() => setTab('identity')} className={`flex-1 py-4 px-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'identity' ? `bg-${formData.card_color}-500/10 text-${formData.card_color}-400 border-b-2 border-${formData.card_color}-500` : 'text-gray-600 hover:text-white'}`}>👤 Identidad</button>
            <button onClick={() => setTab('audio')} className={`flex-1 py-4 px-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'audio' ? `bg-${formData.card_color}-500/10 text-${formData.card_color}-400 border-b-2 border-${formData.card_color}-500` : 'text-gray-600 hover:text-white'}`}>🎵 Audio</button>
            <button onClick={() => setTab('market')} className={`flex-1 py-4 px-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'market' ? `bg-${formData.card_color}-500/10 text-${formData.card_color}-400 border-b-2 border-${formData.card_color}-500` : 'text-gray-600 hover:text-white'}`}>📢 Escaparate</button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar max-h-[60vh] bg-gradient-to-b from-[#111] to-black">
            
            {/* TAB 1: IDENTIDAD */}
            {tab === 'identity' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`text-${formData.card_color}-400 text-xs font-bold block mb-2 uppercase tracking-wider`}>NOMBRE EN CLAVE (NICK)</label>
                            <input type="text" value={formData.alias} onChange={e => setFormData({...formData, alias: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-lg font-bold rounded focus:border-white outline-none" />
                        </div>
                        <div>
                            <label className={`text-${formData.card_color}-400 text-xs font-bold block mb-2 uppercase tracking-wider`}>ROLES (Elige varios)</label>
                            <div className="grid grid-cols-2 gap-2">
                                {ROLES.map(r => (
                                    <button 
                                        key={r.id} 
                                        onClick={() => toggleRole(r.id)}
                                        className={`py-2 px-1 text-[9px] font-bold border rounded transition-all truncate ${hasRole(r.id) ? `bg-white text-black border-white shadow-[0_0_10px_white]` : 'bg-black text-gray-500 border-white/20 hover:border-white'}`}
                                    >
                                        {hasRole(r.id) ? '✓ ' + r.label : r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div><label className={`text-${formData.card_color}-400 text-xs font-bold block mb-2 uppercase tracking-wider`}>Mensaje "Twit"</label><input type="text" maxLength={60} value={formData.twit_message} onChange={e => setFormData({...formData, twit_message: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-white outline-none" /></div>
                    
                    <div><label className="text-gray-400 text-xs font-bold block mb-2">Avatar URL (Cuadrado)</label><input type="text" value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-white outline-none" /></div>
                    <div><label className="text-gray-400 text-xs font-bold block mb-2">Banner URL (Vertical 3:4)</label><input type="text" value={formData.banner_url} onChange={e => setFormData({...formData, banner_url: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-white outline-none" /></div>
                    
                    <div className="border border-white/10 rounded-lg overflow-hidden mt-4"><button onClick={() => setShowHoloConfig(!showHoloConfig)} className="w-full bg-white/5 p-3 flex justify-between items-center text-xs font-bold text-gray-300 hover:bg-white/10"><span>🧊 CONFIGURACIÓN HOLO-PRISMA (4 CARAS)</span><span>{showHoloConfig ? '▲' : '▼'}</span></button>{showHoloConfig && (<div className="p-4 bg-black/50 space-y-3 animate-slideDown"><input type="text" placeholder="Cara 1 (Frontal)" value={formData.holo_1} onChange={e => setFormData({...formData, holo_1: e.target.value})} className="w-full bg-black border border-white/10 p-2 text-white text-xs rounded outline-none focus:border-cyan-500" /><input type="text" placeholder="Cara 2 (Derecha)" value={formData.holo_2} onChange={e => setFormData({...formData, holo_2: e.target.value})} className="w-full bg-black border border-white/10 p-2 text-white text-xs rounded outline-none focus:border-fuchsia-500" /><input type="text" placeholder="Cara 3 (Trasera)" value={formData.holo_3} onChange={e => setFormData({...formData, holo_3: e.target.value})} className="w-full bg-black border border-white/10 p-2 text-white text-xs rounded outline-none focus:border-yellow-500" /><input type="text" placeholder="Cara 4 (Izquierda)" value={formData.holo_4} onChange={e => setFormData({...formData, holo_4: e.target.value})} className="w-full bg-black border border-white/10 p-2 text-white text-xs rounded outline-none focus:border-green-500" /></div>)}</div>
                </div>
            )}
            
            {/* TAB 2: AUDIO */}
            {tab === 'audio' && (
                 <div className="space-y-6 animate-fadeIn">
                     <p className="text-gray-400 text-xs">Configura aquí tus canales. Solo si tienes rol MUSIC o TALK.</p>
                     <div><label className="text-gray-400 text-xs font-bold block mb-2">Título Global</label><input type="text" value={formData.track_name} onChange={e => setFormData({...formData, track_name: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-white outline-none" /></div>
                     <div className="p-3 border border-red-900/30 bg-red-900/10 rounded"><label className="text-red-400 text-xs font-bold block mb-2">🔴 Canal 1: LIVE (MP3 URL)</label><input type="text" value={formData.audio_file} onChange={e => setFormData({...formData, audio_file: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-red-500 outline-none" /></div>
                     <div className="p-3 border border-fuchsia-900/30 bg-fuchsia-900/10 rounded"><label className="text-fuchsia-400 text-xs font-bold block mb-2">📼 Canal 2: B-CAST (MP3 URL)</label><input type="text" value={formData.bcast_file} onChange={e => setFormData({...formData, bcast_file: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-sm rounded focus:border-fuchsia-500 outline-none" /></div>
                 </div>
            )}

            {/* TAB 3: ESCAPARATE */}
            {tab === 'market' && (
                <div className="space-y-8 animate-fadeIn">
                    
                    <div className="bg-blue-900/10 border border-blue-500/30 p-4 rounded text-justify">
                        <p className="text-blue-400 font-bold text-xs mb-2">📢 TU ESCAPARATE (FASE 0)</p>
                        <p className="text-[10px] text-gray-400">
                            Aquí puedes anunciar lo que haces. El botón "CONECTAR" en la web llevará a los visitantes a tu enlace externo (Instagram, Web, Etsy...).
                        </p>
                    </div>

                    {/* SECCIÓN PRODUCTOS */}
                    <div className={`p-4 rounded border border-white/10 ${hasRole('SHOP') ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                        <h3 className="text-white font-bold mb-2 flex justify-between">
                            <span>ANUNCIO DE PRODUCTO</span>
                            {!hasRole('SHOP') && <span className="text-[9px] text-red-500 bg-red-900/20 px-2 rounded">REQUIERE ROL 'SHOP'</span>}
                        </h3>
                        
                        <p className="text-[9px] text-gray-400 mb-3">
                            ℹ RECOMENDADO: Usa imágenes ligeras ar 9 x 16 px.. Puedes subirlas gratis en <a href="https://postimages.org/" target="_blank" className="text-cyan-400 underline">Postimages</a>.
                        </p>

                        <div className="space-y-3">
                            <input type="text" placeholder="¿Qué vendes? (Ej: Zapatillas)" value={formData.product_title} onChange={e => setFormData({...formData, product_title: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm rounded" />
                            {/* INPUT IMAGEN PRODUCTO AQUI */}
                            <input type="text" placeholder="🖼 URL Imagen del Producto (Postimages)" value={formData.product_img} onChange={e => setFormData({...formData, product_img: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm rounded focus:border-yellow-500" />
                            
                            <textarea placeholder="Descripción corta para la tarjeta..." value={formData.product_desc} onChange={e => setFormData({...formData, product_desc: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm rounded h-20" />
                            <input type="text" placeholder="Precio Orientativo (Texto)" value={formData.product_price} onChange={e => setFormData({...formData, product_price: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm rounded" />
                            
                            <input type="text" placeholder="🔗 Link a tu Tienda/Instagram" value={formData.product_url} onChange={e => setFormData({...formData, product_url: e.target.value})} className="w-full bg-blue-900/20 border border-blue-500/50 p-2 text-white text-sm rounded focus:border-blue-400" />
                        </div>
                    </div>

                    {/* SECCIÓN SERVICIOS */}
                    <div className={`p-4 rounded border border-white/10 ${hasRole('SERVICE') ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                        <h3 className="text-white font-bold mb-2 flex justify-between">
                            <span>ANUNCIO DE SERVICIO</span>
                            {!hasRole('SERVICE') && <span className="text-[9px] text-red-500 bg-red-900/20 px-2 rounded">REQUIERE ROL 'SERVICE'</span>}
                        </h3>

                        <p className="text-[9px] text-gray-400 mb-3">
                            ℹ RECOMENDADO: Usa imágenes ligeras , ar 9 x 16 px.
                        </p>

                        <div className="space-y-3">
                            <input type="text" placeholder="¿Qué ofreces? (Ej: Diseño Web)" value={formData.service_title} onChange={e => setFormData({...formData, service_title: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm rounded" />
                             {/* INPUT IMAGEN SERVICIO AQUI */}
                             <input type="text" placeholder="🖼 URL Imagen del Servicio (Postimages)" value={formData.service_img} onChange={e => setFormData({...formData, service_img: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm rounded focus:border-green-500" />

                            <textarea placeholder="Descripción corta..." value={formData.service_desc} onChange={e => setFormData({...formData, service_desc: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm rounded h-20" />
                            <input type="text" placeholder="Precio / Honorarios (Texto)" value={formData.service_price} onChange={e => setFormData({...formData, service_price: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-sm rounded" />
                            
                            <input type="text" placeholder="🔗 Link a tu Booking/Contacto" value={formData.service_url} onChange={e => setFormData({...formData, service_url: e.target.value})} className="w-full bg-blue-900/20 border border-blue-500/50 p-2 text-white text-sm rounded focus:border-blue-400" />
                        </div>
                    </div>

                </div>
            )}

        </div>
        
        {/* FOOTER */}
        <div className="p-4 border-t border-white/10 bg-[#080808] flex justify-end">
            <button onClick={handleSave} disabled={loading} className={`bg-${formData.card_color}-600 text-white font-black uppercase text-xs px-8 py-3 rounded hover:opacity-80 hover:scale-105 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</button>
        </div>
      </div>
    </div>
  );
};
export default BoosterModal;