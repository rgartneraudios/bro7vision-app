// src/data/MoonMatrix.js

// 1. PACKS FIAT (Generan activos "P" - Premium)
export const PACKS_REGALOS = {
  nova: { label: 'NOVA PACK', price: 9.00, halosP: 100, ecoP: 100, zapP: 50 },
  crescens: { label: 'CRESCENS PACK', price: 9.50, halosP: 110, ecoP: 100, zapP: 50 },
  plena:     { label: 'PLENA PACK', price: 11.00, halosP: 130, ecoP: 100, zapP: 60 },
  decrescens:{ label: 'DECRESCENS PACK', price: 10.50, halosP: 120, ecoP: 100, zapP: 60 },
};

// 2. VALES DE DESCUENTO (Se compran con Puntos Génesis)
export const REGLAS_DESCUENTOS = {
  nova:       { 
    label: 'NOVA VALE', pct: 0.10, min_items: 1, cost: 1000, 
    color: 'text-fuchsia-400', border: 'border-fuchsia-500', bg: 'bg-fuchsia-500' 
  },
  crescens:   { 
    label: 'CRESCENS VALE', pct: 0.15, min_items: 1, cost: 2000, 
    color: 'text-green-400', border: 'border-green-500', bg: 'bg-green-500' 
  },
  plena:      { 
    label: 'PLENA VALE', pct: 0.20, min_items: 2, cost: 4000, 
    color: 'text-white-200', border: 'border-white-300', bg: 'bg-white-300' 
  },
  decrescens: { 
    label: 'DECRESCENS VALE', pct: 0.20, min_items: 3, cost: 3000, 
    color: 'text-orange-500', border: 'border-orange-500', bg: 'bg-orange-500' 
  },
};

// 3. COSTE DE ACTIVOS GÉNESIS (Se compran con Puntos Génesis)
// Estos son los que NO se pueden quemar y en Fase 2 darán un 10% al creador.
export const COSTE_SERVICIOS_GEN = {
  eco_gen: 100,
  halo_gen: 100, 
  zap_gen: 1000
};

// 4. REGLAS DE QUEMA (Solo aplican para activos "P")
export const REGLAS_QUEMA = {
  quema_eco: { 
    label: '🔥 Quema de Ecos Premium',
    requiere: 180, tipo_requerido: 'ecoP', 
    recompensa: 50, tipo_recompensa: 'halosP' 
  },
  quema_zap: { 
    label: '⚡ Quema de Zaps Premium',
    requiere: 70, tipo_requerido: 'zapP', 
    recompensa: 50, tipo_recompensa: 'halosP' 
  }
};

// EXPORTACIÓN CENTRALIZADA
export const MOON_MATRIX = {
  packs: PACKS_REGALOS,
  descuentos: REGLAS_DESCUENTOS,
  servicios_gen: COSTE_SERVICIOS_GEN,
  quema: REGLAS_QUEMA
};