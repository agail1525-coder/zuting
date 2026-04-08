/**
 * 独立 Team Culture seeder — M32 v1.2
 *
 * 用途:
 *   - 部署后单独运行,确保 6 主题 + 多个案例存在于生产 DB
 *   - 完全幂等(upsert by slug),可以重跑任意次
 *   - 不依赖 HolySite/Trip/Religion 等外部表的任何 FK
 *
 * 用法:
 *   pnpm tsx prisma/seed-team-culture.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const themesData = [
  {
    slug: 'tongxin',
    title: '同心之旅',
    subtitle: '让团队在朝圣中凝聚',
    description:
      '通过共同朝圣、共修仪式与团体禅行,让组织成员在天地祖庭面前回到同一颗初心,凝聚团队共识。适合战略对齐、并购整合、跨部门破壁场景。',
    color: '#3264ff',
    icon: '☯',
    coverUrl: 'https://images.unsplash.com/photo-1545569310-25c4e8eb7eb1?w=1200',
    keywords: ['凝聚', '共识', '同行'],
    holySites: ['shaolin-temple', 'wudang-mountain'],
    routes: [],
    rituals: [
      { name: '同心共诵', durationMin: 30, description: '团队齐诵祖训三十句' },
      { name: '同行徒步', durationMin: 120, description: '一同登山到祖庭主殿' },
      { name: '同心愿牌', durationMin: 20, description: '每人挂上同主题的愿牌' },
    ],
    priceFrom: 488000,
    durationDays: 4,
    sortOrder: 10,
  },
  {
    slug: 'ganen',
    title: '感恩之旅',
    subtitle: '回到文化的源头致谢',
    description:
      '感恩父母、感恩师长、感恩天地。在祖庭与圣地之间,让每一位成员体会"感恩文化"的厚度。适合年度盛典、师徒传承、组织答谢场景。',
    color: '#4a7aff',
    icon: '🙏',
    coverUrl: 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=1200',
    keywords: ['感恩', '回馈', '传承'],
    holySites: ['kongmiao-qufu'],
    routes: [],
    rituals: [
      { name: '奉茶礼', durationMin: 30, description: '团队为长辈/同伴奉茶' },
      { name: '供灯仪', durationMin: 20, description: '在祖庭供灯发愿' },
    ],
    priceFrom: 388000,
    durationDays: 3,
    sortOrder: 20,
  },
  {
    slug: 'chuancheng',
    title: '传承之旅',
    subtitle: '从祖师手中接过那一印',
    description:
      '为有传承使命的团队设计:师徒交接、立志立愿、受印仪式。承接曹溪三十印之精神。适合接班人培育、家族企业传位、核心干部受任场景。',
    color: '#1e4dcc',
    icon: '✦',
    coverUrl: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d1e9e9?w=1200',
    keywords: ['师徒', '受印', '立愿'],
    holySites: ['caoxi-temple'],
    routes: [],
    rituals: [
      { name: '受印礼', durationMin: 60, description: '在祖庭主殿举行受印仪式' },
      { name: '立愿牌', durationMin: 30, description: '亲手书写并悬挂传承愿牌' },
    ],
    priceFrom: 688000,
    durationDays: 5,
    sortOrder: 30,
  },
  {
    slug: 'jiangxin',
    title: '匠心之旅',
    subtitle: '在工艺中见心',
    description:
      '面向工程师、设计师、手艺人。在祖庭的木构、塑像、壁画之间,体会千年匠心,重燃专业热爱。适合研发团队、设计团队、技术大牛闭关场景。',
    color: '#3264ff',
    icon: '◈',
    coverUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200',
    keywords: ['匠心', '专注', '工艺'],
    holySites: ['horyuji-temple'],
    routes: [],
    rituals: [
      { name: '观造一日', durationMin: 240, description: '观摩木作/塑像/壁画修复' },
      { name: '习艺工作坊', durationMin: 180, description: '在导师指导下习作小件' },
    ],
    priceFrom: 588000,
    durationDays: 4,
    sortOrder: 40,
  },
  {
    slug: 'cibei',
    title: '慈悲之旅',
    subtitle: '让公益成为团队基因',
    description:
      '把团建变成公益。施食、放生、捐书、助学,在朝圣中沉淀团队的慈悲底色。适合 ESG 战略、企业社会责任、品牌温度建设场景。',
    color: '#4a7aff',
    icon: '✧',
    coverUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200',
    keywords: ['慈悲', '公益', '回馈'],
    holySites: ['lumbini'],
    routes: [],
    rituals: [
      { name: '施食仪', durationMin: 60, description: '为周边需要者准备一餐' },
      { name: '助学捐书', durationMin: 30, description: '团队为乡村学校捐赠' },
    ],
    priceFrom: 358000,
    durationDays: 3,
    sortOrder: 50,
  },
  {
    slug: 'jianyi',
    title: '坚毅之旅',
    subtitle: '在逆境中重生',
    description:
      '为挑战中的团队设计:高山、夜行、守夜、断食小修。让组织在身体与意志的考验中重新出发。适合困境突围、变革转型、士气重塑场景。',
    color: '#1e4dcc',
    icon: '✶',
    coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
    keywords: ['坚毅', '突破', '重生'],
    holySites: ['mecca'],
    routes: [],
    rituals: [
      { name: '登山守夜', durationMin: 480, description: '团队登山并在祖庭守夜' },
      { name: '晨光发愿', durationMin: 30, description: '日出时刻团队齐发新愿' },
    ],
    priceFrom: 798000,
    durationDays: 6,
    sortOrder: 60,
  },
];

async function main() {
  console.log('[seed-team-culture] start');

  // ── 主题 ──
  for (const t of themesData) {
    await prisma.teamCultureTheme.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
  }
  console.log(`[seed-team-culture] ✓ ${themesData.length} themes upserted`);

  // 取主题 id 用于关联案例
  const tongxin = await prisma.teamCultureTheme.findUnique({ where: { slug: 'tongxin' } });
  const ganen = await prisma.teamCultureTheme.findUnique({ where: { slug: 'ganen' } });
  const chuancheng = await prisma.teamCultureTheme.findUnique({ where: { slug: 'chuancheng' } });
  const jiangxin = await prisma.teamCultureTheme.findUnique({ where: { slug: 'jiangxin' } });
  const cibei = await prisma.teamCultureTheme.findUnique({ where: { slug: 'cibei' } });

  // ── 案例 ──
  const casesData = [
    {
      slug: 'case-tech-tongxin-2025',
      teamName: '某互联网公司技术中台 50 人团队',
      orgType: 'ENTERPRISE' as const,
      industry: '互联网',
      themeId: tongxin?.id ?? null,
      headcount: 50,
      story:
        '在连续加班半年后,技术中台团队来到少林寺与武当山,进行了为期 4 天的"同心之旅"。从晨钟到暮鼓,从齐诵祖训到同行登山,团队在朝圣的每一步中重新找到工作之外的连接。回到岗位后,技术债清理速度提升 40%,离职率下降明显。',
      highlights: ['团队凝聚显著提升', '离职率下降', '协作效率 +40%'],
      photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800'],
      testimonial: '这是我做过最有意义的团建。— 技术总监',
      consentSigned: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'case-exec-ganen-2025',
      teamName: '某上市公司高管团队 18 人',
      orgType: 'EXECUTIVE' as const,
      industry: '高端制造',
      themeId: ganen?.id ?? null,
      headcount: 18,
      story:
        '在年度战略复盘前,18 位 VP 与事业部总裁走进曲阜孔庙,进行 3 天"感恩之旅"。在大成殿前向至圣先师致敬,在杏坛之下重读《学记》。回到公司后,董事会与高管层在战略对齐与决策共识上效率显著提升。',
      highlights: ['高管层共识对齐', '战略决策提速', '组织信念升华'],
      photos: ['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'],
      testimonial: '让我们重新理解了"领导者"三个字。— CEO',
      consentSigned: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'case-family-chuancheng-2025',
      teamName: '某百年家族企业接班人团队 12 人',
      orgType: 'FAMILY_OFFICE' as const,
      industry: '家族控股',
      themeId: chuancheng?.id ?? null,
      headcount: 12,
      story:
        '第三代接班人与第二代创始人共同走入曹溪祖庭,在五系印的传承之间,完成了从"被指定"到"主动担当"的心智转换。受印礼那一刻,年轻一代第一次明白家族基业的重量。',
      highlights: ['接班人心智成熟', '家族共识凝聚', '使命主动承接'],
      photos: ['https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'],
      testimonial: '我终于知道为什么爷爷那一辈能撑过那么多次危机。— 接班人代表',
      consentSigned: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'case-rd-jiangxin-2025',
      teamName: '某新能源车企研发核心 30 人',
      orgType: 'ENTERPRISE' as const,
      industry: '新能源汽车',
      themeId: jiangxin?.id ?? null,
      headcount: 30,
      story:
        '在新车发布前 3 个月,研发团队走进日本法隆寺,看千年木构如何挺立。回到工厂后,工程师们重新审视每一颗螺丝、每一行代码——"我们也要造能传 100 年的东西"。',
      highlights: ['工程师信念重塑', '良品率 +12%', '团队留存率提升'],
      photos: ['https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800'],
      testimonial: '原来工程师可以是匠人,不只是螺丝钉。— 总工',
      consentSigned: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'case-ngo-cibei-2025',
      teamName: '某国际公益基金会项目组 22 人',
      orgType: 'NGO' as const,
      industry: '公益慈善',
      themeId: cibei?.id ?? null,
      headcount: 22,
      story:
        '在尼泊尔蓝毗尼朝圣期间,公益基金会的项目组完成了为期 3 天的"慈悲之旅"。施食、捐书、助学,从被动执行项目转向主动发心助人。回到工作中,项目执行效率与团队凝聚力同步提升。',
      highlights: ['团队发心强化', '项目效率 +25%', '使命感升华'],
      photos: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800'],
      testimonial: '我们不再只是"做项目",我们在"行愿"。— 项目总监',
      consentSigned: true,
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  for (const c of casesData) {
    await prisma.teamCase.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log(`[seed-team-culture] ✓ ${casesData.length} cases upserted`);

  console.log('[seed-team-culture] done ✓');
}

main()
  .catch((e) => {
    console.error('[seed-team-culture] FAILED', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
