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
        {name: 'Google Docs', desc: '谷歌在线文档', url: 'https://docs.google.com/'},
        {name: 'Gemini', desc: '智能 AI 助手', url: 'https://gemini.google.com/app'},
        {name: 'npm', desc: 'JS/TS 包管理平台', url: 'https://www.npmjs.com/'},
        {name: 'Z-Library', desc: '免费电子书库', url: 'https://zh.z-library.sk'},
        {name: 'GitHub', desc: '代码界的社交网络', url: 'https://github.com/'},
        {name: 'Google Arts', desc: '谷歌艺术与文化', url: 'https://artsandculture.google.com/'},
        {name: 'Cloudflare', desc: '全球网络基础设施与 CDN 服务', url: 'https://www.cloudflare.com/'},
        {name: 'WikiArt', desc: '在线视觉艺术与名画图库', url: 'https://www.wikiart.org/'},
        {name: 'Google Maps', desc: '谷歌地图', url: 'https://www.google.com/maps'},
        {name: 'Wallhaven', desc: '高清壁纸图库', url: 'https://wallhaven.cc/'},
        {name: 'GIPHY', desc: 'GIF 动图搜索引擎', url: 'https://giphy.com/'},
        {name: 'MongoDB', desc: 'Atlas 云数据库管理平台', url: 'https://cloud.mongodb.com/'},
        {name: 'Vercel', desc: '前端与全栈云端部署平台', url: 'https://vercel.com/'},
        {name: 'Songsterr', desc: '交互式吉他谱库', url: 'https://www.songsterr.com/'},
        {name: 'World Press Photo', desc: '荷赛·世界新闻摄影奖', url: 'https://www.worldpressphoto.org/'},
        {name: 'Dezoomify', desc: '高清瓦片图抓取合并工具', url: 'https://dezoomify.ophir.dev/'},
        {name: 'Supabase', desc: '开源云端数据库与后端服务', url: 'https://supabase.com/'},
        {name: 'Unsplash', desc: '免费高清无版权摄影图库', url: 'https://unsplash.com/'},
        {name: 'Iconfont', desc: '阿里矢量图标库', url: 'https://www.iconfont.cn/'},
        {name: 'Google Fonts', desc: '谷歌免费开源字体库', url: 'https://fonts.google.com/'},
        {name: '廖雪峰教学', desc: '免费编程入门教程', url: 'https://liaoxuefeng.com/index.html?src=redirect'},
        {name: 'Loading.io', desc: '自定义加载动画与 GIF 生成', url: 'https://loading.io/'},
        {name: 'Google Analytics', desc: '谷歌网站数据分析', url: 'https://analytics.google.com/'},
        {name: 'SaveTwitter', desc: 'X (推特) 视频下载', url: 'https://savetwitter.net/'},
        {name: '阿里云', desc: '云计算与服务器平台', url: 'https://cn.aliyun.com/'},
        {name: 'Punycode', desc: '中文域名编码转换', url: 'https://tool.lu/punycode/'},
        {name: 'Resend', desc: '开发者邮件发送 API', url: 'https://resend.com/'},
        {name: 'Sketchfab', desc: '3D 模型官方精选集', url: 'https://sketchfab.com/Sketchfab/collections'},
        {name: 'glTF Viewer', desc: '3D (glTF) 模型在线预览', url: 'https://gltf-viewer.donmccurdy.com/'},
        {name: 'PyPI', desc: 'Python 开发者的“应用商店”', url: 'https://pypi.org/'},
        {name: 'OldMan', desc: '老男人怀旧游戏 ROM 站', url: 'https://www.oldmanemu.org/'},
        {name: 'Flaticon', desc: '扁平化矢量图标库', url: 'https://www.flaticon.com/'},
        {name: 'Tailscale', desc: '异地组网虚拟局域网', url: 'https://tailscale.com/'},
        {name: 'Freesound', desc: '开源免费音效库', url: 'https://freesound.org/'},
        {name: 'Convertio', desc: '在线文件格式转换', url: 'https://convertio.co/'},
        {name: 'Gitingest', desc: '代码仓库提取给 LLM 阅读', url: 'https://gitingest.com/'},
        {name: 'remove.bg', desc: 'AI 在线一键抠图去背景', url: 'https://www.remove.bg/'},
        {name: 'Gumroad', desc: '数字商品交易平台', url: 'https://gumroad.com/'},
        {name: 'DeepSeek API', desc: 'DeepSeek 大模型开放平台', url: 'https://platform.deepseek.com/'},
        {name: 'Google Search Console', desc: '谷歌站长与收录管理', url: 'https://search.google.com/search-console/'},
        {name: 'Bing Webmaster', desc: '必应站长与收录管理', url: 'https://www.bing.com/webmasters/'},
        {name: 'iCloud', desc: '苹果云服务', url: 'https://www.icloud.com/'},
        {name: 'Hacker News', desc: '硬核极客技术社区', url: 'https://news.ycombinator.com/'},
        {name: 'AMD', desc: '驱动更新', url: 'https://www.amd.com/en/support/download/drivers.html'},
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
        project('blackhole', 'BlackHole', '浮拖拽归档助手', {title: 'Blackhole'}),
        project('toolkit', 'ToolKit', '多功能办公效率套件'),
        project('pykuai', 'PyKuai', '微内核 CLI 工作台'),
        project('kuaidrive', 'KuaiDrive', '跨网磁盘挂载工具'),
        project('clod-and-gold', 'Clod＆Gold', '原创独立游戏作品', {largeIcon: true})
    ];

    // ========================================================================
    // 板块三：【复古游戏】列表 (`TK.data.games`)
    // 对应页面：点击左侧「🎮 复古游戏」看到的卡片列表，右侧按钮是红色的 `START`
    //
    // 这里分两种类型的游戏：
    //   类型 A —— 【模拟器 ROM 游戏】（占绝大多数，GBA / SNES / NDS 掌机游戏）：
    //     使用下面的 `rom('表情图标', '游戏中文名', 'rom文件名')` 快捷函数添加！
    //     ROM 文件统一托管在 Cloudflare R2（`https://roms.xn--udsye.art`），本地备份于桌面 `tukuai-roms` 目录。
    //     直接运行项目根目录的 `./upload-rom.ps1` 即可一键上传新 ROM 到 R2 并自动追加到下方列表！
    //
    //   类型 B —— 【外部网页小游戏】（比如第一项 Pixel Canvas）：
    //     直接写对象：`{emoji: '🎨', title: '游戏名', desc: '副标题介绍', url: 'https://外部网址/'}`
    //
    // 【以后怎么新增一款掌机游戏？】
    //   直接右键运行根目录 `upload-rom.ps1` 选文件即可；或命令行执行：
    //   .\upload-rom.ps1 -Files "D:\contra.nes" -Title "魂斗罗" -Emoji "🔫"
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
