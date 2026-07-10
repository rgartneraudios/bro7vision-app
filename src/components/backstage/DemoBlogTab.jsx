import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const DemoViewer = ({ titulo, subtitulo, videoUrl, vertical = false }) => (
  <div className="flex flex-col gap-2">
    <div className="text-2xl text-gray-400 uppercase tracking-widest font-bold"
      style={{ fontFamily: "'Exo 2', sans-serif" }}>
      {titulo}
    </div>
    <p style={{ fontFamily: "'Inter', sans-serif" }}
      className="text-xl text-gray-600 mb-1">{subtitulo}</p>
    <div
      className="rounded overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.1)] bg-black mx-auto"
      style={{
        aspectRatio: vertical ? '9/16' : '16/9',
        width: vertical ? '420px' : '720px',
      }}
    >
      <video
        src={videoUrl}
        controls
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  </div>
);

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
          DEMOS & BLOG
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
        <div className="flex flex-col gap-10 px-2 py-4">
          <DemoViewer
            titulo="Demo Horizontal — PC / Tablet"
            subtitulo="Publicidad muda integrada en escenario 16:9. Banner y texto aparecen y desaparecen sobre el fondo. Puedes utilizar un video vertical o una imagen que debes proporcionar en el panel de reserva junto a instrucciones específicas que necesites comunicar. Al ser los videos cortos y en bucle, la aparición de tu anuncio rondará los 8 segundos promedio. Procura incluir textos con datos de contacto claros."
            videoUrl="https://media.bro7vision.com/DEMOH1.mp4"
            vertical={false}
          />
          <DemoViewer
            titulo="Demo Vertical — Móvil"
            subtitulo="Publicidad muda integrada en escenario 9:16. Formato afiche con llamada a la acción. Puedes utilizar un video o una imagen en formato cuadrado 1:1 que debes proporcionar en el panel de reserva junto a instrucciones específicas que necesites comunicar. Al ser los videos cortos y en bucle, la aparición de tu anuncio rondará los 8 segundos promedio. Procura incluir textos con datos de contacto claros."
            videoUrl="https://media.bro7vision.com/DEMOV1.mp4"
            vertical={true}
          />
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
            <div className="grid grid-cols-2 gap-6">
              {articulos.map(art => (
<div
                    key={art.id}
                    className="flex flex-col rounded-xl overflow-hidden border backdrop-blur-sm w-full"
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
                  <div className="flex flex-col flex-1 px-4 py-3">
                    <div className="flex items-center gap-2 mb-3">
<span className={`text-2xl font-black text-white uppercase tracking-widest px-4 py-1.5 rounded ${CAT_COLOR(art.categoria)}`}
  style={{ textShadow: '0 0 10px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.3)' }}>
  {art.categoria || 'ESPECIAL'}
</span>
                      <span style={{ fontFamily: INTER, fontWeight: 300 }} className="text-base text-gray-400">
                        {fmtDate(art.created_at)}
                      </span>
                    </div>
                    <h3
                      style={{ fontFamily: SPACE_GROTESK, fontWeight: 700 }}
                      className="text-3xl text-white leading-tight mb-6 text-center"
                    >
                      {art.titulo}
                    </h3>
                    <p style={{ fontFamily: INTER, fontWeight: 400 }} className="text-lg text-gray-200 leading-relaxed flex-1">
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