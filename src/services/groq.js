// src/services/groq.js
import { buildOsosPrompt }            from './agents/ososPS';
import { buildNovaExploraPrompt }     from './agents/novaExploraPS';
import { buildMapachePrompt }         from './agents/mapachePS';
import { buildIsabellaExploraPrompt } from './agents/isabellaExploraPS';
import { buildEvelynExploraPrompt }   from './agents/evelynExploraPS';
import { buildOraculoPrompt }         from './agents/oraculoPS';
import { armarNovaVentas }            from './agents/novaVentasPS';

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
      case 'oraculo':
        systemInstruction = buildOraculoPrompt(contextData);
        break;

      // ── NOVA VENTAS — nodo independiente ──────────────────────────
      // No usa STRICT_JSON_INSTRUCTION porque armarNovaVentas
      // ya incluye instrucciones JSON en su propio prompt.
      case 'novaVentas':
        systemInstruction = armarNovaVentas({
          perfil_usuario: contextData?.perfilBase   || {},
          comercio:       contextData?.comercio     || {},
          carrito:        contextData?.carrito      || [],
          vales_usuario:  contextData?.vales        || { nova:0, crescens:0, plena:0, decrescens:0 },
          catalogo:       contextData?.catalogo     || [],
        });
        // NovaVentas necesita temperatura ligeramente más alta
        // para conversación natural — se gestiona abajo con el flag
        contextData._novaVentas = true;
        break;

      default:
        systemInstruction = "Eres una IA de BRO7VISION. Responde de forma concisa en JSON.";
    }

    // NovaVentas usa parámetros distintos al resto:
    // - Sin response_format json_object (el modelo ya lo hace por prompt)
    // - Temperatura 0.7 para conversación más fluida
    // - max_tokens 400 suficiente para JSON de Nova
    const esNovaVentas = contextData?._novaVentas === true;

    const body = esNovaVentas
      ? {
          model:       "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user",   content: `USER_QUERY: ${prompt}` },
          ],
          temperature: 0.7,
          max_tokens:  400,
        }
      : {
          model:       "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: STRICT_JSON_INSTRUCTION + systemInstruction },
            { role: "user",   content: `USER_QUERY: ${prompt}` },
          ],
          temperature:     0.5,
          response_format: { type: "json_object" },
        };

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(body),
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
