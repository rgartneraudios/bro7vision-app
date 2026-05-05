import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { CHANNELS, FASES, TURNOS } from '../../data/citycodes';
import EscenarioCard from './EscenarioCard';
import ReservaPanel from './ReservaPanel';

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

const SYNE = "'Exo 2', sans-serif";

const COLOR_DIRECTOR = '#00ff88';
const COLOR_PRODUCTOR = '#ff00ff';

const ColHeaders = ({ slots, prefix, hexColor }) => (
  <div className="flex items-end gap-2 mb-1">
    <div className="w-8 shrink-0" />
    <div className="grid grid-cols-4 gap-3 flex-1">
      {slots.map((slot, i) => (
        <div key={i} className="text-center">
          <div style={{ fontFamily: SYNE, color: hexColor, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3 }} className="truncate">
            {prefix} · T{slotNum(slot)} &nbsp; {slotLabel(slot)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MarketplaceTab = ({ session, profile }) => {
  const [escenarios, setEscenarios] = useState([]);
  const [butacas,    setButacas]    = useState([]);
  const [tarifas,    setTarifas]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [selectedSlot,     setSelectedSlot]    = useState(null);
  const [coberturaInicial, setCoberturaInicial] = useState(null);

  const role     = session?.user?.user_metadata?.role ?? 'guest';
  const rolColor = role === 'director' ? COLOR_DIRECTOR : COLOR_PRODUCTOR;

  const fetchData = useCallback(async () => {
    setError(null);
    const [{ data: escs, error: eErr }, { data: buts, error: bErr }, { data: tars, error: tErr }] =
      await Promise.all([
        supabase.from('bs_escenarios').select('id,canal,fase_lunar,funcion,activo').eq('activo', true),
        supabase.from('bs_butacas').select('canal,fase_lunar,funcion,dispositivo,cobertura,ciudad_codigo,estado'),
        supabase.from('bs_tarifas').select('cobertura,precio').eq('activo', true),
      ]);
    if (eErr || bErr || tErr) setError('Error cargando datos del Marketplace.');
    setEscenarios(escs || []);
    setButacas(buts   || []);
    setTarifas(tars   || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getEscenarioId = (slot) => {
    if (slot.canal === 2)
      return escenarios.find(e => e.canal === 2 && e.fase_lunar === slot.fase && e.funcion === slot.turno)?.id ?? null;
    return escenarios.find(e => e.canal === slot.canal && e.funcion === slot.turno)?.id ?? null;
  };

  const handleSelectSlot = ({ slot, coberturaInicial: cob }) => {
    setSelectedSlot(slot);
    setCoberturaInicial(cob);
  };

  const handleReserved = () => {
    setSelectedSlot(null);
    supabase
      .from('bs_butacas')
      .select('canal,fase_lunar,funcion,dispositivo,cobertura,ciudad_codigo,estado')
      .then(({ data }) => setButacas(data || []));
  };

  const totalOcupadas = butacas.filter(b =>
    ['EN_CASTING', 'EN_RODAJE', 'EN_DEBATE', 'LISTO_PARA_ESTRENO', 'EN_CARTELERA'].includes(b.estado)
  ).length;

  return (
    <div className="relative min-h-full">

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 style={{ fontFamily: SYNE }} className="text-xl font-black tracking-tight text-white">
              CONTRATACIÓN PARA LA PRÓXIMA FASE LUNAR
            </h2>
            <p style={{ fontFamily: SYNE, fontWeight: 700, color: '#facc15' }} className="text-xl mt-1">72 slots · 9 canales · 2 dispositivos</p>
            <p style={{ fontFamily: SYNE }} className="text-sm text-white mt-2 max-w-xl leading-relaxed">
              El sistema Semáforo es una escala de contexto de emisión. Todo lo que está en BRO7VISION es apto para todos, aunque hay creadores cuyo estilo encaja mejor en ciertos momentos del día. Igual que un monólogo de humor adulto en la tele — no es inapropiado, simplemente tiene su franja horaria óptima.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {totalOcupadas > 0 && (
              <span className="text-[9px] text-amber-400 border border-amber-900/40 px-2.5 py-1 rounded bg-amber-950/20">
                {totalOcupadas} butacas ocupadas
              </span>
            )}
            <span className="text-[9px] text-gray-600 border border-white/5 px-2.5 py-1 rounded">
              FASE 0 · SIMULACIÓN
            </span>
          </div>
        </div>
      </div>

      {/* Leyenda semáforo — centrada */}
      <div className="flex justify-center px-6 pt-6 pb-2">
        <div className="inline-flex flex-col gap-2 bg-white/5 border border-white/10 rounded-2xl px-8 py-4 backdrop-blur-sm">
          {[
            { emoji: '🟢', label: 'VERDE',    turnos: 'T1-T2-T3-T4', horario: '00:00 – 24:00', desc: 'Family Friendly universal',    color: '#4ade80' },
            { emoji: '🟡', label: 'AMARILLO', turnos: 'T3-T4',        horario: '17:00 – 05:00', desc: 'Family Friendly con matices',  color: '#facc15' },
            { emoji: '🔴', label: 'ROJO',     turnos: 'T4',           horario: '23:00 – 05:00', desc: 'Family Friendly adulto',       color: '#f87171' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-4">
              <span className="text-lg">{s.emoji}</span>
              <span style={{ fontFamily: SYNE, color: s.color, minWidth: 70 }} className="text-xs font-black uppercase tracking-widest">{s.label}</span>
              <span style={{ fontFamily: SYNE }} className="text-[10px] text-gray-400 font-mono w-20">{s.turnos}</span>
              <span style={{ fontFamily: SYNE }} className="text-[10px] text-gray-500 font-mono w-28">{s.horario}</span>
              <span style={{ fontFamily: SYNE }} className="text-[10px] text-gray-400">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid o estados */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm animate-pulse" style={{ fontFamily: SYNE }}>
          CARGANDO ESCENARIOS...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center px-6">
          <div className="text-red-400 text-xs mb-3">{error}</div>
          <button onClick={fetchData} className="text-[10px] border border-white/10 hover:border-white/30 text-gray-400 hover:text-white px-4 py-2 rounded transition-all">
            REINTENTAR
          </button>
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
                  <span style={{ fontFamily: SYNE, color: rolColor, textShadow: `0 0 12px ${rolColor}55` }} className="text-2xl font-black tracking-widest">
                    CH{canal}
                  </span>
                  <span style={{ fontFamily: SYNE, color: rolColor }} className="text-xl font-black tracking-wide">
                    {CHANNELS[canal]}
                  </span>
                  {canal === 2 && (
                    <span style={{ fontFamily: SYNE, color: rolColor, opacity: 0.55 }} className="text-sm font-bold uppercase tracking-widest">
                      {FASES[MOON_FASES_ACTIVAS[0]]}
                    </span>
                  )}
                  <div className="flex-1 h-px" style={{ background: `${rolColor}20` }} />
                </div>

                {/* Cabeceras columnas PC */}
                <ColHeaders slots={pcSlots} prefix="PC" hexColor={rolColor} />

                {/* Fila PC */}
                <div className="flex items-start gap-2 mb-6">
                  <span style={{ fontFamily: SYNE, color: rolColor, fontSize: 9, fontWeight: 600, letterSpacing: '0.15em' }} className="uppercase w-8 pt-2 shrink-0">
                    PC
                  </span>
                  <div className="grid grid-cols-4 gap-3 flex-1">
                    {pcSlots.map((slot, i) => (
                      <EscenarioCard key={i} slot={slot} butacas={butacas} onSelectSlot={handleSelectSlot} role={role} />
                    ))}
                  </div>
                </div>

                {/* Cabeceras columnas MT */}
                <ColHeaders slots={mobSlots} prefix="MT" hexColor={rolColor} />

                {/* Fila MT */}
                <div className="flex items-start gap-2">
                  <span style={{ fontFamily: SYNE, color: rolColor, fontSize: 9, fontWeight: 600, letterSpacing: '0.15em' }} className="uppercase w-8 pt-2 shrink-0">
                    MT
                  </span>
                  <div className="grid grid-cols-4 gap-3 flex-1">
                    {mobSlots.map((slot, i) => (
                      <EscenarioCard key={i} slot={slot} butacas={butacas} onSelectSlot={handleSelectSlot} role={role} />
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {selectedSlot && (
        <ReservaPanel
          slot={selectedSlot}
          coberturaInicial={coberturaInicial}
          escenarioId={getEscenarioId(selectedSlot)}
          tarifas={tarifas}
          session={session}
          profile={profile}
          onClose={() => setSelectedSlot(null)}
          onReserved={handleReserved}
        />
      )}

    </div>
  );
};

export default MarketplaceTab;
