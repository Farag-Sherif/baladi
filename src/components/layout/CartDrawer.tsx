import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart, cartTotal, cartCount } from '../../store/cart';
import { useLang } from '../../lib/lang';
import { egp } from '../../lib/utils';

export default function CartDrawer() {
  const { isOpen, close, lines, setQty, remove } = useCart();
  const { t, lang } = useLang();
  const isRtl = lang === 'ar';
  const { pathname } = useLocation();

  const total = cartTotal(lines);
  const count = cartCount(lines);

  // Close drawer immediately on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="cart-drawer-root" className="fixed inset-0 z-[80] pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Sliding Drawer Panel */}
          <motion.aside
            key="cart-panel"
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="absolute inset-y-0 end-0 z-10 flex w-full max-w-md flex-col bg-cream text-ink shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <div>
                <p className="t-eyebrow text-baladi-red">{t('سلتك', 'Your bag')}</p>
                <h2 className="mt-1 text-xl font-black text-ink">{t('سلة المشتريات', 'Shopping bag')}</h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink transition-colors focus:outline-none"
                aria-label={t('إغلاق', 'Close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Items Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-ink/5">
                      <ShoppingBag className="h-7 w-7 text-ink/65" />
                    </div>
                    <p className="font-black text-ink">{t('السلة فاضية', 'Your bag is empty')}</p>
                    <p className="mt-1 text-sm font-semibold text-ink/75">
                      {t('اختار من عالم القطط أو الكلاب', 'Pick from the cats or dogs world')}
                    </p>
                    <div className="mt-5 flex justify-center gap-2">
                      <Link to="/cats" onClick={close} className="btn btn-accent theme-cat">
                        {t('عالم القطط', 'Cats World')}
                      </Link>
                      <Link to="/dogs" onClick={close} className="btn btn-accent theme-dog">
                        {t('عالم الكلاب', 'Dogs World')}
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => (
                    <li
                      key={l.id}
                      className="flex gap-3 rounded-3xl bg-white p-3 shadow-[0_18px_40px_-34px_rgba(35,37,79,.6)] border hairline"
                    >
                      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-cream">
                        <img src={l.product.image} alt="" className="max-h-[74px] w-auto object-contain" />
                      </div>
                      <div className="min-w-0 flex-1 text-start">
                        <p className="truncate text-[13.5px] font-extrabold text-ink">{l.product.name[lang]}</p>
                        <p className="mt-0.5 text-[11.5px] font-semibold text-ink/75">
                          {l.product.flavor[lang]} · {l.product.weight}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-ink/12 px-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => setQty(l.id, l.qty - 1)}
                              className="p-0.5 text-ink/70 hover:text-ink"
                              aria-label="minus"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-xs font-black text-ink">{l.qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty(l.id, l.qty + 1)}
                              className="p-0.5 text-ink/70 hover:text-ink"
                              aria-label="plus"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-[13px] font-black text-ink">
                            {egp(l.qty * l.product.price, lang)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(l.id)}
                        className="self-start rounded-full p-1.5 text-ink/50 hover:bg-red-50 hover:text-baladi-red transition-colors"
                        aria-label={t('حذف', 'Remove')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Drawer Footer: Clicking Checkout directly goes to /cart */}
            {lines.length > 0 && (
              <div className="border-t border-ink/10 bg-white px-6 py-5">
                <div className="mb-1 flex items-center justify-between text-sm font-bold text-ink/80">
                  <span>{t('عدد القطع', 'Items')}</span>
                  <span className="font-mono">{count}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-black text-ink">
                  <span>{t('المجموع الفرعي', 'Subtotal')}</span>
                  <span className="text-baladi-red">{egp(total, lang)}</span>
                </div>

                {/* Primary: Closes drawer and navigates straight to /cart page */}
                <Link
                  to="/cart"
                  onClick={close}
                  className="btn btn-ink mt-4 w-full shadow-lg hover:shadow-xl transition-all font-black py-3.5 text-sm flex items-center justify-center gap-2"
                >
                  <span>{t('إتمام الطلب ومراجعة السلة', 'Checkout')}</span>
                  {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </Link>

                <p className="mt-2 text-center text-[11px] font-medium text-ink/65">
                  {t('يمكنك تعديل الكميات وحساب الشحن في صفحة السلة', 'You can modify items & view shipping in cart')}
                </p>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
