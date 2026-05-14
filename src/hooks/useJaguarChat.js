// src/hooks/useJaguarChat.js
// Hook exclusivo de Jaguar. Nadie más lo usa.

import { useState, useRef } from 'react';
import { promptJaguar } from '../data/jaguar/promptJaguar';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

const HISTORIA_KEYWORDS_JAGUAR = {
  // mitos PRIMERO — antes que signos simples para evitar substring conflict
  aries_mito:       ['aries mito', 'aries mitologia', 'aries mitología'],
  tauro_mito:       ['tauro mito', 'tauro mitologia', 'tauro mitología'],
  geminis_mito:     ['geminis mito', 'géminis mito', 'geminis mitologia'],
  cancer_mito:      ['cancer mito', 'cáncer mito', 'cancer mitologia'],
  leo_mito:         ['leo mito', 'leo mitologia', 'leo mitología'],
  virgo_mito:       ['virgo mito', 'virgo mitologia'],
  libra_mito:       ['libra mito', 'libra mitologia'],
  escorpio_mito:    ['escorpio mito', 'escorpio mitologia'],
  ofiuco_mito:      ['ofiuco mito', 'ofiuco mitologia'],
  sagitario_mito:   ['sagitario mito', 'sagitario mitologia'],
  capricornio_mito: ['capricornio mito', 'capricornio mitologia'],
  acuario_mito:     ['acuario mito', 'acuario mitologia'],
  piscis_mito:      ['piscis mito', 'piscis mitologia'],
  // amazonas
  amazonas:         ['cuentos del amazonas', 'amazonas'],
  // signos simples DESPUÉS
  aries:       ['aries'],
  tauro:       ['tauro'],
  geminis:     ['geminis', 'géminis'],
  cancer:      ['cancer', 'cáncer'],
  leo:         ['leo'],
  virgo:       ['virgo'],
  libra:       ['libra'],
  escorpio:    ['escorpio'],
  ofiuco:      ['ofiuco'],
  sagitario:   ['sagitario'],
  capricornio: ['capricornio'],
  acuario:     ['acuario'],
  piscis:      ['piscis'],
};

const HANDOFF_KEYWORDS_JAGUAR = {
  smisterio: ['misterio', 'smisterio'],
  orumama:   ['orumama', 'hierba', 'hierbas', 'planta', 'plantas', 'remedio', 'brebaje'],
  osos:      ['salir', 'volver', 'osos', 'inicio', 'recepción', 'recepcion'],
};

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function detectarTema(texto) {
  const t = norm(texto);
  for (const [tema, keys] of Object.entries(HISTORIA_KEYWORDS_JAGUAR)) {
    if (keys.some(k => t.includes(norm(k)))) return tema;
  }
  return null;
}

function detectarHandoff(texto) {
  const t = norm(texto);
  for (const [destino, keys] of Object.entries(HANDOFF_KEYWORDS_JAGUAR)) {
    if (keys.some(k => t.includes(k))) return destino;
  }
  return null;
}

function detectarFecha(texto) {
  const m = texto.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})|(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  return m ? m[0] : null;
}

