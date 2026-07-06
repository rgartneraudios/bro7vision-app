// src/services/agents/ososPS.js

import { getPerfil, TABLA_PER, PREFIJOS_COMERCIO } from '../../data/system_profiles';

// ─────────────────────────────────────────────────────────────────────
// SALUDOS
// ─────────────────────────────────────────────────────────────────────
const SALUDOS = {
  TITO:  { amigos: ["Tito al habla. ¿A qué zona del mundo te llevo hoy?", "Buenas. ¿Ciudad, país, o me dices directamente qué buscas?"], formal: ["Buenas tardes, soy Tito. ¿A qué ciudad o país le llevo?", "Tito a su disposición. ¿Dónde desea buscar?"] },
  LARA:  { amigos: ["Lara aquí. ¿Ciudad o país? Directo.", "Hola, soy Lara. ¿Dónde buscamos hoy?"], formal: ["Buenas, soy Lara. ¿En qué ciudad o país busca usted?", "Lara a su servicio. ¿Dónde le sitúo?"] },
  PUFFO: { amigos: ["Puffo por aquí. ¿A qué rincón del mundo te llevo?", "Aquí Puffo. Dime dónde y te abro la puerta."], formal: ["Buenas, soy Puffo. ¿A qué ciudad o país le dirijo?", "Puffo a su disposición. ¿Cuál es su destino?"] },
};

// ─────────────────────────────────────────────────────────────────────
// SECTOR KEYWORDS
// ─────────────────────────────────────────────────────────────────────
const SECTOR_KEYWORDS = {
  CANJEAR: ['canje', 'canjear', 'luna', 'lunas',
  'tarjetas', 'regalos', 'regalo'],
  BRODESEOS: ['deseo', 'deseos', 'brodeseos', 'bro deseos', 'larry', 'evelyn'],
   REINOS:           ['reinos', 'reino', 'rumores', 'rumor', 'rey', 'reyes', 'reina', 'reinas', 'príncipe', 'principe', 'princesa', 'duque', 'duquesa', 'marqués', 'marques', 'marquesa', 'lord', 'lords', 'lady', 'ladies'],
  BRO7BAND:          ['bro7', 'bro7band', 'band', 'jaguar', 'personajes', 'orumama', 'misterio', 'audios', 'capitulos', 'historias', 'ascendente', 'misterio', 'conspiraciones', 'piramides', 'mapache', 'ami', 'señor misterio', 'profesor', 'isabella', 'señormisterio', 'elefantes', 'nova'],
  GAMES:            ['jugar', 'juego', 'juegos', '3iatlas', 'telecronos', 'games', 'game', 'arcade', 'partida', 'divertirse', 'divertirme', 'carrera', 'scalextric', 'neon', 'neonmemory', 'f1rookie', 'f1pro', 'cosmicportal', 'the7gates', 'therians'],
};

// ─────────────────────────────────────────────────────────────────────
// ALIASES Y LISTAS DE UBICACIÓN
// ─────────────────────────────────────────────────────────────────────
const ALIASES_UBICACION = [
  { aliases: ['toda españa', 'toda espana', 'en españa', 'en espana', 'españa entera', 'espana entera', 'por españa', 'por espana', 'españa completa'], valor: 'españa', tipo: 'pais' },
  { aliases: ['global', 'todo el mundo', 'internacional', 'en todo el mundo', 'a nivel mundial', 'mundial', 'cualquier país', 'cualquier pais', 'en cualquier lugar', 'online', 'por internet', 'en internet', 'web', 'digital'], valor: 'global', tipo: 'pais' },
];

