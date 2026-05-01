// src/data/citycodes.js
// ═══════════════════════════════════════════════════════════════
// CÓDIGOS DE CIUDAD — SISTEMA DE PUBLICIDAD REALITY / BACKSTAGE
// ═══════════════════════════════════════════════════════════════
//
// NOMENCLATURA DE ARCHIVO:
//   [CANAL]_[FASE][TURNO][DISPOSITIVO]_[CÓDIGO].mp4
//
//   CANAL:       1 dígito  → ver CHANNELS
//   FASE:        1 dígito  → 0=SinFase(base) 1=Nova 2=Creciente 3=Plena 4=Menguante
//   TURNO:       1 dígito  → 0=SinTurno(base Moon) 1=05-11h 2=11-17h 3=17-23h 4=23-05h
//   DISPOSITIVO: 1 dígito  → 0=PC 1=Móvil
//   CÓDIGO:      3 dígitos → 000=Base 300=Nacional 404=Internacional 001-158=Ciudad
//
// ── VÍDEOS BASE (permanentes, sin contrato) ──────────────────────
//
//   Resto de canales (1,3–9):
//     Fase=0, Turno=1–4, Código=000
//     1_010_000.mp4  → ChannelOeste, SinFase, Turno1, PC, Base
//     1_020_000.mp4  → ChannelOeste, SinFase, Turno2, PC, Base
//     9_030_000.mp4  → Band Cinema,  SinFase, Turno3, PC, Base
//
//   ChannelMoon (canal 2):
//     Fase=1–4, Turno=0, Código=000
//     2_100_000.mp4  → ChannelMoon, Fase1(Nova),      SinTurno, PC, Base
//     2_200_000.mp4  → ChannelMoon, Fase2(Creciente), SinTurno, PC, Base
//     2_300_000.mp4  → ChannelMoon, Fase3(Plena),     SinTurno, PC, Base
//     2_400_000.mp4  → ChannelMoon, Fase4(Menguante), SinTurno, PC, Base
//
// ── CONTRATOS (bloquean el base según cobertura) ─────────────────
//
//   Resto de canales — contrato por Fase + Turno:
//     1_120_001.mp4  → ChannelOeste, Fase1(Nova),      Turno2, PC, Madrid
//     1_120_300.mp4  → ChannelOeste, Fase1(Nova),      Turno2, PC, Nacional
//     1_120_404.mp4  → ChannelOeste, Fase1(Nova),      Turno2, PC, Internacional
//
//   ChannelMoon — contrato por Fase + MoonTurno (MT):
//     2_110_001.mp4  → ChannelMoon, Fase1(Nova), MT1, PC, Madrid
//     2_120_300.mp4  → ChannelMoon, Fase1(Nova), MT2, PC, Nacional
//     2_130_404.mp4  → ChannelMoon, Fase1(Nova), MT3, PC, Internacional
//
// ── PRIORIDAD DE EMISIÓN ─────────────────────────────────────────
//   404 (Internacional) → bloquea todo en ese slot
//   300 (Nacional)      → bloquea todos los locales
//   001–158 (Ciudad)    → bloquea solo esa ciudad
//   000 (Base)          → se emite si no hay ningún contrato activo
//
// ── TOTAL VÍDEOS BASE ────────────────────────────────────────────
//   ChannelMoon:  4 fases × 2 dispositivos              =  8 vídeos
//   Resto:        8 canales × 4 turnos × 2 dispositivos = 64 vídeos
//   TOTAL                                               = 72 vídeos
// ═══════════════════════════════════════════════════════════════

// ── Canales ─────────────────────────────────────────────────────
export const CHANNELS = {
  1: "ChannelOeste",
  2: "ChannelMoon",
  3: "ChannelEste",
  4: "Solo Earth",
  5: "Solo Fantasy",
  6: "Solo Cinema",
  7: "Band Earth",
  8: "Band Fantasy",
  9: "Band Cinema",
};

// ── Fases lunares ───────────────────────────────────────────────
export const FASES = {
  0: "Sin Fase (Base)",
  1: "Luna Nueva",
  2: "Luna Creciente",
  3: "Luna Plena",
  4: "Luna Menguante",
};

