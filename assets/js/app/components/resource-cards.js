/**
 * ============================================================================
 * 文件路径：assets/js/app/components/resource-cards.js
 * 文件作用：定义全站通用的 3 个【列表与卡片复用组件】（挂载在 `TuKuai.components` 上）
 * ============================================================================
 *
 * 【组件清单】
 *   1. `<tab-section>` ：每个板块统一规格的「固定标题栏 + 独立滚动内容容器」外壳，保证 6 大板块标题坐标与首条间距分毫不差；
 *   2. `<link-card>`   ：「在线使用」外链卡片（整卡可点，电脑端悬停浮现 VISIT 胶囊，手机端常显）；
 *   3. `<launch-card>` ：「文件下载 / 复古游戏 / 创意空间」启动卡片（整卡可点，电脑端悬停浮现 OPEN/START 胶囊，手机端常显）。
 */
(function (TK) {
    'use strict';

    /** 毛玻璃条子外框通用类（具体通透折射与移动/桌面自适应按钮显隐由 `style.css` 统一控制） */
    const CARD_CLASS = 'glass-card resource-card p-3 md:p-4 flex justify-between items-center group transition-all';

    /** 卡片第一行主标题 */
    const NAME_CLASS = 'text-white font-bold text-[11px] md:text-sm tracking-wide truncate';

    /** 卡片第二行副标题 */
    const DESC_CLASS = 'text-gray-400 text-[9px] md:text-[10px] mt-1 truncate';

    /** 卡片左侧图标水晶方框（通透微暗折射，不再使用死黑底色） */
    const ICON_BOX_CLASS = 'resource-icon-box w-10 h-10 rounded-xl flex items-center justify-center shrink-0';
    const ICON_BOX_IMAGE_CLASS = ICON_BOX_CLASS + ' overflow-hidden';

    /** 右侧胶囊按钮通用类（手机端常显方便单指点按，电脑端悬停优雅浮现） */
    const ACTION_BASE_CLASS =
        'resource-card-action hover:text-[#050505] text-[10px] md:text-xs transition-all duration-300 ' +
        'font-mono font-bold shrink-0 whitespace-nowrap bg-transparent border rounded-full ml-3';

    /** 4 套板块代表色胶囊样式 */
    const ACTION_ACCENT_CLASS = {
        green:  'text-[#4ade80] hover:bg-[#4ade80] border-[#4ade80]/50 hover:border-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0)] hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]',
        yellow: 'text-[#facc15] hover:bg-[#facc15] border-[#facc15]/50 hover:border-[#facc15] shadow-[0_0_10px_rgba(250,204,21,0)] hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]',
        red:    'text-[#ef4444] hover:bg-[#ef4444] border-[#ef4444]/50 hover:border-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]',
        indigo: 'text-[#6366f1] hover:bg-[#6366f1] border-[#6366f1]/50 hover:border-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0)] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]'
    };

    const accentValidator = (value) => value in ACTION_ACCENT_CLASS;
    const actionClass = (accent) => ACTION_BASE_CLASS + ' ' + ACTION_ACCENT_CLASS[accent];

    // ========================================================================
    // 组件 1：`<tab-section>` —— 全站统一标题高 & 标题到首卡间距 & 内部独立滚动外壳
    // ========================================================================
    TK.components.TabSection = {
        props: {
            title:   {type: String, required: true},
            spacing: {type: String, default: '3'},
            scroll:  {type: Boolean, default: true}
        },
        template: `
            <div class="tab-section-shell tab-section-fill">
                <div class="tab-header flex items-center gap-3 shrink-0 relative z-20" v-if="$slots['title-extra']">
                    <h2 class="text-lg md:text-xl tab-title font-bold m-0 tracking-wide shrink-0">{{ title }}</h2>
                    <slot name="title-extra"></slot>
                </div>
                <div class="tab-header flex items-center shrink-0 relative z-20" v-else>
                    <h2 class="text-lg md:text-xl tab-title font-bold m-0 tracking-wide">{{ title }}</h2>
                </div>
                <div class="tab-scroll-area hide-scrollbar" v-if="scroll"><slot></slot></div>
                <div class="tab-static-area" v-else><slot></slot></div>
            </div>
        `
    };

    // ========================================================================
    // 组件 2：`<link-card>` —— 外链卡片（整张卡片即为 <a>，电脑/手机任意位置点击均可直达）
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
            <a :class="cardClass" :href="url" rel="noopener noreferrer" target="_blank">
                <div class="flex flex-col truncate min-w-0">
                    <span :class="nameClass">{{ name }}</span>
                    <span :class="descClass">{{ desc }}</span>
                </div>
                <span :class="buttonClass()">{{ label }}</span>
            </a>
        `
    };

    // ========================================================================
    // 组件 3：`<launch-card>` —— 站内启动卡片（整卡可点启动，按钮阻止冒泡防双触发）
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
                iconBoxClass: () => props.iconSrc ? ICON_BOX_IMAGE_CLASS : ICON_BOX_CLASS,
                buttonClass: () => 'cursor-pointer ' + actionClass(props.accent)
            };
        },
        template: `
            <div :class="cardClass" @click="$emit('open')">
                <div class="flex items-center space-x-3 md:space-x-4 overflow-hidden min-w-0">
                    <div :class="iconBoxClass()">
                        <img :alt="name" :class="[iconClass, 'object-contain drop-shadow-md']" :src="iconSrc" v-if="iconSrc">
                        <span class="text-xl" v-else>{{ emoji }}</span>
                    </div>
                    <div class="flex flex-col truncate min-w-0">
                        <a :class="nameClass" :href="href" @click.prevent.stop="$emit('open')" v-if="href">{{ name }}</a>
                        <span :class="nameClass" v-else>{{ name }}</span>
                        <span :class="descClass">{{ desc }}</span>
                    </div>
                </div>
                <button type="button" :class="buttonClass()" @click.stop="$emit('open')">{{ label }}</button>
            </div>
        `
    };

})(window.TuKuai);
