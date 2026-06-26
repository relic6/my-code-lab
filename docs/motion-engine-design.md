# 前端代码化动效引擎 + 导出管线设计文档

> 版本 v1.0 · 2026-06-27
> 定位：**动效引擎 + 导出管线**（Code-as-Motion）
> 目标：用前端技术栈实现 AE（After Effects）级别的剪辑/合成动效——实时可预览、参数可控、逐帧确定性可导出为视频。
> 范围：本仓库（React + styled-components + GSAP）现有动效资产的复用、抽象与工程化。

---

## 0. 背景与设计哲学

当前仓库是一批「好看且可复用」的前端动效（火箭 loading、玻璃卡、HUD、3D 瓷砖墙等），实现方式以 **CSS 动画 / styled-components / GSAP** 为主，本质是「实时浏览器渲染」。

我们要解决的真正问题是：把这些「在浏览器里跑的动效」升级为「能像 AE 一样被剪辑、被组合、被精确导出成视频帧」的能力。

代码化动效相对传统剪辑软件的核心优势：

- **可控**：每个参数都是显式数值（位置、透明度、缓动曲线），可被代码、配置、AI 直接驱动，而非鼠标拖拽的不可复现操作。
- **稳定 / 确定性**：同一份配置 + 同一帧时间 → 永远渲染出同一画面（这是导出视频的前提）。
- **可定制 / 可批量**：模板化后可被数据驱动批量生成（千人千面的字幕、批量短视频）。
- **可版本化**：动效是文本（JSON/TS），可 diff、可 code review、可 Git 管理。

设计的第一性原则贯穿全文：**渲染必须是「时间的纯函数」**——`frame(t) = render(state, t)`，引擎内部不允许依赖 `Date.now()`、`requestAnimationFrame` 的真实墙钟时间或随机种子。这是实时预览与离线逐帧导出能共用同一套代码的根本保证。

---

## 1. 技术选型（推荐方案与理由）

需求关键词是「用前端技术达到 AE 的效果」。下面给出分层的最优选型，并说明放弃项的原因。

### 1.1 核心框架：Remotion 作为「时间轴 + 导出」底座，自研合成层在其上

