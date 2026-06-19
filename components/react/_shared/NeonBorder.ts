import { css, keyframes } from 'styled-components';

/**
 * 霓虹流光描边：conic-gradient 旋转边框。
 * 用法：在目标元素上展开 neonBorder()，元素需 position:relative + 自身有圆角。
 * 通过伪元素 ::before 实现，置于内容之下。
 */
const spin = keyframes`
  to { transform: rotate(1turn); }
`;

type NeonBorderOptions = {
  /** 旋转一周秒数 */
  duration?: number;
  /** 描边粗细 px */
  thickness?: number;
  /** 圆角 px，需与宿主一致 */
  radius?: number;
  /** 渐变色序列 */
  colors?: string;
  /** 静止时不透明度 */
  opacity?: number;
};

export const neonBorder = ({
  duration = 6,
  thickness = 1.5,
  radius = 16,
  colors = 'var(--neon-cyan), var(--neon-violet), var(--neon-pink), var(--neon-cyan)',
  opacity = 0.9,
}: NeonBorderOptions = {}) => css`
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -${thickness}px;
    z-index: -1;
    border-radius: ${radius + thickness}px;
    background: conic-gradient(from 0deg, ${colors});
    opacity: ${opacity};
    animation: ${spin} ${duration}s linear infinite;
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    padding: ${thickness}px;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`;
