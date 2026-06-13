import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const InputStyle = "w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all";
const LabelStyle = "text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 block";
const CardStyle  = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

const TIPO_OPTS = [
  { value: 'original', label: '\u2726 Original' },
  { value: 'ia',       label: '\uD83E\uDD16 Hecho con IA' },
  { value: 'publicidad', label: '\uD83D\uDCE2 Publicidad' },
];

const BoosterEnlaces = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const [data, setData] = useState({
  video_v_url: '', video_v_titulo: '', video_v_descripcion: '', video_v_tipo: 'original',
  video_h_url: '', video_h_titulo: '', video_h_descripcion: '', video_h_tipo: 'original',
  audio_url: '', audio_titulo: '', audio_descripcion: '', audio_tipo: 'original',
  audio_video_url: '',
  brotwit: '',
  holoprisma_1: '', holoprisma_2: '', holoprisma_3: '', holoprisma_4: '',
  editorial_title: '', editorial_img_url: '', editorial_text: '',
});

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: row } = await supabase
          .from('mini_proyeccion')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (row) {
          setData(prev => ({ ...prev, ...row }));
        }
      } catch (e) {
        console.error('Error loading mini_proyeccion:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const set = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const TipoSelect = ({ field, label }) => (
    <div className="space-y-1">
      <label className={LabelStyle}>{label}</label>
      <div className="flex gap-2 flex-wrap">
        {TIPO_OPTS.map(opt => (
          <button key={opt.value}
            onClick={() => set(field, opt.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all
              ${data[field] === opt.value
                ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300'
                : 'bg-white/5 border-white/10 text-gray-500'}`}>
            {data[field] === opt.value ? '\u2713 ' : ''}{opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const Field = ({ field, label, placeholder, type = 'text' }) => (
    <div className="space-y-1">
      <label className={LabelStyle}>{label}</label>
      {type === 'textarea' ? (
        <textarea value={data[field]}
          onChange={e => set(field, e.target.value)}
          placeholder={placeholder}
          rows={6}
          className={`${InputStyle} resize-none`} />
      ) : (
        <input type="text" value={data[field]}
          onChange={e => set(field, e.target.value)}
          placeholder={placeholder}
          className={InputStyle} />
      )}
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { error } = await supabase
        .from('mini_proyeccion')
        .upsert({ user_id: user.id, ...data }, { onConflict: 'user_id' });

      if (error) throw error;
      alert('\u2728 \u00a1Proyecci\u00f3n actualizada!');
    } catch (e) {
      alert('Error al guardar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">Cargando proyecci\u00f3n...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-4xl">{'\uD83D\uDD17'}</span>
        <div>
          <h3 className="text-xl font-black text-fuchsia-400 tracking-widest uppercase">Enlaces de Proyección</h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">Contenido multimedia para tu canal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ── COLUMNA IZQUIERDA ── */}
        <div className="space-y-6">

          {/* VIDEOS */}
          <div className={CardStyle}>
            <p className="text-xs font-bold text-fuchsia-400 mb-4 flex items-center gap-2 uppercase tracking-widest">{'\u2500\u2500'} VIDEOS {'\u2500\u2500'}</p>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vertical (9:16)</p>
              <Field field="video_v_url" label="URL del video vertical" placeholder="https://media.bro7vision.com/..." />
              <Field field="video_v_titulo" label="Título del video vertical" />
              <Field field="video_v_descripcion" label="Descripción del video vertical" />
              <TipoSelect field="video_v_tipo" label="Tipo de video vertical" />
            </div>

            <div className="border-t border-white/10 my-6" />

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Horizontal (16:9)</p>
              <Field field="video_h_url" label="URL del video horizontal" placeholder="https://media.bro7vision.com/..." />
              <Field field="video_h_titulo" label="Título del video horizontal" />
              <Field field="video_h_descripcion" label="Descripción del video horizontal" />
              <TipoSelect field="video_h_tipo" label="Tipo de video horizontal" />
            </div>
          </div>

          {/* AUDIO */}
          <div className={CardStyle}>
            <p className="text-xs font-bold text-fuchsia-400 mb-4 flex items-center gap-2 uppercase tracking-widest">{'\u2500\u2500'} AUDIO {'\u2500\u2500'}</p>
            <div className="space-y-4">
              <Field field="audio_url" label="URL del archivo de audio" placeholder="https://media.bro7vision.com/..." />
              <Field field="audio_titulo" label="Título del audio" />
              <Field field="audio_descripcion" label="Descripción del audio" />
              <TipoSelect field="audio_tipo" label="Tipo de audio" />
              <Field field="audio_video_url" label="Audio modo Móvil" placeholder="URL para reproducción en Móvil" />
            </div>
          </div>
        </div>

        {/* ── COLUMNA DERECHA ── */}
        <div className="space-y-6">

          {/* IDENTIDAD VISUAL */}
          <div className={CardStyle}>
            <p className="text-xs font-bold text-fuchsia-400 mb-4 flex items-center gap-2 uppercase tracking-widest">{'\u2500\u2500'} BROTWIT {'\u2500\u2500'}</p>
            <div className="space-y-4">
	<Field field="brotwit" label="Mensaje a tu comunidad" placeholder="Escribe un mensaje para tus seguidores..." />
            </div>

            <div className="border-t border-white/10 my-6" />
            <p className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest mb-3">Holoprisma</p>
            <div className="space-y-4">
              {[
                { field: 'holoprisma_1', label: 'imagen holoprisma 1 vertical 300 x 450 px' },
                { field: 'holoprisma_2', label: 'imagen holoprisma 2 vertical 300 x 450 px' },
                { field: 'holoprisma_3', label: 'imagen holoprisma 3 vertical 300 x 450 px' },
                { field: 'holoprisma_4', label: 'imagen holoprisma 4 vertical 300 x 450 px' },
              ].map(h => (
                <Field key={h.field} field={h.field} label={h.label} placeholder="https://media.bro7vision.com/..." />
              ))}
            </div>
          </div>

          {/* BLOG */}
          <div className={CardStyle}>
            <p className="text-xs font-bold text-fuchsia-400 mb-4 flex items-center gap-2 uppercase tracking-widest">{'\u2500\u2500'} BLOG {'\u2500\u2500'}</p>
            <div className="space-y-4">
              <Field field="editorial_title" label="Título del artículo" />
              <Field field="editorial_img_url" label="Imagen de portada" placeholder="https://media.bro7vision.com/..." />
              <Field field="editorial_text" label="Texto del artículo" type="textarea" placeholder="Escribe aqu\u00ed el contenido del artículo..." />
            </div>
          </div>
        </div>
      </div>

      {/* SAVE */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-full border border-fuchsia-500/30 transition-all disabled:opacity-50">
          {saving ? '\u23F3 GUARDANDO...' : '\uD83D\uDCBE GUARDAR PROYECCI\u00d3N'}
        </button>
      </div>
    </div>
  );
};

export default BoosterEnlaces;