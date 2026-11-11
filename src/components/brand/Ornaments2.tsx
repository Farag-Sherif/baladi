import { useId } from 'react';
import { cn } from '../../lib/utils';
import { BaladiCatEmblem, BaladiDogEmblem } from './Ornaments';

/** Vertical lightning strip — the guideline's side border device. */
export function Thunder({ color = '#FBBB21', height = 24, className }: { color?: string; height?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={cn('block w-full', className)} height={height} viewBox="0 0 240 24" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id={`th-${id}`} width="30" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 2 L10 12 L2 12 L12 22" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
          <path d="M18 2 L28 12 L20 12 L30 22" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
        </pattern>
      </defs>
      <rect width="240" height="24" fill={`url(#th-${id})`} />
    </svg>
  );
}

/** Big low-opacity geometric Baladi animal emblem used as a page background object. */
export function GhostAnimal({
  species,
  src,
  color = '#FFFFFF',
  className,
  opacity = 0.14,
  flip = false,
  size = 360,
  strokeWidth = 3.2,
}: {
  species?: 'cats' | 'dogs';
  src?: string;
  color?: string;
  className?: string;
  opacity?: number;
  flip?: boolean;
  size?: number;
  strokeWidth?: number;
}) {
  const isCat = species ? species === 'cats' : Boolean(src?.includes('cat'));
  const Emblem = isCat ? BaladiCatEmblem : BaladiDogEmblem;

  return (
    <span
      aria-hidden="true"
      className={cn('pointer-events-none absolute aspect-square select-none', className)}
      style={{ opacity, transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <Emblem size={size} color={color} strokeWidth={strokeWidth} tight={false} className="h-full w-full" />
    </span>
  );
}
