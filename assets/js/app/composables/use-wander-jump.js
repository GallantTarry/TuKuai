/**
 * ==========================================================================================
 * 【文件名称】use-wander-jump.js
 * 【文件作用】「漫游者跃迁（Wander Jump）」整页坍缩动效模块。
 *
 * 【在页面哪里能看到它？】
 *   在「我的简介」标签页最底部，有一行名言卡片：
 *   "Not all those who wander are lost."（并非所有流浪者都迷失了方向。）
 *
 * 【点击这句话会发生什么？（时间轴拆解）】
 *   · 第 0 毫秒（点击瞬间）：
 *     1. `isWanderJumping` 变成 `true`，整个网页开始剧烈过载抖动并变色（对应 `style.css` 的 `.animate-overload`）；
 *     2. 如果当时正在播放背景音乐，音乐会像断电一样在 0.8 秒内渐渐变小直至静音（`fadeOutMusic()`）。
 *   · 第 400 毫秒（0.4 秒后）：
 *     1. `isCollapsing` 变成 `true`，主界面像老式 CRT 显像管电视关机一样，向屏幕中心猛烈坍缩成一道亮线并消失（`.animate-implode`）；
 *     2. 全屏纯黑遮罩层浮现，中央出现 `"INITIATING WANDER JUMP..."` 字样与一根 4 秒填满的进度条。
 *   · 第 4500 毫秒（4.5 秒后）：
 *     浏览器整页跳转到 `assets/js/app/config.js` 中配置的 `TK.config.links.wanderJump`（默认是 `https://wander.tukuai.art`）。
 *
 * 【为什么还需要一个 `resetWanderJump()` 复位函数？】
 *   当用户跳转到新网站后，如果点了浏览器的「后退（←）」按钮返回本页，现代浏览器会直接从内存快照（bfcache）
 *   里把刚才跳走前一刻的画面恢复出来——如果不复位，用户回来看到的会是一片黑屏！
 *   所以我们在 `main.js` 的 `pageshow` 事件里调用 `resetWanderJump()`，让页面瞬间恢复正常。
 * ==========================================================================================
 */
(function (TK) {
    'use strict';

    // 从 Vue 中引入 ref，用于创建响应式开关变量
    const {ref} = Vue;

    /** 点击后经过多少毫秒（400ms）开始执行「CRT 电视关机坍缩 + 黑屏进度条」 */
    const COLLAPSE_DELAY_MS = 400;

    /** 点击后经过多少毫秒（4500ms = 4.5秒）真正执行网页跳转 */
    const JUMP_DELAY_MS = 4500;

    /**
     * 创建「漫游者跃迁」动效控制器
     * @param {() => void} fadeOutMusic 让背景音乐平滑渐弱到静音的函数（由 `use-music-player.js` 提供）
     */
    TK.composables.useWanderJump = function useWanderJump(fadeOutMusic) {
        /**
         * 阶段一开关：是否已经开始跃迁（过载抖动阶段）。
         * 同时兼作「防连点锁」：一旦为 true，动画期间再次点击不会重复触发。
         */
        const isWanderJumping = ref(false);

        /**
         * 阶段二开关：是否已经进入界面向中心坍缩 + 黑屏加载进度条阶段。
         */
        const isCollapsing = ref(false);

        /**
         * 进度条动画重播计数器（绑定在 `index.html` 进度条元素的 `:key="jumpKey"` 上）：
         * 每次触发跃迁时加 1，强制 Vue 重新创建一个全新的进度条 DOM 节点，保证 CSS 进度条动画每次都从 0% 开始走。
         */
        const jumpKey = ref(0);

        // 保存两个阶段的定时器编号，方便在取消或复位时随时清除
        let collapseTimer = null;
        let jumpTimer = null;

        /**
         * 点击 `"Not all those who wander are lost."` 时触发的主函数。
         */
        const triggerWanderJump = () => {
            // 如果已经在跃迁动画中，直接忽略后续点击
            if (isWanderJumping.value) return;

            // 1. 刷新进度条 key、开启过载抖动、让背景音乐断电渐弱
            jumpKey.value++;
            isWanderJumping.value = true;
            fadeOutMusic();

            // 2. 清理可能残留的旧定时器（防御性编程）
            if (collapseTimer) clearTimeout(collapseTimer);
            if (jumpTimer) clearTimeout(jumpTimer);

            // 3. 400ms 后进入「向中心坍缩 + 黑屏进度条」阶段
            collapseTimer = setTimeout(() => {
                isCollapsing.value = true;
            }, COLLAPSE_DELAY_MS);

            // 4. 4500ms 后正式跳转到目标网站（地址在 assets/js/app/config.js 的 TK.config.links.wanderJump 中配置）
            jumpTimer = setTimeout(() => {
                window.location.href = TK.config.links.wanderJump;
            }, JUMP_DELAY_MS);
        };

        /**
         * 将跃迁状态彻底恢复为初始正常状态，并取消所有尚未触发的跳转定时器。
         * （在浏览器后退返回本页时由 `main.js` 自动调用）
         */
        const resetWanderJump = () => {
            isWanderJumping.value = false;
            isCollapsing.value = false;
            if (collapseTimer) clearTimeout(collapseTimer);
            if (jumpTimer) clearTimeout(jumpTimer);
        };

        return {isWanderJumping, isCollapsing, jumpKey, triggerWanderJump, resetWanderJump};
    };
})(window.TuKuai);
