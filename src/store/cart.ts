import { create } from 'zustand';
import {
  cartApi,
  extractErrorMessage,
  getStoredCartToken,
  localizedFallback,
  setStoredCartToken,
  type ApiCartItem,
  type ApiCartResponse,
  type ApiProduct,
} from '../lib/api';
import type { Lang } from '../lib/lang';

export const ADD_GRACE_SECONDS = 10;

export interface PendingCartAdd {
  product: ApiProduct;
  qty: number;
  secondsLeft: number;
  sourcePath: string;
}

interface CartState {
  cartToken: string | null;
  items: ApiCartItem[];
  subtotal: number;
  totalItems: number;
  isOpen: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  pendingAdd: PendingCartAdd | null;

  open: () => void;
  close: () => void;
  clearError: () => void;
  fetchCart: (lang?: Lang) => Promise<void>;
  add: (product: ApiProduct, qty?: number, openDrawer?: boolean) => Promise<boolean>;
  addById: (productId: number, qty?: number, openDrawer?: boolean) => Promise<boolean>;
  setQty: (cartItemId: number, quantity: number) => Promise<void>;
  remove: (cartItemId: number) => Promise<void>;
  clear: () => Promise<void>;

  startPendingAdd: (product: ApiProduct, qty: number, sourcePath: string) => void;
  updatePendingQty: (qty: number) => void;
  cancelPendingAdd: () => void;
  commitPendingAdd: (openDrawer?: boolean) => Promise<void>;
}

let pendingTimerId: number | null = null;

function clearPendingTimer() {
  if (pendingTimerId !== null) {
    window.clearInterval(pendingTimerId);
    pendingTimerId = null;
  }
}

function normalizeCartPayload(res: ApiCartResponse) {
  if (res.cart_token) {
    setStoredCartToken(res.cart_token);
  }
  const items = Array.isArray(res.items) ? res.items : [];
  const subtotal =
    typeof res.subtotal === 'number'
      ? res.subtotal
      : items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems =
    typeof res.total_items === 'number'
      ? res.total_items
      : items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartToken: res.cart_token || getStoredCartToken(),
    items,
    subtotal,
    totalItems,
  };
}

export const useCart = create<CartState>((set, get) => ({
  cartToken: getStoredCartToken(),
  items: [],
  subtotal: 0,
  totalItems: 0,
  isOpen: false,
  isLoading: false,
  isSyncing: false,
  error: null,
  pendingAdd: null,

  open: () => {
    if (get().pendingAdd) {
      void get().commitPendingAdd(true);
      return;
    }
    set((s) => (s.isOpen ? s : { isOpen: true }));
  },

  close: () => set((s) => (s.isOpen ? { isOpen: false } : s)),

  clearError: () => set({ error: null }),

  fetchCart: async (lang) => {
    set({ isLoading: true, error: null });
    try {
      const res = await cartApi.getCart(lang);
      set({
        ...normalizeCartPayload(res),
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: extractErrorMessage(err, localizedFallback('تعذر تحميل السلة', 'Unable to load cart')),
      });
    }
  },

  add: async (product, qty = 1, openDrawer = true) => {
    if (!product.in_stock) {
      set({ error: localizedFallback('المنتج غير متوفر حالياً في المخزون', 'Product is currently out of stock') });
      return false;
    }
    return get().addById(product.id, qty, openDrawer);
  },

  addById: async (productId, qty = 1, openDrawer = true) => {
    const safeQty = Number.isFinite(qty) && qty > 0 ? Math.min(999, Math.floor(qty)) : 1;
    set({ isSyncing: true, error: null });
    try {
      const res = await cartApi.addItem(productId, safeQty);
      set((s) => ({
        ...normalizeCartPayload(res),
        isOpen: openDrawer ? true : s.isOpen,
        isSyncing: false,
      }));
      return true;
    } catch (err) {
      set({
        isSyncing: false,
        error: extractErrorMessage(err, localizedFallback('تعذر إضافة المنتج للسلة', 'Unable to add item to cart')),
      });
      return false;
    }
  },

  setQty: async (cartItemId, quantity) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      await get().remove(cartItemId);
      return;
    }
    const safeQty = Math.min(999, Math.floor(quantity));
    set({ isSyncing: true, error: null });
    try {
      const res = await cartApi.updateItem(cartItemId, safeQty);
      set({
        ...normalizeCartPayload(res),
        isSyncing: false,
      });
    } catch (err) {
      set({
        isSyncing: false,
        error: extractErrorMessage(err, localizedFallback('تعذر تحديث الكمية', 'Unable to update quantity')),
      });
    }
  },

  remove: async (cartItemId) => {
    set({ isSyncing: true, error: null });
    try {
      const res = await cartApi.removeItem(cartItemId);
      set({
        ...normalizeCartPayload(res),
        isSyncing: false,
      });
    } catch (err) {
      set({
        isSyncing: false,
        error: extractErrorMessage(err, localizedFallback('تعذر حذف المنتج من السلة', 'Unable to remove item from cart')),
      });
    }
  },

  clear: async () => {
    clearPendingTimer();
    set({ pendingAdd: null, isSyncing: true, error: null });
    try {
      const res = await cartApi.clearCart();
      set({
        ...normalizeCartPayload(res),
        isSyncing: false,
      });
    } catch (err) {
      set({
        items: [],
        subtotal: 0,
        totalItems: 0,
        isSyncing: false,
        error: extractErrorMessage(err, localizedFallback('تعذر تفريغ السلة', 'Unable to clear cart')),
      });
    }
  },

  startPendingAdd: (product, qty, sourcePath) => {
    if (!product.in_stock) {
      set({ error: localizedFallback('المنتج غير متوفر حالياً في المخزون', 'Product is currently out of stock') });
      return;
    }

    const safeQty = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1;
    const prevPending = get().pendingAdd;
    if (prevPending && prevPending.product.id !== product.id) {
      void get().commitPendingAdd(false);
    }
    clearPendingTimer();

    set({
      error: null,
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
        void get().commitPendingAdd(true);
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
    const safeQty = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1;
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

  commitPendingAdd: async (openDrawer = true) => {
    clearPendingTimer();
    const pending = get().pendingAdd;
    if (!pending) return;

    set({ pendingAdd: null });
    await get().add(pending.product, pending.qty, openDrawer);
  },
}));

export const cartCount = (items: ApiCartItem[]) => items.reduce((n, l) => n + l.quantity, 0);
export const cartTotal = (items: ApiCartItem[]) =>
  items.reduce((n, l) => n + (typeof l.total === 'number' ? l.total : l.price * l.quantity), 0);
