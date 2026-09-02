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
// 4. 拦截请求：调度交通 (Fetch)
// =========================================================
self.addEventListener('fetch', event => {
    const url = event.request.url;

    // 👇 核心修复 1：绝对放行非 HTTP 请求 (如 blob:, data:, file:)
    // 手机端模拟器读取存档时通常会生成 blob: 本地链接，SW 拦截会导致直接无响应
    if (!url.startsWith('http')) return;

    // 👇 核心修复 2：绝不拦截带有 Range 的流式分片请求
    // 手机端（尤其是 iOS/Safari）加载游戏 ROM 或读写内存时依赖 206 分片响应，SW 强行返回 200 会导致读写失效
    if (event.request.headers.has('range')) return;

    // 只拦截 GET 请求，其他请求（如 POST、PUT，包含某些云存档操作）直接放行
    if (event.request.method !== 'GET') return;

    const isMediaOrRom = CACHE_URL_KEYWORDS.some(keyword => url.includes(keyword));

    if (isMediaOrRom) {
        // -----------------------------------------------------
        // 策略 A：大文件按需加载（缓存优先，没有再下载）
        // -----------------------------------------------------
        event.respondWith(
            caches.open(MEDIA_CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) {
                    console.log('[按需缓存] 命中本地大文件 🚀:', url);
                    return cachedResponse;
                }

                console.log('[按需缓存] 下载并存入本地 ⬇️:', url);
                try {
                    const networkResponse = await fetch(event.request);
                    // 确保请求成功再缓存
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                } catch (error) {
                    console.error('[按需缓存] 媒体请求断网失败:', error);
                }
            })
        );
    } else {
        // -----------------------------------------------------
        // 策略 B：核心框架及其他文件（缓存优先，离线保底）
        // -----------------------------------------------------
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                // 1. 如果金库里有，直接给用户（实现断网秒开）
                if (cachedResponse) {
                    return cachedResponse;
                }

                // 2. 金库里没有，尝试去网上现拉
                return fetch(event.request).then(networkResponse => {
                    // 如果拉取失败，或者不是同源的安全请求（比如不蒜子的统计跨域），直接返回，不瞎缓存
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // 把新发现的好东西也悄悄塞进核心金库里
                    const responseToCache = networkResponse.clone();
                    caches.open(CORE_CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                }).catch(() => {
                    console.log('[Service Worker] 🌐 完全断网且本地无缓存:', url);
                    // 在这里，如果是断网状态，所有在 CORE_ASSETS 里的文件早就命中返回了。
                    // 走到这里的，通常是没缓存的外链，比如不蒜子统计脚本。断了就断了，不影响主体页面运行。
                });
            })
        );
    }
});