import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Minus, Plus, ShieldCheck, Star, Truck, Leaf, PawPrint } from 'lucide-react';
import { useState } from 'react';
import { getProduct, related, SPECIES, ALLERGEN_NOTE } from '../data/catalog';
import { useLang } from '../lib/lang';
import { egp } from '../lib/utils';
import { useCart } from '../store/cart';
import ProductCard from '../components/sections/ProductCard';
import Reveal from '../components/ui/Reveal';
import Tilt3D from '../components/ui/Tilt3D';
import { Mark, ZigZagBand, DiamondBadge } from '../components/brand/Ornaments';
import { GhostAnimal } from '../components/brand/Ornaments2';

export default function ProductPage() {
  const { slug = '' } = useParams();
  const product = getProduct(slug);
  const { t, lang } = useLang();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);

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

  const s = SPECIES[product.species];
  const isCat = product.species === 'cats';
  const accent = isCat ? 'text-baladi-green' : 'text-baladi-red';
  const accentBg = isCat ? 'bg-baladi-green' : 'bg-baladi-red';
  const rel = related(product);

  return (
    <div className={`${isCat ? 'theme-cat' : 'theme-dog'} pt-[68px] md:pt-[84px]`}>
      {/* breadcrumb */}
      <div className="border-b hairline bg-cream">
        <div className="u-container flex items-center gap-2 py-4 text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-ink/75">
          <Link to="/" className="hover:text-ink">{t('الرئيسية', 'Home')}</Link>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
          <Link to={`/${product.species}`} className="hover:text-ink">{s.name[lang]}</Link>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
          <span className="text-ink font-black">{product.name[lang]}</span>
        </div>
      </div>

      {/* ── HERO: product portrait over a faded product backdrop ── */}
      <section className="relative overflow-hidden bg-cream">
        {/* blurred product photo as the page backdrop, low opacity */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.10]">
          <img src={product.image} alt="" aria-hidden="true" className="absolute -end-[8%] top-0 h-full w-auto scale-125 object-contain blur-[3px]" />
        </div>
        <div className={`pointer-events-none absolute inset-0 ${isCat ? 'bg-baladi-green/5' : 'bg-baladi-red/5'}`} />
        <GhostAnimal src={s.silhouette} className="-bottom-10 -start-16 h-[85%] w-auto" opacity={0.07} />

        <div className="u-container relative grid gap-12 py-10 md:py-16 lg:grid-cols-2">
          {/* stage */}
          <div className="relative">
            <div className={`relative overflow-hidden rounded-[34px] ${isCat ? 'bg-gradient-to-br from-[#E3F2EA] to-cream' : 'bg-gradient-to-br from-[#FCE3E4] to-cream'} p-8`}>
              <div className="absolute inset-x-0 top-0"><ZigZagBand height={13} weight={1.6} color={isCat ? '#1E996C' : '#E84249'} className="opacity-40" /></div>
              <Tilt3D strength={13}>
                <div className="relative grid min-h-[330px] place-items-center md:min-h-[440px]">
                  <img src={product.image} alt={product.name[lang]} className="max-h-[420px] w-auto object-contain drop-shadow-[0_40px_60px_rgba(35,37,79,0.32)]" />
                </div>
              </Tilt3D>
              <div className="mt-4 flex items-center justify-between">
                <span className={`t-eyebrow ${accent}`}>{product.flavor[lang]} · {product.weight}</span>
                <DiamondBadge size={28} accent={isCat ? '#1E996C' : '#E84249'} dot="#FBBB21" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {product.features.map((f, i) => (
                <div key={i} className="rounded-2xl border hairline bg-white p-3">
                  <p className="text-[11.5px] font-extrabold leading-snug text-ink">{f[lang]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* buy box */}
          <div className="lg:py-4">
            <div className="flex items-center gap-3">
              <Mark tone={s.mark} className="h-8" />
              <span className={`t-eyebrow ${accent}`}>{s.signature[lang]}</span>
            </div>
            <h1 className="t-display mt-4 text-[clamp(1.9rem,4vw,3rem)] text-ink">{product.name[lang]}</h1>
            <p className="mt-2 text-[15px] font-extrabold text-ink/80">{product.flavor[lang]} · {product.weight}</p>

            <div className="mt-3 flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? 'fill-baladi-yellow text-baladi-yellow' : 'text-ink/20'}`} />
              ))}
              <span className="text-[12px] font-extrabold text-ink/75">{product.rating} · {product.reviews} {t('تقييم', 'reviews')}</span>
            </div>

            <p className="mt-5 text-[14.5px] font-medium leading-relaxed text-ink/85">{product.description[lang]}</p>

            <div className="mt-6 flex items-end gap-3">
              <p className="text-[30px] font-black leading-none text-ink">{egp(product.price, lang)}</p>
              {product.compareAt && <p className="pb-1 text-[14px] font-bold text-ink/55 line-through">{egp(product.compareAt, lang)}</p>}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-full border hairline bg-white px-3 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="minus"><Minus className="h-4 w-4" /></button>
                <span className="w-6 text-center text-sm font-black text-ink">{qty}</span>
                <button onClick={() => setQty(qty + 1)} aria-label="plus"><Plus className="h-4 w-4" /></button>
              </div>
              <button onClick={() => add(product, qty)} className={`btn flex-1 ${isCat ? 'btn-accent theme-cat' : 'btn-accent theme-dog'}`}>
                {t('أضف للسلة', 'Add to cart')} · {egp(product.price * qty, lang)}
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { i: Truck, a: 'توصيل لكل المحافظات', b: 'Nationwide delivery' },
                { i: ShieldCheck, a: 'مواصفة ٣٢١٥/٢٠٠٢', b: 'ES 3215/2002 compliant' },
                { i: Leaf, a: 'بدون مكسبات طعم', b: 'No artificial flavours' },
                { i: PawPrint, a: 'مناسب للبلدى', b: 'Made for Baladi' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-white/90 p-2.5 text-[11.5px] font-black text-ink">
                  <b.i className={`h-4 w-4 shrink-0 ${accent}`} strokeWidth={1.9} /> {t(b.a, b.b)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FACTS ─────────────────────────────────────────────── */}
      <section className="bg-white py-14 md:py-20">
        <div className="u-container grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className={`t-eyebrow ${accent}`}>{t('التحليل الغذائى', 'ANALYTICAL COMPONENTS')}</p>
            <h2 className="t-display mt-3 text-[clamp(1.5rem,3vw,2.2rem)] text-ink">{t('أرقام العبوة', 'Straight off the bag')}</h2>
            <div className="mt-6 grid gap-x-8 gap-y-0 sm:grid-cols-2">
              {product.analysis.map((row) => (
                <div key={row.label.en} className="flex items-center justify-between border-b border-ink/8 py-3">
                  <span className="text-[13.5px] font-extrabold text-ink/80">{row.label[lang]}</span>
                  <span className={`text-[14px] font-black ${accent}`}>{row.value}</span>
                </div>
              ))}
            </div>

            <p className="t-eyebrow mt-10 text-ink/70">{t('المكونات', 'INGREDIENTS')}</p>
            <p className="mt-3 text-[13.5px] font-medium leading-relaxed text-ink/85">{product.ingredients[lang]}</p>

            <p className="t-eyebrow mt-8 text-ink/70">{t('الفيتامينات والمعادن المضافة', 'ADDED VITAMINS & MINERALS')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.vitamins.map((v) => (
                <span key={v} className={`rounded-full px-3 py-1.5 text-[11.5px] font-bold ${isCat ? 'bg-baladi-green/10 text-baladi-green' : 'bg-baladi-red/10 text-baladi-red'}`}>
                  {v}
                </span>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[26px] bg-ink p-6 text-cream">
              <p className="t-eyebrow text-baladi-yellow">{t('تخزين وتغذية', 'STORAGE & FEEDING')}</p>
              <p className="mt-3 text-[13px] font-medium leading-relaxed text-cream/90">{ALLERGEN_NOTE[lang]}</p>
              <div className="mt-5 flex items-center gap-2">
                <DiamondBadge size={26} accent="#FBBB21" />
                <span className="text-[11px] font-bold text-cream/80">{t('مُصنَّع فى مصر', 'Made in Egypt')}</span>
              </div>
            </div>
            <div className={`rounded-[26px] p-6 ${isCat ? 'bg-baladi-green/10' : 'bg-baladi-red/10'}`}>
              <p className={`t-eyebrow ${accent}`}>{s.latin}</p>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink/85">{s.intro[lang]}</p>
              <Link to={`/${product.species}`} className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.14em] text-ink/80 hover:text-ink">
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
            <div className="mt-7 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
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
