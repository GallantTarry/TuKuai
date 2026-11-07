/**
 * ==========================================================================================
 * 【文件名称】page-behaviors.js
 * 【文件作用】全局浏览器交互增强模块（与 Vue 无关，页面一加载就自动生效）。
 *
 * 【它具体帮页面做了哪两件事？】
 *   1. 禁止手机/平板上的页面误触放大（打造原生 App 般稳固的 1:1 界面）：
 *      · 拦截「双指/多指捏合放大」；
 *      · 拦截「连续快速双击屏幕放大」（比如在玩模拟器游戏或快速点按钮时，防止整个网页突然被放大）；
 *      · 拦截苹果 iOS Safari 特有的 `gesturestart` 缩放手势。
 *
 *   2. 自动消除浏览器自带的黄色丑陋悬浮提示框（原生 Tooltip）：
 *      · HTML 标签如果写了 `title="xxx"`，鼠标停在上面 1 秒后浏览器会弹出一个系统默认的白底/黄底小框，
 *        跟我们全站的赛博毛玻璃像素风格格不入，还会挡住自定义光标。
 *      · 所以当鼠标滑过任何元素时，我们动态把它的 `title` 属性移除掉，保持画面干净纯粹。
 * ==========================================================================================
 */
(function () {
    'use strict';

    // ==========================================================================================
    // 一、禁止移动端手势缩放（锁定 1:1 视口比例）
    // ==========================================================================================

    // 1. 拦截多指触控：只要屏幕上同时按下的手指数量 > 1（比如双指捏合），就阻止浏览器的默认缩放行为。
    //    注意：必须传 `{ passive: false }`，浏览器才允许我们在事件里调用 `event.preventDefault()`。
    document.addEventListener('touchstart', (event) => {
        if (event.touches.length > 1) event.preventDefault();
    }, {passive: false});

    // 2. 拦截快速双击放大：记录上一次手指离开屏幕的时间戳（lastTouchEnd），
    //    如果两次点击间隔小于等于 300 毫秒，就判定为「双击」，阻止浏览器默认的双击放大网页行为。
    const DOUBLE_TAP_MS = 300;
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= DOUBLE_TAP_MS) event.preventDefault();
        lastTouchEnd = now;
    }, {passive: false});

    // 3. 拦截苹果 Safari 浏览器专有的多指缩放手势事件（gesturestart）
    document.addEventListener('gesturestart', (event) => event.preventDefault());

    // ==========================================================================================
    // 二、自动移除原生 title 悬浮提示框（防止遮挡像素光标与破坏赛博视觉风格）
    // ==========================================================================================

    // 在事件捕获阶段（capture: true）监听鼠标移入事件：
    // 顺着当前鼠标指向的元素（e.target）一路向上检查它的所有父元素，只要发现带有 `title` 属性就立即移除。
    document.addEventListener('mouseover', (e) => {
        let el = e.target;
        while (el && el !== document) {
            if (el.hasAttribute && el.hasAttribute('title')) el.removeAttribute('title');
            el = el.parentElement;
        }
    }, {capture: true, passive: true});
})();
