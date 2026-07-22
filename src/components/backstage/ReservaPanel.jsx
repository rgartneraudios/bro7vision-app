import React, { useState, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import {
  CHANNELS, FASES, TURNOS,
  buildVideoName, cityList, getCodeForCity,
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

const MOON_TURNOS = [
  { value: 1, label: 'MT1 — Primer cuarto' },
  { value: 2, label: 'MT2 — Segundo cuarto' },
  { value: 3, label: 'MT3 — Tercer cuarto' },
  { value: 4, label: 'MT4 — Cuarto cuarto' },
];

const ReservaPanel = ({ slot, coberturaInicial, escenarioId, tarifas, session, profile, onClose, onReserved }) => {
  const [cobertura, setCobertura]   = useState(coberturaInicial || 'SALA_CIUDAD');
  const [ciudad, setCiudad]         = useState('');
  const [moonTurno, setMoonTurno]   = useState(1);
  const [guion, setGuion]           = useState('');
  const [textoLinea1, setTextoLinea1] = useState('');
  const [textoLinea2, setTextoLinea2] = useState('');
  const [logoUrl, setLogoUrl]         = useState('');
  const [promoPregunta,  setPromoPregunta]  = useState('');
  const [promoOpcionA,   setPromoOpcionA]   = useState('');
  const [promoOpcionB,   setPromoOpcionB]   = useState('');
  const [promoOpcionC,   setPromoOpcionC]   = useState('');
  const [promoCorrecta,  setPromoCorrecta]  = useState('a');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(false);

  const isMoon      = slot.canal === 2;
  const needsCiudad = CIUDAD_COBERTURAS.includes(cobertura);

  const precio = useMemo(() => {
    const tarifa = tarifas.find(t => t.cobertura === cobertura);
    if (tarifa) return Number(tarifa.precio);
    return COBERTURAS.find(c => c.id === cobertura)?.precio ?? 0;
  }, [cobertura, tarifas]);

  const slotLabel = isMoon
    ? `${CHANNELS[2]} · ${FASES[slot.fase]}`
    : `${CHANNELS[slot.canal]} · ${TURNOS[slot.turno]}`;

  const handleReservar = async () => {
    if (needsCiudad && !ciudad) { setError('Selecciona una ciudad para esta cobertura.'); return; }
    if (!guion.trim())          { setError('El guión es obligatorio — el Montador lo necesita.'); return; }
    if (!promoPregunta.trim() || !promoOpcionA.trim() || !promoOpcionB.trim() || !promoOpcionC.trim()) {
      setError('La pregunta PromoTrivia y sus 3 opciones son obligatorias.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let cityCode  = null;
      let codigoCsv = '000';

      if (cobertura === 'GIRA_MUNDIAL') {
        codigoCsv = '404';
      } else if (cobertura === 'GIRA_NACIONAL') {
        codigoCsv = '300';
      } else if (needsCiudad && ciudad) {
        cityCode  = getCodeForCity(ciudad);
        codigoCsv = cityCode || '000';
      }

      // For Phase 0: fase_lunar=1 for non-Moon, MT=moonTurno for Moon
      const fase_lunar     = isMoon ? slot.fase : 1;
      const funcion        = isMoon ? moonTurno : slot.turno;
      const nombre_archivo = buildVideoName(slot.canal, fase_lunar, funcion, slot.dispositivo, codigoCsv);

      const today    = new Date();
      const fechaFin = new Date(today.getTime() + 7 * 86_400_000);

      const payload = {
        escenario_id:  escenarioId,
        canal:         slot.canal,
        fase_lunar,
        funcion,
        dispositivo:   slot.dispositivo,
        cobertura,
        ciudad_codigo: cityCode,
        productor_id:  session.user.id,
        guion:         guion.trim(),
        texto_linea1:  textoLinea1.trim() || null,
        texto_linea2:  textoLinea2.trim() || null,
        logo_url:      logoUrl.trim()     || null,
        nombre_archivo,
        estado:        'EN_CASTING',
        precio,
        fecha_inicio:  today.toISOString().split('T')[0],
        fecha_fin:     fechaFin.toISOString().split('T')[0],
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
        escenario_id: String(escenarioId),
        turno:        isMoon ? moonTurno : slot.turno,
        alcance:      cobertura,
        activo:       true,
        vence_luna:   'Luna Llena',
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
                        onChange={() => { setCobertura(c.id); setCiudad(''); }}
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

          {/* Ciudad */}
          {needsCiudad && (
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Ciudad</label>
              <select
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="">Selecciona ciudad...</option>
                {cityList.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Texto Línea 1 */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
              Texto Línea 1
              <span className="ml-1 text-gray-600 normal-case font-normal">(máx. 55 caracteres)</span>
            </label>
            <input
              type="text"
              value={textoLinea1}
              onChange={e => setTextoLinea1(e.target.value)}
              maxLength={55}
              placeholder="¿Asistirás al concierto del Grupo X en Madrid?"
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
            />
            <div className="text-right text-xs text-gray-600 mt-1">{textoLinea1.length}/55</div>
          </div>

          {/* Texto Línea 2 */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
              Texto Línea 2
              <span className="ml-1 text-gray-600 normal-case font-normal">(opcional · máx. 55 caracteres)</span>
            </label>
            <input
              type="text"
              value={textoLinea2}
              onChange={e => setTextoLinea2(e.target.value)}
              maxLength={55}
              placeholder="¡Apresúrate, las entradas se agotan!"
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
            />
            <div className="text-right text-xs text-gray-600 mt-1">{textoLinea2.length}/55</div>
          </div>

          {/* Logo URL */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
              URL del Video, Banner o Logo
              <span className="ml-1 text-gray-600 normal-case font-normal">(Para PC Video/imagen Vertical Para Móvil Video/imagen 1:1 Cuadrado)</span>
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://tudominio.com/logo.png"
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
            />
          </div>

          {/* Guión */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
              Descripción del Anuncio
              <span className="ml-1 text-gray-600 normal-case font-normal">(Instrucciones para el Editor)</span>
            </label>
            <textarea
              value={guion}
              onChange={e => setGuion(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Describe tu anuncio: producto, datos, tono, mensaje clave, referencias visuales, lo que el Editor debe saber..."
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors resize-none placeholder-gray-600"
            />
            <div style={{ fontFamily: "'Inter', sans-serif" }} className="text-right text-xs text-gray-600 mt-1">{guion.length}/500</div>
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
