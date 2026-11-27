// 以后只有当你希望强制清空所有老用户的全站缓存时，才需要修改这个版本号
const CACHE_VERSION = 'v2.1.7';
const CACHE_NAME = `tukuai-smart-cache-${CACHE_VERSION}`;

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
    // 策略 A：网页框架 (HTML) -> 【网络优先，缓存兜底】
    // =========================================================================
    if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(req)
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
    // 策略 B：站内重型静态资产 (模拟器 WASM 内核、3D 模型、像素字体、2K AVIF 壁纸) -> 【绝对缓存优先】
    // =========================================================================
    const isHeavyAsset = url.pathname.match(/\.(gba|sfc|smc|nds|nes|gb|gbc|glb|gltf|bin|hdr|ktx2|ttf|woff2|wasm|zip|avif)$/i) ||
        url.pathname.includes('/emulator_data/');

    if (isHeavyAsset) {
        event.respondWith(
            // 注意：这里不加 ignoreSearch，保留你通过 ?v=2 更新单个大文件的能力
            caches.match(req).then(cachedRes => {
                if (cachedRes) return cachedRes;

                return fetch(req).then(networkRes => {
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
    // 策略 C：普通静态资源 (JS, CSS, 图片, SVG) -> 【Stale-While-Revalidate 异步热更新】
    // =========================================================================
    event.respondWith(
        caches.match(req).then(cachedRes => {
            const networkFetch = fetch(req)
                .then(networkRes => {
                    if (networkRes && networkRes.status === 200) {
                        const clone = networkRes.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
                    }
                    return networkRes;
                })
                .catch(err => {
                    // 若已有缓存则静默返回旧缓存；若无缓存则抛出原始错误，防止向 respondWith 传入 undefined
                    if (cachedRes) return cachedRes;
                    throw err;
                });

            return cachedRes || networkFetch;
        })
    );
});