import { cn } from '../../lib/utils';
import { ZigZagBand } from './Ornaments';

/** Vertical lightning / zigzag strip — now using the authentic packaging zigzag ribbon. */
export function Thunder({ color = '#FBBB21', height = 24, className }: { color?: string; height?: number; className?: string }) {
  return <ZigZagBand color={color} height={height} className={className} />;
}

/** Authentic low-opacity Baladi Cat / Dog emblem watermark from brand guideline. */
export function GhostAnimal({
  species,
  src,
  color = '#FFFFFF',
  className,
  opacity = 0.14,
  flip = false,
  size = 360,
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
  const emblemSrc = isCat ? '/brand/cat-emblem.png' : '/brand/dog-emblem.png';

  return (
    <img
      src={emblemSrc}
      alt=""
      aria-hidden="true"
      className={cn('pointer-events-none absolute select-none object-contain', className)}
      style={{
        opacity,
        transform: flip ? 'scaleX(-1)' : undefined,
        maxWidth: size,
        maxHeight: size,
      }}
      draggable={false}
    />
  );
}