const CIUDADES = [
  // Ciudades VIP
  'paris', 'nueva york', 'tokyo', 'tokio', 'londres',
  
  // Asturias
  'gijon', 'oviedo', 'aviles', 'siero',
  
  // Galicia
  'vigo', 'a coruna', 'ourense', 'lugo', 'santiago de compostela', 'pontevedra', 'ferrol',
  
  // Cantabria
  'santander', 'torrelavega',
  
  // País Vasco y Navarra
  'bilbao', 'vitoria gasteiz', 'san sebastian', 'barakaldo', 'getxo', 'irun', 'portugalete', 'santurtzi', 'basauri',
  'pamplona',
  
  // Aragón y La Rioja
  'zaragoza', 'huesca', 'teruel', 'logrono',
  
  // Cataluña
  'barcelona', 'l hospitalet de llobregat', 'terrassa', 'badalona', 'sabadell', 'lleida', 'calella', 'calella de mar', 
  'sant pol', 'sant pol de mar', 'tarragona', 'girona', 'manresa', 'mataro', 'santa coloma de gramenet', 'reus', 
  'sant cugat del valles', 'cornella de llobregat', 'sant boi de llobregat', 'rubi', 'vilanova i la geltru', 
  'castelldefels', 'viladecans', 'el prat de llobregat', 'granollers', 'cerdanyola del valles', 'mollet del valles',
  
  // Andalucía
  'sevilla', 'malaga', 'cordoba', 'granada', 'jerez de la frontera', 'jerez', 'almeria', 'huelva', 'marbella', 'dos hermanas', 
  'algeciras', 'cadiz', 'jaen', 'roquetas de mar', 'san fernando', 'el puerto de santa maria', 'mijas', 
  'chiclana de la frontera', 'el ejido', 'fuengirola', 'velez malaga', 'alcala de guadaira', 'torremolinos', 
  'estepona', 'benalmadena', 'sanlucar de barrameda', 'linares', 'la linea de la concepcion', 'motril', 'utrera',
  
  // Castilla La Mancha
  'toledo', 'albacete', 'guadalajara', 'talavera de la reina', 'talavera', 'ciudad real', 'cuenca', 'puertollano',
  
  // Extremadura y zona Oeste
  'badajoz', 'caceres', 'merida', 'zamora',
  
  // Baleares (Ciudades)
  'palma', 'calvia', 'eivissa', 'manacor', 'ibiza',
  
  // Canarias (Ciudades e islas tratadas como ciudades)
  'las palmas de gran canaria', 'santa cruz de tenerife', 'tenerife', 'san cristobal de la laguna', 'telde', 
  'arona', 'santa lucia de tirajana', 'arrecife', 'san bartolome de tirajana', 'adeje', 'puerto del rosario',
  
  // Ceuta y Melilla
  'ceuta', 'melilla',
  
  // Comunidad Valenciana y Murcia
  'valencia', 'alicante', 'elche', 'castellon de la plana', 'torrevieja', 'torrent', 'orihuela', 'gandia', 
  'paterna', 'benidorm', 'sagunto', 'alcoy', 'san vicente del raspeig', 'elda', 'vila real', 'denia',
  'murcia', 'cartagena', 'lorca', 'molina de segura',
  
  // Castilla y León
  'valladolid', 'burgos', 'salamanca', 'leon', 'palencia', 'avila', 'segovia', 'ponferrada',
  
  // Comunidad de Madrid
  'madrid', 'mostoles', 'alcala de henares', 'fuenlabrada', 'leganes', 'getafe', 'alcorcon', 'torrejon de ardoz', 
  'parla', 'alcobendas', 'las rozas de madrid', 'san sebastian de los reyes', 'rivas vaciamadrid', 
  'pozuelo de alarcon', 'coslada', 'valdemoro', 'majadahonda', 'collado villalba', 'aranjuez', 
  'boadilla del monte', 'arganda del rey', 'pinto', 'colmenar viejo'
];

