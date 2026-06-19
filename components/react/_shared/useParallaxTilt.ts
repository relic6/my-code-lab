import { useCallback, useRef } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * 指针视差倾斜 hook。
 * 把指针在元素内的相对位置映射为 CSS 变量：
 *   --rx / --ry  倾斜角（deg）
 *   --mx / --my  光斑位置（%）
 * 组件用 transform: rotateX(var(--rx)) rotateY(var(--ry)) 与
 * radial-gradient(... at var(--mx) var(--my)) 消费。
 */
export function useParallaxTilt<T extends HTMLElement = HTMLDivElement>(max = 10) {
  const ref = useRef<T>(null);
  const frame = useRef<number | null>(null);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const { clientX, clientY } = e;
      if (frame.current != null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (clientX - r.left) / r.width - 0.5;
        const py = (clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--rx', `${-py * max}deg`);
        el.style.setProperty('--ry', `${px * max}deg`);
        el.style.setProperty('--mx', `${px * 100 + 50}%`);
        el.style.setProperty('--my', `${py * 100 + 50}%`);
      });
    },
    [max],
  );

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (frame.current != null) cancelAnimationFrame(frame.current);
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
