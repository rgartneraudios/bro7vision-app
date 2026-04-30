// src/hooks/useBalances.js

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const EMPTY = {
  genesis: 0,
  vales: { nova: 0, crescens: 0, plena: 0, decrescens: 0 },
  eco_p: 0, eco_gen: 0,
  halos_p: 0, halos_gen: 0,
  zap_p: 0, zap_gen: 0,
};

export const useBalances = (perfilOso, session) => {
  const [balances, setBalances] = useState(EMPTY);

  // Inicializa cuando se carga el perfil
  useEffect(() => {
    if (!perfilOso) return;
    setBalances({
      genesis: perfilOso.genesis || 0,
      vales: {
        nova:       perfilOso.nova       || 0,
        crescens:   perfilOso.crescens   || 0,
        plena:      perfilOso.plena      || 0,
        decrescens: perfilOso.decrescens || 0,
      },
      eco_p:    perfilOso.eco_p    || 0,
      eco_gen:  perfilOso.eco_gen  || 0,
      halos_p:  perfilOso.halos_p  || 0,
      halos_gen: perfilOso.halos_gen || 0,
      zap_p:    perfilOso.zap_p    || 0,
      zap_gen:  perfilOso.zap_gen  || 0,
    });
  }, [perfilOso]);

  const handleGameWin = async (amount) => {
    const newTotal = balances.genesis + amount;
    setBalances(prev => ({ ...prev, genesis: newTotal }));
    if (session?.user?.id) {
      await supabase.from('profiles').update({ genesis: newTotal }).eq('id', session.user.id);
    }
  };

  return { balances, setBalances, handleGameWin };
};
