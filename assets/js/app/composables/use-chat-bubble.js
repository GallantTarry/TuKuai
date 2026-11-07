/**
 * ============================================================================
 * 文件路径：assets/js/app/composables/use-chat-bubble.js
 * 文件作用：【像素小人头像右侧的定时问候气泡】
 * ============================================================================
 *
 * 【通俗理解：那个白色的小聊天气泡是什么时候弹出来的？】
 * 在每天傍晚 `18:00 ~ 18:59` 期间，土块的状态是 `'smoking'`（抽烟小人）。
 * 在这个时间段内，每隔 **15 秒**，小人头像右边就会带弹性动画蹦出一个白色聊天气泡，
 * 里面随机显示一句英文打招呼（比如 `"Wanna chat?"`、`"Hey you!"`，词库在 `data/content.js` 里），
 * 停留 **4 秒** 后自动缩回消失，暗示访客“点我头像可以给我发密函聊天哦”！
 *
 * （如果在非抽烟时间段，这个气泡是不会弹出来的。）
 */
(function (TK) {
    'use strict';

    const {ref, onMounted} = Vue;

    /** 每隔多久尝试弹出一次气泡：15000 毫秒 = 15 秒 */
    const BUBBLE_INTERVAL = 15000;
    /** 气泡每次弹出来停留多久后消失：4000 毫秒 = 4 秒 */
    const BUBBLE_DURATION = 4000;

    /**
     * @param {Vue.Ref<string>} currentStatus 土块当前的作息状态（来自 `useClockStatus`）
     */
    TK.composables.useChatBubble = function useChatBubble(currentStatus) {
        /** 控制气泡当前是否显示（`true` 弹出，`false` 隐藏） */
        const showBubble = ref(false);
        /** 气泡里显示的文字内容（默认先取词库第一句 `'Wanna chat?'`） */
        const bubbleText = ref(TK.data.bubbleGreetings[0]);

        onMounted(() => {
            setInterval(() => {
                // 只有当前状态是抽烟（'smoking'）时才触发弹出
                if (currentStatus.value !== 'smoking') return;

                // 从 `TK.data.bubbleGreetings` 词库里随机挑一句问候语
                bubbleText.value = TK.utils.randomItem(TK.data.bubbleGreetings);
                // 显示气泡
                showBubble.value = true;
                // 4 秒后自动收起气泡
                setTimeout(() => {
                    showBubble.value = false;
                }, BUBBLE_DURATION);
            }, BUBBLE_INTERVAL);
        });

        return {showBubble, bubbleText};
    };

})(window.TuKuai);
