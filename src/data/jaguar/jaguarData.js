// src/data/jaguar/jaguarData.js
// Barrel file — re-exporta todos los imports de JaguarBanner.jsx

// Función helpers
export { calcularSignoSideral } from './calcularSigno';

// Signos (13) — ahora con mito integrado
export { aries } from './stories/aries';
export { tauro } from './stories/tauro';
export { geminis } from './stories/geminis';
export { cancer } from './stories/cancer';
export { leo } from './stories/leo';
export { virgo } from './stories/virgo';
export { libra } from './stories/libra';
export { escorpio } from './stories/escorpio';
export { ofiuco } from './stories/ofiuco';
export { sagitario } from './stories/sagitario';
export { capricornio } from './stories/capricornio';
export { acuario } from './stories/acuario';
export { piscis } from './stories/piscis';

// Amazonas (2)
export { amazonas1 } from './amazonas/amazonas1';
export { amazonas2 } from './amazonas/amazonas2';

// Mapa numérico para cuentos de Jaguar
import { aries } from './stories/aries';
import { tauro } from './stories/tauro';
import { geminis } from './stories/geminis';
import { cancer } from './stories/cancer';
import { leo } from './stories/leo';
import { virgo } from './stories/virgo';
import { libra } from './stories/libra';
import { escorpio } from './stories/escorpio';
import { ofiuco } from './stories/ofiuco';
import { sagitario } from './stories/sagitario';
import { capricornio } from './stories/capricornio';
import { acuario } from './stories/acuario';
import { piscis } from './stories/piscis';
import { amazonas1 } from './amazonas/amazonas1';
import { amazonas2 } from './amazonas/amazonas2';

export const JAGUAR_CUENTO_MAP = {
  1:  aries,
  2:  tauro,
  3:  geminis,
  4:  cancer,
  5:  leo,
  6:  virgo,
  7:  libra,
  8:  escorpio,
  9:  ofiuco,
  10: sagitario,
  11: capricornio,
  12: acuario,
  13: piscis,
  14: amazonas1,
  15: amazonas2,
};