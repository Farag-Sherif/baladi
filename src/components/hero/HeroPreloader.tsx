import { motion } from 'framer-motion';
import { useLang } from '../../lib/lang';
import { Mark, ZigZagBand, BaladiGridBackground } from '../brand/Ornaments';
import { Sparkles } from 'lucide-react';

export interface HeroPreloaderProps {
  percent: number;
  loaded: number;
  total: number;
  onSkip?: () => void;
}

export default function HeroPreloader({
  percent,
  loaded,
  total,
  onSkip,
}: HeroPreloaderProps) {
  const { t } = useLang();
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <motion.div
      key="baladi-hero-preloader"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white text-ink select-none overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.03,
        filter: 'blur(10px)',
        transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      {/* Background radial atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 50% 46%, rgba(232, 66, 73, 0.08) 0%, rgba(255, 255, 255, 0.9) 60%, #ffffff 100%)',
        }}
      />
      <BaladiGridBackground opacity={0.03} />

      {/* Decorative Ornaments */}
      <ZigZagBand color="#E84249" height={16} className="absolute top-8 w-full opacity-30 pointer-events-none" />
      <ZigZagBand color="#E84249" height={16} className="absolute bottom-8 w-full opacity-30 pointer-events-none" />

      {/* Centerpiece Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md w-full">
        {/* Pulsing Baladi Brand Emblem */}
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.92, 1, 0.92] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute -inset-6 rounded-full bg-baladi-red/10 blur-2xl animate-pulse" />
          <Mark tone="red" className="relative h-16 sm:h-20 w-auto" />
        </motion.div>

        {/* Brand Headline */}
        <h1 className="mt-6 text-2xl sm:text-3xl font-black text-ink tracking-tight font-sans">
          {t('اللى بياكل صح.. بيعيش أحسن', 'Well fed lives a better life')}
        </h1>

        {/* 3D Loading Status Title */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-baladi-red animate-spin" style={{ animationDuration: '3s' }} />
          <p className="text-xs sm:text-[13px] font-extrabold uppercase tracking-[0.25em] text-baladi-red">
            {t('جاري تحميل وتجهيز مجسم المنتج ثلاثي الأبعاد...', 'LOADING 3D PRODUCT & WORLD...')}
          </p>
        </div>

        {/* Slogan */}
        <p className="mt-1 text-[11px] sm:text-xs font-bold text-ink/65">
          {t('تغذية مصرية ١٠٠٪ للقطط والكلاب', '100% Egyptian nutrition for cats & dogs')}
        </p>

        {/* Progress Bar Container */}
        <div className="mt-8 h-2.5 w-[260px] sm:w-[320px] overflow-hidden rounded-full bg-slate-100 p-0.5 border border-ink/10 shadow-inner">
          <div
            className="h-full rounded-full bg-baladi-red shadow-sm transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(6, clampedPercent)}%` }}
          />
        </div>

        {/* Real Status Metrics */}
        <div className="mt-3 flex w-[260px] sm:w-[320px] items-center justify-between text-[11px] font-bold text-ink/70">
          <span>{t('صور ومجسمات المنتج', '3D Assets')}</span>
          <span className="tabular-nums font-black text-baladi-red">
            {clampedPercent}% {total > 0 ? `(${loaded}/${total})` : ''}
          </span>
        </div>

        {/* Skip Button */}
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="mt-8 rounded-full border border-ink/20 bg-slate-50 px-6 py-2 text-[11.5px] font-black uppercase tracking-[0.2em] text-ink/75 hover:bg-slate-100 transition-all duration-200"
          >
            {t('تخطي والبدء الآن', 'Skip to site')}
          </button>
        )}
      </div>
    </motion.div>
  );
}
