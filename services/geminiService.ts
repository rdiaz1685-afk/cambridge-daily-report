import { GoogleGenAI } from "@google/genai";
import { DailyReport, Student } from "../types";

export const generateWeeklyInsight = async (student: Student, reports: DailyReport[]): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "") {
    return "Error: No se detectó la clave de API. Por favor, asegúrate de configurar GEMINI_API_KEY en Vercel.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const reportSummary = reports.map(r => 
    `Fecha: ${r.date}, Ánimo: ${r.mood}/5, Comida: ${r.foodIntake}%, Actividades: ${r.activities}`
  ).join('\n');

  const prompt = `Actúa como psicopedagoga. Resume la semana de ${student.name} basándote en estos datos: ${reportSummary}. Da 3 logros y una recomendación. Usa español.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "La IA no devolvió texto. Reintenta.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Si el error es de autenticación, lo decimos claramente
    if (error.message?.includes('403') || error.message?.includes('key')) {
      return "Error de autenticación: La clave de API es inválida o no tiene permisos.";
    }
    return "La IA tuvo un problema técnico momentáneo. Por favor, intenta de nuevo.";
  }
};