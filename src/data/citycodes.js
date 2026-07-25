// src/data/citycodes.js
// ═══════════════════════════════════════════════════════════════
// CÓDIGOS DE CIUDAD — SISTEMA DE PUBLICIDAD REALITY / BACKSTAGE
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

// ── Coberturas — fuente de verdad para Backstage ─────────────────
export const COBERTURAS = {
  SALA_CIUDAD:         { codigo: null,  precio: 20,  tipo_ciudad: "mini", max_ciudades: 1,    label: "Sala Ciudad" },
  SALA_GRAN_CIUDAD:    { codigo: null,  precio: 60,  tipo_ciudad: "mega", max_ciudades: 1,    label: "Sala Gran Ciudad" },
  GIRA_REGIONAL:       { codigo: "305", precio: 80,  tipo_ciudad: "mini", max_ciudades: 5,    label: "Gira Regional" },
  GIRA_GRAN_REGIONAL:  { codigo: "309", precio: 160, tipo_ciudad: "mini", max_ciudades: 9,    label: "Gira Gran Regional" },
  METROPOLIS:          { codigo: "307", precio: 350, tipo_ciudad: "mega", max_ciudades: 7,    label: "Metrópolis" },
  GIRA_NACIONAL:       { codigo: "300", precio: 500, tipo_ciudad: null,   max_ciudades: null, label: "Gira Nacional" },
  GIRA_MUNDIAL:        { codigo: "404", precio: 800, tipo_ciudad: null,   max_ciudades: null, label: "Gira Mundial" },
};

