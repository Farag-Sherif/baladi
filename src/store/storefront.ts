import { create } from 'zustand';
import {
  catalogApi,
  contentApi,
  checkoutApi,
  extractErrorMessage,
  localizedFallback,
  type ApiProduct,
  type ApiCategory,
  type ApiFaq,
  type ApiStorySection,
  type ApiSettings,
  type ApiGovernorate,
} from '../lib/api';
import type { Lang } from '../lib/lang';

interface StorefrontState {
  products: ApiProduct[];
  productDetails: Record<string, ApiProduct>;
  categories: ApiCategory[];
  faqs: ApiFaq[];
  story: ApiStorySection[];
  settings: ApiSettings | null;
  governorates: ApiGovernorate[];
  loadedLang: Lang | null;
  isLoadingCatalog: boolean;
  isLoadingContent: boolean;
  isLoadingGovernorates: boolean;
  error: string | null;

  initStorefront: (lang: Lang, force?: boolean) => Promise<void>;
  fetchCatalog: (lang: Lang) => Promise<void>;
  fetchProductBySlug: (slug: string, lang: Lang) => Promise<ApiProduct | null>;
  fetchGovernorates: (lang: Lang) => Promise<void>;
}

let inFlightPromise: Promise<void> | null = null;
let inFlightLang: Lang | null = null;

export const useStorefront = create<StorefrontState>((set, get) => ({
  products: [],
  productDetails: {},
  categories: [],
  faqs: [],
  story: [],
  settings: null,
  governorates: [],
  loadedLang: null,
  isLoadingCatalog: true,
  isLoadingContent: true,
  isLoadingGovernorates: true,
  error: null,

  initStorefront: async (lang, force = false) => {
    if (!force && get().loadedLang === lang && get().products.length > 0) {
      return;
    }
    if (inFlightPromise && inFlightLang === lang && !force) {
      return inFlightPromise;
    }

    inFlightLang = lang;
    set({
      isLoadingCatalog: true,
      isLoadingContent: true,
      isLoadingGovernorates: true,
      error: null,
    });

    inFlightPromise = (async () => {
      try {
        const [prodRes, catRes, faqRes, storyRes, settingsRes, govRes] = await Promise.all([
          catalogApi.listProducts({ per_page: 50, sort: 'newest' }, lang),
          catalogApi.listCategories(lang),
          contentApi.listFaqs(lang),
          contentApi.getStory(lang),
          contentApi.getSettings(lang),
          checkoutApi.listGovernorates(lang),
        ]);

        const products = prodRes.data || [];
        const detailsMap: Record<string, ApiProduct> = {};
        for (const p of products) {
          detailsMap[p.slug] = p;
        }

        // Only commit if user has not switched language again mid-flight
        if (inFlightLang !== lang) return;

        set({
          products,
          productDetails: detailsMap,
          categories: catRes.data || [],
          faqs: faqRes.data || [],
          story: storyRes.data || [],
          settings: settingsRes.data || null,
          governorates: govRes.data || [],
          loadedLang: lang,
          isLoadingCatalog: false,
          isLoadingContent: false,
          isLoadingGovernorates: false,
          error: null,
        });
      } catch (err) {
        if (inFlightLang !== lang) return;
        set({
          isLoadingCatalog: false,
          isLoadingContent: false,
          isLoadingGovernorates: false,
          error: extractErrorMessage(
            err,
            localizedFallback('تعذر تحميل بيانات المتجر من الخادم', 'Unable to load storefront data from server')
          ),
        });
      } finally {
        if (inFlightLang === lang) {
          inFlightPromise = null;
        }
      }
    })();

    return inFlightPromise;
  },

  fetchCatalog: async (lang) => {
    set({ isLoadingCatalog: true, error: null });
    try {
      const [prodRes, catRes] = await Promise.all([
        catalogApi.listProducts({ per_page: 50, sort: 'newest' }, lang),
        catalogApi.listCategories(lang),
      ]);
      const products = prodRes.data || [];
      const detailsMap: Record<string, ApiProduct> = { ...get().productDetails };
      for (const p of products) {
        detailsMap[p.slug] = p;
      }
      set({
        products,
        productDetails: detailsMap,
        categories: catRes.data || [],
        isLoadingCatalog: false,
      });
    } catch (err) {
      set({
        isLoadingCatalog: false,
        error: extractErrorMessage(err),
      });
    }
  },

  fetchProductBySlug: async (slug, lang) => {
    try {
      const res = await catalogApi.getProductBySlug(slug, lang);
      const product = res.data;
      set((s) => ({
        productDetails: { ...s.productDetails, [product.slug]: product },
      }));
      return product;
    } catch {
      return null;
    }
  },

  fetchGovernorates: async (lang) => {
    set({ isLoadingGovernorates: true });
    try {
      const res = await checkoutApi.listGovernorates(lang);
      set({ governorates: res.data || [], isLoadingGovernorates: false });
    } catch {
      set({ isLoadingGovernorates: false });
    }
  },
}));
