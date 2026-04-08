import { PrismaClient, SealSeries, RouteCategory, RouteDifficulty, RouteStatus } from '@prisma/client';
import { HOLY_SITE_IMAGES, TEMPLE_IMAGES, PATRIARCH_IMAGES, ROUTE_IMAGES } from './seed-images';

const prisma = new PrismaClient();

// ── Religion data ──────────────────────────────────────
import { RELIGION_DEEP_CONTENT } from './seed-religion-content';
import { RELIGION_BUSINESS_CONTENT } from './seed-religion-business';
import { RELIGION_BUSINESS_CASES } from './seed-religion-business-cases';

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

// ── Route data (21条路线: 13禅宗+2佛教+1道教+1基督教+1伊斯兰+1印度教+2跨文化) ──

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
  // ═══ 11. 禅宗：虚云大师路线 ═══
  {
    slug: 'xuyun-master-route',
    title: '虚云大师朝圣路线',
    titleEn: 'Master Xuyun Pilgrimage Route',
    subtitle: '追随一代禅门泰斗，走访五大重建祖庭',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.CHALLENGING,
    duration: 8, nights: 7,
    highlights: ['虚云重建五寺', '云居山禅修', '鸡足山朝圣', '鼓山涌泉寺', '南华寺六祖真身'],
    description: '虚云老和尚(1840-1959)是近代禅宗最伟大的高僧，一生重建六大祖庭。本路线从福州鼓山涌泉寺出发，经韶关南华寺、乳源云门寺、江西云居山真如禅寺，最终抵达云南鸡足山祝圣寺，完整追寻虚云大师一生弘法足迹。每站深度体验禅修、素斋、早晚课，感受百年禅风。',
    itinerary: [
      { day: 1, title: '福州·鼓山涌泉寺', activities: ['涌泉寺朝拜(虚云早年驻锡处)', '鼓山摩崖石刻', '喝水岩品茶', '涌泉寺晚课'], meals: ['午餐：涌泉寺素斋', '晚餐：福州鱼丸'], accommodation: '福州市区酒店' },
      { day: 2, title: '福州→韶关', activities: ['高铁前往韶关', '抵达后游览韶关风采楼', '入住南华寺附近'], meals: ['午餐：高铁简餐', '晚餐：韶关菜'], accommodation: '韶关曹溪温泉酒店' },
      { day: 3, title: '韶关·南华寺全日', activities: ['凌晨早课体验', '六祖真身瞻仰', '虚云纪念堂', '抄经体验', '曹溪佛学院参观'], meals: ['午餐：南华寺百年素斋', '晚餐：韶关菜'], accommodation: '韶关曹溪温泉酒店' },
      { day: 4, title: '韶关→乳源·云门寺', activities: ['驱车前往乳源(1.5h)', '云门山大觉禅寺朝拜', '虚云重建云门记展览', '云门饼品尝', '禅堂坐香体验'], meals: ['午餐：云门寺素斋', '晚餐：乳源瑶族菜'], accommodation: '乳源县城酒店' },
      { day: 5, title: '乳源→江西永修·云居山', activities: ['驱车至韶关机场飞南昌', '转车前往永修云居山', '真如禅寺朝拜', '虚云舍利塔'], meals: ['午餐：途中简餐', '晚餐：真如禅寺素斋'], accommodation: '云居山山上客房' },
      { day: 6, title: '云居山全日禅修', activities: ['凌晨4:00随僧早课', '出坡劳作体验(农禅并重)', '禅堂坐香', '虚云老和尚纪念馆', '夜间行香'], meals: ['三餐均为禅寺过堂'], accommodation: '云居山山上客房' },
      { day: 7, title: '云居山→昆明→大理·鸡足山', activities: ['下山至南昌飞昆明', '转车前往大理宾川', '鸡足山脚住宿'], meals: ['午餐：云南过桥米线', '晚餐：白族菜'], accommodation: '鸡足山脚酒店' },
      { day: 8, title: '鸡足山·祝圣寺·返程', activities: ['登鸡足山金顶观日出', '祝圣寺朝拜(虚云重建)', '迦叶殿瞻仰', '下山返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 568000, // ¥5,680
    included: ['全程交通(含2段飞机)', '7晚住宿(含1晚禅寺客房)', '景点门票', '专业佛教文化导游', '素斋体验5次', '禅修指导'],
    excluded: ['往返出发地大交通', '个人消费', '旅行保险', '鸡足山索道(可选)'],
    tips: ['云居山禅修需遵守寺规：凌晨4点起床', '全程以素食为主，可自备零食', '山区昼夜温差大，备好保暖衣物', '鸡足山海拔3248m，注意高反'],
    season: '春秋两季(3-5月/9-11月)',
    groupSize: '4-12人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 12. 禅宗：马祖道一路线 ═══
  {
    slug: 'mazu-daoyi-route',
    title: '马祖道一禅法路线',
    titleEn: 'Mazu Daoyi Zen Route',
    subtitle: '"平常心是道"——追随洪州宗祖师足迹',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.MODERATE,
    duration: 5, nights: 4,
    highlights: ['洪州宗祖庭', '马祖道场', '百丈清规发源地', '江西禅宗文化'],
    description: '马祖道一(709-788)是中国禅宗史上最重要的祖师之一，开创洪州宗，提出"平常心是道"，弟子遍天下(139人得法)。本路线从马祖出生地四川什邡出发，经江西靖安宝峰寺(马祖道场)，至奉新百丈山(百丈怀海清规发源地)，追寻洪州禅法的源流。',
    itinerary: [
      { day: 1, title: '成都→什邡·马祖故里', activities: ['驱车前往什邡(1.5h)', '马祖故里纪念馆', '罗汉寺(马祖出家处)', '什邡古镇漫步'], meals: ['午餐：什邡豆腐宴', '晚餐：川菜'], accommodation: '什邡市区酒店' },
      { day: 2, title: '什邡→南昌', activities: ['飞往南昌', '滕王阁参观', '佑民寺(马祖曾驻锡)', '南昌老街漫步'], meals: ['午餐：南昌拌粉', '晚餐：赣菜'], accommodation: '南昌市区酒店' },
      { day: 3, title: '南昌→靖安·宝峰寺', activities: ['驱车前往靖安(2h)', '宝峰寺朝拜(马祖道场)', '马祖塔院瞻仰', '靖安三爪仑风景区'], meals: ['午餐：宝峰寺素斋', '晚餐：靖安农家菜'], accommodation: '靖安县城酒店' },
      { day: 4, title: '靖安→奉新·百丈山', activities: ['驱车前往奉新(1.5h)', '百丈寺朝拜', '百丈怀海"清规"发源地', '天下清规碑', '"一日不作一日不食"体验'], meals: ['午餐：百丈寺素斋', '晚餐：奉新菜'], accommodation: '奉新县城酒店' },
      { day: 5, title: '奉新→南昌·返程', activities: ['驱车返回南昌(1.5h)', '绳金塔', '送站返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 298000, // ¥2,980
    included: ['内段机票1程', '全程地面交通', '4晚住宿', '景点门票', '导游', '素斋体验2次'],
    excluded: ['往返出发地大交通', '个人消费', '旅行保险'],
    tips: ['宝峰寺环境幽静适合打坐冥想', '百丈山路较陡建议穿登山鞋', '江西春秋气候宜人'],
    season: '四季皆宜，春秋最佳',
    groupSize: '2-8人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 13. 禅宗：百丈怀海路线 ═══
  {
    slug: 'baizhang-huaihai-route',
    title: '百丈怀海·禅门清规路线',
    titleEn: 'Baizhang Huaihai Chan Rules Route',
    subtitle: '"一日不作，一日不食"——农禅并重的开创者',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.MODERATE,
    duration: 4, nights: 3,
    highlights: ['百丈清规发源地', '农禅并重体验', '江西禅宗祖庭群', '禅茶文化'],
    description: '百丈怀海(720-814)是马祖道一的大弟子，制定《百丈清规》，开创"农禅并重"的丛林制度，奠定了中国禅宗寺院管理的基本模式。本路线深度探访百丈山及周边禅宗祖庭，亲身体验农禅生活。',
    itinerary: [
      { day: 1, title: '南昌→奉新·百丈山', activities: ['驱车前往奉新百丈山(2h)', '百丈寺朝拜', '百丈怀海祖师塔', '"天下清规"碑亭', '禅茶品鉴'], meals: ['午餐：百丈寺素斋', '晚餐：山居晚餐'], accommodation: '百丈山禅修客房' },
      { day: 2, title: '百丈山农禅体验', activities: ['凌晨随僧早课', '出坡体验(种菜/砍柴)', '禅堂坐香', '百丈山徒步', '抄写《百丈清规》'], meals: ['三餐过堂体验'], accommodation: '百丈山禅修客房' },
      { day: 3, title: '百丈山→靖安·宝峰寺', activities: ['驱车前往靖安宝峰寺(1.5h)', '宝峰寺朝拜(马祖道场)', '马祖塔院', '靖安古城漫步'], meals: ['午餐：宝峰寺素斋', '晚餐：靖安菜'], accommodation: '靖安县城酒店' },
      { day: 4, title: '靖安→南昌·返程', activities: ['三爪仑森林公园晨走', '驱车返回南昌', '送站返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 198000, // ¥1,980
    included: ['全程交通', '3晚住宿(含1晚禅修客房)', '景点门票', '导游', '农禅体验', '素斋'],
    excluded: ['往返南昌大交通', '个人消费'],
    tips: ['农禅体验需凌晨4点起床，请做好心理准备', '山上手机信号较弱', '建议穿耐脏衣物参加出坡劳作'],
    season: '春秋两季(4-5月/9-10月)',
    groupSize: '4-12人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 14. 禅宗：临济义玄路线 ═══
  {
    slug: 'linji-yixuan-route',
    title: '临济义玄·棒喝禅风路线',
    titleEn: 'Linji Yixuan Chan Route',
    subtitle: '"临济喝，德山棒"——体验最刚猛的禅法',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.MODERATE,
    duration: 5, nights: 4,
    highlights: ['临济祖庭', '赵州柏林禅寺', '正定古城', '河北禅宗文化'],
    description: '临济义玄(?-866)创立临济宗——中国禅宗五家中影响最大、传承最广的宗派。其"棒喝"教法震古烁今，"临济四喝""四料拣"至今是禅宗经典。本路线从正定临济寺出发，经赵州柏林禅寺，至黄檗山(黄檗希运道场)，追寻临济禅法的源流。',
    itinerary: [
      { day: 1, title: '石家庄→正定·临济寺', activities: ['驱车前往正定(40min)', '临济寺朝拜(临济宗祖庭)', '义玄祖师塔瞻仰', '正定古城墙漫步', '隆兴寺参观'], meals: ['午餐：正定八大碗', '晚餐：河北菜'], accommodation: '正定古城客栈' },
      { day: 2, title: '正定→赵县·柏林禅寺', activities: ['驱车前往赵县(1h)', '柏林禅寺朝拜(赵州从谂道场)', '赵州桥参观', '生活禅体验', '柏林禅寺茶禅'], meals: ['午餐：柏林禅寺素斋', '晚餐：赵县菜'], accommodation: '柏林禅寺居士楼' },
      { day: 3, title: '赵县·生活禅全日', activities: ['柏林禅寺早课', '净慧长老纪念馆', '禅堂坐香', '经行体验', '赵州"吃茶去"公案研习'], meals: ['三餐过堂'], accommodation: '柏林禅寺居士楼' },
      { day: 4, title: '赵县→宜丰·黄檗山', activities: ['飞往南昌转宜丰(3h)', '黄檗山黄檗寺朝拜', '黄檗希运祖师塔', '黄檗断际禅法研习'], meals: ['午餐：途中简餐', '晚餐：宜丰菜'], accommodation: '宜丰县城酒店' },
      { day: 5, title: '宜丰→南昌·返程', activities: ['黄檗山晨走', '驱车返回南昌(2.5h)', '送站返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 328000, // ¥3,280
    included: ['内段机票1程', '全程地面交通', '4晚住宿(含1晚寺院)', '景点门票', '导游', '禅修指导', '素斋'],
    excluded: ['往返出发地大交通', '个人消费', '旅行保险'],
    tips: ['柏林禅寺每年7月举办"生活禅夏令营"可提前报名', '正定古城值得多留时间', '黄檗山偏僻但风景极美'],
    season: '春秋两季(4-5月/9-11月)',
    groupSize: '2-10人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 15. 禅宗：洞山良价·曹洞宗路线 ═══
  {
    slug: 'dongshan-caodong-route',
    title: '洞山良价·曹洞宗祖庭路线',
    titleEn: 'Dongshan Liangjie Caodong Route',
    subtitle: '"洞山五位"——默照禅法的源头',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.MODERATE,
    duration: 5, nights: 4,
    highlights: ['曹洞宗两大祖庭', '洞山五位君臣', '默照禅法', '江西禅宗圣地'],
    description: '洞山良价(807-869)与弟子曹山本寂共创曹洞宗，其"五位君臣"法门精密圆融，默照禅法影响深远，后由道元禅师传至日本成为最大宗派。本路线走访洞山普利禅寺、曹山宝积寺等曹洞宗核心祖庭，深度体验默照禅风。',
    itinerary: [
      { day: 1, title: '南昌→宜丰·洞山', activities: ['驱车前往宜丰洞山(2.5h)', '洞山普利禅寺朝拜(曹洞宗祖庭)', '良价祖师塔', '洞山夜话水涧观月', '品洞山禅茶'], meals: ['午餐：途中简餐', '晚餐：洞山素斋'], accommodation: '洞山禅修客房' },
      { day: 2, title: '洞山全日禅修', activities: ['早课+坐香', '"五位君臣"公案研习', '洞山溪谷徒步', '过午不食体验', '晚间禅堂行香'], meals: ['早餐', '午斋'], accommodation: '洞山禅修客房' },
      { day: 3, title: '洞山→抚州·曹山', activities: ['驱车前往抚州宜黄曹山(3h)', '曹山宝积寺朝拜(曹洞宗祖庭)', '本寂祖师塔', '曹山禅茶园'], meals: ['午餐：途中简餐', '晚餐：抚州菜'], accommodation: '宜黄县城酒店' },
      { day: 4, title: '曹山→云居山', activities: ['驱车前往永修云居山(3h)', '真如禅寺朝拜', '虚云纪念馆', '云居山农禅体验'], meals: ['午餐：途中简餐', '晚餐：真如禅寺过堂'], accommodation: '云居山客房' },
      { day: 5, title: '云居山→南昌·返程', activities: ['云居山日出', '下山返回南昌(2h)', '送站返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 268000, // ¥2,680
    included: ['全程交通', '4晚住宿(含2晚禅修客房)', '景点门票', '导游', '禅修指导', '素斋体验'],
    excluded: ['往返南昌大交通', '个人消费', '旅行保险'],
    tips: ['洞山禅修客房条件简朴，建议自备洗漱用品', '曹山到云居山山路较多注意晕车', '默照禅讲究"只管打坐"，初学者可提前了解'],
    season: '春秋两季(3-5月/9-11月)',
    groupSize: '4-10人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 16. 禅宗：赵州从谂路线 ═══
  {
    slug: 'zhaozhou-congshen-route',
    title: '赵州从谂·"吃茶去"路线',
    titleEn: 'Zhaozhou Congshen Tea Chan Route',
    subtitle: '"吃茶去"——禅茶一味的千年传承',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.EASY,
    duration: 4, nights: 3,
    highlights: ['赵州禅茶一味', '柏林禅寺', '赵州桥', '生活禅体验'],
    description: '赵州从谂(778-897)是禅宗史上最具智慧的禅师之一，"赵州茶""狗子佛性""庭前柏树子"等公案家喻户晓。他120岁高龄示寂，一生以"平实"著称。本路线以赵州柏林禅寺为核心，深度体验"禅茶一味"的生活禅文化。',
    itinerary: [
      { day: 1, title: '石家庄→赵县·柏林禅寺', activities: ['驱车前往赵县(1h)', '柏林禅寺朝拜', '赵州从谂祖师塔', '赵州桥参观', '禅茶一味体验'], meals: ['午餐：柏林禅寺素斋', '晚餐：赵县菜'], accommodation: '柏林禅寺居士楼' },
      { day: 2, title: '柏林禅寺·生活禅全日', activities: ['凌晨早课', '坐香+行香', '净慧长老"生活禅"理念研习', '禅茶品鉴(学泡赵州茶)', '经行赵州桥'], meals: ['三餐过堂'], accommodation: '柏林禅寺居士楼' },
      { day: 3, title: '赵县→正定古城', activities: ['驱车前往正定(1h)', '临济寺参观', '隆兴寺(宋代铜佛)', '正定古城漫步', '天宁寺凌霄塔'], meals: ['午餐：正定素斋', '晚餐：正定八大碗'], accommodation: '正定古城客栈' },
      { day: 4, title: '正定→石家庄·返程', activities: ['正定古城晨走', '广惠寺华塔', '返回石家庄送站'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 168000, // ¥1,680
    included: ['全程交通', '3晚住宿(含2晚寺院)', '景点门票', '导游', '禅茶体验', '素斋'],
    excluded: ['往返石家庄大交通', '个人消费'],
    tips: ['柏林禅寺夏令营每年7月举办，名额有限需提前申请', '寺院住宿条件简朴但整洁', '"吃茶去"是赵州最著名公案，建议提前了解'],
    season: '四季皆宜，春秋最佳',
    groupSize: '2-12人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 17. 禅宗：云门文偃路线 ═══
  {
    slug: 'yunmen-wenyan-route',
    title: '云门文偃·云门宗路线',
    titleEn: 'Yunmen Wenyan Route',
    subtitle: '"云门一字关"——最简洁犀利的禅法',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.EASY,
    duration: 4, nights: 3,
    highlights: ['云门宗祖庭', '南华寺', '丹霞山', '粤北禅宗文化'],
    description: '云门文偃(864-949)创立云门宗，以"一字关"闻名——弟子问法，常以一字作答，截断葛藤。其"云门三句"(涵盖乾坤、截断众流、随波逐浪)为禅宗经典。本路线以粤北为核心，走访云门寺、南华寺及丹霞山，体验云门禅风。',
    itinerary: [
      { day: 1, title: '广州→韶关·南华寺', activities: ['高铁前往韶关(1.5h)', '南华寺朝拜', '六祖真身瞻仰', '虚云纪念堂'], meals: ['午餐：南华寺素斋', '晚餐：韶关菜'], accommodation: '韶关市区酒店' },
      { day: 2, title: '韶关→乳源·云门寺', activities: ['驱车前往乳源(1.5h)', '云门山大觉禅寺朝拜(云门宗祖庭)', '文偃祖师塔', '云门饼品尝', '禅堂坐香'], meals: ['午餐：云门寺素斋', '晚餐：乳源瑶族菜'], accommodation: '乳源温泉酒店' },
      { day: 3, title: '乳源→丹霞山', activities: ['驱车前往丹霞山(1h)', '丹霞山徒步(长老峰)', '锦石岩寺(悬崖古寺)', '丹霞日落'], meals: ['午餐：丹霞山农家菜', '晚餐：韶关菜'], accommodation: '丹霞山景区酒店' },
      { day: 4, title: '丹霞山→广州·返程', activities: ['丹霞日出', '驱车返回韶关', '高铁返广州'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 228000, // ¥2,280
    included: ['高铁票', '全程地面交通', '3晚住宿', '景点门票', '导游', '素斋体验2次'],
    excluded: ['往返广州大交通', '个人消费', '丹霞山索道(可选)'],
    tips: ['云门寺佛源老和尚道风严谨，参访请遵守寺规', '丹霞山徒步约3小时，备好水和零食', '乳源瑶族风情独特值得体验'],
    season: '春秋两季(3-5月/9-11月)',
    groupSize: '2-8人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 18. 禅宗：禅宗五家祖庭大巡礼 ═══
  {
    slug: 'zen-five-houses-grand-tour',
    title: '禅宗五家祖庭大巡礼',
    titleEn: 'Five Houses of Zen Grand Pilgrimage',
    subtitle: '临济·曹洞·云门·法眼·沩仰——一次走遍五家祖庭',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.CHALLENGING,
    duration: 10, nights: 9,
    highlights: ['禅宗五家七宗', '十大祖庭巡礼', '深度禅修体验', '江西福建广东三省'],
    description: '中国禅宗在唐末五代形成五大流派(临济、曹洞、云门、法眼、沩仰)，史称"一花开五叶"。本路线是最完整的禅宗文化朝圣之旅，10天走遍五家核心祖庭。从河北临济寺出发，经江西洞山、曹山、仰山，至广东云门寺、福建地藏院(法眼道场)，最终在南华寺圆满。适合深度禅宗爱好者。',
    itinerary: [
      { day: 1, title: '石家庄·正定·临济寺(临济宗)', activities: ['临济寺朝拜', '义玄祖师塔', '正定古城', '隆兴寺'], meals: ['午餐：正定素斋', '晚餐：河北菜'], accommodation: '正定古城客栈' },
      { day: 2, title: '正定→赵县→南昌', activities: ['柏林禅寺参访(赵州禅)', '赵州桥', '飞往南昌'], meals: ['午餐：柏林禅寺素斋'], accommodation: '南昌市区酒店' },
      { day: 3, title: '南昌→宜丰·洞山(曹洞宗)', activities: ['驱车前往洞山(2.5h)', '洞山普利禅寺朝拜', '良价祖师塔', '洞山溪谷'], meals: ['午餐：途中简餐', '晚餐：洞山素斋'], accommodation: '洞山禅修客房' },
      { day: 4, title: '洞山→宜黄·曹山(曹洞宗)', activities: ['驱车前往曹山(3h)', '曹山宝积寺朝拜', '本寂祖师塔', '曹山禅茶'], meals: ['午餐：途中简餐', '晚餐：抚州菜'], accommodation: '宜黄县城酒店' },
      { day: 5, title: '曹山→宜春·仰山(沩仰宗)', activities: ['驱车前往宜春仰山(2.5h)', '栖隐寺朝拜(仰山慧寂道场)', '仰山文塔', '仰山风景区'], meals: ['午餐：途中简餐', '晚餐：宜春菜'], accommodation: '宜春市区酒店' },
      { day: 6, title: '宜春→长沙·沩山(沩仰宗)', activities: ['驱车前往宁乡沩山(3h)', '密印寺朝拜(沩山灵祐道场)', '沩山风景区', '千年银杏'], meals: ['午餐：密印寺素斋', '晚餐：湘菜'], accommodation: '长沙市区酒店' },
      { day: 7, title: '长沙→韶关→乳源·云门寺(云门宗)', activities: ['高铁前往韶关(3h)', '转车前往乳源', '云门山大觉禅寺朝拜', '文偃祖师塔'], meals: ['午餐：高铁简餐', '晚餐：云门寺素斋'], accommodation: '乳源酒店' },
      { day: 8, title: '乳源→韶关·南华寺', activities: ['南华寺朝拜', '六祖真身', '曹溪佛学院', '禅堂坐香'], meals: ['午餐：南华寺素斋', '晚餐：韶关菜'], accommodation: '韶关酒店' },
      { day: 9, title: '韶关→南京·法眼宗', activities: ['飞往南京', '清凉寺参访(法眼文益道场)', '栖霞寺', '鸡鸣寺'], meals: ['午餐：南京素菜', '晚餐：金陵菜'], accommodation: '南京市区酒店' },
      { day: 10, title: '南京·返程', activities: ['灵谷寺', '中山陵', '送站返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 898000, // ¥8,980
    included: ['全程交通(含3段飞机/高铁)', '9晚住宿(含1晚禅修客房)', '景点门票', '专业禅宗文化导游', '素斋体验6次', '禅修指导'],
    excluded: ['往返出发地大交通', '个人消费', '旅行保险'],
    tips: ['行程较长建议体力充沛者参加', '每站祖庭都有独特禅风可提前研读相关公案', '建议携带《五灯会元》或相关禅宗读物', '部分路段为山路注意晕车'],
    season: '春秋两季(4-5月/9-10月)',
    groupSize: '4-10人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 19. 禅宗：沩山灵祐·沩仰宗路线 ═══
  {
    slug: 'weishan-lingyou-route',
    title: '沩山灵祐·沩仰宗路线',
    titleEn: 'Weishan Lingyou Weiyangzong Route',
    subtitle: '禅宗五家中最早创立的宗派',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.MODERATE,
    duration: 4, nights: 3,
    highlights: ['沩仰宗两大祖庭', '密印寺千年古刹', '仰山风景', '湖南江西禅文化'],
    description: '沩仰宗是禅宗五家中最早创立的宗派，由沩山灵祐(771-853)和弟子仰山慧寂共同开创。以"圆相"(画圈)接引学人著称，师徒默契被誉为"父子投机"。本路线走访沩山密印寺和仰山栖隐寺两大祖庭。',
    itinerary: [
      { day: 1, title: '长沙→宁乡·沩山密印寺', activities: ['驱车前往宁乡沩山(2h)', '密印寺朝拜(沩仰宗祖庭)', '灵祐祖师塔', '万佛殿(12988尊金佛)', '沩山毛尖茶品鉴'], meals: ['午餐：密印寺素斋', '晚餐：沩山农家菜'], accommodation: '沩山山居民宿' },
      { day: 2, title: '沩山·禅修与徒步', activities: ['密印寺早课', '沩山徒步(千年银杏群)', '参禅体验', '沩山禅茶文化'], meals: ['午餐：山居素食', '晚餐：农家菜'], accommodation: '沩山山居民宿' },
      { day: 3, title: '沩山→宜春·仰山栖隐寺', activities: ['驱车前往宜春仰山(4h)', '栖隐寺朝拜(仰山慧寂道场)', '仰山文塔', '仰山梯田风光'], meals: ['午餐：途中简餐', '晚餐：宜春菜'], accommodation: '宜春温汤温泉酒店' },
      { day: 4, title: '宜春→长沙/南昌·返程', activities: ['温汤温泉晨浴', '驱车返回长沙或南昌', '送站返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 218000, // ¥2,180
    included: ['全程交通', '3晚住宿', '景点门票', '导游', '禅修体验', '素斋2次'],
    excluded: ['往返长沙大交通', '个人消费', '温泉门票(可选)'],
    tips: ['沩山海拔较高，夏天也需备薄外套', '密印寺万佛殿非常壮观不可错过', '仰山到宜春的山路弯多注意晕车'],
    season: '春夏秋三季(4-10月)',
    groupSize: '2-8人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 20. 禅宗：法眼文益·法眼宗路线 ═══
  {
    slug: 'fayan-wenyi-route',
    title: '法眼文益·法眼宗路线',
    titleEn: 'Fayan Wenyi Route',
    subtitle: '"一切现成"——禅宗五家最后创立的宗派',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.EASY,
    duration: 4, nights: 3,
    highlights: ['法眼宗祖庭', '金陵佛教文化', '永明延寿', '江南禅韵'],
    description: '法眼文益(885-958)创立法眼宗，以"一切现成"为宗旨，融合华严与禅法。其弟子永明延寿编撰《宗镜录》100卷，为禅宗最重要的百科全书。本路线以南京、杭州为核心，走访法眼宗祖庭及永明延寿道场。',
    itinerary: [
      { day: 1, title: '南京·清凉寺+栖霞寺', activities: ['清凉寺参访(法眼文益道场)', '扫叶楼', '栖霞寺朝拜(三论宗祖庭)', '千佛岩石刻'], meals: ['午餐：南京素菜', '晚餐：金陵菜'], accommodation: '南京市区酒店' },
      { day: 2, title: '南京→杭州', activities: ['高铁前往杭州(1.5h)', '灵隐寺朝拜', '飞来峰造像', '永福禅寺品茶'], meals: ['午餐：灵隐寺素面', '晚餐：杭帮菜'], accommodation: '杭州西湖附近酒店' },
      { day: 3, title: '杭州·净慈寺+径山寺', activities: ['净慈寺朝拜(永明延寿住持处)', '南屏晚钟', '径山寺参访(径山茶宴)', '径山抹茶体验'], meals: ['午餐：径山寺素斋', '晚餐：杭州菜'], accommodation: '杭州市区酒店' },
      { day: 4, title: '杭州·返程', activities: ['西湖晨走', '雷峰塔', '送站返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 258000, // ¥2,580
    included: ['高铁票', '全程交通', '3晚住宿', '景点门票', '导游', '素斋体验', '径山茶宴'],
    excluded: ['往返出发地大交通', '个人消费'],
    tips: ['灵隐寺节假日人多建议早去', '径山寺需提前预约茶宴体验', '杭州春季最美(3-4月)'],
    season: '春秋两季(3-4月/9-11月)',
    groupSize: '2-10人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
  // ═══ 21. 禅宗：大慧宗杲·看话禅路线 ═══
  {
    slug: 'dahui-zonggao-route',
    title: '大慧宗杲·看话禅路线',
    titleEn: 'Dahui Zonggao Kanhua Chan Route',
    subtitle: '"参话头"——宋代禅宗复兴的旗手',
    category: RouteCategory.ZEN,
    difficulty: RouteDifficulty.MODERATE,
    duration: 5, nights: 4,
    highlights: ['看话禅发源地', '径山祖庭', '宋代禅宗文化', '浙江安徽禅地'],
    description: '大慧宗杲(1089-1163)是宋代临济宗杨岐派的复兴者，创立"看话禅"(参话头)修行法门，与默照禅并列为禅宗两大实修体系。他曾因反对秦桧被流放，仍坚持弘法。本路线走访其主要弘法道场。',
    itinerary: [
      { day: 1, title: '杭州→余杭·径山寺', activities: ['驱车前往径山(1h)', '径山万寿禅寺朝拜(大慧宗杲住持处)', '径山茶宴体验', '参话头实修指导'], meals: ['午餐：径山素斋', '晚餐：杭州菜'], accommodation: '杭州市区酒店' },
      { day: 2, title: '杭州→宁国·妙觉寺', activities: ['驱车前往安徽宁国(3h)', '妙觉寺遗址参访', '宁国竹海徒步', '皖南山水'], meals: ['午餐：皖南农家菜', '晚餐：宣城菜'], accommodation: '宁国市区酒店' },
      { day: 3, title: '宁国→泾县·宝胜寺', activities: ['驱车前往泾县(1.5h)', '宝胜寺遗址', '桃花潭', '查济古村'], meals: ['午餐：泾县菜', '晚餐：农家菜'], accommodation: '泾县民宿' },
      { day: 4, title: '泾县→宣城→南京', activities: ['驱车返回南京(3h)', '鸡鸣寺', '玄武湖', '明城墙'], meals: ['午餐：途中简餐', '晚餐：金陵菜'], accommodation: '南京市区酒店' },
      { day: 5, title: '南京·返程', activities: ['栖霞寺晨课', '中山陵', '送站返程'], meals: ['早餐'], accommodation: '' },
    ],
    priceFrom: 298000, // ¥2,980
    included: ['全程交通', '4晚住宿', '景点门票', '导游', '径山茶宴', '参话头禅修指导'],
    excluded: ['往返出发地大交通', '个人消费', '旅行保险'],
    tips: ['"看话禅"核心是参"念佛是谁"或"狗子佛性"等话头', '径山茶宴是日本茶道的源头', '皖南秋景极美推荐11月'],
    season: '春秋两季(3-5月/9-11月)',
    groupSize: '4-10人',
    religionSlug: 'buddhism',
    siteLinks: [],
  },
];

// ══════════════════════════════════════════════════════
//  Main seed function
// ══════════════════════════════════════════════════════

async function main() {
  console.log('Seeding database...');

  // ── 0. Create demo admin user ──
  console.log('Creating demo admin user...');
  await prisma.user.upsert({
    where: { phone: '13700137000' },
    update: { passwordHash: '$2b$10$9GHUGResoWIYf0PRzOL9A.g.UXnRGMY2fApK0mkdpGrpbOX.8jZZy' },
    create: {
      phone: '13700137000',
      email: 'admin@joinus.com',
      nickname: '管理员',
      passwordHash: '$2b$10$9GHUGResoWIYf0PRzOL9A.g.UXnRGMY2fApK0mkdpGrpbOX.8jZZy',
      role: 'ADMIN',
      isActive: true,
      phoneVerified: true,
      language: 'zh-CN',
    },
  });
  console.log('  ✓ Demo admin: 13700137000 / 123456');

  // ── 1. Upsert Religions ──
  console.log('Creating 12 religions...');
  const religionMap: Record<string, string> = {};

  for (const r of religions) {
    const deep = RELIGION_DEEP_CONTENT[r.slug] ?? {};
    const biz = RELIGION_BUSINESS_CONTENT[r.slug] ?? {};
    const deepData = {
      heroImage: deep.heroImage ?? null,
      tagline: deep.tagline ?? null,
      summary: deep.summary ?? null,
      foundedYear: deep.foundedYear ?? null,
      founder: deep.founder ?? null,
      followers: deep.followers ?? null,
      origin: deep.origin ?? null,
      development: deep.development ?? null,
      keyEvents: (deep.keyEvents as unknown) ?? undefined,
      contributions: deep.contributions ?? null,
      controversies: deep.controversies ?? null,
      sacredTexts: (deep.sacredTexts as unknown) ?? undefined,
      businessPhilosophy: biz.businessPhilosophy ?? null,
      businessValues: (biz.businessValues as unknown) ?? undefined,
      businessInsight: biz.businessInsight ?? null,
      businessCases: (RELIGION_BUSINESS_CASES[r.slug] as unknown) ?? undefined,
    };
    const record = await prisma.religion.upsert({
      where: { slug: r.slug },
      update: {
        name: r.name,
        nameEn: r.nameEn,
        symbol: r.symbol,
        color: r.color,
        ...deepData,
      },
      create: {
        name: r.name,
        nameEn: r.nameEn,
        slug: r.slug,
        symbol: r.symbol,
        color: r.color,
        ...deepData,
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

  // ── 4m. 基督教先贤 (Christian Patriarchs/Saints) ──
  console.log('  Creating Christian patriarchs (4m)...');

  const christianityId = religionMap['christianity'];

  // Update existing Jesus with full data + school field
  const existingJesus = await prisma.patriarch.findFirst({ where: { name: '耶稣基督' } });
  const jesus = existingJesus
    ? await prisma.patriarch.update({
        where: { id: existingJesus.id },
        data: {
          nameEn: 'Jesus Christ',
          dates: '前4-30',
          title: '救世主·神之子·人子',
          school: '耶稣与使徒',
          generation: 1,
          biography: '耶稣基督（Jesus Christ），基督教创立者，被基督徒尊为神之子、弥赛亚（救世主）。约公元前4年生于伯利恒，在拿撒勒长大。约30岁时受施洗约翰洗礼后开始公开传道，宣讲天国的福音——神的国度已经临近。拣选十二使徒，以比喻和神迹教导民众。核心教导：爱神爱人、宽恕仇敌、怜悯穷人。约公元30年在耶路撒冷被罗马总督彼拉多判处十字架刑，三日后从死里复活，四十日后升天。基督徒相信耶稣的死与复活完成了对人类罪的救赎。其教导记载于《新约》四福音书。全球约24亿基督徒以其为信仰中心。',
          coreTeaching: '爱神与爱人是一切律法的总纲。"你要尽心、尽性、尽意爱主你的神。其次也相仿，就是要爱人如己。"登山宝训是基督伦理的核心——虚心、哀恸、温柔、慕义、怜恤、清心、使人和睦。十字架的救赎——"神爱世人，甚至将他的独生子赐给他们，叫一切信他的不至灭亡，反得永生。"(约3:16)',
          achievements: '基督教创立者。其教导改变了人类历史的走向。十字架和复活成为基督教信仰核心。《新约》四福音书记录其言行。全球24亿基督徒的信仰中心。公元纪年以其诞生为分界。深刻影响西方文明的伦理、法律、艺术、哲学。',
          templeNames: [
            { name: '圣墓教堂', nameEn: 'Church of the Holy Sepulchre', role: '耶稣受难与复活之地', location: '以色列耶路撒冷' },
            { name: '主诞堂', nameEn: 'Church of the Nativity', role: '耶稣诞生之地', location: '巴勒斯坦伯利恒' },
            { name: '橄榄山', nameEn: 'Mount of Olives', role: '升天之地', location: '耶路撒冷' },
          ],
          koans: [
            { title: '登山宝训', description: '耶稣在山上教导门徒：虚心的人有福了，因为天国是他们的。哀恸的人有福了，因为他们必得安慰。温柔的人有福了，因为他们必承受地土。八福是基督伦理的纲领。' },
            { title: '浪子回头', description: '小儿子要求分家产，远走他乡挥霍一空。饥饿中醒悟回家，父亲远远看见就动了慈心，跑去抱着他亲嘴。这比喻展示神对迷失者无条件的爱与接纳。' },
            { title: '好撒玛利亚人', description: '一个人被强盗打伤，祭司和利未人从旁经过不理。一个被犹太人歧视的撒玛利亚人却停下来救助他。耶稣问：谁是那人的邻舍？回答爱不分种族和身份。' },
          ],
          classicQuotes: ['我就是道路、真理、生命', '你们要彼此相爱', '施比受更为有福', '不要论断人，免得你们被论断', '在世上你们有苦难，但你们可以放心，我已经胜了世界'],
          works: [],
          imageUrl: null,
        },
      })
    : await prisma.patriarch.create({
        data: {
          name: '耶稣基督', nameEn: 'Jesus Christ', religionId: christianityId,
          dates: '前4-30', title: '救世主·神之子', school: '耶稣与使徒', generation: 1,
          biography: '基督教创立者。', coreTeaching: '爱神爱人。',
          achievements: '基督教创立者。', imageUrl: null,
        },
      });

  // Update existing Paul
  const existingPaul = await prisma.patriarch.findFirst({ where: { name: '使徒保罗' } });
  existingPaul
    ? await prisma.patriarch.update({
        where: { id: existingPaul.id },
        data: {
          nameEn: 'Apostle Paul',
          dates: '5-67',
          title: '外邦人使徒·基督教神学奠基者',
          school: '耶稣与使徒',
          generation: 3,
          biography: '使徒保罗（Apostle Paul），原名扫罗（Saul），出生于基利家的大数（今土耳其），罗马公民，法利赛人。初为迫害基督徒的急先锋。约公元33年在大马士革路上遇见复活的耶稣，经历戏剧性归信。此后三次宣教旅行，横跨小亚细亚、希腊、罗马帝国，建立大量教会。著书信十三封（或更多），占《新约》近半篇幅，系统阐述因信称义、恩典救赎、基督的身体（教会论）等核心教义。将基督教从犹太教的一个分支发展为面向全人类的普世宗教。约公元67年在罗马殉道。',
          coreTeaching: '因信称义——人不是靠遵守律法而是靠信耶稣基督而被神称为义人。"如今常存的有信，有望，有爱，这三样，其中最大的是爱。"(林前13:13) 恩典神学——救赎是神白白的恩赐，不是人的功德所能赚取。',
          achievements: '将基督教从犹太教分支发展为普世宗教。三次宣教旅行横跨罗马帝国。著新约书信十三封，系统阐述基督教核心教义。"因信称义"学说影响整个基督教神学史。被称为"基督教真正的创建者"。',
          templeNames: [
            { name: '城外圣保禄大殿', nameEn: 'Basilica of Saint Paul Outside the Walls', role: '保罗殉道埋葬之地', location: '意大利罗马' },
            { name: '大马士革直街', nameEn: 'Straight Street, Damascus', role: '保罗归信之地', location: '叙利亚大马士革' },
          ],
          koans: [
            { title: '大马士革路上', description: '扫罗正前往大马士革捉拿基督徒。忽然从天上发大光照射，他仆倒在地。听见声音说："扫罗，扫罗，你为什么逼迫我？"他问："主啊，你是谁？"回答："我就是你所逼迫的耶稣。"三天失明后，亚拿尼亚为他祷告，鳞片从眼上脱落——从逼迫者变为最伟大的传道者。' },
          ],
          classicQuotes: ['如今常存的有信、有望、有爱，其中最大的是爱', '我活着就是基督，我死了就有益处', '我什么时候软弱，什么时候就刚强了', '忘记背后，努力面前，向着标杆直跑'],
          works: [
            { title: '罗马书', description: '因信称义的系统神学论述，基督教神学基石' },
            { title: '哥林多前后书', description: '教会伦理与爱的颂歌' },
            { title: '加拉太书', description: '基督徒自由宣言' },
          ],
          imageUrl: null,
        },
      })
    : null;

  // 使徒彼得
  await prisma.patriarch.create({
    data: {
      name: '使徒彼得', nameEn: 'Apostle Peter', religionId: christianityId,
      dates: '?-64', title: '首任教宗·磐石', school: '耶稣与使徒', generation: 2,
      teacherId: jesus.id,
      biography: '使徒彼得（Apostle Peter），原名西门，加利利渔夫。耶稣最早呼召的门徒之一，十二使徒之首。耶稣称他为"矶法"（磐石），说"我要把我的教会建造在这磐石上"(太16:18)。性格冲动热忱——曾在海面上行走，也曾三次否认耶稣。五旬节后成为耶路撒冷教会领袖，一次讲道三千人受洗。后前往罗马传道。约公元64年在尼禄迫害中被倒钉十字架殉道（自认不配与耶稣同样方式受死）。天主教传统视其为首任教宗，梵蒂冈圣彼得大教堂建于其墓地之上。',
      coreTeaching: '信仰的根基是认耶稣为基督。"你是基督，是永生神的儿子"——彼得的信仰告白成为教会信仰的磐石。即使软弱跌倒，真诚悔改后仍可被恢复使用。',
      achievements: '十二使徒之首，天主教首任教宗。五旬节讲道三千人受洗。在罗马建立教会。倒钉十字架殉道。梵蒂冈圣彼得大教堂建于其墓地上。',
      templeNames: [
        { name: '圣彼得大教堂', nameEn: "St. Peter's Basilica", role: '彼得墓地上建造的大教堂', location: '梵蒂冈' },
      ],
      koans: [
        { title: '三次否认与三次托付', description: '耶稣被捕后，彼得三次否认认识耶稣，鸡叫后痛哭。复活后耶稣三次问他"你爱我吗？"三次托付"你喂养我的羊"——以三次爱的确认修复三次否认的伤痕。' },
      ],
      classicQuotes: ['你是基督，是永生神的儿子', '主啊，你有永生之道，我们还归从谁呢'],
      works: [
        { title: '彼得前后书', description: '新约书信，论苦难中的盼望' },
      ],
      imageUrl: null,
    },
  });

  // 使徒约翰
  await prisma.patriarch.create({
    data: {
      name: '使徒约翰', nameEn: 'Apostle John', religionId: christianityId,
      dates: '6-100', title: '爱的使徒·启示者', school: '耶稣与使徒', generation: 4,
      teacherId: jesus.id,
      biography: '使徒约翰（Apostle John），加利利渔夫，雅各的兄弟，十二使徒之一。被称为"耶稣所爱的那门徒"。在十字架下接受耶稣托付照顾其母亲马利亚。著《约翰福音》以独特的神学视角呈现耶稣——"太初有道，道与神同在，道就是神"(约1:1)。著《约翰一二三书》强调"神就是爱"。晚年被流放到拔摩岛，在那里获得异象著《启示录》。是十二使徒中唯一寿终正寝的（约100岁）。教会传统认为他在以弗所终老。',
      coreTeaching: '神就是爱。"我们爱，因为神先爱我们。"(约一4:19) 约翰的核心信息是：认识神即是认识爱，不爱人的不认识神。道成肉身——永恒的道（Logos）成为肉身住在人间，充充满满有恩典有真理。',
      achievements: '著《约翰福音》——最具神学深度的福音书。著《启示录》——基督教末世论经典。"神就是爱"成为基督教信仰核心表述。十二使徒中唯一寿终正寝者。',
      templeNames: [
        { name: '圣约翰教堂(以弗所)', nameEn: 'Basilica of St. John', role: '约翰终老之地', location: '土耳其以弗所' },
        { name: '拔摩岛启示洞', nameEn: 'Cave of the Apocalypse', role: '启示录写作之地', location: '希腊拔摩岛' },
      ],
      koans: [
        { title: '道成肉身', description: '"太初有道，道与神同在，道就是神。"万物是藉着他造的。"道成了肉身，住在我们中间。"(约1:1-14) 约翰以哲学语言"道"(Logos)诠释耶稣的神性与永恒性。' },
      ],
      classicQuotes: ['太初有道，道与神同在，道就是神', '神就是爱', '我们爱，因为神先爱我们', '你们必晓得真理，真理必叫你们得以自由'],
      works: [
        { title: '约翰福音', description: '最具神学深度的福音书，"道成肉身"神学' },
        { title: '启示录', description: '基督教末世论经典，拔摩岛异象' },
        { title: '约翰一二三书', description: '"神就是爱"的核心阐述' },
      ],
      imageUrl: null,
    },
  });

  // 抹大拉的马利亚
  await prisma.patriarch.create({
    data: {
      name: '抹大拉的马利亚', nameEn: 'Mary Magdalene', religionId: christianityId,
      dates: '1世纪', title: '复活首位见证者·使徒的使徒', school: '耶稣与使徒', generation: 5,
      teacherId: jesus.id,
      biography: '抹大拉的马利亚（Mary Magdalene），耶稣最忠诚的女性追随者。福音书记载耶稣曾从她身上赶出七个鬼。此后她成为跟随耶稣的女性门徒团体的核心成员。十字架下，当大多数男性门徒逃散时，马利亚忠守至最后。更关键的是——她是耶稣复活后最先看见他的人。复活的耶稣委托她去告诉其他门徒这个消息，因此东正教尊她为"使徒的使徒"（Apostola Apostolorum）。她在基督教历史中代表了忠诚、勇气和女性在信仰中的核心角色。',
      coreTeaching: '忠诚与勇气超越一切恐惧。当门徒逃散时，马利亚留在十字架下。复活的首位见证——证明信仰中女性与男性拥有同等的属灵地位和使命。',
      achievements: '耶稣复活的首位见证者。东正教尊为"使徒的使徒"。十字架下最忠诚的追随者。代表女性在基督教信仰中的核心角色。被天主教、东正教、新教共同纪念。',
      templeNames: [
        { name: '圣抹大拉教堂', nameEn: 'Church of Saint Mary Magdalene', role: '纪念马利亚', location: '以色列耶路撒冷橄榄山' },
      ],
      koans: [
        { title: '不要拉住我', description: '复活早晨，马利亚在空坟墓前哭泣。转身看见一人，以为是看园的。那人叫她名字："马利亚！"她认出是耶稣，扑上去抱住他。耶稣说："不要拉住我，去告诉弟兄们。"马利亚成为复活的第一位使者。' },
      ],
      classicQuotes: ['我已经看见了主！'],
      works: [],
      imageUrl: null,
    },
  });

  // 使徒多马
  await prisma.patriarch.create({
    data: {
      name: '使徒多马', nameEn: 'Apostle Thomas', religionId: christianityId,
      dates: '?-72', title: '印度基督教开创者·疑惑者', school: '耶稣与使徒', generation: 6,
      teacherId: jesus.id,
      biography: '使徒多马（Apostle Thomas），又称"双生子"（Didymus），十二使徒之一。以复活后的怀疑闻名——他要求亲手触摸耶稣的钉痕才肯相信，耶稣满足了他的要求后，多马发出信仰最高的告白："我的主！我的神！"传统记载多马约公元52年到达印度马拉巴尔海岸传教，在印度南部建立七个教会，成为印度基督教的开创者（圣多马基督徒至今有数百万）。约公元72年在印度金奈（马德拉斯）殉道。',
      coreTeaching: '怀疑可以通向更深的信仰。多马不是盲目否认，而是诚实地表达疑惑——耶稣不是责备他，而是回应他的需要。"那没有看见就信的有福了"——但看见后信的也是信。',
      achievements: '将基督教传入印度的第一人。约公元52年到达马拉巴尔海岸。在印度南部建立七座教会。印度圣多马基督徒（数百万）视其为始祖。"我的主我的神"为最高信仰告白。',
      templeNames: [
        { name: '圣多马大教堂', nameEn: 'San Thome Basilica', role: '多马殉道安葬之地', location: '印度金奈' },
        { name: '圣多马山', nameEn: 'St. Thomas Mount', role: '多马殉道之地', location: '印度金奈' },
      ],
      koans: [
        { title: '我的主我的神', description: '其他门徒告诉多马耶稣复活了，多马说："我非看见他手上的钉痕，用指头探入那钉痕，又用手探入他的肋旁，我总不信。"八天后耶稣显现，对多马说："伸出你的指头来看看我的手，伸出你的手来探入我的肋旁——不要疑惑，总要信。"多马说："我的主！我的神！"' },
      ],
      classicQuotes: ['我的主！我的神！'],
      works: [],
      imageUrl: null,
    },
  });

  // Update existing Augustine
  const existingAugustine = await prisma.patriarch.findFirst({ where: { name: '奥古斯丁' } });
  existingAugustine
    ? await prisma.patriarch.update({
        where: { id: existingAugustine.id },
        data: {
          nameEn: 'Augustine of Hippo',
          dates: '354-430',
          title: '恩典博士·西方教会之父',
          school: '教父与神学家',
          generation: 1,
          biography: '奥古斯丁（Augustine of Hippo），基督教最具影响力的神学家之一，西方教会四大博士之一。生于北非塔加斯特（今阿尔及利亚），母亲莫妮加是虔诚基督徒。年轻时放荡不羁，信奉摩尼教，后转向新柏拉图主义。387年在米兰受安布罗修主教影响归信基督教，听见童声"拿起来读"后翻开圣经读到罗马书，豁然醒悟。著《忏悔录》为西方文学第一部自传，以极其坦诚的文字记录灵性转变。著《上帝之城》回应罗马陷落的神学危机——论述人间之城与上帝之城的对立。其恩典神学（原罪、预定、不可抗拒的恩典）深刻塑造了天主教和新教的神学传统。',
          coreTeaching: '你为自己创造了我们，我们的心不安息，直到安息在你里面。恩典先于一切人的功德——人无法靠自己的力量得救，唯有神的恩典。原罪论——人因亚当的堕落而生来就有罪性。预定论的雏形——得救完全出于神的拣选。',
          achievements: '西方教会最伟大的神学家之一。著《忏悔录》为西方第一部心灵自传。著《上帝之城》为基督教历史神学奠基。恩典神学深刻影响天主教和新教。原罪论和预定论的系统阐述者。影响马丁·路德和加尔文的宗教改革。',
          templeNames: [
            { name: '圣奥古斯丁教堂', nameEn: 'Basilica of San Pietro in Ciel d\'Oro', role: '奥古斯丁遗骸所在', location: '意大利帕维亚' },
            { name: '希波(安纳巴)', nameEn: 'Hippo Regius', role: '奥古斯丁主教座所在地', location: '阿尔及利亚安纳巴' },
          ],
          koans: [
            { title: '拿起来读', description: '米兰花园中，奥古斯丁听见邻家童声反复说"拿起来读，拿起来读"(Tolle, lege)。他拿起圣经随手翻开，读到罗马书13:13-14"不可荒宴醉酒…总要披戴主耶稣基督"。立刻平安充满心中——"一切疑惑的阴影顿时消散"。' },
          ],
          classicQuotes: ['你为自己创造了我们，我们的心不安息，直到安息在你里面', '信仰是相信我们所不见的，而信仰的回报是看见我们所相信的', '拿起来读，拿起来读'],
          works: [
            { title: '忏悔录（Confessions）', description: '西方文学第一部心灵自传' },
            { title: '上帝之城（City of God）', description: '基督教历史神学奠基之作' },
            { title: '论三位一体', description: '三一论系统神学' },
          ],
          imageUrl: null,
        },
      })
    : null;

  // ── 教父与神学家 (5位 new) ──
  await prisma.patriarch.create({
    data: {
      name: '托马斯·阿奎那', nameEn: 'Thomas Aquinas', religionId: christianityId,
      dates: '1225-1274', title: '天使博士·经院哲学集大成者', school: '教父与神学家', generation: 2,
      teacherId: null,
      biography: '托马斯·阿奎那（Thomas Aquinas），天主教最伟大的神学家和哲学家，多明我会修士。出身意大利贵族，家人曾囚禁他以阻止其出家。在巴黎和科隆师从大阿尔伯特。著《神学大全》（Summa Theologica）系统融合亚里士多德哲学与基督教神学，成为天主教官方神学体系的基石。提出"五路证明"论证上帝存在。区分自然理性与超自然信仰的领域——理性可以认识上帝的存在，但三位一体等教义需要信仰。1274年前往里昂公会议途中去世。1879年教宗利奥十三世宣布其学说为天主教哲学标准。',
      coreTeaching: '信仰与理性和谐互补。自然理性可以认识上帝的存在（五路证明），但启示真理（三位一体、道成肉身）超越理性而不违反理性。恩典不废除自然，而是完善自然。',
      achievements: '天主教最伟大的神学家。著《神学大全》为天主教官方神学体系基石。提出上帝存在的"五路证明"。融合亚里士多德哲学与基督教信仰。1879年被定为天主教哲学标准。被封为教会博士。',
      templeNames: [
        { name: '雅各宾教堂', nameEn: 'Church of the Jacobins', role: '阿奎那遗骸所在', location: '法国图卢兹' },
      ],
      koans: [],
      classicQuotes: ['恩典不废除自然，而是完善自然', '信仰的最终目的不是知道什么，而是认识谁', '对于相信的人，无需解释；对于不相信的人，无法解释'],
      works: [
        { title: '神学大全（Summa Theologica）', description: '天主教神学体系的集大成之作' },
        { title: '反异教大全（Summa contra Gentiles）', description: '以理性论证基督教真理' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '凯撒利亚的巴西尔', nameEn: 'Basil of Caesarea', religionId: christianityId,
      dates: '329-379', title: '伟大的巴西尔·东方修道之父', school: '教父与神学家', generation: 3,
      teacherId: null,
      biography: '凯撒利亚的巴西尔（Basil the Great），东方教会三大教父之一（与拿先斯的格列高利、尼撒的格列高利并称"卡帕多细亚三杰"）。出身基督教名门（姐姐玛克丽娜、弟弟尼撒的格列高利皆为圣人）。创立东方修道院会规——强调集体修道生活（相对于埃及沙漠隐修），平衡祈祷与劳动，修道院应服务社会。建立"巴西利亚德"——中世纪最早的大型慈善综合体（医院、济贫所、旅店）。在三位一体论争中捍卫尼西亚信条。',
      coreTeaching: '修道不是逃离世界，而是更好地服务世界。巴西尔创立的修道会规强调：祈祷与劳动并重，修道院应办学校、医院、济贫所。信仰必须通过慈善行动来表达。',
      achievements: '东方修道制度奠基人。创立集体修道会规（至今东正教修道院沿用）。建立最早的大型慈善综合体。捍卫三位一体正统教义。东方教会三大教父之一。',
      templeNames: [
        { name: '凯撒利亚', nameEn: 'Caesarea in Cappadocia', role: '巴西尔主教座', location: '土耳其开塞利' },
      ],
      koans: [],
      classicQuotes: ['多余的面包属于饥饿者，多余的衣服属于赤身者，多余的金钱属于贫穷者'],
      works: [
        { title: '长会规/短会规', description: '东方修道院生活准则' },
        { title: '论圣灵', description: '三位一体教义论述' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '金口约翰', nameEn: 'John Chrysostom', religionId: christianityId,
      dates: '349-407', title: '金口·布道之王', school: '教父与神学家', generation: 4,
      teacherId: null,
      biography: '金口约翰（John Chrysostom），意为"金嘴"，因其无与伦比的雄辩才能而得名。安提阿人，曾为隐修士。后成为君士坦丁堡大主教（398-404）。以直言不讳批评权贵的奢侈腐败著称——甚至批评皇后尤多克西亚。两次被流放，最终在流放途中去世。其讲道词超过700篇存世，对《马太福音》和《保罗书信》的释经被视为教父时代的最高成就。被天主教和东正教共同尊为教会博士。',
      coreTeaching: '基督徒的生活应当是一篇活的讲道。批评只关注礼仪不关注穷人的伪善。"如果你不能在穷人身上认出基督，你也不能在圣杯中认出他。"',
      achievements: '基督教历史上最伟大的布道家。700篇讲道存世。释经讲道的典范。以批评权贵的勇气著称。被天主教和东正教共同尊为教会博士。',
      templeNames: [
        { name: '圣索菲亚大教堂', nameEn: 'Hagia Sophia', role: '金口约翰主教座', location: '土耳其伊斯坦布尔' },
      ],
      koans: [],
      classicQuotes: ['如果你不能在穷人身上认出基督，你也不能在圣杯中认出他', '地狱的道路是用好的意图铺成的'],
      works: [
        { title: '马太福音释义', description: '90篇讲道，释经典范' },
        { title: '论祭司职', description: '教牧神学经典' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '哲罗姆', nameEn: 'Saint Jerome', religionId: christianityId,
      dates: '347-420', title: '圣经博士·武加大译者', school: '教父与神学家', generation: 5,
      teacherId: null,
      biography: '哲罗姆（Saint Jerome），西方教会四大博士之一。生于达尔马提亚（今克罗地亚）。精通拉丁文、希腊文、希伯来文。受教宗达马苏一世之命，将《圣经》从希伯来文和希腊文翻译为拉丁文，历时15年完成《武加大译本》（Vulgate）——此后一千年间西方教会使用的标准圣经。晚年隐居伯利恒洞窟继续翻译和注释工作。性格尖锐易怒，以笔战闻名，但学术成就无人能及。',
      coreTeaching: '不认识圣经就是不认识基督。哲罗姆一生致力于让人们以最准确的文字读到圣经原意。圣经翻译不是文字游戏，而是让神的话语活在每个时代。',
      achievements: '翻译《武加大译本》为西方基督教世界使用千年的标准圣经。精通三种圣经语言（拉丁/希腊/希伯来）。多部圣经注释。西方教会四大博士之一。',
      templeNames: [
        { name: '伯利恒主诞堂', nameEn: 'Church of the Nativity', role: '哲罗姆隐居译经之洞窟', location: '巴勒斯坦伯利恒' },
      ],
      koans: [],
      classicQuotes: ['不认识圣经就是不认识基督', '好书是死人最好的遗产'],
      works: [
        { title: '武加大译本（Vulgate）', description: '拉丁文圣经标准译本，使用千年' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '希波的西普里安', nameEn: 'Cyprian of Carthage', religionId: christianityId,
      dates: '210-258', title: '教会合一之父', school: '教父与神学家', generation: 6,
      teacherId: null,
      biography: '西普里安（Cyprian），迦太基主教，早期教会最重要的拉丁教父之一。原为异教修辞学教师和富人，中年归信后散尽家财。在德西乌斯迫害（250年）和瓦勒良迫害（258年）期间领导北非教会。提出"教会之外无救恩"的著名论点。著《论教会的合一》强调主教制度是教会合一的保障。258年在迦太基殉道，成为北非教会最受尊敬的殉道者之一。',
      coreTeaching: '不以教会为母者，不能以上帝为父。教会的合一建立在主教的合一之上。在逼迫面前，基督徒应当坚守信仰，但对软弱跌倒者也应给予悔改复和的机会。',
      achievements: '早期拉丁教会最重要的教父之一。"教会之外无救恩"论点影响深远。著《论教会的合一》奠定教会论基础。迦太基殉道者。推动教会对叛教者的接纳政策。',
      templeNames: [],
      koans: [],
      classicQuotes: ['不以教会为母者，不能以上帝为父', '你不能有上帝为你的父，却不以教会为你的母'],
      works: [
        { title: '论教会的合一', description: '教会论奠基之作' },
        { title: '论堕落者', description: '论逼迫中叛教者的复和' },
      ],
      imageUrl: null,
    },
  });

  // ── 宗教改革家 (5位) ──
  await prisma.patriarch.create({
    data: {
      name: '马丁·路德', nameEn: 'Martin Luther', religionId: christianityId,
      dates: '1483-1546', title: '宗教改革发起者·因信称义', school: '宗教改革家', generation: 1,
      teacherId: null,
      biography: '马丁·路德（Martin Luther），德国奥古斯丁会修士，基督教新教宗教改革的发起者。1517年10月31日在维滕贝格城堡教堂门口张贴《九十五条论纲》，抗议天主教会出售赎罪券。在沃尔姆斯帝国议会上面对皇帝和教宗的压力，宣称"这是我的立场，我别无选择"。被教宗逐出教会后，在瓦尔特堡将《新约》翻译为德语（仅用11周），使圣经走入普通德国人手中。其改革引发了基督教世界最深刻的分裂，同时也是欧洲现代化的重要推动力。',
      coreTeaching: '唯独信仰（Sola Fide）、唯独恩典（Sola Gratia）、唯独圣经（Sola Scriptura）。人不是靠行为称义，而是靠信心接受神白白的恩典。圣经是信仰唯一的权威，高于教宗和教会传统。',
      achievements: '基督教新教宗教改革发起者。1517年发表《九十五条论纲》。将圣经翻译为德语（现代德语的奠基之作）。提出"三个唯独"（信仰/恩典/圣经）。改变了欧洲和世界历史进程。今全球约9亿新教徒源于此改革。',
      templeNames: [
        { name: '维滕贝格城堡教堂', nameEn: 'All Saints\' Church, Wittenberg', role: '九十五条论纲张贴处', location: '德国维滕贝格' },
        { name: '瓦尔特堡', nameEn: 'Wartburg Castle', role: '路德翻译新约之地', location: '德国艾森纳赫' },
      ],
      koans: [
        { title: '九十五条论纲', description: '1517年10月31日，路德将《九十五条论纲》钉在维滕贝格教堂门上——挑战教会出售赎罪券的做法。"当硬币投入钱柜叮当响时，灵魂就从炼狱中跳出来"——这样的教导违背圣经。这一行动点燃了宗教改革。' },
        { title: '沃尔姆斯', description: '1521年帝国议会上，面对神圣罗马帝国皇帝和教廷代表，路德被要求撤回著作。他回答："除非用圣经和理性说服我，否则我不能也不愿撤回。这是我的立场，我别无选择。愿上帝帮助我。"' },
      ],
      classicQuotes: ['这是我的立场，我别无选择', '即使明天世界末日，我今天仍要种一棵苹果树', '义人必因信得生'],
      works: [
        { title: '九十五条论纲', description: '宗教改革的导火索' },
        { title: '德语圣经', description: '现代德语的奠基之作' },
        { title: '基督徒的自由', description: '论基督徒的属灵自由' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '加尔文', nameEn: 'John Calvin', religionId: christianityId,
      dates: '1509-1564', title: '改革宗创始人·日内瓦导师', school: '宗教改革家', generation: 2,
      teacherId: null,
      biography: '约翰·加尔文（John Calvin），法国人，宗教改革第二代领袖，改革宗（归正宗）传统创始人。因信仰被逼离法国后定居日内瓦，将该城建设为"新教的罗马"。著《基督教要义》（Institutes of the Christian Religion），为新教最系统的神学著作。其预定论（双重预定——神预定部分人得救、部分人灭亡）是最具争议也最有影响力的教义。加尔文主义强调神的主权绝对至上、人的全然败坏、不可抗拒的恩典。其思想深刻影响了清教徒运动、美国建国思想和现代资本主义伦理。',
      coreTeaching: '神的主权绝对至上（TULIP五要点）：全然败坏、无条件拣选、有限救赎、不可抗拒的恩典、圣徒的坚忍。一切荣耀归于神（Soli Deo Gloria）。世俗职业也是神的呼召——勤劳工作荣耀神。',
      achievements: '改革宗/归正宗传统创始人。著《基督教要义》为新教最系统神学著作。将日内瓦建为"新教的罗马"。深刻影响清教徒/美国建国/资本主义伦理。全球改革宗/长老会教会的思想之父。',
      templeNames: [
        { name: '圣彼得大教堂', nameEn: 'St. Pierre Cathedral', role: '加尔文布道之地', location: '瑞士日内瓦' },
      ],
      koans: [],
      classicQuotes: ['人心是制造偶像的工厂', '除非先认识神，否则无人能正确认识自己', '一切荣耀归于神'],
      works: [
        { title: '基督教要义（Institutes）', description: '新教最系统的神学著作' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '约翰·卫斯理', nameEn: 'John Wesley', religionId: christianityId,
      dates: '1703-1791', title: '卫理公会创始人·心灵温暖', school: '宗教改革家', generation: 3,
      teacherId: null,
      biography: '约翰·卫斯理（John Wesley），英国圣公会牧师，卫理公会运动创始人。1738年在伦敦阿尔德斯门街的一次聚会中经历著名的"心灵温暖"体验——"我感到心中奇异地温暖，我信靠基督、唯独基督来拯救我。"此后一生巡回布道，行程约25万英里（主要骑马），讲道超过4万次。在矿区、田野、街头向穷人布道。组织信徒成立小组（班会）互相督责。卫理公会后发展为全球性宗派，信众超过8000万。',
      coreTeaching: '成圣——基督徒不仅要信，还要在恩典中不断长进，追求心灵的完全圣洁。"全世界是我的牧区。"信仰必须与社会关怀结合——卫斯理积极投身废奴运动、济贫、办学。',
      achievements: '卫理公会运动创始人。一生布道超4万次、行程25万英里。创立小组（班会）牧养模式。推动英国社会改革（废奴/济贫/教育）。全球卫理公会信众超8000万。',
      templeNames: [
        { name: '卫斯理教堂', nameEn: 'Wesley\'s Chapel', role: '卫理公会母堂', location: '英国伦敦' },
      ],
      koans: [
        { title: '心灵温暖', description: '1738年5月24日晚，在阿尔德斯门街聚会中，有人读路德的《罗马书注释序言》。卫斯理写道："约八点三刻，当他描述神通过信基督在人心中所做的改变时，我感到心中奇异地温暖。"这一刻改变了他的一生。' },
      ],
      classicQuotes: ['尽你所能地赚取，尽你所能地节省，尽你所能地给予', '全世界是我的牧区', '我感到心中奇异地温暖'],
      works: [
        { title: '讲道集', description: '151篇标准讲道，卫理宗教义基础' },
        { title: '日记', description: '55年的信仰日记，18世纪英国社会珍贵记录' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '慈运理', nameEn: 'Huldrych Zwingli', religionId: christianityId,
      dates: '1484-1531', title: '瑞士改革先驱', school: '宗教改革家', generation: 4,
      teacherId: null,
      biography: '慈运理（Huldrych Zwingli），瑞士宗教改革先驱。1519年起在苏黎世大教堂担任牧师，推动宗教改革——废除弥撒、移除圣像、以圣经讲道取代传统礼仪。与路德在圣餐理解上产生根本分歧（路德主张基督真实临在，慈运理主张仅为纪念）。1531年在卡佩尔战役中作为随军牧师阵亡。虽英年早逝，但其改革思想通过继承者布林格和加尔文发扬光大。',
      coreTeaching: '圣经至上——唯有圣经有最终权威。礼拜应简洁朴素，去除一切没有圣经根据的仪式。圣餐是纪念，不是再次献祭。教会改革必须与市政改革同步进行。',
      achievements: '瑞士宗教改革先驱。在苏黎世推行彻底的宗教改革。与路德并列为新教两大改革先驱。其思想通过加尔文发扬光大，影响改革宗传统。',
      templeNames: [
        { name: '苏黎世大教堂', nameEn: 'Grossmünster', role: '慈运理改革布道之地', location: '瑞士苏黎世' },
      ],
      koans: [],
      classicQuotes: ['真理终将得胜'],
      works: [
        { title: '六十七条论纲', description: '苏黎世宗教改革的纲领文件' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '约翰·诺克斯', nameEn: 'John Knox', religionId: christianityId,
      dates: '1514-1572', title: '苏格兰长老会之父', school: '宗教改革家', generation: 5,
      teacherId: null,
      biography: '约翰·诺克斯（John Knox），苏格兰宗教改革领袖，长老会的创始人。曾在日内瓦师从加尔文。回到苏格兰后以火一般的布道推动改革——1560年苏格兰议会正式采纳新教。建立长老制教会治理模式（教会由长老集体治理而非主教个人统治）。以"给我苏格兰，否则就让我死"的祷告闻名。其民主化的教会治理思想深刻影响了后来的民主政治理论和美国宪政体制。',
      coreTeaching: '教会应由长老集体治理（长老制），而非一人独裁。每个信徒都有权利和义务阅读圣经。教育是信仰的基础——诺克斯推动苏格兰建立全民教育体系。',
      achievements: '苏格兰宗教改革领袖。创立长老制教会治理模式。推动苏格兰全民教育。长老制民主精神影响美国宪政。全球长老会/改革宗教会的精神之父。',
      templeNames: [
        { name: '圣吉尔斯大教堂', nameEn: "St Giles' Cathedral", role: '诺克斯主要布道之地', location: '英国爱丁堡' },
      ],
      koans: [],
      classicQuotes: ['给我苏格兰，否则就让我死', '一个人加上上帝就是多数'],
      works: [
        { title: '苏格兰宗教改革史', description: '苏格兰改革运动的第一手记录' },
      ],
      imageUrl: null,
    },
  });

  // ── 神秘主义与灵修传统 (5位) ──
  await prisma.patriarch.create({
    data: {
      name: '亚西西的方济各', nameEn: 'Francis of Assisi', religionId: christianityId,
      dates: '1181-1226', title: '方济各会创始人·贫穷的小兄弟', school: '神秘主义与灵修', generation: 1,
      teacherId: null,
      biography: '亚西西的方济各（Francis of Assisi），基督教历史上最受爱戴的圣人之一，方济各会创始人。出身意大利富商家庭。年轻时过着纨绔生活，在一次生病和灵性体验后彻底转变——脱去华服、放弃继承权，选择与穷人为伍。创立"小兄弟会"（方济各会），强调彻底的贫穷、谦卑和喜乐。以对大自然的热爱闻名——传说他向鸟儿布道、驯服恶狼。著《太阳歌》为意大利文学最早的杰作之一。晚年身上出现圣痕（与基督钉痕对应的伤痕），是历史上第一个记录的圣痕者。',
      coreTeaching: '彻底的贫穷就是彻底的自由。"主啊，使我做你和平的工具。"方济各不是厌恶世界，而是热爱一切受造物——在每一棵树、每一只鸟中看见造物主的荣耀。喜乐是基督徒的标志——即使在贫穷和苦难中。',
      achievements: '方济各会创始人（至今全球最大修会之一）。基督教历史上最受爱戴的圣人。以彻底贫穷和对自然的爱闻名。《太阳歌》为意大利文学先驱。第一位有记录的圣痕者。教宗方济各以其命名。',
      templeNames: [
        { name: '亚西西圣方济各圣殿', nameEn: 'Basilica of San Francesco d\'Assisi', role: '方济各墓地与纪念圣殿', location: '意大利亚西西' },
        { name: '天使之后圣殿', nameEn: 'Basilica of Santa Maria degli Angeli', role: '方济各会创立之地', location: '意大利亚西西' },
      ],
      koans: [
        { title: '向鸟儿布道', description: '方济各看见路边一群鸟，走过去对它们布道："我的小兄弟姐妹们，你们应当赞美你们的造物主——他给你们羽毛做衣裳，翅膀做飞翔，又供应你们所需要的一切。"鸟儿们安静聆听，直到他祝福它们才飞走。' },
        { title: '和平祷文', description: '"主啊，使我做你和平的工具：在有仇恨的地方，让我播种爱；在有伤害的地方，让我播种宽恕；在有怀疑的地方，让我播种信心；在有绝望的地方，让我播种希望；在有黑暗的地方，让我播种光明；在有悲伤的地方，让我播种喜乐。"' },
      ],
      classicQuotes: ['主啊，使我做你和平的工具', '先去传福音，必要时才用言语', '从拥有很少开始，到最后什么都不需要'],
      works: [
        { title: '太阳歌（Canticle of the Sun）', description: '赞美造物的诗歌，意大利文学最早杰作之一' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '阿维拉的德兰', nameEn: 'Teresa of Ávila', religionId: christianityId,
      dates: '1515-1582', title: '灵修博士·灵魂的城堡', school: '神秘主义与灵修', generation: 2,
      teacherId: null,
      biography: '阿维拉的德兰（Teresa of Ávila），西班牙加尔默罗会修女，基督教最伟大的神秘主义者之一。1535年入修道院。经历长期灵性枯干后，约1554年开始获得深刻的神秘体验——灵魂出神、心灵的刺穿（贝尼尼著名雕塑即描绘此景）。推动加尔默罗会改革（赤足加尔默罗会），建立17座革新修院。著《灵魂的城堡》以七重居所比喻灵魂走向与神合一的旅程。1970年被封为教会博士——历史上第一位获此殊荣的女性。',
      coreTeaching: '灵魂是一座有七重居所的城堡——从外到内，从自我认知走向与神完全合一。祈祷是打开城堡之门的钥匙。即使在最深的神秘体验中也要保持实际的判断力——德兰以幽默感和务实精神著称。',
      achievements: '基督教最伟大的神秘主义者之一。著《灵魂的城堡》《自传》。推动加尔默罗会改革。建立17座修院。1970年成为第一位女性教会博士。',
      templeNames: [
        { name: '道成肉身修院', nameEn: 'Convent of the Incarnation', role: '德兰入修道院之地', location: '西班牙阿维拉' },
      ],
      koans: [
        { title: '上帝在锅碗中', description: '德兰对修女们说："如果你在祈祷中找不到上帝，就去厨房找他——上帝就在锅碗瓢盆之间。"灵修不是脱离日常，而是在日常中与神相遇。' },
      ],
      classicQuotes: ['基督没有手，只有你的手；基督没有脚，只有你的脚', '只有上帝就够了', '不要让任何事扰乱你'],
      works: [
        { title: '灵魂的城堡', description: '七重居所的灵修经典' },
        { title: '自传', description: '灵性成长的坦诚记录' },
        { title: '全德之路', description: '祈祷生活指南' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '十字若望', nameEn: 'John of the Cross', religionId: christianityId,
      dates: '1542-1591', title: '心灵暗夜·神秘主义诗人', school: '神秘主义与灵修', generation: 3,
      teacherId: null,
      biography: '十字若望（John of the Cross），西班牙加尔默罗会修士，基督教神秘主义的巅峰人物。与德兰合作推动加尔默罗会改革，因此被保守派囚禁在托莱多一间狭小牢房中九个月——在黑暗和饥饿中写下了基督教最伟大的神秘主义诗歌《心灵的暗夜》。其核心教导"暗夜"——灵魂必须经历感官和精神的彻底剥夺（黑暗）才能走向与神的光明合一。著《攀登加尔默罗山》系统阐述灵魂净化之路。1926年被封为教会博士。',
      coreTeaching: '心灵的暗夜——灵魂走向神必须经历双重暗夜：感官的暗夜（放下一切感官依附）和精神的暗夜（放下一切精神执着，甚至对灵性体验的执着）。"在暗夜中，走更安全的路。"虚空是通往圆满的唯一道路。',
      achievements: '基督教神秘主义巅峰人物。在狱中写下《心灵的暗夜》为基督教灵修诗歌最高杰作。系统阐述灵魂净化理论。与德兰合作改革加尔默罗会。1926年封为教会博士。',
      templeNames: [],
      koans: [
        { title: '暗夜', description: '"在一个暗夜里，怀着焦灼的爱情，我出去了——啊，幸运的命运！无人注意。"灵魂在暗夜中离开一切熟悉的事物，在黑暗中走向爱的合一。越黑暗，越接近光明。' },
      ],
      classicQuotes: ['在暗夜中，走更安全的路', '要到达你不知道的地方，你必须走你不知道的路', '在黄昏时分，我们将以爱被审判'],
      works: [
        { title: '心灵的暗夜', description: '基督教灵修诗歌最高杰作' },
        { title: '攀登加尔默罗山', description: '灵魂净化之系统论述' },
        { title: '灵歌', description: '灵魂与神之间的爱情诗' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '艾克哈特大师', nameEn: 'Meister Eckhart', religionId: christianityId,
      dates: '1260-1328', title: '莱茵神秘主义·灵魂的火花', school: '神秘主义与灵修', generation: 4,
      teacherId: null,
      biography: '艾克哈特大师（Meister Eckhart），德国多明我会修士，莱茵神秘主义的代表人物。曾任多明我会省会长，在巴黎大学两次执教（极罕见殊荣）。以德语向普通信徒布道，用大胆的悖论式语言谈论神与灵魂——"灵魂的火花"（Seelenfünklein）是人心中与神直接相通的最深处。"上帝的根基和灵魂的根基是同一个根基。"其思想被教会当局审查，部分命题于1329年被定为异端。但其影响深远——从路德到海德格尔、从铃木大拙到托马斯·默顿都深受其启发。',
      coreTeaching: '灵魂的火花（Seelenfünklein）——人心最深处有一点"火花"，与神本体直接相通。彻底的虚己（Gelassenheit/放下）——只有放下一切，甚至放下对上帝的概念，才能在绝对的虚空中遇见真正的上帝。"上帝的最高名字是无。"',
      achievements: '莱茵神秘主义最伟大的代表。以德语布道开创德语哲学传统。"灵魂的火花"和"放下"概念影响深远。启发路德/海德格尔/铃木大拙/默顿。被认为是东西方灵性对话的先驱。',
      templeNames: [],
      koans: [
        { title: '眼与眼', description: '"我用来看上帝的眼，和上帝用来看我的眼，是同一只眼。"主客二分在最深的灵性层面消融——认识者与被认识者合一。' },
      ],
      classicQuotes: ['如果唯一的祷告是"感谢"，那就足够了', '上帝的最高名字是无', '灵魂必须在一切事物中死去，甚至在上帝中死去'],
      works: [
        { title: '德语讲道集', description: '以德语向平信徒宣讲的神秘主义讲道' },
        { title: '神圣安慰之书', description: '论苦难中的神圣安慰' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '托马斯·默顿', nameEn: 'Thomas Merton', religionId: christianityId,
      dates: '1915-1968', title: '东西灵修桥梁·七重山', school: '神秘主义与灵修', generation: 5,
      teacherId: null,
      biography: '托马斯·默顿（Thomas Merton），美国熙笃会修士，20世纪最具影响力的基督教灵修作家。出生于法国，成长于英国和美国。哥伦比亚大学毕业后过着波西米亚式生活。1941年进入肯塔基州客西马尼隐修院。著《七重山》（The Seven Storey Mountain）自传，讲述从世俗到修道的心灵旅程，成为畅销书。后期积极开展东西方灵性对话——深入研究禅宗、道教、苏菲主义，与铃木大拙、一行禅师等交流。1968年在曼谷参加东西方修道对话会议时意外触电去世。',
      coreTeaching: '独处与沉默是认识自我和认识神的必经之路。基督教灵修传统与东方冥想传统有深刻的共鸣——默观祈祷与禅修指向同一个终极实在。社会正义是灵修生活的自然延伸——默顿积极反战、反核、支持民权运动。',
      achievements: '20世纪最具影响力的基督教灵修作家。《七重山》为灵修文学畅销经典。东西方灵性对话的先驱——连接基督教与禅宗/道教/苏菲。积极参与反战和民权运动。',
      templeNames: [
        { name: '客西马尼修道院', nameEn: 'Abbey of Gethsemani', role: '默顿修道生活之地', location: '美国肯塔基州' },
      ],
      koans: [],
      classicQuotes: ['在静默中，上帝不再是一个概念，而成为一种经验', '如果你想辨识灵性的人，找那个能够独处的人'],
      works: [
        { title: '七重山（The Seven Storey Mountain）', description: '从世俗到修道的心灵自传' },
        { title: '默观的种子', description: '基督教默观祈祷入门' },
        { title: '禅与灵鸟', description: '基督教与禅宗的对话' },
      ],
      imageUrl: null,
    },
  });

  // ── 近现代影响者 (6位) ──
  await prisma.patriarch.create({
    data: {
      name: '德蕾莎修女', nameEn: 'Mother Teresa', religionId: christianityId,
      dates: '1910-1997', title: '加尔各答圣人·穷人中最穷者的仆人', school: '近现代影响者', generation: 1,
      teacherId: null,
      biography: '德蕾莎修女（Mother Teresa），原名阿格尼丝·冈贾·博雅丘（Agnes Gonxha Bojaxhiu），阿尔巴尼亚裔。1928年到印度传教。1946年在前往大吉岭的火车上获得"呼召中的呼召"——离开舒适的修道院，去服务"穷人中最穷者"。1950年创立仁爱传教修女会，在加尔各答贫民窟中照顾垂死者、弃婴、麻风病人。其修女会后扩展至全球130多个国家。1979年获诺贝尔和平奖。2016年被封圣。她的私人日记揭示了长达50年的"信仰暗夜"——在灵性枯竭中依然坚持服务。',
      coreTeaching: '在最卑微的人身上看见基督的面容。"如果你不能养活一百个人，那就养活一个。"爱不是宏大的事业，而是用伟大的爱做微小的事。德蕾莎的"信仰暗夜"展示了——即使感受不到神的同在，信仰仍可以通过行动来表达。',
      achievements: '创立仁爱传教修女会（全球130+国家）。1979年诺贝尔和平奖。2016年封圣。一生服务加尔各答最贫穷者。成为20世纪慈善和基督徒精神的象征。',
      templeNames: [
        { name: '仁爱传教修女会总部', nameEn: 'Missionaries of Charity Motherhouse', role: '德蕾莎修女之家', location: '印度加尔各答' },
      ],
      koans: [],
      classicQuotes: ['不是所有人都能做伟大的事，但我们都能用伟大的爱做微小的事', '如果你评判他人，你就没有时间爱他们', '传播爱到任何你去的地方——不要让任何人离开你时没有变得更快乐'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '迪特里希·朋霍费尔', nameEn: 'Dietrich Bonhoeffer', religionId: christianityId,
      dates: '1906-1945', title: '殉道神学家·廉价恩典的批判者', school: '近现代影响者', generation: 2,
      teacherId: null,
      biography: '迪特里希·朋霍费尔（Dietrich Bonhoeffer），德国路德宗牧师和神学家。在纳粹德国兴起时，成为"认信教会"运动的核心人物，公开反对纳粹对教会的控制和对犹太人的迫害。尽管有机会留在安全的美国，1939年毅然返回德国——"如果我不在这个时刻与我的人民一同受苦，我就没有资格在战后参与重建。"参与刺杀希特勒的密谋，被盖世太保逮捕。1945年4月9日，在希特勒自杀前仅两周，在弗洛森堡集中营被处决。年仅39岁。',
      coreTeaching: '廉价恩典vs重价恩典——"廉价恩典是教会的致命敌人"。不付代价的信仰是虚假的。基督徒必须在世界中承担责任——"信仰不是逃离世界的避难所，而是行动的起点。"当世界发生不义时，沉默和不作为就是同谋。',
      achievements: '20世纪最具影响力的殉道神学家。公开反对纳粹。著《追随基督》论重价恩典。参与刺杀希特勒密谋。39岁在集中营殉道。其思想深刻影响战后基督教伦理和政治神学。',
      templeNames: [
        { name: '弗洛森堡集中营', nameEn: 'Flossenbürg Concentration Camp', role: '朋霍费尔殉道之地', location: '德国弗洛森堡' },
      ],
      koans: [
        { title: '返回德国', description: '1939年朋霍费尔在美国安全处境中收到回德国的邀请。他在日记中写道："如果我不在这个最黑暗的时刻与我的人民一同受苦，我就没有资格在战后参与他们的重建。"他踏上了回程——也踏上了殉道之路。' },
      ],
      classicQuotes: ['廉价恩典是教会的致命敌人', '沉默面前的邪恶本身就是邪恶', '行动不是来自思考，而是来自对责任的准备'],
      works: [
        { title: '追随基督（The Cost of Discipleship）', description: '论廉价恩典vs重价恩典' },
        { title: '团契生活', description: '论基督徒共同体' },
        { title: '狱中书简', description: '在纳粹监狱中的书信和思考' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: 'C.S.路易斯', nameEn: 'C.S. Lewis', religionId: christianityId,
      dates: '1898-1963', title: '基督教护教大师·纳尼亚之父', school: '近现代影响者', generation: 3,
      teacherId: null,
      biography: 'C.S.路易斯（Clive Staples Lewis），英国学者和作家，牛津大学和剑桥大学教授。青年时期为坚定的无神论者，1931年在与托尔金等朋友的长期对话中归信基督教。此后成为20世纪最有影响力的基督教护教作家。以清晰通俗的文笔向普通读者解释基督教信仰——《返璞归真》为最畅销的基督教护教著作。同时以儿童文学《纳尼亚传奇》七卷本闻名世界，以寓言方式传达基督教核心信息。',
      coreTeaching: '基督教信仰是合理的——不是因为它让你感觉好，而是因为它是真的。"我信基督教，正如我相信太阳升起了——不仅因为我看见它，而是因为借着它我看见一切其他事物。"痛苦是神的扩音器——在舒适中人忽略神，在痛苦中人不得不面对终极问题。',
      achievements: '20世纪最有影响力的基督教护教作家。《返璞归真》为最畅销的基督教入门书。《纳尼亚传奇》全球销量超1亿册。以通俗清晰的文笔让基督教信仰成为知识分子可以认真对待的选择。',
      templeNames: [],
      koans: [],
      classicQuotes: ['我信基督教如同我相信太阳升起——因为借着它我看见一切', '痛苦是神的扩音器，用来唤醒一个聋了的世界', '你从未见过一个普通人——你交往的每一个人都是不朽的灵魂'],
      works: [
        { title: '返璞归真（Mere Christianity）', description: '最畅销的基督教护教著作' },
        { title: '纳尼亚传奇', description: '七卷儿童文学经典，全球销量超1亿' },
        { title: '痛苦的奥秘', description: '论苦难与信仰' },
        { title: '魔鬼家书', description: '以魔鬼视角论述人性弱点' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '马丁·路德·金', nameEn: 'Martin Luther King Jr.', religionId: christianityId,
      dates: '1929-1968', title: '民权牧师·我有一个梦想', school: '近现代影响者', generation: 4,
      teacherId: null,
      biography: '马丁·路德·金（Martin Luther King Jr.），美国浸信会牧师，民权运动领袖。受甘地非暴力思想和基督教登山宝训的双重启发，领导美国黑人民权运动。1955年领导蒙哥马利公交车抵制运动。1963年在华盛顿林肯纪念堂前发表"我有一个梦想"演讲，成为20世纪最伟大的演说之一。推动通过1964年《民权法案》和1965年《选举权法案》。1964年获诺贝尔和平奖（当时最年轻获奖者，35岁）。1968年在孟菲斯被暗杀，年仅39岁。',
      coreTeaching: '非暴力抵抗是基督徒对不义的最有力回应。"黑暗不能驱除黑暗，只有光明能做到；仇恨不能驱除仇恨，只有爱能做到。"正义是不可分割的——"任何地方的不义都是对所有地方正义的威胁。"',
      achievements: '美国民权运动领袖。"我有一个梦想"为20世纪最伟大演讲。推动《民权法案》《选举权法案》通过。1964年诺贝尔和平奖。以非暴力改变了美国和世界。',
      templeNames: [
        { name: '以便以谢浸信会教堂', nameEn: 'Ebenezer Baptist Church', role: '金牧师的教会', location: '美国亚特兰大' },
        { name: '马丁·路德·金纪念碑', nameEn: 'MLK Memorial', role: '国家纪念碑', location: '美国华盛顿' },
      ],
      koans: [
        { title: '我有一个梦想', description: '1963年8月28日，25万人聚集在华盛顿。金站在林肯纪念堂前说："我有一个梦想——有一天，在佐治亚的红色山丘上，从前奴隶的儿女和从前奴隶主的儿女能够同坐在兄弟的桌旁。"' },
      ],
      classicQuotes: ['黑暗不能驱除黑暗，只有光明能做到', '任何地方的不义都是对所有地方正义的威胁', '我有一个梦想', '生命最持久的问题是：你为别人做了什么？'],
      works: [
        { title: '伯明翰监狱来信', description: '论非暴力抵抗的神学基础' },
        { title: '我有一个梦想', description: '20世纪最伟大的公共演讲' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '若望保禄二世', nameEn: 'Pope John Paul II', religionId: christianityId,
      dates: '1920-2005', title: '旅行教宗·跨越边界', school: '近现代影响者', generation: 5,
      teacherId: null,
      biography: '若望保禄二世（Pope John Paul II），原名卡罗尔·沃伊蒂瓦（Karol Wojtyła），波兰人，天主教第264任教宗（1978-2005）。第一位非意大利裔教宗（455年来）。任期内出访129个国家，行程超过110万公里，被称为"旅行教宗"。在冷战结束中扮演关键角色——支持波兰团结工会运动。推动宗教间对话——2000年首次访问清真寺，在犹太哭墙前祷告并放入忏悔信。为教会历史上的过错公开道歉。2014年封圣。',
      coreTeaching: '不要害怕！打开门户迎接基督！人的尊严是不可侵犯的——任何政治体制都不能剥夺。宗教间对话是世界和平的基础。教宗就职弥撒上的第一句话"不要害怕"成为其教宗生涯的标志。',
      achievements: '天主教第264任教宗。出访129国被称"旅行教宗"。在冷战结束中发挥关键作用。推动宗教间对话（首访清真寺/哭墙祷告）。为教会历史过错公开道歉。2014年封圣。',
      templeNames: [
        { name: '圣彼得大教堂', nameEn: "St. Peter's Basilica", role: '教宗座堂', location: '梵蒂冈' },
      ],
      koans: [],
      classicQuotes: ['不要害怕！打开门户迎接基督', '自由不是做你想做的事，而是有权做你应该做的事'],
      works: [
        { title: '跨越希望的门槛', description: '以对话形式论述信仰、教会与世界' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '德斯蒙德·图图', nameEn: 'Desmond Tutu', religionId: christianityId,
      dates: '1931-2021', title: '和解大主教·彩虹国度', school: '近现代影响者', generation: 6,
      teacherId: null,
      biography: '德斯蒙德·图图（Desmond Tutu），南非圣公会开普敦大主教，反种族隔离运动精神领袖。在种族隔离最黑暗的年代，以基督教非暴力原则呼吁和平与正义。1984年获诺贝尔和平奖。种族隔离结束后，主持真相与和解委员会（TRC）——以"恢复性正义"取代报复性正义，让施害者和受害者面对面，以真相和宽恕实现和解。提出"乌班图"（Ubuntu）哲学——"我是，因为我们是"。将南非称为"彩虹国度"。',
      coreTeaching: '宽恕不是软弱，而是最终极的力量。没有宽恕就没有未来——但也没有没有正义的宽恕。"乌班图"——一个人的人性通过与他人的关系来实现。"我是，因为我们是。"上帝没有基督徒仆人——上帝有的是人类仆人。',
      achievements: '南非反种族隔离运动精神领袖。1984年诺贝尔和平奖。主持真相与和解委员会开创"恢复性正义"。提出"彩虹国度"和"乌班图"理念。以基督教信仰推动种族和解。',
      templeNames: [
        { name: '圣乔治大教堂', nameEn: "St George's Cathedral", role: '图图大主教座堂', location: '南非开普敦' },
      ],
      koans: [],
      classicQuotes: ['没有宽恕就没有未来', '我是，因为我们是', '如果你在不义面前保持中立，你已经选择了压迫者的一边', '做好事不需要理由——因为上帝就是好的'],
      works: [
        { title: '没有宽恕就没有未来', description: '论真相与和解的恢复性正义' },
        { title: '上帝有一个梦想', description: '论人类善良的本性' },
      ],
      imageUrl: null,
    },
  });

  const christianCount = 25; // 25 new + 3 updated
  console.log(`  ✓ ${christianCount} new Christian patriarchs created + 3 updated (5 traditions: Apostles/Fathers/Reformers/Mystics/Modern)`);

  // ── 4n. 道教先贤 (Taoist Patriarchs/Masters) ──
  console.log('  Creating Taoist patriarchs (4n)...');

  const taoismId = religionMap['taoism'];

  // Update existing 老子 with full data + school field
  const existingLaozi = await prisma.patriarch.findFirst({ where: { name: '老子' } });
  const laozi = existingLaozi
    ? await prisma.patriarch.update({
        where: { id: existingLaozi.id },
        data: {
          nameEn: 'Laozi',
          dates: '约前571-前471',
          title: '太上老君·道德天尊·道家创始人',
          school: '老庄哲学',
          generation: 1,
          biography: '老子，姓李名耳，字聃，春秋时期楚国苦县（今河南鹿邑）人，道家哲学创始人。曾任周朝守藏室之史（国家图书馆馆长），博览群书，学识渊博。孔子曾专程问礼于老子，归而叹曰："吾今日见老子，其犹龙邪！"晚年见周朝衰微，骑青牛西出函谷关。关令尹喜请其著书，遂写下《道德经》五千言。此书分道经、德经两篇，以"道"为核心概念，阐述了自然无为、柔弱胜刚强、反者道之动等深刻哲理。对中国哲学、宗教、政治、艺术产生了深远影响。后被道教尊为太上老君、道德天尊，为道教至高神祇之一。',
          coreTeaching: '道可道，非常道；名可名，非常名。无名天地之始，有名万物之母。上善若水，水善利万物而不争。无为而无不为——顺应自然规律，不妄为、不强求，反而能成就一切。反者道之动，弱者道之用——事物向对立面转化是道的运动规律，柔弱是道的作用方式。',
          achievements: '著《道德经》五千言，为中国最重要的哲学经典之一。创立道家哲学体系，影响中国文明两千五百余年。被道教尊为教主、太上老君。"无为而治"思想影响了中国数千年的政治哲学。对全球哲学产生深远影响，《道德经》被翻译成70多种语言。',
          templeNames: [
            { name: '太清宫', nameEn: 'Taiqing Palace', role: '老子出生地', location: '河南鹿邑' },
            { name: '楼观台', nameEn: 'Louguan Tai', role: '老子著道德经之地', location: '陕西周至' },
            { name: '老君山', nameEn: 'Laojun Mountain', role: '老子隐居修道之地', location: '河南洛阳' },
          ],
          koans: [
            { title: '孔子问礼', description: '孔子赴周都洛邑向老子请教礼仪。老子告诫他：良贾深藏若虚，君子盛德容貌若愚。去子之骄气与多欲、态色与淫志。孔子归而对弟子叹曰：鸟，吾知其能飞；鱼，吾知其能游；兽，吾知其能走。至于龙，吾不能知，其乘风云而上天。吾今日见老子，其犹龙邪！' },
            { title: '紫气东来', description: '老子骑青牛西出函谷关，关令尹喜望见有紫气从东方而来，知有圣人过关。遂恭敬迎接，请老子著书。老子遂留下《道德经》五千言，然后飘然而去，不知所终。紫气东来成为祥瑞吉兆的象征。' },
            { title: '上善若水', description: '老子以水喻道：水善利万物而不争，处众人之所恶，故几于道。居善地，心善渊，与善仁，言善信，正善治，事善能，动善时。夫唯不争，故无尤。最高的善像水一样，滋润万物而不争功。' },
          ],
          classicQuotes: ['道可道，非常道；名可名，非常名', '上善若水，水善利万物而不争', '天下万物生于有，有生于无', '知者不言，言者不知', '千里之行，始于足下', '大音希声，大象无形'],
          works: [
            { title: '道德经', description: '又名《老子》，分道经（37章）与德经（44章），共五千余言。中国哲学最重要经典之一，被翻译成70多种语言。' },
          ],
          imageUrl: null,
        },
      })
    : await prisma.patriarch.create({
        data: {
          name: '老子', nameEn: 'Laozi', religionId: taoismId,
          dates: '约前571-前471', title: '太上老君·道德天尊', school: '老庄哲学', generation: 1,
          biography: '道家哲学创始人，著《道德经》。', coreTeaching: '道可道，非常道。',
          achievements: '道家创始人。', imageUrl: null,
        },
      });

  // Update existing 张道陵 with full data + school field
  const existingZhangDaoling = await prisma.patriarch.findFirst({ where: { name: '张道陵' } });
  const zhangDaoling = existingZhangDaoling
    ? await prisma.patriarch.update({
        where: { id: existingZhangDaoling.id },
        data: {
          nameEn: 'Zhang Daoling',
          dates: '34-156',
          title: '祖天师·正一真人·天师道创始人',
          school: '天师正一',
          generation: 1,
          biography: '张道陵（34-156），字辅汉，沛国丰县（今江苏丰县）人，东汉人，道教创始人。本太学生，博通五经。汉明帝时举贤良方正直言极谏科。后弃官修道，先入北邙山、后入蜀中鹤鸣山。永和六年（141年），据传太上老君授以正一盟威之道、三天正法等经书剑印，命其为天师。张道陵在巴蜀地区创立五斗米道（天师道），以符箓驱鬼治病，发展信众。设二十四治（教区），建立道教最早的教团组织。道教尊为"祖天师""正一真人"。其后裔世袭天师之位，至今已传六十五代，是世界最长的世袭宗教家族。龙虎山至今为正一派祖庭。',
          coreTeaching: '正一盟威之道——以正统道法驱邪扶正，建立人与天地鬼神的盟约秩序。奉道诫，为人治病：以三官手书（天官赦罪、地官赦罪、水官赦罪）为忏悔法门。清静无为为宗，佐以符箓科仪，建立道教最早的制度化宗教体系。',
          achievements: '创立天师道（五斗米道），为道教最早的教团组织。设二十四治（教区），建立系统的道教行政管理体系。开创符箓派传统，影响道教发展近两千年。张天师家族世袭六十五代，为世界最长的世袭宗教家族。龙虎山正一派为道教两大派之一。',
          templeNames: [
            { name: '龙虎山天师府', nameEn: 'Longhu Mountain Celestial Master Mansion', role: '正一派祖庭', location: '江西鹰潭' },
            { name: '鹤鸣山', nameEn: 'Heming Mountain', role: '张道陵创教之地', location: '四川大邑' },
            { name: '青城山', nameEn: 'Qingcheng Mountain', role: '张天师传道处', location: '四川都江堰' },
          ],
          koans: [
            { title: '鹤鸣山创教', description: '张道陵入蜀修道于鹤鸣山，感太上老君降临授道。以三天正法教化百姓，凡入道者纳五斗米，故称"五斗米道"。立二十四治分管信众，建立中国历史上第一个系统的道教组织。' },
            { title: '降魔伏妖', description: '传说张道陵在蜀中降伏六天魔王，驱逐鬼众。以正一盟威之道制服群邪，使巴蜀百姓免受瘟疫灾害。体现了早期道教以宗教手段解决社会问题的特征。' },
            { title: '三官手书', description: '张道陵创立三官手书忏悔法：病人书写三通，一置山上呈天官，一埋地下呈地官，一沉水中呈水官。通过忏悔罪过来治疗疾病，是道教最早的忏悔制度。' },
          ],
          classicQuotes: ['正一者，真一为宗', '道以虚无为体，以清静为用', '受道之人，初受质朴，后受盟威', '夫道者，虚无之至真也'],
          works: [
            { title: '老子想尔注', description: '对《道德经》的注释，将道家哲学改造为道教神学，是道教最早的经典注释。' },
          ],
          imageUrl: null,
        },
      })
    : await prisma.patriarch.create({
        data: {
          name: '张道陵', nameEn: 'Zhang Daoling', religionId: taoismId,
          dates: '34-156', title: '祖天师·正一真人', school: '天师正一', generation: 1,
          biography: '天师道创始人。', coreTeaching: '正一盟威之道。',
          achievements: '道教创始人。', imageUrl: null,
        },
      });

  // Update existing 王重阳 with full data + school field
  const existingWangChongyang = await prisma.patriarch.findFirst({ where: { name: '王重阳' } });
  const wangChongyang = existingWangChongyang
    ? await prisma.patriarch.update({
        where: { id: existingWangChongyang.id },
        data: {
          nameEn: 'Wang Chongyang',
          dates: '1112-1170',
          title: '重阳真人·全真开宗祖师',
          school: '全真派',
          generation: 1,
          biography: '王重阳（1112-1170），原名中孚，字允卿，后改名嚞，号重阳子。陕西咸阳刘蒋村人，金代道士。出身豪门，文武双全，早年应武举不第。大定年间，据传在甘河镇遇异人授以口诀，又在醴泉得《玉清内景真经》。遂弃家入终南山，穴居活死人墓修道数年。后焚庵东行，至山东宁海收马钰（马丹阳）、谭处端、刘处玄、丘处机、王处一、郝大通、孙不二为徒，号"全真七子"。创立全真道，倡导三教合一（儒释道）、性命双修、苦行修炼。全真道后成为中国道教两大主流之一，与正一派并立。',
          coreTeaching: '全真者，全其本真也。性命双修——先修性后修命，识心见性为第一要务。三教合一——儒之修身、释之明心、道之养生，三教本为一体。心中端正，无须装饰；行事光明，何惧黑暗。苦行炼心，去欲存真。',
          achievements: '创立全真道，为道教两大主流之一。倡导三教合一，融合儒释道思想。培育全真七子，各创一派，光大门户。苦行修道之精神感召天下，门徒遍布北方。全真道至今传承不绝，北京白云观为全真祖庭。',
          templeNames: [
            { name: '重阳宫', nameEn: 'Chongyang Palace', role: '全真道祖庭', location: '陕西户县' },
            { name: '活死人墓', nameEn: 'Tomb of the Living Dead', role: '王重阳修道之处', location: '陕西户县终南山' },
            { name: '白云观', nameEn: 'White Cloud Temple', role: '全真道第一丛林', location: '北京' },
          ],
          koans: [
            { title: '活死人墓', description: '王重阳在终南山挖一大坑，题名"活死人墓"，自埋其中修道三年。以此表示断绝尘世之念，视肉身如死，唯修真性。后世武侠小说因此演绎出种种传说，但其本意是修道者断绝世缘的决心。' },
            { title: '焚庵东行', description: '修道有成后，王重阳焚毁自己的草庵，决然东行山东传道。途中以疯癫之态示人，实则以此考验求道者的诚心。在宁海遇马钰夫妇，以种种异行感化，终收为首徒。' },
            { title: '全真七子', description: '王重阳因材施教，七位弟子各有所长：马丹阳善养性，谭处端善悟道，刘处玄善清静，丘处机善苦行，王处一善炼气，郝大通善易理，孙不二善清修。七子各立一派，全真道因此枝繁叶茂。' },
          ],
          classicQuotes: ['心中端正，无须装饰；行事光明，何惧黑暗', '修行在日用之间，非离世绝俗也', '全真者，全其本真也', '凡人学道，先须依此十二个字：断酒色财气，攒慈悲忠孝'],
          works: [
            { title: '重阳全真集', description: '收录王重阳诗文偈颂，阐述全真道修行理论。' },
            { title: '重阳立教十五论', description: '全真道基本规章，论述住庵、云游、学书、合药等十五个方面。' },
          ],
          imageUrl: null,
        },
      })
    : await prisma.patriarch.create({
        data: {
          name: '王重阳', nameEn: 'Wang Chongyang', religionId: taoismId,
          dates: '1112-1170', title: '重阳真人', school: '全真派', generation: 1,
          biography: '全真道创始人。', coreTeaching: '全其本真。',
          achievements: '全真道创始人。', imageUrl: null,
        },
      });

  // ── 老庄哲学 (Philosophical Daoism) — New entries ──

  await prisma.patriarch.create({
    data: {
      name: '庄子', nameEn: 'Zhuangzi', religionId: taoismId,
      dates: '前369-前286',
      title: '南华真人·逍遥至人',
      school: '老庄哲学', generation: 2,
      biography: '庄子（前369-前286），名周，字子休，宋国蒙人。战国时期伟大哲学家、文学家，道家学派代表人物。曾为漆园吏，后辞官不仕，终身不求功名利禄。楚威王闻其贤，遣使以厚币迎之为相，庄子笑辞曰："千金重利，卿相尊位也。子独不见郊祭之牺牛乎？"宁为泥中自由之龟，不为庙堂之上被供奉的枯骨。其思想继承并发展老子学说，主张齐物论、逍遥游，追求精神的绝对自由。散文汪洋恣肆，想象瑰丽，寓言丰富，对中国文学影响极大。',
      coreTeaching: '齐物论——天地与我并生，而万物与我为一。是非、善恶、美丑、生死皆为相对，超越分别心即入道。逍遥游——至人无己，神人无功，圣人无名。不受外物牵累，精神自由逍遥。庄周梦蝶——不知周之梦为胡蝶与？胡蝶之梦为周与？物我两忘，道通为一。',
      achievements: '著《庄子》（又名《南华经》）三十三篇，为中国哲学、文学双峰之一。齐物论开创中国相对主义哲学。逍遥游精神影响中国文人两千年。散文艺术登峰造极，被誉为"文学的哲学，哲学的文学"。',
      templeNames: [
        { name: '南华真人祠', nameEn: 'Nanhua Temple', role: '纪念庄子之处', location: '河南商丘' },
        { name: '濠梁观鱼台', nameEn: 'Haoliang Terrace', role: '庄子与惠子辩鱼之地', location: '安徽凤阳' },
      ],
      koans: [
        { title: '庄周梦蝶', description: '昔者庄周梦为胡蝶，栩栩然胡蝶也，自喻适志与，不知周也。俄然觉，则蘧蘧然周也。不知周之梦为胡蝶与？胡蝶之梦为周与？周与胡蝶则必有分矣。此之谓物化。' },
        { title: '鼓盆而歌', description: '庄子妻死，惠子前往吊唁，见庄子盘腿坐地敲瓦盆唱歌。惠子责怪其无情。庄子曰：人本来自无形无气，气变而有形，形变而有生，今又变而之死，犹春秋冬夏四时运行。生死乃自然之变化也。' },
        { title: '濠梁之辩', description: '庄子与惠子游于濠梁之上。庄子曰：儵鱼出游从容，是鱼之乐也。惠子曰：子非鱼，安知鱼之乐？庄子曰：子非我，安知我不知鱼之乐？此辩展示了庄子"物我相通"的认知观。' },
      ],
      classicQuotes: ['天地与我并生，而万物与我为一', '至人无己，神人无功，圣人无名', '相濡以沫，不如相忘于江湖', '吾生也有涯，而知也无涯', '大知闲闲，小知间间', '朝菌不知晦朔，蟪蛄不知春秋'],
      works: [
        { title: '庄子(南华经)', description: '三十三篇，分内篇七、外篇十五、杂篇十一。内篇为庄子本人所作，思想最精纯。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '列子', nameEn: 'Liezi', religionId: taoismId,
      dates: '约前450-前375',
      title: '冲虚真人·御风者',
      school: '老庄哲学', generation: 2,
      biography: '列子，名御寇，郑国人，战国早期道家代表人物。据传能御风而行，为道家"至人"典范。其思想上承老子，下启庄子，主张贵虚。《庄子》中多次提及列子。今传《列子》八篇，虽经后人整理增补，但保存了大量先秦道家寓言和思想。以愚公移山、杞人忧天等寓言闻名后世。',
      coreTeaching: '贵虚——虚者无贵也，虚者不待人而自虚。御风而行——超脱世俗束缚，与自然和谐共处。万物皆出于机、皆入于机——万物的生灭变化自有其规律。',
      achievements: '道家"贵虚"思想的代表人物。《列子》保存大量先秦寓言，如愚公移山、夸父追日、杞人忧天等。御风而行的传说影响道教飞升成仙思想。',
      templeNames: [
        { name: '列子观', nameEn: 'Liezi Temple', role: '纪念列子之处', location: '河南郑州' },
      ],
      koans: [
        { title: '愚公移山', description: '年近九旬的愚公要移走门前两座大山。智叟嘲笑其不自量力。愚公曰：虽我之死，有子存焉；子又生孙，子子孙孙无穷匮也。而山不加增，何苦而不平？天帝感其诚，命夸娥氏二子背走两山。此寓言启示以恒心克万难。' },
        { title: '杞人忧天', description: '杞国有人忧天地崩坠，身无所寄，废寝食。有人开导说天不过积气，地不过积块，不必忧虑。此寓言表面讽刺无谓之忧，深层却蕴含对宇宙本质的哲学思考。' },
      ],
      classicQuotes: ['天地无全功，圣人无全能，万物无全用', '形枉则影曲，形直则影正', '色盛者骄，力盛者奋，未可以语道也'],
      works: [
        { title: '列子(冲虚经)', description: '八篇：天瑞、黄帝、周穆王、仲尼、汤问、力命、杨朱、说符。保存大量先秦寓言。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '王弼', nameEn: 'Wang Bi', religionId: taoismId,
      dates: '226-249',
      title: '玄学宗师·少年天才',
      school: '老庄哲学', generation: 3,
      biography: '王弼（226-249），字辅嗣，山阳高平（今山东金乡）人，三国曹魏经学家、哲学家。少年天才，弱冠之年即以老庄注释名闻天下。提出"以无为本"的哲学体系，将老子的"道"诠释为超越万象的"无"，开创魏晋玄学。以"得意忘言"方法论革新了经典解释传统。年仅二十三岁病逝，但其学说影响了此后数百年的中国哲学走向。',
      coreTeaching: '以无为本——万有皆以"无"为根本。得意忘言——理解了义理就不必拘泥于文字。崇本息末——推崇根本，止息末节。贵无论奠定了魏晋玄学的思想基础。',
      achievements: '开创魏晋玄学，"贵无论"影响深远。《老子注》和《周易注》改变了两部经典的解释传统。"得意忘言"方法论影响中国解释学数百年。年仅23岁即完成改变思想史走向的著作。',
      templeNames: [],
      koans: [
        { title: '弱冠论道', description: '王弼少年时即与当时名士辩论，每每以新颖观点折服众人。何晏叹曰："仲尼称后生可畏，若斯人者可与言天人之际矣。"年仅二十余岁便被推为玄学领袖。' },
      ],
      classicQuotes: ['以无为本', '得意在忘言，得言在忘象', '崇本息末', '名必有所分，称必有所由'],
      works: [
        { title: '老子注', description: '以"贵无"思想重新诠释《道德经》，为老子学的里程碑之作。' },
        { title: '周易注', description: '以义理派方法解易，取代汉代象数易学，影响后世易学主流。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '郭象', nameEn: 'Guo Xiang', religionId: taoismId,
      dates: '252-312',
      title: '庄子注家·独化论宗师',
      school: '老庄哲学', generation: 4,
      biography: '郭象（252-312），字子玄，河南（今河南洛阳）人，西晋哲学家、玄学家。以《庄子注》闻名于世。其"独化论"主张万物自生自化，无需外在推动力（无造物主），是中国哲学史上重要的自然主义理论。郭象还提出"性分"说，认为每个事物都有其天赋本性，各安其分便是逍遥，将庄子的超越精神转化为对现实秩序的肯定。',
      coreTeaching: '独化论——万物自生自化，非有使之然者。物各有性——事物各有天赋本性，逍遥即安于本性。圣人虽在庙堂之上，其心无异于山林之中——内心自由与社会角色并不矛盾。',
      achievements: '《庄子注》是理解庄子思想最重要的古注之一。独化论开创了中国自然主义哲学传统。将庄子避世思想改造为入世哲学，影响后世士大夫处世观。',
      templeNames: [],
      koans: [
        { title: '安分逍遥', description: '郭象提出：鹏飞万里是其性，蜩与学鸠飞数仞亦是其性。各适其性，各安其分，便都是逍遥。不必羡慕他者，完成自己的天性即是自由。这一诠释使庄子思想从出世转为入世。' },
      ],
      classicQuotes: ['物各自造而无所待焉', '圣人虽在庙堂之上，然其心无异于山林之中', '天下莫不相与为彼我，而彼我皆欲自为'],
      works: [
        { title: '庄子注', description: '三十三篇全注，融合向秀旧注并大量发挥。独化论、性分说皆出自此书，为庄子学最重要著作之一。' },
      ],
      imageUrl: null,
    },
  });

  // ── 天师正一 (Celestial Masters/Zhengyi) — New entries ──

  await prisma.patriarch.create({
    data: {
      name: '张衡', nameEn: 'Zhang Heng (Celestial Master)', religionId: taoismId,
      dates: '?-179',
      title: '嗣天师·第二代天师',
      school: '天师正一', generation: 2,
      teacherId: zhangDaoling.id,
      biography: '张衡，张道陵之子，天师道第二代天师。继承父业，在巴蜀地区继续发展天师道组织。完善了二十四治的行政体系，巩固了五斗米道的教团基础。传道于蜀中，扩大了天师道的影响范围。为天师道从创立到壮大的重要过渡人物。',
      coreTeaching: '继承正一盟威法，完善教团治理。奉道持戒，以道化民。师承父教，光大天师之道。',
      achievements: '天师道第二代天师，承前启后。完善二十四治教区管理体系。巩固了天师道在巴蜀地区的根基。',
      templeNames: [
        { name: '龙虎山天师府', nameEn: 'Longhu Mountain Celestial Master Mansion', role: '天师世居之地', location: '江西鹰潭' },
      ],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  const zhangLu = await prisma.patriarch.create({
    data: {
      name: '张鲁', nameEn: 'Zhang Lu', religionId: taoismId,
      dates: '?-216',
      title: '系天师·第三代天师·汉宁太守',
      school: '天师正一', generation: 3,
      biography: '张鲁（?-216），字公祺，张衡之子，天师道第三代天师。东汉末年割据汉中近三十年（191-215），建立政教合一的地方政权。实行宽惠政策：设义舍（免费客栈）、义米（免费粮食），不设狱吏，犯法者三赦而后刑。曹操征汉中，张鲁降。曹操封其为镇南将军、阆中侯。天师道因此从巴蜀传播至中原各地，为道教全国性发展奠定基础。',
      coreTeaching: '以道治国——行宽惠之政，设义舍义米，体现道教济世精神。三赦之法——犯法者教化三次仍不改方罚，体现道教的慈悲观念。从地方割据到全国传播，展现道教的政治智慧。',
      achievements: '割据汉中三十年，建立政教合一政权。设义舍、义米，实行道教理想社会的实践。降曹后天师道传播至全国，为道教大发展奠定基础。被后世道教尊为"系天师"。',
      templeNames: [
        { name: '汉中天师府遗址', nameEn: 'Hanzhong Celestial Master Ruins', role: '张鲁政教合一政权所在地', location: '陕西汉中' },
      ],
      koans: [
        { title: '义舍济民', description: '张鲁在汉中道路上设义舍，置义米义肉。行路之人可免费取用，但不得多取——取多则鬼会让人生病。以宗教约束实现社会济贫，是道教最早的社会福利实践。' },
      ],
      classicQuotes: ['以道治民，宽而有制', '犯法者三赦而后刑'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '寇谦之', nameEn: 'Kou Qianzhi', religionId: taoismId,
      dates: '365-448',
      title: '北天师道改革者·国师',
      school: '天师正一', generation: 4,
      biography: '寇谦之（365-448），字辅真，上谷昌平（今北京昌平）人，北魏道士。自幼好道，入嵩山修炼三十余年。据传太上老君授以《云中音诵新科之戒》，命其"清整道教"。在北魏太武帝支持下进行道教改革：废除天师道中的房中术、取消租米钱税、建立道教科仪制度。使道教从民间宗教提升为官方认可的制度化宗教。太武帝因其影响而灭佛，史称"太武法难"。',
      coreTeaching: '清整道教——去除道教中的迷信巫术，建立正规科仪制度。以礼度为首，以服食闭炼为本。道教须与儒学礼制结合，方能登堂入室、为国所用。',
      achievements: '北天师道改革者，使道教制度化、规范化。废除天师道弊端，建立道教科仪体系。使道教成为北魏国教，提升了道教的社会地位。嵩山道教因此兴盛。',
      templeNames: [
        { name: '嵩山中岳庙', nameEn: 'Zhongyue Temple', role: '寇谦之修道传法之地', location: '河南登封' },
      ],
      koans: [
        { title: '清整道教', description: '寇谦之入嵩山修道三十年，感太上老君降授新科仪戒律，命其革除天师道旧弊。遂废房中术、除租米税、立科仪、倡礼度。使道教脱胎换骨，从民间信仰走向制度化宗教。' },
      ],
      classicQuotes: ['以礼度为首，以服食闭炼为本', '清整道教，除去三张伪法'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '许逊', nameEn: 'Xu Xun', religionId: taoismId,
      dates: '239-374',
      title: '许天师·净明忠孝道祖',
      school: '天师正一', generation: 4,
      biography: '许逊（239-374），字敬之，南昌人，东晋道士，净明道祖师。少年好道，后举孝廉任旌阳县令，治政清明，深受百姓爱戴，人称"许旌阳"。辞官后回南昌修道，传说斩蛟龙除水患，拯救百姓。晋宁康二年（374年）携全家四十二口拔宅飞升，鸡犬亦随之升天，成语"一人得道，鸡犬升天"即出于此。后世建万寿宫（西山万寿宫）纪念。净明道以"忠孝"为核心，融合儒道，为道教重要流派。',
      coreTeaching: '净明忠孝——修道以忠孝为本，净明为体。忠孝者，道之实际也。欲修仙道，先修人道。不忠不孝，虽有方术，终不能成。修道即是做一个忠于国家、孝于父母的好人。',
      achievements: '净明忠孝道创立者，以儒家伦理改造道教修行。斩蛟除害的传说使其成为民间最受崇拜的道教神祇之一。万寿宫遍布全国，为江西人的精神纽带。"一人得道，鸡犬升天"成语的来源。',
      templeNames: [
        { name: '西山万寿宫', nameEn: 'Xishan Wanshou Palace', role: '许真君飞升之地·净明道祖庭', location: '江西南昌' },
      ],
      koans: [
        { title: '斩蛟除害', description: '传说鄱阳湖蛟龙为患，水灾频仍。许逊以道法斩杀蛟龙，解除水患，拯救万民。此后百姓感恩戴德，建庙祀之。体现了道教济世利民的精神。' },
        { title: '拔宅飞升', description: '许逊修道有成，晋宁康二年携全家四十二口及鸡犬一起白日飞升。邻里望见其宅拔地而起，冉冉升天。此为道教"举家飞升"的典型故事。' },
      ],
      classicQuotes: ['欲修仙道，先修人道', '忠孝者，道之实际也', '净明者，无幽不烛，纤尘不染'],
      works: [],
      imageUrl: null,
    },
  });

  // ── 上清灵宝 (Shangqing & Lingbao) — All new ──

  const weiHuacun = await prisma.patriarch.create({
    data: {
      name: '魏华存', nameEn: 'Wei Huacun', religionId: taoismId,
      dates: '252-334',
      title: '紫虚元君·上清派开宗祖师',
      school: '上清灵宝', generation: 1,
      biography: '魏华存（252-334），字贤安，任城（今山东济宁）人，西晋女道士，上清派开宗祖师。出身官宦之家，自幼好道。嫁南阳刘幼彦为妻，生二子。后修道于衡山，据传感通真人降授《上清大洞真经》等经典。被尊为上清派第一代宗师、"紫虚元君"。魏华存是道教史上最重要的女性宗教家，上清经系因她而诞生，影响道教发展近千年。后世尊为南岳夫人。',
      coreTeaching: '存思内观——通过冥想观想体内神灵，与天地真神沟通。上清经法以存思为核心修行方法，观想日月星辰在体内运转。心神合一，以道化形——修炼的终极目标是形神俱妙、与道合真。',
      achievements: '上清派开宗祖师，道教史上最重要的女性宗教家。传授《上清大洞真经》等核心经典。开创存思内观的修行传统。被道教尊为紫虚元君、南岳夫人。',
      templeNames: [
        { name: '南岳黄庭观', nameEn: 'Huangting Taoist Temple', role: '魏华存修道之地', location: '湖南衡阳' },
      ],
      koans: [
        { title: '真人降经', description: '魏华存虔诚修道，感动上界真人降临，授以《上清大洞真经》三十一卷及《黄庭经》。这些经典成为上清派的核心法典，也是整个道教内修传统的重要经典。' },
      ],
      classicQuotes: ['一心精诚，存神内观', '形神俱妙，与道合真'],
      works: [
        { title: '黄庭经(传授)', description: '《黄庭内景经》和《黄庭外景经》，道教内修的核心经典，论述体内神灵和存思修炼方法。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '杨羲', nameEn: 'Yang Xi', religionId: taoismId,
      dates: '330-386',
      title: '上清经师·灵媒',
      school: '上清灵宝', generation: 2,
      teacherId: weiHuacun.id,
      biography: '杨羲（330-386），字羲和，吴人（今江苏）。东晋道士，上清派重要传承者。据传能通灵感应，魏华存等真人通过他降授大量上清经典。杨羲将所得天书传授许谧、许翙父子。他所记录的真人降授内容，后经陶弘景整理为《真诰》，是上清派最重要的文献。杨羲被视为连接天上真人与人间修道者的关键人物。',
      coreTeaching: '通灵感应——以至诚修炼感通天界真人，接受天书降授。上清经法的传承需要特殊的灵性资质和虔诚修炼。',
      achievements: '上清经典的核心传承者和记录者。通过灵媒降授，传下大量上清派经典。其记录被陶弘景整理为《真诰》。连接上清派从天界到人间的关键人物。',
      templeNames: [
        { name: '茅山', nameEn: 'Maoshan', role: '上清派发展重地', location: '江苏句容' },
      ],
      koans: [],
      classicQuotes: [],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '陆修静', nameEn: 'Lu Xiujing', religionId: taoismId,
      dates: '406-477',
      title: '简寂先生·道教科仪大师',
      school: '上清灵宝', generation: 3,
      biography: '陆修静（406-477），字元德，吴兴东迁（今浙江湖州）人，南朝宋著名道士。遍历名山，广收道书。宋明帝时入庐山修道，建简寂观。受命编纂道教经典，首创三洞分类法（洞真、洞玄、洞神），奠定道藏编纂体系。系统整理灵宝派科仪，制定斋醮仪式规范，使道教仪式从杂乱走向规范化。被称为"道教科仪的集大成者"。',
      coreTeaching: '三洞分类——将道教经典分为洞真（上清）、洞玄（灵宝）、洞神（三皇）三大部类，建立道教经典的分类体系。斋醮科仪——制定系统的道教仪式规范，使祭祀、斋醮有章可循。',
      achievements: '创立道教经典三洞分类法，为道藏编纂奠定基础。系统整理灵宝科仪，使道教仪式规范化。收集整理道教经书一千余卷。被后世尊为灵宝派重要宗师。',
      templeNames: [
        { name: '庐山简寂观', nameEn: 'Jianji Monastery', role: '陆修静修道著述之地', location: '江西庐山' },
      ],
      koans: [
        { title: '三洞分类', description: '陆修静广收天下道书千余卷，按内容性质分为三洞：洞真（上清经系）、洞玄（灵宝经系）、洞神（三皇文等）。此分类法后成为道藏编纂的基本框架，影响延续至今。' },
      ],
      classicQuotes: ['三洞者，通玄达妙之总名也', '斋者，齐也，齐正身心，不令放逸'],
      works: [
        { title: '三洞经书目录', description: '首次系统编纂道教经典目录，为道藏编纂奠定基础。' },
        { title: '灵宝科仪', description: '系统整理灵宝派斋醮仪式，使道教仪式走向规范。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '陶弘景', nameEn: 'Tao Hongjing', religionId: taoismId,
      dates: '456-536',
      title: '山中宰相·华阳隐居',
      school: '上清灵宝', generation: 4,
      biography: '陶弘景（456-536），字通明，自号华阳隐居，丹阳秣陵（今南京）人。南朝齐梁时期著名道士、医药学家、文学家。十岁读葛洪《神仙传》而立志修道。历任诸王侍读，后辞官隐居茅山，建华阳馆。梁武帝即位后常以书信问政于他，时人称"山中宰相"。整理杨羲、许谧上清经典，撰《真诰》二十卷。精通天文、历算、医药、本草，编《本草经集注》，为中国药学史的里程碑。茅山宗（上清派茅山支派）因他而大盛。',
      coreTeaching: '上清存思与外丹炼制并重。修道不离世——虽隐居山林，仍心系天下。学问广博——道教修行不限于宗教，医药、天文、历算皆可入道。',
      achievements: '整理上清经典，撰《真诰》二十卷，确立茅山宗地位。编《本草经集注》，为中国药学史里程碑。"山中宰相"之名传千古。使茅山成为道教圣地。精通多个学科，为道教文化百科式人物。',
      templeNames: [
        { name: '茅山华阳洞', nameEn: 'Maoshan Huayang Cave', role: '陶弘景隐居修道之地', location: '江苏句容茅山' },
      ],
      koans: [
        { title: '山中宰相', description: '陶弘景隐居茅山，梁武帝屡次征召不出。但每有国家大事，武帝必遣使入山咨询。陶弘景虽不出山，实际上参与了许多国政决策。时人称"山中宰相"，体现了道家"处江湖之远则忧其君"的精神。' },
        { title: '二牛图', description: '梁武帝欲召陶弘景出山为官。陶弘景画二牛图以献：一牛自在水草间，一牛戴金笼头被人牵引。武帝见而笑，不复强召。以画明志，宁为自由之牛，不为富贵之囚。' },
      ],
      classicQuotes: ['山中何所有？岭上多白云。只可自怡悦，不堪持赠君', '研精覃思，博采众方'],
      works: [
        { title: '真诰', description: '二十卷，整理杨羲所记上清真人降授内容，为上清派最重要的文献。' },
        { title: '本草经集注', description: '整理增补《神农本草经》，收药物730种，为中国药学史里程碑。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '司马承祯', nameEn: 'Sima Chengzhen', religionId: taoismId,
      dates: '647-735',
      title: '白云先生·道隐',
      school: '上清灵宝', generation: 5,
      biography: '司马承祯（647-735），字子微，号白云先生，河内温县（今河南温县）人，唐代著名道士。师事上清派第十一代宗师潘师正，为上清派第十二代宗师。隐居天台山玉霄峰，修道四十余年。唐睿宗、玄宗先后召见，李白亦曾拜访。精通书法、篆刻，善于道教理论著述。其《坐忘论》系统阐述道教内修七个阶段，是道教修行理论的经典之作。',
      coreTeaching: '坐忘七阶——敬信、断缘、收心、简事、真观、泰定、得道，循序渐进的修行次第。主静去欲，形如槁木，心如死灰。由外而内、由粗而细、由动而静，最终形神合道。',
      achievements: '上清派第十二代宗师。著《坐忘论》，系统化道教修行理论。受三代唐帝礼遇，提升道教社会地位。精通书法篆刻，有"道门王羲之"之称。',
      templeNames: [
        { name: '天台山桐柏宫', nameEn: 'Tongbai Palace', role: '司马承祯修道之地', location: '浙江天台' },
      ],
      koans: [
        { title: '帝王三召', description: '唐睿宗、玄宗先后三次召见司马承祯。每次他应召入朝，谈论道法后便辞归山林。玄宗问何以能不恋朝堂？答曰：臣所修者道耳，道在天台山中，不在长安城里。' },
      ],
      classicQuotes: ['坐忘者，因存以息存，息存而忘', '心无所著，万境不能动', '道者，神异之物，灵而有性'],
      works: [
        { title: '坐忘论', description: '阐述修道七个阶段：敬信、断缘、收心、简事、真观、泰定、得道。道教修行理论经典。' },
        { title: '天隐子', description: '论述道教修炼方法，包括斋戒、安处、存想、坐忘、神解等。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '杜光庭', nameEn: 'Du Guangting', religionId: taoismId,
      dates: '850-933',
      title: '广成先生·道教百科全书',
      school: '上清灵宝', generation: 6,
      biography: '杜光庭（850-933），字宾至，处州缙云（今浙江缙云）人，晚唐五代著名道士、学者。少习儒学，后入天台山修道。历仕唐僖宗、前蜀王建、王衍三朝。博学多才，著述等身，涉及道教科仪、教理、传记、文学等各方面，被称为"道教百科全书式人物"。晚年隐居青城山，专事著述。其作品对后世道教发展影响深远。',
      coreTeaching: '道教义理须与科仪实践并重。博采众长，融汇各派——不拘一宗一派，博采上清、灵宝、正一各派之长。以文弘道——著述是传道的重要方式。',
      achievements: '著述百余种，为道教史上最多产的学者之一。编纂道教科仪集成，影响后世千年。文学创作亦佳，《虬髯客传》为唐传奇名篇。被称为道教百科全书式人物。',
      templeNames: [
        { name: '青城山', nameEn: 'Qingcheng Mountain', role: '杜光庭晚年隐居著述之地', location: '四川都江堰' },
      ],
      koans: [],
      classicQuotes: ['道之为物，居于太虚之先', '圣人之教，以道为宗'],
      works: [
        { title: '道德真经广圣义', description: '对《道德经》的系统注释，综合历代注家观点，为道经注释集大成之作。' },
        { title: '广成集', description: '收录科仪、表章、诗文等，是了解唐代道教的重要文献。' },
      ],
      imageUrl: null,
    },
  });

  // ── 全真派 (Quanzhen/Complete Perfection) — New entries (disciples) ──

  await prisma.patriarch.create({
    data: {
      name: '马钰', nameEn: 'Ma Yu (Ma Danyang)', religionId: taoismId,
      dates: '1123-1183',
      title: '丹阳真人·全真七子之首·遇仙派祖',
      school: '全真派', generation: 2,
      teacherId: wangChongyang.id,
      biography: '马钰（1123-1183），字宜甫，号丹阳子，山东宁海（今山东牟平）人。全真七子之首，遇仙派创始人。出身富家，与妻子孙不二皆为王重阳弟子。王重阳入山东后，马钰最先受教，被指定为全真道掌教。修道以清净为主，主张"无为清净"，不尚奇异。其遇仙派传承广泛，对全真道的发展贡献最大。',
      coreTeaching: '无为清净——修道以清净心为根本，不追求神通奇异。全真修行在日用伦常中，担水劈柴无非妙道。识心见性，明心为上。',
      achievements: '全真七子之首，全真道第二代掌教。创立遇仙派，为全真道传承最广的支派之一。以身作则推广清净修行。',
      templeNames: [
        { name: '烟霞洞', nameEn: 'Yanxia Cave', role: '马钰修道之处', location: '山东昆嵛山' },
      ],
      koans: [
        { title: '弃家求道', description: '马钰家境富裕，王重阳以种种异行考验其道心。马钰终弃万贯家财，与妻子孙不二先后出家修道。夫妻皆成全真大师，在道教史上传为佳话。' },
      ],
      classicQuotes: ['修行只在日用间', '心清意静天堂路', '无为清净是真修'],
      works: [
        { title: '丹阳真人语录', description: '收录马钰修道言论，为全真道修行指导。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '谭处端', nameEn: 'Tan Chuduan', religionId: taoismId,
      dates: '1123-1185',
      title: '长真真人·南无派祖',
      school: '全真派', generation: 2,
      teacherId: wangChongyang.id,
      biography: '谭处端（1123-1185），字通正，号长真子，山东宁海人。全真七子之一，南无派创始人。原患风痹症半身不遂，闻王重阳之名前去求治，重阳以道法治愈其病。遂拜师修道，精勤不懈。主张以打坐存神为修行核心，创立南无派。',
      coreTeaching: '存神养气——以打坐冥想为核心修行方法。"南无"即皈依之意，一心皈依大道。修心为上，苦行辅之。',
      achievements: '全真七子之一，创立南无派。以病入道，体现道教修行的疗愈力量。南无派传承至今。',
      templeNames: [],
      koans: [
        { title: '病中悟道', description: '谭处端身患半身不遂多年，百药无效。闻王重阳来山东传道，抱病前往。重阳不施药饵，以道法点化其心。谭处端豁然开悟，病竟不治而愈。由此知身病不若心病，心通则百病消。' },
      ],
      classicQuotes: ['心定则神全，神全则气足'],
      works: [
        { title: '水云集', description: '收录诗文修道心得。' },
      ],
      imageUrl: null,
    },
  });

  const qiuChuji = await prisma.patriarch.create({
    data: {
      name: '丘处机', nameEn: 'Qiu Chuji', religionId: taoismId,
      dates: '1148-1227',
      title: '长春真人·龙门派祖·一言止杀',
      school: '全真派', generation: 2,
      teacherId: wangChongyang.id,
      biography: '丘处机（1148-1227），字通密，号长春子，山东栖霞人。全真七子中影响最大者，龙门派创始人。19岁出家修道，在昆嵛山烟霞洞等处苦修多年。1219年，成吉思汗遣使征召，丘处机以73岁高龄率弟子西行三万里至大雪山（今阿富汗）觐见。丘处机劝成吉思汗"敬天爱民""减少杀戮"，成吉思汗深为折服，尊为"神仙"。此次西行被弟子李志常记录为《长春真人西游记》。蒙古赐其掌管天下道教，全真道因此大盛。龙门派后成为全真道最大支派。',
      coreTeaching: '清心寡欲，苦行修炼。一言止杀——以慈悲之心劝化帝王，减少战争杀戮。修道者当以天下苍生为念，不可独善其身。龙门心法以打坐功夫为根本。',
      achievements: '全真七子中影响最大者。万里西行劝谏成吉思汗"减少杀戮"，救人无数。创立龙门派，为全真道最大支派。掌管天下道教，全真道因此大盛。《长春真人西游记》为中西交通史重要文献。',
      templeNames: [
        { name: '北京白云观', nameEn: 'White Cloud Temple', role: '丘处机主持·龙门派祖庭', location: '北京' },
        { name: '栖霞太虚宫', nameEn: 'Taixu Palace', role: '丘处机故里道观', location: '山东栖霞' },
      ],
      koans: [
        { title: '万里西行', description: '1219年成吉思汗遣使召丘处机，73岁的他率十八弟子从山东出发，经蒙古大漠、天山、中亚，历时两年行三万里至大雪山。路途艰险，多人病倒，但丘处机矢志不移，只为劝谏大汗止杀。' },
        { title: '一言止杀', description: '觐见成吉思汗后，丘处机以"敬天爱民"之道劝谏："天道好生，止杀保民为上。"成吉思汗深为感动，下令减少屠城。据估计此举拯救了数十万人的生命。世人因此称"一言止杀"。' },
      ],
      classicQuotes: ['天道好生，止杀保民', '修道者当以天下苍生为念', '寡欲则身轻，清心则神爽', '学道之人，须要苦志'],
      works: [
        { title: '摄生消息论', description: '论述四季养生方法，为道教养生经典。' },
        { title: '大丹直指', description: '论述内丹修炼方法。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '王处一', nameEn: 'Wang Chuyi', religionId: taoismId,
      dates: '1142-1217',
      title: '玉阳真人·嵛山派祖',
      school: '全真派', generation: 2,
      teacherId: wangChongyang.id,
      biography: '王处一（1142-1217），号玉阳子，山东宁海人。全真七子之一，嵛山派创始人。自幼好道，闻王重阳来山东传道遂拜师。以铁脚板著称——常年赤脚在山石上修行，脚底坚硬如铁。修行以苦行炼心为主，在铁查山等地苦修多年。金章宗召见，赐号"体玄大师"。',
      coreTeaching: '苦行炼心——以肉体的磨练来锤炼道心。赤脚修行，不避寒暑，以苦为乐。修道须从难处做起。',
      achievements: '全真七子之一，创立嵛山派。苦行精神感召信众。受金朝皇帝召见，提升全真道地位。',
      templeNames: [
        { name: '圣水岩', nameEn: 'Shengshui Rock', role: '王处一苦修之地', location: '山东文登铁查山' },
      ],
      koans: [],
      classicQuotes: ['苦行方能了道', '铁脚踏破红尘路'],
      works: [
        { title: '云光集', description: '收录修道诗文。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '孙不二', nameEn: 'Sun Bu\'er', religionId: taoismId,
      dates: '1119-1182',
      title: '清静散人·清静派祖·女丹始祖',
      school: '全真派', generation: 2,
      teacherId: wangChongyang.id,
      biography: '孙不二（1119-1182），名富春，号不二，山东宁海人，马钰之妻。全真七子中唯一女性，清静派创始人。原为富家主妇，与丈夫马钰一同拜王重阳为师。为表修道决心，自毁容貌（以热油泼面），断绝世俗之念。独自前往洛阳修道六年，终成大道。开创女丹修炼法门，为道教女性修行提供了专门的理论体系。被后世尊为"坤道始祖"。',
      coreTeaching: '清静修炼——女性修道以清静为本。女丹修炼有别于男子——先炼形质（斩赤龙），后修性功。清静无为，柔弱守雌，正是道之根本。',
      achievements: '全真七子唯一女性，道教最重要的女性宗师之一。创立清静派，开创女丹修炼法门。自毁容貌求道的决心为后世修道者楷模。为女性在道教中争得重要地位。',
      templeNames: [
        { name: '洛阳风仙姑洞', nameEn: 'Feng Xiangu Cave', role: '孙不二修道之处', location: '河南洛阳' },
      ],
      koans: [
        { title: '毁容求道', description: '孙不二容貌美丽，王重阳以此为障碍，暗示她过于注重外表。孙不二遂以热油泼面自毁容貌，表示断绝对色身的执著。此后独自去洛阳苦修六年，终成道果。此举震动道门，成为求道决心的千古典范。' },
      ],
      classicQuotes: ['清静者，道之本也', '坤道柔顺，守雌抱一', '断却尘缘方见性'],
      works: [
        { title: '孙不二元君法语', description: '论述女丹修炼方法和心得，为道教女丹经典。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '刘处玄', nameEn: 'Liu Chuxuan', religionId: taoismId,
      dates: '1147-1203',
      title: '长生真人·随山派祖',
      school: '全真派', generation: 2,
      teacherId: wangChongyang.id,
      biography: '刘处玄（1147-1203），字通妙，号长生子，山东东莱（今山东莱州）人。全真七子之一，随山派创始人。拜王重阳为师后苦修多年，以持戒精严著称。金章宗召见，赐号"长生辅化明德真人"。主张修道须戒律为先，创立随山派。',
      coreTeaching: '戒律为先——修道以持戒为根本。无戒则无定，无定则无慧。随山而修，随缘而化。',
      achievements: '全真七子之一，创立随山派。以持戒精严著称。受金朝皇帝赐号。',
      templeNames: [],
      koans: [],
      classicQuotes: ['持戒为修道之基'],
      works: [
        { title: '仙乐集', description: '收录修道诗文。' },
      ],
      imageUrl: null,
    },
  });

  // ── 内丹养生 (Inner Alchemy & Cultivation) — All new ──

  await prisma.patriarch.create({
    data: {
      name: '葛洪', nameEn: 'Ge Hong', religionId: taoismId,
      dates: '283-343',
      title: '抱朴子·丹道先驱',
      school: '内丹养生', generation: 1,
      biography: '葛洪（283-343），字稚川，自号抱朴子，丹阳句容（今江苏句容）人，东晋道士、炼丹家、医药学家。出身江南士族，少好道术，从祖父葛玄之弟子郑隐学道。博学多闻，著述宏富。其《抱朴子》内篇论神仙方药、鬼怪变化、养生延年、禳邪却祸，为道教理论的重要著作。精通炼丹术和医学，《肘后备急方》中记载的青蒿治疟疾，启发了屠呦呦发现青蒿素（2015年诺贝尔奖）。晚年入广东罗浮山修道炼丹。',
      coreTeaching: '仙可学致——神仙不是天生的，凡人通过修炼可以成仙。以金丹大道为修炼核心。修仙须先积善行德，后炼金丹。外丹炼制与内在修行并重。兼修医术，济世利人。',
      achievements: '著《抱朴子》，为道教理论体系的重要构建者。《肘后备急方》记载青蒿治疟疾，启发2015年诺贝尔奖。系统阐述金丹道理论。为道教"仙可学致"思想的理论代言人。',
      templeNames: [
        { name: '罗浮山冲虚古观', nameEn: 'Chongxu Temple', role: '葛洪修道炼丹之地', location: '广东惠州' },
      ],
      koans: [
        { title: '罗浮炼丹', description: '葛洪晚年携家入罗浮山，搭建丹房炼丹修道。山中岁月，一边炼丹求仙，一边著书立说。其弟子黄野人等随侍左右。罗浮山因此成为岭南道教圣地。' },
      ],
      classicQuotes: ['仙可学致，不死可得', '我命在我不在天', '志合者，不以山海为远', '人之所以死者，以其有身也'],
      works: [
        { title: '抱朴子', description: '内篇二十卷论道教方术，外篇五十卷论社会人事。道教理论重要著作。' },
        { title: '肘后备急方', description: '实用医方集，其中青蒿治疟记载启发了青蒿素的发现。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '吕洞宾', nameEn: 'Lü Dongbin', religionId: taoismId,
      dates: '796-?',
      title: '纯阳真人·八仙之首·剑仙',
      school: '内丹养生', generation: 2,
      biography: '吕洞宾，名嵒（或岩），字洞宾，号纯阳子，河中府（今山西永济）人，唐代道士，八仙之一。传说两举进士不第，64岁时在长安酒肆遇钟离权，经"黄粱梦"点化悟道。后从钟离权学道，得金丹大道。传说精通剑术，好行侠仗义，游历天下度化有缘。全真道尊其为"纯阳祖师"，为全真五祖之一。在民间信仰中极为流行，各地纯阳宫遍布。吕洞宾形象融合了道士、剑客、诗人三重身份，是中国文化中最知名的道教人物之一。',
      coreTeaching: '钟吕金丹道——以内丹修炼为核心，性命双修。先修命功（气），后修性功（神），最终形神俱妙。慈悲度世——修道有成须度化世人。一粒粟中藏世界，半升铛内煮山川。',
      achievements: '八仙之首，中国最知名的道教人物。钟吕金丹道的传承者和推广者。全真五祖之一。民间吕祖信仰遍布天下，纯阳宫遍及各地。诗文传世，道教文学的代表。',
      templeNames: [
        { name: '永乐纯阳宫', nameEn: 'Yongle Chunyang Palace', role: '吕祖传道之地', location: '山西芮城' },
        { name: '八仙宫', nameEn: 'Eight Immortals Palace', role: '吕洞宾度化之地', location: '陕西西安' },
      ],
      koans: [
        { title: '黄粱一梦', description: '吕洞宾赴京赶考，在长安酒肆遇一道者（钟离权）。吕洞宾枕道者所赐枕头入睡，梦中历尽荣华富贵、升沉起伏数十年人生。醒来时锅中黄粱饭尚未煮熟。一梦而悟人生如幻，遂拜钟离权为师修道。' },
        { title: '三醉岳阳楼', description: '传说吕洞宾三次醉酒于岳阳楼，每次皆以异行度化有缘之人。或题诗壁上，或点化店主，或飞剑斩妖。"朝游北海暮苍梧，袖里青蛇胆气粗。三醉岳阳人不识，朗吟飞过洞庭湖。"' },
      ],
      classicQuotes: ['一粒粟中藏世界，半升铛内煮山川', '朝游北海暮苍梧', '心平气和天地宽', '得道多助，施恩不图报'],
      works: [
        { title: '吕祖全书', description: '收录吕洞宾诗文、丹法、度世故事等，为吕祖信仰的核心文献。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '张伯端', nameEn: 'Zhang Boduan', religionId: taoismId,
      dates: '984-1082',
      title: '紫阳真人·南宗始祖',
      school: '内丹养生', generation: 3,
      biography: '张伯端（984-1082），字平叔，号紫阳，天台（今浙江天台）人，北宋著名道士。一生坎坷，曾为幕僚，因事被谪流岭南。遇异人传授金丹大道，修炼有成。著《悟真篇》，以诗词阐述内丹修炼理论，为南宗丹法的奠基之作。主张先命后性——先修炼精气（命功），再修心性（性功），与全真派先性后命不同。被道教南宗尊为始祖，号"紫阳真人"。',
      coreTeaching: '先命后性——修炼应先从精气入手（命功），筑基有成后再修心性（性功）。药逢气类方成象，道在希夷合自然。内丹修炼的关键在于识得"真铅真汞"，以意导气，炼精化气、炼气化神、炼神还虚。',
      achievements: '著《悟真篇》，为内丹学最重要的经典之一。开创道教南宗丹法体系。与北宗（全真道）并立，形成道教内丹南北二宗格局。享年近百岁，身体力行证明丹道养生之效。',
      templeNames: [
        { name: '天台紫阳宫', nameEn: 'Ziyang Palace', role: '纪念张伯端', location: '浙江天台' },
      ],
      koans: [
        { title: '岭南悟道', description: '张伯端因事被谪流岭南，颠沛流离中遇异人传授金丹口诀。多年苦修终于悟道，以诗词记录修炼心得，写成《悟真篇》。困境中的觉悟，正印证了"否极泰来"之理。' },
      ],
      classicQuotes: ['药逢气类方成象，道在希夷合自然', '要知金液还丹法，须向家园下种栽', '不移一步到西天，端坐诸方在目前'],
      works: [
        { title: '悟真篇', description: '以七言绝句、律诗和词的形式阐述内丹修炼，为道教南宗丹经之祖。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '白玉蟾', nameEn: 'Bai Yuchan', religionId: taoismId,
      dates: '1134-1229',
      title: '紫清真人·南宗五祖之末·雷法宗师',
      school: '内丹养生', generation: 4,
      biography: '白玉蟾（1134-1229），原名葛长庚，字如晦，号海琼子，祖籍福建闽清。南宋著名道士，道教南宗第五代传人（南五祖之末）。少年聪慧，博通经史。后入道修炼，游历天下名山。精通内丹、雷法、符箓、诗文书画，才华横溢。将南宗内丹学与雷法结合，创立了独特的修炼体系。在全国各地设立靖室传道，弟子遍布南方。诗文书画俱佳，为道教文艺的代表人物。',
      coreTeaching: '内丹与雷法并重——以内丹修炼为本，以雷法济世为用。精气神三宝合一，成就金丹大道。修道须文武兼备——内修丹道以证道果，外行雷法以济世利民。',
      achievements: '南宗五祖之末，完成了南宗丹法的体系建设。将内丹与雷法结合，创立新的修炼体系。诗文书画俱佳，为道教文艺史的代表人物。在南方广设靖室，推动道教南宗传播。',
      templeNames: [
        { name: '武夷山止止庵', nameEn: 'Zhizhi Temple', role: '白玉蟾修道传法之地', location: '福建武夷山' },
      ],
      koans: [],
      classicQuotes: ['静坐焚香万虑空', '白云黄鹤是知音', '一点灵光照大千'],
      works: [
        { title: '海琼白真人语录', description: '收录修道语录和丹法心得。' },
        { title: '海琼玉蟾先生文集', description: '诗文集，展示道教文人的文学才华。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '张三丰', nameEn: 'Zhang Sanfeng', religionId: taoismId,
      dates: '约1247-?',
      title: '通微显化真人·太极拳祖师',
      school: '内丹养生', generation: 5,
      biography: '张三丰，名通，号三丰，辽东懿州（今辽宁阜新）人，元末明初著名道士。身材高大，龟形鹤背，大耳圆目，须髯如戟。无论寒暑，仅一衲一蓑。传说能日行千里。曾在武当山修道，开创武当内家拳（太极拳的前身）。明朝诸帝屡次遣使寻访不遇。其"以柔克刚"的武学理念和"三丰内丹"的修炼体系影响深远。被明成祖封为"通微显化真人"。张三丰将内丹修炼与武术融合，创立了独特的内家武学体系。',
      coreTeaching: '以柔克刚——太极拳以柔化刚，四两拨千斤。内丹修炼与武术合一——练拳即炼丹，动中有静，静中有动。阴阳互济，刚柔相推——太极即道，道即太极。',
      achievements: '武当内家拳（太极拳前身）创始人。将内丹修炼与武术完美结合。明朝诸帝寻访不遇，传奇色彩浓厚。太极拳传播全球，为世界非物质文化遗产。武当山因此成为武术圣地。',
      templeNames: [
        { name: '武当山遇真宫', nameEn: 'Yuzhen Palace', role: '张三丰修道之地', location: '湖北十堰' },
        { name: '武当山紫霄宫', nameEn: 'Zixiao Palace', role: '武当道教核心宫观', location: '湖北十堰' },
      ],
      koans: [
        { title: '观鹊蛇斗', description: '传说张三丰在武当山修道时，偶见喜鹊与蛇相斗。蛇以柔软之身闪避鹊的攻击，以缠绕之法克制鹊的啄击。张三丰由此悟出"以柔克刚"之理，创立了太极拳法。' },
        { title: '邋遢道人', description: '张三丰不修边幅，衣衫褴褛，人称"张邋遢"。然而其内功深厚，能辟谷数月不食。寒暑不侵，日行千里。外表邋遢不羁，内心清明如镜——真人不露相，露相非真人。' },
      ],
      classicQuotes: ['太极者，无极而生，动静之机，阴阳之母也', '以柔克刚，以静制动', '一举动，周身俱要轻灵', '虚灵顶劲，气沉丹田'],
      works: [
        { title: '张三丰太极拳论', description: '阐述太极拳理论和技法，为内家拳学的奠基之作。' },
        { title: '无根树', description: '以词牌形式阐述内丹修炼，通俗易懂，影响广泛。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '陈撄宁', nameEn: 'Chen Yingning', religionId: taoismId,
      dates: '1880-1969',
      title: '仙学巨子·当代道教复兴者',
      school: '内丹养生', generation: 6,
      biography: '陈撄宁（1880-1969），原名元善，字撄宁，安徽怀宁人。近现代最重要的道教学者和修炼家。幼年体弱多病，遂立志研究仙学以求健康长寿。遍访名山高道，精通内丹、医学、中药。提出"仙学"概念，主张将道教修炼从宗教信仰中剥离出来，以科学方法研究人体潜能。创办《扬善》《仙道月报》等刊物，推广道教养生文化。1957年当选中国道教协会副会长。被誉为"当代太上老君""仙学巨子"。',
      coreTeaching: '仙学——将道教修炼科学化、系统化研究。不拘宗教形式，直接研究人体长生之道。修炼的核心是性命双修，以科学态度对待传统丹道。养生延年是每个人都可以实践的。',
      achievements: '提出"仙学"概念，推动道教修炼的现代化研究。创办《扬善》《仙道月报》，推广道教文化。将传统丹道与现代科学思维结合。中国道教协会创始人之一。培养了一批道教研究和修炼人才。',
      templeNames: [],
      koans: [],
      classicQuotes: ['仙学者，以人类长生为研究对象之学术也', '我命在我不在天，还丹成金亿万年'],
      works: [
        { title: '灵源大道歌白话注解', description: '以现代白话文注解道教经典，使古代丹经通俗易懂。' },
        { title: '黄庭经讲义', description: '对道教内修经典《黄庭经》的系统讲解。' },
      ],
      imageUrl: null,
    },
  });

  const taoistCount = 26; // 26 new + 3 updated
  console.log(`  ✓ ${taoistCount} new Taoist patriarchs created + 3 updated (5 traditions: Philosophy/Zhengyi/Shangqing-Lingbao/Quanzhen/Neidan)`);

  // ── 4o. 儒教先贤 (Confucian Patriarchs/Sages) ──
  console.log('  Creating Confucian patriarchs (4o)...');

  const confucianismId = religionMap['confucianism'];

  // Update existing 孔子 with full data + school field
  const existingConfucius = await prisma.patriarch.findFirst({ where: { name: '孔子' } });
  const confucius = existingConfucius
    ? await prisma.patriarch.update({
        where: { id: existingConfucius.id },
        data: {
          nameEn: 'Confucius',
          dates: '前551-前479',
          title: '至圣先师·万世师表·大成至圣文宣王',
          school: '先秦儒学',
          generation: 1,
          biography: '孔子（前551-前479），名丘，字仲尼，鲁国陬邑（今山东曲阜）人，中国最伟大的思想家、教育家，儒家学派创始人。先世为宋国贵族，后迁鲁。三岁丧父，家贫而好学。曾任鲁国中都宰、司空、大司寇，因政治理想不得施展，率弟子周游列国十四年。晚年返鲁，致力于教育和整理古代典籍——删诗书、定礼乐、序周易、作春秋。创办私学，弟子三千，贤者七十二。其核心思想"仁""礼""中庸"构成了中国文化的基本伦理框架。孔子身后被尊为"至圣先师""万世师表"，历代帝王追封，最高为"大成至圣文宣王"。其教导深刻影响了东亚文明圈两千五百年。',
          coreTeaching: '仁者爱人——仁是孔子思想的核心，"己所不欲，勿施于人"是实践仁的方法。克己复礼为仁——约束自己，恢复礼制。中庸之道——不偏不倚，过犹不及。有教无类——教育不分贵贱。学而不厌，诲人不倦——终身学习，乐于教导。为政以德——以道德教化治理国家，如北辰居所而众星共之。',
          achievements: '创立儒家学派，影响东亚文明两千五百年。首开私人讲学之风，弟子三千、贤者七十二。整理六经（诗、书、礼、乐、易、春秋），传承中华文化命脉。"仁""礼""中庸"等概念成为中国文化核心价值。被联合国教科文组织列为"世界十大文化名人"之首。全球孔子学院遍布160多个国家。',
          templeNames: [
            { name: '曲阜孔庙', nameEn: 'Temple of Confucius', role: '至圣先师祭祀之地', location: '山东曲阜' },
            { name: '杏坛', nameEn: 'Xing Tan (Apricot Altar)', role: '孔子讲学之地', location: '山东曲阜孔庙内' },
            { name: '尼山', nameEn: 'Ni Mountain', role: '孔子诞生之地', location: '山东曲阜' },
          ],
          koans: [
            { title: '韦编三绝', description: '孔子晚年读《周易》，翻阅次数极多，穿竹简的皮绳断了三次。他说："假我数年，五十以学《易》，可以无大过矣。"体现了孔子活到老、学到老的精神。' },
            { title: '陈蔡之困', description: '孔子周游列国时，在陈国和蔡国之间被围困，断粮七日。弟子们面有饥色，孔子仍弦歌不辍。子路愤然问："君子亦有穷乎？"孔子答："君子固穷，小人穷斯滥矣。"困境中坚守气节。' },
            { title: '杏坛讲学', description: '孔子在杏坛设教，以"六艺"（礼、乐、射、御、书、数）教导学生。有教无类，不论贫富贵贱皆可入学。首开中国私人讲学之风，改变了"学在官府"的局面。' },
          ],
          classicQuotes: ['己所不欲，勿施于人', '学而不思则罔，思而不学则殆', '三人行，必有我师焉', '知之为知之，不知为不知，是知也', '朝闻道，夕死可矣', '德不孤，必有邻'],
          works: [
            { title: '论语', description: '孔子及弟子言行录，由弟子及再传弟子编纂。儒家经典之首，中华文化必读之书。' },
            { title: '春秋', description: '鲁国编年史，孔子据鲁史删修而成。"春秋笔法"寓褒贬于叙事之中。' },
          ],
          imageUrl: null,
        },
      })
    : await prisma.patriarch.create({
        data: {
          name: '孔子', nameEn: 'Confucius', religionId: confucianismId,
          dates: '前551-前479', title: '至圣先师', school: '先秦儒学', generation: 1,
          biography: '儒家创始人。', coreTeaching: '己所不欲，勿施于人。',
          achievements: '儒家创始人。', imageUrl: null,
        },
      });

  // Update existing 孟子 with full data + school field
  const existingMencius = await prisma.patriarch.findFirst({ where: { name: '孟子' } });
  existingMencius
    ? await prisma.patriarch.update({
        where: { id: existingMencius.id },
        data: {
          nameEn: 'Mencius',
          dates: '前372-前289',
          title: '亚圣·性善论者·仁政倡导者',
          school: '先秦儒学',
          generation: 4,
          biography: '孟子（前372-前289），名轲，字子舆，邹国（今山东邹城）人。战国时期伟大思想家、教育家，儒家学派亚圣。受业于子思门人。继承并发展孔子思想，提出"性善论"——人性本善，恻隐、羞恶、辞让、是非之心人皆有之。主张"仁政"——民为贵，社稷次之，君为轻。多次游说诸侯推行仁政未果。晚年退居讲学，与弟子万章等著《孟子》七篇。"浩然之气""舍生取义""天将降大任于斯人"等名言传颂千古。唐韩愈确立孟子在儒学道统中的地位，宋代以后《孟子》列入"四书"。',
          coreTeaching: '性善论——人性本善，恻隐之心仁之端也，羞恶之心义之端也，辞让之心礼之端也，是非之心智之端也。仁政——民为贵，社稷次之，君为轻。养浩然之气——至大至刚，配义与道。舍生取义——生，亦我所欲也；义，亦我所欲也。二者不可得兼，舍生而取义者也。',
          achievements: '性善论奠定了中国人性论的主流。仁政思想成为历代政治理想。"四端说"系统阐述了儒家道德哲学。《孟子》为"四书"之一，科举必读。"亚圣"地位仅次于孔子。民本思想影响深远。',
          templeNames: [
            { name: '邹城孟庙', nameEn: 'Temple of Mencius', role: '孟子祭祀之地', location: '山东邹城' },
            { name: '孟府', nameEn: 'Mencius Mansion', role: '孟子后裔世居', location: '山东邹城' },
          ],
          koans: [
            { title: '孟母三迁', description: '孟子幼年丧父，母亲为给他良好的教育环境，三次搬家——从墓地旁搬到市场旁，再搬到学校旁。孟子终在学习氛围中成长为大儒。"昔孟母，择邻处"成为中国教育典故。' },
            { title: '齐宣王问政', description: '齐宣王问如何治国。孟子答：以不忍人之心行不忍人之政。王见牛觳觫而不忍杀之，此即仁心。推此心于政事，则民安国泰。仁政始于一念之仁。' },
          ],
          classicQuotes: ['天将降大任于斯人也，必先苦其心志，劳其筋骨', '生于忧患，死于安乐', '民为贵，社稷次之，君为轻', '得道多助，失道寡助', '富贵不能淫，贫贱不能移，威武不能屈'],
          works: [
            { title: '孟子', description: '七篇十四卷，记录孟子言行及政治主张。"四书"之一，儒学核心经典。' },
          ],
          imageUrl: null,
        },
      })
    : await prisma.patriarch.create({
        data: {
          name: '孟子', nameEn: 'Mencius', religionId: confucianismId,
          dates: '前372-前289', title: '亚圣', school: '先秦儒学', generation: 4,
          biography: '儒家亚圣。', coreTeaching: '性善论。',
          achievements: '儒家亚圣。', imageUrl: null,
        },
      });

  // Update existing 朱熹 with full data + school field
  const existingZhuXi = await prisma.patriarch.findFirst({ where: { name: '朱熹' } });
  const zhuXi = existingZhuXi
    ? await prisma.patriarch.update({
        where: { id: existingZhuXi.id },
        data: {
          nameEn: 'Zhu Xi',
          dates: '1130-1200',
          title: '紫阳先生·朱子·理学集大成者',
          school: '宋明理学',
          generation: 3,
          biography: '朱熹（1130-1200），字元晦，号晦庵，别号紫阳，徽州婺源（今江西婺源）人，南宋著名理学家、思想家、教育家。少年丧父，受学于父执刘子翚、刘勉之、胡宪。后师事程颐再传弟子李侗，深研二程理学。历仕四朝，但多居乡讲学。集北宋理学之大成，建构了以"理"为核心的庞大哲学体系——理气论、心性论、格物致知论。编纂"四书集注"（大学、中庸、论语、孟子），使四书取代五经成为科举考试的核心教材，影响中国教育七百年。创办白鹿洞书院、岳麓书院等，制定《白鹿洞书院揭示》。与陆九渊"鹅湖之会"辩论理学与心学，为中国学术史名场面。',
          coreTeaching: '格物致知——通过研究事物的道理来获得知识，积累到一定程度便豁然贯通。理气论——理是万物的本原和规律，气是构成万物的材料。存天理、灭人欲——保存天赋的善性（理），克制过度的欲望。知行常相须——知识和实践相辅相成。问渠那得清如许？为有源头活水来——学问须不断更新。',
          achievements: '宋明理学集大成者，构建了中国最系统的哲学体系。编纂"四书集注"，影响中国教育科举七百年。创办书院、制定学规，树立了中国书院教育的典范。与陆九渊鹅湖之会，开理学心学之辩。被尊为继孔孟之后最重要的儒学思想家。理学传播至朝鲜、日本、越南，影响东亚文明。',
          templeNames: [
            { name: '武夷山朱熹园', nameEn: 'Zhu Xi Memorial Park', role: '朱熹讲学著述之地', location: '福建武夷山' },
            { name: '白鹿洞书院', nameEn: 'Bailudong Academy', role: '朱熹重建并制定学规', location: '江西庐山' },
            { name: '岳麓书院', nameEn: 'Yuelu Academy', role: '朱熹讲学处', location: '湖南长沙' },
          ],
          koans: [
            { title: '鹅湖之会', description: '南宋淳熙二年（1175年），朱熹与陆九渊在信州鹅湖寺辩论。朱熹主张"道问学"——格物穷理、循序渐进；陆九渊主张"尊德性"——发明本心、直截了当。辩论三天不决，各执己见。此次辩论成为中国学术史上最著名的理学与心学之辩。' },
            { title: '源头活水', description: '朱熹游南溪，见清泉奔涌，有感而赋诗："半亩方塘一鉴开，天光云影共徘徊。问渠那得清如许？为有源头活水来。"以池塘之清喻学问之新，必须不断学习才能保持思想的清明。' },
          ],
          classicQuotes: ['问渠那得清如许，为有源头活水来', '读书有三到：心到、眼到、口到', '存天理，灭人欲', '少年易老学难成，一寸光阴不可轻', '为学之实，固在践履'],
          works: [
            { title: '四书章句集注', description: '对《大学》《中庸》《论语》《孟子》的系统注释。科举必读，影响中国教育七百年。' },
            { title: '近思录', description: '与吕祖谦合编，选录北宋四子（周敦颐、程颢、程颐、张载）语录，为理学入门经典。' },
          ],
          imageUrl: null,
        },
      })
    : await prisma.patriarch.create({
        data: {
          name: '朱熹', nameEn: 'Zhu Xi', religionId: confucianismId,
          dates: '1130-1200', title: '紫阳先生', school: '宋明理学', generation: 3,
          biography: '理学集大成者。', coreTeaching: '格物致知。',
          achievements: '理学集大成者。', imageUrl: null,
        },
      });

  // ── 先秦儒学 — New entries ──

  await prisma.patriarch.create({
    data: {
      name: '颜回', nameEn: 'Yan Hui', religionId: confucianismId,
      dates: '前521-前481', title: '复圣·好学第一·箪瓢陋巷',
      school: '先秦儒学', generation: 2, teacherId: confucius.id,
      biography: '颜回（前521-前481），字子渊，鲁国人，孔子最钟爱的弟子。"一箪食，一瓢饮，在陋巷，人不堪其忧，回也不改其乐。"孔子赞其"好学"，"不迁怒，不贰过"。颜回深得孔子之道，被视为孔门中最接近仁的弟子。英年早逝，年仅四十一岁，孔子痛哭"天丧予"。后世尊为"复圣"，配享孔庙，列"四配"之首。',
      coreTeaching: '安贫乐道——箪食瓢饮不改其乐，精神富足胜过物质享受。不迁怒、不贰过——不把怒气转移给别人，同样的错误不犯第二次。克己复礼——最能体现孔子"克己复礼为仁"教导的弟子。',
      achievements: '孔门弟子中最好学者，被孔子赞为"好学"唯一之人。"复圣"地位，配享孔庙四配之首。安贫乐道成为中国知识分子的精神典范。',
      templeNames: [{ name: '曲阜颜庙', nameEn: 'Yan Temple', role: '祭祀复圣颜子', location: '山东曲阜' }],
      koans: [
        { title: '箪瓢陋巷', description: '颜回居陋巷，一竹筐饭，一瓢水，旁人都受不了这种清苦，颜回却照样快乐。孔子叹曰："贤哉回也！"这成为中国文人安贫乐道的精神原型。' },
      ],
      classicQuotes: ['一箪食，一瓢饮，在陋巷，人不堪其忧，回也不改其乐', '不迁怒，不贰过'],
      works: [], imageUrl: null,
    },
  });

  const zengzi = await prisma.patriarch.create({
    data: {
      name: '曾子', nameEn: 'Zengzi', religionId: confucianismId,
      dates: '前505-前435', title: '宗圣·孝道至尊·大学之祖',
      school: '先秦儒学', generation: 2, teacherId: confucius.id,
      biography: '曾子（前505-前435），名参，字子舆，鲁国南武城人。以孝著称，"曾子杀猪"教子诚信的故事流传至今。晚年传授孔子之道，据传著《大学》和《孝经》。提出"吾日三省吾身"的修身方法。其学传子思，子思传孟子，形成"思孟学派"，成为儒学正统传承。后世尊为"宗圣"。',
      coreTeaching: '吾日三省吾身——为人谋而不忠乎？与朋友交而不信乎？传不习乎？孝道为仁之本——孝弟也者，其为仁之本与。慎终追远——慎重对待丧葬，追念远祖。修身为本——自天子以至于庶人，壹是皆以修身为本。',
      achievements: '宗圣，孔庙四配之一。传承孔子之道，开"思孟学派"先河。据传著《大学》《孝经》，影响中国伦理两千年。"三省吾身"成为修身名言。',
      templeNames: [{ name: '嘉祥曾庙', nameEn: 'Zeng Temple', role: '祭祀宗圣曾子', location: '山东嘉祥' }],
      koans: [
        { title: '曾子杀猪', description: '曾子之妻出门，儿子哭闹要跟。妻哄说回来杀猪给他吃。回家后曾子真的杀猪。妻责怪说只是哄孩子。曾子说：孩子就是跟父母学的，说话不算话就是教他说谎。身教重于言教。' },
      ],
      classicQuotes: ['吾日三省吾身', '士不可以不弘毅，任重而道远', '慎终追远，民德归厚矣', '自天子以至于庶人，壹是皆以修身为本'],
      works: [
        { title: '大学', description: '"四书"之一，阐述修身齐家治国平天下的次第。八条目：格物致知诚意正心修身齐家治国平天下。' },
        { title: '孝经', description: '据传为曾子所作，系统阐述孝道理论，对中国伦理影响极大。' },
      ],
      imageUrl: null,
    },
  });

  const zisi = await prisma.patriarch.create({
    data: {
      name: '子思', nameEn: 'Zisi', religionId: confucianismId,
      dates: '前483-前402', title: '述圣·中庸之祖',
      school: '先秦儒学', generation: 3, teacherId: zengzi.id,
      biography: '子思（前483-前402），名伋，孔子之孙。受学于曾子，据传著《中庸》。提出"天命之谓性，率性之谓道，修道之谓教"的命题，将孔子的思想向心性论方向发展。开创"思孟学派"，其弟子传学于孟子。后世尊为"述圣"，列孔庙四配。子思在孔孟之间起到了承上启下的关键作用。',
      coreTeaching: '天命之谓性——人的本性来自天命。率性之谓道——顺应本性而行就是道。修道之谓教——修明道理就是教化。中庸之道——不偏不倚，喜怒哀乐之未发谓之中，发而皆中节谓之和。诚者，天之道也——真诚是天道的本质。',
      achievements: '述圣，孔庙四配之一。据传著《中庸》，"四书"之一。开创思孟学派，上承曾子，下启孟子。心性论开端，影响宋明理学。',
      templeNames: [],
      koans: [
        { title: '传道授业', description: '子思为孔子之孙，受学于曾子。在困厄中坚持传道，弟子传学于孟子。从孔子→曾子→子思→孟子的传承，成为儒学正统"道统"。' },
      ],
      classicQuotes: ['天命之谓性，率性之谓道，修道之谓教', '中也者，天下之大本也；和也者，天下之达道也', '诚者，天之道也；诚之者，人之道也'],
      works: [
        { title: '中庸', description: '"四书"之一，阐述中庸之道与诚的哲学。"致中和，天地位焉，万物育焉。"' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '荀子', nameEn: 'Xunzi', religionId: confucianismId,
      dates: '前313-前238', title: '后圣·性恶论者·礼义宗师',
      school: '先秦儒学', generation: 5,
      biography: '荀子（前313-前238），名况，字卿，赵国人。战国末期伟大思想家，先秦儒学集大成者。三次担任稷下学宫祭酒（学术领袖）。与孟子性善论相对，提出"性恶论"——人之性恶，其善者伪也（"伪"即人为努力）。强调"礼义"的社会功能和教化作用。其弟子韩非、李斯分别成为法家代表和秦朝丞相。荀子综合儒家礼义与法家治术，是先秦思想的集大成者。',
      coreTeaching: '性恶论——人性本恶，善是后天教化的结果。化性起伪——以礼义教化改变本性。隆礼重法——礼义为根本，法制为辅助。天行有常——天有其自然规律，"制天命而用之"。学不可以已——学习不能停止，青出于蓝而胜于蓝。',
      achievements: '性恶论开辟了中国人性论的另一条路径。"礼义"理论系统化，为儒家社会学奠基。《荀子》三十二篇，先秦思想集大成。弟子韩非、李斯影响秦帝国。"青出于蓝"名言千古传颂。',
      templeNames: [{ name: '兰陵荀子墓', nameEn: 'Tomb of Xunzi', role: '荀子葬地', location: '山东兰陵' }],
      koans: [
        { title: '三为祭酒', description: '荀子三次担任齐国稷下学宫的祭酒，是当时最高学术权威。稷下学宫集百家之学，荀子能三度被推为领袖，说明其学问之博、声望之高。' },
      ],
      classicQuotes: ['青，取之于蓝，而青于蓝', '不积跬步，无以至千里', '锲而舍之，朽木不折；锲而不舍，金石可镂', '天行有常，不为尧存，不为桀亡', '学不可以已'],
      works: [
        { title: '荀子', description: '三十二篇，涵盖哲学、政治、教育、逻辑等。《劝学》《天论》《性恶》等篇为名篇。' },
      ],
      imageUrl: null,
    },
  });

  // ── 汉唐经学 — All new ──

  await prisma.patriarch.create({
    data: {
      name: '董仲舒', nameEn: 'Dong Zhongshu', religionId: confucianismId,
      dates: '前179-前104', title: '儒学国教化奠基人·天人感应',
      school: '汉唐经学', generation: 1,
      biography: '董仲舒（前179-前104），广川（今河北衡水）人，西汉大儒。少治《春秋》公羊学，三年不窥园。汉武帝时上"天人三策"，提出"罢黜百家，独尊儒术"，被采纳，儒学从此成为中国官方意识形态两千年。建构"天人感应"宇宙论——天与人相互感应，君主失德则天降灾异。提出"三纲五常"伦理体系。虽争议极大，但其将儒学制度化、国教化的功绩不可否认。',
      coreTeaching: '天人感应——天人之间存在感应关系，君主失德天会降灾警告。三纲五常——君为臣纲、父为子纲、夫为妻纲；仁义礼智信。大一统——政治统一、思想统一。罢黜百家，独尊儒术——以儒学为官方正统思想。',
      achievements: '提出"罢黜百家，独尊儒术"，使儒学成为官方意识形态两千年。"天人感应"宇宙论影响中国政治文化。"三纲五常"构建了中国传统社会的伦理框架。建立太学制度，开创以儒术取士。',
      templeNames: [{ name: '衡水董子祠', nameEn: 'Dong Zhongshu Memorial', role: '纪念董仲舒', location: '河北衡水' }],
      koans: [
        { title: '三年不窥园', description: '董仲舒少年治学，专心致志，三年不曾往花园里看一眼。后世以"目不窥园"形容人专心学问。' },
      ],
      classicQuotes: ['天不变，道亦不变', '罢黜百家，独尊儒术', '屈民而伸君，屈君而伸天'],
      works: [
        { title: '春秋繁露', description: '阐述天人感应、阴阳五行与儒学结合的理论体系。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '郑玄', nameEn: 'Zheng Xuan', religionId: confucianismId,
      dates: '127-200', title: '经神·遍注群经',
      school: '汉唐经学', generation: 2,
      biography: '郑玄（127-200），字康成，北海高密（今山东高密）人，东汉末年大儒、经学集大成者。遍注群经，以古文经学为主兼采今文，打破今古文壁垒，被称为"经神"。其注释遍及《周易》《尚书》《毛诗》《周礼》《仪礼》《礼记》《论语》《孝经》等，几乎囊括全部儒家经典。郑玄之学被称为"郑学"，在魏晋南北朝数百年间为经学正统。',
      coreTeaching: '融合今古文经学——打破门户之见，兼采众长。以礼为本——三礼（周礼、仪礼、礼记）是儒学实践的核心。经学为治国安邦之本。',
      achievements: '遍注群经，为汉代经学集大成者。融合今古文经学，结束两汉经学之争。"郑学"为数百年间经学正统。被后世尊为"经神"。',
      templeNames: [{ name: '高密郑公祠', nameEn: 'Zheng Xuan Memorial', role: '郑玄故里', location: '山东高密' }],
      koans: [],
      classicQuotes: ['经者，常也，法也，径也'],
      works: [
        { title: '毛诗笺', description: '对《诗经》毛传的详细注释，为《诗经》学最重要的古注。' },
        { title: '三礼注', description: '对《周礼》《仪礼》《礼记》的系统注释。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '孔安国', nameEn: 'Kong Anguo', religionId: confucianismId,
      dates: '前156-前74', title: '古文尚书传者·孔子十一世孙',
      school: '汉唐经学', generation: 2,
      biography: '孔安国（前156-前74），字子国，鲁国曲阜人，孔子十一世孙。西汉经学家，古文经学的重要奠基人。从伏生受今文《尚书》，又得孔子旧宅壁中古文《尚书》，以今文读古文，开创古文《尚书》学。据传为《古文尚书》作传，对《论语》亦有训解。虽其传世之作的真伪历代有争议，但孔安国在古文经学史上的地位不可替代。',
      coreTeaching: '以古文经为宗——古文经更接近圣人原意。尊重文本——治经当以文字训诂为基础。传承家学——孔氏家学代代相传。',
      achievements: '古文经学重要奠基人。传《古文尚书》，开创古文《尚书》学。孔子十一世孙，传承家学。训解《论语》。',
      templeNames: [],
      koans: [],
      classicQuotes: [],
      works: [
        { title: '古文尚书传', description: '对古文《尚书》的注释，虽真伪有争议，但对经学史影响重大。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '许慎', nameEn: 'Xu Shen', religionId: confucianismId,
      dates: '约58-约147', title: '字圣·说文解字之父',
      school: '汉唐经学', generation: 3,
      biography: '许慎（约58-约147），字叔重，汝南召陵（今河南漯河）人，东汉经学家、文字学家。师从贾逵，博通五经。以古文经学为宗，认为文字是理解经典的基础。历时二十余年著成《说文解字》，收字9353个，首创部首检字法（540部首），系统分析汉字形、音、义。这是世界上最早的字典之一，也是中国文字学的开山之作。被后世尊为"字圣"。',
      coreTeaching: '文字为经学之本——不明文字则不能通经。六书造字法——象形、指事、会意、形声、转注、假借。部首归类——以部首系统整理文字，为字书编纂开创范式。',
      achievements: '著《说文解字》，中国第一部系统的字典。首创540部首检字法。"六书"理论系统化。被尊为"字圣"，中国文字学开山祖。',
      templeNames: [{ name: '许慎文化园', nameEn: 'Xu Shen Cultural Park', role: '许慎故里', location: '河南漯河' }],
      koans: [],
      classicQuotes: ['盖文字者，经艺之本，王政之始'],
      works: [
        { title: '说文解字', description: '中国第一部系统分析字形、考究字源的字书。收字9353个，540部首。文字学永恒经典。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '韩愈', nameEn: 'Han Yu', religionId: confucianismId,
      dates: '768-824', title: '文公·文起八代之衰·道统说',
      school: '汉唐经学', generation: 4,
      biography: '韩愈（768-824），字退之，河南河阳（今河南孟州）人，唐代文学家、思想家。古文运动领袖，"唐宋八大家"之首。三岁丧父，由兄嫂抚养。科举及第后仕途坎坷，屡遭贬谪。最著名的贬谪为谏迎佛骨被贬潮州——《谏佛骨表》直斥佛教有害国家，被贬八千里。在潮州兴学化民，政绩卓著。韩愈最重要的思想贡献是提出"道统说"——尧舜禹汤文武周公孔孟的传道谱系，确立了儒学正统。苏轼评其"文起八代之衰，而道济天下之溺"。',
      coreTeaching: '道统说——儒学有从尧舜到孟子的正统传承，中间断裂千年，由韩愈重新接续。原道——仁与义为定名，道与德为虚位。文以载道——文章应当承载道理。师道——古之学者必有师，师者传道授业解惑也。',
      achievements: '提出"道统说"，确立儒学正统传承观念。古文运动领袖，"唐宋八大家"之首。"文起八代之衰"，重振中国散文传统。《师说》《原道》《谏佛骨表》等千古名篇。谏迎佛骨表现了儒者的气节与担当。',
      templeNames: [{ name: '韩文公祠', nameEn: 'Han Yu Memorial', role: '韩愈在潮州的纪念祠', location: '广东潮州' }],
      koans: [
        { title: '谏迎佛骨', description: '唐宪宗迎佛骨舍利入宫，韩愈上《谏佛骨表》直言："佛本夷狄之人……不足事也。"触怒宪宗，被贬潮州。"一封朝奏九重天，夕贬潮州路八千。"虽九死不悔，体现儒者的道义担当。' },
      ],
      classicQuotes: ['师者，所以传道授业解惑也', '业精于勤，荒于嬉；行成于思，毁于随', '文起八代之衰，而道济天下之溺', '世有伯乐，然后有千里马'],
      works: [
        { title: '原道', description: '阐述儒家道统，批判佛老，为宋明理学先声。' },
        { title: '师说', description: '论述从师学习的重要性，千古名篇。' },
      ],
      imageUrl: null,
    },
  });

  // ── 宋明理学 — New entries (朱熹已update) ──

  const zhouDunyi = await prisma.patriarch.create({
    data: {
      name: '周敦颐', nameEn: 'Zhou Dunyi', religionId: confucianismId,
      dates: '1017-1073', title: '濂溪先生·理学开山祖',
      school: '宋明理学', generation: 1,
      biography: '周敦颐（1017-1073），字茂叔，号濂溪，道州营道（今湖南道县）人，北宋理学开山祖。为官清廉，政声卓著。著《太极图说》和《通书》，以"无极而太极"为起点构建了理学的宇宙论和人性论框架。其"太极→阴阳→五行→万物"的生成论为宋明理学提供了哲学基础。二程（程颢、程颐）少年时受学于他。爱莲"出淤泥而不染"的名句传颂千古。被后世尊为理学始祖。',
      coreTeaching: '无极而太极——宇宙的本原是无极，太极动静生阴阳，阴阳变合生五行，五行生万物。诚者，圣人之本——诚是通达天理的根本。主静立人极——以静为修养的核心。',
      achievements: '理学开山祖，为宋明理学提供宇宙论框架。《太极图说》和《通书》为理学奠基之作。教出二程，开启理学主流。"爱莲说"千古传诵。',
      templeNames: [{ name: '道县濂溪故里', nameEn: 'Lianxi Memorial', role: '周敦颐故里', location: '湖南道县' }],
      koans: [
        { title: '爱莲说', description: '周敦颐爱莲花，作《爱莲说》："予独爱莲之出淤泥而不染，濯清涟而不妖，中通外直，不蔓不枝，香远益清，亭亭净植，可远观而不可亵玩焉。"以莲花喻君子品格。' },
      ],
      classicQuotes: ['出淤泥而不染，濯清涟而不妖', '无极而太极', '诚者，圣人之本', '主静立人极'],
      works: [
        { title: '太极图说', description: '249字，阐述宇宙生成论，为理学哲学基础。' },
        { title: '通书', description: '阐述诚、几、德等概念，为理学伦理学基础。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '张载', nameEn: 'Zhang Zai', religionId: confucianismId,
      dates: '1020-1077', title: '横渠先生·关学宗师·气学大师',
      school: '宋明理学', generation: 1,
      biography: '张载（1020-1077），字子厚，凤翔郿县（今陕西眉县）横渠镇人，北宋理学家、关学创始人。少喜谈兵，范仲淹劝其读《中庸》，遂转向儒学。提出"气本论"——太虚即气，气聚为物，气散为虚。著名的"横渠四句"——"为天地立心，为生民立命，为往圣继绝学，为万世开太平"成为中国知识分子的最高理想。晚年在横渠讲学，创关学。',
      coreTeaching: '气本论——太虚无形，气之本体；气聚则离明得施而有形，气散则无形而太虚。民胞物与——人民皆我同胞，万物皆我同类。横渠四句——为天地立心，为生民立命，为往圣继绝学，为万世开太平。变化气质——修养的关键在于改变气质之性。',
      achievements: '提出"横渠四句"，成为中国知识分子精神宣言。气本论开辟理学唯物主义路径。"民胞物与"拓展了儒家仁爱观。创立关学，理学四大学派之一。',
      templeNames: [{ name: '横渠书院', nameEn: 'Hengqu Academy', role: '张载讲学之地', location: '陕西眉县' }],
      koans: [],
      classicQuotes: ['为天地立心，为生民立命，为往圣继绝学，为万世开太平', '民吾同胞，物吾与也', '太虚无形，气之本体'],
      works: [
        { title: '正蒙', description: '系统阐述气学哲学，"太和""参两""大心"等篇。' },
        { title: '西铭', description: '即《正蒙·乾称篇》首段，阐述"民胞物与"思想。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '程颢', nameEn: 'Cheng Hao', religionId: confucianismId,
      dates: '1032-1085', title: '明道先生·仁者浑然与物同体',
      school: '宋明理学', generation: 2, teacherId: zhouDunyi.id,
      biography: '程颢（1032-1085），字伯淳，号明道，河南洛阳人。与弟程颐并称"二程"，北宋理学奠基者。少受学于周敦颐。提出"天理"概念——"天者理也"，为理学奠定了核心范畴。主张"仁者浑然与物同体"——仁的境界是与万物一体。学风亲切平和，主张以"识仁"为修养入手处。弟子谢良佐、杨时等传其学。',
      coreTeaching: '天理——天者理也，万事万物皆有理。仁者浑然与物同体——仁是与天地万物为一体的境界。识仁——修养的入手处是体认仁。生之谓性——天理即性，性即天理。',
      achievements: '与弟程颐共同奠定理学基础，"天理"成为理学核心概念。"仁者浑然与物同体"开启了理学的仁学传统。洛学影响深远，为朱熹理学的重要源头。',
      templeNames: [{ name: '嵩阳书院', nameEn: 'Songyang Academy', role: '二程讲学之地', location: '河南登封' }],
      koans: [
        { title: '识仁之方', description: '程颢教导学生：修养的入手处在于"识仁"。医家以不认痛痒谓之不仁，仁者以天地万物为一体，无不是己。能如此识仁，则以诚敬存之便是修行。' },
      ],
      classicQuotes: ['天者理也', '仁者浑然与物同体', '万物之生意最可观'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '程颐', nameEn: 'Cheng Yi', religionId: confucianismId,
      dates: '1033-1107', title: '伊川先生·格物穷理',
      school: '宋明理学', generation: 2, teacherId: zhouDunyi.id,
      biography: '程颐（1033-1107），字正叔，号伊川，河南洛阳人。与兄程颢并称"二程"。学风严谨深沉，与兄之亲切平和形成对比。主张"格物穷理"——研究事物以穷尽其理。提出"性即理"——人的本性就是天理。其学经杨时→罗从彦→李侗传至朱熹，朱熹发扬光大成为理学正宗。"程门立雪"典故展示了师道的庄严。',
      coreTeaching: '性即理——人的本性就是天理，恶来自于气质的遮蔽。格物穷理——通过研究具体事物来认识天理。涵养须用敬——修养需要以敬为持守方法。主敬——心中常存敬畏，不放逸。',
      achievements: '与兄程颢共同奠定理学基础。"性即理""格物穷理"成为朱熹理学的核心命题。其学脉传至朱熹，成为理学正统。"程门立雪"成为尊师典故。',
      templeNames: [{ name: '伊川书院', nameEn: 'Yichuan Academy', role: '程颐讲学之地', location: '河南洛阳伊川' }],
      koans: [
        { title: '程门立雪', description: '杨时和游酢去拜见程颐，程颐正在打瞌睡，二人不敢惊扰，恭敬地站在门外等候。等程颐醒来开门，门外积雪已有一尺深。后人以"程门立雪"比喻尊师重道。' },
      ],
      classicQuotes: ['性即理也', '涵养须用敬，进学则在致知', '饿死事小，失节事大'],
      works: [
        { title: '伊川易传', description: '以理学思想解释《周易》，为义理派易学的代表。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '陆九渊', nameEn: 'Lu Jiuyuan', religionId: confucianismId,
      dates: '1139-1193', title: '象山先生·心学开宗',
      school: '宋明理学', generation: 3,
      biography: '陆九渊（1139-1193），字子静，号象山，抚州金溪（今江西金溪）人，南宋哲学家。提出"心即理"——心就是理，不必外求。与朱熹"鹅湖之会"辩论，主张"尊德性"——直接发明本心，不需要格物穷理的繁琐功夫。"宇宙便是吾心，吾心即是宇宙"——心与宇宙合一。其学经明代王阳明发扬光大，形成"陆王心学"。被视为心学的开宗祖师。',
      coreTeaching: '心即理——宇宙便是吾心，吾心即是宇宙。心之本体自足圆满。尊德性——修养的根本在于发明本心，不在穷理读书。先立乎其大者——先确立心之大体（道德本心），小节自然归正。简易功夫——修行应当简易直截，不必繁琐。',
      achievements: '心学开宗祖师，提出"心即理"核心命题。与朱熹鹅湖之会，开理学心学千年之辩。"宇宙便是吾心"开拓了中国哲学主体性传统。经王阳明发扬，形成"陆王心学"。',
      templeNames: [{ name: '象山书院', nameEn: 'Xiangshan Academy', role: '陆九渊讲学之地', location: '江西贵溪' }],
      koans: [
        { title: '鹅湖之辩', description: '陆九渊在鹅湖之会上诗曰："易简功夫终久大，支离事业竟浮沉。"批评朱熹格物穷理太过支离。主张直指本心，简易直截。此辩奠定了心学的独立地位。' },
      ],
      classicQuotes: ['宇宙便是吾心，吾心即是宇宙', '心即理也', '先立乎其大者，则其小者不能夺也', '学苟知本，六经皆我注脚'],
      works: [
        { title: '象山全集', description: '收录书信、语录、诗文等，为心学的基本文献。' },
      ],
      imageUrl: null,
    },
  });

  // ── 阳明心学 — All new ──

  const wangYangming = await prisma.patriarch.create({
    data: {
      name: '王阳明', nameEn: 'Wang Yangming', religionId: confucianismId,
      dates: '1472-1529', title: '阳明先生·心即理·知行合一·致良知',
      school: '阳明心学', generation: 1,
      biography: '王阳明（1472-1529），名守仁，字伯安，号阳明，浙江余姚人。明代伟大哲学家、军事家、教育家，心学集大成者。少年立志做圣人。曾尝试"格竹子"按朱熹格物法穷理，格了七天七夜病倒，因此开始怀疑朱熹学说。正德元年（1506年）因上疏得罪宦官刘瑾，被贬贵州龙场。在龙场极其困苦的环境中"龙场悟道"——心即理也，圣人之道吾性自足。此后提出"知行合一""致良知"两大核心命题。军事上平定宸濠之乱、南赣匪患，文治武功皆卓绝。阳明心学影响深远，传至日本成为明治维新的思想动力。',
      coreTeaching: '心即理——心外无物，心外无事，心外无理。知行合一——知是行的开始，行是知的完成，知行本是一体。致良知——良知是是非之心，人人具足；致良知就是在事事物物上体认和实现良知。四句教——无善无恶心之体，有善有恶意之动，知善知恶是良知，为善去恶是格物。',
      achievements: '心学集大成者，与孔孟朱并列的儒学四大家。"知行合一"改变了中国哲学的知行观。"致良知"提供了简易直截的修行方法。军事奇才，平定宸濠之乱。阳明心学传至日本，影响明治维新。被称为"立德立功立言三不朽"的完人。',
      templeNames: [
        { name: '阳明洞', nameEn: 'Yangming Cave', role: '龙场悟道之地', location: '贵州修文' },
        { name: '余姚阳明故居', nameEn: 'Yangming Former Residence', role: '王阳明出生地', location: '浙江余姚' },
      ],
      koans: [
        { title: '龙场悟道', description: '王阳明被贬贵州龙场，万山丛棘中，瘴疠侵身，随从皆病。阳明日夜端坐石棺中静思，忽一夜大悟："圣人之道，吾性自足，向之求理于事物者误也。"此即著名的"龙场悟道"，心学由此诞生。' },
        { title: '岩中花树', description: '友人指岩中花树问：此花在深山中自开自落，于我心亦何相关？阳明答：你未看此花时，此花与汝心同归于寂。你来看此花时，则此花颜色一时明白起来。便知此花不在你心外。此即"心外无物"的经典论证。' },
      ],
      classicQuotes: ['知是行的主意，行是知的功夫', '心外无物，心外无事，心外无理', '无善无恶心之体，有善有恶意之动，知善知恶是良知，为善去恶是格物', '此心光明，亦复何言'],
      works: [
        { title: '传习录', description: '王阳明与弟子的问答录，心学核心经典。上卷为亲笔书信，中下卷为弟子记录。' },
        { title: '大学问', description: '阐述致良知和万物一体之仁，为心学纲领性著作。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '王畿', nameEn: 'Wang Ji', religionId: confucianismId,
      dates: '1498-1583', title: '龙溪先生·四无说·现成良知',
      school: '阳明心学', generation: 2, teacherId: wangYangming.id,
      biography: '王畿（1498-1583），字汝中，号龙溪，浙江绍兴人。王阳明晚年最重要的弟子之一。在"天泉证道"中提出"四无说"——心是无善无恶的心，意是无善无恶的意，知是无善无恶的知，物是无善无恶的物。主张"现成良知"——良知当下即是，无须功夫修为。其学走向超越善恶的形上境界，被称为阳明学左派。',
      coreTeaching: '四无说——无善无恶是心之体，无善无恶是意之动，无善无恶是知之知，无善无恶是物之格。现成良知——良知本来现成，不假修为。一悟本体，即是功夫。',
      achievements: '阳明学重要传人，天泉证道的主角之一。"四无说"将心学推向更高的哲学境界。推动阳明学在明末的广泛传播。',
      templeNames: [],
      koans: [
        { title: '天泉证道', description: '阳明晚年在天泉桥上，弟子王畿主张"四无"，钱德洪主张"四有"。阳明调和说：你们两个的见解正好互补，不可偏废。四无是上根人的功夫，四有是中根以下的功夫。' },
      ],
      classicQuotes: ['良知本来现成，不假修为', '一悟本体，即是功夫'],
      works: [
        { title: '龙溪王先生全集', description: '收录语录、书信、文章等，为阳明左派的核心文献。' },
      ],
      imageUrl: null,
    },
  });

  const liuZongzhou = await prisma.patriarch.create({
    data: {
      name: '刘宗周', nameEn: 'Liu Zongzhou', religionId: confucianismId,
      dates: '1578-1645', title: '蕺山先生·明末大儒·慎独',
      school: '阳明心学', generation: 3,
      biography: '刘宗周（1578-1645），字起东，号念台，世称蕺山先生，浙江绍兴人。明末最重要的儒学家。针对阳明后学流于空疏的弊病，主张以"慎独"为修行核心——在独处时也要谨慎自律。清兵入杭州后，绝食二十三日而死，以身殉国。弟子黄宗羲继承其学。刘宗周被视为明代儒学的最后一位大师，其死标志着一个时代的终结。',
      coreTeaching: '慎独——修养的核心在于独处时的谨慎自律。意为心之所存——意不是心之所发，而是心之所存（纠正阳明学的偏失）。诚意——《大学》的核心在诚意，诚意就是慎独。',
      achievements: '明末最重要的儒学家，纠正阳明后学之弊。"慎独"学说影响深远。以身殉国，体现儒者气节。弟子黄宗羲传其学。',
      templeNames: [{ name: '蕺山书院', nameEn: 'Jishan Academy', role: '刘宗周讲学之地', location: '浙江绍兴' }],
      koans: [
        { title: '绝食殉国', description: '1645年清兵占领杭州，刘宗周绝食抗议。弟子劝他保重身体以待时机。刘宗周答："吾固知天下事不可为矣，但此心耿耿不能已也。"绝食二十三日卒。以死明志，尽了儒者的最后之责。' },
      ],
      classicQuotes: ['慎独者，慎其独知之地也', '独知即良知'],
      works: [
        { title: '人谱', description: '论述修身工夫的次第，以改过为入手。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '黄宗羲', nameEn: 'Huang Zongxi', religionId: confucianismId,
      dates: '1610-1695', title: '梨洲先生·中国之卢梭',
      school: '阳明心学', generation: 4, teacherId: liuZongzhou.id,
      biography: '黄宗羲（1610-1695），字太冲，号梨洲，浙江余姚人。明末清初伟大思想家、史学家。父黄尊素因东林党案被害，宗羲持锥刺杀阉党余孽。师从刘宗周。明亡后拒绝出仕清朝。著《明夷待访录》，系统批判君主专制——"为天下之大害者，君而已矣"，提出限制君权、法治等主张，被称为"中国之卢梭"。著《明儒学案》，为中国第一部学术思想史。',
      coreTeaching: '天下为公——天下非一人之天下，乃天下人之天下。限制君权——批判"家天下"，主张法治。学校议政——学校不仅是教育场所，更是议政论治之处。',
      achievements: '著《明夷待访录》，开中国民主思想先河。《明儒学案》为中国第一部学术思想史。与顾炎武、王夫之并称"明末三大家"。抗清志节为后世楷模。',
      templeNames: [{ name: '余姚黄宗羲墓', nameEn: 'Huang Zongxi Tomb', role: '黄宗羲葬地', location: '浙江余姚' }],
      koans: [],
      classicQuotes: ['为天下之大害者，君而已矣', '天下之治乱，不在一姓之兴亡，而在万民之忧乐', '学校所以养士也'],
      works: [
        { title: '明夷待访录', description: '系统批判君主专制，提出民主思想。被称为"中国的《社会契约论》"。' },
        { title: '明儒学案', description: '中国第一部学术思想通史，记录明代各儒学流派。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '王夫之', nameEn: 'Wang Fuzhi', religionId: confucianismId,
      dates: '1619-1692', title: '船山先生·气学大成',
      school: '阳明心学', generation: 4,
      biography: '王夫之（1619-1692），字而农，号姜斋，世称船山先生，湖南衡阳人。明末清初伟大思想家。明亡后参加抗清运动失败，隐居衡阳船山，著书立说四十余年。继承张载气学，发展出系统的唯物主义哲学——"气者理之依也"（理依附于气）。强调"知行相资以为用"——知行相互依赖。著述超过百部，涵盖哲学、经学、史学、文学。身后两百年才被发现，对近代革命思想影响巨大。',
      coreTeaching: '气者理之依也——理不能离开气而独存，理是气的规律。知行相资以为用——知识和实践相互依赖，互为补充。日新之谓盛德——天地万物日日更新。天下惟器——具体事物是根本。',
      achievements: '发展了系统的唯物主义哲学。著述超过百部，为中国学术史上最多产的学者之一。与黄宗羲、顾炎武并称"明末三大家"。对近代革命思想（谭嗣同、毛泽东等）影响巨大。',
      templeNames: [{ name: '船山书院', nameEn: 'Chuanshan Academy', role: '纪念王夫之', location: '湖南衡阳' }],
      koans: [],
      classicQuotes: ['气者理之依也', '天下惟器而已矣', '六经责我开生面，七尺从天乞活埋'],
      works: [
        { title: '读通鉴论', description: '以史论政，评议历代治乱兴衰。史学哲学名著。' },
        { title: '张子正蒙注', description: '注释张载《正蒙》，发展气学唯物论。' },
      ],
      imageUrl: null,
    },
  });

  // ── 近现代新儒学 — All new ──

  const xiongShili = await prisma.patriarch.create({
    data: {
      name: '熊十力', nameEn: 'Xiong Shili', religionId: confucianismId,
      dates: '1885-1968', title: '新唯识论·体用不二·现代新儒学宗师',
      school: '近现代新儒学', generation: 1,
      biography: '熊十力（1885-1968），原名继智，号子真，湖北黄冈人。现代新儒学最重要的哲学家。早年参加辛亥革命，后转向学术。在北京大学任教期间，从佛学唯识宗出发，批判改造之，著《新唯识论》，提出"体用不二"——本体与现象不可分离。强调儒学的心性之学是中华文化的根本。其弟子牟宗三、唐君毅、徐复观为现代新儒学第二代核心人物。被视为20世纪最重要的中国哲学家之一。',
      coreTeaching: '体用不二——本体（体）与现象（用）不是两个东西，是同一实在的两个方面。翕辟成变——万物由翕（收敛、物质化）和辟（开放、精神化）两种力量交互作用而成。心性之学为中国文化根本——返回六经，回归孔孟。',
      achievements: '著《新唯识论》，为20世纪中国哲学最重要的体系性著作之一。培养了牟宗三、唐君毅、徐复观等新儒学核心人物。开创了现代新儒学的哲学方向。被视为20世纪最重要的中国哲学家之一。',
      templeNames: [],
      koans: [],
      classicQuotes: ['体用不二', '万物莫不有翕辟', '返本开新'],
      works: [
        { title: '新唯识论', description: '从批判佛教唯识学出发，建构新的本体论。现代新儒学的奠基之作。' },
        { title: '原儒', description: '阐述儒学本义，主张回归孔孟六经。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '梁漱溟', nameEn: 'Liang Shuming', religionId: confucianismId,
      dates: '1893-1988', title: '最后的大儒·乡村建设运动先驱',
      school: '近现代新儒学', generation: 1,
      biography: '梁漱溟（1893-1988），原名焕鼎，字寿铭，广西桂林人。现代新儒学代表人物，被称为"最后的大儒"。1917年以中学学历被蔡元培聘为北京大学哲学讲师。著《东西文化及其哲学》，提出中西印三大文化路向说。1930年代投身乡村建设运动，在山东邹平进行社会实验。一生特立独行，在各种政治压力下坚持独立判断。95岁辞世，临终之言："这个世界会好吗？"',
      coreTeaching: '三大文化路向——西方文化向前看（征服自然），中国文化调和持中，印度文化向后看（出世）。中国文化以伦理为本——理性早熟，重人伦不重知识。乡村建设——中国的出路在于乡村教育和合作组织。',
      achievements: '"最后的大儒"，20世纪最具独立人格的中国知识分子。著《东西文化及其哲学》，开创比较文化哲学。乡村建设运动先驱。95年人生坚守儒者本色。',
      templeNames: [],
      koans: [
        { title: '这个世界会好吗', description: '梁漱溟临终前，学生问他有什么话要说。他沉思良久，问道："这个世界会好吗？"学生答："我相信世界会好的。"梁漱溟点点头说："能好就好。"这成为20世纪中国最深沉的哲学追问。' },
      ],
      classicQuotes: ['这个世界会好吗？', '吾曹不出如苍生何', '人心向善即是文化的根本方向'],
      works: [
        { title: '东西文化及其哲学', description: '比较中西印三大文化的方向和特征。比较文化哲学的开山之作。' },
        { title: '中国文化要义', description: '阐述中国文化以伦理为本的特征。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '牟宗三', nameEn: 'Mou Zongsan', religionId: confucianismId,
      dates: '1909-1995', title: '当代新儒学旗手·智的直觉·道德的形上学',
      school: '近现代新儒学', generation: 2, teacherId: xiongShili.id,
      biography: '牟宗三（1909-1995），字离中，山东栖霞人。现代新儒学最具哲学深度的思想家。师从熊十力。1949年赴台湾，后转至香港新亚书院、台湾大学任教。贯通中西哲学，以康德哲学为对话对象，提出"智的直觉"——中国哲学承认人可以直接体认本体（不同于康德否认此可能），"良知坎陷"——良知的自我否定以开出知识与政治的客观化。被公认为20世纪中国哲学体系最完整的建构者。',
      coreTeaching: '智的直觉——人通过道德实践可以直接体认本体，这是中国哲学的独特贡献。良知坎陷——良知通过自我否定（坎陷）开出知识和民主政治的客观领域。三统说——道统（儒学正统）、学统（知识传统）、政统（政治传统）三者并重。',
      achievements: '20世纪中国哲学体系最完整的建构者。"智的直觉""良知坎陷"为中国哲学的现代化开辟了独特路径。翻译康德三大批判为中文。1958年发起《中国文化与世界宣言》。',
      templeNames: [],
      koans: [],
      classicQuotes: ['智的直觉是中国哲学的独特贡献', '良知自我坎陷以开出知性'],
      works: [
        { title: '心体与性体', description: '三卷本，系统阐述宋明理学，为牟宗三最重要的著作。' },
        { title: '现象与物自身', description: '以康德哲学为对话对象，阐述中国哲学的本体论。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '唐君毅', nameEn: 'Tang Junyi', religionId: confucianismId,
      dates: '1909-1978', title: '道德自我·花果飘零·灵根自植',
      school: '近现代新儒学', generation: 2, teacherId: xiongShili.id,
      biography: '唐君毅（1909-1978），四川宜宾人。现代新儒学重要代表。师从熊十力。1949年赴香港，与钱穆共创新亚书院（后并入香港中文大学）。哲学以"道德自我"为核心——人的道德主体性是哲学的出发点。1958年与牟宗三、张君劢、徐复观联名发表《为中国文化敬告世界人士宣言》，为新儒学的纲领性文件。晚年以"生命存在与心灵境界"建构了宏大的哲学体系。以"花果飘零，灵根自植"描述海外中国文化的处境。',
      coreTeaching: '道德自我——人的道德主体性是一切价值的根源。心灵九境——从万物散殊到天德流行，人的精神可以达到九个境界。花果飘零，灵根自植——中国文化在海外虽然飘零，但只要灵根不断，便能重新生长。',
      achievements: '与牟宗三、张君劢、徐复观联名发表新儒学宣言。与钱穆共创新亚书院。以"道德自我"为核心建构哲学体系。"花果飘零，灵根自植"成为海外华人文化认同的象征。',
      templeNames: [],
      koans: [],
      classicQuotes: ['花果飘零，灵根自植', '文化意识宇宙中的巨人'],
      works: [
        { title: '生命存在与心灵境界', description: '晚年大作，建构心灵九境说的宏大哲学体系。' },
        { title: '中国文化之精神价值', description: '阐述中国文化的核心精神与现代意义。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '钱穆', nameEn: 'Qian Mu', religionId: confucianismId,
      dates: '1895-1990', title: '宾四先生·国史大师·新亚精神',
      school: '近现代新儒学', generation: 1,
      biography: '钱穆（1895-1990），字宾四，江苏无锡人。20世纪最杰出的中国历史学家，现代新儒学重要代表。自学成才，未上过大学。以《先秦诸子系年》引起学术界注目，被破格聘为北京大学教授。著《国史大纲》，以温情与敬意对待中国历史。1949年赴港，与唐君毅创办新亚书院。1967年迁台北。一生著述八十余部。95岁辞世，为中国学术史上罕见的通才型学者。',
      coreTeaching: '对本国历史应有温情与敬意——不可虚无主义对待传统。中国文化自有其独特价值——不必以西方标准衡量。学问在于通——通古今之变，通各学科之界。读书贵在会通，不可拘泥一隅。',
      achievements: '著《国史大纲》，20世纪最重要的中国通史之一。创办新亚书院，在艰难中传承中华文化。著述八十余部，涵盖经史子集。以"温情与敬意"重建国人对本国历史的信心。',
      templeNames: [{ name: '新亚书院', nameEn: 'New Asia College', role: '钱穆与唐君毅创办', location: '中国香港' }],
      koans: [
        { title: '新亚精神', description: '1949年钱穆在香港九龙桂林街租一层楼办学，条件极为简陋。取名"新亚"，寓意在新的亚洲传承中华文化。校歌有词："手空空，无一物，路遥遥，无止境。"在困厄中坚守文化传承。' },
      ],
      classicQuotes: ['对本国已往历史须有一种温情与敬意', '读书须先识其大体', '学问在于通'],
      works: [
        { title: '国史大纲', description: '一部中国通史，以温情与敬意对待中国历史。20世纪最重要的通史著作之一。' },
        { title: '先秦诸子系年', description: '考证先秦诸子的生卒年代和学术源流。' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '徐复观', nameEn: 'Xu Fuguan', religionId: confucianismId,
      dates: '1903-1982', title: '中国艺术精神·思想史大师',
      school: '近现代新儒学', generation: 2, teacherId: xiongShili.id,
      biography: '徐复观（1903-1982），原名秉常，湖北浠水人。现代新儒学重要代表。早年从政从军，曾任蒋介石侍从室高参。四十岁后弃政从学，拜熊十力为师，转向思想史研究。著《中国艺术精神》，将庄子哲学解释为中国艺术精神的根源。著《中国人性论史》，系统梳理中国人性论的发展。1958年联名发表新儒学宣言。晚年任教于台湾东海大学和香港新亚研究所。',
      coreTeaching: '中国艺术精神——庄子的"心斋""坐忘"即是艺术精神的最高境界。中国文化以人性论为核心——从孔孟到宋明理学的核心都是人性问题。知识分子的社会责任——学术不能脱离现实关怀。',
      achievements: '著《中国艺术精神》，开辟中国美学研究新方向。著《中国人性论史》，系统梳理中国人性论发展。1958年新儒学宣言联署人。从政治人物转型为学术大师的典范。',
      templeNames: [],
      koans: [],
      classicQuotes: ['庄子所呈现的乃是艺术精神的主体', '中国文化的核心是人性论'],
      works: [
        { title: '中国艺术精神', description: '以庄子哲学阐释中国艺术精神，为中国美学经典。' },
        { title: '中国人性论史·先秦篇', description: '系统梳理先秦人性论发展，思想史名著。' },
      ],
      imageUrl: null,
    },
  });

  const confucianCount = 25; // 25 new + 3 updated
  console.log(`  ✓ ${confucianCount} new Confucian patriarchs created + 3 updated (5 schools: Pre-Qin/Han-Tang/Song-Ming/Yangming/Modern)`);

  // ── 4p. 印度教圣贤 (Hindu Patriarchs/Sages) ──
  console.log('  Creating Hindu patriarchs (4p)...');

  const hinduismId = religionMap['hinduism'];

  // Update existing 商羯罗 with full data + school field
  const existingShankara = await prisma.patriarch.findFirst({ where: { name: '商羯罗' } });
  existingShankara
    ? await prisma.patriarch.update({
        where: { id: existingShankara.id },
        data: {
          nameEn: 'Adi Shankara',
          dates: '788-820',
          title: '阿阇梨·世界导师',
          school: '吠檀多哲学',
          generation: 2,
          biography: '商羯罗（788-820），印度历史上最伟大的哲学家之一，八岁出家，十六岁著《梵经注》。创立不二论（Advaita Vedanta）：梵是唯一真实，个体灵魂与梵本质无二，世界是幻相（Maya）。行遍印度四方辩论，在东南西北建立四大修道院（Matha），三十二岁圆寂，被尊为"世界导师"（Jagadguru）。',
          coreTeaching: '不二论——梵是唯一终极实在，个体灵魂与宇宙本体本质无二。世界万象是梵通过幻力展现的表象。认识到"我即是梵"便获得解脱。',
          achievements: '创立不二论，成为印度哲学主流。建立四大修道院。三十二年短暂一生改变印度思想史。',
          templeNames: [
            { name: '什林格里修道院', nameEn: 'Sringeri Sharada Peetham', role: '南方修道院·商羯罗创建', location: '卡纳塔克邦' },
          ],
          koans: [],
          classicQuotes: ['梵即实在，世界即幻象，生命体不外乎梵', '你不是身体，不是心灵，你是永恒的意识', '真理是一，智者以不同名称称呼它'],
          works: [
            { title: '梵经注', description: '不二论注释，商羯罗最重要的哲学著作' },
            { title: '自我知识', description: '阐释阿特曼本质的短论' },
          ],
          imageUrl: null,
        },
      })
    : null;

  // Update existing 罗摩努阇 with full data + school field
  const existingRamanuja = await prisma.patriarch.findFirst({ where: { name: '罗摩努阇' } });
  existingRamanuja
    ? await prisma.patriarch.update({
        where: { id: existingRamanuja.id },
        data: {
          nameEn: 'Ramanuja',
          dates: '1017-1137',
          title: '阿阇梨',
          school: '吠檀多哲学',
          generation: 2,
          biography: '罗摩努阇（1017-1137），南印度泰米尔婆罗门，创立限定不二论（Vishishtadvaita）：梵是有属性的实在，个体灵魂和物质世界是梵的属性。他将吠檀多哲学与民间虔信运动连接，使高深哲学变得可以实践。长期住持什里兰格姆寺，120岁高寿辞世。',
          coreTeaching: '限定不二论——梵是有属性的最高实在，灵魂和物质是梵的属性。通过虔信和归依获得神的恩典而得解脱。',
          templeNames: [
            { name: '什里兰格姆寺', nameEn: 'Sri Ranganathaswamy Temple', role: '住持圣地·限定不二论中心', location: '泰米尔纳德邦' },
          ],
          koans: [],
          classicQuotes: ['真正的知识是认识到自己是神的仆人', '归依神是最高的修行', '灵魂是梵的部分，如同火花与火焰'],
          works: [],
          imageUrl: null,
        },
      })
    : null;

  // ── 吠檀多哲学 ──

  await prisma.patriarch.create({
    data: {
      name: '跋达罗衍那', nameEn: 'Badarayana', religionId: hinduismId,
      dates: '前5世纪', title: '梵经作者·吠檀多之祖',
      school: '吠檀多哲学', generation: 1,
      biography: '跋达罗衍那（约前5世纪），又称毗耶娑（Vyasa），印度哲学史上最重要的人物之一。他著《梵经》（Brahma Sutra）四章555条经文，系统阐述了奥义书中关于梵（Brahman）的教义，成为吠檀多哲学的根本经典。《梵经》与《奥义书》《薄伽梵歌》并称"三圣典"，是所有吠檀多学派共同的权威文本。后世商羯罗、罗摩努阇、摩陀婆等人的哲学体系，皆以注释《梵经》为出发点。',
      coreTeaching: '梵是一切存在的终极实在，个体灵魂与宇宙本体的关系是吠檀多哲学的核心问题。通过知识、冥想和虔信认识梵我关系，可获得解脱。',
      templeNames: [
        { name: '巴达里纳特神庙', nameEn: 'Badrinath Temple', role: '毗耶娑洞·著述圣地', location: '北阿坎德邦' },
      ],
      koans: [],
      classicQuotes: ['梵是真实，世界是幻相，灵魂即是梵', '从梵生出一切，依梵存在一切，归于梵消融一切'],
      works: [
        { title: '梵经', description: '555条格言，吠檀多哲学根本经典，三圣典之一' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '摩陀婆', nameEn: 'Madhva', religionId: hinduismId,
      dates: '1238-1317', title: '二元论创始人',
      school: '吠檀多哲学', generation: 3,
      biography: '摩陀婆（1238-1317），创立二元论（Dvaita）：梵与个体灵魂永远不同，五种永恒差异。在乌杜皮建立八座修道院和克里希纳神庙。',
      coreTeaching: '二元论——神与灵魂永远不同。世界真实，解脱是灵魂永享神的同在。',
      templeNames: [],
      koans: [],
      classicQuotes: ['神与灵魂的差异是永恒的', '世界不是幻象，它是神真实的创造'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '瓦拉巴', nameEn: 'Vallabha', religionId: hinduismId,
      dates: '1479-1531', title: '纯粹不二论创始人',
      school: '吠檀多哲学', generation: 3,
      biography: '瓦拉巴（1479-1531），创立纯粹不二论（Shuddhadvaita），世界不是幻相而是梵真实的自我展现。强调"推送之道"——完全依赖神的恩典获得解脱。',
      coreTeaching: '纯粹不二论——梵是纯粹的实在，世界和灵魂都是梵的真实展现。解脱完全依赖神的恩典。',
      templeNames: [],
      koans: [],
      classicQuotes: ['一切都是克里希纳', '最高的修行是全然归依神的恩典'],
      works: [],
      imageUrl: null,
    },
  });

  // ── 瑜伽修行 ──

  await prisma.patriarch.create({
    data: {
      name: '帕坦伽利', nameEn: 'Patanjali', religionId: hinduismId,
      dates: '前2世纪', title: '瑜伽之父',
      school: '瑜伽修行', generation: 1,
      biography: '帕坦伽利（约前2世纪），瑜伽哲学的集大成者。著《瑜伽经》四章196条格言，将瑜伽归纳为"八支"。被尊为"瑜伽之父"。',
      coreTeaching: '瑜伽是心灵波动的止息。通过八支瑜伽逐步超越心灵扰动，证悟纯粹觉知的本来面目。',
      templeNames: [],
      koans: [],
      classicQuotes: ['瑜伽是心灵波动的止息', '修行与不执著是止息的两种方法', '当见者安住于自性，那就是瑜伽'],
      works: [
        { title: '瑜伽经', description: '四章196条格言，瑜伽哲学根本经典' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '乔拉克纳特', nameEn: 'Gorakhnath', religionId: hinduismId,
      dates: '11世纪', title: '哈他瑜伽创始人·纳特派祖师',
      school: '瑜伽修行', generation: 2,
      biography: '乔拉克纳特（约11世纪），哈他瑜伽创始人和纳特派祖师。将瑜伽扩展为包含体位法、呼吸控制和能量修炼的完整体系。',
      coreTeaching: '哈他瑜伽通过体位、呼吸控制和能量修炼净化身体，唤醒昆达里尼能量，达到解脱。身体是灵性修行的神殿。',
      templeNames: [],
      koans: [],
      classicQuotes: ['身体是修行的最佳工具', '控制呼吸即控制心灵'],
      works: [],
      imageUrl: null,
    },
  });

  // 罗摩克里希那 must be created before 维韦卡南达 (teacher reference)
  const ramakrishna = await prisma.patriarch.create({
    data: {
      name: '罗摩克里希那', nameEn: 'Ramakrishna', religionId: hinduismId,
      dates: '1836-1886', title: '大神秘主义者·万教归一实证者',
      school: '近现代复兴', generation: 1,
      biography: '罗摩克里希那（1836-1886），达克希涅什瓦尔迦梨女神庙祭司。亲身实修验证印度教、伊斯兰教和基督教灵性道路。近代印度教最伟大的神秘主义者。',
      coreTeaching: '万教归一——所有宗教都是通向同一终极真理的不同道路。直接灵性体验高于经典知识。',
      templeNames: [
        { name: '达克希涅什瓦尔寺', nameEn: 'Dakshineswar Kali Temple', role: '罗摩克里希那修行圣地', location: '加尔各答' },
      ],
      koans: [],
      classicQuotes: ['有多少信仰，就有多少通往神的道路', '上帝在每个人心中，只是大多数人不知道', '只要你有真诚的渴望，神必定显现'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '斯瓦米·维韦卡南达', nameEn: 'Swami Vivekananda', religionId: hinduismId,
      dates: '1863-1902', title: '实用吠檀多倡导者·世界宗教大会演说家',
      school: '瑜伽修行', generation: 3, teacherId: ramakrishna.id,
      biography: '维韦卡南达（1863-1902），罗摩克里希那最杰出弟子。1893年芝加哥世界宗教大会演讲震惊世界。创立罗摩克里希那修道会，提倡"实用吠檀多"。三十九岁英年早逝。',
      coreTeaching: '实用吠檀多——每个灵魂都是潜在的神圣，通过四种瑜伽综合修行显现内在神圣。服务人类就是服务神。',
      templeNames: [
        { name: '贝卢尔修道院', nameEn: 'Belur Math', role: '罗摩克里希那修道会总部', location: '西孟加拉邦' },
      ],
      koans: [],
      classicQuotes: ['起来，觉醒，不达目标不止步', '你是纯粹的意识，你是全能的', '服务人类就是服务神'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '帕拉宏撒·瑜伽南达', nameEn: 'Paramahansa Yogananda', religionId: hinduismId,
      dates: '1893-1952', title: '克利亚瑜伽传播者·自悟协会创始人',
      school: '瑜伽修行', generation: 3,
      biography: '瑜伽南达（1893-1952），1920年移居美国，第一位长期居住西方的印度瑜伽大师。创立自悟协会，教授克利亚瑜伽。自传《一个瑜伽行者的自传》翻译成50多种语言。',
      coreTeaching: '克利亚瑜伽是高级生命能量控制技术，科学化的灵性修行。上帝是永恒的喜乐。',
      templeNames: [],
      koans: [],
      classicQuotes: ['环境无法塑造你，除非你允许', '上帝在沉默中低语，在孤独中聆听', '越是平静，你越能成就'],
      works: [
        { title: '一个瑜伽行者的自传', description: '灵性文学经典，翻译成50多种语言' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '室利·奥罗宾多', nameEn: 'Sri Aurobindo', religionId: hinduismId,
      dates: '1872-1950', title: '整合瑜伽创始人·超心智进化论者',
      school: '瑜伽修行', generation: 3,
      biography: '奥罗宾多（1872-1950），剑桥毕业，先为独立运动领袖，后转向灵性。在本地治里发展"整合瑜伽"。提出"超心智"进化理论。',
      coreTeaching: '整合瑜伽——不逃离世界而是在世间实现灵性转化。人类意识正在进化，迈向超心智。',
      templeNames: [
        { name: '奥罗宾多修道院', nameEn: 'Sri Aurobindo Ashram', role: '整合瑜伽修行中心', location: '本地治里' },
      ],
      koans: [],
      classicQuotes: ['地球上的生命不是偶然的迷途，而是神圣意志的进化表达', '所有的生命都是瑜伽'],
      works: [],
      imageUrl: null,
    },
  });

  // ── 虔信运动 ──

  // 罗摩难陀 must be created before 迦比尔 and 密拉白 (teacher reference)
  const ramananda = await prisma.patriarch.create({
    data: {
      name: '罗摩难陀', nameEn: 'Ramananda', religionId: hinduismId,
      dates: '14世纪', title: '北印虔信运动开创者',
      school: '虔信运动', generation: 1,
      biography: '罗摩难陀（约14世纪），北印虔信运动开创者。打破种姓限制，弟子包括织工迦比尔、皮匠拉维达斯等。以印地语传教。',
      coreTeaching: '对罗摩的虔爱是通向解脱的直接道路。种姓和出身不能限制灵魂与神的关系。',
      templeNames: [],
      koans: [],
      classicQuotes: ['认识神的人无种姓之分', '无论何种出身，虔爱者皆为神之子民'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '迦比尔', nameEn: 'Kabir', religionId: hinduismId,
      dates: '1440-1518', title: '超越宗教界限的诗人圣者',
      school: '虔信运动', generation: 2, teacherId: ramananda.id,
      biography: '迦比尔（1440-1518），瓦拉纳西穆斯林织工家庭出身。既批评印度教偶像崇拜也批评伊斯兰教形式主义。诗歌影响了锡克教圣典。',
      coreTeaching: '神超越一切名号和形式——不在庙里也不在清真寺里，就在每个人心中。',
      templeNames: [],
      koans: [],
      classicQuotes: ['我不是印度教徒，也不是穆斯林', '你在哪里寻找我？我就在你身旁', '织这块布的人，比世上任何织工都精细'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '密拉白', nameEn: 'Mirabai', religionId: hinduismId,
      dates: '1498-1547', title: '奎师那虔信女圣者',
      school: '虔信运动', generation: 2, teacherId: ramananda.id,
      biography: '密拉白（1498-1547），拉贾斯坦公主。全身心奉献给奎师那，面对王室迫害不屈。虔信诗歌至今全印度传唱。',
      coreTeaching: '对奎师那的纯粹虔爱超越世俗束缚。真正的虔信是无条件的爱和完全的臣服。',
      templeNames: [],
      koans: [],
      classicQuotes: ['我已将此身献给克里希纳，无论毒药还是甘露', '世人说密拉疯了，只有神知道真相'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '柴坦尼亚', nameEn: 'Chaitanya Mahaprabhu', religionId: hinduismId,
      dates: '1486-1534', title: '唱颂运动发起者·高迪亚外士那瓦创始人',
      school: '虔信运动', generation: 3,
      biography: '柴坦尼亚（1486-1534），孟加拉婆罗门。发起大规模唱颂运动。创立高迪亚外士那瓦，影响通过ISKCON传播全世界。',
      coreTeaching: '唱颂圣名是末法时代最有效的灵性修行。虔爱最高境界是Prema（纯粹灵性之爱）。',
      templeNames: [],
      koans: [],
      classicQuotes: ['唱颂圣名，唱颂圣名，末法时代别无他途', '一个人应比草更卑微，比树更忍耐'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '图勒西达斯', nameEn: 'Tulsidas', religionId: hinduismId,
      dates: '1532-1623', title: '罗摩虔信诗圣',
      school: '虔信运动', generation: 3,
      biography: '图勒西达斯（1532-1623），北印最伟大诗人圣者。《罗摩功行录》以阿瓦德语重述罗摩衍那，被比作"印度的圣经"。',
      coreTeaching: '罗摩是至高神化身，对罗摩的虔爱是通向解脱的最美道路。虔爱的力量可以跨越种姓鸿沟。',
      templeNames: [],
      koans: [],
      classicQuotes: ['恭敬双手合十，我先礼拜胜利的罗摩', '罗摩之名的力量大于罗摩本身'],
      works: [
        { title: '罗摩功行录', description: '七章诗歌，以阿瓦德语重述罗摩衍那' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '苏尔达斯', nameEn: 'Surdas', religionId: hinduismId,
      dates: '1478-1583', title: '盲眼诗圣·克里希纳虔信歌者',
      school: '虔信运动', generation: 3,
      biography: '苏尔达斯（1478-1583），自幼失明，诗集《苏尔之海》超十万首诗歌描绘克里希纳童年。"八大诗人"之一。',
      coreTeaching: '真正的"看见"不靠肉眼而靠虔爱之心。诗歌和音乐是灵性体验最自然的表达。',
      templeNames: [],
      koans: [],
      classicQuotes: ['我的眼睛虽盲，心却看见了克里希纳', '弗林达文的牧笛声穿透了所有障碍'],
      works: [],
      imageUrl: null,
    },
  });

  // ── 经典六派 ──

  await prisma.patriarch.create({
    data: {
      name: '迦毗罗', nameEn: 'Kapila', religionId: hinduismId,
      dates: '前7世纪', title: '数论哲学创始人',
      school: '经典六派', generation: 1,
      biography: '迦毗罗（约前7世纪），数论哲学创始人。提出"二十五谛"宇宙论。《薄伽梵歌》灵魂不灭思想源于数论。',
      coreTeaching: '宇宙由原质和神我两种根本实在构成。痛苦根源是混淆二者。解脱就是分辨，使神我恢复纯粹觉知。',
      templeNames: [],
      koans: [],
      classicQuotes: ['分辨灵魂与物质，即是解脱之路', '一切痛苦源于无知的混淆'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '足目', nameEn: 'Kanada', religionId: hinduismId,
      dates: '前6世纪', title: '胜论哲学创始人·原子论先驱',
      school: '经典六派', generation: 1,
      biography: '足目（约前6世纪），胜论哲学创始人。提出世界上最早的原子论之一。六种范畴涵盖一切存在。',
      coreTeaching: '一切物质由不可分割的极微（原子）组成。世界可通过理性分析和分类来理解。',
      templeNames: [],
      koans: [],
      classicQuotes: ['极微是不可分割的最终实在', '正确的知识来自正确的分类'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '乔答摩', nameEn: 'Gautama Aksapada', religionId: hinduismId,
      dates: '前2世纪', title: '正理哲学创始人·印度逻辑学之父',
      school: '经典六派', generation: 1,
      biography: '乔答摩（约前2世纪），正理哲学创始人，著《正理经》。创建印度逻辑学完整体系，四种有效知识来源和五段论推理法。',
      coreTeaching: '正确的知识是消除痛苦的根本途径。通过五段论推理消除谬误和无知。',
      templeNames: [],
      koans: [],
      classicQuotes: ['痛苦的根源是错误的知识', '正确的推理是通向真理的阶梯'],
      works: [
        { title: '正理经', description: '印度逻辑学与认识论奠基之作' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '耆米尼', nameEn: 'Jaimini', religionId: hinduismId,
      dates: '前4世纪', title: '弥曼差哲学创始人',
      school: '经典六派', generation: 2,
      biography: '耆米尼（约前4世纪），弥曼差哲学创始人。创建严格的经文诠释学方法。吠陀是永恒的、无作者的。',
      coreTeaching: '吠陀是永恒的最高权威。正确执行祭祀仪式可积累功德。诠释必须遵循严格规则。',
      templeNames: [],
      koans: [],
      classicQuotes: ['法即是吠陀所命令的行为', '言语与意义的关系是永恒的'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '自在黑', nameEn: 'Ishvarakrishna', religionId: hinduismId,
      dates: '4世纪', title: '数论颂作者·三德理论系统化者',
      school: '经典六派', generation: 2,
      biography: '自在黑（约4世纪），数论哲学系统化集大成者。著《数论颂》七十颂，清晰阐述三德理论和二十五谛演化。',
      coreTeaching: '原质具三种根本属性（三德）：萨埵/善、罗阇/动、答摩/暗。宇宙一切变化都是三德比例变动的结果。',
      templeNames: [],
      koans: [],
      classicQuotes: ['三德的平衡即是原质的本来状态', '知识是灵魂最终的解放者'],
      works: [],
      imageUrl: null,
    },
  });

  // ── 近现代复兴 ──
  // (罗摩克里希那 already created above for teacher reference)

  await prisma.patriarch.create({
    data: {
      name: '圣雄甘地', nameEn: 'Mahatma Gandhi', religionId: hinduismId,
      dates: '1869-1948', title: '圣雄·真理力量实践者·非暴力之父',
      school: '近现代复兴', generation: 1,
      biography: '甘地（1869-1948），印度独立运动领袖，"圣雄"。发展"真理力量"和"非暴力"。以《薄伽梵歌》为根基。影响马丁·路德·金、曼德拉等。',
      coreTeaching: '真理力量——以真理和非暴力对抗不义。行动瑜伽——尽本分行动，不执著成果。简朴生活，高尚思想。',
      templeNames: [
        { name: '萨巴尔马蒂修道院', nameEn: 'Sabarmati Ashram', role: '甘地修道院·食盐长征起点', location: '古吉拉特邦' },
      ],
      koans: [],
      classicQuotes: ['以眼还眼只会让全世界变成瞎子', '你必须成为你希望在世界上看到的改变', '在真理面前没有失败'],
      works: [
        { title: '我对真理的实验', description: '甘地自传，追求真理和非暴力的灵性旅程' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '泰戈尔', nameEn: 'Rabindranath Tagore', religionId: hinduismId,
      dates: '1861-1941', title: '诗哲·亚洲首位诺贝尔文学奖得主',
      school: '近现代复兴', generation: 2,
      biography: '泰戈尔（1861-1941），1913年亚洲第一位诺贝尔文学奖得主。《吉檀迦利》表达灵魂对无限者的渴望。创办圣蒂尼克坦学校。印度和孟加拉国国歌作词者。',
      coreTeaching: '人与无限者之间是爱与美的关系。教育培养完整的人。东西方文化精髓可以融合。',
      templeNames: [
        { name: '圣蒂尼克坦', nameEn: 'Santiniketan', role: '泰戈尔创办的大学和文化中心', location: '西孟加拉邦' },
      ],
      koans: [],
      classicQuotes: ['世界以痛吻我，我要报之以歌', '信仰是感知的鸟，在黎明还是黑暗时已经歌唱', '让我的爱像阳光一样包围着你，却给你光辉灿烂的自由'],
      works: [
        { title: '吉檀迦利', description: '103首散文诗，获诺贝尔文学奖' },
      ],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '罗摩那·马哈希', nameEn: 'Ramana Maharshi', religionId: hinduismId,
      dates: '1879-1950', title: '自我参究导师·沉默圣者',
      school: '近现代复兴', generation: 2,
      biography: '罗摩那·马哈希（1879-1950），十六岁时自发觉悟真我，前往蒂鲁瓦纳马莱阿鲁那恰拉圣山度过余生。极少主动说法，以沉默传达教导。',
      coreTeaching: '自我参究——持续追问"我是谁？"当假我消融，纯粹觉知的真我自然显现。真我就是存在-意识-喜乐。',
      templeNames: [
        { name: '罗摩那修道院', nameEn: 'Sri Ramanasramam', role: '罗摩那·马哈希修道院', location: '泰米尔纳德邦蒂鲁瓦纳马莱' },
      ],
      koans: [],
      classicQuotes: ['你的本来面目一直在那里，只是被念头遮蔽了', '沉默是永不停止的传法', '找到那个问"我是谁"的人'],
      works: [],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: 'A.C.巴克提韦丹塔', nameEn: 'A.C. Bhaktivedanta Swami', religionId: hinduismId,
      dates: '1896-1977', title: 'ISKCON创始人·全球奎师那知觉传播者',
      school: '近现代复兴', generation: 3,
      biography: '巴克提韦丹塔（1896-1977），69岁身无分文搭货船前往美国。创立ISKCON，翻译注释80余卷经典。十二年环游世界十四次，建立108座寺院。',
      coreTeaching: '奎师那是至尊人格首神。通过唱颂圣名、吃奉献食物、阅读经典和服务奉献者唤醒灵魂本来的奎师那知觉。',
      templeNames: [
        { name: 'ISKCON弗林达文', nameEn: 'ISKCON Vrindavan', role: 'ISKCON在克里希纳圣地的主要寺院', location: '北方邦弗林达文' },
      ],
      koans: [],
      classicQuotes: ['唱颂Hare Krishna并快乐起来', '这是一场灵性革命', '我们不是拥有灵魂的身体，而是穿着身体的灵魂'],
      works: [
        { title: '博伽梵歌原义', description: '全球发行数亿册' },
      ],
      imageUrl: null,
    },
  });

  const hinduCount = 26;
  console.log(`  ✓ ${hinduCount} new Hindu sages created + 2 updated (5 schools: Vedanta/Yoga/Bhakti/Darshana/Modern)`);

  // ── 4q. 犹太教先贤 (Jewish Patriarchs) ──
  console.log('  Creating Jewish patriarchs (4q)...');

  const judaismId = religionMap['judaism'];

  // Update existing 亚伯拉罕
  const existingAbraham = await prisma.patriarch.findFirst({ where: { name: '亚伯拉罕' } });
  existingAbraham
    ? await prisma.patriarch.update({
        where: { id: existingAbraham.id },
        data: {
          nameEn: 'Abraham', dates: '前2000年', title: '信心之父·三教共祖',
          school: '圣经先知', generation: 1,
          biography: '亚伯拉罕（约前2000年），犹太教、基督教和伊斯兰教三大一神教的共同始祖。上帝呼召他离开吾珥前往迦南应许之地，与他立约：后裔多如天上星、海边沙。在百岁得子以撒后，经受献祭独子的终极考验，以绝对信心回应上帝。希伯伦麦比拉洞是他与撒拉的安息之所，至今为犹太教、伊斯兰教共同圣地。',
          coreTeaching: '绝对信心——一神信仰的根基。上帝是唯一真神，与信仰者立约。信心不是理解，而是在未知中顺服行走。',
          achievements: '一神信仰之父，三大宗教共祖。与上帝立约，开创以色列民族。',
          templeNames: [{ name: '麦比拉洞', nameEn: 'Cave of Machpelah', role: '列祖安息之地', location: '希伯伦' }],
          koans: [], classicQuotes: ['我虽是尘土炉灰，还敢对主说话', '亚伯拉罕信耶和华，耶和华就以此为他的义'],
          works: [], imageUrl: null,
        },
      })
    : null;

  // Update existing 摩西
  const existingMoses = await prisma.patriarch.findFirst({ where: { name: '摩西' } });
  existingMoses
    ? await prisma.patriarch.update({
        where: { id: existingMoses.id },
        data: {
          nameEn: 'Moses', dates: '前1400年', title: '最伟大的先知·十诫颁布者',
          school: '圣经先知', generation: 2,
          biography: '摩西（约前1400年），犹太民族最伟大的先知和立法者。出生于埃及被法老女儿收养，后蒙上帝召唤于燃烧荆棘旁，率领以色列人出埃及过红海。在西奈山上接受上帝亲授的十诫和妥拉，是犹太律法的奠基者。四十年旷野流浪中塑造了一个民族的信仰和律法体系，却未能亲入应许之地。被尊为"先知中最伟大者"。',
          coreTeaching: '妥拉——上帝律法是生活的根基。十诫涵盖人与神、人与人的根本关系。律法不是束缚而是通向自由的道路。',
          achievements: '率领以色列人出埃及，接受十诫，著妥拉五经。犹太律法体系奠基者。',
          templeNames: [{ name: '西奈山', nameEn: 'Mount Sinai', role: '十诫颁布·神人会面之地', location: '西奈半岛' }],
          koans: [], classicQuotes: ['我是自有永有的', '以色列啊，你要听！耶和华我们的神是独一的主', '你要尽心、尽性、尽力爱耶和华你的神'],
          works: [{ title: '妥拉五经', description: '创世记至申命记，犹太教根本经典' }],
          imageUrl: null,
        },
      })
    : null;

  // ── 圣经先知 ──

  await prisma.patriarch.create({
    data: {
      name: '大卫王', nameEn: 'King David', religionId: judaismId,
      dates: '前1040-前970', title: '以色列之王·诗篇作者',
      school: '圣经先知', generation: 3,
      biography: '大卫（前1040-前970），以色列第二位国王，牧羊少年以甩石击败巨人歌利亚而闻名。统一以色列十二支派，定都耶路撒冷。他是战士、诗人和音乐家，著诗篇七十三首，表达了人类灵魂最深处的祈祷、忏悔和赞美。上帝与他立约：他的后裔将永远坐在宝座上，弥赛亚将从他的家系而出。',
      coreTeaching: '与上帝建立亲密的个人关系。即使犯罪跌倒，也以真诚忏悔回转。诗篇教导人在喜乐和苦难中都向上帝敞开心灵。',
      templeNames: [{ name: '锡安山大卫墓', nameEn: 'Tomb of David, Mount Zion', role: '大卫王传统安息地', location: '耶路撒冷' }],
      koans: [], classicQuotes: ['耶和华是我的牧者，我必不至缺乏', '求你为我造清洁的心', '我观看你指头所造的天，便说人算什么'],
      works: [{ title: '诗篇', description: '150篇赞美诗中73篇署名大卫，犹太礼拜根基' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '所罗门王', nameEn: 'King Solomon', religionId: judaismId,
      dates: '前990-前931', title: '智慧之王·圣殿建造者',
      school: '圣经先知', generation: 3,
      biography: '所罗门（前990-前931），大卫之子，以色列最富有和最智慧的国王。向上帝求智慧而非财富，获赐超凡判断力。建造了辉煌的第一圣殿——耶路撒冷圣殿，成为犹太信仰的中心。著箴言、传道书和雅歌三卷圣经。在位期间以色列达到黄金时代，四方来朝。',
      coreTeaching: '智慧始于敬畏上帝。世间万事皆有定时，日光之下并无新事。虚空的虚空，唯有敬畏神、谨守诫命才是人的本分。',
      templeNames: [{ name: '耶路撒冷第一圣殿', nameEn: 'First Temple of Jerusalem', role: '所罗门建造·犹太信仰中心', location: '耶路撒冷圣殿山' }],
      koans: [], classicQuotes: ['敬畏耶和华是智慧的开端', '虚空的虚空，凡事都是虚空', '日光之下并无新事'],
      works: [{ title: '箴言', description: '智慧格言集' }, { title: '传道书', description: '人生哲理省思' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '以利亚', nameEn: 'Elijah', religionId: judaismId,
      dates: '前9世纪', title: '烈火先知·弥赛亚先驱',
      school: '圣经先知', generation: 4,
      biography: '以利亚（前9世纪），以色列最具传奇色彩的先知。在亚哈王和耶洗别崇拜巴力的黑暗时代，孤身对抗450名巴力先知于迦密山，天降烈火焚烧祭物。后以旋风和火车火马升天，从未经历死亡。犹太传统相信他将在弥赛亚来临前再次出现。每年逾越节晚餐为他留一杯酒、开一扇门。',
      coreTeaching: '独一真神的绝对忠诚。即使全世界背弃，一人也要坚守真理。上帝不在风暴地震烈火中，而在微小的声音里。',
      templeNames: [{ name: '迦密山', nameEn: 'Mount Carmel', role: '以利亚与巴力先知对决之地', location: '海法' }],
      koans: [], classicQuotes: ['你们心持两意要到几时呢？若耶和华是神就当跟从耶和华', '耶和华啊，罢了！求你取我的性命', '耶和华不在风中，不在地震中，不在火中，乃在火后有微小的声音'],
      works: [], imageUrl: null,
    },
  });

  // ── 拉比传统 ──

  const hillel = await prisma.patriarch.create({
    data: {
      name: '希勒尔', nameEn: 'Hillel the Elder', religionId: judaismId,
      dates: '前110-10', title: '口传律法大师·金律',
      school: '拉比传统', generation: 1,
      biography: '希勒尔（前110-10），巴比伦出生后移居耶路撒冷，成为犹太史上最重要的拉比之一。他和沙迈构成了拉比犹太教的两大学派。希勒尔以温和谦逊著称，他的"金律"——"己所不欲勿施于人，这就是全部妥拉"——成为犹太伦理的核心。发展了七条解经原则，为口传律法奠定方法论基础。',
      coreTeaching: '金律——己所不欲勿施于人，这就是全部妥拉，其余都是注释。去学习吧！谦逊和耐心是通向智慧的门户。',
      templeNames: [], koans: [],
      classicQuotes: ['己所不欲勿施于人——这就是全部妥拉', '若我不为自己，谁为我？若我只为自己，我算什么？若不是现在，更待何时？', '不要与世隔绝，不要自信到老'],
      works: [], imageUrl: null,
    },
  });

  const akiva = await prisma.patriarch.create({
    data: {
      name: '阿基瓦拉比', nameEn: 'Rabbi Akiva', religionId: judaismId,
      dates: '50-135', title: '密释纳奠基人·殉教圣贤',
      school: '拉比传统', generation: 2, teacherId: hillel.id,
      biography: '阿基瓦（50-135），四十岁之前是目不识丁的牧羊人，在妻子拉结的鼓励下开始学习。成为当世最伟大的拉比，拥有两万四千弟子。系统化口传律法，为密释纳的编纂奠定基础。在巴尔·科赫巴起义中支持反罗马抵抗，被罗马人用铁梳活活刮肉处死。临终以"示玛"祈祷词含笑殉道。',
      coreTeaching: '妥拉的每一笔一划都蕴含深意。"爱邻如己"是妥拉最伟大的原则。学习永远不嫌晚，四十岁开始也能成为最伟大的学者。',
      templeNames: [{ name: '阿基瓦墓', nameEn: 'Tomb of Rabbi Akiva', role: '殉教圣贤安息地', location: '提比里亚' }],
      koans: [], classicQuotes: ['爱邻如己——这是妥拉中最伟大的原则', '一切都是预见的，但自由意志是被赋予的', '水滴石穿——若柔软的水能穿透坚硬的石头，妥拉必能穿透我的心'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '犹大·哈纳西', nameEn: 'Judah ha-Nasi', religionId: judaismId,
      dates: '135-217', title: '密释纳编纂者·拉比之师',
      school: '拉比传统', generation: 3,
      biography: '犹大·哈纳西（135-217），被尊称为"拉比"——拉比中的拉比。在罗马帝国摧毁第二圣殿后的危亡时刻，编纂了《密释纳》六卷六十三篇，将口传律法固定为文字，使犹太法律体系得以永续传承。他与罗马皇帝安敦尼·庇护保持友好关系，为犹太社区赢得宝贵的生存空间。',
      coreTeaching: '口传律法必须被记录和系统化，才能在流散中保存犹太传统。法律的核心是正义与慈悲的平衡。',
      templeNames: [{ name: '拜特谢阿里姆墓地', nameEn: 'Bet She\'arim Necropolis', role: '犹大·哈纳西安息地·UNESCO遗产', location: '下加利利' }],
      koans: [], classicQuotes: ['哪条路是人应选择的？凡自己觉得美好、别人也认为美好的', '不要看容器，要看里面的内容', '计算一条诫命的代价与报酬'],
      works: [{ title: '密释纳', description: '口传律法编纂，犹太法律根基，六卷六十三篇' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '拉什', nameEn: 'Rashi', religionId: judaismId,
      dates: '1040-1105', title: '圣经与塔木德注释大师',
      school: '拉比传统', generation: 4,
      biography: '拉什（1040-1105），全名拉比什洛莫·伊茨哈基，法国特鲁瓦的葡萄酒商人兼学者。他对希伯来圣经和巴比伦塔木德的逐句注释，以精炼简明著称，一千年来几乎每个犹太学生都从拉什注释开始学习。他的注释被印刷在每一版塔木德和妥拉的页面旁，影响之深远无人能及。',
      coreTeaching: '经文的字面意义（p\'shat）是理解的根基。注释应当简明扼要，让经文自己说话。学问要服务于日常生活中的律法实践。',
      templeNames: [], koans: [],
      classicQuotes: ['我只来教导经文的字面意义', '如果一个字有很多解释，选择最简单的那个'],
      works: [{ title: '妥拉注释', description: '犹太圣经逐句注释，千年标准' }, { title: '塔木德注释', description: '巴比伦塔木德完整注释' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '迈蒙尼德', nameEn: 'Maimonides', religionId: judaismId,
      dates: '1138-1204', title: '中世纪最伟大犹太学者',
      school: '拉比传统', generation: 5,
      biography: '迈蒙尼德（1138-1204），全名拉比摩西·本·迈蒙，出生于西班牙科尔多瓦，后流亡至开罗任苏丹御医。著《迷途指津》融合亚里士多德哲学与犹太神学，著《密释纳妥拉》系统化全部犹太律法为十四卷巨著。提出犹太教十三条信仰原则，至今是犹太正统信仰的标准表述。被誉为"从摩西到摩西，没有人像摩西"。',
      coreTeaching: '理性与信仰并行不悖。上帝的存在可以通过理性论证，但上帝的本质超越人类理解。信仰十三条原则是犹太教的根基。',
      templeNames: [{ name: '迈蒙尼德墓', nameEn: 'Tomb of Maimonides', role: '中世纪最伟大犹太学者安息地', location: '提比里亚' }],
      koans: [], classicQuotes: ['从摩西到摩西，没有人像摩西', '给予的最高境界是帮助人自立', '人应当接受真理，不论它来自何处'],
      works: [{ title: '迷途指津', description: '犹太哲学巨著，融合理性与信仰' }, { title: '密释纳妥拉', description: '犹太律法系统化，十四卷' }],
      imageUrl: null,
    },
  });

  // ── 卡巴拉神秘主义 ──

  await prisma.patriarch.create({
    data: {
      name: '西蒙·巴尔·约海', nameEn: 'Shimon bar Yochai', religionId: judaismId,
      dates: '2世纪', title: '光辉之书传承者',
      school: '卡巴拉神秘主义', generation: 1,
      biography: '西蒙·巴尔·约海（2世纪），阿基瓦拉比最杰出的弟子。因批评罗马统治被判死刑，与儿子在山洞中隐居十三年，潜心研读妥拉神秘层面。传统认为他是《光辉之书》（佐哈尔）的作者或灵感来源。他的忌日拉格·巴奥梅尔成为犹太节日，每年数十万人涌至梅龙山他的墓前庆祝。',
      coreTeaching: '妥拉有四层含义：字面、暗示、诠释和奥秘。只读字面是穿着衣服看人。灵魂之光隐藏在经文的每一个字母中。',
      templeNames: [{ name: '梅龙山墓', nameEn: 'Tomb on Mount Meron', role: '拉格巴奥梅尔朝圣地', location: '上加利利' }],
      koans: [], classicQuotes: ['妥拉的每个字都有七十层含义', '世界因三十六位义人而存在', '光辉照耀一切，却只有纯净的眼睛能看见'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '摩西·德·莱昂', nameEn: 'Moses de León', religionId: judaismId,
      dates: '1250-1305', title: '光辉之书整理者',
      school: '卡巴拉神秘主义', generation: 2,
      biography: '摩西·德·莱昂（1250-1305），西班牙卡巴拉学者。他在13世纪晚期公开了《光辉之书》（佐哈尔），声称这是西蒙·巴尔·约海的古老著作。无论其作者争议，佐哈尔成为犹太神秘主义最重要的经典，与圣经、塔木德并列为犹太教三大文献。',
      coreTeaching: '上帝通过十个质点（Sefirot）展现自身。每个灵魂都包含神圣的火花，修行的目的是收集这些火花回归源头。',
      templeNames: [], koans: [],
      classicQuotes: ['隐藏的光在创世之初就被保存，给未来的义人', '每个灵魂在降世前都知道全部妥拉'],
      works: [{ title: '光辉之书（佐哈尔）', description: '犹太神秘主义根本经典，对妥拉的神秘注释' }],
      imageUrl: null,
    },
  });

  const cordovero = await prisma.patriarch.create({
    data: {
      name: '摩西·科尔多维罗', nameEn: 'Moses Cordovero', religionId: judaismId,
      dates: '1522-1570', title: '体系化卡巴拉大师',
      school: '卡巴拉神秘主义', generation: 3,
      biography: '摩西·科尔多维罗（1522-1570），采法特卡巴拉学派的领袖。他是第一位将卡巴拉思想系统化和理性化的学者，著《棕榈树之园》梳理了佐哈尔中的矛盾与复杂概念。采法特在他和卢里亚的时代成为世界神秘主义的中心。',
      coreTeaching: '上帝无所不在，万物都是上帝本质的展现。十个质点是上帝自我显现的管道，理解质点就是理解上帝与世界的关系。',
      templeNames: [{ name: '采法特老城', nameEn: 'Old City of Safed', role: '16世纪卡巴拉中心', location: '上加利利采法特' }],
      koans: [], classicQuotes: ['上帝是万物的存在，但万物不是上帝的存在', '万物都在上帝之中，上帝在万物之中'],
      works: [{ title: '棕榈树之园', description: '卡巴拉体系化巨著' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '以撒·卢里亚', nameEn: 'Isaac Luria', religionId: judaismId,
      dates: '1534-1572', title: '卢里亚卡巴拉·圣狮',
      school: '卡巴拉神秘主义', generation: 4, teacherId: cordovero.id,
      biography: '以撒·卢里亚（1534-1572），被尊为"圣狮"（Ha-Ari）。在采法特仅短短两年便革新了整个卡巴拉体系。提出三大核心概念：齐姆祖姆（上帝收缩自身为创造腾出空间）、器皿破碎（神圣之光溢出导致世界碎裂）和修复世界（Tikkun）。三十八岁英年早逝，未留下任何著作，教导全由弟子海伊姆·维塔尔记录。',
      coreTeaching: '齐姆祖姆——上帝收缩自身为世界腾出空间。器皿破碎后神圣火花散落世间。每个人的使命是通过善行修复世界（Tikkun Olam）。',
      templeNames: [{ name: '卢里亚会堂', nameEn: 'Ha-Ari Synagogue', role: '圣狮祈祷与教导之地', location: '采法特' }],
      koans: [], classicQuotes: ['每个灵魂来到世间都有独特的修复使命', '善行释放被囚禁的神圣火花', '世界的碎片等待我们去修复'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '亚伯拉罕·阿布拉菲亚', nameEn: 'Abraham Abulafia', religionId: judaismId,
      dates: '1240-1291', title: '预言卡巴拉·字母冥想',
      school: '卡巴拉神秘主义', generation: 4,
      biography: '亚伯拉罕·阿布拉菲亚（1240-1291），西班牙裔卡巴拉学者，创立预言卡巴拉（Kabbalah Nevuit）。他发展了一套通过希伯来字母组合、呼吸控制和身体姿势达到神秘体验的冥想技术。曾试图面见教皇尼古拉三世以讨论宗教真理。他的方法在正统犹太教中颇具争议，但深刻影响了后世冥想传统。',
      coreTeaching: '通过希伯来字母的组合与置换冥想，灵魂可以超越肉体限制，达到预言状态。字母是宇宙的建构材料。',
      templeNames: [], koans: [],
      classicQuotes: ['字母是灵魂通往天堂的阶梯', '当心灵完全集中于神圣之名，预言之门自然打开'],
      works: [{ title: '生命之书', description: '预言卡巴拉冥想方法' }],
      imageUrl: null,
    },
  });

  // ── 哈西迪运动 ──

  const baalShemTov = await prisma.patriarch.create({
    data: {
      name: '巴尔·谢姆·托夫', nameEn: 'Baal Shem Tov', religionId: judaismId,
      dates: '1698-1760', title: '哈西迪运动创始人·善名大师',
      school: '哈西迪运动', generation: 1,
      biography: '巴尔·谢姆·托夫（1698-1760），原名以色列·本·以利以谢，意为"善名大师"。出生于乌克兰贫穷犹太家庭，年轻时在喀尔巴阡山林中隐修。三十六岁公开传道，创立哈西迪运动：上帝无所不在，喜乐是侍奉上帝最好的方式，每个普通人的真诚祈祷比学者的学问更有价值。这场运动席卷东欧，改变了数百万犹太人的灵性生活。',
      coreTeaching: '上帝无所不在（Panentheism）。喜乐地侍奉上帝——以歌唱、舞蹈和热情祈祷接近神圣。每个人的灵魂都是神圣的火花。',
      templeNames: [{ name: '梅兹博日', nameEn: 'Medzhybizh', role: '巴尔谢姆托夫传道中心与墓地', location: '乌克兰' }],
      koans: [], classicQuotes: ['从每一件事物中，人都可以学到侍奉上帝的方式', '遗忘是流放，记忆是救赎的根基', '让你的祈祷像火焰一样'],
      works: [], imageUrl: null,
    },
  });

  const dovBer = await prisma.patriarch.create({
    data: {
      name: '多夫·贝尔', nameEn: 'Dov Ber of Mezeritch', religionId: judaismId,
      dates: '1704-1772', title: '大传道者·哈西迪第二代领袖',
      school: '哈西迪运动', generation: 2, teacherId: baalShemTov.id,
      biography: '多夫·贝尔（1704-1772），被称为"梅泽里奇的大传道者"（Maggid）。原为学者因病寻求巴尔·谢姆·托夫的治愈而成为其弟子。师父去世后接掌运动领导权，将哈西迪运动从民间运动转化为有组织的灵性体系。培养了数十位杰出弟子，分派到各地建立王朝，使哈西迪运动在一代人内遍布东欧。',
      coreTeaching: '虚无（Ayin）是最高的灵性境界——将自我消融在上帝的无限中。祈祷时要达到忘我的"德维库特"（与神合一）状态。',
      templeNames: [], koans: [],
      classicQuotes: ['在虚无中包含一切', '思想到达之处，整个人就到达那里', '最伟大的侍奉是在最平凡的行为中'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '雪尼尔·扎尔曼', nameEn: 'Shneur Zalman of Liadi', religionId: judaismId,
      dates: '1745-1812', title: '哈巴德创始人·塔尼亚作者',
      school: '哈西迪运动', generation: 3, teacherId: dovBer.id,
      biography: '雪尼尔·扎尔曼（1745-1812），哈巴德（Chabad）王朝创始人。哈巴德代表智慧（Chochmah）、理解（Binah）、知识（Da\'at）。著《塔尼亚》将卡巴拉和哈西迪思想系统化为可学习的智识体系，被称为"哈西迪运动的圣经"。曾因被控叛国入狱，获释日成为哈巴德节日。',
      coreTeaching: '每个犹太人都有两个灵魂——神圣灵魂和动物灵魂的持续争战。通过学习和冥想，智慧之光可以转化动物灵魂。',
      templeNames: [], koans: [],
      classicQuotes: ['中间人——不是义人也不是恶人，是大多数人的真实状态', '头脑天生统治心灵', '每个犹太人都有两个灵魂'],
      works: [{ title: '塔尼亚', description: '哈巴德哲学根基，哈西迪运动的圣经' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '纳赫曼', nameEn: 'Nachman of Breslov', religionId: judaismId,
      dates: '1772-1810', title: '布雷斯洛夫派·故事大师',
      school: '哈西迪运动', generation: 3, teacherId: dovBer.id,
      biography: '纳赫曼（1772-1810），巴尔·谢姆·托夫的曾孙，布雷斯洛夫哈西迪王朝创始人。以讲述深奥的童话故事传达神秘教义而闻名。教导"整个世界是一座很窄的桥，关键是不要害怕"。三十八岁死于肺结核，没有指定继承人。追随者至今没有活的拉比领袖，被称为"死去的哈西迪"。',
      coreTeaching: '信心的核心是在黑暗中仍然相信。与上帝的个人对话（Hitbodedut）——每天独处，用自己的话向上帝倾诉。永远不要绝望。',
      templeNames: [{ name: '乌曼墓', nameEn: 'Uman Tomb', role: '纳赫曼安息地·新年朝圣', location: '乌克兰乌曼' }],
      koans: [], classicQuotes: ['整个世界是一座很窄的桥，关键是完全不要害怕', '如果你相信可以破坏，就要相信可以修复', '即使在最黑暗的地方也有光明'],
      works: [{ title: '纳赫曼故事集', description: '以童话形式传达的深奥卡巴拉教义' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '梅纳赫姆·门德尔·施尼尔森', nameEn: 'Menachem Mendel Schneerson', religionId: judaismId,
      dates: '1902-1994', title: '第七代卢巴维奇领袖',
      school: '哈西迪运动', generation: 4,
      biography: '施尼尔森（1902-1994），哈巴德-卢巴维奇运动第七代领袖，被追随者尊称为"拉比"。在巴黎获工程学位后移居美国，1951年接掌领导权。将哈巴德从纽约布鲁克林小社区转变为全球最大的犹太外展组织，在世界各地设立数千个哈巴德中心。主张"每一个犹太人都重要"，派遣使者到最偏远角落。',
      coreTeaching: '每个犹太人都是一盏灯——点亮一盏灯就能驱散许多黑暗。外展（Shlichus）——将犹太学习和实践带给每一个犹太人。',
      templeNames: [{ name: '纽约770', nameEn: '770 Eastern Parkway', role: '卢巴维奇全球总部', location: '纽约布鲁克林' }],
      koans: [], classicQuotes: ['一点光明就能驱散许多黑暗', '如果你还没有找到你在世界上的使命，说明你还没有开始寻找', '世界不是需要逃避的地方，而是需要修复的地方'],
      works: [], imageUrl: null,
    },
  });

  // ── 近现代思想 ──

  await prisma.patriarch.create({
    data: {
      name: '摩西·门德尔松', nameEn: 'Moses Mendelssohn', religionId: judaismId,
      dates: '1729-1786', title: '犹太启蒙运动之父',
      school: '近现代思想', generation: 1,
      biography: '摩西·门德尔松（1729-1786），犹太启蒙运动（Haskalah）之父。出身贫穷，自学成才，成为柏林最受尊敬的哲学家之一。将妥拉翻译成德语，为犹太人融入欧洲社会打开大门。主张犹太教是理性宗教，可与现代文明兼容。他证明了一个人可以同时是虔诚的犹太人和现代知识分子。',
      coreTeaching: '犹太教是理性宗教，与启蒙理性完全兼容。国家不应干预个人信仰。犹太人可以在保持信仰的同时参与现代文明。',
      templeNames: [], koans: [],
      classicQuotes: ['国家没有权力以奖惩手段干预个人信仰', '犹太教不是教条而是实践的宗教'],
      works: [{ title: '耶路撒冷', description: '犹太教与政治权力分离的哲学论证' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '马丁·布伯', nameEn: 'Martin Buber', religionId: judaismId,
      dates: '1878-1965', title: '对话哲学家·我与你',
      school: '近现代思想', generation: 2,
      biography: '马丁·布伯（1878-1965），奥地利裔以色列哲学家。著《我与你》提出人类存在的两种基本关系：我-你（真实的相遇与对话）和我-它（物化和利用）。与上帝的关系是永恒的"我-你"。收集哈西迪故事，向现代世界介绍了这一灵性传统的智慧。移居巴勒斯坦后倡导犹太-阿拉伯和平共处。',
      coreTeaching: '我-你关系——真正的生活是相遇。每一次真诚的人际对话都是与上帝相遇的缩影。上帝是永恒的"你"。',
      templeNames: [], koans: [],
      classicQuotes: ['一切真实的生活是相遇', '当我面对一个人作为"你"，他就不再是经验中的一个事物', '上帝不是被证明的，而是被称呼的'],
      works: [{ title: '我与你', description: '对话哲学经典' }, { title: '哈西迪故事集', description: '向现代世界介绍哈西迪智慧' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '亚伯拉罕·约书亚·赫舍尔', nameEn: 'Abraham Joshua Heschel', religionId: judaismId,
      dates: '1907-1972', title: '深度神学·安息日的先知',
      school: '近现代思想', generation: 2,
      biography: '赫舍尔（1907-1972），波兰哈西迪世家出身，逃离纳粹后定居美国。著《安息日》将休息日诠释为"时间中的圣殿"。他的神学强调上帝不是冷漠的造物主，而是关心人类苦难的"神圣的悲情"（Divine Pathos）。与马丁·路德·金并肩参加塞尔玛民权游行，说"我的双腿在祈祷"。',
      coreTeaching: '上帝不是无动于衷的，祂被人类的苦难所触动。安息日是时间中的圣殿——圣洁不只存在于空间，更存在于时间。敬畏是智慧的开端。',
      templeNames: [], koans: [],
      classicQuotes: ['敬畏（radical amazement）是一切真知的开端', '我的双腿在祈祷', '安息日是时间中的圣殿'],
      works: [{ title: '安息日', description: '将安息日诠释为时间中的圣殿' }, { title: '人不孤独', description: '犹太神学的深度探索' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '约瑟夫·索洛维奇克', nameEn: 'Joseph Soloveitchik', religionId: judaismId,
      dates: '1903-1993', title: '孤独的信仰之人',
      school: '近现代思想', generation: 3,
      biography: '索洛维奇克（1903-1993），被称为"拉夫"（The Rav），现代正统犹太教最具影响力的思想家。出身立陶宛拉比世家，在柏林获哲学博士。在波士顿叶史瓦大学执教近半世纪，培养了几代正统拉比。著《孤独的信仰之人》探讨现代人在信仰与世俗之间的孤独与张力。',
      coreTeaching: '信仰之人注定孤独——他同时生活在两个世界。哈拉卡（犹太律法）不仅是规则，更是与上帝共同创造的过程。',
      templeNames: [], koans: [],
      classicQuotes: ['信仰之人是最孤独的人', '律法不是限制自由，而是赋予生命意义的框架'],
      works: [{ title: '孤独的信仰之人', description: '现代信仰困境的经典探讨' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '以马内利·列维纳斯', nameEn: 'Emmanuel Levinas', religionId: judaismId,
      dates: '1906-1995', title: '他者伦理学·面容哲学家',
      school: '近现代思想', generation: 3,
      biography: '列维纳斯（1906-1995），立陶宛裔法国哲学家。经历纳粹集中营后，将犹太伦理传统转化为现代哲学：他者的面容向我发出无限的伦理要求。伦理不是存在论的附属，而是"第一哲学"。每周在巴黎进行塔木德讲座四十年，将犹太经典智慧带入当代哲学对话。',
      coreTeaching: '他者的面容——面对另一个人的脸，就是面对无限的伦理要求。"你不可杀人"是面容的第一句话。伦理先于存在论。',
      templeNames: [], koans: [],
      classicQuotes: ['他者的面容说：你不可杀我', '伦理是第一哲学', '我对他者的责任是无限的，先于任何契约'],
      works: [{ title: '总体与无限', description: '他者伦理学奠基之作' }, { title: '塔木德讲义', description: '四十年塔木德哲学讲座' }],
      imageUrl: null,
    },
  });

  const judaismCount = 23;
  console.log(`  ✓ ${judaismCount} new Jewish patriarchs created + 2 updated (5 schools: Biblical/Rabbinic/Kabbalah/Hasidism/Modern)`);

  // ── 4r. 锡克教古鲁 (Sikh Gurus) ──
  console.log('  Creating Sikh patriarchs (4r)...');

  const sikhismId = religionMap['sikhism'];

  // Update existing 古鲁那纳克
  const existingNanak = await prisma.patriarch.findFirst({ where: { name: '古鲁那纳克' } });
  const guruNanak = existingNanak
    ? await prisma.patriarch.update({
        where: { id: existingNanak.id },
        data: {
          nameEn: 'Guru Nanak', dates: '1469-1539', title: '第一代古鲁·锡克教创始人',
          school: '前五代古鲁', generation: 1,
          biography: '古鲁那纳克（1469-1539），锡克教创始人和第一代古鲁。出生于旁遮普拉合尔附近的塔尔万迪村。三十岁时在河中沐浴时失踪三天，归来后宣布"没有印度教徒，没有穆斯林——只有上帝的道路"。此后与穆斯林乐师马尔达那一起徒步行遍印度、西藏、阿拉伯和波斯，传播一神信仰和平等理念。晚年建立卡尔塔普尔社区，确立兰格尔（免费共食厨房）传统。',
          coreTeaching: '一位上帝（Ik Onkar）——上帝唯一，无形无相，超越种姓和宗教分别。通过诵念神名（Nam Japna）、诚实劳动（Kirat Karni）和分享（Vand Chakna）实现灵性生活。',
          achievements: '创立锡克教，打破种姓和宗教壁垒。建立兰格尔共食传统。五次远行传播真理。',
          templeNames: [{ name: '楠卡纳·萨希布', nameEn: 'Nankana Sahib', role: '古鲁那纳克诞生地', location: '巴基斯坦旁遮普省' }],
          koans: [], classicQuotes: ['没有印度教徒，没有穆斯林，只有上帝的道路', '真理是最高的美德，但比真理更高的是真实地生活', '上帝是一，祂的名字是真理'],
          works: [{ title: '贾普吉·萨希布', description: '晨祷经，锡克教最重要的经文' }],
          imageUrl: null,
        },
      })
    : await prisma.patriarch.create({
        data: {
          name: '古鲁那纳克', nameEn: 'Guru Nanak', religionId: sikhismId,
          dates: '1469-1539', title: '第一代古鲁·锡克教创始人',
          school: '前五代古鲁', generation: 1,
          biography: '古鲁那纳克（1469-1539），锡克教创始人和第一代古鲁。三十岁时宣布"没有印度教徒，没有穆斯林——只有上帝的道路"。徒步行遍印度、西藏、阿拉伯和波斯，传播一神信仰和平等理念。',
          coreTeaching: '一位上帝（Ik Onkar），通过诵念神名、诚实劳动和分享实现灵性生活。',
          templeNames: [{ name: '楠卡纳·萨希布', nameEn: 'Nankana Sahib', role: '古鲁那纳克诞生地', location: '巴基斯坦旁遮普省' }],
          koans: [], classicQuotes: ['没有印度教徒，没有穆斯林，只有上帝的道路'],
          works: [{ title: '贾普吉·萨希布', description: '晨祷经' }], imageUrl: null,
        },
      });

  const guruAngad = await prisma.patriarch.create({
    data: {
      name: '古鲁安格德', nameEn: 'Guru Angad', religionId: sikhismId,
      dates: '1504-1552', title: '第二代古鲁·古木基文字创制者',
      school: '前五代古鲁', generation: 2, teacherId: guruNanak.id,
      biography: '古鲁安格德（1504-1552），锡克教第二代古鲁。原名莱赫纳，因对那纳克的绝对奉献被选为继承人并更名"安格德"（你身体的一部分）。他标准化了古木基文字（Gurmukhi），使那纳克的教导得以准确记录和传播。推广体育锻炼，建立学校，发展兰格尔传统。',
      coreTeaching: '文字是保存真理的容器。古木基文字让每个人都能阅读古鲁的教导，打破婆罗门对梵文经典的垄断。',
      templeNames: [{ name: '卡德尔·萨希布', nameEn: 'Khadur Sahib', role: '第二代古鲁传道中心', location: '旁遮普邦' }],
      koans: [], classicQuotes: ['服从是通往灵性的最短道路', '身体是灵魂的田地，播种什么就收获什么'],
      works: [], imageUrl: null,
    },
  });

  const guruAmarDas = await prisma.patriarch.create({
    data: {
      name: '古鲁阿马达斯', nameEn: 'Guru Amar Das', religionId: sikhismId,
      dates: '1479-1574', title: '第三代古鲁·兰格尔共食制度化',
      school: '前五代古鲁', generation: 3, teacherId: guruAngad.id,
      biography: '古鲁阿马达斯（1479-1574），七十三岁高龄被任命为第三代古鲁。将兰格尔共食传统制度化为必须——任何人想见古鲁，无论种姓高低，必须先一起坐在地上吃饭。连莫卧儿皇帝阿克巴也遵从此规。他反对寡妇殉葬（萨蒂）和面纱（普尔达），推动妇女平等。九十五岁高寿辞世。',
      coreTeaching: '平等从共食开始——任何人见古鲁前必须先在兰格尔中平等用餐。上帝面前无种姓之分，男女一律平等。',
      templeNames: [{ name: '戈因德瓦尔', nameEn: 'Goindval Sahib', role: '第三代古鲁圣地', location: '旁遮普邦' }],
      koans: [], classicQuotes: ['先坐下一起吃饭，然后才见古鲁', '上帝创造的光在每个人心中，不分种姓'],
      works: [], imageUrl: null,
    },
  });

  const guruRamDas = await prisma.patriarch.create({
    data: {
      name: '古鲁拉姆达斯', nameEn: 'Guru Ram Das', religionId: sikhismId,
      dates: '1534-1581', title: '第四代古鲁·阿姆利则建城者',
      school: '前五代古鲁', generation: 4, teacherId: guruAmarDas.id,
      biography: '古鲁拉姆达斯（1534-1581），第四代古鲁，阿马达斯的女婿。他建立了阿姆利则城（"甘露之池"），成为锡克教的圣城。组建了马散德制度（传教使者网络），将锡克教传播到更广泛地区。创作了著名的婚礼赞歌"拉万"，至今用于所有锡克教婚礼。',
      coreTeaching: '灵魂与上帝的结合如同婚礼——四圈绕行象征灵魂逐步走向与神合一。社区建设是灵性实践的基础。',
      templeNames: [{ name: '阿姆利则', nameEn: 'Amritsar', role: '古鲁拉姆达斯建立·锡克教圣城', location: '旁遮普邦' }],
      koans: [], classicQuotes: ['灵魂新娘绕着神圣之光行走四圈', '甘露之池净化所有前来者的灵魂'],
      works: [], imageUrl: null,
    },
  });

  // Update existing 古鲁阿尔詹
  const existingArjan = await prisma.patriarch.findFirst({ where: { name: '古鲁阿尔詹' } });
  const guruArjan = existingArjan
    ? await prisma.patriarch.update({
        where: { id: existingArjan.id },
        data: {
          nameEn: 'Guru Arjan', dates: '1563-1606', title: '第五代古鲁·阿迪格兰特编纂者',
          school: '前五代古鲁', generation: 5, teacherId: guruRamDas.id,
          biography: '古鲁阿尔詹（1563-1606），第五代古鲁，拉姆达斯之子。编纂《阿迪格兰特》（最初的圣典），收录前四位古鲁及印度教、伊斯兰教圣人的诗篇，体现了锡克教的包容精神。建造了金庙（哈尔曼迪尔·萨希布），四面开门象征向一切人开放。因拒绝删除圣典中被莫卧儿皇帝认为亵渎的内容，被坐在滚烫铁板上五天后殉道，成为锡克教第一位殉道者。',
          coreTeaching: '真理超越宗教界限——圣典收录印穆圣人诗篇证明上帝的教导不受宗教限制。金庙四面开门象征向所有人敞开。',
          achievements: '编纂阿迪格兰特·建造金庙·锡克教第一位殉道者',
          templeNames: [{ name: '金庙', nameEn: 'Harmandir Sahib (Golden Temple)', role: '锡克教最神圣的殿堂', location: '阿姆利则' }],
          koans: [], classicQuotes: ['甜蜜是你的意志，主啊，我只祈求你名的恩赐', '当痛苦来临时，不要怨恨——一切都是上帝的旨意'],
          works: [{ title: '阿迪格兰特', description: '锡克教原始圣典编纂，后扩展为古鲁格兰特·萨希布' }],
          imageUrl: null,
        },
      })
    : await prisma.patriarch.create({
        data: {
          name: '古鲁阿尔詹', nameEn: 'Guru Arjan', religionId: sikhismId,
          dates: '1563-1606', title: '第五代古鲁·阿迪格兰特编纂者',
          school: '前五代古鲁', generation: 5, teacherId: guruRamDas.id,
          biography: '古鲁阿尔詹（1563-1606），编纂阿迪格兰特，建造金庙，锡克教第一位殉道者。',
          coreTeaching: '真理超越宗教界限。',
          templeNames: [{ name: '金庙', nameEn: 'Harmandir Sahib', role: '锡克教最神圣殿堂', location: '阿姆利则' }],
          koans: [], classicQuotes: ['甜蜜是你的意志'], works: [], imageUrl: null,
        },
      });

  // ── 后五代古鲁 ──

  const guruHargobind = await prisma.patriarch.create({
    data: {
      name: '古鲁哈戈宾德', nameEn: 'Guru Hargobind', religionId: sikhismId,
      dates: '1595-1644', title: '第六代古鲁·米里与皮里双剑',
      school: '后五代古鲁', generation: 6, teacherId: guruArjan.id,
      biography: '古鲁哈戈宾德（1595-1644），第六代古鲁，阿尔詹殉道时年仅十一岁。他佩戴两把剑——米里（世俗权力）和皮里（灵性权力），标志着锡克教从纯粹灵修转向武装自卫。建立了阿卡尔塔赫特（永恒王座），成为锡克教政治权威的象征。多次与莫卧儿帝国交战，保卫了信仰自由。',
      coreTeaching: '灵性与世俗不可分离——真正的圣人同时是战士。面对暴政时武装自卫是正义的，保护弱者是宗教义务。',
      templeNames: [{ name: '阿卡尔塔赫特', nameEn: 'Akal Takht', role: '永恒王座·锡克教最高政治权威', location: '阿姆利则' }],
      koans: [], classicQuotes: ['一手握玫瑰，一手握剑', '真正的勇士保护弱者'],
      works: [], imageUrl: null,
    },
  });

  const guruHarRai = await prisma.patriarch.create({
    data: {
      name: '古鲁哈尔·拉伊', nameEn: 'Guru Har Rai', religionId: sikhismId,
      dates: '1630-1661', title: '第七代古鲁·草药医者',
      school: '后五代古鲁', generation: 7, teacherId: guruHargobind.id,
      biography: '古鲁哈尔·拉伊（1630-1661），第七代古鲁，以温和仁慈著称。建立了草药医疗诊所，为穷人免费治病。维持着一支军队但从未主动发动战争。据传曾治愈莫卧儿王子达拉·舒科的重病。他教导对一切生命的慈悲——即使走过花丛也要小心不折花茎。',
      coreTeaching: '对一切生命的慈悲——保持军事力量以保护弱者，但不主动伤害任何生命。治愈身体和灵魂同样重要。',
      templeNames: [{ name: '基拉特普尔', nameEn: 'Kiratpur Sahib', role: '第七代古鲁圣地', location: '旁遮普邦' }],
      koans: [], classicQuotes: ['即使踏过花丛也不要折断花茎'],
      works: [], imageUrl: null,
    },
  });

  const guruHarKrishan = await prisma.patriarch.create({
    data: {
      name: '古鲁哈尔·克里尚', nameEn: 'Guru Har Krishan', religionId: sikhismId,
      dates: '1656-1664', title: '第八代古鲁·最年幼的圣者',
      school: '后五代古鲁', generation: 8, teacherId: guruHarRai.id,
      biography: '古鲁哈尔·克里尚（1656-1664），五岁即位为第八代古鲁，锡克教历史上最年幼的古鲁。虽然年幼，但展现出非凡的灵性智慧和慈悲。在德里天花瘟疫期间不顾自身安危照顾病人，最终自己也感染天花，八岁殉世。临终指示"巴巴·巴卡莱"（继承者在巴卡拉村），引导找到下一任古鲁。',
      coreTeaching: '真正的伟大不在年龄而在灵性。以身作则服务众生，即使牺牲自己也在所不惜。',
      templeNames: [{ name: '班格拉·萨希布', nameEn: 'Bangla Sahib', role: '第八代古鲁救济天花患者之地', location: '德里' }],
      koans: [], classicQuotes: ['巴巴·巴卡莱——继承者在巴卡拉'],
      works: [], imageUrl: null,
    },
  });

  const guruTeghBahadur = await prisma.patriarch.create({
    data: {
      name: '古鲁特格·巴哈杜尔', nameEn: 'Guru Tegh Bahadur', religionId: sikhismId,
      dates: '1621-1675', title: '第九代古鲁·印度之盾',
      school: '后五代古鲁', generation: 9, teacherId: guruHarKrishan.id,
      biography: '古鲁特格·巴哈杜尔（1621-1675），第九代古鲁。当莫卧儿皇帝奥朗则布强迫克什米尔婆罗门改信伊斯兰教时，古鲁挺身而出保护他们的信仰自由——虽然他们的信仰与锡克教不同。他被带到德里，在拒绝改信后被公开处决。他的牺牲不是为了自己的信仰，而是为了他人信仰自由的权利，被誉为"印度之盾"（Hind di Chadar）。',
      coreTeaching: '为他人的信仰自由而牺牲是最崇高的行为。不畏惧也不使人恐惧——这是真正的圣者。',
      templeNames: [{ name: '锡斯甘杰', nameEn: 'Sis Ganj Sahib', role: '第九代古鲁殉道地', location: '德里' }],
      koans: [], classicQuotes: ['不畏惧也不使人恐惧——这是智者之道', '他为保护他人的信仰献出了生命'],
      works: [], imageUrl: null,
    },
  });

  const guruGobindSingh = await prisma.patriarch.create({
    data: {
      name: '古鲁戈宾德·辛格', nameEn: 'Guru Gobind Singh', religionId: sikhismId,
      dates: '1666-1708', title: '第十代古鲁·卡尔萨创建者',
      school: '后五代古鲁', generation: 10, teacherId: guruTeghBahadur.id,
      biography: '古鲁戈宾德·辛格（1666-1708），锡克教第十代也是最后一位人间古鲁。1699年在拜萨基节创建卡尔萨（纯净之军），确立锡克教五K标志：长发（Kesh）、梳子（Kangha）、钢手环（Kara）、短剑（Kirpan）和短裤（Kachera）。他的四个儿子全部为信仰牺牲。临终前宣布不再有人间古鲁，将古鲁地位永久授予《古鲁格兰特·萨希布》——锡克教圣典本身成为永恒的古鲁。',
      coreTeaching: '卡尔萨——每个锡克教徒都是圣战士，佩戴五K标志。圣典是永恒的古鲁。当一切和平手段用尽时，拔剑而战是正义的。',
      achievements: '创建卡尔萨·确立五K标志·完成古鲁格兰特·萨希布·将古鲁地位授予圣典',
      templeNames: [{ name: '阿南德普尔·萨希布', nameEn: 'Anandpur Sahib', role: '卡尔萨创建之地', location: '旁遮普邦' }],
      koans: [], classicQuotes: ['当一切和平手段用尽时，拔剑而战是正义的', '认识整个人类为一个种族', '我将麻雀变成苍鹰，将豺狼变成雄狮'],
      works: [{ title: '达萨姆格兰特', description: '戈宾德·辛格的诗歌和著作集' }],
      imageUrl: null,
    },
  });

  // ── 殉道英雄 ──

  await prisma.patriarch.create({
    data: {
      name: '巴巴·迪普·辛格', nameEn: 'Baba Deep Singh', religionId: sikhismId,
      dates: '1682-1757', title: '殉道战士·头颅持剑者',
      school: '殉道英雄', generation: 1,
      biography: '巴巴·迪普·辛格（1682-1757），锡克教最传奇的殉道战士。当阿富汗入侵者亵渎金庙时，他率军反击，发誓收复圣地。战斗中被砍首，传说他一手托起自己的头颅，一手挥剑继续战斗直至抵达金庙前倒下。他的故事成为锡克教不屈精神的永恒象征。',
      coreTeaching: '保卫信仰圣地是最神圣的义务。身体可以倒下，但信念永远站立。',
      templeNames: [], koans: [],
      classicQuotes: ['我发誓——即使头颅落地，也要到达金庙'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '班达·辛格·巴哈杜尔', nameEn: 'Banda Singh Bahadur', religionId: sikhismId,
      dates: '1670-1716', title: '第一位锡克将领',
      school: '殉道英雄', generation: 1,
      biography: '班达·辛格·巴哈杜尔（1670-1716），原为印度教苦行僧，被古鲁戈宾德·辛格感召改信锡克教并委以军事重任。建立了第一个锡克政权，攻克了处决第九代古鲁的城市锡尔欣德。推行土地改革，将土地分给农民。最终被莫卧儿俘获，在拒绝改信后与七百名追随者一起殉道。',
      coreTeaching: '社会正义是信仰的实践。土地属于耕种它的人。为公义而战斗和牺牲是最高的侍奉。',
      templeNames: [], koans: [],
      classicQuotes: ['信仰给我勇气，正义给我方向'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '巴伊·马尼·辛格', nameEn: 'Bhai Mani Singh', religionId: sikhismId,
      dates: '1644-1734', title: '经典学者·殉教圣贤',
      school: '殉道英雄', generation: 2,
      biography: '巴伊·马尼·辛格（1644-1734），锡克教最重要的经典学者之一。整理和编辑了《古鲁格兰特·萨希布》和《达萨姆格兰特》。担任金庙首席祭司多年。九十岁高龄因拒绝缴纳莫卧儿帝国强加的宗教税而被逮捕，被逐个关节肢解处死，成为锡克教殉道典范。',
      coreTeaching: '经典的保存和传承是神圣使命。信仰不可被金钱赎买，真理不可被暴力压服。',
      templeNames: [], koans: [],
      classicQuotes: ['你可以砍断我的身体，但不能砍断我的信仰'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '巴伊·塔鲁·辛格', nameEn: 'Bhai Taru Singh', religionId: sikhismId,
      dates: '1720-1745', title: '头发殉道者',
      school: '殉道英雄', generation: 2,
      biography: '巴伊·塔鲁·辛格（1720-1745），年仅二十五岁的锡克教殉道者。因秘密资助锡克教抵抗运动被捕。莫卧儿总督命令他剪掉头发改信伊斯兰教。他宁死不从，头皮连同头发被活活剥离。锡克教信仰中头发是上帝的礼物，他用生命捍卫了这一信念。',
      coreTeaching: '头发是上帝的礼物和信仰的标志。宁死不辱信仰——身体的痛苦是暂时的，灵魂的尊严是永恒的。',
      templeNames: [], koans: [],
      classicQuotes: ['你可以取走我的头皮，但不能取走我的信仰'],
      works: [], imageUrl: null,
    },
  });

  // ── 学者圣人 ──

  await prisma.patriarch.create({
    data: {
      name: '巴伊·古尔达斯', nameEn: 'Bhai Gurdas', religionId: sikhismId,
      dates: '1551-1636', title: '锡克教第一学者·经文钥匙',
      school: '学者圣人', generation: 1,
      biography: '巴伊·古尔达斯（1551-1636），锡克教最重要的学者和诗人。他是古鲁阿尔詹编纂《阿迪格兰特》的首席抄写员。他自己的诗歌被古鲁阿尔詹称为"古鲁格兰特·萨希布的钥匙"——是理解圣典的最佳注释。著有40首瓦尔诗（ballads）和556首卡比特诗。',
      coreTeaching: '理解经典需要钥匙——虔诚的研读和灵性体验缺一不可。诗歌是传达神圣真理最美的形式。',
      templeNames: [], koans: [],
      classicQuotes: ['古鲁的话语如同灯塔照亮黑暗的海洋', '理解来自于虔诚，虔诚来自于实践'],
      works: [{ title: '古尔达斯瓦尔诗集', description: '40首叙事诗，理解古鲁格兰特的钥匙' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '巴巴·布达·吉', nameEn: 'Baba Buddha Ji', religionId: sikhismId,
      dates: '1506-1631', title: '五代古鲁加冕者·125岁圣者',
      school: '学者圣人', generation: 1,
      biography: '巴巴·布达·吉（1506-1631），锡克教早期最受尊崇的圣者。从古鲁那纳克到古鲁哈戈宾德，他亲自为五位古鲁主持了继位典礼。因少年时被那纳克称赞"像老人一样智慧"而得名"布达"（老者）。活到125岁，横跨了锡克教前六位古鲁的时代。',
      coreTeaching: '服务古鲁是最高的灵性修行。长寿是上帝对忠诚仆人的恩赐。见证和传承比个人成就更重要。',
      templeNames: [], koans: [],
      classicQuotes: ['我一生只做了一件事——服务古鲁'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '巴伊·马尔达那', nameEn: 'Bhai Mardana', religionId: sikhismId,
      dates: '1459-1534', title: '那纳克至友·拉巴布琴师',
      school: '学者圣人', generation: 2,
      biography: '巴伊·马尔达那（1459-1534），穆斯林音乐家，古鲁那纳克最亲密的同伴和随行者。当那纳克开始传道之旅时，马尔达那作为拉巴布琴师为他伴奏圣歌，一同跋涉数万里。他们的友谊跨越了宗教和种姓的界限，体现了锡克教"无分别"的核心精神。那纳克的许多赞歌标注"调：马尔达那拉巴布"。',
      coreTeaching: '音乐是通向神圣的桥梁。真正的友谊超越宗教和种姓。以音乐侍奉上帝是最美的祈祷。',
      templeNames: [], koans: [],
      classicQuotes: ['马尔达那，弹奏吧——上帝在聆听', '音乐让灵魂飞翔到上帝脚下'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '巴伊·南德·拉尔', nameEn: 'Bhai Nand Lal', religionId: sikhismId,
      dates: '1633-1713', title: '波斯语诗人·宫廷学者',
      school: '学者圣人', generation: 2,
      biography: '巴伊·南德·拉尔（1633-1713），锡克教最伟大的波斯语诗人，古鲁戈宾德·辛格宫廷中的杰出学者。曾在莫卧儿宫廷任职，后被戈宾德·辛格的灵性魅力吸引而成为其亲密弟子。他的波斯语和旁遮普语诗歌被视为锡克教重要的补充经典。',
      coreTeaching: '诗歌是灵性表达的最高形式。古鲁的面容是冥想的最好对象。波斯语的优雅可以承载锡克教的真理。',
      templeNames: [], koans: [],
      classicQuotes: ['古鲁的面容是我冥想的对象', '在古鲁的花园中，每朵花都散发真理的芬芳'],
      works: [{ title: '迪万-依-古鲁·戈宾德·辛格', description: '赞颂第十代古鲁的波斯语诗集' }],
      imageUrl: null,
    },
  });

  // ── 近现代领袖 ──

  await prisma.patriarch.create({
    data: {
      name: '马哈拉贾·兰吉特·辛格', nameEn: 'Maharaja Ranjit Singh', religionId: sikhismId,
      dates: '1780-1839', title: '锡克帝国之狮',
      school: '近现代领袖', generation: 1,
      biography: '马哈拉贾·兰吉特·辛格（1780-1839），被称为"旁遮普之狮"。从十二岁的少年首领崛起，统一了各锡克教米斯尔（小王国），建立了从阿富汗边境到西藏的锡克帝国。他以大理石和黄金重建了金庙，使其成为今日的辉煌面貌。他的治理以宗教宽容著称——军队和政府中印度教徒、穆斯林和欧洲人都有重要职位。',
      coreTeaching: '锡克教的力量在于团结和宗教宽容。治国以正义为本，军事强大不是为了征服而是保护。',
      templeNames: [], koans: [],
      classicQuotes: ['上帝希望我以公正对待所有宗教', '旁遮普的荣耀属于它的人民'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '巴巴·卡拉克·辛格', nameEn: 'Baba Kharak Singh', religionId: sikhismId,
      dates: '1868-1963', title: '独立运动领袖',
      school: '近现代领袖', generation: 2,
      biography: '巴巴·卡拉克·辛格（1868-1963），锡克教独立运动领袖，SGPC（锡克古尔德瓦拉管理委员会）首任主席。领导了古尔德瓦拉改革运动，将锡克教圣地从腐败的祭司阶层手中收回交由社区管理。多次入狱，是甘地之外印度独立运动中最重要的锡克教领袖。',
      coreTeaching: '圣地应由信仰社区管理，不是任何个人的私产。锡克教的政治参与是信仰实践的一部分。',
      templeNames: [], koans: [],
      classicQuotes: ['古鲁的殿堂属于古鲁的子民'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '巴伊·维尔·辛格', nameEn: 'Bhai Vir Singh', religionId: sikhismId,
      dates: '1872-1957', title: '旁遮普文学之父',
      school: '近现代领袖', generation: 2,
      biography: '巴伊·维尔·辛格（1872-1957），被誉为"旁遮普文学之父"和锡克教文艺复兴的灵魂人物。他的小说、诗歌和学术著作唤醒了锡克教的文化认同。创办了锡克教第一家出版社和报纸。注释古鲁格兰特·萨希布，使普通锡克教徒能够理解圣典的深层含义。',
      coreTeaching: '文学和教育是信仰复兴的根基。用现代语言重新讲述古鲁的故事，让每一代人都能感受信仰的活力。',
      templeNames: [], koans: [],
      classicQuotes: ['笔是最锋利的剑', '让古鲁的话语活在每一代人的语言中'],
      works: [{ title: '苏丹娜', description: '锡克教第一部旁遮普语小说' }, { title: '古鲁格兰特注释', description: '让普通信徒理解圣典' }],
      imageUrl: null,
    },
  });

  const sikhCount = 20;
  console.log(`  ✓ ${sikhCount} new Sikh gurus/figures created + 2 updated (5 schools: First5Gurus/Last5Gurus/Martyrs/Scholars/Modern)`);

  // ── 4s. 神道教神灵与思想家 (Shinto Kami & Theologians) ──
  console.log('  Creating Shinto patriarchs (4s)...');

  const shintoId = religionMap['shinto'];

  // Update existing 天照大神
  const existingAmaterasu = await prisma.patriarch.findFirst({ where: { name: '天照大神' } });
  existingAmaterasu
    ? await prisma.patriarch.update({
        where: { id: existingAmaterasu.id },
        data: {
          nameEn: 'Amaterasu', dates: '神话时代', title: '太阳女神·皇祖神',
          school: '天津神', generation: 1,
          biography: '天照大神，日本神话中最崇高的神灵，太阳女神，天皇家族的始祖神。当她因弟弟须佐之男的暴行而隐入天岩户时，世界陷入永夜。众神以舞蹈和欢笑将她引出洞穴，光明重返世间。她授予后裔三种神器——八咫镜、天丛云剑和八尺琼勾玉，命天孙降临统治苇原中国。伊势神宫是供奉她的最高圣地，每二十年式年迁宫一次。',
          coreTeaching: '光明与和谐是世界的根本。天照的隐与显象征黑暗与光明的永恒轮转。清净（清き明き心）是通向神圣的道路。',
          achievements: '皇祖神·天岩户神话·三种神器传授·日本文化精神之源',
          templeNames: [{ name: '伊势神宫', nameEn: 'Ise Grand Shrine', role: '天照大神最高圣地·二十年式年迁宫', location: '三重县伊势市' }],
          koans: [], classicQuotes: ['此面镜当作吾魂，如拜吾前般崇敬之', '天壤无穷之神勅——日本当与天地共永存'],
          works: [], imageUrl: null,
        },
      })
    : null;

  // ── 天津神 ──

  await prisma.patriarch.create({
    data: {
      name: '伊邪那岐', nameEn: 'Izanagi', religionId: shintoId,
      dates: '神话时代', title: '创世父神·国生之神',
      school: '天津神', generation: 1,
      biography: '伊邪那岐，日本神话中的创世父神。与妹妹伊邪那美共同站在天浮桥上，以天沼矛搅动混沌之海，滴落的盐水凝结成最初的岛屿。二神结合生出日本列岛和众多神灵。妻子死后追入黄泉国，见其腐烂之身后逃回阳世。在日向橘小户的阿波岐原净身时，从左眼生天照、右眼生月读、鼻中生须佐之男。',
      coreTeaching: '创造源于阴阳二神的结合。死与生的界限不可逾越。禊祓（净身洗罪）是神道教最根本的仪式——污秽可以被清水洗净。',
      templeNames: [{ name: '多贺大社', nameEn: 'Taga Taisha', role: '伊邪那岐主祭神社', location: '�的贺县' }, { name: '淡路�的�的宫', nameEn: 'Izanagi Jingu', role: '国生神话发源地', location: '淡路岛' }],
      koans: [], classicQuotes: ['生与死的境界不可混淆', '以清水洗去一切污秽——禊祓之始'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '伊邪那美', nameEn: 'Izanami', religionId: shintoId,
      dates: '神话时代', title: '创世母神·黄泉之主',
      school: '天津神', generation: 1,
      biography: '伊邪那美，日本神话中的创世母神，伊邪那岐之妻。与丈夫共同创造了日本列岛和众多神灵。在生产火神迦具土时被灼伤而死，成为黄泉国（死亡世界）之主。丈夫追入黄泉时看到她的腐烂之身，她愤怒追赶丈夫至黄泉比良坂。分别时立誓："你若如此，我每日杀你国人一千"，丈夫回应"我则每日建一千五百产屋"——由此生死循环成立。',
      coreTeaching: '死亡是自然秩序的一部分，不可逆转。生与死的对话确立了世界人口的增减法则。母性的创造力与毁灭力是同一枚硬币的两面。',
      templeNames: [{ name: '花�的�的的�的', nameEn: 'Hana no Iwaya', role: '伊邪那美葬地传说', location: '三重县熊野' }],
      koans: [], classicQuotes: ['你若如此，我每日杀你国人一千', '创造与毁灭是同一力量的不同面向'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '须佐之男', nameEn: 'Susanoo', religionId: shintoId,
      dates: '神话时代', title: '风暴之神·八岐大蛇退治者',
      school: '天津神', generation: 2,
      biography: '须佐之男（素戋呜尊），伊邪那岐鼻中所生的风暴之神。性格粗暴，在高天原大闹导致姐姐天照隐入天岩户。被放逐到出云后性格转变——拯救了即将被八岐大蛇吞噬的奇稻田姬，以智谋和勇武斩杀八头八尾的巨蛇，从其尾中取出天丛云剑。从破坏者转变为英雄和保护者，成为出云的建设者。',
      coreTeaching: '即使是最粗暴的灵魂也能实现转化。破坏与创造是同一能量的不同表现。勇气配合智慧才能战胜邪恶。',
      templeNames: [{ name: '八坂神社', nameEn: 'Yasaka Shrine', role: '须佐之男总本社', location: '京都' }, { name: '出云大社', nameEn: 'Izumo Taisha', role: '须佐之男与出云的缘起', location: '岛根县' }],
      koans: [], classicQuotes: ['八云立つ 出云八重垣 妻籠みに 八重垣つくる その八重垣を——日本最初的和歌'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '月读命', nameEn: 'Tsukuyomi', religionId: shintoId,
      dates: '神话时代', title: '月神·夜之守护者',
      school: '天津神', generation: 2,
      biography: '月读命，伊邪那岐右眼所生的月神，掌管夜之国。在日本神话中相对神秘而沉默，与姐姐天照（太阳）形成昼夜对应。据记纪载，月读因杀死食物女神保食神而被天照厌恶，从此日月不再相见——这解释了太阳和月亮为何永远不在同一天空。月读象征着月光、潮汐和夜间世界的神秘力量。',
      coreTeaching: '夜与昼、月与日是宇宙秩序的两面。沉默也是一种存在方式。月光照亮黑暗但不刺眼——温和的光明。',
      templeNames: [{ name: '月读宫', nameEn: 'Tsukiyomi-no-miya', role: '伊势神宫内宫别宮', location: '三重县伊势市' }],
      koans: [], classicQuotes: ['月光照亮夜行者的道路'],
      works: [], imageUrl: null,
    },
  });

  // ── 国津神 ──

  await prisma.patriarch.create({
    data: {
      name: '大国主命', nameEn: 'Okuninushi', religionId: shintoId,
      dates: '神话时代', title: '大地之主·国让之神',
      school: '国津神', generation: 1,
      biography: '大国主命，出云之地的统治者，须佐之男的后裔。经历了八十位兄弟的迫害和两次死亡后，在须佐之男的考验下成长为伟大的神灵。与少彦名神共同建设国土（国造り）。当天照派遣使者要求他让出国土时，大国主以"让国"（国让り）换取了出云大社的建造——日本最古老的神社。他是结缘之神，每年十月（神无月）全日本的神灵聚集到出云商议婚姻大事。',
      coreTeaching: '真正的伟大在于放下。国让——为了更大的和谐而自愿让出权力。结缘——万物的联系是宇宙的根本法则。',
      templeNames: [{ name: '出云大社', nameEn: 'Izumo Taisha', role: '大国主命主祭·日本最古神社', location: '岛根县出云市' }],
      koans: [], classicQuotes: ['我将可见的世界让给天孙，而守护看不见的世界', '缘结万物，万物有缘'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '猿田彦大神', nameEn: 'Sarutahiko', religionId: shintoId,
      dates: '神话时代', title: '道开之神·天孙降临引路者',
      school: '国津神', generation: 1,
      biography: '猿田彦大神，天孙琼琼杵尊降临苇原中国时，在天八达之�的路口迎接并引路的国津神。他鼻长七咫、身高七尺，眼睛如八咫镜般闪耀，照亮天地。他引导天孙安全降临日向的高千穗峰。此后成为道路之神和方位之神，守护旅人和新事业的开始。在伊势有专门的猿田彦神社。',
      coreTeaching: '在人生的岔路口提供正确的方向。引路者的价值不在于自身的荣耀，而在于帮助他人找到正确的道路。',
      templeNames: [{ name: '猿田彦神社', nameEn: 'Sarutahiko Shrine', role: '道开之神总本社', location: '三重县伊势市' }],
      koans: [], classicQuotes: ['我将在一切道路的起点等待，引导迷途者'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '宇迦之御魂神', nameEn: 'Uka no Mitama', religionId: shintoId,
      dates: '神话时代', title: '稻荷神·五谷丰穰',
      school: '国津神', generation: 2,
      biography: '宇迦之御魂神，稻荷神的主祭神，掌管稻米和五谷丰收。"宇迦"即食物之意。伏见稻荷大社是全日本三万余座稻荷神社的总本宫，千本�的居是其标志性景观。狐狸是稻荷神的使者，因狐狸守护稻田免受鼠害。随着时代变迁，稻荷信仰从农业丰收扩展到商业繁荣和诸愿成就，成为日本最广泛的民间信仰。',
      coreTeaching: '感恩食物——每一粒米都蕴含神圣。丰收来自于与自然的和谐共处。勤劳和感恩是获得繁荣的根本。',
      templeNames: [{ name: '伏见稻荷大社', nameEn: 'Fushimi Inari Taisha', role: '全日本稻荷神社总本宫·千本鸟居', location: '京都' }],
      koans: [], classicQuotes: ['一粒米中有七位神灵', '感恩之心召唤丰收'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '建御雷神', nameEn: 'Takemikazuchi', religionId: shintoId,
      dates: '神话时代', title: '雷神·武道之神',
      school: '国津神', generation: 2,
      biography: '建御雷神，从伊邪那岐斩杀火神迦具土的剑血中诞生的雷神。他是天照派遣到出云执行"国让"交涉的最终使者。在出云海岸将剑倒插于浪尖之上端坐，以绝对武力迫使大国主命让出国土。日本武道之祖神，�的岛神宫主祭神。春日大社也供奉他为藤原氏守护神。',
      coreTeaching: '正义需要力量来守护。武力的最高境界是不战而屈人之兵。雷霆象征神圣的决断力。',
      templeNames: [{ name: '鹿岛神宫', nameEn: 'Kashima Jingu', role: '建御雷神总本宫·武道之源', location: '茨城县鹿嶋市' }],
      koans: [], classicQuotes: ['剑插浪尖，不战而胜'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '事代主神', nameEn: 'Kotoshironushi', religionId: shintoId,
      dates: '神话时代', title: '惠比须·商业之神',
      school: '国津神', generation: 2,
      biography: '事代主神，大国主命之子。在国让事件中，他在美保之崎钓鱼时被建御雷神询问是否同意让国，他以青柴垣隐身后答应让出国土。后被视为惠比须（七福神之一），成为渔业和商业的守护神。他微笑抱鲷鱼的形象是日本最广为人知的福神之一。',
      coreTeaching: '顺应大势而行，不逆天时。渔业和商业的繁荣来自于对自然规律的尊重和乐观的心态。微笑迎接每一天。',
      templeNames: [{ name: '美保神社', nameEn: 'Miho Shrine', role: '事代主神总本宫', location: '岛根县松江市' }],
      koans: [], classicQuotes: ['微笑是最好的祈祷', '钓鱼需要耐心，经商需要诚信'],
      works: [], imageUrl: null,
    },
  });

  // ── 神社创建者 ──

  await prisma.patriarch.create({
    data: {
      name: '倭姬命', nameEn: 'Yamatohime-no-mikoto', religionId: shintoId,
      dates: '垂仁朝', title: '初代斎宮·伊势神宫创建者',
      school: '神社创建者', generation: 1,
      biography: '倭姬命，垂仁天皇之女，第一代斎宮。受天皇之命为天照大神寻找永久的奉斎之地。她携带八咫镜，从大和出发历经二十余年、巡行近畿到东海的诸多地方。最终在伊势五十铃川畔，天照大神托梦说"此地清净安宁，是吾所愿之地"。于是在此建立了伊势神宫，开创了延续两千年的祭祀传统。',
      coreTeaching: '寻找神圣之地需要耐心和虔诚。天照的居所由天照自己选定——人不能强制安排神圣。',
      templeNames: [{ name: '伊势神宫', nameEn: 'Ise Grand Shrine', role: '倭姬命创建·天照奉斎之地', location: '三重县伊势市' }],
      koans: [], classicQuotes: ['此地清净安宁，是吾所愿之地'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '秦氏族', nameEn: 'Hata Clan', religionId: shintoId,
      dates: '7世纪', title: '伏见稻荷大社创建者',
      school: '神社创建者', generation: 2,
      biography: '秦氏族，日本古代有力的渡来系氏族，据传源自秦朝遗民。奈良时代在山城国深草建立伏见稻荷大社（711年），供奉稻荷神以祈求丰收。秦氏精于养蚕和机织，带来大陆先进技术。他们创建的伏见稻荷大社后来成为全日本三万余座稻荷神社的总本宫，千本鸟居闻名世界。',
      coreTeaching: '技术与信仰并行。渡来人带来新文化，稻荷信仰将农业生产与神灵感恩结合，形成日本最深入民间的信仰形态。',
      templeNames: [{ name: '伏见稻荷大社', nameEn: 'Fushimi Inari Taisha', role: '秦氏创建·稲荷総本宮', location: '京都市伏见区' }],
      koans: [], classicQuotes: ['稻荷山上鸟居千座，通向神圣的道路不止一条'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '藤原不比等', nameEn: 'Fujiwara no Fuhito', religionId: shintoId,
      dates: '659-720', title: '春日大社创建者·律令国家设计师',
      school: '神社创建者', generation: 2,
      biography: '藤原不比等（659-720），藤原�的足之子，日本律令国家的实际设计师。主导编纂了大宝律令和养老律令，确立了日本中央集权体制。为藤原氏族创建了春日大社，将武甕槌命从鹿岛请来作为氏族守护神，白鹿是其神使。春日大社后成为日本最重要的神社之一。',
      coreTeaching: '国家秩序与神灵秩序相互对应。氏族的繁荣需要祖灵的护佑，而祭祀的虔诚换来神灵的恩惠。',
      templeNames: [{ name: '春日大社', nameEn: 'Kasuga Taisha', role: '藤原氏創建·奈良世界遺産', location: '奈良市' }],
      koans: [], classicQuotes: ['律令定秩序，祭祀安天下'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '行基', nameEn: 'Gyōki', religionId: shintoId,
      dates: '668-749', title: '大僧正·东大寺建立功臣',
      school: '神社创建者', generation: 3,
      biography: '行基（668-749），奈良时代日本最受民众爱戴的僧侣。突破寺院围墙走入民间，建造桥梁、道路、灌溉设施和四十九座寺院布教所。起初被朝廷视为扰乱秩序而禁止，后因其巨大的民间声望被任命为日本第一位大僧正。他是圣武天皇建造东大寺大佛的最重要协力者，体现了神佛习合的精神。',
      coreTeaching: '佛法不在寺院中而在民间。修桥铺路就是修行，利益众生就是佛道。神佛一体，寺社无别。',
      templeNames: [{ name: '东大寺', nameEn: 'Todai-ji', role: '行基协力建造·奈良大佛', location: '奈良市' }],
      koans: [], classicQuotes: ['修一座桥等于诵一万卷经'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '空海', nameEn: 'Kūkai', religionId: shintoId,
      dates: '774-835', title: '弘法大师·神佛习合',
      school: '神社创建者', generation: 3,
      biography: '空海（774-835），法号遍照金刚，谥号弘法大师。入唐求法，师从青龙寺惠果阿阇梨，将真言密教完整传入日本。在高野山开创了真言宗总本山。他提出"本地垂迹说"——日本的神灵是佛菩萨的化身——确立了神佛习合的理论基础。创制片假名、发明五十音图、建立综合大学（种智院）。被视为日本文化史上最伟大的天才。',
      coreTeaching: '即身成佛——此生此身即可证悟。本地垂迹——神与佛本质一体，形式不同。三密加持——身口意与佛合一。',
      templeNames: [{ name: '高野山', nameEn: 'Koyasan', role: '空海创建·真言宗总本山', location: '和歌山县' }],
      koans: [], classicQuotes: ['虚空尽，众生尽，涅槃尽，我愿乃尽', '阿字本不生——一切法无始无终'],
      works: [{ title: '三教指归', description: '比较儒道佛三教的青年著作' }, { title: '十住心论', description: '十个心灵阶段的密教体系' }],
      imageUrl: null,
    },
  });

  // ── 神道思想家 ──

  await prisma.patriarch.create({
    data: {
      name: '度会行忠', nameEn: 'Watarai Yukitada', religionId: shintoId,
      dates: '13世纪', title: '伊势神道·外宫神学创始人',
      school: '神道思想家', generation: 1,
      biography: '度会行忠（13世纪），伊势神宫外宫的祠官家族成员。他创立了伊势神道（度会神道），主张外宮祭神丰受大神的地位等于甚至高于内宫的天照大神。这是日本第一次从佛教中独立出来的纯粹神道理论体系。他强调"清净"作为神道的本质，将神道从佛教的附庸地位中解放出来。',
      coreTeaching: '清净是神道的本质——身体的清净、心灵的清净、行为的清净。神道有自身独立的理论体系，不是佛教的附属。',
      templeNames: [{ name: '伊势外宫', nameEn: 'Ise Outer Shrine (Geku)', role: '度会氏世代奉仕之地', location: '三重县伊势市' }],
      koans: [], classicQuotes: ['清净是神道之本', '神之道，清明正直'],
      works: [{ title: '类聚神祇本源', description: '伊势神道理论根本著作' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '吉田兼倶', nameEn: 'Yoshida Kanetomo', religionId: shintoId,
      dates: '1435-1511', title: '吉田神道·唯一神道创始人',
      school: '神道思想家', generation: 2,
      biography: '吉田兼倶（1435-1511），吉田神社神官，创立了"唯一神道"（吉田神道）。他颠覆了本地垂迹说，主张佛菩萨反而是日本神灵的化身。在应仁之乱后的混乱中获得朝廷支持，使吉田神道成为室町时代最有影响力的神道体系。他建立了神道教的独立教义、仪式和组织体系。',
      coreTeaching: '唯一神道——万物的根源是神道，佛教和儒教都源于神道。神灵是本源，佛菩萨是末流。日本是神之国。',
      templeNames: [{ name: '吉田神社', nameEn: 'Yoshida Shrine', role: '吉田神道总本社', location: '京都市左京区' }],
      koans: [], classicQuotes: ['神道是万道之根源', '神在万物之先，万物在神之中'],
      works: [{ title: '唯一神道名法要集', description: '吉田神道教义体系' }],
      imageUrl: null,
    },
  });

  const kamoMabuchi = await prisma.patriarch.create({
    data: {
      name: '贺茂真渕', nameEn: 'Kamo no Mabuchi', religionId: shintoId,
      dates: '1697-1769', title: '国学先驱·万叶回归',
      school: '神道思想家', generation: 3,
      biography: '贺茂真渕（1697-1769），国学运动先驱。他主张回归万叶集时代日本人的"真心"（まごころ）和"高く直き心"，认为中国思想（儒学和佛教）扭曲了日本的本来精神。通过对万叶集的深入研究，他展示了古代日本人质朴、勇武而纯真的精神世界。他的学说为后来本居宣长的国学大成奠定了基础。',
      coreTeaching: '回归日本古代的"真心"——万叶集的质朴和直率就是日本精神的本来面目。中国思想是后来添加的外来物。',
      templeNames: [], koans: [],
      classicQuotes: ['日本古代的道，高而直——不需要中国的教导', '万叶集中有日本真正的心'],
      works: [{ title: '万叶考', description: '万叶集研究·国学方法论奠基' }],
      imageUrl: null,
    },
  });

  const motooriNorinaga = await prisma.patriarch.create({
    data: {
      name: '本居宣长', nameEn: 'Motoori Norinaga', religionId: shintoId,
      dates: '1730-1801', title: '国学大成者·物之哀',
      school: '神道思想家', generation: 4, teacherId: kamoMabuchi.id,
      biography: '本居宣长（1730-1801），日本国学运动的最高峰。三十四年研究《古事记》，著《古事记传》四十四卷，将这部日本最古老的史书从默默无闻提升到与中国经典并立的地位。提出"物之哀"（もののあわれ）美学理论：对万物变化的深切感动是日本文化的本质。主张排除一切外来思想，回归古神道的纯粹。',
      coreTeaching: '物之哀——对万物无常的深切感动是人类最纯真的情感反应。古事记是日本的圣经。大和心高于汉意。',
      templeNames: [{ name: '本居宣长记念馆', nameEn: 'Motoori Norinaga Memorial Museum', role: '国学大成者纪念地', location: '三重县松阪市' }],
      koans: [], classicQuotes: ['敷岛の大和心を人問はば 朝日ににほふ 山桜花', '知物之哀者，方知人情之深'],
      works: [{ title: '古事记传', description: '四十四卷·日本最古史书的完整注释' }, { title: '源氏物语玉小�的', description: '物之哀美学理论' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '平田笃胤', nameEn: 'Hirata Atsutane', religionId: shintoId,
      dates: '1776-1843', title: '复古神道·幽冥界研究者',
      school: '神道思想家', generation: 5, teacherId: motooriNorinaga.id,
      biography: '平田笃胤（1776-1843），国学四大人之一，复古神道的集大成者。自称本居宣长的私淑弟子。他将国学研究扩展到死后世界（幽冥界），主张日本人死后灵魂归于大国主命管辖的幽冥之国。他的"复古"主张影响了幕末的尊王攘夷运动，间接推动了明治维新。门下弟子遍布日本。',
      coreTeaching: '日本人的灵魂死后归于幽冥之国，在大国主命的统治下继续存在。复古神道——恢复日本天皇神权统治的古代理想。',
      templeNames: [], koans: [],
      classicQuotes: ['幽冥之国是灵魂的归处', '日本是神国——天皇是天照的子孙'],
      works: [{ title: '灵能真柱', description: '幽冥界（死后世界）研究' }, { title: '古道大意', description: '复古神道理论总纲' }],
      imageUrl: null,
    },
  });

  // ── 教派神道 ──

  await prisma.patriarch.create({
    data: {
      name: '�的住宗忠', nameEn: 'Kurozumi Munetada', religionId: shintoId,
      dates: '1780-1850', title: '黑住教教祖·天照直受',
      school: '教派神道', generation: 1,
      biography: '黑住宗忠（1780-1850），冈山神社神官。在双亲去世后陷入重病濒死，1814年冬至日朝向太阳祈祷时，突然体验到与天照大神合一的神秘体验——"天命直授"。此后痊愈并开始传道，创立黑住教，是日本教派神道十三教之首。他以"日拜"和感恩祈祷为核心修行，强调阳气和积极的生活态度。',
      coreTeaching: '天照大神的阳气充满天地。每日面向太阳祈祷（日拜），以感恩和喜悦的心接受天照的生命力。阳气治百病。',
      templeNames: [{ name: '黑住教本部', nameEn: 'Kurozumikyo Headquarters', role: '教祖创教之地', location: '冈山市' }],
      koans: [], classicQuotes: ['天照大神的心就是我的心', '感恩是通向天照的最短之路'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '中山美伎', nameEn: 'Nakayama Miki', religionId: shintoId,
      dates: '1798-1887', title: '天理教教祖·阳气暮らし',
      school: '教派神道', generation: 1,
      biography: '中山美伎（1798-1887），天理教教祖。1838年在为长子祈病的驱邪仪式中，突然被"天理王命"（月日亲神）附体，宣布"我是宇宙创造之神"。此后散尽家财，过着极端贫穷的生活传播教义。她的核心教导是"阳气暮らし"——以欢喜快乐的心态生活。创作了"御�的"（手舞歌），至今为天理教的核心仪式。活至八十九岁。',
      coreTeaching: '阳気暮らし——欢喜快乐地生活是神创造人类的目的。身体是神的借贷物，疾病是神提醒人反省的信号。',
      templeNames: [{ name: '天理教本部', nameEn: 'Tenrikyo Church Headquarters', role: '教祖传道之地·创世圣地', location: '奈良县天理市' }],
      koans: [], classicQuotes: ['世界是欢喜的，人是欢喜的，一切是欢喜的', '身体是神的借贷物，要好好珍惜'],
      works: [{ title: '御笔先', description: '天理王命的圣谕记录' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '川手文治郎', nameEn: 'Kawate Bunjiro', religionId: shintoId,
      dates: '1814-1883', title: '金光教教祖·天地金乃神',
      school: '教派神道', generation: 2,
      biography: '川手文治郎（1814-1883），金光教教祖。冈山农民出身，四十二岁时体验到与"天地金乃神"的直接对话。他打破了传统金神信仰中的恐惧和禁忌，将金神从可怕的方位凶神转化为慈悲的宇宙本神。他的传道方式是"取次"——坐在社殿中作为人与神之间的中介，倾听信徒的烦恼并传达神的回应。',
      coreTeaching: '神与人是相互依存的——"神让人活，人让神灵"。取次（中介）——神与人之间需要真诚的沟通渠道。一切迷信和恐惧皆非真神之意。',
      templeNames: [{ name: '金光教本部', nameEn: 'Konkokyo Headquarters', role: '教祖取次之地', location: '冈山县浅口市' }],
      koans: [], classicQuotes: ['神让人活，人让神灵', '不要怕金神——神是慈悲的'],
      works: [], imageUrl: null,
    },
  });

  const deguchiNao = await prisma.patriarch.create({
    data: {
      name: '出口直', nameEn: 'Deguchi Nao', religionId: shintoId,
      dates: '1837-1918', title: '大本教开祖·筆先',
      school: '教派神道', generation: 2,
      biography: '出口直（1837-1918），大本教开祖。绫部贫穷的寡妇，五十六岁时突然被"�的之大神"附体，开始以平假名写下大量的"筆先"（神谕）。她不识字但能写出数万页神谕，预言世界即将经历"立替え立直し"（破坏与重建）。她的预言和治病能力吸引了大量信众，但也多次被当局逮捕。',
      coreTeaching: '世界将经历大清洗（立替え立直し）——现有的不义秩序将被推翻，神的理想世界将被建立。回归农耕的纯朴生活。',
      templeNames: [{ name: '大本教本部', nameEn: 'Oomoto Headquarters', role: '出口直开教之地', location: '京都府綾部市' }],
      koans: [], classicQuotes: ['三千世界一度に開く梅の花', '立替え立直し——旧世界必须被推翻'],
      works: [{ title: '筆先', description: '数万页的神谕·大本教根本经典' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '出口王仁三郎', nameEn: 'Deguchi Onisaburo', religionId: shintoId,
      dates: '1871-1948', title: '大本教圣师·霊界物語',
      school: '教派神道', generation: 3, teacherId: deguchiNao.id,
      biography: '出口王仁三郎（1871-1948），大本教圣师，出口直的女婿。他将出口直的素朴信仰发展为宏大的宇宙观和神学体系。口述八十一卷《霊界物語》——日本近代最庞大的宗教文学作品。推动世界宗教统一运动，主张万教归一。两次被日本政府镇压（大本事件），建筑被炸毁。他的弟子创立了世界救世教、生长之家等新兴宗教。',
      coreTeaching: '万教归一——所有宗教都是同一真理的不同表达。灵界与现界相互影响。艺术（陶艺、书画）是灵性修行的形式。',
      templeNames: [{ name: '龟冈大本教本部', nameEn: 'Oomoto Kameoka HQ', role: '圣师活动中心', location: '京都府亀岡市' }],
      koans: [], classicQuotes: ['万教同根——一切宗教都通向同一个源头', '艺术即信仰，信仰即艺术'],
      works: [{ title: '霊界物語', description: '八十一卷·日本近代最庞大的宗教文学' }],
      imageUrl: null,
    },
  });

  const shintoCount = 24;
  console.log(`  ✓ ${shintoCount} new Shinto kami/figures created + 1 updated (5 schools: CelestialKami/EarthlyKami/ShrineFounders/Theologians/Sectarian)`);

  // ── 4t. 藏传佛教大师 (Tibetan Buddhist Masters) ──
  console.log('  Creating Tibetan Buddhist patriarchs (4t)...');

  const tibetanBuddhismId = religionMap['tibetan-buddhism'];

  // Update existing 莲花生大士
  const existingPadma = await prisma.patriarch.findFirst({ where: { name: '莲花生大士' } });
  existingPadma
    ? await prisma.patriarch.update({
        where: { id: existingPadma.id },
        data: {
          nameEn: 'Padmasambhava', dates: '8世纪', title: '咕噜仁波切·藏传佛教开创者',
          school: '宁玛派', generation: 1,
          biography: '莲花生大士（8世纪），藏文称"咕噜仁波切"（珍宝上师），藏传佛教的开创者。出生于乌仗那（今巴基斯坦斯瓦特河谷）的莲花中。受藏王赤松德赞迎请入藏，以密法降伏了阻碍佛法传播的本土神灵，建立了西藏第一座佛寺桑耶寺。他将无数教法隐藏为伏藏（terma），由后世伏藏师发掘。藏族人视他为"第二佛陀"，在藏传佛教中的地位仅次于释迦牟尼。',
          coreTeaching: '大圆满（Dzogchen）——心的本来面目是佛性，本来清净，本自圆满。修行不是获得什么，而是认出本来面目。',
          achievements: '降伏本土神灵·建立桑耶寺·开创藏传佛教·埋藏无数伏藏',
          templeNames: [{ name: '桑耶寺', nameEn: 'Samye Monastery', role: '西藏第一座佛寺·莲师建立', location: '西藏山南' }],
          koans: [], classicQuotes: ['我的心与佛无别，但我未认出它', '当一切念头消融，本来面目自然显现', '我从未离开有信心的人'],
          works: [], imageUrl: null,
        },
      })
    : null;

  // Update existing 阿底峡尊者
  const existingAtisha = await prisma.patriarch.findFirst({ where: { name: '阿底峡尊者' } });
  existingAtisha
    ? await prisma.patriarch.update({
        where: { id: existingAtisha.id },
        data: {
          nameEn: 'Atisha', dates: '982-1054', title: '吉祥燃灯智·噶当派祖师',
          school: '格鲁派', generation: 0,
          biography: '阿底峡（982-1054），全名吉祥燃灯智，孟加拉超戒寺最尊贵的学者。应藏王智光之邀入藏弘法，以生命为代价（智光为筹措邀请费用被噶尔禄人俘虏并殉身）。著《菩提道灯论》确立了从初发心到成佛的完整修行次第，成为后世宗喀巴《菩提道次第广论》的蓝本。创立噶当派，强调戒律清净和次第修行。',
          coreTeaching: '菩提道次第——从下士道（人天善趣）到中士道（出离心）到上士道（菩提心），循序渐进走向觉悟。',
          templeNames: [{ name: '聂塘寺', nameEn: 'Nyethang Monastery', role: '阿底峡晚年驻锡·圆寂之地', location: '拉萨附近' }],
          koans: [], classicQuotes: ['所有功德的根本是善知识', '此身难得如优昙花，莫空过此生', '菩提心是一切佛法的心要'],
          works: [{ title: '菩提道灯论', description: '修行次第根本论著·宗喀巴道次第的蓝本' }],
          imageUrl: null,
        },
      })
    : null;

  // Update existing 宗喀巴大师
  const existingTsongkhapa = await prisma.patriarch.findFirst({ where: { name: '宗喀巴大师' } });
  const tsongkhapa = existingTsongkhapa
    ? await prisma.patriarch.update({
        where: { id: existingTsongkhapa.id },
        data: {
          nameEn: 'Tsongkhapa', dates: '1357-1419', title: '第二佛陀·格鲁派创始人',
          school: '格鲁派', generation: 1,
          biography: '宗喀巴（1357-1419），青海宗喀出生，藏传佛教格鲁派（黄教）创始人，被尊为"第二佛陀"。他综合了印度中观和瑜伽行的精华，著《菩提道次第广论》和《密宗道次第广论》，建立了从显教到密教的完整修行体系。1409年创建甘丹寺和大愿法会。他强调戒律清净，要求僧人严持戒律、深研经论，扭转了当时藏区松弛的修行风气。',
          coreTeaching: '戒定慧三学并重——以戒律为根基，以中观正见为核心，显密圆融，次第修行。缘起性空是佛法的最深真理。',
          achievements: '创立格鲁派·著菩提道次第广论·建甘丹寺·创大愿法会',
          templeNames: [{ name: '甘丹寺', nameEn: 'Ganden Monastery', role: '格鲁派第一座寺院·宗喀巴创建', location: '拉萨达孜区' }],
          koans: [], classicQuotes: ['缘起即性空，性空即缘起', '一切功德依赖于善知识', '戒律是一切功德的根基'],
          works: [{ title: '菩提道次第广论', description: '显教修行次第完整体系' }, { title: '密宗道次第广论', description: '密教修行次第完整体系' }],
          imageUrl: null,
        },
      })
    : null;

  // ── 宁玛派 ──

  await prisma.patriarch.create({
    data: {
      name: '龙钦巴', nameEn: 'Longchenpa', religionId: tibetanBuddhismId,
      dates: '1308-1364', title: '法界藏智者·七宝藏论',
      school: '宁玛派', generation: 2,
      biography: '龙钦巴（1308-1364），全名龙钦饶降巴，宁玛派最伟大的学者和大圆满大师。他综合了宁玛派所有教法，著"七宝藏论"等三百余部著作。长年在冈日托嘎等山洞中苦修。他的著作将大圆满教法从口耳相传提升为完整的哲学体系，被尊为"一切智者之王"。',
      coreTeaching: '大圆满——心的本性（法界）本来清净、本自圆满。无需造作，只需认出。一切显现都是法身的游戏。',
      templeNames: [{ name: '冈日托嘎', nameEn: 'Gangri Tokar', role: '龙钦巴苦修洞穴', location: '不丹' }],
      koans: [], classicQuotes: ['当你不再寻找，你已找到', '心的本性如同虚空——无中心、无边际', '一切法如梦幻泡影'],
      works: [{ title: '七宝藏论', description: '大圆满教法系统化·宁玛派哲学巅峰' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '吉美林巴', nameEn: 'Jigme Lingpa', religionId: tibetanBuddhismId,
      dates: '1730-1798', title: '龙钦心髓伏藏师',
      school: '宁玛派', generation: 3,
      biography: '吉美林巴（1730-1798），宁玛派最重要的伏藏师之一。在三年闭关中，三次获得龙钦巴的智慧身加持，发掘了"龙钦心髓"（Longchen Nyingthig）——大圆满最核心的修行法门。此法脉成为宁玛派最广泛传修的传承。他的弟子将教法传播到整个藏区和不丹。',
      coreTeaching: '龙钦心髓——大圆满前行和正行的完整修法。通过彻却（立断）和托噶（顿超）认出心的本来面目，证悟法身。',
      templeNames: [], koans: [],
      classicQuotes: ['龙钦巴在虚空中微笑，将智慧注入我心', '心不可得，却无处不在'],
      works: [{ title: '龙钦心髓', description: '大圆满核心修行法门·宁玛派最广传法脉' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '米旁仁波切', nameEn: 'Mipham Rinpoche', religionId: tibetanBuddhismId,
      dates: '1846-1912', title: '宁玛复兴·文殊化身',
      school: '宁玛派', generation: 4,
      biography: '米旁仁波切（1846-1912），被视为文殊菩萨化身。他是19世纪宁玛派最杰出的学者，著述涵盖哲学、逻辑、诗学、医学、天文和占卜等领域三十余卷。他在中观、因明和密续方面的注释使宁玛派在学术上与格鲁派分庭抗礼。是利美运动的重要推动者。',
      coreTeaching: '中观他空见——如来藏是真实的、光明的、永恒的智慧本体。空性不是虚无，而是充满佛性光明。',
      templeNames: [], koans: [],
      classicQuotes: ['空性不是虚无，它充满了智慧的光明', '一切众生本来是佛，只因妄念而不证'],
      works: [{ title: '入智者门', description: '佛教哲学综合入门' }, { title: '中观庄严论释', description: '宁玛派中观最重要论著' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '顶果钦哲仁波切', nameEn: 'Dilgo Khyentse Rinpoche', religionId: tibetanBuddhismId,
      dates: '1910-1991', title: '利美圆满大师',
      school: '宁玛派', generation: 5,
      biography: '顶果钦哲仁波切（1910-1991），20世纪最伟大的藏传佛教大师之一。他是蒋扬钦哲旺波的转世之一，持有藏传佛教所有四大教派的完整传承。在山洞中闭关修行超过二十年。流亡后在不丹重建传承，成为不丹王室和第十四世达赖喇嘛的上师。他体现了利美（无偏见）运动的圆满精神。',
      coreTeaching: '修行的核心是慈悲和智慧的双运。不要执著于教派之分。每一个念头都是修行的机会。安住于心的本然中。',
      templeNames: [{ name: '雪谦寺', nameEn: 'Shechen Monastery', role: '顶果钦哲驻锡·尼泊尔重建', location: '尼泊尔加德满都' }],
      koans: [], classicQuotes: ['你不需要到远方去寻找佛，佛就在你心中', '每一个念头生起的刹那，都是觉醒的机会', '慈悲是佛法的本质'],
      works: [{ title: '你可以更慈悲', description: '入菩萨行论注释·畅销全球' }],
      imageUrl: null,
    },
  });

  // ── 噶举派 ──

  const marpa = await prisma.patriarch.create({
    data: {
      name: '玛尔巴译师', nameEn: 'Marpa the Translator', religionId: tibetanBuddhismId,
      dates: '1012-1097', title: '噶举传承之祖·大译师',
      school: '噶举派', generation: 1,
      biography: '玛尔巴（1012-1097），噶举派的创始人，三次赴印度求法，师从那洛巴等大成就者。他将那洛六法和大手印教法完整带回西藏。身为在家居士，从事农业和翻译工作，证明了在世俗生活中同样可以获得最高证悟。对弟子密勒日巴的严厉调教成为藏传佛教师徒关系的典范。',
      coreTeaching: '大手印——直接认出心的本性。世俗生活本身就是修行道场。上师的加持是证悟最快的途径。那洛六法是即身成佛之道。',
      templeNames: [{ name: '洛扎克', nameEn: 'Lhodrak', role: '玛尔巴故乡与修行地', location: '西藏山南' }],
      koans: [], classicQuotes: ['我的儿子，你所受的苦不是惩罚，而是净化', '在田地里耕作时，佛法就在脚下'],
      works: [], imageUrl: null,
    },
  });

  const milarepa = await prisma.patriarch.create({
    data: {
      name: '密勒日巴', nameEn: 'Milarepa', religionId: tibetanBuddhismId,
      dates: '1052-1135', title: '苦行成就者·十万歌集',
      school: '噶举派', generation: 2, teacherId: marpa.id,
      biography: '密勒日巴（1052-1135），藏传佛教最传奇的人物。年轻时为报家仇学习黑咒术杀死三十五人，后因忏悔拜入玛尔巴门下。经历了建塔又拆、九层拆建的极端苦行考验，业障清净后获得口诀。此后在雪山洞穴中独自修行多年，仅以荨麻为食，皮肤变绿。最终证得大手印虹光身。他即兴吟唱的十万首道歌是藏族文学瑰宝。',
      coreTeaching: '即使造了最重的恶业，也可以在一生中获得完全的觉悟。苦行净化业障。上师的口诀胜过千卷经典。',
      templeNames: [{ name: '拉其雪山洞', nameEn: 'Lapchi Cave', role: '密勒日巴苦修洞穴', location: '西藏与尼泊尔边境' }],
      koans: [], classicQuotes: ['我是一个杀了三十五人的罪人，也能成佛——你还有什么借口？', '若不修行，得此人身有何用？', '山洞是我的宫殿，荨麻是我的美食'],
      works: [{ title: '密勒日巴十万歌集', description: '即兴道歌·藏族文学瑰宝' }],
      imageUrl: null,
    },
  });

  const gampopa = await prisma.patriarch.create({
    data: {
      name: '冈波巴', nameEn: 'Gampopa', religionId: tibetanBuddhismId,
      dates: '1079-1153', title: '达波噶举创始人·解脱庄严论',
      school: '噶举派', generation: 3, teacherId: milarepa.id,
      biography: '冈波巴（1079-1153），原为医生和噶当派僧人，因梦中指引找到密勒日巴。他将噶当派的次第修行与密勒日巴的大手印法门融合，著《解脱庄严论》，建立了达波噶举的完整修行体系。四大弟子开创了噶举派四大支流。他的《解脱庄严论》是噶举派最重要的入门经典。',
      coreTeaching: '将学院派的系统学习与瑜伽士的实修经验融合。解脱不只靠禅定，也需要闻思智慧。菩提心是一切修行的根基。',
      templeNames: [{ name: '达拉冈波寺', nameEn: 'Daklha Gampo', role: '冈波巴创建·达波噶举根本道场', location: '西藏' }],
      koans: [], classicQuotes: ['如珍宝人身难得，如死亡无常迅速', '不要在见到上师前就以为自己懂了'],
      works: [{ title: '解脱庄严论', description: '噶举派入门经典·显密融合修行次第' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '第一世噶玛巴·杜松虔巴', nameEn: 'Düsum Khyenpa', religionId: tibetanBuddhismId,
      dates: '1110-1193', title: '第一位转世活佛',
      school: '噶举派', generation: 4, teacherId: gampopa.id,
      biography: '杜松虔巴（1110-1193），冈波巴最杰出的弟子，噶玛噶举派创始人，也是藏传佛教转世活佛制度的开创者。他在五十岁时证悟大手印，建立了楚布寺作为噶玛巴驻锡地。他预言自己将转世回来继续弘法——第二世噶玛巴噶玛拔希的出现开创了转世制度，后被达赖、班禅等活佛系统效仿。',
      coreTeaching: '大手印——心的本性超越生死，转世是菩萨利益众生的方便。觉悟不是一次性事件，而是持续的愿力。',
      templeNames: [{ name: '楚布寺', nameEn: 'Tsurphu Monastery', role: '噶玛巴驻锡地·噶玛噶举根本寺', location: '西藏拉萨' }],
      koans: [], classicQuotes: ['我将再来', '心无生灭，何来死亡？'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '第八世噶玛巴·米觉多杰', nameEn: 'Mikyö Dorje', religionId: tibetanBuddhismId,
      dates: '1507-1554', title: '噶举中观大成就者',
      school: '噶举派', generation: 5,
      biography: '米觉多杰（1507-1554），第八世噶玛巴，噶举派历史上最博学的噶玛巴。著述一百余卷，涵盖中观、因明、密续和艺术。他在中观哲学上提出了独到见解，与格鲁派进行了深入的学术辩论。他也是杰出的艺术家，创立了噶玛嘎孜画派——藏传佛教艺术的重要流派。',
      coreTeaching: '他空中观——如来藏是真实的智慧光明体，不是空无。艺术是修行的表达，佛像绘画是对觉悟的视觉冥想。',
      templeNames: [{ name: '楚布寺', nameEn: 'Tsurphu Monastery', role: '噶玛巴驻锡地', location: '西藏拉萨' }],
      koans: [], classicQuotes: ['空性不是断灭，而是智慧的光明', '绘制佛像时，画师的心就是佛心'],
      works: [{ title: '中观论著', description: '噶举派中观哲学独立体系' }],
      imageUrl: null,
    },
  });

  // ── 萨迦派 ──

  await prisma.patriarch.create({
    data: {
      name: '昆·贡却杰波', nameEn: 'Khon Konchog Gyalpo', religionId: tibetanBuddhismId,
      dates: '1034-1102', title: '萨迦派创始人',
      school: '萨迦派', generation: 1,
      biography: '昆·贡却杰波（1034-1102），萨迦派创始人。出身昆氏家族，这个家族自莲花生大士时代就是西藏最重要的佛法传承家族之一。1073年在萨迦建立了萨迦寺（灰白色土地之寺），以道果法为核心教法。开创了家族传承与寺院制度结合的独特模式。',
      coreTeaching: '道果法（Lamdré）——轮回和涅槃不二，因是基位心的本性，道是修行的方便，果是证悟的佛位。',
      templeNames: [{ name: '萨迦寺', nameEn: 'Sakya Monastery', role: '萨迦派根本道场', location: '西藏日喀则萨迦县' }],
      koans: [], classicQuotes: ['灰白色的土地上建起法的宫殿'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '萨迦班智达', nameEn: 'Sakya Pandita', religionId: tibetanBuddhismId,
      dates: '1182-1251', title: '喜马拉雅最伟大学者',
      school: '萨迦派', generation: 2,
      biography: '萨迦班智达（1182-1251），全名贡噶坚赞，被誉为"喜马拉雅最伟大的学者"。精通五明（声明、因明、医明、工巧明、内明），在印度与外道辩论获胜。1247年应蒙古阔端王子之邀前往凉州会谈，促成西藏和平归入蒙古帝国，避免了战争屠杀。他以智慧和外交拯救了整个民族。',
      coreTeaching: '学问是解脱的基础。因明逻辑不与佛法矛盾，而是证悟的辅助。以智慧而非武力解决冲突。',
      templeNames: [{ name: '萨迦寺', nameEn: 'Sakya Monastery', role: '萨迦派传承中心', location: '西藏日喀则' }],
      koans: [], classicQuotes: ['智者如水，流向最低处却滋养万物', '无知是一切痛苦的根源'],
      works: [{ title: '萨迦格言', description: '藏族最著名的格言集·智慧文学经典' }, { title: '量理宝藏', description: '因明逻辑巨著' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '八思巴', nameEn: 'Drogön Chögyal Phagpa', religionId: tibetanBuddhismId,
      dates: '1235-1280', title: '元朝国师·八思巴文创制者',
      school: '萨迦派', generation: 3,
      biography: '八思巴（1235-1280），萨迦班智达的侄子和继承人。十九岁被忽必烈册封为国师，后升为帝师，是元朝最高宗教领袖。创制了八思巴文——一种用于书写蒙古语、汉语、藏语等多种语言的统一文字。他建立了由喇嘛管理西藏政教事务的制度，对藏区政治格局影响深远。',
      coreTeaching: '佛法可以治理国家——政教合一不是权力垄断，而是以佛法的慈悲和智慧指导政治。文字统一促进文明交流。',
      templeNames: [{ name: '萨迦寺北寺', nameEn: 'Sakya North Monastery', role: '八思巴扩建', location: '西藏日喀则' }],
      koans: [], classicQuotes: ['以法治国，以慈悲待民', '文字是文明的载体，统一文字统一天下'],
      works: [{ title: '八思巴文', description: '元朝统一文字·联合国教科文组织认定' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '果然巴', nameEn: 'Gorampa', religionId: tibetanBuddhismId,
      dates: '1429-1489', title: '萨迦中观哲学家',
      school: '萨迦派', generation: 4,
      biography: '果然巴（1429-1489），萨迦派最重要的中观哲学家。他对宗喀巴的中观诠释提出了系统性的批评，主张真正的中观应该超越一切概念分别——包括"空性"这个概念本身。他的批评促进了格鲁派与萨迦派之间深入的哲学对话，推动了藏传佛教哲学的发展。',
      coreTeaching: '中观不是任何一种见解——包括"一切皆空"也要超越。真正的空性超越言说和概念。执著于空也是执著。',
      templeNames: [], koans: [],
      classicQuotes: ['执空也是执著', '中道不在两边，也不在中间'],
      works: [{ title: '辨了不了义善说', description: '对宗喀巴中观的系统批评' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '萨迦崔津法王', nameEn: 'Sakya Trizin', religionId: tibetanBuddhismId,
      dates: '1945-2022', title: '第41任萨迦法王',
      school: '萨迦派', generation: 4,
      biography: '萨迦崔津法王（1945-2022），第41任萨迦派最高领袖。七岁即位，在极其艰苦的条件下完成了萨迦派全部传承的学习和修行。1959年流亡印度后在德拉敦重建了萨迦派的教育体系。他以温和、博学和幽默著称，被誉为"当代活着的佛教百科全书"。2017年将法王位传给儿子，开创了轮流执政的新制度。',
      coreTeaching: '道果法是萨迦派的核心——轮回与涅槃同一根基。传承的延续比个人荣誉更重要。慈悲和智慧缺一不可。',
      templeNames: [{ name: '德拉敦萨迦中心', nameEn: 'Sakya Centre, Dehradun', role: '流亡后重建的萨迦派总部', location: '印度德拉敦' }],
      koans: [], classicQuotes: ['修行不是逃避世间，而是转化世间', '最大的奇迹是改变一颗心'],
      works: [], imageUrl: null,
    },
  });

  // ── 格鲁派 ──

  await prisma.patriarch.create({
    data: {
      name: '根敦朱巴', nameEn: 'Gendun Drup', religionId: tibetanBuddhismId,
      dates: '1391-1474', title: '第一世达赖喇嘛', teacherId: tsongkhapa?.id ?? undefined,
      school: '格鲁派', generation: 2,
      biography: '根敦朱巴（1391-1474），宗喀巴的亲传弟子，后被追认为第一世达赖喇嘛。他建立了扎什伦布寺，成为后来班禅额尔德尼的驻锡地。他在戒律和因明方面造诣深厚，撰写了重要的因明论著。他被追认为达赖是在第三世索南嘉措获得蒙古阿勒坦汗赠号"达赖"后回溯追封的。',
      coreTeaching: '戒律是修行的根本。格鲁派的学修体系必须从辩经和持戒开始。建设寺院是弘法的基础。',
      templeNames: [{ name: '扎什伦布寺', nameEn: 'Tashilhunpo Monastery', role: '根敦朱巴创建·后为班禅驻锡地', location: '西藏日喀则' }],
      koans: [], classicQuotes: ['戒如大地，一切功德依之而生'],
      works: [{ title: '量释庄严', description: '因明学重要论著' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '第五世达赖·罗桑嘉措', nameEn: 'Lobsang Gyatso', religionId: tibetanBuddhismId,
      dates: '1617-1682', title: '伟大的五世·布达拉宫建造者',
      school: '格鲁派', generation: 3,
      biography: '罗桑嘉措（1617-1682），第五世达赖喇嘛，被尊为"伟大的五世"。在和硕特蒙古固始汗的支持下统一了全藏，建立了甘丹颇章政权。开始建造布达拉宫，这座矗立在红山之上的宫殿成为西藏的象征。他学识渊博，著述宏富，同时精通宁玛派密法。他的圆寂被摄政桑结嘉措隐瞒了十五年。',
      coreTeaching: '政教合一以慈悲治藏。佛法不分教派——格鲁派的僧人也应学习宁玛派的密法。权力是服务众生的工具。',
      templeNames: [{ name: '布达拉宫', nameEn: 'Potala Palace', role: '达赖喇嘛冬宫·西藏象征', location: '拉萨' }],
      koans: [], classicQuotes: ['布达拉宫不是我的宫殿，而是观音菩萨的道场', '统一不是为了权力，而是为了和平'],
      works: [{ title: '西藏王臣记', description: '西藏历史权威著作' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '第十四世达赖·丹增嘉措', nameEn: 'Tenzin Gyatso', religionId: tibetanBuddhismId,
      dates: '1935-', title: '诺贝尔和平奖·慈悲化身',
      school: '格鲁派', generation: 4,
      biography: '丹增嘉措（1935-），第十四世达赖喇嘛。两岁被认定为转世灵童，十五岁在动荡中接掌政教大权。1959年流亡印度达兰萨拉，此后致力于藏族文化保存和世界和平。1989年获诺贝尔和平奖。他以"人类的基本善良"和"世俗伦理"为核心讯息，成为当代最具影响力的宗教领袖之一。他主张民主改革，宣布放弃政治权力。',
      coreTeaching: '慈悲是人类的本性，不需要宗教信仰也可以修习。世俗伦理——基于人类共同的善良和理性。以非暴力方式追求正义。',
      templeNames: [{ name: '达兰萨拉', nameEn: 'Dharamsala', role: '西藏流亡政府所在地', location: '印度喜马偕尔邦' }],
      koans: [], classicQuotes: ['我的宗教是慈悲', '如果你认为自己太小而无法做出改变，试试和蚊子一起睡觉', '人类一家——我们的生存相互依存'],
      works: [{ title: '流亡中的自在', description: '自传·诺贝尔和平奖获得者' }],
      imageUrl: null,
    },
  });

  // ── 利美运动 ──

  await prisma.patriarch.create({
    data: {
      name: '蒋扬钦哲旺波', nameEn: 'Jamyang Khyentse Wangpo', religionId: tibetanBuddhismId,
      dates: '1820-1892', title: '利美运动创始人·七教传承持有者',
      school: '利美运动', generation: 1,
      biography: '蒋扬钦哲旺波（1820-1892），利美（Rimé，无偏见）运动的创始人。他持有藏传佛教所有四大教派及苯教的完整传承——这在当时几乎是不可能的。他发掘了大量面临失传的珍贵法教，重新整理和传授。与蒋贡康楚互为师友，共同推动了19世纪藏传佛教的文化复兴。',
      coreTeaching: '利美——无偏见地尊重和学习所有传承。每个教派都有独特的智慧贡献，偏见是修行最大的障碍。保存濒危传承是当代最紧迫的使命。',
      templeNames: [{ name: '宗萨寺', nameEn: 'Dzongsar Monastery', role: '蒋扬钦哲驻锡·利美运动中心', location: '西藏德格' }],
      koans: [], classicQuotes: ['所有教派的法教都是佛陀智慧的不同面向', '偏见是无明最隐蔽的形式'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '蒋贡康楚', nameEn: 'Jamgon Kongtrul', religionId: tibetanBuddhismId,
      dates: '1813-1899', title: '五宝藏论·利美先驱',
      school: '利美运动', generation: 1,
      biography: '蒋贡康楚（1813-1899），利美运动另一位核心人物。他编纂了"五宝藏论"——近百卷涵盖藏传佛教所有教派核心法教的百科全书式巨著。这项工程拯救了数百种面临失传的法教。他本人持有一百多种不同传承的完整灌顶和口传。被誉为"全知者"（Kunkhyen）。',
      coreTeaching: '知识的保存和传承是文明存续的根本。编纂和系统化不是学术游戏，而是救度众生的菩萨行。',
      templeNames: [{ name: '八蚌寺', nameEn: 'Palpung Monastery', role: '蒋贡康楚驻锡地', location: '西藏德格' }],
      koans: [], classicQuotes: ['保存一个教法等于拯救无数未来的修行者', '学海无涯，但每一滴水都珍贵'],
      works: [{ title: '五宝藏论', description: '近百卷·藏传佛教百科全书·利美运动最伟大成就' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '更敦群培', nameEn: 'Gendün Chöphel', religionId: tibetanBuddhismId,
      dates: '1903-1951', title: '藏族现代思想先驱',
      school: '利美运动', generation: 2,
      biography: '更敦群培（1903-1951），藏族历史上最具争议和创新精神的知识分子。他是出色的格西（佛学博士），但选择还俗游历印度十二年。精通梵文、巴利文和英文，翻译了多部印度经典。他以现代批判方法研究西藏历史，挑战了许多传统叙事。因政治原因入狱三年，出狱后酗酒去世。他被视为藏族现代化思想的先驱。',
      coreTeaching: '佛法需要与现代知识对话。批判性思维不是对传统的背叛，而是使传统保持活力的方式。真正的学者不怕挑战权威。',
      templeNames: [], koans: [],
      classicQuotes: ['不要因为是古人说的就相信，要用自己的理性检验', '西藏需要睁开眼睛看世界'],
      works: [{ title: '白史', description: '以现代方法重写的西藏历史' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '秋阳创巴仁波切', nameEn: 'Chögyam Trungpa', religionId: tibetanBuddhismId,
      dates: '1939-1987', title: '疯智慧·西方藏传佛教先驱',
      school: '利美运动', generation: 2,
      biography: '秋阳创巴（1939-1987），噶举和宁玛双重传承持有者。1959年流亡，后赴英国牛津大学学习。1970年移居美国，以前所未有的方式将藏传佛教带入西方：脱下袈裟穿西装、用英语教学、创建那洛巴大学和香巴拉训练。他的"疯智慧"教学风格充满争议但极具影响力，是将藏传佛教成功移植到西方的第一人。',
      coreTeaching: '灵性唯物主义是最大的陷阱——将修行变成自我膨胀的工具。勇士之道——面对恐惧，不逃避，以勇气和温柔生活。',
      templeNames: [], koans: [],
      classicQuotes: ['当你真正开始修行时，最先遇到的障碍是你自己', '勇士不是无所畏惧，而是在恐惧中依然前行', '放弃希望和恐惧——安住在当下'],
      works: [{ title: '突破修道上的唯物', description: '西方最畅销的藏传佛教入门书' }, { title: '香巴拉：勇士之道', description: '世俗灵性修行经典' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '宗萨蒋扬钦哲仁波切', nameEn: 'Dzongsar Khyentse Rinpoche', religionId: tibetanBuddhismId,
      dates: '1961-', title: '当代利美传承·正见',
      school: '利美运动', generation: 2,
      biography: '宗萨蒋扬钦哲仁波切（1961-），蒋扬钦哲旺波的第三世转世。不丹出生，在顶果钦哲仁波切座下接受完整训练。他以现代语言和电影艺术弘法——执导了《旅行者与魔术师》《高山上的世界杯》等电影。著《正见》以四法印阐释佛教核心，畅销全球。他管理着遍布全球的宗萨佛学院网络。',
      coreTeaching: '四法印——一切和合事物无常，一切情绪皆苦，一切法无我，涅槃超越概念。如果你不理解这四点，就不是佛教徒。',
      templeNames: [{ name: '宗萨佛学院', nameEn: 'Dzongsar Institute', role: '利美传承佛学教育中心', location: '印度比尔' }],
      koans: [], classicQuotes: ['佛教不是宗教，而是关于真实的科学', '如果你不理解四法印，挂多少佛珠也没用', '执著于佛法也是执著'],
      works: [{ title: '正见', description: '四法印·全球畅销的佛教入门书' }, { title: '佛教的见地与修道', description: '系统阐释佛教哲学' }],
      imageUrl: null,
    },
  });

  const tibetanCount = 22;
  console.log(`  ✓ ${tibetanCount} new Tibetan Buddhist masters created + 3 updated (5 schools: Nyingma/Kagyu/Sakya/Gelug/Rimé)`);

  // ── 4u. 原住民灵性 (Indigenous Spirituality) ──
  console.log('  Creating Indigenous spirituality figures (4u)...');

  const indigenousId = religionMap['indigenous'];

  // Update existing 梦时代祖灵
  const existingDreamtime = await prisma.patriarch.findFirst({ where: { name: '梦时代祖灵' } });
  existingDreamtime
    ? await prisma.patriarch.update({
        where: { id: existingDreamtime.id },
        data: {
          nameEn: 'Dreamtime Ancestral Spirits', dates: '远古', title: '创世祖灵·万物起源',
          school: '澳洲原住民', generation: 1,
          biography: '梦时代（Dreamtime/Tjukurpa）祖灵，澳洲原住民信仰的核心概念。梦时代不是过去的时间，而是永恒的当下——祖灵在梦时代穿越大地，以歌唱和行走创造了山川河流、动物植物和人类。每一条河流、每一座山丘都是祖灵的足迹。原住民通过歌线（Songlines）追循祖灵的道路，以仪式和绘画维系与祖灵的连接。',
          coreTeaching: '大地是活的经文——每个地标都是祖灵故事的一个篇章。人类的责任是看护大地（Caring for Country）。梦时代不在过去，它现在仍然在发生。',
          achievements: '创造天地万物·歌线连接整个大陆·世界最古老的持续文化传统',
          templeNames: [{ name: '乌鲁鲁', nameEn: 'Uluru', role: '梦时代圣地·多个祖灵故事交汇处', location: '澳大利亚北领地' }],
          koans: [], classicQuotes: ['大地不属于我们，我们属于大地', '祖灵的歌从未停止，只要你倾听', '我们不拥有土地，是土地拥有我们'],
          works: [], imageUrl: null,
        },
      })
    : null;

  await prisma.patriarch.create({
    data: {
      name: '彩虹蛇', nameEn: 'Rainbow Serpent', religionId: indigenousId,
      dates: '远古', title: '创世大蛇·水与生命之源',
      school: '澳洲原住民', generation: 1,
      biography: '彩虹蛇是澳洲原住民最广泛流传的创世神灵，在不同部族有不同名字。它在梦时代从地下苏醒，巨大的蛇身蜿蜒前行，创造了河流、山谷和水潭。它是水和生育的守护者，也是律法的执行者——违反神圣律法者将被彩虹蛇吞噬。在金伯利地区的岩画中，彩虹蛇的形象可追溯到六千年前，是世界上持续崇拜时间最长的神灵之一。',
      coreTeaching: '水是生命之源，彩虹蛇是水的守护者。尊重自然律法，与大地和水源和谐共处。违反祖灵律法将招致灾难。',
      templeNames: [{ name: '卡卡杜国家公园', nameEn: 'Kakadu National Park', role: '彩虹蛇岩画圣地', location: '澳大利亚北领地' }],
      koans: [], classicQuotes: ['水流过的地方就是彩虹蛇走过的地方', '尊重水源就是尊重生命'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '旺吉纳', nameEn: 'Wandjina', religionId: indigenousId,
      dates: '远古', title: '雨云之灵·金伯利岩画',
      school: '澳洲原住民', generation: 2,
      biography: '旺吉纳（Wandjina），澳大利亚西北金伯利地区原住民的最高神灵，是雨、云和生育的精灵。他们的形象独特——巨大的圆眼、无嘴（因为如果有嘴就会带来无尽的雨而淹没世界）、头部周围有光环般的云彩。金伯利的岩画中旺吉纳形象已有至少四千年历史，是原住民最神圣的艺术传统之一。原住民每年重新描绘旺吉纳岩画以确保雨季到来。',
      coreTeaching: '雨水是生命的恩赐。重新绘制旺吉纳是维系天地秩序的仪式责任。沉默（无嘴）蕴含着比言语更强大的力量。',
      templeNames: [{ name: '金伯利岩画', nameEn: 'Kimberley Rock Art', role: '旺吉纳圣像·四千年传统', location: '西澳大利亚金伯利' }],
      koans: [], classicQuotes: ['沉默比言语更有力量', '每年重绘是我们对天地的承诺'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '巴梅', nameEn: 'Baiame', religionId: indigenousId,
      dates: '远古', title: '天父·东南部创世主',
      school: '澳洲原住民', generation: 2,
      biography: '巴梅（Baiame），澳大利亚东南部多个原住民部族的至高创世神。他从天上降临大地，创造了山川、河流和所有生命。他制定了律法和仪式规则，教导人类如何生活。完成创造后他升回天界，但通过仪式和梦境继续与人类沟通。布雷瓦里纳的石阵是他留下的圣迹。他常以独腿巨人形象出现在岩画中。',
      coreTeaching: '创造者制定了律法和生活方式。人类的责任是遵守祖灵律法，维护社区和谐。与天界的连接通过仪式和梦境维持。',
      templeNames: [{ name: '布雷瓦里纳', nameEn: 'Brewarrina Fish Traps', role: '巴梅创造的圣迹·世界最古老人造结构之一', location: '新南威尔士' }],
      koans: [], classicQuotes: ['律法不是人定的，是巴梅定的', '天父在天上看着，确保律法被遵守'],
      works: [], imageUrl: null,
    },
  });

  // ── 北美原住民 ──

  await prisma.patriarch.create({
    data: {
      name: '白牛女', nameEn: 'White Buffalo Calf Woman', religionId: indigenousId,
      dates: '远古', title: '神圣烟管赐予者·拉科塔',
      school: '北美原住民', generation: 1,
      biography: '白牛女（Pte Ska Win），拉科塔族最神圣的精灵。传说她以白牛犊女子的形象出现在两位猎人面前，带来了神圣烟管（Chanunpa）和七种神圣仪式：净身仪式、求愿舞、亲属仪式、灵视追求、太阳舞、球赛和灵魂守护。她教导人类与大地万物的亲属关系——"Mitákuye Oyás\'iŋ"（我们都是亲人）。离去时变为白色牛犊消失在草原上。',
      coreTeaching: 'Mitákuye Oyás\'iŋ——我们与一切生命都是亲人。神圣烟管连接天与地、人与灵。七种仪式维系人与宇宙的和谐。',
      templeNames: [{ name: '黑山丘', nameEn: 'Black Hills (He Sapa)', role: '拉科塔神圣之地', location: '南达科他州' }],
      koans: [], classicQuotes: ['Mitákuye Oyás\'iŋ——我们都是亲人', '神圣烟管的烟升向天空，带着我们的祈祷'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '坐牛', nameEn: 'Sitting Bull', religionId: indigenousId,
      dates: '1831-1890', title: '拉科塔圣人·小大角之战',
      school: '北美原住民', generation: 2,
      biography: '坐牛（Tȟatȟáŋka Íyotake，1831-1890），亨克帕帕拉科塔族酋长和圣人。他是太阳舞的领导者和灵视者——在1876年太阳舞中预见了小大角之战的胜利。联合各部族在小大角战役中击败了卡斯特将军。后被迫流亡加拿大。归来后被关入保留地，因参与幽灵舞运动被印第安警察射杀。他的灵性领导力使他成为北美原住民抵抗运动的永恒象征。',
      coreTeaching: '真正的领袖以灵视引导人民。太阳舞是与大灵（Wakan Tanka）沟通的最高仪式。土地是神圣的，不可出卖。',
      templeNames: [{ name: '小大角战场', nameEn: 'Little Bighorn Battlefield', role: '1876年拉科塔胜利之地', location: '蒙大拿州' }],
      koans: [], classicQuotes: ['让我们把弓放下，握手言和——但永远不要出卖我们的土地', '我是最后一个放下武器的印第安人'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '黑麋鹿', nameEn: 'Black Elk', religionId: indigenousId,
      dates: '1863-1950', title: '奥格拉拉圣人·黑麋鹿如是说',
      school: '北美原住民', generation: 2,
      biography: '黑麋鹿（Heȟáka Sápa，1863-1950），奥格拉拉拉科塔族圣人。九岁时获得了改变一生的大灵视——看到了六位祖父（代表六方）和民族的未来。亲历了小大角之战和伤膝河惨案。晚年口述《黑麋鹿如是说》，成为北美原住民灵性最重要的文献。他将拉科塔族的宇宙观和灵性传统传递给了全世界。',
      coreTeaching: '宇宙是一个神圣的圆环（Sacred Hoop）。一切方向都是神圣的。灵视（Vision）是与大灵沟通的方式。民族的力量在于神圣圆环的完整。',
      templeNames: [{ name: '哈尼峰', nameEn: 'Harney Peak (Black Elk Peak)', role: '黑麋鹿灵视之地·已更名为黑麋鹿峰', location: '南达科他州' }],
      koans: [], classicQuotes: ['万物的力量都以圆的方式运动', '大地上每一步都是祈祷', '在那里我站立，在世界的中心'],
      works: [{ title: '黑麋鹿如是说', description: '北美原住民灵性最重要的文献' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '西雅图酋长', nameEn: 'Chief Seattle', religionId: indigenousId,
      dates: '1786-1866', title: '苏夸米什酋长·大地之书',
      school: '北美原住民', generation: 3,
      biography: '西雅图酋长（Si\'ahl，1786-1866），苏夸米什和杜瓦米什部落联合酋长。他以1854年对美国政府的著名演讲闻名于世——回应土地购买要求时说出了最深刻的生态灵性宣言。虽然演讲的确切措辞有争议，但其核心精神得到了原住民传统的印证。以他命名的西雅图城是美国太平洋西北部最大城市。',
      coreTeaching: '大地是我们的母亲，不是可以买卖的商品。人类不是生命之网的编织者，只是其中的一根线。伤害大地就是伤害自己。',
      templeNames: [], koans: [],
      classicQuotes: ['大地不属于人类，人类属于大地', '人类不是生命之网的编织者，只是其中一根线', '我们并不继承祖先的大地，我们借用子孙的大地'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '疯马', nameEn: 'Crazy Horse', religionId: indigenousId,
      dates: '1840-1877', title: '奥格拉拉战士·永不投降',
      school: '北美原住民', generation: 3,
      biography: '疯马（Tȟašúŋke Witkó，1840-1877），奥格拉拉拉科塔族最伟大的战士。他一生从未被拍过照片，也从未在条约上签字。在灵视中获得了战斗中不可被伤害的启示。他是小大角之战中击败卡斯特的关键人物。在投降后被美军士兵用刺刀刺杀于内布拉斯加罗宾逊堡。他的精神成为原住民不屈抗争的永恒象征。',
      coreTeaching: '自由比生命更重要。不留影像、不签条约——真正的力量不在于记录而在于行动。保护人民是战士的最高使命。',
      templeNames: [{ name: '疯马纪念碑', nameEn: 'Crazy Horse Memorial', role: '世界最大雕塑工程·纪念原住民精神', location: '南达科他州' }],
      koans: [], classicQuotes: ['今天是死的好日子', '我的土地不是用来出卖的', '一个好的战士先保护妇女儿童'],
      works: [], imageUrl: null,
    },
  });

  // ── 中南美传统 ──

  // Update existing 印加太阳神因蒂
  const existingInti = await prisma.patriarch.findFirst({ where: { name: '印加太阳神因蒂' } });
  existingInti
    ? await prisma.patriarch.update({
        where: { id: existingInti.id },
        data: {
          nameEn: 'Inti', dates: '印加时代', title: '太阳神·印加帝国守护者',
          school: '中南美传统', generation: 1,
          biography: '因蒂（Inti），印加帝国的至高太阳神，印加皇族自称是因蒂之子（Sapa Inca = 太阳之子）。他每日驾驭太阳马车穿越天空，为大地带来温暖和生命。因蒂节（Inti Raymi）是印加最盛大的节日，在冬至日庆祝太阳的回归。库斯科的科里坎查（太阳神殿）墙面覆以黄金板，反射日光象征因蒂的荣耀。西班牙征服者掠走了所有黄金，但因蒂节至今在库斯科每年举行。',
          coreTeaching: '太阳是生命之源和秩序之本。印加皇帝作为因蒂之子代行神权。冬至是太阳回归的庆典——最黑暗的时刻之后，光明必将回来。',
          templeNames: [{ name: '科里坎查', nameEn: 'Coricancha (Temple of the Sun)', role: '印加太阳神殿·黄金满壁', location: '秘鲁库斯科' }],
          koans: [], classicQuotes: ['太阳之子守护大地上的子民', '因蒂节——即使在最寒冷的日子，太阳也会回来'],
          works: [], imageUrl: null,
        },
      })
    : null;

  await prisma.patriarch.create({
    data: {
      name: '羽蛇神', nameEn: 'Quetzalcoatl', religionId: indigenousId,
      dates: '远古', title: '文明赐予者·风之主',
      school: '中南美传统', generation: 1,
      biography: '羽蛇神（Quetzalcoatl），中美洲最重要的神灵，在阿兹特克、玛雅（库库尔坎）和托尔特克文明中都被崇拜。他是长着绿色羽毛的蛇——结合了天空（鸟）和大地（蛇）的力量。他是文明的赐予者：发明了历法、文字、农业和建筑。传说他离开时乘坐蛇筏向东方海上远去，许诺将来回归。特奥蒂瓦坎的羽蛇神金字塔是他最宏伟的圣殿。',
      coreTeaching: '知识和文明是神灵给人类最大的礼物。羽蛇结合天地——灵性与物质不可分离。创造者也是教育者。',
      templeNames: [{ name: '特奥蒂瓦坎', nameEn: 'Teotihuacan', role: '羽蛇神金字塔', location: '墨西哥城附近' }, { name: '奇琴伊察', nameEn: 'Chichen Itza', role: '库库尔坎金字塔', location: '墨西哥尤卡坦' }],
      koans: [], classicQuotes: ['知识是给人类最大的礼物', '我将从东方回来'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '帕查玛玛', nameEn: 'Pachamama', religionId: indigenousId,
      dates: '远古', title: '大地母亲·安第斯守护',
      school: '中南美传统', generation: 2,
      biography: '帕查玛玛（Pachamama），安第斯地区最崇敬的女神——大地母亲。她不是抽象概念，而是活着的大地本身。每一座山、每一片田地、每一条河流都是她身体的一部分。安第斯人在播种前和收获后都要向帕查玛玛献祭（通常是古柯叶和酒），感谢她的滋养。至今在秘鲁、玻利维亚和厄瓜多尔，帕查玛玛崇拜是最活跃的传统信仰。',
      coreTeaching: '大地是活着的母亲，不是无生命的资源。人类从大地获取必须回报大地。互惠（Ayni）是安第斯宇宙观的根本——你给予大地，大地给予你。',
      templeNames: [{ name: '的的喀喀湖', nameEn: 'Lake Titicaca', role: '帕查玛玛与创世神圣地', location: '秘鲁/玻利维亚边境' }],
      koans: [], classicQuotes: ['帕查玛玛给予一切，也要求回报', '播种前先感谢大地'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '维拉科查', nameEn: 'Viracocha', religionId: indigenousId,
      dates: '远古', title: '至高创世神·光之主',
      school: '中南美传统', generation: 2,
      biography: '维拉科查（Viracocha），安第斯文明的至高创世神。他从的的喀喀湖中升起，创造了太阳、月亮、星辰和人类。他先用石头造人（巨人族），因不满意而以洪水毁灭。第二次创造了现今的人类，教授他们文明技艺。完成创造后他向西走入太平洋消失。蒂亚瓦纳科的太阳门上雕刻着他的形象——手持权杖、眼流泪水（象征雨水）。',
      coreTeaching: '创造是反复完善的过程。不完美可以被毁灭并重新开始。创造者既是建设者也是毁灭者——这是宇宙的法则。',
      templeNames: [{ name: '蒂亚瓦纳科', nameEn: 'Tiwanaku', role: '维拉科查太阳门圣地', location: '玻利维亚' }],
      koans: [], classicQuotes: ['创造不是一次完成的', '光从湖中升起，照亮了整个世界'],
      works: [], imageUrl: null,
    },
  });

  // ── 非洲传统 ──

  await prisma.patriarch.create({
    data: {
      name: '奥鲁恩', nameEn: 'Olorun', religionId: indigenousId,
      dates: '远古', title: '约鲁巴至高神·万有之主',
      school: '非洲传统', generation: 1,
      biography: '奥鲁恩（Olorun/Olodumare），约鲁巴宗教的至高神，意为"天之主"。他创造了宇宙和所有奥里沙（神灵），但随后退隐到天界，不直接干预人间事务。人类通过奥里沙（中间神灵）与奥鲁恩沟通。每个人出生时都从奥鲁恩处获得"奥里"（命运/头顶的灵），决定了此生的使命。约鲁巴宗教后来传播到美洲，发展为桑特里亚、坎东布雷等新世界宗教。',
      coreTeaching: '至高神创造万物但委托奥里沙管理。每个人有独特的命运（奥里）和守护奥里沙。平衡和秩序是宇宙运行的法则。',
      templeNames: [{ name: '伊费', nameEn: 'Ile-Ife', role: '约鲁巴文明圣城·创世之地', location: '尼日利亚' }],
      koans: [], classicQuotes: ['奥鲁恩高居天上，通过奥里沙与我们对话', '每个人的头顶都有自己的命运'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '尚戈', nameEn: 'Shango', religionId: indigenousId,
      dates: '远古', title: '雷神·第三任奥约帝王',
      school: '非洲传统', generation: 2,
      biography: '尚戈（Shango/Sango），约鲁巴雷神和正义之神，也是历史上奥约帝国第三任国王。他以勇武和正义著称，能从口中喷火、从天上召唤雷电。作为历史人物他统治奥约帝国，作为奥里沙他掌管雷电、火焰、鼓乐和舞蹈。他的颜色是红白色，圣器是双头斧。在巴西的坎东布雷中，尚戈与天主教圣芭芭拉融合。',
      coreTeaching: '正义如雷电——迅速而不可阻挡。领袖必须既有力量又有正义。鼓乐和舞蹈是与神灵沟通的语言。',
      templeNames: [{ name: '奥约', nameEn: 'Oyo', role: '尚戈故都·奥约帝国中心', location: '尼日利亚' }],
      koans: [], classicQuotes: ['雷电不分贫富——正义面前人人平等', '鼓声是尚戈的语言'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '耶莫贾', nameEn: 'Yemoja', religionId: indigenousId,
      dates: '远古', title: '海洋母神·生育守护',
      school: '非洲传统', generation: 2,
      biography: '耶莫贾（Yemoja/Yemanjá），约鲁巴宗教中的河流和海洋母神。她是所有奥里沙之母，名字意为"鱼之母的孩子"。在非洲她原是尼日尔河的河神，随奴隶贸易传到美洲后成为海洋女神。在巴西，每年12月31日数百万人穿着白衣到海边向耶莫贾献花和礼物。她守护妊妇和儿童，代表母性的无限慈爱。',
      coreTeaching: '母性是宇宙最强大的力量。水是生命之源——河流和海洋是耶莫贾的身体。女性力量不逊于任何男性力量。',
      templeNames: [{ name: '拉各斯海岸', nameEn: 'Lagos Coast', role: '耶莫贾崇拜中心', location: '尼日利亚拉各斯' }],
      koans: [], classicQuotes: ['大海的波浪是耶莫贾的拥抱', '母亲的爱如海洋——无边无际'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '奥贡', nameEn: 'Ogun', religionId: indigenousId,
      dates: '远古', title: '铁与战争之神·开路者',
      school: '非洲传统', generation: 2,
      biography: '奥贡（Ogun），约鲁巴铁、战争和技术之神。他是第一个用铁器开辟道路穿越原始森林的奥里沙，因此被称为"开路者"。他是铁匠、猎人、战士和外科医生的守护神。在现代约鲁巴文化中，他的范围扩展到了所有使用金属的技术——包括汽车、手术刀和计算机。在尼日利亚法庭上，传统信仰者对着铁器向奥贡发誓。',
      coreTeaching: '技术是神灵给人类的工具——铁既能杀人也能救人。开路者的精神——面对荒野，用自己的力量开辟道路。',
      templeNames: [{ name: '伊雷·埃基蒂', nameEn: 'Ire-Ekiti', role: '奥贡故乡与圣地', location: '尼日利亚埃基蒂州' }],
      koans: [], classicQuotes: ['奥贡开路，我们跟随', '铁器在我手中——可以造福也可以毁灭'],
      works: [], imageUrl: null,
    },
  });

  // ── 萨满传统 ──

  await prisma.patriarch.create({
    data: {
      name: '腾格里', nameEn: 'Tengri', religionId: indigenousId,
      dates: '远古', title: '蒙古萨满至高天神',
      school: '萨满传统', generation: 1,
      biography: '腾格里（Tengri），蒙古-突厥民族的至高天神。"腾格里"即"天"的意思。他是永恒的蓝天本身——无形无相，无所不在。成吉思汗征服世界时宣称受腾格里之命。腾格里信仰（Tengrism）是中亚草原最古老的信仰体系，强调天地人的和谐。近年来在蒙古、哈萨克斯坦和土耳其等地经历了显著的复兴。',
      coreTeaching: '永恒的蓝天（Mongke Tengri）是最高的存在。天地人三界相互贯通。萨满是三界之间的中介。尊重大地母亲（Etugen）和天父腾格里的平衡。',
      templeNames: [{ name: '不儿罕山', nameEn: 'Burkhan Khaldun', role: '成吉思汗圣山·腾格里崇拜中心', location: '蒙古' }],
      koans: [], classicQuotes: ['永恒的蓝天是万物的见证者', '受永恒天之命——成吉思汗的宣言'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '帕帕图阿努库', nameEn: 'Papatūānuku', religionId: indigenousId,
      dates: '远古', title: '毛利大地母亲',
      school: '萨满传统', generation: 1,
      biography: '帕帕图阿努库（Papatūānuku），毛利族的大地母亲。在创世之初，她与天父朗伊努伊紧紧相拥，他们的孩子们被困在永恒的黑暗中。森林之神塔尼马胡塔用背顶天、脚踏地，将父母分离——天升上去，地沉下来，光明第一次照入世界。帕帕的泪水成为清晨的露珠，她思念天父的叹息化为地热蒸汽。毛利人视大地为母亲，死后归于帕帕的怀抱。',
      coreTeaching: '大地是母亲——我们出生于她，死后回到她。分离是创造的前提——没有天地分离就没有光明和生命。',
      templeNames: [], koans: [],
      classicQuotes: ['我们是大地的孩子，终将回到母亲的怀抱', '清晨的露珠是帕帕思念朗伊的泪水'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '朗伊努伊', nameEn: 'Ranginui', religionId: indigenousId,
      dates: '远古', title: '毛利天父·与大地分离',
      school: '萨满传统', generation: 2,
      biography: '朗伊努伊（Ranginui），毛利族的天父。与大地母亲帕帕图阿努库紧密相拥，其间孕育了众神。被儿子塔尼马胡塔强行分离后，朗伊努伊升到天空，化作苍穹。他的泪水化为雨水，落在帕帕身上。从天空中他凝望着大地，看不到帕帕的面容因为云雾遮挡——这就是为什么天空经常阴云密布。天父的悲伤创造了天气。',
      coreTeaching: '爱的分离创造了世界。天父的泪是雨水，滋养大地。悲伤也是创造力——失去创造了天气、季节和生命循环。',
      templeNames: [], koans: [],
      classicQuotes: ['雨水是天父思念大地母亲的泪', '分离虽然痛苦，却给世界带来了光明'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '因纽特海之女塞德娜', nameEn: 'Sedna', religionId: indigenousId,
      dates: '远古', title: '因纽特海洋女神',
      school: '萨满传统', generation: 2,
      biography: '塞德娜（Sedna），因纽特族的海洋女神和海洋动物之母。她原是一个人类少女，被父亲推入冰冷的海中。她紧抓船舷，手指被父亲一节一节砍断——断指变成了海豹、海象和鲸鱼。她沉入海底成为海洋女神，掌管着所有海洋生物。当人类违反禁忌时，她的头发会打结缠绕，扣留海洋动物。萨满必须潜入海底为她梳理头发，海洋猎物才会回来。',
      coreTeaching: '海洋的慷慨有条件——人类必须遵守禁忌和尊重自然规律。打猎不是权利而是关系。萨满是人类与自然精灵的中介。',
      templeNames: [], koans: [],
      classicQuotes: ['海洋给予生命，但要求尊重', '违反禁忌时，海底女王会扣留猎物'],
      works: [], imageUrl: null,
    },
  });

  const indigenousCount = 20;
  console.log(`  ✓ ${indigenousCount} new Indigenous spirits created + 2 updated (5 traditions: Aboriginal/NativeAmerican/Mesoamerican/African/Shamanic)`);

  // ── 4v. 巴哈伊教人物 (Bahá'í Figures) ──
  console.log('  Creating Bahá\'í figures (4v)...');

  const bahaiId = religionMap['bahai'];

  // Update existing 巴孛
  const existingBab = await prisma.patriarch.findFirst({ where: { name: '巴孛' } });
  existingBab
    ? await prisma.patriarch.update({
        where: { id: existingBab.id },
        data: {
          nameEn: 'The Báb', dates: '1819-1850', title: '大门·巴比运动创始人',
          school: '巴比运动先驱', generation: 1,
          biography: '巴孛（1819-1850），原名赛义德·阿里·穆罕默德，波斯设拉子商人。1844年5月23日宣布自己是"巴孛"（大门），是伊斯兰教期待的马赫迪（引导者），并预言一位更伟大的启示者即将来临。他的教导吸引了数以万计的追随者（巴比教徒），引发了波斯政府和宗教当局的恐惧。被囚禁六年后，于1850年在大不里士被行刑队枪决。第一轮射击后绳索断裂他安然无恙，第二轮方才殉道。',
          coreTeaching: '旧的天启时代已经结束，新的天启即将来临。"你们所期待的那一位"即将显现。通过巴孛之门，进入新的信仰纪元。',
          achievements: '创立巴比运动·预言巴哈欧拉·为信仰殉道',
          templeNames: [{ name: '巴孛陵殿', nameEn: 'Shrine of the Báb', role: '巴孛安息地·巴哈伊圣地', location: '以色列海法' }],
          koans: [], classicQuotes: ['你们所期待的那一位，祂将超越你们一切的想象', '真理的太阳即将升起'],
          works: [{ title: '巴扬经', description: '巴孛的核心经典·预言新启示' }],
          imageUrl: null,
        },
      })
    : null;

  // Update existing 巴哈欧拉
  const existingBaha = await prisma.patriarch.findFirst({ where: { name: '巴哈欧拉' } });
  const bahaullah = existingBaha
    ? await prisma.patriarch.update({
        where: { id: existingBaha.id },
        data: {
          nameEn: 'Bahá\'u\'lláh', dates: '1817-1892', title: '上帝的荣耀·巴哈伊信仰创始人',
          school: '圣约中心', generation: 1,
          biography: '巴哈欧拉（1817-1892），原名米尔扎·侯赛因·阿里，波斯贵族。1853年在德黑兰的"黑坑"地牢中接受启示，确认自己就是巴孛预言的"上帝将要显示的那一位"。此后四十年在流放中度过——从巴格达到君士坦丁堡到阿德里安堡到最终的阿卡监狱城。他著述逾百卷，阐述了世界统一、消除偏见、男女平等、宗教一体等原则。他的教导奠定了巴哈伊信仰的全部基础。',
          coreTeaching: '人类一体——全人类是一个家庭。宗教渐进启示——所有伟大宗教都来自同一上帝。消除一切形式的偏见。建立世界联邦和持久和平。',
          achievements: '创立巴哈伊信仰·著述逾百卷·致书世界各国君主·阐述世界和平原则',
          templeNames: [{ name: '巴吉花园', nameEn: 'Bahji Gardens', role: '巴哈欧拉陵殿·巴哈伊最神圣之地', location: '以色列阿卡' }],
          koans: [], classicQuotes: ['大地是一个国家，人类是它的公民', '你们都是一棵树上的果实，一个枝条上的叶子', '以和平之眼观万物，以宽恕之心待世人'],
          works: [{ title: '至圣书', description: '巴哈伊信仰最神圣经典' }, { title: '隐言经', description: '灵性伦理格言集' }],
          imageUrl: null,
        },
      })
    : null;

  // ── 巴比运动先驱 ──

  await prisma.patriarch.create({
    data: {
      name: '穆拉·侯赛因', nameEn: 'Mullá Husayn', religionId: bahaiId,
      dates: '1813-1849', title: '信仰第一门徒·活字母之首',
      school: '巴比运动先驱', generation: 2,
      biography: '穆拉·侯赛因（1813-1849），巴孛的第一位信徒，被称为"活字母之首"（Bábu\'l-Báb，门之门）。1844年5月22日夜间在设拉子首先认出巴孛。他是一位杰出的学者和勇敢的战士——在奥加拉巴堡战役中英勇殉道。巴哈欧拉曾赞扬他为"信仰之光"。',
      coreTeaching: '认出真理需要纯净的心灵和学识的准备。第一个信仰者的勇气为后来者开辟了道路。以生命见证信仰的真实。',
      templeNames: [{ name: '设拉子巴孛故居', nameEn: 'House of the Báb, Shiraz', role: '巴孛宣示之地·穆拉侯赛因首先信仰', location: '伊朗设拉子' }],
      koans: [], classicQuotes: ['我找到了我所寻找的——祂就是应许者'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '库杜斯', nameEn: 'Quddús', religionId: bahaiId,
      dates: '1822-1849', title: '活字母之末·巴比运动殉道者',
      school: '巴比运动先驱', generation: 2,
      biography: '库杜斯（1822-1849），原名穆罕默德·阿里·巴尔福鲁什，巴孛的十八位"活字母"中的最后一位。巴孛对他的敬重超过其他所有弟子。他在巴比教运动中发挥了关键的领导作用。在巴尔福鲁什被暴民捕获后遭受了残酷的折磨和杀害，年仅二十七岁。',
      coreTeaching: '年轻不是软弱。信仰的力量超越世俗的权力。殉道是对真理最后也最有力的见证。',
      templeNames: [], koans: [],
      classicQuotes: ['即使在刽子手面前，真理也不会低头'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '塔赫蕾', nameEn: 'Táhirih', religionId: bahaiId,
      dates: '1817-1852', title: '纯洁者·波斯第一位女权先驱',
      school: '巴比运动先驱', generation: 2,
      biography: '塔赫蕾（1817-1852），原名法蒂玛·巴拉加尼，被巴孛赐号"塔赫蕾"（纯洁者）。她是波斯最杰出的女学者和诗人，未曾与巴孛见面便通过其著作认出他。1848年在巴达什特会议上，她当众揭下面纱，宣告伊斯兰旧律法的终结——这一举动震惊了在场的男性。她被秘密绞杀并投入枯井，临终前说："你们可以杀死我，但不能阻止妇女的解放。"',
      coreTeaching: '妇女与男子完全平等。旧律法的时代已经结束。揭下面纱不是反叛而是回应新时代的要求。知识和勇气不分性别。',
      templeNames: [], koans: [],
      classicQuotes: ['你们可以杀死我，但不能阻止妇女的解放', '新时代已经来临——旧律法的枷锁必须被打碎'],
      works: [], imageUrl: null,
    },
  });

  // ── 圣约中心 ──

  const abdulBaha = await prisma.patriarch.create({
    data: {
      name: '阿博都巴哈', nameEn: '\'Abdu\'l-Bahá', religionId: bahaiId,
      dates: '1844-1921', title: '圣约中心·完美典范', teacherId: bahaullah?.id ?? undefined,
      school: '圣约中心', generation: 2,
      biography: '阿博都巴哈（1844-1921），巴哈欧拉长子，被父亲指定为"圣约中心"和教义的唯一权威诠释者。从九岁起与父亲一同流放，在阿卡监狱城度过了大部分人生。1908年获释后周游欧洲和北美，向西方世界介绍巴哈伊信仰。他以无限的慈悲和服务精神著称——在一战期间组织粮食救济挽救了海法地区数千人的生命。',
      coreTeaching: '服务人类就是服务上帝。巴哈伊信仰的核心是行动而不只是信条。世界和平需要消除种族、性别和经济的偏见。教育是人类进步的基石。',
      templeNames: [{ name: '阿卡', nameEn: 'Akka (Acre)', role: '阿博都巴哈囚禁与服务之地', location: '以色列阿卡' }],
      koans: [], classicQuotes: ['我的名字是阿博都巴哈——巴哈的仆人', '你不必为明天的面包忧虑——为他人的面包忧虑', '世界需要的不是更多的理论，而是更多的爱'],
      works: [{ title: '巴黎谈话', description: '1911年在巴黎的公开演讲集' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '守基·阿芬第', nameEn: 'Shoghi Effendi', religionId: bahaiId,
      dates: '1897-1957', title: '圣护·行政秩序建筑师', teacherId: abdulBaha.id,
      school: '圣约中心', generation: 3,
      biography: '守基·阿芬第（1897-1957），阿博都巴哈的长孙，被指定为巴哈伊信仰的"圣护"（Guardian）。牛津大学毕业后，在三十六年间将巴哈伊信仰从中东宗教转变为全球组织。他设计了巴哈伊行政秩序——地方灵体会、国家灵体会和世界正义院的三级体制。翻译了巴哈欧拉的主要著作为优美的英文。主持建造了海法巴孛陵殿的金色穹顶。',
      coreTeaching: '世界秩序需要新的行政体制。巴哈伊行政秩序是世界联邦的雏形。团结不是统一——多样性中的统一是人类文明的方向。',
      templeNames: [{ name: '巴哈伊世界中心', nameEn: 'Bahá\'í World Centre', role: '守基阿芬第建设的全球行政中心', location: '以色列海法' }],
      koans: [], classicQuotes: ['行政秩序不是目的，而是实现世界和平的工具', '让我们在多样性中找到统一'],
      works: [{ title: '上帝来了', description: '巴哈伊信仰的历史和教义总览' }],
      imageUrl: null,
    },
  });

  // ── 巴哈伊圣女 ──

  await prisma.patriarch.create({
    data: {
      name: '巴希叶·哈努姆', nameEn: 'Bahíyyih Khánum', religionId: bahaiId,
      dates: '1846-1932', title: '最伟大的圣叶·巴哈欧拉长女',
      school: '巴哈伊圣女', generation: 1,
      biography: '巴希叶·哈努姆（1846-1932），巴哈欧拉的长女，被尊为"最伟大的圣叶"。她从童年起就与家人一同经历流放和囚禁的苦难。在阿博都巴哈旅行期间和守基·阿芬第早期，她多次代理管理巴哈伊事务。她的一生是自我牺牲和无私服务的典范，将所有个人需求置于信仰和家族之后。',
      coreTeaching: '无私服务是最高的灵性修行。女性在信仰中的角色与男性完全平等。安静的力量比喧嚣的权力更持久。',
      templeNames: [], koans: [],
      classicQuotes: ['服务不需要头衔，只需要一颗纯净的心', '在苦难中保持尊严是最大的勇气'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '鲁希叶·哈努姆', nameEn: 'Rúhíyyih Khánum', religionId: bahaiId,
      dates: '1910-2000', title: '守基·阿芬第之妻·信仰之手',
      school: '巴哈伊圣女', generation: 2,
      biography: '鲁希叶·哈努姆（1910-2000），加拿大人，守基·阿芬第之妻，被任命为"信仰之手"。丈夫去世后，她成为巴哈伊社区最受尊敬的领袖之一。她走遍全球一百多个国家，特别关注原住民和边缘社区的发展。她的旅行和演讲为巴哈伊信仰在第三世界的传播做出了巨大贡献。',
      coreTeaching: '信仰必须走向世界的每个角落——特别是那些被遗忘的角落。文化多样性是人类的财富。服务穷人和原住民是信仰的核心使命。',
      templeNames: [], koans: [],
      classicQuotes: ['信仰不能只停留在书本上——它必须走到人民中间'],
      works: [{ title: '守基·阿芬第传', description: '圣护的权威传记' }],
      imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '纳瓦卜·哈努姆', nameEn: 'Navváb', religionId: bahaiId,
      dates: '1820-1886', title: '巴哈欧拉之妻·信仰之母',
      school: '巴哈伊圣女', generation: 2,
      biography: '纳瓦卜·哈努姆（1820-1886），巴哈欧拉的第一位妻子和最亲密的伴侣。她出身波斯贵族家庭，婚后经历了丈夫从尊贵到囚徒的巨大转变。她放弃了一切物质享受，追随丈夫经历了从德黑兰到巴格达到阿卡的全部流放之路。她被巴哈欧拉赐号"最崇高的叶子"。在极端困苦中她维系了家庭的团结。',
      coreTeaching: '对信仰的忠诚胜过一切物质享受。家庭的团结是社区团结的基础。在苦难中保持尊严和信心。',
      templeNames: [], koans: [],
      classicQuotes: ['我选择了与真理同行，即使道路通向监狱'],
      works: [], imageUrl: null,
    },
  });

  // ── 信仰之手 ──

  await prisma.patriarch.create({
    data: {
      name: '阿里·阿克巴尔·富鲁坦', nameEn: 'Ali-Akbar Furútan', religionId: bahaiId,
      dates: '1905-2003', title: '信仰之手·教育先驱',
      school: '信仰之手', generation: 1,
      biography: '富鲁坦（1905-2003），伊朗出生的巴哈伊"信仰之手"。他是杰出的教育家，在伊朗和全球推动巴哈伊教育体系的发展。1951年被守基·阿芬第任命为信仰之手。他活到九十七岁，是最后一批离世的信仰之手之一。他的教育理念强调品格培养与学术知识并重。',
      coreTeaching: '教育是改变世界最有力的工具。品格培养比知识传授更重要。教育要同时发展心灵和头脑。',
      templeNames: [], koans: [],
      classicQuotes: ['教育一个孩子就是改变一个世界', '品格是教育的灵魂'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '乌戈·贾凯里', nameEn: 'Ugo Giachery', religionId: bahaiId,
      dates: '1896-1989', title: '信仰之手·圣殿建筑师',
      school: '信仰之手', generation: 1,
      biography: '乌戈·贾凯里（1896-1989），意大利裔巴哈伊信仰之手。他是建筑师和工程师，负责监督了海法巴孛陵殿金色穹顶的建造——这是巴哈伊信仰最具标志性的建筑。他还参与了意大利卡利亚里巴哈伊灵曦堂的建设。他以对守基·阿芬第的绝对忠诚和专业精神著称。',
      coreTeaching: '建筑是信仰的物质表达。美是灵性的语言——圣殿的美应当反映信仰的崇高。专业技能奉献给信仰是最好的服务。',
      templeNames: [], koans: [],
      classicQuotes: ['每一块石头都承载着信仰', '美是通向神圣的窗户'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '多萝西·贝克', nameEn: 'Dorothy Baker', religionId: bahaiId,
      dates: '1898-1954', title: '信仰之手·美洲传教先驱',
      school: '信仰之手', generation: 1,
      biography: '多萝西·贝克（1898-1954），美国巴哈伊信仰之手。她是巴哈伊社区最有力的演说家之一，以热情和智慧在美洲大陆传播巴哈伊信仰。1954年在从印度返美途中飞机失事罹难。守基·阿芬第赞她为"巴哈欧拉英勇女儿"。她特别致力于消除种族偏见和促进种族团结。',
      coreTeaching: '种族偏见是人类最危险的疾病。行动比言辞更有力量。女性在建设新世界秩序中具有独特而不可替代的角色。',
      templeNames: [], koans: [],
      classicQuotes: ['种族团结不是选择，而是人类生存的必需', '每个人的心中都有一颗等待被点燃的火种'],
      works: [], imageUrl: null,
    },
  });

  // ── 教务先驱 ──

  await prisma.patriarch.create({
    data: {
      name: '玛莎·鲁特', nameEn: 'Martha Root', religionId: bahaiId,
      dates: '1872-1939', title: '伟大的教务旅行者',
      school: '教务先驱', generation: 1,
      biography: '玛莎·鲁特（1872-1939），美国记者和巴哈伊传教先驱，被守基·阿芬第赞为"前无古人的巴哈伊传道者"。她四次环游世界，走访了数十个国家，会见了各国元首、学者和平民。她是第一位在中国、日本和南美许多国家传播巴哈伊信仰的人。她在旅途中生活极其简朴，将所有资源用于传教。最终病逝于火奴鲁鲁。',
      coreTeaching: '一个人的行动可以改变世界。传教不需要富有——只需要热情和坚持。跨越文化界限传播真理是每个信徒的使命。',
      templeNames: [], koans: [],
      classicQuotes: ['整个世界是我的家', '一个有决心的灵魂可以照亮整个世界'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '海德·杜恩', nameEn: 'Hyde Dunn', religionId: bahaiId,
      dates: '1855-1941', title: '澳大利亚巴哈伊教之父',
      school: '教务先驱', generation: 1,
      biography: '海德·杜恩（1855-1941），英国出生的旅行推销员，被尊为"澳大利亚巴哈伊教之父"。1920年六十五岁时与妻子克拉拉移居澳大利亚传播巴哈伊信仰。在没有任何当地巴哈伊教徒的情况下，他们用二十余年建立了澳大利亚和新西兰的巴哈伊社区。他的坚持证明了年龄不是服务的障碍。',
      coreTeaching: '年龄不是服务信仰的障碍——六十五岁开始新的使命。夫妻合作是传教最有效的方式。坚持和耐心终会结出果实。',
      templeNames: [], koans: [],
      classicQuotes: ['六十五岁？正是开始新事业的好年纪'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '阿格尼斯·亚历山大', nameEn: 'Agnes Alexander', religionId: bahaiId,
      dates: '1875-1971', title: '日本巴哈伊教之母',
      school: '教务先驱', generation: 2,
      biography: '阿格尼斯·亚历山大（1875-1971），夏威夷出生的巴哈伊传教先驱，被尊为"日本巴哈伊教之母"。1914年首次前往日本，此后大部分人生在日本度过。在两次世界大战和关东大地震等巨大动荡中坚持留在日本。她以温和和坚韧赢得了日本朋友的尊敬，为巴哈伊信仰在东亚的传播奠定了基础。',
      coreTeaching: '文化差异不是传教的障碍而是学习的机会。尊重当地文化是传播信仰的前提。长期的陪伴比短暂的热情更有力量。',
      templeNames: [], koans: [],
      classicQuotes: ['日本教会了我耐心的艺术', '信仰之花在每一片土壤中都能绽放'],
      works: [], imageUrl: null,
    },
  });

  await prisma.patriarch.create({
    data: {
      name: '路易斯·格雷戈里', nameEn: 'Louis Gregory', religionId: bahaiId,
      dates: '1874-1951', title: '种族和谐先驱·信仰之手',
      school: '教务先驱', generation: 2,
      biography: '路易斯·格雷戈里（1874-1951），美国非裔律师和巴哈伊信仰之手。他是美国巴哈伊社区中种族团结运动的先驱。阿博都巴哈促成了他与白人巴哈伊路易莎·马修的婚姻——在1912年种族隔离的美国，这段跨种族婚姻本身就是对偏见的挑战。他一生致力于消除种族偏见，组织了大量的种族和谐活动。',
      coreTeaching: '种族偏见是人类最顽固的疾病，必须以行动而非空谈来治愈。跨种族的友谊和婚姻是打破偏见最有力的见证。',
      templeNames: [], koans: [],
      classicQuotes: ['种族团结不是理想——它是人类生存的必需', '爱是超越肤色的唯一力量'],
      works: [], imageUrl: null,
    },
  });

  const bahaiCount = 16;
  console.log(`  ✓ ${bahaiCount} new Bahá'í figures created + 2 updated (5 traditions: Bábí/Central/HolyWomen/Hands/Pioneers)`);

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

  // ── Merchants (旅游配套商家) ──
  await prisma.merchantService.deleteMany();
  await prisma.merchant.deleteMany();
  const merchantData = [
    // RESTAURANT 餐饮
    { type: 'RESTAURANT', name: '少林素斋馆', description: '嵩山少林寺旁百年素食老店，提供正宗少林素斋、药膳养生餐。食材取自嵩山本地有机农场，传承少林烹饪技艺。环境清幽，可容纳200人同时用餐。', province: '河南省', city: '登封市', address: '嵩山少林寺景区东门200米', contactPhone: '0371-62881234', contactEmail: 'shaolin.veggie@joinus.com', rating: 4.8, totalOrders: 562, logo: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80' },
    { type: 'RESTAURANT', name: '普陀山海鲜素食楼', description: '普陀山码头旁的特色餐厅，主打新鲜海味素食，融合舟山渔港风味与佛教素食传统。特色菜品：观音豆腐、罗汉斋、素蟹粉。提供朝圣团餐预订。', province: '浙江省', city: '舟山市', address: '普陀山景区南海观音广场旁', contactPhone: '0580-66991234', contactEmail: 'putuo.food@joinus.com', rating: 4.6, totalOrders: 389, logo: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' },
    { type: 'RESTAURANT', name: '曲阜儒家宴', description: '曲阜孔庙旁的文化主题餐厅，还原古代儒家宴席礼仪。提供孔府菜、鲁菜经典，每桌配有文化讲解员介绍菜品典故。适合文化研学团队。', province: '山东省', city: '曲阜市', address: '曲阜孔庙南门明故城步行街', contactPhone: '0537-44561234', contactEmail: 'qufu.feast@joinus.com', rating: 4.7, totalOrders: 234, logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80' },
    // HOTEL 酒店民宿
    { type: 'HOTEL', name: '嵩山禅意山居', description: '位于嵩山脚下的精品禅修民宿，共28间客房，每间均可远眺少室山。提供晨钟暮鼓叫醒服务、禅茶体验、抄经房。距少林寺车程10分钟。', province: '河南省', city: '登封市', address: '嵩山少林大道禅意谷', contactPhone: '0371-62887788', contactEmail: 'songshan.zen@joinus.com', rating: 4.9, totalOrders: 1203, logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
    { type: 'HOTEL', name: '九华山云端酒店', description: '九华山核心景区内的四星级酒店，海拔800米，云雾缭绕。提供108间客房、素食自助早餐、朝圣接驳车服务。可代订地藏王殿祈福。', province: '安徽省', city: '池州市', address: '九华山风景区天台索道旁', contactPhone: '0566-28881234', contactEmail: 'jiuhua.cloud@joinus.com', rating: 4.5, totalOrders: 876, logo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80' },
    { type: 'HOTEL', name: '五台山文殊院客栈', description: '五台山台怀镇中心的传统客栈，紧邻显通寺、塔院寺。提供藏式与汉式两种风格客房，含早课体验券。冬季提供暖炕房，是朝台最佳落脚点。', province: '山西省', city: '忻州市', address: '五台山台怀镇显通寺西街', contactPhone: '0350-65431234', contactEmail: 'wutai.inn@joinus.com', rating: 4.4, totalOrders: 654, logo: 'https://images.unsplash.com/photo-1587874522487-fbc83856c6f6?w=800&q=80' },
    // GUIDE 导游
    { type: 'GUIDE', name: '慧远法师讲解团', description: '专业佛教文化导游团队，成员均持国家导游证及佛学院进修证书。提供少林寺、龙门石窟、白马寺全程深度讲解。可用中英日韩四语服务。', province: '河南省', city: '洛阳市', address: '洛阳市老城区', contactPhone: '13800138001', contactEmail: 'huiyuan.guide@joinus.com', rating: 4.9, totalOrders: 2341, logo: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80' },
    { type: 'GUIDE', name: '圣地朝圣领队', description: '专注耶路撒冷、伯利恒、拿撒勒三圣地的华人朝圣领队。团队由神学院毕业生组成，提供深度圣经历史讲解、灵修带领。每团限20人。', province: '', city: '', address: 'Jerusalem, Israel', contactPhone: '+972-52-1234567', contactEmail: 'holyland.guide@joinus.com', rating: 4.8, totalOrders: 456, logo: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80' },
    { type: 'GUIDE', name: '普陀山朝圣向导', description: '舟山本地人组成的普陀山专业导游团队，熟悉每座寺院典故。提供半日游、一日游、两日深度游三种路线，含素斋安排和住宿推荐。', province: '浙江省', city: '舟山市', address: '普陀山码头游客中心', contactPhone: '13900139001', contactEmail: 'putuo.guide@joinus.com', rating: 4.7, totalOrders: 1876, logo: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80' },
    // TRANSPORT 交通
    { type: 'TRANSPORT', name: '嵩山朝圣巴士', description: '提供郑州—登封—少林寺往返巴士、嵩山景区内部接驳车。全程GPS追踪，配备讲解音频系统。支持团队包车和个人拼车两种模式。', province: '河南省', city: '登封市', address: '郑州东站旅游集散中心', contactPhone: '0371-62889999', contactEmail: 'songshan.bus@joinus.com', rating: 4.3, totalOrders: 3456, logo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80' },
    { type: 'TRANSPORT', name: '九华山云梯接驳', description: '九华山景区官方合作接驳车服务。提供池州高铁站—九华山、景区内各寺院间的电瓶车接驳。老年人和行动不便者可预约无障碍专车。', province: '安徽省', city: '池州市', address: '九华山游客服务中心', contactPhone: '0566-28889999', contactEmail: 'jiuhua.shuttle@joinus.com', rating: 4.2, totalOrders: 5678, logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80' },
    // TEMPLE_SERVICE 寺院服务
    { type: 'TEMPLE_SERVICE', name: '少林武僧禅修营', description: '少林寺官方合作禅修项目，由武僧亲授少林功夫基础、坐禅冥想。提供3天、7天、21天三种课程。含食宿、僧衣、结业证书。', province: '河南省', city: '登封市', address: '少林寺禅修院', contactPhone: '0371-62886666', contactEmail: 'shaolin.retreat@joinus.com', rating: 5.0, totalOrders: 890, logo: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80' },
    { type: 'TEMPLE_SERVICE', name: '灵隐寺祈福服务', description: '杭州灵隐寺官方祈福代办，提供供灯、抄经、放生、超度等佛事服务。可远程预约，寺院法师代为回向。附赠祈福证书和开光护身符。', province: '浙江省', city: '杭州市', address: '杭州灵隐寺', contactPhone: '0571-87968665', contactEmail: 'lingyin.prayer@joinus.com', rating: 4.8, totalOrders: 2345, logo: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80' },
    { type: 'TEMPLE_SERVICE', name: '五台山朝台仪轨', description: '五台山朝台专业仪轨服务，由五台山佛学院法师带领。提供大朝台(五个台顶)全程仪轨指导、诵经、供养。含朝台地图和补给。', province: '山西省', city: '忻州市', address: '五台山黛螺顶', contactPhone: '0350-65438888', contactEmail: 'wutai.ritual@joinus.com', rating: 4.9, totalOrders: 567, logo: 'https://images.unsplash.com/photo-1609100716148-f99e0ebb6a4b?w=800&q=80' },
    // SHOPPING 购物
    { type: 'SHOPPING', name: '菩提阁佛教文创', description: '专营佛教文化创意产品的连锁品牌。产品包括：手串念珠、香道用品、佛像摆件、经典书籍、禅意茶器。支持定制刻字和开光服务。', province: '河南省', city: '登封市', address: '少林寺景区商业街A12', contactPhone: '0371-62885555', contactEmail: 'bodhi.shop@joinus.com', rating: 4.5, totalOrders: 4567, logo: 'https://images.unsplash.com/photo-1599404980919-23bb32e1abc0?w=800&q=80' },
    { type: 'SHOPPING', name: '圣城纪念品中心', description: '耶路撒冷老城区的综合纪念品商店，提供十字架、橄榄木雕、死海泥制品、犹太教法器等。所有商品均附原产地证明。支持国际邮寄。', province: '', city: '', address: 'Old City, Jerusalem', contactPhone: '+972-2-6271234', contactEmail: 'jerusalem.gifts@joinus.com', rating: 4.3, totalOrders: 890, logo: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80' },
    // PHOTOGRAPHY 摄影
    { type: 'PHOTOGRAPHY', name: '云游摄影工作室', description: '专注宗教文化旅行摄影的专业团队。提供朝圣跟拍、寺院写真、航拍全景、延时摄影。作品多次获国际宗教摄影奖。可出差至全国各大寺院。', province: '浙江省', city: '杭州市', address: '杭州市西湖区灵隐路', contactPhone: '13700137001', contactEmail: 'cloud.photo@joinus.com', rating: 4.9, totalOrders: 345, logo: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&q=80' },
    { type: 'PHOTOGRAPHY', name: '禅光影像', description: '嵩山地区唯一持证无人机航拍团队。提供少林寺、嵩岳寺塔、嵩山全景航拍。可制作VR全景、延时视频。团队摄影和个人旅拍均可预约。', province: '河南省', city: '登封市', address: '登封市崇高路创意产业园', contactPhone: '13600136001', contactEmail: 'zen.light@joinus.com', rating: 4.6, totalOrders: 234, logo: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80' },
    // WELLNESS 养生
    { type: 'WELLNESS', name: '少林养生堂', description: '传承少林养生功法的专业健康中心。提供八段锦教学、少林药浴、艾灸理疗、太极晨练。由少林药局合作中医师坐诊。朝圣后恢复体力首选。', province: '河南省', city: '登封市', address: '嵩山少林大道养生谷', contactPhone: '0371-62883333', contactEmail: 'shaolin.wellness@joinus.com', rating: 4.7, totalOrders: 678, logo: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80' },
    { type: 'WELLNESS', name: '九华山禅茶养生馆', description: '九华山特色禅茶体验馆，提供禅茶道教学、九华佛茶品鉴、茶山徒步。独家供应九华毛峰、金地藏茶。禅茶一味，静心养神。', province: '安徽省', city: '池州市', address: '九华山柯村茶园', contactPhone: '0566-28887777', contactEmail: 'jiuhua.tea@joinus.com', rating: 4.8, totalOrders: 432, logo: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80' },
    // CULTURAL_EXPERIENCE 文化体验
    { type: 'CULTURAL_EXPERIENCE', name: '嵩山书法研习社', description: '在嵩山脚下学习中国传统书法。课程包括：基础笔法、心经抄写、碑帖临摹。提供半日体验和5日深度研习两种课程。作品可裱装带走。', province: '河南省', city: '登封市', address: '嵩山书院文化街', contactPhone: '0371-62884444', contactEmail: 'songshan.calligraphy@joinus.com', rating: 4.8, totalOrders: 345, logo: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80' },
    { type: 'CULTURAL_EXPERIENCE', name: '曲阜六艺体验馆', description: '曲阜孔庙旁的儒家六艺(礼乐射御书数)沉浸式体验。穿汉服、行古礼、习射艺、抚古琴。适合亲子研学和企业团建。每场限30人。', province: '山东省', city: '曲阜市', address: '曲阜明故城内', contactPhone: '0537-44567890', contactEmail: 'qufu.arts@joinus.com', rating: 4.7, totalOrders: 567, logo: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80' },
    { type: 'CULTURAL_EXPERIENCE', name: '敦煌壁画临摹坊', description: '在敦煌莫高窟旁体验千年壁画临摹技艺。由敦煌研究院认证讲师指导，使用传统矿物颜料。提供2小时体验课和3天专业课程。', province: '甘肃省', city: '敦煌市', address: '敦煌市鸣沙山路文创园', contactPhone: '0937-88821234', contactEmail: 'dunhuang.art@joinus.com', rating: 4.9, totalOrders: 289, logo: 'https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?w=800&q=80' },
  ];

  // Create seed users for merchants (one per merchant)
  const merchantUsers = [];
  for (let i = 0; i < merchantData.length; i++) {
    const user = await prisma.user.upsert({
      where: { email: `merchant${i + 1}@joinus.com` },
      update: {},
      create: {
        email: `merchant${i + 1}@joinus.com`,
        nickname: merchantData[i].name,
        role: 'PILGRIM',
        language: 'zh-CN',
      },
    });
    merchantUsers.push(user);
  }

  // Create merchants
  const merchants = [];
  for (let i = 0; i < merchantData.length; i++) {
    const d = merchantData[i];
    const m = await prisma.merchant.create({
      data: {
        userId: merchantUsers[i].id,
        type: d.type,
        name: d.name,
        description: d.description,
        logo: d.logo,
        province: d.province,
        city: d.city,
        address: d.address,
        contactPhone: d.contactPhone,
        contactEmail: d.contactEmail,
        rating: d.rating,
        totalOrders: d.totalOrders,
        status: 'ACTIVE',
        approvedAt: new Date(),
      },
    });
    merchants.push(m);
  }

  // Services for each merchant
  const serviceTemplates: Record<string, Array<{ name: string; description: string; price: number; duration: number | null; maxPersons: number | null; coverImage: string }>> = {
    RESTAURANT: [
      { name: '素斋套餐', description: '精选8道素食料理+汤+甜品', price: 8800, duration: 90, maxPersons: 10, coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' },
      { name: '朝圣团餐', description: '20人起订，含10菜1汤', price: 5800, duration: 60, maxPersons: 50, coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },
      { name: '药膳养生餐', description: '根据时令配制的养生药膳', price: 12800, duration: 120, maxPersons: 8, coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80' },
    ],
    HOTEL: [
      { name: '禅意标准间', description: '含双床、禅茶角、素食早餐', price: 38800, duration: null, maxPersons: 2, coverImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80' },
      { name: '山景大床房', description: '可远眺山景的豪华大床房', price: 58800, duration: null, maxPersons: 2, coverImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80' },
      { name: '禅修套房', description: '含独立禅修室、茶室、浴缸', price: 88800, duration: null, maxPersons: 4, coverImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80' },
    ],
    GUIDE: [
      { name: '半日深度讲解', description: '核心景点3小时深度导览', price: 29800, duration: 180, maxPersons: 20, coverImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80' },
      { name: '全日朝圣导览', description: '全天8小时含午餐安排', price: 49800, duration: 480, maxPersons: 15, coverImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80' },
      { name: 'VIP私人订制', description: '1对1专属导游全程陪同', price: 99800, duration: 480, maxPersons: 4, coverImage: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80' },
    ],
    TRANSPORT: [
      { name: '单程接驳', description: '高铁站/机场至景区单程', price: 8800, duration: 60, maxPersons: 4, coverImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80' },
      { name: '全日包车', description: '含司机全天候服务', price: 38800, duration: 600, maxPersons: 7, coverImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80' },
      { name: '景区电瓶车', description: '景区内各站点自由上下', price: 2000, duration: null, maxPersons: 1, coverImage: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800&q=80' },
    ],
    TEMPLE_SERVICE: [
      { name: '供灯祈福', description: '在大殿供奉莲花灯', price: 9900, duration: 30, maxPersons: null, coverImage: 'https://images.unsplash.com/photo-1541542684-4a9c1c1a72a7?w=800&q=80' },
      { name: '抄经体验', description: '提供经文、笔墨、指导', price: 5800, duration: 120, maxPersons: 1, coverImage: 'https://images.unsplash.com/photo-1583425423320-1aa6c5a76a6b?w=800&q=80' },
      { name: '禅修课程(3天)', description: '含食宿的短期禅修体验', price: 98800, duration: 4320, maxPersons: 1, coverImage: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80' },
    ],
    SHOPPING: [
      { name: '开光手串', description: '天然菩提/檀木手串含开光', price: 12800, duration: null, maxPersons: null, coverImage: 'https://images.unsplash.com/photo-1611107683227-e9060eccd846?w=800&q=80' },
      { name: '线香礼盒', description: '精选沉香/檀香线香套装', price: 6800, duration: null, maxPersons: null, coverImage: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80' },
      { name: '佛经典藏套装', description: '精装佛教经典5本套装', price: 16800, duration: null, maxPersons: null, coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80' },
    ],
    PHOTOGRAPHY: [
      { name: '朝圣跟拍(半天)', description: '专业摄影师全程跟拍3小时', price: 59800, duration: 180, maxPersons: 6, coverImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80' },
      { name: '航拍全景', description: '无人机航拍+后期制作', price: 39800, duration: 120, maxPersons: null, coverImage: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80' },
      { name: '个人旅拍写真', description: '含化妆造型+30张精修', price: 79800, duration: 240, maxPersons: 2, coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80' },
    ],
    WELLNESS: [
      { name: '八段锦晨练', description: '清晨跟随师傅习练八段锦', price: 5800, duration: 60, maxPersons: 20, coverImage: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800&q=80' },
      { name: '少林药浴', description: '传统草药泡浴+推拿', price: 28800, duration: 90, maxPersons: 1, coverImage: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80' },
      { name: '禅茶品鉴', description: '品鉴5款禅茶+茶道讲解', price: 16800, duration: 120, maxPersons: 8, coverImage: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=800&q=80' },
    ],
    CULTURAL_EXPERIENCE: [
      { name: '书法体验(半日)', description: '学习基础笔法+抄写心经', price: 19800, duration: 180, maxPersons: 10, coverImage: 'https://images.unsplash.com/photo-1605035015406-b7b50bd04351?w=800&q=80' },
      { name: '古琴入门', description: '学习一首古琴曲', price: 29800, duration: 120, maxPersons: 4, coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80' },
      { name: '汉服体验', description: '含汉服租赁+妆造+摄影', price: 25800, duration: 180, maxPersons: 2, coverImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80' },
    ],
  };

  for (const m of merchants) {
    const templates = serviceTemplates[m.type] || serviceTemplates['GUIDE'];
    for (const svc of templates) {
      await prisma.merchantService.create({
        data: {
          merchantId: m.id,
          name: svc.name,
          description: svc.description,
          coverImage: svc.coverImage,
          price: svc.price,
          duration: svc.duration,
          maxPersons: svc.maxPersons,
          isActive: true,
        },
      });
    }
  }

  console.log(`  Merchants: ${merchants.length}`);
  console.log(`  Merchant Services: ${merchants.length * 3}`);

  // ── Travel Packages ──
  console.log('Creating travel packages...');
  await prisma.packageBooking.deleteMany();
  await prisma.travelPackage.deleteMany();
  const packageData = [
    {
      name: '禅宗经典朝圣5日游',
      description: '追随六祖慧能足迹，遍访禅宗祖庭，深度体验禅修文化',
      coverImage: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600',
      packageType: 'CLASSIC',
      basePrice: 328000,
      memberPrice: 298000,
      includes: { transport: true, hotel: true, meal: true, guide: true, insurance: true, ticket: true },
      duration: 5,
      maxPersons: 20,
    },
    {
      name: '佛教四大名山深度体验8日',
      description: '五台山、峨眉山、普陀山、九华山一次走遍，深度禅修+素斋体验',
      coverImage: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600',
      packageType: 'DEEP',
      basePrice: 598000,
      memberPrice: 538000,
      includes: { transport: true, hotel: true, meal: true, guide: true, insurance: true, ticket: true },
      duration: 8,
      maxPersons: 15,
    },
    {
      name: '丝路文明尊享VIP10日',
      description: '私人导游、五星酒店、专属车队，沿丝绸之路探访清真寺与佛窟',
      coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600',
      packageType: 'VIP',
      basePrice: 1280000,
      memberPrice: 1180000,
      includes: { transport: true, hotel: true, meal: true, guide: true, insurance: true, ticket: true },
      duration: 10,
      maxPersons: 8,
    },
    {
      name: '道教名山自由行3日',
      description: '武当山/龙虎山任选，含住宿+门票，行程自由安排',
      coverImage: 'https://images.unsplash.com/photo-1537531383496-f4749be1d49a?w=600',
      packageType: 'FREE',
      basePrice: 158000,
      memberPrice: 138000,
      includes: { transport: false, hotel: true, meal: false, guide: false, insurance: true, ticket: true },
      duration: 3,
      maxPersons: 30,
    },
    {
      name: '基督教圣地巡礼团7日',
      description: '耶路撒冷+伯利恒+拿撒勒，专业宗教学者随团讲解',
      coverImage: 'https://images.unsplash.com/photo-1547483238-2cbf881a559f?w=600',
      packageType: 'GROUP',
      basePrice: 880000,
      memberPrice: 798000,
      includes: { transport: true, hotel: true, meal: true, guide: true, insurance: true, ticket: true },
      duration: 7,
      maxPersons: 25,
    },
    {
      name: '恒河圣城经典朝圣6日',
      description: '瓦拉纳西+菩提伽耶+鹿野苑，感受印度教与佛教的千年交融',
      coverImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600',
      packageType: 'CLASSIC',
      basePrice: 458000,
      memberPrice: 418000,
      includes: { transport: true, hotel: true, meal: true, guide: true, insurance: true, ticket: false },
      duration: 6,
      maxPersons: 20,
    },
  ];

  for (const pkg of packageData) {
    await prisma.travelPackage.create({ data: pkg });
  }
  console.log(`  ✓ ${packageData.length} travel packages created`);

  // ── 团队文化打造 (M32) ──
  console.log('Creating team culture themes & cases...');
  const themesData = [
    {
      slug: 'tongxin', title: '同心之旅', subtitle: '让团队在朝圣中凝聚',
      description: '通过共同朝圣、共修仪式与团体禅行，让组织成员在天地祖庭面前回到同一颗初心，凝聚团队共识。',
      color: '#D4A855', icon: '☯', coverUrl: 'https://images.unsplash.com/photo-1545569310-25c4e8eb7eb1?w=1200',
      keywords: ['凝聚', '共识', '同行'], holySites: ['shaolin-temple', 'wudang-mountain'], routes: [],
      rituals: [
        { name: '同心共诵', durationMin: 30, description: '团队齐诵祖训三十句' },
        { name: '同行徒步', durationMin: 120, description: '一同登山到祖庭主殿' },
        { name: '同心愿牌', durationMin: 20, description: '每人挂上同主题的愿牌' },
      ],
      priceFrom: 488000, durationDays: 4, sortOrder: 10,
    },
    {
      slug: 'ganen', title: '感恩之旅', subtitle: '回到文化的源头致谢',
      description: '感恩父母、感恩师长、感恩天地。在祖庭与圣地之间，让每一位成员体会"感恩文化"的厚度。',
      color: '#F59E0B', icon: '🙏', coverUrl: 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=1200',
      keywords: ['感恩', '回馈', '传承'], holySites: ['kongmiao-qufu'], routes: [],
      rituals: [
        { name: '奉茶礼', durationMin: 30, description: '团队为长辈/同伴奉茶' },
        { name: '供灯仪', durationMin: 20, description: '在祖庭供灯发愿' },
      ],
      priceFrom: 388000, durationDays: 3, sortOrder: 20,
    },
    {
      slug: 'chuancheng', title: '传承之旅', subtitle: '从祖师手中接过那一印',
      description: '为有传承使命的团队设计：师徒交接、立志立愿、受印仪式。承接曹溪三十印之精神。',
      color: '#7C3AED', icon: '✦', coverUrl: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d1e9e9?w=1200',
      keywords: ['师徒', '受印', '立愿'], holySites: ['caoxi-temple'], routes: [],
      rituals: [
        { name: '受印礼', durationMin: 60, description: '在祖庭主殿举行受印仪式' },
        { name: '立愿牌', durationMin: 30, description: '亲手书写并悬挂传承愿牌' },
      ],
      priceFrom: 688000, durationDays: 5, sortOrder: 30,
    },
    {
      slug: 'jiangxin', title: '匠心之旅', subtitle: '在工艺中见心',
      description: '面向工程师/设计师/手艺人。在祖庭的木构、塑像、壁画之间，体会千年匠心，重燃专业热爱。',
      color: '#0891B2', icon: '◈', coverUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200',
      keywords: ['匠心', '专注', '工艺'], holySites: ['horyuji-temple'], routes: [],
      rituals: [
        { name: '观造一日', durationMin: 240, description: '观摩木作/塑像/壁画修复' },
        { name: '习艺工作坊', durationMin: 180, description: '在导师指导下习作小件' },
      ],
      priceFrom: 588000, durationDays: 4, sortOrder: 40,
    },
    {
      slug: 'cibei', title: '慈悲之旅', subtitle: '让公益成为团队基因',
      description: '把团建变成公益。施食、放生、捐书、助学，在朝圣中沉淀团队的慈悲底色。',
      color: '#10B981', icon: '✧', coverUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200',
      keywords: ['慈悲', '公益', '回馈'], holySites: ['lumbini'], routes: [],
      rituals: [
        { name: '施食仪', durationMin: 60, description: '为周边需要者准备一餐' },
        { name: '助学捐书', durationMin: 30, description: '团队为乡村学校捐赠' },
      ],
      priceFrom: 358000, durationDays: 3, sortOrder: 50,
    },
    {
      slug: 'jianyi', title: '坚毅之旅', subtitle: '在逆境中重生',
      description: '为挑战中的团队设计：高山、夜行、守夜、断食小修。让组织在身体与意志的考验中重新出发。',
      color: '#DC2626' , icon: '✶', coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
      keywords: ['坚毅', '突破', '重生'], holySites: ['mecca'], routes: [],
      rituals: [
        { name: '登山守夜', durationMin: 480, description: '团队登山并在祖庭守夜' },
        { name: '晨光发愿', durationMin: 30, description: '日出时刻团队齐发新愿' },
      ],
      priceFrom: 798000, durationDays: 6, sortOrder: 60,
    },
  ];
  for (const t of themesData) {
    await prisma.teamCultureTheme.upsert({ where: { slug: t.slug }, update: t, create: t });
  }
  console.log(`  ✓ ${themesData.length} team culture themes created`);

  const tongxin = await prisma.teamCultureTheme.findUnique({ where: { slug: 'tongxin' } });
  const ganen = await prisma.teamCultureTheme.findUnique({ where: { slug: 'ganen' } });

  const casesData = [
    {
      slug: 'case-tech-tongxin-2025', teamName: '某互联网公司技术中台 50 人团队',
      orgType: 'ENTERPRISE' as const, industry: '互联网',
      themeId: tongxin?.id, headcount: 50,
      story: '在连续加班半年后，技术中台团队来到少林寺与武当山，进行了为期 4 天的"同心之旅"。从晨钟到暮鼓，从齐诵祖训到同行登山，团队在朝圣的每一步中重新找到工作之外的连接。回到岗位后，技术债清理速度提升 40%，离职率下降明显。',
      highlights: ['团队凝聚显著提升', '离职率下降', '协作效率 +40%'],
      photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800'],
      testimonial: '这是我做过最有意义的团建。— 技术总监',
      consentSigned: true, isPublished: true, publishedAt: new Date(),
    },
    {
      slug: 'case-exec-ganen-2025', teamName: '某上市公司高管团队 18 人',
      orgType: 'EXECUTIVE' as const, industry: '高端制造',
      themeId: ganen?.id, headcount: 18,
      story: '在年度战略复盘前，18 位 VP 与事业部总裁走进曲阜孔庙，进行 3 天"感恩之旅"。在大成殿前向至圣先师致敬，在杏坛之下重读《学记》。回到公司后，董事会与高管层在战略对齐与决策共识上效率显著提升。',
      highlights: ['高管层共识对齐', '战略决策提速', '组织信念升华'],
      photos: ['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'],
      testimonial: '让我们重新理解了"领导者"三个字。— CEO',
      consentSigned: true, isPublished: true, publishedAt: new Date(),
    },
  ];
  for (const c of casesData) {
    await prisma.teamCase.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  console.log(`  ✓ ${casesData.length} team culture cases created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
