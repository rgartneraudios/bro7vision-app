import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SlideRailCanjear from './SlideRailCanjear';
import CityLocationBanner from './CityLocationBanner';
import { getVideoForLocation } from '../data/VideoMap';
import { useCanjearCupon } from '../hooks/useCanjearCupon';

const TAB_COLORS = {
  CERCANIAS: '#FF6B00',
  NACIONAL: '#39FF14',
  INTERNACIONAL: '#E10098',
};

const TAB_TEXT_COLORS = {
  CERCANIAS: '#fff',
  NACIONAL: '#000',
  INTERNACIONAL: '#fff',
};

const LUNA_STYLES = {
  PLATA: {
    bgCard:    'linear-gradient(170deg, #e8eaf0 0%, #f8f9fc 40%, #d0d4e0 70%, #c8ccd8 100%)',
    border:    'linear-gradient(135deg, #a0a8b8, #e0e4f0, #8090a8)',
    color:     '#4a5068',
    colorText: '#2a3048',
    badge:     'Luna de Plata',
    tierGrad:  'linear-gradient(135deg, #8090a8 0%, #d0d8e8 40%, #f0f4ff 60%, #9098b0 100%)',
    lunasBg:   'rgba(160,168,184,0.15)',
    lunasBorder: 'rgba(160,168,184,0.4)',
    shimmer:   'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.7) 50%, transparent 65%)',
  },
  ORO: {
    bgCard:    'linear-gradient(170deg, #f5e6b0 0%, #fdf5d0 40%, #e8c870 70%, #d4a830 100%)',
    border:    'linear-gradient(135deg, #c8960a, #ffe566, #a07808)',
    color:     '#7a5800',
    colorText: '#4a3400',
    badge:     'Luna de Oro',
    tierGrad:  'linear-gradient(135deg, #c8960a 0%, #ffe566 40%, #ffd040 60%, #c89010 100%)',
    lunasBg:   'rgba(200,150,10,0.12)',
    lunasBorder: 'rgba(200,150,10,0.35)',
    shimmer:   'linear-gradient(105deg, transparent 35%, rgba(255,240,150,0.7) 50%, transparent 65%)',
  },
  DIAMANTE: {
    bgCard:    'linear-gradient(170deg, #1a0a2e 0%, #2d1050 40%, #4a1878 70%, #1a0838 100%)',
    border:    'linear-gradient(135deg, #9040e0, #d090ff, #6020b0)',
    color:     '#d090ff',
    colorText: '#f0d0ff',
    badge:     'Luna de Diamante',
    tierGrad:  'linear-gradient(135deg, #9040e0 0%, #d090ff 40%, #ff90f0 60%, #8030d0 100%)',
    lunasBg:   'rgba(180,80,255,0.15)',
    lunasBorder: 'rgba(180,80,255,0.4)',
    shimmer:   'linear-gradient(105deg, transparent 35%, rgba(220,150,255,0.5) 50%, transparent 65%)',
  },
  '100': {
    bgCard:    'linear-gradient(170deg, #ffffff 0%, #f8f0ff 30%, #fff0f8 60%, #f0f8ff 100%)',
    border:    'linear-gradient(135deg, #ff80c0, #c080ff, #80c0ff)',
    color:     '#8040a0',
    colorText: '#4a2060',
    badge:     'Luna 100',
    tierGrad:  'linear-gradient(135deg, #ff60a0 0%, #c060ff 33%, #60c0ff 66%, #ff60c0 100%)',
    lunasBg:   'rgba(180,80,220,0.08)',
    lunasBorder: 'rgba(180,80,220,0.3)',
    shimmer:   'linear-gradient(105deg, transparent 35%, rgba(220,180,255,0.6) 50%, transparent 65%)',
  },
};

const CARD_ASSETS = {
  PLATA:    { 'ENVIO_GRATIS':'plata-envio','3':'plata-3','5':'plata-5','10':'plata-10','20':'plata-20','40':'plata-40','60':'plata-60','100':'plata-100','200':'plata-200' },
  ORO:      { '5':'oro-5','10':'oro-10','20':'oro-20','40':'oro-40','60':'oro-60','100':'oro-100','200':'oro-200' },
  DIAMANTE: { '200':'diamante-200','500':'diamante-500','1000':'diamante-1000' },
  '100':    { '100pct':'luna100' },
};

