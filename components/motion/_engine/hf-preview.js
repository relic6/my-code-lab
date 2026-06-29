/*
 * hf-preview.js · 浏览器预览驱动器（仅用于 My Code Lab 预览，不参与渲染）
 *
 * 模板的 GSAP 时间轴是 paused 的，正式渲染由 HyperFrames 引擎按帧 seek 驱动。
 * 直接在浏览器打开时不会动；本脚本仅在 URL 带 `?preview` 时循环播放，
 * 方便在 Lab 页面 iframe 里查看效果。HyperFrames render 不带该参数，故不受影响。
 */
(function () {
  if (!/[?&]preview\b/.test(location.search)) return;

  // —— 自适应缩放：把 1920×1080 合成等比缩放居中，适配 Lab 的 iframe ——
  function fit() {
    var stage = document.querySelector("[data-composition-id]");
    if (!stage) return;
    var w = +stage.getAttribute("data-width") || 1920;
    var h = +stage.getAttribute("data-height") || 1080;
    document.documentElement.style.cssText = "width:100%;height:100%;overflow:hidden";
    document.body.style.cssText =
      "margin:0;width:100%;height:100%;overflow:hidden;background:#05070d;" +
      "display:flex;align-items:center;justify-content:center";
    stage.style.flex = "0 0 auto";
    function apply() {
      var s = Math.min(window.innerWidth / w, window.innerHeight / h);
      stage.style.transformOrigin = "center center";
      stage.style.transform = "scale(" + s + ")";
    }
    apply();
    window.addEventListener("resize", apply);
  }

  function drive() {
    var tls = window.__timelines || {};
    var list = Object.keys(tls).map(function (k) { return tls[k]; });
    if (!list.length) { return setTimeout(drive, 50); }
    list.forEach(function (tl) {
      try {
        // 循环播放（短转场也能反复观察）；预览专用，不影响渲染确定性
        tl.repeat(-1);
        if (tl.repeatDelay) tl.repeatDelay(0.6);
        tl.play(0);
      } catch (e) { /* 忽略不支持的时间轴 */ }
    });
  }
  fit();
  drive();
})();
