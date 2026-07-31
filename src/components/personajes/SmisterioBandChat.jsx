// src/components/personajes/SmisterioBandChat.jsx
import React, { useEffect } from 'react';
import AgentChatInput from '../AgentChatInput';
import { useAgentSMisterio } from '../../hooks/useAgentSMisterio';

export default function SmisterioBandChat({ iaMode, isAdmin, onHandoff, onMensaje, onShowStoryList, onLaunchStory }) {
  const { mensaje, loading, enviar } = useAgentSMisterio({
    iaMode,
    isAdmin,
    onHandoff,
    onShowStoryList,
    onLaunchStory,
  });

  useEffect(() => {
    if (mensaje) onMensaje?.(mensaje);
  }, [mensaje]);

  return (
    <AgentChatInput
      agent="smisterio"
      onSend={enviar}
      isLoading={loading}
      placeholder="Pregunta al Señor Misterio..."
    />
  );
}