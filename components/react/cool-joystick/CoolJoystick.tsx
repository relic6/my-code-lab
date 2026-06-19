import React, { useState, useRef } from 'react';
import styled from 'styled-components';

type CssVars = React.CSSProperties & Record<`--${string}`, string | number>;

const CoolJoystick = () => {
  const [dir, setDir] = useState<string>('');
  const [shiftX, setShiftX] = useState<number>(0);
  const [shiftY, setShiftY] = useState<number>(0);

  const stickRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<boolean>(false);

  const limitRatio = 0.11;

  const applyPosition = (x: number, y: number) => {
    if (!plateRef.current) return;
    const plateWidth = plateRef.current.offsetWidth || 260;
    const radius = plateWidth * limitRatio;
    const distance = Math.hypot(x, y);
    const scale = distance > radius ? radius / distance : 1;
    const nx = x * scale;
    const ny = y * scale;

    setShiftX(nx);
    setShiftY(ny);
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

  const getPositionFromPointer = (event: PointerEvent | React.PointerEvent<HTMLDivElement>) => {
    if (!plateRef.current) return { x: 0, y: 0 };
    const rect = plateRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
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
  };

  return (
    <StyledWrapper style={cssVars}>
      <div className="headline" aria-hidden="true">
        <span>React Component</span>
        <span>Neumorphic</span>
      </div>

      <section className="joystick-field" data-dir={dir} aria-label="拟态摇杆演示">
        <span className="arrow arrow-up" aria-hidden="true">∧</span>
        <span className="arrow arrow-down" aria-hidden="true">∨</span>
        <span className="arrow arrow-left" aria-hidden="true">&lt;</span>
        <span className="arrow arrow-right" aria-hidden="true">&gt;</span>

        {/* 外圈凹陷 */}
        <div ref={plateRef} className="around">
          {/* 底座 */}
          <div className="handle">
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
              {/* 手柄中心 */}
              <div className="inside">
                {/* 防滑圆点 */}
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="caption">React 版本的拟态摇杆</div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  --bg-top: #f6f8fa;
  --bg-bottom: #9da4a8;
  --plate: #c7cfd3;
  --plate-light: #eef3f5;
  --rim: #cbd3d7;
  --pit: #566066;
  --pit-deep: #20282d;
  --cap: #cbd4d8;
  --cap-soft: #edf3f5;
  --ink: #80888e;
  --accent: #d29a45;
  --shadow: rgba(24, 32, 37, .42);
  --lift: rgba(255, 255, 255, .76);
  --size: 260px;

  position: relative;
  width: 100%;
  min-height: 480px;
  display: grid;
  place-items: center;
  padding: 80px 24px 80px;
  color: var(--ink);
  font-family: "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif;
  background-image: linear-gradient(180deg, #f5f8fa, #9da4a8);
  border-radius: 16px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
  user-select: none;
  overflow: hidden;
  isolation: isolate;

  &::before,
  &::after {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    content: "";
  }

  &::before {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, .28), transparent 26%),
      repeating-linear-gradient(0deg,
        rgba(255, 255, 255, .08) 0,
        rgba(255, 255, 255, .08) 1px,
        transparent 1px,
        transparent 4px);
    mix-blend-mode: soft-light;
    opacity: .72;
  }

  &::after {
    background: linear-gradient(90deg,
        rgba(255, 255, 255, .28) 0%,
        transparent 22%,
        transparent 78%,
        rgba(255, 255, 255, .26) 100%);
  }

  .headline {
    position: absolute;
    top: 24px;
    left: 50%;
    display: flex;
    justify-content: space-between;
    width: 90%;
    transform: translateX(-50%);
    font-size: 20px;
    font-style: italic;
    font-weight: 800;
    letter-spacing: 0;
    opacity: .86;
    pointer-events: none;
  }

  .headline span {
    filter: drop-shadow(0 2px 1px rgba(255, 255, 255, .58));
    white-space: nowrap;
  }

  .headline span:first-child {
    text-align: left;
  }

  .headline span:last-child {
    text-align: right;
  }

  .joystick-field {
    position: relative;
    width: var(--size);
    height: var(--size);
    margin-top: 10px;
  }

  .arrow {
    position: absolute;
    color: #9ba2a6;
    font-size: 28px;
    font-family: "Arial Rounded MT Bold", "PingFang SC", sans-serif;
    font-weight: 900;
    line-height: 1;
    opacity: .78;
    user-select: none;
    filter: drop-shadow(0 2px 1px rgba(255, 255, 255, .68));
    text-shadow:
      0 -1px 1px rgba(255, 255, 255, .66),
      0 2px 2px rgba(70, 78, 84, .38);
    transition: color .22s ease, opacity .22s ease;
  }

  .arrow-up {
    top: -36px;
    left: 50%;
    transform: translateX(-50%);
  }

  .arrow-right {
    top: 50%;
    right: -36px;
    transform: translateY(-50%);
  }

  .arrow-down {
    bottom: -36px;
    left: 50%;
    transform: translateX(-50%);
  }

  .arrow-left {
    top: 50%;
    left: -36px;
    transform: translateY(-50%);
  }

  .joystick-field[data-dir="up"] .arrow-up,
  .joystick-field[data-dir="right"] .arrow-right,
  .joystick-field[data-dir="down"] .arrow-down,
  .joystick-field[data-dir="left"] .arrow-left {
    color: var(--accent);
    opacity: 1;
    filter:
      drop-shadow(0 2px 1px rgba(255, 255, 255, .72)) drop-shadow(0 4px 5px rgba(126, 82, 26, .22));
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
      radial-gradient(circle at 50% 96%, rgba(255, 255, 255, .65) 0%, rgba(255, 255, 255, .25) 28%, transparent 58%),
      radial-gradient(circle at 50% 4%, rgba(40, 48, 54, .42) 0%, rgba(40, 48, 54, .18) 32%, transparent 64%),
      linear-gradient(180deg, #c4ccd0 0%, #d7dde0 50%, #eef2f3 100%);
    box-shadow:
      0 10px 22px rgba(0, 0, 0, .22),
      0 2px 4px rgba(0, 0, 0, .14),
      inset 0 16px 26px -2px rgba(20, 28, 34, .55),
      inset 0 6px 14px rgba(20, 28, 34, .35),
      inset 0 -10px 20px rgba(255, 255, 255, .6),
      inset 0 -3px 6px rgba(255, 255, 255, .45),
      inset 0 0 40px rgba(60, 70, 76, .18);
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
    background-image: linear-gradient(0deg, #f5f8fa, #9da4a8);
    box-shadow:
      0 0 10px rgba(0, 0, 0, .5),
      0 10px 10px rgba(0, 0, 0, .2),
      inset 0 0 16px rgba(0, 0, 0, .85),
      inset 0 0 24px rgba(0, 0, 0, .75),
      inset 0 0 48px rgba(0, 0, 0, .2);
  }

  /* 手柄头 */
  .button-wrapper {
    position: relative;
    z-index: 1;
    width: 68%;
    height: 68%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    background:
      radial-gradient(circle at 50% 6%, rgba(255, 255, 255, .85) 0%, rgba(255, 255, 255, .4) 26%, transparent 58%),
      radial-gradient(circle at 50% 96%, rgba(28, 36, 42, .45) 0%, rgba(28, 36, 42, .18) 30%, transparent 62%),
      linear-gradient(180deg, #f6f9fa 0%, #dbe1e4 50%, #9da4a8 100%);
    box-shadow:
      0 -12px 10px rgba(255, 255, 255, .5),
      0 9px 14px rgba(0, 0, 0, .5),
      0 19px 8px -2px rgba(0, 0, 0, .2),
      0 33px 8px rgba(0, 0, 0, .4),
      inset 0 14px 22px -3px rgba(255, 255, 255, .72),
      inset 0 5px 9px rgba(255, 255, 255, .55),
      inset 0 -14px 22px rgba(20, 28, 34, .42),
      inset 0 -5px 9px rgba(20, 28, 34, .32);
    transform: translate(var(--shift-x), var(--shift-y));
    transition: transform .2s cubic-bezier(.2, .9, .2, 1.15), box-shadow .2s ease;
    outline: none;
    touch-action: none;
  }

  .around:hover .button-wrapper {
    transform: translate(var(--shift-x), var(--shift-y)) scale(1.02);
  }

  .button-wrapper:active {
    cursor: grabbing;
    transition: none;
  }

  .button-wrapper:focus-visible {
    box-shadow:
      0 0 0 5px rgba(210, 154, 69, .24),
      0 -12px 10px rgba(255, 255, 255, .5),
      0 9px 14px rgba(0, 0, 0, .5),
      0 19px 8px -2px rgba(0, 0, 0, .2),
      0 33px 8px rgba(0, 0, 0, .4),
      inset 0 14px 22px -3px rgba(255, 255, 255, .72),
      inset 0 5px 9px rgba(255, 255, 255, .55),
      inset 0 -14px 22px rgba(20, 28, 34, .42),
      inset 0 -5px 9px rgba(20, 28, 34, .32);
  }

  /* 手柄中心 */
  .inside {
    position: relative;
    width: 78%;
    height: 78%;
    border-radius: inherit;
    background:
      radial-gradient(circle at 34% 24%, rgba(255, 255, 255, .74) 0 12%, rgba(255, 255, 255, .28) 24%, transparent 42%),
      radial-gradient(circle at 50% 112%, rgba(255, 255, 255, .82) 0 18%, transparent 48%),
      linear-gradient(0deg, #f5f8fa 0%, #dce3e6 42%, #aeb8bd 100%);
    box-shadow:
      inset 0 3px 5px rgba(255, 255, 255, .58),
      inset 0 -4px 5px rgba(89, 91, 92, .42),
      inset 0 0 0 1px rgba(255, 255, 255, .28),
      0 2px 4px rgba(0, 0, 0, .22);
  }

  /* 防滑圆点 */
  .dot {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 50% 28%, #ffffff 0%, #e6ebee 22%, #aab0b4 62%, #5e6469 100%);
    box-shadow:
      0 1px 1.5px rgba(0, 0, 0, .55),
      0 2px 3px rgba(0, 0, 0, .3),
      inset 0 1px 1px rgba(255, 255, 255, .9),
      inset 0 -1px 1px rgba(20, 28, 34, .5);
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

  .caption {
    position: absolute;
    bottom: 24px;
    left: 50%;
    padding: .22em .48em;
    color: #080b0c;
    background: rgba(134, 143, 149, .22);
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 0.5px;
    transform: translateX(-50%);
    white-space: nowrap;
    backdrop-filter: blur(2px);
  }

  @media (max-width: 760px) {
    .headline {
      font-size: 16px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .button-wrapper,
    .arrow {
      transition: none;
    }
  }
`;

export default CoolJoystick;
