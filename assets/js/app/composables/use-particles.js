/**
 * ============================================================================
 * 文件路径：assets/js/app/composables/use-particles.js
 * 文件作用：【全屏鼠标移动 / 手指滑动的彩色像素粒子拖尾特效】
 * ============================================================================
 *
 * 【通俗理解：这个文件是怎么画出鼠标拖尾粒子的？】
 * 因为我们在 `css/style.css` 里用 `* { cursor: none !important; }` 隐藏了系统默认的鼠标箭头，
 * 取而代之的是：当你在屏幕上移动鼠标（或在手机上滑动手指）时，指针位置会不断喷洒出五颜六色的像素小圆点，
 * 像烟花火星一样向四周散开、受重力微微下坠、慢慢变淡消失。
 *
 * 【核心黑科技：高刷屏帧率自适应（`timeScale`）】
 * 以前写粒子动画有个常见 Bug：
 *   浏览器的 `requestAnimationFrame` 是跟着显示器刷新率跑的。
 *   普通手机/显示器是 60Hz（每秒跑 60 次，每两帧间隔约 `16.66 毫秒`）；
 *   但电竞显示器是 144Hz 甚至 240Hz（每秒跑 240 次，每两帧间隔只有 `4.16 毫秒`）！
 *   如果每跑一帧都固定扣掉粒子相同的生命值，240Hz 电脑上的粒子会比 60Hz 手机快 4 倍消失（瞬间闪没了）！
 *
 *   所以我们在下面第 102 行算了 `timeScale = 两帧实际经过的毫秒数 / 16.66`：
 *   在 240Hz 屏幕上，`timeScale` 只有 `0.25`，单帧扣血量自动减为 1/4，
 *   从而保证无论在 60Hz 手机还是 240Hz 电竞屏上，粒子存活的真实时间完全一样！
 */
(function (TK) {
    'use strict';

    const {ref, onMounted} = Vue;

    /** 粒子随机抽取的 5 种霓虹颜色（天蓝、霓虹紫、赛博绿、明黄、樱花粉） */
    const PARTICLE_COLORS = ['#38bdf8', '#a855f7', '#4ade80', '#facc15', '#ec4899'];
    /** 以标准 60Hz 屏幕的单帧时间（1000ms ÷ 60 ≈ 16.66ms）作为 1 倍速基准 */
    const BASE_FRAME_MS = 16.66;
    /** 鼠标每移动一下，在指针处同时生成几个粒子（数字越大粒子越密） */
    const PARTICLES_PER_MOVE = 2;

    /**
     * 单个粒子的“图纸”（Class 类）：
     * 每一颗被喷出来的粒子都有自己的坐标 `(x, y)`、速度 `(vx, vy)`、大小 `size`、剩余生命 `life`、衰老速度 `decay` 和颜色 `color`。
     */
    class Particle {
        /**
         * 创建一个新粒子（出生在鼠标/手指当前所在的 `(x, y)` 坐标）
         */
        constructor(x, y) {
            this.x = x;
            this.y = y;
            // 随机飞散角度：0 到 2π（360° 全方向随机）
            const angle = Math.random() * Math.PI * 2;
            // 随机初始飞散速度：1 到 4 像素/帧
            const speed = Math.random() * 3 + 1;
            // 用三角函数 cos / sin 把“角度+速度”拆解成水平速度 vx 和垂直速度 vy
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            // 随机粒子直径：取 2、4、6 像素（偶数倍，保持颗粒分明的像素风）
            this.size = Math.floor(Math.random() * 3 + 1) * 2;
            // 初始生命值为满血 1（也就是 100% 不透明度）
            this.life = 1;
            // 随机每帧衰减速度（0.015 ~ 0.035）：让不同粒子有快有慢地消失，更自然
            this.decay = Math.random() * 0.02 + 0.015;
            // 从 5 种霓虹色里随机挑一种颜色
            this.color = TK.utils.randomItem(PARTICLE_COLORS);
        }

        /**
         * 每一帧更新粒子的物理位置与剩余生命值
         * @param {number} timeScale 帧率缩放倍率（60Hz 下约为 1，240Hz 下约为 0.25）
         */
        update(timeScale = 1) {
            this.vx *= 0.94;          // 水平空气阻力：每帧速度衰减 6%，飞出去后慢慢停下
            this.vy *= 0.94;          // 垂直空气阻力
            this.vy += 0.08;          // 轻微重力加速度：让粒子有像火花一样往下坠落的感觉
            this.x += this.vx;        // 更新横坐标
            this.y += this.vy;        // 更新纵坐标
            this.life -= this.decay * timeScale; // 按屏幕真实帧率扣除生命值
        }

        /**
         * 把这颗粒子画到全屏画布上
         * @param {CanvasRenderingContext2D} ctx 画布 2D 绘图上下文
         */
        draw(ctx) {
            ctx.fillStyle = this.color;
            // 剩余生命值就是当前的不透明度（最小不能低于 0）
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    TK.composables.useParticles = function useParticles() {
        /** 绑定 `index.html` 里的 `<canvas ref="particleCanvas">` 元素 */
        const particleCanvas = ref(null);

        const init = () => {
            const canvas = particleCanvas.value;
            const ctx = canvas.getContext('2d');
            // 让画布宽高等于浏览器窗口宽高
            let width = canvas.width = window.innerWidth;
            let height = canvas.height = window.innerHeight;
            // 存放当前屏幕上所有还活着的粒子的数组
            const particles = [];

            // 当用户调整浏览器窗口大小时，同步更新画布尺寸
            window.addEventListener('resize', () => {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            });

            // 在指定坐标生成 2 颗新粒子
            const spawn = (x, y) => {
                for (let i = 0; i < PARTICLES_PER_MOVE; i++) particles.push(new Particle(x, y));
            };

            // 电脑端：监听鼠标移动
            window.addEventListener('mousemove', (e) => spawn(e.clientX, e.clientY));
            // 手机端：监听手指滑动（passive: true 告诉浏览器我们不会阻止页面正常滚动，保证滑动丝滑）
            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) spawn(e.touches[0].clientX, e.touches[0].clientY);
            }, {passive: true});

            // 记录上一帧的时间戳
            let lastTime = performance.now();

            // 动画无限循环函数（浏览器每刷新一帧就会调用一次 animate）
            const animate = (now) => {
                // 算出距离上一帧过去了多少毫秒，再除以 16.66 得到帧率倍率
                const timeScale = (now - lastTime) / BASE_FRAME_MS;
                lastTime = now;

                // 先把上一帧画的旧画面擦干净
                ctx.clearRect(0, 0, width, height);

                // 从后往前遍历所有粒子（为什么要倒着遍历？因为当粒子生命 <= 0 从数组里删掉时，倒着删不会影响前面还没遍历到的粒子下标！）
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.update(timeScale);
                    p.draw(ctx);
                    if (p.life <= 0) particles.splice(i, 1); // 生命耗尽，从数组里移除
                }

                // 恢复画布默认不透明度为 1，并预约下一帧继续执行 animate
                ctx.globalAlpha = 1;
                requestAnimationFrame(animate);
            };

            // 启动第一帧动画
            requestAnimationFrame(animate);
        };

        onMounted(init);

        return {particleCanvas};
    };

})(window.TuKuai);
