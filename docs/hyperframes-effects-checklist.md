# 基于 HyperFrames 的动效实现清单

> 版本 v1.0 · 2026-06-27
> 底座：**HyperFrames**（HeyGen，Apache 2.0）—— HTML + `data-*` 时间轴 + 可 seek 动画（GSAP/CSS/Three.js）→ 确定性 MP4
> 目标：在 HyperFrames 上复用并扩展本仓库现有动效资产，沉淀一套「酷炫视频效果」模板库。
> 范围：本仓库 `components/react/*` 与 `components/html/*` 现有 8 个动效 + 共享层 `_shared/`。

---

## 0. 前置约定（HyperFrames 适配规则）

每个动效模板都是一个**自包含 HTML 片段/文件**，遵守 HyperFrames 契约：

- 元素出场用 `data-start` / `data-duration` / `data-track-index` 声明时间轴位置。
- 动画必须**可 seek**：CSS 动画改为「按帧计算 inline style」，GSAP 用 `gsap.timeline({paused:true})` + 引擎按帧 `seek()`，Three.js 用帧驱动 update。
- **禁止** `Date.now()` / `Math.random()` 裸用（随机改带种子 PRNG，种子写进模板），保证逐帧确定性。
- 复用本仓库 `_shared/tokens.ts` 的霓虹色板与辉光令牌，统一改写为 HTML 内联 `<style>` 的 CSS 变量。

> 迁移工作量分级：🟢 易（CSS/属性微调）｜🟡 中（GSAP 改 seek / 拆参数）｜🔴 难（Three.js / 粒子 / 物理确定性）

---

## 1. 基础设施清单（P0 · 必须先做）

| # | 任务 | 说明 | 难度 |
|---|---|---|---|
| F1 | 引入 HyperFrames | clone 官方仓库，跑通 CLI demo，确认确定性导出与 FFmpeg 编码 | 🟢 |
| F2 | 建立模板目录 | 新建 `components/motion/{transitions,titles,overlays,backgrounds,particles}/`，每模板含 `index.html` + `manifest.json` | 🟢 |
| F3 | Token 移植 | 把 `_shared/tokens.ts`（霓虹/辉光/玻璃/缓动）转成可内联的 `tokens.css`，所有模板 `@import` 复用 | 🟢 |
| F4 | GSAP seek 适配器 | 封装 `createSeekableTimeline()`：`paused:true` + 暴露 `seek(frame/fps)`，作为所有 GSAP 模板的标准接入点 | 🟡 |
| F5 | 确定性随机工具 | `seededRandom(seed)` 替换现有 `Math.sin/Math.random` 抖动（Launching 尾焰、星点） | 🟡 |
| F6 | manifest schema | 定义参数 schema（key/type/default/min/max/unit），供 AI 生成参数面板与校验 | 🟢 |
| F7 | 端到端验证 | 用 1 个模板跑通「HTML → MP4」并做逐帧 diff 回归测试 | 🟡 |

---

## 2. 动效模板清单（按类别）

### 2.1 标题 / 字幕 Titles

| ID | 来源资产 | 效果 | 关键参数 | 优先级 | 难度 |
|---|---|---|---|---|---|
| `kinetic-typography` | **Launching**（逐字母点亮 stagger） | 逐字入场、错峰点亮的动态字幕 | text, stagger, color, glow | P0 | 🟡 |
| `neon-title` | `_shared` 霓虹色板 + `--glow-*` | 霓虹发光大标题、描边呼吸 | text, neonColor, glowIntensity, flicker | P0 | 🟢 |
| `glass-caption-bar` | **Glass** 毛玻璃卡 | 底部毛玻璃字幕条、流光高光掠过 | text, blur, accentColor | P1 | 🟢 |
| `typewriter-cursor` | 新增（基于 token） | 打字机逐字 + 光标闪烁（确定性） | text, cps, cursorColor | P1 | 🟢 |
| `split-reveal` | 新增 | 文字上下/左右遮罩拆分揭示 | text, axis, easing | P2 | 🟢 |

### 2.2 转场 Transitions

| ID | 来源资产 | 效果 | 关键参数 | 优先级 | 难度 |
|---|---|---|---|---|---|
| `glass-flip-wipe` | **Glass Flip Card**（3D 翻转+流光边框） | 卡式 3D 翻转转场连接两画面 | axis, perspective, edgeGlow | P0 | 🟡 |
| `digital-wall-shatter` | **Digital Wall**（瓷砖逐个入场） | 马赛克瓷砖碎裂 / 聚合转场 | gridX, gridY, stagger, direction | P0 | 🟡 |
| `shockwave-dissolve` | **Launching**（冲击波） | 冲击波扩散 + 溶解切换 | center, waveColor, softness | P1 | 🟡 |
| `parallax-tilt-push` | `_shared/useParallaxTilt` | 视差倾斜推拉转场 | tiltMax, depth | P1 | 🟡 |
| `ripple-mask` | **Animation Delay**（同心 ripple） | 同心圆遮罩扩散转场 | center, rings, ringDelay | P2 | 🟢 |

### 2.3 叠层 / HUD Overlays