// ── Turnos ──────────────────────────────────────────────────────
export const TURNOS = {
  0: "Sin Turno (Base Moon)",
  1: "05:00 – 11:00",
  2: "11:00 – 17:00",
  3: "17:00 – 23:00",
  4: "23:00 – 05:00",
};

// ── Códigos especiales ──────────────────────────────────────────
export const CODIGO_BASE          = "000"; // Video base, sin contrato
export const COBERTURA_NACIONAL   = "300"; // Contrato Nacional
export const COBERTURA_INTERNACIONAL = "404"; // Contrato Internacional

// ── Ciudad → Código ─────────────────────────────────────────────
export const cityToCode = {

  // Comunidad de Madrid
  "madrid":                     "001",
  "mostoles":                   "002",
  "alcala_de_henares":          "003",
  "fuenlabrada":                "004",
  "leganes":                    "005",
  "getafe":                     "006",
  "alcorcon":                   "007",
  "torrejon_de_ardoz":          "008",
  "parla":                      "009",
  "alcobendas":                 "010",
  "las_rozas_de_madrid":        "011",
  "san_sebastian_de_los_reyes": "012",
  "rivas_vaciamadrid":          "013",
  "pozuelo_de_alarcon":         "014",
  "coslada":                    "015",
  "valdemoro":                  "016",
  "majadahonda":                "017",
  "collado_villalba":           "018",
  "aranjuez":                   "019",
  "boadilla_del_monte":         "020",
  "arganda_del_rey":            "021",
  "pinto":                      "022",
  "colmenar_viejo":             "023",

  // Cataluña
  "barcelona":                  "024",
  "l_hospitalet_de_llobregat":  "025",
  "terrassa":                   "026",
  "badalona":                   "027",
  "sabadell":                   "028",
  "lleida":                     "029",
  "tarragona":                  "030",
  "manresa":                    "031",
  "mataro":                     "032",
  "santa_coloma_de_gramenet":   "033",
  "reus":                       "034",
  "girona":                     "035",
  "sant_cugat_del_valles":      "036",
  "cornella_de_llobregat":      "037",
  "sant_boi_de_llobregat":      "038",
  "rubi":                       "039",
  "vilanova_i_la_geltru":       "040",
  "castelldefels":              "041",
  "viladecans":                 "042",
  "el_prat_de_llobregat":       "043",
  "granollers":                 "044",
  "cerdanyola_del_valles":      "045",
  "mollet_del_valles":          "046",
  "calella":                    "047",

  // Comunidad Valenciana
  "valencia":                   "048",
  "castellon_de_la_plana":      "049",
  "torrent":                    "050",
  "orihuela":                   "051",
  "gandia":                     "052",
  "paterna":                    "053",
  "sagunto":                    "054",
  "vila_real":                  "055",
  "alicante":                   "056",
  "elche":                      "057",
  "torrevieja":                 "058",
  "benidorm":                   "059",
  "alcoy":                      "060",
  "san_vicente_del_raspeig":    "061",
  "elda":                       "062",
  "denia":                      "063",

  // Andalucía
  "sevilla":                    "064",
  "malaga":                     "065",
  "cordoba":                    "066",
  "granada":                    "067",
  "jerez_de_la_frontera":       "068",
  "almeria":                    "069",
  "huelva":                     "070",
  "marbella":                   "071",
  "dos_hermanas":               "072",
  "algeciras":                  "073",
  "cadiz":                      "074",
  "jaen":                       "075",
  "roquetas_de_mar":            "076",
  "san_fernando":               "077",
  "el_puerto_de_santa_maria":   "078",
  "chiclana_de_la_frontera":    "079",
  "el_ejido":                   "080",
  "fuengirola":                 "081",
  "velez_malaga":               "082",
  "alcala_de_guadaira":         "083",
  "torremolinos":               "084",
  "estepona":                   "085",
  "benalmadena":                "086",
  "sanlucar_de_barrameda":      "087",
  "linares":                    "088",
  "la_linea_de_la_concepcion":  "089",
  "motril":                     "090",
  "utrera":                     "091",
  "mijas":                      "092",

  // Región de Murcia
  "murcia":                     "093",
  "cartagena":                  "094",
  "lorca":                      "095",
  "molina_de_segura":           "096",

  // País Vasco
  "bilbao":                     "097",
  "vitoria_gasteiz":            "098",
  "san_sebastian":              "099",
  "barakaldo":                  "100",
  "getxo":                      "101",
  "irun":                       "102",
  "portugalete":                "103",
  "santurtzi":                  "104",
  "basauri":                    "105",

  // Asturias
  "gijon":                      "106",
  "oviedo":                     "107",
  "aviles":                     "108",
  "siero":                      "109",

  // Galicia
  "vigo":                       "110",
  "a_coruna":                   "111",
  "ourense":                    "112",
  "lugo":                       "113",
  "santiago_de_compostela":     "114",
  "pontevedra":                 "115",
  "ferrol":                     "116",

  // Cantabria
  "santander":                  "117",
  "torrelavega":                "118",

  // Navarra
  "pamplona":                   "119",

  // Aragón
  "zaragoza":                   "120",
  "huesca":                     "121",
  "teruel":                     "122",

  // La Rioja
  "logrono":                    "123",

  // Castilla y León
  "valladolid":                 "124",
  "burgos":                     "125",
  "salamanca":                  "126",
  "leon":                       "127",
  "palencia":                   "128",
  "avila":                      "129",
  "segovia":                    "130",
  "ponferrada":                 "131",
  "zamora":                     "132",

  // Castilla-La Mancha
  "toledo":                     "133",
  "albacete":                   "134",
  "guadalajara":                "135",
  "talavera_de_la_reina":       "136",
  "ciudad_real":                "137",
  "cuenca":                     "138",
  "puertollano":                "139",

  // Extremadura
  "badajoz":                    "140",
  "caceres":                    "141",
  "merida":                     "142",

  // Baleares
  "palma":                      "143",
  "calvia":                     "144",
  "eivissa":                    "145",
  "manacor":                    "146",

  // Canarias
  "las_palmas_de_gran_canaria": "147",
  "santa_cruz_de_tenerife":     "148",
  "san_cristobal_de_la_laguna": "149",
  "telde":                      "150",
  "arona":                      "151",
  "santa_lucia_de_tirajana":    "152",
  "arrecife":                   "153",
  "san_bartolome_de_tirajana":  "154",
  "adeje":                      "155",
  "puerto_del_rosario":         "156",

  // Ceuta y Melilla
  "ceuta":                      "157",
  "melilla":                    "158",
};

