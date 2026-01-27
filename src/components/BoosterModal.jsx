// src/components/BoosterModal.jsx (VERSION FINAL CORREGIDA: FORM DATA + GPS + HOLO)

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
  
  // --- ESTADOS DE GPS (Separados para fácil manejo) ---
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // --- ESTADOS VISUALES ---
  const [energyColor, setEnergyColor] = useState('cyan');
  const [matterColor, setMatterColor] = useState('void');
  
  // --- ESTADOS DE ACTIVOS ---
  const [isMerchant, setIsMerchant] = useState(false);
  const [assets, setAssets] = useState([]); 
  const [newAsset, setNewAsset] = useState({ title: '', url: '', type: 'video', price: 0 });

  // --- FORM DATA (Aquí vive todo lo demás: Holo, Productos, Perfil) ---
  const [formData, setFormData] = useState({
    alias: '', avatar_url: '', banner_url: '', card_banner_url: '',
    twit_message: '', role: '', audio_file: '', bcast_file: '', video_file: '',
    holo_1: '', holo_2: '', holo_3: '', holo_4: '',
    product_title: '', product_desc: '', product_price: '', product_url: '',
    service_title: '', service_desc: '', service_price: '', service_url: ''
  });

  const ROLES = [
      { id: 'MUSIC', label: '🎵 MUSIC' },
      { id: 'TALK', label: '🎙️ TALK' },
      { id: 'SHOP', label: '📦 SHOP' },
      { id: 'SERVICE', label: '🤝 SERVICE' }
  ];

  // 1. CARGAR DATOS
  useEffect(() => {
    const loadData = async () => {
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            
            if (profile) {
              setIsMerchant(profile.is_merchant || false);
              
              // Cargar Colores
              const colors = (profile.card_color || 'cyan-void').split('-');
              setEnergyColor(colors[0] || 'cyan');
              setMatterColor(colors[1] || 'void');
              
              // Cargar GPS
              setCountry(profile.country || '');
              setCity(profile.city || '');
              setZipCode(profile.zip_code || '');

              // Cargar Formulario Completo
              setFormData({
                alias: profile.alias || user.user_metadata.alias || '',
                role: profile.role || '', 
                avatar_url: profile.avatar_url || '',
                banner_url: profile.banner_url || '',
                card_banner_url: profile.card_banner_url || '',
                twit_message: profile.twit_message || '',
                audio_file: profile.audio_file || '',
                bcast_file: profile.bcast_file || '',
                video_file: profile.video_file || '',
                // Aquí están tus imágenes del prisma
                holo_1: profile.holo_1 || '', holo_2: profile.holo_2 || '',
                holo_3: profile.holo_3 || '', holo_4: profile.holo_4 || '',
                // Productos y Servicios
                product_title: profile.product_title || '', product_desc: profile.product_desc || '', product_price: profile.product_price || '', product_url: profile.product_url || '',
                service_title: profile.service_title || '', service_desc: profile.service_desc || '', service_price: profile.service_price || '', service_url: profile.service_url || ''
              });
            }
            // Cargar Activos P2P
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

  // 2. GUARDAR DATOS (CORREGIDO)
  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      // Construimos el string de color
      const finalColor = `${energyColor}-${matterColor}`;

      // Preparamos el objeto mezclando formData + estados sueltos
      const updates = {
        ...formData, // Esto mete alias, roles, holos, productos, etc.
        
        // Sobrescribimos/Añadimos los campos especiales
        card_color: finalColor,
        is_merchant: isMerchant,
        
        // GPS
        country: country,
        city: city,
        zip_code: zipCode, // Asegúrate de que la columna en Supabase es zip_code

        updated_at: new Date(),
      };

      console.log("📤 Guardando:", updates);

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

      if (error) throw error;

      alert("✅ ¡PERFIL Y HOLOGRAMAS ACTUALIZADOS!");
      onClose();
      window.location.reload(); 

    } catch (error) {
      console.error('❌ Error:', error);
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };   

  const handleAddAsset = async () => {
    if (!newAsset.title || !newAsset.url) return;
    const { data: { user } } = await supabase.auth.getUser();
    
    // Aquí usamos country/city del estado para geolocalizar el activo si quieres, 
    // o simplemente guardamos el activo.
    const { data } = await supabase.from('assets').insert([
      { 
          owner_id: user.id, 
          title: newAsset.title, 
          url: newAsset.url, 
          asset_type: newAsset.type, 
          price_fiat: newAsset.price
          // Si tu tabla assets tiene country/city, puedes añadirlos aquí también:
          // country: country, city: city 
      }
    ]).select();

    if (data) {
      setAssets([...assets, data[0]]);
      setNewAsset({ title: '', url: '', type: 'video', price: 0 });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn font-mono">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-2xl bg-[#0a0a0a] border-2 border-white/10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col pointer-events-auto h-[90vh] md:h-auto">
        
        {/* HEADER */}
        <div className="bg-gray-900/50 border-b border-white/10 p-4 flex justify-between items-center shrink-0">
            <h2 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2"><span>🔧</span> BOOSTER STUDIO</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xs">✕ ESC</button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-white/10 bg-black overflow-x-auto shrink-0">
            <button onClick={() => setTab('identity')} className={`flex-1 py-4 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'identity' ? 'bg-white/10 text-white border-b-2 border-white' : 'text-gray-600'}`}>👤 Identidad</button>
            <button onClick={() => setTab('audio')} className={`flex-1 py-4 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'audio' ? 'bg-white/10 text-white border-b-2 border-white' : 'text-gray-600'}`}>📡 Señal</button>
            <button onClick={() => setTab('market')} className={`flex-1 py-4 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'market' ? 'bg-white/10 text-white border-b-2 border-white' : 'text-gray-600'}`}>🛒 Tienda</button>
            <button onClick={() => setTab('assets')} className={`flex-1 py-4 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${tab === 'assets' ? 'bg-white/10 text-white border-b-2 border-white' : 'text-blue-500'}`}>📦 Activos</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-black">
            
            {/* TAB IDENTIDAD */}
            {tab === 'identity' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Configuración Visual</p>
                            <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-[9px] text-cyan-400 hover:underline">☁️ Subir en Postimages ↗</a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-[8px] text-gray-500 block mb-1 uppercase font-black">Avatar (Circular)</label>
                                <input type="text" placeholder="https://..." value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[10px] rounded" />
                            </div>
                            <div>
                                <label className="text-[8px] text-gray-500 block mb-1 uppercase font-black">Banner (LiveGrid)</label>
                                <input type="text" placeholder="https://..." value={formData.banner_url} onChange={e => setFormData({...formData, banner_url: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[10px] rounded" />
                            </div>
                            <div>
                                <label className="text-[8px] text-cyan-500 block mb-1 uppercase font-black">Banner (Nexus Tarjeta)</label>
                                <input type="text" placeholder="https://..." value={formData.card_banner_url} onChange={e => setFormData({...formData, card_banner_url: e.target.value})} className="w-full bg-black border border-cyan-500/30 p-2 text-white text-[10px] rounded" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-[10px] font-bold block mb-2 uppercase">Nick de Ciudadano</label>
                            <input type="text" value={formData.alias} onChange={e => setFormData({...formData, alias: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-lg font-bold rounded" />
                        </div>
                        
                        {/* --- SECCIÓN UBICACIÓN (GPS LÓGICO) --- */}
                        <div className="space-y-4 pt-0">
                            <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">📍 Coordenadas Base</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[8px] text-gray-500 uppercase mb-1">País</label>
                                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-black border border-white/10 text-white px-2 py-2 rounded text-[10px] focus:border-fuchsia-500 outline-none uppercase" placeholder="ESPAÑA" />
                                </div>
                                <div>
                                    <label className="block text-[8px] text-gray-500 uppercase mb-1">Ciudad</label>
                                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-black border border-white/10 text-white px-2 py-2 rounded text-[10px] focus:border-fuchsia-500 outline-none uppercase" placeholder="MADRID" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[8px] text-gray-500 uppercase mb-1">Código Postal</label>
                                <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full bg-black border border-white/10 text-white px-2 py-2 rounded text-[10px] focus:border-fuchsia-500 outline-none uppercase" placeholder="28001" />
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 text-[10px] font-bold block mb-2 uppercase">Roles de Señal</label>
                            <div className="grid grid-cols-2 gap-2">
                                {ROLES.map(r => (
                                    <button 
                                        key={r.id} 
                                        onClick={() => toggleRole(r.id)} 
                                        className={`py-2 px-1 text-[8px] font-bold border rounded transition-all ${String(formData.role || "").includes(r.id) ? 'bg-white text-black border-white shadow-[0_0_10px_white]' : 'bg-black text-gray-500 border-white/20'}`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <p className="text-[9px] font-bold text-gray-400 mb-2 uppercase tracking-widest">⚡ Estética de Energía & Materia</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {ENERGY_COLORS.map(c => <button key={c.id} onClick={() => setEnergyColor(c.id)} className={`w-6 h-6 rounded-full ${c.hex} ${energyColor === c.id ? 'ring-2 ring-white scale-110 shadow-[0_0_10px_white]' : 'opacity-40 hover:opacity-100'}`} />)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {MATTER_COLORS.map(c => <button key={c.id} onClick={() => setMatterColor(c.id)} className={`w-6 h-6 rounded-full border border-white/20 ${c.hex} ${matterColor === c.id ? 'ring-2 ring-white scale-110 shadow-[0_0_10px_white]' : 'opacity-40 hover:opacity-100'}`} />)}
                        </div>
                    </div>

                    <div className="border border-white/10 p-4 rounded-xl bg-black/40">
                        <div className="flex justify-between items-center">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">💎 Configuración HoloPrisma 3D</p>
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
                    
                    <div>
                        <label className="text-gray-400 text-[10px] font-bold block mb-2 uppercase">Mensaje de Señal (Twit Message)</label>
                        <input type="text" maxLength={60} value={formData.twit_message} onChange={e => setFormData({...formData, twit_message: e.target.value})} className="w-full bg-black border border-white/20 p-3 text-white text-[12px] italic rounded" />
                    </div>
                </div>
            )}

            {/* TAB SEÑAL */}
            {tab === 'audio' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-red-900/10 border border-red-500/20 p-3 rounded-lg flex gap-3">
                        <div className="text-xl">⚖️</div>
                        <p className="text-[9px] text-red-300 font-mono leading-relaxed uppercase">Usa música propia o Licencia <span className="font-bold text-white underline">Creative Commons 4.0</span>. Evita material con Copyright comercial para asegurar la permanencia de tu canal.</p>
                    </div>
                    <div className="space-y-4">
                        <div><label className="text-[9px] text-cyan-400 font-bold block mb-1">📡 SEÑAL AUDIO LIVE (URL MP3/Dropbox)</label><input type="text" value={formData.audio_file} onChange={e=>setFormData({...formData, audio_file:e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[10px] font-mono" /></div>
                        
                        <div><label className="text-[9px] text-fuchsia-400 font-bold block mb-1">🎥 SEÑAL HOLO-TV (URL Video MP4)</label><input type="text" value={formData.video_file} onChange={e=>setFormData({...formData, video_file:e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[10px] font-mono" /></div>
                    </div>
                </div>
            )}

            {/* TAB ACTIVOS (WEB BOT) */}
            {tab === 'assets' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/30">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Gestión de Activos P2P (WebBot)</p>
                            <button onClick={() => setIsMerchant(!isMerchant)} className={`px-4 py-1 text-[9px] font-black rounded border transition-all ${isMerchant ? 'bg-green-600 border-green-400 text-white' : 'bg-transparent border-blue-500 text-blue-400'}`}>
                                {isMerchant ? '✓ MERCHANT VERIFICADO' : 'MODO CITIZEN (COINS)'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="TÍTULO ACTIVO" value={newAsset.title} onChange={e => setNewAsset({...newAsset, title: e.target.value})} className="bg-black border border-white/10 p-2 text-[10px] text-white" />
                            <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} className="bg-black border border-white/10 p-2 text-[10px] text-white">
                                <option value="video">🎥 VIDEO</option><option value="audio">🎵 AUDIO</option><option value="game">🎮 VIDEOJUEGO</option><option value="masterclass">🎓 FORMACIÓN</option>
                            </select>
                            <input type="text" placeholder="URL DIRECTA (NUBE)" value={newAsset.url} onChange={e => setNewAsset({...newAsset, url: e.target.value})} className="col-span-2 bg-black border border-white/10 p-2 text-[10px] text-white" />
                            <input type="number" placeholder="PRECIO BASE €" value={newAsset.price} onChange={e => setNewAsset({...newAsset, price: e.target.value})} className="bg-black border border-white/10 p-2 text-[10px] text-white" />
                            <button onClick={handleAddAsset} className="bg-blue-600 text-white font-black text-[10px] uppercase hover:bg-blue-400">SINCRONIZAR</button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {assets.map(a => (
                            <div key={a.id} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5 text-[9px]">
                                <span className="text-white font-bold">{a.title} ({a.asset_type.toUpperCase()})</span>
                                <span className="text-blue-400 font-mono">{a.price_fiat}€</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB MARKET */}
            {tab === 'market' && (
                <div className="space-y-4 animate-fadeIn">
                     <div className="p-3 border border-yellow-500/20 rounded bg-yellow-500/5">
                        <p className="text-[10px] text-yellow-500 font-bold uppercase mb-3">📦 Inventario de Productos</p>
                        <input type="text" placeholder="Título del Producto" value={formData.product_title} onChange={e=>setFormData({...formData, product_title: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[11px] mb-2" /> 
                        <input type="text" placeholder="Descripción breve" value={formData.product_desc} onChange={e=>setFormData({...formData, product_desc: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[11px] mb-2" />
                        <input type="number" placeholder="Precio (€)" value={formData.product_price} onChange={e=>setFormData({...formData, product_price: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[11px] mb-2" />
                        <input type="text" placeholder="URL de Venta (Stripe/Web)" value={formData.product_url} onChange={e=>setFormData({...formData, product_url: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[11px]" /> 
                     </div>

                     <div className="p-3 border border-cyan-500/20 rounded bg-cyan-500/5">
                        <p className="text-[10px] text-cyan-500 font-bold uppercase mb-3">🤝 Catálogo de Servicios</p>
                        <input type="text" placeholder="Título del Servicio" value={formData.service_title} onChange={e=>setFormData({...formData, service_title: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[11px] mb-2" /> 
                        <input type="text" placeholder="Descripción breve" value={formData.service_desc} onChange={e=>setFormData({...formData, service_desc: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[11px] mb-2" />
                        <input type="number" placeholder="Precio (€)" value={formData.service_price} onChange={e=>setFormData({...formData, service_price: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[11px] mb-2" />
                        <input type="text" placeholder="URL de Info/Reserva" value={formData.service_url} onChange={e=>setFormData({...formData, service_url: e.target.value})} className="w-full bg-black border border-white/20 p-2 text-white text-[11px]" /> 
                     </div>
                </div>
            )}

        </div>
        <div className="p-4 border-t border-white/10 bg-[#080808] flex justify-end gap-2 shrink-0">
            <button onClick={onClose} className="text-gray-500 text-[10px] px-4 font-bold uppercase">Cancelar</button>
            <button onClick={handleSave} disabled={loading} className="bg-white text-black font-black uppercase text-[10px] px-10 py-3 rounded hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">{loading ? 'Procesando...' : 'Guardar Cambios'}</button>
        </div>
      </div>
    </div>
  );
};

export default BoosterModal;