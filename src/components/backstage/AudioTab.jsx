import React, { useState, useMemo } from 'react';
import { getCitiesForCobertura } from '../../data/citycodes';

const SYNE  = "'Syne', sans-serif";
const INTER = "'Inter', sans-serif";

const FORMATOS = [
  { id: 'larry', label: 'DIARIO DE LARRY', img: '/emojis/larry.webp', descripcion: 'Podcast de entretenimiento · Nuevo episodio cada semana' },
];

const TIPO_MENCION = [
  { id: 'simple',    label: 'Mención simple',    descripcion: 'Nombre de marca citado por el presentador · ~10 seg' },
  { id: 'integrada', label: 'Mención integrada', descripcion: 'Marca integrada en el contenido del episodio · ~60 seg' },
];

const COBERTURAS_LIST = [
  { id: 'SALA_CIUDAD',        label: 'Sala Ciudad',        precio: null },
  { id: 'SALA_GRAN_CIUDAD',   label: 'Sala Gran Ciudad',   precio: null },
  { id: 'GIRA_REGIONAL',      label: 'Gira Regional',      precio: null },
  { id: 'GIRA_GRAN_REGIONAL', label: 'Gira Gran Regional', precio: null },
  { id: 'METROPOLIS',         label: 'Metrópolis',         precio: null },
  { id: 'GIRA_NACIONAL',      label: 'Gira Nacional',      precio: null },
  { id: 'GIRA_MUNDIAL',       label: 'Gira Mundial',       precio: null },
];

const NEEDS_CIUDAD = ['SALA_CIUDAD', 'SALA_GRAN_CIUDAD', 'GIRA_REGIONAL', 'GIRA_GRAN_REGIONAL', 'METROPOLIS'];

