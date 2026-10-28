import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CartDrawer: React.FC<Props> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, currentTable, business, updateCartQuantity, removeFromCart, submitCustomerOrder } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [tableNotes, setTableNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = Math.round((subtotal * business.tax_rate) / 100);
  const service = Math.round((subtotal * business.service_rate) / 100);
  const grandTotal = subtotal + tax + service;

  const handleCheckout = async () => {
    if (cart.length === 0 || !currentTable || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const newOrder = await submitCustomerOrder(currentTable.id, customerName, tableNotes);
      onOrderSuccess(newOrder.id);
      onClose();
    } catch (err) {
      alert('Gagal mengirim pesanan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-left text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 leading-none">Keranjang Pesanan</h3>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-600" />
                {currentTable?.table_label || 'Pilih Meja'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200 text-stone-500 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-stone-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <ShoppingBag className="w-16 h-16 stroke-1 text-stone-300 mb-3" />
              <p className="font-bold text-stone-600 text-base">Keranjangmu masih kosong</p>
              <p className="text-xs text-stone-400 max-w-xs mt-1">
                Pilih menu kopi atau makanan favoritmu untuk mulai memesan langsung dari meja.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cart_item_id} className="pt-3 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-stone-900">{item.product.name}</h4>
                    {item.selected_variant && (
                      <p className="text-xs text-brand-700 font-medium">
                        Varian: {item.selected_variant.name}
                      </p>
                    )}
                    {item.selected_addons.length > 0 && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        +{item.selected_addons.map((a) => `${a.name} (${a.quantity}x)`).join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs italic text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 inline-block">
                        "{item.notes}"
                      </p>
                    )}
                    <p className="text-xs font-bold text-stone-800 mt-1">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg">
                    <button
                      onClick={() => updateCartQuantity(item.cart_item_id, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-stone-900">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.cart_item_id, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.cart_item_id)}
                      className="w-6 h-6 rounded flex items-center justify-center text-rose-500 hover:bg-rose-50 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer Information & Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Nama Pemesan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Mas Budi / Mbak Rina"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Catatan untuk Kasir / Dapur (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Minta asbak / pisahkan sambal"
                value={tableNotes}
                onChange={(e) => setTableNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
              />
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-white p-3 rounded-xl border border-stone-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} item)</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>PPN Resto ({business.tax_rate}%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Service Charge ({business.service_rate}%)</span>
                <span>Rp {service.toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-dashed border-stone-200 pt-1.5 flex justify-between font-bold text-sm text-stone-900">
                <span>Total Tagihan</span>
                <span className="text-brand-700">Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pesanan langsung terhubung ke layar Kasir & Dapur</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-between transition-all disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Memproses Pesanan...' : 'Kirim Pesanan ke Dapur'}</span>
              <div className="flex items-center gap-1">
                <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
