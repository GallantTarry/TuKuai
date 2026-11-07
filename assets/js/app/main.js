/**
 * ==========================================================================================
 * 【文件名称】main.js
 * 【文件作用】全站 Vue 3 应用的「总装车间（总入口）」—— 把前面所有数据、组件与功能模块组装起来，
 *             正式挂载到 `index.html` 的 `<div id="app">` 上。
 *
 * 【为什么这个入口文件这么短、这么清爽？】
 *   在重构之前，所有代码（3700 多行）全都挤在 `index.html` 一个文件里，找一行代码像大海捞针。
 *   现在我们采用了「各司其职」的模块化架构：
 *     · 要改菜单、工具、游戏、模型、歌单、文案？ → 去 `assets/js/app/data/` 文件夹下改对应的数据文件；
 *     · 要改卡片长什么样、密函弹窗怎么发？       → 去 `assets/js/app/components/` 文件夹；
 *     · 要改画板、音乐、时钟、粒子等具体功能逻辑？ → 去 `assets/js/app/composables/` 文件夹；
 *     · 要改网页整体的 HTML 骨架？               → 去 `index.html`。
 *   而本文件（`main.js`）就像一台电脑的「主板」：它自己不写具体业务细节，
 *   只负责把各个模块插到一起、通上电，并把网页模板需要用到的变量统统暴露出去！
 * ==========================================================================================
 */
