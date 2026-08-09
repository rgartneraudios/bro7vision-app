import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const SYNE = "'Exo 2', sans-serif";

export default function CarritoTab({ session, profile }) {
  const [nido,    setNido]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from('comercio_cupones')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('estado_canje', 'NIDO')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setNido(data || []); setLoading(false); });
  }, [session]);

  const getRatio = (tipo) => tipo === 'PLATA' ? 0.50 : 0.80;

  const totalValorNido = nido.reduce((sum, t) =>
    sum + (parseFloat(t.valor_euros) || 0) * (t.emision_total || 1), 0);

  const totalDescuento = nido.reduce((sum, t) => {
    const valor = (parseFloat(t.valor_euros) || 0) * (t.emision_total || 1);
    return sum + valor * getRatio(t.tipo_tarjeta);
  }, 0);

  const seguro = Math.min(totalDescuento / (1 - 0.20) * 0.20, 40);

  const handleActivarNido = async () => {
    if (nido.length === 0) return;
    setSaving(true);
    const ids = nido.map(t => t.id);
    const { error } = await supabase
      .from('comercio_cupones')
      .update({ estado_canje: 'ACTIVO', activo: true })
      .in('id', ids);
    setSaving(false);
    if (error) { setMsg(`Error: ${error.message}`); return; }
    setMsg('✅ Tarjetas activadas. Ya están disponibles para los usuarios.');
    setNido([]);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto', fontFamily: SYNE }}>

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

      {/* Resumen financiero */}
      {nido.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Valor total en tarjetas', value: `${totalValorNido.toFixed(2)}€`, color: '#facc15' },
            { label: 'Descuento publicitario obtenido', value: `${totalDescuento.toFixed(2)}€`, color: '#4ade80' },
            { label: 'Seguro publicitario', value: `${seguro.toFixed(2)}€`, color: '#f87171' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '20px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                {label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Lista Nido */}
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa',
        letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 16px' }}>
        🪺 Tarjetas en el Nido ({nido.length})
      </h3>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Cargando...</p>
      ) : nido.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center',
          border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
          <span style={{ fontSize: 32 }}>🪺</span>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 12 }}>
            El Nido está vacío. Crea tarjetas desde la pestaña Tarjetas de Regalo.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {nido.map(t => {
              const ratio = getRatio(t.tipo_tarjeta);
              const valorTotal = (parseFloat(t.valor_euros) || 0) * (t.emision_total || 1);
              const descuento  = valorTotal * ratio;
              return (
                <div key={t.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '14px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                      {t.nombre_campana || 'Sin nombre'}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                      {t.tipo_tarjeta} · {t.emision_total || 1} tarjetas
                      × {t.valor_euros}€ = {valorTotal.toFixed(0)}€ valor
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      Descuento pub.
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#4ade80' }}>
                      {descuento.toFixed(2)}€
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
            disabled={saving}
            style={{
              width: '100%', padding: '16px 0',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: 'none', borderRadius: 12,
              color: '#fff', fontSize: 13, fontWeight: 900,
              letterSpacing: 3, textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              fontFamily: SYNE,
              boxShadow: '0 0 30px rgba(124,58,237,0.3)',
            }}>
            {saving ? 'ACTIVANDO...' : `✅ ACTIVAR NIDO — ${nido.length} TARJETAS`}
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