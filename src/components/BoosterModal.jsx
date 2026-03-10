// src/components/BoosterModal.jsx
// (ESTILO ACTUALIZADO: BIOLUMINISCENTE NEÓN + UI AMIGABLE)

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Colores de Energía (Brillantes para botones)
const ENERGY_COLORS = [
    { id: 'cyan', hex: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]', name: 'CYAN' }, 
    { id: 'fuchsia', hex: 'bg-fuchsia-400 shadow-[0_0_10px_#e879f9]', name: 'MAGENTA' },
    { id: 'yellow', hex: 'bg-yellow-300 shadow-[0_0_10px_#fde047]', name: 'AMARILLO' }, 
    { id: 'green', hex: 'bg-emerald-400 shadow-[0_0_10px_#34d399]', name: 'VERDE' },
    { id: 'blue', hex: 'bg-blue-500 shadow-[0_0_10px_#3b82f6]', name: 'AZUL' }, 
    { id: 'red', hex: 'bg-red-500 shadow-[0_0_10px_#ef4444]', name: 'ROJO' },
    { id: 'white', hex: 'bg-white shadow-[0_0_15px_white]', name: 'BLANCO' }
];

// Colores de Materia (Profundos)
const MATTER_COLORS = [
    { id: 'void', hex: 'bg-[#050b14]', name: 'ABISMO' }, 
    { id: 'carbon', hex: 'bg-[#1e293b]', name: 'CARBONO' },
    { id: 'navy', hex: 'bg-[#0f172a]', name: 'DEEP NAVY' }, 
    { id: 'plum', hex: 'bg-[#2e1065]', name: 'NEBULA' }, 
    { id: 'wine', hex: 'bg-[#450a0a]', name: 'SANGRE' }, 
    { id: 'forest', hex: 'bg-[#022c22]', name: 'BOSQUE PROFUNDO' }
];

const BoosterModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('identity'); 
  
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const [energyColor, setEnergyColor] = useState('cyan');
  const [matterColor, setMatterColor] = useState('void');
  
  const [isMerchant, setIsMerchant] = useState(false);
  const [assets, setAssets] = useState([]); 
  
  // Estados para los formularios
  const [newAsset, setNewAsset] = useState({ title: '', url: '', type: 'video', price: 0 });
  const [newProduct, setNewProduct] = useState({ title: '', desc: '', price: 0, url: '', sizes: '', colors: '' });
  const [newService, setNewService] = useState({ title: '', desc: '', price: 0, url: '' });

  const [formData, setFormData] = useState({
    alias: '', avatar_url: '', banner_url: '', card_banner_url: '',
    twit_message: '', role: '', audio_file: '', bcast_file: '',
    video_file: '', video_file_2: '', video_file_3: '',
    holo_1: '', holo_2: '', holo_3: '', holo_4: '',
    catalog_url: '', mapache_rules: '',
    intimo_bg: '', creator_loop_reply: '', editorial_title: '', editorial_content: '', showcase_url: ''
  });
  
  const ROLES = [{ id: 'MUSIC', label: '🎵 Music' }, { id: 'TALK', label: '🎙️ Talk' }, { id: 'SHOP', label: '📦 Shop' }, { id: 'SERVICE', label: '🤝 Service' }];

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
                catalog_url: profile.catalog_url || '', mapache_rules: profile.mapache_rules || '',
                intimo_bg: profile.intimo_bg || '', creator_loop_reply: profile.creator_loop_reply || '',
                editorial_title: profile.editorial_title || '', editorial_content: profile.editorial_content || '',
                showcase_url: profile.showcase_url || ''
              });
            }
            const { data: assetData } = await supabase.from('assets').select('*').eq('owner_id', user.id);
            if (assetData) setAssets(assetData);
          }
      } catch (e) { console.error("Error cargando perfil:", e); }
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
        ...formData, card_color: finalColor, is_merchant: isMerchant,
        country: country, city: city, zip_code: zipCode, updated_at: new Date(),
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

  // CRUD Functions
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("¿Desintegrar este ítem del sistema?")) return;
    const { error } = await supabase.from('assets').delete().eq('id', itemId);
    if (error) alert("Error: " + error.message);
    else setAssets(assets.filter(a => a.id !== itemId));
  };

  const handleAddDigitalAsset = async () => {
    if (!newAsset.title || !newAsset.url) { alert("Faltan datos"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('assets').insert([
      { owner_id: user.id, title: newAsset.title, url: newAsset.url, asset_type: newAsset.type, price_fiat: newAsset.price }
    ]).select();
    if (error) { alert("❌ Error: " + error.message); return; }
    if (data) { setAssets([...assets, data[0]]); setNewAsset({ title: '', url: '', type: 'video', price: 0 }); }
  };

  const handleAddProduct = async () => {
    if (!newProduct.title) { alert("¡Falta el título!"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('assets').insert([{ 
        owner_id: user.id, title: newProduct.title, description: newProduct.desc,
        price_fiat: newProduct.price, url: newProduct.url, asset_type: 'product',
        sizes: newProduct.sizes, colors: newProduct.colors
    }]).select();
    if (error) { alert("❌ Error: " + error.message); return; }
    if (data) { setAssets([...assets, data[0]]); setNewProduct({ title: '', desc: '', price: 0, url: '', sizes: '', colors: '' }); }
  };

  const handleAddService = async () => {
    if (!newService.title) { alert("¡Falta el título!"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('assets').insert([{ 
        owner_id: user.id, title: newService.title, description: newService.desc,
        price_fiat: newService.price, url: newService.url, asset_type: 'service'
    }]).select();
    if (error) { alert("❌ Error: " + error.message); return; }
    if (data) { setAssets([...assets, data[0]]); setNewService({ title: '', desc: '', price: 0, url: '' }); }
  };

  const physicalProducts = assets.filter(a => a.asset_type === 'product');
  const serviceItems = assets.filter(a => a.asset_type === 'service');
  const digitalAssets = assets.filter(a => !['product', 'service'].includes(a.asset_type));

  const [questions, setQuestions] = useState([]);
  useEffect(() => {
      const fetchQuestions = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && tab === 'Telefono Casa') {
              const { data } = await supabase.from('bro_echos').select('*').eq('target_profile_id', user.id).like('text', '%❓%').order('created_at', { ascending: false });
              if (data) setQuestions(data);
          }
      };
      fetchQuestions();
  }, [tab]);

  // ESTILOS COMUNES (COMPONENTES REUTILIZABLES)
  const InputStyle = "w-full bg-[#0f172a] border border-cyan-500/20 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all";
  const LabelStyle = "text-xs font-bold text-cyan-300/80 mb-1 ml-1 block tracking-wide";
  const CardStyle = "bg-[#0f172a]/60 backdrop-blur-sm border border-cyan-500/10 p-6 rounded-3xl shadow-lg";

  return (
    // CONTENEDOR PRINCIPAL CON FONDO DEEP NEBULA
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn font-sans">
      <div className="absolute inset-0 bg-[#040714]/90 backdrop-blur-xl transition-all" onClick={onClose}></div>
      
      {/* VENTANA MODAL BIOLUMINISCENTE */}
      <div className="relative z-10 w-full max-w-5xl bg-[#050b14] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col h-[90vh]">
        
        {/* HEADER GLOW */}
        <div className="bg-[#020617] border-b border-cyan-500/20 p-5 flex justify-between items-center shrink-0">
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 font-bold text-lg flex items-center gap-3 tracking-wider">
               <span className="text-2xl drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">✨</span> BOOSTER STUDIO
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white hover:rotate-90 transition-transform duration-300 text-xl">✕</button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-gradient-to-b from-[#050b14] to-[#020617]">
            
            {/* SIDEBAR NAVEGACIÓN (Cápsulas) */}
            <div className="flex md:flex-col border-b md:border-b-0 md:border-r border-cyan-500/10 bg-[#020617]/50 p-3 gap-2 overflow-x-auto md:w-56 shrink-0">
                {[
                    { id: 'identity', label: '👤 Identidad', color: 'cyan' },
                    { id: 'audio', label: '📡 Señal', color: 'fuchsia' },
                    { id: 'Telefono Casa', label: '☝️ Telefono Casa', color: 'yellow' },
                    { id: 'market', label: '🛒🦝 Tienda & IA', color: 'green' },
                    { id: 'assets', label: '💾🦝 Archivos Digitales', color: 'blue' }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setTab(item.id)} 
                        className={`text-left py-3 px-5 text-xs font-bold rounded-2xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                        ${tab === item.id 
                            ? `bg-gradient-to-r from-${item.color}-500/20 to-transparent text-${item.color}-300 border border-${item.color}-500/30 shadow-[0_0_15px_rgba(0,0,0,0.3)] translate-x-1` 
                            : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* ÁREA DE CONTENIDO */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                
                {/* 👤 IDENTIDAD */}
                {tab === 'identity' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                        <div className="space-y-6">
                            <div className={CardStyle}>
                                <h3 className="text-sm text-cyan-400 font-bold mb-4 flex items-center gap-2">📸 VISUALES</h3>
                                <div className="space-y-4">
                                    <div><label className={LabelStyle}>Avatar (Circular)</label><input type="text" value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} className={InputStyle} /></div>
                                    <div><label className={LabelStyle}>Banner (LiveGrid)</label><input type="text" value={formData.banner_url} onChange={e => setFormData({...formData, banner_url: e.target.value})} className={InputStyle} /></div>
                                    <div><label className={LabelStyle}>Banner (Nexus Tarjeta)</label><input type="text" value={formData.card_banner_url} onChange={e => setFormData({...formData, card_banner_url: e.target.value})} className={InputStyle} /></div>
                                </div>
                            </div>

                            <div className={CardStyle}>
                                <label className={LabelStyle}>NICK DE CIUDADANO</label>
                                <input type="text" value={formData.alias} onChange={e => setFormData({...formData, alias: e.target.value})} className={`${InputStyle} text-lg font-bold text-center tracking-widest border-cyan-500/40`} />
                                
                                <div className="mt-6 p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <h3 className={LabelStyle}>📍 COORDENADAS BASE</h3>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={InputStyle} placeholder="País" />
                                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={InputStyle} placeholder="Ciudad" />
                                    </div>
                                    <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className={InputStyle} placeholder="Código Postal" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className={CardStyle}>
                                <label className={LabelStyle}>ROLES DE SEÑAL</label>
                                <div className="flex gap-3 flex-wrap">
                                    {ROLES.map(r => (
                                        <button key={r.id} onClick={() => toggleRole(r.id)} 
                                            className={`py-2 px-4 text-xs font-bold rounded-full transition-all border 
                                            ${String(formData.role || "").includes(r.id) 
                                                ? 'bg-white text-black border-white shadow-[0_0_10px_white]' 
                                                : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'}`}>
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={CardStyle}>
                                <p className={LabelStyle}>⚡ ENERGÍA (Borde)</p>
                                <div className="flex flex-wrap gap-3 mb-6">{ENERGY_COLORS.map(c => <button key={c.id} onClick={() => setEnergyColor(c.id)} className={`w-8 h-8 rounded-full transition-transform ${c.hex} ${energyColor === c.id ? 'scale-125 ring-2 ring-white' : 'opacity-40 hover:opacity-100 hover:scale-110'}`} />)}</div>
                                
                                <p className={LabelStyle}>🌑 MATERIA (Fondo)</p>
                                <div className="flex flex-wrap gap-3">{MATTER_COLORS.map(c => <button key={c.id} onClick={() => setMatterColor(c.id)} className={`w-8 h-8 rounded-full border border-white/10 ${c.hex} ${matterColor === c.id ? 'scale-125 ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'opacity-60 hover:opacity-100 hover:scale-110'}`} />)}</div>
                            </div>

                            <div className={`${CardStyle} border-fuchsia-500/20`}>
                                <p className="text-xs font-bold text-fuchsia-400 mb-3 flex items-center gap-2">💎 HOLOPRISMA (3D)</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder="Cara Frontal URL" value={formData.holo_1} onChange={e=>setFormData({...formData, holo_1:e.target.value})} className={InputStyle} />
                                    <input type="text" placeholder="Cara Trasera URL" value={formData.holo_2} onChange={e=>setFormData({...formData, holo_2:e.target.value})} className={InputStyle} />
                                    <input type="text" placeholder="Cara Izquierda URL" value={formData.holo_3} onChange={e=>setFormData({...formData, holo_3:e.target.value})} className={InputStyle} />
                                    <input type="text" placeholder="Cara Derecha URL" value={formData.holo_4} onChange={e=>setFormData({...formData, holo_4:e.target.value})} className={InputStyle} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 📡 SEÑAL */}
                {tab === 'audio' && (
                    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex gap-4 items-start shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                            <div className="text-2xl">⚖️</div>
                            <p className="text-xs text-red-200 leading-relaxed">Usa música propia o Licencia <span className="font-bold text-white underline">Creative Commons 4.0</span>. Evita material con Copyright comercial para asegurar la permanencia de tu canal.</p>
                        </div>
                        <div className={CardStyle}>
                            <div className="mb-6">
                                <label className={LabelStyle}>📡 SEÑAL AUDIO LIVE (URL MP3/Dropbox)</label>
                                <input type="text" value={formData.audio_file} onChange={e=>setFormData({...formData, audio_file:e.target.value})} className={InputStyle} />
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div>
                                    <label className={LabelStyle}>🎬 VIDEO PRINCIPAL (Forest y Teléfono Casa)</label>
                                    <input type="text" value={formData.video_file} onChange={e=>setFormData({...formData, video_file:e.target.value})} className={InputStyle} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-yellow-400 mb-1 ml-1 block">⚡ Video Teléfono Casa 2</label>
                                    <input type="text" value={formData.video_file_2} onChange={e=>setFormData({...formData, video_file_2:e.target.value})} className={`${InputStyle} border-yellow-500/20 focus:border-yellow-400`} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-fuchsia-400 mb-1 ml-1 block">🔮 Video Teléfono Casa 3</label>
                                    <input type="text" value={formData.video_file_3} onChange={e=>setFormData({...formData, video_file_3:e.target.value})} className={`${InputStyle} border-fuchsia-500/20 focus:border-fuchsia-400`} />
                                </div>
                             <div>
                              <label className="text-xs font-bold text-orange-400 mb-1 ml-1 block">🎬 PISO 219 (Video a 21:9)</label>
       			 <input type="text" value={formData.video_file_219} onChange={e=>setFormData({...formData, video_file_219:e.target.value})} className={`${InputStyle} border-orange-500/20 focus:border-orange-400`} />
    				</div>
                               </div>                        
                        </div>
                    </div>
                )}
                
                {/* ☝️ TELEFONO CASA */}
                {tab === 'Telefono Casa' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                        <div className={`${CardStyle} border-fuchsia-500/20 bg-fuchsia-900/5`}>
                            <p className="text-sm text-fuchsia-300 font-bold mb-4 tracking-wider">🏠 ATMÓSFERA DE LA SUITE</p>
                            
                            <select value={formData.intimo_bg || ""} onChange={e => setFormData({...formData, intimo_bg: e.target.value})} className={`${InputStyle} appearance-none cursor-pointer mb-6`}>
                                <option value="" disabled>--- SELECCIONAR ATMÓSFERA ---</option>
                                <option value="salon">🍵 SALÓN PREMIUM (Classic)</option>
                                <option value="cocina">🍳 COCINA GOURMET (Classic)</option>
                                <option value="dormitorio">🌌 CYBER SUITE (Furry Style)</option>
                                <option value="ducha">✨ LLUVIA BIO-FOREST (Therian Suite)</option> 
                            </select>

                            <label className="text-xs font-bold text-orange-300 ml-1 mb-1 block">RESPUESTA VISOR (Loop)</label>
                            <input type="text" value={formData.creator_loop_reply} onChange={e => setFormData({...formData, creator_loop_reply: e.target.value})} placeholder="Ej: Hola Maggie, ya subí la foto!" className={`${InputStyle} border-orange-500/30 focus:border-orange-400 mb-8`} />

                            <div className="border-t border-fuchsia-500/10 pt-6">
                                <p className="text-xs font-bold text-cyan-300 mb-3">📝 BRO-LOG VIEWER (Editorial)</p>
                                <input type="text" value={formData.editorial_title} onChange={e => setFormData({...formData, editorial_title: e.target.value})} placeholder="TÍTULO DEL ARTÍCULO..." className={`${InputStyle} font-bold mb-3`} />
                                <textarea value={formData.editorial_content} onChange={e => setFormData({...formData, editorial_content: e.target.value})} placeholder="Escribe el cuerpo del artículo..." className={`${InputStyle} h-32 rounded-2xl resize-none mb-4`} />
                                
                                <label className={LabelStyle}>Link Imagen Mostrador</label>
                                <input type="text" value={formData.showcase_url} onChange={e => setFormData({...formData, showcase_url: e.target.value})} className={InputStyle} />
                            </div>
                        </div>

                        {/* BUZÓN */}
                        <div className="bg-[#020617]/50 p-6 rounded-3xl border border-white/5 h-full flex flex-col shadow-inner">
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

                {/* 🛒 TIENDA */}
                {tab === 'market' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                        
                        <div className="space-y-6">
                            {/* Producto Físico */}
                            <div className="p-6 border border-yellow-500/20 rounded-3xl bg-gradient-to-br from-yellow-900/10 to-transparent shadow-[0_0_20px_rgba(234,179,8,0.05)]">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs text-yellow-400 font-bold uppercase tracking-widest flex items-center gap-2">📦 Añadir Producto <span className="text-[9px] bg-yellow-400/20 px-2 py-0.5 rounded text-yellow-200">BROSHOP</span></p>
                                </div>
                                <div className="space-y-3 mb-3">
                                    <input type="text" placeholder="TÍTULO (Ej: Zapatillas Neón)" value={newProduct.title} onChange={e=>setNewProduct({...newProduct, title: e.target.value})} className={InputStyle} /> 
                                    <div className="flex gap-3">
                                        <input type="number" placeholder="PRECIO €" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} className={InputStyle} />
                                        <input type="text" placeholder="LINK EXTERNO" value={newProduct.url} onChange={e=>setNewProduct({...newProduct, url: e.target.value})} className={InputStyle} /> 
                                    </div>
                                    <textarea placeholder="Descripción detallada para la terminal..." value={newProduct.desc} onChange={e=>setNewProduct({...newProduct, desc: e.target.value})} className={`${InputStyle} h-20 resize-none`} />
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="Tallas (40, 41...)" value={newProduct.sizes} onChange={e=>setNewProduct({...newProduct, sizes: e.target.value})} className={`${InputStyle} border-yellow-500/30 placeholder:text-yellow-500/20`} />
                                        <input type="text" placeholder="Colores (Rojo...)" value={newProduct.colors} onChange={e=>setNewProduct({...newProduct, colors: e.target.value})} className={`${InputStyle} border-yellow-500/30 placeholder:text-yellow-500/20`} />
                                    </div>
                                </div>
                                <button onClick={handleAddProduct} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs uppercase py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_25px_rgba(234,179,8,0.6)]">+ GUARDAR EN INVENTARIO</button>
                            </div>

                            {/* Servicio */}
                            <div className="p-6 border border-cyan-500/20 rounded-3xl bg-gradient-to-br from-cyan-900/10 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.05)]">
                                <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-4">🤝 Añadir Servicio</p>
                                <div className="space-y-3 mb-3">
                                    <input type="text" placeholder="TÍTULO (Ej: Consulta 1H)" value={newService.title} onChange={e=>setNewService({...newService, title: e.target.value})} className={InputStyle} /> 
                                    <div className="flex gap-3">
                                        <input type="number" placeholder="PRECIO €" value={newService.price} onChange={e=>setNewService({...newService, price: e.target.value})} className={InputStyle} />
                                        <input type="text" placeholder="LINK CALENDARIO" value={newService.url} onChange={e=>setNewService({...newService, url: e.target.value})} className={InputStyle} /> 
                                    </div>
                                    <textarea placeholder="Descripción del servicio..." value={newService.desc} onChange={e=>setNewService({...newService, desc: e.target.value})} className={`${InputStyle} h-20 resize-none`} />
                                </div>
                                <button onClick={handleAddService} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]">+ AÑADIR SERVICIO</button>
                            </div>
                        </div>

                        <div className="space-y-6 flex flex-col">
                            
                            <div className="p-6 border border-fuchsia-500/30 rounded-3xl bg-fuchsia-500/5 relative overflow-hidden group">
                                <div className="absolute -right-5 -top-5 text-8xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12">🦝</div>
                                <h3 className="text-xs text-fuchsia-300 font-bold uppercase mb-2 tracking-widest">🧠 Instrucciones Mapache IA</h3>
                                <textarea 
                                    value={formData.mapache_rules} 
                                    onChange={e=>setFormData({...formData, mapache_rules: e.target.value})} 
                                    placeholder="Instruye a la IA sobre tu negocio..." 
                                    className={`${InputStyle} border-fuchsia-500/30 focus:border-fuchsia-400 h-24 bg-black/40`} 
                                />
                            </div>

                            <div className="p-6 border border-blue-500/30 rounded-3xl bg-blue-500/5">
                                <h3 className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-2">📸 Holo-Catálogo</h3>
                                <input type="text" value={formData.catalog_url} onChange={e=>setFormData({...formData, catalog_url: e.target.value})} placeholder="https://docs.google.com/presentation/..." className={`${InputStyle} border-blue-500/30 focus:border-blue-400 bg-black/40`} />
                            </div>

                            <div className="flex-1 bg-[#020617]/80 border border-white/5 rounded-3xl p-5 overflow-hidden flex flex-col">
                                <h3 className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4 flex justify-between">
                                    <span>Inventario Activo</span>
                                    <span>{physicalProducts.length + serviceItems.length} items</span>
                                </h3>
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                                    {physicalProducts.map(p => (
                                        <div key={p.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-yellow-500/10 group transition-all">
                                            <div>
                                                <p className="text-sm font-bold text-yellow-100 group-hover:text-yellow-400 transition-colors">{p.title}</p>
                                                <p className="text-[10px] text-gray-500">{p.price_fiat}€ | {p.sizes ? `Tallas: ${p.sizes}` : 'Standard'}</p>
                                            </div>
                                            <button onClick={() => handleDeleteItem(p.id)} className="text-[10px] text-red-500/50 group-hover:text-red-400 font-bold uppercase border border-transparent group-hover:border-red-500/30 px-2 py-1 rounded">✕</button>
                                        </div>
                                    ))}
                                    {serviceItems.map(s => (
                                        <div key={s.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-cyan-500/10 group transition-all">
                                            <div>
                                                <p className="text-sm font-bold text-cyan-100 group-hover:text-cyan-400 transition-colors">{s.title}</p>
                                                <p className="text-[10px] text-gray-500">{s.price_fiat}€ | Reserva</p>
                                            </div>
                                            <button onClick={() => handleDeleteItem(s.id)} className="text-[10px] text-red-500/50 group-hover:text-red-400 font-bold uppercase border border-transparent group-hover:border-red-500/30 px-2 py-1 rounded">✕</button>
                                        </div>
                                    ))}
                                    {(physicalProducts.length === 0 && serviceItems.length === 0) && (
                                        <p className="text-center text-gray-700 text-xs italic mt-10">Inventario vacío</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 📦 ARCHIVOS DIGITALES */}
                {tab === 'assets' && (
                    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
                        <div className="bg-[#0f172a]/80 p-6 rounded-3xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Gestión de Archivos Digitales </p>
                                <button onClick={() => setIsMerchant(!isMerchant)} className={`px-4 py-2 text-[10px] font-bold rounded-full border transition-all ${isMerchant ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-transparent border-gray-600 text-gray-400'}`}>
                                    {isMerchant ? '✓ MERCHANT VERIFICADO' : 'MODO CREADOR BÁSICO'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input type="text" placeholder="TÍTULO ACTIVO" value={newAsset.title} onChange={e => setNewAsset({...newAsset, title: e.target.value})} className={`${InputStyle} md:col-span-2`} />
                                <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} className={InputStyle}>
                                    <option value="video">🎥 VIDEO</option><option value="audio">🎵 AUDIO</option><option value="game">🎮 VIDEOJUEGO</option><option value="masterclass">🎓 FORMACIÓN</option>
                                </select>
                                <input type="number" placeholder="PRECIO €" value={newAsset.price} onChange={e => setNewAsset({...newAsset, price: e.target.value})} className={InputStyle} />
                                <input type="text" placeholder="URL DIRECTA (Nube)" value={newAsset.url} onChange={e => setNewAsset({...newAsset, url: e.target.value})} className={`${InputStyle} md:col-span-3`} />
                                <button onClick={handleAddDigitalAsset} className="bg-blue-600 text-white font-bold text-xs uppercase hover:bg-blue-500 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">SUBIR</button>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="text-xs text-gray-500 font-bold uppercase tracking-widest ml-4 mb-2">En la Nube ({digitalAssets.length})</h3>
                            {digitalAssets.map(a => (
                                <div key={a.id} className="flex justify-between items-center bg-[#020617] p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white font-bold text-sm group-hover:text-blue-300 transition-colors">{a.title}</span>
                                        <div className="flex gap-2 text-xs">
                                            <span className="bg-blue-900/30 text-blue-400 px-2 rounded-full">{a.asset_type.toUpperCase()}</span>
                                            <span className="text-gray-500">{a.price_fiat}€</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteItem(a.id)} className="text-gray-600 hover:text-red-400 px-4 py-2 font-bold transition-all text-xl">
                                        🗑
                                    </button>
                                </div>
                            ))}
                            {digitalAssets.length === 0 && <p className="text-center text-gray-700 text-xs italic py-10">Sin archivos digitales.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
        
        {/* FOOTER */}
        <div className="p-5 border-t border-cyan-500/10 bg-[#020617] flex justify-end gap-4 shrink-0">
            <button onClick={onClose} className="text-gray-500 text-xs px-6 py-3 font-bold uppercase hover:text-white transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={loading} className="bg-white text-black font-bold uppercase text-xs px-8 py-3 rounded-full hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]">
                {loading ? 'Procesando...' : 'GUARDAR SISTEMA'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default BoosterModal;