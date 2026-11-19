import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  User as UserIcon,
  Phone,
  Mail,
  ShoppingBag,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Home as HomeIcon,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Copy,
  AlertCircle,
  Timer,
  Check,
  X,
  Tag,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { useCart, cartCount } from '../store/cart';
import { useAuth } from '../store/auth';
import { useStorefront } from '../store/storefront';
import {
  checkoutApi,
  extractErrorMessage,
  getProductFallbackImage,
  resolveProductImage,
  type ApiCouponValidation,
  type ApiError,
  type ApiOrder,
  type CheckoutGuestPayload,
  type CheckoutSavedAddressPayload,
} from '../lib/api';
import { useLang } from '../lib/lang';
import { egp } from '../lib/utils';
import { ZigZagBand, BaladiCatEmblem, BaladiDogEmblem } from '../components/brand/Ornaments';
import ShippingZoneSelect from '../components/ui/ShippingZoneSelect';
import { PORTER_CONFIG } from '../lib/shipping';

const GRACE_PERIOD_SECONDS = 10;

interface PendingCheckoutSnapshot {
  payload: CheckoutGuestPayload | CheckoutSavedAddressPayload;
  preview: {
    recipientName: string;
    phone: string;
    addressSummary: string;
    governorateName: string;
    paymentMethod: 'cod' | 'online';
    shippingFee: number;
    discount: number;
    total: number;
  };
}

