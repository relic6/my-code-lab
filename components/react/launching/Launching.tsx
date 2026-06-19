import React from 'react';
import styled from 'styled-components';
import { designTokens } from '../_shared/tokens';

const letters = 'LAUNCHING'.split('');

type CssVars = React.CSSProperties & Record<`--${string}`, string | number>;

// 火焰粒子（喷射尾焰），错相位 + 随机水平抖动
const embers = Array.from({ length: 16 }, (_, i) => ({
  delay: (i * 0.12).toFixed(2),
  jx: `${(Math.sin(i * 1.7) * 16).toFixed(1)}px`,
  scale: (0.6 + (i % 4) * 0.2).toFixed(2),
}));

// 远/近两层星点，制造上升视差
const starsFar = Array.from({ length: 10 }, (_, i) => i);
const starsNear = Array.from({ length: 7 }, (_, i) => i);

const Loader = () => (
  <StyledWrapper role="status" aria-label="Launching">
    <div className="starfield far" aria-hidden="true">
      {starsFar.map((i) => (
        <i
          key={`far-${i}`}
          className="sky-star"
          style={{ '--sx': `${(i * 37) % 100}%`, '--sd': `${i * 0.6}s` } as CssVars}
        />
      ))}
    </div>
    <div className="starfield near" aria-hidden="true">
      {starsNear.map((i) => (
        <i
          key={`near-${i}`}
          className="sky-star"
          style={{ '--sx': `${(i * 53) % 100}%`, '--sd': `${i * 0.4}s` } as CssVars}
        />
      ))}
    </div>

    <div className="loader-wrapper">
      <div className="shockwave" aria-hidden="true" />
      <div className="loader" />

      <div className="embers" aria-hidden="true">
        {embers.map((e, i) => (
          <i
            key={`ember-${i}`}
            className="ember"
            style={{ '--delay': `${e.delay}s`, '--jx': e.jx, '--s': e.scale } as CssVars}
          />
        ))}
      </div>

      {letters.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className="loader-letter"
          style={{ '--letter-index': index } as CssVars}
        >
          {letter}
        </span>
      ))}
    </div>
  </StyledWrapper>
);

const StyledWrapper = styled.div`
  ${designTokens}
  --bg: #05070d;

  position: relative;
  display: grid;
  min-width: 320px;
  min-height: 320px;
  place-items: center;
  padding: 48px;
  background:
    radial-gradient(circle at 50% 50%, rgba(139, 124, 255, 0.15), transparent 50%),
    linear-gradient(180deg, #121624 0%, var(--bg) 100%);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
  overflow: hidden;
  isolation: isolate;

  /* —— 星空视差 —— */
  .starfield {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .sky-star {
    position: absolute;
    top: -10%;
    left: var(--sx);
    border-radius: 50%;
    background: #fff;
    animation: rise linear infinite;
    animation-delay: var(--sd);
  }

  .starfield.far .sky-star {
    width: 2px;
    height: 2px;
    opacity: 0.35;
    animation-duration: 7s;
  }

  .starfield.near .sky-star {
    width: 3px;
    height: 3px;
    opacity: 0.6;
    box-shadow: 0 0 6px #fff;
    animation-duration: 4s;
  }

  @keyframes rise {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(420px);
    }
  }

  .loader-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    font-family: 'Inter', sans-serif;
    font-size: 1.2em;
    font-weight: 600;
    color: #fff;
    border-radius: 50%;
    background-color: rgba(255, 0, 85, 0.07);
    box-shadow: 0 0 60px -10px rgba(255, 255, 255, 0.33);
    user-select: none;
    z-index: 1;
  }

  /* —— 点火冲击波 —— */
  .shockwave {
    position: absolute;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 2px solid rgba(255, 170, 0, 0.5);
    animation: shock 2s ease-out infinite;
    z-index: 0;
  }

  @keyframes shock {
    0% {
      transform: scale(0.6);
      opacity: 0.8;
    }
    70% {
      opacity: 0;
    }
    100% {
      transform: scale(2.4);
      opacity: 0;
    }
  }

  .loader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    background-color: transparent;
    animation: loader-rotate 2s linear infinite;
    z-index: 1;
  }

  @keyframes loader-rotate {
    0% {
      transform: rotate(90deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 30px 0 rgba(255, 255, 255, 0.33) inset,
        0 60px 60px 0 rgba(255, 0, 0, 0.07) inset;
    }
    50% {
      transform: rotate(270deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 10px 0 rgba(255, 170, 0, 0.6) inset,
        0 40px 60px 0 rgba(255, 0, 0, 0.13) inset;
    }
    100% {
      transform: rotate(450deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 30px 0 rgba(255, 255, 255, 0.33) inset,
        0 60px 60px 0 rgba(255, 0, 0, 0.07) inset;
    }
  }

  /* —— 火焰粒子尾焰 —— */
  .embers {
    position: absolute;
    bottom: 8px;
    left: 50%;
    width: 0;
    height: 0;
    z-index: 0;
  }

  .ember {
    position: absolute;
    left: 0;
    top: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: radial-gradient(circle, #fff, var(--neon-amber) 45%, transparent 72%);
    animation: ember-fall 1.6s ease-in infinite;
    animation-delay: var(--delay);
    opacity: 0;
  }

  @keyframes ember-fall {
    0% {
      transform: translate(var(--jx), 0) scale(var(--s));
      opacity: 1;
      filter: blur(0px);
      background: radial-gradient(circle, #fff, var(--neon-amber) 45%, transparent 72%);
    }
    60% {
      opacity: 0.8;
    }
    100% {
      transform: translate(calc(var(--jx) * 1.6), 120px) scale(0.2);
      opacity: 0;
      filter: blur(3px);
      background: radial-gradient(circle, var(--neon-pink), transparent 70%);
    }
  }

  .loader-letter {
    display: inline-block;
    opacity: 0.4;
    transform: translateY(0);
    animation: loader-letter-anim 2s infinite;
    animation-delay: calc(var(--letter-index) * 0.1s);
    z-index: 2;
    border-radius: 50ch;
    border: none;
    filter: blur(2px);
    margin: 0.35em;
  }

  @keyframes loader-letter-anim {
    0%,
    100% {
      opacity: 0;
      transform: translateY(0);
      filter: blur(2px);
    }
    20% {
      opacity: 1;
      transform: scale(1.2) translateY(-1px);
      filter: blur(0px);
      text-shadow:
        0px 0px 2px #fff,
        0px 0px 6px #000;
    }
    40% {
      opacity: 0.7;
      transform: translateY(0);
      filter: blur(2px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .loader,
    .loader-letter,
    .ember,
    .shockwave,
    .sky-star {
      animation-duration: 0.01ms;
      animation-iteration-count: 1;
    }
  }
`;

export default Loader;
