// src/components/backstage/TarjetasRegalo.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const HEADING = "'Noto Sans', sans-serif";

const CATALOGO_NIDOS = [
  { tipo_tarjeta: 'LUNA100',  denominacion: 0,    cantidad_total: 20,  label: 'Luna 100%',      emoji: '🌙' },
  { tipo_tarjeta: 'PLATA',    denominacion: 3,    cantidad_total: 555, label: 'Plata 3€',       emoji: '🥈' },
  { tipo_tarjeta: 'PLATA',    denominacion: 5,    cantidad_total: 333, label: 'Plata 5€',       emoji: '🥈' },
  { tipo_tarjeta: 'PLATA',    denominacion: 7,    cantidad_total: 238, label: 'Envío Gratis',   emoji: '📦' },
  { tipo_tarjeta: 'PLATA',    denominacion: 10,   cantidad_total: 166, label: 'Plata 10€',      emoji: '🥈' },
  { tipo_tarjeta: 'PLATA',    denominacion: 20,   cantidad_total: 83,  label: 'Plata 20€',      emoji: '🥈' },
  { tipo_tarjeta: 'PLATA',    denominacion: 40,   cantidad_total: 41,  label: 'Plata 40€',      emoji: '🥈' },
  { tipo_tarjeta: 'PLATA',    denominacion: 60,   cantidad_total: 27,  label: 'Plata 60€',      emoji: '🥈' },
  { tipo_tarjeta: 'PLATA',    denominacion: 100,  cantidad_total: 16,  label: 'Plata 100€',     emoji: '🥈' },
  { tipo_tarjeta: 'PLATA',    denominacion: 200,  cantidad_total: 8,   label: 'Plata 200€',     emoji: '🥈' },
  { tipo_tarjeta: 'ORO',      denominacion: 5,    cantidad_total: 222, label: 'Oro 5€',         emoji: '🥇' },
  { tipo_tarjeta: 'ORO',      denominacion: 10,   cantidad_total: 111, label: 'Oro 10€',        emoji: '🥇' },
  { tipo_tarjeta: 'ORO',      denominacion: 20,   cantidad_total: 55,  label: 'Oro 20€',        emoji: '🥇' },
  { tipo_tarjeta: 'ORO',      denominacion: 40,   cantidad_total: 27,  label: 'Oro 40€',        emoji: '🥇' },
  { tipo_tarjeta: 'ORO',      denominacion: 60,   cantidad_total: 18,  label: 'Oro 60€',        emoji: '🥇' },
  { tipo_tarjeta: 'ORO',      denominacion: 100,  cantidad_total: 11,  label: 'Oro 100€',       emoji: '🥇' },
  { tipo_tarjeta: 'ORO',      denominacion: 200,  cantidad_total: 5,   label: 'Oro 200€',       emoji: '🥇' },
  { tipo_tarjeta: 'DIAMANTE', denominacion: 200,  cantidad_total: 6,   label: 'Diamante 200€',  emoji: '💎' },
  { tipo_tarjeta: 'DIAMANTE', denominacion: 500,  cantidad_total: 2,   label: 'Diamante 500€',  emoji: '💎' },
  { tipo_tarjeta: 'DIAMANTE', denominacion: 1000, cantidad_total: 1,   label: 'Diamante 1000€', emoji: '💎' },
];

const RATIO = { PLATA: 0.60, ORO: 0.90, DIAMANTE: 0.80, LUNA100: 0 };