// ── Ciudad → Código + Tipo ───────────────────────────────────────
export const cityToCode = {
  // Comunidad de Madrid
  "madrid":                     { code: "001", tipo: "mega" },
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
  "barcelona":                  { code: "024", tipo: "mega" },
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
  "valencia":                   { code: "048", tipo: "mega" },
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
  "sevilla":                    { code: "064", tipo: "mega" },
  "malaga":                     { code: "065", tipo: "mega" },
  "cordoba":                    { code: "066", tipo: "mini" },
  "granada":                    { code: "067", tipo: "mini" },
  "jerez_de_la_frontera":       { code: "068", tipo: "mini" },
  "almeria":                    { code: "069", tipo: "mini" },
  "huelva":                     { code: "070", tipo: "mini" },
  "cadiz":                      { code: "071", tipo: "mini" },
  "jaen":                       { code: "072", tipo: "mini" },
  "dos_hermanas":               { code: "073", tipo: "mini" },
  "marbella":                   { code: "074", tipo: "mini" },
  "algeciras":                  { code: "075", tipo: "mini" },
  "torremolinos":               { code: "076", tipo: "mini" },
  // País Vasco
  "bilbao":                     { code: "077", tipo: "mini" },
  "vitoria_gasteiz":            { code: "078", tipo: "mini" },
  "san_sebastian":              { code: "079", tipo: "mini" },
  "barakaldo":                  { code: "080", tipo: "mini" },
  "getxo":                      { code: "081", tipo: "mini" },
  // Galicia
  "vigo":                       { code: "082", tipo: "mini" },
  "a_coruna":                   { code: "083", tipo: "mini" },
  "ourense":                    { code: "084", tipo: "mini" },
  "santiago_de_compostela":     { code: "085", tipo: "mini" },
  "lugo":                       { code: "086", tipo: "mini" },
  "pontevedra":                 { code: "087", tipo: "mini" },
  // Aragón
  "zaragoza":                   { code: "088", tipo: "mega" },
  "huesca":                     { code: "089", tipo: "mini" },
  "teruel":                     { code: "090", tipo: "mini" },
  // Castilla y León
  "valladolid":                 { code: "091", tipo: "mini" },
  "burgos":                     { code: "092", tipo: "mini" },
  "salamanca":                  { code: "093", tipo: "mini" },
  "leon":                       { code: "094", tipo: "mini" },
  "palencia":                   { code: "095", tipo: "mini" },
  "avila":                      { code: "096", tipo: "mini" },
  "segovia":                    { code: "097", tipo: "mini" },
  "ponferrada":                 { code: "098", tipo: "mini" },
  "zamora":                     { code: "099", tipo: "mini" },
  // Castilla-La Mancha
  "toledo":                     { code: "100", tipo: "mini" },
  "albacete":                   { code: "101", tipo: "mini" },
  "guadalajara":                { code: "102", tipo: "mini" },
  "talavera_de_la_reina":       { code: "103", tipo: "mini" },
  "ciudad_real":                { code: "104", tipo: "mini" },
  "cuenca":                     { code: "105", tipo: "mini" },
  "puertollano":                { code: "106", tipo: "mini" },
  // Extremadura
  "badajoz":                    { code: "107", tipo: "mini" },
  "caceres":                    { code: "108", tipo: "mini" },
  "merida":                     { code: "109", tipo: "mini" },
  // Asturias
  "gijon":                      { code: "110", tipo: "mini" },
  "oviedo":                     { code: "111", tipo: "mini" },
  "aviles":                     { code: "112", tipo: "mini" },
  // Cantabria
  "santander":                  { code: "113", tipo: "mini" },
  // La Rioja
  "logrono":                    { code: "114", tipo: "mini" },
  // Navarra
  "pamplona":                   { code: "115", tipo: "mini" },
  // Murcia
  "murcia":                     { code: "116", tipo: "mini" },
  "cartagena":                  { code: "117", tipo: "mini" },
  "lorca":                      { code: "118", tipo: "mini" },
  // Baleares
  "palma":                      { code: "119", tipo: "mini" },
  "calvia":                     { code: "120", tipo: "mini" },
  "eivissa":                    { code: "121", tipo: "mini" },
  "manacor":                    { code: "122", tipo: "mini" },
  // Canarias
  "las_palmas_de_gran_canaria": { code: "123", tipo: "mini" },
  "santa_cruz_de_tenerife":     { code: "124", tipo: "mini" },
  "san_cristobal_de_la_laguna": { code: "125", tipo: "mini" },
  "telde":                      { code: "126", tipo: "mini" },
  "arona":                      { code: "127", tipo: "mini" },
  "santa_lucia_de_tirajana":    { code: "128", tipo: "mini" },
  "arrecife":                   { code: "129", tipo: "mini" },
  "san_bartolome_de_tirajana":  { code: "130", tipo: "mini" },
  "adeje":                      { code: "131", tipo: "mini" },
  "puerto_del_rosario":         { code: "132", tipo: "mini" },
  // Ceuta y Melilla
  "ceuta":                      { code: "133", tipo: "mini" },
  "melilla":                    { code: "134", tipo: "mini" },
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

/** Lista de todas las mega ciudades */
export const getMegaCities = () =>
  Object.entries(cityToCode)
    .filter(([_, v]) => v.tipo === "mega")
    .map(([key, v]) => ({ key, code: v.code, label: key }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

/** Lista de todas las mini ciudades */
export const getMiniCities = () =>
  Object.entries(cityToCode)
    .filter(([_, v]) => v.tipo === "mini")
    .map(([key, v]) => ({ key, code: v.code, label: key }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

/** Lista completa de todas las ciudades */
export const cityList = [
  ...getMegaCities(),
  ...getMiniCities(),
];

/** Filtra ciudades según cobertura — para selectores en Backstage */
export const getCitiesForCobertura = (cobertura) => {
  const cfg = COBERTURAS[cobertura];
  if (!cfg || !cfg.tipo_ciudad) return [];
  return cfg.tipo_ciudad === "mega" ? getMegaCities() : getMiniCities();
};

/** Turno activo según hora local (1–4) */
export const getTurno = () => {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return 1;
  if (h >= 11 && h < 17) return 2;
  if (h >= 17 && h < 23) return 3;
  return 4;
};

/** Construye nombre del video publicitario del anunciante */
export const buildAdVideoName = (campana, canal, turno, dispositivo = 0, codigo) =>
  `${campana}_${canal}_${turno}_${dispositivo}_${codigo}.mp4`;

/** Construye el nombre del video de fondo ambiental (nuestro, no del anunciante) */
export const buildBgVideoName = (canal, fase, turno, dispositivo = 0) =>
  `${canal}_${fase}${turno}${dispositivo}_000.mp4`;

/** Construye nombre del video/cartel siguiendo el patrón canónico */
export const buildVideoName = (canal, fase, turno, dispositivo, codigo) =>
  `${canal}_${fase}${turno}${dispositivo}_${codigo}.mp4`;