import React, { useState, useMemo } from 'react';
import { getCitiesForCobertura } from '../../data/citycodes';

const SYNE  = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const SECTORES = [
  { id: 'servicios', label: 'SLIDE RAIL Canjes de Luna', img: '/images/isabella_1.webp'  },
  { id: 'avisos',    label: 'SLIDE RAIL SHOP AMIGOS',    img: '/images/evelyn_5.webp'    },
];

const TURNOS_LIST = [
  { id: 1, label: 'T1', horario: '05:00 – 11:00', factor: 0.8  },
  { id: 2, label: 'T2', horario: '11:00 – 17:00', factor: 1.0  },
  { id: 3, label: 'T3', horario: '17:00 – 23:00', factor: 1.25 },
  { id: 4, label: 'T4', horario: '23:00 – 05:00', factor: 0.9  },
];

const COBERTURAS_LIST = [
  { id: 'SALA_CIUDAD',        label: 'Sala Ciudad',        precio: 20  },
  { id: 'SALA_GRAN_CIUDAD',   label: 'Sala Gran Ciudad',   precio: 60  },
  { id: 'GIRA_REGIONAL',      label: 'Gira Regional',      precio: 80  },
  { id: 'GIRA_GRAN_REGIONAL', label: 'Gira Gran Regional', precio: 160 },
  { id: 'METROPOLIS',         label: 'Metrópolis',         precio: 350 },
  { id: 'GIRA_NACIONAL',      label: 'Gira Nacional',      precio: 500 },
  { id: 'GIRA_MUNDIAL',       label: 'Gira Mundial',       precio: 800 },
];

const NEEDS_CIUDAD = ['SALA_CIUDAD', 'SALA_GRAN_CIUDAD', 'GIRA_REGIONAL', 'GIRA_GRAN_REGIONAL', 'METROPOLIS'];

