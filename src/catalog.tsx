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
];
