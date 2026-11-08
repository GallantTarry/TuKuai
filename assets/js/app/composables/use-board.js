/**
 * ==========================================================================================
 * 【文件名称】use-board.js
 * 【文件作用】「土块画板」功能模块 —— 控制「我的简介」页面里的全服实时共享涂鸦画板。
 *
 * 【在页面哪里能看到它？】
 *   在「我的简介」标签页，点击右上角的「公告」按钮，身份档案面板会像果冻一样弹动并翻转成一块画板。
 *
 * 【这块画板有哪些核心能力？】
 *   1. 全服实时协同（WebSocket）：
 *      · 你画的每一笔，都会通过网络实时发送给服务器（wss://api.tukuai.art/board），
 *        同一时间打开画板的所有访客都能立刻看到你画的线条。
 *      · 首次打开画板时，服务器会把之前大家画过的历史线条（最多保留 5000 条）发过来，还原在画布上。
 *   2. 跨设备比例坐标（0 到 1 归一化）：
 *      · 无论你用的是 4K 大显示器还是小屏幕手机，画布的宽高比固定为 16:10。
 *      · 我们存的不是死板的像素坐标（如 x=300px），而是百分比比例（如 x=0.5 代表正中间）。
 *        这样手机上画在正中间的一笔，在电脑大屏上也一定在正中间，绝不错位。
 *   3. 视网膜高清屏（Retina DPR）适配：
 *      · 苹果电脑、高端手机的屏幕 1 个 CSS 像素对应 2~3 个物理像素点。
 *      · 我们把画布内部像素放大到「CSS 宽高 × 设备像素比（上限 2.5 倍）」，线条边缘丝滑锐利不发虚。
 *   4. 40 毫秒批量合并发送（节流降压）：
 *      · 鼠标快速滑动一秒钟会产生上百个坐标点；如果每一点都单独发网络包，服务器会卡死。
 *      · 所以我们先攒在数组里，每 40 毫秒打包发送一次（draw_batch），既流畅又省流量。
 *   5. 一键清屏 + 断线自动重连：
 *      · 点击垃圾桶按钮可清空全服画板，并触发 CRT 闪光消散特效；
 *      · 如果网络闪断，只要画板还开着，每 3 秒会自动尝试重新连接。
 * ==========================================================================================
 */
