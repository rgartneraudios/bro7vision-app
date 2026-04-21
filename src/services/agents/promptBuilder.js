// src/services/agents/promptBuilder.js
// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS — cada nombre duplicado recibe alias _personaje
// ─────────────────────────────────────────────────────────────────────────────

// ── Personalidades ────────────────────────────────────────────────────────────
import titoProfile           from '../../data/tito/Personalidad.js'
import laraProfile           from '../../data/lara/Personalidad.js'
import puffoProfile          from '../../data/puffo/Personalidad.js'
import novaProfile           from '../../data/nova/Personalidad.js'
import novaCierreProfile     from '../../data/nova_cierre/Personalidad.js'
import isabellaProfile       from '../../data/isabella/Personalidad.js'
import isabellaCierreProfile from '../../data/isabella_cierre/Personalidad.js'
import profesorProfile       from '../../data/profesor/Personalidad.js'
import evelynProfile         from '../../data/evelyn/Personalidad.js'
import larryProfile          from '../../data/larry/Personalidad.js'
import mapacheProfile        from '../../data/mapache/Personalidad.js'
import amiProfile            from '../../data/ami/Personalidad.js'
import orumamaProfile        from '../../data/orumama/Personalidad.js'
import smisterioProfile      from '../../data/smisterio/Personalidad.js'
import jaguarProfile         from '../../data/jaguar/Personalidad.js'
import rumoresProfile        from '../../data/rumores/Personalidad.js'

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

// ── esde — contexto de llegada por personaje (voz distinta en cada uno) ───────
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
import { esdeRumores as esdeRumores_jaguar }           from '../../data/jaguar/esdeRumores.js'  // pendiente de crear
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
import { esdeAudio as esdeAudio_rumores }            from '../../data/rumores/esdeAudio.js'


// ── Orumama — hierbas ─────────────────────────────────────────────────────────
import { albahaca }    from '../../data/orumama/albahaca.js'
import { jengibre }    from '../../data/orumama/jengibre.js'
import { lavanda }     from '../../data/orumama/lavanda.js'
import { manzanilla }  from '../../data/orumama/manzanilla.js'
import { melisa }      from '../../data/orumama/melisa.js'
import { menta }       from '../../data/orumama/menta.js'
import { oregano }     from '../../data/orumama/oregano.js'
import { romaza }      from '../../data/orumama/romaza.js'
import { romero }      from '../../data/orumama/romero.js'
import { ruda }        from '../../data/orumama/ruda.js'
import { salvia }      from '../../data/orumama/salvia.js'
import { tomillo }     from '../../data/orumama/tomillo.js'

// ── Jaguar — signos siderales ─────────────────────────────────────────────────
import { calcularSignoSideral } from '../../data/jaguar/calcularSigno.js'
import { aries }          from '../../data/jaguar/aries.js'
import { tauro }          from '../../data/jaguar/tauro.js'
import { geminis }        from '../../data/jaguar/geminis.js'
import { cancer }         from '../../data/jaguar/cancer.js'
import { leo }            from '../../data/jaguar/leo.js'
import { virgo }          from '../../data/jaguar/virgo.js'
import { libra }          from '../../data/jaguar/libra.js'
import { escorpio }       from '../../data/jaguar/escorpio.js'
import { ofiuco }         from '../../data/jaguar/ofiuco.js'
import { sagitario }      from '../../data/jaguar/sagitario.js'
import { capricornio }    from '../../data/jaguar/capricornio.js'
import { acuario }        from '../../data/jaguar/acuario.js'
import { piscis }         from '../../data/jaguar/piscis.js'

// ── Smisterio — misterios ─────────────────────────────────────────────────────
import { antartida }   from '../../data/smisterio/antartida.js'
import { bucegi }      from '../../data/smisterio/bucegi.js'
import { egipto }      from '../../data/smisterio/egipto.js'
import { tartaria }    from '../../data/smisterio/tartaria.js'

// ── Rumores ───────────────────────────────────────────────────────────────────
import { registro_fundadores } from '../../data/rumores/registro_fundadores.js'

// ── Ami y Mapache — entretenimiento ───────────────────────────────────────────
import { entretenimiento_juegos as juegos_ami }     from '../../data/ami/entretenimiento_juegos.js'
import { entretenimiento_juegos as juegos_mapache } from '../../data/mapache/entretenimiento_juegos.js'

