import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const CANALES = [
  { label: 'Canal Moon',     pc: '01', movil: '11' },
  { label: 'Canal Mercurio', pc: '02', movil: '12' },
  { label: 'Canal Venus',    pc: '03', movil: '13' },
  { label: 'Canal Tierra',   pc: '04', movil: '14' },
  { label: 'Canal Marte',    pc: '05', movil: '15' },
  { label: 'Canal Júpiter',  pc: '06', movil: '16' },
  { label: 'Canal Saturno',  pc: '07', movil: '17' },
  { label: 'Canal Urano',    pc: '08', movil: '18' },
  { label: 'Canal Neptuno',  pc: '09', movil: '19' },
];

const TURNOS = [
  { value: 1, label: 'Turno 1 — 05:00–11:00' },
  { value: 2, label: 'Turno 2 — 11:00–17:00' },
  { value: 3, label: 'Turno 3 — 17:00–23:00' },
  { value: 4, label: 'Turno 4 — 23:00–05:00' },
];

const ALCANCES = ['LOCAL', 'NACIONAL', 'INTERNACIONAL'];

const FASES_LUNA = [
  'Luna Nueva', 'Creciente', 'Cuarto Creciente',
  'Gibosa Creciente', 'Luna Llena', 'Gibosa Menguante',
  'Cuarto Menguante', 'Menguante',
];

const InputStyle = "w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all";
const LabelStyle = "text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 block";

