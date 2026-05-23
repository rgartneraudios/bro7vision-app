// src/hooks/useStripCards.js
// ─────────────────────────────────────────────────────────────────────
// Carga las BroCardStripPS para el cajón scrolleable de cada sector.
//
// MODELO:
//   Cada perfil tiene destacados_ps[] en Supabase.
//   Cada item tiene: sector ('PRODUCTO'|'SERVICIO'), orden_vitrina (1|2|3|null),
//   stock_actual, alcance ('LOCAL'|'NACIONAL'|'INTERNACIONAL'), campana_semana,
//   lunas, image_url, etc.
//
//   El cajón muestra solo las referencias con:
//     · campana_semana === 'actual'
//     · orden_vitrina  IN [1, 2, 3]
//     · stock_actual   > 0
//     · sector         coincide con el agente (PRODUCTO → Nova / SERVICIO → Isabella)
//     · alcance        compatible con la ciudad/país del visitante
//
// ALCANCE:
//   LOCAL        → solo aparece si ciudad del perfil coincide con ciudad del visitante
//   NACIONAL     → aparece en cualquier ciudad del mismo país del visitante
//   INTERNACIONAL → aparece en cualquier país
//   (modalidad del visitante)
//   'LOCAL'         → ciudad elegida  → muestra LOCAL + NACIONAL + INTERNACIONAL
//   'NACIONAL'      → país elegido    → muestra NACIONAL + INTERNACIONAL
//   'INTERNACIONAL' → global          → muestra solo INTERNACIONAL
//
// ─────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

// Agentes que usan el sistema de vitrina destacados_ps
const AGENTES_VITRINA = ['BROSHOP_PRODUCTO', 'BROSHOP_SERVICIO'];

// Mapa agente → sector esperado en la referencia
const SECTOR_MAP = {
  BROSHOP_PRODUCTO: 'PRODUCTO',
  BROSHOP_SERVICIO: 'SERVICIO',
};

// Mapa agente → role en profiles (para filtrar perfiles con ese rol)
const ROLE_MAP = {
  BROSHOP_PRODUCTO: 'shop',
  BROSHOP_SERVICIO: 'service',
  BROSHOP_AVISO:    'aviso',
  AUDIO:            'music',
};

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
    modalidad = 'LOCAL',   // 'LOCAL' | 'NACIONAL' | 'INTERNACIONAL'
    pais = null,           // código de país del visitante, ej: 'ES', 'MX'
  ) => {

    try {
      // ── BROSHOP_AVISO — lógica propia sin vitrina ────────────────────
      if (agente === 'BROSHOP_AVISO') {
        const ahora = new Date().toISOString();
        const { data: avisos, error } = await supabase
          .from('avisos')
          .select('id, user_id, author_alias, type, title, content, cost_to_reveal, expires_at, is_active')
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
          bro_id:      av.id,
          aviso_id:    av.id,
          user_id:     av.user_id,
          nombre:      av.author_alias || 'Ciudadano',
          banner_url:  bannerMap[av.user_id] || '',
          categoria:   av.type || 'OFERTA',
          titulo:      av.title || '',
          descripcion: av.content || '',
          cost:        av.cost_to_reveal || 200,
          ciudad:      '',
          es_aviso:    true,
        }));

        setStripCards(cards);
        setStripLabel('broshop_aviso');
        setStripVisible(true);
        return;
      }

