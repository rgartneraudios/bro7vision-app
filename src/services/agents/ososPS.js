// src/services/agents/ososPS.js

const SALUDOS = {
  TITO: {
    amigos: [
      "¡Ey! Soy Tito. ¿A qué zona del mundo te llevo hoy?",
      "Tito al habla. Dime dónde estás o adónde quieres ir.",
      "Buenas. ¿Ciudad, país, o me dices directamente qué buscas?",
    ],
    formal: [
      "Buenas tardes, soy Tito. ¿A qué ciudad o país le llevo hoy?",
      "Tito a su disposición. ¿Dónde desea buscar?",
      "Bienvenido. Indíqueme su ciudad o país y le oriento.",
    ],
  },
  LARA: {
    amigos: [
      "Lara aquí. ¿Ciudad o país? Directo.",
      "Hola, soy Lara. ¿Dónde buscamos hoy?",
      "¿Qué zona del mundo? Soy Lara, te llevo.",
    ],
    formal: [
      "Buenas, soy Lara. ¿En qué ciudad o país busca usted?",
      "Lara a su servicio. ¿Dónde le sitúo?",
      "Encantada. ¿Ciudad o país de destino?",
    ],
  },
  PUFFO: {
    amigos: [
      "Puffo por aquí. ¿A qué rincón del mundo te llevo?",
      "Hola, soy Puffo. ¿Ciudad, país, o región?",
      "Aquí Puffo. Dime dónde y te abro la puerta.",
    ],
    formal: [
      "Buenas, soy Puffo. ¿A qué ciudad o país le dirijo?",
      "Puffo a su disposición. ¿Cuál es su destino?",
      "Bienvenido. ¿Ciudad o país de búsqueda?",
    ],
  },
};

const OSOS_PERSONALIDAD = {
  LARA:  "Eres Lara: Intelectual, analítica, directa y de mente brillante. No usas plásticos. Te gustan las tartas de queso, los postres y te apasiona la cocina mediterránea.",
  TITO:  "Eres Tito: Filósofo y escritor. Reflexivo, pausado y cercano. No usas plásticos. Te encanta el Té de especialidad y los mercados locales.",
  PUFFO: "Eres Puffo: La voz de la experiencia. Sabio, calmado y carismático. No usas plásticos. Eres aficionado a los quesos especiales, las pizzas y las pastas.",
};

// ─────────────────────────────────────────────────────────────────────
// SECTOR KEYWORDS
// ─────────────────────────────────────────────────────────────────────
const SECTOR_KEYWORDS = {
  AUDIO:            ['música', 'musica', 'escuchar', 'canción', 'cancion', 'podcast', 'streaming', 'stream', 'live', 'radio', 'artista', 'banda', 'dj', 'beat', 'playlist', 'song', 'listen'],
  BROSHOP_PRODUCTO: ['comprar', 'producto', 'tienda', 'shop', 'ropa', 'zapatillas', 'tecnología', 'tecnologia', 'hogar', 'precio', 'stock', 'artículo', 'articulo'],
  BROSHOP_SERVICIO: ['servicio', 'profesional', 'peluquería', 'peluqueria', 'taller', 'clases', 'fontanero', 'electricista', 'médico', 'medico', 'abogado', 'asesor'],
  BROSHOP_AVISO:    ['aviso', 'avisos', 'anuncio', 'anuncios', 'tablón', 'tablon', 'segunda mano', 'vendo', 'alquilo', 'busco piso', 'busco trabajo', 'ofrezco', 'demanda', 'oferta personal', 'larry', 'evelyn'],
  // REINOS — títulos nobiliarios y keywords directas
  REINOS:           [
    'reinos', 'reino', 'rumores', 'rumor', 'listado de reinos',
    'rey', 'reyes', 'reina', 'reinas', 'príncipe', 'principe', 'príncipes', 'principes',
    'princesa', 'princesas', 'duque', 'duques', 'duquesa', 'duquesas',
    'marqués', 'marques', 'marquesa', 'marquesas', 'lord', 'lords', 'lady', 'ladies',
  ],
  // ORÁCULO — hierbas, horóscopo, espiritualidad, luna
  ORACULO:          [
    'oráculo', 'oraculo', 'orumama', 'jaguar', 'horóscopo', 'horoscopo',
    'sideral', 'ofiuco', 'carta astral', 'signo', 'ascendente',
    'hierbas', 'hierba', 'brebaje', 'remedio natural', 'planta medicinal',
    'curandera', 'espiritual', 'espiritualidad', 'luna', 'fase lunar',
    'meditación', 'meditacion', 'energía', 'energia', 'chakra',
    'vela', 'velas', 'ritual', 'naturaleza',
  ],
};

