import { Link } from 'react-router-dom';
import { ArrowUpRight, HeartHandshake, Package, Sparkles, Truck } from 'lucide-react';
import Baladi3DHero from '../components/hero/Baladi3DHero';
import ProductCard from '../components/sections/ProductCard';
import Reveal from '../components/ui/Reveal';
import Tilt3D from '../components/ui/Tilt3D';
import { useLang } from '../lib/lang';
import { SPECIES } from '../data/catalog';
import { useStorefront } from '../store/storefront';
import {
  getCategoryTitle,
  getProductFallbackImage,
  getProductTitle,
  resolveProductImage,
} from '../lib/api';
import { egp } from '../lib/utils';
import { Mark, ZigZagBand, DiamondBadge, LeafStem, BaladiDogEmblem, BaladiCatEmblem, BaladiGridBackground } from '../components/brand/Ornaments';
import { GhostAnimal, Thunder } from '../components/brand/Ornaments2';

export default function Home() {
  const { t, lang } = useLang();
  const products = useStorefront((s) => s.products);
  const categories = useStorefront((s) => s.categories);
  const story = useStorefront((s) => s.story);
  const settings = useStorefront((s) => s.settings);
  const isLoadingCatalog = useStorefront((s) => s.isLoadingCatalog);
  const isLoadingContent = useStorefront((s) => s.isLoadingContent);

  const featuredProducts = products.filter((p) => p.is_featured);
  const bestsellers = (featuredProducts.length > 0 ? featuredProducts : products).slice(0, 4);

  return (
    <>
      <Baladi3DHero />

      {/* ── TWO WORLDS ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28 border-t hairline">
        <div className="u-container">
          <Reveal className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="t-eyebrow text-baladi-red">{t('قسمين بس', 'TWO WORLDS')}</p>
              <h2 className="t-display mt-3 text-[clamp(2rem,4.6vw,3.6rem)]">
                {t('اختار', 'Pick your')} <span className="text-baladi-red">{t('عالمك', 'world')}</span>
              </h2>
              <p className="mt-3 max-w-md text-[15px] font-medium leading-relaxed text-ink/80">
                {t(
                  'الموقع مقسوم لعالمين واضحين: القطط والكلاب. جوه كل عالم، أقسام المنتجات ونوع الأكل.',
                  'The store is split into two clear worlds: cats and dogs. Inside each, product families and food types.'
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-ink/70">
              <Package className="h-4 w-4 text-baladi-red" />
              {settings?.free_shipping_threshold
                ? t(
                    `شحن مجاني فوق ${settings.free_shipping_threshold} ج.م`,
                    `Free shipping from ${settings.free_shipping_threshold} EGP`
                  )
                : t('توصيل لكل المحافظات', 'Nationwide delivery')}
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            {(['cats', 'dogs'] as const).map((key, idx) => {
              const s = SPECIES[key];
              const isCat = key === 'cats';
              const worldCategories = categories.filter((c) => c.species === s.apiSpecies);
              const worldProducts = products.filter((p) => p.species === s.apiSpecies);
              return (
                <Reveal key={key} delay={idx * 0.08}>
                  <Tilt3D strength={7}>
                    <Link
                      to={`/${key}`}
                      className={`group relative flex min-h-[420px] flex-col overflow-hidden rounded-[34px] ${
                        isCat ? 'theme-cat bg-baladi-red' : 'theme-dog bg-baladi-green'
                      }`}
                    >
                      <div className="absolute inset-0 opacity-[0.16] mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 20% 10%, #fff 0%, transparent 45%)' }} />
                      <BaladiGridBackground opacity={0.14} />
                      <Thunder color="rgba(251,187,33,.9)" height={20} className="absolute inset-x-0 top-0" />
                      <div className="absolute -bottom-6 end-[-4%] opacity-20 transition-transform duration-700 group-hover:scale-110">
                        {isCat ? (
                          <BaladiCatEmblem size={220} color="#FFFFFF" />
                        ) : (
                          <BaladiDogEmblem size={220} color="#FFFFFF" />
                        )}
                      </div>
                      <div className="relative z-10 flex flex-1 flex-col p-8 md:p-10">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="t-eyebrow text-white/90">{s.eyebrow[lang]}</p>
                            <h3 className="t-display mt-2 text-[clamp(2.4rem,5vw,3.6rem)] text-white">{s.name[lang]}</h3>
                          </div>
                          <DiamondBadge size={38} ink="#23254F" accent="#FBBB21" dot="#FBF6EE" />
                        </div>
                        <p className="mt-4 max-w-[30ch] text-[14.5px] font-medium leading-relaxed text-white/95">{s.intro[lang]}</p>
                        <div className="mt-auto pt-8">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-[13px] font-black text-white backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-ink">
                            {t('ادخل عالم', 'Enter the')} {s.name[lang]} <ArrowUpRight className="h-4 w-4" />
                          </span>
                          <p className="mt-3 text-[11.5px] font-black uppercase tracking-[0.18em] text-white/85">
                            {worldCategories.length > 0 || worldProducts.length > 0
                              ? `${worldCategories.length} ${t('أقسام', 'categories')} · ${worldProducts.length} ${t('منتج', 'products')}`
                              : t('تغذية متوازنة يومياً', 'Balanced daily nutrition')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </Tilt3D>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BRAND STORY PLATE ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-20 text-ink md:py-28 border-t hairline">
        <BaladiGridBackground opacity={0.03} />
        <ZigZagBand color="#E84249" height={20} className="absolute inset-x-0 top-0 opacity-40" />
        <LeafStem className="absolute end-6 top-16 hidden opacity-15 md:block" color="#23254F" height={180} />
        <GhostAnimal species="dogs" src="/brand/dog-emblem.png" className="-bottom-16 -start-20 h-[70%] w-auto" opacity={0.04} />

        <div className="u-container relative">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <p className="t-eyebrow text-baladi-red">{t('القصة', 'THE STORY')}</p>
              <h2 className="t-display mt-4 text-[clamp(2rem,4.4vw,3.4rem)] text-ink">
                {t('الحيوانات البلدى', 'Baladi animals')}<br />
                <span className="text-baladi-red">{t('تستاهل أكل كامل', 'deserve complete food')}</span>
              </h2>
              {isLoadingContent && story.length === 0 ? (
                <div className="mt-6 max-w-lg space-y-3">
                  <div className="h-4 w-11/12 animate-pulse rounded-full bg-ink/10" />
                  <div className="h-4 w-4/5 animate-pulse rounded-full bg-ink/10" />
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-ink/10" />
                </div>
              ) : story.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {story.slice(0, 2).map((sec, idx) => (
                    <p key={idx} className="max-w-lg text-[15px] font-medium leading-relaxed text-ink/85">
                      {sec.body}
                    </p>
                  ))}
                </div>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/story" className="btn btn-red">{t('اقرأ القصة كاملة', 'Read the full story')}</Link>
                <Link to="/cats" className="btn btn-ghost">{t('ابدأ التسوق', 'Shop now')}</Link>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-[42px] border hairline" />
                <div className="relative grid grid-cols-2 gap-3">
                  {[
                    { icon: HeartHandshake, a: 'إطعام الشارع', b: 'Street feeding', n: '01' },
                    { icon: Sparkles, a: 'بدون مكسبات طعم', b: 'No flavour enhancers', n: '02' },
                    { icon: Package, a: 'أكياس محكمة', b: 'Sealed packs', n: '03' },
                    { icon: Truck, a: 'توصيل سريع', b: 'Fast delivery', n: '04' },
                  ].map((c) => (
                    <div key={c.n} className="rounded-3xl border hairline bg-slate-50/80 p-5 shadow-xs">
                      <c.icon className="h-5 w-5 text-baladi-red" strokeWidth={1.8} />
                      <p className="mt-6 text-[13.5px] font-extrabold leading-snug text-ink">{t(c.a, c.b)}</p>
                      <p className="mt-1 text-[11px] font-black tracking-[0.2em] text-ink/50">{c.n}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── BESTSELLERS ─────────────────────────────────────────── */}
      <section className="relative bg-white py-20 md:py-28 border-t hairline">
        <div className="u-container">
          <Reveal className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="t-eyebrow text-baladi-red">{t('المميزة', 'FEATURED')}</p>
              <h2 className="t-display mt-3 text-[clamp(1.9rem,4.2vw,3.2rem)] text-ink">{t('اللى الناس بتشتريه', 'What people buy')}</h2>
            </div>
            <Link to="/cats" className="hidden text-[12.5px] font-black uppercase tracking-[0.16em] text-ink/75 hover:text-ink md:block">
              {t('كل المنتجات', 'All products')} <span className="inline-block rtl:rotate-180">→</span>
            </Link>
          </Reveal>
          {isLoadingCatalog && products.length === 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-[24px] border hairline bg-white/80 p-5">
                  <div className="h-44 rounded-2xl bg-ink/[0.06]" />
                  <div className="mt-4 h-3 w-1/2 rounded-full bg-ink/[0.08]" />
                  <div className="mt-2 h-4 w-3/4 rounded-full bg-ink/[0.08]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {bestsellers.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORY STRIPS ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-20 md:py-24">
        <div className="u-container grid gap-6 lg:grid-cols-2">
          {(['cats', 'dogs'] as const).map((key) => {
            const s = SPECIES[key];
            const items = products.filter((p) => p.species === s.apiSpecies).slice(0, 3);
            return (
              <div key={key} className={`relative overflow-hidden rounded-[30px] border hairline p-7 ${key === 'cats' ? 'theme-cat' : 'theme-dog'}`}>
                <div className="flex items-center justify-between">
                  <p className={`t-eyebrow ${key === 'cats' ? 'text-baladi-red' : 'text-baladi-green'}`}>{s.signature[lang]}</p>
                  <Mark tone={s.mark} className="h-7" />
                </div>
                <div className="mt-6 space-y-2">
                  {isLoadingCatalog && items.length === 0 ? (
                    [0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-4 rounded-2xl bg-slate-50 border hairline p-2.5">
                        <div className="h-14 w-14 animate-pulse rounded-xl bg-white" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-ink/10" />
                          <div className="h-3 w-1/3 animate-pulse rounded-full bg-ink/10" />
                        </div>
                      </div>
                    ))
                  ) : (
                    items.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug}`}
                        className="flex items-center gap-4 rounded-2xl bg-slate-50 border hairline p-2.5 transition-colors hover:bg-slate-100"
                      >
                        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white p-1">
                          <img
                            src={resolveProductImage(p.image, p.species)}
                            alt={getProductTitle(p, lang)}
                            className="max-h-12 w-auto object-contain"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = getProductFallbackImage(p.species);
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-extrabold text-ink">{getProductTitle(p, lang)}</p>
                          <p className="text-[11.5px] font-semibold text-ink/75">
                            {getCategoryTitle(p.category, lang)} · {egp(p.price, lang)}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-ink/60" />
                      </Link>
                    ))
                  )}
                </div>
                <Link to={`/${key}`} className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.16em] text-ink/80 hover:text-ink">
                  {t('كل منتجات', 'All')} {s.name[lang]} <span className="inline-block rtl:rotate-180">→</span>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CLOSING BAND ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-baladi-yellow py-16">
        <Thunder color="rgba(35,37,79,.28)" height={18} className="absolute inset-x-0 top-0" />
        <div className="u-container flex flex-col items-center gap-6 text-center">
          <Mark tone="red" className="h-12 drop-shadow-xs" />
          <h2 className="t-display max-w-2xl text-[clamp(1.8rem,4vw,3rem)] text-ink">
            {t('اطعم صح، تفرق كتير', 'Feed right, it changes everything')}
          </h2>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link
              to="/cats"
              className="btn bg-baladi-red text-white hover:brightness-110 shadow-md inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <BaladiCatEmblem size={18} color="currentColor" />
              <span>{t('عالم القطط', 'Cats world')}</span>
            </Link>
            <Link
              to="/dogs"
              className="btn bg-baladi-green text-white hover:brightness-110 shadow-md inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <BaladiDogEmblem size={18} color="currentColor" />
              <span>{t('عالم الكلاب', 'Dogs world')}</span>
            </Link>
          </div>
        </div>
        <Thunder color="rgba(35,37,79,.28)" height={18} className="absolute inset-x-0 bottom-0 rotate-180" />
      </section>
    </>
  );
}
