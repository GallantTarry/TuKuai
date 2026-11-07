/**
 * ==========================================================================================
 * 【文件名称】use-phile-fusion.js
 * 【文件作用】「5-Phile 五色胶囊聚变旋转」跃迁动效模块。
 *
 * 【在页面哪里能看到它？】
 *   在「我的简介」标签页中部，有 5 个彩色的英文身份胶囊按钮：
 *   `Hodophile`（蓝）、`Philocalist`（绿）、`Ludophile`（黄）、`Aquaphile`（紫）、`Technophile`（红）。
 *
 * 【点击任意一个胶囊按钮会发生什么？（四阶段时间轴拆解）】
 *   · 阶段 0（`gathering`，第 0 毫秒）：
 *     1. 测量页面上这 5 个按钮当前在屏幕上的真实位置与宽高（兼容电脑横排、手机自动换行等任意布局）；
 *     2. 弹出全屏毛玻璃遮罩层，在 5 个按钮的原位置生成 5 片一模一样的发光胶囊花瓣；
 *     3. 同时用浏览器内置的 Web Audio 合成器实时演奏一段空灵的「五音上行聚变和弦」（不需要加载外部 mp3），
 *        并让正在播放的背景音乐平滑渐弱。
 *   · 阶段 1（`converged`，约 2 帧后）：
 *     5 片胶囊花瓣从各自的位置同时腾空起飞，向屏幕正中央聚拢，并按 0°、72°、144°、216°、288° 拼成一朵五瓣花。
 *   · 阶段 2（`spinning`，第 750 毫秒）：
 *     合拢完成，整朵五色花开始高速旋转（3 圈半，共 1080°）。
 *   · 阶段 3（`bloomed`，第 1250 毫秒）：
 *     在高速旋转的巅峰，高清花朵大图（`assets/images/ui/phile-flower.png`）无缝绽放浮现。
 *   · 最终跳转（第 2500 毫秒）：
 *     整页跳转到 `assets/js/app/config.js` 中配置的 `TK.config.links.phileJump`（默认是 `https://blog.tukuai.art/`）。
 * ==========================================================================================
 */
