import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import Bro7bandModal from './Bro7bandModal';
import { getMiniCities, getMegaCities, getCodeForCity } from '../../data/citycodes';

const SYNE  = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const GRUPOS = [
  {
    grupo_id: 'bro7band',
    imagen:   '/emojis/bro7band.webp',
    nombre:   'BRO7BAND',
    texto:    'Dedica un capítulo de la saga Bro7Band o un episodio del Podcast Osos IA a tu comercio o proyecto. Todos los personajes participan.',
    precio:   50,
  },
  { grupo_id: 'osos',       imagen: '/emojis/osos.webp',          nombre: 'OSOS',       texto: 'Los Osos Tito, Lara y Puffo te mencionarán dentro de sus audios',                             precio: 20 },
  { grupo_id: 'nova',       imagen: '/emojis/nova.webp',          nombre: 'NOVA',       texto: 'Nova te mencionará dentro de sus audios',                                                      precio: 20 },
  { grupo_id: 'elefantes',  imagen: '/emojis/elefantes.webp',     nombre: 'ELEFANTES',  texto: 'Los Elefantes Isabella y Profesor te mencionarán dentro de sus audios',                        precio: 20 },
  { grupo_id: 'economy',    imagen: '/emojis/larry_evelyn.webp',  nombre: 'ECONOMY',    texto: 'La economista Evelyn y el Inversor Larry te mencionarán dentro de sus audios',                 precio: 20 },
  { grupo_id: 'jovenes',    imagen: '/emojis/mapache_ami.webp',   nombre: 'JÓVENES',    texto: 'Los Jóvenes Mapache y Ami te mencionarán dentro de sus audios',                               precio: 20 },
  { grupo_id: 'esoterico',  imagen: '/emojis/jaguar.webp',        nombre: 'ESOTÉRICO',  texto: 'Jaguar espiritual te mencionará dentro de sus audios',                                        precio: 20 },
  { grupo_id: 'misterio',   imagen: '/emojis/smisterio.webp',     nombre: 'MISTERIO',   texto: 'Señor Misterio te mencionará dentro de sus audios',                                           precio: 20 },
  { grupo_id: 'herbolario', imagen: '/emojis/orumama.webp',       nombre: 'HERBOLARIO', texto: 'Orumama te mencionará dentro de sus audios',                                                  precio: 20 },
  { grupo_id: 'rumores',    imagen: '/emojis/rumores.webp',       nombre: 'RUMORES',    texto: 'Rumores te mencionará dentro de sus audios',                                                  precio: 20 },
];

const IDIOMAS = ['ES', 'EN', 'DE', 'PT', 'FR'];

const COBERTURAS_MENCION = [
  { id: 'SALA_CIUDAD',        label: 'Sala Ciudad'        },
  { id: 'SALA_GRAN_CIUDAD',   label: 'Sala Gran Ciudad'   },
  { id: 'GIRA_REGIONAL',      label: 'Gira Regional'      },
  { id: 'GIRA_GRAN_REGIONAL', label: 'Gira Gran Regional' },
  { id: 'GIRA_NACIONAL',      label: 'Gira Nacional'      },
  { id: 'GIRA_MUNDIAL',       label: 'Gira Mundial'       },
];

const CIUDAD_COBERTURAS = ['SALA_CIUDAD', 'SALA_GRAN_CIUDAD', 'GIRA_REGIONAL', 'GIRA_GRAN_REGIONAL'];

const LIMITE_CIUDADES = {
  SALA_CIUDAD: 1, SALA_GRAN_CIUDAD: 1, GIRA_REGIONAL: 3, GIRA_GRAN_REGIONAL: 7,
};

