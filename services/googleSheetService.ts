
/**
 * CONFIGURACIÓN DE CONEXIÓN - CAMBRIDGE DAILY REPORT
 * IMPORTANTE: Asegúrate de que la URL de abajo sea la de tu "Implementación" de Apps Script.
 */
const SCRIPT_URL: string = 'https://script.google.com/macros/s/AKfycbwCu-KQXJyNazwVSm1_F6QanzxxDrlT7YZbiaNttm7OtZBTo25gqtQ9JxDnNq9u-rda/exec'; 

/**
 * Obtiene usuarios desde la pestaña 'Users'
 */
export const fetchUsersFromSheets = async () => {
  if (!SCRIPT_URL || SCRIPT_URL.includes('TU_URL')) {
    console.error("SCRIPT_URL no configurada correctamente.");
    return [];
  }
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getUsers`, { 
      method: 'GET', 
      redirect: 'follow',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error("Error en respuesta de red");
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

/**
 * Obtiene alumnos desde la pestaña 'Students'
 */
export const fetchStudentsFromSheets = async () => {
  if (!SCRIPT_URL || SCRIPT_URL.includes('TU_URL')) return [];
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getStudents`, { 
      method: 'GET', 
      redirect: 'follow' 
    });
    return await response.json();
  } catch (e) { 
    console.error("Error fetching students:", e);
    return []; 
  }
};

/**
 * Obtiene maestros desde la pestaña 'Teachers'
 */
export const fetchTeachersFromSheets = async () => {
  if (!SCRIPT_URL || SCRIPT_URL.includes('TU_URL')) return [];
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getTeachers`, { 
      method: 'GET', 
      redirect: 'follow' 
    });
    return await response.json();
  } catch (e) { 
    console.error("Error fetching teachers:", e);
    return []; 
  }
};

/**
 * Sincroniza el reporte con la pestaña 'Reports' y dispara el correo
 */
export const syncReportToSheets = async (report: any, studentEmail: string, studentName: string) => {
  if (!SCRIPT_URL || SCRIPT_URL.includes('TU_URL')) return { success: false };
  try {
    // Usamos 'no-cors' para evitar bloqueos del navegador al escribir en Google Script
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addReport',
        report: report,
        emailConfig: { 
          to: studentEmail, 
          subject: `📝 Reporte Cambridge - ${studentName}`, 
          studentName 
        }
      }),
    });
    // Al ser no-cors, no podemos leer la respuesta, pero si no hay error, asumimos éxito
    return { success: true };
  } catch (e) { 
    console.error("Error syncing report:", e);
    return { success: false }; 
  }
};
