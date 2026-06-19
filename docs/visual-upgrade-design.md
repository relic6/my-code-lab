# My Code Lab 视觉炫酷化改造方案

> 版本 v1.0 · 2026-06-20
> 范围：四个 React 组件（Launching / Glass / Glass Flip / Cool Joystick）+ 预览壳整体视觉系统
> 方向：光效·辉光·霓虹 / 3D·景深·视差 / 粒子·物理动效 / 玻璃拟态·材质

---

## 0. 设计目标与总原则

当前组件实现质量已不错，但视觉上偏"静态精致"，缺少**会呼吸、会回应、有层次纵深**的高级感。本方案的核心是把每个组件从"好看的静帧"升级为"有生命的光学物件"，同时不破坏现有的 styled-components 架构与 `prefers-reduced-motion` 无障碍约定。

四条贯穿全局的升级主线：

1. **统一光学语言**——引入一套共享的霓虹色板与辉光令牌（design token），让四个组件像出自同一套"光学实验室"。
2. **指针驱动的视差与景深**——所有组件响应鼠标位置，产生轻微 3D 倾斜与多层视差，制造"屏幕有厚度"的错觉。
3. **粒子与物理质感**——把目前用 `box-shadow` 堆出的光，部分替换为真正可运动的粒子/光点层，并给交互加入弹簧物理。
4. **材质升级**——玻璃从"半透明白"升级为"带折射、带边缘色散、带噪声"的真实玻璃。

性能与降级原则：优先使用 `transform` / `opacity` / `filter` 等可合成属性；粒子层控制在每组件 ≤ 40 个 DOM 节点或改用单 canvas；所有新增动效都必须在 `@media (prefers-reduced-motion: reduce)` 下退化为静态。

---

## 1. 全局设计令牌（新增基础层）

建议在 `src/styles.css` 或新建 `components/react/_tokens.ts` 中定义共享变量，供各组件 `styled-components` 引用，避免色值散落。

```css
:root {
  /* —— 霓虹主色板 —— */
  --neon-violet: #8b5cf6;
  --neon-cyan:   #22d3ee;
  --neon-pink:   #ec4899;
  --neon-lime:   #a3e635;
  --neon-amber:  #f59e0b;

  /* —— 辉光强度令牌 —— */
  --glow-sm: 0 0 8px;
  --glow-md: 0 0 18px;
  --glow-lg: 0 0 36px;

  /* —— 玻璃材质令牌 —— */
  --glass-fill:   rgba(255, 255, 255, 0.06);
  --glass-stroke: rgba(255, 255, 255, 0.16);
  --glass-blur:   18px;
  --glass-noise:  url("data:image/svg+xml,..."); /* 见 §6 噪声纹理 */

  /* —— 缓动 —— */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
}
```

配套建议：引入一个共享的"霓虹流光描边"工具类（conic-gradient 旋转边框），四个组件都能复用，见 §6。

---

## 2. Launching Loader —— 从「旋转环」到「点火升空」

### 现状

火箭 loader 当前由：旋转的 inset box-shadow 环 + 7 个模糊星点 + 逐字点亮的 LAUNCHING 字母组成。问题在于：星点是固定位置闪烁、没有"飞行感"；中心只有光环没有"火箭实体"；整体偏平。

### 炫酷化方案

**a) 真实粒子尾焰（粒子 / 物理方向）**
把固定的 7 个 `.star` 升级为持续向下喷射、带速度衰减的火焰粒子流。用一个轻量 `requestAnimationFrame` 驱动的粒子池（12–20 个）或纯 CSS 多 `@keyframes` 错相位实现。粒子从中心底部生成，沿 Y 轴加速下坠、尺寸与亮度衰减、颜色从 `--neon-amber` → `--neon-pink` → 透明。

```css
@keyframes ember {
  0%   { transform: translate(var(--jx), 0)      scale(1);   opacity: 1;   filter: blur(0px); }
  70%  { opacity: .7; }
  100% { transform: translate(var(--jx), 120px)  scale(.2);  opacity: 0;   filter: blur(3px); }
}
.ember { background: radial-gradient(circle, #fff, var(--neon-amber) 40%, transparent 70%); }
```

**b) 中心辉光核 + 冲击波环（光效方向）**
保留旋转环，但在其下叠加一个周期性扩散并淡出的"冲击波"圆环（`scale` 1→2.4 + `opacity` 1→0），制造引擎脉冲点火节奏，与字母点亮节奏同步（2s 周期对齐）。

**c) 星空视差背景（3D / 视差方向）**
背景加入两层不同速度向下流动的星点（近层大而快、远层小而慢），形成"火箭在上升"的相对运动错觉。鼠标移动时背景反向微移，强化纵深。

**d) 字母升级**
LAUNCHING 字母点亮时，除现有 `text-shadow`，加一道由左向右扫过的高光，并在全部点亮的瞬间整体抖一下（subtle shake），呼应"发射"语义。

