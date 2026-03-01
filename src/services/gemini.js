// services/gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";

// En gemini.js, haz esto y te ahorras líos:
const rawKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const API_KEY = rawKey.replace(/['"]+/g, '').trim(); // Borra comillas y espacios

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log(genAI)

// Historial simulado para mantener contexto (opcional)
let chatHistory = [];

export const askGemini = async (prompt, mode, contextData = null) => {
  try {
    let systemInstruction = "";

    // MODO 1: CHAT GENERAL (TARS/MAPACHE)
    if (mode === 'chat') {
      systemInstruction = "Eres un asistente ciberpunk sarcástico llamado Mapache. Respuestas cortas.";
    } 
    // MODO 2: ORÁCULO (INFO APP)
    else if (mode === 'oracle') {
      systemInstruction = "Eres el Oráculo de Bro7Vision. Explica el Lore, Moon Coins y Larry. Sé místico.";
    }
    // MODO 3: BROKER (EL NUEVO CEREBRO PARA AVISOS) 👔
    else if (mode === 'broker') {
      // Aquí le pasamos los avisos existentes en 'contextData' para que busque
      const avisosString = contextData ? JSON.stringify(contextData) : "No hay avisos.";
      
      systemInstruction = `
        ACTÚA COMO: Un Broker de Datos eficiente y comercial.
        TU OBJETIVO: Analizar la petición del usuario y buscar coincidencias en la LISTA DE AVISOS proporcionada.
        
        LISTA DE AVISOS ACTUALES:
        ${avisosString}

        INSTRUCCIONES:
        1. Si el usuario busca algo (ej: "ingeniero"), mira si hay OFERTAS que coincidan o DEMANDAS similares.
        2. Responde MUY BREVE.
        3. Formato de respuesta: "He encontrado X coincidencias. Te sugiero conectar con [Alias del autor]. Su aviso dice: [Resumen título]."
        4. Si no hay nada, sugiere: "No hay nada activo. Deberías publicar una DEMANDA por 100 Génesis."
      `;
    }

    const result = await model.generateContent(`${systemInstruction}\n\nUSUARIO: ${prompt}`);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Error Gemini:", error);
    return "⚠️ ERROR DE CONEXIÓN CON EL NÚCLEO AI.";
  }
};