// ─────────────────────────────────────────────────────────────────────
// ALIASES GLOBALES — España, Global, etc.
// ─────────────────────────────────────────────────────────────────────
const ALIASES_UBICACION = [
  { aliases: ['toda españa', 'toda espana', 'en españa', 'en espana', 'españa entera', 'espana entera', 'por españa', 'por espana', 'españa completa'], valor: 'españa', tipo: 'pais' },
  { aliases: ['global', 'todo el mundo', 'internacional', 'en todo el mundo', 'a nivel mundial', 'mundial', 'cualquier país', 'cualquier pais', 'en cualquier lugar'], valor: 'global', tipo: 'pais' },
  { aliases: ['online', 'por internet', 'en internet', 'web', 'digital'], valor: 'global', tipo: 'pais' },
];

const CIUDADES = [
  'paris', 'nueva york', 'tokyo', 'tokio', 'londres',
  'gijon', 'oviedo', 'aviles', 'siero',
  'vigo', 'a coruna', 'ourense', 'lugo', 'santiago de compostela', 'pontevedra', 'ferrol',
  'santander', 'torrelavega',
  'bilbao', 'vitoria gasteiz', 'san sebastian', 'barakaldo', 'getxo', 'irun', 'portugalete', 'santurtzi', 'basauri',
  'pamplona',
  'zaragoza', 'huesca', 'teruel',
  'logrono',
  'barcelona', 'l hospitalet de llobregat', 'terrassa', 'badalona', 'sabadell', 'lleida', 'calella', 'calella de mar', 'sant pol', 'sant pol de mar', 'tarragona', 'girona', 'manresa', 'mataro', 'santa coloma de gramenet', 'reus', 'sant cugat del valles', 'cornella de llobregat', 'sant boi de llobregat', 'rubi', 'vilanova i la geltru', 'castelldefels', 'viladecans', 'el prat de llobregat', 'granollers', 'cerdanyola del valles', 'mollet del valles',
  'sevilla', 'malaga', 'cordoba', 'granada', 'jerez de la frontera', 'almeria', 'huelva', 'marbella', 'dos hermanas', 'algeciras', 'cadiz', 'jaen', 'roquetas de mar', 'san fernando', 'el puerto de santa maria', 'mijas', 'chiclana de la frontera', 'el ejido', 'fuengirola', 'velez malaga', 'alcala de guadaira', 'torremolinos', 'estepona', 'benalmadena', 'sanlucar de barrameda', 'linares', 'la linea de la concepcion', 'motril', 'utrera',
  'toledo', 'albacete', 'guadalajara', 'talavera de la reina', 'ciudad real', 'cuenca', 'puertollano',
  'badajoz', 'caceres', 'merida', 'zamora',
  'palma', 'calvia', 'eivissa', 'manacor', 'ibiza', 'ceuta', 'melilla',
  'las palmas de gran canaria', 'santa cruz de tenerife', 'san cristobal de la laguna', 'telde', 'arona', 'santa lucia de tirajana', 'arrecife', 'san bartolome de tirajana', 'adeje', 'puerto del rosario',
  'valencia', 'alicante', 'elche', 'castellon de la plana', 'torrevieja', 'torrent', 'orihuela', 'gandia', 'paterna', 'benidorm', 'sagunto', 'alcoy', 'san vicente del raspeig', 'elda', 'vila real', 'denia', 'murcia', 'cartagena', 'lorca', 'molina de segura',
  'valladolid', 'burgos', 'salamanca', 'leon', 'palencia', 'avila', 'segovia', 'ponferrada',
  'madrid', 'mostoles', 'alcala de henares', 'fuenlabrada', 'leganes', 'getafe', 'alcorcon', 'torrejon de ardoz', 'parla', 'alcobendas', 'las rozas de madrid', 'san sebastian de los reyes', 'rivas vaciamadrid', 'pozuelo de alarcon', 'coslada', 'valdemoro', 'majadahonda', 'collado villalba', 'aranjuez', 'boadilla del monte', 'arganda del rey', 'pinto', 'colmenar viejo',
];

