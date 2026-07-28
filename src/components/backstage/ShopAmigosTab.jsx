import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getMoonSuffix } from '../../utils/moonUtils';
import { getMiniCities, getMegaCities, getCodeForCity } from '../../data/citycodes';

const LIMITE_CIUDADES = { CERCANIAS: 3 };

export default function ShopAmigosTab({ session, profile }) {
  const [slotActual, setSlotActual] = useState(undefined); // undefined=cargando
  const [form, setForm] = useState({
    nombre:      '',
    url_destino: '',
    imagen_url:  '',
    alcance:     'CERCANIAS',
    descripcion: '',
    ciudades:    [],
  });
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState(null);
  const [success, setSuccess]  = useState(false);

  const faseLunar = parseInt(getMoonSuffix(), 10);

  // Cargar slot existente
  useEffect(() => {
    if (session === undefined) return;
    if (!session) { setSlotActual(null); return; }
    const load = async () => {
      const { data } = await supabase
        .from('shop_amigos_slots')
        .select('*')
        .eq('productor_id', session.user.id)
        .eq('fase_lunar_activa', faseLunar)
        .maybeSingle();
      setSlotActual(data || null);
    };
    load();
  }, [session]);

  const toggleCiudad = (key) => {
    setForm(prev => {
      const ya = prev.ciudades.includes(key);
      if (ya) return { ...prev, ciudades: prev.ciudades.filter(c => c !== key) };
      if (prev.ciudades.length >= (LIMITE_CIUDADES[prev.alcance] ?? 1)) return prev;
      return { ...prev, ciudades: [...prev.ciudades, key] };
    });
  };

  const handleEnviar = async () => {
    if (!form.nombre.trim() || !form.url_destino.trim() || !form.imagen_url.trim()) {
      setError('Nombre, URL destino e imagen son obligatorios.'); return;
    }
    if (form.alcance === 'CERCANIAS' && form.ciudades.length === 0) {
      setError('Selecciona al menos una ciudad para cobertura Cercanías.'); return;
    }
    setLoading(true); setError(null);
    try {
      const payload = {
        productor_id:     session.user.id,
        comercio_nombre:  form.nombre.trim(),
        url_destino:      form.url_destino.trim(),
        imagen_url:       form.imagen_url.trim(),
        alcance:          form.alcance,
        descripcion:      form.descripcion.trim() || null,
        ciudad_codigos:   form.alcance === 'CERCANIAS'
                            ? form.ciudades.map(k => getCodeForCity(k)).filter(Boolean)
                            : null,
        estado:           'EN_REVISION',
        activo:           false,
        fase_lunar_activa: faseLunar,
      };
      const { data, error: err } = await supabase
        .from('shop_amigos_slots')
        .insert([payload])
        .select()
        .single();
      if (err) throw err;
      setSuccess(true);
      setSlotActual(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargando
  if (slotActual === undefined) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-gray-500 text-sm font-mono animate-pulse">CARGANDO...</span>
      </div>
    );
  }

  // ESTADO 2 — EN_REVISION
  if (slotActual?.estado === 'EN_REVISION') {
    return (
      <div className="p-6 space-y-4">
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-5 space-y-3">
          <p className="text-yellow-400 text-xs font-black uppercase tracking-widest">
            ⏳ Solicitud en revisión
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Estamos revisando tu solicitud. En cuanto sea aprobada tu slot quedará activo en la fase lunar actual.
          </p>
          <div className="border-t border-white/5 pt-3 space-y-1">
            <p className="text-white/60 text-xs font-mono">{slotActual.comercio_nombre}</p>
            <p className="text-white/40 text-xs font-mono truncate">{slotActual.url_destino}</p>
            <p className="text-white/40 text-xs font-mono">
              Alcance: {slotActual.alcance} · Fase lunar: {faseLunar}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ESTADO 3 — APROBADO
  if (slotActual?.estado === 'APROBADO') {
    return (
      <div className="p-6 space-y-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-4">
          <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">
            ✓ Slot activo
          </p>
          {slotActual.imagen_url && (
            <img
              src={slotActual.imagen_url}
              alt={slotActual.comercio_nombre}
              className="w-full h-40 object-cover rounded-lg border border-white/10"
            />
          )}
          <div className="space-y-1">
            <p className="text-white font-bold text-sm">{slotActual.comercio_nombre}</p>
            <p className="text-white/40 text-xs font-mono truncate">{slotActual.url_destino}</p>
            <p className="text-white/40 text-xs font-mono">
              Alcance: {slotActual.alcance} · Fase lunar: {faseLunar}
            </p>
            {slotActual.descripcion && (
              <p className="text-gray-400 text-xs pt-1">{slotActual.descripcion}</p>
            )}
          </div>
        </div>
        <p className="text-gray-600 text-xs text-center leading-relaxed">
          Para modificar tu slot solicita uno nuevo en la próxima fase lunar.
        </p>
      </div>
    );
  }

  // ESTADO 1 — SIN SLOT, formulario
  return (
    <div className="p-6 space-y-5">
      <div>
        <p className="text-white/80 text-sm leading-relaxed mb-1">
          Shop Amigos es una selección curada de comercios y proyectos únicos.
        </p>
        <p className="text-gray-500 text-xs">
          Envía tu solicitud. El equipo Bro7Vision la revisará antes de publicarla.
        </p>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">
          Nombre del comercio
        </label>
        <input
          type="text"
          value={form.nombre}
          onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
          placeholder="Tu tienda, estudio, proyecto..."
          className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
        />
      </div>

      {/* URL destino */}
      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">
          URL de tu web
        </label>
        <input
          type="url"
          value={form.url_destino}
          onChange={e => setForm(p => ({ ...p, url_destino: e.target.value }))}
          placeholder="https://tutienda.com"
          className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
        />
      </div>

      {/* URL imagen */}
      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">
          URL del banner / imagen
        </label>
        <input
          type="url"
          value={form.imagen_url}
          onChange={e => setForm(p => ({ ...p, imagen_url: e.target.value }))}
          placeholder="https://tutienda.com/banner.jpg"
          className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
        />
      </div>

      {/* Alcance */}
      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">
          Alcance
        </label>
        <div className="space-y-1.5">
          {['CERCANIAS', 'NACIONAL', 'INTERNACIONAL'].map(a => (
            <label key={a}
              className={`flex items-center gap-3 px-4 py-2.5 rounded border cursor-pointer transition-all
                ${form.alcance === a
                  ? 'border-purple-500/60 bg-purple-950/30 text-white'
                  : 'border-white/5 text-gray-400 hover:border-white/15'}`}
            >
              <input
                type="radio"
                name="alcance"
                value={a}
                checked={form.alcance === a}
                onChange={() => setForm(p => ({ ...p, alcance: a, ciudades: [] }))}
                className="accent-purple-500"
              />
              <span className="text-sm font-medium">
                {a === 'CERCANIAS' ? 'Cercanías' : a === 'NACIONAL' ? 'Nacional' : 'Internacional'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Ciudades — solo CERCANIAS */}
      {form.alcance === 'CERCANIAS' && (
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">
            Ciudades
            <span className="ml-2 text-purple-400 font-mono">
              {form.ciudades.length}/3
            </span>
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {getMiniCities().map(c => {
              const sel = form.ciudades.includes(c.key);
              const bloq = !sel && form.ciudades.length >= 3;
              return (
                <label key={c.key}
                  className={`flex items-center gap-3 px-3 py-2 rounded border cursor-pointer transition-all
                    ${sel
                      ? 'border-purple-500/60 bg-purple-950/30 text-white'
                      : bloq
                        ? 'border-white/5 text-gray-600 opacity-30 cursor-not-allowed'
                        : 'border-white/5 text-gray-400 hover:border-white/15'}`}
                >
                  <input
                    type="checkbox"
                    checked={sel}
                    disabled={bloq}
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

      {/* Descripción */}
      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">
          Descripción corta <span className="text-gray-600 normal-case font-normal">(opcional)</span>
        </label>
        <textarea
          value={form.descripcion}
          onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
          maxLength={160}
          rows={2}
          placeholder="Una línea que describa tu proyecto..."
          className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600 resize-none"
        />
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
          {error}
        </div>
      )}

      <button
        onClick={handleEnviar}
        disabled={loading || success}
        className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold uppercase tracking-widest rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(168,85,247,0.25)]"
      >
        {loading ? 'ENVIANDO...' : success ? 'SOLICITUD ENVIADA ✓' : 'ENVIAR SOLICITUD'}
      </button>

      <p className="text-xs text-gray-600 text-center leading-relaxed">
        Un slot por fase lunar · El equipo revisa en 24–48h
      </p>
    </div>
  );
}