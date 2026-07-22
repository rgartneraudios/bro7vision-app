import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import ReservaPanelRail from './ReservaPanelRail';

const SYNE = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const SECTORES = [
  { id: 'CANJES',      label: 'CANJES DE LUNAS',   color: 'cyan'    },
  { id: 'SHOP_AMIGOS', label: 'SHOP AMIGOS',        color: 'fuchsia' },
];

const SlideRailTab = ({ session, role }) => {
  const [railData, setRailData] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    supabase
      .from('trivia_rail')
      .select('slot_numero, sector, banner_url, comercio_id')
      .eq('activo', true)
      .then(({ data }) => setRailData(data || []));
  }, []);

  const isOccupied = (sector, slotNum) =>
    railData.some(r => r.sector === sector && r.slot_numero === slotNum && r.comercio_id);

  const handleSlotClick = (sector, slotNum) => {
    setSelectedSlot({ sector, slot_numero: slotNum });
  };

  const renderGrid = (sector, color) => {
    const isCyan = color === 'cyan';
    const badgeColor = isCyan ? 'text-cyan-400 border-cyan-500/40' : 'text-fuchsia-400 border-fuchsia-500/40';
    const occupyColor = isCyan ? 'bg-rose-950/40 border-rose-500/40 text-rose-400' : 'bg-rose-950/40 border-rose-500/40 text-rose-400';
    const freeColor = isCyan ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400' : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400';

    return (
      <div className="mb-8">
        <h3 style={{ fontFamily: SYNE, fontWeight: 800 }} className={`text-lg text-${color}-400 uppercase tracking-widest mb-4`}>
          {sector === 'CANJES' ? 'CANJES DE LUNAS' : 'SHOP AMIGOS'}
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(num => {
            const ocupado = isOccupied(sector, num);
            const isStatic = num % 2 === 1; // 1,3,5,7

            if (isStatic) {
              return (
                <div
                  key={num}
                  className="bg-zinc-900 border border-white/5 rounded-xl flex flex-col items-center justify-center py-6 px-2 cursor-default"
                >
                  <span style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-3xl text-white/20">{num}</span>
                  <span style={{ fontFamily: INTER }} className={`text-[10px] uppercase tracking-widest mt-1 ${badgeColor} border px-2 py-0.5 rounded`}>
                    BROVISION
                  </span>
                </div>
              );
            }

            return (
              <div
                key={num}
                onClick={() => !ocupado && handleSlotClick(sector, num)}
                className={`rounded-xl border flex flex-col items-center justify-center py-6 px-2 transition-all ${
                  ocupado
                    ? 'bg-zinc-900/50 border-white/5 cursor-default opacity-60'
                    : 'bg-zinc-900 border-white/10 hover:border-white/25 cursor-pointer'
                }`}
              >
                <span style={{ fontFamily: SYNE, fontWeight: 800 }} className={`text-3xl ${ocupado ? 'text-white/10' : 'text-white/40'}`}>{num}</span>
                {ocupado ? (
                  <span style={{ fontFamily: INTER }} className="text-[10px] uppercase tracking-widest mt-1 border px-2 py-0.5 rounded bg-rose-950/40 border-rose-500/40 text-rose-400">
                    OCUPADO
                  </span>
                ) : (
                  <span style={{ fontFamily: INTER }} className={`text-[10px] uppercase tracking-widest mt-1 border px-2 py-0.5 rounded cursor-pointer ${freeColor}`}>
                    LIBRE
                  </span>
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div className="mb-8 text-center w-full max-w-3xl">
        <h2 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-xl font-black tracking-tight text-white">
          SLIDE RAIL
        </h2>
        <p style={{ fontFamily: SYNE, fontWeight: 700, color: '#facc15' }} className="text-xl mt-1">
          {role === 'advertiser' ? 'Selecciona un slot libre para contratar' : 'Estado de ocupación'}
        </p>
        <p style={{ fontFamily: INTER, fontWeight: 400, color: '#f5e6c8' }} className="text-lg mt-4 w-full max-w-full text-center leading-relaxed px-4">
          Cada sector tiene 8 slots numerados. Los slots impares (1,3,5,7) son de BROVISION. Los pares (2,4,6,8) están disponibles para contratar.
        </p>
      </div>

      <div className="max-w-3xl w-full">
        {SECTORES.map(s => renderGrid(s.id, s.color))}
      </div>

      <p style={{ fontFamily: SYNE }} className="text-[9px] text-gray-700 mt-6 uppercase tracking-widest">
        FASE 0 · Simulación
      </p>

      {selectedSlot && (
        <ReservaPanelRail
          slot={selectedSlot}
          session={session}
          onClose={() => setSelectedSlot(null)}
          onReserved={() => {
            setSelectedSlot(null);
            supabase
              .from('trivia_rail')
              .select('slot_numero, sector, banner_url, comercio_id')
              .eq('activo', true)
              .then(({ data }) => setRailData(data || []));
          }}
        />
      )}
    </div>
  );
};

export default SlideRailTab;
