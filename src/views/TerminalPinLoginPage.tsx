import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Delete, KeyRound, Lock } from 'lucide-react';

interface TerminalPinLoginPageProps {
  onSuccess: (role: 'ADMIN' | 'CASHIER' | 'KITCHEN') => void;
  onNavigateToAdminLogin: () => void;
  onBackToCustomer: () => void;
}

export const TerminalPinLoginPage: React.FC<TerminalPinLoginPageProps> = ({
  onSuccess,
  onNavigateToAdminLogin,
  onBackToCustomer,
}) => {
  const { loginWithPin } = useAuth();
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Auto-verify when 6 digits are typed
  useEffect(() => {
    if (pin.length === 6) {
      handlePinSubmit(pin);
    }
  }, [pin]);

  const handleDigitPress = (digit: string) => {
    if (pin.length < 6) {
      setErrorMessage(null);
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setErrorMessage(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMessage(null);
    setPin('');
  };

  const handlePinSubmit = (pinToSubmit: string) => {
    setIsVerifying(true);
    setErrorMessage(null);

    // Micro-delay for tactile feedback feeling
    setTimeout(() => {
      const res = loginWithPin(pinToSubmit);
      setIsVerifying(false);

      if (res.success && res.user) {
        onSuccess(res.user.role);
      } else {
        setErrorMessage(res.error || 'PIN Salah! Silakan coba lagi.');
        setPin('');
      }
    }, 180);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F4F1EA] flex flex-col justify-between items-center p-4 sm:p-6 select-none font-sans">
      {/* Top Header Bar */}
      <header className="w-full max-w-md flex items-center justify-between py-2 border-b-2 border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#CCFF00] rounded-none animate-pulse shadow-[0_0_10px_#CCFF00]" />
          <span className="font-mono text-xs uppercase tracking-widest text-stone-400">
            TERMINAL OPERASIONAL TOKO
          </span>
        </div>
        <button
          onClick={onBackToCustomer}
          className="text-xs font-mono text-stone-400 hover:text-[#CCFF00] transition underline underline-offset-4"
        >
          Layar Pelanggan ↗
        </button>
      </header>

      {/* Main Tactile PIN Pad Card */}
      <main className="w-full max-w-sm my-auto flex flex-col items-center">
        {/* Hardware Bezel */}
        <div className="w-full bg-[#1c1c1c] border-2 border-stone-700 shadow-[6px_6px_0px_#000000] p-6 rounded-none">
          {/* Header Title */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-900 border border-stone-700 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-300">
                Staff Quick PIN Entry
              </span>
            </div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-white uppercase">
              MASUKKAN 6 DIGIT PIN
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Kasir & Tim Dapur silakan input PIN kartu kerja
            </p>
          </div>

          {/* PIN Indicator Dots */}
          <div className="bg-[#121212] border-2 border-stone-700 py-4 px-6 mb-5 flex items-center justify-center gap-4 shadow-inner">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = index < pin.length;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                    isFilled
                      ? 'bg-[#CCFF00] border-[#CCFF00] scale-110 shadow-[0_0_12px_#CCFF00]'
                      : 'bg-transparent border-stone-600'
                  }`}
                />
              );
            })}
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-2.5 bg-rose-950/80 border-2 border-rose-600 text-rose-200 text-xs font-mono flex items-center gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tactile Hardware Numpad */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '1', sub: '' },
              { label: '2', sub: 'ABC' },
              { label: '3', sub: 'DEF' },
              { label: '4', sub: 'GHI' },
              { label: '5', sub: 'JKL' },
              { label: '6', sub: 'MNO' },
              { label: '7', sub: 'PQRS' },
              { label: '8', sub: 'TUV' },
              { label: '9', sub: 'WXYZ' },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                disabled={isVerifying}
                onClick={() => handleDigitPress(btn.label)}
                className="h-16 bg-[#262626] hover:bg-[#333333] active:bg-[#CCFF00] active:text-[#121212] active:translate-y-1 active:shadow-none border-2 border-stone-600 shadow-[3px_3px_0px_#000000] flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="text-2xl font-bold font-mono leading-none">
                  {btn.label}
                </span>
                {btn.sub && (
                  <span className="text-[9px] font-mono tracking-widest text-stone-500 group-active:text-stone-900 mt-1">
                    {btn.sub}
                  </span>
                )}
              </button>
            ))}

            {/* Bottom Row: Clear, 0, Backspace */}
            <button
              type="button"
              disabled={isVerifying || pin.length === 0}
              onClick={handleClear}
              className="h-16 bg-[#381a1a] hover:bg-[#4a2222] active:translate-y-1 active:shadow-none border-2 border-rose-800 text-rose-300 shadow-[3px_3px_0px_#000000] flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-30"
            >
              <span className="text-base font-bold font-mono">C</span>
              <span className="text-[9px] font-mono uppercase text-rose-400">CLEAR</span>
            </button>

            <button
              type="button"
              disabled={isVerifying}
              onClick={() => handleDigitPress('0')}
              className="h-16 bg-[#262626] hover:bg-[#333333] active:bg-[#CCFF00] active:text-[#121212] active:translate-y-1 active:shadow-none border-2 border-stone-600 shadow-[3px_3px_0px_#000000] flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="text-2xl font-bold font-mono leading-none">0</span>
            </button>

            <button
              type="button"
              disabled={isVerifying || pin.length === 0}
              onClick={handleBackspace}
              className="h-16 bg-[#2a2a2a] hover:bg-[#383838] active:translate-y-1 active:shadow-none border-2 border-stone-600 text-stone-200 shadow-[3px_3px_0px_#000000] flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-30"
            >
              <Delete className="w-5 h-5" />
              <span className="text-[9px] font-mono uppercase text-stone-400">HAPUS</span>
            </button>
          </div>

          {/* Verification Status */}
          {isVerifying && (
            <div className="mt-4 text-center font-mono text-xs text-[#CCFF00] animate-pulse">
              Memverifikasi identitas staf...
            </div>
          )}
        </div>

        {/* Quick Link to Admin Back-Office (Email + Password) */}
        <div className="w-full mt-5 text-center">
          <button
            onClick={onNavigateToAdminLogin}
            className="w-full py-3 px-4 bg-[#1a1a1a] hover:bg-[#252525] border-2 border-stone-700 text-stone-300 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[3px_3px_0px_#000000]"
          >
            <Lock className="w-3.5 h-3.5 text-[#FF4F00]" />
            <span>Admin Back-Office (Email Login) →</span>
          </button>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-md text-center py-2 border-t border-stone-900">
        <p className="text-[11px] font-mono text-stone-600">
          Sondoro POS Terminal v2.4 • Hardened PIN Pad Security
        </p>
      </footer>
    </div>
  );
};
