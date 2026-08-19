import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const HEADING = "'Noto Sans', sans-serif";

const COSTE_LUNAS = {
  PLATA:   { ENVIO_GRATIS: 25000, '3': 30000, '5': 35000, '10': 40000, '20': 45000, '40': 50000, '60': 55000, '100': 60000, '200': 70000 },
  ORO:     { '5': 50000, '10': 60000, '20': 70000, '40': 80000, '60': 90000, '100': 100000, '200': 150000 },
  LUNA100: { '100pct': 10000 },
};

const DIAMANTE_CONFIG = {
  200:  { descuento_pct: 40, lunas_canje: 200000, cash: 40  },
  500:  { descuento_pct: 45, lunas_canje: 300000, cash: 100 },
  1000: { descuento_pct: 50, lunas_canje: 400000, cash: 200 },
};

const CARD_ASSETS = {
  PLATA:    { 'ENVIO_GRATIS':'plata-envio','3':'plata-3','5':'plata-5','10':'plata-10','20':'plata-20','40':'plata-40','60':'plata-60','100':'plata-100','200':'plata-200' },
  ORO:      { '5':'oro-5','10':'oro-10','20':'oro-20','40':'oro-40','60':'oro-60','100':'oro-100','200':'oro-200' },
  DIAMANTE: { '200':'diamante-200','500':'diamante-500','1000':'diamante-1000' },
  '100':    { '100pct':'luna100' },
};

const VALORES_POR_TIER = {
  PLATA:   ['ENVIO_GRATIS','3','5','10','20','40','60','100','200'],
  ORO:     ['5','10','20','40','60','100','200'],
  LUNA100: ['100pct'],
};

const LABEL_VALOR = {
  ENVIO_GRATIS: 'Envío Gratis', '3': '3 €', '5': '5 €', '10': '10 €',
  '20': '20 €', '40': '40 €', '60': '60 €', '100': '100 €',
  '200': '200 €', '500': '500 €', '1000': '1.000 €', '100pct': '100% Descuento',
};

const LUNA_STYLES = {
  PLATA: {
    bgCard:    'linear-gradient(170deg, #e8eaf0 0%, #f8f9fc 40%, #d0d4e0 70%, #c8ccd8 100%)',
    border:    'linear-gradient(135deg, #a0a8b8, #e0e4f0, #8090a8)',
    color:     '#4a5068',
    colorText: '#2a3048',
    badge:     'Luna de Plata',
    tierGrad:  'linear-gradient(135deg, #8090a8 0%, #d0d8e8 40%, #f0f4ff 60%, #9098b0 100%)',
    lunasBg:   'rgba(160,168,184,0.15)',
    lunasBorder: 'rgba(160,168,184,0.4)',
    shimmer:   'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.7) 50%, transparent 65%)',
  },
  ORO: {
    bgCard:    'linear-gradient(170deg, #f5e6b0 0%, #fdf5d0 40%, #e8c870 70%, #d4a830 100%)',
    border:    'linear-gradient(135deg, #c8960a, #ffe566, #a07808)',
    color:     '#7a5800',
    colorText: '#4a3400',
    badge:     'Luna de Oro',
    tierGrad:  'linear-gradient(135deg, #c8960a 0%, #ffe566 40%, #ffd040 60%, #c89010 100%)',
    lunasBg:   'rgba(200,150,10,0.12)',
    lunasBorder: 'rgba(200,150,10,0.35)',
    shimmer:   'linear-gradient(105deg, transparent 35%, rgba(255,240,150,0.7) 50%, transparent 65%)',
  },
  DIAMANTE: {
    bgCard:    'linear-gradient(170deg, #1a0a2e 0%, #2d1050 40%, #4a1878 70%, #1a0838 100%)',
    border:    'linear-gradient(135deg, #9040e0, #d090ff, #6020b0)',
    color:     '#d090ff',
    colorText: '#f0d0ff',
    badge:     'Luna de Diamante',
    tierGrad:  'linear-gradient(135deg, #9040e0 0%, #d090ff 40%, #ff90f0 60%, #8030d0 100%)',
    lunasBg:   'rgba(180,80,255,0.15)',
    lunasBorder: 'rgba(180,80,255,0.4)',
    shimmer:   'linear-gradient(105deg, transparent 35%, rgba(220,150,255,0.5) 50%, transparent 65%)',
  },
  '100': {
    bgCard:    'linear-gradient(170deg, #ffffff 0%, #f8f0ff 30%, #fff0f8 60%, #f0f8ff 100%)',
    border:    'linear-gradient(135deg, #ff80c0, #c080ff, #80c0ff)',
    color:     '#8040a0',
    colorText: '#4a2060',
    badge:     'Luna 100',
    tierGrad:  'linear-gradient(135deg, #ff60a0 0%, #c060ff 33%, #60c0ff 66%, #ff60c0 100%)',
    lunasBg:   'rgba(180,80,220,0.08)',
    lunasBorder: 'rgba(180,80,220,0.3)',
    shimmer:   'linear-gradient(105deg, transparent 35%, rgba(220,180,255,0.6) 50%, transparent 65%)',
  },
};

const REVERSO_INTRO = {
  PLATA:    (valor) => `Descuento de ${valor}€ con compra mínima establecida por el comercio.`,
  ORO:      (valor) => `Vale de ${valor}€. Úsalo en cualquier compra de igual o superior importe. Si el total es mayor, pagas la diferencia.`,
  DIAMANTE: (valor) => `Premio de ${valor}€ en producto o pack descrito por el comercio. Ver detalle en descripción.`,
  '100':    ()      => `Descuento del 100% en el producto o servicio descrito a continuación.`,
};

