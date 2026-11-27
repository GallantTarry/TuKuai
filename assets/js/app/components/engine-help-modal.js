/**
 * ============================================================================
 * 文件路径：assets/js/app/components/engine-help-modal.js
 * 文件作用：「? 引擎说明与依赖来源」弹窗组件 `<engine-help-modal>`
 * ============================================================================
 *
 * 【展示内容（三段统一 Emoji 主题卡片，无外部跳转链接）】
 *   1. 🧩 开源内核与依赖：EmulatorJS / RetroArch / mGBA / Snes9x（GPL-3.0）
 *   2. ⚠️ 本地进度保存提示：iOS Safari 7 天清理与备份提醒
 *   3. ✨ 移动端隐藏导入：左上角（20×20px 透明区域）隐藏存档注入说明
 */
(function (TK) {
    'use strict';

    const {computed, onMounted, onBeforeUnmount} = Vue;

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

                    <!-- 半透明毛玻璃遮罩层：点击外部即可关闭 -->
                    <div @click="closeModal"
                         class="absolute inset-0 bg-[#050505]/30 backdrop-blur-md transition-all duration-700"></div>

                    <!-- 弹窗主体 -->
                    <div @click.stop
                         :style="panelStyle"
                         class="glass-panel engine-help-panel border-[2px]">

                        <div class="engine-help-header">
                            <h3 class="tab-title engine-help-title">
                                <span>&gt; 引擎说明与依赖来源</span>
                            </h3>
                        </div>

                        <div class="engine-help-body hide-scrollbar">

                            <!-- 1. 开源内核与依赖 -->
                            <section class="engine-help-section engine-help-deps-box">
                                <div class="engine-help-deps-title">🧩 开源内核与依赖</div>
                                <p class="engine-help-deps-text">
                                    基于 <strong>EmulatorJS</strong>、<strong>RetroArch</strong> 及 <strong>mGBA / Snes9x</strong> 开源核心构建（遵循 GPL-3.0 协议）。
                                </p>
                            </section>

                            <!-- 2. 本地存档防丢提醒 -->
                            <section class="engine-help-section engine-help-warn-box">
                                <div class="engine-help-warn-title">⚠️ 本地进度保存提示</div>
                                <p class="engine-help-warn-text">
                                    进度保存在当前浏览器本地（<strong>iOS Safari 超过 7 天不访问会自动清理</strong>），换设备或清缓存也会丢失，重要进度请及时导出备份。
                                </p>
                            </section>

                            <!-- 3. 移动端隐藏导入按钮 -->
                            <section class="engine-help-section engine-help-tip-box">
                                <div class="engine-help-tip-title">✨ 移动端隐藏导入</div>
                                <p class="engine-help-tip-text">
                                    若移动端导入失败，可点击游戏画面<strong>左上角（20×20px 透明区域）</strong>直接选取 <span class="engine-help-code">.sav</span> 或 <span class="engine-help-code">.state</span> 存档注入。
                                </p>
                            </section>

                        </div>
                    </div>
                </div>
            </transition>
        `
    };
})(window.TuKuai);
