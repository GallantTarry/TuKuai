/**
 * ==========================================================================================
 * 【文件名称】service-worker.js
 * 【文件作用】注册全站离线缓存与加速引擎（PWA Service Worker，指向根目录下的 `./sw.js`）。
 *
 * 【什么是 Service Worker？它有什么用？】
 *   Service Worker 是浏览器在后台运行的一个「本地缓存管家」（核心代码在项目根目录的 `sw.js`）：
 *   · 它会把网页用到的字体、图标、音频、3D 模型和游戏 ROM 自动缓存在用户的浏览器里，
 *     下次再打开网站时几乎「秒开」，甚至断网也能浏览基础页面；
 *   · 当你在 GitHub 更新了网站代码并修改了 `sw.js` 里的版本号后，
 *     这里的逻辑会自动检测到新版本，并在后台更新完成后自动帮老访客刷新一次页面，让他们立刻看到最新内容！
 *
 * 【为什么要有 `isFirstInstall`（是否首次安装）的判断？】
 *   如果一个新访客是人生第一次打开本网站，Service Worker 也会经历 `installing → activated`（激活）的过程。
 *   此时他的页面本来就已经是最新的了，绝对不能触发 `window.location.reload()` 强制刷新，
 *   否则新访客正看着开机动画呢，页面突然白屏闪一下重头再来，体验会很差。
 *   所以只有当「老访客后台升级新版本（`!isFirstInstall`）」时，才执行热重载刷新！
 * ==========================================================================================
 */
(function () {
    'use strict';

    // 如果当前浏览器不支持 Service Worker（例如非常老旧的浏览器或某些特殊无痕环境），直接跳过
    if (!('serviceWorker' in navigator)) return;

    // 等待页面主要资源全部加载完毕（window load）后再去注册 Service Worker，
    // 避免与首屏的图片、字体和音频争抢网络带宽。
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('Tukuai OS 核心管家已接管系统. 作用域:', registration.scope);

                // 判断此刻页面是否已经被旧的 Service Worker 控制：
                // 如果 controller 为 null，说明这是用户第一次访问本站（首次安装）
                const isFirstInstall = !navigator.serviceWorker.controller;

                // 监听「发现后台新版本（updatefound）」事件
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        // 当新版管家已经完全激活（activated），且用户是老访客（!isFirstInstall）时，
                        // 自动刷新页面以应用最新代码与资源
                        if (newWorker.state === 'activated' && !isFirstInstall) {
                            console.log('检测到核心引擎更新，系统正在热重载...');
                            window.location.reload();
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('核心管家唤醒失败:', error);
            });
    });
})();
