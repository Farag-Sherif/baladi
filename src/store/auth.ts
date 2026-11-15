import { create } from 'zustand';
import {
  addressesApi,
  ApiError,
  authApi,
  extractErrorMessage,
  favoritesApi,
  getStoredToken,
  localizedFallback,
  notificationsApi,
  ordersApi,
  registerUnauthorizedHandler,
  setStoredToken,
  type ApiAddress,
  type ApiCustomer,
  type ApiNotification,
  type ApiOrder,
  type ApiProduct,
} from '../lib/api';
import { useCart } from './cart';
import type { Lang } from '../lib/lang';

export type { ApiAddress as UserAddress, ApiOrder as Order, ApiCustomer as User };

export interface AuthActionResult {
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
}

interface AuthState {
  token: string | null;
  user: ApiCustomer | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  addresses: ApiAddress[];
  orders: ApiOrder[];
  favorites: ApiProduct[];
  notifications: ApiNotification[];
  unreadNotifications: number;

  initAuth: (lang?: Lang) => Promise<void>;
  hydrateAccountData: (lang?: Lang) => Promise<void>;
  clearSession: () => void;

  login: (email: string, password: string) => Promise<AuthActionResult>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  updateProfile: (payload: {
    name?: string;
    phone?: string;
    password?: string;
    password_confirmation?: string;
  }) => Promise<AuthActionResult>;

  fetchAddresses: () => Promise<void>;
  createAddress: (payload: {
    label: string;
    name: string;
    phone: string;
    governorate_id: number;
    line: string;
    is_default?: boolean;
  }) => Promise<AuthActionResult>;
  updateAddress: (
    id: number,
    payload: Partial<{
      label: string;
      name: string;
      phone: string;
      governorate_id: number;
      line: string;
    }>
  ) => Promise<AuthActionResult>;
  setDefaultAddress: (id: number) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;

  fetchOrders: (lang?: Lang) => Promise<void>;
  trackOrder: (orderNumber: string, phone?: string, lang?: Lang) => Promise<ApiOrder>;

  fetchFavorites: (lang?: Lang) => Promise<void>;
  toggleFavorite: (product: ApiProduct) => Promise<{ ok: boolean; requiresAuth?: boolean; error?: string }>;
  removeFavorite: (productId: number) => Promise<void>;

  fetchNotifications: (lang?: Lang) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

let initialized = false;

export const useAuth = create<AuthState>((set, get) => {
  registerUnauthorizedHandler(() => {
    get().clearSession();
  });

  return {
    token: getStoredToken(),
    user: null,
    isAuthenticated: Boolean(getStoredToken()),
    isHydrating: false,
    addresses: [],
    orders: [],
    favorites: [],
    notifications: [],
    unreadNotifications: 0,

    clearSession: () => {
      setStoredToken(null);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isHydrating: false,
        addresses: [],
        orders: [],
        favorites: [],
        notifications: [],
        unreadNotifications: 0,
      });
    },

    initAuth: async (lang) => {
      const token = getStoredToken();
      if (!token) {
        if (get().isAuthenticated) get().clearSession();
        return;
      }
      if (initialized && get().user) {
        await get().hydrateAccountData(lang);
        return;
      }
      initialized = true;
      set({ isHydrating: true, token });
      try {
        const me = await authApi.me();
        set({
          user: me.data,
          isAuthenticated: true,
        });
        await get().hydrateAccountData(lang);
      } catch {
        get().clearSession();
      } finally {
        set({ isHydrating: false });
      }
    },

    hydrateAccountData: async (lang) => {
      if (!getStoredToken()) return;
      await Promise.allSettled([
        get().fetchAddresses(),
        get().fetchOrders(lang),
        get().fetchFavorites(lang),
        get().fetchNotifications(lang),
      ]);
    },

    login: async (email, password) => {
      try {
        const res = await authApi.login({ email: email.trim(), password });
        const { token, customer } = res.data;
        setStoredToken(token);
        initialized = true;
        set({
          token,
          user: customer,
          isAuthenticated: true,
        });
        await Promise.allSettled([
          get().hydrateAccountData(),
          useCart.getState().fetchCart(),
        ]);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: extractErrorMessage(err, localizedFallback('بيانات الدخول غير صحيحة', 'Invalid login credentials')),
          errors: err instanceof ApiError ? err.errors : undefined,
        };
      }
    },

