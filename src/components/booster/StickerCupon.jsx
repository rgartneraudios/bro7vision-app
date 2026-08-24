import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const BORDE_COLOR = {
  PLATA:    '#c8ccd8',
  ORO:      '#c8960a',
  DIAMANTE: '#7a35c8',
  LUNA100:  '#9900cc',
};

const TIPO_LABEL = {
  PLATA:    'REGALO PLATA',
  ORO:      'REGALO ORO',
  DIAMANTE: 'PREMIO DIAMANTE',
  LUNA100:  '100% REGALO',
};

const StickerCupon = ({
  comercioNombre,
  claveSecreta,
  aliasUsuario,
  fechaCaduca,
  banner_11_url,
  tipoTarjeta,
  valorEuros,
  costeLunas,
  descripcion,
  compraMinima,
  usado,
}) => {
  const [flipped, setFlipped] = useState(false);
  const stickerRef = useRef(null);

  const borde    = BORDE_COLOR[tipoTarjeta]  || '#888';
  const tipoLabel = TIPO_LABEL[tipoTarjeta]  || tipoTarjeta;

  const toProxyUrl = (url) =>
    url ? url.replace('https://media.bro7vision.com', '/r2-proxy') : url;

  const handleDownload = async () => {
    if (!stickerRef.current) return;
    const bannerDiv = stickerRef.current.querySelector('[data-banner]');
    const originalBg = bannerDiv?.style.background;
    if (bannerDiv && banner_11_url) {
      const proxyUrl = toProxyUrl(banner_11_url);
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          bannerDiv.style.background = `#1a1a2e url(${proxyUrl}) center / cover no-repeat`;
          resolve();
        };
        img.onerror = resolve;
        img.src = proxyUrl;
      });
    }
    const canvas = await html2canvas(stickerRef.current, {
      width: 500, height: 220, scale: 2,
      backgroundColor: '#0d0d1a',
      useCORS: true, allowTaint: false,
    });
    if (bannerDiv && originalBg !== undefined) bannerDiv.style.background = originalBg;
    const link = document.createElement('a');
    link.download = `sticker-${aliasUsuario || 'cupon'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-3">

      {/* Sticker flippable */}
      <div
        style={{ width: 500, height: 220, perspective: 1000, cursor: 'pointer' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div style={{
          width: '100%', height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.4,0.2,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>

          {/* ── ANVERSO ── */}
          <div ref={stickerRef} style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden',
            background: 'url(/images/cards/sticker_bg.webp) center / cover no-repeat',
            boxShadow: `inset 0 0 80px rgba(0,0,0,0.4), 0 0 0 2px ${borde}, 0 0 18px ${borde}55`,
            borderRadius: 16,
            display: 'flex', overflow: 'hidden',
            fontFamily: "'Exo 2', sans-serif",
          }}>
            {/* Logo Bro7Vision */}
            <div style={{
              width: '30%', height: '100%', padding: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src="/images/brovisionlogo.webp" alt="Bro7Vision"
                style={{ width: '100%', height: '100%', objectFit: 'contain',
                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' }} />
            </div>

            {/* Datos centrales */}
            <div style={{
              width: '35%', height: '100%', padding: '10px 12px 10px 6px',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', textAlign: 'center', gap: 4,
            }}>
              {/* Nombre comercio */}
              <div style={{
                fontSize: 22, fontWeight: 800, lineHeight: 1.15,
                color: 'transparent',
                background: 'linear-gradient(180deg,#FFFFFF 30%,#B0B0B0 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}>{comercioNombre}</div>

              {/* Tipo label */}
              <div style={{
                fontSize: 14, fontWeight: 700,
                color: borde,
                textShadow: `0 0 8px ${borde}88`,
                letterSpacing: 1,
              }}>{tipoLabel}</div>

              {/* Clave secreta */}
              <div style={{
                fontSize: 20, fontWeight: 800, letterSpacing: '0.5px',
                color: 'transparent',
                background: 'linear-gradient(180deg,#FFFFFF 30%,#B0B0B0 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}>🔑 {claveSecreta}</div>

              {/* Alias */}
              <div style={{
                fontSize: 14,
                color: 'transparent',
                background: 'linear-gradient(180deg,#FFFFFF 30%,#B0B0B0 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>@{aliasUsuario}</div>

              {/* Caduca */}
              <div style={{ fontSize: 12, color: '#C0C0C0',
                textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                Caduca: {fechaCaduca || '—'}
              </div>
              <div style={{ fontSize: 11, color: '#909090' }}>bro7vision.com</div>
            </div>

            {/* Banner comercio */}
            <div data-banner style={{
              width: '35%', height: '100%', overflow: 'hidden',
              position: 'relative',
              background: banner_11_url
                ? `#1a1a2e url(${banner_11_url}) center / cover no-repeat`
                : '#1a1a2e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {!banner_11_url && (
                <div style={{ fontSize: 11, color: '#444', textAlign: 'center', padding: 8 }}>
                  Sin imagen
                </div>
              )}
              {(valorEuros != null || costeLunas != null) && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0.65) 100%)',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 6px 8px',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    {valorEuros != null && (
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#fff',
                        textShadow: '0 0 8px rgba(255,255,255,0.6)', lineHeight: 1.1 }}>
                        {valorEuros} €
                      </div>
                    )}
                    <div style={{ fontSize: 10, fontWeight: 700,
                      color: 'rgba(255,255,255,0.85)', letterSpacing: 2,
                      textTransform: 'uppercase', textShadow: '0 0 6px rgba(255,255,255,0.5)' }}>
                      {tipoLabel}
                    </div>
                  </div>
                  {costeLunas != null && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#fff',
                      textShadow: '0 0 6px rgba(255,255,255,0.5)', textAlign: 'center' }}>
                      🌙 {costeLunas.toLocaleString()} Lunas
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── REVERSO ── */}
          <div style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg,#0d0d1a 0%,#1a0a2e 50%,#0d0d1a 100%)',
            boxShadow: `0 0 0 2px ${borde}, 0 0 18px ${borde}55`,
            borderRadius: 16,
            fontFamily: "'Exo 2', sans-serif",
            padding: '18px 24px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            {/* Cabecera reverso */}
            <div style={{ display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: borde,
                  letterSpacing: 2, textTransform: 'uppercase' }}>
                  {tipoLabel}
                </div>
                {valorEuros != null && (
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                    {valorEuros} €
                  </div>
                )}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 14px',
                borderRadius: 20,
                color:   usado ? '#4ade80' : '#facc15',
                border: `1px solid ${usado ? 'rgba(74,222,128,0.3)' : 'rgba(250,204,21,0.3)'}`,
                background: usado ? 'rgba(74,222,128,0.08)' : 'rgba(250,204,21,0.08)',
                whiteSpace: 'nowrap',
              }}>
                {usado ? '✅ Usado' : '🟡 Pendiente'}
              </span>
            </div>

            {/* Descripción */}
            {descripcion && (
              <p style={{
                fontSize: 11, color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.5, margin: 0,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              }}>{descripcion}</p>
            )}

            {/* Compra mínima */}
            {compraMinima && (
              <div style={{ fontSize: 10, color: '#f5b800', fontWeight: 700 }}>
                🛒 Compra mínima: {compraMinima}€
              </div>
            )}

            {/* Nota Diamante */}
            {tipoTarjeta === 'DIAMANTE' && (
              <div style={{
                fontSize: 9, color: 'rgba(180,80,255,0.7)',
                background: 'rgba(180,80,255,0.06)',
                border: '1px solid rgba(180,80,255,0.2)',
                borderRadius: 8, padding: '6px 10px', lineHeight: 1.5,
              }}>
                💎 ¿Incidencia con tu premio? Escríbenos a hola@bro7vision.com — tienes 30 días para reclamarlo.
              </div>
            )}

            {/* Caduca + alias */}
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                Caduca: {fechaCaduca || '—'}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                @{aliasUsuario}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Botón descargar — fuera del sticker flippable */}
      <div className="flex justify-end">
        <button onClick={handleDownload}
          className="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-full border border-fuchsia-500/30 transition-all">
          ⬇ Descargar Sticker
        </button>
      </div>

    </div>
  );
};

export default StickerCupon;