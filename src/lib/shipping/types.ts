/**
 * BALADI E-Commerce — Courier & Shipping Integration Architecture
 * Prepared for Porter Express (بورتر للشحن) and Egyptian courier APIs.
 */

export type ShippingCarrier = 'porter' | 'bosta' | 'mylerz' | 'custom';

export type CourierStatus = 
  | 'pending_pickup'   // تم إنشاء الشحنة وبانتظار استلام مندوب الشحن
  | 'picked_up'        // تم الاستلام من مستودع بلدي
  | 'in_transit'       // الشحنة في الطريق بين المحطات
  | 'out_for_delivery' // الشحنة مع مندوب التوصيل
  | 'delivered'        // تم التسليم بنجاح للعميل
  | 'returned'         // مرتجع
  | 'cancelled';       // تم الإلغاء

export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  governorate: string;
  governorateCode?: string;
  city: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
}

export interface ShippingItemPayload {
  sku: string;
  name: string;
  nameEn?: string;
  quantity: number;
  unitPrice: number;
  weightKg: number;
}

export interface PorterAddressDetails {
  fullName: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  governorate: string;
  governorateCode?: string;
  city: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
}

export interface CreateShipmentPayload {
  orderNumber: string;
  merchantId: string;
  carrier: ShippingCarrier;
  paymentMethod: 'cod' | 'prepaid';
  currency: 'EGP';
  receiver: ShippingAddressInput;
  senderWarehouse: {
    name: string;
    phone: string;
    address: string;
    city: string;
    governorate: string;
  };
  items: ShippingItemPayload[];
  totalWeightKg: number;
  declaredValue: number;
  codAmount: number; // 0 if paid online, order.total if Cash on Delivery
  packageType: 'bag' | 'box';
  specialInstructions?: string;
  isSandbox: boolean;
}

export interface PorterCreateShipmentApiResponse {
  id?: string;
  trackingNumber?: string;
  tracking_number?: string;
  waybillNumber?: string;
  waybill_number?: string;
  awb?: string;
  trackingUrl?: string;
  tracking_url?: string;
  labelUrl?: string;
  label_url?: string;
  status?: string;
  estimatedDeliveryDate?: string;
  estimated_delivery_date?: string;
  message?: string;
}

export interface PorterAuthHeaders extends Record<string, string> {
  'Content-Type': 'application/json';
  Accept: 'application/json';
  Authorization: string;
  'X-Merchant-Id': string;
  'X-Porter-Sandbox': string;
}

export interface ShippingShipmentResult {
  success: boolean;
  carrier: string;
  carrierCode: ShippingCarrier;
  trackingNumber: string;
  waybillNumber: string;
  trackingUrl: string;
  status: CourierStatus;
  statusLabelAr: string;
  statusLabelEn: string;
  estimatedDeliveryDate: string;
  createdAt: string;
  rawResponse?: unknown;
  dispatchedPayload?: CreateShipmentPayload;
}
