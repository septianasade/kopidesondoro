import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerOrderingView } from './views/CustomerOrderingView';
import { PosCashierView } from './views/PosCashierView';
import { KitchenDisplayView } from './views/KitchenDisplayView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminLoginPage } from './views/AdminLoginPage';
import { TerminalPinLoginPage } from './views/TerminalPinLoginPage';
import { StaffHeader } from './components/StaffHeader';
import { ReceiptModal } from './components/ReceiptModal';
import { ShieldAlert, BellRing, ArrowRightLeft } from 'lucide-react';

export type AppRoute = 
  | 'customer' 
  | 'login-admin' 
  | 'terminal-login' 
  | 'admin' 
  | 'pos' 
  | 'kitchen';

function resolveRouteFromUrl(): AppRoute {
  if (typeof window === 'undefined') return 'customer';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // Jalur 1: Login Admin Back-Office
  if (path.startsWith('/login-admin') || hash.startsWith('#/login-admin')) {
    return 'login-admin';
  }

  // Jalur 2: Terminal Operasional Toko (PIN Pad)
  if (path.startsWith('/terminal-login') || hash.startsWith('#/terminal-login')) {
    return 'terminal-login';
  }

  // Admin Dashboard
  if (path.startsWith('/admin') || hash.startsWith('#/admin')) {
    return 'admin';
  }

  // Kasir POS
  if (path.startsWith('/pos') || hash.startsWith('#/pos')) {
    return 'pos';
  }

  // Dapur KDS (Kitchen Display System) - support both /kitchen and /kds
  if (
    path.startsWith('/kitchen') || hash.startsWith('#/kitchen') ||
    path.startsWith('/kds') || hash.startsWith('#/kds')
  ) {
    return 'kitchen';
  }

  // Jalur 3: Pelanggan Self-Order (/order or root /)
  return 'customer';
}

