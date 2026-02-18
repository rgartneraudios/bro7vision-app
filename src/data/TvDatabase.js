// src/data/TvDatabase.js

export const TV_NODES = [
  {
    id: 'tv_mux',
    alias: 'CANAL DE PRUEBA (HD)',
    video_file: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    is_tv: true
  },
  {
    id: 'tv_telesur',
    alias: 'TELESUR',
    video_file: 'https://telesur.blustream.tv/live/telesur/playlist.m3u8',
    is_tv: true
  },
  {
    id: 'tv_rt_doc',
    alias: 'RT DOCUMENTARY',
    video_file: 'https://rt-esp.akamaized.net/hls/live/2014741/rtesp/master.m3u8',
    is_tv: true
  },
  {
    id: 'tv_sin_filtros',
    alias: 'SIN FILTROS TV',
    video_file: 'https://mpro-live.shoutca.st/live/sf.m3u8',
    is_tv: true
  }
];