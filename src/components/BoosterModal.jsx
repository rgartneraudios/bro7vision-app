// src/components/BoosterModal.jsx (COMPLETO: Horizontal, Reglas IA, Catálogo y Pestañas Restauradas)

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ENERGY_COLORS = [
    { id: 'cyan', hex: 'bg-cyan-500', name: 'CYAN' },
    { id: 'fuchsia', hex: 'bg-fuchsia-500', name: 'MAGENTA' },
    { id: 'yellow', hex: 'bg-yellow-400', name: 'AMARILLO' },
    { id: 'green', hex: 'bg-green-500', name: 'VERDE' },
    { id: 'blue', hex: 'bg-blue-500', name: 'AZUL' },
    { id: 'red', hex: 'bg-red-500', name: 'ROJO' },
    { id: 'orange', hex: 'bg-orange-500', name: 'NARANJA' },
    { id: 'gold', hex: 'bg-[#C7AF38]', name: 'ORO' },
    { id: 'silver', hex: 'bg-[#D9D9D9]', name: 'PLATA' },
    { id: 'white', hex: 'bg-white', name: 'BLANCO' }
];

const MATTER_COLORS = [
    { id: 'void', hex: 'bg-[#000000]', name: 'NEGRO PURO' },
    { id: 'carbon', hex: 'bg-[#222222]', name: 'GRIS SOLIDO' },
    { id: 'navy', hex: 'bg-[#091221]', name: 'AZUL NAVY' },
    { id: 'cobalt', hex: 'bg-[#0A5AAB]', name: 'COBALTO' },
    { id: 'wine', hex: 'bg-[#2b0505]', name: 'VINO' },
    { id: 'crimson', hex: 'bg-[#4a0404]', name: 'CARMESÍ' },
    { id: 'forest', hex: 'bg-[#0A730A]', name: 'BOSQUE' },
    { id: 'emerald', hex: 'bg-[#013030]', name: 'ESMERALDA' },
    { id: 'plum', hex: 'bg-[#2e0542]', name: 'CIRUELA' },
    { id: 'chocolate', hex: 'bg-[#B04405]', name: 'CHOCOLATE' }
];

const BoosterModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('identity'); 
  const [showHoloConfig, setShowHoloConfig] = useState(false);
  
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const [energyColor, setEnergyColor] = useState('cyan');
  const [matterColor, setMatterColor] = useState('void');
  
  const [isMerchant, setIsMerchant] = useState(false);
  const [assets, setAssets] = useState([]); 
  const [newAsset, setNewAsset] = useState({ title: '', url: '', type: 'video', price: 0 });

  const [formData, setFormData] = useState({
    alias: '', avatar_url: '', banner_url: '', card_banner_url: '',
    twit_message: '', role: '', audio_file: '', bcast_file: '',
    video_file: '', video_file_2: '', video_file_3: '',
    holo_1: '', holo_2: '', holo_3: '', holo_4: '',
    product_title: '', product_desc: '', product_price: '', product_url: '',
    service_title: '', service_desc: '', service_price: '', service_url: '',
    // CAMPOS IA Y CATALOGO:
    catalog_url: '', mapache_rules: '',
    // CAMPOS SANTUARIO Y BLOG:
    intimo_bg: '', creator_loop_reply: '', editorial_title: '', editorial_content: '', showcase_url: ''
  });
  
  const ROLES = [
      { id: 'MUSIC', label: '🎵 MUSIC' },
      { id: 'TALK', label: '🎙️ TALK' },
      { id: 'SHOP', label: '📦 SHOP' },
      { id: 'SERVICE', label: '🤝 SERVICE' }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            
            if (profile) {
              setIsMerchant(profile.is_merchant || false);
              const colors = (profile.card_color || 'cyan-void').split('-');
              setEnergyColor(colors[0] || 'cyan');
              setMatterColor(colors[1] || 'void');
              
              setCountry(profile.country || '');
              setCity(profile.city || '');
              setZipCode(profile.zip_code || '');

              setFormData({
                alias: profile.alias || user.user_metadata.alias || '',
                role: profile.role || '', avatar_url: profile.avatar_url || '',
                banner_url: profile.banner_url || '', card_banner_url: profile.card_banner_url || '',
                twit_message: profile.twit_message || '', audio_file: profile.audio_file || '',
                bcast_file: profile.bcast_file || '', video_file: profile.video_file || '',
                video_file_2: profile.video_file_2 || '', video_file_3: profile.video_file_3 || '',
                holo_1: profile.holo_1 || '', holo_2: profile.holo_2 || '',
                holo_3: profile.holo_3 || '', holo_4: profile.holo_4 || '',
                product_title: profile.product_title || '', product_desc: profile.product_desc || '', 
                product_price: profile.product_price || '', product_url: profile.product_url || '',
                service_title: profile.service_title || '', service_desc: profile.service_desc || '', 
                service_price: profile.service_price || '', service_url: profile.service_url || '',
                catalog_url: profile.catalog_url || '', mapache_rules: profile.mapache_rules || '',
                intimo_bg: profile.intimo_bg || '', creator_loop_reply: profile.creator_loop_reply || '',
                editorial_title: profile.editorial_title || '', editorial_content: profile.editorial_content || '',
                showcase_url: profile.showcase_url || ''
              });
            }
            const { data: assetData } = await supabase.from('assets').select('*').eq('owner_id', user.id);
            if (assetData) setAssets(assetData);
          }
      } catch (e) {
          console.error("Error cargando perfil:", e);
      }
    };
    loadData();
  }, []);

  const toggleRole = (roleId) => {
      let currentRoles = formData.role ? String(formData.role).split(',') : [];
      if (currentRoles.includes(roleId)) currentRoles = currentRoles.filter(r => r !== roleId);
      else currentRoles.push(roleId);
      setFormData({ ...formData, role: currentRoles.join(',') });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const finalColor = `${energyColor}-${matterColor}`;
      const updates = {
        ...formData,
        card_color: finalColor, is_merchant: isMerchant,
        country: country, city: city, zip_code: zipCode,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw error;
      alert("✅ ¡SISTEMA ACTUALIZADO!");
      onClose();
      window.location.reload(); 
    } catch (error) {
      console.error('❌ Error:', error);
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };   

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("¿Confirmas la eliminación definitiva?")) return;
    const { error } = await supabase.from('assets').delete().eq('id', assetId);
    if (!error) setAssets(assets.filter(a => a.id !== assetId));
  };

  const handleAddAsset = async () => {
    if (!newAsset.title || !newAsset.url) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('assets').insert([
      { owner_id: user.id, title: newAsset.title, url: newAsset.url, asset_type: newAsset.type, price_fiat: newAsset.price }
    ]).select();
    if (data) { setAssets([...assets, data[0]]); setNewAsset({ title: '', url: '', type: 'video', price: 0 }); }
  };

  const [questions, setQuestions] = useState([]);
  useEffect(() => {
      const fetchQuestions = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && tab === 'santuario') {
              const { data } = await supabase.from('bro_echos').select('*').eq('target_profile_id', user.id).like('text', '%❓%').order('created_at', { ascending: false });
              if (data) setQuestions(data);
          }
      };
      fetchQuestions();
  }, [tab]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn font-mono">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-5xl bg-[#0a0a0a] border-2 border-white/10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col pointer-events-auto h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-gray-900/50 border-b border-white/10 p-4 flex justify-between items-center shrink-0">
            <h2 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2"><span>🔧</span> BOOSTER STUDIO DASHBOARD</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xs">✕ ESC</button>
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-black">
            
            {/* TABS SIDEBAR */}
            <div className="flex md:flex-col border-b md:border-b-0 md:border-r border-white/10 bg-black overflow-x-auto md:w-48 shrink-0">
                <button onClick={() => setTab('identity')} className={`flex-1 md:flex-none text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'identity' ? 'bg-white/10 text-white md:border-r-2 border-b-2 md:border-b-0 border-white' : 'text-gray-600'}`}>👤 Identidad</button>
                <button onClick={() => setTab('audio')} className={`flex-1 md:flex-none text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'audio' ? 'bg-white/10 text-white md:border-r-2 border-b-2 md:border-b-0 border-white' : 'text-gray-600'}`}>📡 Señal</button>
                <button onClick={() => setTab('santuario')} className={`flex-1 md:flex-none text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest ${tab === 'santuario' ? 'bg-white/10 text-fuchsia-400 md:border-r-2 border-b-2 md:border-b-0 border-fuchsia-500' : 'text-gray-600'}`}>⛩️ SANTUARIO</button>
                <button onClick={() => setTab('market')} className={`flex-1 md:flex-none text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'market' ? 'bg-yellow-500/10 text-yellow-400 md:border-r-2 border-b-2 md:border-b-0 border-yellow-500' : 'text-gray-600'}`}>🛒 Tienda / IA</button>
                <button onClick={() => setTab('assets')} className={`flex-1 md:flex-none text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'assets' ? 'bg-white/10 text-white md:border-r-2 border-b-2 md:border-b-0 border-white' : 'text-blue-500'}`}>📦 Activos</button>
            </div>

            {/* ÁREA DE CONTENIDO */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-black">
                
                {/* 👤 IDENTIDAD */}
                {tab === 'identity' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                        <div className="space-y-6">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-4">Configuración Visual</p>
                                <div className="space-y-4">
                                    <div><label className="text-[8px] text-gray-500 block mb-1 uppercase font-black">Avatar (Circular)</label><input type="text" value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[10px] rounded" /></div>
                                    <div><label className="text-[8px] text-gray-500 block mb-1 uppercase font-black">Banner (LiveGrid)</label><input type="text" value={formData.banner_url} onChange={e => setFormData({...formData, banner_url: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[10px] rounded" /></div>
                                    <div><label className="text-[8px] text-cyan-500 block mb-1 uppercase font-black">Banner (Nexus Tarjeta)</label><input type="text" value={formData.card_banner_url} onChange={e => setFormData({...formData, card_banner_url: e.target.value})} className="w-full bg-black border border-cyan-500/30 p-2 text-white text-[10px] rounded" /></div>
                                </div>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <label className="text-gray-400 text-[10px] font-bold block mb-2 uppercase">Nick de Ciudadano</label>
                                <input type="text" value={formData.alias} onChange={e => setFormData({...formData, alias: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-lg font-bold rounded mb-4" />
                                
                                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">📍 Coordenadas Base</h3>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-black border border-white/10 text-white px-2 py-2 rounded text-[10px] uppercase" placeholder="PAÍS" />
                                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-black border border-white/10 text-white px-2 py-2 rounded text-[10px] uppercase" placeholder="CIUDAD" />
                                </div>
                                <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full bg-black border border-white/10 text-white px-2 py-2 rounded text-[10px] uppercase" placeholder="CÓDIGO POSTAL" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-gray-400 text-[10px] font-bold block mb-2 uppercase">Roles de Señal</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ROLES.map(r => (
                                        <button key={r.id} onClick={() => toggleRole(r.id)} className={`py-2 px-1 text-[8px] font-bold border rounded transition-all ${String(formData.role || "").includes(r.id) ? 'bg-white text-black border-white shadow-[0_0_10px_white]' : 'bg-black text-gray-500 border-white/20'}`}>{r.label}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                <p className="text-[9px] font-bold text-gray-400 mb-2 uppercase tracking-widest">⚡ Estética de Energía & Materia</p>
                                <div className="flex flex-wrap gap-2 mb-4">{ENERGY_COLORS.map(c => <button key={c.id} onClick={() => setEnergyColor(c.id)} className={`w-6 h-6 rounded-full ${c.hex} ${energyColor === c.id ? 'ring-2 ring-white scale-110 shadow-[0_0_10px_white]' : 'opacity-40 hover:opacity-100'}`} />)}</div>
                                <div className="flex flex-wrap gap-2">{MATTER_COLORS.map(c => <button key={c.id} onClick={() => setMatterColor(c.id)} className={`w-6 h-6 rounded-full border border-white/20 ${c.hex} ${matterColor === c.id ? 'ring-2 ring-white scale-110 shadow-[0_0_10px_white]' : 'opacity-40 hover:opacity-100'}`} />)}</div>
                            </div>

                            <div className="border border-white/10 p-4 rounded-xl bg-black/40">
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">💎 Configuración HoloPrisma</p>
                                    <button onClick={() => setShowHoloConfig(!showHoloConfig)} className="text-[9px] text-cyan-400 underline uppercase">{showHoloConfig ? 'Ocultar' : 'Configurar 4 Caras'}</button>
                                </div>
                                {showHoloConfig && (
                                    <div className="grid grid-cols-2 gap-3 mt-4 animate-fadeIn">
                                        <input type="text" placeholder="URL Imagen 1" value={formData.holo_1} onChange={e=>setFormData({...formData, holo_1:e.target.value})} className="bg-black border border-white/10 p-2 text-[10px] text-white rounded" />
                                        <input type="text" placeholder="URL Imagen 2" value={formData.holo_2} onChange={e=>setFormData({...formData, holo_2:e.target.value})} className="bg-black border border-white/10 p-2 text-[10px] text-white rounded" />
                                        <input type="text" placeholder="URL Imagen 3" value={formData.holo_3} onChange={e=>setFormData({...formData, holo_3:e.target.value})} className="bg-black border border-white/10 p-2 text-[10px] text-white rounded" />
                                        <input type="text" placeholder="URL Imagen 4" value={formData.holo_4} onChange={e=>setFormData({...formData, holo_4:e.target.value})} className="bg-black border border-white/10 p-2 text-[10px] text-white rounded" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 📡 SEÑAL */}
                {tab === 'audio' && (
                    <div className="space-y-6 max-w-3xl animate-fadeIn">
                        <div className="bg-red-900/10 border border-red-500/20 p-3 rounded-lg flex gap-3">
                            <div className="text-xl">⚖️</div>
                            <p className="text-[9px] text-red-300 font-mono leading-relaxed uppercase">Usa música propia o Licencia <span className="font-bold text-white underline">Creative Commons 4.0</span>. Evita material con Copyright comercial para asegurar la permanencia de tu canal.</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] text-cyan-400 font-bold block mb-1">📡 SEÑAL AUDIO LIVE (URL MP3/Dropbox)</label>
                                <input type="text" value={formData.audio_file} onChange={e=>setFormData({...formData, audio_file:e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[10px] font-mono rounded" />
                            </div>
                            
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                <label className="text-[9px] text-cyan-400 font-bold block mb-1 uppercase">Video Principal (Forest)</label>
                                <input type="text" value={formData.video_file} onChange={e=>setFormData({...formData, video_file:e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[10px] mb-4 rounded" />
                                
                                <label className="text-[9px] text-yellow-500 font-bold block mb-1 uppercase">Video Alternativo 2</label>
                                <input type="text" value={formData.video_file_2} onChange={e=>setFormData({...formData, video_file_2:e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[10px] mb-4 rounded" />
                                
                                <label className="text-[9px] text-fuchsia-500 font-bold block mb-1 uppercase">Video Alternativo 3</label>
                                <input type="text" value={formData.video_file_3} onChange={e=>setFormData({...formData, video_file_3:e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[10px] rounded" />
                            </div>                        
                        </div>
                    </div>
                )}
                
                {/* ⛩️ SANTUARIO */}
                {tab === 'santuario' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                        <div className="bg-fuchsia-900/10 border border-fuchsia-500/20 p-4 rounded-xl">
                            <p className="text-[10px] text-fuchsia-400 font-black uppercase mb-4 tracking-widest">Atmósfera de la Suite</p>
                            
                            <select 
                                value={formData.intimo_bg || ""} 
                                onChange={e => setFormData({...formData, intimo_bg: e.target.value})} 
                                className="w-full bg-black border border-white/20 p-3 text-white text-xs rounded mb-4"
                            >
                                <option value="" disabled>--- SELECCIONAR ATMÓSFERA ---</option>
                                <option value="salon">🍵 SALÓN PREMIUM (Classic)</option>
                                <option value="cocina">🍳 COCINA GOURMET (Classic)</option>
                                <option value="dormitorio">🌌 CYBER SUITE (Furry Style)</option>
                                <option value="ducha">✨ LLUVIA BIO-FOREST (Therian Suite)</option> 
                            </select>

                            <label className="text-[9px] text-orange-400 block mb-1 uppercase font-black">Respuesta en Bucle (Visor)</label>
                            <input type="text" value={formData.creator_loop_reply} onChange={e => setFormData({...formData, creator_loop_reply: e.target.value})} placeholder="Ej: Hola Maggie, ya subí la foto!" className="w-full bg-black border border-white/20 p-3 text-white text-xs rounded mb-6" />

                            <div className="border-t border-white/10 pt-4">
                                <p className="text-[10px] text-cyan-400 font-black uppercase mb-3">Redacción Editorial (BroLogViewer)</p>
                                <input type="text" value={formData.editorial_title} onChange={e => setFormData({...formData, editorial_title: e.target.value})} placeholder="TÍTULO DEL ARTÍCULO..." className="w-full bg-black border border-white/20 p-3 text-white text-xs font-bold rounded mb-2" />
                                <textarea value={formData.editorial_content} onChange={e => setFormData({...formData, editorial_content: e.target.value})} placeholder="Escribe el cuerpo del artículo..." className="w-full bg-black border border-white/20 p-3 text-white text-[11px] rounded h-32 mb-4" />
                                
                                <label className="text-[9px] text-gray-500 block mb-1 uppercase">Link Imagen Mostrador</label>
                                <input type="text" value={formData.showcase_url} onChange={e => setFormData({...formData, showcase_url: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-xs rounded" />
                            </div>
                        </div>

                        {/* EL BUZÓN DE PREGUNTAS */}
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 h-full flex flex-col">
                            <p className="text-[10px] text-gray-500 font-black uppercase mb-3">📥 Preguntas de la Audiencia</p>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                                {questions.length > 0 ? questions.map(q => (
                                    <div key={q.id} className="bg-white/5 p-3 rounded border border-white/5">
                                        <p className="text-[8px] text-fuchsia-400 font-bold uppercase mb-1">@{q.author_alias}</p>
                                        <p className="text-[11px] text-gray-300 font-sans">{q.text.replace('❓ PREGUNTA: ', '')}</p>
                                    </div>
                                )) : (
                                    <div className="flex items-center justify-center h-full text-[10px] italic text-gray-600">No hay preguntas nuevas...</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 🛒 TIENDA / IA */}
                {tab === 'market' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                        
                        <div className="space-y-6">
                            <div className="p-4 border border-yellow-500/20 rounded-xl bg-yellow-500/5">
                                <p className="text-[12px] text-yellow-500 font-bold uppercase mb-4 tracking-widest">📦 Producto Destacado</p>
                                <input type="text" placeholder="Título del Producto" value={formData.product_title} onChange={e=>setFormData({...formData, product_title: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-[11px] mb-3 rounded" /> 
                                <input type="text" placeholder="Descripción breve" value={formData.product_desc} onChange={e=>setFormData({...formData, product_desc: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-[11px] mb-3 rounded" />
                                <input type="number" placeholder="Precio (€)" value={formData.product_price} onChange={e=>setFormData({...formData, product_price: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-[11px] mb-3 rounded" />
                                <input type="text" placeholder="URL de Venta (Stripe/Web)" value={formData.product_url} onChange={e=>setFormData({...formData, product_url: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-[11px] rounded" /> 
                            </div>

                            <div className="p-4 border border-cyan-500/20 rounded-xl bg-cyan-500/5">
                                <p className="text-[12px] text-cyan-500 font-bold uppercase mb-4 tracking-widest">🤝 Servicio Destacado</p>
                                <input type="text" placeholder="Título del Servicio" value={formData.service_title} onChange={e=>setFormData({...formData, service_title: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-[11px] mb-3 rounded" /> 
                                <input type="text" placeholder="Descripción breve" value={formData.service_desc} onChange={e=>setFormData({...formData, service_desc: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-[11px] mb-3 rounded" />
                                <input type="number" placeholder="Precio (€)" value={formData.service_price} onChange={e=>setFormData({...formData, service_price: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-[11px] mb-3 rounded" />
                                <input type="text" placeholder="URL de Info/Reserva" value={formData.service_url} onChange={e=>setFormData({...formData, service_url: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-[11px] rounded" /> 
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 border border-fuchsia-500/30 rounded-xl bg-fuchsia-500/5 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 text-6xl opacity-10">🦝</div>
                                <h3 className="text-[12px] text-fuchsia-400 font-black uppercase mb-1 tracking-widest">🤖 Instrucciones para Mapache IA</h3>
                                <p className="text-[10px] text-gray-400 mb-4 font-sans leading-relaxed">Mapache es el agente de ventas de tu terminal. Escribe aquí las reglas de negocio, ofertas cruzadas y descuentos para que él atienda a tus clientes.</p>
                                <textarea 
                                    value={formData.mapache_rules} 
                                    onChange={e=>setFormData({...formData, mapache_rules: e.target.value})} 
                                    placeholder="Ej: Si el cliente compra Zapatillas (ZAP-01), ofrécele calcetines a mitad de precio. Si pregunta por envíos, dile que a partir de 50€ son gratis. Mantén un tono amable y callejero." 
                                    className="w-full bg-black/50 border border-fuchsia-500/30 focus:border-fuchsia-400 p-4 text-white text-[12px] rounded h-40 outline-none transition-all resize-none" 
                                />
                            </div>

                            <div className="p-5 border border-blue-500/30 rounded-xl bg-blue-500/5">
                                <h3 className="text-[12px] text-blue-400 font-black uppercase mb-1 tracking-widest">📸 Catálogo Visual (Google Slides)</h3>
                                <p className="text-[10px] text-gray-400 mb-4 font-sans leading-relaxed">Pega aquí el enlace de tu presentación de Google Slides pública. Los clientes podrán ver las fotos de tus productos y los códigos de referencia antes de pedirselos a Mapache.</p>
                                <input 
                                    type="text" 
                                    value={formData.catalog_url} 
                                    onChange={e=>setFormData({...formData, catalog_url: e.target.value})} 
                                    placeholder="https://docs.google.com/presentation/d/..." 
                                    className="w-full bg-black/50 border border-blue-500/30 focus:border-blue-400 p-4 text-white text-[12px] rounded outline-none transition-all" 
                                />
                                {formData.catalog_url && (
                                    <a href={formData.catalog_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-[10px] text-blue-400 hover:text-white transition-colors uppercase font-bold tracking-wider">
                                        👁️ PROBAR ENLACE ↗
                                    </a>
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {/* 📦 ACTIVOS */}
                {tab === 'assets' && (
                    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
                        <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-500/30">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-[12px] font-black text-blue-400 uppercase tracking-widest">Gestión de Activos P2P (WebBot)</p>
                                <button onClick={() => setIsMerchant(!isMerchant)} className={`px-4 py-2 text-[10px] font-black rounded border transition-all ${isMerchant ? 'bg-green-600 border-green-400 text-white' : 'bg-transparent border-blue-500 text-blue-400'}`}>
                                    {isMerchant ? '✓ MERCHANT VERIFICADO' : 'MODO CITIZEN (COINS)'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input type="text" placeholder="TÍTULO ACTIVO" value={newAsset.title} onChange={e => setNewAsset({...newAsset, title: e.target.value})} className="md:col-span-2 bg-black border border-white/10 p-3 text-[11px] text-white rounded" />
                                <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} className="bg-black border border-white/10 p-3 text-[11px] text-white rounded">
                                    <option value="video">🎥 VIDEO</option><option value="audio">🎵 AUDIO</option><option value="game">🎮 VIDEOJUEGO</option><option value="masterclass">🎓 FORMACIÓN</option>
                                </select>
                                <input type="number" placeholder="PRECIO BASE €" value={newAsset.price} onChange={e => setNewAsset({...newAsset, price: e.target.value})} className="bg-black border border-white/10 p-3 text-[11px] text-white rounded" />
                                <input type="text" placeholder="URL DIRECTA (NUBE)" value={newAsset.url} onChange={e => setNewAsset({...newAsset, url: e.target.value})} className="md:col-span-3 bg-black border border-white/10 p-3 text-[11px] text-white rounded" />
                                <button onClick={handleAddAsset} className="bg-blue-600 text-white font-black text-[11px] uppercase hover:bg-blue-400 rounded">SINCRONIZAR</button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {assets.map(a => (
                                <div key={a.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 text-[11px]">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white font-bold text-sm">{a.title} ({a.asset_type.toUpperCase()})</span>
                                        <span className="text-blue-400 font-mono text-xs">{a.price_fiat}€</span>
                                    </div>
                                    <button onClick={() => handleDeleteAsset(a.id)} className="bg-red-900/40 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg border border-red-500/30 transition-all font-black uppercase text-[10px]">
                                        BORRAR ✕
                                    </button>
                                </div>
                            ))}
                            {assets.length === 0 && <p className="text-center text-gray-600 text-[10px] italic mt-10">No hay activos sincronizados.</p>}
                        </div>
                    </div>
                )}

            </div>
        </div>
        
        {/* FOOTER */}
        <div className="p-4 border-t border-white/10 bg-[#080808] flex justify-end gap-3 shrink-0">
            <button onClick={onClose} className="text-gray-500 text-[11px] px-6 py-3 font-bold uppercase hover:bg-white/5 rounded transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={loading} className="bg-white text-black font-black uppercase text-[11px] px-10 py-3 rounded hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {loading ? 'Procesando...' : 'GUARDAR SISTEMA'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default BoosterModal;