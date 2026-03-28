import { PrismaClient, SealSeries, RouteCategory, RouteDifficulty, RouteStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ── Religion data ──────────────────────────────────────
const religions = [
  { name: '佛教', nameEn: 'Buddhism', slug: 'buddhism', symbol: '☸', color: '#F59E0B' },
  { name: '道教', nameEn: 'Taoism', slug: 'taoism', symbol: '☯', color: '#10B981' },
  { name: '基督教', nameEn: 'Christianity', slug: 'christianity', symbol: '✝', color: '#3B82F6' },
  { name: '伊斯兰教', nameEn: 'Islam', slug: 'islam', symbol: '☪', color: '#059669' },
  { name: '印度教', nameEn: 'Hinduism', slug: 'hinduism', symbol: '🕉', color: '#F97316' },
  { name: '犹太教', nameEn: 'Judaism', slug: 'judaism', symbol: '✡', color: '#6366F1' },
  { name: '儒教', nameEn: 'Confucianism', slug: 'confucianism', symbol: '儒', color: '#DC2626' },
  { name: '锡克教', nameEn: 'Sikhism', slug: 'sikhism', symbol: '☬', color: '#EA580C' },
  { name: '神道教', nameEn: 'Shinto', slug: 'shinto', symbol: '⛩', color: '#E11D48' },
  { name: '藏传佛教', nameEn: 'Tibetan Buddhism', slug: 'tibetan-buddhism', symbol: '☸', color: '#7C3AED' },
  { name: '原住民灵性', nameEn: 'Indigenous Spirituality', slug: 'indigenous', symbol: '◉', color: '#78716C' },
  { name: '巴哈伊教', nameEn: 'Bahai', slug: 'bahai', symbol: '✦', color: '#0891B2' },
];

// ── Holy Sites (60) ────────────────────────────────────
interface HolySiteData {
  name: string;
  nameEn: string;
  religionSlug: string;
  country: string;
  soundEffect: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  description: string;
}

const holySites: HolySiteData[] = [
  // ═══ 佛教 (8) ═══
  {
    name: '菩提伽耶', nameEn: 'Bodh Gaya', religionSlug: 'buddhism',
    country: '印度', soundEffect: 'singing_bowl',
    latitude: 24.696, longitude: 84.991, utcOffset: 5.5,
    description: '诸恶莫作，众善奉行，自净其意 —— 《法句经》\n不做坏事，多行善事，净化心灵',
  },
  {
    name: '布达拉宫', nameEn: 'Potala Palace', religionSlug: 'buddhism',
    country: '中国', soundEffect: 'singing_bowl',
    latitude: 29.656, longitude: 91.117, utcOffset: 8,
    description: '色即是空，空即是色 —— 《心经》\n万物表象与本质相互依存',
  },
  {
    name: '吴哥窟', nameEn: 'Angkor Wat', religionSlug: 'buddhism',
    country: '柬埔寨', soundEffect: 'singing_bowl',
    latitude: 13.412, longitude: 103.867, utcOffset: 7,
    description: '千里之行，始于足下之觉知 —— 巴利经典\n觉知当下的每一步',
  },
  {
    name: '法隆寺', nameEn: 'Horyuji', religionSlug: 'buddhism',
    country: '日本', soundEffect: 'temple_bell',
    latitude: 34.614, longitude: 135.735, utcOffset: 9,
    description: '以和为贵，无忤为宗 —— 《十七条宪法》\n和谐为贵，不要对抗',
  },
  {
    name: '五台山', nameEn: 'Mount Wutai', religionSlug: 'buddhism',
    country: '中国', soundEffect: 'temple_bell',
    latitude: 39.080, longitude: 113.583, utcOffset: 8,
    description: '应无所住而生其心 —— 《金刚经》\n不执着于任何事物，保持心灵自由',
  },
  {
    name: '仰光大金塔', nameEn: 'Shwedagon Pagoda', religionSlug: 'buddhism',
    country: '缅甸', soundEffect: 'singing_bowl',
    latitude: 16.871, longitude: 96.150, utcOffset: 6.5,
    description: '恨不止恨，唯爱止恨 —— 《法句经》\n仇恨无法终止仇恨，唯有爱能化解',
  },
  {
    name: '婆罗浮屠', nameEn: 'Borobudur', religionSlug: 'buddhism',
    country: '印尼', soundEffect: 'singing_bowl',
    latitude: -7.608, longitude: 110.204, utcOffset: 7,
    description: '一花一世界，一叶一菩提 —— 《华严经》\n微小事物中蕴含整个宇宙',
  },
  {
    name: '敦煌莫高窟', nameEn: 'Mogao Caves', religionSlug: 'buddhism',
    country: '中国', soundEffect: 'guqin_pluck',
    latitude: 40.037, longitude: 94.805, utcOffset: 8,
    description: '过去心不可得，现在心不可得，未来心不可得 —— 《金刚经》\n活在当下，不执过去未来',
  },
  // ═══ 道教 (6) ═══
  {
    name: '武当山', nameEn: 'Mount Wudang', religionSlug: 'taoism',
    country: '中国', soundEffect: 'bamboo_flute',
    latitude: 32.400, longitude: 111.004, utcOffset: 8,
    description: '道可道，非常道；名可名，非常名 —— 《道德经》第一章\n真正的道理超越语言的表达',
  },
  {
    name: '青城山', nameEn: 'Mount Qingcheng', religionSlug: 'taoism',
    country: '中国', soundEffect: 'bamboo_flute',
    latitude: 30.898, longitude: 103.573, utcOffset: 8,
    description: '上善若水，水善利万物而不争 —— 《道德经》第八章\n最高的善如水一般，滋养万物不争名利',
  },
  {
    name: '龙虎山', nameEn: 'Mount Longhu', religionSlug: 'taoism',
    country: '中国', soundEffect: 'guqin_pluck',
    latitude: 28.082, longitude: 116.968, utcOffset: 8,
    description: '人法地，地法天，天法道，道法自然 —— 《道德经》第二十五章\n人效法大地，最终归于自然',
  },
  {
    name: '茅山', nameEn: 'Mount Mao', religionSlug: 'taoism',
    country: '中国', soundEffect: 'bamboo_flute',
    latitude: 31.975, longitude: 119.152, utcOffset: 8,
    description: '致虚极，守静笃 —— 《道德经》第十六章\n让心灵虚空到极点，守住宁静',
  },
  {
    name: '崂山', nameEn: 'Mount Lao', religionSlug: 'taoism',
    country: '中国', soundEffect: 'wind_chimes',
    latitude: 36.159, longitude: 120.679, utcOffset: 8,
    description: '天地与我并生，万物与我为一 —— 《庄子·齐物论》\n天地万物与我本是一体',
  },
  {
    name: '白云观', nameEn: 'Baiyun Temple', religionSlug: 'taoism',
    country: '中国', soundEffect: 'guqin_pluck',
    latitude: 39.898, longitude: 116.344, utcOffset: 8,
    description: '知足不辱，知止不殆，可以长久 —— 《道德经》第四十四章\n知道满足就不会受辱，知道适可而止才能长久',
  },
  // ═══ 基督教 (8) ═══
  {
    name: '梵蒂冈圣彼得大教堂', nameEn: "St. Peter's Basilica", religionSlug: 'christianity',
    country: '意大利', soundEffect: 'pipe_organ',
    latitude: 41.902, longitude: 12.454, utcOffset: 1,
    description: 'God is love, and whoever abides in love abides in God —— 1 John 4:16\n神就是爱，住在爱里面的就是住在神里面',
  },
  {
    name: '圣家堂', nameEn: 'Sagrada Familia', religionSlug: 'christianity',
    country: '西班牙', soundEffect: 'choir_hymn',
    latitude: 41.404, longitude: 2.175, utcOffset: 1,
    description: 'Faith is the substance of things hoped for —— Hebrews 11:1\n信就是所望之事的实底，未见之事的确据',
  },
  {
    name: '巴黎圣母院', nameEn: 'Notre-Dame', religionSlug: 'christianity',
    country: '法国', soundEffect: 'pipe_organ',
    latitude: 48.853, longitude: 2.350, utcOffset: 1,
    description: 'Love is patient, love is kind —— 1 Corinthians 13:4\n爱是恒久忍耐，又有恩慈',
  },
  {
    name: '圣索菲亚大教堂', nameEn: 'Hagia Sophia', religionSlug: 'christianity',
    country: '土耳其', soundEffect: 'choir_hymn',
    latitude: 41.009, longitude: 28.980, utcOffset: 3,
    description: 'The truth shall set you free —— John 8:32\n真理必叫你们得以自由',
  },
  {
    name: '科隆大教堂', nameEn: 'Cologne Cathedral', religionSlug: 'christianity',
    country: '德国', soundEffect: 'pipe_organ',
    latitude: 50.941, longitude: 6.958, utcOffset: 1,
    description: 'Be still, and know that I am God —— Psalm 46:10\n你们要休息，要知道我是神',
  },
  {
    name: '威斯敏斯特教堂', nameEn: 'Westminster Abbey', religionSlug: 'christianity',
    country: '英国', soundEffect: 'choir_hymn',
    latitude: 51.499, longitude: -0.127, utcOffset: 0,
    description: 'For everything there is a season —— Ecclesiastes 3:1\n凡事都有定期，天下万务都有定时',
  },
  {
    name: '耶路撒冷圣墓教堂', nameEn: 'Church of the Holy Sepulchre', religionSlug: 'christianity',
    country: '以色列', soundEffect: 'choir_hymn',
    latitude: 31.779, longitude: 35.230, utcOffset: 2,
    description: 'Peace I leave with you; my peace I give to you —— John 14:27\n我留下平安给你们，我将我的平安赐给你们',
  },
  {
    name: '米兰大教堂', nameEn: 'Milan Cathedral', religionSlug: 'christianity',
    country: '意大利', soundEffect: 'pipe_organ',
    latitude: 45.464, longitude: 9.192, utcOffset: 1,
    description: 'Do to others as you would have them do to you —— Luke 6:31\n你们愿意人怎样待你们，你们也要怎样待人',
  },
  // ═══ 伊斯兰教 (6) ═══
  {
    name: '麦加禁寺', nameEn: 'Masjid al-Haram', religionSlug: 'islam',
    country: '沙特', soundEffect: 'adhan_call',
    latitude: 21.423, longitude: 39.826, utcOffset: 3,
    description: 'Bismillah ir-Rahman ir-Rahim —— 《古兰经》开端章\n奉至仁至慈的真主之名',
  },
  {
    name: '麦地那先知寺', nameEn: "Prophet's Mosque", religionSlug: 'islam',
    country: '沙特', soundEffect: 'adhan_call',
    latitude: 24.468, longitude: 39.611, utcOffset: 3,
    description: 'إن مع العسر يسرا —— 《古兰经》94:6\n困难之后必有容易',
  },
  {
    name: '阿尔罕布拉宫', nameEn: 'Alhambra', religionSlug: 'islam',
    country: '西班牙', soundEffect: 'adhan_call',
    latitude: 37.177, longitude: -3.590, utcOffset: 1,
    description: 'Lā ghāliba illā Allāh —— 阿尔罕布拉宫铭文\n唯有真主是胜利者',
  },
  {
    name: '蓝色清真寺', nameEn: 'Blue Mosque', religionSlug: 'islam',
    country: '土耳其', soundEffect: 'adhan_call',
    latitude: 41.005, longitude: 28.977, utcOffset: 3,
    description: 'خير الناس أنفعهم للناس —— 圣训\n最好的人是对人们最有益的人',
  },
  {
    name: '圆顶清真寺', nameEn: 'Dome of the Rock', religionSlug: 'islam',
    country: '以色列', soundEffect: 'adhan_call',
    latitude: 31.778, longitude: 35.236, utcOffset: 2,
    description: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ —— 《古兰经》5:2\n你们当在善事和敬畏上互相合作',
  },
  {
    name: '泰姬陵', nameEn: 'Taj Mahal', religionSlug: 'islam',
    country: '印度', soundEffect: 'adhan_call',
    latitude: 27.175, longitude: 78.042, utcOffset: 5.5,
    description: 'و من آياته أن خلق لكم من أنفسكم أزواجا —— 《古兰经》30:21\n他的迹象之一是为你们从你们自身中创造了配偶',
  },
  // ═══ 印度教 (6) ═══
  {
    name: '瓦拉纳西恒河', nameEn: 'Varanasi Ganges', religionSlug: 'hinduism',
    country: '印度', soundEffect: 'sitar_drone',
    latitude: 25.311, longitude: 83.011, utcOffset: 5.5,
    description: 'योगस्थ: कुरु कर्माणि —— 《薄伽梵歌》2:48\n安住于瑜伽中行动——做事不执着于结果',
  },
  {
    name: '巴厘岛母庙', nameEn: 'Besakih Temple', religionSlug: 'hinduism',
    country: '印尼', soundEffect: 'sitar_drone',
    latitude: -8.374, longitude: 115.451, utcOffset: 8,
    description: 'Tat tvam asi —— 《歌者奥义书》\n你就是那个——万物本质相同',
  },
  {
    name: '科纳克太阳神庙', nameEn: 'Konark Sun Temple', religionSlug: 'hinduism',
    country: '印度', soundEffect: 'sitar_drone',
    latitude: 19.888, longitude: 86.095, utcOffset: 5.5,
    description: 'Aham Brahmāsmi —— 《大森林奥义书》\n我即是梵——个体灵魂与宇宙本源合一',
  },
  {
    name: '尼泊尔帕斯帕提纳', nameEn: 'Pashupatinath', religionSlug: 'hinduism',
    country: '尼泊尔', soundEffect: 'sitar_drone',
    latitude: 27.711, longitude: 85.349, utcOffset: 5.75,
    description: 'Vasudhaiva Kutumbakam —— 《大奥义书》\n世界是一个大家庭',
  },
  {
    name: '吴哥窟印度教', nameEn: 'Angkor Wat Hindu', religionSlug: 'hinduism',
    country: '柬埔寨', soundEffect: 'sitar_drone',
    latitude: 13.412, longitude: 103.867, utcOffset: 7,
    description: 'Satyam eva jayate —— 《蒙查羯奥义书》\n唯有真理必胜',
  },
  {
    name: '阿克萨达姆神庙', nameEn: 'Akshardham', religionSlug: 'hinduism',
    country: '印度', soundEffect: 'sitar_drone',
    latitude: 28.613, longitude: 77.278, utcOffset: 5.5,
    description: 'Lokah Samastah Sukhino Bhavantu —— 印度教祈祷文\n愿一切众生幸福安康',
  },
  // ═══ 犹太教 (4) ═══
  {
    name: '耶路撒冷哭墙', nameEn: 'Western Wall', religionSlug: 'judaism',
    country: '以色列', soundEffect: 'shofar_horn',
    latitude: 31.777, longitude: 35.234, utcOffset: 2,
    description: 'Shema Yisrael Adonai Eloheinu Adonai Echad —— 《申命记》6:4\n以色列啊，你要听！耶和华我们的神是独一的主',
  },
  {
    name: '马萨达要塞', nameEn: 'Masada', religionSlug: 'judaism',
    country: '以色列', soundEffect: 'shofar_horn',
    latitude: 31.316, longitude: 35.354, utcOffset: 2,
    description: 'Tzedek tzedek tirdof —— 《申命记》16:20\n公义，公义，你要追求',
  },
  {
    name: '死海古卷洞', nameEn: 'Dead Sea Scrolls Caves', religionSlug: 'judaism',
    country: '以色列', soundEffect: 'shofar_horn',
    latitude: 31.741, longitude: 35.459, utcOffset: 2,
    description: "V'ahavta l'reacha kamocha —— 《利未记》19:18\n爱人如己",
  },
  {
    name: '锡安山', nameEn: 'Mount Zion', religionSlug: 'judaism',
    country: '以色列', soundEffect: 'shofar_horn',
    latitude: 31.772, longitude: 35.229, utcOffset: 2,
    description: 'Tikkun Olam —— 犹太传统\n修复世界——每个人都有责任让世界变得更好',
  },
  // ═══ 儒教 (4) ═══
  {
    name: '曲阜孔庙', nameEn: 'Confucius Temple', religionSlug: 'confucianism',
    country: '中国', soundEffect: 'temple_bell',
    latitude: 35.597, longitude: 116.986, utcOffset: 8,
    description: '己所不欲，勿施于人 —— 《论语·卫灵公》\n自己不想要的，不要强加给别人',
  },
  {
    name: '岳麓书院', nameEn: 'Yuelu Academy', religionSlug: 'confucianism',
    country: '中国', soundEffect: 'guqin_pluck',
    latitude: 28.186, longitude: 112.948, utcOffset: 8,
    description: '学而不思则罔，思而不学则殆 —— 《论语·为政》\n只学不思就迷惘，只思不学就危险',
  },
  {
    name: '白鹿洞书院', nameEn: 'Bailudong Academy', religionSlug: 'confucianism',
    country: '中国', soundEffect: 'guqin_pluck',
    latitude: 29.226, longitude: 115.992, utcOffset: 8,
    description: '三人行，必有我师焉 —— 《论语·述而》\n三人同行，其中必有我可以学习的人',
  },
  {
    name: '北京国子监', nameEn: 'Imperial Academy', religionSlug: 'confucianism',
    country: '中国', soundEffect: 'temple_bell',
    latitude: 39.947, longitude: 116.411, utcOffset: 8,
    description: '修身齐家治国平天下 —— 《大学》\n先修养自身，再齐家治国平天下',
  },
  // ═══ 锡克教 (3) ═══
  {
    name: '阿姆利则金庙', nameEn: 'Golden Temple', religionSlug: 'sikhism',
    country: '印度', soundEffect: 'choir_hymn',
    latitude: 31.620, longitude: 74.877, utcOffset: 5.5,
    description: 'Ik Onkar — There is One God —— 《古鲁·格兰特·萨希卜》\n万物同源——只有一个创造者',
  },
  {
    name: '旁遮普古鲁圣地', nameEn: 'Gurdwara Bangla Sahib', religionSlug: 'sikhism',
    country: '印度', soundEffect: 'choir_hymn',
    latitude: 28.626, longitude: 77.209, utcOffset: 5.5,
    description: 'Kirat Karo, Naam Japo, Vand Chhako —— 锡克教三大支柱\n诚实劳作，冥想神名，与人分享',
  },
  {
    name: '锡克教圣殿', nameEn: 'Harmandir Sahib', religionSlug: 'sikhism',
    country: '印度', soundEffect: 'choir_hymn',
    latitude: 31.620, longitude: 74.877, utcOffset: 5.5,
    description: 'Recognize the whole human race as one —— 古鲁·戈宾德·辛格\n视全人类为一体',
  },
  // ═══ 神道教 (4) ═══
  {
    name: '伊势神宫', nameEn: 'Ise Grand Shrine', religionSlug: 'shinto',
    country: '日本', soundEffect: 'taiko_drum',
    latitude: 34.455, longitude: 136.726, utcOffset: 9,
    description: '神は人の敬により威を増す —— 神道教训\n神因人的敬意而增辉——敬畏之心使世界光明',
  },
  {
    name: '严岛神社', nameEn: 'Itsukushima Shrine', religionSlug: 'shinto',
    country: '日本', soundEffect: 'wind_chimes',
    latitude: 34.296, longitude: 132.320, utcOffset: 9,
    description: '清き明き直き心 —— 神道四德\n清净、光明、正直之心',
  },
  {
    name: '伏见稻荷大社', nameEn: 'Fushimi Inari', religionSlug: 'shinto',
    country: '日本', soundEffect: 'taiko_drum',
    latitude: 34.967, longitude: 135.773, utcOffset: 9,
    description: '森羅万象に神が宿る —— 神道万物有灵\n万物之中皆有神灵——敬畏每一个存在',
  },
  {
    name: '明治神宫', nameEn: 'Meiji Shrine', religionSlug: 'shinto',
    country: '日本', soundEffect: 'wind_chimes',
    latitude: 35.676, longitude: 139.699, utcOffset: 9,
    description: '和を以て貴しとなす —— 《日本书纪》\n以和为贵——和谐是最珍贵的价值',
  },
  // ═══ 藏传佛教 (4) ═══
  {
    name: '拉萨大昭寺', nameEn: 'Jokhang Temple', religionSlug: 'tibetan-buddhism',
    country: '中国', soundEffect: 'singing_bowl',
    latitude: 29.653, longitude: 91.131, utcOffset: 8,
    description: '嗡嘛呢叭咪吽 —— 六字真言\n莲花中的珍宝——慈悲与智慧合一',
  },
  {
    name: '甘丹寺', nameEn: 'Ganden Monastery', religionSlug: 'tibetan-buddhism',
    country: '中国', soundEffect: 'singing_bowl',
    latitude: 29.870, longitude: 91.518, utcOffset: 8,
    description: '若欲知佛性，当观时节因缘 —— 宗喀巴大师\n要了解真理，要观察因缘时节',
  },
  {
    name: '色达喇荣五明佛学院', nameEn: 'Larung Gar', religionSlug: 'tibetan-buddhism',
    country: '中国', soundEffect: 'singing_bowl',
    latitude: 32.266, longitude: 100.591, utcOffset: 8,
    description: '自利利他，悲智双运 —— 藏传佛教教义\n利益自己也利益他人，悲悯与智慧并行',
  },
  {
    name: '不丹虎穴寺', nameEn: "Tiger's Nest", religionSlug: 'tibetan-buddhism',
    country: '不丹', soundEffect: 'singing_bowl',
    latitude: 27.492, longitude: 89.363, utcOffset: 6,
    description: '幸福不在于拥有多少，而在于放下多少 —— 不丹智慧\n幸福源于放下执着',
  },
  // ═══ 原住民灵性 (4) ═══
  {
    name: '乌鲁鲁巨石', nameEn: 'Uluru', religionSlug: 'indigenous',
    country: '澳大利亚', soundEffect: 'didgeridoo',
    latitude: -25.345, longitude: 131.037, utcOffset: 9.5,
    description: 'We are all visitors to this time, this place —— 澳大利亚原住民谚语\n我们都是这个时空的过客——珍惜当下',
  },
  {
    name: '马丘比丘', nameEn: 'Machu Picchu', religionSlug: 'indigenous',
    country: '秘鲁', soundEffect: 'didgeridoo',
    latitude: -13.163, longitude: -72.545, utcOffset: -5,
    description: 'Ama sua, ama llulla, ama quella —— 印加帝国三戒律\n不偷窃，不说谎，不懒惰',
  },
  {
    name: '巨石阵', nameEn: 'Stonehenge', religionSlug: 'indigenous',
    country: '英国', soundEffect: 'ocean_waves',
    latitude: 51.179, longitude: -1.826, utcOffset: 0,
    description: 'The earth does not belong to us; we belong to the earth —— 西雅图酋长\n大地不属于我们，我们属于大地',
  },
  {
    name: '奇琴伊察', nameEn: 'Chichen Itza', religionSlug: 'indigenous',
    country: '墨西哥', soundEffect: 'didgeridoo',
    latitude: 20.683, longitude: -88.569, utcOffset: -6,
    description: "In Lak'ech Ala K'in —— 玛雅问候语\n我是另一个你——你我本是一体",
  },
  // ═══ 巴哈伊教 (3) ═══
  {
    name: '海法空中花园', nameEn: 'Bahai Gardens Haifa', religionSlug: 'bahai',
    country: '以色列', soundEffect: 'choir_hymn',
    latitude: 32.810, longitude: 34.987, utcOffset: 2,
    description: 'The earth is but one country, and mankind its citizens —— 巴哈欧拉\n大地只是一个国家，人类都是其公民',
  },
  {
    name: '新德里莲花寺', nameEn: 'Lotus Temple', religionSlug: 'bahai',
    country: '印度', soundEffect: 'choir_hymn',
    latitude: 28.554, longitude: 77.259, utcOffset: 5.5,
    description: 'Let your vision be world-embracing —— 巴哈欧拉\n让你的目光拥抱整个世界',
  },
  {
    name: '威尔梅特灵曦堂', nameEn: 'Wilmette Temple', religionSlug: 'bahai',
    country: '美国', soundEffect: 'choir_hymn',
    latitude: 42.075, longitude: -87.683, utcOffset: -6,
    description: 'So powerful is the light of unity that it can illuminate the whole earth —— 巴哈欧拉\n团结之光如此强大，足以照亮整个大地',
  },
];

// ── Ancestral Temples (36) ─────────────────────────────
interface TempleData {
  name: string;
  nameEn: string;
  religionSlug: string;
  country: string;
  foundingDate: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
}

const temples: TempleData[] = [
  // ═══ 佛教 ═══
  {
    name: '鹿野苑', nameEn: 'Sarnath Deer Park', religionSlug: 'buddhism',
    country: '印度', foundingDate: '公元前528年',
    description: '释迦牟尼初转法轮之地，佛教第一次说法处',
    latitude: 25.381, longitude: 83.024,
  },
  {
    name: '灵鹫山', nameEn: 'Vulture Peak', religionSlug: 'buddhism',
    country: '印度', foundingDate: '公元前6世纪',
    description: '佛陀宣说法华经、般若经之圣地',
    latitude: 25.001, longitude: 85.416,
  },
  {
    name: '祇园精舍', nameEn: 'Jetavana Monastery', religionSlug: 'buddhism',
    country: '印度', foundingDate: '公元前6世纪',
    description: '佛陀驻锡最久的道场，众多经典在此宣说',
    latitude: 27.513, longitude: 82.030,
  },
  // ═══ 道教 ═══
  {
    name: '鹤鸣山', nameEn: 'Mount Heming', religionSlug: 'taoism',
    country: '中国', foundingDate: '东汉142年',
    description: '张道陵创立天师道之地，道教第一座祖庭',
    latitude: 30.558, longitude: 103.544,
  },
  {
    name: '终南山', nameEn: 'Mount Zhongnan', religionSlug: 'taoism',
    country: '中国', foundingDate: '远古',
    description: '老子著《道德经》之地，道教修行圣地',
    latitude: 33.960, longitude: 108.960,
  },
  {
    name: '楼观台', nameEn: 'Louguantai', religionSlug: 'taoism',
    country: '中国', foundingDate: '周朝',
    description: '老子讲经著书之地，道教最早宫观',
    latitude: 34.050, longitude: 108.370,
  },
  // ═══ 基督教 ═══
  {
    name: '伯利恒主诞堂', nameEn: 'Church of the Nativity', religionSlug: 'christianity',
    country: '巴勒斯坦', foundingDate: '公元326年',
    description: '耶稣基督降生之地，基督教最古老教堂之一',
    latitude: 31.704, longitude: 35.208,
  },
  {
    name: '各各他', nameEn: 'Golgotha / Calvary', religionSlug: 'christianity',
    country: '以色列', foundingDate: '公元1世纪',
    description: '耶稣受难十字架之地，基督教信仰核心圣地',
    latitude: 31.779, longitude: 35.230,
  },
  {
    name: '安提阿', nameEn: 'Antioch', religionSlug: 'christianity',
    country: '土耳其', foundingDate: '公元1世纪',
    description: '门徒首次被称为基督徒的城市，早期教会中心',
    latitude: 36.206, longitude: 36.157,
  },
  // ═══ 伊斯兰教 ═══
  {
    name: '希拉山洞', nameEn: 'Cave of Hira', religionSlug: 'islam',
    country: '沙特', foundingDate: '公元610年',
    description: '先知穆罕默德首次接受启示之地',
    latitude: 21.457, longitude: 39.858,
  },
  {
    name: '库巴清真寺', nameEn: 'Quba Mosque', religionSlug: 'islam',
    country: '沙特', foundingDate: '公元622年',
    description: '伊斯兰教第一座清真寺',
    latitude: 24.440, longitude: 39.617,
  },
  // ═══ 印度教 ═══
  {
    name: '哈里德瓦尔', nameEn: 'Haridwar', religionSlug: 'hinduism',
    country: '印度', foundingDate: '远古',
    description: '恒河出山入平原之地，印度教七大圣城之首',
    latitude: 29.945, longitude: 78.164,
  },
  {
    name: '瑞诗凯诗', nameEn: 'Rishikesh', religionSlug: 'hinduism',
    country: '印度', foundingDate: '远古',
    description: '瑜伽之都，古代圣人苦修之地',
    latitude: 30.087, longitude: 78.268,
  },
  // ═══ 犹太教 ═══
  {
    name: '圣殿山', nameEn: 'Temple Mount', religionSlug: 'judaism',
    country: '以色列', foundingDate: '公元前957年',
    description: '所罗门圣殿所在地，犹太教最神圣之地',
    latitude: 31.778, longitude: 35.236,
  },
  {
    name: '希伯伦先祖墓', nameEn: 'Cave of the Patriarchs', religionSlug: 'judaism',
    country: '以色列', foundingDate: '公元前2世纪',
    description: '亚伯拉罕、以撒、雅各安葬之地',
    latitude: 31.524, longitude: 35.110,
  },
  // ═══ 儒教 ═══
  {
    name: '曲阜阙里', nameEn: 'Queli, Qufu', religionSlug: 'confucianism',
    country: '中国', foundingDate: '春秋',
    description: '孔子故里，儒学发源地',
    latitude: 35.597, longitude: 116.986,
  },
  {
    name: '洙泗书堂', nameEn: 'Zhusi Academy', religionSlug: 'confucianism',
    country: '中国', foundingDate: '春秋',
    description: '孔子讲学之地，杏坛教化天下',
    latitude: 35.596, longitude: 116.988,
  },
  // ═══ 锡克教 ═══
  {
    name: '卡塔普尔', nameEn: 'Kartarpur Sahib', religionSlug: 'sikhism',
    country: '巴基斯坦', foundingDate: '1522年',
    description: '古鲁那纳克晚年居住讲道之地',
    latitude: 32.445, longitude: 74.625,
  },
  {
    name: '南德德', nameEn: 'Hazur Sahib Nanded', religionSlug: 'sikhism',
    country: '印度', foundingDate: '1708年',
    description: '第十代古鲁戈宾德·辛格圆寂之地',
    latitude: 19.149, longitude: 77.318,
  },
  // ═══ 神道教 ═══
  {
    name: '出云大社', nameEn: 'Izumo Taisha', religionSlug: 'shinto',
    country: '日本', foundingDate: '远古',
    description: '日本最古老神社之一，大国主神之居所',
    latitude: 35.402, longitude: 132.685,
  },
  {
    name: '高天原', nameEn: 'Takamagahara', religionSlug: 'shinto',
    country: '日本', foundingDate: '神话',
    description: '天照大神居住的天上世界，神道教创世之源',
    latitude: 34.455, longitude: 136.726,
  },
  // ═══ 藏传佛教 ═══
  {
    name: '桑耶寺', nameEn: 'Samye Monastery', religionSlug: 'tibetan-buddhism',
    country: '中国', foundingDate: '公元779年',
    description: '西藏第一座佛法僧三宝俱全的寺院',
    latitude: 29.329, longitude: 91.499,
  },
  {
    name: '甘丹寺祖庭', nameEn: 'Ganden Monastery (Founding Site)', religionSlug: 'tibetan-buddhism',
    country: '中国', foundingDate: '1409年',
    description: '宗喀巴创建格鲁派之地，黄教祖庭',
    latitude: 29.870, longitude: 91.518,
  },
  // ═══ 原住民灵性 ═══
  {
    name: '梦时代圣地', nameEn: 'Aboriginal Dreamtime Sacred Site', religionSlug: 'indigenous',
    country: '澳大利亚', foundingDate: '远古',
    description: '澳洲原住民梦时代创世的精神中心',
    latitude: -25.345, longitude: 131.037,
  },
  {
    name: '太阳神庙库斯科', nameEn: 'Coricancha Sun Temple', religionSlug: 'indigenous',
    country: '秘鲁', foundingDate: '1438年',
    description: '印加帝国太阳神殿，黄金之城的精神中心',
    latitude: -13.520, longitude: -71.978,
  },
  // ═══ 巴哈伊教 ═══
  {
    name: '巴格达Ridvan花园', nameEn: 'Ridvan Garden Baghdad', religionSlug: 'bahai',
    country: '伊拉克', foundingDate: '1863年',
    description: '巴哈欧拉宣布使命之地，巴哈伊教创立圣地',
    latitude: 33.312, longitude: 44.361,
  },
  {
    name: '阿卡监狱城', nameEn: 'Akka Prison City', religionSlug: 'bahai',
    country: '以色列', foundingDate: '1868年',
    description: '巴哈欧拉被囚禁并写下多部圣典之地',
    latitude: 32.928, longitude: 35.075,
  },
];

// ── Patriarchs (40+) ──────────────────────────────────
interface PatriarchData {
  name: string;
  nameEn: string;
  religionSlug: string;
  dates: string;
  title: string;
  biography: string;
  coreTeaching: string;
}

const patriarchs: PatriarchData[] = [
  // ═══ 佛教 ═══
  {
    name: '释迦牟尼', nameEn: 'Siddhartha Gautama', religionSlug: 'buddhism',
    dates: '公元前563-483年', title: '世尊·佛陀',
    biography: '创立佛教，悟道成佛，说法四十五年度化众生',
    coreTeaching: '诸恶莫作，众善奉行，自净其意，是诸佛教',
  },
  {
    name: '龙树菩萨', nameEn: 'Nagarjuna', religionSlug: 'buddhism',
    dates: '公元150-250年', title: '第二佛陀',
    biography: '创立中观学派，著《中论》阐明空性智慧',
    coreTeaching: '以有空义故，一切法得成',
  },
  {
    name: '六祖慧能', nameEn: 'Huineng', religionSlug: 'buddhism',
    dates: '638-713年', title: '禅宗六祖',
    biography: '创顿悟法门，著《六祖坛经》，禅宗发扬光大',
    coreTeaching: '菩提本无树，明镜亦非台，本来无一物，何处惹尘埃',
  },
  // ═══ 道教 ═══
  {
    name: '老子', nameEn: 'Laozi', religionSlug: 'taoism',
    dates: '春秋', title: '太上老君',
    biography: '著《道德经》五千言，道家哲学创始人',
    coreTeaching: '道可道，非常道；名可名，非常名',
  },
  {
    name: '张道陵', nameEn: 'Zhang Daoling', religionSlug: 'taoism',
    dates: '34-156年', title: '张天师·正一真人',
    biography: '创立天师道(正一道)，道教第一代天师',
    coreTeaching: '正一盟威之道，以清静为宗',
  },
  {
    name: '王重阳', nameEn: 'Wang Chongyang', religionSlug: 'taoism',
    dates: '1112-1170年', title: '重阳真人',
    biography: '创立全真道，倡三教合一，道教革新',
    coreTeaching: '心中端正，无须装饰；行事光明，何惧黑暗',
  },
  // ═══ 基督教 ═══
  {
    name: '耶稣基督', nameEn: 'Jesus Christ', religionSlug: 'christianity',
    dates: '公元前4-公元30年', title: '救世主·神子',
    biography: '基督教创立者，传扬天国福音，十字架救赎',
    coreTeaching: '我就是道路、真理、生命',
  },
  {
    name: '使徒保罗', nameEn: 'Apostle Paul', religionSlug: 'christianity',
    dates: '5-67年', title: '外邦人使徒',
    biography: '将基督教从犹太扩展到整个罗马帝国',
    coreTeaching: '如今常存的有信、有望、有爱，其中最大的是爱',
  },
  {
    name: '奥古斯丁', nameEn: 'Augustine of Hippo', religionSlug: 'christianity',
    dates: '354-430年', title: '恩典博士',
    biography: '基督教神学奠基人，著《忏悔录》《上帝之城》',
    coreTeaching: '你为自己创造了我们，我们的心不安息，直到安息在你里面',
  },
  // ═══ 伊斯兰教 ═══
  {
    name: '先知穆罕默德', nameEn: 'Prophet Muhammad', religionSlug: 'islam',
    dates: '570-632年', title: '封印先知·安拉的使者',
    biography: '伊斯兰教创立者，接受《古兰经》启示',
    coreTeaching: '求知，从摇篮到坟墓',
  },
  {
    name: '阿布·伯克尔', nameEn: 'Abu Bakr', religionSlug: 'islam',
    dates: '573-634年', title: '第一任哈里发',
    biography: '先知最亲密伙伴，首任正统哈里发',
    coreTeaching: '善良不会因为谦虚而减少',
  },
  // ═══ 印度教 ═══
  {
    name: '商羯罗', nameEn: 'Adi Shankara', religionSlug: 'hinduism',
    dates: '788-820年', title: '阿阇梨·世界导师',
    biography: '创立不二论吠檀多，统一印度教各派',
    coreTeaching: '梵我一如——个体灵魂与宇宙至上实在本质相同',
  },
  {
    name: '罗摩努阇', nameEn: 'Ramanuja', religionSlug: 'hinduism',
    dates: '1017-1137年', title: '阿阇梨',
    biography: '创限定不二论，强调对神的虔爱(Bhakti)',
    coreTeaching: '虔诚的爱是通向解脱的最高道路',
  },
  // ═══ 犹太教 ═══
  {
    name: '亚伯拉罕', nameEn: 'Abraham', religionSlug: 'judaism',
    dates: '约公元前2000年', title: '信心之父',
    biography: '犹太教、基督教、伊斯兰教共同的先祖',
    coreTeaching: '你要离开本地、本族、父家，往我所要指示你的地去',
  },
  {
    name: '摩西', nameEn: 'Moses', religionSlug: 'judaism',
    dates: '约公元前1400年', title: '先知中最伟大者',
    biography: '带领以色列人出埃及，在西奈山领受十诫',
    coreTeaching: '以色列啊，你要听！耶和华我们的神是独一的主',
  },
  // ═══ 儒教 ═══
  {
    name: '孔子', nameEn: 'Confucius', religionSlug: 'confucianism',
    dates: '前551-前479年', title: '至圣先师·万世师表',
    biography: '创立儒学，有教无类，编纂六经',
    coreTeaching: '己所不欲，勿施于人',
  },
  {
    name: '孟子', nameEn: 'Mencius', religionSlug: 'confucianism',
    dates: '前372-前289年', title: '亚圣',
    biography: '发展仁政学说，提出性善论',
    coreTeaching: '天将降大任于斯人也，必先苦其心志',
  },
  {
    name: '朱熹', nameEn: 'Zhu Xi', religionSlug: 'confucianism',
    dates: '1130-1200年', title: '紫阳先生·朱子',
    biography: '集理学大成，注释四书成为科举标准',
    coreTeaching: '问渠那得清如许，为有源头活水来',
  },
  // ═══ 锡克教 ═══
  {
    name: '古鲁那纳克', nameEn: 'Guru Nanak', religionSlug: 'sikhism',
    dates: '1469-1539年', title: '第一代古鲁',
    biography: '锡克教创始人，倡一神论、平等、无私服务',
    coreTeaching: 'Ik Onkar——真理之名，创造者，无所畏惧，无有仇恨',
  },
  {
    name: '古鲁阿尔詹', nameEn: 'Guru Arjan', religionSlug: 'sikhism',
    dates: '1563-1606年', title: '第五代古鲁',
    biography: '编纂锡克教圣典《古鲁·格兰特·萨希卜》',
    coreTeaching: '甘露之名充满我的心',
  },
  // ═══ 神道教 ═══
  {
    name: '天照大神', nameEn: 'Amaterasu', religionSlug: 'shinto',
    dates: '神话', title: '太阳女神·皇祖神',
    biography: '神道教最高神，日本皇室祖神，太阳化身',
    coreTeaching: '以和为贵，万物共生',
  },
  // ═══ 藏传佛教 ═══
  {
    name: '莲花生大士', nameEn: 'Padmasambhava', religionSlug: 'tibetan-buddhism',
    dates: '8世纪', title: '咕噜仁波切',
    biography: '将密宗佛法传入西藏，降伏本土苯教神灵',
    coreTeaching: '嗡阿吽 班杂 咕噜 贝玛 悉地吽',
  },
  {
    name: '宗喀巴大师', nameEn: 'Tsongkhapa', religionSlug: 'tibetan-buddhism',
    dates: '1357-1419年', title: '第二佛陀',
    biography: '创立格鲁派(黄教)，著《菩提道次第广论》',
    coreTeaching: '暇满人身极难得，既得能办人生利',
  },
  {
    name: '阿底峡尊者', nameEn: 'Atisha', religionSlug: 'tibetan-buddhism',
    dates: '982-1054年', title: '吉祥燃灯智',
    biography: '著《菩提道灯论》，复兴西藏佛教',
    coreTeaching: '诸法如梦如幻，如水中月影',
  },
  // ═══ 原住民灵性 ═══
  {
    name: '梦时代祖灵', nameEn: 'Dreamtime Ancestral Spirits', religionSlug: 'indigenous',
    dates: '远古', title: '创世祖灵',
    biography: '澳洲原住民相信祖灵在梦时代创造了大地万物',
    coreTeaching: '我们不拥有土地，土地拥有我们',
  },
  {
    name: '印加太阳神因蒂', nameEn: 'Inti', religionSlug: 'indigenous',
    dates: '15世纪', title: '太阳神·印加守护者',
    biography: '印加帝国至高神，太阳的化身',
    coreTeaching: 'Ama sua, ama llulla, ama quella——不偷窃，不说谎，不懒惰',
  },
  // ═══ 巴哈伊教 ═══
  {
    name: '巴哈欧拉', nameEn: "Baha'u'llah", religionSlug: 'bahai',
    dates: '1817-1892年', title: '上帝的荣耀',
    biography: '巴哈伊信仰创始人，宣告人类一体原则',
    coreTeaching: '大地只是一个国家，人类都是其公民',
  },
  {
    name: '巴孛', nameEn: 'The Bab', religionSlug: 'bahai',
    dates: '1819-1850年', title: '大门',
    biography: '巴比教创始人，巴哈欧拉的先驱',
    coreTeaching: '当黎明来临，你们要准备好迎接新的一天',
  },
];

// ── Teachings (50+) ───────────────────────────────────
interface TeachingData {
  name: string;
  religionSlug: string;
  originalText: string;
  sourceText: string;
  translationCn: string;
}

const teachings: TeachingData[] = [
  // ═══ 佛教 ═══
  {
    name: '诸恶莫作', religionSlug: 'buddhism',
    originalText: '诸恶莫作，众善奉行，自净其意，是诸佛教',
    sourceText: '释迦牟尼',
    translationCn: '不做任何坏事，积极行善，净化自己的心灵——这就是佛的教导',
  },
  {
    name: '应无所住', religionSlug: 'buddhism',
    originalText: '应无所住而生其心',
    sourceText: '释迦牟尼',
    translationCn: '不要执着于任何事物，保持心灵的自由与觉醒',
  },
  {
    name: '菩提无树', religionSlug: 'buddhism',
    originalText: '菩提本无树，明镜亦非台，本来无一物，何处惹尘埃',
    sourceText: '六祖慧能',
    translationCn: '觉悟不需要外在形式，心本清净，无需刻意追求',
  },
  {
    name: '中道行', religionSlug: 'buddhism',
    originalText: '不生亦不灭，不常亦不断，不一亦不异，不来亦不出',
    sourceText: '龙树菩萨',
    translationCn: '真理不偏向任何极端——走中间道路，超越二元对立',
  },
  // ═══ 道教 ═══
  {
    name: '道法自然', religionSlug: 'taoism',
    originalText: '人法地，地法天，天法道，道法自然',
    sourceText: '老子',
    translationCn: '人效法大地的厚德，大地效法天的广博，天效法道的规律，道效法自然而然',
  },
  {
    name: '上善若水', religionSlug: 'taoism',
    originalText: '上善若水，水善利万物而不争，处众人之所恶，故几于道',
    sourceText: '老子',
    translationCn: '最高境界的善像水一样，滋养万物而不争功，甘居低处',
  },
  {
    name: '清静为天下正', religionSlug: 'taoism',
    originalText: '清静为天下正',
    sourceText: '老子',
    translationCn: '保持内心的清净安宁，就能成为天下的正道',
  },
  {
    name: '全真三教合一', religionSlug: 'taoism',
    originalText: '儒门释户道相通，三教从来一祖风',
    sourceText: '王重阳',
    translationCn: '儒释道三家的道理是相通的——修行不拘形式，核心是心性修养',
  },
  // ═══ 基督教 ═══
  {
    name: '爱人如己', religionSlug: 'christianity',
    originalText: '你要尽心、尽性、尽意爱主你的神，又要爱人如己',
    sourceText: '耶稣基督',
    translationCn: '全心全意爱上帝，并像爱自己一样爱他人——这是最大的诫命',
  },
  {
    name: '信望爱三德', religionSlug: 'christianity',
    originalText: '如今常存的有信、有望、有爱这三样，其中最大的是爱',
    sourceText: '使徒保罗',
    translationCn: '信仰、希望和爱是永恒的，而爱是其中最伟大的',
  },
  {
    name: '悔改与恩典', religionSlug: 'christianity',
    originalText: '迟了，我才爱上你——古老又新鲜的美',
    sourceText: '奥古斯丁',
    translationCn: '觉醒永远不嫌晚——上帝的恩典一直在等待',
  },
  // ═══ 伊斯兰教 ═══
  {
    name: '万物非主唯有真主', religionSlug: 'islam',
    originalText: 'Lā ilāha illā Allāh, Muḥammadur rasūlu Allāh',
    sourceText: '先知穆罕默德',
    translationCn: '万物非主，唯有安拉；穆罕默德是安拉的使者——信仰的根基',
  },
  {
    name: '行善即信仰', religionSlug: 'islam',
    originalText: '最好的人是对人们最有益的人',
    sourceText: '先知穆罕默德',
    translationCn: '真正的信仰体现在善行上——帮助他人就是最好的功修',
  },
  {
    name: '求知义务', religionSlug: 'islam',
    originalText: '求知，从摇篮到坟墓',
    sourceText: '先知穆罕默德',
    translationCn: '学习知识是每个穆斯林的义务，终身不止',
  },
  // ═══ 印度教 ═══
  {
    name: '梵我一如', religionSlug: 'hinduism',
    originalText: 'Aham Brahmāsmi——我即是梵',
    sourceText: '商羯罗',
    translationCn: '个体灵魂与宇宙最高实在本质上是同一的——认识自我即认识真理',
  },
  {
    name: '虔爱解脱', religionSlug: 'hinduism',
    originalText: '以全然的爱和虔诚归向神，是解脱的最高道路',
    sourceText: '罗摩努阇',
    translationCn: '不分种姓贵贱，真诚的爱是通向解脱的大门',
  },
  {
    name: '无执行动', religionSlug: 'hinduism',
    originalText: '你只有行动的权利，没有享受果实的权利',
    sourceText: '克里希纳(薄伽梵歌)',
    translationCn: '全力做好该做的事，但不执着于结果——这是无上智慧',
  },
  // ═══ 犹太教 ═══
  {
    name: '十诫', religionSlug: 'judaism',
    originalText: '除我以外，你不可有别的神；不可杀人；不可偷盗',
    sourceText: '摩西',
    translationCn: '十条根本律法是人类道德与社会秩序的基石',
  },
  {
    name: 'Tikkun Olam', religionSlug: 'judaism',
    originalText: 'Tikkun Olam——修复世界',
    sourceText: '犹太传统',
    translationCn: '每个人都有责任通过善行让世界变得更好',
  },
  {
    name: 'Shema', religionSlug: 'judaism',
    originalText: 'Shema Yisrael, Adonai Eloheinu, Adonai Echad',
    sourceText: '摩西',
    translationCn: '以色列啊你要听——主我们的神是独一的主',
  },
  // ═══ 儒教 ═══
  {
    name: '仁者爱人', religionSlug: 'confucianism',
    originalText: '仁者爱人',
    sourceText: '孔子',
    translationCn: '仁的核心就是爱人——推己及人，将心比心',
  },
  {
    name: '己所不欲', religionSlug: 'confucianism',
    originalText: '己所不欲，勿施于人',
    sourceText: '孔子',
    translationCn: '自己不想承受的，不要强加给别人——最朴素的道德金律',
  },
  {
    name: '天降大任', religionSlug: 'confucianism',
    originalText: '天将降大任于斯人也，必先苦其心志，劳其筋骨',
    sourceText: '孟子',
    translationCn: '上天要把重任交给你，必先磨练你的意志和身心',
  },
  {
    name: '格物致知', religionSlug: 'confucianism',
    originalText: '格物、致知、诚意、正心、修身、齐家、治国、平天下',
    sourceText: '朱熹',
    translationCn: '从探究事物本质开始，一步步通向修身治国的大道',
  },
  // ═══ 锡克教 ═══
  {
    name: 'Ik Onkar', religionSlug: 'sikhism',
    originalText: 'Ik Onkar, Sat Naam——唯一的神，真理之名',
    sourceText: '古鲁那纳克',
    translationCn: '只有一位创造者，真理是他的名号——超越宗教界限的信仰',
  },
  {
    name: '三大支柱', religionSlug: 'sikhism',
    originalText: 'Kirat Karo, Naam Japo, Vand Chhako',
    sourceText: '古鲁那纳克',
    translationCn: '诚实劳作、冥想神名、与人分享——锡克教徒日常生活的三个核心',
  },
  {
    name: 'Langar共食', religionSlug: 'sikhism',
    originalText: '不论种姓、信仰、贫富，所有人坐在一起平等用餐',
    sourceText: '古鲁阿尔詹',
    translationCn: '通过共同进餐打破社会等级——平等不是口号，是行动',
  },
  // ═══ 神道教 ═══
  {
    name: '清明正直', religionSlug: 'shinto',
    originalText: '清き明き直き心——清净、光明、正直之心',
    sourceText: '天照大神(神话)',
    translationCn: '保持心灵的清净、光明、正直——这是神道的核心修养',
  },
  {
    name: '万物有灵', religionSlug: 'shinto',
    originalText: '森羅万象に神が宿る——万物之中皆有神灵',
    sourceText: '神道传统',
    translationCn: '山川草木、日月星辰都有神灵——敬畏自然就是敬畏神',
  },
  {
    name: '感恩祭祀', religionSlug: 'shinto',
    originalText: '感謝の心をもって、すべてのものに接する',
    sourceText: '神道传统',
    translationCn: '以感恩之心对待一切事物——祭祀的本质是感恩',
  },
  // ═══ 藏传佛教 ═══
  {
    name: '六字真言', religionSlug: 'tibetan-buddhism',
    originalText: '嗡嘛呢叭咪吽——莲花中的珍宝',
    sourceText: '莲花生大士',
    translationCn: '六字真言蕴含佛法精要——慈悲与智慧如莲花般纯净',
  },
  {
    name: '菩提心', religionSlug: 'tibetan-buddhism',
    originalText: '一切修法中，菩提心最为殊胜',
    sourceText: '阿底峡尊者',
    translationCn: '发愿为一切众生离苦得乐——这颗利他之心是修行的根本',
  },
  {
    name: '暇满人身', religionSlug: 'tibetan-buddhism',
    originalText: '暇满人身极难得，既得能办人生利',
    sourceText: '宗喀巴大师',
    translationCn: '获得人身极为难得，应珍惜此生精进修行',
  },
  // ═══ 原住民灵性 ═══
  {
    name: '大地母亲', religionSlug: 'indigenous',
    originalText: '大地不属于我们，我们属于大地',
    sourceText: '原住民传统',
    translationCn: '人类是大地的孩子，不是主人——与自然和谐共处是最高智慧',
  },
  {
    name: '万物关联', religionSlug: 'indigenous',
    originalText: "In Lak'ech Ala K'in——我是另一个你",
    sourceText: '原住民传统',
    translationCn: '万物相互关联，伤害他人即伤害自己——宇宙是一个整体',
  },
  {
    name: '印加三戒', religionSlug: 'indigenous',
    originalText: 'Ama sua, ama llulla, ama quella',
    sourceText: '印加传统',
    translationCn: '不偷窃、不说谎、不懒惰——简洁有力的人生准则',
  },
  // ═══ 巴哈伊教 ═══
  {
    name: '人类一体', religionSlug: 'bahai',
    originalText: '大地只是一个国家，人类都是其公民',
    sourceText: '巴哈欧拉',
    translationCn: '消除一切偏见——种族、国籍、宗教、性别，人类本是一家',
  },
  {
    name: '独立探究真理', religionSlug: 'bahai',
    originalText: '让你的目光拥抱整个世界，而非局限于自身',
    sourceText: '巴哈欧拉',
    translationCn: '每个人都应独立探索真理，不盲从传统或权威',
  },
  {
    name: '团结之光', religionSlug: 'bahai',
    originalText: '团结之光如此强大，足以照亮整个大地',
    sourceText: '巴哈欧拉',
    translationCn: '团结是最强大的力量——当人类团结时，一切问题都能解决',
  },
];

// ── Seals (曹溪愿命三十印) ─────────────────────────────

const SERIES_MAP: Record<string, SealSeries> = {
  '初印系': SealSeries.CHUYIN,
  '中印系': SealSeries.ZHONGYIN,
  '印果印': SealSeries.YINGUOYIN,
  '成道印': SealSeries.CHENGDAOYIN,
  '归源印': SealSeries.GUIYUANYIN,
};

const SERIES_COLORS: Record<string, string> = {
  '初印系': '#D4A017',
  '中印系': '#2E8B57',
  '印果印': '#DB7093',
  '成道印': '#FFD700',
  '归源印': '#6A0DAD',
};

interface SealData {
  id: number;
  name: string;
  series: string;
  poem: string;
  essence: string;
  practice: string;
  vow: string;
}

const seals: SealData[] = [
  {
    id: 1, name: '一众之誓印', series: '初印系',
    poem: '一愿起众生，一灯照百魂；\n此身非我有，誓度亿中人。',
    essence: '此印为全愿命体系的起誓印、众生印、归命印。 愿命之始，非为自己成佛，而是因众苦触心、愿起一灯。 此印印定：我此生修愿命、行灯道，是为一众而生，为众生立誓。',
    practice: '每日静坐三分钟，忆一位众生之苦（可远可近）， 对之立誓："愿我灯照彼心，不舍、不忘、不弃。"',
    vow: '愿我此愿，不为自身解脱，\n不为安逸修行，只为众生得明，\n得离苦海，得起愿心。\n愿我此身，为愿所立；\n愿我此愿，为众所持。\n今日立誓，众在即愿在。',
  },
  {
    id: 2, name: '大愿金刚印', series: '初印系',
    poem: '金刚誓愿立，千劫不为移；\n肉身承大用，尘世即道基。\n财路非俗利，愿海是归期；\n若问真印处，心头一处知。',
    essence: '大愿金刚： 愿力如海，金刚不坏。 此印所标者：一切愿行之基石，不可动摇之发心，不退转之誓志。',
    practice: '誓愿书写： 每晨写下你今日所愿之句，如："今日我以此会谈为愿财之法舟"，字字真实，不空过。',
    vow: '愿我今生所修、所行、所聚诸财，\n无一非愿命之舟，\n无一堕世俗之网。\n我之愿，如金刚坚；\n我之财，如利器济众；\n我之身，如法器承道；\n一切回向，归于众生离苦。',
  },
  {
    id: 3, name: '愿师应缘印', series: '初印系',
    poem: '非我寻师是师寻，愿缘所感祖师临；\n名相若执皆为妄，心印无声万古真。',
    essence: '愿师应缘： 非因仰慕而拜师，非因法术而依止， 唯因愿命使然，应缘而见、印心而契。',
    practice: '愿缘书写 每天默写今日一则愿缘感应，如："今日所遇某人之言，触我\'愿以企业育人\'之愿。" 不问大小，书即是印。',
    vow: '愿我所遇一切众生，皆为我愿命之引；\n愿我所遇一切境界，皆为祖师之语；\n我不执师名，我不寻法术；\n惟愿真心感应，印我愿海之舟。',
  },
  {
    id: 4, name: '道财相融印', series: '初印系',
    poem: '道若离财无弘具，财若离道成毒炉；\n金银非堕若载愿，商海亦是渡人途。',
    essence: '道财相融： 为佛道修愿，不舍财道之用； 为财道谋局，不离佛道之心。 此印印可"以商入道"之机体圆融、动静无碍， 非清修避世，非逐利忘道，乃二道一体，财法双圆。',
    practice: '道财日记： 记录今日"所获之财/所动之钱"，并反观其是否载愿、能否转道。 例如："客户转账12万，用于育人课程平台，愿为育童成道之基。"',
    vow: '愿我所聚一切财，皆为佛道之舟；\n愿我不为金银染，但以弘愿聚资；\n商场即道场，客户即众生；\n一愿引金刚，一心度万缘。',
  },
  {
    id: 5, name: '愿语愿书印', series: '初印系',
    poem: '愿不成语难载行，语不成书散随风；\n纸上非空皆金印，一字一句即愿灯。',
    essence: '愿语愿书： 愿在心，为种子； 愿在语，为承诺； 愿在书，为契印。 此印印可"愿力外显"，令愿力可述、可守、可传、可化现。',
    practice: '书写一则愿语（可短至一句）',
    vow: '愿我一言不虚发，所说皆愿语；\n愿我所书之字，不落空谈，字字成印；\n我书愿书，不为赞叹，只为印愿灯心；\n愿此愿语愿书，生生不灭，代代可传。',
  },
  {
    id: 6, name: '事业之志印', series: '初印系',
    poem: '事业不载愿，千力化虚尘；\n愿志若为体，万法皆成轮。\n不问凡与圣，只看志中真；\n一企立愿起，便是佛化身。',
    essence: '事业之志： 志业者，非营利之谋，乃愿命之事； 此印印可"愿体入业"，建立以愿为核的事业系统， 不再分道业与事业，事业即愿体，平台即法门。',
    practice: '企业愿志总章（本月必修） 撰写或更新一份文件：《我此事业为何愿而设？》',
    vow: '愿我所营事业，非为浮名，乃愿海舟；\n愿我一招一策，皆承众生之苦、众愿之召；\n愿我公司成为道场，制度为律，品牌为印；\n愿我终身行此志，至死不退，不违本誓。',
  },
  {
    id: 7, name: '世法无碍印', series: '初印系',
    poem: '世事如潮水，心佛若虚空；\n入市非染俗，应缘即真功。\n一笑谈合约，亦是诵真宗；\n肩挑千般务，愿海不曾穷。',
    essence: '世法无碍： 佛非拒世而成，菩萨非逃尘而修。 此印印可"道俗不二、出世入世无碍"的愿命通达， 使你在商业运筹、社会奔走、人情应酬中，仍能自在修道、不舍本愿。',
    practice: '定心入俗前（例：开会、社交、处理纷杂事务前） 默念此偈前两句三遍，观想"我心如虚空，世事如潮来"，进入"佛心应缘"之态。',
    vow: '愿我身在红尘，心常归佛；\n愿我行于俗事，语行皆愿；\n愿我不被世法扰，反以世法转法；\n愿我终不妄失初心，于千机中守一灯。',
  },
  {
    id: 8, name: '金刚护法印', series: '初印系',
    poem: '愿心若灯明，护法是灯座；\n誓守金刚志，敢与万魔破。\n一规护群愿，一律断魔祸；\n身即是法城，念念金刚果。',
    essence: '金刚护法： 愿大者，魔多； 道深者，扰广。 此印印可建立"护愿机制""护法结构""内外无碍的金刚身心"， 让你与所建平台团队，得以不退转、不懈怠、不崩盘。',
    practice: '金刚护愿誓言（今日可立） 书写一篇誓词，内容包括：',
    vow: '愿我身为金刚，不为利动，不为苦退；\n愿我心为护法，不妄行、不轻泄、不舍愿；\n愿我所聚团队，皆持本愿，不忘初心；\n愿我一身一愿，即是佛陀护世之塔。',
  },
  {
    id: 9, name: '度众经营印', series: '初印系',
    poem: '客来非为财，财来是众因；\n一货若载愿，胜修万页经。\n品即度人器，营即渡生轮；\n愿力经营者，处处是法身。',
    essence: '度众经营： 经营不是谋利之技，而是渡人之舟； 产品不是赢利之器，而是愿力所化之"度生法器"； 服务不是客户关系，而是众生因缘的当机处。 此印印可"商业度众、管理即法、运营即修"的实相转换， 确立你的企业 = 道场，经营 = 弘法，客户 = 众生。',
    practice: '客户愿识记录 每周选一客户，记录：',
    vow: '愿我之经营，不为虚名、不为贪利，\n唯为众生因缘、愿海渡轮；\n愿我每一产品，皆为度人器；\n愿我每一客户，皆为过去誓缘；\n愿我不忘初心，日日以营为法，事事以度为功。',
  },
  {
    id: 10, name: '教育觉照印', series: '中印系',
    poem: '教非传知识，育乃启灵根；\n一语若照心，胜造百丈门。\n愿灯燃童慧，觉照遍人群；\n教道归愿路，启人即启君。',
    essence: '教育觉照： 众生之苦，常在迷失与不觉； 愿命之光，必以教育为炬。 此印印可"以教育为度众法门"，不拘学校、课堂、辅导、对谈、课程、平台、社群， 只要能助人觉知、启慧、止苦、立志、明愿，即为教育，即为佛行。',
    practice: '愿命教育理念文（本周内书写） 撰写一篇你之"教育理念宣言"（可视为校训、社群训、教主愿），内容包含：',
    vow: '愿我所教，不落知识之海，而入愿命之光；\n愿我一言一语，皆能照见众生佛性；\n愿我能育人不迷，引心不乱，启愿不倦；\n愿我之教，终归本愿，不偏不妄。',
  },
  {
    id: 11, name: '家庭愿桥印', series: '中印系',
    poem: '家非俗世处，愿种最初根；\n情若不着我，爱即是愿灯。\n子为续愿生，侣是同行人；\n能在家成愿，何处不是门？',
    essence: '家庭愿桥： 家庭不是俗务负累，而是愿力落地的第一座桥。 此印印可将父母、伴侣、子女、亲缘之情转化为修行资源， 建立"以愿为桥梁，以爱为法身，以家为道场"的根系统，成就"入世修愿"闭环。',
    practice: '愿命家书（三日内书写） 写一封信给你的父母、伴侣、或子女，表达三件事：',
    vow: '愿我之家，非为贪图安逸，\n而是愿命之塔、修行之根；\n愿我能以亲情立愿，以家庭修愿，\n愿我之爱，不迷不执，不滞不舍，\n成为我愿海中，最深的桥梁。',
  },
  {
    id: 12, name: '儿童引慧印', series: '中印系',
    poem: '非为塑儿才，但愿点慧灯；\n一眼能返照，童心即古僧。\n若得师愿引，童愿可成真；\n小语承大愿，代代起灯轮。',
    essence: '儿童引慧： 儿童非待塑之器，乃待启之慧种； 愿命之延续，不在控制其未来，而在点亮其觉性。 此印印可将教育、育儿、亲子关系、童事经营等，转化为愿命弘传之"灯种工程"。',
    practice: '儿童愿语共写仪式 与孩子一起，每周一次写下"今日我愿"：',
    vow: '愿我以愿照童心，不以我执塑性命；\n愿我之子，非我延续，而是众生未来的灯塔；\n愿我能为每一童，启其慧、护其愿、燃其心；\n愿我所育不止一人，而是未来佛国的种子林。',
  },
  {
    id: 13, name: '法教传播印', series: '中印系',
    poem: '法若不传播，愿难达众门；\n一语启人慧，胜书十亿文。\n策划亦是诵，话术即真言；\n肉身作法鼓，传播是佛身。',
    essence: '法教传播： 佛法非只存于庙宇高座，真正的传播者，是愿命所化之"言语身口意布施者"； 此印印可将你所有输出——说话、写作、演讲、培训、视频、社群、品牌话术—— 转化为法的传播、愿的传灯、道的显化。',
    practice: '愿语化传播稿（每周一次） 每周挑一个真实传播素材（如朋友圈推文、社群公告、课程文案、品牌 slogan），问自己四件事：',
    vow: '愿我所说，不为美化包装，\n而为照见苦、连接愿、启心灯；\n愿我所写，不为宣传虚名，\n而为弘法无声、传播有愿；\n愿我每一次发声，皆为度人；\n愿我此身，即为佛法之鼓、愿命之舟。',
  },
  {
    id: 14, name: '联宗归愿印', series: '中印系',
    poem: '宗不隔愿海，道本归灯心；\n万法虽异路，归源即愿轮。\n不争谁最上，惟问谁能行；\n愿心若无界，万教皆同门。',
    essence: '联宗归愿： 佛不执佛，道不执道，愿者归一； 众宗本为一愿之异形，众法本为一灯之分光。 此印印可成就"以愿为本、超宗入愿"的统摄智慧， 令你能在佛教、道教、儒家、基督、伊斯兰、教育、心理、哲学之间游刃有余、化法为愿， 建立以愿命为本的无碍统整。',
    practice: '愿命交汇图谱 绘制一图，中心为你本愿，四周标出你所涉宗教/系统/文化，如：',
    vow: '愿我不执一宗之法，不限一教之形，\n惟以愿为归，法为用，万教为助缘；\n愿我能于道中弘佛，于商中布施，于儒中育德，于教中传光；\n愿我之愿，能统摄一切归真者，使千门同出、一愿成舟。',
  },
  {
    id: 15, name: '龙象传灯印', series: '中印系',
    poem: '龙象非巨力，乃愿重不回；\n一灯若相印，千火照寒灰。\n教非布知识，愿印入人胎；\n育者非教众，点灯育佛来。',
    essence: '龙象传灯： 龙象者，大乘行愿者也； 传灯者，非传知识、非授职位，而是"以愿印愿、以灯照灯"。 此印印可确立你的"传人系统""灯种培养""修炼门径""师承轨制"， 成为"愿命修行的灯塔系统建立者"。',
    practice: '愿命传灯系统起草 写一篇文，内容包括：',
    vow: '愿我不独燃此愿灯，愿万灯因我点燃；\n愿我非讲法者，而是引愿者；\n愿我所育非人才，而是愿子、愿徒、愿灯；\n愿我此灯，代代有传，千秋不息，照尽众生心海。',
  },
  {
    id: 16, name: '顶礼复兴印', series: '中印系',
    poem: '一拜非为古，顶礼是承根；\n若无复兴志，愿海也浮尘。\n祖愿犹在世，法脉待人焚；\n点灯如见祖，我心即宗门。',
    essence: '顶礼复兴： 愿命虽创新不离源头，弘道必归祖根； 此印印可你礼祖师、感法脉、续灯统、复大愿， 发起"再兴之誓"，承担"中兴之责"，建立"复祖之道"。',
    practice: '祖系感愿仪式 设立一日，为你心中之祖师（可一位或多位）顶礼、发愿、书印',
    vow: '愿我不忘本源，愿我不离祖宗，\n愿我发此一愿，为祖点灯、为脉开河；\n愿我承一法，即传一脉；\n愿我在世，即祖灯重燃；\n愿此复兴之志，万代不灭！',
  },
  {
    id: 17, name: '国家报恩印', series: '中印系',
    poem: '若不为家国，愿灯亦浮空；\n一心承祖统，万行护九重。\n利世非虚语，悲智即国功；\n佛子真报国，愿海渡千峰。',
    essence: '国家报恩： 愿命不是逃避现实的避风港，而是护持众生国土的大誓行。 此印印可成就你"身为佛子，心系苍生；承法报祖，弘愿报国"的历史站位。 你所行的教育、企业、文化、修行、传灯、布施，皆可转为国家所需、民族所盼、文化所承、时代所应之愿力布施。',
    practice: '书写《国家报恩愿章》 写一篇文字，表达以下几点：',
    vow: '愿我此身非徒修己，亦为家国承愿；\n愿我所行非独开道，亦为众生布桥；\n愿我一语一行，不辱祖宗，不负国恩；\n愿我终身弘愿不息，愿海所至，皆为国土安宁、众生觉照。',
  },
  {
    id: 18, name: '法界愿印印', series: '中印系',
    poem: '愿本无所住，印在众生心；\n法界若动念，十方即同寻。\n我身非我身，愿力常行轮；\n一念印全界，空花遍法门。',
    essence: '法界愿印： 法界非地理、非边界，而是空性中显现万愿之镜； 此印印可开启你"超越个体小我"、愿命升入法界感应系统之能力。 从此愿非局限于"此身能做之事"，而是"我之愿，已托付于法界，日日化现。"',
    practice: '法界愿印祈请仪式 于静夜焚香/坐定，念愿词、礼敬三界，口说：',
    vow: '愿我所愿，超越此身，不依名、不著我；\n愿我化身万象，或为语、或为雨、或为默然利他；\n愿我之愿，如空中之花，虽不可执，常在众生眼前；\n愿我起一念，法界皆应，愿我不执此念，法界不止。',
  },
  {
    id: 19, name: '万法归心印', series: '中印系',
    poem: '愿海非他处，起念即真心；\n万行若起执，皆须返照根。\n不为愿成累，但愿心常明；\n一归归无二，万象即吾灯。',
    essence: '万法归心： 愿命之终，不在于完成多少外事，而在于——是否归于一心、合于真源、返于无我。 此印印可将你过去建立的一切愿体、系统、身份、工程、机构，归摄于一念清净愿心中， 从此你所行所愿，无不以"自性愿灯"流出，无不返归"本觉心海"。',
    practice: '"返根自问"练习（每日一次） 每日自问三句：',
    vow: '愿我今日所修、所弘、所传、所讲、所布，\n不为名、不为相、不为执；\n愿我愿命之源，唯此本心；\n愿我归一无二，愿即吾心，心即众灯，灯即法界。',
  },
  {
    id: 20, name: '传灯不息印', series: '中印系',
    poem: '此灯非我有，代代愿心燃；\n一点不为照，自照即照天。\n人身若灭尽，愿火尚无边；\n传灯如传命，此誓永不迁。',
    essence: '传灯不息： 佛灯非为自己点，而是为众生、为时代、为三世… 此印印可你确立"我灯照人、人灯续我"的传承誓系， 将愿命系统升华为可自燃、自生、自育、自续之永续愿命体系。',
    practice: '书写《灯火不息誓书》 发一封"愿命遗言"，其中包括：',
    vow: '愿我今日所修所传所灯，不为己利、不为浮名、\n而为法界所托、众生所系、祖师所望、未来所依；\n愿我此愿，传灯不息，三世有续，千秋无断，\n若此世界灯灭，我愿再点，若此愿灯无人续，我愿成火种。',
  },
  {
    id: 21, name: '愿体成实印', series: '印果印',
    poem: '愿生即愿果，起行即到家；\n觉照无前后，印成本来花。',
    essence: '愿体既立，实果当现。 此印表征——愿已非起点，而是全体之"果位本身"。你不再为愿而修，而是知晓："我所发愿，已然即果。"',
    practice: '每日持念："我愿即已圆满。" 观一事成、一人喜、一念正，即念"此是我愿所成果"。',
    vow: '我愿，已成；我愿，已在。\n不求结果，只认本然。\n我所行，即愿之身；\n我所念，即果之光。\n愿体不在未来，而在今朝之心花盛放。',
  },
  {
    id: 22, name: '果中转愿印', series: '印果印',
    poem: '我愿不为我成，果后愿再生；\n化身为愿火，烧尽苦无名。',
    essence: '此印象征：即使已达愿果， 仍愿回转，化果为愿，成为众生愿母，续愿不息。',
    practice: '每日记下一件"我已经做到/已达成/已果成"的事， 然后立下续愿：我愿此果，不为己享，而为众用。',
    vow: '愿我所有果，非我所得，乃众得之因；\n愿我所有成，非我所享，乃众享之缘；\n我愿不歇，我愿不灭，\n果中转愿，愿火常燃。',
  },
  {
    id: 23, name: '众生果觉印', series: '印果印',
    poem: '若问何为佛，他笑即吾灯；\n众心生愿处，即是我归声。',
    essence: '此印表征"众生成就，即我之果"。 若我愿成，不在我是否得果，而在众心有觉、众愿能生。我果不现于我名声功德，而现于他人心灯燃起之处。',
    practice: '每日遇见一人说出善意、慈悲、修行之念， 即默念："此是我愿所成，此是我佛果现前。"',
    vow: '愿我所成非我之果，愿众所觉即我之灯。\n我不在他前，只愿与他共燃；\n我不为佛作佛，只愿一笑归真。\n若有人心愿生，即是我愿果圆。',
  },
  {
    id: 24, name: '顿超印心印', series: '成道印',
    poem: '不假方便道，愿即性中成；\n念念皆顿觉，法界印吾灯。',
    essence: '此印象征"一念顿超、印心成佛"。不待渐修、不求彼岸、 愿力即本觉，心印即法身，一念回照，当下即是佛道。',
    practice: '每日静坐或行动中， 随时观一念： → 此念从何生？若我能回观即成佛，此即佛念。',
    vow: '愿我不假修成，愿体本觉；\n愿我念念当下，灯灯印佛；\n我不修成佛，我本来是佛；\n但愿灯灯相照，法界共明。',
  },
  {
    id: 25, name: '返修入用印', series: '成道印',
    poem: '已觉还如未，空中起悲轮；\n不舍凡身愿，示现照迷津。',
    essence: '此印象征「已觉还修」「法身再入群生」。虽愿体已成，性灯已照， 却不离众生界，以愿再起修，以修现愿行。这不是"重走旧路"， 而是以"觉者之身"，自愿入世修行，广度有情。',
    practice: '今日我所说所做，是因利己，还是因愿而生？ 如能回到"愿意"，即回"返修身"。',
    vow: '愿我虽觉而不止，虽成而不休；\n愿我于空中起悲，于法身显用；\n不舍凡身为愿舟，不离尘世为引灯；\n愿随一切迷津人，同行入觉岸。',
  },
  {
    id: 26, name: '法身不动印', series: '成道印',
    poem: '不起而已行，无言而法周；\n心如虚空界，灯在众生头。',
    essence: '此印象征「不动而恒应，寂中现用，愿体成法身，恒住法界」。众生流转，菩萨示现； 愿主本觉，法身不动—— 不动，不是静止，而是无所住而住，无所应而应。',
    practice: '每日行一事，不设意、不执果、不现功德心。',
    vow: '愿我不起心而恒行愿，\n愿我无所说而自法周；\n愿我心如虚空，包容无边众苦，\n愿我灯不照己明，而照他愿成佛。',
  },
  {
    id: 27, name: '归性无愿印', series: '归源印',
    poem: '发愿为归空，不愿亦是灯；\n性空而不灭，归源更圆成。',
    essence: '此印象征「愿体尽归自性，自性无愿而成大愿，愿空性现」。一切愿，皆从性起； 当愿成究竟，其根所归，正是本来无愿之真性。非无愿之人不发愿， 而是发愿者终须归于无愿之地，方不住愿、不断愿、不执愿。',
    practice: '每日发愿前，先问："谁在发愿？为谁发愿？是否有主、有执？" 若见愿体生执，即念：「愿归空性，空不灭灯。」',
    vow: '愿我愿归于空，不灭于断，\n愿我心归于源，不住于形；\n愿我虽无愿而恒照，虽无语而常行，\n愿性即灯，愿空即光。',
  },
  {
    id: 28, name: '性海一体印', series: '归源印',
    poem: '愿海与性海，一滴不分流；\n我心同佛心，愿同众愿修。',
    essence: '此印象征「众生愿我愿，诸佛愿同愿，性愿无二，体一如海」。此为归源印中"共体大悲"的核心—— 愿主已无所执"我愿"，所发所行所觉，皆为众生之愿、性海之流。此印开时，心无私愿，愿无边界，法界众愿皆由一愿而成。',
    practice: '今日观想三类人： 一类愿望与你一致；一类与你相悖；一类毫不相干。',
    vow: '愿我所愿，归入众愿；\n愿我之心，同于佛心。\n愿我如一滴，不自分流，\n愿海恒明，性光不灭。',
  },
  {
    id: 29, name: '化归无我印', series: '归源印',
    poem: '无人燃愿灯，灯火却常明；\n忘我而成我，空中自性生。',
    essence: '此印象征「修者无人、成者无我、传者无名，一切归于法界自然流行」。若前印"性海一体"为大愿融众，此印即为愿体归寂，寂中现用，无人之愿、无人之佛、无人之道。这是"无我"成佛的转境， 亦是"以无为为大为"的真实修行门。',
    practice: '观想今日所行善愿、布施利他，皆不署名、无归属、无我执。',
    vow: '愿我之灯，无人而照；\n愿我之愿，无我而成。\n愿我之身，入空无形；\n愿我之性，自光不灭。',
  },
  {
    id: 30, name: '寂照圆成印', series: '归源印',
    poem: '寂非灭光体，照乃无为心；\n愿若真圆处，即是佛图腾。',
    essence: '此印象征「归于寂静，照于法界；不灭不生，圆满印成」。所谓"寂"非死寂，"照"非有为， 而是愿灯之光化作常寂光土，自性之明遍映法界群生。此印一启，愿命三十印悉皆回归"寂照一如"，成佛于此本世本心中。',
    practice: '今日静坐或步行中观想： 无起心动念，无所希求，无所逃避，但觉心中一灯不息，自照寂寂。',
    vow: '愿我之心，如寂光土；\n愿我之灯，如无尽藏。\n愿不为愿，果不为果，\n今愿圆成，即佛自在。',
  },
];

// ── Route data (10条示范路线) ──────────────────────────

interface RouteData {
  slug: string;
  title: string;
  titleEn: string;
  subtitle: string;
  category: RouteCategory;
  difficulty: RouteDifficulty;
  duration: number;
  nights: number;
  highlights: string[];
  description: string;
  itinerary: object[];
  priceFrom: number;
  included: string[];
  excluded: string[];
  tips: string[];
  season: string;
  groupSize: string;
  religionSlug: string | null;
  // holy site names to link (in order)
  siteLinks: { siteName: string; day: number; order: number; duration: string; note?: string }[];
}

const routes: RouteData[] = [
  // ═══ 1. 禅宗：六祖慧能路线 ═══
  {
    slug: 'sixth-patriarch-huineng',
    title: '六祖慧能路线',
    titleEn: 'Sixth Patriarch Huineng Route',
    subtitle: '追随六祖足迹，体验禅宗精髓',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.EASY,
    duration: 5, nights: 4,
    highlights: ['禅宗文化', '素斋体验', '山居生活', '南华寺朝拜'],
    description: '沿着六祖慧能的足迹，从新兴国恩寺到韶关南华寺，再到广州光孝寺，深度体验禅宗发源地的文化魅力。品尝百年素斋，参与晨钟暮鼓，感受"菩提本无树"的智慧。',
    itinerary: [
      { day: 1, title: '抵达广州·光孝寺', activities: ['光孝寺参观', '六祖剃度处', '菩提树下品茶'], meals: ['午餐：光孝寺素斋'], accommodation: '广州市区酒店' },
      { day: 2, title: '广州→新兴·国恩寺', activities: ['驱车前往新兴', '国恩寺朝拜', '六祖故里探访'], meals: ['午餐：新兴竹笋宴', '晚餐：温泉酒店'], accommodation: '新兴温泉度假酒店' },
      { day: 3, title: '新兴→韶关', activities: ['晨起禅修体验', '驱车前往韶关', '丹霞山观景'], meals: ['午餐：丹霞山农家菜'], accommodation: '韶关市区酒店' },
      { day: 4, title: '南华寺全日', activities: ['南华寺朝拜', '六祖真身瞻仰', '抄经体验', '素斋午餐'], meals: ['午餐：南华寺百年素斋', '晚餐：韶关特色菜'], accommodation: '韶关市区酒店' },
      { day: 5, title: '返程', activities: ['曹溪讲坛参观', '购买纪念品', '送站返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 328000, // ¥3,280
    included: ['全程交通', '4晚住宿', '景点门票', '专业导游', '6正餐'],
    excluded: ['往返大交通', '个人消费', '旅行保险'],
    tips: ['建议穿舒适步行鞋', '南华寺内请保持安静', '素斋需提前预约'],
    season: '春秋两季(3-5月/9-11月)',
    groupSize: '2-8人小团',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 2. 禅宗：达摩祖师路线 ═══
  {
    slug: 'bodhidharma-route',
    title: '达摩祖师路线',
    titleEn: 'Bodhidharma Route',
    subtitle: '从广州到嵩山，追寻达摩东渡足迹',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.MODERATE,
    duration: 4, nights: 3,
    highlights: ['少林功夫', '嵩山风光', '达摩面壁洞', '白马寺'],
    description: '从达摩东渡登岸的广州出发，一路北上至嵩山少林寺，探访达摩面壁九年的洞穴，感受"一苇渡江"的传奇。途经中国第一座佛教寺院白马寺，领略禅武合一的独特文化。',
    itinerary: [
      { day: 1, title: '广州·西来初地', activities: ['华林寺参观(达摩登岸处)', '西关文化区漫步'], meals: ['午餐：广州早茶'], accommodation: '广州市区' },
      { day: 2, title: '飞往洛阳·白马寺', activities: ['白马寺参观', '洛阳龙门石窟'], meals: ['午餐：洛阳水席'], accommodation: '洛阳市区' },
      { day: 3, title: '嵩山少林寺', activities: ['少林寺朝拜', '达摩面壁洞', '武术表演观摩', '塔林'], meals: ['午餐：少林素斋'], accommodation: '登封市区' },
      { day: 4, title: '嵩山日出·返程', activities: ['嵩山日出', '嵩阳书院', '送站返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 298000,
    included: ['广州→洛阳机票', '全程交通', '3晚住宿', '景点门票', '导游'],
    excluded: ['往返广州大交通', '个人消费'],
    tips: ['少林寺山路较多，注意体力分配', '龙门石窟建议租讲解器'],
    season: '四季皆宜，春秋最佳',
    groupSize: '2-10人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 3. 佛教：印度佛陀足迹 ═══
  {
    slug: 'buddha-footsteps-india',
    title: '印度佛陀足迹',
    titleEn: 'Buddha Footsteps in India',
    subtitle: '走访佛教四大圣地，重温佛陀一生',
    category: RouteCategory.BUDDHIST,
    difficulty: RouteDifficulty.CHALLENGING,
    duration: 8, nights: 7,
    highlights: ['菩提伽耶', '鹿野苑', '印度文化', '佛教四大圣地'],
    description: '从佛陀诞生地蓝毗尼到成道地菩提伽耶，从初转法轮的鹿野苑到涅槃地拘尸那罗，完整重走佛陀一生的关键圣地。深度体验印度文化，品尝当地美食，与僧侣交流。',
    itinerary: [
      { day: 1, title: '抵达德里', activities: ['接机', '德里印度门', '甘地纪念馆'], meals: ['晚餐：北印度料理'], accommodation: '德里五星酒店' },
      { day: 2, title: '德里→瓦拉纳西', activities: ['飞往瓦拉纳西', '恒河泛舟', '恒河夜祭'], meals: ['全餐'], accommodation: '瓦拉纳西' },
      { day: 3, title: '鹿野苑', activities: ['鹿野苑遗址', '考古博物馆', '达美克佛塔'], meals: ['全餐'], accommodation: '瓦拉纳西' },
      { day: 4, title: '瓦拉纳西→菩提伽耶', activities: ['驱车前往菩提伽耶', '摩诃菩提寺'], meals: ['全餐'], accommodation: '菩提伽耶' },
      { day: 5, title: '菩提伽耶全日', activities: ['菩提树冥想', '各国寺院参观', '苦行林'], meals: ['全餐'], accommodation: '菩提伽耶' },
      { day: 6, title: '菩提伽耶→拘尸那罗', activities: ['驱车前往拘尸那罗', '涅槃寺'], meals: ['全餐'], accommodation: '拘尸那罗' },
      { day: 7, title: '拘尸那罗→蓝毗尼', activities: ['跨境前往尼泊尔蓝毗尼', '佛陀诞生地'], meals: ['全餐'], accommodation: '蓝毗尼' },
      { day: 8, title: '返程', activities: ['蓝毗尼→加德满都/德里', '返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 1280000,
    included: ['国内段交通', '7晚住宿', '全程导游(中文)', '景点门票', '21餐'],
    excluded: ['国际机票', '签证费', '个人消费', '旅行保险'],
    tips: ['需办理印度签证', '建议接种相关疫苗', '注意饮食卫生', '携带驱蚊用品'],
    season: '10月-3月(避开酷暑和雨季)',
    groupSize: '4-12人',
    religionSlug: 'buddhism',
    siteLinks: [
      { siteName: '菩提伽耶', day: 4, order: 1, duration: '全天', note: '佛陀成道处' },
      { siteName: '鹿野苑', day: 3, order: 1, duration: '半天', note: '初转法轮处' },
    ],
  },
  // ═══ 4. 道教：武当问道 ═══
  {
    slug: 'wudang-taoist-heritage',
    title: '武当问道',
    titleEn: 'Wudang Taoist Heritage',
    subtitle: '问道武当，寻访三大道教名山',
    category: RouteCategory.TAOIST,
    difficulty: RouteDifficulty.MODERATE,
    duration: 5, nights: 4,
    highlights: ['武当太极', '道教养生', '名山胜景', '道教宫观'],
    description: '武当山→龙虎山→青城山，走访中国三大道教名山。学习太极拳，品尝道教养生膳食，体验道教文化的天人合一理念。从张三丰到张道陵，从太极到天师道，全方位感受道教文化。',
    itinerary: [
      { day: 1, title: '抵达武当山', activities: ['紫霄宫', '南岩宫', '金顶远眺'], meals: ['午餐：武当道膳'], accommodation: '武当山脚' },
      { day: 2, title: '武当山全日', activities: ['金顶日出', '太极拳晨练', '太和宫', '逍遥谷'], meals: ['全餐'], accommodation: '武当山脚' },
      { day: 3, title: '飞往龙虎山', activities: ['天师府参观', '泸溪河竹筏漂流', '悬棺之谜'], meals: ['午餐：鹰潭特色菜'], accommodation: '鹰潭市区' },
      { day: 4, title: '飞往青城山', activities: ['青城山前山', '天师洞', '上清宫'], meals: ['午餐：青城四绝'], accommodation: '都江堰市区' },
      { day: 5, title: '都江堰·返程', activities: ['都江堰水利工程', '返程送站'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 458000,
    included: ['内段机票', '全程交通', '4晚住宿', '景点门票', '导游', '太极课'],
    excluded: ['往返大交通', '个人消费', '缆车费用'],
    tips: ['武当山山路陡峭，建议带登山杖', '龙虎山有蛇出没注意安全', '青城山注意防雨'],
    season: '春秋两季最佳',
    groupSize: '2-8人',
    religionSlug: 'taoism',
    siteLinks: [
      { siteName: '武当山', day: 1, order: 1, duration: '2天', note: '道教第一名山' },
      { siteName: '龙虎山', day: 3, order: 1, duration: '全天', note: '天师道发源地' },
      { siteName: '青城山', day: 4, order: 1, duration: '全天', note: '道教四大名山' },
    ],
  },
  // ═══ 5. 基督教：耶路撒冷朝圣 ═══
  {
    slug: 'jerusalem-pilgrimage',
    title: '耶路撒冷朝圣之旅',
    titleEn: 'Jerusalem Pilgrimage',
    subtitle: '走进圣城，感受三大宗教交汇',
    category: RouteCategory.CHRISTIAN,
    difficulty: RouteDifficulty.EASY,
    duration: 5, nights: 4,
    highlights: ['圣墓教堂', '苦路十四站', '哭墙', '橄榄山'],
    description: '深入耶路撒冷老城，走访基督教、犹太教、伊斯兰教三大宗教的神圣之地。从苦路十四站到圣墓教堂，从哭墙到圆顶清真寺，感受这座永恒之城的千年历史与信仰力量。',
    itinerary: [
      { day: 1, title: '抵达特拉维夫→耶路撒冷', activities: ['接机', '橄榄山远眺圣城', '客西马尼园'], meals: ['晚餐'], accommodation: '耶路撒冷老城酒店' },
      { day: 2, title: '耶路撒冷老城·基督教区', activities: ['苦路十四站', '圣墓教堂', '最后晚餐厅'], meals: ['全餐'], accommodation: '耶路撒冷' },
      { day: 3, title: '耶路撒冷·犹太区+伊斯兰区', activities: ['哭墙', '圣殿山远观', '圆顶清真寺', '大卫城'], meals: ['全餐'], accommodation: '耶路撒冷' },
      { day: 4, title: '伯利恒+死海', activities: ['伯利恒主诞堂', '牧羊人田野', '死海漂浮体验'], meals: ['全餐'], accommodation: '耶路撒冷' },
      { day: 5, title: '返程', activities: ['雅法老城', '特拉维夫送机'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 880000,
    included: ['全程交通', '4晚住宿', '景点门票', '中文导游', '12餐'],
    excluded: ['国际机票', '签证费', '个人消费'],
    tips: ['圣地着装要求：遮盖膝盖和肩膀', '安检较多请耐心', '老城石板路注意防滑'],
    season: '春秋两季(3-5月/9-11月)',
    groupSize: '4-12人',
    religionSlug: 'christianity',
    siteLinks: [
      { siteName: '耶路撒冷圣墓教堂', day: 2, order: 1, duration: '半天', note: '基督教最神圣地点' },
      { siteName: '耶路撒冷哭墙', day: 3, order: 1, duration: '1小时', note: '犹太教圣地' },
      { siteName: '圆顶清真寺', day: 3, order: 2, duration: '1小时', note: '伊斯兰教圣地' },
    ],
  },
  // ═══ 6. 伊斯兰：丝绸之路清真寺 ═══
  {
    slug: 'silk-road-mosques',
    title: '丝绸之路清真寺之旅',
    titleEn: 'Silk Road Mosques',
    subtitle: '沿丝路探访伊斯兰建筑瑰宝',
    category: RouteCategory.ISLAMIC,
    difficulty: RouteDifficulty.CHALLENGING,
    duration: 10, nights: 9,
    highlights: ['丝路文化', '清真寺建筑', '多元美食', '历史交融'],
    description: '从西安大清真寺出发，沿古丝绸之路西行，经喀什、撒马尔罕，最终抵达伊斯坦布尔。10天深度体验丝路沿线的伊斯兰文化，欣赏世界最美清真寺建筑，品尝丝路美食。',
    itinerary: [
      { day: 1, title: '西安', activities: ['化觉巷大清真寺', '回民街美食', '碑林博物馆'], meals: ['全餐'], accommodation: '西安' },
      { day: 2, title: '西安→敦煌', activities: ['飞往敦煌', '莫高窟', '鸣沙山月牙泉'], meals: ['全餐'], accommodation: '敦煌' },
      { day: 3, title: '敦煌→喀什', activities: ['飞往喀什', '艾提尕尔清真寺', '喀什老城'], meals: ['全餐'], accommodation: '喀什' },
      { day: 4, title: '喀什全日', activities: ['高台民居', '手工艺巴扎', '维吾尔族家访'], meals: ['全餐'], accommodation: '喀什' },
      { day: 5, title: '喀什→撒马尔罕', activities: ['飞往乌兹别克斯坦', '雷吉斯坦广场'], meals: ['全餐'], accommodation: '撒马尔罕' },
      { day: 6, title: '撒马尔罕全日', activities: ['比比哈努姆清真寺', '沙赫静达陵墓群', '乌鲁别克天文台'], meals: ['全餐'], accommodation: '撒马尔罕' },
      { day: 7, title: '撒马尔罕→布哈拉', activities: ['波伊卡扬建筑群', '布哈拉老城', '弥尔阿拉伯神学院'], meals: ['全餐'], accommodation: '布哈拉' },
      { day: 8, title: '布哈拉→伊斯坦布尔', activities: ['飞往伊斯坦布尔', '加拉塔桥日落'], meals: ['晚餐'], accommodation: '伊斯坦布尔' },
      { day: 9, title: '伊斯坦布尔', activities: ['蓝色清真寺', '圣索菲亚大教堂', '托普卡帕宫', '大巴扎'], meals: ['全餐'], accommodation: '伊斯坦布尔' },
      { day: 10, title: '返程', activities: ['博斯普鲁斯海峡游船', '送机'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 1580000,
    included: ['全程内段交通', '9晚住宿', '景点门票', '导游', '27餐'],
    excluded: ['国际机票', '签证费', '个人消费'],
    tips: ['需提前办理中亚和土耳其签证', '女性参观清真寺需戴头巾', '携带舒适步行鞋'],
    season: '春秋两季(4-6月/9-10月)',
    groupSize: '4-10人',
    religionSlug: 'islam',
    siteLinks: [
      { siteName: '蓝色清真寺', day: 9, order: 1, duration: '2小时', note: '伊斯坦布尔标志' },
    ],
  },
  // ═══ 7. 跨文化：耶路撒冷三教共存 ═══
  {
    slug: 'jerusalem-three-faiths',
    title: '耶路撒冷三教共存之旅',
    titleEn: 'Jerusalem Three Faiths Coexistence',
    subtitle: '一座城市，三大文明，千年对话',
    category: RouteCategory.CROSS_CULTURAL,
    difficulty: RouteDifficulty.EASY,
    duration: 4, nights: 3,
    highlights: ['三教圣地', '文化对话', '美食融合', '历史纵深'],
    description: '在耶路撒冷这座独特的城市中，同时体验犹太教、基督教、伊斯兰教的圣地与文化。理解三大文明如何在同一空间中共存千年，感受人类信仰的多样性与统一性。',
    itinerary: [
      { day: 1, title: '抵达·犹太教日', activities: ['哭墙祈祷', '犹太区漫步', '大卫城地下隧道'], meals: ['晚餐：犹太安息日晚餐体验'], accommodation: '耶路撒冷' },
      { day: 2, title: '基督教日', activities: ['苦路十四站', '圣墓教堂', '橄榄山', '客西马尼园'], meals: ['全餐'], accommodation: '耶路撒冷' },
      { day: 3, title: '伊斯兰教日', activities: ['圣殿山(远观)', '阿克萨清真寺区域', '穆斯林区', '以色列博物馆'], meals: ['全餐'], accommodation: '耶路撒冷' },
      { day: 4, title: '融合与反思·返程', activities: ['锡安山(三教交汇)', '雅法门集市', '送机'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 680000,
    included: ['全程交通', '3晚住宿', '景点门票', '三教专业导游', '8餐'],
    excluded: ['国际机票', '签证费', '个人消费'],
    tips: ['尊重每个宗教的习俗和禁忌', '安息日(周五日落-周六日落)部分设施关闭', '保持开放包容的心态'],
    season: '全年适宜，春秋最佳',
    groupSize: '4-12人',
    religionSlug: null,
    siteLinks: [
      { siteName: '耶路撒冷哭墙', day: 1, order: 1, duration: '2小时', note: '犹太教最神圣之地' },
      { siteName: '耶路撒冷圣墓教堂', day: 2, order: 1, duration: '2小时', note: '基督教最神圣之地' },
      { siteName: '圆顶清真寺', day: 3, order: 1, duration: '1小时', note: '伊斯兰教圣地' },
    ],
  },
  // ═══ 8. 跨文化：日本神佛习合 ═══
  {
    slug: 'japan-shinbutsu',
    title: '日本神佛习合之旅',
    titleEn: 'Japan Shinbutsu Shūgō',
    subtitle: '神道与佛教交融的千年美学',
    category: RouteCategory.CROSS_CULTURAL,
    difficulty: RouteDifficulty.EASY,
    duration: 6, nights: 5,
    highlights: ['京都古寺', '奈良大佛', '高野山宿坊', '伊势神宫'],
    description: '深度体验日本独特的"神佛习合"文化——神道教与佛教千年共存的智慧。从京都的金阁寺到高野山的宿坊住宿，从奈良大佛到伊势神宫，领略东方美学的极致。',
    itinerary: [
      { day: 1, title: '大阪→京都', activities: ['金阁寺', '龙安寺枯山水', '祇园漫步'], meals: ['晚餐：京都怀石料理'], accommodation: '京都' },
      { day: 2, title: '京都全日', activities: ['清水寺', '伏见稻荷大社', '东福寺禅修体验'], meals: ['午餐：汤豆腐'], accommodation: '京都' },
      { day: 3, title: '京都→奈良', activities: ['东大寺(大佛)', '春日大社', '奈良公园鹿群'], meals: ['全餐'], accommodation: '奈良' },
      { day: 4, title: '奈良→高野山', activities: ['金刚峰寺', '奥之院夜间参拜', '宿坊住宿'], meals: ['晚餐：精进料理'], accommodation: '高野山宿坊' },
      { day: 5, title: '高野山→伊势', activities: ['高野山晨课', '伊势神宫外宫+内宫', '托福横丁'], meals: ['午餐：伊势乌冬'], accommodation: '伊势/名古屋' },
      { day: 6, title: '返程', activities: ['热田神宫(名古屋)', '送站'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 998000,
    included: ['全程JR Pass', '5晚住宿(含1晚宿坊)', '导游', '景点门票'],
    excluded: ['国际机票', '个人消费', '部分餐食'],
    tips: ['高野山宿坊需提前1个月预约', '寺院内需脱鞋', '奈良鹿会抢食物注意安全'],
    season: '春(樱花3-4月)或秋(红叶11月)',
    groupSize: '2-8人',
    religionSlug: null,
    siteLinks: [
      { siteName: '伊势神宫', day: 5, order: 1, duration: '半天', note: '神道教最高圣地' },
      { siteName: '法隆寺', day: 3, order: 1, duration: '2小时', note: '世界最古老木构建筑' },
    ],
  },
  // ═══ 9. 印度教：恒河圣城 ═══
  {
    slug: 'ganges-holy-cities',
    title: '恒河圣城文化之旅',
    titleEn: 'Ganges Holy Cities Cultural Journey',
    subtitle: '沿恒河探访印度教圣城与文明',
    category: RouteCategory.HINDU,
    difficulty: RouteDifficulty.MODERATE,
    duration: 7, nights: 6,
    highlights: ['恒河日出', '瓦拉纳西夜祭', '泰姬陵', '瑜伽体验'],
    description: '从德里出发，经阿格拉泰姬陵，沿恒河到达印度教圣城瓦拉纳西。体验恒河晨浴的震撼，观赏千年不断的恒河夜祭，在瑞诗凯诗练习瑜伽，感受印度文明的深邃与活力。',
    itinerary: [
      { day: 1, title: '抵达德里', activities: ['印度门', '胡马雍陵', '月光集市'], meals: ['晚餐'], accommodation: '德里' },
      { day: 2, title: '德里→阿格拉', activities: ['泰姬陵', '阿格拉堡', '法塔赫普尔西克里'], meals: ['全餐'], accommodation: '阿格拉' },
      { day: 3, title: '阿格拉→瓦拉纳西', activities: ['飞往瓦拉纳西', '恒河泛舟', '恒河夜祭'], meals: ['全餐'], accommodation: '瓦拉纳西' },
      { day: 4, title: '瓦拉纳西全日', activities: ['恒河日出', '老城徒步', '丝绸工坊', '印度音乐表演'], meals: ['全餐'], accommodation: '瓦拉纳西' },
      { day: 5, title: '瓦拉纳西→瑞诗凯诗', activities: ['飞往德里转瑞诗凯诗', '拉姆朱拉桥', '恒河漂流'], meals: ['全餐'], accommodation: '瑞诗凯诗' },
      { day: 6, title: '瑞诗凯诗', activities: ['瑜伽晨练', '甲壳虫乐队ashram', '恒河边冥想'], meals: ['全餐'], accommodation: '瑞诗凯诗' },
      { day: 7, title: '返回德里·返程', activities: ['驱车返回德里', '送机'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 898000,
    included: ['全程交通+内段机票', '6晚住宿', '景点门票', '中文导游', '18餐', '瑜伽课'],
    excluded: ['国际机票', '签证费', '个人消费'],
    tips: ['印度饮食辛辣，可提前准备肠胃药', '恒河水不建议入口', '注意个人物品安全'],
    season: '10月-3月(凉季)',
    groupSize: '4-10人',
    religionSlug: 'hinduism',
    siteLinks: [],
  },
  // ═══ 10. 跨文化：中华三教合一 ═══
  {
    slug: 'china-three-teachings',
    title: '中华三教合一之旅',
    titleEn: 'China Three Teachings Unity',
    subtitle: '嵩山佛·武当道·曲阜儒，领悟中华智慧',
    category: RouteCategory.CROSS_CULTURAL,
    difficulty: RouteDifficulty.MODERATE,
    duration: 5, nights: 4,
    highlights: ['少林功夫', '武当太极', '孔子故里', '中华文明'],
    description: '一次旅程，三种智慧。从嵩山少林寺的佛教禅宗，到武当山的道教太极，再到曲阜的儒教圣地，完整体验中华三教合一的独特文化。学武术、练太极、拜孔庙，感受中华文明的博大精深。',
    itinerary: [
      { day: 1, title: '郑州→嵩山(佛)', activities: ['少林寺', '武术表演', '塔林', '达摩面壁洞'], meals: ['午餐：少林素斋'], accommodation: '登封' },
      { day: 2, title: '嵩山→武汉→武当山(道)', activities: ['高铁至武汉转武当', '武当山紫霄宫'], meals: ['全餐'], accommodation: '武当山' },
      { day: 3, title: '武当山全日', activities: ['金顶日出', '太极拳晨练', '南岩宫', '太极湖'], meals: ['午餐：武当道膳'], accommodation: '武当山' },
      { day: 4, title: '武当→曲阜(儒)', activities: ['飞往济南转曲阜', '孔庙', '孔府', '孔林'], meals: ['午餐：孔府宴'], accommodation: '曲阜' },
      { day: 5, title: '曲阜·返程', activities: ['六艺城', '颜庙', '尼山圣境', '送站'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 498000,
    included: ['内段交通(高铁+机票)', '4晚住宿', '景点门票', '导游', '太极课', '8餐'],
    excluded: ['往返大交通', '个人消费'],
    tips: ['武当山海拔较高注意保暖', '曲阜孔庙内禁止大声喧哗', '建议提前了解三教基本知识'],
    season: '春秋两季(4-5月/9-10月)',
    groupSize: '2-10人',
    religionSlug: null,
    siteLinks: [
      { siteName: '武当山', day: 2, order: 1, duration: '2天', note: '道教第一名山' },
      { siteName: '曲阜孔庙', day: 4, order: 1, duration: '半天', note: '儒教圣地' },
    ],
  },
];

// ══════════════════════════════════════════════════════
//  Main seed function
// ══════════════════════════════════════════════════════

async function main() {
  console.log('Seeding database...');

  // ── 1. Upsert Religions ──
  console.log('Creating 12 religions...');
  const religionMap: Record<string, string> = {};

  for (const r of religions) {
    const record = await prisma.religion.upsert({
      where: { slug: r.slug },
      update: {
        name: r.name,
        nameEn: r.nameEn,
        symbol: r.symbol,
        color: r.color,
      },
      create: {
        name: r.name,
        nameEn: r.nameEn,
        slug: r.slug,
        symbol: r.symbol,
        color: r.color,
      },
    });
    religionMap[r.slug] = record.id;
  }
  console.log(`  ✓ ${Object.keys(religionMap).length} religions upserted`);

  // ── 2. Holy Sites ──
  console.log('Creating 60 holy sites...');
  // Must delete route dependencies first (FK constraint)
  await prisma.routeSite.deleteMany();
  await prisma.routeBooking.deleteMany();
  await prisma.route.deleteMany();
  await prisma.holySite.deleteMany();
  for (const site of holySites) {
    await prisma.holySite.create({
      data: {
        name: site.name,
        nameEn: site.nameEn,
        country: site.country,
        latitude: site.latitude,
        longitude: site.longitude,
        utcOffset: site.utcOffset,
        description: site.description,
        soundEffect: site.soundEffect,
        religionId: religionMap[site.religionSlug],
      },
    });
  }
  console.log(`  ✓ ${holySites.length} holy sites created`);

  // ── 3. Ancestral Temples ──
  console.log('Creating 36 ancestral temples...');
  await prisma.temple.deleteMany();
  for (const t of temples) {
    await prisma.temple.create({
      data: {
        name: t.name,
        nameEn: t.nameEn,
        country: t.country,
        foundingDate: t.foundingDate,
        description: t.description,
        latitude: t.latitude,
        longitude: t.longitude,
        religionId: religionMap[t.religionSlug],
      },
    });
  }
  console.log(`  ✓ ${temples.length} temples created`);

  // ── 4. Patriarchs ──
  console.log('Creating patriarchs...');
  await prisma.patriarch.deleteMany();
  for (const p of patriarchs) {
    await prisma.patriarch.create({
      data: {
        name: p.name,
        nameEn: p.nameEn,
        dates: p.dates,
        title: p.title,
        biography: p.biography,
        coreTeaching: p.coreTeaching,
        religionId: religionMap[p.religionSlug],
      },
    });
  }
  console.log(`  ✓ ${patriarchs.length} patriarchs created`);

  // ── 5. Teachings ──
  console.log('Creating teachings...');
  await prisma.teaching.deleteMany();
  for (const t of teachings) {
    await prisma.teaching.create({
      data: {
        name: t.name,
        originalText: t.originalText,
        sourceText: t.sourceText,
        translationCn: t.translationCn,
        religionId: religionMap[t.religionSlug],
      },
    });
  }
  console.log(`  ✓ ${teachings.length} teachings created`);

  // ── 6. Seals (曹溪愿命三十印) ──
  console.log('Creating 30 seals...');
  await prisma.seal.deleteMany();
  for (const s of seals) {
    await prisma.seal.create({
      data: {
        id: s.id,
        name: s.name,
        series: SERIES_MAP[s.series],
        poem: s.poem,
        essence: s.essence,
        practice: s.practice,
        vow: s.vow,
        color: SERIES_COLORS[s.series],
      },
    });
  }
  console.log(`  ✓ ${seals.length} seals created`);

  // ── 7. Routes (路线产品) ──
  console.log('Creating routes...');
  await prisma.routeSite.deleteMany();
  await prisma.routeBooking.deleteMany();
  await prisma.route.deleteMany();

  // Build holy site name → id map for linking
  const allSites = await prisma.holySite.findMany({ select: { id: true, name: true } });
  const siteNameMap: Record<string, string> = {};
  for (const s of allSites) {
    siteNameMap[s.name] = s.id;
  }

  for (const r of routes) {
    const route = await prisma.route.create({
      data: {
        slug: r.slug,
        title: r.title,
        titleEn: r.titleEn,
        subtitle: r.subtitle,
        category: r.category,
        difficulty: r.difficulty,
        duration: r.duration,
        nights: r.nights,
        highlights: r.highlights,
        description: r.description,
        itinerary: r.itinerary,
        priceFrom: r.priceFrom,
        included: r.included,
        excluded: r.excluded,
        tips: r.tips,
        season: r.season,
        groupSize: r.groupSize,
        status: RouteStatus.PUBLISHED,
        religionId: r.religionSlug ? religionMap[r.religionSlug] : null,
      },
    });

    // Link route to holy sites
    for (const link of r.siteLinks) {
      const siteId = siteNameMap[link.siteName];
      if (siteId) {
        await prisma.routeSite.create({
          data: {
            routeId: route.id,
            siteId,
            day: link.day,
            order: link.order,
            duration: link.duration,
            note: link.note,
          },
        });
      } else {
        console.warn(`    ⚠ Site not found: ${link.siteName}`);
      }
    }
  }
  console.log(`  ✓ ${routes.length} routes created`);

  // ── 8. AI Config (小鸿配置) ──
  console.log('Creating AI config...');
  await prisma.aiConfig.deleteMany();
  const aiConfigs = [
    {
      key: 'system_prompt',
      label: '系统人设',
      category: 'prompt',
      description: '小鸿AI助手的核心人设提示词，决定AI的身份、风格和行为准则',
      value: `你是「小鸿」，全球祖庭旅行平台的AI旅行规划师。

## 身份
- 名字：小鸿（XiaoHong）
- 角色：AI旅行规划师 + 文化旅行顾问
- 性格：热情、专业、有见识、善于推荐
- 定位："走祖庭，看世界" — 你是全球首个以祖庭和文化圣地为IP的深度路线旅行平台的智能助手

## 核心能力
1. **路线推荐**：根据用户偏好(文化类型/天数/预算/难度)推荐平台路线产品
2. **行程规划**：帮用户定制个性化文化旅行行程
3. **目的地攻略**：提供圣地和祖庭的实用旅行信息(交通/门票/美食/住宿/最佳季节)
4. **文化讲解**：用通俗有趣的方式介绍宗教文化背景知识

## 知识范围
平台路线覆盖6大文化类型：禅宗路线、佛教圣地、道教寻根、基督教文化、伊斯兰文化、跨文化融合。
收录60+文化圣地、27座祖庭、12大文化传统、10+深度路线产品。

## 行为准则
1. **旅行优先**：首要身份是旅行规划师，不是宗教顾问
2. 推荐路线时必须引用平台的路线产品数据(名称/天数/价格/亮点)
3. 回答包含实用旅行信息(交通/门票/天气/美食)
4. 弱化宗教说教，强化文化叙事和旅行体验
5. 引导用户预订路线或探索更多目的地
6. 对所有文化传统一视同仁，不评判优劣
7. 不涉及政治敏感话题

## 回答风格
- 热情、专业、有趣，像一个有见识的旅行达人
- 推荐路线时给出关键信息：天数、价格、亮点、最佳季节
- 回答包含行动引导(如"要看详细行程吗？""帮你规划一条路线？")
- 适当引用文化典故增加趣味性
- 回答控制在300-800字，简洁实用
- 使用中文回答，如用户使用英文则用英文回答`,
    },
    {
      key: 'safety_prompt',
      label: '安全约束',
      category: 'safety',
      description: '附加在系统提示词后的安全边界约束',
      value: `## 安全边界
- 不讨论政治、战争、恐怖主义等敏感话题
- 不对任何宗教或文化传统做出价值判断或比较优劣
- 不提供医疗、法律、财务建议
- 遇到不当请求时，温和地引导回文化旅行话题
- 不编造不存在的路线、圣地或历史事件
- 路线推荐必须基于平台实际收录的产品数据`,
    },
    {
      key: 'welcome_message',
      label: '欢迎语',
      category: 'prompt',
      description: '用户首次进入聊天时显示的欢迎消息',
      value: '你好！我是小鸿，你的AI旅行规划师。我可以帮你推荐文化路线、规划行程、查询目的地攻略，或者聊聊各地文化故事。想去哪里探索？',
    },
    {
      key: 'model',
      label: '模型选择',
      category: 'model',
      description: 'vLLM使用的模型路径（OpenAI兼容格式）',
      value: '/root/autodl-tmp/models/qwen3.5-35b-a3b-fp8',
    },
    {
      key: 'max_tokens',
      label: '最大输出Token',
      category: 'model',
      description: '每次回复的最大token数量',
      value: '2048',
    },
    {
      key: 'temperature',
      label: '温度',
      category: 'model',
      description: '控制回答的创造性，0=确定性，1=创造性',
      value: '0.7',
    },
    {
      key: 'context_window',
      label: '上下文轮数',
      category: 'model',
      description: '发送给AI的历史对话轮数（越多上下文越丰富，但消耗更多token）',
      value: '10',
    },
    {
      key: 'enable_rag',
      label: '启用RAG检索',
      category: 'general',
      description: '是否根据用户问题自动检索数据库中的相关数据作为上下文',
      value: 'true',
    },
    {
      key: 'enable_history',
      label: '启用对话历史',
      category: 'general',
      description: '是否保存和使用多轮对话历史',
      value: 'true',
    },
    {
      key: 'max_daily_messages',
      label: '每日消息限额',
      category: 'safety',
      description: '每个用户每天最多可发送的消息数量（0=无限制）',
      value: '100',
    },
    {
      key: 'suggestions',
      label: '推荐问题',
      category: 'prompt',
      description: '聊天界面显示的快捷推荐问题（JSON数组）',
      value: JSON.stringify([
        { text: '推荐一条禅宗文化路线', category: '路线推荐' },
        { text: '5天以内有什么好路线？', category: '路线推荐' },
        { text: '南华寺什么季节去最好？', category: '目的地攻略' },
        { text: '耶路撒冷有什么值得去的？', category: '目的地攻略' },
        { text: '帮我规划一个道教文化之旅', category: '行程规划' },
        { text: '丝绸之路上有哪些文化圣地？', category: '文化探索' },
        { text: '日本有什么寺庙值得去？', category: '目的地攻略' },
        { text: '预算5000以内有什么路线？', category: '路线推荐' },
      ]),
    },
  ];
  for (const cfg of aiConfigs) {
    await prisma.aiConfig.create({ data: cfg });
  }
  console.log(`  ✓ ${aiConfigs.length} AI configs created`);

  console.log('\nSeed complete!');
  console.log(`  Religions: ${religions.length}`);
  console.log(`  Holy Sites: ${holySites.length}`);
  console.log(`  Temples: ${temples.length}`);
  console.log(`  Patriarchs: ${patriarchs.length}`);
  console.log(`  Teachings: ${teachings.length}`);
  console.log(`  Seals: ${seals.length}`);
  console.log(`  Routes: ${routes.length}`);
  console.log(`  AI Configs: ${aiConfigs.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
