import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

export const MODEL_COLORS = {
  '10': '#888888',
  '15': '#c8ccd8',
  '20': '#2a4fcc',
  '25': '#c8960a',
  '30': '#7a35c8',
  '40': '#c01a1a',
  'envio1': '#009940',
  'envio2': '#009940',
  'envio3': '#009940',
  '100': '#6600cc',
  'regalo5': '#cc6600',
  'regalo10': '#cc6688',
};

const StickerCupon = ({ comercioNombre, tipoBrocard, colorBorde, palabraClave1, aliasUsuario, fechaCaduca, banner_11_url }) => {
  const stickerRef = useRef(null);

  const toProxyUrl = (url) => {
    if (!url) return url;
    return url.replace('https://media.bro7vision.com', '/r2-proxy');
  };

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
      width: 500,
      height: 220,
      scale: 2,
      backgroundColor: '#0d0d1a',
      useCORS: true,
      allowTaint: false,
      logging: true,
    });

    if (bannerDiv && originalBg) {
      bannerDiv.style.background = originalBg;
    }
    const link = document.createElement('a');
    link.download = `sticker-${aliasUsuario || 'cupon'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      <div
        ref={stickerRef}
        style={{
          width: 500,
          height: 220,
          background: 'linear-gradient(145deg, #EDC7D3 0%, #F5F0E8 35%, #D4D9A0 65%, #B8CC6E 100%)',
          boxShadow: 'inset 0 0 80px rgba(184,204,110,0.12), 0 0 25px rgba(237,199,211,0.15)',
          borderRadius: 16,
          display: 'flex',
          overflow: 'hidden',
          fontFamily: "'Exo 2', sans-serif",
        }}
      >
        <div style={{
          width: '30%',
          height: '100%',
          padding: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src="/images/brovisionlogo.webp"
            alt="Bro7Vision"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))',
            }}
          />
        </div>

        <div style={{
          width: '35%',
          height: '100%',
          padding: '10px 12px 10px 6px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 4,
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.15 }}>
            {comercioNombre}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#cc6688' }}>
            {tipoBrocard}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#cc6688', letterSpacing: '0.5px' }}>
            {'\uD83D\uDD11'} {palabraClave1}
          </div>
          <div style={{ fontSize: 14, color: '#333333' }}>
            @{aliasUsuario}
          </div>
          <div style={{ fontSize: 12, color: '#444444' }}>
            Caduca: {fechaCaduca}
          </div>
          <div style={{ fontSize: 11, color: '#555555' }}>
            bro7vision.com
          </div>
        </div>

        <div data-banner style={{
          width: '35%',
          height: '100%',
          overflow: 'hidden',
          background: banner_11_url ? `#1a1a2e url(${banner_11_url}) center / cover no-repeat` : '#1a1a2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {!banner_11_url && (
<div style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 11,
              color: '#444',
              textAlign: 'center',
              padding: 8,
            }}>
              Sin imagen
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleDownload}
          className="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-full border border-fuchsia-500/30 transition-all">
          {'\u2B07'} Descargar Sticker
        </button>
      </div>
    </div>
  );
};

export default StickerCupon;