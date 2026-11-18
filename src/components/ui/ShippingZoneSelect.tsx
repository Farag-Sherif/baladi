import { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Search, ChevronDown, Check, X, Truck } from 'lucide-react';
import type { ApiGovernorate } from '../../lib/api';
import { useLang } from '../../lib/lang';
import { egp } from '../../lib/utils';

interface ShippingZoneSelectProps {
  zones: ApiGovernorate[];
  selectedId: number;
  onChange: (id: number) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Normalizes Arabic text for flexible search:
 * - normalizes Alef forms (أ, إ, آ, ا) -> ا
 * - normalizes Teh Marbuta (ة) -> ه
 * - normalizes Alef Maksura (ى) -> ي
 * - removes tashkeel & extra whitespace
 */
function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove diacritics
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function ShippingZoneSelect({
  zones,
  selectedId,
  onChange,
  label,
  placeholder,
  error,
  disabled = false,
  className = '',
}: ShippingZoneSelectProps) {
  const { t, lang } = useLang();
  const isRtl = lang === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedId),
    [zones, selectedId]
  );

  const normalizedQuery = useMemo(() => normalizeSearchText(searchQuery), [searchQuery]);

  const filteredZones = useMemo(() => {
    if (!normalizedQuery) return zones;
    return zones.filter((z) => {
      const arName = normalizeSearchText(z.name_ar || z.name);
      const enName = normalizeSearchText(z.name_en || z.name);
      return arName.includes(normalizedQuery) || enName.includes(normalizedQuery);
    });
  }, [zones, normalizedQuery]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (zone: ApiGovernorate) => {
    onChange(zone.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getZoneTitle = (z: ApiGovernorate) => {
    return lang === 'ar' ? z.name_ar || z.name : z.name_en || z.name;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="mb-1.5 flex items-center justify-between text-[12px] font-black uppercase text-ink/80">
          <span>{label}</span>
          {zones.length > 0 && (
            <span className="text-[10px] font-bold text-ink/50 lowercase">
              ({zones.length} {t('منطقة تغطية', 'zones available')})
            </span>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || zones.length === 0}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-xl border bg-cream/20 px-3.5 py-3 text-start text-[14px] font-bold text-ink transition-all focus:outline-none focus:ring-2 focus:ring-baladi-yellow disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-red-500' : 'hairline hover:bg-cream/40'
        } ${isOpen ? 'ring-2 ring-baladi-yellow bg-white shadow-sm' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 overflow-hidden pe-2">
          <MapPin className="h-4 w-4 shrink-0 text-baladi-red" />
          {selectedZone ? (
            <div className="truncate flex items-center gap-2">
              <span className="font-bold text-ink">{getZoneTitle(selectedZone)}</span>
              <span className="rounded-md bg-baladi-yellow/30 px-1.5 py-0.5 text-[11px] font-black text-ink">
                {egp(selectedZone.shipping_cost, lang)}
              </span>
            </div>
          ) : (
            <span className="text-ink/40">
              {placeholder || t('اختر منطقة الشحن والتوصيل...', 'Select shipping area...')}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink/50 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-ink' : ''
          }`}
        />
      </button>

      {error && <p className="mt-1 text-[11px] font-bold text-red-600">{error}</p>}

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-2xl border hairline bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-100"
          style={{ maxHeight: '340px' }}
        >
          {/* Search Input Bar */}
          <div className="relative mb-2 px-1">
            <Search className="pointer-events-none absolute inset-y-0 start-3.5 my-auto h-3.5 w-3.5 text-ink/40" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('ابحث بالاسم (مثل: المعادي، 6 أكتوبر، فيكتوريا...)', 'Search area name...')}
              className="w-full rounded-xl border hairline bg-cream/30 py-2 pe-8 ps-9 text-[13px] font-bold text-ink placeholder:text-ink/40 focus:border-baladi-yellow focus:bg-white focus:outline-none focus:ring-1 focus:ring-baladi-yellow"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 end-3.5 my-auto flex h-4 w-4 items-center justify-center rounded-full text-ink/40 hover:text-ink"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Zones List */}
          <div
            className="overflow-y-auto overscroll-contain pr-1 divide-y divide-cream/40"
            style={{ maxHeight: '250px' }}
            role="listbox"
          >
            {filteredZones.length === 0 ? (
              <div className="py-6 text-center text-xs font-bold text-ink/50">
                <Truck className="mx-auto mb-1.5 h-5 w-5 text-ink/30" />
                <p>{t('لم يتم العثور على منطقة بهذا الاسم', 'No shipping area found')}</p>
                <p className="mt-1 text-[11px] text-ink/40">
                  {t('جرب البحث بكلمة أو حرف آخر', 'Try searching with another spelling')}
                </p>
              </div>
            ) : (
              filteredZones.map((z) => {
                const isSelected = z.id === selectedId;
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => handleSelect(z)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-[13px] transition-colors ${
                      isSelected
                        ? 'bg-cream text-ink font-black'
                        : 'text-ink/80 font-bold hover:bg-cream/40 hover:text-ink'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`grid h-4 w-4 place-items-center rounded-full border ${
                          isSelected
                            ? 'border-baladi-green bg-baladi-green text-white'
                            : 'border-ink/20 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate">{getZoneTitle(z)}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ps-2">
                      <span className="rounded-md bg-cream px-2 py-0.5 font-mono text-[11px] font-black text-ink">
                        {egp(z.shipping_cost, lang)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
