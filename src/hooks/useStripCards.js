// src/hooks/useStripCards.js
// ─────────────────────────────────────────────────────────────────────
// Carga las cards para el cajón de cada sector.
//
// BROPRODUCTOS / BROSERVICIOS → leen de comercio_cupones
//   Filtros aplicados:
//     · activo = true
//     · sector (PRODUCTOS o SERVICIOS)
//     · alcance + geolocalización:
//         LOCAL         → filtra por ciudad
//         NACIONAL      → filtra por país
//         INTERNACIONAL → sin filtro geográfico
//
// AVISOS / AUDIO → lógica propia sin cambios
// ─────────────────────────────────────────────────────────────────────

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

      // ══════════════════════════════════════════════════════════════
      // BROPRODUCTOS / BROSERVICIOS
      // Lee de comercio_cupones
      // ══════════════════════════════════════════════════════════════
      if (agenteUpper === 'BROPRODUCTOS' || agenteUpper === 'BROERVICIOS') {
        const sector          = agenteUpper === 'BROPRODUCTOS' ? 'PRODUCTOS' : 'SERVICIOS';

         let query = supabase
           .from('comercio_cupones')
           .select('*')
           .eq('activo', true)
           .eq('sector', sector)
           .order('created_at', { ascending: false });

         // Filtro geográfico según alcance de la card
         if (ciudad) {
           query = query.or(
             `alcance.eq.INTERNACIONAL,` +
             `and(alcance.eq.NACIONAL,pais.ilike.%${pais || ''}%),` +
             `and(alcance.eq.LOCAL,ciudad.ilike.%${ciudad}%)`
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

        // Traer datos de perfil (neighborhood, nearby_ref, etc.) de los user_id
        const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];
        const { data: perfiles } = await supabase
          .from('profiles')
          .select('id, description, neighborhood, nearby_ref, biz_category, biz_profession')
          .in('id', userIds);

        const perfilMap = {};
        (perfiles || []).forEach(p => { perfilMap[p.id] = p; });

        // Mapear al shape que espera BroCardStripPS
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
        setStripLabel(agenteUpper === 'BROCUPONES_PRODUCTO' ? 'broshop_producto' : 'broshop_servicio');
        setStripVisible(true);
        return;
      }

      // ══════════════════════════════════════════════════════════════
      // AUDIO / MUSIC — sin cambios
      // ══════════════════════════════════════════════════════════════
      if (agenteUpper === 'AUDIO' || agenteUpper === 'MUSIC') {
        const esPais = modalidad !== 'LOCAL' ||
                       ciudad?.toLowerCase() === 'españa' ||
                       ciudad?.toLowerCase() === 'spain';

        const { data: perfiles, error } = await supabase
          .from('profiles')
          .select('id, bro_mus, bro_aud, banner_url, alias, city, country, description, audio_type, track_name, audio_description, role, nearby_ref')
          .limit(300);

        if (error) {
          console.error('[useStripCards] Error audio:', error);
        }

        const userIds = (perfiles || []).map(p => p.id).filter(Boolean);
        const { data: audioRows } = await supabase
          .from('proyeccion_audio')
          .select('user_id, url, circular_url')
          .in('user_id', userIds);
        const audioMap = {};
        (audioRows || []).forEach(a => { audioMap[a.user_id] = a; });

        const filtrados = (perfiles || []).filter(p => {
          const tieneRolMusica = Array.isArray(p.role)
            ? p.role.includes('music')
            : p.role === 'music';
          if (!tieneRolMusica) return false;

          if (!esPais && ciudad) {
            return p.city?.toLowerCase().includes(ciudad.toLowerCase());
          }
          if (esPais) {
            const paisBuscado = (pais || ciudad || '').toLowerCase();
            if (paisBuscado === 'españa' || paisBuscado === 'spain') {
              return !p.country ||
                     p.country.toLowerCase().includes('españa') ||
                     p.country.toLowerCase().includes('spain') ||
                     p.country.toLowerCase().includes('es');
            }
            return p.country?.toLowerCase().includes(paisBuscado);
          }
          return true;
        });

        const cards = filtrados.flatMap(p => {
          if (!p.bro_mus && !p.bro_aud) return [];
          const esPodcast = p.audio_type === 'podcast';
          const codigo    = esPodcast ? p.bro_aud : p.bro_mus;
          if (!codigo) return [];
          const audioRow = audioMap[p.id] || {};
          return [{
            bro_pd:      codigo,
            banner_url:  p.banner_url  || '',
            circular_url: audioRow.circular_url || '',
            audio_url:   audioRow.url  || '',
            nombre:      p.alias       || '',
            nearby_ref:  p.nearby_ref  || '',
            categoria:   esPodcast ? 'Podcast' : 'Música',
            ciudad:      p.city        || '',
            descripcion: p.audio_description || p.description || '',
            track_name:  p.track_name  || '',
            audio_type:  p.audio_type  || 'music',
            bro_mus:     p.bro_mus     || '',
            bro_aud:     p.bro_aud     || '',
          }];
        });

        if (!error && cards.length > 0) {
          setStripCards(cards);
          setStripLabel('audio');
          setStripVisible(true);
        } else {
          setStripCards([]);
          setStripVisible(false);
        }
        return;
      }

      // ── Fallback ─────────────────────────────────────────────────
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

// ── Helpers fase lunar ────────────────────────────────────────────────
// Calcula la fase lunar aproximada y su fecha de vencimiento
// basándose en el ciclo sinódico (29.53 días)

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

  // Días restantes hasta el siguiente cambio de fase
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
