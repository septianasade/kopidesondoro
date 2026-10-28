import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Coffee, 
  Smartphone, 
  Receipt, 
  ChefHat, 
  LayoutDashboard, 
  Layers
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    business, 
    activeView, 
    setActiveView, 
    tables, 
    currentTable, 
    setCurrentTable, 
    orders 
  } = useStore();

  const kitchenPendingCount = orders.filter(
    (o) => o.fulfillment_status === 'pending' || o.fulfillment_status === 'confirmed' || o.fulfillment_status === 'preparing'
  ).length;

  const unpaidCount = orders.filter((o) => o.payment_status === 'unpaid').length;

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-lg border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('customer')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-900/40">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">{business.name}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  POS & QR v1.0
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">Sistem Pemesanan Meja & Kasir Resto</p>
            </div>
          </div>

          {/* Mode Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-stone-800/80 p-1 rounded-xl border border-stone-700/60">
            <button
              onClick={() => setActiveView('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeView === 'customer'
                  ? 'bg-brand-500 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">Menu Meja</span>
            </button>

            <button
              onClick={() => setActiveView('pos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
                activeView === 'pos'
                  ? 'bg-brand-500 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden md:inline">Kasir POS</span>
              {unpaidCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {unpaidCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('kds')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
                activeView === 'kds'
                  ? 'bg-brand-500 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span className="hidden md:inline">Dapur (KDS)</span>
              {kitchenPendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-900 text-[10px] flex items-center justify-center font-bold animate-pulse">
                  {kitchenPendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeView === 'admin'
                  ? 'bg-brand-500 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Admin</span>
            </button>
          </nav>

          {/* Quick Table Selector for Testing QR Modes */}
          <div className="flex items-center gap-2">
            {activeView === 'customer' && (
              <div className="flex items-center gap-1.5 bg-stone-800 border border-stone-700 px-2 py-1 rounded-lg text-xs">
                <Layers className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-stone-400 hidden sm:inline">Simulasi:</span>
                <select
                  value={currentTable?.id || ''}
                  onChange={(e) => {
                    const sel = tables.find((t) => t.id === e.target.value);
                    if (sel) setCurrentTable(sel);
                  }}
                  className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id} className="bg-stone-900 text-white">
                      {t.table_label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
