import type { Lang } from './lang';

const rawEnvBaseUrl = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
  ?.VITE_API_BASE_URL;

export const API_BASE_URL = (rawEnvBaseUrl || 'https://baladi.bluebrain-co.com/api/v1').replace(/\/+$/, '');

export const TOKEN_STORAGE_KEY = 'baladi-api-token';
export const CART_TOKEN_STORAGE_KEY = 'baladi-cart-token';
export const LANG_STORAGE_KEY = 'baladi-lang';

export type ApiSpecies = 'cat' | 'dog';
export type RouteSpecies = 'cats' | 'dogs';

export const speciesToRoute = (species: ApiSpecies): RouteSpecies =>
  species === 'cat' ? 'cats' : 'dogs';

export const routeToSpecies = (route: RouteSpecies): ApiSpecies =>
  route === 'cats' ? 'cat' : 'dog';

export interface ApiCategory {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  slug: string;
  species: ApiSpecies;
  products_count?: number;
}

export interface ApiProduct {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  slug: string;
  sku: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  discount_percent: number | null;
  stock_quantity: number;
  in_stock: boolean;
  species: ApiSpecies;
  is_featured: boolean;
  image: string | null;
  category: Omit<ApiCategory, 'name_ar' | 'name_en' | 'products_count'> & {
    name_ar?: string;
    name_en?: string;
  };
}

export interface ApiPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiFaq {
  question: string;
  answer: string;
}

export interface ApiStorySection {
  title: string;
  body: string;
}

export interface ApiSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  currency: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  shipping_flat: number;
  free_shipping_threshold: number;
  shipping_mode?: string;
}

export interface ApiCartItem {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  quantity: number;
  total: number;
  stock_quantity: number;
  in_stock: boolean;
}

export interface ApiCartResponse {
  cart_token?: string;
  items: ApiCartItem[];
  subtotal: number;
  total_items: number;
}

export interface ApiGovernorate {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  shipping_cost: number;
  source?: 'panther' | 'governorate' | string;
}

export interface ApiDeliveryCost {
  sector_id?: number;
  governorate_id?: number;
  name: string;
  shipping_cost: number;
  currency?: string;
  source: 'panther' | 'governorate' | string;
}

export interface ApiCouponValidation {
  code: string;
  type: 'percent' | 'fixed' | string;
  value: number;
  discount: number;
}

export interface ApiCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface ApiAddress {
  id: number;
  label: string;
  name: string;
  phone: string;
  governorate_id: number;
  governorate: string;
  line: string;
  full_address: string;
  is_default: boolean;
  created_at: string;
}

