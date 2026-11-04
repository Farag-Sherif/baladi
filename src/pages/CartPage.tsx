import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, Truck, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useCart, cartTotal, cartCount } from '../store/cart';
import { useLang } from '../lib/lang';
import { egp } from '../lib/utils';
import { ZigZagBand } from '../components/brand/Ornaments';
import { EGYPT_GOVERNORATES } from './CheckoutPage';

export default function CartPage() {
  const { lines, setQty, remove, clear } = useCart();
  const { t, lang } = useLang();
  const isRtl = lang === 'ar';

  const [gov, setGov] = useState(0);

  const subtotal = cartTotal(lines);
  const shipping = lines.length ? EGYPT_GOVERNORATES[gov].fee : 0;
  const total = subtotal + shipping;

  return (
    <div className="bg-cream pt-[68px] md:pt-[84px] min-h-[85vh]">
      <div className="u-container py-12">
        <p className="t-eyebrow text-baladi-red">{t('السلة', 'YOUR BAG')}</p>
        <h1 className="t-display mt-3 text-[clamp(2rem,4.4vw,3.2rem)] text-ink">
          {t('سلة المشتريات', 'Shopping Bag')}
        </h1>

        {lines.length === 0 ? (
          <div className="mt-12 rounded-[30px] border border-dashed border-ink/20 bg-white/80 p-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-ink/40" />
            <p className="mt-4 text-lg font-black text-ink">{t('سلتك فاضية حالياً', 'Your bag is empty')}</p>
            <p className="mt-1 text-sm font-semibold text-ink/70">
              {t('تصفح عالم القطط أو الكلاب واختر طعامك المفضل لأليفك', 'Explore cats or dogs worlds to find nutritious food')}
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
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            
            {/* ── Cart Items List (Modifications, Qty, Remove) ── */}
            <div className="space-y-4">
              {lines.map((l) => (
                <div
                  key={l.id}
                  className={`flex gap-4 rounded-[26px] border bg-white p-4 shadow-sm ${
                    l.product.species === 'cats' ? 'theme-cat' : 'theme-dog'
                  } border-ink/10`}
                >
                  <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-cream">
                    <img src={l.product.image} alt="" className="max-h-20 w-auto object-contain" />
                  </div>
                  <div className="min-w-0 flex-1 text-start">
                    <Link
                      to={`/product/${l.product.slug}`}
                      className="text-[15px] font-black text-ink hover:text-baladi-red transition-colors"
                    >
                      {l.product.name[lang]}
                    </Link>
                    <p className="mt-0.5 text-[12px] font-semibold text-ink/75">
                      {l.product.flavor[lang]} · {l.product.weight}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-full border hairline px-3 py-1 bg-cream/30">
                        <button
                          type="button"
                          onClick={() => setQty(l.id, l.qty - 1)}
                          className="text-ink/70 hover:text-ink"
                          aria-label="minus"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-ink">{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(l.id, l.qty + 1)}
                          className="text-ink/70 hover:text-ink"
                          aria-label="plus"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-[15px] font-black text-ink">
                        {egp(l.qty * l.product.price, lang)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    className="self-start rounded-full p-2 text-ink/40 hover:bg-red-50 hover:text-baladi-red transition-colors"
                    aria-label={t('حذف', 'Remove')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={clear}
                  className="text-[12px] font-black uppercase tracking-[0.14em] text-ink/60 hover:text-baladi-red transition-colors"
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

            {/* ── Order Summary Aside (Redirects to /checkout page) ── */}
            <aside className="h-fit rounded-[28px] border hairline bg-white p-6 shadow-soft text-start">
              <p className="t-eyebrow text-ink/75 font-black">{t('الملخص', 'SUMMARY')}</p>
              
              <div className="mt-4 space-y-2.5 text-[13.5px] font-bold">
                <div className="flex justify-between text-ink/80">
                  <span>{t('القطع', 'Items')}</span>
                  <span>{cartCount(lines)}</span>
                </div>
                <div className="flex justify-between text-ink/80">
                  <span>{t('المجموع', 'Subtotal')}</span>
                  <span>{egp(subtotal, lang)}</span>
                </div>
                <div className="flex justify-between text-ink/80">
                  <span>{t('الشحن التقديري', 'Estimated Shipping')}</span>
                  <span>{egp(shipping, lang)}</span>
                </div>
              </div>

              <label className="mt-5 block text-[11.5px] font-black uppercase tracking-[0.12em] text-ink/75">
                {t('اختر المحافظة لمعرفة الشحن', 'Select Governorate')}
              </label>
              <select
                value={gov}
                onChange={(e) => setGov(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border hairline bg-cream px-3 py-2.5 text-[13px] font-bold text-ink focus:outline-none focus:ring-2 focus:ring-baladi-yellow"
              >
                {EGYPT_GOVERNORATES.map((g, i) => (
                  <option key={g.en} value={i}>
                    {g[lang]} — {egp(g.fee, lang)}
                  </option>
                ))}
              </select>

              <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4 text-[18px] font-black text-ink">
                <span>{t('الإجمالى', 'Total')}</span>
                <span className="text-baladi-red">{egp(total, lang)}</span>
              </div>

              {/* ── PLACE ORDER BUTTON: Redirects to dedicated /checkout page ── */}
              <Link
                to="/checkout"
                className="btn btn-ink mt-5 w-full shadow-lg hover:shadow-xl transition-all font-black py-4 text-base flex items-center justify-center gap-2"
              >
                <span>{t('تأكيد الطلب', 'Place order')}</span>
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>

              <div className="mt-4 flex items-center gap-2 text-[11.5px] font-bold text-ink/70">
                <Truck className="h-4 w-4 text-baladi-red shrink-0" />
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
