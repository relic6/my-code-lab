# Motion · HyperFrames 动效模板库

把仓库现有前端动效改造为 **HyperFrames** 兼容的动效模板，实现「写代码 → 确定性渲染 MP4」的可控视频制作。

底座：[HyperFrames](https://github.com/heygen-com/hyperframes)（HeyGen，Apache 2.0）。HTML + `data-*` 时间轴 + 可 seek 的 GSAP 动画 → 逐帧确定性导出。

## 目录结构

```
components/motion/
  _engine/
    tokens.css        # 共享设计令牌（霓虹/辉光/玻璃/噪声），由 _shared/tokens.ts 移植
    hf-core.js        # 共享核心单一来源：hfSeeded(确定性 PRNG) + hfProps(参数合并)
    build.mjs         # 把 hf-core.js 内联进每个合成（输出仍自包含、渲染安全）
    hf-preview.js     # 仅 Lab 预览用：带 ?preview 时循环播放并缩放适配（不参与渲染）
    compose.mjs       # 合成/拼接层：composition.json → 子合成 + 宿主 index.html（多场景成片）
    validate.mjs      # 校验 composition.json 的模板/参数是否合法（AI 编排前置）
    render-check.mjs  # 真渲染验证：渲染 PNG 帧序列 + 两次逐帧一致性（确定性）校验
  AGENT.md            # 给 AI 的动效编排规范（选模板→填参→校验→合成→渲染）
  titles/             # 标题字幕
    kinetic-typography/   # 逐字点亮标题（源：Launching）
    neon-title/           # 霓虹灯启辉大标题（源：_shared 令牌）
    glass-caption-bar/    # 底部毛玻璃字幕条（源：Glass）
    typewriter-cursor/    # 终端打字机 + 光标（新增）
    split-reveal/         # 色块遮罩揭示（新增）
  transitions/        # 转场
    glass-flip-wipe/      # 玻璃 3D 翻转（源：Glass Flip）
    digital-wall-shatter/ # 瓷砖碎裂（源：Digital Wall）
    shockwave-dissolve/   # 冲击波溶解（源：Launching）
    parallax-tilt-push/   # 视差倾斜推拉（源：useParallaxTilt）
    ripple-mask/          # 同心圆遮罩（源：Animation Delay）
  overlays/           # 叠层 / HUD
    hud-overlay/          # 科技感 HUD（源：The Ark）
    radar-sweep/          # 雷达扫描贴纸（源：The Ark）
    data-readout-ticker/  # 数据读数面板（源：The Ark）
    joystick-control/     # 拟态摇杆控件（源：Cool Joystick）
  backgrounds/        # 背景
    aurora-gradient/      # 极光流光（源：Glass）
    starfield-parallax/   # 视差星空（源：Launching）
    grid-perspective/     # 赛博透视网格（源：Digital Wall）
    noise-vignette/       # 颗粒噪声 + 暗角（源：_shared）
  particles/          # 粒子（确定性 DOM 粒子）
    glow-embers/          # 上升余烬（源：Launching）
    spark-burst/          # 火花迸射（源：Launching）
    floating-bokeh/       # 漂浮光斑（源：Glass）
  examples/
    intro-demo/           # 合成示例：背景 + 标题
```

每个模板目录含 `index.html`（自包含合成）+ `manifest.json`（参数 schema，供 AI 填参/生成面板）。共 **21 个合成**，全部通过 `hyperframes lint`（0 error / 0 warning）。

## 共享核心与维护（DRY）

为避免每个模板重复写 PRNG 和参数解析，公共逻辑集中在 `_engine/hf-core.js`：

- `hfSeeded(seed)` —— 确定性 PRNG（mulberry32），替代 `Math.random` 保证逐帧一致。
- `hfProps(defaults)` —— 合并模板默认参数与 `window.__props`（AI / 工程文件的覆盖入口）。

它通过 `_engine/build.mjs` **内联**进每个合成的 `<!-- hf-core:start/end -->` 标记块——
所以每个 `index.html` 仍是自包含的（HyperFrames 渲染不依赖任何外部共享文件），
但只需在 `hf-core.js` 改一次、重跑构建即可同步所有模板：

```bash
node components/motion/_engine/build.mjs   # 修改 hf-core.js 后执行
```

模板里直接用：`const props = hfProps({ ...默认值 }); const rnd = hfSeeded(props.seed);`

## 多场景合成（从片段到成片）

单个模板是一段独立画面。要拼成完整视频，用 **composition.json** 描述时间轴，再由 `compose.mjs` 生成 HyperFrames 多场景工程（每个场景转为子合成、按 `data-composition-src` 挂载、运行时按 composition-id 隔离 CSS 并独立 seek）。

```bash
# 1) 校验工程文件（模板存在性 + 参数合法性）
node components/motion/_engine/validate.mjs components/motion/examples/promo/composition.json
# 2) 合成宿主 + 子合成
node components/motion/_engine/compose.mjs   components/motion/examples/promo/composition.json /tmp/promo-out
# 3) 渲染成片
cd /tmp/promo-out && npx hyperframes render . --out promo.mp4
```

工程文件格式与编排约定见 `AGENT.md`；示例见 `examples/promo/composition.json`。
轨道约定：背景 track 0（全程）、主体 track 1（顺序不重叠）、叠层 track 2、噪声 track 3。

## 真渲染验证（重要）

`lint` 只静态校验，**发现不了 headless 渲染下的问题**（毛玻璃 backdrop-filter、字体回退、确定性）。在你本机装好 Chrome 后跑：

```bash
npx hyperframes browser ensure                       # 一次
node components/motion/_engine/render-check.mjs       # 抽样代表模板
node components/motion/_engine/render-check.mjs --all  # 全部
```

它渲染 PNG 帧序列、并对同一模板渲染两次比对帧哈希，验证「能渲染 + 逐帧确定性」。

## HyperFrames 契约（改造规则）

1. 合成根元素带 `data-composition-id` / `data-start` / `data-duration` / `data-width` / `data-height`。
2. GSAP 时间轴 **paused 创建**，注册到 `window.__timelines["<composition-id>"]`，由引擎按帧 seek，**不要 `tl.play()`**。
3. 动画值用 GSAP 属性（`y`/`scale`/`rotationY`…），不要与 CSS `transform` 同时作用于同一元素（lint 会报 `gsap_css_transform_conflict`）。
4. 禁止 `Math.random()` / `Date.now()`，随机用 `hf-utils.js` 的带种子 PRNG，种子写进参数。
5. `repeat` 用有限次数，禁止 `-1`（视频是有限时长）。

## 在 My Code Lab 页面预览

21 个模板 + intro-demo 已注册进 `src/catalog.tsx`，启动 `npm run dev` 后即可在 Lab 侧边栏（标签 `HYPERFRAMES`）点开查看。

原理：Lab 用 iframe 加载 `index.html?preview=1`。模板的 GSAP 时间轴默认是 paused（由 HyperFrames 引擎按帧 seek 驱动，不会自动播放）。`_engine/hf-preview.js` **仅在 URL 带 `?preview` 时**循环播放并把 1920×1080 合成等比缩放居中——正式 `render` 不带该参数，因此不影响导出的逐帧确定性。

## 本地预览 / 渲染

需要 Node ≥ 22、FFmpeg、Chrome headless shell（首次 `npx hyperframes browser ensure`）。

```bash
# 在某个模板目录上操作，例如：
cd components/motion/titles/kinetic-typography

npx hyperframes lint .            # 校验合成（CI 友好）
npx hyperframes preview .         # 浏览器实时预览（可拖时间轴）
npx hyperframes render . --out kinetic.mp4   # 渲染为 MP4
```

> 参数覆盖：在渲染前向页面注入 `window.__props = { text: "HELLO", accent: "#ec4899" }` 即可定制（AI / 工程文件驱动）。各模板支持的参数见同目录 `manifest.json`。

## 校验状态

全部 21 个合成均通过 `hyperframes lint`：**0 error / 0 warning**（含 GSAP 确定性契约校验）。
> 注：MP4 渲染需本机已安装 Chrome headless shell（`npx hyperframes browser ensure`）；无网络下载 Chromium 的沙箱只能跑到 lint 阶段。

## 现有资产 → 模板映射（全部已改造）

| 现有组件 | 已改造模板 |
|---|---|
| Launching | kinetic-typography · shockwave-dissolve · starfield-parallax · glow-embers · spark-burst |
| Glass | aurora-gradient · glass-caption-bar · floating-bokeh |
| Glass Flip | glass-flip-wipe |
| The Ark | hud-overlay · radar-sweep · data-readout-ticker |
| Digital Wall | digital-wall-shatter · grid-perspective |
| Animation Delay | ripple-mask |
| Cool Joystick | joystick-control |
| _shared (tokens/NeonBorder/useParallaxTilt) | neon-title · noise-vignette · parallax-tilt-push |
| 新增 | typewriter-cursor · split-reveal |