降级：reduce-motion 下关闭粒子与视差，仅保留静态火箭核与一次性字母淡入。

---

## 3. Glassmorphism Card —— 从「半透明白」到「真折射玻璃」

### 现状

三张倾斜玻璃卡，hover 时整组展平、单卡上浮 + 对角高光掠过。材质是 `rgba(255,255,255,0.05)` + `backdrop-filter: blur(16px)`，是"奶白玻璃"而非真实玻璃。

### 炫酷化方案

**a) 边缘色散 / 折射高光（玻璃材质方向）**
真实玻璃在边缘会有彩色色散。给每张卡的 `border` 用一层 conic 或 linear 的极淡彩虹渐变（青→紫→粉），叠加 `inset` 高光，让边缘"挂光"。卡面顶部加一道固定的镜面反射条（线性渐变白，约 18% 不透明），模拟环境光。

```css
.glass {
  background:
    linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.02)) padding-box,
    conic-gradient(from 180deg, var(--neon-cyan), var(--neon-violet), var(--neon-pink), var(--neon-cyan)) border-box;
  border: 1px solid transparent;
}
```

**b) 指针视差倾斜（3D 方向）**
hover 单卡时，依据鼠标在卡内的相对位置实时计算 `rotateX/rotateY`（±10°），并让卡面高光点（一个 radial-gradient 光斑）跟随指针移动，制造"玻璃在手中转动反光"的真实感。需用少量 React state 或 CSS 自定义属性 + pointermove。

**c) 背景气泡升级为流动光雾（光效方向）**
现有三颗模糊气泡可保留，但叠加一层缓慢漂移的 conic 光雾（`mix-blend-mode: screen`）和细微噪声，让背景不再是三个孤立色球，而是"流动的星云"。气泡随指针轻微视差位移。

**d) 图标点亮**
hover 时 SVG 不只是放大发光，让其辉光颜色取自所在卡的主色（Github=紫、Code=青、Earn=粉），并加一圈呼吸光晕。

降级：reduce-motion 下保留静态色散边框与展平交互，关闭视差与光雾漂移。

---

## 4. Glass Flip Card —— 从「翻转」到「全息卡牌」

### 现状

3D 翻转卡，正面美食信息 + 背面旋转彩流光边。翻转已是亮点，但正/背面材质偏普通，翻转过程缺少"重量感"和光照变化。

### 炫酷化方案

**a) 翻转中的动态高光（3D / 光效方向）**
卡片绕 Y 轴翻转时，叠加一道随角度移动的镜面反光带（用与翻转同步的伪元素），让翻转看起来像"卡牌在光下转动"，而非贴图翻面。可用 `--flip` 自定义属性驱动高光位置。

**b) 全息箔片质感（材质方向）**
正面叠加一层 holographic 箔片效果：一个随指针角度变化的 conic 彩虹渐变层（`mix-blend-mode: color-dodge`，低不透明），模拟收藏卡的镭射闪膜。指针移动时彩虹随之流动。

**c) 背面流光升级**
背面现有的单条旋转流光，升级为双层反向旋转 + 颜色取自全局霓虹板（青/紫/粉三色循环），中心 `Hovered!` 文字加霓虹描边与轻微脉冲。

**d) 悬浮与落定的物理感（物理方向）**
hover 进入时卡片不仅翻转，还轻微上浮 + 投影变深变散；离开时用弹簧缓动回落（`--ease-spring`），制造"被托起又放下"的重量反馈。底部投影随翻转角度实时变化，强化离地感。

**e) 边缘视差厚度**
给卡片四边加极薄的渐变"侧壁"，翻转中途短暂可见，制造卡牌有物理厚度的错觉。

降级：reduce-motion 下保留翻转（缩短时长、去弹性），关闭全息流动与浮动物理。

---

## 5. Cool Joystick —— 从「拟态白」到「赛博操控台」

### 现状

高质量浅色 neumorphic 摇杆，支持指针拖拽与键盘控制，方向箭头会变琥珀色高亮。整体偏"安静的工业设计"，与前三个深色霓虹组件气质不统一。

### 炫酷化方案（提供两套，建议 b 作为"炫酷版"，a 作为保守增强）

**a) 保守增强（保持浅色拟态）**
- 摇杆推动时，对应方向的凹槽内壁亮起一道琥珀色辉光（内发光），力度随位移量增强。
- 摇杆头加入指针视差高光：高光点随真实推动方向偏移，强化"球面反光"。
- 回中时用弹簧物理（轻微过冲回弹），而非线性归位。

**b) 赛博霓虹版（统一深色气质，推荐）**
把整个底座切换为深色磨砂面板，方向箭头与刻度改为霓虹发光描边，与 Glass/Launching 形成统一"光学实验室"语言：

