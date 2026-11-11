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

/** Authentic 12-point Folkloric Star Rosette seen in Baladi's official social media designs. */
export function FolkloricStarBadge({
  size = 64,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      {/* 12-point white star rosette backdrop */}
      <g fill="#FFFFFF" stroke="#23254F" strokeWidth="1.5">
        <rect x="20" y="20" width="60" height="60" rx="4" />
        <rect x="20" y="20" width="60" height="60" rx="4" transform="rotate(30 50 50)" />
        <rect x="20" y="20" width="60" height="60" rx="4" transform="rotate(60 50 50)" />
      </g>
      {/* Dark navy background square */}
      <rect x="27" y="27" width="46" height="46" rx="2" fill="#23254F" />
      {/* Green outline square */}
      <rect x="33" y="33" width="34" height="34" fill="none" stroke="#1E996C" strokeWidth="2.5" />
      {/* Coral red center diamond */}
      <rect x="38" y="38" width="24" height="24" fill="#E84249" transform="rotate(45 50 50)" />
      {/* White center focal point */}
      <circle cx="50" cy="50" r="5.5" fill="#FFFFFF" />
    </svg>
  );
}

function resolveEmblemStroke(size: number, strokeWidth?: number) {
  if (strokeWidth !== undefined) return strokeWidth;
  if (size <= 24) return 5.6;
  if (size <= 44) return 4.6;
  if (size <= 72) return 3.8;
  return 3.2;
}

/** Authentic Baladi Dog vector emblem from the official dog food packaging diamond. */
export function BaladiDogEmblem({
  size = 80,
  color = 'currentColor',
  strokeWidth,
  tight,
  className,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  tight?: boolean;
  className?: string;
}) {
  const isCompact = tight ?? size <= 44;
  return (
    <svg
      width={size}
      height={size}
      viewBox={isCompact ? '18 20 84 80' : '0 0 120 120'}
      className={cn('shrink-0', className)}
      fill="none"
      stroke={color}
      strokeWidth={resolveEmblemStroke(size, strokeWidth)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Baseline */}
      <line x1="28" y1="88" x2="92" y2="88" />
      {/* Curled spiral tail */}
      <path d="M42 84 C32 84 25 76 25 67 C25 58 33 51 42 51 C50 51 56 57 56 65 C56 75 48 83 38 84" />
      {/* Sitting back & body */}
      <path d="M44 84 L80 84" />
      <path d="M42 66 L68 66 L68 84" />
      {/* Upright neck & head */}
      <path d="M68 66 L68 44" />
      {/* Snout / Muzzle */}
      <path d="M68 44 L88 44 L88 54 L68 54" />
      {/* Standing triangular ear */}
      <path d="M68 44 L72 26 L80 44" />
      {/* Front paws fold */}
      <line x1="68" y1="78" x2="90" y2="78" />
      <line x1="90" y1="78" x2="90" y2="88" />
    </svg>
  );
}

/** Authentic Baladi Cat vector emblem from the official cat food packaging diamond. */
export function BaladiCatEmblem({
  size = 80,
  color = 'currentColor',
  strokeWidth,
  tight,
  className,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  tight?: boolean;
  className?: string;
}) {
  const isCompact = tight ?? size <= 44;
  return (
    <svg
      width={size}
      height={size}
      viewBox={isCompact ? '18 20 84 80' : '0 0 120 120'}
      className={cn('shrink-0', className)}
      fill="none"
      stroke={color}
      strokeWidth={resolveEmblemStroke(size, strokeWidth)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Cat head with perky ears */}
      <ellipse cx="60" cy="46" rx="15" ry="13" />
      <path d="M48 40 L45 28 L55 36" />
      <path d="M72 40 L75 28 L65 36" />
      {/* Whiskers (3 on left, 3 on right) */}
      <line x1="36" y1="42" x2="48" y2="44" />
      <line x1="35" y1="47" x2="47" y2="47" />
      <line x1="37" y1="52" x2="48" y2="50" />
      <line x1="84" y1="42" x2="72" y2="44" />
      <line x1="85" y1="47" x2="73" y2="47" />
      <line x1="83" y1="52" x2="72" y2="50" />
      {/* Seated torso & body */}
      <path d="M53 58 C47 67 44 76 44 86 C44 91 50 93 60 93 C70 93 76 91 76 86 C76 76 73 67 67 58" />
      {/* Curved upright tail */}
      <path d="M72 88 C82 88 88 81 88 72 C88 64 83 58 76 58" />
    </svg>
  );
}

