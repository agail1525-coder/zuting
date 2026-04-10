/**
 * 修行圈 Seed — M37 Cultivation Module
 *
 * 内容:
 *   - 84 条 OxCultureMapping (7 realms × 12 traditions)
 *   - 12 条 CultivationDeepModule (每个文化传统一个深修模块)
 *   - 6 条 DharmaLiveSession (示例排期)
 *
 * 幂等: upsert by unique key, 可重跑
 * 用法: pnpm tsx prisma/seed-cultivation.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── 12 Traditions ──────────────────────────────────────────
const TRADITIONS = [
  'ZEN', 'TAOISM', 'CONFUCIANISM', 'TIBETAN', 'HINDUISM', 'SIKHISM',
  'CHRISTIANITY', 'JUDAISM', 'ISLAM', 'BAHAI', 'SHINTO', 'INDIGENOUS',
] as const;

// ── 7 Realms (realmId 1-7) ────────────────────────────────
const REALMS = [
  { id: 1, name: 'AWAKENING',   label: '初觉', oxRange: [1, 1] },
  { id: 2, name: 'CLARIFYING',  label: '明心', oxRange: [2, 2] },
  { id: 3, name: 'SEEING',      label: '见性', oxRange: [3, 3] },
  { id: 4, name: 'ATTAINING',   label: '证道', oxRange: [4, 5] },
  { id: 5, name: 'INTEGRATING', label: '融通', oxRange: [6, 7] },
  { id: 6, name: 'RETURNING',   label: '归源', oxRange: [8, 9] },
  { id: 7, name: 'GIVING_BACK', label: '布施', oxRange: [10, 10] },
];

// ── Per-Tradition symbol data for each realm ───────────────
// Format: [symbolName, originalText, source]
type SymbolEntry = [string, string, string];

const SYMBOL_MAP: Record<string, SymbolEntry[]> = {
  ZEN: [
    ['寻牛', '忙忙拨草去追寻', '廓庵禅师·十牛图颂'],
    ['见迹', '水边林下迹偏多', '廓庵禅师·十牛图颂'],
    ['见牛', '黄鹂枝上一声声', '廓庵禅师·十牛图颂'],
    ['得牛', '竭尽精神获得渠', '廓庵禅师·十牛图颂'],
    ['牧牛', '鞭绳时刻不离身', '廓庵禅师·十牛图颂'],
    ['骑牛归家', '骑牛迤逦欲还家', '廓庵禅师·十牛图颂'],
    ['忘牛存人', '骑牛已得到家山', '廓庵禅师·十牛图颂'],
  ],
  TAOISM: [
    ['守静', '致虚极，守静笃', '老子·道德经·第十六章'],
    ['观复', '万物并作，吾以观复', '老子·道德经·第十六章'],
    ['明道', '道可道，非常道', '老子·道德经·第一章'],
    ['抱一', '载营魄抱一，能无离乎', '老子·道德经·第十章'],
    ['无为', '道常无为而无不为', '老子·道德经·第三十七章'],
    ['归根', '夫物芸芸，各复归其根', '老子·道德经·第十六章'],
    ['玄德', '生而不有，为而不恃', '老子·道德经·第五十一章'],
  ],
  CONFUCIANISM: [
    ['立志', '志于道，据于德', '论语·述而'],
    ['正心', '欲正其心者，先诚其意', '大学'],
    ['格物', '致知在格物', '大学'],
    ['修身', '自天子以至于庶人，壹是皆以修身为本', '大学'],
    ['齐家', '欲齐其家者，先修其身', '大学'],
    ['治国', '为政以德，譬如北辰', '论语·为政'],
    ['平天下', '老者安之，朋友信之，少者怀之', '论语·公冶长'],
  ],
  TIBETAN: [
    ['皈依', '皈依佛法僧三宝', '龙钦巴·大圆满前行'],
    ['发心', '菩提心为诸法根本', '寂天·入菩萨行论'],
    ['观空', '色即是空，空即是色', '心经'],
    ['持咒', '嗡嘛呢叭咪吽', '观世音菩萨心咒'],
    ['本尊', '上师与本尊无二', '莲花生·上师祈请文'],
    ['大手印', '心性明空不二', '冈波巴·解脱庄严宝论'],
    ['大圆满', '本来清净，任运圆成', '龙钦巴·七宝藏论'],
  ],
  HINDUISM: [
    ['觉察', '认识你自己(Atma Vichara)', '商羯罗·自我探究'],
    ['奉爱', '以全身心奉献于神(Bhakti)', '薄伽梵歌·第十二章'],
    ['瑜伽', '瑜伽是心念波动的止息', '帕坦伽利·瑜伽经 1.2'],
    ['三摩地', '当观者安住于本性', '帕坦伽利·瑜伽经 1.3'],
    ['梵我合一', 'Tat Tvam Asi (你即是那)', '奥义书·歌者奥义书'],
    ['超越', '超越三德(Gunas)的束缚', '薄伽梵歌·第十四章'],
    ['解脱', 'Moksha — 从轮回中解脱', '薄伽梵歌·第十八章'],
  ],
  SIKHISM: [
    ['聆听', 'Suniai — 聆听神之名', '古鲁·那纳克·Japji Sahib'],
    ['信奉', 'Mannai — 以信心接受', '古鲁·那纳克·Japji Sahib'],
    ['勤修', 'Naam Japna — 持诵神名', '古鲁·阿尔詹·Sukhmani Sahib'],
    ['服务', 'Seva — 无私服务', '古鲁·阿玛尔达斯'],
    ['分享', 'Vand Chakko — 与人分享', '古鲁·那纳克·教导'],
    ['谦卑', 'Nimrata — 谦卑之心', '古鲁·格兰特萨希卜'],
    ['合一', 'Ik Onkar — 一切归一', '古鲁·格兰特萨希卜'],
  ],
  CHRISTIANITY: [
    ['悔改', '天国近了，你们应当悔改', '马太福音 4:17'],
    ['信仰', '信是所望之事的实底', '希伯来书 11:1'],
    ['恩典', '你们得救是本乎恩，也因着信', '以弗所书 2:8'],
    ['爱', '你要尽心尽性尽意爱主你的神', '马太福音 22:37'],
    ['盼望', '如今常存的有信、有望、有爱', '哥林多前书 13:13'],
    ['和好', '神在基督里叫世人与自己和好', '哥林多后书 5:19'],
    ['荣耀', '所以你们要去使万民作我的门徒', '马太福音 28:19'],
  ],
  JUDAISM: [
    ['敬畏', '敬畏耶和华是智慧的开端', '箴言 9:10'],
    ['律法', 'Torah — 律法是脚前的灯', '诗篇 119:105'],
    ['悔改', 'Teshuvah — 归向上主', '以西结书 18:32'],
    ['公义', 'Tzedakah — 行公义好怜悯', '弥迦书 6:8'],
    ['安息', 'Shabbat — 当纪念安息日', '出埃及记 20:8'],
    ['修复', 'Tikkun Olam — 修复世界', '犹太密契传统'],
    ['弥赛亚', '等候那日子', '以赛亚书 11:1-9'],
  ],
  ISLAM: [
    ['清真言', 'La ilaha illallah — 万物非主唯有真主', '清真言·Shahada'],
    ['礼拜', 'Salat — 每日五次礼拜', '古兰经 2:43'],
    ['斋戒', 'Sawm — 斋月的净化', '古兰经 2:183'],
    ['天课', 'Zakat — 净化财富', '古兰经 9:60'],
    ['朝觐', 'Hajj — 一生一次的朝觐', '古兰经 3:97'],
    ['记念', 'Dhikr — 记念真主', '古兰经 33:41'],
    ['至善', 'Ihsan — 如同真主在前', '圣训·Hadith Jibril'],
  ],
  BAHAI: [
    ['独立探索', '真理独立探索', '巴哈欧拉·隐言经'],
    ['团结', '地球乃一国，人类皆其民', '巴哈欧拉'],
    ['正义', '正义是最珍爱的事物', '巴哈欧拉·隐言经'],
    ['服务', '为人类服务即为上帝服务', '阿博都巴哈'],
    ['协商', '协商是坚定之柱', '巴哈欧拉'],
    ['和平', '与万族和睦共处', '巴哈欧拉·圣辉书简'],
    ['变革', '让行动代替言辞', '巴哈欧拉·隐言经'],
  ],
  SHINTO: [
    ['祓禊', 'Harae — 净化身心', '神道祓禊仪式'],
    ['诚心', 'Makoto — 至诚之心', '古事记'],
    ['感恩', 'Kansha — 对自然万物感恩', '神道教义'],
    ['和谐', 'Wa — 人与自然的和谐', '日本书纪'],
    ['参拜', '参拝 — 神社参拜', '伊势神宫传统'],
    ['自然', '万物有灵,山川草木皆神', '古事记·神道万灵论'],
    ['天照', '天照大神之光照耀万物', '古事记'],
  ],
  INDIGENOUS: [
    ['聆听大地', '大地母亲在说话', '北美原住民长老'],
    ['梦行', 'Dreamtime — 梦境时空', '澳洲原住民传统'],
    ['四方', '向四方祈祷', '拉科塔族·四方祈祷'],
    ['圆圈', '生命之轮(Medicine Wheel)', '北美原住民传统'],
    ['祖先', '祖先的智慧永存', '非洲原住民传统'],
    ['和解', '与大地和解', '毛利族·Whakapapa'],
    ['传承', '第七代法则 — 为后代着想', '易洛魁联盟'],
  ],
};

// ── Deep Module data (12 traditions) ──────────────────────
const DEEP_MODULES: Array<{
  code: string;
  name: string;
  tradition: string;
  durationDays: number;
  description: string;
}> = [
  { code: 'DM-01', name: '禅宗公案参究', tradition: 'ZEN', durationDays: 21, description: '以赵州"无"字为起点，21天公案参究，直指人心见性成佛。含晨坐/行禅/公案解析。' },
  { code: 'DM-02', name: '道家内丹修炼', tradition: 'TAOISM', durationDays: 28, description: '小周天运气法，28天循序渐进。含站桩/坐忘/吐纳/导引四法。' },
  { code: 'DM-03', name: '儒家修身日课', tradition: 'CONFUCIANISM', durationDays: 30, description: '曾子三省吾身，30天格物致知修身齐家。含晨读经典/午省察/晚反思。' },
  { code: 'DM-04', name: '藏传四加行', tradition: 'TIBETAN', durationDays: 49, description: '十万大礼拜/十万皈依/十万金刚萨埵/十万供曼达。49天密集前行。' },
  { code: 'DM-05', name: '印度瑜伽八支', tradition: 'HINDUISM', durationDays: 40, description: '帕坦伽利八支瑜伽体系，40天从持戒到三摩地。含体位/调息/专注/禅定。' },
  { code: 'DM-06', name: '锡克持名修行', tradition: 'SIKHISM', durationDays: 21, description: '21天 Naam Japna 持名修行，配合 Kirtan 唱颂和 Langar 社区服务。' },
  { code: 'DM-07', name: '基督灵修操练', tradition: 'CHRISTIANITY', durationDays: 30, description: '依纳爵灵修操练30天版，含默想/省察/辨别/交托四阶段。' },
  { code: 'DM-08', name: '犹太妥拉研习', tradition: 'JUDAISM', durationDays: 28, description: '每周一段妥拉，28天四轮 PaRDeS 四层释经法研习。' },
  { code: 'DM-09', name: '伊斯兰苏菲修行', tradition: 'ISLAM', durationDays: 40, description: '40天 Khalwa 静修，含每日五次礼拜+Dhikr记念+古兰经诵读。' },
  { code: 'DM-10', name: '巴哈伊灵性成长', tradition: 'BAHAI', durationDays: 19, description: '巴哈伊斋月19天灵性净化，含晨祷/独立探索真理/社区服务。' },
  { code: 'DM-11', name: '神道净化仪式', tradition: 'SHINTO', durationDays: 14, description: '14天祓禊净化修行，含神社参拝/�的场修练/自然感恩/山川行禅。' },
  { code: 'DM-12', name: '原住民大地连结', tradition: 'INDIGENOUS', durationDays: 21, description: '21天大地连结修行，含四方祈祷/梦行记录/生命之轮/祖先对话。' },
];

// ── Sample DharmaLiveSession ──────────────────────────────
function futureDate(daysFromNow: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
}

const LIVE_SESSIONS = [
  { masterType: 'AI_AVATAR', masterName: '惠能 AI', tradition: 'ZEN', topic: '《坛经》导读：何为自性', durationMin: 45, daysOut: 1, hour: 7 },
  { masterType: 'AI_AVATAR', masterName: '老子 AI', tradition: 'TAOISM', topic: '道德经第一章：道可道非常道', durationMin: 30, daysOut: 2, hour: 20 },
  { masterType: 'AI_AVATAR', masterName: '孔子 AI', tradition: 'CONFUCIANISM', topic: '论语·学而：为学之道', durationMin: 40, daysOut: 3, hour: 8 },
  { masterType: 'AI_AVATAR', masterName: '莲花生 AI', tradition: 'TIBETAN', topic: '中阴教授：生死之间的光明', durationMin: 60, daysOut: 4, hour: 19 },
  { masterType: 'AI_AVATAR', masterName: '商羯罗 AI', tradition: 'HINDUISM', topic: 'Advaita Vedanta：梵我不二', durationMin: 45, daysOut: 5, hour: 6 },
  { masterType: 'AI_AVATAR', masterName: '耶稣 AI', tradition: 'CHRISTIANITY', topic: '登山宝训：八福与光盐', durationMin: 50, daysOut: 6, hour: 20 },
];

// ── Main seed function ────────────────────────────────────
async function main() {
  console.log('🌱 Seeding Cultivation data (M37)...');

  // 1. OxCultureMapping — 84 entries (7 realms × 12 traditions)
  let mappingCount = 0;
  for (const realm of REALMS) {
    for (const tradition of TRADITIONS) {
      const symbols = SYMBOL_MAP[tradition];
      const idx = realm.id - 1; // 0-6
      const sym = symbols[idx];

      await prisma.oxCultureMapping.upsert({
        where: { realmId_tradition: { realmId: realm.id, tradition } },
        create: {
          realmId: realm.id,
          oxStage: realm.oxRange[0],
          tradition,
          symbolName: sym[0],
          originalText: sym[1],
          source: sym[2],
          explanation: `${tradition} 文化在「${realm.label}」境界的核心修行符号。`,
          hasDeepModule: true,
          deepModuleCode: `DM-${String(TRADITIONS.indexOf(tradition) + 1).padStart(2, '0')}`,
          reviewStatus: 'APPROVED',
          sortOrder: realm.id * 100 + TRADITIONS.indexOf(tradition),
        },
        update: {
          symbolName: sym[0],
          originalText: sym[1],
          source: sym[2],
          explanation: `${tradition} 文化在「${realm.label}」境界的核心修行符号。`,
          reviewStatus: 'APPROVED',
        },
      });
      mappingCount++;
    }
  }
  console.log(`  ✓ OxCultureMapping: ${mappingCount} entries`);

  // 2. CultivationDeepModule — 12 entries
  for (const dm of DEEP_MODULES) {
    await prisma.cultivationDeepModule.upsert({
      where: { code: dm.code },
      create: {
        code: dm.code,
        name: dm.name,
        tradition: dm.tradition,
        applicableRealms: [1, 2, 3, 4, 5, 6, 7],
        durationDays: dm.durationDays,
        description: dm.description,
        unlockBy: 'AUTO_ON_BLEND',
        isActive: true,
      },
      update: {
        name: dm.name,
        tradition: dm.tradition,
        durationDays: dm.durationDays,
        description: dm.description,
      },
    });
  }
  console.log(`  ✓ CultivationDeepModule: ${DEEP_MODULES.length} entries`);

  // 3. DharmaLiveSession — 6 sample sessions
  // Clean old samples first, then insert fresh
  await prisma.dharmaLiveSession.deleteMany({
    where: { masterType: 'AI_AVATAR' },
  });
  for (const sess of LIVE_SESSIONS) {
    await prisma.dharmaLiveSession.create({
      data: {
        masterType: sess.masterType,
        masterName: sess.masterName,
        tradition: sess.tradition,
        topic: sess.topic,
        description: `${sess.masterName} 的直播课程：${sess.topic}`,
        startAt: futureDate(sess.daysOut, sess.hour),
        durationMin: sess.durationMin,
        status: 'SCHEDULED',
      },
    });
  }
  console.log(`  ✓ DharmaLiveSession: ${LIVE_SESSIONS.length} scheduled`);

  console.log('✅ Cultivation seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Cultivation seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
