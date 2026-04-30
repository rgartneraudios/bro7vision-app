// src/hooks/useStripCards.js

import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export const useStripCards = () => {
  const [stripCards, setStripCards]     = useState([]);
  const [stripLabel, setStripLabel]     = useState('');
  const [stripVisible, setStripVisible] = useState(false);

  const cargarStripCards = useCallback(async (agente, ciudad, modalidad = 'LOCAL') => {
    const roleMap = {
      'BROSHOP_PRODUCTO': 'shop',
      'BROSHOP_SERVICIO': 'service',
      'BROSHOP_AVISO':    'aviso',
      'AUDIO':            'music',
    };
    const esPais      = modalidad === 'ONLINE';
    const roleBuscado = roleMap[agente];

    try {
      // ── BROSHOP_AVISO — lee de tabla avisos + banner_url del autor ──
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

      // ── RESTO DE AGENTES — leen de profiles ──
      let query = supabase
        .from('profiles')
        .select('bro_id, bro_ser, bro_avi, bro_aud, bro_pod, banner_url, alias, biz_category, biz_profession, city, address, nearby_ref, ref_price, description, role, audio_type, track_name, audio_description, audio_file')
        .limit(20);
      if (!esPais && ciudad) query = query.ilike('city', `%${ciudad}%`);
      const { data: perfiles, error } = await query;

      const filtrados = perfiles?.filter(p =>
        Array.isArray(p.role) ? p.role.includes(roleBuscado) : p.role === roleBuscado
      ) || [];

      const cards = agente === 'AUDIO'
        ? filtrados.flatMap(p => {
            if (!p.bro_aud && !p.bro_pod) return [];
            const esPodcast = p.audio_type === 'podcast';
            const codigo    = esPodcast ? p.bro_pod : p.bro_aud;
            if (!codigo) return [];
            return [{
              bro_id: codigo, banner_url: p.banner_url || '',
              nombre: p.alias || '', audio_file: p.audio_file || '',
              bro_aud: p.bro_aud || '',
              bro_pod: p.bro_pod || '',
              neighborhood: p.neighborhood || '',
              nearby_ref: p.nearby_ref || '',
              categoria: esPodcast ? 'Podcast' : 'Música', ciudad: p.city || '',
              descripcion: p.audio_description || p.description || '',
              track_name: p.track_name || '',
              audio_type: p.audio_type || 'music',
            }];
          })
        : agente === 'BROSHOP_SERVICIO'
        ? filtrados.filter(p => p.bro_ser).map(p => ({
            bro_id: p.bro_ser,
            banner_url: p.banner_url || '',
            nombre: p.alias || '',
            neighborhood: p.neighborhood || '',
            nearby_ref: p.nearby_ref || '',
            categoria: p.biz_profession || p.biz_category || '',
            ciudad: p.city || '', descripcion: p.description || '',
            ref_price: p.ref_price || '',
            address: p.address || '',
          }))
        : filtrados.filter(p => p.bro_id).map(p => ({
            bro_id: p.bro_id,
            banner_url: p.banner_url || '',
            nombre: p.alias || '',
            neighborhood: p.neighborhood || '',
            nearby_ref: p.nearby_ref || '',
            categoria: p.biz_category || p.biz_profession || '',
            ciudad: p.city || '',
            descripcion: p.description || p.nearby_ref || '',
            ref_price: p.ref_price || '', address: p.address || '',
          }));

      if (!error && cards.length > 0) {
        setStripCards(cards);
        setStripLabel(agente.toLowerCase());
        setStripVisible(true);
      } else {
        setStripCards([]);
        setStripVisible(false);
      }

    } catch (err) {
      console.error('Error cargando cards:', err);
      setStripCards([]);
      setStripVisible(false);
    }
  }, []);

  return {
    stripCards, setStripCards,
    stripLabel, setStripLabel,
    stripVisible, setStripVisible,
    cargarStripCards,
  };
};