const AppRouter: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(resolveRouteFromUrl());
  const { isAuthenticated, currentUser, logout, lockTerminal } = useAuth();
  const { tables, setCurrentTable, activeReceiptOrder, showReceiptForOrder, lastLiveMessage } = useStore();

  // Listen to browser navigation changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(resolveRouteFromUrl());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // JALUR 3: Handle URL Table QR Token on Customer Site (/order?table=[nomor]&token=[kode_unik])
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    const tokenParam = urlParams.get('token');

    if (tableParam || tokenParam) {
      const cleanTable = tableParam?.trim();
      const cleanToken = tokenParam?.trim().toUpperCase();

      const matched = tables.find((t) => {
        const isTableNumMatch = cleanTable && (
          t.table_number === cleanTable || 
          t.table_number === cleanTable.padStart(2, '0') ||
          t.id === cleanTable
        );

        const isTokenMatch = cleanToken && (
          t.qr_token.toUpperCase() === cleanToken ||
          `MEJA${t.table_number}` === cleanToken ||
          t.qr_token.toUpperCase().includes(cleanToken)
        );

        if (cleanTable && cleanToken) {
          return isTableNumMatch || isTokenMatch;
        }
        return isTableNumMatch || isTokenMatch;
      });

      if (matched) {
        setCurrentTable(matched);
      }
    }
  }, [tables, setCurrentTable]);

  const navigateTo = (route: AppRoute) => {
    window.location.hash = `#/${route}`;
    setCurrentRoute(route);
  };

  const handleSwitchAccount = (targetPortalRoute: 'admin' | 'pos' | 'kitchen') => {
    logout();
    if (targetPortalRoute === 'admin') {
      navigateTo('login-admin');
    } else {
      navigateTo('terminal-login');
    }
  };

  // 1. JALUR 3: Pure Customer Experience (Zero Staff UI, No Account Required)
  if (currentRoute === 'customer') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col relative font-sans">
        <CustomerOrderingView />

        {/* Real-time Order Sync Notification Banner */}
        {lastLiveMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#121212] text-[#CCFF00] font-mono font-bold px-5 py-2.5 shadow-[4px_4px_0px_#000000] flex items-center gap-2 border-2 border-[#CCFF00] animate-bounce">
            <BellRing className="w-4 h-4 text-[#CCFF00] animate-pulse" />
            <span className="text-xs sm:text-sm">{lastLiveMessage}</span>
          </div>
        )}

        {activeReceiptOrder && (
          <ReceiptModal
            order={activeReceiptOrder}
            onClose={() => showReceiptForOrder(null as any)}
          />
        )}
      </div>
    );
  }

  // 2. JALUR 1: Login Admin Back-Office (Email + Password)
  if (currentRoute === 'login-admin') {
    if (isAuthenticated && (currentUser?.role === 'ADMIN' || (currentUser?.role as any) === 'admin')) {
      navigateTo('admin');
      return null;
    }
    return (
      <AdminLoginPage
        onSuccess={() => navigateTo('admin')}
        onNavigateToTerminalPin={() => navigateTo('terminal-login')}
        onBackToCustomer={() => navigateTo('customer')}
      />
    );
  }

  // 3. JALUR 2: Terminal Operasional Toko (6-Digit PIN Pad Layar Sentuh)
  if (currentRoute === 'terminal-login') {
    return (
      <TerminalPinLoginPage
        onSuccess={(role) => {
          if (role === 'CASHIER') navigateTo('pos');
          else if (role === 'KITCHEN') navigateTo('kitchen');
          else navigateTo('admin');
        }}
        onNavigateToAdminLogin={() => navigateTo('login-admin')}
        onBackToCustomer={() => navigateTo('customer')}
      />
    );
  }

  // 4. Staff Routes: Protect if not authenticated
  if (!isAuthenticated) {
    if (currentRoute === 'admin') {
      return (
        <AdminLoginPage
          onSuccess={() => navigateTo('admin')}
          onNavigateToTerminalPin={() => navigateTo('terminal-login')}
          onBackToCustomer={() => navigateTo('customer')}
        />
      );
    }
    return (
      <TerminalPinLoginPage
        onSuccess={(role) => {
          if (role === 'CASHIER') navigateTo('pos');
          else if (role === 'KITCHEN') navigateTo('kitchen');
          else navigateTo('admin');
        }}
        onNavigateToAdminLogin={() => navigateTo('login-admin')}
        onBackToCustomer={() => navigateTo('customer')}
      />
    );
  }

  // 5. Strict Role-Based Access Control (RBAC) Guard
  const roleUpper = (currentUser?.role || '').toUpperCase();
  const isAdmin = roleUpper === 'ADMIN' || roleUpper === 'OWNER';
  const isCashier = roleUpper === 'CASHIER';
  const isKitchen = roleUpper === 'KITCHEN';

  // Guard: Kasir trying to open Admin or Kitchen
  if (isCashier && currentRoute !== 'pos') {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F4F1EA] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#1c1c1c] border-2 border-rose-600 shadow-[6px_6px_0px_#000000] p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-rose-950/80 border-2 border-rose-600 text-rose-400 mx-auto flex items-center justify-center mb-4 shadow-[3px_3px_0px_#000000]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest block mb-1">
            403 FORBIDDEN • AKSES DITOLAK
          </span>
          <h2 className="text-xl font-bold text-white mb-2 uppercase">
            ROLE KASIR TIDAK DIIZINKAN
          </h2>
          <p className="text-xs text-stone-400 mb-6 leading-relaxed font-mono">
            Anda login sebagai <strong className="text-[#CCFF00]">{currentUser?.name}</strong> (KASIR).
            Portal {currentRoute === 'admin' ? 'Dashboard Admin' : 'Layar Dapur KDS'} hanya untuk staf berwenang.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigateTo('pos')}
              className="w-full py-3 px-4 bg-[#CCFF00] hover:bg-[#b8e600] text-[#121212] font-mono font-bold text-xs uppercase tracking-wider transition border-2 border-stone-900 shadow-[3px_3px_0px_#000000] active:translate-y-0.5"
            >
              Kembali ke Terminal Kasir POS
            </button>
            <button
              onClick={() => handleSwitchAccount(currentRoute as any)}
              className="w-full py-2.5 px-4 bg-[#262626] hover:bg-[#333333] text-stone-200 font-mono text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border border-stone-600 shadow-[2px_2px_0px_#000000]"
            >
              <ArrowRightLeft className="w-4 h-4 text-[#FF4F00]" />
              <span>Ganti Akun & Buka {currentRoute === 'admin' ? 'Portal Admin' : 'Layar Dapur'}</span>
            </button>
            <button
              onClick={() => {
                lockTerminal();
                navigateTo('customer');
              }}
              className="w-full py-2 px-4 text-stone-500 hover:text-stone-300 font-mono text-xs transition"
            >
              Kembali ke Menu Pelanggan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guard: Dapur trying to open Admin or Kasir
  if (isKitchen && currentRoute !== 'kitchen') {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F4F1EA] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#1c1c1c] border-2 border-rose-600 shadow-[6px_6px_0px_#000000] p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-rose-950/80 border-2 border-rose-600 text-rose-400 mx-auto flex items-center justify-center mb-4 shadow-[3px_3px_0px_#000000]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest block mb-1">
            403 FORBIDDEN • AKSES DITOLAK
          </span>
          <h2 className="text-xl font-bold text-white mb-2 uppercase">
            ROLE DAPUR TIDAK DIIZINKAN
          </h2>
          <p className="text-xs text-stone-400 mb-6 leading-relaxed font-mono">
            Anda login sebagai <strong className="text-amber-400">{currentUser?.name}</strong> (TIM DAPUR).
            Portal {currentRoute === 'admin' ? 'Dashboard Admin' : 'Terminal Kasir POS'} hanya untuk staf berwenang.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigateTo('kitchen')}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-bold text-xs uppercase tracking-wider transition border-2 border-stone-900 shadow-[3px_3px_0px_#000000] active:translate-y-0.5"
            >
              Kembali ke Layar Dapur KDS
            </button>
            <button
              onClick={() => handleSwitchAccount(currentRoute as any)}
              className="w-full py-2.5 px-4 bg-[#262626] hover:bg-[#333333] text-stone-200 font-mono text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border border-stone-600 shadow-[2px_2px_0px_#000000]"
            >
              <ArrowRightLeft className="w-4 h-4 text-[#CCFF00]" />
              <span>Ganti Akun & Buka {currentRoute === 'admin' ? 'Portal Admin' : 'Terminal Kasir'}</span>
            </button>
            <button
              onClick={() => {
                lockTerminal();
                navigateTo('customer');
              }}
              className="w-full py-2 px-4 text-stone-500 hover:text-stone-300 font-mono text-xs transition"
            >
              Kembali ke Menu Pelanggan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. Render Authorized Portal
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col relative font-sans">
      <StaffHeader
        currentPortal={currentRoute === 'kitchen' ? 'kds' : (currentRoute as 'admin' | 'pos')}
        onNavigate={(p) => navigateTo(p === 'kds' ? 'kitchen' : (p as AppRoute))}
        onExitToCustomer={() => navigateTo('customer')}
      />

      {/* Real-time Order Sync Notification Banner for Staff */}
      {lastLiveMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#121212] text-[#CCFF00] font-mono font-bold px-5 py-3 rounded-none shadow-[4px_4px_0px_#000000] flex items-center gap-3 border-2 border-[#CCFF00] animate-bounce">
          <BellRing className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="text-xs sm:text-sm">{lastLiveMessage}</span>
        </div>
      )}

      <main className="flex-1">
        {currentRoute === 'admin' && isAdmin && <AdminDashboardView />}
        {currentRoute === 'pos' && (isAdmin || isCashier) && <PosCashierView />}
        {currentRoute === 'kitchen' && (isAdmin || isKitchen) && <KitchenDisplayView />}
      </main>

      {activeReceiptOrder && (
        <ReceiptModal
          order={activeReceiptOrder}
          onClose={() => showReceiptForOrder(null as any)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppRouter />
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;