export interface ApiOrderItem {
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface ApiOrder {
  order_number: string;
  status: string;
  status_label: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: 'cod' | 'online' | string;
  customer_name: string;
  customer_address: string;
  created_at: string;
  items: ApiOrderItem[];
}

export interface ApiNotification {
  id: string;
  type: string;
  event: string;
  message: string;
  data: {
    event?: string;
    order_id?: number;
    order_number?: string;
    status?: string;
    total?: number;
  };
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface ApiNotificationsMeta {
  unread: number;
  total: number;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function getStoredCartToken(): string | null {
  try {
    return localStorage.getItem(CART_TOKEN_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function setStoredCartToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(CART_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(CART_TOKEN_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function getCurrentLang(): Lang {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export function getProductTitle(
  product: Pick<ApiProduct, 'name' | 'name_ar' | 'name_en'>,
  lang: Lang
): string {
  if (lang === 'ar') return product.name_ar || product.name;
  return product.name_en || product.name;
}

export function getCategoryTitle(
  cat: Pick<ApiCategory, 'name'> & { name_ar?: string; name_en?: string },
  lang: Lang
): string {
  if (lang === 'ar') return cat.name_ar || cat.name;
  return cat.name_en || cat.name;
}

export function getProductFallbackImage(species: ApiSpecies): string {
  return species === 'cat' ? '/brand/pack-cats.png' : '/brand/pack-dogs.png';
}

export function resolveProductImage(image: string | null | undefined, species: ApiSpecies = 'cat'): string {
  return image && image.trim() ? image : getProductFallbackImage(species);
}

export function localizedFallback(ar: string, en: string): string {
  return getCurrentLang() === 'ar' ? ar : en;
}

export function extractErrorMessage(
  err: unknown,
  fallback = localizedFallback('حدث خطأ غير متوقع', 'An unexpected error occurred')
): string {
  if (err instanceof ApiError) {
    if (err.errors) {
      const firstKey = Object.keys(err.errors)[0];
      if (firstKey && err.errors[firstKey]?.[0]) {
        return err.errors[firstKey][0];
      }
    }
    return err.message || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  lang?: Lang;
  sendCartToken?: boolean;
  sendAuthToken?: boolean;
  headers?: Record<string, string>;
}

let unauthorizedHandler: (() => void) | null = null;
export function registerUnauthorizedHandler(fn: () => void): void {
  unauthorizedHandler = fn;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    lang = getCurrentLang(),
    sendCartToken = false,
    sendAuthToken = true,
    headers: extraHeaders,
  } = opts;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': lang,
    ...extraHeaders,
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = sendAuthToken ? getStoredToken() : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (sendCartToken) {
    const cartToken = getStoredCartToken();
    if (cartToken) {
      headers['X-Cart-Token'] = cartToken;
    }
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json: Record<string, unknown> = {};
  if (text) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = { message: text };
    }
  }

  if (!res.ok) {
    if (res.status === 401 && token && unauthorizedHandler) {
      unauthorizedHandler();
    }
    const message =
      (typeof json.message === 'string' && json.message) ||
      `Request failed with status ${res.status}`;
    const errors =
      json.errors && typeof json.errors === 'object'
        ? (json.errors as Record<string, string[]>)
        : undefined;
    throw new ApiError(res.status, message, errors);
  }

  return json as T;
}

export interface ProductQueryParams {
  category?: string;
  species?: ApiSpecies;
  featured?: boolean;
  q?: string;
  min_price?: number;
  max_price?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name';
  per_page?: number;
  page?: number;
}

export const catalogApi = {
  listProducts: (params: ProductQueryParams = {}, lang?: Lang) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.species) qs.set('species', params.species);
    if (params.featured) qs.set('featured', '1');
    if (params.q?.trim()) qs.set('q', params.q.trim());
    if (params.min_price !== undefined) qs.set('min_price', String(params.min_price));
    if (params.max_price !== undefined) qs.set('max_price', String(params.max_price));
    if (params.sort) qs.set('sort', params.sort);
    qs.set('per_page', String(params.per_page ?? 50));
    if (params.page) qs.set('page', String(params.page));

    const query = qs.toString();
    return apiRequest<{ data: ApiProduct[]; meta: ApiPaginationMeta }>(
      `/products${query ? `?${query}` : ''}`,
      { lang }
    );
  },
  getProductBySlug: (slug: string, lang?: Lang) =>
    apiRequest<{ data: ApiProduct }>(`/products/${encodeURIComponent(slug)}`, { lang }),
  listCategories: (lang?: Lang) =>
    apiRequest<{ data: ApiCategory[] }>('/categories', { lang }),
};

export const contentApi = {
  listFaqs: (lang?: Lang) => apiRequest<{ data: ApiFaq[] }>('/faqs', { lang }),
  getStory: (lang?: Lang) => apiRequest<{ data: ApiStorySection[] }>('/story', { lang }),
  getSettings: (lang?: Lang) => apiRequest<{ data: ApiSettings }>('/settings', { lang }),
};

export const cartApi = {
  getCart: (lang?: Lang) =>
    apiRequest<ApiCartResponse>('/cart', { lang, sendCartToken: true }),
  addItem: (productId: number, quantity: number, lang?: Lang) =>
    apiRequest<ApiCartResponse>('/cart/items', {
      method: 'POST',
      body: { product_id: productId, quantity },
      lang,
      sendCartToken: true,
    }),
  updateItem: (cartItemId: number, quantity: number, lang?: Lang) =>
    apiRequest<ApiCartResponse>(`/cart/items/${cartItemId}`, {
      method: 'PATCH',
      body: { quantity },
      lang,
      sendCartToken: true,
    }),
  removeItem: (cartItemId: number, lang?: Lang) =>
    apiRequest<ApiCartResponse>(`/cart/items/${cartItemId}`, {
      method: 'DELETE',
      lang,
      sendCartToken: true,
    }),
  clearCart: (lang?: Lang) =>
    apiRequest<ApiCartResponse>('/cart', {
      method: 'DELETE',
      lang,
      sendCartToken: true,
    }),
};

export interface CheckoutGuestPayload {
  name: string;
  phone: string;
  email?: string;
  governorate_id: number;
  address: string;
  payment_method: 'cod' | 'online';
  coupon_code?: string | null;
  notes?: string;
}

export interface CheckoutSavedAddressPayload {
  address_id: number;
  payment_method: 'cod' | 'online';
  coupon_code?: string | null;
  notes?: string;
}

export const checkoutApi = {
  listGovernorates: (lang?: Lang) =>
    apiRequest<{ data: ApiGovernorate[] }>('/checkout/governorates', { lang }),
  validateCoupon: (code: string, subtotal: number, lang?: Lang) =>
    apiRequest<{ data: ApiCouponValidation }>('/coupons/validate', {
      method: 'POST',
      body: { code, subtotal },
      lang,
    }),
  getDeliveryCost: (governorateId: number, subtotal?: number, lang?: Lang) =>
    apiRequest<{ data: ApiDeliveryCost }>('/checkout/delivery-cost', {
      method: 'POST',
      body: {
        governorate_id: governorateId,
        ...(subtotal !== undefined ? { subtotal } : {}),
      },
      lang,
    }),
  placeOrder: (
    payload: CheckoutGuestPayload | CheckoutSavedAddressPayload,
    lang?: Lang
  ) =>
    apiRequest<{ data: ApiOrder }>('/checkout', {
      method: 'POST',
      body: payload,
      lang,
      sendCartToken: true,
    }),
};

export const authApi = {
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) =>
    apiRequest<{ data: { token: string; customer: ApiCustomer } }>('/auth/register', {
      method: 'POST',
      body: payload,
      sendAuthToken: false,
    }),
  login: (payload: { email: string; password: string }) =>
    apiRequest<{ data: { token: string; customer: ApiCustomer } }>('/auth/login', {
      method: 'POST',
      body: payload,
      sendAuthToken: false,
    }),
  forgotPassword: (email: string) =>
    apiRequest<{ message: string; data?: { email: string } }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      sendAuthToken: false,
    }),
  resetPassword: (payload: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }) =>
    apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: payload,
      sendAuthToken: false,
    }),
  me: () => apiRequest<{ data: ApiCustomer }>('/auth/me'),
  updateProfile: (payload: {
    name?: string;
    phone?: string;
    password?: string;
    password_confirmation?: string;
  }) =>
    apiRequest<{ data: ApiCustomer }>('/auth/profile', {
      method: 'PUT',
      body: payload,
    }),
  logout: () => apiRequest<{ message?: string }>('/auth/logout', { method: 'POST' }),
};

