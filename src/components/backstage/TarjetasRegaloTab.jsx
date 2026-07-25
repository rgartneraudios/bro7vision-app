import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const LUNA_STYLES = {
  PLATA:    { bg: 'linear-gradient(160deg,#1a1f2e,#0d1220,#1a2535)', border: '#7799bb', color: '#ddeeff', badge: 'Luna de Plata'    },
  ORO:      { bg: 'linear-gradient(160deg,#1f1800,#0f0e00,#2a2000)', border: '#d4a83a', color: '#f5cc42', badge: 'Luna de Oro'      },
  DIAMANTE: { bg: 'linear-gradient(160deg,#001f2a,#000f1a,#002030)', border: '#00e5d4', color: '#00e5d4', badge: 'Luna de Diamante' },
  '100':    { bg: 'linear-gradient(160deg,#1f001f,#0f000f,#2a002a)', border: '#cc44ee', color: '#ee66ff', badge: 'Luna 100'         },
};

export default function TarjetasRegaloTab({ userId }) {
  const [cupones, setCupones]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [flippedId, setFlippedId] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      // Query 1 — cupones del usuario
      const { data: rows } = await supabase
        .from('cupones_generados')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!rows || rows.length === 0) { setLoading(false); return; }

      // Query 2 — enriquecer con banner_url y descripcion
      const ids = [...new Set(rows.map(r => r.comercio_id).filter(Boolean))];
      const { data: comercios } = await supabase
        .from('comercio_cupones')
        .select('id, banner_url, descripcion, compra_minima')
        .in('id', ids);

      const comercioMap = {};
      if (comercios) comercios.forEach(c => { comercioMap[c.id] = c; });

      setCupones(rows.map(r => ({
        ...r,
        banner_url:    comercioMap[r.comercio_id]?.banner_url    || null,
        descripcion:   comercioMap[r.comercio_id]?.descripcion   || null,
        compra_minima: comercioMap[r.comercio_id]?.compra_minima || null,
      })));
      setLoading(false);
    };
    load();
  }, [userId]);

  const formatFecha = (d) => d
    ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const isVencido = (d) => d && new Date(d) < new Date();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500 text-xs uppercase tracking-widest animate-pulse">Cargando tarjetas...</p>
    </div>
  );

  if (cupones.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <span className="text-5xl">🌙</span>
      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Aún no tienes tarjetas canjeadas</p>
      <p className="text-gray-600 text-xs text-center max-w-xs">
        Visita el sector Canjes de Lunas y canjea tus primeras tarjetas de descuento.
      </p>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <style>{`
        .tr-flip-inner {
          transition: transform 0.55s cubic-bezier(0.4,0.2,0.2,1);
          transform-style: preserve-3d;
          position: relative; width: 100%; height: 100%;
        }
        .tr-flip-inner.flipped { transform: rotateY(180deg); }
        .tr-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px; overflow: hidden;
        }
        .tr-face-back { transform: rotateY(180deg); }
      `}</style>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl">🎁</span>
        <div>
          <h3 className="text-xl font-black text-cyan-400 tracking-widest uppercase">Mis Tarjetas</h3>
          <p className="text-sm text-gray-500 font-bold tracking-widest mt-0.5">
            {cupones.length} tarjeta{cupones.length !== 1 ? 's' : ''} canjeada{cupones.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 24,
      }}>
        {cupones.map(cupon => {
          const estilo  = LUNA_STYLES[cupon.tipo_tarjeta] || LUNA_STYLES['PLATA'];
          const vencido = isVencido(cupon.caduca_at);
          const usado   = cupon.usado;

          return (
            <div
              key={cupon.id}
              onClick={() => setFlippedId(flippedId === cupon.id ? null : cupon.id)}
              style={{ height: 340, perspective: '1000px', cursor: 'pointer', opacity: (vencido || usado) ? 0.55 : 1 }}
            >
              <div className={`tr-flip-inner${flippedId === cupon.id ? ' flipped' : ''}`}>

                {/* CARA A */}
                <div className="tr-face" style={{
                  background: estilo.bg,
                  border: `2px solid ${estilo.border}`,
                  boxShadow: `0 0 20px ${estilo.border}33`,
                  display: 'flex', flexDirection: 'column',
                }}>
                  {/* Banner */}
                  <div style={{
                    width: '100%', height: 130, flexShrink: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36,
                  }}>
                    {cupon.banner_url
                      ? <img src={cupon.banner_url} alt={cupon.comercio_nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🌙'}
                  </div>

                  {/* Body */}
                  <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'space-evenly',
                    padding: '8px 12px',
                  }}>
                    <span style={{
                      fontSize: 8, fontWeight: 700, letterSpacing: 3,
                      textTransform: 'uppercase', color: estilo.color,
                      border: `0.5px solid ${estilo.border}`,
                      borderRadius: 20, padding: '2px 10px',
                      background: `${estilo.border}22`,
                    }}>
                      {estilo.badge}
                    </span>

                    <span style={{
                      fontSize: 36, fontWeight: 900, color: estilo.color,
                      lineHeight: 1, textShadow: `0 0 20px ${estilo.border}66`,
                      fontFamily: "'Exo 2', sans-serif",
                    }}>
                      {cupon.valor_euros != null ? `${cupon.valor_euros}€` : '—'}
                    </span>

                    <span style={{ fontSize: 9, fontWeight: 700, color: estilo.color, opacity: 0.6 }}>
                      {cupon.comercio_nombre}
                    </span>

                    {/* Estado badge */}
                    <span style={{
                      fontSize: 8, fontWeight: 700, letterSpacing: 2,
                      textTransform: 'uppercase', borderRadius: 20,
                      padding: '2px 10px',
                      color:       usado ? '#4ade80' : vencido ? '#f87171' : '#facc15',
                      background:  usado ? 'rgba(74,222,128,0.1)' : vencido ? 'rgba(248,113,113,0.1)' : 'rgba(250,204,21,0.1)',
                      border: `0.5px solid ${usado ? '#4ade8044' : vencido ? '#f8717144' : '#facc1544'}`,
                    }}>
                      {usado ? '✅ Usado' : vencido ? '⏰ Vencido' : '🟡 Activo'}
                    </span>

                    <span style={{ fontSize: 7, color: estilo.color, opacity: 0.35, letterSpacing: 1 }}>
                      Toca para ver detalles
                    </span>
                  </div>
                </div>

                {/* CARA B */}
                <div className="tr-face tr-face-back" style={{
                  background: 'linear-gradient(160deg,#0a0a0f,#0d0d18,#111120)',
                  border: `2px solid ${estilo.color}`,
                  boxShadow: `0 0 32px ${estilo.border}55, inset 0 0 30px ${estilo.border}0d`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 16px 16px',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      fontSize: 8, fontWeight: 700, letterSpacing: 3,
                      textTransform: 'uppercase', color: estilo.color,
                      border: `0.5px solid ${estilo.border}`,
                      borderRadius: 20, padding: '2px 10px',
                      background: `${estilo.border}22`,
                    }}>
                      {estilo.badge}
                    </span>
                    <span style={{
                      fontSize: 40, fontWeight: 900, color: estilo.color,
                      lineHeight: 1, fontFamily: "'Exo 2', sans-serif",
                    }}>
                      {cupon.valor_euros != null ? `${cupon.valor_euros}€` : '—'}
                    </span>
                  </div>

                  <div style={{
                    width: '80%', height: 0.5,
                    background: `linear-gradient(90deg,transparent,${estilo.border},transparent)`,
                  }} />

                  <span style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.7)',
                    textAlign: 'center', lineHeight: 1.6,
                  }}>
                    {cupon.descripcion || 'Tarjeta de descuento. Consulta condiciones con el comercio.'}
                  </span>

                  {cupon.tipo_tarjeta === 'PLATA' && cupon.compra_minima && (
                    <div style={{
                      fontSize: 10, color: estilo.color, fontWeight: 700,
                      background: `${estilo.border}18`, borderRadius: 8,
                      border: `0.5px solid ${estilo.border}44`,
                      padding: '4px 12px', letterSpacing: 1,
                    }}>
                      Compra mínima: {cupon.compra_minima}
                    </div>
                  )}

                  {cupon.palabra_clave_2 && !usado && !vencido && (
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${estilo.border}55`,
                      borderRadius: 10, padding: '8px 14px',
                      textAlign: 'center', width: '100%',
                    }}>
                      <span style={{
                        fontSize: 8, color: 'rgba(255,255,255,0.4)',
                        display: 'block', letterSpacing: 2,
                        textTransform: 'uppercase', marginBottom: 4,
                      }}>
                        Palabra clave secreta
                      </span>
                      <span style={{
                        fontSize: 16, fontWeight: 900,
                        color: estilo.color, letterSpacing: 4,
                        textShadow: `0 0 12px ${estilo.border}`,
                      }}>
                        {cupon.palabra_clave_2}
                      </span>
                    </div>
                  )}

                  <span style={{
                    fontSize: 8, color: 'rgba(255,255,255,0.3)',
                    letterSpacing: 1, textTransform: 'uppercase',
                  }}>
                    Caduca: {formatFecha(cupon.caduca_at)}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}