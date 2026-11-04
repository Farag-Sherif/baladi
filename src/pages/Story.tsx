import { Link } from 'react-router-dom';
import { HeartHandshake, Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import { useLang } from '../lib/lang';
import { Mark, ZigZagBand, DiamondBadge, LeafStem } from '../components/brand/Ornaments';
import { GhostAnimal } from '../components/brand/Ornaments2';
import Reveal from '../components/ui/Reveal';
import Tilt3D from '../components/ui/Tilt3D';

export default function Story() {
  const { t } = useLang();

  return (
    <div className="pt-[68px] md:pt-[84px]">
      <section className="relative overflow-hidden bg-ink py-20 text-cream md:py-28">
        <ZigZagBand color="#FBBB21" height={22} className="absolute inset-x-0 top-0 opacity-70" />
        <GhostAnimal src="/brand/dog-silhouette.png" className="-bottom-14 end-[-6%] h-[80%] w-auto" opacity={0.09} />
        <LeafStem className="absolute start-6 top-24 hidden opacity-20 md:block" height={190} />
        <div className="u-container relative">
          <Reveal>
            <p className="t-eyebrow text-baladi-yellow">{t('القصة', 'THE STORY')}</p>
            <h1 className="t-display mt-4 max-w-3xl text-[clamp(2.2rem,5.6vw,4.4rem)]">
              {t('عشان قطط وكلاب مصر', 'So the cats and dogs')}<br />
              <span className="text-baladi-yellow">{t('ما تنامش جيعانة', 'of Egypt never sleep hungry')}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-[15.5px] font-medium leading-relaxed text-cream/90">
              {t(
                'لو إنت زينا ومؤمن إن الإنسان والحيوان يعيشوا فى سلام، يبقى لازم تحب الحيوانات البلدى. فريقنا عمل البراند ده بهدف إطعام حيوانات الشارع طعام مغذّى.',
                'If you are like us and believe that humans and animals should live in harmony, then you must love Baladi animals. Our team created this brand with the purpose of feeding stray animals nutritious food.'
              )}
            </p>
            <p className="mt-4 max-w-2xl text-[15.5px] font-medium leading-relaxed text-cream/90">
              {t(
                'إحنا مؤمنين إن الكلاب والقطط — بلدى أو لا — تستاهل أكل كويس ورعاية، وعشان كده عملنا طعام لذيذ وغنى بالعناصر الغذائية للحيوانات البلدى.',
                'We believe dogs and cats — Baladi or not — deserve to be well fed and cared for, and this is why we decided to create nutrient-dense, delicious food for Baladi pets.'
              )}
            </p>
          </Reveal>
        </div>
      </section>

      <section id="standard" className="bg-cream py-16 md:py-24">
        <div className="u-container grid gap-10 lg:grid-cols-3">
          {[
            { i: HeartHandshake, a: 'هدفنا', b: 'Our purpose', d: 'إطعام حيوانات الشارع طعام كامل ومغذّى، بسعر يقدر عليه اللى بيطعم.', e: 'Feed street animals complete, nourishing food at a price a feeder can carry.' },
            { i: Leaf, a: 'التركيبة', b: 'The formula', d: 'دجاج وسمك، أرز وذرة، أوميجا ٣ و٦، وبدون مكسبات طعم صناعية.', e: 'Chicken and fish, rice and corn, omega 3 & 6, and no artificial flavour enhancers.' },
            { i: ShieldCheck, a: 'المعايير', b: 'The standard', d: 'فيتامينات ومعادن مضافة بالنسب المقررة فى المواصفة المصرية ٣٢١٥/٢٠٠٢.', e: 'Vitamins and minerals added to the ratios set in Egyptian standard 3215/2002.' },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="h-full rounded-[26px] border hairline bg-white p-7 shadow-soft">
                <c.i className="h-6 w-6 text-baladi-red" strokeWidth={1.8} />
                <p className="t-eyebrow mt-6 font-black text-ink/75">{t(c.b, c.a)}</p>
                <h3 className="mt-2 text-lg font-black text-ink">{t(c.a, c.b)}</h3>
                <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-ink/80">{t(c.d, c.e)}</p>
              </div>
            </Reveal>
          ))}
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
                <GhostAnimal src="/brand/cat-silhouette.png" className="-bottom-8 -start-10 h-[85%] w-auto" opacity={0.16} />
                <div className="relative z-10">
                  <Mark tone="red" className="h-10" />
                  <div className="mt-8 space-y-3">
                    {[
                      { ar: '٧ أيام انتقال تدريجى', en: '7-day transition' },
                      { ar: 'مياه نقية على طول', en: 'Water always' },
                      { ar: 'كيس مقفول بعد الاستخدام', en: 'Reseal after use' },
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
