// src/data/MoonMatrix.js

// CONFIGURACIÓN DE PACKS (RUEDA IN - Dinero Real)
export const PACKS_REGALOS = {
  nova: { label: 'NOVA PACK', price: 9.00, halos: 100, eco: 100, zap: 50 },
  crescens: { label: 'CRESCENS PACK', price: 9.50, halos: 110, eco: 100, zap: 50 },
  plena:     { label: 'PLENA PACK', price: 11.00, halos: 130, eco: 100, zap: 60 },
  decrescens:{ label: 'DECRESCENS PACK', price: 10.50, halos: 120, eco: 100, zap: 60 },
};

// CONFIGURACIÓN DE DESCUENTOS (RUEDA OUT - Puntos Génesis)
// Regla: 1 vale por compra.
export const REGLAS_DESCUENTOS = {
  nova: { label: 'NOVA VALE', pct: 0.05, min: 1, color: 'text-fuchsia-400', cost: 1000 },
  crescens: { label: 'CRESCENS VALE', pct: 0.10, min: 1, color: 'text-green-400', cost: 2000 },
  plena:      { label: 'PLENA VALE', pct: 0.15, min_items: 2, color: 'text-yellow-400' },
  decrescens: { label: 'DECRESCENS VALE', pct: 0.15, min_items: 3, color: 'text-orange-400' },
};

// COSTES DE SERVICIOS (Usando Génesis)
export const COSTE_SERVICIOS = {
  eco_text: 100,
  halo_regalo: 100,
  hyper_zap: 1000
};