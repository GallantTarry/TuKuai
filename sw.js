// 缓存库的名称（你可以随时修改版本号来强制刷新缓存）
const CACHE_NAME = 'tukuai-media-cache-v1';

// 我们只拦截并缓存包含这些关键词的路径（音乐和游戏ROM）
const CACHE_URL_KEYWORDS = ['/music/', '/rom/', '/game/'];

// 1. 安装阶段：立即接管当前网页
self.addEventListener('install', event => {
    self.skipWaiting();
    console.log('[Service Worker] 安装成功，已准备好按需缓存。');
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// 2. 拦截请求的核心逻辑
self.addEventListener('fetch', event => {
    const url = event.request.url;

    // 检查这个请求是不是音乐或者游戏 ROM
    const isMediaOrRom = CACHE_URL_KEYWORDS.some(keyword => url.includes(keyword));

    if (isMediaOrRom) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                // 步骤 A：去浏览器的本地金库里找找看有没有这个文件
                const cachedResponse = await cache.match(event.request);
                
                if (cachedResponse) {
                    console.log('[按需缓存] 命中本地文件，秒开！不需要网络下载 🚀:', url);
                    return cachedResponse;
                }

                // 步骤 B：本地没有，走网络下载
                console.log('[按需缓存] 第一次加载，正在从网络下载并存入本地 ⬇️:', url);
                try {
                    const networkResponse = await fetch(event.request);
                    
                    // 确保请求成功才缓存 (状态码 200)
                    if (networkResponse && networkResponse.status === 200) {
                        // 克隆一份数据存入本地缓存，原件返回给页面播放/运行
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                } catch (error) {
                    console.error('[按需缓存] 网络请求失败:', error);
                    throw error;
                }
            })
        );
    }
    // 如果不是音乐和游戏，就不做任何拦截，走正常的网络请求
});