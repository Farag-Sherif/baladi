import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Truck,
  ArrowRight,
  ArrowLeft,
  Star,
  Flame,
  Award,
} from 'lucide-react';
import { useLang } from '../../lib/lang';
import { Thunder } from '../brand/Ornaments2';
import { ZigZagBand, BaladiCatEmblem, BaladiDogEmblem, BaladiDuoEmblem, BaladiGridBackground, DiamondBadge } from '../brand/Ornaments';
import { cn } from '../../lib/utils';
import BaladiPouch3DViewer from './BaladiPouch3DViewer';
import HeroPreloader from './HeroPreloader';
import { getIs3DPreloaded, setIs3DPreloaded } from '../../lib/3dPreloader';

type WorldMode = 'both' | 'cats' | 'dogs';

const MODES: WorldMode[] = ['both', 'cats', 'dogs'];

interface PackData {
  mode: WorldMode;
  tagAr: string;
  tagEn: string;
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descAr: string;
  descEn: string;
  image: string;
  accentColor: string;
  glowColor: string;
  link: string;
  specs: { labelAr: string; labelEn: string; valueAr: string; valueEn: string }[];
  badges: {
    icon: typeof ShieldCheck;
    titleAr: string;
    titleEn: string;
    subAr: string;
    subEn: string;
    posClass: string;
    depthZ: number;
  }[];
}

