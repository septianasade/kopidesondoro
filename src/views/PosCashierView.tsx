import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, CartItem } from '../types';
import { 
  CreditCard, 
  QrCode, 
  Banknote, 
  Search, 
  Printer, 
  Clock, 
  User, 
  Plus, 
  X, 
  Store,
  CheckCircle2
} from 'lucide-react';

export const PosCashierView: React.FC = () => {
  const { 
    orders, 
    tables, 
    products, 
    currentShift, 
    processPayment, 
    showReceiptForOrder, 
    submitPosOrder,
    openShift,
    closeShift
  } = useStore();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [filterPayment, setFilterPayment] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [searchTicket, setSearchTicket] = useState('');
  
  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<'cash' | 'qris' | 'transfer' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState<number>(0);
  
  // Manual POS Order Drawer
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [manualTableId, setManualTableId] = useState(tables[0]?.id || '');
  const [manualCart, setManualCart] = useState<CartItem[]>([]);
  const [manualCustomer, setManualCustomer] = useState('Pelanggan Kasir');

  // Helper for Rupiah parsing & formatting
  const parseDigits = (val: string) => Number(val.replace(/\D/g, '')) || 0;

  // Shift Modal State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [inputStartCash, setInputStartCash] = useState('500000');
  const [inputActualCash, setInputActualCash] = useState('');

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = 
      filterPayment === 'all' || 
      (filterPayment === 'unpaid' && o.payment_status === 'unpaid') ||
      (filterPayment === 'paid' && o.payment_status === 'paid');
    const matchesSearch = 
      o.order_number.toLowerCase().includes(searchTicket.toLowerCase()) ||
      o.table_number.toLowerCase().includes(searchTicket.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTicket.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeOrder = selectedOrder || filteredOrders[0] || null;

  const handleOpenPay = (ord: Order) => {
    setSelectedOrder(ord);
    setCashReceived(ord.total_amount);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!activeOrder) return;
    try {
      processPayment(activeOrder.id, payMethod, cashReceived, currentShift?.cashier_name || 'Kasir');
      setIsPayModalOpen(false);
      showReceiptForOrder(activeOrder);
    } catch {
      alert('Gagal memproses pembayaran.');
    }
  };

  const addManualItem = (prod: (typeof products)[0]) => {
    const item: CartItem = {
      cart_item_id: `man_${Date.now()}_${Math.random()}`,
      product: prod,
      selected_variant: prod.variants[0],
      selected_addons: [],
      quantity: 1,
      unit_price: prod.base_price,
      subtotal: prod.base_price,
      notes: '',
    };
    setManualCart((prev) => [...prev, item]);
  };

  const submitManualOrder = async () => {
    if (manualCart.length === 0) return;
    const newOrd = await submitPosOrder(manualTableId, manualCustomer, manualCart);
    setManualCart([]);
    setIsManualOrderOpen(false);
    setSelectedOrder(newOrd);
  };

  const openShiftModalWithDefaults = () => {
    if (currentShift?.status === 'open') {
      setInputActualCash(String(currentShift.expected_cash));
    } else {
      setInputStartCash(String(currentShift?.actual_cash || currentShift?.expected_cash || 500000));
    }
    setIsShiftModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-stone-100 text-stone-800 overflow-hidden">
      
      {/* POS Action Ribbon */}
      <div className="bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Terminal Kasir POS</span>
          </div>
          <span className="text-stone-300">|</span>
          <div className="text-xs text-stone-600">
            Shift: <strong className={currentShift?.status === 'open' ? 'text-emerald-700 font-extrabold' : 'text-stone-500'}>
              {currentShift?.status === 'open' ? '🟢 Shift Aktif' : '🔴 Shift Ditutup'}
            </strong>{' '}
            (Modal: Rp {currentShift?.start_cash.toLocaleString('id-ID') || 0})
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsManualOrderOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Pesan Manual di Kasir</span>
          </button>

          <button
            onClick={openShiftModalWithDefaults}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              currentShift?.status === 'open'
                ? 'bg-stone-50 hover:bg-stone-100 border-stone-300 text-stone-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>{currentShift?.status === 'open' ? 'Tutup Shift Kasir' : 'Buka Shift Baru'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Order Queue List */}
        <div className="w-full md:w-5/12 lg:w-4/12 border-r border-stone-200 bg-white flex flex-col flex-shrink-0">
          
          {/* Search and Filters */}
          <div className="p-3 border-b border-stone-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari No Tiket, Meja, atau Nama..."
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterPayment('all')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                  filterPayment === 'all' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Semua ({orders.length})
              </button>
              <button
                onClick={() => setFilterPayment('unpaid')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                  filterPayment === 'unpaid' ? 'bg-rose-500 text-white shadow' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Belum Bayar ({orders.filter((o) => o.payment_status === 'unpaid').length})
              </button>
              <button
                onClick={() => setFilterPayment('paid')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                  filterPayment === 'paid' ? 'bg-emerald-600 text-white shadow' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Lunas ({orders.filter((o) => o.payment_status === 'paid').length})
              </button>
            </div>
          </div>

          {/* List of Orders */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                Tidak ada pesanan yang sesuai filter.
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = activeOrder?.id === ord.id;
                const isUnpaid = ord.payment_status === 'unpaid';

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-3.5 cursor-pointer transition flex items-center justify-between border-l-4 ${
                      isSelected
                        ? 'bg-amber-50/70 border-l-brand-600'
                        : isUnpaid
                        ? 'hover:bg-stone-50 border-l-rose-500'
                        : 'hover:bg-stone-50 border-l-emerald-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-stone-900">
                          #{ord.order_number}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-800 font-extrabold text-[10px]">
                          Meja {ord.table_number}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3 text-stone-400" />
                        <span>{ord.customer_name}</span>
                        <span className="text-stone-300">•</span>
                        <span>{ord.items.reduce((a, b) => a + b.quantity, 0)} item</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-black text-xs text-stone-900">
                        Rp {ord.total_amount.toLocaleString('id-ID')}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                          isUnpaid
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isUnpaid ? 'Belum Lunas' : 'Lunas'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Order Detail & Payment Terminal */}
        <div className="hidden md:flex flex-1 bg-stone-50 flex-col overflow-hidden">
          {activeOrder ? (
            <div className="h-full flex flex-col">
              
              {/* Detail Header */}
              <div className="bg-white border-b border-stone-200 p-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-black text-lg text-stone-900">
                      Pesanan #{activeOrder.order_number}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-extrabold text-xs">
                      Meja {activeOrder.table_number}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        activeOrder.payment_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {activeOrder.payment_status === 'paid' ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                    <span>Pelanggan: <strong>{activeOrder.customer_name}</strong></span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{new Date(activeOrder.created_at).toLocaleTimeString('id-ID')}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showReceiptForOrder(activeOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Struk</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-2">
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100 shadow-xs">
                  {activeOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3.5 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {it.quantity}x
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-stone-900">{it.product_name}</h4>
                          {it.variant_name && (
                            <p className="text-[11px] text-stone-500 font-medium">
                              Varian: {it.variant_name}
                            </p>
                          )}
                          {it.addons.length > 0 && (
                            <p className="text-[11px] text-stone-500">
                              + {it.addons.map((a) => a.addon_name).join(', ')}
                            </p>
                          )}
                          {it.notes && (
                            <p className="text-[11px] text-amber-700 italic mt-0.5">
                              "{it.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-xs text-stone-900">
                        Rp {it.subtotal.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Summary & Action Footer */}
              <div className="bg-white border-t border-stone-200 p-4 space-y-3 flex-shrink-0">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal Menu:</span>
                    <span className="font-mono">Rp {activeOrder.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PPN (10%):</span>
                    <span className="font-mono">Rp {activeOrder.tax_amount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge (5%):</span>
                    <span className="font-mono">Rp {activeOrder.service_amount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                    <span>Total Tagihan:</span>
                    <span className="font-mono text-emerald-700">
                      Rp {activeOrder.total_amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {activeOrder.payment_status === 'unpaid' ? (
                  <button
                    onClick={() => handleOpenPay(activeOrder)}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Terima Pembayaran Kasir (Rp {activeOrder.total_amount.toLocaleString('id-ID')})</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pesanan ini sudah lunas terbayar.</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-stone-400 text-xs">
              Pilih pesanan dari antrean kasir di sebelah kiri.
            </div>
          )}
        </div>

      </div>

      {/* Manual POS Order Modal Drawer */}
      {isManualOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900">Input Pesanan Pelanggan di Kasir</h3>
              <button onClick={() => setIsManualOrderOpen(false)} className="p-1 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="p-4 bg-stone-50 border-b border-stone-200 flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Nomor Meja</label>
                <select
                  value={manualTableId}
                  onChange={(e) => setManualTableId(e.target.value)}
                  className="w-full text-xs font-bold p-2 rounded-xl border border-stone-300 bg-white"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      Meja {t.table_number} ({t.table_label})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={manualCustomer}
                  onChange={(e) => setManualCustomer(e.target.value)}
                  className="w-full text-xs font-bold p-2 rounded-xl border border-stone-300 bg-white"
                />
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div>
                <p className="text-xs font-bold text-stone-600 mb-2">Klik Produk untuk Menambah ke Pesanan:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addManualItem(p)}
                      className="p-2.5 rounded-xl border border-stone-200 bg-white hover:border-brand-500 text-left transition shadow-xs flex flex-col justify-between"
                    >
                      <span className="font-bold text-xs text-stone-900 line-clamp-1">{p.name}</span>
                      <span className="font-mono text-[11px] text-brand-700 font-bold mt-1">
                        Rp {p.base_price.toLocaleString('id-ID')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {manualCart.length > 0 && (
                <div className="border-t border-stone-200 pt-3">
                  <p className="text-xs font-bold text-stone-800 mb-2">Item yang Dipilih ({manualCart.length}):</p>
                  {manualCart.map((it, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-stone-100 flex items-center justify-between text-xs mb-1">
                      <span>{it.quantity}x {it.product.name}</span>
                      <span className="font-bold">Rp {it.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <span className="font-bold text-sm">
                Total: Rp {manualCart.reduce((a, b) => a + b.subtotal, 0).toLocaleString('id-ID')}
              </span>
              <button
                onClick={submitManualOrder}
                disabled={manualCart.length === 0}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold disabled:opacity-50"
              >
                Buat Pesanan & Kirim ke Dapur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {isPayModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-base text-stone-900">Pembayaran Kasir</h3>
                <p className="text-xs text-stone-500">
                  Tiket #{activeOrder.order_number} — Meja {activeOrder.table_number}
                </p>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl text-center">
              <span className="text-xs text-stone-500 font-medium">Total yang Harus Dibayar:</span>
              <p className="font-mono font-black text-2xl text-stone-900 mt-1">
                Rp {activeOrder.total_amount.toLocaleString('id-ID')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-2">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cash', label: 'Tunai (Cash)', icon: Banknote },
                  { id: 'qris', label: 'QRIS Statis/Dinamis', icon: QrCode },
                  { id: 'transfer', label: 'Transfer Bank', icon: CreditCard },
                  { id: 'card', label: 'Kartu Debit/Kredit', icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id as any)}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                        payMethod === m.id
                          ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-brand-600" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {payMethod === 'cash' && (
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  Uang Tunai Diterima (Rp)
                </label>
                <input
                  type="text"
                  value={cashReceived ? `Rp ${cashReceived.toLocaleString('id-ID')}` : ''}
                  onChange={(e) => setCashReceived(parseDigits(e.target.value))}
                  className="w-full text-base font-black p-2.5 rounded-xl border border-stone-300"
                />
                <div className="flex gap-1.5 mt-2">
                  {[
                    activeOrder.total_amount,
                    50000,
                    100000,
                    200000
                  ].filter((v, i, a) => a.indexOf(v) === i && v >= activeOrder.total_amount).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCashReceived(preset)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[11px] font-bold text-stone-700 font-mono"
                    >
                      Rp {preset.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>

                <div className="mt-3 p-3 rounded-xl bg-stone-50 flex justify-between text-xs">
                  <span>Kembalian:</span>
                  <strong className="font-mono text-emerald-700 text-sm">
                    Rp {Math.max(0, cashReceived - activeOrder.total_amount).toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmPayment}
              disabled={payMethod === 'cash' && cashReceived < activeOrder.total_amount}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              Konfirmasi Lunas & Cetak Struk
            </button>
          </div>
        </div>
      )}

      {/* Robust Shift Register Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-base text-stone-900">
                  {currentShift?.status === 'open' ? 'Rekap Penutupan Shift Kasir' : 'Buka Shift Kasir Baru'}
                </h3>
                <p className="text-xs text-stone-500">
                  {currentShift?.status === 'open' 
                    ? 'Hitung uang fisik di laci kasir sebelum serah terima.'
                    : 'Tentukan modal awal uang kembalian untuk shift baru.'}
                </p>
              </div>
              <button onClick={() => setIsShiftModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            {currentShift?.status === 'open' ? (
              <div className="space-y-3.5 text-xs">
                
                {/* Shift Financial Recap Card */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex justify-between text-stone-600">
                    <span>Modal Awal Kasir:</span>
                    <strong className="font-mono font-bold text-stone-900">
                      Rp {currentShift.start_cash.toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Penjualan Tunai Masuk:</span>
                    <strong className="font-mono font-bold text-emerald-700">
                      + Rp {Math.max(0, currentShift.expected_cash - currentShift.start_cash).toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-stone-200 flex justify-between text-stone-900 font-extrabold text-sm">
                    <span>Uang Fisik Seharusnya di Laci:</span>
                    <strong className="font-mono text-emerald-700">
                      Rp {currentShift.expected_cash.toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>

                {/* Physical Cash Input with Format */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Uang Fisik Hasil Hitungan Kasir (Rp)
                  </label>
                  <input
                    type="text"
                    value={inputActualCash ? `Rp ${parseDigits(inputActualCash).toLocaleString('id-ID')}` : ''}
                    onChange={(e) => setInputActualCash(String(parseDigits(e.target.value)))}
                    placeholder="Contoh: 1.200.000"
                    className="w-full text-base font-black p-3 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Ketik angka saja (misal: 1200000), sistem otomatis format titik ribuan.
                  </p>
                </div>

                {/* Quick Match Button */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInputActualCash(String(currentShift.expected_cash))}
                    className="flex-1 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition text-center"
                  >
                    Pas Sesuai Sistem (Rp {currentShift.expected_cash.toLocaleString('id-ID')})
                  </button>
                </div>

                {/* Difference Status */}
                {inputActualCash && (
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    parseDigits(inputActualCash) === currentShift.expected_cash
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : parseDigits(inputActualCash) > currentShift.expected_cash
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    <span>Status Selisih Kasir:</span>
                    <span className="font-mono font-black">
                      {parseDigits(inputActualCash) === currentShift.expected_cash
                        ? '✅ Pas (Selisih Rp 0)'
                        : parseDigits(inputActualCash) > currentShift.expected_cash
                        ? `🔵 Lebih: +Rp ${(parseDigits(inputActualCash) - currentShift.expected_cash).toLocaleString('id-ID')}`
                        : `🔴 Kurang: -Rp ${(currentShift.expected_cash - parseDigits(inputActualCash)).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => {
                    const finalCash = parseDigits(inputActualCash) || currentShift.expected_cash;
                    closeShift(finalCash);
                    setIsShiftModalOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm shadow-md transition"
                >
                  Tutup Shift & Kunci Rekap Kasir
                </button>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Modal Awal Uang Kembalian (Rp)
                  </label>
                  <input
                    type="text"
                    value={inputStartCash ? `Rp ${parseDigits(inputStartCash).toLocaleString('id-ID')}` : ''}
                    onChange={(e) => setInputStartCash(String(parseDigits(e.target.value)))}
                    placeholder="Contoh: 500.000 atau 1.200.000"
                    className="w-full text-base font-black p-3 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[11px] font-bold text-stone-400 block mb-1.5 uppercase">
                    Pilihan Cepat Modal Awal:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[200000, 500000, 1000000, 1200000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setInputStartCash(String(preset))}
                        className={`p-2 rounded-xl border text-center transition font-mono font-bold ${
                          parseDigits(inputStartCash) === preset
                            ? 'bg-brand-50 border-brand-500 text-brand-900'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        Rp {preset.toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const finalModal = parseDigits(inputStartCash) || 500000;
                    openShift(finalModal, 'Kasir Utama');
                    setIsShiftModalOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition"
                >
                  Buka Shift Kasir Sekarang
                </button>
              </div>
            )}

            <button
              onClick={() => setIsShiftModalOpen(false)}
              className="w-full py-2 rounded-xl text-xs text-stone-500 hover:bg-stone-100"
            >
              Batal
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
