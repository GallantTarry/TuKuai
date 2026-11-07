/**
 * ============================================================================
 * 文件路径：assets/js/app/composables/use-theme.js
 * 文件作用：【全站动态霓虹主题色引擎】—— 让全站颜色跟随当前选中的导航板块实时变色
 * ============================================================================
 *
 * 【通俗理解：这个文件是怎么让全站变色的？】
 * 当你点击左侧导航栏的不同按钮（比如点「我的简介」是天蓝 `#38bdf8`，点「在线使用」是赛博绿 `#4ade80`，点「复古游戏」是街机红 `#ef4444`），
 * 这个函数会自动根据当前板块的 ID（`currentTab`），去菜单配置（`menuItems`）里找出对应的十六进制颜色码，
 * 然后实时算出 3 个颜色值：
 *   1. `activeColor`（主色，100% 不透明）     -> 例如 `#38bdf8`
 *   2. `activeGlow` （发光色，50% 半透明）    -> 例如 `rgba(56, 189, 248, 0.5)`，专门用来做霓虹发光阴影 `box-shadow` / `text-shadow`
 *   3. `activeBg`   （背景底色，15% 极淡透明） -> 例如 `rgba(56, 189, 248, 0.15)`，专门用来给选中的导航按钮铺一层淡淡的底色
 *
 * 最后，它把这 3 个颜色打包成 `cssVars`（包含 `--theme-color`、`--theme-glow`、`--theme-bg` 三个 CSS 变量），
 * 绑定在 `index.html` 最外层的 `<div id="app" :style="cssVars">` 上。
 * 这样一来，无论在 HTML 还是 `css/style.css` 里，只要写了 `var(--theme-color)`，颜色就会全自动跟着板块切换！
 */
(function (TK) {
    'use strict';

    const {computed} = Vue;

    /**
     * @param {Vue.Ref<Array<{id: string, color: string}>>} menuItems 左侧导航栏菜单数组（来自 `data/menu.js`）
     * @param {Vue.Ref<string>} currentTab 当前选中的板块代号（如 `'about'`、`'games'`）
     */
    TK.composables.useTheme = function useTheme(menuItems, currentTab) {

        /**
         * 1. 计算当前板块的【主色】（`activeColor`）：
         * 用 `.find(...)` 在菜单数组里找哪一项的 `id` 等于当前的 `currentTab.value`。
         * 找到了就返回它的 `color`；万一没找到就返回默认天蓝色 `TK.data.defaultThemeColor`。
         */
        const activeColor = computed(() => {
            const item = menuItems.value.find((i) => i.id === currentTab.value);
            return item ? item.color : TK.data.defaultThemeColor;
        });

        /**
         * 2. 计算当前板块的【50% 发光阴影色】（`activeGlow`）：
         * 先用 `TK.utils.hexToRgb` 把 `#38bdf8` 转成 `"56, 189, 248"`，再拼成 `"rgba(56, 189, 248, 0.5)"`
         */
        const activeGlow = computed(() => `rgba(${TK.utils.hexToRgb(activeColor.value)}, 0.5)`);

        /**
         * 3. 计算当前板块的【15% 极淡背景色】（`activeBg`）：
         * 同理，拼成 `"rgba(56, 189, 248, 0.15)"`
         */
        const activeBg = computed(() => `rgba(${TK.utils.hexToRgb(activeColor.value)}, 0.15)`);

        /**
         * 4. 打包成绑定给 `<div id="app" :style="cssVars">` 的 CSS 自定义属性（CSS 变量）对象
         */
        const cssVars = computed(() => ({
            '--theme-color': activeColor.value,
            '--theme-glow':  activeGlow.value,
            '--theme-bg':    activeBg.value
        }));

        return {activeColor, activeGlow, cssVars};
    };

})(window.TuKuai);