| ID | 来源资产 | 效果 | 关键参数 | 优先级 | 难度 |
|---|---|---|---|---|---|
| `hud-overlay` | **The Ark**（雷达扫描/环形 HUD/数据读数） | 科技感 HUD 叠层，环、扫描、读数联动 | scanSpeed, readouts, accentColor | P0 | 🔴 |
| `radar-sweep` | The Ark（雷达扫描局部） | 单独可复用的雷达扫描贴纸 | radius, sweepColor, blips | P1 | 🟡 |
| `joystick-control` | **Cool Joystick / Cyber** | 拟态手柄控件叠层（演示/录屏用） | size, theme | P2 | 🟡 |
| `data-readout-ticker` | The Ark（读数） | 滚动数据/数值跳动叠层 | values, font, color | P2 | 🟢 |

### 2.4 背景 Backgrounds

| ID | 来源资产 | 效果 | 关键参数 | 优先级 | 难度 |
|---|---|---|---|---|---|
| `aurora-gradient` | **Glass** 背景霓虹流光气泡 | 流动极光渐变背景 | colors, speed, blur | P0 | 🟢 |
| `starfield-parallax` | **Launching**（远近星点视差） | 多层星空视差滚动背景 | layers, density, speed | P1 | 🟡 |
| `grid-perspective` | **Digital Wall**（3D 透视网格） | 赛博透视网格地面 | gridColor, vanishY, scrollSpeed | P1 | 🟡 |
| `noise-vignette` | `_shared` NOISE_DATA_URI | 颗粒噪声 + 暗角质感叠加 | grain, vignette | P2 | 🟢 |

### 2.5 粒子 / 物理 Particles（建议下沉到 Canvas/WebGL）

| ID | 来源资产 | 效果 | 关键参数 | 优先级 | 难度 |
|---|---|---|---|---|---|
| `glow-embers` | **Launching** 尾焰 | 上升发光余烬粒子（确定性 PRNG） | count, color, speed, spread | P1 | 🔴 |
| `spark-burst` | Launching 火花 | 爆发式火花迸射（事件点缀） | center, count, life | P2 | 🔴 |
| `floating-bokeh` | Glass 气泡 | 漂浮虚焦光斑层 | count, blur, drift | P2 | 🟡 |

---

## 3. 「酷炫保障」叠加层（让任何模板上一个台阶）

这些是可叠加在上述模板之上的通用增强，是「酷炫感」的来源，建议做成可复用 mixin：

1. **辉光 / Bloom**：复用 `--glow-sm/md/lg`，关键元素加 `filter: drop-shadow` 多层辉光；高保真场景用 Three.js `UnrealBloomPass`。
2. **色散 / 边缘霓虹**：玻璃/卡片边缘加 RGB 错位描边（复用 `NeonBorder.ts`）。
3. **运动模糊感**：转场关键帧叠加方向性 `blur` + 拉伸，模拟速度感。
4. **景深视差**：复用 `useParallaxTilt` 思路，多层元素按深度做不同位移。
5. **节奏与缓动**：统一用 `--ease-spring` / `--ease-out-soft`，关键动作加「超调回弹」让动效有弹性。
6. **噪声质感**：全片叠 `noise-vignette`，消除数字塑料感。
7. **音画同步（可选）**：HyperFrames 支持音频，关键帧对齐节拍点。

---

## 4. AI 编排约定（让 Agent 稳定产出动效）

- 每个模板配 `manifest.json`（参数 schema + 默认时长 + 类别 + 示例），AI 据此填参而非乱写。
- 约定一份「动效拼装 DSL/工程 JSON」：tracks → clips → effect id + props + 时间轴，AI 只产出数据，引擎负责渲染（确定性、可回归）。
- 提供 few-shot 示例：给 AI 1~2 个完整模板 HTML 作范例，约束它新增动效时遵守 seek/确定性规则。

---

## 5. 实施排期建议

| 阶段 | 内容 | 产出 |
|---|---|---|
| 第 1 周 | F1–F7 基础设施 + 1 个标题模板端到端 | 跑通 HTML→MP4 闭环 |
| 第 2 周 | P0 模板（kinetic-typography / neon-title / glass-flip-wipe / digital-wall-shatter / hud-overlay / aurora-gradient） | 6 个核心模板 |
| 第 3 周 | P1 模板 + 酷炫增强 mixin | 转场/字幕/背景补齐 |
| 第 4 周 | P2 + 粒子层（Canvas/WebGL）+ AI 编排规范 | 完整模板库 + Agent 接入 |

> 落地顺序原则：**先打通确定性导出闭环（F1–F7 + 1 模板），再横向铺资产**。P0 六个模板即可组出一条完整酷炫短视频（背景 + 标题 + 转场 + HUD）。

---

## 6. 现有资产 → 模板映射速查

| 现有组件 | 可孵化的模板 |
|---|---|
| Launching | kinetic-typography · shockwave-dissolve · starfield-parallax · glow-embers · spark-burst |
| Glass | glass-caption-bar · aurora-gradient · floating-bokeh |
| Glass Flip | glass-flip-wipe |
| Cool Joystick / Cyber | joystick-control |
| Animation Delay | ripple-mask |
| The Ark | hud-overlay · radar-sweep · data-readout-ticker |
| Digital Wall | digital-wall-shatter · grid-perspective |
| _shared (tokens/NeonBorder/useParallaxTilt) | neon-title · noise-vignette · parallax-tilt-push · 所有酷炫 mixin |

---

## 来源（Sources）

- [HyperFrames — GitHub](https://github.com/heygen-com/hyperframes)
- [HyperFrames — HeyGen 官方站](https://hyperframes.heygen.com/)
- [Video as Code: Deep Dive into Hyperframes](https://blog.nidhin.dev/video-as-code-a-deep-dive-into-heygen-s-hyperframes)
