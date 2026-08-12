import { supabase } from '../../supabaseClient';

const PERSONAJE_IDS = [
  'tito','lara','puffo','evelyn','larry','isabella',
  'profesor','mapache','ami','smisterio','jaguar','orumama','nova','rumores'
];

export const INSTRUCCION_BUSCAR = `
Cuando un usuario mencione algo que no reconoces y muestre que sabe más detalles, 
no improvises ni inventes nada. 
Responde única y exclusivamente con: BUSCAR:[termino1],[termino2],[termino3]
Sin texto adicional. Sin explicación. Sin puntuación extra.
Ejemplo: BUSCAR:nova,smisterio,siberia`;

export async function fetchHistoriaNodos(terminos) {
  const personajesBuscados = terminos.filter(t => PERSONAJE_IDS.includes(t));
  const keywordsBuscadas   = terminos.filter(t => !PERSONAJE_IDS.includes(t));

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