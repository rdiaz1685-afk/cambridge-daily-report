
import React, { useState, useEffect } from 'react';
import { User, Student, DailyReport, Campus } from '../types';
import { syncReportToSheets, fetchStudentsFromSheets } from '../services/googleSheetService';
import { NeonButton } from './NeonButton';
import { 
  Smile, Meh, Frown, ArrowLeft, CheckCircle2, Thermometer, Coffee
} from 'lucide-react';

const MOOD_OPTIONS = [
  { level: 1, label: 'Enfermo', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500' },
  { level: 2, label: 'Triste', icon: Frown, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500' },
  { level: 3, label: 'Regular', icon: Meh, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500' },
  { level: 4, label: 'Tranquilo', icon: Coffee, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500' },
  { level: 5, label: 'Alegre', icon: Smile, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500' },
];

interface ReportFormProps {
  user: User;
  onBack: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ user, onBack }) => {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastReportData, setLastReportData] = useState<{report: DailyReport, studentName: string} | null>(null);

  const [mood, setMood] = useState(5);
  const [foodIntake, setFoodIntake] = useState(100);
  const [sleep, setSleep] = useState(true);
  const [activities, setActivities] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchStudentsFromSheets();
      setAvailableStudents(data.filter((s: Student) => String(s.teacherId) === String(user.id)));
      setIsLoading(false);
    };
    load();
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmitting(true);
    
    const student = availableStudents.find(s => String(s.id) === String(selectedStudent));
    const report: DailyReport = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString('en-CA'),
      timestamp: Date.now(),
      studentId: selectedStudent,
      teacherId: user.id,
      campus: user.campus as Campus,
      mood, 
      foodIntake, 
      sleep, 
      activities, 
      notes: '',
      hygiene: 'Excellent', 
      clothingChange: false
    };

    await syncReportToSheets(report, student?.parentEmail || '', student?.name || '');
    setLastReportData({ report, studentName: student?.name || 'Estudiante' });
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <CheckCircle2 className="w-20 h-20 text-green-400 mb-6 shadow-neon-green rounded-full" />
        <h2 className="text-4xl font-bold text-white mb-2">¡ENVIADO!</h2>
        <p className="text-gray-400 mb-8">Reporte sincronizado para {lastReportData?.studentName}.</p>
        <NeonButton onClick={onBack} variant="blue">Volver al Inicio</NeonButton>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Captura <span className="text-cyan-400">Oficial</span></h2>
        <button onClick={onBack} className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase">
          <ArrowLeft className="w-4 h-4" /> Regresar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-neon-card p-6 rounded-xl border border-gray-800">
          <label className="text-[10px] uppercase text-cyan-400 font-black mb-3 block">Estudiante</label>
          <select 
            required 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full bg-black text-white p-4 rounded-lg border border-gray-700 font-bold"
          >
            <option value="">{isLoading ? 'CARGANDO...' : 'SELECCIONA NOMBRE...'}</option>
            {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {selectedStudent && (
          <div className="space-y-6 animate-fadeIn">
             <div className="bg-neon-card p-6 rounded-xl border border-gray-800 text-center">
                <label className="text-[10px] uppercase text-cyan-400 font-black mb-4 block">Ánimo del Día</label>
                <div className="flex justify-center gap-4">
                  {MOOD_OPTIONS.map(m => (
                    <button key={m.level} type="button" onClick={() => setMood(m.level)} className={`p-4 rounded-xl border-2 transition-all ${mood === m.level ? `${m.border} ${m.bg} scale-110` : 'border-transparent opacity-30'}`}>
                      <m.icon className={`w-8 h-8 ${m.color}`} />
                    </button>
                  ))}
                </div>
             </div>

             <div className="bg-neon-card p-6 rounded-xl border border-gray-800">
                <label className="text-[10px] uppercase text-cyan-400 font-black mb-2 block">Actividades</label>
                <textarea 
                  required
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg p-4 h-32 text-white outline-none focus:border-cyan-400"
                  placeholder="¿Qué aprendimos hoy?..."
                />
             </div>

             <NeonButton type="submit" fullWidth disabled={isSubmitting} variant="blue" className="py-5 text-lg">
                {isSubmitting ? 'PROCESANDO...' : 'GUARDAR Y SINCRONIZAR'}
             </NeonButton>
          </div>
        )}
      </form>
    </div>
  );
};
