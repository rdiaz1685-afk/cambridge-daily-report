
import { GoogleGenAI } from "@google/genai";
import { DailyReport, Student } from "../types";

export const generateWeeklyInsight = async (student: Student, reports: DailyReport[]): Promise<string> => {
  // Use the mandatory named parameter and assume API_KEY availability per guidelines.
  // We initialize the GoogleGenAI instance directly using process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const reportSummary = reports.map(r => 
    `Fecha: ${r.date}, Ánimo: ${r.mood}/5, Actividades: ${r.activities}`
  ).join('\n');

  const prompt = `
    Actúa como una psicóloga educativa de Cambridge College. 
    Analiza la semana del alumno ${student.name} con estos datos:
    ${reportSummary}
    
    Genera un reporte motivador para los padres con:
    1. Un resumen del bienestar general.
    2. Tres logros específicos alcanzados.
    3. Una recomendación pedagógica.
    Usa un lenguaje cálido y profesional. Máximo 150 palabras.
  `;

  try {
    // Select gemini-3-flash-preview for basic text tasks as per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Accessing the .text property directly instead of calling a text() method.
    const outputText = response.text;
    
    if (!outputText) {
      throw new Error("Respuesta vacía de la IA");
    }

    return outputText;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Providing a generic, reassuring message instead of technical API details to follow UI/UX guidelines.
    return "El sistema está procesando los datos. Por favor, intenta generar el reporte de nuevo en unos segundos.";
  }
};
