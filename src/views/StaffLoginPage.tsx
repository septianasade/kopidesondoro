import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Coffee, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';

interface Props {
  targetPortalName?: string;
  onSuccess: () => void;
  onBackToCustomer: () => void;
}

export const StaffLoginPage: React.FC<Props> = ({ 
  targetPortalName = 'Portal Staf & Manajemen', 
  onSuccess,
  onBackToCustomer 
}) => {
  const { login } = useAuth();
  const { business } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMessage(res.error || 'Autentikasi gagal.');
      }
    }, 250);
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    const res = login(quickEmail, quickPass);
    if (res.success) {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        
        {/* Back Link */}
        <button
          onClick={onBackToCustomer}
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition mb-6 bg-stone-800/80 hover:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Menu Pelanggan Meja</span>
        </button>

        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-brand-700 mx-auto flex items-center justify-center shadow-lg shadow-brand-900/50 mb-3">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">{business.name}</h2>
          <p className="text-xs text-stone-400 mt-1">{targetPortalName}</p>
        </div>

        {/* Login Form Box */}
        <div className="mt-6 bg-stone-800/90 border border-stone-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-fade-in flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Email / Username Staf
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="admin@sondoro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-900/80 text-white placeholder-stone-600 text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-900/80 text-white placeholder-stone-600 text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="mt-6 pt-5 border-t border-stone-700/80">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider text-center mb-3">
              ⚡ Akun Uji Coba Cepat (1-Klik Masuk)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@sondoro.com', 'admin123')}
                className="p-2 rounded-xl bg-stone-900/80 hover:bg-stone-700/80 border border-stone-700 text-center transition flex flex-col items-center gap-1"
              >
                <span className="text-xs font-bold text-amber-400">Owner</span>
                <span className="text-[10px] text-stone-400">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('kasir@sondoro.com', 'kasir123')}
                className="p-2 rounded-xl bg-stone-900/80 hover:bg-stone-700/80 border border-stone-700 text-center transition flex flex-col items-center gap-1"
              >
                <span className="text-xs font-bold text-emerald-400">Kasir</span>
                <span className="text-[10px] text-stone-400">kasir123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dapur@sondoro.com', 'dapur123')}
                className="p-2 rounded-xl bg-stone-900/80 hover:bg-stone-700/80 border border-stone-700 text-center transition flex flex-col items-center gap-1"
              >
                <span className="text-xs font-bold text-brand-400">Dapur</span>
                <span className="text-[10px] text-stone-400">dapur123</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Terproteksi Autentikasi Staf Berbasis Peran</span>
          </div>

        </div>

      </div>
    </div>
  );
};
