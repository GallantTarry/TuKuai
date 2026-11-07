/**
 * ==========================================================================================
 * 【文件名称】use-music-player.js
 * 【文件作用】「电子音乐终端」功能模块 —— 管理全站背景音乐播放器、复古小电视动画与系统媒体控制台。
 *
 * 【在页面哪里能看到它？】
 *   1. 点击左侧菜单「电子音乐」，主面板会展示复古迷你电视机、曲名、进度条、音量滑块、
 *      播放控制按钮（顺序/随机/单曲、上一首、播放/暂停、下一首）以及完整歌单列表。
 *   2. 即使切换到其他标签页（比如边听歌边看简介或找游戏），音乐也会继续在后台播放，
 *      因为真正的 `<audio ref="audioRef">` 标签放在 `index.html` 最外层根节点的末尾，不会随标签页销毁。
 *   3. 在苹果 iOS（灵动岛 / 锁屏界面）、安卓通知栏、电脑键盘的多媒体按键上，
 *      会同步显示当前歌曲名称、艺术家与「土块」黑底图标，并可直接用系统按键切歌/暂停。
 *
 * 【如果要添加或修改歌曲去哪里改？】
 *   请打开 `assets/js/app/data/media.js`，在 `TK.data.playlist` 数组里添加或修改歌曲即可，本文件不需要改动！
 * ==========================================================================================
 */