const MencionesTab = ({ session }) => {
  const [carrito, setCarrito]     = useState([]);
  const [ocupados, setOcupados]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tiposBro7Band, setTiposBro7Band] = useState('capitulo_saga');
  const [idiomas, setIdiomas]     = useState(() =>
    Object.fromEntries(GRUPOS.map(g => [g.grupo_id, 'ES']))
  );
  const [faseLunarId,     setFaseLunarId]     = useState(null);
  const [faseLunarNombre, setFaseLunarNombre] = useState('');
  const [cobertura,       setCobertura]       = useState('GIRA_NACIONAL');
  const [ciudades,        setCiudades]        = useState([]);

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

  useEffect(() => {
    if (!faseLunarId) return;
    const fetchOcupados = async () => {
      const { data } = await supabase
        .from('bro7band_menciones')
        .select('grupo_id, cobertura, ciudad_codigos')
        .eq('fase_lunar_id', faseLunarId);
      if (data) setOcupados(data);
    };
    fetchOcupados();
  }, [faseLunarId]);

  const isOcupado = (grupoId) => {
    const selectedCodes = ciudades.map(k => getCodeForCity(k)).filter(Boolean);
    return ocupados.some(o => {
      if (o.grupo_id !== grupoId) return false;
      if (o.cobertura === 'GIRA_MUNDIAL' || o.cobertura === 'GIRA_NACIONAL') return true;
      if (!CIUDAD_COBERTURAS.includes(cobertura)) return o.cobertura === cobertura;
      return Array.isArray(o.ciudad_codigos) &&
             o.ciudad_codigos.some(c => selectedCodes.includes(c));
    });
  };

  const carritoKeySet = useMemo(() => new Set(carrito.map(c => c.grupo_id)), [carrito]);
  const isEnCarrito   = (grupoId) => carritoKeySet.has(grupoId);

  const handleAdd = (grupoId) => {
    if (isOcupado(grupoId) || isEnCarrito(grupoId)) return;
    const grupo        = GRUPOS.find(g => g.grupo_id === grupoId);
    const tipo_contenido = grupoId === 'bro7band' ? tiposBro7Band : null;
    const idiomaFinal  = cobertura === 'GIRA_MUNDIAL' ? (idiomas[grupoId] || 'ES') : 'ES';
    const ciudadCodigos = CIUDAD_COBERTURAS.includes(cobertura)
      ? ciudades.map(k => getCodeForCity(k)).filter(Boolean)
      : cobertura === 'GIRA_MUNDIAL' ? ['WW'] : ['ES'];

    setCarrito(prev => [...prev, {
      ...grupo,
      idioma:         idiomaFinal,
      tipo_contenido,
      cobertura,
      ciudad_codigos: ciudadCodigos,
    }]);
  };

  const toggleCiudad = (key) => {
    setCiudades(prev => {
      if (prev.includes(key)) return prev.filter(c => c !== key);
      const limite = LIMITE_CIUDADES[cobertura] ?? 1;
      if (prev.length >= limite) return prev;
      return [...prev, key];
    });
  };

  const total = carrito.reduce((sum, item) => sum + (item.precio ?? 20), 0);

  return (
    <div className="p-6 flex flex-col items-center">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div className="mb-10 text-center w-full">
        <h2 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-4xl font-black tracking-tight text-white">
          MENCIONES PERSONAJES
        </h2>
        <p style={{ fontFamily: SYNE, fontWeight: 700, color: '#facc15' }} className="text-2xl mt-3">
          10 grupos de personajes disponibles
        </p>
        <p style={{ fontFamily: INTER }} className="text-lg text-gray-300 max-w-5xl mx-auto mt-4 leading-relaxed">
          Cada grupo graba un audio por Fase Lunar con una palabra clave que necesitan escuchar los usuarios para ganar sus Lunas. Son audios cortos. Es un espacio idóneo para que los personajes envíen un saludo a tu comercio o hagan alguna mención sobre tu actividad o localización. Si los grupos están libres puedes contratar a más de uno.
        </p>
        <p style={{ fontFamily: INTER, fontWeight: 600 }} className="text-base text-cyan-400 mt-4">
          Selecciona para contratar una mención
        </p>
      </div>

      {/* Cobertura global */}
      <div className="w-full max-w-5xl mb-6">
        <label style={{ fontFamily: INTER, fontWeight: 600 }}
          className="block text-xs text-gray-400 uppercase tracking-widest mb-3">
          Cobertura de la campaña
        </label>
        <div className="flex flex-wrap gap-2">
          {COBERTURAS_MENCION.map(c => (
            <button
              key={c.id}
              onClick={() => { setCobertura(c.id); setCiudades([]); }}
              style={{ fontFamily: INTER, fontWeight: 600 }}
              className={`text-xs px-4 py-2 rounded border transition-all uppercase tracking-widest ${
                cobertura === c.id
                  ? 'border-fuchsia-500/60 bg-fuchsia-950/30 text-white'
                  : 'border-white/10 text-gray-500 hover:border-white/25 hover:text-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de ciudades — solo si cobertura lo requiere */}
      {CIUDAD_COBERTURAS.includes(cobertura) && (
        <div className="w-full max-w-5xl mb-6">
          <label style={{ fontFamily: INTER, fontWeight: 600 }}
            className="block text-xs text-gray-400 uppercase tracking-widest mb-3">
            Ciudades
            <span className="ml-2 text-fuchsia-400 font-mono">
              {ciudades.length}/{LIMITE_CIUDADES[cobertura]}
            </span>
          </label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {(cobertura === 'SALA_GRAN_CIUDAD' ? getMegaCities() : getMiniCities()).map(c => {
              const sel    = ciudades.includes(c.key);
              const lleno  = ciudades.length >= (LIMITE_CIUDADES[cobertura] ?? 1);
              const bloq   = !sel && lleno;
              return (
                <button
                  key={c.key}
                  onClick={() => !bloq && toggleCiudad(c.key)}
                  style={{ fontFamily: INTER }}
                  className={`text-xs px-3 py-1.5 rounded border transition-all ${
                    sel
                      ? 'border-fuchsia-500/60 bg-fuchsia-950/30 text-white'
                      : bloq
                        ? 'border-white/5 text-gray-600 opacity-30 cursor-not-allowed'
                        : 'border-white/10 text-gray-500 hover:border-white/25 hover:text-gray-300'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 w-full max-w-5xl mb-24">
        {GRUPOS.map(grupo => {
          const ocupado   = isOcupado(grupo.grupo_id);
          const enCarrito = isEnCarrito(grupo.grupo_id);

          return (
            <div
              key={grupo.grupo_id}
              className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all ${
                enCarrito
                  ? 'bg-zinc-900/60 border-cyan-500/50'
                  : ocupado
                    ? 'bg-zinc-900/20 border-white/5 opacity-50'
                    : 'bg-zinc-900/40 border-white/5 hover:border-fuchsia-500/20'
              }`}
            >
              <img
                src={grupo.imagen}
                alt={grupo.nombre}
                className="w-full aspect-square rounded-lg object-cover border border-white/5"
                onError={e => { e.target.style.display = 'none' }}
              />
              <h3 style={{ fontFamily: SYNE, fontWeight: 700 }} className="text-sm text-white uppercase tracking-wider mt-1">
                {grupo.nombre}
              </h3>
              <p style={{ fontFamily: INTER }} className="text-xs text-gray-400 text-center leading-relaxed px-1">
                {grupo.texto}
              </p>

              {grupo.grupo_id === 'bro7band' && (
                <div className="flex gap-2 w-full">
                  {[
                    { value: 'capitulo_saga',  label: 'CAPÍTULO SAGA' },
                    { value: 'podcast_osos',   label: 'PODCAST OSOS IA' },
                  ].map(op => (
                    <button
                      key={op.value}
                      onClick={() => setTiposBro7Band(op.value)}
                      style={{ fontFamily: INTER, fontWeight: 600 }}
                      className={`flex-1 text-[10px] px-2 py-1.5 rounded border transition-all uppercase tracking-wider ${
                        tiposBro7Band === op.value
                          ? 'border-amber-500/60 bg-amber-950/30 text-amber-300'
                          : 'border-white/10 text-gray-500 hover:border-white/25 hover:text-gray-300'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              )}

              {cobertura === 'GIRA_MUNDIAL' && (
                <div className="flex gap-1.5">
                  {IDIOMAS.map(idi => (
                    <button
                      key={idi}
                      onClick={() => setIdiomas(prev => ({ ...prev, [grupo.grupo_id]: idi }))}
                      style={{ fontFamily: INTER, fontWeight: 600 }}
                      className={`text-[10px] px-2 py-1 rounded border transition-all uppercase tracking-wider ${
                        idiomas[grupo.grupo_id] === idi
                          ? enCarrito
                            ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300'
                            : ocupado
                              ? 'border-red-900/40 bg-red-950/20 text-red-400'
                              : 'border-fuchsia-500/40 bg-fuchsia-950/30 text-fuchsia-300'
                          : 'border-white/10 text-gray-500 hover:border-white/25 hover:text-gray-300'
                      }`}
                    >
                      {idi}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-2 w-full">
                {ocupado ? (
                  <span style={{ fontFamily: INTER }} className="block text-center text-[10px] text-red-400 uppercase tracking-widest">
                    OCUPADO · {faseLunarNombre || '—'}
                  </span>
                ) : enCarrito ? (
                  <span style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-center text-[10px] text-cyan-400 uppercase tracking-widest">
                    EN CARRITO
                  </span>
                ) : (
                  <button
                    onClick={() => handleAdd(grupo.grupo_id)}
                    style={{ fontFamily: SYNE, fontWeight: 700 }}
                    className="w-full text-[11px] bg-fuchsia-600 hover:bg-fuchsia-500 text-white uppercase tracking-widest py-2 rounded transition-all"
                  >
                    + AÑADIR · {grupo.precio}€
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {carrito.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-6 pointer-events-none">
          <button
            onClick={() => setShowModal(true)}
            style={{ fontFamily: SYNE, fontWeight: 700 }}
            className="pointer-events-auto bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm uppercase tracking-widest py-3 px-8 rounded-full shadow-[0_0_32px_rgba(168,85,247,0.4)] transition-all"
          >
            VER SELECCIÓN ({carrito.length}) · TOTAL: {total}€
          </button>
        </div>
      )}

      {showModal && (
        <Bro7bandModal
          session={session}
          carrito={carrito}
          setCarrito={setCarrito}
          onClose={() => setShowModal(false)}
          onReserved={() => {
            setShowModal(false);
            if (!faseLunarId) return;
            supabase
              .from('bro7band_menciones')
              .select('grupo_id, cobertura, ciudad_codigos')
              .eq('fase_lunar_id', faseLunarId)
              .then(({ data }) => { if (data) setOcupados(data); });
          }}
          faseLunarTexto={faseLunarNombre}
          faseLunarId={faseLunarId}
        />
      )}
    </div>
  );
};

export default MencionesTab;