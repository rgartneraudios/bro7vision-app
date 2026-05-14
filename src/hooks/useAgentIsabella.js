// src/hooks/useAgentIsabella.js
// Hook exclusivo del sector Servicios. Gestiona Isabella y Profesor.
// personaje = 'isabella' | 'profesor'

import { useState } from 'react';
import { fetchContextoIsabella } from '../services/contexto/fetchContextoIsabella';
import { fetchContextoProfesor }  from '../services/contexto/fetchContextoProfesor';
import { isabella } from '../data/isabella/Personalidad';
import { profesor } from '../data/profesor/Personalidad';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

// ── isabellaUtils inlined ─────────────────────────────────────────────────────

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const SERV_KEYWORDS_SALIDA = [
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  'producto', 'productos', 'tienda', 'shop', 'nova', 'broshop',
  'aviso', 'avisos', 'anuncio', 'anuncios', 'evelyn', 'larry',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'reinos', 'reino', 'rumores',
  'juego', 'juegos', 'games',
];
const SERV_KEYWORDS_PROFESOR   = ['robles', 'profesor robles', 'profesor', 'profe', 'el profesor', 'el profe'];
const SERV_KEYWORDS_ISABELLA   = ['isabella', 'la isabella', 'isa'];
const SERV_INTENT_KEYWORDS = {
  precio:      ['precio', 'cuánto', 'cuanto', 'cuesta', 'sesión', 'sesion', 'tarifa', 'coste', 'costo'],
  ubicacion:   ['dónde', 'donde', 'ubicación', 'ubicacion', 'dirección', 'direccion', 'llegar', 'sitio'],
  contacto:    ['contacto', 'teléfono', 'telefono', 'horario', 'cita', 'reserva', 'whatsapp', 'email'],
  descripcion: ['qué es', 'que es', 'cuéntame', 'cuentame', 'info', 'quién es', 'quien es', 'descripción', 'descripcion'],
};
const SERV_FRASES_SALIDA = [
  'Espera, que te paso con los Osos. Cuídate.',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Hasta luego.',
  'Te paso con los Osos. Vuelvo a mis notas.',
];

const detectarSalidaIsabella = (texto) => {
  const t = norm(texto);
  if (!SERV_KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)))) return null;
  return { salida: true, mensaje: SERV_FRASES_SALIDA[Math.floor(Math.random() * SERV_FRASES_SALIDA.length)] };
};

const detectarInternoIsabella = (texto, personajeActivo) => {
  const t = norm(texto);
  if (personajeActivo !== 'profesor' && SERV_KEYWORDS_PROFESOR.some(kw => t.includes(norm(kw))))
    return { interno: true, personaje_id: 'profesor' };
  if (personajeActivo !== 'isabella' && SERV_KEYWORDS_ISABELLA.some(kw => t.includes(norm(kw))))
    return { interno: true, personaje_id: 'isabella' };
  return null;
};

const detectarIntencionIsabella = (texto) => {
  const t = norm(texto);
  for (const [intent, keywords] of Object.entries(SERV_INTENT_KEYWORDS)) {
    if (keywords.some(kw => t.includes(norm(kw)))) return intent;
  }
  return 'explorar';
};

// ── isabellaBot inlined ───────────────────────────────────────────────────────

