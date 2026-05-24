// src/hooks/useAgentEvelyn.js
// Hook exclusivo del sector Avisos. Gestiona Evelyn y Larry.
// personaje = 'evelyn' | 'larry'
// Toda la lógica de publicación, consulta y conexión de avisos vive aquí.

import { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { fetchContextoEvelyn } from '../services/contexto/fetchContextoEvelyn';
import { fetchContextoLarry }  from '../services/contexto/fetchContextoLarry';
import {
  buildEvelynExploraPrompt,
  armarSobreEvelynTexto,
  extraerCampo,
  siguienteCampo,
  generarCodigoAvi,
} from '../services/agents/evelynExploraPS';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

// ── avisoUtils inlined ────────────────────────────────────────────────────────

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const KEYWORDS_SALIDA = [
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  'producto', 'productos', 'tienda', 'shop', 'nova', 'broshop',
  'servicio', 'servicios', 'isabella', 'profesor', 'prmaestro',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'reinos', 'reino', 'rumores',
  'juego', 'juegos', 'games',
];

const KEYWORDS_LARRY  = ['larry', 'el larry'];
const KEYWORDS_EVELYN = ['evelyn', 'la evelyn'];

const FRASES_SALIDA_AVISO = [
  'Espera, que te paso con los Osos.',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Hasta luego.',
  'Te paso con los Osos. Vuelvo al tablón.',
];

const detectarSalidaAviso = (texto) => {
  const t = norm(texto);
  const quiereSalir = KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)));
  if (!quiereSalir) return null;
  return {
    salida:  true,
    mensaje: FRASES_SALIDA_AVISO[Math.floor(Math.random() * FRASES_SALIDA_AVISO.length)],
  };
};

const detectarInternoAviso = (texto, personajeActivo) => {
  const t = norm(texto);
  if (personajeActivo !== 'larry' && KEYWORDS_LARRY.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'larry' };
  }
  if (personajeActivo !== 'evelyn' && KEYWORDS_EVELYN.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'evelyn' };
  }
  return null;
};

// ── evelynBot inlined ─────────────────────────────────────────────────────────

const FRASES_EVELYN = {
  inicio:       [
    "Perfecto, vamos a gestionar esto. ¿Lo registro como OFERTA o DEMANDA?",
    "Necesito ordenar tu aviso en la tabla. ¿OFERTA o DEMANDA?",
    "A ver — ¿te emito esto como OFERTA o como DEMANDA?",
  ],
  titulo:       [
    "Bien. Dame el título — encabezado del expediente.",
    "¿Cómo lo registramos? Necesito el título del aviso.",
    "Perfecto. ¿Cómo titulamos este campo?",
  ],
  contenido:    [
    "Ahora rellena el cuerpo del aviso. ¿Qué tienen que saber los interesados?",
    "Descríbelo. Básicamente, ¿qué gestiona este aviso?",
    "Dame el detalle. Cuéntame qué ofreces o qué necesitas tramitar.",
  ],
  confirmar:    [
    "En resumen — expediente listo. Escribe CONFIRMO y lo emito por 200 génesis.",
    "Todo cuadra en la tabla. CONFIRMO para sellarlo por 200 génesis.",
    "Listo para publicar. CONFIRMO y lo registro en el tablón por 200 génesis.",
  ],
  publicado:    [
    "Sellado y emitido. Tu aviso ya está operativo en el tablón. 🧡",
    "Registrado. 200 génesis gestionados — aviso en el aire.",
    "Expediente cerrado. Que llegue a quien tiene que llegar.",
  ],
  error_tipo:   [
    "A ver, necesito que me especifiques: ¿OFERTA o DEMANDA? Solo eso.",
    "Ese campo no lo reconozco. ¿OFERTA o DEMANDA?",
    "Básicamente no te entiendo. OFERTA o DEMANDA — ¿cuál gestiono?",
  ],
  cancelado:    [
    "Expediente cancelado. ¿En qué más te puedo ayudar?",
    "Aviso descartado. ¿Qué más necesitas gestionar?",
    "De acuerdo, lo archivo. ¿Qué más te tramito?",
  ],
  no_encontrado:[
    "Ese código no figura en el registro. ¿Lo revisamos?",
    "Nada en la tabla con ese código. Compruébalo.",
    "No encuentro ese expediente. ¿Los datos son correctos?",
  ],
  conectado:    [
    "Conexión emitida. El autor lo recibe en su Booster. 🧡",
    "Gestión completada. Escríbele cuando quieras.",
    "Tramitado. A partir de aquí es cosa vuestra.",
  ],
  sin_genesis:  [
    "No te salen los números. Necesitas 200 génesis para emitir esto.",
    "Básicamente te faltan génesis. El mínimo son 200.",
    "Sin fondos suficientes. 200 génesis — ese es el protocolo.",
  ],
  describir:    (av, codigo) =>
    `*${av.title}*\n${av.content}\n\nCiudad: ${av.city || 'global'} · Tipo: ${av.type}\nSi te interesa escribe ${codigo} A para conectar con el autor.`,
  conectar:     (av) =>
    `Conectar con el autor de "${av.title}" cuesta 200 génesis. Escribe CONFIRMO para continuar.`,
  handoff_larry: [
    "Larry tiene más estilo para esto. Te lo paso.",
    "Larry, ¡tienes visita! Un momento.",
    "Larry está disponible. Ahora te conecto con él.",
  ],
};