const LUNA_STYLES = {
  PLATA: {
    bgCard: 'linear-gradient(170deg, #e8eaf0 0%, #f8f9fc 40%, #d0d4e0 70%, #c8ccd8 100%)',
    color: '#4a5068', colorText: '#2a3048', badge: 'Luna de Plata',
    lunasBg: 'rgba(160,168,184,0.15)', lunasBorder: 'rgba(160,168,184,0.4)',
  },
  ORO: {
    bgCard: 'linear-gradient(170deg, #f5e6b0 0%, #fdf5d0 40%, #e8c870 70%, #d4a830 100%)',
    color: '#f5b800', colorText: '#5a3e00', badge: 'Luna de Oro',
    lunasBg: 'rgba(255,200,10,0.15)', lunasBorder: 'rgba(255,200,10,0.4)',
  },
  DIAMANTE: {
    bgCard: 'linear-gradient(170deg, #1a0a2e 0%, #2d1050 40%, #4a1878 70%, #1a0838 100%)',
    color: '#d090ff', colorText: '#f0d0ff', badge: 'Luna de Diamante',
    lunasBg: 'rgba(180,80,255,0.15)', lunasBorder: 'rgba(180,80,255,0.4)',
  },
  LUNA100: {
    bgCard: 'linear-gradient(170deg, #ffffff 0%, #f8f0ff 30%, #fff0f8 60%, #f0f8ff 100%)',
    color: '#8040a0', colorText: '#4a2060', badge: 'Luna 100',
    lunasBg: 'rgba(180,80,220,0.08)', lunasBorder: 'rgba(180,80,220,0.3)',
  },
};

const REVERSO_INTRO = {
  PLATA:    (val) => `Descuento de ${val}€ con compra mínima establecida por el comercio.`,
  ORO:      (val) => `Vale de ${val}€. Úsalo en cualquier compra de igual o superior importe.`,
  DIAMANTE: (val) => `Premio de ${val}€ en producto o pack descrito por el comercio.`,
  LUNA100:  ()    => `Descuento del 100% en el producto o servicio descrito a continuación.`,
};

const getEmojiImage = (tipo, denom) => {
  if (tipo === 'LUNA100') return '/images/cards/luna100_emoji.webp';
  if (tipo === 'PLATA' && denom === 7) return '/images/cards/envios_emoji.webp';
  return `/images/cards/${tipo.toLowerCase()}_emoji.webp`;
};

const getCardImage = (tipo, denom) => {
  if (tipo === 'LUNA100') return '/images/cards/luna100.webp';
  if (tipo === 'DIAMANTE') return `/images/cards/diamante-${denom}.webp`;
  if (tipo === 'ORO') return `/images/cards/oro-${denom}.webp`;
  if (tipo === 'PLATA') {
    if (denom === 7) return '/images/cards/plata-envio.webp';
    return `/images/cards/plata-${denom}.webp`;
  }
  return null;
};

