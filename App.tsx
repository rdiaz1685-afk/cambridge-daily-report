
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
      case 'login': return <Login onLogin={handleLogin} />;
      case 'menu': return <Menu onNavigate={setCurrentView} onLogout={handleLogout} />;
      case 'report': return user ? <ReportForm user={user} onBack={() => setCurrentView('menu')} /> : null;
      case 'history': return <History onBack={() => setCurrentView('menu')} mode="view" />;
      case 'generate': return <History onBack={() => setCurrentView('menu')} mode="print" />;
      default: return <Menu onNavigate={setCurrentView} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-[#050505] text-white">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 blur-[120px]" />
      </div>
      
      {currentView !== 'login' && user && (
        <header className="relative z-10 p-4 border-b border-white/5 bg-[#0a0a12]/80 backdrop-blur-md sticky top-0 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold">C</div>
             <h1 className="text-xs font-bold tracking-widest">CAMBRIDGE <span className="text-cyan-400">COLLEGE</span></h1>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </header>
      )}

      <main className="relative z-10 w-full min-h-screen">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
