// src/data/TvDatabase.js - ACTUALIZADO CON CANALES QUE FUNCIONAN

export const TV_NODES = [
  {
    id: 'tv_mux',
    alias: 'CANAL DE PRUEBA (HD)',
    video_file: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    is_tv: true
  },
  {
    id: 'tv_dw',
    alias: 'DEUTSCHE WELLE',
    video_file: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    is_tv: true
  },
  {
    id: 'tv_telesur',
    alias: 'TELESUR (LATAM)',
    video_file: 'https://telesur.blustream.tv/live/telesur/playlist.m3u8',
    is_tv: true
  },
  {
    id: 'tv_rt_esp',
    alias: 'RT EN ESPAÑOL',
    video_file: 'https://rt-esp.akamaized.net/hls/live/2014741/rtesp/master.m3u8',
    is_tv: true
  },
  {
    id: 'tv_canal26',
    alias: 'CANAL 26 ARGENTINA',
    video_file: 'https://live-01-02-canal26.cdn.mmsky.tv/canal26/live.m3u8',
    is_tv: true
  },
  {
    id: 'tv_mil_news',
    alias: 'MILENIO NOTICIAS',
    video_file: 'https://milenio-tv.pdtv.live/milenio/index.m3u8',
    is_tv: true
  }
];