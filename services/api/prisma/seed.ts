import { PrismaClient, SealSeries, RouteCategory, RouteDifficulty, RouteStatus } from '@prisma/client';
import { HOLY_SITE_IMAGES, TEMPLE_IMAGES, PATRIARCH_IMAGES, ROUTE_IMAGES } from './seed-images';

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
        imageUrl: HOLY_SITE_IMAGES[site.name] || null,
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
        imageUrl: TEMPLE_IMAGES[t.name] || null,
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
        imageUrl: PATRIARCH_IMAGES[p.name] || null,
        religionId: religionMap[p.religionSlug],
      },
    });
  }
  console.log(`  ✓ ${patriarchs.length} patriarchs created`);

  // ── 4b. 曹洞宗传承法脉 (Caodong Zen Lineage) ──
  console.log('Creating Caodong Zen patriarchs...');
  const buddhismId = religionMap['buddhism'];

  // === Gen 1: 洞山良价 ===
  const dongshan = await prisma.patriarch.create({
    data: {
      name: '洞山良价',
      nameEn: 'Dongshan Liangjie',
      religionId: buddhismId,
      dates: '807-869',
      title: '悟本禅师',
      school: '曹洞宗',
      generation: 1,
      teacherId: null,
      biography: '洞山良价，唐代高僧，会稽（今浙江绍兴）人，俗姓兪。幼年出家，初从五泄山灵默参学，后参南泉普愿、沩山灵祐，终于云岩昙晟处得法。因过溪涉水见影而大悟，作著名的"过水偈"。后住江西宜丰洞山，大弘禅法，创立曹洞宗。其五位君臣法门，以正偏互涉五位阐释真俗不二之理，为曹洞宗核心教义。咸通十年（869）示寂，敕谥"悟本禅师"，塔名"慧觉之塔"。',
      coreTeaching: '正偏互涉，五位叠起。以正位（空、理、体）与偏位（色、事、用）五种关系阐释万法实相。',
      achievements: '创立曹洞宗，为禅宗五家之一。创建五位君臣法门，以正偏五位阐释体用关系。门下弟子五百至千人。其法脉传至日本为曹洞宗（道元开创），影响深远。',
      templeNames: [{ name: '洞山普利禅寺', nameEn: 'Dongshan Puli Temple', role: '创建', location: '江西宜丰' }],
      koans: [
        { title: '过水偈', content: '切忌从他觅，迢迢与我疏。我今独自往，处处得逢渠。渠今正是我，我今不是渠。应须恁么会，方得契如如。', source: '洞山语录' },
        { title: '麻三斤', content: '僧问：如何是佛？师曰：麻三斤。', source: '五灯会元' },
      ],
      classicQuotes: ['切忌从他觅，迢迢与我疏', '渠今正是我，我今不是渠', '应须恁么会，方得契如如'],
      works: [
        { title: '宝镜三昧', description: '376字偈颂，阐明理事不二' },
        { title: '五位君臣', description: '五位法门，曹洞宗核心教义' },
        { title: '洞山语录', description: '禅师说法问答集录' },
      ],
      imageUrl: null,
    },
  });

  // === Gen 2: 曹山本寂 ===
  const caoshan = await prisma.patriarch.create({
    data: {
      name: '曹山本寂',
      nameEn: 'Caoshan Benji',
      religionId: buddhismId,
      dates: '840-901',
      title: '元证禅师',
      school: '曹洞宗',
      generation: 2,
      teacherId: dongshan.id,
      biography: '曹山本寂，泉州（今福建）人，俗姓黄。十九岁入灵石寺，二十五岁受具足戒。后参洞山良价，被赞为"大器之法器"。离洞山后，住江西抚州曹山（禾山），号曹山，命名以敬六祖慧能之曹溪。住山三十一年，大阐曹洞宗旨。天复元年（901）示寂，世寿六十二，敕谥"元证禅师"，塔名"福圆塔"。',
      coreTeaching: '五位君臣，君为体，臣为用，以主客、宾主、偏正互涉阐释悟道层次。',
      achievements: '曹洞宗联合创始人。将洞山五位法门系统化为五位君臣学说，以君臣比喻真俗关系。"曹洞"之"曹"即取自曹山。然其法脉数代后失传，曹洞宗存续法脉实由云居道膺一系传下。',
      templeNames: [{ name: '曹山宝积寺', nameEn: 'Caoshan Baoji Temple', role: '创建', location: '江西宜黄' }],
      koans: [{ title: '如何是佛', content: '僧问：如何是佛？师曰：你面前便是。', source: '曹山语录' }],
      classicQuotes: ['君（正位）为体，臣（偏位）为用，君臣道合方为究竟', '学者先须知有佛向上事，然后放下便是'],
      works: [
        { title: '曹山语录', description: '禅师说法集录' },
        { title: '五位君臣颂', description: '阐释五位法门诗偈' },
      ],
      imageUrl: null,
    },
  });

  // === Gen 2: 云居道膺 ===
  const yunju = await prisma.patriarch.create({
    data: {
      name: '云居道膺',
      nameEn: 'Yunju Daoying',
      religionId: buddhismId,
      dates: '835-902',
      title: '弘觉禅师',
      school: '曹洞宗',
      generation: 2,
      teacherId: dongshan.id,
      biography: '云居道膺，幽州范阳（今河北涿县）人。二十五岁于延寿寺受戒，精通律学，后转参禅宗。至洞山良价处得法。后于江西永修云居山建真如禅寺，住山弘法三十年，门下聚僧一千五百众。天复二年（902）示寂，建塔于博鱼山。其法脉为曹洞宗唯一存续正统。',
      coreTeaching: '如如不动，在用不迷。继承洞山正偏五位，以默照功夫为修行法要。',
      achievements: '洞山良价弟子，于云居山建真如禅寺，住山三十年，门徒一千五百人。曹洞宗存续法脉皆从道膺一系传下，为曹洞宗传承关键人物。',
      templeNames: [{ name: '云居山真如禅寺', nameEn: 'Yunju Zhenru Temple', role: '创建', location: '江西永修' }],
      koans: [{ title: '如如之事', content: '师示众曰：如如之事，已是变也。', source: '传灯录' }],
      classicQuotes: ['如如之事，已是变也', '但办肯心，必不相赚'],
      works: [{ title: '云居道膺语录', description: '禅师问答集录' }],
      imageUrl: null,
    },
  });

  // === Gen 3: 同安道丕 ===
  const tonganDaopi = await prisma.patriarch.create({
    data: {
      name: '同安道丕',
      nameEn: 'Tongan Daopi',
      religionId: buddhismId,
      dates: '约10世纪',
      title: '道丕禅师',
      school: '曹洞宗',
      generation: 3,
      teacherId: yunju.id,
      biography: '同安道丕，五代时期禅僧，云居道膺法嗣。住江西南昌凤栖山同安院弘法，承继曹洞宗旨，为曹洞宗第三世传人，法脉传同安观志。',
      coreTeaching: '承继洞山正偏五位，默照绵密，不立文字。',
      achievements: '曹洞宗第三世，继承云居道膺法脉，住同安院弘法。',
      templeNames: [{ name: '同安院', nameEn: 'Tongan Monastery', role: '驻锡', location: '江西南昌凤栖山' }],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 4: 同安观志 ===
  const tonganGuanzhi = await prisma.patriarch.create({
    data: {
      name: '同安观志',
      nameEn: 'Tongan Guanzhi',
      religionId: buddhismId,
      dates: '约10世纪',
      title: '观志禅师',
      school: '曹洞宗',
      generation: 4,
      teacherId: tonganDaopi.id,
      biography: '同安观志，五代时期禅僧，同安道丕法嗣。继住同安院，为曹洞宗第四世传人，法脉传梁山缘观。',
      coreTeaching: '承继曹洞宗默照家风，绵密用功。',
      achievements: '曹洞宗第四世，同安道丕法嗣，传法于梁山缘观。',
      templeNames: [],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 5: 梁山缘观 ===
  const liangshan = await prisma.patriarch.create({
    data: {
      name: '梁山缘观',
      nameEn: 'Liangshan Yuanguan',
      religionId: buddhismId,
      dates: '约10世纪',
      title: '缘观禅师',
      school: '曹洞宗',
      generation: 5,
      teacherId: tonganGuanzhi.id,
      biography: '梁山缘观，五代至北宋初期禅僧，同安观志法嗣。住梁山弘法，为曹洞宗第五世传人，法脉传大阳警玄。',
      coreTeaching: '承继曹洞宗旨，正偏兼带，默照双运。',
      achievements: '曹洞宗第五世，同安观志法嗣，传法于大阳警玄。',
      templeNames: [],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 6: 大阳警玄 ===
  const dayang = await prisma.patriarch.create({
    data: {
      name: '大阳警玄',
      nameEn: 'Dayang Jingxuan',
      religionId: buddhismId,
      dates: '943-1027',
      title: '警玄禅师',
      school: '曹洞宗',
      generation: 6,
      teacherId: liangshan.id,
      biography: '大阳警玄，北宋高僧。参梁山缘观得法，住大阳山弘曹洞宗旨。至晚年门下无堪受法者，恐曹洞法脉断绝，遂将皮履、直裰、法语托付临济宗浮山法远，嘱其代觅法器传授。景德四年（1007）《传灯录》收录其事迹。天圣五年（1027）示寂。',
      coreTeaching: '守护法脉，宁托他宗亦不令正法断绝。',
      achievements: '曹洞宗第六世，为当时最后一位曹洞宗在世传人。晚年无直系法嗣，将法衣、顶相、偈颂托付临济宗浮山法远代传，开禅宗史上跨宗派传法之先例。',
      templeNames: [{ name: '大阳山', nameEn: 'Dayang Mountain', role: '驻锡', location: '湖北应城' }],
      koans: [{ title: '嘱法浮山', content: '警玄晚年无嗣，将法脉托付临济宗浮山法远代传，创禅宗史上跨宗派代传先例。', source: '禅林僧宝传' }],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 7: 投子义青 ===
  const touzi = await prisma.patriarch.create({
    data: {
      name: '投子义青',
      nameEn: 'Touzi Yiqing',
      religionId: buddhismId,
      dates: '1032-1083',
      title: '义青禅师',
      school: '曹洞宗',
      generation: 7,
      teacherId: dayang.id,
      biography: '投子义青，河南偃师人，俗姓李。七岁出家于妙相寺，习唯识、华严。后参浮山法远，法远出大阳警玄所托法衣、顶相示之，义青当下大悟，接续曹洞法脉。住安徽投子山禅院弘法。元丰六年（1083）示寂。',
      coreTeaching: '接续正法，不论来源。体用一如，默照观心。',
      achievements: '曹洞宗第七世，从临济宗浮山法远处接受大阳警玄所托曹洞法脉，使几近断绝的曹洞宗重新延续。七岁出家，先学唯识、华严，后转参禅。',
      templeNames: [{ name: '投子山禅院', nameEn: 'Touzi Chan Monastery', role: '驻锡', location: '安徽桐城' }],
      koans: [{ title: '投子悟道', content: '法远出大阳法衣示之，义青当下大悟，接续曹洞法脉。', source: '续传灯录' }],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 8: 芙蓉道楷 ===
  const furong = await prisma.patriarch.create({
    data: {
      name: '芙蓉道楷',
      nameEn: 'Furong Daokai',
      religionId: buddhismId,
      dates: '1043-1118',
      title: '道楷禅师',
      school: '曹洞宗',
      generation: 8,
      teacherId: touzi.id,
      biography: '芙蓉道楷，山东沂州（今临沂）人。初习道教长生术，后转入佛门。参投子义青得法。住芙蓉湖华严禅院弘法，门下极盛。度僧九十三人，开默照禅之先河。政和八年（1118）示寂。',
      coreTeaching: '默照禅——默默忘言，昭昭现前。静坐观照，不立文字。',
      achievements: '曹洞宗第八世，成功使曹洞宗从近于断绝恢复至显赫。度僧九十三人。开创默照禅修行体系。早年曾修道教长生术，后转入禅宗。政和七年（1117）受赐御匾。',
      templeNames: [{ name: '芙蓉湖华严禅院', nameEn: 'Furong Huayan Temple', role: '驻锡', location: '山东沂州' }],
      koans: [],
      classicQuotes: ['默默忘言，昭昭现前', '但办肯心，必不相赚'],
      works: [{ title: '芙蓉道楷语录', description: '禅师说法集录' }],
      imageUrl: null,
    },
  });

  // === Gen 9: 丹霞子淳 ===
  const danxia = await prisma.patriarch.create({
    data: {
      name: '丹霞子淳',
      nameEn: 'Danxia Zichun',
      religionId: buddhismId,
      dates: '1064-1117',
      title: '子淳禅师',
      school: '曹洞宗',
      generation: 9,
      teacherId: furong.id,
      biography: '丹霞子淳，北宋禅僧，芙蓉道楷法嗣。住湖北丹霞山弘法，为曹洞宗第九世传人。传法于宏智正觉，对曹洞宗默照禅的系统化有重要推动作用。',
      coreTeaching: '承继默照家风，绵密观照，直下承当。',
      achievements: '曹洞宗第九世，芙蓉道楷法嗣，传法于宏智正觉。',
      templeNames: [{ name: '丹霞山', nameEn: 'Danxia Mountain', role: '驻锡', location: '湖北武汉' }],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 10: 宏智正觉 ===
  const hongzhi = await prisma.patriarch.create({
    data: {
      name: '宏智正觉',
      nameEn: 'Hongzhi Zhengjue',
      religionId: buddhismId,
      dates: '1091-1157',
      title: '宏智禅师',
      school: '曹洞宗',
      generation: 10,
      teacherId: danxia.id,
      biography: '宏智正觉，隰州（今山西隰县）人。参丹霞子淳得法。住浙江天童景德禅寺三十年，聚僧千余。全面系统化默照禅，著《默照铭》为纲领。与临济宗大慧宗杲各倡默照、看话两禅，为禅宗史上著名法门之争。绍兴二十七年（1157）示寂。',
      coreTeaching: '默照禅——默坐观照，不用公案话头，直下承当，本来面目自然现前。',
      achievements: '曹洞宗第十世，全面系统化默照禅修行法门。住天童寺三十年，门下千余僧。与临济宗大慧宗杲的看话禅之争，确立了禅宗两大修行路线。',
      templeNames: [{ name: '天童景德禅寺', nameEn: 'Tiantong Jingde Temple', role: '住持三十年', location: '浙江宁波' }],
      koans: [{ title: '默照铭', content: '默默忘言，昭昭现前。鉴时廓尔，体处灵然。', source: '宏智禅师广录' }],
      classicQuotes: ['默默忘言，昭昭现前', '鉴时廓尔，体处灵然', '水清彻底兮，鱼行迟迟；空阔莫涯兮，鸟飞杳杳'],
      works: [
        { title: '宏智禅师广录', description: '九卷，宋代刊行' },
        { title: '默照铭', description: '默照禅纲领性文献' },
      ],
      imageUrl: null,
    },
  });

  // === Gen 10 (mainline): 长芦真歇清了 ===
  const zhenxie = await prisma.patriarch.create({
    data: {
      name: '长芦真歇清了',
      nameEn: 'Changlu Zhenxie Qingliao',
      religionId: buddhismId,
      dates: '1089-1151',
      title: '真歇禅师',
      school: '曹洞宗',
      generation: 10,
      teacherId: danxia.id,
      biography: '长芦真歇清了，左绵（今四川绵阳）人，俗姓雍。十一岁出家，遍参诸方，至丹霞子淳处得法。住持长芦崇福寺、育王山广利寺等名刹。与宏智正觉同出丹霞门下，为曹洞宗主脉传承人。绍兴二十一年（1151）示寂。',
      coreTeaching: '默然无言中见本来面目，继承曹洞默照家风。',
      achievements: '曹洞宗第十世（主脉），丹霞子淳法嗣。与宏智正觉同门，住持长芦崇福寺。法脉传天童宗珏，为曹洞宗存续至今的主要传承线。',
      templeNames: [{ name: '长芦崇福寺', nameEn: 'Changlu Chongfu Temple', role: '住持', location: '江苏南京' }],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 11: 天童宗珏 ===
  const zongjue = await prisma.patriarch.create({
    data: {
      name: '天童宗珏',
      nameEn: 'Tiantong Zongjue',
      religionId: buddhismId,
      dates: '约12世纪',
      title: '宗珏禅师',
      school: '曹洞宗',
      generation: 11,
      teacherId: zhenxie.id,
      biography: '天童宗珏，南宋禅僧，真歇清了法嗣。住天童山弘法，为曹洞宗第十一世传人。法脉传雪窦智鉴。',
      coreTeaching: '承继曹洞默照家风，绵密用功。',
      achievements: '曹洞宗第十一世，真歇清了法嗣，传法于雪窦智鉴。',
      templeNames: [{ name: '天童景德禅寺', nameEn: 'Tiantong Jingde Temple', role: '住持', location: '浙江宁波' }],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 12: 雪窦智鉴 ===
  const zhijian = await prisma.patriarch.create({
    data: {
      name: '雪窦智鉴',
      nameEn: 'Xuedou Zhijian',
      religionId: buddhismId,
      dates: '约12世纪',
      title: '智鉴禅师',
      school: '曹洞宗',
      generation: 12,
      teacherId: zongjue.id,
      biography: '雪窦智鉴，南宋禅僧，天童宗珏法嗣。住雪窦山弘法，为曹洞宗第十二世传人。法脉传天童如净。',
      coreTeaching: '承继曹洞宗旨，默照观心。',
      achievements: '曹洞宗第十二世，天童宗珏法嗣，传法于天童如净。',
      templeNames: [{ name: '雪窦山资圣禅寺', nameEn: 'Xuedou Zisheng Temple', role: '住持', location: '浙江奉化' }],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 13: 天童如净 ===
  const rujing = await prisma.patriarch.create({
    data: {
      name: '天童如净',
      nameEn: 'Tiantong Rujing',
      religionId: buddhismId,
      dates: '1163-1228',
      title: '如净禅师',
      school: '曹洞宗',
      generation: 13,
      teacherId: zhijian.id,
      biography: '天童如净，南宋僧。嘉定十七年（1224）受请住持天童景德禅寺。为人清俭，不自高于众僧，著常服黑袍。宝庆三年（1227）传法于日本僧道元（1200-1253），道元归国后创立日本曹洞宗，影响至今。绍定元年（1228）示寂。',
      coreTeaching: '只管打坐，身心脱落。不假外缘，直下承当。',
      achievements: '曹洞宗重要传人。嘉定十七年（1224）住持天童寺。宝庆三年（1227）传法于日本僧道元，道元归国创立日本曹洞宗（Soto Zen），为日本最大佛教宗派之一。为人谦逊，拒受紫衣。',
      templeNames: [{ name: '天童景德禅寺', nameEn: 'Tiantong Jingde Temple', role: '住持', location: '浙江宁波' }],
      koans: [{ title: '只管打坐', content: '参禅只须打坐，坐禅乃是身心脱落。不用烧香、礼拜、念佛、修忏、看经。', source: '如净语录' }],
      classicQuotes: ['坐禅乃是身心脱落', '参禅不用烧香礼拜念佛修忏看经，只须打坐'],
      works: [{ title: '如净语录', description: '禅师说法记录' }],
      imageUrl: null,
    },
  });

  // === Gen 14: 鹿门自觉 ===
  const lumenZijue = await prisma.patriarch.create({
    data: {
      name: '鹿门自觉',
      nameEn: 'Lumen Zijue',
      religionId: buddhismId,
      dates: '约13世纪',
      title: '自觉禅师',
      school: '曹洞宗',
      generation: 14,
      teacherId: rujing.id,
      biography: '鹿门自觉，南宋禅僧，天童如净法嗣。住鹿门山弘法，为曹洞宗第十四世传人。法脉传青州普照一辩。',
      coreTeaching: '承继如净"只管打坐"之旨，默照观心。',
      achievements: '曹洞宗第十四世，天童如净法嗣，传法于青州普照一辩。',
      templeNames: [],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 15: 青州普照一辩 ===
  const yibian = await prisma.patriarch.create({
    data: {
      name: '青州普照一辩',
      nameEn: 'Qingzhou Puzhao Yibian',
      religionId: buddhismId,
      dates: '约13世纪',
      title: '一辩禅师',
      school: '曹洞宗',
      generation: 15,
      teacherId: lumenZijue.id,
      biography: '青州普照一辩，南宋至元代禅僧，鹿门自觉法嗣。住青州普照寺弘法，为曹洞宗第十五世传人。法脉传大明僧宝。',
      coreTeaching: '默照绵密，承继曹洞宗旨。',
      achievements: '曹洞宗第十五世，鹿门自觉法嗣，传法于大明僧宝。',
      templeNames: [{ name: '普照寺', nameEn: 'Puzhao Temple', role: '驻锡', location: '山东青州' }],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 16: 大明僧宝 ===
  const sengbao = await prisma.patriarch.create({
    data: {
      name: '大明僧宝',
      nameEn: 'Daming Sengbao',
      religionId: buddhismId,
      dates: '约13世纪',
      title: '僧宝禅师',
      school: '曹洞宗',
      generation: 16,
      teacherId: yibian.id,
      biography: '大明僧宝，元代禅僧，青州普照一辩法嗣。住大明寺弘法，为曹洞宗第十六世传人。法脉传玉山师体。',
      coreTeaching: '承继曹洞默照家风。',
      achievements: '曹洞宗第十六世，一辩法嗣，传法于玉山师体。',
      templeNames: [],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 17: 玉山师体 ===
  const shiti = await prisma.patriarch.create({
    data: {
      name: '玉山师体',
      nameEn: 'Yushan Shiti',
      religionId: buddhismId,
      dates: '约13世纪',
      title: '师体禅师',
      school: '曹洞宗',
      generation: 17,
      teacherId: sengbao.id,
      biography: '玉山师体，元代禅僧，大明僧宝法嗣。住玉山弘法，为曹洞宗第十七世传人。法脉传雪岩慧满。',
      coreTeaching: '承继曹洞宗旨，绵密用功。',
      achievements: '曹洞宗第十七世，僧宝法嗣，传法于雪岩慧满。',
      templeNames: [],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 18: 雪岩慧满 ===
  const huiman = await prisma.patriarch.create({
    data: {
      name: '雪岩慧满',
      nameEn: 'Xueyan Huiman',
      religionId: buddhismId,
      dates: '约13世纪',
      title: '慧满禅师',
      school: '曹洞宗',
      generation: 18,
      teacherId: shiti.id,
      biography: '雪岩慧满，元代禅僧，玉山师体法嗣。住雪岩弘法，为曹洞宗第十八世传人。法脉传万松行秀。',
      coreTeaching: '承继曹洞默照家风。',
      achievements: '曹洞宗第十八世，师体法嗣，传法于万松行秀。',
      templeNames: [],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 19: 万松行秀 ===
  const wansong = await prisma.patriarch.create({
    data: {
      name: '万松行秀',
      nameEn: 'Wansong Xingxiu',
      religionId: buddhismId,
      dates: '1166-1246',
      title: '万松老人',
      school: '曹洞宗',
      generation: 19,
      teacherId: huiman.id,
      biography: '万松行秀，金元时期高僧，活跃于开封、北京一带。编著《从容录》（又名《从容庵录》），收录天童宏智正觉所拈百则公案并加评唱，与临济宗圆悟克勤之《碧岩录》齐名，为禅宗两大公案集。淳祐六年（1246）示寂。',
      coreTeaching: '以古人公案启迪学人，从容不迫中见本来面目。',
      achievements: '北方曹洞宗重要传人，金元时期代表人物。编著《从容录》百则公案评唱，为曹洞宗最重要的公案集之一。',
      templeNames: [{ name: '万松寺', nameEn: 'Wansong Temple', role: '驻锡', location: '北京/开封' }],
      koans: [{ title: '从容录', content: '编纂百则公案并加评唱，与《碧岩录》齐名，为曹洞宗最重要公案集。', source: '从容录序' }],
      classicQuotes: [],
      works: [
        { title: '从容录', description: '百则公案评唱，曹洞宗最重要公案集之一，与临济宗《碧岩录》齐名' },
        { title: '万松老人评唱天童觉和尚颂古从容庵录', description: '全名' },
      ],
      imageUrl: null,
    },
  });

  // === Gen 20: 长芦了性 ===
  const liaoxing = await prisma.patriarch.create({
    data: {
      name: '长芦了性',
      nameEn: 'Changlu Liaoxing',
      religionId: buddhismId,
      dates: '约13世纪',
      title: '了性禅师',
      school: '曹洞宗',
      generation: 20,
      teacherId: wansong.id,
      biography: '长芦了性，元代禅僧，万松行秀法嗣。住长芦寺弘法，为曹洞宗第二十世传人。法脉传雪庭福裕。',
      coreTeaching: '承继万松行秀法脉，弘曹洞宗旨。',
      achievements: '曹洞宗第二十世，万松行秀法嗣，传法于雪庭福裕。',
      templeNames: [],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 21: 雪庭福裕 ===
  const xueting = await prisma.patriarch.create({
    data: {
      name: '雪庭福裕',
      nameEn: 'Xueting Fuyu',
      religionId: buddhismId,
      dates: '?-1274',
      title: '国师',
      school: '曹洞宗',
      generation: 21,
      teacherId: liaoxing.id,
      biography: '雪庭福裕，元代高僧。参万松行秀得法。受元世祖忽必烈封为国师，奉命重建嵩山少林寺及周围被战火毁坏的佛寺。制定少林寺七十字辈分传承偈，为中国禅宗寺院辈分制度之始。至元十一年（1274）示寂。',
      coreTeaching: '禅武一如，以禅入武，以武悟禅。',
      achievements: '元代曹洞宗代表。受忽必烈封为"国师"，受命重建嵩山少林寺及周围佛寺。制定少林寺僧人辈分字号传承制度，沿用至今。将少林寺确立为曹洞宗北方重要道场。',
      templeNames: [{ name: '嵩山少林寺', nameEn: 'Songshan Shaolin Temple', role: '住持', location: '河南登封' }],
      koans: [],
      classicQuotes: ['福慧智子觉，了本圆可悟', '这是少林寺僧人辈分字号偈，沿用至今'],
      works: [],
      imageUrl: null,
    },
  });

  // === Gen 22: 宗镜宗书 ===
  const zongshu = await prisma.patriarch.create({
    data: {
      name: '宗镜宗书',
      nameEn: 'Zongjing Zongshu',
      religionId: buddhismId,
      dates: '约14世纪',
      title: '宗书禅师',
      school: '曹洞宗',
      generation: 22,
      teacherId: xueting.id,
      biography: '宗镜宗书，元末明初禅僧，雪庭福裕法嗣。承继曹洞法脉，为第二十二世传人。法脉传廪山常忠。',
      coreTeaching: '承继曹洞宗旨。',
      achievements: '曹洞宗第二十二世，雪庭福裕法嗣，传法于廪山常忠。',
      templeNames: [], koans: [], classicQuotes: [], works: [], imageUrl: null,
    },
  });

  // === Gen 23: 廪山常忠 ===
  const changzhong = await prisma.patriarch.create({
    data: {
      name: '廪山常忠',
      nameEn: 'Linshan Changzhong',
      religionId: buddhismId,
      dates: '约14-15世纪',
      title: '常忠禅师',
      school: '曹洞宗',
      generation: 23,
      teacherId: zongshu.id,
      biography: '廪山常忠，明代禅僧，宗镜宗书法嗣。住廪山弘法，为曹洞宗第二十三世传人。法脉传无明慧经。',
      coreTeaching: '承继曹洞默照家风。',
      achievements: '曹洞宗第二十三世，传法于无明慧经，为明代曹洞宗复兴的重要一环。',
      templeNames: [], koans: [], classicQuotes: [], works: [], imageUrl: null,
    },
  });

  // === Gen 24: 无明慧经 ===
  const huijing = await prisma.patriarch.create({
    data: {
      name: '无明慧经',
      nameEn: 'Wuming Huijing',
      religionId: buddhismId,
      dates: '1548-1618',
      title: '无明禅师',
      school: '曹洞宗',
      generation: 24,
      teacherId: changzhong.id,
      biography: '无明慧经，明代高僧，廪山常忠法嗣。号称明代曹洞宗中兴之祖，住持宝方禅寺，大弘曹洞宗旨。门下弟子众多，法脉分传各地。万历四十六年（1618）示寂。',
      coreTeaching: '重振曹洞家风，默照与看话并重。',
      achievements: '曹洞宗第二十四世，明代曹洞宗中兴关键人物。门下出永觉元贤等杰出弟子，使沉寂已久的曹洞宗重新焕发生机。',
      templeNames: [{ name: '宝方禅寺', nameEn: 'Baofang Temple', role: '住持', location: '江西' }],
      koans: [], classicQuotes: [], works: [], imageUrl: null,
    },
  });

  // === Gen 25: 永觉元贤 ===
  const yuanxian = await prisma.patriarch.create({
    data: {
      name: '永觉元贤',
      nameEn: 'Yongjue Yuanxian',
      religionId: buddhismId,
      dates: '1578-1657',
      title: '永觉禅师',
      school: '曹洞宗',
      generation: 25,
      teacherId: huijing.id,
      biography: '永觉元贤，福建建阳人，明末清初高僧。初学儒，后出家参无明慧经得法。住鼓山涌泉寺，著述甚丰。与临济宗费隐通容有禅史争论（"法统之争"），著《辟非集》。顺治十四年（1657）示寂，世寿八十。',
      coreTeaching: '禅教一致，以禅宗要旨会通教理。',
      achievements: '曹洞宗第二十五世，明末曹洞宗代表人物。住鼓山涌泉寺，著有《洞上古辙》《楞严经略疏》等多部著作。与临济宗展开"法统之争"，捍卫曹洞宗正统性。',
      templeNames: [{ name: '鼓山涌泉寺', nameEn: 'Gushan Yongquan Temple', role: '住持', location: '福建福州' }],
      koans: [],
      classicQuotes: ['禅教一致，宗说兼通'],
      works: [
        { title: '洞上古辙', description: '曹洞宗传承史料' },
        { title: '楞严经略疏', description: '楞严经注释' },
      ],
      imageUrl: null,
    },
  });

  // === Gen 26: 为霖道霈 ===
  const daopei = await prisma.patriarch.create({
    data: {
      name: '为霖道霈',
      nameEn: 'Weilin Daopei',
      religionId: buddhismId,
      dates: '1615-1702',
      title: '为霖禅师',
      school: '曹洞宗',
      generation: 26,
      teacherId: yuanxian.id,
      biography: '为霖道霈，福建建宁人。参永觉元贤得法。继住鼓山涌泉寺，为曹洞宗第二十六世。著述丰富，对闽地佛教影响深远。康熙四十一年（1702）示寂，世寿八十八。',
      coreTeaching: '继承永觉法脉，禅净双修。',
      achievements: '曹洞宗第二十六世，继住鼓山涌泉寺。著有《还山录》《华严经疏论纂要》等。',
      templeNames: [{ name: '鼓山涌泉寺', nameEn: 'Gushan Yongquan Temple', role: '住持', location: '福建福州' }],
      koans: [], classicQuotes: [],
      works: [{ title: '还山录', description: '禅修语录集' }],
      imageUrl: null,
    },
  });

  // === Gen 27: 惟静道安 ===
  const daoan = await prisma.patriarch.create({
    data: {
      name: '惟静道安',
      nameEn: 'Weijing Daoan',
      religionId: buddhismId,
      dates: '约17世纪',
      title: '道安禅师',
      school: '曹洞宗',
      generation: 27,
      teacherId: daopei.id,
      biography: '惟静道安，清代禅僧，为霖道霈法嗣。为曹洞宗第二十七世传人，法脉传恒涛大心。',
      coreTeaching: '承继曹洞默照家风。',
      achievements: '曹洞宗第二十七世，为霖道霈法嗣。',
      templeNames: [], koans: [], classicQuotes: [], works: [], imageUrl: null,
    },
  });

  // === Gen 28: 恒涛大心 ===
  const daxin = await prisma.patriarch.create({
    data: {
      name: '恒涛大心',
      nameEn: 'Hengtao Daxin',
      religionId: buddhismId,
      dates: '约17-18世纪',
      title: '大心禅师',
      school: '曹洞宗',
      generation: 28,
      teacherId: daoan.id,
      biography: '恒涛大心，清代禅僧，惟静道安法嗣。为曹洞宗第二十八世传人，法脉传圆玉兴五。',
      coreTeaching: '承继曹洞宗旨。',
      achievements: '曹洞宗第二十八世，道安法嗣。',
      templeNames: [], koans: [], classicQuotes: [], works: [], imageUrl: null,
    },
  });

  // === Gen 29: 圆玉兴五 ===
  const xingwu = await prisma.patriarch.create({
    data: {
      name: '圆玉兴五',
      nameEn: 'Yuanyu Xingwu',
      religionId: buddhismId,
      dates: '约18世纪',
      title: '兴五禅师',
      school: '曹洞宗',
      generation: 29,
      teacherId: daxin.id,
      biography: '圆玉兴五，清代禅僧，恒涛大心法嗣。为曹洞宗第二十九世传人，法脉传象先法印。',
      coreTeaching: '承继曹洞默照家风。',
      achievements: '曹洞宗第二十九世，大心法嗣。',
      templeNames: [], koans: [], classicQuotes: [], works: [], imageUrl: null,
    },
  });

  // === Gen 30: 象先法印 ===
  const fayin = await prisma.patriarch.create({
    data: {
      name: '象先法印',
      nameEn: 'Xiangxian Fayin',
      religionId: buddhismId,
      dates: '约18世纪',
      title: '法印禅师',
      school: '曹洞宗',
      generation: 30,
      teacherId: xingwu.id,
      biography: '象先法印，清代禅僧，圆玉兴五法嗣。为曹洞宗第三十世传人，法脉传淡然法文。',
      coreTeaching: '承继曹洞宗旨。',
      achievements: '曹洞宗第三十世，兴五法嗣。',
      templeNames: [], koans: [], classicQuotes: [], works: [], imageUrl: null,
    },
  });

  // === Gen 31: 淡然法文 ===
  const fawen = await prisma.patriarch.create({
    data: {
      name: '淡然法文',
      nameEn: 'Danran Fawen',
      religionId: buddhismId,
      dates: '约18世纪',
      title: '法文禅师',
      school: '曹洞宗',
      generation: 31,
      teacherId: fayin.id,
      biography: '淡然法文，清代禅僧，象先法印法嗣。为曹洞宗第三十一世传人，法脉传堂敏法澹。',
      coreTeaching: '承继曹洞默照家风。',
      achievements: '曹洞宗第三十一世，法印法嗣。',
      templeNames: [], koans: [], classicQuotes: [], works: [], imageUrl: null,
    },
  });

  // === Gen 32: 堂敏法澹 ===
  const fadan = await prisma.patriarch.create({
    data: {
      name: '堂敏法澹',
      nameEn: 'Tangmin Fadan',
      religionId: buddhismId,
      dates: '约18-19世纪',
      title: '法澹禅师',
      school: '曹洞宗',
      generation: 32,
      teacherId: fawen.id,
      biography: '堂敏法澹，清代禅僧，淡然法文法嗣。为曹洞宗第三十二世传人，法脉传遍照兴隆。',
      coreTeaching: '承继曹洞宗旨。',
      achievements: '曹洞宗第三十二世，法文法嗣。',
      templeNames: [], koans: [], classicQuotes: [], works: [], imageUrl: null,
    },
  });

  // === Gen 33: 遍照兴隆 ===
  const xinglong = await prisma.patriarch.create({
    data: {
      name: '遍照兴隆',
      nameEn: 'Bianzhao Xinglong',
      religionId: buddhismId,
      dates: '约19世纪',
      title: '兴隆禅师',
      school: '曹洞宗',
      generation: 33,
      teacherId: fadan.id,
      biography: '遍照兴隆，清代禅僧，堂敏法澹法嗣。为曹洞宗第三十三世传人，法脉传鼎峰耀成。',
      coreTeaching: '承继曹洞默照家风。',
      achievements: '曹洞宗第三十三世，法澹法嗣。',
      templeNames: [], koans: [], classicQuotes: [], works: [], imageUrl: null,
    },
  });

  // === Gen 34: 鼎峰耀成 ===
  const yaocheng = await prisma.patriarch.create({
    data: {
      name: '鼎峰耀成',
      nameEn: 'Dingfeng Yaocheng',
      religionId: buddhismId,
      dates: '约19世纪',
      title: '耀成禅师',
      school: '曹洞宗',
      generation: 34,
      teacherId: xinglong.id,
      biography: '鼎峰耀成，清代禅僧，遍照兴隆法嗣。为曹洞宗第三十四世传人。其后法脉经数代传承至第四十七世虚云古岩。',
      coreTeaching: '承继曹洞宗旨。',
      achievements: '曹洞宗第三十四世，兴隆法嗣。其下法脉延续至近代虚云大师（第四十七世）。',
      templeNames: [], koans: [], classicQuotes: [], works: [], imageUrl: null,
    },
  });

  // (Gen 35-46: 中间世次传承记录散佚，待考证补充)

  // === Gen 47: 虚云古岩 ===
  const xuyun = await prisma.patriarch.create({
    data: {
      name: '虚云古岩',
      nameEn: 'Xuyun',
      religionId: buddhismId,
      dates: '1840-1959',
      title: '虚云老和尚',
      school: '曹洞宗',
      generation: 47,
      teacherId: null,
      biography: '虚云，俗姓萧，福建泉州人。十九岁于鼓山涌泉寺出家。一生坐阅五帝四朝，历经清末、民国、新中国三个时代。朝五台、峨眉、九华、普陀四大名山，三步一拜朝五台山。遍参名宿，苦行精修。于高旻寺禅七中，因杯子扑落地而豁然大悟。一生重建大小道场数十座：重建南华寺（1934-1943，建殿堂243间、造佛像670尊）、重建云门山大觉寺（1943-1951）、重建云居山真如禅寺。兼承禅宗五宗法脉，为史上唯一之人。1953年任中国佛教协会名誉会长。1959年于云居山真如寺安详示寂，世寿一百二十岁。',
      coreTeaching: '参禅的秘诀就是——看话头。看话头就是一个"疑"字。疑者，疑此一念未生以前是什么。',
      achievements: '近代禅宗最伟大的复兴者。兼承禅宗五宗法脉（曹洞、临济、云门、法眼、沩仰），为禅宗史上唯一一人。重建大小道场数十座，其中南华寺、云门寺、云居寺为最著名。1953年任中国佛教协会名誉会长。世寿一百二十岁（传统说法），为近代佛教界最具影响力人物。',
      templeNames: [
        { name: '云居山真如禅寺', nameEn: 'Yunju Zhenru Temple', role: '重建', location: '江西永修' },
        { name: '南华禅寺', nameEn: 'Nanhua Temple', role: '重建', location: '广东韶关' },
        { name: '云门山大觉禅寺', nameEn: 'Yunmen Dajue Temple', role: '重建', location: '广东乳源' },
        { name: '鸡足山祝圣寺', nameEn: 'Zhusheng Temple', role: '重建', location: '云南大理' },
        { name: '鼓山涌泉寺', nameEn: 'Gushan Yongquan Temple', role: '驻锡', location: '福建福州' },
      ],
      koans: [{ title: '杯子落地', content: '杯子扑落地，响声明沥沥。虚空粉碎也，狂心当下息。', source: '虚云和尚年谱' }],
      classicQuotes: ['杯子扑落地，响声明沥沥。虚空粉碎也，狂心当下息。', '修行须是铁汉，着手心头便判', '坐阅五帝四朝，不觉沧桑几度'],
      works: [
        { title: '虚云和尚年谱', description: '自传编年史' },
        { title: '虚云和尚法汇', description: '法语、开示、书信集' },
        { title: '虚云和尚方便开示', description: '禅修指导集' },
      ],
      imageUrl: null,
    },
  });

  // === Gen 48: 圆瑛宏悟 ===
  const yuanying = await prisma.patriarch.create({
    data: {
      name: '圆瑛宏悟',
      nameEn: 'Yuanying',
      religionId: buddhismId,
      dates: '1878-1953',
      title: '楞严座主',
      school: '曹洞宗',
      generation: 48,
      teacherId: xuyun.id,
      biography: '圆瑛，福建古田人，俗名吴昌发。于福州梅峰寺剃度出家，于涌泉寺受具足戒。师从冶开禅师参禅四年。一生精研楞严经，创办圆明楞严专宗学院。1953年当选中国佛教协会首任会长。同年九月圆寂，世寿七十五岁。',
      coreTeaching: '禅净双修，以楞严经为修行纲要。',
      achievements: '中国佛教协会首任会长（1953年当选）。创办圆明楞严专宗学院（1945），专弘楞严经。一生致力于佛教组织建设和人才培养。',
      templeNames: [{ name: '鼓山涌泉寺', nameEn: 'Gushan Yongquan Temple', role: '住持', location: '福建福州' }],
      koans: [],
      classicQuotes: ['求福求慧求生净土，念佛念法念侣僧伽'],
      works: [
        { title: '圆瑛大师全集', description: '七卷本，佛学著述总集' },
        { title: '楞严经讲义', description: '楞严经系统注释' },
      ],
      imageUrl: null,
    },
  });

  const caodongCount = 38;
  console.log(`  ✓ ${caodongCount} Caodong Zen patriarchs created`);

  // ── 4c. 禅宗四宗祖师 (Other Four Zen Schools) ──
  console.log('Creating other Zen school patriarchs...');

  // === 临济宗 (Linji School) ===
  const linjiYixuan = await prisma.patriarch.create({
    data: {
      name: '临济义玄',
      nameEn: 'Linji Yixuan',
      religionId: buddhismId,
      dates: '?-866',
      title: '临济禅师',
      school: '临济宗',
      generation: 1,
      teacherId: null,
      biography: '临济义玄，曹州（今山东菏泽）南华人。参黄檗希运得法。唐大中八年（854）住镇州（今河北正定）临济院，大弘禅法。其禅风峻烈，棒喝交施，创"四料简""四宾主""三玄三要"等独特教法。咸通七年（866）示寂，敕谥"慧照禅师"。临济宗后成为禅宗五家中传播最广、影响最大的宗派。',
      coreTeaching: '四料简——有时夺人不夺境，有时夺境不夺人，有时人境俱夺，有时人境俱不夺。',
      achievements: '创立临济宗，为禅宗五家中流传最广、影响最大的宗派。创建四料简、四宾主、三玄三要等教法体系。棒喝教学法影响深远。后分杨岐、黄龙两派，形成"五家七宗"。传入日本为临济宗（荣西禅师开创），为日本禅宗主流。',
      templeNames: [{ name: '临济寺', nameEn: 'Linji Temple', role: '创建', location: '河北正定' }],
      koans: [
        { title: '临济喝', content: '师问僧：有时一喝如金刚王宝剑，有时一喝如踞地金毛狮子，有时一喝如探竿影草，有时一喝不作一喝用。', source: '临济录' },
        { title: '无位真人', content: '赤肉团上有一无位真人，常从汝等诸人面门出入。未证据者看看！', source: '临济录' },
      ],
      classicQuotes: ['赤肉团上有一无位真人', '逢佛杀佛，逢祖杀祖', '随处作主，立处皆真'],
      works: [{ title: '临济录', description: '临济禅师语录，禅宗最重要经典之一' }],
      imageUrl: null,
    },
  });

  const dahui = await prisma.patriarch.create({
    data: {
      name: '大慧宗杲',
      nameEn: 'Dahui Zonggao',
      religionId: buddhismId,
      dates: '1089-1163',
      title: '大慧禅师',
      school: '临济宗',
      generation: null,
      teacherId: null,
      biography: '大慧宗杲，宣州宁国（今安徽）人。参圆悟克勤得法。倡导看话禅（话头禅），与曹洞宗宏智正觉之默照禅对立，形成禅宗史上著名的"看话vs默照"之争。住径山寺，门下弟子众多。绍兴三十三年（1163）示寂，世寿七十五，敕谥"普觉禅师"。',
      coreTeaching: '看话禅——参一则话头，起大疑情，疑情破处即是悟处。以"狗子无佛性"（无字话头）为核心。',
      achievements: '临济宗杨岐派大成者。系统化看话禅修行法门，与默照禅并列为禅宗两大修行路线。住径山寺弘法，门下英才辈出。',
      templeNames: [{ name: '径山寺', nameEn: 'Jingshan Temple', role: '住持', location: '浙江杭州' }],
      koans: [{ title: '无字话头', content: '僧问赵州：狗子还有佛性也无？州云：无。但参此一字。', source: '大慧语录' }],
      classicQuotes: ['只这一个无字，便是断生死路头底刀子', '大疑大悟，小疑小悟，不疑不悟'],
      works: [{ title: '大慧语录', description: '禅师说法集录' }, { title: '大慧书', description: '致居士书信集' }],
      imageUrl: null,
    },
  });

  // === 云门宗 (Yunmen School) ===
  const yunmenWenyan = await prisma.patriarch.create({
    data: {
      name: '云门文偃',
      nameEn: 'Yunmen Wenyan',
      religionId: buddhismId,
      dates: '864-949',
      title: '匡真禅师',
      school: '云门宗',
      generation: 1,
      teacherId: null,
      biography: '云门文偃，嘉兴（今浙江）人。初参睦州道踪，后于雪峰义存处得法。住韶州（今广东韶关）云门山光泰禅院三十余年，创立云门宗。其禅风以简洁、犀利著称，常以一字或极简之语截断学人妄想，称为"云门一字关"。南汉高祖赐号"匡真禅师"。乾和七年（949）示寂。',
      coreTeaching: '云门三句——涵盖乾坤、截断众流、随波逐浪。以极简之语指示学人。',
      achievements: '创立云门宗，为禅宗五家之一。禅风以简洁峻烈著称。门下弟子千余人，其中63人各化一方。云门宗在宋代极盛，雪窦重显编《碧岩录》（百则公案）为禅宗最重要公案集之一。',
      templeNames: [{ name: '云门山大觉禅寺', nameEn: 'Yunmen Dajue Temple', role: '创建', location: '广东韶关乳源' }],
      koans: [
        { title: '云门饼', content: '僧问：如何是超佛越祖之谈？师曰：糊饼。', source: '云门广录' },
        { title: '日日是好日', content: '十五日已前不问汝，十五日已后道将一句来。自代云：日日是好日。', source: '碧岩录' },
      ],
      classicQuotes: ['日日是好日', '顾鉴咦', '乾坤之内，宇宙之间，中有一宝，秘在形山'],
      works: [{ title: '云门广录', description: '云门禅师语录' }],
      imageUrl: null,
    },
  });

  // === 法眼宗 (Fayan School) ===
  const fayanWenyi = await prisma.patriarch.create({
    data: {
      name: '法眼文益',
      nameEn: 'Fayan Wenyi',
      religionId: buddhismId,
      dates: '885-958',
      title: '大法眼禅师',
      school: '法眼宗',
      generation: 1,
      teacherId: null,
      biography: '法眼文益，余杭（今浙江）人，俗姓鲁。七岁出家，初学律宗，后参罗汉桂琛得法。住金陵（今南京）清凉院弘法。南唐中主李璟极为敬重，赐号"法眼禅师"。法眼宗以华严教理融通禅旨为特色，注重"理事圆融"。显德五年（958）示寂，敕谥"大法眼禅师"。',
      coreTeaching: '理事不二，一切现成。以华严"六相圆融"贯通禅理，强调"对病施药，相身裁缝"。',
      achievements: '创立法眼宗，为禅宗五家之一。以华严教理融通禅旨为特色。门下弟子众多，天台德韶传法于高丽，法眼宗成为韩国禅宗重要源流。永明延寿著《宗镜录》百卷，为禅宗融通各宗之巨著。',
      templeNames: [{ name: '清凉寺', nameEn: 'Qingliang Temple', role: '住持', location: '江苏南京' }],
      koans: [{ title: '指万法', content: '师举手指帘，时有二僧同去卷帘。师曰：一得一失。', source: '五灯会元' }],
      classicQuotes: ['理事不二，一切现成', '不知最亲切'],
      works: [{ title: '宗门十规论', description: '禅门规范论述' }],
      imageUrl: null,
    },
  });

  // === 沩仰宗 (Guiyang School) ===
  const guishanLingyou = await prisma.patriarch.create({
    data: {
      name: '沩山灵祐',
      nameEn: 'Guishan Lingyou',
      religionId: buddhismId,
      dates: '771-853',
      title: '大圆禅师',
      school: '沩仰宗',
      generation: 1,
      teacherId: null,
      biography: '沩山灵祐，福州长溪（今福建霞浦）人。十五岁出家，参百丈怀海得法。百丈命其往潭州沩山（今湖南宁乡）开山弘法，结庵于山，初时极苦，与猿猴为伍。后渐聚徒众，住山四十余年，门下常一千五百众。大中七年（853）示寂，敕谥"大圆禅师"。与弟子仰山慧寂共创沩仰宗。',
      coreTeaching: '圆相——以九十七种圆相符号表达禅理，不立文字而立符号，为禅宗独创教学法。',
      achievements: '与弟子仰山慧寂共创沩仰宗，为禅宗五家中最早成立者。创圆相教学法（九十七种圆相）。住沩山四十余年，门下常驻千五百众。沩仰宗虽在五代后渐趋衰微，但圆相之法对后世禅宗影响深远。',
      templeNames: [{ name: '沩山密印寺', nameEn: 'Guishan Miyin Temple', role: '创建', location: '湖南宁乡' }],
      koans: [{ title: '水牯牛', content: '沩山问仰山：大地众生，业识茫茫，无本可据，汝作么生知他有之与无？', source: '沩山警策' }],
      classicQuotes: ['实际理地，不受一尘；万行门中，不舍一法'],
      works: [{ title: '沩山警策', description: '修行警策文，丛林必读' }],
      imageUrl: null,
    },
  });

  const yangshan = await prisma.patriarch.create({
    data: {
      name: '仰山慧寂',
      nameEn: 'Yangshan Huiji',
      religionId: buddhismId,
      dates: '807-883',
      title: '智通禅师',
      school: '沩仰宗',
      generation: 2,
      teacherId: guishanLingyou.id,
      biography: '仰山慧寂，韶州（今广东韶关）人，俗姓叶。十七岁出家，参沩山灵祐得法。住袁州仰山（今江西宜春）弘法。善用圆相教学，师徒以圆相互答，旁人不解其义。时人称二人禅法为"沩仰宗"。中和三年（883）示寂，敕谥"智通禅师"。',
      coreTeaching: '圆相传法——以圆相符号代替语言文字表达禅意，师徒心心相印。',
      achievements: '沩仰宗联合创始人。将圆相教学法发扬光大，善以圆相与沩山互答。"沩仰"之"仰"即取自仰山。',
      templeNames: [{ name: '仰山栖隐寺', nameEn: 'Yangshan Qiyin Temple', role: '住持', location: '江西宜春' }],
      koans: [{ title: '圆相', content: '沩仰师徒常以圆相互答。仰山画一圆相呈沩山，沩山以足画地。', source: '传灯录' }],
      classicQuotes: ['我这里针劄不入'],
      works: [],
      imageUrl: null,
    },
  });

  const otherSchoolCount = 6;
  console.log(`  ✓ ${otherSchoolCount} other Zen school patriarchs created`);

  // ── 4d. 净土宗十三祖 (Pure Land Patriarchs) ──
  console.log('Creating Pure Land patriarchs...');

  // === 净土初祖: 慧远大师 ===
  const huiyuan = await prisma.patriarch.create({
    data: {
      name: '慧远大师',
      nameEn: 'Huiyuan',
      religionId: buddhismId,
      dates: '334-416',
      title: '庐山慧远',
      school: '净土宗',
      generation: 1,
      teacherId: null,
      biography: '慧远，俗姓贾，雁门楼烦（今山西原平）人。少为书生，博综六经，尤善庄老。二十一岁闻道安法师讲般若经，叹曰"儒道九流皆糠秕耳"，遂投簪出家。太元六年（381）入庐山，建东林寺。元兴元年（402）于东林寺般若台前，与刘遗民、雷次宗等一百二十三人共结白莲社，立誓专修念佛三昧，期生西方极乐世界。此为中国净土信仰之始，后世尊为净土宗初祖。义熙十二年（416）示寂，世寿八十三。',
      coreTeaching: '念佛三昧——专注忆念阿弥陀佛，定心观想西方净土依正庄严，以此三昧力求往生极乐世界。',
      achievements: '净土宗初祖。创建庐山东林寺白莲社，一百二十三人共修念佛三昧，开中国净土信仰之先河。著《沙门不敬王者论》，确立中国僧团独立于王权之地位。门下弟子三千余人。',
      templeNames: [{ name: '庐山东林寺', nameEn: 'Donglin Temple', role: '创建', location: '江西庐山' }],
      koans: [{ title: '虎溪三笑', content: '慧远送客不过虎溪，一日送陶渊明、陆修静，谈笑间不觉过溪，三人相视大笑。', source: '庐山记' }],
      classicQuotes: ['儒道九流，皆糠秕耳', '愿与含灵，同生净土'],
      works: [
        { title: '沙门不敬王者论', description: '五篇，论证僧团不应礼拜帝王' },
        { title: '庐山慧远法师文钞', description: '书信、序跋、偈颂集' },
      ],
      imageUrl: null,
    },
  });

  // === 净土二祖: 善导大师 ===
  const shandao = await prisma.patriarch.create({
    data: {
      name: '善导大师',
      nameEn: 'Shandao',
      religionId: buddhismId,
      dates: '613-681',
      title: '光明和尚',
      school: '净土宗',
      generation: 2,
      teacherId: null,
      biography: '善导，临淄（今山东淄博）人。少出家，初诵《法华》、《维摩》。贞观十五年（641）往玄中寺参道绰禅师，闻《观无量寿经》，喜曰"此真入佛之津要"。道绰授以净土法门。后往长安，住光明寺，昼夜礼诵。写《弥陀经》十万卷，画净土变相三百壁。长安满城归信念佛，被尊为"光明和尚"。著《观经四帖疏》，确立称名念佛（口念佛号）为净土正行，彻底平民化净土修行。永隆二年（681）示寂。后世日本法然上人读其著作而创立日本净土宗。',
      coreTeaching: '称名念佛——"一心专念弥陀名号，行住坐卧，不问时节久近，念念不舍者，是名正定之业，顺彼佛愿故。"',
      achievements: '净土宗二祖，实际教义体系创立者。著《观经四帖疏》确立称名念佛为正行（五正行说）。写《弥陀经》十万卷，画净土变相三百壁。影响日本法然上人创立日本净土宗(Jodo-shu)。',
      templeNames: [
        { name: '西安香积寺', nameEn: 'Xiangji Temple', role: '善导塔所在', location: '陕西西安' },
        { name: '光明寺', nameEn: 'Guangming Temple', role: '驻锡弘法', location: '陕西长安' },
      ],
      koans: [
        { title: '称名正定业', content: '一心专念弥陀名号，行住坐卧，不问时节久近，念念不舍者，是名正定之业，顺彼佛愿故。', source: '观经四帖疏' },
        { title: '二河白道喻', content: '众生在生死大河中，贪嗔如水火二河。中间有一白道（念佛），虽窄而可通彼岸。', source: '观经四帖疏' },
      ],
      classicQuotes: ['一心专念弥陀名号，念念不舍，是名正定之业', '人能念佛佛还念，专心想佛佛知人', '如来出世本怀，唯说念佛往生'],
      works: [
        { title: '观经四帖疏', description: '净土宗核心经典注释，确立称名念佛正行' },
        { title: '观念法门', description: '观想念佛修行指导' },
        { title: '法事赞', description: '净土礼赞仪轨' },
        { title: '往生礼赞', description: '六时礼赞仪轨' },
        { title: '般舟赞', description: '般舟三昧赞偈' },
      ],
      imageUrl: null,
    },
  });

  // === 净土三祖: 承远大师 ===
  const chengyuan = await prisma.patriarch.create({
    data: {
      name: '承远大师',
      nameEn: 'Chengyuan',
      religionId: buddhismId,
      dates: '712-802',
      title: '承远和尚',
      school: '净土宗',
      generation: 3,
      teacherId: null,
      biography: '承远，汉州（今四川广汉）人。初学律宗，后参慧日三藏学净土法门。住衡山（南岳）弥陀寺，结茅苦修，以苦行精修闻名。弟子法照从其学净土，后法照被代宗封为国师。柳宗元为其撰碑铭。贞元十八年（802）示寂，世寿九十一。',
      coreTeaching: '专修念佛，勤苦精进，不求名利，以身作则感化众生。',
      achievements: '净土宗三祖。住衡山弥陀寺苦行修念佛，教化法照等弟子。柳宗元撰碑赞其德行。',
      templeNames: [{ name: '衡山弥陀寺', nameEn: 'Hengshan Amituo Temple', role: '驻锡', location: '湖南衡山' }],
      koans: [{ title: '苦行念佛', content: '承远于衡山结茅为庵，以蕉叶铺地，苦行念佛不辍。远近闻风归附，弟子以千计。', source: '宋高僧传' }],
      classicQuotes: ['念佛不在多言，贵在一心不乱'],
      works: [],
      imageUrl: null,
    },
  });

  // === 净土四祖: 法照大师 ===
  const fazhao = await prisma.patriarch.create({
    data: {
      name: '法照大师',
      nameEn: 'Fazhao',
      religionId: buddhismId,
      dates: '?-821',
      title: '五会法师',
      school: '净土宗',
      generation: 4,
      teacherId: chengyuan.id,
      biography: '法照，身世不详。大历二年（767）于衡山弥陀寺参承远和尚学净土。后入五台山，传于定中见文殊菩萨，菩萨指示念佛法门。遂创"五会念佛"法——以五种声调节奏念阿弥陀佛名号，由缓至急，摄心入定。大历七年（772）唐代宗迎入宫中教授五会念佛，封为"国师"。元和年间（约821年前后）示寂。',
      coreTeaching: '五会念佛——以五种声调渐次念佛：第一会平声缓念，第二至第四渐急，第五会急念入定。以音声摄心，契入念佛三昧。',
      achievements: '净土宗四祖，承远大师弟子（唯一直接师徒传承）。创立五会念佛法，以音声摄心。被唐代宗封为"国师"，入宫教授念佛。五会念佛对后世佛教音乐和念佛仪轨影响深远。',
      templeNames: [{ name: '五台山竹林寺', nameEn: 'Wutaishan Zhulin Temple', role: '驻锡', location: '山西五台山' }],
      koans: [{ title: '五会念佛', content: '第一会平声缓念，第二会平上声，第三会非缓非急，第四会渐急，第五会转急。五会念毕，寂然入定。', source: '五会法事赞' }],
      classicQuotes: ['此世界众生，应当念佛。以念佛故，得生极乐'],
      works: [{ title: '五会法事赞', description: '五会念佛仪轨和赞偈' }],
      imageUrl: null,
    },
  });

  // === 净土五祖: 少康大师 ===
  await prisma.patriarch.create({
    data: {
      name: '少康大师',
      nameEn: 'Shaokang',
      religionId: buddhismId,
      dates: '?-805',
      title: '后善导',
      school: '净土宗',
      generation: 5,
      teacherId: null,
      biography: '少康，缙云（今浙江丽水）人。十五岁出家，习法华、楞严等经。贞元初至洛阳白马寺，见善导大师《西方化导文》放光，遂专修净土。至新定（今浙江建德）乌龙山弘法，聚人念佛。以钱诱引小儿念佛一声给一钱，渐至满城念佛。当时人称为"后善导"。贞元二十一年（805）示寂。',
      coreTeaching: '称名念佛，善巧方便，以种种方便接引众生归于净土。',
      achievements: '净土宗五祖，被誉为"后善导"。以善巧方便在民间大弘念佛，以钱诱小儿念佛的方法新颖独特。使新定一带满城念佛，净土信仰深入民间。',
      templeNames: [{ name: '乌龙山净土道场', nameEn: 'Wulongshan Pure Land', role: '建立', location: '浙江建德' }],
      koans: [{ title: '以钱诱念佛', content: '少康至新定，以钱诱引小儿念佛。念佛一声予一钱，久之满城念佛，人称"后善导"。', source: '往生集' }],
      classicQuotes: ['念佛之人，阿弥陀佛常住其顶，日夜拥护'],
      works: [{ title: '往生西方净土瑞应删传', description: '净土往生故事集' }],
      imageUrl: null,
    },
  });

  // === 净土六祖: 延寿大师 ===
  await prisma.patriarch.create({
    data: {
      name: '延寿大师',
      nameEn: 'Yongming Yanshou',
      religionId: buddhismId,
      dates: '904-975',
      title: '永明延寿',
      school: '净土宗',
      generation: 6,
      teacherId: null,
      biography: '延寿，余杭（今浙江）人，字冲元。初为吴越国税务官，挪公款放生被判死刑，临刑面不改色，吴越王感其诚而赦免，许其出家。参天台德韶国师得法，为法眼宗第三代。住杭州永明寺（净慈寺），日课一百零八件佛事，夜往别峰行道念佛。著《宗镜录》百卷，融会禅教律净，主张"万善同归"，为禅净双修的理论奠基者。开宝八年（975）示寂，世寿七十二。',
      coreTeaching: '禅净双修，万善同归——"有禅有净土，犹如戴角虎；现世为人师，来生作佛祖。"',
      achievements: '净土宗六祖，兼为法眼宗三代传人。著《宗镜录》百卷，为中国佛教史上最大部头著作之一。首倡禅净双修理论，影响深远。日行一百零八件佛事，被誉为"弥陀化身"。',
      templeNames: [{ name: '杭州净慈寺', nameEn: 'Jingci Temple', role: '住持', location: '浙江杭州' }],
      koans: [{ title: '四料简', content: '有禅有净土，犹如戴角虎，现世为人师，来生作佛祖。无禅有净土，万修万人去，若得见弥陀，何愁不开悟。', source: '万善同归集' }],
      classicQuotes: ['有禅有净土，犹如戴角虎', '无禅有净土，万修万人去', '万善同归，一心念佛'],
      works: [
        { title: '宗镜录', description: '百卷，融会禅教律净之巨著' },
        { title: '万善同归集', description: '三卷，万善同归净土之论证' },
      ],
      imageUrl: null,
    },
  });

  // === 净土七祖: 省常大师 ===
  await prisma.patriarch.create({
    data: {
      name: '省常大师',
      nameEn: 'Shengchang',
      religionId: buddhismId,
      dates: '959-1020',
      title: '净行社主',
      school: '净土宗',
      generation: 7,
      teacherId: null,
      biography: '省常，钱塘（今浙江杭州）人。七岁出家，十七岁受具足戒。淳化年间于杭州西湖昭庆寺建净行社，效慕庐山白莲社故事，结社念佛。当时宰相王旦为社首，士大夫参加者达一百二十余人，僧俗社众逾千人。刺血书《华严经》净行品以为社规。天禧四年（1020）示寂，世寿六十二。',
      coreTeaching: '结社念佛，以士大夫居士为核心推动净土信仰。',
      achievements: '净土宗七祖。建净行社，宰相王旦为社首，推动北宋士大夫阶层念佛运动。刺血书华严经净行品。',
      templeNames: [{ name: '杭州昭庆寺', nameEn: 'Zhaoqing Temple', role: '建净行社', location: '浙江杭州' }],
      koans: [],
      classicQuotes: ['行道念佛，功不唐捐'],
      works: [],
      imageUrl: null,
    },
  });

  // === 净土八祖: 莲池大师 ===
  await prisma.patriarch.create({
    data: {
      name: '莲池大师',
      nameEn: 'Yunqi Zhuhong',
      religionId: buddhismId,
      dates: '1535-1615',
      title: '云栖袾宏',
      school: '净土宗',
      generation: 8,
      teacherId: null,
      biography: '袾宏，杭州仁和人，字佛慧，号莲池。十七岁补诸生（秀才），三十二岁出家。遍参知识，至笑岩德宝处参禅有省。后住杭州五云山云栖寺，三十余年。以华严教理融入净土修行，著《弥陀疏钞》十余万言，为净土宗最重要的经典注释之一。又著《竹窗随笔》《戒杀放生文》，倡导戒杀放生。与紫柏真可、憨山德清、蕅益智旭并称"明末四大高僧"。万历四十三年（1615）示寂，世寿八十一。',
      coreTeaching: '持名念佛，摄心为要——"念佛不贵多，贵在不间断。"以事持理持统摄念佛法门。',
      achievements: '净土宗八祖，明末四大高僧之一。著《弥陀疏钞》为净土宗最详尽注释。住云栖寺三十年，门下弟子众多。倡戒杀放生，著《竹窗随笔》影响深远。融禅入净，以华严圆教理释净土法门。',
      templeNames: [{ name: '杭州云栖寺', nameEn: 'Yunqi Temple', role: '住持三十年', location: '浙江杭州五云山' }],
      koans: [{ title: '事持理持', content: '事持者：信有西方阿弥陀佛，一心称念求生彼国。理持者：了知心即是佛，即心念佛，念念不离自心。', source: '弥陀疏钞' }],
      classicQuotes: ['念佛不贵多，贵在不间断', '真为生死，发菩提心，以深信愿，持佛名号', '竹窗下，一声佛号足矣'],
      works: [
        { title: '弥陀疏钞', description: '十余万言，净土宗最详尽经典注释' },
        { title: '竹窗随笔', description: '修行随笔三篇，影响深远' },
        { title: '戒杀放生文', description: '倡导戒杀放生' },
        { title: '往生集', description: '净土往生传记汇编' },
      ],
      imageUrl: null,
    },
  });

  // === 净土九祖: 蕅益大师 ===
  await prisma.patriarch.create({
    data: {
      name: '蕅益大师',
      nameEn: 'Ouyi Zhixu',
      religionId: buddhismId,
      dates: '1599-1655',
      title: '灵峰蕅益',
      school: '净土宗',
      generation: 9,
      teacherId: null,
      biography: '智旭，苏州木渎人，字蕅益。少习儒学，誓灭佛老。十七岁读莲池大师《竹窗随笔》、《自知录》，始信佛法。二十岁读《地藏菩萨本愿经》发出世心。二十四岁于径山出家。遍学天台、华严、唯识、律学诸宗。晚年住灵峰寺（今浙江安吉），专弘净土。著《弥陀要解》，被印光大师赞为"自古至今注解弥陀经之第一"。顺治十二年（1655）示寂，世寿五十七。与莲池、紫柏、憨山并称"明末四大高僧"。',
      coreTeaching: '信愿持名——"得生与否，全由信愿之有无；品位高下，全由持名之深浅。"信、愿、行三资粮缺一不可。',
      achievements: '净土宗九祖，明末四大高僧之一。著《弥陀要解》被印光大师推为"古今第一注解"。遍学诸宗后归心净土，以天台教理释净土法门。著述等身，晚年专弘净土。',
      templeNames: [{ name: '灵峰寺', nameEn: 'Lingfeng Temple', role: '晚年驻锡', location: '浙江安吉' }],
      koans: [{ title: '信愿持名', content: '得生与否，全由信愿之有无；品位高下，全由持名之深浅。', source: '弥陀要解' }],
      classicQuotes: ['得生与否，全由信愿之有无；品位高下，全由持名之深浅', '诸佛出世，悉为此法；一代时教，皆以净土为指归'],
      works: [
        { title: '弥陀要解', description: '阿弥陀经注释，被推为"古今第一"' },
        { title: '灵峰宗论', description: '十卷本，法语、书信、序跋集' },
        { title: '阅藏知津', description: '大藏经提要解题目录' },
      ],
      imageUrl: null,
    },
  });

  // === 净土十祖: 截流大师 ===
  await prisma.patriarch.create({
    data: {
      name: '截流大师',
      nameEn: 'Jieliu Xingjce',
      religionId: buddhismId,
      dates: '1628-1682',
      title: '截流行策',
      school: '净土宗',
      generation: 10,
      teacherId: null,
      biography: '行策，宜兴（今江苏）人，字截流。父亲为其取名"策"意在策进修行。出家后参禅有省，后读永明延寿《万善同归集》、莲池大师著述，遂转弘净土。于杭州虎丘建念佛道场，倡行"打念佛七"——以七日为期，日夜精进念佛，克期取证。此法后成为净土宗最重要的共修方式，流传至今。康熙二十一年（1682）示寂。',
      coreTeaching: '打念佛七——以七日为期，放下万缘，昼夜精进念佛，以期克证一心不乱。',
      achievements: '净土宗十祖。首倡"打念佛七"制度，以七天为期精进共修念佛，成为净土宗最重要的共修方式，至今各大丛林仍沿用。',
      templeNames: [],
      koans: [{ title: '念佛七', content: '以七日为期，放下万缘，一心念佛。晨钟暮鼓，行住坐卧，佛号不断。', source: '起一心精进念佛七期规约' }],
      classicQuotes: ['念佛七日，一心不乱'],
      works: [{ title: '起一心精进念佛七期规约', description: '念佛七制度规范' }],
      imageUrl: null,
    },
  });

  // === 净土十一祖: 省庵大师 ===
  await prisma.patriarch.create({
    data: {
      name: '省庵大师',
      nameEn: 'Xingan Shixian',
      religionId: buddhismId,
      dates: '1686-1734',
      title: '省庵实贤',
      school: '净土宗',
      generation: 11,
      teacherId: null,
      biography: '实贤，常熟（今江苏）人，号省庵。童年出家，精研天台教观，后参灵鹫和尚开悟。悟后回向净土，尽弃诸缘，专修念佛。著《劝发菩提心文》，文中"入道要门，发心为首；修行急务，立愿居先"一语，为净土宗修行纲要。每年正月结七念佛，腊月作往生净土忏。雍正十二年（1734）示寂，世寿四十九。',
      coreTeaching: '发菩提心念佛——"入道要门，发心为首；修行急务，立愿居先。"先发菩提心，然后念佛，功德圆满。',
      achievements: '净土宗十一祖。著《劝发菩提心文》为净土宗最重要策励文之一。由禅入净，以天台教理弘扬净土。',
      templeNames: [{ name: '杭州梵天寺', nameEn: 'Fantian Temple', role: '驻锡', location: '浙江杭州' }],
      koans: [{ title: '劝发菩提心', content: '入道要门，发心为首；修行急务，立愿居先。愿立则众生可度，心发则佛道堪成。', source: '劝发菩提心文' }],
      classicQuotes: ['入道要门，发心为首；修行急务，立愿居先', '忘身为法，以道自任'],
      works: [
        { title: '劝发菩提心文', description: '净土宗最重要策励文' },
        { title: '净土诗', description: '净土赞偈诗集' },
      ],
      imageUrl: null,
    },
  });

  // === 净土十二祖: 彻悟大师 ===
  await prisma.patriarch.create({
    data: {
      name: '彻悟大师',
      nameEn: 'Chewu Jixing',
      religionId: buddhismId,
      dates: '1741-1810',
      title: '彻悟际醒',
      school: '净土宗',
      generation: 12,
      teacherId: null,
      biography: '际醒，丰润（今河北唐山）人，号彻悟。二十二岁出家，先参禅宗临济派，得法后任北京觉生寺、广通寺住持。后因病悟世无常，尽弃禅务，专修净土，移住红螺山资福寺。每日领众念佛，精进不辍。著《彻悟禅师语录》，以禅解净，理事双融，被誉为清代净土宗集大成者。嘉庆十五年（1810）示寂，预知时至，安详往生。世寿七十。',
      coreTeaching: '以禅解净——"一句弥陀，该罗八教；一句弥陀，圆收五宗。"念佛即是参禅，参禅不离念佛。',
      achievements: '净土宗十二祖。由禅入净的最佳典范。住红螺山资福寺领众念佛，使红螺山成为北方净土重镇。著语录以禅理释净土，理事圆融。预知时至往生。',
      templeNames: [{ name: '红螺山资福寺', nameEn: 'Hongluoshan Zifu Temple', role: '住持', location: '北京怀柔' }],
      koans: [{ title: '一句弥陀', content: '一句弥陀，该罗八教，圆收五宗。可惜人多不知，惟以粗心大气念将去，不肯细心体究。', source: '彻悟禅师语录' }],
      classicQuotes: ['一句弥陀，该罗八教，圆收五宗', '真为生死，发菩提心，以深信愿，持佛名号——此十六字为净土法门之纲宗'],
      works: [{ title: '彻悟禅师语录', description: '法语、开示集，以禅理释净土' }],
      imageUrl: null,
    },
  });

  // === 净土十三祖: 印光大师 ===
  await prisma.patriarch.create({
    data: {
      name: '印光大师',
      nameEn: 'Yinguang',
      religionId: buddhismId,
      dates: '1861-1940',
      title: '印光法师',
      school: '净土宗',
      generation: 13,
      teacherId: null,
      biography: '圣量，陕西郃阳（今合阳）人，俗姓赵，法名圣量，字印光。幼年随兄习儒，受韩愈欧阳修辟佛影响而谤佛。后因病方信因果，二十一岁于终南山南五台莲花洞寺出家。先后驻锡法雨寺、报国寺等名刹。一生不建道场，不收出家弟子，不作住持。专以书信弘法，四众弟子遍及全国。民国十九年（1930）移居苏州灵岩山寺，将其定为专修净土道场。所著书信汇编为《印光法师文钞》，被推为净土宗最后一位大师。民国二十九年（1940）于灵岩山寺安详示寂，大众闻异香。世寿八十。',
      coreTeaching: '敦伦尽分，闲邪存诚，信愿念佛，求生净土——此十六字为印光大师一生教化之总纲。',
      achievements: '净土宗十三祖，近代最具影响力的净土宗大师。一生不作住持，以书信弘法，皈依弟子遍天下。《印光法师文钞》为近代最广泛流通的佛教著作。推蕅益大师《弥陀要解》为"古今第一"。民国时期佛教复兴的核心推动者之一。',
      templeNames: [
        { name: '苏州灵岩山寺', nameEn: 'Lingyan Mountain Temple', role: '晚年驻锡', location: '江苏苏州' },
        { name: '普陀山法雨寺', nameEn: 'Putuoshan Fayu Temple', role: '早年驻锡', location: '浙江舟山' },
      ],
      koans: [{ title: '十六字纲宗', content: '敦伦尽分，闲邪存诚，信愿念佛，求生净土。', source: '印光法师文钞' }],
      classicQuotes: ['敦伦尽分，闲邪存诚，信愿念佛，求生净土', '无论在家出家，必须上敬下和', '念佛之人，当存好心，说好话，行好事'],
      works: [
        { title: '印光法师文钞', description: '正续三编，书信集大成，近代流通最广佛教著作' },
        { title: '印光法师嘉言录', description: '精要开示汇编' },
      ],
      imageUrl: null,
    },
  });

  const pureLandCount = 13;
  console.log(`  ✓ ${pureLandCount} Pure Land patriarchs created`);

  // ── 4e. 律宗祖师 (Vinaya School Patriarchs) ──
  console.log('Creating Vinaya school patriarchs...');

  // === 律宗第1世: 昙柯迦罗 ===
  await prisma.patriarch.create({
    data: {
      name: '昙柯迦罗',
      nameEn: 'Dharmakala',
      religionId: buddhismId,
      dates: '?-253',
      title: '中国律宗初祖',
      school: '律宗',
      generation: 1,
      teacherId: null,
      biography: '昙柯迦罗（又名昙摩迦罗、法时），中天竺人。善学四韦陀论，通晓天文地理。出家后博学三藏，以律学见长。嘉平年间（249-253）至洛阳，时中国虽有沙门，皆未受戒，只剃发披缦衣而已。昙柯迦罗见此深感痛心，遂翻译《僧祇戒心》，并立羯磨法（受戒仪轨），邀请梵僧十人于白马寺设戒坛，为中国僧尼正式授戒之始。中国有律宗，实以此为嚆矢。',
      coreTeaching: '正法住世，以律为本——在中国首创正式受戒制度（羯磨法），奠定中国僧团戒律传承的根基。',
      achievements: '中国律宗初祖。在洛阳白马寺创立中国第一个正式受戒仪轨，首翻《僧祇戒心》。自此中国僧人始有正式受戒之法，标志着中国佛教戒律传承的正式开端。',
      templeNames: [{ name: '洛阳白马寺', nameEn: 'White Horse Temple', role: '首设戒坛', location: '河南洛阳' }],
      koans: [{ title: '首创羯磨', content: '昙柯迦罗至洛阳，见中国沙门皆未受戒，深感痛心。遂译出戒本，请梵僧十人，于白马寺设戒坛，行羯磨法。中国沙门始有正式受戒之仪。', source: '高僧传' }],
      classicQuotes: ['正法住世，以律为本', '沙门之为沙门，首在持戒'],
      works: [{ title: '僧祇戒心', description: '中国最早翻译的律学典籍' }],
      imageUrl: null,
    },
  });

  // === 律宗第2世: 慧光律师 ===
  const huiguangLv = await prisma.patriarch.create({
    data: {
      name: '慧光律师',
      nameEn: 'Huiguang',
      religionId: buddhismId,
      dates: '468-537',
      title: '光统律师',
      school: '律宗',
      generation: 2,
      teacherId: null,
      biography: '慧光，定州长卢（今河北定州）人。少年出家，十三岁即能讲经，被称为"圣沙弥"。师从佛陀扇多，精研律学与华严。于洛阳弘法，首开《四分律》注疏之先河，著《四分律疏》四卷，确立四分律为中国律学主流。北魏孝明帝时任僧统（国师级），号"光统律师"。门下弟子众多，后分为道云、道晖两大系。',
      coreTeaching: '四分律学——首次系统注疏《四分律》，确立四分律在中国律学的主导地位。',
      achievements: '首开四分律注疏之先河。著《四分律疏》确立四分律为中国律学正统。任北魏僧统，统领全国僧尼事务。门下分出道云、道晖两系，奠定后世律宗三家（南山/相部/东塔）之基础。',
      templeNames: [{ name: '洛阳大觉寺', nameEn: 'Dajue Temple', role: '弘法', location: '河南洛阳' }],
      koans: [{ title: '圣沙弥', content: '慧光十三岁即升座讲经，辩才无碍，时人称为"圣沙弥"。', source: '续高僧传' }],
      classicQuotes: ['四分律通大乘', '持律精严，方堪传法'],
      works: [
        { title: '四分律疏', description: '四卷，中国第一部四分律系统注疏' },
        { title: '华严经疏', description: '华严学重要注释' },
      ],
      imageUrl: null,
    },
  });

  // === 律宗第3世: 道云律师 ===
  const daoyunLv = await prisma.patriarch.create({
    data: {
      name: '道云律师',
      nameEn: 'Daoyun',
      religionId: buddhismId,
      dates: '?-?',
      title: '道云律师',
      school: '律宗',
      generation: 3,
      teacherId: huiguangLv.id,
      biography: '道云，慧光律师弟子，北朝律学家。深入研究《四分律》，在慧光《四分律疏》基础上扩充为九卷，系统性大幅增强。其著述对后世律学产生深远影响，门下弟子道洪继承其学，再传智首，形成南山律宗的直接法脉源流。',
      coreTeaching: '深研四分律，扩充注疏——在慧光之学基础上系统化四分律义理。',
      achievements: '承慧光之学，著《四分律疏》九卷，大幅扩充四分律学体系。其学术传承经道洪、智首、道宣一脉相承，为南山律宗奠定学术根基。',
      templeNames: [],
      koans: [],
      classicQuotes: ['律学精微，在乎传承'],
      works: [{ title: '四分律疏', description: '九卷，扩充慧光之学' }],
      imageUrl: null,
    },
  });

  // === 律宗第4世: 智首律师 ===
  const zhishouLv = await prisma.patriarch.create({
    data: {
      name: '智首律师',
      nameEn: 'Zhishou',
      religionId: buddhismId,
      dates: '567-635',
      title: '智首律师',
      school: '律宗',
      generation: 4,
      teacherId: daoyunLv.id,
      biography: '智首，相州安阳（今河南安阳）人。师从道洪律师（道云弟子），尽得其学。后至长安弘法，综合研究当时流传的五部律学（四分、五分、僧祇、十诵、根本），著《广疏》二十卷，为当时最全面的律学著作。又著《五部区分钞》二十一卷，辨析五部律之异同。长安成为四分律学中心。道宣即其门下高足，后创南山律宗。贞观九年（635）示寂。',
      coreTeaching: '五部律综合研究——融会贯通四分、五分、僧祇、十诵、根本五部律学，建立完整律学体系。',
      achievements: '道宣律师之师。著《广疏》二十卷综合五部律学，使长安成为四分律学中心。为南山律宗的创立奠定直接的学术与师承基础。',
      templeNames: [{ name: '长安弘福寺', nameEn: 'Hongfu Temple', role: '弘法', location: '陕西长安' }],
      koans: [{ title: '五部融通', content: '智首遍学五部律学，以四分律为本，融通诸部。著《广疏》二十卷，使长安四方学者云集。', source: '续高僧传' }],
      classicQuotes: ['律通诸部，以四分为宗', '持律为僧之本'],
      works: [
        { title: '广疏', description: '二十卷，五部律学综合注疏' },
        { title: '五部区分钞', description: '二十一卷，辨析五部律异同' },
      ],
      imageUrl: null,
    },
  });

  // === 律宗第5世: 道宣律师 (南山律宗开山祖师) ===
  const daoxuanLv = await prisma.patriarch.create({
    data: {
      name: '道宣律师',
      nameEn: 'Daoxuan',
      religionId: buddhismId,
      dates: '596-667',
      title: '南山律祖',
      school: '律宗',
      generation: 5,
      teacherId: zhishouLv.id,
      biography: '道宣，京兆（今陕西西安）人，俗姓钱，字法遍。十六岁出家，二十岁从智首律师受具足戒，尽得其律学真传。后于终南山丰德寺一带潜心研律二十余年。以唯识学（大乘）理论诠释四分律（小乘），创造性地提出"四分律通大乘"之说，建立完整的南山律学体系。著有"南山五大部"（以《四分律删繁补阙行事钞》为首），为律宗最根本的经典。乾封二年（667）于终南山净业寺建立戒坛传戒，同年十月示寂，世寿七十二。其后历代律师皆宗其学，"律学南山，几乎天下"。',
      coreTeaching: '四分律通大乘——以唯识圆教理论诠释四分律，统一大小乘戒律观。戒体论：以心法种子为戒体，持戒即修心。',
      achievements: '南山律宗开山祖师。著"南山三大部"（行事钞/戒本疏/羯磨疏）及五大部，为律宗根本经典。创立以唯识学释律的独特体系，使四分律成为中国律学正统。于净业寺建戒坛传法，门下弟子遍天下。后世千余年来，中国律学皆宗南山。',
      templeNames: [
        { name: '终南山净业寺', nameEn: 'Jingye Temple', role: '创建戒坛', location: '陕西西安长安区' },
        { name: '丰德寺', nameEn: 'Fengde Temple', role: '潜修研律', location: '陕西终南山' },
      ],
      koans: [
        { title: '南山三大部', content: '道宣以二十年心力，著《行事钞》十二卷、《戒本疏》三卷、《羯磨疏》二卷，合称"南山三大部"，为律宗万世不易之圭臬。', source: '宋高僧传' },
        { title: '四分通大乘', content: '道宣提出"四分律虽属小乘，然其义理通于大乘"，以唯识学心法种子说解释戒体，统一大小乘戒律观。', source: '四分律删繁补阙行事钞' },
      ],
      classicQuotes: ['四分律通大乘', '以心为戒体，持律即修心', '律学南山，几乎天下'],
      works: [
        { title: '四分律删繁补阙行事钞', description: '十二卷，南山三大部之首，律宗最重要经典' },
        { title: '四分律比丘含注戒本疏', description: '三卷，比丘戒本注释' },
        { title: '四分律删补随机羯磨疏', description: '二卷，受戒羯磨仪轨注释' },
        { title: '四分律拾毗尼义钞', description: '六卷，律学义理补充' },
        { title: '四分律比丘尼钞', description: '六卷，比丘尼律学' },
      ],
      imageUrl: null,
    },
  });

  // === 律宗第6世: 法砺律师 (相部宗创始人) ===
  await prisma.patriarch.create({
    data: {
      name: '法砺律师',
      nameEn: 'Fali',
      religionId: buddhismId,
      dates: '569-635',
      title: '相部宗祖',
      school: '律宗',
      generation: 6,
      teacherId: null,
      biography: '法砺，相州（今河南安阳）人。师从慧光系统学律，深研《四分律》。住相州日光寺弘法，以成实论为理论基础诠释四分律，与道宣的唯识学路线不同。著《四分律疏》及《羯磨疏》，形成独立的律学体系，被称为"相部宗"（因其在相州弘法而得名）。其学说在唐代一度广泛流传，后因南山宗之盛而逐渐式微。五代以后几近失传。',
      coreTeaching: '以成实论释四分律——以小乘成实论为理论基础诠释四分律，注重律文的原义解读。',
      achievements: '律宗三家之"相部宗"创始人。以成实论释律，形成与南山宗并立的独立律学体系。唐代一度广泛流传，对中国律学的多元发展有重要贡献。',
      templeNames: [{ name: '相州日光寺', nameEn: 'Riguang Temple', role: '弘法', location: '河南安阳' }],
      koans: [],
      classicQuotes: ['律文本义，不可曲解'],
      works: [
        { title: '四分律疏', description: '相部宗核心注疏' },
        { title: '羯磨疏', description: '受戒仪轨注释' },
      ],
      imageUrl: null,
    },
  });

  // === 律宗第7世: 怀素律师 (东塔宗创始人) ===
  await prisma.patriarch.create({
    data: {
      name: '怀素律师',
      nameEn: 'Huaisu',
      religionId: buddhismId,
      dates: '624-697',
      title: '东塔宗祖',
      school: '律宗',
      generation: 7,
      teacherId: null,
      biography: '怀素，京兆（今陕西西安）人。初从道成律师学律，后以当时新译之《大毗婆沙》《俱舍论》为理论基础，重新诠释四分律，与道宣（唯识）和法砺（成实）皆不同路。著《四分律开宗记》二十卷，创立"新疏"学派。因住长安西太原寺东塔院，其学派被称为"东塔宗"。与法砺之"旧疏"争论最为激烈。唐代律宗三家鼎立，后世南山宗独盛，相部与东塔皆衰。万岁通天二年（697）示寂。',
      coreTeaching: '以俱舍论释四分律——以说一切有部的俱舍论为理论基础，注重律学的知识论分析。',
      achievements: '律宗三家之"东塔宗"创始人。著《四分律开宗记》二十卷，以俱舍论释律，形成第三种独立的律学诠释路线。其"新疏"与法砺的"旧疏"之争，推动了唐代律学的学术发展。',
      templeNames: [{ name: '长安西太原寺', nameEn: 'Xi Taiyuan Temple', role: '东塔院住持', location: '陕西长安' }],
      koans: [{ title: '新旧疏争', content: '怀素以新译论典批评法砺旧疏，法砺弟子亦反驳怀素。新旧疏争辩长达数十年，促进了唐代律学的深入发展。', source: '宋高僧传' }],
      classicQuotes: ['律义精微，当以论典为准'],
      works: [{ title: '四分律开宗记', description: '二十卷，东塔宗核心著作' }],
      imageUrl: null,
    },
  });

  // === 律宗第8世: 鉴真大师 ===
  await prisma.patriarch.create({
    data: {
      name: '鉴真大师',
      nameEn: 'Jianzhen',
      religionId: buddhismId,
      dates: '688-763',
      title: '日本律宗初祖',
      school: '律宗',
      generation: 8,
      teacherId: null,
      biography: '鉴真，扬州江阳（今江苏扬州）人，俗姓淳于。十四岁出家于扬州大明寺，遍学三藏，尤精律学，为南山律宗正统传人。天宝元年（742）受日本僧荣叡、普照之邀，决意东渡传律。先后六次尝试，历经十二年艰辛——遭官府阻拦、遇台风、船毁、弟子亡、双目失明。天宝十二年（753）第六次终于成功抵达日本。754年于奈良东大寺建戒坛，为天皇、皇后、皇太子及僧尼四百余人授戒。后建唐招提寺为传律道场。天平宝字七年（763）示寂于唐招提寺。其东渡事迹为中日佛教文化交流最伟大的篇章。',
      coreTeaching: '传戒弘律，不畏艰难——"是为法事也，何惜身命！诸人不去，我即去耳！"以生命诠释弘法利生之大愿。',
      achievements: '日本律宗初祖。六次东渡（五败一成），双目失明仍不退初心。在日本东大寺建戒坛传律，授戒440余僧、80余尼。创建唐招提寺，传播南山律学。中日佛教文化交流史上最伟大的先驱。其精神被誉为"舍身求法"的典范。',
      templeNames: [
        { name: '扬州大明寺', nameEn: 'Daming Temple', role: '出家驻锡', location: '江苏扬州' },
        { name: '奈良唐招提寺', nameEn: 'Toshodai-ji', role: '创建', location: '日本奈良' },
        { name: '奈良东大寺', nameEn: 'Todai-ji', role: '建戒坛传律', location: '日本奈良' },
      ],
      koans: [
        { title: '六次东渡', content: '鉴真六次东渡，前五次皆败。或遭官阻，或遇台风，弟子祥彦客死异乡，荣叡病亡途中，鉴真双目失明。有人劝止，鉴真曰："是为法事也，何惜身命！"第六次终于成功。', source: '唐大和上东征传' },
        { title: '东大寺传戒', content: '天平胜宝六年（754），鉴真于东大寺卢舍那大佛殿前设戒坛，为天皇、皇后等授菩萨戒，为四百余僧授具足戒。日本始有正式受戒之法。', source: '唐大和上东征传' },
      ],
      classicQuotes: ['是为法事也，何惜身命！诸人不去，我即去耳', '山川异域，风月同天'],
      works: [],
      imageUrl: null,
    },
  });

  // === 律宗第9世: 允堪律师 ===
  await prisma.patriarch.create({
    data: {
      name: '允堪律师',
      nameEn: 'Yunkan',
      religionId: buddhismId,
      dates: '1005-1061',
      title: '会正宗主',
      school: '律宗',
      generation: 9,
      teacherId: null,
      biography: '允堪，北宋律学复兴者，住杭州西湖菩提寺。宋仁宗庆历至皇祐年间（1041-1053）弘法。对南山三大部（行事钞/戒本疏/羯磨疏）逐一作注，著"十本记"：《行事钞会正记》《戒本疏发挥记》《羯磨疏正源记》等十部注释。在杭州、苏州、秀州广设戒坛，每年授戒数百人。其注释学派被称为"会正宗"。嘉祐六年（1061）示寂。',
      coreTeaching: '南山律学注释——对道宣三大部逐一作注，以"会正"为宗旨，融通异说，恢复南山律学正义。',
      achievements: '北宋律学复兴之首功。著"十本记"注释南山三大部，使数百年来晦涩难解的律典重新可读。于江南广设戒坛传律。其"会正宗"与元照"资持宗"并立，推动宋代律学繁荣。',
      templeNames: [{ name: '杭州菩提寺', nameEn: 'Puti Temple', role: '弘法', location: '浙江杭州西湖' }],
      koans: [],
      classicQuotes: ['会通诸说，以正南山'],
      works: [
        { title: '行事钞会正记', description: '南山行事钞注释' },
        { title: '戒本疏发挥记', description: '南山戒本疏注释' },
        { title: '羯磨疏正源记', description: '南山羯磨疏注释' },
      ],
      imageUrl: null,
    },
  });

  // === 律宗第10世: 元照律师 ===
  await prisma.patriarch.create({
    data: {
      name: '元照律师',
      nameEn: 'Yuanzhao',
      religionId: buddhismId,
      dates: '1048-1116',
      title: '灵芝律师',
      school: '律宗',
      generation: 10,
      teacherId: null,
      biography: '元照，余杭（今浙江杭州）人，号灵芝。天资颖悟，精研南山律学。初学允堪之"会正"学说，后发现允堪注释有未尽之处，遂独立著述，对南山三大部重新作注。著"灵芝三记"：《资持记》（注行事钞）、《行宗记》（注戒本疏）、《济缘记》（注羯磨疏）。其注释精审详尽，被誉为"正本清源"之作。"资持宗"因此形成，影响远超会正宗，成为后世学习南山律学的标准教材。政和六年（1116）示寂，世寿六十九。',
      coreTeaching: '正本清源——重新精审注释南山三大部，厘清道宣原义，去除后人误解，恢复律学正脉。',
      achievements: '律宗宋代复兴的集大成者。著"灵芝三记"（资持/行宗/济缘），为南山律学最权威注释，至今仍为学律者必读。其"资持宗"成为后世律学正统。正本清源，使南山律学再度兴盛。',
      templeNames: [{ name: '杭州昭庆寺', nameEn: 'Zhaoqing Temple', role: '弘法', location: '浙江杭州' }],
      koans: [{ title: '灵芝三记', content: '元照对南山三大部逐字逐句重新注释，发现前人误解甚多。著《资持记》等三部，"正本清源"，使南山律学焕然一新。', source: '佛祖统纪' }],
      classicQuotes: ['正本清源，不可因循', '律学之要，在乎精审'],
      works: [
        { title: '资持记', description: '注释南山《行事钞》，最权威律学注释' },
        { title: '行宗记', description: '注释南山《戒本疏》' },
        { title: '济缘记', description: '注释南山《羯磨疏》' },
      ],
      imageUrl: null,
    },
  });

  // === 律宗第11世: 弘一法师 ===
  await prisma.patriarch.create({
    data: {
      name: '弘一法师',
      nameEn: 'Hongyi',
      religionId: buddhismId,
      dates: '1880-1942',
      title: '南山律宗第十一代世祖',
      school: '律宗',
      generation: 11,
      teacherId: null,
      biography: '弘一，俗名李叔同，天津人。出家前为近代中国艺术先驱——画家、音乐家、戏剧家、书法家、篆刻家、教育家。中国话剧运动创始人之一，主演《茶花女》轰动一时。1918年（三十九岁）于杭州虎跑寺剃度出家，法名演音，号弘一。出家后弃尽繁华，持律精严，专研南山律学。以二十余年心力，校勘注释南山三大部及灵芝三记，著《四分律比丘戒相表记》《南山律在家备览》等，使南山律学在断绝数百年后再度复兴。持戒之严，三千威仪、八万细行一丝不苟，被称为"重兴南山律宗"之第十一代世祖。1942年示寂于泉州温陵养老院，临终绝笔"悲欣交集"四字，为中国佛教史上最感人的遗墨之一。',
      coreTeaching: '以戒为师，持律精严——"三千威仪，八万细行"一丝不苟。将律学从古籍中复活，以身作则诠释持戒之美。',
      achievements: '南山律宗第十一代世祖，近代律宗复兴之唯一关键人物。以二十余年专研南山律学，校勘注释，使断绝数百年的律宗学脉得以延续。出家前为近代文化先驱（李叔同），其出家修律的传奇经历感召无数后学。著《戒相表记》为律学入门经典。临终"悲欣交集"四字成为绝响。',
      templeNames: [
        { name: '杭州虎跑寺', nameEn: 'Hupao Temple', role: '剃度出家', location: '浙江杭州' },
        { name: '泉州开元寺', nameEn: 'Kaiyuan Temple', role: '晚年弘律', location: '福建泉州' },
        { name: '泉州承天寺', nameEn: 'Chengtian Temple', role: '讲律', location: '福建泉州' },
      ],
      koans: [
        { title: '悲欣交集', content: '弘一法师临终前，以颤抖之手写下"悲欣交集"四字。悲者，悲众生之苦；欣者，欣往生之乐。此四字遂成中国佛教史上最感人的遗墨。', source: '弘一大师年谱' },
        { title: '华枝春满', content: '弘一法师临终偈："君子之交，其淡如水。执象而求，咫尺千里。问余何适，廓尔忘言。华枝春满，天心月圆。"', source: '弘一大师年谱' },
      ],
      classicQuotes: ['华枝春满，天心月圆', '悲欣交集', '以戒为师', '不为自己求安乐，但愿众生得离苦'],
      works: [
        { title: '四分律比丘戒相表记', description: '律学入门经典，以表格形式系统整理比丘戒律' },
        { title: '南山律在家备览', description: '为在家居士编写的律学读本' },
        { title: '南山三大部校勘', description: '对南山三大部及灵芝三记的校勘注释' },
      ],
      imageUrl: null,
    },
  });

  const vinayaCount = 11;
  console.log(`  ✓ ${vinayaCount} Vinaya school patriarchs created`);

  // ── 4f. 天台宗祖师 (Tiantai School Patriarchs) ──
  console.log('Creating Tiantai school patriarchs...');

  await prisma.patriarch.create({
    data: {
      name: '龙树菩萨', nameEn: 'Nagarjuna', religionId: buddhismId,
      dates: '约150-250', title: '天台初祖', school: '天台宗', generation: 1, teacherId: null,
      biography: '龙树（梵文Nāgārjuna），南印度人，大乘佛教最重要的论师之一。出身婆罗门种姓，少年博学多闻，后出家修行，得大龙菩萨引入龙宫，于龙宫中读《华严经》等大乘经典，遂弘扬大乘。著《中论》《大智度论》《十二门论》等，建立中观学说（空宗），以"八不中道"破一切执著。其思想为天台宗止观双修的理论源头，智者大师依其《大智度论》建立一心三观之说。被尊为"八宗共祖"——禅宗、天台、华严、三论、净土、密宗、律宗、法相诸宗皆推为祖师。',
      coreTeaching: '中观——"不生不灭，不常不断，不一不异，不来不去"八不中道，破一切执著，显示诸法实相。',
      achievements: '大乘佛教最伟大的论师，"八宗共祖"。著《中论》建立中观学说，《大智度论》百卷为大乘佛教百科全书。其中观思想为天台止观、三论中观、禅宗心法的共同理论源泉。',
      templeNames: [{ name: '龙树菩萨道场', nameEn: 'Nagarjuna Monastery', role: '弘法', location: '南印度' }],
      koans: [{ title: '八不中道', content: '不生亦不灭，不常亦不断，不一亦不异，不来亦不出。能说是因缘，善灭诸戏论。', source: '中论·观因缘品' }],
      classicQuotes: ['不生亦不灭，不常亦不断，不一亦不异，不来亦不出', '因缘所生法，我说即是空，亦为是假名，亦是中道义', '众因缘生法，我说即是无，亦为是假名，亦是中道义'],
      works: [
        { title: '中论', description: '四卷，中观学派根本论典，以"八不"破一切执著' },
        { title: '大智度论', description: '百卷，大乘佛教百科全书' },
        { title: '十二门论', description: '中观入门著作' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '慧文禅师', nameEn: 'Huiwen', religionId: buddhismId,
      dates: '约550年活跃', title: '天台二祖', school: '天台宗', generation: 2, teacherId: null,
      biography: '慧文，北齐高僧，生平事迹不详。读龙树《大智度论》中"三智一心中得"之语及《中论》"因缘所生法"偈，豁然大悟，悟得"一心三观"——空、假、中三观于一念心中同时成立。此悟成为天台宗止观法门的核心理论基础。以此观法授慧思，慧思传智顗，遂开天台一宗。',
      coreTeaching: '一心三观——空观、假观、中观三观于一念心中同时成立，非前后次第。',
      achievements: '天台宗二祖。读《大智度论》悟"一心三观"，为天台止观法门奠定理论基础。虽生平不详，但其一心三观之悟对中国佛教影响深远。',
      templeNames: [], koans: [{ title: '一心三观', content: '慧文读《大智度论》"三智一心中得"，又读《中论》"因缘所生法，我说即是空，亦为是假名，亦是中道义"，豁然大悟，悟一心三观。', source: '佛祖统纪' }],
      classicQuotes: ['三智一心中得'], works: [], imageUrl: null,
    },
  });

  const huisiTT = await prisma.patriarch.create({
    data: {
      name: '慧思大师', nameEn: 'Huisi', religionId: buddhismId,
      dates: '515-577', title: '南岳慧思', school: '天台宗', generation: 3, teacherId: null,
      biography: '慧思，武津（今河南上蔡）人。十五岁出家，苦行修定。后从慧文禅师学一心三观。于光州大苏山定中悟得法华三昧，深达实相之理。后南下至南岳衡山弘法，称"南岳大师"。其弟子智顗承其法门，建立天台宗教观体系。陈太建九年（577）示寂于南岳，世寿六十三。其《大乘止观法门》为天台止观的重要先驱。',
      coreTeaching: '法华三昧——依《法华经》修止观，悟诸法实相，定慧双修。',
      achievements: '天台宗三祖。于大苏山悟法华三昧，传授智顗止观法门。著《大乘止观法门》为天台止观先驱。居南岳弘法，门下培养出天台宗实际创始人智者大师。',
      templeNames: [{ name: '南岳福严寺', nameEn: 'Fuyan Temple', role: '驻锡弘法', location: '湖南衡山' }, { name: '大苏山', nameEn: 'Dasu Mountain', role: '悟道', location: '河南光山' }],
      koans: [{ title: '法华三昧', content: '慧思于大苏山入定，修法华三昧。经三七日，于定中见灵山一会俨然未散，遂悟法华经旨。', source: '续高僧传' }],
      classicQuotes: ['诸法实相，非定非慧，定慧一如'],
      works: [{ title: '大乘止观法门', description: '天台止观先驱著作' }, { title: '法华经安乐行义', description: '法华修行指导' }],
      imageUrl: null,
    },
  });

  const zhiyiTT = await prisma.patriarch.create({
    data: {
      name: '智顗大师', nameEn: 'Zhiyi', religionId: buddhismId,
      dates: '538-597', title: '天台智者', school: '天台宗', generation: 4, teacherId: huisiTT.id,
      biography: '智顗，字德安，荆州华容（今湖南华容）人，俗姓陈。十八岁出家，师从慧思大师于大苏山学止观。后入天台山，于华顶峰修止观，大悟"一念三千"之理。建国清寺，在此讲经弘法三十余年。创立天台宗完整教观体系：以"五时八教"判释全部佛经，以"一心三观""一念三千"为核心义理，以《摩诃止观》为修行指南。隋炀帝（杨广）受其菩萨戒，赐号"智者大师"。开皇十七年（597）示寂于天台山，世寿六十。其著述被称为"天台三大部"和"天台五小部"，为中国佛教最完整的教观体系。',
      coreTeaching: '一念三千——一念心中具足三千世界一切法。止观双修，定慧等持。五时八教判释一切佛法。',
      achievements: '天台宗实际创始人（四祖但为建宗者）。创立中国佛教第一个完整教观体系。著"天台三大部"（法华玄义/法华文句/摩诃止观）。以"五时八教"统摄全部佛经。隋炀帝赐号"智者大师"。中国佛教史上最伟大的思想家之一。',
      templeNames: [
        { name: '天台山国清寺', nameEn: 'Guoqing Temple', role: '创建弘法', location: '浙江天台' },
        { name: '玉泉寺', nameEn: 'Yuquan Temple', role: '讲经', location: '湖北当阳' },
      ],
      koans: [
        { title: '一念三千', content: '一念心起，即具十界、百界、千如、三千世界。心即一切法，一切法即心。非前非后，一时俱足。', source: '摩诃止观' },
        { title: '止观双修', content: '止即是观，观即是止。非定非慧，即定即慧。如目足相资，不可偏废。', source: '摩诃止观' },
      ],
      classicQuotes: ['一念三千，诸法实相', '止观不二，定慧等持', '为菩提道，求正法眼'],
      works: [
        { title: '摩诃止观', description: '二十卷，天台止观修行指南，三大部之一' },
        { title: '法华玄义', description: '二十卷，法华经义理总论，三大部之一' },
        { title: '法华文句', description: '二十卷，法华经逐句注释，三大部之一' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '灌顶大师', nameEn: 'Guanding', religionId: buddhismId,
      dates: '561-632', title: '章安灌顶', school: '天台宗', generation: 5, teacherId: zhiyiTT.id,
      biography: '灌顶，字法云，临海章安（今浙江台州）人。少年出家，师事智者大师二十余年，尽得其法。智顗所说"天台三大部"及诸部著述，皆由灌顶笔录整理而成。智顗圆寂后，灌顶继承法席，住国清寺弘法。著《涅槃玄义》《涅槃经疏》等。贞观六年（632）示寂，世寿七十二。若无灌顶之笔录，天台教典将无法传世。',
      coreTeaching: '继承师法，笔录整理——智者大师一生口述教法，赖灌顶笔录传世。',
      achievements: '天台宗五祖。笔录整理智者大师全部口述著作（三大部等），使天台教典得以传世。若无灌顶，天台宗教义体系将无法完整保存。',
      templeNames: [{ name: '天台山国清寺', nameEn: 'Guoqing Temple', role: '继承法席', location: '浙江天台' }],
      koans: [], classicQuotes: ['师之所说，不敢有遗'],
      works: [{ title: '涅槃玄义', description: '涅槃经义理总论' }, { title: '涅槃经疏', description: '涅槃经注释' }, { title: '观心论疏', description: '天台观心法门注释' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '湛然大师', nameEn: 'Zhanran', religionId: buddhismId,
      dates: '711-782', title: '荆溪湛然', school: '天台宗', generation: 6, teacherId: null,
      biography: '湛然，常州荆溪（今江苏宜兴）人，俗姓戚。初习儒学，十七岁从天台宗玄朗法师出家，尽得天台教观真传。时值唐代禅宗、华严宗大兴，天台宗势微。湛然以"无情有性"（草木瓦石皆有佛性）之说，发展天台教义，著《止观辅行传弘决》等，中兴天台宗。被誉为天台宗中兴之祖。建中三年（782）示寂，世寿七十二。其学说后传至日本，影响日本天台宗。',
      coreTeaching: '无情有性——草木瓦石、山河大地皆有佛性，一切法皆具实相。中兴天台教观。',
      achievements: '天台宗中兴之祖（六祖/九祖说法不一）。提出"无情有性"说，发展天台教义。著述丰富，使天台宗在禅宗、华严宗盛行之唐代得以延续。其学传至日本，影响最澄创立日本天台宗。',
      templeNames: [{ name: '天台山国清寺', nameEn: 'Guoqing Temple', role: '弘法', location: '浙江天台' }],
      koans: [{ title: '无情有性', content: '若言无情无佛性，则是将心限于有情，不知一色一香无非中道。瓦石草木皆是法身，何物不具佛性？', source: '金刚錍' }],
      classicQuotes: ['一色一香，无非中道', '无情有性，万法唯心'],
      works: [
        { title: '止观辅行传弘决', description: '摩诃止观注释，天台止观最重要辅助著作' },
        { title: '法华玄义释签', description: '法华玄义注释' },
        { title: '金刚錍', description: '论证"无情有性"' },
      ],
      imageUrl: null,
    },
  });

  const tiantaiCount = 6;
  console.log(`  ✓ ${tiantaiCount} Tiantai school patriarchs created`);

  // ── 4g. 华严宗祖师 (Huayan School Patriarchs) ──
  console.log('Creating Huayan school patriarchs...');

  const dushunHY = await prisma.patriarch.create({
    data: {
      name: '杜顺和尚', nameEn: 'Dushun', religionId: buddhismId,
      dates: '557-640', title: '帝心尊者', school: '华严宗', generation: 1, teacherId: null,
      biography: '杜顺，雍州万年（今陕西西安）人，俗姓杜。十八岁出家，师从因圣寺僧珍禅师。专修华严法界观，以禅定见长。唐太宗敬其德行，赐号"帝心"。著《华严法界观门》，首创"真空绝相观""理事无碍观""周遍含容观"三重法界观，奠定华严宗法界缘起思想的基础。贞观十四年（640）示寂，世寿八十四。',
      coreTeaching: '法界三观——真空绝相观（空观）、理事无碍观（事理圆融）、周遍含容观（事事无碍），层层深入，显示华严法界缘起之妙理。',
      achievements: '华严宗初祖。著《华严法界观门》创立三重法界观。唐太宗赐号"帝心"。为华严宗法界缘起思想奠基。',
      templeNames: [{ name: '终南山至相寺', nameEn: 'Zhixiang Temple', role: '驻锡', location: '陕西终南山' }],
      koans: [{ title: '法界三观', content: '一真空绝相观：会色归空，明空即色，空色无碍。二理事无碍观：理遍于事，事遍于理。三周遍含容观：一即一切，一切即一，重重无尽。', source: '华严法界观门' }],
      classicQuotes: ['一即一切，一切即一', '法界缘起，重重无尽'],
      works: [{ title: '华严法界观门', description: '华严三重法界观，华严宗根本著作' }, { title: '华严五教止观', description: '五教判教与止观' }],
      imageUrl: null,
    },
  });

  const zhiyanHY = await prisma.patriarch.create({
    data: {
      name: '智俨大师', nameEn: 'Zhiyan', religionId: buddhismId,
      dates: '602-668', title: '至相大师', school: '华严宗', generation: 2, teacherId: dushunHY.id,
      biography: '智俨，天水（今甘肃天水）人。十二岁从杜顺出家，深研华严。后参学于智正法师处学华严经，于华严经义豁然贯通。著《华严经搜玄记》，提出"十玄门"学说——以十种玄妙法门解释华严法界缘起、事事无碍的道理。居终南山至相寺弘法，号"至相大师"。其弟子法藏继承其学，完成华严宗教理体系。总章元年（668）示寂，世寿六十七。',
      coreTeaching: '十玄门——以十种玄妙法门揭示华严法界中一切事物相即相入、重重无尽的缘起关系。',
      achievements: '华严宗二祖。提出"十玄门"学说，为华严宗核心教理。著《搜玄记》系统注疏华严经。培养弟子法藏，使华严宗教理最终完备。',
      templeNames: [{ name: '终南山至相寺', nameEn: 'Zhixiang Temple', role: '驻锡弘法', location: '陕西终南山' }],
      koans: [{ title: '十玄门', content: '一同时具足相应门，二因陀罗网境界门，三秘密隐显俱成门……十主伴圆明具德门。十玄互摄，重重无尽。', source: '华严经搜玄记' }],
      classicQuotes: ['一多相即，主伴圆融'],
      works: [{ title: '华严经搜玄记', description: '华严经注疏，提出十玄门' }, { title: '华严一乘十玄门', description: '十玄门专论' }],
      imageUrl: null,
    },
  });

  const fazangHY = await prisma.patriarch.create({
    data: {
      name: '法藏大师', nameEn: 'Fazang', religionId: buddhismId,
      dates: '643-712', title: '贤首国师', school: '华严宗', generation: 3, teacherId: zhiyanHY.id,
      biography: '法藏，康居国（中亚）人后裔，祖籍长安，字贤首。十七岁于太白山求法，后从智俨学华严。智俨圆寂后，法藏完成华严宗完整教理体系。创立"五教十宗"判教体系——小教、始教、终教、顿教、圆教，以华严为圆教之极致。提出"六相圆融"与完善"十玄缘起"学说。武则天令其讲华严经，法藏以金狮子为喻，说一多相即之理，武则天豁然开悟。则天赐号"贤首"，故华严宗又称"贤首宗"。先天元年（712）示寂，世寿七十。',
      coreTeaching: '法界缘起，六相圆融——一切事物具总相、别相、同相、异相、成相、坏相六相，互不相碍，圆融无碍。五教十宗判释一切佛法。',
      achievements: '华严宗三祖，实际教理体系完成者。创立"五教十宗"判教体系。完善十玄缘起、六相圆融学说。以"金狮子章"为武则天说法，成为佛教史上著名的教学范例。华严宗因其号"贤首"而又称"贤首宗"。',
      templeNames: [{ name: '长安荐福寺', nameEn: 'Jianfu Temple', role: '弘法', location: '陕西长安' }, { name: '华严寺', nameEn: 'Huayan Temple', role: '讲经', location: '陕西长安' }],
      koans: [
        { title: '金狮子章', content: '以金铸狮子为喻：金无自性，随工匠缘成狮子；金即狮子，狮子即金。以此说明理事无碍、事事无碍之义。武则天闻之豁然。', source: '华严金狮子章' },
        { title: '六相圆融', content: '一总相、二别相、三同相、四异相、五成相、六坏相。六相互融，举一全收。', source: '华严一乘教义分齐章' },
      ],
      classicQuotes: ['理事无碍，事事无碍', '一即一切，一切即一，圆融自在'],
      works: [
        { title: '华严金狮子章', description: '以金狮子喻华严法界，佛教经典教学范例' },
        { title: '华严一乘教义分齐章', description: '华严宗教理体系总纲' },
        { title: '华严经探玄记', description: '二十卷，华严经注疏' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '澄观大师', nameEn: 'Chengguan', religionId: buddhismId,
      dates: '738-839', title: '清凉国师', school: '华严宗', generation: 4, teacherId: fazangHY.id,
      biography: '澄观，越州山阴（今浙江绍兴）人，字大休。十一岁出家，遍学三藏，兼通儒道。以华严为宗，住五台山清凉寺四十年，号"清凉国师"。著《华严经疏》六十卷、《随疏演义钞》九十卷，合称"华严疏钞"，为华严经注释的集大成之作。历唐代宗、德宗、顺宗、宪宗、穆宗、敬宗、文宗七朝，皆为国师。开成四年（839）示寂，世寿一百零二岁（一说九十七），为中国佛教史上最长寿的高僧之一。',
      coreTeaching: '华严法界——以四法界（事法界/理法界/理事无碍法界/事事无碍法界）统摄华严教理。',
      achievements: '华严宗四祖。著"华严疏钞"（疏六十卷+钞九十卷）为华严经注释集大成之作。历七朝国师，寿逾百岁。住五台山清凉寺四十年，使五台山成为华严圣地。',
      templeNames: [{ name: '五台山清凉寺', nameEn: 'Qingliang Temple', role: '驻锡四十年', location: '山西五台山' }],
      koans: [{ title: '四法界', content: '一事法界：万象差别。二理法界：平等真如。三理事无碍法界：理融于事，事彻于理。四事事无碍法界：一一事物互融互摄，重重无尽。', source: '华严经疏' }],
      classicQuotes: ['事事无碍，重重无尽', '一真法界，圆融自在'],
      works: [
        { title: '华严经疏', description: '六十卷，华严经注疏集大成' },
        { title: '随疏演义钞', description: '九十卷，华严经疏的进一步注释' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '宗密大师', nameEn: 'Zongmi', religionId: buddhismId,
      dates: '780-841', title: '圭峰宗密', school: '华严宗', generation: 5, teacherId: null,
      biography: '宗密，果州西充（今四川西充）人，俗姓何。初习儒学，后出家。先于荷泽宗参禅得法，后读澄观之《华严经疏》，遂投澄观门下学华严。兼通禅教，主张"禅教一致"——禅宗与教下（天台、华严等）本质相同，只是入门方式不同。著《原人论》融会儒释道三教，著《禅源诸诠集都序》统摄禅教诸宗。住终南山圭峰草堂寺，号"圭峰禅师"。会昌元年（841）示寂，世寿六十二。',
      coreTeaching: '禅教一致——禅宗与教下（天台/华严等）本无差别，皆归一真法界。三教会通，融合儒释道。',
      achievements: '华严宗五祖。主张"禅教一致"，融通禅宗与华严教理。著《原人论》会通儒释道三教。著《禅源诸诠集都序》统摄禅宗各派。为中国佛教"禅教融合"的先驱。',
      templeNames: [{ name: '终南山草堂寺', nameEn: 'Caotang Temple', role: '驻锡弘法', location: '陕西户县' }],
      koans: [{ title: '禅教一致', content: '禅者，佛之心也；教者，佛之口也。心口不相违，禅教岂有异？达磨以心传心，如来以口说法，同一佛法。', source: '禅源诸诠集都序' }],
      classicQuotes: ['禅是佛心，教是佛口', '三教本一，归于至善'],
      works: [
        { title: '原人论', description: '会通儒释道三教之论' },
        { title: '禅源诸诠集都序', description: '统摄禅宗各派之总序' },
        { title: '华严原人论', description: '以华严教理论人性' },
      ],
      imageUrl: null,
    },
  });

  const huayanCount = 5;
  console.log(`  ✓ ${huayanCount} Huayan school patriarchs created`);

  // ── 4h. 法相宗/唯识宗祖师 (Faxiang/Yogacara School Patriarchs) ──
  console.log('Creating Faxiang school patriarchs...');

  const xuanzangFX = await prisma.patriarch.create({
    data: {
      name: '玄奘大师', nameEn: 'Xuanzang', religionId: buddhismId,
      dates: '602-664', title: '三藏法师', school: '法相宗', generation: 1, teacherId: null,
      biography: '玄奘，俗姓陈，名祎，洛州缑氏（今河南偃师）人。十三岁出家于洛阳净土寺。因感当时佛经翻译不全且有歧义，于贞观三年（629）独自西行求法。经历西域、中亚，抵达印度那烂陀寺，师从戒贤论师学唯识学、因明学等五年。又遍游印度各地参学。贞观十九年（645）回到长安，携回佛经657部。此后十九年主持译经事业，翻译经论75部1335卷，为中国佛教史上最伟大的译经家。以《成唯识论》为核心创立法相宗（唯识宗），建立"万法唯识"的完整教理体系。其西行求法事迹后被演绎为《西游记》。麟德元年（664）示寂于玉华宫，世寿六十三。',
      coreTeaching: '万法唯识——一切外境皆是八识（眼耳鼻舌身意末那阿赖耶）之变现，离识无境。转识成智，转八识为四智。',
      achievements: '法相宗（唯识宗）创始人。西行求法十七年，往返五万里。译经75部1335卷，为中国佛教最伟大译经家。著《成唯识论》建立唯识学体系。创大慈恩寺译经场。其事迹被演绎为《西游记》。',
      templeNames: [
        { name: '长安大慈恩寺', nameEn: 'Dacien Temple', role: '译经弘法', location: '陕西西安' },
        { name: '玉华宫', nameEn: 'Yuhua Palace', role: '晚年译经', location: '陕西铜川' },
      ],
      koans: [
        { title: '万法唯识', content: '三界唯心，万法唯识。一切有为法皆是识之变现，无有实我实法。转染成净，即是成佛。', source: '成唯识论' },
        { title: '西行求法', content: '玄奘立誓西行，"宁可就西而死，岂能归东而生"。独自穿越八百里莫贺延碛大沙漠，四日五夜滴水未进，终达伊吾。', source: '大慈恩寺三藏法师传' },
      ],
      classicQuotes: ['宁可就西而死，岂能归东而生', '三界唯心，万法唯识', '如人饮水，冷暖自知'],
      works: [
        { title: '成唯识论', description: '十卷，唯识学集大成著作' },
        { title: '大唐西域记', description: '十二卷，西行见闻录，重要历史地理文献' },
        { title: '瑜伽师地论', description: '百卷译本，唯识学根本论典' },
      ],
      imageUrl: null,
    },
  });

  const kuijiFX = await prisma.patriarch.create({
    data: {
      name: '窥基大师', nameEn: 'Kuiji', religionId: buddhismId,
      dates: '632-682', title: '慈恩窥基', school: '法相宗', generation: 2, teacherId: xuanzangFX.id,
      biography: '窥基，京兆长安人，尉迟敬德之侄。十七岁奉敕出家，从玄奘学唯识。玄奘翻译《成唯识论》时，以窥基为主要助手。著《成唯识论述记》六十卷（现存二十卷），为唯识学最重要注疏。又著《法苑义林章》《因明入正理论疏》等。因住大慈恩寺，法相宗又称"慈恩宗"。永淳元年（682）示寂于慈恩翻经院，世寿五十一。',
      coreTeaching: '唯识学系统化——以《成唯识论述记》系统阐释唯识义理，确立八识、四分、三性等核心概念。',
      achievements: '法相宗二祖，被称为"百部论师"。著《成唯识论述记》为唯识学最权威注疏。住大慈恩寺故法相宗又称"慈恩宗"。著述等身，涵盖唯识、因明、般若等领域。',
      templeNames: [{ name: '长安大慈恩寺', nameEn: 'Dacien Temple', role: '弘法著述', location: '陕西西安' }],
      koans: [{ title: '三车和尚', content: '传说窥基出家时要求带三车随行：一车载经书，一车载酒肉，一车载歌女。后尽弃三车，专心修学。', source: '宋高僧传（传说）' }],
      classicQuotes: ['万法唯识，识外无境'],
      works: [
        { title: '成唯识论述记', description: '二十卷(存)，唯识学最权威注疏' },
        { title: '法苑义林章', description: '佛教名相辞典式著作' },
        { title: '因明入正理论疏', description: '因明学（佛教逻辑学）注释' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '慧沼大师', nameEn: 'Huizhao', religionId: buddhismId,
      dates: '651-714', title: '淄州慧沼', school: '法相宗', generation: 3, teacherId: kuijiFX.id,
      biography: '慧沼，淄州（今山东淄博）人。从窥基学唯识，尽得其传。窥基圆寂后继其法席。著《成唯识论了义灯》，与窥基《述记》、智周《演秘》并称唯识学"三大注释"。又著《因明入正理论义纂要》等。开元二年（714）示寂。',
      coreTeaching: '唯识精义——以《了义灯》阐明唯识深义，辨析诸家异说，维护窥基正统。',
      achievements: '法相宗三祖。著《成唯识论了义灯》为唯识学三大注释之一。维护并发展窥基唯识学正统。',
      templeNames: [{ name: '长安大慈恩寺', nameEn: 'Dacien Temple', role: '继承法席', location: '陕西西安' }],
      koans: [], classicQuotes: ['唯识了义，灯照幽微'],
      works: [{ title: '成唯识论了义灯', description: '唯识学三大注释之一' }, { title: '因明入正理论义纂要', description: '因明学注释' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '智周法师', nameEn: 'Zhizhou', religionId: buddhismId,
      dates: '668-723', title: '濮阳智周', school: '法相宗', generation: 4, teacherId: null,
      biography: '智周，濮阳（今河南濮阳）人。从慧沼学唯识，深研成唯识论。著《成唯识论演秘》，与窥基《述记》、慧沼《了义灯》并称唯识学"三大注释"。其后法相宗在中国渐衰，但经智周弟子传至日本、新罗，在东亚继续发展。开元十一年（723）示寂。',
      coreTeaching: '唯识演秘——以《演秘》阐发唯识隐微之义，补前人之不足。',
      achievements: '法相宗四祖。著《成唯识论演秘》为唯识学三大注释之一。其学传至日本、新罗，使唯识学在东亚继续发展。',
      templeNames: [], koans: [], classicQuotes: ['演唯识秘义，续慈恩法灯'],
      works: [{ title: '成唯识论演秘', description: '唯识学三大注释之一' }],
      imageUrl: null,
    },
  });

  const faxiangCount = 4;
  console.log(`  ✓ ${faxiangCount} Faxiang school patriarchs created`);

  // ── 4i. 密宗/真言宗祖师 (Esoteric Buddhism Patriarchs) ──
  console.log('Creating Esoteric Buddhism patriarchs...');

  const shanwuwei = await prisma.patriarch.create({
    data: {
      name: '善无畏', nameEn: 'Subhakarasimha', religionId: buddhismId,
      dates: '637-735', title: '开元三大士', school: '密宗', generation: 1, teacherId: null,
      biography: '善无畏（梵名Śubhakarasiṃha），中印度摩揭陀国人，刹帝利种姓，本为乌荼国王子。十三岁继位为王，后让位出家。师从达摩掬多学密法，得密教正统传承。开元四年（716）经中亚至长安，唐玄宗敬礼之，住兴善寺。翻译《大日经》七卷，为密教根本经典。与弟子一行共同阐释《大日经》义理，创立胎藏界密法体系。开元二十三年（735）示寂于洛阳广福寺，世寿九十九。',
      coreTeaching: '胎藏界——以《大日经》为依据，建立胎藏界曼荼罗修法体系。以大日如来为中心，展现佛的大悲胎藏。',
      achievements: '唐密开元三大士之一。译《大日经》奠定密教胎藏界理论基础。开唐代密宗之先河。与一行合作阐释密教义理。',
      templeNames: [{ name: '长安大兴善寺', nameEn: 'Daxingshan Temple', role: '译经弘法', location: '陕西西安' }],
      koans: [{ title: '大日经', content: '善无畏于大兴善寺译出《大日经》，为密教根本经典。经中说大日如来以大悲胎藏含育一切众生，故名胎藏界。', source: '开元释教录' }],
      classicQuotes: ['大日遍照，一切即一'],
      works: [{ title: '大日经', description: '七卷，密教根本经典（翻译）' }, { title: '大日经疏', description: '大日经注释（与一行合著）' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '金刚智', nameEn: 'Vajrabodhi', religionId: buddhismId,
      dates: '671-741', title: '开元三大士', school: '密宗', generation: 2, teacherId: null,
      biography: '金刚智（梵名Vajrabodhi），南印度摩赖耶国人，婆罗门种姓。十岁出家于那烂陀寺，三十一岁从龙智阿阇梨受金刚顶经密法。开元八年（720）经海路至广州，后至长安，住慈恩寺。翻译《金刚顶经》等密教经典，建立金刚界密法体系。与善无畏分别传授胎藏界和金刚界两部大法，使唐代密宗两部具足。开元二十九年（741）示寂于洛阳广福寺，世寿七十一。',
      coreTeaching: '金刚界——以《金刚顶经》为依据，建立金刚界曼荼罗修法体系。以金刚智慧破一切无明。',
      achievements: '唐密开元三大士之一。译《金刚顶经》建立金刚界密法体系。与善无畏互补，使唐密胎藏界、金刚界两部大法完备。弟子不空继其法脉。',
      templeNames: [{ name: '长安大慈恩寺', nameEn: 'Dacien Temple', role: '译经', location: '陕西西安' }],
      koans: [], classicQuotes: ['金刚不坏，智慧无碍'],
      works: [{ title: '金刚顶经', description: '密教金刚界根本经典（翻译）' }, { title: '金刚顶瑜伽中略出念诵经', description: '密教修法仪轨' }],
      imageUrl: null,
    },
  });

  const bukongES = await prisma.patriarch.create({
    data: {
      name: '不空金刚', nameEn: 'Amoghavajra', religionId: buddhismId,
      dates: '705-774', title: '开元三大士', school: '密宗', generation: 3, teacherId: null,
      biography: '不空（梵名Amoghavajra），师子国（今斯里兰卡）人，一说北印度人。十五岁从金刚智出家学密法。金刚智圆寂后，不空奉遗命往印度、师子国求法五年，广搜密教典籍。回唐后住长安大兴善寺，成为唐代最具影响力的密教大师。翻译密教经典111部143卷，位列中国四大译经家之一。先后为唐玄宗、肃宗、代宗三朝灌顶国师。门下弟子惠果继其法，后传日本空海。大历九年（774）示寂，追赠"司空"，谥"大辩正广智不空三藏"。',
      coreTeaching: '三密相应——身结印契、口诵真言、意观本尊，三密同时相应，即身成佛。',
      achievements: '唐密开元三大士之一，唐密集大成者。译经111部143卷，中国四大译经家之一。三朝灌顶国师。门下培养惠果等弟子，通过惠果传空海至日本。唐密因其而达顶峰。',
      templeNames: [{ name: '长安大兴善寺', nameEn: 'Daxingshan Temple', role: '译经弘法', location: '陕西西安' }],
      koans: [{ title: '三密加持', content: '手结印契（身密），口诵真言（语密），心观本尊（意密）。三密同时相应，凡夫即同本尊，是名即身成佛。', source: '金刚顶经' }],
      classicQuotes: ['三密相应，即身成佛', '身口意三密，与本尊无二'],
      works: [
        { title: '金刚顶一切如来真实摄大乘现证大教王经', description: '金刚界根本经典翻译' },
        { title: '仁王护国般若波罗蜜多经', description: '护国经典翻译' },
      ],
      imageUrl: null,
    },
  });

  const huiguoES = await prisma.patriarch.create({
    data: {
      name: '惠果阿阇梨', nameEn: 'Huiguo', religionId: buddhismId,
      dates: '746-805', title: '青龙惠果', school: '密宗', generation: 4, teacherId: bukongES.id,
      biography: '惠果，京兆昭应（今陕西临潼）人。九岁入不空门下学密法。二十岁受灌顶，尽得不空胎藏界、金刚界两部大法。住长安青龙寺，为唐代密宗第一道场。惠果将胎藏界与金刚界两部大法合为一体传授，为"两部一具"传法之始。永贞元年（805）日本僧空海入唐求法，惠果一见即知为法器，以三个月时间将两部大法完整传授空海。同年十二月示寂，世寿六十。空海回日本后创立真言宗，惠果遂为日本真言宗祖师。',
      coreTeaching: '两部一具——将胎藏界（大悲）与金刚界（智慧）合为一体传授，悲智双运，理智不二。',
      achievements: '唐密承前启后的关键人物。首创"两部一具"传法。住青龙寺使其成为唐密第一道场。将唐密完整传授日本空海，开日本真言宗之源。',
      templeNames: [{ name: '长安青龙寺', nameEn: 'Qinglong Temple', role: '住持弘法', location: '陕西西安' }],
      koans: [{ title: '传法空海', content: '空海入唐，至青龙寺参惠果。惠果一见即曰："我先知汝来，相待久矣！"遂以三月之间，尽传两部大法、诸尊瑜伽。', source: '大日本国弘法大师行状' }],
      classicQuotes: ['我先知汝来，相待久矣', '两部不二，悲智圆融'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '空海大师', nameEn: 'Kukai', religionId: buddhismId,
      dates: '774-835', title: '弘法大师', school: '密宗', generation: 5, teacherId: huiguoES.id,
      biography: '空海，日本赞岐国（今香川县）人，俗姓佐伯，法名空海，谥号"弘法大师"。延历二十三年（804）随遣唐使入唐，至长安青龙寺从惠果阿阇梨受两部大法灌顶。惠果将密教法脉完整传授空海，嘱其"早归东土，以此大法利益有情"。806年回日本，于高野山开创真言宗道场。创立日本真言宗（东密），建高野山金刚峰寺为总本山。又精通书法（日本书圣之一）、土木工程，创制片假名（一说）。承和二年（835）于高野山入定示寂。被尊为日本佛教最伟大的大师之一。',
      coreTeaching: '即身成佛——众生本具佛性，以三密加持，此身此世即可成佛，无需累劫修行。十住心论判教。',
      achievements: '日本真言宗（东密）创始人。从惠果受唐密完整传承。创高野山金刚峰寺为真言宗总本山。著《十住心论》《秘密曼荼罗十住心论》建立真言宗判教体系。日本文化史上最具影响力的僧人之一。',
      templeNames: [
        { name: '高野山金刚峰寺', nameEn: 'Kongobu-ji', role: '创建', location: '日本和歌山' },
        { name: '东寺/教王护国寺', nameEn: 'To-ji', role: '赐为真言道场', location: '日本京都' },
      ],
      koans: [{ title: '即身成佛', content: '六大无碍常瑜伽，四种曼荼各不离，三密加持速疾显，重重帝网名即身。', source: '即身成佛义' }],
      classicQuotes: ['六大无碍常瑜伽', '即身成佛，三密加持'],
      works: [
        { title: '十住心论', description: '十卷，真言宗判教体系' },
        { title: '即身成佛义', description: '论证即身成佛之义' },
        { title: '声字实相义', description: '真言（曼怛罗）与实相关系' },
      ],
      imageUrl: null,
    },
  });

  const esotericCount = 5;
  console.log(`  ✓ ${esotericCount} Esoteric Buddhism patriarchs created`);

  // ── 4j. 三论宗祖师 (Sanlun/Three Treatises School Patriarchs) ──
  console.log('Creating Sanlun school patriarchs...');

  const kumarajivaSL = await prisma.patriarch.create({
    data: {
      name: '鸠摩罗什', nameEn: 'Kumarajiva', religionId: buddhismId,
      dates: '344-413', title: '三论宗初祖', school: '三论宗', generation: 1, teacherId: null,
      biography: '鸠摩罗什（梵名Kumārajīva），龟兹国（今新疆库车）人，父天竺人，母龟兹公主。七岁随母出家，遍学小乘、大乘经论。后秦弘始三年（401）姚兴迎至长安，住逍遥园西明阁译经。翻译《中论》《百论》《十二门论》（合称"三论"）、《大智度论》《妙法莲华经》《金刚经》《阿弥陀经》《维摩诘经》等35部294卷。其译文流畅优美，意译为主，影响中国佛教最深。临终焚身，舌不焦烂，以证所译无误。弘始十五年（413）示寂。',
      coreTeaching: '中观般若——翻译三论（中论/百论/十二门论），以般若空观破一切执著，显示中道实相。',
      achievements: '三论宗初祖，中国四大译经家之首。译经35部294卷，《法华经》《金刚经》等至今仍为最通行版本。翻译"三论"奠定三论宗经典基础。门下三千弟子，号"关中四杰"（僧肇、道生、僧叡、道融）。临终舌不焦烂，以证所译之正。',
      templeNames: [{ name: '长安逍遥园', nameEn: 'Xiaoyao Garden', role: '主持译场', location: '陕西长安' }, { name: '草堂寺', nameEn: 'Caotang Temple', role: '译经', location: '陕西户县' }],
      koans: [{ title: '舌不焦烂', content: '鸠摩罗什临终嘱弟子："若所传无谬，使焚身之后，舌不焦烂。"果然荼毗之后，薪灭形碎，唯舌不灰。', source: '高僧传' }],
      classicQuotes: ['若所传无谬，使焚身之后，舌不焦烂', '因缘所生法，我说即是空'],
      works: [
        { title: '妙法莲华经', description: '七卷翻译，流传最广的法华经版本' },
        { title: '金刚般若波罗蜜经', description: '一卷翻译，流通最广的般若经' },
        { title: '中论', description: '四卷翻译，三论宗根本论典' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '僧肇大师', nameEn: 'Sengzhao', religionId: buddhismId,
      dates: '384-414', title: '解空第一', school: '三论宗', generation: 2, teacherId: kumarajivaSL.id,
      biography: '僧肇，京兆（今陕西西安）人。少年家贫以抄书为业，遍读经史子集。读《老子》《庄子》觉有所不足，后见旧译《维摩诘经》，欢喜曰"始知所归矣"。遂出家。后至姑臧（今甘肃武威）从鸠摩罗什学般若。参与鸠摩罗什译场，为"关中四杰"之首。著《肇论》四篇（物不迁论/不真空论/般若无知论/涅槃无名论），以魏晋玄学语言阐释般若空义，被誉为中国佛教哲学的开山之作。弘始十六年（414）示寂，年仅三十一。',
      coreTeaching: '不真空——万物非真非假，非有非无。般若之智无所知而无不知，涅槃之道超言绝相。',
      achievements: '三论宗二祖。著《肇论》四篇，以中国哲学语言完美阐释般若空观，为中国佛教哲学的开山之作。被鸠摩罗什誉为"解空第一"。虽年仅三十一岁即寂，但其哲学影响深远。',
      templeNames: [{ name: '长安逍遥园', nameEn: 'Xiaoyao Garden', role: '参与译场', location: '陕西长安' }],
      koans: [{ title: '物不迁论', content: '旋岚偃岳而常静，江河竟注而不流，野马飘鼓而不动，日月历天而不周。', source: '肇论·物不迁论' }],
      classicQuotes: ['旋岚偃岳而常静，江河竟注而不流', '般若无知，无所不知', '不真空，即万法实相'],
      works: [
        { title: '肇论', description: '四篇（物不迁/不真空/般若无知/涅槃无名），中国佛教哲学开山' },
        { title: '注维摩诘经', description: '维摩诘经注释' },
      ],
      imageUrl: null,
    },
  });

  const falangSL = await prisma.patriarch.create({
    data: {
      name: '法朗大师', nameEn: 'Falang', religionId: buddhismId,
      dates: '507-581', title: '兴皇法朗', school: '三论宗', generation: 3, teacherId: null,
      biography: '法朗，南朝梁陈时期高僧，住建康（今南京）兴皇寺。师从僧诠学三论。于兴皇寺大弘三论学，门下弟子众多，其中吉藏最为杰出。法朗之弘法使三论学从山林寺院走向都市，影响大增。为吉藏创立三论宗奠定了直接的师承基础。陈太建十三年（581）示寂。',
      coreTeaching: '中观正义——弘扬三论（中论/百论/十二门论）中观学说，以"破邪显正"为方法。',
      achievements: '三论宗重要传承人。于建康兴皇寺大弘三论学，使三论思想从山林走向都市。培养弟子吉藏，为三论宗的正式建立创造条件。',
      templeNames: [{ name: '建康兴皇寺', nameEn: 'Xinghuang Temple', role: '弘法', location: '江苏南京' }],
      koans: [], classicQuotes: ['破邪即显正，无别显正之法'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '吉藏大师', nameEn: 'Jizang', religionId: buddhismId,
      dates: '549-623', title: '嘉祥吉藏', school: '三论宗', generation: 4, teacherId: falangSL.id,
      biography: '吉藏，祖籍安息（伊朗），生于金陵（今南京）。七岁从法朗出家于兴皇寺，深研三论。隋统一后，住会稽嘉祥寺弘法，号"嘉祥大师"。后入长安，住日严寺、实际寺弘法。著《三论玄义》总括三论宗义，著《中观论疏》《百论疏》《十二门论疏》详解三论。又著《大乘玄论》《二谛义》等，建立三论宗完整教理体系。以"破邪显正""四重二谛"为核心方法，以中道实相为究竟。武德六年（623）示寂，世寿七十五。',
      coreTeaching: '破邪显正，四重二谛——以层层否定（破邪）来显示中道实相（显正）。俗谛与真谛层层递进四重，最终超越一切言说分别。',
      achievements: '三论宗集大成者（四祖/实际建宗者）。著《三论玄义》建立三论宗完整体系。注释三论（中论疏/百论疏/十二门论疏）。以"破邪显正""四重二谛"为核心方法论。三论宗因其而成为中国佛教独立宗派。',
      templeNames: [{ name: '会稽嘉祥寺', nameEn: 'Jiaxiang Temple', role: '弘法', location: '浙江绍兴' }, { name: '长安日严寺', nameEn: 'Riyan Temple', role: '弘法', location: '陕西长安' }],
      koans: [{ title: '四重二谛', content: '第一重：有为俗谛，空为真谛。第二重：有空为俗谛，非有非空为真谛。第三重：有空非有非空为俗谛，非非有非非空为真谛。第四重：前三重皆俗谛，言忘虑绝为真谛。', source: '二谛义' }],
      classicQuotes: ['破邪即显正，无别显正之法', '言忘虑绝，是第一义谛'],
      works: [
        { title: '三论玄义', description: '三论宗教理总纲' },
        { title: '中观论疏', description: '中论详细注释' },
        { title: '百论疏', description: '百论详细注释' },
        { title: '大乘玄论', description: '大乘佛教义理总论' },
      ],
      imageUrl: null,
    },
  });

  const sanlunCount = 4;
  console.log(`  ✓ ${sanlunCount} Sanlun school patriarchs created`);

  // ── 4k. 海外禅宗祖师 (Overseas Zen Patriarchs — Japan/Korea/Vietnam/Western) ──
  console.log('  Creating overseas Zen patriarchs (4k)...');

  // 查询僧璨(三祖)用于越南禅初祖师承
  const sengcan = await prisma.patriarch.findFirst({ where: { name: '僧璨' } });

  // ── 日本禅宗 (7位) ──
  const eisai = await prisma.patriarch.create({
    data: {
      name: '明庵栄西', nameEn: 'Myōan Eisai', religionId: buddhismId,
      dates: '1141-1215', title: '千光国師', school: '日本禅宗', generation: 1,
      teacherId: null,
      biography: '明庵栄西，日本临济宗初祖。二度入宋求法，绍熙二年（1191）归国传禅。于博多建圣福寺（日本最初禅院），后建京都建仁寺为临济宗大本山。同时将宋茶文化传入日本，著《喫茶养生记》，被尊为"茶祖"。�的禅法融合天台密教，开日本禅宗先河。',
      coreTeaching: '兴禅护国。主张禅法可以护佑国家、净化人心。将临济宗公案体系与日本本土文化融合，开创日本禅文化。',
      achievements: '日本临济宗初祖。二度入宋学禅，建京都建仁寺为日本禅宗大本山。传入宋茶文化，著《喫茶养生记》，兼为日本茶道之祖。禅法融合密教，影响深远。',
      templeNames: ['建仁寺(京都)', '圣福寺(博多)', '寿福寺(�的�的)'],
      koans: [
        { title: '喫茶去', description: '以茶入禅，万法归一。栄西将宋茶禅一味传入日本。' },
        { title: '兴禅护国', description: '禅法非仅个人解脱，亦为国家安宁之根本。' },
      ],
      classicQuotes: ['大宋传来喫茶法，养生延年第一功', '参禅之要，在于见性'],
      works: [
        { title: '兴禅护国论', description: '倡导禅宗对日本国家与社会的价值' },
        { title: '喫茶养生记', description: '日本最早的茶书，茶禅一味' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '道元禅師', nameEn: 'Dōgen Zenji', religionId: buddhismId,
      dates: '1200-1253', title: '承阳大師', school: '日本禅宗', generation: 2,
      teacherId: rujing.id,
      biography: '道元禅師，日本曹洞宗开祖。嘉禄三年（1227）入宋，师事天童如净禅師得法。归国后著《正法眼藏》九十五卷，为日本佛教哲学最高峰。于越前（福井）创建永平寺，强调"只管打坐"（只管打坐即悟道本身），确立日本曹洞宗修行体系。一生不求权势，隐于深山专注修行与著述。',
      coreTeaching: '只管打坐（しかんたざ）。坐禅不是获得悟道的手段，坐禅本身即是悟道。修证一等——修行与证悟不二。身心脱落，当下即是。',
      achievements: '日本曹洞宗开祖。师承天童如净，将曹洞禅法完整传入日本。著《正法眼藏》九十五卷，为日本佛教最伟大的哲学著作。创建永平寺，至今仍为曹洞宗大本山。提出"只管打坐"理念影响全球禅修。',
      templeNames: ['永平寺(福井)', '兴圣寺(京都宇治)'],
      koans: [
        { title: '身心脱落', description: '天童如净一喝"身心脱落！"道元大悟。非去除身心，而是放下对身心的执着。' },
        { title: '只管打坐', description: '坐禅即佛行。不为求悟，不为得果，只是端坐——这本身就是觉醒的表现。' },
        { title: '有时', description: '《正法眼藏·有时》：山是时，海是时。存在即时间，时间即存在。' },
      ],
      classicQuotes: ['身心脱落，脱落身心', '修证一等', '春花秋月夏杜鹃，冬雪寒洌亦清然'],
      works: [
        { title: '正法眼藏', description: '九十五卷，日本佛教哲学最高峰' },
        { title: '永平广录', description: '道元法语与上堂开示全集' },
        { title: '典座教训', description: '以做饭为修行——禅与日常生活' },
        { title: '普劝坐禅仪', description: '坐禅入门指南，面壁端坐法' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '瑩山紹瑾', nameEn: 'Keizan Jōkin', religionId: buddhismId,
      dates: '1268-1325', title: '常済大師', school: '日本禅宗', generation: 3,
      teacherId: null,
      biography: '瑩山紹瑾，日本曹洞宗太祖（与道元并称"两祖"）。道元三传弟子。创建总持寺（横浜�的仓），使曹洞宗从精英修行走向民间普及。融合密教仪轨和民间信仰，让曹洞禅法深入日本社会各阶层。其努力使曹洞宗成为日本最大的禅宗宗派（约15000寺院）。',
      coreTeaching: '禅法民间化。将道元严格的只管打坐与民间信仰、密教仪轨融合，让禅法不再局限于精英修行者，而深入农民、武士、商人各阶层。',
      achievements: '日本曹洞宗太祖。创建总持寺（与永平寺并列两大本山）。将曹洞禅法民间化、大众化，使其从精英修行扩展到全社会。曹洞宗今有约15000座寺院，为日本最大禅宗，瑩山功不可没。',
      templeNames: ['総持寺(横浜)', '永光寺(石川)'],
      koans: [],
      classicQuotes: ['一日不作一日不食', '佛法不离世间觉'],
      works: [
        { title: '传光录', description: '记录禅宗五十三代祖师悟道因缘' },
        { title: '坐禅用心记', description: '坐禅指南，对初学者的修行指导' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '大燈国師', nameEn: 'Daitō Kokushi', religionId: buddhismId,
      dates: '1282-1337', title: '大燈国師', school: '日本禅宗', generation: 4,
      teacherId: null,
      biography: '宗峰妙超，号大燈国師，日本临济宗大德寺派开山祖师。得大应国師传法后，隐于京都五条桥下乞丐群中二十年修行。后奉花园天皇敕命建大德寺。临终坐脱时以病腿强行结跏趺坐，折断病腿以示决意。大德寺后成为日本茶道、书道、花道之中心，影响日本文化至深。',
      coreTeaching: '禅即日常。隐于乞丐中修行二十年，示禅法不在庙堂高阁而在日常生活。大德寺后发展出茶禅一味、书禅一味的日本禅文化传统。',
      achievements: '日本临济宗大德寺派开山。隐于乞丐群中二十年磨炼禅境。大德寺成为日本文化重镇——茶道（千利休）、书道、枯山水庭园、能乐皆与大德寺禅法相融。临终折腿坐脱，气概绝伦。',
      templeNames: ['大德寺(京都)'],
      koans: [
        { title: '关山拈火箸', description: '大燈国師传法关山慧玄时递火箸——以日常器物为传法之具。' },
      ],
      classicQuotes: ['坐断乾坤，截断众流', '佛法无多子，长年苦行人'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '一休宗純', nameEn: 'Ikkyū Sōjun', religionId: buddhismId,
      dates: '1394-1481', title: '狂云子', school: '日本禅宗', generation: 5,
      teacherId: null,
      biography: '一休宗純，号狂云子，日本临济宗大德寺第四十七代住持。传为后小松天皇落胤。以狂放不羁著称——饮酒食肉、出入风月、蓄发畜妾，然禅境通透、诗文超绝。华叟宗昙印可其悟，一休当众烧毁印可状。晚年奉敕重建应仁之乱后的大德寺。其"狂禅"打破形式主义，直指人心。',
      coreTeaching: '狂禅——以破戒之行体现最深禅意。形式化的持戒反成束缚，真正的自由来自内心的彻底解脱。一切分别（圣/凡、净/秽、僧/俗）皆是妄想。',
      achievements: '日本禅宗最传奇人物。以"狂禅"打破僵化禅门形式。重建大德寺。汉诗集《狂云集》为日本禅文学最高峰。弟子珠光创立侘茶，催生日本茶道。后世动画"聪明的一休"即以其为原型。',
      templeNames: ['大德寺(京都)', '酬恩庵一休寺(京田边)'],
      koans: [
        { title: '风月无边', description: '一休出入花街柳巷时说"风月无边，此中有禅"——超越净秽分别。' },
        { title: '烧毁印可', description: '老师给印可证明开悟，一休当场烧掉——真悟不需文字证明。' },
      ],
      classicQuotes: ['诸佛不入涅槃，众生不上菩提', '有漏路从此闭，无漏路从此开', '门松は冥土の旅の一里塚'],
      works: [
        { title: '狂云集', description: '汉诗集，日本禅文学巅峰' },
        { title: '续狂云集', description: '晚年诗作续编' },
        { title: '自戒集', description: '自省文集' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '白隠慧鶴', nameEn: 'Hakuin Ekaku', religionId: buddhismId,
      dates: '1686-1769', title: '正宗国師', school: '日本禅宗', generation: 6,
      teacherId: null,
      biography: '白隠慧鶴，日本临济宗中兴之祖。十五岁出家，遍参诸方。以"只手之声"公案闻名天下。重新体系化临济宗公案修行——创立"白隠系公案体系"，将数百则公案按修行阶段排列，至今日本临济宗仍沿用此体系。一生不离松蔭寺（静冈原），以平民百姓为弘法对象。兼擅禅画与书法，被誉为日本禅画巅峰。',
      coreTeaching: '只手之声——"两手相拍有声，一只手是什么声？"此公案成为日本禅修入门第一关。强调大疑之下必有大悟，参禅必须生起彻骨大疑。',
      achievements: '日本临济宗中兴之祖。创立白隠系公案体系（至今日本临济宗标准修行法）。"只手之声"为世界最知名公案之一。禅画书法堪称日本禅艺术巅峰。一切现代日本临济宗禅僧皆为其法嗣。',
      templeNames: ['松蔭寺(静冈)'],
      koans: [
        { title: '只手之声', description: '两手相拍有声。且听一只手的声音——让思维停顿，直入无分别智。' },
        { title: '本来面目', description: '父母未生之前，你的本来面目是什么？直指心源。' },
      ],
      classicQuotes: ['衆生本来佛也', '大疑之下必有大悟', '坐禅和讃：此处即莲华国，此身即佛'],
      works: [
        { title: '坐禅和讃', description: '坐禅赞歌，日本禅修最广传颂的偈文' },
        { title: '毒語心経', description: '以毒舌解读般若心经' },
        { title: '远罗天釜', description: '以书信形式的禅修指南' },
        { title: '壁生草', description: '自传体修行记录' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '鈴木大拙', nameEn: 'D.T. Suzuki', religionId: buddhismId,
      dates: '1870-1966', title: '禅学泰斗', school: '日本禅宗', generation: 7,
      teacherId: null,
      biography: '鈴木大拙（Daisetsu Teitaro Suzuki），日本佛教学者、禅学家。于镰仓圆觉寺从今北洪川、释宗演参禅得悟。1897年赴美，以英文向西方世界系统介绍禅宗。著作等身，《禅与日本文化》《禅学入门》等以英文写就，影响了海德格尔、荣格、约翰·凯奇等西方思想家。被誉为"将禅传播到西方的第一人"。',
      coreTeaching: '禅即直接经验。禅不是哲学理论，而是超越逻辑的直接生命体验。以西方哲学语言重新诠释禅宗——开创了"禅的跨文化对话"。',
      achievements: '将禅宗系统传入西方的第一人。以英文著作《禅与日本文化》《禅学入门》等影响整个20世纪西方思想界。影响海德格尔、荣格、约翰·凯奇、杰克·凯鲁亚克等巨匠。推动了20世纪60年代美国禅宗热潮。',
      templeNames: ['圆觉寺(镰仓)'],
      koans: [],
      classicQuotes: ['Before satori, chopping wood, carrying water. After satori, chopping wood, carrying water.', '禅は知識ではなく体験である'],
      works: [
        { title: 'An Introduction to Zen Buddhism', description: '禅学入门，西方禅学经典' },
        { title: 'Zen and Japanese Culture', description: '禅与日本文化，禅的文化学巨著' },
        { title: 'Essays in Zen Buddhism', description: '禅佛教论文集三卷' },
        { title: 'The Training of the Zen Buddhist Monk', description: '禅僧训练实录' },
      ],
      imageUrl: null,
    },
  });

  // ── 韩国禅宗 (4位) ──
  await prisma.patriarch.create({
    data: {
      name: '知訥', nameEn: 'Jinul (Bojo Guksa)', religionId: buddhismId,
      dates: '1158-1210', title: '普照国師', school: '韩国禅宗', generation: 1,
      teacherId: null,
      biography: '知訥，号普照国師，韩国曹溪宗实际创始人。高丽时期最伟大的禅师。提出"定慧双修、顿悟渐修"的修行体系——先顿悟心性本净，再渐修除习气。融合禅宗与华严教理，创立"禅教合一"的韩国禅宗独特传统。于松广寺组建定慧社，推动佛教改革，影响韩国佛教至今。',
      coreTeaching: '定慧双修、顿悟渐修。悟解与修行不可偏废：先以顿悟认识本心，再以渐修净除习气。禅教合一——禅宗直指与华严教理并非对立，而是互补。',
      achievements: '韩国曹溪宗实际创始人。提出"定慧双修、顿悟渐修"修行体系。融合禅教，创立韩国佛教独特传统。曹溪宗今为韩国最大佛教宗派（约10000座寺院）。',
      templeNames: ['松广寺(顺天)'],
      koans: [
        { title: '顿悟渐修', description: '一念顿悟如初生婴儿——虽已具足人形，但四肢尚须渐渐长成。' },
      ],
      classicQuotes: ['真心本来清净', '顿悟见性后，仍须渐修除习'],
      works: [
        { title: '劝修定慧结社文', description: '定慧社成立宣言，韩国佛教改革纲领' },
        { title: '真心直说', description: '直指心性的修行指南' },
        { title: '修心诀', description: '修行心要' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '休静', nameEn: 'Hyujeong (Seosan Daesa)', religionId: buddhismId,
      dates: '1520-1604', title: '西山大師', school: '韩国禅宗', generation: 2,
      teacherId: null,
      biography: '休静，号西山大師，朝鲜时代最伟大的禅师。精通儒释道三教，著《三家龟鉴》论三教会通。壬辰倭乱（1592）时年七十三岁，奉宣祖王命率僧兵五千抗倭，收复平壤。战后归山继续弘法。门下四大弟子开创朝鲜佛教四大法脉，影响延续至今。',
      coreTeaching: '三教会通——儒释道三教同归一理。禅以直指人心为本，兼融教理与念佛。出世修行与入世担当并不矛盾——国难当头，禅僧当奋起报国。',
      achievements: '朝鲜时代最伟大禅师。壬辰倭乱率五千僧兵抗倭。著《三家龟鉴》论三教会通。门下四大法脉影响韩国佛教至今。被尊为韩国佛教中兴之祖。',
      templeNames: ['兴国寺', '妙香山普贤寺'],
      koans: [],
      classicQuotes: ['儒释道三教，同出一源', '禅是佛心，教是佛语，律是佛行'],
      works: [
        { title: '三家龟鉴', description: '儒释道三教会通论' },
        { title: '禅教释', description: '禅宗与教宗关系论' },
        { title: '禅家龟鉴', description: '禅修入门指南' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '鏡虛惺牛', nameEn: 'Gyeongheo Seong-u', religionId: buddhismId,
      dates: '1849-1912', title: '鏡虛禅師', school: '韩国禅宗', generation: 3,
      teacherId: null,
      biography: '鏡虛惺牛，韩国近代禅宗复兴之父。日据时期韩国佛教衰微，鏡虛以一己之力重振禅修传统。于梵鱼寺、通度寺等地结禅堂、立清规，恢复中断百余年的禅修实践。门下弟子满韩、汉岩、慧月等人将禅法传承下去。其狂放作风酷似一休——终身不拘形式，以真修实证为本。',
      coreTeaching: '看话禅复兴。重振"话头"修行——参"什么是无？"等话头，以大疑情打破妄想。强调修行在于实证，不在于学问多少。',
      achievements: '韩国近代禅宗复兴之父。日据时期重振韩国禅修传统。培养满韩、汉岩等弟子传承法脉。现代韩国曹溪宗禅修传统皆可追溯至鏡虛。',
      templeNames: ['梵鱼寺(釜山)', '通度寺(梁山)'],
      koans: [
        { title: '万法归一', description: '万法归一，一归何处？以此话头打破一切概念执着。' },
      ],
      classicQuotes: ['修行不在多闻，在于实证', '大疑必生大悟'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '性徹', nameEn: 'Seongcheol', religionId: buddhismId,
      dates: '1912-1993', title: '退翁', school: '韩国禅宗', generation: 4,
      teacherId: null,
      biography: '性徹大宗師，韩国曹溪宗第七代宗正（最高领袖）。八年闭关长坐不卧（長坐不臥），以极端苦行闻名。提出"顿悟顿修"论挑战知訥的"顿悟渐修"——主张真正的彻悟当下即圆满，无须渐修。1981年就任宗正发表"山即是山、水即是水"法语，震动韩国社会。海印寺退居后仍被尊为韩国佛教精神领袖。',
      coreTeaching: '顿悟顿修——真正的彻悟当下圆满具足，不需要渐修补缀。"山是山，水是水"——回到最初的直接，超越一切分别与概念。',
      achievements: '韩国曹溪宗第七代宗正。提出"顿悟顿修"挑战传统。八年长坐不卧闻名。"山是山水是水"法语影响韩国社会。被尊为20世纪韩国最伟大禅师。',
      templeNames: ['海印寺(陕川)'],
      koans: [
        { title: '山是山', description: '初参时山是山；修行中山不是山；彻悟后山还是山——但已完全不同。' },
      ],
      classicQuotes: ['山是山，水是水', '真正的开悟是顿悟顿修', '自己就是佛'],
      works: [
        { title: '百日法门', description: '百日说法记录，系统阐述禅修要义' },
        { title: '本地风光', description: '法语集' },
      ],
      imageUrl: null,
    },
  });

  // ── 越南禅宗 (4位) ──
  await prisma.patriarch.create({
    data: {
      name: '毘尼多羅支', nameEn: 'Vinitaruci', religionId: buddhismId,
      dates: '?-594', title: '越南禅初祖', school: '越南禅宗', generation: 1,
      teacherId: sengcan?.id || null,
      biography: '毘尼多羅支（Vinitaruci），南印度人，中国禅宗三祖僧璨弟子。580年到达交州（今越南），于法云寺传禅。创立越南第一个禅宗流派——毘尼多羅支禅派，传承十九代约六百年。将中国禅宗与印度密教元素融合，形成越南禅宗独特风格。是越南佛教史上最重要的开创性人物。',
      coreTeaching: '禅密融合——将中国禅宗三祖僧璨的禅法与南印度密教修持融合。即心即佛，不立文字，同时包含陀罗尼与密咒修持。',
      achievements: '越南禅宗初祖。将中国禅宗传入越南，创立毘尼多羅支禅派（传承十九代600年）。禅密融合的独特风格影响越南佛教根本方向。',
      templeNames: ['法云寺(北宁)'],
      koans: [],
      classicQuotes: ['心即是佛，佛即是心'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '無言通', nameEn: 'Vô Ngôn Thông', religionId: buddhismId,
      dates: '759-826', title: '无言通禅师', school: '越南禅宗', generation: 2,
      teacherId: null,
      biography: '無言通（Vô Ngôn Thông），中国广州人，百丈怀海弟子。820年到达交州建初寺传禅。创立越南第二个禅宗流派——無言通禅派，传承十七代约五百年。禅风直截简明，承百丈"一日不作一日不食"之农禅风。其禅派与毘尼多羅支禅派并行，共同构成越南禅宗两大主脉。',
      coreTeaching: '不立文字，直指心源。承百丈怀海禅风——日常劳作即禅修。以沉默与直接体验为修行核心（无言即通）。',
      achievements: '越南第二大禅派创始人。将百丈怀海禅法传入越南。無言通禅派传承十七代约五百年。与毘尼多羅支禅派并为越南禅宗两大主脉。',
      templeNames: ['建初寺(河内)'],
      koans: [
        { title: '无言即通', description: '禅师终日无言，弟子问：为何不说法？师曰：我何曾不说？——沉默即最深的开示。' },
      ],
      classicQuotes: ['一日不作一日不食', '无言处即有大音声'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '陳仁宗', nameEn: 'Trần Nhân Tông', religionId: buddhismId,
      dates: '1258-1308', title: '竹林大士', school: '越南禅宗', generation: 3,
      teacherId: null,
      biography: '陳仁宗，越南陈朝第三代皇帝（1278-1293在位），两次击退蒙古入侵。退位后出家修行，于安子山创立竹林禅派（Trúc Lâm）——越南本土第一个禅宗流派。融合禅宗、净土与越南本土信仰。主张"居尘乐道"——在世俗生活中修行。是越南历史上唯一出家为僧的皇帝，被尊为越南佛教最伟大的本土祖师。',
      coreTeaching: '居尘乐道——不必离尘出世，在日常生活中即可修行证悟。竹林禅融合禅净，以越南语弘法（而非文言文），让佛法真正走入民间。',
      achievements: '越南本土第一个禅宗流派竹林禅派创始人。两退蒙古的英雄皇帝，退位出家。创"居尘乐道"理念。以越南语弘法开先河。被尊为越南佛教最伟大本土祖师。',
      templeNames: ['安子山(广宁)', '卧云寺', '琼林寺'],
      koans: [
        { title: '居尘乐道', description: '弟子问：如何在世间修行？帝师曰：居尘乐道——尘世即道场，何须另觅清净处？' },
      ],
      classicQuotes: ['居尘乐道，非去尘求道', '佛在心中莫远求', '身虽居朝堂，心已在山林'],
      works: [
        { title: '课虚录', description: '修行语录与开示' },
        { title: '大越史略', description: '越南史学著作' },
        { title: '居尘乐道赋', description: '以越南语写就的修行诗赋' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '一行禪師', nameEn: 'Thích Nhất Hạnh', religionId: buddhismId,
      dates: '1926-2022', title: '正念之父', school: '越南禅宗', generation: 4,
      teacherId: null,
      biography: '一行禪師（Thích Nhất Hạnh），越南临济宗第四十二代传人。越战期间投身和平运动，马丁·路德·金提名其诺贝尔和平奖。1966年流亡海外，在法国创建梅村修行社区。以"正念"（Mindfulness）为核心教导——行走坐卧皆修行。著有百余本书，将佛法以最朴素的语言传达给全世界。是继铃木大拙后对西方影响最大的亚洲禅师。2022年在越南归元寺安详示寂。',
      coreTeaching: '正念修行——每一步行走、每一次呼吸都是修行的机会。活在当下。"相即"（Interbeing）——一切事物互相依存，无独立自性。以和平、慈悲、正念将佛法应用于日常生活。',
      achievements: '当代全球最具影响力的禅师之一。创建梅村修行社区（全球最大佛教道场之一）。"正念"概念影响全球身心健康领域。百余本著作翻译成四十余语言。马丁·路德·金提名诺贝尔和平奖。',
      templeNames: ['梅村(法国)', '归元寺(越南顺化)', '鹿苑寺(美国)'],
      koans: [
        { title: '洗碗禅', description: '洗碗时只是洗碗——不想过去、不想未来。每一个动作都是完整的修行。' },
        { title: '步行禅', description: '每一步都踏在净土上。不必到达任何地方——此刻即已到达。' },
      ],
      classicQuotes: ['Breathing in, I calm my body. Breathing out, I smile.', '每一步都是到达', '没有泥巴就没有莲花'],
      works: [
        { title: 'The Miracle of Mindfulness', description: '正念的奇迹，正念修行入门经典' },
        { title: 'Being Peace', description: '成为和平，将和平融入日常' },
        { title: 'The Heart of the Buddha\'s Teaching', description: '佛陀教导的核心' },
        { title: 'No Mud, No Lotus', description: '没有泥巴就没有莲花——转化痛苦的艺术' },
      ],
      imageUrl: null,
    },
  });

  // ── 西方禅宗 (4位) ──
  await prisma.patriarch.create({
    data: {
      name: '鈴木俊隆', nameEn: 'Shunryū Suzuki', religionId: buddhismId,
      dates: '1904-1971', title: '禅心初心', school: '西方禅宗', generation: 1,
      teacherId: null,
      biography: '鈴木俊隆（Shunryū Suzuki），日本曹洞宗禅师。1959年赴美，在旧金山创建旧金山禅中心（San Francisco Zen Center）——西方第一座禅宗寺院。后创建塔萨哈拉山中禅修中心（美国第一座禅修道场）。以朴素温和的教导吸引大量美国学生。其弟子整理的《禅者的初心》（Zen Mind, Beginner\'s Mind）成为西方禅修最畅销书籍。1971年因癌症示寂，旧金山禅中心至今传承不断。',
      coreTeaching: '初心（Beginner\'s Mind）——"初学者的心有无限可能，专家的心则可能性很少。"保持初学者的开放与好奇，不被既有知识和成见束缚。只管打坐——不求特殊体验，只是坐着。',
      achievements: '西方禅宗开拓者。创建旧金山禅中心（西方第一座禅宗寺院）和塔萨哈拉禅修道场。《禅者的初心》为西方禅修最畅销经典。改变了禅从东方哲学到西方日常修行的定位。',
      templeNames: ['旧金山禅中心', '塔萨哈拉山禅修中心(加州)'],
      koans: [
        { title: '初心', description: '在初学者的心中，充满可能性；在专家的心中，可能性很少。始终保持初心。' },
      ],
      classicQuotes: ['In the beginner\'s mind there are many possibilities, but in the expert\'s there are few.', '如果你的心是空的，它就随时准备好接受任何事物'],
      works: [
        { title: 'Zen Mind, Beginner\'s Mind', description: '禅者的初心——西方禅修最畅销经典' },
        { title: 'Not Always So', description: '不总是这样——进阶禅修开示' },
        { title: 'Branching Streams Flow in the Darkness', description: '对参同契的开示' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '前角博雄', nameEn: 'Taizan Maezumi', religionId: buddhismId,
      dates: '1931-1995', title: '前角禅師', school: '西方禅宗', generation: 2,
      teacherId: null,
      biography: '前角博雄（Taizan Maezumi），日本曹洞宗僧侣。1956年赴美，于洛杉矶创建洛杉矶禅中心（Zen Center of Los Angeles, ZCLA）。独特之处在于同时持有曹洞宗和临济宗两系传法——融合两家长处。培养了数十位西方禅师（Dharma Heirs），包括Bernie Glassman、John Daido Loori、Charlotte Joko Beck等，形成美国最大的禅宗传法网络。被称为"美国禅宗的教父"。',
      coreTeaching: '曹洞临济融合——将曹洞宗的只管打坐与临济宗的公案修行结合。强调修行的日常性与深入性并重。"欣赏你的生命"（Appreciate your life）——每一刻都值得被完全体验。',
      achievements: '美国禅宗最重要的传法者之一。融合曹洞临济两系。培养数十位西方禅师形成最大传法网络。创建ZCLA。被称为"美国禅宗的教父"。',
      templeNames: ['洛杉矶禅中心(ZCLA)'],
      koans: [],
      classicQuotes: ['Appreciate your life.', 'The whole universe is your true teacher.'],
      works: [
        { title: 'Appreciate Your Life', description: '欣赏你的生命——日常禅修' },
        { title: 'The Hazy Moon of Enlightenment', description: '朦胧的悟月——禅修与开悟' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '菲利普·卡普洛', nameEn: 'Philip Kapleau', religionId: buddhismId,
      dates: '1912-2004', title: '卡普洛老师', school: '西方禅宗', generation: 3,
      teacherId: null,
      biography: '菲利普·卡普洛（Philip Kapleau），美国禅宗先驱。曾为纽伦堡审判和东京审判记者。1953年赴日在安谷白云老师座下修行十三年，得印可。1966年回美创建罗切斯特禅中心。著《禅门三柱》（The Three Pillars of Zen）——第一本以英文系统记录禅修实践的书籍。主张禅宗必须本土化——用英语举行禅修仪式，对后来西方禅宗发展影响深远。',
      coreTeaching: '禅门三柱——大信根、大疑情、大奋志。三者具足方能参禅有成。主张禅宗在西方必须本土化：用本地语言、适应本地文化、回应本地问题。',
      achievements: '西方禅宗先驱。《禅门三柱》为第一本系统记录禅修实践的英文书。创建罗切斯特禅中心。首创以英语举行禅修仪式。推动禅宗西方本土化。',
      templeNames: ['罗切斯特禅中心(纽约州)'],
      koans: [
        { title: '三柱', description: '大信根（相信自性本佛）、大疑情（以话头起疑）、大奋志（坚定不退）——三柱缺一不可。' },
      ],
      classicQuotes: ['If you want to attain enlightenment, you must be prepared to die on the cushion.'],
      works: [
        { title: 'The Three Pillars of Zen', description: '禅门三柱——西方禅修实践第一书' },
        { title: 'Zen: Merging of East and West', description: '禅：东西方的交汇' },
        { title: 'To Cherish All Life', description: '珍惜众生——禅与素食伦理' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '罗伯特·艾特肯', nameEn: 'Robert Aitken', religionId: buddhismId,
      dates: '1917-2010', title: '艾特肯老师', school: '西方禅宗', generation: 4,
      teacherId: null,
      biography: '罗伯特·艾特肯（Robert Aitken），美国禅宗大师与社会活动家。二战期间在日本战俘营中接触禅宗（与R.H. Blyth同为战俘）。战后师从中川宋渊、安谷白云修禅，得前角博雄印可。1959年于夏威夷创建钻石僧团（Diamond Sangha）。将禅修与社会正义运动结合——反战、环保、人权，开创"入世禅"（Engaged Buddhism）在西方的先河。被尊为美国禅宗元老。',
      coreTeaching: '入世禅（Engaged Buddhism）——禅悟不是逃离世界，而是更深入地参与世界。坐禅与社会正义、和平运动并行不悖。"修行即抵抗"——以正念面对不公。',
      achievements: '美国禅宗元老之一。创建钻石僧团。开创西方"入世禅"传统——将禅修与社会正义运动结合。反战、环保、人权运动的精神领袖。著有多部公案注释。',
      templeNames: ['钻石僧团(夏威夷)'],
      koans: [
        { title: '无门关注释', description: '艾特肯对无门关四十八则公案的现代西方视角注释，将古代禅法与当代生活连接。' },
      ],
      classicQuotes: ['The practice of Zen is the practice of peace.', 'Nothing is hidden.'],
      works: [
        { title: 'Taking the Path of Zen', description: '走禅之路——禅修入门' },
        { title: 'The Mind of Clover', description: '苜蓿心——禅戒伦理' },
        { title: 'The Gateless Barrier', description: '无门关注释——现代西方视角' },
        { title: 'Original Dwelling Place', description: '本来住处——禅与日常生活' },
      ],
      imageUrl: null,
    },
  });

  const overseasZenCount = 19;
  console.log(`  ✓ ${overseasZenCount} overseas Zen patriarchs created (Japan 7 + Korea 4 + Vietnam 4 + Western 4)`);

  // ── 4l. 伊斯兰教先贤 (Islamic Patriarchs/Scholars) ──
  console.log('  Creating Islamic patriarchs (4l)...');

  const islamId = religionMap['islam'];

  // Update existing Muhammad with full data + school field
  const existingMuhammad = await prisma.patriarch.findFirst({ where: { name: '先知穆罕默德' } });
  const muhammad = existingMuhammad
    ? await prisma.patriarch.update({
        where: { id: existingMuhammad.id },
        data: {
          nameEn: 'Prophet Muhammad',
          dates: '570-632',
          title: '封印先知·安拉的使者',
          school: '正统哈里发',
          generation: 1,
          biography: '穆罕默德（Muhammad），伊斯兰教创立者，被穆斯林尊为"封印先知"（最后的先知）。570年生于麦加古莱什部落。610年在希拉山洞接受天使吉卜利勒（加百列）首次启示，此后23年间陆续接受《古兰经》全部114章启示。622年从麦加迁徙至麦地那（希吉拉），建立第一个穆斯林公社（乌玛），此年定为伊斯兰历元年。630年和平收复麦加，清除克尔白天房中的偶像。632年在麦地那归真。穆罕默德不仅是宗教领袖，也是政治家、军事统帅、立法者，建立了横跨阿拉伯半岛的统一政权。其言行（圣训/哈迪斯）与《古兰经》并列为伊斯兰教法的两大源泉。',
          coreTeaching: '万物非主，唯有真主，穆罕默德是真主的使者（清真言/舍哈达）。伊斯兰五功：念（清真言）、礼（每日五番拜）、斋（拉马丹月封斋）、课（天课/济贫税）、朝（朝觐麦加）。强调认主独一（陶希德）、善行、公正、慈悯。',
          achievements: '伊斯兰教创立者。接受并传达《古兰经》114章。建立麦地那穆斯林公社（乌玛），开创政教合一的伊斯兰文明体系。统一阿拉伯半岛。其言行（圣训）成为伊斯兰教法两大源泉之一。影响全球19亿穆斯林至今。被《影响人类历史进程的100位名人》列为第一位。',
          templeNames: [
            { name: '麦加禁寺', nameEn: 'Masjid al-Haram', role: '伊斯兰第一圣地', location: '沙特阿拉伯麦加' },
            { name: '麦地那先知寺', nameEn: "Prophet's Mosque", role: '先知长眠之地', location: '沙特阿拉伯麦地那' },
            { name: '希拉山洞', nameEn: 'Cave of Hira', role: '首次启示之地', location: '麦加光明山' },
          ],
          koans: [
            { title: '首次启示', description: '天使吉卜利勒在希拉山洞命穆罕默德"读！"（伊格拉）。穆罕默德答"我不会读"。天使紧拥他三次后，第一段古兰经启示降临——"你应当奉你创造主的名义而宣读"(96:1)。' },
            { title: '辞朝演说', description: '632年最后一次朝觐，穆罕默德在阿拉法特山对十万穆斯林发表演说："人类皆为亚当子孙，阿拉伯人不优于非阿拉伯人。最尊贵者，是最敬畏真主者。"' },
          ],
          classicQuotes: ['求知，从摇篮到坟墓', '你们中最优秀的人，是品德最优美的人', '不慈爱他人者，不会得到真主的慈爱', '学者的墨水比殉道者的血更神圣'],
          works: [
            { title: '古兰经', description: '伊斯兰教最高经典，114章6236节，真主通过穆罕默德传达的启示' },
          ],
          imageUrl: null,
        },
      })
    : await prisma.patriarch.create({
        data: {
          name: '先知穆罕默德', nameEn: 'Prophet Muhammad', religionId: islamId,
          dates: '570-632', title: '封印先知·安拉的使者', school: '正统哈里发', generation: 1,
          biography: '伊斯兰教创立者，接受《古兰经》启示。', coreTeaching: '万物非主，唯有真主。',
          achievements: '伊斯兰教创立者。', imageUrl: null,
        },
      });

  // Update existing Abu Bakr
  const existingAbuBakr = await prisma.patriarch.findFirst({ where: { name: '阿布·伯克尔' } });
  const abuBakr = existingAbuBakr
    ? await prisma.patriarch.update({
        where: { id: existingAbuBakr.id },
        data: {
          nameEn: 'Abu Bakr al-Siddiq',
          dates: '573-634',
          title: '第一任正统哈里发·诚信者',
          school: '正统哈里发',
          generation: 2,
          teacherId: muhammad.id,
          biography: '阿布·伯克尔·西迪克（Abu Bakr al-Siddiq），先知穆罕默德最亲密的伙伴（萨哈比），伊斯兰教第一任正统哈里发（632-634在位）。穆罕默德传教初期第一个信仰伊斯兰的成年男性。希吉拉（迁徙）时与穆罕默德一同藏于骚尔山洞，后同赴麦地那。穆罕默德归真后，阿布·伯克尔稳定局势、平定叛乱（里达战争）、开始编纂《古兰经》、发起对波斯和拜占庭的征伐。在位仅两年三个月即归真，但奠定了伊斯兰帝国的基础。以谦逊、慷慨、忠诚著称。',
          coreTeaching: '善良不会因为谦虚而减少。忠诚与信仰是一切美德的根基。阿布·伯克尔以"诚信者"（西迪克）之号闻名，因他在先知夜行登霄等事件中毫不犹豫地相信穆罕默德。',
          achievements: '伊斯兰教第一任正统哈里发。穆罕默德归真后稳定伊斯兰国家。平定里达战争（叛教战争）。开始编纂《古兰经》。发起征服波斯和拜占庭帝国的战役。以"诚信者"（al-Siddiq）之号流芳。',
          templeNames: [
            { name: '麦地那先知寺', nameEn: "Prophet's Mosque", role: '安葬于先知旁', location: '沙特阿拉伯麦地那' },
          ],
          koans: [
            { title: '骚尔山洞', description: '逃离麦加时，穆罕默德与阿布·伯克尔藏于骚尔山洞。追兵到洞口，蜘蛛结网、鸽子筑巢遮掩洞口。穆罕默德说："不要忧愁，真主与我们同在。"(9:40)' },
          ],
          classicQuotes: ['善良不会因为谦虚而减少', '在这世上做客，轻装前行', '不要对任何人说谎，即使它看起来无害'],
          works: [],
          imageUrl: null,
        },
      })
    : await prisma.patriarch.create({
        data: {
          name: '阿布·伯克尔', nameEn: 'Abu Bakr al-Siddiq', religionId: islamId,
          dates: '573-634', title: '第一任正统哈里发', school: '正统哈里发', generation: 2,
          teacherId: muhammad.id, biography: '首任正统哈里发。', coreTeaching: '善良不会因为谦虚而减少。',
          achievements: '首任正统哈里发。', imageUrl: null,
        },
      });

  // 欧麦尔·本·赫塔卜
  const umar = await prisma.patriarch.create({
    data: {
      name: '欧麦尔·本·赫塔卜', nameEn: 'Umar ibn al-Khattab', religionId: islamId,
      dates: '584-644', title: '第二任正统哈里发·公正者', school: '正统哈里发', generation: 3,
      teacherId: muhammad.id,
      biography: '欧麦尔·本·赫塔卜（Umar ibn al-Khattab），伊斯兰教第二任正统哈里发（634-644在位），号"公正者"（al-Faruq，辨别真伪者）。初为伊斯兰教最凶猛的反对者，后因听闻《古兰经》章节而皈依，极大鼓舞了早期穆斯林。任哈里发十年间，伊斯兰帝国疆域扩张至叙利亚、埃及、伊拉克、波斯。637年亲赴耶路撒冷接受投降，在圣殿山遗址处礼拜（后建圆顶清真寺）。建立迪万（行政体系）、伊斯兰历法、法官制度、军饷制度。以极简朴的生活和铁面公正闻名。644年在清真寺礼拜时被刺杀殉难。',
      coreTeaching: '公正是统治的基石。即使对敌人也要公正。欧麦尔建立了伊斯兰世界最早的行政体系和法律制度，强调法律面前人人平等——哈里发与百姓同等受法律约束。',
      achievements: '伊斯兰教第二任正统哈里发，伊斯兰帝国最伟大的扩张者。十年间征服叙利亚、埃及、伊拉克、波斯。建立迪万行政体系、伊斯兰历法、法官制度。亲赴耶路撒冷受降，保护基督教圣地。以公正和简朴著称。',
      templeNames: [
        { name: '圆顶清真寺', nameEn: 'Dome of the Rock', role: '欧麦尔在圣殿山礼拜', location: '耶路撒冷' },
        { name: '欧麦尔清真寺', nameEn: 'Mosque of Umar', role: '纪念欧麦尔受降', location: '耶路撒冷' },
      ],
      koans: [
        { title: '夜巡巴格达', description: '欧麦尔常在夜间微服巡视，亲自查看百姓疾苦。一夜遇到饥饿的妇女和孩子，亲自扛粮食送去。仆人要帮忙，他说："审判日那天，你能替我承担罪责吗？"' },
      ],
      classicQuotes: ['在判断他人之前，先审判自己', '最好的领袖是最能为人民服务的人', '真主不因你的外表和财富看你，而因你的心灵和行为'],
      works: [],
      imageUrl: null,
    },
  });

  // 奥斯曼·本·阿凡
  await prisma.patriarch.create({
    data: {
      name: '奥斯曼·本·阿凡', nameEn: 'Uthman ibn Affan', religionId: islamId,
      dates: '576-656', title: '第三任正统哈里发·两道光的拥有者', school: '正统哈里发', generation: 4,
      teacherId: muhammad.id,
      biography: '奥斯曼·本·阿凡（Uthman ibn Affan），伊斯兰教第三任正统哈里发（644-656在位），号"两道光的拥有者"（Dhun-Nurayn），因先后娶了穆罕默德两个女儿。出身富裕的倭马亚家族，以慷慨著称——多次以巨资资助穆斯林事业。最伟大的贡献是主持《古兰经》标准化——组织学者统一古兰经文本，消除各地读法差异，制作标准版（奥斯曼定本）分发各地，确保古兰经的完整性和统一性。在位期间伊斯兰帝国继续扩张至北非和中亚。656年在家中被叛军杀害殉难。',
      coreTeaching: '古兰经的统一与保存是伊斯兰文明的根基。奥斯曼以行动证明——保护神圣经文的完整性高于一切政治考量。慷慨是信仰的体现。',
      achievements: '伊斯兰教第三任正统哈里发。主持《古兰经》标准化（奥斯曼定本），统一全球穆斯林经文。帝国扩张至北非和中亚。建立伊斯兰海军。以慷慨资助伊斯兰事业著称。',
      templeNames: [
        { name: '麦地那先知寺', nameEn: "Prophet's Mosque", role: '扩建先知寺', location: '沙特阿拉伯麦地那' },
      ],
      koans: [
        { title: '古兰经定本', description: '各地穆斯林因方言差异在古兰经读法上产生争执。奥斯曼召集学者以古莱什方言为标准统一定本，制作数部抄本分发各省，焚毁所有非标准版本。此举虽有争议，却确保了古兰经千年不变。' },
      ],
      classicQuotes: ['真主没有赐给人比知识更好的东西', '如果我们的心灵真正纯洁，我们永远不会对古兰经感到厌倦'],
      works: [],
      imageUrl: null,
    },
  });

  // 阿里·本·阿比·塔利卜
  const ali = await prisma.patriarch.create({
    data: {
      name: '阿里·本·阿比·塔利卜', nameEn: 'Ali ibn Abi Talib', religionId: islamId,
      dates: '601-661', title: '第四任正统哈里发·信士的长官', school: '正统哈里发', generation: 5,
      teacherId: muhammad.id,
      biography: '阿里·本·阿比·塔利卜（Ali ibn Abi Talib），穆罕默德的堂弟和女婿（娶先知之女法蒂玛），伊斯兰教第四任正统哈里发（656-661在位）。第一个信仰伊斯兰的男孩（约10岁皈依）。以勇武、学识和公正著称，被穆罕默德称为"知识之城的门"。在逊尼派被尊为四大正统哈里发之末，在什叶派被尊为第一任伊玛目和穆罕默德的合法继承人。著有《辞章之道》（Nahj al-Balagha），为阿拉伯文学和伊斯兰哲学经典。661年在库法清真寺礼拜时被刺杀殉难，葬于纳杰夫。',
      coreTeaching: '知识是最好的遗产，教养是最好的品质。阿里以智慧和辩才闻名，其《辞章之道》被誉为仅次于古兰经的阿拉伯语文学巅峰。强调公正、知识与灵性修养的统一。',
      achievements: '第四任正统哈里发，什叶派第一任伊玛目。穆罕默德最早的追随者之一。著《辞章之道》为阿拉伯文学经典。以智慧、勇武、公正著称。逊尼派和什叶派共同尊崇的核心人物。',
      templeNames: [
        { name: '伊玛目阿里清真寺', nameEn: 'Imam Ali Mosque', role: '阿里陵墓所在地', location: '伊拉克纳杰夫' },
        { name: '库法大清真寺', nameEn: 'Great Mosque of Kufa', role: '阿里遇刺之地', location: '伊拉克库法' },
      ],
      koans: [
        { title: '知识之门', description: '穆罕默德说："我是知识之城，阿里是它的门。"阿里是先知学识和内在教导的首要传承者。' },
        { title: '战场上的宽恕', description: '战斗中阿里将敌人打倒，敌人朝他脸上吐口水。阿里放下剑转身离开。问其故，答："他吐我时我愤怒了。若此时杀他，是为私愤而非为真主。"' },
      ],
      classicQuotes: ['知识是最好的遗产', '人的价值在于他所做的善事', '忍耐是信仰的一半', '不了解自己的人，不可能了解他人'],
      works: [
        { title: '辞章之道', description: 'Nahj al-Balagha，阿里的演讲、书信和格言集，阿拉伯文学经典' },
      ],
      imageUrl: null,
    },
  });

  // ── 四大教法学派伊玛目 (4位) ──
  await prisma.patriarch.create({
    data: {
      name: '阿布·哈尼法', nameEn: 'Abu Hanifa', religionId: islamId,
      dates: '699-767', title: '大伊玛目·哈乃斐派创始人', school: '四大教法学派', generation: 1,
      teacherId: null,
      biography: '阿布·哈尼法·努尔曼（Abu Hanifa al-Nu\'man），伊斯兰教逊尼派四大教法学派之首——哈乃斐派（Hanafi）创始人，被尊为"大伊玛目"（al-Imam al-A\'zam）。生于库法，波斯裔。以类比推理（格亚斯）和理性判断（伊智提哈德）著称，主张在古兰经和圣训无明确规定时，可运用理性推理制定教法。其学派最为开放灵活，后被奥斯曼帝国采为官方教法。今为全球信众最多的教法学派（约占逊尼派35%），主要分布于土耳其、中亚、南亚、中国。',
      coreTeaching: '理性与启示并行。在教法判断中运用类比推理（格亚斯）和公共利益考量（伊斯提赫桑），使伊斯兰教法能适应不同时代和地域。宗教不应僵化——理性是真主赐予人类的工具。',
      achievements: '哈乃斐派创始人，伊斯兰教法学奠基者。首创系统化教法推理方法。其学派为全球最大的逊尼派教法学派。被奥斯曼帝国/莫卧儿帝国采为官方教法。影响遍及土耳其、中亚、南亚、中国穆斯林。',
      templeNames: [
        { name: '大伊玛目清真寺', nameEn: 'Abu Hanifa Mosque', role: '阿布·哈尼法陵墓', location: '伊拉克巴格达' },
      ],
      koans: [],
      classicQuotes: ['当你不确定时，选择最容易的路——真主不想为你制造困难', '知识如果不付诸实践，就像树木不结果实'],
      works: [
        { title: '大学（Al-Fiqh al-Akbar）', description: '伊斯兰教义学基本信条' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '马立克·本·艾奈斯', nameEn: 'Malik ibn Anas', religionId: islamId,
      dates: '711-795', title: '麦地那伊玛目·马立克派创始人', school: '四大教法学派', generation: 2,
      teacherId: null,
      biography: '马立克·本·艾奈斯（Malik ibn Anas），逊尼派四大教法学派之一——马立克派（Maliki）创始人。生于麦地那，终身未离开。被尊为"迁徙之城的伊玛目"。以重视麦地那学者的实践传统（阿玛勒）为特色——认为麦地那人民的习俗即是先知遗教的活传承。著《穆瓦塔》（al-Muwatta），为伊斯兰教最早的教法和圣训汇编之一。其学派主要分布于北非（马格里布）、西非、阿联酋和科威特。',
      coreTeaching: '麦地那的实践传统（阿玛勒）是教法的重要来源——先知生活过的城市，其居民的集体实践即是活的圣训。注重社会公共利益（马斯拉哈）在教法判断中的权重。',
      achievements: '马立克派创始人。著《穆瓦塔》为伊斯兰教最早的教法圣训汇编。以麦地那实践传统（阿玛勒）为教法独特来源。其学派主导北非和西非伊斯兰世界。',
      templeNames: [
        { name: '麦地那先知寺', nameEn: "Prophet's Mosque", role: '终身在此教学', location: '沙特阿拉伯麦地那' },
      ],
      koans: [],
      classicQuotes: ['知识不在于记忆多少，而在于真主在你需要时放入你心中的光明', '每个人的话都可以被接受或拒绝，除了安息在这座坟墓中的人（指先知）'],
      works: [
        { title: '穆瓦塔（Al-Muwatta）', description: '最早的教法圣训汇编，伊斯兰教法学基石' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '沙斐仪', nameEn: 'Muhammad ibn Idris al-Shafi\'i', religionId: islamId,
      dates: '767-820', title: '教法学之父·沙斐仪派创始人', school: '四大教法学派', generation: 3,
      teacherId: null,
      biography: '穆罕默德·本·伊德里斯·沙斐仪（al-Shafi\'i），逊尼派四大教法学派之一——沙斐仪派（Shafi\'i）创始人，被尊为"教法原理之父"（Usul al-Fiqh）。出身古莱什族，师从马立克·本·艾奈斯。游学于麦加、麦地那、伊拉克、埃及，博采众长。著《论证书》（al-Risala），首次系统化伊斯兰教法推理方法论——确立古兰经、圣训、公议（伊智玛）、类比（格亚斯）四大法源层级。其学派分布于东南亚、东非、埃及南部、也门。',
      coreTeaching: '教法四大源泉（乌苏勒）：古兰经→圣训→公议→类比。沙斐仪创立了系统化的教法推理方法论，使教法判断有章可循。强调圣训的绝对权威性——有效圣训可以限定古兰经的一般性规定。',
      achievements: '沙斐仪派创始人。著《论证书》首创伊斯兰教法原理学（Usul al-Fiqh）。确立四大法源层级体系。融合伊拉克理性学派和麦地那传统学派之长。其学派主导东南亚伊斯兰世界（印尼/马来西亚/文莱）。',
      templeNames: [
        { name: '伊玛目沙斐仪清真寺', nameEn: 'Imam al-Shafi\'i Mosque', role: '沙斐仪陵墓', location: '埃及开罗' },
      ],
      koans: [],
      classicQuotes: ['知识分两种：宗教知识用于来世，医学知识用于身体', '我每与人辩论，都希望对方是对的', '不要与愚者争辩——旁观者分不清你们谁是傻瓜'],
      works: [
        { title: '论证书（Al-Risala）', description: '伊斯兰教法原理学奠基之作' },
        { title: '大全（Al-Umm）', description: '沙斐仪教法学全集' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '艾哈迈德·本·罕百勒', nameEn: 'Ahmad ibn Hanbal', religionId: islamId,
      dates: '780-855', title: '圣训学集大成者·罕百里派创始人', school: '四大教法学派', generation: 4,
      teacherId: null,
      biography: '艾哈迈德·本·罕百勒（Ahmad ibn Hanbal），逊尼派四大教法学派之一——罕百里派（Hanbali）创始人，伊斯兰教最伟大的圣训学家之一。师从沙斐仪等多位学者。编纂《穆斯奈德》（Musnad），收录近三万则圣训。在"古兰经被造说"（米赫纳）事件中宁受酷刑也坚持古兰经为真主之言（非被造物），成为信仰坚定的象征。其学派强调严格回归经训，反对过多的理性推理。今主要分布于沙特阿拉伯和卡塔尔。',
      coreTeaching: '严格回归古兰经和圣训。反对过多的理性推演和哲学思辨——教法的根基在经训，不在人的推理。宁可接受弱传述链的圣训，也不接受无经训根据的类比推理。',
      achievements: '罕百里派创始人。编纂《穆斯奈德》收录近三万则圣训。在米赫纳迫害中坚守信仰，宁受酷刑不妥协。被尊为逊尼派信仰捍卫者。其学派影响沙特阿拉伯官方教法。',
      templeNames: [
        { name: '艾哈迈德·本·罕百勒清真寺', nameEn: 'Ahmad ibn Hanbal Mosque', role: '纪念罕百勒', location: '伊拉克巴格达' },
      ],
      koans: [
        { title: '米赫纳', description: '阿拔斯王朝哈里发马蒙强制推行"古兰经被造说"，罕百勒坚持古兰经为真主之言。被囚禁鞭打两年不屈。后被释放，声望更隆，成为信仰坚定的象征。' },
      ],
      classicQuotes: ['人们最需要的知识，是求知本身', '忍耐是对付灾难的最好武器', '宁可在真理上孤独，也不在虚伪上合群'],
      works: [
        { title: '穆斯奈德（Musnad）', description: '近三万则圣训汇编，伊斯兰教最大圣训集之一' },
      ],
      imageUrl: null,
    },
  });

  // ── 苏菲派大师 (6位) ──
  await prisma.patriarch.create({
    data: {
      name: '哈桑·巴士里', nameEn: 'Hasan al-Basri', religionId: islamId,
      dates: '642-728', title: '苏菲先驱·巴士拉贤者', school: '苏菲派', generation: 1,
      teacherId: null,
      biography: '哈桑·巴士里（Hasan al-Basri），伊斯兰教早期最重要的学者和禁欲主义者，被尊为苏菲主义的先驱。生于麦地那，后迁居巴士拉。以雄辩的布道和对后世的深切关注闻名。其教导强调恐惧真主（塔格瓦）、反省自我、淡泊今世。哈桑·巴士里的弟子中产生了伊斯兰教多个重要学术流派。被认为是连接圣门弟子时代与后来苏菲传统的关键人物。',
      coreTeaching: '内心的净化重于外在的仪式。对今世的淡泊（祖赫德）是通向真主的道路。每日自省——如果今天的你没有比昨天更好，那你就在退步。',
      achievements: '苏菲主义先驱，连接圣门弟子时代与苏菲传统的关键人物。伊斯兰教早期最有影响力的布道家。弟子众多，开创多个学术流派。以雄辩和敬虔著称。',
      templeNames: [
        { name: '巴士拉大清真寺', nameEn: 'Great Mosque of Basra', role: '长期布道之地', location: '伊拉克巴士拉' },
      ],
      koans: [],
      classicQuotes: ['如果今天的你没有比昨天更好，那你就是在亏损', '今世是来世的农田——在此播种，在彼收获', '智者在夜晚反思自己的白天'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '拉比亚·阿达维亚', nameEn: 'Rabia al-Adawiyya', religionId: islamId,
      dates: '717-801', title: '爱的苏菲·女性神秘主义先驱', school: '苏菲派', generation: 2,
      teacherId: null,
      biography: '拉比亚·阿达维亚（Rabia al-Adawiyya），伊斯兰教苏菲主义最重要的女性圣者，"神圣之爱"（胡布·伊拉希）教义的开创者。生于巴士拉贫困家庭，幼年被卖为奴。获自由后终身未婚，全心奉献于对真主的爱。她将苏菲主义从恐惧和禁欲转向了纯粹的爱——爱真主不是因为害怕火狱或渴望天堂，而是因为真主本身值得被爱。这一转变深刻影响了整个苏菲传统的发展方向。',
      coreTeaching: '无条件的神圣之爱（胡布·伊拉希）。爱真主不因恐惧火狱，不因渴望天堂——只因真主值得被爱。拉比亚著名的祈祷："主啊，如果我因恐惧火狱而崇拜你，就让我在火狱中燃烧；如果我因渴望天堂而崇拜你，就将我拒之门外。但如果我只因你而崇拜你，就不要对我隐藏你永恒的美。"',
      achievements: '苏菲主义最重要的女性圣者。开创"神圣之爱"教义，将苏菲主义从恐惧转向爱。其名言和祈祷传颂千年。证明了女性在伊斯兰灵性传统中的崇高地位。',
      templeNames: [
        { name: '拉比亚陵墓', nameEn: 'Tomb of Rabia', role: '圣者陵墓', location: '伊拉克巴士拉(一说耶路撒冷)' },
      ],
      koans: [
        { title: '火炬与水桶', description: '拉比亚手持火炬和水桶走在巴士拉街上。人问其故。答："我要用火炬烧掉天堂，用水浇灭火狱——这样人们才会因为爱真主而崇拜他，而非出于恐惧或贪婪。"' },
      ],
      classicQuotes: ['主啊，如果我因恐惧火狱而崇拜你，就让我在火狱中燃烧', '我的心除了真主没有空间容纳其他', '爱来自永恒，通向永恒'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '朱奈德·巴格达迪', nameEn: 'Al-Junayd al-Baghdadi', religionId: islamId,
      dates: '830-910', title: '苏菲宗师之师·清醒苏菲', school: '苏菲派', generation: 3,
      teacherId: null,
      biography: '朱奈德·巴格达迪（Al-Junayd），苏菲主义最重要的理论家，被尊为"苏菲宗师之师"（Sayyid al-Ta\'ifa）。几乎所有苏菲道团的传承链（斯尔斯拉）都追溯到朱奈德。他代表"清醒苏菲"（Sahw）——与"陶醉苏菲"相对——主张神秘体验必须与教法规范统一，灵性飞升后必须回归日常责任。提出"法那"（消融于真主）后必须有"巴卡"（在真主中重生），否则不完整。其学说使苏菲主义获得正统教义的认可。',
      coreTeaching: '清醒的苏菲主义（Sahw）——神秘体验必须与教法统一。"法那"（消融于真主）不是终点，必须经历"巴卡"（在真主中重生）回到世间履行责任。苏菲道路始于教法（沙里亚），经由道路（塔里卡），达到真理（哈基卡）。',
      achievements: '苏菲主义最重要理论家，"苏菲宗师之师"。几乎所有苏菲道团传承链追溯至朱奈德。创立"清醒苏菲"学说，使苏菲主义获得正统认可。提出法那-巴卡完整框架。',
      templeNames: [
        { name: '朱奈德清真寺', nameEn: 'Junayd Mosque', role: '朱奈德陵墓', location: '伊拉克巴格达' },
      ],
      koans: [
        { title: '法那与巴卡', description: '弟子问：苏菲修行的终点是什么？朱奈德答："法那（消融于真主）不是终点。终点是巴卡（在真主中重生）——你消融于真主后，带着真主的品性重返世间。如果只有法那没有巴卡，就像箭射出去不回来。"' },
      ],
      classicQuotes: ['苏菲主义不是外在的衣着和修行，而是内在的品质', '你回到最初的起点——但你已经完全不同了', '真正的苏菲是按照古兰经和圣训生活的人'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '安萨里', nameEn: 'Abu Hamid al-Ghazali', religionId: islamId,
      dates: '1058-1111', title: '伊斯兰复兴者·信仰的明证', school: '苏菲派', generation: 4,
      teacherId: null,
      biography: '阿布·哈米德·安萨里（Al-Ghazali），被尊为"信仰的明证"（Hujjat al-Islam），中世纪伊斯兰教最伟大的思想家。生于波斯图斯。年轻时为巴格达尼扎米亚学院首席教授，声望达于顶峰。1095年经历严重的精神危机——对一切学术知识产生怀疑，突然离开巴格达，以苦行者身份游历叙利亚、耶路撒冷、麦加十年。通过苏菲修行重获信仰确信。著《宗教科学的复兴》（Ihya Ulum al-Din），融合教法学、神学和苏菲灵性，被认为"仅次于古兰经"的伊斯兰教最伟大著作。',
      coreTeaching: '真知来自灵性体验而非理性论证。安萨里从哲学怀疑走向苏菲确信——证明理性有其限度，真正的信仰来自内心的直接体验（卡什夫）。教法（外在规范）和灵性（内在净化）不可分割。',
      achievements: '伊斯兰教最伟大的思想家之一。著《宗教科学的复兴》融合教法与灵性。终结了伊斯兰世界的纯理性哲学倾向。使苏菲主义融入逊尼派正统。被称为"伊斯兰的复兴者"（Mujaddid）。',
      templeNames: [
        { name: '安萨里陵墓', nameEn: 'Tomb of al-Ghazali', role: '安萨里长眠之地', location: '伊朗图斯' },
        { name: '倭马亚大清真寺', nameEn: 'Umayyad Mosque', role: '安萨里隐居修行之地', location: '叙利亚大马士革' },
      ],
      koans: [
        { title: '离开巴格达', description: '安萨里在学术声望顶峰突然离职。他后来写道："我审视自己的动机——我教书不是为了真主，而是为了名声和地位。我发现自己站在火狱的边缘。"他抛弃一切，开始了十年的苏菲修行之旅。' },
      ],
      classicQuotes: ['知识无行动，是疯狂；行动无知识，是徒劳', '半数的不信，来自信仰者给宗教抹的黑', '欲望使智者变愚，忍耐使愚者变智'],
      works: [
        { title: '宗教科学的复兴（Ihya Ulum al-Din）', description: '四十卷巨著，融合教法学、神学与苏菲灵性，被誉为仅次于古兰经' },
        { title: '迷途指津（Al-Munqidh min al-Dalal）', description: '精神自传，记录从怀疑到确信的心路历程' },
        { title: '哲学家的矛盾（Tahafut al-Falasifa）', description: '批判亚里士多德式哲学的逻辑限度' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '伊本·阿拉比', nameEn: 'Ibn Arabi', religionId: islamId,
      dates: '1165-1240', title: '至大导师·苏菲形而上学集大成者', school: '苏菲派', generation: 5,
      teacherId: null,
      biography: '穆希丁·伊本·阿拉比（Muhyiddin Ibn Arabi），被尊为"至大导师"（al-Shaykh al-Akbar），伊斯兰教苏菲主义最伟大的形而上学家。生于西班牙穆尔西亚，游历北非、麦加、安纳托利亚、大马士革。提出"存在的统一"（Wahdat al-Wujud）——万物是真主存在的显现（tajalli），一切存在的本质是唯一的真实存在（真主）。著作超过350部，最重要的是《麦加启示》（al-Futuhat al-Makkiyya，37卷）和《智慧的珍珠》（Fusus al-Hikam）。其思想深刻影响了从奥斯曼帝国到莫卧儿帝国的伊斯兰灵性传统。',
      coreTeaching: '存在的统一（Wahdat al-Wujud）——唯一真正存在的是真主，万物是真主属性的不同显现。"完美之人"（Insan al-Kamil）是真主与世界之间的桥梁——先知是完美之人的典范。想象力（Khayal）是连接灵性世界与物质世界的中介。',
      achievements: '苏菲主义最伟大的形而上学家，"至大导师"。提出"存在的统一"理论。著作超过350部。《麦加启示》37卷为苏菲百科全书。深刻影响奥斯曼/莫卧儿/波斯伊斯兰灵性传统。',
      templeNames: [
        { name: '伊本·阿拉比清真寺', nameEn: 'Ibn Arabi Mosque', role: '陵墓与清真寺', location: '叙利亚大马士革' },
      ],
      koans: [
        { title: '爱的宗教', description: '伊本·阿拉比写道："我的心已能够接纳所有形式——它是羚羊的草地，僧侣的修道院，偶像的神殿，朝觐者的克尔白，摩西的法版，古兰经的书卷。我信仰爱的宗教，无论它的骆驼走向何方，爱就是我的信仰和信条。"' },
      ],
      classicQuotes: ['我信仰爱的宗教，无论它走向何方', '万物是真主的镜子——每面镜子反映真主的一个面向', '不了解自己的人，不了解他的主'],
      works: [
        { title: '麦加启示（Al-Futuhat al-Makkiyya）', description: '37卷苏菲百科全书，涵盖宇宙论/认识论/灵性实修' },
        { title: '智慧的珍珠（Fusus al-Hikam）', description: '27章，论27位先知的特有智慧' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '贾拉鲁丁·鲁米', nameEn: 'Jalaluddin Rumi', religionId: islamId,
      dates: '1207-1273', title: '毛拉维教团创始人·苏菲诗歌巅峰', school: '苏菲派', generation: 6,
      teacherId: null,
      biography: '贾拉鲁丁·穆罕默德·鲁米（Rumi），伊斯兰教苏菲主义最伟大的诗人，毛拉维教团（旋转苦行僧）创始人。生于巴尔赫（今阿富汗），因蒙古入侵随家人西迁，最终定居于科尼亚（今土耳其）。1244年遇到游方苦行僧沙姆斯·塔布里兹（Shams-i-Tabrizi），灵性觉醒，从学者转变为狂热的神秘主义诗人。著《玛斯纳维》（Masnavi）六卷约25000对偶诗行，被称为"波斯语的古兰经"。著《沙姆斯诗集》约40000诗行。其弟子创立毛拉维教团，以"旋转舞"（萨玛）闻名。今为全球最受欢迎的诗人之一——在美国诗集销量曾超过所有英语诗人。',
      coreTeaching: '爱是宇宙的本质力量——万物因爱而运动，因爱而存在。神圣之爱（Ishq）超越宗教、种族、语言的界限。通过音乐、诗歌、旋转舞（萨玛）体验与真主的合一。"你不是一滴水——你是整片海洋包含在一滴水中。"',
      achievements: '苏菲主义最伟大的诗人。著《玛斯纳维》被称"波斯语的古兰经"。毛拉维教团创始人（旋转苦行僧）。当今全球最受欢迎的诗人之一。其教导跨越宗教文化界限影响全人类。',
      templeNames: [
        { name: '鲁米博物馆（绿色陵墓）', nameEn: 'Mevlana Museum', role: '鲁米陵墓，毛拉维教团圣地', location: '土耳其科尼亚' },
      ],
      koans: [
        { title: '芦笛的哀诉', description: '《玛斯纳维》开篇：听那芦笛如何哀诉——自从它被从芦苇丛中割离。人的灵魂如芦笛，因与源头（真主）分离而哀鸣。一切渴望、爱、痛苦，都是灵魂渴望回归源头的表现。' },
        { title: '来吧', description: '"来吧，无论你是谁——流浪者、崇拜者、离弃承诺者——来吧。即使你已破戒一千次——来吧，再来吧。我们的不是绝望的道场。"' },
      ],
      classicQuotes: ['你不是一滴水，你是整片海洋包含在一滴水中', '伤口是光进入你的地方', '来吧，无论你是谁——来吧', '超越善与恶的观念，有一片田野，我将在那里与你相遇', '沉默是真主的语言，其余都是翻译'],
      works: [
        { title: '玛斯纳维（Masnavi）', description: '六卷25000对偶诗行，被称为"波斯语的古兰经"' },
        { title: '沙姆斯诗集（Divan-e Shams）', description: '约40000诗行的抒情诗集，献给灵性导师沙姆斯' },
        { title: '其中之中（Fihi Ma Fihi）', description: '鲁米的散文开示录' },
      ],
      imageUrl: null,
    },
  });

  // ── 什叶派伊玛目 (4位) ──
  const husayn = await prisma.patriarch.create({
    data: {
      name: '侯赛因·本·阿里', nameEn: 'Husayn ibn Ali', religionId: islamId,
      dates: '626-680', title: '殉难之主·卡尔巴拉', school: '什叶派伊玛目', generation: 1,
      teacherId: ali.id,
      biography: '侯赛因·本·阿里（Husayn ibn Ali），先知穆罕默德的外孙（阿里与法蒂玛之子），什叶派第三任伊玛目。680年（伊斯兰历61年），侯赛因拒绝向倭马亚王朝哈里发叶齐德效忠，率72名家人和追随者前往库法。在卡尔巴拉被叶齐德的数千大军包围。阿舒拉日（穆哈兰月第十日），侯赛因及其同伴全部壮烈殉难，仅幼子宰因·阿比丁幸存。卡尔巴拉事件成为伊斯兰教最悲壮的历史，是什叶派信仰的核心事件。每年穆哈兰月的阿舒拉纪念活动是全球什叶派最重要的宗教仪式。',
      coreTeaching: '宁为正义而死，不在不义面前苟活。侯赛因以自己和家人的牺牲证明——面对暴政，沉默即共谋。"我的起义不是为了欢乐、傲慢或腐败，而是为了改革我祖父的乌玛。"卡尔巴拉精神成为一切反抗压迫的象征。',
      achievements: '什叶派第三任伊玛目。卡尔巴拉殉难事件是伊斯兰教最深刻的历史创伤和精神遗产。每年阿舒拉纪念日影响全球数亿什叶派穆斯林。"侯赛因的精神"成为正义抗暴的永恒象征。甘地曾说："我从侯赛因那里学到了如何在被压迫时取得胜利。"',
      templeNames: [
        { name: '侯赛因圣陵', nameEn: 'Imam Husayn Shrine', role: '侯赛因殉难与安葬地', location: '伊拉克卡尔巴拉' },
        { name: '阿拔斯圣陵', nameEn: 'Al-Abbas Shrine', role: '侯赛因兄弟阿拔斯陵墓', location: '伊拉克卡尔巴拉' },
      ],
      koans: [
        { title: '卡尔巴拉', description: '面对数千大军，72人赴死。侯赛因对敌军说："如果你们没有信仰，至少做一个自由的人。"阿舒拉日战至最后一刻。这不是军事失败——这是以血唤醒沉睡的良知。' },
      ],
      classicQuotes: ['宁为正义站着死，不在不义面前跪着活', '如果你们没有信仰，至少做一个自由的人', '我的起义是为了改革我祖父的乌玛'],
      works: [],
      imageUrl: null,
    },
  });

  const zaynAlAbidin = await prisma.patriarch.create({
    data: {
      name: '阿里·宰因·阿比丁', nameEn: 'Ali Zayn al-Abidin', religionId: islamId,
      dates: '658-713', title: '第四伊玛目·祈祷之主', school: '什叶派伊玛目', generation: 2,
      teacherId: husayn.id,
      biography: '阿里·宰因·阿比丁（Ali Zayn al-Abidin），侯赛因之子，什叶派第四任伊玛目，号"祈祷之主"（Sayyid al-Sajjidin）和"礼拜者的饰品"（Zayn al-Abidin）。卡尔巴拉事件中因重病未能参战，为唯一幸存的成年男性后裔。此后一生以祈祷、隐忍和慈善度过。著《祈祷书》（al-Sahifa al-Sajjadiyya），被什叶派尊为"阿里家族的诗篇"，是伊斯兰教最美的祈祷文学。以每日长时间礼拜和大量释放奴隶著称。',
      coreTeaching: '以祈祷和忍耐回应苦难。宰因·阿比丁不以政治手段而以灵性修行延续先知家族的使命。其《祈祷书》将个人苦难转化为与真主对话的途径——每一次呼吸都是祈祷。',
      achievements: '什叶派第四任伊玛目。卡尔巴拉唯一幸存成年男性后裔。著《祈祷书》为伊斯兰教最美的祈祷文学。以极度虔诚的礼拜和慷慨释放奴隶著称。',
      templeNames: [
        { name: '麦地那巴基公墓', nameEn: "Jannat al-Baqi'", role: '安葬之地', location: '沙特阿拉伯麦地那' },
      ],
      koans: [],
      classicQuotes: ['主啊，让我因你的慈悯而满足，而非因世人的施予', '最完美的人是最能宽恕那些对他不公者'],
      works: [
        { title: '祈祷书（Al-Sahifa al-Sajjadiyya）', description: '54篇祈祷文，被称为"阿里家族的诗篇"' },
        { title: '权利书（Risalat al-Huquq）', description: '论述50项人权义务的书信' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '贾法尔·萨迪克', nameEn: "Ja'far al-Sadiq", religionId: islamId,
      dates: '702-765', title: '第六伊玛目·教法学家', school: '什叶派伊玛目', generation: 3,
      teacherId: zaynAlAbidin.id,
      biography: '贾法尔·萨迪克（Ja\'far al-Sadiq），什叶派第六任伊玛目，也是逊尼派尊敬的大学者。阿布·哈尼法和马立克·本·艾奈斯都曾受教于他。被认为是什叶派贾法里教法学派（Ja\'fari）的创立者。除宗教学问外，还精通化学、医学和天文学——被尊为贾比尔·伊本·哈扬（"化学之父"）的导师。在政治最动荡的倭马亚-阿拔斯交替期，以学术传教而非政治斗争延续伊玛目传统。',
      coreTeaching: '知识是先知家族最重要的遗产。萨迪克不仅传授宗教知识，还鼓励自然科学研究——认为认识真主的创造也是崇拜的方式。什叶派教法（贾法里法学派）的核心框架由他奠定。',
      achievements: '什叶派第六任伊玛目，贾法里教法学派创立者。四大逊尼派伊玛目中有二人（阿布·哈尼法、马立克）曾受教于他。精通化学/医学/天文学。培养大量学者，奠定什叶派学术传统。',
      templeNames: [
        { name: '麦地那巴基公墓', nameEn: "Jannat al-Baqi'", role: '安葬之地', location: '沙特阿拉伯麦地那' },
      ],
      koans: [],
      classicQuotes: ['与不同意你的人坐在一起——这是最好的学习', '三种人最可悲：有知识而不行动者，有行动而无知识者，无知识也无行动者'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '阿里·里达', nameEn: 'Ali al-Ridha', religionId: islamId,
      dates: '765-818', title: '第八伊玛目·满意者', school: '什叶派伊玛目', generation: 4,
      teacherId: null,
      biography: '阿里·里达（Ali al-Ridha），什叶派第八任伊玛目，号"满意者"（al-Ridha）。阿拔斯王朝哈里发马蒙试图通过册封阿里·里达为继承人来调和逊尼-什叶矛盾。里达被迫接受但预言自己不会继位。818年在前往巴格达途中于图斯（今马什哈德）去世，什叶派认为是被马蒙毒杀。其陵墓（马什哈德伊玛目里达圣陵）是伊朗最神圣的朝圣地，也是全球最大的清真寺建筑群之一，每年接待超过2000万朝圣者。',
      coreTeaching: '信仰与理性并行。里达以博学和辩论闻名——曾与基督教、犹太教、琐罗亚斯德教学者进行著名的宗教间对话。主张通过理性论证而非强迫来传达信仰。',
      achievements: '什叶派第八任伊玛目。马什哈德圣陵为全球最大清真寺建筑群之一（年2000万+朝圣者）。以宗教间对话和博学闻名。被阿拔斯哈里发马蒙册封为继承人（唯一一位）。',
      templeNames: [
        { name: '伊玛目里达圣陵', nameEn: 'Imam Reza Shrine', role: '全球最大清真寺建筑群之一', location: '伊朗马什哈德' },
      ],
      koans: [
        { title: '宗教间对话', description: '马蒙邀请各宗教学者辩论。里达对犹太教拉比引用《摩西五经》、对基督教主教引用《福音书》、对琐罗亚斯德教祭司引用《阿维斯塔》——以各教自身经典证明伊斯兰教的真理。学者们叹服其博学。' },
      ],
      classicQuotes: ['信仰是心灵的承认、口舌的表白、肢体的行动', '最好的人是对他人最有益的人'],
      works: [],
      imageUrl: null,
    },
  });

  // ── 学者与旅行家 (6位) ──
  await prisma.patriarch.create({
    data: {
      name: '布哈里', nameEn: 'Imam al-Bukhari', religionId: islamId,
      dates: '810-870', title: '圣训学泰斗', school: '学者与旅行家', generation: 1,
      teacherId: null,
      biography: '穆罕默德·本·伊斯玛仪·布哈里（Al-Bukhari），伊斯兰教最伟大的圣训学家。生于布哈拉（今乌兹别克斯坦）。自幼记忆力惊人，十岁开始背诵圣训。游历中亚、阿拉伯、埃及、叙利亚十六年，搜集圣训。从约60万则传述中严格筛选出7275则编入《布哈里圣训实录》（Sahih al-Bukhari），被逊尼派穆斯林公认为仅次于古兰经的最权威经典。其筛选标准之严格——每则圣训的传述链中每个人的品德、记忆力、师承关系都必须经过验证。',
      coreTeaching: '圣训学的严格方法论——传述链（伊斯纳德）中每个传述人都必须是可靠的（正义/精确/无缺陷/无矛盾/无隐疾）。知识的传承必须有完整且可验证的链条。',
      achievements: '编纂《布哈里圣训实录》为逊尼派最权威的圣训集。从60万则传述中筛选7275则。建立圣训学严格的验证方法论。被尊为伊斯兰学术史上最伟大的圣训学家。',
      templeNames: [
        { name: '布哈里陵墓', nameEn: 'Imam al-Bukhari Mausoleum', role: '布哈里长眠之地', location: '乌兹别克斯坦撒马尔罕' },
      ],
      koans: [],
      classicQuotes: ['我从未在背后议论任何人——我恐惧审判日的清算'],
      works: [
        { title: '布哈里圣训实录（Sahih al-Bukhari）', description: '7275则圣训，逊尼派最权威圣训集' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '伊本·西那', nameEn: 'Ibn Sina (Avicenna)', religionId: islamId,
      dates: '980-1037', title: '医学之父·万学之王', school: '学者与旅行家', generation: 2,
      teacherId: null,
      biography: '伊本·西那（Ibn Sina，拉丁名Avicenna），中世纪最伟大的博学家之一。生于布哈拉附近。十岁已精通古兰经，十八岁已掌握当时所有学科。著《医典》（Canon of Medicine）五卷，为中世纪欧亚最权威的医学教科书，在欧洲大学使用至17世纪。著《治愈之书》（Kitab al-Shifa）为百科全书式的哲学巨著，涵盖逻辑学、自然科学、数学、形而上学。提出的"飞人论证"（Flying Man argument）预示了笛卡尔的"我思故我在"。一生颠沛流离，在波斯各宫廷间辗转，但著作不辍。',
      coreTeaching: '理性与信仰的和谐。伊本·西那融合亚里士多德哲学和伊斯兰神学——证明存在一个"必然存在者"（Wajib al-Wujud/真主）是所有可能存在者的终极原因。医学是最崇高的学问之一——治愈身体是服务真主创造的体现。',
      achievements: '中世纪最伟大的博学家之一。《医典》为欧亚大陆最权威医学教科书（使用至17世纪）。《治愈之书》为百科全书式哲学巨著。"飞人论证"预示笛卡尔。影响托马斯·阿奎那等西方哲学家。',
      templeNames: [
        { name: '伊本·西那陵墓', nameEn: 'Avicenna Mausoleum', role: '陵墓与纪念馆', location: '伊朗哈马丹' },
      ],
      koans: [],
      classicQuotes: ['医学是维护健康和治疗疾病的科学', '灵魂的宽度等同于知识的深度', '我宁愿短暂而丰盛的一生，也不要漫长而空虚的一生'],
      works: [
        { title: '医典（Canon of Medicine）', description: '五卷，中世纪最权威的医学教科书' },
        { title: '治愈之书（Kitab al-Shifa）', description: '百科全书式哲学巨著，涵盖逻辑/自然/数学/形而上学' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '伊本·鲁世德', nameEn: 'Ibn Rushd (Averroes)', religionId: islamId,
      dates: '1126-1198', title: '亚里士多德注释家·理性之光', school: '学者与旅行家', generation: 3,
      teacherId: null,
      biography: '伊本·鲁世德（Ibn Rushd，拉丁名Averroes），安达卢斯（西班牙穆斯林）最伟大的哲学家，被称为"注释家"（The Commentator），因其对亚里士多德著作的权威注释。生于科尔多瓦。担任法官和宫廷医生。著《矛盾的矛盾》（Tahafut al-Tahafut）反驳安萨里对哲学的批判，捍卫理性思辨在伊斯兰教中的地位。其亚里士多德注释被翻译成拉丁文和希伯来文，对欧洲中世纪经院哲学（特别是托马斯·阿奎那）产生决定性影响，被称为"欧洲启蒙运动的隐秘催化剂"。',
      coreTeaching: '真理不会自相矛盾——哲学（理性）和宗教（启示）是认识同一真理的两种途径。理性思辨不是信仰的敌人，而是信仰的盟友。伊本·鲁世德主张"双重真理"——哲学和宗教各有各的论述方式，但指向同一真理。',
      achievements: '安达卢斯最伟大的哲学家。对亚里士多德的权威注释影响整个欧洲中世纪哲学。著《矛盾的矛盾》捍卫理性。直接影响托马斯·阿奎那和欧洲经院哲学。被称为"欧洲启蒙运动的隐秘催化剂"。',
      templeNames: [
        { name: '科尔多瓦大清真寺', nameEn: 'Mosque-Cathedral of Córdoba', role: '安达卢斯伊斯兰文明象征', location: '西班牙科尔多瓦' },
      ],
      koans: [],
      classicQuotes: ['无知导致恐惧，恐惧导致仇恨，仇恨导致暴力——这是等式', '如果你想控制人民，让他们无知'],
      works: [
        { title: '矛盾的矛盾（Tahafut al-Tahafut）', description: '反驳安萨里，捍卫理性在伊斯兰教中的地位' },
        { title: '亚里士多德注释全集', description: '对亚里士多德主要著作的三层注释（简/中/详）' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '伊本·赫勒敦', nameEn: 'Ibn Khaldun', religionId: islamId,
      dates: '1332-1406', title: '社会学之父·历史哲学奠基人', school: '学者与旅行家', generation: 4,
      teacherId: null,
      biography: '伊本·赫勒敦（Ibn Khaldun），被西方学术界公认为"社会学之父"和"历史学之父"。生于突尼斯的安达卢斯裔学者家族。曾在北非和安达卢斯多个宫廷担任政治顾问。著《历史绪论》（Muqaddimah），首次以科学方法分析人类社会——提出"阿萨比亚"（群体凝聚力）理论：游牧民族因艰苦生活而拥有强大凝聚力，征服城市后因奢侈而凝聚力衰退，三四代后被新的游牧力量取代。这一王朝兴衰周期理论被认为远超同时代欧洲任何思想家。',
      coreTeaching: '历史不是君王故事的堆砌，而是有规律可循的科学。人类社会受经济、地理、气候、文化等因素共同塑造。"阿萨比亚"（群体凝聚力）决定文明的兴衰——权力腐蚀团结，奢侈消磨意志。',
      achievements: '被公认为社会学和历史学之父。《历史绪论》为人类社会科学奠基之作。"阿萨比亚"理论至今仍被引用。影响马克思、汤因比等西方思想家。远超同时代欧洲任何社会理论家。',
      templeNames: [
        { name: '伊本·赫勒敦故居', nameEn: 'Ibn Khaldun House', role: '故居博物馆', location: '突尼斯' },
      ],
      koans: [],
      classicQuotes: ['地理是命运', '人类是社会性动物', '奢侈是文明灭亡的先兆', '被征服者总是模仿征服者'],
      works: [
        { title: '历史绪论（Muqaddimah）', description: '人类社会科学奠基之作，社会学/历史学开山巨著' },
        { title: '鉴戒之书（Kitab al-Ibar）', description: '七卷世界通史' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '伊本·白图泰', nameEn: 'Ibn Battuta', religionId: islamId,
      dates: '1304-1369', title: '中世纪最伟大旅行家', school: '学者与旅行家', generation: 5,
      teacherId: null,
      biography: '伊本·白图泰（Ibn Battuta），中世纪世界最伟大的旅行家。生于摩洛哥丹吉尔。1325年（21岁）出发前往麦加朝圣，此后29年间走遍已知世界——北非、中东、东非、中亚、印度、中国、东南亚、西非、安达卢斯，总行程约12万公里（是马可·波罗的三倍）。到访约40个现代国家。曾在印度担任德里苏丹国法官七年，在马尔代夫担任法官。归国后口述《旅行记》（Rihla），为14世纪伊斯兰世界和亚非各国最珍贵的第一手记录。',
      coreTeaching: '旅行是最好的学习。伊本·白图泰展示了14世纪伊斯兰文明的广袤——从摩洛哥到中国，穆斯林旅行者可以凭借共同信仰和法律知识在整个伊斯兰世界畅行无阻。"旅行——它会给你一个你无法从别处获得的故事。"',
      achievements: '中世纪世界最伟大的旅行家。29年行程12万公里，到访约40个现代国家。《旅行记》为14世纪亚非世界最珍贵的第一手记录。比马可·波罗走得更远、记录更详实。被联合国教科文组织列为文化遗产。',
      templeNames: [
        { name: '伊本·白图泰纪念馆', nameEn: 'Ibn Battuta Memorial', role: '故乡纪念', location: '摩洛哥丹吉尔' },
        { name: '伊本·白图泰购物中心', nameEn: 'Ibn Battuta Mall', role: '以其旅行为主题的文化地标', location: '阿联酋迪拜' },
      ],
      koans: [
        { title: '出发', description: '21岁的白图泰离开丹吉尔去麦加朝圣——这一走就是29年。他说："旅行首先让你无言，然后让你变成一个讲故事的人。"' },
      ],
      classicQuotes: ['旅行——它让你无言，然后把你变成一个讲故事的人', '他所游历之地既广又远，足以使大地为之骄傲'],
      works: [
        { title: '旅行记（Rihla）', description: '全名《奇境奇闻旅行记》，14世纪亚非世界最珍贵的第一手记录' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '穆罕默德·伊克巴勒', nameEn: 'Muhammad Iqbal', religionId: islamId,
      dates: '1877-1938', title: '东方诗哲·巴基斯坦精神之父', school: '学者与旅行家', generation: 6,
      teacherId: null,
      biography: '穆罕默德·伊克巴勒（Muhammad Iqbal），南亚最伟大的穆斯林诗人和哲学家，被尊为"巴基斯坦精神之父"。生于旁遮普锡亚尔科特。留学剑桥和慕尼黑获哲学博士。以乌尔都语和波斯语写就的诗歌融合苏菲灵性和现代哲学——重新诠释鲁米的精神遗产，呼唤穆斯林世界的自我觉醒（Khudi/自我）。1930年在全印穆斯林联盟演讲中首次提出建立独立穆斯林国家的构想，为巴基斯坦建国奠定思想基础。其诗歌和思想至今是巴基斯坦和南亚穆斯林的精神支柱。',
      coreTeaching: '自我（Khudi）哲学——人的使命是通过不断的努力和奋斗完善自我，最终成为真主在大地上的代理人（哈里发）。拒绝宿命论——伊斯兰教不是被动的顺从，而是积极的创造。重新诠释鲁米——将苏菲的"消融于真主"改为"在真主面前挺立自我"。',
      achievements: '南亚最伟大的穆斯林诗人和哲学家。"巴基斯坦精神之父"，为巴基斯坦建国奠定思想基础。融合苏菲灵性和现代哲学。以乌尔都语和波斯语诗歌呼唤穆斯林世界觉醒。被巴基斯坦尊为国父级人物。',
      templeNames: [
        { name: '伊克巴勒陵墓', nameEn: 'Tomb of Iqbal', role: '伊克巴勒长眠之地', location: '巴基斯坦拉合尔巴德沙希清真寺旁' },
        { name: '巴德沙希清真寺', nameEn: 'Badshahi Mosque', role: '莫卧儿帝国最大清真寺', location: '巴基斯坦拉合尔' },
      ],
      koans: [],
      classicQuotes: ['站起来！对宇宙展示你的存在', '如果你没有生命的火焰，你所拥有的不过是灰烬', '民族的升降取决于个人自我的觉醒程度'],
      works: [
        { title: '自我的秘密（Asrar-i-Khudi）', description: '波斯语长诗，论自我（Khudi）哲学' },
        { title: '东方讯息（Payam-i-Mashriq）', description: '对歌德《西东诗集》的回应' },
        { title: '伊斯兰教中宗教思想的重建', description: '英文哲学讲座集，融合伊斯兰与现代哲学' },
      ],
      imageUrl: null,
    },
  });

  const islamCount = 23; // 23 new + 2 updated
  console.log(`  ✓ ${islamCount} new Islamic patriarchs created + 2 updated (5 schools: Rashidun/Madhab/Sufi/Shia/Scholars)`);

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
        coverImage: ROUTE_IMAGES[r.slug]?.cover || null,
        images: ROUTE_IMAGES[r.slug]?.images || [],
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

  // ── Media Content (demo data) ──
  console.log('Creating demo media content...');
  await prisma.mediaContent.deleteMany();
  // Fetch first holy site and first temple for demo association
  const firstSite = await prisma.holySite.findFirst({ orderBy: { name: 'asc' } });
  const secondSite = await prisma.holySite.findFirst({ orderBy: { name: 'asc' }, skip: 1 });
  const firstTemple = await prisma.temple.findFirst({ orderBy: { name: 'asc' } });
  const mediaItems: Array<{
    entityType: string; entityId: string; mediaType: string;
    title: string; description?: string; url: string;
    thumbnailUrl?: string; duration?: number; sortOrder: number;
  }> = [];
  if (firstSite) {
    mediaItems.push(
      {
        entityType: 'HOLY_SITE', entityId: firstSite.id, mediaType: 'VIDEO',
        title: `${firstSite.name} 航拍导览`, description: `从空中俯瞰${firstSite.name}全貌`,
        url: 'https://cdn.zuting.org/demo/holy-site-aerial.mp4',
        thumbnailUrl: 'https://cdn.zuting.org/demo/holy-site-aerial-thumb.jpg',
        duration: 180, sortOrder: 0,
      },
      {
        entityType: 'HOLY_SITE', entityId: firstSite.id, mediaType: 'AUDIO',
        title: `${firstSite.name} 历史讲解`, description: '专业导游语音讲解',
        url: 'https://cdn.zuting.org/demo/holy-site-guide.mp3',
        duration: 420, sortOrder: 0,
      },
      {
        entityType: 'HOLY_SITE', entityId: firstSite.id, mediaType: 'PANORAMA',
        title: `${firstSite.name} 大殿全景`, description: '360度沉浸式全景',
        url: 'https://cdn.zuting.org/demo/holy-site-panorama.jpg',
        thumbnailUrl: 'https://cdn.zuting.org/demo/holy-site-panorama-thumb.jpg',
        sortOrder: 0,
      },
    );
  }
  if (secondSite) {
    mediaItems.push({
      entityType: 'HOLY_SITE', entityId: secondSite.id, mediaType: 'VIDEO',
      title: `${secondSite.name} 文化纪录片`, description: '深入了解宗教文化背景',
      url: 'https://cdn.zuting.org/demo/holy-site-documentary.mp4',
      thumbnailUrl: 'https://cdn.zuting.org/demo/holy-site-doc-thumb.jpg',
      duration: 600, sortOrder: 0,
    });
  }
  if (firstTemple) {
    mediaItems.push(
      {
        entityType: 'TEMPLE', entityId: firstTemple.id, mediaType: 'VIDEO',
        title: `${firstTemple.name} 建筑巡礼`, description: `探索${firstTemple.name}的千年建筑`,
        url: 'https://cdn.zuting.org/demo/temple-architecture.mp4',
        thumbnailUrl: 'https://cdn.zuting.org/demo/temple-arch-thumb.jpg',
        duration: 240, sortOrder: 0,
      },
      {
        entityType: 'TEMPLE', entityId: firstTemple.id, mediaType: 'AUDIO',
        title: `${firstTemple.name} 诵经录音`, description: '感受祖庭的清净氛围',
        url: 'https://cdn.zuting.org/demo/temple-chanting.mp3',
        duration: 300, sortOrder: 1,
      },
    );
  }
  for (const item of mediaItems) {
    await prisma.mediaContent.create({ data: item });
  }
  console.log(`  ✓ ${mediaItems.length} media content items created`);

  console.log('\nSeed complete!');
  console.log(`  Religions: ${religions.length}`);
  console.log(`  Holy Sites: ${holySites.length}`);
  console.log(`  Temples: ${temples.length}`);
  console.log(`  Patriarchs: ${patriarchs.length}`);
  console.log(`  Teachings: ${teachings.length}`);
  console.log(`  Seals: ${seals.length}`);
  console.log(`  Routes: ${routes.length}`);
  console.log(`  AI Configs: ${aiConfigs.length}`);
  console.log(`  Media Content: ${mediaItems.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
