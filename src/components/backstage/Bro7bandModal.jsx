import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const SYNE  = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const MencionesModal = ({ session, carrito, setCarrito, onClose, onReserved, faseLunarTexto, faseLunarActiva }) => {
  const [brief, setBrief]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [done, setDone]         = useState(false);
  const [descuento, setDescuento] = useState(0);

  useEffect(() => {
    const fetchDescuento = async () => {
      const { data } = await supabase
        .from('b_advertiser_profiles')
        .select('descuento_publicitario')
        .eq('id', session.user.id)
        .maybeSingle();
      setDescuento(data?.descuento_publicitario ?? 0);
    };
    fetchDescuento();
  }, [session]);

  const precioFinal = (precio) =>
    descuento > 0
      ? Math.round(precio * (1 - descuento / 100) * 100) / 100
      : precio;

  const total = carrito.reduce((sum, item) => sum + precioFinal(item.precio ?? 20), 0);

  const handleContratar = async () => {
    if (!brief.trim()) {
      setError('Escribe un brief de mención antes de contratar.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rows = carrito.map(item => ({
        grupo_id:        item.grupo_id,
        idioma:          item.idioma,
        fase_lunar_activa: faseLunarActiva,
        brief:           brief.trim(),
        anunciante_id:   session.user.id,
        estado:          'PENDIENTE',
        precio:          20,
        tipo_contenido:  item.tipo_contenido ?? null,
      }));

      const { error: err } = await supabase.from('bro7band_menciones').insert(rows);
      if (err) throw err;

      setDone(true);
      setTimeout(() => {
        setCarrito([]);
        onReserved();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] bg-zinc-950 border-l border-white/10 flex flex-col shadow-2xl font-mono">

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/5 bg-black/30 shrink-0">
          <div>
            <h3 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-base font-black text-white tracking-tight">CONTRATAR MENCIONES</h3>
            <p style={{ fontFamily: INTER }} className="text-xs text-gray-500 mt-1">Audios de personajes para tu comercio</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none mt-0.5 transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {done ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="text-4xl">🎬</div>
              <p style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-white text-sm uppercase tracking-widest">
                Solicitud enviada
              </p>
              <p style={{ fontFamily: INTER }} className="text-gray-500 text-sm max-w-[260px] leading-relaxed">
                El estudio revisará tu brief.
              </p>
              <span style={{ fontFamily: SYNE }} className="text-[9px] text-gray-700 border border-white/5 px-3 py-1 rounded uppercase tracking-widest">
                FASE 0 · SIMULACIÓN
              </span>
              <button onClick={onClose} style={{ fontFamily: SYNE }} className="mt-2 text-xs text-gray-500 hover:text-white border border-white/10 hover:border-white/25 px-4 py-2 rounded transition-all uppercase tracking-wider">
                CERRAR
              </button>
            </div>
          ) : (
            <>
              {/* Tu seleccion */}
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-3">
                  TU SELECCIÓN
                </label>

                {carrito.length === 0 ? (
                  <p style={{ fontFamily: INTER }} className="text-sm text-gray-600">No has seleccionado ningún grupo.</p>
                ) : (
                  <div className="space-y-2">
                    {carrito.map((item, idx) => (
                      <div key={`${item.grupo_id}_${item.idioma}`} className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-2">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-10 h-10 rounded object-cover border border-white/5 shrink-0"
                          onError={e => { e.target.style.display = 'none' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p style={{ fontFamily: SYNE, fontWeight: 700 }} className="text-xs text-white uppercase tracking-wider">
                            {item.nombre}
                          </p>
                          <p style={{ fontFamily: INTER }} className="text-[10px] text-gray-500">
                            {item.idioma} · {faseLunarTexto}
                          </p>
                          {item.tipo_contenido && (
                            <span style={{ fontFamily: INTER }} className="text-[9px] text-amber-400 uppercase tracking-widest">
                              {item.tipo_contenido === 'capitulo_saga' ? '🎬 Capítulo Saga' : '🎙️ Podcast Osos IA'}
                            </span>
                          )}
                        </div>
                        <span style={{ fontFamily: INTER, fontWeight: 600 }} className="text-xs text-fuchsia-400 shrink-0">{item.precio ?? 20}€</span>
                        <button
                          onClick={() => setCarrito(prev => prev.filter((_, i) => i !== idx))}
                          className="text-gray-600 hover:text-red-400 text-sm leading-none transition-colors shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Brief */}
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
                  BRIEF DE MENCIÓN
                </label>
                <textarea
                  value={brief}
                  onChange={e => setBrief(e.target.value)}
                  maxLength={300}
                  rows={4}
                  placeholder="Describe tu comercio, qué quieres que mencionen, tono del mensaje, cualquier detalle relevante para los personajes..."
                  style={{ fontFamily: INTER }}
                  className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors resize-none placeholder-gray-600"
                />
                <div style={{ fontFamily: INTER }} className="text-right text-xs text-gray-600 mt-1">{brief.length}/300</div>
              </div>

              {error && (
                <div style={{ fontFamily: INTER }} className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="px-6 py-4 border-t border-white/5 bg-black/20 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontFamily: INTER, fontWeight: 500 }} className="text-sm text-gray-400 uppercase tracking-widest">
                {carrito.length} grupo{carrito.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontFamily: INTER, fontWeight: 700 }} className="text-3xl text-white">{total}€</span>
            </div>
            {descuento > 0 && (
              <>
                <div style={{ fontFamily: INTER }}
                     className="flex items-center justify-between text-xs mb-2 px-1">
                  <span className="text-gray-500">Precio base</span>
                  <span className="text-gray-500 line-through">{carrito.reduce((sum, item) => sum + (item.precio ?? 20), 0)}€</span>
                </div>
                <div style={{ fontFamily: SYNE, fontWeight: 700 }}
                     className="flex items-center justify-between text-xs mb-3 px-1">
                  <span className="text-emerald-400 uppercase tracking-widest">
                    ✦ Descuento activo · -{descuento}%
                  </span>
                  <span className="text-emerald-400">{total}€</span>
                </div>
              </>
            )}
            <button
              onClick={handleContratar}
              disabled={loading || carrito.length === 0}
              style={{ fontFamily: SYNE, fontWeight: 700 }}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-sm font-bold uppercase tracking-widest rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(168,85,247,0.25)]"
            >
              {loading ? 'PROCESANDO...' : 'CONTRATAR'}
            </button>
            <p style={{ fontFamily: INTER }} className="text-xs text-gray-600 text-center mt-2 leading-relaxed">
              Estado inicial: PENDIENTE · El Estudio asigna locución disponible
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default MencionesModal;