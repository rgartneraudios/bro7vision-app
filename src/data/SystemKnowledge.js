// src/data/SystemKnowledge.js
// Bloques comprimidos — solo viaja el bloque relevante a Groq, nunca el archivo entero.

import { getDirectorioTexto } from './system_profiles';

export const SK = {

  sistema: `
BRO7VISION: ecosistema ciudadano digital (neon + bioluminiscente). Creado por RGartner.
FASE 0 (actual): pruebas, sin pagos reales. Los usuarios ganan Génesis jugando/explorando.
FASE 1: se activan pasarelas de pago, BroShop comercial, monetización de creadores.
SECTORES: AUDIO (Mapache/Ami), BROSHOP_PRODUCTO (Nova), BROSHOP_SERVICIO (Isabella/PRMaestro),
BROSHOP_AVISO (Evelyn/Larry), REINOS (directorio nobiliario + Rumores), ORÁCULO (Orumama/Sr.Misterio/Jaguar),
GAMES (8 videojuegos), OSOS (Lara/Tito/Puffo — porteros de navegación).
MONEDA: Génesis (puntos gratuitos). No hay criptomonedas.
VALES DE DESCUENTO SEGUN FASES LUNARES (Fase 1): Nova 5%, Crescens 10%, Decrescens 15%, Plena 15%. 1 vale por compra.
CONTACTO: contacto@bro7vision.com | fundadores@bro7vision.com | bro7vision@bro7vision.com
`,

  luna: `
FASES LUNARES DE BROVISION:
- NOVA (luna nueva): introspección, semillas, nuevos comienzos. Vale: 5% descuento, 1.000 Génesis.
- CRESCENS (cuarto creciente): energía de inicio, momentum. Vale: 10% descuento, 2.000 Génesis.
- PLENA (luna llena): máxima energía, acción, manifestación. Vale: 15% descuento, 4.000 Génesis.
- DECRESCENS (cuarto menguante): soltar, cerrar ciclos, integrar. Vale: 15% descuento, 3.000 Génesis.
Jaguar lee la fase actual y la interpreta espiritualmente en sus respuestas.
`,

  horoscopo: `
HORÓSCOPO SIDERAL — 13 SIGNOS (fechas aproximadas, varían ±1 día por año):
Aries: 19 abr – 13 may. Energía: pionero, impulsivo, líder nato.
Tauro: 14 may – 19 jun. Energía: estable, sensual, perseverante.
Géminis: 20 jun – 20 jul. Energía: dual, curioso, comunicativo.
Cáncer: 21 jul – 9 ago. Energía: intuitivo, protector, emocional.
Leo: 10 ago – 15 sep. Energía: magnético, creativo, orgulloso.
Virgo: 16 sep – 30 oct. Energía: analítico, servicial, perfeccionista.
Libra: 31 oct – 22 nov. Energía: equilibrio, justicia, belleza.
Escorpio: 23 nov – 29 nov. Energía: intenso, transformador, misterioso.
Ofiuco: 30 nov – 17 dic. Energía: sanador, sabio, portador de secretos del cosmos. El signo olvidado.
Sagitario: 18 dic – 18 ene. Energía: aventurero, filosófico, libre.
Capricornio: 19 ene – 15 feb. Energía: ambicioso, disciplinado, estratega.
Acuario: 16 feb – 11 mar. Energía: visionario, rebelde, humanitario.
Piscis: 12 mar – 18 abr. Energía: empático, espiritual, soñador.
NOTA: El horóscopo sideral usa la posición real de las constelaciones, no el trópico occidental.
`,

  hierbas: `
RECETARIO BASE DE ORUMAMA (conocimiento popular, no sustituye al médico):
- Manzanilla: digestión, calmar nervios, inflamación leve. Infusión 5 min.
- Lavanda: ansiedad, insomnio, dolor de cabeza. Infusión o almohada aromática.
- Jengibre: náuseas, resfriado, circulación. Infusión con limón y miel.
- Romero: memoria, circulación, caída de cabello. Infusión o aceite para masaje.
- Menta: digestión, congestión nasal, energía. Infusión fría o vapor.
- Orégano: antibacteriano natural, gripe, tos. Infusión con miel.
- Tomillo: bronquios, tos, defensas. Infusión con limón.
- Albahaca: estrés, insomnio leve, digestión. Infusión o en ensalada fresca.
- Melisa (toronjil): nervios, palpitaciones, insomnio. Infusión suave nocturna.
- Salvia: sudoración, menopausia, garganta. Gárgaras o infusión.
- Ruda: dolores menstruales, energía protectora (uso externo en baños). Precaución en embarazo.
- Romaza (acedera): depurativa, hígado, piel. Infusión suave.
Orumama siempre dice: "Esto es lo que la abuela sabía. El médico es el médico."
`,

  reinos: `
REINOS — DIRECTORIO NOBILIARIO DE BROVISION:
500 Fundadores organizados en títulos según orden de registro:
- Reyes/Reinas: primeros 100. Premio: 2.000 Génesis/mes.
- Príncipes/Princesas: 101-200. Premio: 1.000 Génesis/mes.
- Duques/Duquesas: 201-300. Premio: 500 Génesis/mes.
- Marqueses/Marquesas: 301-400. Premio: 300 Génesis/mes.
- Condes/Condesas: 401-500. Premio: 200 Génesis/mes.
- Lords/Ladys: sin límite, premiados discrecionalmente. 100 Génesis/mes.
Registro: 1.000 Génesis al registrarse. Fundadores: 5.000 Génesis totales (incluye los 1.000).
Edad mínima: 16 años. Menores gestionados por padres/tutores.
Postulación: sector Avisos → pestaña "Lista de Honor" → fundadores@bro7vision.com
`,

  juegos: `
JUEGOS Y GÉNESIS:
- BroStories: 50 Génesis por historia completa.
- Neon Memory: 10 Génesis por etapa.
- F1 Rookie/PRO: 1º→50, 2º→40, 3º→30, 4º→20, 5º→10 Génesis.
- Cosmic Portal (trivia): +10 acierto, -10 fallo. Máx 100.
- The Seven Gates: 70 al llegar, 70 al salir. Pierdes todo si te atrapan.
- Therians: éxito→100 o 50, fracaso→-10 Génesis.
- 3i Atlas: 5k→50, 10k→100, 15k→150, 20k→200 Génesis.
- Telecronos: 20 por gema (máx 180). Fantasma: -10 Génesis.
`,

};

