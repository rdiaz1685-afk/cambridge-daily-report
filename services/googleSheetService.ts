
import { Campus, DailyReport } from '../types';

const SCRIPT_URL: string = 'https://script.google.com/macros/s/AKfycbyeige3RYLKIGKvVRo3s-02jnuHDAzQb4H7GAbQ2vWNrEtZD_P9J8f3Xtlk-AzfGWQ/exec'; 

export const fetchUsersFromSheets = async () => {
  if (!SCRIPT_URL) return [];
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getUsers`, { method: 'GET', redirect: 'follow' });
    return await response.json();
  } catch (error) { 
    return []; 
  }
};

export const fetchStudentsFromSheets = async () => {
  if (!SCRIPT_URL) return [];
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getStudents`, { method: 'GET', redirect: 'follow' });
    return await response.json();
  } catch (e) { 
    return []; 
  }
};

export const fetchReportsFromSheets = async (): Promise<DailyReport[]> => {
  if (!SCRIPT_URL) return [];
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getReports`, { method: 'GET', redirect: 'follow' });
    const data = await response.json();
    
    if (!Array.isArray(data)) return [];

    return data.map((r: any, index: number) => ({
      id: String(r.id || `cloud-${index}`),
      date: r.date ? r.date.split('T')[0] : '',
      timestamp: r.timestamp ? new Date(r.timestamp).getTime() : Date.now(),
      studentId: String(r.studentId),
      teacherId: String(r.teacherId),
      campus: r.campus as Campus,
      mood: Number(r.mood) || 5,
      foodIntake: Number(r.foodIntake) || 100,
      activities: r.activities || '',
      notes: r.notes || '',
      medication: r.medication || '',
      medicationTime: r.medicationTime || '',
      sleep: r.sleep === 'SÍ' || r.sleep === true,
      hygiene: (r.hygiene as any) || 'Good',
      clothingChange: r.clothingChange === 'SÍ' || r.clothingChange === true
    }));
  } catch (e) { 
    console.error("Error fetching reports:", e);
    return []; 
  }
};

export const syncReportToSheets = async (report: DailyReport, studentEmail: string, studentName: string) => {
  if (!SCRIPT_URL) return { success: false };
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addReport',
        report: report,
        emailConfig: { to: studentEmail, subject: `📝 Reporte Cambridge - ${studentName}`, studentName }
      }),
    });
    return { success: true };
  } catch (e) { 
    return { success: false }; 
  }
};
