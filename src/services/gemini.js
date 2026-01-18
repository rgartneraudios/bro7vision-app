import { GoogleGenerativeAI } from "@google/generative-ai";

// Ya no pegamos la clave aquí. La leemos de Vercel/Vite de forma segura.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

const genAI = new GoogleGenerativeAI(API_KEY);

export const askGemini = async (prompt) => {
  try {
    // Usamos el nombre del modelo estable para evitar fallos de versión
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = "ACTÚA COMO: BRO-AI. Tono cyberpunk y breve.";
    
    // Combinamos el prompt de forma limpia
    const result = await model.generateContent(`${systemInstruction}\n\n${prompt}`);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Error en la nube:", error);
    return `⚠️ ERROR: ${error.message}`;
  }
};