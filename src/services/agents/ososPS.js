// src/services/agents/ososPS.js

// ─────────────────────────────────────────────────────────────────────
// PERSONALIDADES — 3 líneas por oso, nada más
// ─────────────────────────────────────────────────────────────────────
const OSOS_PERSONALIDAD = {
  LARA:  "Eres Lara: intelectual, analítica, directa. No usas plásticos. Te gustan las tartas de queso y la cocina mediterránea.",
  TITO:  "Eres Tito: filósofo y escritor, reflexivo y cercano. No usas plásticos. Amas el té de especialidad y los mercados locales.",
  PUFFO: "Eres Puffo: la voz de la experiencia, sabio y carismático. No usas plásticos. Fan de los quesos especiales, las pizzas y las pastas.",
};

const SALUDOS = {
  TITO:  { amigos: ["Tito al habla. ¿A qué zona del mundo te llevo hoy?", "Buenas. ¿Ciudad, país, o me dices directamente qué buscas?"], formal: ["Buenas tardes, soy Tito. ¿A qué ciudad o país le llevo?", "Tito a su disposición. ¿Dónde desea buscar?"] },
  LARA:  { amigos: ["Lara aquí. ¿Ciudad o país? Directo.", "Hola, soy Lara. ¿Dónde buscamos hoy?"], formal: ["Buenas, soy Lara. ¿En qué ciudad o país busca usted?", "Lara a su servicio. ¿Dónde le sitúo?"] },
  PUFFO: { amigos: ["Puffo por aquí. ¿A qué rincón del mundo te llevo?", "Aquí Puffo. Dime dónde y te abro la puerta."], formal: ["Buenas, soy Puffo. ¿A qué ciudad o país le dirijo?", "Puffo a su disposición. ¿Cuál es su destino?"] },
};

// ─────────────────────────────────────────────────────────────────────
// SECTOR KEYWORDS — el PS los detecta ANTES de llamar a Groq
// ─────────────────────────────────────────────────────────────────────
const SECTOR_KEYWORDS = {
  AUDIO:            ['música', 'musica', 'escuchar', 'canción', 'cancion', 'podcast', 'streaming', 'stream', 'live', 'radio', 'artista', 'banda', 'dj', 'beat', 'playlist', 'song', 'listen'],
  BROSHOP_PRODUCTO: ['comprar', 'producto', 'tienda', 'shop', 'ropa', 'zapatillas', 'tecnología', 'tecnologia', 'hogar', 'precio', 'stock', 'artículo', 'articulo'],
  BROSHOP_SERVICIO: ['servicio', 'profesional', 'peluquería', 'peluqueria', 'taller', 'clases', 'fontanero', 'electricista', 'médico', 'medico', 'abogado', 'asesor'],
  BROSHOP_AVISO:    ['aviso', 'avisos', 'anuncio', 'anuncios', 'tablón', 'tablon', 'segunda mano', 'vendo', 'alquilo', 'busco piso', 'busco trabajo', 'ofrezco', 'demanda', 'oferta personal', 'larry', 'evelyn'],
  REINOS:           ['reinos', 'reino', 'rumores', 'rumor', 'rey', 'reyes', 'reina', 'reinas', 'príncipe', 'principe', 'princesa', 'duque', 'duquesa', 'marqués', 'marques', 'marquesa', 'lord', 'lords', 'lady', 'ladies'],
  ORACULO:          ['oráculo', 'oraculo', 'orumama', 'jaguar', 'horóscopo', 'horoscopo', 'sideral', 'ofiuco', 'carta astral', 'signo', 'ascendente', 'hierbas', 'hierba', 'brebaje', 'remedio natural', 'planta medicinal', 'curandera', 'espiritual', 'espiritualidad', 'luna', 'fase lunar', 'meditación', 'meditacion', 'energía', 'energia', 'chakra', 'vela', 'velas', 'ritual'],
};

