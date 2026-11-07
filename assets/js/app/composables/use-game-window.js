/**
 * ==========================================================================================
 * 【文件名称】use-game-window.js
 * 【文件作用】「悬浮游戏与应用窗口」功能模块 —— 负责全站所有内嵌应用、模拟器游戏、3D 模型与精神角落博客的窗口调度。
 *
 * 【在页面哪里能看到它？】
 *   当你在「文件下载」、「娱乐游戏」、「3D 模型」或顶栏「精神角落」点击任意卡片的 `OPEN` / `PLAY` / `VIEW` 时，
 *   屏幕中央会弹出一个带有红黄绿三色交通灯按钮的毛玻璃大窗口，里面通过 `<iframe>` 运行对应的网页或模拟器。
 *
 * 【这个窗口的红、黄、绿三个按钮分别做什么？】
 *   · 红色按钮（closeGame）     ：彻底关闭窗口。关闭前会自动通知里面的游戏模拟器「立即保存存档」，
 *                                 然后播放窗口收缩动画，700 毫秒后彻底卸载 `<iframe>` 释放内存。
 *   · 黄色按钮（minimizeGame）  ：最小化隐藏窗口。注意！它只是把窗口藏起来，里面的游戏或应用还在后台运行，
 *                                 当你再次点击同一个卡片打开时，会瞬间恢复原状，不会丢失当前进度！
 *   · 绿色按钮（toggleFullscreen）：让整个游戏窗口进入或退出浏览器全屏模式。
 *
 * 【片头开机视频（Video Intro）是怎么工作的？】
 *   如果某个卡片配置了 `video` 属性（比如在 `assets/js/app/data/resources.js` 里配置了片头 mp4），
 *   打开窗口时会在最上层先播放这段片头动画，同时底下的 `<iframe>` 在后台静默加载；
 *   片头播完（或用户随手点一下屏幕跳过）后，视频层消失，底下的应用正好已经加载完毕，无缝衔接！
 * ==========================================================================================
 */
