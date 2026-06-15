import { RADIO_CHANNELS_DB } from '../data/RadioChannels';

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

  const roles = Array.isArray ? true : false; // helper inline abajo

  const musica = realItems.filter(item => {
    const role = Array.isArray(item.role) ? item.role : [item.role];
    return (role.includes('music') || item.audio_url) && item.bro_mus;
  });

  const podcasts = realItems.filter(item => {
    const role = Array.isArray(item.role) ? item.role : [item.role];
    return (role.includes('talk') || item.audio_url) && item.bro_aud;
  });

  const lineasMusica = musica.map(c =>
    `- [MUS:${c.bro_mus}] ${c.alias || ''} | ${c.biz_category || 'Música'} | ${c.description || ''}`
  );

  const lineasPodcast = podcasts.map(c =>
    `- [AUD:${c.bro_aud}] ${c.alias || ''} | ${c.biz_category || 'Podcast'} | ${c.description || ''}`
  );

  const resultado = [...lineasMusica, ...lineasPodcast];
  return resultado.length > 0 ? resultado.join('\n') : 'La radio está en silencio absoluto hoy.';
};