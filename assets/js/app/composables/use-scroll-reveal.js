/**
 * ============================================================================
 * 文件路径：assets/js/app/composables/use-scroll-reveal.js
 * 文件作用：【列表卡片与标题的丝滑滚动渐显动效】
 * ============================================================================
 *
 * 【通俗理解：这个功能实现了什么视觉效果？】
 * 当你切换左侧导航栏（比如切到有 30 款游戏的「复古游戏」或 52 首歌的「电子音乐」），或者向下滚动列表时，
 * 每一张毛玻璃卡片（`.glass-card`）、板块标题（`h2.tab-title`）和歌单项（`.song-item`）
 * 都不是生硬地直接糊在屏幕上，而是带有一种**从下方 10px 处由透明向上缓缓浮现**的高级动效！
 *
 * 【原理解释：三步走】
 *   第一步（披上隐身斗篷）：
 *     每次切换板块或刚开完机，程序找到当前页面所有的卡片/标题/歌单项，给它们加上两个 CSS 类（定义在 `css/style.css`）：
 *       - `.reveal-init`       ：`opacity: 0; transform: translateY(10px)`（完全透明，且往下偏移 10 像素）
 *       - `.reveal-transition` ：开启 0.6 秒的丝滑透明度与位移过渡动画
 *
 *   第二步（视口侦测器 `IntersectionObserver`）：
 *     用浏览器原生的 `IntersectionObserver` 盯着这些卡片。
 *     一旦某张卡片进入屏幕可视范围（而且我们设置了 `rootMargin: "150px"`，即卡片离屏幕底部还有 150px 时就提前触发，绝不让用户看到空白死等），
 *     立刻摘掉它的 `.reveal-init` 隐身类 -> 卡片就会自动在 0.6 秒内向上浮现到原位！
 *
 *   第三步（600ms 后归还控制权）：
 *     浮现动画只播一次就够了（`observer.unobserve` 停止盯它），
 *     并且等 600ms 动画播完后，把 `.reveal-transition` 也摘掉，避免干扰卡片原本自带的鼠标悬停上浮（hover）特效。
 */
(function (TK) {
    'use strict';

    const {watch, nextTick} = Vue;

    /** 需要加滚动渐显动效的 3 类元素的 CSS 选择器 */
    const REVEAL_SELECTOR = '.glass-card, h2.tab-title, .song-item';
    /** 浮现动画持续时间：600 毫秒（与 `css/style.css` 里 `.reveal-transition` 的 0.6s 严格对应） */
    const REVEAL_DURATION_MS = 600;

    /**
     * @param {Vue.Ref<string>} currentTab 当前选中的导航板块（每次切换板块都要给新板块的卡片挂上渐显侦测）
     * @param {Vue.Ref<boolean>} isBooted 系统是否已完成开机（开机动画结束、主界面显现时才启动侦测）
     */
    TK.composables.useScrollReveal = function useScrollReveal(currentTab, isBooted) {
        let observer = null;

        const initScrollReveal = () => {
            // 每次切页前先把旧的侦测器断开清理掉，防止内存泄漏
            if (observer) observer.disconnect();

            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    // 如果这个元素还没进入可视范围，就跳过
                    if (!entry.isIntersecting) return;

                    // 1. 元素进入视野：移除隐藏类 `reveal-init`，触发向上浮现动画
                    entry.target.classList.remove('reveal-init');
                    // 2. 已经浮现过的元素不需要再重复观察了，立刻解除观察节省性能
                    observer.unobserve(entry.target);
                    // 3. 等 600ms 浮现动画彻底结束后，移除 `reveal-transition`，把过渡控制权完璧归赵给卡片自带的 hover 特效
                    setTimeout(() => {
                        entry.target.classList.remove('reveal-transition');
                    }, REVEAL_DURATION_MS);
                });
            }, {
                // 上下各向外扩展 150px 的侦测区：卡片还没滚到屏幕边缘就提前开始浮现，手感最顺滑
                rootMargin: '150px 0px 150px 0px',
                // 只要露出哪怕 0.001% 的边角就立刻触发
                threshold: 0
            });

            // 找到当前板块下所有的毛玻璃卡片、标题、歌单项，统一挂上初始隐藏状态并交给侦测器
            document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
                el.classList.add('reveal-init', 'reveal-transition');
                observer.observe(el);
            });
        };

        // 同时监听“切换板块（currentTab）”和“完成开机（isBooted）”：
        // 注意这里用了 `await nextTick()` —— 因为刚改了 `currentTab` 的那一瞬间，Vue 还没来得及把新板块的卡片画到网页 DOM 上；
        // 等 `nextTick()` 完成后，新卡片已经真正在页面上了，这时候再去 `querySelectorAll` 才能一个不落地全抓到！
        watch([currentTab, isBooted], async ([, booted]) => {
            if (!booted) return;
            await nextTick();
            initScrollReveal();
        }, {immediate: true});
    };

})(window.TuKuai);
