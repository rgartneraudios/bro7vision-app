// src/data/MoonMatrix.js

// CONFIGURACIÓN DE PACKS (RUEDA IN - Dinero Real)
export const PACKS_REGALOS = {
  nova:      { label: 'NOVA', price: 9.00,  halos: 100, eco: 100, zap: 50 },
  crescens:  { label: 'CRESCENS', price: 9.50,  halos: 110, eco: 100, zap: 50 },
  plena:     { label: 'PLENA', price: 11.00, halos: 130, eco: 100, zap: 60 },
  decrescens:{ label: 'DECRESCENS', price: 10.50, halos: 120, eco: 100, zap: 60 },
};

// CONFIGURACIÓN DE DESCUENTOS (RUEDA OUT - Puntos Génesis)
// Regla: 1 vale por compra.
export const REGLAS_DESCUENTOS = {
  nova:       { label: 'NOVA', pct: 0.05, min_items: 1, color: 'text-fuchsia-400' },
  crescens:   { label: 'CRESCENS', pct: 0.10, min_items: 1, color: 'text-green-400' },
  plena:      { label: 'PLENA', pct: 0.15, min_items: 3, color: 'text-yellow-400' },
  decrescens: { label: 'DECRESCENS', pct: 0.15, min_items: 2, color: 'text-orange-400' },
};

// COSTES DE SERVICIOS (Usando Génesis)
export const COSTE_SERVICIOS = {
  eco_text: 100,
  halo_regalo: 100,
  hyper_zap: 1000
};