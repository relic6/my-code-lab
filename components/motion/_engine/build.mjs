#!/usr/bin/env node
/*
 * build.mjs · 把 _engine/hf-core.js 内联进每个动效合成。
 *
 * 思路：每个 index.html 在 GSAP <script> 之后放一对标记：
 *   <!-- hf-core:start --> ...(自动生成)... <!-- hf-core:end -->
 * 本脚本用 hf-core.js 的最新内容替换标记之间的部分。输出仍是自包含 HTML，
 * 因此 HyperFrames 渲染不依赖任何外部共享文件；维护时只改 hf-core.js 再跑本脚本。
 *
 * 用法：node components/motion/_engine/build.mjs
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const motionRoot = join(__dirname, "..");
const core = (await readFile(join(__dirname, "hf-core.js"), "utf8")).trim();

const START = "<!-- hf-core:start -->";
const END = "<!-- hf-core:end -->";
const block = `${START}\n    <script>\n${core}\n    </script>\n    ${END}`;

async function findIndexHtml(dir) {
  const out = [];
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    if (ent.name === "_engine") continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...(await findIndexHtml(p)));
    else if (ent.name === "index.html") out.push(p);
  }
  return out;
}

let changed = 0;
for (const file of await findIndexHtml(motionRoot)) {
  let html = await readFile(file, "utf8");
  if (html.includes(START)) {
    html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), block);
  } else {
    // 首次：在最后一个 GSAP <script ...></script> 之后注入
    const m = html.match(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/gsap[^>]*><\/script>/);
    if (!m) { console.warn("⚠ 未找到 GSAP 脚本，跳过", file); continue; }
    html = html.replace(m[0], `${m[0]}\n    ${block}`);
  }
  await writeFile(file, html);
  changed++;
}
console.log(`✓ hf-core 已内联到 ${changed} 个合成`);