// ─────────────────────────────────────────────────────────────────────
// ALIASES GLOBALES — se comprueban ANTES que ciudades/países
// ─────────────────────────────────────────────────────────────────────
const ALIASES_UBICACION = [
  { aliases: ['toda españa', 'toda espana', 'en españa', 'en espana', 'españa entera', 'espana entera', 'por españa', 'por espana', 'españa completa'], valor: 'españa', tipo: 'pais' },
  { aliases: ['global', 'todo el mundo', 'internacional', 'en todo el mundo', 'a nivel mundial', 'mundial', 'cualquier país', 'cualquier pais', 'en cualquier lugar', 'online', 'por internet', 'en internet', 'web', 'digital'], valor: 'global', tipo: 'pais' },
];

const CIUDADES = [
  'paris', 'nueva york', 'tokyo', 'tokio', 'londres',
  'gijon', 'oviedo', 'aviles', 'siero',
  'vigo', 'a coruna', 'ourense', 'lugo', 'santiago de compostela', 'pontevedra', 'ferrol',
  'santander', 'torrelavega',
  'bilbao', 'vitoria gasteiz', 'san sebastian', 'barakaldo', 'getxo', 'irun', 'portugalete',
  'pamplona',
  'zaragoza', 'huesca', 'teruel', 'logrono',
  'barcelona', 'terrassa', 'badalona', 'sabadell', 'lleida', 'tarragona', 'girona', 'manresa', 'mataro', 'reus', 'granollers',
  'sevilla', 'malaga', 'cordoba', 'granada', 'jerez de la frontera', 'almeria', 'huelva', 'marbella', 'cadiz', 'jaen',
  'toledo', 'albacete', 'guadalajara', 'ciudad real', 'cuenca',
  'badajoz', 'caceres', 'merida',
  'palma', 'ibiza', 'ceuta', 'melilla',
  'las palmas de gran canaria', 'santa cruz de tenerife', 'arrecife',
  'valencia', 'alicante', 'elche', 'castellon de la plana', 'torrevieja', 'murcia', 'cartagena',
  'valladolid', 'burgos', 'salamanca', 'leon', 'palencia', 'avila', 'segovia',
  'madrid', 'mostoles', 'alcala de henares', 'fuenlabrada', 'leganes', 'getafe', 'alcorcon',
];

const PAISES = [
  'estados unidos', 'mexico', 'mejico', 'argentina', 'brasil', 'chile', 'colombia', 'peru', 'venezuela', 'uruguay', 'paraguay', 'bolivia', 'ecuador',
  'cuba', 'republica dominicana', 'puerto rico', 'costa rica', 'panama', 'guatemala', 'honduras', 'nicaragua', 'el salvador',
  'francia', 'italia', 'austria', 'españa', 'espana', 'reino unido', 'noruega', 'suecia', 'dinamarca', 'finlandia', 'polonia', 'alemania', 'suiza', 'belgica', 'paises bajos', 'portugal', 'grecia', 'irlanda', 'andorra',
  'china', 'japon', 'india', 'corea del sur', 'singapur', 'tailandia', 'vietnam', 'filipinas', 'indonesia', 'malasia',
  'australia', 'nueva zelanda',
  'marruecos', 'egipto', 'sudafrica', 'nigeria', 'kenia',
  'turquia', 'israel', 'emiratos arabes unidos', 'arabia saudi',
  'canada', 'baleares', 'canarias', 'global',
];

// ─────────────────────────────────────────────────────────────────────
// DETECTORES — exportados para el PS en useAgentChat
// ─────────────────────────────────────────────────────────────────────
export const detectarCiudadPS = (texto) => {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const entry of ALIASES_UBICACION) {
    if (entry.aliases.some(alias => t.includes(alias))) {
      return { valor: entry.valor, tipo: entry.tipo };
    }
  }

  const ciudad = CIUDADES.find(c => t.includes(c.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) || null;
  const pais   = PAISES.find(p   => t.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) || null;

  if (ciudad) return { valor: ciudad, tipo: 'ciudad' };
  if (pais)   return { valor: pais,   tipo: 'pais'   };
  return null;
};

