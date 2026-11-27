// 每次发版更新静态资源后，只需递增此版本号：
//   1. 自动清空老访客浏览器中的旧版 CacheStorage；
//   2. 同源回源请求自动附加 `?_v=${CACHE_VERSION}` 并绕过本地磁盘缓存，直接穿透 Cloudflare 旧边缘缓存（无需去后台手动点 Purge）！
const CACHE_VERSION = 'v2.1.8';
const CACHE_NAME = `tukuai-smart-cache-${CACHE_VERSION}`;

/**
 * 同源版本化回源请求器：
 *   - 对本站同源资源自动拼上 `?_v=${CACHE_VERSION}`，刺穿 Cloudflare 边缘节点的旧 `HIT` 缓存；
 *   - 使用 `cache: 'reload'` 绕过浏览器本地 `max-age=600` HTTP 磁盘缓存；
 *   - 对未发生重定向的 HTML 导航请求剥离合成 URL，保证浏览器地址栏与 `location.search` 干净无额外参数。
 *
 * @param {Request} req 原始请求对象
 * @returns {Promise<Response>}
 */
async function fetchVersioned(req) {
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) {
        return fetch(req);
    }

    url.searchParams.set('_v', CACHE_VERSION);
    const res = await fetch(url.toString(), {
        method: 'GET',
        cache: 'reload',
        credentials: 'same-origin',
        redirect: 'follow'
    });

    if (req.mode === 'navigate' && res.ok && !res.redirected) {
        return new Response(res.body, {
            status: res.status,
            statusText: res.statusText,
            headers: res.headers
        });
    }
    return res;
}

// 1. 安装时立即接管
self.addEventListener('install', event => {
    self.skipWaiting();
});

// 2. 激活时：立即控制所有页面 + 自动清理旧版本的废弃缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] 清理旧版本缓存:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => clients.claim())
    );
});

// 3. 核心三级智能缓存路由
self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);

    // 【直接放行项】非 GET 请求、浏览器插件、统计探针、实时接口，以及 R2 云端媒体桶：
    //   · music.xn--udsye.art：交由浏览器原生 <audio> HTTP 206 Range 流式缓冲，秒拖进度且兼容 Safari
    //   · roms.xn--udsye.art ：交由 EmulatorJS 原生 XHR 进度条下载并存入其自带的 IndexedDB（EmulatorJS-roms），避免 CacheStorage 双倍占用存储
    if (req.method !== 'GET' ||
        req.headers.has('range') ||
        url.protocol.startsWith('chrome-extension') ||
        url.hostname.includes('google-analytics.com') ||
        url.hostname.includes('googletagmanager.com') ||
        url.hostname.includes('tukuai-kv') ||
        url.hostname === 'music.xn--udsye.art' ||
        url.hostname === 'roms.xn--udsye.art' ||
        url.pathname.includes('/api/') ||
        url.pathname === '/robots.txt' ||
        url.pathname === '/sitemap.xml'
    ) {
        return; // 直接放行，走浏览器原生网络与流式缓存
    }

    // =========================================================================
    // 策略 A：网页框架 (HTML) -> 【版本化穿透回源优先，本地缓存离线兜底】
    // =========================================================================
    if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetchVersioned(req)
                .then(networkRes => {
                    // 仅在状态码为 200-299 时写入缓存，防止 502/404 错误页污染离线兜底
                    if (networkRes && networkRes.ok) {
                        const clone = networkRes.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
                    }
                    return networkRes;
                })
                .catch(async () => {
                    // 离线兜底：忽略 ?rom=xxx 参数以复用 emulator.html 缓存，极端情况回退首页
                    const cached = await caches.match(req, { ignoreSearch: true });
                    return cached || caches.match('./index.html') || caches.match('/');
                })
        );
        return;
    }

    // =========================================================================
    // 策略 B：站内重型静态资产 (模拟器 WASM 内核、3D 模型、像素字体、2K AVIF 壁纸) -> 【当前版本绝对缓存优先】
    // =========================================================================
    const isHeavyAsset = url.pathname.match(/\.(gba|sfc|smc|nds|nes|gb|gbc|glb|gltf|bin|hdr|ktx2|ttf|woff2|wasm|zip|avif)$/i) ||
        url.pathname.includes('/emulator_data/');

    if (isHeavyAsset) {
        event.respondWith(
            caches.match(req).then(cachedRes => {
                if (cachedRes) return cachedRes;

                return fetchVersioned(req).then(networkRes => {
                    if (networkRes && networkRes.status === 200) {
                        const clone = networkRes.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
                    }
                    return networkRes;
                });
            })
        );
        return;
    }

    // =========================================================================
    // 策略 C：普通静态资源 (JS, CSS, 图片, SVG) -> 【Stale-While-Revalidate + 版本化穿透回源】
    // =========================================================================
    event.respondWith(
        caches.match(req).then(cachedRes => {
            const networkFetch = fetchVersioned(req)
                .then(networkRes => {
                    if (networkRes && networkRes.status === 200) {
                        const clone = networkRes.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
                    }
                    return networkRes;
                })
                .catch(err => {
                    if (cachedRes) return cachedRes;
                    throw err;
                });

            return cachedRes || networkFetch;
        })
    );
});
