/**
 * M38.12 经论++ v12 — 精修模式第二轮：10 部跨传统新经论
 * 触发: 经论++ 循环精修 (2026-04-11)
 *
 * 本轮(10部, 198 → 208):
 *   - BUDDHISM +2 (大智度论 / 六妙法门)
 *   - ZEN +2 (永嘉集 / 憨山德清语录)
 *   - TAOISM +2 (真诰 / 度人经)
 *   - CONFUCIANISM +2 (世说新语 / 孔子家语)
 *   - CHRISTIANITY +1 (公祷书)
 *   - HINDUISM +1 (梨俱吠陀选颂)
 *
 * 执行: npx tsx prisma/seed-scriptures-v12.ts
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
    slug: "dazhidu-lun", title: "大智度论", titleEn: "Treatise on the Great Perfection of Wisdom",
    author: "龙树菩萨 鸠摩罗什译", era: "2-3 世纪(汉译 402-406)",
    ring: 2, categorySlug: "buddhist-general",
    summary: "龙树菩萨对《大品般若经》的百科全书式注释，汉传佛教最重要的论典之一。100 卷体量，详尽阐发般若空观与菩萨六度行持，是学习大乘佛教的必读论典。",
    significance: "《大智度论》是\"八宗共祖\"龙树的代表作，汉传天台、华严、三论、禅宗等诸宗皆奉为圭臬。其\"三智\"（一切智、道种智、一切种智）分类影响了整个东亚佛教哲学。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 55,
    tags: ["龙树", "般若", "六度", "百科"], sortOrder: 37,
    relatedSlugs: ["zhong-lun", "diamond-sutra", "heart-sutra"],
    chapters: [
      {
        chapterNo: 1, title: "布施波罗蜜",
        originalText: "《大智度论·释檀波罗蜜》卷十一：\"檀（dāna，布施）名舍，施之与舍同。复次，檀名施，施为福之根本，善之先导。\n\n施有三种：一者财施，二者法施，三者无畏施。财施为下，法施为中，无畏施为上。\n\n施者应具三轮体空：能施者、所施者、所施物，三者皆空。如是施时，功德无量，不取相故。\"",
        commentary: "龙树把布施分三等，最上是\"无畏施\" — 让他人不再恐惧。这对企业家意义重大：你能给团队的最珍贵礼物不是钱、不是培训，而是让他们在你面前不恐惧犯错、不恐惧说真话。\"三轮体空\"更高一层 — 不要因为布施而觉得自己了不起。",
        practiceHint: "今天做一次\"无畏施\"：找一个你知道很怕你的下属，认真告诉他\"在我面前你可以犯错，我不会因此责怪你\"。观察他的反应，你会感到某种能量在流动。",
      },
      {
        chapterNo: 2, title: "禅定波罗蜜",
        originalText: "《大智度论·释禅波罗蜜》：\"禅名思惟修，如说禅那秦言思惟修。诸佛菩萨初发意时，为度众生故修禅定。\n\n禅定者，摄乱心故；摄乱心故见实相；见实相故得大智慧。\n\n世间有五欲：色、声、香、味、触。禅定者厌离五欲，如病除药。非厌离一切事，而是厌离贪著之心。\"",
        commentary: "龙树澄清了一个误解：禅定不是离开生活，而是离开对生活的\"贪著之心\"。你可以继续开会、谈判、决策，但不再被这些事粘住。这对现代人是最重要的澄清 — 你不必出家才能修定，你只需要对日常的得失不再贪执。",
        practiceHint: "做决策时练习\"厌离贪著\"：问自己\"如果这个结果不符合我的期望，我能接受吗？\"能接受，就做决策。不能接受，说明你还在贪著，先调息 3 分钟再定。",
      },
    ],
  },
  {
    slug: "liumiaomen", title: "六妙法门", titleEn: "Six Wondrous Dharma Gates",
    author: "智顗大师", era: "隋(6 世纪)",
    ring: 2, categorySlug: "buddhist-tiantai",
    summary: "天台智者大师专讲数息、随息、止、观、还、净六种入定门径的修学指南。是中国佛教最清晰的禅修入门手册，对日本与现代正念运动皆影响深远。",
    significance: "《六妙法门》把印度繁复的禅定次第浓缩为六个清晰可操作的步骤，使禅修从\"精英密法\"变成\"普通人也能修\"的方法。日本白隐禅师对此推崇备至。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 8, readingMins: 30,
    tags: ["智顗", "天台", "数息", "六门"], sortOrder: 38,
    relatedSlugs: ["mohe-zhiguan", "zhiyi-mohe-zhiguan"],
    chapters: [
      {
        chapterNo: 1, title: "数息 — 第一门",
        originalText: "智顗《六妙法门》：\"数息者，行者调和气息，不涩不滑，安详徐数，从一至十，摄心在数，不令驰散。若心驰散，复还从一数起，终而复始。\n\n若数至十不乱，则息相渐细，心渐安定。此名第一数息门。\n\n初修者应先从此门入，勿好高骛远直修观慧。数息是止观之基，无此基，观慧皆虚。\"",
        commentary: "智者大师把整个禅修的入门简化成\"数呼吸从一到十\"，如此简单却如此有效。现代人最大的问题是\"好高骛远\" — 还没学会数息就想直接开悟。数息是地基，没有这个地基，所有高阶修法都是空中楼阁。",
        practiceHint: "今晚睡前 10 分钟做数息：安静坐着，呼气时心中数\"一\"，再呼数\"二\"…到十再从一开始。中间走神立刻从一重新开始。坚持 21 天。",
      },
      {
        chapterNo: 2, title: "随息与止",
        originalText: "智顗续云：\"数息既熟，觉数为粗，意不欲数。尔时行者应当放数修随。随者：随息出入，随其长短，心息相依。\n\n随息既久，复觉随为粗，不愿复随。尔时心自然安静不散，此名为止。\n\n止者心如止水，不摇不动。于此境中，观慧自生 — 见身空、见心空、见万法空。\"",
        commentary: "数息→随息→止→观→还→净，这是一条清晰的上行路。每一级都是前一级的自然升华，不必强求。现代企业家最缺的就是这个\"渐次\"耐心 — 总想一步到位。智者告诉你：放下功利心，按部就班，反而最快。",
        practiceHint: "接续数息练习：数息熟练（能数到十不乱）后，放下数字，只是\"随\"着呼吸进出。不强求任何境界，观察自然发生的安静。",
      },
    ],
  },
  {
    slug: "yongjia-ji", title: "永嘉集", titleEn: "Collection of Yongjia",
    author: "永嘉玄觉", era: "唐(665-713)",
    ring: 1, categorySlug: "zen-core",
    summary: "六祖惠能弟子永嘉玄觉的禅修理论集，共十篇。以\"一宿觉\"著称的永嘉将天台止观与禅宗顿悟融合，形成完整的禅修理论。与其《证道歌》并为永嘉禅法双璧。",
    significance: "永嘉玄觉是南宗禅史上极为特殊的人物 — 本是天台宗修学者，一夜参六祖而得印可，成为\"教禅一致\"的典范。《永嘉集》对研究中国禅宗理论化的过程至关重要。",
    difficulty: 4, oxStageMin: 4, oxStageMax: 9, readingMins: 35,
    tags: ["永嘉玄觉", "一宿觉", "教禅一致"], sortOrder: 39,
    relatedSlugs: ["zhengdao-ge", "platform-sutra"],
    chapters: [
      {
        chapterNo: 1, title: "奢摩他颂 — 定之要",
        originalText: "《永嘉集·奢摩他颂》：\"恰恰用心时，恰恰无心用。无心恰恰用，常用恰恰无。\n\n心本无事，无事本心。当处发生，随处灭尽。\n\n念起即觉，觉之即无。久久纯熟，心自无念。无念即真，真即一切。\"",
        commentary: "\"恰恰用心时，恰恰无心用\"八字，道尽禅定的精髓。不是让心空空如也，而是\"用着用着就不觉得在用\"。这对企业家的启示是：最高的专注不是紧绷的用力，而是松而不散、用而无用的状态 — 心流（flow）的东方表达。",
        practiceHint: "下次做一件你擅长的事（写作/设计/编码），不要设定\"要做出好成果\"的目标，只是让手自己动。事后你会发现结果反而更好。这就是\"恰恰无心用\"。",
      },
      {
        chapterNo: 2, title: "毗婆舍那颂 — 观之要",
        originalText: "《永嘉集·毗婆舍那颂》：\"观有三：一者观身不净，二者观受是苦，三者观心无常、观法无我。\n\n然顿悟禅者，不循次第。但观一念之起 — 起时无来处，灭时无去处。来去皆空，即是实相。\n\n实相非有非无，非生非灭。知此一念即知一切念，知一念空即知万法空。\"",
        commentary: "永嘉玄觉把天台的次第观整合进禅宗的顿悟观 — 不必按部就班观身观受观心观法，直接在\"一念之起\"上见实相。这是禅宗最直接的入处。对企业家：不必等修完全套课程，就在当下这一念焦虑/喜悦/愤怒上直接观察，当下即道场。",
        practiceHint: "下次强烈情绪来时立刻问：\"这一念从哪里来？\"观察 10 秒，你会发现它\"无来处\"。再问：\"它去哪里？\"观察 10 秒，它又\"无去处\"。反复几次，情绪自动消散。",
      },
    ],
  },
  {
    slug: "hanshan-yulu", title: "憨山德清梦游集", titleEn: "Recorded Sayings of Hanshan Deqing",
    author: "憨山德清", era: "明(1546-1623)",
    ring: 1, categorySlug: "zen-core",
    summary: "明末四大高僧之一憨山德清的语录与文集。憨山主张\"禅教一致、儒释道融通\"，其学问兼通佛教各宗与儒道思想，是晚明佛教复兴的灵魂人物。",
    significance: "憨山德清与紫柏真可、莲池袾宏、蕅益智旭并称\"晚明佛教四大师\"，是明代佛教复兴运动的核心。其融通儒释道的思想对现代东方哲学研究极具启发。",
    difficulty: 4, oxStageMin: 4, oxStageMax: 10, readingMins: 40,
    tags: ["憨山", "晚明", "融通三教"], sortOrder: 40,
    relatedSlugs: ["platform-sutra", "chuanxi-lu"],
    chapters: [
      {
        chapterNo: 1, title: "禅教一致",
        originalText: "憨山《梦游集》云：\"禅者佛之心，教者佛之口。禅与教原是一物，离禅无教，离教无禅。\n\n今人不知，以禅教分家，动则互相讥诮 — 学教者谓禅为暗证，参禅者谓教为文字。岂知佛口所说即佛心所证，佛心所证即佛口所说？\n\n修行之道，应当教禅兼修：依教以明理，依禅以证悟。如车两轮，缺一不可。\"",
        commentary: "憨山的\"禅教一致\"观对今天的\"实修派 vs 学理派\"之争仍有极强现实意义。很多人要么只爱读书不打坐，要么只打坐不读书，结果都是偏的。憨山告诉我们：理论与实修是车之两轮 — 只有一个轮子的车不能走。",
        practiceHint: "检查你的修行：你今年读了几本经典？你今年打了几天坐？两者差距如果超过 10:1，你就偏了。今天就把少的那一边补一点。",
      },
      {
        chapterNo: 2, title: "儒释道融通",
        originalText: "憨山又云：\"为学有三要：所谓不知《春秋》，不能涉世；不精《老庄》，不能忘世；不参禅，不能出世。此三者，阙一不可。\n\n儒者教人治世，道者教人忘世，佛者教人出世。然其归一 — 皆欲令人离执著、得解脱。\n\n故真修行者，儒释道三家皆应参学，不可偏执一家。\"",
        commentary: "憨山这段话是中国思想史上最清晰的\"三教定位\"：儒家帮你\"涉世\"、道家帮你\"忘世\"、佛家帮你\"出世\"。三者不矛盾，反而是人生三阶段。对企业家而言：年轻时学儒家做事、中年学道家减负、成熟时学佛家超越。",
        practiceHint: "这周各读一点儒释道经典（《论语》几章 + 《道德经》几章 + 《金刚经》几段），感受三种不同的\"心境频率\"。你会发现自己缺的正是其中一种。",
      },
    ],
  },
  {
    slug: "zhengao", title: "真诰", titleEn: "Declarations of the Perfected",
    author: "陶弘景", era: "南朝梁(约 500 年)",
    ring: 3, categorySlug: "taoism",
    summary: "道教上清派宗师陶弘景整理编纂的仙真降诰记录。共 20 卷，记载东晋杨羲、许谧等人所受神真降授内容，是研究六朝上清派最重要的文献。",
    significance: "陶弘景\"山中宰相\"之称，以《真诰》建立上清派完整的神系与修道体系。此书对日本道教（密教）、朝鲜仙道、乃至宋代内丹派都有深远影响。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 40,
    tags: ["陶弘景", "上清派", "六朝"], sortOrder: 41,
    relatedSlugs: ["daodejing", "huangting-jing"],
    chapters: [
      {
        chapterNo: 1, title: "运象篇 — 存神之法",
        originalText: "《真诰·运象篇》云：\"夫道者，以开心为基，以内观为要。开心者，去除成见；内观者，返照自身。\n\n存神之法：瞑目闭息，存想身中诸神 — 脑神、心神、肝神、脾神、肺神、肾神。如实见其形色，如实闻其音声。\n\n诸神安则身安，身安则道成。道成者，不以外物为贵，不以生死为异。\"",
        commentary: "上清派的\"存神\"法非常独特 — 不是观想外在佛菩萨，而是观想自己身体里的\"神\"。这种\"身即道场\"的思想，与现代心身医学完全相通：当你真正关注自己身体的每一部分，身体自然和谐，决策自然清明。",
        practiceHint: "每天晚上躺下后做一个\"身体扫描\"：从头到脚，逐一问候自己的每一个器官（像问候朋友一样\"心脏你今天辛苦了\"）。5 分钟即可。一周后你会感到与身体的关系更亲密。",
      },
      {
        chapterNo: 2, title: "协昌期 — 道成之相",
        originalText: "《真诰·协昌期》云：\"道之既成，其徵有三：一曰心清，二曰身轻，三曰气和。\n\n心清者，处烦嚣而不乱，临利害而不动；身轻者，行百里而不疲，负重担而不倦；气和者，喜怒不露，悲欢不形。\n\n此三者不可强求，但从日用中默默培养。培养既久，自然水到渠成。\"",
        commentary: "陶弘景这段话描述的\"道成之相\"其实就是现代顶级企业家的精神与身体状态：心清（危机不乱）、身轻（精力充沛）、气和（情绪稳定）。注意\"不可强求\"—— 越想要越得不到，反而在日用中默默培养最有效。",
        practiceHint: "选一个月，只记录自己每日的\"心清身轻气和指数\"（1-10 分），不做任何刻意训练。三个月后回看，你会发现生活作息的微小变化最影响这些指标。",
      },
    ],
  },
  {
    slug: "duren-jing", title: "度人经(灵宝无量度人上品妙经)", titleEn: "Scripture on Salvation",
    author: "灵宝派", era: "东晋末(约 5 世纪)",
    ring: 3, categorySlug: "taoism",
    summary: "道教灵宝派最核心的经典，全称《灵宝无量度人上品妙经》。以\"仙道贵生、无量度人\"为核心理念，首次在道教中明确提出普度众生的大乘思想，对后世道教极具影响。",
    significance: "《度人经》在《道藏》中被列为\"三洞\"之首，地位相当于佛教的《华严经》。其\"齐同慈爱、异骨成亲\"思想体现道教从个体修仙到普度众生的理论飞跃。",
    difficulty: 4, oxStageMin: 5, oxStageMax: 10, readingMins: 30,
    tags: ["灵宝", "度人", "普度"], sortOrder: 42,
    relatedSlugs: ["daodejing", "zhengao"],
    chapters: [
      {
        chapterNo: 1, title: "仙道贵生",
        originalText: "《度人经》云：\"仙道贵生，无量度人。上开八门，飞天神王，长生大圣，无量度人。\n\n不遑启处，常行大慈。救度一切，十方无极。齐同慈爱，异骨成亲。国安民丰，兵革休偃。\n\n欲求长生，先当度人。度人未尽，岂能己先？\"",
        commentary: "\"欲求长生，先当度人\"八字，把道教从个人修仙的\"自私形象\"彻底扭转。你想求自己的圆满？先帮助别人圆满。这与佛教菩萨道殊途同归，是中国宗教中最伟大的精神。对企业家意义重大：你的财富和事业成就，是\"度人\"的工具而非目的。",
        practiceHint: "做一个决策时问：\"这个选择是让更多人受益，还是只让我自己受益？\"让\"度人\"成为你所有决策的底层逻辑。三个月后你会发现，事业反而更兴盛了。",
      },
      {
        chapterNo: 2, title: "齐同慈爱",
        originalText: "《度人经》又云：\"齐同慈爱，异骨成亲。\n\n齐者，平等也；同者，一如也；慈者，与乐也；爱者，护念也。\n\n以平等心对待一切，以一如心观照万物，以慈心予众乐，以爱心护众生。\n\n虽非血亲，视如一家；虽异种族，同为一体。此为度人者之基本心量。\"",
        commentary: "\"异骨成亲\"四字力量惊人：不是你的亲人，视如家人。道教这句话比很多宗教的\"博爱\"更具体 — 不只是爱，还是\"异骨成亲\"的亲密感。对跨国、跨文化的现代企业家：这正是你需要的心量 — 把不同国籍、肤色、信仰的员工和客户，都视为一家。",
        practiceHint: "这周刻意找一个与你完全不同的人（不同信仰、不同国家、不同世代），认真听他讲一个小时。不评判不反驳，只是听。你会感到一种罕见的扩张感。",
      },
    ],
  },
  {
    slug: "shishuo-xinyu", title: "世说新语", titleEn: "A New Account of the Tales of the World",
    author: "刘义庆", era: "南朝宋(约 440 年)",
    ring: 3, categorySlug: "confucianism",
    summary: "南朝刘义庆编撰的笔记体小说，记载东汉末至东晋 200 余年名士言行轶事。分\"德行\"、\"言语\"、\"政事\"、\"文学\"等 36 门。是研究魏晋风度与玄学思想的第一手资料。",
    significance: "《世说新语》展现了\"魏晋风度\" — 中国历史上最潇洒自由的一种人格范式。其影响远超儒家正统，对日本武士道、禅宗文化、乃至现代知识分子气质都有潜移默化的塑造。",
    difficulty: 3, oxStageMin: 3, oxStageMax: 9, readingMins: 30,
    tags: ["魏晋风度", "名士", "清谈"], sortOrder: 43,
    relatedSlugs: ["lunyu", "zhuangzi"],
    chapters: [
      {
        chapterNo: 1, title: "雅量 — 泰山崩于前",
        originalText: "《世说新语·雅量》：\"谢太傅盘桓东山时，与孙兴公诸人泛海戏。风起浪涌，孙、王诸人色并遽，便唱使还。\n\n太傅神情方王，吟啸不言。舟人以公貌闲意说，犹去不止。既风转急，浪猛，诸人皆喧动不坐。\n\n公徐云：\"如此将无归？\"众人即承响而回。于是审其量，足以镇安朝野。\"",
        commentary: "谢安（后来淝水之战挂帅的宰相）在风浪中\"神情方王、吟啸不言\"，这就是魏晋风度最精彩的展现。不是装镇定，而是真心不被外境撼动。对企业家：最大的领导力测试往往在\"风浪突至\"的时刻 — 你脸色一变，团队就乱了；你气定神闲，团队就稳了。",
        practiceHint: "下次遇到突发坏消息（客户跑了/项目黄了/团队吵架），不要立刻反应。深呼吸三次，心里默念\"神情方王，吟啸不言\"，然后再说话。你的决策质量和团队信心都会立刻上升。",
      },
      {
        chapterNo: 2, title: "任诞 — 王子猷雪夜访戴",
        originalText: "《世说新语·任诞》：\"王子猷居山阴，夜大雪，眠觉，开室，命酌酒。四望皎然，因起彷徨，咏左思《招隐》诗。\n\n忽忆戴安道。时戴在剡，即便夜乘小船就之。经宿方至，造门不前而返。\n\n人问其故，王曰：\"吾本乘兴而行，兴尽而返，何必见戴！\"",
        commentary: "\"乘兴而行，兴尽而返\"八字，是整个魏晋风度的精华，也是中国人对\"自由\"最诗意的定义。王子猷夜乘船百里去看朋友，到门口不敲门就回来，因为\"兴已尽\"。对现代企业家：你是否已经被\"必须达成\"的目标绑架，忘了\"乘兴而行\"的自由？",
        practiceHint: "这周选一天做一件\"没有目的\"的事 — 散步但不定路线、读书但不为学习、见朋友但不谈工作。只凭兴致。一天下来你会感到久违的松弛。",
      },
    ],
  },
  {
    slug: "kongzi-jiayu", title: "孔子家语", titleEn: "Family Sayings of Confucius",
    author: "王肃(传)", era: "三国魏(3 世纪)",
    ring: 3, categorySlug: "confucianism",
    summary: "记载孔子言行与弟子问答的儒家经典，共 44 篇。虽历代对其成书年代有争议，但 1973 年定州汉墓竹简出土后证实其核心内容确为先秦所传。是《论语》之外最丰富的孔门言行录。",
    significance: "《孔子家语》的许多记载与《论语》互补，为孔子形象增添了大量细节与生活气息。对研究孔子的教育思想、家庭伦理、与弟子关系都是重要补充。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 8, readingMins: 35,
    tags: ["孔子", "言行", "家语"], sortOrder: 44,
    relatedSlugs: ["lunyu", "daxue", "zhongyong"],
    chapters: [
      {
        chapterNo: 1, title: "五仪解 — 五种人格",
        originalText: "《孔子家语·五仪解》：\"鲁哀公问于孔子曰：\"人有五仪：有庸人，有士，有君子，有贤人，有圣人。审此五者，则治道毕矣。\"\n\n庸人者，心不存慎终之规，口不吐训格之言，不择贤以托其身，不力行以自定。\n\n士者，心有所定，计有所守。虽不能尽道术之本，必有率也；虽不能遍百善之美，必有处也。\n\n君子者，言必忠信，而心不怨；仁义在身，而色不伐；思虑通明，而辞不专。\n\n贤人者，德不逾闲，行中规绳。言足以法于天下，而不伤于身。\n\n圣人者，德合于天地，变通无方，穷万事之终始，协庶品之自然，敷其大道而遂成情性。\"",
        commentary: "孔子把人格划分为五级：庸人→士→君子→贤人→圣人。这是儒家最精细的\"人格阶梯\"。注意每一级的核心差别：庸人没有定见、士有所守、君子表里如一、贤人有影响力不伤己、圣人通达天地。对企业家：你当下在哪一级？下一级的具体要求是什么？",
        practiceHint: "花 30 分钟对照五级自评：你现在是庸人/士/君子/贤人/圣人？下一级的\"核心特质\"是什么？制定一个为期 3 个月的进阶计划。一年升一级，10 年你就是圣人了。",
      },
      {
        chapterNo: 2, title: "在厄 — 君子之困",
        originalText: "《孔子家语·在厄》记孔子与弟子在陈蔡之间绝粮事：\"孔子愀然而叹曰：\"由（子路），君子能修其道，纲而纪之，不必其能容。\n\n今尔不修其道，而求其容。赐（子贡），尔志不广矣。思不远矣。\n\n夫君子博学、深谋不遇时者，众矣。何独丘哉！\n\n且芝兰生于深林，不以无人而不芳；君子修道立德，不谓穷困而改节。\"",
        commentary: "\"芝兰生于深林，不以无人而不芳\" — 这是中国文化最美的道德宣言。兰花长在深山里没人看见，照样开得香。君子也是如此：修道立德不是为了让别人看见，而是本性使然。对企业家：当你所做之事暂时没有回报时，你是继续坚持\"芝兰之香\"，还是改变节操去迎合市场？",
        practiceHint: "写下一件你正在坚持但还没有看到回报的事。问自己：\"如果永远没有人看见我做这件事，我还会坚持吗？\"诚实回答。坚持的本质应当是\"芝兰之香\"，而非等人欣赏。",
      },
    ],
  },
  {
    slug: "book-of-common-prayer", title: "公祷书", titleEn: "The Book of Common Prayer",
    author: "托马斯·克兰麦(Thomas Cranmer)", era: "1549 年首版",
    ring: 3, categorySlug: "christianity",
    summary: "英国圣公会的核心礼仪书，由坎特伯雷大主教克兰麦于宗教改革期间编撰。融合了拉丁天主教礼仪与新教精神，是英语世界最有影响力的礼拜礼仪书。",
    significance: "《公祷书》不仅是教会礼仪书，也是英语文学的里程碑 — 其严谨优美的英语对莎士比亚、弥尔顿乃至现代英语散文都有塑造性影响。至今为全球 8500 万圣公会信徒所用。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 9, readingMins: 25,
    tags: ["圣公会", "克兰麦", "英语礼仪", "公祷"], sortOrder: 45,
    relatedSlugs: ["genesis", "psalms", "john-gospel"],
    chapters: [
      {
        chapterNo: 1, title: "晨祷 — Collect for Peace",
        originalText: "《公祷书·晨祷》和平祷文：\"O God, who art the author of peace and lover of concord, in knowledge of whom standeth our eternal life, whose service is perfect freedom: Defend us thy humble servants in all assaults of our enemies.\n\n中译：\"上帝啊，你是和平的创造者、和谐的爱者。认识你就是我们的永恒生命，侍奉你就是完全的自由。请在一切敌人的攻击中保护我们卑微的仆人。\"\n\n\"whose service is perfect freedom\" — 侍奉即完全自由。此句被誉为克兰麦最伟大的神学表达。\"",
        commentary: "\"侍奉就是完全自由\"（whose service is perfect freedom）是基督教最反直觉却最深刻的一句话。世人以为\"服从\"是被束缚，克兰麦告诉我们：对真正的道服从，就是最大的自由。对企业家：你服从一套真正的价值观（诚实、服务、卓越），反而比被欲望驱使更自由。",
        practiceHint: "花 10 分钟默想这句话\"whose service is perfect freedom\"。问自己：\"我真正在侍奉什么？是自我、金钱、认可，还是一个更高的原则？\"诚实回答你会更清楚自己的不自由所在。",
      },
      {
        chapterNo: 2, title: "悔罪 — General Confession",
        originalText: "《公祷书》通用悔罪文节选：\"Almighty and most merciful Father, We have erred, and strayed from thy ways like lost sheep. We have followed too much the devices and desires of our own hearts.\n\nWe have offended against thy holy laws. We have left undone those things which we ought to have done, And we have done those things which we ought not to have done.\n\nAnd there is no health in us.\"\n\n中译：\"全能至仁之父，我们已经犯错、如迷羊离开你的道路。我们太随心所欲，违背你的圣律。当做的事没有做，不当做的事反做了，我们身上全无健全。\"",
        commentary: "\"当做的事没有做，不当做的事反做了\" — 这是人类最普遍的困境。注意顺序：先说\"当做而未做\"（omission），再说\"不当做而做\"（commission）。克兰麦提醒我们：不作为的罪，和作为的罪一样重。对企业家：你有没有因为怕风险而逃避了该做的正确事情？",
        practiceHint: "今晚写下三件\"当做而没做\"的事（不是\"我很忙\"的借口，而是诚实的逃避）。明天立刻做其中一件。这是最干净的悔罪方式。",
      },
    ],
  },
  {
    slug: "rig-veda-selections", title: "梨俱吠陀选颂", titleEn: "Rigveda Selected Hymns",
    author: "古印度仙人(Rishis)", era: "约前 1500-前 1200 年",
    ring: 3, categorySlug: "hinduism",
    summary: "印度四吠陀中最古老、最重要的一部，共 1028 首颂诗。是印度-雅利安文明最早的宗教文献，也是印欧语系最古老的经典。内容涵盖对自然神的赞美、宇宙起源、生命哲思。",
    significance: "《梨俱吠陀》是印度教万源之源，其\"那萨迪雅颂\"（Nasadiya Sukta）对宇宙起源的诗性追问被称为\"人类宗教哲学的黎明第一缕光\"。对比较宗教学、印欧语言学皆为第一手文献。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 35,
    tags: ["吠陀", "雅利安", "颂诗"], sortOrder: 46,
    relatedSlugs: ["upanishad", "bhagavad-gita"],
    chapters: [
      {
        chapterNo: 1, title: "那萨迪雅颂 — 宇宙创造之谜",
        originalText: "《梨俱吠陀》10.129 那萨迪雅颂：\"nāsad āsīn no sad āsīt tadānīṃ（那时既没有\"无\"也没有\"有\"）\n\n那时，既没有\"非有\"，也没有\"有\"；\n既没有空间，也没有空间之上的苍穹。\n是什么在包裹？在哪里？在谁的庇护下？\n那时，是否有深不可测的、奔腾的水？\n\n那时，既没有死，也没有不死；\n没有昼夜之分。\n那\"一\"因自己的力量而无风自动。\n在它之外，没有任何其他存在。\n\n最初，混沌被黑暗笼罩；\n这一切都是看不见的深渊。\n那被空所覆盖的\"一\"，\n因热力而出生。\n\n谁真知道？谁能在此宣说：\n创造从何而来？何时有此创造？\n诸神是在此创造之后才有的 —\n那么谁知道它从何而起？\n\n这一创造从何而起，\n或是他造了它，或不是；\n唯有他，在最高天监视着它，\n他知道 — 或者，他也不知道。\"",
        commentary: "这是人类哲学最早也最深刻的一次发问：宇宙从哪里来？注意吠陀仙人的诚实 — 最后他说：\"唯有他知道，或者，他也不知道。\" 这种不强行给答案的谦卑，比任何宗教教条都更接近真理。对企业家：面对最深的问题（我是谁？什么是值得的？），允许\"不知道\"，反而是智慧的开始。",
        practiceHint: "找一个安静的夜晚，仰望星空 15 分钟，默念\"谁真知道？\"不要强求答案。体会吠陀仙人那种\"面对无限的谦卑\"，你会感到很多焦虑自然消散。",
      },
      {
        chapterNo: 2, title: "原人歌 — 万物同源",
        originalText: "《梨俱吠陀》10.90 原人歌（Purusha Sukta）选译：\"原人（Purusha）有千头、千眼、千足。\n他遍满整个大地，向各个方向延展。\n\n这一切 — 过去的、现在的、将来的，\n都是原人。\n\n从原人出生一切。从他出生虚空，\n从虚空出生风，从风出生火，\n从火出生水，从水出生地，从地出生草木。\n\n众人同出一源，如河归海。\"",
        commentary: "\"原人\"（Purusha）是吠陀最伟大的隐喻之一 — 整个宇宙不过是一个巨人的身体，每个人每个物都是这个巨人的一部分。这与中国\"天人合一\"、基督教\"身体的肢体\"、佛教\"法界一体\"殊途同归。对企业家：你的员工、客户、竞争对手都是同一\"原人\"的肢体 — 伤害他们就是伤害自己。",
        practiceHint: "做一个\"原人冥想\"：想象自己和所有你认识的人（包括对手）都是同一个巨大身体上的细胞。当你想攻击某人时，问：\"我要攻击自己的哪一部分？\"这是化解一切敌对的最快方法。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.12 经论++ v12 精修第二轮 — 10 部跨传统新经论');

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
        sortOrder: def.sortOrder,
        isPublished: true,
      },
      update: {
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
        sortOrder: def.sortOrder,
      },
    });
    newScriptures++;

    for (const ch of def.chapters) {
      await prisma.scriptureChapter.upsert({
        where: { scriptureId_chapterNo: { scriptureId: scripture.id, chapterNo: ch.chapterNo } },
        create: {
          scriptureId: scripture.id,
          chapterNo: ch.chapterNo,
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          practiceHint: ch.practiceHint,
        },
        update: {
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          practiceHint: ch.practiceHint,
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

  console.log('  填充新经论关联...');
  let relationCount = 0;
  for (const def of NEW_SCRIPTURES) {
    if (!def.relatedSlugs?.length) continue;
    const related = await prisma.scripture.findMany({
      where: { slug: { in: def.relatedSlugs } },
      select: { id: true },
    });
    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { relatedIds: related.map(r => r.id) },
    });
    relationCount++;
  }
  console.log(`  ✓ ${relationCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log(`\n📜 M38.12 精修第二轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => {
    console.error('❌ 失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
