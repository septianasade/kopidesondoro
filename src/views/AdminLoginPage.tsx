import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, Lock, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onNavigateToTerminalPin: () => void;
  onBackToCustomer: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSuccess,
  onNavigateToTerminalPin,
  onBackToCustomer,
}) => {
  const { loginWithPassword } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Harap isi Email dan Kata Sandi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = loginWithPassword(email, password);
      setIsLoading(false);
      if (res.success && res.user) {
        onSuccess();
      } else {
        setErrorMessage(res.error || 'Email atau Kata Sandi salah.');
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F4F1EA] flex flex-col justify-between items-center p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-md flex items-center justify-between py-2 border-b-2 border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#FF4F00] shadow-[0_0_10px_#FF4F00]" />
          <span className="font-mono text-xs uppercase tracking-widest text-stone-400">
            ADMIN BACK-OFFICE PORTAL
          </span>
        </div>
        <button
          onClick={onBackToCustomer}
          className="text-xs font-mono text-stone-400 hover:text-[#FF4F00] transition underline underline-offset-4"
        >
          Layar Pelanggan ↗
        </button>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-sm my-auto">
        <div className="bg-[#1c1c1c] border-2 border-stone-700 shadow-[6px_6px_0px_#000000] p-6 sm:p-8">
          {/* Badge & Title */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-stone-700 mb-2">
              <Lock className="w-3.5 h-3.5 text-[#FF4F00]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-300">
                Supervisory & Management Access
              </span>
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white">
              LOGIN ADMIN
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Manajemen menu, laporan keuangan, pengaturan meja, dan staf
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 bg-rose-950/80 border-2 border-rose-600 text-rose-200 text-xs font-mono flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1.5">
                Email Administrator
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@toko.com"
                className="w-full bg-[#121212] border-2 border-stone-700 focus:border-[#FF4F00] text-white px-3.5 py-2.5 font-mono text-sm focus:outline-none transition shadow-inner placeholder:text-stone-600"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121212] border-2 border-stone-700 focus:border-[#FF4F00] text-white px-3.5 py-2.5 font-mono text-sm focus:outline-none transition shadow-inner pr-11 placeholder:text-stone-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#FF4F00] hover:bg-[#e04500] active:translate-y-1 active:shadow-none text-white font-mono font-bold text-xs uppercase tracking-wider border-2 border-white/20 shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer mt-6"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Back-Office'}</span>
            </button>
          </form>

          {/* Switch to Terminal PIN Login */}
          <div className="mt-6 pt-5 border-t border-stone-800 text-center">
            <button
              onClick={onNavigateToTerminalPin}
              className="w-full py-2.5 px-3 bg-[#262626] hover:bg-[#333333] active:translate-y-1 active:shadow-none border border-stone-600 text-stone-200 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[2px_2px_0px_#000000]"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Masuk Terminal Kasir/Dapur (6-Digit PIN)</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center py-2 border-t border-stone-900">
        <p className="text-[11px] font-mono text-stone-600">
          Sondoro Back-Office v2.4 • Protected Administration Gate
        </p>
      </footer>
    </div>
  );
};
