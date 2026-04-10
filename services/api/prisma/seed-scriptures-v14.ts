/**
 * M38.14 经论++ v14 — 精修第四轮：10 部主流传统深化
 * 本轮(10部, 218 → 228):
 *   BUDDHISM +2 (菩萨璎珞本业经 / 大宝积经)
 *   ZEN +2 (莹山传光录 / 泽庵不动智神妙录)
 *   TAOISM +1 (太乙救苦经)
 *   CONFUCIANISM +2 (太极图说 / 二程遗书)
 *   CHRISTIANITY +2 (埃克哈特讲道集 / 大德兰自传)
 *   HINDUISM +1 (女神赞歌)
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
    slug: "pusa-yingluo-benye-jing", title: "菩萨璎珞本业经", titleEn: "Sutra of the Bodhisattva's Jeweled Garland",
    author: "竺佛念译", era: "东晋(376-378)",
    ring: 2, categorySlug: "buddhist-general",
    summary: "详细阐述菩萨阶位（十信、十住、十行、十回向、十地、等觉、妙觉）的核心经典。菩萨五十二位的系统最早即出于此经，对后世天台、华严、禅宗的菩萨阶位论有根本性影响。",
    significance: "《璎珞本业经》是汉传佛教建立完整菩萨道体系的关键文献，中国佛教\"三聚净戒\"（摄律仪、摄善法、摄众生）的传授仪轨也源于此经。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 35,
    tags: ["菩萨阶位", "五十二位", "三聚净戒"], sortOrder: 57,
    relatedSlugs: ["huayan-sutra", "fanwang-jing"],
    chapters: [
      {
        chapterNo: 1, title: "十信位 — 菩提之始",
        originalText: "《璎珞本业经·贤圣学观品》：\"佛子，发心住前，有十顺名字：信心、念心、精进心、慧心、定心、不退心、回向心、护心、戒心、愿心。\n\n十信菩萨，虽未入位，而能发起信心、持戒、闻法、供养三宝，修六念处（念佛、念法、念僧、念戒、念施、念天）。\n\n一信心 — 深信佛性本有，决定不疑；二念心 — 念念相续，无间断；三精进心 — 乃至舍身求法；\n\n十信圆满，即入初住发心住。从此始名真菩萨。\"",
        commentary: "\"十信\"是菩萨道的最初阶段，看起来基础，实际上很难 — 很多人一辈子都卡在\"信心\"这一关。对企业家启示：你说自己相信公司使命/相信团队/相信未来，这个\"相信\"是否经得起检验？\"决定不疑\"四个字最难。",
        practiceHint: "写下你当下最重要的三个\"相信\"（相信什么能让你坚持下去）。给每一个打分（1-10），评估\"决定不疑\"的程度。7 分以下的，说明你还需要更深的确证。",
      },
      {
        chapterNo: 2, title: "三聚净戒 — 最完整的戒",
        originalText: "《璎珞本业经》首次系统讲\"三聚净戒\"：\"菩萨戒有三：一者摄律仪戒，二者摄善法戒，三者摄众生戒。\n\n摄律仪戒者 — 不作一切恶。\n摄善法戒者 — 修一切善。\n摄众生戒者 — 度一切众生。\n\n不仅\"不做坏事\"是戒（那只是律仪戒），\"应做好事而未做\"也是破戒（破善法戒），\"能帮助人而未帮助\"也是破戒（破众生戒）。\n\n三聚具足，方为圆满菩萨戒。\"",
        commentary: "汉传佛教\"三聚净戒\"的核心在于：戒不只是\"不做恶\"，更是\"必须做善\"和\"必须帮助众生\"。这是对传统\"五戒十戒\"消极持戒观的根本突破。对企业家：你不骗人（律仪戒），但你有没有主动帮助员工成长（善法戒）？有没有让你的产品真正造福用户（众生戒）？",
        practiceHint: "用三聚净戒自检：① 本周你有没有做不该做的事（律仪）？② 本周你有没有错过该做的善事（善法）？③ 本周你有没有拒绝伸手帮助可以帮的人（众生）？三问诚实回答。",
      },
    ],
  },
  {
    slug: "dabao-jijing", title: "大宝积经", titleEn: "Maharatnakuta Sutra",
    author: "菩提流志等译", era: "唐(706-713)",
    ring: 2, categorySlug: "buddhist-general",
    summary: "大乘佛教的百科全书式经典，由 49 部独立大乘经典汇集而成。内容涵盖菩萨道、般若空观、净土法门、密乘咒语等。是理解大乘佛教多元面貌的必读文献。",
    significance: "《大宝积经》汇集了从东晋到唐代近 400 年的重要大乘译经，是玄奘之后最大规模的翻译工程。其中《无量寿如来会》为净土宗核心经典之一，《普明菩萨会》是密乘初步。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 50,
    tags: ["大宝积", "汇编", "菩提流志"], sortOrder: 58,
    relatedSlugs: ["wuliangshou-jing", "diamond-sutra"],
    chapters: [
      {
        chapterNo: 1, title: "普明菩萨会 — 四种心",
        originalText: "《大宝积经·普明菩萨会》云：\"迦叶，菩萨有四种心，能生大法乐：\n\n一者、应化心 — 随众生机，不拘一格；\n二者、恒沙心 — 精勤不倦，如恒河沙数；\n三者、猛利心 — 决定成佛，不退转；\n四者、顺正心 — 一切行为，合于正道。\n\n复有四种反心，令菩萨退堕：\n一者、懒惰心；二者、疑悔心；三者、骄慢心；四者、轻法心。\n\n智者当观察己心：此时是四种正心，还是四种反心？观察之后，立刻调整。\"",
        commentary: "这段经文提供了极其实用的\"心的四维诊断\"：应化（灵活）、恒沙（勤勉）、猛利（决心）、顺正（正道）。四个一起构成完整的菩萨心相。对企业家是绝佳的自我诊断工具 — 检查自己缺哪个维度。",
        practiceHint: "每天晚上花 2 分钟，对今天自己的心打分：灵活(1-5)？勤勉(1-5)？决心(1-5)？正道(1-5)？找出最低分的那一维，明天刻意加强。坚持一个月，你会发现心性显著变强。",
      },
      {
        chapterNo: 2, title: "不动如来会 — 忍辱波罗蜜",
        originalText: "《大宝积经·不动如来会》：\"菩萨修行忍辱，有三等：\n\n下等忍辱 — 被骂时咬牙不还口，但心中记恨；\n中等忍辱 — 被骂时不生怒气，但仍觉不公；\n上等忍辱 — 被骂时感谢对方\"为我消业，助我修行\"。\n\n真正的忍辱不是压抑，是转化 — 把伤害的能量转为修行的燃料。\n\n若有人终其一生侮辱你，却让你成佛 — 他便是你最大的恩人。\"",
        commentary: "\"被骂时感谢对方\"初看很难接受，但佛教的深意在于：如果你心不动，外在攻击就变成了磨砺 — 石头磨刀，刀感谢石头。对企业家：你最苛刻的客户、最难缠的对手、最挑刺的同事，可能是让你真正成长的人。感谢他们（在心里，不必说出口），你的境界自然提升。",
        practiceHint: "想一个让你最近烦心的人。在心里对他说\"谢谢你磨我\"，然后具体写下他这种行为让你锻炼出了什么品质（耐心？洞察？决断？）。你会感到一种奇妙的释然。",
      },
    ],
  },
  {
    slug: "keizan-denkoroku", title: "莹山传光录", titleEn: "The Record of the Transmission of the Light",
    author: "莹山绍瑾", era: "镰仓末(1300)",
    ring: 1, categorySlug: "zen-core",
    summary: "日本曹洞宗第四祖莹山绍瑾所作，记述从释迦牟尼佛到道元禅师的 52 代禅宗传承故事。是日本曹洞宗最重要的法脉记录，也是了解\"传灯\"精神最生动的文本。",
    significance: "莹山绍瑾被誉为日本曹洞宗\"太祖\"（道元是\"高祖\"）。《传光录》通过讲述每一代祖师的开悟公案与传承故事，展现禅宗\"以心印心\"的活生生传统。",
    difficulty: 3, oxStageMin: 3, oxStageMax: 9, readingMins: 40,
    tags: ["莹山", "曹洞宗", "传灯", "日本禅"], sortOrder: 59,
    relatedSlugs: ["dogen-shobogenzo", "jingde-chuandeng"],
    chapters: [
      {
        chapterNo: 1, title: "释迦拈花 — 以心印心",
        originalText: "《传光录》第一章：\"世尊在灵山会上，拈花示众。众皆默然，惟迦叶尊者破颜微笑。\n\n世尊曰：\"吾有正法眼藏，涅槃妙心，实相无相，微妙法门，不立文字，教外别传，付嘱摩诃迦叶。\"\n\n这就是禅宗\"以心印心\"的源头。不是通过语言，不是通过经典，而是通过那一笑 — 心与心的直接相认。\n\n莹山说：\"此一笑不关佛法，不关哲学，只是一个心认出了另一个心。\"\"",
        commentary: "\"破颜微笑\"是禅宗最美的瞬间。佛陀说了 49 年法，最深的一课却是无言的。对企业家：你最重要的沟通往往不是文字和 PPT，而是一个眼神、一个微笑、一次沉默 — 心与心的直接相认。团队真正的默契，永远在语言之外。",
        practiceHint: "今天观察自己的沟通：哪些时刻是\"以心印心\"（不需要解释就懂），哪些时刻是\"口干舌燥还讲不清\"？记录两种时刻的差异，你会发现团队深度取决于前者的频率。",
      },
      {
        chapterNo: 2, title: "道元嫡传 — 只管打坐",
        originalText: "《传光录》第 52 章 道元嗣法：\"道元禅师在天童山如净禅师座下参学，一日坐禅时有僧打瞌睡。如净喝道：\"参禅须是身心脱落，只管打坐，如何睡眠！\"\n\n道元闻此大悟。他后来写道：\"我此行（到中国）得一事：参禅须是身心脱落。此外别无所获。\"\n\n\"只管打坐\"（Shikantaza）从此成为曹洞宗的核心 — 不为开悟而坐，不为证明而坐，只是坐。坐着即是佛，不必期待别的。\"",
        commentary: "\"只管打坐\"是世界修行史上最激进也最简单的教法 — 不追求任何结果，甚至不追求\"开悟\"。这对成就导向的企业家是解药：你做每一件事都想\"这能换来什么\"，但最高的状态是\"只管做\"—— 此刻的做本身就是全部。",
        practiceHint: "今天选一件事，完全放下\"这有什么用\"的问题，只管做。可以是散步、写作、做饭。感受\"只管\"的无目的性带来的奇特自由。",
      },
    ],
  },
  {
    slug: "takuan-fudochi", title: "不动智神妙录", titleEn: "The Unfettered Mind",
    author: "泽庵宗彭", era: "江户初(1632)",
    ring: 1, categorySlug: "zen-core",
    summary: "日本临济宗高僧泽庵宗彭写给剑圣柳生宗矩的书简，以禅宗智慧阐述剑道心法。提出\"不动智\"、\"无心\"、\"本心与妄心\"等概念，是日本\"禅剑一如\"传统最权威的文本。",
    significance: "泽庵是德川幕府时期最有影响力的禅师之一，《不动智神妙录》通过剑道阐述禅法，使禅宗走入日本武士阶层。其思想对宫本武藏《五轮书》、新渡户稻造《武士道》皆有影响。",
    difficulty: 4, oxStageMin: 4, oxStageMax: 10, readingMins: 30,
    tags: ["泽庵", "剑禅", "不动智", "无心"], sortOrder: 60,
    relatedSlugs: ["hagakure", "linji-lu"],
    chapters: [
      {
        chapterNo: 1, title: "不动智 — 心不停留",
        originalText: "泽庵《不动智神妙录》：\"所谓不动智者，非心不动也。心处处皆动，却无处停滞。此名不动。\n\n若剑客见对手之剑而心停在剑上，便是败阵之始。心停在剑上，则他处皆忘。\n\n水流不曾停在一石上，故能越万石而不困。心亦如此：见万物而不黏住一物，名不动智。\n\n若停留在\"我必须赢\"的念头上，便无法看见对手的虚实；若停留在\"我必须慈悲\"的念头上，便无法直言对方的过失。\"",
        commentary: "\"不动智非心不动也\"是泽庵最精彩的反转：真正的\"不动\"不是僵死不动，而是\"处处皆动却无处停滞\"。像水像风 — 触一切而不黏一切。对企业家：你开会时心停在\"昨天的失败\"，你就看不清今天的机会；你谈判时心停在\"我必须拿到这个结果\"，反而失去议价筹码。",
        practiceHint: "下次重要谈判前做一个\"松手\"练习：先放下\"我必须赢\"的念头，告诉自己\"任何结果都接受\"。然后进入谈判 — 你会发现脑子更清晰、反应更快。",
      },
      {
        chapterNo: 2, title: "本心与妄心",
        originalText: "泽庵续云：\"本心者，遍于全身，流到一切处。妄心者，凝滞在一处，成为执着。\n\n本心如水 — 倒入方器为方，倒入圆器为圆，无形无相却能为万器之用。\n\n妄心如冰 — 一旦凝结，便失去流动性，不能为任何容器所用。\n\n烦恼不是\"有妄心\"，而是\"不知妄心是冰、本心是水\"。知道这一点，冰就在你的觉知中融化。\"",
        commentary: "\"本心如水、妄心如冰\"这个比喻绝美。它告诉我们：心本来是流动的水，我们通过执着把它冻成了冰。解决办法不是\"对抗冰\"，而是\"让水重新流动\"。对企业家：当你陷入某个执念时，不要强硬压制它，只是意识到\"它是冰，我是水\"，执念自然融化。",
        practiceHint: "遇到强烈执着时，闭眼默念\"这是冰，我是水\"，观察这个念头 1 分钟。通常 1-2 分钟后你就能感到那个执着开始松动。",
      },
    ],
  },
  {
    slug: "taiyi-jiuku-jing", title: "太乙救苦护身妙经", titleEn: "Scripture of the Savior Taiyi",
    author: "道教灵宝派", era: "唐末(9 世纪)",
    ring: 3, categorySlug: "taoism",
    summary: "道教救度类经典，以太乙救苦天尊为核心信仰对象，讲述他如何化现各种身相救度苦难众生。是道教与佛教观音菩萨信仰对应的救度经典，流传极广。",
    significance: "《太乙救苦经》代表了道教从个人修仙向\"普度众生\"转变的重要阶段。太乙救苦天尊的信仰在民间深入人心，与佛教观音并为中国最重要的救苦救难神祇。",
    difficulty: 3, oxStageMin: 3, oxStageMax: 9, readingMins: 25,
    tags: ["太乙救苦", "天尊", "普度"], sortOrder: 61,
    relatedSlugs: ["duren-jing", "guan-yin-zi"],
    chapters: [
      {
        chapterNo: 1, title: "千处祈求千处应",
        originalText: "《太乙救苦经》云：\"太乙救苦天尊，身处东方长乐净土，然其妙用周遍十方。\n\n若有众生，造恶受苦，至心称念太乙救苦天尊名号，天尊即以九色祥云化身降临，救度出苦。\n\n或化天尊身，或化玉女身，或化道士身，或化儒生身，或化帝王身，或化乞丐身 — 随众生机，应现无尽。\n\n千处祈求千处应，苦海常作度人舟。\"",
        commentary: "\"千处祈求千处应\"不是说真有一个神同时出现在千处，而是一个深刻的隐喻：当你真诚呼唤帮助时，帮助会以最不可思议的形式来到 — 可能是一个陌生人的一句话、一本书的一段话、一场梦的一个意象。对企业家：学会\"求助\"本身是一种能力。你真诚发出\"我需要帮助\"的信号，帮助会以意想不到的形式出现。",
        practiceHint: "今天做一件你平时不愿做的事：诚实地向一个人说\"我在这件事上需要帮助\"。观察接下来 7 天内会有什么\"不可思议\"的帮助出现。你会惊讶的。",
      },
      {
        chapterNo: 2, title: "救苦真言",
        originalText: "《太乙救苦经》救苦真言：\"诸苦逼身，一心称念 — \"太乙救苦天尊\"六字真言。\n\n一称，散心中烦；二称，除身上病；三称，解冤解结；四称，开路引光；五称，接引天尊；六称至九称，渐入净土。\n\n关键在\"一心\"二字 — 半心半意的念诵无效，只有全心投入的一念，能穿透苦难的迷雾。\"",
        commentary: "\"一心称念\"是所有宗教共通的修法：不论念\"南无阿弥陀佛\"、念真主之名、念上帝之名、还是念太乙救苦天尊，关键是\"一心\"二字。对现代焦虑的人是最简单有效的法门：当心烦到无法思考时，选一个你尊敬的名号，专注念诵 5 分钟，焦虑自然散去。",
        practiceHint: "遇到强烈焦虑时，选一个你深信的名号（宗教名号、父母名字、甚至\"平静\"二字），闭眼心中重复念 5 分钟。专注在声音上，不要想任何其他事。体验\"一心\"的力量。",
      },
    ],
  },
  {
    slug: "taiji-tushuo", title: "太极图说", titleEn: "Explanation of the Supreme Ultimate",
    author: "周敦颐", era: "北宋(1017-1073)",
    ring: 3, categorySlug: "confucianism",
    summary: "宋代理学开山祖师周敦颐的代表作，短短 249 字却包含了宋明理学的全部核心 — 太极、阴阳、五行、人极、诚、敬、主静。是理解宋明儒学宇宙论与道德论的必读。",
    significance: "《太极图说》被朱熹列为\"道学第一书\"，对后世 700 年的中国哲学发展具有根本性影响。其\"圣人定之以中正仁义而主静\"一语开启了整个程朱理学的工夫论。",
    difficulty: 4, oxStageMin: 5, oxStageMax: 10, readingMins: 20,
    tags: ["周敦颐", "太极", "理学", "主静"], sortOrder: 62,
    relatedSlugs: ["yijing", "jinsi-lu", "zhang-zai-ximing"],
    chapters: [
      {
        chapterNo: 1, title: "太极动静 — 宇宙生成",
        originalText: "《太极图说》开篇：\"无极而太极。太极动而生阳，动极而静，静而生阴，静极复动。一动一静，互为其根。分阴分阳，两仪立焉。\n\n阳变阴合，而生水火木金土。五气顺布，四时行焉。\n\n五行一阴阳也，阴阳一太极也，太极本无极也。\n\n五行之生也，各一其性。无极之真，二五之精，妙合而凝。乾道成男，坤道成女。二气交感，化生万物。万物生生而变化无穷焉。\"",
        commentary: "周敦颐 249 字写完整个宇宙生成论 — 从\"无极\"到\"太极\"到\"阴阳\"到\"五行\"到\"万物\"。精妙的是\"无极而太极\"五字：最高的原理不是\"有\"而是\"无\"，从\"无\"中生出\"有\"。这对企业家启示：最高的战略往往不是\"加什么\"而是\"减什么\"—— 从\"无\"出发重新思考，你会看见之前看不见的可能。",
        practiceHint: "做一个\"无极战略\"练习：关于你当下最头疼的问题，问\"如果从零开始、没有任何现有假设，我会怎么做？\"写下答案，你会发现很多方向。",
      },
      {
        chapterNo: 2, title: "主静立人极",
        originalText: "《太极图说》续云：\"圣人定之以中正仁义而主静，立人极焉。\n\n故圣人与天地合其德，日月合其明，四时合其序，鬼神合其吉凶。\n\n君子修之吉，小人悖之凶。\n\n故曰：立天之道，曰阴与阳；立地之道，曰柔与刚；立人之道，曰仁与义。\n\n又曰：原始反终，故知死生之说。大哉易也，斯其至矣！\"",
        commentary: "\"主静立人极\"五字是宋明理学的工夫论基石。\"主静\"不是不动，是\"动而能静，静以主动\"。这对现代企业家是最珍贵的修养心法：你每天开会、决策、签字、应酬 — 动得够多了，但动的核心是\"静\"。静不好，动就乱了。",
        practiceHint: "每天留出 15 分钟\"主静\"时间：关灯、闭眼、不做任何事。不是冥想，只是\"什么也不做\"。坚持 30 天，你会发现决策质量显著提升。",
      },
    ],
  },
  {
    slug: "er-cheng-yishu", title: "二程遗书", titleEn: "The Cheng Brothers' Recorded Sayings",
    author: "程颢、程颐", era: "北宋(11 世纪)",
    ring: 3, categorySlug: "confucianism",
    summary: "北宋理学双璧程颢（1032-1085）、程颐（1033-1107）的语录汇编。二程是宋明理学真正的奠基人 — 提出\"天理\"、\"格物致知\"、\"居敬穷理\"，为朱熹集大成做好铺垫。",
    significance: "二程对\"天理\"的发现是宋明理学最重要的突破 — 他们说：\"吾学虽有所受，天理二字却是自家体贴出来的。\" 这个\"天理\"概念塑造了此后 900 年的东亚思想。",
    difficulty: 4, oxStageMin: 4, oxStageMax: 10, readingMins: 35,
    tags: ["二程", "天理", "格物", "居敬"], sortOrder: 63,
    relatedSlugs: ["jinsi-lu", "taiji-tushuo"],
    chapters: [
      {
        chapterNo: 1, title: "天理 — 自家体贴出来",
        originalText: "《二程遗书》：\"吾学虽有所受，天理二字却是自家体贴出来的。\"（程颢）\n\n\"性即理也。所谓理，性是也。天下之理，原其所自，未有不善。喜怒哀乐未发，何尝不善？发而中节，则无往而不善。发不中节，然后为不善。\"（程颐）\n\n\"仁者以天地万物为一体，莫非己也。认得为己，何所不至？若不有诸己，自不与己相干。如手足不仁，气已不贯，皆不属己。\"（程颢《识仁篇》）",
        commentary: "\"天理自家体贴出来\"这一句话展现了宋明理学的独特精神 — 道理不是从书上抄来的，是用生命去\"体贴\"出来的。\"体贴\"二字极美 — 像用手抚摸一块玉，用心去感受它的纹理。对企业家启示：真正的智慧不是读管理书读来的，是从每一次决策、每一次失败、每一次人际互动中\"体贴\"出来的。",
        practiceHint: "选一个你读过但从未真正体贴过的道理（比如\"要诚实\"），花一周时间在每一个相关情境中刻意体贴它。一周后你对这个道理的理解会完全不同。",
      },
      {
        chapterNo: 2, title: "居敬穷理 — 内外兼修",
        originalText: "程颐云：\"涵养须用敬，进学则在致知。\"\n\n\"主一之谓敬，无适之谓一。\" — 敬就是心中专一于一件事，不分散。\n\n\"今人为学，如登山麓。方其迤逦之时，莫不阔步，及到峻处便逡巡。\" — 学问如登山，平路大家都会走，到险处就退缩。真正的进步在险处。\n\n\"格物穷理，非是要尽穷天下之物，但于一事上穷尽，其他可以类推。\" — 不必穷究天下万事，把一件事穷到底，其他自然触类旁通。",
        commentary: "程颐这段话是整个宋明理学\"工夫论\"的精华：\"居敬\"（涵养心性）+ \"穷理\"（深入学问），缺一不可。特别是\"把一事穷到底\"的教导对现代人太重要了 — 我们都在浅尝辄止，样样会但样样不精。",
        practiceHint: "选一件你正在做的事（专业技能/一本书/一个项目），承诺\"把这一件穷到底\"。不求快，不求多，只求深。一年后你会发现这个领域被你彻底打通。",
      },
    ],
  },
  {
    slug: "eckhart-sermons", title: "埃克哈特讲道集", titleEn: "Meister Eckhart Sermons",
    author: "迈斯特·埃克哈特", era: "14 世纪(1260-1328)",
    ring: 3, categorySlug: "christianity",
    summary: "德国中世纪最伟大的神秘主义者迈斯特·埃克哈特的德语与拉丁语讲道集。以\"神性之基\"（Gottheit）、\"灵魂之花\"（Seelengrund）、\"超越\"（Gelassenheit）等概念，展现了基督教神秘主义的最高境界。",
    significance: "埃克哈特的思想对后世神秘主义者（陶勒、吕斯布鲁克）、宗教改革、德国观念论（黑格尔、谢林）、甚至东亚禅学（铃木大拙称其思想与禅相通）都有深远影响。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 35,
    tags: ["埃克哈特", "神秘主义", "Gelassenheit"], sortOrder: 64,
    relatedSlugs: ["cloud-of-unknowing", "interior-castle", "confessions-augustine"],
    chapters: [
      {
        chapterNo: 1, title: "神性之基 — 神之上的神",
        originalText: "埃克哈特讲道第 52 篇：\"我为此祈祷：让神空掉我身上的\"神\"，因为我的本质远在神之上 — 在那里，神和被造物都不存在。\n\n那个让我成为人的，是神；那个让神成为神的，是神性之基（Gottheit）。在神性之基中，没有神，也没有我。\n\n灵魂最深处 — 我称之为\"灵魂之火花\"（Seelenfünklein）或\"灵魂之基\"— 与神性之基本是一物。\n\n在那里，神诞生在我心中，我也诞生在神心中。这不是比喻，是最真实的实在。\"",
        commentary: "这段话如此激进，以至于天主教会一度将埃克哈特的部分思想列为异端。但他说的其实是：你与终极实在的关系不是\"你崇拜他\"，而是\"你与他是一\"—— 这与印度\"梵我一如\"、禅宗\"明心见性\"完全相通。对企业家：你追求的\"最高成功\"就在你内心最深处 — 不必外求。",
        practiceHint: "做一个\"灵魂之基\"练习：闭眼沉入自己最深处，不要想任何东西，只是\"在\"。5 分钟后，尝试感受\"那个最深的我\"与\"宇宙最深的本源\"之间是否有边界。",
      },
      {
        chapterNo: 2, title: "Gelassenheit — 放任自然",
        originalText: "埃克哈特提出\"Gelassenheit\"（放任自然）：\"要爱神，你必须先放下所有你以为\"自己的\"东西 — 包括你的善行、你的祈祷、甚至你对神的爱。\n\n真正的圣人不是\"多做了什么\"，而是\"没做什么\"。不做任何干扰 — 让神的意志自然流过你。\n\n你祈求得到什么，你反而得不到；你什么都不求，反而一切都给你。\n\n这不是消极。这是最深的积极 — 让真正的主宰者主宰。\"",
        commentary: "埃克哈特的\"放任自然\"（Gelassenheit）概念被 20 世纪哲学家海德格尔重新发掘，成为现代哲学的重要概念。它与道家的\"无为而无不为\"、禅宗的\"只管打坐\"完全相通。对企业家：不是你要拼命抓住什么，而是\"让该来的来，让该走的走\"。这不是放弃，是更深的掌握。",
        practiceHint: "选一件你抓得最紧的事（一个机会/一段关系/一个结果），今天试着\"放手\"24 小时 — 不是放弃，只是不强求。观察它在 24 小时内会怎么变化。你会惊讶。",
      },
    ],
  },
  {
    slug: "theresa-avila-life", title: "大德兰自传", titleEn: "The Life of Teresa of Avila",
    author: "阿维拉的大德兰", era: "16 世纪(1562-1565)",
    ring: 3, categorySlug: "christianity",
    summary: "西班牙神秘主义者阿维拉的大德兰（1515-1582）的自传，记录她从世俗少女到神秘修道院长的灵魂旅程。是天主教神秘主义最动人的第一人称叙述之一。",
    significance: "大德兰是第一位被封为\"教会博士\"的女性，与十字若望并称天主教神秘主义双璧。她的\"四阶祈祷\"（默想、宁静、合一、狂喜）对现代灵修学仍是重要范式。",
    difficulty: 3, oxStageMin: 3, oxStageMax: 10, readingMins: 30,
    tags: ["大德兰", "神秘", "自传", "祈祷"], sortOrder: 65,
    relatedSlugs: ["interior-castle", "dark-night-soul"],
    chapters: [
      {
        chapterNo: 1, title: "四阶祈祷 — 灵魂之园",
        originalText: "《大德兰自传》第 11-22 章论\"灵魂之园的四种灌溉\"：\"灵魂如花园，需要水才能盛开。浇水有四种方式，从最辛苦到最省力：\n\n第一种 — 提水桶从井里打水（默想祈祷）：最辛苦，依靠自己的努力。\n第二种 — 用水车从水池引水（宁静祈祷）：省力些，但仍需转动。\n第三种 — 引溪流灌溉（合一祈祷）：几乎不费力，水自然流来。\n第四种 — 大雨从天而降（狂喜祈祷）：完全不用人力，恩典自上而下。\n\n初学者不要急于求第四种，从第一种开始 — 老老实实打水，神会在合适的时候给你大雨。\"",
        commentary: "大德兰的\"四阶祈祷\"是整个基督教灵修学最清晰的阶梯，与佛教\"初禅-二禅-三禅-四禅\"遥相呼应。关键是她的告诫：\"不要急于求最高的境界\"。这对现代急功近利的修行者太重要了 — 你想跳过打水直接要大雨，结果什么都得不到。",
        practiceHint: "诚实评估你当下在哪一阶：打水（还需要自己努力）？水车（偶尔省力）？溪流（自然而然）？大雨（完全是恩典）？大部分人都在前两阶 — 这很正常，接受并老实努力。",
      },
      {
        chapterNo: 2, title: "谦卑是一切的根基",
        originalText: "《大德兰自传》论谦卑：\"谦卑不是低估自己，而是如实知道自己。\n\n真正的谦卑者知道：我身上的一切好，都是神白白赐予的；我身上的一切坏，是我自己的。\n\n因此真谦卑的人一方面毫无自卑 — 因为他知道自己被神深深地爱；另一方面毫不自夸 — 因为他知道所有好都不是自己挣来的。\n\n假谦卑是：故意说自己不好，希望别人反驳。\n真谦卑是：知道自己不好，不在乎别人知不知道。\"",
        commentary: "\"真谦卑不是低估自己，而是如实知道自己\" — 这是对\"谦卑\"最清晰的定义。它破除了两种假谦卑：一种是自卑，一种是装谦卑求表扬。对企业家：真正的谦卑是\"我很清楚我的能力边界，也很清楚我的优势\" — 这种清醒本身就是力量。",
        practiceHint: "写下三条\"我真的擅长的事\"和三条\"我真的不擅长的事\"。诚实面对。如果你只能写前者（不够谦卑）或只能写后者（自卑），两者都不是真谦卑。",
      },
    ],
  },
  {
    slug: "devi-mahatmya", title: "女神赞歌(Devi Mahatmya)", titleEn: "Devi Mahatmya",
    author: "作者不详", era: "约 5-6 世纪",
    ring: 3, categorySlug: "hinduism",
    summary: "印度教最重要的女神经典，共 700 节诗偈，所以又名\"七百颂\"（Saptashati）。讲述至上女神杜尔迦（Durga）击败三大魔王的神话，是 Shakta 派（女神崇拜）的核心经文。",
    significance: "《女神赞歌》代表了印度教对神圣女性力量（Shakti）的崇拜，是世界宗教中最尊崇\"神的阴性面\"的文献之一。每年杜尔迦节（Durga Puja），全印度会诵读此经。",
    difficulty: 3, oxStageMin: 3, oxStageMax: 9, readingMins: 25,
    tags: ["杜尔迦", "女神", "Shakti", "Shakta"], sortOrder: 66,
    relatedSlugs: ["bhagavad-gita", "upanishad"],
    chapters: [
      {
        chapterNo: 1, title: "Mahamaya — 宇宙之母的幻化力",
        originalText: "《女神赞歌》第一章云：\"女神 Mahamaya（大幻化者）是所有被造物的母亲。\n\n她创造了整个宇宙的\"幻\"（Maya） — 不是虚假，而是神圣的游戏。\n\n没有她的允许，连天神都不能动一根手指；没有她的帮助，连最伟大的圣人都无法解脱。\n\n她既是束缚你的力量，也是解放你的力量。束缚与解放，都是她的慈悲。\n\n向她致敬，就是向所有女性致敬；伤害女性，就是伤害她本身。\"",
        commentary: "印度教的独特在于：至上神有男有女，而且女性能量（Shakti）有时被认为比男性更根本 — 因为\"没有能量（Shakti），连湿婆也是尸体\"。这对全球商业界仍普遍男权的现实是深刻的提醒：真正伟大的企业都尊重\"女性力量\"（包容、连接、养育、直觉）— 不只是雇佣女性，而是让这些品质成为组织文化的一部分。",
        practiceHint: "检查你的组织/团队：那些\"女性力量\"品质（耐心、倾听、共情、连接）是否被同等尊重？还是只有\"男性力量\"（决断、竞争、扩张）被推崇？下周刻意表彰一次某人的\"女性力量\"行为。",
      },
      {
        chapterNo: 2, title: "杜尔迦 — 不可战胜者",
        originalText: "《女神赞歌》第 4 章记杜尔迦击败水牛魔王 Mahishasura：\"魔王长久以来无人能敌，所有天神都无法对付他。\n\n于是所有天神的愤怒集合成一团火焰，这团火焰凝聚成杜尔迦女神 — 她有十只手臂，每只手握着不同的武器，骑着狮子。\n\n魔王嘲笑她：\"一个女人，能对抗我吗？\"\n\n战斗持续 9 日 9 夜。每当魔王变成新的形相，杜尔迦都直接应对。最终她斩下魔王的头。\n\n这个故事告诉世人：不可战胜的不是某一种力量，而是\"各种力量在需要时的和合\"。\"",
        commentary: "杜尔迦的\"十只手\"象征\"所有力量的和合\"。对企业家启示深刻：面对复杂危机时，不要只依赖你最擅长的一种能力，而要把所有资源（金钱/关系/技术/情感）同时调动。真正不可战胜的不是某一种强项，而是\"全力以赴\"的整合。",
        practiceHint: "想一个你当下面临的大挑战。列出你拥有的\"十只手臂\"（十种资源/能力/关系）。下周不要只用 2-3 只手，而是同时动用全部 10 只。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.14 经论++ v14 精修第四轮 — 10 部主流传统深化');

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
  console.log(`\n📜 M38.14 精修第四轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
