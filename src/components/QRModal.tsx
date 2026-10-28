import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { TableItem } from '../types';
import { useStore } from '../context/StoreContext';
import { X, Printer, Download, RefreshCw, Coffee, QrCode } from 'lucide-react';

interface Props {
  table: TableItem;
  onClose: () => void;
}

export const QRModal: React.FC<Props> = ({ table, onClose }) => {
  const { business, regenerateTableQR } = useStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real URL for table QR ordering
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kopidesondoro.pages.dev';
  const qrUrl = `${origin}?table=${table.id}&token=${table.qr_token}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#1c1917',
          light: '#ffffff',
        },
      });
    }
  }, [qrUrl]);

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `QR_${business.slug}_Meja_${table.table_number}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-stone-200 text-stone-900 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-sm text-stone-900">QR Code {table.table_label}</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-stone-200 text-stone-500 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Table Tent Card */}
        <div id="table-tent-card" className="p-6 flex flex-col items-center text-center bg-white">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-brand-700 flex items-center justify-center shadow-md mb-2">
            <Coffee className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-extrabold text-lg text-stone-900 tracking-tight">{business.name}</h2>
          <p className="text-xs text-stone-500 mb-4">Pesan & Bayar Langsung Dari Meja</p>

          <div className="p-3 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 shadow-inner mb-3">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          <div className="bg-brand-50 border border-brand-200 text-brand-900 px-4 py-1.5 rounded-full font-extrabold text-sm mb-2">
            MEJA {table.table_number}
          </div>

          <p className="text-[11px] text-stone-400 font-mono break-all max-w-[260px]">
            Token: {table.qr_token}
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu Meja</span>
            </button>
            <button
              onClick={handleDownloadPNG}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PNG</span>
            </button>
          </div>

          <button
            onClick={() => regenerateTableQR(table.id)}
            className="flex items-center justify-center gap-1 text-[11px] text-stone-500 hover:text-rose-600 transition py-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Generate Ulang Token Keamanan Meja</span>
          </button>
        </div>

      </div>
    </div>
  );
};
