import React, { useState, useEffect, useRef } from 'react';
import GenesisCounter from './GenesisCounter';
import AgentChatInput from './AgentChatInput';

const GROUPS = [
  { id: 1,  name: 'OSOS',               groupId:'osos',               members:['TITO','LARA','PUFFO'], hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['osos.webp'],             video: 'osos_default.mp4',              top: '8%',  left: '20%',   animDuration: '6s'   },
  { id: 2,  name: 'NOVA',               groupId:'nova',               members:[],                      hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['nova.webp'],             video: 'nova_default.mp4',              top: '12%',  left: '42%',  animDuration: '8s'   },
  { id: 3,  name: 'ISABELLA & PROFESOR',groupId:'isabella_profesor',  members:['ISABELLA','PROFESOR'], hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['elefantes.webp'],       video: 'isabella_profesor_default.mp4', top: '12%', left: '65%',  animDuration: '7s'   },
  { id: 4,  name: 'EVELYN & LARRY',     groupId:'evelyn_larry',       members:['EVELYN','LARRY'],      hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['larry_evelyn.webp'],    video: 'larry_evelyn_default.mp4',      top: '38%', left: '65%',  animDuration: '9s'   },
  { id: 5,  name: 'MAPACHE & AMI',      groupId:'mapache_ami',        members:['MAPACHE','AMI'],       hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['mapache_ami.webp'],     video: 'mapache_ami_default.mp4',       top: '68%', left: '75%',  animDuration: '6.5s' },
  { id: 6,  name: 'ORUMAMA',            groupId:'orumama',            members:[],                      hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['orumama.webp'],         video: 'orumamaDefaults.mp4',           top: '80%', left: '32%',  animDuration: '8.5s' },
  { id: 7,  name: 'SEÑOR MISTERIO',     groupId:'smisterio',          members:[],                      hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['smisterio.webp'],       video: 'smisterioDefaults.mp4',         top: '72%', left: '8%',   animDuration: '7.5s' },
  { id: 8,  name: 'JAGUAR',             groupId:'jaguar',             members:[],                      hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['jaguar.webp'],          video: 'jaguarSignos.mp4',              top: '42%', left: '18%',   animDuration: '9.5s' },
  { id: 9,  name: 'RUMORES',            groupId:'rumores',            members:[],                      hasIA:false, hasAudio:true, hasPalabraClave:true,  hasChat:false, images: ['rumores.webp'],         video: 'reinos.mp4',                    top: '78%', left: '55%',  animDuration: '11s'  },
  { id: 10, name: 'BRO7BAND',           groupId:'bro7band',           members:[],                      hasIA:false, hasAudio:false,hasPalabraClave:false, hasChat:false, images: ['bro7band.webp'],        video: 'https://pub-a77d1f38b28849c1ad7e977150ecb53f.r2.dev/Bro7Band%20Insectos.mp4', top: '45%', left: '44%', animDuration: '10s'  },
];

const GROUP_AGENT_MAP = {
  osos: 'osos',
  nova: 'nova',
  isabella_profesor: 'isabella',
  evelyn_larry: 'evelyn',
  mapache_ami: 'mapache',
  orumama: 'oraculo',
  smisterio: 'oraculo',
  jaguar: 'oraculo',
};

const FRASES_BIENVENIDA = {
  osos: ["Tito aquí 🐻 ¿Qué necesitas hoy?", "Aquí Tito, ¿a dónde te llevo?", "Oye, ¿qué buscas? Yo te ayudo."],
  nova: ["Nova ✨ ¿Qué producto necesitas?", "Dime qué buscas y te encuentro lo mejor."],
  isabella: ["Isabella aquí 💫 ¿Qué servicio necesitas?", "Cuéntame qué buscas, te guío."],
  evelyn: ["Evelyn 🌙 ¿Publicas algo hoy?", "Cuéntame tu deseo, lo hacemos realidad."],
  mapache: ["Mapache 🦝 ¿Buscas música o podcast?", "Ponme ritmo, yo te pongo la banda."],
  oraculo: ["Oráculo 🔮 Las voces me hablan... ¿qué quieres saber?", "Pregunta, y el universo responde."],
};