export default function TarjetasRegalo({ profile }) {
  const [userId, setUserId]               = useState(null);
  const [nidosGuardados, setNidosGuardados] = useState([]);
  const [nidoSel, setNidoSel]             = useState(null);
  const [flipped, setFlipped]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [msg, setMsg]                     = useState('');
  const [calcTipo,     setCalcTipo]     = useState('');
  const [calcDenom,    setCalcDenom]    = useState('');
  const [calcCantidad, setCalcCantidad] = useState('');
  const [calcTipoOpen, setCalcTipoOpen] = useState(false);

  const [descripcion, setDescripcion]         = useState('');
  const [compraMinima, setCompraMinima]       = useState('');
  const [palabraClavePub, setPalabraClavePub] = useState('');
  const [claveSecreta, setClaveSecreta]         = useState('');
  const [imagenAprobacion, setImagenAprobacion] = useState('');
  const [caducaFecha, setCaducaFecha]           = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const loadNidos = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('comercio_nidos')
      .select('*')
      .eq('comercio_user_id', userId);
    setNidosGuardados(data || []);
  }, [userId]);

  useEffect(() => { loadNidos(); }, [loadNidos]);

  const getNidoGuardado = (cat) =>
    nidosGuardados.find(
      n => n.tipo_tarjeta === cat.tipo_tarjeta && Number(n.denominacion) === cat.denominacion
    );

  const handleSelectNido = (cat) => {
    setNidoSel(cat);
    setFlipped(false);
    setMsg('');
    const ex = getNidoGuardado(cat);
    setDescripcion(ex?.descripcion || '');
    setCompraMinima(ex?.compra_minima ? String(ex.compra_minima) : '');
    setPalabraClavePub(ex?.palabra_clave_pub || '');
    setClaveSecreta(ex?.clave_secreta || '');
    setImagenAprobacion(ex?.imagen_aprobacion || '');
    setCaducaFecha(ex?.caduca_fecha || '');
  };

  const handleUploadImagen = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 10 * 1024 * 1024) { setMsg('❌ Imagen demasiado grande. Máximo 10MB.'); return; }
    setUploading(true);
    try {
      const safeFileName = `banners/${userId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const res = await fetch('https://cupones.bro7vision.workers.dev/upload-presigned', {
        method: 'POST',
        headers: { 'x-file-name': safeFileName, 'x-file-type': file.type },
        body: file,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setMsg('❌ Error subiendo imagen.'); return; }
      setImagenAprobacion(data.url);
      setMsg('✅ Imagen subida.');
    } catch (err) {
      setMsg('❌ Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGuardar = async () => {
    if (!nidoSel || !userId) return;
    if (!descripcion.trim())     { setMsg('La descripción es obligatoria.'); return; }
    if (!palabraClavePub.trim()) { setMsg('La palabra clave pública es obligatoria.'); return; }
    if (!claveSecreta.trim())    { setMsg('La clave secreta es obligatoria.'); return; }
    setSaving(true);
    setMsg('');
    const isDiamante = nidoSel.tipo_tarjeta === 'DIAMANTE';
    const { error } = await supabase
      .from('comercio_nidos')
      .upsert({
        comercio_user_id:  userId,
        tipo_tarjeta:      nidoSel.tipo_tarjeta,
        denominacion:      nidoSel.denominacion,
        nombre_nido:       nidoSel.label,
        cantidad_total:    nidoSel.cantidad_total,
        descripcion:       descripcion.trim(),
        compra_minima:     nidoSel.tipo_tarjeta === 'PLATA' && compraMinima
                             ? parseFloat(compraMinima) : null,
        palabra_clave_pub: palabraClavePub.trim(),
        clave_secreta:     claveSecreta.trim(),
        imagen_aprobacion: isDiamante ? (imagenAprobacion || null) : null,
        caduca_fecha:      !isDiamante ? (caducaFecha || null) : null,
        activo:            false,
        aprobado:          !isDiamante,
        alcance:           null,
      }, {
        onConflict: 'comercio_user_id,tipo_tarjeta,denominacion',
        ignoreDuplicates: false,
      });
    setSaving(false);
    if (error) { setMsg(`❌ Error: ${error.message}`); return; }
    setMsg('✅ Nido guardado.');
    await loadNidos();
  };

  const calcDenomOpciones = CATALOGO_NIDOS
  .filter(c => c.tipo_tarjeta === calcTipo)
  .map(c => c.denominacion);

const calcMaxCantidad = CATALOGO_NIDOS.find(
  c => c.tipo_tarjeta === calcTipo && c.denominacion === Number(calcDenom)
)?.cantidad_total ?? 0;

const calcCoberturaRaw = (calcTipo && calcDenom && Number(calcCantidad) > 0)
  ? Math.floor(Number(calcDenom) * Number(calcCantidad) * RATIO[calcTipo])
  : 0;

const calcCobertura = Math.min(calcCoberturaRaw, 1000);
const calcCapped    = calcCoberturaRaw > 1000;

  const labelStyle = {
    fontSize: 10, fontWeight: 700, letterSpacing: 2,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
    marginBottom: 6, display: 'block',
  };
  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
    padding: '10px 14px', color: '#fff', fontSize: 13,
    fontFamily: HEADING, outline: 'none', boxSizing: 'border-box',
  };

  const ts = nidoSel ? (LUNA_STYLES[nidoSel.tipo_tarjeta] || LUNA_STYLES.PLATA) : null;

  return (
    <>
      <style>{`
        .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
        .flip-card-inner.flipped { transform: rotateY(180deg); }
        .flip-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 16px; overflow: hidden; }
        .flip-face-back { transform: rotateY(180deg); }
      `}</style>

      <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto', fontFamily: HEADING }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <span style={{ fontSize: 36 }}>🎁</span>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff',
              letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>
              Tarjetas de Regalo
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', letterSpacing: 1 }}>
              Configura los nidos de tarjetas que usarás en tus campañas
            </p>
          </div>
        </div>

        {/* 2-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 32, alignItems: 'start' }}>

          {/* LEFT — Catalog */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
              letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 14px' }}>
              🧺 Catálogo de Nidos (20)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
              {CATALOGO_NIDOS.map((cat) => {
                const guardado  = getNidoGuardado(cat);
                const isSel     = nidoSel?.tipo_tarjeta === cat.tipo_tarjeta
                                  && nidoSel?.denominacion === cat.denominacion;
                const estilo    = LUNA_STYLES[cat.tipo_tarjeta] || LUNA_STYLES.PLATA;
                const cobertura = cat.cantidad_total * cat.denominacion * (RATIO[cat.tipo_tarjeta] || 0);
                return (
                  <div key={`${cat.tipo_tarjeta}-${cat.denominacion}`}
                    onClick={() => handleSelectNido(cat)}
                    style={{
                      padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
                      background: isSel ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSel
                        ? estilo.color + '88'
                        : guardado ? estilo.color + '44'
                        : 'rgba(255,255,255,0.06)'}`,
                      display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
                    }}>
                    <img src={getEmojiImage(cat.tipo_tarjeta, cat.denominacion)} alt={cat.tipo_tarjeta}
                          style={{ width: 22, height: 22, flexShrink: 0, objectFit: 'contain' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700,
                          color: isSel ? '#fff' : 'rgba(255,255,255,0.65)' }}>
                          {cat.label}
                        </span>
                        {guardado && (
                          <span style={{
                            fontSize: 8, fontWeight: 700, color: '#4ade80',
                            background: 'rgba(74,222,128,0.1)',
                            border: '1px solid rgba(74,222,128,0.25)',
                            borderRadius: 20, padding: '1px 7px',
                            letterSpacing: 1, whiteSpace: 'nowrap',
                          }}>✓ OK</span>
                        )}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                        {cat.cantidad_total} uds
                        {cat.tipo_tarjeta !== 'LUNA100'
                          ? ` · ${cobertura.toFixed(0)}€ cobertura`
                          : ' · sin cobertura'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — Form + Preview + Calculator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {!nidoSel ? (
              <div style={{
                padding: 48, textAlign: 'center',
                border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 20,
              }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>←</span>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, margin: 0 }}>
                  Selecciona un nido del catálogo para configurarlo
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 28, alignItems: 'start' }}>

                {/* Form */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20, padding: 28,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <img src={getEmojiImage(nidoSel.tipo_tarjeta, nidoSel.denominacion)} alt={nidoSel.tipo_tarjeta}
                          style={{ width: 28, height: 28, flexShrink: 0, objectFit: 'contain' }} />
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 900, color: ts.color,
                        letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
                        {nidoSel.label}
                      </h3>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
                        {nidoSel.cantidad_total} unidades · ratio ×{RATIO[nidoSel.tipo_tarjeta]}
                      </p>
                    </div>
                  </div>

                  {nidoSel.tipo_tarjeta === 'DIAMANTE' && (
                    <div style={{
                      padding: '12px 16px', borderRadius: 12, marginBottom: 20,
                      background: 'rgba(180,80,255,0.06)',
                      border: '1px solid rgba(180,80,255,0.2)',
                    }}>
                      <p style={{ fontSize: 11, color: '#d090ff', margin: 0, lineHeight: 1.7 }}>
                        💎 Envía a <strong>hola@bro7vision.com</strong> la imagen del artículo
                        con descripción y denominación solicitada. El nido se activará tras aprobación.
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {nidoSel.tipo_tarjeta === 'PLATA' && (
                      <div>
                        <span style={labelStyle}>Compra mínima (€) — opcional</span>
                        <input type="number" min="0" step="0.5"
                          placeholder="Ej: 20"
                          value={compraMinima}
                          onChange={e => setCompraMinima(e.target.value)}
                          style={inputStyle} />
                      </div>
                    )}

                    <div>
                      <span style={labelStyle}>Descripción del premio *</span>
                      <textarea rows={3}
                        placeholder="Ej: Descuento aplicable en toda la tienda online..."
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
                    </div>

                    <div>
                      <span style={labelStyle}>Palabra clave pública *</span>
                      <input type="text"
                        placeholder="Visible en tu panel del comercio"
                        value={palabraClavePub}
                        onChange={e => setPalabraClavePub(e.target.value)}
                        style={inputStyle} />
                    </div>

                    <div>
                      <span style={labelStyle}>Clave secreta *</span>
                      <input type="text"
                        placeholder="Se envía al usuario en su sticker"
                        value={claveSecreta}
                        onChange={e => setClaveSecreta(e.target.value)}
                        style={inputStyle} />
                      <span style={{
                        fontSize: 9, color: 'rgba(255,255,255,0.2)',
                        letterSpacing: 1, marginTop: 4, display: 'block',
                      }}>
                        El usuario presenta esta clave al comercio para validar el canje.
                      </span>
                    </div>

                    {!isDiamante && (
                      <div>
                        <span style={labelStyle}>Fecha de caducidad del canje</span>
                        <input
                          type="date"
                          value={caducaFecha}
                          onChange={e => setCaducaFecha(e.target.value)}
                          style={{ ...inputStyle, backgroundImage: 'none', background: '#1a1a1a', color: '#fff', colorScheme: 'dark' }}
                        />
                        <span style={{
                          fontSize: 9, color: 'rgba(255,255,255,0.2)',
                          letterSpacing: 1, marginTop: 4, display: 'block',
                        }}>
                          Fecha límite para que el usuario canjee su tarjeta.
                        </span>
                      </div>
                    )}

                    {nidoSel.tipo_tarjeta === 'DIAMANTE' && (
                      <div>
                        <span style={labelStyle}>Imagen del artículo</span>
                        <div style={{ fontSize: 9, color: 'rgba(180,80,255,0.5)', marginBottom: 6, lineHeight: 1.4 }}>
                          Dimensiones recomendadas: 300×450px o 200×300px (ratio 2:3)
                        </div>
                        <label style={{
                          display: 'block', padding: '10px 14px',
                          background: 'rgba(180,80,255,0.05)',
                          border: '1px dashed rgba(180,80,255,0.3)',
                          borderRadius: 10, cursor: 'pointer',
                          fontSize: 11, color: '#d090ff', textAlign: 'center',
                        }}>
                          {uploading ? 'Subiendo...'
                            : imagenAprobacion ? '✅ Imagen cargada — clic para cambiar'
                            : '📷 Subir imagen del artículo'}
                          <input type="file" accept="image/*"
                            onChange={handleUploadImagen} style={{ display: 'none' }} />
                        </label>
                        {imagenAprobacion && (
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                            <img src={imagenAprobacion} alt="preview"
                              style={{ width: 200, height: 300, borderRadius: 10, objectFit: 'cover' }} />
                          </div>
                        )}
                      </div>
                    )}

                    {msg && (
                      <div style={{
                        padding: '10px 14px', borderRadius: 10,
                        background: msg.includes('✅') ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                        border: `1px solid ${msg.includes('✅') ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                        fontSize: 11,
                        color: msg.includes('✅') ? '#4ade80' : '#f87171',
                      }}>
                        {msg}
                      </div>
                    )}

                    <button onClick={handleGuardar} disabled={saving || uploading}
                      style={{
                        width: '100%', padding: '14px 0', border: 'none',
                        borderRadius: 12, fontFamily: HEADING,
                        background: (saving || uploading)
                          ? 'rgba(255,255,255,0.06)'
                          : (ts.color + 'cc'),
                        color: '#fff', fontSize: 12, fontWeight: 900,
                        letterSpacing: 3, textTransform: 'uppercase',
                        cursor: (saving || uploading) ? 'not-allowed' : 'pointer',
                      }}>
                      {saving ? 'GUARDANDO...' : '💾 ACTUALIZAR NIDO'}
                    </button>
                  </div>
                </div>

                {/* Flip card preview */}
                <div>
                  <h3 style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                    letterSpacing: 3, textTransform: 'uppercase',
                    margin: '0 0 12px', textAlign: 'center' }}>
                    👁 PREVIEW
                  </h3>
                  <div style={{ width: 200, height: 300, perspective: 1000, cursor: 'pointer', margin: '0 auto' }}
                    onClick={() => setFlipped(f => !f)}>
                    <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>

                      {/* ANVERSO */}
                      <div className="flip-face" style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(${getCardImage(nidoSel.tipo_tarjeta, nidoSel.denominacion)})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        padding: '14px 16px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      }}>
                      </div>

                      {/* REVERSO */}
                      <div className="flip-face flip-face-back" style={{
                        backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(/images/cards/card-back.webp)',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        padding: '14px 16px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 900, color: '#ffffff',
                            marginBottom: 4, lineHeight: 1.2, overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            textAlign: 'center',
                            textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                            {profile?.razon_social || profile?.alias || 'Comercio'}
                          </div>
                          {nidoSel.tipo_tarjeta === 'PLATA' && compraMinima && (
                            <div style={{ fontSize: 11, color: '#f5b800',
                              marginBottom: 4, letterSpacing: 1, textAlign: 'center' }}>
                              🛒 Compra mínima: {compraMinima}€
                            </div>
                          )}
                          {nidoSel.tipo_tarjeta === 'ORO' && (
                            <div style={{ fontSize: 11, color: '#f5b800',
                              marginBottom: 4, letterSpacing: 1, textAlign: 'center' }}>
                              🛒 Compra igual o superior a {nidoSel.denominacion}€
                            </div>
                          )}
                          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 2,
                            textTransform: 'uppercase', color: '#ffffff', marginBottom: 4,
                            textAlign: 'center',
                            textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                            🔐 Clave secreta
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 900, color: '#ffffff',
                            fontFamily: 'monospace', letterSpacing: 4, textAlign: 'center',
                            textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                            {claveSecreta || '— — — —'}
                          </div>
                          {descripcion && (
                            <p style={{
                              fontSize: 13, color: 'rgba(255,255,255,0.7)',
                              margin: '6px 0', lineHeight: 1.4,
                              overflow: 'hidden', display: '-webkit-box',
                              WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                            }}>
                              {descripcion}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            {nidoSel.tipo_tarjeta === 'DIAMANTE' && (
                              <button style={{
                                flex: 1, padding: '6px 0', borderRadius: 8,
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.08)',
                                color: '#fff', fontSize: 8, fontWeight: 700,
                                letterSpacing: 1, cursor: 'pointer',
                                fontFamily: HEADING, textTransform: 'uppercase',
                              }}>
                                Ver Artículo
                              </button>
                            )}
                            <button style={{
                              flex: 1, padding: '6px 0', borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.2)',
                              background: 'rgba(255,255,255,0.08)',
                              color: '#fff', fontSize: 8, fontWeight: 700,
                              letterSpacing: 1, cursor: 'pointer',
                              fontFamily: HEADING, textTransform: 'uppercase',
                            }}>
                              Canjear
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.8)',
                          margin: 0, lineHeight: 1.5,
                          textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                          {REVERSO_INTRO[nidoSel.tipo_tarjeta]?.(nidoSel.denominacion) || ''}
                        </p>
                      </div>

                    </div>
                  </div>
                  <p style={{ textAlign: 'center', fontSize: 8, marginTop: 6,
                    color: '#00e5d4', textShadow: '0 0 6px #00e5d4, 0 0 14px cyan' }}>
                    Clic para voltear
                  </p>
                </div>

              </div>
            )}

            {/* Calculator */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: 24,
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#67e8f9',
                letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 16px' }}>
                🧮 Calculadora de Cobertura
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Tipo — custom dropdown con emojis reales */}
                <div style={{ position: 'relative' }}>
                  <span style={labelStyle}>Tipo de tarjeta</span>
                  <div
                    onClick={() => setCalcTipoOpen(!calcTipoOpen)}
                    style={{ ...inputStyle, backgroundImage: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none' }}
                  >
                    {calcTipo ? (
                      <>
                        <img src={getEmojiImage(calcTipo, calcTipo === 'PLATA' ? 5 : calcTipo === 'ORO' ? 10 : 200)}
                          alt="" style={{ width: 18, height: 18, flexShrink: 0, objectFit: 'contain' }} />
                        <span style={{ color: '#fff' }}>
                          {calcTipo === 'PLATA' ? 'Plata (×0.60)' : calcTipo === 'ORO' ? 'Oro (×0.90)' : 'Diamante (×0.80)'}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.35)' }}>— Selecciona tipo —</span>
                    )}
                  </div>
                  {calcTipoOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                      marginTop: 4, borderRadius: 10, overflow: 'hidden',
                      background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.12)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}>
                      {[
                        { tipo: 'PLATA',   label: 'Plata (×0.60)',   denom: 5 },
                        { tipo: 'ORO',     label: 'Oro (×0.90)',     denom: 10 },
                        { tipo: 'DIAMANTE',label: 'Diamante (×0.80)',denom: 200 },
                      ].map(({ tipo, label, denom }) => (
                        <div key={tipo}
                          onClick={() => { setCalcTipo(tipo); setCalcTipoOpen(false); setCalcDenom(''); setCalcCantidad(''); }}
                          style={{
                            padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                            background: calcTipo === tipo ? 'rgba(255,255,255,0.08)' : 'transparent',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = calcTipo === tipo ? 'rgba(255,255,255,0.08)' : 'transparent'}
                        >
                          <img src={getEmojiImage(tipo, denom)}
                            alt="" style={{ width: 18, height: 18, flexShrink: 0, objectFit: 'contain' }} />
                          <span style={{ fontSize: 12, color: '#fff' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Denominación */}
                {calcTipo && (
                  <div>
                    <span style={labelStyle}>Denominación</span>
                    <select
                      value={calcDenom}
                      onChange={e => { setCalcDenom(e.target.value); setCalcCantidad(''); }}
                      style={{ ...inputStyle, backgroundImage: 'none', cursor: 'pointer',
                        background: '#1a1a1a', color: '#fff' }}
                    >
                      <option value=''>— Selecciona valor —</option>
                      {calcDenomOpciones.map(d => (
                        <option key={d} value={d}>
                          {calcTipo === 'PLATA' && d === 7 ? '📦 Envío gratis (7€)' : `${d}€`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Cantidad */}
                {calcDenom && (
                  <div>
                    <span style={labelStyle}>
                      Cantidad de tarjetas
                      {calcMaxCantidad > 0 && (
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, marginLeft: 6 }}>
                          (máx. {calcMaxCantidad} uds en catálogo)
                        </span>
                      )}
                    </span>
                    <input
                      type="number" min="1" max={calcMaxCantidad} step="1"
                      placeholder={`Ej: 20`}
                      value={calcCantidad}
                      onChange={e => setCalcCantidad(e.target.value)}
                      style={{ ...inputStyle, backgroundImage: 'none', background: '#1a1a1a', color: '#fff' }}
                    />
                  </div>
                )}

                {/* Resultado */}
                {calcCobertura > 0 && (
                  <div style={{
                    marginTop: 4, padding: '16px 20px', borderRadius: 14, textAlign: 'center',
                    background: calcTipo === 'PLATA'    ? 'rgba(160,168,184,0.08)'
                              : calcTipo === 'ORO'      ? 'rgba(200,150,10,0.08)'
                              : 'rgba(180,80,255,0.08)',
                    border: `1px solid ${
                      calcTipo === 'PLATA'    ? 'rgba(160,168,184,0.25)'
                      : calcTipo === 'ORO'   ? 'rgba(200,150,10,0.25)'
                      : 'rgba(180,80,255,0.25)'
                    }`,
                  }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)',
                      textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
                      Cobertura publicitaria generada
                    </div>
                    <div style={{
                      fontSize: 32, fontWeight: 900,
                      color: calcTipo === 'PLATA' ? '#d0d8e8'
                           : calcTipo === 'ORO'   ? '#ffe566'
                           : '#d090ff',
                    }}>
                      {calcCobertura.toFixed(0)}€
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                      {Number(calcCantidad)} tarjeta{Number(calcCantidad) !== 1 ? 's' : ''} × {calcDenom}€ × {RATIO[calcTipo]}
                    </div>
                    {calcCapped && (
                      <div style={{ marginTop: 8, fontSize: 9, color: '#f87171',
                        background: 'rgba(248,113,113,0.08)',
                        border: '1px solid rgba(248,113,113,0.2)',
                        borderRadius: 8, padding: '4px 10px', display: 'inline-block' }}>
                        ⚠ Tope de contrato: 1.000€ aplicado
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}