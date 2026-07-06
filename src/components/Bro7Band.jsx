import React, { useState } from 'react';
import GenesisCounter from './GenesisCounter';

const GROUPS = [
  { id: 1,  name: 'OSOS',                   images: ['osos.webp'],             video: 'osos_default.mp4',              hasIA: true,  top: '8%',  left: '20%',   animDuration: '6s'   },
  { id: 2,  name: 'NOVA',                   images: ['nova.webp'],                                        video: 'nova_default.mp4',             hasIA: true,  top: '12%',  left: '42%',  animDuration: '8s'   },
  { id: 3,  name: 'ISABELLA & PROFESOR',    images: ['elefantes.webp'],                   video: 'isabella_profesor_default.mp4', hasIA: true,  top: '12%', left: '65%',  animDuration: '7s'   },
  { id: 4,  name: 'EVELYN & LARRY',         images: ['larry_evelyn.webp'],                        video: 'larry_evelyn_default.mp4',     hasIA: true,  top: '38%', left: '65%',  animDuration: '9s'   },
  { id: 5,  name: 'MAPACHE & AMI',          images: ['mapache_ami.webp'],                         video: 'mapache_ami_default.mp4',      hasIA: true,  top: '68%', left: '75%',  animDuration: '6.5s' },
  { id: 6,  name: 'ORUMAMA',                images: ['orumama.webp'],                                     video: 'orumamaDefaults.mp4',          hasIA: false, top: '80%', left: '32%',  animDuration: '8.5s' },
  { id: 7,  name: 'SEÑOR MISTERIO',         images: ['smisterio.webp'],                                   video: 'smisterioDefaults.mp4',        hasIA: false, top: '72%', left: '8%',   animDuration: '7.5s' },
  { id: 8,  name: 'JAGUAR',                 images: ['jaguar.webp'],                                      video: 'jaguarSignos.mp4',             hasIA: true,  top: '42%', left: '18%',   animDuration: '9.5s' },
  { id: 9,  name: 'RUMORES',                images: ['rumores.webp'],                                     video: 'reinos.mp4',                   hasIA: false, top: '78%', left: '55%',  animDuration: '11s'  },
  { id: 10, name: 'BRO7BAND',               images: ['bro7band.webp'],                                    video: 'https://pub-a77d1f38b28849c1ad7e977150ecb53f.r2.dev/Bro7Band%20Insectos.mp4', hasIA: false, top: '45%', left: '44%', animDuration: '10s'  },
];

const VIDEO_BASE = 'https://media.bro7vision.com/';
const EMOJI_PATH = '/emojis/';

function Bro7Band({ iaMode, onBack, balances }) {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const group = GROUPS.find(g => g.id === selectedGroup);

  if (selectedGroup && group) {
    const videoSrc = group.video.startsWith('http') ? group.video : `${VIDEO_BASE}${group.video}`;
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
        <button
          onClick={() => setSelectedGroup(null)}
          className="absolute top-6 left-6 z-10 px-8 py-4 rounded-full border-2 border-cyan-400/80 text-cyan-300 text-sm font-black uppercase tracking-widest hover:bg-cyan-400/20 hover:border-cyan-300 transition-all shadow-[0_0_25px_rgba(34,211,238,0.5)] backdrop-blur-md"
        >
          VOLVER
        </button>
        <div className="absolute bottom-6 left-6 z-10">
          <button className="px-10 py-4 rounded-full border-2 border-fuchsia-500/80 text-fuchsia-300 text-base font-black uppercase tracking-widest hover:bg-fuchsia-500/20 hover:border-fuchsia-400 transition-all shadow-[0_0_30px_rgba(217,70,239,0.6)] backdrop-blur-md">
            AUDIO
          </button>
        </div>
        <div className="absolute bottom-6 right-6 z-10">
          {group.hasIA && iaMode && (
            <div className="mb-4 w-64 h-16 rounded-2xl border border-dashed border-cyan-500/40 bg-cyan-950/10 flex items-center justify-center">
              <span className="text-cyan-500/60 text-xs uppercase tracking-widest font-mono">
                BANNER IA
              </span>
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