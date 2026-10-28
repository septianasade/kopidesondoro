import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, CartItem } from '../types';
import { 
  Receipt, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Search, 
  Printer, 
  Clock, 
  User, 
  Plus, 
  X, 
  Store
} from 'lucide-react';

export const PosCashierView: React.FC = () => {
  const { 
    orders, 
    tables, 
    products, 
    currentShift, 
    processPayment, 
    updateOrderStatus, 
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
    setCashReceived(ord.total_amount); // Default to exact amount
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!activeOrder) return;
    try {
      processPayment(activeOrder.id, payMethod, cashReceived, currentShift?.cashier_name || 'Kasir');
      setIsPayModalOpen(false);
      showReceiptForOrder(activeOrder);
    } catch (e) {
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
          <div className="text-xs text-stone-500">
            Shift: <strong className="text-stone-900">{currentShift?.status === 'open' ? 'Terbuka' : 'Ditutup'}</strong> (Modal: Rp {currentShift?.start_cash.toLocaleString('id-ID')})
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsManualOrderOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Pesanan Kasir Manual</span>
          </button>

          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition shadow-xs"
          >
            <Store className="w-4 h-4" />
            <span>{currentShift?.status === 'open' ? 'Tutup Shift Kasir' : 'Buka Shift Baru'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* Left Column: Order Queue (5 Cols) */}
        <div className="col-span-12 md:col-span-5 lg:col-span-4 bg-white border-r border-stone-200 flex flex-col h-full">
          
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-stone-200 space-y-2 bg-stone-50">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari No. Tiket, Meja, Nama..."
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterPayment('all')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterPayment === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Semua ({orders.length})
              </button>
              <button
                onClick={() => setFilterPayment('unpaid')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterPayment === 'unpaid' ? 'bg-rose-600 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Belum Bayar ({orders.filter((o) => o.payment_status === 'unpaid').length})
              </button>
              <button
                onClick={() => setFilterPayment('paid')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterPayment === 'paid' ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Lunas ({orders.filter((o) => o.payment_status === 'paid').length})
              </button>
            </div>
          </div>

          {/* Scrollable Order List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                Tidak ada pesanan yang sesuai filter.
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = activeOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-3.5 cursor-pointer transition flex items-start justify-between border-l-4 ${
                      isSelected
                        ? 'bg-brand-50/50 border-brand-600'
                        : 'border-transparent hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-stone-900">#{ord.order_number}</span>
                        <span className="bg-stone-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          MEJA {ord.table_number}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 font-medium mt-1">{ord.customer_name}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {ord.items.length} item • {new Date(ord.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-xs text-stone-900">
                        Rp {ord.total_amount.toLocaleString('id-ID')}
                      </p>
                      <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded mt-1.5 ${
                        ord.payment_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}>
                        {ord.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Order Detail & Payment Panel (7 Cols) */}
        <div className="col-span-12 md:col-span-7 lg:col-span-8 flex flex-col h-full bg-stone-50 overflow-hidden">
          {activeOrder ? (
            <div className="flex flex-col h-full">
              
              {/* Order Header */}
              <div className="bg-white p-4 border-b border-stone-200 flex items-center justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-extrabold text-lg text-stone-900">Pesanan #{activeOrder.order_number}</h2>
                    <span className="bg-brand-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                      MEJA {activeOrder.table_number}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      activeOrder.fulfillment_status === 'ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeOrder.fulfillment_status === 'preparing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      Status: {activeOrder.fulfillment_status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>{activeOrder.customer_name}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{new Date(activeOrder.created_at).toLocaleString('id-ID')}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showReceiptForOrder(activeOrder)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition border border-stone-300"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Pratinjau Struk</span>
                  </button>

                  {activeOrder.payment_status === 'unpaid' && (
                    <button
                      onClick={() => handleOpenPay(activeOrder)}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/30"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Bayar Sekarang</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Order Items Table */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Item & Varian</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Harga Satuan</th>
                        <th className="py-3 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {activeOrder.items.map((it) => (
                        <tr key={it.id} className="hover:bg-stone-50/60">
                          <td className="py-3 px-4">
                            <p className="font-bold text-stone-900 text-sm">{it.product_name}</p>
                            {it.variant_name && (
                              <p className="text-xs text-brand-700">Varian: {it.variant_name}</p>
                            )}
                            {it.addons.length > 0 && (
                              <p className="text-xs text-stone-500">
                                +{it.addons.map((a) => `${a.addon_name} (Rp ${a.price.toLocaleString('id-ID')})`).join(', ')}
                              </p>
                            )}
                            {it.notes && (
                              <p className="text-xs text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                                Catatan: "{it.notes}"
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-stone-900">{it.quantity}</td>
                          <td className="py-3 px-4 text-right text-stone-600">Rp {it.unit_price.toLocaleString('id-ID')}</td>
                          <td className="py-3 px-4 text-right font-bold text-stone-900">Rp {it.subtotal.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {activeOrder.customer_notes && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <strong>Catatan Pemesan:</strong> {activeOrder.customer_notes}
                  </div>
                )}
              </div>

              {/* Order Footer & Fast Advance */}
              <div className="bg-white p-4 border-t border-stone-200 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-4 text-xs text-stone-500">
                    <span>Subtotal: Rp {activeOrder.subtotal.toLocaleString('id-ID')}</span>
                    <span>PPN: Rp {activeOrder.tax_amount.toLocaleString('id-ID')}</span>
                    <span>Service: Rp {activeOrder.service_amount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-lg font-extrabold text-stone-900">
                    Total Tagihan: <span className="text-brand-700">Rp {activeOrder.total_amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeOrder.fulfillment_status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(activeOrder.id, 'confirmed')}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow"
                    >
                      Konfirmasi Pesanan
                    </button>
                  )}
                  {activeOrder.fulfillment_status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(activeOrder.id, 'served')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow"
                    >
                      Tandai Sudah Disajikan ke Meja
                    </button>
                  )}
                  {activeOrder.payment_status === 'paid' && activeOrder.fulfillment_status === 'served' && (
                    <button
                      onClick={() => updateOrderStatus(activeOrder.id, 'completed')}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold shadow"
                    >
                      Selesaikan Transaksi Meja
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-stone-400">
              <Receipt className="w-16 h-16 stroke-1 text-stone-300 mb-3" />
              <p className="font-bold text-stone-600">Pilih Pesanan untuk Menampilkan Rincian Kasir</p>
            </div>
          )}
        </div>

      </div>

      {/* Payment Processing Modal */}
      {isPayModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200 animate-scale-up">
            
            <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900">Pembayaran #{activeOrder.order_number}</h3>
                <p className="text-xs text-stone-500">Meja {activeOrder.table_number} • Total Rp {activeOrder.total_amount.toLocaleString('id-ID')}</p>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} className="w-7 h-7 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMethod('cash')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition ${
                    payMethod === 'cash' ? 'border-brand-600 bg-brand-50 text-brand-900' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span>Tunai (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayMethod('qris')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition ${
                    payMethod === 'qris' ? 'border-brand-600 bg-brand-50 text-brand-900' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-brand-600" />
                  <span>QRIS Dinamis</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayMethod('transfer')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition ${
                    payMethod === 'transfer' ? 'border-brand-600 bg-brand-50 text-brand-900' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Debit / EDC</span>
                </button>
              </div>

              {payMethod === 'cash' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Uang Tunai Diterima (Rp)</label>
                    <input
                      type="number"
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="w-full text-lg font-bold px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCashReceived(activeOrder.total_amount)}
                      className="flex-1 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold"
                    >
                      Uang Pas
                    </button>
                    {[50000, 100000, 200000].map((nominal) => (
                      <button
                        key={nominal}
                        type="button"
                        onClick={() => setCashReceived(nominal)}
                        className="flex-1 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold"
                      >
                        {nominal / 1000}k
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between text-sm">
                    <span className="font-semibold text-stone-600">Kembalian:</span>
                    <span className={`font-extrabold text-base ${cashReceived >= activeOrder.total_amount ? 'text-emerald-700' : 'text-rose-600'}`}>
                      Rp {Math.max(0, cashReceived - activeOrder.total_amount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ) : payMethod === 'qris' ? (
                <div className="text-center p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="w-32 h-32 mx-auto bg-white border border-stone-300 rounded-xl p-2 flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-stone-800" />
                  </div>
                  <p className="font-bold text-xs text-stone-800">QRIS National Standard (NMID: ID1020304050)</p>
                  <p className="text-[11px] text-stone-500">Scan via BCA, GoPay, OVO, Dana, ShopeePay</p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
                  Gesek kartu pada mesin EDC lalu catat nomor referensi struk bank.
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={payMethod === 'cash' && cashReceived < activeOrder.total_amount}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50"
              >
                Konfirmasi & Cetak Struk
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Manual POS Order Drawer */}
      {isManualOrderOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl animate-slide-left">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-base text-stone-900">Tambah Pesanan Langsung Kasir</h3>
              <button onClick={() => setIsManualOrderOpen(false)} className="w-7 h-7 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-stone-200 grid grid-cols-2 gap-3 bg-stone-50/50">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Pilih Meja</label>
                <select
                  value={manualTableId}
                  onChange={(e) => setManualTableId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>{t.table_label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={manualCustomer}
                  onChange={(e) => setManualCustomer(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>
            </div>

            {/* Product Quick Picker */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Katalog Produk</p>
              <div className="grid grid-cols-2 gap-2">
                {products.filter((p) => p.is_active).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => addManualItem(p)}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-brand-500 hover:bg-brand-50/30 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <p className="font-bold text-xs text-stone-900">{p.name}</p>
                      <p className="text-[11px] text-brand-700">Rp {p.base_price.toLocaleString('id-ID')}</p>
                    </div>
                    <Plus className="w-4 h-4 text-brand-600" />
                  </div>
                ))}
              </div>

              {manualCart.length > 0 && (
                <div className="pt-4 border-t border-stone-200 mt-4 space-y-2">
                  <p className="text-xs font-bold text-stone-900 uppercase">Item Terpilih ({manualCart.length}):</p>
                  {manualCart.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-stone-50 p-2 rounded-lg">
                      <span>{it.product.name}</span>
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

      {/* Shift Register Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              {currentShift?.status === 'open' ? 'Rekap Penutupan Shift Kasir' : 'Buka Shift Baru'}
            </h3>

            {currentShift?.status === 'open' ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                  <div className="flex justify-between">
                    <span>Modal Awal Kasir:</span>
                    <strong>Rp {currentShift.start_cash.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Uang Sistem:</span>
                    <strong className="text-emerald-700">Rp {currentShift.expected_cash.toLocaleString('id-ID')}</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Uang Fisik Kasir di Laci (Rp)</label>
                  <input
                    type="number"
                    value={inputActualCash}
                    onChange={(e) => setInputActualCash(e.target.value)}
                    placeholder="Masukkan jumlah uang fisik di laci"
                    className="w-full text-sm font-bold p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <button
                  onClick={() => {
                    closeShift(Number(inputActualCash) || currentShift.expected_cash);
                    setIsShiftModalOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Tutup Shift & Kunci Laci
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Modal Kasir Awal (Rp)</label>
                  <input
                    type="number"
                    value={inputStartCash}
                    onChange={(e) => setInputStartCash(e.target.value)}
                    className="w-full text-sm font-bold p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <button
                  onClick={() => {
                    openShift(Number(inputStartCash) || 500000, 'Kasir Utama');
                    setIsShiftModalOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  Buka Shift Kasir
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
