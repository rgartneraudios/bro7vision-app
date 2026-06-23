import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const CardStyle = "bg-pink-950/10 backdrop-blur-xl border border-pink-500/20 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

const OfertaCard = ({ oferta, expanded, onToggle }) => {
  const truncate = (text, max) =>
    text?.length > max ? text.slice(0, max) + '...' : text || '';

  const profile = oferta.profiles;

  return (
    <div
      onClick={onToggle}
      className="flex-shrink-0 w-120 bg-gradient-to-br from-amber-200 via-yellow-200 to-gray-300 border border-pink-400/50 rounded-2xl cursor-pointer hover:border-pink-500/70 transition-all animate-fadeIn overflow-hidden"
    >
      <div className="flex h-full">
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <p className="text-lg font-bold text-pink-700 mb-3">{profile?.alias || oferta.nombre_empresa || 'Empresa'}</p>
            <p className="text-xl text-pink-600/80 leading-relaxed mb-4">{truncate(oferta.oferta_descripcion, 120)}</p>
            {oferta.mensaje && (
              <p className="text-xl font-semibold text-pink-700 mb-3">"{oferta.mensaje}"</p>
            )}
          </div>

          {expanded && (
            <div className="mt-4 pt-3 border-t border-pink-300/40 space-y-2 text-base text-pink-800/90">
              {oferta.direccion && (
                <p><span className="text-pink-500">📍</span> {oferta.direccion}</p>
              )}
              {oferta.telefono && (
                <p><span className="text-pink-500">📞</span> {oferta.telefono}</p>
              )}
              {oferta.link_web && (
                <p>
                  <a
                    href={oferta.link_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-block text-pink-600 underline hover:text-pink-800 mt-1"
                  >
                    🔗 {oferta.link_web}
                  </a>
                  {oferta.link_verificado && (
                    <span className="inline-block ml-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-sm text-emerald-700 font-bold">
                      ✅ verificado
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {profile?.banner_url && (
          <div className="w-[200px] flex-shrink-0">
            <img
              src={profile.banner_url}
              alt=""
              className="w-full h-full object-cover"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const BoosterMisDeseos = ({ userId }) => {
  const [deseos, setDeseos] = useState([]);
  const [ofertasMap, setOfertasMap] = useState({});
  const [expandedMap, setExpandedMap] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const { data: deseosData } = await supabase
        .from('brodeseos')
        .select('id, descripcion, caduca_en')
        .eq('user_id', userId)
        .eq('activo', true);

      if (!deseosData || deseosData.length === 0) {
        setDeseos([]);
        setOfertasMap({});
        return;
      }

      setDeseos(deseosData);

      const ofertas = {};
      for (const deseo of deseosData) {
        const { data: ofertasData } = await supabase
          .from('brodeseos_ofertas')
          .select('*, profiles(banner_url, alias)')
          .eq('deseo_id', deseo.id);
        ofertas[deseo.id] = ofertasData || [];
      }
      setOfertasMap(ofertas);
    } catch (e) {
      console.error('Error loading deseos:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleExpand = (deseoId, ofertaId) => {
    setExpandedMap(prev => ({
      ...prev,
      [`${deseoId}-${ofertaId}`]: !prev[`${deseoId}-${ofertaId}`],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">Cargando deseos...</p>
      </div>
    );
  }

  if (deseos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fadeIn">
        <span className="text-5xl">💭</span>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest text-center">
          No tienes deseos publicados activos
        </p>
        <p className="text-gray-600 text-xs text-center max-w-sm">
          Díselo a Evelyn o Larry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0 animate-fadeIn max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">💭</span>
        <div>
          <h3 className="text-xl font-black text-pink-400 tracking-widest uppercase">Mis Deseos</h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">Ofertas recibidas de empresas</p>
        </div>
      </div>

      {deseos.map((deseo, idx) => {
        const ofertas = ofertasMap[deseo.id] || [];
        return (
          <div key={deseo.id}>
            {idx > 0 && (
              <div className="text-center text-gray-700 text-sm tracking-[0.5em] my-6 select-none">
                ────
              </div>
            )}

            <div className={CardStyle}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-pink-400">
                  Ofertas para tu deseo de {deseo.descripcion}
                </p>
                <span className="text-[11px] text-gray-500 font-mono whitespace-nowrap ml-4">
                  {deseo.caduca_en || ''}
                </span>
              </div>

              {ofertas.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aún no hay ofertas — las empresas están mirando 👀
                </p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {ofertas.map(oferta => {
                    const key = `${deseo.id}-${oferta.id}`;
                    return (
                      <OfertaCard
                        key={oferta.id}
                        oferta={oferta}
                        expanded={!!expandedMap[key]}
                        onToggle={() => toggleExpand(deseo.id, oferta.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoosterMisDeseos;