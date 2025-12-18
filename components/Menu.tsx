import React from 'react';
import { ClipboardList, History, FileText, LogOut } from 'lucide-react';
import { CAMBRIDGE_LOGO } from '../constants/assets';

interface MenuProps {
  onNavigate: (view: 'report' | 'history' | 'generate') => void;
  onLogout: () => void;
}

export const Menu: React.FC<MenuProps> = ({ onNavigate, onLogout }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 animate-fadeIn">
      
      {/* Header with Logo */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-36 h-36 mb-6 relative flex items-center justify-center">
             <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
             <img 
               src={CAMBRIDGE_LOGO}
               alt="Cambridge College Logo" 
               className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(0,243,255,0.6)] hover:scale-105 transition-transform duration-500"
             />
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          CAMBRIDGE <span className="text-cyan-400">DASHBOARD</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Button 1: Captura Diaria (Zoom & Tilt Animation) */}
        <button 
          onClick={() => onNavigate('report')}
          className="group relative overflow-hidden bg-neon-card border border-cyan-500/30 p-8 rounded-xl hover:border-cyan-400 transition-all duration-300 hover:shadow-neon-blue flex flex-col items-center gap-4"
        >
          <div className="relative p-4 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
            <ClipboardList className="relative z-10 w-12 h-12 text-cyan-400 transform transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
          </div>
          <span className="text-xl font-semibold text-white tracking-widest uppercase group-hover:text-cyan-300 transition-colors">Captura Diaria</span>
          <p className="text-gray-400 text-center text-sm group-hover:text-gray-300">Llenar nuevo reporte por alumno</p>
        </button>

        {/* Button 2: Historial (Rewind Rotate Animation) */}
        <button 
          onClick={() => onNavigate('history')}
          className="group relative overflow-hidden bg-neon-card border border-fuchsia-500/30 p-8 rounded-xl hover:border-fuchsia-400 transition-all duration-300 hover:shadow-neon-pink flex flex-col items-center gap-4"
        >
          <div className="relative p-4 rounded-full bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20 transition-colors">
             {/* Glow Effect */}
             <div className="absolute inset-0 bg-fuchsia-400/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
            <History className="relative z-10 w-12 h-12 text-fuchsia-400 transform transition-transform duration-700 ease-in-out group-hover:-rotate-180" />
          </div>
          <span className="text-xl font-semibold text-white tracking-widest uppercase group-hover:text-fuchsia-300 transition-colors">Historial</span>
          <p className="text-gray-400 text-center text-sm group-hover:text-gray-300">Ver reportes anteriores y gráficas</p>
        </button>

        {/* Button 3: Generar PDF (Bounce Up Animation) */}
        <button 
          onClick={() => onNavigate('generate')}
          className="group relative overflow-hidden bg-neon-card border border-green-500/30 p-8 rounded-xl hover:border-green-400 transition-all duration-300 hover:shadow-neon-green flex flex-col items-center gap-4"
        >
          <div className="relative p-4 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
             {/* Glow Effect */}
             <div className="absolute inset-0 bg-green-400/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
            <FileText className="relative z-10 w-12 h-12 text-green-400 transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110" />
          </div>
          <span className="text-xl font-semibold text-white tracking-widest uppercase group-hover:text-green-300 transition-colors">Generar PDF</span>
          <p className="text-gray-400 text-center text-sm group-hover:text-gray-300">Imprimir o re-enviar reportes</p>
        </button>
      </div>

      <button 
        onClick={onLogout}
        className="mt-12 flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors duration-300 group"
      >
        <div className="p-2 rounded-full border border-gray-700 group-hover:border-red-400 group-hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </div>
        <span className="font-semibold uppercase tracking-wider text-sm">Cerrar Sesión</span>
      </button>
    </div>
  );
};