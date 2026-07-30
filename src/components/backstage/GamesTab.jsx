import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getCitiesForCobertura } from '../../data/citycodes';

const SYNE  = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const JUEGOS = [
  {
    id:    'the7gates',
    label: 'THE 7 GATES',
    img:   '/images/the7gates.webp',
    texto: 'Con The 7 Gates tu marca o servicio aparecerá resaltado haciéndole ganar puntos al usuario facilitando su respuesta. Es un guiño al participante de parte de tu marca o servicio que dejará un rastro positivo de tu producto.',
  },
  {
    id:    'cosmicportal',
    label: 'COSMIC PORTAL',
    img:   '/images/CosmicPortal.webp',
    texto: 'Con Cosmic Portal podrás colocar dentro de las preguntas del juego distinto tipo de información de tu producto o Servicio. Tu respuesta será resaltada y con esto le harás ganar puntos al participante. Es un guiño al participante de parte de tu marca o servicio que dejará un rastro positivo de tu producto.',
  },
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
const Panel = ({ juego, session, onClose }) => {
  const [cobertura, setCobertura] = useState('SALA_CIUDAD');
  const [ciudad,    setCiudad]    = useState('');
  const [pregunta,  setPregunta]  = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [opcionB,   setOpcionB]   = useState('');
  const [opcionC,   setOpcionC]   = useState('');
  const [opcionD,   setOpcionD]   = useState('');
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);
  const [descuento, setDescuento] = useState(0);

  useEffect(() => {
    const fetchDescuento = async () => {
      const { data } = await supabase
        .from('b_advertiser_profiles')
        .select('descuento_publicitario')
        .eq('id', session.user.id)
        .maybeSingle();
      setDescuento(data?.descuento_publicitario ?? 0);
    };
    fetchDescuento();
  }, [session]);

  const precioFinal = (precio) =>
    descuento > 0
      ? Math.round(precio * (1 - descuento / 100) * 100) / 100
      : precio;

  const needsCiudad = NEEDS_CIUDAD.includes(cobertura);
  const cities      = useMemo(() => getCitiesForCobertura(cobertura), [cobertura]);
  const precio      = COBERTURAS_LIST.find(c => c.id === cobertura)?.precio ?? 0;

  const handleCobertura = (id) => { setCobertura(id); setCiudad(''); };

  const handleSolicitar = async () => {
    setError('');
    if (needsCiudad && !ciudad) { setError('Selecciona una ciudad.'); return; }
    if (!pregunta.trim() || !respuesta.trim() || !opcionB.trim() || !opcionC.trim() || !opcionD.trim()) {
      setError('Todos los campos de la pregunta son obligatorios.'); return;
    }
    const { error: err } = await supabase.from('promo_games').insert([{
      juego:            juego.id === 'the7gates' ? 'SEVEN_GATES' : 'COSMIC_QUIZ',
      pregunta:         pregunta.trim(),
      respuesta:        respuesta.trim(),
      opcion_b:         opcionB.trim(),
      opcion_c:         opcionC.trim(),
      opcion_d:         opcionD.trim(),
      es_brovision:     false,
      comercio_id:      session.user.id,
      lunas_bonus:      20,
      fase_lunar_activa: 'LUNA_NUEVA',
      activo:           true,
    }]);
    if (err) { setError(err.message); return; }
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
            className="w-16 h-9 rounded overflow-hidden border border-white/10 shrink-0 bg-zinc-900"
            style={{ backgroundImage: `url(${juego.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="flex-1 min-w-0">
            <h3 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-sm font-black text-white tracking-tight">
              MENCIÓN — {juego.label}
            </h3>
            <p style={{ fontFamily: INTER }} className="text-xs text-gray-500 mt-0.5">
              Duración: 1 fase lunar · 28 días
            </p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-lg leading-none transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {done ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="text-4xl">🕹️</div>
              <p style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-white text-sm uppercase tracking-widest">
                Solicitud enviada
              </p>
              <p style={{ fontFamily: INTER }} className="text-gray-500 text-sm max-w-[260px] leading-relaxed">
                Tu mención en <strong className="text-violet-400">{juego.label}</strong> ha sido registrada. El equipo la revisará en breve.
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
              {/* Duración (fija) */}
              <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 rounded px-4 py-3">
                <span className="text-violet-400 text-base">🌙</span>
                <div>
                  <p style={{ fontFamily: INTER, fontWeight: 600 }} className="text-sm text-white">
                    Por fase lunar — 28 días
                  </p>
                  <p style={{ fontFamily: INTER }} className="text-xs text-gray-500 mt-0.5">
                    La mención estará activa durante toda la fase lunar en curso
                  </p>
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
                          ? 'bg-violet-950/60 border-violet-500/40 text-violet-300'
                          : 'bg-zinc-900 border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'
                      }`}
                    >
                      <span className="font-medium">{c.label}</span>
                      <span className={`text-sm font-bold ${cobertura === c.id ? 'text-violet-400' : 'text-gray-500'}`}>
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
                    className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded appearance-none focus:outline-none focus:border-violet-500/50"
                  >
                    <option value="">— Selecciona ciudad —</option>
                    {cities.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pregunta y opciones */}
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Pregunta
                </label>
                <input
                  value={pregunta}
                  onChange={e => setPregunta(e.target.value)}
                  placeholder="Escribe la pregunta..."
                  style={{ fontFamily: INTER }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded focus:outline-none focus:border-violet-500/50 placeholder:text-gray-600"
                />
              </div>
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Respuesta correcta
                </label>
                <input
                  value={respuesta}
                  onChange={e => setRespuesta(e.target.value)}
                  placeholder="Respuesta correcta..."
                  style={{ fontFamily: INTER }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded focus:outline-none focus:border-violet-500/50 placeholder:text-gray-600"
                />
              </div>
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Opción B
                </label>
                <input
                  value={opcionB}
                  onChange={e => setOpcionB(e.target.value)}
                  placeholder="Opción B..."
                  style={{ fontFamily: INTER }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded focus:outline-none focus:border-violet-500/50 placeholder:text-gray-600"
                />
              </div>
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Opción C
                </label>
                <input
                  value={opcionC}
                  onChange={e => setOpcionC(e.target.value)}
                  placeholder="Opción C..."
                  style={{ fontFamily: INTER }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded focus:outline-none focus:border-violet-500/50 placeholder:text-gray-600"
                />
              </div>
              <div>
                <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Opción D
                </label>
                <input
                  value={opcionD}
                  onChange={e => setOpcionD(e.target.value)}
                  placeholder="Opción D..."
                  style={{ fontFamily: INTER }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded focus:outline-none focus:border-violet-500/50 placeholder:text-gray-600"
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
                Precio estimado · 28 días
              </span>
              <span style={{ fontFamily: INTER, fontWeight: 700 }} className="text-violet-400 text-3xl">
                {precioFinal(precio)} €
              </span>
            </div>
            {descuento > 0 && (
              <>
                <div style={{ fontFamily: INTER }}
                     className="flex items-center justify-between text-xs mb-2 px-1">
                  <span className="text-gray-500">Precio base</span>
                  <span className="text-gray-500 line-through">{precio} €</span>
                </div>
                <div style={{ fontFamily: SYNE, fontWeight: 700 }}
                     className="flex items-center justify-between text-xs mb-3 px-1">
                  <span className="text-emerald-400 uppercase tracking-widest">
                    ✦ Descuento activo · -{descuento}%
                  </span>
                  <span className="text-emerald-400">{precioFinal(precio)} €</span>
                </div>
              </>
            )}
            <p style={{ fontFamily: INTER }} className="text-xs text-gray-700 mb-3 leading-relaxed">
              FASE 0 · Simulación — No se realizará ningún cargo real.
            </p>
            <button
              onClick={handleSolicitar}
              style={{ fontFamily: SYNE, fontWeight: 700 }}
              className="w-full bg-violet-700 hover:bg-violet-600 text-white text-sm font-bold uppercase tracking-widest py-3 rounded transition-all"
            >
              SOLICITAR MENCIÓN
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ── GamesTab ──────────────────────────────────────────────────────────────────
const GamesTab = ({ session }) => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div className="mb-10">
        <h2 style={{ fontFamily: SYNE, fontWeight: 800, color: '#f5e6c8' }} className="text-3xl font-black tracking-tight">
          GAMES
        </h2>
        <p style={{ fontFamily: SYNE, fontWeight: 700, color: '#f5e6c8' }} className="text-2xl mt-1">
          2 juegos disponibles · Mención activa durante 1 fase lunar completa
        </p>
      </div>

      {/* Dos juegos centrados y grandes */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-10 max-w-5xl w-full">
          {JUEGOS.map(juego => (
            <div key={juego.id} className="flex flex-col gap-5">

              {/* Card 16:9 */}
              <button
                onClick={() => setSelected(juego)}
                className="group relative overflow-hidden rounded-xl border border-white/5 hover:border-violet-500/30 transition-all"
                style={{ aspectRatio: '16 / 9' }}
              >
                <img
                  src={juego.img}
                  alt={juego.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p style={{ fontFamily: SYNE, fontWeight: 800, color: '#f5e6c8', textShadow: '0 0 12px rgba(167,95,255,0.5)' }} className="text-2xl uppercase tracking-widest">
                    {juego.label}
                  </p>
                  <p style={{ fontFamily: INTER, color: '#f5e6c8' }} className="text-base mt-1 uppercase tracking-wider">
                    Mención · 1 fase lunar · desde 20€
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span style={{ fontFamily: SYNE, fontWeight: 700, background: 'rgba(130,60,220,0.2)', borderColor: 'rgba(167,95,255,0.4)', color: '#cc88ff' }}
                    className="text-sm uppercase tracking-widest border px-5 py-2 rounded backdrop-blur-sm">
                    CONTRATAR
                  </span>
                </div>
              </button>

              {/* Descripción debajo */}
              <p style={{ fontFamily: INTER, color: '#f5e6c8' }} className="text-lg leading-relaxed text-center px-2">
                {juego.texto}
              </p>

            </div>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: SYNE, color: '#f5e6c8' }} className="text-base mt-10 uppercase tracking-widest text-center">
        FASE 0 · Simulación — No se realizará ningún cargo real
      </p>

      {selected && <Panel juego={selected} session={session} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default GamesTab;
