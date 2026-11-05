import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Minus, Plus } from 'lucide-react';
import { SPECIES, SUBCATEGORIES, bySpecies, bySpeciesSub, type Species } from '../data/catalog';
import { useLang } from '../lib/lang';
import ProductCard from '../components/sections/ProductCard';
import Reveal from '../components/ui/Reveal';
import { Mark, ZigZagBand, DiamondBadge, LeafStem } from '../components/brand/Ornaments';
import { GhostAnimal, Thunder } from '../components/brand/Ornaments2';

export default function World({ species }: { species: Species }) {
  const { sub } = useParams();
  const { t, lang } = useLang();
  const s = SPECIES[species];
  const isCat = species === 'cats';
  const subs = SUBCATEGORIES[species];
  const activeSub = sub && subs.some((x) => x.slug === sub) ? sub : null;
  const products = activeSub ? bySpeciesSub(species, activeSub) : bySpecies(species);
  const all = bySpecies(species);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const accent = isCat ? 'text-baladi-green' : 'text-baladi-red';
  const accentBg = isCat ? 'bg-baladi-green' : 'bg-baladi-red';

  const faqs = [
    {
      q: { ar: 'إزاى أبدأ التغذية؟', en: 'How do I start feeding?' },
      a: {
        ar: 'ابدأ بمزج الطعام الجديد مع القديم على ٧ أيام (٢٥٪ ثم ٥٠٪ ثم ٧٥٪ ثم ١٠٠٪)، وحافظ على مياه شرب نقية متاحة دائماً.',
        en: 'Blend the new food with the old over 7 days (25%, 50%, 75%, then 100%), and always keep fresh drinking water available.',
      },
    },
    {
      q: { ar: 'المنتج مناسب للحيوانات البلدى؟', en: 'Is it right for Baladi animals?' },
      a: {
        ar: 'أيوه — البراند اتعمل أساساً عشان حيوانات الشارع والبلدى. التركيبة كاملة ومتوازنة ومناسبة لأى قط أو كلب سليم.',
        en: 'Yes — the brand exists primarily for Baladi and street animals. The formula is complete and balanced for any healthy cat or dog.',
      },
    },
    {
      q: { ar: 'فين بيانات التحليل الغذائى؟', en: 'Where is the nutritional analysis?' },
      a: {
        ar: 'كل صفحة منتج فيها نسب التحليل الكاملة (بروتين، دهون، ألياف، رطوبة) ومكونات العبوة وقائمة الفيتامينات كما هى مطبوعة على الكيس.',
        en: 'Every product page carries the full analysis (protein, fats, fibre, moisture), the pack ingredients and the vitamin panel exactly as printed on the bag.',
      },
    },
    {
      q: { ar: 'بتوصلوا لكل المحافظات؟', en: 'Do you deliver nationwide?' },
      a: {
        ar: 'الشحن بيتم لكل محافظات مصر، والتكلفة بتتحسب حسب المحافظة عند إتمام الطلب.',
        en: 'We ship to every governorate in Egypt, with the cost calculated by governorate at checkout.',
      },
    },
  ];

  return (
    <div className={isCat ? 'theme-cat' : 'theme-dog'}>
      {/* ── WORLD HERO ─────────────────────────────────────────── */}
      <section className={`relative overflow-hidden ${isCat ? 'bg-baladi-green' : 'bg-baladi-red'} pt-[68px] text-white md:pt-[84px]`}>
        <Thunder color="rgba(251,187,33,.85)" height={22} className="absolute inset-x-0 top-[68px] md:top-[84px]" />
        <GhostAnimal src={s.silhouette} className="-bottom-16 end-[-8%] h-[95%] w-auto" opacity={0.18} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(110deg, rgba(35,37,79,.34), transparent 60%)' }} />
        <LeafStem className="absolute start-8 top-32 hidden opacity-30 lg:block" color="#FBF6EE" height={160} />

        <div className="u-container relative z-10 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-[11.5px] font-black uppercase tracking-[0.16em] text-white/90">
            <Link to="/" className="hover:text-white">{t('الرئيسية', 'Home')}</Link>
            <ChevronRight className="h-3 w-3 rtl:rotate-180" />
            <span className="text-white">{s.name[lang]}</span>
            {activeSub && (
              <>
                <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                <span className="text-white">{subs.find((x) => x.slug === activeSub)?.name[lang]}</span>
              </>
            )}
          </nav>

          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="t-eyebrow text-baladi-yellow">{s.latin} · {t('عالم كامل', 'A WHOLE WORLD')}</p>
              <h1 className="t-display mt-3 text-[clamp(3rem,8vw,6.5rem)] text-white">{s.name[lang]}</h1>
              <p className="mt-5 max-w-xl text-[15.5px] font-medium leading-relaxed text-white/95">{s.intro[lang]}</p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link to={`/${species}/${subs[0].slug}`} className="rounded-full bg-white px-5 py-2.5 text-[13px] font-black text-ink transition-transform hover:-translate-y-0.5">
                  {t('تسوق الآن', 'Shop now')}
                </Link>
                <Link to="/story" className="rounded-full border border-white/40 px-5 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-white/12">
                  {t('عن البراند', 'About the brand')}
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-start gap-4 rounded-[26px] border border-white/20 bg-white/10 p-5 backdrop-blur-md lg:items-end lg:text-end">
              <Mark tone={s.mark} white className="h-9" />
              <p className="text-[12.5px] font-bold leading-relaxed text-white/95">{s.fact[lang]}</p>
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
      <section className="sticky top-[68px] z-30 border-b hairline bg-cream/95 backdrop-blur-xl md:top-[84px]">
        <div className="u-container flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          <Link
            to={`/${species}`}
            className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-black transition-colors ${
              !activeSub ? `${accentBg} text-white` : 'bg-white text-ink/80 hover:text-ink'
            }`}
          >
            {t('كل الأقسام', 'All')} · {all.length}
          </Link>
          {subs.map((c) => {
            const count = bySpeciesSub(species, c.slug).length;
            return (
              <Link
                key={c.slug}
                to={`/${species}/${c.slug}`}
                className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-black transition-colors ${
                  activeSub === c.slug ? `${accentBg} text-white` : 'bg-white text-ink/80 hover:text-ink'
                }`}
              >
                {c.name[lang]} · {count}
              </Link>
            );
          })}
        </div>
      </section>

      {/* subcategory cards */}
      {!activeSub && (
        <section className="bg-cream pt-14">
          <div className="u-container grid gap-4 sm:grid-cols-3">
            {subs.map((c, i) => {
              const p = bySpeciesSub(species, c.slug)[0];
              return (
                <Reveal key={c.slug} delay={i * 0.07}>
                  <Link
                    to={`/${species}/${c.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border hairline bg-white p-5 transition-shadow hover:shadow-lift"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`t-eyebrow ${accent}`}>{c.name[lang]}</p>
                        <p className="mt-2 text-[13px] font-semibold text-ink/75">{c.blurb[lang]}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-ink/50 transition-transform group-hover:-translate-y-0.5" />
                    </div>
                    {p && (
                      <div className="mt-6 grid h-36 place-items-center">
                        <img src={p.image} alt="" className="max-h-32 w-auto object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" />
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
      <section className="bg-cream py-14 md:py-20">
        <div className="u-container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className={`t-eyebrow ${accent}`}>
                {activeSub ? subs.find((x) => x.slug === activeSub)?.name[lang] : t('كل المنتجات', 'All products')}
              </p>
              <h2 className="t-display mt-2 text-[clamp(1.6rem,3.4vw,2.5rem)]">
                {products.length} {t('منتج', products.length === 1 ? 'product' : 'products')}
              </h2>
            </div>
            <p className="hidden text-[12px] font-black uppercase tracking-[0.16em] text-ink/70 sm:block">
              {t('أسعار بالجنيه المصرى', 'Prices in EGP')}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-ink/20 p-14 text-center">
              <p className="font-black text-ink/80">{t('لا يوجد منتجات فى القسم ده حالياً', 'No products in this section yet')}</p>
              <Link to={`/${species}`} className={`btn mt-5 ${isCat ? 'btn-accent theme-cat' : 'btn-accent theme-dog'}`}>
                {t('ارجع لكل الأقسام', 'Back to all')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
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
      <section className="bg-cream py-16 md:py-20">
        <div className="u-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className={`t-eyebrow ${accent}`}>{t('أسئلة شائعة', 'QUESTIONS')}</p>
            <h2 className="t-display mt-3 text-[clamp(1.6rem,3.4vw,2.5rem)] text-ink">{t('قبل ما تشترى', 'Before you buy')}</h2>
          </div>
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {faqs.map((f, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-start font-black text-ink"
                >
                  <span className="text-[14.5px] font-extrabold">{f.q[lang]}</span>
                  {openFaq === i ? <Minus className="h-4 w-4 shrink-0 text-baladi-red" /> : <Plus className="h-4 w-4 shrink-0 text-ink/70" />}
                </button>
                {openFaq === i && <p className="pb-5 text-[13.5px] font-medium leading-relaxed text-ink/80">{f.a[lang]}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
