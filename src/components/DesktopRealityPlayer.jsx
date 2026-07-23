import React, { useState, useEffect } from 'react';
import { getVideoCandidates, resolveVideoFromCandidates, getTurno } from '../data/citycodes';
import { getMoonSuffix } from '../utils/moonUtils';
import { useHaloTrivia } from '../hooks/useHaloTrivia';

const DR_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');

  @keyframes glowSwimPC {
    0%   { transform: translate(0,0) scale(0.9) rotate(0deg);   opacity:1; }
    20%  { transform: translate(-8vw,-18vh) scale(1.3) rotate(90deg);  opacity:1; }
    50%  { transform: translate(-20vw,-50vh) scale(1.2) rotate(270deg); }
    75%  { transform: translate(-35vw,-75vh) scale(0.8) rotate(450deg); opacity:1; }
    95%  { transform: translate(-38vw,-85vh) scale(0.2) rotate(660deg); opacity:1; }
    100% { transform: translate(-38vw,-88vh) scale(0.05) rotate(720deg); opacity:0.6; }
  }
  .animate-halo-pc { animation: glowSwimPC 6s cubic-bezier(0.45,0.05,0.55,0.95) forwards; }

  @keyframes spin-cw  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
  @keyframes spin-ccw { from{transform:rotate(360deg)} to{transform:rotate(0deg)}    }
  .animate-spin-cw  { animation: spin-cw  8s linear infinite; }
  .animate-spin-ccw { animation: spin-ccw 8s linear infinite; }

  @keyframes energyPulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.2);opacity:1} }
  .animate-energy-pulse { animation: energyPulse 2s ease-in-out infinite; }

  @keyframes particleOrbit {
    0%  { transform:rotate(0deg)   translateX(30px) scale(1);   opacity:1; }
    100%{ transform:rotate(360deg) translateX(30px) scale(0.5); opacity:0; }
  }
  .animate-particle-orbit { animation: particleOrbit 2s ease-out infinite; }
  @keyframes vortexSpin { 0%{transform:rotate(0deg) scale(1)} 100%{transform:rotate(360deg) scale(1.05)} }
  .animate-spin-vortex { animation: vortexSpin 1.5s linear infinite; }
  @keyframes spiralCounter { 0%{transform:rotate(0deg)} 100%{transform:rotate(-360deg)} }
  .animate-spiral-counter { animation: spiralCounter 3s linear infinite; }
  @keyframes flare { 0%,60%,100%{opacity:0;transform:scale(0.8)} 70%{opacity:1;transform:scale(1.3)} }
  .animate-flare { animation: flare 3s ease-in-out infinite; }

  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  .scanline {
    position:absolute; top:0; left:0; width:100%; height:40px;
    background: linear-gradient(to bottom, transparent, rgba(0,255,255,0.03), transparent);
    animation: scanline 8s linear infinite;
    pointer-events:none;
  }

  .dr-clock {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(40px, 5vw, 80px);
    line-height: 1;
    letter-spacing: 0.04em;
    color: #fff;
    text-shadow: 0 0 20px rgba(255,255,255,0.4);
  }
  .dr-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 16px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
  }
