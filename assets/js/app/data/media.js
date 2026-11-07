/**
 * ============================================================================
 * 文件路径：assets/assets/js/app/data/media.js
 * 文件作用：存放全站的【多媒体资源清单】—— 音乐歌单、播放模式、小电视 GIF、随机背景图、状态像素头像
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
    // 【超级省心的约定】
    //   只要你把 `.mp3` 音乐文件放进项目的 `./assets/audio/` 文件夹里，
    //   在下面的 `playlistTitles` 数组里**只写歌名**（不需要写 `./assets/audio/` 和 `.mp3`），
    //   下面的代码会自动帮你把每一首歌拼成 `{title: '歌名', file: './assets/audio/歌名.mp3'}`！
    //
    // 【注意事项】
    //   - 这里写的名字必须和 `./assets/audio/` 文件夹里的 `.mp3` 文件名**一字不差**（包括空格、大小写、标点符号）
    //   - 数组里的先后顺序，就是网页上歌单从第 1 首到最后一首的排列顺序
    //
    // 【以后怎么加一首新歌？】
    //   1. 把比如 `晴天.mp3` 放进 `assets/audio/` 文件夹
    //   2. 在下面数组里加一行：`'晴天',` —— 搞定！
    // ========================================================================
    const playlistTitles = [
        '国际歌',
        'G弦上的咏叹调',
        'Odysseus',
        'CornfieldChase',
        'Experience',
        'gowest',
        '复古广告loop',
        '未白镇8bit',
        '送别',
        '雪绒花',
        '小步舞曲',
        '西西里舞曲',
        '裸体舞曲Part1',
        '少女的祈祷',
        'G大调第一无伴奏大提琴组曲：前奏曲',
        'Speak softly love',
        'The Rain',
        'HiddenPath',
        'Rain',
        'Si tu vois ma mère',
        'Where Is Armo',
        'Клетка',
        'манго нектар',
        'Судно',
        'AULD LANG SYNE',
        '苏维埃进行曲',
        '贝多芬第五交响乐',
        '致爱丽丝',
        '贝多芬月光奏鸣曲',
        '梦中的婚礼',
        '茉莉花',
        '流浪者之歌',
        '十面埋伏',
        '加州旅馆',
        '爱的罗曼史',
        '蓝色多瑙河',
        'The Swan',
        'Girls like you',
        'Track in Time',
        '飞越疯人院电影片尾曲',
        'For River',
        'Travelers',
        '牧场物语矿石镇的伙伴们',
        '勇者斗恶龙序曲',
        'Minecraft',
        '燃起来吧!',
        'Sunflower',
        '奇跡の山',
        '花',
        '风之诗',
        '云中杉',
        'MerryChristmas',
    ];

    /**
     * 把上面的纯歌名数组，自动转换成播放器需要的完整对象数组：
     * 例如 `'国际歌'` -> `{ title: '国际歌', file: './assets/audio/国际歌.mp3' }`
     */
    TK.data.playlist = playlistTitles.map(title => ({title, file: `./assets/audio/${title}.mp3`}));

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
    // 3. 【复古迷你电视机的动态 MV 动图列表】(`TK.data.tvGifs`)
    // 在「电子音乐」板块左上角有一台复古小电视：
    //   - 暂停时显示黑屏 `NO SIGNAL`
    //   - 播放时会在屏幕里显示一张像素风 GIF 动图，并且每次【切歌】或【从暂停恢复播放】都会随机换一张！
    //
    // 【以后怎么新增小电视动图？】
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
    // 4. 【全站随机背景壁纸列表】(`TK.data.backgrounds`)
    // 每次打开或刷新网页时，系统会从下面这个数组里随机抽一张图作为全屏背景（带半透明和 CRT 扫描线效果）。
    //
    // 【以后怎么新增或更换背景壁纸？】
    //   把新图片（支持 `.avif` / `.jpg` / `.png` / `.webp`）放进 `./assets/images/backgrounds/` 文件夹，
    //   然后在下面数组里加上它的路径即可。
    // ========================================================================
    TK.data.backgrounds = [
        './assets/images/backgrounds/bg-default.avif',
        './assets/images/backgrounds/bg-01.jpg',
        './assets/images/backgrounds/bg-02.jpg',
        './assets/images/backgrounds/bg-03.jpg',
        './assets/images/backgrounds/bg-04.jpg',
        './assets/images/backgrounds/bg-05.jpg'
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
