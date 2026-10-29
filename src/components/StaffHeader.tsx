import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { 
  Coffee, 
  Receipt, 
  ChefHat, 
  LayoutDashboard, 
  LogOut
} from 'lucide-react';

interface Props {
  currentPortal: 'admin' | 'pos' | 'kds';
  onNavigate: (portal: 'admin' | 'pos' | 'kds') => void;
  onExitToCustomer: () => void;
}

export const StaffHeader: React.FC<Props> = ({ currentPortal, onNavigate, onExitToCustomer }) => {
  const { currentUser, logout } = useAuth();
  const { business, orders } = useStore();

  const isCashier = currentUser?.role === 'cashier';
  const isKitchen = currentUser?.role === 'kitchen';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner';

  const kitchenPending = orders.filter(
    (o) => o.fulfillment_status === 'pending' || o.fulfillment_status === 'confirmed' || o.fulfillment_status === 'preparing'
  ).length;

  const unpaidCount = orders.filter((o) => o.payment_status === 'unpaid').length;

  const handleLogout = () => {
    logout();
    onExitToCustomer();
  };

  const portalBadge = 
    isCashier 
      ? { text: 'TERMINAL KASIR POS', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
      : isKitchen
      ? { text: 'KITCHEN DISPLAY (KDS)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
      : { text: 'OWNER & ADMIN', color: 'bg-brand-500/20 text-brand-300 border-brand-500/40' };

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Portal Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-brand-700 flex items-center justify-center shadow-md">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">{business.name}</span>
                <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded border ${portalBadge.color}`}>
                  {portalBadge.text}
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Login: <strong className="text-stone-200">{currentUser?.name}</strong> ({currentUser?.email})
              </p>
            </div>
          </div>

          {/* Navigation Controls: STRICT ROLE SEPARATION */}
          {/* Cashier sees ONLY Kasir title, Kitchen sees ONLY Kitchen title. No cross-navigation allowed! */}
          <div className="flex items-center gap-2">
            
            {/* Admin Supervision Tabs (Admin ONLY) */}
            {isAdmin && (
              <nav className="flex items-center space-x-1 bg-stone-800 p-1 rounded-xl border border-stone-700 mr-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    currentPortal === 'admin'
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-stone-300 hover:text-white hover:bg-stone-700'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>

                <button
                  onClick={() => onNavigate('pos')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition relative ${
                    currentPortal === 'pos'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-stone-300 hover:text-white hover:bg-stone-700'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span className="hidden sm:inline">Kasir</span>
                  {unpaidCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {unpaidCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('kds')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition relative ${
                    currentPortal === 'kds'
                      ? 'bg-amber-600 text-stone-950 shadow'
                      : 'text-stone-300 hover:text-white hover:bg-stone-700'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  <span className="hidden sm:inline">Dapur</span>
                  {kitchenPending > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 text-[10px] flex items-center justify-center font-bold animate-pulse">
                      {kitchenPending}
                    </span>
                  )}
                </button>
              </nav>
            )}

            {/* Cashier-Only Indicator */}
            {isCashier && (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-300 text-xs font-semibold">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Modul Kasir Aktif</span>
              </div>
            )}

            {/* Kitchen-Only Indicator */}
            {isKitchen && (
              <div className="hidden sm:flex items-center gap-2 bg-amber-950/60 border border-amber-500/30 px-3 py-1.5 rounded-xl text-amber-300 text-xs font-semibold">
                <ChefHat className="w-4 h-4 text-amber-400" />
                <span>Modul KDS Dapur Aktif</span>
              </div>
            )}

            {/* Keluar / Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 text-xs font-bold transition shadow-sm"
              title="Keluar dari portal staf"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
