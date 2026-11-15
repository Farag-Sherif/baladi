import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import {
  catalogApi,
  getCategoryTitle,
  getProductFallbackImage,
  getProductTitle,
  resolveProductImage,
  type ApiProduct,
} from '../../lib/api';
import { useStorefront } from '../../store/storefront';
import { useLang } from '../../lib/lang';
import { egp } from '../../lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [apiResults, setApiResults] = useState<ApiProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const storefrontProducts = useStorefront((s) => s.products);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setApiResults([]);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setApiResults([]);
      setIsSearching(false);
      return;
    }

    let active = true;
    setIsSearching(true);
    const timer = window.setTimeout(() => {
      catalogApi
        .listProducts({ q: trimmed, per_page: 6 }, lang)
        .then((res) => {
          if (active) setApiResults(res.data || []);
        })
        .catch(() => {
          if (active) setApiResults([]);
        })
        .finally(() => {
          if (active) setIsSearching(false);
        });
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, lang, isOpen]);

  const filtered = query.trim() ? apiResults : storefrontProducts.slice(0, 4);

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleFullSearch = () => {
    onClose();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/70 p-4 pt-16 backdrop-blur-md md:pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[32px] border hairline bg-white shadow-2xl animate-[fadeIn_.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b hairline px-6 py-4">
          <Search className="h-6 w-6 shrink-0 text-baladi-red" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFullSearch();
            }}
            placeholder={
              lang === 'ar'
                ? 'ابحث عن أكل للقطط أو الكلاب، دجاج، كيتن...'
                : 'Search cat or dog food, chicken, kitten...'
            }
            className="w-full bg-transparent ps-3 pe-8 text-base font-bold text-ink placeholder:text-ink/40 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded-full p-1 text-ink/40 hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-ink/40 hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Quick suggestions tags */}
        <div className="flex flex-wrap items-center gap-2 border-b hairline bg-cream/40 px-6 py-3">
          <span className="text-[11px] font-black text-ink/65">{t('اقتراحات سريعة:', 'Quick tags:')}</span>
          {[
            t('قطط', 'cat'),
            t('كلاب', 'dog'),
            t('دجاج', 'chicken'),
            t('تريتس', 'treats'),
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink shadow-sm transition-colors hover:bg-baladi-yellow"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-ink/50">
            {query.trim()
              ? isSearching
                ? t('جاري البحث...', 'Searching...')
                : t('نتائج البحث', 'Search Results')
              : t('المنتجات المقترحة', 'Suggested Products')}
          </div>

          {isSearching ? (
            <div className="space-y-2 p-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3.5 rounded-2xl bg-cream/60 p-2.5">
                  <div className="h-14 w-14 animate-pulse rounded-xl bg-white" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-ink/10" />
                    <div className="h-3 w-1/3 animate-pulse rounded-full bg-ink/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered.map((p) => {
                const isCat = p.species === 'cat';
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProduct(p.slug)}
                    className="flex w-full items-center gap-3.5 rounded-2xl p-2.5 text-start transition-colors hover:bg-cream"
                  >
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-cream p-1">
                      <img
                        src={resolveProductImage(p.image, p.species)}
                        alt={getProductTitle(p, lang)}
                        className="max-h-14 w-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.src = getProductFallbackImage(p.species);
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            isCat ? 'bg-baladi-red/10 text-baladi-red' : 'bg-baladi-green/10 text-baladi-green'
                          }`}
                        >
                          {isCat ? t('قطط', 'Cat') : t('كلاب', 'Dog')}
                        </span>
                        <p className="truncate text-sm font-black text-ink">{getProductTitle(p, lang)}</p>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-ink/70">
                        {getCategoryTitle(p.category, lang)} · {p.in_stock ? t('متوفر', 'In stock') : t('غير متوفر', 'Out of stock')}
                      </p>
                    </div>
                    <div className="text-end">
                      <span className="text-sm font-black text-ink">{egp(p.price, lang)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm font-bold text-ink/70">
                {t('لا توجد نتائج مطابقة لبحثك.', 'No matching products found.')}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t hairline bg-cream/30 px-6 py-3">
          <span className="text-xs font-bold text-ink/60">
            {t('اضغط زر الإدخال لعرض صفحة البحث الشاملة', 'Press Enter for full search page')}
          </span>
          <button
            type="button"
            onClick={handleFullSearch}
            className="inline-flex items-center gap-1.5 text-xs font-black text-baladi-red hover:underline"
          >
            <span>{t('كل النتائج في صفحة البحث', 'Full Search Page')}</span>
            <span className="inline-block rtl:rotate-180">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