`;

const PC_ESCENARIO_MAP = {
  moon:         '01',
  oeste:        '02',
  este:         '03',
  solo_o169:    '04',
  solo_e169:    '05',
  solo_fantasy: '06',
  oeste169:     '07',
  band_fantasy: '08',
  este169:      '09',
};

// Mapa canal → número para getVideoCandidates
const CANAL_NUM = {
  moon:         2,
  solo_o169:    4,
  solo_fantasy: 5,
  solo_e169:    6,
  oeste169:     7,
  band_fantasy: 8,
  este169:      9,
  este:         3,
  oeste:        1,
};

// Colores por canal
const CANAL_COLOR = {
  moon:         '#e2e8f0',
  solo_o169:    '#34d399',
  solo_fantasy: '#22d3ee',
  solo_e169:    '#fbbf24',
  oeste169:     '#60a5fa',
  band_fantasy: '#e879f9',
  este169:      '#fb923c',
  este:         '#22d3ee',
  oeste:        '#e879f9',
};

const CANAL_NOMBRE = {
  moon:         'CANAL MOON',
  solo_o169:    'CANAL TIERRA',
  solo_fantasy: 'CANAL JÚPITER',
  solo_e169:    'CANAL MARTE',
  oeste169:     'CANAL SATURNO',
  band_fantasy: 'CANAL URANO',
  este169:      'CANAL NEPTUNO',
  este:         'CANAL VENUS',
  oeste:        'CANAL MERCURIO',
};

// Widget reloj + temperatura + génesis
const HeaderWidget = ({ color, genesisBalance, onCityDetected }) => {
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
        const cityName = gd.address?.city || gd.address?.town || '';
        setCity(cityName.toUpperCase());
        onCityDetected?.(cityName);
      } catch(_) {}
    }, ()=>{}, { timeout: 8000 });
  }, []);

  const genesisColor = genesisBalance > 500000 ? '#fbbf24'
    : genesisBalance > 100000 ? '#e879f9'
    : genesisBalance > 10000  ? '#34d399'
    : genesisBalance > 1000   ? '#22d3ee'
    : '#94a3b8';

  return (
    <div className="flex items-center justify-between w-full px-8 py-4 select-none">

      {/* Izquierda: Hora + Fecha */}
      <div className="flex flex-col items-start">
        <span className="dr-clock">{time}</span>
        <span className="dr-label">{date}</span>
      </div>

      {/* Centro: Lunas */}
      <div className="flex flex-col items-center px-6 py-2 rounded-2xl"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
        <span className="dr-clock" style={{ color: genesisColor, textShadow: `0 0 20px ${genesisColor}` }}>
          {(genesisBalance ?? 0).toLocaleString()}
        </span>
        <span className="dr-label" style={{ color: genesisColor }}>LUNAS </span>
      </div>

      {/* Derecha: Temperatura */}
      <div className="flex flex-col items-end">
        {temp !== null
          ? <><span className="dr-clock">{temp}°</span>
              {city && <span className="dr-label">{city}</span>}</>
          : <span className="dr-label">...</span>
        }
      </div>
    </div>
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const DesktopRealityPlayer = ({
  realityMode,
  userId,
  genesisBalance,
  onGenesisUpdate,
}) => {
  const [bgVideoUrl, setBgVideoUrl] = useState('');
  const [userCity, setUserCity] = useState(null);
  const color  = CANAL_COLOR[realityMode]  || '#00ffff';
  const nombre = CANAL_NOMBRE[realityMode] || 'CANAL';

  useEffect(() => {
    if (!realityMode) return;
    const num = CANAL_NUM[realityMode];
    if (!num) return;
    let active = true;
    resolveVideoFromCandidates(
      getVideoCandidates(num, getMoonSuffix(), getTurno(), 0, userCity)
    ).then(url => { if (active) setBgVideoUrl(url); });
    return () => { active = false; };
  }, [realityMode, userCity]);

  const {
    preguntaActual, indice, total, resultado, cooldown,
    loading: triviaLoading, completado,
    burbujaOpen,
    haloActivo, falloImg,
    proximoTurno,
    cargarSet, responder,
  } = useHaloTrivia({
    escenarioId: PC_ESCENARIO_MAP[realityMode] || realityMode,
    userId,
    onGenesisUpdate,
  });

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden select-none">
      <style>{DR_STYLES}</style>

      {/* Video de fondo */}
      {bgVideoUrl && (
        <video key={bgVideoUrl} autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover z-0">
          <source src={bgVideoUrl} type="video/mp4" />
        </video>
      )}

      {/* Scanline */}

      {/* HALO SUMA — vortex PC (diseño ChannelMoon) */}
      {haloActivo === 'suma' && (
        <div className="fixed z-[300] pointer-events-none animate-halo-pc"
          style={{ bottom: 80, right: '12%' }}>
          {(() => {
            const pal = [
              {primary:"#00127A",secondary:"#006AED",glow:"rgba(59,130,246,0.6)"},
              {primary:"#FF007D",secondary:"#f472b6",glow:"rgba(236,72,153,0.6)"},
              {primary:"#00FF48",secondary:"#00FFF2",glow:"rgba(16,185,129,0.6)"},
              {primary:"#4D00FA",secondary:"#7C4FFF",glow:"rgba(139,92,246,0.6)"},
              {primary:"#facc15",secondary:"#FFFF00",glow:"rgba(250,204,21,0.6)"},
              {primary:"#CF0000",secondary:"#F70C0C",glow:"rgba(239,68,68,0.6)"},
              {primary:"#00E1FF",secondary:"#61C8FF",glow:"rgba(6,182,212,0.6)"}
            ];
            const c = pal[Math.floor(Math.random() * pal.length)];
            return (
              <div className="relative flex flex-col items-center" style={{mixBlendMode:'screen'}}>
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute w-48 h-48 rounded-full blur-[40px] opacity-60 animate-energy-pulse" style={{background:c.glow}}/>
                  <div className="absolute w-40 h-40 animate-spin-vortex"><div className="w-full h-full rounded-full opacity-90" style={{background:`conic-gradient(from 0deg,${c.primary},${c.secondary},transparent 40%,${c.primary} 60%,transparent 80%,${c.secondary})`,filter:'blur(4px)'}}/></div>
                  <div className="absolute w-32 h-32 animate-spiral-counter"><div className="w-full h-full rounded-full opacity-90" style={{background:`conic-gradient(from 180deg,transparent,${c.secondary} 30%,transparent 50%,${c.primary} 70%,transparent)`,filter:'blur(3px)'}}/></div>
                  <div className="absolute w-36 h-36 rounded-full animate-spin-vortex" style={{border:`4px solid ${c.secondary}`,opacity:0.7,filter:'blur(1px)',animationDuration:'2s'}}/>
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full blur-[20px] opacity-80 animate-energy-pulse" style={{background:c.primary}}/>
                    <div className="absolute w-16 h-16 rounded-full" style={{background:`radial-gradient(circle,white 20%,${c.secondary} 50%,${c.primary} 100%)`,boxShadow:`0 0 40px ${c.glow},0 0 80px ${c.glow},0 0 120px ${c.glow},0 0 160px ${c.glow}`}}/>
                    <div className="absolute w-6 h-6 bg-white rounded-full blur-[2px] shadow-[0_0_20px_white,0_0_40px_white]"/>
                  </div>
                  {[0,1,2,3].map(i=><div key={i} className="absolute w-2 h-24 animate-flare" style={{background:`linear-gradient(to bottom,${c.secondary},transparent)`,transform:`rotate(${i*90}deg)`,transformOrigin:'center',filter:'blur(2px)',animationDelay:`${i*0.5}s`}}/>)}
                  {[0,1,2,3,4,5].map(i=><div key={`p${i}`} className="absolute animate-particle-orbit" style={{animationDelay:`${i*0.3}s`}}><div className="w-2 h-2 rounded-full blur-[1px]" style={{background:i%2===0?c.primary:c.secondary}}/></div>)}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* HALO RESTA — monstruo vortex */}
      {haloActivo === 'resta' && falloImg && (
        <div className="fixed z-[300] pointer-events-none animate-halo-pc"
          style={{ bottom: 80, right: '12%' }}>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-[60px] animate-energy-pulse" />
            <img src={falloImg} style={{ width: 120, height: 120, objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(239,68,68,0.8))' }} alt="fallo" />
          </div>
        </div>
      )}

      <main className="relative z-10 flex flex-col h-full w-full">

        {/* HEADER */}
        <HeaderWidget color={color} genesisBalance={genesisBalance} onCityDetected={setUserCity} />

        {/* CUERPO — burbuja pregunta centrada */}
        {burbujaOpen && preguntaActual ? (
          <div className="flex-1 flex items-center justify-center px-16">
            <div className="w-full max-w-2xl rounded-3xl px-10 py-8 flex flex-col gap-5"
              style={{
                background: 'rgba(0,0,0,0.88)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${color}44`,
                boxShadow: `0 0 60px ${color}18`,
              }}>

              {preguntaActual.esEco && (
                <div className="text-[10px] text-white/35 uppercase tracking-widest text-right">
                  * PUBLICIDAD
                </div>
              )}

              <p className="text-white font-black text-2xl uppercase tracking-wide leading-snug text-center"
                style={{ fontFamily: "'Courier New', monospace", textShadow: `0 0 12px ${color}` }}>
                {preguntaActual.pregunta}
              </p>

              <div className="text-center text-white/25 text-[10px] uppercase tracking-widest">
                {indice + 1} / {total}
              </div>

              {/* Respuestas con emoji vinculado */}
              <div className="flex flex-col gap-3 mt-2">
                {preguntaActual.opciones.map((op) => {
                  const textoDisplay = op.texto?.replace(/\(\*\)/g, '').trim();
                  const tieneStar   = op.texto?.includes('(*)');
                  const esCorrecta  = resultado === 'acierto' && (
                    preguntaActual.esEco
                      ? op.texto?.includes('(*)')
                      : op.clave === preguntaActual.respuesta_correcta
                  );
                  return (
                    <div key={op.clave}
                      className="flex items-center gap-4 px-5 py-3 rounded-2xl transition-all"
                      style={{
                        background: esCorrecta
                          ? 'rgba(34,197,94,0.18)'
                          : resultado === 'fallo'
                            ? 'rgba(239,68,68,0.08)'
                            : 'rgba(255,255,255,0.04)',
                        border: esCorrecta
                          ? '1px solid #22c55e'
                          : resultado === 'fallo'
                            ? '1px solid rgba(239,68,68,0.3)'
                            : `1px solid ${color}33`,
                      }}>
                      <span className="text-4xl flex-shrink-0">{op.emoji}</span>
                      <span className="text-white font-black text-base uppercase leading-snug flex-1"
                        style={{ fontFamily: "'Courier New', monospace" }}>
                        {textoDisplay}
                        {tieneStar && <span className="text-yellow-400 ml-2">★</span>}
                      </span>
                      {esCorrecta && <span className="text-green-400 text-2xl">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* FOOTER */}
        <footer className="flex-shrink-0 px-10 pb-10 flex flex-col items-center gap-4">

          {/* Nombre canal */}
          <div className="text-[10px] uppercase tracking-[0.4em] font-mono"
            style={{ color: `${color}88` }}>
            {nombre}
          </div>

          {/* Botones animales grandes */}
          <div className="flex gap-6 justify-center">
            {(burbujaOpen && preguntaActual
              ? preguntaActual.opciones
              : [
                  { emoji: '🦈', clave: 'a' },
                  { emoji: '🐘', clave: 'b' },
                  { emoji: '🐞', clave: 'c' },
                ]
            ).map((op) => (
              <button key={op.clave}
                onClick={() => burbujaOpen && !cooldown && !resultado && responder(op.clave)}
                disabled={!burbujaOpen || cooldown || !!resultado}
                className="flex items-center justify-center rounded-2xl transition-all active:scale-90 hover:scale-110"
                style={{
                  width: 90, height: 90,
                  fontSize: 48,
                  background: burbujaOpen && !resultado ? `${color}15` : 'rgba(0,0,0,0.4)',
                  border: burbujaOpen && !resultado
                    ? `2px solid ${color}77`
                    : '2px solid rgba(255,255,255,0.08)',
                  boxShadow: burbujaOpen && !resultado ? `0 0 24px ${color}33` : 'none',
                  opacity: !burbujaOpen ? 0.25 : 1,
                  cursor: burbujaOpen && !resultado ? 'pointer' : 'default',
                }}>
                {op.emoji}
              </button>
            ))}
          </div>

          {/* Botón ENCIÉNDETE */}
          <button
            onClick={() => {
              if (!completado && !burbujaOpen && !triviaLoading) cargarSet();
            }}
            disabled={completado || burbujaOpen || triviaLoading || cooldown}
            className="px-16 py-4 rounded-2xl font-black text-base uppercase tracking-widest transition-all active:scale-95 hover:scale-105"
            style={{
              background: completado ? 'rgba(255,255,255,0.04)' : `${color}18`,
              border: `1px solid ${completado ? 'rgba(255,255,255,0.08)' : color + '77'}`,
              color: completado ? 'rgba(255,255,255,0.2)' : color,
              boxShadow: completado ? 'none' : `0 0 24px ${color}22`,
              fontFamily: "'Courier New', monospace",
            }}>
            {triviaLoading
              ? 'CARGANDO...'
              : completado
                ? `⏳ PRÓXIMO TURNO: ${proximoTurno}`
                : burbujaOpen
                  ? 'ELIGE TU RESPUESTA'
                  : '💡ACCIÓN💡'}
          </button>

        </footer>
      </main>
    </div>
  );
};

export default DesktopRealityPlayer;