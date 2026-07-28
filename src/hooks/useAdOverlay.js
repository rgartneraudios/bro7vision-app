import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { buildAdVideoName, getCodeForCity, getTipoForCity } from '../data/citycodes';

const R2_BASE = 'https://media.bro7vision.com/';

const CANAL_NUM = {
  luna: 2, mercurio: 1, venus: 3, tierra: 4, marte: 6,
  jupiter: 5, saturno: 7, urano: 8, neptuno: 9,
};

const COBERTURA_CODIGO = {
  GIRA_MUNDIAL: '404', METROPOLIS: '307',
  GIRA_GRAN_REGIONAL: 'GREG', GIRA_REGIONAL: 'REG', GIRA_NACIONAL: '300',
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
        .select('campana, cobertura, ciudad_codigo, ciudad_codigos')
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
      const cityTipo = cityKey ? getTipoForCity(cityKey) : null;

      let chosen =
        data.find(r => r.cobertura === 'GIRA_MUNDIAL') ||
        data.find(r => r.cobertura === 'METROPOLIS' && cityTipo === 'mega') ||
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
          r.ciudad_codigo === cityCode
        )) || null;

      if (!chosen) { setAdVideoUrl(null); return; }

      const codigo = COBERTURA_CODIGO[chosen.cobertura] ?? chosen.ciudad_codigo;
      if (!codigo) { setAdVideoUrl(null); return; }

      const fileName = buildAdVideoName(chosen.campana, canalNum, turno, dispositivo, codigo);
      if (active) setAdVideoUrl(R2_BASE + fileName);
    };

    load();
    return () => { active = false; };
  }, [escenarioId, canal, turno, faseLunar, cityKey, dispositivo]);

  return adVideoUrl;
}