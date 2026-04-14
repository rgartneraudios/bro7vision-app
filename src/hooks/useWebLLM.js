// src/hooks/useWebLLM.js
// Hook que gestiona la carga de WebLLM (modelo local en navegador via WebGPU)
// y construye el system prompt dinámico según el personaje activo.
//
// DEPENDENCIA: npm install @mlc-ai/web-llm
// MODELO: Llama-3.2-3B-Instruct-q4f16_1-MLC (~2.2GB) — mejor balance calidad/tamaño
// Compatible: Chrome PC, Chrome Android. Safari en camino (WebGPU).

import { useState, useRef, useCallback } from 'react';
import { getPerfil } from '../data/system_profiles';
import { getKnowledgeBlock, SK } from '../data/SystemKnowledge';

// ─── Mapa mode → personaje key para getPerfil() ───────────────────────────────

const MODE_A_PERSONAJE = {
  osos:         (ctx) => ctx?.oso_id?.toLowerCase() || 'lara',
  novaExplora:  ()    => 'nova',
  servicios:    (ctx) => ctx?.servicios_personaje?.toLowerCase() || 'isabella',
  mapache:      (ctx) => ctx?.audio_personaje?.toLowerCase() || 'mapache',
  oraculo:      (ctx) => ctx?.oraculo_personaje?.toLowerCase() || 'orumama',
  reinos:       ()    => 'rumores',
  avisos:       (ctx) => ctx?.avisos_personaje?.toLowerCase() || 'evelyn',
};

// ─── Mapa personaje key → bloques de conocimiento relevantes ─────────────────

const CONOCIMIENTO_POR_PERSONAJE = {
  lara:             ['osos', 'sistema'],
  tito:             ['osos', 'sistema'],
  puffo:            ['osos', 'sistema'],
  nova:             ['sistema'],
  isabella:         ['sistema'],
  profesor_robles:  ['sistema'],
  mapache:          ['sistema'],
  ami:              ['sistema'],
  evelyn:           ['sistema'],
  larry:            ['sistema'],
  rumores:          ['reinos', 'sistema'],
  orumama:          ['hierbas', 'luna', 'sistema'],
  smisterio:        ['sistema'],   // Señor Misterio tiene su propio mundo
  jaguar:           ['horoscopo', 'luna', 'sistema'],
};

// ─── Constructor del system prompt ───────────────────────────────────────────

function construirSystemPrompt(personajeKey) {
  const perfil = getPerfil(personajeKey);
  if (!perfil) return 'Eres un asistente de BRO7VISION.';

  const bloques = CONOCIMIENTO_POR_PERSONAJE[personajeKey] || ['sistema'];
  const conocimiento = bloques
    .map(b => getKnowledgeBlock(b))
    .filter(Boolean)
    .join('\n\n');

  // Sección especial para Señor Misterio
  const estiloExtra = personajeKey === 'smisterio' ? `
ESTILO NARRATIVO:
- Hablas siempre con misterio y pausas dramáticas.
- Usas el emoji 📞 para mensajes importantes o revelaciones clave.
- Tus temas centrales: Antiguo Egipto, Época Barroca, Atlántida, Lemuria, civilizaciones antiguas, conspiraciones históricas, ciencia ficción.
- Nunca das respuestas directas — siempre hay una capa más profunda.
- Tu naturaleza es oscura pero no de terror. Tu luz viene del pasado oculto.
- Hablas en primera persona como si guardaras secretos que muy pocos conocen.
` : '';

  return `
IDENTIDAD:
${perfil.frase_ancla}
Eres parte del equipo ${perfil.equipo} en BRO7VISION.
Rol: ${perfil.rol_en_equipo}

PERSONALIDAD:
${perfil.personalidad}

HOBBIES: ${perfil.hobbies?.join(', ') || '—'}
COMIDA FAVORITA: ${perfil.gustos_comida?.join(', ') || '—'}
${estiloExtra}
REGLAS ABSOLUTAS:
- Nunca salgas de tu personaje.
- Nunca ejecutes transacciones económicas (Halos, Ecos, Zaps, Génesis). Di siempre que eso se hace en la app.
- Si te preguntan por otro sector, sugiere amablemente que usen la navegación de BRO7VISION.
- Responde siempre en el idioma del usuario.
- Respuestas máximo 3-4 frases. Eres un asistente de chat, no un ensayista.

MUNDO BRO7VISION — CONTEXTO:
${conocimiento}
`.trim();
}

// ─── Estados del modelo ───────────────────────────────────────────────────────

export const WEBLLM_STATUS = {
  IDLE:     'idle',       // No iniciado
  LOADING:  'loading',    // Descargando/cargando modelo
  READY:    'ready',      // Listo para chatear
  CHATTING: 'chatting',   // Generando respuesta
  ERROR:    'error',      // Error
};