function HeaderWidget() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [temp, setTemp] = useState(null);
  const [city, setCity] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2,'0');
      const m = now.getMinutes().toString().padStart(2,'0');
      setTime(`${h}:${m}`);
      const dias  = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
      const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
      setDate(`${dias[now.getDay()]} ${now.getDate()} ${meses[now.getMonth()]}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const d = await r.json();
        setTemp(Math.round(d.current_weather?.temperature ?? null));
        const g = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const gd = await g.json();
        setCity((gd.address?.city || gd.address?.town || '').toUpperCase());
      } catch(_) {}
    }, ()=>{}, { timeout: 8000 });
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', justifyContent: 'space-between',
      padding: '12px 24px', pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(32px, 4vw, 60px)',
          lineHeight: 1, letterSpacing: '0.04em',
          color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.4)',
        }}>{time}</span>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 14, letterSpacing: '0.25em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
        }}>{date}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {temp !== null ? (
          <>
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(32px, 4vw, 60px)',
              lineHeight: 1, letterSpacing: '0.04em',
              color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.4)',
            }}>{temp}°</span>
            {city && (
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 14, letterSpacing: '0.25em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
              }}>{city}</span>
            )}
          </>
        ) : (
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 14, letterSpacing: '0.25em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
          }}>...</span>
        )}
      </div>
    </div>
  );
}

function CuponModal({ cupon, onClose, onCanjear }) {
  if (!cupon) return null;
  const estilo = LUNA_STYLES[cupon.tipo_tarjeta] || LUNA_STYLES['PLATA'];
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#111',
        border: `1px solid ${estilo.border}55`,
        borderRadius: 16, padding: '3rem',
        maxWidth: 480, width: '90%',
        boxShadow: `0 0 40px ${estilo.border}33`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        fontFamily: "'Exo 2', sans-serif",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase', color: estilo.color,
          border: `0.5px solid ${estilo.border}`, borderRadius: 20,
          padding: '3px 14px', background: `${estilo.border}22`,
        }}>
          {estilo.badge}
        </span>

        <span style={{ fontSize: 56, fontWeight: 900, color: estilo.color,
          textShadow: `0 0 30px ${estilo.border}88`, lineHeight: 1 }}>
          {cupon.valor_euros != null ? `${cupon.valor_euros}€` : '—'}
        </span>

        <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
          {cupon.comercio_nombre}
        </span>

        {cupon.tipo_tarjeta === 'PLATA' && cupon.compra_minima && (
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            Compra mínima: {cupon.compra_minima}€
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
          background: `${estilo.border}22`, borderRadius: 20, padding: '6px 20px' }}>
          <span>🌙</span>
          <span style={{ color: estilo.color, fontWeight: 700, fontSize: 16 }}>
            {(cupon.coste_lunas || 0).toLocaleString()} Lunas
          </span>
        </div>

        {cupon.emision_total && (
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            Quedan {cupon.emision_total - cupon.emision_usada} unidades
          </span>
        )}

        <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 8 }}>
          <button onClick={() => { onClose(); onCanjear(cupon); }} style={{
            flex: 1, padding: '12px 0',
            background: estilo.color, color: '#000',
            fontWeight: 900, fontSize: 13, border: 'none', borderRadius: 10,
            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
            boxShadow: `0 0 16px ${estilo.border}66`,
          }}>
            CANJEAR →
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 0', background: 'transparent', color: '#888',
            fontSize: 13, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10,
            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CanjearStrip({ scope }) {
  const [activeTab, setActiveTab] = useState('CERCANIAS');
  const [cupones, setCupones] = useState([]);
  const [selectedCupon, setSelectedCupon] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [flippedId, setFlippedId] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const videoUrl = getVideoForLocation(scope);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [userCityCode, setUserCityCode] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchCity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: perfil } = await supabase
        .from('profiles')
        .select('city')
        .eq('id', user.id)
        .single();
      if (perfil?.city) setUserCityCode(perfil.city.toUpperCase());
    };
    fetchCity();
  }, []);

  const { iniciarCanje, estado, cuponActivo, cardPendiente,
    errorMsg, cancelar, confirmar, cerrar } = useCanjearCupon({
    userId,
    onLunasUpdate: (nuevoBalance) => {},
  });

  useEffect(() => {
    const fetchCupones = async () => {
      let query = supabase
        .from('comercio_cupones')
        .select('*')
        .eq('activo', true)
        .eq('estado_canje', 'ACTIVO')
        .or('emision_total.is.null,emision_usada.lt.emision_total');

      if (activeTab === 'CERCANIAS') {
        if (!userCityCode) { setCupones([]); return; }
        query = query.filter('ciudades_cobertura', 'cs', `{${userCityCode}}`);
      } else if (activeTab === 'NACIONAL') {
        query = query.filter('alcance', 'cs', '{GIRA_NACIONAL}');
      } else if (activeTab === 'INTERNACIONAL') {
        query = query.filter('alcance', 'cs', '{GIRA_MUNDIAL}');
      }

      const { data } = await query;
      setCupones(data || []);
    };
    fetchCupones();
  }, [activeTab, userCityCode]);

  const TOTAL_CARDS = cupones.length < 4 ? (cupones.length || 1) : 8;

  const placeholders = Array.from(
    { length: Math.max(0, TOTAL_CARDS - cupones.length) },
    (_, i) => ({ id: `placeholder-${i}`, _placeholder: true })
  );
  const allCards = TOTAL_CARDS < 4 ? cupones : [...cupones, ...placeholders];

  const neonColor = TAB_COLORS[activeTab];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(40,20,0,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #facc15; border-radius: 4px; box-shadow: 0 0 8px #facc15; }
        ::-webkit-scrollbar-thumb:hover { background: #e6b800; }
        * { scrollbar-width: thin; scrollbar-color: #facc15 rgba(40,20,0,0.3); }
        .flip-card-inner {
          transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
          transform-style: preserve-3d;
          position: relative;
          width: 100%; height: 100%;
        }
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .flip-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 12px;
          overflow: hidden;
        }
        .flip-face-back {
          transform: rotateY(180deg);
        }
        @keyframes shimmerCard {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
      <video
        autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      <HeaderWidget />

      <CityLocationBanner scope={scope} />

      <SlideRailCanjear />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        height: '100%', paddingTop: 20, paddingLeft: 'clamp(320px, 22vw, 420px)', paddingRight: 'clamp(320px, 22vw, 420px)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%', maxWidth: '82vw', marginBottom: 16, marginTop: 160 }}>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(28px, 3vw, 48px)',
            color: '#fff',
            textShadow: '0 0 20px rgba(255,255,255,0.3)',
            letterSpacing: '0.03em',
            lineHeight: 1,
          }}>
            CANJES DE LUNAS
          </span>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 }}>
            {['CERCANIAS', 'NACIONAL', 'INTERNACIONAL'].map(tab => {
              const c = TAB_COLORS[tab];
              const tc = TAB_TEXT_COLORS[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    background: isActive ? c : 'transparent',
                    color: isActive ? tc : 'rgba(255,255,255,0.4)',
                    fontWeight: 900,
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textShadow: isActive ? `0 0 20px ${c}` : 'none',
                    boxShadow: isActive ? `0 0 24px ${c}, inset 0 0 12px ${c}40` : 'none',
                    borderRadius: 8,
                  }}
                >
                  {tab === 'CERCANIAS' ? 'CERCANÍAS' : tab}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            flex: 1, width: '100%', maxWidth: '82vw',
            padding: '16px 32px 32px',
            marginTop: 'clamp(40px, 6vh, 100px)',
            height: '100%',
            alignSelf: 'stretch',
          }}
        >
          {allCards.map(cupon => {
  const esReal = !cupon._placeholder;
  const estilo = LUNA_STYLES[cupon.tipo_tarjeta] || LUNA_STYLES['PLATA'];

  return (
    <div
      key={cupon.id}
      onMouseEnter={() => !isMobile && esReal && setHoveredId(cupon.id)}
      onMouseLeave={() => !isMobile && setHoveredId(null)}
      onClick={() => {
        if (!esReal) return;
        if (isMobile) {
          setFlippedId(flippedId === cupon.id ? null : cupon.id);
        }
      }}
      style={{
        width: isMobile ? 333 : '100%',
        minWidth: isMobile ? 333 : undefined,
        height: 500,
        borderRadius: 12,
        position: 'relative',
        cursor: esReal ? 'pointer' : 'default',
        perspective: '1000px',
        flexShrink: 0,
      }}
    >
      <div className={`flip-card-inner${
        (isMobile ? flippedId === cupon.id : hoveredId === cupon.id) && esReal
          ? ' flipped' : ''
      }`}>

        {/* ── CARA A (frontal) ── */}
        <div
          className="flip-face"
          style={{
            borderRadius: 16, overflow: 'hidden',
          }}
        >
          {esReal ? (
            <>
              {/* Imagen fondo del comercio */}
              {cupon.banner_url && (
                <img src={cupon.banner_url} alt="fondo"
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', zIndex: 0,
                  }} />
              )}

              {/* Overlay asset PNG transparente */}
              {(() => {
                const tierKey = cupon.tipo_tarjeta;
                const valorKey = cupon.valor_euros != null
                  ? String(cupon.valor_euros)
                  : (tierKey === '100' ? '100pct' : 'ENVIO_GRATIS');
                const assetName = CARD_ASSETS[tierKey]?.[valorKey];
                return assetName ? (
                  <img
                    src={`/images/cards/${assetName}.webp`}
                    alt={estilo.badge}
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover', zIndex: 1,
                    }}
                  />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: estilo.bgCard, fontSize: 48,
                  }}>🌙</div>
                );
              })()}
            </>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 8,
            }}>
              <span style={{ color: '#facc15', fontSize: 18, fontWeight: 700, letterSpacing: '0.1em' }}>
                ✦ Próximamente ✦
              </span>
              <span style={{ color: 'rgba(250,204,21,0.4)', fontSize: 11 }}>
                Pronto en tu ciudad
              </span>
            </div>
          )}
        </div>

        {/* ── CARA B (reverso — descripción) ── */}
        {esReal && (
          <div
            className="flip-face flip-face-back"
            style={{
              background: `linear-gradient(160deg, #0a0a0f 0%, #0d0d18 40%, #111120 100%), url(/images/cards/card-back.webp) center/cover no-repeat`,
              border: `2px solid ${estilo.color}`,
              boxShadow: `0 0 32px ${estilo.border}66, inset 0 0 40px ${estilo.border}11`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'space-between',
              padding: '24px 20px 20px',
            }}
          >
            {/* Tier grande */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 4,
                textTransform: 'uppercase', color: estilo.color,
                border: `0.5px solid ${estilo.border}`,
                borderRadius: 20, padding: '3px 14px',
                background: `${estilo.border}22`,
              }}>
                {estilo.badge}
              </span>
              <span style={{
                fontSize: 52, fontWeight: 900, color: estilo.color,
                lineHeight: 1, textShadow: `0 0 30px ${estilo.border}88`,
                fontFamily: "'Exo 2', sans-serif",
              }}>
                {cupon.valor_euros != null ? `${cupon.valor_euros}€` : '—'}
              </span>
            </div>

            {/* Separador */}
            <div style={{
              width: '80%', height: 0.5,
              background: `linear-gradient(90deg,transparent,${estilo.border},transparent)`,
            }} />

            {/* Descripción */}
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              padding: '12px 4px',
            }}>
              <span style={{
                fontSize: 12, color: 'rgba(255,255,255,0.75)',
                textAlign: 'center', lineHeight: 1.6, fontWeight: 500,
              }}>
                {cupon.descripcion || 'Tarjeta de descuento exclusiva. Consulta condiciones con el comercio.'}
              </span>
            </div>

            {/* Compra mínima si es PLATA */}
            {cupon.tipo_tarjeta === 'PLATA' && cupon.compra_minima && (
              <div style={{
                background: `${estilo.border}18`,
                border: `0.5px solid ${estilo.border}44`,
                borderRadius: 10, padding: '6px 16px',
                fontSize: 11, color: estilo.color, fontWeight: 700,
                letterSpacing: 1,
              }}>
                Compra mínima: {cupon.compra_minima}
              </div>
            )}

            {/* Lunas */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: `${estilo.border}22`,
              border: `0.5px solid ${estilo.border}55`,
              borderRadius: 20, padding: '5px 16px',
            }}>
              <span style={{ fontSize: 14 }}>🌙</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: estilo.color }}>
                {(cupon.coste_lunas || 0).toLocaleString()} Lunas
              </span>
            </div>

            {/* Botón canjear */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlippedId(null);
                setHoveredId(null);
                setSelectedCupon(cupon);
              }}
              style={{
                width: '100%', padding: '13px 0',
                background: estilo.color, color: '#000',
                fontWeight: 900, fontSize: 13, border: 'none',
                borderRadius: 10, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.12em',
                boxShadow: `0 0 20px ${estilo.border}88`,
                fontFamily: "'Exo 2', sans-serif",
              }}
            >
              CANJEAR →
            </button>
          </div>
        )}
      </div>
    </div>
  );
})}
        </div>
      </div>

      {selectedCupon && (
        <CuponModal cupon={selectedCupon} onClose={() => setSelectedCupon(null)} onCanjear={iniciarCanje} />
      )}

      {/* Confirmación */}
      {estado === 'confirmando' && cardPendiente && (
        <div onClick={cancelar} style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#111', border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: 16, padding: '2.5rem',
            maxWidth: 400, width: '90%', textAlign: 'center',
            fontFamily: "'Exo 2', sans-serif",
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <span style={{ color: '#facc15', fontSize: 13, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase' }}>
              Confirmar canje
            </span>
            <span style={{ color: '#fff', fontSize: 32, fontWeight: 900 }}>
              {cardPendiente.valor_euros}€
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              {cardPendiente.comercio_nombre}
            </span>
            <div style={{ display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6 }}>
              <span>🌙</span>
              <span style={{ color: '#facc15', fontWeight: 700, fontSize: 15 }}>
                {(cardPendiente.coste_lunas || 0).toLocaleString()} Lunas
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={confirmar} style={{
                flex: 1, padding: '12px 0', background: '#facc15', color: '#000',
                fontWeight: 900, fontSize: 13, border: 'none', borderRadius: 10,
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                CONFIRMAR
              </button>
              <button onClick={cancelar} style={{
                flex: 1, padding: '12px 0', background: 'transparent', color: '#888',
                fontSize: 13, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10,
                cursor: 'pointer', textTransform: 'uppercase',
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cargando */}
      {estado === 'cargando' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)',
        }}>
          <span style={{ color: '#facc15', fontSize: 14, fontWeight: 700,
            letterSpacing: 3, textTransform: 'uppercase',
            fontFamily: "'Exo 2', sans-serif", animation: 'pulse 1s infinite' }}>
            Procesando...
          </span>
        </div>
      )}

      {/* Éxito */}
      {estado === 'exito' && cuponActivo && (
        <div onClick={cerrar} style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#111', border: '1px solid rgba(0,255,140,0.3)',
            borderRadius: 16, padding: '2.5rem',
            maxWidth: 400, width: '90%', textAlign: 'center',
            fontFamily: "'Exo 2', sans-serif",
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <span style={{ fontSize: 40 }}>✅</span>
            <span style={{ color: '#39FF14', fontSize: 13, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase' }}>
              {cuponActivo.ya_existia ? 'Cupón ya activo' : '¡Luna canjeada!'}
            </span>
            <span style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>
              {cuponActivo.valor_euros}€ — {cuponActivo.comercio_nombre}
            </span>
            {cuponActivo.palabra_clave_2 && (
              <div style={{ background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '12px 16px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11,
                  display: 'block', marginBottom: 4, letterSpacing: 2 }}>
                  PALABRA CLAVE SECRETA
                </span>
                <span style={{ color: '#facc15', fontSize: 20, fontWeight: 900,
                  letterSpacing: 4 }}>
                  {cuponActivo.palabra_clave_2}
                </span>
              </div>
            )}
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
              Caduca: {cuponActivo.caduca_legible}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              Encuéntrala también en Booster › Mis Cupones
            </span>
            <button onClick={cerrar} style={{
              padding: '12px 0', background: '#39FF14', color: '#000',
              fontWeight: 900, fontSize: 13, border: 'none', borderRadius: 10,
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
              marginTop: 8,
            }}>
              CERRAR
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {estado === 'error' && (
        <div onClick={cerrar} style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#111', border: '1px solid rgba(255,60,60,0.3)',
            borderRadius: 16, padding: '2.5rem',
            maxWidth: 380, width: '90%', textAlign: 'center',
            fontFamily: "'Exo 2', sans-serif",
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <span style={{ fontSize: 36 }}>⚠️</span>
            <span style={{ color: '#ff4444', fontSize: 13, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase' }}>
              Error en el canje
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              {errorMsg}
            </span>
            <button onClick={cerrar} style={{
              padding: '12px 0', background: 'transparent', color: '#888',
              fontSize: 13, border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10, cursor: 'pointer', textTransform: 'uppercase',
              marginTop: 8,
            }}>
              CERRAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}