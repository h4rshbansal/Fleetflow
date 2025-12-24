
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (identifier: string, pass: string) => void;
  t: any;
}

const Login: React.FC<LoginProps> = ({ onLogin, t }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;
    onLogin(identifier, password);
  };

  return (
    <div className="mt-20 max-w-md mx-auto bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-600/20">FF</div>
        <h2 className="text-2xl font-bold text-white">{t.login}</h2>
        <p className="text-slate-400 text-sm mt-2">Enter credentials to manage the fleet</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">{t.username}</label>
          <input 
            type="text"
            required
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all placeholder:text-slate-600"
            placeholder="ishwar or email@fleet.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">{t.password}</label>
          <input 
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all placeholder:text-slate-600"
            placeholder="••••••••"
          />
        </div>
        <button 
          type="submit"
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
        >
          {t.login}
        </button>
      </form>
      <div className="mt-10 pt-6 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">System Access</p>
        <div className="grid grid-cols-1 gap-2 text-[10px] text-slate-400 font-mono">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">Admin: <span className="text-indigo-400">ishwar</span> / <span className="text-indigo-400">ishwar@121</span></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