(function (TK) {
    'use strict';

    // 从 Vue 中取出响应式工具：
    //   ref      ：创建响应式变量（读取/修改用 .value）
    //   computed ：创建自动联动计算的只读变量
    //   watch    ：监听某个响应式变量的变化并执行回调
    //   nextTick ：等 Vue 把网页 DOM 更新完毕后再执行下一步
    //   onMounted：页面加载完成后执行一次
    const {ref, computed, watch, nextTick, onMounted} = Vue;

    // ==========================================================================================
    // 一、画板可调参数常量（想调整画板清晰度、历史条数上限、颜色、画笔粗细，改这里即可）
    // ==========================================================================================

    /**
     * 设备像素比（DPR）放大上限：
     * 设为 2.5 倍可以在 2K/4K/手机视网膜屏上获得极高清晰度，同时避免 3x/4x 屏显存占用过高导致掉帧。
     */
    const MAX_DPR = 2.5;

    /**
     * 本地历史线条保留上限：
     * 最多保留最近 5000 条线段；当累积超过 5500 条（HISTORY_TRIM_AT）时，自动裁掉最早的多余线条，
     * 防止长时间挂机画画导致浏览器内存膨胀。
     */
    const HISTORY_LIMIT = 5000;
    const HISTORY_TRIM_AT = 5500;

    /** 本地画笔轨迹合并发送的时间间隔（40 毫秒 ≈ 每秒最多发 25 次网络包） */
    const BATCH_SEND_INTERVAL = 40;

    /** WebSocket 网络断开后，隔多久自动尝试重连（3000 毫秒 = 3 秒） */
    const RECONNECT_DELAY = 3000;

    /** 点击「清空」按钮时，画布闪白消散动画持续的时间（400 毫秒） */
    const CLEAR_ANIMATION_MS = 400;

    /** 浏览器窗口缩放（resize）时的防抖等待时间（100 毫秒），避免拖拽窗口边缘时每毫秒都重绘 */
    const RESIZE_DEBOUNCE = 100;

    /**
     * 坐标四舍五入精度：
     * 乘以 10000 取整再除以 10000 = 保留小数点后 4 位（例如 0.12345678 → 0.1235）。
     * 这样能把发送给服务器的 JSON 数据体积压缩 60% 以上，同时肉眼完全看不出精度损失。
     */
    const COORD_PRECISION = 10000;

    /**
     * 画板右上角提供的 5 种经典画笔颜色：
     * 依次为：天蓝(#38bdf8)、荧光绿(#4ade80)、明黄(#facc15)、霓虹紫(#a855f7)、珊瑚红(#ef4444)。
     * 与「我的简介」页面底部的 5 个彩色胶囊按钮配色一一呼应。
     */
    const HOME_COLORS = ['#38bdf8', '#4ade80', '#facc15', '#a855f7', '#ef4444'];

    /**
     * 画笔粗细档位列表：
     * 点击画板右上角的画笔按钮，会在这三档之间循环切换（细 → 中 → 粗 → 细）。
     * size 是基础像素粗细，真正画到高清画布上时还会乘以屏幕像素比（DPR）。
     */
    const BRUSH_SIZES = [
        {label: '细', size: 2},
        {label: '中', size: 4},
        {label: '粗', size: 8}
    ];

    /** 获取当前屏幕的安全像素比（在 1 到 2.5 之间） */
    const getDpr = () => Math.min(window.devicePixelRatio || 1, MAX_DPR);

    /** 将 0~1 的小数坐标四舍五入保留 4 位小数 */
    const roundCoord = (value) => Math.round(value * COORD_PRECISION) / COORD_PRECISION;

    /**
     * 创建「土块画板」功能模块
     * @param {Vue.Ref<string>} currentTab 当前激活的左侧菜单标签名（当切回 'about' 简介页时需重新校准画布尺寸）
     */
    TK.composables.useBoard = function useBoard(currentTab) {
        // ======================================================================================
        // 二、Vue 响应式状态变量（直接绑定在 index.html 模板上）
        // ======================================================================================

        /**
         * 当前是否处于「画板模式」：
         *   · false（默认）：显示个人身份档案卡片
         *   · true         ：显示全服涂鸦画板
         */
        const showCanvas = ref(false);

        /**
         * 绑定到 index.html 中 `<canvas ref="globalBoardCanvas">` 元素的引用。
         * 当画板显示出来后，globalBoardCanvas.value 就是那个真实的 <canvas> DOM 节点。
         */
        const globalBoardCanvas = ref(null);

        /** 当前选中的画笔颜色（默认使用荧光绿 #4ade80） */
        const boardColor = ref('#4ade80');

        /** 当前选中的画笔粗细档位下标（0=细，1=中，2=粗；默认 1 即「中」） */
        const currentBrushIndex = ref(1);

        /** 【自动计算】当前画笔的像素粗细数值（2 / 4 / 8） */
        const boardLineWidth = computed(() => BRUSH_SIZES[currentBrushIndex.value].size);

        /** 【自动计算】当前画笔粗细按钮上显示的汉字（'细' / '中' / '粗'） */
        const boardLineWidthText = computed(() => BRUSH_SIZES[currentBrushIndex.value].label);

        /**
         * 点击「画笔粗细」按钮时触发：在「细 → 中 → 粗 → 细」之间循环切换。
         * 取模运算 `% BRUSH_SIZES.length` 保证了加到 3 时自动回到 0。
         */
        const cycleBrushSize = () => {
            currentBrushIndex.value = (currentBrushIndex.value + 1) % BRUSH_SIZES.length;
        };

        /**
         * WebSocket 实时协同服务器的连接状态：
         *   · 'connecting' ：正在连接服务器（左下角亮黄灯）
         *   · 'online'     ：已连上全服同步（左下角亮绿灯）
         *   · 'offline'    ：离线单机模式（左下角亮灰灯，依然可以在本地画画）
         */
        const boardWsState = ref('connecting');

        /** 当前画布上累积的总线条数量（显示在左下角 `LIVE // xxx LINES`） */
        const boardLineCount = ref(0);

        /** 是否正在播放「一键清空」的 CRT 闪光消散动画 */
        const isClearingBoard = ref(false);

        /** 切换「档案 ⇄ 画板」时，控制外层毛玻璃大面板播放一次「果冻回弹（panel-jelly）」CSS 动画 */
        const panelJelly = ref(false);

        /**
         * 【自动计算】画板左下角状态小圆点的 CSS 类名：
         * 正在清屏时返回 'clearing'（红灯闪烁），平时返回连接状态（'online' / 'connecting' / 'offline'）。
         */
        const boardSyncStatusClass = computed(() => isClearingBoard.value ? 'clearing' : boardWsState.value);

        /**
         * 【自动计算】画板左下角状态栏显示的英文提示词：
         *   · 清屏瞬间：`[SYS] BOARD REBOOTED`
         *   · 在线同步：`LIVE // 128 LINES`
         *   · 连接中  ：`CONNECTING...`
         *   · 离线时  ：`OFFLINE MODE`
         */
        const boardSyncStatusText = computed(() => {
            if (isClearingBoard.value) return '[SYS] BOARD REBOOTED';
            if (boardWsState.value === 'online') return `LIVE // ${boardLineCount.value} LINES`;
            if (boardWsState.value === 'connecting') return 'CONNECTING...';
            return 'OFFLINE MODE';
        });

        // ======================================================================================
        // 三、内部私有变量（不需要触发网页 HTML 重绘，用普通 let 变量保存即可，性能更高）
        // ======================================================================================
        let boardWs = null;          // WebSocket 连接实例
        let boardCtx = null;         // Canvas 2D 绘图上下文（相当于画布上的「画笔引擎」）
        let boardHistory = [];       // 本地保存的所有历史线条数组：[{x0, y0, x1, y1, color, width}, ...]
        let isBoardDrawing = false;  // 当前鼠标左键是否按住 / 手指是否正贴在画布上画画
        let lastX = 0;               // 上一笔触的 X 比例坐标（0~1）
        let lastY = 0;               // 上一笔触的 Y 比例坐标（0~1）
        let pendingDrawData = [];    // 攒着准备批量发给服务器的线条队列
        let batchSendTimer = null;   // 40ms 批量发送定时器编号
        let reconnectTimer = null;   // 3s 断线重连定时器编号
        let resizeTimer = null;      // 100ms 窗口缩放防抖定时器编号
        let panelJellyTimer = null;  // 果冻动画结束清理定时器编号

        /** 检查 WebSocket 当前是否处于已接通（OPEN）可发送状态 */
        const isWsOpen = () => boardWs && boardWs.readyState === WebSocket.OPEN;

        /**
         * 把一批线条追加到本地历史记录中，并在超出上限时自动裁剪最旧的线条，最后更新左下角线条计数。
         * @param {Array<Object>} lines 新增的线条数组
         */
        const pushHistory = (lines) => {
            boardHistory.push(...lines);
            if (boardHistory.length > HISTORY_TRIM_AT) boardHistory = boardHistory.slice(-HISTORY_LIMIT);
            boardLineCount.value = boardHistory.length;
        };

        // ======================================================================================
        // 四、Canvas 画布底层绘制方法
        // ======================================================================================

        /**
         * 在 Canvas 画布上真正画出一小段线条。
         *
         * @param {number} x0    起点水平比例（0 = 最左边，1 = 最右边）
         * @param {number} y0    起点垂直比例（0 = 最上边，1 = 最下边）
         * @param {number} x1    终点水平比例
         * @param {number} y1    终点垂直比例
         * @param {string} color 线条颜色（如 '#4ade80'）
         * @param {number} [width=4] 画笔粗细档位（2 / 4 / 8）
         */
        const renderLine = (x0, y0, x1, y1, color, width = 4) => {
            const cvs = globalBoardCanvas.value;
            // 如果画布还没挂载、或者宽高为 0，直接跳过
            if (!cvs || !boardCtx || cvs.width === 0 || cvs.height === 0) return;

            // 把 0~1 的比例坐标换算成当前画布上的真实像素坐标
            const absX0 = x0 * cvs.width;
            const absY0 = y0 * cvs.height;
            const absX1 = x1 * cvs.width;
            const absY1 = y1 * cvs.height;
            // 画笔实际像素粗细 = 档位粗细 × 屏幕像素比
            const actualWidth = (width || 4) * getDpr();

            boardCtx.beginPath();
            // 如果起点和终点几乎重合（用户只是原地轻点了一下鼠标/屏幕），画一个饱满的实心圆点
            if (Math.abs(absX1 - absX0) < 0.5 && Math.abs(absY1 - absY0) < 0.5) {
                boardCtx.arc(absX0, absY0, actualWidth / 2, 0, Math.PI * 2);
                boardCtx.fillStyle = color;
                boardCtx.fill();
            } else {
                // 否则从起点连一条圆头圆角的平滑线段到终点
                boardCtx.moveTo(absX0, absY0);
                boardCtx.lineTo(absX1, absY1);
                boardCtx.strokeStyle = color;
                boardCtx.lineWidth = actualWidth;
                boardCtx.lineCap = 'round';  // 线条两端做成圆头，防止接缝处出现锯齿裂口
                boardCtx.lineJoin = 'round'; // 折角处做成圆角
                boardCtx.stroke();
            }
            boardCtx.closePath();
        };

        /**
         * 清空画布并把 `boardHistory` 里的所有历史线条重新画一遍。
         * 当首次收到服务器历史记录、或者浏览器窗口大小改变导致画布尺寸重置时调用。
         */
        const redrawAll = () => {
            const cvs = globalBoardCanvas.value;
            if (!cvs || !boardCtx) return;
            boardCtx.clearRect(0, 0, cvs.width, cvs.height);
            boardHistory.forEach((line) => renderLine(line.x0, line.y0, line.x1, line.y1, line.color, line.width));
        };

        // ======================================================================================
        // 五、画布尺寸与高清屏（DPR）自适应
        // ======================================================================================

        /**
         * 同步画布的内部像素分辨率 = 当前网页上显示的宽高 × 设备像素比（DPR）。
         * 注意：Canvas 的 width/height 属性一旦修改，浏览器会自动清空画布内容，所以修改后必须调用 redrawAll() 重绘。
         *
         * @param {boolean} ensureContext 是否强制确保获取 2D 上下文（初始化时传 true）
         */
        const syncCanvasSize = (ensureContext) => {
            const cvs = globalBoardCanvas.value;
            if (!cvs) return;

            // 读取画布在网页上当前实际占用的 CSS 像素宽高
            const rect = cvs.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const dpr = getDpr();
                const newW = Math.round(rect.width * dpr);
                const newH = Math.round(rect.height * dpr);
                // 只有当分辨率确实发生变化（或尚未拿到绘图上下文）时才重置画布并重绘
                if (cvs.width !== newW || cvs.height !== newH || (ensureContext && !boardCtx)) {
                    cvs.width = newW;
                    cvs.height = newH;
                    boardCtx = cvs.getContext('2d');
                    redrawAll();
                }
            } else if (ensureContext && !boardCtx) {
                // 如果画布刚创建、动画还没展开（宽高暂时为 0），先拿到 2D 上下文备用
                boardCtx = cvs.getContext('2d');
            }
        };

        /** 窗口尺寸变化时校准画布分辨率 */
        const resizeBoard = () => syncCanvasSize(false);

        /** 画板初始化时校准画布分辨率并确保拿到 2D 上下文 */
        const initBoardCanvas = () => syncCanvasSize(true);

        /** 窗口缩放事件的防抖包装：窗口停止拖动 100ms 后再执行重算 */
        const handleBoardResize = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeBoard, RESIZE_DEBOUNCE);
        };

        // ======================================================================================
        // 六、WebSocket 全服实时同步通信
        // ======================================================================================

        /**
         * 收到服务器发来的 WebSocket 消息时的处理函数。
         * 服务器发来的 JSON 有 4 种类型（msg.type）：
         *   · 'history'    ：刚连上时服务器发来的全服历史笔触数组
         *   · 'draw'       ：其他网友画的单条线段
         *   · 'draw_batch' ：其他网友发来的一批线段
         *   · 'clear'      ：其他网友点击了清空画板
         */
        const handleWsMessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                switch (msg.type) {
                    case 'history':
                        boardHistory = (msg.data || []).slice(-HISTORY_LIMIT);
                        boardLineCount.value = boardHistory.length;
                        boardWsState.value = 'online';
                        redrawAll();
                        break;
                    case 'draw':
                        pushHistory([msg.data]);
                        renderLine(msg.data.x0, msg.data.y0, msg.data.x1, msg.data.y1, msg.data.color, msg.data.width);
                        break;
                    case 'draw_batch':
                        pushHistory(msg.data);
                        msg.data.forEach((line) => renderLine(line.x0, line.y0, line.x1, line.y1, line.color, line.width));
                        break;
                    case 'clear':
                        // 收到别人的清屏指令：传 false 表示只清空本地，不再向服务器重复广播
                        clearBoard(false);
                        break;
                }
            } catch (e) {
                // 如果遇到格式损坏的异常数据包，直接忽略，保证画板永不崩溃
            }
        };

        /**
         * 建立到画板协同服务器（TK.config.api.boardWs）的 WebSocket 连接。
         */
        const connectBoardWs = () => {
            // 如果当前已经连上、或者正在连接途中，就不重复创建连接
            if (boardWs && (boardWs.readyState === WebSocket.OPEN || boardWs.readyState === WebSocket.CONNECTING)) {
                if (boardWs.readyState === WebSocket.OPEN) boardWsState.value = 'online';
                return;
            }

            try {
                boardWsState.value = 'connecting';
                boardWs = new WebSocket(TK.config.api.boardWs);

                // 连接成功：状态改为 online，并清除断线重连定时器
                boardWs.onopen = () => {
                    boardWsState.value = 'online';
                    if (reconnectTimer) {
                        clearTimeout(reconnectTimer);
                        reconnectTimer = null;
                    }
                };

                // 收到服务器消息
                boardWs.onmessage = handleWsMessage;

                // 连接断开：状态改为 offline；如果用户还开着画板，3 秒后自动尝试重连
                boardWs.onclose = () => {
                    boardWsState.value = 'offline';
                    if (showCanvas.value && !reconnectTimer) {
                        reconnectTimer = setTimeout(() => {
                            reconnectTimer = null;
                            if (showCanvas.value) connectBoardWs();
                        }, RECONNECT_DELAY);
                    }
                };

                // 连接出错：状态改为 offline
                boardWs.onerror = () => {
                    boardWsState.value = 'offline';
                };
            } catch (e) {
                boardWsState.value = 'offline';
            }
        };

        /** 初始化画板（同时准备好本地画布尺寸 + 连接远程同步服务器） */
        const initBoard = () => {
            initBoardCanvas();
            connectBoardWs();
        };

        // ======================================================================================
        // 七、本地画线、批量打包发送与一键清空
        // ======================================================================================

        /**
         * 画一条线，如果是本地用户画的（isLocal = true），还会存入历史并排队发给服务器。
         */
        const drawLine = (x0, y0, x1, y1, color, isLocal, width = 4) => {
            if (!globalBoardCanvas.value) return;

            // 1. 立即在自己的画布上画出来（零延迟手感）
            renderLine(x0, y0, x1, y1, color, width);
            if (!isLocal) return;

            // 2. 把坐标压缩到 4 位小数，存入本地历史记录
            const lineData = {x0: roundCoord(x0), y0: roundCoord(y0), x1: roundCoord(x1), y1: roundCoord(y1), color, width};
            pushHistory([lineData]);

            // 3. 如果已连上服务器，放进待发送队列，每 40ms 合并发送一次
            if (!isWsOpen()) return;
            pendingDrawData.push(lineData);

            if (!batchSendTimer) {
                batchSendTimer = setTimeout(() => {
                    try {
                        if (isWsOpen() && pendingDrawData.length > 0) {
                            boardWs.send(JSON.stringify({type: 'draw_batch', data: pendingDrawData}));
                        }
                    } catch (e) {
                        // 网络偶发异常发送失败时静默忽略
                    }
                    pendingDrawData = [];
                    batchSendTimer = null;
                }, BATCH_SEND_INTERVAL);
            }
        };

        /**
         * 一键清空画板。
         * @param {boolean} isLocal
         *   · true  ：我自己点了右上角「清空」按钮 → 清空本地画布 + 告诉服务器让全服一起清空
         *   · false ：收到服务器传来的别人清空指令 → 只清空本地画布，不再重复发消息
         */
        const clearBoard = (isLocal) => {
            boardHistory = [];
            boardLineCount.value = 0;
            pendingDrawData = [];
            if (batchSendTimer) {
                clearTimeout(batchSendTimer);
                batchSendTimer = null;
            }

            // 触发 400ms 的 CRT 强光闪白重置动效（对应 style.css 中的 .tukuai-board-container.clearing）
            isClearingBoard.value = true;
            setTimeout(() => {
                isClearingBoard.value = false;
            }, CLEAR_ANIMATION_MS);

            // 擦除 Canvas 像素
            if (boardCtx && globalBoardCanvas.value) {
                boardCtx.clearRect(0, 0, globalBoardCanvas.value.width, globalBoardCanvas.value.height);
            }

            // 如果是本机主动点击清空，向全服广播 clear 指令
            if (isLocal && isWsOpen()) {
                boardWs.send(JSON.stringify({type: 'clear'}));
            }
        };

        // ======================================================================================
        // 八、鼠标与手机触摸屏输入事件处理
        // ======================================================================================

        /**
         * 把鼠标或手指在屏幕上的像素位置（clientX, clientY），
         * 换算成相对于画布左上角的 0~1 比例坐标，并用 clamp01 限制在 [0, 1] 范围内。
         */
        const toBoardPos = (clientX, clientY) => {
            const rect = globalBoardCanvas.value.getBoundingClientRect();
            return {
                x: TK.utils.clamp01((clientX - rect.left) / rect.width),
                y: TK.utils.clamp01((clientY - rect.top) / rect.height)
            };
        };

        /** 从鼠标事件（MouseEvent）中提取画布比例坐标 */
        const getMousePos = (e) => globalBoardCanvas.value ? toBoardPos(e.clientX, e.clientY) : {x: 0, y: 0};

        /** 从手机触摸事件（TouchEvent）中提取第一根手指的画布比例坐标 */
        const getTouchPos = (e) => {
            if (!globalBoardCanvas.value || !e.touches || !e.touches[0]) return {x: 0, y: 0};
            return toBoardPos(e.touches[0].clientX, e.touches[0].clientY);
        };

        /** 落笔（鼠标按下 / 手指接触屏幕）：记录起点，并立刻在原地画一个圆点 */
        const beginStroke = (pos) => {
            isBoardDrawing = true;
            lastX = pos.x;
            lastY = pos.y;
            drawLine(lastX, lastY, pos.x, pos.y, boardColor.value, true, boardLineWidth.value);
        };

        /** 运笔（鼠标拖动 / 手指滑动）：从上一个点连线到当前点，并更新上一个点坐标 */
        const continueStroke = (pos) => {
            if (!isBoardDrawing) return;
            drawLine(lastX, lastY, pos.x, pos.y, boardColor.value, true, boardLineWidth.value);
            lastX = pos.x;
            lastY = pos.y;
        };

        /** 电脑端：鼠标按下开始画画（`e.button !== 0` 用于过滤掉鼠标右键和中键，只响应左键） */
        const startDraw = (e) => {
            if (e.button !== 0) return;
            beginStroke(getMousePos(e));
        };

        /** 电脑端：鼠标移动继续画画 */
        const drawing = (e) => {
            if (!isBoardDrawing) return;
            continueStroke(getMousePos(e));
        };

        /** 手机端：手指按下开始画画 */
        const startDrawTouch = (e) => beginStroke(getTouchPos(e));

        /** 手机端：手指滑动继续画画 */
        const drawingTouch = (e) => {
            if (!isBoardDrawing) return;
            continueStroke(getTouchPos(e));
        };

        /** 抬笔（鼠标松开、鼠标移出画布边界、手指抬起或来电打断）：停止画画 */
        const endDraw = () => {
            isBoardDrawing = false;
        };

        // ======================================================================================
        // 九、「身份档案 ⇄ 土块画板」切换与生命周期钩子
        // ======================================================================================

        /**
         * 让外层毛玻璃主面板播放一次 800ms 的「果冻弹性缩放」动画（对应 CSS `.panel-jelly`）。
         * 先设为 false 再在下一帧设为 true，是为了保证连续快速点击时动画也能重新触发。
         */
        const triggerPanelJelly = () => {
            panelJelly.value = false;
            clearTimeout(panelJellyTimer);
            requestAnimationFrame(() => {
                panelJelly.value = true;
                panelJellyTimer = setTimeout(() => {
                    panelJelly.value = false;
                }, 800);
            });
        };

        /**
         * 点击右上角「公告」或画板内「档案」按钮时触发：在档案与画板之间切换。
         */
        const toggleCanvas = () => {
            triggerPanelJelly();
            showCanvas.value = !showCanvas.value;
            isBoardDrawing = false;

            if (showCanvas.value) {
                // 切入画板模式：第一时间发起 WebSocket 连接（不等动画结束，让历史数据尽早返回）
                connectBoardWs();
                // 因为切换时带有果冻缩放动画，画布的尺寸在 0~350ms 内会不断变化，
                // 所以在动画的不同时间节点多次校准画布尺寸，确保最终画面 100% 清晰贴合。
                nextTick(() => {
                    initBoardCanvas();
                    setTimeout(initBoardCanvas, 100);
                    setTimeout(initBoardCanvas, 260);
                    setTimeout(resizeBoard, 350);
                });
            }
        };

        // 当 <canvas> 元素真正挂载到 DOM 树上时，立即初始化画布尺寸，并在切换动画结束时校准
        watch(globalBoardCanvas, (cvs) => {
            if (!cvs) {
                boardCtx = null;
                return;
            }
            initBoardCanvas();
            setTimeout(initBoardCanvas, 100);
            setTimeout(initBoardCanvas, 300);
            setTimeout(initBoardCanvas, 500);
            setTimeout(resizeBoard, 850);
        });

        // 当用户从其他菜单标签切回「我的简介（about）」且画板正开着时，重新校准一次画布尺寸
        watch(currentTab, (tab) => {
            if (tab === 'about' && showCanvas.value) {
                nextTick(() => {
                    initBoard();
                    setTimeout(resizeBoard, 200);
                });
            }
        });

        // 监听浏览器窗口大小变化，自动调整画布高清分辨率
        window.addEventListener('resize', handleBoardResize);

        // 页面初次加载完成后，如果默认开启了画板，做一次兜底初始化
        onMounted(() => {
            setTimeout(() => {
                if (showCanvas.value) initBoard();
            }, 500);
        });

        // 将模板中需要用到的变量和函数全部导出给 main.js
        return {
            showCanvas, toggleCanvas, panelJelly, initBoard,
            homeColors: HOME_COLORS, boardColor, boardLineWidthText, cycleBrushSize, clearBoard,
            globalBoardCanvas, startDraw, drawing, endDraw, startDrawTouch, drawingTouch,
            isClearingBoard, boardSyncStatusClass, boardSyncStatusText
        };
    };
})(window.TuKuai);
