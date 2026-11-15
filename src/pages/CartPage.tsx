import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, Truck, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart, cartCount } from '../store/cart';
import { useStorefront } from '../store/storefront';
import { getProductFallbackImage, resolveProductImage } from '../lib/api';
import { useLang } from '../lib/lang';
import { egp } from '../lib/utils';
import { ZigZagBand, BaladiCatEmblem, BaladiDogEmblem } from '../components/brand/Ornaments';

export default function CartPage() {
  const { items, subtotal, isSyncing, error, clearError, setQty, remove, clear } = useCart();
  const governorates = useStorefront((s) => s.governorates);
  const settings = useStorefront((s) => s.settings);
  const catalogProducts = useStorefront((s) => s.products);
  const { t, lang } = useLang();
  const isRtl = lang === 'ar';

  const [govId, setGovId] = useState<number>(0);

  useEffect(() => {
    if (!govId && governorates.length > 0) {
      setGovId(governorates[0].id);
    }
  }, [governorates, govId]);

  const selectedGov = governorates.find((g) => g.id === govId) ?? governorates[0];
  const freeThreshold = settings?.free_shipping_threshold ?? 0;
  const isFreeShipping = freeThreshold > 0 && subtotal >= freeThreshold;
  const shipping =
    items.length && selectedGov ? (isFreeShipping ? 0 : selectedGov.shipping_cost) : 0;
  const total = subtotal + shipping;
  const count = cartCount(items);

  return (
    <div className="min-h-[85vh] bg-cream pt-[68px] md:pt-[84px]">
      <div className="u-container py-12">
        <p className="t-eyebrow text-baladi-red">{t('السلة', 'YOUR BAG')}</p>
        <h1 className="t-display mt-3 text-[clamp(2rem,4.4vw,3.2rem)] text-ink">
          {t('سلة المشتريات', 'Shopping Bag')}
        </h1>

        {error && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-baladi-red/30 bg-baladi-red/10 px-4 py-3 text-sm font-extrabold text-baladi-red">
            <span>{error}</span>
            <button type="button" onClick={clearError} aria-label={t('إغلاق', 'Dismiss')}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-12 rounded-[30px] border border-dashed border-ink/20 bg-white/80 p-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-ink/40" />
            <p className="mt-4 text-lg font-black text-ink">{t('سلتك فاضية حالياً', 'Your bag is empty')}</p>
            <p className="mt-1 text-sm font-semibold text-ink/70">
              {t('تصفح عالم القطط أو الكلاب واختر طعامك المفضل لأليفك', 'Explore cats or dogs worlds to find nutritious food')}
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
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            {/* ── Cart Items List ── */}
            <div className="space-y-4">
              {items.map((item) => {
                const matchedProduct = catalogProducts.find((p) => p.id === item.product_id);
                const species = matchedProduct?.species ?? 'cat';
                const imgSrc = resolveProductImage(item.image ?? matchedProduct?.image, species);
                const maxReached = item.stock_quantity > 0 && item.quantity >= item.stock_quantity;

                return (
                  <div
                    key={item.id}
                    className={`flex gap-4 rounded-[26px] border border-ink/10 bg-white p-4 shadow-sm ${
                      species === 'cat' ? 'theme-cat' : 'theme-dog'
                    }`}
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-cream p-1.5"
                    >
                      <img
                        src={imgSrc}
                        alt={item.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = getProductFallbackImage(species);
                        }}
                      />
                    </Link>
                    <div className="min-w-0 flex-1 text-start">
                      <Link
                        to={`/product/${item.slug}`}
                        className="text-[15px] font-black text-ink transition-colors hover:text-baladi-red"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-[12px] font-semibold text-ink/75">
                        {egp(item.price, lang)} ·{' '}
                        {item.in_stock
                          ? t(`متاح ${item.stock_quantity}`, `${item.stock_quantity} in stock`)
                          : t('غير متوفر حالياً', 'Out of stock')}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-full border hairline bg-cream/30 px-3 py-1">
                          <button
                            type="button"
                            disabled={isSyncing}
                            onClick={() => void setQty(item.id, item.quantity - 1)}
                            className="text-ink/70 hover:text-ink disabled:opacity-40"
                            aria-label={t('إنقاص الكمية', 'Decrease quantity')}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-black text-ink">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={isSyncing || maxReached}
                            onClick={() => void setQty(item.id, item.quantity + 1)}
                            className="text-ink/70 hover:text-ink disabled:opacity-40"
                            aria-label={t('زيادة الكمية', 'Increase quantity')}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-[15px] font-black text-ink">
                          {egp(item.total || item.quantity * item.price, lang)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={() => void remove(item.id)}
                      className="self-start rounded-full p-2 text-ink/40 transition-colors hover:bg-red-50 hover:text-baladi-red disabled:opacity-40"
                      aria-label={t('حذف', 'Remove')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => void clear()}
                  className="text-[12px] font-black uppercase tracking-[0.14em] text-ink/60 transition-colors hover:text-baladi-red disabled:opacity-40"
                >
                  {t('تفريغ السلة', 'Clear bag')}
                </button>
                <Link
                  to="/"
                  className="text-[12px] font-bold text-ink/70 hover:text-ink hover:underline"
                >
                  {t('+ إضافة منتجات أخرى', '+ Add more products')}
                </Link>
              </div>
            </div>

            {/* ── Order Summary Aside ── */}
            <aside className="h-fit rounded-[28px] border hairline bg-white p-6 text-start shadow-soft">
              <p className="t-eyebrow font-black text-ink/75">{t('الملخص', 'SUMMARY')}</p>

              <div className="mt-4 space-y-2.5 text-[13.5px] font-bold">
                <div className="flex justify-between text-ink/80">
                  <span>{t('القطع', 'Items')}</span>
                  <span>{count}</span>
                </div>
                <div className="flex justify-between text-ink/80">
                  <span>{t('المجموع', 'Subtotal')}</span>
                  <span>{egp(subtotal, lang)}</span>
                </div>
                <div className="flex justify-between text-ink/80">
                  <span>{t('الشحن التقديري', 'Estimated Shipping')}</span>
                  <span className={isFreeShipping ? 'text-baladi-green font-black' : ''}>
                    {isFreeShipping ? t('مجاني', 'Free') : egp(shipping, lang)}
                  </span>
                </div>
              </div>

              {freeThreshold > 0 && subtotal < freeThreshold && (
                <p className="mt-3 rounded-xl bg-baladi-yellow/20 px-3 py-2 text-[11.5px] font-extrabold text-ink">
                  {t(
                    `باقي ${egp(freeThreshold - subtotal, lang)} للشحن المجاني!`,
                    `Add ${egp(freeThreshold - subtotal, lang)} more for free shipping!`
                  )}
                </p>
              )}

              {governorates.length > 0 && (
                <>
                  <label className="mt-5 block text-[11.5px] font-black uppercase tracking-[0.12em] text-ink/75">
                    {t('اختر المحافظة لمعرفة الشحن', 'Select Governorate')}
                  </label>
                  <select
                    value={selectedGov?.id ?? ''}
                    onChange={(e) => setGovId(Number(e.target.value))}
                    className="mt-2 w-full rounded-xl border hairline bg-cream px-3 py-2.5 text-[13px] font-bold text-ink focus:outline-none focus:ring-2 focus:ring-baladi-yellow"
                  >
                    {governorates.map((g) => (
                      <option key={g.id} value={g.id}>
                        {lang === 'ar' ? g.name_ar || g.name : g.name_en || g.name} — {egp(g.shipping_cost, lang)}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4 text-[18px] font-black text-ink">
                <span>{t('الإجمالى', 'Total')}</span>
                <span className="text-baladi-red">{egp(total, lang)}</span>
              </div>

              <Link
                to="/checkout"
                className="btn btn-ink mt-5 flex w-full items-center justify-center gap-2 py-4 text-base font-black shadow-lg transition-all hover:shadow-xl"
              >
                <span>{t('تأكيد الطلب', 'Place order')}</span>
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>

              <div className="mt-4 flex items-center gap-2 text-[11.5px] font-bold text-ink/70">
                <Truck className="h-4 w-4 shrink-0 text-baladi-red" />
                <span>{t('توصيل ٢–٤ أيام عمل لجميع المحافظات', 'Delivery in 2–4 working days')}</span>
              </div>
            </aside>
          </div>
        )}
      </div>

      <ZigZagBand color="#FBBB21" height={20} className="opacity-60" />
    </div>
  );
}
