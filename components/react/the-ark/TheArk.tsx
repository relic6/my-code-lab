import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { designTokens, noiseOverlay, neonBorder, useParallaxTilt } from '../_shared';

/**
 * The Ark — 受 Dribbble「Board Arca」启发的未来感登船 HUD。
 * 纯 React + CSS/SVG 动效（无渲染图、无滚动依赖），像 AE 动画一样自动切换场景：
 *   01 SCAN → 02 ALIGN → 03 BOARD → 04 LAUNCH
 * 切换时整屏配色、飞船环转速、数据读数全部联动并带过场擦除。
 *
 * fullscreen：用于独立全屏路由 /ark（铺满视口）。
 */

type Props = { fullscreen?: boolean };

type Phase = {
  id: string;
  code: string;
  zh: string;
  accent: string;
  glow: string;
  seats: number;
  velocity: string;
  status: string;
};

const PHASES: Phase[] = [
  { id: '01', code: 'SCAN',   zh: '生命体征扫描', accent: '#22d3ee', glow: '34,211,238',  seats: 157, velocity: '0.00', status: 'SCANNING' },
  { id: '02', code: 'ALIGN',  zh: '轨道对齐',     accent: '#8b5cf6', glow: '139,92,246',  seats: 142, velocity: '1.24', status: 'ALIGNING' },
  { id: '03', code: 'BOARD',  zh: '登船序列',     accent: '#ec4899', glow: '236,72,153',  seats: 88,  velocity: '4.80', status: 'BOARDING' },
  { id: '04', code: 'LAUNCH', zh: '发射窗口',     accent: '#f59e0b', glow: '245,158,11',  seats: 12,  velocity: '9.97', status: 'LAUNCH READY' },
];

const CYCLE_MS = 5200;

/** 数字滚动到目标值 */
function useCountUp(target: number, ms = 900) {
  const [val, setVal] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return val;
}

