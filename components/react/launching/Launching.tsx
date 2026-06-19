import React from 'react';
import styled from 'styled-components';

const letters = 'LAUNCHING'.split('');

type CssVars = React.CSSProperties & Record<`--${string}`, string | number>;

const Loader = () => (
  <StyledWrapper role="status" aria-label="Launching">
    <div className="loader-wrapper">
      <div className="loader" />
      {Array.from({ length: 7 }, (_, index) => (
        <i key={`star-${index}`} className="star" />
      ))}
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
  --bg: #05070d;

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

  .loader-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    font-family: "Inter", sans-serif;
    font-size: 1.2em;
    font-weight: 600;
    color: #fff;
    border-radius: 50%;
    background-color: rgba(255, 0, 85, 0.07); /* #f051 */
    box-shadow: 0 0 60px -10px rgba(255, 255, 255, 0.33); /* #fff5 */
    user-select: none;
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
    z-index: 0;
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

  .loader-letter {
    display: inline-block;
    opacity: 0.4;
    transform: translateY(0);
    animation: loader-letter-anim 2s infinite;
    animation-delay: calc(var(--letter-index) * 0.1s);
    z-index: 1;
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

  .star {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #fff;
    transform: translate(20px, 90px);
    animation: blur-anim 2s infinite;
    box-shadow: 0 0 8px 0 #fff;
    filter: blur(4px);
    opacity: 0.2;
  }

  .star:nth-of-type(2) {
    transform: translate(56px, 46px);
    scale: 1.05;
    animation-delay: 0.2s;
  }
  .star:nth-of-type(3) {
    transform: translate(-26px, 56px);
    scale: 1.4;
    animation-delay: 0.4s;
  }
  .star:nth-of-type(4) {
    transform: translate(-50px, -70px);
    scale: 0.95;
    animation-delay: 0.7s;
  }
  .star:nth-of-type(5) {
    transform: translate(32px, -66px);
    scale: 1.3;
    animation-delay: 0.35s;
  }
  .star:nth-of-type(6) {
    transform: translate(82px, -36px);
    scale: 1;
    animation-delay: 0.9s;
  }
  .star:nth-of-type(7) {
    transform: translate(-92px, 26px);
    scale: 1;
    animation-delay: 0.95s;
  }

  @keyframes blur-anim {
    0%,
    100% {
      opacity: 0.2;
      filter: blur(4px);
    }
    50% {
      opacity: 0.3;
      filter: blur(1px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .loader,
    .loader-letter,
    .star {
      animation-duration: 0.01ms;
      animation-iteration-count: 1;
    }
  }
`;

export default Loader;
