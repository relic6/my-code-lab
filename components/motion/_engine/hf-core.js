// hf-core.js · 动效模板共享核心（单一来源）
// 由 _engine/build.mjs 内联进每个合成的 <!-- hf-core --> 标记块，
// 保证输出仍是自包含 HTML（HyperFrames 渲染安全），同时只需在此处维护一次。
//
// 提供：
//   hfSeeded(seed)      —— 确定性 PRNG（mulberry32），替代 Math.random 保逐帧一致
//   hfProps(defaults)   —— 合并模板默认参数与 window.__props（AI/工程文件覆盖入口）
window.hfSeeded = window.hfSeeded || function (seed) {
  var a = (seed || 1) >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
window.hfProps = function (defaults) {
  return Object.assign({}, defaults || {}, window.__props || {});
};