export default function TheArk({ fullscreen = false }: Props) {
  const [active, setActive] = useState(0);
  const [wipe, setWipe] = useState(0); // 每次切换 +1，用于触发过场动画 key
  const tilt = useParallaxTilt<HTMLDivElement>(8);
  const phase = PHASES[active];
  const seats = useCountUp(phase.seats);

  // 自动循环 + 切换过场
  const go = (i: number) => {
    setActive(((i % PHASES.length) + PHASES.length) % PHASES.length);
    setWipe((w) => w + 1);
  };
  useEffect(() => {
    const id = setInterval(() => go(active + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, [active]);

  // 运行时钟（增加“活着”的感觉）
  const [uptime, setUptime] = useState(72840);
  useEffect(() => {
    const id = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const clock = `${String(Math.floor(uptime / 3600) % 100).padStart(2, '0')}:${String(
    Math.floor(uptime / 60) % 60,
  ).padStart(2, '0')}:${String(uptime % 60).padStart(2, '0')}`;

  return (
    <Wrapper
      $fullscreen={fullscreen}
      style={{ ['--accent' as string]: phase.accent, ['--glow' as string]: phase.glow }}
    >
      {/* —— 背景层 —— */}
      <div className="bg-grid" />
      <div className="bg-stars" />
      <div className="bg-glow" />
      <div className="scanlines" />

      {/* —— 中央飞船 + 视差舞台 —— */}
      <div
        className="stage"
        ref={tilt.ref}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
      >
        <div className="ark">
          <span className="ring ring--ticks" />
          <span className="ring ring--dashed" />
          <span className="ring ring--arc" />
          <span className="ring ring--arc2" />
          <span className="sweep" />
          <span className="orbit"><i className="orbit-dot" /></span>
          <span className="orbit orbit--rev"><i className="orbit-dot" /></span>
          <span className="core" />
        </div>

        {/* 大标题，置于飞船之后 */}
        <h1 className="title" key={`t-${wipe}`}>
          <span className="title-out">BOARD</span>
          <span className="title-solid">ARCA</span>
        </h1>
      </div>

      {/* —— HUD 叠层 —— */}
      <div className="hud">
        <header className="hud-top">
          <div className="brand">◈ ARCA<span>SYSTEMS</span></div>
          <nav><a>SERVICES</a><a>PASSES</a><a>VIDEOS</a></nav>
          <div className="status" key={`s-${wipe}`}>
            <i className="dot" />{phase.status}
          </div>
        </header>

        <div className="readout readout--left" key={`l-${wipe}`}>
          <Row k="PHASE" v={`${phase.id} · ${phase.code}`} />
          <Row k="任务" v={phase.zh} />
          <Row k="VELOCITY" v={`${phase.velocity} c`} />
          <Row k="UPLINK" v={clock} />
          <Row k="COORD" v="20167 · 1724" />
        </div>

        <div className="readout readout--right">
          <div className="bigstat" key={`seat-${active}`}>
            <em>{seats}</em>
            <small>AVAILABLE SEATS</small>
          </div>
          <div className="bars">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} style={{ ['--i' as string]: i }} />
            ))}
          </div>
          <div className="bigstat bigstat--sm">
            <em>4751</em>
            <small>DAYS UNTIL FLOOD</small>
          </div>
        </div>

        <button className="cta">Book Seats <span>+</span></button>

        {/* —— 底部场景切换器（AE 时间线感） —— */}
        <div className="switcher">
          {PHASES.map((p, i) => (
            <button
              key={p.id}
              className="seg"
              data-active={i === active}
              onClick={() => go(i)}
              style={{ ['--c' as string]: p.accent }}
            >
              <span className="seg-id">{p.id}</span>
              <span className="seg-code">{p.code}</span>
              <span className="seg-bar"><i key={`p-${active}-${i}`} data-run={i === active} /></span>
            </button>
          ))}
        </div>
      </div>

      {/* —— 过场擦除 —— */}
      <div className="wipe" key={`w-${wipe}`} />
    </Wrapper>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="row">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

/* ============================ 动画 ============================ */
const spin = keyframes`to { transform: rotate(1turn); }`;
const spinRev = keyframes`to { transform: rotate(-1turn); }`;
const pulse = keyframes`
  0%,100% { transform: scale(1); opacity: .9; }
  50% { transform: scale(1.12); opacity: 1; }
`;
const drift = keyframes`from { background-position: 0 0, 0 0; } to { background-position: 0 -1400px, 0 -700px; }`;
const gridmove = keyframes`to { background-position: 0 60px; }`;
const flick = keyframes`
  0%,100% { transform: scaleY(.35); opacity: .5; }
  50% { transform: scaleY(1); opacity: 1; }
`;
const enter = keyframes`
  from { opacity: 0; transform: translateY(14px); filter: blur(6px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
`;
const reveal = keyframes`from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); }`;
const wipeAnim = keyframes`
  0% { transform: scaleX(0); transform-origin: left; }
  45% { transform: scaleX(1); transform-origin: left; }
  55% { transform: scaleX(1); transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
`;
const blink = keyframes`0%,100% { opacity: 1; } 50% { opacity: .25; }`;
const runbar = keyframes`from { transform: scaleX(0); } to { transform: scaleX(1); }`;
const scan = keyframes`to { background-position: 0 100%; }`;

const Wrapper = styled.div<{ $fullscreen: boolean }>`
  ${designTokens};
  --accent: #22d3ee;
  --glow: 34,211,238;

  position: relative;
  width: 100%;
  height: ${(p) => (p.$fullscreen ? '100vh' : '100%')};
  min-height: ${(p) => (p.$fullscreen ? '100vh' : '480px')};
  overflow: hidden;
  background: radial-gradient(120% 90% at 50% 18%, #1a1d35 0%, #0a0a14 55%, #050509 100%);
  color: #e7e9f5;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  border-radius: inherit;
  transition: --accent .6s linear;
  user-select: none;

  &::after { ${noiseOverlay}; z-index: 9; opacity: .12; }

  /* —— 背景 —— */
  .bg-grid {
    position: absolute; inset: -20% 0 -10% 0; z-index: 0;
    background:
      repeating-linear-gradient(90deg, rgba(var(--glow), .12) 0 1px, transparent 1px 60px),
      repeating-linear-gradient(0deg, rgba(var(--glow), .10) 0 1px, transparent 1px 60px);
    transform: perspective(520px) rotateX(62deg) translateY(28%);
    transform-origin: top center;
    mask-image: linear-gradient(to bottom, transparent, #000 40%, #000 70%, transparent);
    animation: ${gridmove} 3.2s linear infinite;
    opacity: .7;
    transition: background .6s linear;
  }
  .bg-stars {
    position: absolute; inset: 0; z-index: 0;
    background-image:
      radial-gradient(1.4px 1.4px at 20% 30%, #fff, transparent),
      radial-gradient(1.2px 1.2px at 70% 60%, #cdd, transparent),
      radial-gradient(1.6px 1.6px at 40% 80%, #fff, transparent),
      radial-gradient(1px 1px at 85% 20%, #aab, transparent),
      radial-gradient(1.3px 1.3px at 55% 12%, #fff, transparent);
    background-size: 600px 700px, 500px 600px, 700px 800px, 400px 500px, 650px 750px;
    opacity: .5; animation: ${drift} 60s linear infinite;
  }
  .bg-glow {
    position: absolute; inset: 0; z-index: 1;
    background: radial-gradient(46% 40% at 50% 46%, rgba(var(--glow), .22), transparent 70%);
    transition: background .6s linear;
  }
  .scanlines {
    position: absolute; inset: 0; z-index: 8; pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 1px, transparent 1px 3px);
    background-size: 100% 200%;
    animation: ${scan} 8s linear infinite;
    mix-blend-mode: overlay; opacity: .5;
  }

  /* —— 中央舞台 + 飞船 —— */
  .stage {
    position: absolute; inset: 0; z-index: 4;
    display: grid; place-items: center;
    perspective: 900px;
    transform: rotateX(var(--rx, 0)) rotateY(var(--ry, 0));
    transform-style: preserve-3d;
    transition: transform .25s var(--ease-out-soft);
  }
  .ark {
    position: relative;
    width: min(46vmin, 420px); aspect-ratio: 1;
    display: grid; place-items: center;
    filter: drop-shadow(0 0 30px rgba(var(--glow), .45));
  }
  .ark .ring, .ark .sweep, .ark .orbit, .ark .core {
    position: absolute; border-radius: 50%; inset: 0; margin: auto;
  }
  .ring--ticks {
    width: 100%; height: 100%;
    background: repeating-conic-gradient(rgba(var(--glow), .55) 0 1.2deg, transparent 1.2deg 6deg);
    -webkit-mask: radial-gradient(transparent 47%, #000 47.5%, #000 50%, transparent 50.5%);
            mask: radial-gradient(transparent 47%, #000 47.5%, #000 50%, transparent 50.5%);
    animation: ${spin} 80s linear infinite; opacity: .8;
    transition: background .6s linear;
  }
  .ring--dashed {
    width: 84%; height: 84%;
    border: 1px dashed rgba(var(--glow), .55);
    animation: ${spinRev} 38s linear infinite;
  }
  .ring--arc {
    width: 66%; height: 66%;
    background: conic-gradient(from 0deg, transparent 0 60deg, var(--accent) 90deg 150deg, transparent 180deg 240deg, var(--accent) 270deg 330deg, transparent 360deg);
    -webkit-mask: radial-gradient(transparent 60%, #000 61%);
            mask: radial-gradient(transparent 60%, #000 61%);
    animation: ${spin} 14s linear infinite;
    filter: drop-shadow(0 0 6px var(--accent));
    transition: background .6s linear;
  }
  .ring--arc2 {
    width: 48%; height: 48%;
    background: conic-gradient(from 120deg, var(--accent) 0 40deg, transparent 40deg 180deg, var(--accent) 180deg 220deg, transparent 220deg 360deg);
    -webkit-mask: radial-gradient(transparent 64%, #000 65%);
            mask: radial-gradient(transparent 64%, #000 65%);
    animation: ${spinRev} 9s linear infinite; opacity: .9;
    transition: background .6s linear;
  }
  .sweep {
    width: 92%; height: 92%;
    background: conic-gradient(from 0deg, transparent 0 300deg, rgba(var(--glow), .45) 350deg, rgba(var(--glow), .9) 360deg);
    -webkit-mask: radial-gradient(transparent 30%, #000 31%);
            mask: radial-gradient(transparent 30%, #000 31%);
    animation: ${spin} 3.6s linear infinite;
    transition: background .6s linear;
  }
  .orbit {
    width: 78%; height: 78%; animation: ${spin} 7s linear infinite;
  }
  .orbit--rev { width: 58%; height: 58%; animation: ${spinRev} 5s linear infinite; }
  .orbit-dot {
    position: absolute; top: -3px; left: 50%; width: 7px; height: 7px;
    border-radius: 50%; background: var(--accent);
    box-shadow: var(--glow-md) var(--accent);
    transition: background .6s linear;
  }
  .core {
    width: 22%; height: 22%;
    background: radial-gradient(circle, #fff 0%, var(--accent) 40%, transparent 72%);
    box-shadow: var(--glow-lg) rgba(var(--glow), .8);
    animation: ${pulse} 2.4s ease-in-out infinite;
    transition: background .6s linear;
  }

  /* —— 大标题 —— */
  .title {
    position: absolute; z-index: -1; margin: 0;
    display: flex; align-items: baseline; gap: .04em; white-space: nowrap;
    font-family: 'Arial Black', Arial, sans-serif;
    font-size: clamp(54px, 12vmin, 168px); line-height: .82; letter-spacing: -0.05em;
    animation: ${reveal} .9s var(--ease-out-soft) both;
  }
  .title-out { color: transparent; -webkit-text-stroke: 1.5px rgba(255,255,255,.28); }
  .title-solid {
    color: #fff;
    text-shadow: 0 0 22px rgba(var(--glow), .55);
    transition: text-shadow .6s linear;
  }

  /* —— HUD —— */
  .hud { position: absolute; inset: 0; z-index: 6; pointer-events: none; }
  .hud > * { pointer-events: auto; }
  .hud a, .hud button { font-family: inherit; }

  .hud-top {
    position: absolute; top: 0; left: 0; right: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: clamp(14px, 2.4vmin, 26px) clamp(16px, 3vmin, 34px);
    font-size: 11px; letter-spacing: 2px;
  }
  .brand { font-weight: 800; letter-spacing: 3px; display: flex; align-items: center; gap: 8px; color: #fff; }
  .brand span { font-weight: 400; opacity: .5; font-size: 9px; letter-spacing: 4px; }
  .hud-top nav { display: flex; gap: clamp(12px, 2vmin, 26px); }
  .hud-top nav a { color: #cfd3e6; opacity: .75; cursor: pointer; font-weight: 600; }
  .hud-top nav a:hover { color: var(--accent); opacity: 1; }
  .status {
    display: flex; align-items: center; gap: 7px; font-weight: 700; color: var(--accent);
    transition: color .6s linear; animation: ${enter} .6s var(--ease-out-soft) both;
  }
  .status .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: var(--glow-sm) var(--accent); animation: ${blink} 1.1s steps(1) infinite; }

  .readout {
    position: absolute; top: 50%; transform: translateY(-50%);
    display: flex; flex-direction: column; gap: clamp(8px, 1.6vmin, 16px);
  }
  .readout--left { left: clamp(16px, 3vmin, 34px); animation: ${enter} .6s var(--ease-out-soft) both; }
  .readout--left .row:nth-child(2) { animation-delay: .05s; }
  .row { display: grid; gap: 2px; min-width: 130px; }
  .row .k { font-size: 9px; letter-spacing: 3px; color: #7e83a3; }
  .row .v { font-size: 14px; font-weight: 700; color: #e7e9f5; font-variant-numeric: tabular-nums; }

  .readout--right { right: clamp(16px, 3vmin, 34px); align-items: flex-end; text-align: right; gap: clamp(14px, 2.4vmin, 26px); }
  .bigstat em { display: block; font-style: normal; font-weight: 800; font-size: clamp(34px, 6vmin, 64px); color: #fff; line-height: 1; font-variant-numeric: tabular-nums; text-shadow: 0 0 18px rgba(var(--glow), .5); transition: text-shadow .6s linear; }
  .bigstat small { font-size: 9px; letter-spacing: 3px; color: #8b8fad; }
  .bigstat--sm em { font-size: clamp(22px, 3.4vmin, 34px); }
  .bars { display: flex; gap: 4px; height: 34px; align-items: flex-end; }
  .bars span {
    width: 5px; height: 100%; transform-origin: bottom; border-radius: 2px;
    background: linear-gradient(to top, var(--accent), rgba(var(--glow), .3));
    animation: ${flick} 1.1s ease-in-out infinite; animation-delay: calc(var(--i) * .12s);
    transition: background .6s linear;
  }

  .cta {
    position: absolute; left: clamp(16px, 4vmin, 56px); bottom: clamp(70px, 13vmin, 120px);
    ${neonBorder({ radius: 40, thickness: 1.5, duration: 5 })};
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 26px; border: none; border-radius: 40px; cursor: pointer;
    background: rgba(255,255,255,.04); backdrop-filter: blur(var(--glass-blur));
    color: #fff; font-weight: 800; font-size: clamp(15px, 2vmin, 20px); letter-spacing: .5px;
  }
  .cta span { color: var(--accent); transition: color .6s linear; }
  .cta:hover { background: rgba(var(--glow), .14); }

  /* —— 场景切换器 —— */
  .switcher {
    position: absolute; left: 50%; transform: translateX(-50%);
    bottom: clamp(16px, 3vmin, 30px);
    display: flex; gap: clamp(6px, 1.4vmin, 14px);
    padding: 8px; border-radius: 14px;
    background: rgba(10,10,20,.5); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,.08);
  }
  .seg {
    position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
    width: clamp(64px, 13vmin, 104px); padding: 8px 10px 10px;
    background: transparent; border: 1px solid transparent; border-radius: 9px;
    cursor: pointer; color: #8b8fad; transition: all .35s var(--ease-out-soft);
  }
  .seg[data-active='true'] { color: #fff; background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.14); }
  .seg-id { font-size: 9px; letter-spacing: 2px; opacity: .7; }
  .seg-code { font-size: 13px; font-weight: 800; letter-spacing: 1px; }
  .seg[data-active='true'] .seg-code { color: var(--c); }
  .seg-bar { width: 100%; height: 2px; border-radius: 2px; background: rgba(255,255,255,.12); overflow: hidden; }
  .seg-bar i { display: block; height: 100%; background: var(--c); transform-origin: left; transform: scaleX(0); }
  .seg-bar i[data-run='true'] { animation: ${runbar} ${CYCLE_MS}ms linear forwards; }

  /* —— 过场擦除 —— */
  .wipe {
    position: absolute; inset: 0; z-index: 7; pointer-events: none;
    background: linear-gradient(90deg, transparent, rgba(var(--glow), .9), transparent);
    transform: scaleX(0);
    animation: ${wipeAnim} .7s var(--ease-out-soft) both;
    mix-blend-mode: screen;
  }

  @media (prefers-reduced-motion: reduce) {
    .ring, .sweep, .orbit, .core, .bars span, .bg-stars, .bg-grid, .scanlines { animation: none !important; }
  }

  @media (max-width: 640px) {
    .readout, .bars { display: none; }
    .title { font-size: clamp(40px, 16vmin, 90px); }
  }
`;
