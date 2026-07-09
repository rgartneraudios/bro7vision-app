import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import StickerCupon, { MODEL_COLORS } from '../booster/StickerCupon';

// ── 10 MODELOS DE BROCARD ────────────────────────────────────────────────
export const BROCARD_MODELOS = {
  // DESCUENTO — esquina triángulo con % oblicuo
   10: {
     tipo: 'descuento', descuento_pct: 10, condicion: 1, cornerStyle: 'triangle',
     bg: 'linear-gradient(160deg,#1a1a1a,#3a3a3a,#6a6a6a)',
     border: 'linear-gradient(160deg,#888,#ccc,#888)',
     cornerBg: 'linear-gradient(135deg,#888,#ddd)',
     cornerText: '#000',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(200,200,200,0.4) 50%, transparent 65%)',
     glow: 'rgba(180,180,180,0.3)',
     label: '10%',
     coste_genesis: 500,
   },
    15: {
      tipo: 'descuento', descuento_pct: 15, condicion: 1, cornerStyle: 'triangle',
     bg: 'linear-gradient(160deg, #2a2a2e 0%, #4a4a52 30%, #8a8a96 55%, #5a5a64 75%, #1e1e22 100%)',
     border: 'linear-gradient(160deg, #c8ccd8, #f0f2f8, #9ca0b0, #e8eaf0, #7a7e8a)',
     cornerBg: 'linear-gradient(135deg, #9ca0b0 0%, #f0f2f8 40%, #b0b4c4 70%, #787c8c 100%)',
     cornerText: '#000252',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(210,215,230,0.55) 50%, transparent 65%)',
     glow: 'rgba(200,205,225,0.35)',
     label: '15%',
     coste_genesis: 1000,
   },
   20: {
     sector: 'descuento', descuento_pct: 20, condicion: 1, cornerStyle: 'triangle',
     bg: 'linear-gradient(160deg, #0a0f2e 0%, #0d1f5c 25%, #1a3a9e 50%, #0d2070 70%, #060b20 100%)',
     border: 'linear-gradient(160deg, #2a4fcc, #6a9fff, #1a35aa, #5080ee, #0f2580)',
     cornerBg: 'linear-gradient(135deg, #1a3acc 0%, #6a9fff 40%, #2a50dd 70%, #0f2299 100%)',
     cornerText: '#ffffff',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(120,180,255,0.6) 50%, transparent 65%)',
     glow: 'rgba(80,130,255,0.4)',
     label: '20%',
     coste_genesis: 1500,
   },
   25: {
     sector: 'descuento', descuento_pct: 25, condicion: 2, cornerStyle: 'triangle',
     bg: 'linear-gradient(160deg, #1a1200 0%, #3d2a00 25%, #8a6200 50%, #5a4000 70%, #120d00 100%)',
     border: 'linear-gradient(160deg, #c8960a, #ffe066, #a07808, #ffd040, #7a5c06)',
     cornerBg: 'linear-gradient(135deg, #c8960a 0%, #ffe566 40%, #d4a010 70%, #9a7008 100%)',
     cornerText: '#01053D',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(255,220,80,0.65) 50%, transparent 65%)',
     glow: 'rgba(255,200,50,0.4)',
     label: '25%',
     coste_genesis: 2000,
   },
   30: {
     sector: 'descuento', descuento_pct: 30, condicion: 1, cornerStyle: 'triangle',
     bg: 'linear-gradient(160deg,#1a0a2e,#3d1a6e,#7a35c8)',
     border: 'linear-gradient(160deg,#7a35c8,#c87aff,#5a20a8)',
     cornerBg: 'linear-gradient(135deg,#7a35c8,#d4a0ff)',
     cornerText: '#fff',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(180,100,255,0.5) 50%, transparent 65%)',
     glow: 'rgba(150,80,255,0.4)',
     label: '30%',
     coste_genesis: 2500,
   },
   40: {
     sector: 'descuento', descuento_pct: 40, condicion: 1, cornerStyle: 'triangle',
     bg: 'linear-gradient(160deg,#1a0000,#5a0a0a,#c01a1a)',
     border: 'linear-gradient(160deg,#c01a1a,#ff6060,#a01010)',
     cornerBg: 'linear-gradient(135deg,#c01a1a,#ff8080)',
     cornerText: '#fff',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(255,100,100,0.5) 50%, transparent 65%)',
     glow: 'rgba(255,60,60,0.4)',
     label: '40%',
     coste_genesis: 3500,
   },
  // ENVÍO GRATIS — esquina círculo
   'envio1': {
     sector: 'envio', descuento_pct: 0, condicion: 1, cornerStyle: 'circle',
     bg: 'linear-gradient(160deg,#001a0a,#004d20,#009940)',
     border: 'linear-gradient(160deg,#009940,#40ff90,#007730)',
     cornerBg: 'linear-gradient(135deg,#009940,#40ff90)',
     cornerText: '#fff',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(60,255,140,0.4) 50%, transparent 65%)',
     glow: 'rgba(40,200,100,0.4)',
     label: 'ENVÍO\nGRATIS',
     coste_genesis: 800,
   },
   'envio2': {
     sector: 'envio', descuento_pct: 0, condicion: 2, cornerStyle: 'circle',
     bg: 'linear-gradient(160deg,#001a0a,#004d20,#009940)',
     border: 'linear-gradient(160deg,#009940,#40ff90,#007730)',
     cornerBg: 'linear-gradient(135deg,#009940,#40ff90)',
     cornerText: '#fff',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(60,255,140,0.4) 50%, transparent 65%)',
     glow: 'rgba(40,200,100,0.4)',
     label: 'ENVÍO\nGRATIS',
     coste_genesis: 600,
   },
   'envio3': {
     sector: 'envio', descuento_pct: 0, condicion: 3, cornerStyle: 'circle',
     bg: 'linear-gradient(160deg,#001a0a,#004d20,#009940)',
     border: 'linear-gradient(160deg,#009940,#40ff90,#007730)',
     cornerBg: 'linear-gradient(135deg,#009940,#40ff90)',
     cornerText: '#fff',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(60,255,140,0.4) 50%, transparent 65%)',
     glow: 'rgba(40,200,100,0.4)',
     label: 'ENVÍO\nGRATIS',
     coste_genesis: 400,
   },
  // REGALO 100% — esquina círculo
   100: {
     sector: 'regalo', descuento_pct: 100, condicion: 1, cornerStyle: 'circle',
     bg: 'linear-gradient(160deg,#0a001a,#2a0050,#6600cc)',
     border: 'linear-gradient(160deg,#6600cc,#cc88ff,#4400aa)',
     cornerBg: 'linear-gradient(135deg,#6600cc,#dd99ff)',
     cornerText: '#fff',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(180,80,255,0.5) 50%, transparent 65%)',
     glow: 'rgba(140,60,255,0.4)',
     label: '100%\nREGALO',
     coste_genesis: 5000,
   },
  // TARJETA REGALO 5€ — naranja
   'regalo5': {
     sector: 'regalo', descuento_pct: 0, condicion: 1, cornerStyle: 'circle',
     bg: 'linear-gradient(160deg,#1a0a00,#4a2000,#cc6600)',
     border: 'linear-gradient(160deg,#cc6600,#ffaa44,#aa5500)',
     cornerBg: 'linear-gradient(135deg,#cc6600,#ffcc88)',
     cornerText: '#fff',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(255,170,68,0.5) 50%, transparent 65%)',
     glow: 'rgba(255,150,50,0.4)',
     label: 'REGALO\n5€',
     coste_genesis: 10000,
   },
  // TARJETA REGALO 10€ — rosa mármol
   'regalo10': {
     sector: 'regalo', descuento_pct: 0, condicion: 1, cornerStyle: 'circle',
     bg: 'linear-gradient(160deg,#1a0a14,#4a2030,#cc6688)',
     border: 'linear-gradient(160deg,#cc6688,#ffaacc,#aa5577)',
     cornerBg: 'linear-gradient(135deg,#cc6688,#ffccee)',
     cornerText: '#fff',
     shimmer: 'linear-gradient(105deg, transparent 35%, rgba(255,170,204,0.5) 50%, transparent 65%)',
     glow: 'rgba(255,100,150,0.4)',
     label: 'REGALO\n10€',
     coste_genesis: 15000,
   },
};

