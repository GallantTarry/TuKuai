/**
 * ============================================================================
 * 文件路径：assets/js/app/utils/helpers.js
 * 文件作用：全站通用的【小工具函数库】（挂载在 `TuKuai.utils` 上）
 * ============================================================================
 *
 * 【通俗理解：这个文件是干嘛的？】
 * 这里放的都是一些“给个输入、算个输出”的小工具（比如：生成随机数、把秒数变成 `03:45`、把颜色代码转成 RGB 数字等）。
 * 因为音乐播放器、画板、时钟、粒子特效等多个地方都要用到这些计算，
 * 所以把它们集中写在这里，哪个模块需要就直接调用 `TK.utils.xxx()`，不用每个文件重复抄一遍。
 */
(function (TK) {
    'use strict';

    /**
     * 工具 1：生成一个从 `0` 到 `length - 1` 之间的随机整数（专门用来当数组的随机下标）
     *
     * 【原理解释】
     * - `Math.random()` 会生成一个 `0`（含）到 `1`（不含）之间的随机小数，比如 `0.623`
     * - 乘以数组长度 `length`（比如有 10 首歌，就是 `0.623 * 10 = 6.23`）
     * - `Math.floor(...)` 会向下取整（砍掉小数点后面的部分），得到整数 `6`
     * - 这样得到的整数一定在 `0 ~ 9` 之间，正好对应数组第 1 项到第 10 项的下标！
     *
     * @param {number} length 数组的长度（比如歌单有 52 首歌，就传 52）
     * @returns {number} 返回 `0` 到 `length - 1` 的随机整数
     */
    function randomIndex(length) {
        return Math.floor(Math.random() * length);
    }

    /**
     * 工具 2：从任意数组里随机挑出一项并返回
     *
     * 【使用举例】
     * - 从 6 张背景图里随机抽一张：`TK.utils.randomItem(TK.data.backgrounds)`
     * - 从 12 张小电视 GIF 里随机抽一张：`TK.utils.randomItem(TK.data.tvGifs)`
     * - 从聊天气泡词库里随机抽一句问候语：`TK.utils.randomItem(TK.data.bubbleGreetings)`
     *
     * @template T
     * @param {T[]} list 要随机抽取的数组（不能为空数组）
     * @returns {T} 数组里被随机抽中的那一项
     */
    function randomItem(list) {
        return list[randomIndex(list.length)];
    }

    /**
     * 工具 3：把一位数的数字前面补上 `0`，凑够两位数（如果本来就是两位数则原样不动）
     *
     * 【使用举例】
     * - `pad2(5)`  -> 返回字符串 `"05"`
     * - `pad2(18)` -> 返回字符串 `"18"`
     *
     * 【原理解释】
     * - `String(value)` 先把数字变成字符串（比如 `5` -> `"5"`）
     * - `.padStart(2, '0')` 是 JS 自带的字符串方法：意思是“如果总长度不到 2 位，就在开头补 `'0'` 直到满 2 位”
     *
     * @param {number} value 要补零的数字（比如小时、分钟、秒）
     * @returns {string} 补零后的两位字符串
     */
    function pad2(value) {
        return String(value).padStart(2, '0');
    }

    /**
     * 工具 4：把音频的“总秒数”转换成播放器上显示的 `"分:秒"` 格式（如 `"03:25"`）
     *
     * 【使用举例】
     * - `formatTime(205.8)` -> 205 秒等于 3 分 25 秒 -> 返回 `"03:25"`
     * - `formatTime(NaN)`   -> 音乐还没加载出来时秒数是 `NaN`（非数字） -> 返回兜底的 `"00:00"`
     *
     * 【原理解释】
     * - `isNaN(seconds)`：检查传进来的是不是无效数字，是的话直接返回 `"00:00"`，防止页面上出现丑陋的 `NaN:NaN`
     * - `Math.floor(seconds / 60)`：总秒数除以 60 再向下取整，得到“分钟数”
     * - `Math.floor(seconds % 60)`：`%` 是取余数符号，总秒数除以 60 剩下的余数就是“秒数”
     * - 最后用上面的 `pad2(...)` 把分钟和秒都补成两位数，中间用冒号 `:` 拼起来
     *
     * @param {number} seconds 音频秒数
     * @returns {string} 格式化后的 `"mm:ss"` 字符串
     */
    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        return `${pad2(Math.floor(seconds / 60))}:${pad2(Math.floor(seconds % 60))}`;
    }

    /**
     * 工具 5：把网页十六进制颜色代码（如 `"#38bdf8"`）转换成 RGB 三个十进制数字字符串（如 `"56, 189, 248"`）
     *
     * 【为什么需要这个转换？】
     * 菜单配置里写的主题色是 `"#38bdf8"` 这种十六进制格式，
     * 但给发光阴影加半透明效果时，CSS 需要写成 `rgba(56, 189, 248, 0.5)`。
     * 这个函数就是负责把 `#38bdf8` 拆成 `56, 189, 248` 的！
     *
     * 【原理解释】
     * 一个 6 位颜色码 `#RRGGBB`（例如 `#38bdf8`）：
     * - 第 0 位是 `#` 号
     * - 第 1~2 位 `hex.slice(1, 3)` 是红色分量 `"38"`，`parseInt("38", 16)` 把 16 进制转成 10 进制得到 `56`
     * - 第 3~4 位 `hex.slice(3, 5)` 是绿色分量 `"bd"`，转成 10 进制得到 `189`
     * - 第 5~6 位 `hex.slice(5, 7)` 是蓝色分量 `"f8"`，转成 10 进制得到 `248`
     *
     * @param {string} hex 6 位十六进制颜色字符串（必须以 `#` 开头，如 `"#38bdf8"`）
     * @returns {string} 形如 `"56, 189, 248"` 的字符串
     */
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    }

    /**
     * 工具 6：把一个数字限制在 `0` 到 `1` 之间（小于 0 按 0 算，大于 1 按 1 算）
     *
     * 【在哪里用到？】
     * 在「土块画板」里，我们要把鼠标在画布上的位置换算成 `0 ~ 1`（即 `0% ~ 100%`）的比例坐标。
     * 如果用户的鼠标不小心拖出了画布边缘，算出来的比例可能会变成负数（如 `-0.05`）或者超过 1（如 `1.08`），
     * 用 `clamp01` 夹一下，就能保证画出来的点永远不会超出画板边界。
     *
     * @param {number} value 原始数值
     * @returns {number} 限制在 `[0, 1]` 范围内的数值
     */
    function clamp01(value) {
        return Math.max(0, Math.min(1, value));
    }

    /**
     * 工具 7：让正在播放的音乐产生“拔掉电源 / 断电”式的音量渐弱效果
     *
     * 【在哪里用到？】
     * 当用户点击简介页的 5 个性格胶囊按钮（5-Phile 聚变）或底部名言（Wander Jump）准备跃迁离开本站时，
     * 如果当时正在放歌，直接硬生生掐断声音会很突兀，所以用这个函数让音量在约 0.6 秒内平滑降到 0。
     *
     * 【原理解释】
     * - `setInterval(..., 30)`：每隔 30 毫秒执行一次
     * - 每次把音量 `volume` 减去 `0.05`（HTML `<audio>` 的音量范围是 `0.0` 静音 到 `1.0` 最大）
     * - 当音量减到 `0` 或以下时，锁死为 `0` 并用 `clearInterval(timer)` 停止定时器
     *
     * @param {HTMLAudioElement} audio 页面上的 `<audio>` 音乐播放器 DOM 元素
     */
    function fadeOutAudio(audio) {
        let volume = audio.volume;
        const timer = setInterval(() => {
            volume -= 0.05;
            if (volume <= 0) {
                volume = 0;
                clearInterval(timer);
            }
            audio.volume = volume;
        }, 30);
    }

    /**
     * 工具 8：一次性取消并清空一组 `setTimeout` 定时器
     *
     * 【在哪里用到？】
     * 在 5-Phile 花瓣聚变动画里，我们连续预约了 3 个定时器（750ms 旋转、1250ms 绽放、2500ms 跳转）。
     * 如果跳转后用户按了浏览器的“后退”键回到本页，必须把这几个定时器全部取消掉，否则页面又会自动跳走。
     *
     * @param {number[]} timers 存放定时器编号的数组（执行后数组会被清空）
     */
    function clearTimers(timers) {
        timers.forEach(clearTimeout);
        timers.length = 0;
    }

    // 把上面写好的 8 个工具函数全部塞进 `TK.utils` 抽屉里，供其他文件调用
    Object.assign(TK.utils, {
        randomIndex,
        randomItem,
        pad2,
        formatTime,
        hexToRgb,
        clamp01,
        fadeOutAudio,
        clearTimers
    });
})(window.TuKuai);