// ── Código → Ciudad (nombre legible) ────────────────────────────
export const codeToCity = {
  "000": "Base",
  "300": "Nacional",
  "404": "Internacional",
  "001": "Madrid",
  "002": "Móstoles",
  "003": "Alcalá de Henares",
  "004": "Fuenlabrada",
  "005": "Leganés",
  "006": "Getafe",
  "007": "Alcorcón",
  "008": "Torrejón de Ardoz",
  "009": "Parla",
  "010": "Alcobendas",
  "011": "Las Rozas de Madrid",
  "012": "San Sebastián de los Reyes",
  "013": "Rivas-Vaciamadrid",
  "014": "Pozuelo de Alarcón",
  "015": "Coslada",
  "016": "Valdemoro",
  "017": "Majadahonda",
  "018": "Collado Villalba",
  "019": "Aranjuez",
  "020": "Boadilla del Monte",
  "021": "Arganda del Rey",
  "022": "Pinto",
  "023": "Colmenar Viejo",
  "024": "Barcelona",
  "025": "L'Hospitalet de Llobregat",
  "026": "Terrassa",
  "027": "Badalona",
  "028": "Sabadell",
  "029": "Lleida",
  "030": "Tarragona",
  "031": "Manresa",
  "032": "Mataró",
  "033": "Santa Coloma de Gramenet",
  "034": "Reus",
  "035": "Girona",
  "036": "Sant Cugat del Vallès",
  "037": "Cornellà de Llobregat",
  "038": "Sant Boi de Llobregat",
  "039": "Rubí",
  "040": "Vilanova i la Geltrú",
  "041": "Castelldefels",
  "042": "Viladecans",
  "043": "El Prat de Llobregat",
  "044": "Granollers",
  "045": "Cerdanyola del Vallès",
  "046": "Mollet del Vallès",
  "047": "Calella",
  "048": "Valencia",
  "049": "Castellón de la Plana",
  "050": "Torrent",
  "051": "Orihuela",
  "052": "Gandia",
  "053": "Paterna",
  "054": "Sagunto",
  "055": "Vila-real",
  "056": "Alicante",
  "057": "Elche",
  "058": "Torrevieja",
  "059": "Benidorm",
  "060": "Alcoy",
  "061": "San Vicente del Raspeig",
  "062": "Elda",
  "063": "Denia",
  "064": "Sevilla",
  "065": "Málaga",
  "066": "Córdoba",
  "067": "Granada",
  "068": "Jerez de la Frontera",
  "069": "Almería",
  "070": "Huelva",
  "071": "Marbella",
  "072": "Dos Hermanas",
  "073": "Algeciras",
  "074": "Cádiz",
  "075": "Jaén",
  "076": "Roquetas de Mar",
  "077": "San Fernando",
  "078": "El Puerto de Santa María",
  "079": "Chiclana de la Frontera",
  "080": "El Ejido",
  "081": "Fuengirola",
  "082": "Vélez-Málaga",
  "083": "Alcalá de Guadaíra",
  "084": "Torremolinos",
  "085": "Estepona",
  "086": "Benalmádena",
  "087": "Sanlúcar de Barrameda",
  "088": "Linares",
  "089": "La Línea de la Concepción",
  "090": "Motril",
  "091": "Utrera",
  "092": "Mijas",
  "093": "Murcia",
  "094": "Cartagena",
  "095": "Lorca",
  "096": "Molina de Segura",
  "097": "Bilbao",
  "098": "Vitoria-Gasteiz",
  "099": "San Sebastián",
  "100": "Barakaldo",
  "101": "Getxo",
  "102": "Irún",
  "103": "Portugalete",
  "104": "Santurtzi",
  "105": "Basauri",
  "106": "Gijón",
  "107": "Oviedo",
  "108": "Avilés",
  "109": "Siero",
  "110": "Vigo",
  "111": "A Coruña",
  "112": "Ourense",
  "113": "Lugo",
  "114": "Santiago de Compostela",
  "115": "Pontevedra",
  "116": "Ferrol",
  "117": "Santander",
  "118": "Torrelavega",
  "119": "Pamplona",
  "120": "Zaragoza",
  "121": "Huesca",
  "122": "Teruel",
  "123": "Logroño",
  "124": "Valladolid",
  "125": "Burgos",
  "126": "Salamanca",
  "127": "León",
  "128": "Palencia",
  "129": "Ávila",
  "130": "Segovia",
  "131": "Ponferrada",
  "132": "Zamora",
  "133": "Toledo",
  "134": "Albacete",
  "135": "Guadalajara",
  "136": "Talavera de la Reina",
  "137": "Ciudad Real",
  "138": "Cuenca",
  "139": "Puertollano",
  "140": "Badajoz",
  "141": "Cáceres",
  "142": "Mérida",
  "143": "Palma",
  "144": "Calvià",
  "145": "Eivissa",
  "146": "Manacor",
  "147": "Las Palmas de Gran Canaria",
  "148": "Santa Cruz de Tenerife",
  "149": "San Cristóbal de La Laguna",
  "150": "Telde",
  "151": "Arona",
  "152": "Santa Lucía de Tirajana",
  "153": "Arrecife",
  "154": "San Bartolomé de Tirajana",
  "155": "Adeje",
  "156": "Puerto del Rosario",
  "157": "Ceuta",
  "158": "Melilla",
};

