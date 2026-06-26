# Motion · HyperFrames 动效模板库

把仓库现有前端动效改造为 **HyperFrames** 兼容的动效模板，实现「写代码 → 确定性渲染 MP4」的可控视频制作。

底座：[HyperFrames](https://github.com/heygen-com/hyperframes)（HeyGen，Apache 2.0）。HTML + `data-*` 时间轴 + 可 seek 的 GSAP 动画 → 逐帧确定性导出。

## 目录结构

```
components/motion/
  _engine/
    tokens.css        # 共享设计令牌（霓虹/辉光/玻璃/噪声），由 _shared/tokens.ts 移植
    hf-utils.js       # 确定性 PRNG 与粒子工具（替代 Math.random，保证逐帧一致）
  titles/
    kinetic-typography/   # 逐字点亮标题（源：Launching）
  transitions/
    glass-flip-wipe/      # 玻璃 3D 翻转转场（源：Glass Flip）
  backgrounds/
    aurora-gradient/      # 极光流光背景（源：Glass）
  examples/
    intro-demo/           # 合成示例：背景 + 标题
```

每个模板目录含 `index.html`（自包含合成）+ `manifest.json`（参数 schema，供 AI 填参/生成面板）。

## HyperFrames 契约（改造规则）

1. 合成根元素带 `data-composition-id` / `data-start` / `data-duration` / `data-width` / `data-height`。
2. GSAP 时间轴 **paused 创建**，注册到 `window.__timelines["<composition-id>"]`，由引擎按帧 seek，**不要 `tl.play()`**。
3. 动画值用 GSAP 属性（`y`/`scale`/`rotationY`…），不要与 CSS `transform` 同时作用于同一元素（lint 会报 `gsap_css_transform_conflict`）。
4. 禁止 `Math.random()` / `Date.now()`，随机用 `hf-utils.js` 的带种子 PRNG，种子写进参数。
5. `repeat` 用有限次数，禁止 `-1`（视频是有限时长）。

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

本批 4 个合成均通过 `hyperframes lint`：**0 error / 0 warning**（含 GSAP 确定性契约校验）。
> 注：MP4 渲染需本机已安装 Chrome headless shell；CI 沙箱若无网络下载 Chromium 则只能跑到 lint 阶段。

## 现有资产 → 模板映射（完整清单见 docs/hyperframes-effects-checklist.md）

| 现有组件 | 已改造 | 待孵化 |
|---|---|---|
| Launching | ✅ kinetic-typography | shockwave-dissolve · starfield-parallax · glow-embers |
| Glass | ✅ aurora-gradient | glass-caption-bar · floating-bokeh |
| Glass Flip | ✅ glass-flip-wipe | — |
| The Ark | — | hud-overlay · radar-sweep |
| Digital Wall | — | digital-wall-shatter · grid-perspective |
| Animation Delay | — | ripple-mask |
| Cool Joystick | — | joystick-control |