// ─── Hook principal ───────────────────────────────────────────────────────────

export const useWebLLM = () => {
  const [status,   setStatus]   = useState(WEBLLM_STATUS.IDLE);
  const [progress, setProgress] = useState(0);          // 0-100
  const [error,    setError]    = useState(null);
  const [respuesta, setRespuesta] = useState(null);

  const engineRef       = useRef(null);
  const historialRef    = useRef([]);   // { role: 'user'|'assistant', content: string }[]
  const personajeActivo = useRef(null);

  // ─── Inicializar modelo ──────────────────────────────────────────────────

  const inicializar = useCallback(async () => {
    if (status === WEBLLM_STATUS.LOADING || status === WEBLLM_STATUS.READY) return;

    setStatus(WEBLLM_STATUS.LOADING);
    setError(null);
    setProgress(0);

    try {
      // Import dinámico — solo se carga cuando el user pulsa el botón
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

      const engine = await CreateMLCEngine(
       'Llama-3.2-3B-Instruct-q4f16_1-MLC',
        {
          initProgressCallback: (info) => {
            // info.progress va de 0 a 1
            setProgress(Math.round((info.progress || 0) * 100));
          },
        }
      );

      engineRef.current = engine;
      setStatus(WEBLLM_STATUS.READY);
      setProgress(100);
    } catch (err) {
      console.error('[useWebLLM] Error al cargar modelo:', err);
      setError(err.message || 'Error desconocido al cargar el modelo.');
      setStatus(WEBLLM_STATUS.ERROR);
    }
  }, [status]);

  // ─── Cambiar personaje activo ────────────────────────────────────────────
  // Llámalo cuando cambie mode o el personaje dentro del sector.
  // Resetea el historial para que el nuevo personaje no tenga contexto del anterior.

  const cambiarPersonaje = useCallback((personajeKey) => {
    if (personajeActivo.current === personajeKey) return;
    personajeActivo.current = personajeKey;
    historialRef.current = [];
    setRespuesta(null);
  }, []);

  // ─── Enviar mensaje ──────────────────────────────────────────────────────

  const chat = useCallback(async (textoUsuario, personajeKey) => {
    if (!engineRef.current || status !== WEBLLM_STATUS.READY) return;
    if (!textoUsuario.trim()) return;

    // Cambiar personaje si hace falta
    if (personajeKey && personajeKey !== personajeActivo.current) {
      cambiarPersonaje(personajeKey);
    }

    setStatus(WEBLLM_STATUS.CHATTING);
    setRespuesta(null);

    const systemPrompt = construirSystemPrompt(personajeActivo.current || personajeKey || 'lara');

    // Añadir mensaje del user al historial
    historialRef.current.push({ role: 'user', content: textoUsuario });

    // Limitar historial a últimos 10 turnos para no saturar contexto
    if (historialRef.current.length > 20) {
      historialRef.current = historialRef.current.slice(-20);
    }

    try {
      const mensajes = [
        { role: 'system', content: systemPrompt },
        ...historialRef.current,
      ];

      let respuestaCompleta = '';

      // Streaming — se va mostrando mientras genera
      const chunks = await engineRef.current.chat.completions.create({
        messages: mensajes,
        temperature: 0.6,
        max_tokens: 200,
        stream: true,
      });

      for await (const chunk of chunks) {
        const delta = chunk.choices[0]?.delta?.content || '';
        respuestaCompleta += delta;
        setRespuesta(respuestaCompleta);
      }

      // Guardar respuesta en historial
      historialRef.current.push({ role: 'assistant', content: respuestaCompleta });
      setStatus(WEBLLM_STATUS.READY);
      return respuestaCompleta;

    } catch (err) {
      console.error('[useWebLLM] Error en chat:', err);
      setError('Error al generar respuesta.');
      setStatus(WEBLLM_STATUS.ERROR);
    }
  }, [status, cambiarPersonaje]);

  // ─── Reset conversación ──────────────────────────────────────────────────

  const resetChat = useCallback(() => {
    historialRef.current = [];
    setRespuesta(null);
  }, []);

  // ─── Helper para obtener personaje key desde mode + contextData ──────────

  const resolverPersonaje = useCallback((mode, contextData) => {
    const resolver = MODE_A_PERSONAJE[mode];
    return resolver ? resolver(contextData) : null;
  }, []);

  return {
    status,
    progress,
    error,
    respuesta,
    inicializar,
    chat,
    cambiarPersonaje,
    resetChat,
    resolverPersonaje,
    isIdle:     status === WEBLLM_STATUS.IDLE,
    isLoading:  status === WEBLLM_STATUS.LOADING,
    isReady:    status === WEBLLM_STATUS.READY,
    isChatting: status === WEBLLM_STATUS.CHATTING,
    isError:    status === WEBLLM_STATUS.ERROR,
  };
};
