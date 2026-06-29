#!/usr/bin/env node
/*
 * render-check.mjs · 真渲染验证（在你本机跑，需 Chrome headless shell + FFmpeg）
 *
 * 为什么需要：lint 只做静态校验，发现不了 headless 渲染下的问题——毛玻璃
 * backdrop-filter、字体回退、mix-blend-mode、WebGL、确定性。本脚本：
 *   1) 把每个模板渲染成 PNG 帧序列（验证「能渲染、画面非空」）；
 *   2) 同输入渲染两次，比对帧序列哈希，验证「逐帧确定性」（视频导出的前提）。
 * 用 PNG 序列而非 mp4 比对——mp4 容器会嵌入编码时间戳，字节级不可比。
 *
 * 前置（一次）：npx hyperframes browser ensure
 *
 * 用法：
 *   node components/motion/_engine/render-check.mjs            # 抽样代表模板
 *   node components/motion/_engine/render-check.mjs --all      # 全部模板
 *   node components/motion/_engine/render-check.mjs titles/neon-title
 */
import { readdirSync, readFileSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const motionRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

const SAMPLE = [
  "backgrounds/aurora-gradient",  // backdrop/blur/mix-blend
  "titles/kinetic-typography",    // 确定性 PRNG 粒子
  "titles/glass-caption-bar",     // backdrop-filter 毛玻璃（headless 高风险）
  "transitions/glass-flip-wipe",  // 3D + conic-gradient 边框
  "overlays/hud-overlay",         // conic-gradient 扫描 + 数据读数
  "particles/glow-embers",        // 大量 DOM 粒子
];

function listAll() {
  const out = [];
  for (const cat of ["titles", "transitions", "overlays", "backgrounds", "particles"]) {
    for (const ent of readdirSync(join(motionRoot, cat), { withFileTypes: true }))
      if (ent.isDirectory()) out.push(`${cat}/${ent.name}`);
  }
  return out;
}

const explicit = args.filter((a) => !a.startsWith("--"));
const targets = explicit.length ? explicit : args.includes("--all") ? listAll() : SAMPLE;

// 哈希一个目录下所有 PNG（排序后拼接），代表帧序列内容
function hashFrames(dir) {
  const files = readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
  if (!files.length) return { hash: "NO_FRAMES", count: 0 };
  const h = createHash("sha256");
  for (const f of files) h.update(readFileSync(join(dir, f)));
  return { hash: h.digest("hex").slice(0, 12), count: files.length };
}

function render(dir, outDir) {
  return spawnSync(
    "npx",
    ["hyperframes", "render", dir, "--format", "png-sequence", "-o", outDir,
     "--quality", "draft", "-w", "2", "--strict"],
    { encoding: "utf8" }
  );
}

let pass = 0, fail = 0;
for (const t of targets) {
  const dir = join(motionRoot, t);
  const tmp = mkdtempSync(join(tmpdir(), "hfcheck-"));
  const a = join(tmp, "a"), b = join(tmp, "b");

  const r1 = render(dir, a);
  if (r1.status !== 0) {
    console.error(`✗ ${t} 渲染失败:\n  ${(r1.stderr || r1.stdout || "").split("\n").slice(-5).join("\n  ")}`);
    fail++; continue;
  }
  const f1 = hashFrames(a);
  if (f1.count === 0) { console.error(`✗ ${t} 渲染产出 0 帧`); fail++; continue; }

  const r2 = render(dir, b);
  const f2 = r2.status === 0 ? hashFrames(b) : { hash: "ERR", count: 0 };

  if (f1.hash === f2.hash) {
    console.log(`✓ ${t}  ${f1.count} 帧 · 两次逐帧一致 (sha ${f1.hash})`);
    pass++;
  } else {
    console.warn(`⚠ ${t}  渲染成功但两次帧不一致 (${f1.hash} ≠ ${f2.hash})——存在非确定性，需排查`);
    fail++;
  }
}
console.log(`\n结果：${pass} 通过 / ${fail} 失败，共 ${targets.length} 个`);
process.exit(fail ? 1 : 0);
