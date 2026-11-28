/**
 * ============================================================================
 * 文件路径：assets/js/app/data/media.js
 * 文件作用：存放全站的【多媒体资源清单】—— 音乐歌单、播放模式、小电视 GIF、2K AVIF 壁纸、状态像素头像
 * ============================================================================
 *
 * 【通俗理解：这个文件是干嘛的？】
 * 全站所有跟“听的音乐、看的动图、背景壁纸、小人头像”有关的文件清单都在这里。
 * 以后你想【加新歌、加小电视动图、加新壁纸】，直接改下面对应的数组即可！
 */
(function (TK) {
    'use strict';

    // ========================================================================
    // 1. 【电子音乐歌单】(`TK.data.playlist`)
    //
    // 【云端 R2 曲库约定】
    //   所有音频文件采用纯英文小写 kebab-case 命名（如 `the-internationale.flac`），
    //   统一托管在 Cloudflare R2（`https://music.xn--udsye.art`，见 `config.js` 的 `audioBaseUrl`）。
    //   新增或升级无损曲目时，直接运行项目根目录的 `./upload-music.ps1` 即可自动上传 R2 并更新下方列表！
    // ========================================================================
    const audioBase = (TK.config && TK.config.audioBaseUrl)
        ? TK.config.audioBaseUrl.replace(/\/+$/, '')
        : './assets/audio';

    const track = (title, file) => ({
        title,
        file: `${audioBase}/${file}`
    });

    TK.data.playlist = [
        track('The Internationale', 'the-internationale.flac'),
        track('Air on the G String', 'air-on-the-g-string.flac'),
        track('Odysseus', 'odysseus.mp3'),
        track('Cornfield Chase', 'cornfield-chase.mp3'),
        track('Experience', 'experience.mp3'),
        track('Go West', 'go-west.mp3'),
        track('Sleep Walk Loop', 'sleep-walk-loop.mp3'),
        track('Littleroot Town 8-Bit', 'littleroot-town-8bit.mp3'),
        track('Farewell', 'farewell.mp3'),
        track('Edelweiss', 'edelweiss.mp3'),
        track('Minuet', 'minuet.mp3'),
        track('Sicilienne', 'sicilienne.mp3'),
        track('Gymnopedie No. 1', 'gymnopedie-no-1.flac'),
        track("Maiden's Prayer", 'maidens-prayer.mp3'),
        track('Cello Suite No. 1 Prelude', 'cello-suite-no-1-prelude.flac'),
        track('Speak Softly Love', 'speak-softly-love.mp3'),
        track('The Rain', 'the-rain.mp3'),
        track('Hidden Path', 'hidden-path.mp3'),
        track('Rain', 'rain.flac'),
        track('Si Tu Vois Ma Mere', 'si-tu-vois-ma-mere.mp3'),
        track('Where Is Armo', 'where-is-armo.mp3'),
        track('Kletka', 'kletka.mp3'),
        track('Mango Nectar', 'mango-nectar.mp3'),
        track('Sudno', 'sudno.mp3'),
        track('Auld Lang Syne', 'auld-lang-syne.mp3'),
        track('Soviet March', 'soviet-march.mp3'),
        track('Symphony No. 5', 'symphony-no-5.flac'),
        track('Fur Elise', 'fur-elise.flac'),
        track('Moonlight Sonata', 'moonlight-sonata.flac'),
        track("Mariage d'Amour", 'mariage-d-amour.mp3'),
        track('Jasmine Flower', 'jasmine-flower.mp3'),
        track('Zigeunerweisen', 'zigeunerweisen.flac'),
        track('Ambush from All Sides', 'ambush-from-all-sides.mp3'),
        track('Hotel California', 'hotel-california.mp3'),
        track('Romance de Amor', 'romance-de-amor.mp3'),
        track('The Blue Danube', 'the-blue-danube.flac'),
        track('The Swan', 'the-swan.flac'),
        track('Girls Like You', 'girls-like-you.mp3'),
        track('Track in Time', 'track-in-time.mp3'),
        track("Cuckoo's Nest Finale", 'cuckoos-nest-finale.mp3'),
        track('For River', 'for-river.mp3'),
        track('Travelers', 'travelers.mp3'),
        track('Mineral Town', 'mineral-town.mp3'),
        track('Dragon Quest Overture', 'dragon-quest-overture.mp3'),
        track('Minecraft', 'minecraft.mp3'),
        track('Burn It Up', 'burn-it-up.mp3'),
        track('Sunflower', 'sunflower.mp3'),
        track('Miracle Mountain', 'miracle-mountain.mp3'),
        track('Flower', 'flower.mp3'),
        track('Wind Poem', 'wind-poem.mp3'),
        track('Cedar in the Clouds', 'cedar-in-the-clouds.mp3'),
        track('Merry Christmas Mr. Lawrence', 'merry-christmas-mr-lawrence.mp3'),
    ];

    // ========================================================================
    // 2. 【音乐播放器的 3 种循环模式】(`TK.data.playModes`)
    // 点击音乐播放器左下角的模式按钮时，会按数组顺序在这 3 种模式之间循环切换：
    //   - `key`  ：程序内部用来判断怎么切歌的英文代号（不要改）
    //   - `text` ：鼠标悬停在模式按钮上时显示的中文提示，以及模板用来判断显示哪个 SVG 图标的文字
    // ========================================================================
    TK.data.playModes = [
        {key: 'sequence', text: '顺序播放'}, // 按列表从头播到尾，播完最后一首回到第一首
        {key: 'random',   text: '随机播放'}, // 每次切歌或播完一首，都在歌单里随机抽一首
        {key: 'loop',     text: '单曲循环'}  // 当前这首歌播完后，继续从头重播当前这首歌
    ];

    // ========================================================================
    // 3. 【电子音乐终端微缩 CRT 视窗的动态 MV 动图列表】(`TK.data.tvGifs`)
    // 在「电子音乐」板块左上角的黑曜石 CRT 视窗中：
    //   - 暂停时显示柔和的 `STANDBY` 待机呼吸点
    //   - 播放时淡入像素风 GIF 动图，且每次【切歌】或【从暂停恢复播放】都会随机换一张！
    //
    // 【以后怎么新增动图？】
    //   把新的 `.gif` 文件放进 `./assets/images/tv-gifs/` 文件夹（如 `mini-mv-13.gif`），
    //   然后在下面数组末尾加一行路径即可。
    // ========================================================================
    TK.data.tvGifs = [
        './assets/images/tv-gifs/mini-mv-01.gif',
        './assets/images/tv-gifs/mini-mv-02.gif',
        './assets/images/tv-gifs/mini-mv-03.gif',
        './assets/images/tv-gifs/mini-mv-04.gif',
        './assets/images/tv-gifs/mini-mv-05.gif',
        './assets/images/tv-gifs/mini-mv-06.gif',
        './assets/images/tv-gifs/mini-mv-07.gif',
        './assets/images/tv-gifs/mini-mv-08.gif',
        './assets/images/tv-gifs/mini-mv-09.gif',
        './assets/images/tv-gifs/mini-mv-10.gif',
        './assets/images/tv-gifs/mini-mv-11.gif',
        './assets/images/tv-gifs/mini-mv-12.gif'
    ];

    // ========================================================================
    // 4. 【全站随机 2K AVIF 背景壁纸列表】(`TK.data.backgrounds`)
    // 每次打开或刷新网页时，系统会从下面这个数组里随机抽一张作为全屏背景（长边约 2048px 的轻量 AVIF 格式，配合 CRT 扫描线）。
    //
    // 【以后怎么新增或更换背景壁纸？】
    //   把压制好的 `.avif`（或 `.webp` / `.jpg`）放进 `./assets/images/backgrounds/` 文件夹，
    //   然后在下面数组里加上它的路径即可。
    // ========================================================================
    TK.data.backgrounds = [
        './assets/images/backgrounds/bg-default.avif',
        './assets/images/backgrounds/bg-01.avif',
        './assets/images/backgrounds/bg-02.avif',
        './assets/images/backgrounds/bg-03.avif',
        './assets/images/backgrounds/bg-04.avif',
        './assets/images/backgrounds/bg-05.avif'
    ];

    // ========================================================================
    // 5. 【不同作息状态对应的像素小人头像】(`TK.data.avatarByStatus`)
    // 页面左上角（以及微信打赏码正中间）的像素小人头像，会根据土块当前的作息状态自动换图！
    //   - 左边的键名（如 `'sleeping'`）：对应 `data/content.js` 里定义的作息状态名
    //   - 右边的路径（如 `'./assets/images/avatars/sleeping-avatar.svg'`）：该状态下显示的 SVG 矢量像素画文件
    // ========================================================================
    TK.data.avatarByStatus = {
        'sleeping':     './assets/images/avatars/sleeping-avatar.svg',     // 00:00 - 07:59 睡觉中
        'listening':    './assets/images/avatars/listening-avatar.svg',    // 08:00 - 08:59 听音乐/听课中
        'working':      './assets/images/avatars/working-avatar.svg',      // 09:00 - 11:59 搬砖工作中
        'slacking off': './assets/images/avatars/slacking-off-avatar.svg', // 12:00 - 13:59 午休摸鱼中
        'coding':       './assets/images/avatars/coding-avatar.svg',       // 14:00 - 17:59 敲代码中
        'smoking':      './assets/images/avatars/smoking-avatar.svg',      // 18:00 - 18:59 抽烟放空中（此时还会定时弹出聊天气泡）
        'swimming':     './assets/images/avatars/swimming-avatar.svg',     // 19:00 - 20:59 游泳健身中
        'gaming':       './assets/images/avatars/gaming-avatar.svg'        // 21:00 - 23:59 打游戏中
    };

    /**
     * 默认兜底头像：
     * 刚打开网页的第一瞬间（时钟还没算出来状态，状态还是 `'...'` 时），先显示这张抽烟小人头像兜底
     */
    TK.data.defaultAvatar = './assets/images/avatars/smoking-avatar.svg';

})(window.TuKuai);
