
import React, { useState } from 'react';
import { User, Lock, ChevronRight, Delete, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LoginProps {
  onLogin: () => void;
}

const FOODIKA_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iI0RDMjYyNiIvPjxwYXRoIGQ9Ik0xNDYgMTUwSDM4NkwzMTYgMjIwSDIxNlYzODZIMTQ2VjE1MFoiIGZpbGw9IiNGRkZGRkYiLz48cGF0aCBkPSJNMjQ2IDI1MEgzNjBMMjQ2IDM2NFYyNTBaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+";

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { theme, toggleTheme } = useApp();
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'PIN' | 'CREDENTIALS'>('PIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleNumPad = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handlePinSubmit = () => {
    if (pin === '1234') {
      onLogin();
    } else {
      setError('Invalid PIN. Try 1234');
      setPin('');
    }
  };

  const handleCredSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin();
    } else {
      setError('Please enter username and password');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-black flex items-center justify-center relative overflow-hidden transition-colors duration-500">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 dark:opacity-20 transition-opacity duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-black dark:via-black/80 dark:to-transparent transition-colors duration-500"></div>

      {/* Theme Toggle in Corner */}
      <div className="absolute top-6 right-6 z-20">
         <button 
           onClick={toggleTheme}
           className="p-3 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur shadow-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:scale-110 transition-all hover:bg-gray-100 dark:hover:bg-neutral-700"
         >
           {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
         </button>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300 transition-colors">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <img 
               src={FOODIKA_LOGO}
               alt="Foodika" 
               className="w-20 h-20 rounded-3xl object-contain shadow-2xl shadow-red-900/20"
             />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Foodika POS</h1>
          <p className="text-gray-500 dark:text-neutral-400 text-sm mt-2">Enterprise Restaurant Management</p>
        </div>

        {mode === 'PIN' ? (
          <div className="flex flex-col items-center">
            <div className="flex gap-4 mb-8">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length > i ? 'bg-brand-red border-brand-red' : 'border-gray-300 dark:border-neutral-600 bg-transparent'}`}></div>
              ))}
            </div>

            {error && <div className="text-red-500 text-sm font-bold mb-4 animate-pulse">{error}</div>}

            <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                  key={num}
                  onClick={() => handleNumPad(num.toString())}
                  className="h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white text-2xl font-bold transition-all active:scale-95 border border-gray-200 dark:border-neutral-700 shadow-sm"
                >
                  {num}
                </button>
              ))}
              <div className="flex items-center justify-center">
                 <button onClick={() => setMode('CREDENTIALS')} className="text-xs text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white font-medium">Use<br/>Pass</button>
              </div>
              <button 
                onClick={() => handleNumPad('0')}
                className="h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white text-2xl font-bold transition-all active:scale-95 border border-gray-200 dark:border-neutral-700 shadow-sm"
              >
                0
              </button>
              <button 
                onClick={handleBackspace}
                className="h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800/50 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 flex items-center justify-center transition-all active:scale-95 border border-transparent"
              >
                <Delete size={24} />
              </button>
            </div>

            <button 
              onClick={handlePinSubmit}
              className="mt-8 w-full py-4 bg-brand-red hover:bg-brand-redHover text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30"
            >
              Access Terminal <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleCredSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase mb-2">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-red transition-colors placeholder:text-gray-400 dark:placeholder:text-neutral-600"
                  placeholder="admin"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-red transition-colors placeholder:text-gray-400 dark:placeholder:text-neutral-600"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}

            <div className="pt-4 flex gap-3">
               <button 
                 type="button" 
                 onClick={() => setMode('PIN')}
                 className="flex-1 py-4 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white rounded-xl font-bold transition-colors"
               >
                 Cancel
               </button>
               <button 
                 type="submit" 
                 className="flex-[2] py-4 bg-brand-red hover:bg-brand-redHover text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/30"
               >
                 Login
               </button>
            </div>
          </form>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-neutral-600">
            System Status: <span className="text-green-500 font-bold">Online</span> • v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
};
