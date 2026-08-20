import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const HEADING  = "'Noto Sans', sans-serif";
const INTER = "'Inter', sans-serif";

const TIER_COLOR = {
  200:  { text: 'text-sky-400',     border: 'border-sky-500/40',     bg: 'bg-sky-950/30'     },
  500:  { text: 'text-violet-400',  border: 'border-violet-500/40',  bg: 'bg-violet-950/30'  },
  1000: { text: 'text-amber-400',   border: 'border-amber-500/40',   bg: 'bg-amber-950/30'   },
};

const DiamantePanelAdmin = ({ session }) => {
  const [pendientes, setPendientes] = useState([]);
  const [activos,    setActivos]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [procesando, setProcesando] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: pend }, { data: act }] = await Promise.all([
      supabase
        .from('diamante_catalogo')
        .select('*, b_advertiser_profiles(razon_social, alias)')
        .eq('estado', 'PENDIENTE')
        .order('created_at', { ascending: true }),
      supabase
        .from('diamante_catalogo')
        .select('*, b_advertiser_profiles(razon_social, alias)')
        .eq('estado', 'ACTIVO')
        .order('created_at', { ascending: false }),
    ]);
    setPendientes(pend || []);
    setActivos(act || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const aprobar = async (item) => {
    setProcesando(item.id);
    await supabase
      .from('diamante_catalogo')
      .update({
        estado:          'ACTIVO',
        aprobado_por:    session.user.id,
        fecha_aprobacion: new Date().toISOString(),
      })
      .eq('id', item.id);
    setProcesando(null);
    fetchData();
  };

  const rechazar = async (item) => {
    setProcesando(item.id);
    await supabase
      .from('diamante_catalogo')
      .delete()
      .eq('id', item.id);
    setProcesando(null);
    fetchData();
  };

  const desactivar = async (item) => {
    setProcesando(item.id);
    await supabase
      .from('diamante_catalogo')
      .update({ estado: 'AGOTADO' })
      .eq('id', item.id);
    setProcesando(null);
    fetchData();
  };

  const comercioNombre = (item) =>
    item.b_advertiser_profiles?.razon_social ||
    item.b_advertiser_profiles?.alias        ||
    item.comercio_id.slice(0, 8);

  const renderCard = (item, modo) => {
    const tc = TIER_COLOR[item.tier] || TIER_COLOR[200];
    const enProceso = procesando === item.id;

    return (
      <div
        key={item.id}
        className={`rounded-xl border ${tc.border} ${tc.bg} p-5 flex flex-col gap-3`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p style={{ fontFamily: HEADING, fontWeight: 800 }}
               className={`text-sm uppercase tracking-wider ${tc.text}`}>
              💎 Diamante {item.tier} · {item.descuento_pct}%
            </p>
            <p style={{ fontFamily: INTER, fontWeight: 600 }}
               className="text-white text-base mt-0.5">
              {item.nombre_premio}
            </p>
            <p style={{ fontFamily: INTER }}
               className="text-gray-500 text-xs mt-0.5">
              {comercioNombre(item)} · {item.tipo}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p style={{ fontFamily: HEADING, fontWeight: 700 }}
               className="text-white text-lg">
              {item.valor_pvp}€ PVP
            </p>
            {modo === 'activo' && (
              <p style={{ fontFamily: INTER }}
                 className="text-gray-500 text-xs mt-0.5">
                Stock: {item.cantidad_disponible} / {item.cantidad_inicial}
              </p>
            )}
          </div>
        </div>

        {item.descripcion && (
          <p style={{ fontFamily: INTER }}
             className="text-gray-400 text-sm leading-relaxed">
            {item.descripcion}
          </p>
        )}

        {(item.fecha_inicio || item.fecha_fin) && (
          <p style={{ fontFamily: INTER }}
             className="text-gray-600 text-xs">
            {item.fecha_inicio && `Desde: ${item.fecha_inicio}`}
            {item.fecha_fin    && ` · Hasta: ${item.fecha_fin}`}
          </p>
        )}

        <div className="flex gap-2 mt-1">
          {modo === 'pendiente' && (
            <>
              <button
                onClick={() => aprobar(item)}
                disabled={enProceso}
                style={{ fontFamily: HEADING, fontWeight: 700 }}
                className="flex-1 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs uppercase tracking-widest transition-all disabled:opacity-40"
              >
                {enProceso ? '...' : 'APROBAR'}
              </button>
              <button
                onClick={() => rechazar(item)}
                disabled={enProceso}
                style={{ fontFamily: HEADING, fontWeight: 700 }}
                className="flex-1 py-2 rounded bg-zinc-800 hover:bg-red-950 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-400 text-xs uppercase tracking-widest transition-all disabled:opacity-40"
              >
                RECHAZAR
              </button>
            </>
          )}
          {modo === 'activo' && (
            <button
              onClick={() => desactivar(item)}
              disabled={enProceso}
              style={{ fontFamily: HEADING, fontWeight: 700 }}
              className="w-full py-2 rounded bg-zinc-800 hover:bg-red-950 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-400 text-xs uppercase tracking-widest transition-all disabled:opacity-40"
            >
              {enProceso ? '...' : 'DESACTIVAR'}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span style={{ fontFamily: HEADING }} className="text-gray-600 text-sm uppercase tracking-widest animate-pulse">
          CARGANDO CATÁLOGO...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div className="mb-8">
        <h2 style={{ fontFamily: HEADING, fontWeight: 800 }}
            className="text-2xl text-white tracking-tight">
          💎 BÓVEDA DIAMANTE — PANEL ADMIN
        </h2>
        <p style={{ fontFamily: INTER }}
           className="text-gray-500 text-sm mt-1">
          Aprueba, rechaza o desactiva premios del catálogo Diamante.
        </p>
      </div>

      <section className="mb-10">
        <h3 style={{ fontFamily: HEADING, fontWeight: 700 }}
            className="text-sm text-amber-400 uppercase tracking-widest mb-4">
          ⏳ PENDIENTES DE REVISIÓN ({pendientes.length})
        </h3>
        {pendientes.length === 0 ? (
          <p style={{ fontFamily: INTER }}
             className="text-gray-700 text-sm">
            Sin solicitudes pendientes.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {pendientes.map(item => renderCard(item, 'pendiente'))}
          </div>
        )}
      </section>

      <section>
        <h3 style={{ fontFamily: HEADING, fontWeight: 700 }}
            className="text-sm text-emerald-400 uppercase tracking-widest mb-4">
          ✅ ACTIVOS EN CATÁLOGO ({activos.length})
        </h3>
        {activos.length === 0 ? (
          <p style={{ fontFamily: INTER }}
             className="text-gray-700 text-sm">
            No hay premios activos.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {activos.map(item => renderCard(item, 'activo'))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DiamantePanelAdmin;