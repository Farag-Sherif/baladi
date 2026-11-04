import { useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Pointer-driven 3D tilt. Pure CSS transforms — no WebGL cost. */
export default function Tilt3D({
  children,
  className,
  strength = 12,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0, active: false });

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ x: -py * strength, y: px * strength, active: true });
  };

  return (
    <div className={cn('perspective', className)} onPointerMove={onMove} onPointerLeave={() => setT({ x: 0, y: 0, active: false })}>
      <div
        ref={ref}
        className="preserve-3d transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `rotateX(${t.x}deg) rotateY(${t.y}deg) translateZ(0)` }}
      >
        {children}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
            style={{
              opacity: t.active ? 0.5 : 0,
              background: 'radial-gradient(45% 45% at 30% 20%, rgba(255,255,255,0.55), transparent 70%)',
            }}
          />
        )}
      </div>
    </div>
  );
}
