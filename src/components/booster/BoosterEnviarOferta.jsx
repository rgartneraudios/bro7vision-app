import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const InputStyle = "w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all";
const LabelStyle = "text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 block";
const CardStyle = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

const initForm = {
  codigo: '',
  nombre: '',
  direccion: '',
  telefono: '',
  mensaje: '',
  oferta: '',
  banner_url: '',
  link: '',
};

const BoosterEnviarOferta = ({ userId }) => {
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.codigo.trim()) return setError('El código del deseo es obligatorio.');
    if (!form.nombre.trim()) return setError('Tu nombre o empresa es obligatorio.');
    if (!form.mensaje.trim()) return setError('El mensaje es obligatorio.');
    if (!form.oferta.trim()) return setError('La oferta es obligatoria.');

    setSaving(true);
    try {
      const { data: deseo } = await supabase
        .from('brodeseos')
        .select('id')
        .eq('id', form.codigo.trim())
        .eq('activo', true)
        .maybeSingle();

      if (!deseo) {
        setError('Código no encontrado o deseo inactivo');
        setSaving(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('brodeseos_ofertas')
        .insert({
          deseo_id: deseo.id,
          user_id_empresa: userId,
          nombre_empresa: form.nombre.trim(),
          direccion: form.direccion.trim() || null,
          telefono: form.telefono.trim() || null,
          mensaje: form.mensaje.trim(),
          oferta_descripcion: form.oferta.trim(),
          banner_url: form.banner_url.trim() || null,
          link: form.link.trim() || null,
        });

      if (insertError) throw insertError;

      alert('✅ Oferta enviada. El usuario la verá en su Booster.');
      setForm(initForm);
    } catch (err) {
      console.error('Error enviando oferta:', err);
      setError('Error al enviar la oferta: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">📨</span>
        <div>
          <h3 className="text-xl font-black text-fuchsia-400 tracking-widest uppercase">Enviar Oferta</h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">Responde al deseo de un ciudadano</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={CardStyle}>
        <div className="space-y-5">
          <div>
            <label className={LabelStyle}>Código del deseo *</label>
            <input type="text" value={form.codigo} onChange={set('codigo')}
              placeholder="Ej: BD-a1b2c3"
              className={InputStyle} />
          </div>

          <div>
            <label className={LabelStyle}>Tu nombre / empresa *</label>
            <input type="text" value={form.nombre} onChange={set('nombre')}
              placeholder="Ej: Panadería La Esquina"
              className={InputStyle} />
          </div>

          <div>
            <label className={LabelStyle}>Dirección</label>
            <input type="text" value={form.direccion} onChange={set('direccion')}
              placeholder="Calle, número, ciudad..."
              className={InputStyle} />
          </div>

          <div>
            <label className={LabelStyle}>Teléfono</label>
            <input type="text" value={form.telefono} onChange={set('telefono')}
              placeholder="+34 600 000 000"
              className={InputStyle} />
          </div>

          <div>
            <label className={LabelStyle}>Mensaje *</label>
            <div className="relative">
              <textarea value={form.mensaje} onChange={set('mensaje')}
                maxLength={280}
                placeholder="Escribe un mensaje para el ciudadano..."
                rows={3}
                className={`${InputStyle} resize-none pr-16`} />
              <span className="absolute bottom-3 right-3 text-[10px] text-gray-500 font-mono">
                {form.mensaje.length}/280
              </span>
            </div>
          </div>

          <div>
            <label className={LabelStyle}>Tu oferta *</label>
            <textarea value={form.oferta} onChange={set('oferta')}
              placeholder="Descuento, condiciones especiales, etc."
              rows={3}
              className={`${InputStyle} resize-none`} />
          </div>

          <div>
            <label className={LabelStyle}>Banner URL</label>
            <input type="text" value={form.banner_url} onChange={set('banner_url')}
              placeholder="https://media.bro7vision.com/..."
              className={InputStyle} />
          </div>

          <div>
            <label className={LabelStyle}>Link web</label>
            <input type="text" value={form.link} onChange={set('link')}
              placeholder="https://tutienda.com/oferta..."
              className={InputStyle} />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400 font-medium">⚠ {error}</p>
        )}

        <div className="flex justify-end mt-6">
          <button type="submit" disabled={saving}
            className="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-full border border-fuchsia-500/30 transition-all disabled:opacity-50">
            {saving ? '⏳ ENVIANDO...' : '📨 ENVIAR OFERTA'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoosterEnviarOferta;