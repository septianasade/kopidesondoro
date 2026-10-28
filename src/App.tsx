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
  const { isAuthenticated, currentUser } = useAuth();
  const { tables, setCurrentTable, activeReceiptOrder, showReceiptForOrder } = useStore();

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

  // 1. Customer Route: Completely Clean Customer Experience
  if (currentRoute === 'customer') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <CustomerOrderingView />

        {activeReceiptOrder && (
          <ReceiptModal
            order={activeReceiptOrder}
            onClose={() => showReceiptForOrder(null as any)}
          />
        )}
      </div>
    );
  }

  // 2. Staff Routes: Requires Login
  if (!isAuthenticated) {
    const portalName =
      currentRoute === 'admin'
        ? 'Dashboard Administrator & Owner'
        : currentRoute === 'pos'
        ? 'Terminal Kasir & Transaksi POS'
        : 'Kitchen Display System (KDS Dapur)';

    return (
      <StaffLoginPage
        targetPortalName={portalName}
        onSuccess={() => {}}
        onBackToCustomer={() => navigateTo('customer')}
      />
    );
  }

  // Check RBAC permissions
  const canAccessAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner';
  const canAccessPos = canAccessAdmin || currentUser?.role === 'cashier';
  const canAccessKds = canAccessAdmin || currentUser?.role === 'kitchen';

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <StaffHeader
        currentPortal={currentRoute as 'admin' | 'pos' | 'kds'}
        onNavigate={(p) => navigateTo(p)}
        onExitToCustomer={() => navigateTo('customer')}
      />

      <main className="flex-1">
        {currentRoute === 'admin' && (
          canAccessAdmin ? (
            <AdminDashboardView />
          ) : (
            <div className="p-8 text-center text-rose-600 font-bold">
              Akses ditolak: Akun kasir/dapur tidak memiliki izin ke Dashboard Admin.
            </div>
          )
        )}

        {currentRoute === 'pos' && (
          canAccessPos ? (
            <PosCashierView />
          ) : (
            <div className="p-8 text-center text-rose-600 font-bold">
              Akses ditolak: Akun dapur tidak memiliki izin ke Kasir POS.
            </div>
          )
        )}

        {currentRoute === 'kds' && (
          canAccessKds ? (
            <KitchenDisplayView />
          ) : (
            <div className="p-8 text-center text-rose-600 font-bold">
              Akses ditolak: Akun Anda tidak memiliki izin ke Layar Dapur.
            </div>
          )
        )}
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
