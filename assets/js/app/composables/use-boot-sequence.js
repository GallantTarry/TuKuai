/**
 * ============================================================================
 * 文件路径：assets/js/app/composables/use-boot-sequence.js
 * 文件作用：【开机 Windows PowerShell 终端“黑客帝国矩阵解码”打字动画】
 * ============================================================================
 *
 * 【通俗理解：开机那个蓝底 PowerShell 窗口是怎么工作的？】
 *   1. 当一个新访客**第一次**打开你的网站时（浏览器 `localStorage` 里还没有 `'os_booted'` 记录）：
 *      - `isBooted` 初始为 `false`，全屏显示黑底毛玻璃 + 蓝色 Windows PowerShell 窗口。
 *      - 命令行 `PS C:\Users\土块>` 后面的文字（目标命令是 `'irm xn--udsye.art|iex'`，共 21 个字符）
 *        一开始全是一串高速乱滚的随机乱码字符；
 *      - 每隔 40 毫秒刷新一次乱码，每刷新 3 次就从左往右“锁定” 1 个真实字符；
 *      - 当 21 个字符全部锁定成 `'irm xn--udsye.art|iex'` 后，停留 0.8 秒让用户看清这行命令，
 *        然后把 `isBooted` 设为 `true`（PowerShell 窗口平滑淡出、主系统界面平滑浮现），
 *        同时在浏览器 `localStorage` 里记下 `os_booted = 'true'`。
 *
 *   2. 当这位访客**以后再次打开或刷新**你的网站时：
 *      - 程序一检查发现 `localStorage` 里已经有 `os_booted === 'true'` 了，
 *      - 就直接跳过开机动画，秒进主界面，不耽误老访客的时间！
 *
 * 【小贴士：如果你自己调试时想重新看一遍开机动画怎么办？】
 *   按 `F12` 打开浏览器开发者工具 -> 切到 `Application`（应用）面板 -> 左侧 `Local Storage` -> 删掉 `os_booted` 这一项，再刷新网页就能重看开机动画了！
 */
(function (TK) {
    'use strict';

    const {ref, onMounted} = Vue;

    /** 乱码翻滚时随机抽取的字符库（纯小写字母 + 数字 + 命令行符号，最贴近真实终端的黑客解码感） */
    const SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-.|';
    /** 乱码每多少毫秒翻滚刷新一次（40ms = 每秒翻滚 25 次） */
    const TICK_MS = 40;
    /** 每次翻滚推进多少个锁定字符：`1 / 3` 代表每翻滚 3 次（即 120ms）锁定 1 个真实字母。想加快开机速度可以把 `3` 改小 */
    const LOCK_PER_TICK = 1 / 3;
    /** 整行命令全部解码完成后，停留展示多少毫秒再切入主系统界面（800ms = 0.8 秒） */
    const HOLD_AFTER_DECODE_MS = 800;

    TK.composables.useBootSequence = function useBootSequence() {
        const targetText = TK.config.bootCommand;     // 目标命令：'irm xn--udsye.art|iex'
        const bootedKey = TK.config.storageKeys.booted; // 本地存储键名：'os_booted'

        /** 是否已经完成开机（去 localStorage 里查是不是已经存过 `'true'`） */
        const isBooted = ref(localStorage.getItem(bootedKey) === 'true');
        /** PowerShell 命令行当前显示的文字：老用户直接显示完整命令，新用户从空字符串开始 */
        const typedText = ref(isBooted.value ? targetText : '');

        /**
         * 生成当前这一帧应该显示的解码字符串：
         * 把目标命令拆成单个字符，前 `lockedCount` 个位置直接显示真实字符，后面的位置全部随机抽一个乱码字符顶替
         */
        const scramble = (lockedCount) => targetText
            .split('')
            .map((letter, index) => index < lockedCount
                ? letter
                : SCRAMBLE_CHARS[TK.utils.randomIndex(SCRAMBLE_CHARS.length)])
            .join('');

        onMounted(() => {
            // 如果已经是开机过的老访客，直接跳过，什么都不用做
            if (isBooted.value) return;

            let lockedCount = 0;
            const timer = setInterval(() => {
                // 更新终端上显示的文字
                typedText.value = scramble(lockedCount);

                // 当所有字符都已经锁定为真实字符时：停止乱码定时器 -> 停留 0.8 秒 -> 切入系统并写入缓存记录
                if (lockedCount >= targetText.length) {
                    clearInterval(timer);
                    setTimeout(() => {
                        isBooted.value = true;
                        localStorage.setItem(bootedKey, 'true');
                    }, HOLD_AFTER_DECODE_MS);
                }
                lockedCount += LOCK_PER_TICK;
            }, TICK_MS);
        });

        return {isBooted, typedText};
    };

})(window.TuKuai);
