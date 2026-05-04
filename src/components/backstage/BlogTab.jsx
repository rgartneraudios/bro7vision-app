import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const SYNE         = "'Exo 2', sans-serif";
const INTER        = "'Inter', sans-serif";
const SPACE_GROTESK = "'Space Grotesk', sans-serif";

/* Bordes metálicos cálidos — oro y plata */
const METALLIC_BORDER = (cat) => ({
  ESTRATEGIA: '#d4af37',
  TIMING:     '#c0c0c0',
  COBERTURA:  '#b8860b',
  FORMATO:    '#e8d5a3',
  AUDIENCIA:  '#cfb53b',
  ROI:        '#a8a8a8',
}[cat] || '#c0c0c0');

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

  return (
    <div className="w-full px-6 py-8">

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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {articulos.map(art => (
            <div
              key={art.id}
              className="flex flex-col rounded-xl overflow-hidden border backdrop-blur-sm"
              style={{
                background: 'rgba(10,5,16,0.55)',
                borderColor: METALLIC_BORDER(art.categoria),
                boxShadow: `0 0 12px ${METALLIC_BORDER(art.categoria)}22`,
              }}
            >
              {art.imagen_url && (
                <img
                  src={art.imagen_url}
                  alt={art.titulo}
                  className="w-full h-40 object-cover opacity-85"
                />
              )}
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center gap-2 mb-3">
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
                <p style={{ fontFamily: INTER, fontWeight: 400 }} className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap flex-1">
                  {art.cuerpo_texto}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default BlogTab;
