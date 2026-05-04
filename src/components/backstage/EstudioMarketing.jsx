import React, { useState } from 'react';

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

const SYNE  = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const EstudioMarketingTab = () => {
  const [hIdx, setHIdx] = useState(0);
  const [vIdx, setVIdx] = useState(0);

  return (
    <div className="max-w-[760px] mx-auto px-6 py-8 space-y-14">

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div>
        <h2 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-xl font-black tracking-tight text-white">
          ESTUDIO MARKETING
        </h2>
        <p style={{ fontFamily: INTER }} className="text-sm text-gray-500 mt-1 leading-relaxed">
          Ejemplos conceptuales de formatos publicitarios · Sustituye los placeholders con tu contenido real
        </p>
      </div>

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
  );
};

export default EstudioMarketingTab;
