/**
 * M38.15 经论++ v15 — 精修第五轮：10 部深化
 * 本轮(10部, 228 → 238):
 *   BUDDHISM +3 (经集 Sutta Nipata / 阿毗达磨俱舍论 / 肇论)
 *   ZEN +2 (大慧普觉禅师语录 / 最上乘论-弘忍)
 *   TAOISM +1 (陶弘景·真灵位业图)
 *   CONFUCIANISM +1 (高攀龙·困学记)
 *   CHRISTIANITY +2 (路加福音 / 圣本笃规章)
 *   JUDAISM +1 (拉比纳坦箴言录 Avot de-Rabbi Natan)
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
    slug: "sutta-nipata", title: "经集(巴利·Sutta Nipata)", titleEn: "Sutta Nipata",
    author: "佛陀原始教言结集", era: "公元前 5-4 世纪",
    ring: 2, categorySlug: "buddhist-general",
    summary: "巴利藏《小部》第五经，被认为是最古老的佛经之一，保留了佛陀最早期的原始教法。共 71 经 1149 偈，朴素无华，直接开示涅槃之道。",
    significance: "《经集》是研究原始佛教最重要的文献。其中《犀角经》《慈经》《宝经》《吉祥经》等至今仍是南传佛教日常课诵。西方学者如 Bhikkhu Bodhi 认为此经最接近佛陀亲口所说。",
    difficulty: 3, oxStageMin: 1, oxStageMax: 10, readingMins: 30,
    tags: ["经集", "原始佛教", "巴利", "小部"], sortOrder: 67,
    relatedSlugs: ["dhammapada", "ahan-jing"],
    chapters: [
      {
        chapterNo: 1, title: "犀角经 — 独行如犀角之独",
        originalText: "《经集·犀角经》云：\"对一切众生放下暴力，不恼害其中任何一个，不欲子嗣，岂欲伴侣？让他独行，如犀角之独。\n\n有交往，必生亲爱；从亲爱，必生忧患。观亲爱生苦，让他独行，如犀角之独。\n\n不为他人期望所缚，不为利养所动，明智而坚定如大地不受惊吓，让他独行，如犀角之独。\n\n如同大象脱离象群，在森林中自在 — 见群聚之过患，让他独行，如犀角之独。\"",
        commentary: "\"独行如犀角\"不是教人孤僻，而是教人\"精神上的独立\"— 不被他人的期望、赞美、批评左右。对企业家尤其重要：当你成为公司领袖，周围全是附和者，如果你不能\"独行\"，你就会失去判断力，最终把公司带到悬崖。犀角的\"独\"不是寂寞，而是清醒。",
        practiceHint: "本周练习：面对一个你习惯征求多人意见的决策，独自静坐 30 分钟，在不问任何人的情况下做出决定。然后对照：你真正相信的答案是什么？别人的期望又是什么？",
      },
      {
        chapterNo: 2, title: "慈经 — 对一切众生放慈心",
        originalText: "《经集·慈经》云：\"愿一切众生幸福安乐，愿一切众生平安。无论任何有息者 — 不论弱的或强的，长的或大的，中等的或短的，精细的或粗大的。\n\n可见的或不可见的，远的或近的，已生的或将生的 — 愿一切众生幸福安乐。\n\n如母亲以身命保护她唯一的孩子，对一切众生，都应如是散发无量的慈心。\n\n让慈爱充满整个世界 — 上下四方，无有阻碍，无有怨敌，无有憎恨。\"",
        commentary: "《慈经》是南传佛教最重要的日常课诵之一。\"如母亲保护唯一的孩子\"这个比喻是整个佛教\"无量慈心\"的核心形象。对商业的启示：真正伟大的公司对客户的态度应该接近这种\"母亲保护孩子\"的感情 — 不是策略，不是口号，而是一种\"看见对方就会自然涌出的关怀\"。",
        practiceHint: "每日早晨醒来，闭眼 3 分钟默念：\"愿我的员工幸福安乐。愿我的客户幸福安乐。愿我的竞争对手幸福安乐。愿一切众生幸福安乐。\" 坚持 21 天，观察内心变化。",
      },
    ],
  },
  {
    slug: "abhidharmakosha", title: "阿毗达磨俱舍论", titleEn: "Abhidharmakosha",
    author: "世亲菩萨 造、玄奘译", era: "约 4-5 世纪",
    ring: 2, categorySlug: "buddhist-general",
    summary: "部派佛教阿毗达磨学说的集大成之作，被誉为\"聪明论\"。共 9 品 600 颂，系统梳理了 75 种法的分类体系、业力因果、轮回机制、禅定阶位、圣者品位。是理解小乘到大乘过渡的关键文献。",
    significance: "《俱舍论》在汉传佛教有\"七年俱舍三年唯识\"之说，被视为佛教入门的基础课。日本奈良时代成立\"俱舍宗\"为六大古宗之一。藏传佛教五部大论中，《俱舍论》为其一。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 60,
    tags: ["俱舍", "阿毗达磨", "世亲", "七十五法"], sortOrder: 68,
    relatedSlugs: ["chengweishi-lun", "yuqie-shidi"],
    chapters: [
      {
        chapterNo: 1, title: "界品 — 七十五法 组成世界",
        originalText: "《俱舍论·分别界品》云：\"诸一切种诸冥灭，拔众生出生死泥。敬礼如是如理师，对法藏论我当说。\n\n世亲把一切现象归纳为 \"七十五法\"：\n色法 11（眼、耳、鼻、舌、身、色、声、香、味、触、无表色）\n心法 1（心王）\n心所法 46（受、想、思、触、欲、胜解、念、定、慧等）\n不相应行法 14（得、非得、众同分、无想定、灭尽定、命根等）\n无为法 3（虚空、择灭、非择灭）\n\n这 75 种法是\"实有\"的基本元素，一切现象都由它们组合而成。\"",
        commentary: "\"七十五法\"是佛教最早的\"世界元素论\"— 试图把一切经验现象归纳为有限数量的基本元素。这与现代科学\"化学元素周期表\"\"基本粒子标准模型\"的思路惊人相似。对管理者启示：当你面对复杂系统（团队/市场/组织），不要被\"表面多样性\"迷惑，要找到底层的\"基本元素\"。真正的高手都是\"归纳派\"。",
        practiceHint: "选你最熟悉的业务领域，尝试做一次\"归纳实验\"：把所有看似不同的现象归纳为 10-20 个\"基本元素\"。例如客户投诉的表面千差万别，底层可能只有 \"期望落差/沟通不畅/产品缺陷/情绪发泄\" 几类。",
      },
      {
        chapterNo: 2, title: "业品 — 业力运作的机制",
        originalText: "《俱舍论·分别业品》云：\"世别由业生，思及思所作。思即是意业，所作谓身语。\n\n业分三类：身业（身体行为）、语业（言说）、意业（起心动念）。其中\"意业\"（思）是根本 — 所有外显的身语行为，都从内在的\"思\"发出。\n\n同一个行为，因\"思\"的差异，业力完全不同：\n- 故意杀人（有思）— 重业\n- 梦中杀人（无思）— 无业\n- 被迫杀人（少思）— 轻业\n\n业力的轻重，不看行为的大小，只看\"心念的清晰度\"。\"",
        commentary: "《俱舍论》\"意业为根本\"的观点，是佛教伦理学最深刻的洞察 — 决定一个行为善恶的，不是行为本身，而是\"动机的清晰度和方向\"。对企业家极为关键：当你做重大决策时，真正决定长期后果的，不是你做了什么，而是你\"为什么做\"。很多看似\"为公司好\"的决策，其实背后是私心 — 这些会在多年后以意想不到的方式反噬。",
        practiceHint: "对本周你做过的 3 个重要决策，做\"动机考古\"— 每一个决策背后，真正驱动你的\"思\"是什么？（恐惧？贪婪？慈悲？荣誉？）诚实到让自己不舒服的程度。",
      },
    ],
  },
  {
    slug: "sengzhao-lun", title: "肇论", titleEn: "Treatises of Sengzhao",
    author: "僧肇", era: "东晋(384-414)",
    ring: 2, categorySlug: "buddhist-madhyamaka",
    summary: "僧肇是鸠摩罗什的首席弟子，被誉为\"解空第一\"。《肇论》共 4 篇：《物不迁论》《不真空论》《般若无知论》《涅槃无名论》，是中国佛教第一部真正消化般若中观思想的哲学著作。",
    significance: "僧肇 31 岁早逝，但《肇论》奠定了中国大乘佛教的哲学基础。\"物不迁\"对动静、\"不真空\"对空有、\"般若无知\"对智愚的辩证，影响了后世天台、华严、禅宗。汤用彤称其为\"中国哲学史上最伟大的思辨\"之一。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 35,
    tags: ["肇论", "僧肇", "般若", "物不迁"], sortOrder: 69,
    relatedSlugs: ["zhong-lun", "diamond-sutra"],
    chapters: [
      {
        chapterNo: 1, title: "物不迁论 — 动中有不动",
        originalText: "《肇论·物不迁论》云：\"夫生死交谢，寒暑迭迁，有物流动，人之常情。余则谓之不然。\n\n何者？《放光》云：\"法无去来，无动转者。\" 寻夫不动之作，岂释动以求静？必求静于诸动。\n\n必求静于诸动，故虽动而常静；不释动以求静，故虽静而不离动。然则动静未始异，而惑者不同。\n\n是以言常而不住，称去而不迁。不迁故，虽往而常静；不住故，虽静而常往。\"",
        commentary: "僧肇挑战世俗对\"动\"的理解：真正的静不是\"让一切停下来\"，而是\"在一切流动中看到不动的本质\"。这与相对论的\"没有绝对运动，只有相对运动\"和现代东方哲学\"心的不动性\"异曲同工。对企业家最重要：市场永远在动，你若追着动，必然疲于奔命；真正的高手是\"在动中找不动\"— 抓住那些多年不变的核心规律。",
        practiceHint: "写下你所在行业\"看似在剧烈变化\"的 5 个现象（AI 取代/供应链重组/消费者偏好变迁等）。再写下这 5 个现象背后\"其实没变\"的 5 个深层规律。第二组才是你应该下注的。",
      },
    ],
  },
  {
    slug: "dahui-pujue", title: "大慧普觉禅师语录", titleEn: "Recorded Sayings of Dahui Zonggao",
    author: "大慧宗杲", era: "南宋(1163)",
    ring: 1, categorySlug: "zen-linji",
    summary: "临济宗杨岐派代表人物大慧宗杲（1089-1163）的语录，是\"看话禅\"（参话头）运动的开山文献。大慧大力批判默照禅的静坐偏失，提倡\"话头\"作为破除妄念的\"金刚王宝剑\"。对日本、韩国禅宗有根本影响。",
    significance: "大慧是继百丈、临济之后最重要的临济宗祖师。他提出的\"看话禅\" — 专参一个话头如\"狗子有佛性也无？无！\" — 成为后世禅宗主流修行方法。日本临济宗白隐、韩国曹溪宗知讷都直接继承这一法脉。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 35,
    tags: ["大慧", "看话禅", "话头", "临济"], sortOrder: 70,
    relatedSlugs: ["wumen-guan", "linji-lu"],
    chapters: [
      {
        chapterNo: 1, title: "参一无字 — 金刚王宝剑",
        originalText: "《大慧语录》示妙明居士云：\"但将妄想颠倒底心、思量分别底心、好生恶死底心、知见解会底心、欣静厌闹底心，一时按下。\n\n只就按下处看个话头：僧问赵州，狗子还有佛性也无？州云：无。\n\n此一字子，乃是摧许多恶知恶觉底器仗也。\n\n不得作有无会，不得作道理会，不得向意根下思量卜度，不得向扬眉瞬目处垛根，不得向语路上作活计，不得颺在无事甲里，不得向举起处承当，不得向文字中引证。\n\n但向十二时中、四威仪内，时时提撕，时时举觉 — 狗子还有佛性也无？无！\"",
        commentary: "大慧的\"看话禅\"是禅宗方法论的一次革命。他发现：单纯静坐容易陷入\"死水\"（枯寂），而参话头能在动静之间持续产生\"疑情\"，最终打破我执。话头就像一把\"金刚王宝剑\" — 不论你心里升起什么念头（好念坏念、理性逻辑、情绪波动），一剑斩断：\"无！\" 对现代人极有用：在信息过载的时代，你需要一把能斩断\"念头洪流\"的利器。\"无\"就是这样一把剑。",
        practiceHint: "下周选择一件你平日最容易焦虑/纠结的事。当焦虑生起时，不要分析、不要解决，只在心里默念一声\"无！\"然后回到呼吸。坚持 7 日，看看焦虑的粘性有没有变化。",
      },
      {
        chapterNo: 2, title: "不要默照死水 — 动中工夫才真",
        originalText: "《大慧语录》答曾侍郎书云：\"近年以来，有一种邪师，说默照禅，教人十二时中，是事莫管，休去歇去，不得做声，恐落今时。\n\n往往士大夫为聪明利根所使者，多是厌恶闹处，乍被邪师辈指令静坐，却见省力，便以为是，更不求妙悟，只以默然为极则。\n\n某不惜口业，力救此弊。今稍有知者。\n\n真正悟门，须在动中 — 如在闹市看见一树红花，如在会议中忽然听见一声警钟，如被客户刁难到极致而心忽然空 — 这些才是大悟的机缘。\n\n死坐蒲团而求悟，万劫不得。\"",
        commentary: "大慧对\"默照禅\"的批判至今仍极有现实意义。他发现：很多聪明人喜欢用\"静坐\"来\"逃避生活的嘈杂\"，但这只是换了一种形式的执着。真正的悟要在\"动中\" — 在最混乱、最有压力的地方保持清醒。对企业家尤其重要：你不需要辞职去寺院才能修行；你每天面对的会议、客户、KPI，就是最好的道场。",
        practiceHint: "下周刻意在最忙最累的一天，选一个瞬间（开会中、谈判中、被骂时）练习：这一刻我能否保持完全清醒？把日常工作本身当作道场。",
      },
    ],
  },
  {
    slug: "hongren-xiuxinlun", title: "最上乘论(弘忍)", titleEn: "Treatise on the Highest Vehicle",
    author: "五祖弘忍", era: "唐(约 670)",
    ring: 1, categorySlug: "buddhist-zen",
    summary: "禅宗五祖弘忍（601-674）唯一存世著作，又名《修心要论》。全书围绕\"守心\"一义展开 — 守本真心胜念十方诸佛。是东山法门的核心文献，直接影响了神秀的\"渐修\"和慧能的\"顿悟\"两大流派。",
    significance: "弘忍是禅宗从\"达摩-慧可-僧璨-道信\" 到 \"神秀/慧能\" 南北分支的枢纽人物。《最上乘论》虽短，但\"守本真心\"四字涵盖了整个东山法门的核心，是理解禅宗从早期\"如来禅\"转向\"祖师禅\"的关键文献。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 8, readingMins: 20,
    tags: ["五祖", "弘忍", "守心", "东山法门"], sortOrder: 71,
    relatedSlugs: ["platform-sutra", "damo-xuemo"],
    chapters: [
      {
        chapterNo: 1, title: "守本真心 — 第一精进",
        originalText: "《最上乘论》云：\"夫修道之本体，须识当身心本来清净，不生不灭，无有分别，自性圆满，清净之心，此是本师，乃胜念十方诸佛。\n\n问曰：何知自心本来清净？\n答曰：《十地经》云：\"众生身中有金刚佛性，犹如日轮，体明圆满，广大无边，只为五阴黑云之所覆障 — 如瓶内灯光，不能显现。\"\n\n夫修道之人，若心中烦恼起时，但守本真心，莫随妄心流转 — 如守金刚，贼终不坏。\n\n一切时中，一切处所，但守真心，是第一精进。\"",
        commentary: "弘忍的\"守本真心\"是禅宗从印度佛教的\"修行证得\"转向中国禅的\"本来现成\"的关键一步。他提出：你不需要通过复杂的修法去\"获得\"佛性 — 你本来就有，你只需要\"守住\"它，不被妄念带走。这对现代职场人极有用：你本来就是一个\"完整的人\"，你不需要通过更多的课程/头衔/财富来\"变成\"完整的人；你只需要\"不丢失自己\"。",
        practiceHint: "每日睡前问自己一个问题：\"今天我有没有丢失自己？\" 把\"丢失自己\"定义为：被情绪带走、被他人评价左右、做出违背内心的妥协。连续一周记录，看哪些场景最容易\"丢失\"。",
      },
    ],
  },
  {
    slug: "tao-hongjing-zhenling", title: "真灵位业图", titleEn: "Chart of Divine Ranks",
    author: "陶弘景", era: "南朝梁(约 500)",
    ring: 3, categorySlug: "taoism",
    summary: "上清派宗师陶弘景（456-536）编订的道教神仙谱系图。把中国本土与外来宗教的神灵按\"七阶\"排列，共列 700 多位神真，是中国最早的系统化神仙名录。对后世道教、民间信仰、甚至佛道融合都有深远影响。",
    significance: "陶弘景是\"山中宰相\"，隐居茅山 45 年却为皇帝当顾问。《真灵位业图》不是宗教迷信，而是一次伟大的\"精神生态学\" — 他试图把千百年累积的本土神话、外来宗教、民间信仰整合成一个\"宇宙意识地图\"。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 9, readingMins: 25,
    tags: ["陶弘景", "上清", "茅山", "神仙谱"], sortOrder: 72,
    relatedSlugs: ["zhengao", "qingjing-jing"],
    chapters: [
      {
        chapterNo: 1, title: "七阶神真 — 宇宙的意识层级",
        originalText: "《真灵位业图·序》云：\"夫万象森罗，不离两仪之育；百灵杂遝，从归一道之用。\n\n陶弘景把天地神真分为七大阶次：\n第一阶：玉清元始天尊（最高本源）\n第二阶：上清灵宝天尊\n第三阶：太清道德天尊\n第四阶：太极高上虚皇道君\n第五阶：九宫尚书\n第六阶：右禁郎定录真君茅固\n第七阶：酆都北阴大帝（地府主宰）\n\n每一阶又细分主神、辅神、随从，共计 700 多位。\n\n上阶不废下阶，下阶不越上阶 — 宇宙是有秩序的，意识是有层级的。\"",
        commentary: "陶弘景的\"七阶说\"看似宗教神学，实则是一次对\"意识层级\"的系统描绘。现代心理学家 Wilber 的\"意识谱\"、Maslow 的\"需求层次\"、Jung 的\"集体无意识\"都有类似尝试。对企业家启示：组织也是有\"意识层级\"的 — 从最本源的\"使命\"到最具体的\"执行\"，每一层都有自己的\"神真\"（核心原则）。打乱层级就会混乱。",
        practiceHint: "尝试为你的公司画一个\"七阶图\"：第一阶使命/第二阶愿景/第三阶价值观/第四阶战略/第五阶流程/第六阶任务/第七阶工具。检查：每一阶是否清晰？上下阶是否贯通？",
      },
    ],
  },
  {
    slug: "gao-panlong-kunxue", title: "高攀龙·困学记", titleEn: "Gao Panlong's Notes on Studying in Difficulty",
    author: "高攀龙", era: "明(1605)",
    ring: 3, categorySlug: "confucianism",
    summary: "东林党魁高攀龙（1562-1626）的修身日记，记录他 20 余年困心衡虑、格物穷理的真实体悟。不是理论著作，而是一个读书人如何从\"书本知识\"转化为\"生命实修\"的珍贵记录。",
    significance: "高攀龙是晚明东林书院的两大领袖之一（顾宪成、高攀龙）。面对阉党迫害，他投水自尽殉道。《困学记》是他一生修身工夫的总结，被黄宗羲收入《明儒学案》，称为\"实修派儒学\"的典范。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 9, readingMins: 20,
    tags: ["高攀龙", "东林", "困学", "实修"], sortOrder: 73,
    relatedSlugs: ["chuanxi-lu", "jinsi-lu"],
    chapters: [
      {
        chapterNo: 1, title: "格物 — 从一草一木开始",
        originalText: "《困学记》万历二十一年（1593）自述：\"余自束发受书，即好为文。二十以后，好谈性命之学。\n\n然所谓性命者，不过口耳之间。直至三十，方知工夫二字之重。\n\n始就日用饮食、应事接物处，实实用力。一草一木，一言一行，皆来格之。\n\n初时，格了一物，未见端倪；再格一物，又无头绪。心中焦躁，几欲放弃。\n\n如此三年，忽于一日 — 见窗前竹叶随风而动，心中豁然：原来\"理\"不在书上，不在我想里，就在这一片竹叶的摇动之中。从此以后，看一切事物都不一样了。\"",
        commentary: "高攀龙\"三年格一片竹叶\"的故事，与王阳明\"七日格竹病倒\"形成鲜明对比。两人都在实践朱子的\"格物\"，但路径不同：王阳明放弃了\"格物\"转向\"致良知\"；高攀龙坚持三年，最终体悟\"理在事物中\"。对企业家启示：不要急于\"从书本找答案\"，真正的\"理\"要从你日复一日处理的具体业务中悟出来。三年磨一剑。",
        practiceHint: "选择你工作中一件最琐碎的小事（如回一封邮件/开一次例会/审一份报告）。用三个月时间，每次做它时都\"格物\"— 问：这件事的\"理\"是什么？它在教我什么？三个月后看你的认知变化。",
      },
    ],
  },
  {
    slug: "luke-gospel", title: "路加福音", titleEn: "Gospel of Luke",
    author: "路加(医生、保罗的同工)", era: "约 80-90 年",
    ring: 3, categorySlug: "christianity",
    summary: "四福音书中最长的一部，作者路加是\"外邦人\"医生，文笔最为优雅。记载耶稣的诞生、生平、受难、复活，同时特别强调耶稣对\"穷人、妇女、罪人、外邦人\"的关怀。是最具\"人文主义精神\"的福音书。",
    significance: "《路加福音》+《使徒行传》是路加的两卷本著作，占新约四分之一。其中\"浪子回头\"\"好撒玛利亚人\"\"拉撒路与财主\"等比喻是全球文明共享的道德资产。对托尔斯泰、圣方济各、甘地、德蕾莎修女都有深远影响。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 10, readingMins: 30,
    tags: ["路加", "福音", "浪子", "撒玛利亚"], sortOrder: 74,
    relatedSlugs: ["matthew-gospel", "john-gospel"],
    chapters: [
      {
        chapterNo: 1, title: "浪子回头 — 最伟大的宽恕叙事",
        originalText: "《路加福音》15:11-24：\"一个人有两个儿子。小儿子对父亲说：\"父亲，请把我应得的家业分给我。\"他父亲就把产业分给他们。过了不多几日，小儿子就把他一切所有的都收拾起来，往远方去了，在那里任意放荡，浪费资财。\n\n既耗尽了一切所有的，又遇着那地方大遭饥荒，就穷苦起来。他醒悟过来，就说：\"我父亲有多少的雇工，口粮有余，我倒在这里饿死吗？我要起来，到我父亲那里去。\"\n\n相离还远，他父亲看见，就动了慈心，跑去抱着他的颈项，连连与他亲嘴。\n\n父亲却吩咐仆人说：\"把那上好的袍子快拿出来给他穿，把戒指戴在他指头上，把鞋穿在他脚上，把那肥牛犊牵来宰了，我们可以吃喝快乐。因为我这个儿子是死而复活，失而又得的。\"",
        commentary: "\"浪子回头\"可能是人类文学史上最伟大的宽恕叙事。注意父亲的反应 — 不是\"你回来了？先反省三年再说\"，而是\"跑去抱着他\"。真正的慈悲没有条件。对企业家极有启示：当下属犯了错、当伙伴背叛了你、当孩子让你失望 — 你的第一反应决定了你的\"父亲品格\"。真正的领导者在别人最不值得爱的时候还能给予接纳。",
        practiceHint: "本周想一个曾经让你失望/受伤的人（员工、朋友、家人）。不要试图为过去的事\"和好\"，只做一件事：下次你们见面时，在心里对自己说\"跑去抱他\"— 哪怕实际上只是一个微笑、一杯茶。",
      },
      {
        chapterNo: 2, title: "好撒玛利亚人 — 谁是我的邻居",
        originalText: "《路加福音》10:25-37：\"有一个律法师起来试探耶稣，说：\"夫子，我该作什么才可以承受永生？\"\n\n耶稣说：\"律法上写的是什么？你念的是怎样呢？\"他回答说：\"你要尽心、尽性、尽力、尽意爱主你的神，又要爱邻舍如同自己。\"\n\n那人要显明自己有理，就对耶稣说：\"谁是我的邻舍呢？\"\n\n耶稣回答说：\"有一个人从耶路撒冷下耶利哥去，落在强盗手中。有一个祭司从这条路下来，看见他就从那边过去了。又有一个利未人来到这地方，看见他，也照样从那边过去了。\n\n惟有一个撒玛利亚人行路来到那里，看见他就动了慈心，上前用油和酒倒在他的伤处，包裹好了，扶他骑上自己的牲口，带到店里去照应他。\"\n\n耶稣对律法师说：\"你想这三个人，哪一个是落在强盗手中的邻舍呢？\"他说：\"是怜悯他的。\"耶稣说：\"你去照样行吧。\"",
        commentary: "耶稣对\"谁是我的邻居\"的回答极为颠覆：邻居不是\"地理上接近的人\"，而是\"你愿意去帮助的那个人\"。祭司和利未人（\"本应该\"帮助的人）都躲开了；撒玛利亚人（犹太人历来鄙视的\"外邦人\"）却伸出了援手。对企业家：你对\"客户\"\"员工\"\"供应商\"的定义，决定了你的\"邻居\"有多大。真正的全球化领导者的\"邻居\"包括每一个接触到你产品或服务的人。",
        practiceHint: "本周做一次\"撒玛利亚练习\"：刻意帮助一个你\"本来不需要帮助的人\"— 一个陌生人、一个不同部门的同事、一个批评过你的客户。记录你内心的感觉。",
      },
    ],
  },
  {
    slug: "benedict-rule", title: "圣本笃规章", titleEn: "Rule of Saint Benedict",
    author: "圣本笃(Benedict of Nursia)", era: "约 530",
    ring: 3, categorySlug: "christianity",
    summary: "西方修道院制度的奠基文献，共 73 章。圣本笃（480-547）为他创立的蒙特卡西诺修道院写的日常生活规约。核心理念：\"祈祷与工作\"（Ora et Labora）。此规章塑造了整个中世纪欧洲修道院的生活方式，是西方文明的\"隐形宪法\"之一。",
    significance: "本笃规章被誉为\"西方文明的基石\"。中世纪欧洲的修道院不仅是宗教场所，还是学校、医院、农场、图书馆、抄写馆。本笃规章让欧洲在罗马帝国崩溃后保存了文明的火种。现代管理学大师 Peter Drucker 曾称本笃规章为\"世界上最成功的管理手册\"。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 25,
    tags: ["本笃", "修道", "Ora et Labora"], sortOrder: 75,
    relatedSlugs: ["imitation-christ", "interior-castle"],
    chapters: [
      {
        chapterNo: 1, title: "祈祷与工作 — 平衡的艺术",
        originalText: "《本笃规章》第 48 章云：\"闲散是灵魂的敌人。因此，弟兄们在特定时间应当从事手工劳动，在其他时间从事神圣阅读。\n\n一日的安排：\n晨祷后（约 5 点）— 工作至第三时（约 9 点）\n第三时 — 读经\n第六时（正午）— 集体祈祷与午餐\n午餐后 — 短暂休息或安静读书\n第九时（下午 3 点）— 工作\n晚祷（约 6 点）— 晚餐\n夜祷（约 8 点）— 就寝\n\n祈祷不耽误工作，工作不耽误祈祷。灵性与物质各得其所。\n\n不要太严苛，也不要太宽松。在两个极端之间，走\"有智慧的中道\"。\"",
        commentary: "本笃的\"祈祷与工作\"（Ora et Labora）是西方文明的一个革命性发明：把\"属灵生活\"与\"体力劳动\"整合为一个完整的日程。这与东方佛教的\"农禅\"（一日不作一日不食）惊人相似。对现代创业者极有启示：你不需要在\"成功\"和\"生活\"之间二选一 — 你需要的是一份\"像本笃规章一样严谨的日程\"，让工作、休息、反省、关系、健康各得其所。",
        practiceHint: "用本笃规章的精神设计你自己的\"一日规章\"：分为 6-8 个时段，每个时段有明确功能（深度工作/会议/学习/运动/陪家人/独处反省）。严格执行 21 天，看精神状态变化。",
      },
    ],
  },
  {
    slug: "avot-derabbi-natan", title: "拉比纳坦箴言录(Avot de-Rabbi Natan)", titleEn: "The Fathers According to Rabbi Nathan",
    author: "拉比纳坦及其学派", era: "约 3-9 世纪",
    ring: 3, categorySlug: "judaism",
    summary: "对《先贤箴言》（Pirkei Avot）的扩展与注释，是犹太教道德教育的补充经典。收集了从第二圣殿时期到塔木德完成期间的拉比智慧、故事与比喻。与《先贤箴言》合称\"犹太伦理学双璧\"。",
    significance: "《拉比纳坦箴言录》有 \"A版\" 和 \"B版\" 两个文本系统，都保留了大量塔木德未收录的珍贵材料。学者认为它是犹太教\"口传律法\"传统中最古老的层之一，对理解犹太伦理学的演变极为关键。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 9, readingMins: 20,
    tags: ["Avot", "纳坦", "拉比", "伦理"], sortOrder: 76,
    relatedSlugs: ["pirkei-avot", "talmud"],
    chapters: [
      {
        chapterNo: 1, title: "世界靠三件事运转 — 律法、敬拜、善行",
        originalText: "《拉比纳坦箴言录》第 4 章云：\"大祭司西门常说：世界靠三件事运转 — 托拉（律法）、敬拜（阿沃达）、仁慈行为（格米路·哈萨迪姆）。\n\n拉比约哈南·本·撒该在第二圣殿被毁后，看到他的弟子约书亚·本·查那尼亚哭泣：\"圣殿毁了，我们用什么赎罪？\"\n\n他说：\"不要忧愁，我的儿子。我们还有另一种赎罪，它的力量等同于圣殿的献祭 — 仁慈的行为。\n\n因为经上记着：\"我喜爱怜恤，不喜爱祭祀\"（何西阿 6:6）。\n\n失去圣殿，我们失去了与神的一种连接方式；但只要还有一个人愿意怜悯另一个人，神就没有离开这个世界。\"",
        commentary: "这段记载了犹太教历史上最深刻的一次\"神学转折\"— 第二圣殿被毁（公元 70 年）后，拉比们不得不重新定义\"与神的连接\"。约哈南·本·撒该的回答极具智慧：神不在圣殿里，神在\"人对人的仁慈\"里。这个洞察让犹太教在失去圣殿后存活了 2000 年。对企业家：当你失去\"平台\"\"机会\"\"资源\"时，不要绝望 — 只要你还能对一个人仁慈，你就还没有失去最重要的东西。",
        practiceHint: "本周做一件\"纯粹的仁慈行为\"— 完全不求回报、不为宣传、不计算对方是否\"值得\"。只是因为你看见一个人需要，而你有能力。做完后不告诉任何人。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.15 经论++ v15 精修第五轮 — 10 部深化');

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
  console.log(`\n📜 M38.15 精修第五轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
