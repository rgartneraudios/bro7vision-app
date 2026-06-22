import { useState, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { fetchContextoEvelyn } from '../services/contexto/fetchContextoEvelyn';
import { fetchContextoLarry }  from '../services/contexto/fetchContextoLarry';
import {
  detectarIntencionBroDeseos,
  detectarCategoria,
  buildEvelynBroDeseosPrompt,
  armarSobreBroDeseos,
} from '../services/agents/evelynExploraPS';

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

export function useAgentEvelyn({
  personaje    = 'evelyn',
  iaMode       = 'off',
  isAdmin      = false,
  onHandoff,
  ciudad       = null,
  genesis      = 0,
  userId       = null,
  autorAlias   = 'Ciudadano',
}) {
  const [mensaje, setMensaje]                         = useState(null);
  const [loading, setLoading]                         = useState(false);
  const [chatHistory, setChatHistory]                 = useState([]);
  const [ultimaRespuesta, setUltimaRespuesta]           = useState(null);

  const [flujoActivo, setFlujoActivo]                 = useState(null);
  const [borrador, setBorrador]                       = useState({ descripcion: '', categoria: null, alcance: null });
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

  const enviarIA = async (textoUsuario, resultados, categoria, intencion, descripcion, alcance) => {
    try {
      const sobre = armarSobreBroDeseos({
        alias: autorAlias, intencion, descripcion, categoria, alcance, resultados,
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

  const flujoPublicar = async (textoUsuario) => {
    const descripcionCandidata = textoUsuario
      .replace(/quiero comprar|publícame|necesito comprar|ponme que quiero|publicar|anunciar/gi, '')
      .trim();

    const categoria = detectarCategoria(textoUsuario);

    if (!categoria) {
      setBorrador(prev => ({ ...prev, descripcion: descripcionCandidata }));
      const msg = '¿En qué categoría encaja? Las opciones son: Electrodomésticos, Ropa y calzado, Alimentación y restauración, Salud y bienestar, Hogar y muebles, Tecnología, Servicios profesionales, Ocio y viajes, u Otros.';
      setMensaje(msg);
      return;
    }

    setBorrador({ descripcion: descripcionCandidata, categoria, alcance: null });
    setMensaje(`Perfecto, categoría: ${categoria}. ¿Tu búsqueda tiene alcance local (ciudad/barrio) o es para toda la red?`);
  };

  const flujoBuscar = async (textoUsuario) => {
    const categoria = detectarCategoria(textoUsuario);
    let query = supabase
      .from('brodeseos')
      .select('*')
      .eq('activo', true);

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query.limit(20);
    const resultados = error ? [] : (data || []);

    setResultadosBroDeseos(resultados);
    setPanelAbierto(resultados.length > 0);

    if (!iaActiva) {
      setMensaje(resultados.length === 0
        ? 'No encontré deseos para eso. ¿Buscas otra cosa?'
        : `Encontré ${resultados.length} deseo${resultados.length !== 1 ? 's' : ''}. Ahí tienes el listado.`);
    } else {
      await enviarIA(textoUsuario, resultados, categoria, 'buscar');
    }
  };

  const confirmarPublicar = async () => {
    if (!borrador.descripcion || !borrador.categoria) {
      setMensaje('Faltan datos para publicar. Empieza de nuevo.');
      return;
    }

    const alcanceFinal = borrador.alcance || ciudad || 'toda la red';
    const caducaEn = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { error } = await supabase
      .from('brodeseos')
      .insert({
        alias: autorAlias,
        user_id: userId,
        descripcion: borrador.descripcion,
        categoria: borrador.categoria,
        alcance: alcanceFinal,
        costo_genesis: 500,
        caduca_en: caducaEn,
        activo: true,
        creado_en: new Date().toISOString(),
      });

    if (error) {
      console.error('Error al publicar BroDeseo:', error);
      setMensaje('Hubo un problema al publicar. Inténtalo de nuevo.');
      return;
    }

    setFlujoActivo(null);
    setBorrador({ descripcion: '', categoria: null, alcance: null });
    setMensaje('¡Publicado! Tu deseo está activo. Que encuentres lo que buscas.');
  };

  const enviar = async (textoUsuario) => {
    if (!textoUsuario?.trim()) return;

    if (flujoActivo === 'publicar') {
      const lower = textoUsuario.toLowerCase();
      if (lower.includes('si') || lower.includes('confirmo') || lower.includes('dale') || lower.includes('ok')) {
        await confirmarPublicar();
      } else if (!borrador.categoria) {
        const cat = detectarCategoria(textoUsuario);
        if (cat) {
          setBorrador(prev => ({ ...prev, categoria: cat }));
          setMensaje(`Categoría: ${cat}. ¿Alcance local o toda la red?`);
        } else {
          setMensaje('No reconozco esa categoría. Elige entre: Electrodomésticos, Ropa y calzado, Alimentación y restauración, Salud y bienestar, Hogar y muebles, Tecnología, Servicios profesionales, Ocio y viajes, u Otros.');
        }
      } else if (!borrador.alcance) {
        if (lower.includes('local') || lower.includes('ciudad') || lower.includes('barrio')) {
          setBorrador(prev => ({ ...prev, alcance: ciudad || 'local' }));
          setMensaje(`Vale. Publicar "${borrador.descripcion}" en categoría ${borrador.categoria} con alcance local cuesta 500 Génesis. ¿Confirmas?`);
        } else if (lower.includes('red') || lower.includes('todo') || lower.includes('global')) {
          setBorrador(prev => ({ ...prev, alcance: 'toda la red' }));
          setMensaje(`Vale. Publicar "${borrador.descripcion}" en categoría ${borrador.categoria} para toda la red cuesta 500 Génesis. ¿Confirmas?`);
        } else {
          setMensaje('¿Alcance local (ciudad/barrio) o para toda la red?');
        }
      }
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
      setFlujoActivo('publicar');
      await flujoPublicar(textoUsuario);
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
    setBorrador({ descripcion: '', categoria: null, alcance: null });
  };

  return {
    mensaje, loading, enviar, reset, iaActiva,
    resultadosBroDeseos, panelAbierto, setPanelAbierto,
    ultimaRespuesta, flujoActivo,
  };
}