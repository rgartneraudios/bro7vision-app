// src/data/smisterio/smisterioData.js

export { laOperacionHighjump }    from './antartida/LaOperacionHighjump';
export { elLagoVostok }           from './antartida/ElLagoVostok';
export { elPlanoSinFin }          from './antartida/ElPlanoSinFin';
export { lasCivilizacionesCongeladas } from './antartida/LasCivilizacionesCongeladas';

export { elBosqueDeDracula }      from './bucegi/ElBosqueDeDracula';
export { rumboBucegi }            from './bucegi/RumboBucegi';
export { elPasadizoSecreto }      from './bucegi/ElPasadizoSecreto';
export { laTeoriaStargate }       from './bucegi/LaTeoriaStargate';

export { elTeDeLMercader }        from './egipto/ElTeDeLMercader';
export { lanocheEnLaPiramide }    from './egipto/LanocheEnLaPiramide';
export { losSecretosDelDesierto } from './egipto/LosSecretosDelDesierto';
export { memphisYElMisissipi }    from './egipto/MemphisYElMisissipi';

export { elImperioPerdido }       from './tartaria/ElImperioPerdido';
export { lasCatedralosHundidas }  from './tartaria/LasCatedralosHundidas';
export { artePerdido }            from './tartaria/ArtePerdido';
export { elTransiberiano }        from './tartaria/ElTransiberiano';

// Mapa numérico: numero → episodio completo
import { laOperacionHighjump }         from './antartida/LaOperacionHighjump';
import { elLagoVostok }                from './antartida/ElLagoVostok';
import { elPlanoSinFin }               from './antartida/ElPlanoSinFin';
import { lasCivilizacionesCongeladas } from './antartida/LasCivilizacionesCongeladas';
import { elBosqueDeDracula }           from './bucegi/ElBosqueDeDracula';
import { rumboBucegi }                 from './bucegi/RumboBucegi';
import { elPasadizoSecreto }           from './bucegi/ElPasadizoSecreto';
import { laTeoriaStargate }            from './bucegi/LaTeoriaStargate';
import { elTeDeLMercader }             from './egipto/ElTeDeLMercader';
import { lanocheEnLaPiramide }         from './egipto/LanocheEnLaPiramide';
import { losSecretosDelDesierto }      from './egipto/LosSecretosDelDesierto';
import { memphisYElMisissipi }         from './egipto/MemphisYElMisissipi';
import { elImperioPerdido }            from './tartaria/ElImperioPerdido';
import { lasCatedralosHundidas }       from './tartaria/LasCatedralosHundidas';
import { artePerdido }                 from './tartaria/ArtePerdido';
import { elTransiberiano }             from './tartaria/ElTransiberiano';

export const SMISTERIO_CUENTO_MAP = {
  1:  laOperacionHighjump,
  2:  elLagoVostok,
  3:  elPlanoSinFin,
  4:  lasCivilizacionesCongeladas,
  5:  elBosqueDeDracula,
  6:  rumboBucegi,
  7:  elPasadizoSecreto,
  8:  laTeoriaStargate,
  9:  elTeDeLMercader,
  10: lanocheEnLaPiramide,
  11: losSecretosDelDesierto,
  12: memphisYElMisissipi,
  13: elImperioPerdido,
  14: lasCatedralosHundidas,
  15: artePerdido,
  16: elTransiberiano,
};