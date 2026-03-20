import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useAssets = (session) => {
  const [assets, setAssets] = useState({
    eco_p: 0, eco_gen: 0,
    halos_p: 0, halos_gen: 0,
    zap_p: 0, zap_gen: 0
  });

  useEffect(() => {
    if (!session) return;
    const fetch = async () => {
      const { data } = await supabase
  .from('profiles')
  .select('eco_p, eco_gen, halos_p, halos_gen, zap_p, zap_gen')
  .eq('id', session.user.id)
  .single();
        if (data) setAssets(data);
    };
    fetch();
  }, [session]);

  const sendAsset = async (type, variant) => {
    const col = `${type}_${variant}`; // ej: eco_gen, zap_p, halos_p
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