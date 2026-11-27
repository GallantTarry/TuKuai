/**
 * ============================================================================
 * 文件路径：assets/js/app/composables/use-cookie-consent.js
 * 文件作用：【SYSTEM ALERT 面板级 Cookie 授权覆盖层与状态控制】
 * ============================================================================
 *
 * 【核心交互与存储逻辑】
 *   1. 初始状态检查：
 *      读取浏览器本地 Cookie `tukuai_cookie_consent` 是否为 `'accepted'`。
 *      - 若尚未授权（首次访问，或上次点击了「拒绝~」）：
 *        · 清理可能残留的旧版 localStorage / Cookie，确保零未授权本地存储；
 *        · 开场播放 PowerShell 控制台解码动画；
 *        · 主界面「身份档案」所在的毛玻璃框一开始即被等大的 `SYSTEM ALERT` 面板完整覆盖；
 *        · 左侧 `fans` 仅只读查询当前总数，绝不生成 UUID，也绝不触发 +1。
 *      - 若已授权（之前点击过「同意！」）：
 *        · 直接跳过开场 PowerShell 控制台动画，秒进主界面；
 *        · 不再显示 `SYSTEM ALERT` 覆盖层；
 *        · 携带本地 Cookie 中的设备 UUID 查询访客接口（后端自动按 UUID 去重，不会重复 +1）。
 *
 *   2. 点击「🙆‍♂️ 同意！」（`acceptCookieConsent`）：
 *      - 生成（或复用）设备唯一 UUID，将 `tukuai_cookie_consent=accepted` 与 `tukuai_device_uuid=<uuid>` 写入本地 Cookie（有效期 1 年）；
 *      - 关闭 `SYSTEM ALERT` 覆盖层，平滑显露底下的「身份档案」；
 *      - 将 `hasCookieConsent` 置为 `true`，立即触发 `use-uv-counter.js` 携带 UUID 请求后端，使 `fans` 实时 +1。
 *
 *   3. 点击「🙅‍♂️ 拒绝~」（`declineCookieConsent`）：
 *      - 不写入任何 Cookie 或本地存储（并清除任何残留项）；
 *      - `fans` 不会增加；
 *      - 本次浏览关闭 `SYSTEM ALERT` 覆盖层，访客可正常使用主站功能；
 *      - 下次重新打开或刷新页面时，仍会播放开场控制台动画并再次显示 `SYSTEM ALERT`。
 */
(function (TK) {
    'use strict';

    const {ref} = Vue;

    TK.composables.useCookieConsent = function useCookieConsent() {
        const {consent: consentCookieKey, deviceUuid: uuidCookieKey, maxAgeSeconds} = TK.config.cookies;
        const legacyKeys = TK.config.storageKeys;
        const {getCookie, setCookie, deleteCookie, generateUuid} = TK.utils;

        /** 清空所有旧版或未授权的本地存储与 Cookie，确保拒绝状态下本地干干净净 */
        const clearUnauthorizedStorage = () => {
            deleteCookie(consentCookieKey);
            deleteCookie(uuidCookieKey);
            try {
                localStorage.removeItem(legacyKeys.booted);
                localStorage.removeItem(legacyKeys.cookieConsent);
                localStorage.removeItem(legacyKeys.deviceUuid);
            } catch (e) {
                // 隐私模式禁用 storage 时静默忽略
            }
        };

        // 检查本地是否已有明确授权的 Cookie（同时要求存在合法的设备 UUID，保证老访客去重闭环）
        const initiallyAccepted = getCookie(consentCookieKey) === 'accepted';
        if (!initiallyAccepted) {
            clearUnauthorizedStorage();
        } else {
            // 已授权老访客：顺手清理早期版本遗留的 localStorage 键，统一收敛至真实 Cookie
            try {
                localStorage.removeItem(legacyKeys.booted);
                localStorage.removeItem(legacyKeys.cookieConsent);
                localStorage.removeItem(legacyKeys.deviceUuid);
            } catch (e) {
                // ignore
            }
        }

        /** 当前是否已获得用户的 Cookie 授权 */
        const hasCookieConsent = ref(initiallyAccepted);
        /** 是否在主面板上覆盖显示 SYSTEM ALERT（未授权时从一开始就覆盖在身份档案框上） */
        const showCookieAlert = ref(!initiallyAccepted);
        /** 当用户未做选择就点击左侧导航菜单时，触发一次轻柔回弹提示 */
        const alertBounce = ref(false);
        let bounceTimer = null;

        /**
         * 获取已授权状态下的本机唯一 UUID（仅在 `hasCookieConsent.value === true` 时调用）
         * @returns {string}
         */
        const getAuthorizedUuid = () => {
            let uuid = getCookie(uuidCookieKey);
            if (!uuid || uuid.length <= 20) {
                uuid = generateUuid();
                setCookie(uuidCookieKey, uuid, maxAgeSeconds);
            }
            return uuid;
        };

        /** 用户点击「🙆‍♂️ 同意！」：写入本地 Cookie + 触发 FANS +1 + 揭开覆盖层 */
        const acceptCookieConsent = () => {
            const uuid = getCookie(uuidCookieKey) || generateUuid();
            setCookie(consentCookieKey, 'accepted', maxAgeSeconds);
            setCookie(uuidCookieKey, uuid, maxAgeSeconds);
            hasCookieConsent.value = true;
            showCookieAlert.value = false;
        };

        /** 用户点击「🙅‍♂️ 拒绝~」：不存任何 Cookie，FANS 不增加，仅本次揭开覆盖层，下次打开仍有开场动画与提示 */
        const declineCookieConsent = () => {
            clearUnauthorizedStorage();
            hasCookieConsent.value = false;
            showCookieAlert.value = false;
        };

        /** 未选择前点击其他菜单时的果冻轻晃提醒 */
        const nudgeCookieAlert = () => {
            if (bounceTimer) clearTimeout(bounceTimer);
            alertBounce.value = false;
            requestAnimationFrame(() => {
                alertBounce.value = true;
                bounceTimer = setTimeout(() => {
                    alertBounce.value = false;
                }, 520);
            });
        };

        return {
            hasCookieConsent,
            showCookieAlert,
            alertBounce,
            acceptCookieConsent,
            declineCookieConsent,
            nudgeCookieAlert,
            getAuthorizedUuid
        };
    };

})(window.TuKuai);
