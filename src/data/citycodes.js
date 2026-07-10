// src/data/citycodes.js
// ═══════════════════════════════════════════════════════════════
// CÓDIGOS DE CIUDAD — SISTEMA DE PUBLICIDAD REALITY / BACKSTAGE
// ═══════════════════════════════════════════════════════════════
//
// NOMENCLATURA DE ARCHIVO:
//   [CANAL]_[FASE][TURNO][DISPOSITIVO]_[CÓDIGO].mp4
//
//   CANAL:       1 dígito  → ver CHANNELS
//   FASE:        1 dígito  → 0=SinFase(base) 1=Luna Nueva 2=Luna Creciente 3=Luna Llena 4=Luna Menguante
//   TURNO:       1 dígito  → 0=SinTurno(base Moon) 1=05-11h 2=11-17h 3=17-23h 4=23-05h
//   DISPOSITIVO: 1 dígito  → 0=PC 1=Móvil
//   CÓDIGO:      3 dígitos → 000=Base 300=Nacional 404=Internacional
//                            305=GiraRegional(5 ciudades mini)
//                            309=GiraGranRegional(9 ciudades mini)
//                            307=Metropolis(7 mega ciudades)
//                            001-158=Ciudad específica
//
// ── COBERTURAS Y PRECIOS ─────────────────────────────────────────
//   SALA_CIUDAD         20€  código 001-158  (1 ciudad mini, megas bloqueadas)
//   SALA_GRAN_CIUDAD    60€  código 001-158  (1 mega ciudad, minis bloqueadas)
//   GIRA_REGIONAL       80€  código 305      (5 ciudades mini, megas bloqueadas)
//   GIRA_GRAN_REGIONAL 160€  código 309      (9 ciudades mini, megas bloqueadas)
//   METROPOLIS         350€  código 307      (7 mega ciudades)
//   GIRA_NACIONAL      500€  código 300      (nacional, exclusivo)
//   GIRA_MUNDIAL       800€  código 404      (internacional, exclusivo)
//
// ── CRITERIO MEGA CIUDAD ─────────────────────────────────────────
//   Mega: población > 500.000 habitantes (Madrid, Barcelona, Valencia,
//         Sevilla, Zaragoza, Málaga)
//   Mini: resto de ciudades del sistema
//
// ── PRIORIDAD DE EMISIÓN ─────────────────────────────────────────
//   404 (Internacional) → bloquea todo en ese slot
//   300 (Nacional)      → bloquea todos los locales
//   307 (Metrópolis)    → bloquea otros regionales y locales mega
//   309 (GiraGranReg.)  → bloquea gira regional y locales mini
//   305 (GiraRegional)  → bloquea locales mini de esas ciudades
//   001–158 (Ciudad)    → bloquea solo esa ciudad
//   000 (Base)          → se emite si no hay ningún contrato activo
//
// ── VÍDEOS BASE (permanentes, sin contrato) ──────────────────────
//   Resto de canales (1,3–9): Fase=0, Turno=1–4, Código=000
//   ChannelMoon (canal 2):    Fase=1–4, Turno=0, Código=000
//
//   TOTAL: 8 canales × 4 turnos × 2 dispositivos + 4 fases Moon × 2 = 72 vídeos
//
// ── CHANNEL MOON — NOTA CRÍTICA ──────────────────────────────────
//   Moon emite SIEMPRE el mismo video base por fase lunar.
//   El campo `funcion` en bs_escenarios actúa como MoonTurno (MT1–MT4),
//   NO como turno horario. Son 4 slots publicitarios sobre el mismo video.
//   Al cambiar la fase lunar → nuevo video base → nuevos 4 slots disponibles.
// ═══════════════════════════════════════════════════════════════

