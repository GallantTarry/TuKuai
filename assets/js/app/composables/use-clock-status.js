/**
 * ============================================================================
 * 文件路径：assets/js/app/composables/use-clock-status.js
 * 文件作用：【实时电子时钟】与【土块 24 小时作息状态 & 像素小人头像自动切换】
 * ============================================================================
 *
 * 【通俗理解：这个文件管页面上的哪三样东西？】
 *   1. 页面右上角（手机端在头部右侧）跳动的电子表 `currentTime`（格式 `HH:MM:SS`，每秒跳一下）
 *   2. 左侧边栏头像旁边的 `now: xxx` 当前状态文字 `currentStatus`（比如 `coding`、`smoking`、`gaming`）
 *   3. 左侧边栏（以及微信收款码正中间）的像素小人头像 `currentAvatarSvg`（跟着状态自动换图：睡觉换睡觉小人、写代码换敲键盘小人、抽烟换抽烟小人……）
 *
 * 【想修改作息时间段或换头像图片去哪里改？】
 *   - 想改几点到几点干什么：去 `assets/js/app/data/content.js` 改 `TK.data.statusSchedule`
 *   - 想改每个状态对应的 SVG 头像路径：去 `assets/js/app/data/media.js` 改 `TK.data.avatarByStatus`
 */
(function (TK) {
    'use strict';

    const {ref, computed, onMounted} = Vue;

    /**
     * 根据当前的“小时数”（0 ~ 23），去作息时间表里查出土块现在处于什么状态
     *
     * @param {number} hour 当前小时（0 代表午夜 0 点，18 代表傍晚 6 点，23 代表晚上 11 点）
     * @returns {string} 返回对应的英文状态名（如 `'sleeping'`、`'coding'`、`'smoking'`、`'gaming'`）
     */
    function getStatusByHour(hour) {
        // 从上往下找第一条满足 `hour < until` 的时间段
        const slot = TK.data.statusSchedule.find((s) => hour < s.until);
        // 找到了就返回它的 status；如果全都不满足（即 21:00 ~ 23:59），返回默认状态 `'gaming'`
        return slot ? slot.status : TK.data.defaultStatus;
    }

    TK.composables.useClockStatus = function useClockStatus() {
        /** 实时时间字符串，初始值为 `'00:00:00'`，页面一挂载就会立刻更新为当前真实时间 */
        const currentTime = ref('00:00:00');
        /** 当前作息状态，初始值为占位符 `'...'`，页面一挂载就会立刻根据当前几点钟算出来 */
        const currentStatus = ref('...');

        /**
         * 根据当前的 `currentStatus`，自动去 `TK.data.avatarByStatus` 字典里查出对应的 SVG 头像文件路径。
         * 如果刚打开网页状态还是 `'...'` 查不到，就用 `TK.data.defaultAvatar`（抽烟小人）保底。
         */
        const currentAvatarSvg = computed(() => TK.data.avatarByStatus[currentStatus.value] || TK.data.defaultAvatar);

        /**
         * 刷新一次时钟和状态（每秒钟会被定时器调用一次）：
         * 1. `new Date()` 获取用户电脑/手机此刻的系统时间
         * 2. 分别取出小时 `getHours()`、分钟 `getMinutes()`、秒 `getSeconds()`，用 `pad2` 补齐成两位数拼成 `"HH:MM:SS"`
         * 3. 把当前小时数传给 `getStatusByHour` 算出当前作息状态
         */
        const updateClock = () => {
            const now = new Date();
            const {pad2} = TK.utils;
            currentTime.value = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
            currentStatus.value = getStatusByHour(now.getHours());
        };

        // 当网页 DOM 挂载完成后：
        // 1. 先立刻执行一次 `updateClock()`，别让用户干等第 1 秒结束才看到时间
        // 2. 开启 `setInterval(updateClock, 1000)`，每隔 1000 毫秒（1 秒）刷新一次
        onMounted(() => {
            updateClock();
            setInterval(updateClock, 1000);
        });

        return {currentTime, currentStatus, currentAvatarSvg};
    };

})(window.TuKuai);
