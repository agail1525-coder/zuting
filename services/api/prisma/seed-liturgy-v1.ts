/**
 * M40 每日功课 · 12 传统礼仪模板 Seed v1
 *
 * 铁律:
 *   - 每条 template.source 必填, 引用公开文献
 *   - 每条 step 若涉及具体文本亦可带独立 source
 *   - INDIGENOUS 不代拟具体步骤, 只留空白骨架 (原住民差异极大, 请按本部族习惯)
 *   - 所有 template 带 disclaimer, 前端顶部常驻免责声明
 *   - 幂等: upsert by slug, 可重跑
 *
 * 用法: pnpm tsx prisma/seed-liturgy-v1.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMMON_DISCLAIMER =
  '本模板为公开文献整理所得, 仅供参考。具体仪规请以您所在道场/教会/导师指导为准。若发现错误, 请在"关于"页反馈。';

type StepInput = {
  kind: string;
  title: string;
  description?: string;
  scriptureSlug?: string;
  defaultRepetitions?: number;
  defaultDurationMin?: number;
  source?: string;
  optional?: boolean;
};

type TemplateInput = {
  slug: string;
  tradition: string;
  session: string;
  title: string;
  subtitle?: string;
  description?: string;
  source: string;
  suggestedDurationMin?: number;
  sortOrder?: number;
  steps: StepInput[];
};

const TEMPLATES: TemplateInput[] = [
  // ── 禅宗 (ZEN) ──────────────────────────────────────────
  {
    slug: 'zen-morning-chanmen',
    tradition: 'ZEN',
    session: 'MORNING',
    title: '禅门日诵·早课',
    subtitle: '汉传禅宗传统早课',
    description: '依《禅门日诵》通行本, 丛林早殿次第, 从楞严咒起至回向止。',
    source: '《禅门日诵》清·永觉元贤订, 汉传丛林通行本',
    suggestedDurationMin: 60,
    sortOrder: 1,
    steps: [
      { kind: 'PURIFICATION', title: '洒净·炉香赞', description: '炉香乍爇 法界蒙熏', defaultDurationMin: 2 },
      { kind: 'CHANTING', title: '《楞严咒》', description: '大佛顶首楞严神咒, 丛林早课第一课', defaultRepetitions: 1, defaultDurationMin: 20 },
      { kind: 'CHANTING', title: '《大悲咒》', defaultRepetitions: 1, defaultDurationMin: 5 },
      { kind: 'CHANTING', title: '《十小咒》', defaultRepetitions: 1, defaultDurationMin: 5 },
      { kind: 'RECITATION', title: '《般若波罗蜜多心经》', defaultRepetitions: 1, defaultDurationMin: 3 },
      { kind: 'CHANTING', title: '摩诃般若波罗蜜多三称 + 回向偈', description: '上来现前清净众...愿将此功德, 普及于一切', defaultDurationMin: 3 },
      { kind: 'DEDICATION', title: '回向', description: '三界四生同登觉岸', defaultDurationMin: 2 },
    ],
  },
  {
    slug: 'zen-evening-chanmen',
    tradition: 'ZEN',
    session: 'EVENING',
    title: '禅门日诵·晚课',
    subtitle: '汉传禅宗传统晚课',
    description: '依《禅门日诵》通行本, 丛林晚殿次第, 由《弥陀经》至蒙山施食止。',
    source: '《禅门日诵》清·永觉元贤订',
    suggestedDurationMin: 60,
    sortOrder: 2,
    steps: [
      { kind: 'RECITATION', title: '《佛说阿弥陀经》', defaultRepetitions: 1, defaultDurationMin: 10 },
      { kind: 'CHANTING', title: '《往生咒》', defaultRepetitions: 3, defaultDurationMin: 3 },
      { kind: 'CHANTING', title: '礼佛大忏悔文 (八十八佛)', defaultDurationMin: 15 },
      { kind: 'CHANTING', title: '蒙山施食', description: '慈悲布施, 利济幽冥', defaultDurationMin: 15, optional: true },
      { kind: 'DEDICATION', title: '普贤警众偈 + 回向', description: '是日已过, 命亦随减...', defaultDurationMin: 5 },
    ],
  },

  // ── 净土 / 通用汉传佛教 (BUDDHISM) ──────────────────────
  {
    slug: 'pureland-morning',
    tradition: 'BUDDHISM',
    session: 'MORNING',
    title: '净土早课',
    subtitle: '汉传净土宗简式早课',
    description: '适合在家居士的简式早课, 以念佛为核心。',
    source: '《佛门必备课诵本》净土宗通行本',
    suggestedDurationMin: 30,
    sortOrder: 1,
    steps: [
      { kind: 'PURIFICATION', title: '净口业真言 + 净三业真言', defaultDurationMin: 2 },
      { kind: 'RECITATION', title: '《心经》', defaultRepetitions: 1, defaultDurationMin: 3 },
      { kind: 'CHANTING', title: '南无阿弥陀佛 (念佛)', defaultRepetitions: 1080, defaultDurationMin: 15 },
      { kind: 'PROSTRATION', title: '拜佛 (西方三圣)', defaultRepetitions: 3, defaultDurationMin: 5 },
      { kind: 'DEDICATION', title: '回向偈', description: '愿以此功德, 庄严佛净土', defaultDurationMin: 2 },
    ],
  },
  {
    slug: 'pureland-evening',
    tradition: 'BUDDHISM',
    session: 'EVENING',
    title: '净土晚课',
    subtitle: '汉传净土宗简式晚课',
    source: '《佛门必备课诵本》',
    suggestedDurationMin: 30,
    sortOrder: 2,
    steps: [
      { kind: 'RECITATION', title: '《佛说阿弥陀经》', defaultRepetitions: 1, defaultDurationMin: 10 },
      { kind: 'CHANTING', title: '《往生咒》', defaultRepetitions: 7, defaultDurationMin: 3 },
      { kind: 'CHANTING', title: '念佛', defaultRepetitions: 500, defaultDurationMin: 10 },
      { kind: 'REFLECTION', title: '发愿 / 发菩提心', description: '大慈菩萨发愿偈', defaultDurationMin: 3 },
      { kind: 'DEDICATION', title: '回向', defaultDurationMin: 2 },
    ],
  },

  // ── 藏传 (TIBETAN) ─────────────────────────────────────
  {
    slug: 'tibetan-morning-ngondro',
    tradition: 'TIBETAN',
    session: 'MORNING',
    title: '藏传·前行日修',
    subtitle: '宁玛派共同前行简修',
    description: '依《普贤上师言教》所示前行结构, 在家修行者晨间共同前行简修。',
    source: '华智仁波切《普贤上师言教》(Kunzang Lamé Shyalung), 宁玛派前行指南',
    suggestedDurationMin: 45,
    sortOrder: 1,
    steps: [
      { kind: 'PRAYER', title: '皈依发心 (四句皈依 + 四无量心)', defaultRepetitions: 3, defaultDurationMin: 5 },
      { kind: 'CHANTING', title: '金刚萨埵百字明', description: '净除业障', defaultRepetitions: 21, defaultDurationMin: 10 },
      { kind: 'CHANTING', title: '曼达供养 (七支供)', defaultRepetitions: 7, defaultDurationMin: 5 },
      { kind: 'MEDITATION', title: '上师瑜伽 (莲师心咒)', description: '嗡阿吽 班匝儿 咕汝 叭玛 悉地吽', defaultRepetitions: 108, defaultDurationMin: 15 },
      { kind: 'DEDICATION', title: '回向菩提', description: '以此三时所积善, 普利六道众生', defaultDurationMin: 5 },
    ],
  },
  {
    slug: 'tibetan-evening-guru-yoga',
    tradition: 'TIBETAN',
    session: 'EVENING',
    title: '藏传·晚课上师相应法',
    subtitle: '莲师七句祈请 + 上师瑜伽',
    source: '《莲师七句祈请文》(Guru Rinpoche Seven-Line Prayer), 藏传通行',
    suggestedDurationMin: 30,
    sortOrder: 2,
    steps: [
      { kind: 'PRAYER', title: '莲师七句祈请文', description: '吽 邬金刹土西北隅...', defaultRepetitions: 7, defaultDurationMin: 5 },
      { kind: 'MEDITATION', title: '上师瑜伽 + 莲师心咒', defaultRepetitions: 108, defaultDurationMin: 15 },
      { kind: 'REFLECTION', title: '日省 (每日观心)', description: '今日身语意三门善恶观察', defaultDurationMin: 5 },
      { kind: 'DEDICATION', title: '回向 (普贤行愿)', defaultDurationMin: 3 },
    ],
  },

  // ── 道教 (TAOISM) ──────────────────────────────────────
  {
    slug: 'taoism-morning-zaotan',
    tradition: 'TAOISM',
    session: 'MORNING',
    title: '太上玄门日诵早坛功课',
    subtitle: '全真道早坛功课经',
    description: '全真道丛林清晨集体早课, 通行本《太上玄门日诵早坛功课经》次第。',
    source: '《太上玄门日诵早坛功课经》全真龙门派通行本',
    suggestedDurationMin: 60,
    sortOrder: 1,
    steps: [
      { kind: 'CHANTING', title: '澄清韵', description: '琳琅振响 十方肃清', defaultDurationMin: 3 },
      { kind: 'PROSTRATION', title: '举天尊名号 (三宝礼)', defaultRepetitions: 3, defaultDurationMin: 3 },
      { kind: 'CHANTING', title: '净心神咒 / 净口神咒 / 净身神咒 / 安土地神咒 / 净天地神咒', defaultDurationMin: 5 },
      { kind: 'CHANTING', title: '《太上老君说常清静经》', defaultRepetitions: 1, defaultDurationMin: 10 },
      { kind: 'CHANTING', title: '《太上洞玄灵宝无量度人上品妙经》(度人经, 节选)', defaultRepetitions: 1, defaultDurationMin: 15 },
      { kind: 'CHANTING', title: '小赞 + 三皈依', defaultDurationMin: 5 },
      { kind: 'DEDICATION', title: '回向', defaultDurationMin: 3 },
    ],
  },
  {
    slug: 'taoism-evening-wantan',
    tradition: 'TAOISM',
    session: 'EVENING',
    title: '太上玄门日诵晚坛功课',
    subtitle: '全真道晚坛功课经',
    source: '《太上玄门日诵晚坛功课经》全真龙门派通行本',
    suggestedDurationMin: 60,
    sortOrder: 2,
    steps: [
      { kind: 'CHANTING', title: '步虚韵', description: '大道洞玄虚 有念无不契', defaultDurationMin: 3 },
      { kind: 'PROSTRATION', title: '举天尊名号', defaultRepetitions: 3, defaultDurationMin: 3 },
      { kind: 'CHANTING', title: '《太乙救苦天尊说拔度血湖宝忏》节选', defaultDurationMin: 15 },
      { kind: 'CHANTING', title: '《太上洞玄灵宝救苦妙经》', defaultRepetitions: 1, defaultDurationMin: 10 },
      { kind: 'CHANTING', title: '忏悔文 + 小赞', defaultDurationMin: 5 },
      { kind: 'DEDICATION', title: '回向', defaultDurationMin: 3 },
    ],
  },

  // ── 儒家 (CONFUCIANISM) ────────────────────────────────
  {
    slug: 'confucian-morning-zhuzi',
    tradition: 'CONFUCIANISM',
    session: 'MORNING',
    title: '朱子家礼·晨省',
    subtitle: '家礼·晨起之仪',
    description: '依《朱子家礼》所载家庭晨起礼仪, 适合在家修身之人。',
    source: '《朱子家礼》宋·朱熹编撰',
    suggestedDurationMin: 25,
    sortOrder: 1,
    steps: [
      { kind: 'PURIFICATION', title: '盥洗 / 整衣冠', description: '正衣冠, 尊瞻视', defaultDurationMin: 3 },
      { kind: 'PROSTRATION', title: '家庙晨拜 (或望东揖礼)', defaultRepetitions: 1, defaultDurationMin: 2, optional: true },
      { kind: 'RECITATION', title: '诵《论语·学而》章', defaultRepetitions: 1, defaultDurationMin: 5 },
      { kind: 'MEDITATION', title: '静坐片刻 (主静)', description: '朱子主静立人极之学', defaultDurationMin: 10 },
      { kind: 'REFLECTION', title: '今日立志', description: '一日之计在于晨', defaultDurationMin: 5 },
    ],
  },
  {
    slug: 'confucian-evening-xingsheng',
    tradition: 'CONFUCIANISM',
    session: 'EVENING',
    title: '儒家·晚省三问',
    subtitle: '曾子吾日三省吾身',
    source: '《论语·学而》曾子曰: 吾日三省吾身',
    suggestedDurationMin: 20,
    sortOrder: 2,
    steps: [
      { kind: 'REFLECTION', title: '省一: 为人谋而不忠乎?', defaultDurationMin: 5 },
      { kind: 'REFLECTION', title: '省二: 与朋友交而不信乎?', defaultDurationMin: 5 },
      { kind: 'REFLECTION', title: '省三: 传不习乎?', defaultDurationMin: 5 },
      { kind: 'RECITATION', title: '诵《大学》正心修身章', defaultRepetitions: 1, defaultDurationMin: 5 },
    ],
  },

  // ── 基督教 (CHRISTIANITY) ──────────────────────────────
  {
    slug: 'christian-matins-loth',
    tradition: 'CHRISTIANITY',
    session: 'MORNING',
    title: '晨祷 · 时辰礼仪 (Matins / Lauds)',
    subtitle: 'Liturgy of the Hours · Morning Prayer',
    description: '天主教会通行时辰礼仪晨祷简式, 亦可参考圣公会《公祷书》。',
    source: 'Liturgia Horarum (Roman Catholic Liturgy of the Hours) / Book of Common Prayer',
    suggestedDurationMin: 20,
    sortOrder: 1,
    steps: [
      { kind: 'PRAYER', title: '开始句 (Deus, in adiutorium meum intende)', description: '主, 求你快来拯救我 / O God, come to my assistance', defaultDurationMin: 1 },
      { kind: 'CHANTING', title: '圣咏 (Psalmody)', description: '每日轮替之圣咏', defaultDurationMin: 8 },
      { kind: 'RECITATION', title: '短经 / 应答 (Reading & Response)', defaultDurationMin: 3 },
      { kind: 'CHANTING', title: '匝加利亚赞主曲 Benedictus', description: '路加福音 1:68–79', defaultDurationMin: 3 },
      { kind: 'PRAYER', title: '代祷 + 天主经 Pater Noster', defaultDurationMin: 3 },
      { kind: 'DEDICATION', title: '祝福 / 派遣', defaultDurationMin: 2 },
    ],
  },
  {
    slug: 'christian-vespers-loth',
    tradition: 'CHRISTIANITY',
    session: 'EVENING',
    title: '晚祷 · 时辰礼仪 (Vespers)',
    subtitle: 'Liturgy of the Hours · Evening Prayer',
    source: 'Liturgia Horarum (Roman Catholic Liturgy of the Hours) / Book of Common Prayer',
    suggestedDurationMin: 20,
    sortOrder: 2,
    steps: [
      { kind: 'PRAYER', title: '开始句 + 圣咏', defaultDurationMin: 8 },
      { kind: 'RECITATION', title: '圣经短读', defaultDurationMin: 3 },
      { kind: 'CHANTING', title: '圣母赞主曲 Magnificat', description: '路加福音 1:46–55', defaultDurationMin: 3 },
      { kind: 'PRAYER', title: '代祷 + 天主经', defaultDurationMin: 3 },
      { kind: 'DEDICATION', title: '祝福', defaultDurationMin: 2 },
    ],
  },

  // ── 伊斯兰 (ISLAM) ─────────────────────────────────────
  {
    slug: 'islam-fajr',
    tradition: 'ISLAM',
    session: 'MORNING',
    title: '晨礼 Fajr',
    subtitle: '五番拜之第一番, 黎明至日出前',
    description: '5 times daily Salah 之晨礼, 2 拉卡 Fard 拜。',
    source: 'Qur\'an 2:238; Sahih al-Bukhari Book of Prayer (Kitab al-Salah)',
    suggestedDurationMin: 15,
    sortOrder: 1,
    steps: [
      { kind: 'PURIFICATION', title: '大净 / 小净 (Wudu)', description: '水净化身心', defaultDurationMin: 5 },
      { kind: 'PRAYER', title: '宣礼 Adhan (内心或出声)', defaultDurationMin: 2 },
      { kind: 'PROSTRATION', title: '2 拉卡 Sunnah (当行逊奈拜)', defaultRepetitions: 2, defaultDurationMin: 3, optional: true },
      { kind: 'PROSTRATION', title: '2 拉卡 Fard (主命拜)', description: '诵《开端章 Al-Fatiha》 + 另一短章', defaultRepetitions: 2, defaultDurationMin: 5 },
      { kind: 'RECITATION', title: '记念真主 (Dhikr)', description: 'SubhanAllah 33× / Alhamdulillah 33× / Allahu Akbar 34×', defaultDurationMin: 3 },
    ],
  },
  {
    slug: 'islam-dhuhr',
    tradition: 'ISLAM',
    session: 'MIDDAY',
    title: '晌礼 Dhuhr',
    subtitle: '五番拜之第二番, 日过中天后',
    source: 'Qur\'an 17:78; Sahih al-Bukhari Kitab al-Salah',
    suggestedDurationMin: 15,
    sortOrder: 3,
    steps: [
      { kind: 'PURIFICATION', title: '小净 Wudu', defaultDurationMin: 3 },
      { kind: 'PROSTRATION', title: '4 拉卡 Fard', defaultRepetitions: 4, defaultDurationMin: 8 },
      { kind: 'RECITATION', title: '记念真主 Dhikr', defaultDurationMin: 3 },
    ],
  },
  {
    slug: 'islam-asr',
    tradition: 'ISLAM',
    session: 'MIDDAY',
    title: '晡礼 Asr',
    subtitle: '五番拜之第三番, 下午',
    source: 'Qur\'an 2:238; Sahih al-Bukhari',
    suggestedDurationMin: 12,
    sortOrder: 4,
    steps: [
      { kind: 'PURIFICATION', title: '小净 Wudu', defaultDurationMin: 3 },
      { kind: 'PROSTRATION', title: '4 拉卡 Fard', defaultRepetitions: 4, defaultDurationMin: 7 },
      { kind: 'RECITATION', title: 'Dhikr', defaultDurationMin: 2 },
    ],
  },
  {
    slug: 'islam-maghrib',
    tradition: 'ISLAM',
    session: 'EVENING',
    title: '昏礼 Maghrib',
    subtitle: '五番拜之第四番, 日落后',
    source: 'Qur\'an 11:114; Sahih al-Bukhari',
    suggestedDurationMin: 12,
    sortOrder: 5,
    steps: [
      { kind: 'PURIFICATION', title: '小净 Wudu', defaultDurationMin: 3 },
      { kind: 'PROSTRATION', title: '3 拉卡 Fard', defaultRepetitions: 3, defaultDurationMin: 6 },
      { kind: 'RECITATION', title: 'Dhikr', defaultDurationMin: 3 },
    ],
  },
  {
    slug: 'islam-isha',
    tradition: 'ISLAM',
    session: 'NIGHT',
    title: '宵礼 Isha',
    subtitle: '五番拜之第五番, 夜间',
    source: 'Qur\'an 17:78; Sahih al-Bukhari',
    suggestedDurationMin: 15,
    sortOrder: 6,
    steps: [
      { kind: 'PURIFICATION', title: '小净 Wudu', defaultDurationMin: 3 },
      { kind: 'PROSTRATION', title: '4 拉卡 Fard', defaultRepetitions: 4, defaultDurationMin: 8 },
      { kind: 'PROSTRATION', title: 'Witr (单数拜, 可 1/3/5 拉卡)', defaultRepetitions: 3, defaultDurationMin: 3, optional: true },
      { kind: 'RECITATION', title: 'Dhikr + 晚祷', defaultDurationMin: 3 },
    ],
  },

  // ── 印度教 (HINDUISM) ──────────────────────────────────
  {
    slug: 'hindu-sandhya-pratah',
    tradition: 'HINDUISM',
    session: 'MORNING',
    title: '晨间 Sandhyavandanam',
    subtitle: '婆罗门传统三时供奉之晨时',
    description: '依 Yajurveda 传承之晨间 Sandhya Vandanam 简式。',
    source: 'Taittiriya Aranyaka; Sandhyavandanam procedure (Krishna Yajurveda)',
    suggestedDurationMin: 25,
    sortOrder: 1,
    steps: [
      { kind: 'PURIFICATION', title: 'Achamana (三口水净)', defaultDurationMin: 2 },
      { kind: 'PRAYER', title: 'Sankalpa (发愿)', defaultDurationMin: 2 },
      { kind: 'PRAYER', title: 'Arghya (向太阳献水, 面东)', defaultRepetitions: 3, defaultDurationMin: 3 },
      { kind: 'CHANTING', title: 'Gayatri Mantra Japa', description: 'Om Bhūr Bhuvaḥ Svaḥ...', defaultRepetitions: 108, defaultDurationMin: 12 },
      { kind: 'PROSTRATION', title: 'Surya Namaskara (日敬)', defaultRepetitions: 12, defaultDurationMin: 5, optional: true },
      { kind: 'DEDICATION', title: 'Samarpanam (奉献)', defaultDurationMin: 1 },
    ],
  },
  {
    slug: 'hindu-sandhya-sayam',
    tradition: 'HINDUISM',
    session: 'EVENING',
    title: '暮间 Sandhyavandanam',
    subtitle: '婆罗门传统三时供奉之暮时',
    source: 'Taittiriya Aranyaka; Sandhyavandanam procedure',
    suggestedDurationMin: 20,
    sortOrder: 2,
    steps: [
      { kind: 'PURIFICATION', title: 'Achamana', defaultDurationMin: 2 },
      { kind: 'PRAYER', title: 'Sankalpa', defaultDurationMin: 2 },
      { kind: 'PRAYER', title: 'Arghya (面西)', defaultRepetitions: 3, defaultDurationMin: 3 },
      { kind: 'CHANTING', title: 'Gayatri Mantra Japa', defaultRepetitions: 108, defaultDurationMin: 10 },
      { kind: 'PRAYER', title: 'Aarti / 家庭祭坛灯供', defaultDurationMin: 3, optional: true },
    ],
  },

  // ── 犹太教 (JUDAISM) ──────────────────────────────────
  {
    slug: 'jewish-shacharit',
    tradition: 'JUDAISM',
    session: 'MORNING',
    title: '晨祷 Shacharit',
    subtitle: '犹太教三时祷告之晨祷',
    description: '依通行 Ashkenazi Siddur, 自 Modeh Ani 起至 Aleinu 止。',
    source: 'Siddur Ashkenaz (通行本); Talmud Berakhot 26b',
    suggestedDurationMin: 40,
    sortOrder: 1,
    steps: [
      { kind: 'PRAYER', title: 'Modeh Ani (感恩起床祷)', defaultDurationMin: 1 },
      { kind: 'PRAYER', title: 'Birchot HaShachar (晨祷祝福)', defaultDurationMin: 5 },
      { kind: 'CHANTING', title: 'Pesukei DeZimra (赞美诗篇)', defaultDurationMin: 10 },
      { kind: 'RECITATION', title: 'Shema Yisrael', description: '申命记 6:4–9', defaultRepetitions: 1, defaultDurationMin: 5 },
      { kind: 'PRAYER', title: 'Amidah (十八祝文, 站立静祷)', defaultDurationMin: 10 },
      { kind: 'PRAYER', title: 'Aleinu + Mourner\'s Kaddish', defaultDurationMin: 5 },
    ],
  },
  {
    slug: 'jewish-maariv',
    tradition: 'JUDAISM',
    session: 'EVENING',
    title: '夜祷 Maariv',
    subtitle: '犹太教三时祷告之夜祷',
    source: 'Siddur Ashkenaz; Talmud Berakhot 26b',
    suggestedDurationMin: 15,
    sortOrder: 2,
    steps: [
      { kind: 'RECITATION', title: 'Shema Yisrael (晚课版)', defaultRepetitions: 1, defaultDurationMin: 3 },
      { kind: 'PRAYER', title: 'Amidah (晚课静祷)', defaultDurationMin: 8 },
      { kind: 'PRAYER', title: 'Aleinu', defaultDurationMin: 3 },
      { kind: 'REFLECTION', title: '临睡 Shema (床前诵 Shema)', defaultDurationMin: 1, optional: true },
    ],
  },

  // ── 锡克教 (SIKHISM) ───────────────────────────────────
  {
    slug: 'sikh-nitnem-japji',
    tradition: 'SIKHISM',
    session: 'MORNING',
    title: 'Nitnem · Japji Sahib',
    subtitle: '锡克教日课晨祷三篇',
    description: 'Amrit Vela (凌晨)诵 Japji Sahib / Jaap Sahib / Tav-Prasad Savaiye, 为锡克教徒日课核心。',
    source: '《Guru Granth Sahib》Guru Nanak 撰 Japji; Dasam Granth; 锡克 Rehat Maryada',
    suggestedDurationMin: 60,
    sortOrder: 1,
    steps: [
      { kind: 'PURIFICATION', title: 'Ishnan (沐浴净身)', defaultDurationMin: 10 },
      { kind: 'RECITATION', title: 'Japji Sahib (Guru Nanak 38 Pauris)', defaultRepetitions: 1, defaultDurationMin: 20 },
      { kind: 'RECITATION', title: 'Jaap Sahib (Guru Gobind Singh)', defaultRepetitions: 1, defaultDurationMin: 15 },
      { kind: 'RECITATION', title: 'Tav-Prasad Savaiye', defaultRepetitions: 1, defaultDurationMin: 5 },
      { kind: 'PRAYER', title: 'Ardas', defaultDurationMin: 5 },
      { kind: 'MEDITATION', title: 'Waheguru Simran', defaultDurationMin: 5, optional: true },
    ],
  },
  {
    slug: 'sikh-nitnem-rehras',
    tradition: 'SIKHISM',
    session: 'EVENING',
    title: 'Nitnem · Rehras Sahib',
    subtitle: '锡克教日课晚祷',
    source: '《Guru Granth Sahib》; Rehat Maryada',
    suggestedDurationMin: 25,
    sortOrder: 2,
    steps: [
      { kind: 'RECITATION', title: 'Rehras Sahib', defaultRepetitions: 1, defaultDurationMin: 20 },
      { kind: 'PRAYER', title: 'Ardas', defaultDurationMin: 5 },
    ],
  },

  // ── 巴哈伊 (BAHAI) ─────────────────────────────────────
  {
    slug: 'bahai-obligatory-medium',
    tradition: 'BAHAI',
    session: 'MORNING',
    title: '中规祈祷 (Obligatory Prayer · Medium)',
    subtitle: '巴哈伊三选一之中规祷',
    description: '巴哈伊每日必行祷告, 信众三选其一: 短规/中规/长规。中规每日三次 (晨/午/晚)。',
    source: '《Bahá\'í Prayers》Bahá\'u\'lláh 所定; Kitáb-i-Aqdas',
    suggestedDurationMin: 15,
    sortOrder: 1,
    steps: [
      { kind: 'PURIFICATION', title: '净手洗面 (朝向 Qiblih · 巴哈欧拉墓)', defaultDurationMin: 3 },
      { kind: 'PRAYER', title: '中规必祷 (三时之一)', defaultRepetitions: 1, defaultDurationMin: 5 },
      { kind: 'MEDITATION', title: '晨间冥想', defaultDurationMin: 5, optional: true },
      { kind: 'REFLECTION', title: '日省', defaultDurationMin: 2, optional: true },
    ],
  },
  {
    slug: 'bahai-obligatory-long',
    tradition: 'BAHAI',
    session: 'EVENING',
    title: '长规祈祷 + Allah-u-Abhá 95 次',
    subtitle: '巴哈伊日诵',
    source: '《Bahá\'í Prayers》Bahá\'u\'lláh; Kitáb-i-Aqdas',
    suggestedDurationMin: 20,
    sortOrder: 2,
    steps: [
      { kind: 'PURIFICATION', title: '净手洗面', defaultDurationMin: 3 },
      { kind: 'PRAYER', title: '长规必祷 (每日一次即可)', defaultRepetitions: 1, defaultDurationMin: 8, optional: true },
      { kind: 'RECITATION', title: 'Alláh-u-Abhá (至荣者是真主)', defaultRepetitions: 95, defaultDurationMin: 5 },
      { kind: 'REFLECTION', title: '日省 + 祈祷书选读', defaultDurationMin: 4 },
    ],
  },

  // ── 神道 (SHINTO) ──────────────────────────────────────
  {
    slug: 'shinto-morning-kamidana',
    tradition: 'SHINTO',
    session: 'MORNING',
    title: '神棚日拜',
    subtitle: '家庭神棚晨间拜礼',
    description: '家庭神棚早拜, 依神社本厅所示家庭祭式。',
    source: '神社本厅《家庭祭式大要》; 神道通行作法',
    suggestedDurationMin: 10,
    sortOrder: 1,
    steps: [
      { kind: 'PURIFICATION', title: '手水 (Temizu)', description: '洗手漱口净身', defaultDurationMin: 2 },
      { kind: 'PRAYER', title: '神棚献水献米献盐', defaultDurationMin: 2 },
      { kind: 'PROSTRATION', title: '二拜二拍手一拜', defaultRepetitions: 1, defaultDurationMin: 2 },
      { kind: 'CHANTING', title: '祝词 (Norito, 如大祓词节选)', defaultDurationMin: 3, optional: true },
      { kind: 'DEDICATION', title: '感谢 · 一礼', defaultDurationMin: 1 },
    ],
  },
  {
    slug: 'shinto-evening-kansha',
    tradition: 'SHINTO',
    session: 'EVENING',
    title: '晚感恩拜',
    subtitle: '家庭神棚晚间拜礼',
    source: '神社本厅《家庭祭式大要》',
    suggestedDurationMin: 8,
    sortOrder: 2,
    steps: [
      { kind: 'PROSTRATION', title: '二拜二拍手一拜', defaultRepetitions: 1, defaultDurationMin: 2 },
      { kind: 'REFLECTION', title: '日省 (今日感恩事)', defaultDurationMin: 5 },
      { kind: 'DEDICATION', title: '一礼 · 退', defaultDurationMin: 1 },
    ],
  },

  // ── 原住民 (INDIGENOUS) · 留空白骨架, 不代拟 ────────────
  {
    slug: 'indigenous-morning-blank',
    tradition: 'INDIGENOUS',
    session: 'MORNING',
    title: '日出感恩仪式 (自定义)',
    subtitle: '各部族差异极大, 请按本传统习惯填充',
    description: '原住民传统涵盖美洲、非洲、大洋洲、东亚等众多部族, 各有不同仪式。本模板仅留空白骨架, 请您按本部族/传承习惯填充具体步骤, 或请教您的长老/elder。',
    source: '空白模板 · 请按本传统/部族习惯自定义',
    suggestedDurationMin: 20,
    sortOrder: 1,
    steps: [
      { kind: 'CUSTOM', title: '面向日出方向 (或您传统指定方向)', defaultDurationMin: 5 },
      { kind: 'CUSTOM', title: '感恩祈请 (请自定义您的祈请词)', defaultDurationMin: 10 },
      { kind: 'CUSTOM', title: '静默观想 / 自定义仪式', defaultDurationMin: 5, optional: true },
    ],
  },
  {
    slug: 'indigenous-evening-blank',
    tradition: 'INDIGENOUS',
    session: 'EVENING',
    title: '夜晚反思仪式 (自定义)',
    subtitle: '请按本部族习惯填充',
    source: '空白模板 · 请按本传统/部族习惯自定义',
    suggestedDurationMin: 15,
    sortOrder: 2,
    steps: [
      { kind: 'REFLECTION', title: '感恩今日', defaultDurationMin: 5 },
      { kind: 'REFLECTION', title: '反思 / 记录', defaultDurationMin: 5 },
      { kind: 'CUSTOM', title: '自定义夜间仪式', defaultDurationMin: 5, optional: true },
    ],
  },
];

async function main() {
  console.log(`[seed-liturgy-v1] 开始 seed ${TEMPLATES.length} 个礼仪模板...`);
  let templateCount = 0;
  let stepCount = 0;
  for (const tpl of TEMPLATES) {
    await prisma.liturgyTemplate.upsert({
      where: { slug: tpl.slug },
      create: {
        slug: tpl.slug,
        tradition: tpl.tradition,
        session: tpl.session,
        title: tpl.title,
        subtitle: tpl.subtitle,
        description: tpl.description,
        source: tpl.source,
        disclaimer: COMMON_DISCLAIMER,
        suggestedDurationMin: tpl.suggestedDurationMin,
        sortOrder: tpl.sortOrder ?? 0,
        isOfficial: true,
        steps: {
          create: tpl.steps.map((s, idx) => ({
            sortOrder: idx,
            kind: s.kind,
            title: s.title,
            description: s.description,
            scriptureSlug: s.scriptureSlug,
            defaultRepetitions: s.defaultRepetitions,
            defaultDurationMin: s.defaultDurationMin,
            source: s.source,
            optional: s.optional ?? false,
          })),
        },
      },
      update: {
        tradition: tpl.tradition,
        session: tpl.session,
        title: tpl.title,
        subtitle: tpl.subtitle,
        description: tpl.description,
        source: tpl.source,
        disclaimer: COMMON_DISCLAIMER,
        suggestedDurationMin: tpl.suggestedDurationMin,
        sortOrder: tpl.sortOrder ?? 0,
        steps: {
          deleteMany: {},
          create: tpl.steps.map((s, idx) => ({
            sortOrder: idx,
            kind: s.kind,
            title: s.title,
            description: s.description,
            scriptureSlug: s.scriptureSlug,
            defaultRepetitions: s.defaultRepetitions,
            defaultDurationMin: s.defaultDurationMin,
            source: s.source,
            optional: s.optional ?? false,
          })),
        },
      },
    });
    templateCount++;
    stepCount += tpl.steps.length;
    console.log(`  ✓ [${tpl.tradition}/${tpl.session}] ${tpl.title} (${tpl.steps.length} steps)`);
  }
  console.log(`\n[seed-liturgy-v1] 完成: ${templateCount} templates, ${stepCount} steps`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
