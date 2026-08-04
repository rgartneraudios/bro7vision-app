// src/components/personajes/OSOSBandChat.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AgentChatInput   from '../AgentChatInput';
import StoryPanel       from '../StoryPanel';
import StoryListOverlay from '../StoryListOverlay';
import { useAgentTito }  from '../../hooks/useAgentTito';
import { useAgentLara }  from '../../hooks/useAgentLara';
import { useAgentPuffo } from '../../hooks/useAgentPuffo';
import { OSOS_CUENTO_MAP } from '../../data/Grupo Osos/ososData';
import { supabase } from '../../supabaseClient';

const ACCENT = '#824FFF';
const NOMBRE = 'Los Osos';
const SEP    = '🐾';
const OSO_LABEL = { tito: '🐾 TITO', lara: '🐾 LARA', puffo: '🐾 PUFFO' };

export default function OSOSBandChat({ iaMode, isAdmin, onHandoff, onMensaje, ciudad = null }) {
  const [activeOso,        setActiveOso]        = useState('tito');
  const [activeEpisode,    setActiveEpisode]     = useState(null);
  const [cuentos,          setCuentos]           = useState([]);
  const [storyListVisible, setStoryListVisible]  = useState(false);
  const [cuentoActivo,     setCuentoActivo]      = useState(null);

  useEffect(() => {
    supabase
      .from('bro7band_cuentos')
      .select('numero, titulo, audio_url')
      .eq('personaje_id', 'osos')
      .eq('activo', true)
      .order('numero')
      .then(({ data }) => { if (data) setCuentos(data); });
  }, []);

  const handleInternalHandoff = (data) => {
    if (data?.agente === 'OSOS_INTERNO') { setActiveOso(data.oso_id); return; }
    onHandoff?.(data);
  };

  const handleLaunchStory = (n) => {
    const ep   = OSOS_CUENTO_MAP[n];
    const meta = cuentos.find(c => c.numero === n);
    if (!ep) return;
    setActiveEpisode(ep);
    setCuentoActivo({ ...ep, audioUrl: meta?.audio_url || null });
    setStoryListVisible(false);
  };

  const handleCloseStory = () => {
    setCuentoActivo(null);
    setActiveEpisode(null);
  };

  const hookProps = {
    iaMode, isAdmin, ciudad,
    onHandoff:       handleInternalHandoff,
    onShowStoryList: () => setStoryListVisible(true),
    onLaunchStory:   handleLaunchStory,
    storyEpisode:    activeEpisode,
  };

  const tito  = useAgentTito ({ ...hookProps });
  const lara  = useAgentLara ({ ...hookProps });
  const puffo = useAgentPuffo({ ...hookProps });

  const active = activeOso === 'tito' ? tito : activeOso === 'lara' ? lara : puffo;

  useEffect(() => {
    if (active.mensaje) onMensaje?.(active.mensaje);
  }, [active.mensaje]);

  return (
    <>
      <div className="flex flex-col items-center gap-1 w-full">
        <span style={{
          fontSize: 9, fontWeight: 900, letterSpacing: '0.25em',
          color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
        }}>
          {OSO_LABEL[activeOso]}
        </span>
        <AgentChatInput
          agent="osos"
          onSend={(text) => active.enviar(text)}
          isLoading={active.loading}
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
          onSelect={(n) => handleLaunchStory(n)}
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