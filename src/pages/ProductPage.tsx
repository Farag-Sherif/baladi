import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Heart, Leaf, Minus, ShieldCheck, Timer, Truck, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SPECIES } from '../data/catalog';
import {
  getCategoryTitle,
  getProductFallbackImage,
  getProductTitle,
  resolveProductImage,
  speciesToRoute,
  type ApiProduct,
} from '../lib/api';
import { useLang } from '../lib/lang';
import { egp } from '../lib/utils';
import { ADD_GRACE_SECONDS, useCart } from '../store/cart';
import { useStorefront } from '../store/storefront';
import { useAuth } from '../store/auth';
import ProductCard from '../components/sections/ProductCard';
import Reveal from '../components/ui/Reveal';
import Tilt3D from '../components/ui/Tilt3D';
import { Mark, ZigZagBand, DiamondBadge, BaladiCatEmblem, BaladiDogEmblem } from '../components/brand/Ornaments';
import { GhostAnimal } from '../components/brand/Ornaments2';

export default function ProductPage() {
  const { slug = '' } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useLang();

  const products = useStorefront((s) => s.products);
  const productDetails = useStorefront((s) => s.productDetails);
  const fetchProductBySlug = useStorefront((s) => s.fetchProductBySlug);
  const settings = useStorefront((s) => s.settings);
  const isLoadingCatalog = useStorefront((s) => s.isLoadingCatalog);

  const pendingAdd = useCart((s) => s.pendingAdd);
  const startPendingAdd = useCart((s) => s.startPendingAdd);
  const updatePendingQty = useCart((s) => s.updatePendingQty);
  const cancelPendingAdd = useCart((s) => s.cancelPendingAdd);
  const commitPendingAdd = useCart((s) => s.commitPendingAdd);
  const cartError = useCart((s) => s.error);
  const clearCartError = useCart((s) => s.clearError);

  const favorites = useAuth((s) => s.favorites);
  const toggleFavorite = useAuth((s) => s.toggleFavorite);

  const [fetchedProduct, setFetchedProduct] = useState<ApiProduct | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [qty, setQty] = useState(1);

  const product =
    (fetchedProduct && fetchedProduct.slug === slug ? fetchedProduct : null) ||
    productDetails[slug] ||
    products.find((p) => p.slug === slug) ||
    null;

  useEffect(() => {
    setQty(1);
    clearCartError();
    if (!slug) return;
    let active = true;
    setIsFetchingDetail(true);
    fetchProductBySlug(slug, lang)
      .then((item) => {
        if (active && item) setFetchedProduct(item);
      })
      .finally(() => {
        if (active) setIsFetchingDetail(false);
      });
    return () => {
      active = false;
    };
  }, [slug, lang, fetchProductBySlug, clearCartError]);

  const isPendingThisProduct = Boolean(product && pendingAdd?.product.id === product.id);
  const activeQty = isPendingThisProduct && pendingAdd ? pendingAdd.qty : qty;
  const secondsLeft = isPendingThisProduct && pendingAdd ? pendingAdd.secondsLeft : ADD_GRACE_SECONDS;
  const displayGraceSeconds = Math.max(1, secondsLeft);
  const graceProgressPercent = Math.min(
    100,
    Math.max(0, ((ADD_GRACE_SECONDS - secondsLeft) / ADD_GRACE_SECONDS) * 100)
  );

  const handleQtyChange = (next: number) => {
    clearCartError();
    const maxAllowed = product && product.stock_quantity > 0 ? product.stock_quantity : 99;
    const clamped = Math.max(1, Math.min(next, maxAllowed));
    if (isPendingThisProduct) {
      updatePendingQty(clamped);
    } else {
      setQty(clamped);
    }
  };

  if (!product && (isFetchingDetail || isLoadingCatalog)) {
    return (
      <div className="pt-[68px] md:pt-[84px]">
        <div className="u-container grid gap-12 py-12 md:py-20 lg:grid-cols-2">
          <div className="h-[420px] animate-pulse rounded-[34px] bg-ink/[0.06]" />
          <div className="space-y-4 py-4">
            <div className="h-4 w-32 animate-pulse rounded-full bg-ink/[0.08]" />
            <div className="h-10 w-3/4 animate-pulse rounded-2xl bg-ink/[0.08]" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-ink/[0.08]" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-ink/[0.05]" />
            <div className="h-12 w-full animate-pulse rounded-full bg-ink/[0.08]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="grid min-h-[70vh] place-items-center pt-32 text-center">
        <div>
          <p className="t-eyebrow text-baladi-red">404</p>
          <h1 className="t-display mt-3 text-3xl">{t('المنتج غير موجود', 'Product not found')}</h1>
          <Link to="/" className="btn btn-ink mt-6">{t('الرئيسية', 'Home')}</Link>
        </div>
      </div>
    );
  }

  const routeSpecies = speciesToRoute(product.species);
  const s = SPECIES[routeSpecies];
  const isCat = product.species === 'cat';
  const accent = isCat ? 'text-baladi-red' : 'text-baladi-green';
  const accentBg = isCat ? 'bg-baladi-red' : 'bg-baladi-green';
  const isFav = favorites.some((f) => f.id === product.id);
  const title = getProductTitle(product, lang);
  const categoryTitle = getCategoryTitle(product.category, lang);
  const imageSrc = resolveProductImage(product.image, product.species);
  const rel = products.filter((p) => p.species === product.species && p.slug !== product.slug).slice(0, 3);

  const handleToggleFavorite = async () => {
    if (favBusy) return;
    setFavBusy(true);
    const res = await toggleFavorite(product);
    setFavBusy(false);
    if (res.requiresAuth) {
      navigate('/login');
    }
  };

  return (
    <div className={`${isCat ? 'theme-cat' : 'theme-dog'} pt-[68px] md:pt-[84px]`}>
      {/* breadcrumb */}
      <div className="border-b hairline bg-cream">
        <div className="u-container flex flex-wrap items-center gap-2 py-4 text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-ink/75">
          <Link to="/" className="hover:text-ink">{t('الرئيسية', 'Home')}</Link>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
          <Link to={`/${routeSpecies}`} className="hover:text-ink">{s.name[lang]}</Link>
          {product.category?.slug && (
            <>
              <ChevronRight className="h-3 w-3 rtl:rotate-180" />
              <Link to={`/${routeSpecies}/${product.category.slug}`} className="hover:text-ink">{categoryTitle}</Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
          <span className="font-black text-ink">{title}</span>
        </div>
      </div>

      {/* ── HERO: product portrait over a faded product backdrop ── */}
      <section className="relative overflow-hidden bg-cream">
        <div className="pointer-events-none absolute inset-0 opacity-[0.10]">
          <img
            src={imageSrc}
            alt=""
            aria-hidden="true"
            className="absolute -end-[8%] top-0 h-full w-auto scale-125 object-contain blur-[3px]"
            onError={(e) => {
              e.currentTarget.src = getProductFallbackImage(product.species);
            }}
          />
        </div>
        <div className={`pointer-events-none absolute inset-0 ${isCat ? 'bg-baladi-red/5' : 'bg-baladi-green/5'}`} />
        <GhostAnimal species={routeSpecies} src={s.silhouette} color={isCat ? '#E84249' : '#1E996C'} className="-bottom-10 -start-16 h-[85%] w-auto" opacity={0.11} />

        <div className="u-container relative grid gap-12 py-10 md:py-16 lg:grid-cols-2">
          {/* stage */}
          <div className="relative">
            <div className={`relative overflow-hidden rounded-[34px] ${isCat ? 'bg-gradient-to-br from-[#FCE3E4] to-cream' : 'bg-gradient-to-br from-[#E3F2EA] to-cream'} p-8`}>
              <div className="absolute inset-x-0 top-0"><ZigZagBand height={13} weight={1.6} color={isCat ? '#E84249' : '#1E996C'} className="opacity-40" /></div>
              {product.discount_percent ? (
                <span className="pill-solid absolute start-6 top-6 z-10 bg-baladi-yellow text-ink">
                  -{product.discount_percent}%
                </span>
              ) : null}
              <Tilt3D strength={13}>
                <div className="relative flex h-[340px] w-full items-center justify-center p-2 md:h-[460px]">
                  <img
                    src={imageSrc}
                    alt={title}
                    className="h-full w-full max-h-full max-w-full object-contain drop-shadow-[0_40px_60px_rgba(35,37,79,0.32)]"
                    onError={(e) => {
                      e.currentTarget.src = getProductFallbackImage(product.species);
                    }}
                  />
                </div>
              </Tilt3D>
              <div className="mt-4 flex items-center justify-between">
                <span className={`t-eyebrow ${accent}`}>{categoryTitle}</span>
                <DiamondBadge size={28} accent={isCat ? '#E84249' : '#1E996C'} dot="#FBBB21" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border hairline bg-white p-2.5 sm:p-3 text-center sm:text-start shadow-xs">
                <p className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-ink/55">{t('رمز المنتج', 'SKU')}</p>
                <p className="mt-0.5 truncate text-[11.5px] sm:text-[12px] font-extrabold text-ink">{product.sku}</p>
              </div>
              <div className="rounded-2xl border hairline bg-white p-2.5 sm:p-3 text-center sm:text-start shadow-xs">
                <p className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-ink/55">{t('التصنيف', 'Category')}</p>
                <p className="mt-0.5 truncate text-[11.5px] sm:text-[12px] font-extrabold text-ink">{categoryTitle}</p>
              </div>
              <div className="rounded-2xl border hairline bg-white p-2.5 sm:p-3 text-center sm:text-start shadow-xs">
                <p className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-ink/55">{t('المخزون', 'Stock')}</p>
                <p className={`mt-0.5 truncate text-[11.5px] sm:text-[12px] font-extrabold ${product.in_stock ? 'text-baladi-green' : 'text-baladi-red'}`}>
                  {product.in_stock ? `${product.stock_quantity} ${t('متاح', 'available')}` : t('نفد', 'Out of stock')}
                </p>
              </div>
            </div>
          </div>

          {/* buy box */}
          <div className="lg:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Mark tone={s.mark} className="h-8" />
                <span className={`t-eyebrow ${accent}`}>{s.signature[lang]}</span>
              </div>
              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={favBusy}
                aria-label={t('إضافة للمفضلة', 'Toggle favorite')}
                className={`inline-flex items-center gap-1.5 rounded-full border hairline px-3.5 py-2 text-xs font-black transition-colors ${
                  isFav ? 'bg-baladi-red text-white border-baladi-red' : 'bg-white text-ink hover:border-baladi-red hover:text-baladi-red'
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
                <span>{isFav ? t('فى المفضلة', 'Saved') : t('حفظ', 'Save')}</span>
              </button>
            </div>

            <h1 className="t-display mt-4 text-[clamp(1.9rem,4vw,3rem)] text-ink">{title}</h1>
            <p className="mt-2 text-[14.5px] font-extrabold text-ink/80">
              {categoryTitle} · {product.in_stock ? t(`متوفر (${product.stock_quantity})`, `In stock (${product.stock_quantity})`) : t('غير متوفر حالياً', 'Out of stock')}
            </p>

            {product.description && (
              <p className="mt-5 text-[14.5px] font-medium leading-relaxed text-ink/85">{product.description}</p>
            )}

            <div className="mt-6 flex items-end gap-3">
              <p className="text-[30px] font-black leading-none text-ink">{egp(product.price, lang)}</p>
              {product.compare_at_price && (
                <p className="pb-1 text-[14px] font-bold text-ink/55 line-through">{egp(product.compare_at_price, lang)}</p>
              )}
              {product.discount_percent ? (
                <span className="mb-1 rounded-full bg-baladi-yellow px-2.5 py-0.5 text-[11px] font-black text-ink">
                  {t(`وفر ${product.discount_percent}%`, `Save ${product.discount_percent}%`)}
                </span>
              ) : null}
            </div>

            {cartError && (
              <div className="mt-4 rounded-2xl border border-baladi-red/30 bg-baladi-red/10 px-4 py-3 text-xs font-extrabold text-baladi-red">
                {cartError}
              </div>
            )}

            {/* ── ACTION ROW: QUANTITY & ADD TO CART / GRACE CONFIRMATION ── */}
            {!isPendingThisProduct ? (
              <div className="mt-6 flex items-center gap-2.5 sm:gap-3">
                <div className="flex shrink-0 items-center gap-2.5 sm:gap-3 rounded-full border hairline bg-white px-3 py-2.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(activeQty - 1)}
                    disabled={activeQty <= 1}
                    aria-label={t('إنقاص الكمية', 'Decrease quantity')}
                    className="p-0.5 transition-opacity disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-black text-ink tabular-nums">{activeQty}</span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(activeQty + 1)}
                    disabled={!product.in_stock || activeQty >= product.stock_quantity}
                    aria-label={t('زيادة الكمية', 'Increase quantity')}
                    className="p-0.5 transition-opacity disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {!product.in_stock ? (
                  <button
                    type="button"
                    disabled
                    className="btn flex-1 cursor-not-allowed bg-ink/15 text-ink/50 py-3.5 text-xs sm:text-sm font-black"
                  >
                    {t('نفد من المخزون', 'Out of stock')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startPendingAdd(product, activeQty, pathname)}
                    className={`btn flex-1 whitespace-nowrap py-3.5 text-xs sm:text-sm font-black shadow-md ${
                      isCat ? 'btn-accent theme-cat' : 'btn-accent theme-dog'
                    }`}
                  >
                    <span>{t('أضف للسلة', 'Add to cart')}</span>
                    <span className="opacity-70">·</span>
                    <span>{egp(product.price * activeQty, lang)}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                {/* Mobile Top Row: Quantity + Cancel Button */}
                <div className="flex items-center justify-between gap-2.5 sm:contents">
                  <div className="flex shrink-0 items-center gap-2.5 sm:gap-3 rounded-full border hairline bg-white px-3 py-2.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(activeQty - 1)}
                      disabled={activeQty <= 1}
                      aria-label={t('إنقاص الكمية', 'Decrease quantity')}
                      className="p-0.5 transition-opacity disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-black text-ink tabular-nums">{activeQty}</span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(activeQty + 1)}
                      disabled={!product.in_stock || activeQty >= product.stock_quantity}
                      aria-label={t('زيادة الكمية', 'Increase quantity')}
                      className="p-0.5 transition-opacity disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Cancel Button on Mobile */}
                  <button
                    type="button"
                    onClick={cancelPendingAdd}
                    className="inline-flex flex-1 sm:hidden items-center justify-center gap-1.5 rounded-full border-2 border-ink/20 bg-white px-4 py-2.5 text-xs font-black text-ink shadow-sm transition-colors hover:border-baladi-red hover:text-baladi-red active:scale-95"
                  >
                    <X className="h-4 w-4 shrink-0" />
                    <span>{t('إلغاء', 'Cancel')}</span>
                  </button>
                </div>

                {/* Confirming Button (Full width on mobile, flex-1 on desktop) */}
                <button
                  type="button"
                  onClick={() => void commitPendingAdd(true)}
                  className={`btn relative w-full sm:flex-1 overflow-hidden shadow-lg py-3.5 whitespace-nowrap ${
                    isCat ? 'btn-accent theme-cat' : 'btn-accent theme-dog'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 start-0 bg-ink/25 transition-all duration-1000 ease-linear"
                    style={{ width: `${graceProgressPercent}%` }}
                  />
                  <span className="relative z-10 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-black tabular-nums">
                    <Timer className="h-4 w-4 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                    <span>
                      {t(
                        `جاري التأكيد · ${displayGraceSeconds} ث · ${egp(product.price * activeQty, lang)}`,
                        `Confirming · ${displayGraceSeconds}s · ${egp(product.price * activeQty, lang)}`
                      )}
                    </span>
                  </span>
                </button>

                {/* Cancel Button on Desktop */}
                <button
                  type="button"
                  onClick={cancelPendingAdd}
                  className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink/20 bg-white px-4 py-3 text-xs font-black text-ink shadow-sm transition-colors hover:border-baladi-red hover:text-baladi-red active:scale-95"
                >
                  <X className="h-4 w-4 shrink-0" />
                  <span>{t('إلغاء', 'Cancel')}</span>
                </button>
              </div>
            )}

            {isPendingThisProduct && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border hairline bg-cream/70 p-3 text-[11.5px] sm:text-xs font-bold leading-relaxed text-ink/80 shadow-xs">
                <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0 text-baladi-yellow" />
                <span>
                  {t(
                    `مهلة ١٠ ثوانٍ — يمكنك تعديل الكمية (${activeQty}) أو الإلغاء، وإذا انتقلت لصفحة أخرى سيُضاف المنتج للسلة فوراً`,
                    `10s grace window — adjust qty (${activeQty}) or cancel; leaving this page adds it immediately`
                  )}
                </span>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
              {[
                {
                  icon: <Truck className={`h-4 w-4 shrink-0 ${accent}`} strokeWidth={1.9} />,
                  a: settings?.free_shipping_threshold
                    ? `شحن مجاني فوق ${settings.free_shipping_threshold} ج.م`
                    : 'توصيل لكل المحافظات',
                  b: settings?.free_shipping_threshold
                    ? `Free shipping over ${settings.free_shipping_threshold} EGP`
                    : 'Nationwide delivery',
                },
                {
                  icon: <ShieldCheck className={`h-4 w-4 shrink-0 ${accent}`} strokeWidth={1.9} />,
                  a: 'مواصفة ٣٢١٥/٢٠٠٢',
                  b: 'ES 3215/2002 compliant',
                },
                {
                  icon: <Leaf className={`h-4 w-4 shrink-0 ${accent}`} strokeWidth={1.9} />,
                  a: 'بدون مكسبات طعم',
                  b: 'No artificial flavours',
                },
                {
                  icon: isCat ? (
                    <BaladiCatEmblem size={17} color="#E84249" />
                  ) : (
                    <BaladiDogEmblem size={17} color="#1E996C" />
                  ),
                  a: 'مناسب للبلدى',
                  b: 'Made for Baladi',
                },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-white/90 p-2.5 text-[11px] sm:text-[11.5px] font-black text-ink shadow-xs">
                  {b.icon} <span className="truncate">{t(b.a, b.b)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DETAILS ────────────────────────────────────────────── */}
      <section className="bg-white py-14 md:py-20">
        <div className="u-container grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className={`t-eyebrow ${accent}`}>{t('تفاصيل المنتج', 'PRODUCT DETAILS')}</p>
            <h2 className="t-display mt-3 text-[clamp(1.5rem,3vw,2.2rem)] text-ink">{t('بيانات المنتج من المتجر', 'Product specifications')}</h2>
            <div className="mt-6 grid gap-x-8 gap-y-0 sm:grid-cols-2">
              {[
                { label: t('كود المنتج', 'SKU'), value: product.sku },
                { label: t('العالم', 'World'), value: s.name[lang] },
                { label: t('القسم', 'Category'), value: categoryTitle },
                { label: t('الحالة', 'Availability'), value: product.in_stock ? t(`متوفر (${product.stock_quantity})`, `In stock (${product.stock_quantity})`) : t('غير متوفر', 'Out of stock') },
                { label: t('السعر', 'Price'), value: egp(product.price, lang) },
                { label: t('الخصم', 'Discount'), value: product.discount_percent ? `${product.discount_percent}%` : t('لا يوجد', 'None') },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-ink/8 py-3">
                  <span className="text-[13.5px] font-extrabold text-ink/80">{row.label}</span>
                  <span className={`text-[14px] font-black ${accent}`}>{row.value}</span>
                </div>
              ))}
            </div>

            {product.description && (
              <>
                <p className="t-eyebrow mt-10 text-ink/70">{t('الوصف الكامل', 'FULL DESCRIPTION')}</p>
                <p className="mt-3 text-[14px] font-medium leading-relaxed text-ink/85">{product.description}</p>
              </>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[26px] bg-ink p-6 text-cream">
              <p className="t-eyebrow text-baladi-yellow">{t('توصيل وشحن', 'SHIPPING INFO')}</p>
              <p className="mt-3 text-[13px] font-medium leading-relaxed text-cream/90">
                {settings?.free_shipping_threshold
                  ? t(
                      `الشحن الأساسي ${settings.shipping_flat} ج.م، ومجاني للطلبات فوق ${settings.free_shipping_threshold} ج.م حسب المحافظة.`,
                      `Base shipping is ${settings.shipping_flat} EGP, and free for orders over ${settings.free_shipping_threshold} EGP depending on governorate.`
                    )
                  : t(
                      'الشحن بيتم لكل محافظات مصر وتكلفة التوصيل بتتحسب حسب المحافظة عند إتمام الطلب.',
                      'Delivery covers all Egyptian governorates with rates calculated at checkout.'
                    )}
              </p>
              <div className="mt-5 flex items-center gap-2">
                <DiamondBadge size={26} accent="#FBBB21" />
                <span className="text-[11px] font-bold text-cream/80">{t('مُصنَّع فى مصر', 'Made in Egypt')}</span>
              </div>
            </div>
            <div className={`rounded-[26px] p-6 ${isCat ? 'bg-baladi-red/10' : 'bg-baladi-green/10'}`}>
              <p className={`t-eyebrow ${accent}`}>{s.eyebrow[lang]}</p>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink/85">{s.intro[lang]}</p>
              <Link to={`/${routeSpecies}`} className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.14em] text-ink/80 hover:text-ink">
                {t('كل منتجات', 'All')} {s.name[lang]} <span className="inline-block rtl:rotate-180">→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ── RELATED ───────────────────────────────────────────── */}
      {rel.length > 0 && (
        <section className="bg-cream py-14 md:py-20">
          <div className="u-container">
            <p className={`t-eyebrow ${accent}`}>{t('ممكن يعجبك', 'YOU MAY ALSO LIKE')}</p>
            <h2 className="t-display mt-3 text-[clamp(1.5rem,3vw,2.2rem)]">{t('من نفس العالم', 'From the same world')}</h2>
            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {rel.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}><ProductCard product={p} /></Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}