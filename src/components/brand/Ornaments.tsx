import { useId } from 'react';
import { cn } from '../../lib/utils';
import { useLang } from '../../lib/lang';

/** Authentic Baladi Grid Pattern background overlay from brand guideline (-01.png). */
export function BaladiGridBackground({
  className,
  opacity = 0.08,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 select-none bg-repeat', className)}
      style={{
        backgroundImage: 'url(/brand/pattern-grid.png)',
        backgroundSize: '480px auto',
        opacity,
      }}
    />
  );
}

/** The pack's zig-zag ribbon with the dot in every valley, matching brand guideline (بلدي-06.png). */
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
          <path d="M0 7 L6 1 L12 7 L18 1 L24 7" stroke={color} strokeWidth={weight} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M0 19 L6 13 L12 19 L18 13 L24 19" stroke={color} strokeWidth={weight} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {dots && <circle cx="12" cy="10" r="1.7" fill={color} />}
        </pattern>
      </defs>
      <rect width="240" height="24" fill={`url(#zz-${id})`} />
    </svg>
  );
}

/** Authentic Baladi Medallion Badge from official brand guideline (بلدي-05.png). */
export function DiamondBadge({
  size = 34,
  className,
}: {
  size?: number;
  ink?: string;
  accent?: string;
  dot?: string;
  className?: string;
}) {
  return (
    <img
      src="/brand/medallion.png"
      alt=""
      width={size}
      height={size}
      draggable={false}
      aria-hidden="true"
      className={cn('inline-block shrink-0 select-none object-contain drop-shadow-sm', className)}
      style={{ width: size, height: size }}
    />
  );
}

