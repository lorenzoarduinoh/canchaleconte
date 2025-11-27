import { GoogleGenAI } from "@google/genai";

// Ideally this comes from process.env.API_KEY, but checking if it exists
const apiKey = process.env.API_KEY || '';

export const generateMatchSummary = async (
  matchName: string,
  result: string,
  mvp: string,
  extraComments: string
): Promise<string> => {
  if (!apiKey) {
    console.warn("No API Key found for Gemini");
    return "Error: API Key no configurada para generar resumen.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Actúa como un comentarista de fútbol argentino apasionado y un poco gracioso.
      Escribe un resumen corto (máximo 300 caracteres) para el grupo de WhatsApp de "Cancha Leconte".
      
      Datos del partido:
      - Nombre: ${matchName}
      - Resultado: ${result}
      - Figura (MVP): ${mvp}
      - Notas extra: ${extraComments}
      
      Usa emojis. Sé carismático.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudo generar el resumen.";
  } catch (error) {
    console.error("Error generating match summary:", error);
    return "Hubo un error al conectar con la IA de Cancha Leconte.";
  }
};