(function (TK) {
    'use strict';

    // 从 Vue 中解构响应式工具：
    //   ref      ：把普通值包装成响应式变量（修改 .value 会自动更新页面）
    //   computed ：根据其他响应式变量自动计算派生值
    //   watch    ：监听响应式变量变化并触发回调
    //   nextTick ：等待 Vue 完成一轮页面 DOM 更新
    const {ref, computed, watch, nextTick} = Vue;

    // 从工具箱（assets/js/app/utils/helpers.js）引入：
    //   formatTime  ：把秒数（如 85）格式化成 '01:25'
    //   randomIndex ：在 0 到 length-1 之间随机抽一个整数下标
    const {formatTime, randomIndex} = TK.utils;

    TK.composables.useMusicPlayer = function useMusicPlayer() {
        // ======================================================================================
        // 一、播放器核心响应式状态
        // ======================================================================================

        /**
         * 绑定到 `index.html` 底部 `<audio ref="audioRef">` 元素的引用。
         * 页面挂载后，`audioRef.value` 就是浏览器原生的 HTMLAudioElement 音频对象。
         */
        const audioRef = ref(null);

        /** 当前是否正在播放音乐（true = 播放中，false = 已暂停） */
        const isPlaying = ref(false);

        /**
         * 完整歌单列表（数据来自 `assets/js/app/data/media.js`）。
         * 每次刷新网页都从第 0 首、100% 满音量、顺序播放模式开始，保持纯粹干脆的体验。
         */
        const playlist = ref(TK.data.playlist);

        /** 当前选中歌曲在 `playlist` 数组中的下标（从 0 开始，默认第 0 首） */
        const currentTrackIndex = ref(0);

        /** 【自动计算】当前正在播放（或待播放）的那首歌对象 `{ title: '...', url: '...' }` */
        const currentTrack = computed(() => playlist.value[currentTrackIndex.value] || null);

        // ======================================================================================
        // 二、播放进度条与时间显示状态
        // ======================================================================================

        /** 当前已播放时间的文字显示（格式 `MM:SS`，如 `'01:23'`） */
        const currentTimeDisplay = ref('00:00');

        /** 当前歌曲总时长的文字显示（格式 `MM:SS`，如 `'03:45'`） */
        const durationDisplay = ref('00:00');

        /** 进度条滑块当前的秒数位置（与 `<input type="range" v-model="seekProgress">` 双向绑定） */
        const seekProgress = ref(0);

        /** 当前歌曲的总秒数（作为进度条 `<input type="range" :max="durationSec">` 的最大值） */
        const durationSec = ref(0);

        // ======================================================================================
        // 三、音量与播放模式状态
        // ======================================================================================

        /** 当前音量大小（范围 0.0 静音 ~ 1.0 最大音量，默认 1.0 满音量） */
        const currentVolume = ref(1.0);

        /**
         * 当前播放模式在 `TK.data.playModes`（定义在 `media.js`）中的下标：
         *   0 = 顺序播放 (sequence)
         *   1 = 随机播放 (random)
         *   2 = 单曲循环 (loop)
         */
        const currentPlayModeIndex = ref(0);

        /** 【自动计算】当前播放模式的英文代号（'sequence' | 'random' | 'loop'），供代码内部判断用 */
        const playMode = computed(() => TK.data.playModes[currentPlayModeIndex.value].key);

        /** 【自动计算】当前播放模式按钮上显示的中文名称（'顺序' | '随机' | '单曲'） */
        const playModeText = computed(() => TK.data.playModes[currentPlayModeIndex.value].text);

        /** 点击「顺序/随机/单曲」按钮时触发：在三种播放模式之间循环切换 */
        const togglePlayMode = () => {
            currentPlayModeIndex.value = (currentPlayModeIndex.value + 1) % TK.data.playModes.length;
        };

        // ======================================================================================
        // 四、复古迷你电视机屏幕里的随机 GIF 动图
        // ======================================================================================

        /** 当前小电视屏幕里显示的 GIF 图片路径（初始随机抽一张） */
        const currentTvGif = ref(TK.utils.randomItem(TK.data.tvGifs));

        /** 从 `TK.data.tvGifs` 列表里重新随机换一张 GIF 动图（每次切歌或恢复播放时调用） */
        const changeTvGif = () => {
            currentTvGif.value = TK.utils.randomItem(TK.data.tvGifs);
        };

        // ======================================================================================
        // 五、核心播放控制方法（点歌、播放/暂停、上一首、下一首）
        // ======================================================================================

        /**
         * 切换到歌单里的第 `index` 首歌并立即开始播放。
         * @param {number} index 歌曲在 playlist 中的下标
         */
        const playTrack = async (index) => {
            currentTrackIndex.value = index;
            isPlaying.value = false;
            changeTvGif();

            // 关键步骤：等待 Vue 把页面上 `<audio :src="currentTrack.url">` 的 src 属性更新为新歌的地址后，
            // 再调用 audioRef.value.play()，否则播放的还会是上一首旧歌！
            await nextTick();

            if (audioRef.value) {
                audioRef.value.play().then(() => {
                    isPlaying.value = true;
                }).catch((e) => {
                    console.error('音频播放失败', e);
                    isPlaying.value = false;
                });
            }
        };

        /**
         * 点击「播放 / 暂停」按钮（或点击复古小电视机身）时触发：
         * 如果正在播放就暂停；如果处于暂停状态就恢复播放并换一张小电视 GIF。
         */
        const togglePlay = () => {
            if (!audioRef.value || !currentTrack.value) return;

            if (isPlaying.value) {
                audioRef.value.pause();
                isPlaying.value = false;
            } else {
                changeTvGif();
                audioRef.value.play().then(() => {
                    isPlaying.value = true;
                }).catch((e) => {
                    console.error('播放被阻止', e);
                    isPlaying.value = false;
                });
            }
        };

        /**
         * 按偏移量切换曲目的内部辅助函数：
         *   · 如果当前是「随机模式 (random)」，直接从歌单里随机抽一首播放；
         *   · 否则按顺序前进 `offset` 首（+1 为下一首，-1 为上一首；首尾相连循环）。
         * @param {number} offset 偏移量（+1 或 -1）
         */
        const stepTrack = (offset) => {
            const total = playlist.value.length;
            if (total === 0) return;
            if (playMode.value === 'random') {
                playTrack(randomIndex(total));
            } else {
                // 加 total 再取模，是为了保证第 0 首再减 1 时能优雅地绕回最后一首（不会出现负数下标）
                playTrack((currentTrackIndex.value + offset + total) % total);
            }
        };

        /** 切换到下一首 */
        const nextTrack = () => stepTrack(1);

        /** 切换到上一首 */
        const prevTrack = () => stepTrack(-1);

        /**
         * 当一首歌自然播放到结尾时（由 `<audio @ended="onEnded">` 触发）：
         *   · 如果是「单曲循环 (loop)」模式：重新从头播放当前这首歌；
         *   · 如果是「顺序」或「随机」模式：直接调用 `nextTrack()` 切到下一首。
         */
        const onEnded = () => {
            if (playMode.value === 'loop') {
                playTrack(currentTrackIndex.value);
            } else {
                nextTrack();
            }
        };

        // ======================================================================================
        // 六、进度条同步与音量调节事件
        // ======================================================================================

        /** 当音频文件头信息加载完成时触发：读取这首歌的总秒数，并格式化成 MM:SS 显示出来 */
        const onLoadedMetadata = () => {
            durationSec.value = audioRef.value.duration;
            durationDisplay.value = formatTime(durationSec.value);
        };

        /** 播放过程中浏览器每 ~250ms 触发一次：把当前播放秒数同步给进度条滑块和左侧时间文字 */
        const onTimeUpdate = () => {
            if (!audioRef.value) return;
            seekProgress.value = audioRef.value.currentTime;
            currentTimeDisplay.value = formatTime(audioRef.value.currentTime);
        };

        /** 用户手动拖动进度条滑块时触发：让音频立即快进/快退到滑块所在的秒数 */
        const onSeek = () => {
            if (!audioRef.value) return;
            audioRef.value.currentTime = seekProgress.value;
        };

        /** 用户手动拖动音量滑块时触发：把 `currentVolume`（0~1）同步给底层 `<audio>` 对象 */
        const onVolumeChange = () => {
            if (audioRef.value) audioRef.value.volume = currentVolume.value;
        };

        // ======================================================================================
        // 七、供页面跃迁动效（Wander Jump / 5-Phile 聚变）调用的音量渐变接口
        // ======================================================================================

        /**
         * 当触发全屏跃迁跳转时调用：如果当前正在放歌，让音量在约 800ms 内像断电一样平滑衰减到 0。
         */
        const fadeOutMusic = () => {
            if (audioRef.value && isPlaying.value) {
                TK.utils.fadeOutAudio(audioRef.value);
            }
        };

        /**
         * 当用户点击浏览器「后退」按钮从外部网页返回本站（bfcache 缓存恢复）时调用：
         * 把刚才因为跃迁而衰减到 0 的音量，重新恢复为用户滑块设定的音量。
         */
        const restoreVolume = () => {
            if (audioRef.value) audioRef.value.volume = currentVolume.value;
        };

        // ======================================================================================
        // 八、接管操作系统级媒体中心（iOS 灵动岛、锁屏界面、Android 通知栏、键盘多媒体键）
        // ======================================================================================
        if ('mediaSession' in navigator) {
            // 1. 监听当前曲目变化（immediate: true 表示页面一打开就立刻设置一次）：
            //    把歌名、歌手名和封面图上报给操作系统。
            watch(currentTrack, (track) => {
                if (!track) return;
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: track.title,
                    artist: TK.config.mediaSession.artist,
                    // 专门指定实心黑底的「土块」高清封面图，防止灵动岛自动抓取页面上的透明小图标导致背景发白
                    artwork: [TK.config.mediaSession.artwork]
                });
            }, {immediate: true});

            // 2. 监听播放/暂停状态变化，同步给操作系统（让 iOS 灵动岛上的音波跳动动画与网页一致）
            watch(isPlaying, (playing) => {
                navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
            });

            // 3. 把锁屏界面 / 耳机线控 / 键盘上的「播放、暂停、上一首、下一首」按键绑定到我们的播放器方法上
            navigator.mediaSession.setActionHandler('play', () => {
                if (!isPlaying.value) togglePlay();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                if (isPlaying.value) togglePlay();
            });
            navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
            navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
        }

        // 将所有状态与方法导出给 main.js 挂载到模板
        return {
            audioRef, isPlaying, playlist, currentTrack, currentTrackIndex,
            currentTimeDisplay, durationDisplay, seekProgress, durationSec,
            currentVolume, onVolumeChange,
            togglePlay, playTrack, nextTrack, prevTrack,
            onTimeUpdate, onLoadedMetadata, onSeek, onEnded,
            playModeText, togglePlayMode, currentTvGif,
            fadeOutMusic, restoreVolume
        };
    };
})(window.TuKuai);
