import React, { useState } from 'react';
import { Product, ProductVariant, ProductAddon, CartItem } from '../types';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';

interface Props {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductDetailModal: React.FC<Props> = ({ product, onClose, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants.find((v) => v.is_default) || product.variants[0]
  );

  const [selectedAddons, setSelectedAddons] = useState<Map<string, { addon: ProductAddon; quantity: number }>>(
    new Map()
  );

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const toggleAddon = (addon: ProductAddon) => {
    const next = new Map(selectedAddons);
    if (next.has(addon.id)) {
      next.delete(addon.id);
    } else {
      next.set(addon.id, { addon, quantity: 1 });
    }
    setSelectedAddons(next);
  };

  const updateAddonQty = (addon: ProductAddon, delta: number) => {
    const next = new Map(selectedAddons);
    const existing = next.get(addon.id);
    if (!existing) return;
    const nextQty = existing.quantity + delta;
    if (nextQty <= 0) {
      next.delete(addon.id);
    } else if (nextQty <= addon.max_quantity) {
      next.set(addon.id, { addon, quantity: nextQty });
    }
    setSelectedAddons(next);
  };

  // Price Calculation
  const variantPrice = selectedVariant ? selectedVariant.price_adjustment : 0;
  let addonsTotalUnit = 0;
  selectedAddons.forEach(({ addon, quantity: aQty }) => {
    addonsTotalUnit += addon.price * aQty;
  });

  const unitTotal = product.base_price + variantPrice + addonsTotalUnit;
  const grandTotal = unitTotal * quantity;

  const handleAdd = () => {
    const addonList = Array.from(selectedAddons.values()).map(({ addon, quantity: aQty }) => ({
      addon_id: addon.id,
      name: addon.name,
      price: addon.price,
      quantity: aQty,
    }));

    const cartItem: CartItem = {
      cart_item_id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      product,
      selected_variant: selectedVariant,
      selected_addons: addonList,
      quantity,
      unit_price: unitTotal,
      subtotal: grandTotal,
      notes: notes.trim(),
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Hero Image */}
        <div className="relative h-48 sm:h-56 w-full bg-stone-100 flex-shrink-0">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2">
              {product.is_popular && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-stone-950">
                  <Sparkles className="w-3 h-3 fill-current" /> Favorit
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold leading-tight mt-1">{product.name}</h3>
            <p className="text-sm font-semibold text-brand-300">
              Rp {product.base_price.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
          
          {product.description && (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/60">
              {product.description}
            </p>
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                Pilih Varian / Ukuran <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/50 text-brand-900 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-brand-600 bg-brand-600' : 'border-stone-400'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm font-medium">{v.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-stone-500">
                        {v.price_adjustment > 0 ? `+Rp ${v.price_adjustment.toLocaleString('id-ID')}` : 'Termasuk'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {product.addons.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                Tambahan / Topping (Opsional)
              </label>
              <div className="space-y-2">
                {product.addons.map((addon) => {
                  const isChecked = selectedAddons.has(addon.id);
                  const curQty = selectedAddons.get(addon.id)?.quantity || 1;
                  return (
                    <div
                      key={addon.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-brand-500 bg-brand-50/30'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div 
                        className="flex items-center gap-2.5 flex-1 cursor-pointer"
                        onClick={() => toggleAddon(addon)}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-brand-600 border-brand-600 text-white' : 'border-stone-400'}`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-800">{addon.name}</p>
                          <p className="text-xs text-brand-700 font-semibold">+Rp {addon.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>

                      {isChecked && addon.max_quantity > 1 && (
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-stone-200 shadow-xs">
                          <button
                            type="button"
                            onClick={() => updateAddonQty(addon, -1)}
                            className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-stone-900 w-4 text-center">{curQty}</span>
                          <button
                            type="button"
                            onClick={() => updateAddonQty(addon, 1)}
                            className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              Catatan Khusus
            </label>
            <input
              type="text"
              placeholder="Contoh: Less ice, jangan pakai sedotan, pisahkan saus..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center bg-white border border-stone-300 rounded-xl px-2 py-1.5 shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-stone-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-brand-600/30 flex items-center justify-between transition-all"
          >
            <span>Tambah ke Pesanan</span>
            <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
