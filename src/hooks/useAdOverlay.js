import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { getCodeForCity } from '../data/citycodes';

const CANAL_NUM = {
  luna: 2, mercurio: 1, venus: 3, tierra: 4, marte: 6,
  jupiter: 5, saturno: 7, urano: 8, neptuno: 9,
};

export function useAdOverlay({ escenarioId, canal, turno, faseLunar, cityKey, dispositivo = 0 }) {
  const [adVideoUrl, setAdVideoUrl] = useState(null);

  useEffect(() => {
    const canalNum = canal ?? CANAL_NUM[escenarioId];
    if (!canalNum || !turno) return;
    let active = true;

    const load = async () => {
      let query = supabase
        .from('bs_butacas')
        .select('cobertura, ciudad_codigos, pieza_final')
        .eq('canal', canalNum)
        .eq('funcion', turno)
        .eq('dispositivo', dispositivo)
        .eq('estado', 'EN_CARTELERA');

      if (canalNum === 2 && faseLunar) {
        query = query.eq('fase_lunar', faseLunar);
      }

      const { data, error } = await query;
      console.log('useAdOverlay →', { canalNum, turno, dispositivo, data, error });
      if (error || !data?.length) { setAdVideoUrl(null); return; }

      const cityCode = cityKey ? getCodeForCity(cityKey) : null;

      let chosen =
        data.find(r => r.cobertura === 'GIRA_MUNDIAL') ||
        data.find(r => r.cobertura === 'GIRA_NACIONAL') ||
        (cityCode && data.find(r =>
          r.cobertura === 'GIRA_GRAN_REGIONAL' &&
          Array.isArray(r.ciudad_codigos) && r.ciudad_codigos.includes(cityCode)
        )) ||
        (cityCode && data.find(r =>
          r.cobertura === 'GIRA_REGIONAL' &&
          Array.isArray(r.ciudad_codigos) && r.ciudad_codigos.includes(cityCode)
        )) ||
        (cityCode && data.find(r =>
          (r.cobertura === 'SALA_CIUDAD' || r.cobertura === 'SALA_GRAN_CIUDAD') &&
          Array.isArray(r.ciudad_codigos) && r.ciudad_codigos.includes(cityCode)
        )) || null;

      if (!chosen) { setAdVideoUrl(null); return; }

      if (active) setAdVideoUrl(chosen.pieza_final ?? null);
    };

    load();
    return () => { active = false; };
  }, [escenarioId, canal, turno, faseLunar, cityKey, dispositivo]);

  return adVideoUrl;
}