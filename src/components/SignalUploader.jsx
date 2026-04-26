// src/components/SignalUploader.jsx
// Tab "📡 Señal" extraído de BoosterModal.
// Gestiona toda la subida de media: videos (con FFmpeg) y audio live.
// Props: formData, setFormData, loading, setLoading

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { marcarActividad } from '../hooks/useActividad';
import { useFFmpeg } from '../hooks/useFFmpeg';

const VERTICAL_SLOTS = ['video_file', 'video_file_2', 'video_file_3'];
const SLOT_MAP = {
  video_file:     'v1',
  video_file_2:   'v2',
  video_file_3:   'v3',
  video_file_219: 'horizontal',
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

// ── Subida a R2 ──
const subirArchivoR2 = async (blob, nombreBase, mimeType) => {
  const safeFileName = `${Date.now()}-${nombreBase}`;
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
// COMPONENTE MediaSlot
// ════════════════════════════════════════════════
const MediaSlot = ({ title, fieldName, type, description, formData, setFormData, loading, setLoading, procesarVideo, progreso, fase, procesando }) => {
  const isOccupied = !!formData[fieldName];
  const esVideo    = ['video_file', 'video_file_2', 'video_file_3', 'video_file_219'].includes(fieldName);

  const [acordeonAbierto,      setAcordeonAbierto]      = useState(false);
  const [archivoSeleccionado,  setArchivoSeleccionado]  = useState(null);
  const [metadatos,            setMetadatos]            = useState({ titulo: '', descripcion: '', tipo: 'original' });
  const [errorMeta,            setErrorMeta]            = useState('');
  const fileInputRef = React.useRef(null);

  const handleFileSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivoSeleccionado(file);
    setAcordeonAbierto(true);
    setErrorMeta('');
  };

  const handleDeleteMedia = async (fieldName) => {
    const confirm1 = window.confirm('⚠️ ALERTA DE SISTEMA\n¿Quieres desintegrar este archivo para liberar el espacio?');
    if (!confirm1) return;
    const confirm2 = window.prompt('MEDIDA DE SEGURIDAD:\nEscribe la palabra en mayúsculas: BORRAR');
    if (confirm2 === 'BORRAR') {
      await deleteFromR2(formData[fieldName]);
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
      alert("✅ Archivo desintegrado. Recuerda pulsar 'ACTUALIZAR NÚCLEO'.");
    } else {
      alert('❌ Protocolo cancelado. Código de seguridad incorrecto.');
    }
  };

  const handleConfirmarSubida = async () => {
    if (!metadatos.titulo.trim())      { setErrorMeta('El título es obligatorio.');      return; }
    if (!metadatos.descripcion.trim()) { setErrorMeta('La descripción es obligatoria.'); return; }
    setErrorMeta('');

    const maxSize = esVideo ? 1500 * 1024 * 1024 : 10 * 1024 * 1024;
    if (archivoSeleccionado.size > maxSize) {
      alert(`¡Archivo muy pesado! Máximo ${esVideo ? '1500MB' : '10MB'} permitido.`);
      return;
    }

    setLoading(true);
    try {
      let publicUrl = '';
      let audioUrl  = null;
      const nombreBase = archivoSeleccionado.name.replace(/\s+/g, '_');

      if (esVideo) {
        // FFmpeg: comprimir + extraer audio
        const { videoBlob, audioBlob } = await procesarVideo(archivoSeleccionado);

        const videoNombre = nombreBase.replace(/\.[^/.]+$/, '') + '.mp4';
        publicUrl = await subirArchivoR2(videoBlob, videoNombre, 'video/mp4');

        const audioNombre = 'audio-' + nombreBase.replace(/\.[^/.]+$/, '') + '.mp3';
        audioUrl = await subirArchivoR2(audioBlob, audioNombre, 'audio/mpeg');
      } else {
        // Audio directo — sin FFmpeg
        publicUrl = await subirArchivoR2(archivoSeleccionado, nombreBase, archivoSeleccionado.type);
      }

      // Actualizar formData con la URL del archivo
      if (VERTICAL_SLOTS.includes(fieldName)) {
        const slot1 = formData.video_file   || null;
        const slot2 = formData.video_file_2 || null;
        const slot3 = formData.video_file_3 || null;
        await deleteFromR2(slot3);
        setFormData(prev => ({ ...prev, video_file: publicUrl, video_file_2: slot1, video_file_3: slot2 }));
      } else {
        await deleteFromR2(formData[fieldName]);
        setFormData(prev => ({ ...prev, [fieldName]: publicUrl }));
      }

      // Upsert en creator_media
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
            <button
              onClick={() => handleDeleteMedia(fieldName)}
              className="bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all">
              REEMPLAZAR
            </button>
          </div>
        )}

        {libre && (
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept={type}
              onChange={handleFileSelected}
              className="w-full text-[10px] text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-cyan-500/40 file:bg-cyan-500/10 file:text-cyan-400 file:text-[10px] file:font-bold file:cursor-pointer hover:file:bg-cyan-500/20 transition-all cursor-pointer"
            />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
              <span className="text-xs text-gray-500 font-bold border border-gray-600 px-2 py-1 rounded">HUECO LIBRE</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Acordeón de metadatos ── */}
      {acordeonAbierto && (
        <div className="border-t border-fuchsia-500/20 bg-black/60 p-4 space-y-4 animate-fadeIn">

          {/* Archivo seleccionado */}
          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Archivo:</span>
            <span className="text-[10px] text-cyan-300 truncate">{archivoSeleccionado?.name}</span>
            <span className="text-[10px] text-gray-600 shrink-0">
              ({(archivoSeleccionado?.size / 1024 / 1024).toFixed(1)} MB)
            </span>
          </div>

          {/* Info FFmpeg */}
          {esVideo && (
            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3 flex gap-2 items-start">
              <span className="text-base shrink-0">⚡</span>
              <div>
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">Optimización automática</p>
                <p className="text-[10px] text-gray-500">
                  Tu video se comprimirá a 720p y se extraerá el audio para la versión móvil. Ocurre en tu dispositivo.
                </p>
              </div>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-1">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              maxLength={60}
              placeholder={esVideo ? 'Ej: Mi aventura en el bosque neon' : 'Ej: Gorilas en el Asfalto'}
              value={metadatos.titulo}
              onChange={e => setMetadatos(prev => ({ ...prev, titulo: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none transition-all"
            />
            <p className="text-[9px] text-gray-600 mt-1 text-right">{metadatos.titulo.length}/60</p>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-1">
              Descripción <span className="text-red-400">*</span>
            </label>
            <textarea
              maxLength={200}
              rows={3}
              placeholder="Cuéntale al mundo de qué va este contenido..."
              value={metadatos.descripcion}
              onChange={e => setMetadatos(prev => ({ ...prev, descripcion: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none transition-all resize-none"
            />
            <p className="text-[9px] text-gray-600 mt-1 text-right">{metadatos.descripcion.length}/200</p>
          </div>

          {/* Tipo */}
          <div>
            <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-2">
              Tipo de contenido <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(TIPO_LABELS).map(([valor, { label, color }]) => (
                <button
                  key={valor}
                  onClick={() => setMetadatos(prev => ({ ...prev, tipo: valor }))}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all
                    ${metadatos.tipo === valor
                      ? color + ' scale-105'
                      : 'text-gray-500 border-gray-700 bg-white/5 hover:border-gray-500'}`}>
                  {metadatos.tipo === valor ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de progreso FFmpeg */}
          {procesando && esVideo && (
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

          {/* Error */}
          {errorMeta && (
            <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">
              ⚠️ {errorMeta}
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancelar}
              disabled={procesando || loading}
              className="flex-1 text-[10px] font-bold text-gray-400 border border-gray-700 hover:border-gray-500 py-2 rounded-lg transition-all disabled:opacity-40">
              CANCELAR
            </button>
            <button
              onClick={handleConfirmarSubida}
              disabled={procesando || loading}
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
// COMPONENTE PRINCIPAL — SignalUploader
// ════════════════════════════════════════════════
const SignalUploader = ({ formData, setFormData, loading, setLoading }) => {
  const { procesarVideo, progreso, fase, procesando } = useFFmpeg();

  // Props compartidas para cada MediaSlot
  const slotProps = { formData, setFormData, loading, setLoading, procesarVideo, progreso, fase, procesando };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">

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

          <MediaSlot title="Video Reality / Casa 1" fieldName="video_file"   type="video/*" description="Video principal vertical." {...slotProps} />
          <MediaSlot title="Video Casa 2"           fieldName="video_file_2" type="video/*" description="Video secundario vertical." {...slotProps} />
          <MediaSlot title="Video Casa 3"           fieldName="video_file_3" type="video/*" description="Video terciario vertical." {...slotProps} />

          {/* ── Audio Live ── */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
            <MediaSlot
              title="📡 SEÑAL AUDIO LIVE"
              fieldName="audio_file"
              type="audio/*"
              description="Audio (MP3) para LiveGrid."
              {...slotProps}
            />

            {/* Tipo de audio */}
            <div>
              <label className={LabelStyle}>TIPO DE AUDIO</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { id: 'music',   label: '🎵 Música',  desc: 'Canción, EP, álbum' },
                  { id: 'podcast', label: '🎙️ Podcast', desc: 'Programa, episodio'  },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFormData({ ...formData, audio_type: t.id })}
                    className={`p-3 rounded-xl border text-left transition-all
                      ${formData.audio_type === t.id
                        ? 'bg-fuchsia-900/40 border-fuchsia-500/60 text-fuchsia-300'
                        : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'}`}>
                    <p className="text-xs font-bold mb-1">{t.label}</p>
                    <p className="text-[9px] opacity-70 leading-tight">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Título de la pista */}
            <div>
              <label className={LabelStyle}>TÍTULO DE LA PISTA</label>
              <input
                type="text"
                value={formData.track_name || ''}
                onChange={e => setFormData({ ...formData, track_name: e.target.value })}
                placeholder="Ej: Gorilas en el Asfalto"
                className={`${InputStyle} border-fuchsia-500/30`}
              />
            </div>

            {/* Descripción del audio */}
            <div>
              <label className={LabelStyle}>DESCRIPCIÓN DEL AUDIO</label>
              <textarea
                value={formData.audio_description || ''}
                onChange={e => setFormData({ ...formData, audio_description: e.target.value })}
                placeholder="Ej: Pop de los 80s con guitarra y sintetizadores. Grabado en Madrid."
                rows={3}
                className={`${InputStyle} border-fuchsia-500/30 resize-none`}
              />
              <p className="text-[9px] text-gray-600 mt-1">Mapache usa esta descripción para presentar tu audio.</p>
            </div>
          </div>
        </div>

        {/* ── Columna derecha: video horizontal ── */}
        <div className={`${CardStyle} h-fit`}>
          <h3 className="text-sm font-bold text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">
            🎬 FORMATO (21:9) TELEFONO CASA | PRODUCTOS | SERVICIOS
          </h3>
          <MediaSlot
            title="Video Piso 219"
            fieldName="video_file_219"
            type="video/*"
            description="Formato horizontal panorámico para Catálogos."
            {...slotProps}
          />
        </div>

      </div>
    </div>
  );
};

export default SignalUploader;
