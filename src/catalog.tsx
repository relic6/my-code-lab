import type { ComponentType } from 'react';
import Launching from '../components/react/launching';
import Glass from '../components/react/glass';
import GlassSwitch from '../components/react/glass-switch';
import CoolJoystick from '../components/react/cool-joystick';
import AnimationDelay from '../components/react/animation-delay';
import TheArk from '../components/react/the-ark';
import DigitalWall from '../components/react/digital-wall';

export type ReactExample = {
  id: string;
  title: string;
  category: 'react';
  description: string;
  tags: string[];
  sourcePath: string;
  Component: ComponentType;
  /** 若设置，Lab 会显示「全屏」链接，跳转到该独立路由 */
  fullscreenPath?: string;
};

export type HtmlExample = {
  id: string;
  title: string;
  category: 'html';
  description: string;
  tags: string[];
  sourcePath: string;
  previewUrl: string;
};

export type Example = ReactExample | HtmlExample;

/**
 * HyperFrames 动效模板（HTML 合成）演示。
 * 预览通过 iframe 加载 index.html?preview=1：
 * _engine/hf-preview.js 仅在带 ?preview 时循环播放并自适应缩放，渲染导出时不受影响。
 */
function motion(
  id: string,
  title: string,
  dir: string,
  description: string,
  tags: string[],
): HtmlExample {
  const base = `components/motion/${dir}/${id}`;
  return {
    id: `motion-${id}`,
    title,
    category: 'html',
    description,
    tags: ['hyperframes', ...tags],
    sourcePath: `${base}/index.html`,
    previewUrl: `${import.meta.env.BASE_URL}${base}/index.html?preview=1`,
  };
}

const motionExamples: HtmlExample[] = [
  motion('intro-demo', '★ Intro Demo（合成示例）', 'examples',
    '组合示例：极光背景 + 逐字标题，演示多个模块如何拼成一条完整片头。', ['demo', 'composite']),
  // —— Titles 标题字幕 ——
  motion('kinetic-typography', 'Kinetic Typography', 'titles',
    '逐字母错峰点亮的动态标题，含点火冲击波与确定性上升尾焰。源：Launching。', ['title', 'text']),
  motion('neon-title', 'Neon Title', 'titles',
    '霓虹灯启辉式大标题：通电闪烁点亮 + 呼吸辉光 + 副标题字距展开。源：_shared 令牌。', ['title', 'neon']),
  motion('glass-caption-bar', 'Glass Caption Bar', 'titles',
    '底部毛玻璃字幕条，入场上滑 + 对角高光掠过。源：Glass。', ['title', 'glass', 'lower-third']),
  motion('typewriter-cursor', 'Typewriter Cursor', 'titles',
    '终端打字机逐字显现 + 发光光标确定性闪烁。', ['title', 'typewriter']),
  motion('split-reveal', 'Split Reveal', 'titles',
    '色块扫过遮罩揭示文字，支持横/纵轴。', ['title', 'mask']),
  // —— Transitions 转场 ——
  motion('glass-flip-wipe', 'Glass Flip Wipe', 'transitions',
    '毛玻璃卡片 3D 翻转转场，含流光边框与高光掠过。源：Glass Flip。', ['transition', '3d']),
  motion('digital-wall-shatter', 'Digital Wall Shatter', 'transitions',
    '3D 瓷砖逐个翻飞淡出的马赛克碎裂转场。源：Digital Wall。', ['transition', 'shatter']),
  motion('shockwave-dissolve', 'Shockwave Dissolve', 'transitions',
    '中心双层冲击波扩散 + 模糊溶解切换。源：Launching。', ['transition', 'dissolve']),
  motion('parallax-tilt-push', 'Parallax Tilt Push', 'transitions',
    '前后画面以 3D 倾斜推拉错位交替，营造景深穿越。源：useParallaxTilt。', ['transition', 'parallax']),
  motion('ripple-mask', 'Ripple Mask', 'transitions',
    '同心圆涟漪扩散 + 圆形遮罩揭示。源：Animation Delay。', ['transition', 'ripple']),
  // —— Overlays 叠层 / HUD ——
  motion('hud-overlay', 'HUD Overlay', 'overlays',
    '科技感 HUD：同心环、雷达扫描、角标与确定性数据读数联动。源：The Ark。', ['overlay', 'hud', 'sci-fi']),
  motion('radar-sweep', 'Radar Sweep', 'overlays',
    '可复用雷达扫描贴纸，扫描线旋转并点亮目标光点。源：The Ark。', ['overlay', 'radar']),
  motion('data-readout-ticker', 'Data Readout Ticker', 'overlays',
    '数值跳动数据面板，逐行入场并确定性递增。源：The Ark。', ['overlay', 'data']),
  motion('joystick-control', 'Joystick Control', 'overlays',
    '拟态摇杆控件叠层，演示方向推拉与弹性回中。源：Cool Joystick。', ['overlay', 'control']),
  // —— Backgrounds 背景 ——
  motion('aurora-gradient', 'Aurora Gradient', 'backgrounds',
    '多色霓虹光斑缓慢漂移的极光渐变背景。源：Glass。', ['background', 'gradient']),
  motion('starfield-parallax', 'Starfield Parallax', 'backgrounds',
    '远/中/近三层星点不同速度滚动的视差星空。源：Launching。', ['background', 'parallax']),
  motion('grid-perspective', 'Grid Perspective', 'backgrounds',
    '合成波风格赛博透视网格地面 + 落日，网格无缝滚动。源：Digital Wall。', ['background', 'synthwave']),
  motion('noise-vignette', 'Noise Vignette', 'backgrounds',
    '可叠加的胶片颗粒噪声 + 暗角质感层。源：_shared。', ['background', 'grain']),
  // —— Particles 粒子 ——
  motion('glow-embers', 'Glow Embers', 'particles',
    '确定性上升发光余烬粒子层。源：Launching。', ['particles', 'embers']),
  motion('spark-burst', 'Spark Burst', 'particles',
    '中心闪光 + 放射状火花迸射，做强调点缀。源：Launching。', ['particles', 'burst']),
  motion('floating-bokeh', 'Floating Bokeh', 'particles',
    '多彩虚焦光斑缓慢漂移层，增加梦幻景深。源：Glass。', ['particles', 'bokeh']),
];

