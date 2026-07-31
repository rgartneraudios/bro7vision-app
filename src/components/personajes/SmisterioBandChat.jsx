// src/components/personajes/SmisterioBandChat.jsx
// Sub-componente de Bro7Band para el chat IA de SMisterio.
// Se monta/desmonta al seleccionar el grupo. Cable individual.

import React, { useState } from 'react';
import AgentChatInput from '../AgentChatInput';
import StoryPanel from '../StoryPanel';
import StoryListOverlay from '../StoryListOverlay';
import { useAgentSMisterio } from '../../hooks/useAgentSMisterio';
import { SMISTERIO_CUENTO_MAP } from '../../data/smisterio/smisterioData';

const ACCENT = '#a855f7';
const NOMBRE = 'Señor Misterio';

export default function SmisterioBandChat({ iaMode, isAdmin, onHandoff, cuentos, display, cursor }) {
  const [storyListVisible, setStoryListVisible] = useState(false);
  const [cuentoActivo, setCuentoActivo]         = useState(null);

  const { mensaje, loading, enviar } = useAgentSMisterio({
    iaMode,
    isAdmin,
    onHandoff,
    onShowStoryList: () => setStoryListVisible(true),
    onLaunchStory:   (n) => {
      const ep = SMISTERIO_CUENTO_MAP[n];
      if (ep) { setCuentoActivo(ep); setStoryListVisible(false); }
    },
  });

  return (
    <>
      <AgentChatInput
        agent="smisterio"
        onSend={enviar}
        isLoading={loading}
        placeholder="Pregunta al Señor Misterio..."
      />

      {storyListVisible && (
        <StoryListOverlay
          cuentos={cuentos}
          personaje={NOMBRE}
          accentColor={ACCENT}
          onClose={() => setStoryListVisible(false)}
        />
      )}

      {cuentoActivo && (
        <StoryPanel
          titulo={cuentoActivo.titulo}
          texto={cuentoActivo.texto}
          audioUrl={
            cuentos.find(c => c.numero === Object.entries(SMISTERIO_CUENTO_MAP)
              .find(([,v]) => v === cuentoActivo)?.[0])?.audio_url || null
          }
          accentColor={ACCENT}
          onClose={() => setCuentoActivo(null)}
        />
      )}
    </>
  );
}