**推荐：以 [Remotion](https://www.remotion.dev) 作为时间轴驱动与导出管线的底座，业务动效用 React 组件实现。**

理由：

- Remotion 把「React 组件 + 当前帧号」映射为「一帧画面」，再用 Headless Chromium 逐帧截图、用 FFmpeg 编码成视频。这与本仓库已有的 React/CSS/GSAP 栈**天然同构**，现有组件迁移成本最低。
- 它原生解决了导出管线里最难的三件事：**确定性时钟**（`useCurrentFrame()` 取代 rAF）、**并行逐帧渲染**、**音视频编码**。自研这套至少数月工作量。
- 它支持服务端渲染（`@remotion/renderer`）与 Lambda 分布式渲染，满足批量/规模化导出。

这意味着：现有组件无需推倒重写，只需把「时间来源」从 CSS animation / GSAP timeline **替换为帧号驱动**（见 §3、§6）。

> 备选对比：
> - **纯自研 Canvas/WebGL 引擎**（如基于 PixiJS + 自研时间轴）：渲染性能与 GPU 特效上限更高，但要自己实现时间轴、导出、编码，周期长。建议仅对「粒子/流体/大量元素」的高负载特效局部采用（见 §1.2）。
> - **Motion Canvas**：面向程序化演示动画，声明式时间轴优雅，但生态与「React 组件复用」割裂，难以直接吃掉本仓库资产。
> - **直接 CSS 动画 + 无头浏览器截图**：可行但需自己保证确定性时钟、自己拼 FFmpeg，等于重造 Remotion 的轮子。

### 1.2 渲染分层策略（混合渲染，按特效类型选型）

不存在「一种渲染技术通吃」。按特效特征分层，三层共存于同一帧合成：

| 层级 | 技术 | 适用动效 | 仓库现有对应 |
|---|---|---|---|
| DOM / CSS 层 | React + CSS transform/filter | 字幕、卡片、UI、玻璃拟态、布局类转场 | Glass / Glass Flip / Digital Wall |
| Canvas2D 层 | 自研轻量渲染器 / Konva | 文字逐字、形状描边、遮罩转场、笔刷 | Launching 的尾焰可迁移 |
| WebGL 层 | Three.js / PixiJS / 自定义 shader | 粒子、辉光、置换/溶解转场、3D、流体 | The Ark HUD、辉光体系 |

合成原则：**能用 CSS 表达的不要上 Canvas，能用 Canvas 的不要上 WebGL**——越往下确定性导出越复杂（GPU 浮点差异、字体渲染差异），但特效上限越高。

### 1.3 动效驱动库

- **GSAP**（仓库已用）：保留作为「关键帧插值 / 缓动 / 时间轴编排」的数学库，但**必须改为「按帧 seek」模式**——用 `gsap.timeline({paused:true})` + 每帧 `timeline.seek(t)`，禁用其自带 rAF tick。这样 GSAP 仍提供强大的缓动与 stagger，又满足确定性（详见 §6.2）。
- **自定义缓动**：沿用 `_shared/tokens.ts` 里的 `--ease-spring` / `--ease-out-soft`，统一抽象为可被引擎读取的缓动表。

### 1.4 编码 / 导出

- **FFmpeg**（Remotion 内置调用）：H.264/H.265/ProRes/WebM 输出；带 Alpha 通道导出用 ProRes 4444 或 VP9/WebM。
- **音频**：Remotion 的 `<Audio>` / `<Sequence>` 处理配乐与音效对齐。

---

## 2. 系统总体架构

```
┌──────────────────────────────────────────────────────────────┐
│                        编辑 / 配置层                            │
│   Timeline JSON（动效工程文件）· 模板参数 · 数据绑定            │
└───────────────┬──────────────────────────────────────────────┘
                │  纯数据（确定性的唯一真相）
                ▼
┌──────────────────────────────────────────────────────────────┐
│                      动效引擎 Core                              │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ 时钟 Clock │→ │ 时间轴 TL  │→ │ 关键帧求值器 │→ │ 合成器  │ │
│  │ frame/fps  │  │ track/clip │  │ interpolate │  │Compositor│ │
│  └────────────┘  └────────────┘  └─────────────┘  └─────────┘ │
│           ↑ 唯一时间来源 useCurrentFrame()                     │
└───────┬───────────────────────────────────────┬──────────────┘
        │ 实时路径                                │ 离线路径
        ▼                                         ▼
┌────────────────┐                    ┌──────────────────────────┐
│  预览 Preview   │                    │   导出管线 Render Pipeline │
│  浏览器实时渲染  │                    │  Headless Chromium 逐帧    │
│  播放/拖拽/调参  │                    │  → 帧序列 → FFmpeg 编码     │
└────────────────┘                    └──────────────────────────┘
```

关键点：**预览与导出共用同一份「引擎 Core + 组件」**，区别仅在时钟驱动方式（实时 rAF 推进 vs 离线逐帧 seek）。这是确定性原则带来的最大工程红利——所见即所得，预览长什么样导出就是什么样。

---

## 3. 时间模型与确定性时钟

### 3.1 帧而非毫秒

引擎内部时间统一用 **帧号（frame）** 表达，配合工程级 `fps`：

```ts
time_seconds = frame / fps
```

理由：视频是离散帧序列，用帧号能消除浮点累积误差，保证「第 N 帧」永远渲染同一画面。所有动效的输入时间来自单一函数：

```ts
const frame = useCurrentFrame();   // 预览与导出都从这里取，绝不读 Date.now()
```

### 3.2 确定性约束（硬性规则）

任何进入引擎的动效组件必须满足：

1. **禁止** `Date.now()` / `performance.now()` / `Math.random()`（随机需用可注入的带种子 PRNG，种子写入工程文件）。
2. **禁止** 直接用 CSS `animation` / `transition`（其时间走浏览器墙钟，导出时无法 seek）。改为「读 frame → 计算样式 → 写 inline style」。
3. **禁止**裸 `requestAnimationFrame` 驱动状态。需要物理/弹簧时，用「按帧步进的确定性积分器」（固定步长）。

这三条是「实时浏览器动效」迁移为「可导出动效」时**唯一真正需要改造的地方**，§6 给出现有组件的具体迁移手法。

---

## 4. 工程文件格式（Timeline JSON）

动效工程是一份纯数据文件，是编辑层与引擎之间的唯一契约。示例：

```jsonc
{
  "version": 1,
  "composition": { "width": 1920, "height": 1080, "fps": 30, "durationInFrames": 300 },
  "tracks": [
    {
      "id": "title",
      "type": "text",
      "clips": [
        {
          "id": "c1",
          "from": 0, "durationInFrames": 90,
          "effect": "kinetic-typography",      // 动效模板 id（见 §5）
          "props": { "text": "LAUNCHING", "color": "var(--neon-cyan)" },
          "animations": [
            {
              "property": "opacity",
              "keyframes": [
                { "frame": 0,  "value": 0 },
                { "frame": 15, "value": 1, "easing": "ease-out-soft" }
              ]
            },
            {
              "property": "translateY",
              "keyframes": [
                { "frame": 0,  "value": 40 },
                { "frame": 20, "value": 0, "easing": "ease-spring" }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "transition",
      "type": "effect",
      "clips": [
        { "id": "t1", "from": 85, "durationInFrames": 30,
          "effect": "glass-flip-wipe", "props": { "axis": "y" } }
      ]
    }
  ],
  "audio": [ { "src": "bgm.mp3", "from": 0, "volume": 0.8 } ]
}
```

特点：

- `from` / `durationInFrames` 定义片段在时间轴上的位置与长度（映射 Remotion `<Sequence>`）。
- `animations[].keyframes` 是属性级关键帧，`easing` 引用统一缓动表。
- `effect` 指向动效模板库（§5），`props` 是模板的参数化入口。
- 整份文件可被 AI / 数据批量生成，实现「一套模板 + N 份数据 = N 条视频」。

---

## 5. 动效模板库（资产复用核心）

把现有组件抽象为**参数化、帧驱动的动效模板**，是本仓库资产价值最大化的关键。模板分三类（对标 AE 的三类常用动效）：

### 5.1 转场 Transition（连接两个画面）

输入 `progress: 0→1`（由片段时间归一化得到），输出当前画面。

```ts
interface Transition {
  id: string;
  render(props: {
    progress: number;          // 0~1，已应用缓动
    outgoing: ReactNode;       // 前一个画面
    incoming: ReactNode;       // 后一个画面
    params: Record<string, unknown>;
  }): ReactNode;
}
```

仓库可直接孵化的转场：

- `glass-flip-wipe`：复用 **Glass Flip Card** 的 3D 翻转 + 流光边框，做卡式翻转转场。
- `digital-wall-shatter`：复用 **Digital Wall** 的瓷砖逐个入场，做马赛克碎裂/聚合转场。
- `shockwave-dissolve`：复用 **Launching** 的冲击波 + 溶解。

### 5.2 字幕 / 标题 Title（文字动效）

```ts
interface TitleEffect {
  id: string;
  render(props: { frame: number; durationInFrames: number;
                  text: string; params: Record<string, unknown> }): ReactNode;
}
```

- `kinetic-typography`：复用 **Launching** 的「逐字母点亮 + stagger 节奏」，抽象为可输入任意文案的逐字入场。
- `neon-title`：复用 `_shared/tokens.ts` 的霓虹色板与 `--glow-*` 辉光，做发光标题。

### 5.3 贴纸 / 装饰 Overlay（叠加元素）

- `hud-overlay`：复用 **The Ark** 的雷达扫描、数据读数、环形 HUD，做科技感叠层。
- `glow-particles`：把 Launching 的尾焰/星点粒子抽离为通用粒子叠层（建议迁到 Canvas/WebGL 层，见 §1.2）。

### 5.4 模板契约（Manifest）

每个模板附带一份 manifest，供编辑层自动生成参数面板、供校验、供文档化：

```ts
export const kineticTypographyManifest = {
  id: 'kinetic-typography',
  category: 'title',
  params: [
    { key: 'text',     type: 'string', default: 'TEXT' },
    { key: 'stagger',  type: 'number', default: 0.06, min: 0, max: 0.3, unit: 's' },
    { key: 'color',    type: 'color',  default: 'var(--neon-cyan)' },
  ],
  defaultDurationInFrames: 90,
} as const;
```

目录约定（延续仓库现有 `components/react/*` 风格）：

```
components/motion/
  transitions/glass-flip-wipe/{index.tsx, manifest.ts}
  titles/kinetic-typography/{index.tsx, manifest.ts}
  overlays/hud-overlay/{index.tsx, manifest.ts}
  _engine/{clock.ts, interpolate.ts, easings.ts, compositor.tsx}
```

---

## 6. 现有组件迁移指南（从「实时动效」到「帧驱动模板」）

这是落地最具体的一节。核心是把三种时间来源换成 `useCurrentFrame()`。

### 6.1 CSS animation → 帧插值

改造前（Launching 逐字母，靠 CSS animation-delay）：

```css
.loader-letter { animation: letterPulse 2s var(--letter-index) infinite; }
```

改造后（读帧 → 算样式）：

```tsx
const frame = useCurrentFrame();
const letterProgress = interpolate(
  frame,
  [index * 4, index * 4 + 12],   // 每个字母错峰 4 帧
  [0, 1],
  { easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp' }
);
return <span style={{ opacity: letterProgress, transform: `translateY(${(1-letterProgress)*20}px)` }} />;
```

### 6.2 GSAP timeline → seek 模式

保留 GSAP 的缓动/编排能力，但禁用其自动 tick：

```ts
const tl = useMemo(() => {
  const t = gsap.timeline({ paused: true });
  t.to('.ring', { rotation: 360, duration: 2, ease: 'power2.inOut' });
  return t;
}, []);

const frame = useCurrentFrame();
useEffect(() => { tl.seek(frame / fps); }, [frame, tl]);   // 关键：手动按帧 seek
```

### 6.3 弹簧物理 → 确定性 spring

Cool Joystick 这类带弹性的交互，导出时用 Remotion `spring()`（固定步长、与帧绑定，结果可复现），而非交互态的实时物理。

### 6.4 随机 → 带种子 PRNG

Launching 的尾焰随机抖动，改为 `random(seed + i)`（Remotion 提供确定性 `random()`），种子写入工程文件，保证每次导出同一画面。

### 6.5 迁移检查清单

迁移每个组件时逐项核对：无 `Date.now`/`Math.random` 裸用 · 无 CSS `animation`/`transition` 驱动关键动画 · 所有动画值来自 `frame` · `prefers-reduced-motion` 降级保留（预览体验）· manifest 参数齐全。

---

## 7. 导出管线

### 7.1 流程

```
工程 JSON
  → 引擎按 [0, durationInFrames) 逐帧渲染（Headless Chromium 截图）
  → 帧序列（PNG / 直接 pipe）
  → FFmpeg 编码（H.264 / ProRes 4444 带 Alpha / WebM）
  → 输出 mp4 / mov / webm + 混音
```

### 7.2 关键工程考量

- **并行渲染**：多 Chromium 实例并行截不同帧区间（Remotion `concurrency`），线性提升导出速度；规模化用 Remotion Lambda 分布式。
- **字体确定性**：导出环境须内嵌与预览一致的字体，避免 fallback 导致逐帧画面漂移。WebGL 文字尤需注意。
- **色彩管理**：统一 sRGB；HDR/广色域需在编码参数显式声明。
- **带透明导出**：叠层素材（字幕条、贴纸）用 ProRes 4444 / VP9 alpha，便于二次合成进真实剪辑软件。
- **质量分级**：预览用低分辨率/抽帧快速回放；导出用全分辨率全帧。两者同一份代码，仅 composition 参数不同。

### 7.3 CLI / API 形态

```bash
# 单条导出
motion render project.json --out out.mp4 --concurrency 8

# 批量数据驱动（模板 + 数据集 → N 条视频）
motion batch template.json data.csv --out-dir ./renders
```

---

## 8. 实施路线图

| 阶段 | 目标 | 交付 |
|---|---|---|
| P0 基座 | 引入 Remotion，跑通「一个 React 组件 → mp4」 | 时钟/导出验证 demo |
| P1 引擎 Core | 实现 Timeline JSON 解析、关键帧求值器、缓动表、合成器 | `_engine/*` |
| P2 资产迁移 | 按 §6 迁移 Launching / Glass Flip / The Ark / Digital Wall 为模板 | 4 个 manifest 化模板 |
| P3 导出管线 | 并行渲染、带 Alpha、音频对齐、CLI | `motion render` |
| P4 编辑层 | 由 manifest 自动生成参数面板的轻量时间轴 UI（可选） | 可视化编辑器 |
| P5 规模化 | 数据驱动批量、分布式渲染 | `motion batch` |

建议先以 **P0 + P1 + 单个模板（kinetic-typography）** 打通端到端「配置 → 预览 → 导出」最小闭环，再横向铺资产。

---

## 9. 风险与权衡

- **WebGL 逐帧确定性**：GPU 浮点/驱动差异可能导致跨机器画面微差。对策：导出固定在同一渲染环境（容器镜像），或对强确定性需求的特效退回 Canvas2D。
- **性能 vs 保真**：DOM/CSS 层在高元素数量下导出慢。对策：粒子类下沉到 WebGL，DOM 层控制节点数（延续仓库「≤40 节点或转 canvas」的现有约定）。
- **生态绑定**：选 Remotion 带来商业 License 考量（团队规模触发授权）。对策：引擎 Core（时间轴/关键帧/缓动）保持自研、与 Remotion 解耦，必要时可替换底座为自研 Headless 截图管线。
- **交互态丢失**：Joystick 等交互组件导出时只是动画回放，交互性不进视频——这是预期内的，编辑层保留交互预览即可。

---

## 10. 小结

最优路径是：**以 Remotion 为「确定性时钟 + 导出」底座，自研轻量引擎 Core 管理时间轴与关键帧，把仓库现有 React/CSS/GSAP 动效改造为帧驱动、参数化的动效模板库**。改造的唯一硬功夫是把「实时时间来源」换成 `useCurrentFrame()`（§6），其余视觉实现几乎零成本复用。如此即可用纯前端技术达到 AE 级动效，并获得代码化带来的可控、稳定、可批量定制三大优势。