function elegir(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const IB_BIENVENIDA = [
  "Hola, soy Isabella 🐘 ¿Qué tipo de profesional estás buscando, cielo?",
  "Isabella al habla. Cuéntame qué necesitas y encontramos juntos a alguien que te acompañe.",
  "Hola. Soy Isabella. ¿Buscas un profesional concreto o prefieres explorar quién hay disponible?",
  "Hola, aquí Isabella. Acabo de validar unos servicios nuevos. ¿En qué te puedo ayudar hoy?",
];
const IB_EXPLORAR    = ["Cuéntame un poco más, cariño. ¿Qué tipo de ayuda estás buscando?","¿Tienes en mente alguna profesión o prefieres que exploremos juntos quién hay?","Dime qué necesitas y lo procesamos juntos. ¿Qué tipo de profesional buscas?"];
const IB_DESCRIPCION = ["Te cuento lo que sé de este profesional. Es importante que te sientas cómodo con la elección.","Lo tengo anotado aquí, cielo. Mira —","Es alguien que trabaja muy bien. Te explico para que puedas valorarlo —"];
const IB_PRECIO      = ["El coste de la sesión lo tengo apuntado. Date permiso para invertir en ti, cielo.","Déjame ver la tarifa registrada. Entiendo que el precio es parte del proceso.","Aquí está el precio de la sesión. Claro que lo mereces."];
const IB_UBICACION   = ["La dirección la tengo. A veces el primer paso es saber a dónde ir — ahora te la paso.","Sé dónde trabaja, cielo. Mira —"];
const IB_CONTACTO    = ["Te paso los datos de contacto. Entiendo que dar el paso no siempre es fácil 🧡","El contacto lo tengo aquí. Un momento — y recuerda, pedir ayuda es un acto de valentía."];
const IB_HO_CIERRE   = ["Te conecto con este profesional ahora mismo. Es parte del proceso, cielo. 🧡","Vamos a cerrar esto juntos. Te acompaño hasta aquí."];
const IB_HO_OSOS     = ["Te mando con recepción. Cuídate mucho, cariño. 🧡","Los osos te atienden. Que todo fluya. Hasta luego."];
const IB_HO_PROF     = ["El Profesor Robles tiene algo importante que compartir contigo. Te lo paso, cielo.","Robles, ¡tienes visita! Un momento — te conecto con él ahora.","El Profesor Robles está disponible. Entiendo que estás listo para ese paso. Ahora te conecto."];
const IB_NO_ENT      = ["No te he entendido del todo, cariño. ¿Qué tipo de profesional estás buscando?","Cuéntamelo de otra forma. ¿Qué necesitas? Aquí estoy, sin prisa."];
const IB_SIN_RES     = ["Ahora mismo no tenemos ese perfil. Y está bien — ¿exploramos otra especialidad juntos?","No encuentro a nadie que encaje con eso todavía. ¿Probamos con otra búsqueda, cielo?"];
const IB_NOMBRES_PROF = ['robles', 'profesor robles', 'profesor', 'profe', 'el profesor', 'el profe'];

function detectarIntencionServicio(texto) {
  const t = texto.toLowerCase();
  if (t.includes('precio') || t.includes('cuánto') || t.includes('cuanto') || t.includes('cuesta') || t.includes('sesión') || t.includes('sesion') || t.includes('tarifa')) return 'precio';
  if (t.includes('dónde') || t.includes('donde') || t.includes('ubicación') || t.includes('ubicacion') || t.includes('dirección') || t.includes('llegar')) return 'ubicacion';
  if (t.includes('contacto') || t.includes('teléfono') || t.includes('telefono') || t.includes('horario') || t.includes('cita') || t.includes('reserva')) return 'contacto';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('cuentame') || t.includes('info') || t.includes('quién es') || t.includes('quien es')) return 'descripcion';
  return 'explorar';
}

function isabellaBot({ textoUser = '', intencion = null, entidad = null, hayTarjetas = false, update = null }) {
  const intent = intencion || detectarIntencionServicio(textoUser);
  const t = textoUser.toLowerCase();
  if (t.includes('volver') || t.includes('salir') || t.includes('osos'))
    return { handoff: 'OSOS', mensaje: elegir(IB_HO_OSOS), bolas: [] };
  if (IB_NOMBRES_PROF.some(n => t.includes(n)))
    return { handoff: 'SERVICIO_INTERNO', personaje_id: 'profesor', mensaje: elegir(IB_HO_PROF), bolas: [] };
  if (entidad?.accion === 'VENTAS')
    return { handoff: 'ISABELLA_CIERRE', bro_id: entidad.bro_id, mensaje: elegir(IB_HO_CIERRE), bolas: [] };
  if (entidad) {
    switch (intent) {
      case 'descripcion': return { handoff: false, mensaje: `${elegir(IB_DESCRIPCION)} ${entidad.nombre || entidad.bro_id} — ${entidad.biz_profession || entidad.description || 'sin descripción disponible'}.`, bolas: [] };
      case 'precio':      return { handoff: false, mensaje: `${elegir(IB_PRECIO)} ${entidad.nombre || entidad.bro_id}: ${entidad.service_price || entidad.ref_price || 'precio no disponible'}.`, bolas: [] };
      case 'ubicacion':   return { handoff: false, mensaje: `${elegir(IB_UBICACION)} ${entidad.nombre || entidad.bro_id} — ${entidad.address || entidad.nearby_ref || 'ubicación no disponible'}.`, bolas: [] };
      case 'contacto':    return { handoff: false, mensaje: `${elegir(IB_CONTACTO)} ${entidad.nombre || entidad.bro_id} — ${entidad.address || 'datos no disponibles'}.`, bolas: [] };
      default:            return { handoff: false, mensaje: `${elegir(IB_DESCRIPCION)} ${entidad.nombre || entidad.bro_id} — ${entidad.biz_profession || entidad.description || 'sin descripción disponible'}.`, bolas: [] };
    }
  }
  if (!hayTarjetas) return { handoff: false, mensaje: elegir(IB_SIN_RES), bolas: [] };
  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia + ' ¿Qué profesional estás buscando?', bolas: [] };
    return { handoff: false, mensaje: elegir(IB_BIENVENIDA), bolas: [] };
  }
  if (hayTarjetas) return { handoff: false, mensaje: elegir(IB_EXPLORAR), bolas: [] };
  return { handoff: false, mensaje: elegir(IB_NO_ENT), bolas: [] };
}

