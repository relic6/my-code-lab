import type { ComponentType } from 'react';
import Launching from '../components/react/launching';
import Glass from '../components/react/glass';
import GlassSwitch from '../components/react/glass-switch';
import CoolJoystick from '../components/react/cool-joystick';

export type ReactExample = {
  id: string;
  title: string;
  category: 'react';
  description: string;
  tags: string[];
  sourcePath: string;
  Component: ComponentType;
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
];
