/**
 * ============================================================================
 * 文件路径：assets/js/app/components/engine-help-modal.js
 * 文件作用：「? 引擎说明与依赖来源」弹窗组件 `<engine-help-modal>`（挂载在 `TuKuai.components.EngineHelpModal`）
 * ============================================================================
 *
 * 【展示内容】
 *   1. 核心引擎与依赖来源：EmulatorJS (v4.2.3)、RetroArch / libretro、mGBA & Snes9x 核心
 *   2. 浏览器存档与数据防丢失提示（iOS Safari 7 天自动清理机制与手动导出提醒）
 *   3. 移动端左上角（20×20px 透明区域）隐藏存档导入按钮的使用说明
 *   4. 点击弹窗外部任意区域（或按 Esc）即可关闭，置于粒子层 `z-50` 之下以保持鼠标粒子在最上方
 */
(function (TK) {
    'use strict';

    const {computed, onMounted, onBeforeUnmount} = Vue;

    /** 核心引擎与开源依赖清单 */
    const ENGINE_DEPS = [
        {
            name: 'EmulatorJS (v4.2.3)',
            role: '网页模拟器框架 · GPL-3.0',
            links: [
                {label: 'GitHub', url: 'https://github.com/EmulatorJS/EmulatorJS'}
            ]
        },
        {
            name: 'RetroArch / libretro',
            role: '底层跨平台模拟架构',
            links: [
                {label: 'GitHub', url: 'https://github.com/libretro/RetroArch'}
            ]
        },
        {
            name: 'mGBA / Snes9x',
            role: 'GBA (.gba) & SFC (.sfc/.smc) 核心',
            links: [
                {label: 'mGBA', url: 'https://github.com/EmulatorJS/mgba'},
                {label: 'Snes9x', url: 'https://github.com/EmulatorJS/snes9x'}
            ]
        }
    ];

    TK.components.EngineHelpModal = {
        props: {
            modelValue:  {type: Boolean, default: false},
            activeColor: {type: String, required: true},
            activeGlow:  {type: String, required: true}
        },

        emits: ['update:modelValue'],

        setup(props, {emit}) {
            const closeModal = () => emit('update:modelValue', false);

            const handleKeydown = (e) => {
                if (e.key === 'Escape' && props.modelValue) closeModal();
            };

            onMounted(() => window.addEventListener('keydown', handleKeydown));
            onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown));

            const panelStyle = computed(() => ({
                borderColor: props.activeColor,
                boxShadow: `0 0 30px ${props.activeGlow}`
            }));

            return {
                deps: ENGINE_DEPS,
                closeModal,
                panelStyle
            };
        },

        template: `
            <transition enter-active-class="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        enter-from-class="opacity-0 scale-50 translate-y-16"
                        enter-to-class="opacity-100 scale-100 translate-y-0"
                        leave-active-class="transition-all duration-300 ease-in-out"
                        leave-from-class="opacity-100 scale-100 translate-y-0"
                        leave-to-class="opacity-0 scale-75 translate-y-10">
                <div @click.self="closeModal"
                     class="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-pixel"
                     v-if="modelValue">

                    <!-- 背后全屏半透明毛玻璃黑雾遮罩层：点击外部自动关闭（与密函弹窗一致） -->
                    <div @click="closeModal"
                         class="absolute inset-0 bg-[#050505]/30 backdrop-blur-md transition-all duration-700"></div>

                    <!-- 弹窗主体 -->
                    <div @click.stop
                         :style="panelStyle"
                         class="glass-panel engine-help-panel border-[2px]">

                        <!-- 顶部标题 -->
                        <div class="engine-help-header">
                            <h3 class="tab-title engine-help-title">
                                <span>&gt; 引擎说明与依赖来源</span>
                            </h3>
                        </div>

                        <!-- 精简内容区 -->
                        <div class="engine-help-body hide-scrollbar">

                            <!-- 1. 核心依赖来源 -->
                            <section class="engine-help-section engine-help-deps-box">
                                <div class="engine-help-section-label">◈ 核心依赖</div>
                                <div class="engine-help-dep-list">
                                    <div class="engine-help-dep-item" v-for="dep in deps" :key="dep.name">
                                        <div class="engine-help-dep-info">
                                            <div class="engine-help-dep-name">{{ dep.name }}</div>
                                            <div class="engine-help-dep-role">{{ dep.role }}</div>
                                        </div>
                                        <div class="engine-help-dep-links">
                                            <a v-for="link in dep.links"
                                               :key="link.url"
                                               :href="link.url"
                                               target="_blank"
                                               rel="noopener noreferrer"
                                               class="engine-help-dep-link">
                                                {{ link.label }} ↗
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- 2. 浏览器存档提醒（原启动窗口底部黄字） -->
                            <section class="engine-help-section engine-help-warn-box">
                                <div class="engine-help-warn-title">⚠️ 本地进度保存提示</div>
                                <p class="engine-help-warn-text">
                                    进度保存在本浏览器里，<strong>iOS Safari 超过 7 天不访问会被系统自动清理网站数据</strong>，进度可能丢失；换设备、换浏览器或清除缓存也会丢失。重要进度请用控制栏的「保存存档 / 导出存档文件」导出备份。
                                </p>
                            </section>

                            <!-- 3. 移动端左上角隐藏导入按钮说明（原游戏内弹窗提示） -->
                            <section class="engine-help-section engine-help-tip-box">
                                <div class="engine-help-tip-title">✨ 移动端隐藏导入按钮</div>
                                <p class="engine-help-tip-text">
                                    如果移动端导入失败，可点击游戏画面<strong>左上角（20×20px 透明区域）</strong>的隐藏导入按钮，直接选取 <span class="engine-help-code">.sav</span> 或 <span class="engine-help-code">.state</span> 存档注入。土块祝您玩得开心！
                                </p>
                            </section>

                        </div>
                    </div>
                </div>
            </transition>
        `
    };
})(window.TuKuai);
