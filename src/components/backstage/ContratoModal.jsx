import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { useReservaTemporal } from '../../hooks/useReservaTemporal';
import { CHANNELS, TURNOS, getMiniCities, getMegaCities, getCodeForCity } from '../../data/citycodes';

const SYNE  = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const CANAL_STRING = {
  1:'mercurio', 2:'luna', 3:'venus', 4:'tierra',
  5:'jupiter', 6:'marte', 7:'saturno', 8:'urano', 9:'neptuno'
};

const SLUG_TO_CANAL = Object.fromEntries(
  Object.entries(CANAL_STRING).map(([k, v]) => [v, Number(k)])
);

const COBERTURAS_LIST = [
  { id: 'GIRA_MUNDIAL',       label: 'Internacional',     precio: 800 },
  { id: 'GIRA_NACIONAL',      label: 'Nacional',          precio: 500 },
  { id: 'GIRA_GRAN_REGIONAL', label: 'Regional 7 Ciudades',  precio: 200 },
  { id: 'GIRA_REGIONAL',      label: 'Regional 3 Ciudades',    precio: 120 },
  { id: 'SALA_GRAN_CIUDAD',   label: 'Gran Ciudad',       precio: 60  },
  { id: 'SALA_CIUDAD',        label: 'Ciudad Individual', precio: 20  },
];

const CIUDAD_COBERTURAS = ['SALA_CIUDAD', 'SALA_GRAN_CIUDAD', 'GIRA_REGIONAL', 'GIRA_GRAN_REGIONAL'];

const LIMITE_CIUDADES = {
  SALA_CIUDAD: 1, SALA_GRAN_CIUDAD: 1, GIRA_REGIONAL: 3, GIRA_GRAN_REGIONAL: 7,
};

const SLOT_CATALOGO_LOCAL = {
  'games_7gates':  { slot_id: 'games_7gates',  nombre: 'The 7 Gates',    formato: 'GAMES_7GATES',  precio_base: 20 },
  'games_cosmic':  { slot_id: 'games_cosmic',   nombre: 'Cosmic Portal',  formato: 'GAMES_COSMIC',  precio_base: 20 },
};

['bro7band','osos','nova','elefantes','economy','jovenes','esoterico','misterio','herbolario','rumores'].forEach(id => {
  const nombres = { bro7band:'BRO7BAND', osos:'OSOS', nova:'NOVA', elefantes:'ELEFANTES', economy:'ECONOMY',
    jovenes:'JÓVENES', esoterico:'ESOTÉRICO', misterio:'MISTERIO', herbolario:'HERBOLARIO', rumores:'RUMORES' };
  SLOT_CATALOGO_LOCAL[`band_${id}`] = {
    slot_id: `band_${id}`, nombre: nombres[id],
    formato: id === 'bro7band' ? 'BRO7BAND_SAGA' : 'BRO7BAND_MENCION', precio_base: id === 'bro7band' ? 50 : 20
  };
});

['CANJES','SHOP_AMIGOS'].forEach(sector => {
  [2, 4, 6, 8].forEach(num => {
    const sid = `rail_${sector.toLowerCase()}_s${num}`;
    SLOT_CATALOGO_LOCAL[sid] = {
      slot_id: sid, nombre: `Slide Rail · ${sector} #${num}`,
      formato: sector === 'CANJES' ? 'SLIDE_RAIL_CANJES' : 'SLIDE_RAIL_SHOP', precio_base: 20
    };
  });
});

