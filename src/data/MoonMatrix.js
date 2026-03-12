// src/data/MoonMatrix.js

export const PACKS_REGALOS = {
  nova: { label: 'NOVA PACK', price: 9.00, halos: 100, eco: 100, zap: 50 },
  crescens: { label: 'CRESCENS PACK', price: 9.50, halos: 110, eco: 100, zap: 50 },
  plena:     { label: 'PLENA PACK', price: 11.00, halos: 130, eco: 100, zap: 60 },
  decrescens:{ label: 'DECRESCENS PACK', price: 10.50, halos: 120, eco: 100, zap: 60 },
};

export const REGLAS_DESCUENTOS = {
  // Ahora guardamos la clase completa de Tailwind para evitar errores de renderizado
  nova:       { 
    label: 'NOVA VALE', pct: 0.05, min_items: 1, cost: 1000, 
    color: 'text-fuchsia-400', border: 'border-fuchsia-500', bg: 'bg-fuchsia-500' 
  },
  crescens:   { 
    label: 'CRESCENS VALE', pct: 0.10, min_items: 1, cost: 2000, 
    color: 'text-green-400', border: 'border-green-500', bg: 'bg-green-500' 
  },
  plena:      { 
    label: 'PLENA VALE', pct: 0.15, min_items: 2, cost: 4000, 
    color: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-500' 
  },
  decrescens: { 
    label: 'DECRESCENS VALE', pct: 0.15, min_items: 3, cost: 3000, 
    color: 'text-orange-400', border: 'border-orange-500', bg: 'bg-orange-500' 
  },
};

export const COSTE_SERVICIOS = {
  eco_text: 100,
  halo_regalo: 100,
  hyper_zap: 1000
};

export const MOON_MATRIX = {
  packs: PACKS_REGALOS,
  descuentos: REGLAS_DESCUENTOS,
  servicios: COSTE_SERVICIOS
};