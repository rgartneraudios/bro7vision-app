// src/components/personajes/EvelynBanner.jsx

import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from '../AgentChatInput';
import BroCardStrip from '../BroCardStrip';
import { useAgentEvelyn } from '../../hooks/useAgentEvelyn';

const GREETINGS_EVELYN = [
  "Soy Evelyn 🧡 Básicamente, ¿qué aviso te trae por aquí?",
  "Evelyn comunica. Qué necesitas y lo resolvemos rápido.",
  "Soy Evelyn 🧡 A ver — ¿buscas algo o tienes algo que ofrecer?",
  "Evelyn aquí. En resumen — ¿qué aviso te trae por aquí?",
];

const GREETINGS_LARRY = [
  "Larry al aparato. La sesión de Tokyo acaba de cerrar — ¿qué movimiento traes? ☕",
  "Soy Larry. He visto subir y caer mercados enteros... ¿qué aviso buscas, amigo mío?",
  "Larry aquí, con el café y las gráficas abiertas. ¿Qué posición traes hoy? 🐕",
  "Soy Larry. El tablón siempre cotiza. ¿Qué aviso te trae por aquí?",
];

export default function EvelynBanner({
  personaje    = 'evelyn',
  avisos_personaje,
  sessionCity,
  genesis      = 0,
  userId       = null,
  autorAlias   = 'Ciudadano',
  realItems    = [],
  stripVisible, stripCards, stripLabel,
  onAvisoConectar,
  onAvisoPublicar,
  setProjectingUser,
  onHandoff,
  iaMode  = 'off',
  isAdmin = false,
}) {
  const personajeActivo = (avisos_personaje || personaje || 'evelyn').toLowerCase();

  const { mensaje, loading, enviar, avisoEnConstruccion, setAvisoEnConstruccion, esPatrocinado } = useAgentEvelyn({
    personaje:   personajeActivo,
    iaMode,
    isAdmin,
    onHandoff,
    onAvisoConectar,
    onAvisoPublicar,
    ciudad:      sessionCity,
    genesis,
    userId,
    autorAlias,
  });

  const [display, setDisplay]             = useState('');
  const [cursor, setCursor]               = useState(true);
  const [currentMsg, setCurrentMsg]       = useState('');
  const [selectedCard, setSelectedCard]   = useState(null);
  const [esperandoConexion, setEsperandoConexion] = useState(false);
  const [esperandoImagen, setEsperandoImagen] = useState(false);
  const [subiendoBanner, setSubiendoBanner] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const fileInputRef = useRef(null);
  const charIdx = useRef(0);

  const esLarry         = personajeActivo === 'larry';
  const GREETINGS       = esLarry ? GREETINGS_LARRY : GREETINGS_EVELYN;

  const colorPrimario   = esLarry ? '#0C21C2' : '#161AF9';
  const colorSecundario = esLarry ? '#1E2D94' : '#3552B8';
  const colorTexto      = esLarry ? '#AAB9FE' : '#748BFD';
  const glowColor       = esLarry ? 'rgba(12,14,194,0.5)' : 'rgba(22,25,250,0.5)';

  const INFO = {
    evelyn: { nombre: 'EVELYN', icono: '🐺' },
    larry:  { nombre: 'LARRY',  icono: '🐶' },
  };
  const { nombre: nombrePersonaje, icono: iconoPersonaje } = INFO[personajeActivo] || INFO.evelyn;

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setCurrentMsg(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  }, [personaje]);

  useEffect(() => {
    if (mensaje) {
      setCurrentMsg(mensaje);
      setSelectedCard(null);
      setEsperandoConexion(false);
    }
  }, [mensaje]);

  useEffect(() => {
    if (!currentMsg) return;
    charIdx.current = 0;
    setDisplay('');
    const t = setInterval(() => {
      charIdx.current++;
      setDisplay(currentMsg.slice(0, charIdx.current));
      if (charIdx.current >= currentMsg.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, [currentMsg]);

  useEffect(() => {
    if (
      avisoEnConstruccion?.tipo &&
      avisoEnConstruccion?.titulo &&
      avisoEnConstruccion?.contenido &&
      !avisoEnConstruccion?.banner_avi_checked
    ) {
      setEsperandoImagen(true);
    }
  }, [avisoEnConstruccion]);

  const handleCardClick = (card) => {
    if (selectedCard?.bro_pd === card.bro_pd) {
      setSelectedCard(null);
      setEsperandoConexion(false);
      return;
    }
    setSelectedCard(card);
    setEsperandoConexion(false);
  };

  const handleEnviar = (texto) => {
    setSelectedCard(null);
    setEsperandoConexion(false);
    
    console.log('EvelynBanner handleEnviar:', {
      texto,
      avisoEnConstruccion,
      camposCompletos: !!(avisoEnConstruccion?.tipo && avisoEnConstruccion?.titulo && avisoEnConstruccion?.contenido),
      esperandoImagen,
    });
    
    // Si el aviso ya tiene los 3 campos, bloquear y mostrar subida de banner
    if (
      avisoEnConstruccion?.tipo &&
      avisoEnConstruccion?.titulo &&
      avisoEnConstruccion?.contenido
    ) {
      console.log('Bloqueando chat, activando esperandoImagen');
      setEsperandoImagen(true);
      return;
    }
    
    enviar(texto);
  };

  const handleConectar = () => {
    if (!selectedCard) return;
    if (genesis < 200) {
      setCurrentMsg('No tienes suficientes génesis. Necesitas 200 para conectar.');
      setSelectedCard(null);
      return;
    }
    setEsperandoConexion(true);
  };

  const handleConfirmar = () => {
    if (!selectedCard) return;
    onAvisoConectar?.({
      id:      selectedCard.aviso_id || selectedCard.bro_pd,
      user_id: selectedCard.user_id,
      title:   selectedCard.titulo,
    });
    const autorProfile = realItems.find(i => i.id === selectedCard.user_id);
    if (autorProfile && setProjectingUser) setProjectingUser(autorProfile);
    setCurrentMsg('Conectado. El autor recibirá tu mensaje. 🐺');
    setSelectedCard(null);
    setEsperandoConexion(false);
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Solo se permite JPEG, PNG o WebP');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe pesar máximo 2MB');
      e.target.value = '';
      return;
    }

    setBannerFile(file);
    setEsperandoImagen(true);
  };

  const handleUploadBanner = async () => {
    if (!bannerFile) return;
    setSubiendoBanner(true);

    try {
      const safeFileName = `${Date.now()}-${bannerFile.name.replace(/\s+/g, '_')}`;
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: safeFileName, fileType: bannerFile.type }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error('Error HTTP ' + res.status + ': ' + errorText);
      }

      const { uploadUrl } = await res.json();
      if (!uploadUrl) throw new Error('Sin ticket de subida');

      await fetch(uploadUrl, {
        method: 'PUT',
        body: bannerFile,
        headers: { 'Content-Type': bannerFile.type },
      });

      const publicUrl = `https://media.bro7vision.com/avisos/${safeFileName}`;
      setAvisoEnConstruccion(prev => ({ ...prev, banner_avi: publicUrl, banner_avi_checked: true }));
      setEsperandoImagen(false);
      setBannerFile(null);

    } catch (err) {
      console.error('Error subida:', err);
      alert('❌ Error: ' + err.message);
    } finally {
      setSubiendoBanner(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSkipBanner = () => {
    setAvisoEnConstruccion(prev => ({ ...prev, banner_avi: null, banner_avi_checked: true }));
    setEsperandoImagen(false);
    setBannerFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const avisoParaPreview = avisoEnConstruccion
    ? { ...avisoEnConstruccion, ciudad: sessionCity || '' }
    : null;

  const CAMPOS_AVISO = ['tipo', 'titulo', 'contenido'];
  const labelCampo = (c) => ({ tipo: 'Tipo', titulo: 'Título', contenido: 'Descripción' }[c] || '');
  const campoActual = avisoEnConstruccion
    ? CAMPOS_AVISO.find(c => !avisoEnConstruccion[c]) || 'confirmar'
    : null;

  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
      <style>{`
        @keyframes neonPulseAvisos {
          0%, 100% { text-shadow: 0 0 8px ${colorPrimario}, 0 0 22px ${colorSecundario}, 0 0 45px ${colorSecundario}; }
          50%       { text-shadow: 0 0 4px ${colorSecundario}, 0 0 10px ${colorSecundario}; }
        }
        @keyframes avDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
        .av-loading { display: inline-flex; gap: 4px; align-items: center; }
        .av-loading span {
          width: 6px; height: 6px; border-radius: 50%; background: ${colorPrimario};
          animation: avDot 1.2s ease-in-out infinite;
        }
        .av-loading span:nth-child(2) { animation-delay: 0.2s; }
        .av-loading span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .av-step { animation: stepIn 0.25s ease both; }
        .av-texto {
          color: ${colorTexto};
          font-style: italic; font-weight: 900; text-transform: uppercase;
          font-size: clamp(13px, 2.2vw, 18px); line-height: 1.5;
          animation: neonPulseAvisos 3s ease-in-out infinite;
        }
      `}</style>

      {/* 1. CARRUSEL */}
      {stripVisible && (
        <div className="w-full max-w-2xl pointer-events-auto px-2 mb-3">
          <BroCardStrip
            cards={stripCards}
            onSelectCard={handleCardClick}
            accentColor="blue"
            label={stripLabel}
            visible={stripVisible}
          />
        </div>
      )}

      {/* 2. INDICADOR DE PROGRESO — solo durante construcción */}
      {avisoEnConstruccion && campoActual && (
        <div className="flex items-center gap-2 w-full max-w-2xl px-2 mb-2">
          {CAMPOS_AVISO.map((campo) => {
            const completado = !!avisoEnConstruccion[campo];
            const activo     = campo === campoActual;
            return (
              <div key={campo} className="av-step flex items-center gap-1.5">
                <div style={{
                  width: activo ? '10px' : '8px', height: activo ? '10px' : '8px',
                  borderRadius: '50%',
                  background: completado ? colorPrimario : activo ? colorTexto : `${colorPrimario}33`,
                  boxShadow: activo ? `0 0 8px ${colorPrimario}` : 'none',
                  transition: 'all 0.3s ease',
                }} />
                <span style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: completado ? colorPrimario : activo ? colorTexto : `${colorPrimario}44`,
                  transition: 'all 0.3s ease',
                }}>
                  {labelCampo(campo)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 2.5. SUBIDA DE BANNER — condicional */}
      {esperandoImagen && (
        <div className="w-full max-w-2xl px-2 mb-2 pointer-events-auto">
          <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 p-4">
            <div className="flex flex-col items-center gap-3">
              <p style={{
                color: colorTexto,
                fontSize: '10px',
                fontWeight: 900,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>
                ◈ Banner Visual (Opcional)
              </p>

              {!bannerFile ? (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '10px 24px',
                      background: `${colorPrimario}22`,
                      border: `1px solid ${colorPrimario}88`,
                      borderRadius: '1.5rem',
                      color: colorTexto,
                      fontWeight: 900,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      cursor: 'pointer',
                      boxShadow: `0 0 16px ${glowColor}`,
                    }}
                  >
                    ◈ SUBIR BANNER
                  </button>
                  <button
                    onClick={handleSkipBanner}
                    style={{
                      padding: '10px 24px',
                      background: 'transparent',
                      border: `1px solid ${colorPrimario}44`,
                      borderRadius: '1.5rem',
                      color: colorTexto,
                      fontWeight: 900,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      cursor: 'pointer',
                    }}
                  >
                    SALTAR
                  </button>
                </>
              ) : (
                <>
                  <div className="relative w-full max-w-xs">
                    <img
                      src={URL.createObjectURL(bannerFile)}
                      alt="Preview"
                      className="w-full rounded-lg border border-white/10"
                      style={{ maxHeight: '200px', objectFit: 'contain' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.75)',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      fontSize: '9px',
                      fontWeight: 900,
                      color: '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      {(bannerFile.size / 1024).toFixed(0)} KB
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'center' }}>
                    <button
                      onClick={handleSkipBanner}
                      style={{
                        padding: '8px 20px',
                        background: 'transparent',
                        border: `1px solid ${colorPrimario}44`,
                        borderRadius: '1.5rem',
                        color: colorTexto,
                        fontWeight: 900,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                      }}
                    >
                      CAMBIAR
                    </button>
                    <button
                      onClick={handleUploadBanner}
                      disabled={subiendoBanner}
                      style={{
                        padding: '8px 20px',
                        background: subiendoBanner ? `${colorPrimario}44` : `${colorPrimario}88`,
                        border: `1px solid ${colorPrimario}`,
                        borderRadius: '1.5rem',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        cursor: subiendoBanner ? 'not-allowed' : 'pointer',
                        opacity: subiendoBanner ? 0.6 : 1,
                        boxShadow: subiendoBanner ? 'none' : `0 0 16px ${glowColor}`,
                      }}
                    >
                      {subiendoBanner ? '⏳ Subiendo...' : '✓ CONFIRMAR'}
                    </button>
                  </div>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBannerSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. BANNER */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div
          className="w-full flex flex-col items-center justify-center text-center"
          style={{
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${colorPrimario}55`,
            borderRadius: '1.5rem',
            padding: '18px 32px 20px',
            boxShadow: `0 0 24px ${glowColor}, inset 0 0 12px rgba(0,0,0,0.4)`,
            minHeight: '90px',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Sin mensaje ni card */}
          {!currentMsg && !selectedCard && !loading && (
            <div className="flex items-center gap-2">
              <p style={{ color: `${colorPrimario}99`, fontSize: 10, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                ◈ {nombrePersonaje} · AVISOS
              </p>
              {esPatrocinado && (
                <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#000', background: '#FACC15', borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase' }}>
                  PATROCINADO
                </span>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && !selectedCard && (
            <div className="av-loading"><span /><span /><span /></div>
          )}

          {/* Card seleccionada */}
          {selectedCard && !loading && (
            <div className="w-full flex flex-col items-center gap-3">
              <span style={{
                fontSize: 10, fontWeight: 900, letterSpacing: '0.2em',
                textTransform: 'uppercase', padding: '3px 14px',
                border: `1px solid ${colorPrimario}55`,
                borderRadius: '999px',
                color: selectedCard.categoria === 'OFERTA' ? '#00FF9C' : '#00C3FF',
              }}>
                {selectedCard.categoria}
              </span>

              <p style={{
                color: '#fff', fontWeight: 900, fontStyle: 'italic',
                textTransform: 'uppercase',
                fontSize: 'clamp(14px, 2vw, 18px)',
                lineHeight: 1.3,
                textShadow: `0 0 16px ${glowColor}`,
              }}>
                {selectedCard.titulo}
              </p>

              <p style={{
                color: colorTexto, fontWeight: 900, fontStyle: 'italic',
                textTransform: 'uppercase',
                fontSize: 'clamp(12px, 1.6vw, 15px)',
                lineHeight: 1.5,
                textShadow: `0 0 12px ${glowColor}`,
              }}>
                {selectedCard.descripcion}
                <span style={{ opacity: cursor ? 1 : 0 }}>_</span>
              </p>

              {!esperandoConexion ? (
                <button
                  onClick={handleConectar}
                  style={{
                    marginTop: 4,
                    padding: '10px 28px',
                    background: `${colorPrimario}22`,
                    border: `1px solid ${colorPrimario}88`,
                    borderRadius: '1.5rem',
                    color: colorTexto,
                    fontWeight: 900, fontSize: 12,
                    textTransform: 'uppercase', letterSpacing: '0.15em',
                    cursor: 'pointer',
                    boxShadow: `0 0 16px ${glowColor}`,
                  }}
                >
                  ◈ CONECTAR · 200 GÉNESIS
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    onClick={handleConfirmar}
                    style={{
                      padding: '10px 24px',
                      background: '#00ff8822',
                      border: '1px solid #00ff88',
                      borderRadius: '1.5rem',
                      color: '#00ff88',
                      fontWeight: 900, fontSize: 12,
                      textTransform: 'uppercase', letterSpacing: '0.15em',
                      cursor: 'pointer',
                      boxShadow: '0 0 16px #00ff8844',
                    }}
                  >
                    ✓ CONFIRMAR · 200 GÉNESIS
                  </button>
                  <button
                    onClick={() => { setSelectedCard(null); setEsperandoConexion(false); }}
                    style={{
                      padding: '10px 18px',
                      background: 'transparent',
                      border: `1px solid ${colorPrimario}44`,
                      borderRadius: '1.5rem',
                      color: colorTexto,
                      fontWeight: 900, fontSize: 11,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      cursor: 'pointer',
                    }}
                  >
                    CANCELAR
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mensaje del bot */}
          {!selectedCard && !loading && currentMsg && (
            <p className="av-texto">
              {display}<span style={{ opacity: cursor ? 1 : 0 }}>_</span>
            </p>
          )}
        </div>
      </div>

      {/* 4. INPUT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        <AgentChatInput agent="evelyn" onSend={handleEnviar} isLoading={loading} />
      </div>
    </div>
  );
}
