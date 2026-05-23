// src/components/SignalUploader.jsx
// Tab "📡 Señal" extraído de BoosterModal.
// Slots verticales: campos siempre visibles (estilo YouTube/TikTok).
// Slots audio y 169: sin cambios.
// Nuevos campos: categoria_declarada, descripcion_declarada (creator_media).
//
// FIXES:
//  [1] Eliminados campos TÍTULO y DESCRIPCIÓN duplicados del audio en SignalUploader
//      (ya existen dentro del acordeón de MediaSlot)
//  [2] Límite de audio corregido: 100 MB (era 10 MB por bug en lógica esVideo)

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { marcarActividad } from '../hooks/useActividad';
import { useFFmpeg, BYPASS_LIMIT_MB, MAX_VIDEO_MB, MAX_AUDIO_MB } from '../hooks/useFFmpeg';

const VERTICAL_SLOTS = ['video_file', 'video_file_2'];
const SLOT_MAP = {
  video_file:     'v1',
  video_file_2:   'v2',
  video_file_169: 'horizontal',
  video_file_169b: 'horizontal2',
  audio_file:     'audio',
};

const LabelStyle = "text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 block";
const InputStyle  = "w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all";
const CardStyle   = "bg-blue-950/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]";

const TIPO_LABELS = {
  original:   { label: 'Contenido Original', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  ia:         { label: 'Hecho con IA',        color: 'text-violet-400  border-violet-500/40  bg-violet-500/10'  },
  publicidad: { label: 'Publicidad',           color: 'text-amber-400  border-amber-500/40   bg-amber-500/10'   },
};

// Categorías para el algoritmo de Reality
const CATEGORIAS_DECLARADAS = [
  { id: 'explico',    label: '🎓 Explico algo paso a paso',         desc: 'Tutorial, guía, how-to' },
  { id: 'cuento',     label: '🎭 Cuento algo que me pasó',          desc: 'Historia personal, experiencia' },
  { id: 'muestro',    label: '🎬 Muestro un proceso o actividad',   desc: 'Making-of, detrás de cámara' },
  { id: 'naturaleza', label: '🌿 Muestro animales o naturaleza',    desc: 'Mascotas, fauna, paisaje' },
  { id: 'rutina',     label: '📍 Muestro mi vida o lugares',        desc: 'Vlog, rutina, viaje' },
  { id: 'camara',     label: '🎤 Hablo directo a cámara',           desc: 'Opinión, reflexión, monólogo' },
  { id: 'atmosfera',  label: '🌙 Creo ambiente o atmósfera',        desc: 'Mood, estética, sin mucho diálogo' },
  { id: 'humor',      label: '😂 Humor o entretenimiento',          desc: 'Sketch, reacción, comedia' },
  { id: 'otro',       label: '✦ Otro',                              desc: 'No encaja en las anteriores' },
];

const subirArchivoR2 = async (blob, nombreBase, mimeType) => {
  const safeFileName = `${Date.now()}_${nombreBase}`;  // ← guarda el _ en vez del -
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: safeFileName, fileType: mimeType }),
  });
  const { uploadUrl } = await res.json();
  if (!uploadUrl) throw new Error('La API no devolvió el ticket de subida.');
  await fetch(uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': mimeType } });
  return `https://media.bro7vision.com/${safeFileName}`;
};

const deleteFromR2 = async (fileUrl) => {
  if (!fileUrl) return;
  try {
    const res = await fetch('/api/delete-r2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl }),
    });
    const data = await res.json();
    if (!data.success) console.error('Error al borrar en R2:', data.error);
  } catch (err) {
    console.error('Error al llamar a delete-r2:', err);
  }
};