export default function PromoEcoTab({ userId }) {
  const [creditos,   setCreditos]   = useState(0);
  const [promos,     setPromos]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [ocupados,   setOcupados]   = useState([]);

  const [pregunta,   setPregunta]   = useState('');
  const [opcionA,    setOpcionA]    = useState('');
  const [opcionB,    setOpcionB]    = useState('');
  const [opcionC,    setOpcionC]    = useState('');
  const [correcta,   setCorrecta]   = useState('a');
  const [canalIdx,   setCanalIdx]   = useState(0);
  const [dispositivo,setDispositivo]= useState('pc');
  const [turno,      setTurno]      = useState(1);
  const [alcance,    setAlcance]    = useState('LOCAL');
  const [venceLuna,  setVenceLuna]  = useState(FASES_LUNA[4]);

  useEffect(() => {
    cargar();
    cargarOcupados();
  }, [userId]);

  const cargar = async () => {
    setLoading(true);
    const { data: perfil } = await supabase
      .from('profiles').select('promo_eco_creditos').eq('id', userId).single();
    setCreditos(perfil?.promo_eco_creditos || 0);

    const { data } = await supabase
      .from('promo_eco').select('*').eq('comercio_id', userId).order('created_at', { ascending: false });
    setPromos(data || []);
    setLoading(false);
  };

  const cargarOcupados = async () => {
    const { data } = await supabase
      .from('promo_eco').select('escenario_id, turno, alcance').eq('activo', true);
    setOcupados(data || []);
  };

  const slotOcupado = (escenarioId, turnoVal, alcanceVal) =>
    ocupados.some(o => o.escenario_id === escenarioId && o.turno === turnoVal && o.alcance === alcanceVal);

  const escenarioId = dispositivo === 'pc'
    ? CANALES[canalIdx].pc
    : CANALES[canalIdx].movil;

  const ocupado = slotOcupado(escenarioId, turno, alcance);

  const opcionConStar = (texto, clave) =>
    clave === correcta ? `${texto} (*)` : texto;

  const handleGuardar = async () => {
    if (!pregunta.trim() || !opcionA.trim() || !opcionB.trim() || !opcionC.trim()) {
      alert('Completa pregunta y las 3 opciones.'); return;
    }
    if (ocupado) { alert('Ese slot ya está ocupado. Elige otro canal, turno o alcance.'); return; }
    if (creditos < 1) { alert('Sin créditos PromoECO disponibles.'); return; }

    setSaving(true);
    const { error } = await supabase.from('promo_eco').insert([{
      comercio_id:  userId,
      pregunta:     pregunta.trim(),
      opcion_a:     opcionConStar(opcionA.trim(), 'a'),
      opcion_b:     opcionConStar(opcionB.trim(), 'b'),
      opcion_c:     opcionConStar(opcionC.trim(), 'c'),
      escenario_id: escenarioId,
      turno,
      alcance,
      activo:       true,
      vence_luna:   venceLuna,
    }]);

    if (error) { alert('Error: ' + error.message); setSaving(false); return; }

    await supabase.from('profiles')
      .update({ promo_eco_creditos: creditos - 1 })
      .eq('id', userId);

    setPregunta(''); setOpcionA(''); setOpcionB(''); setOpcionC('');
    setCorrecta('a');
    await cargar();
    await cargarOcupados();
    setSaving(false);
    alert('✅ PromoECO publicada.');
  };

  const handleDesactivar = async (id) => {
    await supabase.from('promo_eco').update({ activo: false }).eq('id', id);
    await cargar();
    await cargarOcupados();
  };

  if (loading) return <p className="text-gray-500 text-sm p-4">Cargando...</p>;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">

      {/* CRÉDITOS */}
      <div className={`flex items-center gap-4 p-5 rounded-2xl border ${creditos > 0 ? 'bg-green-950/20 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
        <span className="text-3xl">{creditos > 0 ? '📡' : '🔒'}</span>
        <div>
          <p className={`font-black text-lg ${creditos > 0 ? 'text-green-300' : 'text-gray-500'}`}>
            {creditos > 0
              ? `${creditos} crédito${creditos !== 1 ? 's' : ''} disponible${creditos !== 1 ? 's' : ''}`
              : 'Sin créditos PromoECO'}
          </p>
          <p className="text-gray-500 text-xs uppercase tracking-widest">
            {creditos > 0
              ? 'Cada PromoECO publicada consume 1 crédito'
              : 'Adquiere un Pack digital para activar PromoECO'}
          </p>
        </div>
      </div>

      {creditos === 0 && (
        <div className="p-8 rounded-3xl border border-white/5 bg-white/3 text-center space-y-3">
          <p className="text-4xl">📡</p>
          <p className="text-white font-black text-base uppercase tracking-widest">PromoECO</p>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            Lanza preguntas promocionales en los canales de trivia. Los usuarios las responden, ganan Génesis y conocen tu negocio.
          </p>
          <p className="text-gray-600 text-xs uppercase tracking-widest mt-4">Disponible con Packs digitales</p>
        </div>
      )}

      {creditos > 0 && (
        <div className="space-y-5 p-6 rounded-3xl bg-black/40 border border-white/10">
          <p className="text-white font-black text-base uppercase tracking-widest">+ Nueva PromoECO</p>

          <div>
            <label className={LabelStyle}>Pregunta</label>
            <input className={InputStyle} placeholder="¿Dónde está la hamburguesería de Paco?" value={pregunta} onChange={e => setPregunta(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { clave: 'a', val: opcionA, set: setOpcionA, placeholder: 'Opción A' },
              { clave: 'b', val: opcionB, set: setOpcionB, placeholder: 'Opción B' },
              { clave: 'c', val: opcionC, set: setOpcionC, placeholder: 'Opción C' },
            ].map(({ clave, val, set, placeholder }) => (
              <div key={clave} className="flex items-center gap-3">
                <button
                  onClick={() => setCorrecta(clave)}
                  className={`w-8 h-8 rounded-full font-black text-xs flex-shrink-0 transition-all border
                    ${correcta === clave
                      ? 'bg-green-500 border-green-400 text-black'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-green-500/40'}`}>
                  {clave.toUpperCase()}
                </button>
                <input className={InputStyle} placeholder={`${placeholder}${correcta === clave ? ' ← correcta' : ''}`} value={val} onChange={e => set(e.target.value)} />
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs">Marca la letra correcta. El sistema añade (*) automáticamente.</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LabelStyle}>Canal</label>
              <select className={InputStyle} value={canalIdx} onChange={e => setCanalIdx(Number(e.target.value))}>
                {CANALES.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LabelStyle}>Dispositivo</label>
              <select className={InputStyle} value={dispositivo} onChange={e => setDispositivo(e.target.value)}>
                <option value="pc">PC / Tablet</option>
                <option value="movil">Móvil</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LabelStyle}>Turno</label>
              <select className={InputStyle} value={turno} onChange={e => setTurno(Number(e.target.value))}>
                {TURNOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LabelStyle}>Alcance</label>
              <select className={InputStyle} value={alcance} onChange={e => setAlcance(e.target.value)}>
                {ALCANCES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={LabelStyle}>Vence en fase lunar</label>
            <select className={InputStyle} value={venceLuna} onChange={e => setVenceLuna(e.target.value)}>
              {FASES_LUNA.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className={`text-xs px-4 py-2 rounded-xl ${ocupado ? 'bg-red-950/30 border border-red-500/30 text-red-400' : 'bg-green-950/20 border border-green-500/20 text-green-400'}`}>
            {ocupado
              ? `⛔ Slot ocupado — ${CANALES[canalIdx].label} · Turno ${turno} · ${alcance} (${dispositivo === 'pc' ? 'PC' : 'Móvil'}) ya tiene una promo activa.`
              : `✅ Slot libre — ID ${escenarioId} · Turno ${turno} · ${alcance}`}
          </div>

          <button onClick={handleGuardar} disabled={saving || ocupado}
            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
              bg-green-500/20 border border-green-500/40 text-green-300
              hover:bg-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed">
            {saving ? 'Publicando...' : '📡 Publicar PromoECO'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Mis PromoECOs</p>
        {promos.length === 0 && <p className="text-gray-600 text-sm">Sin PromoECOs publicadas aún.</p>}
        {promos.map(p => (
          <div key={p.id} className={`p-5 rounded-2xl border ${p.activo ? 'border-green-500/20 bg-green-950/10' : 'border-white/5 bg-white/3 opacity-40'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-white font-bold text-sm mb-1">{p.pregunta}</p>
                <p className="text-gray-500 text-xs">
                  ID {p.escenario_id} · Turno {p.turno} · {p.alcance} · Vence: {p.vence_luna}
                </p>
                <div className="flex gap-3 mt-2 text-xs text-gray-600">
                  <span>A: {p.opcion_a}</span>
                  <span>B: {p.opcion_b}</span>
                  <span>C: {p.opcion_c}</span>
                </div>
              </div>
              {p.activo && (
                <button onClick={() => handleDesactivar(p.id)}
                  className="text-xs text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl hover:bg-red-950/30 transition-all">
                  Desactivar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}