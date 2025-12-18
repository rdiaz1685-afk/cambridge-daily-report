
import React, { useState, useEffect } from 'react';
import { User, Student, DailyReport } from '../types';
import { saveReport } from '../services/reportService';
import { syncReportToSheets, fetchStudentsFromSheets } from '../services/googleSheetService';
import { NeonButton } from './NeonButton';
import { Toast } from './Toast';
import { 
  Smile, Meh, Frown, Utensils, ArrowLeft, Shirt, Camera, 
  RefreshCw, CheckCircle2, BookOpen, Thermometer, Coffee, 
  User as UserIcon, GraduationCap, Pill, Clock, Copy, Mail, ShieldCheck 
} from 'lucide-react';

const MOOD_OPTIONS = [
  { level: 1, label: 'Enfermo', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500' },
  { level: 2, label: 'Triste', icon: Frown, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500' },
  { level: 3, label: 'Regular', icon: Meh, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500' },
  { level: 4, label: 'Tranquilo', icon: Coffee, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500' },
  { level: 5, label: 'Alegre', icon: Smile, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500' },
];

// Added missing ReportFormProps interface definition
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
  const [isCopied, setIsCopied] = useState(false);
  const [lastReportData, setLastReportData] = useState<any>(null);

  // Estados del formulario
  const [mood, setMood] = useState(5);
  const [foodIntake, setFoodIntake] = useState(100);
  const [sleep, setSleep] = useState(true);
  const [activities, setActivities] = useState('');
  const [notes, setNotes] = useState('');
  const [medication, setMedication] = useState('');
  const [medicationTime, setMedicationTime] = useState('');

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
      campus: user.campus,
      mood, foodIntake, sleep, activities, notes, medication, medicationTime,
      hygiene: 'Excellent', clothingChange: false
    };

    await syncReportToSheets(report, student?.parentEmail || '', student?.name || '');
    setLastReportData({ report, studentName: student?.name });
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleCopy = () => {
    const text = `*CAMBRIDGE COLLEGE*\n*Alumno:* ${lastReportData.studentName}\n*Estado:* ${MOOD_OPTIONS[mood-1].label}\n*Comida:* ${foodIntake}%\n*Actividades:* ${activities}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fadeIn">
        <CheckCircle2 className="w-24 h-24 text-green-400 mb-6" />
        <h2 className="text-4xl font-bold text-white mb-2 uppercase">¡ENVIADO!</h2>
        <p className="text-gray-400 mb-8">El reporte de {lastReportData?.studentName} se sincronizó correctamente.</p>
        <button onClick={handleCopy} className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold mb-4">
          {isCopied ? '¡COPIADO!' : 'COPIAR PARA WHATSAPP'}
        </button>
        <button onClick={onBack} className="text-cyan-400 font-bold uppercase tracking-widest text-sm">Volver al Inicio</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
        <h2 className="text-2xl font-bold text-white uppercase">Captura <span className="text-cyan-400">Diaria</span></h2>
        <button onClick={onBack} className="text-gray-400 hover:text-cyan-400 flex items-center gap-2 font-black uppercase text-xs">
          <ArrowLeft className="w-4 h-4" /> Regresar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-neon-card p-6 rounded-xl border border-gray-800">
          <label className="text-[10px] uppercase text-cyan-400 font-black mb-3 block">Seleccionar Alumno</label>
          <select 
            required 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full bg-black text-white p-4 rounded-lg border border-gray-700 font-bold text-lg"
          >
            <option value="">{isLoading ? 'CARGANDO...' : 'BUSCAR NOMBRE...'}</option>
            {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {selectedStudent && (
          <div className="space-y-6 animate-slideUp">
             <div className="bg-neon-card p-6 rounded-xl border border-gray-800">
                <label className="text-[10px] uppercase text-cyan-400 font-black mb-4 block text-center">Estado de Ánimo</label>
                <div className="flex justify-center gap-4">
                  {MOOD_OPTIONS.map(m => (
                    <button key={m.level} type="button" onClick={() => setMood(m.level)} className={`p-4 rounded-xl border-2 transition-all ${mood === m.level ? `${m.border} ${m.bg} scale-110` : 'border-transparent opacity-40'}`}>
                      <m.icon className={`w-8 h-8 ${m.color}`} />
                    </button>
                  ))}
                </div>
             </div>

             <div className="bg-neon-card p-6 rounded-xl border border-gray-800">
                <label className="text-[10px] uppercase text-cyan-400 font-black mb-2 block">Actividades y Observaciones</label>
                <textarea 
                  required
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg p-4 h-32 text-white"
                  placeholder="Describe lo que hizo hoy..."
                />
             </div>

             <NeonButton type="submit" fullWidth disabled={isSubmitting} variant="blue" className="py-5 text-lg">
                {isSubmitting ? 'SINCRONIZANDO...' : 'GUARDAR Y ENVIAR REPORTE'}
             </NeonButton>
          </div>
        )}
      </form>
    </div>
  );
};
