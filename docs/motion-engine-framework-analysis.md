# 前端动效引擎：需求分析 + 现成框架调研报告

> 版本 v1.0 · 2026-06-27
> 主题：用前端代码实现「AI 可控、确定性」的视频/动效制作，对比是自研还是采用现成框架。

---

## 1. 需求拆解

你的核心诉求可以拆成四个相互关联的能力点：

1. **代码化动效（Code-as-Motion）**：用前端技术（HTML/CSS/JS、GSAP、Three.js…）表达 AE 级动效，而非鼠标拖时间轴。
2. **AI 可执行**：动效是「写代码/写标记」这一 AI 已经很擅长的任务，让 AI 直接生成、修改动效，而不是去操作不可控的 GUI。
3. **确定性 / 可控**：同一份输入 → 永远输出同一段视频，逐帧一致。这是它与「视频生成大模型」最本质的区别。
4. **反「抽卡」**：扩散模型类视频生成（Sora/可灵/Veo 等）每次输出都是概率采样，结果不可复现、改一个细节就全变。你要的是**工程化、可增量修改、可回归测试**的视频。

一句话定性：你要的不是「生成视频」，而是 **「Video as Code」/「确定性视频原语（deterministic video primitive）」**——把视频变成可编译、可 diff、可版本管理的工程产物。

**重要结论：这正是 2026 年正在成型的一个独立技术品类，已有多个成熟开源/商用框架，不必从零自研。**

---

## 2. 现成框架横向对比

| 框架 | 渲染方式 | 时间轴/标记 | AI 适配 | 生态 | License | 与你需求契合度 |
|---|---|---|---|---|---|---|
| **HyperFrames**（HeyGen） | Headless Chrome 逐帧截图 + FFmpeg | HTML `data-*` 属性内联时间轴 | **原生为 Agent 设计**，CLI 非交互，带 skills | 任意 web 技术：GSAP/CSS/Lottie/Three.js/Anime.js/WAAPI | **Apache 2.0（完全免费）** | ★★★★★ |
| **Remotion** | Headless Chromium + FFmpeg | React 组件 + `useCurrentFrame()` | Remotion Skills（2026.1 起），Claude Code/Cursor 一等公民 | **整个 React 生态**（Recharts/D3/shadcn…） | Source-available，**公司>3人需付费** | ★★★★☆ |
| **Revideo**（Motion Canvas 分支） | Canvas 2D + Node API | TS 生成器函数（程序化时间轴） | 面向自动化渲染管线 | 自有 API，React 库不通用 | MIT（完全免费） | ★★★☆☆ |
| **Motion Canvas** | Canvas 2D | TS 生成器函数 | 偏手工编排 | 自有 API | MIT | ★★★☆☆ |
| **OpenMontage** | Agentic 工具编排（剪辑级） | 12 管线/52 工具/500+ skills | **Agent 原生**，调用确定性媒体工具 | 偏「素材剪辑装配」而非「动效合成」 | 开源 | ★★★☆☆（偏剪辑装配） |

### 2.1 HyperFrames —— 与你需求几乎 1:1 重合

HeyGen 于 **2026-04-17 以 Apache 2.0 开源**。它的定义就是「Write HTML. Render video. Built for agents.」——把 HTML/CSS/媒体/可 seek 动画变成**确定性 MP4**。

工作原理与你设想完全一致：
- 时间轴直接写在标记里，元素用 `data-start` / `data-duration` / `data-track-index` 描述出现时机、时长、轨道。
- 引擎在 headless Chrome 里加载 HTML，按 `frame = floor(time * fps)` 精确 seek 到每一帧、截图，再 pipe 给 FFmpeg 编码。
- **同输入同输出，逐帧一致**，专为 CI / 回归测试 / 自动化渲染设计。
- 动画层可用 GSAP / CSS / Lottie / Three.js / Anime.js / WAAPI，或自定义 frame adapter。
- 不绑定 React，无专有时间轴格式，CLI 默认非交互——天然适合 Claude Code / Cursor / Gemini CLI 等 Agent。
- 无按次渲染费、无商用门槛。

它正是你描述的「反抽卡、可控、AI 编码驱动」的开源实现。

### 2.2 Remotion —— 生态最强，但要算 License 账

Remotion 把「React 组件 + 帧号」映射为视频帧，2026 年初推出的 **Remotion Skills** 是 skills.sh 上安装量第 4 的 Agent 技能（12.6 万+ 安装），让 AI 用自然语言生成/修改/渲染视频。

优势是吃掉**整个 React 生态**（图表、UI 库、本仓库现有 React 组件都能直接复用）。代价是 License：个人/≤3 人公司/非营利免费，**满 4 人需付费**（Creators $25/seat·月；Automators $0.01/render，月底 $100；Enterprise 起 $500/月）。

### 2.3 其余