const NOMBRES_LARRY = ['larry', 'el larry'];

function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function evelynBot({ intencion, aviso = null, codigoAvi = null, textoUser = '' }) {
  const t = textoUser.toLowerCase();
  if (NOMBRES_LARRY.some(n => t.includes(n))) {
    return { handoff: 'AVISO_INTERNO', personaje_id: 'larry', mensaje: elegir(FRASES_EVELYN.handoff_larry) };
  }
  switch (intencion) {
    case 'inicio':       return { mensaje: elegir(FRASES_EVELYN.inicio) };
    case 'titulo':       return { mensaje: elegir(FRASES_EVELYN.titulo) };
    case 'contenido':    return { mensaje: elegir(FRASES_EVELYN.contenido) };
    case 'confirmar':    return { mensaje: elegir(FRASES_EVELYN.confirmar) };
    case 'publicado':    return { mensaje: elegir(FRASES_EVELYN.publicado) };
    case 'error_tipo':   return { mensaje: elegir(FRASES_EVELYN.error_tipo) };
    case 'cancelado':    return { mensaje: elegir(FRASES_EVELYN.cancelado) };
    case 'no_encontrado':return { mensaje: elegir(FRASES_EVELYN.no_encontrado) };
    case 'conectado':    return { mensaje: elegir(FRASES_EVELYN.conectado) };
    case 'sin_genesis':  return { mensaje: elegir(FRASES_EVELYN.sin_genesis) };
    case 'describir':    return { mensaje: FRASES_EVELYN.describir(aviso, codigoAvi) };
    case 'conectar':     return { mensaje: FRASES_EVELYN.conectar(aviso) };
    default:             return { mensaje: elegir(FRASES_EVELYN.inicio) };
  }
}

function detectarBusquedaAviso(mensaje) {
  const t = mensaje.toLowerCase();
  return /aviso|anuncio|ofrezco|necesito|tablón|tablon|busco|vendo|alquilo|oferta/i.test(t);
}

