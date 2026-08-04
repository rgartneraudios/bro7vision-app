// src/hooks/useAgentIsabella.js
// Hook exclusivo de Isabella y Profesor Robles.
// personaje = 'isabella' | 'profesor'

import { useState } from 'react';
import { fetchContextoIsabella } from '../services/contexto/fetchContextoIsabella';
import { fetchContextoProfesor }  from '../services/contexto/fetchContextoProfesor';

const isabella = {
  nombre: 'Isabella',
  tono: 'maternal, cálido, clínico',
  personalidad: `Isabella es Psicóloga muy aplicada y con sentimiento de madre hacia todos. Tono cálido, empático, pero clínico. Usa mucho lenguaje de terapia (therapy-speak) sin darse cuenta. Muletillas: "Entiendo", "Cielo / Cariño", "Claro".`,
};

const profesor = {
  nombre: 'Profesor',
  tono: 'ansioso, amable, nervioso',
  personalidad: `Profesor Robles, también conocido como Profesor. Vocabulario elevado, preciso, melancólico. Muletillas: "Ergo...", "Paradójicamente", "Es decir".`,
};

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const SERV_KEYWORDS_SALIDA = [
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  'aviso', 'avisos', 'anuncio', 'anuncios', 'evelyn', 'larry',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'reinos', 'reino', 'rumores',
  'juego', 'juegos', 'games',
];
const SERV_KEYWORDS_PROFESOR   = ['robles', 'profesor robles', 'profesor', 'profe', 'el profesor', 'el profe'];
const SERV_KEYWORDS_ISABELLA   = ['isabella', 'la isabella', 'isa'];
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

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPromptIsabella(perfil, contexto, vivencia, estadoAnimo, promoGeo, special) {
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
- HANDOFF:SERVICIO_INTERNO:profesor → cambiar al Profesor
- HANDOFF:SERVICIO_INTERNO:isabella → cambiar a Isabella

REGLAS:
1. Máximo 3 frases por respuesta.
2. Nunca menciones que eres una IA.
3. Sin asteriscos ni acciones entre asteriscos.
4. Cuando el user quiera salir responde ÚNICAMENTE: HANDOFF:OSOS
  `.trim();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentIsabella({
  personaje   = 'isabella',
  iaMode      = 'off',
  isAdmin     = false,
  onHandoff,
  ciudad      = null,
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

      pushHistory('user', textoUsuario);
      pushHistory('assistant', respuesta);
      setMensaje(respuesta);

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

    setMensaje('Cuéntame qué buscas y te ayudo a encontrarlo con mucho cariño 🧡');
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setEsPatrocinado(false);
  };

  return { mensaje, loading, enviar, reset, iaActiva, esPatrocinado };
}