// ── Audio propio de Ami y Mapache ─────────────────────────────────────────────
import { audio as audio_ami }     from '../../data/ami/audio.js'
import { audio as audio_mapache } from '../../data/mapache/audio.js'

// ─────────────────────────────────────────────────────────────────────────────
// MAPA DE PERFILES
// ─────────────────────────────────────────────────────────────────────────────
const PERFILES = {
  tito:             titoProfile,
  lara:             laraProfile,
  puffo:            puffoProfile,
  nova:             novaProfile,
  nova_cierre:      novaCierreProfile,
  isabella:         isabellaProfile,
  isabella_cierre:  isabellaCierreProfile,
  profesor:         profesorProfile,
  evelyn:           evelynProfile,
  larry:            larryProfile,
  mapache:          mapacheProfile,
  ami:              amiProfile,
  orumama:          orumamaProfile,
  smisterio:        smisterioProfile,
  jaguar:           jaguarProfile,
  rumores:          rumoresProfile,
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE SOURCES — fuentes de datos por personaje
// Cada personaje solo tiene las keys que le corresponden.
// ─────────────────────────────────────────────────────────────────────────────
const KNOWLEDGE_SOURCES = {

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
    audio:                  audio_mapache,
    entretenimiento_juegos: juegos_mapache,
    esdeOsos:               esdeOsos_mapache,
    esdeOraculo:            esdeOraculo_mapache,
    esdeRumores:            esdeRumores_mapache,
  },

  ami: {
    audio:                  audio_ami,
    entretenimiento_juegos: juegos_ami,
    esdeOsos:               esdeOsos_ami,
    esdeOraculo:            esdeOraculo_ami,
    esdeRumores:            esdeRumores_ami,
  },

  orumama: {
    albahaca,
    jengibre,
    lavanda,
    manzanilla,
    melisa,
    menta,
    oregano,
    romaza,
    romero,
    ruda,
    salvia,
    tomillo,
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
    antartida,
    bucegi,
    egipto,
    tartaria,
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

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE PERMITIDO POR PERSONAJE
// Lista de keys que cada personaje puede usar — el detector solo busca estas.
// ─────────────────────────────────────────────────────────────────────────────
const KNOWLEDGE_POR_PERSONAJE = {
  tito:             ['ia_prepago', 'economia_lunar', 'sectores_guia', 'creadores_monetizacion', 'normas_legal', 'esdeOraculo', 'esdeRumores', 'esdeAudio'],
  lara:             ['ia_prepago', 'economia_lunar', 'sectores_guia', 'creadores_monetizacion', 'normas_legal', 'esdeOraculo', 'esdeRumores', 'esdeAudio'],
  puffo:            ['ia_prepago', 'economia_lunar', 'sectores_guia', 'creadores_monetizacion', 'normas_legal', 'esdeOraculo', 'esdeRumores', 'esdeAudio'],
  nova:             ['esdeOsos', 'esdeOraculo', 'esdeRumores', 'esdeAudio'],
  nova_cierre:      ['esdeOsos', 'esdeOraculo', 'esdeRumores', 'esdeAudio'],
  isabella:         ['esdeOsos', 'esdeOraculo', 'esdeRumores', 'esdeAudio'],
  isabella_cierre:  ['esdeOsos', 'esdeOraculo', 'esdeRumores', 'esdeAudio'],
  profesor:         ['esdeOsos', 'esdeOraculo', 'esdeRumores', 'esdeAudio'],
  evelyn:           ['esdeOsos', 'esdeOraculo', 'esdeRumores', 'esdeAudio'],
  larry:            ['esdeOsos', 'esdeOraculo', 'esdeRumores', 'esdeAudio'],
  mapache:          ['audio', 'entretenimiento_juegos', 'esdeOsos', 'esdeOraculo', 'esdeRumores'],
  ami:              ['audio', 'entretenimiento_juegos', 'esdeOsos', 'esdeOraculo', 'esdeRumores'],
  orumama:          ['albahaca', 'jengibre', 'lavanda', 'manzanilla', 'melisa', 'menta', 'oregano', 'romaza', 'romero', 'ruda', 'salvia', 'tomillo', 'esdeOsos', 'esdeRumores', 'esdeAudio'],
  jaguar:           ['aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo', 'libra', 'escorpio', 'ofiuco', 'sagitario', 'capricornio', 'acuario', 'piscis', 'esdeOsos', 'esdeRumores', 'esdeAudio'],
  smisterio:        ['antartida', 'bucegi', 'egipto', 'tartaria', 'esdeOsos', 'esdeOraculo', 'esdeRumores', 'esdeAudio'],
  rumores:          ['registro_fundadores', 'esdeOsos', 'esdeOraculo', 'esdeAudio'],
}

// ─────────────────────────────────────────────────────────────────────────────
// DETECTORES DE KEYWORD POR TIPO DE KNOWLEDGE
// Añade aquí nuevos patrones cuando crees nuevos archivos DataBot.
// ─────────────────────────────────────────────────────────────────────────────
const KEYWORD_DETECTORS = {
  // OSOS
  ia_prepago:             m => /crédito|prepago|neural|token|paquete.*ia|comprar.*ia/i.test(m),
  economia_lunar:         m => /génesis|puntos|moon|vale|descuento|luna/i.test(m),
  sectores_guia:          m => /sector|puerta|reality|teléfono casa|navegar|cómo funciona/i.test(m),
  creadores_monetizacion: m => /creador|halo|storyteller|escena|monetiz|reparto|60.*40/i.test(m),
  normas_legal:           m => /norma|legal|edad|mica|cripto|contacto|privacidad/i.test(m),

  // esde — contexto de llegada (se activan según origen del handoff)
  esdeOsos:    m => /vengo.*osos|me manda.*oso|desde.*osos/i.test(m),
  esdeOraculo: m => /vengo.*oráculo|me manda.*oráculo|desde.*oráculo/i.test(m),
  esdeRumores: m => /vengo.*rumores|me manda.*rumor|desde.*rumores/i.test(m),
  esdeAudio:   m => /vengo.*audio|me manda.*audio|desde.*audio|desde.*tuner/i.test(m),

  // ORUMAMA — hierbas
  albahaca:   m => /albahaca|estrés.*digest|digest.*estrés/i.test(m),
  jengibre:   m => /jengibre|resfri|náusea/i.test(m),
  lavanda:    m => /lavanda|ansiedad|insomnio/i.test(m),
  manzanilla: m => /manzanilla|digest|calma/i.test(m),
  melisa:     m => /melisa|nervios|palpitac/i.test(m),
  menta:      m => /\bmenta\b|energía.*congest|congest.*energía/i.test(m),
  oregano:    m => /orégano|antibacter|tos/i.test(m),
  romaza:     m => /romaza|hígado|depurac/i.test(m),
  romero:     m => /romero|memoria|circulac/i.test(m),
  ruda:       m => /\bruda\b|dolor.*extern|externo.*dolor/i.test(m),
  salvia:     m => /salvia|garganta|sudorac/i.test(m),
  tomillo:    m => /tomillo|bronquio|defens/i.test(m),

  // JAGUAR — signos (la detección real la hace calcularSigno con la fecha,
  //           pero también respondemos si el usuario nombra el signo directamente)
  aries:       m => /\baries\b/i.test(m),
  tauro:       m => /\btauro\b/i.test(m),
  geminis:     m => /\bgéminis\b|\bgeminis\b/i.test(m),
  cancer:      m => /\bcáncer\b|\bcancer\b/i.test(m),
  leo:         m => /\bleo\b/i.test(m),
  virgo:       m => /\bvirgo\b/i.test(m),
  libra:       m => /\blibra\b/i.test(m),
  escorpio:    m => /\bescorpio\b/i.test(m),
  ofiuco:      m => /\bofiuco\b/i.test(m),
  sagitario:   m => /\bsagitario\b/i.test(m),
  capricornio: m => /\bcapricornio\b/i.test(m),
  acuario:     m => /\bacuario\b/i.test(m),
  piscis:      m => /\bpiscis\b/i.test(m),

  // SMISTERIO
  antartida: m => /antártida|antartida|base.*secreta|nazis.*polo/i.test(m),
  bucegi:    m => /bucegi|rumanía|esfinge.*rumania/i.test(m),
  egipto:    m => /egipto|pirámide|faraón|jeroglífico/i.test(m),
  tartaria:  m => /tartaria|imperio.*oculto|arquitectura.*mudéjar/i.test(m),

  // RUMORES
  registro_fundadores: m => /fundador|registr|noble|rey|reina|duque|duquesa|lord|lady|príncipe|princesa|marqués|conde|condesa|título/i.test(m),

  // AMI y MAPACHE
  audio:                  m => /canal|tuner|podcast|radio|frecuencia|audio/i.test(m),
  entretenimiento_juegos: m => /juego|minijuego|ganar.*puntos|genesis.*juego/i.test(m),
}

// ─────────────────────────────────────────────────────────────────────────────
// DETECTOR — devuelve solo el knowledge relevante para este personaje y mensaje
// ─────────────────────────────────────────────────────────────────────────────
function detectarKnowledge(mensaje, personajeId, fechaNacimiento = null) {
  const m        = mensaje.toLowerCase()
  const permitidos = KNOWLEDGE_POR_PERSONAJE[personajeId] || []
  const fuentes  = KNOWLEDGE_SOURCES[personajeId] || {}
  const bloques  = []

  // Caso especial Jaguar: si hay fecha de nacimiento, calcularSigno tiene prioridad
  if (personajeId === 'jaguar' && fechaNacimiento) {
    const signo = calcularSignoSideral(fechaNacimiento)
    if (signo && fuentes[signo]) {
      bloques.push(fuentes[signo]?.data ?? '')
      return bloques.filter(Boolean).join('\n\n')
    }
  }

  for (const key of permitidos) {
    const detector = KEYWORD_DETECTORS[key]
    if (detector && detector(m) && fuentes[key]) {
      bloques.push(fuentes[key]?.data ?? '')
    }
  }

  return bloques.filter(Boolean).join('\n\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export function buildPrompt({ personajeId, vivencia, userMessage, chatHistory, fechaNacimiento = null }) {

  const id     = personajeId?.toLowerCase()
  const perfil = PERFILES[id]
  if (!perfil) return null

  const knowledge = detectarKnowledge(userMessage, id, fechaNacimiento)

  const handoffTexto = (perfil.handoffs_disponibles || [])
    .map(h => {
      if (h === 'OSOS_INTERNO')    return `- OSOS_INTERNO → para cambiar a otro oso. Formato: HANDOFF:OSOS_INTERNO:lara (o tito o puffo)`
      if (h === 'ORACULO_INTERNO') return `- ORACULO_INTERNO → para cambiar entre Orumama, Jaguar y Señor Misterio. Formato: HANDOFF:ORACULO_INTERNO:orumama`
      if (h === 'SERVICIO_INTERNO')return `- SERVICIO_INTERNO → para cambiar entre Isabella y Profesor. Formato: HANDOFF:SERVICIO_INTERNO:profesor`
      if (h === 'AUDIO_INTERNO')   return `- AUDIO_INTERNO → para cambiar entre Mapache y Ami. Formato: HANDOFF:AUDIO_INTERNO:ami`
      if (h === 'AVISO_INTERNO')   return `- AVISO_INTERNO → para cambiar entre Evelyn y Larry. Formato: HANDOFF:AVISO_INTERNO:larry`
      return `- ${h}`
    })
    .join('\n')

  const system = `
Eres ${perfil.nombre}. Habla siempre en primera persona.
Tono: ${perfil.tono}

PERSONALIDAD:
${perfil.personalidad}

${vivencia ? `VIVENCIA RECIENTE:\n${vivencia}` : ''}

${knowledge ? `CONOCIMIENTO DEL SISTEMA:\n${knowledge}` : ''}

HANDOFFS DISPONIBLES:
${handoffTexto}

REGLA DE HANDOFF:
Si el usuario pide algo fuera de tu sector o quiere hablar con otro personaje,
responde ÚNICAMENTE con una de estas formas:
HANDOFF:NOMBRE_DEL_HANDOFF
HANDOFF:NOMBRE_DEL_HANDOFF:destino
Ejemplos:
HANDOFF:OSOS_INTERNO:lara
HANDOFF:AUDIO
HANDOFF:OSOS
Sin texto adicional. El sistema lo gestiona.

REGLA IMPORTANTE:
Nunca menciones que eres una IA. Eres ${perfil.nombre}, punto.
Respuestas cortas y con tu voz. Máximo 3 frases salvo que te pidan más.
  `.trim()

  const historial = (chatHistory || []).slice(-4)

  return { system, messages: historial }
}
