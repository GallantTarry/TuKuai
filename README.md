# 🚀 少侠的个人主页技术栈与实现细节深度解析

它是一个典型的**无构建步骤的现代化单页面应用（SPA）**。你巧妙地结合了轻量级的现代前端框架、原生的 Web API 以及极客风格的 CSS 视觉效果，构建了一个功能丰富且极具个人特色的“Web OS”。

以下是你在这份代码中用到的所有核心技术和实现方案的详细拆解：

## 1. 核心前端框架 (Core Frameworks)

*   **Vue 3 (Composition API) 🟢**
    *   **引入方式**：通过全局 CDN 引入 (`vue.global.js`)，直接在浏览器中编译运行，省去了 Node.js 和 Webpack/Vite 等繁琐的打包构建流程。
    *   **实现细节**：使用了现代的 `setup()` 语法糖。通过 `ref` 进行状态管理（如当前选中的标签页、音乐播放状态、游戏启动状态等）；利用 `computed` 动态计算 CSS 变量（如主题色动态变化）；使用 `watch` 监听音乐播放状态，以触发小电视的颜文字动画。
*   **Tailwind CSS 💨**
    *   **引入方式**：通过 CDN 引入。
    *   **实现细节**：放弃了传统的独立 CSS 文件，使用实用类（Utility-First）直接在 HTML 标签上控制样式（如 `w-full h-[100dvh] flex flex-col items-center justify-center`）。同时也使用了 Tailwind 的响应式前缀（如 `md:w-80`, `md:text-sm`）完美适配了移动端和电脑端。

## 2. 视觉特效与 UI/UX 技术 (Visual & UI/UX)

*   **Glassmorphism (毛玻璃拟物态) 🪟**
    *   **实现细节**：使用了 CSS 的 `backdrop-filter: blur(20px) saturate(180%)` 以及带透明度的背景色 `rgba(15, 20, 30, 0.45)`。这使得你的侧边栏和主面板能透出背景的粒子效果和图片，呈现出高级的极客亚克力质感。
*   **CSS 动态变量 (CSS Variables) 🎨**
    *   **实现细节**：通过 Vue 的 `cssVars` 计算属性，根据当前选中的菜单项（如“电子音乐”是紫色，“我的简介”是蓝色），动态将十六进制颜色转换为 RGB，并注入到最外层 `<div :style="cssVars">` 中。子元素利用 `var(--theme-color)` 和 `var(--theme-glow)` 实现全局主题色的无缝切换。
*   **自定义像素字体 (Custom Pixel Fonts) 👾**
    *   **实现细节**：通过 CSS `@font-face` 引入了本地的英文像素字体（Silkscreen）和中文像素字体（ChinesePixel/zpix.ttf）。结合 Tailwind 的 `tailwind.config` 将其注册为系统级字体，高度契合你独立游戏开发者的极客身份。
*   **CSS 关键帧动画与过渡效果 (Animations & Transitions) 🎬**
    *   **实现细节**：使用了 `transition: all 0.4s` 实现各种悬浮发光效果；自己手写了 `@keyframes dance` 让播放器里的小电视产生左右摇摆的动画；并利用 Vue 的 `<transition name="game-pop">` 实现了复古游戏窗口弹出的丝滑缩放动效。
*   **自定义原生表单元素 🎛️**
    *   **实现细节**：使用 `::-webkit-slider-thumb` 和 `::-webkit-slider-runnable-track` 深度定制了 HTML5 原生的 `<input type="range">` 滑动条，使其符合紫色的玻璃拟物主题。

## 3. 原生 Web API 深度运用 (Native Web APIs)

*   **HTML5 Canvas 粒子系统 (Particle System) 🌌**
    *   **实现细节**：没有依赖第三方库（如 particles.js），而是纯手写了基于 Canvas 2D Context 的粒子系统。定义了 `Particle` 类，通过 `requestAnimationFrame` 实现了粒子的生成、移动、重力下坠（`vy += 0.08`）和逐渐消失（生命周期递减）。并且监听了鼠标和触摸事件，实现了鼠标划过产生粒子的交互。
*   **HTML5 Audio API (音频引擎) 🎵**
    *   **实现细节**：封装了一个完整的音乐播放器。利用 `<audio>` 标签的 `play()`, `pause()`, `currentTime`, `duration` 属性以及 `@timeupdate`, `@ended` 等事件，实现了播放、暂停、进度拖拽、时间显示，以及随机、顺序、单曲循环三种播放模式。
*   **Web Storage API (会话存储) 💾**
    *   **实现细节**：利用 `sessionStorage.setItem('os_booted', 'true')` 记录了开机状态。这使得极其酷炫的 DOS 命令行“启动动画”只会在访客第一次打开时播放，刷新页面后会直接跳过，极大地提升了用户体验。
*   **Fullscreen API (全屏控制) 🔲**
    *   **实现细节**：在复古游戏模块，调用了原生的 `requestFullscreen()` 和 `exitFullscreen()`，让网页内的窗口可以直接接管整个显示器。
*   **Iframe 与跨窗口通信 (Cross-origin Communication) 🎮**
    *   **实现细节**：无论是播放 YouTube 视频还是启动 GBA 模拟器（`emulator.html`），都通过 `<iframe>` 容器实现沙盒隔离运行。并且使用了 `window.postMessage('focus-emulator', '*')` 来解决 iframe 嵌套时焦点丢失导致键盘无法操控游戏的问题。

## 4. 第三方服务与集成 (Third-Party Integration)

*   **不蒜子统计 (Busuanzi) 📊**
    *   **实现细节**：通过在页面底部动态注入 `https://cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js` 脚本，并搭配特定 ID (`busuanzi_site_uv`)，实现了一个赛博朋克风格（配合 `animate-pulse` 闪烁效果）的网站真实访客计数器。

---
