import { useState, useEffect, type FormEvent } from 'react';
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
} from 'lucide-react';
import { useCart, cartTotal, cartCount } from '../store/cart';
import { useAuth, type Order, type UserAddress } from '../store/auth';
import { useLang } from '../lib/lang';
import { egp } from '../lib/utils';
import { ZigZagBand } from '../components/brand/Ornaments';

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

  const shippingFee = lines.length > 0 ? EGYPT_GOVERNORATES[govIndex].fee : 0;
  const grandTotal = subtotal + shippingFee;

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

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

    setTimeout(() => {
      addOrder(newOrder);
      clear();
      setIsSubmitting(false);
      setPlacedOrder(newOrder);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 700);
  };

  // ── ORDER SUCCESS CONFIRMATION VIEW ────────────────────────
  if (placedOrder) {
    return (
      <div className="bg-cream pt-[68px] md:pt-[84px] min-h-[85vh] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-2xl rounded-[32px] border hairline bg-white p-8 sm:p-12 text-center shadow-xl">
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-baladi-green/15 text-baladi-green">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-baladi-yellow/20 px-4 py-1.5 text-xs font-black text-baladi-ink mb-3">
            <Sparkles className="h-4 w-4 text-baladi-red" />
            {t('تم تسجيل طلبك بنجاح!', 'Order Confirmed Successfully!')}
          </div>

          <h1 className="t-display text-2xl sm:text-3xl text-ink">
            {t('شكراً لاختيارك طعام بلدي', 'Thank you for choosing Baladi')}
          </h1>

          <div className="mx-auto mt-6 max-w-md rounded-2xl border hairline bg-cream/40 p-5 text-start shadow-sm space-y-2.5">
            <div className="flex items-center justify-between border-b hairline pb-3">
              <span className="text-xs font-bold text-ink/70">{t('رقم الطلب', 'Order Number')}</span>
              <span className="font-mono text-sm font-black text-baladi-red">{placedOrder.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-bold text-ink/70">{t('المبلغ الإجمالي', 'Total Amount')}</span>
              <span className="text-base font-black text-ink">{egp(placedOrder.total, lang)}</span>
            </div>
            <div className="flex items-center justify-between border-t hairline pt-2 text-xs font-bold text-ink/80">
              <span>{t('طريقة الدفع', 'Payment Method')}</span>
              <span className="text-baladi-green font-black">{t('الدفع عند الاستلام 💵', 'Cash on Delivery 💵')}</span>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-lg text-[14.5px] font-medium leading-relaxed text-ink/80">
            {t(
              `سيتواصل معك فريقنا خلال ساعات عبر الواتساب على رقم (${phone}) لتأكيد موعد الشحن والتوصيل خلال ٢-٤ أيام عمل.`,
              `Our team will reach out via WhatsApp on (${phone}) to confirm delivery within 2–4 business days.`
            )}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link to="/profile" className="btn btn-ink text-sm font-black">
              {t('متابعة الطلب في حسابي', 'Track in My Account')}
            </Link>
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
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/cats" className="btn btn-accent theme-cat">
              {t('عالم القطط 🐱', 'Cats World 🐱')}
            </Link>
            <Link to="/dogs" className="btn btn-accent theme-dog">
              {t('عالم الكلاب 🐶', 'Dogs World 🐶')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN DEDICATED CHECKOUT PAGE ────────────────────────────
  return (
    <div className="bg-cream pt-[68px] md:pt-[84px] min-h-[90vh] pb-16">
      
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
                disabled={isSubmitting}
                className="btn btn-ink w-full py-4 text-base font-black shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('جاري تسجيل الطلب...', 'Placing order...')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span>{t('تأكيد الطلب', 'Place Order')}</span>
                    {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
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