const MODELO_KEYS = Object.keys(BROCARD_MODELOS);

// Ciclo lunar real: 29.53058867 días
// Referencia conocida: Luna Nueva el 06/01/2000 a las 18:14 UTC
const LUNA_REF = new Date('2000-01-06T18:14:00Z').getTime();
const CICLO_LUNAR = 29.53058867 * 24 * 60 * 60 * 1000;

function getLunaActual() {
  const edad = ((Date.now() - LUNA_REF) % CICLO_LUNAR + CICLO_LUNAR) % CICLO_LUNAR;
  const dias = edad / (24 * 60 * 60 * 1000);
  if (dias < 1.85)  return { fase: 'Luna Nueva',  emoji: '🌑', indice: 1 };
  if (dias < 14.77) return { fase: 'Creciente',   emoji: '🌙', indice: 2 };
  if (dias < 16.61) return { fase: 'Luna Llena',  emoji: '🌕', indice: 3 };
  return              { fase: 'Menguante',     emoji: '🌗', indice: 4 };
}

function getVencimiento() {
  const edad = ((Date.now() - LUNA_REF) % CICLO_LUNAR + CICLO_LUNAR) % CICLO_LUNAR;
  const diasRestantes = (() => {
    const d = edad / (24 * 60 * 60 * 1000);
    if (d < 1.85)  return 1.85 - d;
    if (d < 14.77) return 14.77 - d;
    if (d < 16.61) return 16.61 - d;
    return 29.53 - d;
  })();
  const venc = new Date(Date.now() + diasRestantes * 24 * 60 * 60 * 1000);
  return venc.toISOString().split('T')[0];
}