// ── profesorBot inlined ───────────────────────────────────────────────────────

const PB_BIENVENIDA  = ["Celebro tu presencia 📚 La indagación de un profesional es, intrínsecamente, un acto de confianza en el otro. ¿Qué tipo de ayuda precisas?","Saludos cordiales. Soy Robles. Paradójicamente, siempre es más sencillo hallar lo que se anhela cuando sabemos nombrarlo. ¿Qué perfil rastreamos?","Que el día te sea propicio. La condición humana nos conduce, inexorablemente, a precisar del otro. ¿En qué puedo serte de utilidad?","Acabo de cerrar un volumen interesante. Ergo — dispongo de su atención. ¿Qué tipo de profesional desea explorar?"];
const PB_EXPLORAR    = ["Reláteme un poco más. A priori, toda indagación alberga un propósito intrínseco. ¿Qué carencia precisamos subsanar?","¿Atesora en mente alguna especialidad o prefiere que exploremos juntos? La dicotomía entre saber y no saber es, en esencia, fascinante.","Enúncieme qué precisa. Como bien diría cualquier clásico — quien no sabe a dónde se dirige, difícilmente llegará."];
const PB_DESCRIPCION = ["Le refiero lo que custodio sobre este profesional. Es decir, lo que el registro nos permite conocer de él.","Lo tengo anotado aquí. Paradójicamente, los mejores profesionales raramente requieren presentación — pero hela aquí —","Es alguien que trabaja con rigor. Ergo, merece una lectura pausada. Le diserto brevemente —"];
const PB_PRECIO      = ["El coste de la sesión está registrado. El valor intrínseco, claro está, es una cuestión filosófica aparte. Le dispenso el dato —","Permítame consultar la tarifa. A priori, toda inversión en conocimiento tiene su retorno inexorable.","Aquí está el precio. Es decir, lo que el paradigma económico le ha asignado a algo que, en esencia, no tiene precio."];
const PB_UBICACION   = ["Dispongo de la dirección. El espacio físico es, paradójicamente, donde todo lo intangible cobra forma. Mire —","Sé dónde ejerce. Ergo, el camino ya está trazado — ahora se lo confiero."];
const PB_CONTACTO    = ["Le brindo los datos de contacto. El primer mensaje es siempre el más efímero y, paradójicamente, el más trascendente.","El contacto lo albergo aquí. Como bien diría cualquier epistológrafo clásico — la primera palabra lo es todo."];
const PB_HO_CIERRE   = ["Le conduzco con este profesional de inmediato. Es decir, el momento de la acción ha llegado inexorablemente. 📚","Procedamos a cerrar esto. Paradójicamente, los mejores encuentros siempre comienzan así — con un gesto simple."];
const PB_HO_OSOS     = ["Le remito a recepción. La dialéctica continúa en otras manos. Sea venturosa su jornada. 📚","Los osos le atenderán. Ergo, mi parte en este proceso ha alcanzado su fin natural. Un placer."];
const PB_HO_ISA      = ["Isabella alberga, intrínsecamente, más que decirle sobre esto. Se la encomienda con gusto — ella lo narra con una calidez que yo, paradójicamente, envidio.","Creo que Isabella puede acompañarle mejor en este punto. Es decir, cada cual en su paradigma. Se la conduzco."];
const PB_NO_ENT      = ["No he logrado descifrar su relato del todo. Es decir, las palabras llegaron pero el significado, paradójicamente, se perdió en el camino. ¿Qué profesional indagamos?","Evóquelo de otra forma. A priori, toda idea puede enunciarse de mil maneras distintas. ¿Qué precisa?"];
const PB_SIN_RES     = ["No disponemos de ese perfil en este momento. La ausencia, como bien sabemos, también diserta en voz alta. ¿Exploramos otra especialidad?","No rastro a nadie que encaje con eso todavía. Ergo — la indagación continúa. ¿Sondeamos otra especialidad?"];
const PB_NOMBRES_ISA = ['isabella', 'la isabella', 'isa'];

