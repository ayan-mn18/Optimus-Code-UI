import { useEffect, useState } from 'react';
import { useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

interface Tilt {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  /** Pointer position normalised to -0.5…0.5, for parallaxing layers by depth. */
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
}

/**
 * Pointer-driven 3D tilt for a scene or card. Returns spring-damped rotations so
 * the motion settles instead of tracking the cursor rigidly. Disabled entirely
 * when the visitor asks for reduced motion.
 */
export function useTilt({ maxTilt = 10, stiffness = 120, damping = 18 } = {}): Tilt {
  const reduced = usePrefersReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness, damping, mass: 0.4 });
  const springY = useSpring(y, { stiffness, damping, mass: 0.4 });

  const rotateY = useTransform(springX, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [maxTilt, -maxTilt]);

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left) / bounds.width - 0.5);
    y.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { rotateX, rotateY, offsetX: springX, offsetY: springY, onPointerMove, onPointerLeave };
}