// ── AUDIO — lógica propia sin vitrina (Normalizado y Tolerante) ──
      const agenteUpper = agente?.toUpperCase() || '';
      if (agenteUpper === 'AUDIO' || agenteUpper === 'MUSIC') {
        const esPais = modalidad !== 'LOCAL' || 
                       ciudad?.toLowerCase() === 'españa' || 
                       ciudad?.toLowerCase() === 'spain';
        
        console.log('[AUDIO DEBUG] Entrada hook:', { agente, ciudad, modalidad, esPais });

        // Traemos los perfiles en bruto para filtrarlos de forma segura en JS
        let query = supabase
          .from('profiles')
          .select('bro_aud, bro_pod, banner_url, alias, city, country, description, audio_type, track_name, audio_description, audio_file, role, nearby_ref')
          .limit(300); 

        const { data: perfiles, error } = await query;
        if (error) {
          console.error('[AUDIO DEBUG] Error en consulta Supabase:', error);
        }

        console.log('[AUDIO DEBUG] Perfiles devueltos por DB (sin filtrar):', perfiles?.length || 0);

        // Filtrado ultra-robusto en JavaScript
        const filtrados = (perfiles || []).filter(p => {
          // 1. Filtro de Rol: Comprobamos si es creador de música
          const tieneRolMusica = Array.isArray(p.role) 
            ? p.role.includes('music') 
            : p.role === 'music';
          
          if (!tieneRolMusica) return false;

          // 2. Filtro Geográfico
          if (!esPais && ciudad) {
            // Modo Local: Coincidir ciudad
            return p.city?.toLowerCase().includes(ciudad.toLowerCase());
          } 
          
          if (esPais) {
            const paisBuscado = (pais || ciudad || '').toLowerCase();
            
            // Salvavidas para España: si buscamos España, incluimos perfiles de "España", 
            // o que tengan el country vacío/null (muy común en registros de prueba)
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

        console.log('[AUDIO DEBUG] Perfiles que superaron los filtros (Rol + Geo):', filtrados.length, filtrados);

        const cards = filtrados.flatMap(p => {
          if (!p.bro_aud && !p.bro_pod) return [];
          const esPodcast = p.audio_type === 'podcast';
          const codigo    = esPodcast ? p.bro_pod : p.bro_aud;
          if (!codigo) return [];
          return [{
            bro_id:      codigo,
            banner_url:  p.banner_url || '',
            nombre:      p.alias || '',
            nearby_ref:  p.nearby_ref || '',
            categoria:   esPodcast ? 'Podcast' : 'Música',
            ciudad:      p.city || '',
            descripcion: p.audio_description || p.description || '',
            track_name:  p.track_name || '',
            audio_type:  p.audio_type || 'music',
            audio_file:  p.audio_file || '',
            bro_aud:     p.bro_aud || '',
            bro_pod:     p.bro_pod || '',
          }];
        });

        console.log('[AUDIO DEBUG] Tarjetas mapeadas para renderizar:', cards.length, cards);

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
      // ── BROSHOP_PRODUCTO / BROSHOP_SERVICIO — sistema de vitrina ────
      if (AGENTES_VITRINA.includes(agente)) {
        const sectorBuscado    = SECTOR_MAP[agente];
        const roleBuscado      = ROLE_MAP[agente];
        const alcancesValidos  = ALCANCES_VISIBLES[modalidad] || ALCANCES_VISIBLES.LOCAL;

        // 1. Traer perfiles con el role correcto + destacados_ps
        //    El filtro geográfico fino lo hacemos en cliente porque
        //    destacados_ps es JSON y Supabase no filtra dentro de arrays JSON.
        let query = supabase
          .from('profiles')
          .select('id, bro_id, bro_ser, banner_url, alias, city, country, role, destacados_ps')
          .limit(200);  // margen suficiente para ciudades grandes

        // Pre-filtro servidor: si es LOCAL, acotar por ciudad para no traer todo
        if (modalidad === 'LOCAL' && ciudad) {
          query = query.ilike('city', `%${ciudad}%`);
        }
        // Si es NACIONAL, filtrar por país si lo tenemos
        if (modalidad === 'NACIONAL' && pais) {
          query = query.eq('country', pais);
        }
        // Si es INTERNACIONAL no filtramos por geo — queremos todo

        const { data: perfiles, error } = await query;
        if (error) throw error;

        // 2. Filtrar perfiles que tengan el role correcto
        const perfilesFiltrados = (perfiles || []).filter(p =>
          Array.isArray(p.role) ? p.role.includes(roleBuscado) : p.role === roleBuscado
        );

        // 3. De cada perfil, extraer sus referencias de vitrina
        const cards = [];

        for (const perfil of perfilesFiltrados) {
          const refs = Array.isArray(perfil.destacados_ps) ? perfil.destacados_ps : [];

          // Solo referencias que pasen los 5 filtros:
          const vitrina = refs
            .filter(r =>
              r.campana_semana   === 'actual'          &&  // campaña en curso
              r.orden_vitrina    >= 1                  &&  // slot asignado (1/2/3)
              r.orden_vitrina    <= 3                  &&
              (r.stock_actual ?? 0) > 0                &&  // con stock
              r.sector           === sectorBuscado     &&  // sector correcto
              alcancesValidos.includes(r.alcance)          // alcance compatible
            )
            .sort((a, b) => a.orden_vitrina - b.orden_vitrina); // orden 1 → 2 → 3

          // Máximo 3 por comercio
          const top3 = vitrina.slice(0, 3);

          top3.forEach(ref => {
            cards.push({
              // Identificadores
              bro_id:          ref.id,
              perfil_id:       perfil.id,
              bro_ser:         perfil.bro_ser || '',
              bro_shop:        perfil.bro_id  || '',

              // Datos del perfil (para el handoff al Teléfono Casa)
              banner_url:      perfil.banner_url || '',
              nombre:          perfil.alias || '',
              ciudad:          perfil.city  || '',
              country:         perfil.country || '',

              // Datos de la referencia
              sector:          ref.sector          || sectorBuscado,
              orden_vitrina:   ref.orden_vitrina,
              producto_codigo: ref.producto_codigo || '',
              producto_titulo: ref.producto_titulo || '',
              categoria:       ref.categoria       || ref.biz_category || '',
              tallas:          ref.tallas          || '',
              peso:            ref.peso            || '',
              material:        ref.material        || '',
              origen:          ref.origen          || '',
              descripcion:     ref.descripcion     || '',
              precio_original: ref.precio_original  || 0,
              precio_descuento:ref.precio_descuento || 0,
              stock_actual:    ref.stock_actual     || 0,
              stock_inicial:   ref.stock_inicial    || 0,
              alcance:         ref.alcance          || 'LOCAL',
              lunas:           ref.lunas            || {},
              image_url:       ref.image_url        || '',
            });
          });
        }

        if (cards.length > 0) {
          setStripCards(cards);
          setStripLabel(agente.toLowerCase());
          setStripVisible(true);
        } else {
          setStripCards([]);
          setStripVisible(false);
        }
        return;
      }

      // ── Fallback: agentes no contemplados ───────────────────────────
      setStripCards([]);
      setStripVisible(false);

    } catch (err) {
      console.error('[useStripCards] Error:', err);
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