import { motion } from 'framer-motion';
import { Mark } from '../brand/Ornaments';

export interface HeroPreloaderProps {
  onSkip?: () => void;
}

export default function HeroPreloader({ onSkip }: HeroPreloaderProps) {
  return (
    <motion.div
      key="baladi-hero-preloader"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white pointer-events-auto select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
      }}
    >
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Mark tone="red" className="h-12 sm:h-14 w-auto" />
      </div>
    </motion.div>
  );
}

