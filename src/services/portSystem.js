import { RADIO_CHANNELS_DB } from '../data/RadioChannels';

export const armarSobreNova = (contextData, realItems) => {
  return {}; 
};

// Catálogo A — canales fijos BroVision (BroTuner)
export const armarCatalogoTuner = () => {
  return RADIO_CHANNELS_DB.map(c =>
    `- [ID: ${c.id}] ${c.name} | Género: ${c.genre}`
  ).join('\n');
};

// Catálogo B — audios subidos por creadores (BroLives)
export const armarSobreMapache = (realItems) => {
  if (!realItems || realItems.length === 0)
    return 'Sin canales activos hoy.';

  const canales = realItems.filter(item => {
    const role = item.role;
    const tieneRolMusic = Array.isArray(role) 
      ? role.includes('music') 
      : role === 'music';
    return tieneRolMusic || item.audio_file || item.video_file;
  });

  if (canales.length === 0) return 'La radio está en silencio absoluto hoy.';

  return canales.map(c =>
    `- [ID: ${c.bro_id || c.id}] ${c.alias || ''} | ${c.biz_category || c.biz_profession || 'Música/Live'} | ${c.description || c.nearby_ref || ''}`
  ).join('\n');
};