function fraseBuscandoAviso(keyword) {
  const frases = [
    `Déjame ver qué hay en el tablón para "${keyword}"...`,
    `Busco en el tablón algo sobre "${keyword}"...`,
    `A ver qué avisos tenemos de "${keyword}"...`,
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}

// ── larryBot inlined ──────────────────────────────────────────────────────────

const FRASES_LARRY = {
  inicio: [
    "Amigo mío, antes de abrir posición necesito saber — ¿OFERTA o DEMANDA?",
    "Rápido que el mercado no espera. ¿OFERTA o DEMANDA?",
    "Simple como un balance. ¿OFERTA o DEMANDA?",
  ],
  titulo: [
    "¿Cómo cotiza este aviso? Dame el título.",
    "El nombre lo es todo en el mercado. ¿Cómo lo titulamos?",
    "Título. Que se lea de un vistazo en el tablón.",
  ],
  contenido: [
    "Ahora el prospecto. ¿Qué tienen que saber los interesados?",
    "Dame el fondo del activo. ¿Qué ofreces o qué buscas?",
    "Los detalles cierran operaciones, amigo mío. ¿Qué quieres que sepan?",
  ],
  confirmar: [
    "La operación está lista. CONFIRMO para emitirlo por 200 génesis.",
    "Todo cuadra en cartera. CONFIRMO — 200 génesis y en el tablón.",
    "Posición abierta y lista. CONFIRMO para ejecutar por 200 génesis.",
  ],
  publicado: [
    "Ejecutado. Buen movimiento, amigo mío. 📈",
    "En el tablón. 200 génesis bien invertidos.",
    "Operación cerrada. Lo que pase después ya cotiza por su cuenta.",
  ],
  error_tipo: [
    "Amigo mío, eso no figura en mi cartera. ¿OFERTA o DEMANDA?",
    "El mercado no entiende eso. OFERTA o DEMANDA — elige.",
    "Eso no cotiza. OFERTA o DEMANDA, nada más.",
  ],
  cancelado: [
    "Operación cancelada. ¿Qué más movemos hoy?",
    "Posición cerrada. ¿Algo más en cartera?",
    "De acuerdo. El mercado sigue abierto — ¿qué más necesitas?",
  ],
  no_encontrado: [
    "Ese código no cotiza en el tablón. ¿Lo revisamos?",
    "No encuentro ese activo, amigo mío. Comprueba el código.",
    "Nada con ese registro. El mercado no miente — revísalo.",
  ],
  conectado: [
    "Conexión ejecutada. Mándale un mensaje, amigo mío. 📈",
    "Hecho. Tiene tu solicitud en el Booster. El resto es negociación.",
    "Operación completada. A partir de aquí, es cosa vuestra.",
  ],
  sin_genesis: [
    "Sin liquidez no hay operación, amigo mío. Necesitas 200 génesis.",
    "Te faltan fondos. 200 génesis mínimo — así está el mercado.",
    "La cuenta no llega. 200 génesis para ejecutar esta posición.",
  ],
  describir: (av, codigo) =>
    `*${av.title}*\n${av.content}\n\nCiudad: ${av.city || 'global'} · Tipo: ${av.type}\nEscribe ${codigo} A si quieres contactar al autor.`,
  conectar: (av) =>
    `Contactar al autor de "${av.title}" son 200 génesis. CONFIRMO para seguir.`,
  handoff_evelyn: [
    "Evelyn es más fina que yo para estas cosas. Te la paso.",
    "Evelyn, tienes visita. Un segundo.",
    "Evelyn lo gestiona mejor. Ahora te conecto.",
  ],
};

const NOMBRES_EVELYN = ['evelyn', 'la evelyn'];

function larryBot({ intencion, aviso = null, codigoAvi = null, textoUser = '' }) {
  const t = textoUser.toLowerCase();
  if (NOMBRES_EVELYN.some(n => t.includes(n))) {
    return { handoff: 'AVISO_INTERNO', personaje_id: 'evelyn', mensaje: elegir(FRASES_LARRY.handoff_evelyn) };
  }
  switch (intencion) {
    case 'inicio':       return { mensaje: elegir(FRASES_LARRY.inicio) };
    case 'titulo':       return { mensaje: elegir(FRASES_LARRY.titulo) };
    case 'contenido':    return { mensaje: elegir(FRASES_LARRY.contenido) };
    case 'confirmar':    return { mensaje: elegir(FRASES_LARRY.confirmar) };
    case 'publicado':    return { mensaje: elegir(FRASES_LARRY.publicado) };
    case 'error_tipo':   return { mensaje: elegir(FRASES_LARRY.error_tipo) };
    case 'cancelado':    return { mensaje: elegir(FRASES_LARRY.cancelado) };
    case 'no_encontrado':return { mensaje: elegir(FRASES_LARRY.no_encontrado) };
    case 'conectado':    return { mensaje: elegir(FRASES_LARRY.conectado) };
    case 'sin_genesis':  return { mensaje: elegir(FRASES_LARRY.sin_genesis) };
    case 'describir':    return { mensaje: FRASES_LARRY.describir(aviso, codigoAvi) };
    case 'conectar':     return { mensaje: FRASES_LARRY.conectar(aviso) };
    default:             return { mensaje: elegir(FRASES_LARRY.inicio) };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function esIntencionPublicar(texto) {
  const t = texto.trim();
  if (t.toUpperCase() === 'P') return true;
  return /\bpublicar\b|\bcrear aviso\b|\bnuevo aviso\b|\bponer aviso\b|\bañadir aviso\b/i.test(t);
}

function esIntencionConsultar(texto) {
  const t = texto.trim();
  if (t.toUpperCase() === 'C') return true;
  return /\bver avisos\b|\bconsultar avisos\b|\bque avisos hay\b|\bqué avisos hay\b/i.test(t);
}

async function consultarAvisosDB({ ciudad, codigoAvi }) {
  try {
    let query = supabase
      .from('avisos')
      .select('id, type, title, content, author_alias, city, user_id, cost_to_reveal, expires_at')
      .gt('expires_at', new Date().toISOString());

    if (codigoAvi) {
      const { data: todos } = await query.limit(200);
      const encontrado = (todos || []).find(av => generarCodigoAvi(av.id) === codigoAvi);
      return encontrado ? [encontrado] : [];
    }
    if (ciudad && ciudad !== 'global') {
      query = query.or(`city.ilike.%${ciudad}%,city.eq.global`);
    }
    const { data } = await query.limit(20);
    return data || [];
  } catch { return []; }
}

// ── Hook principal ─────────────────────────────────────────────────────────────

export function useAgentEvelyn({
  personaje    = 'evelyn',
  iaMode       = 'off',
  isAdmin      = false,
  onHandoff,
  onAvisoConectar,
  onAvisoPublicar,
  ciudad       = null,
  genesis      = 0,
  userId       = null,
  autorAlias   = 'Ciudadano',
}) {
  const [mensaje, setMensaje]                         = useState(null);
  const [loading, setLoading]                         = useState(false);
  const [chatHistory, setChatHistory]                 = useState([]);
  const [avisoEnConstruccion, setAvisoEnConstruccion] = useState(null);
  const [esPatrocinado, setEsPatrocinado]             = useState(false);
  const avisoConectarRef                               = useRef(null);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
  const esLarry  = personaje === 'larry';

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const bot = esLarry ? larryBot : evelynBot;

  const fetchContexto = async () => {
    return esLarry ? fetchContextoLarry(ciudad) : fetchContextoEvelyn(ciudad);
  };

  // ── Envío IA con sobre de datos ───────────────────────────────────────────
  const enviarIA = async (textoUsuario, avisoActual = null) => {
    setLoading(true);
    try {
      const contexto   = await fetchContexto();
      if (contexto?.esPatrocinado) setEsPatrocinado(true);

      const codigoAvi  = textoUsuario.match(/AVI-[A-Z0-9]{4}/i)?.[0]?.toUpperCase() || null;
      const avisos     = await consultarAvisosDB({ ciudad, codigoAvi });
      const campoActual = avisoActual ? siguienteCampo(avisoActual) : null;

      const sobre = armarSobreEvelynTexto({
        alias:               autorAlias,
        bro_id:              userId || '',
        ciudad,
        ciudad_usuario:      ciudad,
        genesis,
        intencion:           'explorar',
        avisos,
        codigoAvi,
        campoActual,
        avisoEnConstruccion: avisoActual,
      });

      const system = buildEvelynExploraPrompt({ personaje, sobre });

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

      const data = await res.json();
      const rawText = data?.texto || '{}';

      try {
        const match  = rawText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('No JSON');
        const parsed = JSON.parse(match[0]);

        if (parsed.handoff === 'HANDOFF_OSOS') {
          setMensaje(parsed.mensaje || '...');
          setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
          setLoading(false);
          return;
        }

        if (parsed.handoff === 'HANDOFF_AVISO_CONECTAR') {
          setMensaje(parsed.mensaje || '...');
          onHandoff?.({
            agente:   'HANDOFF_AVISO_CONECTAR',
            user_id:  parsed.to_user_id,
            aviso_id: parsed.aviso_id,
          });
          setLoading(false);
          return;
        }

        pushHistory('user', textoUsuario);
        pushHistory('assistant', parsed.mensaje || '...');
        setMensaje(parsed.mensaje || '...');

      } catch {
        pushHistory('user', textoUsuario);
        pushHistory('assistant', rawText);
        setMensaje(rawText);
      }

    } catch (err) {
      console.error('useAgentEvelyn IA error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  // ── Publicar aviso — flujo campo a campo ─────────────────────────────────
  const procesarPublicacion = async (textoUsuario) => {
    const aviso = avisoEnConstruccion || {};

    if (/\bcancelar\b/i.test(textoUsuario)) {
      setAvisoEnConstruccion(null);
      const r = bot({ intencion: 'cancelado', textoUser: textoUsuario });
      setMensaje(r.mensaje);
      return;
    }

    if (textoUsuario.trim().toUpperCase() === 'CONFIRMO' && aviso.tipo && aviso.titulo && aviso.contenido) {
      if (genesis < 200) {
        const r = bot({ intencion: 'sin_genesis', textoUser: textoUsuario });
        setMensaje(r.mensaje);
        return;
      }
      setLoading(true);
      try {
        console.log('Intentando INSERT:', {
          user_id: userId,
          type: aviso.tipo,
          title: aviso.titulo,
          content: aviso.contenido,
          banner_avi: aviso.banner_avi,
        });

        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 7);
        await supabase.from('avisos').insert([{
          user_id:        userId     || '',
          author_alias:   autorAlias || 'Ciudadano',
          type:           aviso.tipo,
          title:          aviso.titulo,
          content:        aviso.contenido,
          banner_avi:     aviso.banner_avi || null,
          cost_to_reveal: 200,
          is_active:      true,
          expires_at:     expireDate.toISOString(),
        }]);
        onAvisoPublicar?.({ confirmado: true });
        setAvisoEnConstruccion(null);
        const r = bot({ intencion: 'publicado', textoUser: textoUsuario });
        setMensaje(r.mensaje);
      } catch (err) {
        console.error('Error publicando aviso:', err);
        console.error('Aviso intentado:', aviso);
        setMensaje('Error al publicar. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
      return;
    }

    const campoActual = siguienteCampo(aviso);
    if (campoActual) {
      const valor = extraerCampo(campoActual, textoUsuario);
      if (valor) {
        const avisoActualizado = { ...aviso, [campoActual]: valor };
        setAvisoEnConstruccion(avisoActualizado);
        const siguienteCampoNow = siguienteCampo(avisoActualizado);
        if (siguienteCampoNow) {
          if (iaActiva) {
            await enviarIA(textoUsuario, avisoActualizado);
          } else {
            const r = bot({ intencion: siguienteCampoNow, textoUser: textoUsuario });
            setMensaje(r.mensaje);
          }
        } else {
          const r = bot({ intencion: 'confirmar', textoUser: textoUsuario });
          setMensaje(r.mensaje);
        }
      } else {
        const r = bot({ intencion: campoActual === 'tipo' ? 'error_tipo' : campoActual, textoUser: textoUsuario });
        setMensaje(r.mensaje);
      }
    }
  };

  // ── Entrada principal ─────────────────────────────────────────────────────
  const enviar = async (textoUsuario) => {
    console.log('useAgentEvelyn enviar:', {
      textoUsuario,
      avisoEnConstruccion,
      avisoEnProceso: avisoEnConstruccion !== null && avisoEnConstruccion !== undefined,
    });

    if (!textoUsuario?.trim()) return;

    // 1. PRIMERO — ¿hay aviso en construcción?
    const avisoEnProceso = avisoEnConstruccion !== null && avisoEnConstruccion !== undefined;
    if (avisoEnProceso) {
      await procesarPublicacion(textoUsuario);
      return;
    }

    // 2. LUEGO — resto de detecciones
    const salida = detectarSalidaAviso(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    const interno = detectarInternoAviso(textoUsuario, personaje);
    if (interno) {
      setTimeout(() => onHandoff?.({ agente: 'AVISO_INTERNO', personaje_id: interno.personaje_id }), 1200);
      return;
    }

    if (esIntencionPublicar(textoUsuario)) {
      setAvisoEnConstruccion({});
      const r = bot({ intencion: 'inicio', textoUser: textoUsuario });
      setMensaje(r.mensaje);
      return;
    }

    if (esIntencionConsultar(textoUsuario)) {
      setMensaje('Déjame ver qué hay en el tablón...');
      onHandoff?.({ agente: 'BUSCAR_STRIP', keyword: textoUsuario, intencion: 'BROSHOP_AVISO' });
      return;
    }

    if (detectarBusquedaAviso(textoUsuario)) {
      setMensaje(fraseBuscandoAviso(textoUsuario));
      onHandoff?.({ agente: 'BUSCAR_STRIP', keyword: textoUsuario, intencion: 'BROSHOP_AVISO' });
      return;
    }

    if (iaActiva) {
      await enviarIA(textoUsuario, null);
      return;
    }

    const r = bot({ intencion: 'explorar', textoUser: textoUsuario });
    setMensaje(r.mensaje);
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setAvisoEnConstruccion(null);
    setEsPatrocinado(false);
    avisoConectarRef.current = null;
  };

  return { mensaje, loading, enviar, reset, iaActiva, avisoEnConstruccion, setAvisoEnConstruccion, esPatrocinado };
}
