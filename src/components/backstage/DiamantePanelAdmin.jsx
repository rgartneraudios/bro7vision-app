// src/components/backstage/DiamantePanelAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const HEADING = "'Noto Sans', sans-serif";
const INTER   = "'Inter', sans-serif";

const TIER_COLOR = {
  200:  { text: 'text-sky-400',    border: 'border-sky-500/40',    bg: 'bg-sky-950/30'    },
  500:  { text: 'text-violet-400', border: 'border-violet-500/40', bg: 'bg-violet-950/30' },
  1000: { text: 'text-amber-400',  border: 'border-amber-500/40',  bg: 'bg-amber-950/30'  },
};

export default function DiamantePanelAdmin({ session }) {
  const [pendientes, setPendientes] = useState([]);
  const [activos,    setActivos]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [msg,        setMsg]        = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: pend }, { data: act }] = await Promise.all([
      supabase
        .from('comercio_nidos')
        .select('*, b_advertiser_profiles(razon_social)')
        .eq('tipo_tarjeta', 'DIAMANTE')
        .eq('aprobado', false)
        .order('created_at', { ascending: true }),
      supabase
        .from('comercio_nidos')
        .select('*, b_advertiser_profiles(razon_social)')
        .eq('tipo_tarjeta', 'DIAMANTE')
        .eq('aprobado', true)
        .order('created_at', { ascending: false }),
    ]);
    setPendientes(pend || []);
    setActivos(act || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const flashMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3500); };

  const aprobar = async (item) => {
    setProcesando(item.id);
    const { error } = await supabase
      .from('comercio_nidos')
      .update({ aprobado: true })
      .eq('id', item.id);
    setProcesando(null);
    if (error) { flashMsg('❌ Error al aprobar: ' + error.message); return; }
    flashMsg('✅ Nido Diamante aprobado.');
    fetchData();
  };

  const rechazar = async (item) => {
    if (!window.confirm('¿Eliminar esta solicitud Diamante? La acción es irreversible.')) return;
    setProcesando(item.id);
    const { error } = await supabase
      .from('comercio_nidos')
      .delete()
      .eq('id', item.id);
    setProcesando(null);
    if (error) { flashMsg('❌ Error al rechazar: ' + error.message); return; }
    flashMsg('🗑 Solicitud eliminada.');
    fetchData();
  };

  const desactivar = async (item) => {
    setProcesando(item.id);
    const { error } = await supabase
      .from('comercio_nidos')
      .update({ aprobado: false, activo: false })
      .eq('id', item.id);
    setProcesando(null);
    if (error) { flashMsg('❌ Error al desactivar: ' + error.message); return; }
    flashMsg('⛔ Nido desactivado.');
    fetchData();
  };

  const comercioNombre = (item) =>
    item.b_advertiser_profiles?.razon_social || item.comercio_user_id?.slice(0, 8) || '—';

  const renderCard = (item, modo) => {
    const tc        = TIER_COLOR[item.denominacion] || TIER_COLOR[200];
    const enProceso = procesando === item.id;

    return (
      <div key={item.id}
        className={`rounded-xl border ${tc.border} ${tc.bg} p-5 flex flex-col gap-3`}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p style={{ fontFamily: HEADING, fontWeight: 800 }}
               className={`text-sm uppercase tracking-wider ${tc.text}`}>
              💎 Diamante {item.denominacion}€
            </p>
            <p style={{ fontFamily: INTER, fontWeight: 600 }}
               className="text-white text-base mt-0.5 leading-snug">
              {item.descripcion || '— sin descripción —'}
            </p>
            <p style={{ fontFamily: INTER }}
               className="text-gray-500 text-xs mt-1">
              {comercioNombre(item)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p style={{ fontFamily: HEADING, fontWeight: 700 }}
               className="text-white text-lg">
              {item.denominacion}€
            </p>
            <p style={{ fontFamily: INTER }}
               className="text-gray-600 text-xs mt-0.5">
              {item.cantidad_total} uds · ratio ×0.80
            </p>
          </div>
        </div>

        {/* Imagen aprobación */}
        {item.imagen_aprobacion && (
          <a href={item.imagen_aprobacion} target="_blank" rel="noreferrer">
            <img
              src={item.imagen_aprobacion}
              alt="Imagen del artículo"
              style={{ width: '100%', maxHeight: 160, objectFit: 'cover',
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </a>
        )}

        {/* Claves */}
        <div className="flex gap-3 text-xs">
          <div className="flex-1 rounded-lg bg-black/20 border border-white/5 px-3 py-2">
            <span style={{ fontFamily: HEADING }}
                  className="text-gray-600 uppercase tracking-widest text-[9px] block mb-1">
              Clave pública
            </span>
            <span style={{ fontFamily: 'monospace' }} className="text-gray-300">
              {item.palabra_clave_pub || '—'}
            </span>
          </div>
          <div className="flex-1 rounded-lg bg-black/20 border border-white/5 px-3 py-2">
            <span style={{ fontFamily: HEADING }}
                  className="text-gray-600 uppercase tracking-widest text-[9px] block mb-1">
              Clave secreta
            </span>
            <span style={{ fontFamily: 'monospace' }} className="text-gray-300">
              {item.clave_secreta || '—'}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 mt-1">
          {modo === 'pendiente' && (
            <>
              <button
                onClick={() => aprobar(item)}
                disabled={enProceso}
                style={{ fontFamily: HEADING, fontWeight: 700 }}
                className="flex-1 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs uppercase tracking-widest transition-all disabled:opacity-40">
                {enProceso ? '...' : '✅ APROBAR'}
              </button>
              <button
                onClick={() => rechazar(item)}
                disabled={enProceso}
                style={{ fontFamily: HEADING, fontWeight: 700 }}
                className="flex-1 py-2 rounded bg-zinc-800 hover:bg-red-950 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-400 text-xs uppercase tracking-widest transition-all disabled:opacity-40">
                RECHAZAR
              </button>
            </>
          )}
          {modo === 'activo' && (
            <button
              onClick={() => desactivar(item)}
              disabled={enProceso}
              style={{ fontFamily: HEADING, fontWeight: 700 }}
              className="w-full py-2 rounded bg-zinc-800 hover:bg-red-950 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-400 text-xs uppercase tracking-widest transition-all disabled:opacity-40">
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
        <span style={{ fontFamily: HEADING }}
              className="text-gray-600 text-sm uppercase tracking-widest animate-pulse">
          CARGANDO...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div className="mb-8">
        <h2 style={{ fontFamily: HEADING, fontWeight: 800 }}
            className="text-2xl text-white tracking-tight">
          💎 BÓVEDA DIAMANTE — PANEL ADMIN
        </h2>
        <p style={{ fontFamily: INTER }}
           className="text-gray-500 text-sm mt-1">
          Aprueba, rechaza o desactiva nidos Diamante de los comercios.
        </p>
      </div>

      {/* Flash msg */}
      {msg && (
        <div style={{ fontFamily: INTER }}
             className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
               msg.includes('✅') ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
               : msg.includes('❌') ? 'bg-red-950/40 border-red-500/30 text-red-300'
               : 'bg-zinc-900 border-white/10 text-gray-300'
             }`}>
          {msg}
        </div>
      )}

      {/* Pendientes */}
      <section className="mb-10">
        <h3 style={{ fontFamily: HEADING, fontWeight: 700 }}
            className="text-sm text-amber-400 uppercase tracking-widest mb-4">
          ⏳ PENDIENTES DE REVISIÓN ({pendientes.length})
        </h3>
        {pendientes.length === 0 ? (
          <p style={{ fontFamily: INTER }} className="text-gray-700 text-sm">
            Sin solicitudes pendientes.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {pendientes.map(item => renderCard(item, 'pendiente'))}
          </div>
        )}
      </section>

      {/* Activos */}
      <section>
        <h3 style={{ fontFamily: HEADING, fontWeight: 700 }}
            className="text-sm text-emerald-400 uppercase tracking-widest mb-4">
          ✅ APROBADOS ({activos.length})
        </h3>
        {activos.length === 0 ? (
          <p style={{ fontFamily: INTER }} className="text-gray-700 text-sm">
            No hay nidos aprobados.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {activos.map(item => renderCard(item, 'activo'))}
          </div>
        )}
      </section>
    </div>
  );
}