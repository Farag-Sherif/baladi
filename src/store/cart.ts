import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../data/catalog';

export const ADD_GRACE_SECONDS = 10;

export interface CartLine {
  id: string;
  qty: number;
  product: Product;
}

export interface PendingCartAdd {
  product: Product;
  qty: number;
  secondsLeft: number;
  sourcePath: string;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  pendingAdd: PendingCartAdd | null;
  open: () => void;
  close: () => void;
  add: (product: Product, qty?: number, openDrawer?: boolean) => void;
  startPendingAdd: (product: Product, qty: number, sourcePath: string) => void;
  updatePendingQty: (qty: number) => void;
  cancelPendingAdd: () => void;
  commitPendingAdd: (openDrawer?: boolean) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

let pendingTimerId: number | null = null;

function clearPendingTimer() {
  if (pendingTimerId !== null) {
    window.clearInterval(pendingTimerId);
    pendingTimerId = null;
  }
}

function mergeCartLine(lines: CartLine[], product: Product, qty: number): CartLine[] {
  const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
  const existing = lines.find((l) => l.id === product.id);
  return existing
    ? lines.map((l) => (l.id === product.id ? { ...l, qty: l.qty + safeQty } : l))
    : [...lines, { id: product.id, qty: safeQty, product }];
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      pendingAdd: null,
      open: () => {
        if (get().pendingAdd) {
          get().commitPendingAdd(true);
          return;
        }
        set((s) => (s.isOpen ? s : { isOpen: true }));
      },
      close: () => set((s) => (s.isOpen ? { isOpen: false } : s)),
      add: (product, qty = 1, openDrawer = true) =>
        set((s) => ({
          isOpen: openDrawer ? true : s.isOpen,
          lines: mergeCartLine(s.lines, product, qty),
        })),
      startPendingAdd: (product, qty, sourcePath) => {
        const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
        const prevPending = get().pendingAdd;
        if (prevPending && prevPending.product.id !== product.id) {
          get().commitPendingAdd(false);
        }
        clearPendingTimer();

        set({
          pendingAdd: {
            product,
            qty: safeQty,
            secondsLeft: ADD_GRACE_SECONDS,
            sourcePath,
          },
        });

        pendingTimerId = window.setInterval(() => {
          const current = get().pendingAdd;
          if (!current) {
            clearPendingTimer();
            return;
          }
          if (current.secondsLeft <= 1) {
            get().commitPendingAdd(true);
            return;
          }
          set((s) =>
            s.pendingAdd
              ? { pendingAdd: { ...s.pendingAdd, secondsLeft: s.pendingAdd.secondsLeft - 1 } }
              : s
          );
        }, 1000);
      },
      updatePendingQty: (qty) => {
        const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
        set((s) =>
          s.pendingAdd
            ? { pendingAdd: { ...s.pendingAdd, qty: safeQty } }
            : s
        );
      },
      cancelPendingAdd: () => {
        clearPendingTimer();
        set({ pendingAdd: null });
      },
      commitPendingAdd: (openDrawer = true) => {
        clearPendingTimer();
        set((s) => {
          if (!s.pendingAdd) return s;
          return {
            pendingAdd: null,
            isOpen: openDrawer ? true : s.isOpen,
            lines: mergeCartLine(s.lines, s.pendingAdd.product, s.pendingAdd.qty),
          };
        });
      },
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          lines: !Number.isFinite(qty) || qty <= 0
            ? s.lines.filter((l) => l.id !== id)
            : s.lines.map((l) => (l.id === id ? { ...l, qty } : l)),
        })),
      clear: () => {
        clearPendingTimer();
        set({ lines: [], pendingAdd: null });
      },
    }),
    { name: 'baladi-cart', partialize: (s) => ({ lines: s.lines }) as CartState }
  )
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
export const cartTotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty * l.product.price, 0);
