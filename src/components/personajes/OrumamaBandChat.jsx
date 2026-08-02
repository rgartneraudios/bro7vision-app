// src/components/personajes/OrumamaBandChat.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AgentChatInput from '../AgentChatInput';
import StoryPanel from '../StoryPanel';
import StoryListOverlay from '../StoryListOverlay';
import { useAgentOrumama } from '../../hooks/useAgentOrumama';
import { ORUMAMA_CUENTO_MAP } from '../../data/orumama/orumamaData';
import { supabase } from '../../supabaseClient';

const ACCENT  = '#84cc16';
const NOMBRE  = 'Orumama';

export default function OrumamaBandChat({ iaMode, isAdmin, onHandoff, onMensaje }) {
  const [cuentos,          setCuentos]          = useState([]);
  const [storyListVisible, setStoryListVisible] = useState(false);
  const [cuentoActivo,     setCuentoActivo]     = useState(null);

  useEffect(() => {
    supabase
      .from('bro7band_cuentos')
      .select('numero, titulo, audio_url')
      .eq('personaje_id', 'orumama')
      .eq('activo', true)
      .order('numero')
      .then(({ data }) => { if (data) setCuentos(data); });
  }, []);

  const { mensaje, loading, enviar, setStoryContext } = useAgentOrumama({
    iaMode,
    isAdmin,
    onHandoff,
    onShowStoryList: () => setStoryListVisible(true),
    onLaunchStory: (n) => {
      const ep   = ORUMAMA_CUENTO_MAP[n];
      const meta = cuentos.find(c => c.numero === n);
      if (ep) {
        setCuentoActivo({ ...ep, audioUrl: meta?.audio_url || null });
        setStoryContext(ep);
        setStoryListVisible(false);
      }
    },
  });

  useEffect(() => {
    if (mensaje) onMensaje?.(mensaje);
  }, [mensaje]);

  return (
    <>
      <AgentChatInput
        agent="oraculo"
        onSend={enviar}
        isLoading={loading}
        rows={1}
        placeholder="Pregunta a Orumama. Escribe 555 para ver el listado de historias, si hay un listado, aparecerá en el centro. Ten en cuenta que los personajes te cuentan historias de ficción y entretenimiento. Las historias no te consumen saldo, solo lo consumen los mensajes."
      />

      {storyListVisible && ReactDOM.createPortal(
        <StoryListOverlay
          cuentos={cuentos}
          personaje={NOMBRE}
          accentColor={ACCENT}
          onClose={() => setStoryListVisible(false)}
          onSelect={(n) => {
            const ep   = ORUMAMA_CUENTO_MAP[n];
            const meta = cuentos.find(c => c.numero === n);
            if (ep) {
              setCuentoActivo({ ...ep, audioUrl: meta?.audio_url || null });
              setStoryContext(ep);
              setStoryListVisible(false);
            }
          }}
        />
      , document.getElementById('story-portal-target'))}

      {cuentoActivo && ReactDOM.createPortal(
        <StoryPanel
          titulo={cuentoActivo.titulo}
          texto={cuentoActivo.texto}
          audioUrl={cuentoActivo.audioUrl}
          accentColor={ACCENT}
          separator="|||"
          onClose={() => { setCuentoActivo(null); setStoryContext(null); }}
        />
      , document.getElementById('story-portal-target'))}
    </>
  );
}