// ── Panel lateral ─────────────────────────────────────────────────────────────
const Panel = ({ sector, role, onClose }) => {
  const isDirector = role === 'director';

  const [turno,     setTurno]     = useState(2);
  const [cobertura, setCobertura] = useState('SALA_CIUDAD');
  const [ciudad,    setCiudad]    = useState('');
  const [guion,     setGuion]     = useState('');
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);

  const needsCiudad = NEEDS_CIUDAD.includes(cobertura);

  const cities = useMemo(() => getCitiesForCobertura(cobertura), [cobertura]);

  const turnoData     = TURNOS_LIST.find(t => t.id === turno);
  const coberturaData = COBERTURAS_LIST.find(c => c.id === cobertura);
  const precioBase    = coberturaData?.precio ?? 0;
  const precio        = Math.round(precioBase * (turnoData?.factor ?? 1));

  const handleCobertura = (id) => { setCobertura(id); setCiudad(''); };

  const handleReservar = () => {
    setError('');
    if (needsCiudad && !ciudad) { setError('Selecciona una ciudad para esta cobertura.'); return; }
    if (!guion.trim())          { setError('El guión / descripción es obligatorio.'); return; }
    setDone(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[440px] bg-zinc-950 border-l border-white/10 flex flex-col shadow-2xl overflow-hidden">

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/30 shrink-0">
          <div
            className="w-10 h-16 rounded overflow-hidden border border-white/10 shrink-0 bg-zinc-900"
            style={{ backgroundImage: `url(${sector.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="flex-1 min-w-0">
            <h3 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-sm font-black text-white tracking-tight">
              SLIDE RAIL — {sector.label}
            </h3>
            <p style={{ fontFamily: INTER }} className="text-xs text-gray-500 mt-0.5">
              {isDirector ? 'Vista Director · Estado de ocupación' : 'Contratación de slot publicitario'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-lg leading-none transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {done ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="text-4xl">🎞️</div>
              <p style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-white text-sm uppercase tracking-widest">
                Slot reservado
              </p>
              <p style={{ fontFamily: INTER }} className="text-gray-500 text-sm max-w-[260px] leading-relaxed">
                Tu slot en <strong className="text-purple-400">{sector.label}</strong> · {turnoData?.label} ha sido registrado.<br />El equipo lo procesará en breve.
              </p>
              <span style={{ fontFamily: SYNE }} className="text-[9px] text-gray-700 border border-white/5 px-3 py-1 rounded uppercase tracking-widest">
                FASE 0 · SIMULACIÓN
              </span>
              <button onClick={onClose} style={{ fontFamily: SYNE }} className="mt-2 text-xs text-gray-500 hover:text-white border border-white/10 hover:border-white/25 px-4 py-2 rounded transition-all uppercase tracking-wider">
                CERRAR
              </button>
            </div>
          ) : (
            <>
              {/* Selector turno */}
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Turno
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TURNOS_LIST.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTurno(t.id)}
                      style={{ fontFamily: INTER }}
                      className={`flex flex-col items-center py-2.5 px-1 rounded border text-center transition-all ${
                        turno === t.id
                          ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                          : 'bg-zinc-900 border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'
                      }`}
                    >
                      <span className="text-sm font-bold">{t.label}</span>
                      <span className="text-[9px] mt-0.5 leading-tight opacity-70">{t.horario}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estado Director */}
              {isDirector && (
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 rounded px-4 py-3">
                  <span className="text-emerald-400 text-base">●</span>
                  <div>
                    <p style={{ fontFamily: INTER, fontWeight: 600 }} className="text-sm text-emerald-400 uppercase tracking-widest">LIBRE</p>
                    <p style={{ fontFamily: INTER }} className="text-xs text-gray-600 mt-0.5">
                      {sector.label} · {turnoData?.label} ({turnoData?.horario}) · Sin contratos activos
                    </p>
                  </div>
                </div>
              )}

              {/* Cobertura (solo Productor) */}
              {!isDirector && (
                <div>
                  <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                    Cobertura
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {COBERTURAS_LIST.map(c => {
                      const p = Math.round(c.precio * (turnoData?.factor ?? 1));
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleCobertura(c.id)}
                          style={{ fontFamily: INTER }}
                          className={`flex items-center justify-between px-4 py-2.5 rounded border text-sm transition-all ${
                            cobertura === c.id
                              ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                              : 'bg-zinc-900 border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'
                          }`}
                        >
                          <span className="font-medium">{c.label}</span>
                          <span className={`text-sm font-bold ${cobertura === c.id ? 'text-purple-400' : 'text-gray-500'}`}>
                            {p} €
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ciudad (solo Productor) */}
              {!isDirector && needsCiudad && (
                <div>
                  <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                    Ciudad
                  </label>
                  <select
                    value={ciudad}
                    onChange={e => setCiudad(e.target.value)}
                    style={{ fontFamily: INTER }}
                    className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded appearance-none focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">— Selecciona ciudad —</option>
                    {cities.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Guión / Descripción (solo Productor) */}
              {!isDirector && (
                <div>
                  <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                    Guión / Descripción del contenido
                  </label>
                  <textarea
                    value={guion}
                    onChange={e => setGuion(e.target.value)}
                    rows={4}
                    placeholder="Describe el contenido del slide: imagen, texto, CTA, enlace..."
                    style={{ fontFamily: INTER }}
                    className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded resize-none focus:outline-none focus:border-purple-500/50 placeholder:text-gray-600"
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <p style={{ fontFamily: INTER }} className="text-red-400 text-sm bg-red-950/30 border border-red-900/30 px-3 py-2 rounded">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer Productor */}
        {!isDirector && !done && (
          <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontFamily: INTER, fontWeight: 500 }} className="text-sm text-gray-500 uppercase tracking-wider">
                Precio estimado · {turnoData?.label}
              </span>
              <span style={{ fontFamily: INTER, fontWeight: 700 }} className="text-purple-400 text-3xl">
                {precio} €
              </span>
            </div>
            {turnoData?.id === 3 && (
              <p style={{ fontFamily: INTER }} className="text-xs text-amber-600 mb-2">
                T3 — Franja prime time · tarifa +25%
              </p>
            )}
            {turnoData?.id === 1 && (
              <p style={{ fontFamily: INTER }} className="text-xs text-sky-700 mb-2">
                T1 — Franja madrugada · tarifa –20%
              </p>
            )}
            <p style={{ fontFamily: INTER }} className="text-xs text-gray-700 mb-3 leading-relaxed">
              FASE 0 · Simulación — No se realizará ningún cargo real.
            </p>
            <button
              onClick={handleReservar}
              style={{ fontFamily: SYNE, fontWeight: 700 }}
              className="w-full bg-purple-700 hover:bg-purple-600 text-white text-sm font-bold uppercase tracking-widest py-3 rounded transition-all"
            >
              RESERVAR SLOT
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ── SlideRailTab ──────────────────────────────────────────────────────────────
const SlideRailTab = ({ role }) => {
  const [selected, setSelected] = useState(null);
  const isDirector = role === 'director';
  const rolColor   = isDirector ? '#00ff88' : '#cc88ff';

  return (
    <div className="p-6 flex flex-col items-center">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header centrado */}
      <div className="mb-8 text-center w-full max-w-3xl">
        <h2 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-xl font-black tracking-tight text-white">
          SLIDE RAIL
        </h2>
        <p style={{ fontFamily: SYNE, fontWeight: 700, color: '#facc15' }} className="text-xl mt-1">
          2 sectores · {isDirector ? 'Estado de ocupación por turno' : 'Selecciona un sector para contratar un slot'}
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, color: '#f5e6c8' }} className="text-lg mt-4 w-full max-w-full text-center leading-relaxed px-4">
          Los Sectores de Canjes de Lunas y Shop Amigos utilizan el Slide Rail como espacio publicitario. Se trata de un banner vertical donde puedes colocar la imagen de tu empresa para comunicar novedades y actividad comercial.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, color: '#f5e6c8' }} className="text-lg mt-2 w-full max-w-full text-center leading-relaxed px-4">
          Actualmente, el espacio se rellena con personajes o imágenes aleatorias. Es una zona donde los usuarios canjean sus tarjetas o buscan artículos especiales. Slide Rail hará que tu negocio sea aún más visible.
        </p>
      </div>

      {/* Cuatro sectores centrados */}
      <div className="grid grid-cols-2 gap-4 max-w-3xl w-full">
        {SECTORES.map(sector => (
          <button
            key={sector.id}
            onClick={() => setSelected(sector)}
            className="group p-3 rounded-xl border border-white/5 hover:border-white/20 bg-zinc-900/30 transition-all"
          >
            <div className="relative overflow-hidden rounded-lg w-full" style={{ aspectRatio: '450 / 1080' }}>
              {/* Imagen vertical */}
              <img
                src={sector.img}
                alt={sector.label}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-300"
              />

              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Etiqueta inferior */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p
                  style={{ fontFamily: SYNE, fontWeight: 800, color: rolColor, textShadow: `0 0 10px ${rolColor}55` }}
                  className="text-xs uppercase tracking-widest text-center"
                >
                  {sector.label}
                </p>
                {!isDirector && (
                  <p style={{ fontFamily: SYNE }} className="text-[9px] text-gray-500 text-center mt-0.5 uppercase tracking-wider">
                    4 turnos · desde 16€
                  </p>
                )}
                {isDirector && (
                  <p style={{ fontFamily: SYNE }} className="text-[9px] text-emerald-500 text-center mt-0.5 uppercase tracking-wider">
                    ● libre
                  </p>
                )}
              </div>

              {/* Badge hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span
                  style={{ fontFamily: SYNE, fontWeight: 700, background: `${rolColor}22`, borderColor: `${rolColor}44`, color: rolColor }}
                  className="text-[10px] uppercase tracking-widest border px-3 py-1 rounded backdrop-blur-sm"
                >
                  {isDirector ? 'VER ESTADO' : 'CONTRATAR'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Nota FASE 0 */}
      <p style={{ fontFamily: SYNE }} className="text-[9px] text-gray-700 mt-6 uppercase tracking-widest">
        FASE 0 · Simulación — Los estados mostrados son orientativos
      </p>

      {selected && (
        <Panel
          sector={selected}
          role={role}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default SlideRailTab;