// ── Canales ─────────────────────────────────────────────────────
export const CHANNELS = {
  1: "Canal Mercurio",
  2: "Canal Luna",
  3: "Canal Venus",
  4: "Canal Tierra",
  5: "Canal Júpiter",
  6: "Canal Marte",
  7: "Canal Saturno",
  8: "Canal Urano",
  9: "Canal Neptuno",
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

// ── Códigos especiales de cobertura ─────────────────────────────
export const CODIGO_BASE              = "000";
export const COBERTURA_NACIONAL       = "300";
export const COBERTURA_INTERNACIONAL  = "404";
export const COBERTURA_GIRA_REGIONAL      = "305"; // 5 ciudades mini
export const COBERTURA_GIRA_GRAN_REGIONAL = "309"; // 9 ciudades mini
export const COBERTURA_METROPOLIS         = "307"; // 7 mega ciudades

// ── Tabla de coberturas — fuente de verdad para BackStage ───────
// Sincronizar con bs_tarifas en Supabase
export const COBERTURAS = {
  SALA_CIUDAD:         { codigo: null,  precio: 20,  tipo_ciudad: "mini", max_ciudades: 1,  label: "Sala Ciudad" },
  SALA_GRAN_CIUDAD:    { codigo: null,  precio: 60,  tipo_ciudad: "mega", max_ciudades: 1,  label: "Sala Gran Ciudad" },
  GIRA_REGIONAL:       { codigo: "305", precio: 80,  tipo_ciudad: "mini", max_ciudades: 5,  label: "Gira Regional" },
  GIRA_GRAN_REGIONAL:  { codigo: "309", precio: 160, tipo_ciudad: "mini", max_ciudades: 9,  label: "Gira Gran Regional" },
  METROPOLIS:          { codigo: "307", precio: 350, tipo_ciudad: "mega", max_ciudades: 7,  label: "Metrópolis" },
  GIRA_NACIONAL:       { codigo: "300", precio: 500, tipo_ciudad: null,   max_ciudades: null, label: "Gira Nacional" },
  GIRA_MUNDIAL:        { codigo: "404", precio: 800, tipo_ciudad: null,   max_ciudades: null, label: "Gira Mundial" },
};

// ── Ciudad → Código + Tipo ───────────────────────────────────────
// tipo: "mega" = >500.000 habitantes | "mini" = resto
export const cityToCode = {

  // Comunidad de Madrid
  "madrid":                     { code: "001", tipo: "mega" }, // 3.332.035 hab
  "mostoles":                   { code: "002", tipo: "mini" },
  "alcala_de_henares":          { code: "003", tipo: "mini" },
  "fuenlabrada":                { code: "004", tipo: "mini" },
  "leganes":                    { code: "005", tipo: "mini" },
  "getafe":                     { code: "006", tipo: "mini" },
  "alcorcon":                   { code: "007", tipo: "mini" },
  "torrejon_de_ardoz":          { code: "008", tipo: "mini" },
  "parla":                      { code: "009", tipo: "mini" },
  "alcobendas":                 { code: "010", tipo: "mini" },
  "las_rozas_de_madrid":        { code: "011", tipo: "mini" },
  "san_sebastian_de_los_reyes": { code: "012", tipo: "mini" },
  "rivas_vaciamadrid":          { code: "013", tipo: "mini" },
  "pozuelo_de_alarcon":         { code: "014", tipo: "mini" },
  "coslada":                    { code: "015", tipo: "mini" },
  "valdemoro":                  { code: "016", tipo: "mini" },
  "majadahonda":                { code: "017", tipo: "mini" },
  "collado_villalba":           { code: "018", tipo: "mini" },
  "aranjuez":                   { code: "019", tipo: "mini" },
  "boadilla_del_monte":         { code: "020", tipo: "mini" },
  "arganda_del_rey":            { code: "021", tipo: "mini" },
  "pinto":                      { code: "022", tipo: "mini" },
  "colmenar_viejo":             { code: "023", tipo: "mini" },

  // Cataluña
  "barcelona":                  { code: "024", tipo: "mega" }, // 1.660.122 hab
  "l_hospitalet_de_llobregat":  { code: "025", tipo: "mini" },
  "terrassa":                   { code: "026", tipo: "mini" },
  "badalona":                   { code: "027", tipo: "mini" },
  "sabadell":                   { code: "028", tipo: "mini" },
  "lleida":                     { code: "029", tipo: "mini" },
  "tarragona":                  { code: "030", tipo: "mini" },
  "manresa":                    { code: "031", tipo: "mini" },
  "mataro":                     { code: "032", tipo: "mini" },
  "santa_coloma_de_gramenet":   { code: "033", tipo: "mini" },
  "reus":                       { code: "034", tipo: "mini" },
  "girona":                     { code: "035", tipo: "mini" },
  "sant_cugat_del_valles":      { code: "036", tipo: "mini" },
  "cornella_de_llobregat":      { code: "037", tipo: "mini" },
  "sant_boi_de_llobregat":      { code: "038", tipo: "mini" },
  "rubi":                       { code: "039", tipo: "mini" },
  "vilanova_i_la_geltru":       { code: "040", tipo: "mini" },
  "castelldefels":              { code: "041", tipo: "mini" },
  "viladecans":                 { code: "042", tipo: "mini" },
  "el_prat_de_llobregat":       { code: "043", tipo: "mini" },
  "granollers":                 { code: "044", tipo: "mini" },
  "cerdanyola_del_valles":      { code: "045", tipo: "mini" },
  "mollet_del_valles":          { code: "046", tipo: "mini" },
  "calella":                    { code: "047", tipo: "mini" },

  // Comunidad Valenciana
  "valencia":                   { code: "048", tipo: "mega" }, // 807.693 hab
  "castellon_de_la_plana":      { code: "049", tipo: "mini" },
  "torrent":                    { code: "050", tipo: "mini" },
  "orihuela":                   { code: "051", tipo: "mini" },
  "gandia":                     { code: "052", tipo: "mini" },
  "paterna":                    { code: "053", tipo: "mini" },
  "sagunto":                    { code: "054", tipo: "mini" },
  "vila_real":                  { code: "055", tipo: "mini" },
  "alicante":                   { code: "056", tipo: "mini" },
  "elche":                      { code: "057", tipo: "mini" },
  "torrevieja":                 { code: "058", tipo: "mini" },
  "benidorm":                   { code: "059", tipo: "mini" },
  "alcoy":                      { code: "060", tipo: "mini" },
  "san_vicente_del_raspeig":    { code: "061", tipo: "mini" },
  "elda":                       { code: "062", tipo: "mini" },
  "denia":                      { code: "063", tipo: "mini" },

  // Andalucía
  "sevilla":                    { code: "064", tipo: "mega" }, // 684.025 hab
  "malaga":                     { code: "065", tipo: "mega" }, // 586.384 hab
  "cordoba":                    { code: "066", tipo: "mini" },
  "granada":                    { code: "067", tipo: "mini" },
  "jerez_de_la_frontera":       { code: "068", tipo: "mini" },
  "almeria":                    { code: "069", tipo: "mini" },
  "huelva":                     { code: "070", tipo: "mini" },
  "marbella":                   { code: "071", tipo: "mini" },
  "dos_hermanas":               { code: "072", tipo: "mini" },
  "algeciras":                  { code: "073", tipo: "mini" },
  "cadiz":                      { code: "074", tipo: "mini" },
  "jaen":                       { code: "075", tipo: "mini" },
  "roquetas_de_mar":            { code: "076", tipo: "mini" },
  "san_fernando":               { code: "077", tipo: "mini" },
  "el_puerto_de_santa_maria":   { code: "078", tipo: "mini" },
  "chiclana_de_la_frontera":    { code: "079", tipo: "mini" },
  "el_ejido":                   { code: "080", tipo: "mini" },
  "fuengirola":                 { code: "081", tipo: "mini" },
  "velez_malaga":               { code: "082", tipo: "mini" },
  "alcala_de_guadaira":         { code: "083", tipo: "mini" },
  "torremolinos":               { code: "084", tipo: "mini" },
  "estepona":                   { code: "085", tipo: "mini" },
  "benalmadena":                { code: "086", tipo: "mini" },
  "sanlucar_de_barrameda":      { code: "087", tipo: "mini" },
  "linares":                    { code: "088", tipo: "mini" },
  "la_linea_de_la_concepcion":  { code: "089", tipo: "mini" },
  "motril":                     { code: "090", tipo: "mini" },
  "utrera":                     { code: "091", tipo: "mini" },
  "mijas":                      { code: "092", tipo: "mini" },

  // Región de Murcia
  "murcia":                     { code: "093", tipo: "mini" }, // ~460k — no llega a 500k
  "cartagena":                  { code: "094", tipo: "mini" },
  "lorca":                      { code: "095", tipo: "mini" },
  "molina_de_segura":           { code: "096", tipo: "mini" },

  // País Vasco
  "bilbao":                     { code: "097", tipo: "mini" },
  "vitoria_gasteiz":            { code: "098", tipo: "mini" },
  "san_sebastian":              { code: "099", tipo: "mini" },
  "barakaldo":                  { code: "100", tipo: "mini" },
  "getxo":                      { code: "101", tipo: "mini" },
  "irun":                       { code: "102", tipo: "mini" },
  "portugalete":                { code: "103", tipo: "mini" },
  "santurtzi":                  { code: "104", tipo: "mini" },
  "basauri":                    { code: "105", tipo: "mini" },

  // Asturias
  "gijon":                      { code: "106", tipo: "mini" },
  "oviedo":                     { code: "107", tipo: "mini" },
  "aviles":                     { code: "108", tipo: "mini" },
  "siero":                      { code: "109", tipo: "mini" },

  // Galicia
  "vigo":                       { code: "110", tipo: "mini" },
  "a_coruna":                   { code: "111", tipo: "mini" },
  "ourense":                    { code: "112", tipo: "mini" },
  "lugo":                       { code: "113", tipo: "mini" },
  "santiago_de_compostela":     { code: "114", tipo: "mini" },
  "pontevedra":                 { code: "115", tipo: "mini" },
  "ferrol":                     { code: "116", tipo: "mini" },

  // Cantabria
  "santander":                  { code: "117", tipo: "mini" },
  "torrelavega":                { code: "118", tipo: "mini" },

  // Navarra
  "pamplona":                   { code: "119", tipo: "mini" },

  // Aragón
  "zaragoza":                   { code: "120", tipo: "mega" }, // 682.513 hab
  "huesca":                     { code: "121", tipo: "mini" },
  "teruel":                     { code: "122", tipo: "mini" },

  // La Rioja
  "logrono":                    { code: "123", tipo: "mini" },

  // Castilla y León
  "valladolid":                 { code: "124", tipo: "mini" },
  "burgos":                     { code: "125", tipo: "mini" },
  "salamanca":                  { code: "126", tipo: "mini" },
  "leon":                       { code: "127", tipo: "mini" },
  "palencia":                   { code: "128", tipo: "mini" },
  "avila":                      { code: "129", tipo: "mini" },
  "segovia":                    { code: "130", tipo: "mini" },
  "ponferrada":                 { code: "131", tipo: "mini" },
  "zamora":                     { code: "132", tipo: "mini" },

  // Castilla-La Mancha
  "toledo":                     { code: "133", tipo: "mini" },
  "albacete":                   { code: "134", tipo: "mini" },
  "guadalajara":                { code: "135", tipo: "mini" },
  "talavera_de_la_reina":       { code: "136", tipo: "mini" },
  "ciudad_real":                { code: "137", tipo: "mini" },
  "cuenca":                     { code: "138", tipo: "mini" },
  "puertollano":                { code: "139", tipo: "mini" },

  // Extremadura
  "badajoz":                    { code: "140", tipo: "mini" },
  "caceres":                    { code: "141", tipo: "mini" },
  "merida":                     { code: "142", tipo: "mini" },

  // Baleares
  "palma":                      { code: "143", tipo: "mini" },
  "calvia":                     { code: "144", tipo: "mini" },
  "eivissa":                    { code: "145", tipo: "mini" },
  "manacor":                    { code: "146", tipo: "mini" },

  // Canarias
  "las_palmas_de_gran_canaria": { code: "147", tipo: "mini" },
  "santa_cruz_de_tenerife":     { code: "148", tipo: "mini" },
  "san_cristobal_de_la_laguna": { code: "149", tipo: "mini" },
  "telde":                      { code: "150", tipo: "mini" },
  "arona":                      { code: "151", tipo: "mini" },
  "santa_lucia_de_tirajana":    { code: "152", tipo: "mini" },
  "arrecife":                   { code: "153", tipo: "mini" },
  "san_bartolome_de_tirajana":  { code: "154", tipo: "mini" },
  "adeje":                      { code: "155", tipo: "mini" },
  "puerto_del_rosario":         { code: "156", tipo: "mini" },

  // Ceuta y Melilla
  "ceuta":                      { code: "157", tipo: "mini" },
  "melilla":                    { code: "158", tipo: "mini" },
};

// ── Código → Ciudad (nombre legible) ────────────────────────────
export const codeToCity = {
  "000": "Base",
  "300": "Nacional",
  "404": "Internacional",
  "305": "Gira Regional",
  "309": "Gira Gran Regional",
  "307": "Metrópolis",
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

/** Devuelve true si el canal es Luna (canal 2) */
export const isMoonChannel = (canal) => canal === 2;

/** Ciudad → código (3 dígitos). Null si no existe. */
export const getCodeForCity = (cityKey) =>
  cityToCode[normalizeKey(cityKey)]?.code ?? null;

/** Ciudad → tipo ("mega"|"mini"). Null si no existe. */
export const getTipoForCity = (cityKey) =>
  cityToCode[normalizeKey(cityKey)]?.tipo ?? null;

/** Código → nombre legible. Null si no existe. */
export const getCityForCode = (code) => codeToCity[code] ?? null;

/** Lista de todas las mega ciudades (>500k hab) */
export const getMegaCities = () =>
  Object.entries(cityToCode)
    .filter(([_, v]) => v.tipo === "mega")
    .map(([key, v]) => ({ key, code: v.code, label: codeToCity[v.code] }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

/** Lista de todas las mini ciudades (<500k hab) */
export const getMiniCities = () =>
  Object.entries(cityToCode)
    .filter(([_, v]) => v.tipo === "mini")
    .map(([key, v]) => ({ key, code: v.code, label: codeToCity[v.code] }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

/**
 * Filtra ciudades según la cobertura elegida.
 * Usar en el selector del Marketplace para bloquear el tipo incorrecto.
 *
 * SALA_CIUDAD / GIRA_REGIONAL / GIRA_GRAN_REGIONAL → solo minis
 * SALA_GRAN_CIUDAD / METROPOLIS                    → solo megas
 * GIRA_NACIONAL / GIRA_MUNDIAL                     → sin selector de ciudad
 */
export const getCitiesForCobertura = (cobertura) => {
  const cfg = COBERTURAS[cobertura];
  if (!cfg || !cfg.tipo_ciudad) return [];
  return cfg.tipo_ciudad === "mega" ? getMegaCities() : getMiniCities();
};

/**
 * Construye el nombre del archivo de video en R2.
 *
 * VÍDEOS BASE:
 *   Resto:  buildVideoName(1, 0, 2, 0, "000") → "1_020_000.mp4"
 *   Moon:   buildVideoName(2, 1, 0, 0, "000") → "2_100_000.mp4"
 *
 * CONTRATOS ciudad:
 *   buildVideoName(1, 1, 2, 0, "001") → "1_120_001.mp4"  Madrid
 *   buildVideoName(1, 1, 2, 0, "300") → "1_120_300.mp4"  Nacional
 *   buildVideoName(1, 1, 2, 0, "404") → "1_120_404.mp4"  Internacional
 *   buildVideoName(1, 1, 2, 0, "305") → "1_120_305.mp4"  Gira Regional
 *   buildVideoName(1, 1, 2, 0, "307") → "1_120_307.mp4"  Metrópolis
 *   buildVideoName(1, 1, 2, 0, "309") → "1_120_309.mp4"  Gira Gran Regional
 *
 * CONTRATOS Moon (MoonTurnos MT1–MT4):
 *   buildVideoName(2, 1, 1, 0, "001") → "2_110_001.mp4"  MT1 Madrid
 *   buildVideoName(2, 1, 3, 0, "300") → "2_130_300.mp4"  MT3 Nacional
 *
 * @param {number} canal        — 1–9
 * @param {number} fase         — 0=SinFase(base resto) | 1–4=Fase lunar
 * @param {number} turno        — 0=SinTurno(base Moon) | 1–4=Turno/MoonTurno
 * @param {number} dispositivo  — 0=PC | 1=Móvil
 * @param {string} codigo       — "000"|"300"|"404"|"305"|"307"|"309"|"001"–"158"
 * @returns {string}
 */
export const buildVideoName = (canal, fase, turno, dispositivo, codigo = CODIGO_BASE) => {
  return `${canal}_${fase}${turno}${dispositivo}_${codigo}.mp4`;
};

/**
 * Lista de candidatos a emitir ordenados por prioridad:
 *   Internacional (404) → Metrópolis (307) → GiraGranReg (309) →
 *   GiraRegional (305) → Nacional (300) → Local (001-158) → Base (000)
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

  const candidates = [
    buildVideoName(canal, fase, turno, dispositivo, COBERTURA_INTERNACIONAL),  // 404
    buildVideoName(canal, fase, turno, dispositivo, COBERTURA_METROPOLIS),     // 307
    buildVideoName(canal, fase, turno, dispositivo, COBERTURA_GIRA_GRAN_REGIONAL), // 309
    buildVideoName(canal, fase, turno, dispositivo, COBERTURA_GIRA_REGIONAL),  // 305
    buildVideoName(canal, fase, turno, dispositivo, COBERTURA_NACIONAL),       // 300
  ];

  if (cityCode) {
    candidates.push(buildVideoName(canal, fase, turno, dispositivo, cityCode)); // 001-158
  }

  candidates.push(baseVideo); // 000 — siempre al final
  return candidates;
};

/**
 * Array ordenado alfabéticamente de todas las ciudades.
 * Para dropdowns y selects en Marketplace y BackStage.
 */
export const cityList = Object.entries(cityToCode)
  .map(([key, v]) => ({ key, code: v.code, tipo: v.tipo, label: codeToCity[v.code] }))
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
