import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Lock,
  Clock,
  RotateCcw,
  Copy,
  ExternalLink,
  AlertCircle,
  Timer,
  Check,
  X,
} from 'lucide-react';
import { useCart, cartTotal, cartCount } from '../store/cart';
import { useAuth, type Order, type UserAddress } from '../store/auth';
import { useLang } from '../lib/lang';
import { egp } from '../lib/utils';
import { ZigZagBand, FolkloricStarBadge, GpfBadge, BaladiCatEmblem, BaladiDogEmblem } from '../components/brand/Ornaments';
import { dispatchOrderToPorter, getEstimatedDeliveryDays, PORTER_CONFIG } from '../lib/shipping';

export const EGYPT_GOVERNORATES: { ar: string; en: string; fee: number }[] = [
  { ar: 'القاهرة', en: 'Cairo', fee: 50 },
  { ar: 'الجيزة', en: 'Giza', fee: 50 },
  { ar: 'الإسكندرية', en: 'Alexandria', fee: 65 },
  { ar: 'القليوبية', en: 'Qalyubia', fee: 55 },
  { ar: 'الشرقية', en: 'Sharqia', fee: 65 },
  { ar: 'الدقهلية', en: 'Dakahlia', fee: 70 },
  { ar: 'الغربية', en: 'Gharbia', fee: 70 },
  { ar: 'المنوفية', en: 'Monufia', fee: 65 },
  { ar: 'البحيرة', en: 'Beheira', fee: 75 },
  { ar: 'كفر الشيخ', en: 'Kafr El Sheikh', fee: 75 },
  { ar: 'دمياط', en: 'Damietta', fee: 70 },
  { ar: 'بورسعيد', en: 'Port Said', fee: 70 },
  { ar: 'الإسماعيلية', en: 'Ismailia', fee: 70 },
  { ar: 'السويس', en: 'Suez', fee: 70 },
  { ar: 'الفيوم', en: 'Fayoum', fee: 75 },
  { ar: 'بني سويف', en: 'Beni Suef', fee: 80 },
  { ar: 'المنيا', en: 'Minya', fee: 85 },
  { ar: 'أسيوط', en: 'Assiut', fee: 85 },
  { ar: 'سوهاج', en: 'Sohag', fee: 90 },
  { ar: 'قنا', en: 'Qena', fee: 90 },
  { ar: 'الأقصر', en: 'Luxor', fee: 95 },
  { ar: 'أسوان', en: 'Aswan', fee: 100 },
  { ar: 'البحر الأحمر', en: 'Red Sea', fee: 110 },
  { ar: 'جنوب سيناء', en: 'South Sinai', fee: 110 },
  { ar: 'مطروح', en: 'Matrouh', fee: 100 },
];

const GRACE_PERIOD_SECONDS = 10;

interface PendingOrderState {
  order: Order;
  addressDetails: {
    fullName: string;
    phone: string;
    email?: string;
    city: string;
    street: string;
    governorate: string;
    governorateCode?: string;
    notes?: string;
  };
}

