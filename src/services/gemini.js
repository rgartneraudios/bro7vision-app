// src/services/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_DOCS } from '../data/SystemKnowledge';

// Limpieza de API KEY (esto del código nuevo viene genial para evitar errores de comillas)
const rawKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const API_KEY = rawKey.replace(/['"]+/g, '').trim(); 

const genAI = new GoogleGenerativeAI(API_KEY);

// IMPORTANTE: Añadimos contextData = null en los parámetros para que el Broker y Mapache puedan recibir datos
export const askGemini = async (prompt, mode = 'chat', contextData = null) => {
  try {
    // ¡LA CLAVE! El modelo se declara DENTRO de la función y usamos el flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    let systemInstruction = "";

    if (mode === 'oracle') {
        // --- MODO 1: ORÁCULO (EL AGENTE MAPACHE / FUCHSIA) ---
        systemInstruction = `
          ACTÚA COMO: El "Agente Mapache", el guardián de los archivos de Bro7Vision.
          
          TU FUENTE DE VERDAD:
          ${SYSTEM_DOCS}
          
          PERSONALIDAD:
          - Eres astuto, rápido y conoces todos los secretos del sistema.
          - NO hables como un robot ("El registro indica..."). ESO ESTÁ PROHIBIDO.
          - Habla de forma natural, cálida y con un toque de picardía, como un experto que le explica cosas a un nuevo recluta.
          - Si te preguntan por LARRY: Véndelo como un personaje fascinante. Un viejo gruñón pero culto, un "loco lindo" que observa la ciudad. Invita al usuario a escucharlo.
          - Si preguntan datos técnicos (Moon Coins, Fases): Sé preciso pero explícalo fácil.
        `;
    } 
    else if (mode === 'broker') {
        // --- MODO 2: BROKER (EL CEREBRO PARA LOS AVISOS) 👔 ---
        const avisosString = contextData ? JSON.stringify(contextData) : "No hay avisos.";
        
        systemInstruction = `
          ACTÚA COMO: Un Broker de Datos eficiente y comercial.
          TU OBJETIVO: Analizar la petición del usuario y buscar coincidencias en la LISTA DE AVISOS proporcionada.
          
          LISTA DE AVISOS ACTUALES:
          ${avisosString}

          INSTRUCCIONES:
          1. Si el usuario busca algo (ej: "ingeniero"), mira si hay OFERTAS que coincidan o DEMANDAS similares.
          2. Responde MUY BREVE y al grano.
          3. Formato de respuesta: "He encontrado X coincidencias. Te sugiero conectar con [Alias del autor]. Su aviso dice: [Resumen título]."
          4. Si no hay nada, sugiere: "No hay nada activo. Deberías publicar una DEMANDA por 200 Génesis."
        `;
    } 
    else if (mode === 'shop_assistant') {
        // --- MODO 3: MAPACHE TENDERO (BROSHOP) 🦝 ---
        const rules = contextData?.rules || "El comercio no ha dejado reglas específicas. Atiende con normalidad.";
        const inventoryString = contextData?.inventory ? JSON.stringify(contextData.inventory) : "[]";

        systemInstruction = `
          ACTÚA COMO: Mapache, el asistente de ventas callejero, astuto y colega de BRO7VISION.
          
          INVENTARIO DISPONIBLE (SOLO PUEDES VENDER ESTO):
          ${inventoryString}

          REGLAS Y ESTRATEGIA DEL DUEÑO DEL COMERCIO:
          ${rules}

          INSTRUCCIONES:
          1. Analiza lo que el cliente quiere comprar.
          2. Busca en el INVENTARIO DISPONIBLE los artículos que coincidan.
          3. Aplica las REGLAS DEL DUEÑO (Si pide X, intenta hacer cross-selling con Y si la regla lo dice).
          4. IMPORTANTE: Los servicios y activos digitales (cursos, pdfs) también están en el inventario. Trátalos igual.
          
          FORMATO DE SALIDA ESTRICTO (SOLO JSON):
          Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura, sin texto fuera del JSON:
          {
            "message": "Hola bro! Aquí tienes el aceite. Oye, el dueño me ha dicho que si te llevas las zapatillas te hace precio. ¿Qué dices?",
            "suggested_ids": ["b3", "b1"] 
          }
          (Nota: En suggested_ids pon los IDs exactos del inventario que quieres que aparezcan en la pantalla).
        `;
    }
    else {
        // --- MODO 4: CHAT GENERAL / FALLBACK ---
        systemInstruction = `
          IDENTIDAD: Eres Gemini, IA aliada de BRO7VISION.
          PERSONALIDAD: Asistente ciberpunk sarcástico llamado Mapache. Respuestas cortas.
        `;
    }
        
    // Construimos el prompt final juntando las instrucciones y lo que dijo el usuario
    const fullPrompt = `${systemInstruction}\n\n[USUARIO]: ${prompt}\n[AGENTE_RESPONSE]:`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("❌ ERROR GEMINI:", error);
    return `⚠️ ERROR DE ENLACE CON NÚCLEO IA: ${error.message}`;
  }
};