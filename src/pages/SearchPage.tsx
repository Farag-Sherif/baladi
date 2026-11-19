import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, Sparkles } from 'lucide-react';
import {
  catalogApi,
  extractErrorMessage,
  routeToSpecies,
  type ApiProduct,
  type ProductQueryParams,
} from '../lib/api';
import { useLang } from '../lib/lang';
import ProductCard from '../components/sections/ProductCard';
import Reveal from '../components/ui/Reveal';
import { ZigZagBand, BaladiCatEmblem, BaladiDogEmblem, BaladiDuoEmblem } from '../components/brand/Ornaments';

export default function SearchPage() {
  const { t, lang } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'cats' | 'dogs'>('all');
  const [sortBy, setSortBy] = useState<NonNullable<ProductQueryParams['sort']>>('newest');
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    const timer = window.setTimeout(() => {
      catalogApi
        .listProducts(
          {
            q: query.trim() || undefined,
            species: speciesFilter === 'all' ? undefined : routeToSpecies(speciesFilter),
            sort: sortBy,
            per_page: 50,
          },
          lang
        )
        .then((res) => {
          if (active) setResults(res.data || []);
        })
        .catch((err) => {
          if (active) {
            setResults([]);
            setError(extractErrorMessage(err, t('تعذر تحميل نتائج البحث', 'Could not load search results')));
          }
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, query.trim() ? 220 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, speciesFilter, sortBy, lang, t]);

  const quickTags = [
    { ar: 'طعام جاف للقطط', en: 'Cat dry food', query: lang === 'ar' ? 'قطط' : 'cat' },
    { ar: 'طعام جاف للكلاب', en: 'Dog dry food', query: lang === 'ar' ? 'كلاب' : 'dog' },
    { ar: 'دجاج', en: 'Chicken', query: lang === 'ar' ? 'دجاج' : 'chicken' },
    { ar: 'تونة', en: 'Tuna', query: lang === 'ar' ? 'تونة' : 'tuna' },
    { ar: 'تريتس ومكافآت', en: 'Treats', query: lang === 'ar' ? 'مكافآت' : 'treats' },
  ];

  return (
    <div className="min-h-screen bg-white pt-[68px] md:pt-[84px]">
      {/* ── SEARCH HEADER ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b hairline py-12 text-ink md:py-16">
        <ZigZagBand color="#E84249" height={16} className="absolute inset-x-0 top-0 opacity-40" />
        <div className="u-container relative text-center">
          <p className="t-eyebrow text-baladi-red">{t('البحث في المتجر', 'STORE SEARCH')}</p>
          <h1 className="t-display mt-3 text-[clamp(2rem,4.6vw,3.4rem)] text-ink">
            {t('ابحث عن أكل أليفك', 'Find Pet Nutrition')}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[15px] font-medium text-ink/80">
            {t(
              'ابحث بالاسم، نوع الأكل، أو نوع الحيوان (قطط أو كلاب).',
              'Search by product name, food type, or animal species.'
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
                className="w-full rounded-full border-2 border-baladi-red/40 bg-white py-4 ps-12 pe-12 text-base font-bold text-ink shadow-sm placeholder:text-ink/40 focus:border-baladi-red focus:outline-none focus:ring-4 focus:ring-baladi-red/15"
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
              <span className="flex items-center gap-1 text-xs font-black text-baladi-red">
                <Sparkles className="h-3.5 w-3.5" />
                {t('كلمات شائعة:', 'Popular:')}
              </span>
              {quickTags.map((tag) => (
                <button
                  key={tag.en}
                  type="button"
                  onClick={() => handleQueryChange(tag.query)}
                  className="rounded-full border border-ink/15 bg-slate-50 px-3.5 py-1 text-xs font-bold text-ink/80 transition-colors hover:bg-baladi-red hover:text-white"
                >
                  {lang === 'ar' ? tag.ar : tag.en}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERS & RESULTS ───────────────────────────────────── */}
      <div className="u-container py-10 md:py-14">
        <div className="mb-8 flex flex-col gap-4 rounded-[26px] border hairline bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: t('كل المنتجات', 'All Products'), Icon: BaladiDuoEmblem },
              { id: 'cats', label: t('قطط', 'Cats'), Icon: BaladiCatEmblem },
              { id: 'dogs', label: t('كلاب', 'Dogs'), Icon: BaladiDogEmblem },
            ].map((f) => {
              const active = speciesFilter === f.id;
              const Icon = f.Icon;
              const activeCls =
                f.id === 'cats'
                  ? 'bg-baladi-red text-white'
                  : f.id === 'dogs'
                  ? 'bg-baladi-green text-white'
                  : 'bg-ink text-white';
              const iconColor = active
                ? '#FFFFFF'
                : f.id === 'cats'
                ? '#E84249'
                : f.id === 'dogs'
                ? '#1E996C'
                : 'currentColor';
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSpeciesFilter(f.id as typeof speciesFilter)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black transition-colors ${
                    active ? activeCls : 'bg-cream/60 text-ink/80 hover:bg-cream hover:text-ink'
                  }`}
                >
                  <Icon size={f.id === 'all' ? 15 : 17} color={iconColor} />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-ink/65">{t('الترتيب:', 'Sort by:')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl border hairline bg-cream/50 px-3 py-1.5 text-xs font-black text-ink focus:border-baladi-red focus:outline-none"
            >
              <option value="newest">{t('الأحدث أولاً', 'Newest')}</option>
              <option value="price_asc">{t('السعر: من الأقل للأعلى', 'Price: Low to High')}</option>
              <option value="price_desc">{t('السعر: من الأعلى للأقل', 'Price: High to Low')}</option>
              <option value="name">{t('حسب الاسم', 'Name A–Z')}</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-black text-ink">
            {isLoading ? (
              t('جاري البحث...', 'Searching...')
            ) : results.length > 0 ? (
              <>
                {t('تم العثور على', 'Found')}{' '}
                <span className="text-baladi-red">{results.length}</span>{' '}
                {t('منتج', results.length === 1 ? 'product' : 'products')}
                {query && (
                  <span>
                    {' '}
                    {t('للبحث عن', 'for')}: &quot;{query}&quot;
                  </span>
                )}
              </>
            ) : (
              t('لم يتم العثور على نتائج', 'No products found')
            )}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-baladi-red/30 bg-baladi-red/10 px-4 py-3 text-xs font-extrabold text-baladi-red">
            {error}
          </div>
        )}

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-[24px] border hairline bg-white p-5">
                <div className="h-44 rounded-2xl bg-ink/[0.06]" />
                <div className="mt-4 h-3 w-1/2 rounded-full bg-ink/[0.08]" />
                <div className="mt-2 h-4 w-3/4 rounded-full bg-ink/[0.08]" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
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
                  handleQueryChange('');
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