const PACKS: Record<WorldMode, PackData> = {
  both: {
    mode: 'both',
    tagAr: 'طعام جاف كامل للقطط والكلاب',
    tagEn: 'COMPLETE DRY FOOD FOR CATS & DOGS',
    nameAr: 'تشكيلة بلدي المتكاملة',
    nameEn: 'Baladi Duo Nutrition',
    subtitleAr: 'اللى بياكل صح.. بيعيش أحسن',
    subtitleEn: 'Well fed lives a better life',
    descAr: 'تغذية مصرية ١٠٠٪ متكاملة للقطط والكلاب البلدي — دجاج حقيقي، فيتامينات ومعادن أساسية، وبدون أي مكسبات طعم صناعية. جودة تثق فيها وسعر في متناول اليد.',
    descEn: '100% Egyptian complete pet food for Baladi cats and dogs — real chicken, essential vitamins & minerals, zero artificial additives. Accessible premium quality.',
    image: '/brand/pouch-duo.png',
    accentColor: '#FBBB21', // baladi-yellow
    glowColor: 'rgba(251, 187, 33, 0.45)',
    link: '/cats',
    specs: [
      { labelAr: 'مكونات طبيعية', labelEn: 'Natural Recipe', valueAr: '١٠٠٪', valueEn: '100%' },
      { labelAr: 'صنع في مصر', labelEn: 'Made in Egypt', valueAr: 'بفخر', valueEn: 'Proudly' },
      { labelAr: 'مكسبات صناعية', labelEn: 'Artificial Additives', valueAr: '٠٪', valueEn: '0%' },
    ],
    badges: [
      {
        icon: ShieldCheck,
        titleAr: 'دجاج مصري طبيعي',
        titleEn: 'Egyptian Chicken',
        subAr: 'بروتين حقيقي عالي الجودة',
        subEn: 'Premium animal protein',
        posClass: 'top-4 -start-2 md:-start-8',
        depthZ: 95,
      },
      {
        icon: Sparkles,
        titleAr: 'بدون مكسبات طعم',
        titleEn: 'No Artificial Flavors',
        subAr: 'أكل نظيف يحافظ على صحتهم',
        subEn: 'Clean & transparent nutrition',
        posClass: 'top-16 -end-2 md:-end-8',
        depthZ: 115,
      },
      {
        icon: HeartHandshake,
        titleAr: 'مشروع إطعام وطني',
        titleEn: 'National Stray Feeder',
        subAr: '٥٠,٠٠٠+ وجبة تم توزيعها',
        subEn: '50k+ street meals donated',
        posClass: 'bottom-20 -start-2 md:-start-6',
        depthZ: 85,
      },
      {
        icon: Truck,
        titleAr: 'توصيل لجميع المحافظات',
        titleEn: 'Nationwide Delivery',
        subAr: 'شحن سريع ومباشر لباب بيتك',
        subEn: 'Fast doorstep delivery',
        posClass: 'bottom-6 -end-2 md:-end-6',
        depthZ: 110,
      },
    ],
  },
  cats: {
    mode: 'cats',
    tagAr: 'طعام جاف كامل للقطط البلدي',
    tagEn: 'COMPLETE DRY FOOD FOR CATS',
    nameAr: 'عالم القطط',
    nameEn: 'Baladi Cats World',
    subtitleAr: 'دجاج طبيعي · بروتين ٢٢٪ · صحة الكلى',
    subtitleEn: 'Real Chicken · 22% Protein · Renal Care',
    descAr: 'تركيبة غذائية متوازنة ومصممة خصيصاً لمناعة وصحة قطط مصر. دجاج حقيقي غني بالتورين والأوميجا وبدون أي مكسبات طعم صناعية.',
    descEn: 'Veterinary formula designed for the health and vitality of Egyptian cats. Real chicken, rich in taurine & omega, zero artificial flavors.',
    image: '/brand/pouch-cats.png',
    accentColor: '#E84249', // baladi-red for cats
    glowColor: 'rgba(232, 66, 73, 0.45)',
    link: '/cats',
    specs: [
      { labelAr: 'البروتين الخام', labelEn: 'Crude Protein', valueAr: '٢٢٪', valueEn: '22%' },
      { labelAr: 'الدهون الصحية', labelEn: 'Healthy Fats', valueAr: '١٠٪', valueEn: '10%' },
      { labelAr: 'أوميجا ٣ و ٦', labelEn: 'Omega 3 & 6', valueAr: 'متوازن', valueEn: 'Balanced' },
    ],
    badges: [
      {
        icon: ShieldCheck,
        titleAr: 'بروتين نقي ٢٢٪',
        titleEn: '22% Pure Protein',
        subAr: 'دجاج مصري طبيعي',
        subEn: 'Natural Egyptian chicken',
        posClass: 'top-4 -start-2 md:-start-8',
        depthZ: 95,
      },
      {
        icon: Sparkles,
        titleAr: '٠٪ مكسبات طعم',
        titleEn: '0% Artificial Additives',
        subAr: 'آمن وصحي على الكلى',
        subEn: 'Safe for kidneys & gut',
        posClass: 'top-16 -end-2 md:-end-8',
        depthZ: 115,
      },
      {
        icon: HeartHandshake,
        titleAr: 'إطعام قطط الشارع',
        titleEn: 'Street Feeding Impact',
        subAr: 'وجبة مجانية مع كل كيس',
        subEn: 'Free meal per bag sold',
        posClass: 'bottom-20 -start-2 md:-start-6',
        depthZ: 85,
      },
      {
        icon: Award,
        titleAr: 'تورين وفيتامينات',
        titleEn: 'Taurine & Vitamins',
        subAr: 'لصحة القلب والنظر',
        subEn: 'Heart & vision support',
        posClass: 'bottom-6 -end-2 md:-end-6',
        depthZ: 110,
      },
    ],
  },
  dogs: {
    mode: 'dogs',
    tagAr: 'طعام جاف كامل للكلاب البلدي',
    tagEn: 'COMPLETE DRY FOOD FOR DOGS',
    nameAr: 'عالم الكلاب',
    nameEn: 'Baladi Dogs World',
    subtitleAr: 'طاقة ونشاط · عظام قوية · هضم سليم',
    subtitleEn: 'High Energy · Strong Bones · Easy Digest',
    descAr: 'وجبة متكاملة لكلاب الشارع والبيوت في مصر. غنية بالكالسيوم، الفوسفور، والبروتينات لبناء عضلات قوية ومناعة حديدية ضد الأمراض.',
    descEn: 'Complete daily meal for Egyptian dogs. Packed with calcium, phosphorus, and essential proteins for strong bones and unbreakable immunity.',
    image: '/brand/pouch-dogs.png',
    accentColor: '#1E996C', // baladi-green for dogs
    glowColor: 'rgba(30, 153, 108, 0.45)',
    link: '/dogs',
    specs: [
      { labelAr: 'البروتين الحيواني', labelEn: 'Animal Protein', valueAr: '٢٠٪', valueEn: '20%' },
      { labelAr: 'كالسيوم وفوسفور', labelEn: 'Calcium & Phos', valueAr: 'مثالي', valueEn: 'Optimal' },
      { labelAr: 'ألياف للهضم', labelEn: 'Digestive Fibers', valueAr: 'متوازن', valueEn: 'Balanced' },
    ],
    badges: [
      {
        icon: ShieldCheck,
        titleAr: 'بروتين حيواني متوازن',
        titleEn: 'Optimal Protein',
        subAr: 'لبناء عضلات ونشاط',
        subEn: 'Muscle & energy boost',
        posClass: 'top-4 -start-2 md:-start-8',
        depthZ: 95,
      },
      {
        icon: Flame,
        titleAr: 'طاقة ومناعة قوية',
        titleEn: 'Immunity & Energy',
        subAr: 'فيتامينات أ، د، هـ',
        subEn: 'Vitamins A, D & E',
        posClass: 'top-16 -end-2 md:-end-8',
        depthZ: 115,
      },
      {
        icon: HeartHandshake,
        titleAr: 'إطعام كلاب الشارع',
        titleEn: 'Street Feeding Impact',
        subAr: 'وجبة مقابل كل كيس',
        subEn: 'Every bag feeds a stray',
        posClass: 'bottom-20 -start-2 md:-start-6',
        depthZ: 85,
      },
      {
        icon: Award,
        titleAr: 'صحة العظام والأسنان',
        titleEn: 'Bone & Dental Health',
        subAr: 'نسب كالسيوم مدروسة',
        subEn: 'Lab-verified calcium',
        posClass: 'bottom-6 -end-2 md:-end-6',
        depthZ: 110,
      },
    ],
  },
};

