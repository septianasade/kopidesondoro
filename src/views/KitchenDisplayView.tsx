import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { soundNotifier } from '../utils/audio';
import { 
  ChefHat, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Timer, 
  Flame, 
  Bell, 
  CheckCheck,
  History,
  Lock
} from 'lucide-react';

export const KitchenDisplayView: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const { lockTerminal } = useAuth();
  const [filterStation, setFilterStation] = useState<'active' | 'pending' | 'preparing' | 'ready' | 'completed'>('active');
  const [isMuted, setIsMuted] = useState(false);
  const [nowTime, setNowTime] = useState(Date.now());
  const [justServedOrder, setJustServedOrder] = useState<string | null>(null);

  // Tick timer every 15 seconds to update elapsed time labels
  useEffect(() => {
    const interval = setInterval(() => setNowTime(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter kitchen active orders vs completed history
  const activeOrders = orders.filter((o) => {
    // Active orders are ONLY those not yet served/completed and not cancelled
    return o.fulfillment_status === 'pending' || 
           o.fulfillment_status === 'confirmed' || 
           o.fulfillment_status === 'preparing' || 
           o.fulfillment_status === 'ready';
  });

  const completedOrders = orders.filter((o) => {
    return o.fulfillment_status === 'completed' || o.fulfillment_status === 'served';
  });

  // Display orders based on tab
  const displayedOrders = orders.filter((o) => {
    if (filterStation === 'completed') {
      return o.fulfillment_status === 'completed' || o.fulfillment_status === 'served';
    }

    // Active stations: exclude completed, served, cancelled
    if (o.fulfillment_status === 'completed' || o.fulfillment_status === 'served' || o.fulfillment_status === 'cancelled') {
      return false;
    }

    if (filterStation === 'pending') {
      return o.fulfillment_status === 'pending' || o.fulfillment_status === 'confirmed';
    }
    if (filterStation === 'preparing') {
      return o.fulfillment_status === 'preparing';
    }
    if (filterStation === 'ready') {
      return o.fulfillment_status === 'ready';
    }

    return true; // 'active' (all active queues)
  });

  const getElapsedMinutes = (createdAt: string) => {
    const diffMs = nowTime - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const playTestChime = () => {
    soundNotifier.playNewOrderChime();
  };

  const handleMarkServed = (orderId: string, orderNumber: string, tableNumber: string) => {
    // Mark as completed so it leaves the active queue and moves to history
    updateOrderStatus(orderId, 'completed');
    setJustServedOrder(`Pesanan #${orderNumber} (Meja ${tableNumber}) telah disajikan & dipindahkan ke Riwayat Selesai.`);
    setTimeout(() => setJustServedOrder(null), 4000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-950 text-stone-100 flex flex-col">
      
      {/* Toast Notification when Order Served */}
      {justServedOrder && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-2xl border border-emerald-400 flex items-center gap-2 animate-bounce">
          <CheckCheck className="w-4 h-4 text-emerald-200" />
          <span>{justServedOrder}</span>
        </div>
      )}

      {/* KDS Top Ribbon */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base tracking-tight text-white">Kitchen Display System (KDS)</h2>
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Realtime
              </span>
            </div>
            <p className="text-xs text-stone-400">Layar Antrean Pesanan Dapur & Barista</p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 bg-stone-800 p-1 rounded-xl border border-stone-700 overflow-x-auto">
          <button
            onClick={() => setFilterStation('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterStation === 'active' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-300 hover:text-white'
            }`}
          >
            <span>Semua Aktif</span>
            <span className="px-1.5 py-0.2 rounded-md bg-stone-950/40 text-[10px]">
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setFilterStation('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStation === 'pending' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-300 hover:text-white'
            }`}
          >
            Antrean Masuk ({orders.filter((o) => o.fulfillment_status === 'pending' || o.fulfillment_status === 'confirmed').length})
          </button>

          <button
            onClick={() => setFilterStation('preparing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStation === 'preparing' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-300 hover:text-white'
            }`}
          >
            Dimasak ({orders.filter((o) => o.fulfillment_status === 'preparing').length})
          </button>

          <button
            onClick={() => setFilterStation('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStation === 'ready' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-300 hover:text-white'
            }`}
          >
            Siap Saji ({orders.filter((o) => o.fulfillment_status === 'ready').length})
          </button>

          {/* Selesai Disajikan Tab */}
          <button
            onClick={() => setFilterStation('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterStation === 'completed' ? 'bg-emerald-600 text-white shadow' : 'text-stone-400 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Selesai ({completedOrders.length})</span>
          </button>
        </div>

        {/* Audio Notifier Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={playTestChime}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold border border-stone-700"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Tes Bell</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700"
            title={isMuted ? 'Suara Senyap' : 'Suara Aktif'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              lockTerminal();
              window.location.hash = '#/terminal-login';
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121212] hover:bg-black text-[#CCFF00] border-2 border-[#CCFF00] text-xs font-bold font-mono transition shadow-sm cursor-pointer ml-1"
            title="Kunci layar dapur dan kembali ke PIN pad"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Kunci Layar (Lock PIN)</span>
          </button>
        </div>

      </div>

      {/* Ticket Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {displayedOrders.length === 0 ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 text-stone-600">
            <ChefHat className="w-20 h-20 stroke-1 mb-3 text-stone-700" />
            <h3 className="font-extrabold text-xl text-stone-400">
              {filterStation === 'completed' ? 'Belum Ada Pesanan Selesai' : 'Dapur Sedang Bersih!'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mt-1">
              {filterStation === 'completed' 
                ? 'Pesanan yang telah disajikan ke pelanggan akan tercatat rapi di sini.'
                : 'Tidak ada antrean pesanan aktif yang perlu dimasak saat ini. Pesanan baru akan berdering otomatis.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedOrders.map((ord) => {
              const elapsed = getElapsedMinutes(ord.created_at);
              const isUrgent = elapsed >= 15;
              const isReady = ord.fulfillment_status === 'ready';
              const isDone = ord.fulfillment_status === 'completed' || ord.fulfillment_status === 'served';

              return (
                <div
                  key={ord.id}
                  className={`rounded-2xl border flex flex-col shadow-xl overflow-hidden transition-all duration-200 ${
                    isDone
                      ? 'bg-stone-900/60 border-stone-800 opacity-80'
                      : isReady
                      ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/50'
                      : isUrgent
                      ? 'bg-stone-900 border-rose-500 shadow-rose-950/50'
                      : 'bg-stone-900 border-stone-800'
                  }`}
                >
                  
                  {/* Ticket Header */}
                  <div className={`p-3.5 border-b flex items-center justify-between ${
                    isDone
                      ? 'bg-stone-800/50 border-stone-800'
                      : isReady
                      ? 'bg-emerald-500/20 border-emerald-500/40'
                      : isUrgent
                      ? 'bg-rose-500/20 border-rose-500/40'
                      : 'bg-stone-800/80 border-stone-700/80'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-lg text-white">#{ord.order_number}</span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-black text-xs ${
                          isDone ? 'bg-stone-700 text-stone-300' : 'bg-amber-500 text-stone-950'
                        }`}>
                          MEJA {ord.table_number}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5 font-medium">{ord.customer_name}</p>
                    </div>

                    <div className="text-right">
                      {isDone ? (
                        <div className="flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Disajikan</span>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                          isUrgent ? 'bg-rose-500 text-white animate-pulse' : 'bg-stone-800 text-stone-300'
                        }`}>
                          <Timer className="w-3.5 h-3.5" />
                          <span>{elapsed}m</span>
                        </div>
                      )}
                      <p className="text-[10px] text-stone-500 mt-1">
                        {new Date(ord.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Item List */}
                  <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[360px]">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="border-b border-stone-800/80 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-start gap-2.5">
                          <span className={`w-7 h-7 rounded-lg font-mono font-black text-sm flex items-center justify-center flex-shrink-0 ${
                            isDone ? 'bg-stone-800 text-stone-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {it.quantity}x
                          </span>
                          <div className="flex-1">
                            <h4 className="font-extrabold text-sm text-stone-100 leading-snug">{it.product_name}</h4>
                            {it.variant_name && (
                              <p className="text-xs font-bold text-amber-300 mt-0.5">
                                • Varian: {it.variant_name}
                              </p>
                            )}
                            {it.addons.length > 0 && (
                              <p className="text-xs text-stone-400 mt-0.5">
                                + {it.addons.map((a) => `${a.addon_name}`).join(', ')}
                              </p>
                            )}
                            {it.notes && (
                              <div className="mt-1.5 p-1.5 rounded-md bg-amber-950/50 border border-amber-600/40 text-amber-300 text-xs font-semibold">
                                💬 "{it.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {ord.customer_notes && (
                      <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold">
                        Catatan Khusus: {ord.customer_notes}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-stone-950 border-t border-stone-800">
                    {isDone ? (
                      <div className="text-center py-1 text-xs text-stone-500 font-semibold flex items-center justify-center gap-1.5">
                        <CheckCheck className="w-4 h-4 text-emerald-400" />
                        <span>Pesanan ini sudah selesai disajikan</span>
                      </div>
                    ) : ord.fulfillment_status === 'pending' || ord.fulfillment_status === 'confirmed' ? (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'preparing')}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow"
                      >
                        <Flame className="w-4 h-4 fill-current" />
                        <span>Mulai Masak / Buat</span>
                      </button>
                    ) : ord.fulfillment_status === 'preparing' ? (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'ready')}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pesanan Siap Saji!</span>
                      </button>
                    ) : ord.fulfillment_status === 'ready' ? (
                      <button
                        onClick={() => handleMarkServed(ord.id, ord.order_number, ord.table_number)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-black text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-600/30"
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>Sajikan ke Meja {ord.table_number} (Selesai)</span>
                      </button>
                    ) : null}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
