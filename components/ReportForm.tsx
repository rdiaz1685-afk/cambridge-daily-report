
import React, { useState, useEffect } from 'react';
import { User, Student, DailyReport, Campus } from '../types';
import { syncReportToSheets, fetchStudentsFromSheets } from '../services/googleSheetService';
import { NeonButton } from './NeonButton';
import { 
  Smile, Meh, Frown, ArrowLeft, CheckCircle2, Thermometer, Coffee,
  Moon, ShieldCheck, Pill, Clock, Sparkles, Shirt
} from 'lucide-react';

const MOOD_OPTIONS = [
  { level: 1, label: 'Enfermo', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500' },
  { level: 2, label: 'Triste', icon: Frown, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500' },
  { level: 3, label: 'Regular', icon: Meh, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500' },
  { level: 4, label: 'Tranquilo', icon: Coffee, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500' },
  { level: 5, label: 'Alegre', icon: Smile, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500' },
];

const HYGIENE_OPTIONS = [
  { val: 'Excellent', label: 'Excelente', color: 'text-green-400' },
  { val: 'Good', label: 'Bien', color: 'text-blue-400' },
  { val: 'Needs Attention', label: 'Atención', color: 'text-yellow-400' },
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

  // Form State
  const [mood, setMood] = useState(5);
  const [foodIntake, setFoodIntake] = useState(100);
  const [sleep, setSleep] = useState(true);
  const [hygiene, setHygiene] = useState<'Excellent' | 'Good' | 'Needs Attention'>('Excellent');
  const [clothingChange, setClothingChange] = useState(false);
  const [medication, setMedication] = useState('');
  const [medicationTime, setMedicationTime] = useState('');
  const [activities, setActivities] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchStudentsFromSheets();
      // Filtramos por el teacherId que viene del login
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
      hygiene,
      clothingChange,
      medication,
      medicationTime,
      activities, 
      notes: ''
    };

    const result = await syncReportToSheets(report, student?.parentEmail || '', student?.name || '');
    if (result.success) {
      setLastReportData({ report, studentName: student?.name || 'Estudiante' });
      setIsSuccess(true);
    } else {
      alert("Error al sincronizar con Google Sheets. Verifica tu conexión.");
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 animate-fadeIn">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse" />
           <CheckCircle2 className="w-24 h-24 text-green-400 relative z-10" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tighter">¡REPORTE ENVIADO!</h2>
        <p className="text-gray-400 mb-8 max-w-sm">Los datos de {lastReportData?.studentName} se han sincronizado con éxito.</p>
        <NeonButton onClick={onBack} variant="blue" className="px-12">Finalizar</NeonButton>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Nueva <span className="text-cyan-400">Captura</span></h2>
        <button onClick={onBack} className="text-gray-500 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-neon-card p-6 rounded-2xl border border-gray-800 shadow-xl">
          <label className="text-[10px] uppercase text-cyan-400 font-black mb-3 block tracking-widest">Seleccionar Alumno</label>
          <select 
            required 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full bg-black text-white p-4 rounded-xl border border-gray-700 font-bold text-lg focus:border-cyan-400 outline-none transition-all"
          >
            <option value="">{isLoading ? 'SINCRONIZANDO...' : 'BUSCAR NOMBRE...'}</option>
            {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
          </select>
        </div>

        {selectedStudent && (
          <div className="space-y-6 animate-fadeIn">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ánimo */}
                <div className="bg-neon-card p-6 rounded-2xl border border-gray-800">
                    <label className="text-[10px] uppercase text-cyan-400 font-black mb-4 block tracking-widest">Estado de Ánimo</label>
                    <div className="flex justify-between gap-2">
                      {MOOD_OPTIONS.map(m => (
                        <button key={m.level} type="button" onClick={() => setMood(m.level)} className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${mood === m.level ? `${m.border} ${m.bg} scale-105 shadow-lg` : 'border-transparent opacity-20'}`}>
                          <m.icon className={`w-6 h-6 ${m.color}`} />
                          <span className="text-[8px] font-black uppercase">{m.label}</span>
                        </button>
                      ))}
                    </div>
                </div>

                {/* Higiene */}
                <div className="bg-neon-card p-6 rounded-2xl border border-gray-800">
                    <label className="text-[10px] uppercase text-cyan-400 font-black mb-4 block tracking-widest">Higiene Personal</label>
                    <div className="flex gap-2">
                      {HYGIENE_OPTIONS.map(h => (
                        <button key={h.val} type="button" onClick={() => setHygiene(h.val as any)} className={`flex-1 py-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase ${hygiene === h.val ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : 'border-gray-800 text-gray-600'}`}>
                          {h.label}
                        </button>
                      ))}
                    </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Siesta & Ropa */}
                <div className="bg-neon-card p-6 rounded-2xl border border-gray-800 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                          <label className="text-[10px] uppercase text-cyan-400 font-black block tracking-widest">Siesta</label>
                          <p className="text-gray-500 text-[10px] uppercase">¿Logró dormir?</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setSleep(!sleep)}
                          className={`w-14 h-7 rounded-full relative transition-all ${sleep ? 'bg-cyan-500 shadow-neon-blue' : 'bg-gray-800'}`}
                        >
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${sleep ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                        <div>
                          <label className="text-[10px] uppercase text-fuchsia-400 font-black block tracking-widest">Cambio de Ropa</label>
                          <p className="text-gray-500 text-[10px] uppercase">¿Se cambió su ropa?</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setClothingChange(!clothingChange)}
                          className={`w-14 h-7 rounded-full relative transition-all ${clothingChange ? 'bg-fuchsia-500 shadow-neon-pink' : 'bg-gray-800'}`}
                        >
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${clothingChange ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Comida */}
                <div className="bg-neon-card p-6 rounded-2xl border border-gray-800">
                    <label className="text-[10px] uppercase text-cyan-400 font-black mb-2 block tracking-widest">Alimentos Consumidos: {foodIntake}%</label>
                    <input 
                      type="range" min="0" max="100" step="25"
                      value={foodIntake}
                      onChange={(e) => setFoodIntake(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-4"
                    />
                    <div className="flex justify-between mt-4 text-[8px] text-gray-500 font-black uppercase tracking-widest">
                      <span>Nada (0%)</span>
                      <span>Medio (50%)</span>
                      <span>Todo (100%)</span>
                    </div>
                </div>
             </div>

             {/* Medicina */}
             <div className="bg-neon-card p-6 rounded-2xl border border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <Pill className="w-4 h-4 text-fuchsia-400" />
                  <label className="text-[10px] uppercase text-fuchsia-400 font-black tracking-widest">Control Médico (Opcional)</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Nombre del medicamento..."
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    className="bg-black border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-fuchsia-500 transition-all"
                  />
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Hora (ej. 1:30 PM)"
                      value={medicationTime}
                      onChange={(e) => setMedicationTime(e.target.value)}
                      className="w-full bg-black border border-gray-700 rounded-xl p-3 pl-10 text-white text-sm outline-none focus:border-fuchsia-500 transition-all"
                    />
                  </div>
                </div>
             </div>

             {/* Actividades */}
             <div className="bg-neon-card p-6 rounded-2xl border border-gray-800">
                <label className="text-[10px] uppercase text-cyan-400 font-black mb-3 block tracking-widest">Actividades Pedagógicas</label>
                <textarea 
                  required
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-xl p-4 h-32 text-white outline-none focus:border-cyan-400 text-sm leading-relaxed"
                  placeholder="Describe los aprendizajes y momentos clave del día..."
                />
             </div>

             <NeonButton type="submit" fullWidth disabled={isSubmitting} variant="blue" className="py-5 text-lg shadow-2xl">
                {isSubmitting ? 'SINCRONIZANDO...' : 'PUBLICAR REPORTE OFICIAL'}
             </NeonButton>
          </div>
        )}
      </form>
    </div>
  );
};