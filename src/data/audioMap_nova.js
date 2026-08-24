// src/data/audioMap_nova.js

export const NOVA_AUDIO_MAP = {

  // GLOBAL
  "global":  "https://media.bro7vision.com/band/nova_001.m4a",

  // NACIONAL
  "espana":    "https://media.bro7vision.com/band/nova_001.m4a",
  "mexico":    "https://media.bro7vision.com/band/nova_001.m4a",
  "argentina": "https://media.bro7vision.com/band/nova_001.m4a",
  "colombia":  "https://media.bro7vision.com/band/nova_001.m4a",
  "chile":     "https://media.bro7vision.com/band/nova_001.m4a",
  "peru":      "https://media.bro7vision.com/band/nova_001.m4a",
  "venezuela": "https://media.bro7vision.com/band/nova_001.m4a",
  "ecuador":   "https://media.bro7vision.com/band/nova_001.m4a",
  "uruguay":   "https://media.bro7vision.com/band/nova_001.m4a",

  // GRAN REGIÓN
  "pais_vasco":    "https://media.bro7vision.com/band/nova_001.m4a",
  "cataluna":      "https://media.bro7vision.com/band/nova_001.m4a",
  "andalucia":     "https://media.bro7vision.com/band/nova_001.m4a",
  "canarias":      "https://media.bro7vision.com/band/nova_001.m4a",
  "c_valenciana":  "https://media.bro7vision.com/band/nova_001.m4a",
  "c_alicante":     "https://media.bro7vision.com/band/nova_001.m4a",
  "castilla_leon": "https://media.bro7vision.com/band/nova_001.m4a",
  "c_madrid":      "https://media.bro7vision.com/band/nova_001.m4a",

  // REGIÓN
  "asturias":           "https://media.bro7vision.com/band/nova_001.m4a",
  "galicia":            "https://media.bro7vision.com/band/nova_001.m4a",
  "cantabria":          "https://media.bro7vision.com/band/nova_001.m4a",
  "aragon":             "https://media.bro7vision.com/band/nova_001.m4a",
  "castilla_la_mancha": "https://media.bro7vision.com/band/nova_001.m4a",
  "zona_oeste":         "https://media.bro7vision.com/band/nova_001.m4a",
  "baleares":           "https://media.bro7vision.com/band/nova_001.m4a",
  "ceuta_melilla":      "https://media.bro7vision.com/band/nova_001.m4a",
  "region_murcia":  "https://media.bro7vision.com/band/nova_001.m4a",
  "navarra":            "https://media.bro7vision.com/band/nova_001.m4a",
  "la_rioja":           "https://media.bro7vision.com/band/nova_001.m4a",

  // GRAN CIUDAD
  "madrid":    "https://media.bro7vision.com/band/nova_001.m4a",
  "barcelona": "https://media.bro7vision.com/band/nova_001.m4a",
  "sevilla":   "https://media.bro7vision.com/band/nova_001.m4a",
  "valencia":  "https://media.bro7vision.com/band/nova_001.m4a",
  "bilbao":    "https://media.bro7vision.com/band/nova_001.m4a",

  // CIUDAD
  "gijon":                   "https://media.bro7vision.com/band/nova_001.m4a",
  "oviedo":                  "https://media.bro7vision.com/band/nova_001.m4a",
  "aviles":                  "https://media.bro7vision.com/band/nova_001.m4a",
  "siero":                   "https://media.bro7vision.com/band/nova_001.m4a",
  "vigo":                    "https://media.bro7vision.com/band/nova_001.m4a",
  "a_coruna":                "https://media.bro7vision.com/band/nova_001.m4a",
  "santiago_de_compostela":  "https://media.bro7vision.com/band/nova_001.m4a",
  "pontevedra":              "https://media.bro7vision.com/band/nova_001.m4a",
  "santander":               "https://media.bro7vision.com/band/nova_001.m4a",
  "zaragoza":                "https://media.bro7vision.com/band/nova_001.m4a",
  "huesca":                  "https://media.bro7vision.com/band/nova_001.m4a",
  "logrono":                 "https://media.bro7vision.com/band/nova_001.m4a",
  "pamplona":                "https://media.bro7vision.com/band/nova_001.m4a",
  "palma":                   "https://media.bro7vision.com/band/nova_001.m4a",
  "ibiza":                   "https://media.bro7vision.com/band/nova_001.m4a",
  "las_palmas_de_gran_canaria": "https://media.bro7vision.com/band/nova_001.m4a",
  "santa_cruz_de_tenerife":  "https://media.bro7vision.com/band/nova_001.m4a",
  "murcia":                  "https://media.bro7vision.com/band/nova_001.m4a",
  "alicante":                "https://media.bro7vision.com/band/nova_001.m4a",
  "cordoba":                 "https://media.bro7vision.com/band/nova_001.m4a",
  "granada":                 "https://media.bro7vision.com/band/nova_001.m4a",
  "malaga":                  "https://media.bro7vision.com/band/nova_001.m4a",
  "toledo":                  "https://media.bro7vision.com/band/nova_001.m4a",
  "salamanca":               "https://media.bro7vision.com/band/nova_001.m4a",
  "valladolid":              "https://media.bro7vision.com/band/nova_001.m4a",

  // FALLBACK
  "default": "https://media.bro7vision.com/band/nova_001.m4a"
};

