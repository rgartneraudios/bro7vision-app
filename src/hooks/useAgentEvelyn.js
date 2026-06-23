import { useState, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { fetchContextoEvelyn } from '../services/contexto/fetchContextoEvelyn';
import { fetchContextoLarry }  from '../services/contexto/fetchContextoLarry';
import {
  detectarIntencionBroDeseos,
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