// src/hooks/useBro7BandClaim.js
import { supabase } from '../supabaseClient';

const getWeekAndYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now - start) / 86400000;
  const week = Math.ceil((diff + start.getDay() + 1) / 7);
  return { semana_iso: week, anio: now.getFullYear() };
};

export const useBro7BandClaim = () => {
  const handleClaim = async (userId, groupId, palabraIngresada) => {
    if (!userId || !groupId || !palabraIngresada?.trim()) return 'error';

    const { data: audios, error: audioError } = await supabase
      .from('bro7band_audios')
      .select('id, palabra_clave')
      .eq('personaje_id', groupId)
      .eq('activo', true);

    if (audioError || !audios || audios.length === 0) return 'error';

    const match = audios.find(
      a => a.palabra_clave?.toLowerCase() === palabraIngresada.trim().toLowerCase()
    );

    if (!match) return 'error';

    const { semana_iso, anio } = getWeekAndYear();

    const { data: existing } = await supabase
      .from('bro7band_claims')
      .select('id')
      .eq('user_id', userId)
      .eq('audio_id', match.id)
      .eq('semana_iso', semana_iso)
      .eq('anio', anio);

    if (existing && existing.length > 0) return 'repetido';

    const { error: rpcError } = await supabase.rpc('incrementar_lunas', {
      user_id: userId,
      cantidad: 50,
    });

    if (rpcError) return 'error';

    const { error: insertError } = await supabase
      .from('bro7band_claims')
      .insert({
        user_id: userId,
        audio_id: match.id,
        semana_iso,
        anio,
      });

    if (insertError) return 'error';

    return 'ok';
  };

  return { handleClaim };
};