// ── Helpers ──────────────────────────────────────────────────────

const normalizeKey = (str) =>
  str.toLowerCase().trim().replace(/ /g, "_")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Devuelve true si el canal es ChannelMoon */
export const isMoonChannel = (canal) => canal === 2;

/** Ciudad → código (3 dígitos). Null si no existe. */
export const getCodeForCity = (cityKey) =>
  cityToCode[normalizeKey(cityKey)] ?? null;

/** Código → nombre legible. Null si no existe. */
export const getCityForCode = (code) => codeToCity[code] ?? null;

/**
 * Construye el nombre del archivo de video en R2.
 *
 * VÍDEOS BASE:
 *   Resto:  buildVideoName(1, 0, 2, 0, "000") → "1_020_000.mp4"
 *   Moon:   buildVideoName(2, 1, 0, 0, "000") → "2_100_000.mp4"
 *
 * CONTRATOS:
 *   Resto:  buildVideoName(1, 1, 2, 0, "001") → "1_120_001.mp4"  Madrid
 *           buildVideoName(1, 1, 2, 0, "300") → "1_120_300.mp4"  Nacional
 *           buildVideoName(1, 1, 2, 0, "404") → "1_120_404.mp4"  Internacional
 *   Moon:   buildVideoName(2, 1, 1, 0, "001") → "2_110_001.mp4"  MT1 Madrid
 *           buildVideoName(2, 1, 3, 0, "300") → "2_130_300.mp4"  MT3 Nacional
 *
 * @param {number} canal        — 1–9
 * @param {number} fase         — 0=SinFase(base resto) | 1–4=Fase lunar
 * @param {number} turno        — 0=SinTurno(base Moon) | 1–4=Turno
 * @param {number} dispositivo  — 0=PC | 1=Móvil
 * @param {string} codigo       — "000"|"300"|"404"|"001"–"158"
 * @returns {string}
 */
