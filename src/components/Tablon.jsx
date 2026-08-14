import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const PERSONAJES_META = [
  { key: 'tito',      nombre: 'Tito',            img: '/emojis/tito.webp' },
  { key: 'lara',      nombre: 'Lara',            img: '/emojis/lara.webp' },
  { key: 'puffo',     nombre: 'Puffo',           img: '/emojis/puffo.webp' },
  { key: 'evelyn',    nombre: 'Evelyn',          img: '/emojis/evelyn.webp' },
  { key: 'larry',     nombre: 'Larry',           img: '/emojis/larry.webp' },
  { key: 'isabella',  nombre: 'Isabella',        img: '/emojis/isabella.webp' },
  { key: 'profesor',  nombre: 'Profesor Robles', img: '/emojis/profesor.webp' },
  { key: 'mapache',   nombre: 'Mapache',         img: '/emojis/mapache.webp' },
  { key: 'ami',       nombre: 'Ami',             img: '/emojis/ami.webp' },
  { key: 'smisterio', nombre: 'Sr. Misterio',    img: '/emojis/smisterio.webp' },
  { key: 'jaguar',    nombre: 'Jaguar',          img: '/emojis/jaguar.webp' },
  { key: 'orumama',   nombre: 'Orumama',         img: '/emojis/orumama.webp' },
  { key: 'nova',      nombre: 'Nova',            img: '/emojis/nova.webp' },
  { key: 'rumores',   nombre: 'Rumores',         img: '/emojis/rumores.webp' },
];

function tiempoRelativo(dateStr) {
  if (!dateStr) return 'Sin actualizar';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
}

const Tablon = ({ isMobile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [personajes, setPersonajes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('personaje_update')
        .select('personaje_id, vivencia_actual, estado_animo, updated_at');
      if (data) setPersonajes(data);
    };
    fetchData();
  }, []);

  const getDataForPersonaje = (key) => {
    const row = personajes.find(p => p.personaje_id === key);
    if (!row || (!row.vivencia_actual && !row.estado_animo)) return null;
    return row;
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl z-[60] flex flex-col items-center font-mono">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #3b82f6);
          border-radius: 3px;
          border: 1px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #22d3ee, #60a5fa);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
        }
      `}</style>
      <div className={`w-full bg-[#080808]/90 backdrop-blur-md border-t border-x border-cyan-500/50 rounded-t-3xl overflow-hidden shadow-[0_-10px_40px_rgba(6,182,212,0.15)] transition-all duration-500 ease-in-out flex flex-col ${
        isOpen ? 'max-h-[85vh] opacity-100 border-b-0' : 'max-h-0 opacity-0 border-transparent'
      }`}>
        <div className="overflow-y-auto custom-scrollbar w-full px-6 pb-12 pt-8 flex-1">
          <div className="text-center mb-10 animate-fadeIn">
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.35em] mb-3">
              Mensajes de los Personajes
            </p>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-wide"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                background: 'linear-gradient(135deg, #22d3ee, #67e8f9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              El Tablón
            </h2>
            <p className="text-gray-500 text-sm uppercase tracking-[0.25em] mt-2">
              Mensajes de los Personajes · Bro7Vision
            </p>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent mx-auto mt-5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {PERSONAJES_META.map((pj) => {
              const data = getDataForPersonaje(pj.key);
              return (
                <div key={pj.key} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    <img src={pj.img} alt={pj.nombre} className="w-14 h-14 object-contain drop-shadow-lg" />
                    <div>
                      <p className="text-white font-bold text-base">{pj.nombre}</p>
                      {data?.estado_animo && (
                        <span className="inline-block text-xs font-bold text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded-full border border-cyan-500/20 mt-1">
                          {data.estado_animo}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 min-h-[3.5rem]">
                    {data?.vivencia_actual || <span className="text-gray-600">Sin novedades por ahora.</span>}
                  </p>
                  <p className="text-gray-600 text-xs mt-2 uppercase tracking-widest">
                    {data?.updated_at ? tiempoRelativo(data.updated_at) : 'Sin actualizar'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-6 text-center">
              <p className="text-cyan-300 font-black text-lg uppercase tracking-widest">
                ¿Quieres saber más? Pásate por los Chats →
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-4">
            <div className="border border-dashed border-white/20 rounded-2xl p-6 text-center">
              <p className="text-2xl mb-2">🛍️</p>
              <p className="text-white font-black text-base uppercase tracking-widest mb-1">MERCH BRO7VISION</p>
              <p className="text-gray-500 text-sm">Camisetas, accesorios y más con tus personajes favoritos.</p>
              <p className="text-gray-600 text-xs uppercase tracking-widest mt-2">— Próximamente —</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 uppercase tracking-[0.3em] mt-6 pb-4"
            style={{ fontFamily: "'Georgia', serif" }}>
            La vida en Bro7Vision nunca se detiene.
          </p>
        </div>
      </div>

      <button onClick={() => setIsOpen(!isOpen)}
        className={`bg-black/90 backdrop-blur-md border border-cyan-500/50 ${
          isOpen ? 'rounded-b-2xl border-t-0 border-cyan-500/10 text-gray-400' : 'rounded-t-2xl border-b-0 text-cyan-400'
        } px-8 py-3 font-black uppercase tracking-widest hover:text-cyan-300 transition-all flex items-center justify-center gap-2 w-64 shadow-[0_0_20px_rgba(6,182,212,0.2)] group`}>
        <span className="text-lg">📡</span>
        <span className="text-xs md:text-sm">{isOpen ? 'Cerrar' : 'El Tablón'}</span>
        <span className="text-lg">{isOpen ? '▲' : '📡'}</span>
      </button>
    </div>
  );
};

export default Tablon;