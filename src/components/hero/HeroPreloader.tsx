import { motion } from 'framer-motion';
import { useLang } from '../../lib/lang';
import { Mark, ZigZagBand } from '../brand/Ornaments';

export default function HeroPreloader({
  percent, loaded, total, isReady, onSkip,
}: { percent: number; loaded: number; total: number; isReady: boolean; onSkip: () => void }) {
  const { t } = useLang();
  if (isReady) return null;
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-ink text-cream"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ZigZagBand color="#FBBB21" height={22} className="absolute top-10 w-full opacity-60" />
      <Mark tone="red" white className="h-14" />
      <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.4em] text-baladi-yellow">LOADING THE WORLD</p>
      <div className="mt-7 h-[3px] w-[220px] overflow-hidden rounded-full bg-cream/15">
        <div className="h-full rounded-full bg-baladi-yellow transition-[width] duration-300" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-[11px] tabular-nums text-cream/50">{loaded} / {total}</p>
      <button onClick={onSkip} className="mt-8 text-[11px] font-bold uppercase tracking-[0.25em] text-cream/45 underline underline-offset-4 hover:text-cream">
        {t('تخطى', 'Skip')}
      </button>
      <ZigZagBand color="#FBBB21" height={22} className="absolute bottom-10 w-full opacity-60" />
    </motion.div>
  );
}
