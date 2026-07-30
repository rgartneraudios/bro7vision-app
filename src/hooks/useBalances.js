import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const EMPTY = {
  lunas: 0,
  zap_p: 0, zap_gen: 0,
  is_admin: false,
};

export const useBalances = (perfilOso, session) => {
  const [balances, setBalances] = useState(EMPTY);

  useEffect(() => {
    if (!perfilOso) return;
    setBalances({
      lunas: perfilOso.lunas ?? 0,
      zap_p:    perfilOso.zap_p    || 0,
      zap_gen:  perfilOso.zap_gen  || 0,
      is_admin: perfilOso.is_admin === true,
    });
  }, [perfilOso]);

  const handleGameWin = async (amount) => {
    if (!session?.user?.id) return;
    const { data: perfil } = await supabase
      .from('profiles')
      .select('lunas')
      .eq('id', session.user.id)
      .single();
    const actual = perfil?.lunas ?? balances.lunas;
    const newTotal = actual + amount;
    setBalances(prev => ({ ...prev, lunas: newTotal }));
    await supabase
      .from('profiles')
      .update({ lunas: newTotal })
      .eq('id', session.user.id);
  };

  return { balances, setBalances, handleGameWin };
};