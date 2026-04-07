import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from './supabaseClient';

const Agente = ({ personaje, systemPrompt }) => {
  const [input, setInput] = useState('');
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const enviarComando = async () => {
    // 1. Instanciamos el modelo con la personalidad del personaje
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // O tu modelo local vía WebGPU
      systemInstruction: systemPrompt 
    });

    const result = await model.generateContent(input);
    const respuesta = result.response.text();
    
    // 2. Lógica de "Handoff": Si la IA decide cambiar de sector
    // Buscamos en la respuesta de la IA un comando especial, ej: [CAMBIAR_A:BROSHOP]
    if (respuesta.includes("[CAMBIAR_A:")) {
      const nuevoSector = respuesta.split("[CAMBIAR_A:")[1].split("]")[0];
      await supabase
        .from('estado_sesion')
        .update({ sector_activo: nuevoSector })
        .eq('id', 1);
      console.log(`Cambiando a sector: ${nuevoSector}`);
    }

    console.log("Respuesta del Personaje:", respuesta);
  };

  return (
    <div className="agente-control">
      <h3>Controlando a: {personaje}</h3>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={enviarComando}>Enviar orden al Multiverso</button>
    </div>
  );
};

export default Agente;