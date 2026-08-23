// src/components/backstage/CarritoTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const HEADING = "'Noto Sans', sans-serif";
const RATIO = { PLATA: 0.60, ORO: 0.90, DIAMANTE: 0.80, LUNA100: 0 };

const LUNA_STYLES = {
  PLATA: {
    bgCard: 'linear-gradient(170deg, #e8eaf0 0%, #f8f9fc 40%, #d0d4e0 70%, #c8ccd8 100%)',
    color: '#4a5068', colorText: '#2a3048', badge: 'Luna de Plata',
    lunasBg: 'rgba(160,168,184,0.15)', lunasBorder: 'rgba(160,168,184,0.4)',
  },
  ORO: {
    bgCard: 'linear-gradient(170deg, #f5e6b0 0%, #fdf5d0 40%, #e8c870 70%, #d4a830 100%)',
    color: '#7a5800', colorText: '#4a3400', badge: 'Luna de Oro',
    lunasBg: 'rgba(200,150,10,0.12)', lunasBorder: 'rgba(200,150,10,0.35)',
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

export default function CarritoTab({ session, profile }) {
  const [espacios,    setEspacios]    = useState([]);
  const [nidosConfig, setNidosConfig] = useState([]);
  const [contratoId,  setContratoId]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState('');

  const [modo,    setModo]    = useState('CASH');
  const [alcance, setAlcance] = useState('');

  // { [nido_id]: { selected, banner_url, banner_reverso_url } }
  const [selection,     setSelection]     = useState({});
  const [flipId,        setFlipId]        = useState(null);
  const [flippedCards,  setFlippedCards]  = useState({});
  const [uploading,     setUploading]     = useState('');

  useEffect(() => {
    if (!session?.user?.id) return;
    Promise.all([
      supabase
        .from('bs_butacas')
        .select('precio, cobertura, canal, funcion, dispositivo, contrato_id')
        .eq('productor_id', session.user.id)
        .eq('estado', 'EN_CASTING'),
      supabase
        .from('comercio_nidos')
        .select('*')
        .eq('comercio_user_id', session.user.id)
        .order('tipo_tarjeta', { ascending: true }),
    ]).then(([espRes, nidRes]) => {
      const esp = espRes.data || [];
      setEspacios(esp);
      setContratoId(esp[0]?.contrato_id || null);
      setNidosConfig(nidRes.data || []);
      setLoading(false);
    });
  }, [session]);

  const totalEspacios  = espacios.reduce((s, e) => s + (parseFloat(e.precio) || 0), 0);
  const seguro         = Math.min(totalEspacios * 0.20, 90);
  const seguroIva      = seguro * 1.21;

  const coberturaNidos = Object.entries(selection)
    .filter(([_, v]) => v.selected)
    .reduce((sum, [nido_id]) => {
      const n = nidosConfig.find(n => n.id === nido_id);
      if (!n) return sum;
      return sum + (n.cantidad_total * n.denominacion * (RATIO[n.tipo_tarjeta] || 0));
    }, 0);

  const totalCashEfectivo  = Math.max(totalEspacios - coberturaNidos, 0);
  const porcentajeCobertura = totalEspacios > 0
    ? Math.min((coberturaNidos / totalEspacios) * 100, 100) : 0;
  const cubreOk = coberturaNidos >= totalEspacios;

  const toggleNido = (nido_id) => {
    setSelection(prev => ({
      ...prev,
      [nido_id]: {
        banner_url:         prev[nido_id]?.banner_url || '',
        banner_reverso_url: prev[nido_id]?.banner_reverso_url || '',
        selected:           !prev[nido_id]?.selected,
      },
    }));
  };

  const handleUploadBanner = async (e, nido_id, field) => {
    const file   = e.target.files?.[0];
    const userId = session?.user?.id;
    if (!file || !userId) return;
    const uploadKey = `${nido_id}-${field}`;
    setUploading(uploadKey);
    try {
      const safeFileName = `banners/${userId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const res  = await fetch('https://cupones.bro7vision.workers.dev/upload-presigned', {
        method: 'POST',
        headers: { 'x-file-name': safeFileName, 'x-file-type': file.type },
        body: file,
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSelection(prev => ({
          ...prev,
          [nido_id]: { ...prev[nido_id], [field]: data.url },
        }));
      } else {
        setMsg('❌ Error subiendo imagen.');
      }
    } catch (err) {
      setMsg('❌ Error: ' + err.message);
    } finally {
      setUploading('');
    }
  };

  const handleConfirmar = async () => {
    if (!contratoId) { setMsg('❌ No hay contrato en borrador.'); return; }
    if (modo === 'NIDOS') {
      if (!alcance) { setMsg('Selecciona el alcance de las tarjetas.'); return; }
      const seleccionados = Object.entries(selection).filter(([_, v]) => v.selected);
      if (seleccionados.length === 0) { setMsg('Selecciona al menos un nido.'); return; }
      if (!cubreOk) { setMsg('La cobertura de los nidos es insuficiente para el total de slots.'); return; }
    }
    setSaving(true);
    setMsg('');

    const p_packs = modo === 'NIDOS'
      ? Object.entries(selection)
          .filter(([_, v]) => v.selected)
          .map(([nido_id, v]) => {
            const n = nidosConfig.find(n => n.id === nido_id);
            return {
              nido_id,
              cantidad:           n?.cantidad_total || 0,
              denominacion:       n?.denominacion   || 0,
              banner_url:         v.banner_url        || null,
              banner_reverso_url: v.banner_reverso_url || null,
            };
          })
      : [];

    const { data, error } = await supabase.rpc('confirmar_contrato', {
      p_contrato_id: contratoId,
      p_modo:        modo,
      p_packs:       p_packs,
      p_alcance:     modo === 'NIDOS' ? alcance : null,
    });

    setSaving(false);
    if (error || !data?.ok) {
      setMsg(`❌ ${data?.error || error?.message || 'Error al confirmar.'}`);
      return;
    }
    const seguroPagar = (Math.min(data.total_espacios * 0.20, 90) * 1.21).toFixed(2);
    setMsg(`✅ Campaña activada. Efectivo: ${Number(data.total_pagar).toFixed(2)}€ + seguro ${seguroPagar}€ (IVA inc.)`);
    setEspacios([]);
    setSelection({});
    setContratoId(null);
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: HEADING }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Cargando...</p>
    </div>
  );

  return (
    <>
      <style>{`
        .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
        .flip-card-inner.flipped { transform: rotateY(180deg); }
        .flip-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 14px; overflow: hidden; }
        .flip-face-back { transform: rotateY(180deg); }
      `}</style>

      <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto', fontFamily: HEADING }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <span style={{ fontSize: 36 }}>🛒</span>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff',
              letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>
              Carrito de Campaña
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
              Revisa tus slots y elige cómo cubrir el presupuesto
            </p>
          </div>
        </div>

        {/* Espacios */}
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa',
          letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 16px' }}>
          📺 Espacios contratados ({espacios.length})
        </h3>
        {espacios.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center',
            border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16, marginBottom: 32 }}>
            <span style={{ fontSize: 32 }}>📺</span>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 12 }}>
              No tienes espacios en borrador en esta fase lunar.
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {espacios.map((e, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                    Canal {e.canal} · T{e.funcion} · {e.dispositivo === 0 ? 'PC' : 'Móvil'} · {e.cobertura}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#facc15' }}>
                    {parseFloat(e.precio).toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#facc15' }}>
              Total slots: {totalEspacios.toFixed(2)}€
            </div>
          </div>
        )}

        {/* Mode toggle */}
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa',
          letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 14px' }}>
          💳 Modo de pago
        </h3>
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {[
            { val: 'CASH',  label: '💵 100% Cash' },
            { val: 'NIDOS', label: '🎁 Con Nidos de Tarjetas' },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setModo(val)} style={{
              flex: 1, padding: '14px 0', borderRadius: 12, cursor: 'pointer',
              fontFamily: HEADING, fontSize: 13, fontWeight: 900,
              letterSpacing: 2, textTransform: 'uppercase', transition: 'all 0.2s',
              border: `1px solid ${modo === val ? '#a78bfa' : 'rgba(255,255,255,0.1)'}`,
              background: modo === val ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.02)',
              color: modo === val ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* NIDOS section */}
        {modo === 'NIDOS' && (
          <>
            {/* Alcance */}
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#34d399',
              letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 14px' }}>
              🗺️ Alcance de las tarjetas
            </h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
              {[
                { val: 'CERCANIAS',     label: '🗺️ Cercanías' },
                { val: 'NACIONAL',      label: '🇪🇸 Nacional' },
                { val: 'INTERNACIONAL', label: '🌍 Internacional' },
              ].map(({ val, label }) => (
                <button key={val} onClick={() => setAlcance(val)} style={{
                  flex: 1, padding: '11px 0', borderRadius: 10, cursor: 'pointer',
                  fontFamily: HEADING, fontSize: 11, fontWeight: 700,
                  letterSpacing: 1, textTransform: 'uppercase', transition: 'all 0.2s',
                  border: `1px solid ${alcance === val ? '#34d399' : 'rgba(255,255,255,0.1)'}`,
                  background: alcance === val ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.02)',
                  color: alcance === val ? '#34d399' : 'rgba(255,255,255,0.4)',
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Nido selector */}
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa',
              letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 14px' }}>
              🧺 Selecciona nidos
            </h3>
            {nidosConfig.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center',
                border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16, marginBottom: 24 }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                  No tienes nidos configurados. Créalos desde Tarjetas de Regalo.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {nidosConfig.map(n => {
                  const isSel       = !!selection[n.id]?.selected;
                  const isPreview   = flipId === n.id;
                  const isFlipped   = !!flippedCards[n.id];
                  const isPendiente = n.tipo_tarjeta === 'DIAMANTE' && !n.aprobado;
                  const ts          = LUNA_STYLES[n.tipo_tarjeta] || LUNA_STYLES.PLATA;
                  const coberturaN  = n.cantidad_total * n.denominacion * (RATIO[n.tipo_tarjeta] || 0);

                  return (
                    <div key={n.id} style={{
                      background: isSel ? 'rgba(167,139,250,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSel ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 14, padding: 16,
                      opacity: isPendiente ? 0.5 : 1,
                    }}>
                      {/* Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                          onClick={() => !isPendiente && toggleNido(n.id)}
                          disabled={isPendiente}
                          style={{
                            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                            background: isSel ? '#a78bfa' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${isSel ? '#a78bfa' : 'rgba(255,255,255,0.15)'}`,
                            cursor: isPendiente ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, color: '#fff', fontWeight: 900,
                          }}>
                          {isSel ? '✓' : ''}
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: ts.color }}>
                              {n.nombre_nido || `${n.tipo_tarjeta} ${n.denominacion}€`}
                            </span>
                            {isPendiente && (
                              <span style={{ fontSize: 9, color: '#f87171',
                                border: '1px solid rgba(248,113,113,0.3)',
                                borderRadius: 20, padding: '1px 8px' }}>
                                Pendiente aprobación
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                            {n.cantidad_total} uds · {coberturaN.toFixed(0)}€ cobertura
                            {n.tipo_tarjeta === 'LUNA100' && ' (sin cobertura)'}
                          </div>
                        </div>
                        {!isPendiente && (
                          <button
                            onClick={() => setFlipId(isPreview ? null : n.id)}
                            style={{
                              padding: '5px 10px', borderRadius: 8, fontSize: 10,
                              fontWeight: 700, cursor: 'pointer', fontFamily: HEADING,
                              background: isPreview ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${isPreview ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.1)'}`,
                              color: isPreview ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                              letterSpacing: 1,
                            }}>
                            {isPreview ? 'CERRAR' : '👁 PREVIEW'}
                          </button>
                        )}
                      </div>

                      {/* Expanded panel */}
                      {(isSel || isPreview) && (
                        <div style={{ marginTop: 16, display: 'flex', gap: 20, alignItems: 'start' }}>

                          {/* Banner uploads — solo si seleccionado */}
                          {isSel && (
                            <div style={{ flex: 1, display: 'flex', gap: 12 }}>
                              {['banner_url', 'banner_reverso_url'].map(field => {
                                const uploadKey  = `${n.id}-${field}`;
                                const currentUrl = selection[n.id]?.[field] || '';
                                return (
                                  <div key={field} style={{ flex: 1 }}>
                                    <span style={{ fontSize: 9, fontWeight: 700,
                                      letterSpacing: 2, textTransform: 'uppercase',
                                      color: 'rgba(255,255,255,0.4)',
                                      display: 'block', marginBottom: 6 }}>
                                      {field === 'banner_url' ? '🖼 Anverso' : '↩ Reverso'}
                                    </span>
                                    <label style={{
                                      display: 'block', padding: '8px 10px',
                                      background: 'rgba(255,255,255,0.03)',
                                      border: currentUrl
                                        ? '1px solid rgba(74,222,128,0.3)'
                                        : '1px dashed rgba(255,255,255,0.15)',
                                      borderRadius: 8, cursor: 'pointer',
                                      fontSize: 10, textAlign: 'center',
                                      color: currentUrl ? '#4ade80' : 'rgba(255,255,255,0.35)',
                                    }}>
                                      {uploading === uploadKey ? 'Subiendo...'
                                        : currentUrl ? '✅ Cargado'
                                        : '+ Subir'}
                                      <input type="file" accept="image/*"
                                        onChange={e => handleUploadBanner(e, n.id, field)}
                                        style={{ display: 'none' }} />
                                    </label>
                                    {currentUrl && (
                                      <img src={currentUrl} alt={field}
                                        style={{ width: '100%', borderRadius: 6,
                                          marginTop: 4, maxHeight: 56, objectFit: 'cover' }} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Flip card preview — solo si isPreview */}
                          {isPreview && (
                            <div style={{ width: 220, flexShrink: 0 }}>
                              <div
                                style={{ width: 220, height: 138, perspective: 800, cursor: 'pointer' }}
                                onClick={() => setFlippedCards(prev => ({ ...prev, [n.id]: !prev[n.id] }))}>
                                <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                                  {/* Anverso */}
                                  <div className="flip-face" style={{
                                    background: selection[n.id]?.banner_url
                                      ? `url(${selection[n.id].banner_url}) center/cover`
                                      : `url(${getCardImage(n.tipo_tarjeta, n.denominacion)}) center/cover`,
                                    padding: '14px 16px',
                                    display: 'flex', flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                  }}>
                                    <div>
                                      <div style={{ fontSize: 7, fontWeight: 700,
                                        letterSpacing: 2, textTransform: 'uppercase', color: ts.color,
                                        background: ts.lunasBg, border: `1px solid ${ts.lunasBorder}`,
                                        borderRadius: 20, padding: '1px 7px',
                                        display: 'inline-block', marginBottom: 4 }}>
                                        {ts.badge}
                                      </div>
                                      <div style={{ fontSize: 16, fontWeight: 900, color: ts.colorText }}>
                                        {n.tipo_tarjeta === 'LUNA100' ? '100%'
                                          : n.denominacion === 7 ? 'Envío Gratis'
                                          : `${n.denominacion}€`}
                                      </div>
                                    </div>
                                    {n.descripcion && (
                                      <p style={{ fontSize: 7, color: ts.colorText, opacity: 0.6,
                                        margin: 0, overflow: 'hidden', display: '-webkit-box',
                                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {n.descripcion}
                                      </p>
                                    )}
                                  </div>
                                  {/* Reverso */}
                                  <div className="flip-face flip-face-back" style={{
                                    background: selection[n.id]?.banner_reverso_url
                                      ? `url(${selection[n.id].banner_reverso_url}) center/cover`
                                      : 'url(/images/cards/card-back.webp) center/cover',
                                    padding: '14px 16px',
                                    display: 'flex', flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                  }}>
                                    <div>
                                      <div style={{ fontSize: 7, fontWeight: 700,
                                        letterSpacing: 2, textTransform: 'uppercase',
                                        color: '#ffffff', marginBottom: 6 }}>
                                        🔐 Clave secreta
                                      </div>
                                      <div style={{ fontSize: 13, fontWeight: 900, color: '#ffffff',
                                        fontFamily: 'monospace', letterSpacing: 3 }}>
                                        {n.clave_secreta || '— — — —'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <p style={{ textAlign: 'center', fontSize: 8,
                                color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
                                Clic para voltear
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Coverage bar */}
            {Object.values(selection).some(v => v.selected) && (
              <div style={{
                padding: '16px 20px', borderRadius: 12, marginBottom: 24,
                background: cubreOk ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
                border: `1px solid ${cubreOk ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cubreOk ? '#4ade80' : '#f87171' }}>
                    {cubreOk
                      ? '✅ Cobertura suficiente'
                      : `❌ Faltan ${(totalEspacios - coberturaNidos).toFixed(2)}€`}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    {coberturaNidos.toFixed(2)}€ / {totalEspacios.toFixed(2)}€
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    width: `${porcentajeCobertura}%`,
                    background: cubreOk
                      ? 'linear-gradient(90deg, #4ade80, #22d3ee)'
                      : 'linear-gradient(90deg, #f87171, #fb923c)',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Resumen financiero */}
        {espacios.length > 0 && (
          <div style={{
            padding: '16px 20px', borderRadius: 12, marginBottom: 24,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                🔒 Seguro publicitario + IVA (21%)
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>
                {seguroIva.toFixed(2)}€
              </span>
            </div>
            {modo === 'NIDOS' && coberturaNidos > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>🎁 Cobertura por nidos</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>
                  -{coberturaNidos.toFixed(2)}€
                </span>
              </div>
            )}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: 10, marginTop: 4,
              display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700,
                color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
                TOTAL EFECTIVO
              </span>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#facc15' }}>
                {(modo === 'CASH'
                  ? totalEspacios + seguroIva
                  : totalCashEfectivo + seguroIva
                ).toFixed(2)}€
              </span>
            </div>
          </div>
        )}

        {msg && (
          <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10,
            background: msg.includes('✅') ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${msg.includes('✅') ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
            fontSize: 12, color: msg.includes('✅') ? '#4ade80' : '#f87171' }}>
            {msg}
          </div>
        )}

        {/* Confirm */}
        <button
          onClick={handleConfirmar}
          disabled={saving || espacios.length === 0}
          style={{
            width: '100%', padding: '16px 0',
            background: (saving || espacios.length === 0)
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: 'none', borderRadius: 12, fontFamily: HEADING,
            color: (saving || espacios.length === 0) ? 'rgba(255,255,255,0.2)' : '#fff',
            fontSize: 13, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase',
            cursor: (saving || espacios.length === 0) ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 30px rgba(124,58,237,0.2)',
          }}>
          {saving ? 'CONFIRMANDO...' : '✅ CONFIRMAR CAMPAÑA'}
        </button>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)',
          textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
          Al confirmar, los slots quedan en cartelera y las tarjetas entran en cola de liberación.
        </p>

      </div>
    </>
  );
}