(function (TK) {
    'use strict';

    // 从 Vue 中引入 ref，用于创建响应式变量
    const {ref} = Vue;

    // ==========================================================================================
    // 一、动画各阶段的时间点常量（单位：毫秒）
    // ==========================================================================================

    /** 花瓣从原位置飞到屏幕中心合拢后，开始高速旋转的时间点（750 毫秒） */
    const SPIN_AT_MS = 750;

    /** 旋转过程中，中心绽放出真实花朵图片（assets/images/ui/phile-flower.png）的时间点（1250 毫秒） */
    const BLOOM_AT_MS = 1250;

    /** 动画全部完成，正式跳转到目标网页的时间点（2500 毫秒 = 2.5 秒） */
    const JUMP_AT_MS = 2500;

    /**
     * 聚变音效的 5 个基础音符频率（单位：赫兹 Hz）：
     * 依次对应钢琴上的 C5(哆)、E5(咪)、G5(嗦)、C6(高音哆)、E6(高音咪)，构成明亮的大三和弦。
     * 5 个音符每隔 70 毫秒依次响起并向上滑音，营造出「五股能量向中心汇聚升空」的科幻听感。
     */
    const FUSION_FREQUENCIES = [523.25, 659.25, 783.99, 1046.50, 1318.51];

    // ==========================================================================================
    // 二、Web Audio 纯代码合成聚变音效（无需外部音频文件，零网络延迟）
    // ==========================================================================================

    /**
     * 使用浏览器原生 Web Audio API 实时合成并播放一段 2.3 秒的五音聚变音效。
     * 如果用户的浏览器不支持 Web Audio 或处于静音限制状态，会自动静默跳过，绝不影响视觉动效。
     */
    function playFusionSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            // 部分浏览器要求 AudioContext 在点击事件中手动 resume 唤醒
            if (ctx.state === 'suspended') ctx.resume();
            const now = ctx.currentTime;

            FUSION_FREQUENCIES.forEach((freq, idx) => {
                // 每个音符错开 0.07 秒（70ms）依次进入
                const start = now + idx * 0.07;
                // 创建发声振荡器（osc）和音量控制器（gain）
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                // 使用纯净柔和的正弦波（sine）音色
                osc.type = 'sine';

                // 音高变化：在 1.8 秒内从基础频率平滑上滑到 1.5 倍频率（五度上扬）
                osc.frequency.setValueAtTime(freq, start);
                osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.8);

                // 音量包络：0.04 秒内柔和起音到 0.08 → 在 2.2 秒内渐渐消散到近乎静音
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.08, start + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

                // 连接音频管线：振荡器 → 音量控制器 → 扬声器输出
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start);
                osc.stop(now + 2.3);
            });
        } catch (_) {
            // 音效属于锦上添花，任何异常直接忽略
        }
    }

    /**
     * 创建「5-Phile 聚变旋转」动效控制器
     * @param {() => void} fadeOutMusic 让背景音乐平滑渐弱的函数（来自 `use-music-player.js`）
     */
    TK.composables.usePhileFusion = function usePhileFusion(fadeOutMusic) {
        // ======================================================================================
        // 三、响应式状态变量
        // ======================================================================================

        /**
         * 聚变全屏遮罩层是否挂载显示（绑定在 `index.html` 的 `<div id="phile-fusion-overlay" v-if="isPhileFusing">`）：
         * 同时兼作防连点锁，动效一旦开始，后续点击不再重复触发。
         */
        const isPhileFusing = ref(false);

        /**
         * 当前所处的动画阶段名称：
         *   · 'idle'      ：平时静止状态
         *   · 'gathering' ：花瓣刚生成在原按钮位置上
         *   · 'converged' ：花瓣向屏幕中心飞拢拼接成五瓣花
         *   · 'spinning'  ：五瓣花在屏幕中心高速旋转
         *   · 'bloomed'   ：中心绽放出高清花朵大图
         */
        const philePhase = ref('idle');

        /**
         * 传给模板渲染 5 片花瓣的完整数组：
         * 包含 `assets/js/app/data/content.js` 里的颜色角度配置 + 实时测量出的按钮起始宽高与偏移坐标。
         */
        const philePetals = ref([]);

        /** 保存各阶段定时器的数组，用于复位时统一清理 */
        const timers = [];

        // ======================================================================================
        // 四、实时测量按钮位置与启动动效
        // ======================================================================================

        /**
         * 测量页面上 5 个 `.phile-btn` 胶囊按钮此刻在屏幕上的真实尺寸和位置，
         * 计算出每片花瓣相对于屏幕正中心（centerX, centerY）的起始偏移量（deltaX, deltaY）。
         * 这样无论用户是在宽屏电脑上（5 个按钮一字排开）还是在手机上（按钮分成两三行），
         * 花瓣起飞的一瞬间都能分毫不差地贴合在原按钮上！
         */
        const measurePetals = () => {
            const buttons = document.querySelectorAll('.phile-btn');
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            return TK.data.philePetals.map((petal, i) => {
                // 默认兜底坐标（万一找不到 DOM 节点时使用）
                let startW = 120, startH = 40, deltaX = (i - 2) * 80, deltaY = 120;
                if (buttons[i]) {
                    const rect = buttons[i].getBoundingClientRect();
                    startW = rect.width;
                    startH = rect.height;
                    // 按钮中心点坐标 减去 屏幕中心点坐标 = 花瓣起飞前的初始位移
                    deltaX = (rect.left + rect.width / 2) - centerX;
                    deltaY = (rect.top + rect.height / 2) - centerY;
                }
                return {...petal, startW, startH, deltaX, deltaY};
            });
        };

        /**
         * 点击任意一个 Phile 胶囊按钮时触发的主函数。
         * @param {number} clickedIndex 被点击的是第几个按钮（0~4，预留参数方便未来扩展差异化特效）
         * @param {Event}  event        原生点击事件对象
         */
        const triggerPhileFusion = (clickedIndex, event) => {
            if (isPhileFusing.value) return;

            // 1. 清空旧定时器、播放五音聚变音效、让背景音乐平滑渐弱
            TK.utils.clearTimers(timers);
            playFusionSound();
            fadeOutMusic();

            // 2. 实时测量 5 个按钮的位置，并挂载遮罩层（初始处于 gathering 原位贴合态）
            philePetals.value = measurePetals();
            isPhileFusing.value = true;
            philePhase.value = 'gathering';

            // 3. 为什么要连续套两层 requestAnimationFrame？
            //    第一帧：让浏览器先把 5 片花瓣按照 `gathering` 状态实实在在地画在原按钮位置上；
            //    第二帧：把状态改成 `converged`（目标位置是屏幕中心），此时浏览器检测到位置变化，
            //            就会触发丝滑的 CSS transition 飞行动画！如果直接改，浏览器会跳过起点直接画在终点。
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    philePhase.value = 'converged';
                });
            });

            // 4. 750ms 后合拢完毕，开始高速旋转
            timers.push(setTimeout(() => {
                philePhase.value = 'spinning';
            }, SPIN_AT_MS));

            // 5. 1250ms 后在旋转中心绽放高清花朵图片
            timers.push(setTimeout(() => {
                philePhase.value = 'bloomed';
            }, BLOOM_AT_MS));

            // 6. 2500ms 后整页跳转到目标地址（在 assets/js/app/config.js 的 TK.config.links.phileJump 中配置）
            timers.push(setTimeout(() => {
                window.location.href = TK.config.links.phileJump;
            }, JUMP_AT_MS));
        };

        /**
         * 将聚变动画状态彻底复位，并清空所有待执行的定时器。
         * （当用户按浏览器「后退」键从外部页面返回本站时，由 `main.js` 自动调用）
         */
        const resetPhileFusion = () => {
            isPhileFusing.value = false;
            philePhase.value = 'idle';
            TK.utils.clearTimers(timers);
        };

        return {isPhileFusing, philePhase, philePetals, triggerPhileFusion, resetPhileFusion};
    };
})(window.TuKuai);
