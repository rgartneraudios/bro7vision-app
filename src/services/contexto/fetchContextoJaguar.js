// src/services/contexto/fetchContextoJaguar.js

import { supabase } from '../../supabaseClient';

function resolverPromoGeo(data, ciudadCodigo) {
  if (ciudadCodigo && data.promo_ciudad)  return data.promo_ciudad;
  if (data.promo_mundial)                 return data.promo_mundial;
  if (data.promo_nacional)                return data.promo_nacional;
  if (data.promo_metropolis)              return data.promo_metropolis;
  if (data.promo_gran_regional)           return data.promo_gran_regional;
  if (data.promo_regional)                return data.promo_regional;
  return null;
}

export async function fetchContextoJaguar(ciudadCodigo = null) {
  try {
    const { data, error } = await supabase
      .from('personaje_update')
      .select(`
        vivencia_actual,
        estado_animo,
        promo_ciudad,
        promo_regional,
        promo_gran_regional,
        promo_metropolis,
        promo_nacional,
        promo_mundial,
        special_texto,
        special_codigo,
        special_stock,
        special_activo
      `)
      .eq('personaje_id', 'jaguar')
      .single();

    if (error || !data) return null;

    const promoGeo = resolverPromoGeo(data, ciudadCodigo);

    return {
      vivencia:      data.vivencia_actual || null,
      estadoAnimo:   data.estado_animo    || null,
      promoGeo:      promoGeo             || null,
      esPatrocinado: !!promoGeo,
      special: data.special_activo && (data.special_stock ?? 0) > 0 ? {
        texto:  data.special_texto,
        codigo: data.special_codigo,
        stock:  data.special_stock,
      } : null,
    };
  } catch {
    return null;
  }
}