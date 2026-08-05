// src/components/personajes/RumoresBandChat.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AgentChatInput   from '../AgentChatInput';
import StoryPanel       from '../StoryPanel';
import StoryListOverlay from '../StoryListOverlay';
import { useAgentRumores } from '../../hooks/useAgentRumores';
import { RUMORES_CUENTO_MAP } from '../../data/rumores/rumoresData';
import { supabase } from '../../supabaseClient';

const ACCENT = '#F97316';
const NOMBRE = 'Rumores';
const SEP    = '🎬';

export default function RumoresBandChat({ iaMode, isAdmin, onHandoff, onMensaje, ciudad = null }) {
  const [cuentos,          setCuentos]          = useState([]);
  const [storyListVisible, setStoryListVisible] = useState(false);
  const [cuentoActivo,     setCuentoActivo]     = useState(null);
  const [activeEpisode,    setActiveEpisode]    = useState(null);

  useEffect(() => {
    supabase
      .from('bro7band_cuentos')
      .select('numero, titulo, audio_url')
      .eq('personaje_id', 'rumores')
      .eq('activo', true)
      .order('numero')
      .then(({ data }) => { if (data) setCuentos(data); });
  }, []);

  const handleLaunchStory = (n) => {
    const ep   = RUMORES_CUENTO_MAP[n];
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

  const { mensaje, loading, enviar } = useAgentRumores({
    iaMode,
    isAdmin,
    onHandoff,
    ciudad,
    onShowStoryList: () => setStoryListVisible(true),
    onLaunchStory:   handleLaunchStory,
    storyEpisode:    activeEpisode,
  });

  useEffect(() => {
    if (mensaje) onMensaje?.(mensaje);
  }, [mensaje]);

  return (
    <>
      <AgentChatInput
        agent="rumores"
        onSend={enviar}
        isLoading={loading}
        rows={1}
        placeholder="Escribe 555 para ver el listado de exclusivas. Las historias no consumen saldo."
      />

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