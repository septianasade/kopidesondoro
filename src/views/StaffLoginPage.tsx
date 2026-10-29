import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Coffee, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, KeyRound, AlertTriangle } from 'lucide-react';

interface Props {
  expectedRole?: 'admin' | 'pos' | 'kds';
  onSuccess: () => void;
  onBackToCustomer: () => void;
}

export const StaffLoginPage: React.FC<Props> = ({ 
  expectedRole = 'admin',
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

  const validateRoleAccess = (userRole: string): boolean => {
    if (expectedRole === 'admin') {
      if (userRole !== 'admin' && userRole !== 'owner') {
        setErrorMessage('⛔ Akses Ditolak: Hanya Admin / Pemilik yang diizinkan masuk ke Dashboard Admin.');
        return false;
      }
    } else if (expectedRole === 'pos') {
      if (userRole !== 'cashier' && userRole !== 'admin' && userRole !== 'owner') {
        setErrorMessage('⛔ Akses Ditolak: Akun Dapur tidak memiliki hak akses ke Terminal Kasir POS.');
        return false;
      }
    } else if (expectedRole === 'kds') {
      if (userRole !== 'kitchen' && userRole !== 'admin' && userRole !== 'owner') {
        setErrorMessage('⛔ Akses Ditolak: Akun Kasir tidak memiliki hak akses ke Layar Dapur KDS.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (res.success && res.user) {
        if (validateRoleAccess(res.user.role)) {
          onSuccess();
        }
      } else {
        setErrorMessage(res.error || 'Email atau password salah. Silakan periksa kembali.');
      }
    }, 250);
  };

  const portalAccent = 
    expectedRole === 'pos'
      ? { title: 'Terminal Kasir (POS)', badge: 'PORTAL KASIR', color: 'from-emerald-500 to-teal-700', border: 'border-emerald-500/40', text: 'text-emerald-400' }
      : expectedRole === 'kds'
      ? { title: 'Layar Dapur & Barista (KDS)', badge: 'PORTAL DAPUR', color: 'from-amber-500 to-orange-700', border: 'border-amber-500/40', text: 'text-amber-400' }
      : { title: 'Dashboard Administrator & Owner', badge: 'PORTAL ADMIN', color: 'from-brand-500 to-stone-800', border: 'border-brand-500/40', text: 'text-brand-400' };

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
          <span>Kembali ke Menu Pelanggan</span>
        </button>

        {/* Brand Header */}
        <div className="text-center">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portalAccent.color} mx-auto flex items-center justify-center shadow-lg shadow-black/40 mb-3`}>
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <span className={`text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-md bg-stone-800 border ${portalAccent.border} ${portalAccent.text}`}>
            {portalAccent.badge}
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white mt-2">{business.name}</h2>
          <p className="text-xs text-stone-400 mt-1">{portalAccent.title}</p>
        </div>

        {/* Login Form Box */}
        <div className="mt-6 bg-stone-800/90 border border-stone-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-fade-in flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Email / Username Akun
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username atau email staf"
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
                  placeholder="Masukkan password rahasia"
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
              <span>{isLoading ? 'Memverifikasi...' : `Masuk ke ${portalAccent.title}`}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-700/60 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sistem Otentikasi Terenkripsi & Terisolasi Sesuai Peran</span>
          </div>

        </div>

      </div>
    </div>
  );
};
