import React, { useState, useMemo } from 'react';
import { getCitiesForCobertura, COBERTURAS } from '../../data/citycodes';

const SYNE  = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const PERSONAJES = [
  { id: 'evelyn',    nombre: 'EVELYN',     img: '/emojis/evelyn.webp'    },
  { id: 'nova',      nombre: 'NOVA',       img: '/emojis/nova.webp'      },
  { id: 'tito',      nombre: 'TITO',       img: '/emojis/tito.webp'      },
  { id: 'lara',      nombre: 'LARA',       img: '/emojis/lara.webp'      },
  { id: 'puffo',     nombre: 'PUFFO',      img: '/emojis/puffo.webp'     },
  { id: 'isabella',  nombre: 'ISABELLA',   img: '/emojis/isabella.webp'  },
  { id: 'profesor',  nombre: 'PROFESOR',   img: '/emojis/profesor.webp'  },
  { id: 'mapache',   nombre: 'MAPACHE',    img: '/emojis/mapache.webp'   },
  { id: 'ami',       nombre: 'AMI',        img: '/emojis/ami.webp'       },
  { id: 'smisterio', nombre: 'S.MISTERIO', img: '/emojis/smisterio.webp' },
  { id: 'jaguar',    nombre: 'JAGUAR',     img: '/emojis/jaguar.webp'    },
  { id: 'orumama',   nombre: 'ORUMAMA',    img: '/emojis/orumama.webp'   },
  { id: 'larry',     nombre: 'LARRY',      img: '/emojis/larry.webp'     },
  { id: 'rumores',   nombre: 'RUMORES',    img: '/emojis/rumores.webp'   },
];

