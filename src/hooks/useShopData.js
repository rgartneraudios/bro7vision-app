// src/hooks/useShopData.js
// Fuente de verdad: Supabase profiles + catalog_items
// Alimenta: Mapache DI, HoloPrisma, Terminal individual

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

// ── Utilidad de color neon por card_color ──────────────────────────────────
export const getNeon = (cardColor) => {
  const map = {
    cyan:    '#00E1FF',
    fuchsia: '#FF007D',
    yellow:  '#FFD700',
    green:   '#00FF48',
    blue:    '#1E40AF',
    red:     '#FF1A1A',
    orange:  '#FF8000',
    white:   '#FFFFFF',
  };
  return map[cardColor?.split('-')[0]] || '#00E1FF';
};

// ── Hook principal ─────────────────────────────────────────────────────────
export const useShopData = ({
  sessionCP,
  ososHandoffContext,
  onHandoffConsumed,
} = {}) => {

  const [comercios, setComercios]         = useState([]);
  const [resultados, setResultados]       = useState({});   // { owner_id: [catalog_items] }
  const [search, setSearch]               = useState('');
  const [loading, setLoading]             = useState(false);
  const [vlActivo, setVlActivo]           = useState(null);
  const [puertasCerradas, setPuertasCerradas] = useState(false);

  // ── 1. Consumir handoff de Osos ──────────────────────────────────────────
  useEffect(() => {
    if (ososHandoffContext?.intencion) {
      setSearch(ososHandoffContext.intencion);
      onHandoffConsumed?.();
    }
  }, [ososHandoffContext]);

  // ── 2. Fetch de comercios por CP ─────────────────────────────────────────
  useEffect(() => {
    const fetchComercios = async () => {
      setLoading(true);
      setPuertasCerradas(true);

      let query = supabase
        .from('profiles')
        .select(`
          id, alias, avatar_url, banner_url, card_banner_url,
          neighborhood, nearby_ref, description,
          audio_file, video_file, zip_code, card_color,
          biz_category, biz_profession, updated_at
        `)
        .not('biz_category', 'is', null)
        .order('alias');

      if (sessionCP) query = query.eq('zip_code', sessionCP);

      const { data, error } = await query;
      if (!error && data) setComercios(data);

      setLoading(false);
      setTimeout(() => setPuertasCerradas(false), 400);
    };

    fetchComercios();
  }, [sessionCP]);

  // ── 3. Búsqueda en catalog_items ─────────────────────────────────────────
  const buscar = useCallback(async (q) => {
    if (!q.trim() || comercios.length === 0) {
      setResultados({});
      setTimeout(() => setPuertasCerradas(false), 300);
      return;
    }

    const ownerIds = comercios.map(c => c.id);
    const { data, error } = await supabase
      .from('catalog_items')
      .select('id, owner_id, title, price_fiat, img_url')
      .in('owner_id', ownerIds)
      .ilike('title', `%${q.trim()}%`)
      .limit(100);

    if (!error && data) {
      const agrupado = {};
      data.forEach(item => {
        if (!agrupado[item.owner_id]) agrupado[item.owner_id] = [];
        agrupado[item.owner_id].push(item);
      });
      setResultados(agrupado);
    }

    setTimeout(() => setPuertasCerradas(false), 300);
  }, [comercios]);

  // ── 4. Debounce del search ────────────────────────────────────────────────
  useEffect(() => {
    setPuertasCerradas(true);
    const timer = setTimeout(() => buscar(search), 500);
    return () => clearTimeout(timer);
  }, [search, buscar]);

  // ── 5. Virtual Location ───────────────────────────────────────────────────
  const activarVL = useCallback((comercio) => {
    const vl = {
      alias:      comercio.alias,
      nearbyRef:  comercio.nearby_ref,
      cp:         comercio.zip_code,
      avatar_url: comercio.avatar_url,
    };
    setVlActivo(vl);
    return vl;                          // el caller puede hacer onVLChange(vl)
  }, []);

  const desactivarVL = useCallback(() => {
    setVlActivo(null);
  }, []);

  // ── 6. Fetch de comercio individual (para Terminal / Mapache handoff) ────
  const fetchComercioById = useCallback(async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) return null;
    return data;
  }, []);

  // ── 7. Fetch de catalog_items de un comercio individual ──────────────────
  const fetchCatalogByOwner = useCallback(async (ownerId) => {
    const { data, error } = await supabase
      .from('catalog_items')
      .select('id, title, price_fiat, img_url, description, catalog_url')
      .eq('owner_id', ownerId)
      .order('title');
    if (error) return [];
    return data || [];
  }, []);

  // ── Retorno del hook ──────────────────────────────────────────────────────
  return {
    // Estado
    comercios,
    resultados,
    search,
    loading,
    vlActivo,
    puertasCerradas,

    // Setters
    setSearch,

    // Acciones
    activarVL,
    desactivarVL,
    fetchComercioById,
    fetchCatalogByOwner,

    // Utilidad
    getNeon,
  };
};
