/**
 * M38.30 经论++ v30 — 精修第二十轮：10 部禅宗五家+佛教八宗薄弱补强
 * 本轮(10部, 367 → 377):
 *   ZEN-YUNMEN +1 (雪窦重显·颂古百则) 4→5
 *   ZEN-CAODONG +1 (宏智正觉·默照铭) 6→7
 *   ZEN-FAYAN +1 (法眼文益·宗门十规论) 6→7
 *   ZEN-GUIYANG +1 (仰山慧寂·仰山语录) 6→7
 *   BUDDHIST-ESOTERIC +1 (善无畏·大日经疏) 6→7
 *   BUDDHIST-MADHYAMAKA +1 (龙树·回诤论) 6→7
 *   BUDDHIST-PURELAND +1 (昙鸾·往生论注) 6→7
 *   BUDDHIST-VINAYA +1 (义净·南海寄归内法传) 6→7
 *   BUDDHIST-YOGACARA +1 (世亲·唯识二十论) 6→7
 *   BUDDHIST-HUAYAN +1 (澄观·华严经疏) 7→8
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ChapterDef {
  chapterNo: number;
  title: string;
  subtitle?: string;
  originalText: string;
  commentary?: string;
  practiceHint?: string;
}

interface NewScriptureDef {
  slug: string;
  title: string;
  titleEn?: string;
  author?: string;
  era?: string;
  ring: number;
  categorySlug: string;
  summary: string;
  significance?: string;
  difficulty: number;
  oxStageMin: number;
  oxStageMax: number;
  readingMins?: number;
  tags: string[];
  sortOrder: number;
  relatedSlugs?: string[];
  chapters: ChapterDef[];
}

const NEW_SCRIPTURES: NewScriptureDef[] = [
  {
    slug: 'xuedou-songgu-baize',
    title: '颂古百则',
    titleEn: 'Xuedou Verses on One Hundred Old Cases',
    author: '雪窦重显',
    era: '北宋 (980-1052)',
    ring: 1,
    categorySlug: 'zen-yunmen',
    summary: '云门宗雪窦重显禅师颂古百则,以文字般若颂唱百则公案,后为圆悟克勤作评唱而成《碧岩录》之源。',
    significance: '文字禅典范,碧岩录之本。以诗颂点化公案,开禅门以文入道之风。',
    difficulty: 5,
    oxStageMin: 4,
    oxStageMax: 8,
    readingMins: 60,
    tags: ['云门宗', '颂古', '公案', '碧岩录'],
    sortOrder: 400,
    relatedSlugs: ['biyan-lu', 'yunmen-yulu'],
    chapters: [
      {
        chapterNo: 1,
        title: '第一则 武帝问达磨',
        subtitle: '举不起',
        originalText: '圣谛廓然,何当辨的?对朕者谁,还云不识。因兹暗渡江,岂免生荆棘。阖国人追不再来,千古万古空相忆。',
        commentary: '达磨不识,雪窦以"阖国人追不再来"颂其孤冷。企业家面对"第一义"不可言说时,答"不识"即是契机。',
        practiceHint: '今日面对下属一个"根本性问题"时,先回答"我也不知道",再共同探索。',
      },
      {
        chapterNo: 2,
        title: '第十九则 俱胝一指',
        subtitle: '一指头禅',
        originalText: '对扬深爱老俱胝,宇宙空来更有谁。曾向沧溟下浮木,夜涛相共接盲龟。',
        commentary: '俱胝一生只竖一指,雪窦以"沧溟浮木盲龟"颂其一指之用。一以贯之,万法归一。',
        practiceHint: '今日对团队反复强调一句核心口号,直到人人能脱口而出。',
      },
    ],
  },
  {
    slug: 'hongzhi-mozhao-ming',
    title: '默照铭',
    titleEn: 'Hongzhi Inscription on Silent Illumination',
    author: '宏智正觉',
    era: '南宋 (1091-1157)',
    ring: 1,
    categorySlug: 'zen-caodong',
    summary: '曹洞宗宏智正觉禅师作默照铭,以"默"与"照"双运阐发曹洞家风,为默照禅纲领。',
    significance: '默照禅核心文献,与大慧宗杲看话禅并为宋代两大禅法。日本曹洞宗奉为祖训。',
    difficulty: 4,
    oxStageMin: 5,
    oxStageMax: 9,
    readingMins: 25,
    tags: ['曹洞宗', '默照禅', '宏智', '静坐'],
    sortOrder: 410,
    relatedSlugs: ['dongshan-wuwei', 'dogen-shobogenzo'],
    chapters: [
      {
        chapterNo: 1,
        title: '默默忘言',
        subtitle: '昭昭现前',
        originalText: '默默忘言,昭昭现前。鉴时廓尔,体处灵然。灵然独照,照中还妙。露月星河,雪松云峤。',
        commentary: '默不是死寂,照不是有为。默照双运,如露月雪松,寂而常照,照而常寂。',
        practiceHint: '今日会议前静坐5分钟,不准备发言稿,让洞见自然显现。',
      },
      {
        chapterNo: 2,
        title: '默照之道',
        subtitle: '妙存默处',
        originalText: '妙存默处,功忘照中。妙存何存?惺惺破昏。默照之道,离微之根。彻见离微,金梭玉机。',
        commentary: '默处存妙,照中忘功。不刻意用心而心自明。企业管理亦然:越少干预,团队越能自发运转。',
        practiceHint: '本周选一项业务"不管",观察团队自行运转情况并记录。',
      },
    ],
  },
  {
    slug: 'fayan-zongmen-shigui',
    title: '宗门十规论',
    titleEn: 'Fayan Ten Regulations of the School',
    author: '法眼文益',
    era: '五代 (885-958)',
    ring: 1,
    categorySlug: 'zen-fayan',
    summary: '法眼宗初祖文益禅师以十条规则针砭当时禅门十种流弊,是禅宗唯一一部系统批评禅病的论著。',
    significance: '禅宗自我批评的典范,法眼宗"一切现成"家风的理论基础。',
    difficulty: 4,
    oxStageMin: 5,
    oxStageMax: 9,
    readingMins: 40,
    tags: ['法眼宗', '禅病', '规矩', '文益'],
    sortOrder: 420,
    relatedSlugs: ['yongming-zongjing-lu'],
    chapters: [
      {
        chapterNo: 1,
        title: '第一规 心地未明',
        subtitle: '妄为人师',
        originalText: '心地未明,妄为人师。夫欲匡徒领众,须以智眼为先。自眼未明,焉能鉴物?',
        commentary: '未见性者不可为师。法眼直指当时禅林师资滥竽充数之弊,对今日企业导师制仍振聋发聩。',
        practiceHint: '今日反省:我担任导师/领导的资格,在哪一项上还未"心地明"?',
      },
      {
        chapterNo: 2,
        title: '第五规 理事相违',
        subtitle: '不能圆融',
        originalText: '举令提纲,理事相违,不能圆融,便成乖角。夫理事者,如目足相资,阙一不可。',
        commentary: '理(道)与事(具体操作)必须圆融。企业高谈愿景而不落地,或只抓执行而无道,都是"相违"。',
        practiceHint: '检视本季度一个关键项目:愿景与KPI是否对齐?若不齐,今日修正。',
      },
    ],
  },
  {
    slug: 'yangshan-yulu',
    title: '仰山慧寂禅师语录',
    titleEn: 'Yangshan Huiji Recorded Sayings',
    author: '仰山慧寂',
    era: '晚唐 (807-883)',
    ring: 1,
    categorySlug: 'zen-guiyang',
    summary: '沩仰宗二祖仰山慧寂禅师语录,与其师沩山灵祐并称"沩仰",开创以圆相示机、父子唱和家风。',
    significance: '沩仰宗核心文献,"圆相九十六"示机法为后世禅画先河。',
    difficulty: 4,
    oxStageMin: 4,
    oxStageMax: 8,
    readingMins: 45,
    tags: ['沩仰宗', '圆相', '慧寂', '父子唱和'],
    sortOrder: 430,
    relatedSlugs: ['guishan-jingce'],
    chapters: [
      {
        chapterNo: 1,
        title: '圆相示机',
        subtitle: '画一圆相',
        originalText: '师在沩山为直岁,作务归,沩山问:"甚么处去来?"师云:"田中来。"沩山云:"田中多少人?"师插锹叉手。沩山云:"今日南山大有人刈茅。"师拔锹便行。',
        commentary: '插锹叉手,非语非默,全体现用。仰山以身示法,沩山以相契心,父子唱和即是沩仰家风。',
        practiceHint: '今日与关键同事沟通时,尝试用动作代替语言说明一个复杂流程。',
      },
      {
        chapterNo: 2,
        title: '圆相九十六',
        subtitle: '一圆三画',
        originalText: '师见僧来,便画一圆相,于中书一"佛"字。僧无语。师云:"苦哉苦哉,若是佛法,尽在里许。"',
        commentary: '圆相为心体,佛字为现用。一圆三画即摄全体大用。',
        practiceHint: '今日用一个"圆圈图"代替冗长文档向董事会汇报战略。',
      },
    ],
  },
  {
    slug: 'subhakarasimha-dari-shu',
    title: '大日经疏',
    titleEn: 'Commentary on the Mahāvairocana Sūtra',
    author: '善无畏口授·一行笔受',
    era: '唐开元年间 (724)',
    ring: 2,
    categorySlug: 'buddhist-esoteric',
    summary: '唐密开元三大士之一善无畏三藏口授,一行禅师笔录的《大日经》注疏,二十卷,为汉传密教根本疏。',
    significance: '汉传密教理论基石,日本真言宗奉为《大日经》唯一权威注解。',
    difficulty: 5,
    oxStageMin: 5,
    oxStageMax: 10,
    readingMins: 90,
    tags: ['唐密', '大日经', '胎藏界', '善无畏'],
    sortOrder: 440,
    relatedSlugs: ['jin-gang-ding-jing'],
    chapters: [
      {
        chapterNo: 1,
        title: '菩提心为因',
        subtitle: '三句义',
        originalText: '云何菩提?谓如实知自心。云何为因?谓菩提心为因。云何为根?谓大悲为根。云何究竟?谓方便为究竟。',
        commentary: '三句义: 菩提心为因,大悲为根,方便为究竟。密教修行三大支柱,摄尽显密诸法。',
        practiceHint: '今日创业/管理一项决策前,先自问三句:此事动机为何?能否利益众人?具体如何落实?',
      },
      {
        chapterNo: 2,
        title: '阿字本不生',
        subtitle: '入我我入',
        originalText: '一切法本不生,是故自性空,自性空故无所得。阿字门为一切法本不生义。',
        commentary: '梵文"阿"为一切字母之本,表一切法本不生。密教"阿字观"即从一字契入本源。',
        practiceHint: '今日静坐时,在心中持一个"阿"字音,观想其为万事起点。',
      },
    ],
  },
  {
    slug: 'nagarjuna-huizheng-lun',
    title: '回诤论',
    titleEn: 'Vigrahavyāvartanī',
    author: '龙树菩萨',
    era: '约公元2-3世纪',
    ring: 2,
    categorySlug: 'buddhist-madhyamaka',
    summary: '龙树菩萨回应正理派对"一切法空"的诘难所作,七十偈加长行自释,是中观学对"空"的辩证核心。',
    significance: '中观辩证法代表作,与《中论》《广破论》并称龙树三大破邪论。',
    difficulty: 5,
    oxStageMin: 6,
    oxStageMax: 10,
    readingMins: 50,
    tags: ['中观', '龙树', '空性', '辩证'],
    sortOrder: 450,
    relatedSlugs: ['zhonglun'],
    chapters: [
      {
        chapterNo: 1,
        title: '空非无见',
        subtitle: '破"空亦空"之诘',
        originalText: '若一切皆空,汝语亦应空,以一切法空故,云何能破有?答:若我语空者,则无可破,若我语不空,则违自宗。我今说空,即是破有,非是立空。',
        commentary: '外道诘难:你说空,则你的语言也空,无法破有。龙树答:空非一物,破有即是空,非在有之外立"空"。',
        practiceHint: '今日开会反驳某提案时,不设立"另一套主张",而只指出其内部矛盾,让它自然瓦解。',
      },
      {
        chapterNo: 2,
        title: '量与所量',
        subtitle: '破四量能立',
        originalText: '若现量等量,能成知所知;彼复有能量,若无则不成。若量能自成,不待所量成,是则量自成,非待他而成。',
        commentary: '量(认识工具)若能自成立,则不需要对象;若需对象,则对象又需另一个量来成立,陷入无穷。',
        practiceHint: '今日审视一份"数据报告"时,追问:这些数据是谁测量的?他的标准又是谁定的?',
      },
    ],
  },
  {
    slug: 'tanluan-wangsheng-lunzhu',
    title: '往生论注',
    titleEn: 'Commentary on the Treatise on Rebirth',
    author: '昙鸾大师',
    era: '北魏 (476-542)',
    ring: 2,
    categorySlug: 'buddhist-pureland',
    summary: '昙鸾大师注释世亲菩萨《往生论》之作,上下二卷,确立净土宗"他力本愿"思想,为日本净土真宗之源。',
    significance: '净土宗理论奠基作,首倡"难行道/易行道"判教,直接影响道绰、善导及日本亲鸾。',
    difficulty: 4,
    oxStageMin: 3,
    oxStageMax: 9,
    readingMins: 70,
    tags: ['净土宗', '他力', '难易二道', '昙鸾'],
    sortOrder: 460,
    relatedSlugs: ['wuliangshou-jing'],
    chapters: [
      {
        chapterNo: 1,
        title: '难行道与易行道',
        subtitle: '二道判教',
        originalText: '谨案龙树菩萨十住毗婆沙云:菩萨求阿毗跋致有二种道,一者难行道,二者易行道。难行道者,谓于五浊之世、无佛之时,求阿毗跋致为难。易行道者,谓但以信佛因缘,愿生净土。',
        commentary: '自力难行如陆路步行,他力易行如水路乘船。企业家不必事事亲力亲为,借势而行方是大智。',
        practiceHint: '今日列出3件"硬抗"的事,思考是否能借助合作伙伴/系统/平台的"他力"完成。',
      },
      {
        chapterNo: 2,
        title: '佛愿力故',
        subtitle: '他力本愿',
        originalText: '凡是生彼净土,及彼菩萨人天所起诸行,皆缘阿弥陀如来本愿力故。何以言之?若非佛力,四十八愿便是徒设。',
        commentary: '净土一切成就皆依佛本愿之力。企业成就亦依使命(愿力)而成,无使命则策略皆是空转。',
        practiceHint: '今日重写公司使命一句话,贴在办公桌前,本周每次决策前先读一遍。',
      },
    ],
  },
  {
    slug: 'yijing-nanhai-jigui',
    title: '南海寄归内法传',
    titleEn: 'Account of Buddhism Sent from the South Seas',
    author: '义净三藏',
    era: '唐武周 (691)',
    ring: 2,
    categorySlug: 'buddhist-vinaya',
    summary: '义净三藏西行求法25年后,于南海室利佛逝国寄归的印度戒律生活实录,四卷四十章,是研究印度佛教律仪的珍贵文献。',
    significance: '现存最早印度僧团实录,对比中印律仪差异,与玄奘《大唐西域记》并称"双璧"。',
    difficulty: 3,
    oxStageMin: 4,
    oxStageMax: 8,
    readingMins: 60,
    tags: ['根本说一切有部', '义净', '律仪', '南海'],
    sortOrder: 470,
    relatedSlugs: ['sifen-lu'],
    chapters: [
      {
        chapterNo: 1,
        title: '破夏非小',
        subtitle: '安居之制',
        originalText: '西方僧众,每至五月十六日安居。四月十六日亦名安居,但非正制。破夏之愆,其过非小。至七月十五日,方为解夏。',
        commentary: '印度夏安居九十日不出,乃僧团制度之核心。企业家每年亦当有"闭关期",集中专注,禁绝干扰。',
        practiceHint: '今年规划一次7天"深度工作周",只做一件核心战略事务,拒绝所有会议。',
      },
      {
        chapterNo: 2,
        title: '受斋轨则',
        subtitle: '食存五观',
        originalText: '食时默然,不得高声笑语。唯默然而食,食已持钵还房。先须洗手,然后执钵。食时须观:一计功多少,二忖己德行,三防心离过,四正事良药,五为成道业。',
        commentary: '食存五观: 念来之不易、省自身是否堪受、防贪嗔、视为良药、为成就道业。不是吃饭,是修心。',
        practiceHint: '今日三餐皆不看手机,默默吃完,吃前念"五观"一遍。',
      },
    ],
  },
  {
    slug: 'vasubandhu-weishi-ershi',
    title: '唯识二十论',
    titleEn: 'Viṃśatikā Vijñaptimātratāsiddhi',
    author: '世亲菩萨',
    era: '约公元4-5世纪',
    ring: 2,
    categorySlug: 'buddhist-yogacara',
    summary: '世亲菩萨继《成业论》后所作,以二十一颂破外道小乘对唯识的七难,是唯识学"万法唯识"的极简论证。',
    significance: '唯识学入门经典,玄奘法师译,与《三十颂》并为世亲两大代表作。',
    difficulty: 5,
    oxStageMin: 6,
    oxStageMax: 10,
    readingMins: 40,
    tags: ['唯识', '世亲', '玄奘译', '二十颂'],
    sortOrder: 480,
    relatedSlugs: ['chengweishi-lun'],
    chapters: [
      {
        chapterNo: 1,
        title: '三界唯心',
        subtitle: '立唯识义',
        originalText: '安立大乘三界唯识。以契经说三界唯心。心意识了名之差别。此中说心意兼心所。唯遮外境不遣相应。',
        commentary: '三界唯心: 我们所见的世界,不是世界本身,而是心识所显。遮拨心外之境,不否认心内的相应作用。',
        practiceHint: '今日遇到冲突时,问自己:这是对方的问题,还是我心中对"对方应如何"的期待出了问题?',
      },
      {
        chapterNo: 2,
        title: '梦喻破实',
        subtitle: '如梦如影',
        originalText: '如梦中虽无实境,而有处所时分决定,有情事用决定,皆无外境亦尔。如梦所见虽无实物,而于一处非一切处见,非一切时见,非一切人共见,然有用焉。',
        commentary: '以梦喻破"境必实有"之执: 梦中境界有定处定时,有人我交互,有作用发生,然皆无实物。',
        practiceHint: '今晚睡前记录一梦,醒后对比: 梦中的"真实感"与白天事务的"真实感"差别何在?',
      },
    ],
  },
  {
    slug: 'chengguan-huayan-jingshu',
    title: '华严经疏',
    titleEn: 'Commentary on the Avataṃsaka Sūtra',
    author: '清凉国师澄观',
    era: '唐贞元年间 (738-839)',
    ring: 2,
    categorySlug: 'buddhist-huayan',
    summary: '华严宗四祖澄观大师所撰《华严经》大疏,六十卷正文加九十卷随疏演义钞,总一百五十卷,是《华严经》最详解注。',
    significance: '华严宗理论集大成之作,澄观因此被唐德宗尊为"清凉国师",七帝门师。',
    difficulty: 5,
    oxStageMin: 6,
    oxStageMax: 10,
    readingMins: 120,
    tags: ['华严宗', '清凉澄观', '七帝门师', '四法界'],
    sortOrder: 490,
    relatedSlugs: ['huayan-jing', 'fazang-jinshizi'],
    chapters: [
      {
        chapterNo: 1,
        title: '四法界观',
        subtitle: '理事圆融',
        originalText: '统唯一真法界,谓总该万有即是一心。然心融万有,便成四种法界:一事法界,二理法界,三理事无碍法界,四事事无碍法界。',
        commentary: '四法界是华严宗核心判教:事(具体)/理(本质)/理事无碍(道器合一)/事事无碍(万物互摄)。企业管理四境层层递进。',
        practiceHint: '今日对一项业务做"四问": 具体什么?本质为何?道与器如何合?与他业务如何互摄?',
      },
      {
        chapterNo: 2,
        title: '十玄缘起',
        subtitle: '事事无碍',
        originalText: '一同时具足相应门,二广狭自在无碍门,三一多相容不同门,四诸法相即自在门,五隐密显了俱成门,六微细相容安立门,七因陀罗网境界门,八托事显法生解门,九十世隔法异成门,十主伴圆明具德门。',
        commentary: '十玄门揭示万事互摄互入、一即一切的境界。如因陀罗网,每颗宝珠映现其余一切宝珠。',
        practiceHint: '今日画一张"公司各部门互摄图": 销售如何含研发,研发如何含品牌,品牌如何含文化。',
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.30 经论++ v30 精修第二十轮 — 10 部禅宗五家+佛教八宗薄弱补强\n');

  let newScriptures = 0;
  let newChapters = 0;

  for (const def of NEW_SCRIPTURES) {
    const category = await prisma.scriptureCategory.findUnique({ where: { slug: def.categorySlug } });
    if (!category) {
      console.warn(`  ⚠ 类别未找到: ${def.categorySlug}, 跳过 ${def.slug}`);
      continue;
    }

    const scripture = await prisma.scripture.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug, title: def.title, titleEn: def.titleEn, author: def.author, era: def.era,
        ring: def.ring, categoryId: category.id, tradition: category.tradition,
        summary: def.summary, significance: def.significance,
        difficulty: def.difficulty, oxStageMin: def.oxStageMin, oxStageMax: def.oxStageMax,
        readingMins: def.readingMins, tags: def.tags, sortOrder: def.sortOrder, isPublished: true,
      },
      update: {
        title: def.title, titleEn: def.titleEn, author: def.author, era: def.era,
        ring: def.ring, categoryId: category.id, tradition: category.tradition,
        summary: def.summary, significance: def.significance,
        difficulty: def.difficulty, oxStageMin: def.oxStageMin, oxStageMax: def.oxStageMax,
        readingMins: def.readingMins, tags: def.tags, sortOrder: def.sortOrder,
      },
    });
    newScriptures++;

    for (const ch of def.chapters) {
      await prisma.scriptureChapter.upsert({
        where: { scriptureId_chapterNo: { scriptureId: scripture.id, chapterNo: ch.chapterNo } },
        create: {
          scriptureId: scripture.id, chapterNo: ch.chapterNo, title: ch.title, subtitle: ch.subtitle,
          originalText: ch.originalText, commentary: ch.commentary, practiceHint: ch.practiceHint,
        },
        update: {
          title: ch.title, subtitle: ch.subtitle,
          originalText: ch.originalText, commentary: ch.commentary, practiceHint: ch.practiceHint,
        },
      });
      newChapters++;
    }

    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { chapterCount: def.chapters.length },
    });
  }

  console.log(`  ✓ ${newScriptures} 新经论, ${newChapters} 新章节`);

  let relationCount = 0;
  for (const def of NEW_SCRIPTURES) {
    if (!def.relatedSlugs?.length) continue;
    const related = await prisma.scripture.findMany({
      where: { slug: { in: def.relatedSlugs } },
      select: { id: true },
    });
    if (related.length === 0) continue;
    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { relatedIds: related.map(r => r.id) },
    });
    relationCount++;
  }
  console.log(`  ✓ ${relationCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log(`\n📜 M38.30 精修第二十轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
