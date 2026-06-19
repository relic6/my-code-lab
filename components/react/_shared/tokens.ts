import { css } from 'styled-components';

/**
 * 共享设计令牌：霓虹色板、辉光、玻璃材质、缓动。
 * 以 CSS 自定义属性形式注入，各组件 styled-components 通过 var() 引用。
 */
export const designTokens = css`
  /* —— 霓虹主色板 —— */
  --neon-violet: #8b5cf6;
  --neon-cyan: #22d3ee;
  --neon-pink: #ec4899;
  --neon-lime: #a3e635;
  --neon-amber: #f59e0b;

  /* —— 辉光强度令牌 —— */
  --glow-sm: 0 0 8px;
  --glow-md: 0 0 18px;
  --glow-lg: 0 0 36px;

  /* —— 玻璃材质令牌 —— */
  --glass-fill: rgba(255, 255, 255, 0.06);
  --glass-stroke: rgba(255, 255, 255, 0.16);
  --glass-blur: 18px;

  /* —— 缓动 —— */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
`;

/**
 * 细颗粒噪声纹理（内联 SVG feTurbulence），消除玻璃面的塑料感。
 * 作为 background-image 叠加，配合低 opacity + mix-blend-mode。
 */
export const NOISE_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")";

/** 噪声叠加层的复用样式片段 */
export const noiseOverlay = css`
  content: '';
  position: absolute;
  inset: 0;
  background-image: ${NOISE_DATA_URI};
  background-size: 160px 160px;
  mix-blend-mode: overlay;
  opacity: 0.18;
  pointer-events: none;
`;
