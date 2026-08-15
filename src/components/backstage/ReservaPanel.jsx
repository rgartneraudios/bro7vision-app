import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  CHANNELS, FASES, TURNOS,
  getMiniCities, getMegaCities, getCodeForCity, COBERTURAS as COB_DATA,
} from '../../data/citycodes';

const COBERTURAS = [
  { id: 'SALA_CIUDAD',        label: 'Sala Ciudad',        precio: 20  },
  { id: 'SALA_GRAN_CIUDAD',   label: 'Sala Gran Ciudad',   precio: 60  },
  { id: 'GIRA_REGIONAL',      label: 'Gira Regional',      precio: 120 },
  { id: 'GIRA_GRAN_REGIONAL', label: 'Gira Gran Regional', precio: 200 },
  { id: 'GIRA_NACIONAL',      label: 'Gira Nacional',      precio: 500 },
  { id: 'GIRA_MUNDIAL',       label: 'Gira Mundial',       precio: 800 },
];

const CIUDAD_COBERTURAS = ['SALA_CIUDAD', 'SALA_GRAN_CIUDAD', 'GIRA_REGIONAL', 'GIRA_GRAN_REGIONAL'];

const LIMITE_CIUDADES = {
  SALA_CIUDAD:        1,
  SALA_GRAN_CIUDAD:   1,
  GIRA_REGIONAL:      3,
  GIRA_GRAN_REGIONAL: 7,
};

const MOON_TURNOS = [
  { value: 1, label: 'MT1 — Primer cuarto' },
  { value: 2, label: 'MT2 — Segundo cuarto' },
  { value: 3, label: 'MT3 — Tercer cuarto' },
  { value: 4, label: 'MT4 — Cuarto cuarto' },
];

const CANAL_STRING = {
  1:'mercurio', 2:'luna', 3:'venus', 4:'tierra',
  5:'jupiter',  6:'marte', 7:'saturno', 8:'urano', 9:'neptuno'
};

