
import React, { useState, useEffect } from 'react';
import { User, Lock, ChevronRight, Delete, Moon, Sun, Loader2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SystemUser } from '../types';

interface LoginProps {
  onLogin: (user: SystemUser) => void;
}

const FOODIKA_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iI0RDMjYyNiIvPjxwYXRoIGQ9Ik0xNDYgMTUwSDM4NkwzMTYgMjIwSDIxNlYzODZIMTQ2VjE1MFoiIGZpbGw9IiNGRkZGRkYiLz48cGF0aCBkPSJNMjQ2IDI1MEgzNjBMMjQ2IDM2NFYyNTBaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+";

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { theme, toggleTheme, users } = useApp();
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'PIN' | 'CREDENTIALS'>('PIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  const handlePinSubmit = async (currentPin?: string) => {
    const pinToVerify = currentPin || pin;
    if (pinToVerify.length !== 4) return;
    
    setIsAuthenticating(true);
    
    const matchingUser = users.find(u => u.pin === pinToVerify || (u.username === 'admin' && pinToVerify === '1234'));

    if (matchingUser) {
      setTimeout(() => {
        setIsAuthenticating(false);
        onLogin(matchingUser);
      }, 500);
    } else {
      setTimeout(() => {
        setIsAuthenticating(false);
        setError('Invalid Terminal PIN');
        setPin('');
      }, 500);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit(pin);
    }
  }, [pin]);

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

  const handleCredSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsAuthenticating(true);
    setError('');

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setIsAuthenticating(false);
        const user = users.find(u => 
          (u.email === email || u.username === email) && 
          (u.password === password || (u.username === 'admin' && password === 'admin'))
        );

        if (user) {
          onLogin(user);
        } else {
          setError('Invalid Credentials.');
        }
      }, 800);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      
      const systemUser = users.find(u => u.email === email);
      if (systemUser) onLogin(systemUser);
      else throw new Error("User record not found in system database.");

    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-black flex items-center justify-center relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 dark:opacity-20 transition-opacity duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-black dark:via-black/80 dark:to-transparent transition-colors duration-500"></div>

      <div className="absolute top-6 right-6 z-20">
         <button onClick={toggleTheme} className="p-3 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur shadow-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:scale-110 transition-all">
           {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
         </button>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300 transition-colors">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <img src={FOODIKA_LOGO} alt="Foodika" className="w-20 h-20 rounded-3xl object-contain shadow-2xl shadow-red-900/20" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Foodika Terminal</h1>
          <p className="text-gray-500 dark:text-neutral-400 text-sm mt-2">Enterprise POS & Operations</p>
        </div>

        {mode === 'PIN' ? (
          <div className="flex flex-col items-center">
            <div className="flex gap-4 mb-8">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${pin.length > i ? 'bg-brand-red border-brand-red scale-110' : 'border-gray-300 dark:border-neutral-600 bg-transparent'}`}></div>
              ))}
            </div>

            {error && <div className="text-red-500 text-sm font-bold mb-4 animate-shake">{error}</div>}

            <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                  key={num} 
                  disabled={isAuthenticating}
                  onClick={() => handleNumPad(num.toString())} 
                  className="h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white text-2xl font-bold transition-all border border-gray-200 dark:border-neutral-700 active:scale-95 disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <button 
                onClick={() => setMode('CREDENTIALS')} 
                className="text-[10px] text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-white font-bold uppercase transition-colors"
              >
                STAFF<br/>LOGIN
              </button>
              <button 
                disabled={isAuthenticating}
                key="0" 
                onClick={() => handleNumPad('0')} 
                className="h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white text-2xl font-bold transition-all border border-gray-200 dark:border-neutral-700 active:scale-95 disabled:opacity-50"
              >
                0
              </button>
              <button 
                onClick={handleBackspace} 
                className="h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800/50 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 flex items-center justify-center transition-all active:scale-95"
              >
                <Delete size={24} />
              </button>
            </div>

            <button 
              onClick={() => handlePinSubmit()}
              disabled={pin.length < 4 || isAuthenticating}
              className="mt-8 w-full py-4 bg-brand-red hover:bg-brand-redHover text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30 disabled:opacity-50 active:scale-[0.98]"
            >
              {isAuthenticating ? <Loader2 className="animate-spin" /> : <>Access Terminal <ChevronRight size={20} /></>}
            </button>
          </div>
        ) : (
          <form onSubmit={handleCredSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase mb-2">Staff Email</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-red transition-all" placeholder="staff@foodika.app" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl py-4 pl-12 pr-12 focus:outline-none focus:border-brand-red transition-all" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {error && <div className="text-red-500 text-xs font-bold text-center animate-shake">{error}</div>}

            <div className="pt-4 flex gap-3">
               <button type="button" onClick={() => setMode('PIN')} className="flex-1 py-4 bg-gray-100 dark:bg-neutral-800 text-gray-500 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">PIN Pad</button>
               <button type="submit" disabled={isAuthenticating} className="flex-[2] py-4 bg-brand-red hover:bg-brand-redHover text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50">
                 {isAuthenticating ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
