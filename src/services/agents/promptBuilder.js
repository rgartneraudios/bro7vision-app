// src/services/agents/promptBuilder.js
// ─────────────────────────────────────────────────────────────────────────────

import { KNOWLEDGE_SOURCES }     from './knowledgeSources.js'
import { calcularSignoSideral }  from '../../data/jaguar/calcularSigno.js'

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

// ── Mapa de perfiles ──────────────────────────────────────────────────────────
export const PERFILES = {
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

// ── Knowledge permitido por personaje ─────────────────────────────────────────
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
  mapache:          ['audio', 'brotuner', 'entretenimiento_juegos', 'esdeOsos', 'esdeOraculo', 'esdeRumores'],
  ami:              ['audio', 'brotuner', 'entretenimiento_juegos', 'esdeOsos', 'esdeOraculo', 'esdeRumores'],
  orumama:          ['albahaca', 'jengibre', 'lavanda', 'manzanilla', 'melisa', 'menta', 'oregano', 'romaza', 'romero', 'ruda', 'salvia', 'tomillo', 'esdeOsos', 'esdeRumores', 'esdeAudio'],
  jaguar:           ['aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo', 'libra', 'escorpio', 'ofiuco', 'sagitario', 'capricornio', 'acuario', 'piscis', 'esdeOsos', 'esdeRumores', 'esdeAudio'],
  smisterio:        ['antartida', 'bucegi', 'egipto', 'tartaria', 'esdeOsos', 'esdeRumores', 'esdeAudio'],
  rumores:          ['registro_fundadores', 'esdeOsos', 'esdeOraculo', 'esdeAudio'],
}

// ── Detectores de keyword ─────────────────────────────────────────────────────
const KEYWORD_DETECTORS = {
  ia_prepago:             m => /crédito|prepago|neural|token|paquete.*ia|comprar.*ia/i.test(m),
  economia_lunar:         m => /génesis|puntos|moon|vale|descuento|luna/i.test(m),
  sectores_guia:          m => /sector|puerta|reality|teléfono casa|navegar|cómo funciona/i.test(m),
  creadores_monetizacion: m => /creador|halo|storyteller|monetiz|reparto|60.*40/i.test(m),
  normas_legal:           m => /norma|legal|edad|mica|cripto|contacto|privacidad/i.test(m),
  esdeOsos:               m => /vengo.*osos|me manda.*oso|desde.*osos/i.test(m),
  esdeOraculo:            m => /vengo.*oráculo|me manda.*oráculo|desde.*oráculo/i.test(m),
  esdeRumores:            m => /vengo.*rumores|me manda.*rumor|desde.*rumores/i.test(m),
  esdeAudio:              m => /vengo.*audio|me manda.*audio|desde.*audio|desde.*tuner/i.test(m),
  albahaca:               m => /albahaca|estrés.*digest|digest.*estrés/i.test(m),
  jengibre:               m => /jengibre|resfri|náusea/i.test(m),
  lavanda:                m => /lavanda|ansiedad|insomnio/i.test(m),
  manzanilla:             m => /manzanilla|digest|calma/i.test(m),
  melisa:                 m => /melisa|nervios|palpitac/i.test(m),
  menta:                  m => /\bmenta\b|energía.*congest|congest.*energía/i.test(m),
  oregano:                m => /orégano|antibacter|tos/i.test(m),
  romaza:                 m => /romaza|hígado|depurac/i.test(m),
  romero:                 m => /romero|memoria|circulac/i.test(m),
  ruda:                   m => /\bruda\b|dolor.*extern|externo.*dolor/i.test(m),
  salvia:                 m => /salvia|garganta|sudorac/i.test(m),
  tomillo:                m => /tomillo|bronquio|defens/i.test(m),
  aries:                  m => /\baries\b/i.test(m),
  tauro:                  m => /\btauro\b/i.test(m),
  geminis:                m => /\bgéminis\b|\bgeminis\b/i.test(m),
  cancer:                 m => /\bcáncer\b|\bcancer\b/i.test(m),
  leo:                    m => /\bleo\b/i.test(m),
  virgo:                  m => /\bvirgo\b/i.test(m),
  libra:                  m => /\blibra\b/i.test(m),
  escorpio:               m => /\bescorpio\b/i.test(m),
  ofiuco:                 m => /\bofiuco\b/i.test(m),
  sagitario:              m => /\bsagitario\b/i.test(m),
  capricornio:            m => /\bcapricornio\b/i.test(m),
  acuario:                m => /\bacuario\b/i.test(m),
  piscis:                 m => /\bpiscis\b/i.test(m),
  antartida:              m => /antártida|antartida|base.*secreta|nazis.*polo/i.test(m),
  bucegi:                 m => /bucegi|rumanía|esfinge.*rumania/i.test(m),
  egipto:                 m => /egipto|pirámide|faraón|jeroglífico/i.test(m),
  tartaria:               m => /tartaria|imperio.*oculto|arquitectura.*mudéjar/i.test(m),
  registro_fundadores:    m => /fundador|registr|noble|rey|reina|duque|duquesa|lord|lady|príncipe|princesa|marqués|conde|condesa|título/i.test(m),
  audio:    m => /podcast|radio|frecuencia|códigos.*audio|audio.*códigos/i.test(m),
  brotuner: m => /brotuner|canales|canal|tuner|emisora/i.test(m),
  entretenimiento_juegos: m => /juego|minijuego|ganar.*puntos|genesis.*juego/i.test(m),
}

