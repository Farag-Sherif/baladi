import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, SlidersHorizontal, Sparkles, ArrowRight } from 'lucide-react';
import { PRODUCTS, type Product } from '../data/catalog';
import { useLang } from '../lib/lang';
import ProductCard from '../components/sections/ProductCard';
import Reveal from '../components/ui/Reveal';
import { Mark, ZigZagBand } from '../components/brand/Ornaments';

const QUICK_TAGS = [
  { ar: 'طعام جاف للقطط', en: 'Cat dry food', query: 'قطط' },
  { ar: 'طعام جاف للكلاب', en: 'Dog dry food', query: 'كلاب' },
  { ar: 'كيتن وصغار', en: 'Kitten', query: 'كيتن' },
  { ar: 'دجاج', en: 'Chicken', query: 'دجاج' },
  { ar: 'مكافآت ومضغ', en: 'Treats & Chews', query: 'مضغ' },
];

export default function SearchPage() {
  const { t, lang } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'cats' | 'dogs'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return PRODUCTS.filter((p) => {
      // Species filter
      if (speciesFilter !== 'all' && p.species !== speciesFilter) {
        return false;
      }

      // Query filter
      if (!q) return true;

      const nameAr = p.name.ar.toLowerCase();
      const nameEn = p.name.en.toLowerCase();
      const flavorAr = p.flavor.ar.toLowerCase();
      const flavorEn = p.flavor.en.toLowerCase();
      const tagAr = p.tagline.ar.toLowerCase();
      const tagEn = p.tagline.en.toLowerCase();
      const descAr = p.description.ar.toLowerCase();
      const descEn = p.description.en.toLowerCase();
      const weight = p.weight.toLowerCase();
      const speciesWord = p.species === 'cats' ? 'قطط قطة cat' : 'كلاب كلب dog';

      return (
        nameAr.includes(q) ||
        nameEn.includes(q) ||
        flavorAr.includes(q) ||
        flavorEn.includes(q) ||
        tagAr.includes(q) ||
        tagEn.includes(q) ||
        descAr.includes(q) ||
        descEn.includes(q) ||
        weight.includes(q) ||
        speciesWord.includes(q)
      );
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [query, speciesFilter, sortBy]);

  return (
    <div className="min-h-screen bg-cream pt-[68px] md:pt-[84px]">
      {/* ── SEARCH HEADER ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink py-12 text-cream md:py-16">
        <ZigZagBand color="#FBBB21" height={22} className="absolute inset-x-0 top-0 opacity-80" />
        <div className="u-container relative text-center">
          <p className="t-eyebrow text-baladi-yellow">{t('البحث في المتجر', 'STORE SEARCH')}</p>
          <h1 className="t-display mt-3 text-[clamp(2rem,4.6vw,3.4rem)] text-white">
            {t('ابحث عن أكل أليفك', 'Find Pet Nutrition')}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[15px] font-medium text-cream/90">
            {t(
              'ابحث بالاسم، نوع الأكل، الحجم أو نوع الحيوان (قطط أو كلاب).',
              'Search by product name, food type, pack size, or animal species.'
            )}
          </p>

          {/* Search Input Bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-ink/60">
                <Search className="h-5 w-5 text-baladi-red" />
              </span>
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث باسم المنتج، دجاج، كيتن، كلاب بالغة...' : 'Search by product, chicken, kitten, adult...'}
                className="w-full rounded-full border-2 border-baladi-yellow/70 bg-white py-4 ps-12 pe-12 text-base font-bold text-ink shadow-lift placeholder:text-ink/40 focus:border-baladi-yellow focus:outline-none focus:ring-4 focus:ring-baladi-yellow/20"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => handleQueryChange('')}
                  className="absolute inset-y-0 end-0 flex items-center pe-4 text-ink/50 hover:text-ink"
                  aria-label={t('مسح البحث', 'Clear')}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Quick search tags */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-1 text-xs font-black text-baladi-yellow">
                <Sparkles className="h-3.5 w-3.5" />
                {t('كلمات شائعة:', 'Popular:')}
              </span>
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag.en}
                  type="button"
                  onClick={() => handleQueryChange(tag.query)}
                  className="rounded-full border border-cream/30 bg-cream/10 px-3.5 py-1 text-xs font-bold text-cream transition-colors hover:bg-baladi-yellow hover:text-ink"
                >
                  {tag[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERS & RESULTS ───────────────────────────────────── */}
      <div className="u-container py-10 md:py-14">
        {/* Filter controls */}
        <div className="mb-8 flex flex-col gap-4 rounded-[26px] border hairline bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: t('كل المنتجات', 'All Products') },
              { id: 'cats', label: t('قطط 🐱', 'Cats 🐱') },
              { id: 'dogs', label: t('كلاب 🐕', 'Dogs 🐕') },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSpeciesFilter(f.id as typeof speciesFilter)}
                className={`rounded-full px-4 py-2 text-xs font-black transition-colors ${
                  speciesFilter === f.id
                    ? 'bg-ink text-white'
                    : 'bg-cream/60 text-ink/80 hover:bg-cream hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-ink/65">{t('الترتيب:', 'Sort by:')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl border hairline bg-cream/50 px-3 py-1.5 text-xs font-black text-ink focus:border-baladi-red focus:outline-none"
            >
              <option value="featured">{t('المميز أولاً', 'Featured')}</option>
              <option value="price-asc">{t('السعر: من الأقل للأعلى', 'Price: Low to High')}</option>
              <option value="price-desc">{t('السعر: من الأعلى للأقل', 'Price: High to Low')}</option>
              <option value="rating">{t('الأعلى تقييماً', 'Highest Rated')}</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-black text-ink">
            {results.length > 0 ? (
              <>
                {t('تم العثور على', 'Found')}{' '}
                <span className="text-baladi-red">{results.length}</span>{' '}
                {t('منتج', results.length === 1 ? 'product' : 'products')}
                {query && (
                  <span>
                    {' '}
                    {t('للبحث عن', 'for')}: "{query}"
                  </span>
                )}
              </>
            ) : (
              t('لم يتم العثور على نتائج', 'No products found')
            )}
          </p>
        </div>

        {/* Product Cards Grid */}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {results.map((product, idx) => (
              <Reveal key={product.id} delay={idx * 0.04}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border hairline bg-white p-14 text-center shadow-soft">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-cream text-ink/40">
              <Search className="h-8 w-8 text-baladi-red" />
            </div>
            <h3 className="text-xl font-black text-ink">
              {t('لم نجد أي منتجات تطابق بحثك', 'No matching products found')}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-bold text-ink/70">
              {t(
                'جرّب كتابة كلمات أبسط مثل "قطط" أو "كلاب" أو تصفح الأقسام مباشرة.',
                'Try simpler keywords like "cat" or "dog", or browse our categories directly.'
              )}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSpeciesFilter('all');
                }}
                className="btn btn-ink"
              >
                {t('عرض جميع المنتجات', 'View All Products')}
              </button>
              <Link to="/cats" className="btn btn-accent theme-cat">
                {t('عالم القطط', 'Cats World')}
              </Link>
              <Link to="/dogs" className="btn btn-accent theme-dog">
                {t('عالم الكلاب', 'Dogs World')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
