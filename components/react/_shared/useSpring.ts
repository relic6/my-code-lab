import { useEffect, useRef, useState } from 'react';

type SpringConfig = {
  stiffness?: number;
  damping?: number;
  mass?: number;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * 轻量 2D 弹簧物理 hook（基于 rAF，无第三方依赖）。
 * 传入目标坐标，返回带过冲回弹的当前坐标。
 * 用于摇杆回中、卡片浮落等需要"重量感"的交互。
 */
export function useSpring2D(
  targetX: number,
  targetY: number,
  { stiffness = 170, damping = 18, mass = 1 }: SpringConfig = {},
) {
  const [pos, setPos] = useState({ x: targetX, y: targetY });
  const state = useRef({ x: targetX, y: targetY, vx: 0, vy: 0 });
  const target = useRef({ x: targetX, y: targetY });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    target.current = { x: targetX, y: targetY };

    if (prefersReducedMotion()) {
      state.current = { x: targetX, y: targetY, vx: 0, vy: 0 };
      return;
    }

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const s = state.current;
      const t = target.current;

      const fx = -stiffness * (s.x - t.x) - damping * s.vx;
      const fy = -stiffness * (s.y - t.y) - damping * s.vy;
      s.vx += (fx / mass) * dt;
      s.vy += (fy / mass) * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      setPos({ x: s.x, y: s.y });

      const settled =
        Math.abs(s.x - t.x) < 0.05 &&
        Math.abs(s.y - t.y) < 0.05 &&
        Math.hypot(s.vx, s.vy) < 0.05;
      if (settled) {
        s.x = t.x;
        s.y = t.y;
        s.vx = 0;
        s.vy = 0;
        setPos({ x: t.x, y: t.y });
        raf.current = null;
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };

    if (raf.current == null) {
      last = performance.now();
      raf.current = requestAnimationFrame(tick);
    }
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [targetX, targetY, stiffness, damping, mass]);

  return prefersReducedMotion() ? { x: targetX, y: targetY } : pos;
}
