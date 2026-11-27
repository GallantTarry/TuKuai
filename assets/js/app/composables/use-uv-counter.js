/**
 * ============================================================================
 * 文件路径：assets/js/app/composables/use-uv-counter.js
 * 文件作用：【独立访客（fans 粉丝数）统计与实时轮询引擎（严格遵循 Cookie 授权）】
 * ============================================================================
 *
 * 【工作逻辑】
 *   1. 未授权 / 点击「拒绝~」时（`hasCookieConsent.value === false`）：
 *      请求 `/api/uv?_t=...`（不携带 `uuid` 参数），仅只读拉取并展示当前全站 `fans` 数字，
 *      后端不会将本次访问计入总数，`fans` 绝不增加，本地也不生成任何标识。
 *
 *   2. 点击「同意！」瞬间或已授权老访客重返时（`hasCookieConsent.value === true`）：
 *      请求 `/api/uv?uuid=<cookie_uuid>&_t=...`：
 *      - 首次同意：后端识别到全新 UUID，`fans` 立即 +1 并实时更新到左侧边栏；
 *      - 后续重返或轮询：携带同一个 Cookie UUID，后端自动去重不重复累加。
 *
 *   3. 智能后台轮询：
 *      前台每 30 秒静默刷新一次；切到后台自动暂停，切回前台立即刷新。
 */
(function (TK) {
    'use strict';

    const {ref, watch, onMounted} = Vue;

    /** 自动刷新的时间间隔：30000 毫秒 = 30 秒 */
    const REFRESH_INTERVAL = 30000;

    /**
     * @param {Vue.Ref<boolean>} hasCookieConsent 用户是否已同意挂载 Cookie
     * @param {() => string} getAuthorizedUuid 获取已授权 Cookie 中的设备唯一 UUID
     */
    TK.composables.useUvCounter = function useUvCounter(hasCookieConsent, getAuthorizedUuid) {
        const siteUv = ref('...');

        /**
         * 向 Cloudflare Worker 统计接口发请求：
         * 已授权时附带 `uuid`（新设备 +1、老设备去重），未授权时仅只读获取当前 `count`
         */
        const refreshUv = async () => {
            try {
                const isAuthorized = Boolean(hasCookieConsent && hasCookieConsent.value);
                const uuid = isAuthorized && typeof getAuthorizedUuid === 'function'
                    ? getAuthorizedUuid()
                    : null;
                const query = uuid
                    ? `?uuid=${encodeURIComponent(uuid)}&_t=${Date.now()}`
                    : `?_t=${Date.now()}`;

                const response = await fetch(`${TK.config.api.uv}${query}`, {
                    method: 'GET',
                    cache: 'no-store'
                });
                const data = await response.json();

                if (data.count !== undefined) {
                    siteUv.value = data.count;
                }
            } catch (e) {
                console.error('UV 引擎连接失败:', e);
                if (siteUv.value === '...') {
                    siteUv.value = 'ERR';
                }
            }
        };

        // 当用户在 SYSTEM ALERT 面板中点击「同意！」的一瞬间，立即上报 UUID，让左侧 fans 实时 +1
        if (hasCookieConsent) {
            watch(hasCookieConsent, (accepted) => {
                if (accepted) refreshUv();
            });
        }

        onMounted(() => {
            refreshUv();

            setInterval(() => {
                if (!document.hidden) refreshUv();
            }, REFRESH_INTERVAL);

            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) refreshUv();
            });
        });

        return {siteUv};
    };

})(window.TuKuai);
