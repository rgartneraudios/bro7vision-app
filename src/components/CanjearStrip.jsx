import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SlideRailCanjear from './SlideRailCanjear';
import CityLocationBanner from './CityLocationBanner';
import { getVideoForLocation } from '../data/VideoMap';
import { useCanjearCupon } from '../hooks/useCanjearCupon';
import CuponModal from './CuponModal';

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

const REVERSO_INTRO = {
  PLATA:    (valor) => `Descuento de ${valor}€ en compras con importe mínimo establecido por el comercio.`,
  ORO:      (valor) => `Vale de ${valor}€ de descuento en compra de igual o superior monto. Si el total es mayor pagas la diferencia.`,
  DIAMANTE: (valor) => `Obsequio sorpresa por valor de ${valor}€ o superior. Brovision selecciona y envía el regalo.`,
  '100':    ()      => `Tarjeta con un 100% de descuento en el producto o servicio descrito a continuación.`,
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

export default function CanjearStrip({ scope }) {
  const [activeTab, setActiveTab] = useState('CERCANIAS');
  const [cupones, setCupones] = useState([]);
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
  const [lunasBalance, setLunasBalance] = useState(null);

  // Diamante states
  const [premiosDiamante, setPremiosDiamante] = useState([]);
  const [premioSeleccionado, setPremioSeleccionado] = useState(null);
  const [canjeando, setCanjeando] = useState(null);
  const [estadoCanje, setEstadoCanje] = useState('idle');
  const [resultadoCanje, setResultadoCanje] = useState(null);
  const [errorCanjeDiamante, setErrorCanjeDiamante] = useState('');

  const DIAMANTE_CARD_ASSET = {
  200:  '/images/cards/diamante-200.webp',
  500:  '/images/cards/diamante-500.webp',
  1000: '/images/cards/diamante-1000.webp',
};

  useEffect(() => {
    const fetchCity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: perfil } = await supabase
        .from('profiles')
        .select('city, lunas')
        .eq('id', user.id)
        .single();
      if (perfil?.city) setUserCityCode(perfil.city.toUpperCase());
      if (perfil?.lunas != null) setLunasBalance(perfil.lunas);
    };
    fetchCity();
  }, []);

  const { iniciarCanje, estado, cuponActivo, cardPendiente,
    errorMsg, cancelar, confirmar, cerrar } = useCanjearCupon({
    userId,
    onLunasUpdate: (nuevoBalance) => setLunasBalance(nuevoBalance),
  });

  useEffect(() => {
    const fetchCupones = async () => {
      try {
        let query = supabase
          .from('comercio_cupones')
          .select('*')
          .limit(50);

        const { data: rows, error } = await query;

        if (error) {
          console.error('[CanjearStrip] Error:', error.message);
          setCupones([]);
          return;
        }

        if (!rows || rows.length === 0) { setCupones([]); return; }

        // Filtrar solo tarjetas del sistema nuevo (con tipo_tarjeta) y filtrar por alcance
        const filtradas = rows.filter(r => {
          if (!r.tipo_tarjeta) return false;
          const a = Array.isArray(r.alcance) ? r.alcance : [];
          if (activeTab === 'CERCANIAS') {
            return a.includes('LOCAL') || a.includes('CERCANIAS');
          }
          if (activeTab === 'NACIONAL') return a.includes('NACIONAL');
          if (activeTab === 'INTERNACIONAL') return a.includes('INTERNACIONAL');
          return false;
        });

        if (filtradas.length === 0) { setCupones([]); return; }

        const userIds = [...new Set(filtradas.map(r => r.user_id).filter(Boolean))];
        const { data: solicitudes } = await supabase
          .from('bs_solicitudes')
          .select('user_id, razon_social, email, telefono, web_url')
          .in('user_id', userIds);

        const solMap = {};
        if (solicitudes) solicitudes.forEach(s => { solMap[s.user_id] = s; });

        setCupones(filtradas.map(r => ({
          ...r,
          bs_razon_social: solMap[r.user_id]?.razon_social || r.comercio_nombre || '',
          bs_email:        solMap[r.user_id]?.email        || '',
          bs_telefono:     solMap[r.user_id]?.telefono     || '',
          bs_web:          solMap[r.user_id]?.web_url      || r.web_url         || '',
        })));
      } catch (err) {
        console.error('[CanjearStrip] fetchCupones error:', err);
        setCupones([]);
      }
    };
    fetchCupones();
  }, [activeTab]);

  // Fetch premios Diamante
  useEffect(() => {
    const fetchDiamante = async () => {
      const { data } = await supabase
        .from('diamante_catalogo')
        .select('*')
        .eq('estado', 'ACTIVO')
        .gt('cantidad_disponible', 0);

      if (!data) { setPremiosDiamante([]); return; }

      const filtrados = data.filter(p => {
        const a = Array.isArray(p.alcance) ? p.alcance : ['ES'];
        if (activeTab === 'CERCANIAS')     return a.some(x => x !== 'ES' && x !== 'WW');
        if (activeTab === 'NACIONAL')      return a.includes('ES');
        if (activeTab === 'INTERNACIONAL') return a.includes('WW');
        return false;
      });

      setPremiosDiamante(filtrados);
    };
    fetchDiamante();
  }, [activeTab]);

  const ejecutarCanjeDiamante = async () => {
    if (!canjeando || !userId) return;
    setEstadoCanje('cargando');

    const { data, error } = await supabase.rpc('canjear_diamante', {
      p_premio_id: canjeando.id,
      p_user_id:   userId,
    });

    if (error || !data?.ok) {
      setErrorCanjeDiamante(data?.error || 'Error al canjear.');
      setEstadoCanje('error');
      return;
    }

    setLunasBalance(data.balance_nuevo);
    setResultadoCanje(data);
    setEstadoCanje('exito');
    setPremiosDiamante(prev =>
      prev.map(p => p.id === canjeando.id
        ? { ...p, cantidad_disponible: p.cantidad_disponible - 1 }
        : p
      ).filter(p => p.cantidad_disponible > 0)
    );
  };

  const TOTAL_CARDS = cupones.length < 4 ? Math.max(cupones.length, 1) : 8;

  const placeholders = Array.from(
    { length: Math.max(0, TOTAL_CARDS - cupones.length) },
    (_, i) => ({ id: `placeholder-${i}`, _placeholder: true })
  );
  const allCards = TOTAL_CARDS <= cupones.length ? cupones : [...cupones, ...placeholders];

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
        .cards-scroll {
          display: grid;
          grid-template-columns: repeat(3, 280px);
          gap: 16px;
          justify-content: center;
          align-content: flex-start;
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
        height: '100%', paddingTop: 20, paddingLeft: 0, paddingRight: 0,
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
          className="cards-scroll"
          style={{
            flex: 1, width: '100%', maxWidth: '82vw',
            padding: '16px 0 32px',
            marginTop: 'clamp(40px, 6vh, 100px)',
            marginLeft: 'auto',
            marginRight: 'auto',
            height: '100%', minHeight: 0,
            alignSelf: 'stretch',
            overflowY: 'auto',
          }}
        >
          {cupones.length === 0 ? (
            <div style={{
              width: '100%', textAlign: 'center', paddingTop: 80,
              fontFamily: "'Exo 2', sans-serif",
            }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🌙</span>
              <span style={{
                color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 700,
                letterSpacing: 2, textTransform: 'uppercase',
              }}>
                No hay tarjetas disponibles en {activeTab === 'CERCANIAS' ? 'CERCANÍAS' : activeTab}
              </span>
              <p style={{
                color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8,
                letterSpacing: 1,
              }}>
                Los comercios aún no han publicado tarjetas para esta zona
              </p>
            </div>
          ) : allCards.map(cupon => {
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
        width: isMobile ? 333 : 280,
        minWidth: isMobile ? 333 : 280,
        maxWidth: isMobile ? 333 : 280,
        height: isMobile ? 500 : 440,
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
            borderRadius: 16, overflow: 'hidden', pointerEvents: 'none',
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
            style={{ borderRadius: 16, overflow: 'hidden' }}
          >
            {/* Fondo */}
            <img src="/images/cards/card-back.webp" alt="reverso"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />

            {/* Overlay */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 1,
              background: 'linear-gradient(170deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.75) 100%)',
            }} />

            {/* Contenido */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 14px 14px',
            }}>

              {/* Texto intro por tier */}
              <p style={{
                fontSize: 10, color: 'rgba(255,255,255,0.9)',
                textAlign: 'center', lineHeight: 1.6, fontWeight: 600,
                letterSpacing: 0.3, margin: 0,
              }}>
                {typeof REVERSO_INTRO[cupon.tipo_tarjeta] === 'function'
                  ? REVERSO_INTRO[cupon.tipo_tarjeta](cupon.valor_euros ?? '—')
                  : REVERSO_INTRO[cupon.tipo_tarjeta] || ''}
              </p>

              <div style={{ width: '80%', height: 0.5,
                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }} />

              {/* Datos comercio */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: '#fff',
                  textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' }}>
                  {cupon.bs_razon_social}
                </span>
                {cupon.bs_web && (
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>
                    🌐 {cupon.bs_web.replace(/^https?:\/\//, '')}
                  </span>
                )}
                {cupon.bs_telefono && (
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>
                    📞 {cupon.bs_telefono}
                  </span>
                )}
                {cupon.bs_email && (
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 }}>
                    ✉️ {cupon.bs_email}
                  </span>
                )}
              </div>

              <div style={{ width: '80%', height: 0.5,
                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }} />

              {/* Descripción libre */}
              {cupon.descripcion && (
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)',
                  textAlign: 'center', lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>
                  {cupon.descripcion}
                </p>
              )}

              {/* Compra mínima — solo PLATA */}
              {cupon.tipo_tarjeta === 'PLATA' && cupon.compra_minima && (
                <div style={{ background: 'rgba(255,255,255,0.1)',
                  border: '0.5px solid rgba(255,255,255,0.2)',
                  borderRadius: 8, padding: '3px 10px',
                  fontSize: 9, color: '#fff', fontWeight: 700, letterSpacing: 1 }}>
                  Compra mínima: {cupon.compra_minima}
                </div>
              )}

              {/* Palabra clave pública */}
              {cupon.palabra_clave_1 && (
                <div style={{ background: 'rgba(255,255,255,0.08)',
                  border: '0.5px solid rgba(255,255,255,0.2)',
                  borderRadius: 8, padding: '3px 10px', textAlign: 'center' }}>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)',
                    display: 'block', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
                    Presenta esta palabra
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: 3 }}>
                    {cupon.palabra_clave_1}
                  </span>
                </div>
              )}

              {/* Botón canjear */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFlippedId(null);
                  setHoveredId(null);
                  iniciarCanje(cupon);
                }}
                style={{
                  width: '100%', padding: '11px 0',
                  background: estilo.color, color: '#000',
                  fontWeight: 900, fontSize: 11, border: 'none',
                  borderRadius: 10, cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  fontFamily: "'Exo 2', sans-serif",
                }}
              >
                CANJEAR →
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
})}

          {/* ── TARJETAS DIAMANTE ── */}
          {premiosDiamante.map(premio => {
            const isFlipped = isMobile ? flippedId === premio.id : hoveredId === premio.id;
            const saldoTras = (lunasBalance || 0) - premio.lunas_canje;

            return (
              <div
                key={premio.id}
                onMouseEnter={() => !isMobile && setHoveredId(premio.id)}
                onMouseLeave={() => !isMobile && setHoveredId(null)}
                onClick={() => isMobile && setFlippedId(flippedId === premio.id ? null : premio.id)}
                style={{
                  width: isMobile ? 333 : 280, minWidth: isMobile ? 333 : 280,
                  maxWidth: isMobile ? 333 : 280, height: isMobile ? 500 : 440,
                  borderRadius: 12, position: 'relative', cursor: 'pointer',
                  perspective: '1000px', flexShrink: 0,
                }}
              >
                <div className={`flip-card-inner${isFlipped ? ' flipped' : ''}`}>

                  {/* CARA A — arte coleccionable */}
                  <div className="flip-face">
                    <img
                      src={DIAMANTE_CARD_ASSET[premio.tier] || DIAMANTE_CARD_ASSET[200]}
                      alt={`Diamante ${premio.tier}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                    />
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'rgba(0,0,0,0.7)', borderRadius: 20,
                      padding: '3px 10px', fontSize: 10, fontWeight: 700,
                      color: '#d090ff', border: '1px solid rgba(180,80,255,0.4)',
                    }}>
                      {premio.cantidad_disponible} disponibles
                    </div>
                  </div>

                  {/* CARA B — info + botones */}
                  <div className="flip-face flip-face-back" style={{ borderRadius: 12 }}>
                    <img src="/images/cards/card-back.webp" alt="reverso"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                        objectFit: 'cover', zIndex: 0 }} />
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 1,
                      background: 'linear-gradient(170deg, rgba(20,0,40,0.85) 0%, rgba(40,0,80,0.9) 100%)',
                    }} />
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 2,
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'space-between', padding: '18px 14px 14px',
                    }}>
                      <div>
                        <p style={{ fontSize: 10, color: '#d090ff', fontWeight: 800,
                          letterSpacing: 2, textTransform: 'uppercase' }}>
                          💎 Diamante {premio.tier} · {premio.descuento_pct}%
                        </p>
                        <p style={{ fontSize: 13, color: '#fff', fontWeight: 700, marginTop: 4 }}>
                          {premio.nombre_premio}
                        </p>
                        {premio.descripcion && (
                          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)',
                            lineHeight: 1.5, marginTop: 6, fontStyle: 'italic' }}>
                            {premio.descripcion}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 11, color: '#d090ff', fontWeight: 700,
                          textAlign: 'center' }}>
                          🌙 {premio.lunas_canje?.toLocaleString()} Lunas
                        </div>

                        {premio.imagen_url && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setPremioSeleccionado(premio); }}
                            style={{
                              width: '100%', padding: '8px 0', borderRadius: 8, border: '1px solid rgba(180,80,255,0.4)',
                              background: 'transparent', color: '#d090ff', fontSize: 10,
                              fontWeight: 700, letterSpacing: 2, cursor: 'pointer',
                            }}
                          >
                            📷 VER FOTO
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCanjeando(premio);
                            setEstadoCanje('confirmando');
                          }}
                          disabled={saldoTras < 0}
                          style={{
                            width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
                            background: saldoTras >= 0 ? '#9040e0' : 'rgba(144,64,224,0.2)',
                            color: saldoTras >= 0 ? '#fff' : 'rgba(255,255,255,0.3)',
                            fontSize: 10, fontWeight: 900, letterSpacing: 2, cursor: saldoTras >= 0 ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {saldoTras >= 0
                            ? 'CANJEAR →'
                            : `Te faltan 🌙 ${Math.abs(saldoTras).toLocaleString()}`}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

<CuponModal
        estado={estado}
        cardPendiente={cardPendiente}
        cuponActivo={cuponActivo}
        errorMsg={errorMsg}
        lunasBalance={lunasBalance}
        onConfirmar={confirmar}
        onCancelar={cancelar}
        onCerrar={cerrar}
      />

      {/* ── MODAL PRODUCTO DIAMANTE ── */}
      {premioSeleccionado && (
        <div
          onClick={() => setPremioSeleccionado(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)', zIndex: 200 }}
        />
      )}
      {premioSeleccionado && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 201, width: 'min(480px, 92vw)',
          borderRadius: 20, overflow: 'hidden',
          background: 'linear-gradient(145deg, #1a0a2e, #2d1050)',
          border: '1px solid rgba(180,80,255,0.3)',
          boxShadow: '0 0 40px rgba(144,64,224,0.3)',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Exo 2', sans-serif",
        }}>
          <img
            src={premioSeleccionado.imagen_url}
            alt={premioSeleccionado.nombre_premio}
            style={{ width: '100%', objectFit: 'cover', maxHeight: 380, display: 'block' }}
          />
          <div style={{ padding: '14px 20px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>
              {premioSeleccionado.nombre_premio}
            </span>
            <button onClick={() => setPremioSeleccionado(null)}
              style={{ background: 'none', border: '1px solid rgba(180,80,255,0.3)',
                borderRadius: 8, color: '#d090ff', fontSize: 10, fontWeight: 700,
                letterSpacing: 2, cursor: 'pointer', padding: '5px 14px',
                fontFamily: "'Exo 2', sans-serif" }}>
              CERRAR
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL CANJE DIAMANTE ── */}
      {canjeando && estadoCanje !== 'idle' && (
        <>
          <div onClick={() => { setCanjeando(null); setEstadoCanje('idle'); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)', zIndex: 202 }} />

          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 203, width: 'min(540px, 92vw)',
            borderRadius: 20, padding: '28px 24px',
            background: 'linear-gradient(145deg, #1a0a2e, #2d1050)',
            border: '1px solid rgba(180,80,255,0.3)',
            boxShadow: '0 0 40px rgba(144,64,224,0.25)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            fontFamily: "'Exo 2', sans-serif",
          }}>

            {/* CONFIRMANDO */}
            {estadoCanje === 'confirmando' && (
              <>
                <p style={{ fontSize: 11, color: '#d090ff', fontWeight: 700,
                  letterSpacing: 2, textTransform: 'uppercase' }}>
                  💎 Confirmar canje
                </p>
                <p style={{ fontSize: 16, color: '#fff', fontWeight: 900, textAlign: 'center' }}>
                  {canjeando.nombre_premio}
                </p>
                <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)',
                  borderRadius: 12, padding: '16px 20px', display: 'flex',
                  flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Coste',     `🌙 ${canjeando.lunas_canje?.toLocaleString()} Lunas`, '#d090ff'],
                    ['Tu saldo',  `🌙 ${(lunasBalance||0).toLocaleString()}`, '#fff'],
                    ['Tras canje',`🌙 ${((lunasBalance||0) - canjeando.lunas_canje).toLocaleString()}`,
                      (lunasBalance||0) - canjeando.lunas_canje < 0 ? '#ff4444' : '#fff'],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)',
                        textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
                      <span style={{ fontSize: 14, color, fontWeight: 700 }}>{value}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6 }}>
                  Recibirás tu clave secreta en Booster › Mis Cupones.<br />
                  El comercio se pondrá en contacto contigo.
                </p>
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <button onClick={() => { setCanjeando(null); setEstadoCanje('idle'); }}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 10,
                      border: '1px solid rgba(180,80,255,0.2)', background: 'transparent',
                      color: '#d090ff', fontSize: 11, fontWeight: 700,
                      letterSpacing: 2, cursor: 'pointer' }}>
                    CANCELAR
                  </button>
                  <button onClick={ejecutarCanjeDiamante}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 10,
                      border: 'none', background: '#9040e0',
                      color: '#fff', fontSize: 11, fontWeight: 700,
                      letterSpacing: 2, cursor: 'pointer' }}>
                    CONFIRMAR
                  </button>
                </div>
              </>
            )}

            {/* CARGANDO */}
            {estadoCanje === 'cargando' && (
              <>
                <div style={{ fontSize: 32, animation: 'spinCupon 1s linear infinite' }}>💎</div>
                <p style={{ fontSize: 11, color: '#d090ff', letterSpacing: 2 }}>PROCESANDO...</p>
                <style>{`@keyframes spinCupon { to { transform: rotate(360deg); } }`}</style>
              </>
            )}

            {/* ÉXITO */}
            {estadoCanje === 'exito' && resultadoCanje && (
              <>
                <div style={{ fontSize: 32 }}>✅</div>
                <p style={{ fontSize: 11, color: '#d090ff', fontWeight: 700,
                  letterSpacing: 2, textTransform: 'uppercase' }}>
                  ¡Premio canjeado!
                </p>
                <p style={{ fontSize: 16, color: '#fff', fontWeight: 900, textAlign: 'center' }}>
                  {resultadoCanje.nombre_premio}
                </p>
                <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)',
                  borderRadius: 12, padding: '16px 20px', display: 'flex',
                  flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase', letterSpacing: 1 }}>Referencia</span>
                    <span style={{ fontSize: 13, color: '#d090ff',
                      fontWeight: 700, fontFamily: 'monospace',
                      letterSpacing: 2 }}>{resultadoCanje.palabra_clave_1}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase', letterSpacing: 1 }}>Tu clave secreta</span>
                    <span style={{ fontSize: 14, color: '#fbbf24',
                      fontWeight: 900, fontFamily: 'monospace',
                      letterSpacing: 3 }}>{resultadoCanje.clave_secreta}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)',
                  textAlign: 'center', lineHeight: 1.8 }}>
                  {resultadoCanje.comercio_email && (
                    <p>✉️ {resultadoCanje.comercio_email}</p>
                  )}
                  {resultadoCanje.comercio_tel && (
                    <p>📞 {resultadoCanje.comercio_tel}</p>
                  )}
                  <p style={{ marginTop: 6, color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
                    Indica tu clave secreta al comercio para reclamar tu premio.<br />
                    Tu historial completo en Booster › Mis Cupones.
                  </p>
                </div>
                <button onClick={() => { setCanjeando(null); setEstadoCanje('idle'); setResultadoCanje(null); }}
                  style={{ width: '100%', padding: '10px 0', borderRadius: 10,
                    border: '1px solid rgba(180,80,255,0.3)', background: 'transparent',
                    color: '#d090ff', fontSize: 11, fontWeight: 700,
                    letterSpacing: 2, cursor: 'pointer' }}>
                  CERRAR
                </button>
              </>
            )}

            {/* ERROR */}
            {estadoCanje === 'error' && (
              <>
                <div style={{ fontSize: 28 }}>⚠️</div>
                <p style={{ fontSize: 11, color: '#ff6060', letterSpacing: 1, textAlign: 'center' }}>
                  {errorCanjeDiamante}
                </p>
                <button onClick={() => { setCanjeando(null); setEstadoCanje('idle'); setErrorCanjeDiamante(''); }}
                  style={{ padding: '10px 24px', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
                    color: '#fff', fontSize: 11, fontWeight: 700,
                    letterSpacing: 2, cursor: 'pointer' }}>
                  CERRAR
                </button>
              </>
            )}

          </div>
        </>
      )}
    </div>
  );
}