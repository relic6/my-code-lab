/*
 * HyperFrames 动效共享工具
 * 关键：所有“随机”必须确定性（带种子），否则逐帧导出会抖动、无法复现。
 * 用法：在模板 <script> 中先引入本文件，再调用 hfRandom / hfBuildParticles。
 */
(function (global) {
  /** 带种子的确定性 PRNG（mulberry32），同种子永远同序列 */
  function hfSeeded(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * 生成确定性粒子参数数组（替代 Launching 里的 Math.sin/Math.random 抖动）
   * @returns Array<{i,x,delay,scale,drift}>
   */
  function hfParticles(count, seed) {
    const rnd = hfSeeded(seed || 1);
    return Array.from({ length: count }, (_, i) => ({
      i,
      x: rnd() * 100, // 0~100 (%)
      delay: rnd(), // 0~1 (归一化相位)
      scale: 0.6 + rnd() * 0.8,
      drift: (rnd() - 0.5) * 32, // 水平漂移 px
    }));
  }

  global.hfSeeded = hfSeeded;
  global.hfParticles = hfParticles;
})(typeof window !== "undefined" ? window : this);
