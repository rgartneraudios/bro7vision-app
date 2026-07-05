import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const PC_ID_MAP = {
  solo_o169:  'solo_earth',
  solo_e169:  'solo_cinema',
  oeste169:   'band_earth',
  este169:    'band_cinema',
};

const ANIMALES = ['🦈','🐘','🐞','🦊','🐬','🦁','🐸','🦋','🦅','🐺'];
const GENESIS_ACIERTO = 5;
const GENESIS_FALLO   = 5;
const FALLOS = ['/assets/fallo1.webp', '/assets/fallo2.webp', '/assets/fallo3.webp'];

const getTurnoActual = () => {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return 1;
  if (h >= 11 && h < 17) return 2;
  if (h >= 17 && h < 23) return 3;
  return 4;
};

const getProximoTurnoHora = () => {
  const turnos = [5, 11, 17, 23];
  const h = new Date().getHours();
  const siguiente = turnos.find(t => t > h) ?? 5;
  return `${String(siguiente).padStart(2,'0')}:00`;
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const storageKey = (escenarioId, turno) => `haloTrivia_${escenarioId}_t${turno}`;

export function useHaloTrivia({ escenarioId, userId, onGenesisUpdate }) {
  const escenarioNormalizado = PC_ID_MAP[escenarioId] || escenarioId;
  const turno = getTurnoActual();
  const yaJugado = !!localStorage.getItem(storageKey(escenarioNormalizado, turno));

  const [preguntas,     setPreguntas]     = useState([]);
  const [indice,        setIndice]        = useState(0);
  const [resultado,     setResultado]     = useState(null);
  const [cooldown,      setCooldown]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [completado,    setCompletado]    = useState(yaJugado);
  const [burbujaOpen,   setBurbujaOpen]   = useState(false);
  const [haloActivo,    setHaloActivo]    = useState(null);
  const [falloImg,      setFalloImg]      = useState('');

  const cargarSet = useCallback(async () => {
    if (!escenarioId) return;
    setLoading(true);
    setCompletado(false);
    setIndice(0);
    setResultado(null);
    setBurbujaOpen(true);

    let { data } = await supabase
      .from('escenarios_trivia')
      .select('*')
      .eq('escenario_id', escenarioNormalizado)
      .eq('activo', true)
      .limit(20);

    if (!data?.length) {
      const fb = await supabase
        .from('escenarios_trivia')
        .select('*')
        .eq('escenario_id', 'general')
        .eq('activo', true)
        .limit(20);
      data = fb.data || [];
    }

    const set3 = shuffle(data).slice(0, 3).map(p => {
      const animales = shuffle(ANIMALES).slice(0, 3);
      const opciones = shuffle([
        { emoji: animales[0], texto: p.opcion_a, clave: 'a' },
        { emoji: animales[1], texto: p.opcion_b, clave: 'b' },
        { emoji: animales[2], texto: p.opcion_c, clave: 'c' },
      ]);
      const esEco = [p.opcion_a, p.opcion_b, p.opcion_c].some(o => o?.includes('(*)'));
      return { ...p, opciones, esEco };
    });

    setPreguntas(set3);
    setLoading(false);
    setBurbujaOpen(true);
  }, [escenarioNormalizado]);

  const responder = useCallback(async (clave) => {
    if (cooldown || resultado) return;
    const pregunta = preguntas[indice];
    if (!pregunta) return;

    const opcionElegida = pregunta.opciones.find(o => o.clave === clave);
    const textoElegido  = opcionElegida?.texto || '';

    const esAcierto = pregunta.esEco
      ? textoElegido.includes('(*)')
      : clave === pregunta.respuesta_correcta;

    setResultado(esAcierto ? 'acierto' : 'fallo');
    setCooldown(true);
    setHaloActivo(esAcierto ? 'suma' : 'resta');
    if (!esAcierto) setFalloImg(FALLOS[Math.floor(Math.random() * FALLOS.length)]);

    if (userId) {
      const delta = esAcierto ? GENESIS_ACIERTO : -GENESIS_FALLO;
      await supabase.rpc('incrementar_genesis', { uid: userId, delta });
      const { data: perfil } = await supabase
        .from('profiles')
        .select('genesis')
        .eq('id', userId)
        .single();
      if (perfil?.genesis !== undefined) {
        onGenesisUpdate?.(perfil.genesis);
      }
    }

    setTimeout(() => setHaloActivo(null), 6000);

    setTimeout(() => {
      setResultado(null);
      setCooldown(false);
      if (indice + 1 >= preguntas.length) {
        localStorage.setItem(storageKey(escenarioNormalizado, turno), '1');
        setCompletado(true);
        setBurbujaOpen(false);
      } else {
        setIndice(i => i + 1);
      }
    }, 3000);
  }, [cooldown, resultado, preguntas, indice, userId, escenarioNormalizado, turno, onGenesisUpdate]);

  return {
    preguntaActual: preguntas[indice] || null,
    indice,
    total:    preguntas.length,
    resultado,
    cooldown,
    loading,
    completado,
    burbujaOpen, setBurbujaOpen,
    haloActivo,  falloImg,
    proximoTurno: getProximoTurnoHora(),
    cargarSet,
    responder,
  };
}