const ContratoModal = ({ slotId, onClose, userId }) => {
  const {
    countdown, activa: countdownActiva, segundosRestantes,
    iniciarCountdown, crearReserva, liberarReserva
  } = useReservaTemporal();

  const [slotData, setSlotData]         = useState(null);
  const [fases, setFases]               = useState([]);
  const [capaActual, setCapaActual]     = useState(1);
  const [faseLunarId, setFaseLunarId]   = useState(null);
  const [faseLunarNombre, setFaseLunarNombre] = useState('');
  const [cobertura, setCobertura]       = useState(null);
  const [ciudadCodigos, setCiudadCodigos] = useState([]);
  const [historial, setHistorial]       = useState([]);
  const [loading, setLoading]           = useState(true);

  const [videoUrl, setVideoUrl]         = useState('');
  const [bannerUrl, setBannerUrl]       = useState('');
  const [briefText, setBriefText]       = useState('');

  const [promoPregunta, setPromoPregunta]     = useState('');
  const [promoOpcionA,  setPromoOpcionA]      = useState('');
  const [promoOpcionB,  setPromoOpcionB]      = useState('');
  const [promoOpcionC,  setPromoOpcionC]      = useState('');
  const [promoCorrecta, setPromoCorrecta]     = useState('a');
  const [promoVf,       setPromoVf]           = useState(true);

  const [gamesPregunta,  setGamesPregunta]    = useState('');
  const [gamesRespuesta, setGamesRespuesta]   = useState('');
  const [gamesOpcionB,   setGamesOpcionB]     = useState('');
  const [gamesOpcionC,   setGamesOpcionC]     = useState('');
  const [gamesOpcionD,   setGamesOpcionD]     = useState('');

  const [gamesPreguntaOut,  setGamesPreguntaOut]  = useState('');
  const [gamesRespuestaOut, setGamesRespuestaOut] = useState('');
  const [gamesOpcionBOut,   setGamesOpcionBOut]   = useState('');
  const [gamesOpcionCOut,   setGamesOpcionCOut]   = useState('');
  const [gamesOpcionDOut,   setGamesOpcionDOut]   = useState('');

  const [error, setError]     = useState(null);
  const [done, setDone]       = useState(false);

  const formato = slotData?.formato ?? '';
  const isReality  = formato === 'REALITY_PC' || formato === 'REALITY_MOVIL';
  const isSlide    = formato === 'SLIDE_RAIL_CANJES' || formato === 'SLIDE_RAIL_SHOP';
  const isBand     = formato === 'BRO7BAND_MENCION' || formato === 'BRO7BAND_SAGA' || formato === 'BRO7BAND_OSOS';
  const isGames    = formato === 'GAMES_7GATES' || formato === 'GAMES_COSMIC';
  const isSevenGates = formato === 'GAMES_7GATES';

  const needsCiudad = CIUDAD_COBERTURAS.includes(cobertura);

  useEffect(() => {
    const load = async () => {
      const [{ data: slotFromDB }, { data: fasesData }] = await Promise.all([
        supabase.from('bs_slots_catalogo').select('*').eq('slot_id', slotId).maybeSingle(),
        supabase.from('fases_lunares').select('id, nombre, activa').order('id'),
      ]);
      if (slotFromDB) setSlotData(slotFromDB);
      else if (SLOT_CATALOGO_LOCAL[slotId]) setSlotData(SLOT_CATALOGO_LOCAL[slotId]);
      else {
        const parts = slotId.split('_');
        if (parts[0] === 'canal' && parts.length >= 4) {
          const canal = SLUG_TO_CANAL[parts[1]];
          const disp = parts[2] === 'pc' ? 0 : 1;
          const turno = Number(parts[3].replace('t', ''));
          if (canal && turno >= 1 && turno <= 4) {
            setSlotData({
              slot_id: slotId, nombre: `${CHANNELS[canal]} · ${disp === 0 ? 'PC' : 'Móvil'} · T${turno}`,
              formato: disp === 0 ? 'REALITY_PC' : 'REALITY_MOVIL', precio_base: 20,
              canal, dispositivo: disp, turno,
            });
          }
        }
      }
      setFases(fasesData || []);
      setLoading(false);
    };
    load();
    iniciarCountdown();
  }, [slotId]);

  useEffect(() => {
    if (countdownActiva === false && segundosRestantes === 0 && !done) {
      liberarReserva();
      onClose();
    }
  }, [countdownActiva, segundosRestantes]);

  const toggleCiudad = (key) => {
    setCiudadCodigos(prev => {
      if (prev.includes(key)) return prev.filter(c => c !== key);
      const limite = LIMITE_CIUDADES[cobertura] ?? 1;
      if (prev.length >= limite) return prev;
      return [...prev, key];
    });
  };

  const handleElegirFase = (fase) => {
    setFaseLunarId(fase.id);
    setFaseLunarNombre(fase.nombre);
    setHistorial(prev => [...prev, `Fase: ${fase.nombre}`]);
    setCapaActual(2);
  };

  const handleConfirmarCobertura = async () => {
    if (needsCiudad && ciudadCodigos.length === 0) {
      setError('Selecciona al menos una ciudad.');
      return;
    }
    const ciudadArr = ciudadCodigos.length > 0
      ? ciudadCodigos.map(k => getCodeForCity(k)).filter(Boolean)
      : cobertura === 'GIRA_MUNDIAL' ? ['WW']
      : cobertura === 'GIRA_NACIONAL' ? ['ES']
      : null;

    const label = cobertura === 'GIRA_MUNDIAL' ? 'Cobertura: Internacional'
      : cobertura === 'GIRA_NACIONAL' ? 'Cobertura: Nacional'
      : `Ciudades: ${ciudadCodigos.join(', ')}`;

    await crearReserva({ slotId, faseLunarId, ciudadCodigos: ciudadArr, anuncianteId: userId });
    setHistorial(prev => [...prev, label]);
    setCapaActual(3);
    setError(null);
  };

  const isOcupadaCiudad = (code) => false;

  const handleConfirmarCreativo = async () => {
    setError(null);

    if (isReality) {
      if (!videoUrl.trim() || !promoPregunta.trim() || !promoOpcionA.trim() || !promoOpcionB.trim() || !promoOpcionC.trim()) {
        setError('Completa el video y la pregunta PromoTrivia con sus 3 opciones.');
        return;
      }
    }
    if (isSlide) {
      if (!bannerUrl.trim() || !promoPregunta.trim()) {
        setError('Completa el banner y la pregunta PromoTrivia.');
        return;
      }
    }
    if (isBand) {
      if (!briefText.trim()) {
        setError('Escribe el texto de la mención.');
        return;
      }
    }
    if (isGames) {
      if (!gamesPregunta.trim() || !gamesRespuesta.trim() || !gamesOpcionB.trim() || !gamesOpcionC.trim()) {
        setError('Completa la pregunta y sus opciones.');
        return;
      }
      if (isSevenGates && (!gamesPreguntaOut.trim() || !gamesRespuestaOut.trim() || !gamesOpcionBOut.trim() || !gamesOpcionCOut.trim())) {
        setError('Completa la pregunta de SALIDA y sus opciones.');
        return;
      }
    }

    setLoading(true);
    try {
      const ciudadArr = ciudadCodigos.length > 0
        ? ciudadCodigos.map(k => getCodeForCity(k)).filter(Boolean)
        : cobertura === 'GIRA_MUNDIAL' ? ['WW']
        : cobertura === 'GIRA_NACIONAL' ? ['ES']
        : null;

      if (isReality) {
        const nombre_archivo = `${slotData.canal}_${slotData.turno}_${slotData.dispositivo}_${ciudadCodigos.length > 0 ? ciudadCodigos.map(k => getCodeForCity(k)).filter(Boolean).join('-') : '000'}.mp4`;
        await supabase.from('bs_butacas').insert([{
          canal: slotData.canal, funcion: slotData.turno, dispositivo: slotData.dispositivo,
          formato: slotData.formato, fase_lunar_id: faseLunarId, cobertura,
          ciudad_codigos: ciudadArr, productor_id: userId, guion: videoUrl.trim(),
          nombre_archivo, estado: 'EN_CASTING',
          precio: COBERTURAS_LIST.find(c => c.id === cobertura)?.precio ?? 20,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        }]);
        await supabase.from('promo_trivia').insert([{
          comercio_id: userId, pregunta: promoPregunta.trim(),
          opcion_a: promoCorrecta === 'a' ? `${promoOpcionA.trim()} (*)` : promoOpcionA.trim(),
          opcion_b: promoCorrecta === 'b' ? `${promoOpcionB.trim()} (*)` : promoOpcionB.trim(),
          opcion_c: promoCorrecta === 'c' ? `${promoOpcionC.trim()} (*)` : promoOpcionC.trim(),
          escenario_id: CANAL_STRING[slotData.canal], turno: slotData.turno, alcance: cobertura,
          ciudad_codigos: ciudadArr, activo: true, vence_luna: faseLunarNombre, lunas_bonus: 20,
        }]);
      }

      if (isSlide) {
        await supabase.from('trivia_rail').insert([{
          sector: formato === 'SLIDE_RAIL_CANJES' ? 'CANJES' : 'SHOP_AMIGOS',
          slot_numero: Number(slotId.split('_s')[1] || 2),
          es_brovision: false, pregunta: promoPregunta.trim(),
          respuesta_correcta: promoVf, lunas_bonus: 20,
          banner_url: bannerUrl.trim(), comercio_id: userId,
          fase_lunar_activa: faseLunarNombre, cobertura,
          ciudad_codigos: ciudadArr, activo: true,
        }]);
      }

      if (isBand) {
        await supabase.from('bro7band_menciones').insert([{
          grupo_id: slotId.replace('band_', ''), idioma: 'ES',
          fase_lunar_activa: faseLunarNombre, fase_lunar_id: faseLunarId,
          brief: briefText.trim(), anunciante_id: userId, estado: 'PENDIENTE',
          precio: slotData.precio_base ?? 20, cobertura,
          ciudad_codigos: ciudadArr,
        }]);
      }

      if (isGames) {
        const juegoKey = isSevenGates ? 'SEVEN_GATES' : 'COSMIC_QUIZ';
        const { error: butacaErr } = await supabase.from('bs_butacas').insert([{
          productor_id: userId, formato, fase_lunar_id: faseLunarId, cobertura,
          ciudad_codigos: ciudadArr,
          precio: COBERTURAS_LIST.find(c => c.id === cobertura)?.precio ?? 20,
          estado: 'EN_CASTING',
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        }]);
        if (butacaErr) throw butacaErr;

        await supabase.from('promo_games').insert([{
          juego: juegoKey, comercio_id: userId,
          pregunta: gamesPregunta.trim(), respuesta: gamesRespuesta.trim(),
          opcion_b: gamesOpcionB.trim(), opcion_c: gamesOpcionC.trim(),
          opcion_d: isSevenGates ? gamesOpcionD.trim() : null,
          cobertura, ciudad_codigos: ciudadArr, lunas_bonus: 20,
          fase_lunar_activa: faseLunarNombre, activo: true, es_brovision: false,
          ...(isSevenGates && {
            seven_gates_pregunta_out: gamesPreguntaOut.trim(),
            seven_gates_respuesta_out: gamesRespuestaOut.trim(),
            seven_gates_opcion_b_out: gamesOpcionBOut.trim(),
            seven_gates_opcion_c_out: gamesOpcionCOut.trim(),
            seven_gates_opcion_d_out: gamesOpcionDOut.trim(),
          }),
        }]);
      }

      await liberarReserva();
      setHistorial(prev => [...prev, 'Creativo: subido']);
      setDone(true);
      setCapaActual('final');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    liberarReserva();
    onClose();
  };

  const ciudadesDisponibles = cobertura === 'SALA_GRAN_CIUDAD' ? getMegaCities() : getMiniCities();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#000' }}>
        <span className="text-gray-500 text-2xl animate-pulse tracking-widest font-mono">CARGANDO...</span>
      </div>
    );
  }

  if (!slotData) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4" style={{ background: '#000' }}>
        <span className="text-red-400 text-sm font-mono">Slot no encontrado: {slotId}</span>
        <button onClick={handleVolver} className="text-gray-500 hover:text-white text-xs border border-white/10 px-4 py-2 rounded font-mono">VOLVER</button>
      </div>
    );
  }

  const btnBase = 'bg-zinc-900/60 border border-white/10 hover:border-purple-500/50 hover:bg-purple-950/20 text-white uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50';
  const btnBig = `${btnBase} font-bold`;
  const btnActive = 'border-purple-500/60 bg-purple-950/30 text-white';
  const btnInactive = 'border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200';

  const CICLO = ['LUNA_NUEVA', 'LUNA_CRECIENTE', 'LUNA_LLENA', 'LUNA_MENGUANTE'];

  const renderCapa1 = () => {
    const faseActiva = fases.find(f => f.activa === true);
    const idxActual = CICLO.indexOf(faseActiva?.nombre);
    const ordenado = idxActual >= 0
      ? [...CICLO.slice(idxActual), ...CICLO.slice(0, idxActual)]
      : CICLO;

    return (
      <div>
        {faseActiva && (
          <p style={{ fontFamily: INTER, fontSize: '2rem', fontWeight: 600, marginBottom: '32px' }} className="text-white">
            Estamos en: {faseActiva.nombre}
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '24px', width: '100%' }}>
          {ordenado.map(nombre => {
            const fase = fases.find(f => f.nombre === nombre);
            return (
              <button
                key={nombre}
                onClick={() => fase && handleElegirFase(fase)}
                disabled={!fase}
                style={{ fontFamily: SYNE, fontSize: '2rem', padding: '28px 60px', borderRadius: '16px', flex: 1, textAlign: 'center', fontWeight: 700, letterSpacing: '0.05em' }}
                className={`${btnBig} ${!fase ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                {nombre}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCapa2 = () => (
    <div>
      <p style={{ fontFamily: INTER, fontSize: '2.4rem', fontWeight: 600 }} className="text-white uppercase tracking-widest mb-8">
        Cobertura
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginTop: '24px' }}>
        {COBERTURAS_LIST.map(c => (
          <button
            key={c.id}
            onClick={() => { setCobertura(c.id); setCiudadCodigos([]); }}
            style={{ fontFamily: SYNE, fontSize: '2rem', padding: '28px 60px', borderRadius: '16px', minWidth: '320px', margin: '16px', fontWeight: 700, letterSpacing: '0.05em' }}
            className={`${btnBig} ${cobertura === c.id ? btnActive : btnInactive}`}
          >
            <span>{c.label}</span>
            <span style={{ marginLeft: '24px', fontSize: '1.8rem' }} className="text-purple-400">{c.precio}€</span>
          </button>
        ))}
      </div>

      {needsCiudad && (
        <div style={{ marginTop: '48px' }}>
          <p style={{ fontFamily: INTER, fontSize: '2rem', fontWeight: 600 }} className="text-gray-400 uppercase tracking-widest mb-6">
            Ciudades
            <span className="ml-4 text-purple-400">{ciudadCodigos.length}/{LIMITE_CIUDADES[cobertura]}</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
{ciudadesDisponibles.map(c => {
                  const sel = ciudadCodigos.includes(c.key);
                  const lleno = ciudadCodigos.length >= (LIMITE_CIUDADES[cobertura] ?? 1);
                  const bloq = !sel && lleno;
                  return (
                    <button
                      key={c.key}
                      onClick={() => !bloq && toggleCiudad(c.key)}
                      disabled={bloq}
                      style={{
                        fontFamily: SYNE,
                        fontSize: '1.2rem',
                        padding: '14px 28px',
                        borderRadius: '10px',
                        minWidth: 'auto',
                        fontWeight: sel ? 700 : 400,
                        letterSpacing: '0.03em',
                        ...(sel
                          ? {
                              background: 'rgba(255, 160, 0, 0.25)',
                              border: '2px solid #FFA500',
                              color: '#FFD700',
                              boxShadow: '0 0 16px rgba(255,165,0,0.6), 0 0 32px rgba(255,200,0,0.3)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: 'rgba(255,255,255,0.7)',
                            }),
                      }}
                      className={`${bloq ? 'opacity-30 cursor-not-allowed' : 'transition-all'}`}
                    >
                      {c.label}
                    </button>
                  );
                })}
          </div>
        </div>
      )}

      {error && (
        <div style={{ fontFamily: INTER, fontSize: '1.6rem' }} className="text-red-400 bg-red-950/30 border border-red-900/40 rounded-2xl px-8 py-4 mt-8">
          {error}
        </div>
      )}

      <div style={{ marginTop: '48px' }}>
        <button
          onClick={handleConfirmarCobertura}
          disabled={!cobertura}
          style={{ fontFamily: SYNE, fontSize: '2rem', padding: '28px 60px', borderRadius: '16px', fontWeight: 700, letterSpacing: '0.05em' }}
          className="bg-purple-600 hover:bg-purple-500 text-white uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_0_32px_rgba(168,85,247,0.3)]"
        >
          CONFIRMAR COBERTURA
        </button>
      </div>
    </div>
  );

  const renderCapa3 = () => (
    <div style={{ maxWidth: '900px' }}>
      <p style={{ fontFamily: INTER, fontSize: '2.4rem', fontWeight: 600 }} className="text-white uppercase tracking-widest mb-8">
        Creativo
      </p>

      {isReality && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <label style={{ fontFamily: INTER, fontSize: '1.6rem', fontWeight: 600 }} className="block text-gray-400 uppercase tracking-widest mb-3">
              URL del Video <span className="text-gray-600 normal-case">(PC: vertical · Móvil: horizontal)</span>
            </label>
            <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://tudominio.com/video.mp4"
              style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '20px 28px' }}
              className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl focus:border-purple-500 focus:outline-none placeholder-gray-600" />
          </div>

          <div className="border-t border-white/10 pt-6">
            <p style={{ fontFamily: SYNE, fontSize: '1.8rem', fontWeight: 700 }} className="text-cyan-400 uppercase tracking-widest mb-6">📡 PromoTrivia</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <input type="text" value={promoPregunta} onChange={e => setPromoPregunta(e.target.value)}
                maxLength={120} placeholder="Pregunta..."
                style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '20px 28px' }}
                className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl focus:border-cyan-500 focus:outline-none placeholder-gray-600" />
              {[
                { clave: 'a', val: promoOpcionA, set: setPromoOpcionA, placeholder: 'Opción A' },
                { clave: 'b', val: promoOpcionB, set: setPromoOpcionB, placeholder: 'Opción B' },
                { clave: 'c', val: promoOpcionC, set: setPromoOpcionC, placeholder: 'Opción C' },
              ].map(({ clave, val, set, placeholder }) => (
                <div key={clave} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button type="button" onClick={() => setPromoCorrecta(clave)}
                    style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}
                    className={`rounded-full font-black flex-shrink-0 transition-all border ${
                      promoCorrecta === clave ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:border-cyan-500/40'
                    }`}>{clave.toUpperCase()}</button>
                  <input type="text" value={val} onChange={e => set(e.target.value)} maxLength={80}
                    placeholder={`${placeholder}${promoCorrecta === clave ? ' ← correcta' : ''}`}
                    style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '18px 28px' }}
                    className="flex-1 bg-zinc-900 border border-white/10 text-white rounded-xl focus:border-cyan-500 focus:outline-none placeholder-gray-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isSlide && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <label style={{ fontFamily: INTER, fontSize: '1.6rem', fontWeight: 600 }} className="block text-gray-400 uppercase tracking-widest mb-3">
              URL Banner <span className="text-gray-600 normal-case">(vertical 450x1080 px)</span>
            </label>
            <input type="url" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)}
              placeholder="https://tudominio.com/banner.png"
              style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '20px 28px' }}
              className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl focus:border-purple-500 focus:outline-none placeholder-gray-600" />
          </div>
          <div>
            <label style={{ fontFamily: INTER, fontSize: '1.6rem', fontWeight: 600 }} className="block text-gray-400 uppercase tracking-widest mb-3">
              📡 Pregunta PromoTrivia
            </label>
            <input type="text" value={promoPregunta} onChange={e => setPromoPregunta(e.target.value)}
              maxLength={120} placeholder="¿Cuál es la especialidad de la casa?"
              style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '20px 28px' }}
              className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl focus:border-cyan-500 focus:outline-none placeholder-gray-600" />
          </div>
          <div>
            <label style={{ fontFamily: INTER, fontSize: '1.6rem', fontWeight: 600 }} className="block text-gray-400 uppercase tracking-widest mb-3">Respuesta correcta</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={() => setPromoVf(true)}
                style={{ fontFamily: SYNE, fontSize: '1.6rem', padding: '20px 48px', borderRadius: '12px', fontWeight: 700, letterSpacing: '0.05em' }}
                className={`uppercase tracking-widest transition-all border ${
                  promoVf === true ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' : 'bg-zinc-900 border-white/10 text-gray-500 hover:border-white/25'
                }`}>VERDADERO</button>
              <button type="button" onClick={() => setPromoVf(false)}
                style={{ fontFamily: SYNE, fontSize: '1.6rem', padding: '20px 48px', borderRadius: '12px', fontWeight: 700, letterSpacing: '0.05em' }}
                className={`uppercase tracking-widest transition-all border ${
                  promoVf === false ? 'bg-rose-950/40 border-rose-500/50 text-rose-400' : 'bg-zinc-900 border-white/10 text-gray-500 hover:border-white/25'
                }`}>FALSO</button>
            </div>
          </div>
        </div>
      )}

      {isBand && (
        <div>
          <label style={{ fontFamily: INTER, fontSize: '1.6rem', fontWeight: 600 }} className="block text-gray-400 uppercase tracking-widest mb-3">
            Texto de la Mención
          </label>
          <textarea value={briefText} onChange={e => setBriefText(e.target.value)}
            maxLength={300} rows={4}
            placeholder="Describe tu comercio, qué quieres que mencionen, tono del mensaje..."
            style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '20px 28px' }}
            className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl focus:border-purple-500 focus:outline-none resize-none placeholder-gray-600" />
          <div style={{ fontFamily: INTER, fontSize: '1.4rem' }} className="text-right text-gray-600 mt-2">{briefText.length}/300</div>
        </div>
      )}

      {isGames && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="border-t border-white/10 pt-6">
            <p style={{ fontFamily: SYNE, fontSize: '1.8rem', fontWeight: 700 }} className="text-violet-400 uppercase tracking-widest mb-6">
              {isSevenGates ? '🚪 PREGUNTA DE ENTRADA' : '🎯 PREGUNTA'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input type="text" value={gamesPregunta} onChange={e => setGamesPregunta(e.target.value)}
                placeholder="Pregunta..." style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '18px 28px' }}
                className="w-full bg-zinc-900 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:border-violet-500/50 placeholder-gray-600" />
              <input type="text" value={gamesRespuesta} onChange={e => setGamesRespuesta(e.target.value)}
                placeholder="Respuesta correcta (A)" style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '18px 28px' }}
                className="w-full bg-zinc-900 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:border-violet-500/50 placeholder-gray-600" />
              <input type="text" value={gamesOpcionB} onChange={e => setGamesOpcionB(e.target.value)}
                placeholder="Opción B" style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '18px 28px' }}
                className="w-full bg-zinc-900 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:border-violet-500/50 placeholder-gray-600" />
              <input type="text" value={gamesOpcionC} onChange={e => setGamesOpcionC(e.target.value)}
                placeholder="Opción C" style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '18px 28px' }}
                className="w-full bg-zinc-900 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:border-violet-500/50 placeholder-gray-600" />
              {isSevenGates && (
                <input type="text" value={gamesOpcionD} onChange={e => setGamesOpcionD(e.target.value)}
                  placeholder="Opción D" style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '18px 28px' }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:border-violet-500/50 placeholder-gray-600" />
              )}
            </div>
          </div>

          {isSevenGates && (
            <div className="border-t border-white/10 pt-6">
              <p style={{ fontFamily: SYNE, fontSize: '1.8rem', fontWeight: 700 }} className="text-emerald-400 uppercase tracking-widest mb-6">🏆 PREGUNTA DE SALIDA</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input type="text" value={gamesPreguntaOut} onChange={e => setGamesPreguntaOut(e.target.value)}
                  placeholder="Pregunta de salida..." style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '18px 28px' }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:border-violet-500/50 placeholder-gray-600" />
                <input type="text" value={gamesRespuestaOut} onChange={e => setGamesRespuestaOut(e.target.value)}
                  placeholder="Respuesta correcta (A)" style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '18px 28px' }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:border-violet-500/50 placeholder-gray-600" />
                <input type="text" value={gamesOpcionBOut} onChange={e => setGamesOpcionBOut(e.target.value)}
                  placeholder="Opción B" style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '18px 28px' }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:border-violet-500/50 placeholder-gray-600" />
                <input type="text" value={gamesOpcionCOut} onChange={e => setGamesOpcionCOut(e.target.value)}
                  placeholder="Opción C" style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '18px 28px' }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:border-violet-500/50 placeholder-gray-600" />
                <input type="text" value={gamesOpcionDOut} onChange={e => setGamesOpcionDOut(e.target.value)}
                  placeholder="Opción D" style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '18px 28px' }}
                  className="w-full bg-zinc-900 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:border-violet-500/50 placeholder-gray-600" />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ fontFamily: INTER, fontSize: '1.6rem' }} className="text-red-400 bg-red-950/30 border border-red-900/40 rounded-2xl px-8 py-4 mt-8">
          {error}
        </div>
      )}

      <div style={{ marginTop: '48px' }}>
        <button
          onClick={handleConfirmarCreativo}
          disabled={loading}
          style={{ fontFamily: SYNE, fontSize: '2rem', padding: '28px 60px', borderRadius: '16px', fontWeight: 700, letterSpacing: '0.05em' }}
          className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_0_32px_rgba(168,85,247,0.3)]"
        >
          {loading ? 'PROCESANDO...' : 'CONFIRMAR Y CONTRATAR'}
        </button>
      </div>
    </div>
  );

  const renderFinal = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px', paddingTop: '48px' }}>
      <div style={{ fontSize: '6rem' }}>🎬</div>
      <p style={{ fontFamily: SYNE, fontSize: '3rem', fontWeight: 800 }} className="text-white uppercase tracking-widest">
        Solicitud enviada
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '400px' }}>
        {historial.map((item, i) => (
          <div key={i} style={{ fontFamily: INTER, fontSize: '1.6rem' }}
            className="text-gray-300 bg-white/5 border border-white/5 rounded-2xl px-6 py-4">
            {item}
          </div>
        ))}
      </div>
      <p style={{ fontFamily: INTER, fontSize: '1.6rem' }} className="text-gray-500 leading-relaxed">
        Tu contratación ha sido registrada. Puedes revisar el estado en Mis Campañas.
      </p>
      <button
        onClick={handleVolver}
        style={{ fontFamily: SYNE, fontSize: '2rem', padding: '28px 60px', borderRadius: '16px', fontWeight: 700, letterSpacing: '0.05em' }}
        className="bg-purple-600 hover:bg-purple-500 text-white uppercase tracking-widest transition-all shadow-[0_0_32px_rgba(168,85,247,0.3)]"
      >
        IR AL CARRITO
      </button>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50, width: '100vw', height: '100vh',
      backgroundImage: "url('/images/productor.webp')",
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
      display: 'flex', flexDirection: 'column', padding: '60px 80px', boxSizing: 'border-box',
      fontFamily: 'monospace', color: 'white', overflowY: 'auto', overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #06b6d4);
          border-radius: 4px;
          box-shadow: 0 0 8px rgba(168,85,247,0.4);
        }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #c084fc, #22d3ee); }
        * { scrollbar-width: thin; scrollbar-color: #a855f7 rgba(255,255,255,0.03); }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <p style={{ fontFamily: SYNE, fontSize: '3.5rem', fontWeight: 800, letterSpacing: '0.2em' }} className="text-white">
            BRO7VISION · CONTRATO
          </p>
          <p style={{ fontFamily: INTER, fontSize: '2.8rem', fontWeight: 700 }} className="text-gray-300 mt-2">
            {slotData.nombre}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <span style={{ fontFamily: SYNE, fontSize: '4rem', fontWeight: 900 }}
            className={`tabular-nums ${segundosRestantes <= 60 ? 'text-red-400' : 'text-amber-400'}`}>
            ⏱ {countdown}
          </span>
          <button onClick={handleVolver}
            style={{ fontFamily: INTER, fontSize: '1.6rem', padding: '20px 48px', borderRadius: '12px', fontWeight: 600, letterSpacing: '0.05em' }}
            className="text-gray-500 hover:text-white border border-white/10 hover:border-white/30 uppercase tracking-wider transition-all">
            VOLVER
          </button>
        </div>
      </div>

      {historial.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '32px', flexShrink: 0 }}>
          {historial.map((item, i) => (
            <span key={i} style={{ fontFamily: INTER, fontSize: '2rem' }}
              className="text-gray-400 bg-white/5 border border-white/5 px-6 py-2 rounded-2xl">
              {item}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: '48px' }}>
        {capaActual === 1 && renderCapa1()}
        {capaActual === 2 && renderCapa2()}
        {capaActual === 3 && renderCapa3()}
        {capaActual === 'final' && renderFinal()}
      </div>
    </div>
  );
};

export default ContratoModal;