(function (TK) {
    'use strict';

    // 从 Vue 全局对象中取出：
    //   createApp ：创建 Vue 应用实例的主函数
    //   ref       ：创建响应式变量
    //   onMounted ：当网页首次渲染完成时执行的生命周期钩子
    const {createApp, ref, onMounted} = Vue;

    // 取出我们在前面各个文件里挂载好的功能模块库（TK.composables）和静态数据库（TK.data）
    const {composables: use, data} = TK;

    // ==========================================================================================
    // 一、创建 Vue 根应用实例
    // ==========================================================================================
    const app = createApp({
        /**
         * `setup()` 是 Vue 3 组合式 API 的总入口函数：
         * 它在页面启动时执行一次，里面 return（返回）出来的所有变量和函数，
         * 都可以直接在 `index.html` 的 `<div id="app">` 里面通过 `{{ 变量名 }}` 或 `@click="函数名"` 使用！
         */
        setup() {
            // ----------------------------------------------------------------------------------
            // 1. 左侧导航菜单、当前激活标签页、动态霓虹主题色与随机壁纸
            // ----------------------------------------------------------------------------------
            /** 左侧 6 个导航菜单项（数据来自 `assets/js/app/data/menu.js`） */
            const menuItems = ref(data.menuItems);
            /** 当前选中的菜单标签页 ID（默认选中 `'about'` 即「我的简介」） */
            const currentTab = ref('about');
            /** 根据当前选中的标签页，自动计算出对应的主题色、发光阴影与 CSS 变量（逻辑见 `use-theme.js`） */
            const {activeColor, activeGlow, cssVars} = use.useTheme(menuItems, currentTab);

            /** 每次刷新网页时，从 `assets/js/app/data/media.js` 的壁纸池里随机抽一张作为全屏背景图 */
            const currentBg = ref(TK.utils.randomItem(data.backgrounds));

            // ----------------------------------------------------------------------------------
            // 2. 开机打字机动画 & 底部毛玻璃 Cookie 提示条
            // ----------------------------------------------------------------------------------
            /** 控制黑屏开机动画与 `"HELLO, WORLD!"` 打字机效果（逻辑见 `use-boot-sequence.js`） */
            const {isBooted, typedText} = use.useBootSequence();
            /** 开机完成后自动检查并弹出底部 Cookie 隐私提示条（逻辑见 `use-cookie-consent.js`） */
            use.useCookieConsent(isBooted);

            // ----------------------------------------------------------------------------------
            // 3. 侧边栏与顶栏：实时时钟、作息状态、像素动态头像、访客计数、状态语录气泡
            // ----------------------------------------------------------------------------------
            /** 每秒跳动的电子表、按小时切换的作息状态与 SVG 像素动态头像（逻辑见 `use-clock-status.js`） */
            const {currentTime, currentStatus, currentAvatarSvg} = use.useClockStatus();
            /** 全站独立访客数（FANS）统计（逻辑见 `use-uv-counter.js`） */
            const {siteUv} = use.useUvCounter();
            /** 头像旁每 15 秒弹出的赛博语录小气泡（逻辑见 `use-chat-bubble.js`） */
            const {showBubble, bubbleText} = use.useChatBubble(currentStatus);

            // ----------------------------------------------------------------------------------
            // 4. 全站视觉特效：星空粒子尾迹 + 卡片滚动渐显
            // ----------------------------------------------------------------------------------
            /** 自定义像素十字准星光标、鼠标彩色粒子尾迹与背景漂浮星空（逻辑见 `use-particles.js`） */
            const {particleCanvas} = use.useParticles();
            /** 卡片进入视口时的优雅上浮渐显动画（逻辑见 `use-scroll-reveal.js`） */
            use.useScrollReveal(currentTab, isBooted);

            // ----------------------------------------------------------------------------------
            // 5. 三大核心交互终端：土块画板、电子音乐播放器、内嵌游戏/应用大窗口
            // ----------------------------------------------------------------------------------
            /** 「我的简介」里的全服实时涂鸦画板（逻辑见 `use-board.js`） */
            const board = use.useBoard(currentTab);
            /** 「电子音乐」终端播放器与系统媒体控制中心（逻辑见 `use-music-player.js`） */
            const music = use.useMusicPlayer();
            /** 统一承载所有游戏、应用、3D 模型与精神角落博客的悬浮窗口（逻辑见 `use-game-window.js`） */
            const gameWindow = use.useGameWindow();

            // ----------------------------------------------------------------------------------
            // 6. 两大整页跃迁动效（跳转时都会调用 `music.fadeOutMusic` 让背景音乐平滑断电渐弱）
            // ----------------------------------------------------------------------------------
            /** 点击简介页底部名言触发的「CRT 坍缩跃迁」动效（逻辑见 `use-wander-jump.js`） */
            const wander = use.useWanderJump(music.fadeOutMusic);
            /** 点击简介页 5 个彩色胶囊触发的「五瓣花聚变旋转」动效（逻辑见 `use-phile-fusion.js`） */
            const phile = use.usePhileFusion(music.fadeOutMusic);

            // ----------------------------------------------------------------------------------
            // 7. 飞鸽传书（密函弹窗）开关
            // ----------------------------------------------------------------------------------
            /**
             * 控制「发送密函」弹窗是否显示：
             * 点击左侧边栏头像时设为 `true` 打开；弹窗内部的表单发送逻辑封装在 `components/mail-modal.js` 中。
             */
            const showMailModal = ref(false);

            // ----------------------------------------------------------------------------------
            // 8. 跨模块联动：处理浏览器「后退（bfcache 往返缓存）」返回本页时的状态还原
            // ----------------------------------------------------------------------------------
            onMounted(() => {
                // 什么是 `pageshow` 与 `event.persisted`？
                // 当用户点击了简介页的「5-Phile 胶囊」或「Wander 名言」跳转到外部博客后，
                // 如果按了浏览器的「← 后退」按钮回到本页，浏览器为了速度，不会重新刷新网页，
                // 而是把离开前最后一刻的网页快照（当时正处于黑屏坍缩或花瓣遮罩状态！）直接解冻恢复出来。
                // 所以一旦检测到 `event.persisted === true`（从缓存恢复），我们必须立刻：
                //   1. 关闭 Wander 黑屏坍缩状态并清除跳转定时器；
                //   2. 关闭 5-Phile 花瓣遮罩层并清除跳转定时器；
                //   3. 把背景音乐的音量恢复到正常值；
                //   4. 触发一次页面重绘，让画面瞬间恢复成清爽正常的模样！
                window.addEventListener('pageshow', (event) => {
                    if (!event.persisted) return;

                    wander.resetWanderJump();
                    phile.resetPhileFusion();
                    music.restoreVolume();

                    // 强制浏览器重新计算一次 body 布局，消除个别移动端浏览器从缓存恢复后的渲染残影
                    document.body.style.display = 'none';
                    void document.body.offsetHeight;
                    document.body.style.display = '';
                });
            });

            // ----------------------------------------------------------------------------------
            // 9. 把所有模板里需要用到的变量、数组和方法统一打包返回给 index.html
            // ----------------------------------------------------------------------------------
            return {
                // 导航 / 主题 / 背景
                menuItems, currentTab, cssVars, activeColor, activeGlow, currentBg,
                // 开机动画
                isBooted, typedText,
                // 侧边栏（时钟、状态、头像、粉丝数、对话气泡）
                currentTime, currentStatus, currentAvatarSvg, siteUv, showBubble, bubbleText,
                // 粒子画布引用
                particleCanvas,
                // 纯数据（顶栏「精神角落」博客地址 + 4 大资源卡片列表 + 简介页 5 个彩色胶囊配置）
                blogUrl: TK.config.links.blog,
                onlineTools: data.onlineTools,
                projects: data.projects,
                games: data.games,
                creativeWorks: data.creativeWorks,
                phileButtons: data.phileButtons,
                phileButtonBaseClass: data.phileButtonBaseClass,
                // 展开画板模块的所有属性和方法（showCanvas, toggleCanvas, boardColor 等）
                ...board,
                // 展开音乐播放器模块的所有属性和方法（audioRef, isPlaying, togglePlay 等）
                ...music,
                // 展开游戏窗口模块的所有属性和方法（activeGame, openGame, closeGame 等）
                ...gameWindow,
                // 展开两大跃迁动效模块的所有属性和方法
                ...wander,
                ...phile,
                // 密函弹窗开关
                showMailModal
            };
        }
    });

    // ==========================================================================================
    // 二、自动注册 `TK.components` 里的所有自定义组件，并将应用挂载到 `#app`
    // ==========================================================================================
    // 遍历我们在 `assets/js/app/components/` 下定义的 4 个组件（TabSection, LinkCard, LaunchCard, MailModal），
    // 注册到 Vue 应用中。注册后，在 `index.html` 里就可以直接写 `<tab-section>`、`<link-card>`、
    // `<launch-card>`、`<mail-modal>` 标签了！
    Object.entries(TK.components).forEach(([name, component]) => app.component(name, component));

    // 正式启动 Vue 应用，接管 `index.html` 中的 `<div id="app">`！
    app.mount('#app');
})(window.TuKuai);
