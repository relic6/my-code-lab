import type { ComponentType } from 'react';
import Launching from '../components/react/launching';
import Glass from '../components/react/glass';

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
    id: 'cool-joystick',
    title: 'Cool Joystick',
    category: 'html',
    description: '纯 HTML/CSS 拟态摇杆效果，适合作为 CSS 质感和交互细节参考。',
    tags: ['html', 'css', 'interaction'],
    sourcePath: 'components/html/cool-joystick/index.html',
    previewUrl: '/components/html/cool-joystick/index.html',
  },
];