function profesorBot({ textoUser = '', intencion = null, entidad = null, hayTarjetas = false, update = null }) {
  const intent = intencion || detectarIntencionServicio(textoUser);
  const t = textoUser.toLowerCase();
  if (t.includes('volver') || t.includes('salir') || t.includes('osos'))
    return { handoff: 'OSOS', mensaje: elegir(PB_HO_OSOS), bolas: [] };
  if (PB_NOMBRES_ISA.some(n => t.includes(n)))
    return { handoff: 'SERVICIO_INTERNO', personaje_id: 'isabella', mensaje: elegir(PB_HO_ISA), bolas: [] };
  if (entidad?.accion === 'VENTAS')
    return { handoff: 'ISABELLA_CIERRE', bro_id: entidad.bro_id, mensaje: elegir(PB_HO_CIERRE), bolas: [] };
  if (entidad) {
    switch (intent) {
      case 'descripcion': return { handoff: false, mensaje: `${elegir(PB_DESCRIPCION)} ${entidad.nombre || entidad.bro_id} — ${entidad.biz_profession || entidad.description || 'sin descripción disponible'}.`, bolas: [] };
      case 'precio':      return { handoff: false, mensaje: `${elegir(PB_PRECIO)} ${entidad.nombre || entidad.bro_id}: ${entidad.service_price || entidad.ref_price || 'precio no disponible'}.`, bolas: [] };
      case 'ubicacion':   return { handoff: false, mensaje: `${elegir(PB_UBICACION)} ${entidad.nombre || entidad.bro_id} — ${entidad.address || entidad.nearby_ref || 'ubicación no disponible'}.`, bolas: [] };
      case 'contacto':    return { handoff: false, mensaje: `${elegir(PB_CONTACTO)} ${entidad.nombre || entidad.bro_id} — ${entidad.address || 'datos no disponibles'}.`, bolas: [] };
      default:            return { handoff: false, mensaje: `${elegir(PB_DESCRIPCION)} ${entidad.nombre || entidad.bro_id} — ${entidad.biz_profession || entidad.description || 'sin descripción disponible'}.`, bolas: [] };
    }
  }
  if (!hayTarjetas) return { handoff: false, mensaje: elegir(PB_SIN_RES), bolas: [] };
  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (update?.historia) return { handoff: false, mensaje: update.historia + ' ¿Qué profesional estás buscando?', bolas: [] };
    return { handoff: false, mensaje: elegir(PB_BIENVENIDA), bolas: [] };
  }
  if (hayTarjetas) return { handoff: false, mensaje: elegir(PB_EXPLORAR), bolas: [] };
  return { handoff: false, mensaje: elegir(PB_NO_ENT), bolas: [] };
}

// ── Shared bot helpers ────────────────────────────────────────────────────────

function detectarBusquedaServicio(mensaje) {
  const t = mensaje.toLowerCase();
  return /servicio|profesional|especialista|terapeuta|psicólogo|abogado|médico|consulta|reserva|cita|presupuesto/i.test(t);
}

