/**
 * M38 经论大系统 种子数据
 *
 * 三圈同心圆:
 *   Ring 1: 禅宗一花五叶 (~25部)
 *   Ring 2: 佛教八大宗派 (~40部)
 *   Ring 3: 11大信仰传统 (~55部)
 *
 * 幂等: upsert by slug, 可重跑
 * 用法: cd services/api && npx tsx prisma/seed-scriptures.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ════════════════════════════════════════════════════
// 分类定义 (树形)
// ════════════════════════════════════════════════════

interface CatDef {
  slug: string; name: string; nameEn?: string;
  ring: number; tradition: string;
  icon?: string; color?: string; description?: string;
  parentSlug?: string; sortOrder: number;
}

const CATEGORIES: CatDef[] = [
  // ── Ring 1: 禅宗核心 ──
  { slug: 'zen-core', name: '禅宗核心', nameEn: 'Zen Core', ring: 1, tradition: 'ZEN', icon: '🪷', color: '#D4A855', description: '六祖坛经及禅宗根本经典', sortOrder: 0 },
  { slug: 'zen-linji', name: '临济宗', nameEn: 'Linji School', ring: 1, tradition: 'ZEN', icon: '⚡', color: '#E8B84B', parentSlug: 'zen-core', description: '棒喝交驰，机锋峻烈', sortOrder: 1 },
  { slug: 'zen-caodong', name: '曹洞宗', nameEn: 'Caodong School', ring: 1, tradition: 'ZEN', icon: '🌊', color: '#C49B3C', parentSlug: 'zen-core', description: '默照禅修，绵密功夫', sortOrder: 2 },
  { slug: 'zen-guiyang', name: '沩仰宗', nameEn: 'Guiyang School', ring: 1, tradition: 'ZEN', icon: '🔄', color: '#B8912E', parentSlug: 'zen-core', description: '父子唱和，圆相接机', sortOrder: 3 },
  { slug: 'zen-yunmen', name: '云门宗', nameEn: 'Yunmen School', ring: 1, tradition: 'ZEN', icon: '☁️', color: '#A88520', parentSlug: 'zen-core', description: '一字关，截断众流', sortOrder: 4 },
  { slug: 'zen-fayan', name: '法眼宗', nameEn: 'Fayan School', ring: 1, tradition: 'ZEN', icon: '👁️', color: '#987912', parentSlug: 'zen-core', description: '明心见性，融通教禅', sortOrder: 5 },
  // ── Ring 2: 佛教八大宗派 ──
  { slug: 'buddhist-zen', name: '禅宗经典', nameEn: 'Chan Scriptures', ring: 2, tradition: 'BUDDHISM', icon: '📿', color: '#D4A855', description: '禅宗相关大乘经典', sortOrder: 0 },
  { slug: 'buddhist-pureland', name: '净土宗', nameEn: 'Pure Land', ring: 2, tradition: 'BUDDHISM', icon: '🌸', color: '#E07CC7', description: '念佛往生，三经一论', sortOrder: 1 },
  { slug: 'buddhist-tiantai', name: '天台宗', nameEn: 'Tiantai', ring: 2, tradition: 'BUDDHISM', icon: '🏔️', color: '#4A9EDE', description: '一念三千，止观双运', sortOrder: 2 },
  { slug: 'buddhist-huayan', name: '华严宗', nameEn: 'Huayan', ring: 2, tradition: 'BUDDHISM', icon: '💎', color: '#8B5CF6', description: '一即一切，事事无碍', sortOrder: 3 },
  { slug: 'buddhist-vinaya', name: '律宗', nameEn: 'Vinaya', ring: 2, tradition: 'BUDDHISM', icon: '📏', color: '#059669', description: '戒律清净，三学基础', sortOrder: 4 },
  { slug: 'buddhist-yogacara', name: '唯识宗', nameEn: 'Yogacara', ring: 2, tradition: 'BUDDHISM', icon: '🧠', color: '#DC2626', description: '万法唯识，转识成智', sortOrder: 5 },
  { slug: 'buddhist-madhyamaka', name: '三论宗', nameEn: 'Madhyamaka', ring: 2, tradition: 'BUDDHISM', icon: '⚖️', color: '#2563EB', description: '中观般若，八不中道', sortOrder: 6 },
  { slug: 'buddhist-esoteric', name: '密宗', nameEn: 'Esoteric', ring: 2, tradition: 'BUDDHISM', icon: '🔮', color: '#7C3AED', description: '三密加持，即身成佛', sortOrder: 7 },
  { slug: 'buddhist-general', name: '大小乘通用', nameEn: 'General Buddhist', ring: 2, tradition: 'BUDDHISM', icon: '📖', color: '#F59E0B', description: '诸宗共学经典', sortOrder: 8 },
  // ── Ring 3: 11大信仰传统 ──
  { slug: 'taoism', name: '道教经典', nameEn: 'Taoist Classics', ring: 3, tradition: 'TAOISM', icon: '☯', color: '#10B981', sortOrder: 0 },
  { slug: 'confucianism', name: '儒家经典', nameEn: 'Confucian Classics', ring: 3, tradition: 'CONFUCIANISM', icon: '📚', color: '#8B4513', sortOrder: 1 },
  { slug: 'christianity', name: '基督经典', nameEn: 'Christian Scriptures', ring: 3, tradition: 'CHRISTIANITY', icon: '✝️', color: '#3B82F6', sortOrder: 2 },
  { slug: 'islam', name: '伊斯兰经典', nameEn: 'Islamic Scriptures', ring: 3, tradition: 'ISLAM', icon: '☪️', color: '#059669', sortOrder: 3 },
  { slug: 'hinduism', name: '印度经典', nameEn: 'Hindu Scriptures', ring: 3, tradition: 'HINDUISM', icon: '🕉️', color: '#F97316', sortOrder: 4 },
  { slug: 'judaism', name: '犹太经典', nameEn: 'Jewish Scriptures', ring: 3, tradition: 'JUDAISM', icon: '✡️', color: '#1D4ED8', sortOrder: 5 },
  { slug: 'sikhism', name: '锡克经典', nameEn: 'Sikh Scriptures', ring: 3, tradition: 'SIKHISM', icon: '🪯', color: '#EA580C', sortOrder: 6 },
  { slug: 'tibetan', name: '藏传经典', nameEn: 'Tibetan Scriptures', ring: 3, tradition: 'TIBETAN', icon: '🏔️', color: '#9333EA', sortOrder: 7 },
  { slug: 'shinto', name: '神道经典', nameEn: 'Shinto Texts', ring: 3, tradition: 'SHINTO', icon: '⛩️', color: '#DC2626', sortOrder: 8 },
  { slug: 'indigenous', name: '原住民经典', nameEn: 'Indigenous Wisdom', ring: 3, tradition: 'INDIGENOUS', icon: '🌍', color: '#65A30D', sortOrder: 9 },
  { slug: 'bahai', name: '巴哈伊经典', nameEn: 'Bahai Scriptures', ring: 3, tradition: 'BAHAI', icon: '⭐', color: '#7C3AED', sortOrder: 10 },
];

// ════════════════════════════════════════════════════
// 经论定义
// ════════════════════════════════════════════════════

interface ScriptureDef {
  slug: string; title: string; titleEn?: string;
  author?: string; era?: string;
  catSlug: string; tradition: string; ring: number;
  summary: string; significance?: string;
  difficulty: number; oxStageMin: number; oxStageMax: number;
  tags: string[]; sortOrder: number;
  relatedSlugs?: string[];
  chapters: ChapterDef[];
}

interface ChapterDef {
  chapterNo: number; title: string; subtitle?: string;
  originalText: string; commentary?: string;
  keyQuotes?: { quote: string; explanation: string }[];
  practiceHint?: string;
}

const SCRIPTURES: ScriptureDef[] = [
  // ══════════════════════════════════════════════
  // RING 1: 禅宗核心 (~25部)
  // ══════════════════════════════════════════════

  // ── 六祖坛经 (核心中的核心) ──
  {
    slug: 'platform-sutra', title: '六祖坛经', titleEn: 'Platform Sutra',
    author: '惠能', era: '唐代',
    catSlug: 'zen-core', tradition: 'ZEN', ring: 1,
    summary: '禅宗最重要的经典，记录六祖惠能大师的生平事迹和说法内容。惠能以"菩提本无树，明镜亦非台"的偈语得五祖弘忍传法，开创南宗顿悟法门。坛经主张"直指人心，见性成佛"，强调自性清净，本自具足，不假外求。全经分为十品，涵盖从惠能身世到说法传承的完整内容，是中国佛教史上唯一被尊称为"经"的祖师著作。',
    significance: '禅宗一花五叶的根基，中国佛教顿悟法门的总纲，修行圈经论体系的核心。一切禅修功夫、公案参究皆可溯源于此。',
    difficulty: 3, oxStageMin: 1, oxStageMax: 10,
    tags: ['禅宗', '六祖', '惠能', '顿悟', '坛经', '见性成佛'],
    sortOrder: 0,
    relatedSlugs: ['diamond-sutra', 'heart-sutra', 'linji-lu', 'xinxin-ming'],
    chapters: [
      { chapterNo: 1, title: '行由品第一', subtitle: '惠能得法因缘',
        originalText: '时大师至宝林，韶州韦刺史与官僚入山请师，出于城中大梵寺讲堂，为众开缘说法。师升座次，刺史官僚三十余人、儒宗学士三十余人、僧尼道俗一千余人，同时作礼，愿闻法要。\n\n大师告众曰："善知识，菩提自性，本来清净，但用此心，直了成佛。善知识，且听惠能行由得法事意。"\n\n惠能严父本贯范阳，左降流于岭南，作新州百姓。此身不幸，父又早亡，老母孤遗，移来南海。艰辛贫乏，于市卖柴。',
        commentary: '行由品记述惠能从出身寒微到得五祖传法的全过程。"菩提自性，本来清净"八个字，是整部坛经的核心。惠能以一介樵夫，闻《金刚经》"应无所住而生其心"而开悟，说明佛性人人本具，不在学问高低。',
        keyQuotes: [
          { quote: '菩提自性，本来清净，但用此心，直了成佛', explanation: '坛经总纲。自性即是佛性，不需外求，直下承当即是。' },
          { quote: '菩提本无树，明镜亦非台，本来无一物，何处惹尘埃', explanation: '惠能呈心偈，破神秀渐修之见，直指空性。' },
        ],
        practiceHint: '每日反问自己："我的本来面目是什么？"不从思维中找答案，而是在觉知当下的一刹那体会。' },
      { chapterNo: 2, title: '般若品第二', subtitle: '摩诃般若波罗蜜',
        originalText: '次日，韦刺史请益。师升座，告大众曰："总净心念摩诃般若波罗蜜多。"\n\n复云："善知识，菩提般若之智，世人本自有之，只缘心迷不能自悟，须假大善知识示导见性。当知愚人智人，佛性本无差别，只缘迷悟不同，所以有愚有智。\n\n吾今为说摩诃般若波罗蜜法，使汝等各得智慧。听吾说者，悉皆成佛。善知识，摩诃般若波罗蜜，此言大智慧到彼岸。"',
        commentary: '般若品阐明般若智慧的要义。惠能指出般若智慧人人本具，"世人本自有之"，迷悟之间只在一念。',
        keyQuotes: [
          { quote: '佛性本无差别，只缘迷悟不同，所以有愚有智', explanation: '打破智愚二分，人人平等拥有佛性。' },
          { quote: '不悟即佛是众生，一念悟时众生是佛', explanation: '佛与众生之别仅在一念之间。' },
        ],
        practiceHint: '试着在日常中保持般若觉照：做事时全然专注，不加评判，不被念头带走。' },
      { chapterNo: 3, title: '定慧品第三', subtitle: '定慧一体',
        originalText: '师示众云："善知识，我此法门，以定慧为本，大众勿迷言定慧别。定慧一体，不是二。定是慧体，慧是定用。即慧之时定在慧，即定之时慧在定。若识此义，即是定慧等学。\n\n诸学道人，莫言先定发慧、先慧发定各别。作此见者，法有二相。口说善语，心中不善，空有定慧，定慧不等。若心口俱善，内外一如，定慧即等。"',
        commentary: '定慧品是坛经修行论的核心。惠能反对将定与慧分为先后次第，主张"定慧一体"，犹如灯与光的关系——有灯即有光，有光即有灯。',
        keyQuotes: [
          { quote: '定慧一体，不是二。定是慧体，慧是定用', explanation: '定与慧不可分割，静中有觉，觉中有静。' },
        ],
        practiceHint: '打坐时不追求"入定"的特殊状态，而是保持清明觉照。行住坐卧皆是禅。' },
    ],
  },

  // ── 信心铭 ──
  {
    slug: 'xinxin-ming', title: '信心铭', titleEn: 'Inscription on Faith in Mind',
    author: '三祖僧璨', era: '隋代',
    catSlug: 'zen-core', tradition: 'ZEN', ring: 1,
    summary: '禅宗三祖僧璨大师所作，是禅宗最早的法语之一。全文仅584字，以四言偈体写成，阐明禅修的根本要旨：放下分别取舍，回归心的本然。"至道无难，唯嫌拣择"开篇即破一切修行障碍。',
    significance: '禅宗最早的系统性法语，对后世禅修影响深远。简洁有力，适合初学者反复参究。',
    difficulty: 2, oxStageMin: 1, oxStageMax: 7,
    tags: ['禅宗', '三祖', '僧璨', '信心铭', '不二法门'], sortOrder: 1,
    relatedSlugs: ['platform-sutra', 'zhengdao-ge'],
    chapters: [
      { chapterNo: 1, title: '全文', subtitle: '至道无难',
        originalText: '至道无难，唯嫌拣择。但莫憎爱，洞然明白。毫厘有差，天地悬隔。欲得现前，莫存顺逆。违顺相争，是为心病。不识玄旨，徒劳念静。\n\n圆同太虚，无欠无余。良由取舍，所以不如。莫逐有缘，勿住空忍。一种平怀，泯然自尽。止动归止，止更弥动。唯滞两边，宁知一种。一种不通，两处失功。\n\n遣有没有，从空背空。多言多虑，转不相应。绝言绝虑，无处不通。归根得旨，随照失宗。须臾返照，胜却前空。前空转变，皆由妄见。不用求真，唯须息见。',
        keyQuotes: [
          { quote: '至道无难，唯嫌拣择', explanation: '大道本不难，难在我们的分别心不断挑拣取舍。' },
          { quote: '莫逐有缘，勿住空忍', explanation: '既不追逐外境，也不执着空无。中道而行。' },
        ],
        practiceHint: '今天试着不评判遇到的人和事——不分好坏对错，只是如实觉察。' },
    ],
  },

  // ── 证道歌 ──
  {
    slug: 'zhengdao-ge', title: '证道歌', titleEn: 'Song of Enlightenment',
    author: '永嘉玄觉', era: '唐代',
    catSlug: 'zen-core', tradition: 'ZEN', ring: 1,
    summary: '永嘉玄觉禅师一宿觉悟后所作长歌，以歌行体阐述证道体验。全诗气势磅礴，"君不见，绝学无为闲道人，不除妄想不求真"传唱千年。展现了证悟后的自在洒脱境界。',
    difficulty: 3, oxStageMin: 3, oxStageMax: 10,
    tags: ['禅宗', '永嘉', '证道', '一宿觉'], sortOrder: 2,
    relatedSlugs: ['platform-sutra', 'xinxin-ming'],
    chapters: [
      { chapterNo: 1, title: '证道歌全文(精选)', subtitle: '绝学无为闲道人',
        originalText: '君不见，绝学无为闲道人，不除妄想不求真。无明实性即佛性，幻化空身即法身。法身觉了无一物，本源自性天真佛。五蕴浮云空去来，三毒水泡虚出没。\n\n证实相，无人法，刹那灭却阿鼻业。若将妄语诳众生，自招拔舌尘沙劫。顿觉了，如来禅，六度万行体中圆。梦里明明有六趣，觉后空空无大千。',
        keyQuotes: [
          { quote: '不除妄想不求真', explanation: '不需要刻意除去妄念也不需要追求真理——本来就是。' },
          { quote: '无明实性即佛性', explanation: '烦恼即菩提，不需要另外去找一个佛性。' },
        ],
        practiceHint: '修行中遇到杂念时，不必对抗它，也不必追随它，让它自来自去如浮云。' },
    ],
  },

  // ── 达摩血脉论 ──
  {
    slug: 'damo-xuemo', title: '达摩血脉论', titleEn: 'Bodhidharma\'s Bloodstream Sermon',
    author: '菩提达摩', era: '南北朝',
    catSlug: 'zen-core', tradition: 'ZEN', ring: 1,
    summary: '传为禅宗初祖菩提达摩所作，直指心性本源。"三界兴起，同归一心"，一切修行归结为认识自心。文中反对执着文字相，主张直接体悟心的本质。',
    difficulty: 3, oxStageMin: 2, oxStageMax: 8,
    tags: ['禅宗', '达摩', '初祖', '心法'], sortOrder: 3,
    relatedSlugs: ['platform-sutra', 'damo-wuxing'],
    chapters: [
      { chapterNo: 1, title: '血脉论要旨', subtitle: '三界兴起同归一心',
        originalText: '三界兴起，同归一心。前佛后佛，以心传心，不立文字。问曰："若不立文字，以何为心？"答曰："汝问吾即是汝心，吾答汝即是吾心。吾若无心，因何解答汝？汝若无心，因何解问吾？问吾即是汝心。"\n\n从无始旷大劫以来，乃至施为运动，一切时中，一切处所，皆是汝本心，皆是汝本佛。即心是佛，亦复如是。',
        keyQuotes: [
          { quote: '即心是佛', explanation: '不需要到外面去找佛，当下这颗心就是佛。' },
          { quote: '以心传心，不立文字', explanation: '禅法的核心——超越语言文字，心与心直接相通。' },
        ],
        practiceHint: '问自己"什么在问这个问题？"——那个能问的，就是你的本心。' },
    ],
  },

  // ── 达摩悟性论 ──
  {
    slug: 'damo-wuxing', title: '达摩悟性论', titleEn: 'Bodhidharma\'s Wake-up Sermon',
    author: '菩提达摩', era: '南北朝',
    catSlug: 'zen-core', tradition: 'ZEN', ring: 1,
    summary: '达摩祖师关于觉悟本性的论述，强调"见性即是佛"，破除一切外在形式的执着。直指修行的核心在于认识自己的本性，而非积累外在功德。',
    difficulty: 3, oxStageMin: 2, oxStageMax: 9,
    tags: ['禅宗', '达摩', '悟性', '见性'], sortOrder: 4,
    relatedSlugs: ['damo-xuemo', 'platform-sutra'],
    chapters: [
      { chapterNo: 1, title: '悟性论要旨',
        originalText: '夫道者，以寂灭为体。修者，以离相为宗。故经云：寂灭是菩提，灭诸相故。佛者觉也，人有觉心，得菩提道，故名为佛。经云：离一切诸相，即名诸佛。\n\n是知有相是无相之相，不可以眼见，唯可以智知。若闻此法者，生一念信心，此人以发大乘超三界。',
        keyQuotes: [{ quote: '离一切诸相，即名诸佛', explanation: '离开对一切相的执着，就是佛的状态。' }],
        practiceHint: '观察自己对"修行成果"的执着——连对觉悟的执着也要放下。' },
    ],
  },

  // ── 临济宗 ──
  {
    slug: 'linji-lu', title: '临济录', titleEn: 'Record of Linji',
    author: '临济义玄', era: '唐代',
    catSlug: 'zen-linji', tradition: 'ZEN', ring: 1,
    summary: '临济宗创始人义玄禅师的语录集。以"四料简""四宾主""三玄三要"著称，风格峻烈，棒喝交驰。"逢佛杀佛，逢祖杀祖"是禅宗最震撼的公案之一。',
    difficulty: 4, oxStageMin: 3, oxStageMax: 10,
    tags: ['临济宗', '棒喝', '四料简', '公案'], sortOrder: 10,
    relatedSlugs: ['platform-sutra', 'biyan-lu', 'wumen-guan'],
    chapters: [
      { chapterNo: 1, title: '上堂法语(精选)', subtitle: '逢佛杀佛',
        originalText: '师示众云："赤肉团上有一无位真人，常从汝等诸人面门出入。未证据者，看看！"\n\n时有僧出问："如何是无位真人？"师下禅床把住云："道！道！"其僧拟议。师托开云："无位真人是什么干屎橛！"便归方丈。\n\n师示众云："道流，佛法无用功处，只是平常无事：屙屎送尿，著衣吃饭，困来即卧。愚人笑我，智乃知焉。"',
        keyQuotes: [
          { quote: '赤肉团上有一无位真人', explanation: '每个人身上都有一个不受任何位次限制的真实存在。' },
          { quote: '佛法无用功处，只是平常无事', explanation: '最高的修行就是平常心——吃饭睡觉即是道。' },
        ],
        practiceHint: '今天做每件事时问自己："这个正在做事的无位真人是谁？"' },
    ],
  },

  {
    slug: 'biyan-lu', title: '碧岩录', titleEn: 'Blue Cliff Record',
    author: '圜悟克勤', era: '宋代',
    catSlug: 'zen-linji', tradition: 'ZEN', ring: 1,
    summary: '禅宗最重要的公案集之一，由圜悟克勤禅师编撰。收录100则公案，每则附有颂古、评唱。被誉为"禅门第一书"，是参禅者必读经典。',
    difficulty: 5, oxStageMin: 4, oxStageMax: 10,
    tags: ['临济宗', '公案', '碧岩录', '100则'], sortOrder: 11,
    relatedSlugs: ['wumen-guan', 'linji-lu'],
    chapters: [
      { chapterNo: 1, title: '第一则：达摩廓然', subtitle: '圣谛第一义',
        originalText: '举：梁武帝问达摩大师："如何是圣谛第一义？"摩云："廓然无圣。"帝曰："对朕者谁？"摩云："不识。"帝不领悟。达摩遂渡江至魏。\n\n雪窦颂云：圣谛廓然，何当辨的？对朕者谁？还云不识。因兹暗渡江，岂免生荆棘。阖国人追不再来，千古万古空相忆。休相忆，清风匝地有何极！',
        keyQuotes: [
          { quote: '廓然无圣', explanation: '在真理的最高层面，连"圣"与"凡"的分别也不存在。' },
        ],
        practiceHint: '参话头："廓然无圣"——如果没有圣凡之分，你现在是什么？' },
    ],
  },

  {
    slug: 'wumen-guan', title: '无门关', titleEn: 'Gateless Gate',
    author: '无门慧开', era: '宋代',
    catSlug: 'zen-linji', tradition: 'ZEN', ring: 1,
    summary: '收录48则公案的禅宗要籍。第一则"赵州狗子"是最经典的入门公案。无门禅师为每则公案附评唱和颂古，风格简洁有力。"无"字公案成为禅修中最普遍的话头。',
    difficulty: 4, oxStageMin: 3, oxStageMax: 10,
    tags: ['临济宗', '公案', '无门关', '赵州', '话头'], sortOrder: 12,
    relatedSlugs: ['biyan-lu', 'linji-lu'],
    chapters: [
      { chapterNo: 1, title: '第一则：赵州狗子', subtitle: '赵州无字',
        originalText: '赵州和尚因僧问："狗子还有佛性也无？"州云："无。"\n\n无门曰：参禅须透祖师关，妙悟要穷心路绝。祖关不透，心路不绝，尽是依草附木精灵。且道如何是祖师关？只者一个"无"字，乃宗门一关也。遂目之曰"禅宗无门关"。\n\n颂曰：狗子佛性，全提正令。才涉有无，丧身失命。',
        keyQuotes: [
          { quote: '只者一个"无"字，乃宗门一关也', explanation: '这个"无"字不是有无的无，而是超越有无二边的大无。' },
        ],
        practiceHint: '以"无"字为话头，静坐中反复参究"无——"，不求理解，只是全身心投入。' },
    ],
  },

  // ── 曹洞宗 ──
  {
    slug: 'baojing-sanmei', title: '宝镜三昧', titleEn: 'Jewel Mirror Samadhi',
    author: '洞山良价', era: '唐代',
    catSlug: 'zen-caodong', tradition: 'ZEN', ring: 1,
    summary: '曹洞宗创始人洞山良价禅师所作，以"宝镜"比喻心的本性——如镜映物，不取不舍。阐述正偏回互的五位功夫，是曹洞宗默照禅的理论基础。',
    difficulty: 4, oxStageMin: 4, oxStageMax: 10,
    tags: ['曹洞宗', '默照', '五位', '洞山'], sortOrder: 20,
    relatedSlugs: ['cantong-qi', 'platform-sutra'],
    chapters: [
      { chapterNo: 1, title: '宝镜三昧(精选)',
        originalText: '如是之法，佛祖密付。汝今得之，宜善保护。银碗盛雪，明月藏鹭。类之弗齐，混则知处。意不在言，来机亦赴。动成窠臼，差落顾伫。背触共非，如大火聚。但形文彩，即属染污。',
        keyQuotes: [{ quote: '银碗盛雪，明月藏鹭', explanation: '白中藏白，比喻真如与现象浑然一体，不可分割。' }],
        practiceHint: '修默照禅：只管打坐，不追念头，不起分别，如镜照物。' },
    ],
  },

  {
    slug: 'cantong-qi', title: '参同契', titleEn: 'Harmony of Difference and Equality',
    author: '石头希迁', era: '唐代',
    catSlug: 'zen-caodong', tradition: 'ZEN', ring: 1,
    summary: '石头希迁禅师所作，阐述事理圆融、明暗互摄的禅理。"竺土大仙心，东西密相付"开篇即点明禅法传承。是曹洞宗重要根基文献。',
    difficulty: 4, oxStageMin: 4, oxStageMax: 10,
    tags: ['曹洞宗', '石头', '希迁', '事理圆融'], sortOrder: 21,
    relatedSlugs: ['baojing-sanmei', 'platform-sutra'],
    chapters: [
      { chapterNo: 1, title: '参同契全文',
        originalText: '竺土大仙心，东西密相付。人根有利钝，道无南北祖。灵源明皎洁，枝派暗流注。执事元是迷，契理亦非悟。门门一切境，回互不回互。回而更相涉，不尔依位住。',
        keyQuotes: [{ quote: '人根有利钝，道无南北祖', explanation: '人的根器有利钝之分，但道本身没有南北之别。' }],
        practiceHint: '观察生活中"对立"的事物——看似矛盾的两面，其实相互依存。' },
    ],
  },

  // ── 沩仰宗 ──
  {
    slug: 'weishan-jingce', title: '沩山警策', titleEn: 'Weishan\'s Admonitions',
    author: '沩山灵祐', era: '唐代',
    catSlug: 'zen-guiyang', tradition: 'ZEN', ring: 1,
    summary: '沩仰宗创始人沩山灵祐禅师对弟子的警策之言。文风朴实恳切，强调出家修行的根本在于发真实心，不可虚度光阴。对在家修行者同样有深刻启发。',
    difficulty: 2, oxStageMin: 1, oxStageMax: 6,
    tags: ['沩仰宗', '沩山', '灵祐', '警策'], sortOrder: 30,
    relatedSlugs: ['platform-sutra'],
    chapters: [
      { chapterNo: 1, title: '警策文(精选)',
        originalText: '夫业系受身，未免形累。禀父母之遗体，假众缘而共成。虽乃四大扶持，常相违背。无常老病，不与人期。朝存夕亡，刹那异世。\n\n若也思量此事，岂可缓哉！但以深信因果，真实修行，为务耳。在世空过，后悔难追。出家之人，心不可安。',
        keyQuotes: [{ quote: '无常老病，不与人期', explanation: '无常、衰老、疾病不会与你预约时间——随时可能到来。' }],
        practiceHint: '今天做一件事时全身心投入，好像这是你生命中最后一次做这件事。' },
    ],
  },

  // ── 云门宗 ──
  {
    slug: 'yunmen-guanglu', title: '云门匡真禅师广录', titleEn: 'Extensive Record of Yunmen',
    author: '云门文偃', era: '五代',
    catSlug: 'zen-yunmen', tradition: 'ZEN', ring: 1,
    summary: '云门宗开山祖师文偃禅师的语录。云门禅风以"一字关"著称——用极简的一个字或一句话截断学人的妄想。"日日是好日"等名句影响深远。',
    difficulty: 4, oxStageMin: 3, oxStageMax: 10,
    tags: ['云门宗', '云门', '文偃', '一字关'], sortOrder: 40,
    relatedSlugs: ['biyan-lu', 'platform-sutra'],
    chapters: [
      { chapterNo: 1, title: '上堂法语(精选)', subtitle: '日日是好日',
        originalText: '举：僧问云门："如何是佛？"门云："干屎橛。"\n\n门曰："我事不获已，且向你道：直得乾坤大地无纤毫过患，犹是转句。不见一色，始是半提。更须知有向上全提时节，且道如何是向上全提？"\n\n门示众云："十五日已前不问汝，十五日已后道将一句来。"自代云："日日是好日。"',
        keyQuotes: [{ quote: '日日是好日', explanation: '不分好坏，每一天都是最好的一天——因为当下即是全部。' }],
        practiceHint: '无论今天遇到什么，都对自己说"日日是好日"，看看心态有何变化。' },
    ],
  },

  // ── 法眼宗 ──
  {
    slug: 'zongmen-shigui', title: '宗门十规论', titleEn: 'Ten Guidelines for Chan Schools',
    author: '法眼文益', era: '五代',
    catSlug: 'zen-fayan', tradition: 'ZEN', ring: 1,
    summary: '法眼宗创始人文益禅师所作，总结禅宗丛林十大弊病并提出整顿方案。是禅宗自我反思和制度建设的重要文献，体现了法眼宗融通教禅的特色。',
    difficulty: 3, oxStageMin: 5, oxStageMax: 10,
    tags: ['法眼宗', '法眼', '文益', '丛林制度'], sortOrder: 50,
    relatedSlugs: ['platform-sutra', 'zongjing-lu'],
    chapters: [
      { chapterNo: 1, title: '十规论要旨',
        originalText: '尝闻诸方老宿，以此宗教衰而激扬之，皆因学者之弊，非关教之疏也。今略出十条，以为规式：\n\n一曰自己心地未明，妄为人师。\n二曰拨无因果，任性妄行。\n三曰不通教典，偏执一隅。\n四曰不达机缘，一概而论。\n五曰不辨邪正，滥收门徒。',
        keyQuotes: [{ quote: '自己心地未明，妄为人师', explanation: '自己尚未明心见性，就冒充导师——这是禅门第一大弊。' }],
        practiceHint: '审视自己：是否在自己尚未理解的领域妄加评判？真正的智慧始于承认无知。' },
    ],
  },

  {
    slug: 'zongjing-lu', title: '宗镜录', titleEn: 'Records of the Source Mirror',
    author: '永明延寿', era: '五代/宋初',
    catSlug: 'zen-fayan', tradition: 'ZEN', ring: 1,
    summary: '永明延寿禅师巨著，100卷，融合禅宗与教门各宗思想。以"一心"为宗旨，调和禅教之争。被誉为佛教百科全书，是法眼宗融通精神的集大成之作。',
    difficulty: 5, oxStageMin: 6, oxStageMax: 10,
    tags: ['法眼宗', '永明延寿', '禅教合一', '百科全书'], sortOrder: 51,
    relatedSlugs: ['zongmen-shigui', 'platform-sutra'],
    chapters: [
      { chapterNo: 1, title: '卷一·标宗章(精选)', subtitle: '举一心为宗',
        originalText: '夫宗镜录者，举一心为宗，照万法如镜。遍含一切，全收法界。既无别法奇特，亦非别有玄妙。只是一切众生本来真心。\n\n此一心法，理事融通，是非泯绝，善恶齐修，圣凡一致。但以众生妄想执著，不能证得。若离妄想，一切智自然智无师智，自然现前。',
        keyQuotes: [{ quote: '举一心为宗，照万法如镜', explanation: '以心为根本，如明镜照见万物，不取不舍。' }],
        practiceHint: '将心比作一面镜子——映照一切而不被任何映像所染。' },
    ],
  },

  // 更多禅宗核心典籍
  {
    slug: 'jingde-chuandeng', title: '景德传灯录', titleEn: 'Jingde Record of Transmission of the Lamp',
    author: '道原', era: '宋代',
    catSlug: 'zen-core', tradition: 'ZEN', ring: 1,
    summary: '禅宗最重要的灯录之一，记录从七佛到宋初1701位禅师的传法谱系。30卷，是了解禅宗发展脉络和公案故事的百科全书式文献。',
    difficulty: 3, oxStageMin: 2, oxStageMax: 10,
    tags: ['禅宗', '灯录', '传承', '公案'], sortOrder: 6,
    relatedSlugs: ['platform-sutra', 'biyan-lu', 'wumen-guan'],
    chapters: [
      { chapterNo: 1, title: '六祖惠能章(精选)',
        originalText: '六祖大鉴禅师者，俗姓卢氏，南海新兴人也。其先范阳人，父行瑫，武德中左迁于岭表，遂家焉。师生而孤苦，鬻薪为业。\n\n偶闻客诵金刚经，感悟，遂直诣黄梅东山。五祖器之，密授衣法，令居曹溪。一日升座，告众曰："吾有一物，无头无尾，无名无字，无背无面。诸人还识否？"',
        keyQuotes: [{ quote: '吾有一物，无头无尾，无名无字', explanation: '指本心——它无形无相却真实不虚，超越一切描述。' }],
        practiceHint: '静坐中体会：那个"无头无尾、无名无字"的是什么？' },
    ],
  },

  {
    slug: 'shishuang-yulu', title: '十牛图颂', titleEn: 'Ten Ox-Herding Pictures',
    author: '廓庵禅师', era: '宋代',
    catSlug: 'zen-core', tradition: 'ZEN', ring: 1,
    summary: '以牧牛为喻，描绘从寻道到圆满的修行十阶段。每图附颂与解说。是修行圈十牛图系统的直接经典来源。寻牛→见迹→见牛→得牛→牧牛→骑牛归家→忘牛存人→人牛俱忘→返本还源→入廛垂手。',
    difficulty: 2, oxStageMin: 1, oxStageMax: 10,
    tags: ['禅宗', '十牛图', '廓庵', '修行次第'], sortOrder: 5,
    relatedSlugs: ['platform-sutra', 'xinxin-ming'],
    chapters: [
      { chapterNo: 1, title: '寻牛·见迹·见牛',
        originalText: '一、寻牛\n忙忙拨草去追寻，水阔山遥路更深。力尽神疲无处觅，但闻枫树晚蝉吟。\n\n二、见迹\n水边林下迹偏多，芳草离披见也么？纵是深山更深处，辽天鼻孔怎藏他。\n\n三、见牛\n黄鹂枝上一声声，日暖风和岸柳青。只此更无回避处，森森头角画难成。',
        keyQuotes: [
          { quote: '忙忙拨草去追寻', explanation: '初发心寻道，虽然方向不明，但已踏上修行之路。' },
          { quote: '辽天鼻孔怎藏他', explanation: '本性虽然无形，但处处留有痕迹——只要你留心观察。' },
        ],
        practiceHint: '回忆你最初对修行、对人生意义产生好奇的那个时刻——那就是"寻牛"。' },
      { chapterNo: 2, title: '得牛·牧牛·骑牛归家',
        originalText: '四、得牛\n竭尽精神获得渠，心强力壮卒难除。有时才到高原上，又入烟云深处居。\n\n五、牧牛\n鞭绳时刻不离身，恐伊纵步入埃尘。相将牧得纯和也，羁锁无拘自逐人。\n\n六、骑牛归家\n骑牛迤逦欲还家，羌笛声声送晚霞。一拍一歌无限意，知音何必鼓唇牙。',
        keyQuotes: [{ quote: '骑牛迤逦欲还家', explanation: '不再与心性对抗，自在地回归本来面目。' }],
        practiceHint: '在今天的修行中，少一些"努力"，多一些"随顺"——骑牛归家不需要鞭打。' },
      { chapterNo: 3, title: '忘牛存人·人牛俱忘·返本还源·入廛垂手',
        originalText: '七、忘牛存人\n骑牛已得到家山，牛也空兮人也闲。红日三竿犹作梦，鞭绳空顿草堂间。\n\n八、人牛俱忘\n鞭索人牛尽属空，碧天辽阔信难通。红炉焰上争容雪，到此方能合祖宗。\n\n九、返本还源\n返本还源已费功，争如直下若盲聋。庵中不见庵前物，水自茫茫花自红。\n\n十、入廛垂手\n露胸跣足入廛来，抹土涂灰笑满腮。不用神仙真秘诀，直教枯木放花开。',
        keyQuotes: [
          { quote: '水自茫茫花自红', explanation: '回到最平常的状态——水就是水，花就是花，无需添加任何东西。' },
          { quote: '直教枯木放花开', explanation: '彻悟后回到人间，用智慧和慈悲帮助他人，令枯木逢春。' },
        ],
        practiceHint: '最高的修行不是在山洞里打坐，而是在菜市场、办公室里保持觉知和慈悲。' },
    ],
  },

  // ══════════════════════════════════════════════
  // RING 2: 佛教八大宗派经典 (~40部)
  // ══════════════════════════════════════════════

  // ── 禅宗相关大乘经 ──
  {
    slug: 'diamond-sutra', title: '金刚经', titleEn: 'Diamond Sutra',
    author: '鸠摩罗什(译)', era: '后秦',
    catSlug: 'buddhist-zen', tradition: 'BUDDHISM', ring: 2,
    summary: '全称《金刚般若波罗蜜经》，般若部核心经典。六祖惠能闻"应无所住而生其心"而开悟，使金刚经成为禅宗最重要的依据经典之一。全经以须菩提与佛的对话展开，破除一切相执。',
    significance: '六祖开悟之经，禅宗根本经典。"凡所有相，皆是虚妄"是修行的终极照妖镜。',
    difficulty: 3, oxStageMin: 1, oxStageMax: 10,
    tags: ['般若', '金刚经', '空性', '破相'], sortOrder: 0,
    relatedSlugs: ['heart-sutra', 'platform-sutra', 'vimalakirti-sutra'],
    chapters: [
      { chapterNo: 1, title: '法会因由分·善现启请分',
        originalText: '如是我闻。一时佛在舍卫国祇树给孤独园，与大比丘众千二百五十人俱。尔时世尊食时，著衣持钵，入舍卫大城乞食。于其城中，次第乞已，还至本处。饭食讫，收衣钵，洗足已，敷座而坐。\n\n时长老须菩提，在大众中，即从座起，偏袒右肩，右膝着地，合掌恭敬。而白佛言："希有世尊！如来善护念诸菩萨，善付嘱诸菩萨。世尊，善男子善女人，发阿耨多罗三藐三菩提心，云何应住？云何降伏其心？"',
        keyQuotes: [{ quote: '云何应住？云何降伏其心？', explanation: '全经的核心问题——心应安住在哪里？如何调伏妄心？' }],
        practiceHint: '留意你今天"住"在哪里——是住在过去的遗憾，还是未来的焦虑？' },
      { chapterNo: 2, title: '无所住生心·离相寂灭',
        originalText: '佛告须菩提："诸菩萨摩诃萨，应如是降伏其心。所有一切众生之类，若卵生，若胎生，若湿生，若化生，若有色，若无色，若有想，若无想，若非有想非无想，我皆令入无余涅槃而灭度之。如是灭度无量无数无边众生，实无众生得灭度者。何以故？须菩提，若菩萨有我相、人相、众生相、寿者相，即非菩萨。"\n\n"是故须菩提，诸菩萨摩诃萨，应如是生清净心，不应住色生心，不应住声香味触法生心，应无所住而生其心。"',
        keyQuotes: [
          { quote: '应无所住而生其心', explanation: '心不执著于任何事物而自然生起——这是金刚经和禅宗的核心。' },
          { quote: '凡所有相皆是虚妄', explanation: '一切现象都是因缘和合的显现，没有独立永恒的实体。' },
        ],
        practiceHint: '做事时全力以赴，做完后不执著结果——这就是"无所住而生其心"的生活实践。' },
    ],
  },

  {
    slug: 'heart-sutra', title: '心经', titleEn: 'Heart Sutra',
    author: '玄奘(译)', era: '唐代',
    catSlug: 'buddhist-zen', tradition: 'BUDDHISM', ring: 2,
    summary: '全称《般若波罗蜜多心经》，全经仅260字，是佛教最短也最常诵读的经典。"色不异空，空不异色"概括了整个般若思想。"揭谛揭谛，波罗揭谛"的咒语传唱千年。',
    difficulty: 2, oxStageMin: 1, oxStageMax: 10,
    tags: ['般若', '心经', '空性', '观自在'], sortOrder: 1,
    relatedSlugs: ['diamond-sutra', 'platform-sutra'],
    chapters: [
      { chapterNo: 1, title: '心经全文',
        originalText: '观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。舍利子，色不异空，空不异色，色即是空，空即是色，受想行识亦复如是。\n\n舍利子，是诸法空相，不生不灭，不垢不净，不增不减。是故空中无色，无受想行识，无眼耳鼻舌身意，无色声香味触法。无眼界乃至无意识界。无无明亦无无明尽，乃至无老死亦无老死尽。无苦集灭道，无智亦无得。以无所得故，菩提萨埵依般若波罗蜜多故，心无挂碍，无挂碍故无有恐怖，远离颠倒梦想，究竟涅槃。\n\n三世诸佛依般若波罗蜜多故，得阿耨多罗三藐三菩提。故知般若波罗蜜多，是大神咒，是大明咒，是无上咒，是无等等咒，能除一切苦，真实不虚。故说般若波罗蜜多咒，即说咒曰：揭谛揭谛，波罗揭谛，波罗僧揭谛，菩提萨婆诃。',
        keyQuotes: [
          { quote: '色不异空，空不异色', explanation: '物质与空性不是两个东西——现象本身就是空，空也不离开现象。' },
          { quote: '心无挂碍，无挂碍故无有恐怖', explanation: '当心不再执著，恐惧自然消失。' },
        ],
        practiceHint: '每天诵读一遍心经。不必理解每个字的意思，让经文的音韵本身安定你的心。' },
    ],
  },

  {
    slug: 'lengyan-jing', title: '楞严经', titleEn: 'Shurangama Sutra',
    author: '般剌蜜帝(译)', era: '唐代',
    catSlug: 'buddhist-zen', tradition: 'BUDDHISM', ring: 2,
    summary: '全称《大佛顶如来密因修证了义诸菩萨万行首楞严经》。以阿难误入摩登伽女处为缘起，佛为阿难开示心性本体。"七处征心""八还辨见"是禅宗参究心性的重要方法论。',
    difficulty: 4, oxStageMin: 3, oxStageMax: 10,
    tags: ['楞严', '七处征心', '心性', '五十阴魔'], sortOrder: 2,
    relatedSlugs: ['diamond-sutra', 'platform-sutra', 'yuanjue-jing'],
    chapters: [
      { chapterNo: 1, title: '七处征心(精选)', subtitle: '心在何处',
        originalText: '佛告阿难："一切众生从无始来，种种颠倒，业种自然如恶叉聚。诸修行人不能得成无上菩提，乃至别成声闻缘觉及成外道诸天魔王及魔眷属，皆由不知二种根本，错乱修习。犹如煮沙，欲成嘉馔，纵经尘劫，终不能得。\n\n云何二种？阿难，一者无始生死根本，则汝今者与诸众生用攀缘心为自性者；二者无始菩提涅槃元清净体，则汝今者识精元明能生诸缘缘所遗者。"',
        keyQuotes: [{ quote: '用攀缘心为自性者', explanation: '把不断攀缘外境的妄心当成自己的本性——这是众生最根本的错误。' }],
        practiceHint: '观察你的心此刻在"攀缘"什么——声音？念头？情绪？找到那个不动的觉知。' },
    ],
  },

  // ── 净土宗 ──
  {
    slug: 'amitabha-sutra', title: '阿弥陀经', titleEn: 'Amitabha Sutra',
    author: '鸠摩罗什(译)', era: '后秦',
    catSlug: 'buddhist-pureland', tradition: 'BUDDHISM', ring: 2,
    summary: '净土三经之一，描述西方极乐世界的庄严和阿弥陀佛的功德。经文简短优美，是净土宗最普及的经典。"从是西方过十万亿佛土，有世界名曰极乐"开篇描绘净土景象。',
    difficulty: 1, oxStageMin: 1, oxStageMax: 6,
    tags: ['净土宗', '阿弥陀', '极乐世界', '念佛'], sortOrder: 10,
    relatedSlugs: ['wuliangshou-jing'],
    chapters: [
      { chapterNo: 1, title: '极乐世界(精选)',
        originalText: '如是我闻。一时佛在舍卫国祇树给孤独园，与大比丘僧千二百五十人俱，皆是大阿罗汉。\n\n尔时佛告长老舍利弗："从是西方过十万亿佛土，有世界名曰极乐。其土有佛号阿弥陀，今现在说法。舍利弗，彼土何故名为极乐？其国众生无有众苦，但受诸乐，故名极乐。"',
        keyQuotes: [{ quote: '其国众生无有众苦，但受诸乐', explanation: '净土是一个没有痛苦只有快乐的理想世界——修行的终极目标之一。' }],
        practiceHint: '念"南无阿弥陀佛"十声，体会念佛时心的安定。' },
    ],
  },

  {
    slug: 'wuliangshou-jing', title: '无量寿经', titleEn: 'Sutra of Infinite Life',
    author: '康僧铠(译)', era: '三国·曹魏',
    catSlug: 'buddhist-pureland', tradition: 'BUDDHISM', ring: 2,
    summary: '净土三经中最详尽的一部，详述阿弥陀佛因地法藏比丘发四十八大愿的故事，以及极乐世界的具体描述。四十八愿是净土信仰的根本。',
    difficulty: 2, oxStageMin: 1, oxStageMax: 7,
    tags: ['净土宗', '四十八愿', '法藏比丘', '阿弥陀'], sortOrder: 11,
    relatedSlugs: ['amitabha-sutra'],
    chapters: [
      { chapterNo: 1, title: '四十八愿(精选)',
        originalText: '法藏比丘说此偈已，而白佛言："我发无上正觉之心，愿佛为我广宣经法，我当奉持，如法修行。"\n\n设我得佛，十方众生，至心信乐，欲生我国，乃至十念，若不生者，不取正觉。唯除五逆、诽谤正法。\n设我得佛，国中天人，不住正定聚，必至灭度者，不取正觉。\n设我得佛，十方无量不可思议诸佛世界众生之类，闻我名字，不得菩萨无生法忍诸深总持者，不取正觉。',
        keyQuotes: [{ quote: '至心信乐，欲生我国，乃至十念', explanation: '只要真心信愿念佛，哪怕只念十声，也能往生净土。' }],
        practiceHint: '用三分钟专心念佛，体会"至心信乐"——不是口念心散，而是全身心投入。' },
    ],
  },

  // ── 天台宗 ──
  {
    slug: 'lotus-sutra', title: '法华经', titleEn: 'Lotus Sutra',
    author: '鸠摩罗什(译)', era: '后秦',
    catSlug: 'buddhist-tiantai', tradition: 'BUDDHISM', ring: 2,
    summary: '全称《妙法莲华经》，被誉为"经中之王"。核心思想是"一切众生皆能成佛"，提出开权显实的思想，统摄大小乘一切教法。法华七喻脍炙人口。',
    difficulty: 3, oxStageMin: 2, oxStageMax: 10,
    tags: ['天台宗', '法华', '一佛乘', '开权显实'], sortOrder: 20,
    relatedSlugs: ['mohe-zhiguan'],
    chapters: [
      { chapterNo: 1, title: '方便品(精选)', subtitle: '唯有一佛乘',
        originalText: '舍利弗，如来但以一佛乘故为众生说法，无有余乘若二若三。舍利弗，一切十方诸佛法亦如是。\n\n诸佛以方便力，于一佛乘分别说三。舍利弗，若我弟子自谓阿罗汉辟支佛者，不闻不知诸佛如来但教化菩萨事，此非佛弟子，非阿罗汉，非辟支佛。',
        keyQuotes: [{ quote: '唯有一佛乘，无有余乘若二若三', explanation: '最终只有一条成佛之路，所谓大乘小乘只是方便的分类。' }],
        practiceHint: '不要执着于自己修的是哪个法门——一切法门最终指向同一个觉悟。' },
    ],
  },

  {
    slug: 'mohe-zhiguan', title: '摩诃止观', titleEn: 'Great Concentration and Insight',
    author: '智顗', era: '隋代',
    catSlug: 'buddhist-tiantai', tradition: 'BUDDHISM', ring: 2,
    summary: '天台宗创始人智顗大师的代表作，系统阐述止观双运的禅修方法。"一念三千"的思想体系，将宇宙万象归摄于一念之中。是中国佛教最完整的禅修理论著作。',
    difficulty: 5, oxStageMin: 5, oxStageMax: 10,
    tags: ['天台宗', '止观', '智顗', '一念三千'], sortOrder: 21,
    relatedSlugs: ['lotus-sutra'],
    chapters: [
      { chapterNo: 1, title: '一念三千(精选)',
        originalText: '夫一心具十法界，一法界又具十法界、百法界。一界具三十种世间，百法界即具三千种世间。此三千在一念心，若无心而已，介尔有心即具三千。\n\n亦不言一心在前一切法在后，亦不言一切法在前一心在后。若从一心生一切法者，此则是纵；若一心一时含一切法者，此即是横。纵亦不可，横亦不可。只心是一切法，一切法是心。',
        keyQuotes: [{ quote: '一念三千', explanation: '一个念头中包含三千种世间——宇宙的一切都在你的一念之中。' }],
        practiceHint: '观察此刻升起的一个念头——它从哪里来？在哪里？往哪里去？' },
    ],
  },

  // ── 华严宗 ──
  {
    slug: 'huayan-sutra', title: '华严经', titleEn: 'Avatamsaka Sutra',
    author: '实叉难陀(译)', era: '唐代',
    catSlug: 'buddhist-huayan', tradition: 'BUDDHISM', ring: 2,
    summary: '全称《大方广佛华严经》，80卷，描绘"一即一切，一切即一"的圆融法界。因陀罗网的比喻——每颗宝珠映照所有其他宝珠——是人类对宇宙互联本质最诗意的表达。',
    difficulty: 4, oxStageMin: 4, oxStageMax: 10,
    tags: ['华严宗', '华严', '法界', '因陀罗网'], sortOrder: 30,
    relatedSlugs: ['lotus-sutra'],
    chapters: [
      { chapterNo: 1, title: '入法界品·善财童子(精选)',
        originalText: '尔时文殊师利菩萨劝诸比丘，发阿耨多罗三藐三菩提心已，渐次南行。\n\n善财童子渐次南行，经历一百一十城已，到普门城。问善知识："云何学菩萨行？云何修菩萨道？"\n\n善财童子一生中参访五十三位善知识，从文殊到普贤，历经种种不同的学处——或在酒肆，或在市集，或在王宫，或在森林——处处都是道场。',
        keyQuotes: [{ quote: '一即一切，一切即一', explanation: '万物相互包含——你中有我，我中有你，整个宇宙是一个不可分割的整体。' }],
        practiceHint: '出门时观察：一朵花中有阳光、雨水、泥土、园丁……看见事物的相互依存。' },
    ],
  },

  // ── 唯识宗 ──
  {
    slug: 'chengweishi-lun', title: '成唯识论', titleEn: 'Treatise on Consciousness-Only',
    author: '护法等造·玄奘译', era: '唐代',
    catSlug: 'buddhist-yogacara', tradition: 'BUDDHISM', ring: 2,
    summary: '唯识宗根本论典，系统阐述"万法唯识"的思想。八识(眼耳鼻舌身意+末那识+阿赖耶识)理论是佛教心理学的巅峰。"转识成智"是修行的核心目标。',
    difficulty: 5, oxStageMin: 5, oxStageMax: 10,
    tags: ['唯识宗', '八识', '阿赖耶识', '转识成智'], sortOrder: 50,
    relatedSlugs: ['lengyan-jing'],
    chapters: [
      { chapterNo: 1, title: '八识概说',
        originalText: '由假说我法，有种种相转。彼依识所变，此能变唯三：谓异熟、思量及了别境识。\n\n初阿赖耶识，异熟一切种，不可知执受，处了常与触，作意受想思相应。唯舍受。是无覆无记。',
        keyQuotes: [{ quote: '万法唯识', explanation: '一切现象都是心识的变现——外在世界是内心的投射。' }],
        practiceHint: '观察你对某人/某事的评判——那个评判是事实本身，还是你的心识在"创造"？' },
    ],
  },

  // ── 三论宗 ──
  {
    slug: 'zhong-lun', title: '中论', titleEn: 'Mulamadhyamakakarika',
    author: '龙树菩萨造·鸠摩罗什译', era: '后秦',
    catSlug: 'buddhist-madhyamaka', tradition: 'BUDDHISM', ring: 2,
    summary: '中观学派根本论著，以"八不中道"破除一切执著。"不生不灭、不常不断、不一不异、不来不去"的八否定，揭示真实超越一切概念对立。',
    difficulty: 5, oxStageMin: 5, oxStageMax: 10,
    tags: ['三论宗', '中观', '龙树', '八不中道', '空'], sortOrder: 60,
    relatedSlugs: ['diamond-sutra', 'heart-sutra'],
    chapters: [
      { chapterNo: 1, title: '观因缘品(精选)', subtitle: '八不中道',
        originalText: '不生亦不灭，不常亦不断，不一亦不异，不来亦不出。能说是因缘，善灭诸戏论，我稽首礼佛，诸说中第一。',
        keyQuotes: [{ quote: '不生亦不灭，不常亦不断，不一亦不异，不来亦不出', explanation: '八不中道——真实不落入任何一边的概念。' }],
        practiceHint: '当你想说"这是好的"时，也看到它"不好"的一面；反之亦然。超越二分法。' },
    ],
  },

  // ── 大小乘通用经典 ──
  {
    slug: 'vimalakirti-sutra', title: '维摩诘经', titleEn: 'Vimalakirti Sutra',
    author: '鸠摩罗什(译)', era: '后秦',
    catSlug: 'buddhist-general', tradition: 'BUDDHISM', ring: 2,
    summary: '以居士维摩诘为主角的大乘经典，打破出家/在家的界限。维摩诘以"不二法门"和"一默如雷"的沉默回答震撼三界。证明在家修行同样可以达到最高境界。',
    difficulty: 3, oxStageMin: 2, oxStageMax: 10,
    tags: ['大乘', '维摩诘', '不二法门', '在家修行'], sortOrder: 80,
    relatedSlugs: ['diamond-sutra', 'platform-sutra'],
    chapters: [
      { chapterNo: 1, title: '入不二法门品(精选)',
        originalText: '尔时维摩诘谓众菩萨言："诸仁者，云何菩萨入不二法门？各随所乐说之。"\n\n法自在菩萨曰："诸仁者，生灭为二。法本不生，今则无灭。得此无生法忍，是为入不二法门。"\n\n于是文殊师利问维摩诘："我等各自说已，仁者当说何等是菩萨入不二法门？"时维摩诘默然无言。文殊师利叹曰："善哉善哉！乃至无有文字语言，是真入不二法门。"',
        keyQuotes: [{ quote: '维摩诘默然无言', explanation: '最深的真理超越语言——维摩诘的沉默胜过一切言说。' }],
        practiceHint: '今天找5分钟完全沉默——不说话，不思考，只是存在。体会"不二"。' },
    ],
  },

  {
    slug: 'yuanjue-jing', title: '圆觉经', titleEn: 'Sutra of Perfect Enlightenment',
    author: '佛陀多罗(译)', era: '唐代',
    catSlug: 'buddhist-general', tradition: 'BUDDHISM', ring: 2,
    summary: '以12位菩萨问法的形式，阐述圆满觉悟的修行方法。提出止、观、禅那三种修行方式及其25种组合。语言优美，义理深邃，历来为禅师所重。',
    difficulty: 3, oxStageMin: 3, oxStageMax: 10,
    tags: ['大乘', '圆觉', '止观', '修行方法'], sortOrder: 81,
    relatedSlugs: ['lengyan-jing', 'diamond-sutra'],
    chapters: [
      { chapterNo: 1, title: '文殊菩萨章(精选)',
        originalText: '善男子，知幻即离，不作方便；离幻即觉，亦无渐次。一切菩萨及末世众生，应当远离一切幻化虚妄境界。由坚执持远离心故，心如幻者亦复远离。远离为幻亦复远离。离远离幻亦复远离。得无所离，即除诸幻。',
        keyQuotes: [{ quote: '知幻即离，不作方便；离幻即觉，亦无渐次', explanation: '知道是幻就已经离开了，不需要额外的方法；离开幻就是觉悟，没有渐进的次第。' }],
        practiceHint: '当你意识到自己在做白日梦时——那个"意识到"的瞬间，就已经是觉醒。' },
    ],
  },

  {
    slug: 'dizang-jing', title: '地藏经', titleEn: 'Ksitigarbha Sutra',
    author: '实叉难陀(译)', era: '唐代',
    catSlug: 'buddhist-general', tradition: 'BUDDHISM', ring: 2,
    summary: '全称《地藏菩萨本愿经》，以孝道和因果报应为核心主题。地藏菩萨"地狱不空，誓不成佛"的大愿，是大乘慈悲精神的极致体现。',
    difficulty: 1, oxStageMin: 1, oxStageMax: 7,
    tags: ['大乘', '地藏', '孝道', '因果'], sortOrder: 82,
    relatedSlugs: ['lotus-sutra'],
    chapters: [
      { chapterNo: 1, title: '忉利天宫神通品(精选)',
        originalText: '尔时地藏菩萨摩诃萨白佛言："世尊，我承佛如来威神力故，遍百千万亿世界，分是身形，救拔一切业报众生。若非如来大慈力故，即不能作如是变化。\n\n我今又蒙佛付嘱，至阿逸多成佛已来，六道众生遣令度脱。唯然世尊，愿不有虑。"',
        keyQuotes: [{ quote: '地狱不空，誓不成佛', explanation: '只要还有一个众生在苦难中，我就不会停止救度的工作。' }],
        practiceHint: '今天为一个正在受苦的人做一件小事——即使只是一句温暖的话。' },
    ],
  },

  {
    slug: 'lengqie-jing', title: '楞伽经', titleEn: 'Lankavatara Sutra',
    author: '求那跋陀罗(译)', era: '南朝·宋',
    catSlug: 'buddhist-zen', tradition: 'BUDDHISM', ring: 2,
    summary: '达摩祖师传法时嘱咐弟子参学的核心经典。融合唯识与如来藏思想，以"自心现量"说明一切都是心的显现。是禅宗早期的根本经典，后被金刚经取代。',
    difficulty: 4, oxStageMin: 4, oxStageMax: 10,
    tags: ['禅宗', '唯识', '如来藏', '达摩', '自心现量'], sortOrder: 3,
    relatedSlugs: ['diamond-sutra', 'chengweishi-lun', 'damo-xuemo'],
    chapters: [
      { chapterNo: 1, title: '一切佛语心品(精选)',
        originalText: '大慧，譬如大海浪，以风鼓击，无间断时；藏识海常住，境界风所动，种种诸识浪，腾跃而转生。\n\n大慧，如来之藏，是善不善因。能遍兴造一切趣生。譬如伎儿，变现诸趣，离我我所。不觉彼故，三缘和合方便而生。',
        keyQuotes: [{ quote: '藏识海常住，境界风所动', explanation: '阿赖耶识如大海本来平静，外境之风吹起了种种识浪。' }],
        practiceHint: '观察内心如海——波浪(情绪/念头)来了又去，海(觉知)始终在那里。' },
    ],
  },

  // ── 律宗 ──
  {
    slug: 'fanwang-jing', title: '梵网经', titleEn: 'Brahma Net Sutra',
    author: '鸠摩罗什(译)', era: '后秦',
    catSlug: 'buddhist-vinaya', tradition: 'BUDDHISM', ring: 2,
    summary: '大乘菩萨戒的根本经典，包含十重戒和四十八轻戒。"是一切众生戒，本源自性清净"，强调戒律不是外在束缚，而是本性的自然流露。',
    difficulty: 2, oxStageMin: 1, oxStageMax: 8,
    tags: ['律宗', '菩萨戒', '梵网', '十重戒'], sortOrder: 40,
    relatedSlugs: ['lotus-sutra'],
    chapters: [
      { chapterNo: 1, title: '菩萨戒品(精选)',
        originalText: '佛告诸菩萨言："我今半月半月自诵诸佛法戒。汝等一切发心菩萨亦诵。乃至十发趣、十长养、十金刚、十地，诸菩萨亦诵。是故戒光从口出，有缘非无因故，光光非青黄赤白黑，非色非心，非有非无，非因果法，是诸佛之本源，行菩萨道之根本，是大众诸佛子之根本。"',
        keyQuotes: [{ quote: '是诸佛之本源，行菩萨道之根本', explanation: '戒律是成佛的根本——不是限制自由，而是通往自由的基础。' }],
        practiceHint: '今天严格遵守一条自我承诺的戒律（如不说谎、不批评他人），体验戒律带来的内心清净。' },
    ],
  },

  // ── 密宗 ──
  {
    slug: 'dari-jing', title: '大日经', titleEn: 'Mahavairocana Sutra',
    author: '善无畏·一行(译)', era: '唐代',
    catSlug: 'buddhist-esoteric', tradition: 'BUDDHISM', ring: 2,
    summary: '密宗两大根本经典之一，阐述大日如来(毗卢遮那佛)的教法。"菩提心为因，大悲为根本，方便为究竟"是密宗修行的总纲。三密加持(身口意)是核心修法。',
    difficulty: 4, oxStageMin: 4, oxStageMax: 10,
    tags: ['密宗', '大日如来', '三密加持', '即身成佛'], sortOrder: 70,
    relatedSlugs: ['heart-sutra'],
    chapters: [
      { chapterNo: 1, title: '住心品(精选)',
        originalText: '大日如来告金刚手言："菩提心为因，悲为根本，方便为究竟。秘密主，云何菩提？谓如实知自心。秘密主，是阿耨多罗三藐三菩提，乃至彼法少分无有可得。何以故？虚空相是菩提，无知解者亦无开晓者。何以故？菩提无相故。"',
        keyQuotes: [{ quote: '菩提心为因，悲为根本，方便为究竟', explanation: '发菩提心是起点，慈悲是根基，善巧方便是最终圆满。' }],
        practiceHint: '修三密：身端坐(身密)、口念咒(口密)、心观想(意密)，哪怕只是三分钟。' },
    ],
  },

  // ── 阿含 (小乘) ──
  {
    slug: 'ahan-jing', title: '阿含经', titleEn: 'Agama Sutras',
    author: '佛陀及弟子', era: '原始佛教',
    catSlug: 'buddhist-general', tradition: 'BUDDHISM', ring: 2,
    summary: '最早的佛陀言教记录，包含长阿含、中阿含、杂阿含、增一阿含四部。是研究佛陀原始教法的根本资料。四谛、八正道、十二因缘等核心教义均出自此经。',
    difficulty: 2, oxStageMin: 1, oxStageMax: 7,
    tags: ['原始佛教', '阿含', '四谛', '八正道'], sortOrder: 83,
    relatedSlugs: ['heart-sutra', 'diamond-sutra'],
    chapters: [
      { chapterNo: 1, title: '转法轮经(精选)', subtitle: '四圣谛',
        originalText: '如是我闻。一时佛在波罗奈国鹿野苑中。佛告五比丘："此苦圣谛，本所未闻法，当正思惟时，生眼、智、明、觉。此苦集圣谛，此苦灭圣谛，此苦灭道迹圣谛，本所未闻法。\n\n比丘，此四圣谛三转十二行相，我自知见，眼、智、明、觉各已用生。是故比丘，我于天人沙门婆罗门中，梵天魔天，自证得阿耨多罗三藐三菩提。"',
        keyQuotes: [{ quote: '苦集灭道', explanation: '四圣谛——苦是现实(苦)，苦有原因(集)，苦可以终结(灭)，终结苦有方法(道)。' }],
        practiceHint: '觉察当下的一个小"苦"(不满、焦虑)——它的原因是什么？你能放下那个原因吗？' },
    ],
  },

  // ══════════════════════════════════════════════
  // RING 3: 11大信仰传统经典 (~55部, 每传统5部)
  // ══════════════════════════════════════════════

  // ── 道教 ──
  { slug: 'daodejing', title: '道德经', titleEn: 'Tao Te Ching', author: '老子', era: '春秋', catSlug: 'taoism', tradition: 'TAOISM', ring: 3, summary: '道家根本经典，5000余字，分为道经和德经。"道可道，非常道"开篇即超越语言。"无为而无不为"的智慧影响了整个东亚文明。', difficulty: 3, oxStageMin: 1, oxStageMax: 10, tags: ['道教', '老子', '道德经', '无为'], sortOrder: 0, relatedSlugs: ['zhuangzi'], chapters: [{ chapterNo: 1, title: '第一章·道可道', originalText: '道可道，非常道。名可名，非常名。无名天地之始，有名万物之母。故常无欲以观其妙，常有欲以观其徼。此两者同出而异名，同谓之玄。玄之又玄，众妙之门。', keyQuotes: [{ quote: '道可道，非常道', explanation: '能用语言表达的道，就不是永恒的道——最高的真理超越言语。' }], practiceHint: '今天试着不用语言定义你的体验——只是感受，不贴标签。' }, { chapterNo: 2, title: '第二章·天下皆知', originalText: '天下皆知美之为美，斯恶已。皆知善之为善，斯不善已。故有无相生，难易相成，长短相较，高下相倾，音声相和，前后相随。是以圣人处无为之事，行不言之教。', keyQuotes: [{ quote: '有无相生，难易相成', explanation: '对立面相互依存、相互转化——这是宇宙的基本法则。' }], practiceHint: '今天观察生活中的对立：快乐与痛苦、忙碌与悠闲——它们如何相互转化？' }] },
  { slug: 'zhuangzi', title: '庄子', titleEn: 'Zhuangzi', author: '庄周', era: '战国', catSlug: 'taoism', tradition: 'TAOISM', ring: 3, summary: '道家思想的巅峰之作，以寓言和故事阐述逍遥自在的人生哲学。"庄周梦蝶"和"濠梁之辩"成为中国文化最经典的哲学意象。', difficulty: 3, oxStageMin: 2, oxStageMax: 10, tags: ['道教', '庄子', '逍遥', '齐物'], sortOrder: 1, relatedSlugs: ['daodejing'], chapters: [{ chapterNo: 1, title: '逍遥游(精选)', originalText: '北冥有鱼，其名为鲲。鲲之大，不知其几千里也。化而为鸟，其名为鹏。鹏之背，不知其几千里也。怒而飞，其翼若垂天之云。是鸟也，海运则将徙于南冥。南冥者，天池也。', keyQuotes: [{ quote: '北冥有鱼，其名为鲲', explanation: '从小鱼到大鹏的变化——象征人的精神可以无限扩展。' }], practiceHint: '放下自我设限——你的可能性远比你想象的大。' }] },
  { slug: 'liezi', title: '列子', titleEn: 'Liezi', author: '列御寇', era: '战国', catSlug: 'taoism', tradition: 'TAOISM', ring: 3, summary: '道家经典之一，以寓言阐述道的哲理。"愚公移山""杞人忧天"等故事脍炙人口。强调顺应自然、无执无碍的生活态度。', difficulty: 2, oxStageMin: 1, oxStageMax: 7, tags: ['道教', '列子', '寓言', '自然'], sortOrder: 2, chapters: [{ chapterNo: 1, title: '天瑞篇(精选)', originalText: '子列子居郑圃，四十年人无识者。国君卿大夫示之，犹众庶也。国不足，将嫁于卫。弟子曰："先生往无反期，弟子敢有所谒。先生何以教我？"子列子笑曰："子何以知之？"', keyQuotes: [{ quote: '四十年人无识者', explanation: '真正的高人隐于市井，不需要别人的认可。' }], practiceHint: '做一件好事，不告诉任何人，体会"无名"的轻松。' }] },
  { slug: 'taishang-ganying', title: '太上感应篇', titleEn: 'Treatise of the Most Exalted One on Cause and Effect', author: '佚名', era: '宋代', catSlug: 'taoism', tradition: 'TAOISM', ring: 3, summary: '道教善书经典，详述善恶因果法则。"祸福无门，惟人自召；善恶之报，如影随形"是全篇核心。通俗易懂，影响了整个中国社会的道德观念。', difficulty: 1, oxStageMin: 1, oxStageMax: 5, tags: ['道教', '因果', '善书', '感应'], sortOrder: 3, chapters: [{ chapterNo: 1, title: '感应篇(精选)', originalText: '太上曰："祸福无门，惟人自召；善恶之报，如影随形。"\n\n是以天地有司过之神，依人所犯轻重，以夺人算。算减则贫耗，多逢忧患。人皆恶之，刑祸随之，吉庆避之，恶星灾之。算尽则死。\n\n又有三台北斗神君，在人头上，录人罪恶，夺其纪算。', keyQuotes: [{ quote: '祸福无门，惟人自召', explanation: '福祸没有固定的门路——全由自己的行为召感而来。' }], practiceHint: '今天有意识地做三件善事，观察内心的变化。' }] },
  { slug: 'baopuzi', title: '抱朴子', titleEn: 'The Master Who Embraces Simplicity', author: '葛洪', era: '东晋', catSlug: 'taoism', tradition: 'TAOISM', ring: 3, summary: '葛洪所著道教重要典籍，分内篇(道教修炼)和外篇(社会政论)。内篇系统阐述金丹术、养生法和长生之道，是道教修炼理论的集大成之作。', difficulty: 3, oxStageMin: 3, oxStageMax: 9, tags: ['道教', '葛洪', '养生', '修炼'], sortOrder: 4, chapters: [{ chapterNo: 1, title: '论仙篇(精选)', originalText: '抱朴子曰："若夫仙人，以药物养身，以术数延命，使内疾不生，外患不入，虽久视不死，而旧身不改。苟有其道，无以为难也。"', keyQuotes: [{ quote: '使内疾不生，外患不入', explanation: '修行的目标：内心没有烦恼，外界不能侵扰。' }], practiceHint: '关注身体的感受——今天做一件养生的事：早睡、散步或喝一杯温水。' }] },

  // ── 儒家 ──
  { slug: 'lunyu', title: '论语', titleEn: 'The Analerta', author: '孔子弟子', era: '春秋战国', catSlug: 'confucianism', tradition: 'CONFUCIANISM', ring: 3, summary: '儒家核心经典，记录孔子及弟子的言行。"学而时习之""己所不欲勿施于人"等名句深入中华文明血脉。是修身齐家治国平天下的根本指南。', difficulty: 2, oxStageMin: 1, oxStageMax: 10, tags: ['儒家', '孔子', '论语', '修身'], sortOrder: 0, relatedSlugs: ['daxue', 'zhongyong', 'mengzi'], chapters: [{ chapterNo: 1, title: '学而篇(精选)', originalText: '子曰："学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？"\n\n曾子曰："吾日三省吾身——为人谋而不忠乎？与朋友交而不信乎？传不习乎？"\n\n子曰："弟子入则孝，出则悌，谨而信，泛爱众，而亲仁。行有余力，则以学文。"', keyQuotes: [{ quote: '吾日三省吾身', explanation: '每天反省自己——忠诚、信义、学习三个维度。' }], practiceHint: '今晚睡前做"三省"：今天是否对人尽心？是否守信？是否学到新东西？' }] },
  { slug: 'daxue', title: '大学', titleEn: 'The Great Learning', author: '曾子', era: '战国', catSlug: 'confucianism', tradition: 'CONFUCIANISM', ring: 3, summary: '儒家"四书"之一，阐述修身齐家治国平天下的八条目。"格物致知诚意正心"是个人修养的递进路径，从内在到外在的完整人生框架。', difficulty: 2, oxStageMin: 1, oxStageMax: 8, tags: ['儒家', '大学', '八条目', '修身'], sortOrder: 1, relatedSlugs: ['lunyu', 'zhongyong'], chapters: [{ chapterNo: 1, title: '大学之道', originalText: '大学之道，在明明德，在亲民，在止于至善。知止而后有定，定而后能静，静而后能安，安而后能虑，虑而后能得。物有本末，事有终始，知所先后，则近道矣。', keyQuotes: [{ quote: '大学之道，在明明德，在亲民，在止于至善', explanation: '最高的学问在于彰显光明本性、帮助他人、追求至善。' }], practiceHint: '今天做一件"明明德"的事：发现并发挥你内在的一个美好品质。' }] },
  { slug: 'zhongyong', title: '中庸', titleEn: 'The Doctrine of the Mean', author: '子思', era: '战国', catSlug: 'confucianism', tradition: 'CONFUCIANISM', ring: 3, summary: '"四书"之一，阐述"中庸之道"——不偏不倚、恰到好处的人生智慧。"天命之谓性，率性之谓道"揭示人的本性与天道的关系。', difficulty: 3, oxStageMin: 2, oxStageMax: 9, tags: ['儒家', '中庸', '天命', '诚'], sortOrder: 2, relatedSlugs: ['lunyu', 'daxue'], chapters: [{ chapterNo: 1, title: '天命之谓性', originalText: '天命之谓性，率性之谓道，修道之谓教。道也者，不可须臾离也，可离非道也。是故君子戒慎乎其所不睹，恐惧乎其所不闻。莫见乎隐，莫显乎微。故君子慎其独也。', keyQuotes: [{ quote: '天命之谓性，率性之谓道', explanation: '上天赋予的叫本性，顺着本性行事叫做道。' }], practiceHint: '今天做一件事时问："这是出于我的本性，还是出于外在压力？"顺着本性去做。' }] },
  { slug: 'mengzi', title: '孟子', titleEn: 'Mencius', author: '孟轲', era: '战国', catSlug: 'confucianism', tradition: 'CONFUCIANISM', ring: 3, summary: '"四书"之一，孟子的言行录。提出"性善论""仁政""浩然之气"等重要思想。"天将降大任于斯人也"激励了无数后人。', difficulty: 2, oxStageMin: 1, oxStageMax: 8, tags: ['儒家', '孟子', '性善', '仁政', '浩然之气'], sortOrder: 3, relatedSlugs: ['lunyu'], chapters: [{ chapterNo: 1, title: '告子上·性善(精选)', originalText: '孟子曰："人皆有不忍人之心。先王有不忍人之心，斯有不忍人之政矣。以不忍人之心，行不忍人之政，治天下可运之掌上。\n\n所以谓人皆有不忍人之心者：今人乍见孺子将入于井，皆有怵惕恻隐之心。非所以内交于孺子之父母也，非所以要誉于乡党朋友也，非恶其声而然也。"', keyQuotes: [{ quote: '人皆有不忍人之心', explanation: '每个人天生就有同情心——看到孩子要掉进井里，都会不由自主想去救。' }], practiceHint: '今天留意自己的"恻隐之心"——当你看到他人受苦时，那个自然的同情就是你的善性。' }] },
  { slug: 'yijing', title: '易经', titleEn: 'I Ching', author: '伏羲·文王·孔子', era: '周代', catSlug: 'confucianism', tradition: 'CONFUCIANISM', ring: 3, summary: '群经之首，中华文明最古老的经典。以六十四卦象征宇宙万物的变化规律。"天行健，君子以自强不息"的精神贯穿中华文明始终。', difficulty: 4, oxStageMin: 3, oxStageMax: 10, tags: ['儒家', '易经', '八卦', '变化', '天道'], sortOrder: 4, relatedSlugs: ['daodejing'], chapters: [{ chapterNo: 1, title: '乾卦·系辞(精选)', originalText: '天行健，君子以自强不息。地势坤，君子以厚德载物。\n\n一阴一阳之谓道。继之者善也，成之者性也。仁者见之谓之仁，知者见之谓之知。百姓日用而不知，故君子之道鲜矣。', keyQuotes: [{ quote: '天行健，君子以自强不息', explanation: '天道刚健运行不止——君子应效法天道，不断进取。' }], practiceHint: '今天在一个你想放弃的事情上再坚持一步——自强不息。' }] },

  // ── 基督 ──
  { slug: 'genesis', title: '创世记', titleEn: 'Genesis', author: '摩西(传统归属)', era: '公元前1400年', catSlug: 'christianity', tradition: 'CHRISTIANITY', ring: 3, summary: '圣经第一卷，记述上帝创造天地万物和人类始祖的故事。"起初，上帝创造天地"是西方文明最著名的开篇。伊甸园、诺亚方舟、巴别塔等故事影响了整个人类文化。', difficulty: 1, oxStageMin: 1, oxStageMax: 7, tags: ['基督', '创世记', '圣经', '创造'], sortOrder: 0, chapters: [{ chapterNo: 1, title: '创世记第一章', originalText: '起初，上帝创造天地。地是空虚混沌，渊面黑暗；上帝的灵运行在水面上。上帝说："要有光"，就有了光。上帝看光是好的，就把光暗分开了。上帝称光为昼，称暗为夜。有晚上，有早晨，这是头一日。', keyQuotes: [{ quote: '起初，上帝创造天地', explanation: '一切存在都有一个起源——在开始之前，是无限的可能性。' }], practiceHint: '今天你可以"创造"什么？一个微笑、一句善意的话、一个新的开始。' }] },
  { slug: 'psalms', title: '诗篇', titleEn: 'Psalms', author: '大卫王等', era: '公元前1000年', catSlug: 'christianity', tradition: 'CHRISTIANITY', ring: 3, summary: '圣经中的诗歌集，150首赞美诗，表达了人类对神的敬畏、感恩、求告和赞美。"耶和华是我的牧者，我必不至缺乏"是最广为人知的经文之一。', difficulty: 1, oxStageMin: 1, oxStageMax: 8, tags: ['基督', '诗篇', '赞美', '祷告'], sortOrder: 1, chapters: [{ chapterNo: 1, title: '诗篇第二十三篇', originalText: '耶和华是我的牧者，我必不至缺乏。他使我躺卧在青草地上，领我在可安歇的水边。他使我的灵魂苏醒，为自己的名引导我走义路。我虽然行过死荫的幽谷，也不怕遭害，因为你与我同在。', keyQuotes: [{ quote: '耶和华是我的牧者，我必不至缺乏', explanation: '信靠比自己更大的力量——你不是独自面对一切。' }], practiceHint: '在焦虑时默念"我必不至缺乏"——相信你拥有的已经足够。' }] },
  { slug: 'matthew-gospel', title: '马太福音', titleEn: 'Gospel of Matthew', author: '马太', era: '公元1世纪', catSlug: 'christianity', tradition: 'CHRISTIANITY', ring: 3, summary: '新约四福音之首，记述耶稣的生平、教导和受难复活。登山宝训(山上宝训)是基督教伦理的核心，"八福"开篇即颠覆世俗价值观。', difficulty: 2, oxStageMin: 1, oxStageMax: 10, tags: ['基督', '福音', '耶稣', '登山宝训', '八福'], sortOrder: 2, relatedSlugs: ['genesis', 'psalms'], chapters: [{ chapterNo: 1, title: '登山宝训·八福', originalText: '耶稣看见这许多的人，就上了山，既已坐下，门徒到他跟前来，他就开口教训他们说：\n\n虚心的人有福了！因为天国是他们的。\n哀恸的人有福了！因为他们必得安慰。\n温柔的人有福了！因为他们必承受地土。\n饥渴慕义的人有福了！因为他们必得饱足。\n怜恤人的人有福了！因为他们必蒙怜恤。\n清心的人有福了！因为他们必得见上帝。\n使人和睦的人有福了！因为他们必称为上帝的儿子。', keyQuotes: [{ quote: '虚心的人有福了', explanation: '谦卑的人是有福的——空杯才能盛水，虚心才能接受恩典。' }], practiceHint: '今天实践一条八福：做一件"怜恤人"的事，或做一个"使人和睦"的行动。' }] },
  { slug: 'john-gospel', title: '约翰福音', titleEn: 'Gospel of John', author: '约翰', era: '公元1世纪', catSlug: 'christianity', tradition: 'CHRISTIANITY', ring: 3, summary: '四福音中最具神学深度的一卷。"太初有道，道与上帝同在"将基督教的"道"(Logos)概念与希腊哲学相融合。强调爱的主题。', difficulty: 3, oxStageMin: 2, oxStageMax: 10, tags: ['基督', '约翰', '道', 'Logos', '爱'], sortOrder: 3, chapters: [{ chapterNo: 1, title: '太初有道', originalText: '太初有道，道与上帝同在，道就是上帝。这道太初与上帝同在。万物是借着他造的；凡被造的，没有一样不是借着他造的。生命在他里头，这生命就是人的光。光照在黑暗里，黑暗却不接受光。', keyQuotes: [{ quote: '太初有道，道与上帝同在', explanation: '在万物之先就有"道"(Logos)——宇宙的终极理性和秩序。' }], practiceHint: '思考"道"在你生命中的体现——什么是你生命中不变的真理？' }] },
  { slug: 'revelation', title: '启示录', titleEn: 'Book of Revelation', author: '约翰', era: '公元1世纪', catSlug: 'christianity', tradition: 'CHRISTIANITY', ring: 3, summary: '圣经最后一卷，以象征性的异象预言末世和新天新地。"看哪，我将一切都更新了"充满了终极希望。是基督教末世论的根基文献。', difficulty: 4, oxStageMin: 4, oxStageMax: 10, tags: ['基督', '启示录', '末世', '新天新地'], sortOrder: 4, chapters: [{ chapterNo: 1, title: '新天新地(精选)', originalText: '我又看见一个新天新地，因为先前的天地已经过去了，海也不再有了。我又看见圣城新耶路撒冷由上帝那里从天而降，预备好了，就如新妇妆饰整齐等候丈夫。\n\n我听见有大声音从宝座出来说："看哪，上帝的帐幕在人间。他要与人同住，他们要作他的子民，上帝要亲自与他们同在，作他们的上帝。上帝要擦去他们一切的眼泪。不再有死亡，也不再有悲哀、哭号、疼痛，因为以前的事都过去了。"', keyQuotes: [{ quote: '看哪，我将一切都更新了', explanation: '无论过去如何，一切都可以重新开始。' }], practiceHint: '今天就是一个"新的开始"——放下昨天的遗憾，拥抱今天的可能。' }] },

  // ── 伊斯兰 ──
  { slug: 'quran-fatiha', title: '古兰经', titleEn: 'The Quran', author: '穆罕默德(传述)', era: '7世纪', catSlug: 'islam', tradition: 'ISLAM', ring: 3, summary: '伊斯兰教根本经典，被穆斯林视为真主(安拉)的直接启示。全经114章(苏拉)，阿拉伯语原文被视为不可翻译的神圣文本。"奉至仁至慈的安拉之名"开启每一章。', difficulty: 3, oxStageMin: 1, oxStageMax: 10, tags: ['伊斯兰', '古兰经', '安拉', '启示'], sortOrder: 0, chapters: [{ chapterNo: 1, title: '开端章(法蒂海)', originalText: '奉至仁至慈的安拉之名。\n一切赞颂全归安拉——众世界的主，\n至仁至慈的主，\n报应日的主。\n我们只崇拜你，只求你佑助。\n求你引导我们上正路，\n你所佑助者的路，\n不是受谴怒者的路，也不是迷误者的路。', keyQuotes: [{ quote: '我们只崇拜你，只求你佑助', explanation: '将一切交托给更高的力量——谦卑与信赖是修行的基础。' }], practiceHint: '今天早晨用两分钟静默，将这一天交托给宇宙/更高力量。' }] },
  { slug: 'masnavi', title: '玛斯纳维', titleEn: 'Masnavi', author: '鲁米', era: '13世纪', catSlug: 'islam', tradition: 'ISLAM', ring: 3, summary: '苏菲派大师鲁米的长诗巨著，被誉为"波斯语的古兰经"。以优美的诗歌形式阐述神秘主义的爱与合一之道。"你不是这副肉体，你是灵魂"的呼唤跨越文化边界。', difficulty: 3, oxStageMin: 2, oxStageMax: 10, tags: ['伊斯兰', '苏菲', '鲁米', '神秘主义', '爱'], sortOrder: 1, chapters: [{ chapterNo: 1, title: '芦笛之歌(精选)', originalText: '你听这芦笛在倾诉，\n它在诉说离别的悲伤：\n"自从我被从芦苇丛中割下，\n我的哀鸣令男女感泣。\n我寻找一颗被离别撕裂的心，\n好向他倾诉思念的痛苦。\n每一个远离本源的人，\n都在寻找与本源重逢的时刻。"', keyQuotes: [{ quote: '每一个远离本源的人，都在寻找与本源重逢的时刻', explanation: '我们都在寻找回家的路——回到灵魂的本源。' }], practiceHint: '今天问自己：我的"本源"是什么？什么让我感到"回家"？' }] },

  // ── 印度 ──
  { slug: 'bhagavad-gita', title: '薄伽梵歌', titleEn: 'Bhagavad Gita', author: '毗耶娑(传述)', era: '公元前5世纪', catSlug: 'hinduism', tradition: 'HINDUISM', ring: 3, summary: '印度教最重要的哲学经典，是《摩诃婆罗多》中的核心篇章。克里希那(黑天)在战场上为阿周那开示人生和修行的终极智慧。提出业瑜伽、智瑜伽、爱瑜伽三条解脱之路。', difficulty: 3, oxStageMin: 1, oxStageMax: 10, tags: ['印度', '薄伽梵歌', '克里希那', '瑜伽', '业力'], sortOrder: 0, relatedSlugs: ['yoga-sutra', 'upanishad'], chapters: [{ chapterNo: 1, title: '第二章·数论瑜伽(精选)', originalText: '克里希那说：\n"智者不悲悼生者，也不悲悼死者。因为我从未不存在，你们也从未不存在，这些统治者也从未不存在；而且在未来，我们也永不会不存在。\n\n正如灵魂在这个身体中经历童年、青年和老年，同样灵魂也会进入另一个身体。坚定的人不为此迷惑。"', keyQuotes: [{ quote: '智者不悲悼生者，也不悲悼死者', explanation: '灵魂是不灭的——身体只是一件衣服，换了就换了。' }], practiceHint: '面对变化和失去时，提醒自己：真正的你——那个觉知——从未改变。' }] },
  { slug: 'upanishad', title: '奥义书', titleEn: 'Upanishads', author: '古代圣人', era: '公元前800年', catSlug: 'hinduism', tradition: 'HINDUISM', ring: 3, summary: '印度教哲学的根基，108部奥义书阐述"梵我合一"(Tat Tvam Asi)的终极真理。"你就是那个"——个体灵魂与宇宙本体的同一性，是印度灵性传统最深邃的洞见。', difficulty: 4, oxStageMin: 3, oxStageMax: 10, tags: ['印度', '奥义书', '梵我合一', '吠檀多'], sortOrder: 1, relatedSlugs: ['bhagavad-gita'], chapters: [{ chapterNo: 1, title: '歌者奥义书·Tat Tvam Asi', originalText: '乌达罗迦对儿子说："孩子，请将这块盐放入水中，明天早上来见我。"\n\n第二天，父亲说："把昨晚放进去的盐取出来。"儿子找不到，因为盐已经完全溶化了。\n\n"尝一下水面。味道如何？""咸的。""尝一下水底。""也是咸的。""孩子，你虽然看不见那个存在，但它确实在这里。这个微妙的精华，就是一切存在的自我。那就是真实。那就是自我。你就是那个(Tat Tvam Asi)。"', keyQuotes: [{ quote: 'Tat Tvam Asi — 你就是那个', explanation: '你寻找的终极真理不在别处——你自己就是那个终极实在。' }], practiceHint: '今天闭目静坐时默念"我就是那个"——感受自己与宇宙的同一性。' }] },
  { slug: 'yoga-sutra', title: '瑜伽经', titleEn: 'Yoga Sutras', author: '帕坦伽利', era: '公元前2世纪', catSlug: 'hinduism', tradition: 'HINDUISM', ring: 3, summary: '瑜伽哲学的根本经典，196条简洁的箴言。"瑜伽是心念波动的止息"(Yogas chitta vritti nirodha)是全经总纲。八支瑜伽系统(持戒、精进、体式、调息、制感、专注、冥想、三摩地)至今仍是瑜伽修行的标准路径。', difficulty: 3, oxStageMin: 1, oxStageMax: 10, tags: ['印度', '瑜伽', '八支', '三摩地', '帕坦伽利'], sortOrder: 2, relatedSlugs: ['bhagavad-gita'], chapters: [{ chapterNo: 1, title: '三摩地篇(精选)', originalText: '1.1 现在，开始瑜伽的教导。\n1.2 瑜伽是心念波动的止息。\n1.3 那时，观者安住于自性。\n1.4 其余时候，观者认同于心念的波动。', keyQuotes: [{ quote: '瑜伽是心念波动的止息', explanation: '瑜伽的本质不是体式，而是让心安静下来，回到本来的清明。' }], practiceHint: '今天做5分钟呼吸觉察——只是观察呼吸，让心念的波动自然平息。' }] },

  // ── 犹太 ──
  { slug: 'torah', title: '妥拉', titleEn: 'Torah', author: '摩西(传统归属)', era: '公元前1400年', catSlug: 'judaism', tradition: 'JUDAISM', ring: 3, summary: '犹太教最神圣的经典，即摩西五经(创世记·出埃及记·利未记·民数记·申命记)。是犹太律法和信仰的根基。"你要尽心、尽性、尽力爱耶和华你的上帝"是核心诫命。', difficulty: 3, oxStageMin: 1, oxStageMax: 10, tags: ['犹太', '妥拉', '摩西五经', '十诫'], sortOrder: 0, chapters: [{ chapterNo: 1, title: '十诫(精选)', originalText: '上帝吩咐这一切的话说：\n我是耶和华你的上帝，曾将你从埃及地为奴之家领出来。\n除了我以外，你不可有别的神。\n不可为自己雕刻偶像。\n不可妄称耶和华你上帝的名。\n当记念安息日，守为圣日。\n当孝敬父母。\n不可杀人。不可奸淫。不可偷盗。不可作假见证。不可贪恋。', keyQuotes: [{ quote: '除了我以外，你不可有别的神', explanation: '专注于唯一的终极真理——不被各种偶像(包括物质偶像)所分散。' }], practiceHint: '审视你生活中的"偶像"——金钱、地位、名声——它们是否取代了更重要的东西？' }] },
  { slug: 'talmud', title: '塔木德', titleEn: 'Talmud', author: '拉比群贤', era: '公元2-5世纪', catSlug: 'judaism', tradition: 'JUDAISM', ring: 3, summary: '犹太教口传律法的总集，是妥拉的权威解释。涵盖法律、伦理、哲学、医学等方方面面。"拯救一条生命等于拯救整个世界"等格言深刻影响了人类伦理思想。', difficulty: 4, oxStageMin: 3, oxStageMax: 10, tags: ['犹太', '塔木德', '律法', '智慧'], sortOrder: 1, chapters: [{ chapterNo: 1, title: '智慧格言集', originalText: '拯救一条生命，等于拯救了整个世界。\n不要看酒瓶，要看里面装的是什么。\n如果我不为自己，谁为我？如果我只为自己，我算什么？如果不是现在，更待何时？\n在你没有站在别人的位置之前，不要评判他。', keyQuotes: [{ quote: '如果不是现在，更待何时？', explanation: '不要等待完美的时机——现在就是最好的时候。' }], practiceHint: '你一直推迟的那件事——现在就开始做第一步。' }] },

  // ── 锡克 ──
  { slug: 'guru-granth-sahib', title: '古鲁格兰特萨希布', titleEn: 'Guru Granth Sahib', author: '十位古鲁', era: '15-17世纪', catSlug: 'sikhism', tradition: 'SIKHISM', ring: 3, summary: '锡克教最神圣的经典，被视为永恒的古鲁(导师)。1430页诗歌形式的灵性教导，融合了印度教和伊斯兰教的智慧。核心思想：一神信仰、平等、服务、诚实劳动。', difficulty: 3, oxStageMin: 1, oxStageMax: 10, tags: ['锡克', '格兰特', '古鲁', '平等'], sortOrder: 0, chapters: [{ chapterNo: 1, title: '贾普吉(精选)', originalText: '一个造物主，真理是他的名。\n他是创造者，无所畏惧，无所仇恨。\n超越时间的形象，不生不死，自我存在。\n借古鲁的恩典而知。\n\n他在太初之前就存在。\n他在时代之初就存在。\n他现在存在。\n纳纳克说，他将永远存在。', keyQuotes: [{ quote: '一个造物主，真理是他的名', explanation: '超越所有宗教形式，只有一个终极真理，它的本质就是"真"。' }], practiceHint: '今天做一件无私的服务(seva)——帮助一个陌生人，不求回报。' }] },

  // ── 藏传 ──
  { slug: 'lamrim', title: '菩提道次第广论', titleEn: 'Lamrim Chenmo', author: '宗喀巴', era: '明代(1402年)', catSlug: 'tibetan', tradition: 'TIBETAN', ring: 3, summary: '藏传佛教格鲁派根本论典，系统阐述从初学到成佛的完整修行次第。分下士道(出离轮回)、中士道(解脱自利)、上士道(菩提心利他)三个层次。', difficulty: 4, oxStageMin: 2, oxStageMax: 10, tags: ['藏传', '宗喀巴', '格鲁派', '道次第'], sortOrder: 0, chapters: [{ chapterNo: 1, title: '依止善知识(精选)', originalText: '总摄一切修行之根本，在于善知识。若无善知识引导，虽具善根亦难成就。如人入暗室，虽有珍宝而不能见，必待明灯方能识取。善知识即修行之明灯也。\n\n依止善知识之法：意乐依止——视师如佛，净信不疑。加行依止——敬事供养，依教奉行。', keyQuotes: [{ quote: '善知识即修行之明灯', explanation: '好的导师如同黑暗中的明灯——没有引导，再好的潜质也难以发挥。' }], practiceHint: '感恩生命中引导过你的老师/导师——哪怕只是默默地在心中感谢。' }] },
  { slug: 'bardo-thodol', title: '西藏度亡经', titleEn: 'Tibetan Book of the Dead', author: '莲花生大士', era: '8世纪', catSlug: 'tibetan', tradition: 'TIBETAN', ring: 3, summary: '全称《中有闻教得度》，阐述死亡过程中的中阴体验和解脱方法。描述临终、法性、投生三个中阴阶段。不仅是为亡者指路，更是为生者提供面对无常的智慧。', difficulty: 4, oxStageMin: 4, oxStageMax: 10, tags: ['藏传', '莲花生', '中阴', '死亡', '解脱'], sortOrder: 1, chapters: [{ chapterNo: 1, title: '临终中阴(精选)', originalText: '善男子(善女人)，你正在经历死亡的过程。你要如此思维：\n\n"现在死亡来临，我应以此死亡为机缘，唯一修持慈悲菩提心，为利益无边如虚空的众生而证得圆满正觉。"\n\n此时，一切外相消融。地大融入水大——身体变重；水大融入火大——口鼻干燥；火大融入风大——体温退失；风大融入识——呼吸停止。\n\n在那一刹那，法性光明——母子光明相会之际——认识它！那就是你的本性！', keyQuotes: [{ quote: '法性光明——认识它！那就是你的本性', explanation: '死亡的那一刻，本性光明自然显现——如果你能认出它，就是解脱。' }], practiceHint: '每晚入睡前做一次"小死亡"练习：放下今天的一切，完全地放松和交出。' }] },

  // ── 神道 ──
  { slug: 'kojiki', title: '古事记', titleEn: 'Kojiki', author: '太安万侣(编)', era: '712年', catSlug: 'shinto', tradition: 'SHINTO', ring: 3, summary: '日本最古老的书籍，记录天地开辟和日本神话。伊邪那岐和伊邪那美创世、天照大御神等故事是神道信仰的根基。体现了日本文化中对自然的敬畏和万物有灵的世界观。', difficulty: 2, oxStageMin: 1, oxStageMax: 7, tags: ['神道', '古事记', '天照', '日本神话'], sortOrder: 0, chapters: [{ chapterNo: 1, title: '天地初发(精选)', originalText: '天地初发之时，于高天原成神名，天之御中主神。次，高御产巢日神。次，神产巢日神。此三柱神者，并独神成坐而隐身也。\n\n次，国稚如浮脂而如水母漂流时，如苇牙萌腾之物所成神名，宇摩志阿斯诃备比古迟神。', keyQuotes: [{ quote: '天地初发之时', explanation: '万物都有一个神圣的起源——连一草一木都蕴含着创世的能量。' }], practiceHint: '今天走到自然中(公园、树下)，感受万物的生命力——神道称之为"灵气"。' }] },

  // ── 原住民 ──
  { slug: 'popol-vuh', title: '波波尔乌', titleEn: 'Popol Vuh', author: '基切玛雅人', era: '16世纪(口传更早)', catSlug: 'indigenous', tradition: 'INDIGENOUS', ring: 3, summary: '玛雅人的创世神话和英雄传说，被誉为"美洲圣经"。记述天地创造、英雄双胞胎的冒险、人类的诞生。体现了原住民对宇宙秩序的深刻理解。', difficulty: 2, oxStageMin: 1, oxStageMax: 8, tags: ['原住民', '玛雅', '创世', '英雄'], sortOrder: 0, chapters: [{ chapterNo: 1, title: '创世(精选)', originalText: '这是古老的故事的开始。这里我们要写下来。这是天空还是空的，大地还没有出现时的故事。只有平静的海水，只有宁静的天空。没有任何东西站立。只有静止的水，只有平静的海。什么也没有存在。\n\n只有造物者和塑形者在水中，被光明包围着。他们叫做"羽蛇"和"心天"。', keyQuotes: [{ quote: '只有平静的海水，只有宁静的天空', explanation: '在一切存在之前，是无限的寂静和潜力——与禅宗的"空"异曲同工。' }], practiceHint: '找一处安静的地方，回到那个"什么也没有存在"的寂静中——感受无限的可能。' }] },

  // ── 巴哈伊 ──
  { slug: 'kitab-i-aqdas', title: '至圣书', titleEn: 'Kitab-i-Aqdas', author: '巴哈欧拉', era: '1873年', catSlug: 'bahai', tradition: 'BAHAI', ring: 3, summary: '巴哈伊信仰最神圣的经典，由巴哈欧拉在阿卡监狱中所写。阐述巴哈伊信仰的律法和原则，强调人类一体、宗教和谐、男女平等、世界和平。', difficulty: 2, oxStageMin: 1, oxStageMax: 8, tags: ['巴哈伊', '巴哈欧拉', '人类一体', '世界和平'], sortOrder: 0, chapters: [{ chapterNo: 1, title: '至圣书(精选)', originalText: '地球乃一国，万众皆其民。\n\n你们不可以傲慢的眼光看待他人，不可以不洁之足步入世界。要以友谊和团结之眼观察一切。\n\n宗教的目的在于建立全人类的团结与和谐。不要让它成为分歧和纷争的根源。\n\n真正的文明不在于东方或西方，而在于人类心灵的觉醒。', keyQuotes: [{ quote: '地球乃一国，万众皆其民', explanation: '超越国界、种族、宗教的人类一体观——这是所有传统的共同愿景。' }], practiceHint: '今天与一个不同背景的人交流——发现你们之间的共同点多于不同点。' }] },
  { slug: 'hidden-words', title: '隐言经', titleEn: 'Hidden Words', author: '巴哈欧拉', era: '1858年', catSlug: 'bahai', tradition: 'BAHAI', ring: 3, summary: '巴哈欧拉的短篇灵修经典，71条阿拉伯语和82条波斯语箴言。以上帝对人类灵魂说话的形式，传达爱、公正和灵性成长的核心信息。', difficulty: 1, oxStageMin: 1, oxStageMax: 7, tags: ['巴哈伊', '巴哈欧拉', '灵修', '箴言'], sortOrder: 1, chapters: [{ chapterNo: 1, title: '隐言经(精选)', originalText: '啊，精神之子！\n我对你的第一条忠告是：拥有一颗纯洁、善良和光明的心，这样你就能拥有一个古老的、不朽的、永恒的王国。\n\n啊，存在之子！\n爱我，以便我能爱你。如果你不爱我，我的爱怎能到达你？你要思考这个问题。\n\n啊，人之子！\n我在你之前就已爱你。你也要认识我，以便我在你之中找到安息。', keyQuotes: [{ quote: '拥有一颗纯洁、善良和光明的心', explanation: '最简单也最深刻的修行——保持心的纯净。' }], practiceHint: '今天做三件事前问自己：这个行动来自"纯洁、善良和光明"吗？' }] },
];

// ════════════════════════════════════════════════════
// 执行种子
// ════════════════════════════════════════════════════

async function main() {
  console.log('🔱 M38 经论大系统种子开始...');

  // 1. 清理旧数据 (按外键反向)
  console.log('  清理旧数据...');
  await prisma.scriptureInsight.deleteMany();
  await prisma.scriptureChapter.deleteMany();
  await prisma.scripture.deleteMany();
  await prisma.scriptureCategory.deleteMany();

  // 2. 创建分类
  console.log('  创建分类...');
  const catMap = new Map<string, string>(); // slug → id

  // 先创建无parent的
  for (const cat of CATEGORIES.filter((c) => !c.parentSlug)) {
    const created = await prisma.scriptureCategory.create({
      data: {
        slug: cat.slug, name: cat.name, nameEn: cat.nameEn,
        ring: cat.ring, tradition: cat.tradition,
        icon: cat.icon, color: cat.color, description: cat.description,
        sortOrder: cat.sortOrder,
      },
    });
    catMap.set(cat.slug, created.id);
  }
  // 再创建有parent的
  for (const cat of CATEGORIES.filter((c) => c.parentSlug)) {
    const parentId = catMap.get(cat.parentSlug!);
    const created = await prisma.scriptureCategory.create({
      data: {
        slug: cat.slug, name: cat.name, nameEn: cat.nameEn,
        ring: cat.ring, tradition: cat.tradition,
        parentId: parentId || null,
        icon: cat.icon, color: cat.color, description: cat.description,
        sortOrder: cat.sortOrder,
      },
    });
    catMap.set(cat.slug, created.id);
  }
  console.log(`  ✓ ${catMap.size} 分类`);

  // 3. 创建经论 + 章节
  console.log('  创建经论...');
  const slugToId = new Map<string, string>();
  let chapterTotal = 0;

  for (const s of SCRIPTURES) {
    const catId = catMap.get(s.catSlug);
    if (!catId) {
      console.warn(`  ⚠ 分类 ${s.catSlug} 未找到，跳过 ${s.title}`);
      continue;
    }

    const scripture = await prisma.scripture.create({
      data: {
        slug: s.slug, title: s.title, titleEn: s.titleEn,
        author: s.author, era: s.era,
        categoryId: catId, tradition: s.tradition, ring: s.ring,
        summary: s.summary, significance: s.significance,
        chapterCount: s.chapters.length,
        difficulty: s.difficulty,
        oxStageMin: s.oxStageMin, oxStageMax: s.oxStageMax,
        tags: s.tags, sortOrder: s.sortOrder,
        relatedIds: [], // 后面填充
      },
    });
    slugToId.set(s.slug, scripture.id);

    // 章节
    for (const ch of s.chapters) {
      await prisma.scriptureChapter.create({
        data: {
          scriptureId: scripture.id,
          chapterNo: ch.chapterNo,
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          keyQuotes: ch.keyQuotes ?? null,
          practiceHint: ch.practiceHint,
          sortOrder: ch.chapterNo,
        },
      });
      chapterTotal++;
    }
  }
  console.log(`  ✓ ${slugToId.size} 经论, ${chapterTotal} 章节`);

  // 4. 填充 relatedIds
  console.log('  填充关联...');
  let relCount = 0;
  for (const s of SCRIPTURES) {
    if (!s.relatedSlugs?.length) continue;
    const id = slugToId.get(s.slug);
    if (!id) continue;
    const relatedIds = s.relatedSlugs
      .map((rs) => slugToId.get(rs))
      .filter(Boolean) as string[];
    if (relatedIds.length > 0) {
      await prisma.scripture.update({
        where: { id },
        data: { relatedIds },
      });
      relCount++;
    }
  }
  console.log(`  ✓ ${relCount} 经论有关联`);

  console.log('🔱 M38 经论种子完成！');
  console.log(`  分类: ${catMap.size}`);
  console.log(`  经论: ${slugToId.size}`);
  console.log(`  章节: ${chapterTotal}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
