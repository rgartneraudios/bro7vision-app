import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { BROCARD_MODELOS } from '../components/booster/BoosterBroCards';

const FASE_LABELS = { 1:'Luna Nueva', 2:'Creciente', 3:'Luna Llena', 4:'Menguante' };

export const useStripCards = () => {
  const [stripCards,    setStripCards]    = useState([]);
  const [stripLabel,    setStripLabel]    = useState('');
  const [stripVisible,  setStripVisible]  = useState(false);

  const cargarStripCards = useCallback(async (
    agente,
    ciudad,
    modalidad = 'LOCAL',
    pais      = null,
  ) => {
    try {
      const agenteUpper = agente?.toUpperCase() || '';

      if (agenteUpper === 'BROPRODUCTOS') {
        let query = supabase
          .from('comercio_cupones')
          .select('*')
          .eq('activo', true)
          .order('created_at', { ascending: false });

        if (ciudad) {
          query = query.or(
            `alcance.cs.{INTERNACIONAL},` +
            `and(alcance.cs.{NACIONAL},pais.ilike.%${pais || ''}%),` +
            `and(alcance.cs.{CERCANIAS},ciudad.ilike.%${ciudad}%),` +
            `and(alcance.cs.{LOCAL},ciudad.ilike.%${ciudad}%)`
          );
        }

        const { data: rows, error } = await query;

        if (error) {
          console.error('[useStripCards] Error comercio_cupones:', error);
          setStripCards([]);
          setStripVisible(false);
          return;
        }

        if (!rows || rows.length === 0) {
          setStripCards([]);
          setStripVisible(false);
          return;
        }

        const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];
        const { data: perfiles } = await supabase
          .from('profiles')
          .select('id, description, neighborhood, nearby_ref, biz_category, biz_profession')
          .in('id', userIds);

        const perfilMap = {};
        (perfiles || []).forEach(p => { perfilMap[p.id] = p; });

        const cards = rows.map(r => {
          const key = r.modelo_key;
          const modelo = BROCARD_MODELOS[key] || BROCARD_MODELOS[Number(key)];
          if (!modelo) return null;
          const perfil = perfilMap[r.user_id] || {};
          return {
            ...r,
            ...modelo,
            nombre:        r.comercio_nombre || '',
            banner_url: r.banner_11_url || '/images/brocard.webp',
            fase_lunar: FASE_LABELS[r.fase_lunar] || faseActual(),
            vencimiento: r.vencimiento || vencimientoFase(),
            coste_genesis: modelo.coste_genesis,
            description:    perfil.description    || '',
            neighborhood:   perfil.neighborhood   || '',
            nearby_ref:     perfil.nearby_ref     || '',
            biz_category:   perfil.biz_category   || '',
            biz_profession: perfil.biz_profession || '',
          };
        }).filter(Boolean);

        setStripCards(cards);
        setStripLabel('canjear');
        setStripVisible(true);
        return;
      }

      setStripCards([]);
      setStripVisible(false);

    } catch (err) {
      console.error('[useStripCards] Error general:', err);
      setStripCards([]);
      setStripVisible(false);
    }
  }, []);

  return {
    stripCards,   setStripCards,
    stripLabel,   setStripLabel,
    stripVisible, setStripVisible,
    cargarStripCards,
  };
};

function faseActual() {
  const LUNA_NUEVA_REF = new Date('2024-01-11T00:00:00Z');
  const CICLO = 29.530589;
  const ahora = new Date();
  const diasDesdeRef = (ahora - LUNA_NUEVA_REF) / (1000 * 60 * 60 * 24);
  const diaEnCiclo = ((diasDesdeRef % CICLO) + CICLO) % CICLO;

  if (diaEnCiclo < 7.38)  return 'Luna Nueva';
  if (diaEnCiclo < 14.77) return 'Creciente';
  if (diaEnCiclo < 22.15) return 'Luna Llena';
  return 'Menguante';
}

function vencimientoFase() {
  const LUNA_NUEVA_REF = new Date('2024-01-11T00:00:00Z');
  const CICLO = 29.530589;
  const ahora = new Date();
  const diasDesdeRef = (ahora - LUNA_NUEVA_REF) / (1000 * 60 * 60 * 24);
  const diaEnCiclo = ((diasDesdeRef % CICLO) + CICLO) % CICLO;

  let diasRestantes;
  if (diaEnCiclo < 7.38)       diasRestantes = 7.38  - diaEnCiclo;
  else if (diaEnCiclo < 14.77) diasRestantes = 14.77 - diaEnCiclo;
  else if (diaEnCiclo < 22.15) diasRestantes = 22.15 - diaEnCiclo;
  else                          diasRestantes = 29.53 - diaEnCiclo;

  const vencimiento = new Date(ahora.getTime() + diasRestantes * 24 * 60 * 60 * 1000);
  const d = String(vencimiento.getDate()).padStart(2, '0');
  const m = String(vencimiento.getMonth() + 1).padStart(2, '0');
  const y = vencimiento.getFullYear();
  return `${d}-${m}-${y}`;
}