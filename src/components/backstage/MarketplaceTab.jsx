import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import EscenarioCard from './EscenarioCard';
import ReservaPanel from './ReservaPanel';

// Genera los 72 slots: 8 Moon (4 fases × 2 disp) + 64 resto (8 canales × 4 turnos × 2 disp)
const SLOTS = (() => {
  const slots = [];
  for (let fase = 1; fase <= 4; fase++) {
    for (let disp = 0; disp <= 1; disp++) {
      slots.push({ canal: 2, fase, turno: 0, dispositivo: disp });
    }
  }
  for (const canal of [1, 3, 4, 5, 6, 7, 8, 9]) {
    for (let turno = 1; turno <= 4; turno++) {
      for (let disp = 0; disp <= 1; disp++) {
        slots.push({ canal, fase: 0, turno, dispositivo: disp });
      }
    }
  }
  return slots; // 8 + 64 = 72
})();

const MarketplaceTab = ({ session, profile }) => {
  const [escenarios, setEscenarios] = useState([]);
  const [butacas,    setButacas]    = useState([]);
  const [tarifas,    setTarifas]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [selectedSlot,      setSelectedSlot]      = useState(null);
  const [coberturaInicial,  setCoberturaInicial]   = useState(null);

  const fetchData = useCallback(async () => {
    setError(null);
    const [{ data: escs, error: eErr }, { data: buts, error: bErr }, { data: tars, error: tErr }] =
      await Promise.all([
        supabase.from('bs_escenarios').select('id,canal,fase_lunar,funcion,activo').eq('activo', true),
        supabase.from('bs_butacas').select('canal,fase_lunar,funcion,dispositivo,cobertura,ciudad_codigo,estado'),
        supabase.from('bs_tarifas').select('cobertura,precio').eq('activo', true),
      ]);

    if (eErr || bErr || tErr) {
      setError('Error cargando datos del Marketplace.');
    }

    setEscenarios(escs  || []);
    setButacas(buts     || []);
    setTarifas(tars     || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getEscenarioId = (slot) => {
    if (slot.canal === 2) {
      return escenarios.find(e => e.canal === 2 && e.fase_lunar === slot.fase)?.id ?? null;
    }
    return escenarios.find(e => e.canal === slot.canal && e.funcion === slot.turno)?.id ?? null;
  };

  const handleSelectSlot = ({ slot, coberturaInicial: cob }) => {
    setSelectedSlot(slot);
    setCoberturaInicial(cob);
  };

  const handleReserved = () => {
    setSelectedSlot(null);
    // Refrescar butacas para reflejar el nuevo OCUPADO
    supabase
      .from('bs_butacas')
      .select('canal,fase_lunar,funcion,dispositivo,cobertura,ciudad_codigo,estado')
      .then(({ data }) => setButacas(data || []));
  };

  const totalOcupadas = butacas.filter(b =>
    ['EN_CASTING','EN_RODAJE','EN_DEBATE','LISTO_PARA_ESTRENO','EN_CARTELERA'].includes(b.estado)
  ).length;

  return (
    <div className="relative min-h-full">

      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">MARKETPLACE DE ESCENARIOS</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">
              72 slots disponibles · Elige tu espacio publicitario
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

      {/* Leyenda */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-4 text-[8px] text-gray-600">
        <span className="flex items-center gap-1">
          <span className="text-emerald-400">○</span> LIBRE — pulsa para reservar
        </span>
        <span className="flex items-center gap-1">
          <span className="text-red-500">●</span> OCUPADO
        </span>
        <span className="flex items-center gap-1">
          <span className="bg-cyan-950/90 text-cyan-400 px-1 rounded">PC</span>
          <span className="bg-fuchsia-950/90 text-fuchsia-400 px-1 rounded">MOB</span>
          dispositivos separados
        </span>
      </div>

      {/* Grid o estados */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm animate-pulse">
          CARGANDO ESCENARIOS...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center px-6">
          <div className="text-red-400 text-xs mb-3">{error}</div>
          <button
            onClick={fetchData}
            className="text-[10px] border border-white/10 hover:border-white/30 text-gray-400 hover:text-white px-4 py-2 rounded transition-all"
          >
            REINTENTAR
          </button>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {SLOTS.map((slot, idx) => (
              <EscenarioCard
                key={idx}
                slot={slot}
                butacas={butacas}
                onSelectSlot={handleSelectSlot}
              />
            ))}
          </div>
        </div>
      )}

      {/* Panel lateral de reserva */}
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