function getFaseLunar() {
  return getLunaActual().indice;
}

function getFaseLabel(indice) {
  const labels = { 1:'Luna Nueva', 2:'Creciente', 3:'Luna Llena', 4:'Menguante' };
  return labels[indice] || getLunaActual().fase;
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
const BoosterBroCards = () => {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descriptions, setDescripciones] = useState({});
  const [palabrasClave1, setPalabrasClave1] = useState({});
  const [palabrasClave2, setPalabrasClave2] = useState({});
  const [palabrasClave3, setPalabrasClave3] = useState({});
  const [tiposBrocard, setTiposBrocard] = useState({});
  const [bannersUrl, setBannersUrl] = useState({});
  const [guardando, setGuardando] = useState({});

  // Estado para crear nuevo cupón
  const [selectedModelKey, setSelectedModelKey] = useState(null);
  const [alcance, setAlcance] = useState('LOCAL');
  const [sectorComercio, setSectorComercio] = useState('PRODUCTO');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoBannerUrl, setNuevoBannerUrl] = useState('');
  const [creando, setCreando] = useState(false);

  const [aliasUsuario, setAliasUsuario] = useState('');

  const cargarCupones = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('USER ID:', user?.id);
      if (!user) return;

      const { data: perfil } = await supabase
        .from('profiles')
        .select('alias')
        .eq('id', user.id)
        .single();
      if (perfil?.alias) setAliasUsuario(perfil.alias);

      const { data, error } = await supabase
        .from('comercio_cupones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('DATA:', data);
      console.log('ERROR:', error);
      console.log('ROWS:', data?.length);

      if (error) throw error;

      if (data) {
        console.log('Columnas de comercio_cupones:', data.length > 0 ? Object.keys(data[0]) : 'sin datos');
        console.log('Ejemplo banner_11_url:', data.length > 0 ? data[0].banner_11_url : 'N/A');
        setCupones(data);
        const descMap = {};
        const pc1Map = {};
        const pc2Map = {};
        const pc3Map = {};
        const tbMap = {};
        const bannMap = {};
        data.forEach(c => {
          descMap[c.id] = c.descripcion || c.description || '';
          pc1Map[c.id] = c.palabra_clave_1 || '';
          pc2Map[c.id] = c.palabra_clave_2 || '';
          pc3Map[c.id] = c.palabra_clave_3 || '';
          tbMap[c.id] = c.tipo_brocard || '';
          bannMap[c.id] = c.banner_11_url || '';
        });
        setDescripciones(descMap);
        setPalabrasClave1(pc1Map);
        setPalabrasClave2(pc2Map);
        setPalabrasClave3(pc3Map);
        setTiposBrocard(tbMap);
        setBannersUrl(bannMap);
      }
    } catch (err) {
      console.error('Error cargando cupones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCupones();
  }, [cargarCupones]);

  const handleDescripcionChange = (id, value) => {
    setDescripciones(prev => ({ ...prev, [id]: value }));
  };

  const handlePalabraClave1Change = (id, value) => {
    setPalabrasClave1(prev => ({ ...prev, [id]: value }));
  };

  const handlePalabraClave2Change = (id, value) => {
    setPalabrasClave2(prev => ({ ...prev, [id]: value }));
  };

  const handlePalabraClave3Change = (id, value) => {
    setPalabrasClave3(prev => ({ ...prev, [id]: value }));
  };

  const handleTipoBrocardChange = (id, value) => {
    setTiposBrocard(prev => ({ ...prev, [id]: value }));
  };

  const handleBannerUrlChange = (id, value) => {
    setBannersUrl(prev => ({ ...prev, [id]: value }));
  };

