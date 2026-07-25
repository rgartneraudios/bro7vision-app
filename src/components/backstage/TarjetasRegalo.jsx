import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const SYNE = "'Exo 2', sans-serif";

const COSTE_LUNAS = {
  PLATA:    { ENVIO_GRATIS: 25000, '3': 30000, '5': 35000, '10': 40000, '20': 45000, '40': 50000, '60': 55000, '100': 60000, '200': 70000 },
  ORO:      { '5': 50000, '10': 60000, '20': 70000, '40': 80000, '60': 90000, '100': 100000, '200': 150000 },
  DIAMANTE: { '200': 200000, '500': 250000, '1000': 300000 },
  LUNA100:  { '100pct': 10000 },
};

const VALORES_POR_TIER = {
  PLATA:    ['ENVIO_GRATIS','3','5','10','20','40','60','100','200'],
  ORO:      ['5','10','20','40','60','100','200'],
  DIAMANTE: ['200','500','1000'],
  LUNA100:  ['100pct'],
};

const LABEL_VALOR = {
  ENVIO_GRATIS: 'Envío Gratis', '3': '3 €', '5': '5 €', '10': '10 €',
  '20': '20 €', '40': '40 €', '60': '60 €', '100': '100 €',
  '200': '200 €', '500': '500 €', '1000': '1.000 €', '100pct': '100% Descuento',
};

const TIER_STYLES = {
  PLATA:   { color: '#ddeeff', border: '#7799bb', label: 'Luna de Plata'    },
  ORO:     { color: '#f5cc42', border: '#d4a83a', label: 'Luna de Oro'      },
  DIAMANTE:{ color: '#00e5d4', border: '#00e5d4', label: 'Luna de Diamante' },
  LUNA100: { color: '#ee66ff', border: '#cc44ee', label: 'Luna 100'         },
};

const ALCANCE_OPCIONES = [
  { value: 'CIUDAD',         label: 'Ciudad'         },
  { value: 'GRAN_CIUDAD',    label: 'Gran Ciudad'    },
  { value: 'REGION',         label: 'Región'         },
  { value: 'GRAN_REGION',    label: 'Gran Región'    },
  { value: 'GIRA_NACIONAL',  label: 'Nacional'       },
  { value: 'GIRA_MUNDIAL',   label: 'Internacional'  },
];

