import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import TurnoCountdown from './TurnoCountdown';

// ─── CONFIG DE TURNOS ──────────────────────────────────────────────
// T1: 05h–11h | T2: 11h–17h | T3: 17h–23h | T4: 23h–05h
const TURNOS = {
  1: {
    izquierda: {
      nombre: 'MAPACHE',
      imgOn:  '/assets/mapache-on.webp',
      imgOff: '/assets/mapache-off.webp',
      audio:  'https://media.bro7vision.com/mapache_entrada1.m4a',
      rgb:    [251, 146, 60],
    },
    derecha: {
      nombre: 'PROFESOR',
      imgOn:  '/assets/profesor-on.webp',
      imgOff: '/assets/profesor-off.webp',
      audio:  'https://media.bro7vision.com/Profesor_Entrada1.m4a',
      rgb:    [34, 211, 238],
    },
  },
  2: {
    izquierda: {
      nombre: 'ISABELLA',
      imgOn:  '/assets/isabella-on.webp',
      imgOff: '/assets/isabella-off.webp',
      audio:  'https://media.bro7vision.com/isabella_entrada1.m4a',
      rgb:    [244, 114, 182],
    },
    derecha: {
      nombre: 'EVELYN',
      imgOn:  '/assets/evelyn-on.webp',
      imgOff: '/assets/evelyn-off.webp',
      audio:  'https://media.bro7vision.com/evelyn_entrada1.m4a',
      rgb:    [168, 85, 247],
    },
  },
  3: {
    izquierda: {
      nombre: 'ORUMAMA',
      imgOn:  '/assets/orumama-on.webp',
      imgOff: '/assets/orumama-off.webp',
      audio:  'https://media.bro7vision.com/orumama_entrada1.m4a',
      rgb:    [34, 197, 94],
    },
    derecha: {
      nombre: 'JAGUAR',
      imgOn:  '/assets/jaguar-on.webp',
      imgOff: '/assets/jaguar-off.webp',
      audio:  'https://media.bro7vision.com/jaguar_entrada1.m4a',
      rgb:    [234, 179, 8],
    },
  },
  4: {
    izquierda: {
      nombre: 'S.MISTERIO',
      imgOn:  '/assets/smisterio-on.webp',
      imgOff: '/assets/smisterio-off.webp',
      audio:  'https://media.bro7vision.com/smisterio_entrada1.m4a',
      rgb:    [148, 163, 184],
    },
    derecha: {
      nombre: 'NOVA',
      imgOn:  '/assets/nova-on.webp',
      imgOff: '/assets/nova-off.webp',
      audio:  'https://media.bro7vision.com/nova_entrada1.m4a',
      rgb:    [99, 102, 241],
    },
  },
};

const getTurnoActual = () => {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return 1;
  if (h >= 11 && h < 17) return 2;
  if (h >= 17 && h < 23) return 3;
  return 4;
};

// Helper color
const rgba = (rgb, a) => `rgba(${rgb.join(',')},${a})`;

