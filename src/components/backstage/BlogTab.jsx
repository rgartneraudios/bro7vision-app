import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const SYNE         = "'Syne', sans-serif";
const INTER        = "'Inter', sans-serif";
const SPACE_GROTESK = "'Space Grotesk', sans-serif";

const CAT_BORDER = (cat) => ({
  ESTRATEGIA: '#a855f7',
  TIMING:     '#f59e0b',
  COBERTURA:  '#10b981',
  FORMATO:    '#00ffff',
  AUDIENCIA:  '#ff00ff',
  ROI:        '#f97316',
}[cat] || '#00ffff');

const CAT_COLOR = (cat) => ({
  ESTRATEGIA: 'bg-purple-700',
  TIMING:     'bg-amber-600',
  COBERTURA:  'bg-emerald-700',
  FORMATO:    'bg-cyan-700',
  AUDIENCIA:  'bg-fuchsia-700',
  ROI:        'bg-orange-700',
}[cat] || 'bg-cyan-700');

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

const BlogTab = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    supabase
      .from('bs_estudio_blog')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setArticulos(data || []); setLoading(false); });
  }, []);

  const featured = articulos.find(a => a.destacado) || articulos[0] || null;
  const rest      = articulos.filter(a => a.id !== featured?.id);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h2 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-xl font-black tracking-tight text-white">
          BLOG
        </h2>
        <p style={{ fontFamily: INTER }} className="text-sm text-gray-500 mt-1">
          Estrategia, timing y cobertura · Artículos del ecosistema Bro7Vision
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <span style={{ fontFamily: SYNE, fontWeight: 600 }} className="text-gray-500 text-xs animate-pulse tracking-widest uppercase">
            Cargando redacción…
          </span>
        </div>
      )}

      {!loading && articulos.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
          <div className="text-5xl">📰</div>
          <h3 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-base text-gray-500 uppercase tracking-widest">
            Redacción Vacía
          </h3>
          <p style={{ fontFamily: INTER }} className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Los artículos de estrategia publicitaria aparecerán aquí una vez que el equipo editorial los publique.
          </p>
        </div>
      )}

      {!loading && articulos.length > 0 && (
        <>
          {/* Card destacada */}
          {featured && (
            <div
              className="rounded-xl overflow-hidden mb-6 border"
              style={{ background: '#0a0510', borderColor: CAT_BORDER(featured.categoria) }}
            >
              {featured.imagen_url && (
                <img
                  src={featured.imagen_url}
                  alt={featured.titulo}
                  className="w-full max-h-80 object-cover"
                />
              )}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[9px] font-black text-white uppercase tracking-widest px-3 py-1 rounded ${CAT_COLOR(featured.categoria)}`}>
                    {featured.categoria || 'ESPECIAL'}
                  </span>
                  <span style={{ fontFamily: INTER, fontWeight: 300 }} className="text-xs text-gray-400 uppercase tracking-wider">
                    {fmtDate(featured.created_at)}
                  </span>
                </div>
                <h2
                  style={{ fontFamily: SPACE_GROTESK, fontWeight: 700, letterSpacing: '-0.02em' }}
                  className="text-4xl sm:text-5xl text-white leading-[1.05] mb-5"
                >
                  {featured.titulo}
                </h2>
                <p style={{ fontFamily: INTER, fontWeight: 400 }} className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {featured.cuerpo_texto}
                </p>
              </div>
            </div>
          )}

          {/* Grid 2 columnas */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rest.map(art => (
                <div
                  key={art.id}
                  className="rounded-xl overflow-hidden border"
                  style={{ background: '#0a0510', borderColor: CAT_BORDER(art.categoria) }}
                >
                  {art.imagen_url && (
                    <img
                      src={art.imagen_url}
                      alt={art.titulo}
                      className="w-full h-36 object-cover opacity-80"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[8px] font-black text-white uppercase tracking-widest px-2 py-0.5 rounded ${CAT_COLOR(art.categoria)}`}>
                        {art.categoria || 'ESPECIAL'}
                      </span>
                      <span style={{ fontFamily: INTER, fontWeight: 300 }} className="text-[9px] text-gray-500">
                        {fmtDate(art.created_at)}
                      </span>
                    </div>
                    <h3
                      style={{ fontFamily: SPACE_GROTESK, fontWeight: 700 }}
                      className="text-xl text-white leading-tight mb-3"
                    >
                      {art.titulo}
                    </h3>
                    <p style={{ fontFamily: INTER, fontWeight: 400 }} className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {art.cuerpo_texto}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default BlogTab;
