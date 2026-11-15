import { useEffect, useRef } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart, cartCount } from '../../store/cart';
import { useStorefront } from '../../store/storefront';
import { getProductFallbackImage, resolveProductImage } from '../../lib/api';
import { useLang } from '../../lib/lang';
import { cn, egp } from '../../lib/utils';

export default function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal);
  const isSyncing = useCart((s) => s.isSyncing);
  const error = useCart((s) => s.error);
  const clearError = useCart((s) => s.clearError);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const catalogProducts = useStorefront((s) => s.products);

  const { t, lang } = useLang();
  const isRtl = lang === 'ar';
  const { pathname } = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  const count = cartCount(items);

  // Close drawer immediately on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Lock body scroll while drawer is open and always restore on close/unmount
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keep closed drawer completely inert and clear focus before applying aria-hidden
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!isOpen && el.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    el.inert = !isOpen;
    if (isOpen) {
      el.removeAttribute('inert');
    } else {
      el.setAttribute('inert', '');
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  return (
    <div
      ref={rootRef}
      aria-hidden={!isOpen}
      className={cn(
        'fixed inset-0 z-[80] transition-[opacity,visibility] duration-300 ease-out',
        isOpen ? 'pointer-events-auto opacity-100 visible' : 'pointer-events-none opacity-0 invisible'
      )}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        className={cn(
          'absolute inset-0 cursor-pointer bg-ink/60 backdrop-blur-sm transition-opacity duration-300 ease-out',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden="true"
      />

      {/* Sliding Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('سلة المشتريات', 'Shopping bag')}
        className={cn(
          'absolute inset-y-0 end-0 z-10 flex w-full max-w-md flex-col bg-cream text-ink shadow-2xl transition-transform duration-300 ease-out will-change-transform',
          isOpen
            ? 'pointer-events-auto translate-x-0'
            : isRtl
              ? 'pointer-events-none -translate-x-full'
              : 'pointer-events-none translate-x-full'
        )}
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
            className="shrink-0 rounded-full p-2 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            aria-label={t('إغلاق', 'Close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Items Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl border border-baladi-red/30 bg-baladi-red/10 px-3.5 py-2.5 text-xs font-extrabold text-baladi-red">
              <span>{error}</span>
              <button type="button" onClick={clearError} aria-label={t('إغلاق', 'Dismiss')}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {items.length === 0 ? (
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
              {items.map((item) => {
                const matchedProduct = catalogProducts.find((p) => p.id === item.product_id);
                const species = matchedProduct?.species ?? 'cat';
                const imgSrc = resolveProductImage(item.image ?? matchedProduct?.image, species);
                const maxReached = item.stock_quantity > 0 && item.quantity >= item.stock_quantity;

                return (
                  <li
                    key={item.id}
                    className="flex gap-3 rounded-3xl border hairline bg-white p-3 shadow-[0_18px_40px_-34px_rgba(35,37,79,.6)]"
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      onClick={close}
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-cream p-1"
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
                        onClick={close}
                        className="block truncate text-[13.5px] font-extrabold text-ink hover:text-baladi-red"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-[11.5px] font-semibold text-ink/75">
                        {egp(item.price, lang)} ·{' '}
                        {item.in_stock ? t(`متاح ${item.stock_quantity}`, `${item.stock_quantity} in stock`) : t('غير متوفر', 'Out of stock')}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-ink/12 px-1.5 py-0.5">
                          <button
                            type="button"
                            disabled={isSyncing}
                            onClick={() => void setQty(item.id, item.quantity - 1)}
                            className="p-0.5 text-ink/70 hover:text-ink disabled:opacity-40"
                            aria-label={t('إنقاص الكمية', 'Decrease quantity')}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-black text-ink">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={isSyncing || maxReached}
                            onClick={() => void setQty(item.id, item.quantity + 1)}
                            className="p-0.5 text-ink/70 hover:text-ink disabled:opacity-40"
                            aria-label={t('زيادة الكمية', 'Increase quantity')}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-[13px] font-black text-ink">
                          {egp(item.total || item.quantity * item.price, lang)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={() => void remove(item.id)}
                      className="self-start rounded-full p-1.5 text-ink/50 transition-colors hover:bg-red-50 hover:text-baladi-red disabled:opacity-40"
                      aria-label={t('حذف', 'Remove')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Drawer Footer: Clicking Checkout directly goes to /cart */}
        {items.length > 0 && (
          <div className="border-t border-ink/10 bg-white px-6 py-5">
            <div className="mb-1 flex items-center justify-between text-sm font-bold text-ink/80">
              <span>{t('عدد القطع', 'Items')}</span>
              <span className="font-mono">{count}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-black text-ink">
              <span>{t('المجموع الفرعي', 'Subtotal')}</span>
              <span className="text-baladi-red">{egp(subtotal, lang)}</span>
            </div>

            <Link
              to="/cart"
              onClick={close}
              className="btn btn-ink mt-4 flex w-full items-center justify-center gap-2 py-3.5 text-sm font-black shadow-lg transition-all hover:shadow-xl"
            >
              <span>{t('إتمام الطلب ومراجعة السلة', 'Checkout')}</span>
              {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>

            <p className="mt-2 text-center text-[11px] font-medium text-ink/65">
              {t('يمكنك تعديل الكميات وحساب الشحن في صفحة السلة', 'You can modify items & view shipping in cart')}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
