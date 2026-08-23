// src/components/booster/BoosterMisCupones.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const CardStyle = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

const TIPO_CONFIG = {
  PLATA:    { emoji: '🥈', color: 'text-slate-300'  },
  ORO:      { emoji: '🥇', color: 'text-yellow-300' },
  DIAMANTE: { emoji: '💎', color: 'text-violet-300' },
  LUNA100:  { emoji: '🌙', color: 'text-cyan-300'   },
};

const BoosterMisCupones = () => {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rows } = await supabase
        .from('canjes_usuario')
        .select('id, pack_id, tipo_tarjeta, valor_euros, clave_secreta, lunas_gastadas, caduca_at, usado, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setCupones(rows || []);
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
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">
          Cargando cupones...
        </p>
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
          <h3 className="text-xl font-black text-fuchsia-400 tracking-widest uppercase">
            Mis Cupones
          </h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">
            Cupones que has canjeado
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {cupones.map((cupon) => {
          const cfg = TIPO_CONFIG[cupon.tipo_tarjeta] || TIPO_CONFIG.PLATA;
          return (
            <div key={cupon.id} className={CardStyle}>
              <div className="flex flex-col gap-4">

                {/* Cabecera tipo + valor */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cfg.emoji}</span>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${cfg.color}`}>
                      Tarjeta {cupon.tipo_tarjeta}
                    </p>
                    <p className="text-xl font-black text-white">
                      {cupon.valor_euros
                        ? `${Number(cupon.valor_euros).toLocaleString('es-ES', { minimumFractionDigits: 0 })} €`
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Datos */}
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <p className="text-xs text-gray-400">
                    <span className="font-bold text-yellow-400">🔐 Clave secreta:</span>{' '}
                    <span className="font-mono tracking-widest text-white">
                      {cupon.clave_secreta || '—'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    <span className="font-bold text-gray-300">Lunas gastadas:</span>{' '}
                    🌙 {cupon.lunas_gastadas?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    <span className="font-bold text-gray-300">Caduca:</span>{' '}
                    {formatDate(cupon.caduca_at)}
                  </p>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${
                    cupon.usado
                      ? 'text-green-400 border-green-500/30 bg-green-950/20'
                      : 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20'
                  }`}>
                    {cupon.usado ? '✅ Usado' : '🟡 Pendiente de usar'}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoosterMisCupones;