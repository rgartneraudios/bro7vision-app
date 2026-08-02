// src/components/personajes/JaguarBandChat.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AgentChatInput from '../AgentChatInput';
import StoryPanel from '../StoryPanel';
import StoryListOverlay from '../StoryListOverlay';
import { useAgentJaguar } from '../../hooks/useAgentJaguar';
import { JAGUAR_CUENTO_MAP } from '../../data/jaguar/jaguarData';
import { supabase } from '../../supabaseClient';

const ACCENT  = '#a855f7';
const NOMBRE  = 'Jaguar';

const buildTexto = (s) =>
  [s.frase, s.esencia?.trim(), s.consejo, s.mito]
    .filter(Boolean).join('|||');

export default function JaguarBandChat({ iaMode, isAdmin, onHandoff, onMensaje }) {
  const [cuentos,          setCuentos]          = useState([]);
  const [storyListVisible, setStoryListVisible] = useState(false);
  const [cuentoActivo,     setCuentoActivo]     = useState(null);

  useEffect(() => {
    supabase
      .from('bro7band_cuentos')
      .select('numero, titulo, audio_url')
      .eq('personaje_id', 'jaguar')
      .eq('activo', true)
      .order('numero')
      .then(({ data }) => { if (data) setCuentos(data); });
  }, []);

  const { mensaje, loading, enviar, setStoryContext } = useAgentJaguar({
    iaMode,
    isAdmin,
    onHandoff,
    onShowStoryList: () => setStoryListVisible(true),
    onLaunchStory: (n) => {
      const ep   = JAGUAR_CUENTO_MAP[n];
      const meta = cuentos.find(c => c.numero === n);
      if (ep) {
        setCuentoActivo({
          titulo:   ep.titulo,
          texto:    buildTexto(ep),
          audioUrl: meta?.audio_url || null,
        });
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
        placeholder="Pregunta a Jaguar. Escribe 555 para ver el listado de historias, si hay un listado, aparecerá en el centro. Ten en cuenta que los personajes te cuentan historias de ficción y entretenimiento. Las historias no te consumen saldo, solo lo consumen los mensajes."
      />

      {storyListVisible && ReactDOM.createPortal(
        <StoryListOverlay
          cuentos={cuentos}
          personaje={NOMBRE}
          accentColor={ACCENT}
          onClose={() => setStoryListVisible(false)}
          onSelect={(n) => {
            const ep   = JAGUAR_CUENTO_MAP[n];
            const meta = cuentos.find(c => c.numero === n);
            if (ep) {
              setCuentoActivo({
                titulo:   ep.titulo,
                texto:    buildTexto(ep),
                audioUrl: meta?.audio_url || null,
              });
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