export function useJaguarChat({ iaMode, isAdmin, onBotContent, onHandoff }) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [temaEnEspera, setTemaEnEspera] = useState(null);
  const historiasContadasRef           = useRef({});

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  // ── Interpreta línea SISTEMA: que reporta la IA ──────────────────────────
  const interpretarSistema = (intencion) => {
    const t = norm(intencion);

    // Handoff
    for (const [destino, keys] of Object.entries(HANDOFF_KEYWORDS_JAGUAR)) {
      if (keys.some(k => t.includes(k))) {
        setTimeout(() => onHandoff?.(destino), 2500);
        return;
      }
    }

    // Contenido — mitos PRIMERO
    for (const [tema, keys] of Object.entries(HISTORIA_KEYWORDS_JAGUAR)) {
      if (keys.some(k => t.includes(norm(k)))) {
        const esSaga = tema === 'amazonas';
        if (esSaga) {
          const yaContadas = historiasContadasRef.current['amazonas'] || 0;
          const saga = ['amazonas_1', 'amazonas_2'];
          const temaResuelto = saga[Math.min(yaContadas, saga.length - 1)];
          historiasContadasRef.current = { ...historiasContadasRef.current, amazonas: yaContadas + 1 };
          onBotContent?.(temaResuelto);
        } else {
          onBotContent?.(tema);
        }
        return;
      }
    }
  };

  // ── Envío IA ──────────────────────────────────────────────────────────────
  const enviarIA = async (textoUsuario) => {
    if (!textoUsuario?.trim()) return;
    setLoading(true);
    try {
      const system = promptJaguar();
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
      const respuestaCompleta = data?.texto || '...';

      const lineaSistema = respuestaCompleta
        .split('\n')
        .find(l => l.trim().startsWith('SISTEMA:'));

      const mensajeUser = respuestaCompleta
        .replace(lineaSistema || '', '')
        .replace(/\*\*/g, '')
        .trim();

      const intencion = lineaSistema
        ? lineaSistema.replace('SISTEMA:', '').trim()
        : 'CONTINUA';

      if (intencion && intencion !== 'CONTINUA') {
        interpretarSistema(intencion);
      }

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeUser);
      setMensaje(mensajeUser);

    } catch (err) {
      console.error('useJaguarChat error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  // ── Entrada principal — Bot e IA ──────────────────────────────────────────
  const enviar = (textoUsuario, { calcularSignoSideral, FRASES_CONFIRMO, FRASES_HANDOFF, setCurrentMsg, elegir } = {}) => {
    if (!textoUsuario?.trim()) return;
    const t = norm(textoUsuario);

    // 1. Handoff — siempre, Bot e IA
    const destino = detectarHandoff(textoUsuario);
    if (destino) {
      setCurrentMsg?.(elegir?.(FRASES_HANDOFF?.[destino]) || '...');
      setTimeout(() => onHandoff?.(destino), 2500);
      return;
    }

    // 2. CONFIRMO + tema en espera
    if (t.includes('confirmo') && temaEnEspera) {
      if (iaActiva) {
        onBotContent?.(temaEnEspera);
        setTemaEnEspera(null);
      } else {
        onBotContent?.(temaEnEspera);
        setTemaEnEspera(null);
      }
      return;
    }

    // 3. Fecha de nacimiento
    const fecha = detectarFecha(textoUsuario);
    if (fecha && calcularSignoSideral) {
      const signo = calcularSignoSideral(fecha);
      if (signo && signo !== 'desconocido') {
        setTemaEnEspera(signo);
        setCurrentMsg?.(`Las estrellas lo revelan hermano... tu signo sideral es ${signo.toUpperCase()}. Escribe CONFIRMO y te cuento la frecuencia. 🐯`);
        return;
      }
    }

    // 4. Detectar tema
    const tema = detectarTema(textoUsuario);
    if (tema) {
      if (iaActiva) {
        enviarIA(textoUsuario);
      } else {
        // Modo Bot
        const esMito = tema.endsWith('_mito');
        if (esMito) {
          setCurrentMsg?.('Hermanos! Los mitos te iluminan en modo IA 🐯');
          return;
        }
        if (tema === 'amazonas') {
          setCurrentMsg?.('Los cuentos te traerán plenitud a tu alma, es un concentrado en modo IA para el despertar 🐯');
          return;
        }
        // Signo normal → CONFIRMO
        if (FRASES_CONFIRMO?.[tema]) {
          setTemaEnEspera(tema);
          setCurrentMsg?.(FRASES_CONFIRMO[tema]);
        }
      }
      return;
    }

    // 5. Modo IA → conversar
    if (iaActiva) {
      enviarIA(textoUsuario);
      return;
    }

    // 6. Fallback Bot — el Banner maneja el fallback
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setTemaEnEspera(null);
    historiasContadasRef.current = {};
  };

  return { mensaje, loading, enviar, reset, iaActiva, temaEnEspera };
}
