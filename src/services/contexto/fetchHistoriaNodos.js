import { supabase } from '../../supabaseClient';

const PERSONAJE_IDS = [
  'tito','lara','puffo','evelyn','larry','isabella',
  'profesor','mapache','ami','smisterio','jaguar','orumama','nova','rumores'
];

export async function fetchHistoriaNodos(terminos) {
  const normalized = terminos
    .flatMap(t => t.toLowerCase().split('.'))
    .map(t => t.trim())
    .filter(Boolean);

  const personajesBuscados = normalized.filter(t => PERSONAJE_IDS.includes(t));
  const keywordsBuscadas   = normalized.filter(t => !PERSONAJE_IDS.includes(t));

  let query = supabase
    .from('historia_nodos')
    .select('descripcion')
    .eq('activo', true);

  if (personajesBuscados.length > 0)
    query = query.overlaps('personajes', personajesBuscados);

  if (keywordsBuscadas.length > 0)
    query = query.overlaps('keywords', keywordsBuscadas);

  const { data } = await query.limit(1).maybeSingle();
  return data?.descripcion ?? null;
}

export async function buscarNodosRelevantes(textoUsuario) {
  const PALABRAS_VACIAS = [
    'hola','buenas','hey','ey','hi','hello','buenas','saludos',
    'gracias','ok','vale','genial','perfecto','bien','claro',
    'rumores','tito','lara','puffo','nova','jaguar','evelyn',
    'larry','isabella','profesor','mapache','ami','smisterio','orumama'
  ];

  const palabras = textoUsuario
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(p => p.length > 3 && !PALABRAS_VACIAS.includes(p));

  if (palabras.length === 0) return null;

  const personajesBuscados = palabras.filter(p => PERSONAJE_IDS.includes(p));
  const keywordsBuscadas   = palabras.filter(p => !PERSONAJE_IDS.includes(p));

  let query = supabase
    .from('historia_nodos')
    .select('descripcion')
    .eq('activo', true);

  if (personajesBuscados.length > 0) {
    query = query.contains('personajes', personajesBuscados);
  } else if (keywordsBuscadas.length > 0) {
    query = query.contains('keywords', keywordsBuscadas);
  } else {
    return null;
  }

  const { data } = await query.limit(1).maybeSingle();
  return data?.descripcion ?? null;
}