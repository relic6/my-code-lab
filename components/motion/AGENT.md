# AGENT.md · 给 AI 的动效编排规范

本目录是一套 **HyperFrames 动效模板库** + **合成管线**。AI（Claude Code / Cursor 等）按本规范即可把「自然语言需求」稳定转成「确定性视频」。

## 工作流（三步）

1. **选模板 + 填参** → 产出工程文件 `composition.json`（不要手写 HTML）。
2. **校验**：`node components/motion/_engine/validate.mjs <composition.json>`（必须通过再继续）。
3. **合成**：`node components/motion/_engine/compose.mjs <composition.json> <outDir>`，再 `cd <outDir> && npx hyperframes render . --out out.mp4`。

> 核心原则：AI 只产出**数据**（composition.json），渲染由引擎负责。这样确定性、可校验、可回归。

## 工程文件格式（composition.json）

```jsonc
{
  "id": "my-video",
  "width": 1920, "height": 1080, "fps": 30,
  "scenes": [
    { "template": "<分类>/<模板id>", "from": 0, "duration": 3.5, "track": 1,
      "props": { /* 见各模板 manifest.json 的 params */ } }
  ],
  "audio": [ { "src": "bgm.mp3", "from": 0, "volume": 0.8 } ]   // 可选
}
```

字段：`from`/`duration` 单位秒；`track` 轨道号——**同轨道时间不可重叠**（背景放 0，主体放 1，叠层放 2）。

## 可用模板（template 取值 = 目录路径）

| 分类 | 模板 id | 用途 |
|---|---|---|
| titles | kinetic-typography · neon-title · glass-caption-bar · typewriter-cursor · split-reveal | 标题/字幕 |
| transitions | glass-flip-wipe · digital-wall-shatter · shockwave-dissolve · parallax-tilt-push · ripple-mask | 转场 |
| overlays | hud-overlay · radar-sweep · data-readout-ticker · joystick-control | 叠层/HUD |
| backgrounds | aurora-gradient · starfield-parallax · grid-perspective · noise-vignette | 背景 |
| particles | glow-embers · spark-burst · floating-bokeh | 粒子氛围 |

每个模板的可填参数、类型、默认值、取值范围，**以该模板目录下 `manifest.json` 的 `params` 为准**。填参前先读对应 manifest，不要臆造参数名。

## 硬性约束（违反会导致渲染错误）

1. **参数必须在 manifest 声明范围内**——validate.mjs 会拦截越界/非法枚举/未知参数。
2. **同一 track 内场景时间不可重叠**（背景全程独占 track 0；主体 track 1 顺序排列；叠层 track 2）。
3. **确定性**：随机用 `seed` 参数控制，不要期望帧间随机变化。
4. **转场素材**：转场支持图片槽（如 glass-flip-wipe 的 `frontSrc`/`backSrc`，其余的 `outSrc`/`inSrc`），传图片 URL；视频暂不支持嵌入子合成（HyperFrames 限制媒体须为宿主 root 直接子节点）。
5. 不要手改生成的 `compositions/*.html` 与宿主 `index.html`——改 `composition.json` 后重跑 compose。

## 一个完整示例

参见 `examples/promo/composition.json`（极光背景 + 逐字标题 + 毛玻璃字幕条 + HUD 叠层）。生成与渲染：

```bash
node components/motion/_engine/validate.mjs components/motion/examples/promo/composition.json
node components/motion/_engine/compose.mjs   components/motion/examples/promo/composition.json /tmp/promo-out
cd /tmp/promo-out && npx hyperframes render . --out promo.mp4
```

## 设计酷炫片子的建议节奏

- track 0：一个背景贯穿全程（aurora / starfield / grid）。
- track 1：标题/字幕顺序排列，每段 2.5–4s，留 0.3–0.5s 入场缓冲。
- track 2：关键节点叠 HUD / 数据读数 / 粒子做点缀。
- 转场放在两个主体场景的交界，时长 0.8–1.2s。
- 全片叠一层 `noise-vignette`（track 3）增加电影质感。
