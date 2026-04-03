// src/services/groq.js
import { buildOsosPrompt }            from './agents/ososPS';
import { buildNovaExploraPrompt }     from './agents/novaExploraPS';
import { buildMapachePrompt }         from './agents/mapachePS';
import { buildIsabellaExploraPrompt } from './agents/isabellaExploraPS';
import { buildEvelynExploraPrompt }   from './agents/evelynExploraPS';

const rawKey = import.meta.env.VITE_GROQ_API_KEY || "";
const API_KEY = rawKey.replace(/['"]+/g, '').trim();

// ── Instrucción de formato estricto para Llama 3.1 8B ───────────────────
const STRICT_JSON_INSTRUCTION = `MODO SERVIDOR ACTIVO.
RESPUESTA: JSON PURO únicamente.
PROHIBIDO texto antes o después del JSON.
PROHIBIDO bloques markdown como \`\`\`json.
EMPIEZA SIEMPRE con '{'.
`;

export const askGroq = async (prompt, mode = 'osos', contextData = null) => {
  try {
    // ── Enrutador de agentes ─────────────────────────────────────────────
    let systemInstruction = "";

    switch (mode) {
      case 'osos':
        systemInstruction = buildOsosPrompt(contextData);
        break;
      case 'novaExplora':
        systemInstruction = buildNovaExploraPrompt(contextData);
        break;
      case 'mapache':
        systemInstruction = buildMapachePrompt(contextData);
        break;
      case 'servicios':
        systemInstruction = buildIsabellaExploraPrompt(contextData);
        break;
      case 'avisos':
        systemInstruction = buildEvelynExploraPrompt({
          personaje: contextData?.avisos_personaje || 'evelyn',
          sobre:     contextData?.sobre_evelyn     || '',
        });
        break;
      default:
        systemInstruction = "Eres una IA de BRO7VISION. Responde de forma concisa en JSON.";
    }

    // ── Llamada a la API ─────────────────────────────────────────────────
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role:    "system",
              content: STRICT_JSON_INSTRUCTION + systemInstruction,
            },
            {
              role:    "user",
              content: `USER_QUERY: ${prompt}`,
            },
          ],
          temperature:     0.5,
          response_format: { type: "json_object" },
        }),
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || "{}";

  } catch (error) {
    console.error("❌ ERROR GROQ:", error);
    return `{"handoff": false, "mensaje": "Error en el núcleo Groq.", "bolas": []}`;
  }
};
