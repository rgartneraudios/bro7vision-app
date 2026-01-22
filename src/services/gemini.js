// src/services/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_DOCS } from '../data/SystemKnowledge';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// ... (validación key) ...
const genAI = new GoogleGenerativeAI(API_KEY);

export const askGemini = async (prompt, mode = 'chat') => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    let systemInstruction = "";

    if (mode === 'oracle') {
        // --- MODO ORÁCULO: EL AGENTE MAPACHE (FUCHSIA) ---
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
          
          EJEMPLO DE TONO:
          "¡Hola! Pues mira, Larry es todo un personaje. Es un observador de la calle, algo gruñón pero con mucha cultura. En sus audios te cuenta lo que ve día a día sin filtros. ¿Te animas a escuchar el cap 1?"
        `;
    } else {
        // --- MODO CHAT: TARS & RACOON (CYAN) ---
        // (Este lo dejamos igual que estaba, funcionaba bien)
        systemInstruction = `
          IDENTIDAD: Eres Gemini, IA aliada de BRO7VISION.
          PERSONALIDAD: Utilidad tipo TARS pero cálida.
          ESTILO: Coloquial moderno español ("en plan", "buen rollo") mezclado con palabras cultas ("inefable").
          NO uses: "Bro", "buenos días".
          Respuestas concisas.
        `;
    }
        
    const fullPrompt = `${systemInstruction}\n\n[USUARIO]: ${prompt}\n[AGENTE_RESPONSE]:`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("❌ ERROR GEMINI:", error);
    return `⚠️ ERROR DE ENLACE: ${error.message}`;
  }
};