export const detectarSectorPS = (texto) => {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => t.includes(kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
      return sector;
    }
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────
// PROMPT BUILDER — liviano, sin listas, sin duplicación
// ─────────────────────────────────────────────────────────────────────
export const buildOsosPrompt = (contextData) => {
  const {
    oso_id              = 'TITO',
    alias               = 'Ciudadano',
    osos_tono,
    modo,
    port_system_informa,
    sector_detectado,
    ciudad_detectada,
    tipo_ubicacion,
    system_knowledge    = '',   // SK.osos inyectado desde useAgentChat
  } = contextData || {};

  const tono            = osos_tono === 'formal' ? 'formal' : 'amigos';
  const osoDefinicion   = OSOS_PERSONALIDAD[oso_id] || OSOS_PERSONALIDAD['TITO'];
  const saludosOso      = SALUDOS[oso_id]?.[tono]   || SALUDOS['TITO']['amigos'];
  const saludoAleatorio = saludosOso[Math.floor(Math.random() * saludosOso.length)];

  // El PS ya detectó sector y ciudad — solo se los informamos al prompt, sin listas
  const psResumen = [
    sector_detectado  ? `SECTOR YA DETECTADO: ${sector_detectado}. No preguntes el sector.`          : '',
    ciudad_detectada  ? `UBICACIÓN YA DETECTADA: "${ciudad_detectada}" (${tipo_ubicacion === 'pais' ? 'país/región' : 'ciudad'}). No la preguntes.` : '',
  ].filter(Boolean).join('\n');

  const datosInternos = port_system_informa?.length > 0
    ? `ECOSISTEMA: ${JSON.stringify(port_system_informa)}\n`
    : '';

  return `
# ROLE
${osoDefinicion}
Eres el portero de BRO7VISION. Tu único trabajo: saber A QUÉ SECTOR va el ciudadano y DÓNDE quiere buscar. Nada más.

# CONOCIMIENTO DE SECTORES
${system_knowledge}

# ESTADO ACTUAL (resuelto por el sistema antes de llegar aquí)
${psResumen || 'Sector y ubicación: desconocidos. Pregunta lo que falte.'}
${datosInternos}

# REGLAS — solo 5
1. MÁXIMO 1 pregunta por turno. Una frase de personalidad + la pregunta. Nunca más de 2 frases.
2. No preguntes detalles del sector (qué artista, qué producto, qué servicio). Eso lo hacen los otros agentes.
3. REINOS y ORACULO no necesitan ubicación. Si el ciudadano los pide → bolas Sí/No para confirmar → handoff.
4. Si tienes sector Y ubicación válida → handoff inmediato. Sin preguntar nada más.
5. INMERSIÓN ABSOLUTA. Nunca menciones "sistema", "base de datos" ni "código".

# BOLAS — CONTRATO ESTRICTO
Las bolas son SIEMPRE [{texto:"Sí"},{texto:"No"}] o [] (vacías). NUNCA otro contenido.
Úsalas SOLO para confirmar:
- "España" sola sin contexto → "¿Buscamos en toda España?" + bolas Sí/No
- REINOS detectado → "¿Quieres ir a Reinos?" + bolas Sí/No
- ORACULO detectado → "¿Consulto al Oráculo?" + bolas Sí/No
En cualquier otro caso → bolas vacías [].

# SALUDO INICIAL (solo modo 'entrada', primer turno)
"${saludoAleatorio}"

# FORMATO JSON OBLIGATORIO

// Esperando info — sin handoff:
{
  "handoff": false,
  "mensaje": "frase corta con personalidad + pregunta concreta",
  "bolas": [] | [{"texto":"Sí"},{"texto":"No"}]
}

// Con handoff — sectores con ubicación (AUDIO, BROSHOP_*):
{
  "handoff": true,
  "agente_destino": "AUDIO" | "BROSHOP_PRODUCTO" | "BROSHOP_SERVICIO" | "BROSHOP_AVISO",
  "mensaje_despedida": "frase corta con personalidad",
  "bolas": [],
  "contexto": {
    "ciudad": "[ciudad o país confirmado]",
    "cp": null,
    "intencion": "[agente_destino]",
    "comercio_especifico": null,
    "modalidad": "[ONLINE si es país/global, sino null]"
  }
}

// Con handoff — REINOS o ORACULO (sin ubicación):
{
  "handoff": true,
  "agente_destino": "REINOS" | "ORACULO",
  "mensaje_despedida": "frase corta con personalidad",
  "bolas": [],
  "contexto": {
    "ciudad": null,
    "cp": null,
    "intencion": "[agente_destino]",
    "comercio_especifico": null,
    "modalidad": null
  }
}
`;
};
