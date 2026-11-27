/**
 * ============================================================================
 * 文件路径：assets/js/app/composables/use-boot-sequence.js
 * 文件作用：【开机 Windows PowerShell 终端“黑客帝国矩阵解码”打字动画】
 * ============================================================================
 *
 * 【工作逻辑（与 Cookie 授权严格联动）】
 *   1. 首次访问，或上次在 `SYSTEM ALERT` 中点击了「拒绝~」（本地无 `tukuai_cookie_consent=accepted` Cookie）：
 *      - `isBooted` 初始为 `false`，全屏显示黑底毛玻璃 + 蓝色 Windows PowerShell 终端窗口；
 *      - 命令行 `PS C:\Users\土块>` 后的目标命令 `'irm xn--udsye.art|iex'` 从随机乱码逐字锁定；
 *      - 解码完毕停留 0.8 秒后将当前会话的 `isBooted` 置为 `true` 进入主界面（绝不在用户同意前私自写本地存储）。
 *
 *   2. 已点击「同意！」授权过 Cookie 的访客再次打开或刷新页面：
 *      - 检测到 `hasCookieConsent.value === true`，直接跳过开场控制台动画，秒进主界面！
 */
(function (TK) {
    'use strict';

    const {ref, onMounted} = Vue;

    /** 乱码翻滚时随机抽取的字符库（纯小写字母 + 数字 + 命令行符号，最贴近真实终端的黑客解码感） */
    const SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-.|';
    /** 乱码每多少毫秒翻滚刷新一次（40ms = 每秒翻滚 25 次） */
    const TICK_MS = 40;
    /** 每次翻滚推进多少个锁定字符：`1 / 3` 代表每翻滚 3 次（即 120ms）锁定 1 个真实字母 */
    const LOCK_PER_TICK = 1 / 3;
    /** 整行命令全部解码完成后，停留展示多少毫秒再切入主系统界面（800ms = 0.8 秒） */
    const HOLD_AFTER_DECODE_MS = 800;

    /**
     * @param {Vue.Ref<boolean>} hasCookieConsent 用户是否已在本地 Cookie 中完成授权
     */
    TK.composables.useBootSequence = function useBootSequence(hasCookieConsent) {
        const targetText = TK.config.bootCommand; // 目标命令：'irm xn--udsye.art|iex'

        /** 仅当本地 Cookie 已授权时才跳过开场控制台动画 */
        const isBooted = ref(Boolean(hasCookieConsent && hasCookieConsent.value));
        /** PowerShell 命令行当前显示的文字：已授权老访客直接填充完整命令，其余从空字符串开始解码 */
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
            if (isBooted.value) return;

            let lockedCount = 0;
            const timer = setInterval(() => {
                typedText.value = scramble(lockedCount);

                // 所有字符锁定完成后：停止定时器 -> 停留 0.8 秒 -> 切入主界面（是否记住跳过状态完全交由 Cookie 授权决定）
                if (lockedCount >= targetText.length) {
                    clearInterval(timer);
                    setTimeout(() => {
                        isBooted.value = true;
                    }, HOLD_AFTER_DECODE_MS);
                }
                lockedCount += LOCK_PER_TICK;
            }, TICK_MS);
        });

        return {isBooted, typedText};
    };

})(window.TuKuai);
