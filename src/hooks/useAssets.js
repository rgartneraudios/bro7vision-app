import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useAssets = (session) => {
  const [assets, setAssets] = useState({
    zap_p: 0, zap_gen: 0
  });

  useEffect(() => {
    if (!session) return;
    const fetch = async () => {
      const { data } = await supabase
  .from('profiles')
  .select('zap_p, zap_gen')
  .eq('id', session.user.id)
  .single();
        if (data) setAssets(data);
    };
    fetch();
  }, [session]);

  const sendAsset = async (type, variant) => {
    const col = `${type}_${variant}`; // ej: zap_p, zap_gen
    if (assets[col] <= 0) return false;
    const { error } = await supabase
  .from('profiles')
  .update({ [col]: assets[col] - 1 })
  .eq('id', session.user.id);
      if (!error) setAssets(prev => ({ ...prev, [col]: prev[col] - 1 }));
    return !error;
  };

  return { assets, sendAsset };
};