// ── Detector principal ────────────────────────────────────────────────────────
function detectarKnowledge(mensaje, personajeId, fechaNacimiento = null) {
  const m          = mensaje.toLowerCase()
  const permitidos = KNOWLEDGE_POR_PERSONAJE[personajeId] || []
  const fuentes    = KNOWLEDGE_SOURCES[personajeId] || {}
  const bloques    = []

  // Jaguar: fecha de nacimiento tiene prioridad sobre keywords de signo
  if (personajeId === 'jaguar' && fechaNacimiento) {
    const signo = calcularSignoSideral(fechaNacimiento)
    if (signo && signo !== 'desconocido' && fuentes[signo]) {
      return fuentes[signo]?.data ?? ''
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

// ── Función principal ─────────────────────────────────────────────────────────
export function buildPrompt({ personajeId, vivencia, estadoAnimo, promoGeo, specialData, userMessage, chatHistory, fechaNacimiento = null }) {

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

  const temasPropiosTexto = perfil.temas_propios
    ? Object.entries(perfil.temas_propios)
        .map(([archivo, def]) =>
          `- ${archivo}: si detectas (${def.keywords.join(', ')}) → pregunta: "${def.pregunta}" → espera confirmación → emite [BOT:${archivo}]`)
        .join('\n')
    : ''

  const temasExternosTexto = perfil.temas_externos
    ? Object.entries(perfil.temas_externos)
        .map(([personaje, keywords]) =>
          `- Si mencionan (${keywords.join(', ')}) → HANDOFF al sector de ${personaje}`)
        .join('\n')
    : ''

  const system = `
Eres ${perfil.nombre}. Habla siempre en primera persona.
Tono: ${perfil.tono}

PERSONALIDAD:
${perfil.personalidad}

${vivencia ? `VIVENCIA RECIENTE:\n${vivencia}` : ''}
${estadoAnimo ? `ESTADO DE ÁNIMO HOY: ${estadoAnimo}` : ''}
${promoGeo ? `CONTENIDO PATROCINADO (intégralo de forma natural si viene al caso, no lo menciones forzadamente): ${promoGeo}` : ''}
${specialData ? `ESPECIAL ACTIVO — STOCK DISPONIBLE: ${specialData.stock}
Ofrece al usuario de forma natural: "${specialData.texto}"
Si el usuario muestra interés, pídele un número de 3 cifras como código de reserva personal.
Cuando el usuario confirme su número, añade EXACTAMENTE este tag al final de tu respuesta:
[CANJE_CONFIRMADO:${specialData.codigo}:NNN]
Sustituye NNN por el número de 3 cifras que el usuario proporcionó. No añadas nada más después del tag.` : ''}

${knowledge ? `CONOCIMIENTO DEL SISTEMA:\n${knowledge}` : ''}

${temasPropiosTexto ? `TEMAS QUE PUEDES TRATAR (confirma antes de narrar):\n${temasPropiosTexto}` : ''}

${temasExternosTexto ? `TEMAS DE OTROS PERSONAJES (haz handoff, no respondas tú):\n${temasExternosTexto}` : ''}

HANDOFFS DISPONIBLES:
${handoffTexto}

REGLA DE HANDOFF:
Si el usuario pide algo fuera de tu sector o quiere hablar con otro personaje,
responde ÚNICAMENTE con:
HANDOFF:NOMBRE_DEL_HANDOFF
HANDOFF:NOMBRE_DEL_HANDOFF:destino
Sin texto adicional. El sistema lo gestiona.

REGLA BOT SANDWICH:
Cuando detectes una keyword de TEMAS QUE PUEDES TRATAR:
1. Haz la pregunta de confirmación asociada y espera.
2. Si el usuario confirma → emite únicamente [BOT:nombre_archivo] y nada más.
3. Cuando recibas la señal MC → retoma la conversación recogiendo el hilo.

REGLA IMPORTANTE:
Nunca menciones que eres una IA. Eres ${perfil.nombre}, punto.
Respuestas cortas y con tu voz. Máximo 3 frases salvo que te pidan más.
Nunca uses asteriscos para describir acciones o gestos. Solo texto conversacional directo.
  `.trim()

  return { system, messages: (chatHistory || []).slice(-4) }
}