/** Authentic Baladi Leaf & Wheat Stem ornament from brand guideline (-02.png). */
export function LeafStem({
  className,
  color,
  height = 160,
  white = false,
}: {
  className?: string;
  color?: string;
  height?: number;
  white?: boolean;
}) {
  const isWhite = white || color === '#FFFFFF' || color === '#FBF6EE';
  return (
    <img
      src="/brand/stem-ornament.png"
      alt=""
      height={height}
      draggable={false}
      aria-hidden="true"
      className={cn('pointer-events-none select-none object-contain', className)}
      style={{
        height,
        width: 'auto',
        filter: isWhite ? 'brightness(0) invert(1)' : undefined,
      }}
    />
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

/** Authentic Baladi Dog Emblem from official brand guideline (بلدي-03.png). */
export function BaladiDogEmblem({
  size,
  color = 'currentColor',
  className,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  tight?: boolean;
  className?: string;
}) {
  const isFillFull = className?.includes('w-full') || className?.includes('h-full');
  const dim = size ?? 24;
  const isWhite = color === '#FFFFFF' || color === '#ffffff' || color === 'white';

  if (isWhite) {
    return (
      <img
        src="/brand/dog-emblem.png"
        alt=""
        width={dim}
        height={dim}
        draggable={false}
        aria-hidden="true"
        className={cn('inline-block shrink-0 select-none object-contain', className)}
        style={{
          width: isFillFull ? undefined : dim,
          height: isFillFull ? undefined : dim,
        }}
      />
    );
  }

  return (
    <span
      className={cn('inline-block shrink-0 select-none', className)}
      style={{
        width: isFillFull ? undefined : dim,
        height: isFillFull ? undefined : dim,
        backgroundColor: color === 'currentColor' ? 'currentColor' : color,
        maskImage: 'url(/brand/dog-emblem.png)',
        WebkitMaskImage: 'url(/brand/dog-emblem.png)',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
      aria-hidden="true"
    />
  );
}

/** Authentic Baladi Cat Emblem from official brand guideline (بلدي-04.png). */
export function BaladiCatEmblem({
  size,
  color = 'currentColor',
  className,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  tight?: boolean;
  className?: string;
}) {
  const isFillFull = className?.includes('w-full') || className?.includes('h-full');
  const dim = size ?? 24;
  const isWhite = color === '#FFFFFF' || color === '#ffffff' || color === 'white';

  if (isWhite) {
    return (
      <img
        src="/brand/cat-emblem.png"
        alt=""
        width={dim}
        height={dim}
        draggable={false}
        aria-hidden="true"
        className={cn('inline-block shrink-0 select-none object-contain', className)}
        style={{
          width: isFillFull ? undefined : dim,
          height: isFillFull ? undefined : dim,
        }}
      />
    );
  }

  return (
    <span
      className={cn('inline-block shrink-0 select-none', className)}
      style={{
        width: isFillFull ? undefined : dim,
        height: isFillFull ? undefined : dim,
        backgroundColor: color === 'currentColor' ? 'currentColor' : color,
        maskImage: 'url(/brand/cat-emblem.png)',
        WebkitMaskImage: 'url(/brand/cat-emblem.png)',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
      aria-hidden="true"
    />
  );
}

/** Combined Cat & Dog Baladi line-art emblem for "Both Worlds" / multi-pet surfaces. */
export function BaladiDuoEmblem({
  size = 20,
  color = 'currentColor',
  catColor,
  dogColor,
  className,
}: {
  size?: number;
  color?: string;
  catColor?: string;
  dogColor?: string;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 select-none shrink-0', className)}>
      <BaladiCatEmblem size={size} color={catColor ?? color} />
      <BaladiDogEmblem size={size} color={dogColor ?? color} />
    </span>
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
    return <BaladiCatEmblem size={size} color={color} className={className} />;
  }
  if (token === 'dog' || token === 'dogs' || token === '🐕' || token === '🐶') {
    return <BaladiDogEmblem size={size} color={color} className={className} />;
  }
  if (token === 'cat-badge') {
    return (
      <span
        className={cn('inline-grid place-items-center rounded-full bg-baladi-red text-white p-1', className)}
        style={{ width: size + 6, height: size + 6 }}
      >
        <BaladiCatEmblem size={Math.max(14, size - 2)} color="#FFFFFF" />
      </span>
    );
  }
  if (token === 'dog-badge') {
    return (
      <span
        className={cn('inline-grid place-items-center rounded-full bg-baladi-green text-white p-1', className)}
        style={{ width: size + 6, height: size + 6 }}
      >
        <BaladiDogEmblem size={Math.max(14, size - 2)} color="#FFFFFF" />
      </span>
    );
  }
  if (token === 'star') {
    return <DiamondBadge size={size} className={className} />;
  }
  if (!token || token === 'both' || token === '🐾') {
    if (species === 'cats' || species === 'cat') {
      return <BaladiCatEmblem size={size} color={color} className={className} />;
    }
    if (species === 'dogs' || species === 'dog') {
      return <BaladiDogEmblem size={size} color={color} className={className} />;
    }
    return <BaladiDuoEmblem size={Math.max(14, Math.round(size * 0.88))} color={color} className={className} />;
  }

  return <span className={cn('leading-none', className)}>{token}</span>;
}

/** Official GPF (Giza Pet Food Est. 2016) hallmark badge */
export function GpfBadge({ className }: { className?: string }) {
  const { lang, t } = useLang();
  const isEn = lang === 'en';
  return (
    <div className={cn('inline-flex items-center gap-2.5 font-sans select-none', className)}>
      <div className="rounded-lg bg-white/10 px-2 py-0.5 border border-white/20">
        <span className={cn('text-sm font-black text-white', isEn && 'tracking-wider')}>
          {t('الجيزة', 'GPF')}
        </span>
      </div>
      <div className="flex flex-col text-start leading-none">
        <span className={cn('text-[10px] font-black text-white', isEn && 'tracking-[0.14em] uppercase')}>
          {t('الجيزة لطعام الحيوانات', 'GIZA PET FOOD')}
        </span>
        <span className={cn('text-[8.5px] font-bold text-baladi-yellow', isEn && 'tracking-[0.2em]')}>
          {t('منذ ٢٠١٦', 'EST. 2016')}
        </span>
      </div>
    </div>
  );
}
