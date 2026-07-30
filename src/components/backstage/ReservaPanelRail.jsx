import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { cityList } from '../../data/citycodes';

const SYNE = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const COBERTURAS = [
  { id: 'SALA_CIUDAD',        label: 'Sala Ciudad',        precio: 20  },
  { id: 'SALA_GRAN_CIUDAD',   label: 'Sala Gran Ciudad',   precio: 60  },
  { id: 'GIRA_REGIONAL',      label: 'Gira Regional',      precio: 120 },
  { id: 'GIRA_GRAN_REGIONAL', label: 'Gira Gran Regional', precio: 200 },
  { id: 'GIRA_NACIONAL',      label: 'Gira Nacional',      precio: 500 },
  { id: 'GIRA_MUNDIAL',       label: 'Gira Mundial',       precio: 800 },
];

const CIUDAD_COBERTURAS = ['SALA_CIUDAD', 'SALA_GRAN_CIUDAD', 'GIRA_REGIONAL', 'GIRA_GRAN_REGIONAL'];

const ReservaPanelRail = ({ slot, session, onClose, onReserved, faseLunarActiva: propFase }) => {
  const [cobertura, setCobertura]       = useState('SALA_CIUDAD');
  const [ciudad, setCiudad]             = useState('');
  const [bannerUrl, setBannerUrl]       = useState('');
  const [pregunta, setPregunta]         = useState('');
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(true);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(false);
  const [descuento, setDescuento]       = useState(0);

  useEffect(() => {
    const fetchDescuento = async () => {
      const { data } = await supabase
        .from('b_advertiser_profiles')
        .select('descuento_publicitario')
        .eq('id', session.user.id)
        .maybeSingle();
      setDescuento(data?.descuento_publicitario ?? 0);
    };
    fetchDescuento();
  }, [session]);

  const precioFinal = (precio) =>
    descuento > 0
      ? Math.round(precio * (1 - descuento / 100) * 100) / 100
      : precio;

  const needsCiudad = CIUDAD_COBERTURAS.includes(cobertura);
  const faseLunarActiva = propFase || 'Luna Llena';

  const precio = useMemo(() => {
    return COBERTURAS.find(c => c.id === cobertura)?.precio ?? 0;
  }, [cobertura]);

  const sectorLabel = slot.sector === 'CANJES' ? 'CANJES DE LUNAS' : 'SHOP AMIGOS';

  const handleReservar = async () => {
    if (needsCiudad && !ciudad) { setError('Selecciona una ciudad para esta cobertura.'); return; }
    if (!pregunta.trim())       { setError('La pregunta PromoTrivia es obligatoria.'); return; }

    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase.from('trivia_rail').insert([{
        sector:              slot.sector,
        slot_numero:         slot.slot_numero,
        es_brovision:        false,
        pregunta:            pregunta.trim(),
        respuesta_correcta:  respuestaCorrecta,
        lunas_bonus:         20,
        banner_url:          bannerUrl.trim() || null,
        comercio_id:         session.user.id,
        fase_lunar_activa:   faseLunarActiva,
        cobertura:           cobertura,
        ciudad_codigo:       needsCiudad ? ciudad : null,
        activo:              true,
      }]);
      if (err) throw err;

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
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] bg-zinc-950 border-l border-white/10 flex flex-col shadow-2xl font-mono">

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/5 bg-black/30 shrink-0">
          <div>
            <h3 style={{ fontFamily: SYNE, fontWeight: 800 }} className="text-base font-black text-white tracking-tight">RESERVAR SLOT RAIL</h3>
            <p style={{ fontFamily: INTER }} className="text-sm text-gray-400 mt-1">Slot #{slot.slot_numero} · {sectorLabel}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none mt-0.5 transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Sector */}
          <div>
            <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Sector</label>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: INTER }} className="text-sm text-white/80 bg-white/5 border border-white/10 rounded px-3 py-2.5">
                {sectorLabel}
              </span>
              <span className={`text-[10px] uppercase tracking-widest border px-2 py-1 rounded ${
                slot.sector === 'CANJES' ? 'text-cyan-400 border-cyan-500/40' : 'text-fuchsia-400 border-fuchsia-500/40'
              }`}>
                {slot.sector}
              </span>
            </div>
          </div>

          {/* Slot */}
          <div>
            <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Slot</label>
            <div style={{ fontFamily: INTER }} className="text-sm text-white/80 bg-white/5 border border-white/10 rounded px-3 py-2.5">
              #{slot.slot_numero}
            </div>
          </div>

          {/* Cobertura */}
          <div>
            <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Cobertura</label>
            <div className="space-y-1.5">
              {COBERTURAS.map(c => (
                <label
                  key={c.id}
                  style={{ fontFamily: INTER }}
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
                  <span className="text-sm font-bold text-purple-400">{c.precio}€</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ciudad */}
          {needsCiudad && (
            <div>
              <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Ciudad</label>
              <select
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                style={{ fontFamily: INTER }}
                className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="">Selecciona ciudad...</option>
                {cityList.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* URL Banner */}
          <div>
            <label style={{ fontFamily: INTER, fontWeight: 600 }}
              className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
              URL Banner
              <span className="ml-1 text-gray-600 normal-case font-normal">(imagen vertical 450 x 1080 px)</span>
            </label>
            <input
              type="url"
              value={bannerUrl}
              onChange={e => setBannerUrl(e.target.value)}
              placeholder="https://tudominio.com/banner.png"
              style={{ fontFamily: INTER }}
              className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
            />
          </div>

          {/* Pregunta PromoTrivia */}
          <div>
            <label style={{ fontFamily: INTER, fontWeight: 600 }}
              className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
              📡 Pregunta PromoTrivia
            </label>
            <input
              type="text"
              value={pregunta}
              onChange={e => setPregunta(e.target.value)}
              maxLength={120}
              placeholder="¿Cuál es la especialidad de la casa?"
              style={{ fontFamily: INTER }}
              className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-cyan-500 focus:outline-none transition-colors placeholder-gray-600"
            />
          </div>

          {/* Respuesta correcta — toggle VERDADERO / FALSO */}
          <div>
            <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Respuesta correcta</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRespuestaCorrecta(true)}
                className={`flex-1 py-2.5 rounded border text-sm font-bold uppercase tracking-widest transition-all ${
                  respuestaCorrecta === true
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                    : 'bg-zinc-900 border-white/10 text-gray-500 hover:border-white/25'
                }`}
              >
                VERDADERO
              </button>
              <button
                type="button"
                onClick={() => setRespuestaCorrecta(false)}
                className={`flex-1 py-2.5 rounded border text-sm font-bold uppercase tracking-widest transition-all ${
                  respuestaCorrecta === false
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-400'
                    : 'bg-zinc-900 border-white/10 text-gray-500 hover:border-white/25'
                }`}
              >
                FALSO
              </button>
            </div>
          </div>

          {/* +20 Lunas badge */}
          <div className="flex items-center gap-3 bg-zinc-900/50 border border-amber-500/20 rounded px-4 py-3">
            <span className="text-lg">🌙</span>
            <div>
              <p style={{ fontFamily: SYNE, fontWeight: 700 }} className="text-sm text-amber-400 uppercase tracking-widest">+20 Lunas</p>
              <p style={{ fontFamily: INTER }} className="text-xs text-gray-600 mt-0.5">
                Bonus por respuesta correcta en PromoTrivia
              </p>
            </div>
          </div>

          {error && (
            <div style={{ fontFamily: INTER }} className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
              {error}
            </div>
          )}

          {success && (
            <div style={{ fontFamily: INTER }} className="text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded px-3 py-2">
              ✓ Slot Rail reservado correctamente.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-black/20 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: INTER, fontWeight: 500 }} className="text-sm text-gray-400 uppercase tracking-widest">Precio</span>
            <span style={{ fontFamily: INTER, fontWeight: 700 }} className="text-3xl text-white">{precioFinal(precio)}€</span>
          </div>
          {descuento > 0 && (
            <>
              <div style={{ fontFamily: INTER }}
                   className="flex items-center justify-between text-xs mb-2 px-1">
                <span className="text-gray-500">Precio base</span>
                <span className="text-gray-500 line-through">{precio}€</span>
              </div>
              <div style={{ fontFamily: SYNE, fontWeight: 700 }}
                   className="flex items-center justify-between text-xs mb-3 px-1">
                <span className="text-emerald-400 uppercase tracking-widest">
                  ✦ Descuento activo · -{descuento}%
                </span>
                <span className="text-emerald-400">{precioFinal(precio)}€</span>
              </div>
            </>
          )}
          <button
            onClick={handleReservar}
            disabled={loading || success}
            style={{ fontFamily: SYNE, fontWeight: 700 }}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-sm font-bold uppercase tracking-widest rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(168,85,247,0.25)]"
          >
            {loading ? 'PROCESANDO...' : success ? 'RESERVADO ✓' : 'RESERVAR SLOT'}
          </button>
          <p style={{ fontFamily: INTER }} className="text-xs text-gray-600 text-center mt-2 leading-relaxed">
            FASE 0 · Simulación
          </p>
        </div>
      </div>
    </>
  );
};

export default ReservaPanelRail;