const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const VIDEO_BASE = 'https://media.bro7vision.com/';
const EMOJI_PATH = '/emojis/';

function Bro7Band({ iaMode, onBack, balances }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeMember, setActiveMember] = useState(null);
  const [iaActive, setIaActive] = useState(false);
  const [palabraClave, setPalabraClave] = useState('');
  const [claimStatus, setClaimStatus] = useState(null);
  const [display, setDisplay] = useState('');
  const [cursor, setCursor] = useState(true);
  const [mensajeBienvenida, setMensajeBienvenida] = useState('');
  const [footerOpen, setFooterOpen] = useState(false);
  const charIdx = useRef(0);

  const group = GROUPS.find(g => g.id === selectedGroup);

  useEffect(() => {
    if (group && group.members.length > 0) {
      setActiveMember(group.members[0]);
    }
  }, [selectedGroup]);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!group) return;
    const agentKey = GROUP_AGENT_MAP[group.groupId];
    const frases = FRASES_BIENVENIDA[agentKey] || ["Bienvenido."];
    const msg = elegir(frases);
    setMensajeBienvenida(msg);
    setDisplay('');
    charIdx.current = 0;
  }, [selectedGroup]);

  useEffect(() => {
    if (!mensajeBienvenida) return;
    charIdx.current = 0;
    setDisplay('');
    const t = setInterval(() => {
      charIdx.current++;
      setDisplay(mensajeBienvenida.slice(0, charIdx.current));
      if (charIdx.current >= mensajeBienvenida.length) clearInterval(t);
    }, 26);
    return () => clearInterval(t);
  }, [mensajeBienvenida]);

  const isAdmin = balances?.is_admin === true;

  const handleClaim = (palabra, grp) => {
    setClaimStatus(null);
    console.log('claim', palabra, grp.groupId);
  };

  const handleAgentSend = (text) => {
    console.log('agent send', text, group?.groupId);
  };

  if (selectedGroup && group) {
    const videoSrc = group.video.startsWith('http') ? group.video : `${VIDEO_BASE}${group.video}`;
    const hasMembers = group.members.length > 0;
    const agentKey = GROUP_AGENT_MAP[group.groupId];

    return (
      <div className="fixed inset-0 z-[90] bg-black overflow-hidden">
        <GenesisCounter balances={balances} />
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div
            onClick={() => setFooterOpen(v => !v)}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-black/70 backdrop-blur-xl border-t border-white/10 cursor-pointer hover:bg-white/5 transition-all select-none"
          >
            <span className={`text-white/60 text-xs font-black uppercase tracking-[0.2em] transition-transform ${footerOpen ? 'rotate-180' : ''}`}>▼</span>
            <span className="text-white/80 text-sm font-black uppercase tracking-[0.25em]">FUNCIONES</span>
            <span className={`text-white/60 text-xs font-black uppercase tracking-[0.2em] transition-transform ${footerOpen ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {footerOpen && (
            <div className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-xl border-t border-white/5">
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => { setSelectedGroup(null); setIaActive(false); setClaimStatus(null); setPalabraClave(''); setMensajeBienvenida(''); }}
                  className="px-8 py-4 rounded-full border-2 border-cyan-400/80 text-cyan-300 text-sm font-black uppercase tracking-widest hover:bg-cyan-400/20 hover:border-cyan-300 transition-all shadow-[0_0_25px_rgba(34,211,238,0.5)] backdrop-blur-md"
                >
                  VOLVER
                </button>
                {group.hasIA && (
                  <button
                    onClick={() => {
                      if (isAdmin) {
                        setIaActive(v => !v);
                      }
                    }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 font-black uppercase tracking-widest backdrop-blur-md transition-all
                      ${iaActive && isAdmin
                        ? 'border-cyan-400 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.7)] bg-cyan-400/10'
                        : 'border-white/20 text-white/30 bg-black/20'}`}
                  >
                    <img src={`${EMOJI_PATH}bro7band.webp`} alt="" className="w-8 h-8 object-contain" />
                    <span className="text-sm">PERSONAJES CON IA</span>
                  </button>
                )}
              </div>

              {group.hasChat && agentKey && (
                <div className="flex items-center gap-6 flex-1 max-w-3xl mx-auto">
                  <div className="flex-1">
                    <AgentChatInput
                      agent={agentKey}
                      onSend={handleAgentSend}
                      isLoading={false}
                      placeholder={hasMembers ? `Habla con ${activeMember}` : undefined}
                    />
                  </div>
                  <div className="flex-1 min-h-[5em] flex items-center border-l border-white/10 pl-4">
                    {display && (
                      <p className="text-white/90 text-sm font-bold italic uppercase leading-relaxed">
                        {display}
                        <span className="inline-block w-[3px] h-[0.8em] ml-1 bg-cyan-400 align-middle" style={{ opacity: cursor ? 1 : 0 }} />
                      </p>
                    )}
                  </div>
                </div>
              )}

              {group.hasPalabraClave && (
                <div className="flex items-center gap-3 shrink-0 mr-[4%]">
                  {group.hasAudio && (
                    <button className="px-6 py-3 rounded-full border-2 border-fuchsia-500/80 text-fuchsia-300 text-sm font-black uppercase tracking-widest hover:bg-fuchsia-500/20 hover:border-fuchsia-400 transition-all shadow-[0_0_30px_rgba(217,70,239,0.6)] backdrop-blur-md">
                      AUDIO
                    </button>
                  )}
                  <div className="w-64 rounded-2xl border border-amber-500/50 bg-black/60 backdrop-blur-md p-3 flex flex-col gap-2">
                    <span className="text-amber-400/80 text-[10px] uppercase tracking-widest font-mono">
                      🔑 {hasMembers ? group.name : group.name.split(' ')[0]}
                    </span>
                    <div className="flex gap-2">
                      <input
                        value={palabraClave}
                        onChange={e => setPalabraClave(e.target.value)}
                        placeholder="Palabra clave del audio..."
                        className="flex-1 bg-transparent border border-amber-500/40 rounded-lg px-3 py-1 text-white text-sm outline-none"
                      />
                      <button onClick={() => handleClaim(palabraClave, group)}
                        className="px-3 py-1 rounded-lg border border-amber-400/60 text-amber-300 text-sm hover:bg-amber-400/20 transition-all">
                        →
                      </button>
                    </div>
                    {claimStatus === 'ok'       && <span className="text-green-400 text-xs">+50 Lunas ✓</span>}
                    {claimStatus === 'error'    && <span className="text-red-400 text-xs">Palabra incorrecta</span>}
                    {claimStatus === 'repetido' && <span className="text-cyan-400 text-xs">Ya canjeado esta semana ✓</span>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black overflow-hidden">
      <GenesisCounter balances={balances} />
      <video
        src="https://media.bro7vision.com/default1_bro7band.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <style>{`
        @keyframes floatPlanet {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-18px) scale(1.04); }
        }
      `}</style>
      {GROUPS.map((g, i) => {
        return (
          <div
            key={g.id}
            style={{
              position: 'absolute',
              top: g.top,
              left: g.left,
              animation: `floatPlanet ${g.animDuration} ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
            className="flex flex-col items-center gap-1"
          >
            <button
              onClick={() => setSelectedGroup(g.id)}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-white/20 bg-black/40 hover:bg-white/10 hover:border-cyan-400/60 transition-all backdrop-blur-md cursor-pointer"
            >
              <div className="w-full h-full flex items-center justify-center">
                {g.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`${EMOJI_PATH}${img}`}
                    alt=""
                    className="w-full h-full object-contain p-2"
                  />
                ))}
              </div>
            </button>
            <span className="text-white/90 text-[10px] md:text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap">
              {g.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default Bro7Band;