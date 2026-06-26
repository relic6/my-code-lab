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

type City = { name: string; coord: string; temp: number; sky: string; bgImage: string };

const CITIES: City[] = [
  { name: 'San Francisco', coord: '48.9° N · 122.9° W', temp: 21, sky: 'linear-gradient(135deg,#f6a585,#e98a9b 45%,#7b6fb0)', bgImage: `${import.meta.env.BASE_URL}digital-wall/city_sf.png` },
  { name: 'Tokyo',         coord: '35.6° N · 139.6° E', temp: 27, sky: 'linear-gradient(135deg,#8ec5fc,#a18cd1 60%,#4b3f72)', bgImage: `${import.meta.env.BASE_URL}digital-wall/city_tokyo.png` },
  { name: 'Reykjavík',     coord: '64.1° N · 21.9° W',  temp: 4,  sky: 'linear-gradient(135deg,#a1c4fd,#7ad7d0 55%,#3a6073)', bgImage: `${import.meta.env.BASE_URL}digital-wall/city_reykjavik.png` },
  { name: 'Marrakech',     coord: '31.6° N · 8.0° W',   temp: 33, sky: 'linear-gradient(135deg,#f9d29d,#f6926b 50%,#8a4b53)', bgImage: `${import.meta.env.BASE_URL}digital-wall/city_marrakech.png` },
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
          {[0, 1, 2, 3].map((i) => {
            const path = ['city_sf.png', 'city_tokyo.png', 'city_reykjavik.png', 'city_marrakech.png'][i];
            return (
              <Tile key={`th${i}`} className={`tile thumb ${i === ci ? 'active' : ''}`} style={S(1, i + 1)} d={i}>
                <span className="ph" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}digital-wall/${path})` }} />
                <span className="bars"><i /><i /></span>
              </Tile>
            );
          })}

          {/* 天气主面板 */}
          <Tile className="tile feature" style={S(2, 1, 3, 2)} d={4}>
            <div className="sky" style={{ backgroundImage: `url(${city.bgImage})` }}>
              <div className="overlay" style={{ background: city.sky, mixBlendMode: 'overlay', opacity: 0.45 }} />
              <div className="darken" />
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

          {/* 人像 / 智能控制面板 */}
          <Tile className="tile portrait" style={S(5, 1, 2, 2)} d={5}>
            {ci === 0 ? (
              <span className="ph" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}digital-wall/portrait_sf.png)` }} />
            ) : ci === 1 ? (
              <div className="synth-avatar">
                <div className="grid-bg" />
                <div className="neon-triangle" />
                <div className="neon-sun" />
                <span className="avatar-label">NEO_TYO</span>
              </div>
            ) : ci === 2 ? (
              <div className="nordic-circle-art">
                <div className="watercolor-glow glow-1" />
                <div className="watercolor-glow glow-2" />
                <div className="zen-ring" />
                <span className="zen-label">SILENCE</span>
              </div>
            ) : (
              <div className="boho-collage">
                <div className="boho-shape arch" />
                <div className="boho-shape circle" />
                <div className="boho-shape line-y" />
                <span className="boho-label">TERRA</span>
              </div>
            )}
          </Tile>

          {/* 数值卡 */}
          <Tile className="tile stat cyan" style={S(2, 3)} d={6}>
            <em>160<sup>$</sup></em><span className="line" />
          </Tile>

          {/* 视频 / 太阳能能量卡 */}
          <Tile className="tile video" style={S(3, 3, 2, 2)} d={7}>
            {ci === 0 ? (
              <>
                <span className="ph" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}digital-wall/video_sf.png)` }} />
                <button className="play" aria-label="play"><i /></button>
              </>
            ) : ci === 1 ? (
              <div className="synth-cassette">
                <div className="cassette-body">
                  <div className="tape-wheel wheel-1" />
                  <div className="tape-wheel wheel-2" />
                </div>
                <button className="play-mini" aria-label="play"><i /></button>
                <span className="cassette-label">LO-FI_TAPE</span>
              </div>
            ) : ci === 2 ? (
              <div className="watercolor-mountain">
                <div className="mountain-shading" />
                <div className="nordic-moon" />
                <button className="play-glass" aria-label="play"><i /></button>
                <span className="mountain-label">PLAY_ZEN</span>
              </div>
            ) : (
              <div className="boho-sun-wave">
                <div className="sun-core" />
                <div className="sun-ring ring-1" />
                <div className="sun-ring ring-2" />
                <button className="play-terracotta" aria-label="play"><i /></button>
                <span className="sun-label">BOHO_PLAY</span>
              </div>
            )}
          </Tile>

          {/* 圆形设备 / 智能仪表 */}
          <Tile className="tile device" style={S(5, 3)} d={8}>
            <span className="dial"><i /></span>
          </Tile>

          {/* 数值卡 */}
          <Tile className="tile stat violet" style={S(6, 3, 1, 2)} d={9}>
            <em>189<sup>°</sup></em><span className="line" />
          </Tile>

          {/* 桥夜景 / 动态特效 */}
          <Tile className="tile bridge" style={S(2, 4)} d={10}>
            {ci === 0 ? (
              <span className="ph" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}digital-wall/bridge_sf.png)` }} />
            ) : ci === 1 ? (
              <div className="synth-highway">
                <div className="horizon" />
                <div className="grid-road" />
                <div className="laser-line left" />
                <div className="laser-line right" />
              </div>
            ) : ci === 2 ? (
              <div className="zen-compass">
                <div className="compass-outer" />
                <div className="compass-needle" />
                <div className="aurora-leak" />
              </div>
            ) : (
              <div className="boho-steps">
                <div className="step-block step-1" />
                <div className="step-block step-2" />
                <div className="step-block step-3" />
              </div>
            )}
          </Tile>

          {/* 头像组 / 呼吸灯 */}
          <Tile className="tile crew" style={S(5, 4)} d={11}>
            {ci === 3 ? (
              <div className="breath-container">
                <span className="breath-dot" />
                <span className="breath-label">BEACON_OK</span>
              </div>
            ) : (
              ['#e98a9b', '#8ec5fc', '#a3e635', '#f6926b'].map((c, i) => (
                <i key={i} style={{ background: c, ['--i' as string]: i }} />
              ))
            )}
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
const matrixFall = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;
const waveBounce = keyframes`
  0% { transform: scaleY(0.4); opacity: 0.5; }
  100% { transform: scaleY(1.4); opacity: 1; }
`;
const auroraMove = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(15px, 20px) scale(1.15); }
`;
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const breath = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); box-shadow: 0 0 16px #a3e635; }
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
  .tile .ph {
    position: absolute;
    inset: 0;
    display: block;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    transition: transform 0.6s var(--ease-out-soft), filter 0.6s var(--ease-out-soft);
  }
  .tile:hover .ph {
    transform: scale(1.06);
    filter: brightness(1.1);
  }
  .tile::before {
    content: ''; position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.65) 100%);
    pointer-events: none;
    transition: opacity 0.35s ease;
  }
  .tile:hover::before {
    background: linear-gradient(180deg, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.75) 100%);
  }

  .thumb .bars {
    position: absolute;
    left: 8px; bottom: 8px; right: 8px; z-index: 2;
    display: grid; gap: 4px;
    padding: 6px;
    background: rgba(10, 10, 15, 0.5);
    backdrop-filter: blur(6px);
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .thumb .bars i { height: 2px; border-radius: 1px; background: rgba(255,255,255,.75); }
  .thumb .bars i:last-child { width: 60%; background: rgba(255,255,255,.4); }

  /* 天气主面板 */
  .feature { background: #11131c; }
  .feature .sky { position: absolute; inset: 0; background-size: cover; background-position: center; }
  .feature .sky .overlay { position: absolute; inset: 0; pointer-events: none; }
  .feature .sky .darken { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7)); pointer-events: none; }
  .feature .sky .cloud {
    position: absolute; inset: -10% -20%;
    background: radial-gradient(40% 60% at 30% 40%, rgba(255,255,255,.55), transparent 70%),
                radial-gradient(50% 70% at 70% 55%, rgba(255,255,255,.4), transparent 72%);
    filter: blur(6px); animation: ${cloudDrift} 12s ease-in-out infinite alternate;
  }
  .feature::before { background: none; }
  .feature-head { position: absolute; top: 14px; left: 16px; z-index: 2; }
  .feature-head h3 { margin: 0; font-size: clamp(18px, 3vmin, 30px); font-weight: 700; animation: ${softIn} .5s var(--ease-out-soft) both; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
  .feature-head small { opacity: .8; font-size: 10px; letter-spacing: 1px; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
  .feature-foot { position: absolute; left: 16px; right: 16px; bottom: 14px; z-index: 2; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
  .feature-foot em { font-style: normal; font-weight: 800; font-size: clamp(26px, 5vmin, 48px); line-height: 1; font-variant-numeric: tabular-nums; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
  .feature-foot sup { font-size: .45em; vertical-align: super; }
  .feature .mini { display: flex; gap: 6px; }
  .mini-tile { width: clamp(34px, 6vmin, 56px); aspect-ratio: 16/11; border-radius: 6px; display: grid; place-items: center; font-size: 11px; font-weight: 700; color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,.12); }
  .mini-tile.night { background: linear-gradient(135deg,#3b2a52,#7a3b63 60%,#d98a6a); }
  .mini-tile.dev { background: #1a1f2e; }
  .mini-tile.dev i { width: 60%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #fff, #aab 60%, #555); }

  /* 人像 */
  .portrait .name {
    position: absolute;
    left: 12px;
    bottom: 12px;
    z-index: 2;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.5px;
    padding: 4px 10px;
    background: rgba(20, 22, 32, 0.65);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    text-shadow: none;
    transition: background-color 0.3s ease;
  }
  .portrait:hover .name {
    background: rgba(20, 22, 32, 0.85);
  }

  /* 数值卡 */
  .stat { display: grid; align-content: center; padding: 10px 12px; position: relative; overflow: hidden; }
  .stat em { font-style: normal; font-weight: 800; font-size: clamp(18px, 3.4vmin, 30px); color: #fff; z-index: 2; text-shadow: 0 1px 4px rgba(0,0,0,0.2); }
  .stat sup { font-size: .5em; vertical-align: super; opacity: .8; }
  .stat .line { height: 3px; width: 60%; border-radius: 2px; margin-top: 6px; z-index: 2; }
  .stat.cyan { background: linear-gradient(150deg,#1c83a1,#0f4c68); }
  .stat.cyan .line { background: rgba(255,255,255,.5); }
  .stat.violet { background: linear-gradient(150deg,#5e5ab8,#322e80); }
  .stat.violet .line { background: rgba(255,255,255,.5); }
  .stat::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 8px 8px;
    pointer-events: none;
    opacity: 0.3;
    z-index: 1;
  }

  /* 视频 */
  .video .play {
    position: absolute; inset: 0; margin: auto; width: 48px; height: 48px; z-index: 2;
    border: none; border-radius: 50%; cursor: pointer;
    background: rgba(255, 255, 255, 0.88); display: grid; place-items: center;
    box-shadow: var(--glow-md) rgba(255, 255, 255, 0.3);
    transition: transform 0.35s var(--ease-spring), background-color 0.3s ease, box-shadow 0.3s ease;
  }
  .tile:hover .play {
    transform: scale(1.15) rotate(5deg);
    background: #fff;
    box-shadow: var(--glow-lg) rgba(255,255,255,0.45);
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

  /* 缩略图高亮样式 */
  .thumb.active {
    border-color: var(--neon-cyan);
    box-shadow: 0 0 15px rgba(58, 215, 208, 0.4), inset 0 0 8px rgba(58, 215, 208, 0.2);
  }

  /* 矩阵代码雨卡片 */
  .matrix-container {
    position: absolute; inset: 0; background: #07090e; font-family: monospace; font-size: clamp(9px, 1.5vmin, 12px);
    color: #00ff66; display: flex; justify-content: space-around; overflow: hidden; opacity: 0.85;
    padding-top: 10px;
  }
  .matrix-col {
    writing-mode: vertical-rl; text-orientation: upright;
    animation: ${matrixFall} 5s linear infinite;
    letter-spacing: 2px;
    text-shadow: 0 0 8px rgba(0, 255, 102, 0.6);
  }
  .matrix-col:nth-child(1) { animation-duration: 3s; animation-delay: 0.2s; }
  .matrix-col:nth-child(2) { animation-duration: 4.5s; animation-delay: 1.2s; }
  .matrix-col:nth-child(3) { animation-duration: 3.5s; animation-delay: 0.5s; }
  .matrix-col:nth-child(4) { animation-duration: 5.5s; animation-delay: 0.8s; }
  .matrix-label {
    position: absolute; left: 12px; bottom: 12px; z-index: 2;
    font-size: 8px; font-weight: 700; color: #00ff66; letter-spacing: 1px;
    padding: 3px 8px; background: rgba(0, 0, 0, 0.8); border: 1px solid #00ff66;
    border-radius: 4px;
    box-shadow: 0 0 8px rgba(0,255,102,0.3);
  }

  /* 动态心电声纳波形 */
  .wave-container {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 6px;
    background: linear-gradient(135deg, #101622, #070a10);
  }
  .wave-bar {
    width: 4px; height: 35%; border-radius: 2px; background: var(--neon-cyan);
    animation: ${waveBounce} 1.2s ease-in-out infinite alternate;
    box-shadow: 0 0 8px var(--neon-cyan);
  }
  .wave-bar:nth-child(1) { animation-delay: 0.1s; }
  .wave-bar:nth-child(2) { animation-delay: 0.4s; }
  .wave-bar:nth-child(3) { animation-delay: 0.2s; }
  .wave-bar:nth-child(4) { animation-delay: 0.6s; }
  .wave-bar:nth-child(5) { animation-delay: 0.3s; }
  .wave-label {
    position: absolute; left: 12px; bottom: 12px; z-index: 2;
    font-size: 8px; font-weight: 700; color: var(--neon-cyan); letter-spacing: 1px;
  }

  /* 动态极光卡片 */
  .aurora-container {
    position: absolute; inset: 0; background: linear-gradient(135deg, #091a24, #050b11);
    overflow: hidden;
  }
  .aurora-glow {
    position: absolute; border-radius: 50%; filter: blur(25px); opacity: 0.4;
  }
  .aurora-glow.glow-1 {
    width: 140px; height: 140px; background: #3ad7d0; top: -30px; left: -20px;
    animation: ${auroraMove} 8s ease-in-out infinite alternate;
  }
  .aurora-glow.glow-2 {
    width: 110px; height: 110px; background: #a18cd1; bottom: -40px; right: -20px;
    animation: ${auroraMove} 11s ease-in-out infinite alternate-reverse;
  }
  .aurora-glow.glow-3 {
    width: 90px; height: 90px; background: #a1c4fd; top: 25%; left: 35%;
    animation: ${auroraMove} 9s ease-in-out infinite alternate;
  }
  .aurora-label {
    position: absolute; left: 12px; bottom: 12px; z-index: 2;
    font-size: 8px; font-weight: 700; color: #a1c4fd; letter-spacing: 1px;
  }

  /* 太阳能能量卡 */
  .energy-container {
    position: absolute; inset: 0; display: grid; place-items: center;
    background: linear-gradient(135deg, #1b1220, #0a060e);
  }
  .energy-ring {
    width: 44px; height: 44px; border-radius: 50%;
    border: 3px solid rgba(161, 140, 209, 0.15);
    border-top: 3px solid #a18cd1;
    animation: ${spin} 2s linear infinite;
    box-shadow: 0 0 10px rgba(161, 140, 209, 0.2);
  }
  .energy-text {
    position: absolute; font-size: 12px; font-weight: 800; color: #a18cd1;
    text-shadow: 0 0 6px rgba(161, 140, 209, 0.5);
  }
  .energy-label {
    position: absolute; left: 12px; bottom: 12px; z-index: 2;
    font-size: 8px; font-weight: 700; color: #a18cd1; letter-spacing: 1px;
  }

  /* 呼吸灯指示卡 */
  .breath-container {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #0f111a;
  }
  .breath-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #a3e635;
    box-shadow: 0 0 10px #a3e635;
    animation: ${breath} 2s ease-in-out infinite;
  }
  .breath-label {
    font-size: 9px; font-weight: 700; color: #a3e635; letter-spacing: 1px;
  }

  /* ============================ 极简 4 大主题 CSS 卡片样式 ============================ */
  
  /* 1) 蒸汽波头像 */
  .synth-avatar {
    position: absolute; inset: 0; background: #0b0712; display: grid; place-items: center; overflow: hidden;
  }
  .synth-avatar .grid-bg {
    position: absolute; inset: 0;
    background: linear-gradient(rgba(0, 255, 235, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 235, 0.08) 1px, transparent 1px);
    background-size: 10px 10px;
    transform: perspective(60px) rotateX(45deg);
    transform-origin: top;
    opacity: 0.6;
  }
  .synth-avatar .neon-triangle {
    width: 0; height: 0;
    border-left: 28px solid transparent;
    border-right: 28px solid transparent;
    border-bottom: 48px solid rgba(255, 0, 127, 0.25);
    position: absolute;
    z-index: 1;
    filter: drop-shadow(0 0 10px rgba(255, 0, 127, 0.6));
    border-bottom-color: rgba(255, 0, 127, 0.4);
    transform: rotate(180deg);
  }
  .synth-avatar .neon-sun {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(to bottom, #ff007f, #ffaa00);
    position: absolute;
    z-index: 0;
    box-shadow: 0 0 16px rgba(255, 0, 127, 0.6);
    transform: translateY(-8px);
  }
  .synth-avatar .avatar-label {
    position: absolute; left: 8px; bottom: 8px; z-index: 2;
    font-size: 8px; font-weight: 700; color: #00ffeb; letter-spacing: 1px;
    padding: 2px 6px; background: rgba(0,0,0,0.85); border: 1px solid #00ffeb;
    border-radius: 3px;
  }

  /* 2) 北欧禅意水墨 */
  .nordic-circle-art {
    position: absolute; inset: 0; background: #e3e6eb; display: grid; place-items: center; overflow: hidden;
  }
  .nordic-circle-art .watercolor-glow {
    position: absolute; border-radius: 50%; filter: blur(20px); opacity: 0.65;
  }
  .nordic-circle-art .watercolor-glow.glow-1 {
    width: 90px; height: 90px; background: #9bb1c4; left: 10px; top: 10px;
    animation: ${auroraMove} 10s ease-in-out infinite alternate;
  }
  .nordic-circle-art .watercolor-glow.glow-2 {
    width: 70px; height: 70px; background: #c5cbd3; right: 10px; bottom: 10px;
    animation: ${auroraMove} 8s ease-in-out infinite alternate-reverse;
  }
  .nordic-circle-art .zen-ring {
    width: 46px; height: 46px; border-radius: 50%;
    border: 1px solid rgba(48, 55, 66, 0.75);
    background: transparent;
    z-index: 1;
    position: relative;
    box-shadow: inset 0 0 8px rgba(0,0,0,0.05);
  }
  .nordic-circle-art .zen-label {
    position: absolute; left: 8px; bottom: 8px; z-index: 2;
    font-size: 8px; font-weight: 600; color: #434c5e; letter-spacing: 2px;
  }

  /* 3) 孟菲斯/波西米亚扁平拼贴 */
  .boho-collage {
    position: absolute; inset: 0; background: #e6dfd3; display: grid; place-items: center; overflow: hidden;
  }
  .boho-collage .boho-shape {
    position: absolute; transition: transform 0.3s ease;
  }
  .boho-collage .boho-shape.arch {
    width: 40px; height: 60px; border-radius: 20px 20px 0 0;
    background: #c97a63;
    bottom: 20px; left: 20px;
  }
  .boho-collage .boho-shape.circle {
    width: 32px; height: 32px; border-radius: 50%;
    background: #e6b36c;
    top: 25px; right: 25px;
  }
  .boho-collage .boho-shape.line-y {
    width: 3px; height: 50px;
    background: #8c917b;
    left: 45px; top: 15px;
  }
  .boho-collage .boho-label {
    position: absolute; right: 8px; bottom: 8px; z-index: 2;
    font-size: 8px; font-weight: 700; color: #c97a63; letter-spacing: 1px;
    padding: 2px 6px; background: rgba(230, 223, 211, 0.9); border: 1px solid #c97a63;
    border-radius: 3px;
  }

  /* 4) 蒸汽波磁带播放器 */
  .synth-cassette {
    position: absolute; inset: 0; background: #0a050f; display: grid; place-items: center; overflow: hidden;
  }
  .synth-cassette .cassette-body {
    width: 72px; height: 42px; border-radius: 6px;
    background: linear-gradient(135deg, #1f1133, #0f071a);
    border: 1px solid rgba(255, 0, 127, 0.4);
    position: relative; display: flex; align-items: center; justify-content: center; gap: 14px;
    box-shadow: 0 4px 15px rgba(255, 0, 127, 0.25);
  }
  .synth-cassette .tape-wheel {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px dashed #00ffeb;
    animation: ${spin} 6s linear infinite;
  }
  .synth-cassette .play-mini {
    position: absolute; right: 12px; bottom: 12px; width: 22px; height: 22px;
    border-radius: 50%; border: none; background: #00ffeb; display: grid; place-items: center; cursor: pointer;
  }
  .synth-cassette .play-mini i {
    width: 0; height: 0; margin-left: 2px;
    border-left: 6px solid #000; border-top: 4px solid transparent; border-bottom: 4px solid transparent;
  }
  .synth-cassette .cassette-label {
    position: absolute; left: 10px; top: 10px; font-size: 7px; font-weight: 700; color: #ff007f; letter-spacing: 0.5px;
  }

  /* 5) 北欧禅意水彩山峦 */
  .watercolor-mountain {
    position: absolute; inset: 0; background: #e3e6eb; display: grid; place-items: center; overflow: hidden;
  }
  .watercolor-mountain .mountain-shading {
    position: absolute; bottom: 0; width: 100%; height: 60%;
    background: linear-gradient(to top, #9bb1c4, transparent);
    clip-path: polygon(0% 100%, 30% 30%, 55% 75%, 75% 45%, 100% 100%);
    opacity: 0.8;
  }
  .watercolor-mountain .nordic-moon {
    width: 24px; height: 24px; border-radius: 50%; background: #fff;
    position: absolute; top: 18px; left: 28px;
    box-shadow: 0 0 10px rgba(255,255,255,0.5);
  }
  .watercolor-mountain .play-glass {
    position: absolute; right: 12px; bottom: 12px; width: 22px; height: 22px;
    border-radius: 50%; border: 1px solid rgba(48,55,66,0.25); background: rgba(255,255,255,0.7); display: grid; place-items: center; cursor: pointer;
    backdrop-filter: blur(4px);
  }
  .watercolor-mountain .play-glass i {
    width: 0; height: 0; margin-left: 2px;
    border-left: 6px solid #434c5e; border-top: 4px solid transparent; border-bottom: 4px solid transparent;
  }
  .watercolor-mountain .mountain-label {
    position: absolute; right: 12px; top: 12px; font-size: 7px; font-weight: 600; color: #434c5e; letter-spacing: 1px;
  }

  /* 6) 孟菲斯太阳波浪播放器 */
  .boho-sun-wave {
    position: absolute; inset: 0; background: #e6dfd3; display: grid; place-items: center; overflow: hidden;
  }
  .boho-sun-wave .sun-core {
    width: 28px; height: 28px; border-radius: 50%; background: #c97a63;
    position: absolute; z-index: 1;
  }
  .boho-sun-wave .sun-ring {
    position: absolute; border-radius: 50%; border: 1px dashed rgba(140, 145, 123, 0.4);
  }
  .boho-sun-wave .sun-ring.ring-1 {
    width: 44px; height: 44px; animation: ${spin} 15s linear infinite;
  }
  .boho-sun-wave .sun-ring.ring-2 {
    width: 58px; height: 58px; animation: ${spin} 20s linear infinite reverse;
  }
  .boho-sun-wave .play-terracotta {
    position: absolute; right: 12px; bottom: 12px; width: 22px; height: 22px;
    border-radius: 50%; border: none; background: #8c917b; display: grid; place-items: center; cursor: pointer;
  }
  .boho-sun-wave .play-terracotta i {
    width: 0; height: 0; margin-left: 2px;
    border-left: 6px solid #e6dfd3; border-top: 4px solid transparent; border-bottom: 4px solid transparent;
  }
  .boho-sun-wave .sun-label {
    position: absolute; left: 12px; top: 12px; font-size: 7px; font-weight: 700; color: #8c917b; letter-spacing: 0.5px;
  }

  /* 7) 蒸汽波公路 */
  .synth-highway {
    position: absolute; inset: 0; background: #05020a; overflow: hidden;
  }
  .synth-highway .horizon {
    position: absolute; top: 35%; left: 0; width: 100%; height: 1px;
    background: linear-gradient(90deg, transparent, #ff007f, transparent);
    box-shadow: 0 0 8px #ff007f;
  }
  .synth-highway .grid-road {
    position: absolute; bottom: 0; width: 100%; height: 65%;
    background: linear-gradient(rgba(255, 0, 127, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 0, 127, 0.15) 1px, transparent 1px);
    background-size: 12px 8px;
    transform: perspective(40px) rotateX(60deg);
    transform-origin: top;
    animation: highwayScroll 1s linear infinite;
  }
  .synth-highway .laser-line {
    position: absolute; bottom: 0; width: 2px; height: 65%;
    background: #00ffeb; box-shadow: 0 0 10px #00ffeb;
    transform-origin: top;
  }
  .synth-highway .laser-line.left {
    left: 20%; transform: rotate(-30deg);
  }
  .synth-highway .laser-line.right {
    right: 20%; transform: rotate(30deg);
  }

  /* 8) 北欧禅意指南针 */
  .zen-compass {
    position: absolute; inset: 0; background: #e3e6eb; display: grid; place-items: center; overflow: hidden;
  }
  .zen-compass .compass-outer {
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid rgba(67, 76, 94, 0.4);
    position: relative;
  }
  .zen-compass .compass-outer::before {
    content: ''; position: absolute; top: -4px; left: 50%; width: 1px; height: 4px; background: #bf616a;
  }
  .zen-compass .compass-needle {
    position: absolute; width: 2px; height: 24px; background: #434c5e;
    animation: ${spin} 8s ease-in-out infinite alternate;
  }
  .zen-compass .aurora-leak {
    position: absolute; width: 80px; height: 80px; border-radius: 50%;
    background: radial-gradient(circle, rgba(58, 215, 208, 0.25), transparent 70%);
    filter: blur(10px);
    pointer-events: none;
    animation: ${auroraMove} 6s ease-in-out infinite alternate;
  }

  /* 9) 孟菲斯阶梯 */
  .boho-steps {
    position: absolute; inset: 0; background: #e6dfd3; display: flex; align-items: flex-end; justify-content: center; gap: 4px; padding-bottom: 12px;
  }
  .boho-steps .step-block {
    width: 14px; background: #c97a63; transition: transform 0.3s ease;
  }
  .boho-steps .step-block.step-1 { height: 16px; background: #8c917b; }
  .boho-steps .step-block.step-2 { height: 32px; background: #c97a63; }
  .boho-steps .step-block.step-3 { height: 48px; background: #e6b36c; }
  .tile:hover .step-block {
    transform: scaleY(1.15);
    transform-origin: bottom;
  }

  @keyframes highwayScroll {
    0% { background-position-y: 0; }
    100% { background-position-y: 8px; }
  }

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
