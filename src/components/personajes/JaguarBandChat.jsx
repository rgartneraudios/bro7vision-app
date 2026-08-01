// src/components/personajes/JaguarBandChat.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AgentChatInput from '../AgentChatInput';
import StoryPanel from '../StoryPanel';
import StoryListOverlay from '../StoryListOverlay';
import { useAgentJaguar } from '../../hooks/useAgentJaguar';
import { JAGUAR_CUENTO_MAP } from '../../data/jaguar/jaguarData';
import { supabase } from '../../supabaseClient';

const ACCENT  = '#f59e0b';
const NOMBRE  = 'Jaguar';

const buildTexto = (s) =>
  [s.frase, s.esencia?.trim(), s.consejo, s.mito]
    .filter(Boolean).join('\n===🐯===\n');

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

  const { mensaje, loading, enviar } = useAgentJaguar({
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
        placeholder="Pregunta a Jaguar..."
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
          separator="\n===🐯===\n"
          onClose={() => setCuentoActivo(null)}
        />
      , document.getElementById('story-portal-target'))}
    </>
  );
}