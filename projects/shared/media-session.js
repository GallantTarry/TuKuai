/**
 * ============================================================================
 * 文件路径：projects/shared/media-session.js
 * 文件作用：为 projects/ 下各作品独立宣传页提供统一的 BGM 播放同步与 iOS 灵动岛接管
 * ============================================================================
 *
 * 【设计要点】
 * 1. 仅在 BGM 真正开始播放（play 事件）时写入 navigator.mediaSession.metadata，
 *    避免从主站 iframe 弹窗打开子页时，还没点击播放就意外覆盖主站正在播放的灵动岛封面。
 * 2. 通过监听原生 audio 的 play / pause / ended 事件驱动转盘动画（.playing）与
 *    mediaSession.playbackState，确保用户在 iOS 灵动岛或锁屏上点暂停时页面同步停止。
 * 3. artwork 必须传入绝对 URL 的实心背景 PNG（由各页的 imgs/music-cover.png 提供），
 *    避免 iOS 灵动岛读取 .ico 或透明图时出现白块或无法显示的问题。
 */
(function (global) {
    'use strict';

    /**
     * 初始化宣传页的 BGM 播放按钮与系统媒体中心（灵动岛 / 锁屏控制）。
     *
     * @param {Object} options
     * @param {string} options.title      灵动岛显示的曲名（如 '去月球'）
     * @param {string} options.artist     灵动岛显示的作者/应用名（如 'ToolKit · TuKuai'）
     * @param {string} [options.album]    专辑名（可选）
     * @param {string} options.cover      实心背景 512x512 封面 PNG 相对路径（如 'imgs/music-cover.png'）
     * @param {string} [options.smallCover] 实心背景 180x180 封面 PNG 相对路径（可选）
     */
    global.initProjectBgm = function initProjectBgm(options) {
        const musicToggle = document.getElementById(options.toggleId || 'music-toggle');
        const bgMusic = document.getElementById(options.audioId || 'bg-music');
        const musicDisk = document.getElementById(options.diskId || 'music-disk');

        if (!musicToggle || !bgMusic || !musicDisk) return;

        let hasActivatedSession = false;

        const resolveUrl = (relPath) => new URL(relPath, window.location.href).href;

        const buildArtwork = () => {
            const list = [
                {src: resolveUrl(options.cover), sizes: '512x512', type: 'image/png'}
            ];
            if (options.smallCover) {
                list.push({src: resolveUrl(options.smallCover), sizes: '180x180', type: 'image/png'});
            }
            return list;
        };

        const syncPositionState = () => {
            if (!hasActivatedSession || !('mediaSession' in navigator)) return;
            if (typeof navigator.mediaSession.setPositionState !== 'function') return;
            if (!Number.isFinite(bgMusic.duration) || bgMusic.duration <= 0) return;

            try {
                navigator.mediaSession.setPositionState({
                    duration: bgMusic.duration,
                    playbackRate: bgMusic.playbackRate || 1,
                    position: Math.min(bgMusic.currentTime || 0, bgMusic.duration)
                });
            } catch (_) {
                // 部分浏览器在特定状态下不允许更新进度信息，静默忽略
            }
        };

        const registerMediaSession = () => {
            if (!('mediaSession' in navigator)) return;

            hasActivatedSession = true;
            navigator.mediaSession.metadata = new MediaMetadata({
                title: options.title,
                artist: options.artist,
                album: options.album || options.artist,
                artwork: buildArtwork()
            });

            const safeSetHandler = (action, handler) => {
                try {
                    navigator.mediaSession.setActionHandler(action, handler);
                } catch (_) {
                    // 忽略不支持特定 action 的旧内核
                }
            };

            safeSetHandler('play', () => bgMusic.play().catch(() => {}));
            safeSetHandler('pause', () => bgMusic.pause());
            safeSetHandler('seekto', (details) => {
                if (typeof details.seekTime === 'number' && Number.isFinite(bgMusic.duration)) {
                    bgMusic.currentTime = Math.max(0, Math.min(details.seekTime, bgMusic.duration));
                    syncPositionState();
                }
            });
        };

        bgMusic.addEventListener('play', () => {
            musicDisk.classList.add('playing');
            registerMediaSession();
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
            syncPositionState();
        });

        const handlePauseOrEnd = () => {
            musicDisk.classList.remove('playing');
            if (hasActivatedSession && 'mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
            }
            syncPositionState();
        };

        bgMusic.addEventListener('pause', handlePauseOrEnd);
        bgMusic.addEventListener('ended', handlePauseOrEnd);
        bgMusic.addEventListener('loadedmetadata', syncPositionState);
        bgMusic.addEventListener('seeked', syncPositionState);

        musicToggle.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().catch(() => {});
            } else {
                bgMusic.pause();
            }
        });
    };
})(window);
