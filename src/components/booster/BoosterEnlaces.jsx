import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// ── Estilos base ────────────────────────────────────────────────
const InputStyle  = "w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all";
const InputError  = "w-full bg-black/60 border border-red-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all";
const LabelStyle  = "text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 block";
const CardStyle   = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

const WORKER_URL = 'https://cupones.bro7vision.workers.dev';

const TIPO_OPTS = [
  { value: 'original',   label: '✦ Original' },
  { value: 'ia',         label: '🤖 Hecho con IA' },
  { value: 'publicidad', label: '📢 Publicidad' },
];

const ALCANCE_OPTS = [
  { value: 'local',        label: '📍 Local' },
  { value: 'nacional',     label: '🇪🇸 Nacional' },
  { value: 'internacional', label: '🌍 Internacional' },
];

// Dominios bloqueados — misma lista que el Worker
const DOMINIOS_BLOQUEADOS = [
  'youtube.com', 'youtu.be', 'tiktok.com', 'vimeo.com',
  'instagram.com', 'facebook.com', 'fb.watch', 'twitter.com', 'x.com',
];

function validarURL(url) {
  if (!url) return null;
  try {
    const parsed  = new URL(url);
    const dominio = parsed.hostname.replace('www.', '');
    const bloq    = DOMINIOS_BLOQUEADOS.find(d => dominio === d || dominio.endsWith('.' + d));
    if (bloq) return `URL no permitida (${bloq}). Usa Cloudflare R2, Bunny CDN u hosting propio.`;
    return null;
  } catch {
    return 'Formato de URL inválido.';
  }
}

// ── Estado inicial separado por bloque ──────────────────────────
const initVideo916  = { url: '', titulo: '', descripcion: '', tipo: 'original' };
const initVideo169  = { url: '', titulo: '', descripcion: '', tipo: 'original' };
const initAudio     = { url: '', titulo: '', descripcion: '', tipo: 'original', alcance: '', circular_url: '' };
const initAudmovil  = { url: '', titulo: '', descripcion: '', tipo: 'original' };
const initMeta      = {
  brotwit: '',
  holoprisma_1: '', holoprisma_2: '', holoprisma_3: '', holoprisma_4: '',
  editorial_title: '', editorial_img_url: '', editorial_text: '',
};

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================
const BoosterEnlaces = () => {
  const [loading,   setLoading]   = useState(true);
  const [tokenHash, setTokenHash] = useState(null);

  // Cuatro bloques de contenido independientes
  const [v916,    setV916]    = useState(initVideo916);
  const [v169,    setV169]    = useState(initVideo169);
  const [audio,   setAudio]   = useState(initAudio);
  const [audmovil,setAudmovil]= useState(initAudmovil);
  const [meta,    setMeta]    = useState(initMeta);

  // Errores de validación por campo URL
  const [errores, setErrores] = useState({});

  // Estados de guardado independientes
  const [saving, setSaving] = useState({
    v916: false, v169: false, audio: false, audmovil: false, meta: false,
  });

  // ── Carga inicial ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Leer token_hash del perfil
        const { data: perfil } = await supabase
          .from('profiles')
          .select('token_hash')
          .eq('id', user.id)
          .single();
        if (perfil?.token_hash) setTokenHash(perfil.token_hash);

        // Leer mini_proyeccion (brotwit, blog, holoprisma)
        const { data: rowMeta } = await supabase
          .from('mini_proyeccion')
          .select('brotwit,holoprisma_1,holoprisma_2,holoprisma_3,holoprisma_4,editorial_title,editorial_img_url,editorial_text')
          .eq('user_id', user.id)
          .single();
        if (rowMeta) setMeta(prev => ({ ...prev, ...rowMeta }));

        // Leer proyeccion_916
        const { data: row916 } = await supabase
          .from('proyeccion_916')
          .select('url,titulo,descripcion,tipo')
          .eq('user_id', user.id)
          .single();
        if (row916) setV916({ url: row916.url || '', titulo: row916.titulo || '', descripcion: row916.descripcion || '', tipo: row916.tipo || 'original' });

        // Leer proyeccion_169
        const { data: row169 } = await supabase
          .from('proyeccion_169')
          .select('url,titulo,descripcion,tipo')
          .eq('user_id', user.id)
          .single();
        if (row169) setV169({ url: row169.url || '', titulo: row169.titulo || '', descripcion: row169.descripcion || '', tipo: row169.tipo || 'original' });

        // Leer proyeccion_audio
        const { data: rowAudio } = await supabase
          .from('proyeccion_audio')
          .select('url,titulo,descripcion,tipo,alcance,circular_url')
          .eq('user_id', user.id)
          .single();
        if (rowAudio) setAudio({ url: rowAudio.url || '', titulo: rowAudio.titulo || '', descripcion: rowAudio.descripcion || '', tipo: rowAudio.tipo || 'original', alcance: rowAudio.alcance || '', circular_url: rowAudio.circular_url || '' });

        // Leer proyeccion_audmovil
        const { data: rowAudmovil } = await supabase
          .from('proyeccion_audmovil')
          .select('url,titulo,descripcion,tipo')
          .eq('user_id', user.id)
          .single();
        if (rowAudmovil) setAudmovil({ url: rowAudmovil.url || '', titulo: rowAudmovil.titulo || '', descripcion: rowAudmovil.descripcion || '', tipo: rowAudmovil.tipo || 'original' });

      } catch (e) {
        console.error('Error cargando BoosterEnlaces:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────
  const setErr = (field, msg) => setErrores(prev => ({ ...prev, [field]: msg }));
  const clearErr = field => setErrores(prev => { const n = { ...prev }; delete n[field]; return n; });

  const setSavingKey = (key, val) => setSaving(prev => ({ ...prev, [key]: val }));

  const callWorker = async (endpoint, body) => {
    const res = await fetch(`${WORKER_URL}${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en el servidor');
    return data;
  };

  const validarURLField = (field, url) => {
    const err = validarURL(url);
    if (err) { setErr(field, err); return false; }
    clearErr(field);
    return true;
  };

  // ── Guardado Video 9:16 ───────────────────────────────────────
  const handleSave916 = async () => {
    if (!validarURLField('v916_url', v916.url)) return;
    if (!tokenHash) return alert('⚠️ Tu token de proyección no está configurado. Contacta con soporte.');
    setSavingKey('v916', true);
    try {
      const res = await callWorker('/proyectar-916', {
        token:       tokenHash,
        url:         v916.url,
        titulo:      v916.titulo,
        descripcion: v916.descripcion,
        tipo:        v916.tipo,
      });
      alert('✨ ' + res.mensaje);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSavingKey('v916', false);
    }
  };

  // ── Guardado Video 16:9 ───────────────────────────────────────
  const handleSave169 = async () => {
    if (!validarURLField('v169_url', v169.url)) return;
    if (!tokenHash) return alert('⚠️ Tu token de proyección no está configurado. Contacta con soporte.');
    setSavingKey('v169', true);
    try {
      const res = await callWorker('/proyectar-169', {
        token:       tokenHash,
        url:         v169.url,
        titulo:      v169.titulo,
        descripcion: v169.descripcion,
        tipo:        v169.tipo,
      });
      alert('✨ ' + res.mensaje);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSavingKey('v169', false);
    }
  };

  // ── Guardado Audio PC ─────────────────────────────────────────
  const handleSaveAudio = async () => {
    if (!validarURLField('audio_url', audio.url)) return;
    if (!tokenHash) return alert('⚠️ Tu token de proyección no está configurado. Contacta con soporte.');
    setSavingKey('audio', true);
    try {
      const res = await callWorker('/proyectar-audio', {
        token:       tokenHash,
        url:         audio.url,
        titulo:      audio.titulo,
        descripcion: audio.descripcion,
        tipo:        audio.tipo,
        alcance:     audio.alcance,
        circular_url: audio.circular_url,
      });
      alert('✨ ' + res.mensaje);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSavingKey('audio', false);
    }
  };

  // ── Guardado Audio Móvil ──────────────────────────────────────
  const handleSaveAudmovil = async () => {
    if (!validarURLField('audmovil_url', audmovil.url)) return;
    if (!tokenHash) return alert('⚠️ Tu token de proyección no está configurado. Contacta con soporte.');
    setSavingKey('audmovil', true);
    try {
      const res = await callWorker('/proyectar-audmovil', {
        token:       tokenHash,
        url:         audmovil.url,
        titulo:      audmovil.titulo,
        descripcion: audmovil.descripcion,
        tipo:        audmovil.tipo,
      });
      alert('✨ ' + res.mensaje);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSavingKey('audmovil', false);
    }
  };

  // ── Guardado Meta (brotwit, blog, holoprisma) ─────────────────
  const handleSaveMeta = async () => {
    if (!tokenHash) return alert('⚠️ Tu token de proyección no está configurado. Contacta con soporte.');
    setSavingKey('meta', true);
    try {
      const res = await callWorker('/proyectar', {
        token:       tokenHash,
        proyeccion:  meta,
      });
      alert('✨ ' + res.mensaje);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSavingKey('meta', false);
    }
  };

  // ── Sub-componentes ───────────────────────────────────────────
  const TipoSelect = ({ value, onChange, label }) => (
    <div className="space-y-1">
      <label className={LabelStyle}>{label}</label>
      <div className="flex gap-2 flex-wrap">
        {TIPO_OPTS.map(opt => (
          <button key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all
              ${value === opt.value
                ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300'
                : 'bg-white/5 border-white/10 text-gray-500'}`}>
            {value === opt.value ? '✓ ' : ''}{opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const AlcanceSelect = ({ value, onChange, label }) => (
    <div className="space-y-1">
      <label className={LabelStyle}>{label}</label>
      <div className="flex gap-2 flex-wrap">
        {ALCANCE_OPTS.map(opt => (
          <button key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all
              ${value === opt.value
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-gray-500'}`}>
            {value === opt.value ? '✓ ' : ''}{opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const URLField = ({ value, onChange, label, placeholder, errorKey }) => (
    <div className="space-y-1">
      <label className={LabelStyle}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => {
          onChange(e.target.value);
          if (errores[errorKey]) {
            const err = validarURL(e.target.value);
            if (!err) clearErr(errorKey);
          }
        }}
        onBlur={e => validarURLField(errorKey, e.target.value)}
        placeholder={placeholder}
        className={errores[errorKey] ? InputError : InputStyle}
      />
      {errores[errorKey] && (
        <p className="text-red-400 text-xs mt-1 font-medium">⚠ {errores[errorKey]}</p>
      )}
    </div>
  );

  const TextField = ({ value, onChange, label, placeholder, type = 'text' }) => (
    <div className="space-y-1">
      <label className={LabelStyle}>{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={6}
          className={`${InputStyle} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} className={InputStyle} />
      )}
    </div>
  );

  const SaveBtn = ({ onClick, saving: isSaving, label = 'PROYECTAR' }) => (
    <div className="flex justify-end mt-6">
      <button onClick={onClick} disabled={isSaving}
        className="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-full border border-fuchsia-500/30 transition-all disabled:opacity-50">
        {isSaving ? '⏳ PROYECTANDO...' : `💾 ${label}`}
      </button>
    </div>
  );

  const SectionTitle = ({ icon, title }) => (
    <p className="text-xs font-bold text-fuchsia-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
      ── {icon} {title} ──
    </p>
  );

  // ── Render ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">Cargando proyección...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-10">

      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-2">
        <span className="text-4xl">🔗</span>
        <div>
          <h3 className="text-xl font-black text-fuchsia-400 tracking-widest uppercase">Enlaces de Proyección</h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">Cada bloque se proyecta de forma independiente</p>
        </div>
      </div>

      {/* Aviso token no configurado */}
      {!tokenHash && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-xs text-red-400 font-medium">
          ⚠ Tu token de proyección aún no está configurado. Contacta con el equipo de Brovision para activarlo antes de proyectar.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ── COLUMNA IZQUIERDA ── */}
        <div className="space-y-6">

          {/* VIDEO 9:16 */}
          <div className={CardStyle}>
            <SectionTitle icon="📱" title="Video Vertical (9:16)" />
            <div className="space-y-4">
              <URLField
                value={v916.url}
                onChange={v => setV916(p => ({ ...p, url: v }))}
                label="URL del video vertical"
                placeholder="https://media.bro7vision.com/..."
                errorKey="v916_url"
              />
              <TextField value={v916.titulo}      onChange={v => setV916(p => ({ ...p, titulo: v }))}      label="Título del video vertical" />
              <TextField value={v916.descripcion} onChange={v => setV916(p => ({ ...p, descripcion: v }))} label="Descripción del video vertical" />
              <TipoSelect value={v916.tipo} onChange={v => setV916(p => ({ ...p, tipo: v }))} label="Tipo de video vertical" />
            </div>
            <SaveBtn onClick={handleSave916} saving={saving.v916} label="PROYECTAR VIDEO 9:16" />
          </div>

          {/* VIDEO 16:9 */}
          <div className={CardStyle}>
            <SectionTitle icon="🖥️" title="Video Horizontal (16:9)" />
            <div className="space-y-4">
              <URLField
                value={v169.url}
                onChange={v => setV169(p => ({ ...p, url: v }))}
                label="URL del video horizontal"
                placeholder="https://media.bro7vision.com/..."
                errorKey="v169_url"
              />
              <TextField value={v169.titulo}      onChange={v => setV169(p => ({ ...p, titulo: v }))}      label="Título del video horizontal" />
              <TextField value={v169.descripcion} onChange={v => setV169(p => ({ ...p, descripcion: v }))} label="Descripción del video horizontal" />
              <TipoSelect value={v169.tipo} onChange={v => setV169(p => ({ ...p, tipo: v }))} label="Tipo de video horizontal" />
            </div>
            <SaveBtn onClick={handleSave169} saving={saving.v169} label="PROYECTAR VIDEO 16:9" />
          </div>

          {/* AUDIO PC */}
          <div className={CardStyle}>
            <SectionTitle icon="🎙️" title="Audio PC — BroLives" />
            <div className="space-y-4">
              <URLField
                value={audio.url}
                onChange={v => setAudio(p => ({ ...p, url: v }))}
                label="URL del archivo de audio"
                placeholder="https://media.bro7vision.com/..."
                errorKey="audio_url"
              />
              <TextField value={audio.titulo}      onChange={v => setAudio(p => ({ ...p, titulo: v }))}      label="Título del audio" />
              <TextField value={audio.descripcion} onChange={v => setAudio(p => ({ ...p, descripcion: v }))} label="Descripción del audio" />
              <TipoSelect value={audio.tipo} onChange={v => setAudio(p => ({ ...p, tipo: v }))} label="Tipo de audio" />
              <AlcanceSelect value={audio.alcance} onChange={v => setAudio(p => ({ ...p, alcance: v }))} label="Alcance del audio" />
              <TextField value={audio.circular_url} onChange={v => setAudio(p => ({ ...p, circular_url: v }))} label="Coloca una imagen circular 150 x 150 px para el prisma de audio BROAUDIO 3D" placeholder="https://media.bro7vision.com/..." />
            </div>
            <SaveBtn onClick={handleSaveAudio} saving={saving.audio} label="PROYECTAR AUDIO PC" />
          </div>

          {/* AUDIO MÓVIL */}
          <div className={CardStyle}>
            <SectionTitle icon="📻" title="Audio Móvil" />
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Audio independiente para el reproductor central del móvil. No tiene por qué ser el mismo que el audio PC.
            </p>
            <div className="space-y-4">
              <URLField
                value={audmovil.url}
                onChange={v => setAudmovil(p => ({ ...p, url: v }))}
                label="URL del audio móvil"
                placeholder="https://media.bro7vision.com/..."
                errorKey="audmovil_url"
              />
              <TextField value={audmovil.titulo}      onChange={v => setAudmovil(p => ({ ...p, titulo: v }))}      label="Título" />
              <TextField value={audmovil.descripcion} onChange={v => setAudmovil(p => ({ ...p, descripcion: v }))} label="Descripción" />
              <TipoSelect value={audmovil.tipo} onChange={v => setAudmovil(p => ({ ...p, tipo: v }))} label="Tipo de audio" />
            </div>
            <SaveBtn onClick={handleSaveAudmovil} saving={saving.audmovil} label="PROYECTAR AUDIO MÓVIL" />
          </div>
        </div>

        {/* ── COLUMNA DERECHA ── */}
        <div className="space-y-6">

          {/* BROTWIT + HOLOPRISMA + BLOG — un solo bloque con un solo botón */}
          <div className={CardStyle}>
            <SectionTitle icon="💬" title="BroTwit" />
            <div className="space-y-4">
              <TextField
                value={meta.brotwit}
                onChange={v => setMeta(p => ({ ...p, brotwit: v }))}
                label="Mensaje a tu comunidad"
                placeholder="Escribe un mensaje para tus seguidores..."
              />
            </div>

            <div className="border-t border-white/10 my-6" />
            <SectionTitle icon="🔮" title="HoloPrisma" />
            <p className="text-xs text-gray-500 mb-4">Imágenes verticales 300 × 450 px</p>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(n => (
                <TextField
                  key={n}
                  value={meta[`holoprisma_${n}`]}
                  onChange={v => setMeta(p => ({ ...p, [`holoprisma_${n}`]: v }))}
                  label={`Imagen HoloPrisma ${n}`}
                  placeholder="https://media.bro7vision.com/..."
                />
              ))}
            </div>

            <div className="border-t border-white/10 my-6" />
            <SectionTitle icon="✍️" title="Blog Editorial" />
            <div className="space-y-4">
              <TextField
                value={meta.editorial_title}
                onChange={v => setMeta(p => ({ ...p, editorial_title: v }))}
                label="Título del artículo"
              />
              <TextField
                value={meta.editorial_img_url}
                onChange={v => setMeta(p => ({ ...p, editorial_img_url: v }))}
                label="Imagen de portada"
                placeholder="https://media.bro7vision.com/..."
              />
              <TextField
                value={meta.editorial_text}
                onChange={v => setMeta(p => ({ ...p, editorial_text: v }))}
                label="Texto del artículo"
                type="textarea"
                placeholder="Escribe aquí el contenido del artículo..."
              />
            </div>

            <SaveBtn onClick={handleSaveMeta} saving={saving.meta} label="PROYECTAR BROTWIT · HOLOPRISMA · BLOG" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoosterEnlaces;