// ════════════════════════════════════════════════
// COMPONENTE VideoSlotVertical
// Campos siempre visibles — estilo YouTube/TikTok
// ════════════════════════════════════════════════
const VideoSlotVertical = ({ title, fieldName, slotNumber, formData, setFormData, loading, setLoading, procesarVideo, progreso, fase, procesando }) => {
  const isOccupied = !!formData[fieldName];

  const [metadatos, setMetadatos] = useState({
    titulo:                '',
    descripcion:           '',
    tipo:                  'original',
    categoria_declarada:   '',
    descripcion_declarada: '',
  });
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [errorMeta, setErrorMeta]                     = useState('');
  const [modoReemplazar, setModoReemplazar]           = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivoSeleccionado(file);
    setErrorMeta('');
  };

  const handleDeleteMedia = async () => {
    const confirm1 = window.confirm('⚠️ ALERTA DE SISTEMA\n¿Quieres desintegrar este archivo para liberar el espacio?');
    if (!confirm1) return;
    const confirm2 = window.prompt('MEDIDA DE SEGURIDAD:\nEscribe la palabra en mayúsculas: BORRAR');
    if (confirm2 === 'BORRAR') {
      await deleteFromR2(formData[fieldName]);
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
      setModoReemplazar(false);
      alert("✅ Archivo desintegrado. Recuerda pulsar 'ACTUALIZAR NÚCLEO'.");
    } else {
      alert('❌ Protocolo cancelado. Código de seguridad incorrecto.');
    }
  };

  const handleSubir = async () => {
    if (!archivoSeleccionado)              { setErrorMeta('Elige un archivo primero.');            return; }
    if (!metadatos.titulo.trim())          { setErrorMeta('El título es obligatorio.');             return; }
    if (!metadatos.descripcion.trim())     { setErrorMeta('La descripción es obligatoria.');        return; }
    if (!metadatos.categoria_declarada)    { setErrorMeta('Elige una categoría de contenido.');     return; }
    if (!metadatos.descripcion_declarada.trim()) { setErrorMeta('Describe brevemente qué se ve.'); return; }
    setErrorMeta('');

    const maxSize = 1500 * 1024 * 1024;
    if (archivoSeleccionado.size > maxSize) {
      alert('¡Archivo muy pesado! Máximo 1500MB permitido.');
      return;
    }

    setLoading(true);
    try {
      const nombreBase  = archivoSeleccionado.name.replace(/\s+/g, '_');
      const { videoBlob, audioBlob } = await procesarVideo(archivoSeleccionado);

      const videoNombre = nombreBase.replace(/\.[^/.]+$/, '') + '.mp4';
      const publicUrl   = await subirArchivoR2(videoBlob, videoNombre, 'video/mp4');

      const audioNombre = 'audio-' + nombreBase.replace(/\.[^/.]+$/, '') + '.mp3';
      const audioUrl    = await subirArchivoR2(audioBlob, audioNombre, 'audio/mpeg');

      // Rotación de slots: nuevo video entra como v1, el resto baja
      if (VERTICAL_SLOTS.includes(fieldName)) {
        const slot1 = formData.video_file   || null;
        const slot2 = formData.video_file_2 || null;
                await deleteFromR2(slot2);
        setFormData(prev => ({ ...prev, video_file: publicUrl, video_file_2: slot1 }));
      }

      // Upsert en creator_media con los campos nuevos
      const slot = SLOT_MAP[fieldName];
      if (slot) {
        const upsertData = {
          user_id:               formData.id,
          slot,
          url:                   publicUrl,
          titulo:                metadatos.titulo,
          descripcion:           metadatos.descripcion,
          tipo:                  metadatos.tipo,
          audio_video:           audioUrl,
          categoria_declarada:   metadatos.categoria_declarada,
          descripcion_declarada: metadatos.descripcion_declarada,
        };
        const { error } = await supabase
          .from('creator_media')
          .upsert(upsertData, { onConflict: 'user_id,slot' });
        if (error) console.error('[creator_media upsert]', error);
      }

      await marcarActividad('video');
      alert('🚀 ¡Archivo inyectado en el NÚCLEO R2!');

      // Reset
      setArchivoSeleccionado(null);
      setModoReemplazar(false);
      setMetadatos({ titulo: '', descripcion: '', tipo: 'original', categoria_declarada: '', descripcion_declarada: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error(err);
      alert('❌ Error de hiper-salto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setArchivoSeleccionado(null);
    setModoReemplazar(false);
    setMetadatos({ titulo: '', descripcion: '', tipo: 'original', categoria_declarada: '', descripcion_declarada: '' });
    setErrorMeta('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Estado ocupado (sin editar) ──
  if (isOccupied && !modoReemplazar) {
    return (
      <div className="bg-black/40 rounded-2xl border border-cyan-500/20 overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <div>
            <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block mb-0.5">{title}</label>
            <span className="text-[10px] text-cyan-400 font-bold">✓ Ocupado</span>
          </div>
          <button
            onClick={() => setModoReemplazar(true)}
            className="bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all">
            REEMPLAZAR
          </button>
        </div>
      </div>
    );
  }

  // ── Formulario siempre visible ──
  return (
    <div className="bg-black/40 rounded-2xl border border-fuchsia-500/20 overflow-hidden">

      {/* Header del slot */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <label className="text-[10px] font-bold text-fuchsia-300 uppercase tracking-widest block mb-0.5">{title}</label>
          {isOccupied && (
            <span className="text-[9px] text-cyan-400">✓ Tiene video — al subir lo reemplazará</span>
          )}
        </div>
        {modoReemplazar && (
          <button onClick={handleCancelar} className="text-[10px] text-gray-500 hover:text-white border border-gray-700 px-3 py-1 rounded-lg transition-all">
            CANCELAR
          </button>
        )}
      </div>

      <div className="px-4 pb-4 space-y-4">

        {/* ── Título ── */}
        <div>
          <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-1">
            Título del video <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            maxLength={60}
            placeholder="Ej: Mi aventura en el bosque neon"
            value={metadatos.titulo}
            onChange={e => setMetadatos(prev => ({ ...prev, titulo: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none transition-all"
          />
          <p className="text-[9px] text-gray-600 mt-0.5 text-right">{metadatos.titulo.length}/60</p>
        </div>

        {/* ── Descripción ── */}
        <div>
          <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-1">
            Descripción <span className="text-red-400">*</span>
          </label>
          <textarea
            maxLength={200}
            rows={2}
            placeholder="Cuéntale al mundo de qué va este contenido..."
            value={metadatos.descripcion}
            onChange={e => setMetadatos(prev => ({ ...prev, descripcion: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none transition-all resize-none"
          />
          <p className="text-[9px] text-gray-600 mt-0.5 text-right">{metadatos.descripcion.length}/200</p>
        </div>

        {/* ── Tipo de contenido ── */}
        <div>
          <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-2">
            Tipo <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(TIPO_LABELS).map(([valor, { label, color }]) => (
              <button
                key={valor}
                onClick={() => setMetadatos(prev => ({ ...prev, tipo: valor }))}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all
                  ${metadatos.tipo === valor ? color + ' scale-105' : 'text-gray-500 border-gray-700 bg-white/5 hover:border-gray-500'}`}>
                {metadatos.tipo === valor ? '✓ ' : ''}{label}
              </button>
            ))}
          </div>
        </div>

        {/* ── SEPARADOR ALGORITMO ── */}
        <div className="border-t border-cyan-500/10 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🛸</span>
            <div>
              <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Para el Algoritmo de Reality</p>
              <p className="text-[9px] text-gray-600">Nos ayuda a recomendar tu video a quien le va a gustar.</p>
            </div>
          </div>

          {/* Categoría declarada */}
          <div className="mb-3">
            <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block mb-2">
              ¿Qué estás haciendo en tu video? <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {CATEGORIAS_DECLARADAS.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setMetadatos(prev => ({ ...prev, categoria_declarada: cat.id }))}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all
                    ${metadatos.categoria_declarada === cat.id
                      ? 'bg-cyan-900/40 border-cyan-500/50 text-cyan-300'
                      : 'bg-white/3 border-white/5 text-gray-500 hover:border-white/15 hover:text-gray-300'}`}>
                  <span className="text-sm shrink-0">{cat.label.split(' ')[0]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold leading-tight">{cat.label.slice(cat.label.indexOf(' ') + 1)}</p>
                    <p className="text-[9px] opacity-60 leading-tight">{cat.desc}</p>
                  </div>
                  {metadatos.categoria_declarada === cat.id && (
                    <span className="text-cyan-400 font-bold text-xs shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción corta — qué se ve */}
          <div>
            <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              En pocas palabras, ¿qué se ve en tu video? <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              maxLength={60}
              placeholder='Ej: "mi gato comiendo", "tutorial de Excel", "mis vacaciones en Grecia"'
              value={metadatos.descripcion_declarada}
              onChange={e => setMetadatos(prev => ({ ...prev, descripcion_declarada: e.target.value }))}
              className="w-full bg-cyan-500/5 border border-cyan-500/20 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none transition-all"
            />
            <p className="text-[9px] text-gray-600 mt-0.5 text-right">{metadatos.descripcion_declarada.length}/60</p>
          </div>
        </div>

        {/* ── Selector de archivo ── */}
        <div className="border-t border-white/5 pt-4">
          <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-2">
            Archivo de video <span className="text-red-400">*</span>
          </label>

          <AvisoLimites tipo="video" />

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelected}
            className="w-full text-[10px] text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-fuchsia-500/40 file:bg-fuchsia-500/10 file:text-fuchsia-400 file:text-[10px] file:font-bold file:cursor-pointer hover:file:bg-fuchsia-500/20 transition-all cursor-pointer"
          />

          {archivoSeleccionado && (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg mt-2">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest">Archivo:</span>
              <span className="text-[10px] text-fuchsia-300 truncate">{archivoSeleccionado.name}</span>
              <span className="text-[10px] text-gray-600 shrink-0">
                ({(archivoSeleccionado.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            </div>
          )}
        </div>

        {/* ── Barra de progreso FFmpeg ── */}
        {procesando && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{fase}</p>
              <p className="text-[10px] text-gray-400">{progreso}%</p>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {errorMeta && (
          <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">
            ⚠️ {errorMeta}
          </p>
        )}

        {/* ── Botón subir ── */}
        <button
          onClick={handleSubir}
          disabled={procesando || loading}
          className="w-full text-[10px] font-bold bg-fuchsia-600/80 hover:bg-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl border border-fuchsia-500/50 transition-all uppercase tracking-widest">
          {procesando ? `⚡ ${fase || 'Procesando...'}` : loading ? '🚀 Subiendo...' : '🚀 SUBIR VIDEO'}
        </button>

        {/* Botón borrar si está ocupado y en modo reemplazar */}
        {isOccupied && modoReemplazar && (
          <button
            onClick={handleDeleteMedia}
            disabled={procesando || loading}
            className="w-full text-[10px] font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 py-2 rounded-xl transition-all">
            ☠️ Solo borrar sin reemplazar
          </button>
        )}

      </div>
    </div>
  );
};


// ════════════════════════════════════════════════
// COMPONENTE MediaSlot — para 169 y audio
// FIX [2]: límite de audio corregido a 100 MB
// ════════════════════════════════════════════════
const MediaSlot = ({ title, fieldName, type, description, formData, setFormData, loading, setLoading, procesarVideo, progreso, fase, procesando }) => {
  const isOccupied = !!formData[fieldName];
  const esVideo    = fieldName === 'video_file_169' || fieldName === 'video_file_169b';
  const esAudio    = fieldName === 'audio_file'; // FIX [2]

  const [acordeonAbierto,     setAcordeonAbierto]     = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [metadatos,           setMetadatos]           = useState({ titulo: '', descripcion: '', tipo: 'original' });
  const [errorMeta,           setErrorMeta]           = useState('');
  const fileInputRef = React.useRef(null);

  const handleFileSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivoSeleccionado(file);
    setAcordeonAbierto(true);
    setErrorMeta('');
  };

  const handleDeleteMedia = async () => {
    const confirm1 = window.confirm('⚠️ ALERTA DE SISTEMA\n¿Quieres desintegrar este archivo?');
    if (!confirm1) return;
    const confirm2 = window.prompt('MEDIDA DE SEGURIDAD:\nEscribe la palabra en mayúsculas: BORRAR');
    if (confirm2 === 'BORRAR') {
      await deleteFromR2(formData[fieldName]);
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
      alert("✅ Archivo desintegrado. Recuerda pulsar 'ACTUALIZAR NÚCLEO'.");
    } else {
      alert('❌ Protocolo cancelado.');
    }
  };

  const handleConfirmarSubida = async () => {
    if (!metadatos.titulo.trim())      { setErrorMeta('El título es obligatorio.');      return; }
    if (!metadatos.descripcion.trim()) { setErrorMeta('La descripción es obligatoria.'); return; }
    setErrorMeta('');

    // FIX [2]: lógica de límite corregida — audio = 100 MB, video = 1500 MB
    const maxSize = esVideo ? 1500 * 1024 * 1024
                 : esAudio  ?  100 * 1024 * 1024
                 :             100 * 1024 * 1024; // fallback seguro
    const maxLabel = esVideo ? '1500MB' : '100MB';

    if (archivoSeleccionado.size > maxSize) {
      alert(`¡Archivo muy pesado! Máximo ${maxLabel} permitido.`);
      return;
    }

    setLoading(true);
    try {
      let publicUrl = '';
      let audioUrl  = null;
      const nombreBase = archivoSeleccionado.name.replace(/\s+/g, '_');

      if (esVideo) {
        const { videoBlob, audioBlob } = await procesarVideo(archivoSeleccionado);
        const videoNombre = nombreBase.replace(/\.[^/.]+$/, '') + '.mp4';
        publicUrl = await subirArchivoR2(videoBlob, videoNombre, 'video/mp4');
        const audioNombre = 'audio-' + nombreBase.replace(/\.[^/.]+$/, '') + '.mp3';
        audioUrl = await subirArchivoR2(audioBlob, audioNombre, 'audio/mpeg');
      } else {
        publicUrl = await subirArchivoR2(archivoSeleccionado, nombreBase, archivoSeleccionado.type);
      }

      await deleteFromR2(formData[fieldName]);
      setFormData(prev => ({ ...prev, [fieldName]: publicUrl }));

      const slot = SLOT_MAP[fieldName];
      if (slot) {
        const upsertData = {
          user_id:     formData.id,
          slot,
          url:         publicUrl,
          titulo:      metadatos.titulo,
          descripcion: metadatos.descripcion,
          tipo:        metadatos.tipo,
        };
        if (audioUrl) upsertData.audio_video = audioUrl;
        const { error } = await supabase
          .from('creator_media')
          .upsert(upsertData, { onConflict: 'user_id,slot' });
        if (error) console.error('[creator_media upsert]', error);
      }

      if (esVideo) await marcarActividad('video');
      alert('🚀 ¡Archivo inyectado en el NÚCLEO R2!');

    } catch (err) {
      console.error(err);
      alert('❌ Error de hiper-salto: ' + err.message);
    } finally {
      setLoading(false);
      setAcordeonAbierto(false);
      setArchivoSeleccionado(null);
      setMetadatos({ titulo: '', descripcion: '', tipo: 'original' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancelar = () => {
    setAcordeonAbierto(false);
    setArchivoSeleccionado(null);
    setMetadatos({ titulo: '', descripcion: '', tipo: 'original' });
    setErrorMeta('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const ocupado = isOccupied && !acordeonAbierto;
  const libre   = !isOccupied && !acordeonAbierto;

  return (
    <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden group transition-all duration-300">
      <div className="p-4">
        <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block mb-1">{title}</label>
        <p className="text-[9px] text-gray-500 mb-3">{description}</p>

        {ocupado && (
          <div className="bg-cyan-900/20 p-3 rounded-xl border border-cyan-500/30 flex justify-between items-center">
            <span className="text-[10px] text-cyan-400 font-bold">✓ Ocupado</span>
            <button onClick={handleDeleteMedia}
              className="bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all">
              REEMPLAZAR
            </button>
          </div>
        )}

        {libre && (
          <div className="relative">
            <input ref={fileInputRef} type="file" accept={type} onChange={handleFileSelected}
              className="w-full text-[10px] text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-cyan-500/40 file:bg-cyan-500/10 file:text-cyan-400 file:text-[10px] file:font-bold file:cursor-pointer hover:file:bg-cyan-500/20 transition-all cursor-pointer" />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
              <span className="text-xs text-gray-500 font-bold border border-gray-600 px-2 py-1 rounded">HUECO LIBRE</span>
            </div>
          </div>
        )}
      </div>

      {acordeonAbierto && (
        <div className="border-t border-fuchsia-500/20 bg-black/60 p-4 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Archivo:</span>
            <span className="text-[10px] text-cyan-300 truncate">{archivoSeleccionado?.name}</span>
            <span className="text-[10px] text-gray-600 shrink-0">
              ({(archivoSeleccionado?.size / 1024 / 1024).toFixed(1)} MB)
            </span>
          </div>

          {esVideo && <AvisoLimites tipo="video" />}
          {esAudio && <AvisoLimites tipo="audio" />}

          <div>
            <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-1">
              Título <span className="text-red-400">*</span>
            </label>
            <input type="text" maxLength={60}
              placeholder={esAudio ? 'Ej: Gorilas en el Asfalto' : 'Ej: Video catálogo primavera 2026'}
              value={metadatos.titulo}
              onChange={e => setMetadatos(prev => ({ ...prev, titulo: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none transition-all" />
            <p className="text-[9px] text-gray-600 mt-1 text-right">{metadatos.titulo.length}/60</p>
          </div>

          <div>
            <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-1">
              Descripción <span className="text-red-400">*</span>
            </label>
            <textarea maxLength={200} rows={3}
              placeholder={esAudio ? 'Ej: Pop de los 80s con guitarra y sintetizadores. Grabado en Madrid.' : 'Descripción del contenido...'}
              value={metadatos.descripcion}
              onChange={e => setMetadatos(prev => ({ ...prev, descripcion: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none transition-all resize-none" />
            <p className="text-[9px] text-gray-600 mt-1 text-right">{metadatos.descripcion.length}/200</p>
          </div>

          <div>
            <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-2">
              Tipo <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(TIPO_LABELS).map(([valor, { label, color }]) => (
                <button key={valor}
                  onClick={() => setMetadatos(prev => ({ ...prev, tipo: valor }))}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all
                    ${metadatos.tipo === valor ? color + ' scale-105' : 'text-gray-500 border-gray-700 bg-white/5 hover:border-gray-500'}`}>
                  {metadatos.tipo === valor ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de tipo de audio — solo visible cuando es audio */}
          {esAudio && (
            <div>
              <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-2">
                Tipo de audio <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'music',   label: '🎵 Música',  desc: 'Canción, EP, álbum' },
                  { id: 'podcast', label: '🎙️ Podcast', desc: 'Programa, episodio'  },
                ].map((t) => (
                  <button key={t.id}
                    onClick={() => setMetadatos(prev => ({ ...prev, audio_type: t.id }))}
                    className={`p-3 rounded-xl border text-left transition-all
                      ${metadatos.audio_type === t.id
                        ? 'bg-fuchsia-900/40 border-fuchsia-500/60 text-fuchsia-300'
                        : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'}`}>
                    <p className="text-xs font-bold mb-1">{t.label}</p>
                    <p className="text-[9px] opacity-70 leading-tight">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {procesando && esVideo && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{fase}</p>
                <p className="text-[10px] text-gray-400">{progreso}%</p>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progreso}%` }} />
              </div>
            </div>
          )}

          {errorMeta && (
            <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">
              ⚠️ {errorMeta}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleCancelar} disabled={procesando || loading}
              className="flex-1 text-[10px] font-bold text-gray-400 border border-gray-700 hover:border-gray-500 py-2 rounded-lg transition-all disabled:opacity-40">
              CANCELAR
            </button>
            <button onClick={handleConfirmarSubida} disabled={procesando || loading}
              className="flex-[2] text-[10px] font-bold bg-fuchsia-600/80 hover:bg-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2 px-6 rounded-lg border border-fuchsia-500/50 transition-all">
              {procesando ? `⚡ ${fase || 'Procesando...'}` : loading ? '🚀 Subiendo...' : '🚀 CONFIRMAR SUBIDA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


// ════════════════════════════════════════════════
// COMPONENTE AvisoLimites
// Informa al usuario de los límites y cuándo se activa la compresión.
// Se usa tanto en VideoSlotVertical como en MediaSlot (video 16:9).
// ════════════════════════════════════════════════
const AvisoLimites = ({ tipo = 'video' }) => {
  if (tipo === 'audio') {
    return (
      <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl p-4 flex gap-3 items-start">
        <span className="text-xl shrink-0">🎙️</span>
        <div className="space-y-1">
          <p className="text-xs font-black text-fuchsia-300 uppercase tracking-widest">
            Límite de audio
          </p>
          <p className="text-sm text-gray-300">
            Máximo <span className="text-white font-bold">{MAX_AUDIO_MB} MB</span> por archivo.
          </p>
          <p className="text-xs text-gray-500">
            Formatos aceptados: MP3, WAV, AAC, OGG.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 flex gap-3 items-start">
      <span className="text-xl shrink-0">⚡</span>
      <div className="space-y-2">
        <p className="text-xs font-black text-cyan-300 uppercase tracking-widest">
          Límites y optimización automática
        </p>

        {/* Tabla de límites */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
          <p className="text-xs text-gray-400">Tamaño máximo</p>
          <p className="text-sm font-bold text-white">{MAX_VIDEO_MB} MB</p>

          <p className="text-xs text-gray-400">Sin compresión</p>
          <p className="text-sm font-bold text-emerald-400">MP4 hasta {BYPASS_LIMIT_MB} MB</p>

          <p className="text-xs text-gray-400">Con compresión</p>
          <p className="text-sm font-bold text-amber-400">Otros formatos o más de {BYPASS_LIMIT_MB} MB</p>
        </div>

        {/* Separador */}
        <div className="border-t border-cyan-500/10 pt-2">
          <p className="text-xs text-gray-500 leading-relaxed">
            Los videos MP4 ya optimizados (ej: descargados de YouTube) se suben
            <span className="text-cyan-400 font-bold"> directamente sin espera</span>.
            Solo extraemos el audio para la versión móvil (~15 seg).
            Si tu video es de otro formato o supera los {BYPASS_LIMIT_MB} MB,
            lo comprimiremos automáticamente a 720p antes de subir.
          </p>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════
// COMPONENTE SemaforoWidget — Estado de Emisión
// ════════════════════════════════════════════════
const SEMAFORO_CONFIG = {
  VERDE:    { emoji: '🟢', label: 'Emites en todos los turnos (00:00 – 24:00)', border: 'border-emerald-500/50', text: 'text-emerald-400', bg: 'bg-emerald-500/5' },
  AMARILLO: { emoji: '🟡', label: 'Emites desde las 17:00 (T3 y T4)',           border: 'border-yellow-500/50',  text: 'text-yellow-400',  bg: 'bg-yellow-500/5'  },
  ROJO:     { emoji: '🔴', label: 'Emites desde las 23:00 (solo T4)',            border: 'border-red-500/50',     text: 'text-red-400',     bg: 'bg-red-500/5'     },
};

const SemaforoWidget = ({ formData, setFormData }) => {
  const semaforo = formData.semaforo || 'VERDE';
  const fecha    = formData.semaforo_fecha;
  const solicitada = formData.revision_solicitada || false;
  const [enviando, setEnviando] = useState(false);

  const actual = SEMAFORO_CONFIG[semaforo] || SEMAFORO_CONFIG.VERDE;

  const handleSolicitarRevision = async () => {
    setEnviando(true);
    try {
      await supabase.from('profiles').update({ revision_solicitada: true }).eq('id', formData.id);
      setFormData(prev => ({ ...prev, revision_solicitada: true }));
    } catch (err) {
      console.error('[semaforo revision]', err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={`${actual.bg} border ${actual.border} rounded-2xl p-5`}>
      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Estado de Emisión en Reality</p>

      {/* Indicadores tricolor */}
      <div className="flex items-center gap-5 mb-3">
        {['VERDE', 'AMARILLO', 'ROJO'].map(s => {
          const active = semaforo === s;
          const cfg = SEMAFORO_CONFIG[s];
          return (
            <div key={s} className={`flex items-center gap-1.5 transition-all duration-300 ${active ? 'opacity-100 scale-110' : 'opacity-20'}`}>
              <span className={`${active ? 'text-3xl' : 'text-xl'}`}>{cfg.emoji}</span>
              {active && <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.text}`}>{s}</span>}
            </div>
          );
        })}
      </div>

      <p className={`text-xs font-bold ${actual.text} mb-1`}>{actual.label}</p>

      {fecha && (
        <p className="text-[9px] text-gray-600 mt-1">
          Revisión: {new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      )}

      {semaforo !== 'VERDE' && (
        <button
          onClick={handleSolicitarRevision}
          disabled={solicitada || enviando}
          className={`mt-3 text-[10px] font-bold px-4 py-2 rounded-xl border transition-all
            ${solicitada
              ? 'text-gray-500 border-gray-700 bg-gray-800/30 cursor-default'
              : 'text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95'
            }`}
        >
          {solicitada ? '✓ Revisión solicitada' : 'SOLICITAR REVISIÓN'}
        </button>
      )}
    </div>
  );
};


// ════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — SignalUploader
// FIX [1]: eliminados campos track_name / audio_description / audio_type
//          del padre — ya viven dentro del acordeón de MediaSlot
// ════════════════════════════════════════════════
const SignalUploader = ({ formData, setFormData, loading, setLoading }) => {
  const { procesarVideo, progreso, fase, procesando } = useFFmpeg();

  const sharedProps = { formData, setFormData, loading, setLoading, procesarVideo, progreso, fase, procesando };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">

      {/* Semáforo de emisión */}
      <SemaforoWidget formData={formData} setFormData={setFormData} />

      {/* Aviso legal */}
      <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex gap-4 items-start">
        <div className="text-2xl mt-1">⚖️</div>
        <div>
          <h4 className="text-sm font-bold text-red-300 uppercase tracking-widest mb-1">Ley de Medios Bro7Vision</h4>
          <p className="text-xs text-red-200">
            Usa música propia o Licencia <span className="font-bold underline">CC 4.0</span>.
            Cupo máximo: <span className="text-white font-bold">1 Audio, 3 Videos Verticales y 1 Horizontal</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Columna izquierda: videos verticales + audio live ── */}
        <div className={`${CardStyle} space-y-4`}>
          <h3 className="text-sm font-bold text-fuchsia-400 mb-4 border-b border-fuchsia-500/20 pb-2">
            📱 SEÑAL MÓVIL (9:16)
          </h3>

          {/* Slots verticales */}
          <VideoSlotVertical title="Video Reality / Casa 1" fieldName="video_file"   slotNumber={1} {...sharedProps} />
          <VideoSlotVertical title="Video Casa 2"           fieldName="video_file_2" slotNumber={2} {...sharedProps} />

          {/* ── Audio Live ── */}
          {/* FIX [1]: título, descripción y tipo de audio ahora viven DENTRO
              del acordeón de MediaSlot — se eliminaron los campos duplicados
              que estaban aquí debajo en el componente padre               */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <MediaSlot
              title="📡 SEÑAL AUDIO LIVE"
              fieldName="audio_file"
              type="audio/*"
              description="Audio (MP3) para LiveGrid. Máx. 100MB."
              {...sharedProps}
            />
          </div>
        </div>

        {/* ── Columna derecha: videos horizontales 16:9 ── */}
        <div className={`${CardStyle} h-fit space-y-4`}>
          <h3 className="text-sm font-bold text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">
            🎬 FORMATO (16:9) TELEFONO CASA | PRODUCTOS | SERVICIOS
          </h3>
          <MediaSlot
            title="Video Horizontal A"
            fieldName="video_file_169"
            type="video/*"
            description="Formato horizontal panorámico para Catálogos."
            {...sharedProps}
          />
          <MediaSlot
            title="Video Horizontal B"
            fieldName="video_file_169b"
            type="video/*"
            description="Segundo slot horizontal para Productos o Servicios."
            {...sharedProps}
          />
        </div>

      </div>
    </div>
  );
};

export default SignalUploader;