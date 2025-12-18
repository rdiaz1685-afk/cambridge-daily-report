
import React, { useState, useMemo, useEffect } from 'react';
import { DailyReport, Student } from '../types';
import { fetchStudentsFromSheets, fetchReportsFromSheets } from '../services/googleSheetService';
import { generateWeeklyInsight } from '../services/geminiService';
import { NeonButton } from './NeonButton';
import { EmailModal } from './EmailModal';
import { 
  ArrowLeft, Mail, Star, FileText, Download, 
  AlertTriangle, Utensils, Moon, ShieldCheck, Heart
} from 'lucide-react';

interface HistoryProps {
  onBack: () => void;
  mode?: 'view' | 'print';
}

export const History: React.FC<HistoryProps> = ({ onBack, mode = 'view' }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [allReports, setAllReports] = useState<DailyReport[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      setLoadingData(true);
      try {
        const [s, r] = await Promise.all([
          fetchStudentsFromSheets(),
          fetchReportsFromSheets()
        ]);
        setStudents(s);
        setAllReports(r);
      } catch (e) {
        console.error("Error de sincronización con la base de datos");
      } finally {
        setLoadingData(false);
      }
    };
    loadAllData();
  }, []);

  const reports = useMemo(() => {
    if (!selectedStudentId) return [];
    return allReports
      .filter(r => String(r.studentId) === String(selectedStudentId))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [selectedStudentId, allReports]);

  const handleGenerateInsight = async () => {
    const student = students.find(s => String(s.id) === String(selectedStudentId));
    if (!student || reports.length === 0) return;
    setLoadingInsight(true);
    setInsight('');
    const text = await generateWeeklyInsight(student, reports.slice(0, 5));
    setInsight(text);
    setLoadingInsight(false);
  };

  const currentStudent = students.find(s => String(s.id) === String(selectedStudentId));

  const handlePrint = () => {
    if (!selectedStudentId) return;
    
    const originalTitle = document.title;
    document.title = `Cambridge_Reporte_${currentStudent?.name.replace(/\s+/g, '_')}`;
    
    // El comando de impresión se ejecuta directamente para evitar bloqueos de Edge
    window.print();
    
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const getFoodLabel = (val: number) => {
    if (val <= 0) return "Nada";
    if (val <= 25) return "Poco";
    if (val <= 50) return "Medio";
    if (val <= 75) return "Casi Todo";
    return "Todo";
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 pb-24">
       
       <EmailModal 
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        defaultEmail={currentStudent?.parentEmail || ''}
        subject={`📅 Reporte de Desempeño - ${currentStudent?.name}`}
        htmlContent={`<div style="font-family:sans-serif;"><h2>Reporte de ${currentStudent?.name}</h2><p>${insight}</p></div>`}
        textContent={insight || "Reporte Semanal Cambridge."}
      />

       <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4 print:hidden">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
          {mode === 'print' ? 'Generar' : 'Historial'} <span className="text-cyan-400 text-sm ml-2">PDF OFICIAL</span>
        </h2>
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all uppercase text-[10px] font-black tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Volver al Tablero
        </button>
      </div>

      <div className="bg-neon-card p-6 rounded-xl border border-gray-800 mb-8 print:hidden shadow-2xl">
        <label className="block text-[10px] uppercase text-cyan-400 mb-3 font-black tracking-[0.2em]">Buscador de Alumno</label>
        <select 
          value={selectedStudentId}
          onChange={(e) => { setSelectedStudentId(e.target.value); setInsight(''); }}
          className="w-full bg-[#0a0a12] text-white border border-gray-700 rounded-lg p-4 font-bold text-lg outline-none cursor-pointer focus:border-cyan-400 transition-all"
        >
          <option value="">{loadingData ? 'SINCRONIZANDO...' : 'SELECCIONA UN ESTUDIANTE'}</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
        </select>
      </div>

      {selectedStudentId && reports.length > 0 && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center print:hidden gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-full">
                <ShieldCheck className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <span className="text-white font-bold uppercase text-sm block">Documento Verificado</span>
                <span className="text-[10px] text-gray-500 uppercase font-black">Listo para descarga o envío</span>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button 
                 onClick={handlePrint} 
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-black px-10 py-4 rounded-xl text-xs font-black hover:bg-cyan-400 transition-all shadow-lg active:scale-95"
               >
                  <Download className="w-5 h-5" /> DESCARGAR PDF
               </button>
               <NeonButton onClick={() => setShowEmailModal(true)} variant="green" className="flex-1 md:flex-none py-4 px-6 text-xs">
                  <Mail className="w-5 h-5 mr-2 inline" /> ENVIAR POR EMAIL
               </NeonButton>
            </div>
          </div>

          <div id="pdf-content" className="bg-neon-card p-8 rounded-2xl border border-gray-800 print:bg-white print:p-0 print:border-none print:m-0 print:text-black">
            {/* Cabecera Oficial Cambridge */}
            <div className="hidden print:flex items-center justify-between mb-8 border-b-4 border-blue-900 pb-6">
              <div>
                <h1 className="text-4xl font-black text-blue-900 uppercase m-0 tracking-tighter">Cambridge College</h1>
                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-1">Daily & Weekly Performance Report</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-900 uppercase">Ciclo Escolar</p>
                <p className="text-lg font-bold">2024 - 2025</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 print:bg-gray-50 print:p-6 print:rounded-2xl print:border print:border-gray-200">
               <div className="space-y-1">
                  <p className="text-[10px] text-cyan-400 font-black uppercase print:text-blue-900">Nombre del Alumno</p>
                  <p className="text-2xl font-bold text-white print:text-black">{currentStudent?.name}</p>
                  <p className="text-xs text-gray-400 print:text-gray-600 font-medium">ID: {currentStudent?.id}</p>
               </div>
               <div className="md:text-right space-y-1">
                  <p className="text-[10px] text-cyan-400 font-black uppercase print:text-blue-900">Grado y Sección</p>
                  <p className="text-xl font-bold text-white print:text-black">{currentStudent?.ageGroup}</p>
                  <p className="text-xs text-gray-400 print:text-gray-600 font-medium">Campus: {reports[0]?.campus}</p>
               </div>
            </div>

            {/* Resumen de IA */}
            <div className="mb-10 bg-[#1a1a2e] p-6 rounded-2xl border border-fuchsia-500/20 print:bg-white print:border-2 print:border-blue-900/10 print:p-8">
               <h3 className="text-fuchsia-400 font-black text-xs uppercase mb-4 flex items-center gap-2 print:text-blue-900 print:border-b-2 print:border-blue-900 print:pb-2 print:mb-6">
                  <Star className="w-4 h-4 fill-fuchsia-400 print:fill-blue-900" /> Reporte de Logros Semanales
               </h3>
               {insight ? (
                 <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap print:text-black print:text-[14px]">
                   {insight}
                 </div>
               ) : (
                 <div className="print:hidden text-center py-6">
                   <p className="text-gray-500 text-xs mb-4 font-medium">Haz clic para generar el análisis automático con Inteligencia Artificial.</p>
                   <button onClick={handleGenerateInsight} className="bg-fuchsia-600 text-white text-[10px] font-black px-8 py-3 rounded-full hover:shadow-neon-pink transition-all uppercase tracking-widest">
                      {loadingInsight ? 'Analizando...' : 'Generar Análisis IA'}
                   </button>
                 </div>
               )}
            </div>

            {/* Tabla de Reportes Diarios */}
            <div>
              <h3 className="text-cyan-400 font-black text-xs uppercase mb-4 flex items-center gap-2 print:text-blue-900">
                <FileText className="w-4 h-4" /> Desglose de Actividades Diarias
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                   <thead>
                      <tr className="bg-gray-800 print:bg-blue-900 print:text-white">
                         <th className="p-4 border border-gray-700 print:border-blue-900">FECHA</th>
                         <th className="p-4 border border-gray-700 print:border-blue-900 text-center">ÁNIMO</th>
                         <th className="p-4 border border-gray-700 print:border-blue-900 text-center">COMIDA</th>
                         <th className="p-4 border border-gray-700 print:border-blue-900 text-center">SIESTA</th>
                         <th className="p-4 border border-gray-700 print:border-blue-900">OBSERVACIONES</th>
                      </tr>
                   </thead>
                   <tbody>
                      {reports.map((r, i) => (
                        <tr key={i} className="border-b border-gray-800 print:border-gray-200">
                           <td className="p-4 font-bold text-white print:text-black whitespace-nowrap">{r.date}</td>
                           <td className="p-4 text-center">
                              <span className="bg-gray-700 px-2 py-1 rounded print:bg-transparent print:p-0 font-bold">{r.mood}/5</span>
                           </td>
                           <td className="p-4 text-center font-medium print:text-black">{getFoodLabel(r.foodIntake)}</td>
                           <td className="p-4 text-center font-bold print:text-black">{r.sleep ? 'SÍ' : 'NO'}</td>
                           <td className="p-4 text-gray-400 print:text-black italic leading-tight">{r.activities}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
            </div>

            <div className="hidden print:grid grid-cols-2 gap-20 mt-20 pt-10 border-t border-gray-200">
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mt-10"></div>
                  <p className="text-[10px] font-black uppercase mt-2">Firma del Maestro(a)</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mt-10"></div>
                  <p className="text-[10px] font-black uppercase mt-2">Sello Institucional</p>
                </div>
            </div>
          </div>
        </div>
      )}

      {selectedStudentId && reports.length === 0 && (
         <div className="text-center py-24 bg-neon-card rounded-2xl border border-gray-800 border-dashed animate-pulse">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6 opacity-50" />
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-sm">No hay reportes cargados en la base de datos.</p>
         </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: portrait; margin: 0.8cm; }
          
          html, body { 
            background: white !important; 
            color: black !important;
            font-size: 12pt;
          }

          /* Limpieza de UI innecesaria */
          header, nav, footer, .print\\:hidden, button, select, .bg-gray-900 { 
            display: none !important; 
          }

          #pdf-content {
            background: white !important;
            color: black !important;
            border: none !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #e2e8f0 !important; }
          
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
        }
      `}} />
    </div>
  );
};
