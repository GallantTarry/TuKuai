/**
 * ==========================================================================================
 * 【文件名称】title-marquee.js
 * 【文件作用】浏览器顶部标签页「标题跑马灯」模块。
 *
 * 【在页面哪里能看到它？】
 *   看浏览器最顶部的标签页标题栏（平时写着 `少侠别走`）：
 *   1. 当你切换到别的浏览器标签页（或最小化浏览器）时：
 *      标题会立刻变成一段小型大写字母的诗篇（内容在 `assets/js/app/data/content.js` 的 `titleVerse` 中），
 *      并且像电子广告牌一样，每隔 200 毫秒向左滚动一个字符！
 *   2. 当你切回本网页时：
 *      滚动立即停止，标题先温柔地显示 `"· ᴀᴍᴇɴ ·"`，停留 2.5 秒后自动恢复为原来的 `"少侠别走"`。
 *
 * 【为什么要动用 Web Worker 多线程来计时？（关键技术细节）】
 *   现代浏览器（Chrome / Edge / Safari）为了省电，一旦发现某个网页被切到了后台，
 *   就会把网页主线程里的 `setInterval` 定时器强行降频到「最少 1000 毫秒（1秒）才执行一次」，
 *   如果直接在主线程里写定时器，后台标签页的标题跑马灯就会一卡一卡的。
 *   而独立线程 **Web Worker** 里的定时器不受这个后台降频限制！
 *   所以我们把「每 200ms 喊一次 tick」的秒表放进内联 Web Worker 里，让后台标题滚动依然如丝般顺滑。
 * ==========================================================================================
 */
(function (TK) {
    'use strict';

    // ==========================================================================================
    // 一、跑马灯可调参数常量
    // ==========================================================================================

    /** 标题文字向左滚动一格的时间间隔（200 毫秒 = 每秒滚动 5 个字符） */
    const SCROLL_INTERVAL_MS = 200;

    /** 用户切回本页面后，`"· ᴀᴍᴇɴ ·"` 停留多久再恢复成 `"少侠别走"`（2500 毫秒 = 2.5 秒） */
    const RESTORE_DELAY_MS = 2500;

    /** 用户刚切回本页面时短暂显示的欢迎语标题 */
    const WELCOME_BACK_TITLE = '· ᴀᴍᴇɴ ·';

    /**
     * Web Worker 独立线程内部运行的迷你脚本代码（用字符串写成，后面通过 Blob 动态创建，无需单独建文件）：
     *   · 当收到主线程发来的 `'start'` 指令时：启动每 200ms 一次的定时器，向主线程发送 `'tick'` 节拍信号；
     *   · 当收到主线程发来的 `'stop'` 指令时：清除定时器。
     */
    const WORKER_SOURCE = `
        let timer;
        self.onmessage = function (e) {
            if (e.data === 'start') {
                timer = setInterval(() => self.postMessage('tick'), ${SCROLL_INTERVAL_MS});
            } else if (e.data === 'stop') {
                clearInterval(timer);
            }
        };
    `;

    // ==========================================================================================
    // 二、内部运行状态变量
    // ==========================================================================================

    /** 记住网页最初的原始标题（即 `<title>少侠别走</title>`），方便切回来时还原 */
    const originalTitle = document.title;

    let restoreTimer = null;              // 切回页面后 2.5 秒还原标题的定时器编号
    let worker = null;                    // 当前运行的 Web Worker 实例
    let workerBlobUrl = null;             // 为内联 Worker 生成的临时内存 URL（用完必须销毁防内存泄漏）
    let scrollingText = TK.data.titleVerse; // 当前正在滚动的诗句字符串

    // ==========================================================================================
    // 三、启动与停止跑马灯
    // ==========================================================================================

    /**
     * 当用户切走标签页（页面进入后台隐藏状态）时调用：启动标题跑马灯。
     */
    function startMarquee() {
        // 如果上次切回来时的 2.5 秒还原倒计时还没走完，先取消它
        clearTimeout(restoreTimer);

        // 重置滚动字幕为完整诗句，并立刻显示在标题栏上
        scrollingText = TK.data.titleVerse;
        document.title = scrollingText;

        // 把 WORKER_SOURCE 字符串打包成内存里的虚拟 JS 文件（Blob URL），并启动 Worker 线程
        workerBlobUrl = URL.createObjectURL(new Blob([WORKER_SOURCE], {type: 'application/javascript'}));
        worker = new Worker(workerBlobUrl);

        // 每当 Worker 发来一次 'tick'（每 200ms 一次）：
        // 把字符串的第 1 个字符切下来拼到最末尾（例如 "ABCDE" → "BCDEA"），实现无限循环左移滚动！
        worker.onmessage = () => {
            scrollingText = scrollingText.substring(1) + scrollingText[0];
            document.title = scrollingText;
        };

        // 通知 Worker 开始打节拍
        worker.postMessage('start');
    }

    /**
     * 当用户切回本标签页（页面重新可见）时调用：停止跑马灯、释放线程内存，并恢复原标题。
     */
    function stopMarquee() {
        // 1. 停止并彻底销毁 Web Worker 线程
        if (worker) {
            worker.postMessage('stop');
            worker.terminate();
            worker = null;
        }
        // 2. 释放临时创建的 Blob URL 内存地址
        if (workerBlobUrl) {
            URL.revokeObjectURL(workerBlobUrl);
            workerBlobUrl = null;
        }

        // 3. 标题先变成 "· ᴀᴍᴇɴ ·"，2.5 秒后恢复为 "少侠别走"
        document.title = WELCOME_BACK_TITLE;
        restoreTimer = setTimeout(() => {
            document.title = originalTitle;
        }, RESTORE_DELAY_MS);
    }

    // 监听浏览器标签页的「可见性变化（visibilitychange）」事件：
    // document.hidden 为 true 表示用户切走了，为 false 表示用户切回来了。
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) startMarquee();
        else stopMarquee();
    });
})(window.TuKuai);
