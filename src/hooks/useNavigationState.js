// src/hooks/useNavigationState.js

import { useState } from 'react';

export const useNavigationState = () => {
  const [step, setStep]                             = useState(0);
  const [intent, setIntent]                         = useState(null);
  const [scope, setScope]                           = useState(null);
  const [realityMode, setRealityMode]               = useState(null);
  const [ventasMode, setVentasMode]                 = useState(null);
  const [ososModo, setOsosModo]                     = useState('entrada');
  const [ososHandoffContext, setOsosHandoffContext]  = useState(null);

  return {
    step, setStep,
    intent, setIntent,
    scope, setScope,
    realityMode, setRealityMode,
    ventasMode, setVentasMode,
    ososModo, setOsosModo,
    ososHandoffContext, setOsosHandoffContext,
  };
};
