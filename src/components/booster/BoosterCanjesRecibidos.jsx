import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const CardStyle = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

const BoosterCanjesRecibidos = () => {
  const [canjes, setCanjes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: comercios } = await supabase
        .from('comercio_cupones')
        .select('id')
        .eq('user_id', user.id);

      console.log('[CanjesRecibidos] user.id:', user.id);
      console.log('[CanjesRecibidos] comercio_cupones found:', comercios);

      if (!comercios || comercios.length === 0) {
        setCanjes([]);
        return;
      }

      const ids = comercios.map(c => c.id);
      console.log('[CanjesRecibidos] buscando cupones con comercio_id IN:', ids);

      const { data: rows } = await supabase
        .from('cupones_generados')
        .select('*')
        .in('comercio_id', ids)
        .order('created_at', { ascending: false });

      console.log('[CanjesRecibidos] cupones_generados encontrados:', rows);

      if (!rows) {
        setCanjes([]);
        return;
      }

      const aliasMap = {};
      const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, alias')
          .in('id', userIds);
        if (profiles) {
          profiles.forEach(p => { aliasMap[p.id] = p.alias; });
        }
      }

      setCanjes(rows.map(r => ({
        ...r,
        aliasUsuario: r.user_id ? (aliasMap[r.user_id] || 'desconocido') : 'invitado',
      })));
    } catch (e) {
      console.error('Error loading canjes:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('canjes-recibidos')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'cupones_generados',
      }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">Cargando canjes...</p>
      </div>
    );
  }

  if (canjes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fadeIn">
        <span className="text-5xl">📋</span>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest text-center">
          Aún no tienes canjes recibidos
        </p>
        <p className="text-gray-600 text-xs text-center max-w-sm">
          Cuando un cliente canjee un cupón en tu comercio, aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-4xl">📋</span>
        <div>
          <h3 className="text-xl font-black text-cyan-400 tracking-widest uppercase">Canjes Recibidos</h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">Cupones canjeados por tus clientes</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-widest">
              <th className="py-3 px-4 font-bold">Cliente</th>
              <th className="py-3 px-4 font-bold">Palabras clave</th>
              <th className="py-3 px-4 font-bold">Tipo Brocard</th>
              <th className="py-3 px-4 font-bold">Fecha</th>
              <th className="py-3 px-4 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {canjes.map((canje) => (
              <tr key={canje.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 text-sm text-white font-bold">@{canje.aliasUsuario}</td>
                <td className="py-3 px-4">
                  <span className="text-xs font-mono text-cyan-300">
                    {canje.palabra_clave_1 || '—'} · {canje.palabra_clave_2 || '—'} · {canje.palabra_clave_3 || '—'}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-gray-300">{canje.tipo_brocard || '—'}</td>
                <td className="py-3 px-4 text-xs text-gray-400">{formatDate(canje.created_at)}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    canje.estado === 'USADO'
                      ? 'text-green-400 border-green-500/30 bg-green-950/20'
                      : 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20'
                  }`}>
                    {canje.estado === 'USADO' ? '✅ Usado' : '🟡 Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BoosterCanjesRecibidos;