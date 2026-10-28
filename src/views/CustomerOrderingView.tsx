import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CartDrawer } from '../components/CartDrawer';
import { 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Plus, 
  MapPin, 
  Clock, 
  Phone,
  ChefHat, 
  Bell, 
  UtensilsCrossed, 
  X,
  Coffee
} from 'lucide-react';

export const CustomerOrderingView: React.FC = () => {
  const { business, currentTable, categories, products, cart, addToCart, orders } = useStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.is_active) return false;
      const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartTotalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Active order for this table
  const activeTableOrder = orders.find(
    (o) => o.id === trackedOrderId || (currentTable && o.table_id === currentTable.id && o.fulfillment_status !== 'completed' && o.fulfillment_status !== 'cancelled')
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      
      {/* Table & Store Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-brand-950 text-white px-4 pt-6 pb-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-xl leading-tight text-white">{business.name}</h1>
                <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-brand-400" />
                  {business.address}
                </p>
              </div>
            </div>

            {/* Table Badge */}
            <div className="bg-brand-500 text-stone-950 px-3.5 py-1.5 rounded-xl font-extrabold text-xs tracking-wider flex items-center gap-1.5 shadow-md shadow-brand-500/30">
              <MapPin className="w-3.5 h-3.5 fill-current" />
              <span>MEJA {currentTable?.table_number || '01'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400 pt-2 border-t border-stone-800">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              Buka {business.open_time} - {business.close_time} WIB
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              {business.phone}
            </span>
          </div>

          {/* Search Input */}
          <div className="mt-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari kopi, makanan, cemilan favoritmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-800/90 text-white placeholder-stone-400 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-stone-700/80 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Floating Active Order Tracker Banner (If table has active order) */}
      {activeTableOrder && (
        <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-20">
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeTableOrder.fulfillment_status === 'ready' 
                  ? 'bg-emerald-100 text-emerald-700 animate-bounce' 
                  : activeTableOrder.fulfillment_status === 'preparing' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-brand-100 text-brand-700'
              }`}>
                {activeTableOrder.fulfillment_status === 'ready' ? (
                  <Bell className="w-5 h-5" />
                ) : activeTableOrder.fulfillment_status === 'preparing' ? (
                  <ChefHat className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-stone-900">
                    Status Pesanan #{activeTableOrder.order_number}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    activeTableOrder.fulfillment_status === 'ready'
                      ? 'bg-emerald-500 text-white'
                      : activeTableOrder.fulfillment_status === 'preparing'
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-200 text-stone-800'
                  }`}>
                    {activeTableOrder.fulfillment_status === 'ready' ? 'Siap Disajikan!' : activeTableOrder.fulfillment_status === 'preparing' ? 'Sedang Dimasak' : 'Menunggu Konfirmasi'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {activeTableOrder.items.length} item • Total Rp {activeTableOrder.total_amount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Stepper Visual */}
            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
              <span className={`px-2 py-1 rounded-md ${activeTableOrder.fulfillment_status !== 'pending' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-stone-100'}`}>
                1. Diterima
              </span>
              <span>→</span>
              <span className={`px-2 py-1 rounded-md ${activeTableOrder.fulfillment_status === 'preparing' || activeTableOrder.fulfillment_status === 'ready' || activeTableOrder.fulfillment_status === 'served' ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-stone-100'}`}>
                2. Dimasak
              </span>
              <span>→</span>
              <span className={`px-2 py-1 rounded-md ${activeTableOrder.fulfillment_status === 'ready' || activeTableOrder.fulfillment_status === 'served' ? 'bg-emerald-500 text-white font-bold' : 'bg-stone-100'}`}>
                3. Siap
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Categories Horizontal Tabs */}
      <div className="sticky top-16 z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 py-2.5 px-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            Semua Menu ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id && p.is_active).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product List Grid */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500">
            <UtensilsCrossed className="w-12 h-12 stroke-1 text-stone-300 mx-auto mb-3" />
            <p className="font-bold text-stone-700">Menu tidak ditemukan</p>
            <p className="text-xs text-stone-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => setActiveProductModal(prod)}
                className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200/90 shadow-sm hover:shadow-md transition flex gap-3.5 cursor-pointer group"
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  {prod.is_popular && (
                    <span className="absolute top-1.5 left-1.5 bg-amber-500 text-stone-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow">
                      <Sparkles className="w-2.5 h-2.5 fill-current" /> Favorit
                    </span>
                  )}
                </div>

                {/* Product Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-stone-900 group-hover:text-brand-600 transition leading-snug">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                      {prod.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                    <div>
                      <span className="text-xs text-stone-400">Mulai</span>
                      <p className="font-bold text-sm text-stone-900">
                        Rp {prod.base_price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveProductModal(prod);
                      }}
                      className="w-8 h-8 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white flex items-center justify-center transition shadow-xs"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer & Staff Portal Access Link */}
      <footer className="mt-16 text-center text-xs text-stone-400 py-6 border-t border-stone-200">
        <p className="font-semibold text-stone-600">{business.name}</p>
        <p className="text-[11px] text-stone-400 mt-1">{business.address}</p>
        <div className="mt-4">
          <a
            href="#/admin"
            className="inline-flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full transition"
          >
            <span>🔐 Login Staf & Kasir</span>
          </a>
        </div>
      </footer>

      {/* Floating Bottom Cart Bar */}
      {cartTotalQty > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 animate-slide-up">
          <div
            onClick={() => setIsCartOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white p-3.5 sm:p-4 rounded-2xl shadow-xl shadow-brand-600/40 flex items-center justify-between cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-extrabold text-sm text-white">
                {cartTotalQty}
              </div>
              <div>
                <p className="font-extrabold text-sm sm:text-base leading-none">Lihat Pesanan Saya</p>
                <p className="text-xs text-brand-200 mt-1">Meja {currentTable?.table_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base">
                Rp {cartSubtotal.toLocaleString('id-ID')}
              </span>
              <ShoppingBag className="w-5 h-5 ml-1" />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {activeProductModal && (
        <ProductDetailModal
          product={activeProductModal}
          onClose={() => setActiveProductModal(null)}
          onAddToCart={(item) => addToCart(item)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={(id) => setTrackedOrderId(id)}
      />

    </div>
  );
};
