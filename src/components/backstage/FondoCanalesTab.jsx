import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { CHANNELS, FASES, TURNOS } from '../../data/citycodes';
import FondoCanales from './FondoCanales';

// Canal Moon (2): Fase 0 = solo Luna Nueva (fase 1) con T1–T4.
// Cuando se active Luna Creciente se añade fase 2 con sus 4 turnos, etc.
const MOON_FASES_ACTIVAS = [1]; // ampliar aquí cuando abra nueva fase

const SLOTS = (() => {
  const slots = [];
  for (const fase of MOON_FASES_ACTIVAS)
    for (let turno = 1; turno <= 4; turno++)
      for (let disp = 0; disp <= 1; disp++)
        slots.push({ canal: 2, fase, turno, dispositivo: disp });
  for (const canal of [1, 3, 4, 5, 6, 7, 8, 9])
    for (let turno = 1; turno <= 4; turno++)
      for (let disp = 0; disp <= 1; disp++)
        slots.push({ canal, fase: 0, turno, dispositivo: disp });
  return slots;
})();

const CANAL_LIST = [...new Set(SLOTS.map(s => s.canal))].sort((a, b) => a - b);

const slotLabel = (slot) => TURNOS[slot.turno];
const slotNum   = (slot) => slot.turno;

const HEADING = "'Noto Sans', sans-serif";
const NOTO = "'Noto Sans', sans-serif";

const COLOR_DIRECTOR = '#00ff88';
const COLOR_PRODUCTOR = '#ff00ff';

