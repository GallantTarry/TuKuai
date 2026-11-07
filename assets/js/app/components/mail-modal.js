/**
 * ============================================================================
 * 文件路径：assets/js/app/components/mail-modal.js
 * 文件作用：「✉️ 密函发送」弹窗组件 `<mail-modal>`（挂载在 `TuKuai.components.MailModal` 上）
 * ============================================================================
 *
 * 【通俗理解：这个组件管什么？】
 * 当用户点击页面左上角的“像素小人头像”时，会弹出一个毛玻璃信箱窗口（「密函发送」）。
 * 访客可以在这个窗口里给你发邮件，功能非常丰富：
 *   1. 输入文字留言（输入框空白时，默认显示《网站内容及版权免责声明》作为背景提示词）
 *   2. 点击 `😀` 挑选 Emoji 表情插入到文字里
 *   3. 点击 `📎` 从电脑/手机选择文件作为邮件附件（支持多选，单个文件限制 5MB 以内）
 *   4. 点击 `🎤` 直接调用麦克风录一段语音作为附件（录完还能在列表里点播放键 `▶️` 试听，或者点 `❌` 删掉重录）
 *   5. 点击 `🪙` 金币按钮，在弹窗正上方展开炫酷的「微信收款码（¥ 1.00）」全息层（"I'm gonna grab a smoke."）
 *   6. 点击「发送」按钮，把文字和所有附件（文件+录音）打包发给你的 Cloudflare Worker 后端接口，由后端转发到你的邮箱
 *
 * 【它是怎么跟主页 `index.html` 联动的？】
 * 在 `index.html` 里写了这样一行：
 *   `<mail-modal v-model="showMailModal" :active-color="activeColor" :active-glow="activeGlow" :avatar-svg="currentAvatarSvg"></mail-modal>`
 *   - `v-model="showMailModal"`：双向绑定弹窗的开关状态（`true` 显示弹窗，`false` 关闭弹窗）
 *   - `:active-color` 和 `:active-glow`：把当前板块的主题色传进来，让弹窗边框、发光阴影、发送按钮颜色跟着当前板块变色
 *   - `:avatar-svg`：把当前时间的小人头像传进来，貼在微信收款二维码的正中央
 */
