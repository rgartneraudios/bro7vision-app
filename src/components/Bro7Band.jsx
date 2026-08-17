import React, { useState, useEffect, useRef } from 'react';
import LunasCounter from './LunasCounter';
import AgentChatInput from './AgentChatInput';
import { supabase } from '../supabaseClient';
import { getAudioForOsos }      from '../data/audioMap_osos';
import { getAudioForNova }      from '../data/audioMap_nova';
import { getAudioForIsabella }  from '../data/audioMap_isabella';
import { getAudioForMapache }   from '../data/audioMap_mapache';
import { getAudioForSmisterio } from '../data/audioMap_smisterio';
import { getAudioForOrumama }   from '../data/audioMap_orumama';
import { getAudioForJaguar }    from '../data/audioMap_jaguar';
import { getAudioForRumores }   from '../data/audioMap_rumores';
import { getAudioForEvelyn }    from '../data/audioMap_evelyn';
import ChapterGrid from './ChapterGrid';
import ChapterPlayer from './ChapterPlayer';
import SmisterioBandChat from './personajes/SmisterioBandChat';
import JaguarBandChat from './personajes/JaguarBandChat';
import OrumamaBandChat from './personajes/OrumamaBandChat';
import OSOSBandChat from './personajes/OSOSBandChat';
import NovaBandChat from './personajes/NovaBandChat';
import RumoresBandChat from './personajes/RumoresBandChat';
import EvelynLarryBandChat      from './personajes/EvelynLarryBandChat';
import IsabellaProfesorBandChat from './personajes/IsabellaProfesorBandChat';
import MapacheAmiBandChat from './personajes/MapacheAmiBandChat';
import StoryListOverlay from './StoryListOverlay';
import StoryPanel from './StoryPanel';
import { getMoonSuffix } from '../utils/moonUtils';

const AUDIO_RESOLVER_MAP = {
  osos:              getAudioForOsos,
  nova:              getAudioForNova,
  isabella_profesor: getAudioForIsabella,
  mapache_ami:       getAudioForMapache,
  smisterio:         getAudioForSmisterio,
  orumama:           getAudioForOrumama,
  jaguar:            getAudioForJaguar,
  rumores:           getAudioForRumores,
  evelyn_larry:      getAudioForEvelyn,
};

const DEMO_AUDIO_MAP = {
  osos:              'https://media.bro7vision.com/stories/osos_0.m4a',
  nova:              'https://media.bro7vision.com/stories/nova_00.m4a',
  isabella_profesor: 'https://media.bro7vision.com/stories/isabella_0.m4a',
  evelyn_larry:      'https://media.bro7vision.com/stories/evelyn_0.m4a',
  mapache_ami:       'https://media.bro7vision.com/stories/mapache_0.m4a',
  orumama:           'https://media.bro7vision.com/stories/orumama_0.m4a',
  smisterio:         'https://media.bro7vision.com/stories/smisterio_0.m4a',
  jaguar:            'https://media.bro7vision.com/stories/jaguar_0.m4a',
  rumores:           'https://media.bro7vision.com/stories/rumores_0.m4a',
};

