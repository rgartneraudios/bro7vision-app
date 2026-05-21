// src/components/MarketTab.jsx
// ─────────────────────────────────────────────────────────────────────
// Sistema de Campaña Lunar - Inventario destacado_ps
// ─────────────────────────────────────────────────────────────────────
// Tabla: profiles
// Columna: destacados_ps (array de objetos JSON)
// ─────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { getMoonSuffix } from '../utils/moonUtils';

const MAX_PRODUCTOS = 10;

const THEMES = {
  cyan:  { border: '#22d3ee', glow: 'rgba(34,211,238,0.3)', text: '#22d3ee', bg: 'cyan-500/10' },
  gold:  { border: '#fbbf24', glow: 'rgba(251,191,36,0.3)', text: '#fbbf24', bg: 'amber-500/10' },
};

const LUNA_EMOJIS = { nova: '🌑', crescens: '🌙', plena: '🌕', decrescens: '🌗' };
const LUNA_COLORS = {
  nova:     '#A855F7',  // fucsia
  crescens: '#79FF1A',  // verde
  plena:    '#FFFFFF',  // blanco
  decrescens: '#F97316', // naranja
};

const ALCANCE_OPTIONS = ['NACIONAL', 'GLOBAL'];

export const MarketTab = ({ formData, setFormData }) => {
  const [session, setSession] = useState(null);
  const [perfilOso, setPerfilOso] = useState(null);
  const [destacadosPs, setDestacadosPs] = useState([]);
  const [campanaActual, setCampanaActual] = useState([]);
  const [campanaSiguiente, setCampanaSiguiente] = useState([]);
  const [faseLunarActual, setFaseLunarActual] = useState(1);
  const [isFaseActiva, setIsFaseActiva] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [acordeonActualAbierto, setAcordeonActualAbierto] = useState(true);
  const [acordeonSiguienteAbierto, setAcordeonSiguienteAbierto] = useState(true);
  const [nuevoProductoIndex, setNuevoProductoIndex] = useState(null);
  const [productosEditando, setProductosEditando] = useState({});

  // ── Auth y Perfil ──
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setPerfilOso(profile);
        setIsAdmin(profile?.role === 'admin');
        setIsPremium(profile?.is_premium === true || profile?.rango !== undefined);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // ── Cargar destacados_ps ──
  useEffect(() => {
    const loadDestacados = async () => {
      if (!perfilOso?.id) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('destacados_ps')
        .eq('id', perfilOso.id)
        .single();
      
      if (profile?.destacados_ps && Array.isArray(profile.destacados_ps)) {
        const items = profile.destacados_ps;
        const actual = items.filter(i => i.campana_semana === 'actual');
        const siguiente = items.filter(i => i.campana_semana === 'siguiente');
        setDestacadosPs(items);
        setCampanaActual(actual);
        setCampanaSiguiente(siguiente);
      } else {
        // Default: 1 producto en siguiente con luna Nova activada
        const defaultProducto = {
          id: `new-${Date.now()}`,
          campana_semana: 'siguiente',
          producto_codigo: '',
          producto_titulo: '',
          categoria: '',
          tallas: '',
          peso: '',
          material: '',
          origen: '',
          descripcion: '',
          precio_original: 0,
          precio_descuento: 0,
          stock_inicial: 10,
          stock_actual: 10,
          alcance: 'NACIONAL',
          lunas: { nova: true, crescens: false, plena: false, decrescens: false },
          image_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCampanaSiguiente([defaultProducto]);
      }
    };
    loadDestacados();
  }, [perfilOso?.id]);

  // ── Calcular fase lunar actual ──
  useEffect(() => {
    const calcularFase = () => {
      const fase = getMoonSuffix();
      setFaseLunarActual(parseInt(fase));
      // Fase activa si la luna actual es nova (1) o si hay items en campanaActual
      setIsFaseActiva(fase === '1' || campanaActual.length > 0);
    };
    calcularFase();
    const interval = setInterval(calcularFase, 60000);
    return () => clearInterval(interval);
  }, [campanaActual.length]);

  // ── Realtime Subscription para stock ──
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const channel = supabase
      .channel(`profiles:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        async ({ new: newProfile }) => {
          if (newProfile?.destacados_ps) {
            const items = newProfile.destacados_ps;
            const actual = items.filter(i => i.campana_semana === 'actual');
            const siguiente = items.filter(i => i.campana_semana === 'siguiente');
            setCampanaActual(actual);
            setCampanaSiguiente(siguiente);
            setDestacadosPs(items);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  // ── Subida a R2 ──
  const subirImagenR2 = async (file, setLoadingState) => {
    if (!file) return null;
    setLoadingState(true);
    try {
      const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: safeFileName, fileType: file.type }),
      });
      const { uploadUrl } = await res.json();
      if (!uploadUrl) throw new Error('Sin ticket de subida.');
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      return `https://media.bro7vision.com/${safeFileName}`;
    } catch (err) {
      console.error('Error subiendo a R2:', err);
      alert('❌ Error al subir imagen: ' + err.message);
      return null;
    } finally {
      setLoadingState(false);
    }
  };

  // ── Handlers de Productos ──
  const handleAddProducto = (campana) => {
    if (campana === 'actual' && campanaActual.length >= MAX_PRODUCTOS) {
      alert(`⚠️ Máximo ${MAX_PRODUCTOS} productos permitidos.`);
      return;
    }
    if (campana === 'siguiente' && campanaSiguiente.length >= MAX_PRODUCTOS) {
      alert(`⚠️ Máximo ${MAX_PRODUCTOS} productos permitidos.`);
      return;
    }
    const defaultProducto = {
      id: `new-${Date.now()}`,
      campana_semana: campana,
      producto_codigo: '',
      producto_titulo: '',
      categoria: '',
      tallas: '',
      peso: '',
      material: '',
      origen: '',
      descripcion: '',
      precio_original: 0,
      precio_descuento: 0,
      stock_inicial: 10,
      stock_actual: 10,
      alcance: 'NACIONAL',
      lunas: { nova: true, crescens: false, plena: false, decrescens: false },
      image_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (campana === 'actual') {
      setCampanaActual(prev => [...prev, defaultProducto]);
    } else {
      setCampanaSiguiente(prev => [...prev, defaultProducto]);
    }
    setNuevoProductoIndex(campana === 'actual' ? campanaActual.length : campanaSiguiente.length);
    setProductosEditando(prev => ({ ...prev, [defaultProducto.id]: true }));
  };

  const handleUpdateProducto = (campana, id, field, value) => {
    const setter = campana === 'actual' ? setCampanaActual : setCampanaSiguiente;
    setter(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value, updated_at: new Date().toISOString() };
      if (field === 'stock_actual' && value < 0) return { ...item, stock_actual: 0 };
      if (field === 'stock_actual' && value > item.stock_inicial) return { ...item, stock_actual: item.stock_inicial };
      return updated;
    }));
  };

  const handleToggleLuna = (campana, id, lunaKey) => {
    const setter = campana === 'actual' ? setCampanaActual : setCampanaSiguiente;
    setter(prev => prev.map(item => {
      if (item.id !== id) return item;
      const nuevasLunas = { ...item.lunas, [lunaKey]: !item.lunas[lunaKey] };
      return { ...item, lunas: nuevasLunas, updated_at: new Date().toISOString() };
    }));
  };

  const handleDeleteProducto = (campana, id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    const setter = campana === 'actual' ? setCampanaActual : setCampanaSiguiente;
    setter(prev => prev.filter(item => item.id !== id));
  };

  const handleGuardarProducto = (campana, producto) => {
    // Validaciones
    if (!producto.producto_codigo || !producto.producto_titulo) {
      alert('⚠️ Código y Título son obligatorios.');
      return;
    }
    if (producto.precio_original < 0 || producto.precio_descuento < 0) {
      alert('⚠️ Los precios no pueden ser negativos.');
      return;
    }
    if (producto.stock_inicial < 0 || producto.stock_actual < 0) {
      alert('⚠️ El stock no puede ser negativo.');
      return;
    }
    if (producto.stock_actual > producto.stock_inicial) {
      alert('⚠️ El stock actual no puede superar el stock inicial.');
      return;
    }
    if (producto.precio_descuento > producto.precio_original) {
      alert('⚠️ El precio de descuento no puede superar el precio original.');
      return;
    }
  };

  const handleGuardarCampana = async () => {
    setGuardando(true);
    try {
      const todosProductos = [
        ...campanaActual.map(p => ({ ...p, campana_semana: 'actual' })),
        ...campanaSiguiente.map(p => ({ ...p, campana_semana: 'siguiente' })),
      ];
      
      // Ordenar por created_at
      todosProductos.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      // Asignar orden_portada a los 3 primeros
      todosProductos.forEach((p, idx) => {
        p.orden_portada = idx < 3 ? idx + 1 : null;
      });

      const { error } = await supabase
        .from('profiles')
        .update({ destacados_ps: todosProductos })
        .eq('id', perfilOso?.id);

      if (error) throw error;
      
      alert('✅ Campaña guardada correctamente.');
      setDestacadosPs(todosProductos);
    } catch (err) {
      console.error('Error guardando campaña:', err);
      alert('❌ Error al guardar: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // ── Render ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        ⏳ Cargando MarketTab...
      </div>
    );
  }

  const t = THEMES.cyan;

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Banner Video Commerce */}
      <div
        className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mb-6 backdrop-blur"
        style={{ boxShadow: `0 0 20px ${t.glow}` }}
      >
        <p className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-1">
          ⚠️ NOTA DE VIDEO COMMERCE
        </p>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          Tu video principal (16:9) se gestiona desde la pestaña 'Señal de archivos como Video Horizontal B'.
          Sube allí tu clip mostrando tus 20 o 30 artículos para activar la experiencia de compra inmersiva en tu Teléfono Casa.
        </p>
      </div>

      {/* Acordeón: Campaña Actual */}
      <div className={`${t.bg} border border-cyan-500/20 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl`}>
        <button
          onClick={() => setAcordeonActualAbierto(!acordeonActualAbierto)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">
              📦 Campaña Actual (campana_semana: "actual")
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {campanaActual.length} / {MAX_PRODUCTOS} productos
              {isFaseActiva && !isAdmin && !isPremium && (
                <span className="text-amber-400 ml-2">⚠️ CONGELADO - Fase lunar activa</span>
              )}
            </p>
          </div>
          <span className="text-gray-500 text-lg">{acordeonActualAbierto ? '▼' : '▶'}</span>
        </button>

        {acordeonActualAbierto && (
          <div className="space-y-3">
            {campanaActual.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">
                <span className="text-3xl mb-2 block">📭</span>
                Sin productos en campaña actual.
              </div>
            ) : (
              (() => {
                const esEditable = !isFaseActiva || isAdmin || isPremium;
                return (
                  campanaActual.map((producto, idx) => {
                    const esUnoDeTres = idx < 3;
                    const esPrimero = idx === 0;
                    return (
                  campanaActual.map((producto, idx) => {
                    const esUnoDeTres = idx < 3;
                    const esPrimero = idx === 0;
                    return (
                  <div
                    key={producto.id}
                    className={`bg-white/5 border ${esUnoDeTres ? 'border-cyan-500/40' : 'border-white/10'} rounded-xl p-4 transition-all ${!esEditable ? 'opacity-60' : ''}`}
                  >
                    {esUnoDeTres && (
                      <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest mb-2">
                        {esPrimero ? '🥇 Primer Producto en Portada' : `#${idx + 1} en Portada`}
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      {/* Miniatura */}
                      <div className="w-20 h-30 bg-black/40 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                        {producto.image_url ? (
                          <img src={producto.image_url} alt={producto.producto_titulo} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-600 text-xs">Sin imagen</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-cyan-100 truncate">
                              {producto.producto_titulo}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Código: {producto.producto_codigo || '—'}
                            </p>
                            {producto.categoria && (
                              <span className="text-[9px] bg-cyan-900/30 text-cyan-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                                {producto.categoria}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-2 py-1 rounded ${producto.alcance === 'NACIONAL' ? 'bg-amber-500/20 text-amber-400' : 'bg-fuchsia-500/20 text-fuchsia-400'}`}>
                              [{producto.alcance}]
                            </span>
                            {esEditable && (
                              <button
                                onClick={() => handleDeleteProducto('actual', producto.id)}
                                className="text-gray-600 hover:text-red-400 text-lg transition-all"
                              >
                                🗑
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Semáforo Lunar */}
                        <div className="flex gap-2 mt-2">
                          {Object.keys(LUNA_EMOJIS).map(luna => (
                            <button
                              key={luna}
                              onClick={() => esEditable && handleToggleLuna('actual', producto.id, luna)}
                              disabled={!esEditable}
                              style={{
                                color: producto.lunas[luna] ? LUNA_COLORS[luna] : '#4B5563',
                                textShadow: producto.lunas[luna] ? `0 0 8px ${LUNA_COLORS[luna]}` : 'none',
                                opacity: esEditable ? 1 : 0.4,
                                cursor: esEditable ? 'pointer' : 'not-allowed',
                              }}
                              className="text-lg transition-all"
                            >
                              {LUNA_EMOJIS[luna]}
                            </button>
                          ))}
                        </div>

                        {/* Stock y Precio */}
                        <div className="flex items-center gap-4 mt-3 text-[10px]">
                          <span className="text-gray-400">
                            Stock: <span className={producto.stock_actual === 0 ? 'text-red-400 font-bold' : 'text-white'}>
                              {producto.stock_actual} / {producto.stock_inicial}
                            </span>
                          </span>
                          {producto.precio_original > 0 && (
                            <>
                              <span className="text-gray-500 line-through">{producto.precio_original}€</span>
                              <span className="text-emerald-400 font-bold">{producto.precio_descuento}€</span>
                            </>
                          )}
                          {producto.tallas && (
                            <span className="text-gray-500">Talles: {producto.tallas}</span>
                          )}
                          {producto.peso && (
                            <span className="text-gray-500">| {producto.peso}</span>
                          )}
                          {producto.material && (
                            <span className="text-gray-500">| {producto.material}</span>
                          )}
                          {producto.origen && (
                            <span className="text-gray-500">| {producto.origen}</span>
                          )}
                        </div>

                        {producto.descripcion && (
                          <p className="text-[9px] text-gray-500 mt-2 line-clamp-2">
                            {producto.descripcion}
                          </p>
                    )}
                  </div>
                );
              })
            )}

            {(!isFaseActiva || isAdmin || isPremium) && campanaActual.length < MAX_PRODUCTOS && (
              <button
                onClick={() => handleAddProducto('actual')}
                className="w-full mt-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase py-3 rounded-xl transition-all"
              >
                + Añadir Producto a Campaña Actual
              </button>
            )}
          </div>
        )}
      </div>

      {/* Acordeón: Campaña Siguiente */}
      <div className={`${t.bg} border border-cyan-500/20 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl`}>
        <button
          onClick={() => setAcordeonSiguienteAbierto(!acordeonSiguienteAbierto)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">
              📦 Campaña Siguiente (campana_semana: "siguiente")
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {campanaSiguiente.length} / {MAX_PRODUCTOS} productos · Siempre editable
            </p>
          </div>
          <span className="text-gray-500 text-lg">{acordeonSiguienteAbierto ? '▼' : '▶'}</span>
        </button>

        {acordeonSiguienteAbierto && (
          <div className="space-y-3">
            {campanaSiguiente.map((producto, idx) => (
              <div key={producto.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">
                    Producto #{idx + 1}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteProducto('siguiente', producto.id)}
                      className="text-gray-600 hover:text-red-400 text-lg transition-all"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Campos */}
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Código</label>
                    <input
                      type="text"
                      value={producto.producto_codigo}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'producto_codigo', e.target.value)}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Ej: 550"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Título</label>
                    <input
                      type="text"
                      value={producto.producto_titulo}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'producto_titulo', e.target.value)}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Ej: Camiseta Neo"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Categoría</label>
                    <input
                      type="text"
                      value={producto.categoria}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'categoria', e.target.value)}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Ej: Moda"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Talles</label>
                    <input
                      type="text"
                      value={producto.tallas}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'tallas', e.target.value)}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Ej: S, M, L, XL"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Peso</label>
                    <input
                      type="text"
                      value={producto.peso}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'peso', e.target.value)}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Ej: 200g"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Material</label>
                    <input
                      type="text"
                      value={producto.material}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'material', e.target.value)}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Ej: Algodón orgánico"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Origen</label>
                    <input
                      type="text"
                      value={producto.origen}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'origen', e.target.value)}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Ej: Valencia, España"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Alcance</label>
                    <select
                      value={producto.alcance}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'alcance', e.target.value)}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {ALCANCE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Precio Original (€)</label>
                    <input
                      type="number"
                      min="0"
                      value={producto.precio_original}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'precio_original', parseFloat(e.target.value) || 0)}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Precio Descuento (€)</label>
                    <input
                      type="number"
                      min="0"
                      value={producto.precio_descuento}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'precio_descuento', parseFloat(e.target.value) || 0)}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Stock Inicial</label>
                    <input
                      type="number"
                      min="0"
                      max={MAX_PRODUCTOS}
                      value={producto.stock_inicial}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'stock_inicial', Math.min(Math.max(0, parseInt(e.target.value) || 0), MAX_PRODUCTOS))}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Stock Actual</label>
                    <input
                      type="number"
                      min="0"
                      max={producto.stock_inicial}
                      value={producto.stock_actual}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'stock_actual', Math.min(Math.max(0, parseInt(e.target.value) || 0), producto.stock_inicial))}
                      className={`w-full bg-black/60 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 ${producto.stock_actual === 0 ? 'border-red-500/40 text-red-400' : 'border-cyan-500/20'}`}
                      disabled={producto.stock_actual === 0}
                      title={producto.stock_actual === 0 ? 'Stock bloqueado en 0' : ''}
                    />
                  </div>

                  {/* Lunas */}
                  <div className="md:col-span-2">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-2">Lunas Activas</label>
                    <div className="flex gap-3">
                      {Object.keys(LUNA_EMOJIS).map(luna => (
                        <button
                          key={luna}
                          onClick={() => handleToggleLuna('siguiente', producto.id, luna)}
                          style={{
                            color: producto.lunas[luna] ? LUNA_COLORS[luna] : '#4B5563',
                            textShadow: producto.lunas[luna] ? `0 0 8px ${LUNA_COLORS[luna]}` : 'none',
                            transform: producto.lunas[luna] ? 'scale(1.2)' : 'scale(1)',
                          }}
                          className="text-xl transition-all"
                        >
                          {LUNA_EMOJIS[luna]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Imagen */}
                  <div className="md:col-span-2">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-2">Imagen (R2)</label>
                    <div className="flex gap-3 items-center">
                      {producto.image_url ? (
                        <>
                          <div className="w-16 h-16 bg-black/40 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={producto.image_url} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <button
                            onClick={async () => {
                              const url = await subirImagenR2(null, () => {});
                              if (url) handleUpdateProducto('siguiente', producto.id, 'image_url', url);
                            }}
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                          >
                            🔁 Reemplazar
                          </button>
                        </>
                      ) : (
                        <label className="flex-1 cursor-pointer bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-2 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-all text-center">
                          <span>Subir Imagen</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async e => {
                              const url = await subirImagenR2(e.target.files[0], () => {});
                              if (url) handleUpdateProducto('siguiente', producto.id, 'image_url', url);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="md:col-span-2">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Descripción</label>
                    <textarea
                      value={producto.descripcion}
                      onChange={e => handleUpdateProducto('siguiente', producto.id, 'descripcion', e.target.value)}
                      className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                      rows="2"
                      placeholder="Descripción corta de materiales y talles..."
                    />
                  </div>
                </div>
              </div>
            ))}

            {campanaSiguiente.length < MAX_PRODUCTOS && (
              <button
                onClick={() => handleAddProducto('siguiente')}
                className="w-full mt-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase py-3 rounded-xl transition-all"
              >
                + Añadir Producto a Campaña Siguiente
              </button>
            )}
          </div>
        )}
      </div>

      {/* Botón Guardar */}
      <button
        onClick={handleGuardarCampana}
        disabled={guardando}
        className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-black font-bold text-sm uppercase py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
      >
        {guardando ? '💾 Guardando...' : '💾 GUARDAR CAMPAÑA'}
      </button>
    </div>
  );
};