export default function Baladi3DHero() {
  const { t, lang } = useLang();
  const isRtl = lang === 'ar';
  const [mode, setMode] = useState<WorldMode>('both');
  const [isPaused, setIsPaused] = useState(false);
  const activePack = PACKS[mode];

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── 3D ASSET PRELOAD TRACKING ──
  const [is3DReady, setIs3DReady] = useState(() => getIs3DPreloaded());

  const handle3DReady = () => {
    setIs3DPreloaded(true);
    setIs3DReady(true);
  };

  // Fallback safety timeout so site never stays permanently blocked
  useEffect(() => {
    if (is3DReady) return;
    const timer = setTimeout(() => {
      setIs3DPreloaded(true);
      setIs3DReady(true);
    }, 7000);
    return () => clearTimeout(timer);
  }, [is3DReady]);

  // Lock scroll while preloader is active to prevent awkward scrolling before reveal
  useEffect(() => {
    if (!is3DReady) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [is3DReady]);

  // ── AUTO-CYCLE TIMER (Transitions between both, cats, dogs every 3 seconds) ──
  useEffect(() => {
    if (isPaused || !is3DReady) return;

    const timer = setInterval(() => {
      setMode((current) => {
        const nextIndex = (MODES.indexOf(current) + 1) % MODES.length;
        return MODES[nextIndex];
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [isPaused, is3DReady]);

  // Background 3D Floating Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const particles = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.8 + 0.2,
      radius: Math.random() * 2.2 + 0.8,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.6 ? '#FBBB21' : Math.random() > 0.5 ? '#E84249' : '#1E996C',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.z, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * p.z * 0.65;
        ctx.shadowBlur = 8 * p.z;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <>
      {/* ── 3D PRODUCT ASSET PRELOADER (Minimalist Brand Logo Loader) ── */}
      <AnimatePresence>
        {!is3DReady && <HeroPreloader onSkip={handle3DReady} />}
      </AnimatePresence>

      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative min-h-[94vh] lg:min-h-screen w-full overflow-hidden bg-white pt-24 pb-14 text-ink flex flex-col justify-between"
      >
      {/* ── 3D AMBIENT ENVIRONMENT & LIGHTS ──────────────── */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-40" />

      <BaladiGridBackground opacity={0.03} />

      {/* Background Ornaments */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 opacity-20">
        <Thunder color={activePack.accentColor} height={20} />
      </div>

      <div className="pointer-events-none absolute -bottom-10 inset-x-0 z-10 opacity-20">
        <ZigZagBand color="#FBBB21" height={20} />
      </div>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────── */}
      <div className="u-container relative z-20 my-auto w-full">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          
          {/* ── TEXT & BRAND VOICE COLUMN (5 cols on lg) ──────── */}
          <div className="order-2 lg:order-1 lg:col-span-5 text-start">
            
            {/* Category / Mode Switcher */}
            <div className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-slate-100/80 p-1.5 backdrop-blur-md">
              {(
                [
                  { key: 'both', labelAr: 'الإثنين معاً', labelEn: 'Both Worlds', Icon: BaladiDuoEmblem },
                  { key: 'cats', labelAr: 'القطط فقط', labelEn: 'Cats only', Icon: BaladiCatEmblem },
                  { key: 'dogs', labelAr: 'الكلاب فقط', labelEn: 'Dogs only', Icon: BaladiDogEmblem },
                ] as const
              ).map((tab) => {
                const isActive = mode === tab.key;
                const Icon = tab.Icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMode(tab.key)}
                    aria-label={isRtl ? tab.labelAr : tab.labelEn}
                    title={isRtl ? tab.labelAr : tab.labelEn}
                    className={cn(
                      'relative rounded-full px-2.5 sm:px-3.5 py-1.5 text-[12px] sm:text-[13px] font-black transition-all duration-300',
                      isActive ? 'text-white shadow-md' : 'text-ink/65 hover:text-ink hover:bg-white'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="heroTabIndicator"
                        className="absolute inset-0 rounded-full"
                        style={{
                          backgroundColor:
                            tab.key === 'cats' ? '#E84249' : tab.key === 'dogs' ? '#1E996C' : '#FBBB21',
                        }}
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span
                      className="relative z-10 inline-flex items-center gap-1.5"
                      style={{
                        color: isActive ? (tab.key === 'both' ? '#23254F' : '#ffffff') : undefined,
                      }}
                    >
                      <Icon size={tab.key === 'both' ? 17 : 19} color="currentColor" />
                      <span className="hidden sm:inline">{isRtl ? tab.labelAr : tab.labelEn}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Eyebrow */}
            <div className="mt-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full animate-ping" style={{ backgroundColor: activePack.accentColor }} />
              <p className="text-[12px] md:text-[13px] font-black text-baladi-red tracking-wider">
                {isRtl ? activePack.tagAr : activePack.tagEn}
              </p>
            </div>

            {/* Display Headline with Clean Spacing - Slogan without the large Naskh calligraphy */}
            <div className="mt-3 flex flex-col items-start gap-2.5">
              <motion.h1
                key={`slogan-${mode}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[clamp(2.1rem,4.4vw,3.6rem)] font-black text-ink leading-[1.25]"
              >
                {isRtl ? 'اللى بياكل صح.. بيعيش أحسن' : 'Well fed lives a better life.'}
              </motion.h1>
            </div>

            {/* Subtitle description */}
            <motion.p
              key={`desc-${mode}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="mt-4 max-w-lg text-[15px] md:text-[16px] font-medium leading-[1.8] text-ink/75"
            >
              {isRtl ? activePack.descAr : activePack.descEn}
            </motion.p>

            {/* Quick 3-Specs Grid */}
            <motion.div
              key={`specs-${mode}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-ink/10 bg-slate-50/80 p-3.5 backdrop-blur-md shadow-xs"
            >
              {activePack.specs.map((s, idx) => (
                <div key={idx} className="text-center px-1">
                  <div className="text-[18px] md:text-[22px] font-black text-ink leading-tight">
                    {isRtl ? s.valueAr : s.valueEn}
                  </div>
                  <div className="mt-1 text-[11px] md:text-[12px] font-bold text-ink/60 leading-snug">
                    {isRtl ? s.labelAr : s.labelEn}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              {mode === 'both' ? (
                <>
                  <Link
                    to="/cats"
                    className="btn group relative inline-flex items-center gap-2 overflow-hidden bg-baladi-red text-white shadow-xl hover:bg-baladi-red/90 transition-all font-black"
                  >
                    <BaladiCatEmblem size={18} color="currentColor" />
                    <span>{t('عالم القطط', 'Cats World')}</span>
                    {isRtl ? <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                  </Link>
                  <Link
                    to="/dogs"
                    className="btn group relative inline-flex items-center gap-2 overflow-hidden bg-baladi-green text-white shadow-xl hover:bg-baladi-green/90 transition-all font-black"
                  >
                    <BaladiDogEmblem size={18} color="currentColor" />
                    <span>{t('عالم الكلاب', 'Dogs World')}</span>
                    {isRtl ? <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={activePack.link}
                    className="btn font-black text-white shadow-xl transition-all"
                    style={{
                      backgroundColor: activePack.accentColor === '#FBBB21' ? '#FBBB21' : activePack.accentColor,
                      color: activePack.accentColor === '#FBBB21' ? '#23254F' : '#ffffff',
                    }}
                  >
                    <span>{isRtl ? `تسوق ${activePack.nameAr}` : `Shop ${activePack.nameEn}`}</span>
                    {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </Link>
                  <Link to="/story" className="btn border border-ink/20 bg-white text-ink hover:bg-slate-100 font-bold shadow-xs">
                    <span>{t('قصتنا وإطعام الشارع', 'Our Mission')}</span>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Proof */}
            <div className="mt-7 flex items-center gap-4 text-[12px] font-bold text-ink/75">
              <div className="flex -space-x-1 rtl:space-x-reverse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-baladi-yellow text-baladi-yellow" />
                ))}
              </div>
              <span>
                {isRtl
                  ? '٤.٩/٥ تقييم المربين · +٥٠,٠٠٠ وجبة شارع موثقة'
                  : '4.9/5 verified rating · 50,000+ meals donated'}
              </span>
            </div>

          </div>

          {/* ── REAL 3D INTERACTIVE PRODUCT SHOWROOM (7 cols on lg) ─── */}
          <div className="order-1 lg:order-2 lg:col-span-7 relative flex flex-col items-center justify-center">
            
            {/* Floor Pedestal Shadow */}
            <div
              className="pointer-events-none absolute bottom-4 h-44 w-80 sm:w-96 rounded-full opacity-40 transition-all duration-700 blur-[2px]"
              style={{
                transform: 'rotateX(75deg) translateZ(-60px)',
                background: 'radial-gradient(ellipse at center, rgba(35, 37, 79, 0.12) 0%, rgba(35, 37, 79, 0.04) 50%, transparent 75%)',
                boxShadow: 'none',
              }}
            />

            {/* REAL THREE.JS 3D GLB POUCH VIEWER (Direct 3D Rendering) */}
            <BaladiPouch3DViewer mode={mode} isPaused={isPaused} onReady={handle3DReady} />

            {/* FLOATING HOLOGRAPHIC BADGES */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`badges-${activePack.mode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                {activePack.badges.map((b, i) => {
                  const IconComp = b.icon;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'pointer-events-auto absolute flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/95 p-2 sm:p-2.5 text-ink backdrop-blur-xl shadow-lg transition-all duration-300 hover:scale-105',
                        b.posClass
                      )}
                      style={{
                        boxShadow: '0 12px 26px -8px rgba(35,37,79,0.12)',
                      }}
                    >
                      <div
                        className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl font-bold"
                        style={{
                          backgroundColor: `${activePack.accentColor}18`,
                          color: activePack.accentColor,
                          border: `1px solid ${activePack.accentColor}35`,
                        }}
                      >
                        <IconComp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="pe-1 text-start">
                        <p className="text-[11px] sm:text-[12px] font-black leading-tight text-ink">
                          {isRtl ? b.titleAr : b.titleEn}
                        </p>
                        <p className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-bold text-ink/60">
                          {isRtl ? b.subAr : b.subEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

          </div>

        </div>
      </div>

      {/* ── BOTTOM LUXURY TRUST BANNER ─────────────────────────── */}
      <div className="u-container relative z-20 mt-10 w-full pt-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 rounded-3xl border border-ink/10 bg-slate-50/80 p-3 sm:p-5 backdrop-blur-xl shadow-xs">
          {[
            {
              icon: ShieldCheck,
              accent: '#FBBB21',
              titleAr: 'بروتين طبيعي ٢٢٪',
              titleEn: '22% Pure Protein',
              subAr: 'دجاج مصري طازج وصحي',
              subEn: 'Fresh Egyptian chicken',
            },
            {
              icon: Sparkles,
              accent: '#1E996C',
              titleAr: 'خالي من الكيماويات',
              titleEn: 'Zero Flavor Additives',
              subAr: 'بدون أي مكسبات صناعية',
              subEn: 'Natural digestion safe',
            },
            {
              icon: Truck,
              accent: '#FBBB21',
              titleAr: 'شحن لجميع المحافظات',
              titleEn: 'Fast Egypt Shipping',
              subAr: 'توصيل سريع لباب بيتك',
              subEn: 'Direct to your doorstep',
            },
            {
              icon: HeartHandshake,
              accent: '#E84249',
              titleAr: 'مهمة إطعام الشارع',
              titleEn: 'Street Animal Feeder',
              subAr: 'كل كيس يطعم حيوان شارع',
              subEn: 'Feeds hungry street animals',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white transition-colors">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${item.accent}15`, color: item.accent }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-start">
                  <div className="text-[12.5px] sm:text-[13.5px] font-black text-ink leading-tight">
                    {isRtl ? item.titleAr : item.titleEn}
                  </div>
                  <div className="mt-0.5 text-[10.5px] sm:text-[11.5px] font-medium text-ink/65">
                    {isRtl ? item.subAr : item.subEn}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
    </>
  );
}