const SECTORES_MAP = [
  { id: 'ruta',      nombre: 'Sector Ruta',     desc: 'Los 3 Osos te reciben en el Sector Ruta',                      pids: ['lara','tito','puffo']         },
  { id: 'productos', nombre: 'Sector Productos', desc: 'Nova te recibe en el Sector Productos',                        pids: ['nova']                        },
  { id: 'servicios', nombre: 'Sector Servicios', desc: 'Los elefantes te reciben en el Sector Servicios',             pids: ['isabella','profesor']         },
  { id: 'avisos',    nombre: 'Sector Avisos',    desc: 'Ellos te reciben en el Sector Avisos',                         pids: ['evelyn','larry']              },
  { id: 'audio',     nombre: 'Sector Audio',     desc: 'Los hermanos te reciben en el Sector Audio',                  pids: ['mapache','ami']               },
  { id: 'oraculo',   nombre: 'Sector Oráculo',   desc: 'Los esotéricos te reciben en el Sector Oráculo',              pids: ['orumama','smisterio','jaguar'] },
  { id: 'ia',        nombre: 'Sector IA',        desc: 'Rumores te recibirá en modo IA en Móvil y en videos',         pids: ['rumores']                     },
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

const Panel = ({ personaje, onClose }) => {
  const [cobertura, setCobertura] = useState('SALA_CIUDAD');
  const [ciudad,    setCiudad]    = useState('');
  const [mensaje,   setMensaje]   = useState('');
  const [especial,  setEspecial]  = useState(false);
  const [espTexto,  setEspTexto]  = useState('');
  const [espCodigo, setEspCodigo] = useState('');
  const [espStock,  setEspStock]  = useState('');
  const [espEmail,  setEspEmail]  = useState('');
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  const needsCiudad = NEEDS_CIUDAD.includes(cobertura);
  const precio      = COBERTURAS_LIST.find(c => c.id === cobertura)?.precio ?? 0;

  const cities = useMemo(() => {
    const list = getCitiesForCobertura(cobertura);
    return list.map(c => ({ key: c.key, label: c.label || c.key }));
  }, [cobertura]);

  const handleCobertura = (id) => { setCobertura(id); setCiudad(''); };

  const handleSolicitar = () => {
    setError('');
    if (needsCiudad && !ciudad)    { setError('Selecciona una ciudad para esta cobertura.'); return; }
    if (!mensaje.trim())           { setError('El mensaje / vivencia es obligatorio.'); return; }
    if (especial) {
      if (!espTexto.trim())                           { setError('Escribe el texto del especial.'); return; }
      if (!/^\d{3}$/.test(espCodigo))                { setError('El código debe tener exactamente 3 dígitos.'); return; }
      if (!espStock || Number(espStock) < 1)          { setError('El stock debe ser al menos 1.'); return; }
      if (!espEmail.trim() || !espEmail.includes('@')){ setError('Email del productor inválido.'); return; }
    }
    setDone(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[440px] bg-zinc-950 border-l border-white/10 flex flex-col shadow-2xl overflow-hidden">

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-black/30 shrink-0">
          <img src={personaje.img} alt={personaje.nombre} className="w-12 h-12 rounded-full object-cover border border-fuchsia-900/40 bg-zinc-900" />
          <div className="flex-1 min-w-0">
            <h3 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-sm font-black text-white tracking-tight">
              MENCIÓN — {personaje.nombre}
            </h3>
            <p style={{ fontFamily: INTER }} className="text-xs text-gray-500 mt-0.5">Contrato de aparición en el ecosistema</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-lg leading-none transition-colors">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {done ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="text-4xl">🎬</div>
              <p style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-white text-sm uppercase tracking-widest">
                Solicitud enviada
              </p>
              <p style={{ fontFamily: INTER }} className="text-gray-500 text-sm max-w-[260px] leading-relaxed">
                Tu mención con <strong className="text-fuchsia-400">{personaje.nombre}</strong> ha sido recibida. El equipo la revisará en breve.
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
                          ? 'bg-fuchsia-950/60 border-fuchsia-500/40 text-fuchsia-300'
                          : 'bg-zinc-900 border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'
                      }`}
                    >
                      <span className="font-medium">{c.label}</span>
                      <span className={`text-sm font-bold ${cobertura === c.id ? 'text-fuchsia-400' : 'text-gray-500'}`}>
                        {c.precio} €
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
                    className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded appearance-none focus:outline-none focus:border-fuchsia-500/50"
                  >
                    <option value="">— Selecciona ciudad —</option>
                    {cities.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mensaje */}
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Mensaje / Vivencia
                </label>
                <textarea
                  value={mensaje}
                  onChange={e => setMensaje(e.target.value)}
                  rows={4}
                  placeholder="Describe la mención que quieres que el personaje haga de tu marca o producto..."
                  style={{ fontFamily: INTER }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded resize-none focus:outline-none focus:border-fuchsia-500/50 placeholder:text-gray-600"
                />
              </div>

              {/* Especial toggle */}
              <div>
                <button
                  onClick={() => setEspecial(v => !v)}
                  style={{ fontFamily: INTER }}
                  className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-widest transition-colors ${
                    especial ? 'text-fuchsia-400' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-all ${
                    especial ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-zinc-800 border-white/10'
                  }`}>
                    {especial ? '✓' : ''}
                  </span>
                  Incluir Especial
                </button>

                {especial && (
                  <div className="mt-3 flex flex-col gap-3 pl-1 border-l border-fuchsia-900/40 ml-1.5">
                    <div>
                      <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">
                        Texto del especial
                      </label>
                      <textarea
                        value={espTexto}
                        onChange={e => setEspTexto(e.target.value)}
                        rows={3}
                        placeholder="Ej: Descuento exclusivo del 20% para los primeros 50..."
                        style={{ fontFamily: INTER }}
                        className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2 rounded resize-none focus:outline-none focus:border-fuchsia-500/50 placeholder:text-gray-600"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">
                          Código (3 dígitos)
                        </label>
                        <input
                          type="text"
                          value={espCodigo}
                          onChange={e => setEspCodigo(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="000"
                          maxLength={3}
                          style={{ fontFamily: INTER }}
                          className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2 rounded focus:outline-none focus:border-fuchsia-500/50 placeholder:text-gray-600 text-center tracking-widest"
                        />
                      </div>
                      <div className="flex-1">
                        <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">
                          Stock (unidades)
                        </label>
                        <input
                          type="number"
                          value={espStock}
                          onChange={e => setEspStock(e.target.value)}
                          min={1}
                          placeholder="10"
                          style={{ fontFamily: INTER }}
                          className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2 rounded focus:outline-none focus:border-fuchsia-500/50 placeholder:text-gray-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">
                        Email del Productor (notificaciones de canje)
                      </label>
                      <input
                        type="email"
                        value={espEmail}
                        onChange={e => setEspEmail(e.target.value)}
                        placeholder="tu@email.com"
                        style={{ fontFamily: INTER }}
                        className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2 rounded focus:outline-none focus:border-fuchsia-500/50 placeholder:text-gray-600"
                      />
                    </div>
                  </div>
                )}
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
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontFamily: INTER, fontWeight: 500 }} className="text-sm text-gray-500 uppercase tracking-wider">
                Precio estimado
              </span>
              <span style={{ fontFamily: INTER, fontWeight: 700 }} className="text-fuchsia-400 text-3xl">
                {precio} €
              </span>
            </div>
            <p style={{ fontFamily: INTER }} className="text-xs text-gray-700 mb-3 leading-relaxed">
              FASE 0 · Simulación — No se realizará ningún cargo real.
            </p>
            <button
              onClick={handleSolicitar}
              style={{ fontFamily: SYNE, fontWeight: 700 }}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm font-bold uppercase tracking-widest py-3 rounded transition-all"
            >
              SOLICITAR MENCIÓN
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const MencionesTab = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-6 flex flex-col items-center">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header centrado */}
      <div className="mb-8 text-center w-full max-w-5xl">
        <h2 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-xl font-black tracking-tight text-white">
          MENCIONES PERSONAJES
        </h2>
        <p style={{ fontFamily: SYNE, fontWeight: 700, color: '#facc15' }} className="text-xl mt-1">
          14 personajes disponibles · Selecciona para contratar una mención
        </p>
      </div>

      {/* Grid de sectores — 3 cols, 7 items (último centrado en col-2) */}
      <div className="grid grid-cols-3 gap-6 mb-10 w-full max-w-5xl">
        {SECTORES_MAP.map((sector, i) => {
          const pjsInSector = PERSONAJES.filter(p => sector.pids.includes(p.id));
          return (
            <div
              key={sector.id}
              className={`flex flex-col items-center gap-5 p-6 bg-zinc-900/40 rounded-xl border border-white/5 hover:border-fuchsia-500/20 transition-all${i === 6 ? ' col-start-2' : ''}`}
            >
              <div className="flex items-center justify-center gap-5 flex-wrap">
                {pjsInSector.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="group flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <img
                      src={p.img}
                      alt={p.nombre}
                      className="w-28 h-28 rounded-full object-cover border-2 border-white/10 group-hover:border-fuchsia-500/50 transition-all shadow-lg"
                    />
                    <span style={{ fontFamily: SYNE, fontWeight: 700 }} className="text-xs text-gray-400 group-hover:text-fuchsia-400 uppercase tracking-wider text-center">
                      {p.nombre}
                    </span>
                  </button>
                ))}
              </div>
              <p style={{ fontFamily: INTER }} className="text-sm text-gray-400 text-center leading-relaxed">
                {sector.desc}
              </p>
            </div>
          );
        })}
      </div>

      {selected && <Panel personaje={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default MencionesTab;
