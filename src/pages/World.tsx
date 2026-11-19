import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Minus, Plus } from 'lucide-react';
import { SPECIES, type Species } from '../data/catalog';
import { useLang } from '../lib/lang';
import { useStorefront } from '../store/storefront';
import { getCategoryTitle, getProductFallbackImage, getProductTitle, resolveProductImage } from '../lib/api';
import ProductCard from '../components/sections/ProductCard';
import Reveal from '../components/ui/Reveal';
import { Mark, ZigZagBand, DiamondBadge, LeafStem, BaladiGridBackground } from '../components/brand/Ornaments';
import { GhostAnimal, Thunder } from '../components/brand/Ornaments2';

export default function World({ species }: { species: Species }) {
  const { sub } = useParams();
  const { t, lang } = useLang();
  const s = SPECIES[species];
  const isCat = species === 'cats';

  const allProducts = useStorefront((st) => st.products);
  const allCategories = useStorefront((st) => st.categories);
  const faqs = useStorefront((st) => st.faqs);
  const settings = useStorefront((st) => st.settings);
  const isLoadingCatalog = useStorefront((st) => st.isLoadingCatalog);
  const isLoadingContent = useStorefront((st) => st.isLoadingContent);

  const subs = allCategories.filter((c) => c.species === s.apiSpecies);
  const activeCategory = sub ? subs.find((x) => x.slug === sub) || null : null;
  const activeSub = activeCategory ? activeCategory.slug : null;

  const worldProducts = allProducts.filter((p) => p.species === s.apiSpecies);
  const products = activeSub
    ? worldProducts.filter((p) => p.category?.slug === activeSub)
    : worldProducts;

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const accent = isCat ? 'text-baladi-red' : 'text-baladi-green';
  const accentBg = isCat ? 'bg-baladi-red' : 'bg-baladi-green';

  return (
    <div className={isCat ? 'theme-cat' : 'theme-dog'}>
      {/* ── WORLD HERO ─────────────────────────────────────────── */}
      <section className={`relative overflow-hidden ${isCat ? 'bg-baladi-red' : 'bg-baladi-green'} pt-[68px] text-white md:pt-[84px]`}>
        <BaladiGridBackground opacity={0.12} />
        <Thunder color="rgba(251,187,33,.85)" height={22} className="absolute inset-x-0 top-[68px] md:top-[84px]" />
        <GhostAnimal species={species} src={s.silhouette} className="-bottom-16 end-[-8%] h-[95%] w-auto" opacity={0.18} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(110deg, rgba(35,37,79,.34), transparent 60%)' }} />
        <LeafStem className="absolute start-8 top-32 hidden opacity-30 lg:block" color="#FBF6EE" height={160} />

        <div className="u-container relative z-10 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-[11.5px] font-black uppercase tracking-[0.16em] text-white/90">
            <Link to="/" className="hover:text-white">{t('الرئيسية', 'Home')}</Link>
            <ChevronRight className="h-3 w-3 rtl:rotate-180" />
            <span className="text-white">{s.name[lang]}</span>
            {activeCategory && (
              <>
                <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                <span className="text-white">{getCategoryTitle(activeCategory, lang)}</span>
              </>
            )}
          </nav>

          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="t-eyebrow text-baladi-yellow">{s.eyebrow[lang]} · {t('عالم كامل', 'A WHOLE WORLD')}</p>
              <h1 className="t-display mt-3 text-[clamp(3rem,8vw,6.5rem)] text-white">{s.name[lang]}</h1>
              <p className="mt-5 max-w-xl text-[15.5px] font-medium leading-relaxed text-white/95">{s.intro[lang]}</p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link
                  to={subs[0] ? `/${species}/${subs[0].slug}` : `/${species}`}
                  className="rounded-full bg-white px-5 py-2.5 text-[13px] font-black text-ink transition-transform hover:-translate-y-0.5"
                >
                  {t('تسوق الآن', 'Shop now')}
                </Link>
                <Link to="/story" className="rounded-full border border-white/40 px-5 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-white/12">
                  {t('عن البراند', 'About the brand')}
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-start gap-4 rounded-[26px] border border-white/20 bg-white/10 p-5 backdrop-blur-md lg:items-end lg:text-end">
              <Mark tone={s.mark} white className="h-9" />
              <p className="text-[12.5px] font-bold leading-relaxed text-white/95">
                {subs.length > 0
                  ? t(
                      `${subs.length} أقسام متخصصة و ${worldProducts.length} منتج ل${s.name.ar}`,
                      `${subs.length} categories and ${worldProducts.length} products for ${s.name.en.toLowerCase()}`
                    )
                  : s.intro[lang]}
                {settings?.free_shipping_threshold
                  ? ` · ${t(
                      `شحن مجاني فوق ${settings.free_shipping_threshold} ج.م`,
                      `Free shipping over ${settings.free_shipping_threshold} EGP`
                    )}`
                  : ''}
              </p>
              <div className="flex gap-3">
                <DiamondBadge size={30} accent="#FBBB21" />
                <DiamondBadge size={30} accent="#23254F" dot="#FBBB21" />
              </div>
            </div>
          </div>
        </div>
        <ZigZagBand color="#FBBB21" height={26} />
      </section>

      {/* ── SUB-CATEGORY NAV ───────────────────────────────────── */}
      <section className="sticky top-[68px] z-30 border-b hairline bg-white/95 backdrop-blur-xl md:top-[84px]">
        <div className="u-container flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          <Link
            to={`/${species}`}
            className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-black transition-colors ${
              !activeSub ? `${accentBg} text-white` : 'bg-white text-ink/80 hover:text-ink'
            }`}
          >
            {t('كل الأقسام', 'All')} · {worldProducts.length}
          </Link>
          {subs.map((c) => {
            const matchedCount = worldProducts.filter((p) => p.category?.slug === c.slug).length;
            const count = matchedCount > 0 ? matchedCount : (c.products_count ?? 0);
            return (
              <Link
                key={c.slug}
                to={`/${species}/${c.slug}`}
                className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-black transition-colors ${
                  activeSub === c.slug ? `${accentBg} text-white` : 'bg-white text-ink/80 hover:text-ink'
                }`}
              >
                {getCategoryTitle(c, lang)} · {count}
              </Link>
            );
          })}
        </div>
      </section>

      {/* subcategory cards */}
      {!activeSub && subs.length > 0 && (
        <section className="bg-white pt-14">
          <div className="u-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subs.map((c, i) => {
              const p = worldProducts.find((prod) => prod.category?.slug === c.slug);
              const count = worldProducts.filter((prod) => prod.category?.slug === c.slug).length || c.products_count || 0;
              return (
                <Reveal key={c.slug} delay={i * 0.07}>
                  <Link
                    to={`/${species}/${c.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border hairline bg-white p-5 transition-shadow hover:shadow-lift"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`t-eyebrow ${accent}`}>{getCategoryTitle(c, lang)}</p>
                        <p className="mt-2 text-[13px] font-semibold text-ink/75">
                          {count} {t('منتج', count === 1 ? 'product' : 'products')}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-ink/50 transition-transform group-hover:-translate-y-0.5" />
                    </div>
                    {p && (
                      <div className="mt-6 grid h-36 place-items-center">
                        <img
                          src={resolveProductImage(p.image, p.species)}
                          alt={getProductTitle(p, lang)}
                          className="max-h-32 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = getProductFallbackImage(p.species);
                          }}
                        />
                      </div>
                    )}
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ── PRODUCT GRID ───────────────────────────────────────── */}
      <section className="bg-white py-14 md:py-20 border-t hairline">
        <div className="u-container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className={`t-eyebrow ${accent}`}>
                {activeCategory ? getCategoryTitle(activeCategory, lang) : t('كل المنتجات', 'All products')}
              </p>
              <h2 className="t-display mt-2 text-[clamp(1.6rem,3.4vw,2.5rem)]">
                {products.length} {t('منتج', products.length === 1 ? 'product' : 'products')}
              </h2>
            </div>
            <p className="hidden text-[12px] font-black uppercase tracking-[0.16em] text-ink/70 sm:block">
              {t('أسعار بالجنيه المصرى', 'Prices in EGP')}
            </p>
          </div>

          {isLoadingCatalog && allProducts.length === 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-[24px] border hairline bg-white p-5">
                  <div className="h-44 rounded-2xl bg-ink/[0.06]" />
                  <div className="mt-4 h-3 w-1/2 rounded-full bg-ink/[0.08]" />
                  <div className="mt-2 h-4 w-3/4 rounded-full bg-ink/[0.08]" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-ink/20 p-14 text-center">
              <p className="font-black text-ink/80">{t('لا يوجد منتجات فى القسم ده حالياً', 'No products in this section yet')}</p>
              <Link to={`/${species}`} className={`btn mt-5 ${isCat ? 'btn-accent theme-cat' : 'btn-accent theme-dog'}`}>
                {t('ارجع لكل الأقسام', 'Back to all')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {products.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.05}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20 border-t hairline">
        <div className="u-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className={`t-eyebrow ${accent}`}>{t('أسئلة شائعة', 'QUESTIONS')}</p>
            <h2 className="t-display mt-3 text-[clamp(1.6rem,3.4vw,2.5rem)] text-ink">{t('قبل ما تشترى', 'Before you buy')}</h2>
          </div>
          {isLoadingContent && faqs.length === 0 ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-ink/[0.06]" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-ink/10 border-y border-ink/10">
              {faqs.map((f, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-start font-black text-ink"
                  >
                    <span className="text-[14.5px] font-extrabold">{f.question}</span>
                    {openFaq === i ? <Minus className="h-4 w-4 shrink-0 text-baladi-red" /> : <Plus className="h-4 w-4 shrink-0 text-ink/70" />}
                  </button>
                  {openFaq === i && <p className="pb-5 text-[13.5px] font-medium leading-relaxed text-ink/80">{f.answer}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