const SUPABASE_STORAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/comercio-banners`;

export default function TarjetasRegalo() {
  const [userId, setUserId]         = useState(null);
  const [tarjetas, setTarjetas]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [msg, setMsg]               = useState('');
  const [editando, setEditando]     = useState(null); // null = nueva, id = editar

  const [tier, setTier]               = useState('PLATA');
  const [valor, setValor]             = useState('');
  const [compraMinima, setCompraMinima] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [bannerUrl, setBannerUrl]     = useState('');
  const [alcance, setAlcance]         = useState([]);
  const [palabraClave1, setPalabraClave1] = useState('');
  const [palabraClave2, setPalabraClave2] = useState('');

  const costeLunas = valor ? (COSTE_LUNAS[tier]?.[valor] || 0) : 0;
  const valorEuros = (valor && valor !== 'ENVIO_GRATIS' && valor !== '100pct')
    ? parseFloat(valor) : null;

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

  useEffect(() => { loadTarjetas(); }, [loadTarjetas]);

  const resetForm = () => {
    setEditando(null);
    setTier('PLATA'); setValor(''); setCompraMinima('');
    setDescripcion(''); setBannerUrl(''); setAlcance([]);
    setPalabraClave1(''); setPalabraClave2('');
    setMsg('');
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    const ext  = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('comercio-banners')
      .upload(path, file, { upsert: true });
    if (error) { setMsg('Error subiendo imagen'); setUploading(false); return; }
    setBannerUrl(`${SUPABASE_STORAGE_URL}/${path}`);
    setUploading(false);
  };

  const toggleAlcance = (val) => {
    setAlcance(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const handleSave = async () => {
    if (!userId || !tier || !valor || alcance.length === 0) {
      setMsg('Completa tier, valor y al menos un alcance.'); return;
    }
    setSaving(true);
    setMsg('');
    const payload = {
      user_id:        userId,
      tipo_tarjeta:   tier === 'LUNA100' ? '100' : tier,
      valor_euros:    valorEuros,
      coste_lunas:    costeLunas,
      compra_minima:  tier === 'PLATA' ? compraMinima || null : null,
      descripcion:    descripcion || null,
      banner_url:     bannerUrl  || null,
      alcance:        alcance,
      palabra_clave_1: palabraClave1 || null,
      palabra_clave_2: palabraClave2 || null,
      activo:         true,
      estado_canje:   'ACTIVO',
      emision_usada:  0,
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
    setAlcance(t.alcance || []);
    setPalabraClave1(t.palabra_clave_1 || '');
    setPalabraClave2(t.palabra_clave_2 || '');
    setMsg('');
  };

  const handleToggleActivo = async (t) => {
    await supabase.from('comercio_cupones')
      .update({ activo: !t.activo, estado_canje: !t.activo ? 'ACTIVO' : 'PAUSADO' })
      .eq('id', t.id);
    loadTarjetas();
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '10px 14px',
    color: '#fff', fontSize: 13, fontFamily: SYNE,
    outline: 'none',
  };

  const labelStyle = {
    fontSize: 10, fontWeight: 700, letterSpacing: 2,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
    marginBottom: 6, display: 'block',
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto', fontFamily: SYNE }}>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

        {/* ── FORMULARIO ── */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 28,
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', letterSpacing: 3,
            textTransform: 'uppercase', margin: '0 0 24px' }}>
            {editando ? '✏️ Editar Tarjeta' : '+ Nueva Tarjeta'}
          </h3>

          {/* TIER */}
          <div style={{ marginBottom: 20 }}>
            <span style={labelStyle}>Tier</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.keys(TIER_STYLES).map(t => {
                const s = TIER_STYLES[t];
                const active = tier === t;
                return (
                  <button key={t} onClick={() => { setTier(t); setValor(''); }}
                    style={{
                      padding: '8px 16px', borderRadius: 20, fontSize: 11,
                      fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                      cursor: 'pointer', fontFamily: SYNE, transition: 'all 0.2s',
                      background: active ? `${s.border}33` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${active ? s.border : 'rgba(255,255,255,0.1)'}`,
                      color: active ? s.color : 'rgba(255,255,255,0.4)',
                      boxShadow: active ? `0 0 16px ${s.border}44` : 'none',
                    }}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* VALOR */}
          <div style={{ marginBottom: 20 }}>
            <span style={labelStyle}>Valor</span>
            <select value={valor} onChange={e => setValor(e.target.value)} style={inputStyle}>
              <option value="">— Selecciona valor —</option>
              {(VALORES_POR_TIER[tier] || []).map(v => (
                <option key={v} value={v}>{LABEL_VALOR[v] || v}</option>
              ))}
            </select>
          </div>

          {/* LUNAS — solo lectura */}
          {valor && (
            <div style={{
              marginBottom: 20, padding: '14px 18px',
              background: 'rgba(250,204,21,0.07)',
              border: '1px solid rgba(250,204,21,0.2)',
              borderRadius: 12, display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>
                Coste en Lunas
              </span>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#facc15', letterSpacing: 1 }}>
                🌙 {costeLunas.toLocaleString()}
              </span>
            </div>
          )}

          {/* COMPRA MÍNIMA — solo PLATA */}
          {tier === 'PLATA' && (
            <div style={{ marginBottom: 20 }}>
              <span style={labelStyle}>Compra mínima (libre)</span>
              <input
                type="text"
                placeholder="Ej: 50 €, 1 producto, etc."
                value={compraMinima}
                onChange={e => setCompraMinima(e.target.value)}
                style={inputStyle}
              />
            </div>
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
            <span style={labelStyle}>Banner de la tarjeta</span>
            <input type="file" accept="image/*" onChange={handleUpload}
              style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }} />
            {uploading && <span style={{ fontSize: 11, color: '#facc15', marginTop: 6, display: 'block' }}>Subiendo imagen...</span>}
            {bannerUrl && !uploading && (
              <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', height: 80 }}>
                <img src={bannerUrl} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          {/* ALCANCE */}
          <div style={{ marginBottom: 24 }}>
            <span style={labelStyle}>Alcance geográfico</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALCANCE_OPCIONES.map(op => {
                const active = alcance.includes(op.value);
                return (
                  <button key={op.value} onClick={() => toggleAlcance(op.value)}
                    style={{
                      padding: '7px 14px', borderRadius: 20, fontSize: 11,
                      fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                      cursor: 'pointer', fontFamily: SYNE, transition: 'all 0.2s',
                      background: active ? 'rgba(0,229,212,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${active ? '#00e5d4' : 'rgba(255,255,255,0.1)'}`,
                      color: active ? '#00e5d4' : 'rgba(255,255,255,0.4)',
                    }}>
                    {op.label}
                  </button>
                );
              })}
            </div>
          </div>

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
            <button onClick={handleSave} disabled={saving}
              style={{
                flex: 1, padding: '13px 0',
                background: saving ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.2)',
                border: '1px solid rgba(168,85,247,0.5)',
                borderRadius: 12, color: '#c084fc',
                fontSize: 12, fontWeight: 900, letterSpacing: 2,
                textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: SYNE,
              }}>
              {saving ? 'GUARDANDO...' : editando ? 'ACTUALIZAR' : 'CREAR TARJETA'}
            </button>
            {editando && (
              <button onClick={resetForm}
                style={{
                  padding: '13px 20px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                  color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: SYNE, letterSpacing: 1,
                }}>
                CANCELAR
              </button>
            )}
          </div>
        </div>

        {/* ── LISTADO DE TARJETAS ── */}
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
                const ts = TIER_STYLES[t.tipo_tarjeta === '100' ? 'LUNA100' : t.tipo_tarjeta] || TIER_STYLES.PLATA;
                return (
                  <div key={t.id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${t.activo ? ts.border + '55' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 14, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16,
                    opacity: t.activo ? 1 : 0.5,
                  }}>
                    {/* Banner mini */}
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

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 8, fontWeight: 700, letterSpacing: 2,
                          textTransform: 'uppercase', color: ts.color,
                          border: `0.5px solid ${ts.border}`,
                          borderRadius: 20, padding: '1px 8px',
                          background: `${ts.border}22`,
                        }}>
                          {ts.label}
                        </span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: ts.color, fontFamily: SYNE }}>
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

                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleEditar(t)}
                        style={{
                          padding: '7px 14px', borderRadius: 8, fontSize: 11,
                          fontWeight: 700, cursor: 'pointer', fontFamily: SYNE,
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: 'rgba(255,255,255,0.6)', letterSpacing: 1,
                        }}>
                        EDITAR
                      </button>
                      <button onClick={() => handleToggleActivo(t)}
                        style={{
                          padding: '7px 14px', borderRadius: 8, fontSize: 11,
                          fontWeight: 700, cursor: 'pointer', fontFamily: SYNE,
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
  );
}