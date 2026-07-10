import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import Bro7bandModal from './Bro7bandModal';

const SYNE  = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const GRUPOS = [
  { grupo_id: 'osos',      imagen: '/emojis/osos.webp',      nombre: 'OSOS',      texto: 'Los Osos Tito, Lara y Puffo te mencionarán dentro de sus audios' },
  { grupo_id: 'nova',      imagen: '/emojis/nova.webp',      nombre: 'NOVA',      texto: 'Nova te mencionará dentro de sus audios' },
  { grupo_id: 'elefantes', imagen: '/emojis/elefantes.webp', nombre: 'ELEFANTES', texto: 'Los Elefantes Isabella y Profesor te mencionarán dentro de sus audios' },
  { grupo_id: 'economy',   imagen: '/emojis/larry_evelyn.webp', nombre: 'ECONOMY', texto: 'La economista Evelyn y el Inversor Larry te mencionarán dentro de sus audios' },
  { grupo_id: 'jovenes',   imagen: '/emojis/mapache_ami.webp',  nombre: 'JÓVENES', texto: 'Los Jóvenes Mapache y Ami te mencionarán dentro de sus audios' },
  { grupo_id: 'esoterico', imagen: '/emojis/jaguar.webp',    nombre: 'ESOTÉRICO', texto: 'Jaguar espiritual te mencionará dentro de sus audios' },
  { grupo_id: 'misterio',  imagen: '/emojis/smisterio.webp', nombre: 'MISTERIO',  texto: 'Señor Misterio te mencionará dentro de sus audios' },
  { grupo_id: 'herbolario',imagen: '/emojis/orumama.webp',   nombre: 'HERBOLARIO',texto: 'Orumama te mencionará dentro de sus audios' },
  { grupo_id: 'rumores',   imagen: '/emojis/rumores.webp',   nombre: 'RUMORES',   texto: 'Rumores te mencionará dentro de sus audios' },
];

const IDIOMAS = ['ES', 'EN', 'DE', 'PT', 'FR'];

const FASE_LUNAR_ACTIVA = 2;
const FASE_LUNAR_TEXTO  = 'Luna Creciente';
const PRECIO_MENCION    = 20;

const MencionesTab = ({ session }) => {
  const [carrito, setCarrito]     = useState([]);
  const [ocupados, setOcupados]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [idiomas, setIdiomas]     = useState(() =>
    Object.fromEntries(GRUPOS.map(g => [g.grupo_id, 'ES']))
  );

  useEffect(() => {
    const fetchOcupados = async () => {
      const { data } = await supabase
        .from('bro7band_menciones')
        .select('grupo_id, idioma')
        .eq('fase_lunar_activa', FASE_LUNAR_ACTIVA);
      if (data) setOcupados(data);
    };
    fetchOcupados();
  }, []);

  const ocupadoMap = useMemo(() => {
    const map = {};
    ocupados.forEach(o => {
      if (!map[o.grupo_id]) map[o.grupo_id] = {};
      map[o.grupo_id][o.idioma] = true;
    });
    return map;
  }, [ocupados]);

  const carritoKeySet = useMemo(() => {
    const set = new Set();
    carrito.forEach(c => set.add(`${c.grupo_id}_${c.idioma}`));
    return set;
  }, [carrito]);

  const isOcupado = (grupoId, idioma) => !!ocupadoMap[grupoId]?.[idioma];
  const isEnCarrito = (grupoId, idioma) => carritoKeySet.has(`${grupoId}_${idioma}`);

  const handleAdd = (grupoId, idioma) => {
    if (isOcupado(grupoId, idioma) || isEnCarrito(grupoId, idioma)) return;
    const grupo = GRUPOS.find(g => g.grupo_id === grupoId);
    setCarrito(prev => [...prev, { ...grupo, idioma }]);
  };

  const total = carrito.length * PRECIO_MENCION;

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

      <div className="grid grid-cols-3 gap-6 w-full max-w-5xl mb-24">
        {GRUPOS.map(grupo => {
          const idiomaSel = idiomas[grupo.grupo_id];
          const ocupado   = isOcupado(grupo.grupo_id, idiomaSel);
          const enCarrito = isEnCarrito(grupo.grupo_id, idiomaSel);

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

              <div className="flex gap-1.5">
                {IDIOMAS.map(idi => (
                  <button
                    key={idi}
                    onClick={() => setIdiomas(prev => ({ ...prev, [grupo.grupo_id]: idi }))}
                    style={{ fontFamily: INTER, fontWeight: 600 }}
                    className={`text-[10px] px-2 py-1 rounded border transition-all uppercase tracking-wider ${
                      idiomaSel === idi
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

              <div className="mt-auto pt-2 w-full">
                {ocupado ? (
                  <span style={{ fontFamily: INTER }} className="block text-center text-[10px] text-red-400 uppercase tracking-widest">
                    OCUPADO · {idiomaSel} · {FASE_LUNAR_TEXTO}
                  </span>
                ) : enCarrito ? (
                  <span style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-center text-[10px] text-cyan-400 uppercase tracking-widest">
                    EN CARRITO
                  </span>
                ) : (
                  <button
                    onClick={() => handleAdd(grupo.grupo_id, idiomaSel)}
                    style={{ fontFamily: SYNE, fontWeight: 700 }}
                    className="w-full text-[11px] bg-fuchsia-600 hover:bg-fuchsia-500 text-white uppercase tracking-widest py-2 rounded transition-all"
                  >
                    + AÑADIR · {PRECIO_MENCION}€
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
            const fetchOcupados = async () => {
              const { data } = await supabase
                .from('bro7band_menciones')
                .select('grupo_id, idioma')
                .eq('fase_lunar_activa', FASE_LUNAR_ACTIVA);
              if (data) setOcupados(data);
            };
            fetchOcupados();
          }}
          faseLunarTexto={FASE_LUNAR_TEXTO}
          faseLunarActiva={FASE_LUNAR_ACTIVA}
        />
      )}
    </div>
  );
};

export default MencionesTab;