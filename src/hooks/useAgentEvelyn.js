import { useState, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { fetchContextoEvelyn } from '../services/contexto/fetchContextoEvelyn';
import { fetchContextoLarry }  from '../services/contexto/fetchContextoLarry';
import {
  detectarIntencionWikiBro,
  extraerParametrosBusqueda,
  buildEvelynWikiPrompt,
  armarSobreWikiBro,
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
  const [resultadosWiki, setResultadosWiki]           = useState([]);
  const [acordeonAbierto, setAcordeonAbierto]         = useState(false);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
  const esLarry  = personaje === 'larry';

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const fetchContexto = async () => {
    return esLarry ? fetchContextoLarry(ciudad) : fetchContextoEvelyn(ciudad);
  };

  const enviarIA = async (textoUsuario, resultados, categoria, barrio, intencion, telefono) => {
    try {
      const sobre = armarSobreWikiBro({
        alias: autorAlias, ciudad, categoria, barrio, telefono, intencion, resultados,
      });

      const system = buildEvelynWikiPrompt({ personaje, sobre });

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
      setMensaje('Ahí tienes el listado de la WikiBro.');
    }
  };

  const enviar = async (textoUsuario) => {
    if (!textoUsuario?.trim()) return;

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
    const intencion = detectarIntencionWikiBro(textoUsuario);
    const { categoria, barrio, telefono } = extraerParametrosBusqueda(textoUsuario);

    console.log('DEBUG WikiBro →', { ciudad, categoria, barrio, telefono, intencion });

    const resultados = await buscarEnWikiBro({
      ciudad, categoria, barrio, telefono,
      esSpam: intencion === 'spam',
    });

    setResultadosWiki(resultados);
    setAcordeonAbierto(true);

    if (iaActiva) {
      await enviarIA(textoUsuario, resultados, categoria, barrio, intencion, telefono);
    } else {
      const tieneCupon = resultados.some(r => r.tiene_brocupon);
      const frase = resultados.length === 0
        ? 'No encontré nada en la WikiBro para eso. ¿Buscamos otra cosa?'
        : `Ahí tienes el listado de la WikiBro${tieneCupon ? ' — mira que alguno tiene BroCupón activo, aprovecha la oferta' : ''}.`;
      setMensaje(frase);
    }
    setLoading(false);
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setResultadosWiki([]);
    setAcordeonAbierto(false);
  };

  const buscarEnWikiBro = useCallback(async ({ ciudad, categoria, barrio, telefono, esSpam }) => {
  let query = supabase
    .from('wikibro_con_cupones')
    .select('*');

  if (esSpam && telefono) {
    query = query.eq('es_spam_report', true).ilike('telefono', `%${telefono}%`);
  } else {
    if (ciudad)    query = query.ilike('ciudad', `%${ciudad}%`);
    if (barrio)    query = query.ilike('barrio', `%${barrio}%`);
    if (categoria) query = query.ilike('categoria', `%${categoria}%`);
    query = query.eq('es_spam_report', false);
  }

  query = query.limit(10);
  const { data, error } = await query;
  if (error) return [];
  return data || [];
}, []);

  return {
    mensaje, loading, enviar, reset, iaActiva,
    resultadosWiki, acordeonAbierto, setAcordeonAbierto,
    ultimaRespuesta,
  };
}