(function (TK) {
    'use strict';

    // 从全局 Vue 中取出响应式工具：
    // - `ref`      ：把一个普通变量变成“响应式变量”（它的值一变，网页上用到它的地方就会自动刷新，读写时要用 `.value`）
    // - `computed` ：定义一个“自动跟着别的变量算出来的计算属性”
    const {ref, computed} = Vue;

    // ========================================================================
    // 内部辅助小工具（仅本文件使用）
    // ========================================================================

    /**
     * 辅助函数 1：把用户选择的本地文件（File）或录制的语音（Blob）读取并转换成 Base64 字符串
     *
     * 【为什么要转成 Base64？】
     * 因为我们要用 JSON 格式（`JSON.stringify`）把文字和附件一起通过 POST 请求发给后端邮件接口，
     * 而二进制文件不能直接塞进 JSON 里，必须先用浏览器自带的 `FileReader` 转成一串由字母数字组成的 Base64 文本。
     *
     * @param {Blob|File} file 要转换的文件或录音数据块
     * @returns {Promise<string>} 返回形如 `"data:image/png;base64,iVBORw0KGgo..."` 的完整 Data URL 字符串
     */
    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);                // 开始把文件读取为 Data URL
        reader.onload = () => resolve(reader.result); // 读取成功时，把结果返回出去
        reader.onerror = (error) => reject(error);    // 读取出错时，抛出错误
    });

    /**
     * 辅助函数 2：去掉 Base64 Data URL 开头的说明前缀，只保留逗号 `,` 后面的纯编码正文
     *
     * 【举例说明】
     * `FileReader` 读出来的字符串长这样：`"data:audio/mp4;base64,AAAAIGZ0eXB..."`
     * 后端邮件服务（Resend）只需要逗号后面的 `"AAAAIGZ0eXB..."` 部分，
     * 所以用 `.split(',')[1]` 按逗号切开，取第 2 段（下标为 1）。
     */
    const dataUrlToBase64Body = (dataUrl) => dataUrl.split(',')[1];

    /**
     * 辅助函数 3：安全清理单个附件占用的浏览器资源
     *
     * 【为什么要做清理？】
     * 当用户录了一段语音后，为了让他能点 `▶️` 试听，我们用 `URL.createObjectURL` 在浏览器内存里生成了一个临时音频网址，
     * 并且可能正在播放（`attachment.audioElement`）。
     * 当用户删除这个附件、或者关掉弹窗时：
     *   1. 如果这段录音正在播放，必须立刻 `.pause()` 掐断声音，否则弹窗关了声音还在响！
     *   2. 必须调用 `URL.revokeObjectURL` 销毁临时网址，把内存还给浏览器，防止内存泄漏。
     */
    const releaseAttachment = (attachment) => {
        if (attachment.audioElement) attachment.audioElement.pause();
        if (attachment.url) URL.revokeObjectURL(attachment.url);
    };

    // ========================================================================
    // 定义 `<mail-modal>` 组件主体
    // ========================================================================
    TK.components.MailModal = {
        /**
         * 接收父组件（index.html）传进来的 4 个参数：
         * - `modelValue` ：Vue `v-model` 默认对应的属性名，代表弹窗当前是否打开（`true` / `false`）
         * - `activeColor`：当前板块的主题色（如 `'#38bdf8'`）
         * - `activeGlow` ：当前板块的半透明发光阴影色（如 `'rgba(56, 189, 248, 0.5)'`）
         * - `avatarSvg`  ：当前作息状态的像素小人头像路径（贴在微信收款码中心）
         */
        props: {
            modelValue:  {type: Boolean, default: false},
            activeColor: {type: String, required: true},
            activeGlow:  {type: String, required: true},
            avatarSvg:   {type: String, required: true}
        },

        /**
         * 声明组件会向父组件触发的事件：
         * `update:modelValue` 是 Vue `v-model` 的固定搭档，执行 `emit('update:modelValue', false)` 就能把父组件的 `showMailModal` 改成 `false`（关闭弹窗）
         */
        emits: ['update:modelValue'],

        setup(props, {emit}) {
            // ================================================================
            // 1. 文本框与发送状态变量
            // ================================================================
            /** 用户在多行文本框 `<textarea>` 里输入的文字内容 */
            const mailContent = ref('');
            /** 是否正在请求后端发送邮件中（为 `true` 时按钮文字变成 `"发送中..."` 且不可重复点击） */
            const isSendingMail = ref(false);
            /** 发送结果状态：`''`（平时） | `'success'`（发送成功，按钮显示 `"已发送!"`） | `'error'`（发送失败，底部显示红字报错） */
            const mailStatus = ref('');
            /** 是否展示「微信打赏二维码」全息遮罩层（点击 `🪙` 设为 `true`，点击右上角 `❌` 设为 `false`） */
            const showPayQR = ref(false);

            // ================================================================
            // 2. Emoji 表情选择器逻辑
            // ================================================================
            /** 是否展开 Emoji 小面板（点击 `😀` 按钮切换开关） */
            const showEmojiPicker = ref(false);
            /** 候选 Emoji 表情数组（来自 `data/content.js`） */
            const emojis = TK.data.emojis;

            /** 点击某个 Emoji 表情时：把表情追加到留言文字末尾，并自动收起表情面板 */
            const insertEmoji = (emoji) => {
                mailContent.value += emoji;
                showEmojiPicker.value = false;
            };

            // ================================================================
            // 3. 文件附件上传逻辑（点击 `📎` 按钮）
            // ================================================================
            /**
             * 存放当前已添加的所有附件（包括普通文件和录音文件）的数组。
             * 数组里每一项的结构：
             *   - `filename`     ：文件名（如 `'截图.png'` 或 `'语音密函_1700000.m4a'`）
             *   - `content`      ：去掉前缀后的纯 Base64 编码字符串（发给后端用）
             *   - `type`         ：`'file'`（普通文件，左侧显示 `📎`） 或 `'audio'`（录音，左侧显示 `🎵` 且右侧多一个播放试听按钮）
             *   - `url`          ：录音专属的本地临时试听地址（普通文件为 `null`）
             *   - `isPlaying`    ：录音当前是否正在试听播放中（决定显示播放三角图标还是双竖线暂停图标）
             *   - `audioElement` ：录音试听时创建的 `new Audio(url)` 对象
             */
            const attachments = ref([]);

            /** 绑定隐藏的 `<input type="file" ref="fileInput">` DOM 元素 */
            const fileInput = ref(null);

            /** 点击好看的 `📎` 按钮时，触发隐藏的原生文件选择框 */
            const triggerFileInput = () => fileInput.value.click();

            /** 当用户在文件选择框里选好文件后触发 */
            const handleFileChange = async (event) => {
                const files = event.target.files;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    // 检查文件大小是否超过配置的上限（默认 5MB）
                    if (file.size > TK.config.mailMaxFileSize) {
                        alert(`文件 [${file.name}] 超过 ${TK.config.mailMaxFileSize / 1024 / 1024}MB 限制，请重新选择！`);
                        continue; // 跳过这个超大的文件，继续处理其余选中的文件
                    }
                    // 转成纯 Base64 正文并推入附件列表
                    const content = dataUrlToBase64Body(await toBase64(file));
                    attachments.value.push({filename: file.name, content, type: 'file', url: null});
                }
                // 关键细节：处理完后把 input 的 value 清空，否则如果用户删掉附件后再次选同一个文件，浏览器不会触发 change 事件！
                event.target.value = '';
            };

            /** 点击某个附件右侧的红色 `❌` 按钮：先停止播放并释放内存，再从数组里删掉这一项 */
            const removeAttachment = (index) => {
                releaseAttachment(attachments.value[index]);
                attachments.value.splice(index, 1);
            };

            // ================================================================
            // 4. 录音附件的播放/暂停试听逻辑
            // ================================================================
            /** 点击语音附件右侧的绿色播放/暂停小圆钮时触发 */
            const toggleAudioPreview = (file) => {
                // 如果是第一次点播放，就用它的临时网址创建一个 Audio 播放器，并监听“播完自动恢复成未播放图标”
                if (!file.audioElement) {
                    file.audioElement = new Audio(file.url);
                    file.audioElement.onended = () => {
                        file.isPlaying = false;
                    };
                }

                // 如果正在播，就暂停；如果没在播，就开始播放
                if (file.isPlaying) {
                    file.audioElement.pause();
                    file.isPlaying = false;
                } else {
                    const playPromise = file.audioElement.play();
                    // 捕获极端情况下（比如用户极速连点）播放被中断的异常，避免控制台飘红
                    if (playPromise !== undefined) {
                        playPromise.catch((error) => {
                            console.warn('音频播放准备被中断', error);
                        });
                    }
                    file.isPlaying = true;
                }
            };

            // ================================================================
            // 5. 麦克风语音录制逻辑（点击 `🎤` / `⏹️` 按钮）
            // ================================================================
            /** 当前是否正在录音中（为 `true` 时按钮变成红色闪烁的 `⏹️`，且旁边显示红色 `RECORDING...`） */
            const isRecording = ref(false);
            /** 浏览器的 MediaRecorder 录音机实例 */
            let mediaRecorder = null;
            /** 录音过程中陆续收集到的音频数据碎片 */
            let audioChunks = [];

            const toggleRecording = async () => {
                // 情况 A：如果当前正在录音，再次点击就是“停止录音”
                if (isRecording.value) {
                    mediaRecorder.stop(); // 触发下面的 mediaRecorder.onstop 回调进行打包
                    isRecording.value = false;
                    return;
                }

                // 情况 B：如果当前没在录音，点击就是“请求麦克风权限并开始录音”
                try {
                    // 向浏览器申请麦克风音频流（首次点击时浏览器会弹出“是否允许使用麦克风”）
                    const stream = await navigator.mediaDevices.getUserMedia({audio: true});

                    // 【跨平台格式兼容核心】：
                    // 电脑 Chrome/Edge 原生喜欢 `audio/webm`，但苹果 iOS/Mac Safari 对 `audio/mp4`（后缀 `.m4a`）最友好。
                    // 所以优先探测浏览器支不支持 `audio/mp4`，支持就用 `.m4a`，不支持再用 `.webm`！
                    let mimeType = 'audio/webm';
                    let extension = 'webm';
                    if (MediaRecorder.isTypeSupported('audio/mp4')) {
                        mimeType = 'audio/mp4';
                        extension = 'm4a';
                    }

                    mediaRecorder = new MediaRecorder(stream, {mimeType});
                    audioChunks = [];

                    // 录音过程中，每产生一小段音频数据就塞进 audioChunks 数组里
                    mediaRecorder.ondataavailable = (e) => {
                        if (e.data.size > 0) audioChunks.push(e.data);
                    };

                    // 当用户点停止（`mediaRecorder.stop()`）时触发：把所有碎片拼成一个完整的音频文件
                    mediaRecorder.onstop = async () => {
                        // 1. 拼成二进制 Blob，再包装成带时间戳文件名的 File 对象（如 `语音密函_1700000000000.m4a`）
                        const audioBlob = new Blob(audioChunks, {type: mimeType});
                        const file = new File([audioBlob], `语音密函_${Date.now()}.${extension}`, {type: mimeType});
                        // 2. 转成纯 Base64 字符串供发送邮件使用
                        const content = dataUrlToBase64Body(await toBase64(file));

                        // 3. 推进附件列表，并生成 `URL.createObjectURL(audioBlob)` 供用户在弹窗内直接点播放试听
                        attachments.value.push({
                            filename: file.name,
                            content,
                            type: 'audio',
                            url: URL.createObjectURL(audioBlob),
                            isPlaying: false,
                            audioElement: null
                        });

                        // 4. 极其重要：录完音后立刻关掉麦克风硬件轨道，这样浏览器标签页上的“小红点/麦克风占用图标”才会消失！
                        stream.getTracks().forEach((track) => track.stop());
                    };

                    // 正式启动录音
                    mediaRecorder.start();
                    isRecording.value = true;
                } catch (err) {
                    // 如果用户点了“拒绝麦克风权限”或者电脑没插麦克风，弹窗友好提示
                    alert('无法访问麦克风，请检查浏览器权限设置！');
                }
            };

            // ================================================================
            // 6. 关闭弹窗与清理重置逻辑
            // ================================================================
            /** 点击「取消」、点击背景遮罩、或发送成功后自动关闭时调用 */
            const clearMailModal = () => {
                emit('update:modelValue', false);        // 通知父组件把 showMailModal 设为 false（关闭弹窗）
                mailContent.value = '';                  // 清空输入的文字
                mailStatus.value = '';                   // 清空发送成功/失败状态
                attachments.value.forEach(releaseAttachment); // 停止所有正在试听的录音并释放内存 URL
                attachments.value = [];                  // 清空附件列表
            };

            // ================================================================
            // 7. 发送密函请求逻辑（点击「发送」按钮）
            // ================================================================
            /** 判断当前有没有可发送的内容：只要写了字（去掉空格后不为空）或者挂了至少 1 个附件，就算有内容 */
            const hasContent = computed(() => !!mailContent.value.trim() || attachments.value.length > 0);
            /** 发送按钮是否处于禁用状态：正在发送中，或者既没写字也没传附件时，禁用按钮 */
            const sendDisabled = computed(() => isSendingMail.value || !hasContent.value);

            const sendMail = async () => {
                if (!hasContent.value) return;

                isSendingMail.value = true;
                mailStatus.value = '';

                try {
                    // 向 Cloudflare Worker 邮件接口发送 POST 请求
                    const response = await fetch(TK.config.api.mail, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            // 如果用户只传了语音/文件没写字，自动补一句说明文字
                            message: mailContent.value || '（仅发送了多媒体附件）',
                            attachments: attachments.value
                        })
                    });

                    if (response.ok) {
                        mailStatus.value = 'success';
                        // 发送成功后，让按钮显示 1.5 秒的「已发送!」，然后自动关闭并清空弹窗
                        setTimeout(clearMailModal, 1500);
                    } else {
                        mailStatus.value = 'error';
                    }
                } catch (e) {
                    console.error('邮件发送失败:', e);
                    mailStatus.value = 'error';
                } finally {
                    isSendingMail.value = false;
                }
            };

            // ================================================================
            // 8. 跟随当前板块主题色动态变化的内联样式（:style）
            // ================================================================
            /** 弹窗外框：边框颜色 + 外发光阴影跟随当前主题色 */
            const panelStyle = computed(() => ({borderColor: props.activeColor, boxShadow: `0 0 30px ${props.activeGlow}`}));
            /** 微信打赏全息层：圆角 32px + 内发光阴影跟随当前主题色 */
            const qrLayerStyle = computed(() => ({borderRadius: '32px', boxShadow: `inset 0 0 30px ${props.activeGlow}`}));
            /** 打赏金额 `¥ 1.00` 的文字发光阴影 */
            const amountStyle = computed(() => ({textShadow: `0 0 15px ${props.activeGlow}`}));
            /** 二维码方框的边框与外发光 */
            const qrFrameStyle = computed(() => ({borderColor: props.activeColor, boxShadow: `0 0 25px ${props.activeGlow}`}));
            /** 二维码中心小人头像方框的边框色 */
            const qrAvatarStyle = computed(() => ({borderColor: props.activeColor}));
            /** 留言输入框点击聚焦时的外轮廓高亮色 */
            const textareaStyle = computed(() => ({outlineColor: props.activeColor}));
            /** 发送按钮：可用时填满当前主题色，禁用时交还给灰色 class 处理 */
            const sendButtonStyle = computed(() => ({
                backgroundColor: sendDisabled.value ? '' : props.activeColor,
                borderColor: sendDisabled.value ? '' : props.activeColor
            }));

            return {
                mailContent, isSendingMail, mailStatus, showPayQR,
                showEmojiPicker, emojis, insertEmoji,
                attachments, fileInput, triggerFileInput, handleFileChange, removeAttachment,
                toggleAudioPreview, isRecording, toggleRecording,
                clearMailModal, sendMail, sendDisabled,
                disclaimer: TK.data.mailDisclaimer,
                panelStyle, qrLayerStyle, amountStyle, qrFrameStyle, qrAvatarStyle, textareaStyle, sendButtonStyle
            };
        },

        // ====================================================================
        // 组件的 HTML 模板（结构与样式和重构前 100% 一致）
        // ====================================================================
        template: `
            <!-- Vue <transition> 动画包裹层：
                 打开弹窗时（enter）：耗时 0.7 秒，用果冻弹簧曲线 cubic-bezier(0.34,1.56,0.64,1) 从下方 64px 处由半大（scale-50）弹回原大（scale-100）
                 关闭弹窗时（leave）：耗时 0.3 秒，缩小到 75% 并向下沉入淡出 -->
            <transition enter-active-class="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        enter-from-class="opacity-0 scale-50 translate-y-16"
                        enter-to-class="opacity-100 scale-100 translate-y-0"
                        leave-active-class="transition-all duration-300 ease-in-out"
                        leave-from-class="opacity-100 scale-100 translate-y-0"
                        leave-to-class="opacity-0 scale-75 translate-y-10">
                <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4" v-if="modelValue">

                    <!-- 背后全屏半透明毛玻璃黑雾遮罩层：点击空白处直接关闭并清空弹窗 -->
                    <div @click="clearMailModal"
                         class="absolute inset-0 bg-[#050505]/30 backdrop-blur-md transition-all duration-700"></div>

                    <!-- 密函弹窗主体卡片 -->
                    <div :style="panelStyle"
                         class="glass-panel w-full max-w-sm min-h-[420px] p-6 relative z-10 flex flex-col space-y-4 border-[2px]">

                        <!-- ==================== 🪙 微信打赏二维码全息覆盖层 ====================
                             只有当用户点击了工具栏的金币按钮（showPayQR === true）时才会浮现，盖住下面的表单 -->
                        <transition enter-active-class="transition-all duration-300 ease-out"
                                    enter-from-class="opacity-0 scale-95"
                                    enter-to-class="opacity-100 scale-100"
                                    leave-active-class="transition-all duration-200 ease-in"
                                    leave-from-class="opacity-100 scale-100"
                                    leave-to-class="opacity-0 scale-95">
                            <div :style="qrLayerStyle"
                                 class="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center"
                                 v-if="showPayQR">

                                <!-- 右上角关闭按钮：点击只关掉二维码层，回到密函文字编辑界面 -->
                                <button @click="showPayQR = false"
                                        class="absolute top-5 right-5 text-gray-400 hover:text-red-500 text-lg transition-all hover:scale-125 z-50">
                                    ❌
                                </button>

                                <!-- 顶部绿色呼吸灯 + WECHAT_PAY 标识 -->
                                <div class="flex items-center space-x-2 mb-3">
                                    <span class="animate-pulse text-[#4ade80]">●</span>
                                    <span class="font-pixel text-xs tracking-widest font-bold text-gray-300">WECHAT_PAY</span>
                                </div>

                                <!-- 赛博像素字体显示金额：¥ 1.00 -->
                                <div :style="amountStyle"
                                     class="font-pixel text-3xl text-white mb-4 z-10 flex items-center">
                                    <span class="text-xl mr-1">¥</span> 1.00
                                </div>

                                <!-- 二维码视觉容器：禁止手机长按弹出菜单（-webkit-touch-callout: none）、禁止选中与拖拽 -->
                                <div :style="qrFrameStyle"
                                     class="relative w-44 h-44 bg-black rounded-xl border transition-transform duration-500 hover:scale-105 overflow-hidden select-none"
                                     style="-webkit-touch-callout: none; -webkit-user-select: none;">

                                    <!-- 二维码图片本体：
                                         通过 CSS filter 滤镜组合（invert 反相 + sepia 复古 + hue-rotate(80deg) 色相旋转 + saturate 高饱和），
                                         把原本普通的黑白微信收款码「./imgs/pay_qr.jpg」实时渲染成赛博朋克荧光绿风格！ -->
                                    <img alt="Payment QR"
                                         class="w-full h-full object-cover mix-blend-screen pointer-events-none select-none"
                                         draggable="false"
                                         src="./assets/images/ui/pay-qr.jpg"
                                         style="-webkit-touch-callout: none; image-rendering: pixelated; filter: invert(1) brightness(1.2) sepia(1) hue-rotate(80deg) saturate(5) drop-shadow(0 0 4px rgba(74,222,128,0.4));">

                                    <!-- 二维码正中央的小人头像遮盖框（实时同步当前作息状态的像素小人） -->
                                    <div :style="qrAvatarStyle"
                                         class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black rounded-xl border-[2px] flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.9)] overflow-hidden z-10 pointer-events-none select-none"
                                         style="-webkit-touch-callout: none;">
                                        <img :src="avatarSvg"
                                             class="w-full h-full scale-110 object-cover pointer-events-none select-none"
                                             draggable="false"
                                             style="-webkit-touch-callout: none; image-rendering: pixelated;">
                                    </div>
                                </div>

                                <!-- 二维码底部赛博签名文案 -->
                                <div class="mt-5 font-pixel text-white text-[10px] tracking-widest font-bold flex flex-col items-center">
                                    <span>TARGET: 土块 </span>
                                    <span class="mt-1.5 text-[#4ade80] animate-pulse">> I'm gonna grab a smoke.</span>
                                </div>
                            </div>
                        </transition>

                        <!-- ==================== 密函表单主界面 ==================== -->
                        <h3 class="text-white font-bold text-lg tab-title tracking-widest flex items-center !mt-0">
                            <span class="mr-2">✉️</span> 密函发送
                        </h3>

                        <!-- 多行留言输入框：未输入文字时显示《网站内容及版权免责声明》（disclaimer） -->
                        <textarea :placeholder="disclaimer"
                                  :style="textareaStyle"
                                  class="w-full flex-1 min-h-[120px] bg-black/50 border border-white/20 rounded-xl p-3 text-white text-xs md:text-sm font-pixel focus:outline-none transition-colors hide-scrollbar resize-none"
                                  v-model="mailContent"></textarea>

                        <!-- 多媒体工具栏：1.Emoji 表情  2.本地文件附件  3.麦克风语音录制  4.微信打赏金币 -->
                        <div class="flex items-center space-x-4 mt-2 px-1 text-gray-400">
                            <!-- 1. Emoji 按钮与悬浮表情面板 -->
                            <div class="relative">
                                <button @click="showEmojiPicker = !showEmojiPicker"
                                        class="hover:text-white hover:scale-125 transition-all text-lg">😀
                                </button>
                                <div class="absolute bottom-full left-0 mb-2 w-48 bg-gray-800/95 backdrop-blur-xl border border-white/20 p-2 rounded-xl grid grid-cols-5 gap-2 z-50 shadow-xl"
                                     v-if="showEmojiPicker">
                                    <span :key="emoji" @click="insertEmoji(emoji)"
                                          class="cursor-pointer text-xl hover:scale-125 transition-transform text-center"
                                          v-for="emoji in emojis">{{ emoji }}</span>
                                </div>
                            </div>

                            <!-- 2. 本地文件附件按钮（点击触发下面那个 hidden 隐藏的原生 file input） -->
                            <button @click="triggerFileInput"
                                    class="hover:text-white hover:scale-125 transition-all text-lg">📎
                            </button>
                            <input @change="handleFileChange" class="hidden" multiple ref="fileInput" type="file">

                            <!-- 3. 麦克风录音按钮：平时是麦克风「🎤」，录音中变成红色闪烁的停止键「⏹️」 -->
                            <button :class="['text-lg transition-all hover:scale-125', isRecording ? 'text-red-500 animate-pulse' : 'hover:text-white']"
                                    @click="toggleRecording">
                                {{ isRecording ? '⏹️' : '🎤' }}
                            </button>

                            <!-- 录音进行中的红色闪烁提示字 -->
                            <span class="text-red-500 text-xs animate-pulse font-bold tracking-widest" v-if="isRecording">RECORDING...</span>

                            <!-- 4. 打赏金币按钮：点击打开上面的微信二维码全息层 -->
                            <button @click="showPayQR = true"
                                    class="hover:text-yellow-400 hover:scale-125 transition-all text-lg ml-2">
                                🪙
                            </button>
                        </div>

                        <!-- 已添加的附件预览列表（只有当 attachments 数组不为空时才显示） -->
                        <div class="flex flex-col gap-2 mt-1 max-h-32 overflow-y-auto hide-scrollbar"
                             v-if="attachments.length > 0">
                            <div :key="index"
                                 class="bg-gray-700/50 text-white text-[10px] px-3 py-2 rounded-lg flex items-center justify-between border border-white/10"
                                 v-for="(file, index) in attachments">

                                <!-- 左侧：根据类型显示音符「🎵」或回形针「📎」+ 文件名 -->
                                <div class="flex items-center space-x-3 overflow-hidden">
                                    <span class="text-sm shrink-0">{{ file.type === 'audio' ? '🎵' : '📎' }}</span>
                                    <span :title="file.filename"
                                          class="truncate max-w-[120px] md:max-w-[200px]">{{ file.filename }}</span>
                                </div>

                                <!-- 右侧操作区：纯手工绘制的像素风 SVG 按钮（shape-rendering: crispEdges 保证像素边缘绝对锐利不模糊） -->
                                <div class="flex items-center space-x-2 shrink-0">
                                    <!-- 语音附件专属的「试听播放/暂停」绿色小圆钮 -->
                                    <button @click="toggleAudioPreview(file)"
                                            class="text-green-400 hover:text-green-300 bg-black/40 rounded-full w-5 h-5 flex items-center justify-center shadow-inner hover:bg-green-500/20 transition-all"
                                            v-if="file.type === 'audio'">
                                        <!-- 未播放状态：像素风三角形播放图标 -->
                                        <svg class="w-2.5 h-2.5" fill="currentColor" style="shape-rendering: crispEdges;"
                                             v-if="!file.isPlaying" viewBox="0 0 10 10">
                                            <path d="M 3 1 h 2 v 1 h 1 v 1 h 1 v 1 h 1 v 2 h -1 v 1 h -1 v 1 h -1 v 1 h -2 Z"/>
                                        </svg>
                                        <!-- 播放中状态：像素风双竖线暂停图标 -->
                                        <svg class="w-2.5 h-2.5" fill="currentColor" style="shape-rendering: crispEdges;"
                                             v-else viewBox="0 0 10 10">
                                            <path d="M 2 1 h 2 v 8 h -2 Z M 6 1 h 2 v 8 h -2 Z"/>
                                        </svg>
                                    </button>

                                    <!-- 删除该附件的红色像素叉号按钮 -->
                                    <button @click="removeAttachment(index)"
                                            class="text-red-400 hover:text-red-300 bg-black/40 rounded-full w-5 h-5 flex items-center justify-center shadow-inner hover:bg-red-500/20 transition-all">
                                        <svg class="w-2.5 h-2.5" fill="currentColor" style="shape-rendering: crispEdges;"
                                             viewBox="0 0 10 10">
                                            <path d="M 1 1 h 2 v 1 h 1 v 1 h 2 v -1 h 1 v -1 h 2 v 2 h -1 v 1 h -1 v 2 h 1 v 1 h 1 v 2 h -2 v -1 h -1 v -1 h -2 v 1 h -1 v 1 h -2 v -2 h 1 v -1 h 1 v -2 h -1 v -1 h -1 Z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 底部取消与发送按钮 -->
                        <div class="flex justify-end space-x-3 text-xs md:text-sm font-bold mt-2">
                            <button @click="clearMailModal"
                                    class="px-4 py-2 rounded-full border border-gray-500 text-gray-400 hover:text-white hover:border-white transition-all tracking-widest">
                                取消
                            </button>
                            <button :class="['px-4 py-2 rounded-full border transition-all text-black tracking-widest',
                                             sendDisabled ? 'bg-gray-500 border-gray-500 opacity-50 cursor-not-allowed' : 'hover:scale-105']"
                                    :disabled="sendDisabled"
                                    :style="sendButtonStyle"
                                    @click="sendMail">
                                {{ isSendingMail ? '发送中...' : (mailStatus === 'success' ? '已发送!' : '发送') }}
                            </button>
                        </div>

                        <!-- 发送失败时的底部红色报错提示 -->
                        <div class="text-red-400 text-[10px] animate-pulse text-center mt-1" v-if="mailStatus === 'error'">
                            网络异常或接口错误，发送失败。
                        </div>
                    </div>
                </div>
            </transition>
        `
    };

})(window.TuKuai);
