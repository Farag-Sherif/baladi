import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Truck, MapPin, CheckCircle2, AlertCircle, Package, Clock } from 'lucide-react';
import { useAuth } from '../store/auth';
import { extractErrorMessage, type ApiOrder } from '../lib/api';
import { useLang } from '../lib/lang';
import { egp } from '../lib/utils';
import { ZigZagBand } from '../components/brand/Ornaments';

export default function TrackOrderPage() {
  const { t, lang } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const initialPhone = searchParams.get('phone') || '';

  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const trackOrder = useAuth((s) => s.trackOrder);

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<ApiOrder | null>(null);

  const runLookup = async (ordNum: string, ph?: string) => {
    if (!ordNum.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await trackOrder(ordNum.trim(), ph?.trim() || undefined, lang);
      setOrder(data);
    } catch (err) {
      setOrder(null);
      setError(
        extractErrorMessage(
          err,
          t('تعذر العثور على الطلب، تأكد من رقم الطلب ورقم الهاتف', 'Order not found. Please check order number and phone.')
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder && (isAuthenticated || initialPhone)) {
      void runLookup(initialOrder, initialPhone);
    }
  }, [initialOrder, initialPhone, isAuthenticated, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError(t('برجاء إدخال رقم الطلب', 'Please enter your order number'));
      return;
    }
    if (!isAuthenticated && !phone.trim()) {
      setError(t('رقم الهاتف مطلوب للتحقق من الطلب', 'Phone number is required to track guest orders'));
      return;
    }

    const nextParams: Record<string, string> = { order: orderNumber.trim() };
    if (phone.trim()) nextParams.phone = phone.trim();
    setSearchParams(nextParams, { replace: true });
    void runLookup(orderNumber, phone);
  };

  const getProgressStage = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('cancel')) return -1;
    if (s.includes('deliver') || s.includes('complet')) return 4;
    if (s.includes('ship') || s.includes('transit')) return 3;
    if (s.includes('process') || s.includes('confirm') || s.includes('prepar')) return 2;
    return 1;
  };

  const stage = order ? getProgressStage(order.status) : 0;

  return (
    <div className="min-h-screen bg-cream pt-[68px] md:pt-[84px]">
      <section className="relative overflow-hidden bg-ink py-12 text-cream">
        <ZigZagBand color="#FBBB21" height={20} className="absolute inset-x-0 top-0 opacity-80" />
        <div className="u-container relative text-center">
          <p className="t-eyebrow text-baladi-yellow">{t('تتبع الشحنات', 'ORDER TRACKING')}</p>
          <h1 className="t-display mt-2 text-[clamp(2rem,4.5vw,3.2rem)] text-white">
            {t('تابع حالة طلبك', 'Track Your Order')}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[15px] font-medium text-cream/90">
            {t(
              'أدخل رقم الطلب للاطلاع على حالته وتفاصيل التوصيل مباشرة.',
              'Enter your order number to inspect live status and delivery details.'
            )}
          </p>
        </div>
      </section>

      <div className="u-container -mt-6 pb-20">
        <div className="mx-auto max-w-2xl rounded-[32px] border hairline bg-white p-6 shadow-soft md:p-8">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="block text-[11px] font-black uppercase text-ink/75">
                {t('رقم الطلب', 'Order Number')} *
              </label>
              <input
                type="text"
                dir="ltr"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="BAL-01013"
                className="mt-1.5 w-full rounded-2xl border hairline bg-cream/40 px-4 py-3 text-sm font-black uppercase text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-ink/75">
                {t('رقم الهاتف', 'Phone')} {!isAuthenticated ? '*' : t('(اختياري)', '(Optional)')}
              </label>
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01222222222"
                className="mt-1.5 w-full rounded-2xl border hairline bg-cream/40 px-4 py-3 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-ink flex w-full items-center justify-center gap-2 py-3 text-sm font-black sm:w-auto disabled:opacity-60"
              >
                <Search className="h-4 w-4" />
                <span>{loading ? t('جاري البحث...', 'Searching...') : t('تتبع', 'Track')}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-baladi-red/30 bg-red-50 p-4 text-xs font-black text-baladi-red">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {order && (
            <div className="mt-8 space-y-6 border-t hairline pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-ink/60">{t('رقم الطلب', 'Order Number')}</span>
                  <h2 className="font-mono text-2xl font-black text-baladi-red">{order.order_number}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-ink/65">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(order.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-baladi-yellow px-4 py-1.5 text-xs font-black text-ink">
                  <Truck className="h-4 w-4" />
                  {order.status_label}
                </span>
              </div>

              {stage === -1 ? (
                <div className="rounded-2xl border border-baladi-red/30 bg-red-50 p-4 text-xs font-black text-baladi-red">
                  {t('تم إلغاء هذا الطلب.', 'This order has been cancelled.')}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 rounded-2xl bg-cream/60 p-4 text-center">
                  {[
                    { num: 1, ar: 'تم الطلب', en: 'Placed' },
                    { num: 2, ar: 'تجهيز', en: 'Processing' },
                    { num: 3, ar: 'في الشحن', en: 'Shipped' },
                    { num: 4, ar: 'تم التسليم', en: 'Delivered' },
                  ].map((s) => {
                    const active = stage >= s.num;
                    return (
                      <div key={s.num} className="flex flex-col items-center">
                        <div
                          className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ${
                            active ? 'bg-baladi-green text-white' : 'bg-ink/10 text-ink/50'
                          }`}
                        >
                          {active ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                        </div>
                        <span className={`mt-1.5 text-[11px] font-black ${active ? 'text-baladi-green' : 'text-ink/50'}`}>
                          {t(s.ar, s.en)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="rounded-2xl border hairline bg-cream/30 p-4 text-xs font-bold text-ink/80">
                <p className="flex items-center gap-1.5 font-black text-ink">
                  <MapPin className="h-4 w-4 text-baladi-red" />
                  {order.customer_name}
                </p>
                <p className="mt-1 text-ink/75">{order.customer_address}</p>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase text-ink/70">
                  <Package className="h-4 w-4 text-baladi-red" />
                  <span>{t('المنتجات', 'Items')}</span>
                </h3>
                <div className="space-y-2 rounded-2xl border hairline bg-white p-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-bold text-ink">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>{egp(item.total, lang)}</span>
                    </div>
                  ))}
                  <div className="mt-3 space-y-1.5 border-t hairline pt-3 text-xs font-bold text-ink/75">
                    <div className="flex justify-between">
                      <span>{t('المجموع الفرعي', 'Subtotal')}</span>
                      <span>{egp(order.subtotal, lang)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('الشحن', 'Shipping')}</span>
                      <span>{order.shipping_cost === 0 ? t('مجاني', 'Free') : egp(order.shipping_cost, lang)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-baladi-green">
                        <span>{t('الخصم', 'Discount')}</span>
                        <span>-{egp(order.discount, lang)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t hairline pt-2 text-base font-black text-ink">
                      <span>{t('الإجمالي', 'Total')}</span>
                      <span className="text-baladi-red">{egp(order.total, lang)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 border-t hairline pt-5 text-center">
            <Link to="/" className="text-xs font-black text-ink/70 hover:text-baladi-red">
              {t('العودة للرئيسية', 'Back to Home')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
