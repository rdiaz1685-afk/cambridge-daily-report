
/**
 * GOOGLE APPS SCRIPT - CAMBRIDGE DAILY REPORT (VERSIÓN FINAL V3.6)
 * Soluciona el error de desfase en columnas de ID, Actividades y Notas.
 */

const SPREADSHEET_ID = 'TU_ID_DE_EXCEL_AQUI'; 

function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); 
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'addReport') {
      const sheet = ss.getSheetByName('Reports');
      const r = data.report;
      
      // ORDEN DE COLUMNAS ESTRICTO
      sheet.appendRow([
        r.id,               // A. id
        r.date,             // B. date
        r.studentId,        // C. studentId
        r.teacherId,        // D. teacherId
        r.campus,           // E. campus
        r.mood,             // F. mood
        r.foodIntake,       // G. foodIntake
        r.hygiene,          // H. hygiene
        r.clothingChange ? 'SÍ' : 'NO', // I. clothingChange
        r.sleep ? 'SÍ' : 'NO',          // J. sleep
        r.medication || '',             // K. medication
        r.medicationTime || '',         // L. medicationTime
        r.activities,                   // M. activities
        r.notes || '',                  // N. notes
        new Date()                      // O. timestamp
      ]);

      if (data.emailConfig && data.emailConfig.to) {
        sendDailyEmail(data.emailConfig, r);
      }
      return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  } finally { lock.releaseLock(); }
}

function sendDailyEmail(config, report) {
  // ... (Lógica de email anterior se mantiene igual)
}

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetsMap = { 
    'getStudents': 'Students', 
    'getUsers': 'Users', 
    'getTeachers': 'Teachers',
    'getReports': 'Reports' 
  };

  if (sheetsMap[action]) {
    const sheet = ss.getSheetByName(sheetsMap[action]);
    if (!sheet) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
    const data = getRowsAsObjects(sheet);
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("Cambridge API Online v3.6 Ready");
}

function getRowsAsObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data.shift();
  return data.map(row => {
    let obj = {};
    headers.forEach((h, i) => { 
      if (h) {
        let value = row[i];
        if (value instanceof Date) {
          value = value.toISOString();
        }
        obj[h.toString().trim()] = value; 
      }
    });
    return obj;
  });
}