// src/hooks/useHonorRoll.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Orden jerárquico del reino
export const RANK_ORDER = ['rey', 'principe', 'duque', 'marques', 'conde', 'lord'];

// Génesis mensuales por rango
export const GENESIS_POR_RANK = {
  rey:      2000,
  principe: 1000,
  duque:    500,
  marques:  300,
  conde:    200,
  lord:     100,
};

// Tratamiento según rank y género
export function getTratamiento(rank, genero) {
  const tabla = {
    rey:      { m: 'Excelentísimo',  f: 'Excelentísima',  n: 'Excelentísimos' },
    principe: { m: 'Altísimo',       f: 'Altísima',       n: 'Altísimos' },
    duque:    { m: 'Ilustrísimo',    f: 'Ilustrísima',    n: 'Ilustrísimos' },
    marques:  { m: 'Magnificísimo',  f: 'Magnificísima',  n: 'Magnificísimos' },
    conde:    { m: 'Honorable',      f: 'Honorable',      n: 'Honorables' },
    lord:     { m: 'Lord',           f: 'Lady',           n: 'Lords/Ladies' },
  };
  return tabla[rank]?.[genero] ?? tabla[rank]?.n ?? '';
}

// Título compuesto: "Rey de Solaris", "Reina de Lunaris"…
export function getTituloCompuesto(rank, genero, reino) {
  const nombres = {
    rey:      { m: 'Rey',      f: 'Reina',    n: 'Rey/Reina' },
    principe: { m: 'Príncipe', f: 'Princesa', n: 'Príncipe/a' },
    duque:    { m: 'Duque',    f: 'Duquesa',  n: 'Duque/a' },
    marques:  { m: 'Marqués',  f: 'Marquesa', n: 'Marqués/a' },
    conde:    { m: 'Conde',    f: 'Condesa',  n: 'Conde/a' },
    lord:     { m: 'Lord',     f: 'Lady',     n: 'Lord/Lady' },
  };
  const titulo = nombres[rank]?.[genero] ?? nombres[rank]?.n ?? rank;
  return reino ? `${titulo} de ${reino}` : titulo;
}

export function useHonorRoll() {
  const [porRank, setPorRank] = useState({
    rey: [], principe: [], duque: [], marques: [], conde: [], lord: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function fetchHonorRoll() {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('profiles')
        .select('alias, rank, reino, genero')
        .not('rank', 'is', null)
        .order('created_at', { ascending: true });

      if (sbError) {
        setError(sbError.message);
        setLoading(false);
        return;
      }

      const agrupado = {
        rey: [], principe: [], duque: [], marques: [], conde: [], lord: [],
      };

      data?.forEach((profile) => {
        const r = profile.rank;
        if (agrupado[r] !== undefined) {
          agrupado[r].push({
            alias:       profile.alias  ?? 'Ciudadano',
            reino:       profile.reino  ?? null,
            genero:      profile.genero ?? 'n',
            tratamiento: getTratamiento(r, profile.genero ?? 'n'),
            titulo:      getTituloCompuesto(r, profile.genero ?? 'n', profile.reino),
          });
        }
      });

      setPorRank(agrupado);
      setLoading(false);
    }

    fetchHonorRoll();
  }, []);

  return { porRank, loading, error };
}
