import { Campus, Teacher, Student, DailyReport } from '../types';

export const TEACHERS: Teacher[] = [
  { id: 't1', name: 'Miss Sarah', campus: Campus.MITRAS },
  { id: 't2', name: 'Miss Elena', campus: Campus.MITRAS },
  { id: 't3', name: 'Miss Jessica', campus: Campus.CUMBRES },
  { id: 't4', name: 'Miss Laura', campus: Campus.NORTE },
  { id: 't5', name: 'Miss Karla', campus: Campus.DOMINIO },
  { id: 't6', name: 'Miss Sofia', campus: Campus.ANAHUAC },
];

export const STUDENTS: Student[] = [
  // Mitras - Miss Sarah
  { id: 's1', name: 'Mateo González', teacherId: 't1', parentEmail: 'mateo.pap@email.com', ageGroup: 'Kinder 1' },
  { id: 's2', name: 'Valentina López', teacherId: 't1', parentEmail: 'vale.mam@email.com', ageGroup: 'Kinder 1' },
  // Mitras - Miss Elena
  { id: 's3', name: 'Santiago Pérez', teacherId: 't2', parentEmail: 'santi.pap@email.com', ageGroup: 'Maternal' },
  // Cumbres
  { id: 's4', name: 'Sebastián Garza', teacherId: 't3', parentEmail: 'sebas.mam@email.com', ageGroup: 'Kinder 2' },
  // Norte
  { id: 's5', name: 'Camila Rodríguez', teacherId: 't4', parentEmail: 'cami.pap@email.com', ageGroup: 'Kinder 1' },
  // Dominio
  { id: 's6', name: 'Leonardo Martínez', teacherId: 't5', parentEmail: 'leo.mam@email.com', ageGroup: 'Maternal' },
  // Anahuac
  { id: 's7', name: 'Victoria Sánchez', teacherId: 't6', parentEmail: 'vicky.pap@email.com', ageGroup: 'Kinder 3' },
];