export default function CheckoutPage() {
  const { t, lang } = useLang();
  const isRtl = lang === 'ar';
  const navigate = useNavigate();

  const { lines, clear } = useCart();
  const { user, isAuthenticated, addresses, addOrder } = useAuth();

  const subtotal = cartTotal(lines);
  const totalItems = cartCount(lines);

  // Form states
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [govIndex, setGovIndex] = useState(0);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // ── 10-SECOND CONFIRMATION GRACE PERIOD STATE ────────────────
  const [gracePeriodActive, setGracePeriodActive] = useState(false);
  const [graceSeconds, setGraceSeconds] = useState(GRACE_PERIOD_SECONDS);
  const [pendingOrderData, setPendingOrderData] = useState<PendingOrderState | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [cancelNotice, setCancelNotice] = useState<string | null>(null);

  // Refs prevent stale closures across countdown ticks, auto-confirm, and manual cancel
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingOrderRef = useRef<PendingOrderState | null>(null);
  const isGraceActiveRef = useRef(false);
  const isFinalizingRef = useRef(false);

  const shippingFee = lines.length > 0 ? EGYPT_GOVERNORATES[govIndex].fee : 0;
  const grandTotal = subtotal + shippingFee;
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

  // Pre-fill user data & saved address if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = user.name.trim().split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');

      if (addresses.length > 0) {
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        if (defaultAddr) applyAddress(defaultAddr);
      } else {
        const idx = EGYPT_GOVERNORATES.findIndex(
          (g) => g.ar === user.governorate || g.en.toLowerCase() === user.governorate.toLowerCase()
        );
        if (idx !== -1) setGovIndex(idx);
        if (user.address) setAddress(user.address);
      }
    }
  }, [isAuthenticated, user, addresses]);

  // Apply saved address
  const applyAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    const idx = EGYPT_GOVERNORATES.findIndex(
      (g) => g.ar === addr.governorate || g.en.toLowerCase() === addr.governorate.toLowerCase()
    );
    if (idx !== -1) setGovIndex(idx);
    setCity(addr.city);
    const fullStreet = addr.street + (addr.building ? `, عمارة ${addr.building}` : '');
    setAddress(fullStreet);

    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.governorate;
      delete updated.city;
      delete updated.address;
      return updated;
    });
  };

  const handleSelectCustomAddress = () => {
    setSelectedAddressId('custom');
    setCity('');
    setAddress('');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) {
      errs.firstName = isRtl ? 'الاسم الأول مطلوب' : 'First name is required';
    }
    if (!phone.trim()) {
      errs.phone = isRtl ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    } else if (phone.trim().length < 10) {
      errs.phone = isRtl ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
    }
    if (!city.trim()) {
      errs.city = isRtl ? 'المدينة / المنطقة مطلوبة' : 'City / Area is required';
    }
    if (!address.trim()) {
      errs.address = isRtl ? 'العنوان بالتفصيل مطلوب' : 'Street address is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Called when user clicks "تأكيد الطلب" -> Triggers 10s Grace Period
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isFinalizingRef.current || isGraceActiveRef.current || gracePeriodActive) {
      return;
    }
    if (!validate()) return;

    const gov = EGYPT_GOVERNORATES[govIndex];
    const orderNumber = `BLD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullRecipientName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      items: lines.map((l) => ({
        id: l.product.id,
        slug: l.product.slug,
        nameAr: l.product.name.ar,
        nameEn: l.product.name.en,
        image: l.product.image,
        price: l.product.price,
        qty: l.qty,
        weight: l.product.weight,
      })),
      subtotal,
      shipping: shippingFee,
      total: grandTotal,
      governorate: isRtl ? gov.ar : gov.en,
      address: `${city} — ${address}${notes ? ` (ملاحظة: ${notes})` : ''} | المستلم: ${fullRecipientName} (${phone})`,
    };

    const addressDetails: PendingOrderState['addressDetails'] = {
      fullName: fullRecipientName,
      phone,
      email: email.trim() || undefined,
      city,
      street: address,
      governorate: isRtl ? gov.ar : gov.en,
      governorateCode: gov.en,
      notes: notes.trim() || undefined,
    };

    if (cancelNoticeTimerRef.current !== null) {
      clearTimeout(cancelNoticeTimerRef.current);
      cancelNoticeTimerRef.current = null;
    }

    const nextPending: PendingOrderState = { order: newOrder, addressDetails };
    pendingOrderRef.current = nextPending;
    isFinalizingRef.current = false;
    isGraceActiveRef.current = true;

    // Activate the 10-second grace period
    setPendingOrderData(nextPending);
    setGraceSeconds(GRACE_PERIOD_SECONDS);
    setGracePeriodActive(true);
    setCancelNotice(null);
  };

  // Finalizes order & dispatches to Porter shipping
  const finalizeOrder = useCallback(async () => {
    const currentPending = pendingOrderRef.current;
    if (!currentPending || isFinalizingRef.current) return;

    clearCountdownTimer();
    isFinalizingRef.current = true;
    isGraceActiveRef.current = false;
    setIsSubmitting(true);
    setGracePeriodActive(false);

    const { order, addressDetails } = currentPending;

    try {
      // Connect to Porter Shipping Integration
      const shipment = await dispatchOrderToPorter(order, addressDetails);

      const confirmedOrder: Order = {
        ...order,
        shippingCarrier: shipment.carrier,
        shippingTrackingNumber: shipment.trackingNumber,
        shippingWaybill: shipment.waybillNumber,
        shippingStatus: shipment.status,
        shippingTrackingUrl: shipment.trackingUrl,
        estimatedDelivery: shipment.estimatedDeliveryDate,
        porterSyncReady: true,
      };

      addOrder(confirmedOrder);
      clear();
      setPlacedOrder(confirmedOrder);
      pendingOrderRef.current = null;
      setPendingOrderData(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Porter dispatch error:', err);
      addOrder(order);
      clear();
      setPlacedOrder(order);
      pendingOrderRef.current = null;
      setPendingOrderData(null);
    } finally {
      isFinalizingRef.current = false;
      setIsSubmitting(false);
      setGraceSeconds(GRACE_PERIOD_SECONDS);
    }
  }, [addOrder, clear, clearCountdownTimer]);

  const finalizeOrderRef = useRef(finalizeOrder);
  useEffect(() => {
    finalizeOrderRef.current = finalizeOrder;
  }, [finalizeOrder]);

  // 10-Second Countdown Interval (single interval while grace period is active)
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

  // Trigger auto-confirm only when countdown reaches 0 and grace period was not cancelled
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

  // Cleanup all active timers if user navigates away during grace period
  useEffect(() => {
    return () => {
      clearCountdownTimer();
      isGraceActiveRef.current = false;
      if (cancelNoticeTimerRef.current !== null) {
        clearTimeout(cancelNoticeTimerRef.current);
      }
      if (copyNoticeTimerRef.current !== null) {
        clearTimeout(copyNoticeTimerRef.current);
      }
    };
  }, [clearCountdownTimer]);

  // User cancels during the 10 seconds
  const cancelGracePeriod = useCallback(() => {
    if (isFinalizingRef.current) return;

    clearCountdownTimer();
    isGraceActiveRef.current = false;
    pendingOrderRef.current = null;

    setGracePeriodActive(false);
    setGraceSeconds(GRACE_PERIOD_SECONDS);
    setPendingOrderData(null);
    setIsSubmitting(false);
    setCancelNotice(
      isRtl
        ? 'تم إيقاف تأكيد الطلب بنجاح. بياناتك وسلتك محفوظة ويمكنك تعديلها الآن.'
        : 'Order confirmation paused. Your cart and details remain intact for editing.'
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (cancelNoticeTimerRef.current !== null) {
      clearTimeout(cancelNoticeTimerRef.current);
    }
    cancelNoticeTimerRef.current = setTimeout(() => {
      setCancelNotice(null);
      cancelNoticeTimerRef.current = null;
    }, 6000);
  }, [clearCountdownTimer, isRtl]);

  const copyTrackingCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedTracking(true);
    if (copyNoticeTimerRef.current !== null) {
      clearTimeout(copyNoticeTimerRef.current);
    }
    copyNoticeTimerRef.current = setTimeout(() => {
      setCopiedTracking(false);
      copyNoticeTimerRef.current = null;
    }, 2500);
  };

  // ── ORDER SUCCESS CONFIRMATION VIEW ────────────────────────
  if (placedOrder) {
    const est = getEstimatedDeliveryDays(placedOrder.governorate);

    return (
      <div className="bg-cream pt-[68px] md:pt-[84px] min-h-[85vh] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-3xl rounded-[36px] border hairline bg-white p-6 sm:p-12 text-center shadow-2xl">
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-baladi-green/15 text-baladi-green animate-bounce">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-baladi-yellow/20 px-4 py-1.5 text-xs font-black text-baladi-ink mb-3">
            <Sparkles className="h-4 w-4 text-baladi-red" />
            {t('تم تأكيد طلبك وإرساله لشركة الشحن بنجاح!', 'Order Confirmed & Sent to Shipping!')}
          </div>

          <h1 className="t-display text-2xl sm:text-3xl text-ink">
            {t('شكراً لاختيارك طعام بلدي', 'Thank you for choosing Baladi')}
          </h1>

          {/* Porter Shipping Card */}
          <div className="mt-8 overflow-hidden rounded-3xl border-2 border-baladi-green/30 bg-emerald-50/40 p-5 sm:p-6 text-start shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-baladi-green/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-baladi-green text-white">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-ink">
                    {t('شركة الشحن:', 'Carrier:')} {placedOrder.shippingCarrier || 'Porter Express Egypt (بورتر)'}
                  </h3>
                  <p className="text-[11px] font-bold text-baladi-green">
                    {t('موعد التوصيل المتوقع:', 'Estimated Delivery:')} {isRtl ? est.labelAr : est.labelEn}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-black text-ink shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-baladi-green" />
                <span>{t('جاهز للربط الفوري (Porter Integration Ready)', 'Porter Integration Ready')}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs font-bold text-ink/80">
              <div className="rounded-2xl bg-white p-3.5 border hairline">
                <span className="block text-[11px] font-extrabold text-ink/60">{t('رقم تتبع الشحنة (Porter Tracking ID)', 'Tracking Number')}</span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-baladi-red">
                    {placedOrder.shippingTrackingNumber || 'PRTR-EG-2026-PENDING'}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyTrackingCode(placedOrder.shippingTrackingNumber || '')}
                    className="inline-flex items-center gap-1 rounded-lg bg-cream px-2 py-1 text-[11px] font-black text-ink hover:bg-baladi-yellow/40 transition-colors"
                  >
                    {copiedTracking ? <Check className="h-3.5 w-3.5 text-baladi-green" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedTracking ? t('تم النسخ', 'Copied') : t('نسخ', 'Copy')}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-3.5 border hairline">
                <span className="block text-[11px] font-extrabold text-ink/60">{t('رقم البوليصة (Waybill)', 'Waybill Number')}</span>
                <span className="mt-1 block font-mono text-sm font-black text-ink">
                  {placedOrder.shippingWaybill || `WB-${placedOrder.orderNumber}`}
                </span>
              </div>
            </div>

            {/* Visual Shipment Timeline */}
            <div className="mt-5 pt-4 border-t border-baladi-green/20">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/60 mb-3">
                {t('مراحل شحن وتوصيل الطلب مع بورتر:', 'Porter Delivery Stages:')}
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { step: '1', labelAr: 'تم التسجيل', labelEn: 'Registered', active: true },
                  { step: '2', labelAr: 'تجهيز المستودع', labelEn: 'Packaging', active: true },
                  { step: '3', labelAr: 'استلام بورتر', labelEn: 'Courier Pickup', active: false },
                  { step: '4', labelAr: 'تم التسليم', labelEn: 'Delivered', active: false },
                ].map((st) => (
                  <div key={st.step} className="flex flex-col items-center">
                    <div
                      className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${
                        st.active ? 'bg-baladi-green text-white shadow' : 'bg-gray-200 text-ink/40'
                      }`}
                    >
                      {st.active ? '✓' : st.step}
                    </div>
                    <span className={`mt-1.5 text-[10.5px] font-extrabold ${st.active ? 'text-baladi-green font-black' : 'text-ink/50'}`}>
                      {isRtl ? st.labelAr : st.labelEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-md rounded-2xl border hairline bg-cream/40 p-5 text-start shadow-sm space-y-2.5">
            <div className="flex items-center justify-between border-b hairline pb-3">
              <span className="text-xs font-bold text-ink/70">{t('رقم الطلب بالمتجر', 'Store Order Number')}</span>
              <span className="font-mono text-sm font-black text-baladi-red">{placedOrder.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-bold text-ink/70">{t('المبلغ الإجمالي عند الاستلام', 'Total Cash on Delivery')}</span>
              <span className="text-base font-black text-ink">{egp(placedOrder.total, lang)}</span>
            </div>
            <div className="flex items-center justify-between border-t hairline pt-2 text-xs font-bold text-ink/80">
              <span>{t('طريقة الدفع', 'Payment Method')}</span>
              <span className="text-baladi-green font-black">{t('الدفع عند الاستلام 💵', 'Cash on Delivery 💵')}</span>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-lg text-[14px] font-medium leading-relaxed text-ink/80">
            {t(
              `سيتواصل معك مندوب شركة بورتر للشحن عبر الواتساب أو الاتصال على (${phone}) لتسليم الشحنة لباب بيتك.`,
              `The Porter delivery courier will reach out via call or WhatsApp at (${phone}) to deliver to your doorstep.`
            )}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link to="/profile" className="btn btn-ink text-sm font-black">
              {t('متابعة الشحنة في حسابي', 'Track in My Account')}
            </Link>
            <a
              href={`https://wa.me/201000000000?text=${encodeURIComponent(
                `مرحباً بلدي، قمت بتأكيد الطلب رقم ${placedOrder.orderNumber} ورقم تتبع الشحن ${placedOrder.shippingTrackingNumber || ''}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-yellow text-sm font-black"
            >
              {t('تأكيد عبر واتساب بلدي', 'Chat via WhatsApp')}
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
  if (lines.length === 0) {
    return (
      <div className="bg-cream pt-[68px] md:pt-[84px] min-h-[80vh] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg rounded-[32px] border hairline bg-white p-10 text-center shadow-md">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-cream text-ink/40">
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
    <div className="relative bg-cream pt-[68px] md:pt-[84px] min-h-[90vh] pb-16">
      {/* ── 10-SECOND ORDER CONFIRMATION GRACE PERIOD MODAL ── */}
      {gracePeriodActive && pendingOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[36px] border-2 border-baladi-yellow bg-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -top-24 -end-24 h-48 w-48 rounded-full bg-baladi-yellow/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -start-24 h-48 w-48 rounded-full bg-baladi-red/15 blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-black text-amber-900 mb-4">
                <Timer className="h-4 w-4 animate-spin text-baladi-red" style={{ animationDuration: '3s' }} />
                <span>{t('مهلة مراجعة وتأكيد الطلب (10 ثوانٍ)', 'Order Review & Grace Period (10s)')}</span>
              </div>

              {/* Animated Countdown Circle Ring */}
              <div className="relative mx-auto my-3 flex h-28 w-28 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#F2E6D5"
                    strokeWidth="8"
                  />
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
                  <span className="font-mono text-3xl font-black text-ink tabular-nums">{displayGraceSeconds}</span>
                  <span className="text-[10px] font-extrabold text-ink/60">{t('ثوانٍ', 'sec')}</span>
                </div>
              </div>

              <h2 className="t-display text-xl sm:text-2xl text-ink">
                {t('جاري مراجعة واعتماد طلبك...', 'Confirming your order...')}
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm font-semibold leading-relaxed text-ink/75">
                {t(
                  'أمامك 10 ثوانٍ لمراجعة الطلب قبل إرساله نهائياً لشركة الشحن (بورتر). يمكنك الإلغاء فوراً إذا كنت ترغب بتعديل البيانات أو السلة.',
                  'You have 10 seconds to review before dispatching to Porter shipping. You can cancel now to edit your info or cart.'
                )}
              </p>

              {/* Order Quick Snapshot */}
              <div className="mt-5 rounded-2xl border hairline bg-cream/50 p-4 text-start text-xs font-bold text-ink/80 space-y-1.5">
                <div className="flex justify-between border-b hairline pb-2">
                  <span className="text-ink/60">{t('المستلم:', 'Recipient:')}</span>
                  <span className="text-ink font-black">{pendingOrderData.addressDetails.fullName} ({pendingOrderData.addressDetails.phone})</span>
                </div>
                <div className="flex justify-between border-b hairline py-1.5">
                  <span className="text-ink/60">{t('العنوان:', 'Address:')}</span>
                  <span className="text-ink truncate max-w-[220px]">{pendingOrderData.addressDetails.city}، {pendingOrderData.addressDetails.governorate}</span>
                </div>
                <div className="flex justify-between border-b hairline py-1.5">
                  <span className="text-ink/60">{t('شركة الشحن:', 'Carrier:')}</span>
                  <span className="text-baladi-green font-black">{PORTER_CONFIG.carrierName}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-ink/60">{t('الإجمالي عند الاستلام:', 'Cash on Delivery:')}</span>
                  <span className="text-sm font-black text-baladi-red">{egp(pendingOrderData.order.total, lang)}</span>
                </div>
              </div>

              {/* Grace Period Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={cancelGracePeriod}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-baladi-red/40 bg-white py-3.5 px-4 text-xs font-black text-baladi-red hover:bg-baladi-red/5 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  <span>{t('إلغاء الطلب والتعديل', 'Cancel Order & Edit')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => void finalizeOrder()}
                  disabled={isSubmitting}
                  className="relative overflow-hidden flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 px-4 text-xs font-black text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
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
              <AlertCircle className="h-5 w-5 text-baladi-red shrink-0" />
              <span>{cancelNotice}</span>
            </div>
            <button onClick={() => setCancelNotice(null)} className="text-amber-800 hover:text-ink">
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
          <span className="text-ink font-black">{t('إتمام الطلب', 'Checkout')}</span>
        </div>
      </div>

      <div className="u-container py-10">
        
        {/* Page Title */}
        <div className="mb-8 text-start">
          <p className="t-eyebrow text-baladi-red">{t('خطوة الشحن والدفع', 'SHIPPING & PAYMENT')}</p>
          <h1 className="t-display mt-2 text-[clamp(2rem,4.4vw,3.2rem)] text-ink">
            {t('إتمام وتأكيد الطلب', 'Complete Your Order')}
          </h1>
          <p className="mt-2 text-sm font-medium text-ink/70">
            {t('يرجى كتابة عنوان التوصيل وبيانات المستلم بعناية لضمان سرعة وصول الشحنة.', 'Please provide your shipping and contact details for prompt delivery.')}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* ── LEFT: SHIPPING INFORMATION FORM (7 cols) ─────── */}
          <div className="lg:col-span-7 rounded-[32px] border hairline bg-white p-6 sm:p-8 shadow-sm text-start">
            
            {/* Header */}
            <div className="flex items-center gap-3 pb-5 border-b hairline">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-baladi-red/10 text-baladi-red">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-ink leading-tight">
                  {t('بيانات الشحن والتوصيل', 'Shipping Information')}
                </h2>
                <p className="text-xs font-semibold text-ink/70">
                  {t('أدخل عنوان وبيانات المستلم لتوصيل الشحنة', 'Enter recipient address and contact details')}
                </p>
              </div>
            </div>

            {/* ── SAVED ADDRESSES 1-CLICK SELECTOR ── */}
            {isAuthenticated && addresses.length > 0 && (
              <div className="mt-5 rounded-2xl border hairline bg-cream/40 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-black text-ink flex items-center gap-1.5">
                    <HomeIcon className="h-4 w-4 text-baladi-yellow" />
                    {t('عناوينك المحفوظة (اختر بنقرة واحدة):', 'Saved Addresses (Pick in 1-click):')}
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectCustomAddress}
                    className="text-[11.5px] font-black text-baladi-red hover:underline"
                  >
                    {selectedAddressId === 'custom' ? t('✓ إدخال يدوي', '✓ Manual entry') : t('+ عنوان يدوي جديد', '+ New custom address')}
                  </button>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => applyAddress(addr)}
                        className={`group flex items-start gap-3 rounded-2xl border p-3 text-start transition-all ${
                          isSelected
                            ? 'border-baladi-green bg-baladi-green/10 shadow-sm'
                            : 'border-ink/10 hover:border-ink/30 bg-white'
                        }`}
                      >
                        <div
                          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                            isSelected ? 'bg-baladi-green text-white' : 'bg-ink/10 text-ink/60 group-hover:bg-ink/20'
                          }`}
                        >
                          {isSelected ? '✓' : addr.title === 'المنزل' || addr.title.toLowerCase() === 'home' ? '🏠' : '🏢'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-black text-ink">{addr.title}</p>
                          <p className="truncate text-[11.5px] font-semibold text-ink/75">
                            {addr.city} · {addr.governorate}
                          </p>
                          <p className="truncate text-[10.5px] text-ink/60">{addr.street}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── FORM INPUTS ── */}
            <form id="checkout-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
              
              {/* Name Row: First Name & Last Name */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-black uppercase text-ink/80 mb-1.5">
                    {t('الاسم الأول *', 'First Name *')}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute start-3.5 top-3.5 h-4 w-4 text-ink/40" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors((p) => ({ ...p, firstName: '' }));
                      }}
                      placeholder={isRtl ? 'مثال: أحمد' : 'e.g. Ahmed'}
                      className={`w-full rounded-xl border bg-cream/20 ps-10 pe-3.5 py-3 text-[14px] font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 ${
                        errors.firstName ? 'border-red-500 focus:ring-red-200' : 'hairline focus:ring-baladi-yellow'
                      }`}
                    />
                  </div>
                  {errors.firstName && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-[12px] font-black uppercase text-ink/80 mb-1.5">
                    {t('اسم العائلة', 'Last Name')}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={isRtl ? 'مثال: محمود' : 'e.g. Mahmoud'}
                    className="w-full rounded-xl border hairline bg-cream/20 px-3.5 py-3 text-[14px] font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-baladi-yellow"
                  />
                </div>
              </div>

              {/* Contact Row: Phone & Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-black uppercase text-ink/80 mb-1.5">
                    {t('رقم الهاتف / الواتساب *', 'Phone Number *')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute start-3.5 top-3.5 h-4 w-4 text-ink/40" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                      }}
                      placeholder="01012345678"
                      className={`w-full rounded-xl border bg-cream/20 ps-10 pe-3.5 py-3 text-[14px] font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 ${
                        errors.phone ? 'border-red-500 focus:ring-red-200' : 'hairline focus:ring-baladi-yellow'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-[12px] font-black uppercase text-ink/80 mb-1.5">
                    {t('البريد الإلكتروني', 'Email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute start-3.5 top-3.5 h-4 w-4 text-ink/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border hairline bg-cream/20 ps-10 pe-3.5 py-3 text-[14px] font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-baladi-yellow"
                    />
                  </div>
                </div>
              </div>

              {/* Location Row: Governorate & City */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-black uppercase text-ink/80 mb-1.5">
                    {t('المحافظة *', 'Governorate *')}
                  </label>
                  <select
                    value={govIndex}
                    onChange={(e) => setGovIndex(Number(e.target.value))}
                    className="w-full rounded-xl border hairline bg-cream/20 px-3.5 py-3 text-[14px] font-bold text-ink focus:outline-none focus:ring-2 focus:ring-baladi-yellow"
                  >
                    {EGYPT_GOVERNORATES.map((g, i) => (
                      <option key={g.en} value={i}>
                        {g[lang]} — {egp(g.fee, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-black uppercase text-ink/80 mb-1.5">
                    {t('المدينة / الحي *', 'City / Area *')}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors((p) => ({ ...p, city: '' }));
                    }}
                    placeholder={isRtl ? 'مثال: مدينة نصر، المعادي، الدقي...' : 'e.g. Nasr City, Maadi...'}
                    className={`w-full rounded-xl border bg-cream/20 px-3.5 py-3 text-[14px] font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 ${
                      errors.city ? 'border-red-500 focus:ring-red-200' : 'hairline focus:ring-baladi-yellow'
                    }`}
                  />
                  {errors.city && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.city}</p>}
                </div>
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-[12px] font-black uppercase text-ink/80 mb-1.5">
                  {t('العنوان بالتفصيل *', 'Detailed Address *')}
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((p) => ({ ...p, address: '' }));
                  }}
                  placeholder={isRtl ? 'اسم الشارع، رقم العمارة، رقم الشقة أو علامة مميزة...' : 'Street name, building, apartment, landmark...'}
                  className={`w-full rounded-xl border bg-cream/20 px-3.5 py-3 text-[14px] font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 ${
                    errors.address ? 'border-red-500 focus:ring-red-200' : 'hairline focus:ring-baladi-yellow'
                  }`}
                />
                {errors.address && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.address}</p>}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-[12px] font-black uppercase text-ink/80 mb-1.5">
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
          <div className="lg:col-span-5 rounded-[32px] border hairline bg-white p-6 sm:p-7 shadow-sm sticky top-28 text-start">
            
            {/* Header */}
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
            <div className="my-4 max-h-60 overflow-y-auto space-y-3 pe-1">
              {lines.map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-2xl bg-cream/40 p-2.5 border hairline">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white p-1">
                    <img src={l.product.image} alt="" className="h-full w-auto object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-ink">{l.product.name[lang]}</p>
                    <p className="text-[11px] font-semibold text-ink/70">
                      {l.qty} × {egp(l.product.price, lang)} · {l.product.weight}
                    </p>
                  </div>
                  <span className="text-xs font-black text-ink">
                    {egp(l.qty * l.product.price, lang)}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotal & Shipping breakdown */}
            <div className="space-y-2.5 border-t hairline pt-4 text-xs font-bold">
              <div className="flex justify-between text-ink/80">
                <span>{t('المجموع الفرعي للطلب', 'Subtotal')}</span>
                <span>{egp(subtotal, lang)}</span>
              </div>
              <div className="flex justify-between text-ink/80">
                <span>
                  {t('مصاريف الشحن', 'Shipping')} ({EGYPT_GOVERNORATES[govIndex][lang]})
                </span>
                <span>{egp(shippingFee, lang)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4 text-xl font-black text-ink">
              <span>{t('الإجمالي النهائي', 'Final Total')}</span>
              <span className="text-baladi-red">{egp(grandTotal, lang)}</span>
            </div>

            {/* Cash on delivery notice */}
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-baladi-green/10 p-3 text-xs font-bold text-baladi-green border border-baladi-green/20">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>{t('الدفع نقداً أو بمحفظة كاش عند الاستلام', 'Cash or mobile wallet on delivery')}</span>
            </div>

            {/* Submit Action */}
            <div className="mt-6 pt-2">
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || gracePeriodActive}
                className={`btn btn-ink relative overflow-hidden w-full py-4 text-base font-black shadow-lg hover:shadow-xl transition-all disabled:transform-none disabled:cursor-not-allowed ${
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
                    <Timer className="h-4 w-4 animate-pulse shrink-0" />
                    <span>{t(`جاري التأكيد · ${displayGraceSeconds} ث`, `Confirming · ${displayGraceSeconds}s`)}</span>
                  </span>
                ) : (
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <span>{t('تأكيد الطلب (مهلة 10 ث)', 'Place Order · 10s grace')}</span>
                    {isRtl ? <ArrowLeft className="h-4 w-4 shrink-0" /> : <ArrowRight className="h-4 w-4 shrink-0" />}
                  </span>
                )}
              </button>

              <div className="mt-4 text-center space-y-1">
                <p className="text-[11.5px] font-medium text-ink/70 italic">
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