const PAISES = [
  'estados unidos', 'mexico', 'mejico', 'argentina', 'brasil', 'belice', 'bolivia', 'canada', 'chile', 'colombia', 'ecuador', 'el salvador', 'guatemala', 'guyana', 'honduras', 'nicaragua', 'panama', 'paraguay', 'peru', 'surinam', 'uruguay', 'venezuela',
  'cuba', 'republica dominicana', 'puerto rico', 'jamaica', 'bahamas', 'costa rica', 'antigua y barbuda', 'barbados', 'dominica', 'granada caribe', 'haiti', 'san cristobal y nieves', 'san vicente y las granadinas', 'santa lucia', 'trinidad y tobago',
  'francia', 'italia', 'austria', 'españa', 'espana', 'reino unido', 'noruega', 'suecia', 'dinamarca', 'finlandia', 'islandia', 'estonia', 'letonia', 'lituania', 'polonia', 'alemania', 'suiza', 'belgica', 'paises bajos', 'luxemburgo', 'republica checa', 'eslovaquia', 'hungria', 'irlanda', 'monaco', 'andorra', 'portugal', 'grecia', 'malta', 'chipre', 'albania', 'croacia', 'serbia', 'bosnia y herzegovina', 'montenegro', 'macedonia del norte', 'eslovenia', 'bulgaria', 'rumania', 'ucrania', 'moldavia', 'georgia', 'rusia', 'bielorrusia',
  'china', 'japon', 'afganistan', 'kazajistan', 'kirguistan', 'tayikistan', 'turkmenistan', 'uzbekistan', 'corea del norte', 'corea del sur', 'mongolia', 'taiwan', 'brunei', 'camboya', 'filipinas', 'indonesia', 'laos', 'malasia', 'myanmar', 'singapur', 'tailandia', 'timor oriental', 'vietnam', 'banglades', 'butan', 'india', 'maldivas', 'nepal', 'pakistan', 'sri lanka', 'arabia saudi', 'armenia', 'azerbaiyan', 'barein', 'emiratos arabes unidos', 'irak', 'iran', 'israel', 'jordania', 'kuwait', 'libano', 'oman', 'palestina', 'catar', 'siria', 'turquia', 'yemen',
  'argelia', 'egipto', 'libia', 'marruecos', 'tunez', 'mauritania', 'sahara occidental', 'benin', 'burkina faso', 'cabo verde', 'costa de marfil', 'gambia', 'ghana', 'guinea', 'guinea bisau', 'liberia', 'mali', 'niger', 'nigeria', 'senegal', 'sierra leona', 'togo', 'burundi', 'comoras', 'yibuti', 'eritrea', 'etiopia', 'kenia', 'madagascar', 'malaui', 'mauricio', 'mozambique', 'ruanda', 'seychelles', 'somalia', 'tanzania', 'uganda', 'zambia', 'zimbabue', 'angola', 'botsuana', 'camerun', 'chad', 'congo', 'gabon', 'guinea ecuatorial', 'lesoto', 'namibia', 'republica centroafricana', 'republica democratica del congo', 'sudafrica', 'suazilandia',
  'australia', 'fiyi', 'islas marshall', 'islas salomon', 'kiribati', 'micronesia', 'nauru', 'nueva zelanda', 'palaos', 'papua nueva guinea', 'samoa', 'tonga', 'tuvalu', 'vanuatu',
  'baleares', 'canarias', 'global',
];

// ─────────────────────────────────────────────────────────────────────
// DETECTOR DE CIUDAD / PAÍS
// ─────────────────────────────────────────────────────────────────────
export const detectarCiudadPS = (texto) => {
  const t = texto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const entry of ALIASES_UBICACION) {
    if (entry.aliases.some(alias => t.includes(alias))) {
      return { valor: entry.valor, tipo: entry.tipo };
    }
  }

  const ciudad = CIUDADES.find(c =>
    t.includes(c.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  ) || null;

  const pais = PAISES.find(p =>
    t.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  ) || null;

  if (ciudad) return { valor: ciudad, tipo: 'ciudad' };
  if (pais)   return { valor: pais,   tipo: 'pais'   };
  return null;
};