export const buildVideoName = (canal, fase, turno, dispositivo, codigo = CODIGO_BASE) => {
  return `${canal}_${fase}${turno}${dispositivo}_${codigo}.mp4`;
};

/**
 * Lista de candidatos a emitir ordenados por prioridad:
 *   Internacional (404) → Nacional (300) → Local (001-158) → Base (000)
 *
 * Para ChannelMoon pasar el turno activo del reloj (1–4).
 * Para resto de canales la fase activa de la luna (1–4) y el turno del reloj.
 * El base siempre tiene fase=0 (resto) o turno=0 (Moon).
 *
 * @param {number} canal
 * @param {number} fase         — fase lunar activa (1–4)
 * @param {number} turno        — turno horario activo (1–4)
 * @param {number} dispositivo  — 0=PC | 1=Móvil
 * @param {string|null} cityKey — clave ciudad del usuario
 * @returns {string[]}
 */
export const getVideoCandidates = (canal, fase, turno, dispositivo, cityKey = null) => {
  const cityCode = cityKey ? getCodeForCity(cityKey) : null;

  // Base: Moon usa turno=0, resto usa fase=0
  const baseVideo = isMoonChannel(canal)
    ? buildVideoName(canal, fase, 0, dispositivo, CODIGO_BASE)
    : buildVideoName(canal, 0, turno, dispositivo, CODIGO_BASE);

  // Contratos: todos usan fase + turno completos
  const candidates = [
    buildVideoName(canal, fase, turno, dispositivo, COBERTURA_INTERNACIONAL),
    buildVideoName(canal, fase, turno, dispositivo, COBERTURA_NACIONAL),
  ];
  if (cityCode) {
    candidates.push(buildVideoName(canal, fase, turno, dispositivo, cityCode));
  }
  candidates.push(baseVideo);

  return candidates;
};

/**
 * Array ordenado alfabéticamente de todas las ciudades.
 * Para dropdowns y selects en Marketplace y BackStage.
 */
export const cityList = Object.entries(cityToCode)
  .map(([key, code]) => ({ key, code, label: codeToCity[code] }))
  .sort((a, b) => a.label.localeCompare(b.label, "es"));

/** Turno activo según la hora local (1–4). */
export const getTurno = () => {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return 1;
  if (h >= 11 && h < 17) return 2;
  if (h >= 17 && h < 23) return 3;
  return 4;
};

const R2_BASE = 'https://media.bro7vision.com/';

/**
 * Recorre los candidatos haciendo HEAD a R2 y devuelve la primera URL que existe.
 * Siempre devuelve algo (cae al base si todo falla).
 */
export const resolveVideoFromCandidates = async (candidates) => {
  for (const name of candidates) {
    try {
      const res = await fetch(R2_BASE + name, { method: 'HEAD' });
      if (res.ok) return R2_BASE + name;
    } catch (_) {}
  }
  return R2_BASE + candidates[candidates.length - 1];
};
