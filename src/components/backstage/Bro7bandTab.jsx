import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const HEADING = "'Noto Sans', sans-serif";
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

const MencionesTab = ({ session, onContratar }) => {
  const [tiposBro7Band, setTiposBro7Band] = useState('capitulo_saga');
  const [idiomas, setIdiomas]     = useState(() =>
    Object.fromEntries(GRUPOS.map(g => [g.grupo_id, 'ES']))
  );
  const [faseLunarId,     setFaseLunarId]     = useState(null);
  const [faseLunarNombre, setFaseLunarNombre] = useState('');

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

  return (
    <div className="p-6 flex flex-col items-center">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div className="mb-10 text-center w-full">
        <h2 style={{ fontFamily: HEADING, fontWeight: 800 }} className="text-4xl font-black tracking-tight text-white">
          MENCIONES PERSONAJES
        </h2>
        <p style={{ fontFamily: HEADING, fontWeight: 700, color: '#facc15' }} className="text-2xl mt-3">
          10 grupos de personajes disponibles
        </p>
        <div style={{ fontFamily: INTER }} className="text-lg md:text-xl text-gray-300 leading-relaxed text-center font-medium max-w-5xl mx-auto mt-4 px-4">
          <p className="mb-1">
            Cada grupo graba un audio por <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">Fase Lunar</span> con una <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">palabra clave</span> que necesitan escuchar los usuarios para ganar sus <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold" style={{ textShadow: '0 0 20px rgba(0,255,200,0.5), 0 0 60px rgba(168,85,247,0.3)' }}>Lunas</span>.
          </p>
          <p className="mb-1 mt-2">
            Son audios cortos. Es un espacio idóneo para que los personajes envíen un <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">saludo a tu comercio</span> o hagan alguna mención sobre tu actividad o localización.
          </p>
          <p className="mb-1 mt-2">
            Si los grupos están libres puedes contratar a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">más de uno</span>.
          </p>
        </div>
        <p style={{ fontFamily: INTER, fontWeight: 600 }} className="text-base text-cyan-400 mt-4">
          Selecciona para contratar una mención
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-5xl mb-24">
        {GRUPOS.map(grupo => {
          return (
            <div
              key={grupo.grupo_id}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border transition-all bg-zinc-900/40 border-white/5 hover:border-fuchsia-500/20"
            >
              <img
                src={grupo.imagen}
                alt={grupo.nombre}
                className="w-full aspect-square rounded-lg object-cover border border-white/5"
                onError={e => { e.target.style.display = 'none' }}
              />
              <h3 style={{ fontFamily: HEADING, fontWeight: 700 }} className="text-sm text-white uppercase tracking-wider mt-1">
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

              <div className="mt-auto pt-2 w-full">
                <button
                  onClick={() => onContratar(`band_${grupo.grupo_id}`)}
                  style={{ fontFamily: HEADING, fontWeight: 700 }}
                  className="w-full text-[11px] bg-fuchsia-600 hover:bg-fuchsia-500 text-white uppercase tracking-widest py-2 rounded transition-all"
                >
                  CONTRATAR
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MencionesTab;