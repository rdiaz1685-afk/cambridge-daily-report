
/**
 * GOOGLE APPS SCRIPT - CAMBRIDGE DAILY REPORT (VERSIÓN 4 HOJAS)
 * 
 * ESTRUCTURA REQUERIDA:
 * 1. Pestaña 'Users': id, username, password, name, campus, role
 * 2. Pestaña 'Students': id, name, teacherId, parentEmail, ageGroup
 * 3. Pestaña 'Teachers': id, name, campus
 * 4. Pestaña 'Reports': Timestamp, Fecha, StudentId, TeacherId, Campus, Mood, Food, Hygiene, Clothing, Sleep, Activities, Notes
 */

const SPREADSHEET_ID = 'TU_ID_DE_EXCEL_AQUI'; // <--- PEGA AQUÍ EL ID DE TU EXCEL

function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); 
  
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'addReport') {
      const sheet = ss.getSheetByName('Reports');
      const r = data.report;
      
      sheet.appendRow([
        new Date(), 
        r.date, 
        r.studentId, 
        r.teacherId, 
        r.campus, 
        r.mood, 
        r.foodIntake, 
        r.hygiene, 
        r.clothingChange ? 'SÍ' : 'NO', 
        r.sleep ? 'SÍ' : 'NO', 
        r.activities, 
        r.notes
      ]);
      
      if (data.emailConfig && data.emailConfig.to) {
        sendDailyEmail(data.emailConfig, r);
      }
      
      return ContentService.createTextOutput(JSON.stringify({status: "success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const sheetsMap = {
    'getStudents': 'Students',
    'getUsers': 'Users',
    'getTeachers': 'Teachers'
  };

  if (sheetsMap[action]) {
    const sheet = ss.getSheetByName(sheetsMap[action]);
    if (!sheet) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
    const data = getRowsAsObjects(sheet);
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput("API Cambridge Online - " + new Date().toLocaleString());
}

function sendDailyEmail(config, report) {
  const moodLabels = ["Enfermo 🤒", "Triste 😢", "Regular 😐", "Tranquilo 😌", "Alegre 😊"];
  const moodText = moodLabels[report.mood - 1] || "Alegre 😊";
  const getFoodLabel = (f) => f <= 0 ? "Nada ❌" : f <= 25 ? "Poco 🥣" : f <= 50 ? "Medio 🥗" : f <= 75 ? "Casi Todo 🍎" : "Todo ✅";

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e1e8ed; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #003366; color: white; padding: 25px; text-align: center;">
        <h1 style="margin:0; font-size: 22px; letter-spacing: 1px;">CAMBRIDGE COLLEGE</h1>
        <p style="margin:5px 0 0; font-size: 12px; text-transform: uppercase; opacity: 0.8;">Reporte Diario de Actividades</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #003366; margin-top: 0; font-size: 20px;">¡Hola! 👋</h2>
        <p style="color: #444; line-height: 1.6;">Compartimos el resumen del día de hoy para <b>${config.studentName}</b>:</p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b;">Estado de ánimo</td><td style="text-align: right; font-weight: bold; color: #1e293b;">${moodText}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Alimentación</td><td style="text-align: right; font-weight: bold; color: #1e293b;">${getFoodLabel(report.foodIntake)}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Siesta</td><td style="text-align: right; font-weight: bold; color: #1e293b;">${report.sleep ? 'Sí ✅' : 'No ❌'}</td></tr>
          </table>
        </div>

        <div style="margin-top: 20px;">
          <b style="color: #003366; display: block; margin-bottom: 8px;">Actividades realizadas:</b>
          <p style="background: #eff6ff; padding: 15px; border-radius: 8px; color: #1e40af; margin: 0; line-height: 1.5;">${report.activities}</p>
        </div>

        ${report.notes ? `
        <div style="margin-top: 20px; border-left: 4px solid #003366; padding-left: 15px;">
          <b style="color: #444; font-size: 14px;">Nota de la maestra:</b>
          <p style="color: #666; font-style: italic; margin: 5px 0 0;">"${report.notes}"</p>
        </div>` : ''}
      </div>
      <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
        Este es un correo informativo generado automáticamente.<br>
        &copy; ${new Date().getFullYear()} Cambridge College. Todos los derechos reservados.
      </div>
    </div>
  `;
  
  try {
    MailApp.sendEmail({ to: config.to, subject: config.subject, htmlBody: htmlBody });
  } catch (e) {
    Logger.log("Error enviando correo: " + e.message);
  }
}

function getRowsAsObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data.shift();
  return data.map(row => {
    let obj = {};
    headers.forEach((h, i) => { 
      if (h) {
        let key = h.toString().trim();
        obj[key] = row[i];
      }
    });
    return obj;
  });
}