// ── Panel lateral ─────────────────────────────────────────────────────────────
const Panel = ({ formato, onClose }) => {
  const [tipoMencion, setTipoMencion] = useState('simple');
  const [cobertura,   setCobertura]   = useState('SALA_CIUDAD');
  const [ciudad,      setCiudad]      = useState('');
  const [marca,       setMarca]       = useState('');
  const [error,       setError]       = useState('');
  const [done,        setDone]        = useState(false);

  const needsCiudad = NEEDS_CIUDAD.includes(cobertura);
  const cities      = useMemo(() => getCitiesForCobertura(cobertura), [cobertura]);

  const handleCobertura = (id) => { setCobertura(id); setCiudad(''); };

  const handleSolicitar = () => {
    setError('');
    if (needsCiudad && !ciudad) { setError('Selecciona una ciudad para esta cobertura.'); return; }
    if (!marca.trim())          { setError('Indica la marca o producto a mencionar.'); return; }
    setDone(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[440px] bg-zinc-950 border-l border-white/10 flex flex-col shadow-2xl overflow-hidden">

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/30 shrink-0">
          <img src={formato.img} alt={formato.label} className="w-10 h-10 rounded-full object-cover border border-amber-900/40 bg-zinc-900 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-sm font-black text-white tracking-tight">
              AUDIO — {formato.label}
            </h3>
            <p style={{ fontFamily: INTER }} className="text-xs text-gray-500 mt-0.5">
              {formato.descripcion}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-lg leading-none transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {done ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="text-4xl">🎧</div>
              <p style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-white text-sm uppercase tracking-widest">
                Solicitud enviada
              </p>
              <p className="text-gray-500 text-xs max-w-[260px] leading-relaxed">
                Tu mención en <strong className="text-amber-400">{formato.label}</strong> ha sido registrada. El equipo la revisará en breve.
              </p>
              <span style={{ fontFamily: SYNE }} className="text-[9px] text-gray-700 border border-white/5 px-3 py-1 rounded uppercase tracking-widest">
                FASE 0 · SIMULACIÓN
              </span>
              <button onClick={onClose} style={{ fontFamily: SYNE }} className="mt-2 text-[10px] text-gray-500 hover:text-white border border-white/10 hover:border-white/25 px-4 py-2 rounded transition-all uppercase tracking-wider">
                CERRAR
              </button>
            </div>
          ) : (
            <>
              {/* Duración fija */}
              <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 rounded px-4 py-3">
                <span className="text-amber-400 text-base">🎙️</span>
                <div>
                  <p style={{ fontFamily: INTER, fontWeight: 600 }} className="text-sm text-white">
                    Por episodio
                  </p>
                  <p style={{ fontFamily: INTER }} className="text-xs text-gray-500 mt-0.5">
                    La mención se emite en un episodio completo del programa
                  </p>
                </div>
              </div>

              {/* Tipo de mención */}
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Tipo de mención
                </label>
                <div className="flex flex-col gap-2">
                  {TIPO_MENCION.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTipoMencion(t.id)}
                      style={{ fontFamily: INTER }}
                      className={`flex flex-col items-start px-4 py-2.5 rounded border text-left transition-all ${
                        tipoMencion === t.id
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                          : 'bg-zinc-900 border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'
                      }`}
                    >
                      <span className="text-sm font-semibold">{t.label}</span>
                      <span className={`text-xs mt-0.5 leading-snug ${tipoMencion === t.id ? 'text-amber-500/70' : 'text-gray-600'}`}>
                        {t.descripcion}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cobertura */}
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Cobertura
                </label>
                <div className="flex flex-col gap-1.5">
                  {COBERTURAS_LIST.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleCobertura(c.id)}
                      style={{ fontFamily: INTER }}
                      className={`flex items-center justify-between px-4 py-2.5 rounded border text-sm transition-all ${
                        cobertura === c.id
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                          : 'bg-zinc-900 border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'
                      }`}
                    >
                      <span className="font-medium">{c.label}</span>
                      <span className={`text-sm font-bold italic ${cobertura === c.id ? 'text-amber-600' : 'text-gray-600'}`}>
                        precio por definir
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ciudad */}
              {needsCiudad && (
                <div>
                  <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                    Ciudad
                  </label>
                  <select
                    value={ciudad}
                    onChange={e => setCiudad(e.target.value)}
                    style={{ fontFamily: INTER }}
                    className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded appearance-none focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="">— Selecciona ciudad —</option>
                    {cities.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Marca / producto */}
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Marca / Producto a mencionar
                </label>
                <textarea
                  value={marca}
                  onChange={e => setMarca(e.target.value)}
                  rows={3}
                  placeholder="Nombre de marca, producto, servicio o mensaje a incluir en el episodio..."
                  style={{ fontFamily: INTER }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded resize-none focus:outline-none focus:border-amber-500/50 placeholder:text-gray-600"
                />
              </div>

              {/* Error */}
              {error && (
                <p style={{ fontFamily: INTER }} className="text-red-400 text-sm bg-red-950/30 border border-red-900/30 px-3 py-2 rounded">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontFamily: INTER, fontWeight: 500 }} className="text-sm text-gray-500 uppercase tracking-wider">
                Precio estimado · por episodio
              </span>
              <span style={{ fontFamily: INTER, fontWeight: 700 }} className="text-amber-500 text-xl italic">
                Por definir
              </span>
            </div>
            <p style={{ fontFamily: INTER }} className="text-xs text-gray-700 mb-3 leading-relaxed">
              FASE 0 · Simulación — No se realizará ningún cargo real.
            </p>
            <button
              onClick={handleSolicitar}
              style={{ fontFamily: SYNE, fontWeight: 700 }}
              className="w-full bg-amber-700 hover:bg-amber-600 text-white text-sm font-bold uppercase tracking-widest py-3 rounded transition-all"
            >
              SOLICITAR MENCIÓN
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ── AudioTab ──────────────────────────────────────────────────────────────────
const AudioTab = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div className="mb-8">
        <h2 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-xl font-black tracking-tight text-white">
          AUDIO
        </h2>
        <p style={{ fontFamily: SYNE, fontWeight: 700, color: '#facc15' }} className="text-xl mt-1">
          Menciones en programas de audio del ecosistema · Más formatos próximamente
        </p>
      </div>

      {/* Formatos */}
      <div className="flex flex-col gap-4 max-w-xl">
        {FORMATOS.map(f => (
          <button
            key={f.id}
            onClick={() => setSelected(f)}
            className="group flex items-center gap-5 p-4 rounded border border-white/5 hover:border-amber-500/30 hover:bg-amber-950/10 bg-zinc-900/40 transition-all text-left"
          >
            <img
              src={f.img}
              alt={f.label}
              className="w-16 h-16 rounded-full object-cover border border-white/10 group-hover:border-amber-500/30 shrink-0 transition-all"
            />
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: SYNE, fontWeight: 800, color: '#f59e0b', textShadow: '0 0 10px rgba(245,158,11,0.3)' }} className="text-sm uppercase tracking-widest">
                {f.label}
              </p>
              <p style={{ fontFamily: INTER }} className="text-sm text-gray-500 mt-1 leading-relaxed">
                {f.descripcion}
              </p>
              <p style={{ fontFamily: INTER }} className="text-xs text-gray-600 mt-1.5 uppercase tracking-wider">
                Mención simple · Mención integrada
              </p>
            </div>
            <span
              style={{ fontFamily: SYNE, fontWeight: 700, color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' }}
              className="text-[9px] uppercase tracking-widest border px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              CONTRATAR
            </span>
          </button>
        ))}

        {/* Próximamente placeholder */}
        <div className="flex items-center gap-5 p-4 rounded border border-white/[0.03] bg-zinc-900/20 opacity-40">
          <div className="w-16 h-16 rounded-full border border-white/5 bg-zinc-900 shrink-0 flex items-center justify-center">
            <span className="text-2xl">🎧</span>
          </div>
          <div>
            <p style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-xs text-gray-600 uppercase tracking-widest">
              Más formatos
            </p>
            <p style={{ fontFamily: SYNE }} className="text-[9px] text-gray-700 mt-1 uppercase tracking-widest">
              FASE 0 · PRÓXIMAMENTE
            </p>
          </div>
        </div>
      </div>

      <p style={{ fontFamily: SYNE }} className="text-[9px] text-gray-700 mt-8 uppercase tracking-widest">
        FASE 0 · Simulación — No se realizará ningún cargo real
      </p>

      {selected && <Panel formato={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default AudioTab;
