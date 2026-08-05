import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTilt } from './useTilt';

/** A card that leans toward the pointer. Flat and static under reduced motion. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const tilt = useTilt({ maxTilt: 7, stiffness: 200, damping: 20 });

  return (
    <div style={{ perspective: 900 }} onPointerMove={tilt.onPointerMove} onPointerLeave={tilt.onPointerLeave}>
      <motion.div
        style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformStyle: 'preserve-3d' }}
        className={cn(
          'card relative h-full overflow-hidden p-5 transition-colors hover:border-line-strong',
          className,
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}
