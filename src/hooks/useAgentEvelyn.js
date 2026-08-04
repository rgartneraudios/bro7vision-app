import { useState } from 'react';
import { fetchContextoEvelyn } from '../services/contexto/fetchContextoEvelyn';
import { fetchContextoLarry }  from '../services/contexto/fetchContextoLarry';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const KEYWORDS_SALIDA = [
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'reinos', 'reino', 'rumores',
  'juego', 'juegos', 'games',
];

const KEYWORDS_LARRY  = ['larry', 'el larry'];
const KEYWORDS_EVELYN = ['evelyn', 'la evelyn'];

const FRASES_SALIDA = [
  'Espera, que te paso con los Osos.',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Hasta luego.',
  'Te paso con los Osos. Vuelvo al tablón.',
];

const detectarSalida = (texto) => {
  const t = norm(texto);
  const quiereSalir = KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)));
  if (!quiereSalir) return null;
  return {
    salida: true,
    mensaje: FRASES_SALIDA[Math.floor(Math.random() * FRASES_SALIDA.length)],
  };
};

const detectarInterno = (texto, personajeActivo) => {
  const t = norm(texto);
  if (personajeActivo !== 'larry' && KEYWORDS_LARRY.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'larry' };
  }
  if (personajeActivo !== 'evelyn' && KEYWORDS_EVELYN.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'evelyn' };
  }
  return null;
};

function buildPromptEvelyn(perfil, contexto, vivencia, estadoAnimo, promoGeo) {
  return `
Eres ${perfil.nombre}. Habla siempre en primera persona.
Tono: ${perfil.tono}

PERSONALIDAD:
${perfil.personalidad}

${vivencia    ? `VIVENCIA DE HOY (incorpórala de forma natural): ${vivencia}`    : ''}
${estadoAnimo ? `ESTADO DE ÁNIMO: ${estadoAnimo}`                               : ''}
${promoGeo    ? `MENCIÓN PATROCINADA (natural, nunca como anuncio): ${promoGeo}` : ''}

HANDOFFS DISPONIBLES:
- HANDOFF:OSOS → salir al sector recepción
- HANDOFF:AVISO_INTERNO:evelyn → cambiar a Evelyn
- HANDOFF:AVISO_INTERNO:larry → cambiar a Larry

REGLAS:
1. Máximo 3 frases por respuesta.
2. Nunca menciones que eres una IA.
3. Sin asteriscos ni acciones entre asteriscos.
4. Cuando el user quiera salir responde ÚNICAMENTE: HANDOFF:OSOS
  `.trim();
}

export function useAgentEvelyn({
  personaje    = 'evelyn',
  iaMode       = 'off',
  isAdmin      = false,
  onHandoff,
  ciudad       = null,
}) {
  const [mensaje, setMensaje]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
  const esLarry  = personaje === 'larry';

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const fetchContexto = async () => {
    return esLarry ? fetchContextoLarry(ciudad) : fetchContextoEvelyn(ciudad);
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto = await fetchContexto();
      const perfil = esLarry
        ? { nombre: 'Larry', tono: 'seco, empresario, astuto', personalidad: 'Perro empresario con olfato para los negocios. Humor seco y criterio afilado.' }
        : { nombre: 'Evelyn', tono: 'eficiente, amable, directa', personalidad: 'Loba del sector bancario. Eficiente, amable, directa.' };

      const system = buildPromptEvelyn(
        perfil, contexto,
        contexto?.vivencia, contexto?.estadoAnimo, contexto?.promoGeo,
      );

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
      const respuesta = data?.texto || '...';

      if (respuesta.trim().startsWith('HANDOFF:')) {
        const partes  = respuesta.replace('HANDOFF:', '').trim().split(':');
        const agente  = partes[0];
        const detalle = partes[1] || null;
        onHandoff?.({
          agente,
          ...(detalle && agente === 'AVISO_INTERNO' && { personaje_id: detalle }),
        });
        setLoading(false);
        return;
      }

      pushHistory('user', textoUsuario);
      pushHistory('assistant', respuesta);
      setMensaje(respuesta);

    } catch (err) {
      console.error('useAgentEvelyn IA error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = async (textoUsuario) => {
    if (!textoUsuario?.trim()) return;

    const salida = detectarSalida(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    const interno = detectarInterno(textoUsuario, personaje);
    if (interno) {
      setTimeout(() => onHandoff?.({ agente: 'AVISO_INTERNO', personaje_id: interno.personaje_id }), 1200);
      return;
    }

    if (iaActiva) {
      await enviarIA(textoUsuario);
      return;
    }

    setMensaje('Cuéntame qué necesitas y lo vemos juntos.');
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
  };

  return { mensaje, loading, enviar, reset, iaActiva };
}