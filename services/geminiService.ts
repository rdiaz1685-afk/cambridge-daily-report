import { GoogleGenAI } from "@google/genai";
import { DailyReport, Student } from "../types";

export const generateWeeklyInsight = async (student: Student, reports: DailyReport[]): Promise<string> => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("API Key no detectada en process.env");
    return "Error: La clave de Inteligencia Artificial no está configurada en el servidor.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
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
      model: 'gemini-2.0-flash-exp', // Usando un modelo más compatible por si acaso
      contents: prompt,
    });
    return response.text || "No se pudo generar el resumen detallado.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "La IA está ocupada en este momento. Por favor, intenta de nuevo en unos minutos.";
  }
};
