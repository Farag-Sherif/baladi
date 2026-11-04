import { useId } from 'react';
import { cn } from '../../lib/utils';
import { useLang } from '../../lib/lang';

/** The pack's zig-zag ribbon with the dot in every valley. */
export function ZigZagBand({
  color = '#FBBB21',
  height = 20,
  className,
  dots = true,
  weight = 2.2,
}: {
  color?: string;
  height?: number;
  className?: string;
  dots?: boolean;
  weight?: number;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className={cn('block w-full', className)}
      height={height}
      viewBox="0 0 240 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={`zz-${id}`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 7 L6 1 L12 7 L18 1 L24 7" stroke={color} strokeWidth={weight} fill="none" strokeLinecap="round" />
          <path d="M0 19 L6 13 L12 19 L18 13 L24 19" stroke={color} strokeWidth={weight} fill="none" strokeLinecap="round" />
          {dots && <circle cx="12" cy="10" r="1.7" fill={color} />}
        </pattern>
      </defs>
      <rect width="240" height="24" fill={`url(#zz-${id})`} />
    </svg>
  );
}

/** The corner motif: navy diamond holding a red square with a dot. */
export function DiamondBadge({
  size = 34,
  ink = '#23254F',
  accent = '#E84249',
  dot = '#FBF6EE',
  className,
}: {
  size?: number;
  ink?: string;
  accent?: string;
  dot?: string;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="4" y="4" width="32" height="32" rx="3" transform="rotate(45 20 20)" fill={ink} />
      <rect x="10" y="10" width="20" height="20" rx="1.5" transform="rotate(45 20 20)" fill={accent} />
      <circle cx="20" cy="20" r="3.6" fill={dot} />
    </svg>
  );
}

/** Branching leaf stem from the pack sides. */
export function LeafStem({ className, color = '#FBF6EE', height = 120 }: { className?: string; color?: string; height?: number }) {
  return (
    <svg viewBox="0 0 20 120" height={height} className={className} aria-hidden="true">
      <path d="M10 0 V120" stroke={color} strokeWidth="1.6" />
      {Array.from({ length: 5 }).map((_, i) => {
        const y = 14 + i * 21;
        return (
          <g key={i} stroke={color} strokeWidth="1.4" fill="none">
            <path d={`M10 ${y} C4 ${y - 6} 1 ${y - 3} 1 ${y + 3} C4 ${y + 7} 8 ${y + 5} 10 ${y}`} />
            <path d={`M10 ${y + 8} C16 ${y + 2} 19 ${y + 5} 19 ${y + 11} C16 ${y + 15} 12 ${y + 13} 10 ${y + 8}`} />
          </g>
        );
      })}
    </svg>
  );
}

/** Official wordmark. `tone` picks the artwork; `white` recolours it for dark fields. */
export function Mark({
  tone,
  white = false,
  className,
  alt,
}: {
  tone: 'green' | 'red';
  white?: boolean;
  className?: string;
  alt?: string;
}) {
  const { lang } = useLang();
  const src = lang === 'ar' ? `/brand/ar-${tone}.png` : `/brand/lat-${tone}.png`;
  return (
    <img
      src={src}
      alt={alt ?? (lang === 'ar' ? 'بلدى' : 'BALADI')}
      className={cn('w-auto select-none', className)}
      style={white ? { filter: 'brightness(0) invert(1)' } : undefined}
      draggable={false}
    />
  );
}
