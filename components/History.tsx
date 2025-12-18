
import React, { useState, useMemo, useEffect } from 'react';
import { DailyReport, Student } from '../types';
import { fetchStudentsFromSheets, fetchReportsFromSheets } from '../services/googleSheetService';
import { generateWeeklyInsight } from '../services/geminiService';
import { NeonButton } from './NeonButton';
import { EmailModal } from './EmailModal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  ArrowLeft, Mail, Star, FileText, Download, 
  ShieldCheck, Pill, Moon, Shirt, BarChart3, TrendingUp, RefreshCw, Loader2
} from 'lucide-react';

interface HistoryProps {
  onBack: () => void;
  mode: 'view' | 'print';
}

export const History: React.FC<HistoryProps> = ({ onBack, mode }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [allReports, setAllReports] = useState<DailyReport[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      setLoadingData(true);
      try {
        const [s, r] = await Promise.all([fetchStudentsFromSheets(), fetchReportsFromSheets()]);
        setStudents(s);
        setAllReports(r);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoadingData(false);
      }
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

  const chartData = useMemo(() => {
    return [...reports].reverse().map(r => ({
      fecha: r.date.split('-').slice(2).join('/'),
      animo: r.mood,
      comida: r.foodIntake
    }));
  }, [reports]);

  const currentStudent = students.find(s => String(s.id) === String(selectedStudentId));

  const handleGenerateInsight = async () => {
    if (!currentStudent || reports.length === 0) return;
    setLoadingInsight(true);
    try {
      const text = await generateWeeklyInsight(currentStudent, reports);
      setInsight(text);
    } catch (err) {
      setInsight("Error al conectar con la IA. Por favor intenta de nuevo.");
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedStudentId) {
      alert("Por favor selecciona un alumno primero.");
      return;
    }

    const element = document.getElementById('pdf-content');
    if (!element) return;

    setLoadingPDF(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('pdf-content');
          if (clonedElement) {
            // FUERZA BRUTA DE ESTILOS DE PAPEL
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.color = '#000000';
            clonedElement.style.padding = '40px';
            clonedElement.style.width = '800px';
            clonedElement.style.borderRadius = '0px';
            clonedElement.style.border = 'none';

            // Reset de todos los hijos para asegurar fondo blanco y texto negro
            const all = clonedElement.querySelectorAll('*');
            all.forEach((el: any) => {
              el.style.backgroundColor = 'transparent';
              el.style.boxShadow = 'none';
              el.style.textShadow = 'none';
              // Solo cambiar color si no es un elemento con fondo azul (como el header)
              if (!el.classList.contains('bg-blue-900')) {
                el.style.color = '#000000';
              }
            });

            // Forzar fondos específicos del diseño PDF
            const infoBox = clonedElement.querySelector('.student-info-box');
            if (infoBox) {
              (infoBox as HTMLElement).style.backgroundColor = '#f9fafb';
              (infoBox as HTMLElement).style.borderColor = '#e5e7eb';
            }

            const header = clonedElement.querySelector('.pdf-header-institutional');
            if (header) {
              (header as HTMLElement).style.borderBottom = '4px solid #1e3a8a';
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const pdfHeight = (canvasHeight * pdfWidth) / canvasWidth;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`Reporte_Cambridge_${currentStudent?.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error PDF:", error);
      alert("Error al generar el archivo. Intenta de nuevo.");
    } finally {
      setLoadingPDF(false);
    }
  };

  const getMoodEmoji = (l: number) => ["🤒", "😢", "😐", "😌", "😊"][l - 1] || "😊";

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pb-32">
       <EmailModal 
        isOpen={showEmailModal} onClose={() => setShowEmailModal(false)}
        defaultEmail={currentStudent?.parentEmail || ''}
        subject={`📊 Reporte Académico - ${currentStudent?.name}`}
        htmlContent={`<div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #003366;">Reporte de Desempeño: ${currentStudent?.name}</h2>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #06b6d4; font-style: italic;">
            ${insight.replace(/\n/g, '<br/>')}
          </div>
          <p style="margin-top: 20px; font-size: 11px; color: #666;">Cambridge Digital - Sistema Oficial</p>
        </div>`}
        textContent={insight || "Reporte del alumno."}
      />

       {/* Cabecera Pantalla */}
       <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
            {mode === 'print' ? 'Descarga de Documentos' : 'Panel de Control IA'}
          </h2>
          <p className="text-cyan-400 text-[10px] font-black tracking-widest uppercase">Sistema Oficial Cambridge</p>
        </div>
        <button onClick={onBack} className="text-gray-400 hover:text-white uppercase text-[10px] font-black flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      {/* Selector Alumno */}
      <div className="bg-neon-card p-6 rounded-2xl border border-gray-800 mb-8 print:hidden shadow-xl">
        <label className="block text-[10px] uppercase text-cyan-400 mb-3 font-black tracking-widest">Seleccionar Estudiante</label>
        <select 
          value={selectedStudentId}
          onChange={(e) => { setSelectedStudentId(e.target.value); setInsight(''); }}
          className="w-full bg-[#0a0a12] text-white border border-gray-700 rounded-xl p-4 font-bold text-lg outline-none focus:border-cyan-400"
        >
          <option value="">{loadingData ? 'SINCRONIZANDO...' : 'BUSCAR...'}</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
        </select>
      </div>

      {selectedStudentId && reports.length > 0 ? (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Gráficas (Pantalla) */}
          {mode === 'view' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
               <div className="bg-neon-card p-6 rounded-2xl border border-gray-800">
                  <h3 className="text-xs font-black uppercase text-pink-400 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Bienestar Emocional
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="fecha" stroke="#666" fontSize={10} />
                        <YAxis domain={[0, 5]} stroke="#666" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#161622', border: '1px solid #333' }} />
                        <Line type="monotone" dataKey="animo" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="bg-neon-card p-6 rounded-2xl border border-gray-800">
                  <h3 className="text-xs font-black uppercase text-cyan-400 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Nivel de Alimentación
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="fecha" stroke="#666" fontSize={10} />
                        <YAxis domain={[0, 100]} stroke="#666" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#161622', border: '1px solid #333' }} />
                        <Bar dataKey="comida">
                          {chartData.map((e, i) => <Cell key={i} fill={e.comida > 50 ? '#06b6d4' : '#f43f5e'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>
          )}

          {/* Acciones */}
          <div className="bg-[#1a1a2e] border border-cyan-500/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-green-400" />
              <div>
                <p className="text-white font-bold uppercase text-xs tracking-tighter">Certificación Digital</p>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Listo para envío oficial</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button onClick={handleGenerateInsight} disabled={loadingInsight} className="flex-1 md:flex-none bg-fuchsia-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-fuchsia-500 flex items-center justify-center gap-2">
                 {loadingInsight ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />} 
                 {loadingInsight ? 'IA Pensando...' : 'Analizar con IA'}
               </button>
               <button onClick={handleDownloadPDF} disabled={loadingPDF} className="flex-1 md:flex-none bg-white text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-cyan-400 flex items-center justify-center gap-2 border border-white">
                 {loadingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
                 {loadingPDF ? 'Procesando...' : 'Descargar PDF'}
               </button>
               <button onClick={() => setShowEmailModal(true)} className="flex-1 md:flex-none bg-cyan-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:shadow-neon-blue">
                 <Mail className="w-4 h-4 inline mr-2" /> Notificar Padres
               </button>
            </div>
          </div>

          {/* DOCUMENTO PDF (OCULTO EN PANTALLA, USADO PARA CAPTURA) */}
          <div id="pdf-content" className="bg-white text-black p-12 shadow-none border-none">
            
            {/* Header PDF */}
            <div className="pdf-header-institutional flex justify-between items-center mb-8 border-b-4 border-blue-900 pb-6">
              <div>
                <h1 className="text-4xl font-black text-blue-900 uppercase m-0 leading-none">Cambridge College</h1>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-2">Reporte Institucional Académico y de Salud</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-900 uppercase m-0">Ciclo Escolar</p>
                <p className="text-2xl font-bold m-0 text-black">2025 - 2026</p>
              </div>
            </div>

            {/* Info Alumno */}
            <div className="student-info-box grid grid-cols-2 gap-4 mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <p className="text-[10px] font-black uppercase text-blue-900">Alumno(a)</p>
                <p className="text-2xl font-bold text-black uppercase">{currentStudent?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-blue-900">Nivel / Grupo</p>
                <p className="text-xl font-bold text-black uppercase">{currentStudent?.ageGroup}</p>
              </div>
            </div>

            {/* IA Insight */}
            {insight && (
              <div className="mb-8 p-8 bg-white border-2 border-blue-900/10 rounded-xl">
                 <h3 className="font-black text-xs uppercase mb-3 flex items-center gap-2 text-blue-900">
                   <Star className="w-4 h-4 text-fuchsia-600" /> Evaluación Psicopedagógica con IA
                 </h3>
                 <p className="text-[13px] leading-relaxed italic text-gray-800">
                   "{insight}"
                 </p>
              </div>
            )}

            {/* Tabla de Datos */}
            <div className="overflow-hidden">
              <h3 className="font-black text-xs uppercase mb-4 flex items-center gap-2 text-blue-900">
                <FileText className="w-4 h-4" /> Bitácora de Desempeño Diario
              </h3>
              <table className="w-full text-left border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="p-4 border border-blue-800 text-[10px] font-black uppercase text-white">Fecha</th>
                    <th className="p-4 border border-blue-800 text-[10px] font-black uppercase text-center text-white">Ánimo</th>
                    <th className="p-4 border border-blue-800 text-[10px] font-black uppercase text-center text-white">Comida</th>
                    <th className="p-4 border border-blue-800 text-[10px] font-black uppercase text-center text-white">Check</th>
                    <th className="p-4 border border-blue-800 text-[10px] font-black uppercase text-white">Logros / Observaciones</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {reports.map((r, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="p-4 font-bold text-black bg-gray-50/30">{r.date}</td>
                      <td className="p-4 text-center text-xl">{getMoodEmoji(r.mood)}</td>
                      <td className="p-4 text-center font-bold text-black">{r.foodIntake}%</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          {r.sleep && <Moon className="w-3 h-3 text-blue-700" />}
                          {r.clothingChange && <Shirt className="w-3 h-3 text-fuchsia-700" />}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 italic leading-snug">
                        {r.activities}
                        {r.medication && (
                          <div className="mt-2 text-[9px] font-black uppercase text-red-600 flex items-center gap-1">
                            <Pill className="w-2 h-2" /> {r.medication} ({r.medicationTime})
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer / Firmas */}
            <div className="grid grid-cols-2 gap-20 mt-32">
                <div className="text-center">
                  <div className="border-t-2 border-black w-48 mx-auto mb-2"></div>
                  <p className="text-[9px] font-black uppercase text-black">Responsable de Grupo</p>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-black w-48 mx-auto mb-2"></div>
                  <p className="text-[9px] font-black uppercase text-black">Sello de Dirección</p>
                </div>
            </div>

            <div className="mt-16 text-center">
              <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Documento Certificado Digitalmente • Cambridge College System v3.1</p>
            </div>
          </div>
        </div>
      ) : (
        selectedStudentId && (
          <div className="text-center py-20 bg-neon-card rounded-2xl border border-gray-800">
            <RefreshCw className="w-10 h-10 text-cyan-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500 uppercase text-xs font-black tracking-widest">Sincronizando con la nube institucional...</p>
          </div>
        )
      )}
    </div>
  );
};