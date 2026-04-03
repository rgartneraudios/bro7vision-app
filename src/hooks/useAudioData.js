// src/hooks/useAudioData.js
// Fuente de verdad: realItems (viene de App.jsx) + updated_at de Supabase
// Alimenta: DI Audio, HoloPrisma A&L, BroLives, BroTuner

import { useState, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';

// ── Filtros disponibles ────────────────────────────────────────────────────
export const AUDIO_FILTERS = ['ALL', 'TALK', 'MUSIC', 'SHOP'];

// ── Hook principal ─────────────────────────────────────────────────────────
export const useAudioData = ({ realItems = [] } = {}) => {

  const [filter, setFilter]           = useState('ALL');
  const [activeHalo, setActiveHalo]   = useState(null);
  const [activeChannel, setActiveChannel] = useState(null); // canal activo en HoloPrisma

  // ── 1. Filtrado de canales disponibles ────────────────────────────────────
  // realItems viene ya procesado desde App.jsx (Supabase + MASTER_DB)
  const filteredChannels = useMemo(() => {
    const safe = Array.isArray(realItems) ? realItems : [];
    return safe.filter(c =>
      filter === 'ALL' || (c.role && c.role.includes(filter))
    );
  }, [filter, realItems]);

  // ── 2. Seleccionar canal → alimenta HoloPrisma + BroLives ────────────────
  const selectChannel = useCallback((canal) => {
    setActiveChannel(canal);
  }, []);

  const clearChannel = useCallback(() => {
    setActiveChannel(null);
  }, []);

  // ── 3. Trigger Halo (medusa animada) ─────────────────────────────────────
  const triggerHalo = useCallback((creator) => {
    setActiveHalo(creator.alias?.toUpperCase() || 'CREADOR');
    setTimeout(() => setActiveHalo(null), 6000);
  }, []);

  // ── 4. Buscar canal por alias (para DI: "ponme a Larry") ─────────────────
  const findChannelByAlias = useCallback((query) => {
    const q = query.toLowerCase().trim();
    const safe = Array.isArray(realItems) ? realItems : [];
    return safe.find(c =>
      c.alias?.toLowerCase().includes(q) ||
      c.name?.toLowerCase().includes(q)
    ) || null;
  }, [realItems]);

  // ── 5. ¿Tiene contenido nuevo? (usa updated_at de Supabase) ─────────────
  // DI puede preguntar: "¿Larry tiene algo nuevo?"
  const checkIfNew = useCallback(async (alias, diasUmbral = 7) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('alias, updated_at, audio_file')
      .ilike('alias', `%${alias}%`)
      .maybeSingle();

    if (error || !data) return { found: false };

    const updated = new Date(data.updated_at);
    const ahora   = new Date();
    const dias    = Math.floor((ahora - updated) / (1000 * 60 * 60 * 24));
    const esNuevo = dias <= diasUmbral;

    return {
      found:      true,
      alias:      data.alias,
      audio_file: data.audio_file,
      dias,
      esNuevo,
      // Texto listo para el DI
      mensaje: esNuevo
        ? `${data.alias} actualizó hace ${dias} día${dias === 1 ? '' : 's'}. ¿Lo ponemos?`
        : `${data.alias} no tiene contenido nuevo reciente (última actualización hace ${dias} días).`,
    };
  }, []);

  // ── 6. handleGoToShop (acción de tarjeta → Terminal) ─────────────────────
  const buildShopItem = useCallback((creator) => ({
    ...creator,
    name:      creator.product_title || creator.name || 'Producto Genérico',
    shopName:  creator.alias,
    img:       creator.img || creator.banner_url || creator.avatar_url,
    isAsset:   false,
    hasProduct: true,
    productData: {
      name:  creator.product_title || 'Servicio Creator',
      price: creator.product_price || creator.price || 10,
    },
  }), []);

  // ── Retorno del hook ──────────────────────────────────────────────────────
  return {
    // Estado
    filter,
    filteredChannels,
    activeHalo,
    activeChannel,

    // Setters
    setFilter,

    // Acciones
    selectChannel,
    clearChannel,
    triggerHalo,
    findChannelByAlias,   // DI: "ponme a Larry"
    checkIfNew,           // DI: "¿Larry tiene algo nuevo?"
    buildShopItem,        // DI: ir a Terminal desde A&L
  };
};
