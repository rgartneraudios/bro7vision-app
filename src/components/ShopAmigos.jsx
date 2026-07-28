import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SlideRailAmigos from './SlideRailAmigos';
import CityLocationBanner from './CityLocationBanner';

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

function SlotWarningModal({ slot, onClose }) {
  if (!slot) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111', border: '1px solid rgba(0,255,255,0.3)',
          borderRadius: 16, padding: '4rem', maxWidth: 960, width: '90%',
          boxShadow: '0 0 40px rgba(0,255,255,0.15)',
        }}
      >
        <h2 style={{ color: '#00ffff', fontSize: 48, fontWeight: 900, textAlign: 'center', marginBottom: 16 }}>
          SHOP AMIGOS
        </h2>
        <p style={{ color: '#ccc', fontSize: 24, textAlign: 'center', marginBottom: 32 }}>
          {slot.nombre}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1.8, marginBottom: 32 }}>
          Bro7Vision ofrece espacios ("Slots") alquilados a comercios externos denominados Amigos.
          Estos comercios operan de forma independiente y Bro7Vision no participa en las transacciones,
          pagos, envíos ni garantías.
          Si experimentas alguna incidencia con este comercio Amigo, comunícanoslo a través de la
          sección de Incidencias para su análisis.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => {
              if (slot.url_destino) window.open(slot.url_destino, '_blank', 'noopener');
              onClose();
            }}
            style={{
              flex: 1, padding: '12px 0', background: '#00ffff', color: '#000',
              fontWeight: 900, fontSize: 14, border: 'none', borderRadius: 10,
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
              boxShadow: '0 0 16px rgba(0,255,255,0.4)',
            }}
          >
            CONTINUAR →
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px 0', background: 'transparent', color: '#888',
              fontSize: 14, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10,
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopAmigos({ scope }) {
  const [activeTab, setActiveTab] = useState('CERCANIAS');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      const { data } = await supabase
        .from('shop_amigos_slots')
        .select('*')
        .eq('activo', true)
        .eq('alcance', activeTab);
      setSlots(data || []);
    };
    fetchSlots();
  }, [activeTab]);

  const TEST_SLOT = {
    id: 'test-001',
    nombre: 'Taller Lunar Studio',
    url_destino: 'https://bro7vision.com',
    imagen_url: '/images/steel_5.png',
    alcance: 'INTERNACIONAL',
    activo: true,
  };

  // TEST_SLOT se mezcla con slots reales para que siempre haya contenido visible
  const slotsConTest = [TEST_SLOT, ...slots];

  const TOTAL_SLOTS = slotsConTest.length < 4 ? slotsConTest.length : 8;

  const placeholders = Array.from(
    { length: Math.max(0, TOTAL_SLOTS - slotsConTest.length) },
    (_, i) => ({ id: `placeholder-${i}`, _placeholder: true })
  );
  const allSlots = TOTAL_SLOTS < 4 ? slotsConTest : [...slotsConTest, ...placeholders];

  const neonColor = TAB_COLORS[activeTab];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,40,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #00FFFF; border-radius: 4px; box-shadow: 0 0 8px #00FFFF; }
        ::-webkit-scrollbar-thumb:hover { background: #00E5E5; }
        * { scrollbar-width: thin; scrollbar-color: #00FFFF rgba(0,0,40,0.3); }
      `}</style>
      <video
        autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      >
        <source src="https://media.bro7vision.com/ShopAmigos2.mp4" type="video/mp4" />
      </video>

      <HeaderWidget />

      <CityLocationBanner scope={scope} />

      <SlideRailAmigos />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        height: '100%', paddingTop: 20, paddingLeft: 'clamp(20px, 4vw, 80px)', paddingRight: 'clamp(20px, 4vw, 80px)',
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
            Shop Amigos
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
            flex: 1, width: '100%',
            padding: '16px 32px 32px',
            marginTop: 'clamp(40px, 6vh, 100px)',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 280px)',
            gap: 16,
            justifyContent: 'center',
            alignContent: 'flex-start',
            height: '100%',
            alignSelf: 'stretch',
          }}
        >
          {allSlots.map(slot => {
  const ocupado = !slot._placeholder && slot.imagen_url;
  const esSlotReal = !slot._placeholder;
  return (
    <div
      key={slot.id}
      onClick={() => esSlotReal && !slot._placeholder && setSelectedSlot(slot)}
      onMouseEnter={() => setHoveredId(slot.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        width: isMobile ? 333 : 280,
        minWidth: isMobile ? 333 : 280,
        height: isMobile ? 500 : 440,
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        cursor: esSlotReal ? 'pointer' : 'default',
        background: ocupado
          ? `url(${slot.imagen_url}) center/cover no-repeat`
          : 'rgba(0,0,0,0.6)',
        border: ocupado
          ? `2px solid ${hoveredId === slot.id ? '#00FFFF' : 'rgba(255,255,255,0.15)'}`
          : `2px dashed ${hoveredId === slot.id ? '#00FFFF' : 'rgba(0,255,255,0.5)'}`,
        boxShadow: hoveredId === slot.id ? '0 0 24px rgba(0,255,255,0.4), inset 0 0 20px rgba(0,255,255,0.1)' : 'none',
        transform: hoveredId === slot.id ? 'scale(1.03)' : 'scale(1)',
        transition: 'all 0.25s ease',
        flexShrink: 0,
      }}
    >
      {ocupado ? (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
          padding: '20px 16px 16px',
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
            {slot.nombre}
          </span>
        </div>
      ) : esSlotReal ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: 8, padding: 16, textAlign: 'center',
          cursor: 'pointer',
        }}
          onClick={() => setSelectedSlot(slot)}
        >
          <span style={{ color: '#00FFFF', fontSize: 18, fontWeight: 700 }}>
            {slot.nombre}
          </span>
          <span style={{ color: 'rgba(0,255,255,0.5)', fontSize: 11 }}>
            Pulsa para visitar →
          </span>
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: 8,
        }}>
          <span style={{ color: '#00FFFF', fontSize: 18, fontWeight: 700, letterSpacing: '0.1em' }}>
            ✦ Espacio disponible ✦
          </span>
          <span style={{ color: 'rgba(0,255,255,0.4)', fontSize: 11 }}>
            Contacta con nosotros
          </span>
        </div>
      )}
    </div>
  );
})}
        </div>
      </div>

      {selectedSlot && (
        <SlotWarningModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
      )}
    </div>
  );
}