// ─────────────────────────────────────────────────────────────────────
// DETECTOR DE SECTOR
// ─────────────────────────────────────────────────────────────────────
export const detectarSectorPS = (texto) => {
  const t = texto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => t.includes(kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
      return sector;
    }
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────
// PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────
export const buildOsosPrompt = (contextData) => {
  const {
    oso_id          = 'TITO',
    alias           = 'Ciudadano',
    ciudad          = '',
    cp              = '',
    osos_tono,
    osos_intereses,
    osos_frase,
    modo,
    port_system_informa,
    sector_detectado,
    ciudad_detectada,
    tipo_ubicacion,
  } = contextData || {};

  const ubicacionInfo = ciudad_detectada
    ? `# PORT SYSTEM DETECTÓ UBICACIÓN: "${ciudad_detectada}" (${tipo_ubicacion === 'pais' ? 'país/región' : 'ciudad'}). NO la preguntes. Úsala directamente.`
    : '';

  const tono          = osos_tono === 'formal' ? 'formal' : 'amigos';
  const osoDefinicion = OSOS_PERSONALIDAD[oso_id] || OSOS_PERSONALIDAD['TITO'];
  const saludosOso    = SALUDOS[oso_id]?.[tono] || SALUDOS['TITO']['amigos'];
  const saludoAleatorio = saludosOso[Math.floor(Math.random() * saludosOso.length)];

  const datosInternos = port_system_informa?.length > 0
    ? `\n# MEMORIA DEL ECOSISTEMA\n${JSON.stringify(port_system_informa)}\nÚsalos con naturalidad.\n`
    : '';

  const sectorInfo = sector_detectado
    ? `\n# PORT SYSTEM YA DETECTÓ EL SECTOR: ${sector_detectado}\nNo preguntes sobre el sector. Solo confirma con bolas SI/NO si el sector necesita confirmación (REINOS, ORACULO). Para el resto, handoff directo si tienes ubicación.\n`
    : '';

  return `
# ROLE
${osoDefinicion}
Eres el portero de BRO7VISION. Tu trabajo: averiguar DÓNDE quiere buscar el ciudadano y A QUÉ SECTOR va. Nada más.

El ciudadano ve un video de los osos grabando un podcast. Son sesiones pasadas. Si pregunta, díselo con naturalidad.

# CONTEXTO
- Nombre: ${alias}
- Ubicación conocida: ${ciudad || 'no especificada'}
- Tono: ${tono}
- Intereses: ${osos_intereses || ''}
- Info extra: ${osos_frase || ''}
- Modo: ${modo || 'entrada'}
${datosInternos}
${sectorInfo}
${ubicacionInfo}

# LOS SECTORES DE BROVISION
1. AUDIO → música, podcasts, lives, streams
2. BROSHOP_PRODUCTO → comprar productos físicos
3. BROSHOP_SERVICIO → contratar servicios o profesionales
4. BROSHOP_AVISO → avisos, anuncios, tablón, segunda mano, busco/ofrezco
5. REINOS → directorio de perfiles del ecosistema. Reyes, Reinas, Duques, Lords, Ladys, Rumores. NO necesita ubicación. Handoff directo.
6. ORACULO → consultas espirituales, horóscopo sideral, fases lunares, hierbas naturales, remedios, Orumama, Jaguar. NO necesita ubicación. Handoff directo.

# REGLAS DE LAS BOLAS SI/NO
Las bolas SOLO son "Sí" y "No". Se usan ÚNICAMENTE para confirmar antes de hacer handoff:
- UBICACIÓN AMBIGUA: el user dice "España" sin aclarar si quiere toda España → bolas "Sí" / "No" → "¿Buscamos en toda España?"
- REINOS detectado: → bolas "Sí" / "No" → "¿Quieres ir al sector Reinos?"
- ORÁCULO detectado: → bolas "Sí" / "No" → "¿Quieres consultar al Oráculo?"
- Si el user responde "sí" en texto libre → handoff inmediato
- Si el user responde "no" en texto libre o pulsa bola No → continuar conversando, pregunta alternativa

# REGLAS DE ORO
1. MÁXIMO 1 pregunta por turno. Nunca dos a la vez.
2. BREVEDAD: nunca más de 2 frases. Una frase de personalidad + la pregunta.
3. NO seas el DJ, el vendedor ni el asesor. Eso lo hacen los otros agentes.
4. NO preguntes detalles del sector (qué artista, qué producto). Solo el sector.
5. Si el ciudadano dice "música" → sector = AUDIO. Si dice "comprar" → BROSHOP_PRODUCTO.
6. REINOS y ORÁCULO no necesitan ubicación. Confirma con bolas SI/NO y handoff.
7. Para sectores de BROSHOP y AUDIO: si tienes ubicación clara → handoff inmediato.
8. "España" sola → pregunta con bolas SI/NO: "¿Buscamos en toda España?" Sí confirma → handoff con modalidad ONLINE.
9. "España entera", "toda España", "online", "global", "todo el mundo" → ubicación válida directa. Handoff inmediato si tienes sector.
10. INMERSIÓN ABSOLUTA: nunca menciones "sistema", "base de datos" ni "código".
11. JSON estricto siempre. Nunca texto libre fuera del JSON.

# FRASES DE DESPEDIDA CON PERSONALIDAD (ejemplos, adáptalas)
- AUDIO + México → "¡Música mexicana, qué buen gusto. Mapache te está esperando."
- BROSHOP_PRODUCTO + Madrid → "Madrid, cuna del estilo. Nova ya tiene el escaparate listo."
- BROSHOP_AVISO + Barcelona → "Barcelona no para. El tablón de avisos ya está abierto."
- BROSHOP_SERVICIO + Sevilla → "Sevilla tiene grandes profesionales. Te conecto ahora mismo."
- REINOS → "Los reinos te esperan. Que empiece el recuento."
- ORACULO → "El Oráculo está despierto. Pasa con cuidado."

# SALUDO INICIAL (solo modo 'entrada', primer mensaje)
- Saludo o conversación → usa: "${saludoAleatorio}"
- Búsqueda directa con ubicación Y sector claros → handoff inmediato, sin saludar

# FORMATO JSON — OBLIGATORIO, sin texto libre fuera

// Sin handoff — falta info o esperando confirmación:
{
  "handoff": false,
  "mensaje": "frase de personalidad + pregunta concreta",
  "bolas": [{ "texto": "Sí" }, { "texto": "No" }]
}

// Sin handoff — sin necesidad de confirmación binaria (pregunta abierta):
{
  "handoff": false,
  "mensaje": "frase de personalidad + pregunta concreta",
  "bolas": []
}

// Con handoff — BROSHOP / AUDIO (necesitan ubicación):
{
  "handoff": true,
  "agente_destino": "BROSHOP_PRODUCTO" | "BROSHOP_SERVICIO" | "BROSHOP_AVISO" | "AUDIO",
  "mensaje_despedida": "frase corta con personalidad del oso",
  "bolas": [],
  "contexto": {
    "oso_name": "${oso_id}",
    "alias": "${alias}",
    "ciudad": "[ciudad o país o global confirmado]",
    "cp": "[cp o null]",
    "intencion": "[BROSHOP_PRODUCTO|BROSHOP_SERVICIO|BROSHOP_AVISO|AUDIO]",
    "comercio_especifico": "[nombre si lo mencionó, sino null]",
    "modalidad": "[ONLINE|TIENDA|null]"
  }
}

// Con handoff — REINOS (sin ubicación):
{
  "handoff": true,
  "agente_destino": "REINOS",
  "mensaje_despedida": "frase corta con personalidad del oso",
  "bolas": [],
  "contexto": {
    "oso_name": "${oso_id}",
    "alias": "${alias}",
    "ciudad": null,
    "cp": null,
    "intencion": "REINOS",
    "comercio_especifico": null,
    "modalidad": null
  }
}

// Con handoff — ORACULO (sin ubicación):
{
  "handoff": true,
  "agente_destino": "ORACULO",
  "mensaje_despedida": "frase corta con personalidad del oso",
  "bolas": [],
  "contexto": {
    "oso_name": "${oso_id}",
    "alias": "${alias}",
    "ciudad": null,
    "cp": null,
    "intencion": "ORACULO",
    "comercio_especifico": null,
    "modalidad": null
  }
}
`;
};
