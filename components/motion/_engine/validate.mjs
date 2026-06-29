#!/usr/bin/env node
/*
 * validate.mjs · 校验工程文件（composition.json）的场景与参数是否符合各模板 manifest。
 *
 * 给 AI 编排用：AI 产出工程文件后先跑本校验，再 compose。捕获「模板不存在 /
 * 参数名拼错 / 取值越界 / 枚举非法」等错误，避免生成无效合成。
 *
 * 用法：node components/motion/_engine/validate.mjs <composition.json>
 * 退出码 0=通过，1=有错误。
 */
import { readFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const motionRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = process.argv[2];
if (!jsonPath) { console.error("用法: node validate.mjs <composition.json>"); process.exit(1); }

const errors = [];
const warnings = [];
const proj = JSON.parse(await readFile(resolve(jsonPath), "utf8"));

if (!Array.isArray(proj.scenes) || proj.scenes.length === 0) {
  errors.push("scenes 为空：至少需要一个场景");
}

for (let i = 0; i < (proj.scenes || []).length; i++) {
  const s = proj.scenes[i];
  const tag = `scenes[${i}] (${s.template || "?"})`;
  if (!s.template) { errors.push(`${tag}: 缺少 template`); continue; }

  const manPath = join(motionRoot, `${s.template}/manifest.json`);
  let man;
  try {
    man = JSON.parse(await readFile(manPath, "utf8"));
  } catch {
    errors.push(`${tag}: 找不到模板 manifest（${s.template}/manifest.json）`);
    continue;
  }

  // 时间字段
  if (typeof s.from !== "undefined" && (typeof s.from !== "number" || s.from < 0))
    errors.push(`${tag}: from 必须是 ≥0 的数字`);
  if (typeof s.duration !== "undefined" && (typeof s.duration !== "number" || s.duration <= 0))
    errors.push(`${tag}: duration 必须是 >0 的数字`);

  // 参数校验
  const allowed = new Map((man.params || []).map((p) => [p.key, p]));
  for (const [k, v] of Object.entries(s.props || {})) {
    const spec = allowed.get(k);
    if (!spec) { warnings.push(`${tag}: 未知参数 "${k}"（manifest 未声明，将被忽略）`); continue; }
    if (spec.type === "number") {
      if (typeof v !== "number") errors.push(`${tag}.${k}: 应为 number`);
      else {
        if (typeof spec.min === "number" && v < spec.min) errors.push(`${tag}.${k}=${v} 小于 min ${spec.min}`);
        if (typeof spec.max === "number" && v > spec.max) errors.push(`${tag}.${k}=${v} 大于 max ${spec.max}`);
      }
    } else if (spec.type === "enum") {
      if (!(spec.options || []).includes(v)) errors.push(`${tag}.${k}="${v}" 不在枚举 ${JSON.stringify(spec.options)} 内`);
    } else if (spec.type === "boolean") {
      if (typeof v !== "boolean") errors.push(`${tag}.${k}: 应为 boolean`);
    } else if (spec.type === "color") {
      if (typeof v !== "string" || !/^(#|rgb|hsl|var\()/.test(v)) warnings.push(`${tag}.${k}="${v}" 看起来不是颜色`);
    }
  }
}

// 引用资源存在性（音频/图片本地路径）
for (const a of proj.audio || []) {
  if (a.src && !/^https?:/.test(a.src)) {
    try { await access(resolve(dirname(jsonPath), a.src)); }
    catch { warnings.push(`audio: 找不到本地文件 ${a.src}`); }
  }
}

if (warnings.length) console.log("⚠ 警告:\n  " + warnings.join("\n  "));
if (errors.length) {
  console.error("✗ 校验失败:\n  " + errors.join("\n  "));
  process.exit(1);
}
console.log(`✓ 校验通过：${proj.scenes.length} 个场景，参数合法`);
