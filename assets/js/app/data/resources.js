/**
 * ============================================================================
 * 文件路径：assets/assets/js/app/data/resources.js
 * 文件作用：集中存放全站 4 大列表板块（在线使用 / 文件下载 / 复古游戏 / 创意空间）的所有卡片数据
 * ============================================================================
 *
 * 【通俗理解：为什么要把卡片数据全放这里？】
 * 以前在 `index.html` 里，每加一个网址或一个游戏，就要复制粘贴十几行一模一样的 `<div class="glass-card ...">` 代码，
 * 79 张卡片占了足足 1300 多行，想改个名字或调个顺序都要翻半天。
 *
 * 现在我们把“卡片长什么样”抽成了通用模板（在 `components/resource-cards.js` 里），
 * 而把“每张卡片显示什么文字、点开去哪个网址”全部集中放在这个文件里！
 * 以后你要【加新网址、加新软件、加新游戏、加 3D 模型、或者调整卡片顺序】，只改这个文件就够了，完全不用碰 `index.html`！
 */
(function (TK) {
    'use strict';

    // ========================================================================
    // 板块一：【在线使用】外链工具列表 (`TK.data.onlineTools`)
    // 对应页面：点击左侧「🌐 在线使用」看到的卡片列表，右侧按钮是绿色的 `VISIT`（点击在新标签页打开外部网站）
    //
    // 【每个字段的意思】
    //   - `name` ：卡片第一行的白色粗体主标题（比如 `'Google Mail'`）
    //   - `desc` ：卡片第二行的灰色小字副标题/说明（比如 `'谷歌邮箱'`）
    //   - `url`  ：点击右侧 `VISIT` 按钮跳转去的完整网址（必须以 `http://` 或 `https://` 开头）
    //
    // 【以后怎么新增一个在线工具？】
    //   直接复制下面任意一行，粘贴到数组里你想放的位置，改掉单引号里的文字即可：
    //   {name: '网站名字', desc: '一句话介绍', url: 'https://网址/'},
    // ========================================================================
    TK.data.onlineTools = [
        {name: 'Google Mail', desc: '谷歌邮箱', url: 'https://mail.google.com/'},
        {name: 'Google Drive', desc: '谷歌云盘', url: 'https://drive.google.com/'},
        {name: 'Google Docs', desc: '谷歌文档', url: 'https://docs.google.com/'},
        {name: 'Gemini', desc: '智能AI助手', url: 'https://gemini.google.com/app'},
        {name: 'GitHub', desc: '代码界的社交网络', url: 'https://github.com/'},
        {name: 'GoogleArts', desc: '谷歌艺术', url: 'https://artsandculture.google.com/'},
        {name: 'wikiart', desc: '维基百科的“艺术图库”', url: 'https://www.wikiart.org/'},
        {name: 'Google Maps', desc: '谷歌地图', url: 'https://www.google.com/maps'},
        {name: 'Wallhaven', desc: '高质量壁纸', url: 'https://wallhaven.cc/'},
        {name: 'GIPHY', desc: 'gif动图网址', url: 'https://giphy.com/'},
        {name: 'MongoDB', desc: 'Atlas云数据库管理平台', url: 'https://cloud.mongodb.com/'},
        {name: 'vercel', desc: '云端部署平台', url: 'https://vercel.com/'},
        {name: 'Songsterr', desc: '吉他谱', url: 'https://www.songsterr.com/'},
        {name: 'World Press Photo', desc: '荷赛艺术奖', url: 'https://www.worldpressphoto.org/'},
        {name: 'Dezoomify', desc: '抓取合并瓦片图', url: 'https://dezoomify.ophir.dev/'},
        {name: 'supabase', desc: '云端数据库', url: 'https://supabase.com/'},
        {name: 'unsplash', desc: '个人艺术', url: 'https://unsplash.com/'},
        {name: 'cloudflare', desc: '全球网络基础设施服务', url: 'https://www.cloudflare.com/'},
        {name: 'iconfont', desc: '矢量图标库', url: 'https://www.iconfont.cn/'},
        {name: 'Google Fonts', desc: '谷歌字体', url: 'https://fonts.google.com/'},
        {name: 'z-library', desc: '图书库', url: 'https://zh.z-library.sk'},
        {name: '廖雪峰教学', desc: '编程库', url: 'https://liaoxuefeng.com/index.html?src=redirect'},
        {name: 'loading', desc: '载入gif图', url: 'https://loading.io/'},
        {name: 'analytics', desc: '谷歌数据分析', url: 'https://analytics.google.com/'},
        {name: 'savetwitter', desc: 'X推特视频下载', url: 'https://savetwitter.net/'},
        {name: '阿里云', desc: '阿里云服务', url: 'https://cn.aliyun.com/'},
        {name: 'Punycode', desc: '域名转换', url: 'https://tool.lu/punycode/'},
        {name: 'Resend', desc: '邮件发送', url: 'https://resend.com/'},
        {name: 'Sketchfab', desc: '模型官方推荐', url: 'https://sketchfab.com/Sketchfab/collections'},
        {name: 'gltf-viewer', desc: '模型预览', url: 'https://gltf-viewer.donmccurdy.com/'},
        {name: 'PyPI', desc: 'Python开发者的“应用商店”', url: 'https://pypi.org/'},
        {name: 'OldMan', desc: '老男人游戏网', url: 'https://www.oldmanemu.org/'},
        {name: 'FlatIcon', desc: 'ico图库网', url: 'https://www.flaticon.com/'},
        {name: 'tailscale', desc: '虚拟局域网', url: 'https://tailscale.com/'},
        {name: 'freesound', desc: '开源音效', url: 'https://freesound.org/'},
        {name: 'convertio', desc: '文件格式转换', url: 'https://convertio.co/'},
        {name: 'gitingest', desc: '仓库提取给LLM', url: 'https://gitingest.com/'},
        {name: 'remove', desc: '阿尔法通道', url: 'https://www.remove.bg/'},
        {name: 'Gumroad', desc: '数字商品交易平台', url: 'https://gumroad.com/'},
        {name: 'DeepSeekAPI', desc: '大肥鱼接口', url: 'https://platform.deepseek.com/'},
    ];

    // ========================================================================
    // 板块二：【文件下载 / 资源库】自研应用列表 (`TK.data.projects`)
    // 对应页面：点击左侧「📦 文件下载」看到的卡片列表，右侧按钮是黄色的 `OPEN`
    //           点击后会先全屏播放一段炫酷的 `.mp4` 片头视频（点击任意处可跳过），然后打开对应的应用介绍网页。
    //
    // 【标准工程文件夹摆放约定（非常重要！）】
    //   每个自研软件对应一个英文小写 `slug`（如 `toolkit`、`blackhole`、`clod-and-gold`），只要按下面规律放好文件：
    //   1. 软件图标放在：`./assets/images/apps/<slug>.ico`
    //   2. 软件网页放在：`./projects/<slug>/index.html`
    //   3. 片头视频放在：`./projects/<slug>/video/intro.mp4`
    //   4. 说明文档放在：`./projects/<slug>/docs/manual.md`
    //
    // 【辅助小函数 `project(slug, name, desc, opts)` 参数说明】
    //   - 第 1 个参数 `slug` ：文件夹与图标的英文小写目录名（如 `'blackhole'`、`'clod-and-gold'`）
    //   - 第 2 个参数 `name` ：卡片上显示的应用名称（如 `'BlackHole'`、`'ToolKit'`）
    //   - 第 3 个参数 `desc` ：卡片第二行的灰色副标题说明（如 `'办公辅助应用'`）
    //   - 第 4 个参数 `opts` ：（可选，平时不用写）特殊微调项 `{ title, largeIcon }`
    //
    // 【以后怎么新增一个自研软件？】
    //   按上面约定放好 `.ico`、`index.html`、`intro.mp4` 后，在下面 `TK.data.projects` 里加一行：
    //   project('my-app', 'MyApp', '一句话功能介绍'),
    // ========================================================================
    const project = (slug, name, desc, opts = {}) => ({
        name,                                                     // 卡片上显示的主标题
        title: opts.title || name,                                // 点开后游戏窗口顶部显示的标题
        desc,                                                     // 卡片上显示的灰色副标题
        icon: `./assets/images/apps/${slug}.ico`,                 // 自动拼接图标路径
        iconClass: opts.largeIcon ? 'w-7 h-7' : 'w-6 h-6',        // 图标大小样式类
        url: `./projects/${slug}/index.html`,                     // 自动拼接应用介绍页路径
        video: `./projects/${slug}/video/intro.mp4`               // 自动拼接片头视频路径
    });

    TK.data.projects = [
        project('blackhole', 'BlackHole', '多功能归纳悬浮黑洞', {title: 'Blackhole'}),
        project('toolkit', 'ToolKit', '办公辅助应用'),
        project('pykuai', 'PyKuai', '可视化脚本盒子'),
        project('kuaidrive', 'KuaiDrive', '挂载磁盘七巧板'),
        project('clod-and-gold', 'Clod＆Gold', '土块与金苹果', {largeIcon: true})
    ];

    // ========================================================================
    // 板块三：【复古游戏】列表 (`TK.data.games`)
    // 对应页面：点击左侧「🎮 复古游戏」看到的卡片列表，右侧按钮是红色的 `START`
    //
    // 这里分两种类型的游戏：
    //   类型 A —— 【模拟器 ROM 游戏】（占绝大多数，GBA / SNES 掌机游戏）：
    //     使用下面的 `rom('表情图标', '游戏中文名', 'rom文件名')` 快捷函数添加！
    //     只要把游戏包（`.gba` / `.sfc` / `.smc`）放进 `./games/roms/` 文件夹，
    //     `rom()` 函数会自动帮你把副标题写成 `"DIR: 文件名"`，并自动拼好模拟器启动地址 `./games/emulator.html?rom=文件名`。
    //
    //   类型 B —— 【外部网页小游戏】（比如第一项 Pixel Canvas）：
    //     直接写对象：`{emoji: '🎨', title: '游戏名', desc: '副标题介绍', url: 'https://外部网址/'}`
    //
    // 【以后怎么新增一款掌机游戏？】
    //   1. 把你的游戏 ROM 文件（比如 `contra.nes` 或 `pokemon.gba`）放进 `games/roms/` 文件夹
    //   2. 在下面 `TK.data.games` 数组里加一行：
    //      rom('🔫', '魂斗罗', 'contra.nes'),
    // ========================================================================
    const rom = (emoji, title, romFile) => ({
        emoji,                                     // 卡片左边黑框里显示的 Emoji 图标
        title,                                     // 游戏中文名（同时显示在卡片标题和模拟器窗口顶部）
        desc: `DIR: ${romFile}`,                   // 卡片第二行自动显示为 "DIR: xxx.gba"
        url: `./games/emulator.html?rom=${romFile}` // 自动拼好模拟器加载该 ROM 的网址
    });

    TK.data.games = [
        // —— 在线网页游戏 ——
        {emoji: '🎨', title: 'Pixel Canvas', desc: '全球共享像素画板', url: 'https://pixelcanvas.io/'},
        // —— GBA 游戏 ——
        rom('💣', '瓦里奥制造', 'warioware.gba'),
        rom('🐉', '口袋妖怪：绿宝石', 'emerald.gba'),
        rom('⭐', '星之卡比：镜之大迷宫', 'kirby.gba'),
        rom('🐄', '牧场物语：矿石镇的伙伴们', 'harvest_moon.gba'),
        rom('🍄', '超级马里奥A4', 'super_mario_a4.gba'),
        rom('🦇', '恶魔城晓月圆舞曲', 'castlevania_aria.gba'),
        rom('🪖', '高级战争', 'advance_wars.gba'),
        rom('✨', '光明之魂2', 'shining_soul_2.gba'),
        rom('☀️', '黄金太阳1开启的封印', 'golden_sun_1.gba'),
        rom('🌞', '黄金太阳2失落的时代', 'golden_sun_2.gba'),
        rom('🔥', '火炎之纹章封印之剑', 'fire_emblem.gba'),
        rom('🟠', '龙珠Z舞空斗剧', 'dbz_supersonic.gba'),
        rom('☁️', '龙珠大冒险', 'db_advance.gba'),
        rom('🔧', '马里奥与路易吉RPG', 'mario_luigi.gba'),
        rom('⚖️', '逆转裁判', 'phoenix_wright_1.gba'),
        rom('⚖️', '逆转裁判2', 'phoenix_wright_2.gba'),
        rom('⚖️', '逆转裁判3', 'phoenix_wright_3.gba'),
        rom('🧢', '塞尔达传说缩小帽', 'zelda_minish_cap.gba'),
        rom('🔺', '塞尔达传说众神的三角力量与四人之剑', 'zelda_four_swords.gba'),
        rom('🔮', '最终幻想6A', 'ff6a.gba'),
        // —— SNES（超级任天堂）游戏 ——
        rom('🧞', '阿拉丁', 'aladdin.sfc'),
        rom('🦕', '超级马里奥世界2耀西岛', 'yoshis_island.sfc'),
        rom('🚀', '超级银河战士', 'super_metroid.smc'),
        rom('⏳', '超时空之轮', 'chrono_trigger.smc'),
        rom('🦸‍♂️', '恐龙战队', 'power_rangers.smc'),
        rom('🌍', '天地创造', 'terranigma.sfc'),
        rom('🛡️', '勇者斗恶龙3', 'dragon_quest_3.sfc'),
        rom('💍', '勇者斗恶龙5', 'dragon_quest_5.smc'),
        rom('🛸', '宇宙巡航机3', 'gradius_3.sfc'),
    ];

    // ========================================================================
    // 板块四：【创意空间】3D 模型与创意互动网页列表 (`TK.data.creativeWorks`)
    // 对应页面：点击左侧「🧊 创意空间」看到的卡片列表，右侧按钮是靛蓝色的 `OPEN`
    //
    // 【每个字段的意思】
    //   - `emoji` ：卡片左边黑框里的 Emoji 图标（比如 `'🏙️'`）
    //   - `title` ：作品名称（显示在卡片第一行和打开后的窗口顶部）
    //   - `desc`  ：作者或来源说明（显示在卡片第二行，比如 `'By Air Digital'`）
    //   - `url`   ：点击 `OPEN` 后在窗口里加载的页面路径（可以是本地 `./models/<slug>/index.html`，也可以是 `https://` 外部网页）
    //
    // 【以后怎么新增一个 3D 模型或创意网页？】
    //   直接复制下面任意一行，改掉图标、标题、作者和路径即可：
    //   {emoji: '🏛️', title: '新作品名称', desc: 'By 作者名', url: './models/new-model-slug/index.html'},
    // ========================================================================
    TK.data.creativeWorks = [
        {emoji: '🏙️', title: '居民街区实景扫描', desc: 'By Air Digital', url: './models/residential-block/index.html'},
        {emoji: '🚢', title: '欢乐时光号渔船', desc: 'By Air Digital', url: './models/going-merry/index.html'},
        {emoji: '⛪', title: '圣波利卡普天主教堂', desc: 'By Air Digital', url: './models/st-polycarp-church/index.html'},
        {emoji: '🛏️', title: '梵高阿尔勒的卧室', desc: 'By ruslans3d', url: './models/van-gogh-bedroom/index.html'},
        {emoji: '💻', title: '电脑与虚拟桌面交互', desc: 'By Henry Heffernan', url: 'https://henryheffernan.com/'},
    ];

})(window.TuKuai);
