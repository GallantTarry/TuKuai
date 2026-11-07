/**
 * ============================================================================
 * 文件路径：assets/js/app/composables/use-uv-counter.js
 * 文件作用：【独立访客（fans 粉丝数）统计与实时轮询引擎】
 * ============================================================================
 *
 * 【通俗理解：左侧头像旁边的 `fans: xxx` 数字是怎么算出来的？】
 *   1. 发一张“设备身份证”（UUID）：
 *      当一个访客第一次打开你的网站时，程序会用浏览器自带的 `crypto.randomUUID()` 生成一串全球唯一的随机编号
 *      （比如 `"3b241101-e2bb-4255-8caf-4136c566a962"`），并存进他浏览器的 `localStorage` 里。
 *      以后他不管刷新多少次页面，都会带着这同一个编号去请求后端，后端就知道“这是老朋友，不用重复加 1”；
 *      只有新设备访问时，总人数 `count` 才会 +1！
 *
 *   2. 彻底破除缓存，保证数字绝对实时：
 *      为了防止浏览器或 Service Worker 偷懒返回旧的缓存数字，每次请求都会在网址末尾拼上当前毫秒时间戳 `&_t=${Date.now()}`，
 *      并加上 `cache: 'no-store'`（严禁读写任何本地缓存）。
 *
 *   3. 智能后台轮询（既实时又省钱）：
 *      - 用户正看着网页时：每隔 30 秒自动静默拉取一次最新粉丝数（不用手动刷新页面就能看到粉丝上涨）
 *      - 用户把网页切到后台/别的标签页时（`document.hidden === true`）：自动暂停轮询，帮你节省 Cloudflare KV 的免费读取额度！
 *      - 用户从别的标签页切回本网页的一瞬间（`visibilitychange`）：立刻拉取一次最新数字！
 */
(function (TK) {
    'use strict';

    const {ref, onMounted} = Vue;

    /** 自动刷新的时间间隔：30000 毫秒 = 30 秒 */
    const REFRESH_INTERVAL = 30000;

    TK.composables.useUvCounter = function useUvCounter() {
        /**
         * 页面上 `fans:` 后面绑定的响应式变量：
         * - 刚打开网页正在联网查询时，显示 `'...'`
         * - 查询成功后，变成具体的粉丝数字（如 `1024`）
         * - 如果第一次进站就断网连不上，显示 `'ERR'`
         */
        const siteUv = ref('...');

        /**
         * 获取本设备的唯一 UUID：
         * 先去浏览器本地存储 `localStorage` 里找有没有存过；
         * 如果没有（首次访问或清空过浏览器数据），就现场生成一个新的并存进去。
         */
        const getDeviceUuid = () => {
            const key = TK.config.storageKeys.deviceUuid;
            let uuid = localStorage.getItem(key);
            if (!uuid) {
                uuid = crypto.randomUUID();
                localStorage.setItem(key, uuid);
            }
            return uuid;
        };

        /**
         * 向 Cloudflare Worker 统计接口发请求，上报本机 UUID 并拿到最新全站粉丝总数
         */
        const refreshUv = async () => {
            try {
                // 拼接接口地址：带上 uuid 和防缓存时间戳 _t
                const url = `${TK.config.api.uv}?uuid=${getDeviceUuid()}&_t=${Date.now()}`;
                const response = await fetch(url, {method: 'GET', cache: 'no-store'});
                const data = await response.json();

                // 只要后端正常返回了 count 字段，就更新到页面上
                if (data.count !== undefined) {
                    siteUv.value = data.count;
                }
            } catch (e) {
                console.error('UV 引擎连接失败:', e);
                // 贴心细节：只有当初始还没拿到过任何数据（还是 `'...'`）时，才显示 `'ERR'`。
                // 如果之前已经成功显示了比如 `1280` 个粉丝，中途某次 30 秒轮询偶发网络抖动失败了，
                // 绝不把已经显示好的 `1280` 覆盖成难看的 `'ERR'`！
                if (siteUv.value === '...') {
                    siteUv.value = 'ERR';
                }
            }
        };

        onMounted(() => {
            // 1. 网页一加载，立刻查一次粉丝数
            refreshUv();

            // 2. 每隔 30 秒：如果用户当前正看着这个网页（!document.hidden），就静默刷新一次
            setInterval(() => {
                if (!document.hidden) refreshUv();
            }, REFRESH_INTERVAL);

            // 3. 当用户从其他软件或浏览器标签页切回本网页时，立刻刷新一次
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) refreshUv();
            });
        });

        return {siteUv};
    };

})(window.TuKuai);