export const ordersApi = {
  myOrders: (page = 1, lang?: Lang) =>
    apiRequest<{ data: ApiOrder[]; meta: ApiPaginationMeta }>(`/orders?page=${page}`, {
      lang,
    }),
  trackOrder: (orderNumber: string, phone?: string, lang?: Lang) => {
    const cleanNum = encodeURIComponent(orderNumber.trim());
    const qs = phone?.trim() ? `?phone=${encodeURIComponent(phone.trim())}` : '';
    return apiRequest<{ data: ApiOrder }>(`/orders/${cleanNum}${qs}`, { lang });
  },
};

export const addressesApi = {
  list: () => apiRequest<{ data: ApiAddress[]; meta?: { total: number } }>('/addresses'),
  create: (payload: {
    label: string;
    name: string;
    phone: string;
    governorate_id: number;
    line: string;
    is_default?: boolean;
  }) =>
    apiRequest<{ data: ApiAddress }>('/addresses', {
      method: 'POST',
      body: payload,
    }),
  update: (
    id: number,
    payload: Partial<{
      label: string;
      name: string;
      phone: string;
      governorate_id: number;
      line: string;
    }>
  ) =>
    apiRequest<{ data: ApiAddress }>(`/addresses/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  setDefault: (id: number) =>
    apiRequest<{ data?: ApiAddress }>(`/addresses/${id}/default`, {
      method: 'POST',
    }),
  remove: (id: number) => apiRequest<{ message?: string }>(`/addresses/${id}`, { method: 'DELETE' }),
};

export const favoritesApi = {
  list: (lang?: Lang) =>
    apiRequest<{ data: ApiProduct[]; meta?: { total: number } }>('/favorites', { lang }),
  add: (productId: number) =>
    apiRequest<{ message?: string }>(`/favorites/${productId}`, { method: 'POST' }),
  remove: (productId: number) =>
    apiRequest<{ message?: string }>(`/favorites/${productId}`, { method: 'DELETE' }),
};

export const notificationsApi = {
  list: (unreadOnly = false, lang?: Lang) =>
    apiRequest<{ data: ApiNotification[]; meta: ApiNotificationsMeta }>(
      `/notifications${unreadOnly ? '?unread=1' : ''}`,
      { lang }
    ),
  unreadCount: () =>
    apiRequest<{ data?: { unread: number }; unread?: number }>('/notifications/unread-count'),
  markRead: (id: string) =>
    apiRequest<{ message?: string }>(`/notifications/${encodeURIComponent(id)}/read`, {
      method: 'POST',
    }),
  markAllRead: () =>
    apiRequest<{ message?: string }>('/notifications/read-all', { method: 'POST' }),
};
