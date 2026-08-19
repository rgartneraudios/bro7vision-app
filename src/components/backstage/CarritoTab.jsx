import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const HEADING = "'Noto Sans', sans-serif";

export default function CarritoTab({ session, profile }) {
  const [nido,    setNido]    = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');
  const [nidoSeleccionado, setNidoSeleccionado] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    Promise.all([
      supabase
        .from('comercio_cupones')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('estado_canje', 'NIDO')
        .order('created_at', { ascending: false }),
      supabase
        .from('bs_butacas')
        .select('precio, cobertura, canal, funcion, dispositivo')
        .eq('productor_id', session.user.id)
        .eq('estado', 'EN_CASTING'),
    ]).then(([nidoRes, espaciosRes]) => {
      setNido(nidoRes.data || []);
      setEspacios(espaciosRes.data || []);
      setLoading(false);
    });
  }, [session]);

  const nidoAgrupado = nido.reduce((acc, t) => {
    const key = t.nombre_campana || 'Sin nombre';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const valorNidoCampana = (tarjetas) => tarjetas.reduce((sum, t) => {
    const euros = parseFloat(t.valor_euros) || 5;
    const ratio = t.tipo_tarjeta === 'PLATA' ? 0.50 : 0.80;
    return sum + euros * (t.emision_total || 1) * ratio;
  }, 0);

  const totalEspacios = espacios.reduce((sum, e) =>
    sum + (parseFloat(e.precio) || 0), 0);

  const valorNidoElegido = nidoSeleccionado
    ? valorNidoCampana(nidoAgrupado[nidoSeleccionado] || [])
    : 0;

  const diferencia    = valorNidoElegido - totalEspacios;
  const nidoCubre     = diferencia >= 0;
  const seguroBase    = Math.min(totalEspacios * 0.20, 60);
  const seguroConIva  = seguroBase * 1.21;

  const handleActivarNido = async () => {
    if (!nidoSeleccionado || !nidoCubre) return;
    setSaving(true);
    const ids = (nidoAgrupado[nidoSeleccionado] || []).map(t => t.id);
    const { error } = await supabase
      .from('comercio_cupones')
      .update({ estado_canje: 'ACTIVO', activo: true })
      .in('id', ids);
    setSaving(false);
    if (error) { setMsg(`Error: ${error.message}`); return; }
    setMsg(`✅ Nido activado. Seguro a pagar: ${seguroConIva.toFixed(2)}€ (IVA incluido).`);
    setNido([]);
    setNidoSeleccionado(null);
    setEspacios([]);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto', fontFamily: HEADING }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <span style={{ fontSize: 36 }}>🛒</span>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff',
            letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>
            Carrito de Campaña
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
            Revisa tus tarjetas en el Nido y actívalas para publicarlas
          </p>
        </div>
      </div>

      {/* Espacios contratados */}
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa',
        letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 16px' }}>
        📺 Espacios Contratados ({espacios.length})
      </h3>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Cargando...</p>
      ) : espacios.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center',
          border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16, marginBottom: 32 }}>
          <span style={{ fontSize: 32 }}>📺</span>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 12 }}>
            No tienes espacios contratados en esta fase lunar.
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
            Total: {totalEspacios.toFixed(2)}€
          </div>
        </div>
      )}

      {/* Selector de Nido */}
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa',
        letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 16px' }}>
        🧺 Selecciona tu Nido
      </h3>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Cargando...</p>
      ) : Object.keys(nidoAgrupado).length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center',
          border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16, marginBottom: 32 }}>
          <span style={{ fontSize: 32 }}>🪺</span>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 12 }}>
            El Nido está vacío. Crea tarjetas desde la pestaña Tarjetas de Regalo.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {Object.entries(nidoAgrupado).map(([key, grupo]) => {
              const valor = valorNidoCampana(grupo);
              const seleccionado = nidoSeleccionado === key;
              return (
                <div key={key} onClick={() => setNidoSeleccionado(key)}
                  style={{
                    background: seleccionado ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${seleccionado ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 12, padding: '14px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  <span style={{ fontSize: 16 }}>{seleccionado ? '●' : '○'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: seleccionado ? '#c084fc' : '#fff' }}>
                      🌙 {key}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      {grupo.length} tarjetas · {grupo.reduce((s, t) => s + (t.emision_total || 1), 0)} unidades
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: seleccionado ? '#c084fc' : '#4ade80' }}>
                    {valor.toFixed(2)}€
                  </div>
                </div>
              );
            })}
          </div>

          {/* Validación cobertura */}
          {nidoSeleccionado && (
            <div style={{
              padding: '16px 20px', borderRadius: 12, marginBottom: 24,
              background: nidoCubre ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
              border: `1px solid ${nidoCubre ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
            }}>
              {nidoCubre ? (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 6 }}>
                    ✅ El Nido cubre los espacios
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
                    Sobrante: {diferencia.toFixed(2)}€ (se libera para usuarios)
                  </div>
                  <div style={{ fontSize: 11, color: '#f87171' }}>
                    🔒 Seguro: {seguroBase.toFixed(2)}€ + IVA = {seguroConIva.toFixed(2)}€
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 6 }}>
                    ❌ Faltan {Math.abs(diferencia).toFixed(2)}€ para cubrir los espacios
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                    Elige otro Nido o añade más tarjetas
                  </div>
                </>
              )}
            </div>
          )}

          {msg && (
            <div style={{ marginBottom: 20, padding: '12px 16px',
              background: msg.includes('✅') ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
              border: `1px solid ${msg.includes('✅') ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
              borderRadius: 10, fontSize: 12,
              color: msg.includes('✅') ? '#4ade80' : '#f87171' }}>
              {msg}
            </div>
          )}

          <button
            onClick={handleActivarNido}
            disabled={saving || !nidoSeleccionado || !nidoCubre}
            style={{
              width: '100%', padding: '16px 0',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: 'none', borderRadius: 12,
              color: '#fff', fontSize: 13, fontWeight: 900,
              letterSpacing: 3, textTransform: 'uppercase',
              cursor: (saving || !nidoSeleccionado || !nidoCubre) ? 'not-allowed' : 'pointer',
              opacity: (saving || !nidoSeleccionado || !nidoCubre) ? 0.6 : 1,
              fontFamily: HEADING,
              boxShadow: '0 0 30px rgba(124,58,237,0.3)',
            }}>
            {saving ? 'ACTIVANDO...' : `✅ CONFIRMAR — ${nidoSeleccionado || 'SELECCIONA UN NIDO'}`}
          </button>

          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)',
            textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
            Al activar, las tarjetas quedan disponibles para los usuarios de Brovision.
            El seguro publicitario se gestiona al confirmar cada contrato de campaña.
          </p>
        </>
      )}
    </div>
  );
}