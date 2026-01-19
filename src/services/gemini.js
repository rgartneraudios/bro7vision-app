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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const systemInstruction = `
      ACTÚA COMO: BRO-AI, asistente del ecosistema BRO7VISION.
      TONO: Cyberpunk, breve y útil.
      RESTRICCIONES: Respuestas cortas (max 3 frases). Emojis futuristas.
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