- **Revideo / Motion Canvas**：Canvas 2D 渲染，适合「精心编排的解说/教育动画」，MIT 免费；但不能渲染 HTML/CSS，外部 React 组件无法迁移，与本仓库资产割裂。
- **OpenMontage**：2026-06 开源的 agentic「视频生产系统」，强在把素材裁剪、音频重定时等**确定性媒体操作**做成 Agent 可调工具——偏「剪辑装配」而非「动效合成」，可作为你管线的下游（拼接/混音）补充。

---

## 3. 自研 vs 采用现成框架

**结论：不要从零自研引擎核心（时钟/逐帧导出/编码），应基于现成框架，把精力投在你的差异化层。**

理由：
- 「确定性时钟 + headless 逐帧截图 + FFmpeg 编码 + 并行渲染」是脏活累活，HyperFrames/Remotion 已经做完且久经验证。自研至少数月且容易踩字体/色彩/浮点确定性的坑。
- 现成框架恰好已经解决你最看重的两点：**确定性**与**Agent 友好**。

你真正值得自研的是上层差异化：
1. **动效模板库**：把本仓库现有动效（Launching/Glass/The Ark/Digital Wall）抽象成参数化、帧驱动的转场/字幕/贴纸模板（这是别人没有的资产）。
2. **AI 编排约定**：给 Agent 的提示词规范、模板 manifest、参数 schema，让 AI 生成动效又稳又准。
3. **编辑/预览层**（可选）：可视化时间轴 + 由 manifest 自动生成参数面板。

---

## 4. 选型建议

按约束给出推荐：

- **追求完全开源、Agent 原生、HTML 灵活、零成本** → 首选 **HyperFrames**。它与你的理念最贴合，且能直接复用本仓库的 HTML/CSS/GSAP 动效。建议你立刻在它上面验证一个端到端 demo。
- **需要复用大量 React 组件与生态、团队 ≤3 人或愿付 License** → 选 **Remotion**，配套 Remotion Skills 做 AI 工作流。
- **务实的组合拳**：以 **HyperFrames 作渲染/导出底座**（免费、确定性、Agent 友好），把本仓库动效迁成 HyperFrames 兼容的 HTML 模板；若个别复杂动效强依赖 React 生态，再局部引入 Remotion。两者都用 headless Chrome + FFmpeg，思路同构、可共存。

---

## 5. 与上一份《动效引擎设计文档》的关系修正

上一份文档建议以 Remotion 为底座——技术上成立，但本次调研发现 **HyperFrames 更贴合你「开源 + Agent 原生 + 反抽卡」的核心主张，且无 License 负担**。建议把底座选型从「Remotion 唯一」调整为「HyperFrames 优先，Remotion 备选」，其余架构（确定性时钟、帧驱动模板、三层渲染、导出管线、迁移指南）依然完全有效，只需把「`useCurrentFrame()`」换成 HyperFrames 的「`data-*` 时间轴 + seekable 动画」即可。

---

## 6. 建议的下一步

1. clone HyperFrames，跑通官方 demo，确认确定性导出与 CLI 体验。
2. 选本仓库 1 个动效（建议 Launching），改造成 HyperFrames HTML 模板（GSAP timeline 改 seek 模式 + `data-start/duration`），导出 MP4 验证逐帧一致。
3. 写一份给 Agent 的「动效模板生成规范」，让 Claude/Cursor 能按 manifest 稳定产出新动效。
4. 跑通后再横向把其余动效模板化，形成你的差异化模板库。

---

## 来源（Sources）

- [HyperFrames — GitHub (heygen-com/hyperframes)](https://github.com/heygen-com/hyperframes)
- [HyperFrames — HeyGen 官方站](https://hyperframes.heygen.com/)
- [HeyGen Open-Sources HyperFrames — The Agent Times](https://theagenttimes.com/articles/heygen-open-sources-hyperframes-giving-us-a-deterministic-vi-10740a56)
- [Video as Code: A Deep Dive into HeyGen's Hyperframes](https://blog.nidhin.dev/video-as-code-a-deep-dive-into-heygen-s-hyperframes)
- [Remotion — 官方站](https://www.remotion.dev/)
- [Remotion License & Pricing](https://www.remotion.dev/docs/license)
- [Remotion Skills 2026: Create React Videos via Claude Code](https://gaga.art/blog/remotion-skills/)
- [Remotion vs Motion Canvas vs Revideo (2026) — PkgPulse](https://www.pkgpulse.com/guides/remotion-vs-motion-canvas-vs-revideo-programmatic-video-2026)
- [Remotion vs Motion Canvas — 官方对比](https://www.remotion.dev/docs/compare/motion-canvas)
- [OpenMontage 指南 — Tosea.ai](https://tosea.ai/blog/openmontage-agentic-video-production-guide)
