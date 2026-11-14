/**
 * ============================================================================
 * 文件路径：assets/js/app/components/resource-cards.js
 * 文件作用：定义全站通用的 3 个【列表与卡片复用组件】（挂载在 `TuKuai.components` 上）
 * ============================================================================
 *
 * 【通俗理解：什么是 Vue 组件？为什么要用它？】
 * 你可以把“组件”理解成我们自己发明的【新 HTML 标签（乐高积木）】。
 * 以前在 `index.html` 里，每放一个工具网址或一款游戏，都要写十几行几乎一模一样的 `<div>`、`<span>`、`<button>`，
 * 79 张卡片就是 79 遍重复代码。
 *
 * 现在，我们在本文件里把卡片的“骨架和样式”做好，注册成 3 个自定义标签：
 *   1. `<tab-section>` ：每个板块最外层的“大框”（上面一行霓虹标题 `> 在线工具`，下面一个可上下滚动的卡片列表区）
 *   2. `<link-card>`   ：「在线使用」板块专用的卡片（左边名字+简介，右边一个绿色的 `VISIT` 超链接按钮，点击在新窗口打开外链）
 *   3. `<launch-card>` ：「文件下载 / 复古游戏 / 创意空间」三个板块共用的卡片（左边图标+名字+简介，右边一个发光按钮 `OPEN` 或 `START`，点击在站内弹窗打开）
 *
 * 做好这 3 块积木后，在 `index.html` 里只需要写一行 `<launch-card v-for="game in games" ...>`，
 * Vue 就会自动拿着 `data/resources.js` 里的数据，帮我们把几十张卡片整整齐齐地印出来！
 */