const GROUPS = [
  { id: 1,  name: 'OSOS',               groupId:'osos',               members:['TITO','LARA','PUFFO'], hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['osos.webp'],             video: 'osos_default5.mp4',              top: '8%',  left: '20%',   animDuration: '6s'   },
  { id: 2,  name: 'NOVA',               groupId:'nova',               members:[],                      hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['nova.webp'],             video: 'nova_default7.mp4',              top: '12%',  left: '42%',  animDuration: '8s'   },
  { id: 3,  name: 'ISABELLA & PROFESOR',groupId:'isabella_profesor',  members:['ISABELLA','PROFESOR'], hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['elefantes.webp'],       video: 'isabella_default7.mp4', top: '12%', left: '65%',  animDuration: '7s'   },
  { id: 4,  name: 'EVELYN & LARRY',     groupId:'evelyn_larry',       members:['EVELYN','LARRY'],      hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['larry_evelyn.webp'],    video: 'evelyn_default5.mp4',      top: '38%', left: '65%',  animDuration: '9s'   },
  { id: 5,  name: 'MAPACHE & AMI',      groupId:'mapache_ami',        members:['MAPACHE','AMI'],       hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['mapache_ami.webp'],     video: 'mapache_default7.mp4',       top: '68%', left: '75%',  animDuration: '6.5s' },
  { id: 6,  name: 'ORUMAMA',            groupId:'orumama',            members:[],                      hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['orumama.webp'],         video: 'orumamaDefaults.mp4',           top: '80%', left: '32%',  animDuration: '8.5s' },
  { id: 7,  name: 'SEÑOR MISTERIO',     groupId:'smisterio',          members:[],                      hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['smisterio.webp'],       video: 'smisterioDefaults.mp4',         top: '72%', left: '8%',   animDuration: '7.5s' },
  { id: 8,  name: 'JAGUAR',             groupId:'jaguar',             members:[],                      hasIA:true,  hasAudio:true, hasPalabraClave:true,  hasChat:true,  images: ['jaguar.webp'],          video: 'jaguarSignos.mp4',              top: '42%', left: '18%',   animDuration: '9.5s' },
  { id: 9,  name: 'RUMORES',            groupId:'rumores',            members:[],                      hasIA:true, hasAudio:true, hasPalabraClave:true,  hasChat:true, images: ['rumores.webp'],         video: 'rumores_default5.mp4',                    top: '78%', left: '55%',  animDuration: '11s'  },
  { id: 10, name: 'BRO7BAND',           groupId:'bro7band',           members:[],                      hasIA:false, hasAudio:false,hasPalabraClave:false, hasChat:false, images: ['bro7band.webp'],        video: 'https://pub-a77d1f38b28849c1ad7e977150ecb53f.r2.dev/Bro7Band_Insectos5.mp4', top: '45%', left: '44%', animDuration: '10s'  },
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
  rumores: 'rumores',
};

const normalizar = (str) =>
  str.trim().toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const VIDEO_BASE = 'https://media.bro7vision.com/';
const EMOJI_PATH = '/emojis/';

