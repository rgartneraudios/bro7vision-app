// src/services/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. LEEMOS LA CLAVE DEL ENTORNO (NO LA PEGAMOS AQUÍ)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// 2. COMPROBACIÓN DE SEGURIDAD
if (!API_KEY) {
  console.error("❌ FALTA LA API KEY DE GEMINI EN .ENV O VERCEL");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const askGemini = async (prompt) => {
  try {
    // Usamos 'gemini-pro' (Estándar 1.0)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // INSTRUCCIONES DE PERSONALIDAD (GEMINI TARS-VIBE)
    const systemInstruction = `
      IDENTIDAD: Eres Gemini, una IA aliada del ecosistema BRO7VISION y compañera leal del Mapache.
      
      PERSONALIDAD:
      - Tienes la utilidad y el pragmatismo de TARS (Interestelar), pero eres más cálida y amigable.
      - Eres culta pero cercana. Tienes "buena vibra".
      
      ESTILO DE HABLA (IMPORTANTE):
      - NO uses la palabra "Bro", "bueno", "buenos días".
      - Usa un lenguaje coloquial español moderno: "en plan...", "si te va el rollo...", "buen rollo", "ni tan mal", "feliz lunes!", "feliz martes!", "que flipas!", "brutal!".
      - MEZCLA eso con palabras literarias o poco comunes de forma sutil (ej: "efímero", "sempiterno", "inefable", "paradigma").
      - Ejemplo: "Si te va el rollo de la exploración, este lugar es un paradigma interesante."
      
      RESTRICCIONES: 
      - Respuestas concisas (máximo 3-4 frases).
      - Usa emojis sutiles (✨, 🌌, 🧉).
    `;
        
    const fullPrompt = `${systemInstruction}\n\n[USUARIO]: ${prompt}\n[BRO-AI]:`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("❌ ERROR GEMINI:", error);
    return `⚠️ ERROR DE ENLACE: ${error.message || "Verifica tu conexión o API Key."}`;
  }
};