const CIUDAD_A_REGION = {
  "murcia":   "region_murcia",
  "alicante": "c_alicante",
  "gijon": "asturias", "oviedo": "asturias", "aviles": "asturias", "siero": "asturias",
  "vigo": "galicia", "a_coruna": "galicia", "santiago_de_compostela": "galicia",
  "pontevedra": "galicia",
  "santander": "cantabria",
  "zaragoza": "aragon", "huesca": "aragon",
  "logrono": "la_rioja",
  "pamplona": "navarra",
  "palma": "baleares", "ibiza": "baleares",
  "las_palmas_de_gran_canaria": "canarias", "santa_cruz_de_tenerife": "canarias",
  "cordoba": "andalucia", "granada": "andalucia", "malaga": "andalucia",
  "toledo": "castilla_la_mancha",
  "salamanca": "castilla_leon", "valladolid": "castilla_leon",
};

const REGION_A_GRAN_REGION = {
  "region_murcia": null,
  "c_alicante":    "c_valenciana",
  "asturias": null,
  "galicia": null,
  "cantabria": null,
  "aragon": null,
  "castilla_la_mancha": null,
  "zona_oeste": null,
  "baleares": null,
  "ceuta_melilla": null,
  "navarra": null,
  "la_rioja": null,
  "murcia": null,
  "andalucia": "andalucia",
  "castilla_leon": "castilla_leon",
  "canarias": "canarias",
};

export const getAudioForNova = (locationScope) => {
  if (!locationScope) return NOVA_AUDIO_MAP["global"];

  const normalize = (str) =>
    str?.toLowerCase().trim().replace(/ /g, "_")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? null;

  const ciudad = normalize(locationScope.city);
  const pais   = normalize(locationScope.country);

  // 1. Ciudad exacta
  if (ciudad && NOVA_AUDIO_MAP[ciudad]) return NOVA_AUDIO_MAP[ciudad];

  // 2. Región de esa ciudad
  const region = CIUDAD_A_REGION[ciudad];
  if (region && NOVA_AUDIO_MAP[region]) return NOVA_AUDIO_MAP[region];

  // 3. Gran Región
  const granRegion = REGION_A_GRAN_REGION[region];
  if (granRegion && NOVA_AUDIO_MAP[granRegion]) return NOVA_AUDIO_MAP[granRegion];

  // 4. Nacional
  if (pais && NOVA_AUDIO_MAP[pais]) return NOVA_AUDIO_MAP[pais];

  // 5. Global
  return NOVA_AUDIO_MAP["global"];
};