const ReservaPanel = ({ slot, coberturaInicial, escenarioId, tarifas, session, profile, onClose, onReserved }) => {
  const [cobertura, setCobertura]         = useState(coberturaInicial || 'SALA_CIUDAD');
  const [ciudades, setCiudades]           = useState([]);
  const [moonTurno, setMoonTurno]         = useState(1);
  const [videoLink, setVideoLink]         = useState('');
  const [faseLunarId,     setFaseLunarId]     = useState(null);
  const [faseLunarNombre, setFaseLunarNombre] = useState('LUNA_NUEVA');
  const [promoPregunta,  setPromoPregunta]  = useState('');
  const [promoOpcionA,   setPromoOpcionA]   = useState('');
  const [promoOpcionB,   setPromoOpcionB]   = useState('');
  const [promoOpcionC,   setPromoOpcionC]   = useState('');
  const [promoCorrecta,  setPromoCorrecta]  = useState('a');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(false);

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

  const isMoon      = slot.canal === 2;
  const needsCiudad = CIUDAD_COBERTURAS.includes(cobertura);

  const toggleCiudad = (key) => {
    setCiudades(prev => {
      if (prev.includes(key)) return prev.filter(c => c !== key);
      const limite = LIMITE_CIUDADES[cobertura] ?? 1;
      if (prev.length >= limite) return prev;
      return [...prev, key];
    });
  };

  const precio = useMemo(() => {
    const tarifa = tarifas.find(t => t.cobertura === cobertura);
    if (tarifa) return Number(tarifa.precio);
    return COBERTURAS.find(c => c.id === cobertura)?.precio ?? 0;
  }, [cobertura, tarifas]);

  const slotLabel = isMoon
    ? `${CHANNELS[2]} · ${FASES[slot.fase]}`
    : `${CHANNELS[slot.canal]} · ${TURNOS[slot.turno]}`;

  const handleReservar = async () => {
    if (needsCiudad && ciudades.length === 0) { setError('Selecciona al menos una ciudad para esta cobertura.'); return; }
    if (!promoPregunta.trim() || !promoOpcionA.trim() || !promoOpcionB.trim() || !promoOpcionC.trim()) {
      setError('La pregunta PromoTrivia y sus 3 opciones son obligatorias.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const funcion        = isMoon ? moonTurno : slot.turno;
      const ciudadStr      = ciudades.length > 0
        ? ciudades.map(k => getCodeForCity(k)).filter(Boolean).join('-')
        : '000';
      const nombre_archivo = `${slot.canal}_${funcion}_${slot.dispositivo}_${ciudadStr}.mp4`;

      const today    = new Date();
      const fechaFin = new Date(today.getTime() + 7 * 86_400_000);

      const payload = {
        canal:          slot.canal,
        funcion,
        dispositivo:    slot.dispositivo,
        formato:        slot.dispositivo === 0 ? 'REALITY_PC' : 'REALITY_MOVIL',
        fase_lunar_id:  faseLunarId,
        cobertura,
        ciudad_codigos: ciudades.length > 0
          ? ciudades.map(k => getCodeForCity(k)).filter(Boolean)
          : null,
        productor_id:   session.user.id,
        guion:          videoLink.trim() || null,
        nombre_archivo,
        estado:         'EN_CASTING',
        precio,
        fecha_inicio:   today.toISOString().split('T')[0],
        fecha_fin:      fechaFin.toISOString().split('T')[0],
      };

      const { error: err } = await supabase.from('bs_butacas').insert([payload]);
      if (err) throw err;

      const opcionConStar = (texto, clave) =>
        clave === promoCorrecta ? `${texto} (*)` : texto;

      const { error: promoErr } = await supabase.from('promo_trivia').insert([{
        comercio_id:  session.user.id,
        pregunta:     promoPregunta.trim(),
        opcion_a:     opcionConStar(promoOpcionA.trim(), 'a'),
        opcion_b:     opcionConStar(promoOpcionB.trim(), 'b'),
        opcion_c:     opcionConStar(promoOpcionC.trim(), 'c'),
        escenario_id: CANAL_STRING[slot.canal],
        turno:        isMoon ? moonTurno : slot.turno,
        alcance:      cobertura,
        activo:       true,
        vence_luna:   faseLunarNombre,
        lunas_bonus:  20,
      }]);
      if (promoErr) throw promoErr;

      setSuccess(true);
      setTimeout(() => onReserved(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] bg-zinc-950 border-l border-white/10 flex flex-col shadow-2xl font-mono">

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/5 bg-black/30 shrink-0">
          <div>
            <h3 style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 800 }} className="text-base font-black text-white tracking-tight">RESERVAR BUTACA</h3>
            <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-400 mt-1">{slotLabel}</p>
            <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-600">
              {slot.dispositivo === 0 ? 'PC' : 'Móvil'} · Escenario #{slot.canal}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none mt-0.5 transition-colors">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Productor */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Productor</label>
            <div style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-white/80 bg-white/5 border border-white/8 rounded px-3 py-2.5">
              {profile?.razon_social || session.user.email}
            </div>
          </div>

          {/* Moon Turno — solo canal 2 */}
          {isMoon && (
            <div>
              <label className="block text-[9px] text-gray-400 uppercase tracking-widest mb-1.5 font-bold">
                Moon Turno <span className="normal-case text-gray-600">(slot dentro de la fase)</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {MOON_TURNOS.map(mt => (
                  <label
                    key={mt.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-all ${
                      moonTurno === mt.value
                        ? 'border-purple-500/60 bg-purple-950/30 text-white'
                        : 'border-white/5 text-gray-500 hover:border-white/15 hover:text-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="moonTurno"
                      value={mt.value}
                      checked={moonTurno === mt.value}
                      onChange={() => setMoonTurno(mt.value)}
                      className="accent-purple-500"
                    />
                    <span className="text-[10px]">{mt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Cobertura */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Cobertura</label>
            <div className="space-y-1.5">
              {COBERTURAS.map(c => {
                const tarifaPrecio = tarifas.find(t => t.cobertura === c.id)?.precio ?? c.precio;
                return (
                  <label
                    key={c.id}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className={`flex items-center justify-between px-4 py-2.5 rounded border cursor-pointer transition-all ${
                      cobertura === c.id
                        ? 'border-purple-500/60 bg-purple-950/30 text-white'
                        : 'border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cobertura"
                        value={c.id}
                        checked={cobertura === c.id}
                        onChange={() => { setCobertura(c.id); setCiudades([]); }}
                        className="accent-purple-500"
                      />
                      <span className="text-sm font-medium">{c.label}</span>
                    </div>
                    <span className="text-sm font-bold text-purple-400">{tarifaPrecio}€</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Ciudades */}
          {needsCiudad && (
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
                Ciudades
                <span className="ml-2 text-purple-400 font-mono">
                  {ciudades.length}/{LIMITE_CIUDADES[cobertura]}
                </span>
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {(cobertura === 'SALA_GRAN_CIUDAD' ? getMegaCities() : getMiniCities()).map(c => {
                  const seleccionada = ciudades.includes(c.key);
                  const lleno = ciudades.length >= (LIMITE_CIUDADES[cobertura] ?? 1);
                  const bloqueada = !seleccionada && lleno;
                  return (
                    <label
                      key={c.key}
                      className={`flex items-center gap-3 px-3 py-2 rounded border cursor-pointer transition-all
                        ${seleccionada
                          ? 'border-purple-500/60 bg-purple-950/30 text-white'
                          : bloqueada
                            ? 'border-white/5 text-gray-600 opacity-30 cursor-not-allowed'
                            : 'border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={seleccionada}
                        disabled={bloqueada}
                        onChange={() => toggleCiudad(c.key)}
                        className="accent-purple-500"
                      />
                      <span className="text-sm">{c.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Link del Video del Anunciante */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
              Link del Video
              <span className="ml-1 text-gray-600 normal-case font-normal">
                (PC: vertical 9:16 · Móvil: horizontal 16:9)
              </span>
            </label>
            <input
              type="url"
              value={videoLink}
              onChange={e => setVideoLink(e.target.value)}
              placeholder="https://tudominio.com/mi-video.mp4"
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
            />
          </div>

          {/* Separador PromoECO */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700 }} className="text-xs text-cyan-400 uppercase tracking-widest">📡 PromoTrivia</span>
              <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-[10px] text-gray-600">· incluida en el pack · marcada como PUBLICIDAD</span>
            </div>

            {/* Pregunta */}
            <div className="mb-3">
              <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Pregunta</label>
              <input
                type="text"
                value={promoPregunta}
                onChange={e => setPromoPregunta(e.target.value)}
                maxLength={120}
                placeholder="¿Dónde está la hamburguesería de Paco?"
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-cyan-500 focus:outline-none transition-colors placeholder-gray-600"
              />
            </div>

            {/* Opciones */}
            {[
              { clave: 'a', val: promoOpcionA, set: setPromoOpcionA, placeholder: 'Opción A' },
              { clave: 'b', val: promoOpcionB, set: setPromoOpcionB, placeholder: 'Opción B' },
              { clave: 'c', val: promoOpcionC, set: setPromoOpcionC, placeholder: 'Opción C' },
            ].map(({ clave, val, set, placeholder }) => (
              <div key={clave} className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setPromoCorrecta(clave)}
                  className={`w-7 h-7 rounded-full font-black text-xs flex-shrink-0 transition-all border ${
                    promoCorrecta === clave
                      ? 'bg-cyan-500 border-cyan-400 text-black'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-cyan-500/40'
                  }`}
                >
                  {clave.toUpperCase()}
                </button>
                <input
                  type="text"
                  value={val}
                  onChange={e => set(e.target.value)}
                  maxLength={80}
                  placeholder={`${placeholder}${promoCorrecta === clave ? ' ← correcta' : ''}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="flex-1 bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2 rounded focus:border-cyan-500 focus:outline-none transition-colors placeholder-gray-600"
                />
              </div>
            ))}
            <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-[10px] text-gray-600 mt-1">
              Toca la letra para marcar la respuesta correcta. El sistema añade (*) automáticamente.
            </p>
          </div>

          {error && (
            <div style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
              {error}
            </div>
          )}

          {success && (
            <div style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded px-3 py-2">
              ✓ Butaca reservada con estado EN_CASTING. El Estudio asignará un Montador.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-black/20 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }} className="text-sm text-gray-400 uppercase tracking-widest">Precio</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }} className="text-3xl text-white">{precio}€</span>
          </div>
          <button
            onClick={handleReservar}
            disabled={loading || success}
            style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700 }}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-sm font-bold uppercase tracking-widest rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(168,85,247,0.25)]"
          >
            {loading ? 'PROCESANDO...' : success ? 'RESERVADO ✓' : 'RESERVAR BUTACA'}
          </button>
          <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-600 text-center mt-2 leading-relaxed">
            Estado inicial: EN_CASTING · El Estudio asigna Montador disponible
          </p>
        </div>
      </div>
    </>
  );
};

export default ReservaPanel;
