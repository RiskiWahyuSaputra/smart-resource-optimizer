'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onConfirm }) => {
  const { items, removeItem, itemCount, clearCart } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white z-[9999] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Keranjang Klaim</h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Keranjang Kosong</h3>
              <p className="text-slate-500 mt-1 max-w-[240px]">
                Anda belum menambahkan makanan apa pun ke daftar klaim.
              </p>
              <button
                onClick={onClose}
                className="mt-6 text-emerald-600 font-semibold hover:underline flex items-center gap-2"
              >
                Cari Makanan <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 group"
              >
                <div
                  className="w-20 h-20 bg-cover bg-center rounded-lg border border-slate-200"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mb-1">{item.restaurantName}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                      {item.quantity} {item.unit}
                    </span>
                    <span>•</span>
                    <span className="text-amber-600 font-medium">{item.expiryTime}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 self-start text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all"
            >
              Konfirmasi Klaim ({itemCount})
            </button>
            <button
              onClick={clearCart}
              className="w-full text-slate-500 text-sm font-medium hover:text-red-600 transition-colors"
            >
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