// ─── SLOT DE PERSONAJE ─────────────────────────────────────────────
const CharSlot = ({ char, playing, onPlay, side }) => (
  <div className={`absolute bottom-0 ${side === 'left' ? 'left-0 pl-4' : 'right-0 pr-4'} z-20 flex flex-col items-center gap-2 pb-4`}>
    <img
      src={playing ? char.imgOn : char.imgOff}
      alt={char.nombre}
      style={{
        width: 200,
        filter: playing ? `drop-shadow(0 0 24px ${rgba(char.rgb, 0.9)})` : 'none',
        transition: 'filter 0.3s ease',
      }}
    />
    <button
      onClick={onPlay}
      className="text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded border transition-all hover:scale-105"
      style={{
        borderColor: playing ? rgba(char.rgb, 0.7) : 'rgba(255,255,255,0.15)',
        color:       playing ? `rgb(${char.rgb.join(',')})` : 'rgba(255,255,255,0.5)',
        background:  playing ? rgba(char.rgb, 0.1) : 'rgba(0,0,0,0.4)',
      }}
    >
      {playing ? `■ ${char.nombre}` : `▶ ${char.nombre}`}
    </button>
  </div>
);

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────
const LunasGate = ({ onGuestAccess }) => {
  const [loading, setLoading]           = useState(false);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [alias, setAlias]               = useState('');
  const [mode, setMode]                 = useState('login');
  const [message, setMessage]           = useState(null);
  const [legalAccepted, setLegalAccepted] = useState(false);

  const [turno, setTurno]         = useState(getTurnoActual);
  const [playingIzq, setPlayingIzq] = useState(false);
  const [playingDer, setPlayingDer] = useState(false);
  const audioIzq = useRef(null);
  const audioDer = useRef(null);

  const charIzq = TURNOS[turno].izquierda;
  const charDer = TURNOS[turno].derecha;

  // Vigila cambio de turno cada minuto
  useEffect(() => {
    const iv = setInterval(() => {
      const nuevo = getTurnoActual();
      setTurno(prev => prev !== nuevo ? nuevo : prev);
    }, 60_000);
    return () => clearInterval(iv);
  }, []);

  // Al cambiar turno detiene cualquier audio activo
  useEffect(() => {
    [audioIzq, audioDer].forEach(ref => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
    setPlayingIzq(false);
    setPlayingDer(false);
  }, [turno]);

  const handlePlayIzq = () => {
    if (playingIzq) {
      audioIzq.current.pause();
      audioIzq.current.currentTime = 0;
      setPlayingIzq(false);
    } else {
      if (audioDer.current) { audioDer.current.pause(); audioDer.current.currentTime = 0; }
      setPlayingDer(false);
      audioIzq.current.play();
      setPlayingIzq(true);
    }
  };

  const handlePlayDer = () => {
    if (playingDer) {
      audioDer.current.pause();
      audioDer.current.currentTime = 0;
      setPlayingDer(false);
    } else {
      if (audioIzq.current) { audioIzq.current.pause(); audioIzq.current.currentTime = 0; }
      setPlayingIzq(false);
      audioDer.current.play();
      setPlayingDer(true);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!legalAccepted) return;
    setLoading(true);
    setMessage(null);
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { alias, role: 'citizen' } },
        });
        if (error) throw error;
        setMessage("✅ Identidad creada. Revisa tu email para activar el enlace neural.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(`❌ Error de acceso: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden font-mono text-white">

      {/* FONDO */}
      <div className="absolute inset-0 z-0">
        <video
          src="https://media.bro7vision.com/genesisgate.mp4"
          autoPlay loop muted playsInline
          className="w-full h-full object-cover opacity-100"
        />
      </div>

      {/* TARJETA */}
      <div className="relative z-10 w-full max-w-md p-8 border border-white/10 bg-black/70 backdrop-blur-xl rounded-2xl shadow-[0_0_100px_rgba(34,211,238,0.15)] animate-zoomIn">

        <div className="text-center mb-6">
          <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            BRO7VISION
          </h1>
          <p className="text-[10px] text-gray-300 uppercase tracking-[0.5em] mt-2 font-bold">Lunas Access Point</p>
        </div>

        <div className="mb-6 flex justify-center">
          <TurnoCountdown />
        </div>

        {message && (
          <div className={`mb-6 p-4 text-xs border rounded ${message.includes('Error') ? 'border-red-500 text-red-400 bg-red-900/40' : 'border-green-500 text-green-400 bg-green-900/40'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-3">

          {mode === 'register' && (
            <div>
              <label className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1 block font-bold">Alias (Nick)</label>
              <input type="text" required placeholder="Cyber_User"
                className="w-full bg-black/50 border border-white/20 text-white text-sm px-4 py-3 rounded focus:border-cyan-500 focus:outline-none transition-all placeholder-gray-600 focus:bg-black/80"
                value={alias} onChange={(e) => setAlias(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="text-[9px] text-fuchsia-400 uppercase tracking-widest mb-1 block font-bold">Email</label>
            <input type="email" required placeholder="citizen@brovision.com"
              className="w-full bg-black/50 border border-white/20 text-white text-sm px-4 py-3 rounded focus:border-fuchsia-500 focus:outline-none transition-all placeholder-gray-600 focus:bg-black/80"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[9px] text-gray-400 uppercase tracking-widest mb-1 block font-bold">Password</label>
            <input type="password" required placeholder="••••••••"
              className="w-full bg-black/50 border border-white/20 text-white text-sm px-4 py-3 rounded focus:border-white focus:outline-none transition-all placeholder-gray-600 focus:bg-black/80"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-3 mt-1 p-2 border border-white/5 rounded bg-white/5 hover:bg-white/10 transition-colors">
            <input type="checkbox" id="legalCheck"
              checked={legalAccepted}
              onChange={(e) => setLegalAccepted(e.target.checked)}
              className="mt-1 w-3 h-3 accent-fuchsia-500 cursor-pointer"
            />
            <label htmlFor="legalCheck" className="text-[9px] text-gray-400 leading-tight cursor-pointer select-none text-left">
              Acepto el <span className="text-cyan-400 font-bold hover:underline">Protocolo de Ciudadanía</span> y <span className="text-cyan-400 font-bold hover:underline">Términos Fase 1</span>.
            </label>
          </div>

          <button disabled={loading || !legalAccepted} type="submit"
            className="mt-2 w-full py-3 bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-400 hover:scale-[1.02] transition-all rounded shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:shadow-none"
          >
            {loading ? 'SINTONIZANDO...' : (mode === 'login' ? 'INICIAR SESIÓN' : 'REGISTRAR ID')}
          </button>

        </form>

        <div className="mt-3">
          <button onClick={onGuestAccess}
            className="w-full py-2 border border-white/10 text-gray-500 text-[9px] font-bold uppercase tracking-widest hover:text-white hover:border-white/40 hover:bg-white/5 transition-all rounded"
          >
            👁️ Explorar como Visitante (Solo Lectura)
          </button>
        </div>

        <div className="mt-4 text-center pb-4 border-b border-white/10">
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(null); }}
            className="text-[10px] text-gray-500 hover:text-cyan-400 transition-colors"
          >
            {mode === 'login' ? "¿Nuevo en la Red? Crear ID" : "Volver a Iniciar Sesión"}
          </button>
        </div>

      </div>

      {/* AUDIO — key={turno} fuerza remount con nuevo src al cambiar turno */}
      <audio key={`izq-${turno}`} ref={audioIzq} src={charIzq.audio} onEnded={() => setPlayingIzq(false)} />
      <audio key={`der-${turno}`} ref={audioDer} src={charDer.audio} onEnded={() => setPlayingDer(false)} />

      {/* PERSONAJES */}
      <CharSlot char={charIzq} playing={playingIzq} onPlay={handlePlayIzq} side="left"  />
      <CharSlot char={charDer} playing={playingDer} onPlay={handlePlayDer} side="right" />

    </div>
  );
};

export default LunasGate;