// src/components/booster/BoosterMisCupones.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import StickerCupon from './StickerCupon';

const BoosterMisCupones = () => {
  const [cupones,      setCupones]      = useState([]);
  const [aliasUsuario, setAliasUsuario] = useState('');
  const [loading,      setLoading]      = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1 — Alias del usuario actual
      const { data: perfil } = await supabase
        .from('profiles')
        .select('alias')
        .eq('id', user.id)
        .single();
      setAliasUsuario(perfil?.alias || '');

      // 2 — Canjes con join hasta comercio_nidos
      const { data: rows } = await supabase
        .from('canjes_usuario')
        .select(`
          id, pack_id, tipo_tarjeta, valor_euros, clave_secreta,
          lunas_gastadas, caduca_at, usado, created_at,
          pack_tarjetas!canjes_usuario_pack_id_fkey (
            nido_id,
            comercio_nidos!pack_tarjetas_nido_id_fkey (
              imagen_aprobacion,
              comercio_user_id,
              descripcion,
              compra_minima
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!rows?.length) { setCupones([]); return; }

      // 3 — razon_social de cada comercio
      const comercioIds = [...new Set(
        rows
          .map(r => r.pack_tarjetas?.comercio_nidos?.comercio_user_id)
          .filter(Boolean)
      )];

      const { data: perfiles } = await supabase
        .from('b_advertiser_profiles')
        .select('id, razon_social')
        .in('id', comercioIds);

      const perfilMap = Object.fromEntries(
        (perfiles || []).map(p => [p.id, p.razon_social])
      );

      // 4 — Merge
      const enriquecidos = rows.map(r => {
        const nido = r.pack_tarjetas?.comercio_nidos || {};
        return {
          ...r,
          imagen_aprobacion: nido.imagen_aprobacion || null,
          descripcion:       nido.descripcion       || null,
          compra_minima:     nido.compra_minima      || null,
          comercioNombre:    perfilMap[nido.comercio_user_id] || 'Comercio',
        };
      });

      setCupones(enriquecidos);
    } catch (e) {
      console.error('Error loading cupones:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const formatDate = (d) => {
    if (!d) return null;
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
    <div className="space-y-12 animate-fadeIn max-w-3xl mx-auto pb-10">

      <div className="flex items-center gap-4 mb-2">
        <span className="text-4xl">🎫</span>
        <div>
          <h3 className="text-xl font-black text-fuchsia-400 tracking-widest uppercase">
            Mis Cupones
          </h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">
            Clic en el sticker para ver los detalles
          </p>
        </div>
      </div>

      {cupones.map((c) => (
        <div key={c.id} className="flex flex-col items-center gap-3">

          <StickerCupon
            comercioNombre  = {c.comercioNombre}
            claveSecreta    = {c.clave_secreta}
            aliasUsuario    = {aliasUsuario}
            fechaCaduca     = {formatDate(c.caduca_at)}
            banner_11_url   = {c.imagen_aprobacion}
            tipoTarjeta     = {c.tipo_tarjeta}
            valorEuros      = {c.valor_euros}
            costeLunas      = {c.lunas_gastadas}
            descripcion     = {c.descripcion}
            compraMinima    = {c.compra_minima}
            usado           = {c.usado}
          />

          {/* Clave secreta fuera para fácil copia */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-yellow-400 font-bold tracking-widest uppercase">
              🔐 Clave secreta:
            </span>
            <span className="font-mono text-white tracking-widest text-sm bg-white/5 border border-white/10 px-4 py-1.5 rounded-full select-all">
              {c.clave_secreta}
            </span>
          </div>

        </div>
      ))}

    </div>
  );
};

export default BoosterMisCupones;