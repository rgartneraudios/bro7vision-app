import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const GALLERY_H = [
  {
    id: 1,
    titulo: 'Spot Horizontal — Formato PC',
    descripcion: 'Anuncio conceptual en formato paisaje para slots PC. Ideal para branding de impacto y campañas de producto con máxima visibilidad en pantallas de escritorio.',
    src: 'https://www.youtube.com/embed/jNQXAC9IVRw?rel=0&modestbranding=1',
  },
];

const GALLERY_V = [
  {
    id: 1,
    titulo: 'Story Vertical — Formato Mobile',
    descripcion: 'Creatividad en formato retrato optimizada para slots MT. Máxima ocupación de pantalla y alta tasa de interacción en dispositivos móviles.',
    src: 'https://www.youtube.com/embed/jNQXAC9IVRw?rel=0&modestbranding=1',
  },
];

const SYNE         = "'Exo 2', sans-serif";
const INTER        = "'Inter', sans-serif";
const SPACE_GROTESK = "'Space Grotesk', sans-serif";

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

const EstudioMarketingTab = () => {
  const [subTab, setSubTab] = useState('estudio');
  const [hIdx, setHIdx] = useState(0);
  const [vIdx, setVIdx] = useState(0);
  const [articulos, setArticulos] = useState([]);
  const [loadingBlog, setLoadingBlog] = useState(true);

  useEffect(() => {
    supabase
      .from('bs_estudio_blog')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setArticulos(data || []); setLoadingBlog(false); });
  }, []);

  return (
    <div className="w-full px-8 py-8">

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;700&display=swap');`}</style>

      {/* Header */}
      <div>
        <h2 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-xl font-black tracking-tight text-white">
          ESTUDIO & GUÍA
        </h2>
        <p style={{ fontFamily: INTER }} className="text-sm text-gray-500 mt-1 leading-relaxed">
          Ejemplos conceptuales de formatos publicitarios · Estrategia, timing y cobertura
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-8">
        {[
          { id: 'estudio', label: 'FORMATOS PUBLICITARIOS' },
          { id: 'blog',    label: 'GUÍA & ESTRATEGIA'      },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            style={{ fontFamily: SYNE }}
            className={`px-5 py-3 text-xs font-black uppercase tracking-widest transition-all ${
              subTab === t.id
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'estudio' && (
        <div className="max-w-[860px] mx-auto space-y-14">
          {/* Formato Horizontal */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-sm text-cyan-400 uppercase tracking-widest">
                  Formato Horizontal
                </h3>
                <p style={{ fontFamily: INTER }} className="text-xs text-gray-500 mt-0.5">
                  Slots PC · Ratio 16:9
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHIdx(i => Math.max(0, i - 1))}
                  disabled={hIdx === 0}
                  className="w-7 h-7 flex items-center justify-center border border-white/10 hover:border-white/30 text-gray-500 hover:text-white rounded transition-all disabled:opacity-20 disabled:cursor-default"
                >◀</button>
                <span style={{ fontFamily: INTER }} className="text-[9px] text-gray-500 w-10 text-center">{hIdx + 1} / {GALLERY_H.length}</span>
                <button
                  onClick={() => setHIdx(i => Math.min(GALLERY_H.length - 1, i + 1))}
                  disabled={hIdx === GALLERY_H.length - 1}
                  className="w-7 h-7 flex items-center justify-center border border-white/10 hover:border-white/30 text-gray-500 hover:text-white rounded transition-all disabled:opacity-20 disabled:cursor-default"
                >▶</button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-zinc-900 border border-white/8">
              <div className="w-full bg-black" style={{ aspectRatio: '16/9' }}>
                <iframe
                  src={GALLERY_H[hIdx].src}
                  title={GALLERY_H[hIdx].titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
              <div className="p-5">
                <h4 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-xl text-white mb-3">
                  {GALLERY_H[hIdx].titulo}
                </h4>
                <p style={{ fontFamily: INTER }} className="text-base text-gray-300 leading-relaxed">
                  {GALLERY_H[hIdx].descripcion}
                </p>
              </div>
            </div>
          </section>

          {/* Formato Vertical */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-sm text-fuchsia-400 uppercase tracking-widest">
                  Formato Vertical
                </h3>
                <p style={{ fontFamily: INTER }} className="text-xs text-gray-500 mt-0.5">
                  Slots MT · Ratio 9:16
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVIdx(i => Math.max(0, i - 1))}
                  disabled={vIdx === 0}
                  className="w-7 h-7 flex items-center justify-center border border-white/10 hover:border-white/30 text-gray-500 hover:text-white rounded transition-all disabled:opacity-20 disabled:cursor-default"
                >▲</button>
                <span style={{ fontFamily: INTER }} className="text-[9px] text-gray-500 w-10 text-center">{vIdx + 1} / {GALLERY_V.length}</span>
                <button
                  onClick={() => setVIdx(i => Math.min(GALLERY_V.length - 1, i + 1))}
                  disabled={vIdx === GALLERY_V.length - 1}
                  className="w-7 h-7 flex items-center justify-center border border-white/10 hover:border-white/30 text-gray-500 hover:text-white rounded transition-all disabled:opacity-20 disabled:cursor-default"
                >▼</button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-zinc-900 border border-white/8 flex flex-col items-center">
              <div className="w-full max-w-[320px] bg-black" style={{ aspectRatio: '9/16' }}>
                <iframe
                  src={GALLERY_V[vIdx].src}
                  title={GALLERY_V[vIdx].titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
              <div className="w-full p-5">
                <h4 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-xl text-white mb-3">
                  {GALLERY_V[vIdx].titulo}
                </h4>
                <p style={{ fontFamily: INTER }} className="text-base text-gray-300 leading-relaxed">
                  {GALLERY_V[vIdx].descripcion}
                </p>
              </div>
            </div>
          </section>
          </div>
      )}

      {subTab === 'blog' && (
        <div className="w-full">
          {loadingBlog && (
            <div className="flex items-center justify-center h-64">
              <span style={{ fontFamily: SYNE, fontWeight: 600 }} className="text-gray-500 text-xs animate-pulse tracking-widest uppercase">
                Cargando redacción…
              </span>
            </div>
          )}

          {!loadingBlog && articulos.length === 0 && (
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

          {!loadingBlog && articulos.length > 0 && (
            <div className="grid grid-cols-3 gap-5">
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
      )}

    </div>
  );
};

export default EstudioMarketingTab;