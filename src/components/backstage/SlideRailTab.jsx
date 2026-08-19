import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const HEADING = "'Noto Sans', sans-serif";
const INTER = "'Inter', sans-serif";

const SECTORES = [
  { id: 'CANJES',      label: 'CANJES DE LUNAS',   color: 'cyan'    },
  { id: 'SHOP_AMIGOS', label: 'SHOP AMIGOS',        color: 'fuchsia' },
];

const SlideRailTab = ({ session, onContratar }) => {
  const [railData, setRailData] = useState([]);

  useEffect(() => {
    supabase
      .from('trivia_rail')
      .select('slot_numero, sector, banner_url, comercio_id')
      .eq('activo', true)
      .then(({ data }) => setRailData(data || []));
  }, []);

  const sectorKey = (s) => s === 'CANJES' ? 'canjear' : 'amigos';

  const getSlot = (sector, slotNum) =>
    railData.find(r => r.sector === sector && r.slot_numero === slotNum && r.comercio_id);

  const renderGrid = (sector, color) => {
    const isCyan = color === 'cyan';
    const badgeColor = isCyan ? 'text-cyan-400 border-cyan-500/40' : 'text-fuchsia-400 border-fuchsia-500/40';
    const sk = sectorKey(sector);

    return (
      <div className="mb-8">
        <h3 style={{ fontFamily: HEADING, fontWeight: 800 }} className={`text-lg text-${color}-400 uppercase tracking-widest mb-4`}>
          {sector === 'CANJES' ? 'CANJES DE LUNAS' : 'SHOP AMIGOS'}
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(num => {
            const ocupado = getSlot(sector, num);
            const isStatic = num % 2 === 1;

            const imgSrc = ocupado?.banner_url || `/images/slideraid_${sk}_${num}.webp`;

            return (
              <div
                key={num}
                className="rounded-xl border flex flex-col p-2 transition-all bg-zinc-900 border-white/10 hover:border-white/25 cursor-pointer"
              >
                <div style={{ aspectRatio: '5 / 12' }} className="w-full bg-zinc-900/80 rounded overflow-hidden mb-2">
                  <img
                    src={imgSrc}
                    alt={`Slot ${num}`}
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>
                {isStatic ? (
                  <span style={{ fontFamily: INTER }} className={`text-[10px] uppercase tracking-widest text-center ${badgeColor} border px-2 py-0.5 rounded self-center`}>
                    BROVISION
                  </span>
                ) : (
                  <button
                    onClick={() => onContratar(`rail_${sector.toLowerCase()}_s${num}`)}
                    style={{ fontFamily: INTER, fontWeight: 700 }}
                    className="w-full text-[10px] uppercase tracking-widest text-center border px-2 py-1 rounded self-center bg-emerald-950/30 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-300 transition-all"
                  >
                    CONTRATAR
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div className="mb-8 text-center w-full max-w-3xl">
        <h2 style={{ fontFamily: HEADING, fontWeight: 800 }} className="text-xl font-black tracking-tight text-white">
          SLIDE RAIL
        </h2>
        <p style={{ fontFamily: HEADING, fontWeight: 700, color: '#facc15' }} className="text-xl mt-1">
          Selecciona un slot libre para contratar
        </p>
        <div style={{ fontFamily: INTER }} className="text-lg md:text-xl text-gray-300 leading-relaxed text-center font-medium max-w-4xl mx-auto mt-4 px-4">
            <p className="mb-1">
              Cada sector tiene <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">8 slots numerados</span>. Los slots impares (1,3,5,7) son de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold" style={{ textShadow: '0 0 20px rgba(0,255,200,0.5), 0 0 60px rgba(168,85,247,0.3)' }}>BROVISION</span>. Los pares (2,4,6,8) están <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">disponibles para contratar</span>.
            </p>
            <p className="mb-1 mt-2">
              Los Slots de BROVISION premian con <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">10 puntos Luna</span> mientras que los Slots Contratados suman <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">20 puntos Lunas</span>, algo que los <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">usuarios apreciarán</span>.
            </p>
          </div>
      </div>

      <div className="max-w-3xl w-full">
        {SECTORES.map(s => (
          <React.Fragment key={s.id}>
            {renderGrid(s.id, s.color)}
          </React.Fragment>
        ))}
      </div>

      <p style={{ fontFamily: HEADING }} className="text-[9px] text-gray-700 mt-6 uppercase tracking-widest">
        FASE 0 · Simulación
      </p>

    </div>
  );
};

export default SlideRailTab;