(function (TK) {
    'use strict';

    // ========================================================================
    // 第一部分：抽取所有卡片共用的 Tailwind CSS 样式字符串
    // （把长长的 class 名字起个好懂的变量名，下面模板里看着清爽，以后想改卡片外观也只需改这一处）
    // ========================================================================

    /**
     * 每一张毛玻璃卡片最外层 `<div>` 的样式：
     * - `glass-card`           ：在 `css/style.css` 里定义的半透明毛玻璃背景 + 悬停上浮发光效果
     * - `p-3 md:p-4`           ：卡片内边距（手机端 12px，电脑端 16px）
     * - `flex justify-between items-center`：左右两端对齐、垂直居中（左边放文字图标，最右边放按钮）
     * - `hover:bg-white/10`    ：鼠标移上去时背景稍微变亮一点
     * - `group`                ：极其重要！给整张卡片打上“父级组”标记，这样里面的按钮写 `group-hover:opacity-100`
     *                            就能实现“鼠标移到卡片任意位置时，右边隐藏的按钮才浮现出来”的效果
     * - `transition-all`       ：所有样式变化都带平滑过渡动画
     */
    const CARD_CLASS = 'glass-card p-3 md:p-4 flex justify-between items-center hover:bg-white/10 group transition-all';

    /**
     * 卡片第一行【主标题】（如软件名、游戏名）的文字样式：
     * - `text-white font-bold`       ：纯白色、加粗
     * - `text-[11px] md:text-sm`     ：手机端字号 11px，电脑端 14px
     * - `tracking-wide`              ：字间距稍微拉开一点，更有呼吸感
     * - `truncate`                   ：如果名字太长超出宽度，自动在末尾变成省略号 `...`，绝不换行撑破卡片
     */
    const NAME_CLASS = 'text-white font-bold text-[11px] md:text-sm tracking-wide truncate';

    /**
     * 卡片第二行【副标题】（如简介、`DIR: xxx.gba`）的文字样式：
     * - `text-gray-400`              ：浅灰色，与第一行的白色主标题拉开主次层次
     * - `text-[9px] md:text-[10px]`  ：手机端 9px，电脑端 10px
     * - `mt-1 truncate`              ：与第一行拉开 4px 上边距，超长同样自动省略号 `...`
     */
    const DESC_CLASS = 'text-gray-400 text-[9px] md:text-[10px] mt-1 truncate';

    /**
     * 卡片左侧【图标黑方框】的基础样式（用于放 Emoji 图标）：
     * - `w-10 h-10`                  ：宽高固定 40px × 40px 的正方形
     * - `bg-black/40 rounded-xl`     ：40% 透明度的黑底、12px 圆角
     * - `border border-white/10`     ：一圈淡淡的 10% 白色描边
     * - `flex items-center justify-center`：让里面的图标水平垂直正居中
     * - `shrink-0`                   ：禁止被右边长文字挤压变形（霸体属性）
     */
    const ICON_BOX_CLASS = 'w-10 h-10 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center shrink-0';

    /**
     * 卡片左侧【图标黑方框】放 `.ico` 图片时的样式：
     * 在上面 `ICON_BOX_CLASS` 的基础上，多加了 `overflow-hidden`（裁掉超出圆角的部分）和 `shadow-inner`（内阴影立体感）
     */
    const ICON_BOX_IMAGE_CLASS = ICON_BOX_CLASS + ' overflow-hidden shadow-inner';

    /**
     * 卡片最右侧【操作按钮（VISIT / OPEN / START）】的通用基础样式（跟颜色无关的部分）：
     * - `hover:text-[#050505]`                        ：鼠标指到按钮上时，按钮背景会填满亮色，所以文字变成深黑色 `#050505` 形成高对比度
     * - `text-[10px] md:text-xs font-mono font-bold`  ：字号、等宽字体、加粗
     * - `opacity-0 group-hover:opacity-100`           ：平时完全透明隐身（`opacity-0`），当鼠标移到整张卡片上时才显现（`group-hover:opacity-100`）
     * - `transition-all duration-300`                 ：0.3 秒平滑渐变
     * - `shrink-0 whitespace-nowrap`                  ：禁止按钮被挤压变形、禁止按钮文字换行
     * - `bg-transparent border rounded-full`          ：平时背景透明、带边框、胶囊圆角
     * - `px-4 py-1.5 ml-3`                            ：按钮内边距，以及跟左边文字保持 12px 间距
     */
    const ACTION_BASE_CLASS =
        'hover:text-[#050505] text-[10px] md:text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ' +
        'font-mono font-bold shrink-0 whitespace-nowrap bg-transparent border rounded-full px-4 py-1.5 ml-3';

    /**
     * 右侧按钮的 4 套【主题色专属样式】（分别对应 4 个列表板块的代表色）：
     *   - `green`  （赛博绿 `#4ade80`）：用于「在线使用」板块的 `VISIT` 按钮
     *   - `yellow` （明黄色 `#facc15`）：用于「文件下载」板块的 `OPEN` 按钮
     *   - `red`    （街机红 `#ef4444`）：用于「复古游戏」板块的 `START` 按钮
     *   - `indigo` （靛蓝色 `#6366f1`）：用于「创意空间」板块的 `OPEN` 按钮
     *
     * 提醒：之所以把每种颜色的类名完整写出来，是因为 Tailwind CSS 打包时必须扫描到完整的类名字符串。
     */
    const ACTION_ACCENT_CLASS = {
        green:  'text-[#4ade80] hover:bg-[#4ade80] border-[#4ade80]/50 hover:border-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0)] hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]',
        yellow: 'text-[#facc15] hover:bg-[#facc15] border-[#facc15]/50 hover:border-[#facc15] shadow-[0_0_10px_rgba(250,204,21,0)] hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]',
        red:    'text-[#ef4444] hover:bg-[#ef4444] border-[#ef4444]/50 hover:border-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]',
        indigo: 'text-[#6366f1] hover:bg-[#6366f1] border-[#6366f1]/50 hover:border-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0)] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]'
    };

    /** 检查传入的 `accent` 颜色名是不是上面 4 种之一 */
    const accentValidator = (value) => value in ACTION_ACCENT_CLASS;

    /** 把“按钮通用样式”和“对应颜色的专属样式”拼成完整的 class 字符串 */
    const actionClass = (accent) => ACTION_BASE_CLASS + ' ' + ACTION_ACCENT_CLASS[accent];

    // ========================================================================
    // 组件 1：`<tab-section>` —— 每个标签页最外层的【标题 + 滚动容器外壳】
    //
    // 【在 index.html 里怎么用的？】
    //   <tab-section title="> 在线工具" v-if="currentTab === 'online'">
    //       ...这里面放卡片，会自动塞进下面 template 的 <slot></slot> 插槽位置...
    //   </tab-section>
    //
    // 【支持传入的属性（props）】
    //   - `title`   （必填，字符串）：左上角显示的板块大标题，比如 `"> 在线工具"`、`"> 引擎启动"`
    //   - `spacing` （可选，默认 `'3'`）：卡片与卡片之间的上下间距。
    //               传 `'3'` 代表 `space-y-3`（12px，用于在线工具和资源库）；
    //               传 `'4'` 代表 `space-y-4`（16px，用于复古游戏和创意空间）。
    //   - `scroll`  （可选，布尔值，默认 `true`）：
    //               默认 `true` 时，会自动在标题下面包一层可上下滚动的列表容器 `<div v-if="scroll"><slot></slot></div>`；
    //               但在「电子音乐」板块，因为上面是固定不动的播放器控制台、下面才是滚动的歌单，
    //               所以在电子音乐板块传了 `:scroll="false"`，让里面的内容直接排在标题下面。
    // ========================================================================
    const LIST_SPACING_CLASS = {'3': 'space-y-3', '4': 'space-y-4'};

    TK.components.TabSection = {
        props: {
            title:   {type: String, required: true},
            spacing: {type: String, default: '3'},
            scroll:  {type: Boolean, default: true}
        },
        setup(props) {
            return {
                // 拼接滚动列表容器的 class：间距 + 纵向排列 + 超出纵向滚动 + 隐藏滚动条 + 占满剩余高度 + 上下左右留白防发光阴影被裁切
                listClass: () => [
                    LIST_SPACING_CLASS[props.spacing],
                    'flex flex-col overflow-y-auto hide-scrollbar flex-1 pb-6 pt-2 px-2 -mx-2'
                ]
            };
        },
        // 说明：`<slot></slot>` 是 Vue 的“插槽”，意思是父页面写在 `<tab-section>...</tab-section>` 中间的内容，会原封不动地填到 `<slot>` 所在的位置
        template: `
            <div class="space-y-4 flex flex-col h-full max-h-full">
                <h2 class="text-lg md:text-xl tab-title mb-4 font-bold shrink-0">{{ title }}</h2>
                <div :class="listClass()" v-if="scroll"><slot></slot></div>
                <slot v-else></slot>
            </div>
        `
    };

    // ========================================================================
    // 组件 2：`<link-card>` —— 「在线使用」板块专用的【外部网页链接卡片】
    //
    // 【在 index.html 里怎么用的？】
    //   <link-card v-for="tool in onlineTools" :key="tool.url"
    //              :name="tool.name" :desc="tool.desc" :url="tool.url"></link-card>
    //
    // 【支持传入的属性（props）】
    //   - `name`   （必填）：网站名称（如 `'GitHub'`）
    //   - `desc`   （可选）：网站简介（如 `'代码界的社交网络'`）
    //   - `url`    （必填）：点击跳转的外部网址（如 `'https://github.com/'`）
    //   - `accent` （可选，默认 `'green'`）：右侧按钮颜色，默认就是在线工具板块的绿色
    //   - `label`  （可选，默认 `'VISIT'`）：右侧按钮上显示的英文单词
    //
    // 【模板细节】
    //   右侧按钮用的是原生 `<a :href="url" target="_blank" rel="noopener noreferrer">`，
    //   `target="_blank"` 表示在浏览器新标签页打开，`rel="noopener noreferrer"` 是安全属性（防止新打开的外部网站反过来控制我们的页面）。
    // ========================================================================
    TK.components.LinkCard = {
        props: {
            name:   {type: String, required: true},
            desc:   {type: String, default: ''},
            url:    {type: String, required: true},
            accent: {type: String, default: 'green', validator: accentValidator},
            label:  {type: String, default: 'VISIT'}
        },
        setup(props) {
            return {
                cardClass: CARD_CLASS,
                nameClass: NAME_CLASS,
                descClass: DESC_CLASS,
                buttonClass: () => actionClass(props.accent)
            };
        },
        template: `
            <div :class="cardClass">
                <div class="flex flex-col truncate px-2">
                    <span :class="nameClass">{{ name }}</span>
                    <span :class="descClass">{{ desc }}</span>
                </div>
                <a :class="buttonClass()" :href="url" rel="noopener noreferrer" target="_blank">{{ label }}</a>
            </div>
        `
    };

    // ========================================================================
    // 组件 3：`<launch-card>` —— 「文件下载 / 复古游戏 / 创意空间」共用的【站内启动卡片】
    //
    // 【在 index.html 里怎么用的？】
    //   1. 文件下载（传图片图标 `icon-src`）：
    //      <launch-card v-for="app in projects" :name="app.name" :desc="app.desc"
    //                   :icon-src="app.icon" :icon-class="app.iconClass"
    //                   accent="yellow" label="OPEN" @open="openGame(app.title, app.url, app.video)" />
    //
    //   2. 复古游戏（传表情图标 `emoji`）：
    //      <launch-card v-for="game in games" :name="game.title" :desc="game.desc"
    //                   :emoji="game.emoji" accent="red" label="START" @open="openGame(game.title, game.url)" />
    //
    // 【支持传入的属性（props）】
    //   - `name`      （必填）：标题文字
    //   - `desc`      （可选）：副标题文字
    //   - `accent`    （必填）：右侧按钮颜色（`'yellow'` | `'red'` | `'indigo'` | `'green'`）
    //   - `label`     （可选，默认 `'OPEN'`）：右侧按钮文字（如 `'OPEN'` 或 `'START'`）
    //   - `emoji`     （可选）：左边方框里显示的 Emoji 表情（当没传 `iconSrc` 时显示它）
    //   - `iconSrc`   （可选）：左边方框里显示的图标图片路径（比如 `'./imgs/app/ToolKit.ico'`，优先级高于 `emoji`）
    //   - `iconClass` （可选，默认 `'w-6 h-6'`）：图标图片的宽高类名（Clod＆Gold 传了 `'w-7 h-7'`）
    //
    // 【事件说明（emits: ['open']）】
    //   当用户点击卡片右侧的按钮时，组件会执行 `$emit('open')` 向上汇报一声“用户点打开啦！”，
    //   `index.html` 里绑定的 `@open="openGame(...)"` 就会收到通知并弹出游戏/应用窗口。
    // ========================================================================
    TK.components.LaunchCard = {
        props: {
            name:      {type: String, required: true},
            desc:      {type: String, default: ''},
            accent:    {type: String, required: true, validator: accentValidator},
            label:     {type: String, default: 'OPEN'},
            emoji:     {type: String, default: ''},
            iconSrc:   {type: String, default: ''},
            iconClass: {type: String, default: 'w-6 h-6'},
            href:      {type: String, default: ''}
        },
        emits: ['open'],
        setup(props) {
            return {
                cardClass: CARD_CLASS,
                nameClass: NAME_CLASS,
                descClass: DESC_CLASS,
                // 如果传了图片路径 iconSrc，方框就用带内阴影和溢出裁切的样式；否则用普通 Emoji 方框样式
                iconBoxClass: () => props.iconSrc ? ICON_BOX_IMAGE_CLASS : ICON_BOX_CLASS,
                buttonClass: () => 'cursor-pointer ' + actionClass(props.accent)
            };
        },
        template: `
            <div :class="cardClass">
                <div class="flex items-center space-x-4 overflow-hidden">
                    <div :class="iconBoxClass()">
                        <img :alt="name" :class="[iconClass, 'object-contain drop-shadow-md']" :src="iconSrc" v-if="iconSrc">
                        <span class="text-xl" v-else>{{ emoji }}</span>
                    </div>
                    <div class="flex flex-col truncate">
                        <a :class="nameClass" :href="href" @click.prevent="$emit('open')" v-if="href">{{ name }}</a>
                        <span :class="nameClass" v-else>{{ name }}</span>
                        <span :class="descClass">{{ desc }}</span>
                    </div>
                </div>
                <button :class="buttonClass()" @click="$emit('open')">{{ label }}</button>
            </div>
        `
    };

})(window.TuKuai);
