// src/hooks/useStripCards.js
// ─────────────────────────────────────────────────────────────────────
// Carga las cards para el cajón de cada sector.
//
// PRODUCTO / SERVICIO → leen de mini_vitrina_activa (Mini descentralizado)
//   Filtros aplicados en Supabase:
//     · fase_caduca > NOW()          (bloqueo lunar automático)
//     · sector                       (PRODUCTO o SERVICIO)
//     · alcance compatible con la modalidad del visitante
//     · geolocalización si aplica
//
// AVISOS / AUDIO → lógica propia sin cambios
// ─────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

// Qué alcances son visibles según la modalidad del visitante
const ALCANCES_VISIBLES = {
  LOCAL:         ['LOCAL', 'NACIONAL', 'INTERNACIONAL'],
  NACIONAL:      ['NACIONAL', 'INTERNACIONAL'],
  INTERNACIONAL: ['INTERNACIONAL'],
};

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

      // ══════════════════════════════════════════════════════════════
      // BROSHOP_PRODUCTO / BROSHOP_SERVICIO
      // Lee de mini_vitrina_activa — el Mini es la fuente de verdad
      // ══════════════════════════════════════════════════════════════
      const agenteUpper = agente?.toUpperCase() || '';

      if (agenteUpper === 'BROSHOP_PRODUCTO' || agenteUpper === 'BROSHOP_SERVICIO') {
        const sector          = agenteUpper === 'BROSHOP_PRODUCTO' ? 'PRODUCTO' : 'SERVICIO';
        const alcancesValidos = ALCANCES_VISIBLES[modalidad] || ALCANCES_VISIBLES.LOCAL;

        // Consulta base — la vista ya filtra fase_caduca > NOW()
        let query = supabase
          .from('mini_vitrina_activa')
          .select('*')
          .eq('sector', sector)
          .in('alcance', alcancesValidos)
          .order('perfil_id')
          .order('orden_vitrina');

        // Filtro geográfico en servidor
        if (modalidad === 'LOCAL' && ciudad) {
          query = query.ilike('city', `%${ciudad}%`);
        }
        if (modalidad === 'NACIONAL' && pais) {
          query = query.eq('country', pais);
        }

        const { data: rows, error } = await query;

        if (error) {
          console.error('[useStripCards] Error mini_vitrina_activa:', error);
          setStripCards([]);
          setStripVisible(false);
          return;
        }

        if (!rows || rows.length === 0) {
          setStripCards([]);
          setStripVisible(false);
          return;
        }

        // Mapear al shape que espera BroCardStripPS
        const cards = rows.map(r => ({
          // Identificadores
          bro_pd:          r.id,
          perfil_id:       r.perfil_id,
          bro_ser:         r.bro_ser   || '',
          bro_shop:        r.bro_pd    || '',

          // Datos del perfil (para handoff al Mini / Teléfono Casa)
          banner_url:      r.banner_url || '',
          nombre:          r.alias      || '',
          ciudad:          r.city       || '',
          country:         r.country    || '',

          // Datos de la card
          sector:          r.sector,
          orden_vitrina:   r.orden_vitrina,
          alcance:         r.alcance,
          producto_titulo: r.nombre        || '',
          producto_codigo: r.ref_interna   || '',
          categoria:       r.sector,
          descripcion:     r.descripcion   || '',
          precio_original: r.precio        || 0,
          precio_descuento:r.precio        || 0,
          precio_unidad:   r.precio_unidad || null,
          tallas:          null,
          imagen_url:      r.imagen_url    || '',
          link_pago:       r.link_pago     || '',
          whatsapp:        r.whatsapp      || null,
          disponibilidad:  r.disponibilidad || 'libre',
          stock_actual:    1,              // mini_vitrina no tiene stock — siempre visible
          lunas:           r.semaforo || {},
          fase_id:         r.fase_id,
          fase_caduca:     r.fase_caduca,
        }));

        setStripCards(cards);
        setStripLabel(agenteUpper === 'BROSHOP_PRODUCTO' ? 'broshop_producto' : 'broshop_servicio');
        setStripVisible(true);
        return;
      }

      // ══════════════════════════════════════════════════════════════
      // BROSHOP_AVISO — lógica propia sin cambios
      // ══════════════════════════════════════════════════════════════
      if (agenteUpper === 'BROSHOP_AVISO') {
        const ahora = new Date().toISOString();
        const { data: avisos, error } = await supabase
          .from('avisos')
          .select('id, user_id, author_alias, type, title, content, cost_to_reveal, expires_at, is_active, banner_avi')
          .eq('is_active', true)
          .gt('expires_at', ahora)
          .limit(20);

        if (error || !avisos?.length) {
          setStripCards([]);
          setStripVisible(false);
          return;
        }

        const userIds = [...new Set(avisos.map(a => a.user_id).filter(Boolean))];
        const { data: autores } = await supabase
          .from('profiles')
          .select('id, banner_url')
          .in('id', userIds);

        const bannerMap = {};
        (autores || []).forEach(p => { bannerMap[p.id] = p.banner_url || ''; });

        const cards = avisos.map(av => ({
          bro_pd:      av.id,
          aviso_id:    av.id,
          user_id:     av.user_id,
          nombre:      av.author_alias || 'Ciudadano',
          banner_avi:  av.banner_avi   || '',
          banner_url:  bannerMap[av.user_id] || '',
          categoria:   av.type         || 'OFERTA',
          titulo:      av.title        || '',
          descripcion: av.content      || '',
          cost:        av.cost_to_reveal || 200,
          ciudad:      '',
          es_aviso:    true,
        }));

        setStripCards(cards);
        setStripLabel('broshop_aviso');
        setStripVisible(true);
        return;
      }

      // ══════════════════════════════════════════════════════════════
      // AUDIO / MUSIC — lógica propia sin cambios
      // ══════════════════════════════════════════════════════════════
      if (agenteUpper === 'AUDIO' || agenteUpper === 'MUSIC') {
        const esPais = modalidad !== 'LOCAL' ||
                       ciudad?.toLowerCase() === 'españa' ||
                       ciudad?.toLowerCase() === 'spain';

        let query = supabase
          .from('profiles')
          .select('bro_mus, bro_aud, banner_url, alias, city, country, description, audio_type, track_name, audio_description, audio_file, role, nearby_ref')
          .limit(300);

        const { data: perfiles, error } = await query;
        if (error) {
          console.error('[useStripCards] Error audio:', error);
        }

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
          return [{
            bro_pd:      codigo,
            banner_url:  p.banner_url  || '',
            nombre:      p.alias       || '',
            nearby_ref:  p.nearby_ref  || '',
            categoria:   esPodcast ? 'Podcast' : 'Música',
            ciudad:      p.city        || '',
            descripcion: p.audio_description || p.description || '',
            track_name:  p.track_name  || '',
            audio_type:  p.audio_type  || 'music',
            audio_file:  p.audio_file  || '',
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