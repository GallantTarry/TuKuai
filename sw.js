// =========================================================
// 1. 定义双缓存池与版本号
// =========================================================
// 核心金库：存放网页骨架。每次你修改了 index.html 或静态资源，就把 v1 改成 v2, v3...
const CORE_CACHE_NAME = 'tukuai-core-v2';
// 媒体金库：存放按需加载的大文件。
const MEDIA_CACHE_NAME = 'tukuai-media-v2';

// 你需要离线秒开的“核心物资清单”（严格核对你的文件路径）
const CORE_ASSETS = [
    './',                  // 根路径
    './index.html',        // 主网页
    './js/tailwindcss.js', // Tailwind
    './js/vue.global.js',  // Vue
    './font/Silkscreen-Regular.ttf', // 英文字体
    './font/Silkscreen-Bold.ttf',    // 英文粗体
    './font/zpix.ttf',               // 中文像素字体
    './imgs/favicon.png',
    './imgs/favicon.ico',
    './imgs/applefavicon.png',
    './imgs/bg.avif',      // 随机背景图（把所有的都写上）
    './imgs/bg1.jpg',
    './imgs/bg2.jpg',
    './imgs/bg3.jpg',
    './imgs/bg4.jpg',
    './imgs/music-cover.png' // 灵动岛封面
];

// 按需缓存的关键词拦截
const CACHE_URL_KEYWORDS = ['/music/', '/rom/', '/game/'];

// =========================================================
// 2. 安装阶段：预缓存核心物资 (Install)
// =========================================================
self.addEventListener('install', event => {
    // 强制立即接管，不等待旧版本 SW 退出
    self.skipWaiting();

    // waitUntil 确保把核心物资全部下载并塞进金库后，安装才算完成
    event.waitUntil(
        caches.open(CORE_CACHE_NAME).then(cache => {
            console.log('[Service Worker] ⚙️ 正在预缓存核心框架物资...');
            return cache.addAll(CORE_ASSETS);
        }).catch(err => {
            console.error('[Service Worker] ❌ 预缓存失败，请检查 CORE_ASSETS 中的文件路径是否完全正确:', err);
        })
    );
});

// =========================================================
// 3. 激活阶段：清理旧版本垃圾 (Activate)
// =========================================================
self.addEventListener('activate', event => {
    // 宣誓主权，立刻控制所有打开的页面
    event.waitUntil(self.clients.claim());

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // 如果发现名字不匹配当前版本的缓存，直接销毁，释放用户空间
                    if (cacheName !== CORE_CACHE_NAME && cacheName !== MEDIA_CACHE_NAME) {
                        console.log('[Service Worker] 🗑️ 删除过期的旧金库:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
// =========================================================
// 4. 拦截请求：调度交通 (Fetch) - 终极修复版
// =========================================================
self.addEventListener('fetch', event => {
    const url = event.request.url;

    // 1. 放行非 HTTP 请求
    if (!url.startsWith('http')) return;

    // 2. 只拦截 GET 请求
    if (event.request.method !== 'GET') return;

    // 💥 核心救命修复：绝对不能让缓存触碰模拟器！
    // WebAssembly 引擎和 ROM 必须使用浏览器原生流式传输，否则底层文件系统会瘫痪，导致无法读写存档！
    if (event.request.headers.has('range') || url.includes('/emulator_data/') || url.includes('/rom/')) {
        return; // 直接放行，交给浏览器原生处理
    }

    // 4. 媒体大文件缓存（注意：这里已经删除了 gba、sfc 等游戏后缀）
    const isMediaOrRom = /\.(mp3|mp4|zip)$/i.test(url);

    if (isMediaOrRom) {
        // 策略 A：媒体大文件 -> 纯缓存优先
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
                    console.error('[媒体断网]:', error);
                }
            })
        );
    } else {
        // 策略 B：核心框架页面 -> 异步校验刷新
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