/** Combined Cat & Dog Baladi line-art emblem for "Both Worlds" / multi-pet surfaces. */
export function BaladiDuoEmblem({
  size = 20,
  color = 'currentColor',
  catColor,
  dogColor,
  strokeWidth,
  className,
}: {
  size?: number;
  color?: string;
  catColor?: string;
  dogColor?: string;
  strokeWidth?: number;
  className?: string;
}) {
  const sw = strokeWidth ?? (size <= 24 ? 6.2 : size <= 44 ? 5.2 : 3.6);
  return (
    <svg
      width={Math.round(size * 1.45)}
      height={size}
      viewBox="4 20 140 80"
      className={cn('shrink-0', className)}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g transform="translate(-26, 0)" stroke={catColor ?? color} strokeWidth={sw}>
        <ellipse cx="60" cy="46" rx="15" ry="13" />
        <path d="M48 40 L45 28 L55 36" />
        <path d="M72 40 L75 28 L65 36" />
        <line x1="36" y1="42" x2="48" y2="44" />
        <line x1="35" y1="47" x2="47" y2="47" />
        <line x1="37" y1="52" x2="48" y2="50" />
        <line x1="84" y1="42" x2="72" y2="44" />
        <line x1="85" y1="47" x2="73" y2="47" />
        <line x1="83" y1="52" x2="72" y2="50" />
        <path d="M53 58 C47 67 44 76 44 86 C44 91 50 93 60 93 C70 93 76 91 76 86 C76 76 73 67 67 58" />
        <path d="M72 88 C82 88 88 81 88 72 C88 64 83 58 76 58" />
      </g>
      <g transform="translate(46, 2)" stroke={dogColor ?? color} strokeWidth={sw}>
        <line x1="28" y1="88" x2="92" y2="88" />
        <path d="M42 84 C32 84 25 76 25 67 C25 58 33 51 42 51 C50 51 56 57 56 65 C56 75 48 83 38 84" />
        <path d="M44 84 L80 84" />
        <path d="M42 66 L68 66 L68 84" />
        <path d="M68 66 L68 44" />
        <path d="M68 44 L88 44 L88 54 L68 54" />
        <path d="M68 44 L72 26 L80 44" />
        <line x1="68" y1="78" x2="90" y2="78" />
        <line x1="90" y1="78" x2="90" y2="88" />
      </g>
    </svg>
  );
}

/** Renders the geometric Baladi emblem matching a user's saved avatar token or species preference. */
export function SpeciesAvatar({
  avatar,
  species,
  size = 20,
  color = 'currentColor',
  className,
}: {
  avatar?: string;
  species?: 'cats' | 'dogs' | 'both' | 'cat' | 'dog';
  size?: number;
  color?: string;
  className?: string;
}) {
  const token = (avatar || '').trim();

  if (token === 'cat' || token === 'cats' || token === '🐱' || token === '🐈') {
    return <BaladiCatEmblem size={size} color={color} tight className={className} />;
  }
  if (token === 'dog' || token === 'dogs' || token === '🐕' || token === '🐶') {
    return <BaladiDogEmblem size={size} color={color} tight className={className} />;
  }
  if (token === 'cat-badge') {
    return (
      <span
        className={cn('inline-grid place-items-center rounded-full bg-baladi-red text-white', className)}
        style={{ width: size + 6, height: size + 6 }}
      >
        <BaladiCatEmblem size={Math.max(14, size - 2)} color="#FFFFFF" tight />
      </span>
    );
  }
  if (token === 'dog-badge') {
    return (
      <span
        className={cn('inline-grid place-items-center rounded-full bg-baladi-green text-white', className)}
        style={{ width: size + 6, height: size + 6 }}
      >
        <BaladiDogEmblem size={Math.max(14, size - 2)} color="#FFFFFF" tight />
      </span>
    );
  }
  if (token === 'star') {
    return <FolkloricStarBadge size={size} className={className} />;
  }
  if (!token || token === 'both' || token === '🐾') {
    if (species === 'cats' || species === 'cat') {
      return <BaladiCatEmblem size={size} color={color} tight className={className} />;
    }
    if (species === 'dogs' || species === 'dog') {
      return <BaladiDogEmblem size={size} color={color} tight className={className} />;
    }
    return <BaladiDuoEmblem size={Math.max(14, Math.round(size * 0.88))} color={color} className={className} />;
  }

  return <span className={cn('leading-none', className)}>{token}</span>;
}

/** Official GPF (Giza Pet Food Est. 2016) hallmark badge */
export function GpfBadge({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-2.5 font-sans select-none', className)}>
      <div className="rounded-lg bg-white/10 px-2 py-0.5 border border-white/20">
        <span className="text-sm font-black tracking-wider text-white">GPF</span>
      </div>
      <div className="flex flex-col text-start leading-none">
        <span className="text-[10px] font-black tracking-[0.14em] text-white uppercase">GIZA PET FOOD</span>
        <span className="text-[8.5px] font-bold tracking-[0.2em] text-baladi-yellow">EST. 2016</span>
      </div>
    </div>
  );
}

