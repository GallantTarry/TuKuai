// =========================================================
// 1. 定义双缓存池与版本号
// =========================================================
// 核心金库：每次修改网页骨架，把 v2 改成 v3
const CORE_CACHE_NAME = 'tukuai-core-v3';
// 媒体金库
const MEDIA_CACHE_NAME = 'tukuai-media-v3';

// 核心物资清单
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
// 2. 安装阶段 (Install)
// =========================================================
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CORE_CACHE_NAME).then(cache => {
            console.log('[SW] ⚙️ 正在预缓存核心物资...');
            return cache.addAll(CORE_ASSETS);
        })
    );
});

// =========================================================
// 3. 激活阶段 (Activate)
// =========================================================
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CORE_CACHE_NAME && cacheName !== MEDIA_CACHE_NAME) {
                        console.log('[SW] 🗑️ 删除旧金库:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// =========================================================
// 4. 拦截请求：调度交通 (Fetch) - 💥 绝对绕过模拟器版 💥
// =========================================================
self.addEventListener('fetch', event => {
    const url = event.request.url.toLowerCase();

    // 1. 放行非 HTTP 请求 和 非 GET 请求
    if (!url.startsWith('http') || event.request.method !== 'GET') return;

    // 💥💥 核心终极绕过：绝对不碰模拟器的任何东西！ 💥💥
    const isEmulatorRelated = [
        '/emulator_data/',  // 模拟器核心依赖夹
        '/rom/',            // 游戏 ROM 夹
        '/game/',           // 模拟器 HTML 页面所在的夹
        '.gba', '.sfc', '.smc', '.nes', '.gb', '.gbc', // 游戏本体后缀
        '.sav', '.state'    // 存档文件后缀
    ].some(keyword => url.includes(keyword));

    // 如果带有 range 请求，或者是模拟器相关文件，直接 return 踢回给浏览器原生处理！
    if (event.request.headers.has('range') || isEmulatorRelated) {
        console.log('[SW] 🚀 触发免检通道，完全放行模拟器相关文件:', url);
        return;
    }

    // =========================================
    // 下面是常规的音乐和网页缓存逻辑，跟游戏完全无关
    // =========================================
    const isMedia = /\.(mp3|mp4|zip)$/.test(url);

    if (isMedia) {
        event.respondWith(
            caches.open(MEDIA_CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) return cachedResponse;
                try {
                    const networkResponse = await fetch(event.request);
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                } catch (error) {
                    console.error('[SW 媒体断网]:', error);
                }
            })
        );
    } else {
        event.respondWith(
            caches.open(CORE_CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                const networkFetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {});
                return cachedResponse || networkFetchPromise;
            })
        );
    }
});