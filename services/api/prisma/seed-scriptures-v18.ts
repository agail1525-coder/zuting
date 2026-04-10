/**
 * M38.18 经论++ v18 — 精修第八轮：10 部原始/古德
 * 本轮(10部, 258 → 268):
 *   BUDDHISM +3 (长老偈 Theragatha / 长老尼偈 Therigatha / 本生经 Jataka)
 *   ZEN +2 (虚堂智愚语录 / 荷泽神会语录)
 *   TAOISM +1 (老子想尔注)
 *   CONFUCIANISM +1 (孝经)
 *   CHRISTIANITY +1 (登山宝训)
 *   HINDUISM +2 (Kabir 卡比尔对句 / Tulsidas 罗摩衍那)
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
    slug: "theragatha", title: "长老偈(Theragatha)", titleEn: "Theragatha — Verses of the Elder Monks",
    author: "佛陀时代 264 位长老比丘", era: "公元前 5-3 世纪",
    ring: 2, categorySlug: "buddhist-general",
    summary: "巴利藏《小部》第八经，收录 264 位佛陀时代长老比丘的 1279 首证悟偈诗。每首偈都是一位修行者证悟之后\"喷涌\"而出的内心表达，充满个人色彩和诗意美感。是研究早期佛教真实修行经验的一手文献。",
    significance: "《长老偈》的价值在于它是\"个人证悟的第一人称记录\"— 不是教义，不是论述，而是修行者们亲自说出的\"我是怎么从痛苦走到自由的\"。其中包括佛陀亲生儿子罗睺罗、佛陀堂弟阿难、以及大迦叶、舍利弗、目犍连等核心弟子。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 10, readingMins: 25,
    tags: ["长老偈", "证悟", "巴利"], sortOrder: 97,
    relatedSlugs: ["dhammapada", "sutta-nipata"],
    chapters: [
      {
        chapterNo: 1, title: "大迦叶的独居之乐",
        originalText: "《长老偈》大迦叶尊者偈：\"从山洞中下来后，我进入城镇乞食。一个麻风病人正在吃饭。\n\n他用腐烂的手给我递来一勺食物。当他把食物放进我的钵里时，他的手指也掉进了钵里。\n\n我靠着石墙，吃完了那一餐 — 不因厌恶而皱眉，不因怜悯而流泪。对我而言，这只是一餐食物，这只是一位供养者。\n\n从此我明白 — 真正的自由，是\"任何场景都无法打扰的平静\"。\n\n我回到山洞。山风吹过，鸟鸣阵阵。没有人打扰我。这就是圆满。没有比这更多的快乐了。\n\n你们以为山洞里很孤独吗？不 — 孤独的是那些住在宫殿里却内心塞满烦恼的人。山洞只为真正自由的人存在。\"",
        commentary: "大迦叶是佛陀弟子中\"头陀行第一\"— 最极端的苦行者。但他的偈诗里没有\"苦\"，只有\"乐\"。这揭示了一个反常识真理：真正的快乐不来自\"获得更多\"，而来自\"不再依赖\"。对现代企业家极其关键：你追求财富自由、时间自由、选择自由 — 但真正的自由是\"不再被任何东西挂住\"的那种心境。外在的自由是暂时的，内在的自由才是永久的。",
        practiceHint: "做一次\"迦叶实验\"：选一天，不做任何\"消费\"的事情（不买东西、不刷社交媒体、不看新闻、不吃外卖）。只做必需的事情，其余时间独处。观察你的内心会有什么反应 — 焦虑、空虚、平静、喜悦？这些反应告诉你你\"依赖\"什么。",
      },
    ],
  },
  {
    slug: "therigatha", title: "长老尼偈(Therigatha)", titleEn: "Therigatha — Verses of the Elder Nuns",
    author: "佛陀时代 73 位长老比丘尼", era: "公元前 5-3 世纪",
    ring: 2, categorySlug: "buddhist-general",
    summary: "巴利藏《小部》第九经，收录 73 位佛陀时代女性修行者（比丘尼）的 522 首证悟偈诗。是世界文学史上最早的\"女性精神自传集\"之一，比基督教女圣徒传记早 1000 多年。其中许多诗篇反映了古印度女性面对的社会压迫，以及她们如何通过修行获得解放。",
    significance: "《长老尼偈》的历史意义极其重大：它证明了在 2500 年前的古印度，女性不仅被允许修行，而且被承认\"能达到最高证悟\"— 与男性完全平等。这在当时的世界是革命性的。它也为现代女性主义研究提供了宝贵的东方视角。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 10, readingMins: 25,
    tags: ["长老尼偈", "女性修行", "巴利"], sortOrder: 98,
    relatedSlugs: ["theragatha", "dhammapada"],
    chapters: [
      {
        chapterNo: 1, title: "穆达尊者 — 自由从厨房开始",
        originalText: "《长老尼偈》穆达（Mutta）尊者偈：\"自由！自由！我终于自由了！\n\n从三种最让我不自由的东西中自由了：\n从杵中自由 — 我再也不用从早到晚舂米；\n从臼中自由 — 我再也不用为不懂感恩的丈夫准备饭菜；\n从驼背的丈夫自由 — 他从来没有真正看过我一眼。\n\n我也从\"生与老\"中自由 — 因为我已证悟。\n\n我曾经以为\"解脱\"是\"离开\"某些东西。但现在我明白 — 解脱是\"我对它们不再有执着\"。\n\n我不需要离开厨房，我只需要从厨房对我的定义中解脱。\n\n现在，我站在城门外的树下。风吹过我剃光的头。我第一次感到自己是\"人\"，而不是某人的妻子、某人的女儿、某个家庭的劳力。\n\n自由不在远方 — 就在你终于意识到\"我可以重新定义自己\"的那一刻。\"",
        commentary: "穆达的偈诗是人类文学史上最早的\"女性觉醒\"文献之一。她没有批判她的丈夫、公婆、或社会 — 她只是\"看穿\"了他们对她的定义，并选择了另一种定义。这与现代心理学\"重构叙事\"（Narrative Reframing）的原理完全一致。对所有现代人（不只是女性）：你今天的困境，有多少是\"外在的实际限制\"，多少是\"别人对你的定义，你接受了\"？",
        practiceHint: "写下 5 个你当下觉得\"困住你\"的身份标签（如\"某某公司CEO\"\"某家庭顶梁柱\"\"某领域专家\"）。对每一个问：\"如果我明天放下这个标签，会发生什么？我会变成谁？\" 诚实地面对自己的恐惧和渴望。",
      },
    ],
  },
  {
    slug: "jataka-tales", title: "本生经(Jataka Tales)", titleEn: "Jataka — Tales of the Buddha's Former Births",
    author: "佛陀时代口传结集", era: "公元前 3 世纪起",
    ring: 2, categorySlug: "buddhist-general",
    summary: "讲述佛陀前世（550 生）的故事合集，是世界文学史上最早的\"寓言故事集\"之一。佛陀在成佛前以各种形相（国王、商人、动物、天神等）转世，在每一世中实践布施、持戒、忍辱等波罗蜜。很多故事后来进入《伊索寓言》和阿拉伯《一千零一夜》。",
    significance: "《本生经》的文化影响超越佛教：印度教、耆那教、伊斯兰文学都吸收了其中的故事。在东南亚，本生故事被绘制在寺庙壁画上，是民众佛教教育的主要形式。故事里深植的\"慈悲\"\"智慧\"\"自我牺牲\"主题至今仍有强大的道德力量。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 10, readingMins: 25,
    tags: ["本生经", "Jataka", "寓言"], sortOrder: 99,
    relatedSlugs: ["dhammapada", "lotus-sutra"],
    chapters: [
      {
        chapterNo: 1, title: "舍身饲虎 — 慈悲到底意味着什么",
        originalText: "《本生经·舍身饲虎》：\"很久以前，佛陀曾是一位王子，名叫 Mahasattva（大勇），与两位兄长一同游山。\n\n他们在山谷中看到一只母老虎，带着 7 只刚出生的小老虎。母老虎已经饿了 7 天，瘦骨嶙峋，眼看就要因饥饿而吃掉自己的孩子。\n\n大勇王子动了慈悲心，对两位兄长说：\"你们先走，我等会儿就来。\"\n\n等兄长们走远，他脱下外衣，走到母老虎面前躺下，希望她吃掉自己。但母老虎已经虚弱到连吃人的力气都没有。\n\n王子于是用一根竹子刺破自己的脖子，让血流出来。母老虎舔到血的腥味，才有力气吃掉他。\n\n他的肉救活了母老虎和 7 只小老虎。\n\n两位兄长回来找他，只看到一堆骨头和衣服。他们哭喊着问：\"你为什么要这样做？\"\n\n天空中传来答案：\"真正的慈悲不是\"我可以做到的最多\"，而是\"此刻最需要的那件事\"。\"",
        commentary: "\"舍身饲虎\"是佛教最极端的慈悲故事。许多人质疑：这是不是过于夸张？其实这个故事要传达的不是\"你应该真的去死\"，而是\"真正的慈悲没有计算\"。当你帮助别人时，如果还在算\"这对我有什么好处\"，那就不是纯粹的慈悲。对企业家最难的挑战：在做善事时（慈善/帮助员工/服务社区），能否做到\"不为营销\"\"不为税务\"\"不为声誉\"，只是纯粹地做？",
        practiceHint: "本月做一次\"无名善行\"：用至少 10% 的个人收入或时间帮助一个人或一个群体，但不留下任何可追溯的痕迹 — 不捐给公司名下的基金会、不写在简历里、不告诉任何人。只有你自己和受益人知道。观察这种\"无名善行\"对你内心的影响。",
      },
    ],
  },
  {
    slug: "xutang-yulu", title: "虚堂智愚禅师语录", titleEn: "Recorded Sayings of Xutang Zhiyu",
    author: "虚堂智愚", era: "南宋(1185-1269)",
    ring: 1, categorySlug: "zen-linji",
    summary: "南宋临济宗杨岐派高僧虚堂智愚的语录。虚堂在当时声名远播，日本入宋僧南浦绍明师事于他，得法后归国，其法脉传大灯国师、关山慧玄，最终成为日本临济宗大本山\"妙心寺派\"的根源。",
    significance: "虚堂是中日禅宗交流史上的关键人物 — 日本临济宗 \"应灯关\" 法脉（南浦→大灯→关山）直接从他而来，这一法脉至今仍是日本禅宗最活跃的一支。\"临济宗妙心寺派\"每年有数百万人参拜，都溯源于虚堂一人。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["虚堂", "杨岐", "日本禅"], sortOrder: 100,
    relatedSlugs: ["linji-lu", "dahui-pujue"],
    chapters: [
      {
        chapterNo: 1, title: "一口吸尽西江水 — 不可思议的禅机",
        originalText: "《虚堂语录》云：\"庞居士问马祖：\"不与万法为侣者，是什么人？\"祖云：\"待汝一口吸尽西江水，即向汝道。\"\n\n虚堂举：\"庞居士这一问，已是石火电光。马祖这一答，更是超佛越祖。\n\n\"一口吸尽西江水\"— 是可能的吗？表面看来荒唐，实际上在告诉你：你所问的问题，本身就是错的。\n\n\"不与万法为侣者\"— 这个\"者\"已经把你自己从\"万法\"中切离了，已经造了一个\"独立的我\"。只要还有\"我\"和\"万法\"的分别，就永远不可能找到\"那个不与万法为侣的人\"。\n\n马祖的回答是：你要先\"取消这个分别\"— 吸尽西江水，才能看到答案。\n\n你是问者，也是被问者；你是答案，也是问题。这不是玄学，这是最根本的事实。\"",
        commentary: "虚堂这段公案解读直指禅宗的核心：\"分别心\"是所有问题的根源。我们的大部分苦恼，都来自\"把自己从整体中分离出来\"之后的焦虑 — \"我和他人\"\"我和世界\"\"我和未来\"。禅宗不是教你\"改善\"这个分离的\"我\"，而是教你\"看穿这个分离本身是个错觉\"。对创业者：当你陷入\"我对抗市场\"\"我对抗竞争对手\"\"我对抗时间\"的思维时，往往就是你最累的时候。真正的高手把\"我\"融入\"势\"— 市场、趋势、时代，成为其中的一部分。",
        practiceHint: "明天早晨，花 10 分钟做这样的冥想：想象\"我\"这个概念慢慢消失 — 没有\"我的公司\"\"我的家庭\"\"我的目标\"，只有\"正在发生的一切\"。30 秒后，重新回到\"我\"的视角。感受两种状态的差异。",
      },
    ],
  },
  {
    slug: "shenhui-yulu", title: "荷泽神会禅师语录", titleEn: "Recorded Sayings of Heze Shenhui",
    author: "荷泽神会", era: "唐(684-758)",
    ring: 1, categorySlug: "buddhist-zen",
    summary: "六祖慧能晚年弟子荷泽神会（684-758）的语录。神会在六祖圆寂后北上洛阳，在\"滑台大会\"上公开批判北宗神秀一派\"渐修\"的主张，为\"南宗顿悟\"争得正统地位。没有神会的辩论，中国禅宗的南宗可能不会成为主流。",
    significance: "神会是一位\"禅宗政治家\"— 他不仅自己修行，更重要的是他通过 30 年的公开论战，让\"六祖慧能才是正统禅宗\"的观点被官方接受。《菩提达摩南宗定是非论》是他的代表作。胡适在敦煌发现神会语录后，称他为\"中国禅宗真正的开创者\"。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["神会", "荷泽", "顿悟", "南宗"], sortOrder: 101,
    relatedSlugs: ["platform-sutra", "damo-xuemo"],
    chapters: [
      {
        chapterNo: 1, title: "顿悟 — 不是\"慢慢变好\"而是\"当下全看见\"",
        originalText: "《神会语录》云：\"问：\"云何是顿悟？\"\n\n答：\"一念相应，便成正觉。\"\n\n问：\"若如此，何用修行？\"\n\n答：\"顿悟不废渐修。如人饮水，冷暖自知。水一口即知冷暖（顿），但要饮尽一整桶水需要时间（渐）。\n\n顿悟说的是\"见道\"— 一瞬间你看清了事物的真相；渐修说的是\"修道\"— 见道之后还需要长久的工夫把旧习惯洗掉。\n\n北宗说\"时时勤拂拭\"— 把修行当作\"慢慢擦镜子\"；南宗说\"本来无一物\"— 镜子从来就没被污染，你只需要\"看到这一点\"。\n\n两者不是对立的。南宗讲的是\"见道的瞬间\"，北宗讲的是\"修道的过程\"。但如果没有顿悟作为起点，渐修只是在\"打扫一个本来就干净的房间\"，越打扫越累。\"",
        commentary: "神会\"顿悟不废渐修\"的主张是中国佛教理论的一次重要平衡。他既坚持南宗\"本来清净\"的激进观点，又承认修行过程的必要性。对现代人的启示极深：你可以在\"一瞬间\"理解一个重要的道理（顿），但要把这个道理\"变成你的本能\"还需要长期练习（渐）。比如你可能一瞬间明白\"愤怒伤害自己\"，但要真正不愤怒需要几十年。顿悟是方向，渐修是旅程。",
        practiceHint: "回顾你人生中的一次\"顿悟\"时刻 — 那种\"瞬间看清某件事\"的感觉。问：我顿悟后，是立即变成\"不一样的人\"吗？还是需要几年甚至十几年才把那个顿悟\"活出来\"？这个反思能让你对\"慢\"更有耐心。",
      },
    ],
  },
  {
    slug: "laozi-xiangerzhu", title: "老子想尔注", titleEn: "Xiang'er Commentary on Laozi",
    author: "早期天师道 / 传为张陵张鲁", era: "东汉末(约 200)",
    ring: 3, categorySlug: "taoism",
    summary: "现存最早的《道德经》宗教性注释，代表了早期天师道（五斗米道）对道家经典的神学化解读。1900 年敦煌莫高窟发现，为研究道教起源、老子学说的宗教转化、早期民间宗教提供了最一手材料。",
    significance: "《想尔注》的出现时间早于葛洪《抱朴子》数百年，是道教从\"哲学\"向\"宗教\"转变的关键见证。它把\"道\"人格化为\"太上老君\"，提出\"守一\"\"积善\"\"行气\"等修炼法门，是后世道教几乎所有教义的源头。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 9, readingMins: 25,
    tags: ["想尔注", "天师道", "早期道教"], sortOrder: 102,
    relatedSlugs: ["daodejing", "taishang-ganying"],
    chapters: [
      {
        chapterNo: 1, title: "守一 — 修道的第一工夫",
        originalText: "《老子想尔注》注\"载营魄抱一\"云：\"一者，道也。\n\n一散形为气，聚形为太上老君，常治昆仑。\n\n或言虚无，或言自然，或言无名，皆同一耳。\n\n今布道诫，教人守戒不违者，即为守一；不行其诫，即为失一也。\n\n世间尝伪技指五脏以名\"一\"，令人思之，谓守一。...又伪造说：\"瞑目思想，见其形容\"，谓之\"存思\"。都是欺世之谈。\n\n真正的守一只有一个方法：守戒。\n\n持戒 — 就是守一；犯戒 — 就是失一。\n\n不要向外求仙求神，向内守住自己的戒行，才是真正的修道。\"",
        commentary: "《想尔注》对\"守一\"的解读极具现代感：它不鼓励神秘的内观技术、不推崇瑜伽式身体控制，只强调一件事 — \"持戒\"。这意味着\"修行\"不是某种特殊的\"技术\"，而是日常生活中的每一个选择。对企业家的启示深刻：你不需要去灵修营、不需要学打坐、不需要读哲学书才能\"修行\"。你只需要在日常决策中遵守你定下的\"戒\"（原则、底线、承诺）— 这就是最深的修行。",
        practiceHint: "写下你给自己定的 \"五戒\"（5 条绝不突破的原则）。例如：不说一句假话 / 不做伤害他人的生意 / 不让愤怒决定决策 / 不承诺做不到的事 / 每天给家人 1 小时。把这五戒写在办公桌上，每天检查。这就是\"守一\"。",
      },
    ],
  },
  {
    slug: "xiao-jing", title: "孝经", titleEn: "Classic of Filial Piety",
    author: "曾子门人传述", era: "战国-汉初",
    ring: 3, categorySlug: "confucianism",
    summary: "儒家十三经之一，仅 1800 字，篇幅最短，但地位极高。以孔子与曾子对话的形式，系统阐述\"孝\"的概念 — 从\"事亲\"（孝父母）扩展到\"事君\"（忠国家）\"立身\"（成就自己）。是中国两千年\"孝文化\"的经文基石。",
    significance: "《孝经》对东亚文化的影响超越任何单一文本。汉代以\"以孝治天下\"为国策，唐玄宗亲自注《孝经》（今传本），日韩朝越都将其列为必读经典。\"百善孝为先\"这句民间俗语就是对《孝经》精神的最简洁概括。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 9, readingMins: 15,
    tags: ["孝经", "孝道", "儒家"], sortOrder: 103,
    relatedSlugs: ["lunyu", "daxue"],
    chapters: [
      {
        chapterNo: 1, title: "孝 — 从身体到天下的层层展开",
        originalText: "《孝经·开宗明义章第一》云：\"仲尼居，曾子侍。子曰：\"先王有至德要道，以顺天下，民用和睦，上下无怨。汝知之乎？\"\n\n曾子避席曰：\"参不敏，何足以知之？\"\n\n子曰：\"夫孝，德之本也，教之所由生也。复坐，吾语汝。\n\n身体发肤，受之父母，不敢毁伤，孝之始也。\n立身行道，扬名于后世，以显父母，孝之终也。\n\n夫孝，始于事亲，中于事君，终于立身。\n\n《大雅》云：\"无念尔祖，聿修厥德。\"\"\n\n孔子把孝分为三个层次：\n第一层 — 不让自己的身体受伤害（敬重父母给的生命）；\n第二层 — 不让自己的品行让父母蒙羞（敬重父母给的姓氏）；\n第三层 — 成就一番事业让父母引以为荣（回报父母的养育之恩）。\"",
        commentary: "《孝经》对\"孝\"的三层定义极具哲理：它把\"孝\"从单纯的\"听父母话\"扩展到\"做一个有价值的人\"。第一层是\"不伤害\"，第二层是\"不丢脸\"，第三层是\"能荣耀\"。对现代人的启示：如果你正在抱怨父母的\"老观念\"、正在反抗他们的\"控制\"，问自己一个更深的问题 — \"我是在第几层？我做到\"不让自己的人生成为他们的伤痛\"了吗？\" 孝不是顺从，是活得值得。",
        practiceHint: "写一封不打算寄出的信给你父母，内容是：\"我是否达到了孝的三层要求？第一层：我的身心是否健康？第二层：我的品行是否让你们安心？第三层：我的成就是否让你们感到自豪？\" 诚实地写。",
      },
    ],
  },
  {
    slug: "sermon-on-mount", title: "登山宝训(Sermon on the Mount)", titleEn: "Sermon on the Mount",
    author: "马太福音 5-7 章记载", era: "约 30 年",
    ring: 3, categorySlug: "christianity",
    summary: "耶稣在加利利山上向门徒和众人所讲的系统教导，记载于《马太福音》5-7 章。包括\"八福\"（Beatitudes）、\"主祷文\"、\"爱仇敌\"、\"不要论断\"、\"窄门\"等基督教伦理学的核心内容。被誉为\"基督教的心脏\"。",
    significance: "《登山宝训》不仅是基督教伦理的根基，也深刻影响了托尔斯泰的非暴力主义、甘地的不合作运动、马丁·路德·金的民权运动。任何一个想理解\"基督教真正的伦理革命\"的人，必须读这段经文。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 10, readingMins: 20,
    tags: ["登山宝训", "八福", "主祷文"], sortOrder: 104,
    relatedSlugs: ["matthew-gospel", "luke-gospel"],
    chapters: [
      {
        chapterNo: 1, title: "八福 — 对\"成功\"定义的彻底颠覆",
        originalText: "《马太福音》5:3-12：\"耶稣看见这许多的人，就上了山，既已坐下，门徒到他跟前来。他就开口教训他们说：\n\n\"虚心的人有福了！因为天国是他们的。\n哀恸的人有福了！因为他们必得安慰。\n温柔的人有福了！因为他们必承受地土。\n饥渴慕义的人有福了！因为他们必得饱足。\n怜恤人的人有福了！因为他们必蒙怜恤。\n清心的人有福了！因为他们必得见神。\n使人和睦的人有福了！因为他们必称为神的儿子。\n为义受逼迫的人有福了！因为天国是他们的。\n\n人若因我辱骂你们，逼迫你们，捏造各样坏话毁谤你们，你们就有福了！应当欢喜快乐！因为你们在天上的赏赐是大的。\"",
        commentary: "\"八福\"是人类伦理学最革命性的宣言之一。它把\"有福\"的定义从\"富有、健康、受尊敬\"彻底颠倒为\"虚心、哀恸、温柔、受逼迫\"。这不是说\"贫穷的人在道德上更高尚\"，而是说\"真正的幸福来自一种与世俗逻辑相反的内心状态\"。对现代企业家：你所追求的\"成功\"—资产增值、市场份额、业界地位 — 是世俗的\"福\"。但你是否也在追求\"虚心\"（谦卑到真正能学到东西）、\"温柔\"（强大到不需要表现强硬）、\"怜悯\"（富有到可以慷慨）？这两种\"福\"缺一不可。",
        practiceHint: "对\"八福\"每一福自评：我当下最缺的是哪一种\"福\"？（虚心/哀恸/温柔/饥渴慕义/怜恤/清心/使人和睦/为义受逼迫）。选最缺的一个，本月刻意练习那个品质。",
      },
    ],
  },
  {
    slug: "kabir-dohas", title: "卡比尔对句(Kabir ke Dohe)", titleEn: "Kabir's Couplets",
    author: "卡比尔(Kabir)", era: "15 世纪北印度(约 1440-1518)",
    ring: 3, categorySlug: "hinduism",
    summary: "15 世纪印度神秘主义诗人卡比尔的诗歌集。卡比尔出生于伊斯兰织工家庭，却同时受印度教 Bhakti 运动影响。他的诗作既批判印度教的种姓制度，也批判伊斯兰教的形式主义，主张一种\"超越宗派\"的直接神秘体验。是印度宗教融合思想的先声。",
    significance: "卡比尔的诗被收入锡克教《古鲁经》（Guru Granth Sahib）中，他是锡克教 Bhakti 传统的重要前辈。他的批判精神和诗歌语言影响了 Tulsidas、Mirabai、泰戈尔等后世诗人。20 世纪美国诗人 Robert Bly 将卡比尔诗译成英文，让西方也认识了这位\"亚洲的 Rumi\"。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 10, readingMins: 20,
    tags: ["卡比尔", "Bhakti", "融合"], sortOrder: 105,
    relatedSlugs: ["guru-granth-sahib", "bhagavad-gita"],
    chapters: [
      {
        chapterNo: 1, title: "真神在心不在庙 — 反对形式主义",
        originalText: "《卡比尔对句》选：\"神不在神庙里，神不在清真寺里，神不在麦加，神不在卡什。\n\n如果神在佛塔里，那就只有石匠才能认识神；\n如果神在圣河里，那就只有鱼才最接近神。\n\n我去印度教神庙，他们说：\"拜湿婆就能得救。\"\n我去清真寺，他们说：\"只有安拉才是真神。\"\n我去寺院，他们说：\"唯有佛陀能救你。\"\n\n我离开了所有这些地方，在自己心里找到了那一位。\n\n他不需要被拜，因为他就是拜者；\n他不需要被爱，因为他就是爱本身。\n\n卡比尔说：\"如果你在心外寻找，你会永远寻不到。如果你在心内寻找，你会发现他从未离开。\"\"",
        commentary: "卡比尔的诗是人类神秘主义文学的珍品：他既不是印度教徒，也不是穆斯林，又同时是两者 — 或者说，他超越了这两种身份。他的核心洞察是：\"宗教形式\"只是通往\"真实体验\"的手指，不是月亮本身。对现代人极有启示：你参加的所有\"自我提升课程\"\"商业培训\"\"精神工作坊\"，都只是\"手指\"。最终你要的是那个手指\"指向\"的东西 — 那个只有在你自己的内心深处才能找到的答案。",
        practiceHint: "列出你过去一年参加过的所有\"成长类\"活动（课程、讲座、工作坊、辅导）。问：这些帮助我\"接近了内心\"还是让我\"向外寻找更多\"？卡比尔会说什么？",
      },
    ],
  },
  {
    slug: "tulsidas-ramcharitmanas", title: "罗摩功行之湖(Ramcharitmanas)", titleEn: "Ramcharitmanas — Tulsidas's Life of Rama",
    author: "Tulsidas(图尔西达斯)", era: "16 世纪印度(约 1574-1577)",
    ring: 3, categorySlug: "hinduism",
    summary: "16 世纪印度诗人图尔西达斯（Tulsidas, 1532-1623）用 Awadhi 方言（印地语的一种）重述《罗摩衍那》的诗歌巨著。相比于梵文原典《罗摩衍那》的精英性，图尔西达斯的版本是为普通人写的，至今仍是北印度民众最熟悉的宗教文本。",
    significance: "《罗摩功行之湖》的影响力在印度无与伦比：甘地在狱中读它获得精神力量，印度总理至今在国会发誓时引用它，每年 Ramlila 节全印度会演出它的片段。它是印度文化\"活的经典\"，不是图书馆里的古董。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 30,
    tags: ["Tulsidas", "罗摩", "Bhakti"], sortOrder: 106,
    relatedSlugs: ["ramayana", "bhagavad-gita"],
    chapters: [
      {
        chapterNo: 1, title: "罗摩之名 — 在黑暗中的光",
        originalText: "《罗摩功行之湖》序云：\"在这个卡利纪（Kali Yuga，黑暗时代），所有的仪式都失效了，所有的苦行都无益，所有的知识都混乱。\n\n唯有一件事仍然有效 — 诵念罗摩的名号（Ram Nam）。\n\n罗摩之名像一艘小船，它能载着你穿越这个时代的黑暗洋流。\n\n图尔西达斯跪下对罗摩祷告：\"主啊，我没有智慧，我没有力量，我没有高贵的出身。我只有一件事 — 我会呼唤你的名字。\n\n如果你听见 — 很好；\n如果你不听见 — 我还是会继续呼唤，直到我死去。\n\n因为我相信：名字本身就是神。只要有人呼唤，神就在那里。\"\n\n所以，卡利时代的解脱之道是极其简单的 — 不需要学问、不需要修行、不需要献祭，只需要\"记住神的名字\"。\"",
        commentary: "图尔西达斯的\"名号修行\"（Nama Sadhana）是 Bhakti 运动最核心的法门，也是对\"精英修行\"的民主化。他的观点是：如果修行需要高学历、高地位、高时间投入，那它就背叛了神的本意 — 神应该对每一个人开放，包括最贫穷、最无知、最忙碌的人。这与佛教净土宗的\"念佛一句\"、伊斯兰苏菲派的\"Dhikr\"（诵念）惊人相似。对现代人：你不需要\"有时间\"才能修行。地铁上、洗碗时、堵车中，一句话的默念，就是完整的修行。",
        practiceHint: "选一个对你有意义的\"名号\"— 可以是神的名字（任何传统）、一个价值观词（\"慈悲\"\"清明\"\"勇气\"）、或一句话（\"我已经足够\"）。下周尝试：每当你觉得焦虑或被压倒时，在心里默念这个名号 3 次。观察它带来的变化。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.18 经论++ v18 精修第八轮 — 10 部原始古德');

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
    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { relatedIds: related.map(r => r.id) },
    });
    relationCount++;
  }
  console.log(`  ✓ ${relationCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log(`\n📜 M38.18 精修第八轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