const PAISES = [
  // América del Norte y Sur
  'estados unidos', 'mexico', 'mejico', 'argentina', 'brasil', 'chile', 'colombia', 'peru', 'venezuela', 'uruguay', 
  'paraguay', 'bolivia', 'ecuador', 'belice', 'guyana', 'surinam', 'canada',
  
  // Centroamérica y Caribe
  'cuba', 'republica dominicana', 'puerto rico', 'jamaica', 'bahamas', 'costa rica', 'panama', 'guatemala', 
  'honduras', 'nicaragua', 'el salvador', 'antigua y barbuda', 'barbados', 'dominica', 'granada caribe', 
  'haiti', 'san cristobal y nieves', 'san vicente y las granadinas', 'santa lucia', 'trinidad y tobago',
  
  // Europa Central, Occidental y Sur
  'francia', 'italia', 'austria', 'españa', 'espana', 'reino unido', 'alemania', 'suiza', 'belgica', 
  'paises bajos', 'luxemburgo', 'irlanda', 'monaco', 'andorra', 'portugal', 'grecia', 'malta', 'chipre',
  
  // Europa Norte, Este y Balcanes
  'noruega', 'suecia', 'dinamarca', 'finlandia', 'islandia', 'estonia', 'letonia', 'lituania', 'polonia', 
  'republica checa', 'eslovaquia', 'hungria', 'albania', 'croacia', 'serbia', 'bosnia y herzegovina', 
  'montenegro', 'macedonia del norte', 'eslovenia', 'bulgaria', 'rumania', 'ucrania', 'moldavia', 'rusia', 'bielorrusia',
  
  // Asia Oriental y Sudeste Asiático
  'china', 'japon', 'corea del norte', 'corea del sur', 'mongolia', 'taiwan', 'singapur', 'tailandia', 
  'vietnam', 'filipinas', 'indonesia', 'malasia', 'brunei', 'camboya', 'laos', 'myanmar', 'timor oriental',
  
  // Asia Central y Sur
  'india', 'afganistan', 'kazajistan', 'kirguistan', 'tayikistan', 'turkmenistan', 'uzbekistan', 
  'banglades', 'butan', 'maldivas', 'nepal', 'pakistan', 'sri lanka',
  
  // Oriente Medio y el Cáucaso
  'turquia', 'israel', 'emiratos arabes unidos', 'arabia saudi', 'armenia', 'azerbaiyan', 'barein', 
  'georgia', 'irak', 'iran', 'jordania', 'kuwait', 'libano', 'oman', 'palestina', 'catar', 'siria', 'yemen',
  
  // África (Norte)
  'marruecos', 'egipto', 'argelia', 'libia', 'tunez', 'mauritania', 'sahara occidental',
  
  // África (Subsahariana)
  'sudafrica', 'nigeria', 'kenia', 'benin', 'burkina faso', 'cabo verde', 'costa de marfil', 'gambia', 
  'ghana', 'guinea', 'guinea bisau', 'liberia', 'mali', 'niger', 'senegal', 'sierra leona', 'togo', 
  'burundi', 'comoras', 'yibuti', 'eritrea', 'etiopia', 'madagascar', 'malaui', 'mauricio', 'mozambique', 
  'ruanda', 'seychelles', 'somalia', 'tanzania', 'uganda', 'zambia', 'zimbabue', 'angola', 'botsuana', 
  'camerun', 'chad', 'congo', 'gabon', 'guinea ecuatorial', 'lesoto', 'namibia', 'republica centroafricana', 
  'republica democratica del congo', 'suazilandia',
  
  // Oceanía
  'australia', 'nueva zelanda', 'fiyi', 'islas marshall', 'islas salomon', 'kiribati', 'micronesia', 
  'nauru', 'palaos', 'papua nueva guinea', 'samoa', 'tonga', 'tuvalu', 'vanuatu',
  
  // Zonas genéricas o agrupaciones autonómicas usadas como país
  'baleares', 'canarias', 'global'
];
// ─────────────────────────────────────────────────────────────────────
// DETECTORES EXISTENTES
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
// PROMPT BUILDER — personalidad desde system_profiles
// ─────────────────────────────────────────────────────────────────────
export const buildOsosPrompt = (contextData) => {
  const {
    oso_id              = 'TITO',
    alias               = 'Ciudadano',
    osos_tono,
    port_system_informa,
    sector_detectado,
    ciudad_detectada,
    tipo_ubicacion,
    system_knowledge    = '',
  } = contextData || {};

  const tono = osos_tono === 'formal' ? 'formal' : 'amigos';

  // ── Perfil desde system_profiles ──────────────────────────────────
  const perfil          = getPerfil(oso_id.toLowerCase()) || getPerfil('tito');
  const frase_ancla     = perfil.frase_ancla;
  const personalidad    = perfil.personalidad;
  const gustos          = perfil.gustos_comida.join(', ');

  const saludosOso      = SALUDOS[oso_id]?.[tono] || SALUDOS['TITO']['amigos'];
  const saludoAleatorio = saludosOso[Math.floor(Math.random() * saludosOso.length)];

  const psResumen = [
    sector_detectado ? `SECTOR YA DETECTADO: ${sector_detectado}. No preguntes el sector.`                                                             : '',
    ciudad_detectada ? `UBICACIÓN YA DETECTADA: "${ciudad_detectada}" (${tipo_ubicacion === 'pais' ? 'país/región' : 'ciudad'}). No la preguntes.` : '',
  ].filter(Boolean).join('\n');

  const datosInternos = port_system_informa?.length > 0
    ? `ECOSISTEMA: ${JSON.stringify(port_system_informa)}\n`
    : '';

  return `
# IDENTIDAD
${frase_ancla}
Carácter: ${personalidad}
Lo que te gusta comer: ${gustos}

# ROLE
Eres el portero de BRO7VISION. Tu único trabajo: saber A QUÉ SECTOR va el ciudadano y DÓNDE quiere buscar. Nada más.

# CONOCIMIENTO DE SECTORES Y EQUIPO
${system_knowledge}

# ESTADO ACTUAL (resuelto por el sistema antes de llegar aquí)
${psResumen || 'Sector y ubicación: desconocidos. Pregunta lo que falte.'}
${datosInternos}

# REGLAS — solo 5
1. MÁXIMO 1 pregunta por turno. Una frase de personalidad + la pregunta. Nunca más de 2 frases.
2. No preguntes detalles del sector (qué artista, qué producto, qué servicio). Eso lo hacen los otros agentes.
3. REINOS, GAMES y BRO7BAND no necesitan ubicación. Si el ciudadano los pide → bolas Sí/No para confirmar → handoff.
4. Si tienes sector Y ubicación válida → handoff inmediato. Sin preguntar nada más.
5. INMERSIÓN ABSOLUTA. Nunca menciones "sistema", "base de datos" ni "código".

# BOLAS — CONTRATO ESTRICTO
Las bolas son SIEMPRE [{texto:"Sí"},{texto:"No"}] o [] (vacías). NUNCA otro contenido.
Úsalas SOLO para confirmar:
- "España" sola sin contexto → "¿Buscamos en toda España?" + bolas Sí/No
- REINOS detectado → "¿Quieres ir a Reinos?" + bolas Sí/No
- ORACULO detectado → "¿Consulto al Oráculo?" + bolas Sí/No
- GAMES detectado  → "¿Abrimos la sala de juegos?" + bolas Sí/No
- BRO7BAND detectado → "¿Entramos a Bro7Band?" + bolas Sí/No
En cualquier otro caso → bolas vacías [].

# SALUDO INICIAL (solo primer turno)
"${saludoAleatorio}"

# FORMATO JSON OBLIGATORIO

// Esperando info — sin handoff:
{
  "handoff": false,
  "mensaje": "frase corta con personalidad + pregunta concreta",
  "bolas": [] | [{"texto":"Sí"},{"texto":"No"}]
}

// Con handoff — sectores con ubicación (CANJEAR, BRODESEOS):
{
  "handoff": true,
  "agente_destino": "CANJEAR" | "BRODESEOS",
  "mensaje_despedida": "frase corta con personalidad",
  "bolas": [],
  "contexto": {
    "ciudad": "[ciudad o pais confirmado]",
    "cp": null,
    "intencion": "[agente_destino]",
    "comercio_especifico": null,
    "modalidad": "[ONLINE si es país/global, sino null]"
  }
}

// Con handoff — REINOS, GAMES, BRO7BAND (sin ubicación):
{
  "handoff": true,
  "agente_destino": "REINOS" | "GAMES" | "BRO7BAND",
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
