
import { GoogleGenAI } from "@google/genai";
import { DailyReport, Student } from "../types";

export const generateWeeklyInsight = async (student: Student, reports: DailyReport[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key no configurada. No se puede generar el resumen con IA.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const reportSummary = reports.map(r => 
    `Fecha: ${r.date}, Ánimo: ${r.mood}/5, Comida: ${r.foodIntake}%, Actividades: ${r.activities}, Notas: ${r.notes}`
  ).join('\n');

  const prompt = `
    Actúa como una psicóloga educativa experta de Cambridge College.
    Analiza la semana del alumno ${student.name} basada en estos reportes diarios:
    
    ${reportSummary}

    Escribe un resumen ejecutivo para los padres. 
    ESTRUCTURA OBLIGATORIA (DEBES dejar un salto de línea doble entre cada sección):

    1. SALUDO: Un saludo cálido y profesional mencionando el nombre del alumno.
    
    2. DESARROLLO SEMANAL: Un párrafo breve sobre cómo se sintió en general.
    
    3. LOGROS DESTACADOS: Lista 3 puntos positivos usando el símbolo "•" al inicio de cada línea.
    
    4. RECOMENDACIONES: Un consejo breve para el fin de semana.
    
    5. CIERRE: Una frase motivadora de despedida.

    REGLAS:
    - NO uses negritas (**).
    - Usa saltos de línea claros.
    - Tono: Profesional, dulce y alentador.
    - Idioma: ESPAÑOL.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No se pudo generar el resumen detallado.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error al conectar con la IA de Cambridge. Por favor, intenta de nuevo.";
  }
};
