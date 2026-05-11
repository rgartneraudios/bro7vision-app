// src/services/agents/SystemBus.js
// Interpreta la intención que reporta la IA y actúa.
// Recibe texto en lenguaje natural — "usuario pide egipto", "usuario quiere Jaguar"
// El sistema decide qué hacer, no la IA.

// ── Keywords de intención ────────────────────────────────────────────────────

const HANDOFF_KEYWORDS = {
  jaguar:    ['jaguar'],
  orumama:   ['orumama'],
  smisterio: ['misterio', 'smisterio'],
  osos:      ['osos', 'salir', 'volver', 'recepción', 'recepcion'],
  nova:      ['nova', 'productos'],
  isabella:  ['isabella', 'servicios'],
  mapache:   ['mapache', 'audio'],
  ami:       ['ami'],
  evelyn:    ['evelyn', 'avisos'],
  larry:     ['larry'],
};

const HISTORIA_KEYWORDS = {
  antartida:   ['antartida', 'antártida'],
  egipto:      ['egipto'],
  bucegi:      ['bucegi'],
  tartaria:    ['tartaria'],
  // Jaguar — signos
  aries:       ['aries'],
  tauro:       ['tauro'],
  geminis:     ['geminis', 'géminis'],
  cancer:      ['cancer', 'cáncer'],
  leo:         ['leo'],
  virgo:       ['virgo'],
  libra:       ['libra'],
  escorpio:    ['escorpio'],
  ofiuco:      ['ofiuco'],
  sagitario:   ['sagitario'],
  capricornio: ['capricornio'],
  acuario:     ['acuario'],
  piscis:      ['piscis'],
  // Orumama — hierbas
  albahaca:   ['albahaca'],
  jengibre:   ['jengibre'],
  lavanda:    ['lavanda'],
  manzanilla: ['manzanilla'],
  melisa:     ['melisa'],
  menta:      ['menta'],
  oregano:    ['oregano', 'orégano'],
  romero:     ['romero'],
  ruda:       ['ruda'],
  salvia:     ['salvia'],
  tomillo:    ['tomillo'],
  romaza:     ['romaza'],
  hierbas:    ['hierba', 'hierbas', 'recetario', 'planta', 'plantas', 'remedio', 'remedios'],
  guisos:     ['guiso', 'guisos', 'olla', 'cocina', 'receta', 'recetas'],
};

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// ── Función principal ────────────────────────────────────────────────────────

export function interpretarIntencion(intencion, { onHandoff, onBotContent }) {
  const t = norm(intencion);

  for (const [destino, keywords] of Object.entries(HANDOFF_KEYWORDS)) {
  if (keywords.some(k => t.includes(k))) {
    setTimeout(() => onHandoff?.(destino), 2500);
    return;
  }
}

  for (const [tema, keywords] of Object.entries(HISTORIA_KEYWORDS)) {
    if (keywords.some(k => t.includes(k))) {
      onBotContent?.(tema);
      return;
    }
  }
}
