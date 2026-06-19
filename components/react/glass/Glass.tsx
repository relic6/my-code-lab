import React from 'react';
import styled from 'styled-components';

type CssVars = React.CSSProperties & Record<`--${string}`, string | number>;

const Card = () => {
  return (
    <StyledWrapper>
      <div className="bg-bubbles">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
      </div>
      <div className="container">
        <div data-text="Github" style={{ '--r': -15 } as CssVars} className="glass">
          <svg viewBox="0 0 496 512" height="1em" xmlns="http://www.w3.org/2000/svg">
            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
          </svg>
        </div>
        <div data-text="Code" style={{ '--r': 5 } as CssVars} className="glass">
          <svg viewBox="0 0 640 512" height="1em" xmlns="http://www.w3.org/2000/svg">
            <path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z" />
          </svg>
        </div>
        <div data-text="Earn" style={{ '--r': 25 } as CssVars} className="glass">
          <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
            <path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm64 320H64V320c35.3 0 64 28.7 64 64zM64 192V128h64c0 35.3-28.7 64-64 64zM448 384c0-35.3 28.7-64 64-64v64H448zm64-192c-35.3 0-64-28.7-64-64h64v64zM288 160a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
          </svg>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 420px;
  background: #0b0f19;
  border-radius: 16px;
  overflow: hidden;
  padding: 60px 40px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
  isolation: isolate;

  .bg-bubbles {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .bubble {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.45;
    animation: float 8s ease-in-out infinite alternate;
  }

  .bubble-1 {
    top: 10%;
    left: 20%;
    width: 140px;
    height: 140px;
    background: linear-gradient(135deg, #a855f7, #6366f1);
    animation-delay: 0s;
  }

  .bubble-2 {
    bottom: 15%;
    right: 20%;
    width: 180px;
    height: 180px;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    animation-delay: -2.5s;
  }

  .bubble-3 {
    top: 40%;
    left: 45%;
    width: 110px;
    height: 110px;
    background: linear-gradient(135deg, #ec4899, #f43f5e);
    animation-delay: -5s;
  }

  @keyframes float {
    0% {
      transform: translate(0, 0) scale(1);
    }
    100% {
      transform: translate(30px, 20px) scale(1.15);
    }
  }

  .container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
  }

  .container .glass {
    position: relative;
    width: 170px;
    height: 210px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 25px 35px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    border-radius: 16px;
    margin: 0 -30px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transform: rotate(calc(var(--r) * 1deg));
    overflow: hidden;
    cursor: pointer;
  }

  .container:hover .glass {
    transform: rotate(0deg);
    margin: 0 12px;
  }

  .container .glass:hover {
    transform: translateY(-16px) scale(1.06);
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.28);
    box-shadow: 0 35px 50px rgba(0, 0, 0, 0.45);
    z-index: 10;
  }

  /* 顶部流光层 */
  .container .glass::after {
    content: '';
    position: absolute;
    top: 0;
    left: -150%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.12),
      transparent
    );
    transform: skewX(-20deg);
    pointer-events: none;
    transition: 0.6s ease;
  }

  .container .glass:hover::after {
    left: 150%;
  }

  /* 底部文本条 */
  .container .glass::before {
    content: attr(data-text);
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 42px;
    background: rgba(255, 255, 255, 0.08);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(255, 255, 255, 0.8);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 0.9em;
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: 0.3s;
  }

  .container .glass:hover::before {
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
  }

  /* SVG 图标动效 */
  .container .glass svg {
    font-size: 2.8em;
    fill: rgba(255, 255, 255, 0.8);
    transition: 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    margin-bottom: 28px;
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15));
  }

  .container .glass:hover svg {
    fill: #fff;
    transform: scale(1.15) translateY(-2px);
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.45));
  }
`;

export default Card;