    register: async (payload) => {
      try {
        const res = await authApi.register({
          name: payload.name.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          password: payload.password,
          password_confirmation: payload.password_confirmation,
        });
        const { token, customer } = res.data;
        setStoredToken(token);
        initialized = true;
        set({
          token,
          user: customer,
          isAuthenticated: true,
        });
        await Promise.allSettled([
          get().hydrateAccountData(),
          useCart.getState().fetchCart(),
        ]);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: extractErrorMessage(err, localizedFallback('تعذر إنشاء الحساب', 'Unable to create account')),
          errors: err instanceof ApiError ? err.errors : undefined,
        };
      }
    },

    logout: async () => {
      try {
        if (getStoredToken()) {
          await authApi.logout();
        }
      } catch {
        /* ignore revocation errors when signing out */
      } finally {
        initialized = false;
        get().clearSession();
        await useCart.getState().fetchCart();
      }
    },

    updateProfile: async (payload) => {
      try {
        const res = await authApi.updateProfile(payload);
        set({ user: res.data });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: extractErrorMessage(err, localizedFallback('تعذر تحديث البيانات', 'Unable to update profile')),
          errors: err instanceof ApiError ? err.errors : undefined,
        };
      }
    },

    fetchAddresses: async () => {
      if (!getStoredToken()) return;
      try {
        const res = await addressesApi.list();
        set({ addresses: res.data || [] });
      } catch {
        /* handled safely */
      }
    },

    createAddress: async (payload) => {
      try {
        await addressesApi.create(payload);
        await get().fetchAddresses();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: extractErrorMessage(err, localizedFallback('تعذر حفظ العنوان', 'Unable to save address')),
          errors: err instanceof ApiError ? err.errors : undefined,
        };
      }
    },

    updateAddress: async (id, payload) => {
      try {
        await addressesApi.update(id, payload);
        await get().fetchAddresses();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: extractErrorMessage(err, localizedFallback('تعذر تحديث العنوان', 'Unable to update address')),
        };
      }
    },

    setDefaultAddress: async (id) => {
      try {
        await addressesApi.setDefault(id);
        await get().fetchAddresses();
      } catch {
        /* ignore */
      }
    },

    deleteAddress: async (id) => {
      try {
        await addressesApi.remove(id);
        await get().fetchAddresses();
      } catch {
        /* ignore */
      }
    },

    fetchOrders: async (lang) => {
      if (!getStoredToken()) return;
      try {
        const res = await ordersApi.myOrders(1, lang);
        set({ orders: res.data || [] });
      } catch {
        /* ignore */
      }
    },

    trackOrder: async (orderNumber, phone, lang) => {
      const res = await ordersApi.trackOrder(orderNumber, phone, lang);
      return res.data;
    },

    fetchFavorites: async (lang) => {
      if (!getStoredToken()) return;
      try {
        const res = await favoritesApi.list(lang);
        set({ favorites: res.data || [] });
      } catch {
        /* ignore */
      }
    },

    toggleFavorite: async (product) => {
      if (!getStoredToken()) {
        return { ok: false, requiresAuth: true };
      }
      const exists = get().favorites.some((f) => f.id === product.id);
      try {
        if (exists) {
          await favoritesApi.remove(product.id);
          set((s) => ({ favorites: s.favorites.filter((f) => f.id !== product.id) }));
        } else {
          await favoritesApi.add(product.id);
          set((s) => ({
            favorites: s.favorites.some((f) => f.id === product.id)
              ? s.favorites
              : [product, ...s.favorites],
          }));
        }
        return { ok: true };
      } catch (err) {
        return { ok: false, error: extractErrorMessage(err) };
      }
    },

    removeFavorite: async (productId) => {
      try {
        await favoritesApi.remove(productId);
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== productId) }));
      } catch {
        /* ignore */
      }
    },

    fetchNotifications: async (lang) => {
      if (!getStoredToken()) return;
      try {
        const res = await notificationsApi.list(false, lang);
        set({
          notifications: res.data || [],
          unreadNotifications: res.meta?.unread ?? (res.data || []).filter((n) => !n.read).length,
        });
      } catch {
        /* ignore */
      }
    },

    fetchUnreadCount: async () => {
      if (!getStoredToken()) return;
      try {
        const res = await notificationsApi.unreadCount();
        const unread = res.data?.unread ?? res.unread ?? 0;
        set({ unreadNotifications: unread });
      } catch {
        /* ignore */
      }
    },

    markNotificationRead: async (id) => {
      try {
        await notificationsApi.markRead(id);
        set((s) => {
          const updated = s.notifications.map((n) =>
            n.id === id ? { ...n, read: true, read_at: n.read_at || new Date().toISOString() } : n
          );
          return {
            notifications: updated,
            unreadNotifications: updated.filter((n) => !n.read).length,
          };
        });
      } catch {
        /* ignore */
      }
    },

    markAllNotificationsRead: async () => {
      try {
        await notificationsApi.markAllRead();
        const now = new Date().toISOString();
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true, read_at: n.read_at || now })),
          unreadNotifications: 0,
        }));
      } catch {
        /* ignore */
      }
    },
  };
});
