// src/data/MoonMatrix.js

// 1. PACKS FIAT (Generan activos "P" - Premium)
export const PACKS_REGALOS = {
  nova: { label: 'LUNA NUEVA PACK', price: 9.00, halosP: 100, ecoP: 100, zapP: 50 },
  crescens: { label: 'CRECIENTE PACK', price: 9.50, halosP: 110, ecoP: 100, zapP: 50 },
  plena:     { label: 'LUNA LLENA PACK', price: 11.00, halosP: 130, ecoP: 100, zapP: 60 },
  decrescens:{ label: 'MENGUANTE PACK', price: 10.50, halosP: 120, ecoP: 100, zapP: 60 },
};

// 2. COSTE DE ACTIVOS GÉNESIS (Se compran con Puntos Génesis)
// Estos son los que NO se pueden quemar y en Fase 2 darán un 10% al creador.
export const COSTE_SERVICIOS_GEN = {
  eco_gen: 100,
  halo_gen: 100, 
  zap_gen: 1000
};

// 3. REGLAS DE QUEMA (Solo aplican para activos "P")
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
  servicios_gen: COSTE_SERVICIOS_GEN,
  quema: REGLAS_QUEMA
};