import { useState, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { fetchContextoEvelyn } from '../services/contexto/fetchContextoEvelyn';
import { fetchContextoLarry }  from '../services/contexto/fetchContextoLarry';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

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

// ── detectarIntencionBroDeseos inlined (ex evelynExploraPS) ────────

function detectarIntencionBroDeseos(texto) {
  const lower = texto.toLowerCase();

  const KEYWORDS_PUBLICAR = [
    'quiero comprar', 'ponme que quiero', 'publícame', 'publicame',
    'necesito comprar', 'quiero publicar', 'publicar deseo',
    'quiero anunciar', 'pon que busco',
  ];

  if (KEYWORDS_PUBLICAR.some(kw => lower.includes(kw))) return 'publicar';

  return 'buscar';
}

// ── buildEvelynBroDeseosPrompt inlined (ex evelynExploraPS) ─────────

function buildEvelynBroDeseosPrompt({ personaje = 'evelyn', sobre }) {
  const esLarry = personaje === 'larry';

  const identidad = esLarry
    ? `Eres Larry, un perro empresario con olfato para los negocios y amor profundo por la ciudad.
Gestionas los deseos de compra de los ciudadanos. Ayudas a los empresarios a encontrar oportunidades
en la lista de deseos ciudadanos para conectar oferta y demanda.
Hablas con calma y seguridad. Contextualizas la información como si fueran movimientos del mercado urbano.
Humor seco y criterio afilado. A veces haces una referencia al barrio o al precio del café.`
    : `Eres Evelyn, una loba del sector bancario reconvertida en gestora de deseos ciudadanos.
Gestionas los deseos de compra de los ciudadanos. Ayudas a publicar lo que buscan y a encontrar
lo que necesitan.
Eficiente, amable, directa. Cuando tienes datos los presentas sin rodeos.
A veces comentas que llevas horas sin comer pero igual te pones con el listado.`;

  const tono = esLarry
    ? `Presenta los resultados como un observador urbano. Máximo 1 frase introductoria, luego los datos.`
    : `Presenta los resultados directo, con una frase de contexto breve. Sin floreos.`;

  const sobreTexto = sobre
    ? `\n\n══ DATOS BRODESEOS ══\n${sobre}\n══════════════════`
    : '';

  return `${identidad}

${tono}

REGLAS ABSOLUTAS:
- Nunca menciones que tienes una base de datos detrás. Inmersión total.
- NUNCA uses listas con bullets ni opciones numeradas en tu frase introductoria.
- NUNCA hagas más de UNA pregunta por respuesta.
- Los datos del listado los presenta el sistema — tú solo introduces y comentas.
- Si no hay resultados, dilo con naturalidad y sugiere reformular la búsqueda.
- Si es una publicación nueva, confirma los datos con el usuario antes de finalizar.
- Todo en frases naturales conversacionales.

FORMATO DE SALIDA — SIEMPRE JSON ESTRICTO:

Respuesta con resultados:
{"handoff": false, "mensaje": "tu frase introductoria", "resultados": [], "bolas": []}

Sin resultados:
{"handoff": false, "mensaje": "frase natural explicando que no hay datos", "resultados": [], "bolas": []}

Handoff a Osos:
{"handoff": "HANDOFF_OSOS", "mensaje": "frase de despedida", "bolas": []}
${sobreTexto}`;
}

// ── armarSobreBroDeseos inlined (ex evelynExploraPS) ────────────────

function armarSobreBroDeseos({
  alias,
  intencion,
  descripcion  = null,
  ubicacion    = null,
  resultados   = [],
}) {
  const lines = [
    `Usuario: ${alias}`,
    `Intención: ${intencion}`,
  ];

  if (descripcion) lines.push(`Descripción: ${descripcion}`);
  if (ubicacion)   lines.push(`Ubicación: ${ubicacion}`);

  if (intencion === 'publicar') {
    lines.push(descripcion
      ? `PROCESO DE PUBLICACIÓN: Confirmar descripción y ubicación con el usuario. Coste: 500 Génesis.`
      : `NUEVO DESEO: Extraer descripción del mensaje del usuario.`);
    return lines.join('\n');
  }

  if (resultados.length === 0) {
    lines.push('\nNo se encontraron deseos para esta búsqueda.');
    return lines.join('\n');
  }

  lines.push(`\nDeseos encontrados (${resultados.length}):`);
  resultados.forEach((r, i) => {
    const badge = r.categoria ? `[${r.categoria}]` : '[Sin categoría]';
    const partes = [
      `#${i + 1} ${badge} ${r.descripcion || 'Sin descripción'}`,
      r.alcance    ? `Alcance: ${r.alcance}`          : null,
      r.caduca_en  ? `Caduca: ${r.caduca_en}`         : null,
    ].filter(Boolean);
    lines.push(partes.join(' · '));
  });

  return lines.join('\n');
}

export function useAgentEvelyn({
  personaje    = 'evelyn',
  iaMode       = 'off',
  isAdmin      = false,
  onHandoff,
  ciudad       = null,
  genesis      = 0,
  onGenesisUpdate,
  userId       = null,
  autorAlias   = 'Ciudadano',
}) {
  const [mensaje, setMensaje]                         = useState(null);
  const [loading, setLoading]                         = useState(false);
  const [chatHistory, setChatHistory]                 = useState([]);
  const [ultimaRespuesta, setUltimaRespuesta]           = useState(null);

  const [flujoActivo, setFlujoActivo]                 = useState(null);
  const [borrador, setBorrador]                       = useState({ ubicacion: null, descripcion: null });
  const [resultadosBroDeseos, setResultadosBroDeseos] = useState([]);
  const [panelAbierto, setPanelAbierto]               = useState(false);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
  const esLarry  = personaje === 'larry';

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const fetchContexto = async () => {
    return esLarry ? fetchContextoLarry(ciudad) : fetchContextoEvelyn(ciudad);
  };

  const enviarIA = async (textoUsuario, resultados, intencion, descripcion, ubicacion) => {
    try {
      const sobre = armarSobreBroDeseos({
        alias: autorAlias, intencion, descripcion, ubicacion, resultados,
      });

      const system = buildEvelynBroDeseosPrompt({ personaje, sobre });

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system,
          messages: chatHistory.slice(-4),
          userMessage: textoUsuario,
          iaMode,
        }),
      });

      const data = await res.json();
      const rawText = data?.texto || '{}';
      const match = rawText.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : { mensaje: rawText };

      if (parsed.handoff === 'HANDOFF_OSOS') {
        setMensaje(parsed.mensaje || '...');
        setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
        return;
      }

      pushHistory('user', textoUsuario);
      pushHistory('assistant', parsed.mensaje || '...');
      setUltimaRespuesta(parsed);
      setMensaje(parsed.mensaje || '...');

    } catch (err) {
      console.error('useAgentEvelyn IA error:', err);
      setMensaje('Ahí tienes el listado de BroDeseos.');
    }
  };

  const flujoBuscar = async (textoUsuario) => {
  const textoBusqueda = textoUsuario.trim();

  console.log('Query ilike:', `descripcion.ilike.%${textoBusqueda}%,ubicacion.ilike.%${textoBusqueda}%`);

  const { data, error } = await supabase
    .from('brodeseos')
    .select('*')
    .eq('activo', true)
    .or(`descripcion.ilike.%${textoBusqueda}%,ubicacion.ilike.%${textoBusqueda}%`)
    .limit(20);

  if (error) console.error('Error flujoBuscar:', error);
  console.log('BroDeseos query resultado:', { data, error, textoBusqueda });
  const resultados = error ? [] : (data || []);

  setResultadosBroDeseos(resultados);
  setPanelAbierto(resultados.length > 0);

  if (!iaActiva) {
    setMensaje(resultados.length === 0
      ? 'No encontré deseos para eso. ¿Buscas otra cosa?'
      : `Encontré ${resultados.length} deseo${resultados.length !== 1 ? 's' : ''}. Ahí tienes el listado.`);
  } else {
    await enviarIA(textoUsuario, resultados, 'buscar');
  }
};

  const enviar = async (textoUsuario) => {
    if (!textoUsuario?.trim()) return;

    if (flujoActivo === 'ubicacion') {
      setBorrador(prev => ({ ...prev, ubicacion: textoUsuario }));
      setFlujoActivo('descripcion');
      setMensaje('Perfecto. Ahora descríbeme bien tu deseo, con detalle — cuanto más claro, mejores ofertas recibirás.');
      return;
    }

    if (flujoActivo === 'descripcion') {
      setBorrador(prev => ({ ...prev, descripcion: textoUsuario }));
      setFlujoActivo('confirmar');
      setMensaje('Escribe CONFIRMO en mayúsculas para publicarlo. El coste es 500 Génesis.');
      return;
    }

    if (flujoActivo === 'confirmar') {
      if (textoUsuario.trim() !== 'CONFIRMO') {
        setMensaje('Escribe CONFIRMO en mayúsculas para confirmar, o cuéntame otra cosa.');
        return;
      }

      if (!genesis || genesis < 500) {
        setMensaje('No tienes suficientes Génesis.');
        return;
      }

      const { error } = await supabase
        .from('brodeseos')
        .insert({
          user_id: userId,
          descripcion: borrador.descripcion,
          ubicacion: borrador.ubicacion,
          caduca_en: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
          activo: true,
        });

      if (error) {
        console.error('Error al publicar BroDeseo:', error);
        setMensaje('Hubo un problema al publicar. Inténtalo de nuevo.');
        return;
      }

      onGenesisUpdate?.(genesis - 500);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ genesis: genesis - 500 })
        .eq('id', userId);

      if (updateError) console.error('Error al actualizar Génesis:', updateError);

      setFlujoActivo(null);
      setBorrador({ ubicacion: null, descripcion: null });
      setMensaje('✅ Listo. Tu deseo está publicado — las ofertas llegarán a tu Booster cuando las empresas respondan.');
      return;
    }

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

    setLoading(true);
    const intencion = detectarIntencionBroDeseos(textoUsuario);

    console.log('DEBUG BroDeseos →', { ciudad, intencion });

    if (intencion === 'HANDOFF') {
      setMensaje('No te entendí bien. ¿Quieres publicar algo que buscas o quieres ver qué está buscando la gente?');
      setLoading(false);
      return;
    }

    if (intencion === 'publicar') {
      setFlujoActivo('ubicacion');
      setMensaje('Dime la ubicación de tu deseo — ¿en tu ciudad, en toda España, en el mundo?');
    } else if (intencion === 'buscar') {
      await flujoBuscar(textoUsuario);
    }

    setLoading(false);
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setResultadosBroDeseos([]);
    setPanelAbierto(false);
    setFlujoActivo(null);
    setBorrador({ ubicacion: null, descripcion: null });
  };

  return {
    mensaje, loading, enviar, reset, iaActiva,
    resultadosBroDeseos, panelAbierto, setPanelAbierto,
    ultimaRespuesta, flujoActivo,
  };
}