const SUPABASE_STORAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/comercio-banners`;

export default function TarjetasRegalo({ profile }) {
  const [userId, setUserId]         = useState(null);
  const [tarjetas, setTarjetas]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [flippedId, setFlippedId] = useState(null);
  const [msg, setMsg]               = useState('');
  const [editando, setEditando]     = useState(null); // null = nueva, id = editar

  const [tier, setTier]               = useState('PLATA');
  const [valor, setValor]             = useState('');
  const [compraMinima, setCompraMinima] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [bannerUrl, setBannerUrl]     = useState('');
  const [palabraClave1, setPalabraClave1] = useState('');
  const [palabraClave2, setPalabraClave2] = useState('');

  const [emisionTotal,   setEmisionTotal]   = useState('');
  const [nombrePremio,   setNombrePremio]   = useState('');
  const [tipoPremio,     setTipoPremio]     = useState('digital');
  const [valorDiamante,  setValorDiamante]  = useState('');

  const [calcPresupuesto, setCalcPresupuesto] = useState('');
  const [nidos, setNidos]                   = useState([]);
  const [activeNidoId, setActiveNidoId]     = useState(null);
  const [activeNidoNombre, setActiveNidoNombre] = useState('');
  const [activeNidoAlcance, setActiveNidoAlcance] = useState('');
  const [nidoNombreInput, setNidoNombreInput] = useState('');
  const [nidoAlcanceInput, setNidoAlcanceInput] = useState('');
  const [creandoNido, setCreandoNido]       = useState(false);
  const [nidoMsg, setNidoMsg]              = useState('');

  const isDiamante     = tier === 'DIAMANTE';
  const diamanteConfig = isDiamante && valorDiamante
    ? DIAMANTE_CONFIG[parseInt(valorDiamante)]
    : null;
  const costeLunas = valor ? (COSTE_LUNAS[tier]?.[valor] || 0) : 0;
  const valorEuros = (valor && valor !== 'ENVIO_GRATIS' && valor !== '100pct')
    ? parseFloat(valor) : null;

  const compraMinimaNum = compraMinima ? parseFloat(compraMinima) : null;
  const ratioOk = !compraMinimaNum || !valorEuros || compraMinimaNum <= valorEuros * 10;

  const calcNum     = parseFloat(calcPresupuesto) || 0;
  const calcSeguro  = calcNum > 0 ? Math.min(calcNum * 0.20, 60) : 0;
  const calcDisp    = calcNum;
  const calcPlata   = calcDisp / 0.50;
  const calcOro     = calcDisp / 0.80;
  const calcDiam    = calcDisp / 0.80;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const loadTarjetas = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('comercio_cupones')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setTarjetas(data || []);
    setLoading(false);
  }, [userId]);

  const loadNidos = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('comercio_nidos')
      .select(`
        *,
        comercio_cupones (
          id, tipo_tarjeta, valor_euros,
          emision_total, emision_usada
        )
      `)
      .eq('comercio_user_id', userId)
      .order('created_at', { ascending: false });
    setNidos(data || []);
  }, [userId]);

  useEffect(() => { loadTarjetas(); loadNidos(); }, [loadTarjetas, loadNidos]);

  const [bsSolicitud, setBsSolicitud] = useState(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('bs_solicitudes')
      .select('razon_social, email, telefono, web_url')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => { if (data) setBsSolicitud(data); });
  }, [userId]);

  const resetForm = () => {
    setEditando(null);
    setTier('PLATA'); setValor(''); setCompraMinima('');
    setDescripcion(''); setBannerUrl('');
    setPalabraClave1(''); setPalabraClave2('');
    setEmisionTotal('');
    setNombrePremio(''); setTipoPremio('digital'); setValorDiamante('');
    setCalcPresupuesto('');
    setActiveNidoId(null);
    setActiveNidoNombre('');
    setActiveNidoAlcance('');
    setMsg('');
  };

  const handleUploadBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 10 * 1024 * 1024) {
      setMsg('❌ Imagen demasiado grande. Máximo 10MB.');
      return;
    }
    setUploading(true);
    setUploadProgress('Subiendo imagen...');
    try {
      const safeFileName = `banners/${userId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const res = await fetch('https://cupones.bro7vision.workers.dev/upload-presigned', {
        method: 'POST',
        headers: {
          'x-file-name': safeFileName,
          'x-file-type': file.type,
        },
        body: file,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg('❌ Error subiendo imagen: ' + (data.error || 'desconocido'));
        return;
      }
      setBannerUrl(data.url);
      setMsg('✅ Imagen subida correctamente.');
    } catch (err) {
      console.error('[handleUploadBanner]', err);
      setMsg('❌ Error subiendo imagen: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleSave = async () => {
    setMsg('');

    if (isDiamante) {
      if (!valorDiamante || !nombrePremio.trim() || !descripcion.trim() || !emisionTotal) {
        setMsg('Completa el tier, nombre del premio, descripción y cantidad de unidades.'); return;
      }
      setSaving(true);
      const cfg = DIAMANTE_CONFIG[parseInt(valorDiamante)];
      const { error } = await supabase.from('diamante_catalogo').insert([{
        comercio_id:         userId,
        nombre_premio:       nombrePremio.trim(),
        descripcion:         descripcion.trim(),
        tipo:                tipoPremio,
        valor_pvp:           parseFloat(valorDiamante),
        tier:                parseInt(valorDiamante),
        descuento_pct:       cfg.descuento_pct,
        cantidad_inicial:    parseInt(emisionTotal),
        cantidad_disponible: parseInt(emisionTotal),
        estado:              'PENDIENTE',
        lunas_canje:         cfg.lunas_canje,
      }]);
      setSaving(false);
      if (error) { setMsg(`Error: ${error.message}`); return; }
      setMsg('✅ Premio Diamante enviado a revisión. El Estudio lo activará en breve.');
      resetForm();
      return;
    }

    if (!activeNidoId) {
      setMsg('Crea o selecciona un Nido antes de añadir tarjetas.');
      return;
    }

    if (!userId || !tier || !valor) {
      setMsg('Completa tier y valor.'); return;
    }
    if (tier === 'PLATA' && compraMinimaNum && !ratioOk) {
      setMsg(`La compra mínima no puede superar ${valorEuros ? valorEuros * 10 : '—'}€ (máx 10× el descuento).`); return;
    }
    if ((tier === 'ORO') && !emisionTotal) {
      setMsg('Indica el número de tarjetas que emites. Es obligatorio para Tarjetas Oro.'); return;
    }
    if (parseInt(emisionTotal) > 10) {
      setMsg('Máximo 10 tarjetas por tipo y valor por Fase Lunar.'); return;
    }

    setSaving(true);
    const comercioNombre = profile?.razon_social || profile?.alias || 'Comercio';
    const payload = {
      user_id:         userId,
      tipo_tarjeta:    tier === 'LUNA100' ? '100' : tier,
      valor_euros:     valor === 'ENVIO_GRATIS' ? 5 : valorEuros,
      coste_lunas:     costeLunas,
      compra_minima:   tier === 'PLATA' ? (compraMinimaNum?.toString() || null) : null,
      comercio_nombre: comercioNombre,
      descripcion:     descripcion || null,
      sector:          'PRODUCTO',
      banner_url:      bannerUrl  || null,
      nido_id:         activeNidoId,
      palabra_clave_1: palabraClave1 || null,
      palabra_clave_2: palabraClave2 || null,
      activo:          false,
      estado_canje:    'NIDO',
      emision_usada:   0,
      emision_total:   emisionTotal ? parseInt(emisionTotal) : null,
    };

    let error;
    if (editando) {
      ({ error } = await supabase.from('comercio_cupones').update(payload).eq('id', editando));
    } else {
      ({ error } = await supabase.from('comercio_cupones').insert(payload));
    }
    setSaving(false);
    if (error) { setMsg(`Error: ${error.message}`); return; }
    setMsg(editando ? '✅ Tarjeta actualizada.' : '✅ Tarjeta creada.');
    resetForm();
    loadTarjetas();
  };

  const handleEditar = (t) => {
    setEditando(t.id);
    const tierKey = t.tipo_tarjeta === '100' ? 'LUNA100' : t.tipo_tarjeta;
    setTier(tierKey);
    const valorKey = t.valor_euros != null ? String(t.valor_euros) : (t.tipo_tarjeta === '100' ? '100pct' : 'ENVIO_GRATIS');
    setValor(valorKey);
    setCompraMinima(t.compra_minima || '');
    setDescripcion(t.descripcion || '');
    setBannerUrl(t.banner_url || '');
    setActiveNidoId(t.nido_id || null);
    setPalabraClave1(t.palabra_clave_1 || '');
    setPalabraClave2(t.palabra_clave_2 || '');
    setEmisionTotal(t.emision_total ? String(t.emision_total) : '');
    setCalcPresupuesto('');
    setValorDiamante('');
    setNombrePremio('');
    setTipoPremio('digital');
    setMsg('');
  };

  const handleToggleActivo = async (t) => {
    await supabase.from('comercio_cupones')
      .update({ activo: !t.activo, estado_canje: !t.activo ? 'ACTIVO' : 'PAUSADO' })
      .eq('id', t.id);
    loadTarjetas();
  };

  const handleCrearNido = async () => {
    if (!nidoNombreInput.trim() || !nidoAlcanceInput) {
      setNidoMsg('Nombre y alcance son obligatorios.');
      return;
    }
    setCreandoNido(true);
    const { data, error } = await supabase
      .from('comercio_nidos')
      .insert({
        comercio_user_id: userId,
        nombre_nido:      nidoNombreInput.trim(),
        alcance:          nidoAlcanceInput,
      })
      .select()
      .single();
    setCreandoNido(false);
    if (error) { setNidoMsg(`Error: ${error.message}`); return; }
    setActiveNidoId(data.id);
    setActiveNidoNombre(data.nombre_nido);
    setActiveNidoAlcance(data.alcance);
    setNidoNombreInput('');
    setNidoAlcanceInput('');
    setNidoMsg('');
    loadNidos();
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '10px 14px',
    color: '#fff', fontSize: 13, fontFamily: HEADING,
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: 36,
  };

  const labelStyle = {
    fontSize: 10, fontWeight: 700, letterSpacing: 2,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
    marginBottom: 6, display: 'block',
  };

  return (
    <>
      <style>{`
        select option { background: #0d0d18; color: #fff; }
        .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
        .flip-card-inner.flipped { transform: rotateY(180deg); }
        .flip-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 16px; }
        .flip-face-back { transform: rotateY(180deg); }
        @keyframes shimmerCard {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
      <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto', fontFamily: HEADING }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <span style={{ fontSize: 36 }}>🎁</span>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>
            Tarjetas de Regalo
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', letterSpacing: 1 }}>
            Crea y gestiona tus tarjetas de descuento para los jugadores de Brovision
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Fila superior: formulario + preview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.2fr', gap: 32, alignItems: 'start' }}>

          {/* ── FORMULARIO ── */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 28,
          }}>
            {/* ── CALCULADORA ── */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: 24, marginBottom: 28,
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#67e8f9',
                letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 16px' }}>
                🧮 Calculadora de Tarjetas
              </h3>
              <div style={{ marginBottom: 16 }}>
                <span style={labelStyle}>Presupuesto de campaña (€)</span>
                <input
                  type="number" min="0" max="1000" step="1"
                  placeholder="Ej: 500"
                  value={calcPresupuesto}
                  onChange={e => setCalcPresupuesto(e.target.value)}
                  style={{ ...inputStyle, backgroundImage: 'none' }}
                />
              </div>

              {calcNum > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Seguro */}
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    padding: '10px 14px', background: 'rgba(248,113,113,0.08)',
                    border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                      🔒 Seguro publicitario (20%, máx 60€)
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#f87171' }}>
                      {calcSeguro.toFixed(2)}€
                    </span>
                  </div>

                  {/* Disponible para tarjetas */}
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    padding: '10px 14px', background: 'rgba(250,204,21,0.07)',
                    border: '1px solid rgba(250,204,21,0.15)', borderRadius: 10 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                      💰 Disponible para cubrir con tarjetas
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#facc15' }}>
                      {calcDisp.toFixed(2)}€
                    </span>
                  </div>

                  {/* Capacidad por tier */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 4 }}>
                    {[
                      { label: 'Luna Plata', ratio: '0.50', val: calcPlata, color: '#d0d8e8', bg: 'rgba(160,168,184,0.08)', border: 'rgba(160,168,184,0.2)' },
                      { label: 'Luna Oro', ratio: '0.80', val: calcOro, color: '#ffe566', bg: 'rgba(200,150,10,0.08)', border: 'rgba(200,150,10,0.2)' },
                      { label: 'Luna Diamante', ratio: '0.80', val: calcDiam, color: '#d090ff', bg: 'rgba(180,80,255,0.08)', border: 'rgba(180,80,255,0.2)' },
                    ].map(({ label, ratio, val, color, bg, border }) => (
                      <div key={label} style={{ padding: '12px 10px', background: bg,
                        border: `1px solid ${border}`, borderRadius: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)',
                          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color }}>
                          {val.toFixed(0)}€
                        </div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                          en tarjetas (×{ratio})
                        </div>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.6 }}>
                    Crea tus tarjetas por ese valor total y aplícalas desde el Carrito al confirmar tu campaña.
                  </p>
                </div>
              )}
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', letterSpacing: 3,
              textTransform: 'uppercase', margin: '0 0 24px' }}>
              {editando ? '✏️ Editar Tarjeta del Nido' : '+ Añadir Tarjeta al Nido'}
            </h3>

            {/* TIER */}
            <div style={{ marginBottom: 20 }}>
              <span style={labelStyle}>Tier</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.keys(LUNA_STYLES).map(t => {
                  const s = LUNA_STYLES[t];
                  const stateTier = t === '100' ? 'LUNA100' : t;
                  const active = tier === stateTier;
                  return (
                    <button key={t} onClick={() => { setTier(stateTier); setValor(''); }}
                      style={{
                        padding: '8px 16px', borderRadius: 20, fontSize: 11,
                        fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                        cursor: 'pointer', fontFamily: HEADING, transition: 'all 0.2s',
                        background: active ? `${s.color}33` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? s.color : 'rgba(255,255,255,0.1)'}`,
                        color: active ? s.color : 'rgba(255,255,255,0.4)',
                        boxShadow: active ? `0 0 16px ${s.color}44` : 'none',
                      }}>
                      {s.badge}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info económica por tier */}
            {tier === 'PLATA' && (
              <div style={{ marginBottom: 16, padding: '12px 16px',
                background: 'rgba(160,168,184,0.08)', border: '1px solid rgba(160,168,184,0.2)',
                borderRadius: 12 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                  💿 <strong style={{ color: '#d0d8e8' }}>Luna de Plata</strong> — El cliente recibe un descuento directo al presentar la tarjeta.
                  Establece una compra mínima razonable: máximo 10× el valor del descuento.
                  Tú ganas visita y venta asegurada.
                </p>
              </div>
            )}
            {tier === 'ORO' && (
              <div style={{ marginBottom: 16, padding: '12px 16px',
                background: 'rgba(200,150,10,0.08)', border: '1px solid rgba(200,150,10,0.2)',
                borderRadius: 12 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                  🥇 <strong style={{ color: '#ffe566' }}>Luna de Oro</strong> — El cliente usa la tarjeta como vale de compra libre (1€ = 1€).
                  Tú pagas la publicidad a precio reducido y honras el valor de la tarjeta en producto o servicio cuando el cliente venga.
                  Indica cuántas tarjetas emites — ese es tu compromiso real de stock.
                </p>
              </div>
            )}
            {tier === 'DIAMANTE' && (
              <div style={{ marginBottom: 16, padding: '12px 16px',
                background: 'rgba(180,80,255,0.08)', border: '1px solid rgba(180,80,255,0.2)',
                borderRadius: 12 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                  💎 <strong style={{ color: '#d090ff' }}>Luna Diamante</strong> — Publica un producto o pack concreto (nuevo, reacondicionado, excedente).
                  El usuario canjea Lunas por ese premio. Tú pagas solo el 20% de su valor en publicidad
                  (mínimo garantizado 40€). El Estudio revisa y activa tu premio antes de publicarlo.
                </p>
              </div>
            )}
            {tier === 'LUNA100' && (
              <div style={{ marginBottom: 16, padding: '12px 16px',
                background: 'rgba(180,80,220,0.08)', border: '1px solid rgba(180,80,220,0.2)',
                borderRadius: 12 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                  🌙 <strong style={{ color: '#c080ff' }}>Luna 100</strong> — Descuento del 100% en el producto o servicio que describas.
                  Ideal para muestras, pruebas gratuitas o experiencias de captación.
                </p>
              </div>
            )}

            {/* DIAMANTE — formulario completo */}
            {isDiamante ? (
              <>
                <div style={{ marginBottom: 20 }}>
                  <span style={labelStyle}>Valor del Premio</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['200','500','1000'].map(v => {
                      const cfg = DIAMANTE_CONFIG[parseInt(v)];
                      const active = valorDiamante === v;
                      return (
                        <button key={v} onClick={() => setValorDiamante(v)}
                          style={{
                            flex: 1, padding: '10px 8px', borderRadius: 12, fontSize: 11,
                            fontWeight: 700, cursor: 'pointer', fontFamily: HEADING,
                            background: active ? 'rgba(180,80,255,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${active ? '#9040e0' : 'rgba(255,255,255,0.1)'}`,
                            color: active ? '#d090ff' : 'rgba(255,255,255,0.4)',
                            textAlign: 'center',
                          }}>
                          <div style={{ fontSize: 15, fontWeight: 900 }}>{parseInt(v).toLocaleString()}€</div>
                          <div style={{ fontSize: 9, marginTop: 3, opacity: 0.7 }}>
                            -{cfg.descuento_pct}% pub · {cfg.cash}€ cash
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <span style={labelStyle}>Nombre del premio *</span>
                  <input type="text" placeholder="Ej: iPhone 13 128GB reacondicionado A+"
                    value={nombrePremio} onChange={e => setNombrePremio(e.target.value)}
                    style={inputStyle} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <span style={labelStyle}>Tipo</span>
                  <select value={tipoPremio} onChange={e => setTipoPremio(e.target.value)} style={inputStyle}>
                    <option value="digital">Digital</option>
                    <option value="servicio">Servicio / Físico</option>
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <span style={labelStyle}>Descripción del producto * (visible al canjear)</span>
                  <textarea rows={4}
                    placeholder="Describe el producto: marca, modelo, estado, condiciones de entrega..."
                    value={descripcion} onChange={e => setDescripcion(e.target.value)}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <span style={labelStyle}>Unidades disponibles *</span>
                  <input type="number" min="1" max="10" placeholder="Ej: 2"
                    value={emisionTotal} onChange={e => setEmisionTotal(e.target.value)}
                    style={inputStyle} />
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
                    Cada unidad = un canje. El sistema las descuenta automáticamente.
                  </p>
                </div>

                {valorDiamante && diamanteConfig && (
                  <div style={{ padding: '14px 18px', background: 'rgba(180,80,255,0.07)',
                    border: '1px solid rgba(180,80,255,0.2)', borderRadius: 12, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Valor en especie</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#d090ff' }}>{valorDiamante}€</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Cash a Brovision (20%)</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{diamanteConfig.cash}€</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Descuento publicitario obtenido</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#4ade80' }}>+{diamanteConfig.descuento_pct}%</span>
                    </div>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 10, marginBottom: 0 }}>
                      El Estudio revisará tu premio antes de publicarlo. Estado inicial: PENDIENTE.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* VALOR — selector para PLATA / ORO / LUNA100 */}
                <div style={{ marginBottom: 20 }}>
                  <span style={labelStyle}>Valor</span>
                  <select value={valor} onChange={e => setValor(e.target.value)} style={inputStyle}>
                    <option value="">— Selecciona valor —</option>
                    {(VALORES_POR_TIER[tier] || []).map(v => (
                      <option key={v} value={v}>{LABEL_VALOR[v] || v}</option>
                    ))}
                  </select>
                </div>

                {/* COMPRA MÍNIMA — solo PLATA con validación */}
                {tier === 'PLATA' && (
                  <div style={{ marginBottom: 20 }}>
                    <span style={labelStyle}>Compra mínima en euros</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={valorEuros ? `Máx. ${valorEuros * 10}€` : 'Ej: 30'}
                      value={compraMinima}
                      onChange={e => setCompraMinima(e.target.value)}
                      style={{
                        ...inputStyle,
                        borderColor: !ratioOk ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)',
                      }}
                    />
                    {!ratioOk && (
                      <p style={{ fontSize: 10, color: '#f87171', marginTop: 6 }}>
                        La compra mínima no puede superar {valorEuros ? valorEuros * 10 : '—'}€ (máx 10× el descuento).
                      </p>
                    )}
                  </div>
                )}

                {/* EMISIÓN TOTAL — PLATA y ORO */}
                {tier !== 'LUNA100' && (
                  <div style={{ marginBottom: 20 }}>
                    <span style={labelStyle}>
                      {tier === 'ORO' ? 'Tarjetas a emitir * (máx 10)' : 'Tarjetas a emitir (máx 10)'}
                    </span>
                    <input
                      type="number" min="1" max="10"
                      placeholder={tier === 'ORO' ? 'Obligatorio · Máx. 10' : 'Opcional · Máx. 10'}
                      value={emisionTotal}
                      onChange={e => setEmisionTotal(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                )}
              </>
            )}

            {/* DESCRIPCIÓN */}
            <div style={{ marginBottom: 20 }}>
              <span style={labelStyle}>Descripción (aparece al girar la tarjeta)</span>
              <textarea
                rows={3}
                placeholder="Describe tu oferta, condiciones o mensaje para el usuario..."
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {/* PALABRAS CLAVE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <span style={labelStyle}>Palabra clave 1</span>
                <input type="text" placeholder="Pública" value={palabraClave1}
                  onChange={e => setPalabraClave1(e.target.value.toUpperCase())} style={inputStyle} />
              </div>
              <div>
                <span style={labelStyle}>Palabra clave 2 (secreta)</span>
                <input type="text" placeholder="Secreta" value={palabraClave2}
                  onChange={e => setPalabraClave2(e.target.value.toUpperCase())} style={inputStyle} />
              </div>
            </div>

            {/* BANNER */}
            <div style={{ marginBottom: 20 }}>
              <span style={labelStyle}>Imagen de fondo (300×450px · formato 2:3)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadBanner}
                disabled={uploading}
                style={{ ...inputStyle, padding: '8px 14px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }}
              />
              {uploading && (
                <span style={{ fontSize: 11, color: '#facc15', marginTop: 6, display: 'block', letterSpacing: 1 }}>
                  ⏳ {uploadProgress}
                </span>
              )}
              {bannerUrl && !uploading && (
                <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', height: 100, position: 'relative' }}>
                  <img src={bannerUrl} alt="preview banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => setBannerUrl('')}
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 6, color: '#f87171', fontSize: 10, fontWeight: 700,
                      padding: '3px 8px', cursor: 'pointer', fontFamily: HEADING,
                    }}>
                    QUITAR
                  </button>
                </div>
              )}
            </div>

            {/* NIDO ACTIVO — indicador */}
            {activeNidoId ? (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(74,222,128,0.08)',
                border: '1px solid rgba(74,222,128,0.2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>
                  🧺 {activeNidoNombre} · {activeNidoAlcance}
                </span>
                <button onClick={() => {
                  setActiveNidoId(null);
                  setActiveNidoNombre('');
                  setActiveNidoAlcance('');
                }} style={{
                  fontSize: 10, color: 'rgba(255,255,255,0.4)',
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: HEADING,
                }}>
                  CAMBIAR
                </button>
              </div>
            ) : (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(248,113,113,0.06)',
                border: '1px solid rgba(248,113,113,0.15)',
              }}>
                <span style={{ fontSize: 11, color: 'rgba(248,113,113,0.7)' }}>
                  ⚠️ Crea o selecciona un Nido en el panel lateral para añadir tarjetas.
                </span>
              </div>
            )}

            {/* ACCIONES */}
            {msg && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 10,
                background: msg.startsWith('✅') ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                border: `1px solid ${msg.startsWith('✅') ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                color: msg.startsWith('✅') ? '#4ade80' : '#f87171',
                fontSize: 12, fontWeight: 700,
              }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSave} disabled={saving || (!editando && !activeNidoId)}
                style={{
                  flex: 1, padding: '13px 0',
                  background: saving ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.2)',
                  border: '1px solid rgba(168,85,247,0.5)',
                  borderRadius: 12, color: '#c084fc',
                  fontSize: 12, fontWeight: 900, letterSpacing: 2,
                  textTransform: 'uppercase', cursor: saving || (!editando && !activeNidoId) ? 'not-allowed' : 'pointer',
                  fontFamily: HEADING,
                }}>
                {saving ? 'GUARDANDO...' : editando ? 'ACTUALIZAR' : 'AÑADIR AL NIDO'}
              </button>
              {editando && (
                <button onClick={resetForm}
                  style={{
                    padding: '13px 20px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                    color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', fontFamily: HEADING, letterSpacing: 1,
                  }}>
                  CANCELAR
                </button>
              )}
            </div>
          </div>

          {/* ── PREVIEW LIVE ── */}
          <div style={{ position: 'sticky', top: 20 }}>
            <span style={{ ...labelStyle, marginBottom: 16, display: 'block' }}>Vista previa</span>
            {(() => {
              const estilo = LUNA_STYLES[tier === 'LUNA100' ? '100' : tier] || LUNA_STYLES.PLATA;
              const valorDisplay = (valor && valor !== 'ENVIO_GRATIS' && valor !== '100pct')
                ? parseFloat(valor) : null;
              const comercioNombrePreview = profile?.razon_social || profile?.alias || 'Comercio';
              return (
<div style={{
  height: 460, width: '100%',
  perspective: '1000px', cursor: 'pointer',
  overflow: 'hidden', borderRadius: 16,
}}
  onClick={() => setFlippedId(flippedId === 'preview' ? null : 'preview')}>
  <div className={`flip-card-inner${flippedId === 'preview' ? ' flipped' : ''}`}
    style={{ height: '100%' }}>

    {/* ── CARA A ── */}
    <div className="flip-face" style={{
      borderRadius: 16, overflow: 'hidden',
    }}>
      {/* Imagen fondo del comercio */}
      {bannerUrl && (
        <img src={bannerUrl} alt="fondo"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0,
          }} />
      )}

      {/* Overlay asset PNG transparente */}
      {(() => {
        const tierAssetKey = tier === 'LUNA100' ? '100' : tier;
        let valorKey;
        if (tier === 'DIAMANTE') {
          valorKey = valorDiamante || Object.keys(CARD_ASSETS.DIAMANTE)[0];
        } else if (tier === 'ORO') {
          valorKey = valor || Object.keys(CARD_ASSETS.ORO)[0];
        } else if (tier === 'PLATA') {
          valorKey = valor || 'ENVIO_GRATIS';
        } else if (tier === 'LUNA100') {
          valorKey = '100pct';
        } else {
          valorKey = 'ENVIO_GRATIS';
        }
        const assetName = CARD_ASSETS[tierAssetKey]?.[valorKey];
        return assetName ? (
          <img
            src={`/images/cards/${assetName}.webp`}
            alt={estilo.badge}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', zIndex: 1,
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: estilo.bgCard, fontSize: 48,
          }}>🌙</div>
        );
      })()}
    </div>

    {/* ── CARA B ── */}
                    <div
                      className="flip-face flip-face-back"
                      style={{ borderRadius: 16, overflow: 'hidden' }}
                    >
                      <img src="/images/cards/card-back.webp" alt="reverso"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />

                      <div style={{
                        position: 'absolute', inset: 0, zIndex: 1,
                        background: 'linear-gradient(170deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.75) 100%)',
                      }} />

                      <div style={{
                        position: 'absolute', inset: 0, zIndex: 2,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'space-between',
                        padding: '18px 14px 14px',
                      }}>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)',
                          textAlign: 'center', lineHeight: 1.6, fontWeight: 600, margin: 0 }}>
                          {(() => {
                            const tierKey = tier === 'LUNA100' ? '100' : tier;
                            const fn = REVERSO_INTRO[tierKey];
                            return typeof fn === 'function'
                              ? fn(valor !== 'ENVIO_GRATIS' && valor !== '100pct' ? valor : '—')
                              : fn || '';
                          })()}
                        </p>

                        <div style={{ width: '80%', height: 0.5,
                          background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }} />

                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 900, color: '#fff',
                            textTransform: 'uppercase', letterSpacing: 1 }}>
                            {bsSolicitud?.razon_social || 'Nombre del comercio'}
                          </span>
                          {bsSolicitud?.web_url && (
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>
                              🌐 {bsSolicitud.web_url.replace(/^https?:\/\//, '')}
                            </span>
                          )}
                          {bsSolicitud?.telefono && (
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>
                              📞 {bsSolicitud.telefono}
                            </span>
                          )}
                          {bsSolicitud?.email && (
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
                              ✉️ {bsSolicitud.email}
                            </span>
                          )}
                        </div>

                        <div style={{ width: '80%', height: 0.5,
                          background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }} />

                        {descripcion ? (
                          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)',
                            textAlign: 'center', lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>
                            {descripcion}
                          </p>
                        ) : (
                          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)',
                            textAlign: 'center', fontStyle: 'italic', margin: 0 }}>
                            Tu descripción aparecerá aquí...
                          </p>
                        )}

                        {tier === 'PLATA' && compraMinima && (
                          <div style={{ background: 'rgba(255,255,255,0.1)',
                            border: '0.5px solid rgba(255,255,255,0.2)',
                            borderRadius: 8, padding: '3px 10px',
                            fontSize: 9, color: '#fff', fontWeight: 700 }}>
                            Compra mínima: {compraMinima}
                          </div>
                        )}

                        {palabraClave1 && (
                          <div style={{ background: 'rgba(255,255,255,0.08)',
                            border: '0.5px solid rgba(255,255,255,0.2)',
                            borderRadius: 8, padding: '3px 10px', textAlign: 'center' }}>
                            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)',
                              display: 'block', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
                              Presenta esta palabra
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: 3 }}>
                              {palabraClave1}
                            </span>
                          </div>
                        )}

                        <button style={{
                          width: '100%', padding: '11px 0',
                          background: (LUNA_STYLES[tier === 'LUNA100' ? '100' : tier] || LUNA_STYLES.PLATA).color,
                          color: '#000', fontWeight: 900, fontSize: 11,
                          border: 'none', borderRadius: 10, cursor: 'default',
                          textTransform: 'uppercase', letterSpacing: '0.12em',
                          fontFamily: HEADING, opacity: 0.8,
                        }}>
                          CANJEAR →
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 10, letterSpacing: 1 }}>
              Toca la tarjeta para ver el reverso
            </p>
          </div>

          {/* ── TERMINAL PRE-NIDO ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Crear Nido */}
            {!activeNidoId ? (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: 24,
              }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#facc15',
                  letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 20px' }}>
                  🧺 Nuevo Nido
                </h3>

                <div style={{ marginBottom: 16 }}>
                  <span style={labelStyle}>Nombre del Nido *</span>
                  <input
                    type="text"
                    placeholder="Ej: Nido Verano 2026"
                    value={nidoNombreInput}
                    onChange={e => setNidoNombreInput(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <span style={labelStyle}>Alcance geográfico *</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['LOCAL','CERCANIAS','NACIONAL','INTERNACIONAL'].map(op => (
                      <button key={op} onClick={() => setNidoAlcanceInput(op)}
                        style={{
                          padding: '8px 14px', borderRadius: 10, fontSize: 11,
                          fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                          cursor: 'pointer', fontFamily: HEADING, textAlign: 'left',
                          transition: 'all 0.2s',
                          background: nidoAlcanceInput === op
                            ? 'rgba(0,229,212,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${nidoAlcanceInput === op
                            ? '#00e5d4' : 'rgba(255,255,255,0.1)'}`,
                          color: nidoAlcanceInput === op
                            ? '#00e5d4' : 'rgba(255,255,255,0.4)',
                        }}>
                        {op === 'LOCAL' && '📍 Local'}
                        {op === 'CERCANIAS' && '🗺️ Cercanías'}
                        {op === 'NACIONAL' && '🇪🇸 Nacional'}
                        {op === 'INTERNACIONAL' && '🌍 Internacional'}
                      </button>
                    ))}
                  </div>
                </div>

                {nidoMsg && (
                  <p style={{ fontSize: 11, color: '#f87171', marginBottom: 12 }}>{nidoMsg}</p>
                )}

                <button onClick={handleCrearNido} disabled={creandoNido}
                  style={{
                    width: '100%', padding: '12px 0',
                    background: creandoNido
                      ? 'rgba(250,204,21,0.1)' : 'rgba(250,204,21,0.18)',
                    border: '1px solid rgba(250,204,21,0.4)',
                    borderRadius: 12, color: '#facc15',
                    fontSize: 12, fontWeight: 900, letterSpacing: 2,
                    textTransform: 'uppercase', cursor: creandoNido ? 'not-allowed' : 'pointer',
                    fontFamily: HEADING,
                  }}>
                  {creandoNido ? 'CREANDO...' : 'CREAR NIDO'}
                </button>
              </div>
            ) : (
              /* Nido activo — acumulador */
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: 20, padding: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 12, fontWeight: 700, color: '#4ade80',
                      letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 4px' }}>
                      🧺 {activeNidoNombre}
                    </h3>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)',
                      letterSpacing: 2, textTransform: 'uppercase' }}>
                      {activeNidoAlcance}
                    </span>
                  </div>
                  <button onClick={() => {
                    setActiveNidoId(null);
                    setActiveNidoNombre('');
                    setActiveNidoAlcance('');
                  }} style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.3)',
                    background: 'none', border: 'none', cursor: 'pointer', fontFamily: HEADING,
                  }}>
                    CAMBIAR
                  </button>
                </div>

                {/* Tarjetas en este nido */}
                {(() => {
                  const enNido = tarjetas.filter(t => t.nido_id === activeNidoId);
                  const cobertura = enNido.reduce((sum, t) => {
                    const euros = parseFloat(t.valor_euros) || 5;
                    const ratio = t.tipo_tarjeta === 'PLATA' ? 0.50 : 0.80;
                    return sum + euros * (t.emision_total || 1) * ratio;
                  }, 0);
                  return (
                    <>
                      {enNido.length === 0 ? (
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)',
                          textAlign: 'center', padding: '20px 0' }}>
                          Aún no hay tarjetas en este Nido.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                          {enNido.map(t => {
                            const ts = LUNA_STYLES[t.tipo_tarjeta] || LUNA_STYLES.PLATA;
                            return (
                              <div key={t.id} style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', padding: '8px 12px',
                                background: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${ts.color}33`,
                                borderRadius: 10,
                              }}>
                                <span style={{ fontSize: 11, color: ts.color, fontWeight: 700 }}>
                                  {ts.badge}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>
                                  {t.valor_euros != null ? `${t.valor_euros}€` : '—'}
                                </span>
                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                                  ×{t.emision_total || 1}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {enNido.length > 0 && (
                        <div style={{ padding: '10px 14px', borderRadius: 10,
                          background: 'rgba(74,222,128,0.07)',
                          border: '1px solid rgba(74,222,128,0.2)',
                          display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                            Cobertura en espacios
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 900, color: '#4ade80' }}>
                            {cobertura.toFixed(2)}€
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Mis Nidos */}
            {nidos.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20, padding: 24,
              }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa',
                  letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 16px' }}>
                  Mis Nidos ({nidos.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {nidos.map(n => {
                    const tarjetasNido = n.comercio_cupones || [];
                    const cobertura = tarjetasNido.reduce((sum, t) => {
                      const euros = parseFloat(t.valor_euros) || 5;
                      const ratio = t.tipo_tarjeta === 'PLATA' ? 0.50 : 0.80;
                      return sum + euros * (t.emision_total || 1) * ratio;
                    }, 0);
                    const isActive = n.id === activeNidoId;
                    return (
                      <div key={n.id}
                        onClick={() => {
                          setActiveNidoId(n.id);
                          setActiveNidoNombre(n.nombre_nido);
                          setActiveNidoAlcance(n.alcance);
                        }}
                        style={{
                          padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                          background: isActive
                            ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isActive
                            ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
                          transition: 'all 0.2s',
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700,
                            color: isActive ? '#4ade80' : '#fff' }}>
                            🌙 {n.nombre_nido}
                          </span>
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: 1,
                            textTransform: 'uppercase', padding: '2px 8px',
                            borderRadius: 20,
                            background: n.activo
                              ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                            color: n.activo ? '#4ade80' : 'rgba(255,255,255,0.3)',
                          }}>
                            {n.activo ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)',
                            textTransform: 'uppercase', letterSpacing: 1 }}>
                            {n.alcance} · {tarjetasNido.length} tarjetas
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>
                            {cobertura.toFixed(0)}€
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Fila inferior: listado completo */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#67e8f9', letterSpacing: 3,
            textTransform: 'uppercase', margin: '0 0 20px' }}>
            Mis Tarjetas ({tarjetas.length})
          </h3>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Cargando...</p>
          ) : tarjetas.length === 0 ? (
            <div style={{
              padding: 40, textAlign: 'center',
              border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16,
            }}>
              <span style={{ fontSize: 32 }}>🌙</span>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 12 }}>
                Aún no tienes tarjetas creadas.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tarjetas.map(t => {
                const ts = LUNA_STYLES[t.tipo_tarjeta] || LUNA_STYLES.PLATA;
                return (
                  <div key={t.id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${t.activo ? ts.color + '55' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 14, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16,
                    opacity: t.activo ? 1 : 0.5,
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(0,0,0,0.4)',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24,
                    }}>
                      {t.banner_url
                        ? <img src={t.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '🌙'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 8, fontWeight: 700, letterSpacing: 2,
                          textTransform: 'uppercase', color: ts.color,
                          border: `0.5px solid ${ts.color}`,
                          borderRadius: 20, padding: '1px 8px',
                          background: `${ts.color}22`,
                        }}>
                          {ts.badge}
                        </span>
                        {(() => {
                          const nido = nidos.find(n => n.id === t.nido_id);
                          return nido ? (
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase' }}>
                              🧺 {nido.nombre_nido}
                            </span>
                          ) : null;
                        })()}
                        <span style={{ fontSize: 18, fontWeight: 900, color: ts.color, fontFamily: HEADING }}>
                          {t.valor_euros != null ? `${t.valor_euros}€` : LABEL_VALOR[t.tipo_tarjeta === '100' ? '100pct' : 'ENVIO_GRATIS']}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                          🌙 {(t.coste_lunas || 0).toLocaleString()} Lunas
                        </span>
                        {t.emision_total && (
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                            · {t.emision_total - (t.emision_usada || 0)} restantes
                          </span>
                        )}
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: t.activo ? '#4ade80' : 'rgba(255,255,255,0.3)',
                        }}>
                          · {t.activo ? 'ACTIVA' : 'PAUSADA'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleEditar(t)}
                        style={{
                          padding: '7px 14px', borderRadius: 8, fontSize: 11,
                          fontWeight: 700, cursor: 'pointer', fontFamily: HEADING,
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: 'rgba(255,255,255,0.6)', letterSpacing: 1,
                        }}>
                        EDITAR
                      </button>
                      <button onClick={() => handleToggleActivo(t)}
                        style={{
                          padding: '7px 14px', borderRadius: 8, fontSize: 11,
                          fontWeight: 700, cursor: 'pointer', fontFamily: HEADING,
                          background: t.activo ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)',
                          border: `1px solid ${t.activo ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'}`,
                          color: t.activo ? '#f87171' : '#4ade80', letterSpacing: 1,
                        }}>
                        {t.activo ? 'PAUSAR' : 'ACTIVAR'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
    </>
  );
}