export default function CheckoutPage() {
  const { t, lang } = useLang();
  const isRtl = lang === 'ar';

  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal);
  const fetchCart = useCart((s) => s.fetchCart);
  const totalItems = cartCount(items);

  const governorates = useStorefront((s) => s.governorates);
  const settings = useStorefront((s) => s.settings);
  const catalogProducts = useStorefront((s) => s.products);

  const { user, isAuthenticated, addresses, fetchOrders, fetchNotifications, fetchUnreadCount } = useAuth();

  // Form states
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'custom'>('custom');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [governorateId, setGovernorateId] = useState<number>(0);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [notes, setNotes] = useState('');

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<ApiCouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<ApiOrder | null>(null);

  // ── 10-SECOND CONFIRMATION GRACE PERIOD STATE ────────────────
  const [gracePeriodActive, setGracePeriodActive] = useState(false);
  const [graceSeconds, setGraceSeconds] = useState(GRACE_PERIOD_SECONDS);
  const [pendingSnapshot, setPendingSnapshot] = useState<PendingCheckoutSnapshot | null>(null);
  const [copiedOrderNum, setCopiedOrderNum] = useState(false);
  const [cancelNotice, setCancelNotice] = useState<string | null>(null);

  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingOrderRef = useRef<PendingCheckoutSnapshot | null>(null);
  const isGraceActiveRef = useRef(false);
  const isFinalizingRef = useRef(false);

  // Live Shipping quote from Panther Express / backend
  const [liveShippingQuote, setLiveShippingQuote] = useState<{
    cost: number;
    source: string;
  } | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  // Set default governorate once loaded
  useEffect(() => {
    if (!governorateId && governorates.length > 0) {
      setGovernorateId(governorates[0].id);
    }
  }, [governorates, governorateId]);

  // Pre-fill authenticated customer contact details and default address
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setFullName((prev) => prev || user.name || '');
    setPhone((prev) => prev || user.phone || '');
    setEmail((prev) => prev || user.email || '');

    if (addresses.length > 0) {
      setSelectedAddressId((prev) => {
        if (typeof prev === 'number' && addresses.some((a) => a.id === prev)) {
          return prev;
        }
        const def = addresses.find((a) => a.is_default) ?? addresses[0];
        return def.id;
      });
    }
  }, [isAuthenticated, user, addresses]);

  // Re-validate coupon if subtotal changes while applied
  useEffect(() => {
    if (!appliedCoupon || subtotal <= 0) return;
    let active = true;
    checkoutApi
      .validateCoupon(appliedCoupon.code, subtotal, lang)
      .then((res) => {
        if (active) setAppliedCoupon(res.data);
      })
      .catch(() => {
        if (active) {
          setAppliedCoupon(null);
          setCouponError(t('الكوبون لم يعد سارياً على المجموع الحالي', 'Coupon is no longer valid for this subtotal'));
        }
      });
    return () => {
      active = false;
    };
  }, [subtotal, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeSavedAddress =
    isAuthenticated && typeof selectedAddressId === 'number'
      ? addresses.find((a) => a.id === selectedAddressId) ?? null
      : null;

  const activeGov = activeSavedAddress
    ? governorates.find((g) => g.id === activeSavedAddress.governorate_id) ?? governorates[0]
    : governorates.find((g) => g.id === governorateId) ?? governorates[0];

  // Fetch live delivery quote from backend (Panther Express / Delivery Cost API)
  useEffect(() => {
    if (!activeGov?.id) return;
    let active = true;
    setIsLoadingShipping(true);
    checkoutApi
      .getDeliveryCost(activeGov.id, subtotal, lang)
      .then((res) => {
        if (active && res.data) {
          setLiveShippingQuote({
            cost: typeof res.data.shipping_cost === 'number' ? res.data.shipping_cost : activeGov.shipping_cost,
            source: res.data.source || 'panther',
          });
        }
      })
      .catch(() => {
        if (active) {
          setLiveShippingQuote({
            cost: activeGov.shipping_cost,
            source: activeGov.source || 'panther',
          });
        }
      })
      .finally(() => {
        if (active) setIsLoadingShipping(false);
      });

    return () => {
      active = false;
    };
  }, [activeGov?.id, subtotal, lang]);

  const freeThreshold = settings?.free_shipping_threshold ?? 0;
  const isFreeShipping = freeThreshold > 0 && subtotal >= freeThreshold;
  const resolvedCost = liveShippingQuote !== null ? liveShippingQuote.cost : (activeGov?.shipping_cost ?? 0);
  const shippingFee = items.length > 0 && activeGov ? (isFreeShipping ? 0 : resolvedCost) : 0;
  const discountAmount = appliedCoupon?.discount ?? 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const displayGraceSeconds = Math.max(1, graceSeconds);
  const graceProgressPercent = Math.max(
    0,
    Math.min(100, (Math.max(0, graceSeconds) / GRACE_PERIOD_SECONDS) * 100)
  );

  const clearCountdownTimer = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code || couponLoading) return;
    setCouponError(null);
    setCouponLoading(true);
    try {
      const res = await checkoutApi.validateCoupon(code, subtotal, lang);
      setAppliedCoupon(res.data);
      setCouponInput(res.data.code);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(extractErrorMessage(err, t('كود الخصم غير صالح أو منتهي', 'Invalid or expired coupon code')));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput('');
  };

  const validate = () => {
    if (activeSavedAddress) {
      setErrors({});
      return true;
    }

    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = isRtl ? 'الاسم بالكامل مطلوب' : 'Full name is required';
    }
    if (!phone.trim()) {
      errs.phone = isRtl ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    } else if (phone.trim().length < 10) {
      errs.phone = isRtl ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
    }
    if (!activeGov) {
      errs.governorate = isRtl ? 'اختر منطقة الشحن والتوصيل' : 'Select a shipping area';
    }
    if (!address.trim()) {
      errs.address = isRtl ? 'العنوان بالتفصيل مطلوب' : 'Detailed address is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isFinalizingRef.current || isGraceActiveRef.current || gracePeriodActive) {
      return;
    }
    setSubmitError(null);
    if (!validate()) return;

    const govName = activeGov
      ? (lang === 'ar' ? activeGov.name_ar || activeGov.name : activeGov.name_en || activeGov.name)
      : '';

    const payload: CheckoutGuestPayload | CheckoutSavedAddressPayload = activeSavedAddress
      ? {
          address_id: activeSavedAddress.id,
          payment_method: paymentMethod,
          coupon_code: appliedCoupon?.code ?? null,
          notes: notes.trim() || undefined,
        }
      : {
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          governorate_id: Number(activeGov?.id ?? governorateId),
          address: address.trim(),
          payment_method: paymentMethod,
          coupon_code: appliedCoupon?.code ?? null,
          notes: notes.trim() || undefined,
        };

    const snapshot: PendingCheckoutSnapshot = {
      payload,
      preview: {
        recipientName: activeSavedAddress ? activeSavedAddress.name : fullName.trim(),
        phone: activeSavedAddress ? activeSavedAddress.phone : phone.trim(),
        addressSummary: activeSavedAddress ? activeSavedAddress.full_address || activeSavedAddress.line : address.trim(),
        governorateName: activeSavedAddress ? activeSavedAddress.governorate || govName : govName,
        paymentMethod,
        shippingFee,
        discount: discountAmount,
        total: grandTotal,
      },
    };

    if (cancelNoticeTimerRef.current !== null) {
      clearTimeout(cancelNoticeTimerRef.current);
      cancelNoticeTimerRef.current = null;
    }

    pendingOrderRef.current = snapshot;
    isFinalizingRef.current = false;
    isGraceActiveRef.current = true;

    setPendingSnapshot(snapshot);
    setGraceSeconds(GRACE_PERIOD_SECONDS);
    setGracePeriodActive(true);
    setCancelNotice(null);
  };

  const finalizeOrder = useCallback(async () => {
    const currentPending = pendingOrderRef.current;
    if (!currentPending || isFinalizingRef.current) return;

    clearCountdownTimer();
    isFinalizingRef.current = true;
    isGraceActiveRef.current = false;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await checkoutApi.placeOrder(currentPending.payload, lang);
      const confirmed = res.data;

      setGracePeriodActive(false);
      setPlacedOrder(confirmed);
      pendingOrderRef.current = null;
      setPendingSnapshot(null);

      await fetchCart();
      if (isAuthenticated) {
        void Promise.all([
          fetchOrders(lang),
          fetchNotifications(lang),
          fetchUnreadCount(),
        ]);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setGracePeriodActive(false);
      pendingOrderRef.current = null;
      setPendingSnapshot(null);

      const apiErr = err as ApiError;
      if (apiErr?.errors) {
        const mapped: Record<string, string> = {};
        if (apiErr.errors.name?.[0]) mapped.fullName = apiErr.errors.name[0];
        if (apiErr.errors.phone?.[0]) mapped.phone = apiErr.errors.phone[0];
        if (apiErr.errors.address?.[0]) mapped.address = apiErr.errors.address[0];
        if (apiErr.errors.governorate_id?.[0]) mapped.governorate = apiErr.errors.governorate_id[0];
        if (Object.keys(mapped).length > 0) setErrors(mapped);
      }

      setSubmitError(
        extractErrorMessage(
          err,
          t('تعذر إتمام الطلب، برجاء مراجعة البيانات والمحاولة مرة أخرى', 'Could not place order. Please review your details and try again.')
        )
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      isFinalizingRef.current = false;
      setIsSubmitting(false);
      setGraceSeconds(GRACE_PERIOD_SECONDS);
    }
  }, [clearCountdownTimer, fetchCart, fetchNotifications, fetchOrders, fetchUnreadCount, isAuthenticated, lang, t]);

  const finalizeOrderRef = useRef(finalizeOrder);
  useEffect(() => {
    finalizeOrderRef.current = finalizeOrder;
  }, [finalizeOrder]);

  useEffect(() => {
    if (!gracePeriodActive) {
      clearCountdownTimer();
      return;
    }

    const timer = setInterval(() => {
      setGraceSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    countdownTimerRef.current = timer;

    return () => {
      clearInterval(timer);
      if (countdownTimerRef.current === timer) {
        countdownTimerRef.current = null;
      }
    };
  }, [gracePeriodActive, clearCountdownTimer]);

  useEffect(() => {
    if (
      gracePeriodActive &&
      graceSeconds <= 0 &&
      isGraceActiveRef.current &&
      pendingOrderRef.current &&
      !isFinalizingRef.current
    ) {
      void finalizeOrderRef.current();
    }
  }, [gracePeriodActive, graceSeconds]);

  useEffect(() => {
    return () => {
      clearCountdownTimer();
      isGraceActiveRef.current = false;
      if (cancelNoticeTimerRef.current !== null) clearTimeout(cancelNoticeTimerRef.current);
      if (copyNoticeTimerRef.current !== null) clearTimeout(copyNoticeTimerRef.current);
    };
  }, [clearCountdownTimer]);

  const cancelGracePeriod = useCallback(() => {
    if (isFinalizingRef.current) return;

    clearCountdownTimer();
    isGraceActiveRef.current = false;
    pendingOrderRef.current = null;

    setGracePeriodActive(false);
    setGraceSeconds(GRACE_PERIOD_SECONDS);
    setPendingSnapshot(null);
    setIsSubmitting(false);
    setCancelNotice(
      isRtl
        ? 'تم إيقاف تأكيد الطلب بنجاح. بياناتك وسلتك محفوظة ويمكنك تعديلها الآن.'
        : 'Order confirmation paused. Your cart and details remain intact for editing.'
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (cancelNoticeTimerRef.current !== null) clearTimeout(cancelNoticeTimerRef.current);
    cancelNoticeTimerRef.current = setTimeout(() => {
      setCancelNotice(null);
      cancelNoticeTimerRef.current = null;
    }, 6000);
  }, [clearCountdownTimer, isRtl]);

  const copyOrderNumber = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedOrderNum(true);
    if (copyNoticeTimerRef.current !== null) clearTimeout(copyNoticeTimerRef.current);
    copyNoticeTimerRef.current = setTimeout(() => {
      setCopiedOrderNum(false);
      copyNoticeTimerRef.current = null;
    }, 2500);
  };

  // ── ORDER SUCCESS CONFIRMATION VIEW ────────────────────────
  if (placedOrder) {
    const whatsappDigits = (settings?.whatsapp || settings?.store_phone || '201000000000').replace(/[^\d]/g, '');

    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-white px-4 py-16 pt-[68px] md:pt-[84px]">
        <div className="w-full max-w-3xl rounded-[36px] border hairline bg-white p-6 text-center shadow-2xl sm:p-12">
          <div className="mx-auto mb-5 grid h-20 w-20 animate-bounce place-items-center rounded-full bg-baladi-green/15 text-baladi-green">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-baladi-yellow/20 px-4 py-1.5 text-xs font-black text-baladi-ink">
            <Sparkles className="h-4 w-4 text-baladi-red" />
            {t('تم تسجيل طلبك بنجاح!', 'Order Placed Successfully!')}
          </div>

          <h1 className="t-display text-2xl text-ink sm:text-3xl">
            {t('شكراً لاختيارك طعام بلدي', 'Thank you for choosing Baladi')}
          </h1>

          {/* Order Number & Status Card */}
          <div className="mt-8 overflow-hidden rounded-3xl border-2 border-baladi-green/30 bg-emerald-50/40 p-5 text-start shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-baladi-green/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-baladi-green text-white">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-ink">
                    {t('بانثر إكسبريس للشحن السريع', 'Panther Express Egypt')}
                  </h3>
                  <p className="text-[11px] font-bold text-baladi-green">
                    {t('حالة الطلب الحالية:', 'Current Status:')} {placedOrder.status_label}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-black text-ink shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-baladi-green" />
                <span>{placedOrder.status_label}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-xs font-bold text-ink/80 sm:grid-cols-2">
              <div className="rounded-2xl border hairline bg-white p-3.5">
                <span className="block text-[11px] font-extrabold text-ink/60">
                  {t('رقم الطلب', 'Order Number')}
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-baladi-red">
                    {placedOrder.order_number}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyOrderNumber(placedOrder.order_number)}
                    className="inline-flex items-center gap-1 rounded-lg bg-cream px-2 py-1 text-[11px] font-black text-ink transition-colors hover:bg-baladi-yellow/40"
                  >
                    {copiedOrderNum ? <Check className="h-3.5 w-3.5 text-baladi-green" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedOrderNum ? t('تم النسخ', 'Copied') : t('نسخ', 'Copy')}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border hairline bg-white p-3.5">
                <span className="block text-[11px] font-extrabold text-ink/60">
                  {t('عنوان التسليم', 'Delivery Address')}
                </span>
                <span className="mt-1 block text-xs font-black text-ink">
                  {placedOrder.customer_name} — {placedOrder.customer_address}
                </span>
              </div>
            </div>

            {/* Order Items */}
            {placedOrder.items?.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-baladi-green/20 pt-4">
                {placedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-bold text-ink/85">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-black text-ink">{egp(item.total, lang)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mx-auto mt-6 max-w-md space-y-2.5 rounded-2xl border hairline bg-cream/40 p-5 text-start shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-ink/80">
              <span>{t('المجموع الفرعي', 'Subtotal')}</span>
              <span>{egp(placedOrder.subtotal, lang)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-ink/80">
              <span>{t('الشحن', 'Shipping')}</span>
              <span>{placedOrder.shipping_cost === 0 ? t('مجاني', 'Free') : egp(placedOrder.shipping_cost, lang)}</span>
            </div>
            {placedOrder.discount > 0 && (
              <div className="flex items-center justify-between text-xs font-bold text-baladi-green">
                <span>{t('الخصم', 'Discount')}</span>
                <span>-{egp(placedOrder.discount, lang)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t hairline pt-2 text-sm font-black text-ink">
              <span>{t('الإجمالي النهائي', 'Final Total')}</span>
              <span className="text-baladi-red">{egp(placedOrder.total, lang)}</span>
            </div>
            <div className="flex items-center justify-between border-t hairline pt-2 text-xs font-bold text-ink/80">
              <span>{t('طريقة الدفع', 'Payment Method')}</span>
              <span className="font-black text-baladi-green">
                {placedOrder.payment_method === 'online'
                  ? t('دفع إلكتروني', 'Online Payment')
                  : t('الدفع عند الاستلام', 'Cash on Delivery')}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link
              to={`/track?order=${encodeURIComponent(placedOrder.order_number)}`}
              className="btn btn-ink text-sm font-black"
            >
              {t('تتبع حالة الطلب', 'Track Order Status')}
            </Link>
            {isAuthenticated && (
              <Link to="/profile?tab=orders" className="btn btn-ghost text-sm font-black">
                {t('طلباتي في الحساب', 'My Orders')}
              </Link>
            )}
            <a
              href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                t(
                  `مرحباً بلدي، استفسار بخصوص الطلب رقم ${placedOrder.order_number}`,
                  `Hello Baladi, inquiry regarding order ${placedOrder.order_number}`
                )
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-yellow text-sm font-black"
            >
              {t('تواصل عبر واتساب بلدي', 'Chat via WhatsApp')}
            </a>
            <Link to="/" className="btn btn-ghost text-sm font-bold">
              {t('العودة للرئيسية', 'Back to Home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── EMPTY CART VIEW ─────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-white px-4 py-16 pt-[68px] md:pt-[84px]">
        <div className="w-full max-w-lg rounded-[32px] border hairline bg-white p-10 text-center shadow-md">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-ink/40">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-ink">{t('سلتك فارغة', 'Your bag is empty')}</h1>
          <p className="mt-2 text-sm font-medium text-ink/70">
            {t('أضف منتجات إلى سلتك أولاً لتتمكن من إتمام الطلب.', 'Add products to your cart before proceeding to checkout.')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/cats" className="btn btn-accent theme-cat inline-flex items-center gap-2">
              <BaladiCatEmblem size={18} color="currentColor" />
              <span>{t('عالم القطط', 'Cats World')}</span>
            </Link>
            <Link to="/dogs" className="btn btn-accent theme-dog inline-flex items-center gap-2">
              <BaladiDogEmblem size={18} color="currentColor" />
              <span>{t('عالم الكلاب', 'Dogs World')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN DEDICATED CHECKOUT PAGE ────────────────────────────
  return (
    <div className="relative min-h-[90vh] bg-white pb-16 pt-[68px] md:pt-[84px]">
      {/* ── 10-SECOND ORDER CONFIRMATION GRACE PERIOD MODAL ── */}
      {gracePeriodActive && pendingSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[36px] border-2 border-baladi-yellow bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200 sm:p-8">
            <div className="pointer-events-none absolute -end-24 -top-24 h-48 w-48 rounded-full bg-baladi-yellow/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -start-24 h-48 w-48 rounded-full bg-baladi-red/15 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-black text-amber-900">
                <Timer className="h-4 w-4 animate-spin text-baladi-red" style={{ animationDuration: '3s' }} />
                <span>{t('مهلة مراجعة وتأكيد الطلب (10 ثوانٍ)', 'Order Review & Grace Period (10s)')}</span>
              </div>

              <div className="relative mx-auto my-3 flex h-28 w-28 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#F2E6D5" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#E84249"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="276.46"
                    strokeDashoffset={276.46 - (276.46 * Math.max(0, graceSeconds)) / GRACE_PERIOD_SECONDS}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-3xl font-black tabular-nums text-ink">{displayGraceSeconds}</span>
                  <span className="text-[10px] font-extrabold text-ink/60">{t('ثوانٍ', 'sec')}</span>
                </div>
              </div>

              <h2 className="t-display text-xl text-ink sm:text-2xl">
                {t('جاري مراجعة واعتماد طلبك...', 'Confirming your order...')}
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-xs font-semibold leading-relaxed text-ink/75 sm:text-sm">
                {t(
                  'أمامك 10 ثوانٍ لمراجعة الطلب قبل إرساله نهائياً. يمكنك الإلغاء فوراً إذا كنت ترغب بتعديل البيانات أو السلة.',
                  'You have 10 seconds to review before finalizing your order. You can cancel now to edit your info or cart.'
                )}
              </p>

              <div className="mt-5 space-y-1.5 rounded-2xl border hairline bg-cream/50 p-4 text-start text-xs font-bold text-ink/80">
                <div className="flex justify-between border-b hairline pb-2">
                  <span className="text-ink/60">{t('المستلم:', 'Recipient:')}</span>
                  <span className="font-black text-ink">
                    {pendingSnapshot.preview.recipientName} ({pendingSnapshot.preview.phone})
                  </span>
                </div>
                <div className="flex justify-between border-b hairline py-1.5">
                  <span className="text-ink/60">{t('العنوان:', 'Address:')}</span>
                  <span className="max-w-[240px] truncate text-ink">
                    {pendingSnapshot.preview.addressSummary}
                    {pendingSnapshot.preview.governorateName ? ` · ${pendingSnapshot.preview.governorateName}` : ''}
                  </span>
                </div>
                <div className="flex justify-between border-b hairline py-1.5">
                  <span className="text-ink/60">{t('الدفع:', 'Payment:')}</span>
                  <span className="font-black text-baladi-green">
                    {pendingSnapshot.preview.paymentMethod === 'online'
                      ? t('دفع إلكتروني', 'Online')
                      : t('الدفع عند الاستلام', 'Cash on Delivery')}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-ink/60">{t('الإجمالي النهائي:', 'Total:')}</span>
                  <span className="text-sm font-black text-baladi-red">{egp(pendingSnapshot.preview.total, lang)}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={cancelGracePeriod}
                  disabled={isSubmitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-baladi-red/40 bg-white px-4 py-3.5 text-xs font-black text-baladi-red transition-all hover:bg-baladi-red/5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  <span>{t('إلغاء الطلب والتعديل', 'Cancel Order & Edit')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => void finalizeOrder()}
                  disabled={isSubmitting}
                  className="relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-ink px-4 py-3.5 text-xs font-black text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 start-0 bg-baladi-green transition-all duration-1000 ease-linear"
                    style={{ width: `${isSubmitting ? 100 : graceProgressPercent}%` }}
                  />
                  <span className="relative z-10 inline-flex items-center justify-center gap-2 tabular-nums">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>
                      {isSubmitting
                        ? t('جاري الإرسال...', 'Dispatching...')
                        : t(`تأكيد الطلب الآن · ${displayGraceSeconds} ث`, `Confirm Order · ${displayGraceSeconds}s`)}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Notification Banner */}
      {cancelNotice && (
        <div className="u-container mb-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between rounded-2xl border border-baladi-yellow bg-amber-50 p-4 text-xs font-black text-amber-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 text-baladi-red" />
              <span>{cancelNotice}</span>
            </div>
            <button type="button" onClick={() => setCancelNotice(null)} className="text-amber-800 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* API Error Banner */}
      {submitError && (
        <div className="u-container mb-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between rounded-2xl border border-baladi-red/40 bg-red-50 p-4 text-xs font-black text-baladi-red shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{submitError}</span>
            </div>
            <button type="button" onClick={() => setSubmitError(null)} className="hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="border-b hairline bg-white/70 py-4">
        <div className="u-container flex items-center gap-2 text-xs font-bold text-ink/70">
          <Link to="/" className="hover:text-ink">{t('الرئيسية', 'Home')}</Link>
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          <Link to="/cart" className="hover:text-ink">{t('السلة', 'Cart')}</Link>
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          <span className="font-black text-ink">{t('إتمام الطلب', 'Checkout')}</span>
        </div>
      </div>

      <div className="u-container py-10">
        <div className="mb-8 text-start">
          <p className="t-eyebrow text-baladi-red">{t('خطوة الشحن والدفع', 'SHIPPING & PAYMENT')}</p>
          <h1 className="t-display mt-2 text-[clamp(2rem,4.4vw,3.2rem)] text-ink">
            {t('إتمام وتأكيد الطلب', 'Complete Your Order')}
          </h1>
          <p className="mt-2 text-sm font-medium text-ink/70">
            {t('يرجى كتابة عنوان التوصيل وبيانات المستلم بعناية لضمان سرعة وصول الشحنة.', 'Please provide your shipping and contact details for prompt delivery.')}
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* ── LEFT: SHIPPING INFORMATION FORM (7 cols) ─────── */}
          <div className="rounded-[32px] border hairline bg-white p-6 text-start shadow-sm sm:p-8 lg:col-span-7">
            <div className="flex items-center gap-3 border-b hairline pb-5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-baladi-red/10 text-baladi-red">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black leading-tight text-ink">
                  {t('بيانات الشحن والتوصيل', 'Shipping Information')}
                </h2>
                <p className="text-xs font-semibold text-ink/70">
                  {t('اختر عنواناً محفوظاً أو أدخل عنوان التوصيل يدوياً', 'Pick a saved address or enter delivery details')}
                </p>
              </div>
            </div>

            {/* ── SAVED ADDRESSES 1-CLICK SELECTOR ── */}
            {isAuthenticated && addresses.length > 0 && (
              <div className="mt-5 rounded-2xl border hairline bg-cream/40 p-4 shadow-xs">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[13px] font-black text-ink">
                    <HomeIcon className="h-4 w-4 text-baladi-yellow" />
                    {t('عناوينك المحفوظة (اختر بنقرة واحدة):', 'Saved Addresses (Pick in 1-click):')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedAddressId('custom')}
                    className="text-[11.5px] font-black text-baladi-red hover:underline"
                  >
                    {selectedAddressId === 'custom' ? t('✓ إدخال يدوي', '✓ Manual entry') : t('+ عنوان يدوي جديد', '+ Use another address')}
                  </button>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`group flex items-start gap-3 rounded-2xl border p-3 text-start transition-all ${
                          isSelected
                            ? 'border-baladi-green bg-baladi-green/10 shadow-sm'
                            : 'border-ink/10 bg-white hover:border-ink/30'
                        }`}
                      >
                        <div
                          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                            isSelected ? 'bg-baladi-green text-white' : 'bg-ink/10 text-ink/60 group-hover:bg-ink/20'
                          }`}
                        >
                          {isSelected ? '✓' : '📍'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-black text-ink">{addr.label}</p>
                          <p className="truncate text-[11.5px] font-semibold text-ink/75">
                            {addr.name} · {addr.governorate}
                          </p>
                          <p className="truncate text-[10.5px] text-ink/60">{addr.line}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form id="checkout-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!activeSavedAddress ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-black uppercase text-ink/80">
                      {t('الاسم بالكامل *', 'Full Name *')}
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute start-3.5 top-3.5 h-4 w-4 text-ink/40" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
                        }}
                        placeholder={isRtl ? 'مثال: أحمد محمود' : 'e.g. Ahmed Mahmoud'}
                        className={`w-full rounded-xl border bg-cream/20 py-3 pe-3.5 ps-10 text-[14px] font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 ${
                          errors.fullName ? 'border-red-500 focus:ring-red-200' : 'hairline focus:ring-baladi-yellow'
                        }`}
                      />
                    </div>
                    {errors.fullName && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.fullName}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-black uppercase text-ink/80">
                        {t('رقم الهاتف / الواتساب *', 'Phone Number *')}
                      </label>
                      <div className="relative">
                        <Phone className="absolute start-3.5 top-3.5 h-4 w-4 text-ink/40" />
                        <input
                          type="tel"
                          dir="ltr"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                          }}
                          placeholder="01012345678"
                          className={`w-full rounded-xl border bg-cream/20 py-3 pe-3.5 ps-10 text-[14px] font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 ${
                            errors.phone ? 'border-red-500 focus:ring-red-200' : 'hairline focus:ring-baladi-yellow'
                          }`}
                        />
                      </div>
                      {errors.phone && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[12px] font-black uppercase text-ink/80">
                        {t('البريد الإلكتروني (اختياري)', 'Email (Optional)')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute start-3.5 top-3.5 h-4 w-4 text-ink/40" />
                        <input
                          type="email"
                          dir="ltr"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full rounded-xl border hairline bg-cream/20 py-3 pe-3.5 ps-10 text-[14px] font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-baladi-yellow"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <ShippingZoneSelect
                      zones={governorates}
                      selectedId={activeGov?.id ?? governorateId}
                      onChange={(id) => {
                        setGovernorateId(id);
                        if (errors.governorate) setErrors((p) => ({ ...p, governorate: '' }));
                      }}
                      label={t('منطقة الشحن والتوصيل *', 'Shipping Area / Zone *')}
                      placeholder={t('ابحث بالاسم واختر منطقة التوصيل...', 'Search & select shipping area...')}
                      error={errors.governorate}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-black uppercase text-ink/80">
                      {t('العنوان بالتفصيل *', 'Detailed Address *')}
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors((p) => ({ ...p, address: '' }));
                      }}
                      placeholder={isRtl ? 'المدينة، اسم الشارع، رقم العمارة، رقم الشقة...' : 'City, street name, building, apartment...'}
                      className={`w-full rounded-xl border bg-cream/20 px-3.5 py-3 text-[14px] font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 ${
                        errors.address ? 'border-red-500 focus:ring-red-200' : 'hairline focus:ring-baladi-yellow'
                      }`}
                    />
                    {errors.address && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.address}</p>}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-baladi-green/30 bg-baladi-green/5 p-4 text-xs font-bold text-ink">
                  <p className="text-sm font-black text-ink">
                    {activeSavedAddress.label} — {activeSavedAddress.name}
                  </p>
                  <p className="mt-1 text-ink/80">{activeSavedAddress.full_address || `${activeSavedAddress.line} · ${activeSavedAddress.governorate}`}</p>
                  <p className="mt-1 font-mono text-ink/70">{activeSavedAddress.phone}</p>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="mb-2 block text-[12px] font-black uppercase text-ink/80">
                  {t('طريقة الدفع *', 'Payment Method *')}
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center gap-3 rounded-2xl border p-3.5 text-start transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-baladi-green bg-baladi-green/10 text-ink shadow-xs'
                        : 'border-ink/15 bg-white text-ink/75 hover:border-ink/30'
                    }`}
                  >
                    <Banknote className={`h-5 w-5 shrink-0 ${paymentMethod === 'cod' ? 'text-baladi-green' : 'text-ink/50'}`} />
                    <div>
                      <p className="text-xs font-black text-ink">{t('الدفع عند الاستلام', 'Cash on Delivery')}</p>
                      <p className="text-[11px] font-semibold text-ink/65">{t('نقداً لمندوب التوصيل', 'Pay cash upon delivery')}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="relative flex items-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-cream/30 p-3.5 text-start opacity-60 cursor-not-allowed select-none"
                  >
                    <CreditCard className="h-5 w-5 shrink-0 text-ink/40" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-ink/70">{t('دفع إلكتروني', 'Online Payment')}</p>
                        <span className="rounded-md bg-ink/10 px-1.5 py-0.5 text-[10px] font-extrabold text-ink/70">
                          {t('قريباً', 'Coming Soon')}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-ink/50">
                        {t('غير متوفر حالياً — بطاقة أو محفظة إلكترونية', 'Currently unavailable — Card or wallet')}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="mb-1.5 block text-[12px] font-black uppercase text-ink/80">
                  {t('ملاحظات إضافية للتوصيل (اختياري)', 'Additional Notes (Optional)')}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isRtl ? 'أي تعليمات خاصة بمندوب الشحن أو وقت الاستلام...' : 'Any special notes for delivery or packaging...'}
                  className="w-full rounded-xl border hairline bg-cream/20 px-3.5 py-2.5 text-[13.5px] font-medium text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-baladi-yellow"
                />
              </div>
            </form>
          </div>

          {/* ── RIGHT: ORDER SUMMARY CARD (5 cols) ───────────── */}
          <div className="sticky top-28 rounded-[32px] border hairline bg-white p-6 text-start shadow-sm sm:p-7 lg:col-span-5">
            <div className="flex items-center gap-2.5 border-b hairline pb-4">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-baladi-yellow/20 text-baladi-ink">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-ink">
                {t('ملخص الطلب', 'Order Summary')}
              </h3>
              <span className="ms-auto rounded-full bg-cream px-2.5 py-0.5 text-xs font-black text-ink/80">
                {totalItems} {t('قطع', 'items')}
              </span>
            </div>

            {/* Products Mini List */}
            <div className="my-4 max-h-60 space-y-3 overflow-y-auto pe-1">
              {items.map((item) => {
                const matchedProduct = catalogProducts.find((p) => p.id === item.product_id);
                const species = matchedProduct?.species ?? 'cat';
                const imgSrc = resolveProductImage(item.image ?? matchedProduct?.image, species);
                return (
                  <div key={item.id} className="flex items-center gap-3 rounded-2xl border hairline bg-cream/40 p-2.5">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white p-1">
                      <img
                        src={imgSrc}
                        alt={item.name}
                        className="h-full w-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.src = getProductFallbackImage(species);
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black text-ink">{item.name}</p>
                      <p className="text-[11px] font-semibold text-ink/70">
                        {item.quantity} × {egp(item.price, lang)}
                      </p>
                    </div>
                    <span className="text-xs font-black text-ink">
                      {egp(item.total || item.quantity * item.price, lang)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Validation Box */}
            <div className="my-4 border-t hairline pt-4">
              <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-black uppercase text-ink/75">
                <Tag className="h-3.5 w-3.5 text-baladi-red" />
                <span>{t('كود الخصم', 'Promo / Coupon Code')}</span>
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl border border-baladi-green/30 bg-baladi-green/10 px-3 py-2 text-xs font-black text-baladi-green">
                  <span>
                    {appliedCoupon.code} (-{egp(appliedCoupon.discount, lang)})
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-ink/60 hover:text-baladi-red"
                    aria-label={t('إزالة الكوبون', 'Remove coupon')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      if (couponError) setCouponError(null);
                    }}
                    placeholder="WELCOME10"
                    className="flex-1 rounded-xl border hairline bg-cream/30 px-3 py-2 text-xs font-bold uppercase text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-baladi-yellow"
                  />
                  <button
                    type="button"
                    onClick={() => void handleApplyCoupon()}
                    disabled={couponLoading || !couponInput.trim()}
                    className="rounded-xl bg-ink px-4 py-2 text-xs font-black text-white transition-opacity hover:opacity-90 disabled:opacity-45"
                  >
                    {couponLoading ? '...' : t('تطبيق', 'Apply')}
                  </button>
                </div>
              )}
              {couponError && <p className="mt-1.5 text-[11px] font-bold text-baladi-red">{couponError}</p>}
            </div>

            {/* Subtotal & Shipping breakdown */}
            <div className="space-y-2.5 border-t hairline pt-4 text-xs font-bold">
              <div className="flex justify-between text-ink/80">
                <span>{t('المجموع الفرعي للطلب', 'Subtotal')}</span>
                <span>{egp(subtotal, lang)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-baladi-green">
                  <span>{t('خصم الكوبون', 'Coupon Discount')}</span>
                  <span>-{egp(discountAmount, lang)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink/80">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-baladi-red" />
                  <span>
                    {t('الشحن والتوصيل', 'Shipping')}
                    {activeGov ? ` (${lang === 'ar' ? activeGov.name_ar || activeGov.name : activeGov.name_en || activeGov.name})` : ''}
                  </span>
                </span>
                <span className={isFreeShipping ? 'font-black text-baladi-green' : ''}>
                  {isLoadingShipping ? (
                    <span className="text-[11px] text-ink/40">...</span>
                  ) : isFreeShipping ? (
                    t('مجاني', 'Free')
                  ) : (
                    egp(shippingFee, lang)
                  )}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4 text-xl font-black text-ink">
              <span>{t('الإجمالي النهائي', 'Final Total')}</span>
              <span className="text-baladi-red">{egp(grandTotal, lang)}</span>
            </div>

            <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-baladi-green/20 bg-baladi-green/10 p-3 text-xs font-bold text-baladi-green">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>
                {paymentMethod === 'online'
                  ? t('سيتم تسجيل طلبك للدفع الإلكتروني بأمان', 'Order will be registered for online payment')
                  : t('الدفع نقداً أو بمحفظة كاش عند الاستلام', 'Cash or mobile wallet on delivery')}
              </span>
            </div>

            {/* Submit Action */}
            <div className="mt-6 pt-2">
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || gracePeriodActive}
                className={`btn btn-ink relative w-full overflow-hidden py-4 text-base font-black shadow-lg transition-all hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed ${
                  isSubmitting ? 'opacity-60' : ''
                }`}
              >
                {gracePeriodActive && !isSubmitting && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 start-0 bg-baladi-green transition-all duration-1000 ease-linear"
                    style={{ width: `${graceProgressPercent}%` }}
                  />
                )}
                {isSubmitting ? (
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{t('جاري تسجيل الطلب...', 'Placing order...')}</span>
                  </span>
                ) : gracePeriodActive ? (
                  <span className="relative z-10 inline-flex items-center gap-2 tabular-nums">
                    <Timer className="h-4 w-4 shrink-0 animate-pulse" />
                    <span>{t(`جاري التأكيد · ${displayGraceSeconds} ث`, `Confirming · ${displayGraceSeconds}s`)}</span>
                  </span>
                ) : (
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <span>{t('تأكيد الطلب (مهلة 10 ث)', 'Place Order · 10s grace')}</span>
                    {isRtl ? <ArrowLeft className="h-4 w-4 shrink-0" /> : <ArrowRight className="h-4 w-4 shrink-0" />}
                  </span>
                )}
              </button>

              <div className="mt-4 space-y-1 text-center">
                <p className="text-[11.5px] font-medium italic text-ink/70">
                  {t('شكراً لاختيارك طعام بلدي ❤️', 'Thank you for choosing Baladi ❤️')}
                </p>
                <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-ink/75">
                  <Truck className="h-3.5 w-3.5 text-baladi-red" />
                  {t('توصيل خلال ٢–٤ أيام عمل لجميع المحافظات', 'Delivery in 2–4 working days nationwide')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ZigZagBand color="#FBBB21" height={20} className="opacity-60" />
    </div>
  );
}
