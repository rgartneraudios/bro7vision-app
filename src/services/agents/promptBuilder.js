// src/services/agents/promptBuilder.js

import { ia_prepago }             from '../../data/knowledge/ia_prepago.js'
import { economia_lunar }         from '../../data/knowledge/economia_lunar.js'
import { registro_fundadores }    from '../../data/knowledge/registro_fundadores.js'
import { sectores_guia }          from '../../data/knowledge/sectores_guia.js'
import { oraculo_herbolario }     from '../../data/knowledge/oraculo_herbolario.js'
import { oraculo_horoscopo }      from '../../data/knowledge/oraculo_horoscopo.js'
import { oraculo_misterios }      from '../../data/knowledge/oraculo_misterios.js'
import { entretenimiento_juegos } from '../../data/knowledge/entretenimiento_juegos.js'
import { audio_tuner }            from '../../data/knowledge/audio_tuner.js'
import { creadores_monetizacion } from '../../data/knowledge/creadores_monetizacion.js'
import { normas_legal }           from '../../data/knowledge/normas_legal.js'

// ── Importa perfiles individuales ─────────────────────────
import titoProfile           from '../../data/profiles/tito.js'
import laraProfile           from '../../data/profiles/lara.js'
import puffoProfile          from '../../data/profiles/puffo.js'
import novaProfile           from '../../data/profiles/nova.js'
import novaCierreProfile     from '../../data/profiles/nova_cierre.js'
import isabellaProfile       from '../../data/profiles/isabella.js'
import prmaestroProfile      from '../../data/profiles/prmaestro.js'
import isabellaCierreProfile from '../../data/profiles/isabella_cierre.js'
import evelynProfile         from '../../data/profiles/evelyn.js'
import larryProfile          from '../../data/profiles/larry.js'
import mapacheProfile        from '../../data/profiles/mapache.js'
import amiProfile            from '../../data/profiles/ami.js'
import orumamaProfile        from '../../data/profiles/orumama.js'
import smisterioProfile      from '../../data/profiles/smisterio.js'
import jaguarProfile         from '../../data/profiles/jaguar.js'
import rumoresProfile        from '../../data/profiles/rumores.js'

// ── Mapa de perfiles ──────────────────────────────────────
const PERFILES = {
  tito:             titoProfile,
  lara:             laraProfile,
  puffo:            puffoProfile,
  nova:             novaProfile,
  nova_cierre:      novaCierreProfile,
  isabella:         isabellaProfile,
  prmaestro:        prmaestroProfile,
  isabella_cierre:  isabellaCierreProfile,
  evelyn:           evelynProfile,
  larry:            larryProfile,
  mapache:          mapacheProfile,
  ami:              amiProfile,
  orumama:          orumamaProfile,
  smisterio:        smisterioProfile,
  jaguar:           jaguarProfile,
  rumores:          rumoresProfile,
}

// ── Knowledge permitido por personaje ────────────────────
const KNOWLEDGE_POR_PERSONAJE = {
  tito:            ['ia_prepago', 'economia_lunar', 'sectores_guia', 'normas_legal'],
  lara:            ['ia_prepago', 'economia_lunar', 'sectores_guia', 'normas_legal'],
  puffo:           ['ia_prepago', 'economia_lunar', 'sectores_guia', 'normas_legal'],
  nova:            ['economia_lunar', 'normas_legal'],
  nova_cierre:     ['economia_lunar', 'normas_legal'],
  isabella:        ['economia_lunar', 'normas_legal'],
  prmaestro:       ['economia_lunar', 'normas_legal'],
  isabella_cierre: ['economia_lunar', 'normas_legal'],
  evelyn:          ['economia_lunar', 'normas_legal'],
  larry:           ['economia_lunar', 'normas_legal'],
  mapache:         ['audio_tuner', 'economia_lunar', 'normas_legal'],
  ami:             ['audio_tuner', 'economia_lunar', 'normas_legal'],
  orumama:         ['oraculo_herbolario', 'economia_lunar', 'normas_legal'],
  jaguar:          ['oraculo_horoscopo', 'economia_lunar', 'normas_legal'],
  smisterio:       ['oraculo_misterios', 'economia_lunar', 'normas_legal'],
  rumores:         ['registro_fundadores', 'economia_lunar', 'normas_legal'],
}

// ── Detector de knowledge filtrado por personaje ──────────
function detectarKnowledge(mensaje, personajeId) {
  const m        = mensaje.toLowerCase()
  const permitidos = KNOWLEDGE_POR_PERSONAJE[personajeId] || []
  const bloques  = []

  if (permitidos.includes('ia_prepago') && /crédito|prepago|neural|token|paquete.*ia|comprar.*ia/i.test(m))
    bloques.push(ia_prepago)

  if (permitidos.includes('economia_lunar') && /génesis|puntos|moon|vale|descuento|luna/i.test(m))
    bloques.push(economia_lunar)

  if (permitidos.includes('registro_fundadores') && /fundador|registr|noble|rey|duque|lord|título|postul/i.test(m))
    bloques.push(registro_fundadores)

  if (permitidos.includes('sectores_guia') && /sector|puerta|reality|teléfono casa|navegar|cómo funciona/i.test(m))
    bloques.push(sectores_guia)

  if (permitidos.includes('oraculo_herbolario') && /planta|hierba|remedio|herbolario/i.test(m))
    bloques.push(oraculo_herbolario)

  if (permitidos.includes('oraculo_horoscopo') && /horóscopo|signo|ofiuco|sideral|astro/i.test(m))
    bloques.push(oraculo_horoscopo)

  if (permitidos.includes('oraculo_misterios') && /misterio|conspiración|therian|lado oscuro|teoría/i.test(m))
    bloques.push(oraculo_misterios)

  if (permitidos.includes('entretenimiento_juegos') && /juego|minijuego|ganar.*puntos|genesis.*juego/i.test(m))
    bloques.push(entretenimiento_juegos)

  if (permitidos.includes('audio_tuner') && /canal|tuner|podcast|radio|frecuencia/i.test(m))
    bloques.push(audio_tuner)

  if (permitidos.includes('creadores_monetizacion') && /creador|halo|storyteller|escena|monetiz|reparto|60.*40/i.test(m))
    bloques.push(creadores_monetizacion)

  if (permitidos.includes('normas_legal') && /norma|legal|edad|mica|cripto|contacto|privacidad/i.test(m))
    bloques.push(normas_legal)

  return bloques.join('\n\n')
}

// ── Función principal ──────────────────────────────────────
export function buildPrompt({ personajeId, vivencia, userMessage, chatHistory }) {

  const id     = personajeId?.toLowerCase()
  const perfil = PERFILES[id]
  if (!perfil) return null

  const knowledge = detectarKnowledge(userMessage, id)

  const handoffTexto = perfil.handoffs_disponibles
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