#!/usr/bin/env node
/*
 * compose.mjs · 合成/拼接层（Timeline JSON → HyperFrames 多场景成片）
 *
 * 读取一份工程文件（composition.json），把多个动效模板按时间轴拼成一条完整视频：
 *   - 每个 scene 引用一个模板（titles/.../id），带 from/duration/track/props。
 *   - 本脚本把「自包含模板」转换为 HyperFrames「子合成」(<template> 包裹、按
 *     composition-id 隔离 CSS、独立 seek)，写到 <out>/compositions/<sceneId>.html。
 *   - 生成宿主 index.html：root + 每个 scene 一个 data-composition-src clip。
 *
 * 用法：
 *   node components/motion/_engine/compose.mjs <composition.json> <outDir>
 *
 * 校验：对生成的宿主与每个子合成跑 `hyperframes lint`（逐文件）。注意：
 * 跨文件「挂载」契约 lint 抓不到，需本机 `hyperframes render` 真验证。
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const motionRoot = join(__dirname, "..");

const [, , jsonPath, outDir] = process.argv;
if (!jsonPath || !outDir) {
  console.error("用法: node compose.mjs <composition.json> <outDir>");
  process.exit(1);
}

const proj = JSON.parse(await readFile(resolve(jsonPath), "utf8"));
const W = proj.width ?? 1920;
const H = proj.height ?? 1080;
const fps = proj.fps ?? 30;
const projectId = proj.id ?? "composition";

/** 把一个自包含模板 HTML 转换成 HyperFrames 子合成文件内容 */
function toSubComposition(templateHtml, sceneId, props) {
  // 1) 样式块
  const style = (templateHtml.match(/<style>([\s\S]*?)<\/style>/) || [, ""])[1];
  // 2) 舞台标记：<body> 之后到 GSAP <script> 之前的内容即 #stage 块
  const bodyInner = templateHtml.split("<body>")[1] || "";
  const gsapIdx = bodyInner.indexOf('<script src="https://cdn.jsdelivr.net/npm/gsap');
  let stage = bodyInner.slice(0, gsapIdx).trim();
  // 3) hf-core 块（确定性 PRNG + hfProps）
  const core = (templateHtml.match(/<!-- hf-core:start -->([\s\S]*?)<!-- hf-core:end -->/) || [, ""])[1]
    .replace(/<\/?script>/g, "").trim();
  // 4) 模板业务脚本：hf-core:end 之后的第一个 <script>...</script>（排除 hf-preview）
  const afterCore = templateHtml.split("<!-- hf-core:end -->")[1] || "";
  const logic = (afterCore.match(/<script>([\s\S]*?)<\/script>/) || [, ""])[1];

  // 原 composition-id（从 stage 的 data-composition-id 读取）
  const origId = (stage.match(/data-composition-id="([^"]+)"/) || [, sceneId])[1];

  // 重命名 composition-id；子合成时序由宿主 clip 控制，仅保留 data-start="0"（满足 root 校验），去掉 data-duration
  stage = stage
    .replace(/data-composition-id="[^"]+"/, `data-composition-id="${sceneId}"`)
    .replace(/\s*data-duration="[^"]*"/, "");
  if (/data-start="/.test(stage)) {
    stage = stage.replace(/data-start="[^"]*"/, 'data-start="0"');
  } else {
    stage = stage.replace(/(data-composition-id="[^"]+")/, '$1 data-start="0"');
  }
  const logicScoped = logic.replace(
    new RegExp(`__timelines\\["${origId}"\\]`, "g"),
    `__timelines["${sceneId}"]`
  );

  const propsJson = JSON.stringify(props ?? {});
  return `<!doctype html>
<html lang="zh">
  <head><meta charset="utf-8" /></head>
  <body>
    <template>
      <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
      <style>${style}</style>
      ${stage}
      <script>window.__props = ${propsJson};</script>
      <script>${core}</script>
      <script>${logicScoped}</script>
    </template>
  </body>
</html>
`;
}

const compDir = join(outDir, "compositions");
await mkdir(compDir, { recursive: true });

let totalDur = 0;
const clips = [];
for (let i = 0; i < proj.scenes.length; i++) {
  const s = proj.scenes[i];
  const sceneId = `${s.template.split("/").pop()}-${i}`;
  const tplPath = join(motionRoot, `${s.template}/index.html`);
  const tplHtml = await readFile(tplPath, "utf8");
  const sub = toSubComposition(tplHtml, sceneId, s.props);
  await writeFile(join(compDir, `${sceneId}.html`), sub);

  const from = s.from ?? 0;
  const dur = s.duration ?? 3;
  const track = s.track ?? 1;
  totalDur = Math.max(totalDur, from + dur);
  clips.push(
    `      <div\n        id="clip-${i}"\n        class="clip"\n        data-composition-id="${sceneId}"\n` +
    `        data-composition-src="compositions/${sceneId}.html"\n` +
    `        data-start="${from}"\n        data-duration="${dur}"\n        data-track-index="${track}"\n` +
    `        data-width="${W}"\n        data-height="${H}"\n      ></div>`
  );
}

// 音频（如有）：必须是 host root 的直接子节点
const audio = (proj.audio ?? [])
  .map((a, i) =>
    `      <audio data-start="${a.from ?? 0}" data-duration="${a.duration ?? totalDur}" ` +
    `data-track-index="${11 + i}" data-volume="${a.volume ?? 1}" src="${a.src}"></audio>`
  )
  .join("\n");

const host = `<!doctype html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="${projectId}" data-start="0" data-duration="${totalDur}" data-width="${W}" data-height="${H}">
${clips.join("\n")}
${audio}
    </div>
    <script>
      // 宿主自身无动画：注册一个空的 paused 时间轴满足 GSAP 适配器契约
      window.__timelines = window.__timelines || {};
      window.__timelines["${projectId}"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
await writeFile(join(outDir, "index.html"), host);

console.log(`✓ 合成完成：${proj.scenes.length} 个场景 → ${join(outDir, "index.html")}`);
console.log(`  时长 ${totalDur}s @ ${fps}fps · 子合成在 ${compDir}`);
