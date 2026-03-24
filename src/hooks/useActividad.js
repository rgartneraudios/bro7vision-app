// src/hooks/useActividad.js
import { supabase } from '../supabaseClient';

/**
 * Marca una actividad mensual del usuario en la tabla profiles.
 * Se llama desde cualquier componente cuando ocurre la acción.
 *
 * @param {'video' | 'activo' | 'games' | 'brostory'} tipo
 *
 * Uso:
 *   import { marcarActividad } from '../hooks/useActividad';
 *   await marcarActividad('video');
 */
export async function marcarActividad(tipo) {
  const camposValidos = ['actividad_video', 'actividad_activo', 'actividad_games', 'actividad_brostory'];
  const campo = `actividad_${tipo}`;

  if (!camposValidos.includes(campo)) {
    console.warn(`[marcarActividad] tipo desconocido: ${tipo}`);
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ [campo]: true })
      .eq('id', user.id);

    if (error) {
      console.error(`[marcarActividad] Error al marcar ${campo}:`, error.message);
    } else {
      console.log(`[marcarActividad] ✅ ${campo} marcado como true`);
    }
  } catch (err) {
    console.error('[marcarActividad] Error inesperado:', err);
  }
}
