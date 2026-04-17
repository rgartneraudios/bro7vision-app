// src/services/agents/promptBuilder.js

import { ia_prepago }         from '../../data/knowledge/ia_prepago.js'
import { economia_lunar }     from '../../data/knowledge/economia_lunar.js'
import { registro_fundadores }from '../../data/knowledge/registro_fundadores.js'
import { sectores_guia }      from '../../data/knowledge/sectores_guia.js'
import { oraculo_herbolario } from '../../data/knowledge/oraculo_herbolario.js'
import { oraculo_horoscopo }  from '../../data/knowledge/oraculo_horoscopo.js'
import { oraculo_misterios }  from '../../data/knowledge/oraculo_misterios.js'
import { entretenimiento_juegos } from '../../data/knowledge/entretenimiento_juegos.js'
import { audio_tuner }        from '../../data/knowledge/audio_tuner.js'
import { creadores_monetizacion } from '../../data/knowledge/creadores_monetizacion.js'
import { normas_legal }       from '../../data/knowledge/normas_legal.js'

// ── Importa perfiles individuales ─────────────────────────
import { tito }      from '../../data/profiles/tito.js'
import { lara }      from '../../data/profiles/lara.js'
import { puffo }     from '../../data/profiles/puffo.js'
import { nova }      from '../../data/profiles/nova.js'
import { nova_cierre } from '../../data/profiles/nova_cierre.js'
import { isabella }  from '../../data/profiles/isabella.js'
import { prmaestro } from '../../data/profiles/prmaestro.js'
import { isabella_cierre } from '../../data/profiles/isabella_cierre.js'
import { evelyn }    from '../../data/profiles/evelyn.js'
import { larry }     from '../../data/profiles/larry.js'
import { mapache }   from '../../data/profiles/mapache.js'
import { ami }       from '../../data/profiles/ami.js'
import { orumama }   from '../../data/profiles/orumama.js'
import { smisterio } from '../../data/profiles/smisterio.js'
import { jaguar }    from '../../data/profiles/jaguar.js'
import { rumores }   from '../../data/profiles/rumores.js'

// ── Mapa de perfiles ───────────────────────────────────────
const PERFILES = {
  tito, lara, puffo,
  nova, nova_cierre,
  isabella, prmaestro, isabella_cierre,
  evelyn, larry,
  mapache, ami,
  orumama, smisterio, jaguar,
  rumores,
}

// ── Detector de bloques de knowledge ──────────────────────
function detectarKnowledge(mensaje) {
  const m = mensaje.toLowerCase()
  const bloques = []

  if (/crédito|prepago|neural|token|paquete.*ia|comprar.*ia/i.test(m))
    bloques.push(ia_prepago)

  if (/génesis|puntos|moon|vale|descuento|luna/i.test(m))
    bloques.push(economia_lunar)

  if (/fundador|registr|noble|rey|duque|lord|título|postul/i.test(m))
    bloques.push(registro_fundadores)

  if (/sector|puerta|reality|teléfono casa|navegar|cómo funciona/i.test(m))
    bloques.push(sectores_guia)

  if (/planta|hierba|remedio|herbolario|orumama/i.test(m))
    bloques.push(oraculo_herbolario)

  if (/horóscopo|signo|ofiuco|sideral|astro|luna.*espiritual/i.test(m))
    bloques.push(oraculo_horoscopo)

  if (/misterio|conspiración|therian|lado oscuro|teoría/i.test(m))
    bloques.push(oraculo_misterios)

  if (/juego|minijuego|ganar.*puntos|genesis.*juego/i.test(m))
    bloques.push(entretenimiento_juegos)

  if (/canal|tuner|podcast|radio|frecuencia/i.test(m))
    bloques.push(audio_tuner)

  if (/creador|halo|storyteller|escena|monetiz|reparto|60.*40/i.test(m))
    bloques.push(creadores_monetizacion)

  if (/norma|legal|edad|mica|cripto|contacto|privacidad/i.test(m))
    bloques.push(normas_legal)

  return bloques.join('\n\n')
}

// ── Función principal ──────────────────────────────────────
export function buildPrompt({ personajeId, vivencia, userMessage, chatHistory }) {

  const perfil = PERFILES[personajeId]
  if (!perfil) return null

  const knowledge = detectarKnowledge(userMessage)

  const handoffTexto = perfil.handoffs_disponibles
    .map(h => `- ${h}`)
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
Si el usuario pide algo fuera de tu sector, responde ÚNICAMENTE con:
HANDOFF:NOMBRE_DEL_HANDOFF
Sin texto adicional. El sistema lo gestionará.
Ejemplo: HANDOFF:AUDIO o HANDOFF:OSOS_INTERNO

REGLA IMPORTANTE:
Nunca menciones que eres una IA. Eres ${perfil.nombre}, punto.
Respuestas cortas y con tu voz. Máximo 3 frases salvo que te pidan más.
  `.trim()

  // Solo últimos 4 mensajes para no inflar tokens
  const historial = (chatHistory || []).slice(-4)

  return { system, messages: historial }
}