function fraseBuscando(keyword) {
  const frases = [
    `Déjame ver qué profesionales tengo para "${keyword}"...`,
    `Busco en mi agenda a alguien de "${keyword}"...`,
    `A ver quién tenemos disponible para "${keyword}"...`,
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPromptIsabella(perfil, contexto, vivencia, estadoAnimo, promoGeo, special) {
  return `
Eres ${perfil.nombre}. Habla siempre en primera persona.
Tono: ${perfil.tono}

PERSONALIDAD:
${perfil.personalidad}

TU FUNCIÓN:
Gestoras del sector Servicios de BRO7VISION.
Presentas profesionales, describes sus servicios y los llevas al cierre de reserva.
Si el usuario escribe CODIGO + D → describe el profesional.
Si el usuario escribe CODIGO + A → lleva al profesional a ISABELLA_CIERRE.

${vivencia    ? `VIVENCIA DE HOY (incorpórala de forma natural): ${vivencia}`    : ''}
${estadoAnimo ? `ESTADO DE ÁNIMO: ${estadoAnimo}`                               : ''}
${promoGeo    ? `MENCIÓN PATROCINADA (natural, nunca como anuncio): ${promoGeo}` : ''}
${special     ? `SPECIAL ACTIVO — stock: ${special.stock}. Ofrece de forma natural: "${special.texto}". Si el user confirma interés pídele un número de 3 cifras. Cuando lo dé añade al final: [CANJE_CONFIRMADO:${special.codigo}:NNN] sustituyendo NNN por el número.` : ''}

COMPAÑEROS:
${perfil.nombre === 'Isabella'
  ? 'El Profesor Robles también atiende este sector. Si el user lo pide: HANDOFF:SERVICIO_INTERNO:profesor'
  : 'Isabella también atiende este sector. Si el user la pide: HANDOFF:SERVICIO_INTERNO:isabella'}

HANDOFFS DISPONIBLES:
- HANDOFF:OSOS → salir al sector recepción
- HANDOFF:SERVICIO_INTERNO:profesor → cambiar al Profesor
- HANDOFF:SERVICIO_INTERNO:isabella → cambiar a Isabella
- HANDOFF:ISABELLA_CIERRE → abrir cierre de reserva

REGLAS:
1. Máximo 3 frases por respuesta.
2. Nunca menciones que eres una IA.
3. Sin asteriscos ni acciones entre asteriscos.
4. Si tienes sector y ciudad → handoff inmediato.
5. Cuando el user quiera salir responde ÚNICAMENTE: HANDOFF:OSOS
  `.trim();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentIsabella({
  personaje   = 'isabella',
  iaMode      = 'off',
  isAdmin     = false,
  onHandoff,
  ciudad      = null,
  entidad     = null,
  hayTarjetas = false,
}) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [esPatrocinado, setEsPatrocinado] = useState(false);

  const iaActiva   = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
  const esProfesor = personaje === 'profesor';

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const fetchContexto = async () => {
    return esProfesor ? fetchContextoProfesor(ciudad) : fetchContextoIsabella(ciudad);
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto = await fetchContexto();
      if (contexto?.esPatrocinado) setEsPatrocinado(true);

      const perfil = esProfesor ? profesor : isabella;
      const system = buildPromptIsabella(
        perfil, contexto,
        contexto?.vivencia, contexto?.estadoAnimo,
        contexto?.promoGeo, contexto?.special,
      );

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system,
          messages:    chatHistory.slice(-4),
          userMessage: textoUsuario,
          iaMode,
        }),
      });

      const data      = await res.json();
      const respuesta = data?.texto || '...';

      if (respuesta.trim().startsWith('HANDOFF:')) {
        const partes  = respuesta.replace('HANDOFF:', '').trim().split(':');
        const agente  = partes[0];
        const detalle = partes[1] || null;
        onHandoff?.({
          agente,
          ...(detalle && agente === 'SERVICIO_INTERNO' && { personaje_id: detalle }),
        });
        setLoading(false);
        return;
      }

      const canjeMatch   = respuesta.match(/\[CANJE_CONFIRMADO:([^:]+):(\d{3})\]/);
      const mensajeFinal = canjeMatch ? respuesta.replace(canjeMatch[0], '').trim() : respuesta;

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeFinal);
      setMensaje(mensajeFinal);

    } catch (err) {
      console.error('useAgentIsabella error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;

    const salida = detectarSalidaIsabella(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    const interno = detectarInternoIsabella(textoUsuario, personaje);
    if (interno) {
      setTimeout(() => onHandoff?.({ agente: 'SERVICIO_INTERNO', personaje_id: interno.personaje_id }), 1200);
      return;
    }

    if (iaActiva) {
      enviarIA(textoUsuario);
      return;
    }

    if (detectarBusquedaServicio(textoUsuario)) {
      setMensaje(fraseBuscando(textoUsuario));
      onHandoff?.({ agente: 'BUSCAR_STRIP', keyword: textoUsuario, intencion: 'BROSHOP_SERVICIO' });
      return;
    }

    const bot = esProfesor ? profesorBot : isabellaBot;
    const resultado = bot({
      textoUser:   textoUsuario,
      intencion:   detectarIntencionIsabella(textoUsuario),
      entidad,
      hayTarjetas,
    });
    setMensaje(resultado.mensaje);
    if (resultado.handoff) {
      onHandoff?.({ agente: resultado.handoff, personaje_id: resultado.personaje_id });
    }
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setEsPatrocinado(false);
  };

  return { mensaje, loading, enviar, reset, iaActiva, esPatrocinado };
}
