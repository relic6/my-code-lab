import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { designTokens, noiseOverlay, useParallaxTilt } from '../_shared';

/**
 * Digital Wall — 受 Dribbble「Digital Walls」(Cosmin Capitanu) 启发。
 * 纯 React/CSS：一面 3D 透视的深色玻璃 bento 瓷砖墙。
 *   - 鼠标视差倾斜整面墙（useParallaxTilt）
 *   - 瓷砖逐个入场 + 悬浮时沿 Z 轴抬起发光
 *   - 天气主面板自动轮播城市，温度数字滚动
 * 自包含，所有“图片”用 CSS 渐变模拟，无外部资源。
 */

type City = { name: string; coord: string; temp: number; sky: string };

const CITIES: City[] = [
  { name: 'San Francisco', coord: '48.9° N · 122.9° W', temp: 21, sky: 'linear-gradient(135deg,#f6a585,#e98a9b 45%,#7b6fb0)' },
  { name: 'Tokyo',         coord: '35.6° N · 139.6° E', temp: 27, sky: 'linear-gradient(135deg,#8ec5fc,#a18cd1 60%,#4b3f72)' },
  { name: 'Reykjavík',     coord: '64.1° N · 21.9° W',  temp: 4,  sky: 'linear-gradient(135deg,#a1c4fd,#7ad7d0 55%,#3a6073)' },
  { name: 'Marrakech',     coord: '31.6° N · 8.0° W',   temp: 33, sky: 'linear-gradient(135deg,#f9d29d,#f6926b 50%,#8a4b53)' },
];

