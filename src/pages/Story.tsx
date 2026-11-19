import { Link } from 'react-router-dom';
import { HeartHandshake, Leaf, ShieldCheck } from 'lucide-react';
import { useLang } from '../lib/lang';
import { useStorefront } from '../store/storefront';
import { Mark, ZigZagBand, DiamondBadge, LeafStem, BaladiGridBackground } from '../components/brand/Ornaments';
import { GhostAnimal } from '../components/brand/Ornaments2';
import Reveal from '../components/ui/Reveal';
import Tilt3D from '../components/ui/Tilt3D';

const SECTION_ICONS = [HeartHandshake, Leaf, ShieldCheck];

export default function Story() {
  const { t } = useLang();
  const story = useStorefront((s) => s.story);
  const settings = useStorefront((s) => s.settings);
  const isLoadingContent = useStorefront((s) => s.isLoadingContent);

  const heroIntro = story[0];

  return (
    <div className="pt-[68px] md:pt-[84px] bg-white">
      <section className="relative overflow-hidden bg-white border-b hairline py-20 text-ink md:py-28">
        <BaladiGridBackground opacity={0.03} />
        <ZigZagBand color="#E84249" height={16} className="absolute inset-x-0 top-0 opacity-40" />
        <GhostAnimal species="dogs" src="/brand/dog-emblem.png" className="-bottom-14 end-[-6%] h-[80%] w-auto" opacity={0.05} />
        <LeafStem className="absolute start-6 top-24 hidden opacity-15 md:block" color="#23254F" height={190} />
        <div className="u-container relative">
          <Reveal>
            <p className="t-eyebrow text-baladi-red">{t('القصة', 'THE STORY')}</p>
            <h1 className="t-display mt-4 max-w-3xl text-[clamp(2.2rem,5.6vw,4.4rem)] text-ink">
              {heroIntro ? (
                heroIntro.title
              ) : (
                <>
                  {t('عشان قطط وكلاب مصر', 'So the cats and dogs')}
                  <br />
                  <span className="text-baladi-red">
                    {t('ما تنامش جيعانة', 'of Egypt never sleep hungry')}
                  </span>
                </>
              )}
            </h1>
            {isLoadingContent && story.length === 0 ? (
              <div className="mt-7 max-w-2xl space-y-3">
                <div className="h-4 w-full animate-pulse rounded-full bg-ink/10" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-ink/10" />
              </div>
            ) : story.length > 0 ? (
              <div className="mt-7 max-w-2xl space-y-4">
                {story.slice(0, 2).map((sec, idx) => (
                  <p key={idx} className="text-[15.5px] font-medium leading-relaxed text-ink/80">
                    {sec.body}
                  </p>
                ))}
              </div>
            ) : null}
          </Reveal>
        </div>
      </section>

      <section id="standard" className="bg-white py-16 md:py-24 border-b hairline">
        <div className="u-container grid gap-8 lg:grid-cols-3">
          {isLoadingContent && story.length === 0
            ? [0, 1, 2].map((i) => (
                <div key={i} className="h-60 animate-pulse rounded-[26px] border hairline bg-white p-7 shadow-soft">
                  <div className="h-6 w-6 rounded-full bg-ink/10" />
                  <div className="mt-6 h-3 w-1/3 rounded-full bg-ink/10" />
                  <div className="mt-3 h-5 w-2/3 rounded-full bg-ink/10" />
                  <div className="mt-4 h-3.5 w-full rounded-full bg-ink/10" />
                </div>
              ))
            : story.map((section, i) => {
                const Icon = SECTION_ICONS[i % SECTION_ICONS.length];
                const num = String(i + 1).padStart(2, '0');
                return (
                  <Reveal key={i} delay={i * 0.08}>
                    <div className="h-full rounded-[26px] border hairline bg-white p-7 shadow-soft">
                      <Icon className="h-6 w-6 text-baladi-red" strokeWidth={1.8} />
                      <p className="t-eyebrow mt-6 font-black text-ink/75">{num}</p>
                      <h3 className="mt-2 text-lg font-black text-ink">{section.title}</h3>
                      <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-ink/80">{section.body}</p>
                    </div>
                  </Reveal>
                );
              })}
        </div>
      </section>

      <section id="feeding" className="relative overflow-hidden bg-white py-16 md:py-24">
        <div className="u-container grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="t-eyebrow text-baladi-green">{t('التغذية', 'FEEDING')}</p>
            <h2 className="t-display mt-3 text-[clamp(1.8rem,4vw,3rem)] text-ink">{t('يومك معاهم', 'Your day with them')}</h2>
            <p className="mt-4 max-w-lg text-[14.5px] font-medium leading-relaxed text-ink/85">
              {t(
                'مياه شرب نقية لازم تكون متاحة على طول. انتقل للطعام الجديد على ٧ أيام، واحفظ الكيس مقفول فى مكان جاف بعيد عن الشمس.',
                'Fresh drinking water should be available at all times. Transition to the new food over 7 days, and keep the bag closed in a dry place away from sun.'
              )}
            </p>
            <div className="mt-7 flex gap-3">
              <Link to="/cats" className="btn btn-accent theme-cat">{t('عالم القطط', 'Cats')}</Link>
              <Link to="/dogs" className="btn btn-accent theme-dog">{t('عالم الكلاب', 'Dogs')}</Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Tilt3D strength={8}>
              <div className="relative overflow-hidden rounded-[30px] bg-baladi-yellow p-8">
                <GhostAnimal species="cats" src="/brand/cat-emblem.png" color="#23254F" className="-bottom-8 -start-10 h-[85%] w-auto" opacity={0.14} />
                <div className="relative z-10">
                  <Mark tone="red" className="h-10" />
                  <div className="mt-8 space-y-3">
                    {[
                      { ar: '٧ أيام انتقال تدريجى', en: '7-day transition' },
                      { ar: 'مياه نقية على طول', en: 'Water always' },
                      settings?.free_shipping_threshold
                        ? {
                            ar: `شحن مجاني للطلبات فوق ${settings.free_shipping_threshold} ج.م`,
                            en: `Free shipping over ${settings.free_shipping_threshold} EGP`,
                          }
                        : { ar: 'كيس مقفول بعد الاستخدام', en: 'Reseal after use' },
                    ].map((x, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-2xl bg-ink/[0.06] px-4 py-3">
                        <DiamondBadge size={22} accent="#E84249" dot="#23254F" />
                        <span className="text-[13px] font-extrabold text-ink">{t(x.ar, x.en)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Tilt3D>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
