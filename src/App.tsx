import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerOrderingView } from './views/CustomerOrderingView';
import { PosCashierView } from './views/PosCashierView';
import { KitchenDisplayView } from './views/KitchenDisplayView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { StaffLoginPage } from './views/StaffLoginPage';
import { StaffHeader } from './components/StaffHeader';
import { ReceiptModal } from './components/ReceiptModal';
import { ShieldAlert, BellRing, ArrowRightLeft } from 'lucide-react';

type AppRoute = 'customer' | 'admin' | 'pos' | 'kds';

function resolveRouteFromUrl(): AppRoute {
  if (typeof window === 'undefined') return 'customer';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (path.startsWith('/admin') || hash.startsWith('#/admin')) return 'admin';
  if (path.startsWith('/pos') || hash.startsWith('#/pos')) return 'pos';
  if (path.startsWith('/kds') || hash.startsWith('#/kds')) return 'kds';
  return 'customer';
}

const AppRouter: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(resolveRouteFromUrl());
  const { isAuthenticated, currentUser, logout } = useAuth();
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

  // Handle URL Table QR Token on Customer Site
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('table');
    const qrToken = urlParams.get('token');

    if (tableId || qrToken) {
      const matched = tables.find(
        (t) => t.id === tableId || (qrToken && t.qr_token === qrToken)
      );
      if (matched) {
        setCurrentTable(matched);
      }
    }
  }, [tables, setCurrentTable]);

  const navigateTo = (route: AppRoute) => {
    window.location.hash = `#/${route}`;
    setCurrentRoute(route);
  };

  const handleSwitchAccount = () => {
    logout();
    // Keep user on the requested route so they can log in with appropriate role
  };

  // 1. Customer Route: Pure Customer Experience (Zero Staff UI)
  if (currentRoute === 'customer') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col relative">
        <CustomerOrderingView />

        {/* Real-time Order Sync Notification Banner */}
        {lastLiveMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-amber-300 font-bold px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-500/50 animate-bounce">
            <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
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

  // 2. Staff Routes: Requires Authentication
  if (!isAuthenticated) {
    return (
      <StaffLoginPage
        expectedRole={currentRoute as 'admin' | 'pos' | 'kds'}
        onSuccess={() => {}}
        onBackToCustomer={() => navigateTo('customer')}
      />
    );
  }

  // 3. Strict Role-Based Access Control (RBAC) Guard
  const userRole = currentUser?.role;
  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isCashier = userRole === 'cashier';
  const isKitchen = userRole === 'kitchen';

  // Guard: Cashier trying to open admin or kitchen
  if (isCashier && currentRoute !== 'pos') {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-800 border border-rose-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Akses Dilarang (403 Forbidden)</h2>
          <p className="text-xs sm:text-sm text-stone-400 mb-6 leading-relaxed">
            Anda saat ini sedang login sebagai <strong className="text-emerald-400">Kasir</strong> ({currentUser?.email}). 
            Portal {currentRoute === 'admin' ? 'Dashboard Admin' : 'Layar Dapur'} hanya dapat diakses oleh staf berwenang.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigateTo('pos')}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-600/30"
            >
              Kembali ke Terminal Kasir POS
            </button>
            <button
              onClick={handleSwitchAccount}
              className="w-full py-2.5 px-4 bg-stone-700 hover:bg-stone-600 text-stone-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-stone-600"
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              <span>Ganti Akun & Masuk ke {currentRoute === 'admin' ? 'Portal Admin' : 'Portal Dapur'}</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigateTo('customer');
              }}
              className="w-full py-2 px-4 text-stone-500 hover:text-stone-300 text-xs transition"
            >
              Kembali ke Menu Pelanggan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guard: Kitchen trying to open admin or cashier
  if (isKitchen && currentRoute !== 'kds') {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-800 border border-rose-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Akses Dilarang (403 Forbidden)</h2>
          <p className="text-xs sm:text-sm text-stone-400 mb-6 leading-relaxed">
            Anda saat ini sedang login sebagai <strong className="text-amber-400">Tim Dapur</strong> ({currentUser?.email}). 
            Portal {currentRoute === 'admin' ? 'Dashboard Admin' : 'Terminal Kasir'} hanya dapat diakses oleh staf berwenang.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigateTo('kds')}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-600/30"
            >
              Kembali ke Layar Dapur KDS
            </button>
            <button
              onClick={handleSwitchAccount}
              className="w-full py-2.5 px-4 bg-stone-700 hover:bg-stone-600 text-stone-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-stone-600"
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              <span>Ganti Akun & Masuk ke {currentRoute === 'admin' ? 'Portal Admin' : 'Terminal Kasir'}</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigateTo('customer');
              }}
              className="w-full py-2 px-4 text-stone-500 hover:text-stone-300 text-xs transition"
            >
              Kembali ke Menu Pelanggan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col relative">
      <StaffHeader
        currentPortal={currentRoute as 'admin' | 'pos' | 'kds'}
        onNavigate={(p) => navigateTo(p)}
        onExitToCustomer={() => navigateTo('customer')}
      />

      {/* Real-time Order Sync Notification Banner for Staff */}
      {lastLiveMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-emerald-300 animate-bounce">
          <BellRing className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="text-xs sm:text-sm">{lastLiveMessage}</span>
        </div>
      )}

      <main className="flex-1">
        {currentRoute === 'admin' && isAdmin && <AdminDashboardView />}
        {currentRoute === 'pos' && (isAdmin || isCashier) && <PosCashierView />}
        {currentRoute === 'kds' && (isAdmin || isKitchen) && <KitchenDisplayView />}
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
