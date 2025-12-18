
export enum Campus {
  MITRAS = 'Mitras',
  CUMBRES = 'Cumbres',
  NORTE = 'Norte',
  DOMINIO = 'Dominio',
  ANAHUAC = 'Anáhuac'
}

export interface User {
  id: string; // ID único que coincide con teacherId en la tabla Students
  username: string;
  name: string;
  campus: Campus;
  role: 'teacher' | 'admin';
}

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
  activities: string;
  activityImage?: string;
  notes: string;
}
