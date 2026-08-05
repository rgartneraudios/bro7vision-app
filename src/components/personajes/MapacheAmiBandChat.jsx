// src/components/personajes/MapacheAmiBandChat.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AgentChatInput       from '../AgentChatInput';
import StoryPanel           from '../StoryPanel';
import StoryListOverlay     from '../StoryListOverlay';
import { useAgentMapache }  from '../../hooks/useAgentMapache';
import { MAPACHE_AMI_CUENTO_MAP } from '../../data/mapache_ami/mapacheData';
import { supabase } from '../../supabaseClient';

const ACCENT = '#00D0FF';
const NOMBRE = 'Mapache & Ami';
const SEP    = '🦝';
const LABEL  = { mapache: '🦝 MAPACHE', ami: '🐺 AMI' };

export default function MapacheAmiBandChat({ iaMode, isAdmin, onHandoff, onMensaje, ciudad = null }) {
  const [activeMember,     setActiveMember]     = useState('mapache');
  const [activeEpisode,    setActiveEpisode]     = useState(null);
  const [cuentos,          setCuentos]           = useState([]);
  const [storyListVisible, setStoryListVisible]  = useState(false);
  const [cuentoActivo,     setCuentoActivo]      = useState(null);

  useEffect(() => {
    supabase
      .from('bro7band_cuentos')
      .select('numero, titulo, audio_url')
      .eq('personaje_id', 'mapache_ami')
      .eq('activo', true)
      .order('numero')
      .then(({ data }) => { if (data) setCuentos(data); });
  }, []);

  const handleInternalHandoff = (data) => {
    if (data?.agente === 'INTERNO') { setActiveMember(data.member_id); return; }
    onHandoff?.(data);
  };

  const handleLaunchStory = (n) => {
    const ep   = MAPACHE_AMI_CUENTO_MAP[n];
    const meta = cuentos.find(c => c.numero === n);
    if (!ep) return;
    setActiveEpisode(ep);
    setCuentoActivo({ ...ep, audioUrl: meta?.audio_url || null });
    setStoryListVisible(false);
  };

  const handleCloseStory = () => { setCuentoActivo(null); setActiveEpisode(null); };

  const { mensaje, loading, enviar } = useAgentMapache({
    personaje:       activeMember,
    iaMode,
    isAdmin,
    ciudad,
    onHandoff:       handleInternalHandoff,
    onShowStoryList: () => setStoryListVisible(true),
    onLaunchStory:   handleLaunchStory,
    storyEpisode:    activeEpisode,
  });

  useEffect(() => {
    if (mensaje) onMensaje?.(mensaje);
  }, [mensaje]);

  return (
    <>
      <div className="flex flex-col items-center gap-1 w-full">
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em',
                       color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
          {LABEL[activeMember]}
        </span>
        <AgentChatInput
          agent="mapache_ami"
          onSend={enviar}
          isLoading={loading}
          rows={1}
          placeholder="Escribe 555 para ver el listado de historias. Las historias no consumen saldo."
        />
      </div>

      {storyListVisible && ReactDOM.createPortal(
        <StoryListOverlay
          cuentos={cuentos}
          personaje={NOMBRE}
          accentColor={ACCENT}
          onClose={() => setStoryListVisible(false)}
          onSelect={handleLaunchStory}
        />,
        document.getElementById('story-portal-target')
      )}

      {cuentoActivo && ReactDOM.createPortal(
        <StoryPanel
          titulo={cuentoActivo.titulo}
          texto={cuentoActivo.texto}
          audioUrl={cuentoActivo.audioUrl}
          accentColor={ACCENT}
          separator={SEP}
          onClose={handleCloseStory}
        />,
        document.getElementById('story-portal-target')
      )}
    </>
  );
}