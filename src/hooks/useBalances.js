// src/hooks/useBalances.js

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const EMPTY = {
  genesis: 0,
  zap_p: 0, zap_gen: 0,
  is_admin: false,
};

export const useBalances = (perfilOso, session) => {
  const [balances, setBalances] = useState(EMPTY);

  // Inicializa cuando se carga el perfil
  useEffect(() => {
    if (!perfilOso) return;
    setBalances({
      genesis: perfilOso.genesis ?? perfilOso.lunas ?? 0,
      zap_p:    perfilOso.zap_p    || 0,
      zap_gen:  perfilOso.zap_gen  || 0,
      is_admin: perfilOso.is_admin === true,
    });
  }, [perfilOso]);

  const handleGameWin = async (amount) => {
    if (!session?.user?.id) return;
    const { data: perfil } = await supabase
      .from('profiles')
      .select('genesis')
      .eq('id', session.user.id)
      .single();
    const actual = perfil?.genesis ?? balances.genesis;
    const newTotal = actual + amount;
    setBalances(prev => ({ ...prev, genesis: newTotal }));
    await supabase
      .from('profiles')
      .update({ genesis: newTotal })
      .eq('id', session.user.id);
  };

  return { balances, setBalances, handleGameWin };
};
