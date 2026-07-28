import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import StickerCupon from './StickerCupon';

const CardStyle = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

const BoosterMisCupones = () => {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rows } = await supabase
        .from('cupones_generados')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!rows) {
        setCupones([]);
        return;
      }

      const comercioIds = rows.map(r => r.comercio_id).filter(Boolean);
      const bannerMap = {};
      if (comercioIds.length > 0) {
        const { data: comercios } = await supabase
          .from('comercio_cupones')
          .select('id, banner_url')
          .in('id', comercioIds);
        if (comercios) {
          comercios.forEach(c => { bannerMap[c.id] = c.banner_url || ''; });
        }
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

      setCupones(rows.map(r => ({
        ...r,
        aliasUsuario: r.user_id ? (aliasMap[r.user_id] || 'desconocido') : 'invitado',
        banner_11_url: bannerMap[r.comercio_id] || '',
      })));
    } catch (e) {
      console.error('Error loading cupones:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">Cargando cupones...</p>
      </div>
    );
  }

  if (cupones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fadeIn">
        <span className="text-5xl">🎫</span>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest text-center">
          Aún no tienes cupones canjeados
        </p>
        <p className="text-gray-600 text-xs text-center max-w-sm">
          Canjea un cupón en tu comercio favorito para verlo aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-4xl">🎫</span>
        <div>
          <h3 className="text-xl font-black text-fuchsia-400 tracking-widest uppercase">Mis Cupones</h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">Cupones que has canjeado</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {cupones.map((cupon) => (
          <div key={cupon.id} className={CardStyle}>
            <StickerCupon
              comercioNombre={cupon.comercio_nombre || 'Comercio'}
              tipoBrocard={cupon.tipo_brocard || ''}
              palabraClave1={cupon.palabra_clave_1 || ''}
              aliasUsuario={cupon.aliasUsuario}
              fechaCaduca={formatDate(cupon.caduca_at)}
              banner_11_url={cupon.banner_11_url}
              tipoTarjeta={cupon.tipo_tarjeta || ''}
              valorEuros={cupon.valor_euros ?? null}
              costeLunas={cupon.lunas_gastadas ?? null}
            />

            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              <p className="text-xs text-gray-300">
                <span className="font-bold text-yellow-400">🔐 Clave secreta:</span>{' '}
                <span className="text-white font-mono tracking-widest">{cupon.palabra_clave_3 || '—'}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-bold">Estado:</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  cupon.usado === true
                    ? 'text-green-400 border-green-500/30 bg-green-950/20'
                    : 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20'
                }`}>
                  {cupon.usado === true ? '✅ Usado' : '🟡 Pendiente'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoosterMisCupones;