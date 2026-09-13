这份 `index.html` 文件是一个集成度极高、功能非常丰富的单页面应用（SPA），具有浓厚的赛博朋克与复古像素风格。该页面没有使用传统的构建工具（如 Webpack 或 Vite）预编译，而是直接在浏览器端引入全局脚本运行。

以下是该页面所使用的所有前端技术和关键 API 的全面总结：

### 1. 核心框架与基础库

* **Vue.js 3**：通过 `vue.global.js` 全局引入，并深度使用了 Vue 3 的组合式 API（Composition API），包括 `createApp`、`setup`、`ref`、`computed`、`watch`、`nextTick` 和生命周期钩子（`onMounted`），用于状态管理、DOM 更新和逻辑封装。


* **Tailwind CSS**：通过 `tailwindcss.js` 引入并在浏览器端实时解析。使用了其响应式系统（如 `md:hidden`）、原子类，并通过 `<script>` 配置了自定义的像素字体集 `pixel`。



### 2. 浏览器原生 Web API (深度应用)

* **Web Audio API & HTML5 `<audio>**`：用于构建“电子音乐终端”，实现了音乐播放、暂停、进度条拖拽（`currentTime`）、时长读取（`duration`）、音量控制，以及通过 `onended` 实现单曲循环/随机播放逻辑。


* **Media Session API**：通过 `navigator.mediaSession.metadata` 强行接管操作系统级别的媒体控制台（如苹果锁屏和灵动岛），并在外部显示当前播放的歌曲名和自定义的黑底封面图。


* **MediaStream API & MediaRecorder API**：在邮件弹窗功能中，调用 `navigator.mediaDevices.getUserMedia` 获取麦克风权限，并通过 `MediaRecorder` 根据浏览器支持情况（`audio/mp4` 或 `audio/webm`）进行录音。


* **File API & FileReader API**：用于邮件附件功能，读取用户选择的文件并通过 `reader.readAsDataURL(file)` 将其转换为 Base64 格式编码。


* **Intersection Observer API**：实现高级滚动渐显逻辑。当页面元素（如毛玻璃卡片、歌曲列表）进入视口时，动态移除“隐身斗篷”类名，触发 GPU 硬件加速的向上浮现动画。


* **Web Workers**：为了实现页面隐藏时标签页标题的古典祈祷文滚动效果（Marquee），通过 `Blob` 和 `URL.createObjectURL` 动态创建了一个独立线程，利用高频心跳向主线程发送更新指令，防止后台 JS 节流。


* **Service Workers (PWA 支持)**：注册了 `sw.js` 充当核心管家，监听 `updatefound` 事件实现后台版本更新检测和页面的自动热重载。


* **Canvas 2D API**：用于背景的动态鼠标跟随粒子系统，利用 `requestAnimationFrame` 渲染具有拖尾、扩散、衰减效果的粒子动画。


* **Page Visibility API**：通过监听 `visibilitychange`，在用户切换标签页时控制 Web Worker 的启停，并更改文档标题 `document.title`。


* **Fetch API**：用于邮件系统向 Cloudflare Worker 或自定义后端（`[https://api.xn--udsye.art](https://api.xn--udsye.art)`）发送包含 Base64 附件的 JSON 请求。


* **跨窗口通信 (postMessage)**：在使用 `iframe` 嵌入复古游戏模拟器时，利用 `postMessage` 向 iframe 传递 `focus-emulator` 指令同步焦点。


* **History API & 本地存储**：使用 `history.scrollRestoration = 'manual'` 强制禁止浏览器的自动滚动恢复；使用 `localStorage.getItem('os_booted')` 来记忆用户是否已经看过开机乱码动画。



### 3. CSS 高级技术与视觉渲染

* **Glassmorphism (毛玻璃拟物态)**：大量使用 `backdrop-filter: blur() saturate()` 和半透明背景（`rgba`），配合阴影（`box-shadow`）及高光边框制造高级玻璃质感。


* **CSS 变量与全息追光交互**：通过 JS 实时计算鼠标在卡片上的相对坐标，并注入为 CSS 变量（`--mouse-x`, `--mouse-y`），结合 `radial-gradient` 和 `mix-blend-mode: overlay` 创造出玻璃折射的光晕跟随效果。


* **GPU 硬件加速**：在关键动画元素上使用 `will-change: transform, opacity` 和 `transform: translateZ(0)`，强制浏览器分配独立图层以防止掉帧。


* **CRT 复古屏幕特效**：利用线性渐变实现屏幕扫描线（`.scanlines`），使用多重 `box-shadow` 发光，并在“跃迁坍缩”动画中运用 `filter: hue-rotate()` (色相偏移RGB分离) 和拉伸变形（`transform: scale()`）模拟老电视关机。


* **自定义 Web Fonts**：通过 `@font-face` 引入了英文字体 `Silkscreen` 和中文字体 `ChinesePixel` (zpix)，确保全站的像素风格统一。


* **隐藏原生光标与自定义流体光标**：强制将 `cursor` 设为 `none`，用 JS 控制一组 DOM 元素随鼠标移动，实现带有延迟追赶弹性算法的外环以及悬停变色功能。



### 4. 第三方集成组件

* **3D 模型渲染**：引入了 `<script type="module" src="./js/model-viewer.min.js"></script>`，即 Google 提供的基于 WebGL/WebXR 的 3D 模型组件库。


* **不蒜子统计 (Busuanzi)**：通过引入外部脚本（`busuanzi.min.js`），自动统计网站的 PV/UV 并在页面中的绿色数字处展示。


* **Google Analytics 4 (GA4)**：在 `<head>` 中植入了 gtag.js 全局统计探针，用于站点流量分析。



### 5. 移动端与兼容性控制

* **多点触控与手势拦截**：通过监听 `touchstart`、`touchend`、`gesturestart` 事件，强行阻止双指缩放、快速双击放大以及 Safari 的原生捏合手势，确保拟态窗口的稳定性。


* **BFCache 拦截**：针对苹果等浏览器的返回缓存机制，监听了 `pageshow` 事件并在 `event.persisted` 为 true 时，通过 JS 强制重新触发 DOM 回流 (Reflow)，以修复因后退导致的 CSS 动画死锁问题。