function useCountUp(target: number, ms = 700) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (n: number) => {
      const t = Math.min(1, (n - start) / ms);
      setV(Math.round(a + (target - a) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

// 飞出 / 飞入各自的总时长（最大延迟 + 最大时长），用于排过场节奏
const EXIT_MS = 1650;
const ENTER_MS = 1750;

export default function DigitalWall() {
  const [ci, setCi] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1); // 1 向下翻 / -1 向上翻
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter');
  const pending = useRef<number | null>(null);
  const tilt = useParallaxTilt<HTMLDivElement>(7);
  const city = CITIES[ci];
  const temp = useCountUp(city.temp);

  // 仅在静止态可翻页，避免动画叠加
  const go = (next: number, d: 1 | -1) => {
    if (phase !== 'idle') return;
    setDir(d);
    pending.current = ((next % CITIES.length) + CITIES.length) % CITIES.length;
    setPhase('exit');
  };

  // 过场推进：exit → 换页 → enter → idle
  useEffect(() => {
    if (phase === 'exit') {
      const t = setTimeout(() => {
        if (pending.current != null) setCi(pending.current);
        setPhase('enter');
      }, EXIT_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'enter') {
      const t = setTimeout(() => setPhase('idle'), ENTER_MS);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // 自动轮播
  useEffect(() => {
    const id = setInterval(() => go(ci + 1, 1), 5000);
    return () => clearInterval(id);
  }, [ci, phase]);

  return (
    <Wrapper>
      <div className="room" />
      <div
        className="wall"
        ref={tilt.ref}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
      >
        <div className="grid" data-phase={phase} style={{ ['--dir' as string]: dir }}>
          {/* 左侧缩略图栏 */}
          {[0, 1, 2, 3].map((i) => (
            <Tile key={`th${i}`} className="tile thumb" style={S(1, i + 1)} d={i}>
              <span className="ph" style={{ background: thumbGrad(i) }} />
              <span className="bars"><i /><i /></span>
            </Tile>
          ))}

          {/* 天气主面板 */}
          <Tile className="tile feature" style={S(2, 1, 3, 2)} d={4}>
            <div className="sky" style={{ background: city.sky }}>
              <span className="cloud" />
            </div>
            <div className="feature-head">
              <h3 key={city.name}>{city.name}</h3>
              <small>{city.coord}</small>
            </div>
            <div className="feature-foot">
              <em>{temp}<sup>°</sup></em>
              <div className="mini">
                <span className="mini-tile" style={{ background: 'linear-gradient(135deg,#3aa0c4,#2b6f9e)' }}>21°</span>
                <span className="mini-tile night" />
                <span className="mini-tile dev"><i /></span>
              </div>
            </div>
          </Tile>

          {/* 人像 */}
          <Tile className="tile portrait" style={S(5, 1, 2, 2)} d={5}>
            <span className="ph" style={{ background: 'radial-gradient(120% 90% at 70% 25%,#f3c9a7,#caa07e 40%,#3b2f3a)' }} />
            <span className="name">Jamie</span>
          </Tile>

          {/* 数值卡 */}
          <Tile className="tile stat cyan" style={S(2, 3)} d={6}>
            <em>160<sup>$</sup></em><span className="line" />
          </Tile>

          {/* 视频 */}
          <Tile className="tile video" style={S(3, 3, 2, 2)} d={7}>
            <span className="ph" style={{ background: 'linear-gradient(135deg,#2a3550,#172033)' }} />
            <button className="play" aria-label="play"><i /></button>
          </Tile>

          {/* 圆形设备 */}
          <Tile className="tile device" style={S(5, 3)} d={8}>
            <span className="dial"><i /></span>
          </Tile>

          {/* 数值卡 */}
          <Tile className="tile stat violet" style={S(6, 3, 1, 2)} d={9}>
            <em>189<sup>°</sup></em><span className="line" />
          </Tile>

          {/* 桥夜景 */}
          <Tile className="tile bridge" style={S(2, 4)} d={10}>
            <span className="ph" style={{ background: 'linear-gradient(135deg,#3b2a52,#7a3b63 60%,#d98a6a)' }} />
          </Tile>

          {/* 头像组 */}
          <Tile className="tile crew" style={S(5, 4)} d={11}>
            {['#e98a9b', '#8ec5fc', '#a3e635', '#f6926b'].map((c, i) => (
              <i key={i} style={{ background: c, ['--i' as string]: i }} />
            ))}
          </Tile>
        </div>

        {/* 导航弧 + 城市指示 */}
        <div className="nav">
          <button className="chev" aria-label="up" onClick={() => go(ci - 1, -1)}><span /></button>
          <div className="dots">
            {CITIES.map((_, i) => (
              <button key={i} data-active={i === ci} onClick={() => go(i, i >= ci ? 1 : -1)} />
            ))}
          </div>
          <button className="chev" aria-label="down" onClick={() => go(ci + 1, 1)}><span className="down" /></button>
        </div>
      </div>
    </Wrapper>
  );
}

/* grid 定位简写：列 / 行 / 跨列 / 跨行 */
function S(col: number, row: number, sc = 1, sr = 1): React.CSSProperties {
  return { gridColumn: `${col} / span ${sc}`, gridRow: `${row} / span ${sr}` };
}
function thumbGrad(i: number) {
  return [
    'linear-gradient(135deg,#5b8def,#3b5bbf)',
    'linear-gradient(135deg,#6dd5c5,#3a8f86)',
    'linear-gradient(135deg,#b08cf0,#6d4fb0)',
    'linear-gradient(135deg,#f0a78c,#bf5f55)',
  ][i];
}

/**
 * 单块海报瓷砖。竖直直线飞入/飞出，仅靠节奏制造错落：
 *   --d 出场/入场延迟（按 d 递增，保证“先飞出的先飞入”同序）
 *   --t 飞行时长（按 d 派生出不同速度，制造不规则错落感）
 */
function Tile({
  d,
  className,
  style,
  children,
}: {
  d: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const dur = 0.5 + ((d * 7) % 5) * 0.12; // 0.5s ~ 0.98s，各块不同
  return (
    <div
      className={className}
      style={{
        ...style,
        ['--d' as string]: `${d * 0.07}s`,
        ['--t' as string]: `${dur}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ============================ 动画 ============================ */
/* 飞出：沿翻页方向竖直飞离画面（dir=1 向下翻 → 旧页向上飞出），纯直线 */
const flyOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(calc(var(--dir) * -160%)); }
`;
/* 飞入：下一页从相反方向竖直飞进来（dir=1 → 从下方飞入），纯直线 */
const flyIn = keyframes`
  from { opacity: 0; transform: translateY(calc(var(--dir) * 160%)); }
  to   { opacity: 1; transform: translateY(0); }
`;
const cloudDrift = keyframes`
  from { transform: translateX(-12%); } to { transform: translateX(12%); }
`;
const popIn = keyframes`from { transform: scale(0); } to { transform: scale(1); }`;
const softIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  ${designTokens};
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  overflow: hidden;
  background:
    radial-gradient(120% 80% at 75% 10%, #2a2d3a 0%, #14151c 55%, #0a0b10 100%);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #e9ebf5;
  border-radius: inherit;
  display: grid;
  place-items: center;
  perspective: 1600px;

  &::after { ${noiseOverlay}; opacity: .1; z-index: 6; }

  /* 地面 / 房间氛围 */
  .room {
    position: absolute; inset: 0; z-index: 0;
    background:
      linear-gradient(transparent 62%, rgba(255,255,255,.04) 78%, transparent),
      radial-gradient(60% 30% at 30% 95%, rgba(255,255,255,.05), transparent 70%);
  }

  /* 透视墙 */
  .wall {
    position: relative; z-index: 2;
    width: min(86%, 880px); aspect-ratio: 16 / 9;
    transform-style: preserve-3d;
    transform:
      rotateY(calc(-16deg + var(--ry, 0deg)))
      rotateX(calc(3deg + var(--rx, 0deg)));
    transition: transform .3s var(--ease-out-soft);
  }

  .grid {
    position: absolute; inset: 0;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: clamp(6px, 1.1vmin, 12px);
    padding: clamp(8px, 1.6vmin, 18px);
    border-radius: 14px;
    background: linear-gradient(160deg, rgba(20,22,32,.92), rgba(8,9,14,.96));
    border: 1px solid rgba(255,255,255,.06);
    box-shadow: 0 40px 80px -30px rgba(0,0,0,.8), inset 0 0 60px rgba(0,0,0,.5);
    transform-style: preserve-3d;
  }

  .tile {
    position: relative; overflow: hidden; border-radius: 9px;
    background: var(--glass-fill);
    border: 1px solid rgba(255,255,255,.07);
    backdrop-filter: blur(var(--glass-blur));
    transform-style: preserve-3d;
    transition: transform .35s var(--ease-spring), box-shadow .35s ease, border-color .35s ease;
    cursor: pointer;
  }
  /* PPT 式飞入飞出：先飞出的（--d 小）先飞入，各块时长 --t 不同 → 错落不规则 */
  .grid[data-phase='exit'] .tile {
    animation: ${flyOut} var(--t) var(--ease-out-soft) both;
    animation-delay: var(--d);
    pointer-events: none;
  }
  .grid[data-phase='enter'] .tile {
    animation: ${flyIn} var(--t) var(--ease-out-soft) both;
    animation-delay: var(--d);
  }
  .tile:hover {
    transform: translateZ(34px);
    border-color: rgba(255,255,255,.22);
    box-shadow: 0 18px 40px -12px rgba(0,0,0,.7), var(--glow-md) rgba(120,150,255,.25);
    z-index: 3;
  }
  .tile .ph { position: absolute; inset: 0; display: block; }
  .tile::before {
    content: ''; position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,.45));
    pointer-events: none;
  }

  .thumb .bars { position: absolute; left: 8px; bottom: 8px; right: 8px; z-index: 2; display: grid; gap: 4px; }
  .thumb .bars i { height: 3px; border-radius: 2px; background: rgba(255,255,255,.45); }
  .thumb .bars i:last-child { width: 60%; background: rgba(255,255,255,.25); }

  /* 天气主面板 */
  .feature { background: #11131c; }
  .feature .sky { position: absolute; inset: 0; }
  .feature .sky .cloud {
    position: absolute; inset: -10% -20%;
    background: radial-gradient(40% 60% at 30% 40%, rgba(255,255,255,.55), transparent 70%),
                radial-gradient(50% 70% at 70% 55%, rgba(255,255,255,.4), transparent 72%);
    filter: blur(6px); animation: ${cloudDrift} 12s ease-in-out infinite alternate;
  }
  .feature::before { background: linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55)); }
  .feature-head { position: absolute; top: 14px; left: 16px; z-index: 2; }
  .feature-head h3 { margin: 0; font-size: clamp(18px, 3vmin, 30px); font-weight: 700; animation: ${softIn} .5s var(--ease-out-soft) both; }
  .feature-head small { opacity: .8; font-size: 10px; letter-spacing: 1px; }
  .feature-foot { position: absolute; left: 16px; right: 16px; bottom: 14px; z-index: 2; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
  .feature-foot em { font-style: normal; font-weight: 800; font-size: clamp(26px, 5vmin, 48px); line-height: 1; font-variant-numeric: tabular-nums; }
  .feature-foot sup { font-size: .45em; vertical-align: super; }
  .feature .mini { display: flex; gap: 6px; }
  .mini-tile { width: clamp(34px, 6vmin, 56px); aspect-ratio: 16/11; border-radius: 6px; display: grid; place-items: center; font-size: 11px; font-weight: 700; color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,.12); }
  .mini-tile.night { background: linear-gradient(135deg,#3b2a52,#7a3b63 60%,#d98a6a); }
  .mini-tile.dev { background: #1a1f2e; }
  .mini-tile.dev i { width: 60%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #fff, #aab 60%, #555); }

  /* 人像 */
  .portrait .name { position: absolute; right: 12px; top: 12px; z-index: 2; font-weight: 600; font-size: 14px; text-shadow: 0 1px 6px rgba(0,0,0,.6); }

  /* 数值卡 */
  .stat { display: grid; align-content: center; padding: 10px 12px; }
  .stat em { font-style: normal; font-weight: 800; font-size: clamp(18px, 3.4vmin, 30px); color: #fff; }
  .stat sup { font-size: .5em; vertical-align: super; opacity: .8; }
  .stat .line { height: 3px; width: 60%; border-radius: 2px; margin-top: 6px; }
  .stat.cyan { background: linear-gradient(150deg,#2aa6c9,#1f6f95); }
  .stat.cyan .line { background: rgba(255,255,255,.5); }
  .stat.violet { background: linear-gradient(150deg,#7b78e8,#4b47b0); }
  .stat.violet .line { background: rgba(255,255,255,.5); }
  .stat::before { display: none; }

  /* 视频 */
  .video .play {
    position: absolute; inset: 0; margin: auto; width: 44px; height: 44px; z-index: 2;
    border: none; border-radius: 50%; cursor: pointer;
    background: rgba(255,255,255,.85); display: grid; place-items: center;
    box-shadow: var(--glow-md) rgba(255,255,255,.3);
  }
  .video .play i { width: 0; height: 0; margin-left: 3px; border-left: 12px solid #14151c; border-top: 8px solid transparent; border-bottom: 8px solid transparent; }

  /* 圆形设备 */
  .device { display: grid; place-items: center; background: #11131c; }
  .device .dial { width: 70%; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(var(--neon-cyan) 0 65%, rgba(255,255,255,.1) 65% 100%); display: grid; place-items: center; -webkit-mask: radial-gradient(transparent 52%, #000 53%); mask: radial-gradient(transparent 52%, #000 53%); }
  .device::after { content: ''; position: absolute; width: 26%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #fff, #9aa 60%, #445); box-shadow: var(--glow-sm) rgba(255,255,255,.4); }

  /* 头像组 */
  .crew { display: flex; align-items: center; justify-content: center; gap: -6px; background: #11131c; }
  .crew i { width: clamp(18px, 3vmin, 26px); aspect-ratio: 1; border-radius: 50%; margin-left: -6px; border: 2px solid #11131c; animation: ${popIn} .4s var(--ease-spring) both; animation-delay: calc(var(--d) + var(--i) * .08s); }
  .crew::before { display: none; }

  /* 导航 */
  .nav { position: absolute; right: -38px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .chev { width: 26px; height: 26px; border-radius: 50%; border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.05); cursor: pointer; display: grid; place-items: center; }
  .chev span { width: 7px; height: 7px; border-left: 2px solid #cfd3e6; border-top: 2px solid #cfd3e6; transform: rotate(45deg) translate(1px,1px); }
  .chev span.down { transform: rotate(-135deg) translate(1px,1px); }
  .dots { display: flex; flex-direction: column; gap: 7px; }
  .dots button { width: 7px; height: 7px; border-radius: 50%; border: none; cursor: pointer; background: rgba(255,255,255,.25); transition: all .3s; }
  .dots button[data-active='true'] { background: var(--neon-cyan); box-shadow: var(--glow-sm) var(--neon-cyan); height: 16px; border-radius: 4px; }

  @media (prefers-reduced-motion: reduce) {
    .tile, .crew i, .feature .cloud,
    .grid[data-phase] .tile { animation: none !important; opacity: 1; }
  }
  @media (max-width: 640px) {
    .wall { width: 96%; transform: rotateY(-8deg); }
    .nav { right: 6px; }
  }
`;