export const examples: Example[] = [
  {
    id: 'launching',
    title: 'Launching Loader',
    category: 'react',
    description: '火箭发射 loading 动效，包含星点、轨道、火焰、火花和字母点亮节奏。',
    tags: ['loader', 'animation', 'styled-components'],
    sourcePath: 'components/react/launching/Launching.tsx',
    Component: Launching,
  },
  {
    id: 'glass',
    title: 'Glassmorphism Card',
    category: 'react',
    description: '高质感毛玻璃特效卡片，包含背景霓虹流光气泡与悬浮平展、对角高光掠过交互。',
    tags: ['card', 'glassmorphism', 'styled-components', 'animation'],
    sourcePath: 'components/react/glass/Glass.tsx',
    Component: Glass,
  },
  {
    id: 'glass-switch',
    title: 'Glass Flip Card',
    category: 'react',
    description: '3D 玻璃翻转卡片，包含彩色流光边框、毛玻璃卡面与弹性景深翻转交互。',
    tags: ['card', 'flip', 'glassmorphism', 'styled-components', '3d'],
    sourcePath: 'components/react/glass-switch/glass-switch.tsx',
    Component: GlassSwitch,
  },
  {
    id: 'cool-joystick',
    title: 'Cool Joystick',
    category: 'react',
    description: '高拟真内凹外凸拟态手柄摇杆组件，支持鼠标/触摸指针拖动和键盘方向键弹性控制。',
    tags: ['joystick', 'styled-components', 'interaction', 'animation'],
    sourcePath: 'components/react/cool-joystick/CoolJoystick.tsx',
    Component: CoolJoystick,
  },
  {
    id: 'animation-delay',
    title: 'Animation Delay',
    category: 'react',
    description: '简洁的同心圆 ripple loader，通过逐层 animation-delay 做出错峰扩散节奏。',
    tags: ['loader', 'animation-delay', 'ripple', 'styled-components'],
    sourcePath: 'components/react/animation-delay/animation-delay.tsx',
    Component: AnimationDelay,
  },
  {
    id: 'the-ark',
    title: 'The Ark',
    category: 'react',
    description: '受 Dribbble「Board Arca」启发的未来感登船 HUD：纯 React/CSS 动效，自动循环切换 SCAN/ALIGN/BOARD/LAUNCH 四个场景，飞船环、雷达扫描、数据读数全部联动，像 AE 动画。点「全屏」看完整效果。',
    tags: ['hud', 'sci-fi', 'css-animation', 'motion', 'futuristic'],
    sourcePath: 'components/react/the-ark/TheArk.tsx',
    Component: TheArk,
    fullscreenPath: '/ark',
  },
  {
    id: 'digital-wall',
    title: 'Digital Wall',
    category: 'react',
    description: '受 Dribbble「Digital Walls」(Cosmin Capitanu) 启发的 3D 透视玻璃瓷砖墙：鼠标视差倾斜整面墙，瓷砖逐个入场并在悬浮时沿 Z 轴抬起发光，天气主面板自动轮播城市。纯 React/CSS，自包含无外部图片。',
    tags: ['bento', '3d', 'glassmorphism', 'parallax', 'dashboard'],
    sourcePath: 'components/react/digital-wall/DigitalWall.tsx',
    Component: DigitalWall,
  },
  ...motionExamples,
];
