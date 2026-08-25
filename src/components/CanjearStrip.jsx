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

const LUNAS_DIAMANTE = {
  200:  200000,
  500:  300000,
  1000: 400000,
};

const LUNAS_COSTO = {
  PLATA: {
    3:   30000,
    5:   35000,
    7:   25000,
    10:  40000,
    20:  45000,
    40:  50000,
    60:  55000,
    100: 60000,
    200: 70000,
  },
  ORO: {
    5:   50000,
    10:  60000,
    20:  70000,
    40:  80000,
    60:  90000,
    100: 100000,
    200: 150000,
  },
  LUNA100: {
    0: 10000,
  },
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
        // 1 — Packs LIBRE con join a comercio_nidos (excluye Diamante — tiene su propio fetch)
        const { data: packs, error } = await supabase
          .from('pack_tarjetas')
          .select(`
            id,
            tipo_tarjeta,
            denominacion,
            cantidad_disponible,
            comercio_nidos!pack_tarjetas_nido_id_fkey (
              descripcion,
              compra_minima,
              palabra_clave_pub,
              alcance,
              comercio_user_id
            )
          `)
          .eq('estado', 'LIBRE')
          .gt('cantidad_disponible', 0)
          .neq('tipo_tarjeta', 'DIAMANTE')
          .limit(50);

        if (error) {
          console.error('[CanjearStrip] Error:', error.message);
          setCupones([]);
          return;
        }

        if (!packs?.length) { setCupones([]); return; }

        // 2 — Filtrar por alcance del tab activo
        const filtrados = packs.filter(p => {
          const alcance = p.comercio_nidos?.alcance;
          if (!alcance) return false;
          if (activeTab === 'CERCANIAS')     return alcance === 'LOCAL' || alcance === 'CERCANIAS';
          if (activeTab === 'NACIONAL')      return alcance === 'NACIONAL';
          if (activeTab === 'INTERNACIONAL') return alcance === 'INTERNACIONAL';
          return false;
        });

        if (!filtrados.length) { setCupones([]); return; }

        // 3 — razon_social por comercio_user_id
        const comercioIds = [...new Set(
          filtrados.map(p => p.comercio_nidos?.comercio_user_id).filter(Boolean)
        )];

        const { data: perfiles } = await supabase
          .from('b_advertiser_profiles')
          .select('id, razon_social')
          .in('id', comercioIds);

        const perfilMap = Object.fromEntries(
          (perfiles || []).map(p => [p.id, p.razon_social])
        );

        // 4 — Enriquecer y normalizar
        setCupones(filtrados.map(p => {
          const nido  = p.comercio_nidos || {};
          const denom = Number(p.denominacion);
          return {
            id:              p.id,
            tipo_tarjeta:    p.tipo_tarjeta,
            valor_euros:     denom,
            banner_url:      null,
            descripcion:     nido.descripcion     || null,
            compra_minima:   nido.compra_minima   || null,
            palabra_clave_1: null,
            bs_razon_social: perfilMap[nido.comercio_user_id] || '',
            bs_web:          '',
            bs_telefono:     '',
            bs_email:        '',
            coste_lunas:     LUNAS_COSTO[p.tipo_tarjeta]?.[denom] ?? 0,
          };
        }));

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
      // 1. Nidos Diamante aprobados y activos filtrados por alcance del tab activo
      let query = supabase
        .from('comercio_nidos')
        .select('id, nombre_nido, descripcion, denominacion, imagen_aprobacion, comercio_user_id, alcance')
        .eq('tipo_tarjeta', 'DIAMANTE')
        .eq('aprobado', true)
        .eq('activo', true);

      if (activeTab === 'CERCANIAS')     query = query.in('alcance', ['LOCAL', 'CERCANIAS']);
      if (activeTab === 'NACIONAL')      query = query.eq('alcance', 'NACIONAL');
      if (activeTab === 'INTERNACIONAL') query = query.eq('alcance', 'INTERNACIONAL');

      const { data: nidos } = await query;
      if (!nidos || nidos.length === 0) { setPremiosDiamante([]); return; }

      // 2. Para cada nido, buscar pack disponible en pack_tarjetas
      const nidosConPack = await Promise.all(
        nidos.map(async (nido) => {
          const { data: pack } = await supabase
            .from('pack_tarjetas')
            .select('id, cantidad_disponible')
            .eq('nido_id', nido.id)
            .eq('estado', 'LIBRE')
            .gt('cantidad_disponible', 0)
            .limit(1)
            .maybeSingle();
          if (!pack) return null;
          return { ...nido, pack_id: pack.id, cantidad_disponible: pack.cantidad_disponible };
        })
      );

      const disponibles = nidosConPack.filter(Boolean);
      if (disponibles.length === 0) { setPremiosDiamante([]); return; }

      // 3. Resolver razon_social del anunciante
      const userIds = [...new Set(disponibles.map(n => n.comercio_user_id))];
      const { data: perfiles } = await supabase
        .from('b_advertiser_profiles')
        .select('id, razon_social')
        .in('id', userIds);

      const perfilMap = {};
      if (perfiles) perfiles.forEach(p => { perfilMap[p.id] = p.razon_social; });

      setPremiosDiamante(
        disponibles.map(n => ({
          ...n,
          razon_social: perfilMap[n.comercio_user_id] || '',
          coste_lunas:  LUNAS_DIAMANTE[n.denominacion] ?? 0,
        }))
      );
    };
    fetchDiamante();
  }, [activeTab]);

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
            const isFlipped  = isMobile ? flippedId === premio.id : hoveredId === premio.id;
            const saldoTras  = (lunasBalance || 0) - premio.coste_lunas;
            const imgAsset   = DIAMANTE_CARD_ASSET[premio.denominacion] || DIAMANTE_CARD_ASSET[200];

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

                  {/* CARA A — imagen hardcodeada Bro7Vision */}
                  <div className="flip-face">
                    <img
                      src={imgAsset}
                      alt={`Diamante ${premio.denominacion}`}
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

                  {/* CARA B — negro carbón + info + botones */}
                  <div className="flip-face flip-face-back" style={{ borderRadius: 12, background: '#0a0a0a' }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(170deg, #111 0%, #1a0a2e 100%)',
                      borderRadius: 12,
                    }} />
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 2,
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'space-between', padding: '18px 14px 14px',
                    }}>
                      {/* Info comercio */}
                      <div>
                        <p style={{ fontSize: 10, color: '#d090ff', fontWeight: 800,
                          letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>
                          💎 DIAMANTE {premio.denominacion}€
                        </p>
                        <p style={{ fontSize: 13, color: '#fff', fontWeight: 700, margin: '0 0 4px' }}>
                          {premio.razon_social}
                        </p>
                        {premio.nombre_nido && (
                          <p style={{ fontSize: 11, color: '#d090ff', fontWeight: 600, margin: '0 0 4px' }}>
                            {premio.nombre_nido}
                          </p>
                        )}
                        {premio.descripcion && (
                          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)',
                            lineHeight: 1.5, marginTop: 6, fontStyle: 'italic' }}>
                            {premio.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Botones */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 11, color: '#d090ff', fontWeight: 700, textAlign: 'center' }}>
                          🌙 {premio.coste_lunas.toLocaleString()} Lunas
                        </div>

                        {premio.imagen_aprobacion && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setPremioSeleccionado(premio); }}
                            style={{
                              width: '100%', padding: '8px 0', borderRadius: 8,
                              border: '1px solid rgba(180,80,255,0.4)',
                              background: 'transparent', color: '#d090ff',
                              fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: 'pointer',
                              fontFamily: "'Exo 2', sans-serif",
                            }}
                          >
                            📷 VER ARTÍCULO
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFlippedId(null);
                            setHoveredId(null);
                            iniciarCanje({
                              id:           premio.pack_id,
                              coste_lunas:  premio.coste_lunas,
                              tipo_tarjeta: 'DIAMANTE',
                              valor_euros:  premio.denominacion,
                            });
                          }}
                          disabled={saldoTras < 0}
                          style={{
                            width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
                            background: saldoTras >= 0 ? '#9040e0' : 'rgba(144,64,224,0.2)',
                            color: saldoTras >= 0 ? '#fff' : 'rgba(255,255,255,0.3)',
                            fontSize: 10, fontWeight: 900, letterSpacing: 2,
                            cursor: saldoTras >= 0 ? 'pointer' : 'not-allowed',
                            fontFamily: "'Exo 2', sans-serif",
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
            src={premioSeleccionado.imagen_aprobacion}
            alt={premioSeleccionado.nombre_nido || premioSeleccionado.razon_social}
            style={{ width: '100%', objectFit: 'cover', maxHeight: 380, display: 'block' }}
          />
          <div style={{ padding: '14px 20px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>
              {premioSeleccionado.nombre_nido || premioSeleccionado.razon_social}
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

      </div>
  );
}