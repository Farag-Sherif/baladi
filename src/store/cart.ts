import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../data/catalog';

export interface CartLine {
  id: string;
  qty: number;
  product: Product;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      add: (product, qty = 1) => {
        const existing = get().lines.find((l) => l.id === product.id);
        set({
          isOpen: true,
          lines: existing
            ? get().lines.map((l) => (l.id === product.id ? { ...l, qty: l.qty + qty } : l))
            : [...get().lines, { id: product.id, qty, product }],
        });
      },
      remove: (id) => set({ lines: get().lines.filter((l) => l.id !== id) }),
      setQty: (id, qty) =>
        set({
          lines: qty <= 0
            ? get().lines.filter((l) => l.id !== id)
            : get().lines.map((l) => (l.id === id ? { ...l, qty } : l)),
        }),
      clear: () => set({ lines: [] }),
    }),
    { name: 'baladi-cart', partialize: (s) => ({ lines: s.lines }) as CartState }
  )
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
export const cartTotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty * l.product.price, 0);