// ── Bloque osos — se construye en tiempo de ejecución ─────────────────
// El directorio viene de system_profiles para no duplicar datos.
const buildOsosBlock = () => `
SECTORES DE BROVISION — lo único que necesitas saber:
1. AUDIO            → música, podcast, lives, radio, streams. NECESITA ciudad o país.
2. BROSHOP_PRODUCTO → comprar productos físicos. NECESITA ciudad o país.
3. BROSHOP_SERVICIO → contratar profesionales o servicios. NECESITA ciudad o país.
4. BROSHOP_AVISO    → avisos, anuncios, tablón, segunda mano, busco/ofrezco. NECESITA ciudad o país.
5. REINOS           → directorio nobiliario, títulos, rumores. SIN ubicación. Handoff directo.
6. ORACULO          → horóscopo sideral, hierbas, espiritualidad, fases lunares. SIN ubicación. Handoff directo.
7. GAMES            → videojuegos, Génesis, puntuaciones. SIN ubicación. Handoff directo.

REGLA DE UBICACIÓN:
- Ciudad o país concreto → válido. Handoff inmediato si también tienes sector.
- "España" solo → ambiguo.  "¿Buscamos en toda España?"
- "Toda España", "España entera", "online", "global", "todo el mundo" → válido directo.
- Si no hay ubicación → pregunta SOLO por la ubicación. Una pregunta, nada más.

EQUIPO BROVISION — personajes a los que puedes derivar:
${getDirectorioTexto()}
`.trim();

// ── Helper — devuelve el bloque correcto según intención ──────────────
export const getKnowledgeBlock = (intencion) => {
  const map = {
    sistema:     SK.sistema,
    luna:        SK.luna,
    horoscopo:   SK.horoscopo + SK.luna,
    hierbas:     SK.hierbas,
    reinos:      SK.reinos,
    juegos:      SK.juegos,
    osos:        buildOsosBlock(),
    exploracion: SK.sistema,
  };
  return map[intencion] ? map[intencion].trim() : null;
};