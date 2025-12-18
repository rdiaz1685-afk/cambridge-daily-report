
import React, { useState, useEffect } from 'react';
import { User, Student, DailyReport } from '../types';
import { saveReport } from '../services/reportService';
import { syncReportToSheets, fetchStudentsFromSheets } from '../services/googleSheetService';
import { NeonButton } from './NeonButton';
import { Toast } from './Toast';
import { Smile, Meh, Frown, Utensils, ArrowLeft, Shirt, Camera, RefreshCw, CheckCircle2, BookOpen, Thermometer, Coffee, User as UserIcon, GraduationCap } from 'lucide-react';

interface ReportFormProps {
  user: User;
  onBack: () => void;
}

const MOOD_OPTIONS = [
  { level: 1, label: 'Enfermo', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500' },
  { level: 2, label: 'Triste', icon: Frown, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500' },
  { level: 3, label: 'Regular', icon: Meh, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500' },
  { level: 4, label: 'Tranquilo', icon: Coffee, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500' },
  { level: 5, label: 'Alegre', icon: Smile, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500' },
];

export const ReportForm: React.FC<ReportFormProps> = ({ user, onBack }) => {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [mood, setMood] = useState<number>(5);
  const [foodIntake, setFoodIntake] = useState<number>(100);
  const [hygiene, setHygiene] = useState<'Excellent' | 'Good' | 'Needs Attention'>('Excellent');
  const [sleep, setSleep] = useState<boolean>(true);
  const [clothingChange, setClothingChange] = useState<boolean>(false);
  const [activities, setActivities] = useState<string>('');
  const [activityImage, setActivityImage] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const students = await fetchStudentsFromSheets();
      // Filtrar solo los alumnos de esta maestra usando el ID del usuario logeado
      const myStudents = students.filter((s: Student) => String(s.teacherId) === String(user.id));
      setAvailableStudents(myStudents);
    } catch (e) {
      console.error("Error al cargar alumnos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, [user.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setActivityImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getFoodLabel = (val: number) => {
    if (val <= 0) return "Nada";
    if (val <= 25) return "Poco";
    if (val <= 50) return "Medio";
    if (val <= 75) return "Casi Todo";
    return "Todo";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setIsSubmitting(true);
    const student = availableStudents.find(s => String(s.id) === String(selectedStudent));

    const newReport: DailyReport = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString('en-CA'),
      timestamp: Date.now(),
      studentId: selectedStudent,
      teacherId: user.id,
      campus: user.campus,
      mood,
      foodIntake,
      hygiene,
      clothingChange,
      sleep,
      activities,
      activityImage: activityImage || undefined,
      notes
    };

    saveReport(newReport);

    if (student) {
      const syncResult = await syncReportToSheets(newReport, student.parentEmail, student.name);
      if (syncResult.success) {
        setIsSuccess(true);
      } else {
        setToastMessage(`Error de sincronización, guardado localmente.`);
        setShowToast(true);
        setTimeout(() => setIsSuccess(true), 2000);
      }
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fadeIn">
        <div className="bg-green-500/20 p-8 rounded-full mb-6 shadow-neon-green">
           <CheckCircle2 className="w-24 h-24 text-green-400" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 uppercase tracking-tighter">¡REPORTE ENVIADO!</h2>
        <p className="text-gray-400 max-w-md mb-10 font-light">La información del alumno ha sido enviada con éxito.</p>
        <NeonButton onClick={onBack} variant="green" className="px-12 py-4 text-lg">VOLVER AL INICIO</NeonButton>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 animate-fadeIn relative pb-20">
      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800 pb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wider">Captura <span className="text-cyan-400">Diaria</span></h2>
          <div className="flex items-center gap-2 text-gray-400 text-xs mt-1 uppercase font-bold tracking-widest">
            <UserIcon className="w-3 h-3 text-cyan-400" /> {user.name} 
            <span className="text-gray-700 mx-1">|</span>
            <GraduationCap className="w-3 h-3 text-fuchsia-400" /> {user.campus}
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={loadStudents} className="p-2 rounded-full hover:bg-gray-800 text-cyan-400 transition-colors">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onBack} className="text-gray-400 hover:text-cyan-400 flex items-center gap-2 text-sm font-bold uppercase transition-colors">
            <ArrowLeft className="w-5 h-5" /> Volver
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-neon-card p-6 rounded-xl border border-gray-800 shadow-xl">
          <label className="text-[10px] uppercase text-cyan-400 mb-3 block font-black tracking-widest">Seleccionar Alumno</label>
          <select 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)} 
            className="w-full bg-[#0a0a12] text-white border border-gray-700 rounded-lg p-4 text-lg font-bold focus:border-cyan-400 focus:shadow-neon-blue outline-none transition-all" 
            required
          >
            <option value="">{isLoading ? 'Cargando lista...' : 'Click para buscar alumno'}</option>
            {availableStudents.map(s => <option key={String(s.id)} value={String(s.id)}>{s.name}</option>)}
          </select>
          {availableStudents.length === 0 && !isLoading && (
            <p className="text-red-400 text-[10px] mt-2 uppercase font-bold tracking-tighter">No tienes alumnos asignados. Revisa tu teacherId en el Excel.</p>
          )}
        </div>

        {selectedStudent && (
          <div className="bg-neon-card p-6 md:p-8 rounded-xl border border-cyan-500/20 shadow-2xl space-y-10 animate-slideUp">
            <div className="space-y-6">
               <label className="text-sm uppercase text-cyan-400 font-bold block text-center tracking-widest">Estado de Ánimo</label>
               <div className="flex flex-wrap justify-center gap-4">
                 {MOOD_OPTIONS.map((m) => (
                   <button key={m.level} type="button" onClick={() => setMood(m.level)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${mood === m.level ? `${m.bg} ${m.border} scale-110 shadow-lg` : 'bg-gray-900/40 border-transparent opacity-40 hover:opacity-100'}`}>
                     <m.icon className={`w-10 h-10 ${mood === m.level ? m.color : 'text-gray-600'}`} />
                     <span className="text-[10px] uppercase font-bold tracking-tighter">{m.label}</span>
                   </button>
                 ))}
               </div>
            </div>

            <div className="bg-gray-900/30 p-6 rounded-2xl border border-gray-800 shadow-inner">
               <div className="flex justify-between items-center mb-6">
                  <label className="text-sm uppercase text-green-400 font-bold flex items-center gap-2"><Utensils className="w-5 h-5" /> Alimentación</label>
                  <span className="text-2xl font-black text-white">{getFoodLabel(foodIntake)}</span>
               </div>
               <input type="range" min="0" max="100" step="25" value={foodIntake} onChange={(e) => setFoodIntake(Number(e.target.value))} className="w-full h-3 bg-gray-800 rounded-lg appearance-none accent-green-400 cursor-pointer" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <button type="button" onClick={() => setClothingChange(!clothingChange)} className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300 ${clothingChange ? 'bg-red-500/10 border-red-500 shadow-neon-pink' : 'bg-gray-900/50 border-gray-700'}`}>
                    <Shirt className={`w-6 h-6 ${clothingChange ? 'text-red-400' : 'text-gray-500'}`} />
                    <span className="text-xs uppercase font-bold tracking-widest">¿Cambio de ropa?</span>
                  </button>
                  <button type="button" onClick={() => setSleep(!sleep)} className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300 ${sleep ? 'bg-cyan-500/10 border-cyan-500 shadow-neon-blue' : 'bg-gray-900/50 border-gray-700'}`}>
                    <CheckCircle2 className={`w-6 h-6 ${sleep ? 'text-cyan-400' : 'text-gray-500'}`} />
                    <span className="text-xs uppercase font-bold tracking-widest">¿Tomó su siesta?</span>
                  </button>
               </div>
               <div className="h-full">
                  <label className="cursor-pointer bg-[#0a0a12] w-full h-full min-h-[120px] rounded-xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center hover:border-cyan-400 hover:bg-cyan-400/5 transition-all group">
                    <Camera className="w-8 h-8 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-[10px] text-gray-500 mt-2 uppercase font-black tracking-widest group-hover:text-cyan-400">{activityImage ? '¡Imagen Lista!' : 'Subir Foto'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
               </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase text-orange-400 font-black tracking-widest flex items-center gap-2"><BookOpen className="w-4 h-4" /> Actividades del Día</label>
                <textarea value={activities} onChange={(e) => setActivities(e.target.value)} className="w-full bg-[#0a0a12] border border-gray-700 rounded-xl p-5 h-32 outline-none focus:border-cyan-400 text-sm transition-all shadow-inner" placeholder="Pintamos con acuarelas, jugamos con bloques y aprendimos los colores primarios..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase text-gray-400 font-black tracking-widest">Observaciones / Notas para Papá</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-[#0a0a12] border border-gray-700 rounded-xl p-5 h-24 outline-none focus:border-fuchsia-400 text-sm transition-all shadow-inner" placeholder="Santiago estuvo muy participativo hoy y compartió sus juguetes." />
              </div>
            </div>

            <div className="pt-4">
              <NeonButton type="submit" fullWidth disabled={isSubmitting} variant="blue" className="py-6 text-xl shadow-2xl">
                {isSubmitting ? 'Sincronizando...' : <span className="flex items-center gap-3 justify-center"><CheckCircle2 className="w-7 h-7" /> FINALIZAR REPORTE</span>}
              </NeonButton>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
