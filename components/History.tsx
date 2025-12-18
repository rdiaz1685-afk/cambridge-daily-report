
import React, { useState, useMemo, useEffect } from 'react';
import { DailyReport, Student, Teacher } from '../types';
import { getReportsByStudent, getReports } from '../services/reportService';
import { fetchStudentsFromSheets, fetchTeachersFromSheets } from '../services/googleSheetService';
import { generateWeeklyInsight } from '../services/geminiService';
import { NeonButton } from './NeonButton';
import { EmailModal } from './EmailModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Bot, Calendar, Printer, ArrowLeft, Mail, Save, RefreshCw, Star } from 'lucide-react';

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
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    email: '',
    subject: '',
    htmlContent: '',
    textContent: ''
  });

  useEffect(() => {
    const loadAllData = async () => {
      setLoadingData(true);
      const [s, t] = await Promise.all([
        fetchStudentsFromSheets(),
        fetchTeachersFromSheets()
      ]);
      setStudents(s);
      setTeachers(t);
      setLoadingData(false);
    };
    loadAllData();
  }, []);

  const reports = useMemo(() => {
    if (!selectedStudentId) return [];
    return getReportsByStudent(selectedStudentId);
  }, [selectedStudentId]);

  const chartData = useMemo(() => {
    return reports.slice(0, 7).reverse().map(r => ({
      date: r.date.substring(5), 
      mood: r.mood,
      food: r.foodIntake
    }));
  }, [reports]);

  const handleGenerateInsight = async () => {
    const student = students.find(s => String(s.id) === String(selectedStudentId));
    if (!student || reports.length === 0) return;

    setLoadingInsight(true);
    setInsight('');
    const text = await generateWeeklyInsight(student, reports.slice(0, 5));
    setInsight(text);
    setLoadingInsight(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGlobalBackup = () => {
    const allReports = getReports(); 
    if (allReports.length === 0) return;
    const fileName = `Respaldo_Cambridge_${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([JSON.stringify(allReports, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const handlePrepareEmail = async () => {
    const student = students.find(s => String(s.id) === String(selectedStudentId));
    if (!student) return;

    let htmlFormatted = insight ? insight.replace(/\n/g, '<br>') : "Resumen de progreso semanal.";

    setEmailData({
      email: student.parentEmail,
      subject: `📅 Reporte Semanal - ${student.name}`,
      htmlContent: `<div style="font-family: sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #003366;">Reporte Semanal de ${student.name}</h2>
        <div style="background: #fdfdfd; padding: 25px; border-radius: 12px; border: 1px solid #eee; border-left: 6px solid #bc13fe;">
          <div style="white-space: pre-wrap;">${htmlFormatted}</div>
        </div>
      </div>`,
      textContent: insight || "Reporte Semanal."
    });
    setShowEmailModal(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-fadeIn pb-24">
       
       <EmailModal 
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        defaultEmail={emailData.email}
        subject={emailData.subject}
        htmlContent={emailData.htmlContent}
        textContent={emailData.textContent}
      />

       <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4 no-print">
        <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wider">
          {mode === 'print' ? 'Generar PDF' : 'Historial'} <span className="text-fuchsia-400">General</span>
        </h2>
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-fuchsia-400 transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Volver</span>
        </button>
      </div>

      <div className="bg-neon-card p-6 rounded-xl border border-gray-800 mb-8 no-print">
        <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2 font-bold">Seleccionar Alumno</label>
        <div className="flex gap-4">
          <select 
            value={selectedStudentId}
            onChange={(e) => { setSelectedStudentId(e.target.value); setInsight(''); }}
            className="flex-1 bg-gray-900 text-white border border-gray-700 rounded p-3 focus:border-fuchsia-400 outline-none transition-colors font-bold"
            disabled={loadingData}
          >
            <option value="">{loadingData ? 'Cargando datos...' : '-- Seleccionar --'}</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({teachers.find(t => String(t.id) === String(s.teacherId))?.name || 'Maestra'})
              </option>
            ))}
          </select>
          {loadingData && <RefreshCw className="w-6 h-6 text-fuchsia-400 animate-spin self-center" />}
        </div>
      </div>

      {selectedStudentId && reports.length > 0 && (
        <div className="space-y-8 print-container">
          
          <div className="hidden print-block text-black mb-8 border-b-2 border-black pb-4">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Cambridge College</h1>
            <p className="text-sm uppercase font-bold text-gray-600">Reporte Semanal de Evaluación</p>
            <div className="mt-4 grid grid-cols-2 text-sm">
               <p><b>Alumno:</b> {students.find(s => String(s.id) === String(selectedStudentId))?.name}</p>
               <p className="text-right"><b>Fecha:</b> {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {mode === 'print' && (
            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex justify-between items-center no-print mb-6">
              <div>
                <h3 className="text-green-400 font-bold uppercase text-sm">Panel de Exportación</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Genera el PDF o envía por email</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded text-xs font-bold hover:bg-gray-700 transition-colors">
                    <Printer className="w-4 h-4" /> IMPRIMIR PDF
                 </button>
                 <NeonButton onClick={handlePrepareEmail} variant="green" className="py-2 px-4 text-xs flex items-center gap-2">
                    <Mail className="w-4 h-4" /> ENVIAR A PADRES
                 </NeonButton>
              </div>
            </div>
          )}

          {/* CUADRO DE IA - FORMATEADO PARA PDF */}
          <div className="bg-gradient-to-br from-purple-900/40 via-gray-900/50 to-blue-900/40 p-6 rounded-2xl border border-purple-500/30 shadow-2xl relative overflow-hidden print:bg-white print:border-black print:border-2 print:shadow-none">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none no-print">
                <Bot className="w-32 h-32 text-purple-400" />
            </div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-purple-400 font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2 print:text-black print:font-bold">
                <Star className="w-4 h-4 fill-purple-400 print:fill-black" /> RESUMEN DE PROGRESO (IA)
              </h3>
              {!insight && !loadingInsight && (
                <NeonButton onClick={handleGenerateInsight} variant="purple" className="text-[10px] px-4 py-2 no-print">
                  GENERAR ANÁLISIS
                </NeonButton>
              )}
            </div>

            {loadingInsight ? (
               <div className="flex items-center gap-3 text-purple-300 py-4 animate-pulse no-print">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest">Analizando comportamiento semanal...</span>
               </div>
            ) : insight ? (
              <div className="relative z-10">
                <p className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap font-sans print:text-black print:leading-normal">
                  {insight}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-xs uppercase tracking-widest text-center py-4 no-print">Haz clic en Generar para ver el análisis de la semana.</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} />
                  <YAxis domain={[0, 5]} stroke="#666" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="mood" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#22d3ee' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
             <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#666" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px' }} />
                  <Bar dataKey="food" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-neon-card rounded-xl border border-gray-800 overflow-hidden print:border-black print:border-2">
             <table className="w-full text-left text-sm">
               <thead className="bg-gray-900 text-[10px] uppercase text-gray-500 print:bg-gray-100 print:text-black">
                 <tr>
                   <th className="p-4">Fecha</th>
                   <th className="p-4">Ánimo</th>
                   <th className="p-4">Alim.</th>
                   <th className="p-4">Higiene</th>
                   <th className="p-4">Actividades</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-800 text-gray-400 print:divide-gray-300 print:text-black">
                 {reports.map((r) => (
                   <tr key={r.id} className="hover:bg-gray-800/30">
                     <td className="p-4 text-white font-mono print:text-black">{r.date}</td>
                     <td className="p-4">{r.mood}/5</td>
                     <td className="p-4">{r.foodIntake}%</td>
                     <td className="p-4">{r.hygiene === 'Excellent' ? 'Exc.' : r.hygiene === 'Good' ? 'Bien' : 'Atenc.'}</td>
                     <td className="p-4 max-w-xs truncate print:whitespace-normal">{r.activities}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      <div className="mt-12 no-print flex justify-center opacity-30 hover:opacity-100 transition-opacity">
          <button onClick={handleGlobalBackup} className="text-[10px] uppercase font-black text-cyan-400 flex items-center gap-2 border border-cyan-400/30 px-4 py-2 rounded-full">
            <Save className="w-3 h-3"/> RESPALDAR BASE DE DATOS LOCAL
          </button>
      </div>

      <style>{`
        @media print {
          @page { margin: 1.5cm; size: portrait; }
          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-block { display: block !important; }
          .bg-neon-card { background: white !important; border: 1px solid #000 !important; color: black !important; box-shadow: none !important; }
          .bg-gradient-to-br { background: #fff !important; border: 2px solid #000 !important; color: black !important; border-radius: 8px !important; }
          .text-white, .text-gray-200, .text-purple-400, .text-gray-400, .text-gray-500 { color: black !important; }
          .whitespace-pre-wrap { 
            white-space: pre-wrap !important; 
            word-wrap: break-word !important;
            display: block !important;
            font-family: sans-serif !important;
          }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #ddd !important; padding: 8px !important; }
        }
        .print-block { display: none; }
      `}</style>
    </div>
  );
};