- **HUD 方向环**：摇杆外圈叠加一圈分段刻度环，推动方向的扇区点亮为 `--neon-cyan`，并显示一个跟随角度的辉光指示弧（光效 + 物理）。
- **拖尾余晖**：摇杆头快速移动时留下短暂运动残影（motion trail），位移越快越长（物理方向）。
- **实时数据读出**：把 `caption` 升级为一个霓虹 HUD，实时显示方向与归一化位移量（如 `→ 0.87`），呼应"操控台"语义。
- **接触涟漪**：pointerdown 瞬间在摇杆头中心扩散一圈涟漪光环（光效）。
- **背景网格视差**：面板背景加入随摇杆位移轻微视差的霓虹网格，强化操控反馈。

降级：reduce-motion 下关闭残影/涟漪/弹簧过冲，仅保留方向高亮与即时位移。

---

## 6. 可复用的共享效果模块（建议抽取）

为避免四个组件各写一套，建议沉淀以下复用件：

1. **`NeonBorder`（霓虹流光描边）**——conic-gradient 旋转边框，参数化颜色与转速。Glass / Glass Flip / Joystick HUD 共用。
2. **`useParallaxTilt(ref)` hook**——封装 pointermove → `rotateX/rotateY` + 光斑位置的逻辑，Glass、Glass Flip、Joystick 复用，集中处理节流与 reduce-motion 判定。
3. **`useSpring(value)` 物理 hook**——基于 rAF 的轻量弹簧，给摇杆回中、卡片浮落提供统一手感（无需引第三方库）。
4. **噪声纹理 token**——一段内联 SVG `feTurbulence` 的 base64，作为 `--glass-noise`，给所有玻璃面叠加细颗粒，消除"塑料感"。
5. **粒子层基类**——Launching 火焰、Joystick 涟漪可共用一个轻量粒子渲染原语（CSS 变量喷射或单 canvas）。

```ts
// useParallaxTilt 草图
export function useParallaxTilt(max = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width  - 0.5;
    const py = (e.clientY - r.top)  / r.height - 0.5;
    el.style.setProperty('--rx', `${-py * max}deg`);
    el.style.setProperty('--ry', `${ px * max}deg`);
    el.style.setProperty('--mx', `${px * 100 + 50}%`);
    el.style.setProperty('--my', `${py * 100 + 50}%`);
  };
  return { ref, onMove };
}
```

---

## 7. 预览壳（整体视觉系统）升级

当前壳是浅色网格 + 侧边目录，与深色霓虹组件对比割裂。建议：

- **深色玻璃壳**：整体切换为深色背景 + 顶部缓慢流动的极光渐变（aurora），侧栏改为毛玻璃面板，让组件预览区像"展柜射灯下的展品"。
- **预览台聚光**：预览区中央加一束柔和顶光与地面接触阴影，组件像被放在展台上。
- **目录项霓虹态**：选中项用 `NeonBorder` 高亮，hover 有光扫过；分类 pill 用对应霓虹色。
- **切换转场**：组件切换时加 120ms 的淡入 + 轻微上浮，避免硬切。
- **主题开关**：提供"浅色/深色"切换，深色为默认炫酷态，浅色保留给 Joystick 保守版展示。

---

## 8. 落地路线图（建议分期）

| 阶段 | 内容 | 产出 |
|------|------|------|
| P0 基础层 | 设计令牌、`NeonBorder`、`useParallaxTilt`、`useSpring`、噪声纹理 | 共享模块就绪 |
| P1 玻璃双卡 | Glass + Glass Flip 的折射边框 / 视差倾斜 / 全息箔片 | 两组件升级 |
| P2 Launching | 粒子尾焰 + 冲击波 + 星空视差 | loader 升级 |
| P3 Joystick | 赛博霓虹版 HUD + 残影 + 弹簧回中 | 摇杆升级 |
| P4 壳与统一 | 深色玻璃预览壳 + 主题开关 + 转场 | 整体视觉系统统一 |
| P5 校验 | 性能（合成层 / FPS）、reduce-motion 降级、移动端触控回归 | 验收 |

---

## 9. 验收清单

- [ ] 四个组件与预览壳共用同一套霓虹令牌，气质统一。
- [ ] 每个组件至少覆盖：光效、3D/视差、粒子/物理、玻璃材质中的 ≥2 个方向。
- [ ] 所有新增动效在 `prefers-reduced-motion: reduce` 下有静态降级。
- [ ] 动画主要走 transform/opacity/filter，桌面端稳定 60fps。
- [ ] 触摸端（摇杆拖拽、卡片 hover 的 tap 等价）行为正确。
- [ ] 无新增重型第三方依赖（弹簧/粒子均自研轻量实现）。

---

*本文档为视觉改造方向设计，不含完整可运行代码；代码片段为实现示意。落地时以 P0 共享层先行，再逐组件迭代。*
