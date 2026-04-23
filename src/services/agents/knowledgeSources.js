// src/services/agents/knowledgeSources.js
// Fuente única de datos para promptBuilder y useAgentChat.
// Aquí solo imports y el mapa. Sin lógica, sin detectores.
// ─────────────────────────────────────────────────────────────────────────────

// ── OSOS — archivos con voz propia por personaje ──────────────────────────────
import { ia_prepago as ia_prepago_tito }               from '../../data/tito/ia_prepago.js'
import { ia_prepago as ia_prepago_lara }               from '../../data/lara/ia_prepago.js'
import { ia_prepago as ia_prepago_puffo }              from '../../data/puffo/ia_prepago.js'

import { economia_lunar as economia_lunar_tito }       from '../../data/tito/economia_lunar.js'
import { economia_lunar as economia_lunar_lara }       from '../../data/lara/economia_lunar.js'
import { economia_lunar as economia_lunar_puffo }      from '../../data/puffo/economia_lunar.js'

import { sectores_guia as sectores_guia_tito }         from '../../data/tito/sectores_guia.js'
import { sectores_guia as sectores_guia_lara }         from '../../data/lara/sectores_guia.js'
import { sectores_guia as sectores_guia_puffo }        from '../../data/puffo/sectores_guia.js'

import { creadores_monetizacion as creadores_tito }    from '../../data/tito/creadores_monetizacion.js'
import { creadores_monetizacion as creadores_lara }    from '../../data/lara/creadores_monetizacion.js'
import { creadores_monetizacion as creadores_puffo }   from '../../data/puffo/creadores_monetizacion.js'

import { normas_legal as normas_tito }                 from '../../data/tito/normas_legal.js'
import { normas_legal as normas_lara }                 from '../../data/lara/normas_legal.js'
import { normas_legal as normas_puffo }                from '../../data/puffo/normas_legal.js'

// ── esde — contexto de llegada ────────────────────────────────────────────────
import { esdeOraculo as esdeOraculo_tito }             from '../../data/tito/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_lara }             from '../../data/lara/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_puffo }            from '../../data/puffo/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_nova }             from '../../data/nova/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_novaCierre }       from '../../data/nova_cierre/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_isabella }         from '../../data/isabella/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_isabellaCierre }   from '../../data/isabella_cierre/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_profesor }         from '../../data/profesor/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_evelyn }           from '../../data/evelyn/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_larry }            from '../../data/larry/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_ami }              from '../../data/ami/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_mapache }          from '../../data/mapache/esdeOraculo.js'
import { esdeOraculo as esdeOraculo_rumores }          from '../../data/rumores/esdeOraculo.js'

import { esdeOsos as esdeOsos_nova }                   from '../../data/nova/esdeOsos.js'
import { esdeOsos as esdeOsos_novaCierre }             from '../../data/nova_cierre/esdeOsos.js'
import { esdeOsos as esdeOsos_isabella }               from '../../data/isabella/esdeOsos.js'
import { esdeOsos as esdeOsos_isabellaCierre }         from '../../data/isabella_cierre/esdeOsos.js'
import { esdeOsos as esdeOsos_profesor }               from '../../data/profesor/esdeOsos.js'
import { esdeOsos as esdeOsos_evelyn }                 from '../../data/evelyn/esdeOsos.js'
import { esdeOsos as esdeOsos_larry }                  from '../../data/larry/esdeOsos.js'
import { esdeOsos as esdeOsos_ami }                    from '../../data/ami/esdeOsos.js'
import { esdeOsos as esdeOsos_mapache }                from '../../data/mapache/esdeOsos.js'
import { esdeOsos as esdeOsos_jaguar }                 from '../../data/jaguar/esdeOsos.js'
import { esdeOsos as esdeOsos_orumama }                from '../../data/orumama/esdeOsos.js'
import { esdeOsos as esdeOsos_smisterio }              from '../../data/smisterio/esdeOsos.js'
import { esdeOsos as esdeOsos_rumores }                from '../../data/rumores/esdeOsos.js'

import { esdeRumores as esdeRumores_tito }             from '../../data/tito/esdeRumores.js'
import { esdeRumores as esdeRumores_lara }             from '../../data/lara/esdeRumores.js'
import { esdeRumores as esdeRumores_puffo }            from '../../data/puffo/esdeRumores.js'
import { esdeRumores as esdeRumores_nova }             from '../../data/nova/esdeRumores.js'
import { esdeRumores as esdeRumores_novaCierre }       from '../../data/nova_cierre/esdeRumores.js'
import { esdeRumores as esdeRumores_isabella }         from '../../data/isabella/esdeRumores.js'
import { esdeRumores as esdeRumores_isabellaCierre }   from '../../data/isabella_cierre/esdeRumores.js'
import { esdeRumores as esdeRumores_profesor }         from '../../data/profesor/esdeRumores.js'
import { esdeRumores as esdeRumores_evelyn }           from '../../data/evelyn/esdeRumores.js'
import { esdeRumores as esdeRumores_larry }            from '../../data/larry/esdeRumores.js'
import { esdeRumores as esdeRumores_ami }              from '../../data/ami/esdeRumores.js'
import { esdeRumores as esdeRumores_mapache }          from '../../data/mapache/esdeRumores.js'
import { esdeRumores as esdeRumores_jaguar }           from '../../data/jaguar/esdeRumores.js'
import { esdeRumores as esdeRumores_orumama }          from '../../data/orumama/esdeRumores.js'
import { esdeRumores as esdeRumores_smisterio }        from '../../data/smisterio/esdeRumores.js'

