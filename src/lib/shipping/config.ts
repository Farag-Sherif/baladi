import type { PorterAuthHeaders } from './types';

/**
 * Porter Express Egypt — Shipping Partner Configuration
 *
 * Plug-and-play live API credentials via Vite environment variables (.env):
 * - VITE_PORTER_API_KEY          Live Bearer token from Porter Express dashboard
 * - VITE_PORTER_API_URL          Base REST URL (default: https://api.porterexpress.eg/v1)
 * - VITE_PORTER_MERCHANT_ID      Merchant identifier (default: GPF-BALADI-STORE)
 * - VITE_PORTER_PROD             Set to "true" to switch from sandbox to live API dispatch
 * - VITE_PORTER_SANDBOX          Optional alternative: set to "false" to enable live mode
 * - VITE_PORTER_WEBHOOK_SECRET   Webhook HMAC secret for courier status callbacks
 * - VITE_PORTER_TRACKING_BASE_URL Public tracking portal base URL
 */

export interface ShippingConfig {
  carrierName: string;
  carrierCode: 'porter';
  apiKey: string;
  apiUrl: string;
  trackingBaseUrl: string;
  merchantId: string;
  isSandbox: boolean;
  webhookSecret: string;
  timeoutMs: number;
  warehouse: {
    name: string;
    phone: string;
    address: string;
    city: string;
    governorate: string;
  };
}

export const PORTER_ENDPOINTS = {
  createShipment: '/shipments',
  trackShipment: (trackingNumber: string) => `/shipments/${encodeURIComponent(trackingNumber)}/track`,
  cancelShipment: (trackingNumber: string) => `/shipments/${encodeURIComponent(trackingNumber)}/cancel`,
} as const;

type ViteEnvMap = Record<string, string | boolean | undefined>;

// Read Vite env safely without requiring global vite/client ambient types
const getEnv = (key: string): string | undefined => {
  try {
    const env = (import.meta as ImportMeta & { env?: ViteEnvMap }).env;
    const raw = env?.[key];
    return typeof raw === 'string' ? raw.trim() || undefined : undefined;
  } catch {
    return undefined;
  }
};

const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, '');

const isLiveModeEnabled = (): boolean => {
  const prodFlag = getEnv('VITE_PORTER_PROD')?.toLowerCase();
  const sandboxFlag = getEnv('VITE_PORTER_SANDBOX')?.toLowerCase();
  return prodFlag === 'true' || sandboxFlag === 'false';
};

export const PORTER_CONFIG: ShippingConfig = {
  carrierName: 'Panther Express Egypt (بانثر إكسبريس للشحن السريع)',
  carrierCode: 'porter',
  // Look for Vite env or fallback to pre-configured sandbox
  apiKey: getEnv('VITE_PORTER_API_KEY') || getEnv('VITE_PANTHER_API_KEY') || 'BLD_PANTHER_SANDBOX_KEY_2026',
  apiUrl: stripTrailingSlash(getEnv('VITE_PORTER_API_URL') || getEnv('VITE_PANTHER_API_URL') || 'https://api.porterexpress.eg/v1'),
  trackingBaseUrl: stripTrailingSlash(getEnv('VITE_PORTER_TRACKING_BASE_URL') || getEnv('VITE_PANTHER_TRACKING_BASE_URL') || 'https://track.porterexpress.eg'),
  merchantId: getEnv('VITE_PORTER_MERCHANT_ID') || getEnv('VITE_PANTHER_MERCHANT_ID') || 'GPF-BALADI-STORE',
  isSandbox: !isLiveModeEnabled(),
  webhookSecret: getEnv('VITE_PORTER_WEBHOOK_SECRET') || getEnv('VITE_PANTHER_WEBHOOK_KEY') || 'whsec_baladi_panther_test',
  timeoutMs: 10000,
  warehouse: {
    name: getEnv('VITE_PORTER_WAREHOUSE_NAME') || 'مستودع بلدي — شركة الجيزة لطعام الحيوانات (GPF)',
    phone: getEnv('VITE_PORTER_WAREHOUSE_PHONE') || '01000000000',
    address: getEnv('VITE_PORTER_WAREHOUSE_ADDRESS') || 'المنطقة الصناعية، الكيلو 28 طريق مصر إسكندرية الصحراوي',
    city: getEnv('VITE_PORTER_WAREHOUSE_CITY') || 'الشيخ زايد / 6 أكتوبر',
    governorate: getEnv('VITE_PORTER_WAREHOUSE_GOVERNORATE') || 'الجيزة',
  },
};

export const PANTHER_CONFIG = PORTER_CONFIG;

/**
 * Verifies whether live Porter Express credentials are active and ready for REST dispatch.
 */
export function isPorterLiveReady(config: ShippingConfig = PORTER_CONFIG): boolean {
  return (
    !config.isSandbox &&
    Boolean(config.apiKey) &&
    !config.apiKey.includes('SANDBOX') &&
    Boolean(config.apiUrl) &&
    Boolean(config.merchantId)
  );
}

/**
 * Builds standard HTTP headers expected by the Porter Express REST API.
 */
export function buildPorterAuthHeaders(config: ShippingConfig = PORTER_CONFIG): PorterAuthHeaders {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
    'X-Merchant-Id': config.merchantId,
    'X-Porter-Sandbox': String(config.isSandbox),
  };
}
