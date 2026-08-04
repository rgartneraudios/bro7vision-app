// src/components/personajes/IsabellaProfesorBandChat.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AgentChatInput        from '../AgentChatInput';
import StoryPanel            from '../StoryPanel';
import StoryListOverlay      from '../StoryListOverlay';
import { useAgentIsabella } from '../../hooks/useAgentIsabella';
import { useAgentProfesor } from '../../hooks/useAgentProfesor';
import { ISABELLA_PROFESOR_CUENTO_MAP } from '../../data/isabella_profesor/isabellaData';
import { supabase } from '../../supabaseClient';

const ACCENT  = '#A78BFA';
const NOMBRE  = 'Isabella & Profesor';
const SEP     = '🐘';
const LABEL   = { isabella: '🐘 ISABELLA', profesor: '🐘 PROFESOR' };

export default function IsabellaProfesorBandChat({ iaMode, isAdmin, onHandoff, onMensaje, ciudad = null }) {
  const [activeMember,     setActiveMember]     = useState('isabella');
  const [activeEpisode,    setActiveEpisode]     = useState(null);
  const [cuentos,          setCuentos]           = useState([]);
  const [storyListVisible, setStoryListVisible]  = useState(false);
  const [cuentoActivo,     setCuentoActivo]      = useState(null);

  useEffect(() => {
    supabase
      .from('bro7band_cuentos')
      .select('numero, titulo, audio_url')
      .eq('personaje_id', 'isabella_profesor')
      .eq('activo', true)
      .order('numero')
      .then(({ data }) => { if (data) setCuentos(data); });
  }, []);

  const handleInternalHandoff = (data) => {
    if (data?.agente === 'INTERNO') { setActiveMember(data.member_id); return; }
    onHandoff?.(data);
  };

  const handleLaunchStory = (n) => {
    const ep   = ISABELLA_PROFESOR_CUENTO_MAP[n];
    const meta = cuentos.find(c => c.numero === n);
    if (!ep) return;
    setActiveEpisode(ep);
    setCuentoActivo({ ...ep, audioUrl: meta?.audio_url || null });
    setStoryListVisible(false);
  };

  const handleCloseStory = () => { setCuentoActivo(null); setActiveEpisode(null); };

  const hookProps = {
    iaMode, isAdmin, ciudad,
    onHandoff:       handleInternalHandoff,
    onShowStoryList: () => setStoryListVisible(true),
    onLaunchStory:   handleLaunchStory,
    storyEpisode:    activeEpisode,
  };

  const isabella = useAgentIsabella({ ...hookProps });
  const profesor = useAgentProfesor({ ...hookProps });
  const active   = activeMember === 'isabella' ? isabella : profesor;

  useEffect(() => {
    if (active.mensaje) onMensaje?.(active.mensaje);
  }, [active.mensaje]);

  return (
    <>
      <div className="flex flex-col items-center gap-1 w-full">
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em',
                       color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
          {LABEL[activeMember]}
        </span>
        <AgentChatInput
          agent="isabella_profesor"
          onSend={(text) => active.enviar(text)}
          isLoading={active.loading}
          rows={1}
          placeholder="Escribe 555 para ver el listado de historias. Las historias no consumen saldo."
        />
      </div>

      {storyListVisible && ReactDOM.createPortal(
        <StoryListOverlay cuentos={cuentos} personaje={NOMBRE} accentColor={ACCENT}
          onClose={() => setStoryListVisible(false)} onSelect={handleLaunchStory} />,
        document.getElementById('story-portal-target')
      )}

      {cuentoActivo && ReactDOM.createPortal(
        <StoryPanel titulo={cuentoActivo.titulo} texto={cuentoActivo.texto}
          audioUrl={cuentoActivo.audioUrl} accentColor={ACCENT}
          separator={SEP} onClose={handleCloseStory} />,
        document.getElementById('story-portal-target')
      )}
    </>
  );
}