import { esdeAudio as esdeAudio_tito }                 from '../../data/tito/esdeAudio.js'
import { esdeAudio as esdeAudio_lara }                 from '../../data/lara/esdeAudio.js'
import { esdeAudio as esdeAudio_puffo }                from '../../data/puffo/esdeAudio.js'
import { esdeAudio as esdeAudio_nova }                 from '../../data/nova/esdeAudio.js'
import { esdeAudio as esdeAudio_novaCierre }           from '../../data/nova_cierre/esdeAudio.js'
import { esdeAudio as esdeAudio_isabella }             from '../../data/isabella/esdeAudio.js'
import { esdeAudio as esdeAudio_isabellaCierre }       from '../../data/isabella_cierre/esdeAudio.js'
import { esdeAudio as esdeAudio_profesor }             from '../../data/profesor/esdeAudio.js'
import { esdeAudio as esdeAudio_evelyn }               from '../../data/evelyn/esdeAudio.js'
import { esdeAudio as esdeAudio_larry }                from '../../data/larry/esdeAudio.js'
import { esdeAudio as esdeAudio_jaguar }               from '../../data/jaguar/esdeAudio.js'
import { esdeAudio as esdeAudio_orumama }              from '../../data/orumama/esdeAudio.js'
import { esdeAudio as esdeAudio_smisterio }            from '../../data/smisterio/esdeAudio.js'
import { esdeAudio as esdeAudio_rumores }              from '../../data/rumores/esdeAudio.js'

// ── Orumama — hierbas ─────────────────────────────────────────────────────────
import { albahaca }   from '../../data/orumama/albahaca.js'
import { jengibre }   from '../../data/orumama/jengibre.js'
import { lavanda }    from '../../data/orumama/lavanda.js'
import { manzanilla } from '../../data/orumama/manzanilla.js'
import { melisa }     from '../../data/orumama/melisa.js'
import { menta }      from '../../data/orumama/menta.js'
import { oregano }    from '../../data/orumama/oregano.js'
import { romaza }     from '../../data/orumama/romaza.js'
import { romero }     from '../../data/orumama/romero.js'
import { ruda }       from '../../data/orumama/ruda.js'
import { salvia }     from '../../data/orumama/salvia.js'
import { tomillo }    from '../../data/orumama/tomillo.js'

// ── Jaguar — signos siderales ─────────────────────────────────────────────────
import { aries }       from '../../data/jaguar/aries.js'
import { tauro }       from '../../data/jaguar/tauro.js'
import { geminis }     from '../../data/jaguar/geminis.js'
import { cancer }      from '../../data/jaguar/cancer.js'
import { leo }         from '../../data/jaguar/leo.js'
import { virgo }       from '../../data/jaguar/virgo.js'
import { libra }       from '../../data/jaguar/libra.js'
import { escorpio }    from '../../data/jaguar/escorpio.js'
import { ofiuco }      from '../../data/jaguar/ofiuco.js'
import { sagitario }   from '../../data/jaguar/sagitario.js'
import { capricornio } from '../../data/jaguar/capricornio.js'
import { acuario }     from '../../data/jaguar/acuario.js'
import { piscis }      from '../../data/jaguar/piscis.js'

// ── Smisterio — misterios ─────────────────────────────────────────────────────
import { antartida } from '../../data/smisterio/Antartida.js'
import { bucegi }    from '../../data/smisterio/Bucegi.js'
import { egipto }    from '../../data/smisterio/egipto.js'
import { tartaria }  from '../../data/smisterio/tartaria.js'

// ── Rumores ───────────────────────────────────────────────────────────────────
import { registro_fundadores } from '../../data/rumores/registro_fundadores.js'

// ── Ami y Mapache ─────────────────────────────────────────────────────────────
import { audio_ami }                          from '../../data/ami/audio.js'
import { audio_mapache }                      from '../../data/mapache/audio.js'
import { brotuner_ami}                          from '../../data/ami/brotuner.js'
import { brotuner_mapache}                from '../../data/mapache/brotuner.js'
import { entretenimiento_juegos_ami }        from '../../data/ami/entretenimiento_juegos.js'
import { entretenimiento_juegos_mapache }    from '../../data/mapache/entretenimiento_juegos.js'

