// src/components/personajes/OSOSBandChat.jsx
import { useState, useEffect } from 'react';
import AgentChatInput from '../AgentChatInput';
import { useAgentTito }  from '../../hooks/useAgentTito';
import { useAgentLara }  from '../../hooks/useAgentLara';
import { useAgentPuffo } from '../../hooks/useAgentPuffo';

const OSO_LABEL = {
  tito:  '🐾 TITO',
  lara:  '🐾 LARA',
  puffo: '🐾 PUFFO',
};

export default function OSOSBandChat({ iaMode, isAdmin, onHandoff, onMensaje, ciudad = null }) {
  const [activeOso, setActiveOso] = useState('tito');

  const handleInternalHandoff = (data) => {
    if (data?.agente === 'OSOS_INTERNO') {
      setActiveOso(data.oso_id);
    } else {
      onHandoff?.(data);
    }
  };

  const tito  = useAgentTito ({ iaMode, isAdmin, onHandoff: handleInternalHandoff, ciudad });
  const lara  = useAgentLara ({ iaMode, isAdmin, onHandoff: handleInternalHandoff, ciudad });
  const puffo = useAgentPuffo({ iaMode, isAdmin, onHandoff: handleInternalHandoff, ciudad });

  const active = activeOso === 'tito' ? tito : activeOso === 'lara' ? lara : puffo;

  useEffect(() => {
    if (active.mensaje) onMensaje?.(active.mensaje);
  }, [active.mensaje]);

  return (
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
        placeholder={`Habla con ${OSO_LABEL[activeOso]} Escribe 555 para ver el listado de historias, si hay un listado, aparecerá en el centro. Ten en cuenta que los personajes te cuentan historias de ficción y entretenimiento. Las historias no te consumen saldo, solo lo consumen los mensajes.`}
      />
    </div>
  );
}