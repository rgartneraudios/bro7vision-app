// src/hooks/useAgOsosMobile.js
// Dispatcher de Osos para MobileLayout step === 1.
// Instancia los tres hooks siempre (regla de hooks de React) y devuelve el activo.

import { useAgentTito  } from './useAgentTito';
import { useAgentLara  } from './useAgentLara';
import { useAgentPuffo } from './useAgentPuffo';

export function useAgOsosMobile({ oso_id = 'tito', iaMode, isAdmin, onHandoff, ciudad = null }) {
  const tito  = useAgentTito ({ iaMode, isAdmin, onHandoff, ciudad });
  const lara  = useAgentLara ({ iaMode, isAdmin, onHandoff, ciudad });
  const puffo = useAgentPuffo({ iaMode, isAdmin, onHandoff, ciudad });

  const id = (oso_id || 'tito').toLowerCase();
  const active = id === 'lara' ? lara : id === 'puffo' ? puffo : tito;

  return {
    mensaje: active.mensaje,
    loading: active.loading,
    enviar:  active.enviar,
    reset:   active.reset,
  };
}