const handleGuardar = async (cuponId) => {
  setGuardando(prev => ({ ...prev, [cuponId]: true }));
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('comercio_cupones')
      .update({
        descripcion:     descriptions[cuponId],
        palabra_clave_1: palabrasClave1[cuponId] || null,
        palabra_clave_2: palabrasClave2[cuponId] || null,
        palabra_clave_3: palabrasClave3[cuponId] || null,
        tipo_brocard:    tiposBrocard[cuponId]   || null,
        banner_11_url:   bannersUrl[cuponId]     || null,
      })
      .eq('id', cuponId)
      .eq('user_id', user.id);
      
      if (error) throw error;

      setCupones(prev =>
        prev.map(c => c.id === cuponId ? {
          ...c,
          descripcion: descriptions[cuponId],
          palabra_clave_1: palabrasClave1[cuponId] || null,
          palabra_clave_2: palabrasClave2[cuponId] || null,
          palabra_clave_3: palabrasClave3[cuponId] || null,
          tipo_brocard: tiposBrocard[cuponId] || null,
          banner_11_url: bannersUrl[cuponId] || null,
        } : c)
      );
    } catch (err) {
      console.error('Error guardando cupón:', err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setGuardando(prev => ({ ...prev, [cuponId]: false }));
    }
  };

  const handleCrearCupon = async () => {
    if (!selectedModelKey) return;
    const modelo = BROCARD_MODELOS[selectedModelKey];
    if (!modelo) return;

    setCreando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data: perfil } = await supabase
        .from('profiles')
        .select('alias, city, country')
        .eq('id', user.id)
        .single();

      const nombreComercio = perfil?.alias || 'COMERCIO';

      const fase_lunar = getFaseLunar();
      const vencimiento = getVencimiento();

      const { data, error } = await supabase
        .from('comercio_cupones')
        .insert({
          user_id: user.id,
          comercio_nombre: perfil?.alias || 'COMERCIO',
          ciudad: perfil?.city || '',
          pais: perfil?.country || '',
          modelo_key: String(selectedModelKey),
          tipo: modelo.tipo,
          sector: sectorComercio,
          descuento_pct: modelo.descuento_pct,
          condicion: modelo.condicion,
          alcance,
          descripcion: nuevaDescripcion,
          banner_11_url: nuevoBannerUrl,
          fase_lunar,
          vencimiento,
        })
        .select()
        .single();

      if (error) throw error;

      setCupones(prev => [data, ...prev]);
      setDescripciones(prev => ({ ...prev, [data.id]: nuevaDescripcion }));
      setBannersUrl(prev => ({ ...prev, [data.id]: nuevoBannerUrl }));
      setSelectedModelKey(null);
      setAlcance('Local');
      setNuevaDescripcion('');
      setNuevoBannerUrl('');
    } catch (err) {
      console.error('Error creando cupón:', err);
      alert('Error al crear cupón: ' + err.message);
    } finally {
      setCreando(false);
    }
   };
   
  const mapToCard = (c) => {
    const key = c.modelo_key;
    // Intentar como string primero, luego como número
    const modelo = BROCARD_MODELOS[key] || BROCARD_MODELOS[Number(key)];

    if (!modelo) {
      console.warn('modelo_key no encontrado:', key);
      return null;
    }

    return {
      ...c,           // datos de Supabase primero
      ...modelo,      // estilos del modelo encima
      // estos SIEMPRE al final — nunca pisados
      nombre: c.comercio_nombre || 'COMERCIO',
      banner_url: c.banner_11_url || '/images/brocard.webp',
      fase_lunar: getFaseLabel(Number(c.fase_lunar)) || getLunaActual().fase,
      vencimiento: c.vencimiento || getVencimiento(),
      coste_genesis: modelo.coste_genesis,
    };
  };

  const renderCards = cupones.map(c => mapToCard(c)).filter(Boolean);
  console.log('renderCards:', JSON.stringify(renderCards[0], null, 2));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">
          Cargando tus BroCards...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn max-w-5xl mx-auto pb-10">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-2">
        <span className="text-4xl">📇</span>
        <div>
          <h3 className="text-xl font-black text-emerald-400 tracking-widest uppercase">
            Selección BroCards
          </h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">
            {cupones.length} {cupones.length === 1 ? 'cupón' : 'cupones'} en tu inventario
          </p>
        </div>
      </div>

      {/* ── CATÁLOGO 10 MODELOS ────────────────────────────────────── */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-cyan-400 tracking-widest uppercase">
          Catálogo de modelos
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {MODELO_KEYS.map(key => {
            const m = BROCARD_MODELOS[key];
            const isSelected = selectedModelKey === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedModelKey(isSelected ? null : key);
                  setNuevaDescripcion('');
                }}
                style={{
                  background: m.bg,
                  border: isSelected ? '2px solid #00ffcc' : '2px solid transparent',
                  borderRadius: '12px',
                  padding: '12px 8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: isSelected ? '0 0 20px rgba(0,255,200,0.4)' : '0 2px 8px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: '11px', fontWeight: 900,
                  color: m.cornerText,
                  whiteSpace: 'pre-line',
                  lineHeight: 1.2,
                }}>
                  {m.label}
                </div>
                <div style={{
                  fontSize: '9px', color: '#aaa', marginTop: '4px',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  min {m.condicion} {m.tipo === 'descuento' ? 'art' : 'cond'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONFIGURAR MODELO SELECCIONADO ─────────────────────────── */}
      {selectedModelKey && (() => {
        const m = BROCARD_MODELOS[selectedModelKey];
        const fase = getFaseLunar();
        const venc = getVencimiento();
        return (
          <div className="bg-black/30 backdrop-blur-md border border-cyan-500/20 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-widest">
              Configurar cupón — {m.label}
            </h4>

            {/* Alcance */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                Alcance
              </label>
              <div className="flex gap-2">
                {['LOCAL', 'NACIONAL', 'INTERNACIONAL'].map(a => (
                  <button
                    key={a}
                    onClick={() => setAlcance(a)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: "'Orbitron',monospace",
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      background: alcance === a ? 'rgba(0,255,200,0.15)' : 'rgba(255,255,255,0.05)',
                      color: alcance === a ? '#00ffcc' : '#888',
                      border: alcance === a ? '1px solid #00ffcc' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
             </div>

             {/* Sector */}
             <div className="space-y-1">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                 Sector
               </label>
               <div className="flex gap-2">
                 {['PRODUCTO', 'SERVICIO'].map(s => (
                   <button
                     key={s}
                     onClick={() => setSectorComercio(s)}
                     style={{
                       padding: '6px 16px',
                       borderRadius: '999px',
                       fontSize: '11px',
                       fontWeight: 700,
                       fontFamily: "'Orbitron',monospace",
                       letterSpacing: '1px',
                       textTransform: 'uppercase',
                       background: sectorComercio === s ? 'rgba(0,255,200,0.15)' : 'rgba(255,255,255,0.05)',
                       color: sectorComercio === s ? '#00ffcc' : '#888',
                       border: sectorComercio === s ? '1px solid #00ffcc' : '1px solid rgba(255,255,255,0.1)',
                       cursor: 'pointer',
                       transition: 'all 0.15s ease',
                     }}
                   >
                     {s}
                   </button>
                 ))}
               </div>
             </div>

             {/* Condición mínima (fija, no editable) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                Condición mínima
              </label>
              <div className="text-sm text-white font-mono">
                {m.min} {m.tipo === 'descuento' ? 'artículo(s)' : 'condición(s)'}
                <span className="text-xs text-gray-500 ml-2">(fijo por modelo)</span>
              </div>
            </div>

            {/* Fase lunar y vencimiento (auto) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                  Fase lunar activa
                </label>
                <div className="text-sm text-white font-mono">
                  {getFaseLabel(fase)} (Fase {fase})
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                  Vencimiento
                </label>
                <div className="text-sm text-white font-mono">{venc}</div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-widest block">
                Descripción del cupón
              </label>
              <textarea
                value={nuevaDescripcion}
                onChange={e => setNuevaDescripcion(e.target.value)}
                placeholder="Describe tu oferta para el Montador..."
                rows={3}
                className="w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
              />
            </div>

            {/* banner_11_url */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-widest block">
                Banner cuadrado 160 x 160 px
              </label>
              <input type="text" value={nuevoBannerUrl}
                onChange={e => setNuevoBannerUrl(e.target.value)}
                placeholder="https://media.bro7vision.com/..."
                className="w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            {/* Crear */}
            <div className="flex justify-end">
              <button
                onClick={handleCrearCupon}
                disabled={creando}
                style={{
                  background: 'linear-gradient(160deg,#009940,#40ff90)',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  fontFamily: "'Orbitron',monospace",
                  padding: '10px 28px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: creando ? 'not-allowed' : 'pointer',
                  opacity: creando ? 0.5 : 1,
                  boxShadow: '0 0 20px rgba(0,255,140,0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                {creando ? '⏳ CREANDO...' : '🎴 CREAR CUPÓN'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── CUPONES EXISTENTES ─────────────────────────────────────── */}
      {renderCards.length > 0 && (
        <div className="space-y-8">
          <h4 className="text-sm font-black text-emerald-400 tracking-widest uppercase">
            Cupones creados
          </h4>
          {renderCards.map((card, i) => {
            const c = cupones[i];
            if (!c) return null;
            return (
              <div key={c.id} className="space-y-4">
                <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-3">
                  <h5 className="text-sm font-black text-fuchsia-300 uppercase tracking-widest">
                    {'\uD83D\uDCF7'} Creaci\u00f3n de Sticker
                  </h5>

                  <label className="text-xs font-bold text-gray-300 uppercase tracking-widest block">
                    Tipo BroCard
                  </label>
                  <select value={tiposBrocard[c.id] || ''}
                    onChange={e => handleTipoBrocardChange(c.id, e.target.value)}
                    className="w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all">
                    <option value="" style={{ background: '#1a1a2e', color: '#888' }}>Seleccionar...</option>
                    {MODELO_KEYS.map(key => {
                      const m = BROCARD_MODELOS[key];
                      return (
                        <option key={key} value={key} style={{ background: '#1a1a2e', color: '#fff' }}>
                          {m.label.replace('\n', ' ')} — {m.coste_genesis} G
                        </option>
                      );
                    })}
                  </select>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                        Palabra clave 1
                      </label>
                      <input type="text" value={palabrasClave1[c.id] || ''}
                        onChange={e => handlePalabraClave1Change(c.id, e.target.value)}
                        maxLength={30}
                        placeholder="Ej: DESCUENTO"
                        className="w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                        Palabra clave 2
                      </label>
                      <input type="text" value={palabrasClave2[c.id] || ''}
                        onChange={e => handlePalabraClave2Change(c.id, e.target.value)}
                        maxLength={30}
                        placeholder="Ej: BIENVENIDO"
                        className="w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                        Palabra clave 3
                      </label>
                      <input type="text" value={palabrasClave3[c.id] || ''}
                        onChange={e => handlePalabraClave3Change(c.id, e.target.value)}
                        maxLength={30}
                        placeholder="Ej: INTERNO_001"
                        className="w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all" />
                    </div>
                  </div>

                  <label className="text-xs font-bold text-gray-300 uppercase tracking-widest block">
                    Descripción del cupón
                  </label>
                  <textarea
                    value={descriptions[c.id] || ''}
                    onChange={e => handleDescripcionChange(c.id, e.target.value)}
                    placeholder="Describe tu oferta para el Montador..."
                    rows={3}
                    className="w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleGuardar(c.id)}
                      disabled={guardando[c.id]}
                      className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full border border-emerald-500/30 transition-all disabled:opacity-50"
                    >
                      {guardando[c.id] ? '⏳ GUARDANDO...' : '💾 GUARDAR'}
                    </button>
                  </div>
                  {palabrasClave1[c.id]?.trim() && tiposBrocard[c.id] && (() => {
                    const mSticker = BROCARD_MODELOS[tiposBrocard[c.id]];
                    if (!mSticker) return null;
                    const vencSticker = getVencimiento();
                    const faseSticker = getFaseLabel(getFaseLunar());
                    return (
                      <div className="mt-4 pt-4 border-t border-fuchsia-500/20">
                        <h5 className="text-xs font-bold text-fuchsia-300 uppercase tracking-widest mb-3">
                          {'\uD83D\uDCF7'} Vista previa del sticker
                        </h5>
                        <div className="flex justify-center">
                          <StickerCupon
                            comercioNombre={aliasUsuario || 'COMERCIO'}
                            tipoBrocard={mSticker.label.replace('\n', ' ')}
                            colorBorde={MODEL_COLORS[tiposBrocard[c.id]] || '#888888'}
                            palabraClave1={palabrasClave1[c.id]?.trim() || ''}
                            aliasUsuario={aliasUsuario}
                            fechaCaduca={`${faseSticker} - ${vencSticker}`}
                            banner_11_url={bannersUrl[c.id] || c.banner_11_url || ''}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && cupones.length === 0 && !selectedModelKey && (
        <div className="flex flex-col items-center justify-center h-64 gap-4 border border-white/5 rounded-3xl bg-white/2">
          <span className="text-5xl opacity-30">📇</span>
          <p className="text-gray-600 text-xs uppercase tracking-widest text-center">
            Aún no tienes cupones creados
          </p>
        </div>
      )}
    </div>
  );
};

export default BoosterBroCards;



