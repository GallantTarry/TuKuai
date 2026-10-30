// 以后只有当你希望强制清空所有老用户的全站缓存时，才需要修改这个版本号
const CACHE_VERSION = 'v1.0.2';
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

// 3. 核心智能路由
self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);

    // 【排除项】非 GET 请求、浏览器插件、统计探针、API 接口以及带 Range 头的流媒体（如 <audio> 音乐）
    // 注：将 Range 音频请求直接交由浏览器原生 HTTP 磁盘缓存与 Cloudflare 处理，既支持进度条拖拽又防 Safari 崩溃
    if (req.method !== 'GET' ||
        req.headers.has('range') ||
        url.protocol.startsWith('chrome-extension') ||
        url.hostname.includes('google-analytics.com') ||
        url.hostname.includes('googletagmanager.com') ||
        url.hostname.includes('tukuai-kv') ||
        url.pathname.includes('/api/')
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
    // 策略 B：大体积资产 (游戏 ROM、3D 模型、字体、模拟器内核) -> 【绝对缓存优先】
    // 已补全：nds/nes/gb/gbc 游戏格式 + glb/gltf/bin/hdr/ktx2 等 3D 模型格式
    // =========================================================================
    const isHeavyAsset = url.pathname.match(/\.(gba|sfc|smc|nds|nes|gb|gbc|glb|gltf|bin|hdr|ktx2|ttf|woff2|wasm|zip)$/i) ||
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