import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getMiniCities, getMegaCities, getCodeForCity } from '../../data/citycodes';

const SYNE  = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const COBERTURAS_LIST = [
  { id: 'SALA_CIUDAD',        label: 'Sala Ciudad',        precio: 20  },
  { id: 'SALA_GRAN_CIUDAD',   label: 'Sala Gran Ciudad',   precio: 60  },
  { id: 'GIRA_REGIONAL',      label: 'Gira Regional',      precio: 80  },
  { id: 'GIRA_GRAN_REGIONAL', label: 'Gira Gran Regional', precio: 160 },
  
  { id: 'GIRA_NACIONAL',      label: 'Gira Nacional',      precio: 500 },
  { id: 'GIRA_MUNDIAL',       label: 'Gira Mundial',       precio: 800 },
];

const CIUDAD_COBERTURAS = ['SALA_CIUDAD', 'SALA_GRAN_CIUDAD', 'GIRA_REGIONAL', 'GIRA_GRAN_REGIONAL'];

const LIMITE_CIUDADES = {
  SALA_CIUDAD:        1,
  SALA_GRAN_CIUDAD:   1,
  GIRA_REGIONAL:      3,
  GIRA_GRAN_REGIONAL: 7,
};

const ReservaPanelGames = ({ juego, session, profile, onClose }) => {
  const [cobertura, setCobertura] = useState('SALA_CIUDAD');
  const [ciudades, setCiudades]   = useState([]);
  const [descuento,       setDescuento]       = useState(0);
  const [faseLunarId,     setFaseLunarId]     = useState(null);
  const [faseLunarNombre, setFaseLunarNombre] = useState('LUNA_NUEVA');
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);

  const [pregunta,  setPregunta]  = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [opcionB,   setOpcionB]   = useState('');
  const [opcionC,   setOpcionC]   = useState('');
  const [opcionD,   setOpcionD]   = useState('');

  const [preguntaOut,  setPreguntaOut]  = useState('');
  const [respuestaOut, setRespuestaOut] = useState('');
  const [opcionBOut,   setOpcionBOut]   = useState('');
  const [opcionCOut,   setOpcionCOut]   = useState('');
  const [opcionDOut,   setOpcionDOut]   = useState('');

  const isSevenGates = juego.id === 'the7gates';
  const needsCiudad  = CIUDAD_COBERTURAS.includes(cobertura);
  const precioBase   = COBERTURAS_LIST.find(c => c.id === cobertura)?.precio ?? 0;
  const precioFinal  = descuento > 0
    ? Math.round(precioBase * (1 - descuento / 100) * 100) / 100
    : precioBase;

  useEffect(() => {
    supabase
      .from('b_advertiser_profiles')
      .select('descuento_publicitario')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setDescuento(data?.descuento_publicitario ?? 0));
  }, [session]);

  useEffect(() => {
    supabase
      .from('fases_lunares')
      .select('id, nombre')
      .eq('activa', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFaseLunarId(data.id);
          setFaseLunarNombre(data.nombre);
        }
      });
  }, []);

  const toggleCiudad = (key) => {
    setCiudades(prev => {
      if (prev.includes(key)) return prev.filter(c => c !== key);
      const limite = LIMITE_CIUDADES[cobertura] ?? 1;
      if (prev.length >= limite) return prev;
      return [...prev, key];
    });
  };

  const handleCobertura = (id) => { setCobertura(id); setCiudades([]); };

  const handleSolicitar = async () => {
    setError('');

    if (needsCiudad && ciudades.length === 0) {
      setError('Selecciona al menos una ciudad.'); return;
    }
    if (!pregunta.trim() || !respuesta.trim() || !opcionB.trim() || !opcionC.trim()) {
      setError('La pregunta y sus opciones son obligatorias.'); return;
    }
    if (isSevenGates && (
      !preguntaOut.trim() || !respuestaOut.trim() || !opcionBOut.trim() || !opcionCOut.trim()
    )) {
      setError('La pregunta de SALIDA y sus opciones son obligatorias.'); return;
    }

    const juegoKey    = isSevenGates ? 'SEVEN_GATES' : 'COSMIC_QUIZ';
    const today       = new Date();
    const fechaFin    = new Date(today.getTime() + 7 * 86_400_000);

    const { error: butacaErr } = await supabase.from('bs_butacas').insert([{
      productor_id:  session.user.id,
      formato:       isSevenGates ? 'GAMES_7GATES' : 'GAMES_COSMIC',
      fase_lunar_id: faseLunarId,
      cobertura,
      ciudad_codigos: ciudades.length > 0
        ? ciudades.map(k => getCodeForCity(k)).filter(Boolean)
        : null,
      precio:        precioFinal,
      estado:        'EN_CASTING',
      fecha_inicio:  today.toISOString().split('T')[0],
      fecha_fin:     fechaFin.toISOString().split('T')[0],
    }]);
    if (butacaErr) { setError(butacaErr.message); return; }

    const isRegionalOrHigher = ['GIRA_REGIONAL', 'GIRA_GRAN_REGIONAL', 'METROPOLIS', 'GIRA_NACIONAL', 'GIRA_MUNDIAL'].includes(cobertura);
    const ciudadCodigoPromo = (!isRegionalOrHigher && ciudades.length > 0)
      ? getCodeForCity(ciudades[0])
      : null;

    const promoPayload = {
      juego:             juegoKey,
      comercio_id:       session.user.id,
      pregunta:          pregunta.trim(),
      respuesta:         respuesta.trim(),
      opcion_b:          opcionB.trim(),
      opcion_c:          opcionC.trim(),
      opcion_d:          isSevenGates ? opcionD.trim() : null,
      cobertura,
      ciudad_codigo:     ciudadCodigoPromo,
      lunas_bonus:       20,
      fase_lunar_activa: faseLunarNombre,
      activo:            true,
      es_brovision:      false,
      ...(isSevenGates && {
        seven_gates_pregunta_out:  preguntaOut.trim(),
        seven_gates_respuesta_out: respuestaOut.trim(),
        seven_gates_opcion_b_out:  opcionBOut.trim(),
        seven_gates_opcion_c_out:  opcionCOut.trim(),
        seven_gates_opcion_d_out:  opcionDOut.trim(),
      }),
    };

    const { error: promoErr } = await supabase.from('promo_games').insert([promoPayload]);
    if (promoErr) { setError(promoErr.message); return; }

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
              {profile?.razon_social || session.user.email}
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
              {/* Duración fija */}
              <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 rounded px-4 py-3">
                <span className="text-violet-400 text-base">🌙</span>
                <div>
                  <p style={{ fontFamily: INTER, fontWeight: 600 }} className="text-sm text-white">
                    Por fase lunar — aprox. 7 días
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

              {/* Ciudades — checkboxes con límite */}
              {needsCiudad && (
                <div>
                  <label style={{ fontFamily: INTER, fontWeight: 600 }}
                    className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
                    Ciudades
                    <span className="ml-2 text-purple-400 font-mono">
                      {ciudades.length}/{LIMITE_CIUDADES[cobertura]}
                    </span>
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {(cobertura === 'SALA_GRAN_CIUDAD' ? getMegaCities() : getMiniCities()).map(c => {
                      const seleccionada = ciudades.includes(c.key);
                      const lleno = ciudades.length >= (LIMITE_CIUDADES[cobertura] ?? 1);
                      const bloqueada = !seleccionada && lleno;
                      return (
                        <label
                          key={c.key}
                          className={`flex items-center gap-3 px-3 py-2 rounded border cursor-pointer transition-all
                            ${seleccionada
                              ? 'border-purple-500/60 bg-purple-950/30 text-white'
                              : bloqueada
                                ? 'border-white/5 text-gray-600 opacity-30 cursor-not-allowed'
                                : 'border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={seleccionada}
                            disabled={bloqueada}
                            onChange={() => toggleCiudad(c.key)}
                            className="accent-purple-500"
                          />
                          <span className="text-sm">{c.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bloque pregunta común */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ fontFamily: SYNE, fontWeight: 700 }}
                    className="text-xs text-violet-400 uppercase tracking-widest">
                    {isSevenGates ? '🚪 PREGUNTA DE ENTRADA' : '🎯 PREGUNTA'}
                  </span>
                </div>

                <div className="mb-3">
                  <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
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

                <div className="mb-3">
                  <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
                    Respuesta correcta — Opción A
                  </label>
                  <input
                    value={respuesta}
                    onChange={e => setRespuesta(e.target.value)}
                    placeholder="Respuesta correcta..."
                    style={{ fontFamily: INTER }}
                    className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded focus:outline-none focus:border-violet-500/50 placeholder:text-gray-600"
                  />
                </div>

                <div className="mb-3">
                  <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
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

                <div className="mb-3">
                  <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
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

                {isSevenGates && (
                  <div>
                    <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
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
                )}
              </div>

              {/* Bloque SALIDA — solo Seven Gates */}
              {isSevenGates && (
                <div className="border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ fontFamily: SYNE, fontWeight: 700 }}
                      className="text-xs text-emerald-400 uppercase tracking-widest">
                      🏆 PREGUNTA DE SALIDA
                    </span>
                    <span style={{ fontFamily: INTER }} className="text-[10px] text-gray-600">
                      · para escapar con el botín
                    </span>
                  </div>

                  <div className="mb-3">
                    <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
                      Pregunta de salida
                    </label>
                    <input
                      value={preguntaOut}
                      onChange={e => setPreguntaOut(e.target.value)}
                      placeholder="Pregunta de salida..."
                      style={{ fontFamily: INTER }}
                      className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded focus:outline-none focus:border-violet-500/50 placeholder:text-gray-600"
                    />
                  </div>

                  <div className="mb-3">
                    <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
                      Respuesta correcta — Opción A
                    </label>
                    <input
                      value={respuestaOut}
                      onChange={e => setRespuestaOut(e.target.value)}
                      placeholder="Respuesta correcta..."
                      style={{ fontFamily: INTER }}
                      className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded focus:outline-none focus:border-violet-500/50 placeholder:text-gray-600"
                    />
                  </div>

                  <div className="mb-3">
                    <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
                      Opción B
                    </label>
                    <input
                      value={opcionBOut}
                      onChange={e => setOpcionBOut(e.target.value)}
                      placeholder="Opción B..."
                      style={{ fontFamily: INTER }}
                      className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded focus:outline-none focus:border-violet-500/50 placeholder:text-gray-600"
                    />
                  </div>

                  <div className="mb-3">
                    <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
                      Opción C
                    </label>
                    <input
                      value={opcionCOut}
                      onChange={e => setOpcionCOut(e.target.value)}
                      placeholder="Opción C..."
                      style={{ fontFamily: INTER }}
                      className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded focus:outline-none focus:border-violet-500/50 placeholder:text-gray-600"
                    />
                  </div>

                  <div>
                    <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
                      Opción D
                    </label>
                    <input
                      value={opcionDOut}
                      onChange={e => setOpcionDOut(e.target.value)}
                      placeholder="Opción D..."
                      style={{ fontFamily: INTER }}
                      className="w-full bg-zinc-900 border border-white/10 text-gray-300 text-sm px-3 py-2.5 rounded focus:outline-none focus:border-violet-500/50 placeholder:text-gray-600"
                    />
                  </div>
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

        {/* Footer */}
        {!done && (
          <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontFamily: INTER, fontWeight: 500 }} className="text-sm text-gray-500 uppercase tracking-wider">
                Precio estimado · fase lunar
              </span>
              <span style={{ fontFamily: INTER, fontWeight: 700 }} className="text-violet-400 text-3xl">
                {precioFinal} €
              </span>
            </div>
            {descuento > 0 && (
              <>
                <div style={{ fontFamily: INTER }}
                     className="flex items-center justify-between text-xs mb-2 px-1">
                  <span className="text-gray-500">Precio base</span>
                  <span className="text-gray-500 line-through">{precioBase} €</span>
                </div>
                <div style={{ fontFamily: SYNE, fontWeight: 700 }}
                     className="flex items-center justify-between text-xs mb-3 px-1">
                  <span className="text-emerald-400 uppercase tracking-widest">
                    ✦ Descuento activo · -{descuento}%
                  </span>
                  <span className="text-emerald-400">{precioFinal} €</span>
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

export default ReservaPanelGames;