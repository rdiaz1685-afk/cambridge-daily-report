
import React, { useState } from 'react';
import { Menu } from './components/Menu';
import { ReportForm } from './components/ReportForm';
import { History } from './components/History';
import { Login } from './components/Login';
import { User } from './types';
import { LogOut, User as UserIcon } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'menu' | 'report' | 'history' | 'generate'>('login');
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView('menu');
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'menu':
        return <Menu onNavigate={setCurrentView} onLogout={handleLogout} />;
      case 'report':
        return user ? <ReportForm user={user} onBack={() => setCurrentView('menu')} /> : null;
      case 'history':
        return <History onBack={() => setCurrentView('menu')} mode="view" />;
      case 'generate':
        return <History onBack={() => setCurrentView('menu')} mode="print" />;
      default:
        return <Menu onNavigate={setCurrentView} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-[#050505] text-white selection:bg-cyan-500/30">
      
      {/* Background Neon Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-500/10 blur-[120px] pointer-events-none" />
      
      {currentView !== 'login' && user && (
        <header className="relative z-10 w-full p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a12]/80 backdrop-blur-md sticky top-0 animate-fadeIn">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-lg shadow-neon-blue">
               C
             </div>
             <div className="hidden sm:block">
               <h1 className="text-sm font-bold tracking-wider leading-tight">
                 CAMBRIDGE <span className="text-cyan-400 font-light">COLLEGE</span>
               </h1>
               <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{user.campus}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
               <UserIcon className="w-3 h-3 text-cyan-400" />
               <span className="font-semibold">{user.name}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors group"
              title="Cerrar Sesión"
            >
               <span className="text-xs font-semibold uppercase tracking-wider hidden md:block group-hover:text-red-400 transition-colors">Salir</span>
               <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
      )}

      <main className="relative z-10 w-full min-h-[calc(100vh-73px)]">
        {renderView()}
      </main>

    </div>
  );
}

export default App;
