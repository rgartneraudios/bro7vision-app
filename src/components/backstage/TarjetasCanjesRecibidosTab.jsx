import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const CardStyle = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

const BoosterCanjesRecibidos = () => {
  const [canjes, setCanjes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [showHistorial, setShowHistorial] = useState(false);

  const load = useCallback(async (verHistorial) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: comercios } = await supabase
        .from('comercio_cupones')
        .select('id')
        .eq('user_id', user.id);

      if (!comercios || comercios.length === 0) {
        setCanjes([]);
        return;
      }

      const ids = comercios.map(c => c.id);

      let query = supabase
        .from('cupones_generados')
        .select('*')
        .in('comercio_id', ids);

      if (!verHistorial) {
        query = query.gt('caduca_at', new Date().toISOString());
      }

      const { data: rows } = await query.order('created_at', { ascending: false });

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
    load(showHistorial);

    const channel = supabase
      .channel('canjes-recibidos')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'cupones_generados',
      }, () => {
        load(showHistorial);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, showHistorial]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredCanjes = canjes.filter(c => {
    const matchesAlias = c.aliasUsuario.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || c.estado === statusFilter;
    return matchesAlias && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">Cargando canjes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-4xl">📋</span>
        <div>
          <h3 className="text-xl font-black text-cyan-400 tracking-widest uppercase">Canjes Recibidos</h3>
          <p className="text-sm text-gray-500 font-bold tracking-widest mt-0.5">Cupones canjeados por tus clientes</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Buscar por alias..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-blue-950/20 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder-gray-500 outline-none focus:border-cyan-500/50 transition-colors flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-blue-950/20 border border-white/10 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-cyan-500/50 transition-colors"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="PENDIENTE">🟡 Pendiente</option>
          <option value="USADO">✅ Usado</option>
        </select>
        <button
          onClick={() => setShowHistorial(h => !h)}
          className={`text-sm font-bold tracking-widest uppercase px-5 py-3 rounded-xl border transition-colors ${
            showHistorial
              ? 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20'
              : 'text-gray-500 border-white/10 hover:border-white/20'
          }`}
        >
          {showHistorial ? '◀ Fase actual' : '📜 Ver historial completo'}
        </button>
      </div>

      {filteredCanjes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fadeIn">
          <span className="text-5xl">📋</span>
          <p className="text-gray-400 text-base font-bold uppercase tracking-widest text-center">
            {canjes.length === 0
              ? 'Aún no tienes canjes recibidos'
              : 'No hay resultados con esos filtros'}
          </p>
          <p className="text-gray-600 text-sm text-center max-w-sm">
            {canjes.length === 0
              ? 'Cuando un cliente canjee un cupón en tu comercio, aparecerá aquí.'
              : 'Prueba a cambiar los filtros o el término de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-widest">
                <th className="py-3 px-4 font-bold">Cliente</th>
                <th className="py-3 px-4 font-bold">Palabras clave</th>
                <th className="py-3 px-4 font-bold">Tipo Tarjeta</th>
                <th className="py-3 px-4 font-bold">Fecha</th>
                <th className="py-3 px-4 font-bold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredCanjes.map((canje) => (
                <tr key={canje.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-sm text-white font-bold">@{canje.aliasUsuario}</td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-mono text-cyan-300">
                      {canje.palabra_clave_1 || '—'} · {canje.palabra_clave_2 || '—'} · {canje.palabra_clave_3 || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">{canje.tipo_tarjeta || '—'}</td>
                  <td className="py-3 px-4 text-sm text-gray-400">{formatDate(canje.created_at)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
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
      )}
    </div>
  );
};

export default BoosterCanjesRecibidos;