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
  const t = textoUsuario
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');

  const SALUDOS_VACIOS = [
    'hola','buenas','hey','ey','hi','hello','saludos','gracias',
    'ok','vale','genial','perfecto','bien','claro','que','como',
    'estas','eres','ola','pues','nada','algo'
  ];

  const palabras = t.split(/\s+/).filter(p => p.length > 2);

  const soloTrivial = palabras.every(p =>
    SALUDOS_VACIOS.includes(p) || PERSONAJE_IDS.includes(p)
  );
  if (soloTrivial || palabras.length === 0) return null;

  const personajesBuscados = palabras.filter(p => PERSONAJE_IDS.includes(p));
  const keywordsBuscadas   = palabras.filter(p =>
    !PERSONAJE_IDS.includes(p) && !SALUDOS_VACIOS.includes(p) && p.length > 3
  );

  if (personajesBuscados.length === 0 && keywordsBuscadas.length === 0) return null;

  let query = supabase
    .from('historia_nodos')
    .select('descripcion')
    .eq('activo', true);

  if (personajesBuscados.length > 0)
    query = query.filter('personajes', 'ov', `{${personajesBuscados.join(',')}}`);

  if (keywordsBuscadas.length > 0)
    query = query.filter('keywords', 'ov', `{${keywordsBuscadas.join(',')}}`);

  const { data } = await query.limit(1).maybeSingle();
  return data?.descripcion ?? null;
}