// ─────────────────────────────────────────────────────────────────────────────
// MAPA CENTRAL — fuente única para promptBuilder y useAgentChat
// ─────────────────────────────────────────────────────────────────────────────
export const KNOWLEDGE_SOURCES = {

  tito: {
    ia_prepago:             ia_prepago_tito,
    economia_lunar:         economia_lunar_tito,
    sectores_guia:          sectores_guia_tito,
    creadores_monetizacion: creadores_tito,
    normas_legal:           normas_tito,
    esdeOraculo:            esdeOraculo_tito,
    esdeRumores:            esdeRumores_tito,
    esdeAudio:              esdeAudio_tito,
  },

  lara: {
    ia_prepago:             ia_prepago_lara,
    economia_lunar:         economia_lunar_lara,
    sectores_guia:          sectores_guia_lara,
    creadores_monetizacion: creadores_lara,
    normas_legal:           normas_lara,
    esdeOraculo:            esdeOraculo_lara,
    esdeRumores:            esdeRumores_lara,
    esdeAudio:              esdeAudio_lara,
  },

  puffo: {
    ia_prepago:             ia_prepago_puffo,
    economia_lunar:         economia_lunar_puffo,
    sectores_guia:          sectores_guia_puffo,
    creadores_monetizacion: creadores_puffo,
    normas_legal:           normas_puffo,
    esdeOraculo:            esdeOraculo_puffo,
    esdeRumores:            esdeRumores_puffo,
    esdeAudio:              esdeAudio_puffo,
  },

  nova: {
    esdeOsos:    esdeOsos_nova,
    esdeOraculo: esdeOraculo_nova,
    esdeRumores: esdeRumores_nova,
    esdeAudio:   esdeAudio_nova,
  },

  nova_cierre: {
    esdeOsos:    esdeOsos_novaCierre,
    esdeOraculo: esdeOraculo_novaCierre,
    esdeRumores: esdeRumores_novaCierre,
    esdeAudio:   esdeAudio_novaCierre,
  },

  isabella: {
    esdeOsos:    esdeOsos_isabella,
    esdeOraculo: esdeOraculo_isabella,
    esdeRumores: esdeRumores_isabella,
    esdeAudio:   esdeAudio_isabella,
  },

  isabella_cierre: {
    esdeOsos:    esdeOsos_isabellaCierre,
    esdeOraculo: esdeOraculo_isabellaCierre,
    esdeRumores: esdeRumores_isabellaCierre,
    esdeAudio:   esdeAudio_isabellaCierre,
  },

  profesor: {
    esdeOsos:    esdeOsos_profesor,
    esdeOraculo: esdeOraculo_profesor,
    esdeRumores: esdeRumores_profesor,
    esdeAudio:   esdeAudio_profesor,
  },

  evelyn: {
    esdeOsos:    esdeOsos_evelyn,
    esdeOraculo: esdeOraculo_evelyn,
    esdeRumores: esdeRumores_evelyn,
    esdeAudio:   esdeAudio_evelyn,
  },

  larry: {
    esdeOsos:    esdeOsos_larry,
    esdeOraculo: esdeOraculo_larry,
    esdeRumores: esdeRumores_larry,
    esdeAudio:   esdeAudio_larry,
  },

  mapache: {
    audio: 					audio_mapache,
    brotuner: 				brotuner_mapache,
    entretenimiento_juegos: 	entretenimiento_juegos_mapache,
    esdeOsos:               			esdeOsos_mapache,
    esdeOraculo:            		esdeOraculo_mapache,
    esdeRumores:            		esdeRumores_mapache,
  },

  ami: {
    audio:                  			audio_ami,
    brotuner: 				brotuner_ami,
    entretenimiento_juegos: 	entretenimiento_juegos_ami,
    esdeOsos:               			esdeOsos_ami,
    esdeOraculo:            		esdeOraculo_ami,
    esdeRumores:            		esdeRumores_ami,
  },

  orumama: {
    albahaca, jengibre, lavanda, manzanilla, melisa, menta,
    oregano, romaza, romero, ruda, salvia, tomillo,
    esdeOsos:    esdeOsos_orumama,
    esdeRumores: esdeRumores_orumama,
    esdeAudio:   esdeAudio_orumama,
  },

  jaguar: {
    aries, tauro, geminis, cancer, leo, virgo,
    libra, escorpio, ofiuco, sagitario, capricornio, acuario, piscis,
    esdeOsos:    esdeOsos_jaguar,
    esdeRumores: esdeRumores_jaguar,
    esdeAudio:   esdeAudio_jaguar,
  },

  smisterio: {
    antartida, bucegi, egipto, tartaria,
    esdeOsos:    esdeOsos_smisterio,
    esdeRumores: esdeRumores_smisterio,
    esdeAudio:   esdeAudio_smisterio,
  },

  rumores: {
    registro_fundadores,
    esdeOsos:    esdeOsos_rumores,
    esdeOraculo: esdeOraculo_rumores,
    esdeAudio:   esdeAudio_rumores,
  },
}
