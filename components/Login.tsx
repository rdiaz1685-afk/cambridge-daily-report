
import React, { useState, useEffect } from 'react';
import { NeonButton } from './NeonButton';
import { Lock, User as UserIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { CAMBRIDGE_LOGO } from '../constants/assets';
import { fetchUsersFromSheets } from '../services/googleSheetService';
import { User } from '../types';

interface LoginProps {
  onLogin: (userData: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [error, setError] = useState('');
  const [validUsers, setValidUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      setFetchingUsers(true);
      const users = await fetchUsersFromSheets();
      setValidUsers(users);
      setFetchingUsers(false);
    };
    loadUsers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const userFound = validUsers.find(
      (u) => 
        String(u.username).toLowerCase().trim() === username.toLowerCase().trim() && 
        String(u.password).trim() === password.trim()
    );

    setTimeout(() => {
      if (userFound) {
        // Mapeamos explícitamente para asegurar que tipos coincidan
        const userData: User = {
          id: String(userFound.id),
          username: String(userFound.username),
          name: String(userFound.name),
          campus: userFound.campus,
          role: userFound.role || 'teacher'
        };
        onLogin(userData);
      } else {
        setError('Usuario o contraseña incorrectos');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-neon-card border border-gray-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden animate-fadeIn">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-[2px]" />
        
        <div className="text-center mb-8">
          <div className="w-28 h-28 mx-auto mb-4 relative flex items-center justify-center">
             <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
             <img src={CAMBRIDGE_LOGO} alt="Cambridge" className="w-full h-full object-contain relative z-10" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wider uppercase">Cambridge College</h2>
          <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Sistema de Reportes</p>
        </div>

        {fetchingUsers ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="text-cyan-400 text-xs font-bold animate-pulse uppercase tracking-widest">Sincronizando Usuarios...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-cyan-400 font-black tracking-widest ml-1">Usuario</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. maestra_ana"
                  className="w-full bg-[#0a0a12] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-cyan-400 focus:shadow-neon-blue outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase text-fuchsia-400 font-black tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a12] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-fuchsia-400 focus:shadow-neon-pink outline-none transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-3 rounded border border-red-900/50">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-4">
              <NeonButton type="submit" fullWidth disabled={loading}>
                {loading ? 'Verificando...' : 'Iniciar Sesión'}
              </NeonButton>
            </div>
          </form>
        )}

        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Cambridge Digital v2.1</p>
        </div>
      </div>
    </div>
  );
};