const ColHeaders = ({ slots, prefix, hexColor }) => (
  <div className="flex items-end gap-2 mb-1">
    <div className="w-8 shrink-0" />
    <div className="grid grid-cols-4 gap-3 flex-1">
      {slots.map((slot, i) => (
        <div key={i} className="text-center">
          <div style={{ fontFamily: NOTO, color: hexColor, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3 }} className="truncate">
            {prefix} · T{slotNum(slot)} &nbsp; {slotLabel(slot)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MarketplaceTab = ({ session, profile, role: roleProp, onContratar }) => {
  const [miniaturas, setMiniaturas] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const role     = roleProp ?? session?.user?.user_metadata?.role
    ?? (profile?.tipo ? 'director' : 'advertiser');
  const rolColor = role === 'director' ? COLOR_DIRECTOR : COLOR_PRODUCTOR;

  useEffect(() => {
    supabase
      .from('bs_miniaturas')
      .select('canal, fase_lunar, funcion, miniatura_url')
      .eq('activo', true)
      .then(({ data }) => {
        setMiniaturas(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-full">

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;900&display=swap');`}</style>

      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-white/5 px-6 py-4">
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <h2 style={{ fontFamily: HEADING }} className="text-3xl font-black tracking-tight text-white">
              MUESTRARIO - CONTRATACIÓN POR FASE LUNAR
            </h2>
            <p style={{ fontFamily: HEADING, fontWeight: 700, color: '#facc15' }} className="text-2xl mt-2">72 Turnos · 9 canales · 2 dispositivos PC y Móvil</p>
            <div style={{ fontFamily: "'Inter', sans-serif" }} className="text-lg md:text-xl text-gray-300 leading-relaxed text-center font-medium max-w-4xl mx-auto mt-4 px-4">
              <p className="mb-1">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold" style={{ textShadow: '0 0 20px rgba(0,255,200,0.5), 0 0 60px rgba(168,85,247,0.3)' }}>Bro7vision</span> vive sincronizado con el <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">ciclo Lunar</span>.
              </p>
              <p className="mb-1 mt-2">
                La <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">contratación</span> de los turnos tiene una durabilidad de una <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">Fase Lunar</span>: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">Luna Nueva</span>, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">Luna Creciente</span>, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">Luna Llena</span> o <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">Luna Menguante</span>.
              </p>
              <p className="mb-1 mt-2">
                Los <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">Fondos de Canales</span> se renovarán ocasionalmente, sin interrumpir <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">campañas publicitarias</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-gray-600 border border-white/5 px-2.5 py-1 rounded">
              FASE 0 · SIMULACIÓN
            </span>
          </div>
        </div>
      </div>

      {/* Grid o estados */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm animate-pulse" style={{ fontFamily: HEADING }}>
          CARGANDO ESCENARIOS...
        </div>
      ) : (
        <div className="p-6">
          {CANAL_LIST.map(canal => {
            const pcSlots  = SLOTS.filter(s => s.canal === canal && s.dispositivo === 0)
                                  .sort((a, b) => (a.turno || a.fase) - (b.turno || b.fase));
            const mobSlots = SLOTS.filter(s => s.canal === canal && s.dispositivo === 1)
                                  .sort((a, b) => (a.turno || a.fase) - (b.turno || b.fase));
            return (
              <div key={canal} className="mb-12">

                {/* Título canal */}
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ fontFamily: HEADING, color: rolColor, textShadow: `0 0 12px ${rolColor}55` }} className="text-2xl font-black tracking-widest">
                    CANAL{canal}
                  </span>
                  <span style={{ fontFamily: HEADING, color: rolColor }} className="text-xl font-black tracking-wide">
                    {CHANNELS[canal]}
                  </span>
                  {canal === 2 && (
                    <span style={{ fontFamily: HEADING, color: rolColor, opacity: 0.55 }} className="text-sm font-bold uppercase tracking-widest">
                      {FASES[MOON_FASES_ACTIVAS[0]]}
                    </span>
                  )}
                  <div className="flex-1 h-px" style={{ background: `${rolColor}20` }} />
                </div>

                {/* Cabeceras columnas PC */}
                <ColHeaders slots={pcSlots} prefix="PC" hexColor={rolColor} />

                {/* Fila PC */}
                <div className="flex items-start gap-2 mb-6">
                  <span style={{ fontFamily: NOTO, color: rolColor, fontSize: 9, fontWeight: 600, letterSpacing: '0.15em' }} className="uppercase w-8 pt-2 shrink-0">
                    PC
                  </span>
                  <div className="grid grid-cols-4 gap-3 flex-1">
                    {pcSlots.map((slot, i) => {
                      const canalMiniatura = slot.dispositivo === 0 ? slot.canal : slot.canal + 10;
                      const miniatura = miniaturas.find(m =>
                        m.canal === canalMiniatura &&
                        m.fase_lunar === (slot.canal === 2 ? slot.fase : 0) &&
                        m.funcion === canalMiniatura * 10 + slot.turno
                      )?.miniatura_url ?? null;
                      return (
                        <FondoCanales key={i} slot={slot} miniaturaUrl={miniatura} onContratar={onContratar} />
                      );
                    })}
                  </div>
                </div>

                {/* Cabeceras columnas MOVIL */}
                <ColHeaders slots={mobSlots} prefix="MOVIL " hexColor={rolColor} />

                {/* Fila MOVIL */}
                <div className="flex items-start gap-2">
                  <span style={{ fontFamily: NOTO, color: rolColor, fontSize: 9, fontWeight: 600, letterSpacing: '0.15em' }} className="uppercase w-8 pt-2 shrink-0">
                    MOVIL 
                  </span>
                  <div className="grid grid-cols-4 gap-3 flex-1">
                    {mobSlots.map((slot, i) => {
                      const canalMiniatura = slot.dispositivo === 0 ? slot.canal : slot.canal + 10;
                      const miniatura = miniaturas.find(m =>
                        m.canal === canalMiniatura &&
                        m.fase_lunar === (slot.canal === 2 ? slot.fase : 0) &&
                        m.funcion === canalMiniatura * 10 + slot.turno
                      )?.miniatura_url ?? null;
                      return (
                        <FondoCanales key={i} slot={slot} miniaturaUrl={miniatura} onContratar={onContratar} />
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MarketplaceTab;
