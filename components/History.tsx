
import React, { useState, useMemo, useEffect } from 'react';
import { DailyReport, Student } from '../types';
import { fetchStudentsFromSheets, fetchReportsFromSheets } from '../services/googleSheetService';
import { generateWeeklyInsight } from '../services/geminiService';
import { NeonButton } from './NeonButton';
import { EmailModal } from './EmailModal';
import { 
  ArrowLeft, Mail, Star, FileText, Download, 
  ShieldCheck, Pill, Moon, Shirt
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
    const loadAll = async () => {
      setLoadingData(true);
      const [s, r] = await Promise.all([fetchStudentsFromSheets(), fetchReportsFromSheets()]);
      setStudents(s);
      setAllReports(r);
      setLoadingData(false);
    };
    loadAll();
  }, []);

  const reports = useMemo(() => {
    if (!selectedStudentId) return [];
    return allReports
      .filter(r => String(r.studentId) === String(selectedStudentId))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [selectedStudentId, allReports]);

  const currentStudent = students.find(s => String(s.id) === String(selectedStudentId));

  const handlePrint = () => {
    if (!selectedStudentId) return;
    const prevTitle = document.title;
    document.title = `Cambridge_Report_${currentStudent?.name.replace(/\s+/g, '_')}`;
    window.print();
    setTimeout(() => { document.title = prevTitle; }, 500);
  };

  const getMoodEmoji = (l: number) => ["🤒", "😢", "😐", "😌", "😊"][l - 1] || "😊";

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 pb-32">
       <EmailModal 
        isOpen={showEmailModal} onClose={() => setShowEmailModal(false)}
        defaultEmail={currentStudent?.parentEmail || ''}
        subject={`📊 Reporte de Desempeño - ${currentStudent?.name}`}
        htmlContent={`<h2>Reporte de ${currentStudent?.name}</h2><p>${insight}</p>`}
        textContent={insight || "Reporte Semanal."}
      />

       <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-4 print:hidden">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
          {mode === 'print' ? 'Generar' : 'Historial'} <span className="text-cyan-400 text-sm ml-2 font-black tracking-widest">CICLO 2025-2026</span>
        </h2>
        <button onClick={onBack} className="text-gray-400 hover:text-cyan-400 transition-all uppercase text-[10px] font-black flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      <div className="bg-neon-card p-6 rounded-2xl border border-gray-800 mb-8 print:hidden">
        <label className="block text-[10px] uppercase text-cyan-400 mb-3 font-black tracking-widest">Seleccionar Alumno</label>
        <select 
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full bg-[#0a0a12] text-white border border-gray-700 rounded-xl p-4 font-bold text-lg outline-none focus:border-cyan-400"
        >
          <option value="">{loadingData ? 'Sincronizando...' : 'BUSCAR EN LA LISTA...'}</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
        </select>
      </div>

      {selectedStudentId && reports.length > 0 && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center print:hidden gap-4">
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-green-400" />
              <div>
                <p className="text-white font-bold uppercase text-xs tracking-tighter">Certificado Cambridge College</p>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Validación de Datos en Tiempo Real</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handlePrint} className="bg-white text-black px-8 py-3 rounded-xl text-xs font-black uppercase hover:bg-cyan-400 transition-all">
                <Download className="w-4 h-4 inline mr-2" /> PDF Oficial
              </button>
            </div>
          </div>

          <div id="pdf-content" className="bg-neon-card p-10 rounded-2xl border border-gray-800 print:bg-white print:text-black print:border-none print:p-0">
            {/* Header PDF */}
            <div className="hidden print:flex justify-between items-center mb-10 border-b-4 border-blue-900 pb-6">
              <div>
                <h1 className="text-4xl font-black text-blue-900 uppercase m-0">Cambridge College</h1>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Daily Performance & Health Report</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-900 uppercase">Ciclo Escolar</p>
                <p className="text-2xl font-bold">2025 - 2026</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10 print:bg-gray-50 print:p-6 print:rounded-2xl">
              <div>
                <p className="text-[10px] text-cyan-400 font-black uppercase print:text-blue-900">Alumno</p>
                <p className="text-2xl font-bold text-white print:text-black">{currentStudent?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-cyan-400 font-black uppercase print:text-blue-900">Grupo</p>
                <p className="text-xl font-bold text-white print:text-black">{currentStudent?.ageGroup}</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 text-[10px] font-black uppercase print:bg-blue-900 print:text-white">
                  <th className="p-4 border border-gray-700">Fecha</th>
                  <th className="p-4 border border-gray-700 text-center">Estado</th>
                  <th className="p-4 border border-gray-700 text-center">Comida</th>
                  <th className="p-4 border border-gray-700 text-center">Higiene</th>
                  <th className="p-4 border border-gray-700 text-center">Routina</th>
                  <th className="p-4 border border-gray-700">Actividades y Salud</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {reports.map((r, idx) => (
                  <tr key={idx} className="border-b border-gray-800 print:border-gray-200">
                    <td className="p-4 font-bold text-white print:text-black">{r.date}</td>
                    <td className="p-4 text-center text-xl">{getMoodEmoji(r.mood)}</td>
                    <td className="p-4 text-center font-bold text-white print:text-black">{r.foodIntake}%</td>
                    <td className="p-4 text-center uppercase font-medium">{r.hygiene === 'Excellent' ? 'EXC' : r.hygiene === 'Good' ? 'BIEN' : 'REG'}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1">
                        {r.sleep && <Moon className="w-3 h-3 text-cyan-400" />}
                        {r.clothingChange && <Shirt className="w-3 h-3 text-fuchsia-400" />}
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 print:text-black italic leading-tight">
                      {r.activities}
                      {r.medication && (
                        <div className="mt-2 text-[9px] text-fuchsia-400 font-black uppercase flex items-center gap-1 print:text-blue-900">
                          <Pill className="w-2 h-2" /> {r.medication} ({r.medicationTime})
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="hidden print:grid grid-cols-2 gap-20 mt-24 pt-10 border-t border-gray-300">
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mt-10"></div>
                  <p className="text-[10px] font-black uppercase mt-2">Maestro(a) Responsable</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mt-10"></div>
                  <p className="text-[10px] font-black uppercase mt-2">Sello Cambridge College</p>
                </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: portrait; margin: 1cm; }
          html, body { background: white !important; color: black !important; font-size: 11pt; }
          .print\\:hidden, button, header { display: none !important; }
          #pdf-content { width: 100% !important; padding: 0 !important; background: white !important; border: none !important; color: black !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; }
          th, td { border: 1px solid #cbd5e1 !important; color: black !important; }
        }
      `}} />
    </div>
  );
};