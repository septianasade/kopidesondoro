import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, TableItem } from '../types';
import { QRModal } from '../components/QRModal';
import { AdminStaffManagementView } from './AdminStaffManagementView';
import { 
  TrendingUp, 
  Receipt, 
  QrCode, 
  Utensils, 
  Download, 
  Plus, 
  Edit2, 
  Trash2, 
  Settings, 
  RotateCcw,
  Sparkles,
  Users,
  Store,
  ExternalLink
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { 
    business, 
    tables, 
    products, 
    categories, 
    orders, 
    payments,
    saveProduct, 
    deleteProduct, 
    saveTable, 
    deleteTable, 
    updateBusinessSettings,
    resetToDefaultSeed,
    showReceiptForOrder
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'menu' | 'reports' | 'settings' | 'staff'>('overview');
  const [selectedQRTable, setSelectedQRTable] = useState<TableItem | null>(null);

  // Menu Form Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Table Form Modal
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableLabel, setNewTableLabel] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');

  // Business settings state
  const [settingsForm, setSettingsForm] = useState({
    name: business.name,
    address: business.address,
    phone: business.phone,
    tax_rate: business.tax_rate,
    service_rate: business.service_rate,
  });

  // KPI Computations
  const totalOmzet = payments.reduce((acc, p) => acc + p.total_bill, 0);
  const totalOrders = orders.length;
  const activeOrdersCount = orders.filter((o) => o.fulfillment_status !== 'completed' && o.fulfillment_status !== 'cancelled').length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalOmzet / Math.max(1, payments.length)) : 0;

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'No. Order,Meja,Pelanggan,Waktu,Status Pemenuhan,Status Bayar,Subtotal,PPN,Service,Total\n';
    orders.forEach((o) => {
      csv += `"${o.order_number}","${o.table_number}","${o.customer_name}","${o.created_at}","${o.fulfillment_status}","${o.payment_status}",${o.subtotal},${o.tax_amount},${o.service_amount},${o.total_amount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Penjualan_${business.slug}_${Date.now()}.csv`;
    a.click();
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.base_price) return;

    const prodToSave: Product = {
      id: editingProduct.id || `prod_${Date.now()}`,
      business_id: business.id,
      category_id: editingProduct.category_id || categories[0]?.id || '',
      name: editingProduct.name,
      slug: editingProduct.name.toLowerCase().replace(/\s+/g, '-'),
      description: editingProduct.description || '',
      base_price: Number(editingProduct.base_price),
      image_url: editingProduct.image_url || 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&q=80',
      is_popular: Boolean(editingProduct.is_popular),
      is_available: true,
      is_active: true,
      variants: editingProduct.variants || [],
      addons: editingProduct.addons || [],
    };

    saveProduct(prodToSave);
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveTableForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber) return;

    const newTbl: TableItem = {
      id: `tbl_${Date.now()}`,
      business_id: business.id,
      table_number: newTableNumber,
      table_label: newTableLabel || `Meja ${newTableNumber}`,
      capacity: Number(newTableCapacity) || 4,
      qr_token: `sndr-m${newTableNumber}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'available',
      is_active: true,
    };

    saveTable(newTbl);
    setIsTableModalOpen(false);
    setNewTableNumber('');
    setNewTableLabel('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-100 flex flex-col text-stone-800">
      
      {/* Subnav Tabs */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-3 overflow-x-auto py-2.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-brand-600 text-white shadow' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ringkasan Bisnis</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'tables' ? 'bg-brand-600 text-white shadow' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Meja & QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'menu' ? 'bg-brand-600 text-white shadow' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Manajemen Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-brand-600 text-white shadow' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Laporan Penjualan</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'staff' ? 'bg-[#121212] text-[#CCFF00] border border-[#CCFF00] shadow' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4 text-[#CCFF00]" />
            <span>Manajemen Staf</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-brand-600 text-white shadow' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan</span>
          </button>
        </div>

        {/* Supervisor Quick Test Buttons */}
        <div className="flex items-center gap-2 py-2">
          <button
            type="button"
            onClick={() => { window.location.hash = '#/pos'; }}
            className="px-3 py-1 bg-stone-900 hover:bg-black text-[#CCFF00] border border-[#CCFF00]/60 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
            title="Buka tampilan kasir POS untuk supervisi"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layar Kasir</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>

          <button
            type="button"
            onClick={() => { window.location.hash = '#/kitchen'; }}
            className="px-3 py-1 bg-stone-900 hover:bg-black text-amber-400 border border-amber-500/60 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
            title="Buka tampilan dapur KDS untuk supervisi"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layar Dapur</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Omzet Diterima</span>
                <p className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                  Rp {totalOmzet.toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ {payments.length} transaksi lunas</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Pesanan</span>
                <p className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                  {totalOrders} <span className="text-sm font-normal text-stone-500">tiket</span>
                </p>
                <p className="text-[11px] text-stone-500 font-semibold mt-1">{tables.length} meja aktif</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pesanan Aktif Berjalan</span>
                <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                  {activeOrdersCount} <span className="text-sm font-normal text-stone-500">tiket</span>
                </p>
                <p className="text-[11px] text-amber-700 font-semibold mt-1">Dapur / Meja</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Rata-Rata Transaksi</span>
                <p className="text-xl sm:text-2xl font-black text-brand-700 mt-1">
                  Rp {avgOrderValue.toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-stone-500 font-semibold mt-1">Average ticket size</p>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-base text-stone-900">Transaksi Pesanan Terbaru</h3>
                  <button onClick={() => setActiveTab('reports')} className="text-xs font-bold text-brand-600 hover:underline">
                    Lihat Semua
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                      <tr>
                        <th className="py-2.5 px-3">No. Tiket</th>
                        <th className="py-2.5 px-3">Meja</th>
                        <th className="py-2.5 px-3">Pelanggan</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-stone-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-stone-900">#{o.order_number}</td>
                          <td className="py-2.5 px-3 font-bold">Meja {o.table_number}</td>
                          <td className="py-2.5 px-3 text-stone-600">{o.customer_name}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {o.payment_status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                            Rp {o.total_amount.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Leaderboard Top Sellers */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Produk Terlaris</span>
                  </h3>
                  <div className="space-y-3">
                    {products.slice(0, 4).map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between text-xs pb-2 border-b border-stone-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-stone-100 font-bold text-[10px] flex items-center justify-center text-stone-600">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-stone-900">{p.name}</span>
                        </div>
                        <span className="font-semibold text-brand-700">Rp {p.base_price.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-brand-50 rounded-xl text-xs text-brand-900 mt-4 border border-brand-200/60">
                  💡 <strong>Info:</strong> Menu yang sering dipesan pelanggan otomatis masuk badge favorit.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. TABLES & QR STUDIO TAB */}
        {activeTab === 'tables' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">QR Code Studio Per Meja</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Setiap meja memiliki token keamanan unik untuk mencegah pemalsuan nomor meja.
                </p>
              </div>
              <button
                onClick={() => setIsTableModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Meja Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="bg-stone-900 text-white text-xs font-extrabold px-3 py-1 rounded-lg">
                        MEJA {t.table_number}
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        t.status === 'occupied' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {t.status === 'occupied' ? 'Terisi' : 'Kosong'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-stone-900 mt-2">{t.table_label}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">Kapasitas: {t.capacity} Orang</p>
                    <p className="text-[10px] text-stone-400 font-mono mt-1 truncate">Token: {t.qr_token}</p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedQRTable(t)}
                      className="flex-1 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Lihat & Cetak QR</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus ${t.table_label}?`)) deleteTable(t.id);
                      }}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* 3. MENU MANAGEMENT TAB */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Manajemen Katalog Menu</h3>
                <p className="text-xs text-stone-500 mt-0.5">Kelola produk, varian ukuran, add-on topping, dan harga dasar.</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    base_price: 20000,
                    category_id: categories[0]?.id || '',
                    description: '',
                    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&q=80',
                    variants: [],
                    addons: [],
                  });
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl border border-stone-200 p-3.5 flex gap-3 shadow-xs">
                  <img src={prod.image_url} alt={prod.name} className="w-20 h-20 rounded-xl object-cover bg-stone-100 flex-shrink-0" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 leading-snug">{prod.name}</h4>
                      <p className="text-xs font-bold text-brand-700 mt-0.5">Rp {prod.base_price.toLocaleString('id-ID')}</p>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{prod.description}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-stone-100">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsProductModalOpen(true);
                        }}
                        className="text-xs font-semibold text-stone-600 hover:text-brand-600 flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <span className="text-stone-300">•</span>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus ${prod.name}?`)) deleteProduct(prod.id);
                        }}
                        className="text-xs font-semibold text-stone-400 hover:text-rose-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* 4. REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Laporan Transaksi & Penjualan</h3>
                <p className="text-xs text-stone-500 mt-0.5">Rincian seluruh transaksi pelanggan dari meja maupun kasir.</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Laporan (CSV)</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">No. Tiket</th>
                    <th className="py-3 px-4">Meja</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Status Bayar</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">#{o.order_number}</td>
                      <td className="py-3 px-4 font-bold">Meja {o.table_number}</td>
                      <td className="py-3 px-4 text-stone-500">{new Date(o.created_at).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-stone-700">{o.customer_name}</td>
                      <td className="py-3 px-4 text-stone-600">{o.items.length} item</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-stone-900">
                        Rp {o.total_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => showReceiptForOrder(o)}
                          className="text-xs text-brand-600 hover:underline font-bold"
                        >
                          Cetak Struk
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 5. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-2xl shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-base text-stone-900">Pengaturan Toko & Pajak</h3>
              <p className="text-xs text-stone-500 mt-0.5">Konfigurasi alamat, tarif pajak PPN, dan service charge resto.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Bisnis / Brand</label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Alamat Outlet</label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tarif Pajak PPN (%)</label>
                  <input
                    type="number"
                    value={settingsForm.tax_rate}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tax_rate: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Service Charge Resto (%)</label>
                  <input
                    type="number"
                    value={settingsForm.service_rate}
                    onChange={(e) => setSettingsForm({ ...settingsForm, service_rate: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  updateBusinessSettings(settingsForm);
                  alert('Pengaturan bisnis berhasil disimpan!');
                }}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
              >
                Simpan Perubahan
              </button>
            </div>

            <div className="pt-6 border-t border-stone-200">
              <h4 className="font-bold text-xs text-stone-500 uppercase tracking-wider mb-2">Area Uji Coba (Sandbox)</h4>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset ulang data transaksi ke data contoh bawaan?')) {
                    resetToDefaultSeed();
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition border border-stone-300"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Ulang ke Data Contoh Bawaan</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. STAFF MANAGEMENT TAB */}
        {activeTab === 'staff' && (
          <AdminStaffManagementView
            onOpenPos={() => { window.location.hash = '#/pos'; }}
            onOpenKitchen={() => { window.location.hash = '#/kitchen'; }}
          />
        )}

      </div>

      {/* QR Modal Component */}
      {selectedQRTable && (
        <QRModal
          table={selectedQRTable}
          onClose={() => setSelectedQRTable(null)}
        />
      )}

      {/* Product Form Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleSaveProductForm} className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              {editingProduct?.id ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={editingProduct?.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Kategori</label>
                <select
                  value={editingProduct?.category_id || categories[0]?.id}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Harga Dasar (Rp) *</label>
                <input
                  type="number"
                  required
                  value={editingProduct?.base_price || 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, base_price: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL Foto Produk</label>
                <input
                  type="url"
                  value={editingProduct?.image_url || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Form Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleSaveTableForm} className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-base text-stone-900">Tambah Meja Baru</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nomor Meja (Contoh: 07) *</label>
                <input
                  type="text"
                  required
                  placeholder="07"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Label Meja</label>
                <input
                  type="text"
                  placeholder="Meja 07 (Lantai 2)"
                  value={newTableLabel}
                  onChange={(e) => setNewTableLabel(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Kapasitas Kursi</label>
                <input
                  type="number"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
              >
                Buat Meja & QR
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
