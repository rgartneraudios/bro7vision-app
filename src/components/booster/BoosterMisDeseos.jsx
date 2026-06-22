import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const CardStyle = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

const OfertaCard = ({ oferta, expanded, onToggle }) => {
  const truncate = (text, max) =>
    text?.length > max ? text.slice(0, max) + '...' : text || '';

  return (
    <div
      onClick={onToggle}
      className="flex-shrink-0 w-64 bg-black/40 border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-cyan-500/30 transition-all animate-fadeIn"
    >
      <p className="text-sm font-bold text-white mb-1">{oferta.nombre_empresa || 'Empresa'}</p>
      <p className="text-xs text-gray-400">{truncate(oferta.oferta_descripcion, 60)}</p>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs text-gray-300">
          {oferta.direccion && (
            <p><span className="text-gray-500">📍</span> {oferta.direccion}</p>
          )}
          {oferta.telefono && (
            <p><span className="text-gray-500">📞</span> {oferta.telefono}</p>
          )}
          {oferta.mensaje && (
            <p className="text-gray-400">{oferta.mensaje}</p>
          )}
          {oferta.link ? (
            oferta.link_verificado ? (
              <a
                href={oferta.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-block text-cyan-400 underline hover:text-cyan-300 mt-1"
              >
                🔗 {oferta.link}
              </a>
            ) : (
              <p className="text-gray-500 mt-1">
                🔗 {oferta.link} <span className="inline-block ml-1 px-2 py-0.5 rounded-full border border-gray-600 text-[10px] text-gray-500">⚪ sin verificar</span>
              </p>
            )
          ) : null}
        </div>
      )}
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
          .select('*')
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
          <h3 className="text-xl font-black text-cyan-400 tracking-widest uppercase">Mis Deseos</h3>
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
                <p className="text-sm font-bold text-cyan-400">
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