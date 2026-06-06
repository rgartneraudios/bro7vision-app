import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const POR_PAGINA = 10;

const BoosterMuseo = () => {
  const [canjes, setCanjes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCanjes = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Obtener comercio_nombre del usuario desde comercio_cupones
        const { data: perfilData, error: perfilError } = await supabase
          .from('comercio_cupones')
          .select('comercio_nombre')
          .eq('user_id', user.id)
          .single();

        if (perfilError) throw perfilError;
        if (!perfilData?.comercio_nombre) {
          setCanjes([]);
          setTotal(0);
          setLoading(false);
          return;
        }

        const nombreComercio = perfilData.comercio_nombre;
        const from = (pagina - 1) * POR_PAGINA;
        const to = from + POR_PAGINA - 1;

        // 2. Filtrar cupones_generados por comercio_nombre
        const { data, count, error } = await supabase
          .from('cupones_generados')
          .select('codigo, descuento_pct, created_at, usado', { count: 'exact' })
          .eq('comercio_nombre', nombreComercio)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (data) setCanjes(data);
        if (count !== null) setTotal(count);
      } catch (err) {
        console.error('Error cargando museo:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCanjes();
  }, [pagina]);

  const totalPaginas = Math.ceil(total / POR_PAGINA);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">
          Cargando historial...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-10">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <span className="text-4xl">🏛️</span>
        <div>
          <h3 className="text-xl font-black text-amber-400 tracking-widest uppercase">
            Museo de Canjes
          </h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">
            {total} {total === 1 ? 'registro' : 'registros'} en total
          </p>
        </div>
      </div>

      {canjes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 border border-white/5 rounded-3xl bg-white/2">
          <span className="text-5xl opacity-30">🏛️</span>
          <p className="text-gray-600 text-xs uppercase tracking-widest text-center">
            Aún no tienes canjes registrados
          </p>
        </div>
      ) : (
        <>
          {/* TABLA */}
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
            {/* HEADER TABLA */}
            <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-white/10 bg-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Código</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Descuento</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fecha</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Estado</p>
            </div>

            {/* FILAS */}
            <div className="divide-y divide-white/5">
              {canjes.map((c, i) => (
                <div
                  key={c.codigo || i}
                  className="grid grid-cols-4 gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors"
                >
                  <p className="text-xs font-mono text-gray-300 tracking-wider truncate">
                    {c.codigo || '—'}
                  </p>
                  <p className="text-xs font-bold text-amber-400">
                    {c.descuento_pct || 0}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <p className={`text-xs font-bold uppercase tracking-widest ${
                    c.usado ? 'text-green-400' : 'text-gray-600'
                  }`}>
                    {c.usado ? '✓ Usado' : 'Pendiente'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="text-xs font-bold text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
              >
                ← Anterior
              </button>

              <span className="text-xs text-gray-600 font-bold">
                {pagina} / {totalPaginas}
              </span>

              <button
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="text-xs font-bold text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BoosterMuseo;
