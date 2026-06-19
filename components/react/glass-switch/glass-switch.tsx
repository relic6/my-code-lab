import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { designTokens } from '../_shared/tokens';

const Card = () => {
  const frontRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  // 指针角度驱动全息箔片彩虹流动
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = frontRef.current;
    if (!el) return;
    const { clientX, clientY } = e;
    if (frame.current != null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      el.style.setProperty('--hx', `${px * 100}%`);
      el.style.setProperty('--hy', `${py * 100}%`);
      el.style.setProperty('--angle', `${px * 220}deg`);
    });
  }, []);

  return (
    <StyledWrapper>
      <div className="card" onPointerMove={onPointerMove}>
        <div className="content">
          {/* 正面 (Front) - 美食卡片 + 全息箔片 */}
          <div className="front" ref={frontRef}>
            <div className="img">
              <div className="circle circle-1" />
              <div className="circle circle-2" />
              <div className="circle circle-3" />
            </div>
            <div className="holo" aria-hidden="true" />
            <div className="front-content">
              <small className="badge">Pasta</small>
              <div className="description">
                <div className="title-wrapper">
                  <p className="title">
                    <strong>Spaghetti Bolognese</strong>
                  </p>
                  <svg viewBox="0 0 32 32" height="15px" width="15px" fill="#20c997">
                    <path d="M25,27l-9,-6.75l-9,6.75v-23h18z" />
                  </svg>
                </div>
                <p className="card-footer">30 Mins &nbsp; | &nbsp; 1 Serving</p>
              </div>
            </div>
          </div>

          {/* 背面 (Back) - 双层反向霓虹流光 */}
          <div className="back">
            <div className="back-content">
              <svg stroke="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" height="50px" width="50px" fill="#ffffff">
                <g id="SVGRepo_iconCarrier">
                  <path d="M20.84375 0.03125C20.191406 0.0703125 19.652344 0.425781 19.21875 1.53125C18.988281 2.117188 18.5 3.558594 18.03125 4.9375C17.792969 5.636719 17.570313 6.273438 17.40625 6.75C17.390625 6.796875 17.414063 6.855469 17.40625 6.90625C17.398438 6.925781 17.351563 6.949219 17.34375 6.96875L17.25 7.25C18.566406 7.65625 19.539063 8.058594 19.625 8.09375C22.597656 9.21875 28.351563 11.847656 33.28125 16.78125C38.5 22 41.183594 28.265625 42.09375 30.71875C42.113281 30.761719 42.375 31.535156 42.75 32.84375C42.757813 32.839844 42.777344 32.847656 42.78125 32.84375C43.34375 32.664063 44.953125 32.09375 46.3125 31.625C47.109375 31.351563 47.808594 31.117188 48.15625 31C49.003906 30.714844 49.542969 30.292969 49.8125 29.6875C50.074219 29.109375 50.066406 28.429688 49.75 27.6875C49.605469 27.347656 49.441406 26.917969 49.25 26.4375C47.878906 23.007813 45.007813 15.882813 39.59375 10.46875C33.613281 4.484375 25.792969 1.210938 22.125 0.21875C21.648438 0.0898438 21.234375 0.0078125 20.84375 0.03125 Z M 16.46875 9.09375L0.0625 48.625C-0.09375 48.996094 -0.00390625 49.433594 0.28125 49.71875C0.472656 49.910156 0.738281 50 1 50C1.128906 50 1.253906 49.988281 1.375 49.9375L40.90625 33.59375C40.523438 32.242188 40.222656 31.449219 40.21875 31.4375C39.351563 29.089844 36.816406 23.128906 31.875 18.1875C27.035156 13.34375 21.167969 10.804688 18.875 9.9375C18.84375 9.925781 17.8125 9.5 16.46875 9.09375 Z M 17 16C19.761719 16 22 18.238281 22 21C22 23.761719 19.761719 26 17 26C15.140625 26 13.550781 24.972656 12.6875 23.46875L15.6875 16.1875C16.101563 16.074219 16.550781 16 17 16 Z M 31 22C32.65625 22 34 23.34375 34 25C34 25.917969 33.585938 26.730469 32.9375 27.28125L32.90625 27.28125C33.570313 27.996094 34 28.949219 34 30C34 32.210938 32.210938 34 30 34C27.789063 34 26 32.210938 26 30C26 28.359375 26.996094 26.960938 28.40625 26.34375L28.3125 26.3125C28.117188 25.917969 28 25.472656 28 25C28 23.34375 29.34375 22 31 22 Z M 21 32C23.210938 32 25 33.789063 25 36C25 36.855469 24.710938 37.660156 24.25 38.3125L20.3125 39.9375C18.429688 39.609375 17 37.976563 17 36C17 33.789063 18.789063 32 21 32 Z M 9 34C10.65625 34 12 35.34375 12 37C12 38.65625 10.65625 40 9 40C7.902344 40 6.960938 39.414063 6.4375 38.53125L8.25 34.09375C8.488281 34.03125 8.742188 34 9 34Z" />
                </g>
              </svg>
              <strong>Hovered!</strong>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  ${designTokens}

  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 420px;
  background: radial-gradient(circle at 50% 50%, #171923 0%, #080a10 100%);
  border-radius: 16px;
  overflow: hidden;
  padding: 60px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
  perspective: 1000px;
  isolation: isolate;

  .card {
    overflow: visible;
    width: 200px;
    height: 265px;
    cursor: pointer;
  }

  .content {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    border-radius: 20px;
  }

  /* 悬浮上托 + 投影变深变散（重量感） */
  .card:hover .content {
    transform: rotateY(180deg) translateY(-10px);
    box-shadow: 0 40px 70px rgba(0, 0, 0, 0.5);
  }

  .front,
  .back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* 正面样式 */
  .front {
    --hx: 50%;
    --hy: 50%;
    --angle: 110deg;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: white;
    transform: rotateY(0deg);
  }

  /* 全息箔片层：随指针角度流动的彩虹镭射膜 */
  .holo {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    border-radius: 20px;
    background:
      radial-gradient(
        120px circle at var(--hx) var(--hy),
        rgba(255, 255, 255, 0.35),
        transparent 60%
      ),
      conic-gradient(
        from var(--angle),
        rgba(255, 0, 122, 0.35),
        rgba(0, 229, 255, 0.35),
        rgba(167, 230, 53, 0.35),
        rgba(139, 92, 246, 0.35),
        rgba(255, 0, 122, 0.35)
      );
    mix-blend-mode: color-dodge;
    opacity: 0.45;
    transition: opacity 0.3s ease;
  }

  .card:hover .holo {
    opacity: 0;
  }

  .front .img {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
  }

  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(25px);
    animation: floating 3s ease-in-out infinite alternate;
  }

  .circle-1 {
    width: 90px;
    height: 90px;
    background: linear-gradient(135deg, #ffbb66, #ff8866);
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .circle-2 {
    width: 140px;
    height: 140px;
    background: linear-gradient(135deg, #ff5e62, #ff9966);
    bottom: -10%;
    right: -10%;
    animation-delay: -1s;
  }

  .circle-3 {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #ff2233, #ec4899);
    top: 50%;
    right: 15%;
    animation-delay: -2s;
  }

  @keyframes floating {
    0% {
      transform: translateY(0px) scale(1);
    }
    100% {
      transform: translateY(15px) scale(1.08);
    }
  }

  .front .front-content {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 1;
  }

  .front-content .badge {
    background-color: rgba(255, 255, 255, 0.12);
    padding: 4px 12px;
    border-radius: 20px;
    backdrop-filter: blur(4px);
    width: fit-content;
    font-size: 0.8em;
    font-weight: 600;
    letter-spacing: 0.5px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .description {
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
    width: 100%;
    padding: 12px;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .title-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .title-wrapper p.title {
    font-size: 13px;
    font-weight: 700;
    margin: 0;
    color: #fff;
    line-height: 1.3;
  }

  .card-footer {
    color: rgba(255, 255, 255, 0.6);
    margin-top: 6px;
    font-size: 9px;
    letter-spacing: 0.3px;
  }

  /* 背面样式 */
  .back {
    transform: rotateY(180deg);
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 双层反向旋转霓虹流光 */
  .back::before,
  .back::after {
    position: absolute;
    content: ' ';
    display: block;
    width: 180px;
    height: 180%;
  }

  .back::before {
    background: linear-gradient(
      90deg,
      transparent,
      var(--neon-cyan),
      var(--neon-violet),
      var(--neon-cyan),
      transparent
    );
    animation: rotation_481 5000ms infinite linear;
  }

  .back::after {
    width: 150px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--neon-pink),
      transparent
    );
    animation: rotation_481 7000ms infinite linear reverse;
    opacity: 0.7;
  }

  .back-content {
    position: absolute;
    width: 98%;
    height: 98%;
    background-color: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 18px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    z-index: 1;
  }

  .back-content strong {
    text-shadow:
      0 0 6px var(--neon-cyan),
      0 0 14px var(--neon-violet);
    animation: pulse 1.6s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.85;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes rotation_481 {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .circle,
    .back::before,
    .back::after,
    .back-content strong {
      animation: none;
    }
    .content {
      transition-duration: 0.3s;
    }
  }
`;

export default Card;
