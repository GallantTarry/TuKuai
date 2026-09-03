// =========================================================
// 1. 定义双缓存池与版本号
// =========================================================
const CACHE_VERSION = 'v5'; // 每次发布新版本请修改此处的数字！
const CORE_CACHE_NAME = `tukuai-core-${CACHE_VERSION}`;
const MEDIA_CACHE_NAME = `tukuai-media-${CACHE_VERSION}`;
const GAME_CACHE_NAME = `tukuai-game-${CACHE_VERSION}`;

// 核心物资清单 (页面骨架，安装时立即缓存)
const CORE_ASSETS = [
    './',
    './index.html',
    './js/tailwindcss.js',
    './js/vue.global.js',
    './font/Silkscreen-Regular.ttf',
    './font/Silkscreen-Bold.ttf',
    './font/zpix.ttf',
    './imgs/favicon.png',
    './imgs/favicon.ico',
    './imgs/applefavicon.png',
    './imgs/bg.avif',
    './imgs/bg1.jpg',
    './imgs/bg2.jpg',
    './imgs/bg3.jpg',
    './imgs/bg4.jpg',
    './imgs/music-cover.png'
];

// =========================================================
// 2. 安装阶段 (Install) - 预缓存核心框架
// =========================================================
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CORE_CACHE_NAME).then(cache => {
            console.log(`[SW ${CACHE_VERSION}] ⚙️ 正在预缓存核心物资...`);
            return cache.addAll(CORE_ASSETS);
        })
    );
});

// =========================================================
// 3. 激活阶段 (Activate) - 自动清理旧版本缓存
// =========================================================
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // 如果缓存名不是当前版本，直接销毁，释放用户空间
                    if (cacheName !== CORE_CACHE_NAME && 
                        cacheName !== MEDIA_CACHE_NAME && 
                        cacheName !== GAME_CACHE_NAME) {
                        console.log(`[SW ${CACHE_VERSION}] 🗑️ 删除旧版缓存库:`, cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// =========================================================
// 4. 拦截请求：调度交通 (Fetch) - 动态按需缓存
// =========================================================
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = request.url.toLowerCase();

    // 1. 放行非 HTTP 请求 和 非 GET 请求
    if (!url.startsWith('http') || request.method !== 'GET') return;

    // 2. 放行带有 Range 请求头的文件 (Safari 核心限制，解决媒体截断问题)
    if (request.headers.has('range')) return;

    // 💥 模拟器相关文件的特殊处理逻辑 💥
    const isEmulatorRelated = [
        '/emulator_data/', '/rom/', '/game/',
        '.gba', '.sfc', '.smc', '.nes', '.gb', '.gbc', '.wasm'
    ].some(keyword => url.includes(keyword));

    if (isEmulatorRelated) {
        // 放行即时存档 (State/Sav)，绝对不能缓存用户的存档！
        if (url.includes('.sav') || url.includes('.state')) {
            return; 
        }

        // 策略 A：游戏核心/ROM -> 异步按需缓存 (Cache First, then Network)
        event.respondWith(
            caches.open(GAME_CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    return cachedResponse; // 有缓存直接秒开
                }
                
                // 没缓存，去网络拉取，并塞入游戏缓存库
                try {
                    const networkResponse = await fetch(request);
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        cache.put(request, networkResponse.clone());
                        console.log(`[SW 游戏缓存] 已缓存: ${url.split('/').pop()}`);
                    }
                    return networkResponse;
                } catch (error) {
                    console.error('[SW 游戏拉取断网]:', error);
                }
            })
        );
        return;
    }

    // 策略 B：音乐/媒体文件 -> 异步按需缓存 (点击哪个，缓存哪个)
    const isMedia = /\.(mp3|mp4|zip)$/.test(url);
    if (isMedia) {
        event.respondWith(
            caches.open(MEDIA_CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(request);
                if (cachedResponse) return cachedResponse;
                
                try {
                    const networkResponse = await fetch(request);
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(request, networkResponse.clone());
                        console.log(`[SW 媒体缓存] 已缓存: ${decodeURIComponent(url.split('/').pop())}`);
                    }
                    return networkResponse;
                } catch (error) {
                    console.error('[SW 媒体拉取断网]:', error);
                }
            })
        );
        return;
    }

    // 策略 C：常规网页骨架 (HTML/CSS/JS) -> 异步校验刷新 (Stale While Revalidate)
    event.respondWith(
        caches.open(CORE_CACHE_NAME).then(async (cache) => {
            const cachedResponse = await cache.match(request);
            
            // 无论有没有缓存，都去网络拉取最新版，偷偷更新本地缓存
            const networkFetchPromise = fetch(request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            }).catch(() => {});
            
            // 如果有缓存，立刻吐出旧页面给用户看；同时后台在悄悄执行 networkFetchPromise 更新金库
            return cachedResponse || networkFetchPromise;
        })
    );
});