function Bro7Band({ iaMode, onBack, balances, setBalances }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeMember, setActiveMember] = useState(null);
  const [iaActive, setIaActive] = useState(false);
  const [palabraClave, setPalabraClave] = useState('');
  const [claimStatus, setClaimStatus] = useState(null);
  const [cursor, setCursor] = useState(true);
  const [iaMensaje, setIaMensaje] = useState('');
  const [demoPlaying, setDemoPlaying] = useState(false);
  const demoAudioRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const faseLunar = getMoonSuffix();
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [userId, setUserId] = useState(null);
  const [storyModal, setStoryModal] = useState(null);

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
    setIaMensaje('');
    setDemoPlaying(false);
    if (demoAudioRef.current) {
      demoAudioRef.current.pause();
      demoAudioRef.current.src = '';
    }
  }, [selectedGroup]);

  useEffect(() => {
    const fetchLocation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('city, country')
        .eq('id', user.id)
        .single();
      if (data) setUserLocation({ city: data.city, country: data.country });
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!group || !group.hasAudio) { setAudioUrl(null); return; }
    const resolver = AUDIO_RESOLVER_MAP[group.groupId];
    if (!resolver) { setAudioUrl(null); return; }
    const url = resolver(userLocation);
    setAudioUrl(url);
    setAudioPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, [selectedGroup, userLocation]);

  const isAdmin = balances?.is_admin === true;
  const modoIA = isAdmin ? 'admin' : null;

  const handleDemo = () => {
    const url = DEMO_AUDIO_MAP[group?.groupId];
    if (!url || !demoAudioRef.current) return;
    if (demoPlaying) {
      demoAudioRef.current.pause();
      setDemoPlaying(false);
    } else {
      demoAudioRef.current.src = url;
      demoAudioRef.current.play();
      setDemoPlaying(true);
    }
  };

  const handleClaim = async (palabra, grp) => {
    setClaimStatus(null);
    if (!palabra.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: audioData, error: audioError } = await supabase
      .from('bro7band_audios')
      .select('id, palabra_clave, lunas_recompensa')
      .eq('personaje_id', grp.groupId)
      .eq('activo', true)
      .eq('fase_lunar', faseLunar)
      .single();

    if (audioError || !audioData) {
      setClaimStatus('error');
      return;
    }

    if (normalizar(palabra) !== normalizar(audioData.palabra_clave)) {
      setClaimStatus('error');
      return;
    }

    const { data: claimExistente } = await supabase
      .from('bro7band_claims')
      .select('id')
      .eq('user_id', user.id)
      .eq('audio_id', audioData.id)
      .eq('fase_lunar', faseLunar)
      .maybeSingle();

    if (claimExistente) {
      setClaimStatus('repetido');
      return;
    }

    const { error: claimError } = await supabase
      .from('bro7band_claims')
      .insert({
        user_id: user.id,
        audio_id: audioData.id,
        fase_lunar: faseLunar
      });

    if (claimError) {
      setClaimStatus('error');
      return;
    }

    const { error: lunasError } = await supabase.rpc('incrementar_lunas', {
      uid: user.id,
      delta: audioData.lunas_recompensa
    });

    if (lunasError) {
      setClaimStatus('error');
      return;
    }

    setClaimStatus('ok');

    // Refrescar contador de Lunas
    const { data: perfilActualizado } = await supabase
      .from('profiles')
      .select('lunas')
      .eq('id', user.id)
      .single();

    if (perfilActualizado && setBalances) {
      setBalances(prev => ({
        ...prev,
        lunas: perfilActualizado.lunas
      }));
    }
  };

  const handleAgentSend = (text) => {
    console.log('agent send', text, group?.groupId);
  };

  const handleAudio = () => {
    if (!audioUrl || !audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setAudioPlaying(true);
    }
  };

  const handleAudioEnded = () => setAudioPlaying(false);

  if (selectedGroup && group && group.id !== 10) {

    const videoSrc = group.video.startsWith('http') ? group.video : `${VIDEO_BASE}${group.video}`;
    const hasMembers = group.members.length > 0;
    const agentKey = GROUP_AGENT_MAP[group.groupId];

    return (
      <div className="fixed inset-0 z-[90] bg-black overflow-hidden">
        <LunasCounter balances={balances} />
        <button
          onClick={() => { setSelectedGroup(null); setIaActive(false); setClaimStatus(null); setPalabraClave(''); }}
          className="fixed top-4 left-4 z-[110] px-6 py-3 rounded-full border-2 border-cyan-400/80 text-cyan-300 text-sm font-black uppercase tracking-widest hover:bg-cyan-400/20 hover:border-cyan-300 transition-all shadow-[0_0_25px_rgba(34,211,238,0.5)] backdrop-blur-md"
        >
          VOLVER
        </button>
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        <audio ref={audioRef} onEnded={handleAudioEnded} />
        <audio ref={demoAudioRef} onEnded={() => setDemoPlaying(false)} />

        {iaMensaje && (
          <div style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            maxWidth: '560px',
            width: '90%',
            background: 'rgba(0,0,0,0.70)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '1.25rem',
            padding: '0.75rem 1.25rem',
            pointerEvents: 'none',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.90)',
              fontSize: '0.85rem',
              fontWeight: 700,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              margin: 0,
              lineHeight: 1.5,
            }}>
              {iaMensaje}
              <span style={{
                display: 'inline-block', width: 3, height: '0.8em',
                marginLeft: 4, background: '#22d3ee', verticalAlign: 'middle',
                opacity: cursor ? 1 : 0,
              }} />
            </p>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="flex items-center justify-between px-6 py-3 bg-black/80 backdrop-blur-xl border-t border-white/5"
               onFocus={() => setIaMensaje('')}>

            <div className="flex items-center gap-2 shrink-0">
              {group.hasIA && (
                <button
                  onClick={() => { if (modoIA) setIaActive(v => !v); }}
                  title={!modoIA ? 'Disponible con Prepago IA' : ''}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-black uppercase tracking-widest backdrop-blur-md transition-all text-sm shrink-0
                    ${iaActive && modoIA
                      ? 'border-cyan-400 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.7)] bg-cyan-400/10'
                      : modoIA
                        ? 'border-white/20 text-white/30 bg-black/20 hover:border-white/40'
                        : 'border-white/10 text-white/15 bg-black/10 cursor-not-allowed opacity-50'}`}
                >
                  <img src={`${EMOJI_PATH}bro7band.webp`} alt="" className="w-6 h-6 object-contain" />
                  <span>PERSONAJES IA</span>
                </button>
              )}

              {DEMO_AUDIO_MAP[group.groupId] && (
                <button onClick={handleDemo}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-black uppercase tracking-widest backdrop-blur-md transition-all
                    ${demoPlaying
                      ? 'border-lime-400 text-lime-200 bg-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.6)]'
                      : 'border-lime-500/60 text-lime-300 hover:bg-lime-500/20'}`}>
                  {demoPlaying ? '⏸ DEMO' : '🎵 DEMO'}
                </button>
              )}
            </div>

            {group.hasChat && agentKey && (
              <div className="flex-1 mx-4 flex justify-center" onFocus={() => setIaMensaje('')}>
                {iaActive && modoIA && group.groupId === 'smisterio' && (
                  <SmisterioBandChat iaMode={modoIA} isAdmin={isAdmin}
                    onHandoff={() => setSelectedGroup(null)} onMensaje={setIaMensaje} />
                )}
                {iaActive && modoIA && group.groupId === 'jaguar' && (
                  <JaguarBandChat iaMode={modoIA} isAdmin={isAdmin}
                    onHandoff={() => setSelectedGroup(null)} onMensaje={setIaMensaje} />
                )}
                {iaActive && modoIA && group.groupId === 'orumama' && (
                  <OrumamaBandChat iaMode={modoIA} isAdmin={isAdmin}
                    onHandoff={() => setSelectedGroup(null)} onMensaje={setIaMensaje} />
                )}
                {iaActive && modoIA && group.groupId === 'osos' && (
                  <OSOSBandChat
                    iaMode={modoIA}
                    isAdmin={isAdmin}
                    onHandoff={() => setSelectedGroup(null)}
                    onMensaje={setIaMensaje}
                  />
                )}
{iaActive && modoIA && group.groupId === 'nova' && (
  <NovaBandChat
    iaMode={modoIA}
    isAdmin={isAdmin}
    onHandoff={() => setSelectedGroup(null)}
    onMensaje={setIaMensaje}
  />
)}
{iaActive && modoIA && group.groupId === 'rumores' && (
  <RumoresBandChat
    iaMode={modoIA}
    isAdmin={isAdmin}
    onHandoff={() => setSelectedGroup(null)}
    onMensaje={setIaMensaje}
  />
)}
                {iaActive && modoIA && group.groupId === 'evelyn_larry' && (
                  <EvelynLarryBandChat iaMode={modoIA} isAdmin={isAdmin}
                    onHandoff={() => setSelectedGroup(null)} onMensaje={setIaMensaje} />
                )}
                {iaActive && modoIA && group.groupId === 'isabella_profesor' && (
                  <IsabellaProfesorBandChat iaMode={modoIA} isAdmin={isAdmin}
                    onHandoff={() => setSelectedGroup(null)} onMensaje={setIaMensaje} />
                )}
                {iaActive && modoIA && group.groupId === 'mapache_ami' && (
                  <MapacheAmiBandChat
                    iaMode={modoIA}
                    isAdmin={isAdmin}
                    onHandoff={() => setSelectedGroup(null)}
                    onMensaje={setIaMensaje}
                  />
                )}
                {(!iaActive || !modoIA) && (
                  <AgentChatInput
                    agent={agentKey}
                    onSend={handleAgentSend}
                    isLoading={false}
                    rows={1}
                    placeholder={iaActive && !modoIA
                      ? 'Activa Prepago IA para chatear...'
                      : hasMembers ? `Habla con ${activeMember} (Modo IA) Escribe 555 para ver el listado de historias, si hay un listado, aparecerá en el centro. Ten en cuenta que los personajes te cuentan historias de ficción y entretenimiento. Las historias no te consumen saldo, solo lo consumen los mensajes.` : undefined}
                  />
                )}
              </div>
            )}

            <div className="flex items-center gap-3 shrink-0 mr-10">
              {group.hasAudio && (
                <button onClick={handleAudio}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-black uppercase tracking-widest backdrop-blur-md transition-all
                    ${audioPlaying
                      ? 'border-fuchsia-400 text-fuchsia-200 bg-fuchsia-500/20 shadow-[0_0_30px_rgba(217,70,239,0.8)]'
                      : 'border-fuchsia-500/80 text-fuchsia-300 hover:bg-fuchsia-500/20'}`}>
                  {audioPlaying ? '⏸ AUDIO' : '▶ AUDIO'}
                </button>
              )}

              {group.hasPalabraClave && (
                <div className="w-56 rounded-2xl border border-cyan-400/60 bg-black/60 backdrop-blur-md p-1.5 flex flex-col gap-0 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                  <div className="flex gap-2">
                    <input
                      value={palabraClave}
                      onChange={e => setPalabraClave(e.target.value)}
                      placeholder="Palabra clave del audio..."
                      className="flex-1 bg-transparent border border-cyan-500/40 rounded-lg px-2 py-1 text-white text-sm outline-none"
                    />
                    <button onClick={() => handleClaim(palabraClave, group)}
                      className="px-2 py-1 rounded-lg border border-cyan-400/60 text-cyan-300 text-sm hover:bg-cyan-400/20 transition-all">
                      →
                    </button>
                  </div>
                  {claimStatus === 'ok'       && <span className="text-green-400 text-xs">+50 Lunas ✓</span>}
                  {claimStatus === 'error'    && <span className="text-red-400 text-xs">Palabra incorrecta</span>}
                  {claimStatus === 'repetido' && <span className="text-cyan-400 text-xs">Ya canjeado esta fase ✓</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div id="story-portal-target" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black overflow-hidden">
      <LunasCounter balances={balances} />
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

      <div
        style={{
          position: 'absolute',
          top: '22%',
          left: '85%',
          animation: 'floatPlanet 7s ease-in-out infinite',
          animationDelay: '1.2s',
          width: '190px',
          height: '190px',
          pointerEvents: 'none',
        }}
      >
        <div className="rounded-full border border-fuchsia-500/30 bg-black/30 backdrop-blur-md w-full h-full flex flex-col items-center justify-center px-4">
          <p className="text-fuchsia-300 text-sm font-bold uppercase tracking-wide leading-relaxed text-center">
            🎵<br />Gana Lunas<br />Pulsa un grupo<br />y descubre la<br />palabra clave<br />que hay en<br />sus audios
          </p>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '84%',
          animation: 'floatPlanet 8s ease-in-out infinite',
          animationDelay: '2.4s',
          width: '220px',
          height: '220px',
          pointerEvents: 'none',
        }}
      >
        <div className="rounded-full border border-lime-500/30 bg-black/30 backdrop-blur-md w-full h-full flex flex-col items-center justify-center px-4">
          <p className="text-lime-300 text-sm font-bold uppercase tracking-wide leading-relaxed text-center">
            💚<br />Gana 100 Lunas<br />viendo los capítulos<br />de Bro7band!<br />en cada Fase Lunar
          </p>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '22%',
          left: '5%',
          animation: 'floatPlanet 9s ease-in-out infinite',
          animationDelay: '3.5s',
          width: '190px',
          height: '190px',
          pointerEvents: 'none',
        }}
      >
        <div className="rounded-full border border-cyan-500/30 bg-black/30 backdrop-blur-md w-full h-full flex flex-col items-center justify-center px-4">
          <p className="text-cyan-300 text-sm font-bold uppercase tracking-wide leading-relaxed text-center">
            🤖<br />¡Los personajes<br />tienen modo IA!<br />Chatea con ellos<br />y descubre<br />sus historias<br />en audios<br />exclusivos
          </p>
        </div>
      </div>

      {selectedGroup === 10 && !selectedChapter && (
        <ChapterGrid
          faseLunar={faseLunar}
          userId={userId}
          onSelectChapter={setSelectedChapter}
          onClose={() => setSelectedGroup(null)}
        />
      )}

      {selectedChapter && (
        <ChapterPlayer
          chapter={selectedChapter}
          faseLunar={faseLunar}
          userId={userId}
          onClose={() => setSelectedChapter(null)}
          onReward={(lunas) => {
            setBalances(prev => ({ ...prev, lunas: (prev.lunas || 0) + lunas }));
          }}
        />
      )}
    </div>
  );
}

export default Bro7Band;