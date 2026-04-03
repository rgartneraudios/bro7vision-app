// src/services/gemini.js

// Importaremos los agentes aquí a medida que los vayamos creando
// import { buildOsosPrompt } from './agents/ososPS';
// import { buildNovaExploraPrompt } from './agents/novaExploraAgent';
// import { buildIsabellaExploraPrompt } from './agents/isabellaExploraAgent';

const rawKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const API_KEY = rawKey.replace(/['"]+/g, '').trim();

export const askGemini = async (prompt, mode = 'chat', contextData = null) => {
  try {
    let systemInstruction = "";

    // EL ENRUTADOR: Asigna el "Dedo" correcto según el modo
    switch (mode) {
      case 'osos':
        systemInstruction = buildOsosPrompt(contextData);
        break;
      
      // Iremos activando estos a medida que los creemos:
      // case 'nova_explora': systemInstruction = buildNovaExploraPrompt(contextData); break;
      // case 'nova_close': systemInstruction = buildNovaClosePrompt(contextData); break;
      // case 'isabella_explora': systemInstruction = buildIsabellaExploraPrompt(contextData); break;
      // case 'audio_dj': systemInstruction = buildAudioPrompt(contextData); break;
      // case 'oraculo': systemInstruction = buildOraculoPrompt(contextData); break;
      // case 'avisos': systemInstruction = buildAvisosPrompt(contextData); break;
        
      default:
        systemInstruction = "Eres una IA de BRO7VISION. Responde de forma concisa.";
    }

    // Llamada a la API de Gemini (Usando system_instruction nativo para mayor precisión)
    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: `[USUARIO]: ${prompt}` }] }]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";

  } catch (error) {
    console.error("❌ ERROR GEMINI:", error);
    return `{"handoff": false, "mensaje": "Error de enlace con el núcleo IA.", "bolas": []}`;
  }
};