// Helper to generate past dates
const getPastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Mock Reports for Demo Presentation
export const MOCK_REPORTS: DailyReport[] = [
  // --- MATEO (s1) ---
  {
    id: 'r1', date: getPastDate(5), timestamp: Date.now() - 432000000,
    studentId: 's1', teacherId: 't1', campus: Campus.MITRAS,
    mood: 3, foodIntake: 50, hygiene: 'Good', clothingChange: false, sleep: true,
    activities: 'Juego con bloques y reconocimiento de colores.', notes: 'Estuvo un poco callado hoy.'
  },
  {
    id: 'r2', date: getPastDate(4), timestamp: Date.now() - 345600000,
    studentId: 's1', teacherId: 't1', campus: Campus.MITRAS,
    mood: 4, foodIntake: 75, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Círculo de lectura y canciones de granja.', notes: 'Participó mucho en la clase de música.'
  },
  {
    id: 'r3', date: getPastDate(3), timestamp: Date.now() - 259200000,
    studentId: 's1', teacherId: 't1', campus: Campus.MITRAS,
    mood: 2, foodIntake: 25, hygiene: 'Needs Attention', clothingChange: true, sleep: false,
    activities: 'Pintura con dedos.', notes: 'No quiso comer mucho su lonche y no durmió siesta.'
  },
  {
    id: 'r4', date: getPastDate(2), timestamp: Date.now() - 172800000,
    studentId: 's1', teacherId: 't1', campus: Campus.MITRAS,
    mood: 5, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Clase de educación física y plastilina.', notes: '¡Excelente día! Muy feliz.'
  },
  {
    id: 'r5', date: getPastDate(1), timestamp: Date.now() - 86400000,
    studentId: 's1', teacherId: 't1', campus: Campus.MITRAS,
    mood: 5, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Aprendiendo la letra A.', notes: 'Compartió sus juguetes con Valentina.'
  },

  // --- VALENTINA (s2) ---
  {
    id: 'v1', date: getPastDate(5), timestamp: Date.now() - 432000000,
    studentId: 's2', teacherId: 't1', campus: Campus.MITRAS,
    mood: 5, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Bailamos canciones de Disney.', notes: 'Siempre llega con mucha energía.'
  },
  {
    id: 'v2', date: getPastDate(4), timestamp: Date.now() - 345600000,
    studentId: 's2', teacherId: 't1', campus: Campus.MITRAS,
    mood: 5, foodIntake: 75, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Hicimos un collage con hojas secas.', notes: 'Muy creativa hoy.'
  },
  {
    id: 'v3', date: getPastDate(3), timestamp: Date.now() - 259200000,
    studentId: 's2', teacherId: 't1', campus: Campus.MITRAS,
    mood: 4, foodIntake: 100, hygiene: 'Good', clothingChange: false, sleep: false,
    activities: 'Aprendiendo los números del 1 al 5.', notes: 'No tuvo sueño durante la siesta.'
  },
  {
    id: 'v4', date: getPastDate(2), timestamp: Date.now() - 172800000,
    studentId: 's2', teacherId: 't1', campus: Campus.MITRAS,
    mood: 3, foodIntake: 50, hygiene: 'Needs Attention', clothingChange: false, sleep: true,
    activities: 'Juego libre en el patio.', notes: 'Se quejó de dolor de pancita leve.'
  },
  {
    id: 'v5', date: getPastDate(1), timestamp: Date.now() - 86400000,
    studentId: 's2', teacherId: 't1', campus: Campus.MITRAS,
    mood: 5, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Cuentacuentos: Caperucita Roja.', notes: 'Ya se siente mucho mejor.'
  },

  // --- SANTIAGO (s3) - Maternal ---
  {
    id: 'sa1', date: getPastDate(5), timestamp: Date.now() - 432000000,
    studentId: 's3', teacherId: 't2', campus: Campus.MITRAS,
    mood: 2, foodIntake: 25, hygiene: 'Needs Attention', clothingChange: true, sleep: true,
    activities: 'Adaptación al salón.', notes: 'Lloró un poco al entrar.'
  },
  {
    id: 'sa2', date: getPastDate(4), timestamp: Date.now() - 345600000,
    studentId: 's3', teacherId: 't2', campus: Campus.MITRAS,
    mood: 3, foodIntake: 50, hygiene: 'Good', clothingChange: false, sleep: true,
    activities: 'Jugando con texturas suaves.', notes: 'Más tranquilo que ayer.'
  },
  {
    id: 'sa3', date: getPastDate(3), timestamp: Date.now() - 259200000,
    studentId: 's3', teacherId: 't2', campus: Campus.MITRAS,
    mood: 4, foodIntake: 75, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Gateo en el gimnasio.', notes: 'Le gustó mucho el túnel.'
  },
  {
    id: 'sa4', date: getPastDate(2), timestamp: Date.now() - 172800000,
    studentId: 's3', teacherId: 't2', campus: Campus.MITRAS,
    mood: 4, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Canciones de animales.', notes: 'Comió todo su puré.'
  },
  {
    id: 'sa5', date: getPastDate(1), timestamp: Date.now() - 86400000,
    studentId: 's3', teacherId: 't2', campus: Campus.MITRAS,
    mood: 5, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Pintura dactilar.', notes: 'Se divirtió ensuciándose las manos.'
  },

  // --- SEBASTIÁN (s4) - Cumbres ---
  {
    id: 'sb1', date: getPastDate(5), timestamp: Date.now() - 432000000,
    studentId: 's4', teacherId: 't3', campus: Campus.CUMBRES,
    mood: 4, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: false,
    activities: 'Inglés: Colors and Shapes.', notes: 'Participativo.'
  },
  {
    id: 'sb2', date: getPastDate(4), timestamp: Date.now() - 345600000,
    studentId: 's4', teacherId: 't3', campus: Campus.CUMBRES,
    mood: 4, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Fútbol en el patio.', notes: 'Mucha energía física.'
  },
  {
    id: 'sb3', date: getPastDate(3), timestamp: Date.now() - 259200000,
    studentId: 's4', teacherId: 't3', campus: Campus.CUMBRES,
    mood: 3, foodIntake: 50, hygiene: 'Good', clothingChange: false, sleep: true,
    activities: 'Recortar figuras.', notes: 'Se frustró un poco con las tijeras.'
  },
  {
    id: 'sb4', date: getPastDate(2), timestamp: Date.now() - 172800000,
    studentId: 's4', teacherId: 't3', campus: Campus.CUMBRES,
    mood: 5, foodIntake: 75, hygiene: 'Excellent', clothingChange: false, sleep: false,
    activities: 'Experimento con agua y aceite.', notes: 'Le encantó la ciencia.'
  },
  {
    id: 'sb5', date: getPastDate(1), timestamp: Date.now() - 86400000,
    studentId: 's4', teacherId: 't3', campus: Campus.CUMBRES,
    mood: 5, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Armando rompecabezas.', notes: 'Logró armar el de 20 piezas solo.'
  },

  // --- CAMILA (s5) - Norte ---
  {
    id: 'c1', date: getPastDate(5), timestamp: Date.now() - 432000000,
    studentId: 's5', teacherId: 't4', campus: Campus.NORTE,
    mood: 5, foodIntake: 75, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Día de disfraces.', notes: 'Vino de princesa.'
  },
  {
    id: 'c2', date: getPastDate(4), timestamp: Date.now() - 345600000,
    studentId: 's5', teacherId: 't4', campus: Campus.NORTE,
    mood: 1, foodIntake: 0, hygiene: 'Needs Attention', clothingChange: false, sleep: true,
    activities: 'Enfermería.', notes: 'Tuvo fiebre y vinieron por ella temprano.'
  },
  {
    id: 'c3', date: getPastDate(3), timestamp: Date.now() - 259200000,
    studentId: 's5', teacherId: 't4', campus: Campus.NORTE,
    mood: 3, foodIntake: 50, hygiene: 'Good', clothingChange: false, sleep: true,
    activities: 'Reposo relativo y lectura.', notes: 'Regresó pero sigue cansada.'
  },
  {
    id: 'c4', date: getPastDate(2), timestamp: Date.now() - 172800000,
    studentId: 's5', teacherId: 't4', campus: Campus.NORTE,
    mood: 4, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Jardinería: Plantamos frijolitos.', notes: 'Ya está comiendo bien.'
  },
  {
    id: 'c5', date: getPastDate(1), timestamp: Date.now() - 86400000,
    studentId: 's5', teacherId: 't4', campus: Campus.NORTE,
    mood: 5, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: false,
    activities: 'Hicimos pulseras.', notes: 'Hizo una para mamá y una para papá.'
  },

  // --- LEONARDO (s6) - Dominio ---
  {
    id: 'l1', date: getPastDate(5), timestamp: Date.now() - 432000000,
    studentId: 's6', teacherId: 't5', campus: Campus.DOMINIO,
    mood: 3, foodIntake: 100, hygiene: 'Good', clothingChange: false, sleep: true,
    activities: 'Bloques gigantes.', notes: 'Tranquilo.'
  },
  {
    id: 'l2', date: getPastDate(4), timestamp: Date.now() - 345600000,
    studentId: 's6', teacherId: 't5', campus: Campus.DOMINIO,
    mood: 3, foodIntake: 100, hygiene: 'Good', clothingChange: false, sleep: true,
    activities: 'Arenero.', notes: 'Juega mucho solo.'
  },
  {
    id: 'l3', date: getPastDate(3), timestamp: Date.now() - 259200000,
    studentId: 's6', teacherId: 't5', campus: Campus.DOMINIO,
    mood: 4, foodIntake: 75, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Clase de música.', notes: 'Le gusta tocar el tambor.'
  },
  {
    id: 'l4', date: getPastDate(2), timestamp: Date.now() - 172800000,
    studentId: 's6', teacherId: 't5', campus: Campus.DOMINIO,
    mood: 4, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Carreras de gateo.', notes: 'Muy veloz.'
  },
  {
    id: 'l5', date: getPastDate(1), timestamp: Date.now() - 86400000,
    studentId: 's6', teacherId: 't5', campus: Campus.DOMINIO,
    mood: 5, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: true,
    activities: 'Fiesta de cumpleaños de compañero.', notes: 'Comió pastel y se divirtió.'
  },

  // --- VICTORIA (s7) - Anahuac ---
  {
    id: 'vi1', date: getPastDate(5), timestamp: Date.now() - 432000000,
    studentId: 's7', teacherId: 't6', campus: Campus.ANAHUAC,
    mood: 5, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: false,
    activities: 'Pre-escritura y trazos.', notes: 'Excelente caligrafía para su edad.'
  },
  {
    id: 'vi2', date: getPastDate(4), timestamp: Date.now() - 345600000,
    studentId: 's7', teacherId: 't6', campus: Campus.ANAHUAC,
    mood: 5, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: false,
    activities: 'Proyecto de sistema solar.', notes: 'Líder en su equipo.'
  },
  {
    id: 'vi3', date: getPastDate(3), timestamp: Date.now() - 259200000,
    studentId: 's7', teacherId: 't6', campus: Campus.ANAHUAC,
    mood: 4, foodIntake: 75, hygiene: 'Good', clothingChange: false, sleep: true,
    activities: 'Yoga para niños.', notes: 'Muy flexible y atenta.'
  },
  {
    id: 'vi4', date: getPastDate(2), timestamp: Date.now() - 172800000,
    studentId: 's7', teacherId: 't6', campus: Campus.ANAHUAC,
    mood: 4, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: false,
    activities: 'Matemáticas con fichas.', notes: 'Entiende bien las sumas simples.'
  },
  {
    id: 'vi5', date: getPastDate(1), timestamp: Date.now() - 86400000,
    studentId: 's7', teacherId: 't6', campus: Campus.ANAHUAC,
    mood: 5, foodIntake: 100, hygiene: 'Excellent', clothingChange: false, sleep: false,
    activities: 'Show de talentos.', notes: 'Cantó una canción en inglés.'
  }
];