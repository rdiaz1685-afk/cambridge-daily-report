
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
      
      <div className="flex flex-col items-center mb-12">
        <div className="w-36 h-36 mb-6 relative flex items-center justify-center">
             <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
             <img 
               src={CAMBRIDGE_LOGO}
               alt="Cambridge College Logo" 
               className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]"
             />
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white text-center">
          CAMBRIDGE <span className="text-cyan-400">DASHBOARD</span>
        </h2>
        <div className="mt-2 px-4 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
          <p className="text-[10px] text-cyan-400 font-black tracking-[0.2em] uppercase">Versión Oficial de Producción</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        <button 
          onClick={() => onNavigate('report')}
          className="group bg-neon-card border border-cyan-500/30 p-8 rounded-xl hover:border-cyan-400 transition-all hover:shadow-neon-blue flex flex-col items-center gap-4"
        >
          <ClipboardList className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-semibold text-white uppercase">Captura Diaria</span>
        </button>

        <button 
          onClick={() => onNavigate('history')}
          className="group bg-neon-card border border-fuchsia-500/30 p-8 rounded-xl hover:border-fuchsia-400 transition-all hover:shadow-neon-pink flex flex-col items-center gap-4"
        >
          <History className="w-12 h-12 text-fuchsia-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xl font-semibold text-white uppercase">Historial</span>
        </button>

        <button 
          onClick={() => onNavigate('generate')}
          className="group bg-neon-card border border-green-500/30 p-8 rounded-xl hover:border-green-400 transition-all hover:shadow-neon-green flex flex-col items-center gap-4"
        >
          <FileText className="w-12 h-12 text-green-400 group-hover:-translate-y-1 transition-transform" />
          <span className="text-xl font-semibold text-white uppercase">Generar PDF</span>
        </button>
      </div>

      <button 
        onClick={onLogout}
        className="mt-12 flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-semibold uppercase tracking-wider text-sm">Cerrar Sesión</span>
      </button>
    </div>
  );
};
