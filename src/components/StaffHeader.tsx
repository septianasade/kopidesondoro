import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { 
  Coffee, 
  Receipt, 
  ChefHat, 
  LayoutDashboard, 
  LogOut, 
  ExternalLink
} from 'lucide-react';

interface Props {
  currentPortal: 'admin' | 'pos' | 'kds';
  onNavigate: (portal: 'admin' | 'pos' | 'kds') => void;
  onExitToCustomer: () => void;
}

export const StaffHeader: React.FC<Props> = ({ currentPortal, onNavigate, onExitToCustomer }) => {
  const { currentUser, logout } = useAuth();
  const { business, orders } = useStore();

  const kitchenPending = orders.filter(
    (o) => o.fulfillment_status === 'pending' || o.fulfillment_status === 'confirmed' || o.fulfillment_status === 'preparing'
  ).length;

  const unpaidCount = orders.filter((o) => o.payment_status === 'unpaid').length;

  const handleLogout = () => {
    logout();
    onExitToCustomer();
  };

  const roleLabel = 
    currentUser?.role === 'admin' || currentUser?.role === 'owner'
      ? 'Owner / Admin'
      : currentUser?.role === 'cashier'
      ? 'Kasir POS'
      : 'Dapur / Barista';

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Portal Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate(currentPortal)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-brand-700 flex items-center justify-center shadow-md">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">{business.name}</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/40">
                  STAFF PORTAL
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Masuk sebagai: <strong className="text-stone-200">{currentUser?.name}</strong> ({roleLabel})
              </p>
            </div>
          </div>

          {/* Internal Staff Navigation (For Admin or Allowed Roles) */}
          <nav className="flex items-center space-x-1 bg-stone-800 p-1 rounded-xl border border-stone-700">
            {(currentUser?.role === 'admin' || currentUser?.role === 'cashier') && (
              <button
                onClick={() => onNavigate('pos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition relative ${
                  currentPortal === 'pos'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Kasir POS</span>
                {unpaidCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {unpaidCount}
                  </span>
                )}
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.role === 'kitchen') && (
              <button
                onClick={() => onNavigate('kds')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition relative ${
                  currentPortal === 'kds'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span className="hidden sm:inline">Dapur (KDS)</span>
                {kitchenPending > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] flex items-center justify-center font-bold animate-pulse">
                    {kitchenPending}
                  </span>
                )}
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentPortal === 'admin'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard Admin</span>
              </button>
            )}
          </nav>

          {/* Right Action: Preview Website & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExitToCustomer}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700/60 transition"
              title="Lihat website menu pelanggan"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
              <span>Web Pelanggan</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-900/60 text-stone-300 hover:text-rose-200 border border-stone-700 text-xs font-bold transition"
              title="Keluar dari sesi kasir / admin"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
