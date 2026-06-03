import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ColeccionCupones = () => {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(null);

  useEffect(() => {
    const fetchColeccion = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('cupones_generados')
        .select('id, codigo, descuento_pct, comercio_nombre, mini_url, usado, caduca_en, created_at')
        .eq('user_id', user.id)
        .or('usado.eq.true,caduca_en.lt.' + new Date().toISOString())
        .order('created_at', { ascending: false });

      if (data) setCupones(data);
      setLoading(false);
    };
    fetchColeccion();
  }, []);

  const copiar = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  };

  const estado = (c) => {
    if (c.usado) return { label: 'USADO', color: 'text-green-600', border: 'border-green-900/40', bg: 'bg-green-950/10' };
    if (new Date(c.caduca_en) < new Date()) return { label: 'CADUCADO', color: 'text-red-700', border: 'border-red-900/30', bg: 'bg-red-950/10' };
    return { label: 'ACTIVO', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-950/10' };
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">Cargando colección...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-10">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <span className="text-4xl">🎴</span>
        <div>
          <h3 className="text-xl font-black text-fuchsia-400 tracking-widest uppercase">Museo de Cupones</h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">
            {cupones.length} {cupones.length === 1 ? 'cromo' : 'cromos'} en tu colección
          </p>
        </div>
      </div>

      {cupones.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 border border-white/5 rounded-3xl bg-white/2">
          <span className="text-5xl opacity-30">🎴</span>
          <p className="text-gray-600 text-xs uppercase tracking-widest text-center">
            Aún no tienes cupones en tu colección
          </p>
          <p className="text-gray-700 text-[10px] text-center max-w-xs">
            Los cupones que uses o caduquen aparecerán aquí como recuerdo
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cupones.map((c) => {
            const est = estado(c);
            const esUsado = c.usado;
            return (
              <div key={c.id}
                className={`relative rounded-2xl border ${est.border} ${est.bg} p-5 flex flex-col gap-3 
                  ${esUsado ? 'opacity-60' : 'opacity-75'} 
                  transition-all hover:opacity-90`}>

                {/* SELLO DIAGONAL */}
                <div className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${est.border} ${est.color}`}>
                  {est.label}
                </div>

                {/* COMERCIO + DESCUENTO */}
                <div>
                  <p className="text-white font-black text-base leading-tight pr-16">{c.comercio_nombre}</p>
                  <p className={`${est.color} text-2xl font-black mt-1`}>{c.descuento_pct}%</p>
                </div>

                {/* CÓDIGO — siempre visible */}
                <div className={`flex items-center gap-2 bg-black/40 rounded-xl px-3 py-2 border ${est.border}`}>
                  <span className="font-mono text-xs tracking-widest text-gray-400 flex-1">{c.codigo}</span>
                  <button
                    onClick={() => copiar(c.codigo)}
                    className="text-gray-600 hover:text-white transition-colors text-xs shrink-0"
                    title="Copiar código">
                    {copiado === c.codigo ? '✓' : '📋'}
                  </button>
                </div>

                {/* FECHAS */}
                <div className="flex justify-between text-[9px] text-gray-600 uppercase tracking-wider font-bold border-t border-white/5 pt-2">
                  <span>Obtenido: {new Date(c.created_at).toLocaleDateString('es-ES')}</span>
                  <span>Caducó: {new Date(c.caduca_en).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-gray-700 uppercase tracking-widest pt-4">
        Los códigos se conservan para consultas e incidencias
      </p>
    </div>
  );
};

export default ColeccionCupones;