(function (TK) {
    'use strict';

    // 从 Vue 中解构响应式工具：
    //   ref       ：创建响应式变量
    //   nextTick  ：等待 Vue 把页面 DOM 更新完毕后再执行回调
    //   onMounted ：当网页挂载完成后执行一次
    const {ref, nextTick, onMounted} = Vue;

    /**
     * 点击红色关闭按钮后，等待窗口关闭缩放动画（CSS `.game-pop-leave-active`，时长 500ms）
     * 完全结束、再把底层 `<iframe>` 从 DOM 中销毁的延迟毫秒数（700ms 留足余量，避免动画途中画面突然白屏）。
     */
    const UNMOUNT_DELAY_MS = 700;

    /** 获取当前页面里的游戏窗口 `<iframe>` 元素 */
    const getGameFrame = () => document.querySelector('iframe');

    /** 如果当前浏览器正处于全屏状态，安全地退出全屏（忽略可能产生的权限报错） */
    const exitFullscreenIfNeeded = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {
            });
        }
    };

    TK.composables.useGameWindow = function useGameWindow() {
        // ======================================================================================
        // 一、窗口核心状态变量
        // ======================================================================================

        /**
         * 当前挂载在窗口里的应用信息对象：`{ title: '窗口标题', url: '内嵌网页地址' }`。
         * 当为 `null` 时，`<iframe>` 会被完全销毁，不占用任何内存与 CPU。
         */
        const activeGame = ref(null);

        /**
         * 窗口当前是否显示在屏幕上：
         *   · true  ：窗口可见
         *   · false ：窗口隐藏（如果此时 `activeGame` 不为 null，说明处于「最小化挂起」状态）
         */
        const isGameVisible = ref(false);

        /** 绑定到 `index.html` 中游戏窗口最外层容器 `<div ref="gameWindowRef">` 的引用，用于请求全屏 */
        const gameWindowRef = ref(null);

        // ======================================================================================
        // 二、片头过渡视频（Video Intro）状态变量
        // ======================================================================================

        /** 当前是否正在播放片头过渡视频（true 时视频层盖在 iframe 上方） */
        const isVideoIntroPlaying = ref(false);

        /** 当前片头视频的文件路径（如 `'videos/intro.mp4'`） */
        const currentIntroVideo = ref('');

        /** 绑定到 `<video ref="introVideoRef">` 元素的引用，用于手动控制暂停 */
        const introVideoRef = ref(null);

        // ======================================================================================
        // 三、内部辅助函数（视频暂停与键盘焦点同步）
        // ======================================================================================

        /** 安全地暂停片头视频播放 */
        const pauseIntroVideo = () => {
            if (!introVideoRef.value) return;
            try {
                introVideoRef.value.pause();
            } catch (e) {
                // 如果视频节点已经被 Vue 卸载，忽略即可
            }
        };

        /**
         * 把浏览器的键盘焦点交给 `<iframe>` 内部页面。
         * 为什么要做这一步？
         * 因为像 GBA/NES 游戏模拟器需要用键盘按键操作；如果焦点还停留在外层网页的按钮上，
         * 用户按方向键或回车键时游戏里会没反应。所以窗口一打开，我们就主动把焦点塞进 iframe 里。
         */
        const focusGameFrame = () => {
            nextTick(() => {
                const frame = getGameFrame();
                if (!frame) return;
                try {
                    frame.focus();
                    // 向子页面（如 games/emulator.html）发送一条暗号，让模拟器内部也主动抢回焦点
                    frame.contentWindow.postMessage('focus-emulator', '*');
                } catch (e) {
                    // 如果内嵌的是外部跨域网站，浏览器安全策略不允许访问 contentWindow，直接忽略即可
                }
            });
        };

        /**
         * 结束（或点击跳过）片头视频：隐藏视频遮罩层、暂停视频播放，并把键盘焦点交给底下的游戏 iframe。
         */
        const finishVideoIntro = () => {
            isVideoIntroPlaying.value = false;
            pauseIntroVideo();
            focusGameFrame();
        };

        // ======================================================================================
        // 四、窗口打开 / 最小化 / 关闭 / 全屏 四大操作方法
        // ======================================================================================

        /**
         * 打开一个游戏、应用、3D 模型或网页窗口。
         *
         * @param {string}      gameTitle 窗口顶部中间显示的标题文字（如 `'超级马里奥'`）
         * @param {string}      targetUrl 窗口内部 `<iframe>` 要加载的网页路径（如 `'games/emulator.html?rom=...'`）
         * @param {string|null} [videoUrl=null] 可选的片头视频路径；如果传了，会先播放片头动画
         */
        const openGame = (gameTitle, targetUrl, videoUrl = null) => {
            // 1. 判断是否需要播放片头视频
            if (videoUrl) {
                currentIntroVideo.value = videoUrl;
                isVideoIntroPlaying.value = true;
            } else {
                currentIntroVideo.value = '';
                isVideoIntroPlaying.value = false;
            }

            // 2. 如果当前没有打开任何应用，或者新打开的地址跟刚才最小化的地址不同，才替换 activeGame；
            //    如果地址完全一样（说明用户只是把刚才最小化的同一个游戏重新点开），保留原 iframe 不刷新！
            if (!activeGame.value || activeGame.value.url !== targetUrl) {
                activeGame.value = {title: gameTitle, url: targetUrl};
            }

            // 3. 显示窗口
            isGameVisible.value = true;

            // 4. 如果没有片头视频，立刻把键盘焦点交给 iframe（有片头视频时，等视频播完在 finishVideoIntro 里聚焦）
            if (!videoUrl) focusGameFrame();
        };

        /**
         * 点击黄色按钮「最小化窗口」：
         * 只把窗口隐藏并退出全屏，绝不清空 `activeGame`，让游戏在后台继续保活。
         */
        const minimizeGame = () => {
            isGameVisible.value = false;
            pauseIntroVideo();
            exitFullscreenIfNeeded();
        };

        /**
         * 点击红色按钮「彻底关闭窗口」：
         *   1. 如果子页面是我们的复古模拟器（带有 `__tukuaiSaveNow` 函数），先通知它立刻把游戏进度存进数据库；
         *   2. 隐藏窗口、停止片头视频、退出全屏；
         *   3. 等待 700ms 窗口收缩动画播放完毕后，将 `activeGame` 设为 `null`，彻底销毁 `<iframe>` 释放内存。
         */
        const closeGame = () => {
            try {
                const frame = getGameFrame();
                if (frame && frame.contentWindow && frame.contentWindow.__tukuaiSaveNow) {
                    frame.contentWindow.__tukuaiSaveNow();
                }
            } catch (e) {
                // 非同源页面或普通工具页没有存档钩子，直接忽略
            }
            isGameVisible.value = false;
            finishVideoIntro();
            exitFullscreenIfNeeded();

            setTimeout(() => {
                activeGame.value = null;
            }, UNMOUNT_DELAY_MS);
        };

        /**
         * 点击绿色按钮「切换全屏」：
         * 如果还没全屏，就让整个游戏窗口（包含顶部标题栏）进入全屏；如果已经全屏，就退出全屏。
         */
        const toggleFullscreen = () => {
            if (!document.fullscreenElement) {
                if (gameWindowRef.value) {
                    gameWindowRef.value.requestFullscreen().catch((err) => {
                        console.warn('全屏请求被阻止:', err);
                    });
                }
            } else {
                document.exitFullscreen();
            }
        };

        // 监听来自子页面（如模拟器 `games/emulator.html`）发来的 `'emulator-ready'` 消息：
        // 当模拟器内核加载完毕准备好接收按键时，主动把键盘焦点同步给 iframe。
        onMounted(() => {
            window.addEventListener('message', (event) => {
                if (event.data !== 'emulator-ready') return;
                const frame = getGameFrame();
                if (frame) {
                    frame.focus();
                    console.log('收到模拟器加载完毕信号，焦点已同步。');
                }
            });
        });

        // 导出给 main.js 挂载到模板
        return {
            activeGame, gameWindowRef, isGameVisible,
            isVideoIntroPlaying, currentIntroVideo, introVideoRef,
            openGame, minimizeGame, closeGame, toggleFullscreen, finishVideoIntro
        };
    };
})(window.TuKuai);
