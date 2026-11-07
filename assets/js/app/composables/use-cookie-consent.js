/**
 * ============================================================================
 * 文件路径：assets/js/app/composables/use-cookie-consent.js
 * 文件作用：【右下角 Cookie 授权提示弹窗控制】
 * ============================================================================
 *
 * 【通俗理解：这个弹窗是怎么工作的？】
 * 在 `index.html` 一开头有一个 `#cookieConsentBanner` 弹窗（"SYSTEM ALERT: 土块请求使用 Cookie 以优化系统交互与浏览体验，是否授权挂载？"）。
 * 它在 `css/style.css` 里默认是 `display: none`（隐藏状态）。
 *
 * 1. 为什么要监听 `isBooted` 并延迟 500 毫秒？
 *    因为新访客进网站时正在看全屏的 PowerShell 开机动画，如果这时候把 Cookie 弹窗弹出来会破坏开机仪式感。
 *    所以我们等 `isBooted` 变成 `true`（开机画面退去、主系统浮现）后，再等 0.5 秒才优雅地弹出提示框。
 *
 * 2. 怎么记住用户的选择？
 *    - 如果本地 `localStorage` 里还没有 `'tukuai_cookie_consent'` 记录，就把弹窗设为 `display = 'flex'` 显示出来；
 *    - 用户点击「🙆‍♂️ 同意！」或「🙅‍♂️ 拒绝~」后，把结果存进 `localStorage` 并把弹窗设回 `display = 'none'` 隐藏；
 *    - 以后该用户再次访问时，因为 `localStorage` 里已经有记录了，就永远不会再弹窗打扰他。
 */
(function (TK) {
    'use strict';

    const {watch, onMounted} = Vue;

    /** 开机动画结束后，延迟多少毫秒再弹出 Cookie 提示框（500ms = 0.5 秒） */
    const SHOW_DELAY_MS = 500;

    /**
     * @param {Vue.Ref<boolean>} isBooted 系统是否已完成开机动画（来自 `useBootSequence`）
     */
    TK.composables.useCookieConsent = function useCookieConsent(isBooted) {
        const storageKey = TK.config.storageKeys.cookieConsent; // 'tukuai_cookie_consent'

        const initBanner = () => {
            const banner = document.getElementById('cookieConsentBanner');
            const btnAccept = document.getElementById('btnAccept');
            const btnDecline = document.getElementById('btnDecline');
            if (!banner || !btnAccept || !btnDecline) return;

            // 只有当浏览器本地还没有存过授权记录时，才把弹窗显示出来
            if (!localStorage.getItem(storageKey)) {
                banner.style.display = 'flex';
            }

            // 生成按钮点击处理函数：把选择（'accepted' 或 'declined'）写入本地存储，并立刻隐藏弹窗
            const choose = (choice) => () => {
                localStorage.setItem(storageKey, choice);
                banner.style.display = 'none';
            };
            btnAccept.addEventListener('click', choose('accepted'));
            btnDecline.addEventListener('click', choose('declined'));
        };

        onMounted(() => {
            // 监听 `isBooted`：
            // - 新访客：等开机动画播完（`isBooted` 从 false 变成 true）后，延迟 0.5 秒执行 `initBanner`
            // - 老访客：因为进站时 `isBooted` 已经是 true，加上 `{immediate: true}` 就能在进站时直接启动 0.5 秒延迟检查
            watch(isBooted, (booted) => {
                if (booted) setTimeout(initBanner, SHOW_DELAY_MS);
            }, {immediate: true});
        });
    };

})(window.TuKuai);
