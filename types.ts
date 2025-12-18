
export enum Campus {
  MITRAS = 'Mitras',
  CUMBRES = 'Cumbres',
  NORTE = 'Norte',
  DOMINIO = 'Dominio',
  ANAHUAC = 'Anáhuac'
}

export interface User {
  id: string; 
  username: string;
  name: string;
  campus: Campus;
  role: 'teacher' | 'admin';
}

// Added Teacher interface to fix: Module '"../types"' has no exported member 'Teacher'.
export interface Teacher {
  id: string;
  name: string;
  campus: Campus;
}

export interface Student {
  id: string;
  name: string;
  teacherId: string;
  parentEmail: string;
  ageGroup: string;
}

export interface DailyReport {
  id: string;
  date: string;
  timestamp: number;
  studentId: string;
  teacherId: string;
  campus: Campus;
  mood: number;
  foodIntake: number;
  hygiene: 'Excellent' | 'Good' | 'Needs Attention';
  clothingChange: boolean;
  sleep: boolean;
  medication?: string; 
  medicationTime?: string;
  activities: string;
  notes: string;
}
