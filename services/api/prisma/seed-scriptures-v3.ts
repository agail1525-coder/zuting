/**
 * M38.3 经论++ v3 — 道儒耶印四大传统深化
 * 触发: 经论++ (2026-04-10 第二轮)
 *
 * 本轮目标:
 *   - TAOISM +3 (黄帝内经/清静经/阴符经)
 *   - CONFUCIANISM +3 (传习录/近思录/荀子)
 *   - CHRISTIANITY +3 (罗马书/忏悔录/效法基督)
 *   - HINDUISM +3 (吉檀迦利/罗摩克里希那福音/纯粹知识之书)
 *   - 核心经论补章: 道德经+2 / 论语+2 / 庄子+2
 *
 * 执行: npx tsx prisma/seed-scriptures-v3.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ChapterDef {
  chapterNo: number;
  title: string;
  subtitle?: string;
  originalText: string;
  commentary?: string;
  keyQuotes?: { quote: string; explanation: string }[];
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

// ============================================================
// PART 1: 补章已有核心经论
// ============================================================

const CHAPTER_PATCHES: Record<string, ChapterDef[]> = {
  daodejing: [
    {
      chapterNo: 6, title: '知人者智', subtitle: '自胜者强',
      originalText: '知人者智，自知者明。胜人者有力，自胜者强。知足者富，强行者有志。不失其所者久，死而不亡者寿。',
      commentary: '第三十三章。老子揭示修己胜己的根本 — 外在的智慧力量都不如内在的自知自胜。',
      keyQuotes: [
        { quote: '知人者智，自知者明', explanation: '认识他人是聪明，认识自己才是真正的明白。企业家最难的是看清自己的局限。' },
        { quote: '胜人者有力，自胜者强', explanation: '战胜别人靠力量，战胜自己才是真正的强大。' },
      ],
      practiceHint: '今晚睡前写下3件今天自己做得好的事 + 3件明天要克服的弱点。连续7天，体会"自知"与"自胜"。',
    },
    {
      chapterNo: 7, title: '大制不割', subtitle: '无为而治',
      originalText: '为学日益，为道日损。损之又损，以至于无为。无为而无不为。取天下常以无事，及其有事，不足以取天下。',
      commentary: '第四十八章。做学问不断增加知识，修道不断减少欲望和执着。',
      keyQuotes: [
        { quote: '为学日益，为道日损', explanation: '学问靠累积，修道靠减损。企业家既要做加法(能力)也要做减法(心态)。' },
        { quote: '无为而无不为', explanation: '不妄为则事事可成。真正的领导力是创造空间让人各尽其才。' },
      ],
      practiceHint: '列出你每天做的所有工作，问自己："哪些是必须我做的？哪些可以放手？"减去20%不必要的事。',
    },
  ],
  lunyu: [
    {
      chapterNo: 6, title: '公冶长第五', subtitle: '论人品德',
      originalText: '子谓子贡曰："女与回也孰愈？"对曰："赐也何敢望回。回也闻一以知十，赐也闻一以知二。"子曰："弗如也，吾与女弗如也。"\n\n宰予昼寝。子曰："朽木不可雕也，粪土之墙不可杇也，于予与何诛？"子曰："始吾于人也，听其言而信其行；今吾于人也，听其言而观其行。于予与改是。"',
      commentary: '孔子评论弟子品德 — 颜回闻一知十的悟性，宰予言行不一的警示。',
      keyQuotes: [
        { quote: '听其言而观其行', explanation: '不仅听人说什么，更要看人做什么。企业家识人用人的根本法则。' },
        { quote: '闻一以知十', explanation: '顶尖人才的标志是触类旁通、举一反三。' },
      ],
      practiceHint: '今天对你团队的每个人，记录他们"说的"和"做的"是否一致。一周后你会看清谁值得托付重任。',
    },
    {
      chapterNo: 7, title: '雍也第六', subtitle: '中庸之道',
      originalText: '子曰："贤哉，回也！一箪食，一瓢饮，在陋巷，人不堪其忧，回也不改其乐。贤哉，回也！"\n\n子曰："知之者不如好之者，好之者不如乐之者。"\n\n子曰："中庸之为德也，其至矣乎！民鲜久矣。"',
      commentary: '颜回安贫乐道，孔子赞美中庸之德 — 快乐不在外境而在内心。',
      keyQuotes: [
        { quote: '知之者不如好之者，好之者不如乐之者', explanation: '知道→喜欢→享受，是能力的三重境界。真正的高手把工作做成了乐趣。' },
        { quote: '不改其乐', explanation: '真正的快乐不依赖外在条件。这是企业家穿越周期的心理资本。' },
      ],
      practiceHint: '问自己: 如果收入减少50%，你还会做现在的事业吗？这个答案决定你是在"谋生"还是在"乐业"。',
    },
  ],
  zhuangzi: [
    {
      chapterNo: 5, title: '人间世', subtitle: '处世智慧',
      originalText: '颜回见仲尼，请行。曰："奚之？"曰："将之卫。"曰："奚为焉？"曰："回闻卫君，其年壮，其行独；轻用其国，而不见其过；轻用民死，死者以国量乎泽若蕉，民其无如矣。"仲尼曰："嘻，若殆往而刑耳！夫道不欲杂，杂则多，多则扰，扰则忧，忧而不救。"\n\n"若一志，无听之以耳而听之以心，无听之以心而听之以气。听止于耳，心止于符。气也者，虚而待物者也。唯道集虚。虚者，心斋也。"',
      commentary: '孔子教颜回"心斋" — 在复杂人间世中保持虚静的法门。',
      keyQuotes: [
        { quote: '听之以气', explanation: '最高层次的倾听不是用耳朵或头脑，而是用整个存在去感受。' },
        { quote: '虚者，心斋也', explanation: '心斋 = 让心变成空的容器，才能容纳和理解一切。顶级企业家的决策状态。' },
      ],
      practiceHint: '开下次重要会议前，闭眼3分钟，把所有预设观点清空。练习"听之以气"，你会听到从没听过的东西。',
    },
    {
      chapterNo: 6, title: '德充符', subtitle: '德之充盈',
      originalText: '鲁有兀者王骀，从之游者与仲尼相若。常季问于仲尼曰："王骀，兀者也，从之游者，与夫子中分鲁。立不教，坐不议，虚而往，实而归。固有不言之教，无形而心成者邪？是何人也？"\n\n仲尼曰："夫子，圣人也，丘也直后而未往耳。丘将以为师，而况不若丘者乎！奚假鲁国，丘将引天下而与从之。"',
      commentary: '独脚的王骀教出与孔子齐名的学生 — 真正的德不在形骸而在心性。',
      keyQuotes: [
        { quote: '立不教，坐不议，虚而往，实而归', explanation: '最高的教导是身教而非言教。真正的领导者不需多言，气场自然感染。' },
        { quote: '不言之教', explanation: '企业文化最强的塑造力量是创始人的身体力行。' },
      ],
      practiceHint: '本周不用一句"应该"教训任何人，只用行动示范。看看结果与平时的区别。',
    },
  ],
};

// ============================================================
// PART 2: 新增经论
// ============================================================

const NEW_SCRIPTURES: NewScriptureDef[] = [
  // ─── TAOISM +3 ───────────────────────────────────
  {
    slug: 'huangdi-neijing', title: '黄帝内经', titleEn: 'Huangdi Neijing',
    author: '轩辕黄帝(托名)', era: '战国至西汉', ring: 3, categorySlug: 'taoism',
    summary: '中华医学第一经典，托黄帝与岐伯对话形式阐述阴阳五行、藏象经络、天人合一的生命哲学。',
    significance: '不仅是医书，更是道家身心修炼的总纲 — 养生即修道，治未病即正心。',
    difficulty: 4, oxStageMin: 3, oxStageMax: 7, readingMins: 60,
    tags: ['黄帝', '岐伯', '阴阳', '养生', '中医'], sortOrder: 15,
    relatedSlugs: ['daodejing', 'baopuzi'],
    chapters: [
      {
        chapterNo: 1, title: '上古天真论', subtitle: '法于阴阳和于术数',
        originalText: '上古之人，其知道者，法于阴阳，和于术数，食饮有节，起居有常，不妄作劳，故能形与神俱，而尽终其天年，度百岁乃去。\n\n今时之人不然也，以酒为浆，以妄为常，醉以入房，以欲竭其精，以耗散其真，不知持满，不时御神，务快其心，逆于生乐，起居无节，故半百而衰也。\n\n夫上古圣人之教下也，皆谓之：虚邪贼风，避之有时，恬惔虚无，真气从之，精神内守，病安从来。',
        commentary: '开篇即点明长寿的秘诀 — 不是医药，而是生活方式与心态。',
        keyQuotes: [
          { quote: '食饮有节，起居有常，不妄作劳', explanation: '企业家健康的三大铁律 — 饮食节制、作息规律、不透支身体。' },
          { quote: '恬惔虚无，真气从之', explanation: '心静则气顺，气顺则身健。这是从心到身的最短路径。' },
        ],
        practiceHint: '今晚11点前睡觉。连续做到7天，你会感到真气回来了。这是最基础的修行。',
      },
      {
        chapterNo: 2, title: '四气调神大论', subtitle: '顺应四时',
        originalText: '春三月，此谓发陈，天地俱生，万物以荣，夜卧早起，广步于庭，被发缓形，以使志生，生而勿杀，予而勿夺，赏而勿罚，此春气之应，养生之道也。\n\n是故圣人不治已病治未病，不治已乱治未乱，此之谓也。夫病已成而后药之，乱已成而后治之，譬犹渴而穿井，斗而铸兵，不亦晚乎。',
        commentary: '春夏秋冬对应不同的养生之道 — 企业管理同理，要顺势而非逆势。',
        keyQuotes: [
          { quote: '不治已病治未病', explanation: '顶级的医生治"未病"，顶级的管理者防"未乱"。事后救火不如事前预防。' },
          { quote: '譬犹渴而穿井，斗而铸兵', explanation: '口渴了才打井、打仗了才造兵器 — 为时已晚。所有重要的事都要提前布局。' },
        ],
        practiceHint: '列出你事业中3个"未病" — 还没爆发但已有苗头的风险。本周就开始治它们。',
      },
    ],
  },
  {
    slug: 'qingjing-jing', title: '清静经', titleEn: 'Classic of Purity and Stillness',
    author: '葛玄传(托老君)', era: '汉代', ring: 3, categorySlug: 'taoism',
    summary: '全称《太上老君说常清静经》，道教性命双修核心经典，五百余字道尽清静无为的修心法门。',
    significance: '道教日课必诵，与《心经》并称为"入门必读、终身受用"的性命双修钥匙。',
    difficulty: 3, oxStageMin: 2, oxStageMax: 8, readingMins: 10,
    tags: ['清静', '老君', '性命双修', '内丹'], sortOrder: 16,
    relatedSlugs: ['daodejing', 'zhuangzi'],
    chapters: [
      {
        chapterNo: 1, title: '大道无形', subtitle: '清静之本',
        originalText: '老君曰：大道无形，生育天地；大道无情，运行日月；大道无名，长养万物；吾不知其名，强名曰道。\n\n夫道者：有清有浊，有动有静；天清地浊，天动地静；男清女浊，男动女静；降本流末，而生万物。清者浊之源，动者静之基；人能常清静，天地悉皆归。',
        commentary: '开宗明义 — 道本身无形无情无名，却生育万物。清浊动静相生相依。',
        keyQuotes: [
          { quote: '大道无情，运行日月', explanation: '道的"无情"不是冷漠，而是不偏私 — 太阳不会偏爱谁。公正的领导者学这份"无情"。' },
          { quote: '人能常清静，天地悉皆归', explanation: '心清静了，整个世界都向你归来。这是最高的吸引力法则。' },
        ],
        practiceHint: '每天晨起静坐10分钟，观察自己的呼吸。不追求任何状态，就是清静本身。',
      },
      {
        chapterNo: 2, title: '遣欲澄心', subtitle: '内观三者',
        originalText: '夫人神好清，而心扰之；人心好静，而欲牵之。常能遣其欲，而心自静；澄其心，而神自清；自然六欲不生，三毒消灭。\n\n所以不能者，为心未澄，欲未遣也。能遣之者，内观其心，心无其心；外观其形，形无其形；远观其物，物无其物。三者既悟，唯见于空。观空亦空，空无所空；所空既无，无无亦无；无无既无，湛然常寂。',
        commentary: '修行次第 — 遣欲→澄心→神清→悟空。三重观照层层深入。',
        keyQuotes: [
          { quote: '常能遣其欲，而心自静', explanation: '心静不是强压下去的，而是放下欲望后自然的结果。企业家焦虑的根源是欲望，不是工作。' },
          { quote: '三者既悟，唯见于空', explanation: '从观心到观形到观物，三重放下之后，才见真实。' },
        ],
        practiceHint: '列出你今天被搅动情绪的3件事，每件事问："我真正执着的是什么？"把那个执着写下来。看见即是放下的开始。',
      },
    ],
  },
  {
    slug: 'yinfu-jing', title: '阴符经', titleEn: 'Yinfu Jing',
    author: '黄帝(托名)', era: '传说先秦(唐代流行)', ring: 3, categorySlug: 'taoism',
    summary: '全称《黄帝阴符经》，三百余字道家密典，论天道人道相参、机兆时变、生杀盈虚的变化智慧。',
    significance: '道家、兵家、纵横家共尊的奇书，被视为"可以致用于身，可以致用于国"的实战经。',
    difficulty: 5, oxStageMin: 5, oxStageMax: 9, readingMins: 15,
    tags: ['阴符', '天道', '机变', '兵略'], sortOrder: 17,
    relatedSlugs: ['daodejing', 'sunzi-bingfa'],
    chapters: [
      {
        chapterNo: 1, title: '神仙抱一演道章', subtitle: '观天之道',
        originalText: '观天之道，执天之行，尽矣。故天有五贼，见之者昌。五贼在心，施行于天，宇宙在乎手，万化生乎身。\n\n天性，人也；人心，机也。立天之道，以定人也。天发杀机，移星易宿；地发杀机，龙蛇起陆；人发杀机，天地反覆；天人合发，万变定基。',
        commentary: '开篇即揭最高法则 — 观察天道并依之行事，就是一切的根本。',
        keyQuotes: [
          { quote: '观天之道，执天之行', explanation: '看清大趋势，顺势而为 — 这是企业家与普通人的根本差别。' },
          { quote: '人心，机也', explanation: '人心就是关键的机关。把握人心就把握了一切商业和组织的枢纽。' },
        ],
        practiceHint: '花30分钟研究你行业未来3年的大趋势 — 不是新闻，是底层的"天道"。顺势做一个决定。',
      },
      {
        chapterNo: 2, title: '富国安民演法章', subtitle: '机在于目',
        originalText: '天生天杀，道之理也。天地，万物之盗；万物，人之盗；人，万物之盗。三盗既宜，三才既安。故曰：食其时，百骸理；动其机，万化安。\n\n人知其神而神，不知其不神所以神也。日月有数，大小有定，圣功生焉，神明出焉。其盗机也，天下莫能见，莫能知。君子得之固穷，小人得之轻命。',
        commentary: '"三盗说"揭示万物循环相取的本质 — 看透这个你就知道如何"食时动机"。',
        keyQuotes: [
          { quote: '食其时，百骸理；动其机，万化安', explanation: '在正确的时机做正确的事 — 时机(timing)是道家最讲究的智慧。' },
          { quote: '君子得之固穷，小人得之轻命', explanation: '同样的智慧，君子用来守持本分，小人用来冒险妄动。工具无好坏，看用者的心。' },
        ],
        practiceHint: '复盘你近期一个失败的决定 — 不是方向错，而是时机错了吗？从时机角度重新审视。',
      },
    ],
  },

  // ─── CONFUCIANISM +3 ─────────────────────────────
  {
    slug: 'chuanxi-lu', title: '传习录', titleEn: 'Instructions for Practical Living',
    author: '王阳明', era: '明朝(1518)', ring: 3, categorySlug: 'confucianism',
    summary: '王阳明心学语录，弟子徐爱、钱德洪等辑录，核心为"心即理、知行合一、致良知"三大命题。',
    significance: '中国儒家最后一次思想高峰，东亚现代化的精神资源 — 日本明治维新、蒋介石、稻盛和夫皆奉为圭臬。',
    difficulty: 4, oxStageMin: 4, oxStageMax: 9, readingMins: 50,
    tags: ['王阳明', '心学', '知行合一', '致良知'], sortOrder: 10,
    relatedSlugs: ['lunyu', 'daxue', 'zhongyong'],
    chapters: [
      {
        chapterNo: 1, title: '心即理', subtitle: '徐爱录',
        originalText: '爱问："至善只求诸心，恐于天下事理，有不能尽。"先生曰："心即理也。天下又有心外之事，心外之理乎？"爱曰："如事父之孝，事君之忠，交友之信，治民之仁，其间有许多理在，恐亦不可不察。"先生叹曰："此说之蔽久矣，岂一语所能悟？今姑就所问者言之：且如事父，不成去父上求个孝的理？事君，不成去君上求个忠的理？交友、治民，不成去友上、民上求个信与仁的理？都只在此心，心即理也。"',
        commentary: '心学开宗立论 — 天下一切道理都在心中，不必向外求。',
        keyQuotes: [
          { quote: '心即理也。天下又有心外之事，心外之理乎', explanation: '所有的道理都在你心中。你不孝不是因为不懂孝的道理，而是心中没有孝。' },
          { quote: '都只在此心', explanation: '做任何事都回到本心 — 你真心想要什么？这就是最高的商业决策法。' },
        ],
        practiceHint: '下次做重大决定前，静下来问自己的心："我真正想要的是什么？"不问别人，不查资料。',
      },
      {
        chapterNo: 2, title: '知行合一', subtitle: '徐爱续录',
        originalText: '爱曰："古人说知行做两个，亦是要人见个分晓。一行做知的功夫，一行做行的功夫，即功夫始有下落。"先生曰："此却失了古人宗旨也。某尝说知是行的主意，行是知的功夫；知是行之始，行是知之成。\n\n若会得时，只说一个知，已自有行在；只说一个行，已自有知在。古人所以既说一个知又说一个行者，只为世间有一种人，懵懵懂懂的任意去做，全不解思惟省察，也只是个冥行妄作，所以必说个知，方才行得是。"',
        commentary: '知行合一的真意 — 知而不行不是真知，行而不思不是真行。',
        keyQuotes: [
          { quote: '知是行之始，行是知之成', explanation: '真正的知一定带着行动，真正的行一定包含理解。分开来看的人是在自欺。' },
          { quote: '只说一个知，已自有行在', explanation: '你真正知道了某件事，行动就会自然发生。没有行动证明你并不真知。' },
        ],
        practiceHint: '列出3件"我知道应该做但没做"的事。它们其实是你"知道却不真知"的事。今天做其中一件。',
      },
      {
        chapterNo: 3, title: '致良知', subtitle: '钱德洪录',
        originalText: '先生曰："良知只是个是非之心，是非只是个好恶。只好恶就尽了是非，只是非就尽了万事万变。"又曰："是非两字是个大规矩，巧处则存乎其人。"\n\n先生曰："吾辈用功，只求日减，不求日增。减得一分人欲，便是复得一分天理，何等轻快脱洒，何等简易。"',
        commentary: '致良知 — 阳明心学的最终归宿。良知就是每个人本有的是非判断力。',
        keyQuotes: [
          { quote: '良知只是个是非之心', explanation: '良知不是高深概念，就是你此刻心中明白的是与非。这个"明白"就是佛性、就是天理。' },
          { quote: '只求日减，不求日增', explanation: '修行不是累积新东西，而是减去遮蔽良知的私欲。日减一分，良知就显现一分。' },
        ],
        practiceHint: '今天做每个决定时，停3秒问："我的良知怎么说？"不问利害，只问是非。连续7天，你会发现决策力大增。',
      },
    ],
  },
  {
    slug: 'jinsi-lu', title: '近思录', titleEn: 'Reflections on Things at Hand',
    author: '朱熹·吕祖谦', era: '南宋(1175)', ring: 3, categorySlug: 'confucianism',
    summary: '朱熹与吕祖谦合编，辑录周敦颐、程颢、程颐、张载四子语录，分14卷，是理学入门总纲。',
    significance: '被誉为"孔孟入门之阶，洙泗门墙之径"，东亚理学教育的标准教科书近800年。',
    difficulty: 4, oxStageMin: 3, oxStageMax: 8, readingMins: 45,
    tags: ['朱熹', '吕祖谦', '理学', '四子'], sortOrder: 11,
    relatedSlugs: ['lunyu', 'daxue', 'chuanxi-lu'],
    chapters: [
      {
        chapterNo: 1, title: '道体', subtitle: '太极图说',
        originalText: '濂溪先生曰：无极而太极。太极动而生阳，动极而静，静而生阴。静极复动。一动一静，互为其根。分阴分阳，两仪立焉。\n\n伊川先生曰：一物之理即万物之理，一日之运即一岁之运。至微者理也，至著者象也。体用一源，显微无间。',
        commentary: '周敦颐《太极图说》与程颐"体用一源"论 — 理学宇宙观的开端。',
        keyQuotes: [
          { quote: '一动一静，互为其根', explanation: '动与静、阴与阳不是对立而是互为根源。企业家要学会动中有静、静中有动。' },
          { quote: '体用一源，显微无间', explanation: '本体与作用是一体的，微观与宏观没有分隔。做小事就是做大事。' },
        ],
        practiceHint: '观察你一天中最忙乱的时刻 — 那个时刻你心中有"静"吗？如果没有，就在最忙时做3次深呼吸。',
      },
      {
        chapterNo: 2, title: '为学', subtitle: '涵养须用敬',
        originalText: '伊川先生曰：涵养须用敬，进学则在致知。又曰：敬即便是礼，无己可克。\n\n张子曰：为天地立心，为生民立命，为往圣继绝学，为万世开太平。\n\n明道先生曰：学者须先识仁。仁者，浑然与物同体。义、礼、知、信皆仁也。识得此理，以诚敬存之而已。',
        commentary: '横渠四句 — 中国知识分子最高的自我期许。',
        keyQuotes: [
          { quote: '为天地立心，为生民立命，为往圣继绝学，为万世开太平', explanation: '张载四句是中国士大夫的使命宣言。顶级企业家也应有此气魄 — 创造不朽事业。' },
          { quote: '涵养须用敬，进学则在致知', explanation: '日常涵养靠"敬"(专注恭敬)，求知靠"致知"(追根究底)。两者缺一不可。' },
        ],
        practiceHint: '用张载四句为你的企业写一个新的使命宣言。把"为万世"换成你的领域。',
      },
    ],
  },
  {
    slug: 'xunzi', title: '荀子', titleEn: 'Xunzi',
    author: '荀况', era: '战国末期', ring: 3, categorySlug: 'confucianism',
    summary: '战国末儒家集大成者荀子著作，32篇。主性恶论、礼法并用、天人相分，是先秦儒学最系统的理论著作。',
    significance: '与孟子性善论并立的儒家另一支柱。荀子弟子韩非、李斯是法家代表，深刻影响秦汉政治。',
    difficulty: 4, oxStageMin: 3, oxStageMax: 8, readingMins: 55,
    tags: ['荀子', '性恶', '礼法', '先秦儒'], sortOrder: 12,
    relatedSlugs: ['lunyu', 'mengzi'],
    chapters: [
      {
        chapterNo: 1, title: '劝学篇', subtitle: '学不可以已',
        originalText: '君子曰：学不可以已。青，取之于蓝而青于蓝；冰，水为之而寒于水。\n\n吾尝终日而思矣，不如须臾之所学也；吾尝跂而望矣，不如登高之博见也。登高而招，臂非加长也，而见者远；顺风而呼，声非加疾也，而闻者彰。假舆马者，非利足也，而致千里；假舟楫者，非能水也，而绝江河。君子生非异也，善假于物也。\n\n积土成山，风雨兴焉；积水成渊，蛟龙生焉；积善成德，而神明自得，圣心备焉。',
        commentary: '荀子开篇即强调学习与借势的力量 — "善假于物"是最高的智慧。',
        keyQuotes: [
          { quote: '青，取之于蓝而青于蓝', explanation: '学生可以超过老师，后辈可以超过前辈。但前提是持续学习。' },
          { quote: '君子生非异也，善假于物也', explanation: '成功的人不是天生异能，而是善于借助外物(工具/人才/资源)。这就是杠杆思维。' },
          { quote: '积土成山，积水成渊，积善成德', explanation: '一切大成就都来自微小行动的积累。' },
        ],
        practiceHint: '列出你现在还没借助的3种"物" — 工具、人才、资金、知识。本月至少借一种。',
      },
      {
        chapterNo: 2, title: '天论', subtitle: '制天命而用之',
        originalText: '天行有常，不为尧存，不为桀亡。应之以治则吉，应之以乱则凶。\n\n大天而思之，孰与物畜而制之？从天而颂之，孰与制天命而用之？望时而待之，孰与应时而使之？\n\n故错人而思天，则失万物之情。',
        commentary: '荀子最革命的观点 — 天道客观不变，人类不应迷信而应主动认识和利用自然规律。',
        keyQuotes: [
          { quote: '天行有常，不为尧存，不为桀亡', explanation: '客观规律不因人的好坏而改变。企业家要认识规律，而不是祈求例外。' },
          { quote: '制天命而用之', explanation: '荀子的豪言 — 不要顺天等天，要制天用天。这是先秦最进取的思想。' },
        ],
        practiceHint: '列出你行业的"天命"(客观规律)3条。思考如何不是逆它也不是顺它，而是"制而用之"。',
      },
    ],
  },

  // ─── CHRISTIANITY +3 ─────────────────────────────
  {
    slug: 'romans-epistle', title: '罗马书', titleEn: 'Epistle to the Romans',
    author: '使徒保罗', era: '约公元57年', ring: 3, categorySlug: 'christianity',
    summary: '保罗写给罗马教会的书信，16章，系统阐述"因信称义"的福音核心，被称为"基督教神学大教堂"。',
    significance: '马丁·路德读此书发起宗教改革，奥古斯丁、加尔文、卫斯理皆因此书经历属灵突破。',
    difficulty: 4, oxStageMin: 3, oxStageMax: 8, readingMins: 50,
    tags: ['保罗', '因信称义', '福音', '新约'], sortOrder: 10,
    relatedSlugs: ['matthew-gospel', 'john-gospel'],
    chapters: [
      {
        chapterNo: 1, title: '因信称义', subtitle: '罗马书 1:16-17',
        originalText: '我不以福音为耻；这福音本是神的大能，要救一切相信的，先是犹太人，后是希腊人。因为神的义正在这福音上显明出来；这义是本于信，以至于信。如经上所记："义人必因信得生。"\n\n（罗马书3:23-24）因为世人都犯了罪，亏缺了神的荣耀；如今却蒙神的恩典，因基督耶稣的救赎，就白白地称义。',
        commentary: '因信称义 — 基督教核心教义。不靠行为，全凭信心与恩典。',
        keyQuotes: [
          { quote: '义人必因信得生', explanation: '得救不靠你做了多少"好事"，而靠你是否真的相信和信靠。' },
          { quote: '世人都犯了罪，亏缺了神的荣耀', explanation: '承认自己的不完美是一切成长的起点。企业家的自我接纳。' },
        ],
        practiceHint: '列出你过去一年的3个"失败"。不是去修正它们，而是去接纳它们。接纳是改变的前提。',
      },
      {
        chapterNo: 2, title: '效法基督的样式', subtitle: '罗马书 12:1-2',
        originalText: '所以弟兄们，我以神的慈悲劝你们，将身体献上，当作活祭，是圣洁的，是神所喜悦的；你们如此事奉乃是理所当然的。不要效法这个世界，只要心意更新而变化，叫你们察验何为神的善良、纯全、可喜悦的旨意。\n\n（罗马书12:10-12）爱弟兄，要彼此亲热；恭敬人，要彼此推让。殷勤不可懒惰。要心里火热，常常服事主。在指望中要喜乐，在患难中要忍耐，祷告要恒切。',
        commentary: '第12章是保罗对基督徒日常生活的具体指引 — 从神学转向实践。',
        keyQuotes: [
          { quote: '不要效法这个世界，只要心意更新而变化', explanation: '真正的改变从内心开始。外在模仿不如内在更新。' },
          { quote: '在指望中要喜乐，在患难中要忍耐', explanation: '顺境中保持希望，逆境中保持忍耐 — 这是完整的心理韧性。' },
        ],
        practiceHint: '今天练习"心意更新"的一个小动作 — 当你想批评别人时，改为赞美。一天就好。',
      },
      {
        chapterNo: 3, title: '得胜有余', subtitle: '罗马书 8:28-39',
        originalText: '我们晓得万事都互相效力，叫爱神的人得益处，就是按他旨意被召的人。\n\n谁能使我们与基督的爱隔绝呢？难道是患难吗？是困苦吗？是逼迫吗？是饥饿吗？是赤身露体吗？是危险吗？是刀剑吗？\n\n然而，靠着爱我们的主，在这一切的事上已经得胜有余了。因为我深信：无论是死，是生，是天使，是掌权的，是有能的，是现在的事，是将来的事，是高处的，是低处的，是别的受造之物，都不能叫我们与神的爱隔绝。',
        commentary: '罗马书8章被称为"基督徒的得胜篇" — 无论何种境况，神的爱永不离开。',
        keyQuotes: [
          { quote: '万事都互相效力，叫爱神的人得益处', explanation: '最难的事最后都会成为你的祝福 — 如果你有爱与信心。' },
          { quote: '得胜有余', explanation: '不是勉强得胜，而是绰绰有余。这是真正的内在力量。' },
        ],
        practiceHint: '回想你一年前的一个困境。它今天变成了什么？很可能成了你的财富。记住这个模式。',
      },
    ],
  },
  {
    slug: 'confessions-augustine', title: '忏悔录', titleEn: 'Confessions',
    author: '奥古斯丁', era: '公元397-400年', ring: 3, categorySlug: 'christianity',
    summary: '西方第一部自传体灵修著作，奥古斯丁向神剖白自己前半生的堕落与悔改，哲学与祷告交织。',
    significance: '开创西方自传文学传统，影响从中世纪到现代的无数思想家。蒋勋、托尔斯泰、维特根斯坦皆受其感染。',
    difficulty: 4, oxStageMin: 4, oxStageMax: 9, readingMins: 60,
    tags: ['奥古斯丁', '忏悔', '灵修', '自传'], sortOrder: 11,
    relatedSlugs: ['romans-epistle'],
    chapters: [
      {
        chapterNo: 1, title: '心灵的不安', subtitle: '你为自己造了我们',
        originalText: '伟大啊，主，极其可赞美的！你能力广大，你智慧无穷。人，这一小部分你所造之物，心灵想歌颂你；是人，负着自己必死的命运，自身带着罪恶的证据，带着"你抗拒骄者"的证据，然而人，你的受造物，还是渴望歌颂你。\n\n是你激发他，让他以歌颂你为乐，因为你为自己造了我们，我们的心若非安息于你，便不得安宁。',
        commentary: '《忏悔录》最著名的开篇 — 揭示人心深处的神圣不安。',
        keyQuotes: [
          { quote: '你为自己造了我们，我们的心若非安息于你，便不得安宁', explanation: '人心的躁动源于生命意义的缺失。无论多成功，找不到终极意义就会焦虑。' },
          { quote: '负着自己必死的命运，自身带着罪恶的证据', explanation: '承认人性的局限是智慧的开始。' },
        ],
        practiceHint: '今晚安静10分钟问自己："我的心真正安息在哪里？"如果是工作/财富/名声，那就是你焦虑的根源。',
      },
      {
        chapterNo: 2, title: '青年的迷失', subtitle: '我爱爱的感觉',
        originalText: '我来到迦太基，锅中情欲的熬煎在我四周响起。我还没有爱上谁，但我渴望爱；出于更深的渴望，我恨自己渴望得还不够。我追寻爱的对象，我爱爱，我恨安宁，恨一条没有陷阱的路。\n\n我里面没有食粮的饥渴，不是对你(上帝)的饥渴，而是因为我得到了你而不觉察。我本应当满足于你，却在这些受造物中寻找，在卑劣的爱中寻找安慰，结果陷入更深的忧愁。',
        commentary: '奥古斯丁剖析青年时代的欲望迷失 — "爱爱"而非真爱的空虚。',
        keyQuotes: [
          { quote: '我爱爱的感觉', explanation: '很多人追求的不是真正的某个人/某件事，而是那种感觉。企业家警惕"爱成功的感觉"而非真的热爱事业。' },
          { quote: '我里面没有食粮的饥渴', explanation: '真正的饥渴是灵魂的饥渴，物质无法满足。' },
        ],
        practiceHint: '问自己：你现在追求的东西，是你真正想要的，还是你想要"拥有它的感觉"？诚实面对这个区别。',
      },
    ],
  },
  {
    slug: 'imitation-christ', title: '效法基督', titleEn: 'The Imitation of Christ',
    author: '托马斯·肯培(Thomas à Kempis)', era: '约1418-1427年', ring: 3, categorySlug: 'christianity',
    summary: '中世纪灵修巨著，4卷114章，教人如何在日常生活中效法基督的谦卑、忍耐与爱。',
    significance: '仅次于圣经本身的基督教最广传书籍，译成50多种语言。甘地、希尔德加德都推崇备至。',
    difficulty: 3, oxStageMin: 2, oxStageMax: 9, readingMins: 40,
    tags: ['肯培', '灵修', '谦卑', '中世纪'], sortOrder: 12,
    relatedSlugs: ['confessions-augustine', 'romans-epistle'],
    chapters: [
      {
        chapterNo: 1, title: '效法基督', subtitle: '轻看世上的虚荣',
        originalText: '主说："跟从我的，就不在黑暗里走。"这是基督的话，他劝勉我们效法他的生活和品行，如果我们真想得真光照亮，并脱离内心的盲目。\n\n所以，我们最要紧的事，就是默想耶稣基督的生平。\n\n基督的教训超越圣贤的一切教训，人若有他的精神，就能在其中找到藏着的吗哪。可是许多人虽常听福音，却不觉向往，因为他们没有基督的心。',
        commentary: '开卷第一句即点明全书宗旨 — 效法不是模仿外在行为，而是获得内在精神。',
        keyQuotes: [
          { quote: '跟从我的，就不在黑暗里走', explanation: '找到一个精神榜样，跟从他 — 这是最快走出迷茫的方法。' },
          { quote: '许多人虽常听福音，却不觉向往', explanation: '知道很多道理却不践行的人 — 症结在"心"不在"脑"。' },
        ],
        practiceHint: '选一个你最敬仰的人(历史或当代)，本周每天10分钟阅读他的传记/著作。让他的精神渗透你。',
      },
      {
        chapterNo: 2, title: '谦虚自省', subtitle: '不要自以为是',
        originalText: '人都有求知的欲望，但知识没有对神的敬畏，有什么益处呢？谦卑的农夫事奉神，远胜过骄傲的哲学家研究天体的运行而忽略了自己。\n\n凡真正认识自己的人，必轻看自己，也不喜悦别人的称赞。即使我通晓世上一切学问，若没有爱，在神面前有何益处呢？神是按我们的作为审判我们，不是按我们的学问。\n\n停止一切过分的求知欲望，因为其中有分心和错谬。',
        commentary: '对学问的深刻反思 — 没有爱和谦卑的知识是虚空。',
        keyQuotes: [
          { quote: '谦卑的农夫事奉神，远胜过骄傲的哲学家', explanation: '做一件事的态度比知识更重要。谦卑者终成大器，骄傲者终致失败。' },
          { quote: '凡真正认识自己的人，必轻看自己', explanation: '真正的自信不是高看自己，而是看清自己后仍然接纳自己。' },
        ],
        practiceHint: '列出你引以为傲的3件成就。每件后面写一句："这其中有多少是别人的功劳？"保持谦卑。',
      },
    ],
  },

  // ─── HINDUISM +3 ─────────────────────────────────
  {
    slug: 'gitanjali', title: '吉檀迦利', titleEn: 'Gitanjali (Song Offerings)',
    author: '泰戈尔(Rabindranath Tagore)', era: '1910年', ring: 3, categorySlug: 'hinduism',
    summary: '泰戈尔自译英文诗集，103首献给神的抒情诗。1913年获诺贝尔文学奖，是印度近代灵修诗的最高峰。',
    significance: '让西方第一次领略印度灵性的美。叶芝为英译本作序，纪德译为法文，冰心译为中文。',
    difficulty: 2, oxStageMin: 2, oxStageMax: 10, readingMins: 40,
    tags: ['泰戈尔', '诗歌', '虔信', '奉献'], sortOrder: 10,
    relatedSlugs: ['bhagavad-gita', 'upanishad'],
    chapters: [
      {
        chapterNo: 1, title: '生命之流', subtitle: '第一首·无尽的生命',
        originalText: '你已经使我永生，这样做是你的快乐。这脆薄的杯儿，你不断地把它倒空，又不断地以新生命来充满。\n\n这小小的苇笛，你携带着它翻山越岭，从笛管里吹出永新的音乐。\n\n在你双手的不朽的按抚下，我的小小的心，消融在无边快乐之中，发出不可言说的词调。\n\n你的无穷的赐予只倾入我这双小小的手里。时代过去了，你还在倾注，而我的手里还有余量可以充满。（第1首）',
        commentary: '开篇即以"杯与笛"的意象 — 生命是神用来演奏的乐器，自我是被神使用的载体。',
        keyQuotes: [
          { quote: '你已经使我永生，这样做是你的快乐', explanation: '你的存在本身就是神圣的馈赠。不必追求证明自己的价值。' },
          { quote: '你的无穷的赐予只倾入我这双小小的手里', explanation: '宇宙的慷慨超越你的想象。放开手接受。' },
        ],
        practiceHint: '今天每遇一件"好事"，停3秒说"谢谢"。晚上数数你说了多少次。这就是感恩的开始。',
      },
      {
        chapterNo: 2, title: '谦卑之歌', subtitle: '第35首·心灵无畏',
        originalText: '在那里，心是无畏的，头也抬得高昂；\n在那里，知识是自由的；\n在那里，世界还没有被狭小的家国的墙隔成片段；\n在那里，话是从真理的深处说出；\n在那里，不懈的努力向着"完美"伸臂；\n在那里，理智的清泉没有沉没在积习的荒漠之中；\n在那里，心灵是受你的指引，走向那不断放宽的思想与行为——\n进入那自由的天国，我的父呵，让我的国家觉醒起来吧。（第35首）',
        commentary: '泰戈尔最著名的政治灵修诗 — 个人觉醒与国家觉醒的统一。',
        keyQuotes: [
          { quote: '心是无畏的，头也抬得高昂', explanation: '真正的精神自由 — 不怕真理、不怕权威、不怕改变。' },
          { quote: '不懈的努力向着"完美"伸臂', explanation: '追求完美本身就是神圣。不是达到，而是不断伸臂。' },
        ],
        practiceHint: '今天做一件让自己"无畏"的事 — 说一句真话、拒绝一次不合理的要求、承认一个错误。',
      },
      {
        chapterNo: 3, title: '归宿之诗', subtitle: '第103首·告别',
        originalText: '在我向你合十膜拜之中，我的上帝，让我一切的感知都舒展在你的脚下，接触这个世界。\n\n像七月的湿云，带着未落的雨点沉沉下垂，在我向你合十膜拜之中，让我的全副心灵在你的门前俯伏。\n\n让我所有的诗歌，聚集起它们的不同的调子，成为一股洪流，倾注入静寂的大海，在我向你合十膜拜之中。\n\n像一群思乡的鹤鸟，日夜飞向他们的山巢，在我向你合十膜拜之中，让我全部的生命，启程回到它永久的家乡。（第103首·全诗终章）',
        commentary: '吉檀迦利的终章 — 生命是一场回归，一切努力都是为了最后的"归家"。',
        keyQuotes: [
          { quote: '让我全部的生命，启程回到它永久的家乡', explanation: '每个人内心都知道"永久的家乡"在哪里 — 不是某个地方，而是某种状态。' },
          { quote: '像一群思乡的鹤鸟，日夜飞向他们的山巢', explanation: '伟大的事业都有归属感。没有归属感的成功是漂泊。' },
        ],
        practiceHint: '写下你生命最终想"归向"的状态 — 不是目标，是你希望60岁后每天醒来的感觉。让这个"归宿"指引你今天的决定。',
      },
    ],
  },
  {
    slug: 'ramakrishna-gospel', title: '罗摩克里希那福音', titleEn: 'Gospel of Ramakrishna',
    author: '摩亨陀罗·笈多(记录)', era: '1882-1886年', ring: 3, categorySlug: 'hinduism',
    summary: '印度圣者罗摩克里希那的言行录，由弟子"M"忠实记录5年间的对话。印度教现代复兴运动的源头。',
    significance: '罗摩克里希那通过自身实践证明所有宗教通向同一真理 — 其弟子辨喜把印度精神带向西方。',
    difficulty: 3, oxStageMin: 3, oxStageMax: 10, readingMins: 50,
    tags: ['罗摩克里希那', '辨喜', '普世宗教', '虔信'], sortOrder: 11,
    relatedSlugs: ['bhagavad-gita', 'upanishad'],
    chapters: [
      {
        chapterNo: 1, title: '神是实有', subtitle: '经验神而非谈论神',
        originalText: '罗摩克里希那说："神确实存在。你不见他是因为你的内心不纯净。一个患黄疸病的人看一切都是黄色的。同样，被欲望和贪婪蒙蔽的心灵看不到神。"\n\n"许多人谈论经书，但很少有人过经书描述的生活。就像鹦鹉可以整天诵经，但鹦鹉从未真正走上灵修之路。"\n\n"神是什么？神就是大海，我们都是从大海里打上来的水。冰是水，蒸汽也是水，形式不同本质相同。同样，不同宗教的神其实都是同一个神。"',
        commentary: '罗摩克里希那用最朴素的比喻讲最深的道理 — 神的体验不在知识而在生活。',
        keyQuotes: [
          { quote: '许多人谈论经书，但很少有人过经书描述的生活', explanation: '知道的人多，做到的人少。区别在于是否真正想要。' },
          { quote: '不同宗教的神其实都是同一个神', explanation: '罗摩克里希那亲自修行过印度教、伊斯兰教、基督教，都获得相同的神圣体验。这是普世精神。' },
        ],
        practiceHint: '选一个你不熟悉的宗教(非你出生的信仰)，本周读一篇它的核心经典。你会发现它在说同样的话。',
      },
      {
        chapterNo: 2, title: '货币与泥土', subtitle: '放下才能得到',
        originalText: '罗摩克里希那说："人啊，只要还把货币和泥土看作两样东西，你就没有见到真理。"\n\n门徒问："那我们就不工作不赚钱了吗？"师父笑说："你仍然要赚，但你要像保姆带孩子一样 — 尽心尽力照顾，却知道这孩子不是你的。家庭和财富都是神托付给你的，尽职但不执着。"\n\n"在莲叶上洒水 — 水不会粘在叶上。在世间生活也应如此 — 做事却不被事物粘住。这就是智慧。"',
        commentary: '罗摩克里希那给在家修行者的核心指导 — 尽责而不执着。',
        keyQuotes: [
          { quote: '把货币和泥土看作两样东西，你就没有见到真理', explanation: '真正的修行者对财富没有特别的情绪。它只是另一种物质，不带来也不带走快乐。' },
          { quote: '像保姆带孩子一样 — 尽心尽力照顾，却知道这孩子不是你的', explanation: '对企业的最佳心态 — 全力投入但不占有。这种人创造的事业最大。' },
        ],
        practiceHint: '今天处理你最大的一笔钱/最重要的一个项目时，提醒自己："这不是我的，我只是管理者。"观察心态的变化。',
      },
    ],
  },
  {
    slug: 'viveka-chudamani', title: '辨别宝鬘', titleEn: 'Viveka Chudamani',
    author: '商羯罗(Adi Shankara)', era: '约公元788-820年', ring: 3, categorySlug: 'hinduism',
    summary: '不二吠檀多大师商羯罗的代表作，580节诗偈。系统讲解辨别真我与非我的智慧之路。',
    significance: '不二论(Advaita Vedanta)的巅峰之作，被誉为"吠檀多皇冠上的宝石"。',
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 55,
    tags: ['商羯罗', '不二论', '辨别', '真我'], sortOrder: 12,
    relatedSlugs: ['vedanta-sutra', 'upanishad'],
    chapters: [
      {
        chapterNo: 1, title: '辨别真我', subtitle: '我非身体',
        originalText: '商羯罗说："对解脱来说，有三件稀有而珍贵的事，都是神的恩典：(1)得生为人，(2)渴望解脱，(3)与圣者相遇。"\n\n"身体是由物质元素构成的，随生死聚散。但真我超越身体，永恒不变，是纯粹的觉知。"\n\n"我不是身体，不是感官，不是心意，不是智性。我是永恒的觉知，纯粹的存在，无限的喜悦。这就是真我。"',
        commentary: '不二吠檀多的核心命题 — "我"不是身体心智的聚合，而是背后永恒的觉知本身。',
        keyQuotes: [
          { quote: '我不是身体，不是感官，不是心意，不是智性', explanation: '一切你能观察到的都不是你。真正的"你"是那个在观察的觉知。' },
          { quote: '得生为人，渴望解脱，与圣者相遇 — 三件稀有而珍贵的事', explanation: '成为人本身就是罕见的机会。不要浪费这一世。' },
        ],
        practiceHint: '每天睡前问："今天有什么观察，真正的观察者是谁？"不求答案，就问。这是最高的修行。',
      },
      {
        chapterNo: 2, title: '解脱之道', subtitle: '知识即解脱',
        originalText: '商羯罗说："绳子被误认为蛇时，人会害怕。真相大白后，恐惧立刻消失。同样，把肉体当成真我时，人陷入生死苦海。知道真我后，苦就结束了。"\n\n"解脱不是某种新获得的东西，而是发现你本来就是自由的。束缚只是错觉，解除这个错觉就是全部的修行。"\n\n"真知不能通过听讲和阅读获得，必须通过亲身体验。像尝到糖的甜，不是听别人说。"',
        commentary: '不二论的解脱观 — 解脱不是成就，而是发现你一直都是自由的。',
        keyQuotes: [
          { quote: '解脱不是某种新获得的东西，而是发现你本来就是自由的', explanation: '最深的喜悦不是得到新东西，而是认出你本来拥有的。' },
          { quote: '真知不能通过听讲和阅读获得，必须通过亲身体验', explanation: '读再多书不如实修一日。企业家听再多课不如做一次决定。' },
        ],
        practiceHint: '问自己："我现在感到不自由的是什么？"然后问："这个不自由是事实还是观念？"区分即是解脱的开始。',
      },
    ],
  },
];

// ============================================================
// EXECUTION
// ============================================================

async function main() {
  console.log('📜 M38.3 经论++ v3 — 道儒耶印四大传统深化...');

  // Part 1: Patch chapters on existing scriptures
  console.log('  补充已有经论章节...');
  let patchedScriptures = 0;
  let addedChapters = 0;

  for (const [slug, chapters] of Object.entries(CHAPTER_PATCHES)) {
    const scripture = await prisma.scripture.findUnique({ where: { slug } });
    if (!scripture) {
      console.warn(`  ⚠️  slug 不存在: ${slug}`);
      continue;
    }
    for (const ch of chapters) {
      await prisma.scriptureChapter.upsert({
        where: { scriptureId_chapterNo: { scriptureId: scripture.id, chapterNo: ch.chapterNo } },
        create: {
          scriptureId: scripture.id,
          chapterNo: ch.chapterNo,
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          keyQuotes: ch.keyQuotes ?? [],
          practiceHint: ch.practiceHint,
        },
        update: {
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          keyQuotes: ch.keyQuotes ?? [],
          practiceHint: ch.practiceHint,
        },
      });
      addedChapters++;
    }
    const count = await prisma.scriptureChapter.count({ where: { scriptureId: scripture.id } });
    await prisma.scripture.update({ where: { id: scripture.id }, data: { chapterCount: count } });
    patchedScriptures++;
  }
  console.log(`  ✓ ${patchedScriptures} 经论补充了 ${addedChapters} 章节`);

  // Part 2: Create new scriptures
  console.log('  新增经论...');
  let newScriptures = 0;
  let newChapters = 0;

  for (const def of NEW_SCRIPTURES) {
    const existing = await prisma.scripture.findUnique({ where: { slug: def.slug } });
    if (existing) {
      console.log(`  ⏭  已存在: ${def.slug}`);
      continue;
    }
    const category = await prisma.scriptureCategory.findUnique({ where: { slug: def.categorySlug } });
    if (!category) {
      console.warn(`  ⚠️  category 不存在: ${def.categorySlug}`);
      continue;
    }
    const scripture = await prisma.scripture.create({
      data: {
        slug: def.slug,
        title: def.title,
        titleEn: def.titleEn,
        author: def.author,
        era: def.era,
        ring: def.ring,
        categoryId: category.id,
        tradition: category.tradition,
        summary: def.summary,
        significance: def.significance,
        difficulty: def.difficulty,
        oxStageMin: def.oxStageMin,
        oxStageMax: def.oxStageMax,
        readingMins: def.readingMins,
        tags: def.tags,
        chapterCount: def.chapters.length,
        sortOrder: def.sortOrder,
        relatedIds: [],
      },
    });
    for (const ch of def.chapters) {
      await prisma.scriptureChapter.create({
        data: {
          scriptureId: scripture.id,
          chapterNo: ch.chapterNo,
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          keyQuotes: ch.keyQuotes ?? [],
          practiceHint: ch.practiceHint,
        },
      });
      newChapters++;
    }
    newScriptures++;
  }
  console.log(`  ✓ ${newScriptures} 新经论, ${newChapters} 新章节`);

  // Part 3: Rebuild relatedIds for new scriptures
  console.log('  填充新经论关联...');
  let relatedCount = 0;
  for (const def of NEW_SCRIPTURES) {
    if (!def.relatedSlugs?.length) continue;
    const scripture = await prisma.scripture.findUnique({ where: { slug: def.slug } });
    if (!scripture) continue;
    const related = await prisma.scripture.findMany({
      where: { slug: { in: def.relatedSlugs } },
      select: { id: true },
    });
    await prisma.scripture.update({
      where: { id: scripture.id },
      data: { relatedIds: related.map((r) => r.id) },
    });
    relatedCount++;
  }
  console.log(`  ✓ ${relatedCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log('\n📜 M38.3 完成！');
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
