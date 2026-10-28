import React from 'react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { Printer, X, CheckCircle, Coffee } from 'lucide-react';

interface Props {
  order: Order;
  onClose: () => void;
}

export const ReceiptModal: React.FC<Props> = ({ order, onClose }) => {
  const { business, payments } = useStore();

  const paymentRecord = payments.find((p) => p.order_id === order.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-stone-200 text-stone-900 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-stone-900">Struk Pembayaran Thermal</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-stone-200 text-stone-500 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 58mm / 80mm Thermal Receipt Simulation Container */}
        <div className="p-6 bg-stone-100/70 max-h-[75vh] overflow-y-auto">
          <div 
            id="thermal-receipt" 
            className="bg-white p-5 rounded-lg shadow-sm border border-stone-200 mx-auto max-w-[320px] font-mono text-[11px] leading-tight text-stone-900"
          >
            
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-stone-400">
              <div className="flex justify-center mb-1">
                <Coffee className="w-6 h-6 text-brand-700" />
              </div>
              <h2 className="font-extrabold text-sm uppercase tracking-wide">{business.name}</h2>
              <p className="text-[10px] text-stone-600 mt-0.5">{business.address}</p>
              <p className="text-[10px] text-stone-600">Telp: {business.phone}</p>
            </div>

            {/* Transaction Info */}
            <div className="py-2.5 border-b border-dashed border-stone-400 space-y-1">
              <div className="flex justify-between">
                <span>No. Tiket</span>
                <span className="font-bold">#{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Meja</span>
                <span className="font-bold">MEJA {order.table_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu</span>
                <span>{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan</span>
                <span>{order.customer_name}</span>
              </div>
              {paymentRecord && (
                <div className="flex justify-between">
                  <span>Kasir</span>
                  <span>{paymentRecord.cashier_name}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="py-2.5 border-b border-dashed border-stone-400 space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span className="truncate pr-2">{item.product_name}</span>
                    <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-stone-500 text-[10px]">
                    <span>
                      {item.quantity}x @ Rp {item.unit_price.toLocaleString('id-ID')}
                      {item.variant_name ? ` (${item.variant_name})` : ''}
                    </span>
                  </div>
                  {item.addons.length > 0 && (
                    <div className="text-[9px] text-stone-500 pl-2">
                      +{item.addons.map((a) => `${a.addon_name}`).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="py-2.5 border-b border-dashed border-stone-400 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>PPN ({business.tax_rate}%)</span>
                  <span>Rp {order.tax_amount.toLocaleString('id-ID')}</span>
                </div>
              )}
              {order.service_amount > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Service ({business.service_rate}%)</span>
                  <span>Rp {order.service_amount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-dotted border-stone-300">
                <span>TOTAL</span>
                <span>Rp {order.total_amount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Payment Details */}
            {paymentRecord && (
              <div className="py-2.5 border-b border-dashed border-stone-400 space-y-1">
                <div className="flex justify-between">
                  <span>Metode Bayar</span>
                  <span className="font-bold uppercase">{paymentRecord.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tunai Diterima</span>
                  <span>Rp {paymentRecord.amount_received.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Kembalian</span>
                  <span>Rp {paymentRecord.change_given.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-3 space-y-1 text-stone-500 text-[10px]">
              <p className="font-semibold text-stone-800">TERIMA KASIH ATAS KUNJUNGANNYA!</p>
              <p>Wi-Fi: {business.name} | Password: kopienak123</p>
              <p className="text-[9px] font-mono mt-2">www.kopidesondoro.pages.dev</p>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk Thermal (58mm/80mm)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
