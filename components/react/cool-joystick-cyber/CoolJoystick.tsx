import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { designTokens } from '../_shared/tokens';
import { useSpring2D } from '../_shared/useSpring';

type CssVars = React.CSSProperties & Record<`--${string}`, string | number>;

const dirGlyph: Record<string, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  '': '•',
};

const CoolJoystick = () => {
  const [dir, setDir] = useState<string>('');
  const [targetX, setTargetX] = useState<number>(0);
  const [targetY, setTargetY] = useState<number>(0);
  const [mag, setMag] = useState<number>(0);
  const [ripple, setRipple] = useState<number>(0);

  const stickRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<boolean>(false);

  const limitRatio = 0.11;

  // 弹簧驱动的实际渲染位置（回中带过冲回弹）
  const { x: shiftX, y: shiftY } = useSpring2D(targetX, targetY, {
    stiffness: 240,
    damping: 22,
  });

  const applyPosition = (x: number, y: number) => {
    if (!plateRef.current) return;
    const plateWidth = plateRef.current.offsetWidth || 260;
    const radius = plateWidth * limitRatio;
    const distance = Math.hypot(x, y);
    const scale = distance > radius ? radius / distance : 1;
    const nx = x * scale;
    const ny = y * scale;

    setTargetX(nx);
    setTargetY(ny);
    setMag(Math.min(Math.hypot(nx, ny) / radius, 1));
    updateDirection(nx, ny, radius);
  };

  const updateDirection = (x: number, y: number, radius: number) => {
    if (Math.hypot(x, y) < radius * 0.34) {
      setDir('');
      return;
    }
    if (Math.abs(x) > Math.abs(y)) {
      setDir(x > 0 ? 'right' : 'left');
    } else {
      setDir(y > 0 ? 'down' : 'up');
    }
  };

  const getPositionFromPointer = (
    event: PointerEvent | React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!plateRef.current) return { x: 0, y: 0 };
    const rect = plateRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setRipple((r) => r + 1);
    if (stickRef.current) {
      stickRef.current.setPointerCapture(event.pointerId);
    }
    const point = getPositionFromPointer(event);
    applyPosition(point.x, point.y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const point = getPositionFromPointer(event);
    applyPosition(point.x, point.y);
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
    applyPosition(0, 0);
    setDir('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!plateRef.current) return;
    const plateWidth = plateRef.current.offsetWidth || 260;
    const step = plateWidth * limitRatio;

    const keys: Record<string, [number, number, string]> = {
      ArrowUp: [0, -step, 'up'],
      ArrowRight: [step, 0, 'right'],
      ArrowDown: [0, step, 'down'],
      ArrowLeft: [-step, 0, 'left'],
    };

    if (!keys[event.key]) return;
    event.preventDefault();
    const [x, y, d] = keys[event.key];
    setDir(d);
    applyPosition(x, y);
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!event.key.startsWith('Arrow')) return;
    applyPosition(0, 0);
    setDir('');
  };

  const cssVars: CssVars = {
    '--shift-x': `${shiftX}px`,
    '--shift-y': `${shiftY}px`,
    '--mag': mag,
  };

  return (
    <StyledWrapper style={cssVars}>
      <div className="headline" aria-hidden="true">
        <span>React Component</span>
        <span>Cyber HUD</span>
      </div>

      <section className="joystick-field" data-dir={dir} aria-label="霓虹摇杆演示">
        <span className="arrow arrow-up" aria-hidden="true">∧</span>
        <span className="arrow arrow-down" aria-hidden="true">∨</span>
        <span className="arrow arrow-left" aria-hidden="true">&lt;</span>
        <span className="arrow arrow-right" aria-hidden="true">&gt;</span>

        {/* HUD 刻度环 */}
        <div className="hud-ring" aria-hidden="true" />

        {/* 外圈凹陷 */}
        <div ref={plateRef} className="around">
          {/* 底座 */}
          <div className="handle">
            {/* 运动残影 */}
            <div className="trail" aria-hidden="true" />
            {/* 手柄头 */}
            <div
              ref={stickRef}
              className="button-wrapper"
              role="button"
              tabIndex={0}
              aria-label="拖动摇杆，或使用方向键操作"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
            >
              {/* 接触涟漪 */}
              <span key={ripple} className="ripple" aria-hidden="true" />
              {/* 手柄中心 */}
              <div className="inside">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="caption" aria-live="polite">
        <span className="hud-glyph">{dirGlyph[dir]}</span>
        <span className="hud-text">{dir || 'idle'}</span>
        <span className="hud-mag">{mag.toFixed(2)}</span>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  ${designTokens}
  --panel-top: #11151c;
  --panel-bottom: #060810;
  --accent: var(--neon-cyan);
  --size: 260px;

  position: relative;
  width: 100%;
  min-height: 480px;
  display: grid;
  place-items: center;
  padding: 80px 24px 80px;
  color: #9fb6c4;
  font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background:
    radial-gradient(circle at 50% 38%, rgba(34, 211, 238, 0.08), transparent 55%),
    linear-gradient(180deg, var(--panel-top), var(--panel-bottom));
  border-radius: 16px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
  user-select: none;
  overflow: hidden;
  isolation: isolate;

  /* 霓虹网格背景，随摇杆位移视差 */
  &::before {
    content: '';
    position: absolute;
    inset: -10%;
    z-index: -1;
    background-image:
      linear-gradient(rgba(34, 211, 238, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34, 211, 238, 0.06) 1px, transparent 1px);
    background-size: 32px 32px;
    transform: translate(
      calc(var(--shift-x) * -0.6),
      calc(var(--shift-y) * -0.6)
    );
    transition: transform 0.1s linear;
    -webkit-mask: radial-gradient(circle at 50% 45%, #000 30%, transparent 75%);
    mask: radial-gradient(circle at 50% 45%, #000 30%, transparent 75%);
  }

  .headline {
    position: absolute;
    top: 24px;
    left: 50%;
    display: flex;
    justify-content: space-between;
    width: 90%;
    transform: translateX(-50%);
    font-size: 18px;
    font-style: italic;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: rgba(159, 182, 196, 0.7);
    pointer-events: none;
  }

  .headline span:last-child {
    color: var(--accent);
    text-shadow: 0 0 12px var(--accent);
  }

  .joystick-field {
    position: relative;
    width: var(--size);
    height: var(--size);
    margin-top: 10px;
  }

  /* HUD 刻度环 */
  .hud-ring {
    position: absolute;
    inset: -18px;
    border-radius: 50%;
    background: repeating-conic-gradient(
      from 0deg,
      rgba(34, 211, 238, 0.5) 0deg 1.2deg,
      transparent 1.2deg 9deg
    );
    -webkit-mask: radial-gradient(
      farthest-side,
      transparent calc(100% - 8px),
      #000 calc(100% - 7px)
    );
    mask: radial-gradient(
      farthest-side,
      transparent calc(100% - 8px),
      #000 calc(100% - 7px)
    );
    opacity: calc(0.3 + var(--mag) * 0.7);
    filter: drop-shadow(0 0 6px var(--accent));
    transition: opacity 0.2s ease;
  }

  .arrow {
    position: absolute;
    color: rgba(120, 200, 220, 0.55);
    font-size: 28px;
    font-family: 'Arial Rounded MT Bold', 'PingFang SC', sans-serif;
    font-weight: 900;
    line-height: 1;
    transition: color 0.22s ease, text-shadow 0.22s ease;
  }

  .arrow-up {
    top: -42px;
    left: 50%;
    transform: translateX(-50%);
  }
  .arrow-right {
    top: 50%;
    right: -42px;
    transform: translateY(-50%);
  }
  .arrow-down {
    bottom: -42px;
    left: 50%;
    transform: translateX(-50%);
  }
  .arrow-left {
    top: 50%;
    left: -42px;
    transform: translateY(-50%);
  }

  .joystick-field[data-dir='up'] .arrow-up,
  .joystick-field[data-dir='right'] .arrow-right,
  .joystick-field[data-dir='down'] .arrow-down,
  .joystick-field[data-dir='left'] .arrow-left {
    color: var(--accent);
    text-shadow:
      0 0 8px var(--accent),
      0 0 18px var(--accent);
  }

  /* 外圈凹陷 */
  .around {
    position: relative;
    z-index: 1;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at 50% 4%, rgba(0, 0, 0, 0.6) 0%, transparent 62%),
      radial-gradient(circle at 50% 96%, rgba(34, 211, 238, 0.12) 0%, transparent 58%),
      linear-gradient(180deg, #0c1119 0%, #141b25 60%, #1b232f 100%);
    box-shadow:
      0 10px 26px rgba(0, 0, 0, 0.5),
      inset 0 18px 30px rgba(0, 0, 0, 0.7),
      inset 0 -10px 24px rgba(34, 211, 238, 0.1),
      inset 0 0 0 1px rgba(34, 211, 238, 0.18);
  }

  /* 底座 */
  .handle {
    position: relative;
    width: 72%;
    height: 72%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 50% 35%, #1c2530, #0a0e15 80%);
    box-shadow:
      inset 0 0 18px rgba(0, 0, 0, 0.9),
      inset 0 0 40px rgba(0, 0, 0, 0.6),
      0 6px 14px rgba(0, 0, 0, 0.5);
  }

  /* 运动残影 */
  .trail {
    position: absolute;
    width: 60%;
    height: 60%;
    border-radius: 50%;
    background: radial-gradient(circle, var(--accent), transparent 70%);
    opacity: calc(var(--mag) * 0.5);
    filter: blur(8px);
    transform: translate(
      calc(var(--shift-x) * 0.6),
      calc(var(--shift-y) * 0.6)
    );
    pointer-events: none;
  }

  /* 手柄头 */
  .button-wrapper {
    position: relative;
    z-index: 1;
    width: 60%;
    height: 60%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    background: radial-gradient(
      circle at 50% 18%,
      #2a3744 0%,
      #161e27 55%,
      #0b1118 100%
    );
    box-shadow:
      0 10px 16px rgba(0, 0, 0, 0.6),
      inset 0 10px 18px rgba(120, 200, 220, 0.18),
      inset 0 -10px 18px rgba(0, 0, 0, 0.7),
      0 0 calc(8px + var(--mag) * 22px)
        rgba(34, 211, 238, calc(0.2 + var(--mag) * 0.5));
    transform: translate(var(--shift-x), var(--shift-y));
    transition: box-shadow 0.15s ease;
    outline: none;
    touch-action: none;
  }

  .around:hover .button-wrapper {
    transform: translate(var(--shift-x), var(--shift-y)) scale(1.02);
  }

  .button-wrapper:active {
    cursor: grabbing;
  }

  .button-wrapper:focus-visible {
    box-shadow:
      0 0 0 4px rgba(34, 211, 238, 0.3),
      0 10px 16px rgba(0, 0, 0, 0.6),
      inset 0 10px 18px rgba(120, 200, 220, 0.18),
      inset 0 -10px 18px rgba(0, 0, 0, 0.7);
  }

  /* 接触涟漪 */
  .ripple {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid var(--accent);
    opacity: 0;
    pointer-events: none;
    animation: ripple-expand 0.6s ease-out;
  }

  @keyframes ripple-expand {
    0% {
      transform: scale(0.6);
      opacity: 0.8;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  /* 手柄中心 */
  .inside {
    position: relative;
    width: 76%;
    height: 76%;
    border-radius: inherit;
    background: radial-gradient(
      circle at 38% 28%,
      #38505e 0%,
      #18222c 50%,
      #0c131a 100%
    );
    box-shadow:
      inset 0 2px 4px rgba(120, 200, 220, 0.25),
      inset 0 -3px 5px rgba(0, 0, 0, 0.7),
      inset 0 0 0 1px rgba(34, 211, 238, 0.2);
  }

  /* 防滑圆点 */
  .dot {
    position: absolute;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: radial-gradient(
      circle at 50% 28%,
      #bfeefb 0%,
      #2a8aa0 55%,
      #0c2730 100%
    );
    box-shadow:
      0 0 6px rgba(34, 211, 238, 0.5),
      inset 0 1px 1px rgba(255, 255, 255, 0.6);
  }

  .dot:nth-child(1) {
    top: 6%;
    left: 50%;
    transform: translateX(-50%);
  }
  .dot:nth-child(2) {
    bottom: 6%;
    left: 50%;
    transform: translateX(-50%);
  }
  .dot:nth-child(3) {
    left: 6%;
    top: 50%;
    transform: translateY(-50%);
  }
  .dot:nth-child(4) {
    right: 6%;
    top: 50%;
    transform: translateY(-50%);
  }

  /* HUD 数据读出 */
  .caption {
    position: absolute;
    bottom: 24px;
    left: 50%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 14px;
    color: var(--accent);
    background: rgba(10, 16, 22, 0.6);
    border: 1px solid rgba(34, 211, 238, 0.25);
    border-radius: 999px;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 1px;
    transform: translateX(-50%);
    white-space: nowrap;
    backdrop-filter: blur(4px);
    text-shadow: 0 0 8px rgba(34, 211, 238, 0.6);
  }

  .hud-glyph {
    font-size: 16px;
  }

  .hud-text {
    min-width: 42px;
    text-transform: uppercase;
  }

  .hud-mag {
    color: var(--neon-lime);
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 8px rgba(163, 230, 53, 0.6);
  }

  @media (max-width: 760px) {
    .headline {
      font-size: 15px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .button-wrapper,
    .arrow,
    &::before {
      transition: none;
    }
    .ripple {
      animation: none;
    }
  }
`;

export default CoolJoystick;
