import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../../data/catalog';
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS.slice(0, 4);

    return PRODUCTS.filter((p) => {
      const nameAr = p.name.ar.toLowerCase();
      const nameEn = p.name.en.toLowerCase();
      const flavorAr = p.flavor.ar.toLowerCase();
      const flavorEn = p.flavor.en.toLowerCase();
      const tagAr = p.tagline.ar.toLowerCase();
      const tagEn = p.tagline.en.toLowerCase();
      const speciesWord = p.species === 'cats' ? 'قطط قطة cat' : 'كلاب كلب dog';

      return (
        nameAr.includes(q) ||
        nameEn.includes(q) ||
        flavorAr.includes(q) ||
        flavorEn.includes(q) ||
        tagAr.includes(q) ||
        tagEn.includes(q) ||
        speciesWord.includes(q)
      );
    }).slice(0, 6);
  }, [query]);

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleFullSearch = () => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
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
          <Search className="h-6 w-6 text-baladi-red shrink-0" />
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
              onClick={() => setQuery('')}
              className="rounded-full p-1 text-ink/40 hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
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
          {['قطط', 'كلاب', 'دجاج', 'كيتن'].map((tag) => (
            <button
              key={tag}
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
            {query ? t('نتائج البحث', 'Search Results') : t('المنتجات المقترحة', 'Suggested Products')}
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered.map((p) => {
                const isCat = p.species === 'cats';
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p.slug)}
                    className="flex w-full items-center gap-3.5 rounded-2xl p-2.5 text-start transition-colors hover:bg-cream"
                  >
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-cream p-1">
                      <img src={p.image} alt="" className="max-h-14 w-auto object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            isCat ? 'bg-baladi-green/10 text-baladi-green' : 'bg-baladi-red/10 text-baladi-red'
                          }`}
                        >
                          {isCat ? t('قطط', 'Cat') : t('كلاب', 'Dog')}
                        </span>
                        <p className="truncate text-sm font-black text-ink">{p.name[lang]}</p>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-ink/70">
                        {p.flavor[lang]} · {p.weight}
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
            {t('اضغط Enter لعرض صفحة البحث الشاملة', 'Press Enter for full search page')}
          </span>
          <button
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
