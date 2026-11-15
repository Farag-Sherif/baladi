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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#23254F] text-cream select-none overflow-hidden"
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
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(circle at 50% 46%, rgba(251, 187, 33, 0.16) 0%, rgba(35, 37, 79, 0.9) 55%, #23254F 100%)',
        }}
      />
      <BaladiGridBackground opacity={0.08} />

      {/* Decorative Ornaments */}
      <ZigZagBand color="#FBBB21" height={22} className="absolute top-8 w-full opacity-40 pointer-events-none" />
      <ZigZagBand color="#FBBB21" height={22} className="absolute bottom-8 w-full opacity-40 pointer-events-none" />

      {/* Centerpiece Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md w-full">
        {/* Pulsing Baladi Brand Emblem */}
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.92, 1, 0.92] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute -inset-6 rounded-full bg-baladi-yellow/20 blur-2xl animate-pulse" />
          <Mark tone="red" white className="relative h-16 sm:h-20 w-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" />
        </motion.div>

        {/* Brand Headline */}
        <h1 className="mt-6 text-3xl sm:text-4xl font-black text-white tracking-widest font-sans">
          {t('بَلَدِي', 'BALADI')}
        </h1>

        {/* 3D Loading Status Title */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-baladi-yellow animate-spin" style={{ animationDuration: '3s' }} />
          <p className="text-xs sm:text-[13px] font-extrabold uppercase tracking-[0.25em] text-baladi-yellow">
            {t('جاري تحميل وتجهيز مجسم المنتج ثلاثي الأبعاد...', 'LOADING 3D PRODUCT & WORLD...')}
          </p>
        </div>

        {/* Slogan */}
        <p className="mt-1 text-[11px] sm:text-xs font-bold text-cream/65">
          {t('اللى بياكل عدل.. بيعيش أحسن · تغذية مصرية ١٠٠٪', 'Well fed lives a better life · 100% Egyptian')}
        </p>

        {/* Progress Bar Container */}
        <div className="mt-8 h-2.5 w-[260px] sm:w-[320px] overflow-hidden rounded-full bg-cream/15 p-0.5 border border-white/10 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FBBB21] to-[#FFE27A] shadow-[0_0_14px_rgba(251,187,33,0.8)] transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(6, clampedPercent)}%` }}
          />
        </div>

        {/* Real Status Metrics */}
        <div className="mt-3 flex w-[260px] sm:w-[320px] items-center justify-between text-[11px] font-bold text-cream/70">
          <span>{t('صور ومجسمات المنتج', '3D Assets')}</span>
          <span className="tabular-nums font-black text-baladi-yellow">
            {clampedPercent}% {total > 0 ? `(${loaded}/${total})` : ''}
          </span>
        </div>

        {/* Skip Button */}
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="mt-8 rounded-full border border-white/20 bg-white/5 px-6 py-2 text-[11.5px] font-black uppercase tracking-[0.2em] text-cream/70 hover:bg-white/15 hover:text-white transition-all duration-200"
          >
            {t('تخطي والبدء الآن', 'Skip to site')}
          </button>
        )}
      </div>
    </motion.div>
  );
}
